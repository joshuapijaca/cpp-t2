// One-shot generator for M9 cards.
// 73 foundation atoms × 5 memorize = 365 cards
// MCQ cards: 1 per atom that has render_hints.mcq (cap discipline)
// Plus a small set of synthesized MCQ for axiom + RDS contrast (~25)
// Plus write cards where outline has L1 fill template
// Total ~430 new cards.
//
// Run: npx tsx build/gen-m9-cards.ts (appends to data/cards.json)

import { readFileSync, writeFileSync } from 'fs';
import yaml from 'js-yaml';
import { glob } from 'glob';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const CARDS_PATH = resolve(ROOT, 'data/cards.json');

interface RenderHints {
  memorize_seed_phrases?: string[];
  write_L1_fill?: { template?: string; blank_value?: string };
  mcq?: { stem: string; correct: string; distractors: string[] };
}

interface Outline {
  id: string;
  fact: string;
  level: number;
  status: string;
  render_hints?: RenderHints;
  lint?: { forbid_tokens?: string[] };
}

interface MemorizeCardOut {
  type: 'memorize';
  atomId: string;
  fact: string;
  flashSeconds: number;
  mode: 'race' | 'recall';
  keyChecks: string[];
  explanation: string;
}

interface MCQCardOut {
  type: 'mcq';
  atomId: string;
  stem: string;
  correct: string;
  distractors: [string, string, string];
  explanation: string;
}

interface WriteCardOut {
  type: 'write';
  atomId: string;
  level: 1 | 2 | 3;
  spec: string;
  template?: string;
  expectedAnswer: string;
  keyChecks: string[];
  forbidden?: string[];
  explanation: string;
}

type CardOut = MemorizeCardOut | MCQCardOut | WriteCardOut;

function deriveKeyChecks(fact: string): string[] {
  const STOP = new Set(['a', 'an', 'the', 'is', 'are', 'be', 'to', 'in', 'on', 'of', 'or', 'and', 'with', 'by', 'for', 'as', 'at', 'it']);
  const words = fact
    .toLowerCase()
    .replace(/[(){};.,]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w))
    .slice(0, 4);
  return words.slice(0, Math.min(3, Math.max(2, words.length)));
}

function loadOutlines(): Outline[] {
  const files = glob.sync('outlines/**/*.yml', { cwd: ROOT });
  return files
    .map((f) => yaml.load(readFileSync(resolve(ROOT, f), 'utf8')) as Outline)
    .filter((o) => o && o.status === 'locked');
}

function memorizeCardsFor(o: Outline): MemorizeCardOut[] {
  const seeds = o.render_hints?.memorize_seed_phrases ?? [o.fact];
  return seeds.slice(0, 5).map((s) => ({
    type: 'memorize',
    atomId: o.id,
    fact: s,
    flashSeconds: 3,
    mode: 'recall' as const,
    keyChecks: deriveKeyChecks(s),
    explanation: o.fact + '. (Per outline.)',
  }));
}

function mcqFor(o: Outline): MCQCardOut[] {
  if (!o.render_hints?.mcq) return [];
  const m = o.render_hints.mcq;
  if (!m.distractors || m.distractors.length < 3) return [];
  return [{
    type: 'mcq',
    atomId: o.id,
    stem: m.stem,
    correct: m.correct,
    distractors: [m.distractors[0]!, m.distractors[1]!, m.distractors[2]!],
    explanation: o.fact,
  }];
}

function writeCardsForAtom(o: Outline): WriteCardOut[] {
  const cards: WriteCardOut[] = [];
  const rh = o.render_hints;
  if (!rh) return cards;
  const forbid = o.lint?.forbid_tokens ?? [];

  if (rh.write_L1_fill?.template && rh.write_L1_fill?.blank_value) {
    cards.push({
      type: 'write',
      atomId: o.id,
      level: 1,
      spec: 'Fill the blank to complete this code:',
      template: rh.write_L1_fill.template,
      expectedAnswer: rh.write_L1_fill.blank_value,
      keyChecks: [rh.write_L1_fill.blank_value.replace(/[;{}]/g, '').trim().toLowerCase()].filter(Boolean),
      forbidden: forbid.length > 0 ? forbid : undefined,
      explanation: o.fact,
    });
  }

  return cards;
}

// Synthesized MCQ for axiom + key contrast atoms
function syntheticMCQs(): MCQCardOut[] {
  return [
    { type: 'mcq', atomId: 'V-08', stem: 'Which compares for equality?', correct: '==', distractors: ['=', '<<', ':='], explanation: '== tests equality; = is assignment.' },
    { type: 'mcq', atomId: 'V-10', stem: 'Which type holds whole numbers?', correct: 'int', distractors: ['double', 'string', 'bool'], explanation: 'int holds integers.' },
    { type: 'mcq', atomId: 'V-12', stem: 'Which type holds text like "hello"?', correct: 'string', distractors: ['int', 'char', 'double'], explanation: 'string holds sequences of characters.' },
    { type: 'mcq', atomId: 'A-04', stem: 'What is the result of int division 7 / 2 in C++?', correct: '3', distractors: ['3.5', '4', '0.5'], explanation: 'int / int truncates the decimal part.' },
    { type: 'mcq', atomId: 'A-10', stem: 'Which increments a variable by 1?', correct: 'x++', distractors: ['x += 2', 'x = +1', 'x = x'], explanation: 'x++ adds 1 to x.' },
    { type: 'mcq', atomId: 'C-03', stem: 'What does a < b return?', correct: 'a bool', distractors: ['a number', 'an int', 'nothing'], explanation: 'Comparisons produce a bool result.' },
    { type: 'mcq', atomId: 'F-01', stem: 'When does the if-body run?', correct: 'when condition is true', distractors: ['always', 'when condition is false', 'never'], explanation: 'if-body runs when condition is true.' },
    { type: 'mcq', atomId: 'W-03', stem: 'Which part of a for-loop runs once?', correct: 'init', distractors: ['cond', 'step', 'body'], explanation: 'init runs once at start; cond/step run each iteration.' },
    { type: 'mcq', atomId: 'H-04', stem: 'A non-reference parameter:', correct: 'is a local copy of the argument', distractors: ['shares memory with caller', 'references the caller', 'is undefined'], explanation: 'Default param is a value-copy local to the function.' },
    { type: 'mcq', atomId: 'H-09', stem: 'When does a local variable cease to exist?', correct: 'when the function returns', distractors: ['never', 'at compile time', 'when re-assigned'], explanation: 'Locals die when the function returns and the frame is popped.' },
    // RDS-adjacent
    { type: 'mcq', atomId: 'R-03', stem: 'What does & before a parameter name mean?', correct: 'the parameter aliases the caller variable', distractors: ['address-of operator', 'pointer dereference', 'logical AND'], explanation: '& on a parameter creates a reference; same memory, two names.' },
    { type: 'mcq', atomId: 'R-05', stem: 'After f(int &x) modifies x, the caller variable:', correct: 'is also modified', distractors: ['is unchanged', 'is reset to default', 'is undefined'], explanation: '& parameter shares the caller box; mutation persists.' },
    { type: 'mcq', atomId: 'PC-04', stem: 'Q3 SIT102 idiom for a mutable array param is:', correct: 'void f(T &list[], int n)', distractors: ['void f(T *list, int n)', 'void f(T list[], int n)', 'T f(int n)'], explanation: '&list[] is the SIT102 idiom; not pointer-style.' },
    { type: 'mcq', atomId: 'T-04', stem: 'A struct definition in C++ ends with:', correct: '};', distractors: ['}', ';', '});'], explanation: 'Struct definition closes with }; (close brace + semicolon).' },
    { type: 'mcq', atomId: 'MW-09', stem: 'How do you print a C++ string with printf %s?', correct: 'pass .c_str() of the string', distractors: ['pass the string directly', 'use std::print', 'use printf %S (capital)'], explanation: '.c_str() converts to const char* needed by printf %s.' },
  ];
}

function main() {
  const outlines = loadOutlines();
  const m9Outlines = outlines.filter((o) => [-1, 2, 4, 5, 6, 7, 8].includes(o.level));

  const newCards: CardOut[] = [];
  for (const o of m9Outlines) {
    newCards.push(...memorizeCardsFor(o));
    newCards.push(...mcqFor(o));
    newCards.push(...writeCardsForAtom(o));
  }

  newCards.push(...syntheticMCQs());

  const existing = JSON.parse(readFileSync(CARDS_PATH, 'utf8')) as unknown[];
  const merged = [...existing, ...newCards];

  writeFileSync(CARDS_PATH, JSON.stringify(merged, null, 2));
  console.log(`generated ${newCards.length} new cards.`);
  console.log(`total cards: ${merged.length}`);
}

main();
