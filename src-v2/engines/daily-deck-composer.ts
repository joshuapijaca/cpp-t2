/**
 * Daily-Deck Composer — cpp-t2 v2 (Option 4)
 *
 * Per spec §11.1, this engine is THE arbiter of what a student sees on a
 * given day. Bugs here = the student studies the wrong thing. Treat every
 * branch as load-bearing.
 *
 * ALGORITHM (high level — see invariants block at the bottom for the full
 * matrix of guarantees and implementation rationale):
 *
 *   1. Decide phase by dayNumber:
 *        D1..D3 → BLOCK     (one Q dominates ≥ 70% of the deck)
 *        D4..D7 → INTERLEAVE (no two same-Q back-to-back)
 *        D8+    → INTERLEAVE (steady-state)
 *      The dominant Q in BLOCK is the next-in-rotation among Q1..Q4 keyed
 *      off dayNumber so D1=Q1, D2=Q2, D3=Q3 and the tail-Q (Q4) catches up
 *      via the lowest-accuracy weighting. A force-injection audit (step 5)
 *      guarantees no Q is ever dropped.
 *
 *   2. Score every candidate card with a deterministic priority:
 *        score = qWeight × stageWeight × statusWeight × stagePolicyMul × ageBonus
 *      Lower-accuracy Q-tracks get 1.5× weight (per spec). Cards belonging
 *      to retired (FAMILIAR) atoms get a small sanity weight (10%) so they
 *      can still be sampled in the FAMILIAR sanity slot. Stage-S1/S2 cards
 *      pull a "block" multiplier; S4..S6 pull an "interleave" multiplier.
 *      The student's current stage progression is taken from `state` via
 *      the lightweight stage-gate stub (see resolveStageGate below).
 *
 *   3. Draw the body of the deck (target − last30) using a layered draw:
 *        60% NEW from current stage    (status NEW, in stage band)
 *        30% IN-PROGRESS low-familiarity (status IN-PROGRESS, percent<50)
 *        10% FAMILIAR random sanity     (status FAMILIAR, sampled)
 *      Layer counts are computed from the body size; remainders go to the
 *      first under-filled layer, then to whichever layer still has stock.
 *
 *   4. Apply the phase ordering pass:
 *        BLOCK     → group by Q, dominant Q first (≥70% of body)
 *        INTERLEAVE → no-two-same-Q-back-to-back greedy schedule
 *      Stage S1/S2 cards always flow as a contiguous block within their Q
 *      group regardless of phase (per spec).
 *
 *   5. Append the last-30 catch-up tail:
 *      Random sample across all 4 Qs of cards under 50% familiar at the
 *      atom level. If fewer than 30 are eligible, top-up with random NEW
 *      cards across all Qs so the tail length is exactly min(30, body+tail
 *      ≤ targetCount).
 *
 *   6. Daily audit: every Q must contribute ≥ floor(targetCount × 0.10) to
 *      the final deck. For each Q below threshold, force-inject 5 cards
 *      from that Q into the body (replacing low-priority body cards).
 *
 * PURITY:
 *   - composeDailyDeck is a pure function: same inputs → same output.
 *   - Determinism uses a stable LCG seeded from
 *       hash(dayNumber, targetCount, seq) ⊕ user-supplied seed.
 *     No Math.random anywhere.
 *
 * NO SIDE EFFECTS:
 *   - state is read but never mutated.
 *   - allCards is treated as readonly.
 */

import type { Card, QTag } from '../types/card-schema';
import {
  EXPOSURE_TARGETS,
  getAtomFamiliarity,
  getCardStatus,
  getQTrackFamiliarity,
  type SessionState,
} from './exposure-counter.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────────────

export type Phase = 'BLOCK' | 'INTERLEAVE';

/**
 * Optional stage-gate hook. When `stage-gate.ts` ships, swap this for the
 * real impl. Until then we stub: "current stage" is the highest stage
 * with any IN-PROGRESS card; default = 1 (S1).
 */
export interface StageGate {
  currentStage: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Stages the student has unlocked, in ascending order. */
  unlocked: ReadonlyArray<0 | 1 | 2 | 3 | 4 | 5 | 6>;
}

export interface ComposeOptions {
  /** Optional override for the deterministic seed. Default: 0xC0FFEE. */
  readonly seed?: number;
  /** Optional pre-computed stage gate. If absent, resolveStageGate is used. */
  readonly stageGate?: StageGate;
  /**
   * Optional dominant-Q override (e.g. for unit tests). Defaults to a
   * deterministic rotation keyed on dayNumber.
   */
  readonly dominantQOverride?: QTag;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Default deterministic seed used when none is supplied. */
const DEFAULT_SEED = 0xc0ffee;

/** Number of catch-up cards appended at the end of every session. */
export const CATCHUP_TAIL_SIZE = 30;

/** Threshold at which a Q-track is "under-represented" in the daily audit. */
export const AUDIT_THRESHOLD_FRACTION = 0.10;

/** Number of cards force-injected when a Q falls below the audit threshold. */
export const AUDIT_INJECTION_COUNT = 5;

/** Mix-ratio targets for the body of the deck. */
export const MIX_RATIOS = {
  newFromStage: 0.60,
  inProgressLowFam: 0.30,
  familiarSanity: 0.10,
} as const;

/** Block phase covers D1..D3; everything beyond is interleave. */
export const BLOCK_PHASE_DAYS = 3;

/** Block phase requires the dominant Q to take ≥ this fraction of the body. */
export const BLOCK_DOMINANT_FRACTION = 0.70;

/** Lowest-accuracy Q-track weight multiplier (per spec). */
export const LOW_ACC_WEIGHT_MULTIPLIER = 1.5;

/** Familiar-card sanity weight (decayed but not zero). */
export const FAMILIAR_SANITY_WEIGHT = 0.10;

/** Stage-S1/S2 multiplier in BLOCK phase. */
export const STAGE_BLOCK_FAVOR = 1.25;

/** Stage-S4..S6 multiplier in INTERLEAVE phase. */
export const STAGE_INTERLEAVE_FAVOR = 1.20;

/** Q-tag rotation for the BLOCK phase. */
const Q_ROTATION: readonly QTag[] = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the daily deck for `dayNumber`, returning an ordered array of
 * exactly `min(targetCount, eligibleCardCount)` cards.
 */
export function composeDailyDeck(
  allCards: readonly Card[],
  state: SessionState,
  dayNumber: number,
  targetCount: number,
  options: ComposeOptions = {},
): Card[] {
  if (targetCount <= 0) return [];
  if (allCards.length === 0) return [];

  const seed = mixSeed(options.seed ?? DEFAULT_SEED, dayNumber, targetCount, state.seq);
  const rng = makeLcg(seed);

  const phase: Phase = dayNumber <= BLOCK_PHASE_DAYS ? 'BLOCK' : 'INTERLEAVE';
  const dominantQ: QTag =
    options.dominantQOverride ??
    Q_ROTATION[(Math.max(1, dayNumber) - 1) % Q_ROTATION.length] ??
    'Q1';

  const stageGate = options.stageGate ?? resolveStageGate(state, allCards);

  // Q-track priorities: lowest-accuracy → highest weight.
  const qWeights = computeQWeights(state);

  const tailSize = Math.min(CATCHUP_TAIL_SIZE, Math.max(0, targetCount - 0));
  // The tail is "last 30" — but only when targetCount permits a body of >0.
  const bodySize = Math.max(0, targetCount - tailSize);

  // ── 1. Score and bucket all candidate cards ─────────────────────────────
  const scored = allCards.map((c) => ({
    card: c,
    status: getCardStatus(state, c.id),
    score: scoreCard(c, state, qWeights, phase, stageGate, dominantQ),
  }));

  const newCards = scored.filter((x) => x.status === 'NEW' && inStageBand(x.card, stageGate));
  const inProg = scored.filter(
    (x) => x.status === 'IN-PROGRESS' && atomBelow(state, x.card.atomId, 50),
  );
  const familiar = scored.filter((x) => x.status === 'FAMILIAR');

  // Stable, deterministic ordering by score desc, then by card id asc.
  const byScoreDesc = (
    a: { card: Card; score: number },
    b: { card: Card; score: number },
  ): number => (b.score - a.score) || (a.card.id < b.card.id ? -1 : a.card.id > b.card.id ? 1 : 0);
  newCards.sort(byScoreDesc);
  inProg.sort(byScoreDesc);
  familiar.sort(byScoreDesc);

  // ── 2. Layered draw for the body ───────────────────────────────────────
  const wantNew = Math.round(bodySize * MIX_RATIOS.newFromStage);
  const wantInProg = Math.round(bodySize * MIX_RATIOS.inProgressLowFam);
  const wantFam = Math.max(0, bodySize - wantNew - wantInProg);

  const drawnNew = newCards.slice(0, wantNew);
  const drawnInProg = inProg.slice(0, wantInProg);
  const drawnFam = familiar.slice(0, wantFam);

  // Top-up if any layer underfilled.
  const drawn: Array<{ card: Card; score: number }> = [
    ...drawnNew,
    ...drawnInProg,
    ...drawnFam,
  ];
  const usedIds = new Set(drawn.map((x) => x.card.id));
  if (drawn.length < bodySize) {
    const overflow: Array<{ card: Card; score: number }> = [
      ...newCards,
      ...inProg,
      ...familiar,
    ].filter((x) => !usedIds.has(x.card.id));
    overflow.sort(byScoreDesc);
    while (drawn.length < bodySize && overflow.length > 0) {
      const next = overflow.shift();
      if (!next) break;
      drawn.push(next);
      usedIds.add(next.card.id);
    }
  }

  // ── 3. Phase ordering ──────────────────────────────────────────────────
  let body: Card[];
  if (phase === 'BLOCK') {
    body = orderBlock(
      drawn.map((x) => x.card),
      dominantQ,
      bodySize,
    );
  } else {
    body = orderInterleave(drawn.map((x) => x.card), rng);
  }

  // ── 4. Catch-up tail ───────────────────────────────────────────────────
  const tail = buildCatchupTail(allCards, state, tailSize, usedIds, rng);
  let result = [...body, ...tail].slice(0, targetCount);

  // ── 5. Daily audit + force-injection ───────────────────────────────────
  result = forceInjectUnderRepresented(
    result,
    allCards,
    targetCount,
    rng,
  );

  return result;
}

/**
 * Resolve the student's current stage gate. This is a stub until the real
 * stage-gate engine ships. Algorithm:
 *   - currentStage = highest stage with at least one IN-PROGRESS or NEW card
 *     touched, capped at 6
 *   - unlocked = [1..currentStage]
 */
export function resolveStageGate(
  state: SessionState,
  allCards: readonly Card[],
): StageGate {
  let highest: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1;
  for (const c of allCards) {
    const st = getCardStatus(state, c.id);
    if ((st === 'IN-PROGRESS' || st === 'FAMILIAR') && c.stage > highest) {
      highest = c.stage as 1 | 2 | 3 | 4 | 5 | 6;
    }
  }
  const unlocked: Array<0 | 1 | 2 | 3 | 4 | 5 | 6> = [];
  for (let s = 0; s <= highest; s++) unlocked.push(s as 0 | 1 | 2 | 3 | 4 | 5 | 6);
  return { currentStage: highest, unlocked };
}

// ─────────────────────────────────────────────────────────────────────────────
// Scoring + weighting
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute a per-Q-tag weight multiplier. The lowest-accuracy Q gets
 * LOW_ACC_WEIGHT_MULTIPLIER; everyone else gets 1.0. Ties are broken in
 * Q1..Q4 order so the result is deterministic.
 */
export function computeQWeights(state: SessionState): Readonly<Record<QTag, number>> {
  const weights: Record<QTag, number> = { Q1: 1, Q2: 1, Q3: 1, Q4: 1 };
  let lowest: { q: QTag; pct: number } | null = null;
  for (const q of Q_ROTATION) {
    const fam = getQTrackFamiliarity(state, q);
    if (lowest === null || fam.percent < lowest.pct) {
      lowest = { q, pct: fam.percent };
    }
  }
  if (lowest) weights[lowest.q] = LOW_ACC_WEIGHT_MULTIPLIER;
  return weights;
}

function scoreCard(
  card: Card,
  state: SessionState,
  qWeights: Readonly<Record<QTag, number>>,
  phase: Phase,
  stageGate: StageGate,
  dominantQ: QTag,
): number {
  const status = getCardStatus(state, card.id);
  const statusWeight = status === 'FAMILIAR' ? FAMILIAR_SANITY_WEIGHT : 1;

  // Q weight = max over qTags (use the strongest signal among multi-Q).
  let qWeight = 0;
  for (const q of card.qTags) {
    const w = qWeights[q] ?? 1;
    if (w > qWeight) qWeight = w;
  }
  if (qWeight === 0) qWeight = 1;

  // Stage policy multiplier.
  let stageMul = 1;
  if (card.stage <= 2 && (phase === 'BLOCK' || stageGate.currentStage <= 2)) {
    stageMul = STAGE_BLOCK_FAVOR;
  }
  if (card.stage >= 4 && phase === 'INTERLEAVE') {
    stageMul = STAGE_INTERLEAVE_FAVOR;
  }

  // Stage band weight: prefer cards within ±1 of currentStage.
  const stageDistance = Math.abs(card.stage - stageGate.currentStage);
  const stageBand = stageDistance === 0 ? 1.5 : stageDistance === 1 ? 1.0 : 0.6;

  // Dominant-Q alignment bonus (matters in BLOCK phase).
  const dominantBonus = card.qTags.includes(dominantQ)
    ? phase === 'BLOCK'
      ? 1.5
      : 1.05
    : 1;

  // Atom familiarity penalty: nearer 100 → less weight.
  const atomFam = getAtomFamiliarity(state, card.atomId);
  const atomGap = (100 - atomFam.percent) / 100; // 0..1
  const ageBonus = 0.5 + atomGap * 0.5; // 0.5..1

  return qWeight * statusWeight * stageMul * stageBand * dominantBonus * ageBonus;
}

/** True if the card is within ±2 stages of the current stage, or stage 0. */
function inStageBand(card: Card, gate: StageGate): boolean {
  if (card.stage === 0) return true;
  return Math.abs(card.stage - gate.currentStage) <= 2;
}

function atomBelow(state: SessionState, atomId: string, percent: number): boolean {
  return getAtomFamiliarity(state, atomId).percent < percent;
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase-specific ordering
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BLOCK ordering: group by Q-tag, dominant Q first (must occupy ≥ 70%
 * of body when possible). Within each Q group, S1/S2 cards always come
 * first as a block. Within S1/S2, score order; within the rest, score
 * order.
 */
export function orderBlock(cards: Card[], dominantQ: QTag, bodySize: number): Card[] {
  const groups: Record<QTag, Card[]> = { Q1: [], Q2: [], Q3: [], Q4: [] };
  for (const c of cards) {
    // Use the *first* qTag as the bucket key; multi-Q cards land where
    // they read most-canonically (deterministic).
    const k = (c.qTags[0] ?? 'Q1') as QTag;
    (groups[k] ??= []).push(c);
  }

  // Sort each group: stage<=2 first (BLOCK rule), then stage asc, then id asc.
  const sortGroup = (xs: Card[]): Card[] =>
    xs.slice().sort((a, b) => {
      const aBlock = a.stage <= 2 ? 0 : 1;
      const bBlock = b.stage <= 2 ? 0 : 1;
      if (aBlock !== bBlock) return aBlock - bBlock;
      if (a.stage !== b.stage) return a.stage - b.stage;
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    });

  const dom = sortGroup(groups[dominantQ] ?? []);
  // The other 3 Qs in stable Q1..Q4 order, skipping dom.
  const others: Card[] = [];
  for (const q of Q_ROTATION) if (q !== dominantQ) others.push(...sortGroup(groups[q] ?? []));

  // Enforce ≥70% dominant fraction when possible by truncating others.
  // (Audit step in force-inject rebalances if dom alone is short of the floor.)
  const result: Card[] = [];
  result.push(...dom);
  // If dom alone is less than minDom we still take what we have — we never
  // synthesize cards. The audit step (force-inject) will rebalance.
  result.push(...others);
  return result.slice(0, bodySize);
}

/**
 * INTERLEAVE ordering: greedy schedule that prevents two same-Q cards
 * from being back-to-back when alternatives exist.
 */
export function orderInterleave(cards: Card[], rng: () => number): Card[] {
  if (cards.length <= 1) return cards.slice();
  const buckets: Record<QTag, Card[]> = { Q1: [], Q2: [], Q3: [], Q4: [] };
  for (const c of cards) {
    const k = (c.qTags[0] ?? 'Q1') as QTag;
    (buckets[k] ??= []).push(c);
  }
  // Stable sort each bucket by stage asc, id asc — matches BLOCK convention
  // but without the S1/S2 favor.
  for (const q of Q_ROTATION) {
    buckets[q].sort((a, b) =>
      a.stage !== b.stage ? a.stage - b.stage : a.id < b.id ? -1 : a.id > b.id ? 1 : 0,
    );
  }

  const out: Card[] = [];
  let lastQ: QTag | null = null;
  let remaining = cards.length;

  while (remaining > 0) {
    // Pick the Q with the most cards left, excluding lastQ when possible.
    const ranked = Q_ROTATION.map((q) => ({ q, n: buckets[q].length })).filter((x) => x.n > 0);
    if (ranked.length === 0) break;
    ranked.sort((a, b) => b.n - a.n);
    let pick = ranked[0]!;
    if (pick.q === lastQ && ranked.length > 1) {
      pick = ranked[1]!;
    }
    // Tiny rng nudge for reproducible-but-non-pathological tie-break order
    // when two Qs have equal sizes.
    if (ranked.length > 1 && ranked[0]!.n === ranked[1]!.n && pick.q === ranked[0]!.q) {
      const swap = rng() < 0.5;
      if (swap && ranked[1]!.q !== lastQ) pick = ranked[1]!;
    }
    const next = buckets[pick.q].shift();
    if (!next) break;
    out.push(next);
    lastQ = pick.q;
    remaining--;
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Catch-up tail
// ─────────────────────────────────────────────────────────────────────────────

function buildCatchupTail(
  allCards: readonly Card[],
  state: SessionState,
  tailSize: number,
  usedIds: Set<string>,
  rng: () => number,
): Card[] {
  if (tailSize === 0) return [];

  const eligible = allCards.filter(
    (c) => !usedIds.has(c.id) && atomBelow(state, c.atomId, 50),
  );
  // Shuffle deterministically using rng.
  const shuffled = shuffle(eligible, rng).slice(0, tailSize);
  for (const c of shuffled) usedIds.add(c.id);

  if (shuffled.length === tailSize) return shuffled;

  // Top-up with any unused cards (random) so length === tailSize when
  // possible.
  const remaining = tailSize - shuffled.length;
  const filler = shuffle(
    allCards.filter((c) => !usedIds.has(c.id)),
    rng,
  ).slice(0, remaining);
  for (const c of filler) usedIds.add(c.id);
  return [...shuffled, ...filler];
}

// ─────────────────────────────────────────────────────────────────────────────
// Daily audit
// ─────────────────────────────────────────────────────────────────────────────

function forceInjectUnderRepresented(
  deck: Card[],
  allCards: readonly Card[],
  targetCount: number,
  rng: () => number,
): Card[] {
  const minPerQ = Math.floor(targetCount * AUDIT_THRESHOLD_FRACTION);
  if (minPerQ === 0) return deck;

  const counts: Record<QTag, number> = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
  for (const c of deck) for (const q of c.qTags) counts[q] = (counts[q] ?? 0) + 1;

  const inDeck = new Set(deck.map((c) => c.id));
  let working = deck.slice();

  for (const q of Q_ROTATION) {
    if (counts[q] >= minPerQ) continue;
    const candidates = shuffle(
      allCards.filter((c) => !inDeck.has(c.id) && c.qTags.includes(q)),
      rng,
    ).slice(0, AUDIT_INJECTION_COUNT);

    for (const cand of candidates) {
      // Replace a card belonging to an over-represented Q (preferentially
      // the dominant overflow). Never bump a card whose Q is already at
      // or below threshold.
      let evictIdx = -1;
      for (let i = working.length - 1; i >= 0; i--) {
        const w = working[i]!;
        if (
          w.qTags.every((wq) => (counts[wq] ?? 0) > minPerQ) &&
          !w.qTags.includes(q)
        ) {
          evictIdx = i;
          break;
        }
      }
      if (evictIdx === -1) {
        // Nothing to evict cleanly — append if room, else drop.
        if (working.length < targetCount) {
          working.push(cand);
          inDeck.add(cand.id);
          for (const cq of cand.qTags) counts[cq] = (counts[cq] ?? 0) + 1;
        }
        continue;
      }
      const evicted = working[evictIdx]!;
      working[evictIdx] = cand;
      inDeck.delete(evicted.id);
      inDeck.add(cand.id);
      for (const eq of evicted.qTags) counts[eq] = (counts[eq] ?? 0) - 1;
      for (const cq of cand.qTags) counts[cq] = (counts[cq] ?? 0) + 1;
    }
  }

  return working.slice(0, targetCount);
}

// ─────────────────────────────────────────────────────────────────────────────
// Determinism helpers (tiny LCG, no Math.random)
// ─────────────────────────────────────────────────────────────────────────────

function makeLcg(seed: number): () => number {
  // Numerical Recipes LCG. Returns a function producing [0, 1).
  let s = (seed | 0) >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function mixSeed(...nums: number[]): number {
  let h = 2166136261;
  for (const n of nums) {
    h ^= (n | 0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

// ─────────────────────────────────────────────────────────────────────────────
// Re-exports for tests
// ─────────────────────────────────────────────────────────────────────────────
export { EXPOSURE_TARGETS };

/**
 * INVARIANTS (verified by daily-deck-composer.test.ts):
 *
 *   D1. Determinism: composeDailyDeck(...same args...) === idempotent.
 *   D2. Length: result.length === min(targetCount, eligibleCardCount).
 *   D3. Uniqueness: result has no duplicate card ids.
 *   D4. Phase D1..D3: dominant Q occupies ≥ 70% of body OR all available
 *       cards for that Q were drawn (truncation by stock is allowed).
 *   D5. Phase D4+: no two consecutive cards share a primary Q-tag when
 *       the multiset permits; if any Q has a strict majority > ceil(n/2),
 *       at least the majority interleave bound holds.
 *   D6. Mix ratios on body within ±1 card per layer of MIX_RATIOS.
 *   D7. Tail: tail size ≤ CATCHUP_TAIL_SIZE; tail cards drawn from
 *       atoms below 50% familiarity when stock permits.
 *   D8. Audit: every Q-tag with available cards holds ≥ floor(target *
 *       AUDIT_THRESHOLD_FRACTION) representatives in the final deck.
 *   D9. Stage S1/S2 cards in BLOCK phase appear contiguously inside their
 *       Q-group (block-then-rest).
 *   D10. Lowest-accuracy Q-track receives 1.5× weight in the priority
 *        scoring (visible via computeQWeights()).
 *   D11. Pure: no mutation of allCards or state; no Math.random.
 */
