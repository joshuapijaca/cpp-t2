# Redesign Spec — L-1 to L11 Hand-Authored Cards

You are an agent generating hand-authored code-centric cards for a level batch.
This file is the shared spec. Read it once, then author your assigned levels.

## Hard rules

1. **Zero word-memorize cards** anywhere in your output. Every card anchors to a code artifact.
2. **Hand-author each card.** Don't template-stamp. Vary code domain per atom (banking, game, IoT, student grades, weather, sensor, inventory, ticket, library catalog).
3. **Char-checks (`keyChecks`) must be GUARANTEED to appear in the correct answer.** Use literal substrings that exist verbatim in `expectedAnswer` / `code` field. NO optional whitespace. NO partial words. NO case-sensitivity tricks. Test by mentally typing a correct answer and verifying every keyCheck token appears.
4. **JSON output MUST match card schemas in `src/types/card.ts` EXACTLY.** No extra fields. All required fields populated.
5. **Code snippets must compile mentally.** Closing braces. Semicolons. Header includes implicit (assume `<iostream>` + `using namespace std`).
6. **Atom IDs must match outline YAML files.** Read `outlines/L<NN>/<ID>.yml` first.
7. **Each card needs a unique `id`** for `procedural`/`matrix`/`code-memorize`. Pattern: `<TYPE>-<ATOM>-<NN>` e.g. `PD-R03-01`, `CM-T05-02`, `CMEM-V12-03`.

## Card schemas (from `src/types/card.ts`)

### TraceCard (final-only mode for foundation levels)

```ts
{
  type: 'trace',
  atomId: string,
  code: string,                  // multi-line C++ snippet
  variables: string[],           // names being tracked, e.g. ["x", "y"]
  expectedSteps: Array<{
    line: number,
    variable: string,
    value: string,
    output?: string | null,
    condition?: string | null
  }>,
  userInputs: string[],          // for cin programs, [] otherwise
  inputLabels: string[],         // [] if no input
  terminalOutput: string[],      // expected stdout lines
  q4StopCondition?: string,
  inputMode: 'final-only',       // foundation: 'final-only'; loops: 'final-only' too
  teachMe: string                // 1-2 sentences explaining the trace
}
```

For trace cards on atoms that don't execute (input atoms), use **cloze or write instead**.

### WriteCard

```ts
{
  type: 'write',
  atomId: string,
  level: 1 | 2 | 3,              // 1=line, 2=block, 3=full program
  spec: string,                  // prompt
  template?: string,             // optional starter
  expectedAnswer: string,        // canonical answer
  keyChecks: string[],           // tokens that MUST appear
  forbidden?: string[],          // tokens that must NOT appear
  explanation: string
}
```

### ClozeCard

```ts
{
  type: 'cloze',
  atomId: string,
  code: string,                  // code with ___ where blank is
  clozeSentence: string,         // "The ___ statement defines a function"
  answer: string,                // single token, MUST be exact substring of correct fill
  explanation: string
}
```

### WalkthroughCard (variation walkthrough — Krashen i+1)

```ts
{
  type: 'walkthrough',
  atomId: string,
  levelLabel: string,            // e.g. "L4 -> arithmetic"
  fullCode: string,              // full snippet
  steps: Array<{
    line: number,
    code: string,                // exact code line
    annotation: string,          // teaching annotation
    atomIds: string[]
  }>
}
```

### ProceduralCard (3-streak with variants)

```ts
{
  type: 'procedural',
  atomId: string,
  id: string,                    // unique e.g. "PD-V05-01"
  section: string,               // e.g. "Variable declaration"
  prompt: string,
  expectedAnswer: string,
  keyChecks: string[],
  variants: Array<{ prompt: string; expectedAnswer: string }>  // 2 variants minimum
}
```

### MatrixCard (pattern transfer)

```ts
{
  type: 'matrix',
  atomId: string,
  id: string,                    // unique e.g. "CM-V05-01"
  section: string,
  matrixType: 'algorithm' | 'entity' | 'progression',
  examples: Array<{ label: string; code: string }>,  // 2 examples
  prompt: string,                // student must produce 3rd
  expectedAnswer: string,
  keyChecks: string[]
}
```

### CodeMemorizeCard (see → hide → type verbatim)

```ts
{
  type: 'code-memorize',
  atomId: string,
  id: string,                    // unique e.g. "CMEM-S01-01"
  section: string,
  question: string,              // what to type
  code: string,                  // canonical code to memorize
  keyChecks: string[]
}
```

## Sample cards (one per type, real from cards.json)

### Sample TRACE

```json
{
  "type": "trace",
  "atomId": "PC-01",
  "code": "struct Point { int x; int y; };\nvoid f(Point p) { p.x = 99; }\nint main() {\n  Point a = {3, 4};\n  f(a);\n  cout << a.x;\n  return 0;\n}",
  "variables": ["a.x", "a.y", "p.x"],
  "expectedSteps": [
    { "line": 4, "variable": "a.x", "value": "3" },
    { "line": 4, "variable": "a.y", "value": "4" },
    { "line": 5, "variable": "p.x", "value": "99" }
  ],
  "userInputs": [],
  "inputLabels": [],
  "terminalOutput": ["3"],
  "inputMode": "final-only",
  "teachMe": "f receives a copy of a. p.x = 99 changes the copy only. Caller a.x stays 3."
}
```

### Sample WRITE

```json
{
  "type": "write",
  "atomId": "PC-01",
  "level": 1,
  "spec": "Write a void function header that takes a Rect by value",
  "expectedAnswer": "void f(Rect r)",
  "keyChecks": ["void", "Rect"],
  "forbidden": ["&"],
  "explanation": "No & after type = pass by value. The function gets a copy."
}
```

### Sample CLOZE

```json
{
  "type": "cloze",
  "atomId": "PC-01",
  "code": "void zero(Pixel ___ p) { p.r = 0; p.g = 0; }\n// After: caller's Pixel is UNCHANGED",
  "clozeSentence": "To pass by value, leave the type-name space empty (no &)",
  "answer": " ",
  "explanation": "No & = pass by value. The function gets a copy, caller is unchanged."
}
```

### Sample WALKTHROUGH

```json
{
  "type": "walkthrough",
  "atomId": "P-01",
  "levelLabel": "L-1 prerequisites",
  "fullCode": "#include <iostream>\nusing namespace std;\nint main() {\n  cout << \"Hello\" << endl;\n  return 0;\n}",
  "steps": [
    {
      "line": 1,
      "code": "#include <iostream>",
      "annotation": "Loads input/output library so cout exists",
      "atomIds": ["P-01"]
    },
    {
      "line": 3,
      "code": "int main() {",
      "annotation": "Entry point - computer starts executing here",
      "atomIds": ["P-01"]
    },
    {
      "line": 4,
      "code": "  cout << \"Hello\" << endl;",
      "annotation": "Prints Hello to terminal then a newline",
      "atomIds": ["P-01"]
    }
  ]
}
```

### Sample PROCEDURAL

```json
{
  "type": "procedural",
  "atomId": "HE-01",
  "id": "PD-HE01-01",
  "section": "C++ boilerplate",
  "prompt": "Write the two lines that start every C++ program: iostream include + namespace declaration",
  "expectedAnswer": "#include <iostream>\nusing namespace std;",
  "keyChecks": ["#include", "<iostream>", "using", "namespace", "std", ";"],
  "variants": [
    {
      "prompt": "Write include + namespace lines needed before any cout/cin usage",
      "expectedAnswer": "#include <iostream>\nusing namespace std;"
    },
    {
      "prompt": "Write the header lines that give access to cin and cout",
      "expectedAnswer": "#include <iostream>\nusing namespace std;"
    }
  ]
}
```

### Sample MATRIX

```json
{
  "type": "matrix",
  "atomId": "SW-01",
  "id": "CM-SW01-01",
  "section": "Q2 entity swap: struct + read for new entity",
  "matrixType": "entity",
  "examples": [
    {
      "label": "Example A: struct for employee_data",
      "code": "struct employee_data {\n    int id;\n    string name;\n    double salary;\n};"
    },
    {
      "label": "Example B: read function for employee_data",
      "code": "void read_employees(employee_data list[], int count) {\n    for (int i = 0; i < count; i++) {\n        cin >> list[i].id;\n        cin >> list[i].name;\n        cin >> list[i].salary;\n    }\n}"
    }
  ],
  "prompt": "Write the struct AND read function for student_data with fields: int id, string name, string course.",
  "expectedAnswer": "struct student_data {\n    int id;\n    string name;\n    string course;\n};\n\nvoid read_students(student_data list[], int count) {\n    for (int i = 0; i < count; i++) {\n        cin >> list[i].id;\n        cin >> list[i].name;\n        cin >> list[i].course;\n    }\n}",
  "keyChecks": ["struct", "student_data", "int id", "string name", "string course", "};", "void", "read_students", "list[]", "int count", "for", "cin", "list[i]"]
}
```

### Sample CODE-MEMORIZE

```json
{
  "type": "code-memorize",
  "atomId": "SW-01",
  "id": "CMEM-SW01-01",
  "section": "Struct writing",
  "question": "Write struct employee_data with fields: int id, string name, double salary",
  "code": "struct employee_data {\n    int id;\n    string name;\n    double salary;\n};",
  "keyChecks": ["struct", "employee_data", "int id", "string name", "double salary", "};"]
}
```

## Char-check verification protocol

For EACH card with `keyChecks`:

1. Look at the `expectedAnswer` (write/procedural) or `code` (matrix/cmem).
2. For each token in `keyChecks`, search the answer/code as plain substring (no regex).
3. If ANY token doesn't appear verbatim, FIX the keyCheck OR the answer.
4. Common failure: writing `int id` as keyCheck but answer has `int  id` (double space) — fix to single space match.
5. Tokens should be **distinguishing** (not generic like `;` or `}` alone — okay as anchors but pair with semantically meaningful tokens).

## Per-level templates (cards per atom, by type)

| L | atoms | walk | trace | cloze | write | proc | matrix | cmem |
|---|-------|------|-------|-------|-------|------|--------|------|
| L-1 | 7 | 1.5 | 2 | 1 | 0.5 | 0 | 0 | 1 |
| L00 | 10 | 1 | 1 | 2 | 1.5 | 0 | 0 | 2 |
| L01 | 13 | 2 | 3 | 3 | 3 | 0.3 | 0.5 | 0.8 |
| L02 | 20 | 2 | 4 | 4 | 3 | 0.5 | 1 | 1 |
| L03 | 7 | 2.4 | 0 | 4 | 5 | 0.6 | 0.6 | 0.9 |
| L04 | 11 | 2 | 6 | 3 | 2 | 0.5 | 1 | 0.8 |
| L05 | 10 | 2 | 6 | 3 | 2.5 | 0.5 | 0.8 | 0.7 |
| L06 | 5 | 3 | 3 | 4 | 5 | 0.4 | 0.6 | 1 |
| L07 | 10 | 2 | 7 | 3 | 3 | 0.5 | 1 | 0.8 |
| L08 | 10 | 4 | 7 | 2 | 1.5 | 0.3 | 0 | 0.3 |
| L09 | 8 | 3 | 5 | 4 | 5 | 0.8 | 1 | 1.2 |
| L10 | 14 | 2 | 3 | 4 | 4 | 0.5 | 0.8 | 0.7 |
| L11 | 12 | 3 | 4 | 4 | 5 | 0.5 | 0.8 | 1 |

These are floats. Round per atom to integers; total per level should match `atoms × ratio` ±1.

## Foundation reframe (L-1 + L00)

L-1 atoms are about process model (compile, run, exe). They aren't traceable like loops. Reframe:

| atom theme | reframe via |
|------------|-------------|
| process is conceptual | terminal session as `code` field, predict output |
| compile errors | code with bug + trace predicting compiler output |
| run-time concept | code + observable stdout |

For L00 (setup): atoms are `#include`, `using namespace`, `int main`, etc. Use:
- code-memorize: type the canonical line verbatim
- cloze: blank a token in the canonical line
- write: type the multi-line boilerplate from prompt
- trace: 3-line program with the atom's concept, predict output

## Q-tag awareness

Each outline YAML has `q_tags` field (Q1/Q2/Q3/Q4 with relevance: C=critical, S=supporting, N=none). Use this to:
- High Q1 atom → emphasize trace cards
- High Q2 atom → emphasize struct write cards
- High Q3 atom → emphasize read function cards
- High Q4 atom → emphasize loop + print cards

## Domain rotation rule

Vary code domains across atoms. Don't reuse the same struct name or variable names within a level. Suggested rotation per level:

L-1: hello-world, sum-of-two, max-of-three (simple programs)
L00: greeting, calculator, age-checker
L01: receipt-print, score-display, sensor-reading
L02: bank-balance, weight-tracker, score-grade
L03: name-input, pin-checker, prompt-and-echo
L04: tax-calc, area-calc, average-grade
L05: pass-fail, age-band, valid-input
L06: greet-fn, area-fn, max-fn
L07: countdown, sum-loop, print-table
L08: trace-loop, trace-condition, trace-function
L09: increment-byref, swap-byref, populate-byref
L10: format-decimal, parse-string, length-check
L11: point, rectangle, employee, student, book

## Output format

Write your output as a JSON ARRAY of card objects to:

`data/redesign/L<NN>.json`

(Use `L-1.json`, `L00.json`, `L01.json` ... `L11.json`)

ONE FILE PER LEVEL. Each file contains all cards for atoms in that level only. JSON must be valid (parse with `JSON.parse`).

After writing, count cards by type and report totals in your final message.

## Atom outline schema reference

Each atom YAML has:
```yaml
id: ATOM-NN
fact: "<=7 word concept"
words: <int>
level: <int>
deps: [PREREQ-IDS]
q_tags: { Q1: C/S/N, Q2: ..., Q3: ..., Q4: ... }
canonical_example: "code snippet (may be empty)"
expected_output: "stdout"
sit102_quirks: ["..."]
misconceptions: [{ id, description, student_says, correct_says }]
render_hints:
  see_demo: { snippet, why_one_line, highlights }
  see_decompose: { snippet, correct_atoms, distractors }
```

Read all YAML for your assigned atoms before authoring. Use `canonical_example` as base for cards but vary domain across atoms within a level.

## Final checklist before writing JSON

- [ ] All atoms in your assigned levels covered
- [ ] Card mix matches per-level template (±1 per type)
- [ ] Every keyCheck appears verbatim in expectedAnswer/code
- [ ] No two cards share the same `id` field (procedural/matrix/cmem)
- [ ] Every code snippet is mentally compilable
- [ ] Domain varies per atom (no 5 cards in a row about employees)
- [ ] No word-memorize cards
- [ ] JSON parses successfully
