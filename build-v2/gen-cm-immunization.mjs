#!/usr/bin/env node
// =====================================================================
// cpp-t2 / build-v2 / gen-cm-immunization.mjs
// QA-M13 fix: Author 3 hand-authored immunization cards per undercov CM
// =====================================================================
//
// For each CM listed below, write a tailored:
//   1. FaultInjectionCard (SpotError) — broken code, find the bug
//   2. MCQCard (concept check) — pick the right rule
//   3. ClozeCard (fix-it) — fill the missing token
//
// Each card body is CM-specific (uses the CM's domain-real wording);
// not a generic stub. Cards land at:
//   data/v2/cards/L{1-4}/cm-immunization/<CM-id>/{spot,mcq,cloze}.yml
// =====================================================================

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';

const ROOT = resolve(import.meta.dirname, '..');

// Q-track -> Level mapping (per task spec)
const Q_TO_LEVEL = { Q1: 'L1', Q2: 'L2', Q3: 'L3', Q4: 'L4' };
// Atom-by-Q to use as anchor (must exist for each Level)
const Q_TO_ATOM = { Q1: 'A1', Q2: 'L-21', Q3: 'R-00', Q4: 'Q-00' };
const Q_TO_STAGE = { Q1: 4, Q2: 4, Q3: 4, Q4: 4 };

// Cards live in this dir
function cardPath(level, cmId, kind) {
  return resolve(ROOT, `data/v2/cards/${level}/cm-immunization/${cmId}/${kind}.yml`);
}

function ensureDir(filePath) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function writeYaml(filePath, content) {
  ensureDir(filePath);
  writeFileSync(filePath, content);
}

// ---------------------------------------------------------------------
// Per-CM authored content. For each CM:
//   q       — primary Q-track (use first one if multi)
//   spot    — { brokenCode, fixedCode, bugLocations, bugCategory, kc[], stem, explanation }
//   mcq     — { stem, correct, distractors[3], explanation }
//   cloze   — { code, clozeSentence, answer, explanation }
// ---------------------------------------------------------------------

const CMS = [
  // ---- CM-zero-instead-of-i (Q3, R-00) ----
  {
    id: 'CM-zero-instead-of-i',
    q: 'Q3',
    spot: {
      stem: 'This Q3 read function compiles, but every cell in `data.numbers` ends up as the LAST input. Find and fix the bug.',
      brokenCode: 'void read_data(stat_double &data)\n{\n  for (int i = 0; i < SIZE; i++) {\n    cin >> data.numbers[0];\n  }\n}\n',
      bugLocations: [3],
      fixedCode: 'void read_data(stat_double &data)\n{\n  for (int i = 0; i < SIZE; i++) {\n    cin >> data.numbers[i];\n  }\n}\n',
      bugCategory: 'wrong index — `[0]` instead of `[i]`',
      kc: ['data.numbers[i]'],
      explanation: 'Inside the loop the index MUST be `i`, not `0`. With `[0]` every iteration overwrites cell 0 and cells 1..N-1 stay garbage. Replace `[0]` with `[i]`.',
    },
    mcq: {
      stem: 'You are inside a `for (int i = 0; i < SIZE; i++)` loop reading values. What index must you use to write into successive cells of `data.numbers`?',
      correct: '`data.numbers[i]` — the loop variable',
      distractors: [
        '`data.numbers[0]` — always cell zero',
        '`data.numbers[SIZE]` — last cell',
        '`data.numbers[1]` — second cell',
      ],
      explanation: 'The loop variable `i` advances 0,1,2,...,SIZE-1. Using `[i]` distributes the inputs across all cells. `[0]` overwrites cell 0 N times.',
    },
    cloze: {
      code: 'void read_data(stat_double &data)\n{\n  for (int i = 0; i < SIZE; i++) {\n    cin >> data.numbers[___];\n  }\n}',
      clozeSentence: 'Fill in the index expression so that the loop reads N values into cells 0..SIZE-1.',
      answer: 'i',
      explanation: 'The loop variable `i` is the only valid index here — it advances each iteration and distributes inputs across the array.',
    },
  },

  // ---- CM-wrong-type (Q2) ----
  {
    id: 'CM-wrong-type',
    q: 'Q2',
    spot: {
      stem: 'This Q2 struct uses the wrong base type for its float-array field. Spot the bug and fix it.',
      brokenCode: 'struct stat_double {\n  int numbers[SIZE];\n  double mystery;\n};\n',
      bugLocations: [1],
      fixedCode: 'struct stat_double {\n  double numbers[SIZE];\n  double mystery;\n};\n',
      bugCategory: 'wrong type for array field',
      kc: ['double numbers[SIZE]'],
      explanation: 'The struct is `stat_double` and the rubric requires a double array. `int numbers[SIZE]` would silently truncate any decimal inputs. Use `double numbers[SIZE]`.',
    },
    mcq: {
      stem: 'In a `stat_double` struct that must hold real-valued inputs, what type must the `numbers` array use?',
      correct: '`double` — matches the struct name and decimal inputs',
      distractors: [
        '`int` — works because numbers are whole most of the time',
        '`float` — uses less memory than double',
        '`string` — keeps the digits exact',
      ],
      explanation: 'The struct name `stat_double` is a hint: every numeric field is `double`. `int` truncates fractional parts and fails the rubric on any non-integer input.',
    },
    cloze: {
      code: 'struct stat_double {\n  ___ numbers[SIZE];\n  double mystery;\n};',
      clozeSentence: 'Fill in the type name so the array can hold real-valued inputs.',
      answer: 'double',
      explanation: 'A `double` array stores real numbers. Anything else (int, float, char) either truncates or doesn\'t match the rubric.',
    },
  },

  // ---- CM-wrong-namespace (Q4) ----
  {
    id: 'CM-wrong-namespace',
    q: 'Q4',
    spot: {
      stem: 'This Q4 program will not compile because of one missing line at the top. Find and fix the bug.',
      brokenCode: '#include <iostream>\n\nint main() {\n  cout << "Hello";\n  return 0;\n}\n',
      bugLocations: [2],
      fixedCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Hello";\n  return 0;\n}\n',
      bugCategory: 'missing `using namespace std;`',
      kc: ['using namespace std'],
      explanation: 'Without `using namespace std;` you must write `std::cout`. Either use the namespace once at file scope, or prefix every cin/cout/endl with `std::`.',
    },
    mcq: {
      stem: 'You wrote `#include <iostream>` then `cout << x;` and got `cout was not declared`. What did you forget?',
      correct: 'You forgot `using namespace std;` (or `std::cout`).',
      distractors: [
        'You forgot `#include <stdio.h>`.',
        'You forgot to call `printf` instead.',
        'You forgot to declare `cout` as `int`.',
      ],
      explanation: '`cout` lives in namespace `std`. Either bring the namespace in with `using namespace std;` or qualify each call as `std::cout`.',
    },
    cloze: {
      code: '#include <iostream>\n___ namespace std;\n\nint main() {\n  cout << "Hi";\n  return 0;\n}',
      clozeSentence: 'Fill in the keyword that brings the std namespace into scope.',
      answer: 'using',
      explanation: '`using namespace std;` exposes cin, cout, endl without a `std::` prefix.',
    },
  },

  // ---- CM-wrong-bound-SIZE (Q3,Q4) ----
  {
    id: 'CM-wrong-bound-SIZE',
    q: 'Q3',
    spot: {
      stem: 'This Q3 read loop runs ONE extra iteration past the array. Find and fix the bug.',
      brokenCode: 'for (int i = 0; i <= SIZE; i++) {\n  cin >> data.numbers[i];\n}\n',
      bugLocations: [1],
      fixedCode: 'for (int i = 0; i < SIZE; i++) {\n  cin >> data.numbers[i];\n}\n',
      bugCategory: 'off-by-one — used `<= SIZE`',
      kc: ['i < SIZE'],
      explanation: 'Array indices run 0..SIZE-1. `i <= SIZE` writes into cell SIZE which doesn\'t exist. Use `i < SIZE` (strictly less than).',
    },
    mcq: {
      stem: 'For a `SIZE=5` array, what is the correct loop bound?',
      correct: '`for (int i = 0; i < SIZE; i++)` — strictly less than',
      distractors: [
        '`for (int i = 0; i <= SIZE; i++)` — inclusive of SIZE',
        '`for (int i = 1; i <= SIZE; i++)` — start at 1',
        '`for (int i = 0; i < SIZE - 1; i++)` — stop one early',
      ],
      explanation: 'Indices are 0..SIZE-1 (5 values). `<` (not `<=`) gives exactly SIZE iterations and never reaches the off-the-end index SIZE.',
    },
    cloze: {
      code: 'for (int i = 0; i ___ SIZE; i++) {\n  cin >> data.numbers[i];\n}',
      clozeSentence: 'Fill in the comparison so the loop runs exactly SIZE times (0..SIZE-1).',
      answer: '<',
      explanation: '`<` (strict) excludes SIZE itself; `<=` would walk one past the array.',
    },
  },

  // ---- CM-stale-mystery (Q1) ----
  {
    id: 'CM-stale-mystery',
    q: 'Q1',
    spot: {
      stem: 'This Q1 trace dropped the new mystery value. Find the iteration where the trace went wrong.',
      brokenCode: '// numbers = {2.4, 3.7, 1.0, 2.1, 0.5}; mystery init = 0.0\n// algo: mystery = mystery + numbers[i]\n//\n// i=0: 0.0 + 2.4 = 2.4   mystery = 2.4\n// i=1: 0.0 + 3.7 = 3.7   mystery = 3.7  // BUG\n// i=2: 3.7 + 1.0 = 4.7   mystery = 4.7\n// ...\n',
      bugLocations: [4],
      fixedCode: '// CORRECT trace: each iter uses the PREVIOUS mystery, not init\n// i=0: 0.0 + 2.4 = 2.4   mystery = 2.4\n// i=1: 2.4 + 3.7 = 6.1   mystery = 6.1\n// i=2: 6.1 + 1.0 = 7.1   mystery = 7.1\n',
      bugCategory: 'stale mystery — re-used 0.0 for i=1 instead of 2.4',
      kc: ['2.4 + 3.7'],
      explanation: 'After i=0 the mystery is 2.4. The next iteration must read THAT value, not the original 0.0. Each iteration uses the freshest mystery.',
    },
    mcq: {
      stem: 'In `mystery = mystery + numbers[i]`, the right-hand `mystery` refers to:',
      correct: 'The value of mystery from the PREVIOUS iteration (or pre-loop init for i=0).',
      distractors: [
        'Always the pre-loop initial value.',
        'The brace-init value from `{numbers..., mystery}`.',
        'Always 0.0 — that is what mystery starts at.',
      ],
      explanation: 'The accumulator pattern reads the latest mystery each iteration. Using a stale value flat-lines the running total.',
    },
    cloze: {
      code: '// algo: mystery = mystery + numbers[i]\n// numbers = {2.4, 3.7}; mystery init = 0.0\n//\n// i=0: 0.0 + 2.4 = 2.4   mystery = 2.4\n// i=1: ___ + 3.7 = 6.1   mystery = 6.1',
      clozeSentence: 'Fill in the value of mystery used at i=1 (the freshest one, not the init).',
      answer: '2.4',
      explanation: 'After i=0 mystery = 2.4. The next iter reads 2.4, not 0.0.',
    },
  },

  // ---- CM-skip-iter-cond-false (Q1) ----
  {
    id: 'CM-skip-iter-cond-false',
    q: 'Q1',
    spot: {
      stem: 'In this Q1 sum-positive trace, the student dropped the mystery row entirely on a `false` iteration. What did they get wrong?',
      brokenCode: '// algo: if (numbers[i] > 0) mystery = mystery + numbers[i];\n// numbers = {2.4, -3.7, 1.0}; mystery init = 0.0\n//\n// i=0:  2.4>0 true   0.0+2.4=2.4   mystery=2.4\n// i=1:  -3.7>0 false [no row]\n// i=2:  1.0>0 true   ?.?+1.0       mystery=?\n',
      bugLocations: [5],
      fixedCode: '// CORRECT: even when COND is false you MUST record the unchanged mystery\n// i=0:  2.4>0 true   0.0+2.4=2.4   mystery=2.4\n// i=1:  -3.7>0 false (skip body)   mystery=2.4 (unchanged)\n// i=2:  1.0>0 true   2.4+1.0=3.4   mystery=3.4\n',
      bugCategory: 'omitted false-branch row in trace',
      kc: ['mystery = 2.4'],
      explanation: 'When the if-condition is false the body skips, but the iteration still happens and mystery still has its previous value. Always record a row (even if mystery is unchanged) so the next iter reads the right value.',
    },
    mcq: {
      stem: 'During a Q1 trace, the if-condition on iteration i=2 is FALSE. What should you record?',
      correct: 'Same iteration row, with mystery unchanged from i=1.',
      distractors: [
        'Skip the row — there\'s no work to record.',
        'Set mystery back to the pre-loop init.',
        'Set mystery to numbers[i].',
      ],
      explanation: 'A false condition means the body is skipped, not the iteration. Mystery carries through unchanged. Recording the row stops you from losing the value.',
    },
    cloze: {
      code: '// numbers={2.4,-3.7,1.0}; mystery init=0.0\n// i=0: 2.4>0 -> mystery = 0.0+2.4 = 2.4\n// i=1: -3.7>0 false -> mystery = ___\n// i=2: 1.0>0 -> mystery = ___ + 1.0',
      clozeSentence: 'Fill in the unchanged mystery for the false iteration (both blanks have the same value).',
      answer: '2.4',
      explanation: 'When the body is skipped, mystery from the previous iteration (2.4) carries through. The next true iter reads that same value.',
    },
  },

  // ---- CM-semicolon-after-if (Q1) ----
  {
    id: 'CM-semicolon-after-if',
    q: 'Q1',
    spot: {
      stem: 'This Q1 if-statement always runs the body. Why? Find the stray punctuation.',
      brokenCode: 'if (numbers[i] > 0);\n  data.mystery = data.mystery + numbers[i];\n',
      bugLocations: [1],
      fixedCode: 'if (numbers[i] > 0)\n  data.mystery = data.mystery + numbers[i];\n',
      bugCategory: 'stray `;` after if-condition',
      kc: ['if (numbers[i] > 0)'],
      explanation: 'A semicolon after `if (...)` ends the if with an empty body. The line below runs unconditionally. Delete the `;` so the body is the next statement.',
    },
    mcq: {
      stem: 'What does `if (cond);` (with a stray semicolon) do?',
      correct: 'Evaluates cond, runs an EMPTY body, then runs the next line unconditionally.',
      distractors: [
        'Compile error: extra semicolon.',
        'Skips the next line if cond is true.',
        'Runs the next line only if cond is true.',
      ],
      explanation: '`if (cond);` is `if (cond) { /* nothing */ }`. The next line is no longer the body — it always runs.',
    },
    cloze: {
      code: '// CORRECT: no `;` after `if (...)`; the body line is the conditional body\nif (numbers[i] > 0)\n  mystery ___ mystery + numbers[i];',
      clozeSentence: 'Fill in the assignment operator (one character) so the body accumulates into mystery.',
      answer: '=',
      explanation: 'No semicolon after `if (...)`. The body is the next statement; assign with `=`. A stray `;` after the if would silently disable the conditional.',
    },
  },

  // ---- CM-scope-leak (Q1,Q3,Q4) ----
  {
    id: 'CM-scope-leak',
    q: 'Q1',
    spot: {
      stem: 'This trace incorrectly references `i` after the loop ended. Find the line that\'s wrong.',
      brokenCode: 'for (int i = 0; i < SIZE; i++) {\n  data.mystery = data.mystery + data.numbers[i];\n}\ncout << "stopped at " << i;\n',
      bugLocations: [4],
      fixedCode: 'int i;\nfor (i = 0; i < SIZE; i++) {\n  data.mystery = data.mystery + data.numbers[i];\n}\ncout << "stopped at " << i;\n',
      bugCategory: 'scope leak — `i` declared in for-init is dead after the loop',
      kc: ['int i;'],
      explanation: '`for (int i = ...)` makes `i` local to the loop. After the loop closes `i` is gone. Either declare `int i;` outside the loop, or move the cout inside.',
    },
    mcq: {
      stem: 'After `for (int i = 0; i < N; i++) { ... }`, can you `cout << i;` on the next line?',
      correct: 'No — `i` is scoped to the for-statement and is gone after the closing brace.',
      distractors: [
        'Yes — `i` always lives until the function returns.',
        'Yes, but only if N > 0.',
        'Only if you write `cout << ::i;`.',
      ],
      explanation: '`for (int i ...)` declares `i` with for-statement scope. To use `i` after the loop, declare it outside: `int i; for (i = 0; ...)`.',
    },
    cloze: {
      code: 'int ___ ;\nfor (i = 0; i < SIZE; i++) { ... }\ncout << i;',
      clozeSentence: 'Fill in the loop variable name in the outer declaration so it survives past the loop.',
      answer: 'i',
      explanation: 'Declaring `int i;` before the loop makes `i` available after the loop ends.',
    },
  },

  // ---- CM-reserved-word (Q2) ----
  {
    id: 'CM-reserved-word',
    q: 'Q2',
    spot: {
      stem: 'This Q2 struct field name will not compile. What\'s wrong?',
      brokenCode: 'struct point {\n  double class;\n  double y;\n};\n',
      bugLocations: [1],
      fixedCode: 'struct point {\n  double category;\n  double y;\n};\n',
      bugCategory: 'reserved word used as identifier',
      kc: ['category'],
      explanation: '`class` is a C++ keyword and can\'t be a field name. Pick a non-reserved name (e.g. `category`, `kind`).',
    },
    mcq: {
      stem: 'Which of these CANNOT be used as a struct field name in C++?',
      correct: '`class` — it is a reserved keyword',
      distractors: [
        '`category` — looks like a keyword but isn\'t',
        '`numbers` — already used by std lib',
        '`data1` — starts with a letter then digit',
      ],
      explanation: 'Reserved words (`class`, `int`, `for`, `return`, ...) cannot be identifiers. `category` and `data1` are fine.',
    },
    cloze: {
      code: 'struct point {\n  double ___ ;\n  double y;\n};',
      clozeSentence: 'Pick a NON-RESERVED field name (e.g. `category`).',
      answer: 'category',
      explanation: 'Any non-keyword identifier works. `class`, `for`, `int` etc. would fail.',
    },
  },

  // ---- CM-prompt-outside-loop (Q3) ----
  {
    id: 'CM-prompt-outside-loop',
    q: 'Q3',
    spot: {
      stem: 'This Q3 read function prompts the user only ONCE for N values. Spot the bug.',
      brokenCode: 'void read_data(stat_double &data)\n{\n  cout << "Enter value: ";\n  for (int i = 0; i < SIZE; i++) {\n    cin >> data.numbers[i];\n  }\n}\n',
      bugLocations: [3],
      fixedCode: 'void read_data(stat_double &data)\n{\n  for (int i = 0; i < SIZE; i++) {\n    cout << "Enter value: ";\n    cin >> data.numbers[i];\n  }\n}\n',
      bugCategory: 'prompt outside loop — only printed once',
      kc: ['for (int i = 0;'],
      explanation: 'The prompt belongs INSIDE the loop, before each cin. Moving the cout out shows the prompt once but reads SIZE values silently.',
    },
    mcq: {
      stem: 'You need to prompt the user before each of N reads. Where does the cout prompt go?',
      correct: 'Inside the loop body, BEFORE the cin.',
      distractors: [
        'Outside the loop, before it (only printed once).',
        'After the loop ends.',
        'Doesn\'t matter — cin auto-prompts.',
      ],
      explanation: 'The pair (cout-prompt, cin-read) repeats every iteration. Lifting cout out makes the user guess when to type the next value.',
    },
    cloze: {
      code: 'for (int i = 0; i < SIZE; i++) {\n  ___ << "Enter value: ";\n  cin >> data.numbers[i];\n}',
      clozeSentence: 'Fill in the stream object that prints the prompt each iteration.',
      answer: 'cout',
      explanation: '`cout << "Enter value: ";` prints the per-iteration prompt to stdout.',
    },
  },

  // ---- CM-only-final-no-trail (Q1) ----
  {
    id: 'CM-only-final-no-trail',
    q: 'Q1',
    spot: {
      stem: 'This Q1 trace shows only the final mystery value, not the iteration history. What does the rubric require?',
      brokenCode: '// numbers = {2.4, 3.7, 1.0, 2.1, 0.5}; mystery init = 0.0\n// algo: mystery = mystery + numbers[i]\n//\n// final answer: mystery = 9.7\n',
      bugLocations: [4],
      fixedCode: '// numbers = {2.4, 3.7, 1.0, 2.1, 0.5}; mystery init = 0.0\n// algo: mystery = mystery + numbers[i]\n//\n// i=0: 0.0 + 2.4 = 2.4    mystery = 2.4\n// i=1: 2.4 + 3.7 = 6.1    mystery = 6.1\n// i=2: 6.1 + 1.0 = 7.1    mystery = 7.1\n// i=3: 7.1 + 2.1 = 9.2    mystery = 9.2\n// i=4: 9.2 + 0.5 = 9.7    mystery = 9.7\n',
      bugCategory: 'no per-iteration trail — final-value only',
      kc: ['i=0', 'i=4'],
      explanation: 'The Q1 rubric awards working as well as the answer. Show every iteration: i, RHS arithmetic, new mystery. Final-value-only is partial credit at best.',
    },
    mcq: {
      stem: 'In a Q1 trace, what must you record on the page?',
      correct: 'A row per iteration with the arithmetic and the new mystery.',
      distractors: [
        'Just the final mystery value — that\'s what is asked.',
        'Only the iterations where the condition is true.',
        'A diagram with arrows from numbers to mystery.',
      ],
      explanation: 'Working = marks. The marker can\'t award full credit for an answer with no shown steps; one rounding error then spirals invisibly.',
    },
    cloze: {
      code: '// algo: mystery = mystery + numbers[i]; mystery init=0.0; numbers={2.4,3.7}\n// i=0: 0.0 + 2.4 = ___    mystery = 2.4\n// i=1: 2.4 + 3.7 = 6.1    mystery = 6.1',
      clozeSentence: 'Fill in the arithmetic result for iteration 0.',
      answer: '2.4',
      explanation: '0.0 + 2.4 = 2.4. Recording it makes the trail auditable.',
    },
  },

  // ---- CM-omit-mystery-cell (Q1) ----
  {
    id: 'CM-omit-mystery-cell',
    q: 'Q1',
    spot: {
      stem: 'This Q1 brace-init forgot the mystery field. What goes wrong at compile/run?',
      brokenCode: 'struct stat_double {\n  double numbers[5];\n  double mystery;\n};\nstat_double data = {{2.4, 3.7, 1.0, 2.1, 0.5}};\n',
      bugLocations: [4],
      fixedCode: 'stat_double data = {{2.4, 3.7, 1.0, 2.1, 0.5}, -0.9};\n',
      bugCategory: 'missing mystery brace-init value',
      kc: ['-0.9'],
      explanation: 'Brace-init must list every field in order. Omitting mystery gives it `0.0` (default-init for double); the question expected -0.9 from the question paper. Always include every field.',
    },
    mcq: {
      stem: 'A struct has `double numbers[5]; double mystery;`. Which brace-init is correct?',
      correct: '`{{2.4,3.7,1.0,2.1,0.5}, -0.9}` — both fields supplied',
      distractors: [
        '`{{2.4,3.7,1.0,2.1,0.5}}` — mystery omitted',
        '`{2.4,3.7,1.0,2.1,0.5,-0.9}` — flat list',
        '`{numbers={2.4,3.7,1.0,2.1,0.5}, mystery=-0.9}` — designated',
      ],
      explanation: 'The struct has TWO fields (an array, a scalar). Both go in braces, in order, scalar last.',
    },
    cloze: {
      code: 'stat_double data = {{2.4, 3.7, 1.0, 2.1, 0.5}, ___};',
      clozeSentence: 'Fill in the missing mystery brace-init value (assume the question paper says -0.9).',
      answer: '-0.9',
      explanation: 'Brace-init lists every field. Mystery comes after the inner braces.',
    },
  },

  // ---- CM-off-by-one-le (Q3) ----
  {
    id: 'CM-off-by-one-le',
    q: 'Q3',
    spot: {
      stem: 'This Q3 read loop reads SIZE+1 values (one too many). Find and fix the bug.',
      brokenCode: 'for (int i = 0; i <= SIZE; i++) {\n  cin >> data.numbers[i];\n}\n',
      bugLocations: [1],
      fixedCode: 'for (int i = 0; i < SIZE; i++) {\n  cin >> data.numbers[i];\n}\n',
      bugCategory: 'off-by-one — `<=` instead of `<`',
      kc: ['i < SIZE'],
      explanation: '`i <= SIZE` runs once for i=SIZE, which writes outside the array. Use `<` so the last iteration is i=SIZE-1.',
    },
    mcq: {
      stem: 'You want exactly SIZE iterations of a 0-indexed loop. Which bound?',
      correct: '`i < SIZE` — strict less-than',
      distractors: [
        '`i <= SIZE` — inclusive',
        '`i < SIZE - 1` — stops one early',
        '`i != SIZE + 1` — explicit',
      ],
      explanation: '0..SIZE-1 is SIZE values. `<` gives that. `<=` gives SIZE+1 values (including a no-such-cell at index SIZE).',
    },
    cloze: {
      code: 'for (int i = 0; i ___ SIZE; i++) {\n  cin >> data.numbers[i];\n}',
      clozeSentence: 'Fill in the comparison so the loop runs exactly SIZE times.',
      answer: '<',
      explanation: 'Strict `<` matches indices 0..SIZE-1.',
    },
  },

  // ---- CM-off-by-one-exit (Q1,Q3) ----
  {
    id: 'CM-off-by-one-exit',
    q: 'Q1',
    spot: {
      stem: 'A Q1 trace claims the loop ran 6 times when SIZE=5. Spot the off-by-one in the trace.',
      brokenCode: '// SIZE = 5\n// i=0..4 run, then trace adds:\n// i=5: 9.7 + 0.0 = 9.7   mystery = 9.7\n',
      bugLocations: [3],
      fixedCode: '// SIZE = 5\n// i=0..4 run; loop EXITS after i=4 because i++ -> 5 fails `i<5`.\n// No iteration at i=5.\n',
      bugCategory: 'off-by-one — extra exit iteration',
      kc: ['i=4'],
      explanation: 'After i=4 the post-stmt `i++` makes i=5; the condition `i<5` fails so the body never runs at i=5. Final iter is i=4.',
    },
    mcq: {
      stem: 'For `for (int i = 0; i < 5; i++)`, what is the LAST value of i for which the body runs?',
      correct: '4',
      distractors: ['5', '6', '0'],
      explanation: 'Body runs for i=0..4 (5 iterations). i=5 fails the condition.',
    },
    cloze: {
      code: '// for (int i = 0; i < 5; i++) {...}\n// final body iteration is at i = ___',
      clozeSentence: 'Fill in the last value of i for which the body runs.',
      answer: '4',
      explanation: 'Body runs at i=0,1,2,3,4. At i=5 the loop exits.',
    },
  },

  // ---- CM-no-strikethrough (Q1) ----
  {
    id: 'CM-no-strikethrough',
    q: 'Q1',
    spot: {
      stem: 'This Q1 trace overwrote mystery without showing the old value. The marker can\'t see the work. Fix the notation.',
      brokenCode: '// mystery = 2.4\n// i=1: mystery = 6.1\n// i=2: mystery = 7.1\n',
      bugLocations: [1],
      fixedCode: '// mystery: ~2.4~ 6.1\n// i=2: ~6.1~ 7.1\n',
      bugCategory: 'no strikethrough — old values invisible',
      kc: ['~2.4~'],
      explanation: 'When mystery changes, write the new value next to the old one with the old struck through. The trail makes the work auditable.',
    },
    mcq: {
      stem: 'Best Q1 hand-execution practice when mystery updates each iteration:',
      correct: 'Write new value next to old; strike old through.',
      distractors: [
        'Erase the old value cleanly.',
        'Track only the latest value.',
        'Use a separate sheet per iteration.',
      ],
      explanation: 'The strikethrough trail lets the marker see every step; if you erase, partial credit disappears.',
    },
    cloze: {
      code: '// mystery: ___2.4___ 6.1   (use the strikethrough convention)',
      clozeSentence: 'Fill in the bracket pair that signals strikethrough (use the project convention `~...~`).',
      answer: '~',
      explanation: 'The convention is `~old~ new` — tilde brackets indicate strikethrough.',
    },
  },

  // ---- CM-mutate-array (Q1) ----
  {
    id: 'CM-mutate-array',
    q: 'Q1',
    spot: {
      stem: 'This Q1 trace MUTATED the input array. The student wrote new values into `numbers`. Why is that wrong?',
      brokenCode: '// numbers = {2.4,3.7,1.0,2.1,0.5}\n// i=0: numbers[0] = 2.4 + 3.7 = 6.1   // wrote into numbers\n// i=1: numbers[1] = 6.1 + 1.0 = 7.1\n',
      bugLocations: [2],
      fixedCode: '// numbers (unchanged) = {2.4,3.7,1.0,2.1,0.5}\n// i=0: mystery = 0.0 + numbers[0] = 0.0 + 2.4 = 2.4\n// i=1: mystery = 2.4 + numbers[1] = 2.4 + 3.7 = 6.1\n',
      bugCategory: 'mutated input array instead of accumulator',
      kc: ['mystery'],
      explanation: 'The accumulator is `mystery`, not `numbers[i]`. The array is read-only input. Don\'t overwrite cells — write into mystery.',
    },
    mcq: {
      stem: 'In `mystery = mystery + numbers[i]`, which variable changes each iteration?',
      correct: '`mystery` — the running accumulator',
      distractors: [
        '`numbers[i]` — gets overwritten with the partial sum',
        '`i` — gets the latest sum',
        'None — both are inputs',
      ],
      explanation: 'Only `mystery` is updated. `numbers` is read-only input.',
    },
    cloze: {
      code: '// algo: ___ = ___ + numbers[i]    // RHS reads numbers[i] only',
      clozeSentence: 'Fill in the accumulator name (used twice — assigned on the left, read on the right).',
      answer: 'mystery',
      explanation: 'Both blanks are `mystery`. The array stays read-only.',
    },
  },

  // ---- CM-missing-semi-field (Q2) ----
  {
    id: 'CM-missing-semi-field',
    q: 'Q2',
    spot: {
      stem: 'This Q2 struct definition has a syntax error. Find the missing punctuation.',
      brokenCode: 'struct stat_double {\n  double numbers[SIZE]\n  double mystery;\n};\n',
      bugLocations: [2],
      fixedCode: 'struct stat_double {\n  double numbers[SIZE];\n  double mystery;\n};\n',
      bugCategory: 'missing `;` after struct field',
      kc: ['double numbers[SIZE];'],
      explanation: 'Each field declaration in a struct ends with `;`. Missing one makes the next field run on into a parse error.',
    },
    mcq: {
      stem: 'In a C++ struct, what character ends each field declaration?',
      correct: '`;` — semicolon',
      distractors: ['`,` — comma', '`.` — full stop', 'nothing — newline is enough'],
      explanation: 'Every declaration ends with `;`. Newlines are whitespace; commas separate items in declarators not statements.',
    },
    cloze: {
      code: 'struct stat_double {\n  double numbers[SIZE]___\n  double mystery;\n};',
      clozeSentence: 'Fill in the punctuation that ends the first field declaration.',
      answer: ';',
      explanation: 'Each field needs a closing `;`.',
    },
  },

  // ---- CM-missing-return-0 (Q4) ----
  {
    id: 'CM-missing-return-0',
    q: 'Q4',
    spot: {
      stem: 'This Q4 main function compiles but the rubric docks marks. What\'s missing?',
      brokenCode: 'int main() {\n  cout << "Hi";\n}\n',
      bugLocations: [3],
      fixedCode: 'int main() {\n  cout << "Hi";\n  return 0;\n}\n',
      bugCategory: 'missing `return 0;` in main',
      kc: ['return 0;'],
      explanation: 'C++ allows omitting return in main, but the SIT102 rubric requires `return 0;` explicitly. Always include it.',
    },
    mcq: {
      stem: 'What statement should the last line of `int main()` be?',
      correct: '`return 0;` — signals success',
      distractors: ['`exit;` — terminates the program', '`break;` — exits the loop', '`stop 0;` — not valid C++'],
      explanation: '`return 0;` returns control to the OS with success status. Always include it in Q4.',
    },
    cloze: {
      code: 'int main() {\n  cout << "Hi";\n  ___ 0;\n}',
      clozeSentence: 'Fill in the keyword that returns from main with success.',
      answer: 'return',
      explanation: '`return 0;` is the canonical close of main.',
    },
  },

  // ---- CM-missing-include (Q4) ----
  {
    id: 'CM-missing-include',
    q: 'Q4',
    spot: {
      stem: 'This Q4 program doesn\'t compile because a header is missing. Find what to add at the top.',
      brokenCode: 'using namespace std;\n\nint main() {\n  cout << "Hi";\n  return 0;\n}\n',
      bugLocations: [1],
      fixedCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Hi";\n  return 0;\n}\n',
      bugCategory: 'missing `#include <iostream>`',
      kc: ['#include <iostream>'],
      explanation: 'cin / cout / endl all live in <iostream>. Without that include the compiler doesn\'t know what `cout` is.',
    },
    mcq: {
      stem: 'Which header gives you `cin`, `cout`, and `endl`?',
      correct: '`<iostream>`',
      distractors: ['`<stdio.h>`', '`<string>`', '`<cstdlib>`'],
      explanation: '<iostream> declares cin/cout/endl. <string> is for `string`. <stdio.h> is C I/O.',
    },
    cloze: {
      code: '#include <___>\nusing namespace std;\nint main() { cout << "Hi"; return 0; }',
      clozeSentence: 'Fill in the header name that provides `cout`.',
      answer: 'iostream',
      explanation: '`<iostream>` is the C++ I/O stream header.',
    },
  },

  // ---- CM-missing-dot-field (Q3) ----
  {
    id: 'CM-missing-dot-field',
    q: 'Q3',
    spot: {
      stem: 'This Q3 read function fails to compile because a struct field access is malformed. Spot the bug.',
      brokenCode: 'void read_data(stat_double &data) {\n  for (int i = 0; i < SIZE; i++) {\n    cin >> data numbers[i];\n  }\n}\n',
      bugLocations: [3],
      fixedCode: 'void read_data(stat_double &data) {\n  for (int i = 0; i < SIZE; i++) {\n    cin >> data.numbers[i];\n  }\n}\n',
      bugCategory: 'missing `.` between struct and field',
      kc: ['data.numbers[i]'],
      explanation: 'Field access uses `.` (or `->` for pointers). `data numbers[i]` is two tokens with nothing between them.',
    },
    mcq: {
      stem: 'How do you access a field of a struct value (not a pointer)?',
      correct: '`structVar.fieldName` — dot operator',
      distractors: ['`structVar->fieldName` — arrow operator', '`structVar fieldName` — space-separated', '`structVar::fieldName` — scope'],
      explanation: '`.` for value, `->` for pointer, `::` for namespace/class scope.',
    },
    cloze: {
      code: 'cin >> data___numbers[i];',
      clozeSentence: 'Fill in the operator that connects struct value `data` to field `numbers`.',
      answer: '.',
      explanation: 'The dot operator accesses fields of struct values.',
    },
  },

  // ---- CM-missing-bracket-sig (Q3) ----
  {
    id: 'CM-missing-bracket-sig',
    q: 'Q3',
    spot: {
      stem: 'This Q3 function signature is missing parentheses. Spot the bug.',
      brokenCode: 'void read_data stat_double &data\n{\n  for (int i = 0; i < SIZE; i++) cin >> data.numbers[i];\n}\n',
      bugLocations: [1],
      fixedCode: 'void read_data(stat_double &data)\n{\n  for (int i = 0; i < SIZE; i++) cin >> data.numbers[i];\n}\n',
      bugCategory: 'missing `()` around parameter list',
      kc: ['(stat_double &data)'],
      explanation: 'Function signatures wrap their parameter list in parens: `name(params)`. Without parens it isn\'t a function declaration at all.',
    },
    mcq: {
      stem: 'What surrounds the parameter list of a C++ function signature?',
      correct: 'Parentheses `( ... )`',
      distractors: ['Braces `{ ... }`', 'Square brackets `[ ... ]`', 'Angle brackets `< ... >`'],
      explanation: 'Parens wrap params. Braces wrap the body, square brackets are for arrays/lambdas, angle for templates.',
    },
    cloze: {
      code: 'void read_data___stat_double &data___\n{\n  ...\n}',
      clozeSentence: 'Fill in the punctuation pair that wraps the parameter list (open / close).',
      answer: '(',
      explanation: 'Open with `(` close with `)`. Both parens wrap the params.',
    },
  },

  // ---- CM-misparse-brace (Q1) ----
  {
    id: 'CM-misparse-brace',
    q: 'Q1',
    spot: {
      stem: 'This Q1 trace mis-parsed the brace-init. The student treated the comma after the inner array as part of numbers. Find the line that\'s wrong.',
      brokenCode: 'stat_double d = {{2.4,3.7,1.0,2.1,0.5}, -0.9};\n// student trace\n// numbers = {2.4, 3.7, 1.0, 2.1, 0.5, -0.9}   // BUG\n// mystery = 0.0\n',
      bugLocations: [3],
      fixedCode: '// CORRECT parse:\n// numbers = {2.4, 3.7, 1.0, 2.1, 0.5}   // 5 elements only\n// mystery = -0.9                          // scalar after the inner braces\n',
      bugCategory: 'mis-parsed brace-init — included scalar in the array',
      kc: ['mystery = -0.9'],
      explanation: 'The OUTER brace `{ ... }` holds two items: the inner-brace array `{2.4,...,0.5}` and the scalar `-0.9`. They are separate fields, not one big list.',
    },
    mcq: {
      stem: 'Given `stat_double d = {{2.4,3.7,1.0,2.1,0.5}, -0.9};`, which fields get which values?',
      correct: '`numbers={2.4,3.7,1.0,2.1,0.5}; mystery=-0.9`',
      distractors: [
        '`numbers={2.4,3.7,1.0,2.1,0.5,-0.9}; mystery=0.0`',
        '`numbers={2.4}; mystery=3.7`',
        '`numbers={};` — empty by default',
      ],
      explanation: 'Outer braces enumerate the struct fields in order. Inner braces enumerate the array. The `-0.9` after the inner braces is the scalar `mystery`.',
    },
    cloze: {
      code: 'stat_double d = {{2.4,3.7,1.0,2.1,0.5}, -0.9};\n// d.numbers has ___ elements',
      clozeSentence: 'Fill in the count of elements in `d.numbers`.',
      answer: '5',
      explanation: 'Inner braces hold the 5 array elements; the scalar after is mystery.',
    },
  },

  // ---- CM-misorder-loop-sem (Q1) ----
  {
    id: 'CM-misorder-loop-sem',
    q: 'Q1',
    spot: {
      stem: 'This Q1 trace ran the post-statement BEFORE the body. Spot the iteration where the order went wrong.',
      brokenCode: '// for (int i = 0; i < 3; i++) { mystery = mystery + numbers[i]; }\n// student trace:\n// i=0 -> i++ first: i=1 -> body: mystery += numbers[1]   // BUG\n',
      bugLocations: [3],
      fixedCode: '// CORRECT order: init -> condition -> BODY -> post-stmt -> condition -> ...\n// i=0: cond OK -> body uses numbers[0] -> post: i=1 -> cond OK -> body uses numbers[1] -> ...\n',
      bugCategory: 'misordered loop semantics — i++ before body',
      kc: ['numbers[0]'],
      explanation: 'For-loop order: init, then (condition, body, post-stmt) repeatedly. The body executes BEFORE i++ each iteration.',
    },
    mcq: {
      stem: 'In `for (init; cond; post) { body; }`, what runs first on iteration 0?',
      correct: 'init, then cond-check, then BODY, then post.',
      distractors: ['init, then post, then cond-check, then body.', 'init, then cond, then post, then body.', 'body, then cond, then post.'],
      explanation: 'Init once, then loop: cond -> body -> post. Body runs BEFORE post each iteration.',
    },
    cloze: {
      code: '// for (int i=0; i<3; i++) { body; }\n// at i=0 the body uses numbers[___]',
      clozeSentence: 'Fill in the index used by the body during iteration 0.',
      answer: '0',
      explanation: 'Body runs at i=0 first; post-stmt happens after.',
    },
  },

  // ---- CM-int-vs-double (Q1) ----
  {
    id: 'CM-int-vs-double',
    q: 'Q1',
    spot: {
      stem: 'This Q1 trace truncated 2.4 to 2 because the student treated mystery as int. What was wrong?',
      brokenCode: '// algo: mystery = mystery + numbers[i]\n// numbers (double) = {2.4, 3.7}; mystery (DOUBLE) init = 0.0\n//\n// i=0: 0 + 2 = 2     mystery = 2     // BUG: truncated to int\n',
      bugLocations: [4],
      fixedCode: '// i=0: 0.0 + 2.4 = 2.4     mystery = 2.4   // keep doubles as doubles\n// i=1: 2.4 + 3.7 = 6.1     mystery = 6.1\n',
      bugCategory: 'int vs double — truncated decimals',
      kc: ['2.4'],
      explanation: 'Mystery is `double`. Use the full decimal (2.4, 3.7, ...). Truncating to int drops fractions and ruins the trace.',
    },
    mcq: {
      stem: 'In a `stat_double` struct, what numeric type are `numbers[i]` and `mystery`?',
      correct: '`double` — keep decimals',
      distractors: ['`int` — drop decimals', '`float` — short doubles', '`bool` — true/false'],
      explanation: 'The struct name says `double`. Don\'t truncate.',
    },
    cloze: {
      code: '// 0.0 + 2.4 = ___    mystery (double) = 2.4',
      clozeSentence: 'Fill in the decimal arithmetic result (2 dp).',
      answer: '2.4',
      explanation: '0.0 + 2.4 = 2.4. Keep the decimal.',
    },
  },

  // ---- CM-i++-before-body (Q1) ----
  {
    id: 'CM-iplusplus-before-body',
    q: 'Q1',
    spot: {
      stem: 'This Q1 trace incremented i before running the body of iteration 0. Spot the wrong row.',
      brokenCode: '// for (int i = 0; i < 3; i++) { mystery = mystery + numbers[i]; }\n// student row 1: i becomes 1 BEFORE body runs, so body uses numbers[1]\n',
      bugLocations: [2],
      fixedCode: '// CORRECT: body runs FIRST at i=0 with numbers[0], then post-stmt makes i=1.\n// row 1: body uses numbers[0]; post-stmt -> i=1.\n',
      bugCategory: 'i++ before body — misordered for-loop semantics',
      kc: ['numbers[0]'],
      explanation: 'In every iteration the body runs BEFORE the post-statement. Body at i=0 uses `numbers[0]`.',
    },
    mcq: {
      stem: 'Per iteration of `for (int i = 0; i < N; i++)`, what is the order of operations?',
      correct: 'cond-check, body, then i++.',
      distractors: ['i++, cond-check, body.', 'body, i++, cond-check.', 'cond-check, i++, body.'],
      explanation: 'Standard for-loop: condition, body, post-statement, repeat.',
    },
    cloze: {
      code: '// at the START of iteration 0 (after init), i = ___\n// body uses numbers[i] = numbers[___]',
      clozeSentence: 'Fill in the value of i used by the body in iteration 0 (both blanks the same).',
      answer: '0',
      explanation: 'Init sets i=0; body runs with i=0; post-stmt makes i=1 only AFTER the body.',
    },
  },

  // ---- CM-hyphen-id (Q2) ----
  {
    id: 'CM-hyphen-id',
    q: 'Q2',
    spot: {
      stem: 'This Q2 struct field has a hyphen in its name. Why won\'t it compile?',
      brokenCode: 'struct stat_double {\n  double max-value;\n  double mystery;\n};\n',
      bugLocations: [1],
      fixedCode: 'struct stat_double {\n  double max_value;\n  double mystery;\n};\n',
      bugCategory: 'hyphen in identifier (not allowed)',
      kc: ['max_value'],
      explanation: 'C++ identifiers may use letters, digits, and `_`. Hyphen `-` is the subtraction operator, not a name char. Use `_` instead.',
    },
    mcq: {
      stem: 'Which character separator is legal inside a C++ identifier?',
      correct: '`_` — underscore',
      distractors: ['`-` — hyphen', '`.` — period', '` ` — space'],
      explanation: 'Identifiers: letters, digits, underscore. `-`, `.`, space are not allowed.',
    },
    cloze: {
      code: 'double max___value;   // legal struct field',
      clozeSentence: 'Fill in the legal separator character (one char).',
      answer: '_',
      explanation: '`max_value` uses underscore. `max-value` would be subtraction.',
    },
  },

  // ---- CM-fn-call-extra-amp (Q4) ----
  {
    id: 'CM-fn-call-extra-amp',
    q: 'Q4',
    spot: {
      stem: 'This Q4 main function call has an extra `&` at the call site. Find and fix it.',
      brokenCode: 'int main() {\n  stat_double d;\n  read_data(&d);   // BUG: extra &\n  return 0;\n}\n',
      bugLocations: [3],
      fixedCode: 'int main() {\n  stat_double d;\n  read_data(d);    // pass `d`; the `&` is on the parameter, not the argument\n  return 0;\n}\n',
      bugCategory: 'extra `&` at call site',
      kc: ['read_data(d)'],
      explanation: 'Pass-by-reference puts `&` on the PARAMETER (in the signature). At the call site you pass the variable as-is. `&d` would be the address-of operator (a pointer).',
    },
    mcq: {
      stem: 'A function is `void f(int &x);`. How do you call it with variable `n`?',
      correct: '`f(n);`',
      distractors: ['`f(&n);`', '`f(*n);`', '`&f(n);`'],
      explanation: 'Pass `n` directly. `&` is on the parameter declaration only.',
    },
    cloze: {
      code: 'void f(int &x);\nint n = 5;\nf(___);   // pass n by reference',
      clozeSentence: 'Fill in the argument expression (just the variable).',
      answer: 'n',
      explanation: 'Pass `n` (no `&` at the call site).',
    },
  },

  // ---- CM-drop-postloop (Q1) ----
  {
    id: 'CM-drop-postloop',
    q: 'Q1',
    spot: {
      stem: 'This Q1 trace stops at the loop end without doing the post-loop division. Find what\'s missing.',
      brokenCode: '// algo: average = mystery / SIZE  (this happens AFTER the loop)\n// student trace ends at: mystery = 9.7\n// final answer: 9.7   // BUG: forgot to divide\n',
      bugLocations: [3],
      fixedCode: '// after the loop: average = mystery / SIZE = 9.7 / 5 = 1.94\n// final answer: 1.94\n',
      bugCategory: 'dropped post-loop step',
      kc: ['9.7 / 5'],
      explanation: 'Some Q1 algorithms have work AFTER the loop (e.g. average = sum / N). Reading the function body to the closing brace is essential — don\'t stop at the loop.',
    },
    mcq: {
      stem: 'When tracing a Q1 function, where do you stop?',
      correct: 'At the closing `}` of the function — INCLUDING any post-loop statements.',
      distractors: ['At the closing `}` of the for-loop.', 'After the first iteration.', 'At the first `return`.'],
      explanation: 'Trace every statement inside the function body, post-loop arithmetic included.',
    },
    cloze: {
      code: '// after the loop: average = mystery / SIZE = 9.7 / 5 = ___',
      clozeSentence: 'Fill in the post-loop division result (2 dp).',
      answer: '1.94',
      explanation: '9.7 / 5 = 1.94. Don\'t skip post-loop steps.',
    },
  },

  // ---- CM-confuse-i-with-numbers (Q1) ----
  {
    id: 'CM-confuse-i-with-numbers',
    q: 'Q1',
    spot: {
      stem: 'This Q1 trace mixed up the loop counter `i` with the value `numbers[i]`. Spot the bug.',
      brokenCode: '// numbers = {2.4, 3.7, 1.0, 2.1, 0.5}; mystery init = 0.0\n// algo: mystery = mystery + numbers[i]\n// i=0: 0.0 + 0 = 0.0   mystery = 0.0   // BUG: used i, not numbers[i]\n',
      bugLocations: [3],
      fixedCode: '// i=0: 0.0 + 2.4 = 2.4   mystery = 2.4   // use numbers[i] = 2.4, not i = 0\n',
      bugCategory: 'confused `i` with `numbers[i]`',
      kc: ['numbers[i]'],
      explanation: '`i` is the index (0,1,2,...). `numbers[i]` is the VALUE at that index. The accumulator adds `numbers[i]` (the value), not `i` (the index).',
    },
    mcq: {
      stem: 'In `mystery = mystery + numbers[i]`, what value is added to mystery on iter 0?',
      correct: '`numbers[0]` (the first array value)',
      distractors: ['`0` (the value of `i`)', '`SIZE` (the array length)', '`mystery` (the accumulator itself)'],
      explanation: 'Add the array VALUE, not the index. `numbers[0]` is the first element\'s data.',
    },
    cloze: {
      code: '// i=0: mystery = 0.0 + ___ = 2.4    (numbers[0] = 2.4)',
      clozeSentence: 'Fill in the array value at index 0.',
      answer: '2.4',
      explanation: '`numbers[0]` is `2.4`, not `0`.',
    },
  },

  // ---- CM-confuse-=-+= (Q1) ----
  {
    id: 'CM-confuse-eq-pluseq',
    q: 'Q1',
    spot: {
      stem: 'This Q1 trace replaced mystery instead of accumulating it. Spot the bug.',
      brokenCode: '// algo: mystery = mystery + numbers[i]\n// numbers = {2.4, 3.7}; init = 0.0\n//\n// i=0: mystery = 2.4    // wrote 2.4 directly (lost +)\n// i=1: mystery = 3.7    // overwrote 2.4 (lost the running sum)\n',
      bugLocations: [4],
      fixedCode: '// i=0: 0.0 + 2.4 = 2.4    mystery = 2.4   // accumulator: keep prev + new\n// i=1: 2.4 + 3.7 = 6.1    mystery = 6.1\n',
      bugCategory: 'misread `=` as plain assign (dropped the +)',
      kc: ['mystery + numbers[i]'],
      explanation: '`mystery = mystery + X` accumulates. The `mystery` on the RHS is the previous value. Without it, you just overwrite each iter and lose the running sum.',
    },
    mcq: {
      stem: 'What does `x = x + y;` do?',
      correct: 'Reads x and y, adds them, stores result back into x (accumulate).',
      distractors: ['Stores y into x (overwrite).', 'Increments x by 1.', 'Tests if x equals x+y.'],
      explanation: '`x = x + y` is the accumulator pattern: read x and y, sum, write to x.',
    },
    cloze: {
      code: '// at i=1, prev mystery = 2.4, numbers[1] = 3.7\n// new mystery = 2.4 + 3.7 = ___',
      clozeSentence: 'Fill in the accumulated sum (1 dp).',
      answer: '6.1',
      explanation: '2.4 + 3.7 = 6.1. Don\'t drop the previous mystery.',
    },
  },

  // ---- CM-cap-struct-keyword (Q2) ----
  {
    id: 'CM-cap-struct-keyword',
    q: 'Q2',
    spot: {
      stem: 'This Q2 struct keyword is capitalised. Why won\'t it compile?',
      brokenCode: 'Struct stat_double {\n  double numbers[SIZE];\n  double mystery;\n};\n',
      bugLocations: [1],
      fixedCode: 'struct stat_double {\n  double numbers[SIZE];\n  double mystery;\n};\n',
      bugCategory: 'wrong-case keyword (`Struct` not `struct`)',
      kc: ['struct stat_double'],
      explanation: 'C++ keywords are lowercase. `Struct` (capital S) isn\'t a keyword — the compiler sees an undefined identifier.',
    },
    mcq: {
      stem: 'How do you spell the struct-declaration keyword in C++?',
      correct: '`struct` — all lowercase',
      distractors: ['`Struct` — capital S', '`STRUCT` — all caps', '`structure` — full word'],
      explanation: 'C++ is case-sensitive; keywords are lowercase. `struct`, `class`, `int`, `for`.',
    },
    cloze: {
      code: '___ stat_double {\n  double numbers[SIZE];\n  double mystery;\n};',
      clozeSentence: 'Fill in the keyword that begins the declaration (lowercase).',
      answer: 'struct',
      explanation: '`struct` is the keyword. `Struct` and `STRUCT` are not keywords.',
    },
  },

  // ---- CM-calling-fn-before-def (Q4) ----
  {
    id: 'CM-calling-fn-before-def',
    q: 'Q4',
    spot: {
      stem: 'This Q4 main calls `read_data` before `read_data` is defined. The compiler complains. Find the missing piece.',
      brokenCode: 'int main() {\n  stat_double d;\n  read_data(d);\n  return 0;\n}\n\nvoid read_data(stat_double &data) { ... }\n',
      bugLocations: [1],
      fixedCode: 'void read_data(stat_double &data);   // forward declaration\n\nint main() {\n  stat_double d;\n  read_data(d);\n  return 0;\n}\n\nvoid read_data(stat_double &data) { ... }\n',
      bugCategory: 'function used before declaration',
      kc: ['void read_data(stat_double &data);'],
      explanation: 'C++ reads top-down. To call a function from main, declare it (prototype) before main, or define it before main. Without that, the compiler doesn\'t know `read_data`.',
    },
    mcq: {
      stem: 'You define `read_data` AFTER main. How do you let main call it anyway?',
      correct: 'Add a forward declaration (prototype) above main.',
      distractors: [
        'Move the call inside read_data itself.',
        'Use #include "read_data.cpp".',
        'Capitalise the call site.',
      ],
      explanation: 'A prototype `void read_data(stat_double &);` above main tells the compiler the signature. The full definition can come later.',
    },
    cloze: {
      code: 'void read_data(stat_double &data)___    // forward declaration\nint main() { ... read_data(d); ... }',
      clozeSentence: 'Fill in the punctuation that ends the forward declaration.',
      answer: ';',
      explanation: 'A prototype ends in `;` (no body). The full definition with body comes later.',
    },
  },

  // ---- CM-brace-mismatch (Q1-Q4) ----
  {
    id: 'CM-brace-mismatch',
    q: 'Q1',
    spot: {
      stem: 'A student submitted code that wouldn\'t compile because the final closing brace was missing. Below is the FIXED version. Identify the line where the student would need to add a closing brace.',
      brokenCode: 'void who_am_i(stat_double &data) {\n  data.mystery = 0.0;\n  for (int i = 0; i < SIZE; i++) {\n    data.mystery = data.mystery + data.numbers[i];\n  }\n} /* this final close was MISSING in student code */\n',
      bugLocations: [6],
      fixedCode: 'void who_am_i(stat_double &data) {\n  data.mystery = 0.0;\n  for (int i = 0; i < SIZE; i++) {\n    data.mystery = data.mystery + data.numbers[i];\n  }\n} /* close of function */\n',
      bugCategory: 'unbalanced braces — missing closing brace',
      kc: ['/* close of function */'],
      explanation: 'Two opens were made (function and for-loop). The student only wrote one close. Always count opens vs closes; the function body needs its own final close after the for-loop closes.',
    },
    mcq: {
      stem: 'Two `{` are opened. How many `}` must close them?',
      correct: 'Two `}` — one per `{`',
      distractors: ['One — last brace closes all.', 'Three — extra one for safety.', 'Zero — the compiler closes them.'],
      explanation: 'Braces match 1:1. Each `{` requires its own `}`.',
    },
    cloze: {
      code: '// Count opens and closes:\n// opens: 2 (function + for-loop)\n// closes: ___ (must match opens)',
      clozeSentence: 'Fill in the close-count required to match 2 opens.',
      answer: '2',
      explanation: 'Each `{` requires exactly one `}`. 2 opens need 2 closes.',
    },
  },

  // ---- CM-bitwise-amp (Q1,Q3) ----
  {
    id: 'CM-bitwise-amp',
    q: 'Q1',
    spot: {
      stem: 'This Q1 condition uses bitwise `&` instead of logical `&&`. Trace this on `numbers[i] = -1` and you\'ll see the bug.',
      brokenCode: 'if (numbers[i] > 0 & numbers[i] < 10) ...   // BUG: bitwise &\n',
      bugLocations: [1],
      fixedCode: 'if (numbers[i] > 0 && numbers[i] < 10) ...   // logical &&\n',
      bugCategory: 'bitwise & vs logical &&',
      kc: ['&&'],
      explanation: '`&` is bitwise AND on integer bits. `&&` is logical short-circuit AND on booleans. With negative numbers the bitwise version may give surprising results and skip short-circuit semantics.',
    },
    mcq: {
      stem: 'For combining boolean conditions in C++, which operator?',
      correct: '`&&` — logical AND with short-circuit',
      distractors: ['`&` — bitwise AND', '`and` — only some compilers', '`*` — multiplication'],
      explanation: '`&&` works on booleans, short-circuits, and is the only correct choice for `if (a && b)`.',
    },
    cloze: {
      code: 'if (a > 0 ___ a < 10) ...   // logical AND',
      clozeSentence: 'Fill in the logical AND operator (two characters).',
      answer: '&&',
      explanation: '`&&` is logical AND. `&` is bitwise AND on bits.',
    },
  },

  // ---- CM-A12-no-indirection (Q1) ----
  {
    id: 'CM-A12-no-indirection',
    q: 'Q1',
    spot: {
      stem: 'This Q1 A12 trace forgot the indirection: it added `numbers[i]` instead of `numbers[mystery]`. Find the wrong row.',
      brokenCode: '// algo (A12): mystery = mystery + numbers[mystery]    // index BY mystery\n// numbers = {3, 1, 2, 0, 4}; mystery init = 0\n//\n// i=0: 0 + numbers[0] = 0 + 3 = 3   mystery = 3   // BUG: used numbers[i], not numbers[mystery]\n',
      bugLocations: [4],
      fixedCode: '// CORRECT (A12): index BY mystery, not by i\n// i=0: 0 + numbers[mystery=0] = 0 + 3 = 3    mystery = 3\n// i=1: 3 + numbers[mystery=3] = 3 + 0 = 3    mystery = 3\n// i=2: 3 + numbers[mystery=3] = 3 + 0 = 3    mystery = 3\n',
      bugCategory: 'no indirection — used i instead of mystery as the index',
      kc: ['numbers[mystery]'],
      explanation: 'A12 indexes BY `mystery` (an indirection). Each iteration the new mystery becomes the next index. Don\'t pattern-match the A1-A11 shape.',
    },
    mcq: {
      stem: 'In algorithm A12 with `mystery = mystery + numbers[mystery]`, what is the array index expression?',
      correct: '`mystery` — the value of mystery',
      distractors: ['`i` — the loop counter', '`SIZE` — the array length', '`numbers[i]` — the value at i'],
      explanation: 'A12 indexes BY mystery. Each iter the new mystery picks the next index.',
    },
    cloze: {
      code: '// algo A12: mystery = mystery + numbers[___]\n// (this is the indirection that makes A12 unique)',
      clozeSentence: 'Fill in the index expression (it is NOT i).',
      answer: 'mystery',
      explanation: 'A12 indexes by `mystery`, creating an indirection (one extra read).',
    },
  },

  // ---- CM-A11-init-0 (Q1) ----
  {
    id: 'CM-A11-init-0',
    q: 'Q1',
    spot: {
      stem: 'This Q1 product algorithm trace seeded mystery to 0.0 and got 0.0 forever. Find the line that\'s wrong.',
      brokenCode: '// algo (A11): mystery = mystery * numbers[i]    // running PRODUCT\n// numbers = {2.0, 3.0, 4.0}\n//\n// pre-loop init: mystery = 0.0    // BUG: 0 annihilates products\n// i=0: 0.0 * 2.0 = 0.0   mystery = 0.0\n// i=1: 0.0 * 3.0 = 0.0   mystery = 0.0\n',
      bugLocations: [4],
      fixedCode: '// CORRECT seed for product: 1.0 (multiplicative identity)\n// pre-loop init: mystery = 1.0\n// i=0: 1.0 * 2.0 = 2.0   mystery = 2.0\n// i=1: 2.0 * 3.0 = 6.0   mystery = 6.0\n',
      bugCategory: 'wrong identity element — 0.0 for product',
      kc: ['mystery = 1.0'],
      explanation: '0 is the additive identity (correct for sum). 1 is the multiplicative identity (correct for product). 0 * anything = 0, so a 0-seeded product flat-lines.',
    },
    mcq: {
      stem: 'For the running-product algorithm `mystery = mystery * numbers[i]`, what pre-loop seed?',
      correct: '`1.0` — multiplicative identity',
      distractors: ['`0.0` — additive identity', '`numbers[0]` — first element', '`-1.0` — neutral?'],
      explanation: 'Product seed is 1 because `1 * x == x`. 0 annihilates and you get 0.',
    },
    cloze: {
      code: '// running product: mystery = mystery * numbers[i]\n// pre-loop seed: mystery = ___',
      clozeSentence: 'Fill in the multiplicative identity (one decimal).',
      answer: '1.0',
      explanation: 'Multiplicative identity is 1.0. Sums use 0.0, products use 1.0.',
    },
  },
];

// ---------------------------------------------------------------------
// Render YAMLs
// ---------------------------------------------------------------------

function yamlEsc(str) {
  // Use single-quoted YAML — no need to escape backslashes; we DO need
  // to double single quotes. For multiline content, use block-literal `|`.
  return str.replace(/'/g, "''");
}

function block(s) {
  // Output `|\n`-prefixed YAML block literal with 2-space indent.
  return '|\n  ' + s.replace(/\n/g, '\n  ');
}

let total = 0;

for (const cm of CMS) {
  const level = Q_TO_LEVEL[cm.q];
  const atom = Q_TO_ATOM[cm.q];
  const stage = Q_TO_STAGE[cm.q];

  // 1. FaultInjectionCard (SpotError)
  const spotId = `${level}-cmimm-${cm.id}-spot`;
  const spotYaml = `# Auto-emitted CM immunization (FaultInjectionCard) for ${cm.id}
id: "${spotId}"
schemaVersion: "v2"
atomId: "${atom}"
qTags: ["${cm.q}"]
stage: ${stage}
level: "${level}"
type: "FaultInjectionCard"

stem: ${block(cm.spot.stem)}

brokenCode: ${block(cm.spot.brokenCode.trimEnd())}

bugLocations: [${cm.spot.bugLocations.join(', ')}]

fixedCode: ${block(cm.spot.fixedCode.trimEnd())}

bugCategory: '${yamlEsc(cm.spot.bugCategory)}'

keyChecks:
${cm.spot.kc.map((k) => `  - '${yamlEsc(k)}'`).join('\n')}

explanation: ${block(cm.spot.explanation)}

source:
  kind: "v2"
  ref: "Test 2 V2.0 — common-mistake immunization (${cm.id})"

commonMistakeIds: ["${cm.id}"]
status: "NEW"
createdBy: "QA-M13-fix"
notes: "Auto-emitted CM immunization card (FaultInjectionCard / SpotError)"
authoringStatus: "DRAFT"
`;
  writeYaml(cardPath(level, cm.id, 'spot'), spotYaml);
  total++;

  // 2. MCQCard (concept check)
  const mcqId = `${level}-cmimm-${cm.id}-mcq`;
  const distractors = cm.mcq.distractors;
  const mcqYaml = `# Auto-emitted CM immunization (MCQCard) for ${cm.id}
id: "${mcqId}"
schemaVersion: "v2"
atomId: "${atom}"
qTags: ["${cm.q}"]
stage: ${stage}
level: "${level}"
type: "MCQCard"

stem: ${block(cm.mcq.stem)}

correct: '${yamlEsc(cm.mcq.correct)}'

distractors:
  - '${yamlEsc(distractors[0])}'
  - '${yamlEsc(distractors[1])}'
  - '${yamlEsc(distractors[2])}'

explanation: ${block(cm.mcq.explanation)}

source:
  kind: "v2"
  ref: "Test 2 V2.0 — common-mistake immunization (${cm.id})"

commonMistakeIds: ["${cm.id}"]
status: "NEW"
createdBy: "QA-M13-fix"
notes: "Auto-emitted CM immunization card (MCQCard / concept check)"
authoringStatus: "DRAFT"
`;
  writeYaml(cardPath(level, cm.id, 'mcq'), mcqYaml);
  total++;

  // 3. ClozeCard (fix-it)
  const clozeId = `${level}-cmimm-${cm.id}-cloze`;
  const clozeYaml = `# Auto-emitted CM immunization (ClozeCard) for ${cm.id}
id: "${clozeId}"
schemaVersion: "v2"
atomId: "${atom}"
qTags: ["${cm.q}"]
stage: ${stage}
level: "${level}"
type: "ClozeCard"

stem: "Fill in the missing token to fix this ${cm.id} mistake."

code: ${block(cm.cloze.code)}

clozeSentence: '${yamlEsc(cm.cloze.clozeSentence)}'

answer: '${yamlEsc(cm.cloze.answer)}'

explanation: ${block(cm.cloze.explanation)}

source:
  kind: "v2"
  ref: "Test 2 V2.0 — common-mistake immunization (${cm.id})"

commonMistakeIds: ["${cm.id}"]
status: "NEW"
createdBy: "QA-M13-fix"
notes: "Auto-emitted CM immunization card (ClozeCard / fix-it)"
authoringStatus: "DRAFT"
`;
  writeYaml(cardPath(level, cm.id, 'cloze'), clozeYaml);
  total++;
}

console.log(`[gen-cm-immunization] wrote ${total} cards across ${CMS.length} CMs`);
