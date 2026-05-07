// =====================================================================
// cpp-t2 / build-v2 / gen-l1-s3-components.ts
// SA-L1-S3-Components — emit 30 atoms + 248 cards for L1 stage S3.
//
// Per docs/16 §3.4. 30 atomic mental ops drilled in isolation. Cards
// hand-crafted via this generator, NOT mass-LLM. Every card is a
// real-V2.0-shape exposure (`stat_double`, `numbers[SIZE]`, `mystery`).
//
// Run once: npx tsx build-v2/gen-l1-s3-components.ts
// Idempotent: re-running overwrites identical files.
// =====================================================================

import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import yaml from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '..');
const ATOMS_DIR = resolve(ROOT, 'data/v2/atoms/L1/S3-components');
const CARDS_DIR = resolve(ROOT, 'data/v2/cards/L1/S3-components');

mkdirSync(ATOMS_DIR, { recursive: true });
mkdirSync(CARDS_DIR, { recursive: true });

function dump(p: string, obj: unknown) {
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, yaml.dump(obj, { lineWidth: 100, noRefs: true }) + '\n', 'utf8');
}

// ---------------------------------------------------------------------
// Skill spec table (id, count, label, prereqs, qTags, mistakes)
// ---------------------------------------------------------------------

interface Skill {
  id: string;
  n: number;
  name: string;
  teaches: string;
  prereqs: string[];
  q: string[];
  cms: string[];
}

const SKILLS: Skill[] = [
  { id: 'C-01', n: 12, name: 'Parse outer brace = struct',           teaches: 'Outer braces in `{ {…}, x }` enclose the whole stat_double struct.', prereqs: ['F-08', 'F-20'], q: ['Q1'], cms: ['CM-C01a', 'CM-C01b'] },
  { id: 'C-02', n: 14, name: 'Parse inner brace = array',            teaches: 'Inner braces enclose the 5 doubles for `numbers[SIZE]`.',          prereqs: ['F-08', 'F-19'], q: ['Q1'], cms: ['CM-C02a', 'CM-C02b'] },
  { id: 'C-03', n: 16, name: 'Map values to indices 0..4',           teaches: 'First inner value = numbers[0]; last = numbers[4]. Index starts at 0.', prereqs: ['F-19'], q: ['Q1'], cms: ['CM-C03a', 'CM-C03b'] },
  { id: 'C-04', n: 8,  name: 'Draw 5 array cells',                   teaches: 'Sketch 5 boxes labelled numbers[0]..numbers[4] before tracing.',  prereqs: ['F-19'], q: ['Q1'], cms: ['CM-C04a'] },
  { id: 'C-05', n: 4,  name: 'Draw 1 scalar cell',                   teaches: 'Sketch 1 box labelled mystery for the scalar field.',             prereqs: ['F-20'], q: ['Q1'], cms: ['CM-C05a'] },
  { id: 'C-06', n: 18, name: 'Fill cells from brace-init',           teaches: 'Copy each brace-init value into its index/cell in order.',         prereqs: ['F-19', 'F-20'], q: ['Q1'], cms: ['CM-C06a', 'CM-C06b'] },
  { id: 'C-07', n: 8,  name: 'Pre-loop init mystery=0.0',            teaches: 'Before the loop, write 0.0 in the mystery cell (sum/count init).', prereqs: ['F-10', 'F-12'], q: ['Q1'], cms: ['CM-C07a'] },
  { id: 'C-08', n: 10, name: 'Pre-loop init mystery=numbers[0]',     teaches: 'Before the loop, copy numbers[0] into mystery (find-max/min init).', prereqs: ['F-10', 'F-12', 'F-14a'], q: ['Q1'], cms: ['CM-C08a'] },
  { id: 'C-09', n: 6,  name: 'Read for-loop init i=0',               teaches: 'The for-header init `int i = 0` runs once and sets i to 0.',     prereqs: ['F-09', 'F-18'], q: ['Q1'], cms: ['CM-C09a'] },
  { id: 'C-10', n: 12, name: 'Evaluate i<SIZE true',                 teaches: 'When i is 0..4 and SIZE is 5, `i<SIZE` is true; body runs.',     prereqs: ['F-16', 'F-18'], q: ['Q1'], cms: ['CM-C10a'] },
  { id: 'C-11', n: 8,  name: 'Evaluate i<SIZE false → exit',         teaches: 'When i==5, `i<SIZE` is false; body skipped, loop exits.',         prereqs: ['F-16', 'F-18'], q: ['Q1'], cms: ['CM-C11a', 'CM-C11b'] },
  { id: 'C-12', n: 10, name: 'Execute i++',                          teaches: 'After the body, i++ adds 1 to i (post-step in for-header).',     prereqs: ['F-18'], q: ['Q1'], cms: ['CM-C12a'] },
  { id: 'C-13', n: 12, name: 'Order: header → body → post',          teaches: 'Each iter: test guard → run body → run i++ → re-test guard.',    prereqs: ['F-18'], q: ['Q1'], cms: ['CM-C13a', 'CM-C13b'] },
  { id: 'C-14', n: 14, name: 'Evaluate data.numbers[i]',             teaches: '`data.numbers[i]` = look up the i-th cell, NOT the value of i.', prereqs: ['F-19', 'F-21'], q: ['Q1'], cms: ['CM-C14a', 'CM-C14b'] },
  { id: 'C-15', n: 6,  name: 'Evaluate data.mystery',                teaches: '`data.mystery` reads the current value in the mystery cell.',     prereqs: ['F-20', 'F-21'], q: ['Q1'], cms: ['CM-C15a'] },
  { id: 'C-16', n: 14, name: 'Evaluate numbers[i] > mystery',        teaches: 'Compare the cell value vs the running scalar; produces bool.',   prereqs: ['F-16', 'F-19'], q: ['Q1'], cms: ['CM-C16a'] },
  { id: 'C-17', n: 12, name: 'Evaluate numbers[i] > 0',              teaches: 'Test if the cell value is positive (the V2.0 sum-positive guard).', prereqs: ['F-16', 'F-19'], q: ['Q1'], cms: ['CM-C17a'] },
  { id: 'C-18', n: 8,  name: 'Evaluate numbers[i] < 0',              teaches: 'Test if the cell value is negative (sum-negative guard).',       prereqs: ['F-16', 'F-19'], q: ['Q1'], cms: ['CM-C18a'] },
  { id: 'C-19', n: 6,  name: 'Evaluate numbers[i] % 2 == 0',         teaches: 'Test if the cell value is even (remainder-zero primer).',        prereqs: ['F-16', 'F-19'], q: ['Q1'], cms: ['CM-C19a'] },
  { id: 'C-20', n: 8,  name: 'Take if-branch when true',             teaches: 'When the if-condition is true, the body runs.',                  prereqs: ['F-17'], q: ['Q1'], cms: ['CM-C20a'] },
  { id: 'C-21', n: 8,  name: 'Skip if-branch when false',            teaches: 'When the if-condition is false, the body is skipped (mystery unchanged).', prereqs: ['F-17'], q: ['Q1'], cms: ['CM-C21a'] },
  { id: 'C-22', n: 10, name: 'Mutation: mystery = numbers[i]',       teaches: 'Overwrite mystery with the i-th cell (find-max/min update).',   prereqs: ['F-12', 'F-19', 'F-21'], q: ['Q1'], cms: ['CM-C22a'] },
  { id: 'C-23', n: 14, name: 'Mutation: mystery = mystery+numbers[i]', teaches: 'Add numbers[i] to mystery and store back (sum accumulator).',  prereqs: ['F-12', 'F-14a', 'F-19'], q: ['Q1'], cms: ['CM-C23a', 'CM-C23b'] },
  { id: 'C-24', n: 8,  name: 'Mutation: mystery = mystery*numbers[i]', teaches: 'Multiply mystery by numbers[i] and store back (product accumulator).', prereqs: ['F-12', 'F-14a', 'F-19'], q: ['Q1'], cms: ['CM-C24a'] },
  { id: 'C-25', n: 8,  name: 'Mutation: count = count + 1',          teaches: 'Increment a counter scalar (counting accumulator).',              prereqs: ['F-12', 'F-14a'], q: ['Q1'], cms: ['CM-C25a'] },
  { id: 'C-26', n: 8,  name: 'Strikethrough notation',               teaches: 'Cross out the old value when overwriting; trail = breadcrumb.', prereqs: ['F-12'], q: ['Q1'], cms: ['CM-C26a', 'CM-C26b'] },
  { id: 'C-27', n: 6,  name: 'Trail-of-three on same cell',          teaches: 'Up to three values can stack in one cell with two strike-throughs.', prereqs: ['F-12'], q: ['Q1'], cms: ['CM-C27a'] },
  { id: 'C-28', n: 4,  name: 'End-of-loop: read final mystery',      teaches: 'After the loop exits, the live (un-struck) value is the answer.', prereqs: ['F-18', 'F-20'], q: ['Q1'], cms: ['CM-C28a'] },
  { id: 'C-29', n: 6,  name: "Don't mutate array cells",             teaches: 'numbers[i] is read-only in Q1; only mystery / count change.',    prereqs: ['F-19'], q: ['Q1'], cms: ['CM-C29a'] },
  { id: 'C-30', n: 4,  name: 'Pass-by-ref = same memory',            teaches: 'who_am_i(stat_double &data) edits the caller`s struct directly.', prereqs: ['F-22b', 'F-22d'], q: ['Q1'], cms: ['CM-C30a'] },
];

// quick total assert — per-skill numbers sum to 282 (spec table); the
// task header rounds to "248" but the canonical per-skill counts win.
const TOTAL = SKILLS.reduce((a, s) => a + s.n, 0);
console.log(`per-skill total = ${TOTAL} cards (header said 248; per-skill table sums to 282)`);

// ---------------------------------------------------------------------
// Atom emitter
// ---------------------------------------------------------------------

function emitAtom(s: Skill) {
  const obj = {
    id: s.id,
    name: s.name,
    level: 'L1',
    teaches: s.teaches,
    prereqs: s.prereqs,
    usedByQs: s.q,
    cardCountTarget: s.n,
    source: [
      {
        kind: 'v2',
        ref: `cpp-t2/docs/16_test2_specific_redesign_v2.md § 3.4 ${s.id}`,
        quote: `${s.id}: ${s.n} cards. ${s.name}.`,
      },
      {
        kind: 'practice',
        ref: 'practice/V2.0 (stat_double / numbers[SIZE] / mystery / who_am_i)',
      },
    ],
    commonMistakes: s.cms,
    notes: { stage: 'L1-S3 components', drill: 'atomic mental op, isolate to automaticity' },
  };
  dump(`${ATOMS_DIR}/${s.id}.yml`, obj);
}

// ---------------------------------------------------------------------
// Card factory helpers
// ---------------------------------------------------------------------

const COMMON = (s: Skill, idx: number, type: string, suffix?: string) => ({
  id: `L1-S3-${s.id}-${(suffix ?? type.toLowerCase().replace('card','')).slice(0,20)}-${String(idx).padStart(2,'0')}`,
  schemaVersion: 'v2',
  atomId: s.id,
  qTags: s.q,
  stage: 3,
  level: 'L1',
  type,
  status: 'NEW',
  authoringStatus: 'DRAFT',
  createdBy: 'SA-L1-S3-Components',
  source: {
    kind: 'v2',
    ref: `cpp-t2/docs/16_test2_specific_redesign_v2.md § 3.4 ${s.id}`,
  },
  commonMistakeIds: s.cms,
});

// 5-cell brace-inits (real V2.0 shape, no SIZE mismatch)
const INITS: Array<{ vals: number[]; init: number; name: string }> = [
  { vals: [2.4, -3.7, -1.7, 3.0, 2.0],  init: -0.9, name: 'V2.0 attempt-1 (sum-positive = 7.4)' },
  { vals: [1.0, 2.0, 3.0, 4.0, 5.0],     init: 0.0,  name: 'all-positive ascending (sum = 15.0)' },
  { vals: [5.0, 4.0, 3.0, 2.0, 1.0],     init: 0.0,  name: 'all-positive descending (find-max = 5.0)' },
  { vals: [-1.0, -2.0, -3.0, -4.0, -5.0], init: 0.0, name: 'all-negative (sum-positive = 0.0)' },
  { vals: [3.0, -2.0, 4.0, -1.0, 5.0],   init: 0.0,  name: 'mixed (sum-positive = 12.0)' },
  { vals: [0.0, 0.0, 0.0, 0.0, 0.0],     init: 7.7,  name: 'all-zero (mystery stays at init)' },
  { vals: [10.0, 0.0, -5.0, 2.5, -7.5],  init: 1.0,  name: 'mixed double (sum-positive = 12.5)' },
  { vals: [4.0, 4.0, 4.0, 4.0, 4.0],     init: 0.0,  name: 'flat 4 (sum = 20.0, max = 4.0)' },
  { vals: [-3.0, 6.0, -1.0, 8.0, -2.0],  init: 0.0,  name: 'mixed (sum-negative = -6.0)' },
  { vals: [1.5, 2.5, 3.5, 4.5, 5.5],     init: 0.0,  name: 'fractional ascending (sum = 17.5)' },
];

// pick init by index (round-robin across distractors)
const PICK = (i: number) => INITS[i % INITS.length];

const STRUCT_BLOCK =
`struct stat_double {
  double numbers[SIZE];
  double mystery;
};`;

const Q1_FN_HEADER = `void who_am_i(stat_double &data) {`;

function fmtBraceInit(v: number[], init: number): string {
  return `{ {${v.map(x => x.toString()).join(', ')}}, ${init.toString()} }`;
}

// ---------------------------------------------------------------------
// Per-skill card generators
// ---------------------------------------------------------------------

const cards: Record<string, unknown[]> = {};
for (const s of SKILLS) cards[s.id] = [];

// ----- C-01..C-06: parsing/drawing -----------------------------------

// C-01 (12) — Parse outer brace = struct ; MCQ + Decompose
function genC01(s: Skill) {
  for (let i = 0; i < s.n; i++) {
    const init = PICK(i);
    const lit = fmtBraceInit(init.vals, init.init);
    const isMCQ = i % 2 === 0;
    if (isMCQ) {
      cards[s.id].push({
        ...COMMON(s, i, 'MCQCard', 'mcq'),
        stem: `In \`stat_double d = ${lit};\`, what does the *outer* pair of braces represent?`,
        correct: 'The whole struct value — both fields (the array and mystery) bundled together.',
        distractors: [
          'Only the array field — the inner brace is decoration.',
          'A function call returning a struct — braces are arguments.',
          'A new namespace — braces declare a scope, not a value.',
        ],
        explanation: 'Outer braces are the **struct brace-init list**: every field of `stat_double` in declared order. Inner brace is the array sub-init.',
      });
    } else {
      cards[s.id].push({
        ...COMMON(s, i, 'DecomposeCard', 'decomp'),
        stem: 'Identify what the outer braces enclose.',
        code: `${STRUCT_BLOCK}\nstat_double d = ${lit};`,
        question: 'What is the *outer* brace pair enclosing?',
        options: [
          { label: 'A', text: 'Just the array values — outer = inner.' },
          { label: 'B', text: 'The whole struct: array field + mystery field.' },
          { label: 'C', text: 'A C++ scope block; nothing to do with the struct.' },
          { label: 'D', text: 'A function body for `d`.' },
        ],
        correctLabel: 'B',
        explanation: 'Outer braces = the struct brace-init list, listing every field in declared order. Inner = the array sub-init.',
      });
    }
  }
}

// C-02 (14) — Parse inner brace = array elements
function genC02(s: Skill) {
  for (let i = 0; i < s.n; i++) {
    const init = PICK(i);
    const lit = fmtBraceInit(init.vals, init.init);
    const isMCQ = i % 2 === 0;
    if (isMCQ) {
      cards[s.id].push({
        ...COMMON(s, i, 'MCQCard', 'mcq'),
        stem: `In \`stat_double d = ${lit};\`, what does the *inner* brace pair enclose?`,
        correct: `The 5 elements that fill numbers[0]..numbers[4].`,
        distractors: [
          'A nested struct definition with 5 fields.',
          'A function-style cast that converts the doubles into one value.',
          'A list of arguments passed to the constructor of stat_double.',
        ],
        explanation: 'Inner braces are the **array brace-init**: 5 doubles map to numbers[0]..numbers[4] in order.',
      });
    } else {
      cards[s.id].push({
        ...COMMON(s, i, 'DecomposeCard', 'decomp'),
        stem: 'Identify what the inner braces enclose.',
        code: `${STRUCT_BLOCK}\nstat_double d = ${lit};`,
        question: 'What is the inner brace pair enclosing?',
        options: [
          { label: 'A', text: 'The 5 array values, mapped to numbers[0]..numbers[4].' },
          { label: 'B', text: 'The single mystery value.' },
          { label: 'C', text: 'A nested anonymous struct with 5 fields.' },
          { label: 'D', text: 'A discarded comment block.' },
        ],
        correctLabel: 'A',
        explanation: 'Inner braces = the array sub-init; each value lands in numbers[0]..numbers[4] in order.',
      });
    }
  }
}

// C-03 (16) — Map values to indices
function genC03(s: Skill) {
  for (let i = 0; i < s.n; i++) {
    const init = PICK(i);
    const lit = fmtBraceInit(init.vals, init.init);
    const askIdx = i % 5;
    const expected = init.vals[askIdx];
    const isMCQ = i % 2 === 0;
    if (isMCQ) {
      cards[s.id].push({
        ...COMMON(s, i, 'MCQCard', 'mcq'),
        stem: `Given \`stat_double d = ${lit};\` — what is the value of \`d.numbers[${askIdx}]\`?`,
        correct: expected.toString(),
        distractors: [
          (init.vals[(askIdx + 1) % 5]).toString(),
          (init.vals[(askIdx + 4) % 5]).toString(),
          init.init.toString(),
        ],
        explanation: `Index ${askIdx} maps to the ${askIdx === 0 ? '1st' : askIdx === 1 ? '2nd' : askIdx === 2 ? '3rd' : askIdx === 3 ? '4th' : '5th'} inner value: ${expected}.`,
      });
    } else {
      cards[s.id].push({
        ...COMMON(s, i, 'DecomposeCard', 'decomp'),
        stem: `Match brace-init values to array indices.`,
        code: `${STRUCT_BLOCK}\nstat_double d = ${lit};`,
        question: `Which option pairs values to indices correctly?`,
        options: [
          { label: 'A', text: `numbers[1] = ${init.vals[0]}, numbers[2] = ${init.vals[1]}, numbers[3] = ${init.vals[2]}, numbers[4] = ${init.vals[3]}, numbers[5] = ${init.vals[4]}` },
          { label: 'B', text: `numbers[0] = ${init.vals[0]}, numbers[1] = ${init.vals[1]}, numbers[2] = ${init.vals[2]}, numbers[3] = ${init.vals[3]}, numbers[4] = ${init.vals[4]}` },
          { label: 'C', text: `numbers[0] = ${init.vals[4]}, numbers[1] = ${init.vals[3]}, numbers[2] = ${init.vals[2]}, numbers[3] = ${init.vals[1]}, numbers[4] = ${init.vals[0]}` },
          { label: 'D', text: `numbers[0] = ${init.init}, numbers[1] = ${init.vals[0]}, numbers[2] = ${init.vals[1]}, numbers[3] = ${init.vals[2]}, numbers[4] = ${init.vals[3]}` },
        ],
        correctLabel: 'B',
        explanation: 'C++ arrays are 0-indexed and brace-init fills left-to-right: 1st value → index 0, 5th value → index 4.',
      });
    }
  }
}

// C-04 (8) — Draw 5 array cells
function genC04(s: Skill) {
  for (let i = 0; i < s.n; i++) {
    const isMCQ = i % 2 === 0;
    if (isMCQ) {
      cards[s.id].push({
        ...COMMON(s, i, 'MCQCard', 'mcq'),
        stem: `Before tracing Q1, you draw memory cells for \`double numbers[SIZE]\` (SIZE=5). How many cells do you draw, and what are their labels?`,
        correct: '5 cells, labelled numbers[0], numbers[1], numbers[2], numbers[3], numbers[4].',
        distractors: [
          '6 cells, labelled numbers[0]..numbers[5] (because SIZE=5 means 5 is included).',
          '5 cells, labelled numbers[1]..numbers[5] (1-indexed).',
          'No cells — arrays do not need separate boxes when tracing.',
        ],
        explanation: 'C++ arrays are 0-indexed and length SIZE means valid indices are 0..SIZE-1.',
      });
    } else {
      cards[s.id].push({
        ...COMMON(s, i, 'DecomposeCard', 'decomp'),
        stem: 'Pick the correctly-drawn memory layout for `numbers[SIZE]` (SIZE=5).',
        code: `${STRUCT_BLOCK}\nstat_double d;  // SIZE = 5`,
        question: 'Which layout is correct?',
        options: [
          { label: 'A', text: 'numbers[0]|numbers[1]|numbers[2]|numbers[3]|numbers[4]  — 5 cells, 0-indexed.' },
          { label: 'B', text: 'numbers[1]|numbers[2]|numbers[3]|numbers[4]|numbers[5]  — 5 cells, 1-indexed.' },
          { label: 'C', text: 'numbers[0]|numbers[1]|numbers[2]|numbers[3]|numbers[4]|numbers[5]  — 6 cells.' },
          { label: 'D', text: 'numbers       — single cell holding all 5 values.' },
        ],
        correctLabel: 'A',
        explanation: '5 cells, indexed 0..4. Drawing 6 cells (B/C) is the off-by-one trap.',
      });
    }
  }
}

// C-05 (4) — Draw 1 scalar cell
function genC05(s: Skill) {
  for (let i = 0; i < s.n; i++) {
    const isMCQ = i % 2 === 0;
    if (isMCQ) {
      cards[s.id].push({
        ...COMMON(s, i, 'MCQCard', 'mcq'),
        stem: 'For the scalar field `double mystery;` in stat_double, how many memory cells do you draw, and what is the label?',
        correct: '1 cell, labelled mystery (no index — it is a scalar).',
        distractors: [
          '5 cells — same as the numbers array.',
          '0 cells — scalars do not get drawn.',
          '1 cell, labelled mystery[0] (treat scalars like 1-element arrays).',
        ],
        explanation: 'A scalar is a single cell with the field name as the label. No index, no [].',
      });
    } else {
      cards[s.id].push({
        ...COMMON(s, i, 'DecomposeCard', 'decomp'),
        stem: 'Pick the correct sketch for the scalar `double mystery`.',
        code: `${STRUCT_BLOCK}\nstat_double d;`,
        question: 'Which option draws mystery correctly?',
        options: [
          { label: 'A', text: 'mystery[0] | mystery[1] | mystery[2]  — 3 cells.' },
          { label: 'B', text: 'mystery   — 1 cell, no index.' },
          { label: 'C', text: 'No cell — mystery is implicit and not drawn.' },
          { label: 'D', text: '5 cells — one per array slot.' },
        ],
        correctLabel: 'B',
        explanation: 'A scalar is one named cell. mystery has no [] anywhere — it is not an array.',
      });
    }
  }
}

// C-06 (18) — Fill cells from brace-init
function genC06(s: Skill) {
  for (let i = 0; i < s.n; i++) {
    const init = PICK(i);
    const lit = fmtBraceInit(init.vals, init.init);
    const isMCQ = i % 2 === 0;
    if (isMCQ) {
      cards[s.id].push({
        ...COMMON(s, i, 'MCQCard', 'mcq'),
        stem: `After \`stat_double d = ${lit};\` runs, what are the cell values?`,
        correct: `numbers: [${init.vals.join(', ')}], mystery: ${init.init}`,
        distractors: [
          `numbers: [${[...init.vals].reverse().join(', ')}], mystery: ${init.init}`,
          `numbers: [${init.vals.join(', ')}], mystery: ${init.vals[0]}`,
          `numbers: [${init.init}, ${init.vals.slice(0,4).join(', ')}], mystery: ${init.vals[4]}`,
        ],
        explanation: 'Inner brace fills numbers[0..4] left-to-right; the trailing scalar fills mystery.',
      });
    } else {
      cards[s.id].push({
        ...COMMON(s, i, 'DecomposeCard', 'decomp'),
        stem: 'Pick the cell-fill that matches the brace-init.',
        code: `${STRUCT_BLOCK}\nstat_double d = ${lit};`,
        question: 'Which fill is correct?',
        options: [
          { label: 'A', text: `numbers[0]=${init.vals[0]}, numbers[1]=${init.vals[1]}, numbers[2]=${init.vals[2]}, numbers[3]=${init.vals[3]}, numbers[4]=${init.vals[4]}, mystery=${init.init}` },
          { label: 'B', text: `numbers[0]=${init.init}, numbers[1]=${init.vals[0]}, numbers[2]=${init.vals[1]}, numbers[3]=${init.vals[2]}, numbers[4]=${init.vals[3]}, mystery=${init.vals[4]}` },
          { label: 'C', text: `numbers[0..4] all 0.0, mystery=${init.init}` },
          { label: 'D', text: `numbers and mystery both stay uninitialized — brace-init does nothing on a struct.` },
        ],
        correctLabel: 'A',
        explanation: 'Inner brace fills numbers[0..4] in order, scalar fills mystery. No re-shuffle.',
      });
    }
  }
}

// ----- C-07..C-12: loop semantics — TraceCard mini ------------------

function traceMini(s: Skill, i: number, code: string, variables: string[], steps: Array<{line: number; variable: string; value: string; output?: string | null}>, term: string[] = [], stem?: string, teachMe?: string) {
  const obj: Record<string, unknown> = {
    ...COMMON(s, i, 'TraceCard', 'trace'),
    stem: stem ?? `Hand-execute one step. Skill ${s.id}.`,
    code,
    variables,
    expectedTrace: steps.map(st => ({
      line: st.line,
      variable: st.variable,
      value: st.value,
      output: st.output ?? null,
    })),
    terminalOutput: term,
    inputMode: 'final-only',
  };
  if (teachMe) obj.teachMe = teachMe;
  return obj;
}

// C-07 (8) — pre-loop init mystery=0.0
function genC07(s: Skill) {
  for (let i = 0; i < s.n; i++) {
    const init = PICK(i);
    const lit = fmtBraceInit(init.vals, init.init);
    cards[s.id].push(traceMini(s, i,
`int main() {
  stat_double data = ${lit};
  data.mystery = 0.0;
  cout << data.mystery << endl;
  return 0;
}`,
      ['data.mystery'],
      [
        { line: 3, variable: 'data.mystery', value: '0.0' },
        { line: 4, variable: '', value: '', output: '0' },
      ],
      ['0'],
      `Step the pre-loop init line. After line 3, what is data.mystery?`,
      'Pre-loop init = before the for header. The line `data.mystery = 0.0;` overwrites the brace-init value with 0.0.'));
  }
}

// C-08 (10) — pre-loop init mystery=numbers[0]
function genC08(s: Skill) {
  for (let i = 0; i < s.n; i++) {
    const init = PICK(i);
    const lit = fmtBraceInit(init.vals, init.init);
    cards[s.id].push(traceMini(s, i,
`int main() {
  stat_double data = ${lit};
  data.mystery = data.numbers[0];
  cout << data.mystery << endl;
  return 0;
}`,
      ['data.mystery'],
      [
        { line: 3, variable: 'data.mystery', value: init.vals[0].toString() },
        { line: 4, variable: '', value: '', output: init.vals[0].toString() },
      ],
      [init.vals[0].toString()],
      `Step the find-max/find-min pre-loop init. After line 3, what is data.mystery?`,
      `Find-max/find-min seeds mystery with numbers[0] so the first compare has a valid baseline.`));
  }
}

// C-09 (6) — read for-loop init `int i = 0`
function genC09(s: Skill) {
  for (let i = 0; i < s.n; i++) {
    cards[s.id].push(traceMini(s, i,
`int main() {
  int i = 0;
  cout << i << endl;
  return 0;
}`,
      ['i'],
      [
        { line: 2, variable: 'i', value: '0' },
        { line: 3, variable: '', value: '', output: '0' },
      ],
      ['0'],
      `The for-header init clause runs once. After \`int i = 0;\`, what is i?`,
      `For-header init runs ONCE before the loop body, not on every iteration.`));
  }
}

// C-10 (12) — Evaluate `i<SIZE` true
function genC10(s: Skill) {
  // pick i values 0..4 -> all true at SIZE=5
  for (let i = 0; i < s.n; i++) {
    const iVal = i % 5;
    cards[s.id].push({
      ...COMMON(s, i, 'MCQCard', 'mcq'),
      stem: `SIZE is 5. The for-header guard \`i < SIZE\` is being tested. If i = ${iVal}, what is the result?`,
      correct: 'true (so the loop body runs this iteration)',
      distractors: [
        'false (so the loop exits)',
        `${iVal === 5 ? 'false' : 'true'} but the loop exits anyway`,
        'undefined — the comparison cannot be evaluated until i==SIZE',
      ],
      explanation: `${iVal} < 5 is true, so the body runs and the iteration continues.`,
    });
  }
}

// C-11 (8) — Evaluate i<SIZE false → exit
function genC11(s: Skill) {
  for (let i = 0; i < s.n; i++) {
    cards[s.id].push({
      ...COMMON(s, i, 'MCQCard', 'mcq'),
      stem: `SIZE is 5. After 5 iterations, i has become 5. Evaluate \`i < SIZE\`. What happens next?`,
      correct: 'false → the loop exits without running the body again.',
      distractors: [
        'true → the body runs one more time (off-by-one).',
        'true → the body runs but i is reset to 0.',
        'undefined behaviour — i==SIZE is illegal in C++.',
      ],
      explanation: '5 < 5 is false, so the body is SKIPPED on this re-test and control falls past the closing brace.',
    });
  }
}

// C-12 (10) — Execute i++
function genC12(s: Skill) {
  for (let i = 0; i < s.n; i++) {
    const before = i % 5;
    const after = before + 1;
    cards[s.id].push(traceMini(s, i,
`int main() {
  int i = ${before};
  i++;
  cout << i << endl;
  return 0;
}`,
      ['i'],
      [
        { line: 2, variable: 'i', value: before.toString() },
        { line: 3, variable: 'i', value: after.toString() },
        { line: 4, variable: '', value: '', output: after.toString() },
      ],
      [after.toString()],
      `Execute \`i++\`. If i is ${before} before, what is i after?`,
      `i++ adds 1 to i. In a for-loop, this runs AFTER the body, before the next guard test.`));
  }
}

// C-13 (12) — Order: header → body → post; DecomposeCard with reorder
function genC13(s: Skill) {
  for (let i = 0; i < s.n; i++) {
    cards[s.id].push({
      ...COMMON(s, i, 'DecomposeCard', 'decomp'),
      stem: 'Pick the correct execution order for ONE iteration of `for (int i = 0; i < SIZE; i++) { body }`.',
      code:
`for (int i = 0; i < SIZE; i++) {
  // body
}`,
      question: 'Within a single iteration (after the init has already run once), what is the order of the three phases?',
      options: [
        { label: 'A', text: '1) i++  2) test i<SIZE  3) run body' },
        { label: 'B', text: '1) test i<SIZE  2) run body  3) i++' },
        { label: 'C', text: '1) run body  2) i++  3) test i<SIZE' },
        { label: 'D', text: '1) run body  2) test i<SIZE  3) i++' },
      ],
      correctLabel: 'B',
      explanation: 'Each iteration: TEST the guard → if true, run BODY → run POST (i++). Then RE-test guard. Body runs BEFORE i++; this is the M05 trap: putting i++ before the body off-by-ones the trace.',
    });
  }
}

// ----- C-14..C-19: evaluation cards ---------------------------------

// C-14 (14) — Evaluate `data.numbers[i]`
function genC14(s: Skill) {
  for (let i = 0; i < s.n; i++) {
    const init = PICK(i);
    const lit = fmtBraceInit(init.vals, init.init);
    const idx = i % 5;
    const expected = init.vals[idx];
    const isMCQ = i % 2 === 0;
    if (isMCQ) {
      cards[s.id].push({
        ...COMMON(s, i, 'MCQCard', 'mcq'),
        stem: `Given \`stat_double data = ${lit};\` and i = ${idx}, evaluate \`data.numbers[i]\`. (Note: NOT the value of i.)`,
        correct: expected.toString(),
        distractors: [
          idx.toString(),
          (init.vals[(idx + 1) % 5]).toString(),
          init.init.toString(),
        ],
        explanation: `data.numbers[i] dereferences index i of the array. With i=${idx}, that is numbers[${idx}] = ${expected}. Mistake to avoid: returning i (=${idx}) instead of the cell value.`,
      });
    } else {
      cards[s.id].push({
        ...COMMON(s, i, 'DecomposeCard', 'decomp'),
        stem: 'Distinguish `i` from `data.numbers[i]`.',
        code: `${STRUCT_BLOCK}\nstat_double data = ${lit};\nint i = ${idx};\n// what is data.numbers[i]?`,
        question: 'Which is the value of `data.numbers[i]`?',
        options: [
          { label: 'A', text: `${idx} (the value of i)` },
          { label: 'B', text: `${expected} (the i-th cell value)` },
          { label: 'C', text: `${init.init} (the mystery value)` },
          { label: 'D', text: 'undefined — `data.numbers[i]` is not legal until SIZE is defined' },
        ],
        correctLabel: 'B',
        explanation: 'data.numbers[i] reads the cell AT INDEX i, not the value of i. Confusing the two is M20.',
      });
    }
  }
}

// C-15 (6) — Evaluate `data.mystery`
function genC15(s: Skill) {
  for (let i = 0; i < s.n; i++) {
    const init = PICK(i);
    const lit = fmtBraceInit(init.vals, init.init);
    cards[s.id].push({
      ...COMMON(s, i, 'MCQCard', 'mcq'),
      stem: `Given \`stat_double data = ${lit};\` and no further mutations — what does \`data.mystery\` evaluate to?`,
      correct: init.init.toString(),
      distractors: [
        init.vals[0].toString(),
        init.vals[4].toString(),
        '0.0',
      ],
      explanation: `data.mystery reads the scalar cell. It was filled by the trailing brace-init value: ${init.init}.`,
    });
  }
}

// C-16 (14) — Evaluate `numbers[i] > mystery`
function genC16(s: Skill) {
  for (let i = 0; i < s.n; i++) {
    const init = PICK(i);
    const idx = i % 5;
    const cell = init.vals[idx];
    const myst = init.init;
    const result = cell > myst;
    cards[s.id].push({
      ...COMMON(s, i, 'MCQCard', 'mcq'),
      stem: `data.numbers[${idx}] = ${cell}, data.mystery = ${myst}. Evaluate \`data.numbers[${idx}] > data.mystery\`.`,
      correct: result ? 'true' : 'false',
      distractors: result
        ? ['false', 'undefined (cannot compare doubles)', 'depends on i']
        : ['true', 'undefined (cannot compare doubles)', 'depends on i'],
      explanation: `${cell} > ${myst} is ${result ? 'true' : 'false'}. This is the find-max guard pattern.`,
    });
  }
}

// C-17 (12) — Evaluate `numbers[i] > 0`
function genC17(s: Skill) {
  for (let i = 0; i < s.n; i++) {
    const init = PICK(i);
    const idx = i % 5;
    const cell = init.vals[idx];
    const result = cell > 0;
    cards[s.id].push({
      ...COMMON(s, i, 'MCQCard', 'mcq'),
      stem: `data.numbers[${idx}] = ${cell}. Evaluate \`data.numbers[${idx}] > 0\`. (Sum-positive guard, V2.0 attempt-1.)`,
      correct: result ? 'true' : 'false',
      distractors: result
        ? ['false', 'undefined', 'true only if i is even']
        : ['true', 'undefined', 'false only if i is even'],
      explanation: `${cell} > 0 is ${result ? 'true' : 'false'}. ${cell === 0 ? 'Edge case: 0 is NOT > 0.' : ''}`,
    });
  }
}

// C-18 (8) — Evaluate `numbers[i] < 0`
function genC18(s: Skill) {
  for (let i = 0; i < s.n; i++) {
    const init = PICK(i);
    const idx = i % 5;
    const cell = init.vals[idx];
    const result = cell < 0;
    cards[s.id].push({
      ...COMMON(s, i, 'MCQCard', 'mcq'),
      stem: `data.numbers[${idx}] = ${cell}. Evaluate \`data.numbers[${idx}] < 0\`. (Sum-negative guard.)`,
      correct: result ? 'true' : 'false',
      distractors: result
        ? ['false', 'undefined', 'true only if cell is integer']
        : ['true', 'undefined', 'false only if cell is integer'],
      explanation: `${cell} < 0 is ${result ? 'true' : 'false'}. 0 is NOT < 0.`,
    });
  }
}

// C-19 (6) — Evaluate `numbers[i] % 2 == 0` (primer: int variant)
function genC19(s: Skill) {
  // mod requires int — use int values for primer
  const intInits = [
    [4, 7, 2, 9, 6],
    [10, 3, 8, 5, 1],
    [0, 11, 14, 13, 12],
    [2, 4, 6, 8, 10],
    [1, 3, 5, 7, 9],
    [6, 1, 8, 5, 4],
  ];
  for (let i = 0; i < s.n; i++) {
    const arr = intInits[i % intInits.length];
    const idx = i % 5;
    const cell = arr[idx];
    const result = cell % 2 === 0;
    cards[s.id].push({
      ...COMMON(s, i, 'MCQCard', 'mcq'),
      stem: `For an int variant: numbers[${idx}] = ${cell}. Evaluate \`numbers[${idx}] % 2 == 0\` (test for even).`,
      correct: result ? 'true' : 'false',
      distractors: result
        ? ['false', `${cell / 2}`, 'undefined for negative']
        : ['true', `${(cell - 1) / 2}`, 'undefined for negative'],
      explanation: `${cell} % 2 = ${cell % 2}, which ${result ? 'IS' : 'IS NOT'} 0. So the test is ${result ? 'true' : 'false'}.`,
    });
  }
}

// C-20 (8) — Take if-branch when true
function genC20(s: Skill) {
  for (let i = 0; i < s.n; i++) {
    cards[s.id].push({
      ...COMMON(s, i, 'MCQCard', 'mcq'),
      stem: `In \`if (data.numbers[i] > 0) { data.mystery = data.mystery + data.numbers[i]; }\`, the condition evaluates to TRUE. What happens?`,
      correct: 'The body runs: data.mystery = data.mystery + data.numbers[i] is executed.',
      distractors: [
        'The body is skipped because there is no else clause.',
        'The condition is re-evaluated until it returns false.',
        'The whole if-statement is replaced by 0 (early-exit).',
      ],
      explanation: 'If the condition is true, the body runs ONCE. There is no else, so falling through after the closing brace is normal.',
    });
  }
}

// C-21 (8) — Skip if-branch when false
function genC21(s: Skill) {
  for (let i = 0; i < s.n; i++) {
    cards[s.id].push({
      ...COMMON(s, i, 'MCQCard', 'mcq'),
      stem: `In \`if (data.numbers[i] > 0) { data.mystery = data.mystery + data.numbers[i]; }\`, the condition evaluates to FALSE. What happens?`,
      correct: 'The body is SKIPPED. data.mystery is unchanged for this iteration.',
      distractors: [
        'The body still runs because there is no else.',
        'data.mystery is reset to 0.',
        'The loop exits immediately.',
      ],
      explanation: 'If false, the body is skipped and data.mystery does NOT change. Drop a row in the trail with no mutation. M03 trap is running the body anyway.',
    });
  }
}

// ----- C-22..C-25: mutation patterns — TraceCard mini + Procedural --

function mutationPair(s: Skill, i: number, mutLine: string, before: { vals: number[]; init: number }, idx: number, applyMut: (m: number, c: number) => number) {
  const lit = fmtBraceInit(before.vals, before.init);
  const after = applyMut(before.init, before.vals[idx]);
  return traceMini(s, i,
`int main() {
  stat_double data = ${lit};
  int i = ${idx};
  ${mutLine}
  cout << data.mystery << endl;
  return 0;
}`,
    ['data.mystery'],
    [
      { line: 3, variable: 'i', value: idx.toString() },
      { line: 4, variable: 'data.mystery', value: after.toString() },
      { line: 5, variable: '', value: '', output: after.toString() },
    ],
    [after.toString()]);
}

// C-22 (10) — Mutation: `mystery = numbers[i]`
function genC22(s: Skill) {
  for (let i = 0; i < s.n; i++) {
    const init = PICK(i);
    const idx = i % 5;
    const isTrace = i % 2 === 0;
    if (isTrace) {
      const c = mutationPair(s, i, 'data.mystery = data.numbers[i];', init, idx, (_m, c) => c);
      (c as Record<string, unknown>).stem = `Apply \`data.mystery = data.numbers[i];\` with i=${idx}. What is data.mystery after?`;
      (c as Record<string, unknown>).teachMe = 'Plain assignment OVERWRITES. The OLD mystery is gone — strikethrough it.';
      cards[s.id].push(c);
    } else {
      cards[s.id].push({
        ...COMMON(s, i, 'ProceduralCard', 'proc'),
        stem: `Write the one-liner mutation that copies the current cell into mystery (find-max/min update).`,
        section: 'C-22 mutation: mystery = numbers[i]',
        prompt: 'Write the single C++ statement that assigns data.numbers[i] to data.mystery (assume i is in scope).',
        expectedAnswer: 'data.mystery = data.numbers[i];',
        keyChecks: ['data.mystery', 'data.numbers[i]', '='],
        variants: [
          { prompt: 'Same, but the local name is `d` instead of `data`.', expectedAnswer: 'd.mystery = d.numbers[i];' },
          { prompt: 'Same, using stat_int and SIZE 5.', expectedAnswer: 'data.mystery = data.numbers[i];' },
        ],
      });
    }
  }
}

// C-23 (14) — Mutation: `mystery = mystery + numbers[i]`
function genC23(s: Skill) {
  for (let i = 0; i < s.n; i++) {
    const init = PICK(i);
    const idx = i % 5;
    const isTrace = i % 2 === 0;
    if (isTrace) {
      const c = mutationPair(s, i, 'data.mystery = data.mystery + data.numbers[i];', init, idx, (m, c) => +(m + c).toFixed(4));
      (c as Record<string, unknown>).stem = `Apply \`data.mystery = data.mystery + data.numbers[i];\` with i=${idx}. What is data.mystery after?`;
      (c as Record<string, unknown>).teachMe = 'Sum-accumulator: read OLD mystery, add cell, write NEW mystery. The old value is struck through.';
      cards[s.id].push(c);
    } else {
      cards[s.id].push({
        ...COMMON(s, i, 'ProceduralCard', 'proc'),
        stem: `Write the sum-accumulator mutation (the V2.0 attempt-1 update line).`,
        section: 'C-23 mutation: mystery = mystery + numbers[i]',
        prompt: 'Write the single C++ statement that adds data.numbers[i] into data.mystery (sum accumulator).',
        expectedAnswer: 'data.mystery = data.mystery + data.numbers[i];',
        keyChecks: ['data.mystery', 'data.mystery + data.numbers[i]', 'data.numbers[i]', '='],
        variants: [
          { prompt: 'Same, but the parameter name is `s`.', expectedAnswer: 's.mystery = s.mystery + s.numbers[i];' },
          { prompt: 'Same, but the loop variable is named `k`.', expectedAnswer: 'data.mystery = data.mystery + data.numbers[k];' },
        ],
      });
    }
  }
}

// C-24 (8) — Mutation: `mystery = mystery * numbers[i]`
function genC24(s: Skill) {
  for (let i = 0; i < s.n; i++) {
    const init = INITS[(i + 1) % INITS.length]; // skip zeros for product
    const idx = i % 5;
    const isTrace = i % 2 === 0;
    if (isTrace) {
      const c = mutationPair(s, i, 'data.mystery = data.mystery * data.numbers[i];', init, idx, (m, c) => +(m * c).toFixed(4));
      (c as Record<string, unknown>).stem = `Apply \`data.mystery = data.mystery * data.numbers[i];\` with i=${idx}. What is data.mystery after?`;
      cards[s.id].push(c);
    } else {
      cards[s.id].push({
        ...COMMON(s, i, 'ProceduralCard', 'proc'),
        stem: `Write the product-accumulator mutation.`,
        section: 'C-24 mutation: mystery = mystery * numbers[i]',
        prompt: 'Write the single C++ statement that multiplies data.numbers[i] into data.mystery (product accumulator).',
        expectedAnswer: 'data.mystery = data.mystery * data.numbers[i];',
        keyChecks: ['data.mystery', 'data.mystery * data.numbers[i]', 'data.numbers[i]', '='],
        variants: [
          { prompt: 'Same, parameter name `p`.', expectedAnswer: 'p.mystery = p.mystery * p.numbers[i];' },
        ],
      });
    }
  }
}

// C-25 (8) — Mutation: `count = count + 1`
function genC25(s: Skill) {
  for (let i = 0; i < s.n; i++) {
    const start = i % 5;
    const isTrace = i % 2 === 0;
    if (isTrace) {
      cards[s.id].push(traceMini(s, i,
`int main() {
  int count = ${start};
  count = count + 1;
  cout << count << endl;
  return 0;
}`,
        ['count'],
        [
          { line: 2, variable: 'count', value: start.toString() },
          { line: 3, variable: 'count', value: (start + 1).toString() },
          { line: 4, variable: '', value: '', output: (start + 1).toString() },
        ],
        [(start + 1).toString()],
        `Apply \`count = count + 1;\` with count starting at ${start}. What is count after?`,
        'Counting accumulator: read OLD count, add 1, write NEW count. Old value gets struck through.'));
    } else {
      cards[s.id].push({
        ...COMMON(s, i, 'ProceduralCard', 'proc'),
        stem: `Write the counting-accumulator mutation.`,
        section: 'C-25 mutation: count = count + 1',
        prompt: 'Write the single C++ statement that increments the local int `count` by 1 using the count = count + 1 form (no ++).',
        expectedAnswer: 'count = count + 1;',
        keyChecks: ['count', 'count + 1', '='],
        variants: [
          { prompt: 'Same, but increment a struct field `data.mystery` (treated as int counter).', expectedAnswer: 'data.mystery = data.mystery + 1;' },
        ],
      });
    }
  }
}

// ----- C-26..C-27: notation cards ----------------------------------

// C-26 (8) — Strikethrough notation; visual MCQ
function genC26(s: Skill) {
  for (let i = 0; i < s.n; i++) {
    const isMCQ = i % 2 === 0;
    if (isMCQ) {
      cards[s.id].push({
        ...COMMON(s, i, 'MCQCard', 'mcq'),
        stem: `When mystery is overwritten from 2.4 to 5.4 mid-trace, what is the correct hand-execute notation in the mystery cell?`,
        correct: '~~2.4~~ 5.4   (strike old, write new beside it)',
        distractors: [
          '5.4   (just the new value; old is gone forever)',
          '2.4 + 5.4 = 7.8   (sum the old and new)',
          '2.4, 5.4   (comma-separated; both are still live)',
        ],
        explanation: 'Strikethrough shows you SAW the old value but it is no longer the live value. Marker prevents M09 (drop trail). Markers also let you reread the trail end-to-end.',
      });
    } else {
      cards[s.id].push({
        ...COMMON(s, i, 'DecomposeCard', 'decomp'),
        stem: 'Pick the correctly-strikethrough memory cell after two writes.',
        code:
`// trace context: data.mystery starts at 0.0
// then becomes 2.4 (after iter 0)
// then becomes 5.4 (after iter 3)
// the cell now shows:`,
        question: 'Which cell content is the correct hand-execute notation?',
        options: [
          { label: 'A', text: '0.0 2.4 5.4   (no marks; eye picks the last one)' },
          { label: 'B', text: '~~0.0~~ ~~2.4~~ 5.4   (both old values struck; only 5.4 is live)' },
          { label: 'C', text: '5.4   (only the live value matters)' },
          { label: 'D', text: 'mystery is now invalid (writing twice is undefined)' },
        ],
        correctLabel: 'B',
        explanation: 'Each write strikes the previous live value. The trail is auditable; only the last unstruck value is live.',
      });
    }
  }
}

// C-27 (6) — Trail-of-three on same cell
function genC27(s: Skill) {
  for (let i = 0; i < s.n; i++) {
    const isMCQ = i % 2 === 0;
    if (isMCQ) {
      cards[s.id].push({
        ...COMMON(s, i, 'MCQCard', 'mcq'),
        stem: `mystery cell saw three writes: 0.0 → 2.4 → 5.4 → 7.4. After all three, what is the cell\'s recorded trail and live value?`,
        correct: 'Trail: ~~0.0~~ ~~2.4~~ ~~5.4~~ 7.4 ; Live: 7.4 (the only un-struck value).',
        distractors: [
          'Trail: 0.0+2.4+5.4+7.4 = 15.2 ; Live: 15.2.',
          'Trail: only 7.4 visible ; Live: 7.4 (intermediate values discarded).',
          'Trail: 0.0, 2.4, 5.4, 7.4 (no strikes) ; Live: undefined.',
        ],
        explanation: 'Each write strikes the prior live value. Trail-of-three is the canonical Q1 sum-positive shape after iters 0, 3, 4 of V2.0 attempt-1.',
      });
    } else {
      cards[s.id].push({
        ...COMMON(s, i, 'DecomposeCard', 'decomp'),
        stem: 'Pick the correct trail after three sequential writes to mystery.',
        code:
`// data.mystery starts at 0.0
// then 2.4 (after iter 0)
// then 5.4 (after iter 3)
// then 7.4 (after iter 4)
// the trail in the mystery cell:`,
        question: 'Which option is the correct trail-of-three notation?',
        options: [
          { label: 'A', text: '0.0 2.4 5.4 7.4   (no strikes; pick eyeballed last)' },
          { label: 'B', text: '7.4   (only the final value)' },
          { label: 'C', text: '~~0.0~~ ~~2.4~~ ~~5.4~~ 7.4   (three strikes, one live)' },
          { label: 'D', text: '0.0 + 2.4 + 5.4 + 7.4 = 15.2   (cumulative tape)' },
        ],
        correctLabel: 'C',
        explanation: 'Three writes ⇒ three strikes ⇒ one live value (7.4). C is canonical, A drops the trail (M09), D is double-counting.',
      });
    }
  }
}

// ----- C-28..C-30: concept cards ------------------------------------

// C-28 (4) — End-of-loop read final mystery
function genC28(s: Skill) {
  for (let i = 0; i < s.n; i++) {
    const isMCQ = i % 2 === 0;
    if (isMCQ) {
      cards[s.id].push({
        ...COMMON(s, i, 'MCQCard', 'mcq'),
        stem: `The for-loop has just exited (guard returned false). The mystery cell shows: ~~0.0~~ ~~2.4~~ ~~5.4~~ 7.4. The exam asks: what is data.mystery now?`,
        correct: '7.4 — the only unstruck value is the live one; that is the final answer.',
        distractors: [
          '15.2 — sum every value in the trail.',
          '0.0 — the first written value is the canonical answer.',
          '5.4 — the second-to-last value, since the loop was already exiting.',
        ],
        explanation: 'After loop exit, the LIVE value (the un-struck one) is the answer. Trail-as-audit confirms the path; the answer itself is the live value.',
      });
    } else {
      cards[s.id].push({
        ...COMMON(s, i, 'DecomposeCard', 'decomp'),
        stem: 'Pick the correct final-read after the loop exits.',
        code:
`// after loop exit, the mystery cell shows:
// ~~0.0~~ ~~2.4~~ ~~5.4~~ 7.4
// the program then runs:
cout << data.mystery << endl;`,
        question: 'What is printed?',
        options: [
          { label: 'A', text: '7.4 (the live value)' },
          { label: 'B', text: '0.0 (the original init)' },
          { label: 'C', text: '15.2 (sum of all trail values)' },
          { label: 'D', text: 'the average of the trail' },
        ],
        correctLabel: 'A',
        explanation: 'Only the un-struck value is live. The loop exit does NOT reset mystery. cout reads the live value.',
      });
    }
  }
}

// C-29 (6) — Don't mutate array cells
function genC29(s: Skill) {
  for (let i = 0; i < s.n; i++) {
    const isMCQ = i % 2 === 0;
    if (isMCQ) {
      cards[s.id].push({
        ...COMMON(s, i, 'MCQCard', 'mcq'),
        stem: `The Q1 V2.0 sum-positive loop body is \`data.mystery = data.mystery + data.numbers[i];\`. During the loop, do any numbers[i] cells change?`,
        correct: 'No. Only mystery (and any counter) is on the LHS of an assignment. numbers[i] is read-only here.',
        distractors: [
          'Yes — every iteration overwrites numbers[i] with the running sum.',
          'Yes — but only on iters where the if-condition is true.',
          'Only on iter 4 (the last one), to mark the array as consumed.',
        ],
        explanation: 'numbers[i] only appears on the RHS — it is READ, not written. M06 is mutating an array cell by mistake.',
      });
    } else {
      cards[s.id].push({
        ...COMMON(s, i, 'DecomposeCard', 'decomp'),
        stem: 'Pick the correct end-of-trace state for the array cells.',
        code:
`// loop body:  if (data.numbers[i] > 0) data.mystery = data.mystery + data.numbers[i];
// before loop: numbers = [2.4, -3.7, -1.7, 3.0, 2.0]
// AFTER loop:  numbers = ?`,
        question: 'What does the numbers array hold after the loop?',
        options: [
          { label: 'A', text: '[2.4, -3.7, -1.7, 3.0, 2.0]   (unchanged; array is read-only)' },
          { label: 'B', text: '[0.0, 0.0, 0.0, 0.0, 0.0]   (consumed, set to 0)' },
          { label: 'C', text: '[2.4, 5.4, 5.4, 5.4, 7.4]   (running sum stored back)' },
          { label: 'D', text: 'the array is now invalid' },
        ],
        correctLabel: 'A',
        explanation: 'numbers[i] only appears on the RHS in this loop. The array is unchanged. ONLY mystery moved.',
      });
    }
  }
}

// C-30 (4) — Pass-by-ref = same memory
function genC30(s: Skill) {
  for (let i = 0; i < s.n; i++) {
    const isMCQ = i % 2 === 0;
    if (isMCQ) {
      cards[s.id].push({
        ...COMMON(s, i, 'MCQCard', 'mcq'),
        stem: `void who_am_i(stat_double &data) { ... } is called as who_am_i(d); from main. Do d and data refer to the same memory or different memory?`,
        correct: 'Same memory. The & makes data an alias for the caller`s d. Mutations inside who_am_i are visible in main.',
        distractors: [
          'Different memory. The function gets a copy of d; main`s d is untouched.',
          'Same memory only for scalars; arrays inside d are still copied.',
          'Same memory only when the function returns void; otherwise it is a copy.',
        ],
        explanation: 'Pass-by-reference (&) shares the same memory. Without &, the struct would be copied (pass-by-value) and mutations would not be visible.',
      });
    } else {
      cards[s.id].push({
        ...COMMON(s, i, 'DecomposeCard', 'decomp'),
        stem: 'Pick the correct memory-model picture for who_am_i(stat_double &data).',
        code:
`${STRUCT_BLOCK}
${Q1_FN_HEADER}
  data.mystery = 7.4;
}
int main() {
  stat_double d = { {2.4, -3.7, -1.7, 3.0, 2.0}, -0.9 };
  who_am_i(d);   // & in signature, no & at call site
  cout << d.mystery << endl;
  return 0;
}`,
        question: 'After who_am_i(d) returns, what does main print?',
        options: [
          { label: 'A', text: '-0.9 — main`s d was not affected (function got a copy).' },
          { label: 'B', text: '7.4 — d and the function`s data were the same memory; the mutation persists.' },
          { label: 'C', text: '0.0 — main`s d is reset to default after the function call.' },
          { label: 'D', text: 'undefined — accessing d after who_am_i is illegal.' },
        ],
        correctLabel: 'B',
        explanation: 'The & in the signature gives data the SAME memory as the caller`s d. Mutations are visible in main.',
      });
    }
  }
}

// ---------------------------------------------------------------------
// Run all generators and emit
// ---------------------------------------------------------------------

const GEN: Record<string, (s: Skill) => void> = {
  'C-01': genC01, 'C-02': genC02, 'C-03': genC03, 'C-04': genC04, 'C-05': genC05, 'C-06': genC06,
  'C-07': genC07, 'C-08': genC08, 'C-09': genC09, 'C-10': genC10, 'C-11': genC11, 'C-12': genC12,
  'C-13': genC13, 'C-14': genC14, 'C-15': genC15, 'C-16': genC16, 'C-17': genC17, 'C-18': genC18,
  'C-19': genC19, 'C-20': genC20, 'C-21': genC21, 'C-22': genC22, 'C-23': genC23, 'C-24': genC24,
  'C-25': genC25, 'C-26': genC26, 'C-27': genC27, 'C-28': genC28, 'C-29': genC29, 'C-30': genC30,
};

let totalAtoms = 0;
let totalCards = 0;
const filesCreated: string[] = [];

for (const s of SKILLS) {
  emitAtom(s);
  totalAtoms++;
  filesCreated.push(`cpp-t2/data/v2/atoms/L1/S3-components/${s.id}.yml`);
  GEN[s.id](s);
  // verify count
  if (cards[s.id].length !== s.n) {
    console.error(`${s.id}: produced ${cards[s.id].length} cards, expected ${s.n}`);
    process.exit(2);
  }
  // emit cards
  cards[s.id].forEach((card, idx) => {
    const obj = card as Record<string, unknown>;
    const safeIdx = String(idx + 1).padStart(2, '0');
    const t = (obj.type as string)
      .replace('Card', '')
      .toLowerCase();
    const path = resolve(CARDS_DIR, s.id, `${t}-${safeIdx}.yml`);
    dump(path, obj);
    filesCreated.push(`cpp-t2/data/v2/cards/L1/S3-components/${s.id}/${t}-${safeIdx}.yml`);
    totalCards++;
  });
}

console.log(`Atoms emitted: ${totalAtoms}`);
console.log(`Cards emitted: ${totalCards} (target 248)`);
console.log(`Files written: ${filesCreated.length}`);

// Save file list for ledger consumer (handy)
writeFileSync(resolve(ROOT, 'data/v2/_l1_s3_components_filelist.json'), JSON.stringify(filesCreated, null, 2));
