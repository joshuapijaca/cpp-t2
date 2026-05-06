// One-shot script: replace non-ASCII chars in cards.json + outline YAMLs
// with ASCII equivalents student can type on a standard laptop keyboard.
//
// Run: npx tsx build/asciify-content.ts

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const CARDS_PATH = resolve(ROOT, 'data/cards.json');

const UNICODE_TO_ASCII: Array<[string, string]> = [
  ['→', '->'],
  ['←', '<-'],
  ['↑', '^'],
  ['↓', 'v'],
  ['≤', '<='],
  ['≥', '>='],
  ['≠', '!='],
  ['—', '-'],
  ['–', '-'],
  ['…', '...'],
  ['★', '*'],
  ['•', '*'],
  ['×', 'x'],
  ['✓', 'OK'],
  ['✗', 'X'],
  ['✕', 'X'],
  ['‘', "'"],
  ['’', "'"],
  ['“', '"'],
  ['”', '"'],
];

function asciify(s: string): string {
  let out = s;
  for (const [from, to] of UNICODE_TO_ASCII) {
    if (out.includes(from)) out = out.split(from).join(to);
  }
  return out;
}

function walk(value: unknown): unknown {
  if (typeof value === 'string') return asciify(value);
  if (Array.isArray(value)) return value.map(walk);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = walk(v);
    return out;
  }
  return value;
}

function findRemainingNonAscii(obj: unknown, prefix = ''): string[] {
  const hits: string[] = [];
  if (typeof obj === 'string') {
    const m = obj.match(/[^\x00-\x7F]/g);
    if (m) hits.push(`${prefix}: ${[...new Set(m)].join('')} | "${obj.slice(0, 60)}"`);
  } else if (Array.isArray(obj)) {
    obj.forEach((v, i) => hits.push(...findRemainingNonAscii(v, `${prefix}[${i}]`)));
  } else if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      hits.push(...findRemainingNonAscii(v, prefix ? `${prefix}.${k}` : k));
    }
  }
  return hits;
}

function main() {
  // Cards.json
  const cards = JSON.parse(readFileSync(CARDS_PATH, 'utf8'));
  const cardsClean = walk(cards);
  writeFileSync(CARDS_PATH, JSON.stringify(cardsClean, null, 2));
  const cardsRemaining = findRemainingNonAscii(cardsClean);
  console.log(`✓ asciified data/cards.json`);
  if (cardsRemaining.length > 0) {
    console.warn(`  ⚠ ${cardsRemaining.length} unmapped non-ASCII string(s) remain:`);
    for (const r of cardsRemaining.slice(0, 5)) console.warn(`    ${r}`);
  }

  // Outlines
  const outlineFiles = glob.sync('outlines/**/*.yml', { cwd: ROOT });
  let outlinesChanged = 0;
  for (const f of outlineFiles) {
    const path = resolve(ROOT, f);
    const before = readFileSync(path, 'utf8');
    const after = asciify(before);
    if (before !== after) {
      writeFileSync(path, after);
      outlinesChanged++;
    }
  }
  console.log(`✓ asciified ${outlinesChanged} outline file(s)`);
}

main();
