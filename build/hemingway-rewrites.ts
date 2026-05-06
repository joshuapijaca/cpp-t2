// Hand-curated Hemingway rewrites for filler-led memorize cards.
// Apply: replace fact + regen keyChecks from new fact tokens.
// Plus: add context field (= outline.fact) to every memorize card per Option E.
//
// Run: npx tsx build/hemingway-rewrites.ts (mutates data/cards.json in place)

import { readFileSync, writeFileSync } from 'fs';
import yaml from 'js-yaml';
import { glob } from 'glob';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const CARDS_PATH = resolve(ROOT, 'data/cards.json');

// Atom-keyed rewrites: facts (old → new). Multiple per atom OK.
const REWRITES: Record<string, Array<{ from: string; to: string; keys?: string[] }>> = {
  'A-01': [{ from: 'use + for sum', to: '+ sums two numbers', keys: ['+', 'sums'] }],
  'A-02': [{ from: 'use - for difference', to: '- subtracts', keys: ['-', 'subtracts'] }],
  'A-03': [{ from: 'use * for product', to: '* multiplies', keys: ['*', 'multiplies'] }],
  'A-04': [{ from: 'use / for quotient', to: '/ divides', keys: ['/', 'divides'] }],
  'A-05': [
    { from: 'use % for remainder', to: '% gives remainder', keys: ['%', 'remainder'] },
    { from: 'a % b = leftover', to: 'a % b = remainder', keys: ['%', 'remainder'] },
  ],
  'A-08': [{ from: 'use () to control order', to: '() forces evaluation order', keys: ['()', 'forces'] }],
  'C-01': [
    { from: 'use == not = for compare', to: '== compares; = assigns', keys: ['==', 'compares'] },
    { from: 'a == b is true if equal', to: 'a == b: true if equal', keys: ['==', 'equal'] },
  ],
  'C-02': [{ from: 'a != b true if differ', to: 'a != b: true if differ', keys: ['!=', 'differ'] }],
  'C-05': [
    { from: 'use <= for inclusive', to: '<= = less or equal', keys: ['<=', 'less'] },
    { from: 'a <= b includes equal', to: 'a <= b: includes equal', keys: ['<=', 'equal'] },
  ],
  'C-06': [
    { from: 'use >= for inclusive', to: '>= = greater or equal', keys: ['>=', 'greater'] },
    { from: 'a >= b includes equal', to: 'a >= b: includes equal', keys: ['>=', 'equal'] },
  ],
  'L-01': [{ from: 'use && for AND', to: '&& = logical AND', keys: ['&&', 'AND'] }],
  'L-02': [{ from: 'use || for OR', to: '|| = logical OR', keys: ['||', 'OR'] }],
  'L-03': [{ from: 'use ! to invert', to: '! flips bool', keys: ['!', 'flips'] }],
  'F-01': [{ from: 'use if for branching', to: 'if (cond) branches', keys: ['if', 'branches'] }],
  'F-03': [{ from: 'use else if to add cases', to: 'else if chains conditions', keys: ['else if', 'chains'] }],
  'W-01': [{ from: 'use while for unknown count', to: 'while loops while cond true', keys: ['while', 'cond'] }],
  'W-03': [{ from: 'use for when count known', to: 'for-loop with counter', keys: ['for', 'counter'] }],
  'H-05': [{ from: 'use return for output', to: 'return sends value back', keys: ['return', 'value'] }],
  'H-06': [{ from: 'use void when no value', to: 'void = no return value', keys: ['void', 'return'] }],
  'I-01': [{ from: 'use cin for user typing', to: 'cin = stdin stream', keys: ['cin', 'stdin'] }],
  'I-07': [{ from: 'use getline for sentences', to: 'getline reads full line', keys: ['getline', 'line'] }],
  'O-01': [{ from: 'use cout for output', to: 'cout = stdout stream', keys: ['cout', 'stdout'] }],
  'O-03': [{ from: 'use double quotes for text', to: 'double quotes mark text', keys: ['quotes', 'text'] }],
  'O-05': [{ from: 'use endl after output', to: 'endl ends cout line', keys: ['endl', 'line'] }],
  'O-06': [{ from: 'use \\n inside quotes', to: '\\n in quotes = newline', keys: ['\\n', 'newline'] }],
  'O-08': [{ from: 'use printf in Q4', to: 'Q4 output uses printf', keys: ['Q4', 'printf'] }],
  'O-09': [{ from: 'use %d to print int', to: '%d prints int', keys: ['%d', 'int'] }],
  'O-10': [{ from: 'use %s for char array', to: '%s prints C-string', keys: ['%s', 'string'] }],
  'O-11': [{ from: 'add \\n to wrap output', to: '\\n in printf = newline', keys: ['\\n', 'printf', 'newline'] }],
  'V-06': [{ from: 'use name in expression to read', to: 'name in expr reads value', keys: ['name', 'reads'] }],
  'V-11': [{ from: 'use double for non-integer', to: 'double = decimal type', keys: ['double', 'decimal'] }],
  'V-12': [{ from: 'use string for words sentences', to: 'string = text type', keys: ['string', 'text'] }],
  'V-20': [{ from: 'add <string> to use string', to: 'string needs <string>', keys: ['<string>', 'needs'] }],
  'S-05': [{ from: 'use { for function body', to: '{ opens body', keys: ['{', 'opens'] }],
  'S-08': [{ from: 'use // for notes', to: '// = single-line comment', keys: ['//', 'comment'] }],
  'G-05': [{ from: 'use [i] to read or write', to: '[i] reads or writes slot', keys: ['[i]', 'slot'] }],
  'G-08': [{ from: 'do not read or write arr[N]', to: 'arr[N] = out of bounds', keys: ['arr[N]', 'bounds'] }],
  'G-09': [{ from: 'use const for array size', to: 'const int MAX = N;', keys: ['const', 'MAX'] }],
  'G-10': [{ from: 'use & param instead of return', to: '& param replaces return', keys: ['&', 'param'] }],
  'G-11': [{ from: 'use for loop with i < N', to: 'for (i = 0; i < N; i++) iterates', keys: ['for', 'i < N'] }],
  'T-05': [{ from: 'use struct type like any type', to: 'struct type like any type', keys: ['struct', 'type'] }],
  'T-06': [{ from: 'use dot for struct field', to: 'dot accesses struct field', keys: ['dot', 'field'] }],
  'T-08': [{ from: 'use dot to read field', to: 'dot reads struct field', keys: ['dot', 'reads'] }],
  'PC-06': [{ from: 'use const & for read-only struct', to: 'const & = read-only struct', keys: ['const', 'read-only'] }],
  'SW-04': [{ from: 'use type the spec says', to: 'field type per spec', keys: ['type', 'spec'] }],
  'RW-04': [{ from: 'use < count not <=', to: '< count not <= count', keys: ['<', 'count'] }],
  'RW-05': [{ from: 'use >> for input', to: '>> reads cin to var', keys: ['>>', 'cin'] }],
  'MW-02': [{ from: 'use const for array size', to: 'const int MAX = 100;', keys: ['const', 'MAX'] }],
  'MW-03': [{ from: 'use array of structs', to: 'X list[MAX]; array of structs', keys: ['list[MAX]', 'array'] }],
  'MW-09': [{ from: 'use .c_str() with %s', to: '.c_str() for printf %s', keys: ['.c_str()', '%s'] }],
};

interface MemorizeCard {
  type: 'memorize';
  atomId: string;
  fact: string;
  keyChecks: string[];
  context?: string;
  [key: string]: unknown;
}

interface AnyCard {
  type: string;
  atomId: string;
  fact?: string;
  [key: string]: unknown;
}

interface Outline {
  id: string;
  fact: string;
  status: string;
}

function loadOutlines(): Map<string, Outline> {
  const files = glob.sync('outlines/**/*.yml', { cwd: ROOT });
  const m = new Map<string, Outline>();
  for (const f of files) {
    const o = yaml.load(readFileSync(resolve(ROOT, f), 'utf8')) as Outline;
    if (o && o.id) m.set(o.id, o);
  }
  return m;
}

function main() {
  const cards = JSON.parse(readFileSync(CARDS_PATH, 'utf8')) as AnyCard[];
  const outlines = loadOutlines();

  let rewrites = 0;
  let contextAdded = 0;

  for (const c of cards) {
    if (c.type !== 'memorize') continue;
    const m = c as MemorizeCard;

    // Apply rewrite if matched
    const rules = REWRITES[m.atomId];
    if (rules) {
      for (const r of rules) {
        if (m.fact === r.from) {
          m.fact = r.to;
          if (r.keys) m.keyChecks = r.keys;
          rewrites++;
          break;
        }
      }
    }

    // Add context (= outline.fact) to every memorize card if missing or different
    const o = outlines.get(m.atomId);
    if (o && o.fact && o.fact !== m.fact) {
      m.context = o.fact;
      contextAdded++;
    } else if (o && o.fact === m.fact) {
      // Variant matches canonical exactly — context redundant, skip
      delete m.context;
    }
  }

  writeFileSync(CARDS_PATH, JSON.stringify(cards, null, 2));
  console.log(`✓ rewrote ${rewrites} filler-led facts`);
  console.log(`✓ added context to ${contextAdded} memorize cards`);
  console.log(`  total cards: ${cards.length}`);
}

main();
