// Reorder cards.json to match data/ordered_ids.json (topological + priority order).
// Within each atom, cards keep their relative order (memorize → mcq → trace → write).
// Cards whose atomId is not in ordered_ids.json are appended at the end (preserve relative order).
//
// Run: npx tsx build/reorder-cards.ts

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const CARDS_PATH = resolve(ROOT, 'data/cards.json');
const ORDERED_PATH = resolve(ROOT, 'data/ordered_ids.json');

interface Card {
  atomId: string;
  type: string;
}

function typeRank(t: string): number {
  switch (t) {
    case 'memorize': return 0;
    case 'mcq': return 1;
    case 'trace': return 2;
    case 'write': return 3;
    default: return 4;
  }
}

function levelRank(t: string): number {
  // For write cards, lower level = simpler = earlier
  return 0;
}

function main() {
  const cards = JSON.parse(readFileSync(CARDS_PATH, 'utf8')) as Card[];
  const order = JSON.parse(readFileSync(ORDERED_PATH, 'utf8')) as { ordered_ids: string[] };

  const orderIndex = new Map<string, number>();
  order.ordered_ids.forEach((id, i) => orderIndex.set(id, i));

  // Group cards by atomId, preserving original order within atom
  const groups = new Map<string, Card[]>();
  cards.forEach((c) => {
    const list = groups.get(c.atomId) ?? [];
    list.push(c);
    groups.set(c.atomId, list);
  });

  // Sort cards within each atom: memorize → mcq → trace → write (stable for ties)
  for (const [, list] of groups) {
    list.sort((a, b) => typeRank(a.type) - typeRank(b.type));
  }

  // Emit by ordered_ids first
  const out: Card[] = [];
  for (const id of order.ordered_ids) {
    const list = groups.get(id);
    if (list) {
      out.push(...list);
      groups.delete(id);
    }
  }

  // Append remaining (unordered atoms) in original relative order
  const remaining: Card[] = [];
  for (const list of groups.values()) {
    remaining.push(...list);
  }
  out.push(...remaining);

  if (out.length !== cards.length) {
    console.error(`✕ count mismatch: in=${cards.length} out=${out.length}`);
    process.exit(1);
  }

  writeFileSync(CARDS_PATH, JSON.stringify(out, null, 2));
  console.log(`✓ reordered ${out.length} cards by topo order.`);
  console.log(`  ordered atoms: ${order.ordered_ids.length}`);
  console.log(`  unordered cards (appended): ${remaining.length}`);
  void levelRank;
}

main();
