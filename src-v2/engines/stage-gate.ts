/**
 * Stage-Gate Engine — cpp-t2 v2 (Option 4)
 *
 * Pure-functional progression engine for the 6-stage Q-track ladder, plus
 * the four escape valves that prevent deadlock when a student stalls.
 *
 * Per CLAUDE.md RULE 4: this engine determines whether the student stalls
 * or progresses. Correctness is non-negotiable.
 *
 * ── Stages ─────────────────────────────────────────────────────────────
 *   S1 Tour          → click-through to expose the territory
 *   S2 Template      → memorise the 3-line skeleton verbatim
 *   S3 Components    → drill each component (struct, fn, loop) in isolation
 *   S4 Compose       → write the full main() from prompt
 *   S5 Variations    → transfer to unseen variants of the same skill
 *   S6 Speed         → produce under exam-clock pressure
 *
 * ── Promotion thresholds (per spec) ────────────────────────────────────
 *   S1 → S2   100%  (every tour card seen)
 *   S2 → S3    95%  (verbatim template recall)
 *   S3 → S4    90%  (per-skill threshold across components)
 *   S4 → S5    90%  (production accuracy on whole main())
 *   S5 → S6    85%  (transfer to variants)
 *   S6 → done  90%  (under-time accuracy)
 *
 * ── Escape valves ──────────────────────────────────────────────────────
 *   1. 24h timeout              stalled at a stage > 24h → auto-promote
 *                                at 50/50 mix (current + next)
 *   2. Difficulty drop          3 consecutive fails → switch full-write
 *                                to cloze for 15 cards, then re-promote
 *   3. Cross-track stalemate    when 3 of 4 Qs are at S4+, the lenient
 *                                mock is unlocked even though one Q is behind
 *   4. Manual override          student may skip a stage with a cost warning
 *
 * All public functions pure; no side effects; deterministic outputs.
 */

import type { CardType } from '../types/card-schema.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/** S1..S6 stages on the Q-track ladder. */
export type Stage = 1 | 2 | 3 | 4 | 5 | 6;

/** Q-track tag, mirroring src-v2/types/card-schema.ts QTag. */
export type QTag = 'Q1' | 'Q2' | 'Q3' | 'Q4';

/**
 * Per-(qTag, stage) progress snapshot the engine consumes.
 *
 *   accuracy   percent of correct answers across the relevant window
 *   lastN      trailing window of correct(true)/wrong(false) results
 *   stalledAtMs timestamp of the FIRST attempt at this stage (epoch ms)
 *   completedAt optional timestamp at which the stage was completed
 */
export interface StageProgress {
  readonly qTag: QTag;
  readonly stage: Stage;
  /** 0..100. Caller is responsible for the window definition. */
  readonly accuracy: number;
  /** Trailing window. true = correct, false = wrong. */
  readonly lastN: readonly boolean[];
  /** Epoch ms of first attempt at this stage. 0 if never attempted. */
  readonly stalledAtMs: number;
  /** Epoch ms of completion. Undefined while stage is open. */
  readonly completedAt?: number;
}

/**
 * The five things the gate can decide to do at any moment.
 *
 *   STAY          stay on this stage; keep drilling
 *   ADVANCE       promote to next stage (threshold met)
 *   DROP_BACK     drop one stage (failure-recovery middle band)
 *   SWITCH_TYPE   stay on this stage but switch to easier card type
 *   AUTO_PROMOTE  stalled too long; promote with mixed deck
 */
export type StageDecisionAction =
  | 'STAY'
  | 'ADVANCE'
  | 'DROP_BACK'
  | 'SWITCH_TYPE'
  | 'AUTO_PROMOTE';

export interface StageDecision {
  readonly action: StageDecisionAction;
  readonly from: Stage;
  /** Target stage. Same as `from` for STAY/SWITCH_TYPE. */
  readonly to: Stage;
  readonly reason: string;
}

/**
 * Top-level engine state. The map is keyed by `${qTag}-S${stage}` so a
 * single Q-track can have multiple open stages tracked in parallel.
 */
export interface StageGateState {
  readonly progress: Readonly<Record<string, StageProgress>>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants — promotion thresholds + escape-valve tuning
// ─────────────────────────────────────────────────────────────────────────────

/** Per-stage promotion threshold (percent). Indexed by stage. */
export const PROMOTION_THRESHOLDS: Readonly<Record<Stage, number>> = {
  1: 100,
  2: 95,
  3: 90,
  4: 90,
  5: 85,
  6: 90,
} as const;

/** Window length for promotion checks. Caller may use a different lastN, but
 *  this is the engine's recommended default. */
export const PROMOTION_WINDOW = 20;

/** 24h in ms — stalled stages older than this trigger auto-promote. */
export const TIMEOUT_MS = 24 * 60 * 60 * 1000;

/** Mix ratio when timeout escape fires: 50% current stage / 50% next. */
export const TIMEOUT_MIX_RATIO = 0.5;

/** Number of consecutive fails before difficulty escape fires. */
export const DIFFICULTY_FAIL_THRESHOLD = 3;

/** Number of cards in the "easier mode" buffer before re-promoting. */
export const DIFFICULTY_EASIER_BUFFER = 15;

/**
 * Cross-track stalemate breaker: lenient mock unlocks when ≥ this many of the
 * 4 Q-tracks have reached S4+. Spec says "3 of 4".
 */
export const CROSSTRACK_LENIENT_THRESHOLD = 3;

/** Stage at or above which a Q-track counts as "ready for mock". */
export const CROSSTRACK_READY_STAGE: Stage = 4;

/** Stage at or above which a Q-track counts as ready for the FULL mock. */
export const CROSSTRACK_FULL_STAGE: Stage = 5;

/** UI cost warning template for manual override. */
export const MANUAL_OVERRIDE_WARNING_TEMPLATE =
  'Skipping S{from} → S{to} bypasses the {threshold}% threshold gate. ' +
  'You may underperform on the corresponding exam question. ' +
  'Continue?';

// ─────────────────────────────────────────────────────────────────────────────
// Construction
// ─────────────────────────────────────────────────────────────────────────────

export function createInitialStageGateState(): StageGateState {
  return { progress: {} };
}

/**
 * Compose the per-stage record key.
 *
 * Format: `${qTag}-S${stage}` (e.g. "Q1-S3"). Mirrors
 * src-v2/types/student.ts StageProgressKey shape, restricted here to S-stages
 * (no L0 foundation key — foundation isn't gated this way).
 */
export function stageKey(qTag: QTag, stage: Stage): string {
  return `${qTag}-S${stage}`;
}

/**
 * Set or replace per-stage progress. Pure: returns a new state.
 */
export function setProgress(
  state: StageGateState,
  progress: StageProgress,
): StageGateState {
  return {
    progress: {
      ...state.progress,
      [stageKey(progress.qTag, progress.stage)]: progress,
    },
  };
}

/** Read a per-stage progress entry (or undefined if never set). */
export function getProgress(
  state: StageGateState,
  qTag: QTag,
  stage: Stage,
): StageProgress | undefined {
  return state.progress[stageKey(qTag, stage)];
}

// ─────────────────────────────────────────────────────────────────────────────
// Core decision functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Whether the student meets the promotion threshold for the supplied stage
 * on the given Q-track.
 *
 * The check uses the stored `accuracy` field — caller is responsible for
 * computing it over a meaningful window. Returns false if the stage was
 * never attempted (no progress record).
 *
 * S6 returns true when the under-time threshold is met; downstream code
 * decides whether "advance past S6" means "Q-track is exam-ready".
 */
export function canAdvance(
  state: StageGateState,
  qTag: QTag,
  stage: Stage,
): boolean {
  const p = getProgress(state, qTag, stage);
  if (!p) return false;
  const required = PROMOTION_THRESHOLDS[stage];
  return p.accuracy >= required;
}

/**
 * Whether the student should drop back one stage based on the recent
 * accuracy window — middle band of the failure-recovery spec.
 *
 * Per spec table:
 *   ≥ 50%  → stay (possibly with easier cards)
 *   30..49 → DROP_1_STAGE
 *   < 30   → DROP_2_STAGES (worst case; caller handles)
 *
 * This function answers "should the caller drop AT LEAST one stage?". It
 * returns true for accuracy < 50%. For finer granularity (1 vs 2 stage
 * drop) the caller should consult `failure-recovery.ts:failureAction`.
 *
 * lastN is taken as a parameter so the caller can pass a fresher window
 * than the one stored in StageProgress (e.g. last 10 attempts vs the
 * stored 20-attempt promotion window).
 *
 * S1 cannot drop further (already at floor). Returns false to signal
 * "no drop available, use STAY_EASIER_CARDS or paper-practice alert".
 */
export function shouldDropBack(
  state: StageGateState,
  qTag: QTag,
  stage: Stage,
  lastN: readonly boolean[],
): boolean {
  if (stage <= 1) return false;
  const p = getProgress(state, qTag, stage);
  if (!p) return false;

  // Use the supplied window if non-empty, else fall back to stored lastN.
  const window = lastN.length > 0 ? lastN : p.lastN;
  if (window.length === 0) return false;

  const correct = window.filter((b) => b).length;
  const accuracy = (correct / window.length) * 100;
  return accuracy < 50;
}

// ─────────────────────────────────────────────────────────────────────────────
// Escape valve 1: 24h timeout
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check whether the 24h-timeout escape valve fires for (qTag, stage).
 *
 * Triggers when:
 *   - the stage has been open for > TIMEOUT_MS without completion, AND
 *   - the stage is below S6 (S6 is the last stage; auto-promote past it
 *     means exam-ready, which the caller decides separately).
 *
 * When triggered, returns a 50/50 mix-ratio so the deck composer can build
 * a half-current / half-next stage queue.
 *
 * `currentTimeMs` is taken as a parameter so tests can be deterministic
 * (no Date.now() inside).
 */
export function timeoutEscape(
  state: StageGateState,
  qTag: QTag,
  stage: Stage,
  currentTimeMs: number,
): { triggered: boolean; mixRatio: number } {
  const p = getProgress(state, qTag, stage);
  if (!p) return { triggered: false, mixRatio: 0 };
  if (p.completedAt !== undefined) return { triggered: false, mixRatio: 0 };
  if (p.stalledAtMs <= 0) return { triggered: false, mixRatio: 0 };
  if (stage >= 6) return { triggered: false, mixRatio: 0 };

  const elapsed = currentTimeMs - p.stalledAtMs;
  if (elapsed > TIMEOUT_MS) {
    return { triggered: true, mixRatio: TIMEOUT_MIX_RATIO };
  }
  return { triggered: false, mixRatio: 0 };
}

// ─────────────────────────────────────────────────────────────────────────────
// Escape valve 2: difficulty drop
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check whether the difficulty-escape valve fires.
 *
 * Triggers when the student has had ≥ DIFFICULTY_FAIL_THRESHOLD consecutive
 * fails at the current stage. The deck composer responds by swapping
 * full-write cards for cloze cards for the next DIFFICULTY_EASIER_BUFFER
 * cards, then re-evaluating.
 *
 * The "easier" card type is stage-dependent:
 *   S2 (Template):    swap TemplateRecall  → ClozeCard
 *   S3 (Components):  swap StructWrite/FunctionWrite → ClozeCard
 *   S4 (Compose):     swap MainWrite       → ClozeCard
 *   S5 (Variations):  swap VariantGen      → DemoCard (read-only walkthrough)
 *   S6 (Speed):       swap SpeedDrill      → ClozeCard
 *
 * S1 (Tour) has no easier alternative; returns triggered=false so caller
 * falls through to STAY_EASIER_CARDS or DROP_BACK semantics.
 *
 * The number of consecutive fails is supplied by caller (computed from
 * trailing lastN window). `lastNFails` of 0 never triggers.
 */
export function difficultyEscape(
  state: StageGateState,
  qTag: QTag,
  stage: Stage,
  lastNFails: number,
): { triggered: boolean; easierType: CardType | null } {
  if (lastNFails < DIFFICULTY_FAIL_THRESHOLD) {
    return { triggered: false, easierType: null };
  }
  const p = getProgress(state, qTag, stage);
  if (!p) return { triggered: false, easierType: null };

  const easier = easierTypeForStage(stage);
  if (easier === null) {
    return { triggered: false, easierType: null };
  }
  return { triggered: true, easierType: easier };
}

/**
 * Map a stage to its easier-card-type fallback.
 *
 * Exported for tests + so the deck composer can preview the swap target
 * without hitting the full escape-valve check.
 */
export function easierTypeForStage(stage: Stage): CardType | null {
  switch (stage) {
    case 1:
      return null; // tour cards are already minimum friction
    case 2:
      return 'ClozeCard';
    case 3:
      return 'ClozeCard';
    case 4:
      return 'ClozeCard';
    case 5:
      return 'DemoCard';
    case 6:
      return 'ClozeCard';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Escape valve 3: cross-track stalemate breaker (mock unlock)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mock-paper unlock state.
 *
 *   none     fewer than 3 of 4 Q-tracks ready → no mock yet
 *   partial  ≥ 3 of 4 at S4+ → lenient mock unlocked (escape valve 3)
 *   full     all 4 at S5+   → full mock unlocked (no escape needed)
 *
 * `reason` is a short human-readable summary for the UI.
 */
export interface MockUnlockResult {
  readonly canDo: 'none' | 'partial' | 'full';
  readonly reason: string;
}

/**
 * Cross-track stalemate breaker: decide whether mock papers are unlocked.
 *
 * The Q-track is considered "ready" if its highest-stage progress record
 * meets the relevant ready-stage threshold AND that stage's promotion
 * threshold has been hit.
 *
 * Rules:
 *   - all 4 Q-tracks at S5+      → 'full' (no escape valve needed)
 *   - 3 of 4 Q-tracks at S4+     → 'partial' (escape valve 3 fires)
 *   - else                       → 'none'
 *
 * `allQTags` is provided as a parameter so callers can constrain the check
 * to a subset (e.g. partial sessions). The default in production is
 * ['Q1','Q2','Q3','Q4'].
 */
export function mockUnlock(
  state: StageGateState,
  allQTags: readonly QTag[],
): MockUnlockResult {
  if (allQTags.length === 0) {
    return { canDo: 'none', reason: 'no Q-tracks supplied' };
  }

  let atFull = 0;
  let atPartial = 0;
  for (const q of allQTags) {
    const top = highestPromotedStage(state, q);
    if (top !== null) {
      if (top >= CROSSTRACK_FULL_STAGE) {
        atFull++;
        atPartial++;
      } else if (top >= CROSSTRACK_READY_STAGE) {
        atPartial++;
      }
    }
  }

  if (atFull >= allQTags.length) {
    return {
      canDo: 'full',
      reason: `all ${allQTags.length} Q-tracks at S${CROSSTRACK_FULL_STAGE}+`,
    };
  }
  if (atPartial >= CROSSTRACK_LENIENT_THRESHOLD) {
    return {
      canDo: 'partial',
      reason: `${atPartial} of ${allQTags.length} Q-tracks at S${CROSSTRACK_READY_STAGE}+ — lenient mock unlocked`,
    };
  }
  return {
    canDo: 'none',
    reason: `only ${atPartial} of ${allQTags.length} Q-tracks at S${CROSSTRACK_READY_STAGE}+ — need ${CROSSTRACK_LENIENT_THRESHOLD}`,
  };
}

/**
 * Highest stage on the given Q-track for which canAdvance is true OR which
 * is currently completed. Returns null if no record exists.
 *
 * "Promoted" here means "threshold met or stage marked completed" — that
 * is, the student has demonstrated they can leave this stage. The mock
 * unlock cares about the highest such stage, so a student halfway through
 * S5 still counts as having reached S4 if S4's threshold was met.
 */
export function highestPromotedStage(
  state: StageGateState,
  qTag: QTag,
): Stage | null {
  let best: Stage | null = null;
  for (const stage of [1, 2, 3, 4, 5, 6] as Stage[]) {
    const p = getProgress(state, qTag, stage);
    if (!p) continue;
    const promoted =
      p.completedAt !== undefined || p.accuracy >= PROMOTION_THRESHOLDS[stage];
    if (promoted) {
      if (best === null || stage > best) best = stage;
    }
  }
  return best;
}

// ─────────────────────────────────────────────────────────────────────────────
// Escape valve 4: manual override
// ─────────────────────────────────────────────────────────────────────────────

export interface ManualOverrideResult {
  readonly allowed: boolean;
  readonly costWarning: string;
}

/**
 * Manual stage skip with cost warning.
 *
 * Allowed when:
 *   - fromStage and toStage are valid (1..6)
 *   - toStage > fromStage (override is forward-only; rolling backward is
 *     handled by failure-recovery, not manual override)
 *
 * Always returns a costWarning string if allowed (UI must show it before
 * confirming). When NOT allowed, returns a short reason in costWarning.
 *
 * The cost warning interpolates the bypassed promotion threshold: jumping
 * from S2 to S5 names ALL skipped thresholds in the warning (S2, S3, S4)
 * so the student understands what's being bypassed.
 */
export function manualOverride(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _state: StageGateState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _qTag: QTag,
  fromStage: Stage,
  toStage: Stage,
): ManualOverrideResult {
  if (!isStage(fromStage) || !isStage(toStage)) {
    return {
      allowed: false,
      costWarning: 'invalid stage (must be 1..6)',
    };
  }
  if (toStage <= fromStage) {
    return {
      allowed: false,
      costWarning:
        'manual override is forward-only; use failure-recovery for drops',
    };
  }

  // Build the cost warning.
  const skippedStages: Stage[] = [];
  for (let s = fromStage; s < toStage; s++) {
    skippedStages.push(s as Stage);
  }
  const thresholdsBypassed = skippedStages.map(
    (s) => `S${s} ${PROMOTION_THRESHOLDS[s]}%`,
  );

  const baseWarning = MANUAL_OVERRIDE_WARNING_TEMPLATE.replace(
    '{from}',
    String(fromStage),
  )
    .replace('{to}', String(toStage))
    .replace(
      '{threshold}',
      thresholdsBypassed.join(', '),
    );

  return { allowed: true, costWarning: baseWarning };
}

// ─────────────────────────────────────────────────────────────────────────────
// Composite decision — the high-level function callers use
// ─────────────────────────────────────────────────────────────────────────────

/**
 * One-shot evaluator: combine the per-stage threshold check with the four
 * escape valves and return a single StageDecision.
 *
 * Order of precedence:
 *   1. canAdvance        → ADVANCE
 *   2. timeoutEscape     → AUTO_PROMOTE (50/50 mix)
 *   3. difficultyEscape  → SWITCH_TYPE
 *   4. shouldDropBack    → DROP_BACK
 *   5. else              → STAY
 *
 * Manual override is NOT triggered here — it's a UI-driven action; the gate
 * only validates it via `manualOverride`.
 */
export function evaluateStage(
  state: StageGateState,
  qTag: QTag,
  stage: Stage,
  lastN: readonly boolean[],
  currentTimeMs: number,
): StageDecision {
  const reasonStem = `${qTag} S${stage}`;

  if (canAdvance(state, qTag, stage)) {
    return {
      action: 'ADVANCE',
      from: stage,
      to: clampStage(stage + 1),
      reason: `${reasonStem}: accuracy meets ${PROMOTION_THRESHOLDS[stage]}% threshold`,
    };
  }

  const timeout = timeoutEscape(state, qTag, stage, currentTimeMs);
  if (timeout.triggered) {
    return {
      action: 'AUTO_PROMOTE',
      from: stage,
      to: clampStage(stage + 1),
      reason: `${reasonStem}: stalled > 24h (auto-promote at 50/50 mix)`,
    };
  }

  // Count trailing fails for difficulty escape.
  const trailingFails = trailingFalseStreak(lastN);
  const diff = difficultyEscape(state, qTag, stage, trailingFails);
  if (diff.triggered) {
    return {
      action: 'SWITCH_TYPE',
      from: stage,
      to: stage,
      reason: `${reasonStem}: ${trailingFails} consecutive fails — switch to ${diff.easierType ?? 'easier'} for ${DIFFICULTY_EASIER_BUFFER} cards`,
    };
  }

  if (shouldDropBack(state, qTag, stage, lastN)) {
    return {
      action: 'DROP_BACK',
      from: stage,
      to: clampStage(stage - 1),
      reason: `${reasonStem}: trailing accuracy < 50%`,
    };
  }

  return {
    action: 'STAY',
    from: stage,
    to: stage,
    reason: `${reasonStem}: below ${PROMOTION_THRESHOLDS[stage]}% threshold, keep drilling`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Internals
// ─────────────────────────────────────────────────────────────────────────────

function isStage(n: number): n is Stage {
  return Number.isInteger(n) && n >= 1 && n <= 6;
}

function clampStage(n: number): Stage {
  if (!Number.isFinite(n) || n < 1) return 1;
  if (n > 6) return 6;
  return Math.floor(n) as Stage;
}

/**
 * Length of the trailing run of `false` values in the supplied window.
 *
 *   [t,t,f,f,f]   → 3
 *   [f,f,f,t]     → 0
 *   []            → 0
 */
function trailingFalseStreak(window: readonly boolean[]): number {
  let count = 0;
  for (let i = window.length - 1; i >= 0; i--) {
    if (window[i] === false) count++;
    else break;
  }
  return count;
}
