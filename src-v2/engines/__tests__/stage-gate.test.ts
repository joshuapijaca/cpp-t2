/**
 * Stage-Gate Engine — exhaustive unit tests
 *
 * Per CLAUDE.md RULE 4: stage-gate engine determines whether the student
 * stalls or progresses. Test for correctness exhaustively.
 *
 * Coverage target: 100% line on stage-gate.ts + failure-recovery.ts.
 *
 * Test categories:
 *   1. Construction + state primitives
 *   2. canAdvance — every stage threshold
 *   3. shouldDropBack — accuracy bands
 *   4. Escape valve 1: 24h timeout
 *   5. Escape valve 2: difficulty drop (per-stage easier-type)
 *   6. Escape valve 3: cross-track stalemate breaker (mock unlock)
 *   7. Escape valve 4: manual override (validation + warning text)
 *   8. evaluateStage — composite decision precedence
 *   9. failure-recovery — every spec-table band + structured outcome
 *  10. Edge cases (empty windows, NaN/Infinity, stage clamps, S1/S6 floors)
 */

import { describe, expect, it } from 'vitest';
import {
  canAdvance,
  createInitialStageGateState,
  CROSSTRACK_FULL_STAGE,
  CROSSTRACK_LENIENT_THRESHOLD,
  CROSSTRACK_READY_STAGE,
  DIFFICULTY_EASIER_BUFFER,
  DIFFICULTY_FAIL_THRESHOLD,
  difficultyEscape,
  easierTypeForStage,
  evaluateStage,
  getProgress,
  highestPromotedStage,
  manualOverride,
  mockUnlock,
  PROMOTION_THRESHOLDS,
  PROMOTION_WINDOW,
  setProgress,
  shouldDropBack,
  stageKey,
  TIMEOUT_MIX_RATIO,
  TIMEOUT_MS,
  timeoutEscape,
  type QTag,
  type Stage,
  type StageGateState,
  type StageProgress,
} from '../stage-gate.ts';
import {
  FAILURE_THRESHOLDS,
  failureAction,
  failureOutcome,
  PAPER_PRACTICE_ALERT,
} from '../failure-recovery.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Test fixtures
// ─────────────────────────────────────────────────────────────────────────────

function progress(
  qTag: QTag,
  stage: Stage,
  accuracy: number,
  lastN: readonly boolean[] = [],
  stalledAtMs = 0,
  completedAt?: number,
): StageProgress {
  const base = { qTag, stage, accuracy, lastN, stalledAtMs };
  return completedAt === undefined
    ? base
    : { ...base, completedAt };
}

function withProgress(
  state: StageGateState,
  ...progresses: StageProgress[]
): StageGateState {
  let s = state;
  for (const p of progresses) s = setProgress(s, p);
  return s;
}

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const NOW = 1_700_000_000_000;

// ─────────────────────────────────────────────────────────────────────────────
// 1. Construction + state primitives
// ─────────────────────────────────────────────────────────────────────────────

describe('createInitialStageGateState', () => {
  it('returns an empty state', () => {
    const s = createInitialStageGateState();
    expect(s.progress).toEqual({});
  });
});

describe('stageKey', () => {
  it('produces `${qTag}-S${stage}` keys', () => {
    expect(stageKey('Q1', 1)).toBe('Q1-S1');
    expect(stageKey('Q4', 6)).toBe('Q4-S6');
  });
});

describe('setProgress / getProgress', () => {
  it('round-trips a progress entry', () => {
    const p = progress('Q1', 3, 80);
    const s = setProgress(createInitialStageGateState(), p);
    expect(getProgress(s, 'Q1', 3)).toEqual(p);
  });

  it('returns undefined when stage not set', () => {
    const s = createInitialStageGateState();
    expect(getProgress(s, 'Q2', 5)).toBeUndefined();
  });

  it('overwrites prior entry on the same key', () => {
    const a = progress('Q1', 2, 50);
    const b = progress('Q1', 2, 95);
    const s = setProgress(setProgress(createInitialStageGateState(), a), b);
    expect(getProgress(s, 'Q1', 2)?.accuracy).toBe(95);
  });

  it('does not mutate the input state', () => {
    const orig = createInitialStageGateState();
    setProgress(orig, progress('Q1', 1, 100));
    expect(orig.progress).toEqual({});
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. canAdvance — per-stage thresholds
// ─────────────────────────────────────────────────────────────────────────────

describe('canAdvance', () => {
  it('returns false when no progress is recorded', () => {
    expect(canAdvance(createInitialStageGateState(), 'Q1', 1)).toBe(false);
  });

  it.each<[Stage, number]>([
    [1, 100],
    [2, 95],
    [3, 90],
    [4, 90],
    [5, 85],
    [6, 90],
  ])(
    'S%i: meets exactly the required %i%% threshold',
    (stage, threshold) => {
      const s = withProgress(
        createInitialStageGateState(),
        progress('Q1', stage, threshold),
      );
      expect(canAdvance(s, 'Q1', stage)).toBe(true);
    },
  );

  it.each<[Stage, number]>([
    [1, 99],
    [2, 94.9],
    [3, 89.99],
    [4, 89],
    [5, 84.5],
    [6, 89.5],
  ])(
    'S%i: just-below %i%% does not advance',
    (stage, accuracy) => {
      const s = withProgress(
        createInitialStageGateState(),
        progress('Q1', stage, accuracy),
      );
      expect(canAdvance(s, 'Q1', stage)).toBe(false);
    },
  );

  it('advances when accuracy exceeds threshold', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q3', 5, 99),
    );
    expect(canAdvance(s, 'Q3', 5)).toBe(true);
  });

  it('PROMOTION_THRESHOLDS constants match spec', () => {
    expect(PROMOTION_THRESHOLDS[1]).toBe(100);
    expect(PROMOTION_THRESHOLDS[2]).toBe(95);
    expect(PROMOTION_THRESHOLDS[3]).toBe(90);
    expect(PROMOTION_THRESHOLDS[4]).toBe(90);
    expect(PROMOTION_THRESHOLDS[5]).toBe(85);
    expect(PROMOTION_THRESHOLDS[6]).toBe(90);
  });

  it('PROMOTION_WINDOW is exported (default = 20)', () => {
    expect(PROMOTION_WINDOW).toBe(20);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. shouldDropBack — accuracy bands
// ─────────────────────────────────────────────────────────────────────────────

describe('shouldDropBack', () => {
  it('returns false when no progress recorded', () => {
    const s = createInitialStageGateState();
    expect(shouldDropBack(s, 'Q1', 3, [false, false, false])).toBe(false);
  });

  it('returns false at S1 (cannot drop further)', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 1, 0),
    );
    expect(shouldDropBack(s, 'Q1', 1, [false, false, false])).toBe(false);
  });

  it('returns true when supplied window < 50%', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 4, 60),
    );
    const window = [false, false, false, true]; // 25%
    expect(shouldDropBack(s, 'Q1', 4, window)).toBe(true);
  });

  it('returns false when supplied window ≥ 50%', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 4, 60),
    );
    const window = [true, true, false, false]; // 50%
    expect(shouldDropBack(s, 'Q1', 4, window)).toBe(false);
  });

  it('falls back to stored lastN when supplied window is empty', () => {
    const stored = [false, false, false, false]; // 0%
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 3, 0, stored),
    );
    expect(shouldDropBack(s, 'Q1', 3, [])).toBe(true);
  });

  it('returns false when both supplied AND stored windows are empty', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 3, 0, []),
    );
    expect(shouldDropBack(s, 'Q1', 3, [])).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Escape valve 1: 24h timeout
// ─────────────────────────────────────────────────────────────────────────────

describe('timeoutEscape (escape valve 1)', () => {
  it('does NOT fire under 24h elapsed', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 3, 50, [], NOW - 23 * HOUR),
    );
    const r = timeoutEscape(s, 'Q1', 3, NOW);
    expect(r.triggered).toBe(false);
    expect(r.mixRatio).toBe(0);
  });

  it('fires with 50/50 mix ratio just past 24h', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 3, 50, [], NOW - DAY - 1),
    );
    const r = timeoutEscape(s, 'Q1', 3, NOW);
    expect(r.triggered).toBe(true);
    expect(r.mixRatio).toBe(TIMEOUT_MIX_RATIO);
    expect(r.mixRatio).toBe(0.5);
  });

  it('does not fire when no progress recorded', () => {
    const s = createInitialStageGateState();
    const r = timeoutEscape(s, 'Q1', 3, NOW);
    expect(r.triggered).toBe(false);
  });

  it('does not fire when stage is already completed', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 3, 95, [], NOW - DAY * 5, NOW - DAY * 4),
    );
    const r = timeoutEscape(s, 'Q1', 3, NOW);
    expect(r.triggered).toBe(false);
  });

  it('does not fire when stalledAtMs is 0 (never attempted)', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 3, 50, [], 0),
    );
    const r = timeoutEscape(s, 'Q1', 3, NOW);
    expect(r.triggered).toBe(false);
  });

  it('does not fire at S6 (last stage; caller decides exam-readiness)', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 6, 50, [], NOW - DAY * 3),
    );
    const r = timeoutEscape(s, 'Q1', 6, NOW);
    expect(r.triggered).toBe(false);
  });

  it('TIMEOUT_MS equals 24 hours', () => {
    expect(TIMEOUT_MS).toBe(DAY);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Escape valve 2: difficulty drop
// ─────────────────────────────────────────────────────────────────────────────

describe('easierTypeForStage', () => {
  it('S1 has no easier alternative', () => {
    expect(easierTypeForStage(1)).toBeNull();
  });
  it('S2/S3/S4/S6 fall back to ClozeCard', () => {
    expect(easierTypeForStage(2)).toBe('ClozeCard');
    expect(easierTypeForStage(3)).toBe('ClozeCard');
    expect(easierTypeForStage(4)).toBe('ClozeCard');
    expect(easierTypeForStage(6)).toBe('ClozeCard');
  });
  it('S5 (variations) falls back to DemoCard (read-only)', () => {
    expect(easierTypeForStage(5)).toBe('DemoCard');
  });
});

describe('difficultyEscape (escape valve 2)', () => {
  it('does NOT fire under 3 consecutive fails', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 3, 60),
    );
    expect(difficultyEscape(s, 'Q1', 3, 2).triggered).toBe(false);
  });

  it('fires at exactly 3 consecutive fails on S3', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 3, 60),
    );
    const r = difficultyEscape(s, 'Q1', 3, DIFFICULTY_FAIL_THRESHOLD);
    expect(r.triggered).toBe(true);
    expect(r.easierType).toBe('ClozeCard');
  });

  it('fires above 3 consecutive fails', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 4, 60),
    );
    expect(difficultyEscape(s, 'Q1', 4, 5).triggered).toBe(true);
  });

  it('does NOT fire when no progress recorded', () => {
    const s = createInitialStageGateState();
    expect(difficultyEscape(s, 'Q1', 3, 5).triggered).toBe(false);
  });

  it('does NOT fire on S1 — no easier alternative', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 1, 0),
    );
    const r = difficultyEscape(s, 'Q1', 1, 5);
    expect(r.triggered).toBe(false);
    expect(r.easierType).toBeNull();
  });

  it('returns DemoCard at S5', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 5, 60),
    );
    expect(difficultyEscape(s, 'Q1', 5, 3).easierType).toBe('DemoCard');
  });

  it('DIFFICULTY constants match spec', () => {
    expect(DIFFICULTY_FAIL_THRESHOLD).toBe(3);
    expect(DIFFICULTY_EASIER_BUFFER).toBe(15);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Escape valve 3: cross-track stalemate breaker
// ─────────────────────────────────────────────────────────────────────────────

describe('highestPromotedStage', () => {
  it('returns null when no progress recorded for the qTag', () => {
    const s = createInitialStageGateState();
    expect(highestPromotedStage(s, 'Q1')).toBeNull();
  });

  it('returns the stage when threshold met', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 4, 90), // S4 threshold met
    );
    expect(highestPromotedStage(s, 'Q1')).toBe(4);
  });

  it('returns the stage when completedAt is set even if accuracy below', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 4, 0, [], 0, NOW),
    );
    expect(highestPromotedStage(s, 'Q1')).toBe(4);
  });

  it('returns the highest of multiple promoted stages', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 2, 95),
      progress('Q1', 4, 90),
      progress('Q1', 5, 85),
    );
    expect(highestPromotedStage(s, 'Q1')).toBe(5);
  });

  it('skips stages where threshold is not met', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 2, 95),
      progress('Q1', 3, 50), // not met
      progress('Q1', 4, 50), // not met
    );
    expect(highestPromotedStage(s, 'Q1')).toBe(2);
  });
});

describe('mockUnlock (escape valve 3)', () => {
  const ALL_QS: readonly QTag[] = ['Q1', 'Q2', 'Q3', 'Q4'];

  it('returns "none" when no Q-tracks have any progress', () => {
    const s = createInitialStageGateState();
    const r = mockUnlock(s, ALL_QS);
    expect(r.canDo).toBe('none');
  });

  it('returns "none" when allQTags is empty', () => {
    const s = createInitialStageGateState();
    const r = mockUnlock(s, []);
    expect(r.canDo).toBe('none');
    expect(r.reason).toMatch(/no Q-tracks/i);
  });

  it('returns "none" when only 2 of 4 tracks at S4+', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 4, 90),
      progress('Q2', 4, 90),
      progress('Q3', 2, 95),
      progress('Q4', 1, 100),
    );
    const r = mockUnlock(s, ALL_QS);
    expect(r.canDo).toBe('none');
  });

  it('returns "partial" with 3 of 4 at S4+ (the spec example)', () => {
    // Q1 stuck at S2, Q2 at S5, Q3 at S4, Q4 at S4 → 3 of 4 at S4+ → partial
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 2, 95), // promoted to S2 only
      progress('Q2', 5, 85),
      progress('Q3', 4, 90),
      progress('Q4', 4, 90),
    );
    const r = mockUnlock(s, ALL_QS);
    expect(r.canDo).toBe('partial');
    expect(r.reason).toMatch(/lenient/i);
  });

  it('returns "full" when all 4 at S5+', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 5, 85),
      progress('Q2', 5, 85),
      progress('Q3', 5, 85),
      progress('Q4', 5, 85),
    );
    const r = mockUnlock(s, ALL_QS);
    expect(r.canDo).toBe('full');
  });

  it('full beats partial: 3 at S5 + 1 at S4 → still partial (not full)', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 5, 85),
      progress('Q2', 5, 85),
      progress('Q3', 5, 85),
      progress('Q4', 4, 90),
    );
    const r = mockUnlock(s, ALL_QS);
    expect(r.canDo).toBe('partial');
  });

  it('CROSSTRACK constants match spec', () => {
    expect(CROSSTRACK_LENIENT_THRESHOLD).toBe(3);
    expect(CROSSTRACK_READY_STAGE).toBe(4);
    expect(CROSSTRACK_FULL_STAGE).toBe(5);
  });

  it('honours subset Q-tag list', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 5, 85),
      progress('Q2', 5, 85),
    );
    const r = mockUnlock(s, ['Q1', 'Q2']);
    expect(r.canDo).toBe('full');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Escape valve 4: manual override
// ─────────────────────────────────────────────────────────────────────────────

describe('manualOverride (escape valve 4)', () => {
  const s = createInitialStageGateState();

  it('allows forward jump and emits cost warning', () => {
    const r = manualOverride(s, 'Q1', 2, 5);
    expect(r.allowed).toBe(true);
    // Warning includes from/to + bypassed thresholds
    expect(r.costWarning).toMatch(/S2/);
    expect(r.costWarning).toMatch(/S5/);
    expect(r.costWarning).toMatch(/95%/);
    expect(r.costWarning).toMatch(/90%/);
  });

  it('rejects backward jump (use failure-recovery)', () => {
    const r = manualOverride(s, 'Q1', 4, 2);
    expect(r.allowed).toBe(false);
    expect(r.costWarning).toMatch(/forward-only/i);
  });

  it('rejects same-stage no-op', () => {
    const r = manualOverride(s, 'Q1', 3, 3);
    expect(r.allowed).toBe(false);
  });

  it('rejects out-of-range stages', () => {
    const r1 = manualOverride(s, 'Q1', 0 as Stage, 3);
    expect(r1.allowed).toBe(false);
    const r2 = manualOverride(s, 'Q1', 3, 7 as Stage);
    expect(r2.allowed).toBe(false);
  });

  it('rejects non-integer stages', () => {
    const r = manualOverride(s, 'Q1', 1.5 as unknown as Stage, 3);
    expect(r.allowed).toBe(false);
  });

  it('lists every bypassed threshold in warning', () => {
    const r = manualOverride(s, 'Q1', 1, 6);
    expect(r.costWarning).toMatch(/S1.*100%/);
    expect(r.costWarning).toMatch(/S2.*95%/);
    expect(r.costWarning).toMatch(/S3.*90%/);
    expect(r.costWarning).toMatch(/S4.*90%/);
    expect(r.costWarning).toMatch(/S5.*85%/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. evaluateStage — composite decision precedence
// ─────────────────────────────────────────────────────────────────────────────

describe('evaluateStage', () => {
  it('returns ADVANCE when threshold met', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 3, 90),
    );
    const d = evaluateStage(s, 'Q1', 3, [true, true, true], NOW);
    expect(d.action).toBe('ADVANCE');
    expect(d.from).toBe(3);
    expect(d.to).toBe(4);
  });

  it('AUTO_PROMOTE wins over STAY when timeout elapsed', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 3, 50, [], NOW - DAY * 2),
    );
    const d = evaluateStage(s, 'Q1', 3, [true, true], NOW);
    expect(d.action).toBe('AUTO_PROMOTE');
    expect(d.to).toBe(4);
    expect(d.reason).toMatch(/24h/);
  });

  it('SWITCH_TYPE fires on 3 consecutive fails', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 3, 60),
    );
    const d = evaluateStage(
      s,
      'Q1',
      3,
      [true, false, false, false],
      NOW,
    );
    expect(d.action).toBe('SWITCH_TYPE');
    expect(d.to).toBe(3);
    expect(d.reason).toMatch(/ClozeCard/);
  });

  it('DROP_BACK fires when window < 50%', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 4, 40),
    );
    // 1 correct, 3 wrong but with a true at the tail so trailing-fail = 0
    // (so difficulty escape doesn't fire). Window accuracy 25%, drop fires.
    const d = evaluateStage(
      s,
      'Q1',
      4,
      [false, false, false, true],
      NOW,
    );
    expect(d.action).toBe('DROP_BACK');
    expect(d.to).toBe(3);
  });

  it('STAY when below threshold but no escape valve fires', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 3, 80),
    );
    const d = evaluateStage(
      s,
      'Q1',
      3,
      [true, true, true, false], // 75%, 1-trailing-fail < 3
      NOW,
    );
    expect(d.action).toBe('STAY');
  });

  it('clamps stage transitions at S6 ceiling', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 6, 90),
    );
    const d = evaluateStage(s, 'Q1', 6, [true, true], NOW);
    expect(d.action).toBe('ADVANCE');
    expect(d.to).toBe(6); // clamped
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. failure-recovery — every spec-table band
// ─────────────────────────────────────────────────────────────────────────────

describe('failureAction (failure-recovery spec table)', () => {
  it('≥ 85% → ADVANCE', () => {
    expect(failureAction(85, 3)).toBe('ADVANCE');
    expect(failureAction(100, 3)).toBe('ADVANCE');
    expect(failureAction(85.000001, 3)).toBe('ADVANCE');
  });

  it('70..84.99% → STAY', () => {
    expect(failureAction(70, 3)).toBe('STAY');
    expect(failureAction(84.99, 3)).toBe('STAY');
    expect(failureAction(78, 3)).toBe('STAY');
  });

  it('50..69.99% → STAY_EASIER_CARDS', () => {
    expect(failureAction(50, 3)).toBe('STAY_EASIER_CARDS');
    expect(failureAction(69.99, 3)).toBe('STAY_EASIER_CARDS');
    expect(failureAction(60, 3)).toBe('STAY_EASIER_CARDS');
  });

  it('30..49.99% → DROP_1_STAGE', () => {
    expect(failureAction(30, 3)).toBe('DROP_1_STAGE');
    expect(failureAction(49.99, 3)).toBe('DROP_1_STAGE');
    expect(failureAction(40, 3)).toBe('DROP_1_STAGE');
  });

  it('< 30% → DROP_2_STAGES_INJECT_PREREQ', () => {
    expect(failureAction(29.99, 3)).toBe('DROP_2_STAGES_INJECT_PREREQ');
    expect(failureAction(0, 3)).toBe('DROP_2_STAGES_INJECT_PREREQ');
    expect(failureAction(-5, 3)).toBe('DROP_2_STAGES_INJECT_PREREQ');
  });

  it('clamps NaN/Infinity to safe defaults', () => {
    // Per clampPercent: any non-finite or negative input → 0 (defensive:
    // garbage in shouldn't accidentally promote a student).
    expect(failureAction(NaN, 3)).toBe('DROP_2_STAGES_INJECT_PREREQ');
    expect(failureAction(Infinity, 3)).toBe('DROP_2_STAGES_INJECT_PREREQ');
    expect(failureAction(-Infinity, 3)).toBe('DROP_2_STAGES_INJECT_PREREQ');
  });

  it('action does not depend on stage value', () => {
    for (const stage of [1, 2, 3, 4, 5, 6] as Stage[]) {
      expect(failureAction(60, stage)).toBe('STAY_EASIER_CARDS');
    }
  });

  it('FAILURE_THRESHOLDS constants match spec', () => {
    expect(FAILURE_THRESHOLDS.advance).toBe(85);
    expect(FAILURE_THRESHOLDS.stay).toBe(70);
    expect(FAILURE_THRESHOLDS.stayEasier).toBe(50);
    expect(FAILURE_THRESHOLDS.drop1).toBe(30);
  });
});

describe('failureOutcome', () => {
  it('ADVANCE returns next stage, no alert', () => {
    const r = failureOutcome(90, 3);
    expect(r.action).toBe('ADVANCE');
    expect(r.toStage).toBe(4);
    expect(r.alert).toBe('');
  });

  it('ADVANCE clamps at S6 ceiling', () => {
    const r = failureOutcome(95, 6);
    expect(r.toStage).toBe(6);
  });

  it('STAY keeps current stage', () => {
    const r = failureOutcome(75, 4);
    expect(r.action).toBe('STAY');
    expect(r.toStage).toBe(4);
  });

  it('STAY_EASIER_CARDS keeps current stage', () => {
    const r = failureOutcome(55, 4);
    expect(r.action).toBe('STAY_EASIER_CARDS');
    expect(r.toStage).toBe(4);
  });

  it('DROP_1_STAGE drops to stage - 1', () => {
    const r = failureOutcome(35, 4);
    expect(r.action).toBe('DROP_1_STAGE');
    expect(r.toStage).toBe(3);
  });

  it('DROP_2_STAGES drops to stage - 2 with paper-practice alert', () => {
    const r = failureOutcome(10, 4);
    expect(r.action).toBe('DROP_2_STAGES_INJECT_PREREQ');
    expect(r.toStage).toBe(2);
    expect(r.alert).toBe(PAPER_PRACTICE_ALERT);
    expect(r.alert).toBe('concept needs paper practice');
  });

  it('DROP_2_STAGES from S2 clamps at S1 floor', () => {
    const r = failureOutcome(5, 2);
    expect(r.toStage).toBe(1);
    expect(r.alert).toBe(PAPER_PRACTICE_ALERT);
  });

  it('DROP_1_STAGE from S1 clamps at S1 floor', () => {
    const r = failureOutcome(35, 1);
    expect(r.toStage).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. Edge cases
// ─────────────────────────────────────────────────────────────────────────────

describe('edge cases', () => {
  it('NaN stalledAtMs does not crash timeoutEscape', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 3, 50, [], NaN),
    );
    const r = timeoutEscape(s, 'Q1', 3, NOW);
    // NaN <= 0 is false, but NaN comparisons all return false → so the
    // > TIMEOUT_MS branch sees `NOW - NaN = NaN` which is not > anything →
    // returns triggered=false. Either way, no crash.
    expect(r.triggered).toBe(false);
  });

  it('mockUnlock with one Q-track only — full when all promoted', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 5, 85),
    );
    const r = mockUnlock(s, ['Q1']);
    expect(r.canDo).toBe('full');
  });

  it('mockUnlock with one Q-track — none when below S4', () => {
    const s = withProgress(
      createInitialStageGateState(),
      progress('Q1', 2, 95),
    );
    const r = mockUnlock(s, ['Q1']);
    expect(r.canDo).toBe('none');
  });

  it('manualOverride from S5 → S6 names only S5 threshold', () => {
    const r = manualOverride(
      createInitialStageGateState(),
      'Q1',
      5,
      6,
    );
    expect(r.allowed).toBe(true);
    expect(r.costWarning).toMatch(/S5.*85%/);
  });
});
