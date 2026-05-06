/**
 * One-shot: inject trace-walkthrough cards into cards.json
 * Places each walkthrough before the first trace card of its atom.
 * ME-01 walkthrough covers ME-01 through ME-05 (same pattern).
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA = resolve(__dirname, '..', 'data');
const cardsPath = resolve(DATA, 'cards.json');
const wtPath = resolve(DATA, 'trace-walkthroughs.json');

const cards = JSON.parse(readFileSync(cardsPath, 'utf-8'));
const walkthroughs = JSON.parse(readFileSync(wtPath, 'utf-8'));

// Build map: atomId -> walkthrough card
const wtMap = new Map<string, any>();
for (const wt of walkthroughs) {
  wtMap.set(wt.atomId, wt);
}

// Track which atoms already have a walkthrough injected
const injected = new Set<string>();

// Work backwards to preserve indices
const insertions: Array<{ index: number; card: any }> = [];

for (let i = 0; i < cards.length; i++) {
  const c = cards[i];
  if (c.type !== 'trace') continue;

  const atomId = c.atomId;
  if (injected.has(atomId)) continue;

  // Check if walkthrough exists for this atom
  const wt = wtMap.get(atomId);
  if (wt) {
    insertions.push({ index: i, card: wt });
    injected.add(atomId);
  }
}

// Insert in reverse order to preserve indices
insertions.sort((a, b) => b.index - a.index);
for (const ins of insertions) {
  cards.splice(ins.index, 0, ins.card);
}

writeFileSync(cardsPath, JSON.stringify(cards, null, 2) + '\n');

console.log(`Injected ${insertions.length} trace walkthroughs.`);
console.log(`Total cards: ${cards.length}`);
console.log('Atoms covered:', [...injected].join(', '));
