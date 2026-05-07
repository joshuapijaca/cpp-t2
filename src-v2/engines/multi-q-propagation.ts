/**
 * Multi-Q Tagging + Propagation — cpp-t2 v2 (Option 4)
 *
 * Cards may carry multiple Q-tags (e.g. a struct trace card belongs to Q1 *and*
 * Q4 because both questions exercise that skill). When such a card is exposed,
 * the exposure counts toward EVERY tagged Q-track simultaneously — one drill,
 * multiple tracks of progress.
 *
 * Implementation note: actual exposure counts are stored per-card in the
 * SessionState (see exposure-counter.ts). Q-track familiarity is *derived* by
 * walking the qToAtoms index — so propagation is automatic for queries.
 *
 * What this module adds:
 *   - propagateExposure(): convenience wrapper that records a single result
 *     and asserts the card's qTags match the supplied tags (drift detector).
 *   - tracksLeakingTo(): given a card, return the set of Q-tracks that benefit
 *     from this card's exposure. Used by the deck composer to prefer
 *     multi-tagged cards when several Q-tracks are below target.
 *   - rankCardsByCoverage(): given a candidate set + a list of Q-tracks the
 *     student is behind on, return cards ranked by how many of those tracks
 *     they lift simultaneously. Concrete value of multi-Q tagging surfaced.
 *
 * Pure functions. No side effects.
 */

import {
  recordCardResult,
  type SessionState,
} from './exposure-counter.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Propagation primitive
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Record an exposure for a multi-tagged card.
 *
 * Counter-state is single per card (the card itself is the unit of memory).
 * The propagation to multiple Q-tracks is automatic because:
 *   1. Card is registered with all its qTags (see registerCard()).
 *   2. qToAtoms index maps each qTag → atoms whose cards carry that tag.
 *   3. getQTrackFamiliarity() reads the index, so a single recordCardResult
 *      lifts every Q-track simultaneously when the query is run.
 *
 * This function adds a drift assertion: the supplied qTags MUST match the
 * registered qTags for the card. If they don't, throw — the caller's view of
 * the card's tag fan-out is stale, which would silently skew familiarity.
 *
 * Pass an empty array to opt out of the assertion.
 */
export function propagateExposure(
  state: SessionState,
  cardId: string,
  qTags: readonly string[],
  correct: boolean,
  now?: number,
): SessionState {
  const meta = state.cards[cardId];
  if (!meta) {
    throw new Error(
      `propagateExposure: unknown cardId=${cardId} (not registered)`,
    );
  }

  if (qTags.length > 0 && !sameSet(qTags, meta.qTags)) {
    throw new Error(
      `propagateExposure: qTag drift for cardId=${cardId} ` +
        `(supplied=[${[...qTags].sort().join(',')}], ` +
        `registered=[${[...meta.qTags].sort().join(',')}])`,
    );
  }

  return now === undefined
    ? recordCardResult(state, cardId, correct)
    : recordCardResult(state, cardId, correct, now);
}

// ─────────────────────────────────────────────────────────────────────────────
// Coverage queries
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The set of Q-tracks that benefit when this card is exposed.
 *
 * Equal to the card's own qTags, deduplicated and as a Set for O(1)
 * membership checks. Returned as a fresh Set to avoid leaking internal state.
 *
 * "leaking to" framing emphasises the multi-Q insight: one drill leaks
 * progress into multiple tracks.
 */
export function tracksLeakingTo(
  cardId: string,
  state: SessionState,
): ReadonlySet<string> {
  const meta = state.cards[cardId];
  if (!meta) return new Set();
  return new Set(meta.qTags);
}

/**
 * Same as tracksLeakingTo, but pre-grouped from a flat array of card metas.
 * Useful when the caller is composing a deck offline (no SessionState yet).
 */
export function tracksLeakingToFromCards(
  cardId: string,
  allCards: readonly { cardId: string; qTags: readonly string[] }[],
): ReadonlySet<string> {
  const found = allCards.find((c) => c.cardId === cardId);
  if (!found) return new Set();
  return new Set(found.qTags);
}

/**
 * Rank candidate cardIds by how many of the requested Q-tracks they lift.
 *
 * Inputs:
 *   - state: source of truth for each card's qTags.
 *   - candidates: cardIds to rank.
 *   - targetQTags: Q-tracks the student is behind on.
 *
 * Output (immutable, descending by coverage):
 *   [{ cardId, coverage, lifts }, …]
 *     coverage = number of targetQTags this card touches
 *     lifts    = the actual subset of targetQTags this card touches
 *
 * Ties broken by candidate-array order (stable). Cards with zero coverage are
 * dropped. This is the engine's concrete answer to "which card do I drill
 * next when 3 Q-tracks are red?" — pick the card that lights up the most red.
 */
export function rankCardsByCoverage(
  state: SessionState,
  candidates: readonly string[],
  targetQTags: readonly string[],
): readonly {
  cardId: string;
  coverage: number;
  lifts: readonly string[];
}[] {
  const targetSet = new Set(targetQTags);
  const scored: {
    cardId: string;
    coverage: number;
    lifts: readonly string[];
    order: number;
  }[] = [];

  for (let i = 0; i < candidates.length; i++) {
    const cardId = candidates[i] as string;
    const meta = state.cards[cardId];
    if (!meta) continue;
    const lifts: string[] = [];
    for (const q of meta.qTags) if (targetSet.has(q)) lifts.push(q);
    if (lifts.length === 0) continue;
    scored.push({ cardId, coverage: lifts.length, lifts, order: i });
  }

  scored.sort((a, b) =>
    b.coverage !== a.coverage ? b.coverage - a.coverage : a.order - b.order,
  );

  return scored.map(({ cardId, coverage, lifts }) => ({
    cardId,
    coverage,
    lifts,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Internals
// ─────────────────────────────────────────────────────────────────────────────

function sameSet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  for (const x of a) if (!b.includes(x)) return false;
  return true;
}
