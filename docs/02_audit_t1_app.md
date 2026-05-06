# T1 App Audit — Hand-Execution Patterns

App: extracted Capacitor APK at `it-elo-test1-extracted/`. Built for SIT102 Test 1 (C# variant). User feedback: "good for hand-exec, sucked at code-writing."

## What Worked (Reuse)

### 1. Variable-box format with progression history

Each variable rendered as labeled box. Old values struck through. Current value prominent. Per-iteration row entry. **Mirrors paper-based tracing exactly.** Each line of code that mutates a variable triggers a new step in that variable's history strip.

```
i:    [0] [1] [2] [3] [4]
sum:  [0] [10] [19] [27] [34]
max:  [0] [10] [10] [10] [10]
```

### 2. Paired Terminal output section

Separate "Terminal" input area for printed output (one per line, +/− buttons). Physical separation: memory state vs output state. Two distinct trace artifacts simultaneously. Matches how instructors draw separate columns on paper.

### 3. Two-pass trace on same code (Q3 + Q4)

Same code, two questions:
- **Q3 (full)**: hand-execute end-to-end, capture final state + output.
- **Q4 (partial)**: hand-execute up to `q4StopCondition` (e.g., `i == 4`), capture intermediate state.

Forces understanding of iteration mechanics, not just memorization of one execution path. `q4StopCondition` field defined scope explicitly — prevented shortcuts.

### 4. Strict per-value grading

Variables compared as exact ordered lists (case-insensitive, whitespace-normalized). If `[10, 9, 8]` expected and student types `[10, 8]`, wrong. No "close enough." Forces precise tracing.

### 5. Inline input labels and prompts

Code blocks contained `ReadLine()`/`cin >>` calls. Drill metadata stored `q3InputLabels` ("Enter initial value:", "Enter count:") and `q3Inputs` (["10", "5"]). Appeared inline in UI. Student always knew expected user input. Eliminated common confusion: "wait, what does the code expect?"

---

## What Broke (Don't Repeat)

### 1. Single AI-judged code-write question (Q6 only)

Whole test had **one** code-write drill. Used Claude AI grading: "Be lenient on syntax, strict on logic." 200 token max response. No scaffolding, no progression, no syntax check. Pure black-box judgment. Failure mode: AI hallucinations + latency + no reproducibility.

### 2. No partial-credit / hint system on code-write

Hand-trace had "Teach Me" buttons → 3-5 sentence explanations on wrong. Code-write had **none**. Wrong = wrong. Generic rubric "Does the student's code solve the problem correctly?" No syntax hints, no intermediate checkpoints.

### 3. No multi-step code-write path

Best practice: fill-blank → syntax-completion → free-form. App jumped straight to "write a do-while loop from scratch." No variable-declaration drills. No "complete the condition" drills. Hardest task only.

### 4. No syntax validation / REPL

No integrated compiler. Student couldn't see "missing semicolon" or "loop never terminates." Feedback was logical (AI judgment), not structural.

---

## Reusable Card Templates

### Hand-Execution Drill (T1 schema, validated)

```ts
{
  type: 'trace',
  code: '<multi-line C++ snippet>',
  question: 'Hand execute this code with inputs: <list>',
  inputLabels: ['Prompt 1:', 'Prompt 2:'],
  inputs: ['10', '5'],
  variables: ['i', 'sum', 'max'],
  expectedVariables: {
    i:   ['0', '1', '2', '3', '4'],
    sum: ['0', '10', '19', '27', '34'],
    max: ['0', '10', '10', '10', '10'],
  },
  expectedOutputs: ['Sum is 34', 'Max is 10'],
  followUp: {
    type: 'simplify',
    question: 'In one sentence, what does this loop do?',
  },
}
```

### Code-Write Drill (3-level scaffold, NEW)

T1 missed this. Required structure:

```ts
// Level 1: fill-in-the-blank
{
  type: 'fill',
  code: 'for (int i = 0; i < ___; i++) {',
  answer: '5',
}

// Level 2: complete-the-body
{
  type: 'complete',
  code: 'for (int i = 0; i < n; i++) {\n  _____\n}',
  expectedAnswer: 'cout << i;',
}

// Level 3: free-form from spec
{
  type: 'write',
  prompt: 'Write a for-loop that prints 0 to n-1.',
  expectedAnswer: 'for (int i = 0; i < n; i++) cout << i;',
  explanation: '<why this works>',
}
```

### Bug-Identification Drill (already in T1 Q5)

```ts
{
  type: 'bug',
  code: '<C++ with intentional bug>',
  question: 'What is the bug?',
  correctAnswer: '<description: missing &, off-by-one, wrong operator>',
  rubric: 'Identifies core flaw (syntax / logic / scope)',
}
```

---

## Design Wins to Carry Over

| Pattern | Why it works |
|---------|-------------|
| Variable-box history strip | Mirrors paper. Matches what student does on exam. |
| Terminal output separate from variable boxes | Two distinct artifacts; teaches separation. |
| Same code, two passes (full + partial) | Forces iteration understanding, not memorization. |
| Strict ordered-list grading | No "close enough" — exam grading is similarly strict. |
| Inline input prompts | Removes ambiguity. Student knows what to assume. |
| Per-card "Teach Me" on wrong | Recovery path. Don't let student fail silently. |

## Design Failures to Fix

| Failure | Fix |
|---------|-----|
| Single code-write question | Many code-write drills, scaffolded |
| AI-judged grading | Char-match offline grading |
| No fill-blank / completion levels | 3-level scaffold (fill → complete → free) |
| No hint system on write | "Teach Me" parity with trace drills |
| No syntax validation | Pre-compile expected answers; show student syntax errors via static rules |
