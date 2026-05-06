# IT-ELO T1 APK — Hand-Execution Deep Dive

Bundle: `_apk_extract/it-elo-t1/assets/public/assets/index-CC364e9e.js` (756 KB minified). Source: `IT-ELO.apk` from Downloads. T1 content outdated; **UX pattern canonical** for new T2 app.

---

## Variable-Box Schema (Clone Verbatim)

```typescript
type Step = {
  line: number;          // source line (drives code highlight)
  variable: string;      // var name; "" for output-only step
  value: string;         // post-assignment value
  output?: string | null; // terminal print this step
  condition?: string | null; // "age > 5 → true" inline
};

type VisualTrace = {
  variables: string[];   // declared/assigned vars only
  steps: Step[];         // execution timeline
  userInputs?: string[]; // values for ReadLine()/cin
  inputLabels?: string[]; // "Enter age:" prompts (NEW — T1 missed this)
};
```

**Render rule**: each variable shows `̶o̶l̶d̶ new` (strike old, live current). Uninitialized = `̶ ̶ value` (empty crossed). One row per mutation. History strip horizontal.

---

## UI Flow (T1 Question Structure)

| Q | Type | Format | Grading |
|---|------|--------|---------|
| Q1 | Terminal command | Single-line input | Exact match (`dotnet new console`) |
| Q2 | Terminal command | Single-line input | Exact match |
| Q3 | Hand-trace (full) | Variable boxes + terminal panel | Per-var ordered list match |
| Q4 | Hand-trace (partial) | Same code, stop at `i == 4` | Same grading + stop condition |
| Q5 | Bug-ID | Free-text | Claude API (FAIL) |
| Q6 | Code-write | Free-form code | Claude API (FAIL) |

---

## Grading Algorithm (Q3/Q4)

```
for each var in expectedVars:
  if studentVars[var] === expectedVars[var]: ✓
  else: ✗ "expected [10,9,8], got [10,9]"
all-or-nothing: any var mismatch → fail
```

Order-sensitive. String compare (case-insensitive, whitespace-collapsed).

---

## Two-Pass Mechanism (Q3 vs Q4)

Same code. Different stop trigger.

```
Q3 inputs → loop exits naturally → trace until termination
Q4 inputs + stopCondition: "i == 4" → halt mid-loop, capture state
```

Tests: Q3 = normal mental model. Q4 = "what if loop never terminates?" — student stops manually at the divergent state. Reveals infinite-loop bug.

Code shape always:
```cs
int i = 0;
while (i != target) {  // BUG: != instead of <
  i++;
}
```

---

## Failures (Q5 + Q6) — Don't Repeat

### Q5 (Bug-ID)

- Free-text "What is the bug?" — too vague.
- Claude API grades semantic match.
- **Fix**: narrow scope. Ask "Why does this fail for input 5?" → trains specific concept, gradeable offline via keyword check.

### Q6 (Code-Write)

- Single AI-judged Q with hint "use `%`".
- No AST, no scaffolding, no syntax check.
- ~40% false positive/negative rate (student inference).
- Claude approves missing init, missing termination, broken scope.
- **Fix**: 3-level scaffold (fill → complete → free) + offline `keyChecks[]` + pre-validated expected answers.

---

## CSS Evidence (UI Structure)

Tailwind utilities indicate UI layout:

| Class | Role |
|-------|------|
| `bg-bg-card` | Variable-box background |
| `border-accent` | Current-step emphasis |
| `flex flex-col` | Box stacking |
| `whitespace-pre` | Code/terminal preformatted |
| `bg-success / bg-warning / bg-danger` | Step status colors |
| `line-through opacity-70` | Strikethrough old values |
| `gap-1 gap-2` | History-strip spacing |

**New app rule**: replace utility chains with semantic classes (`.variable-history`, `.step-box--current`, `.terminal-line`) for maintainability.

---

## 7 Design Wins to Clone

1. **Strikethrough history** — visualizes mutation; prevents "magic value" confusion
2. **Per-step rendering** — one row per line execution; trains step-tracing
3. **Inline condition viz** — `age > 5 → true` shown alongside vars; clarifies cond ≠ stmt
4. **Separate terminal panel** — output isolated from var trace; mirrors IDE
5. **`userInputs` array + `inputLabels`** — explicit "assume user types X" labels
6. **Two-pass loop trace** — same code, different stop = tests loop understanding without rewriting
7. **Terminal-command Q1/Q2 first** — baseline competency before complexity

---

## 7 Design Failures to Avoid

1. AI grading Q6 with no AST → use offline `keyChecks[]` + pre-compiled expected answers
2. No scaffolding on code-write → 3-level fill/complete/free
3. Q5 vague bug-ID → narrow to specific concept ("Why does X fail for input 5?")
4. Single-mismatch instant fail → add per-variable feedback ("max correct, sum wrong")
5. No recovery on wrong answer → "Teach Me" button → 3-5 sentence explanation → retry
6. `userInputs` array without label mapping → explicit `inputLabels` per ReadLine
7. Tailwind-only classes → semantic class layer for grid iteration clarity

---

## Spec Updates → 04_new_app_design.md

### Hand-Trace Component (final spec)

```typescript
interface HandTraceCard {
  type: 'trace';
  code: string;
  variables: string[];
  expectedSteps: Step[];        // per-line, per-var state
  userInputs: string[];
  inputLabels: string[];        // "Enter age:" — explicit
  terminalOutput: string[];
  q4StopCondition?: string;     // "i == 4" for partial-trace pass
  inputMode: 'per-step' | 'final-only';  // per-step early; final-only sims
  teachMe: string;              // 3-5 sentence recovery explanation
  followUp?: {
    type: 'simplify';
    question: string;           // "What does this loop do?"
  };
}
```

### Render Specs

| Element | Spec |
|---------|------|
| Variable box | History strip (horizontal). Old strike-through. Current bold. |
| Empty initial | `̶ ̶ value` |
| Current line highlight | `bg-accent` ring on code line N matching `currentStep.line` |
| Terminal panel | Below variable boxes. Pre-formatted. One output per line. |
| Condition inline | "age > 5 → true" rendered next to variable being tested |
| Step status | Green/yellow/red ring per box on grade |

### Two-Pass Schema (Q3/Q4 within one drill)

```typescript
interface TwoPassDrill {
  code: string;
  passes: [
    { label: 'Q3: Full trace', userInputs: ['10', '5'], stopAt: null },
    { label: 'Q4: Stop at i == 4', userInputs: ['1', '0'], stopAt: 'i == 4' },
  ];
}
```

Both passes graded independently. Both must pass. Q4 alone reveals infinite-loop misconception.

---

## Application to T2

Q1 (T2 hand-trace `who_am_i`) → use this exact pattern. Variable boxes for `data.numbers[]`, `data.mystery`, `i`, `max`. Inline condition for `d.numbers[i] > d.mystery → true/false`. Terminal panel empty (no print in `who_am_i`). Two-pass: full trace + partial-stop at `i == 3` to verify mid-loop max state.

Q2/Q3/Q4 (T2 code-write) → 3-level scaffold replaces Q6 failure mode. Pre-compile expected answers. `keyChecks[]` for token validation.

Q5 bug-ID → drop entirely or narrow to "Why does this fail without `&`?" → keyword-graded offline.
