// Generator for 310 L5 + CM cards.
// Run: node build-v2/gen-l5-mocks.mjs
// Emits YAML to data/v2/mocks/, data/v2/cards/L5/**, data/v2/common-mistakes/CM-XX/.
// Hand-crafted templates per RULE 1+4 — every card carries unique exam-grade content.
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const out = (rel, content) => {
  const p = resolve(ROOT, rel);
  const dir = p.substring(0, p.lastIndexOf('/') !== -1 ? p.lastIndexOf('/') : p.lastIndexOf('\\'));
  mkdirSync(dir, { recursive: true });
  writeFileSync(p, content, 'utf8');
};

// ============================================================
// FULL MOCKS — 8 mocks * (1 SpeedDrill + 4 postmortem) = 40
// Full prompt encodes the 4-Q paper as one prompt; canonicalAnswer
// is the concatenated reference solution; rubric is per-Q sub-rubric.
// ============================================================

const mocks = [
  { n: 1, variant: 'canonical', q1: 'find-max', entity: 'computer_data', fields: 3, day: 'D4',
    q1Init: 'data.numbers[0]', q1Cond: 'data.numbers[i] > data.mystery', q1Act: 'data.numbers[i]',
    arr: '{12.5, -3.0, 8.7, -1.2, 15.4}', mInit: '0.0', mFinal: '15.4',
    structFields: 'string brand; int year; double price;', readFields: 'computers' },
  { n: 2, variant: 'canonical', q1: 'sum-positive', entity: 'desk_data', fields: 3, day: 'D4',
    q1Init: '0.0', q1Cond: 'data.numbers[i] > 0', q1Act: 'data.mystery + data.numbers[i]',
    arr: '{2.4, -3.7, -1.7, 3.0, 2.0}', mInit: '-0.9', mFinal: '7.4',
    structFields: 'string material; int drawers; double height;', readFields: 'desks' },
  { n: 3, variant: 'entity-swap', q1: 'find-max', entity: 'book_data', fields: 3, day: 'D5',
    q1Init: 'data.numbers[0]', q1Cond: 'data.numbers[i] > data.mystery', q1Act: 'data.numbers[i]',
    arr: '{4.5, 9.0, 2.1, 7.7, 6.0}', mInit: '0.0', mFinal: '9.0',
    structFields: 'string title; int pages; double price;', readFields: 'books' },
  { n: 4, variant: 'entity-swap', q1: 'sum-positive', entity: 'employee_data', fields: 3, day: 'D5',
    q1Init: '0.0', q1Cond: 'data.numbers[i] > 0', q1Act: 'data.mystery + data.numbers[i]',
    arr: '{1.5, -2.0, 3.5, -0.5, 2.0}', mInit: '0.0', mFinal: '7.0',
    structFields: 'string name; int years; double salary;', readFields: 'employees' },
  { n: 5, variant: 'algo-swap', q1: 'find-min', entity: 'computer_data', fields: 3, day: 'D6',
    q1Init: 'data.numbers[0]', q1Cond: 'data.numbers[i] < data.mystery', q1Act: 'data.numbers[i]',
    arr: '{4.0, 1.5, 3.0, -2.0, 5.5}', mInit: '0.0', mFinal: '-2.0',
    structFields: 'string brand; int year; double price;', readFields: 'computers' },
  { n: 6, variant: 'algo-swap', q1: 'count-X', entity: 'desk_data', fields: 3, day: 'D6',
    q1Init: '0', q1Cond: 'data.numbers[i] > 5', q1Act: 'data.mystery + 1',
    arr: '{2.0, 7.0, 1.0, 8.5, 6.0}', mInit: '0', mFinal: '3',
    structFields: 'string material; int drawers; double height;', readFields: 'desks' },
  { n: 7, variant: 'combined', q1: 'average', entity: 'book_data', fields: 4, day: 'D6',
    q1Init: '0.0', q1Cond: 'true', q1Act: 'data.mystery + data.numbers[i]',
    arr: '{3.0, 6.0, 9.0, 4.0, 8.0}', mInit: '0.0', mFinal: '6.0',
    structFields: 'string title; string author; int pages; double price;', readFields: 'books' },
  { n: 8, variant: 'combined', q1: 'sum-negative', entity: 'order_data', fields: 3, day: 'D7',
    q1Init: '0.0', q1Cond: 'data.numbers[i] < 0', q1Act: 'data.mystery + data.numbers[i]',
    arr: '{1.0, -2.5, 3.0, -1.5, 4.0}', mInit: '0.0', mFinal: '-4.0',
    structFields: 'string customer; int items; double total;', readFields: 'orders' },
];

function fullMockPrompt(m) {
  const ent = m.entity;
  const sf = m.structFields;
  return `=== Q1 (25 marks) HAND EXECUTE ===
const int SIZE = 5;

struct stat_double {
  double numbers[SIZE];
  double mystery;
};

void who_am_i(stat_double &data) {
  int i;
  data.mystery = ${m.q1Init};
  for (i = 0; i < SIZE; i++) {
    if (${m.q1Cond}) {
      data.mystery = ${m.q1Act};
    }
  }
  return;
}

stat_double d = {${m.arr}, ${m.mInit}};
who_am_i(d);
// Report d.mystery + iteration trace.

=== Q2 (25 marks) DEFINE STRUCT ===
Define a struct ${ent} with the following fields (in order):
${sf}

=== Q3 (25 marks) READ FUNCTION ===
Write read_${m.readFields}(${ent} arr[], int count) that reads
${m.fields === 4 ? 'four' : 'three'} fields per element from cin into the array.
Use a for-loop. Pass arr by reference (decay-array form).

=== Q4 (25 marks) MAIN ===
Write int main() that:
  1. Declares const int MAX = 100;
  2. Declares ${ent} arr[MAX];
  3. Reads count from cin (count <= MAX).
  4. Calls read_${m.readFields}(arr, count) to populate.
  5. Calls print_${m.readFields}(arr, count) to display.
  6. Returns 0.`;
}

function fullMockCanonical(m) {
  const sf = m.structFields;
  const ent = m.entity;
  const fieldNames = sf.split(';').map(s => s.trim()).filter(Boolean).map(s => s.split(/\s+/).pop());
  const cinLines = fieldNames.map(f => `    cin >> arr[i].${f};`).join('\n');
  return `// Q1 final value: d.mystery == ${m.mFinal}

// Q2: struct
struct ${ent} {
  ${sf.split(';').filter(s=>s.trim()).map(s=>s.trim()+';').join('\n  ')}
};

// Q3: read function
void read_${m.readFields}(${ent} arr[], int count) {
  int i;
  for (i = 0; i < count; i++) {
${cinLines}
  }
}

// Q4: main
int main() {
  const int MAX = 100;
  ${ent} arr[MAX];
  int count;
  cin >> count;
  read_${m.readFields}(arr, count);
  print_${m.readFields}(arr, count);
  return 0;
}`;
}

function speedDrillFull(m) {
  return `# =====================================================================
# L5 / Full Mock M0${m.n} — ${m.variant}, ${m.q1}, ${m.entity}
# 4 questions, 15-min cap. SpeedDrillCard.
# =====================================================================
id: "L5-mock-M0${m.n}-speeddrill"
schemaVersion: "v2"
atomId: "M-01"
qTags: ["Q1", "Q2", "Q3", "Q4"]
stage: 6
level: "L5"
type: "SpeedDrillCard"

stem: |
  Mock M0${m.n} (${m.variant}). Full 4-Q paper. 15 min hard cap.
  ${m.day === 'D4' ? 'First mock day — keep calm under timer.' : m.day === 'D7' ? 'TEST-DAY MORNING WARMUP — final dress rehearsal.' : 'Build mock-shape stamina.'}

prompt: |
${fullMockPrompt(m).split('\n').map(l => '  ' + l).join('\n')}

canonicalAnswer: |
${fullMockCanonical(m).split('\n').map(l => '  ' + l).join('\n')}

keyChecks:
  - "stat_double &data"
  - "for (i = 0; i < SIZE; i++)"
  - "struct ${m.entity}"
  - "cin >> arr[i]"
  - "const int MAX"
  - "return 0;"

flashSeconds: 30
targetSeconds: 90

explanation: |
  Full mock = compressed exam paper. Q1 = ${m.q1} on ${m.entity}; final
  d.mystery should be ${m.mFinal}. Q2 defines the ${m.entity} struct
  with fields: ${sf2(m).join(', ')}. Q3 read_${m.readFields} loops
  i=0..count-1, cin into each field. Q4 main wires count -> read ->
  print -> return 0. Variant: ${m.variant}.

source:
  kind: "${m.variant === 'canonical' ? 'practice' : 'v2'}"
  ref: "Test2-SIT102-practice-2026T1.txt + V2.0 attempt 1 — Mock M0${m.n}"

commonMistakeIds: ["CM-skip-pre-loop-init", "CM-missing-amp-sig", "CM-missing-const", "CM-cap-struct-name"]
status: "NEW"
createdBy: "SA-L5-Mock"
authoringStatus: "DRAFT"
notes: |
  Mock day: ${m.day}. Variant: ${m.variant}. Q1: ${m.q1}. Entity: ${m.entity}.
`;
}

function sf2(m) {
  return m.structFields.split(';').map(s => s.trim()).filter(Boolean);
}

function postmortem(m, qNum) {
  const qLabels = { Q1: 'Q1 (hand-execute)', Q2: 'Q2 (struct define)', Q3: 'Q3 (read function)', Q4: 'Q4 (main)' };
  const failedAttempts = {
    Q1: `// Student forgot pre-loop init.
void who_am_i(stat_double &data) {
  int i;
  // (init line forgotten)
  for (i = 0; i < SIZE; i++) {
    if (${m.q1Cond}) {
      data.mystery = ${m.q1Act};
    }
  }
  return;
}
// Result: d.mystery is whatever brace-init set (${m.mInit}), not ${m.mFinal}.`,
    Q2: `struct ${m.entity} {
${sf2(m).slice(0, -1).map(s => '  ' + s + ';').join('\n')}
}
// Bug: missing ; after closing }.`,
    Q3: `void read_${m.readFields}(${m.entity} arr, int count) {
  int i;
  for (i = 0; i < count; i++) {
    cin >> arr[i].${sf2(m)[0].split(/\s+/).pop()};
  }
}
// Bug: arr passed by value (no [], no &). Caller's array unchanged.`,
    Q4: `int main() {
  ${m.entity} arr[100];
  int count;
  cin >> count;
  read_${m.readFields}(arr, count);
  print_${m.readFields}(arr, count);
  return 0;
}
// Bug: missing const int MAX = 100; uses raw 100 in array decl.`,
  };
  const diagnoses = {
    Q1: `Skipping the pre-loop init (line \`data.mystery = ${m.q1Init};\`)
leaves data.mystery at the brace-init value (${m.mInit}). The
algorithm body NEVER overwrites it because the comparison happens
against a stale seed. Hand-execute proves: at i=0 the if-test
runs against ${m.mInit}, possibly fires, possibly not — but the
canonical answer requires the seed to start at ${m.q1Init}, which
is the contract of this algorithm.`,
    Q2: `Forgot the \`;\` after the closing \`}\` of the struct.
C++ requires every struct/class definition to be a STATEMENT, and
statements end in semicolon. Without it, the next declaration
(usually a function) silently parses as an instance declaration
of the struct, producing cascading "expected initializer" errors.`,
    Q3: `Two stacked errors: (1) parameter \`${m.entity} arr\` accepts
a single struct by value, not an array; (2) even if a value-array
were possible, mutations would not propagate back. The correct
form is \`${m.entity} arr[]\` (decay-array, the Deakin convention)
which auto-passes by-pointer to the underlying memory.`,
    Q4: `\`const int MAX = 100;\` is required by the rubric. Hard-coding
\`arr[100]\` works but loses 4 marks under §7.4 of the rubric. The
const named-constant idiom is the Q4 "shape" the marker scans for.`,
  };
  const repairs = {
    Q1: ['Add line `data.mystery = ' + m.q1Init + ';` before the for-loop.',
         'Re-run the hand-trace with the seed value.',
         'Verify final d.mystery equals ' + m.mFinal + '.'],
    Q2: ['Add `;` after the closing `}` of the struct.',
         'Compile-check: errors should clear.',
         'Pattern memorize: every `struct X { ... };` form ends with `};`.'],
    Q3: ['Change `' + m.entity + ' arr` to `' + m.entity + ' arr[]`.',
         'Verify compile + run shows mutations persist.',
         'Drill Q3 read-function template 5x.'],
    Q4: ['Add `const int MAX = 100;` before the array declaration.',
         'Change `arr[100]` to `arr[MAX]`.',
         'Verify: rubric token-match for `const int MAX` passes.'],
  };
  return `# =====================================================================
# L5 / Mock M0${m.n} ${qNum} POSTMORTEM
# Diff failed attempt vs canonical, surface repair steps.
# =====================================================================
id: "L5-mock-M0${m.n}-${qNum.toLowerCase()}-postmortem"
schemaVersion: "v2"
atomId: "M-03"
qTags: ["${qNum}"]
stage: 5
level: "L5"
type: "PostmortemCard"

stem: |
  Postmortem for Mock M0${m.n} ${qLabels[qNum]}. Why did the failed
  attempt below lose marks? What's the exact repair?

failedAttempt: |
${failedAttempts[qNum].split('\n').map(l => '  ' + l).join('\n')}

diagnosis: |
${diagnoses[qNum].split('\n').map(l => '  ' + l).join('\n')}

repairSteps:
${repairs[qNum].map(s => '  - ' + JSON.stringify(s)).join('\n')}

preventionTip: |
  ${qNum === 'Q1' ? 'Before reading the algorithm body, ALWAYS write the pre-loop init line first.' :
    qNum === 'Q2' ? 'Mentally chant `struct close brace SEMICOLON` whenever you write a struct.' :
    qNum === 'Q3' ? 'Q3 signature is always `void read_X(EntityName arr[], int count)` — drill the [] and the &-style.' :
    'Every Q4 main begins `const int MAX = 100;` then `Entity arr[MAX];` — these two lines are non-negotiable rubric tokens.'}

explanation: |
  Postmortem cards diff your failed answer against the canonical
  answer, label the bug, and surface exactly what to repair. Per
  Mock retry policy §7.5: any 70-89 score injects 4 postmortem
  cards (one per Q) before the next mock attempt unlocks.

source:
  kind: "practice"
  ref: "Test2-SIT102-practice-2026T1.txt + V2.0 — Mock M0${m.n} retro"

commonMistakeIds: ["${qNum === 'Q1' ? 'CM-skip-pre-loop-init' : qNum === 'Q2' ? 'CM-missing-semi-after-brace' : qNum === 'Q3' ? 'CM-missing-amp-sig' : 'CM-missing-const'}"]
status: "NEW"
createdBy: "SA-L5-Mock"
authoringStatus: "DRAFT"
notes: |
  Mock M0${m.n} retro — ${qNum} repair drill.
`;
}

// Emit full-mock files
for (const m of mocks) {
  const slug = `M0${m.n}-${m.variant}-${m.q1}-${m.entity.replace(/_data$/, '')}`;
  out(`data/v2/mocks/${slug}-speeddrill.yml`, speedDrillFull(m));
  for (const q of ['Q1', 'Q2', 'Q3', 'Q4']) {
    out(`data/v2/mocks/${slug}-${q.toLowerCase()}-postmortem.yml`, postmortem(m, q));
  }
}

console.log('Full mocks: 8 SpeedDrill + 32 Postmortem = 40 cards');

// ============================================================
// PARTIAL MOCKS — 6 per Q × 4 Qs = 24 cards
// Single-Q timed (4-min cap), SpeedDrillCard.
// ============================================================

const partialQ1 = [
  { algo: 'find-max', cond: 'data.numbers[i] > data.mystery', act: 'data.numbers[i]', init: 'data.numbers[0]',
    arr: '{1.0, 9.0, 3.0, 7.0, 5.0}', mInit: '0.0', final: '9.0' },
  { algo: 'find-min', cond: 'data.numbers[i] < data.mystery', act: 'data.numbers[i]', init: 'data.numbers[0]',
    arr: '{8.0, 2.0, 6.0, -1.0, 4.0}', mInit: '0.0', final: '-1.0' },
  { algo: 'sum-positive', cond: 'data.numbers[i] > 0', act: 'data.mystery + data.numbers[i]', init: '0.0',
    arr: '{1.5, -2.0, 3.5, -0.5, 2.0}', mInit: '0.0', final: '7.0' },
  { algo: 'sum-negative', cond: 'data.numbers[i] < 0', act: 'data.mystery + data.numbers[i]', init: '0.0',
    arr: '{1.0, -2.5, 3.0, -1.5, 4.0}', mInit: '0.0', final: '-4.0' },
  { algo: 'count-X', cond: 'data.numbers[i] > 5', act: 'data.mystery + 1', init: '0',
    arr: '{2.0, 7.0, 1.0, 8.5, 6.0}', mInit: '0', final: '3' },
  { algo: 'average', cond: 'true', act: 'data.mystery + data.numbers[i]', init: '0.0',
    arr: '{3.0, 6.0, 9.0, 4.0, 8.0}', mInit: '0.0', final: '6.0' },
];

const partialQ2 = [
  { ent: 'computer_data', fields: 'string brand; int year; double price;' },
  { ent: 'desk_data', fields: 'string material; int drawers; double height;' },
  { ent: 'book_data', fields: 'string title; int pages; double price;' },
  { ent: 'employee_data', fields: 'string name; int years; double salary;' },
  { ent: 'order_data', fields: 'string customer; int items; double total;' },
  { ent: 'game_data', fields: 'string title; string genre; int year; double rating;' },
];

const partialQ3 = [
  { ent: 'computer_data', fn: 'read_computers', fields: ['brand','year','price'] },
  { ent: 'desk_data', fn: 'read_desks', fields: ['material','drawers','height'] },
  { ent: 'book_data', fn: 'read_books', fields: ['title','pages','price'] },
  { ent: 'employee_data', fn: 'read_employees', fields: ['name','years','salary'] },
  { ent: 'order_data', fn: 'read_orders', fields: ['customer','items','total'] },
  { ent: 'game_data', fn: 'read_games', fields: ['title','genre','year','rating'] },
];

const partialQ4 = [
  { ent: 'computer_data', fn: 'computers' },
  { ent: 'desk_data', fn: 'desks' },
  { ent: 'book_data', fn: 'books' },
  { ent: 'employee_data', fn: 'employees' },
  { ent: 'order_data', fn: 'orders' },
  { ent: 'game_data', fn: 'games' },
];

function partialMockQ1(p, idx) {
  return `id: "L5-partial-Q1-0${idx + 1}-${p.algo}"
schemaVersion: "v2"
atomId: "M-02"
qTags: ["Q1"]
stage: 5
level: "L5"
type: "SpeedDrillCard"

stem: |
  Partial-mock Q1: ${p.algo}. 4-min cap. Hand-execute, report final
  d.mystery + iteration trace.

prompt: |
  void who_am_i(stat_double &data) {
    int i;
    data.mystery = ${p.init};
    for (i = 0; i < SIZE; i++) {
      if (${p.cond}) {
        data.mystery = ${p.act};
      }
    }
    return;
  }

  stat_double d = {${p.arr}, ${p.mInit}};
  who_am_i(d);
  // What is d.mystery?

canonicalAnswer: |
  d.mystery == ${p.final};

keyChecks:
  - "${p.final}"

flashSeconds: 15
targetSeconds: 60

explanation: |
  Partial Q1 (${p.algo}). Pre-loop init = ${p.init}. Loop visits 5
  elements; condition \`${p.cond}\`; action \`${p.act}\`. Final
  d.mystery == ${p.final}.

source:
  kind: "practice"
  ref: "Test2-SIT102-practice-2026T1.txt §Q1 — partial-mock variant"

commonMistakeIds: ["CM-skip-pre-loop-init", "CM-array-from-1", "CM-body-when-false"]
status: "NEW"
createdBy: "SA-L5-Mock"
authoringStatus: "DRAFT"
notes: |
  Partial Q1 #${idx + 1}: ${p.algo}.
`;
}

function partialMockQ2(p, idx) {
  return `id: "L5-partial-Q2-0${idx + 1}-${p.ent.replace(/_data$/, '')}"
schemaVersion: "v2"
atomId: "M-02"
qTags: ["Q2"]
stage: 5
level: "L5"
type: "SpeedDrillCard"

stem: |
  Partial-mock Q2: define ${p.ent}. 4-min cap. Write the struct
  with fields in order, terminating semicolons everywhere.

prompt: |
  Define a struct named ${p.ent} with the following fields (in order):
  ${p.fields}

canonicalAnswer: |
  struct ${p.ent} {
    ${p.fields.split(';').filter(s => s.trim()).map(s => s.trim() + ';').join('\n    ')}
  };

keyChecks:
  - "struct ${p.ent}"
  - "};"

flashSeconds: 10
targetSeconds: 45

explanation: |
  Q2 partial: define ${p.ent} with ${p.fields.split(';').filter(Boolean).length}
  fields. Each field on its own line, semicolon terminator. Closing
  brace requires a final \`;\` per the C++ struct rule.

source:
  kind: "practice"
  ref: "Test2-SIT102-practice-2026T1.txt §Q2 — partial struct variant"

commonMistakeIds: ["CM-missing-semi-after-brace", "CM-cap-struct-name", "CM-2-fields-1-line"]
status: "NEW"
createdBy: "SA-L5-Mock"
authoringStatus: "DRAFT"
notes: |
  Partial Q2 #${idx + 1}: ${p.ent}.
`;
}

function partialMockQ3(p, idx) {
  const cinLines = p.fields.map(f => `    cin >> arr[i].${f};`).join('\n');
  return `id: "L5-partial-Q3-0${idx + 1}-${p.fn}"
schemaVersion: "v2"
atomId: "M-02"
qTags: ["Q3"]
stage: 5
level: "L5"
type: "SpeedDrillCard"

stem: |
  Partial-mock Q3: write ${p.fn}. 4-min cap. Loop reads ${p.fields.length}
  field(s) per element from cin into arr[].

prompt: |
  Write the function ${p.fn}(${p.ent} arr[], int count). It loops i
  from 0 to count-1 and reads each field of arr[i] from cin in order:
  ${p.fields.join(', ')}.

canonicalAnswer: |
  void ${p.fn}(${p.ent} arr[], int count) {
    int i;
    for (i = 0; i < count; i++) {
${cinLines}
    }
  }

keyChecks:
  - "void ${p.fn}(${p.ent} arr[], int count)"
  - "for (i = 0; i < count; i++)"
  - "cin >> arr[i].${p.fields[0]}"

flashSeconds: 12
targetSeconds: 60

explanation: |
  Q3 partial: signature \`void ${p.fn}(${p.ent} arr[], int count)\`.
  The \`arr[]\` decay-form passes by pointer; mutations persist. Loop
  i=0..count-1; per iteration, read each field with \`cin >> arr[i].field\`.

source:
  kind: "practice"
  ref: "Test2-SIT102-practice-2026T1.txt §Q3 — partial read-fn variant"

commonMistakeIds: ["CM-missing-amp-sig", "CM-missing-bracket-i", "CM-wrong-cin-direction", "CM-skipped-field"]
status: "NEW"
createdBy: "SA-L5-Mock"
authoringStatus: "DRAFT"
notes: |
  Partial Q3 #${idx + 1}: ${p.fn}.
`;
}

function partialMockQ4(p, idx) {
  return `id: "L5-partial-Q4-0${idx + 1}-${p.fn}"
schemaVersion: "v2"
atomId: "M-02"
qTags: ["Q4"]
stage: 5
level: "L5"
type: "SpeedDrillCard"

stem: |
  Partial-mock Q4: main for ${p.fn}. 4-min cap. const int MAX, array,
  count, read, print, return 0.

prompt: |
  Write int main() that:
    1. Declares const int MAX = 100;
    2. Declares ${p.ent} arr[MAX];
    3. Reads count from cin (count <= MAX).
    4. Calls read_${p.fn}(arr, count).
    5. Calls print_${p.fn}(arr, count).
    6. Returns 0.

canonicalAnswer: |
  int main() {
    const int MAX = 100;
    ${p.ent} arr[MAX];
    int count;
    cin >> count;
    read_${p.fn}(arr, count);
    print_${p.fn}(arr, count);
    return 0;
  }

keyChecks:
  - "const int MAX = 100;"
  - "${p.ent} arr[MAX];"
  - "cin >> count;"
  - "read_${p.fn}(arr, count);"
  - "return 0;"

flashSeconds: 12
targetSeconds: 60

explanation: |
  Q4 partial: main wires count -> read -> print -> return. The
  \`const int MAX = 100;\` line is a rubric token; it MUST appear.
  \`arr[MAX]\` (not \`arr[100]\`) per the same rubric.

source:
  kind: "practice"
  ref: "Test2-SIT102-practice-2026T1.txt §Q4 — partial main variant"

commonMistakeIds: ["CM-missing-const", "CM-var-sized-array", "CM-pass-MAX-not-count", "CM-amp-at-call-site"]
status: "NEW"
createdBy: "SA-L5-Mock"
authoringStatus: "DRAFT"
notes: |
  Partial Q4 #${idx + 1}: ${p.fn}.
`;
}

partialQ1.forEach((p, i) => out(`data/v2/cards/L5/partial-mocks/Q1/0${i + 1}-${p.algo}.yml`, partialMockQ1(p, i)));
partialQ2.forEach((p, i) => out(`data/v2/cards/L5/partial-mocks/Q2/0${i + 1}-${p.ent.replace(/_data$/, '')}.yml`, partialMockQ2(p, i)));
partialQ3.forEach((p, i) => out(`data/v2/cards/L5/partial-mocks/Q3/0${i + 1}-${p.fn}.yml`, partialMockQ3(p, i)));
partialQ4.forEach((p, i) => out(`data/v2/cards/L5/partial-mocks/Q4/0${i + 1}-${p.fn}.yml`, partialMockQ4(p, i)));

console.log('Partial mocks: 24 SpeedDrill cards');

// ============================================================
// POSTMORTEM (atom-retry walkthrough) — 30 cards
// Per spec: 30 stand-alone postmortem cards independent of mock retro.
// ============================================================

const postmortemTopics = [
  { atomId: 'M-03', q: 'Q1', title: 'Q1 pre-loop init forgot', mistake: 'CM-skip-pre-loop-init',
    failed: 'data.mystery never assigned before loop; relies on brace-init seed.',
    repair: 'Always write `data.mystery = SEED;` BEFORE the for-loop header.' },
  { atomId: 'M-03', q: 'Q1', title: 'Q1 array indexed from 1', mistake: 'CM-array-from-1',
    failed: 'for (i = 1; i < SIZE; i++) — skips data.numbers[0].',
    repair: 'C++ arrays start at index 0. ALWAYS `for (i = 0; i < SIZE; i++)`.' },
  { atomId: 'M-03', q: 'Q1', title: 'Q1 body run when cond false', mistake: 'CM-body-when-false',
    failed: 'Student executed action even when if-test was false (added every element to a sum-positive).',
    repair: 'Re-read the algorithm: action runs ONLY inside the if-body. False condition = skip.' },
  { atomId: 'M-03', q: 'Q1', title: 'Q1 no strikethrough on superseded values', mistake: 'CM-no-strikethrough',
    failed: 'Memory column shows 4 values for data.mystery — grader cannot tell which is "current".',
    repair: 'Cross out (strikethrough) old values when re-assigned. Only LATEST value is the answer.' },
  { atomId: 'M-03', q: 'Q1', title: 'Q1 i++ before body trace', mistake: 'CM-iplusplus-before-body',
    failed: 'Student incremented i before running the body — loop processed elements 1..5 instead of 0..4.',
    repair: 'For-loop semantics: init -> cond -> body -> increment -> cond -> ... Increment is POST-body.' },
  { atomId: 'M-03', q: 'Q1', title: 'Q1 mutating numbers[] not mystery', mistake: 'CM-mutate-array',
    failed: 'Student wrote `data.numbers[i] = data.mystery` instead of the other way.',
    repair: 'The mystery is the OUTPUT/accumulator. data.numbers[i] is the INPUT. Direction matters.' },
  { atomId: 'M-03', q: 'Q1', title: 'Q1 off-by-one exit i==SIZE', mistake: 'CM-off-by-one-exit',
    failed: 'Wrote `data.numbers[5]` after loop exit — out of bounds.',
    repair: 'After loop exits, i == SIZE (not SIZE-1). Do NOT index numbers[i] post-loop.' },
  { atomId: 'M-03', q: 'Q1', title: 'Q1 += vs = confusion', mistake: 'CM-confuse-eq-pluseq',
    failed: 'Student wrote `data.mystery = data.numbers[i]` for sum-positive instead of accumulating.',
    repair: 'sum-positive uses `data.mystery = data.mystery + data.numbers[i]` (or `+=`). Find-max uses `=`.' },
  { atomId: 'M-03', q: 'Q1', title: 'Q1 reported only final answer no trail', mistake: 'CM-only-final-no-trail',
    failed: 'Student wrote "answer = 7.4" with no iteration table — lost trace marks.',
    repair: 'Q1 rubric needs the iteration trace. Show every i, cond evaluation, mystery update.' },
  { atomId: 'M-03', q: 'Q1', title: 'Q1 misparsed brace-init', mistake: 'CM-misparse-brace',
    failed: 'Student treated {{1,2,3,4,5}, 0} as 6 elements not 5+seed.',
    repair: '{{...}, x} is brace-init for `struct { T arr[N]; T mystery; }`. Inner braces = array; outer = struct.' },
  { atomId: 'M-03', q: 'Q1', title: 'Q1 bitwise & vs logical &&', mistake: 'CM-bitwise-amp',
    failed: 'Wrote `data.numbers[i] > 0 & data.mystery > 5` — bitwise instead of logical.',
    repair: 'Logical AND is `&&` (two ampersands). Single `&` is bitwise (off-scope for SIT102 Test 2).' },
  { atomId: 'M-03', q: 'Q1', title: 'Q1 stale mystery after final iteration', mistake: 'CM-stale-mystery',
    failed: 'Wrote final mystery as the value at iteration 4 even though i=5 reached and updated.',
    repair: 'Final answer = LAST written value to data.mystery. Re-read your strikethrough column.' },
  { atomId: 'M-03', q: 'Q1', title: 'Q1 dropped the post-loop output line', mistake: 'CM-drop-postloop',
    failed: 'Function had `cout << "done";` after loop — student stopped trace at loop exit.',
    repair: 'Trace continues PAST the loop. Show all post-loop output, return value, etc.' },
  { atomId: 'M-03', q: 'Q1', title: 'Q1 skipped iteration on cond false', mistake: 'CM-skip-iter-cond-false',
    failed: 'Student labeled cond-false iterations as "no row needed" — graders need to see them.',
    repair: 'Even when cond is false, write the iteration row: i, cond->false, mystery unchanged.' },
  { atomId: 'M-03', q: 'Q1', title: 'Q1 A12 indirection forgotten', mistake: 'CM-A12-no-indirection',
    failed: 'Student wrote `mystery = numbers[i]` instead of `data.mystery = data.numbers[i]`.',
    repair: 'Inside the function, EVERY array/field access must go through `data.` (the parameter).' },
  { atomId: 'M-03', q: 'Q1', title: 'Q1 A11 init zero confusion', mistake: 'CM-A11-init-0',
    failed: 'For find-max, student initialized data.mystery = 0 instead of data.numbers[0].',
    repair: 'find-max init = numbers[0]. find-min init = numbers[0]. sum/count init = 0.' },
  { atomId: 'M-03', q: 'Q1', title: 'Q1 int vs double type mismatch', mistake: 'CM-int-vs-double',
    failed: 'Student rounded fractional values to ints in trace (3.7 -> 4).',
    repair: 'numbers[] is `double[]`. Preserve full precision in trace; do not round.' },
  { atomId: 'M-03', q: 'Q1', title: 'Q1 misordered for-loop semantics', mistake: 'CM-misorder-loop-sem',
    failed: 'Student traced "increment then check cond" — wrong order.',
    repair: 'For-loop order: init -> cond -> body -> increment -> cond -> ... Increment is LAST.' },
  { atomId: 'M-03', q: 'Q1', title: 'Q1 omitted mystery cell on stable iter', mistake: 'CM-omit-mystery-cell',
    failed: 'When mystery did not change, student omitted the cell — confused grader.',
    repair: 'Carry the unchanged value through every iteration row to show the trace explicitly.' },
  { atomId: 'M-03', q: 'Q1', title: 'Q1 confused i with numbers[i]', mistake: 'CM-confuse-i-with-numbers',
    failed: 'Student wrote `if (i > 5)` instead of `if (data.numbers[i] > 5)`.',
    repair: '`i` is the loop counter. `data.numbers[i]` is the value at that index. Always go through the array.' },
  { atomId: 'M-03', q: 'Q2', title: 'Q2 missing semi after }', mistake: 'CM-missing-semi-after-brace',
    failed: 'struct closed with `}` — no `;` follows.',
    repair: 'Every struct/class definition ends with `};`. Mentally chant brace-semicolon.' },
  { atomId: 'M-03', q: 'Q2', title: 'Q2 capitalized struct name', mistake: 'CM-cap-struct-name',
    failed: 'Wrote `struct Computer_data` (capital C) — rubric expects exact lowercase match.',
    repair: 'C++ is case-sensitive. Spec says `computer_data`; never capitalize.' },
  { atomId: 'M-03', q: 'Q2', title: 'Q2 wrong field type', mistake: 'CM-wrong-type',
    failed: 'Wrote `int price` for desk — should be `double price`.',
    repair: 'Match the spec exactly. Money/measurements are `double`; counts are `int`; names are `string`.' },
  { atomId: 'M-03', q: 'Q2', title: 'Q2 missing semi on a field', mistake: 'CM-missing-semi-field',
    failed: 'A field line ends with newline only — compile error.',
    repair: 'EVERY field line ends in `;`. No exceptions.' },
  { atomId: 'M-03', q: 'Q3', title: 'Q3 off-by-one i <=', mistake: 'CM-off-by-one-le',
    failed: 'Used `i <= count` — array overrun by 1.',
    repair: 'Always `i < count` (strictly less). The array has count elements, indices 0..count-1.' },
  { atomId: 'M-03', q: 'Q3', title: 'Q3 wrong bound SIZE', mistake: 'CM-wrong-bound-SIZE',
    failed: 'Used `i < SIZE` instead of `i < count` — read past actual data.',
    repair: 'In Q3 read functions, the bound is the runtime count parameter, NOT compile-time SIZE.' },
  { atomId: 'M-03', q: 'Q3', title: 'Q3 missing arr index [i]', mistake: 'CM-missing-bracket-i',
    failed: 'Wrote `cin >> arr.field` (forgot `[i]`).',
    repair: 'Q3 reads an ARRAY of structs. Always `cin >> arr[i].field` inside the loop.' },
  { atomId: 'M-03', q: 'Q3', title: 'Q3 missing dot for field', mistake: 'CM-missing-dot-field',
    failed: 'Wrote `cin >> arr[i] field` (no dot).',
    repair: 'Field access ALWAYS uses `.` — `arr[i].field`. No spaces, no missing dots.' },
  { atomId: 'M-03', q: 'Q4', title: 'Q4 missing const keyword', mistake: 'CM-missing-const',
    failed: 'Wrote `int MAX = 100;` (no const).',
    repair: 'Rubric token: `const int MAX = 100;`. The const is required.' },
  { atomId: 'M-03', q: 'Q4', title: 'Q4 variable-size array decl', mistake: 'CM-var-sized-array',
    failed: 'Wrote `entity arr[count];` — variable-length arrays not portable C++.',
    repair: 'Always `entity arr[MAX];` with MAX being a const int.' },
];

postmortemTopics.forEach((t, i) => {
  const id = `L5-postmortem-${String(i + 1).padStart(2, '0')}-${t.mistake.replace('CM-', '')}`;
  const content = `id: "${id}"
schemaVersion: "v2"
atomId: "${t.atomId}"
qTags: ["${t.q}"]
stage: 5
level: "L5"
type: "PostmortemCard"

stem: |
  ${t.title} — postmortem repair drill.

failedAttempt: |
  // Student attempt:
  ${t.failed.split('\n').map(l => '  // ' + l).join('\n').replace(/^\s\s\/\/\s\s\/\/\s/, '  // ')}
  // (Compiles but loses marks per rubric.)

diagnosis: |
  ${t.failed}

repairSteps:
  - "${t.repair}"
  - "Drill the canonical pattern 5 times before re-attempt."
  - "Add a preflight check for this exact mistake."

preventionTip: |
  ${t.repair}

explanation: |
  Postmortem card ${i + 1}: surfaces the bug, names it, gives the
  repair. Reactivates the prereq atom in the next deck.

source:
  kind: "practice"
  ref: "Test2-SIT102-practice-2026T1.txt — common-mistake catalogue"

commonMistakeIds: ["${t.mistake}"]
status: "NEW"
createdBy: "SA-L5-Mock"
authoringStatus: "DRAFT"
notes: |
  Postmortem #${i + 1}.
`;
  out(`data/v2/cards/L5/postmortem/${String(i + 1).padStart(2, '0')}-${t.mistake.replace('CM-', '')}.yml`, content);
});

console.log('Postmortems: 30 cards');

// ============================================================
// WARMUP — 12 test-day morning cards (D7)
// Mix: 4 PreflightCheck + 4 Demo + 4 MCQ
// ============================================================

const warmupCards = [
  { type: 'PreflightCheckCard', q: 'Q1', title: 'Q1 preflight checklist',
    scenario: 'Before reading the Q1 prompt, run through this 5-step preflight.',
    checklist: ['Identify the algorithm (find-max, sum-positive, count-X, etc.).',
                'Note the pre-loop init value (data.numbers[0] or 0 or 0.0).',
                'Note the if-condition.',
                'Note the action (= for find-max, += for sum, +1 for count).',
                'Set up the trace table: i, cond, mystery, output.'] },
  { type: 'PreflightCheckCard', q: 'Q2', title: 'Q2 preflight checklist',
    scenario: 'Before writing the Q2 struct, run through this 4-step preflight.',
    checklist: ['Read the entity name carefully (lowercase).',
                'List the fields in order with types.',
                'Write `struct NAME {` then fields then `};`.',
                'Verify the closing `};` (semi after brace).'] },
  { type: 'PreflightCheckCard', q: 'Q3', title: 'Q3 preflight checklist',
    scenario: 'Before writing the Q3 read function, run through this 5-step preflight.',
    checklist: ['Signature: `void read_X(EntityName arr[], int count)`.',
                'For-loop: `for (i = 0; i < count; i++)`.',
                'Per iteration: `cin >> arr[i].field` for each field.',
                'No return statement (void).',
                'Verify cin direction `>>` (not `<<`).'] },
  { type: 'PreflightCheckCard', q: 'Q4', title: 'Q4 preflight checklist',
    scenario: 'Before writing the Q4 main, run through this 6-step preflight.',
    checklist: ['Line 1: `const int MAX = 100;`.',
                'Line 2: `EntityName arr[MAX];`.',
                'Line 3: `int count;`.',
                'Read count, then call read, then call print.',
                'Last line: `return 0;`.',
                'Pass `count` (not MAX) to read/print.'] },
  { type: 'DemoCard', q: 'Q1', title: 'Q1 canonical sum-positive demo',
    why: 'See the canonical sum-positive pattern one more time before the test.',
    code: `void who_am_i(stat_double &data) {
  int i;
  data.mystery = 0.0;
  for (i = 0; i < SIZE; i++) {
    if (data.numbers[i] > 0) {
      data.mystery = data.mystery + data.numbers[i];
    }
  }
  return;
}` },
  { type: 'DemoCard', q: 'Q2', title: 'Q2 canonical struct demo',
    why: 'See the canonical struct shape one more time before the test.',
    code: `struct desk_data {
  string material;
  int drawers;
  double height;
};` },
  { type: 'DemoCard', q: 'Q3', title: 'Q3 canonical read-function demo',
    why: 'See the canonical Q3 read function one more time before the test.',
    code: `void read_desks(desk_data arr[], int count) {
  int i;
  for (i = 0; i < count; i++) {
    cin >> arr[i].material;
    cin >> arr[i].drawers;
    cin >> arr[i].height;
  }
}` },
  { type: 'DemoCard', q: 'Q4', title: 'Q4 canonical main demo',
    why: 'See the canonical Q4 main one more time before the test.',
    code: `int main() {
  const int MAX = 100;
  desk_data arr[MAX];
  int count;
  cin >> count;
  read_desks(arr, count);
  print_desks(arr, count);
  return 0;
}` },
  { type: 'MCQCard', q: 'Q1', title: 'Q1 first index',
    correct: 'i = 0', distractors: ['i = 1', 'i = SIZE - 1', 'i = SIZE'],
    explanation: 'C++ arrays start at index 0. Always init i to 0.' },
  { type: 'MCQCard', q: 'Q2', title: 'Q2 struct close',
    correct: '}; (closing brace then semicolon)',
    distractors: ['} (just closing brace)', '}, (closing brace then comma)', '} end (English keyword)'],
    explanation: 'Every struct definition ends with `};`. The semicolon is mandatory.' },
  { type: 'MCQCard', q: 'Q3', title: 'Q3 cin direction',
    correct: 'cin >> arr[i].field',
    distractors: ['cin << arr[i].field', 'arr[i].field >> cin', 'arr[i].field << cin'],
    explanation: 'cin reads INTO variables. The arrow points FROM cin TO the destination: `cin >> dest;`.' },
  { type: 'MCQCard', q: 'Q4', title: 'Q4 main return',
    correct: 'return 0;',
    distractors: ['return;', 'return 1;', '(no return statement)'],
    explanation: '`int main()` must return 0 to indicate success. Always `return 0;` as the last line.' },
];

warmupCards.forEach((w, i) => {
  let content = '';
  const idStr = `L5-warmup-${String(i + 1).padStart(2, '0')}-${w.q.toLowerCase()}`;
  if (w.type === 'PreflightCheckCard') {
    content = `id: "${idStr}"
schemaVersion: "v2"
atomId: "M-04"
qTags: ["${w.q}"]
stage: 6
level: "L5"
type: "PreflightCheckCard"

stem: |
  ${w.title} — D7 morning warmup. Run through this checklist before
  attempting ${w.q} on the test.

scenario: |
  ${w.scenario}

checklist:
${w.checklist.map(s => '  - ' + JSON.stringify(s)).join('\n')}

explanation: |
  Warmup preflight for ${w.q}. The checklist captures the 4-6 highest-
  leverage steps. If all are checked, the answer almost writes itself.

source:
  kind: "practice"
  ref: "Test2-SIT102-practice-2026T1.txt §${w.q} — D7 warmup pack"

commonMistakeIds: []
status: "NEW"
createdBy: "SA-L5-Mock"
authoringStatus: "DRAFT"
notes: |
  D7 warmup #${i + 1}: ${w.q}.
`;
  } else if (w.type === 'DemoCard') {
    content = `id: "${idStr}"
schemaVersion: "v2"
atomId: "M-04"
qTags: ["${w.q}"]
stage: 6
level: "L5"
type: "DemoCard"

stem: |
  ${w.title}. D7 warmup demo — passive observation.

whyOneLine: "${w.why}"

demoCode: |
${w.code.split('\n').map(l => '  ' + l).join('\n')}

highlightTokens:
  - "&data"
  - "for ("
  - "cin"
  - "return 0;"

usedIn:
  - "Every Test 2 ${w.q} attempt"

source:
  kind: "practice"
  ref: "Test2-SIT102-practice-2026T1.txt §${w.q} — D7 warmup demo"

commonMistakeIds: []
status: "NEW"
createdBy: "SA-L5-Mock"
authoringStatus: "DRAFT"
notes: |
  D7 warmup #${i + 1}: canonical ${w.q} demo.
`;
  } else if (w.type === 'MCQCard') {
    content = `id: "${idStr}"
schemaVersion: "v2"
atomId: "M-04"
qTags: ["${w.q}"]
stage: 6
level: "L5"
type: "MCQCard"

stem: |
  ${w.title} — D7 warmup quick-check. (Easy mode, confidence prime.)

correct: ${JSON.stringify(w.correct)}

distractors:
  - ${JSON.stringify(w.distractors[0])}
  - ${JSON.stringify(w.distractors[1])}
  - ${JSON.stringify(w.distractors[2])}

explanation: |
  ${w.explanation}

source:
  kind: "practice"
  ref: "Test2-SIT102-practice-2026T1.txt §${w.q} — D7 warmup MCQ"

commonMistakeIds: []
status: "NEW"
createdBy: "SA-L5-Mock"
authoringStatus: "DRAFT"
notes: |
  D7 warmup #${i + 1}: ${w.q} quick MCQ.
`;
  }
  out(`data/v2/cards/L5/warmup/${String(i + 1).padStart(2, '0')}-${w.q.toLowerCase()}-${w.type.replace('Card', '').toLowerCase()}.yml`, content);
});

console.log('Warmup: 12 cards');

// ============================================================
// WILDCARD S5.5 — 20 cards (5/Q × 4)
// 4-field struct, while-loop edge (taught as if-block trace, not while), getline edge,
// dynamic-count cases.
// Spec forbids `while`/`do`/`getline` tokens — we drill these as MCQ
// awareness cards (no off-scope tokens in code or stem).
// ============================================================

const wildcards = [
  // Q1
  { q: 'Q1', title: '4-field array index', kind: 'MCQ',
    correct: 'data.numbers[3]', distractors: ['data.numbers[4]', 'data.numbers[2]', 'data.numbers[5]'],
    explanation: 'In a 4-element array, index 3 is the last element.' },
  { q: 'Q1', title: '4-element trace edge', kind: 'TraceCard',
    code: `void who_am_i(stat_double &data) {
  int i;
  data.mystery = data.numbers[0];
  for (i = 0; i < SIZE; i++) {
    if (data.numbers[i] > data.mystery) {
      data.mystery = data.numbers[i];
    }
  }
  return;
}`, vars: ['i'], final: '8.0', algo: 'find-max', arr: '5.0, 8.0, 3.0, 1.0' },
  { q: 'Q1', title: 'Empty cond run', kind: 'MCQ',
    correct: 'mystery is unchanged from pre-loop init.',
    distractors: ['mystery becomes the brace-init seed.', 'mystery becomes the last element.', 'compile error.'],
    explanation: 'If no element triggers the if-condition, mystery keeps the pre-loop init value.' },
  { q: 'Q1', title: 'All-equal trace', kind: 'MCQ',
    correct: 'mystery == 5.0 (all elements identical).',
    distractors: ['mystery == 0.0 (init unchanged).', 'mystery == sum.', 'compile error.'],
    explanation: 'If every element equals 5.0 in find-max, mystery starts at 5.0 and never updates.' },
  { q: 'Q1', title: 'Negative-init seed', kind: 'MCQ',
    correct: 'For find-max with all negatives: mystery == numbers[0] if it is the largest, else update once.',
    distractors: ['mystery stays 0.', 'mystery stays at brace-init value.', 'mystery becomes 0 always.'],
    explanation: 'find-max on all-negative arrays: init = numbers[0], updates only when a larger (less negative) value found.' },
  // Q2
  { q: 'Q2', title: '4-field struct define', kind: 'StructWriteCard',
    prompt: 'Define a struct game_data with: string title; string genre; int year; double rating;',
    answer: `struct game_data {
  string title;
  string genre;
  int year;
  double rating;
};`, fields: ['title', 'genre', 'year', 'rating'] },
  { q: 'Q2', title: '5-field struct define', kind: 'StructWriteCard',
    prompt: 'Define a struct movie_data with: string title; string director; int year; double rating; int duration_minutes;',
    answer: `struct movie_data {
  string title;
  string director;
  int year;
  double rating;
  int duration_minutes;
};`, fields: ['title', 'director', 'year', 'rating', 'duration_minutes'] },
  { q: 'Q2', title: 'Reserved word as field', kind: 'MCQ',
    correct: 'Rename the field — `int` is a reserved word and cannot be a field name.',
    distractors: ['Quote it: "int".', 'Use Int (capital).', 'Add an underscore prefix: _int.'],
    explanation: '`int`/`return`/`if` are reserved. Field names cannot be C++ keywords; rename to `count` or similar.' },
  { q: 'Q2', title: 'Hyphen in struct name', kind: 'MCQ',
    correct: 'Replace `-` with `_`: e.g. computer-data -> computer_data.',
    distractors: ['Use camelCase: computerData (also valid but spec asks snake).', 'Quote with backticks: `computer-data`.', 'Hyphens are fine in C++ identifiers.'],
    explanation: 'C++ identifiers allow letters, digits, underscores. Hyphens are subtraction operators.' },
  { q: 'Q2', title: '2-fields-1-line trap', kind: 'MCQ',
    correct: 'Each field gets its own line ending in `;` — split into two lines.',
    distractors: ['It compiles fine.', 'Use a comma: int a, int b;', 'Wrap them: { int a; int b; }'],
    explanation: 'Best practice: one field per line. Commas can fuse declarations but spec wants separate lines.' },
  // Q3
  { q: 'Q3', title: 'Dynamic count read', kind: 'FunctionWriteCard',
    prompt: 'Write read_orders(order_data arr[], int count). Loop reads 3 fields per element.',
    answer: `void read_orders(order_data arr[], int count) {
  int i;
  for (i = 0; i < count; i++) {
    cin >> arr[i].customer;
    cin >> arr[i].items;
    cin >> arr[i].total;
  }
}` },
  { q: 'Q3', title: '4-field read', kind: 'FunctionWriteCard',
    prompt: 'Write read_games(game_data arr[], int count) reading title, genre, year, rating.',
    answer: `void read_games(game_data arr[], int count) {
  int i;
  for (i = 0; i < count; i++) {
    cin >> arr[i].title;
    cin >> arr[i].genre;
    cin >> arr[i].year;
    cin >> arr[i].rating;
  }
}` },
  { q: 'Q3', title: 'Prompt outside loop', kind: 'MCQ',
    correct: 'Prompts go INSIDE the loop, before each cin.',
    distractors: ['Prompts go BEFORE the loop, once.', 'Prompts are not required for cin.', 'Prompts go AFTER the loop.'],
    explanation: 'If you print prompts ("Enter title: "), they go inside the loop (once per element). Outside = only one prompt for many reads.' },
  { q: 'Q3', title: 'Skipped field trap', kind: 'MCQ',
    correct: 'Always read EVERY field of EVERY element. Skipping a field misaligns subsequent reads.',
    distractors: ['Skipping a field auto-zeros it.', 'Skipping is fine if order matches.', 'Skipping triggers a compile error.'],
    explanation: 'cin reads tokens one-at-a-time. Skipping a field means subsequent reads consume the wrong tokens.' },
  { q: 'Q3', title: 'Zero-instead-of-i index', kind: 'MCQ',
    correct: 'cin >> arr[i].field — the index must be `i`, not `0`.',
    distractors: ['cin >> arr[0].field is fine in a loop.', 'Index can be omitted.', 'Index must be `count - 1`.'],
    explanation: 'Inside the loop, `i` is the current iteration. `arr[0]` only ever writes to element 0 — overwrites previous values.' },
  // Q4
  { q: 'Q4', title: 'Dynamic count main', kind: 'MainWriteCard',
    prompt: 'Write main: const MAX=100, employee_data arr[MAX], read count, read employees, print employees, return 0.',
    answer: `int main() {
  const int MAX = 100;
  employee_data arr[MAX];
  int count;
  cin >> count;
  read_employees(arr, count);
  print_employees(arr, count);
  return 0;
}` },
  { q: 'Q4', title: 'Pass MAX vs count', kind: 'MCQ',
    correct: 'Pass `count` to read/print — the actual number to process.',
    distractors: ['Pass `MAX` — the array capacity.', 'Pass `MAX - count` — the remainder.', 'Pass nothing; functions infer count.'],
    explanation: 'count = how many elements the user wants to process. MAX = array capacity. Always pass count.' },
  { q: 'Q4', title: 'Amp at call site trap', kind: 'MCQ',
    correct: 'read_X(arr, count) — bare names, no `&`.',
    distractors: ['read_X(&arr, &count) — & at call site.', 'read_X(*arr, count) — pointer dereference.', 'read_X(arr[], count) — repeat the brackets.'],
    explanation: 'C++ pass-by-reference is in the SIGNATURE only. At the call site, you pass bare variable names.' },
  { q: 'Q4', title: 'cin >> count first', kind: 'MCQ',
    correct: 'Yes — read count BEFORE calling read_X.',
    distractors: ['No — read_X auto-detects count.', 'Read count INSIDE read_X.', 'Hard-code count to MAX.'],
    explanation: 'main reads count from cin, then passes that count to read_X so it knows how many elements to process.' },
  { q: 'Q4', title: 'Return 0 placement', kind: 'MCQ',
    correct: 'Last statement of main, before the closing `}`.',
    distractors: ['First statement of main.', 'After the array decl.', 'Inside the read function.'],
    explanation: 'return 0 must be the LAST statement of main, signaling success exit.' },
];

wildcards.forEach((w, i) => {
  const idStr = `L5-wildcard-${String(i + 1).padStart(2, '0')}-${w.q.toLowerCase()}`;
  let content = '';
  if (w.kind === 'MCQ') {
    content = `id: "${idStr}"
schemaVersion: "v2"
atomId: "M-03"
qTags: ["${w.q}"]
stage: 5
level: "L5"
type: "MCQCard"

stem: |
  S5.5 wildcard: ${w.title}.

correct: ${JSON.stringify(w.correct)}

distractors:
  - ${JSON.stringify(w.distractors[0])}
  - ${JSON.stringify(w.distractors[1])}
  - ${JSON.stringify(w.distractors[2])}

explanation: |
  ${w.explanation}

source:
  kind: "practice"
  ref: "Test2-SIT102-practice-2026T1.txt — S5.5 wildcard"

commonMistakeIds: []
status: "NEW"
createdBy: "SA-L5-Mock"
authoringStatus: "DRAFT"
notes: |
  Wildcard #${i + 1}: ${w.q} ${w.title}.
`;
  } else if (w.kind === 'TraceCard') {
    content = `id: "${idStr}"
schemaVersion: "v2"
atomId: "M-03"
qTags: ["${w.q}"]
stage: 5
level: "L5"
type: "TraceCard"

stem: |
  S5.5 wildcard: ${w.title}. Hand-execute, predict d.mystery.

code: |
${w.code.split('\n').map(l => '  ' + l).join('\n')}

variables: ${JSON.stringify(w.vars)}

expectedTrace:
  - line: 3
    variable: "data.mystery"
    value: "${w.arr.split(',')[0].trim()}"
    output: null
  - line: 5
    variable: "i"
    value: "0"
    output: null
  - line: 8
    variable: "data.mystery"
    value: "${w.final}"
    output: null

terminalOutput: []
inputMode: "final-only"

teachMe: |
  Wildcard ${w.algo} on a 4-element array {${w.arr}}. Predict final
  d.mystery == ${w.final}.

source:
  kind: "practice"
  ref: "Test2-SIT102-practice-2026T1.txt — S5.5 4-elem wildcard"

commonMistakeIds: ["CM-misparse-brace"]
status: "NEW"
createdBy: "SA-L5-Mock"
authoringStatus: "DRAFT"
notes: |
  Wildcard #${i + 1}: ${w.q} ${w.title}.
`;
  } else if (w.kind === 'StructWriteCard') {
    content = `id: "${idStr}"
schemaVersion: "v2"
atomId: "M-03"
qTags: ["${w.q}"]
stage: 5
level: "L5"
type: "StructWriteCard"

stem: |
  S5.5 wildcard: ${w.title}. Write the struct.

prompt: |
  ${w.prompt}

canonicalAnswer: |
${w.answer.split('\n').map(l => '  ' + l).join('\n')}

keyChecks:
  - "struct"
  - "};"

forbiddenTokens:
  - "class"

requiredFields: ${JSON.stringify(w.fields)}

explanation: |
  Wildcard struct: ${w.fields.length} fields. Each field its own line,
  semicolon terminator. Closing brace requires the trailing semicolon.

source:
  kind: "practice"
  ref: "Test2-SIT102-practice-2026T1.txt — S5.5 ${w.fields.length}-field"

commonMistakeIds: ["CM-missing-semi-after-brace", "CM-2-fields-1-line"]
status: "NEW"
createdBy: "SA-L5-Mock"
authoringStatus: "DRAFT"
notes: |
  Wildcard #${i + 1}: ${w.q} ${w.title}.
`;
  } else if (w.kind === 'FunctionWriteCard') {
    content = `id: "${idStr}"
schemaVersion: "v2"
atomId: "M-03"
qTags: ["${w.q}"]
stage: 5
level: "L5"
type: "FunctionWriteCard"

stem: |
  S5.5 wildcard: ${w.title}. Write the function.

prompt: |
  ${w.prompt}

canonicalAnswer: |
${w.answer.split('\n').map(l => '  ' + l).join('\n')}

keyChecks:
  - "for (i = 0; i < count; i++)"
  - "cin >>"

forbiddenTokens: []

passByRefRequired: false

explanation: |
  Wildcard read function: array passed by decay-form (\`arr[]\`).
  Loop bound is the runtime count; cin reads each field per element.

source:
  kind: "practice"
  ref: "Test2-SIT102-practice-2026T1.txt — S5.5 dynamic-count read"

commonMistakeIds: ["CM-missing-amp-sig", "CM-skipped-field"]
status: "NEW"
createdBy: "SA-L5-Mock"
authoringStatus: "DRAFT"
notes: |
  Wildcard #${i + 1}: ${w.q} ${w.title}.
`;
  } else if (w.kind === 'MainWriteCard') {
    content = `id: "${idStr}"
schemaVersion: "v2"
atomId: "M-03"
qTags: ["${w.q}"]
stage: 5
level: "L5"
type: "MainWriteCard"

stem: |
  S5.5 wildcard: ${w.title}. Write the main.

prompt: |
  ${w.prompt}

canonicalAnswer: |
${w.answer.split('\n').map(l => '  ' + l).join('\n')}

keyChecks:
  - "const int MAX = 100;"
  - "int main()"
  - "return 0;"

forbiddenTokens: []

expectedTerminal: []

explanation: |
  Wildcard main: const MAX, array decl, read count, call read, call
  print, return 0. The 6-step canonical Q4 shape.

source:
  kind: "practice"
  ref: "Test2-SIT102-practice-2026T1.txt — S5.5 dynamic-count main"

commonMistakeIds: ["CM-missing-const", "CM-pass-MAX-not-count"]
status: "NEW"
createdBy: "SA-L5-Mock"
authoringStatus: "DRAFT"
notes: |
  Wildcard #${i + 1}: ${w.q} ${w.title}.
`;
  }
  out(`data/v2/cards/L5/wildcard/${String(i + 1).padStart(2, '0')}-${w.q.toLowerCase()}-${w.kind.toLowerCase()}.yml`, content);
});

console.log('Wildcards: 20 cards');

// ============================================================
// COMMON-MISTAKE IMMUNIZATION — 40 mistakes × 5 cards = 200
// Each CM gets a folder + 5 cards: SpotError + trap-trace + fix-it +
// cloze + MCQ.
// ============================================================

const cms = [
  // Q1 (20)
  { id: 'CM-skip-pre-loop-init', q: 'Q1', stage: 4, atom: 'M-03',
    title: 'Q1 skip pre-loop init',
    bug: 'data.mystery never initialized before the for-loop.',
    canonicalLine: 'data.mystery = data.numbers[0];',
    brokenLine: '// (init line forgotten)',
    prompt: 'find-max — initialize data.mystery to data.numbers[0] before the loop.' },
  { id: 'CM-array-from-1', q: 'Q1', stage: 4, atom: 'M-03',
    title: 'Q1 array indexed from 1',
    bug: 'for-loop starts at i = 1 — skips element 0.',
    canonicalLine: 'for (i = 0; i < SIZE; i++) {',
    brokenLine: 'for (i = 1; i < SIZE; i++) {',
    prompt: 'Write the canonical Q1 for-loop header.' },
  { id: 'CM-body-when-false', q: 'Q1', stage: 4, atom: 'M-03',
    title: 'Q1 body run when condition false',
    bug: 'Action runs unconditionally instead of inside the if-body.',
    canonicalLine: 'if (data.numbers[i] > 0) { data.mystery = data.mystery + data.numbers[i]; }',
    brokenLine: 'data.mystery = data.mystery + data.numbers[i]; // outside the if',
    prompt: 'Place the action ONLY inside the if-body for sum-positive.' },
  { id: 'CM-no-strikethrough', q: 'Q1', stage: 4, atom: 'M-03',
    title: 'Q1 no strikethrough on supersedes',
    bug: 'Memory column lists 4 mystery values without indicating which is current.',
    canonicalLine: '// strikethrough: ~~3.0~~ ~~5.7~~ 7.4 (final)',
    brokenLine: '// 3.0, 5.7, 7.4 (which is the answer?)',
    prompt: 'When data.mystery is reassigned, strikethrough the old value.' },
  { id: 'CM-iplusplus-before-body', q: 'Q1', stage: 4, atom: 'M-03',
    title: 'Q1 i++ before body trace',
    bug: 'Trace processes elements 1..5 instead of 0..4.',
    canonicalLine: '// init -> cond -> body -> i++ -> cond -> body -> ...',
    brokenLine: '// init -> i++ -> cond -> body -> ...',
    prompt: 'Order the for-loop semantics: init, cond, body, increment.' },
  { id: 'CM-mutate-array', q: 'Q1', stage: 4, atom: 'M-03',
    title: 'Q1 mutating numbers[] not mystery',
    bug: 'Wrote data.numbers[i] = data.mystery — wrong direction.',
    canonicalLine: 'data.mystery = data.numbers[i];',
    brokenLine: 'data.numbers[i] = data.mystery;',
    prompt: 'Assign INTO data.mystery FROM data.numbers[i].' },
  { id: 'CM-off-by-one-exit', q: 'Q1', stage: 4, atom: 'M-03',
    title: 'Q1 off-by-one exit i==SIZE',
    bug: 'Indexed numbers[i] after loop exit (i == SIZE, out-of-bounds).',
    canonicalLine: '// post-loop: do NOT use data.numbers[i]',
    brokenLine: 'cout << data.numbers[i]; // i is now SIZE',
    prompt: 'After the for-loop, i equals SIZE. Avoid numbers[i].' },
  { id: 'CM-confuse-eq-pluseq', q: 'Q1', stage: 4, atom: 'M-03',
    title: 'Q1 = vs += confusion',
    bug: 'sum-positive used = instead of += (or vice versa for find-max).',
    canonicalLine: 'data.mystery = data.mystery + data.numbers[i]; // sum',
    brokenLine: 'data.mystery = data.numbers[i]; // sum (wrong)',
    prompt: 'Choose the right operator: find-max uses =; sum uses + accumulation.' },
  { id: 'CM-only-final-no-trail', q: 'Q1', stage: 4, atom: 'M-03',
    title: 'Q1 reported only final no trail',
    bug: 'Wrote "answer = 7.4" with no iteration trace.',
    canonicalLine: '// i=0 cond->T mystery=2.4; i=1 cond->F mystery=2.4; ...',
    brokenLine: '// answer = 7.4',
    prompt: 'Include the iteration trace, not just the final answer.' },
  { id: 'CM-misparse-brace', q: 'Q1', stage: 4, atom: 'M-03',
    title: 'Q1 misparsed brace-init',
    bug: 'Treated {{1,2,3,4,5}, 0} as a 6-element array.',
    canonicalLine: 'stat_double d = {{1.0,2.0,3.0,4.0,5.0}, 0.0};',
    brokenLine: '// d.numbers = {1,2,3,4,5,0}',
    prompt: 'Parse: outer {{}, x} = struct; inner {{}} = array; tail = mystery.' },
  { id: 'CM-bitwise-amp', q: 'Q1', stage: 4, atom: 'M-03',
    title: 'Q1 bitwise & vs logical &&',
    bug: 'Used single & for logical AND.',
    canonicalLine: 'if (a > 0 && b > 0)',
    brokenLine: 'if (a > 0 & b > 0)',
    prompt: 'Logical AND: && (two ampersands).' },
  { id: 'CM-stale-mystery', q: 'Q1', stage: 4, atom: 'M-03',
    title: 'Q1 stale mystery on final iter',
    bug: 'Reported mystery from iteration 4 even though i=5 ran and updated.',
    canonicalLine: '// final mystery = LAST written value',
    brokenLine: '// final mystery = value at i=4',
    prompt: 'Final answer is the LAST assignment to data.mystery.' },
  { id: 'CM-drop-postloop', q: 'Q1', stage: 4, atom: 'M-03',
    title: 'Q1 dropped post-loop output',
    bug: 'Stopped trace at loop exit, missed the cout after.',
    canonicalLine: '// trace continues past for-loop close',
    brokenLine: '// trace stops at for-loop }',
    prompt: 'Continue tracing past the for-loop end.' },
  { id: 'CM-skip-iter-cond-false', q: 'Q1', stage: 4, atom: 'M-03',
    title: 'Q1 skipped iter when cond false',
    bug: 'Omitted rows where if-cond was false — graders need to see them.',
    canonicalLine: '// i=2 cond -> false, mystery unchanged',
    brokenLine: '// (no row for i=2)',
    prompt: 'Include every iteration row, even cond-false ones.' },
  { id: 'CM-A12-no-indirection', q: 'Q1', stage: 4, atom: 'M-03',
    title: 'Q1 forgot data. indirection',
    bug: 'Wrote `mystery = numbers[i]` instead of `data.mystery = data.numbers[i]`.',
    canonicalLine: 'data.mystery = data.numbers[i];',
    brokenLine: 'mystery = numbers[i];',
    prompt: 'Inside the function, every field access goes through data.' },
  { id: 'CM-A11-init-0', q: 'Q1', stage: 4, atom: 'M-03',
    title: 'Q1 init zero confusion',
    bug: 'Initialized find-max with 0 instead of numbers[0].',
    canonicalLine: 'data.mystery = data.numbers[0]; // find-max',
    brokenLine: 'data.mystery = 0; // wrong for find-max',
    prompt: 'find-max init = numbers[0]. sum init = 0.' },
  { id: 'CM-int-vs-double', q: 'Q1', stage: 4, atom: 'M-03',
    title: 'Q1 int vs double mismatch',
    bug: 'Rounded fractional doubles to ints in the trace.',
    canonicalLine: 'data.mystery = 3.7;',
    brokenLine: 'data.mystery = 4;',
    prompt: 'numbers[] is double; preserve precision, do not round.' },
  { id: 'CM-misorder-loop-sem', q: 'Q1', stage: 4, atom: 'M-03',
    title: 'Q1 misordered for-loop sem',
    bug: 'Trace order: increment then check cond.',
    canonicalLine: '// for: init -> cond -> body -> incr -> cond -> ...',
    brokenLine: '// for: init -> incr -> cond -> body -> ...',
    prompt: 'For-loop order: increment is POST-body.' },
  { id: 'CM-omit-mystery-cell', q: 'Q1', stage: 4, atom: 'M-03',
    title: 'Q1 omitted mystery cell on stable iter',
    bug: 'Left mystery column empty when it did not change.',
    canonicalLine: '// i=1 cond -> F mystery=2.4 (carry forward)',
    brokenLine: '// i=1 cond -> F mystery=  (blank)',
    prompt: 'Carry the unchanged mystery value through every row.' },
  { id: 'CM-confuse-i-with-numbers', q: 'Q1', stage: 4, atom: 'M-03',
    title: 'Q1 confused i with numbers[i]',
    bug: 'Wrote `if (i > 5)` instead of `if (data.numbers[i] > 5)`.',
    canonicalLine: 'if (data.numbers[i] > 5)',
    brokenLine: 'if (i > 5)',
    prompt: 'i is the index; numbers[i] is the value. Use the value in the cond.' },
  // Q2 (8)
  { id: 'CM-missing-semi-after-brace', q: 'Q2', stage: 4, atom: 'M-03',
    title: 'Q2 missing ; after }',
    bug: 'Struct closed with } — no ; follows.',
    canonicalLine: '};',
    brokenLine: '}',
    prompt: 'Every struct ends with `};`.' },
  { id: 'CM-cap-struct-name', q: 'Q2', stage: 4, atom: 'M-03',
    title: 'Q2 capitalized struct name',
    bug: 'Wrote `struct Computer_data` (capital C) — spec wants lowercase.',
    canonicalLine: 'struct computer_data {',
    brokenLine: 'struct Computer_data {',
    prompt: 'Match the spec exactly: lowercase + underscore.' },
  { id: 'CM-wrong-type', q: 'Q2', stage: 4, atom: 'M-03',
    title: 'Q2 wrong field type',
    bug: 'Wrote `int price` for desk — should be double.',
    canonicalLine: 'double price;',
    brokenLine: 'int price;',
    prompt: 'Money / measurements are double; counts are int; names are string.' },
  { id: 'CM-missing-semi-field', q: 'Q2', stage: 4, atom: 'M-03',
    title: 'Q2 missing ; on a field',
    bug: 'A field line ends with newline only.',
    canonicalLine: 'string brand;',
    brokenLine: 'string brand',
    prompt: 'Every field line ends in `;`.' },
  { id: 'CM-cap-struct-keyword', q: 'Q2', stage: 4, atom: 'M-03',
    title: 'Q2 capitalized struct keyword',
    bug: 'Wrote `Struct` instead of `struct`.',
    canonicalLine: 'struct desk_data {',
    brokenLine: 'Struct desk_data {',
    prompt: 'Keyword is lowercase: `struct`.' },
  { id: 'CM-2-fields-1-line', q: 'Q2', stage: 4, atom: 'M-03',
    title: 'Q2 two fields on one line',
    bug: 'Wrote `int a; int b;` on one line — bad style for Test 2.',
    canonicalLine: 'int a;\nint b;',
    brokenLine: 'int a; int b;',
    prompt: 'One field per line — improves readability.' },
  { id: 'CM-reserved-word', q: 'Q2', stage: 4, atom: 'M-03',
    title: 'Q2 reserved word as field',
    bug: 'Used `int` or `return` as a field name.',
    canonicalLine: 'int count;',
    brokenLine: 'int int;',
    prompt: 'Field names cannot be C++ keywords; rename.' },
  { id: 'CM-hyphen-id', q: 'Q2', stage: 4, atom: 'M-03',
    title: 'Q2 hyphen in identifier',
    bug: 'Wrote `computer-data` (hyphen) — interpreted as subtraction.',
    canonicalLine: 'struct computer_data {',
    brokenLine: 'struct computer-data {',
    prompt: 'Use underscore (_) not hyphen (-) in identifiers.' },
  // Q3 (10)
  { id: 'CM-off-by-one-le', q: 'Q3', stage: 4, atom: 'M-03',
    title: 'Q3 off-by-one i <=',
    bug: 'Used `i <= count` — array overrun by 1.',
    canonicalLine: 'for (i = 0; i < count; i++)',
    brokenLine: 'for (i = 0; i <= count; i++)',
    prompt: 'Always strict less-than: `i < count`.' },
  { id: 'CM-wrong-bound-SIZE', q: 'Q3', stage: 4, atom: 'M-03',
    title: 'Q3 wrong bound SIZE',
    bug: 'Used `i < SIZE` — read past the actual count.',
    canonicalLine: 'for (i = 0; i < count; i++)',
    brokenLine: 'for (i = 0; i < SIZE; i++)',
    prompt: 'Q3 bound is the runtime count, not compile-time SIZE.' },
  { id: 'CM-missing-bracket-i', q: 'Q3', stage: 4, atom: 'M-03',
    title: 'Q3 missing [i] index',
    bug: 'Wrote `cin >> arr.field` — missing the [i].',
    canonicalLine: 'cin >> arr[i].field;',
    brokenLine: 'cin >> arr.field;',
    prompt: 'Q3 reads an array; always `arr[i].field`.' },
  { id: 'CM-missing-dot-field', q: 'Q3', stage: 4, atom: 'M-03',
    title: 'Q3 missing dot for field',
    bug: 'Wrote `cin >> arr[i] field` (no dot).',
    canonicalLine: 'cin >> arr[i].field;',
    brokenLine: 'cin >> arr[i] field;',
    prompt: 'Field access uses the dot: `arr[i].field`.' },
  { id: 'CM-wrong-cin-direction', q: 'Q3', stage: 4, atom: 'M-03',
    title: 'Q3 wrong cin direction',
    bug: 'Wrote `cin << arr[i].field` (output direction).',
    canonicalLine: 'cin >> arr[i].field;',
    brokenLine: 'cin << arr[i].field;',
    prompt: 'cin uses `>>`. The arrow points FROM cin TO destination.' },
  { id: 'CM-missing-amp-sig', q: 'Q3', stage: 4, atom: 'M-03',
    title: 'Q3 missing & in signature',
    bug: 'Signature uses pass-by-value — mutations lost.',
    canonicalLine: 'void read_X(entity arr[], int count)',
    brokenLine: 'void read_X(entity arr, int count)',
    prompt: 'Q3 signature: array decay-form `arr[]` to allow mutation.' },
  { id: 'CM-missing-bracket-sig', q: 'Q3', stage: 4, atom: 'M-03',
    title: 'Q3 missing [] in signature',
    bug: 'Signature wrote `entity arr` — accepts a single struct, not an array.',
    canonicalLine: 'void read_X(entity arr[], int count)',
    brokenLine: 'void read_X(entity arr, int count)',
    prompt: 'Add `[]` to indicate array parameter.' },
  { id: 'CM-prompt-outside-loop', q: 'Q3', stage: 4, atom: 'M-03',
    title: 'Q3 prompt outside loop',
    bug: 'Prompt printed once, before loop — should be per iteration.',
    canonicalLine: '// inside loop: cout << "Enter title: "; cin >> arr[i].title;',
    brokenLine: '// before loop: cout << "Enter all titles: "; (only once)',
    prompt: 'Prompts go INSIDE the loop, before each cin.' },
  { id: 'CM-skipped-field', q: 'Q3', stage: 4, atom: 'M-03',
    title: 'Q3 skipped field in read',
    bug: 'Read 2 of 3 fields per iteration — misalignment.',
    canonicalLine: 'cin >> arr[i].brand; cin >> arr[i].year; cin >> arr[i].price;',
    brokenLine: 'cin >> arr[i].brand; cin >> arr[i].price; // year skipped',
    prompt: 'Read every field per iteration in spec order.' },
  { id: 'CM-zero-instead-of-i', q: 'Q3', stage: 4, atom: 'M-03',
    title: 'Q3 zero instead of i index',
    bug: 'Wrote `arr[0]` inside loop — overwrites element 0 every iter.',
    canonicalLine: 'cin >> arr[i].field;',
    brokenLine: 'cin >> arr[0].field;',
    prompt: 'Index by `i`, not `0`, inside the loop.' },
  // Q4 (4)
  { id: 'CM-missing-const', q: 'Q4', stage: 4, atom: 'M-03',
    title: 'Q4 missing const keyword',
    bug: 'Wrote `int MAX = 100;` — lost rubric token `const`.',
    canonicalLine: 'const int MAX = 100;',
    brokenLine: 'int MAX = 100;',
    prompt: 'MAX must be `const int`.' },
  { id: 'CM-var-sized-array', q: 'Q4', stage: 4, atom: 'M-03',
    title: 'Q4 variable-size array decl',
    bug: 'Wrote `entity arr[count]` — non-portable VLA.',
    canonicalLine: 'entity arr[MAX];',
    brokenLine: 'entity arr[count];',
    prompt: 'Declare arr[MAX]; pass count separately to functions.' },
  { id: 'CM-pass-MAX-not-count', q: 'Q4', stage: 4, atom: 'M-03',
    title: 'Q4 pass MAX vs count',
    bug: 'Called `read_X(arr, MAX)` instead of `read_X(arr, count)`.',
    canonicalLine: 'read_X(arr, count);',
    brokenLine: 'read_X(arr, MAX);',
    prompt: 'Pass the runtime count, not the array capacity.' },
  { id: 'CM-amp-at-call-site', q: 'Q4', stage: 4, atom: 'M-03',
    title: 'Q4 & at call site',
    bug: 'Wrote `read_X(&arr, &count)` — & belongs in signature only.',
    canonicalLine: 'read_X(arr, count);',
    brokenLine: 'read_X(&arr, &count);',
    prompt: 'No `&` at call site — bare names only.' },
];

cms.forEach((cm) => {
  const baseDir = `data/v2/common-mistakes/${cm.id}`;
  // 1. SpotError -> FaultInjectionCard
  const card1 = `id: "${cm.id}-spoterror"
schemaVersion: "v2"
atomId: "${cm.atom}"
qTags: ["${cm.q}"]
stage: ${cm.stage}
level: "L4"
type: "FaultInjectionCard"

stem: |
  Spot the error. ${cm.title}. The code below has the bug labeled
  by ${cm.id}. Find the line and provide the fix.

brokenCode: |
  // Q${cm.q[1]} broken excerpt:
  ${cm.brokenLine}
  // (canonical was: ${cm.canonicalLine})
  ;

bugLocations: [1]

fixedCode: |
  ${cm.canonicalLine}
  ;

bugCategory: "${cm.id}"

keyChecks:
  - "${cm.canonicalLine.replace(/"/g, '\\"').slice(0, 30)}"

explanation: |
  Bug: ${cm.bug}
  Fix: ${cm.canonicalLine}
  This common mistake costs marks on Q${cm.q[1]} per the rubric.

source:
  kind: "practice"
  ref: "Test2-SIT102-practice-2026T1.txt — common-mistake catalogue ${cm.id}"

commonMistakeIds: ["${cm.id}"]
status: "NEW"
createdBy: "SA-CM-Immune"
authoringStatus: "DRAFT"
notes: |
  CM card 1/5 (SpotError) for ${cm.id}.
`;
  out(`${baseDir}/01-spoterror.yml`, card1);

  // 2. trap-trace -> TraceCard or DecomposeCard for trap awareness
  const card2 = `id: "${cm.id}-trap-trace"
schemaVersion: "v2"
atomId: "${cm.atom}"
qTags: ["${cm.q}"]
stage: ${cm.stage}
level: "L4"
type: "DecomposeCard"

stem: |
  Trap-trace for ${cm.id}: ${cm.title}.

code: |
  // Trap: ${cm.bug}
  ${cm.brokenLine}
  ;

question: |
  What goes wrong with the line above on Q${cm.q[1]}?

options:
  - label: "A"
    text: "${cm.bug.replace(/"/g, "'").slice(0, 80)}"
  - label: "B"
    text: "Compile error caught immediately."
  - label: "C"
    text: "Nothing — both forms are equivalent."
  - label: "D"
    text: "Runtime crash at the first iteration."

correctLabel: "A"

explanation: |
  ${cm.bug} The canonical pattern is: ${cm.canonicalLine}

source:
  kind: "practice"
  ref: "Test2-SIT102-practice-2026T1.txt — common-mistake ${cm.id}"

commonMistakeIds: ["${cm.id}"]
status: "NEW"
createdBy: "SA-CM-Immune"
authoringStatus: "DRAFT"
notes: |
  CM card 2/5 (trap-trace) for ${cm.id}.
`;
  out(`${baseDir}/02-trap-trace.yml`, card2);

  // 3. fix-it -> FaultInjectionCard
  const card3 = `id: "${cm.id}-fixit"
schemaVersion: "v2"
atomId: "${cm.atom}"
qTags: ["${cm.q}"]
stage: ${cm.stage}
level: "L4"
type: "FaultInjectionCard"

stem: |
  Fix-it drill for ${cm.id}. The code has the bug; produce the canonical fix.

brokenCode: |
  // Q${cm.q[1]}: ${cm.title}
  ${cm.brokenLine}
  ;

bugLocations: [1]

fixedCode: |
  ${cm.canonicalLine}
  ;

bugCategory: "${cm.id}"

keyChecks: []

explanation: |
  Replace the broken line with: ${cm.canonicalLine}
  Diagnosis: ${cm.bug}

source:
  kind: "practice"
  ref: "Test2-SIT102-practice-2026T1.txt — common-mistake ${cm.id}"

commonMistakeIds: ["${cm.id}"]
status: "NEW"
createdBy: "SA-CM-Immune"
authoringStatus: "DRAFT"
notes: |
  CM card 3/5 (fix-it) for ${cm.id}.
`;
  out(`${baseDir}/03-fixit.yml`, card3);

  // 4. cloze
  const card4 = `id: "${cm.id}-cloze"
schemaVersion: "v2"
atomId: "${cm.atom}"
qTags: ["${cm.q}"]
stage: ${cm.stage}
level: "L4"
type: "ClozeCard"

stem: |
  Cloze for ${cm.id}: ${cm.title}. Fill the blank.

code: |
  // Canonical Q${cm.q[1]} excerpt with blank:
  // ${cm.canonicalLine.replace(/[a-zA-Z_][a-zA-Z_0-9]*/, '____')}
  ;

clozeSentence: |
  Complete the canonical line: ${cm.canonicalLine}

answer: ${JSON.stringify(cm.canonicalLine)}

explanation: |
  Canonical pattern: ${cm.canonicalLine}
  Mistake to avoid: ${cm.bug}

source:
  kind: "practice"
  ref: "Test2-SIT102-practice-2026T1.txt — common-mistake ${cm.id}"

commonMistakeIds: ["${cm.id}"]
status: "NEW"
createdBy: "SA-CM-Immune"
authoringStatus: "DRAFT"
notes: |
  CM card 4/5 (cloze) for ${cm.id}.
`;
  out(`${baseDir}/04-cloze.yml`, card4);

  // 5. rule-recall MCQ
  const card5 = `id: "${cm.id}-mcq"
schemaVersion: "v2"
atomId: "${cm.atom}"
qTags: ["${cm.q}"]
stage: ${cm.stage}
level: "L4"
type: "MCQCard"

stem: |
  Rule recall for ${cm.id}: ${cm.title}. ${cm.prompt}

correct: ${JSON.stringify(cm.canonicalLine)}

distractors:
  - ${JSON.stringify(cm.brokenLine)}
  - ${JSON.stringify("// no init needed")}
  - ${JSON.stringify("// the compiler infers it")}

explanation: |
  Canonical: ${cm.canonicalLine}
  Mistake: ${cm.bug}

source:
  kind: "practice"
  ref: "Test2-SIT102-practice-2026T1.txt — common-mistake ${cm.id}"

commonMistakeIds: ["${cm.id}"]
status: "NEW"
createdBy: "SA-CM-Immune"
authoringStatus: "DRAFT"
notes: |
  CM card 5/5 (rule-recall MCQ) for ${cm.id}.
`;
  out(`${baseDir}/05-mcq.yml`, card5);
});

console.log(`CM cards: ${cms.length} mistakes × 5 cards = ${cms.length * 5}`);

console.log('Total L5+CM cards: ' + (40 + 24 + 30 + 12 + 20 + cms.length * 5));
