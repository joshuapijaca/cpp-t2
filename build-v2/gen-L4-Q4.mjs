// =====================================================================
// gen-L4-Q4.mjs — skeleton author for L4 Q4 Write main()
// Emits 380 cards across 6 stages into data/v2/cards/L4/
// Author: SA-L4-Q4 — runs once, idempotent.
// =====================================================================
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CARDS_DIR = resolve(ROOT, 'data/v2/cards/L4');

// ---------------------------------------------------------------------
// Canonical V2.0 main() (desk_data, MAX=700) and practice (computer_data, MAX=100)
// ---------------------------------------------------------------------

const V20 = {
  entity: 'desk_data',
  plural: 'desks',
  count: 'desk_num',
  MAX: 700,
  prompt: 'How many desks?',
  fn: 'read_desks',
  fields: ['room_id', 'd_id', 'number_of_screens'],
  fieldTypes: ['int', 'int', 'int'],
};
const PRAC = {
  entity: 'computer_data',
  plural: 'computers',
  count: 'computer_num',
  MAX: 100,
  prompt: 'How many computers?',
  fn: 'read_computers',
  fields: ['id', 'description', 'location'],
  fieldTypes: ['int', 'string', 'string'],
};

// ---------------------------------------------------------------------
// Canonical main() builder
// ---------------------------------------------------------------------
function buildMain(c) {
  const fieldLines = c.fields.map(
    (f, i) =>
      `        cout << ${c.plural}[i].${f}${i < c.fields.length - 1 ? ' << ", "' : ' << endl'};`
  );
  return `int main()
{
    const int MAX = ${c.MAX};
    ${c.entity} ${c.plural}[MAX];
    int ${c.count};

    cout << "${c.prompt} ";
    cin >> ${c.count};

    ${c.fn}(${c.plural}, ${c.count});

    for (int i = 0; i < ${c.count}; i++)
    {
${fieldLines.join('\n')}
    }

    return 0;
}`;
}

// ---------------------------------------------------------------------
// YAML emit helper — minimal but correct
// ---------------------------------------------------------------------
function yamlVal(v, indent = 0) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'boolean' || typeof v === 'number') return String(v);
  if (typeof v === 'string') {
    if (v.includes('\n')) {
      const pad = ' '.repeat(indent + 2);
      return '|\n' + v.split('\n').map((l) => pad + l).join('\n');
    }
    return JSON.stringify(v);
  }
  if (Array.isArray(v)) {
    if (v.length === 0) return '[]';
    return '\n' + v.map((it) => ' '.repeat(indent + 2) + '- ' + yamlInline(it, indent + 4)).join('\n');
  }
  if (typeof v === 'object') {
    return '\n' + Object.entries(v).map(([k, val]) => ' '.repeat(indent + 2) + k + ': ' + yamlVal(val, indent + 2)).join('\n');
  }
  return JSON.stringify(v);
}
function yamlInline(v, indent = 0) {
  if (typeof v === 'string') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map((x) => yamlInline(x, indent)).join(', ') + ']';
  if (typeof v === 'object' && v !== null) {
    return '{' + Object.entries(v).map(([k, val]) => `${k}: ${yamlInline(val, indent)}`).join(', ') + '}';
  }
  return JSON.stringify(v);
}
function dump(card) {
  let out = '';
  for (const [k, v] of Object.entries(card)) {
    out += `${k}: ${yamlVal(v, 0)}\n`;
  }
  return out;
}

// Common-fields emitter
function common(id, atomId, stage, level, type, stem, source, cmIds, qTags = ['Q4']) {
  return {
    id,
    schemaVersion: 'v2',
    atomId,
    qTags,
    stage,
    level,
    type,
    stem,
    source,
    commonMistakeIds: cmIds || [],
    status: 'NEW',
    authoringStatus: 'DRAFT',
    createdBy: 'SA-L4-Q4',
  };
}

// ---------------------------------------------------------------------
// Write helper
// ---------------------------------------------------------------------
const written = [];
function emit(rel, card) {
  const path = resolve(CARDS_DIR, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, dump(card));
  written.push(rel);
}

// =====================================================================
// S1 TOUR — 25 cards
// =====================================================================
// 1 V2.0 walkthrough, 1 practice walkthrough, 2 variants (entity-swap demos)
// 13 SpotError (FaultInjection), 4 Compare (Decompose), 5 WhatHappens (MCQ)
// =====================================================================

function s1Tour() {
  // 1. V2.0 walkthrough (desk_data, MAX=700)
  emit('S1-Tour/walkthrough-v20.yml', {
    ...common(
      'L4-S1-walkthrough-v20',
      'Q-00',
      1,
      'L4',
      'WalkthroughCard',
      "Tour the V2.0 main() — desk_data with MAX=700, sum-positive Q1 algorithm. Read each line, see the 7 invariant pieces.",
      { kind: 'v2', ref: 'Test 2 V2.0 attempt 1 — desk_data main()' },
      ['CM-Q4-missing-const'],
    ),
    levelLabel: 'L4 · Q4 Tour · V2.0 desk main()',
    fullCode: buildMain(V20),
    steps: [
      { line: 1, code: 'int main()', annotation: 'The entry point. Returns int (0 = success).' },
      { line: 3, code: 'const int MAX = 700;', annotation: 'Compile-time constant. const REQUIRED — used as array bound below.' },
      { line: 4, code: 'desk_data desks[MAX];', annotation: 'Fixed-size array of 700 desk_data structs.' },
      { line: 5, code: 'int desk_num;', annotation: 'How-many counter, supplied by user at runtime.' },
      { line: 7, code: 'cout << "How many desks? ";', annotation: 'Prompt: tells user what to type.' },
      { line: 8, code: 'cin >> desk_num;', annotation: 'Reads desk_num. Now we know the real count.' },
      { line: 10, code: 'read_desks(desks, desk_num);', annotation: 'NO & at call site. Pass count, NOT MAX.' },
      { line: 12, code: 'for (int i = 0; i < desk_num; i++)', annotation: 'Loop bound by COUNT (not MAX).' },
      { line: 14, code: 'cout << desks[i].room_id << ", " << desks[i].d_id << ", " << desks[i].number_of_screens << endl;', annotation: 'Chained cout: 3 fields with comma separator + endl.' },
      { line: 17, code: 'return 0;', annotation: 'Success exit. Last statement of main.' },
    ],
  });

  // 2. Practice walkthrough (computer_data, MAX=100)
  emit('S1-Tour/walkthrough-prac.yml', {
    ...common(
      'L4-S1-walkthrough-prac',
      'Q-00',
      1,
      'L4',
      'WalkthroughCard',
      "Tour the practice main() — computer_data with MAX=100, find-max Q1 algorithm. Same 7-piece skeleton as V2.0 with different MAX/entity.",
      { kind: 'practice', ref: 'Test2-SIT102-practice-2026T1.txt — computer_data main()' },
      [],
    ),
    levelLabel: 'L4 · Q4 Tour · practice computer main()',
    fullCode: buildMain(PRAC),
    steps: [
      { line: 1, code: 'int main()', annotation: 'Same shape as V2.0.' },
      { line: 3, code: 'const int MAX = 100;', annotation: 'Smaller cap, same const requirement.' },
      { line: 4, code: 'computer_data computers[MAX];', annotation: 'Array sized by MAX.' },
      { line: 5, code: 'int computer_num;', annotation: 'Same role as desk_num.' },
      { line: 8, code: 'cin >> computer_num;', annotation: 'Reads count.' },
      { line: 10, code: 'read_computers(computers, computer_num);', annotation: 'Same call shape: array, count, no &.' },
      { line: 12, code: 'for (int i = 0; i < computer_num; i++)', annotation: 'Loop bound by computer_num.' },
      { line: 14, code: 'cout << computers[i].id << ", " << computers[i].description << ", " << computers[i].location << endl;', annotation: 'Three fields with comma separator + endl.' },
      { line: 17, code: 'return 0;', annotation: 'Last statement.' },
    ],
  });

  // 3-4. Two variants (DemoCards: book / employee entities)
  const variants = [
    { entity: 'book_data', plural: 'books', count: 'book_count', MAX: 200, fn: 'read_books', fields: ['title', 'author', 'pages'], prompt: 'How many books?' },
    { entity: 'employee_data', plural: 'employees', count: 'emp_num', MAX: 500, fn: 'read_employees', fields: ['id', 'name', 'salary'], prompt: 'How many employees?' },
  ];
  variants.forEach((v, i) => {
    emit(`S1-Tour/demo-variant-0${i + 1}.yml`, {
      ...common(
        `L4-S1-demo-variant-0${i + 1}`,
        'Q-00',
        1,
        'L4',
        'DemoCard',
        `Variant tour: ${v.entity} entity. Same skeleton, different name/MAX. Notice MAX=${v.MAX}, count=${v.count}, fn=${v.fn}.`,
        { kind: 'v2', ref: 'C++T2 spec §6.2 S1 entity-swap variants' },
        [],
      ),
      whyOneLine: `The Q4 main() skeleton is invariant — only entity, MAX, count_var name, and fn name change.`,
      demoCode: buildMain(v),
      highlightTokens: ['const int MAX', `${v.entity} ${v.plural}[MAX]`, `int ${v.count}`, `${v.fn}(${v.plural}, ${v.count})`, 'return 0;'],
      usedIn: ['Q4 entity transfer (any noun → main works)', 'Q4 cold-start (entity-name-only)'],
    });
  });

  // 5-17. 13 SpotError cards (FaultInjection) — covers ALL 8 critical errors
  const spotErrors = [
    {
      title: 'missing-const',
      bug: 'CM-Q4-missing-const',
      cat: 'missing const',
      broken: buildMain(V20).replace('const int MAX = 700;', 'int MAX = 700;'),
      explain: 'Missing `const`. Without it, MAX is a runtime-mutable int → array bound is no longer compile-time-constant → variable-length array (off-scope for SIT102).',
      lines: [3],
    },
    {
      title: 'var-sized-array',
      bug: 'CM-Q4-var-sized-array',
      cat: 'variable-sized array',
      broken: buildMain(V20).replace('desk_data desks[MAX];', 'desk_data desks[desk_num];'),
      explain: 'Array bound is `desk_num` — a runtime variable. C++ requires compile-time-constant. Use MAX, not count_var, in the array decl.',
      lines: [4],
    },
    {
      title: 'read-count-after-call',
      bug: 'CM-Q4-read-count-after-call',
      cat: 'wrong order',
      broken: buildMain(V20)
        .replace('cout << "How many desks? ";\n    cin >> desk_num;\n\n    read_desks(desks, desk_num);', 'read_desks(desks, desk_num);\n    cout << "How many desks? ";\n    cin >> desk_num;'),
      explain: 'read_desks called BEFORE cin reads desk_num → desk_num is uninitialised → undefined behaviour. Always read count FIRST, then call read fn.',
      lines: [10],
    },
    {
      title: 'pass-MAX-not-count',
      bug: 'CM-Q4-pass-MAX-not-count',
      cat: 'wrong argument',
      broken: buildMain(V20).replace('read_desks(desks, desk_num);', 'read_desks(desks, MAX);'),
      explain: 'Passes MAX (700) to read fn → fn loops 700 times asking for input even if user only wants 5 desks. Pass count_var, NEVER MAX.',
      lines: [10],
    },
    {
      title: 'amp-at-call',
      bug: 'CM-Q4-amp-at-call',
      cat: 'spurious &',
      broken: buildMain(V20).replace('read_desks(desks, desk_num);', 'read_desks(&desks, &desk_num);'),
      explain: 'NO `&` at call site. The `&` lives ONLY at the function signature (declaration/definition). Compiler error.',
      lines: [10],
    },
    {
      title: 'loop-uses-MAX',
      bug: 'CM-Q4-loop-uses-MAX',
      cat: 'wrong loop bound',
      broken: buildMain(V20).replace('for (int i = 0; i < desk_num; i++)', 'for (int i = 0; i < MAX; i++)'),
      explain: 'Print loop iterates 700 times even if user entered 5 desks → prints 695 garbage rows. Loop bound = count_var (NOT MAX).',
      lines: [12],
    },
    {
      title: 'missing-return',
      bug: 'CM-Q4-missing-return',
      cat: 'missing return',
      broken: buildMain(V20).replace('    return 0;\n}', '}'),
      explain: 'Missing `return 0;`. Most compilers warn or err. Test 2 grader subtracts points. Always end main with `return 0;`.',
      lines: [16],
    },
    {
      title: 'no-endl',
      bug: 'CM-Q4-no-endl',
      cat: 'missing endl',
      broken: buildMain(V20).replace(' << endl;', ';'),
      explain: 'No `endl` → all rows print on one line. Need endl at end of each iteration to start a new line.',
      lines: [14],
    },
    {
      title: 'count-decl-wrong-type',
      bug: 'CM-Q4-count-wrong-type',
      cat: 'wrong type',
      broken: buildMain(V20).replace('int desk_num;', 'double desk_num;'),
      explain: 'count_var must be int (used as array index + loop counter). double would force narrowing conversions everywhere.',
      lines: [5],
    },
    {
      title: 'arg-order-swap',
      bug: 'CM-Q4-arg-order-swap',
      cat: 'arg order',
      broken: buildMain(V20).replace('read_desks(desks, desk_num);', 'read_desks(desk_num, desks);'),
      explain: 'Argument order MUST match the read fn signature: array first, count second. Swap = type mismatch → compile error.',
      lines: [10],
    },
    {
      title: 'fn-name-typo',
      bug: 'CM-Q4-fn-name-wrong',
      cat: 'fn name typo',
      broken: buildMain(V20).replace('read_desks', 'read_desk'),
      explain: 'Function name `read_desk` (singular) does NOT match the declared `read_desks` (plural). Linker error: undefined reference.',
      lines: [10],
    },
    {
      title: 'no-prompt',
      bug: 'CM-Q4-no-prompt',
      cat: 'missing prompt',
      broken: buildMain(V20).replace('cout << "How many desks? ";\n    cin >> desk_num;', 'cin >> desk_num;'),
      explain: 'cin without a cout prompt = blank screen waiting silently. User has no idea what to type. Always prompt first.',
      lines: [7],
    },
    {
      title: 'array-size-too-small',
      bug: 'CM-Q4-array-size-wrong',
      cat: 'tiny array',
      broken: buildMain(V20).replace('const int MAX = 700;', 'const int MAX = 5;'),
      explain: 'MAX = 5 means the array can hold at most 5 desks. If user enters 6+ → out-of-bounds writes → undefined behaviour. MAX must be a generous cap.',
      lines: [3],
    },
  ];
  spotErrors.forEach((e, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S1-Tour/spoterror-${idx}-${e.title}.yml`, {
      ...common(
        `L4-S1-spoterror-${idx}`,
        'Q-00',
        1,
        'L4',
        'FaultInjectionCard',
        `Spot the bug: ${e.cat}. Read the broken main() and identify which line is wrong, then write the fix.`,
        { kind: 'v2', ref: `C++T2 spec §6.4 Q4 common error #${idx} — ${e.cat}` },
        [e.bug],
      ),
      brokenCode: e.broken,
      bugLocations: e.lines,
      fixedCode: buildMain(V20),
      bugCategory: e.cat,
      keyChecks: ['const int MAX', 'desks[MAX]', 'read_desks(desks, desk_num)', 'i < desk_num', 'return 0;'],
      explanation: e.explain,
    });
  });

  // 18-21. 4 Compare cards (Decompose) — pick the correct line of two
  const compares = [
    {
      title: 'array-decl',
      q: 'Which line correctly declares the array?',
      options: [
        { label: 'A', text: 'desk_data desks[MAX];' },
        { label: 'B', text: 'desk_data desks[desk_num];' },
        { label: 'C', text: 'desk_data desks[700];' },
        { label: 'D', text: 'desk_data * desks = new desk_data[MAX];' },
      ],
      correct: 'A',
      explain: 'A is canonical. B is a variable-length array (off-scope). C hardcodes the literal (works but loses the named cap). D uses `new` (off-scope).',
    },
    {
      title: 'fn-call',
      q: 'Which line correctly calls the read fn at call site?',
      options: [
        { label: 'A', text: 'read_desks(&desks, &desk_num);' },
        { label: 'B', text: 'read_desks(desks, desk_num);' },
        { label: 'C', text: 'read_desks(desks, MAX);' },
        { label: 'D', text: 'read_desks(desk_num, desks);' },
      ],
      correct: 'B',
      explain: 'B is canonical: no `&` at call site, count NOT MAX, array first. A puts `&` at call site (only goes on the signature). C passes MAX. D swaps arg order.',
    },
    {
      title: 'loop-bound',
      q: 'Which line correctly starts the print for-loop?',
      options: [
        { label: 'A', text: 'for (int i = 0; i < MAX; i++)' },
        { label: 'B', text: 'for (int i = 1; i <= desk_num; i++)' },
        { label: 'C', text: 'for (int i = 0; i < desk_num; i++)' },
        { label: 'D', text: 'for (int i = 0; i <= desk_num; i++)' },
      ],
      correct: 'C',
      explain: 'C is canonical. A loops MAX (700) times → garbage. B starts at 1 → skips index 0. D loops desk_num+1 → off by one (out of bounds).',
    },
    {
      title: 'count-decl',
      q: 'Which line correctly declares the count variable?',
      options: [
        { label: 'A', text: 'int desk_num;' },
        { label: 'B', text: 'double desk_num;' },
        { label: 'C', text: 'const int desk_num;' },
        { label: 'D', text: 'int desk_num = MAX;' },
      ],
      correct: 'A',
      explain: 'A is canonical. B is wrong type. C makes desk_num immutable so cin >> desk_num fails. D pre-initialises to MAX (700) — overwritten by cin but redundant.',
    },
  ];
  compares.forEach((c, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S1-Tour/compare-${idx}-${c.title}.yml`, {
      ...common(
        `L4-S1-compare-${idx}`,
        'Q-00',
        1,
        'L4',
        'DecomposeCard',
        c.q,
        { kind: 'v2', ref: 'C++T2 spec §6.2 S1 compare-line drills' },
        [],
      ),
      code: buildMain(V20),
      question: c.q,
      options: c.options,
      correctLabel: c.correct,
      explanation: c.explain,
    });
  });

  // 22-26. 5 WhatHappens cards (MCQ) — runtime behaviour
  const what = [
    {
      title: 'user-enters-3',
      stem: 'User runs the V2.0 main and types 3 at the prompt. How many rows print after read_desks returns?',
      correct: '3 rows.',
      ds: ['700 rows.', '0 rows.', 'Compile error before any input.'],
      explain: 'Loop bound is desk_num (the user-supplied 3), so exactly 3 rows print. MAX=700 only sizes the array, not the loop.',
    },
    {
      title: 'user-enters-zero',
      stem: 'User types 0 for desk_num. What happens in the print loop?',
      correct: 'Loop body never executes; control falls through to return 0.',
      ds: ['Infinite loop.', 'Crash on desks[0].', 'Prints 700 garbage rows.'],
      explain: 'i=0; 0<0 is false; loop body skipped; return 0 runs. Zero-iteration loops are safe.',
    },
    {
      title: 'forgot-const',
      stem: 'Student writes `int MAX = 700;` (no const). Compiler reaction?',
      correct: 'Error: array bound is not a compile-time constant.',
      ds: ['Warning only — compiles and runs.', 'Same as const — compiles cleanly.', 'Linker error at fn call site.'],
      explain: 'C++ fixed-size array bound MUST be compile-time constant. A non-const int does not qualify, so MAX[arr] fails at compile time.',
    },
    {
      title: 'array-uninit',
      stem: 'After `desk_data desks[MAX];` what are the field values inside desks[0..MAX-1]?',
      correct: 'Indeterminate — any prior memory contents.',
      ds: ['All zero.', 'All 1.', 'All NaN.'],
      explain: 'C++ does NOT auto-zero stack-allocated structs. Reading uninitialised fields = undefined behaviour. read_desks must initialise first count slots.',
    },
    {
      title: 'no-return-zero',
      stem: 'main lacks `return 0;`. What does the OS observe as the exit code?',
      correct: '0 — modern compilers implicitly return 0 from main, but the test grader will still deduct points for missing the line.',
      ds: ['1 — failure exit code.', 'Random integer.', 'The program will not link.'],
      explain: 'C++ standard implicitly returns 0 from main if no return; statement appears. But the SIT102 rubric assesses the line literally — write `return 0;`.',
    },
  ];
  what.forEach((w, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S1-Tour/whathappens-${idx}-${w.title}.yml`, {
      ...common(
        `L4-S1-whathappens-${idx}`,
        'Q-00',
        1,
        'L4',
        'MCQCard',
        w.stem,
        { kind: 'v2', ref: 'C++T2 spec §6.2 S1 what-happens drills' },
        [],
      ),
      correct: w.correct,
      distractors: w.ds,
      explanation: w.explain,
    });
  });
}

// =====================================================================
// S2 TEMPLATE — 50 cards
// 18 TypeLine (TemplateRecall: type one line)
// 12 OrderLines (Decompose: pick correct ordering)
// 8 FillSlot tokens (Cloze: fill one token)
// 7 FillSlot lines (Cloze: fill one line)
// 5 FullType (TemplateRecall: full skeleton)
// =====================================================================

function s2Template() {
  // Lines of the canonical V2.0 main
  const lines = [
    { id: 'l01-int-main',     text: 'int main()',                                        slot: 'function header' },
    { id: 'l02-open-brace',   text: '{',                                                 slot: 'open brace' },
    { id: 'l03-const-MAX',    text: 'const int MAX = 700;',                              slot: 'const MAX decl' },
    { id: 'l04-array-decl',   text: 'desk_data desks[MAX];',                             slot: 'struct array decl' },
    { id: 'l05-count-decl',   text: 'int desk_num;',                                     slot: 'count var decl' },
    { id: 'l06-cout-prompt',  text: 'cout << "How many desks? ";',                       slot: 'cout prompt' },
    { id: 'l07-cin-count',    text: 'cin >> desk_num;',                                  slot: 'cin reads count' },
    { id: 'l08-fn-call',      text: 'read_desks(desks, desk_num);',                      slot: 'read fn call' },
    { id: 'l09-for-header',   text: 'for (int i = 0; i < desk_num; i++)',                slot: 'for-loop header' },
    { id: 'l10-for-open',     text: '{',                                                 slot: 'for body open' },
    { id: 'l11-print-1',      text: 'cout << desks[i].room_id << ", ";',                 slot: 'print field 1' },
    { id: 'l12-print-2',      text: 'cout << desks[i].d_id << ", ";',                    slot: 'print field 2' },
    { id: 'l13-print-3',      text: 'cout << desks[i].number_of_screens << endl;',       slot: 'print field 3 + endl' },
    { id: 'l14-for-close',    text: '}',                                                 slot: 'for body close' },
    { id: 'l15-return',       text: 'return 0;',                                         slot: 'return 0' },
    { id: 'l16-close-main',   text: '}',                                                 slot: 'close main' },
  ];

  // 1-18. TypeLine drills (TemplateRecall: prompt = role of line, answer = the line)
  // We reuse same-role drills with both V2.0 and practice variants for variety.
  // For header lines (int main, for-header) we include the brace block so
  // the canonical answer ends in `}` per lint requirement.
  const intMainBlock = 'int main()\n{\n    return 0;\n}';
  const forBlockV20 = 'for (int i = 0; i < desk_num; i++)\n{\n    cout << desks[i].room_id << endl;\n}';
  const forBlockPrac = 'for (int i = 0; i < computer_num; i++)\n{\n    cout << computers[i].id << endl;\n}';
  const typeLineDrills = [
    { line: { ...lines[0], text: intMainBlock }, hint: 'int ____()\n{\n    ___;\n}' },
    { line: lines[2], hint: 'const int MAX = ___;' },
    { line: lines[3], hint: '___ ___[MAX];' },
    { line: lines[4], hint: 'int ___;' },
    { line: lines[5], hint: 'cout << "...";' },
    { line: lines[6], hint: 'cin >> ___;' },
    { line: lines[7], hint: '___(plural, count);' },
    { line: { ...lines[8], text: forBlockV20 }, hint: 'for (int i = 0; i < ___; i++)\n{\n    ...\n}' },
    { line: lines[10], hint: 'cout << ___[i].___ << ", ";' },
    { line: lines[12], hint: 'cout << ___[i].___ << endl;' },
    { line: lines[14], hint: 'return ___;' },
    // Practice variants
    { line: { ...lines[2], text: 'const int MAX = 100;', slot: 'const MAX decl (practice)' }, hint: 'const int MAX = ___;' },
    { line: { ...lines[3], text: 'computer_data computers[MAX];', slot: 'struct array decl (practice)' }, hint: '___ ___[MAX];' },
    { line: { ...lines[4], text: 'int computer_num;', slot: 'count var decl (practice)' }, hint: 'int ___;' },
    { line: { ...lines[5], text: 'cout << "How many computers? ";', slot: 'cout prompt (practice)' }, hint: 'cout << "...";' },
    { line: { ...lines[6], text: 'cin >> computer_num;', slot: 'cin reads count (practice)' }, hint: 'cin >> ___;' },
    { line: { ...lines[7], text: 'read_computers(computers, computer_num);', slot: 'read fn call (practice)' }, hint: '___(plural, count);' },
    { line: { ...lines[8], text: forBlockPrac, slot: 'for-loop header (practice)' }, hint: 'for (int i = 0; i < ___; i++)\n{\n    ...\n}' },
  ];
  typeLineDrills.forEach((d, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S2-Template/typeline-${idx}-${d.line.id}.yml`, {
      ...common(
        `L4-S2-typeline-${idx}`,
        'Q-01',
        2,
        'L4',
        'TemplateRecallCard',
        `Type the canonical line for: ${d.line.slot}.`,
        { kind: 'v2', ref: 'C++T2 spec §6.2 S2 typeline drill' },
        [],
      ),
      prompt: `Slot: ${d.line.slot}. Type the line.`,
      template: d.hint,
      canonicalAnswer: d.line.text,
      keyChecks: d.line.text.split(/\s+/).filter((t) => /[a-zA-Z_]/.test(t)).slice(0, 3),
      forbiddenTokens: ['while', 'getline', 'printf', 'scanf'],
      explanation: `Canonical: \`${d.line.text}\`. This is the exact line for "${d.line.slot}" in the V2.0/practice main() skeleton.`,
    });
  });

  // 19-30. 12 OrderLines (Decompose) — pick which order is correct
  const orderDrills = [
    { q: 'Which order is correct for the FIRST 3 lines of main body?', opts: [
      { label: 'A', text: 'const int MAX → struct array decl → int count_var' },
      { label: 'B', text: 'int count_var → const int MAX → struct array decl' },
      { label: 'C', text: 'struct array decl → const int MAX → int count_var' },
      { label: 'D', text: 'cout prompt → cin → const int MAX' },
    ], correct: 'A', explain: 'const MAX must come first (used by array decl). Array decl uses MAX. count_var declared last; only set later via cin.' },
    { q: 'Which order is correct for prompt → call?', opts: [
      { label: 'A', text: 'read fn call → cout prompt → cin' },
      { label: 'B', text: 'cout prompt → cin → read fn call' },
      { label: 'C', text: 'cin → cout prompt → read fn call' },
      { label: 'D', text: 'cout prompt → read fn call → cin' },
    ], correct: 'B', explain: 'Prompt first (so user knows what to type), THEN cin reads count, THEN call read_desks(arr, count).' },
    { q: 'Where does `return 0;` go relative to the print loop?', opts: [
      { label: 'A', text: 'Before the print loop.' },
      { label: 'B', text: 'Inside the print-loop body.' },
      { label: 'C', text: 'After the print loop, before main\'s closing brace.' },
      { label: 'D', text: 'After main\'s closing brace.' },
    ], correct: 'C', explain: 'return 0 is the LAST statement of main, AFTER the print loop, BEFORE the closing brace of main.' },
    { q: 'Which order is correct for the read pipeline?', opts: [
      { label: 'A', text: 'cin >> count → read_desks(arr, count)' },
      { label: 'B', text: 'read_desks(arr, count) → cin >> count' },
      { label: 'C', text: 'cin >> count → read_desks(arr, MAX)' },
      { label: 'D', text: 'read_desks(arr, count) → cout prompt' },
    ], correct: 'A', explain: 'cin populates count first; then we pass that real count to read_desks.' },
    { q: 'Which two lines must come AFTER `cin >> desk_num;`?', opts: [
      { label: 'A', text: 'const int MAX = 700; and desk_data desks[MAX];' },
      { label: 'B', text: 'read_desks(desks, desk_num); and the for-loop print.' },
      { label: 'C', text: 'int main() and {' },
      { label: 'D', text: 'cout prompt and int desk_num;' },
    ], correct: 'B', explain: 'Reading count first, THEN call read fn (which uses count), THEN print loop (uses count).' },
    { q: 'In the print loop, which two pieces appear in this order?', opts: [
      { label: 'A', text: 'for header → opening brace → cout fields → endl → closing brace' },
      { label: 'B', text: 'opening brace → for header → cout fields → endl → closing brace' },
      { label: 'C', text: 'for header → cout fields → opening brace → endl → closing brace' },
      { label: 'D', text: 'cout fields → for header → endl → opening brace → closing brace' },
    ], correct: 'A', explain: 'for-header first, then `{`, then body, then `}`. Body chains cout statements with endl on the LAST one.' },
    { q: 'What sits between `{` of main and `const int MAX = 700;`?', opts: [
      { label: 'A', text: 'Nothing — const MAX is the first body line.' },
      { label: 'B', text: 'cout prompt.' },
      { label: 'C', text: 'cin >> desk_num.' },
      { label: 'D', text: 'read_desks call.' },
    ], correct: 'A', explain: 'const MAX is THE first line of main\'s body. It must come before the array decl that uses it.' },
    { q: 'Where does `desk_data desks[MAX];` sit?', opts: [
      { label: 'A', text: 'Before const int MAX.' },
      { label: 'B', text: 'Immediately after const int MAX.' },
      { label: 'C', text: 'After cin >> desk_num.' },
      { label: 'D', text: 'After read_desks call.' },
    ], correct: 'B', explain: 'Array decl uses MAX → must come AFTER MAX is declared and BEFORE any code that touches the array.' },
    { q: 'Order: cout-prompt and int-count-decl.', opts: [
      { label: 'A', text: 'int count_var; THEN cout prompt.' },
      { label: 'B', text: 'cout prompt; THEN int count_var.' },
      { label: 'C', text: 'They can be in any order.' },
      { label: 'D', text: 'cout prompt only — count_var is implicitly created by cin.' },
    ], correct: 'A', explain: 'count_var must be DECLARED before cin can read into it. Decl → prompt → cin.' },
    { q: 'Which sequence is the canonical 7-piece main body?', opts: [
      { label: 'A', text: 'const MAX → arr decl → int count → cout/cin → fn call → for-print → return 0' },
      { label: 'B', text: 'int count → const MAX → arr decl → fn call → cout/cin → for-print → return 0' },
      { label: 'C', text: 'cout/cin → const MAX → arr decl → int count → fn call → for-print → return 0' },
      { label: 'D', text: 'const MAX → cout/cin → arr decl → int count → fn call → for-print → return 0' },
    ], correct: 'A', explain: 'A is the canonical 7-piece order. Memorise this.' },
    { q: 'Where does the closing brace of main go?', opts: [
      { label: 'A', text: 'Right after `return 0;`.' },
      { label: 'B', text: 'Right after the for-loop closing brace.' },
      { label: 'C', text: 'Inside the for-loop body.' },
      { label: 'D', text: 'Before const int MAX = 700.' },
    ], correct: 'A', explain: 'main\'s closing `}` is the very last token of the file; it sits right after `return 0;`.' },
    { q: 'Where does `return 0;` sit relative to main\'s `{` and `}`?', opts: [
      { label: 'A', text: 'Before main\'s `{`.' },
      { label: 'B', text: 'Inside main\'s body, last statement before `}`.' },
      { label: 'C', text: 'After main\'s closing `}`.' },
      { label: 'D', text: 'Inside the for-loop body.' },
    ], correct: 'B', explain: 'return 0 is INSIDE main\'s body but is the LAST statement, immediately before main\'s closing brace.' },
  ];
  orderDrills.forEach((d, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S2-Template/orderlines-${idx}.yml`, {
      ...common(
        `L4-S2-orderlines-${idx}`,
        'Q-01',
        2,
        'L4',
        'DecomposeCard',
        d.q,
        { kind: 'v2', ref: 'C++T2 spec §6.2 S2 OrderLines drill' },
        [],
      ),
      code: buildMain(V20),
      question: d.q,
      options: d.opts,
      correctLabel: d.correct,
      explanation: d.explain,
    });
  });

  // 31-38. 8 FillSlot tokens (Cloze) — fill ONE TOKEN
  const tokenFills = [
    { id: 'tk-const',   sentence: '`___ int MAX = 700;` — fill the missing keyword that makes MAX a compile-time constant.', answer: 'const' },
    { id: 'tk-MAX',     sentence: '`desk_data desks[___];` — fill the bound name (NOT a literal, NOT count_var).',         answer: 'MAX' },
    { id: 'tk-int',     sentence: '`___ desk_num;` — fill the type that holds the count.',                                  answer: 'int' },
    { id: 'tk-cin',     sentence: '`___ >> desk_num;` — fill the input stream name.',                                       answer: 'cin' },
    { id: 'tk-cout',    sentence: '`___ << "How many desks? ";` — fill the output stream name.',                            answer: 'cout' },
    { id: 'tk-count',   sentence: '`for (int i = 0; i < ___; i++)` — fill the bound (NOT MAX).',                             answer: 'desk_num' },
    { id: 'tk-endl',    sentence: '`cout << desks[i].number_of_screens << ___;` — fill the line-end token.',                answer: 'endl' },
    { id: 'tk-return',  sentence: '`___ 0;` — fill the keyword that ends main with success.',                              answer: 'return' },
  ];
  tokenFills.forEach((f, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S2-Template/fillslot-token-${idx}-${f.id}.yml`, {
      ...common(
        `L4-S2-fillslot-token-${idx}`,
        'Q-01',
        2,
        'L4',
        'ClozeCard',
        f.sentence,
        { kind: 'v2', ref: 'C++T2 spec §6.2 S2 FillSlot token' },
        [],
      ),
      code: buildMain(V20),
      clozeSentence: f.sentence,
      answer: f.answer,
      explanation: `The missing token is \`${f.answer}\`.`,
    });
  });

  // 39-45. 7 FillSlot lines (Cloze) — fill ONE LINE
  const lineFills = [
    { id: 'ln-const',   sentence: 'Inside main, before any other declaration, fill the line that defines the array bound.', answer: 'const int MAX = 700;' },
    { id: 'ln-arr',     sentence: 'After `const int MAX = 700;`, fill the line that declares the struct array.',             answer: 'desk_data desks[MAX];' },
    { id: 'ln-count',   sentence: 'After array decl, fill the line that declares the count variable.',                       answer: 'int desk_num;' },
    { id: 'ln-cinread', sentence: 'After the cout prompt, fill the line that reads the count from the user.',                answer: 'cin >> desk_num;' },
    { id: 'ln-fncall',  sentence: 'After cin reads the count, fill the line that calls the read fn.',                        answer: 'read_desks(desks, desk_num);' },
    { id: 'ln-forhdr',  sentence: 'Fill the for-loop header that iterates 0..count-1.',                                       answer: 'for (int i = 0; i < desk_num; i++)' },
    { id: 'ln-return',  sentence: 'Fill the last statement of main.',                                                         answer: 'return 0;' },
  ];
  lineFills.forEach((f, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S2-Template/fillslot-line-${idx}-${f.id}.yml`, {
      ...common(
        `L4-S2-fillslot-line-${idx}`,
        'Q-01',
        2,
        'L4',
        'ClozeCard',
        f.sentence,
        { kind: 'v2', ref: 'C++T2 spec §6.2 S2 FillSlot line' },
        [],
      ),
      code: buildMain(V20),
      clozeSentence: f.sentence,
      answer: f.answer,
      explanation: `Canonical line: \`${f.answer}\`.`,
    });
  });

  // 46-50. 5 FullType (TemplateRecall: full skeleton)
  const fullVariants = [
    { who: 'V2.0', cfg: V20 },
    { who: 'practice', cfg: PRAC },
    { who: 'book', cfg: { entity: 'book_data', plural: 'books', count: 'book_count', MAX: 200, fn: 'read_books', fields: ['title', 'author', 'pages'], prompt: 'How many books?' } },
    { who: 'employee', cfg: { entity: 'employee_data', plural: 'employees', count: 'emp_num', MAX: 500, fn: 'read_employees', fields: ['id', 'name', 'salary'], prompt: 'How many employees?' } },
    { who: 'order', cfg: { entity: 'order_data', plural: 'orders', count: 'order_count', MAX: 1000, fn: 'read_orders', fields: ['id', 'customer', 'total'], prompt: 'How many orders?' } },
  ];
  fullVariants.forEach((v, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S2-Template/fulltype-${idx}-${v.who}.yml`, {
      ...common(
        `L4-S2-fulltype-${idx}`,
        'Q-01',
        2,
        'L4',
        'TemplateRecallCard',
        `Type the COMPLETE main() for the ${v.who} variant. MAX=${v.cfg.MAX}, entity=${v.cfg.entity}.`,
        { kind: 'v2', ref: 'C++T2 spec §6.2 S2 FullType' },
        ['CM-Q4-skeleton-line-order'],
      ),
      prompt: `Type the full main(). entity=${v.cfg.entity}, plural=${v.cfg.plural}, count=${v.cfg.count}, MAX=${v.cfg.MAX}, fn=${v.cfg.fn}, fields=${v.cfg.fields.join('/')}.`,
      template: 'int main()\n{\n    const int MAX = ___;\n    ___ ___[MAX];\n    int ___;\n\n    cout << "..."; cin >> ___;\n\n    ___(___, ___);\n\n    for (int i = 0; i < ___; i++)\n    { ... }\n\n    return 0;\n}',
      canonicalAnswer: buildMain(v.cfg),
      keyChecks: [`const int MAX = ${v.cfg.MAX}`, `${v.cfg.entity} ${v.cfg.plural}[MAX]`, `int ${v.cfg.count}`, `${v.cfg.fn}(${v.cfg.plural}, ${v.cfg.count})`, `i < ${v.cfg.count}`, 'return 0'],
      forbiddenTokens: ['while', 'getline', 'printf'],
      explanation: `The skeleton is invariant — only entity/plural/count/MAX/fn/fields slot in. Compare your answer against the canonical for ${v.who}.`,
    });
  });
}

// =====================================================================
// S3 COMPONENTS — 130 cards across 6 blocks
// Block A const 20 + Block B array 20 + Block C count 20
// Block D fn-call 30 (gating) + Block E print loop 30 + Block F return 0 10
// =====================================================================

function s3Components() {
  // ============== BLOCK A — const int MAX (20) ==============
  // 8 write + 4 cloze + 4 mcq + 4 faultInjection
  const constMaxValues = [50, 100, 200, 300, 500, 700, 1000, 5000];
  constMaxValues.forEach((n, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S3-Components/A-const/write-${idx}-MAX${n}.yml`, {
      ...common(
        `L4-S3A-write-${idx}`,
        'Q-02',
        3,
        'L4',
        'FunctionWriteCard',
        `Write ONE LINE: declare a const int named MAX with value ${n}. This will be used as the array bound below.`,
        { kind: 'v2', ref: 'C++T2 spec §6.3 Block A const decl' },
        ['CM-Q4-missing-const'],
      ),
      prompt: `Declare \`const int MAX = ${n};\``,
      signatureHint: 'const ___ ___ = ___;',
      canonicalAnswer: `const int MAX = ${n};`,
      keyChecks: ['const', 'int', 'MAX', `${n}`, ';'],
      forbiddenTokens: ['#define', 'while'],
      passByRefRequired: false,
      explanation: `Canonical: \`const int MAX = ${n};\` — const required so MAX is a compile-time constant suitable for array bound.`,
    });
  });
  // 4 cloze
  const constClozes = [
    { sent: '`___ int MAX = 700;` — fill the keyword.', a: 'const' },
    { sent: '`const ___ MAX = 100;` — fill the type.', a: 'int' },
    { sent: '`const int ___ = 700;` — fill the conventional name.', a: 'MAX' },
    { sent: '`const int MAX = 700___` — fill the line terminator.', a: ';' },
  ];
  constClozes.forEach((c, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S3-Components/A-const/cloze-${idx}.yml`, {
      ...common(
        `L4-S3A-cloze-${idx}`,
        'Q-02',
        3,
        'L4',
        'ClozeCard',
        c.sent,
        { kind: 'v2', ref: 'C++T2 spec §6.3 Block A cloze' },
        [],
      ),
      code: 'const int MAX = 700;',
      clozeSentence: c.sent,
      answer: c.a,
      explanation: `Answer: \`${c.a}\`.`,
    });
  });
  // 4 mcq
  const constMCQs = [
    { stem: 'Why is `const` required on `const int MAX = 700;`?', correct: 'C++ requires the array bound to be a compile-time constant; `const int` qualifies, plain `int` does not.', ds: ['It is purely stylistic.', 'It saves memory.', 'It makes the program faster.'], explain: 'const enables the compiler to use MAX in array bounds. Without const, the compiler treats MAX as a runtime variable.' },
    { stem: '`#define MAX 700` vs `const int MAX = 700;` — which is preferred in SIT102?', correct: '`const int MAX = 700;` — type-safe, scoped, debuggable.', ds: ['#define — faster.', 'They are identical.', 'Neither — use `static int MAX = 700;`.'], explain: '#define is a textual macro (no type, no scope). const int is a real C++ object and is the SIT102 idiom.' },
    { stem: 'Where does `const int MAX = 700;` appear in main()?', correct: 'First statement inside main\'s body, before the array decl that uses MAX.', ds: ['Above main, at file scope only.', 'Inside the read fn, not main.', 'After the array decl.'], explain: 'It MUST precede the array decl that consumes it as a bound.' },
    { stem: '`const int MAX;` (no = 700) — legal?', correct: 'No — const objects must be initialised at declaration.', ds: ['Yes — defaults to 0.', 'Yes — defaults to MAX_INT.', 'Compiler warns but compiles.'], explain: 'const MUST be initialised in its decl. Otherwise the value is locked to indeterminate.' },
  ];
  constMCQs.forEach((m, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S3-Components/A-const/mcq-${idx}.yml`, {
      ...common(
        `L4-S3A-mcq-${idx}`,
        'Q-02',
        3,
        'L4',
        'MCQCard',
        m.stem,
        { kind: 'v2', ref: 'C++T2 spec §6.3 Block A mcq' },
        [],
      ),
      correct: m.correct,
      distractors: m.ds,
      explanation: m.explain,
    });
  });
  // 4 faultInjection
  const constFaults = [
    { brk: 'int MAX = 700;\ndesk_data desks[MAX];',                    cat: 'missing const',     fix: 'const int MAX = 700;\ndesk_data desks[MAX];',           explain: 'Add `const` so MAX is compile-time-constant suitable for array bound.', cm: 'CM-Q4-missing-const' },
    { brk: 'const MAX = 700;\ndesk_data desks[MAX];',                  cat: 'missing type',      fix: 'const int MAX = 700;\ndesk_data desks[MAX];',           explain: 'Add the type `int` between `const` and `MAX`.', cm: 'CM-Q4-missing-const' },
    { brk: 'const int MAX 700;\ndesk_data desks[MAX];',                cat: 'missing equals',    fix: 'const int MAX = 700;\ndesk_data desks[MAX];',           explain: 'Initialiser needs `=` between name and value.', cm: 'CM-Q4-missing-const' },
    { brk: '#define MAX 700\ndesk_data desks[MAX];',                   cat: 'wrong macro form',  fix: 'const int MAX = 700;\ndesk_data desks[MAX];',           explain: '#define is off-scope. Use const int.', cm: 'CM-Q4-MAX-as-define' },
  ];
  constFaults.forEach((f, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S3-Components/A-const/faultinj-${idx}.yml`, {
      ...common(
        `L4-S3A-faultinj-${idx}`,
        'Q-02',
        3,
        'L4',
        'FaultInjectionCard',
        `Fix the bug: ${f.cat}.`,
        { kind: 'v2', ref: 'C++T2 spec §6.3 Block A fault' },
        [f.cm],
      ),
      brokenCode: f.brk,
      bugLocations: [1],
      fixedCode: f.fix,
      bugCategory: f.cat,
      keyChecks: ['const', 'int', 'MAX', '700', ';'],
      explanation: f.explain,
    });
  });

  // ============== BLOCK B — Struct array decl (20) ==============
  const arrayWriteCases = [
    { e: 'desk_data', p: 'desks' },
    { e: 'computer_data', p: 'computers' },
    { e: 'book_data', p: 'books' },
    { e: 'employee_data', p: 'employees' },
    { e: 'order_data', p: 'orders' },
    { e: 'student_data', p: 'students' },
    { e: 'product_data', p: 'products' },
    { e: 'car_data', p: 'cars' },
  ];
  arrayWriteCases.forEach((c, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S3-Components/B-array/write-${idx}-${c.e}.yml`, {
      ...common(
        `L4-S3B-write-${idx}`,
        'Q-03',
        3,
        'L4',
        'FunctionWriteCard',
        `Write ONE LINE: declare a fixed-size array of ${c.e} called ${c.p}, sized by MAX.`,
        { kind: 'v2', ref: 'C++T2 spec §6.3 Block B array decl' },
        ['CM-Q4-var-sized-array'],
      ),
      prompt: `Declare \`${c.e} ${c.p}[MAX];\``,
      signatureHint: '___ ___[MAX];',
      canonicalAnswer: `${c.e} ${c.p}[MAX];`,
      keyChecks: [c.e, c.p, '[MAX]', ';'],
      forbiddenTokens: ['vector', 'new', '*', 'array<'],
      passByRefRequired: false,
      explanation: `Canonical: \`${c.e} ${c.p}[MAX];\` — type, name, [bound], semicolon. MAX MUST be a compile-time constant (NOT count_var).`,
    });
  });
  const arrayClozes = [
    { s: '`___ desks[MAX];` — fill the struct type.', a: 'desk_data' },
    { s: '`desk_data ___[MAX];` — fill the array name.', a: 'desks' },
    { s: '`desk_data desks[___];` — fill the bound.', a: 'MAX' },
    { s: '`desk_data desks[MAX]___` — fill the terminator.', a: ';' },
  ];
  arrayClozes.forEach((c, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S3-Components/B-array/cloze-${idx}.yml`, {
      ...common(
        `L4-S3B-cloze-${idx}`,
        'Q-03',
        3,
        'L4',
        'ClozeCard',
        c.s,
        { kind: 'v2', ref: 'C++T2 spec §6.3 Block B cloze' },
        [],
      ),
      code: 'desk_data desks[MAX];',
      clozeSentence: c.s,
      answer: c.a,
      explanation: `Answer: \`${c.a}\`.`,
    });
  });
  const arrayMCQs = [
    { stem: 'Why use MAX (not desk_num) in `desk_data desks[MAX];`?', correct: 'desk_num is a runtime variable; C++ array bounds must be compile-time constants.', ds: ['MAX is faster.', 'Convention only.', 'desk_num is uninitialised.'], explain: 'Variable-length arrays are not standard C++. Bound MUST be const.' },
    { stem: 'After `desk_data desks[MAX];`, which indices are usable?', correct: '0 through MAX-1 inclusive.', ds: ['1 through MAX inclusive.', '0 through MAX inclusive.', '0 through desk_num-1 inclusive.'], explain: 'C++ arrays are zero-indexed; valid indices are [0, N-1].' },
    { stem: 'Position of array decl in main()?', correct: 'After const int MAX, before int count_var.', ds: ['Before const int MAX.', 'After cin >> count.', 'After read fn call.'], explain: 'Array decl uses MAX → must come after MAX. count_var conventionally follows.' },
    { stem: '`desk_data desks[];` (no bound) — legal here?', correct: 'No — local array decl requires a bound.', ds: ['Yes — defaults to 0.', 'Yes — sized by initialiser.', 'Compiler warns only.'], explain: 'A local fixed-size array MUST have an explicit compile-time bound.' },
  ];
  arrayMCQs.forEach((m, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S3-Components/B-array/mcq-${idx}.yml`, {
      ...common(
        `L4-S3B-mcq-${idx}`,
        'Q-03',
        3,
        'L4',
        'MCQCard',
        m.stem,
        { kind: 'v2', ref: 'C++T2 spec §6.3 Block B mcq' },
        [],
      ),
      correct: m.correct,
      distractors: m.ds,
      explanation: m.explain,
    });
  });
  const arrayFaults = [
    { brk: 'desk_data desks[desk_num];',  cat: 'variable-length array', fix: 'desk_data desks[MAX];', cm: 'CM-Q4-var-sized-array', explain: 'desk_num is runtime → use MAX (compile-time const).' },
    { brk: 'desk_data desks[];',          cat: 'no bound',              fix: 'desk_data desks[MAX];', cm: 'CM-Q4-array-size-wrong', explain: 'A local array decl requires a bound.' },
    { brk: 'desk_data desks(MAX);',       cat: 'wrong delimiter',       fix: 'desk_data desks[MAX];', cm: 'CM-Q4-array-size-wrong', explain: 'Array uses [], not ().' },
    { brk: 'desk_data desks[MAX]',        cat: 'missing semicolon',     fix: 'desk_data desks[MAX];', cm: 'CM-Q4-array-size-wrong', explain: 'Statement must end in `;`.' },
  ];
  arrayFaults.forEach((f, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S3-Components/B-array/faultinj-${idx}.yml`, {
      ...common(
        `L4-S3B-faultinj-${idx}`,
        'Q-03',
        3,
        'L4',
        'FaultInjectionCard',
        `Fix the bug: ${f.cat}.`,
        { kind: 'v2', ref: 'C++T2 spec §6.3 Block B fault' },
        [f.cm],
      ),
      brokenCode: f.brk,
      bugLocations: [1],
      fixedCode: f.fix,
      bugCategory: f.cat,
      keyChecks: ['desk_data', 'desks', '[MAX]', ';'],
      explanation: f.explain,
    });
  });

  // ============== BLOCK C — count + prompt + cin (20) ==============
  const countWriteCases = [
    { c: 'desk_num', e: 'desks' },
    { c: 'computer_num', e: 'computers' },
    { c: 'book_count', e: 'books' },
    { c: 'emp_num', e: 'employees' },
    { c: 'order_count', e: 'orders' },
    { c: 'n', e: 'items' },
    { c: 'count', e: 'records' },
    { c: 'student_num', e: 'students' },
  ];
  countWriteCases.forEach((c, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S3-Components/C-count/write-${idx}-${c.c}.yml`, {
      ...common(
        `L4-S3C-write-${idx}`,
        'Q-04',
        3,
        'L4',
        'FunctionWriteCard',
        `Write the 3-line block: declare int ${c.c};, prompt with cout, read with cin >> ${c.c};.`,
        { kind: 'v2', ref: 'C++T2 spec §6.3 Block C count+prompt+cin' },
        ['CM-Q4-no-prompt'],
      ),
      prompt: `Declare int ${c.c}, prompt the user "How many ${c.e}?", read with cin.`,
      signatureHint: 'int ___;\ncout << "..."; cin >> ___;',
      canonicalAnswer: `int ${c.c};\ncout << "How many ${c.e}? ";\ncin >> ${c.c};`,
      keyChecks: ['int', c.c, 'cout', 'cin', '>>', ';'],
      forbiddenTokens: ['getline', 'while', 'scanf'],
      passByRefRequired: false,
      explanation: `Decl int ${c.c} → cout prompt → cin >> ${c.c}. ALWAYS in this order.`,
    });
  });
  const countClozes = [
    { s: '`___ desk_num;` — fill the type.', a: 'int' },
    { s: '`int ___;` — fill the count name (V2.0 convention).', a: 'desk_num' },
    { s: '`cout << "How many ___? ";` — fill the entity plural.', a: 'desks' },
    { s: '`cin >> ___;` — fill the count var (NOT MAX).', a: 'desk_num' },
  ];
  countClozes.forEach((c, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S3-Components/C-count/cloze-${idx}.yml`, {
      ...common(
        `L4-S3C-cloze-${idx}`,
        'Q-04',
        3,
        'L4',
        'ClozeCard',
        c.s,
        { kind: 'v2', ref: 'C++T2 spec §6.3 Block C cloze' },
        [],
      ),
      code: 'int desk_num;\ncout << "How many desks? ";\ncin >> desk_num;',
      clozeSentence: c.s,
      answer: c.a,
      explanation: `Answer: \`${c.a}\`.`,
    });
  });
  const countMCQs = [
    { stem: 'Order: prompt and cin?', correct: 'cout prompt FIRST, then cin reads.', ds: ['cin first, prompt second.', 'Either order works.', 'Both must be on the same line.'], explain: 'Prompt first so user knows what to type; then cin.' },
    { stem: 'Why declare int desk_num separately from cin?', correct: 'cin >> desk_num requires desk_num to already exist as an int.', ds: ['It does not — cin can declare on the fly.', 'Cosmetic only.', 'Prevents compiler warnings.'], explain: 'cin >> X writes into X. X must be a declared variable of compatible type.' },
    { stem: 'What value does desk_num hold IMMEDIATELY after `int desk_num;` (before cin)?', correct: 'Indeterminate — undefined behaviour to read it.', ds: ['Always 0.', 'MAX.', 'A compiler-generated default.'], explain: 'Local ints are NOT zero-initialised. Reading before writing is UB.' },
    { stem: 'After `cin >> desk_num;` — what should happen next?', correct: 'Call read fn with (array, desk_num).', ds: ['Print the array.', 'return 0.', 'Re-prompt for another count.'], explain: 'Now we know the real count → call read fn → fill array → print → return 0.' },
  ];
  countMCQs.forEach((m, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S3-Components/C-count/mcq-${idx}.yml`, {
      ...common(
        `L4-S3C-mcq-${idx}`,
        'Q-04',
        3,
        'L4',
        'MCQCard',
        m.stem,
        { kind: 'v2', ref: 'C++T2 spec §6.3 Block C mcq' },
        [],
      ),
      correct: m.correct,
      distractors: m.ds,
      explanation: m.explain,
    });
  });
  const countFaults = [
    { brk: 'cin >> desk_num;\ncout << "How many desks? ";', cat: 'wrong order',       fix: 'cout << "How many desks? ";\ncin >> desk_num;', cm: 'CM-Q4-no-prompt', explain: 'Prompt before cin, not after.' },
    { brk: 'cin >> desk_num;',                              cat: 'no prompt',         fix: 'cout << "How many desks? ";\ncin >> desk_num;', cm: 'CM-Q4-no-prompt', explain: 'Prompt the user first.' },
    { brk: 'double desk_num;\ncin >> desk_num;',            cat: 'wrong type',        fix: 'int desk_num;\ncin >> desk_num;',                cm: 'CM-Q4-count-wrong-type', explain: 'count must be int.' },
    { brk: 'int desk_num\ncin >> desk_num;',                cat: 'missing semicolon', fix: 'int desk_num;\ncin >> desk_num;',                cm: 'CM-Q4-count-wrong-type', explain: 'Statement needs `;`.' },
  ];
  countFaults.forEach((f, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S3-Components/C-count/faultinj-${idx}.yml`, {
      ...common(
        `L4-S3C-faultinj-${idx}`,
        'Q-04',
        3,
        'L4',
        'FaultInjectionCard',
        `Fix the bug: ${f.cat}.`,
        { kind: 'v2', ref: 'C++T2 spec §6.3 Block C fault' },
        [f.cm],
      ),
      brokenCode: f.brk,
      bugLocations: [1],
      fixedCode: f.fix,
      bugCategory: f.cat,
      keyChecks: ['int', 'desk_num', 'cout', 'cin', '>>'],
      explanation: f.explain,
    });
  });

  // ============== BLOCK D — Function call (30, GATING) ==============
  // 10 write + 5 cloze + 5 mcq + 10 faultInjection — high quality
  const callWriteCases = [
    { fn: 'read_desks',     p: 'desks',     c: 'desk_num' },
    { fn: 'read_computers', p: 'computers', c: 'computer_num' },
    { fn: 'read_books',     p: 'books',     c: 'book_count' },
    { fn: 'read_employees', p: 'employees', c: 'emp_num' },
    { fn: 'read_orders',    p: 'orders',    c: 'order_count' },
    { fn: 'read_students',  p: 'students',  c: 'student_num' },
    { fn: 'read_products',  p: 'products',  c: 'product_count' },
    { fn: 'read_cars',      p: 'cars',      c: 'car_num' },
    { fn: 'read_records',   p: 'records',   c: 'n' },
    { fn: 'read_items',     p: 'items',     c: 'count' },
  ];
  callWriteCases.forEach((c, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S3-Components/D-call/write-${idx}-${c.fn}.yml`, {
      ...common(
        `L4-S3D-write-${idx}`,
        'Q-05',
        3,
        'L4',
        'FunctionWriteCard',
        `[GATING 95%] Write ONE LINE: call ${c.fn}, passing the array ${c.p} and the count ${c.c}. NO & at call site. Pass count, NOT MAX.`,
        { kind: 'v2', ref: 'C++T2 spec §6.3 Block D fn call (gating)' },
        ['CM-Q4-amp-at-call', 'CM-Q4-pass-MAX-not-count'],
      ),
      prompt: `Call \`${c.fn}(${c.p}, ${c.c});\``,
      signatureHint: '___(___, ___);',
      canonicalAnswer: `${c.fn}(${c.p}, ${c.c});`,
      keyChecks: [c.fn, c.p, c.c, ';'],
      forbiddenTokens: ['&', 'MAX'],
      passByRefRequired: false,
      explanation: `Canonical: \`${c.fn}(${c.p}, ${c.c});\`. NO \`&\` (& only on signature). NEVER pass MAX (pass count_var). Order: array first, count second.`,
    });
  });
  const callClozes = [
    { s: '`___(desks, desk_num);` — fill the fn name (entity = desk).', a: 'read_desks' },
    { s: '`read_desks(___, desk_num);` — fill the array arg.', a: 'desks' },
    { s: '`read_desks(desks, ___);` — fill the count arg (NOT MAX).', a: 'desk_num' },
    { s: '`read_desks(desks, desk_num)___` — fill the line terminator.', a: ';' },
    { s: '`read_computers(computers, ___);` — fill the count.', a: 'computer_num' },
  ];
  callClozes.forEach((c, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S3-Components/D-call/cloze-${idx}.yml`, {
      ...common(
        `L4-S3D-cloze-${idx}`,
        'Q-05',
        3,
        'L4',
        'ClozeCard',
        c.s,
        { kind: 'v2', ref: 'C++T2 spec §6.3 Block D cloze' },
        [],
      ),
      code: 'read_desks(desks, desk_num);',
      clozeSentence: c.s,
      answer: c.a,
      explanation: `Answer: \`${c.a}\`.`,
    });
  });
  const callMCQs = [
    { stem: 'Where does the `&` go for pass-by-reference?', correct: 'ONLY at the function signature/declaration. NEVER at the call site.', ds: ['At both signature and call site.', 'Only at the call site.', 'Always — anywhere safe.'], explain: 'C++ pass-by-reference: `&` lives on the parameter type at the function declaration/definition. Caller writes plain variable names.' },
    { stem: 'Argument order: which goes first?', correct: 'The array (plural), then the count.', ds: ['count first, array second.', 'Either order is fine.', 'count first, MAX second.'], explain: 'Match the read fn signature. SIT102 convention is (array, count) in that order.' },
    { stem: 'Why pass desk_num NOT MAX?', correct: 'desk_num holds the user-specified count; MAX is the array cap. Reading MAX iterations would prompt for 700 inputs.', ds: ['MAX is faster.', 'They are equivalent.', 'desk_num is undefined at this point.'], explain: 'The read fn loops 0..count-1. Passing MAX makes it loop 0..MAX-1 → over-prompt.' },
    { stem: '`read_desks(&desks, &desk_num);` — what happens?', correct: 'Compile error — types do not match the parameter types.', ds: ['Works correctly.', 'Runtime error.', 'Linker error only.'], explain: '&desks gives a pointer-to-array (different type from desk_data array). Compile error.' },
    { stem: '`read_desks();` (no args) — legal?', correct: 'No — read_desks expects 2 arguments.', ds: ['Yes — args default.', 'Yes — but UB at runtime.', 'Compiles but does nothing.'], explain: 'C++ functions require all declared args (no implicit defaults unless given default values).' },
  ];
  callMCQs.forEach((m, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S3-Components/D-call/mcq-${idx}.yml`, {
      ...common(
        `L4-S3D-mcq-${idx}`,
        'Q-05',
        3,
        'L4',
        'MCQCard',
        m.stem,
        { kind: 'v2', ref: 'C++T2 spec §6.3 Block D mcq' },
        [],
      ),
      correct: m.correct,
      distractors: m.ds,
      explanation: m.explain,
    });
  });
  const callFaults = [
    { brk: 'read_desks(&desks, &desk_num);',          cat: 'spurious & on both args',  fix: 'read_desks(desks, desk_num);', cm: 'CM-Q4-amp-at-call' },
    { brk: 'read_desks(&desks, desk_num);',           cat: 'spurious & on array',      fix: 'read_desks(desks, desk_num);', cm: 'CM-Q4-amp-at-call' },
    { brk: 'read_desks(desks, &desk_num);',           cat: 'spurious & on count',      fix: 'read_desks(desks, desk_num);', cm: 'CM-Q4-amp-at-call' },
    { brk: 'read_desks(desks, MAX);',                 cat: 'pass MAX not count',       fix: 'read_desks(desks, desk_num);', cm: 'CM-Q4-pass-MAX-not-count' },
    { brk: 'read_desks(desk_num, desks);',            cat: 'arg order swap',           fix: 'read_desks(desks, desk_num);', cm: 'CM-Q4-arg-order-swap' },
    { brk: 'read_desk(desks, desk_num);',             cat: 'fn name typo (singular)',  fix: 'read_desks(desks, desk_num);', cm: 'CM-Q4-fn-name-wrong' },
    { brk: 'readDesks(desks, desk_num);',             cat: 'wrong case (camelCase)',   fix: 'read_desks(desks, desk_num);', cm: 'CM-Q4-fn-name-wrong' },
    { brk: 'read_desks(desks, desk_num)',             cat: 'missing semicolon',        fix: 'read_desks(desks, desk_num);', cm: 'CM-Q4-fn-name-wrong' },
    { brk: 'read_desks();',                           cat: 'no arguments',             fix: 'read_desks(desks, desk_num);', cm: 'CM-Q4-fn-name-wrong' },
    { brk: 'read_desks(desks);',                      cat: 'missing count argument',   fix: 'read_desks(desks, desk_num);', cm: 'CM-Q4-fn-name-wrong' },
  ];
  callFaults.forEach((f, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S3-Components/D-call/faultinj-${idx}.yml`, {
      ...common(
        `L4-S3D-faultinj-${idx}`,
        'Q-05',
        3,
        'L4',
        'FaultInjectionCard',
        `[GATING] Fix the bug: ${f.cat}.`,
        { kind: 'v2', ref: 'C++T2 spec §6.3 Block D fault' },
        [f.cm],
      ),
      brokenCode: f.brk,
      bugLocations: [1],
      fixedCode: f.fix,
      bugCategory: f.cat,
      keyChecks: ['read_desks', 'desks', 'desk_num', ';'],
      explanation: `Bug: ${f.cat}. Canonical: \`read_desks(desks, desk_num);\` — no \`&\`, count NOT MAX, array first.`,
    });
  });

  // ============== BLOCK E — Print loop (30) ==============
  // 10 write + 5 cloze + 5 mcq + 10 faultInjection
  const printWriteCases = [
    { p: 'desks',     c: 'desk_num',      f: ['room_id', 'd_id', 'number_of_screens'] },
    { p: 'computers', c: 'computer_num',  f: ['id', 'description', 'location'] },
    { p: 'books',     c: 'book_count',    f: ['title', 'author', 'pages'] },
    { p: 'employees', c: 'emp_num',       f: ['id', 'name', 'salary'] },
    { p: 'orders',    c: 'order_count',   f: ['id', 'customer', 'total'] },
    { p: 'students',  c: 'student_num',   f: ['id', 'name', 'grade'] },
    { p: 'products',  c: 'product_count', f: ['id', 'name', 'price'] },
    { p: 'cars',      c: 'car_num',       f: ['model', 'year', 'price'] },
    { p: 'items',     c: 'n',             f: ['code', 'name', 'qty'] },
    { p: 'records',   c: 'count',         f: ['id', 'tag', 'value'] },
  ];
  printWriteCases.forEach((c, i) => {
    const idx = String(i + 1).padStart(2, '0');
    const body = c.f.map((f, j) => `    cout << ${c.p}[i].${f}${j < c.f.length - 1 ? ' << ", "' : ' << endl'};`).join('\n');
    const code = `for (int i = 0; i < ${c.c}; i++)\n{\n${body}\n}`;
    emit(`S3-Components/E-print/write-${idx}-${c.p}.yml`, {
      ...common(
        `L4-S3E-write-${idx}`,
        'Q-06',
        3,
        'L4',
        'FunctionWriteCard',
        `Write the print for-loop: iterate i=0..${c.c}-1 and chained-cout the 3 fields.`,
        { kind: 'v2', ref: 'C++T2 spec §6.3 Block E print loop' },
        ['CM-Q4-loop-uses-MAX', 'CM-Q4-no-endl'],
      ),
      prompt: `Print all ${c.c} ${c.p} as comma-separated rows (3 fields per row + endl).`,
      signatureHint: 'for (int i = 0; i < ___; i++) {\n  cout << ___[i].___ << ", " << ___[i].___ << ", " << ___[i].___ << endl;\n}',
      canonicalAnswer: code,
      keyChecks: [`i < ${c.c}`, c.p, ...c.f, 'endl'],
      forbiddenTokens: ['while', 'getline', 'printf'],
      passByRefRequired: false,
      explanation: `Loop bound = ${c.c} (count, NOT MAX). Last cout in body uses endl. Comma separators between fields.`,
    });
  });
  const printClozes = [
    { s: '`for (int i = 0; i < ___; i++)` — fill the bound (NOT MAX).', a: 'desk_num' },
    { s: '`cout << desks[i].room_id << ___ << desks[i].d_id...` — fill the separator string.', a: '", "' },
    { s: '`cout << desks[i].___ << endl;` — fill the LAST field.', a: 'number_of_screens' },
    { s: '`cout << desks[i].number_of_screens << ___;` — fill the line-end.', a: 'endl' },
    { s: '`for (int i = ___; i < desk_num; i++)` — fill the start index.', a: '0' },
  ];
  printClozes.forEach((c, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S3-Components/E-print/cloze-${idx}.yml`, {
      ...common(
        `L4-S3E-cloze-${idx}`,
        'Q-06',
        3,
        'L4',
        'ClozeCard',
        c.s,
        { kind: 'v2', ref: 'C++T2 spec §6.3 Block E cloze' },
        [],
      ),
      code: 'for (int i = 0; i < desk_num; i++)\n{\n    cout << desks[i].room_id << ", " << desks[i].d_id << ", " << desks[i].number_of_screens << endl;\n}',
      clozeSentence: c.s,
      answer: c.a,
      explanation: `Answer: \`${c.a}\`.`,
    });
  });
  const printMCQs = [
    { stem: 'Why is the loop bound desk_num and NOT MAX?', correct: 'Iterating MAX times prints garbage rows beyond what the user actually entered.', ds: ['MAX is faster.', 'MAX is more thorough.', 'desk_num is unsafe.'], explain: 'desks[desk_num..MAX-1] are uninitialised. Printing them = garbage values.' },
    { stem: 'Why call endl ONLY on the last cout per iteration?', correct: 'endl ends the row; intermediate fields are separated by ", ".', ds: ['endl is wrong here entirely.', 'You need endl after every field.', 'You need endl before every field.'], explain: 'One row per iteration; one endl per row at the END.' },
    { stem: '`for (int i = 1; i <= desk_num; i++)` — what happens?', correct: 'Skips desks[0] AND reads desks[desk_num] (out of bounds when desk_num > 0).', ds: ['Works correctly.', 'Skips only desks[0].', 'Reads only desks[desk_num].'], explain: 'C++ valid indices are [0, count-1]. The standard for-loop is i=0; i<count; i++.' },
    { stem: 'Chained vs separate cout — both legal?', correct: 'Yes — `cout << a << b;` and `cout << a; cout << b;` are equivalent.', ds: ['No — chained is required.', 'No — separate is required.', 'Chained is faster but separate is safer.'], explain: 'Both produce the same output. Chained is the canonical SIT102 idiom.' },
    { stem: 'Forgetting endl — what does the output look like?', correct: 'All rows concatenated on one line with no newlines.', ds: ['Each row on its own line.', 'No output at all.', 'A compiler warning.'], explain: 'Without endl, cout does not insert a newline. Rows run together.' },
  ];
  printMCQs.forEach((m, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S3-Components/E-print/mcq-${idx}.yml`, {
      ...common(
        `L4-S3E-mcq-${idx}`,
        'Q-06',
        3,
        'L4',
        'MCQCard',
        m.stem,
        { kind: 'v2', ref: 'C++T2 spec §6.3 Block E mcq' },
        [],
      ),
      correct: m.correct,
      distractors: m.ds,
      explanation: m.explain,
    });
  });
  const printFaults = [
    { brk: 'for (int i = 0; i < MAX; i++)\n{\n    cout << desks[i].room_id << endl;\n}', cat: 'loop uses MAX',     fix: 'for (int i = 0; i < desk_num; i++)\n{\n    cout << desks[i].room_id << endl;\n}', cm: 'CM-Q4-loop-uses-MAX' },
    { brk: 'for (int i = 0; i < desk_num; i++)\n{\n    cout << desks[i].room_id;\n}',     cat: 'no endl',           fix: 'for (int i = 0; i < desk_num; i++)\n{\n    cout << desks[i].room_id << endl;\n}', cm: 'CM-Q4-no-endl' },
    { brk: 'for (int i = 1; i <= desk_num; i++)\n{\n    cout << desks[i].room_id << endl;\n}', cat: 'off by one',  fix: 'for (int i = 0; i < desk_num; i++)\n{\n    cout << desks[i].room_id << endl;\n}', cm: 'CM-Q4-loop-off-by-one' },
    { brk: 'for (int i = 0; i < desk_num; i++)\n{\n    cout << desks.room_id << endl;\n}', cat: 'missing [i]',     fix: 'for (int i = 0; i < desk_num; i++)\n{\n    cout << desks[i].room_id << endl;\n}', cm: 'CM-Q4-loop-off-by-one' },
    { brk: 'for (int i = 0; i < desk_num; i++)\n{\n    cout << desks[i] << endl;\n}',     cat: 'missing .field',   fix: 'for (int i = 0; i < desk_num; i++)\n{\n    cout << desks[i].room_id << endl;\n}', cm: 'CM-Q4-loop-off-by-one' },
    { brk: 'for (int i = 0; i < desk_num; i++)\n{\n    cout << desks[i].room_id desks[i].d_id << endl;\n}', cat: 'missing <<',  fix: 'for (int i = 0; i < desk_num; i++)\n{\n    cout << desks[i].room_id << desks[i].d_id << endl;\n}', cm: 'CM-Q4-print-no-separator' },
    { brk: 'for (int i = 0; i < desk_num; i++)\n    cout << desks[i].room_id << endl;', cat: 'missing braces',     fix: 'for (int i = 0; i < desk_num; i++)\n{\n    cout << desks[i].room_id << endl;\n}', cm: 'CM-Q4-print-no-separator' },
    { brk: 'for (int i = 0, i < desk_num, i++)\n{\n    cout << desks[i].room_id << endl;\n}', cat: 'commas not semicolons in for', fix: 'for (int i = 0; i < desk_num; i++)\n{\n    cout << desks[i].room_id << endl;\n}', cm: 'CM-Q4-loop-off-by-one' },
    { brk: 'for (int i = 0; i < desk_num; i++);\n{\n    cout << desks[i].room_id << endl;\n}', cat: 'spurious semicolon after for-header', fix: 'for (int i = 0; i < desk_num; i++)\n{\n    cout << desks[i].room_id << endl;\n}', cm: 'CM-Q4-loop-off-by-one' },
    { brk: 'for (int i = 0; i < desk_num; i++)\n{\n    cout << desks[i].room_id << "\\n" << desks[i].d_id << endl;\n}', cat: 'wrong separator', fix: 'for (int i = 0; i < desk_num; i++)\n{\n    cout << desks[i].room_id << ", " << desks[i].d_id << endl;\n}', cm: 'CM-Q4-print-no-separator' },
  ];
  printFaults.forEach((f, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S3-Components/E-print/faultinj-${idx}.yml`, {
      ...common(
        `L4-S3E-faultinj-${idx}`,
        'Q-06',
        3,
        'L4',
        'FaultInjectionCard',
        `Fix the bug: ${f.cat}.`,
        { kind: 'v2', ref: 'C++T2 spec §6.3 Block E fault' },
        [f.cm],
      ),
      brokenCode: f.brk,
      bugLocations: [1],
      fixedCode: f.fix,
      bugCategory: f.cat,
      keyChecks: ['for', 'desk_num', 'desks[i]', 'endl'],
      explanation: `Bug: ${f.cat}. The canonical print loop uses count_var, has braces, semicolons in the for-header, and uses endl on the last cout.`,
    });
  });

  // ============== BLOCK F — return 0 (10) ==============
  // 4 write + 2 cloze + 2 mcq + 2 faultInjection
  for (let i = 0; i < 4; i++) {
    const idx = String(i + 1).padStart(2, '0');
    const variants = [
      { stem: 'Write the LAST line of main: return 0.', code: 'return 0;' },
      { stem: 'Add the missing last line to a main that ends print loop.', code: 'return 0;' },
      { stem: 'Type the canonical last statement of main.', code: 'return 0;' },
      { stem: 'Write the correct return statement for `int main()`.', code: 'return 0;' },
    ];
    const v = variants[i];
    emit(`S3-Components/F-return/write-${idx}.yml`, {
      ...common(
        `L4-S3F-write-${idx}`,
        'Q-07',
        3,
        'L4',
        'FunctionWriteCard',
        v.stem,
        { kind: 'v2', ref: 'C++T2 spec §6.3 Block F return 0' },
        ['CM-Q4-missing-return'],
      ),
      prompt: 'Write `return 0;`',
      signatureHint: '___ ___;',
      canonicalAnswer: v.code,
      keyChecks: ['return', '0', ';'],
      forbiddenTokens: ['exit', 'while'],
      passByRefRequired: false,
      explanation: '`return 0;` ends main with success. Last statement, before main\'s closing brace.',
    });
  }
  const retClozes = [
    { s: '`___ 0;` — fill the keyword.', a: 'return' },
    { s: '`return ___;` — fill the success exit code.', a: '0' },
  ];
  retClozes.forEach((c, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S3-Components/F-return/cloze-${idx}.yml`, {
      ...common(
        `L4-S3F-cloze-${idx}`,
        'Q-07',
        3,
        'L4',
        'ClozeCard',
        c.s,
        { kind: 'v2', ref: 'C++T2 spec §6.3 Block F cloze' },
        [],
      ),
      code: 'return 0;',
      clozeSentence: c.s,
      answer: c.a,
      explanation: `Answer: \`${c.a}\`.`,
    });
  });
  const retMCQs = [
    { stem: 'Why `return 0;` and not `return 1;` from main?', correct: 'Convention: 0 means success; non-zero means failure.', ds: ['1 is success.', 'Either works.', 'It is a syntax requirement.'], explain: 'POSIX/Windows convention: 0=success. 1+ = error codes.' },
    { stem: 'Where does `return 0;` go in main?', correct: 'Last statement inside main\'s body, before the closing brace.', ds: ['First statement.', 'Outside main.', 'Inside the for-loop.'], explain: 'main returns control to the OS only after its last statement.' },
  ];
  retMCQs.forEach((m, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S3-Components/F-return/mcq-${idx}.yml`, {
      ...common(
        `L4-S3F-mcq-${idx}`,
        'Q-07',
        3,
        'L4',
        'MCQCard',
        m.stem,
        { kind: 'v2', ref: 'C++T2 spec §6.3 Block F mcq' },
        [],
      ),
      correct: m.correct,
      distractors: m.ds,
      explanation: m.explain,
    });
  });
  const retFaults = [
    {
      brk: 'int main()\n{\n    for (int i = 0; i < n; i++) { cout << "x" << endl; }\n}',
      cat: 'missing return',
      fix: 'int main()\n{\n    for (int i = 0; i < n; i++) { cout << "x" << endl; }\n    return 0;\n}',
      cm: 'CM-Q4-missing-return',
      explain: 'Add `return 0;` before main\'s closing brace.',
    },
    {
      brk: 'int main()\n{\n    for (int i = 0; i < n; i++) { cout << "x" << endl; }\n    return;\n}',
      cat: 'return without value',
      fix: 'int main()\n{\n    for (int i = 0; i < n; i++) { cout << "x" << endl; }\n    return 0;\n}',
      cm: 'CM-Q4-return-wrong-value',
      explain: '`int main()` requires `return <int>;` — write `return 0;`.',
    },
  ];
  retFaults.forEach((f, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S3-Components/F-return/faultinj-${idx}.yml`, {
      ...common(
        `L4-S3F-faultinj-${idx}`,
        'Q-07',
        3,
        'L4',
        'FaultInjectionCard',
        `Fix the bug: ${f.cat}.`,
        { kind: 'v2', ref: 'C++T2 spec §6.3 Block F fault' },
        [f.cm],
      ),
      brokenCode: f.brk,
      bugLocations: [4],
      fixedCode: f.fix,
      bugCategory: f.cat,
      keyChecks: ['return', '0', ';'],
      explanation: f.explain,
    });
  });
}

// =====================================================================
// S4 COMPOSE — 95 cards
// 10 V2.0 + 10 practice + 20 fill-blank scaffold + 20 novel
// 10 two-pane + 15 cold-start (Q2+Q3+Q4) + 10 end-to-end
// =====================================================================

function s4Compose() {
  // 1-10. V2.0 main full (10 trials) — MainWriteCard
  for (let i = 0; i < 10; i++) {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S4-Compose/v20-trial-${idx}.yml`, {
      ...common(
        `L4-S4-v20-trial-${idx}`,
        'Q-08',
        4,
        'L4',
        'MainWriteCard',
        `[V2.0 trial ${i + 1}/10] Write the COMPLETE main() for the V2.0 desk_data variant. MAX=700, count=desk_num, fn=read_desks, fields=room_id/d_id/number_of_screens.`,
        { kind: 'v2', ref: 'Test 2 V2.0 attempt 1 — full main()' },
        ['CM-Q4-missing-const', 'CM-Q4-pass-MAX-not-count', 'CM-Q4-amp-at-call', 'CM-Q4-loop-uses-MAX', 'CM-Q4-missing-return'],
      ),
      prompt: 'Write the full V2.0 main() exactly. const MAX=700, desk_data desks[MAX], int desk_num, prompt+cin, read_desks call, print loop bound by desk_num, return 0.',
      canonicalAnswer: buildMain(V20),
      keyChecks: ['const int MAX = 700', 'desk_data desks[MAX]', 'int desk_num', 'cin >> desk_num', 'read_desks(desks, desk_num)', 'i < desk_num', 'desks[i].room_id', 'endl', 'return 0'],
      forbiddenTokens: ['while', 'getline', 'printf'],
      expectedTerminal: ['How many desks?'],
      explanation: 'Canonical V2.0 main(). Practice typing this from scratch 10 times → motor memory under exam pressure.',
    });
  }
  // 11-20. Practice main full (10 trials)
  for (let i = 0; i < 10; i++) {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S4-Compose/prac-trial-${idx}.yml`, {
      ...common(
        `L4-S4-prac-trial-${idx}`,
        'Q-08',
        4,
        'L4',
        'MainWriteCard',
        `[practice trial ${i + 1}/10] Write the COMPLETE main() for the practice computer_data variant. MAX=100, count=computer_num, fn=read_computers, fields=id/description/location.`,
        { kind: 'practice', ref: 'Test2-SIT102-practice-2026T1.txt — full main()' },
        ['CM-Q4-missing-const', 'CM-Q4-pass-MAX-not-count'],
      ),
      prompt: 'Write the full practice main() exactly. const MAX=100, computer_data computers[MAX], int computer_num, prompt+cin, read_computers call, print loop, return 0.',
      canonicalAnswer: buildMain(PRAC),
      keyChecks: ['const int MAX = 100', 'computer_data computers[MAX]', 'int computer_num', 'cin >> computer_num', 'read_computers(computers, computer_num)', 'i < computer_num', 'computers[i].id', 'endl', 'return 0'],
      forbiddenTokens: ['while', 'getline', 'printf'],
      expectedTerminal: ['How many computers?'],
      explanation: 'Canonical practice main(). Same skeleton as V2.0 with different MAX/entity.',
    });
  }
  // 21-40. Fill-in-the-blank scaffold (20 cards) — ClozeCard
  // Each card has the full main with one section blanked
  const blankSections = [
    { section: 'const decl', blank: '_______________________', answer: 'const int MAX = 700;' },
    { section: 'array decl', blank: '_______________________', answer: 'desk_data desks[MAX];' },
    { section: 'count decl', blank: '_______________________', answer: 'int desk_num;' },
    { section: 'cout prompt', blank: '_______________________', answer: 'cout << "How many desks? ";' },
    { section: 'cin', blank: '_______________________', answer: 'cin >> desk_num;' },
    { section: 'read fn call', blank: '_______________________', answer: 'read_desks(desks, desk_num);' },
    { section: 'for-loop header', blank: '_______________________', answer: 'for (int i = 0; i < desk_num; i++)' },
    { section: 'print field 1', blank: '_______________________', answer: 'cout << desks[i].room_id << ", ";' },
    { section: 'print field 2', blank: '_______________________', answer: 'cout << desks[i].d_id << ", ";' },
    { section: 'print field 3 + endl', blank: '_______________________', answer: 'cout << desks[i].number_of_screens << endl;' },
    // Practice variants
    { section: 'const decl (practice)', blank: '_______________________', answer: 'const int MAX = 100;' },
    { section: 'array decl (practice)', blank: '_______________________', answer: 'computer_data computers[MAX];' },
    { section: 'count decl (practice)', blank: '_______________________', answer: 'int computer_num;' },
    { section: 'read fn call (practice)', blank: '_______________________', answer: 'read_computers(computers, computer_num);' },
    { section: 'for-loop header (practice)', blank: '_______________________', answer: 'for (int i = 0; i < computer_num; i++)' },
    { section: 'print 3 fields (practice)', blank: '_______________________', answer: 'cout << computers[i].id << ", " << computers[i].description << ", " << computers[i].location << endl;' },
    { section: 'return 0', blank: '_______________________', answer: 'return 0;' },
    { section: 'whole prompt+cin block', blank: '_______________________', answer: 'cout << "How many desks? ";\ncin >> desk_num;' },
    { section: 'whole call line + arg list', blank: '_______________________', answer: 'read_desks(desks, desk_num);' },
    { section: 'whole for-loop body (3 fields)', blank: '_______________________', answer: 'cout << desks[i].room_id << ", " << desks[i].d_id << ", " << desks[i].number_of_screens << endl;' },
  ];
  blankSections.forEach((s, i) => {
    const idx = String(i + 1).padStart(2, '0');
    const sentence = `Fill in the blank for the ${s.section} of the canonical main(). Type the line(s) exactly.`;
    emit(`S4-Compose/scaffold-fillblank-${idx}.yml`, {
      ...common(
        `L4-S4-scaffold-fillblank-${idx}`,
        'Q-08',
        4,
        'L4',
        'ClozeCard',
        `[scaffold ${i + 1}/20] ${sentence}`,
        { kind: 'v2', ref: 'C++T2 spec §6.4 S4 fill-blank scaffold' },
        ['CM-Q4-missing-const'],
      ),
      code: buildMain(V20),
      clozeSentence: sentence,
      answer: s.answer,
      explanation: `Canonical answer: \`${s.answer}\`. This is the exact line(s) for the ${s.section}.`,
    });
  });
  // 41-60. 20 novel entities full main (MainWriteCard)
  const novelEntities = [
    { entity: 'book_data',     plural: 'books',     count: 'book_count',    MAX: 200,  fn: 'read_books',     fields: ['title', 'author', 'pages'],         prompt: 'How many books?' },
    { entity: 'employee_data', plural: 'employees', count: 'emp_num',       MAX: 500,  fn: 'read_employees', fields: ['id', 'name', 'salary'],            prompt: 'How many employees?' },
    { entity: 'order_data',    plural: 'orders',    count: 'order_count',   MAX: 1000, fn: 'read_orders',    fields: ['id', 'customer', 'total'],         prompt: 'How many orders?' },
    { entity: 'student_data',  plural: 'students',  count: 'student_num',   MAX: 300,  fn: 'read_students',  fields: ['id', 'name', 'grade'],             prompt: 'How many students?' },
    { entity: 'product_data',  plural: 'products',  count: 'product_count', MAX: 500,  fn: 'read_products',  fields: ['id', 'name', 'price'],             prompt: 'How many products?' },
    { entity: 'car_data',      plural: 'cars',      count: 'car_num',       MAX: 100,  fn: 'read_cars',      fields: ['model', 'year', 'price'],          prompt: 'How many cars?' },
    { entity: 'movie_data',    plural: 'movies',    count: 'movie_count',   MAX: 250,  fn: 'read_movies',    fields: ['title', 'director', 'duration'],   prompt: 'How many movies?' },
    { entity: 'song_data',     plural: 'songs',     count: 'song_num',      MAX: 1000, fn: 'read_songs',     fields: ['title', 'artist', 'length'],       prompt: 'How many songs?' },
    { entity: 'game_data',     plural: 'games',     count: 'game_count',    MAX: 200,  fn: 'read_games',     fields: ['title', 'genre', 'score'],         prompt: 'How many games?' },
    { entity: 'house_data',    plural: 'houses',    count: 'house_num',     MAX: 300,  fn: 'read_houses',    fields: ['address', 'bedrooms', 'price'],    prompt: 'How many houses?' },
    { entity: 'flight_data',   plural: 'flights',   count: 'flight_count',  MAX: 800,  fn: 'read_flights',   fields: ['number', 'origin', 'destination'], prompt: 'How many flights?' },
    { entity: 'hotel_data',    plural: 'hotels',    count: 'hotel_num',     MAX: 150,  fn: 'read_hotels',    fields: ['name', 'rating', 'price'],         prompt: 'How many hotels?' },
    { entity: 'pet_data',      plural: 'pets',      count: 'pet_num',       MAX: 100,  fn: 'read_pets',      fields: ['name', 'species', 'age'],          prompt: 'How many pets?' },
    { entity: 'recipe_data',   plural: 'recipes',   count: 'recipe_count',  MAX: 200,  fn: 'read_recipes',   fields: ['name', 'cuisine', 'time'],         prompt: 'How many recipes?' },
    { entity: 'plant_data',    plural: 'plants',    count: 'plant_num',     MAX: 200,  fn: 'read_plants',    fields: ['name', 'family', 'height'],        prompt: 'How many plants?' },
    { entity: 'tool_data',     plural: 'tools',     count: 'tool_count',    MAX: 50,   fn: 'read_tools',     fields: ['name', 'type', 'weight'],          prompt: 'How many tools?' },
    { entity: 'event_data',    plural: 'events',    count: 'event_num',     MAX: 250,  fn: 'read_events',    fields: ['name', 'date', 'attendance'],      prompt: 'How many events?' },
    { entity: 'lab_data',      plural: 'labs',      count: 'lab_num',       MAX: 30,   fn: 'read_labs',      fields: ['number', 'topic', 'mark'],         prompt: 'How many labs?' },
    { entity: 'task_data',     plural: 'tasks',     count: 'task_count',    MAX: 500,  fn: 'read_tasks',     fields: ['id', 'title', 'priority'],         prompt: 'How many tasks?' },
    { entity: 'sensor_data',   plural: 'sensors',   count: 'sensor_num',    MAX: 1000, fn: 'read_sensors',   fields: ['id', 'reading', 'unit'],           prompt: 'How many sensors?' },
  ];
  novelEntities.forEach((e, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S4-Compose/novel-${idx}-${e.entity}.yml`, {
      ...common(
        `L4-S4-novel-${idx}`,
        'Q-08',
        4,
        'L4',
        'MainWriteCard',
        `[novel ${i + 1}/20] Write the COMPLETE main() for the ${e.entity} entity. Apply the canonical 7-piece skeleton with MAX=${e.MAX}, count=${e.count}, fn=${e.fn}.`,
        { kind: 'v2', ref: 'C++T2 spec §6.4 S4 novel entity transfer' },
        ['CM-Q4-missing-const', 'CM-Q4-pass-MAX-not-count', 'CM-Q4-amp-at-call'],
      ),
      prompt: `Write a full main() for ${e.entity}. const MAX = ${e.MAX}; count_var = ${e.count}; fn = ${e.fn}; fields = ${e.fields.join(', ')}; prompt = "${e.prompt}".`,
      canonicalAnswer: buildMain(e),
      keyChecks: [`const int MAX = ${e.MAX}`, `${e.entity} ${e.plural}[MAX]`, `int ${e.count}`, `cin >> ${e.count}`, `${e.fn}(${e.plural}, ${e.count})`, `i < ${e.count}`, ...e.fields.map((f) => `${e.plural}[i].${f}`), 'endl', 'return 0'],
      forbiddenTokens: ['while', 'getline', 'printf'],
      expectedTerminal: [e.prompt],
      explanation: `Same skeleton as V2.0 — only entity name, MAX, count_var, fn, fields differ. Pattern transfer drill.`,
    });
  });
  // 61-70. 10 two-pane: Q2+Q3 left, write Q4 right (MainWriteCard with prefilled context)
  // We carry the implied Q2 struct + Q3 read fn in the prompt (left pane).
  const twoPaneCases = [
    { entity: 'desk_data',     plural: 'desks',     count: 'desk_num',     MAX: 700,  fn: 'read_desks',     fields: ['room_id', 'd_id', 'number_of_screens'],   types: ['int', 'int', 'int'],           prompt: 'How many desks?' },
    { entity: 'computer_data', plural: 'computers', count: 'computer_num', MAX: 100,  fn: 'read_computers', fields: ['id', 'description', 'location'],          types: ['int', 'string', 'string'],     prompt: 'How many computers?' },
    { entity: 'book_data',     plural: 'books',     count: 'book_count',   MAX: 200,  fn: 'read_books',     fields: ['title', 'author', 'pages'],               types: ['string', 'string', 'int'],     prompt: 'How many books?' },
    { entity: 'employee_data', plural: 'employees', count: 'emp_num',      MAX: 500,  fn: 'read_employees', fields: ['id', 'name', 'salary'],                   types: ['int', 'string', 'double'],     prompt: 'How many employees?' },
    { entity: 'order_data',    plural: 'orders',    count: 'order_count',  MAX: 1000, fn: 'read_orders',    fields: ['id', 'customer', 'total'],                types: ['int', 'string', 'double'],     prompt: 'How many orders?' },
    { entity: 'product_data',  plural: 'products',  count: 'p_num',        MAX: 500,  fn: 'read_products',  fields: ['id', 'name', 'price'],                    types: ['int', 'string', 'double'],     prompt: 'How many products?' },
    { entity: 'student_data',  plural: 'students',  count: 's_count',      MAX: 300,  fn: 'read_students',  fields: ['id', 'name', 'grade'],                    types: ['int', 'string', 'double'],     prompt: 'How many students?' },
    { entity: 'movie_data',    plural: 'movies',    count: 'movie_count',  MAX: 250,  fn: 'read_movies',    fields: ['title', 'director', 'duration'],          types: ['string', 'string', 'int'],     prompt: 'How many movies?' },
    { entity: 'flight_data',   plural: 'flights',   count: 'f_count',      MAX: 800,  fn: 'read_flights',   fields: ['number', 'origin', 'destination'],        types: ['int', 'string', 'string'],     prompt: 'How many flights?' },
    { entity: 'hotel_data',    plural: 'hotels',    count: 'hotel_num',    MAX: 150,  fn: 'read_hotels',    fields: ['name', 'rating', 'price'],                types: ['string', 'double', 'double'],  prompt: 'How many hotels?' },
  ];
  twoPaneCases.forEach((c, i) => {
    const idx = String(i + 1).padStart(2, '0');
    const structFields = c.fields.map((f, j) => `    ${c.types[j]} ${f};`).join('\n');
    const struct = `struct ${c.entity}\n{\n${structFields}\n};`;
    const fnSig = `void ${c.fn}(${c.entity} ${c.plural}[], int &count);`;
    emit(`S4-Compose/twopane-${idx}-${c.entity}.yml`, {
      ...common(
        `L4-S4-twopane-${idx}`,
        'Q-08',
        4,
        'L4',
        'MainWriteCard',
        `[two-pane ${i + 1}/10] Q2 (struct) and Q3 (read fn signature) are GIVEN below. Your job: write Q4 main() that uses them.`,
        { kind: 'v2', ref: 'C++T2 spec §6.4 S4 two-pane Q2+Q3+Q4 integration' },
        ['CM-Q4-amp-at-call', 'CM-Q4-pass-MAX-not-count'],
      ),
      prompt: `LEFT PANE (given):\n${struct}\n\n${fnSig}\n\nRIGHT PANE (write): the full main() that calls ${c.fn} and prints all ${c.fields.length} fields per row. MAX = ${c.MAX}; count = ${c.count}; prompt = "${c.prompt}".`,
      canonicalAnswer: buildMain(c),
      keyChecks: [`const int MAX = ${c.MAX}`, `${c.entity} ${c.plural}[MAX]`, `int ${c.count}`, `${c.fn}(${c.plural}, ${c.count})`, `i < ${c.count}`, ...c.fields.map((f) => `${c.plural}[i].${f}`), 'return 0'],
      forbiddenTokens: ['while', 'getline', 'printf'],
      expectedTerminal: [c.prompt],
      explanation: 'Two-pane integration: main() consumes Q2 struct and Q3 read fn. Practise calling the SAME signature shown on the left (no & at call site).',
    });
  });
  // 71-85. 15 cold-start (Q2+Q3+Q4 chain from entity name only) — MainWriteCard but answer includes all 3
  const coldStartCases = [
    { entity: 'park_data',     plural: 'parks',     count: 'park_num',     MAX: 100, fn: 'read_parks',    fields: ['name', 'area', 'visitors'],     types: ['string', 'double', 'int'],  prompt: 'How many parks?' },
    { entity: 'lecture_data',  plural: 'lectures',  count: 'lec_num',      MAX: 50,  fn: 'read_lectures', fields: ['code', 'topic', 'attendance'],  types: ['string', 'string', 'int'],   prompt: 'How many lectures?' },
    { entity: 'invoice_data',  plural: 'invoices',  count: 'inv_count',    MAX: 500, fn: 'read_invoices', fields: ['id', 'amount', 'date'],          types: ['int', 'double', 'string'],  prompt: 'How many invoices?' },
    { entity: 'route_data',    plural: 'routes',    count: 'route_num',    MAX: 300, fn: 'read_routes',   fields: ['name', 'distance', 'time'],     types: ['string', 'double', 'int'],   prompt: 'How many routes?' },
    { entity: 'tree_data',     plural: 'trees',     count: 'tree_count',   MAX: 200, fn: 'read_trees',    fields: ['species', 'height', 'age'],     types: ['string', 'double', 'int'],   prompt: 'How many trees?' },
    { entity: 'recipe_data',   plural: 'recipes',   count: 'rec_count',    MAX: 100, fn: 'read_recipes',  fields: ['name', 'prep_time', 'rating'],  types: ['string', 'int', 'double'],   prompt: 'How many recipes?' },
    { entity: 'beach_data',    plural: 'beaches',   count: 'beach_num',    MAX: 80,  fn: 'read_beaches',  fields: ['name', 'length', 'rating'],     types: ['string', 'double', 'double'],prompt: 'How many beaches?' },
    { entity: 'club_data',     plural: 'clubs',     count: 'club_num',     MAX: 50,  fn: 'read_clubs',    fields: ['name', 'members', 'fee'],       types: ['string', 'int', 'double'],   prompt: 'How many clubs?' },
    { entity: 'gym_data',      plural: 'gyms',      count: 'gym_count',    MAX: 30,  fn: 'read_gyms',     fields: ['name', 'price', 'rating'],      types: ['string', 'double', 'double'],prompt: 'How many gyms?' },
    { entity: 'island_data',   plural: 'islands',   count: 'island_num',   MAX: 100, fn: 'read_islands',  fields: ['name', 'area', 'population'],   types: ['string', 'double', 'int'],   prompt: 'How many islands?' },
    { entity: 'theatre_data',  plural: 'theatres',  count: 'theatre_num',  MAX: 40,  fn: 'read_theatres', fields: ['name', 'seats', 'rating'],      types: ['string', 'int', 'double'],   prompt: 'How many theatres?' },
    { entity: 'museum_data',   plural: 'museums',   count: 'museum_count', MAX: 80,  fn: 'read_museums',  fields: ['name', 'city', 'visitors'],     types: ['string', 'string', 'int'],   prompt: 'How many museums?' },
    { entity: 'lake_data',     plural: 'lakes',     count: 'lake_num',     MAX: 200, fn: 'read_lakes',    fields: ['name', 'depth', 'area'],        types: ['string', 'double', 'double'],prompt: 'How many lakes?' },
    { entity: 'mountain_data', plural: 'mountains', count: 'mt_count',     MAX: 150, fn: 'read_mountains',fields: ['name', 'height', 'range'],      types: ['string', 'double', 'string'],prompt: 'How many mountains?' },
    { entity: 'river_data',    plural: 'rivers',    count: 'river_num',    MAX: 100, fn: 'read_rivers',   fields: ['name', 'length', 'source'],     types: ['string', 'double', 'string'],prompt: 'How many rivers?' },
  ];
  coldStartCases.forEach((c, i) => {
    const idx = String(i + 1).padStart(2, '0');
    const structFields = c.fields.map((f, j) => `    ${c.types[j]} ${f};`).join('\n');
    const struct = `struct ${c.entity}\n{\n${structFields}\n};`;
    const cinReads = c.fields.map((f) => `        cin >> ${c.plural}[i].${f};`).join('\n');
    const readFn = `void ${c.fn}(${c.entity} ${c.plural}[], int &count)\n{\n    cout << "How many ${c.plural}? ";\n    cin >> count;\n    for (int i = 0; i < count; i++)\n    {\n${cinReads}\n    }\n}`;
    const main = buildMain(c);
    const fullChain = `// Q2: struct\n${struct}\n\n// Q3: read fn\n${readFn}\n\n// Q4: main\n${main}`;
    emit(`S4-Compose/coldstart-${idx}-${c.entity}.yml`, {
      ...common(
        `L4-S4-coldstart-${idx}`,
        'Q-08',
        4,
        'L4',
        'MainWriteCard',
        `[cold-start ${i + 1}/15] Entity: ${c.entity}. From ENTITY NAME ONLY, write all three: Q2 struct, Q3 read fn, Q4 main(). Fields chosen at your discretion (suggested: ${c.fields.join(', ')}).`,
        { kind: 'v2', ref: 'C++T2 spec §6.4 S4 cold-start Q2+Q3+Q4 chain' },
        ['CM-Q4-amp-at-call', 'CM-Q4-pass-MAX-not-count'],
      ),
      prompt: `Entity name: ${c.entity}. Write all 3 questions:\nQ2 — struct definition with fields\nQ3 — read fn signature + body that fills the array\nQ4 — main() that calls the read fn and prints all rows.\n\nSuggested fields: ${c.fields.join(', ')} with types ${c.types.join(', ')}. MAX = ${c.MAX}. count_var = ${c.count}. fn = ${c.fn}. prompt = "${c.prompt}".`,
      canonicalAnswer: fullChain,
      keyChecks: [`struct ${c.entity}`, ...c.fields, c.fn, `${c.entity} ${c.plural}[MAX]`, `i < ${c.count}`, 'return 0'],
      forbiddenTokens: ['while', 'getline', 'printf'],
      expectedTerminal: [c.prompt],
      explanation: 'End-to-end transfer: from entity name → 3-question integrated answer. Tests whether the student internalised the full Q2/Q3/Q4 pipeline.',
    });
  });
  // 86-95. 10 end-to-end pipeline practice — MainWriteCard, full chain compile-and-run sim
  for (let i = 0; i < 10; i++) {
    const idx = String(i + 1).padStart(2, '0');
    const variant = i % 2 === 0 ? V20 : PRAC;
    emit(`S4-Compose/end2end-${idx}.yml`, {
      ...common(
        `L4-S4-end2end-${idx}`,
        'Q-08',
        4,
        'L4',
        'MainWriteCard',
        `[end-to-end ${i + 1}/10] Write the FULL main() and visualise compile-and-run with sample input "${variant.entity === 'desk_data' ? '3' : '2'}". Tag mental notes: const, no & at call, count NOT MAX, endl, return 0.`,
        { kind: 'v2', ref: 'C++T2 spec §6.4 S4 end-to-end pipeline' },
        ['CM-Q4-missing-const', 'CM-Q4-amp-at-call', 'CM-Q4-loop-uses-MAX', 'CM-Q4-missing-return'],
      ),
      prompt: `Write the full main() for ${variant.entity} and self-check: (1) const? (2) array sized by MAX? (3) cin reads count BEFORE call? (4) call has no &? (5) call passes count not MAX? (6) loop bound count not MAX? (7) endl on last cout? (8) return 0;?`,
      canonicalAnswer: buildMain(variant),
      keyChecks: [`const int MAX = ${variant.MAX}`, `${variant.entity} ${variant.plural}[MAX]`, `int ${variant.count}`, `${variant.fn}(${variant.plural}, ${variant.count})`, `i < ${variant.count}`, 'endl', 'return 0'],
      forbiddenTokens: ['while', 'getline', 'printf'],
      expectedTerminal: [variant.prompt],
      explanation: 'End-to-end pipeline practice. After writing, walk through every checkpoint mentally — match each piece to the canonical 7-piece skeleton.',
    });
  }
}

// =====================================================================
// S5 VARIATIONS — 55 cards
// 10 different MAX + 10 different entities + 10 with-print-fn
// 10 different count names + 10 different field counts (2/3/4/5) + 5 dynamic count
// =====================================================================

function s5Variations() {
  // 1-10. 10 different MAX values
  const maxValues = [50, 75, 100, 200, 300, 500, 700, 1000, 2000, 5000];
  maxValues.forEach((m, i) => {
    const idx = String(i + 1).padStart(2, '0');
    const cfg = { ...V20, MAX: m };
    emit(`S5-Variations/diffmax-${idx}-MAX${m}.yml`, {
      ...common(
        `L4-S5-diffmax-${idx}`,
        'Q-09',
        5,
        'L4',
        'MainWriteCard',
        `[MAX variation ${i + 1}/10] Write the V2.0 main() with MAX = ${m}. Everything else identical.`,
        { kind: 'v2', ref: 'C++T2 spec §6.5 S5 MAX variations' },
        ['CM-Q4-MAX-hardcode'],
      ),
      prompt: `Re-write the V2.0 main but use MAX = ${m}.`,
      canonicalAnswer: buildMain(cfg),
      keyChecks: [`const int MAX = ${m}`, 'desks[MAX]', 'desk_num', 'return 0'],
      forbiddenTokens: ['while', 'getline'],
      expectedTerminal: ['How many desks?'],
      explanation: `MAX is a parameter — not a magic literal. The skeleton is identical for any MAX.`,
    });
  });
  // 11-20. 10 different entities
  const diffEntities = [
    { entity: 'lab_data', plural: 'labs', count: 'lab_num', MAX: 30, fn: 'read_labs', fields: ['number', 'topic', 'mark'], prompt: 'How many labs?' },
    { entity: 'building_data', plural: 'buildings', count: 'b_count', MAX: 50, fn: 'read_buildings', fields: ['address', 'floors', 'rooms'], prompt: 'How many buildings?' },
    { entity: 'sport_data', plural: 'sports', count: 'sport_num', MAX: 40, fn: 'read_sports', fields: ['name', 'players', 'rules'], prompt: 'How many sports?' },
    { entity: 'website_data', plural: 'websites', count: 'web_count', MAX: 100, fn: 'read_websites', fields: ['url', 'visits', 'rank'], prompt: 'How many websites?' },
    { entity: 'app_data', plural: 'apps', count: 'app_num', MAX: 200, fn: 'read_apps', fields: ['name', 'version', 'downloads'], prompt: 'How many apps?' },
    { entity: 'pet_data', plural: 'pets', count: 'pet_count', MAX: 50, fn: 'read_pets', fields: ['name', 'species', 'age'], prompt: 'How many pets?' },
    { entity: 'meal_data', plural: 'meals', count: 'meal_num', MAX: 100, fn: 'read_meals', fields: ['name', 'calories', 'price'], prompt: 'How many meals?' },
    { entity: 'project_data', plural: 'projects', count: 'p_count', MAX: 80, fn: 'read_projects', fields: ['title', 'lead', 'status'], prompt: 'How many projects?' },
    { entity: 'gadget_data', plural: 'gadgets', count: 'g_num', MAX: 60, fn: 'read_gadgets', fields: ['name', 'brand', 'cost'], prompt: 'How many gadgets?' },
    { entity: 'song_data', plural: 'songs', count: 's_count', MAX: 1000, fn: 'read_songs', fields: ['title', 'artist', 'length'], prompt: 'How many songs?' },
  ];
  diffEntities.forEach((e, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S5-Variations/diffentity-${idx}-${e.entity}.yml`, {
      ...common(
        `L4-S5-diffentity-${idx}`,
        'Q-09',
        5,
        'L4',
        'MainWriteCard',
        `[entity variation ${i + 1}/10] Write the full main() for ${e.entity}.`,
        { kind: 'v2', ref: 'C++T2 spec §6.5 S5 entity variations' },
        ['CM-Q4-entity-naming-drift'],
      ),
      prompt: `entity = ${e.entity}; MAX = ${e.MAX}; count = ${e.count}; fn = ${e.fn}; fields = ${e.fields.join(', ')}.`,
      canonicalAnswer: buildMain(e),
      keyChecks: [`const int MAX = ${e.MAX}`, `${e.entity} ${e.plural}[MAX]`, `int ${e.count}`, `${e.fn}(${e.plural}, ${e.count})`, 'return 0'],
      forbiddenTokens: ['while', 'getline'],
      expectedTerminal: [e.prompt],
      explanation: 'Same skeleton; new entity. Pattern transfer drill.',
    });
  });
  // 21-30. 10 with-print-fn (separate print fn vs inline loop)
  for (let i = 0; i < 10; i++) {
    const idx = String(i + 1).padStart(2, '0');
    const printFnMain = `int main()\n{\n    const int MAX = 700;\n    desk_data desks[MAX];\n    int desk_num;\n\n    cout << "How many desks? ";\n    cin >> desk_num;\n\n    read_desks(desks, desk_num);\n    print_desks(desks, desk_num);\n\n    return 0;\n}`;
    emit(`S5-Variations/withprintfn-${idx}.yml`, {
      ...common(
        `L4-S5-withprintfn-${idx}`,
        'Q-09',
        5,
        'L4',
        'MainWriteCard',
        `[print-fn variation ${i + 1}/10] Instead of inline for-loop, call print_desks(desks, desk_num) AFTER read_desks. Same result; cleaner main.`,
        { kind: 'v2', ref: 'C++T2 spec §6.5 S5 with-print-fn variant' },
        [],
      ),
      prompt: 'Re-write V2.0 main using a separate print fn `print_desks(desks, desk_num)` instead of an inline for-loop.',
      canonicalAnswer: printFnMain,
      keyChecks: ['const int MAX = 700', 'desks[MAX]', 'cin >> desk_num', 'read_desks(desks, desk_num)', 'print_desks(desks, desk_num)', 'return 0'],
      forbiddenTokens: ['while', 'for'],
      expectedTerminal: ['How many desks?'],
      explanation: 'Replacing inline loop with a print fn call shows that the loop is encapsulated. Same arg pattern: array + count, no &.',
    });
  }
  // 31-40. 10 different count names
  const countNames = ['n', 'count', 'k', 'num', 'total', 'sz', 'how_many', 'qty', 'amount', 'records'];
  countNames.forEach((cn, i) => {
    const idx = String(i + 1).padStart(2, '0');
    const cfg = { ...V20, count: cn };
    emit(`S5-Variations/diffcount-${idx}-${cn}.yml`, {
      ...common(
        `L4-S5-diffcount-${idx}`,
        'Q-09',
        5,
        'L4',
        'MainWriteCard',
        `[count-name variation ${i + 1}/10] Re-write V2.0 main using count name = ${cn}.`,
        { kind: 'v2', ref: 'C++T2 spec §6.5 S5 count-name variations' },
        [],
      ),
      prompt: `Use ${cn} as the count variable name everywhere.`,
      canonicalAnswer: buildMain(cfg),
      keyChecks: [`int ${cn}`, `cin >> ${cn}`, `read_desks(desks, ${cn})`, `i < ${cn}`, 'return 0'],
      forbiddenTokens: ['while', 'getline'],
      expectedTerminal: ['How many desks?'],
      explanation: 'Count-var name is a slot. Pick anything sensible; consistency is what matters.',
    });
  });
  // 41-50. 10 different field counts (2/3/4/5)
  const fieldVariants = [
    { fields: ['id', 'name'], n: 2 },
    { fields: ['id', 'name', 'price'], n: 3 },
    { fields: ['id', 'name', 'price', 'qty'], n: 4 },
    { fields: ['id', 'name', 'price', 'qty', 'rating'], n: 5 },
    { fields: ['code', 'description'], n: 2 },
    { fields: ['code', 'description', 'price'], n: 3 },
    { fields: ['code', 'description', 'price', 'category'], n: 4 },
    { fields: ['code', 'description', 'price', 'category', 'stock'], n: 5 },
    { fields: ['title', 'author'], n: 2 },
    { fields: ['title', 'author', 'pages', 'isbn', 'year'], n: 5 },
  ];
  fieldVariants.forEach((v, i) => {
    const idx = String(i + 1).padStart(2, '0');
    const cfg = { ...PRAC, fields: v.fields };
    emit(`S5-Variations/difffields-${idx}-n${v.n}.yml`, {
      ...common(
        `L4-S5-difffields-${idx}`,
        'Q-09',
        5,
        'L4',
        'MainWriteCard',
        `[field-count variation ${i + 1}/10] ${v.n} fields per row: ${v.fields.join(', ')}. Adjust the print loop accordingly.`,
        { kind: 'v2', ref: 'C++T2 spec §6.5 S5 field-count variations' },
        ['CM-Q4-field-count-fixed-3'],
      ),
      prompt: `${v.n} fields: ${v.fields.join(', ')}. Update print loop to chain ${v.n} cout statements with comma separator + endl on the last.`,
      canonicalAnswer: buildMain(cfg),
      keyChecks: ['const int MAX', 'computer_data computers[MAX]', 'computer_num', 'read_computers(computers, computer_num)', ...v.fields, 'endl', 'return 0'],
      forbiddenTokens: ['while', 'getline'],
      expectedTerminal: ['How many computers?'],
      explanation: `${v.n} fields → ${v.n} chained couts in the print loop. The skeleton is otherwise identical.`,
    });
  });
  // 51-55. 5 dynamic count edge cases
  const dynamicCases = [
    { stem: 'User enters 0 — what should main print?', code: buildMain(V20), correct: 'Nothing in the print loop; main exits with return 0.', ds: ['MAX rows of garbage.', 'Compile error.', 'Infinite loop.'] },
    { stem: 'User enters MAX (=700) — what does the loop do?', code: buildMain(V20), correct: 'Reads 700 desks, prints 700 rows.', ds: ['Compile error.', 'Skips the loop.', 'Reads MAX-1 desks.'] },
    { stem: 'User enters MAX+1 (=701) — what is the risk?', code: buildMain(V20), correct: 'Out-of-bounds writes in read_desks; UB.', ds: ['Auto-resize.', 'Compile error.', 'Loops 701 times safely.'] },
    { stem: 'User enters -3 — what does the loop do?', code: buildMain(V20), correct: 'i=0; 0 < -3 is false → loop body skipped; return 0 runs.', ds: ['Loops 3 times.', 'Loops MAX times.', 'Crash.'] },
    { stem: 'User enters non-integer "abc" — cin reaction?', code: buildMain(V20), correct: 'cin sets fail bit; desk_num remains uninitialised — print loop iterates an indeterminate number of times.', ds: ['Auto-converts to 0.', 'Compile error.', 'Re-prompts the user.'] },
  ];
  dynamicCases.forEach((d, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S5-Variations/dynamiccount-${idx}.yml`, {
      ...common(
        `L4-S5-dynamiccount-${idx}`,
        'Q-09',
        5,
        'L4',
        'MCQCard',
        d.stem,
        { kind: 'v2', ref: 'C++T2 spec §6.5 S5 dynamic count edge cases' },
        [],
      ),
      correct: d.correct,
      distractors: d.ds,
      explanation: 'Edge-case behaviour — knowing these prevents surprise bugs in mock exams.',
    });
  });
}

// =====================================================================
// S6 SPEED — 25 cards
// 5 V2.0 timed (90s) + 5 practice timed (90s)
// 10 novel under 90s + 5 end-to-end Q2+Q3+Q4 chain under 8 min
// =====================================================================

function s6Speed() {
  // 1-5. 5 V2.0 timed (SpeedDrillCard)
  for (let i = 0; i < 5; i++) {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S6-Speed/v20-timed-${idx}.yml`, {
      ...common(
        `L4-S6-v20-timed-${idx}`,
        'Q-10',
        6,
        'L4',
        'SpeedDrillCard',
        `[V2.0 timed ${i + 1}/5] You have 90 seconds to write the full V2.0 main(). After 5s flash of the prompt, the timer starts.`,
        { kind: 'v2', ref: 'C++T2 spec §6.6 S6 timed V2.0' },
        ['CM-Q4-time-pressure-skip-const', 'CM-Q4-time-pressure-no-return'],
      ),
      prompt: 'Write the V2.0 main(): const MAX=700, desk_data, desk_num, prompt+cin, read_desks call, print 3 fields, return 0.',
      canonicalAnswer: buildMain(V20),
      keyChecks: ['const int MAX = 700', 'desk_data desks[MAX]', 'cin >> desk_num', 'read_desks(desks, desk_num)', 'i < desk_num', 'endl', 'return 0'],
      flashSeconds: 5,
      targetSeconds: 90,
      explanation: '90s is realistic exam pace. Build motor memory.',
    });
  }
  // 6-10. 5 practice timed
  for (let i = 0; i < 5; i++) {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S6-Speed/prac-timed-${idx}.yml`, {
      ...common(
        `L4-S6-prac-timed-${idx}`,
        'Q-10',
        6,
        'L4',
        'SpeedDrillCard',
        `[practice timed ${i + 1}/5] 90 seconds to write the practice main() (computer_data, MAX=100).`,
        { kind: 'practice', ref: 'C++T2 spec §6.6 S6 timed practice' },
        ['CM-Q4-time-pressure-skip-const'],
      ),
      prompt: 'Write the practice main(): const MAX=100, computer_data, computer_num, prompt+cin, read_computers call, print 3 fields, return 0.',
      canonicalAnswer: buildMain(PRAC),
      keyChecks: ['const int MAX = 100', 'computer_data computers[MAX]', 'cin >> computer_num', 'read_computers(computers, computer_num)', 'i < computer_num', 'endl', 'return 0'],
      flashSeconds: 5,
      targetSeconds: 90,
      explanation: '90s practice main(). Prove fluency on the practice canonical.',
    });
  }
  // 11-20. 10 novel under 90s
  const speedNovels = [
    { entity: 'task_data', plural: 'tasks', count: 'task_num', MAX: 200, fn: 'read_tasks', fields: ['id', 'title', 'priority'], prompt: 'How many tasks?' },
    { entity: 'note_data', plural: 'notes', count: 'note_num', MAX: 100, fn: 'read_notes', fields: ['id', 'subject', 'date'], prompt: 'How many notes?' },
    { entity: 'idea_data', plural: 'ideas', count: 'idea_num', MAX: 50, fn: 'read_ideas', fields: ['title', 'category', 'rating'], prompt: 'How many ideas?' },
    { entity: 'event_data', plural: 'events', count: 'event_num', MAX: 250, fn: 'read_events', fields: ['name', 'date', 'attendance'], prompt: 'How many events?' },
    { entity: 'class_data', plural: 'classes', count: 'class_num', MAX: 30, fn: 'read_classes', fields: ['code', 'topic', 'size'], prompt: 'How many classes?' },
    { entity: 'photo_data', plural: 'photos', count: 'photo_num', MAX: 1000, fn: 'read_photos', fields: ['id', 'date', 'rating'], prompt: 'How many photos?' },
    { entity: 'song_data', plural: 'songs', count: 'song_num', MAX: 500, fn: 'read_songs', fields: ['title', 'artist', 'length'], prompt: 'How many songs?' },
    { entity: 'menu_data', plural: 'menus', count: 'menu_num', MAX: 80, fn: 'read_menus', fields: ['name', 'price', 'rating'], prompt: 'How many menus?' },
    { entity: 'recipe_data', plural: 'recipes', count: 'recipe_num', MAX: 100, fn: 'read_recipes', fields: ['name', 'cuisine', 'time'], prompt: 'How many recipes?' },
    { entity: 'document_data', plural: 'documents', count: 'doc_num', MAX: 200, fn: 'read_documents', fields: ['title', 'author', 'pages'], prompt: 'How many documents?' },
  ];
  speedNovels.forEach((e, i) => {
    const idx = String(i + 1).padStart(2, '0');
    emit(`S6-Speed/novel-timed-${idx}-${e.entity}.yml`, {
      ...common(
        `L4-S6-novel-timed-${idx}`,
        'Q-10',
        6,
        'L4',
        'SpeedDrillCard',
        `[novel timed ${i + 1}/10] 90s to write a full main() for ${e.entity}.`,
        { kind: 'v2', ref: 'C++T2 spec §6.6 S6 timed novel' },
        ['CM-Q4-time-pressure-wrong-arg'],
      ),
      prompt: `${e.entity}: MAX=${e.MAX}, count=${e.count}, fn=${e.fn}, fields=${e.fields.join(', ')}, prompt="${e.prompt}".`,
      canonicalAnswer: buildMain(e),
      keyChecks: [`const int MAX = ${e.MAX}`, `${e.entity} ${e.plural}[MAX]`, `int ${e.count}`, `${e.fn}(${e.plural}, ${e.count})`, `i < ${e.count}`, 'return 0'],
      flashSeconds: 5,
      targetSeconds: 90,
      explanation: '90s novel-entity transfer. Tests true fluency: not memorisation, transfer.',
    });
  });
  // 21-25. 5 end-to-end Q2+Q3+Q4 chain under 8 min (TestDaySimCard)
  const e2eCases = [
    V20, PRAC,
    { entity: 'book_data', plural: 'books', count: 'book_num', MAX: 200, fn: 'read_books', fields: ['title', 'author', 'pages'], types: ['string', 'string', 'int'], prompt: 'How many books?' },
    { entity: 'employee_data', plural: 'employees', count: 'emp_num', MAX: 500, fn: 'read_employees', fields: ['id', 'name', 'salary'], types: ['int', 'string', 'double'], prompt: 'How many employees?' },
    { entity: 'order_data', plural: 'orders', count: 'order_num', MAX: 1000, fn: 'read_orders', fields: ['id', 'customer', 'total'], types: ['int', 'string', 'double'], prompt: 'How many orders?' },
  ];
  e2eCases.forEach((c, i) => {
    const idx = String(i + 1).padStart(2, '0');
    const types = c.types || ['int', 'int', 'int'];
    const structFields = c.fields.map((f, j) => `    ${types[j]} ${f};`).join('\n');
    const struct = `struct ${c.entity}\n{\n${structFields}\n};`;
    const cinReads = c.fields.map((f) => `        cin >> ${c.plural}[i].${f};`).join('\n');
    const readFn = `void ${c.fn}(${c.entity} ${c.plural}[], int &count)\n{\n    cout << "How many ${c.plural}? ";\n    cin >> count;\n    for (int i = 0; i < count; i++)\n    {\n${cinReads}\n    }\n}`;
    const main = buildMain(c);
    const fullChain = `// Q2 — struct\n${struct}\n\n// Q3 — read fn\n${readFn}\n\n// Q4 — main\n${main}`;
    const q1Sample = `// Q1 hand-execute (out-of-scope here; Q1 in L1).`;
    emit(`S6-Speed/end2end-chain-${idx}.yml`, {
      ...common(
        `L4-S6-end2end-chain-${idx}`,
        'Q-10',
        6,
        'L4',
        'TestDaySimCard',
        `[end-to-end chain ${i + 1}/5] 8 minutes to write Q2 + Q3 + Q4 for ${c.entity}. Simulates the back half of Test 2 (Q2 + Q3 + Q4 = ~8 min budget).`,
        { kind: 'v2', ref: 'C++T2 spec §6.6 S6 end-to-end chain (8min)' },
        ['CM-Q4-time-pressure-skip-const', 'CM-Q4-time-pressure-no-return'],
      ),
      questionSet: [
        { questionNumber: 'Q1', prompt: 'Q1 hand-execute placeholder — see L1 for Q1 content.', canonicalAnswer: q1Sample },
        { questionNumber: 'Q2', prompt: `Write the ${c.entity} struct (3 fields).`, canonicalAnswer: struct },
        { questionNumber: 'Q3', prompt: `Write the ${c.fn} function.`, canonicalAnswer: readFn },
        { questionNumber: 'Q4', prompt: `Write the main() that calls ${c.fn} and prints all rows.`, canonicalAnswer: main },
      ],
      totalTimeMinutes: 8,
      explanation: 'Test-day chain simulator. Splitting Q2+Q3+Q4 over 8 min mirrors actual exam pacing minus Q1.',
    });
  });
}

// =====================================================================
// RUN
// =====================================================================
mkdirSync(CARDS_DIR, { recursive: true });
s1Tour();
s2Template();
s3Components();
s4Compose();
s5Variations();
s6Speed();

console.log(`Wrote ${written.length} card files under ${CARDS_DIR}`);
const stages = { S1: 0, S2: 0, S3: 0, S4: 0, S5: 0, S6: 0 };
for (const w of written) {
  const m = w.match(/S(\d)/);
  if (m) stages[`S${m[1]}`]++;
}
console.log('By stage:', stages);
