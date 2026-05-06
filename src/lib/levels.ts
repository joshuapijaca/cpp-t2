// Atom-ID prefix → level mapping. Used by Home picker to compute first-card index per level.

import type { Card } from '../types/card';

export interface LevelInfo {
  level: number;
  label: string;        // L-1, L0, L9, etc.
  title: string;        // human-readable
  prefixes: string[];   // atomId prefixes that belong to this level
  isRDS?: boolean;
}

// Order matters — must match docs/07_master_plan.md sequence
export const LEVELS: LevelInfo[] = [
  { level: -1, label: 'L-1', title: 'Pre-programming',          prefixes: ['P-'] },
  { level: 0,  label: 'L0',  title: 'Source skeleton',          prefixes: ['S-'] },
  { level: 1,  label: 'L1',  title: 'Output',                   prefixes: ['O-'] },
  { level: 2,  label: 'L2',  title: 'Variables + types',        prefixes: ['V-'] },
  { level: 3,  label: 'L3',  title: 'Input',                    prefixes: ['I-'] },
  { level: 4,  label: 'L4',  title: 'Operators',                prefixes: ['A-'] },
  { level: 5,  label: 'L5',  title: 'Comparison + logical',     prefixes: ['C-', 'L-'] },
  { level: 6,  label: 'L6',  title: 'Conditionals',             prefixes: ['F-'] },
  { level: 7,  label: 'L7',  title: 'Loops',                    prefixes: ['W-'] },
  { level: 8,  label: 'L8',  title: 'Functions',                prefixes: ['H-'] },
  { level: 9,  label: 'L9',  title: 'Pass-by-reference (RDS)',  prefixes: ['R-'], isRDS: true },
  { level: 10, label: 'L10', title: 'Arrays',                   prefixes: ['G-'] },
  { level: 11, label: 'L11', title: 'Structs',                  prefixes: ['T-'] },
  { level: 12, label: 'L12', title: 'Pass composites',          prefixes: ['PC-'] },
  { level: 13, label: 'L13', title: 'Hand-execution (Q1)',      prefixes: ['HE-'] },
  { level: 14, label: 'L14', title: 'Struct-write (Q2)',        prefixes: ['SW-'] },
  { level: 15, label: 'L15', title: 'Read-function (Q3)',       prefixes: ['RW-'] },
  { level: 16, label: 'L16', title: 'Main-write (Q4)',          prefixes: ['MW-'] },
  { level: 17, label: 'L17', title: 'Mock exams',               prefixes: ['ME-'] },
];

export function levelOf(atomId: string): LevelInfo | undefined {
  // Match longest prefix first to avoid 'P-' colliding with 'PC-'
  let best: LevelInfo | undefined;
  let bestLen = 0;
  for (const lv of LEVELS) {
    for (const pre of lv.prefixes) {
      if (atomId.startsWith(pre) && pre.length > bestLen) {
        best = lv;
        bestLen = pre.length;
      }
    }
  }
  return best;
}

export interface LevelStart {
  info: LevelInfo;
  firstIndex: number;
  cardCount: number;
}

/** For each level, find first card index + how many cards belong to that level. */
export function computeLevelStarts(cards: Card[]): LevelStart[] {
  const firstIdx = new Map<number, number>();
  const counts = new Map<number, number>();
  cards.forEach((c, i) => {
    const lv = levelOf(c.atomId);
    if (!lv) return;
    if (!firstIdx.has(lv.level)) firstIdx.set(lv.level, i);
    counts.set(lv.level, (counts.get(lv.level) ?? 0) + 1);
  });

  const out: LevelStart[] = [];
  for (const info of LEVELS) {
    const idx = firstIdx.get(info.level);
    if (idx === undefined) continue;
    out.push({ info, firstIndex: idx, cardCount: counts.get(info.level) ?? 0 });
  }
  return out;
}
