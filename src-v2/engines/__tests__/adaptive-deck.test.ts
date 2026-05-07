/**
 * Adaptive In-Session Deck — unit tests
 *
 * Coverage targets:
 *   - failure injects DeltaCard
 *   - hit does NOT inject
 *   - fatigue lightens the deck
 */

import { describe, expect, it } from 'vitest';
import type { Card, DeltaCard, MCQCard } from '../../types/card-schema.ts';
import {
  createInitialState,
  registerCard,
  type SessionState,
} from '../exposure-counter.ts';
import {
  FATIGUE_DROP_THRESHOLD,
  FATIGUE_WINDOW,
  adaptiveAdjust,
  detectFatigue,
  findDeltaCard,
  lightenDeck,
} from '../adaptive-deck.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

function mkMcq(id: string, atomId = 'F-01', qTags: ReadonlyArray<'Q1' | 'Q2' | 'Q3' | 'Q4'> = ['Q1']): Card {
  const c: MCQCard = {
    id,
    schemaVersion: 'v2',
    atomId,
    qTags: qTags as MCQCard['qTags'],
    stage: 1,
    level: 'L0',
    type: 'MCQCard',
    stem: `stem-${id}`,
    source: { kind: 'v2', ref: 'test' },
    commonMistakeIds: [],
    status: 'NEW',
    createdBy: 'test',
    reviewedBy: [],
    correct: 'A',
    distractors: ['B', 'C', 'D'],
    explanation: 'because',
  };
  return c as Card;
}

function mkDelta(id: string, atomId: string, qTags: ReadonlyArray<'Q1' | 'Q2' | 'Q3' | 'Q4'> = ['Q1']): DeltaCard {
  return {
    id,
    schemaVersion: 'v2',
    atomId,
    qTags: qTags as DeltaCard['qTags'],
    stage: 1,
    level: 'L0',
    type: 'DeltaCard',
    stem: `delta-${id}`,
    source: { kind: 'v2', ref: 'test' },
    commonMistakeIds: [],
    status: 'NEW',
    createdBy: 'test',
    reviewedBy: [],
    codeA: 'int x = 0;',
    codeB: 'int x = 1;',
    prompt: 'list every difference',
    canonicalAnswer: 'value',
    keyChecks: [],
    explanation: 'they differ in initialization',
  };
}

function mkHeavy(id: string, type = 'AdversarialMockCard', atomId = 'F-01'): Card {
  return {
    id,
    schemaVersion: 'v2',
    atomId,
    qTags: ['Q1'],
    stage: 4,
    level: 'L0',
    type,
    stem: `heavy-${id}`,
    source: { kind: 'v2', ref: 'test' },
    commonMistakeIds: [],
    status: 'NEW',
    createdBy: 'test',
    reviewedBy: [],
    questionNumber: 'Q1',
    fullPrompt: 'do the thing',
    canonicalAnswer: 'thing',
    rubric: [],
    explanation: 'because',
  } as unknown as Card;
}

function buildSession(cards: readonly Card[]): SessionState {
  let s = createInitialState();
  for (const c of cards) {
    s = registerCard(s, {
      cardId: c.id,
      atomId: c.atomId,
      qTags: c.qTags,
      length: 'short',
    });
  }
  return s;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('adaptiveAdjust — failure injects DeltaCard', () => {
  it('injects matching DeltaCard for failed atom', () => {
    const failed = mkMcq('q1', 'F-07');
    const next = mkMcq('q2', 'F-07');
    const delta = mkDelta('d1', 'F-07');
    const allCards = [failed, next, delta];
    const state = buildSession(allCards);

    const deck = [next];
    const result = adaptiveAdjust(
      deck,
      state,
      [{ cardId: 'q1', correct: false }],
      { allCards },
    );
    expect(result.map((c) => c.id)).toContain('d1');
    expect(result[0]?.id).toBe('d1');
  });

  it('falls back to a sibling card from the same atom when no DeltaCard exists', () => {
    const failed = mkMcq('q1', 'F-07');
    const sibling = mkMcq('q2', 'F-07');
    const allCards = [failed, sibling];
    const state = buildSession(allCards);

    const deck: Card[] = [];
    const result = adaptiveAdjust(
      deck,
      state,
      [{ cardId: 'q1', correct: false }],
      { allCards },
    );
    expect(result.map((c) => c.id)).toContain('q2');
  });
});

describe('adaptiveAdjust — hit does NOT inject', () => {
  it('returns deck unchanged when last result was correct', () => {
    const next = mkMcq('q2', 'F-07');
    const delta = mkDelta('d1', 'F-07');
    const allCards = [next, delta];
    const state = buildSession(allCards);

    const deck = [next];
    const result = adaptiveAdjust(
      deck,
      state,
      [{ cardId: 'q2', correct: true }],
      { allCards },
    );
    expect(result.map((c) => c.id)).toEqual(['q2']);
  });

  it('returns deck unchanged when no recent results', () => {
    const next = mkMcq('q2', 'F-07');
    const allCards = [next];
    const state = buildSession(allCards);

    const result = adaptiveAdjust([next], state, [], { allCards });
    expect(result.map((c) => c.id)).toEqual(['q2']);
  });
});

describe('detectFatigue', () => {
  it('returns false with too few results', () => {
    expect(detectFatigue([], FATIGUE_WINDOW)).toBe(false);
  });

  it('returns true on sustained accuracy drop', () => {
    const results = [
      // first 10 = 100%
      ...Array.from({ length: 10 }, (_, i) => ({ cardId: `a${i}`, correct: true })),
      // next 10 = 30%
      ...Array.from({ length: 10 }, (_, i) => ({ cardId: `b${i}`, correct: i < 3 })),
    ];
    expect(detectFatigue(results, 10, FATIGUE_DROP_THRESHOLD)).toBe(true);
  });

  it('returns false when accuracy is stable', () => {
    const results = Array.from({ length: 20 }, (_, i) => ({
      cardId: `c${i}`,
      correct: true,
    }));
    expect(detectFatigue(results, 10, FATIGUE_DROP_THRESHOLD)).toBe(false);
  });
});

describe('lightenDeck', () => {
  it('swaps heavy cards for lighter ones when pool has stock', () => {
    const heavy = mkHeavy('h1');
    const lighter = mkMcq('m1');
    const deck = [heavy];
    const allCards = [heavy, lighter];
    const result = lightenDeck(deck, allCards, 1);
    // Heavy moved to tail, lighter took its slot.
    expect(result[0]?.id).toBe('m1');
    expect(result[result.length - 1]?.id).toBe('h1');
  });

  it('returns deck unchanged when no lighter pool available', () => {
    const heavy = mkHeavy('h1');
    const result = lightenDeck([heavy], [heavy], 1);
    expect(result.map((c) => c.id)).toEqual(['h1']);
  });

  it('returns deck unchanged when deferCount=0', () => {
    const heavy = mkHeavy('h1');
    const lighter = mkMcq('m1');
    const result = lightenDeck([heavy], [heavy, lighter], 0);
    expect(result.map((c) => c.id)).toEqual(['h1']);
  });
});

describe('findDeltaCard', () => {
  it('returns null when failed card is unregistered', () => {
    const state = buildSession([]);
    expect(findDeltaCard('nope', state, [])).toBeNull();
  });

  it('returns DeltaCard sharing a Q-tag if no atom match', () => {
    const failed = mkMcq('q1', 'F-99', ['Q3']);
    const delta = mkDelta('d1', 'F-12', ['Q3']);
    const state = buildSession([failed]);
    const found = findDeltaCard('q1', state, [delta]);
    expect(found?.id).toBe('d1');
  });
});

describe('adaptiveAdjust — fatigue triggers lightening', () => {
  it('replaces heavy with lighter in queue when fatigue detected', () => {
    const heavy = mkHeavy('h1');
    const heavy2 = mkHeavy('h2');
    const lighter = mkMcq('m1');
    const lighter2 = mkMcq('m2');
    const allCards = [heavy, heavy2, lighter, lighter2];
    const state = buildSession(allCards);

    const deck = [heavy, heavy2];
    const recent = [
      ...Array.from({ length: 10 }, (_, i) => ({ cardId: `pre${i}`, correct: true })),
      ...Array.from({ length: 10 }, (_, i) => ({ cardId: `now${i}`, correct: i < 2 })),
    ];
    const result = adaptiveAdjust(deck, state, recent, { allCards });
    const ids = result.map((c) => c.id);
    expect(ids[0]).not.toBe('h1');
  });
});
