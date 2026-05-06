// Fix cards.json: real newline chars (U+000A) → 2-char literal `\n` (backslash + n).
// Bug: earlier YAML parsing interpreted `\n` as control char in card fact/context.
// Should display as printable backslash-n in cards.

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const CARDS_PATH = resolve(ROOT, 'data/cards.json');

const NL = '\n';                  // real newline (1 char)
const ESCAPED = '\\' + 'n';       // backslash + n (2 chars)

interface AnyCard {
  [key: string]: unknown;
}

const FIELDS = ['fact', 'context', 'spec', 'expectedAnswer', 'template', 'explanation', 'teachMe'];

function main() {
  const cards = JSON.parse(readFileSync(CARDS_PATH, 'utf8')) as AnyCard[];
  let fixed = 0;
  for (const c of cards) {
    for (const k of FIELDS) {
      if (typeof c[k] === 'string' && (c[k] as string).includes(NL)) {
        c[k] = (c[k] as string).split(NL).join(ESCAPED);
        fixed++;
      }
    }
  }
  writeFileSync(CARDS_PATH, JSON.stringify(cards, null, 2));
  console.log(`✓ fixed ${fixed} fields with literal newlines → \\n`);
}

main();
