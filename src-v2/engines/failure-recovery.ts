/**
 * Failure-Recovery Engine — cpp-t2 v2 (Option 4)
 *
 * Per CLAUDE.md MISSION + RULE 4: when a student fails repeatedly, the engine
 * must respond proportionally — not silently grind. This module turns
 * lastN-window accuracy into one of five corrective actions, per the spec
 * table in docs/v2/STAGE_GATE_ENGINE.md.
 *
 * The action is computed from accuracy ALONE — caller is responsible for
 * applying it to the actual deck/state. Pure function. No side effects.
 *
 * Spec table (canonical):
 *
 *   accuracy ≥ 85%   → ADVANCE
 *   70 ≤ acc < 85%   → STAY (drill +20 cards, same stage)
 *   50 ≤ acc < 70%   → STAY_EASIER_CARDS (next 15 cards = cloze, not write)
 *   30 ≤ acc < 50%   → DROP_1_STAGE
 *   acc < 30%        → DROP_2_STAGES_INJECT_PREREQ + alert
 *                       ("concept needs paper practice")
 *
 * The thresholds are inclusive on the LOWER bound (≥), so an accuracy of
 * exactly 85% advances. A 0% accuracy still triggers the worst-case branch
 * but never throws.
 *
 * RULE: stage 1 (S1 Tour) cannot drop further than itself; we clamp at the
 * floor and surface the same alert.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The five corrective actions a stalled stage can take.
 *
 *   ADVANCE                       Promote to next stage now.
 *   STAY                          Drill +20 more cards in the same stage.
 *   STAY_EASIER_CARDS             Same stage; next 15 cards swap full-write
 *                                 for cloze (lower-friction). Then re-evaluate.
 *   DROP_1_STAGE                  Roll back one stage (e.g. S4 → S3) and re-drill.
 *   DROP_2_STAGES_INJECT_PREREQ   Roll back two stages AND inject prereq
 *                                 cards. Surfaces the "concept needs paper
 *                                 practice" alert to the UI.
 */
export type FailureAction =
  | 'ADVANCE'
  | 'STAY'
  | 'STAY_EASIER_CARDS'
  | 'DROP_1_STAGE'
  | 'DROP_2_STAGES_INJECT_PREREQ';

/** Stage 1 (Tour) … 6 (Speed). Mirrors stage-gate.ts. */
export type Stage = 1 | 2 | 3 | 4 | 5 | 6;

/** Optional structured outcome (alert text + clamped target stage). */
export interface FailureOutcome {
  readonly action: FailureAction;
  /** Stage caller should advance/stay/drop to (clamped to floor). */
  readonly toStage: Stage;
  /** Free-form alert text for UI surfacing. Empty string when none. */
  readonly alert: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Spec-table thresholds — kept as named constants so the rule table is greppable
// ─────────────────────────────────────────────────────────────────────────────

export const FAILURE_THRESHOLDS = {
  /** Accuracy at which a stalled stage is permitted to advance. */
  advance: 85,
  /** Accuracy at which we stay and drill +20 more cards. */
  stay: 70,
  /** Accuracy at which we stay but swap full-write for cloze. */
  stayEasier: 50,
  /** Accuracy at which we drop one stage. */
  drop1: 30,
  /** Below this, the worst-case 2-stage drop + prereq inject fires. */
  // (no constant — anything < drop1 is "concept needs paper practice")
} as const;

/** Alert text for the worst-case action. Surfaces to UI literally. */
export const PAPER_PRACTICE_ALERT = 'concept needs paper practice';

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map a lastN-window accuracy (0..100) to one of the five corrective actions.
 *
 * Single-purpose function: caller passes the accuracy, this returns the rule.
 * No state mutation, no UI side effects.
 *
 * Inputs:
 *   - lastNAccuracy: percent in [0, 100]. Out-of-range values are clamped
 *     defensively — NaN/Infinity/negative go to 0; > 100 goes to 100.
 *   - stage: ignored for the action mapping (the spec is stage-independent),
 *     but accepted so the call-site reads naturally and so we can extend
 *     stage-aware behaviour later without changing the signature.
 *
 * Determinism: identical inputs always return identical outputs.
 */
export function failureAction(
  lastNAccuracy: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _stage: Stage,
): FailureAction {
  const acc = clampPercent(lastNAccuracy);
  if (acc >= FAILURE_THRESHOLDS.advance) return 'ADVANCE';
  if (acc >= FAILURE_THRESHOLDS.stay) return 'STAY';
  if (acc >= FAILURE_THRESHOLDS.stayEasier) return 'STAY_EASIER_CARDS';
  if (acc >= FAILURE_THRESHOLDS.drop1) return 'DROP_1_STAGE';
  return 'DROP_2_STAGES_INJECT_PREREQ';
}

/**
 * Same as failureAction but returns the structured outcome — clamped target
 * stage + alert text. Convenience for callers that want both pieces.
 */
export function failureOutcome(
  lastNAccuracy: number,
  stage: Stage,
): FailureOutcome {
  const action = failureAction(lastNAccuracy, stage);

  switch (action) {
    case 'ADVANCE':
      return {
        action,
        toStage: clampStage((stage + 1) as number),
        alert: '',
      };
    case 'STAY':
    case 'STAY_EASIER_CARDS':
      return { action, toStage: stage, alert: '' };
    case 'DROP_1_STAGE':
      return {
        action,
        toStage: clampStage(stage - 1),
        alert: '',
      };
    case 'DROP_2_STAGES_INJECT_PREREQ':
      return {
        action,
        toStage: clampStage(stage - 2),
        alert: PAPER_PRACTICE_ALERT,
      };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Internals
// ─────────────────────────────────────────────────────────────────────────────

function clampPercent(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  if (n > 100) return 100;
  return n;
}

function clampStage(n: number): Stage {
  if (!Number.isFinite(n) || n < 1) return 1;
  if (n > 6) return 6;
  return Math.floor(n) as Stage;
}
