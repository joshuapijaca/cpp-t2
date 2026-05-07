/**
 * DAG Backward Retry — unit tests
 *
 * Coverage:
 *   - failed atom walks DAG backward correctly
 *   - returns no atoms if failed atom has no prereqs
 *   - handles multi-level prereq chains
 *   - injectPrereqCards picks N cards across atoms
 */

import { describe, expect, it } from 'vitest';
import type { Atom } from '../../types/atom.ts';
import type { Card, MCQCard } from '../../types/card-schema.ts';
import { injectPrereqCards, walkBackward } from '../dag-backward-retry.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

function mkAtom(id: string, prereqs: string[] = []): Atom {
  return {
    id,
    name: `Atom ${id}`,
    level: 'L0',
    prereqs,
    usedByQs: ['Q1'],
    commonMistakeIds: [],
    cardCountTarget: 5,
    exposureTarget: { short: 6, medium: 8, long: 12 },
    source: { kind: 'v2', ref: 'test' },
  };
}

function mkCard(id: string, atomId: string, stage: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1): Card {
  const c: MCQCard = {
    id,
    schemaVersion: 'v2',
    atomId,
    qTags: ['Q1'],
    stage: stage as MCQCard['stage'],
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

// ─────────────────────────────────────────────────────────────────────────────
// walkBackward
// ─────────────────────────────────────────────────────────────────────────────

describe('walkBackward', () => {
  it('returns empty array for an atom with no prereqs', () => {
    const atoms = [mkAtom('F-01', [])];
    expect(walkBackward('F-01', atoms)).toEqual([]);
  });

  it('returns empty array for an unknown failed atom', () => {
    const atoms = [mkAtom('F-01', [])];
    expect(walkBackward('NOPE', atoms)).toEqual([]);
  });

  it('walks immediate prereqs in BFS order', () => {
    const atoms = [
      mkAtom('F-01', []),
      mkAtom('F-02', []),
      mkAtom('F-03', ['F-01', 'F-02']),
    ];
    const out = walkBackward('F-03', atoms);
    expect(out).toContain('F-01');
    expect(out).toContain('F-02');
    expect(out.length).toBe(2);
  });

  it('walks multi-level prereq chains', () => {
    const atoms = [
      mkAtom('F-01', []),
      mkAtom('F-02', ['F-01']),
      mkAtom('F-03', ['F-02']),
      mkAtom('F-04', ['F-03']),
    ];
    const out = walkBackward('F-04', atoms);
    expect(out).toEqual(['F-03', 'F-02', 'F-01']);
  });

  it('handles diamond DAG without revisiting nodes', () => {
    const atoms = [
      mkAtom('F-01', []),
      mkAtom('F-02', ['F-01']),
      mkAtom('F-03', ['F-01']),
      mkAtom('F-04', ['F-02', 'F-03']),
    ];
    const out = walkBackward('F-04', atoms);
    expect(out.filter((x) => x === 'F-01').length).toBe(1);
    expect(out).toContain('F-02');
    expect(out).toContain('F-03');
  });

  it('does not infinite-loop on accidental cycle', () => {
    const atoms = [
      mkAtom('F-01', ['F-02']),
      mkAtom('F-02', ['F-01']),
    ];
    const out = walkBackward('F-01', atoms);
    expect(out).toContain('F-02');
    expect(out.length).toBeLessThan(10);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// injectPrereqCards
// ─────────────────────────────────────────────────────────────────────────────

describe('injectPrereqCards', () => {
  it('returns empty when n=0', () => {
    expect(injectPrereqCards('F-04', [], [], 0)).toEqual([]);
  });

  it('returns empty when failed atom has no prereqs', () => {
    const atoms = [mkAtom('F-01', [])];
    const cards = [mkCard('a', 'F-01')];
    expect(injectPrereqCards('F-01', atoms, cards, 3)).toEqual([]);
  });

  it('picks one card per prereq atom in BFS order', () => {
    const atoms = [
      mkAtom('F-01', []),
      mkAtom('F-02', []),
      mkAtom('F-03', ['F-01', 'F-02']),
    ];
    const cards = [
      mkCard('a-01', 'F-01'),
      mkCard('a-02', 'F-01'),
      mkCard('b-01', 'F-02'),
      mkCard('c-01', 'F-03'),
    ];
    const out = injectPrereqCards('F-03', atoms, cards, 2);
    const atomIds = out.map((c) => c.atomId).sort();
    expect(atomIds).toEqual(['F-01', 'F-02']);
  });

  it('cycles through atoms for additional cards when n exceeds atom count', () => {
    const atoms = [
      mkAtom('F-01', []),
      mkAtom('F-02', ['F-01']),
    ];
    const cards = [
      mkCard('a-01', 'F-01'),
      mkCard('a-02', 'F-01'),
      mkCard('a-03', 'F-01'),
    ];
    const out = injectPrereqCards('F-02', atoms, cards, 3);
    expect(out.length).toBe(3);
    expect(out.every((c) => c.atomId === 'F-01')).toBe(true);
  });

  it('returns however many cards are available when pool runs out', () => {
    const atoms = [
      mkAtom('F-01', []),
      mkAtom('F-02', ['F-01']),
    ];
    const cards = [mkCard('a-01', 'F-01')];
    const out = injectPrereqCards('F-02', atoms, cards, 5);
    expect(out.length).toBe(1);
  });

  it('handles multi-level chain — closest prereq first', () => {
    const atoms = [
      mkAtom('F-01', []),
      mkAtom('F-02', ['F-01']),
      mkAtom('F-03', ['F-02']),
    ];
    const cards = [
      mkCard('top', 'F-01'),
      mkCard('mid', 'F-02'),
      mkCard('bot', 'F-03'),
    ];
    const out = injectPrereqCards('F-03', atoms, cards, 2);
    // BFS from F-03 visits F-02 first, then F-01.
    expect(out[0]?.atomId).toBe('F-02');
    expect(out[1]?.atomId).toBe('F-01');
  });
});
