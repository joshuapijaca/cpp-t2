// M16 — Interleave SEE cards with DO cards in cards.json.
// Per docs/14 per-atom order: [demo, decompose, memorize×N, write/trace×N]
// Walkthroughs placed at end of their level.
// Worked examples placed at start of their Q-skill level.
//
// Reads: data/cards.json (DO cards) + data/see-*.json (generated SEE cards)
// Writes: data/cards.json (combined, reordered)
// Idempotent: strips existing SEE cards from cards.json before merging.

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');

const DO_TYPES = new Set(['memorize', 'mcq', 'trace', 'write']);
const SEE_FILES = [
  // 'data/see-demo-cards.json',        // removed: passive, user finds useless
  // 'data/see-q-context-cards.json',    // removed: also demo type
  'data/see-cloze-cards.json',
  'data/see-decompose-cards.json',
  'data/see-walkthrough-cards.json',
  'data/see-worked-example-cards.json',
  'data/see-read-predict-cards.json',
];

// Level order matching docs/07 sequence. Prefix → level number.
const PREFIX_TO_LEVEL: Record<string, number> = {
  'P-': -1, 'S-': 0, 'O-': 1, 'V-': 2, 'I-': 3, 'A-': 4,
  'C-': 5, 'L-': 5, 'F-': 6, 'W-': 7, 'H-': 8, 'R-': 9,
  'G-': 10, 'T-': 11, 'PC-': 12, 'HE-': 13, 'SW-': 14,
  'RW-': 15, 'MW-': 16, 'ME-': 17,
};

interface AnyCard {
  type: string;
  atomId: string;
  [k: string]: unknown;
}

function atomLevel(atomId: string): number {
  let bestLen = 0;
  let bestLevel = -99;
  for (const [prefix, level] of Object.entries(PREFIX_TO_LEVEL)) {
    if (atomId.startsWith(prefix) && prefix.length > bestLen) {
      bestLen = prefix.length;
      bestLevel = level;
    }
  }
  return bestLevel;
}

// Atom sort key: level first, then numeric suffix
function atomSortKey(atomId: string): string {
  const level = atomLevel(atomId);
  const numMatch = atomId.match(/(\d+)$/);
  const num = numMatch ? parseInt(numMatch[1], 10) : 0;
  return `${String(level + 100).padStart(4, '0')}_${String(num).padStart(4, '0')}_${atomId}`;
}

// Card type → order within an atom group
function typeOrder(type: string): number {
  switch (type) {
    case 'cloze': return 0;
    case 'decompose': return 1;
    case 'demo': return 0.5;  // legacy, filtered out
    case 'memorize': return 2;
    case 'mcq': return 3;
    case 'trace': return 4;
    case 'write': return 5;
    case 'walkthrough': return 6;
    default: return 9;
  }
}

function main() {
  // 1. Read existing cards.json — keep DO cards only
  const cardsPath = resolve(ROOT, 'data/cards.json');
  const existing: AnyCard[] = JSON.parse(readFileSync(cardsPath, 'utf8'));
  const doCards = existing.filter((c) => DO_TYPES.has(c.type));

  // 2. Read all SEE card files
  const seeCards: AnyCard[] = [];
  for (const rel of SEE_FILES) {
    const p = resolve(ROOT, rel);
    if (!existsSync(p)) {
      console.warn(`skip missing: ${rel}`);
      continue;
    }
    const arr: AnyCard[] = JSON.parse(readFileSync(p, 'utf8'));
    // Filter out all demo-type cards (user finds passive reading useless)
    seeCards.push(...arr.filter(c => c.type !== 'demo'));
  }

  // 3. Separate walkthroughs (end-of-level) from per-atom SEE cards
  const walkthroughs: AnyCard[] = [];
  const perAtomSee: AnyCard[] = [];
  for (const c of seeCards) {
    if (c.type === 'walkthrough') {
      walkthroughs.push(c);
    } else {
      perAtomSee.push(c);
    }
  }

  // 4. Group all per-atom cards (DO + SEE) by atomId
  const allPerAtom = [...doCards, ...perAtomSee];
  const byAtom = new Map<string, AnyCard[]>();
  for (const c of allPerAtom) {
    const arr = byAtom.get(c.atomId) ?? [];
    arr.push(c);
    byAtom.set(c.atomId, arr);
  }

  // 5. Sort within each atom group: demo → decompose → memorize → mcq → trace → write
  for (const [, cards] of byAtom) {
    cards.sort((a, b) => typeOrder(a.type) - typeOrder(b.type));
  }

  // 6. Sort atoms by level order
  const sortedAtomIds = [...byAtom.keys()].sort(
    (a, b) => atomSortKey(a).localeCompare(atomSortKey(b))
  );

  // 7. Build final array: per-atom cards + walkthrough at end of each level
  const walkthroughByLevel = new Map<number, AnyCard[]>();
  for (const wt of walkthroughs) {
    const lv = atomLevel(wt.atomId);
    const arr = walkthroughByLevel.get(lv) ?? [];
    arr.push(wt);
    walkthroughByLevel.set(lv, arr);
  }

  const final: AnyCard[] = [];
  let prevLevel = -999;

  for (const atomId of sortedAtomIds) {
    const curLevel = atomLevel(atomId);

    // Insert walkthroughs when transitioning to a new level
    if (curLevel !== prevLevel && prevLevel !== -999) {
      const wts = walkthroughByLevel.get(prevLevel);
      if (wts) {
        final.push(...wts);
        walkthroughByLevel.delete(prevLevel);
      }
    }
    prevLevel = curLevel;

    final.push(...(byAtom.get(atomId) ?? []));
  }

  // Flush any remaining walkthroughs for the last level
  if (prevLevel !== -999) {
    const wts = walkthroughByLevel.get(prevLevel);
    if (wts) final.push(...wts);
  }

  // 8. Write combined cards.json
  writeFileSync(cardsPath, JSON.stringify(final, null, 2) + '\n');

  const doCount = final.filter((c) => DO_TYPES.has(c.type)).length;
  const seeCount = final.length - doCount;
  console.log(`interleave complete: ${final.length} total (${doCount} DO + ${seeCount} SEE)`);
  console.log(`  cloze: ${final.filter((c) => c.type === 'cloze').length}`);
  console.log(`  decompose: ${final.filter((c) => c.type === 'decompose').length}`);
  console.log(`  walkthrough: ${final.filter((c) => c.type === 'walkthrough').length}`);
  console.log(`  memorize: ${final.filter((c) => c.type === 'memorize').length}`);
  console.log(`  mcq: ${final.filter((c) => c.type === 'mcq').length}`);
  console.log(`  trace: ${final.filter((c) => c.type === 'trace').length}`);
  console.log(`  write: ${final.filter((c) => c.type === 'write').length}`);
}

main();
