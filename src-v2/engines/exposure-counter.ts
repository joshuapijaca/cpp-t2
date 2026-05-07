/**
 * Exposure-Frequency Engine — cpp-t2 v2 (Option 4)
 *
 * Pure-functional counter-based familiarity engine. Replaces SRS.
 * See: docs/v2/EXPOSURE_ENGINE.md for design rationale + invariants.
 *
 * RULE: All public functions MUST be pure — no mutation of inputs,
 * no side effects, deterministic output for identical inputs.
 *
 * State machine per card:
 *   NEW (0 exposures)
 *     → IN-PROGRESS (1+ exposures, not retired)
 *       → FAMILIAR (exposureCount >= target AND lastNResults all 'correct'
 *                   for the configured retire window)
 *
 * Key invariants (verified by stress test):
 *   I1. exposureCount >= correctCount (every correct increments both)
 *   I2. exposureCount === sum of all results recorded
 *   I3. lastNResults length is bounded by RETIRE_WINDOW
 *   I4. Once FAMILIAR, never demotes within a session (monotonic terminal)
 *   I5. Atom familiarity percent is in [0, 100], inclusive both ends
 *   I6. Q-track familiarity is the unweighted mean of contributing atom percents
 *   I7. shouldRetire requires BOTH exposureCount >= target AND last RETIRE_WINDOW correct
 *   I8. Status transitions are forward-only within a session: NEW < IN-PROGRESS < FAMILIAR
 */

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Number of trailing exposures that must all be 'correct' to retire a card. */
export const RETIRE_WINDOW = 3;

/** Length-tuned exposure targets per card length category. */
export const EXPOSURE_TARGETS = {
  short: 6,
  medium: 8,
  long: 12,
} as const;

export type CardLength = keyof typeof EXPOSURE_TARGETS;

/**
 * Default fallback length when the card's length is unknown.
 * Conservative: medium → 8 exposures, in line with KP-M familiarity bands.
 */
export const DEFAULT_CARD_LENGTH: CardLength = 'medium';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type CardStatus = 'NEW' | 'IN-PROGRESS' | 'FAMILIAR';
export type ExposureResult = 'correct' | 'wrong';

/**
 * Per-card mutable-feeling-but-immutable counter state.
 * Stored in a flat record by cardId for O(1) lookup.
 */
export interface CardExposureState {
  readonly cardId: string;
  readonly exposureCount: number;
  readonly correctCount: number;
  /** Trailing window of last N results, oldest first. Length ≤ RETIRE_WINDOW. */
  readonly lastNResults: readonly ExposureResult[];
  readonly status: CardStatus;
  /** Length category determines retirement target. */
  readonly length: CardLength;
  /** First exposure timestamp (epoch ms). 0 if NEW. */
  readonly firstExposedAt: number;
  /** Most recent exposure timestamp (epoch ms). 0 if NEW. */
  readonly lastExposedAt: number;
}

/**
 * Card metadata held alongside session state.
 * The session needs to know the atom + Q-tag fan-out for each card to
 * compute atom-level and Q-track-level familiarity.
 */
export interface CardMeta {
  readonly cardId: string;
  readonly atomId: string;
  /** Q-track tags (e.g. ['Q1', 'Q4']). May be empty for foundation cards. */
  readonly qTags: readonly string[];
  readonly length: CardLength;
}

/** Per-atom roll-up of exposures across all cards tagged to that atom. */
export interface AtomFamiliarity {
  readonly atomId: string;
  readonly totalExposures: number;
  readonly correctExposures: number;
  /** Sum of per-card targets across all cards belonging to this atom. */
  readonly target: number;
  /**
   * Familiarity percent in [0, 100]. Computed as
   * round((correctExposures / target) * 100), capped at 100.
   */
  readonly percent: number;
}

/** Per-Q-track roll-up: average familiarity across atoms touching this Q. */
export interface QTrackFamiliarity {
  readonly qTag: string;
  readonly percent: number;
  readonly atomsAt100: readonly string[];
  readonly atomsBelow50: readonly string[];
  /** All atoms touching this Q-track (used for downstream weighting). */
  readonly atoms: readonly string[];
}

/**
 * Top-level session state. All engines receive + return this immutably.
 * Card metadata is registered up-front; exposures are appended as the
 * student works.
 */
export interface SessionState {
  /** Card metadata indexed by cardId. */
  readonly cards: Readonly<Record<string, CardMeta>>;
  /** Per-card exposure state indexed by cardId. */
  readonly exposures: Readonly<Record<string, CardExposureState>>;
  /** Atom → set of cardIds belonging to it. */
  readonly atomToCards: Readonly<Record<string, readonly string[]>>;
  /** Q-tag → set of atomIds touched by any card tagged with that Q. */
  readonly qToAtoms: Readonly<Record<string, readonly string[]>>;
  /** Monotonic exposure counter — used as a stable tiebreak in deck composers. */
  readonly seq: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Construction
// ─────────────────────────────────────────────────────────────────────────────

/** Build a fresh session state with no registered cards. */
export function createInitialState(): SessionState {
  return {
    cards: {},
    exposures: {},
    atomToCards: {},
    qToAtoms: {},
    seq: 0,
  };
}

/**
 * Register a single card's metadata, returning a new state.
 * Idempotent: re-registering the same cardId with identical meta is a no-op;
 * re-registering with different meta throws (registration drift = bug).
 */
export function registerCard(state: SessionState, meta: CardMeta): SessionState {
  const existing = state.cards[meta.cardId];
  if (existing) {
    if (
      existing.atomId !== meta.atomId ||
      existing.length !== meta.length ||
      !sameTags(existing.qTags, meta.qTags)
    ) {
      throw new Error(
        `registerCard: drift for cardId=${meta.cardId} (existing meta differs)`,
      );
    }
    return state;
  }

  const cards = { ...state.cards, [meta.cardId]: meta };

  // Index atom → cards
  const prevAtomCards = state.atomToCards[meta.atomId] ?? [];
  const atomToCards = {
    ...state.atomToCards,
    [meta.atomId]: [...prevAtomCards, meta.cardId],
  };

  // Index q → atoms (dedup)
  let qToAtoms = state.qToAtoms;
  for (const qTag of meta.qTags) {
    const prev = qToAtoms[qTag] ?? [];
    if (!prev.includes(meta.atomId)) {
      qToAtoms = { ...qToAtoms, [qTag]: [...prev, meta.atomId] };
    }
  }

  return { ...state, cards, atomToCards, qToAtoms };
}

/** Register many cards at once. Equivalent to folding registerCard. */
export function registerCards(
  state: SessionState,
  metas: readonly CardMeta[],
): SessionState {
  let next = state;
  for (const m of metas) next = registerCard(next, m);
  return next;
}

// ─────────────────────────────────────────────────────────────────────────────
// Recording exposures
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Record a single card result.
 *
 * Pure: returns a NEW SessionState. Original state is not mutated.
 *
 * Behaviour:
 *   - Wrong   → exposureCount++, correctCount unchanged
 *   - Correct → exposureCount++, correctCount++
 *   - lastNResults appended (capped to RETIRE_WINDOW from the right)
 *   - status promoted: NEW → IN-PROGRESS on first exposure;
 *                     IN-PROGRESS → FAMILIAR when shouldRetire returns true
 *   - FAMILIAR is terminal within a session (no demotion)
 *
 * Throws if the cardId is not registered (caller bug — registration drift).
 */
export function recordCardResult(
  state: SessionState,
  cardId: string,
  correct: boolean,
  now: number = Date.now(),
): SessionState {
  const meta = state.cards[cardId];
  if (!meta) {
    throw new Error(
      `recordCardResult: unknown cardId=${cardId} (not registered)`,
    );
  }

  const prev: CardExposureState =
    state.exposures[cardId] ??
    freshExposureState(cardId, meta.length);

  const result: ExposureResult = correct ? 'correct' : 'wrong';

  const exposureCount = prev.exposureCount + 1;
  const correctCount = prev.correctCount + (correct ? 1 : 0);

  // Append to trailing window, drop oldest if over capacity.
  const appended = [...prev.lastNResults, result];
  const lastNResults =
    appended.length > RETIRE_WINDOW
      ? appended.slice(appended.length - RETIRE_WINDOW)
      : appended;

  const target = EXPOSURE_TARGETS[meta.length];
  const meetsRetire =
    exposureCount >= target &&
    lastNResults.length >= RETIRE_WINDOW &&
    lastNResults.every((r) => r === 'correct');

  const status: CardStatus =
    prev.status === 'FAMILIAR'
      ? 'FAMILIAR' // terminal within session
      : meetsRetire
        ? 'FAMILIAR'
        : 'IN-PROGRESS';

  const next: CardExposureState = {
    cardId,
    exposureCount,
    correctCount,
    lastNResults,
    status,
    length: meta.length,
    firstExposedAt: prev.firstExposedAt === 0 ? now : prev.firstExposedAt,
    lastExposedAt: now,
  };

  return {
    ...state,
    exposures: { ...state.exposures, [cardId]: next },
    seq: state.seq + 1,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────────────────────

/** Status for a card. Unregistered or never-exposed cards report NEW. */
export function getCardStatus(state: SessionState, cardId: string): CardStatus {
  return state.exposures[cardId]?.status ?? 'NEW';
}

/**
 * Whether the card meets retirement criteria right now.
 * Equivalent to (status === 'FAMILIAR') after the latest result, but also
 * usable as a guard before recording (peek-ahead is not its purpose).
 */
export function shouldRetire(state: SessionState, cardId: string): boolean {
  const exp = state.exposures[cardId];
  if (!exp) return false;
  const target = EXPOSURE_TARGETS[exp.length];
  return (
    exp.exposureCount >= target &&
    exp.lastNResults.length >= RETIRE_WINDOW &&
    exp.lastNResults.every((r) => r === 'correct')
  );
}

/**
 * Aggregate familiarity for one atom.
 *
 * Math:
 *   target = sum(EXPOSURE_TARGETS[card.length] for card in atom.cards)
 *   percent = clampTo100(round(correctExposures / target * 100))
 *
 * If the atom has no registered cards, returns zeros + percent=0.
 * If target is 0 (defensively — shouldn't happen), percent=0.
 */
export function getAtomFamiliarity(
  state: SessionState,
  atomId: string,
): AtomFamiliarity {
  const cardIds = state.atomToCards[atomId] ?? [];
  let totalExposures = 0;
  let correctExposures = 0;
  let target = 0;

  for (const cardId of cardIds) {
    const meta = state.cards[cardId];
    if (!meta) continue;
    target += EXPOSURE_TARGETS[meta.length];
    const exp = state.exposures[cardId];
    if (!exp) continue;
    totalExposures += exp.exposureCount;
    correctExposures += exp.correctCount;
  }

  const percent =
    target === 0 ? 0 : clampPercent(Math.round((correctExposures / target) * 100));

  return { atomId, totalExposures, correctExposures, target, percent };
}

/**
 * Aggregate familiarity for one Q-track.
 *
 * Math:
 *   percent = mean(getAtomFamiliarity(a).percent for a in q.atoms)
 *
 * Atoms-at-100 / atoms-below-50 buckets help the UI surface coverage gaps.
 */
export function getQTrackFamiliarity(
  state: SessionState,
  qTag: string,
): QTrackFamiliarity {
  const atomIds = state.qToAtoms[qTag] ?? [];
  if (atomIds.length === 0) {
    return { qTag, percent: 0, atomsAt100: [], atomsBelow50: [], atoms: [] };
  }

  let sum = 0;
  const atomsAt100: string[] = [];
  const atomsBelow50: string[] = [];
  for (const atomId of atomIds) {
    const f = getAtomFamiliarity(state, atomId);
    sum += f.percent;
    if (f.percent >= 100) atomsAt100.push(atomId);
    if (f.percent < 50) atomsBelow50.push(atomId);
  }

  const percent = clampPercent(Math.round(sum / atomIds.length));
  return { qTag, percent, atomsAt100, atomsBelow50, atoms: atomIds };
}

/**
 * All atoms touched by the session, with their familiarity.
 * Useful for the atom-tree visualizer and for adaptive deck weighting.
 */
export function getAllAtomFamiliarities(
  state: SessionState,
): readonly AtomFamiliarity[] {
  return Object.keys(state.atomToCards).map((atomId) =>
    getAtomFamiliarity(state, atomId),
  );
}

/** All registered Q-tags with their roll-ups. */
export function getAllQTrackFamiliarities(
  state: SessionState,
): readonly QTrackFamiliarity[] {
  return Object.keys(state.qToAtoms).map((qTag) =>
    getQTrackFamiliarity(state, qTag),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Internals
// ─────────────────────────────────────────────────────────────────────────────

function freshExposureState(
  cardId: string,
  length: CardLength,
): CardExposureState {
  return {
    cardId,
    exposureCount: 0,
    correctCount: 0,
    lastNResults: [],
    status: 'NEW',
    length,
    firstExposedAt: 0,
    lastExposedAt: 0,
  };
}

function clampPercent(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

function sameTags(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  // Order-independent compare; small arrays so O(n^2) is fine.
  for (const x of a) if (!b.includes(x)) return false;
  return true;
}
