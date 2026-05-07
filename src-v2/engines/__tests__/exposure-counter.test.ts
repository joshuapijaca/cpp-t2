/**
 * Exposure-Frequency Engine — exhaustive unit tests
 *
 * Per RULE 4: counter math MUST be right. Bugs here = quality death.
 * Coverage target: 100% lines on exposure-counter.ts + multi-q-propagation.ts.
 *
 * Test categories:
 *   1. State construction + registration
 *   2. recordCardResult (correct, wrong, immutability)
 *   3. State machine (NEW → IN-PROGRESS → FAMILIAR)
 *   4. Retirement criteria (target + last-3-correct)
 *   5. Atom + Q-track familiarity math
 *   6. Multi-Q propagation (one drill, many tracks)
 *   7. Coverage ranking
 *   8. Stress test: 1000 random ops, invariants hold
 *   9. Edge cases (empty session, unregistered cards, drift detection)
 */

import { describe, expect, it } from 'vitest';
import {
  EXPOSURE_TARGETS,
  RETIRE_WINDOW,
  createInitialState,
  getAllAtomFamiliarities,
  getAllQTrackFamiliarities,
  getAtomFamiliarity,
  getCardStatus,
  getQTrackFamiliarity,
  recordCardResult,
  registerCard,
  registerCards,
  shouldRetire,
  type CardLength,
  type CardMeta,
  type SessionState,
} from '../exposure-counter.ts';
import {
  propagateExposure,
  rankCardsByCoverage,
  tracksLeakingTo,
  tracksLeakingToFromCards,
} from '../multi-q-propagation.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Test fixtures
// ─────────────────────────────────────────────────────────────────────────────

function meta(
  cardId: string,
  atomId: string,
  qTags: readonly string[] = [],
  length: CardLength = 'short',
): CardMeta {
  return { cardId, atomId, qTags, length };
}

function regAll(state: SessionState, ms: readonly CardMeta[]): SessionState {
  return registerCards(state, ms);
}

function recordN(
  state: SessionState,
  cardId: string,
  results: readonly boolean[],
): SessionState {
  let s = state;
  for (let i = 0; i < results.length; i++) {
    s = recordCardResult(s, cardId, results[i] as boolean);
  }
  return s;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Construction + registration
// ─────────────────────────────────────────────────────────────────────────────

describe('createInitialState', () => {
  it('returns an empty session', () => {
    const s = createInitialState();
    expect(s.cards).toEqual({});
    expect(s.exposures).toEqual({});
    expect(s.atomToCards).toEqual({});
    expect(s.qToAtoms).toEqual({});
    expect(s.seq).toBe(0);
  });
});

describe('registerCard', () => {
  it('adds card to cards index', () => {
    const s = registerCard(createInitialState(), meta('c1', 'A1'));
    expect(s.cards['c1']?.cardId).toBe('c1');
    expect(s.atomToCards['A1']).toEqual(['c1']);
  });

  it('indexes Q-tags', () => {
    const s = registerCard(
      createInitialState(),
      meta('c1', 'A1', ['Q1', 'Q4']),
    );
    expect(s.qToAtoms['Q1']).toEqual(['A1']);
    expect(s.qToAtoms['Q4']).toEqual(['A1']);
  });

  it('does not duplicate atom in qToAtoms when two cards on same atom share tag', () => {
    let s = createInitialState();
    s = registerCard(s, meta('c1', 'A1', ['Q1']));
    s = registerCard(s, meta('c2', 'A1', ['Q1']));
    expect(s.qToAtoms['Q1']).toEqual(['A1']);
    expect(s.atomToCards['A1']).toEqual(['c1', 'c2']);
  });

  it('is idempotent for identical re-registration', () => {
    let s = registerCard(createInitialState(), meta('c1', 'A1', ['Q1'], 'short'));
    s = registerCard(s, meta('c1', 'A1', ['Q1'], 'short'));
    expect(Object.keys(s.cards)).toHaveLength(1);
  });

  it('is order-independent for tags when checking idempotency', () => {
    let s = registerCard(createInitialState(), meta('c1', 'A1', ['Q1', 'Q4']));
    s = registerCard(s, meta('c1', 'A1', ['Q4', 'Q1']));
    expect(Object.keys(s.cards)).toHaveLength(1);
  });

  it('throws on registration drift (different atom)', () => {
    const s = registerCard(createInitialState(), meta('c1', 'A1'));
    expect(() => registerCard(s, meta('c1', 'A2'))).toThrow(/drift/);
  });

  it('throws on registration drift (different length)', () => {
    const s = registerCard(createInitialState(), meta('c1', 'A1', [], 'short'));
    expect(() => registerCard(s, meta('c1', 'A1', [], 'long'))).toThrow(/drift/);
  });

  it('throws on registration drift (different tags)', () => {
    const s = registerCard(createInitialState(), meta('c1', 'A1', ['Q1']));
    expect(() => registerCard(s, meta('c1', 'A1', ['Q1', 'Q2']))).toThrow(
      /drift/,
    );
  });

  it('does not mutate input state', () => {
    const s = createInitialState();
    const snapshot = JSON.stringify(s);
    registerCard(s, meta('c1', 'A1'));
    expect(JSON.stringify(s)).toBe(snapshot);
  });
});

describe('registerCards', () => {
  it('folds many registrations', () => {
    const s = registerCards(createInitialState(), [
      meta('c1', 'A1'),
      meta('c2', 'A1'),
      meta('c3', 'A2', ['Q1']),
    ]);
    expect(Object.keys(s.cards)).toHaveLength(3);
    expect(s.atomToCards['A1']).toEqual(['c1', 'c2']);
    expect(s.qToAtoms['Q1']).toEqual(['A2']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. recordCardResult basics
// ─────────────────────────────────────────────────────────────────────────────

describe('recordCardResult — basics', () => {
  it('throws on unregistered card', () => {
    expect(() => recordCardResult(createInitialState(), 'ghost', true)).toThrow(
      /unknown cardId=ghost/,
    );
  });

  it('NEW card starts at 0/target', () => {
    const s = registerCard(createInitialState(), meta('c1', 'A1', [], 'short'));
    expect(getCardStatus(s, 'c1')).toBe('NEW');
    expect(getAtomFamiliarity(s, 'A1').percent).toBe(0);
    expect(getAtomFamiliarity(s, 'A1').target).toBe(EXPOSURE_TARGETS.short);
  });

  it('correct exposure increments correctCount AND exposureCount', () => {
    let s = registerCard(createInitialState(), meta('c1', 'A1'));
    s = recordCardResult(s, 'c1', true);
    expect(s.exposures['c1']?.exposureCount).toBe(1);
    expect(s.exposures['c1']?.correctCount).toBe(1);
  });

  it('wrong exposure increments only exposureCount', () => {
    let s = registerCard(createInitialState(), meta('c1', 'A1'));
    s = recordCardResult(s, 'c1', false);
    expect(s.exposures['c1']?.exposureCount).toBe(1);
    expect(s.exposures['c1']?.correctCount).toBe(0);
  });

  it('appends result to lastNResults (capped to RETIRE_WINDOW)', () => {
    let s = registerCard(createInitialState(), meta('c1', 'A1'));
    for (let i = 0; i < RETIRE_WINDOW + 2; i++) {
      s = recordCardResult(s, 'c1', i % 2 === 0);
    }
    expect(s.exposures['c1']?.lastNResults.length).toBe(RETIRE_WINDOW);
  });

  it('first exposure sets firstExposedAt and lastExposedAt', () => {
    let s = registerCard(createInitialState(), meta('c1', 'A1'));
    s = recordCardResult(s, 'c1', true, 1000);
    expect(s.exposures['c1']?.firstExposedAt).toBe(1000);
    expect(s.exposures['c1']?.lastExposedAt).toBe(1000);
  });

  it('subsequent exposures update lastExposedAt only', () => {
    let s = registerCard(createInitialState(), meta('c1', 'A1'));
    s = recordCardResult(s, 'c1', true, 1000);
    s = recordCardResult(s, 'c1', true, 5000);
    expect(s.exposures['c1']?.firstExposedAt).toBe(1000);
    expect(s.exposures['c1']?.lastExposedAt).toBe(5000);
  });

  it('uses Date.now() default when timestamp omitted', () => {
    let s = registerCard(createInitialState(), meta('c1', 'A1'));
    const before = Date.now();
    s = recordCardResult(s, 'c1', true);
    const after = Date.now();
    const ts = s.exposures['c1']?.firstExposedAt ?? 0;
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });

  it('increments seq monotonically', () => {
    let s = registerCard(createInitialState(), meta('c1', 'A1'));
    s = recordCardResult(s, 'c1', true);
    expect(s.seq).toBe(1);
    s = recordCardResult(s, 'c1', false);
    expect(s.seq).toBe(2);
  });

  it('does not mutate input state', () => {
    const base = registerCard(createInitialState(), meta('c1', 'A1'));
    const snapshot = JSON.stringify(base);
    recordCardResult(base, 'c1', true);
    expect(JSON.stringify(base)).toBe(snapshot);
  });

  it('does not mutate the previous exposure object', () => {
    let s = registerCard(createInitialState(), meta('c1', 'A1'));
    s = recordCardResult(s, 'c1', true);
    const ref = s.exposures['c1'];
    const snap = JSON.stringify(ref);
    recordCardResult(s, 'c1', false);
    expect(JSON.stringify(ref)).toBe(snap);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. State machine
// ─────────────────────────────────────────────────────────────────────────────

describe('state machine', () => {
  it('NEW → IN-PROGRESS on first exposure', () => {
    let s = registerCard(createInitialState(), meta('c1', 'A1', [], 'short'));
    expect(getCardStatus(s, 'c1')).toBe('NEW');
    s = recordCardResult(s, 'c1', false);
    expect(getCardStatus(s, 'c1')).toBe('IN-PROGRESS');
  });

  it('IN-PROGRESS → FAMILIAR when target met AND last RETIRE_WINDOW correct', () => {
    let s = registerCard(createInitialState(), meta('c1', 'A1', [], 'short'));
    const target = EXPOSURE_TARGETS.short;
    // pad with wrongs so we don't accidentally retire early
    for (let i = 0; i < target - RETIRE_WINDOW; i++) {
      s = recordCardResult(s, 'c1', false);
    }
    for (let i = 0; i < RETIRE_WINDOW; i++) {
      s = recordCardResult(s, 'c1', true);
      if (i < RETIRE_WINDOW - 1) {
        expect(getCardStatus(s, 'c1')).toBe('IN-PROGRESS');
      }
    }
    expect(getCardStatus(s, 'c1')).toBe('FAMILIAR');
  });

  it('FAMILIAR is terminal (no demotion on subsequent wrongs)', () => {
    let s = registerCard(createInitialState(), meta('c1', 'A1', [], 'short'));
    for (let i = 0; i < EXPOSURE_TARGETS.short; i++) {
      s = recordCardResult(s, 'c1', true);
    }
    expect(getCardStatus(s, 'c1')).toBe('FAMILIAR');
    s = recordCardResult(s, 'c1', false);
    expect(getCardStatus(s, 'c1')).toBe('FAMILIAR');
    s = recordCardResult(s, 'c1', false);
    expect(getCardStatus(s, 'c1')).toBe('FAMILIAR');
  });

  it('exposureCount alone is not enough — needs last-N-correct', () => {
    let s = registerCard(createInitialState(), meta('c1', 'A1', [], 'short'));
    // exposureCount hits target via wrongs
    for (let i = 0; i < EXPOSURE_TARGETS.short; i++) {
      s = recordCardResult(s, 'c1', false);
    }
    expect(getCardStatus(s, 'c1')).toBe('IN-PROGRESS');
  });

  it('last-N-correct alone is not enough — needs target', () => {
    let s = registerCard(createInitialState(), meta('c1', 'A1', [], 'long'));
    // 3 corrects but exposureCount=3 < target=12
    for (let i = 0; i < RETIRE_WINDOW; i++) {
      s = recordCardResult(s, 'c1', true);
    }
    expect(getCardStatus(s, 'c1')).toBe('IN-PROGRESS');
    expect(shouldRetire(s, 'c1')).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. shouldRetire
// ─────────────────────────────────────────────────────────────────────────────

describe('shouldRetire', () => {
  it('returns false for unregistered cards', () => {
    expect(shouldRetire(createInitialState(), 'ghost')).toBe(false);
  });

  it('returns false for NEW cards', () => {
    const s = registerCard(createInitialState(), meta('c1', 'A1'));
    expect(shouldRetire(s, 'c1')).toBe(false);
  });

  it('returns true exactly when target met AND last RETIRE_WINDOW correct', () => {
    let s = registerCard(createInitialState(), meta('c1', 'A1', [], 'short'));
    const target = EXPOSURE_TARGETS.short;
    for (let i = 0; i < target - 1; i++) {
      s = recordCardResult(s, 'c1', true);
    }
    // exposureCount = target-1 < target → not yet retired
    expect(shouldRetire(s, 'c1')).toBe(false);
    s = recordCardResult(s, 'c1', true);
    // exposureCount = target AND last 3 correct → retired
    expect(shouldRetire(s, 'c1')).toBe(true);
  });

  it('respects per-length targets', () => {
    let s = createInitialState();
    s = registerCard(s, meta('cs', 'A1', [], 'short'));
    s = registerCard(s, meta('cm', 'A2', [], 'medium'));
    s = registerCard(s, meta('cl', 'A3', [], 'long'));
    for (let i = 0; i < EXPOSURE_TARGETS.short; i++) {
      s = recordCardResult(s, 'cs', true);
    }
    expect(shouldRetire(s, 'cs')).toBe(true);
    for (let i = 0; i < EXPOSURE_TARGETS.short; i++) {
      s = recordCardResult(s, 'cm', true);
    }
    expect(shouldRetire(s, 'cm')).toBe(false);
    for (let i = 0; i < EXPOSURE_TARGETS.medium - EXPOSURE_TARGETS.short; i++) {
      s = recordCardResult(s, 'cm', true);
    }
    expect(shouldRetire(s, 'cm')).toBe(true);
    for (let i = 0; i < EXPOSURE_TARGETS.long - 1; i++) {
      s = recordCardResult(s, 'cl', true);
    }
    expect(shouldRetire(s, 'cl')).toBe(false);
    s = recordCardResult(s, 'cl', true);
    expect(shouldRetire(s, 'cl')).toBe(true);
  });

  it('one wrong in the trailing window blocks retirement', () => {
    let s = registerCard(createInitialState(), meta('c1', 'A1', [], 'short'));
    const target = EXPOSURE_TARGETS.short;
    for (let i = 0; i < target - 2; i++) {
      s = recordCardResult(s, 'c1', true);
    }
    // last 3 = correct, wrong, correct — should NOT retire
    s = recordCardResult(s, 'c1', false);
    s = recordCardResult(s, 'c1', true);
    expect(shouldRetire(s, 'c1')).toBe(false);
    // now last 3 = wrong, correct, correct — still not all correct
    s = recordCardResult(s, 'c1', true);
    expect(shouldRetire(s, 'c1')).toBe(false);
    // now last 3 = correct, correct, correct
    s = recordCardResult(s, 'c1', true);
    expect(shouldRetire(s, 'c1')).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Atom + Q-track familiarity
// ─────────────────────────────────────────────────────────────────────────────

describe('getAtomFamiliarity', () => {
  it('zero target for empty atom', () => {
    const f = getAtomFamiliarity(createInitialState(), 'unknown');
    expect(f.target).toBe(0);
    expect(f.percent).toBe(0);
  });

  it('sums per-card targets', () => {
    let s = createInitialState();
    s = registerCard(s, meta('c1', 'A1', [], 'short')); // 6
    s = registerCard(s, meta('c2', 'A1', [], 'medium')); // 8
    s = registerCard(s, meta('c3', 'A1', [], 'long')); // 12
    expect(getAtomFamiliarity(s, 'A1').target).toBe(6 + 8 + 12);
  });

  it('percent = round(correctExposures / target * 100), capped at 100', () => {
    let s = createInitialState();
    s = registerCard(s, meta('c1', 'A1', [], 'short')); // target 6
    for (let i = 0; i < 3; i++) s = recordCardResult(s, 'c1', true);
    // 3/6 = 50%
    expect(getAtomFamiliarity(s, 'A1').percent).toBe(50);
  });

  it('caps percent at 100 even if correctCount > target (defensive)', () => {
    let s = createInitialState();
    s = registerCard(s, meta('c1', 'A1', [], 'short')); // target 6
    for (let i = 0; i < 10; i++) s = recordCardResult(s, 'c1', true);
    expect(getAtomFamiliarity(s, 'A1').percent).toBe(100);
  });

  it('totalExposures includes wrongs', () => {
    let s = createInitialState();
    s = registerCard(s, meta('c1', 'A1'));
    s = recordCardResult(s, 'c1', false);
    s = recordCardResult(s, 'c1', false);
    s = recordCardResult(s, 'c1', true);
    const f = getAtomFamiliarity(s, 'A1');
    expect(f.totalExposures).toBe(3);
    expect(f.correctExposures).toBe(1);
  });
});

describe('getQTrackFamiliarity', () => {
  it('zero for unknown Q-tag', () => {
    const f = getQTrackFamiliarity(createInitialState(), 'Q9');
    expect(f.percent).toBe(0);
    expect(f.atoms).toEqual([]);
  });

  it('mean of atom percents', () => {
    let s = createInitialState();
    s = registerCard(s, meta('c1', 'A1', ['Q1'], 'short')); // target 6
    s = registerCard(s, meta('c2', 'A2', ['Q1'], 'short')); // target 6
    // A1 → 3/6 = 50%
    for (let i = 0; i < 3; i++) s = recordCardResult(s, 'c1', true);
    // A2 → 6/6 = 100%
    for (let i = 0; i < 6; i++) s = recordCardResult(s, 'c2', true);
    const f = getQTrackFamiliarity(s, 'Q1');
    expect(f.percent).toBe(75); // (50 + 100) / 2
  });

  it('buckets atoms-at-100 and atoms-below-50', () => {
    let s = createInitialState();
    s = registerCard(s, meta('c1', 'A1', ['Q1'], 'short')); // target 6
    s = registerCard(s, meta('c2', 'A2', ['Q1'], 'short')); // target 6
    s = registerCard(s, meta('c3', 'A3', ['Q1'], 'short')); // target 6
    for (let i = 0; i < 6; i++) s = recordCardResult(s, 'c1', true); // 100
    s = recordCardResult(s, 'c2', true); // ~17 → below 50
    for (let i = 0; i < 4; i++) s = recordCardResult(s, 'c3', true); // ~67
    const f = getQTrackFamiliarity(s, 'Q1');
    expect(f.atomsAt100).toEqual(['A1']);
    expect(f.atomsBelow50).toEqual(['A2']);
  });
});

describe('getAllAtomFamiliarities + getAllQTrackFamiliarities', () => {
  it('returns one entry per registered atom / Q', () => {
    let s = createInitialState();
    s = regAll(s, [
      meta('c1', 'A1', ['Q1']),
      meta('c2', 'A2', ['Q1', 'Q2']),
      meta('c3', 'A3', ['Q2']),
    ]);
    const atoms = getAllAtomFamiliarities(s);
    expect(atoms.map((a) => a.atomId).sort()).toEqual(['A1', 'A2', 'A3']);
    const qs = getAllQTrackFamiliarities(s);
    expect(qs.map((q) => q.qTag).sort()).toEqual(['Q1', 'Q2']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Multi-Q propagation
// ─────────────────────────────────────────────────────────────────────────────

describe('propagateExposure', () => {
  it('lifts every tagged Q-track simultaneously', () => {
    let s = createInitialState();
    s = registerCard(s, meta('c1', 'A1', ['Q1', 'Q4'], 'short')); // target 6
    for (let i = 0; i < 6; i++) {
      s = propagateExposure(s, 'c1', ['Q1', 'Q4'], true);
    }
    expect(getQTrackFamiliarity(s, 'Q1').percent).toBe(100);
    expect(getQTrackFamiliarity(s, 'Q4').percent).toBe(100);
  });

  it('throws on unknown card', () => {
    expect(() =>
      propagateExposure(createInitialState(), 'ghost', ['Q1'], true),
    ).toThrow(/unknown cardId=ghost/);
  });

  it('throws on qTag drift (mismatched supplied vs registered)', () => {
    let s = registerCard(createInitialState(), meta('c1', 'A1', ['Q1', 'Q4']));
    expect(() => propagateExposure(s, 'c1', ['Q1'], true)).toThrow(/drift/);
    expect(() => propagateExposure(s, 'c1', ['Q1', 'Q3'], true)).toThrow(
      /drift/,
    );
  });

  it('order-independent qTag check', () => {
    let s = registerCard(createInitialState(), meta('c1', 'A1', ['Q1', 'Q4']));
    expect(() => propagateExposure(s, 'c1', ['Q4', 'Q1'], true)).not.toThrow();
  });

  it('empty qTags array opts out of drift assertion', () => {
    let s = registerCard(createInitialState(), meta('c1', 'A1', ['Q1', 'Q4']));
    expect(() => propagateExposure(s, 'c1', [], true)).not.toThrow();
  });

  it('passes timestamp through to recordCardResult', () => {
    let s = registerCard(createInitialState(), meta('c1', 'A1', ['Q1']));
    s = propagateExposure(s, 'c1', ['Q1'], true, 12345);
    expect(s.exposures['c1']?.firstExposedAt).toBe(12345);
  });

  it('does not mutate input state', () => {
    const base = registerCard(createInitialState(), meta('c1', 'A1', ['Q1']));
    const snap = JSON.stringify(base);
    propagateExposure(base, 'c1', ['Q1'], true);
    expect(JSON.stringify(base)).toBe(snap);
  });
});

describe('tracksLeakingTo', () => {
  it('returns the card qTag set', () => {
    const s = registerCard(createInitialState(), meta('c1', 'A1', ['Q1', 'Q4']));
    const set = tracksLeakingTo('c1', s);
    expect(set.has('Q1')).toBe(true);
    expect(set.has('Q4')).toBe(true);
    expect(set.size).toBe(2);
  });

  it('returns empty set for unknown card', () => {
    const set = tracksLeakingTo('ghost', createInitialState());
    expect(set.size).toBe(0);
  });

  it('returns a fresh Set (no internal leak)', () => {
    const s = registerCard(createInitialState(), meta('c1', 'A1', ['Q1']));
    const a = tracksLeakingTo('c1', s);
    const b = tracksLeakingTo('c1', s);
    expect(a).not.toBe(b);
  });
});

describe('tracksLeakingToFromCards', () => {
  it('finds card from flat array', () => {
    const set = tracksLeakingToFromCards('c1', [
      { cardId: 'c1', qTags: ['Q1', 'Q4'] },
      { cardId: 'c2', qTags: ['Q2'] },
    ]);
    expect(set.has('Q1')).toBe(true);
    expect(set.has('Q4')).toBe(true);
  });

  it('returns empty set when missing', () => {
    expect(
      tracksLeakingToFromCards('ghost', [{ cardId: 'c1', qTags: ['Q1'] }]).size,
    ).toBe(0);
  });
});

describe('rankCardsByCoverage', () => {
  it('ranks by number of target Q-tracks lifted', () => {
    let s = createInitialState();
    s = regAll(s, [
      meta('c1', 'A1', ['Q1']),
      meta('c2', 'A2', ['Q1', 'Q2']),
      meta('c3', 'A3', ['Q1', 'Q2', 'Q4']),
    ]);
    const ranked = rankCardsByCoverage(
      s,
      ['c1', 'c2', 'c3'],
      ['Q1', 'Q2', 'Q4'],
    );
    expect(ranked.map((r) => r.cardId)).toEqual(['c3', 'c2', 'c1']);
    expect(ranked[0]?.coverage).toBe(3);
    expect(ranked[2]?.coverage).toBe(1);
  });

  it('drops cards with zero coverage', () => {
    let s = createInitialState();
    s = regAll(s, [
      meta('c1', 'A1', ['Q9']), // not in target list
      meta('c2', 'A2', ['Q1']),
    ]);
    const ranked = rankCardsByCoverage(s, ['c1', 'c2'], ['Q1', 'Q2']);
    expect(ranked.map((r) => r.cardId)).toEqual(['c2']);
  });

  it('breaks ties by candidate order (stable)', () => {
    let s = createInitialState();
    s = regAll(s, [
      meta('a', 'A1', ['Q1']),
      meta('b', 'A2', ['Q1']),
      meta('c', 'A3', ['Q1']),
    ]);
    const ranked = rankCardsByCoverage(s, ['b', 'a', 'c'], ['Q1']);
    expect(ranked.map((r) => r.cardId)).toEqual(['b', 'a', 'c']);
  });

  it('skips unregistered candidates silently', () => {
    let s = createInitialState();
    s = regAll(s, [meta('c1', 'A1', ['Q1'])]);
    const ranked = rankCardsByCoverage(s, ['ghost', 'c1'], ['Q1']);
    expect(ranked).toHaveLength(1);
  });

  it('reports the actual lifted Q-tracks', () => {
    let s = createInitialState();
    s = regAll(s, [meta('c1', 'A1', ['Q1', 'Q3', 'Q4'])]);
    const ranked = rankCardsByCoverage(s, ['c1'], ['Q1', 'Q4', 'Q5']);
    expect(ranked[0]?.lifts.slice().sort()).toEqual(['Q1', 'Q4']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Stress test — invariants hold over 1000 random ops
// ─────────────────────────────────────────────────────────────────────────────

describe('stress test — 1000 iterations, invariants hold', () => {
  it('counter math invariants hold across random operations', () => {
    // Deterministic LCG (no Math.random — reproducible failures)
    let seed = 0xC0FFEE;
    const rng = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 0xffffffff;
    };

    let s = createInitialState();
    const cards: CardMeta[] = [];
    const lengths: CardLength[] = ['short', 'medium', 'long'];
    const qPool = ['Q1', 'Q2', 'Q3', 'Q4'];

    // Register 50 cards across 10 atoms with random multi-Q tags
    for (let i = 0; i < 50; i++) {
      const atomIdx = i % 10;
      const lenIdx = Math.floor(rng() * 3);
      const qCount = 1 + Math.floor(rng() * 3); // 1..3 tags
      const tags = new Set<string>();
      while (tags.size < qCount) {
        tags.add(qPool[Math.floor(rng() * qPool.length)] as string);
      }
      const m = meta(
        `card${i}`,
        `A${atomIdx}`,
        Array.from(tags),
        lengths[lenIdx] as CardLength,
      );
      cards.push(m);
      s = registerCard(s, m);
    }

    const cardIds = cards.map((c) => c.cardId);
    const familiarTerminalCheck = new Map<string, boolean>();

    for (let iter = 0; iter < 1000; iter++) {
      const cardId = cardIds[Math.floor(rng() * cardIds.length)] as string;
      const correct = rng() > 0.3; // ~70% correct rate

      // Snapshot status BEFORE
      const wasFamiliar = getCardStatus(s, cardId) === 'FAMILIAR';
      if (wasFamiliar) familiarTerminalCheck.set(cardId, true);

      const prevExp = s.exposures[cardId];
      const prevExposureCount = prevExp?.exposureCount ?? 0;
      const prevCorrectCount = prevExp?.correctCount ?? 0;

      s = recordCardResult(s, cardId, correct);

      const exp = s.exposures[cardId];
      expect(exp).toBeDefined();
      if (!exp) continue;

      // I1: exposureCount >= correctCount
      expect(exp.exposureCount).toBeGreaterThanOrEqual(exp.correctCount);

      // I1b: counts incremented correctly
      expect(exp.exposureCount).toBe(prevExposureCount + 1);
      expect(exp.correctCount).toBe(prevCorrectCount + (correct ? 1 : 0));

      // I3: lastNResults bounded
      expect(exp.lastNResults.length).toBeLessThanOrEqual(RETIRE_WINDOW);

      // I4: FAMILIAR is terminal
      if (familiarTerminalCheck.get(cardId)) {
        expect(exp.status).toBe('FAMILIAR');
      }

      // Status consistency
      if (exp.exposureCount === 0) {
        expect(exp.status).toBe('NEW');
      } else {
        expect(exp.status).not.toBe('NEW');
      }
    }

    // I5: All atom percents in [0, 100]
    for (const atomId of Object.keys(s.atomToCards)) {
      const f = getAtomFamiliarity(s, atomId);
      expect(f.percent).toBeGreaterThanOrEqual(0);
      expect(f.percent).toBeLessThanOrEqual(100);
      expect(f.totalExposures).toBeGreaterThanOrEqual(f.correctExposures);
    }

    // I6: Q-track percent = mean of contributing atom percents
    for (const qTag of Object.keys(s.qToAtoms)) {
      const f = getQTrackFamiliarity(s, qTag);
      const atomIds = s.qToAtoms[qTag] ?? [];
      const expected =
        atomIds.length === 0
          ? 0
          : Math.round(
              atomIds
                .map((aid) => getAtomFamiliarity(s, aid).percent)
                .reduce((acc, p) => acc + p, 0) / atomIds.length,
            );
      expect(f.percent).toBe(expected);
    }

    // I2 (global): seq counter equals total ops
    expect(s.seq).toBe(1000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. Edge cases + integration scenarios
// ─────────────────────────────────────────────────────────────────────────────

describe('edge cases', () => {
  it('multi-card atom: percent reflects aggregate progress', () => {
    let s = createInitialState();
    s = registerCard(s, meta('c1', 'A1', [], 'short')); // target 6
    s = registerCard(s, meta('c2', 'A1', [], 'short')); // target 6 → atom target 12
    // Drill c1 to 100% (6/6 correct) → atom = 6/12 = 50%
    s = recordN(s, 'c1', new Array(6).fill(true));
    expect(getAtomFamiliarity(s, 'A1').percent).toBe(50);
    // Drill c2 to 100% → atom = 12/12 = 100%
    s = recordN(s, 'c2', new Array(6).fill(true));
    expect(getAtomFamiliarity(s, 'A1').percent).toBe(100);
  });

  it('multi-Q card lifts both Q-tracks via single drill', () => {
    let s = createInitialState();
    s = registerCard(s, meta('c1', 'A1', ['Q1', 'Q4'], 'short'));
    expect(getQTrackFamiliarity(s, 'Q1').percent).toBe(0);
    expect(getQTrackFamiliarity(s, 'Q4').percent).toBe(0);
    s = recordN(s, 'c1', new Array(6).fill(true));
    expect(getQTrackFamiliarity(s, 'Q1').percent).toBe(100);
    expect(getQTrackFamiliarity(s, 'Q4').percent).toBe(100);
  });

  it('retired card stays retired across many subsequent wrongs', () => {
    let s = registerCard(createInitialState(), meta('c1', 'A1', [], 'short'));
    s = recordN(s, 'c1', new Array(6).fill(true));
    expect(getCardStatus(s, 'c1')).toBe('FAMILIAR');
    for (let i = 0; i < 100; i++) {
      s = recordCardResult(s, 'c1', false);
      expect(getCardStatus(s, 'c1')).toBe('FAMILIAR');
    }
  });

  it('zero target atom (defensive) returns 0%', () => {
    // Atom with no registered cards
    const f = getAtomFamiliarity(createInitialState(), 'A_nothing');
    expect(f.target).toBe(0);
    expect(f.percent).toBe(0);
  });

  it('qTrack with one atom = atom percent', () => {
    let s = createInitialState();
    s = registerCard(s, meta('c1', 'A1', ['Q1'], 'short'));
    s = recordN(s, 'c1', [true, true, true]); // 3/6 = 50%
    expect(getQTrackFamiliarity(s, 'Q1').percent).toBe(50);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. End-to-end scenario: realistic study session
// ─────────────────────────────────────────────────────────────────────────────

describe('end-to-end: realistic study session', () => {
  it('models a Q1+Q4 mixed-track session with mistakes and recovery', () => {
    let s = createInitialState();
    s = regAll(s, [
      meta('trace1', 'A_loop', ['Q1'], 'short'),
      meta('trace2', 'A_struct', ['Q1', 'Q4'], 'medium'),
      meta('write1', 'A_struct', ['Q4'], 'long'),
      meta('write2', 'A_loop', ['Q4'], 'medium'),
    ]);

    // Student hits trace2 hard, gets 6 correct in a row → not retired (target 8)
    for (let i = 0; i < 6; i++) {
      s = propagateExposure(s, 'trace2', ['Q1', 'Q4'], true);
    }
    expect(getCardStatus(s, 'trace2')).toBe('IN-PROGRESS');

    // Two more correct → retires (target 8 + last 3 correct)
    s = propagateExposure(s, 'trace2', ['Q1', 'Q4'], true);
    s = propagateExposure(s, 'trace2', ['Q1', 'Q4'], true);
    expect(getCardStatus(s, 'trace2')).toBe('FAMILIAR');

    // Q1 track now lifted by trace2's 8 corrects on A_struct;
    // A_loop is at 0 → Q1 = mean(A_struct, A_loop) = mean(some%, 0%)
    const q1 = getQTrackFamiliarity(s, 'Q1');
    expect([...q1.atoms].sort()).toEqual(['A_loop', 'A_struct']);
    expect(q1.atomsBelow50).toContain('A_loop');

    // Drill trace1 to 100% to fix the gap
    for (let i = 0; i < 6; i++) {
      s = propagateExposure(s, 'trace1', ['Q1'], true);
    }
    const q1After = getQTrackFamiliarity(s, 'Q1');
    expect(q1After.percent).toBeGreaterThan(q1.percent);

    // Coverage ranking: write1 + write2 both lift only Q4; struct-trace
    // would lift both — but it's already retired. Show that the ranker still
    // returns viable cards.
    const ranked = rankCardsByCoverage(s, ['write1', 'write2'], ['Q4']);
    expect(ranked).toHaveLength(2);
    expect(ranked.every((r) => r.coverage === 1)).toBe(true);
  });
});
