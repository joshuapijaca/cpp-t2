/**
 * Adaptive In-Session Deck — cpp-t2 v2 (Option 4)
 *
 * Once the daily-deck-composer hands a deck to the session runtime, this
 * engine watches results stream in and re-orders / injects on the fly.
 *
 * Behaviours (per spec §11.1):
 *   - On a wrong answer (a "miss"), inject a DeltaCard targeting the failed
 *     atom (and the closest sibling card by atom or Q-tag).
 *   - On a hit, do nothing (deck flow is preserved).
 *   - Fatigue heuristic: if accuracy in the last `FATIGUE_WINDOW` cards
 *     drops by > FATIGUE_DROP_THRESHOLD compared to the prior window,
 *     swap the next several heavy/long cards for shorter cards (lighter
 *     content) so the student doesn't bounce off.
 *
 * PURITY: every public function is pure. The session runtime supplies
 * the "current deck" (remaining queue) and recent results; the engine
 * returns a NEW deck. Original arrays are never mutated.
 */

import type { Card, DeltaCard } from '../types/card-schema';
import type { SessionState } from './exposure-counter.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────────────

export interface CardResult {
  readonly cardId: string;
  readonly correct: boolean;
  /** Optional: how long the card took, in seconds. */
  readonly seconds?: number;
}

export interface AdaptiveOptions {
  /** Lookback window for fatigue detection. */
  readonly fatigueWindow?: number;
  /** Accuracy drop (in [0,1]) that triggers fatigue mode. */
  readonly fatigueDropThreshold?: number;
  /** When fatigued, how many heavy cards to defer. */
  readonly fatigueDeferCount?: number;
  /** Pool of all cards (used for delta-card lookup + lightening). */
  readonly allCards?: readonly Card[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export const FATIGUE_WINDOW = 10;
export const FATIGUE_DROP_THRESHOLD = 0.20;
export const FATIGUE_DEFER_COUNT = 3;

/**
 * "Heavy" card types are the ones we defer in fatigue mode. The list
 * mirrors the spec's "lighter cards on fatigue" rule — long writes, full
 * mocks, multi-step traces are the heavy ones.
 */
export const HEAVY_CARD_TYPES: readonly string[] = [
  'AdversarialMockCard',
  'TestDaySimCard',
  'MainWriteCard',
  'FunctionWriteCard',
  'TraceCard',
];

/**
 * "Lighter" card types preferred when injecting during fatigue.
 */
export const LIGHTER_CARD_TYPES: readonly string[] = [
  'MCQCard',
  'DemoCard',
  'ClozeCard',
  'DecomposeCard',
  'ConfidenceCalibrationCard',
];

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apply all adaptive logic in one pass. The runtime should call this
 * after every recorded result. Returns the new deck (remaining queue).
 *
 * Algorithm:
 *   1. If `recentResults` is empty or the last result is correct: return
 *      `currentDeck` unchanged unless fatigue is detected (we still
 *      lighten on a sustained drop even if the last card was correct).
 *   2. If the last result is a miss: inject the best-matching DeltaCard.
 *   3. Independent of step 2: if fatigue is detected, defer up to
 *      FATIGUE_DEFER_COUNT heavy cards by swapping with lighter ones.
 */
export function adaptiveAdjust(
  currentDeck: readonly Card[],
  state: SessionState,
  recentResults: readonly CardResult[],
  options: AdaptiveOptions = {},
): Card[] {
  let deck: Card[] = currentDeck.slice();
  const allCards = options.allCards ?? [];

  const last = recentResults.length > 0 ? recentResults[recentResults.length - 1] : null;

  // 1. Failure-driven injection.
  if (last && !last.correct) {
    const deltaCard = findDeltaCard(last.cardId, state, allCards);
    if (deltaCard) {
      deck = injectAfter(deck, deltaCard, 0);
    } else {
      // Fallback: re-queue any card sharing the failed atom from the pool.
      const failedMeta = state.cards[last.cardId];
      if (failedMeta) {
        const sibling = allCards.find(
          (c) =>
            c.atomId === failedMeta.atomId &&
            c.id !== last.cardId &&
            !deck.some((d) => d.id === c.id),
        );
        if (sibling) deck = injectAfter(deck, sibling, 0);
      }
    }
  }

  // 2. Fatigue-driven lightening.
  if (
    detectFatigue(
      recentResults,
      options.fatigueWindow ?? FATIGUE_WINDOW,
      options.fatigueDropThreshold ?? FATIGUE_DROP_THRESHOLD,
    )
  ) {
    deck = lightenDeck(
      deck,
      allCards,
      options.fatigueDeferCount ?? FATIGUE_DEFER_COUNT,
    );
  }

  return deck;
}

/**
 * Detect a fatigue drop. Compares accuracy across the last `window` cards
 * to the `window` cards before that. Returns true if the recent window's
 * accuracy is at least `threshold` below the prior window's.
 *
 * Edge cases:
 *   - If we have fewer than 2*window results, return false (not enough
 *     signal to claim fatigue).
 *   - Accuracy of an empty window is treated as 1 (don't trigger).
 */
export function detectFatigue(
  results: readonly CardResult[],
  window: number = FATIGUE_WINDOW,
  threshold: number = FATIGUE_DROP_THRESHOLD,
): boolean {
  if (results.length < window * 2) return false;
  const recent = results.slice(-window);
  const prior = results.slice(-2 * window, -window);
  const accRecent = recent.filter((r) => r.correct).length / recent.length;
  const accPrior = prior.filter((r) => r.correct).length / prior.length;
  return accPrior - accRecent > threshold;
}

/**
 * Build a DeltaCard for the failed card, prefer one already authored in
 * the pool. Falls back to null when nothing matches.
 */
export function findDeltaCard(
  failedCardId: string,
  state: SessionState,
  allCards: readonly Card[],
): DeltaCard | null {
  const meta = state.cards[failedCardId];
  if (!meta) return null;
  // Prefer a DeltaCard tagged to the same atom.
  for (const c of allCards) {
    if (c.type === 'DeltaCard' && c.atomId === meta.atomId) {
      return c as DeltaCard;
    }
  }
  // Fallback: any DeltaCard sharing a Q-tag with the failed card.
  for (const c of allCards) {
    if (c.type !== 'DeltaCard') continue;
    if ((c as DeltaCard).qTags.some((q) => meta.qTags.includes(q))) {
      return c as DeltaCard;
    }
  }
  return null;
}

/**
 * Replace up to `deferCount` heavy cards in the upcoming queue with
 * lighter cards (drawn from the pool). Heavy cards are deferred to the
 * end of the deck (preserved, not deleted).
 */
export function lightenDeck(
  deck: readonly Card[],
  allCards: readonly Card[],
  deferCount: number,
): Card[] {
  if (deferCount <= 0) return deck.slice();

  const inDeck = new Set(deck.map((c) => c.id));
  const lightPool = allCards.filter(
    (c) => !inDeck.has(c.id) && LIGHTER_CARD_TYPES.includes(c.type),
  );
  if (lightPool.length === 0) return deck.slice();

  const result = deck.slice();
  let deferred = 0;
  const tailDefer: Card[] = [];

  // Walk the deck head-to-tail; replace heavy with light, queue the heavy
  // for the tail.
  for (let i = 0; i < result.length && deferred < deferCount; i++) {
    if (HEAVY_CARD_TYPES.includes(result[i]!.type)) {
      const replacement = lightPool.shift();
      if (!replacement) break;
      tailDefer.push(result[i]!);
      result[i] = replacement;
      deferred++;
    }
  }
  return [...result, ...tailDefer];
}

// ─────────────────────────────────────────────────────────────────────────────
// Internals
// ─────────────────────────────────────────────────────────────────────────────

function injectAfter(deck: Card[], card: Card, offset: number): Card[] {
  // Don't re-inject if already pending.
  if (deck.some((d) => d.id === card.id)) return deck;
  const idx = Math.min(Math.max(0, offset), deck.length);
  return [...deck.slice(0, idx), card, ...deck.slice(idx)];
}
