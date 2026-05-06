# New App Design — From First Principles

Build a pie. Invent the universe. Cognitive assembly line: 0 prior C++ → ace T2.

No reused IT ELO content. No timeframes. No SRS. No mastery gating. No save state. No API after build. No duplicate exercises.

---

## Core Architecture

### Single linear sequence (no modes, no pickers)

```
START → axioms → operators → control flow → aggregates → functions → RDS (&) → composites → Q1 sims → Q2 sims → Q3 sims → Q4 sims → mock exams
```

One path. No branches. No skip-ahead. No "choose your topic." Forward-only progression. Learner clicks "Next" through 67 atoms × ~25 cards each.

**No mastery gating.** If learner answers wrong, they see correct answer + retry inline, then continue. Wrong does not block forward motion. (User has 56 hours; gating wastes them.)

**No save state.** Session-only. Refresh = restart. Acceptable: learner finishes in 2 weeks, never needs persistence. (If pause needed, browser tab stays open.)

### Card formats

Four card types only. **All offline-graded** (char-match, no API).

| Type | Format | Source | When |
|------|--------|--------|------|
| **Memorize** | Click anywhere → blank field → type the fact verbatim | Each axiom + each rule | Tier 0–6 |
| **MCQ** | Stem + 4 options, 1 correct | Misconception filter | Sparingly, Tier 0–2 only |
| **Hand-trace** | Show code → fill variable-box history + terminal output | T1 schema | Tier 7 (Q1) + Q1 sims |
| **Code-write** | Spec → 3-level scaffold (fill → complete → free) | New (T1 missed this) | Tiers 8–10 + Q2/Q3/Q4 sims |

### Memorize-card spec (Miller's law)

- Each card holds **one fact**, **≤7 words**.
- UI: card shows fact for 3 seconds. Click anywhere → fact disappears → blank input field → student types verbatim.
- Grade: char-match (case-insensitive, whitespace-collapsed, punctuation-tolerant).
- Wrong → show correct + retry once → continue regardless.

Examples (each ≤7 words):
```
"& means same memory box"
"void = no return value"
"arrays index from 0"
"struct ends with semicolon"
"%s needs c_str() for string"
```

### MCQ-card spec

- Use sparingly. Cap **20%** of total cards.
- Only for axioms (Tier 0) and misconception filters (R01-R06, common bugs).
- 4 options. 1 correct. 3 plausible misconceptions (drawn from "Common Misconceptions" list in [03_mastery_state_t2.md](03_mastery_state_t2.md)).

### Hand-trace card spec (canonical, cloned from IT-ELO T1 APK)

Full spec in [06_audit_it_elo_t1_apk.md](06_audit_it_elo_t1_apk.md). Summary:

```typescript
interface HandTraceCard {
  type: 'trace';
  code: string;
  variables: string[];
  expectedSteps: Step[];        // per-line, per-var state
  userInputs: string[];
  inputLabels: string[];        // explicit "Enter age:" prompts
  terminalOutput: string[];
  q4StopCondition?: string;     // partial-trace stop trigger
  inputMode: 'per-step' | 'final-only';
  teachMe: string;              // 3-5 sentence recovery
}

interface Step {
  line: number;
  variable: string;             // "" for output-only step
  value: string;
  output?: string | null;
  condition?: string | null;    // "i < 5 → true" inline
}
```

Render rules:
- Variable box = history strip (horizontal); old values strike-through, current live
- Uninitialized: `̶ ̶ value`
- Current line highlighted (`bg-accent` ring)
- Terminal panel separate, one output per line, pre-formatted
- Condition viz inline next to tested variable
- Step status: green/yellow/red ring on grade
- Two-pass on same code: Q3 full + Q4 partial-stop, graded independently
- Wrong → "Teach Me" → 3-5 sentence explanation → retry
- Strict per-value grading: ordered list match per variable, all-or-nothing per question
- Use **semantic CSS classes** (`.variable-history`, `.step-box--current`, `.terminal-line`) — not Tailwind utility chains

### Code-write card spec (3-level scaffold, NEW)

T1 had only one code-write Q. New app has hundreds, scaffolded:

**Level 1 — Fill blank**:
```cpp
for (int i = 0; i < ___; i++) {  // blank: 5
```

**Level 2 — Complete body**:
```cpp
for (int i = 0; i < n; i++) {
  _____  // expected: cout << i;
}
```

**Level 3 — Free-form from spec**:
```
Spec: Write a for-loop that prints 0 to n-1.
Expected: for (int i = 0; i < n; i++) cout << i;
```

Grading: normalize whitespace + case → char-match. Multiple correct answers accepted via regex pattern (e.g., `cout` and `printf` both valid where appropriate).

---

## Content Volume

### Per-atom card distribution

Per atom (67 total):

| Card type | Count |
|-----------|-------|
| Memorize | 5 (different phrasings of same fact, ≤7 words each) |
| MCQ | 3 (one correct + 3 distractors per variant) |
| Hand-trace | 8 (Tier 7 atoms only — others skip) |
| Code-write Lv1 | 3 (fill-blank) |
| Code-write Lv2 | 3 (complete body) |
| Code-write Lv3 | 2 (free-form) |

Per atom average: ~16 cards. Total: 67 × 16 = **~1,070 base cards**.

### Q1-Q4 simulation cards

Per question (Q1, Q2, Q3, Q4):

| Type | Count |
|------|-------|
| Variant (different entity, values, names) | 15 |
| Mock exam (full Q1+Q2+Q3+Q4, timed) | 5 |

Sub-total: 4 × 15 = 60 question variants. Plus 5 mock exams × 4 questions = 20 mock cards. = **80 sim cards**.

### Total

~1,070 base + 80 sim = **~1,150 cards**.

At ~3 minutes/card avg → ~57 hours. Fits 56-hour budget.

---

## Authoring Strategy (Templates → Variants)

User stated: "manually generating thousands of cards = most token usage I've ever seen." Solution: parametric templates.

### Template structure

For each atom, hand-author **1 template** with substitution slots:

```ts
{
  atomId: 'R03',
  fact: '`&` in param affects caller',
  memorizeVariants: [
    '& parameter changes caller box',
    'ampersand means caller sees changes',
    'caller and param share memory',
    '& aliases — same box, two names',
    'no copy when & is used',
  ],
  mcqTemplate: {
    stem: 'What does `void f({TYPE} &x)` mean for `x` in caller?',
    correct: 'Same box; mutations persist',
    distractors: ['Copy made; caller unchanged', 'x is read-only', 'x is destroyed at return'],
    typeSlot: ['int', 'double', 'string', 'computer_data', 'student_data'],
  },
  traceTemplates: [...],
  writeTemplates: [...],
}
```

### Variant generator (offline build step)

One Node script. Reads templates → expands cartesian product of slots → emits flat `cards.json`. Run once at build time. No runtime API.

```
Atoms: 67 templates → ~1,150 cards (5–16 variants per template)
Build time: <1 second
Runtime cost: 0 tokens
```

**No duplicates.** Variant generator dedupes by content hash. Same code with different variable names = OK (genuine variant). Identical card twice = filtered.

---

## Concept Ranking (per Q1-Q4)

Ranking from [03_mastery_state_t2.md](03_mastery_state_t2.md). Each atom tagged C/S/N per question.

### Per-question top 10 critical atoms

**Q1 (Hand-Trace)**:
1. R01 — `&` means same memory box
2. R03 — `&` in param affects caller
3. T07 — trace max-finder algorithm
4. T08 — trace struct field mutation via `&`
5. T03 — trace for-loop iterations
6. G06 — `.field` accesses struct member
7. G02 — `arr[i]` accesses i-th element
8. F04 — for-loop body runs N times
9. T09 — trace `d.numbers[i] > d.mystery`
10. T06 — trace pass-by-value vs `&`

**Q2 (Struct Write)**:
1. W01 — write `struct Name { ... };` skeleton
2. W02 — write field: `type fieldName;`
3. W03 — terminate struct with `};`
4. G05 — `struct Name { fields };` defines type
5. W04 — choose types (int/double/string)
6. B04 — declare type before name
7. A03 — string holds text
8. A01 — int holds whole number
9. A06 — `;` ends statement
10. A07 — `{}` groups statements

**Q3 (Read Function)**:
1. K02 — write `X &list[]` parameter
2. R04 — `&array[]` = caller's array
3. K01 — write `void read_X(...)` signature
4. K04 — write for-loop with count bound
5. K05 — write `cin >> list[i].field;`
6. H04 — `void` = no return value
7. F03 — for-loop header
8. G02 — `arr[i]` access
9. G06 — `.field` access
10. B01 — `cin >>` reads to box

**Q4 (Main Function)**:
1. M11 — `int main() { ... return 0; }`
2. M01 — `const int MAX = 100;`
3. M05 — call `read_X(list, count);`
4. M06 — print loop with printf
5. M02 — declare `X list[MAX];`
6. M04 — `cin >> count;`
7. M07/M08 — printf format specifiers
8. M09 — `.c_str()` for `%s`
9. M10 — printf `\n` for newline
10. F03 — for-loop header

### Cross-question critical atoms (highest training ROI)

| Atom | Q1 | Q2 | Q3 | Q4 | Use |
|------|----|----|----|----|----|
| R01 (`&` = same box) | C | – | C | C | RDS, train first |
| R03 (`&` affects caller) | C | – | C | C | RDS, train first |
| F03 (for-loop header) | C | – | C | C | Used everywhere |
| F04 (loop runs N times) | C | – | C | C | Used everywhere |
| G02 (arr[i]) | C | – | C | C | Used everywhere |
| G06 (.field) | C | C | C | C | Used everywhere |
| B04 (declare type) | C | C | C | C | Used everywhere |
| A06 (`;`) | C | C | C | C | Used everywhere |

**Train these to automaticity** before any composite drilling.

---

## Sequence (Strict Order)

```
[Stage 1] Axioms (Tier 0)
    A01 → A02 → A03 → A04 → A05 → A06 → A07 → A08
    Format: memorize cards only

[Stage 2] Basic Syntax (Tier 1)
    B01 → B02 → B03 → B04 → B05
    Format: memorize + MCQ

[Stage 3] Operators (Tier 2)
    O01 → O02 → O03 → O04 → O05
    Format: memorize + MCQ

[Stage 4] Control Flow (Tier 3)
    F01 → F02 → F03 → F04 → F05 → F06
    Format: memorize + MCQ + simple trace

[Stage 5] Aggregates (Tier 4)
    G01 → G02 → G03 → G04 → G05 → G06 → G07 → G08
    Format: memorize + MCQ + simple trace

[Stage 6] Functions (Tier 5)
    H01 → H02 → H03 → H04 → H05
    Format: memorize + MCQ + trace + write Lv1

[Stage 7] ★ RDS — Pass-by-Reference (Tier 6) ★
    R01 → R02 → R03 → R04 → R05 → R06
    Format: HEAVY DRILLING. memorize + MCQ + trace (pbv vs pbr contrast) + write Lv1-3
    Volume: 2× standard. This is the bottleneck.

[Stage 8] Q1 Composites (Tier 7)
    T01 → T02 → T03 → T04 → T05 → T06 → T07 → T08 → T09
    Format: hand-trace cards (T1 schema, variable-box history)

[Stage 9] Q1 Simulations
    15 Q1 variants. Different array values, different entity, same algorithm.
    Format: full hand-trace, T1 schema.

[Stage 10] Q2 Composites + Sims (Tier 8)
    W01 → W02 → W03 → W04 → W05
    + 15 Q2 variants (different entities, different fields)
    Format: code-write Lv1 → Lv2 → Lv3

[Stage 11] Q3 Composites + Sims (Tier 9)
    K01 → K02 → K03 → K04 → K05 → K06 → K07
    + 15 Q3 variants (different entity, different field count)
    Format: code-write Lv1 → Lv2 → Lv3

[Stage 12] Q4 Composites + Sims (Tier 10)
    M01 → M02 → M03 → M04 → M05 → M06 → M07 → M08 → M09 → M10 → M11
    + 15 Q4 variants
    Format: code-write Lv1 → Lv2 → Lv3

[Stage 13] Mock Exams
    5 full mock exams (Q1+Q2+Q3+Q4, 90-min timer)
    Format: untimed practice → timed simulation
```

**Forward-only.** No back-jumps. No mastery gates. Wrong answer = inline correction + retry once + continue.

---

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Build | Vite 5 | Fast HMR, no config |
| Frontend | React 19 + TypeScript | Type-safe, familiar |
| Styling | Tailwind v4 | Dark mode default |
| State | React `useState` only | No save state needed; session-scoped |
| Storage | None | No localStorage, no backend |
| Grading | Pure JS char-match | Offline, deterministic |
| Build artifact | Static site (`dist/`) | No server, no API |

### File structure

```
src/
├─ data/
│  ├─ atoms.ts          # 67 atoms with metadata + Q1-Q4 tags
│  ├─ templates.ts      # parametric templates (1 per atom)
│  └─ generated.ts      # build-time output: ~1,150 cards
├─ build/
│  └─ generate-cards.ts # variant generator (build script)
├─ types/
│  └─ card.ts           # Memorize | MCQ | Trace | Write
├─ components/
│  ├─ MemorizeCard.tsx  # click-to-reveal-and-type
│  ├─ MCQCard.tsx       # 4 options, 1 correct
│  ├─ TraceCard.tsx     # variable-box history + terminal (T1 reuse)
│  └─ WriteCard.tsx     # 3-level scaffold (fill → complete → free)
├─ pages/
│  └─ Sequence.tsx      # single linear flow page
├─ lib/
│  └─ grading.ts        # char-match logic
└─ App.tsx              # mount Sequence
```

**5 components. 1 page. 1 lib file.** Minimum surface area.

---

## Features Kept

| Feature | Why |
|---------|-----|
| Memorize card (click → type) | User likes; forces production; Miller-friendly |
| MCQ card | Useful for axioms + misconception filters; cap at 20% |
| Variable-box history strip (T1) | Mirrors paper; works for hand-execution |
| Terminal output box (T1) | Separates memory from output state |
| Two-pass trace on same code (T1) | Forces iteration understanding |
| Strict char-match grading (T1) | No "close enough"; matches exam |
| Inline input prompts in code (T1) | Removes ambiguity |
| "Teach Me" recovery on wrong (T1) | Don't fail silently |

## Features Dropped

| Feature | Why |
|---------|-----|
| Save state / localStorage | User explicitly rejects |
| Spaced repetition | 14-day sprint, not long-term |
| Mastery gating | Wastes time when stuck |
| API grading | Token cost, no offline use |
| Mode pickers (sprint/lesson/vocab) | Confusing; one path only |
| Module navigation | Forward-only sequence |
| Cross-device sync (Firebase) | Offline app |
| MCQ-distractor auto-gen scripts | Use templates instead |
| Per-card AI calls | Build-time generation only |
| All IT ELO content | Token waste; new templates only |

---

## Card Difficulty Ranking (Beginner → Advanced)

Per question, cards are ranked by complexity within their stage:

### Q1 (Hand-Trace) Difficulty Ladder

| Level | Card type |
|-------|----------|
| Beg 1 | Trace `int x = 5;` (single assignment) |
| Beg 2 | Trace `int x = 5; int y = x;` (chained) |
| Beg 3 | Trace `arr[0] = 5;` (single index write) |
| Beg 4 | Trace 3-iteration for-loop with counter |
| Int 1 | Trace for-loop modifying array |
| Int 2 | Trace if/else inside for-loop |
| Int 3 | Trace function call with pass-by-value |
| Int 4 | Trace function call with `&` (single int) |
| Int 5 | Trace function call with struct + `&` |
| Int 6 | Trace max-finder loop (without `&`) |
| Adv 1 | Trace `who_am_i`-style: struct + `&` + max-finder |
| Adv 2 | Q1 full simulation (15 variants) |

### Q2 (Struct Write) Difficulty Ladder

| Level | Card type |
|-------|----------|
| Beg 1 | Fill blank: `struct X { int ___; };` |
| Beg 2 | Complete: write 1 field given type+name |
| Beg 3 | Complete: write 3 fields given types+names |
| Int 1 | Free: write struct from spec ("3 fields: id int, name string, age int") |
| Int 2 | Free: write struct with 4 fields |
| Adv 1 | Q2 full simulation (15 entity variants) |

### Q3 (Read Function) Difficulty Ladder

| Level | Card type |
|-------|----------|
| Beg 1 | Fill blank: `void read_X(X &list[], int ___)` |
| Beg 2 | Fill blank: write the for-loop bound |
| Beg 3 | Fill blank: write the cin line |
| Int 1 | Complete: write loop body given signature |
| Int 2 | Complete: write signature given body |
| Int 3 | Free: write `read_X` for 2-field struct |
| Int 4 | Free: write `read_X` for 3-field struct |
| Adv 1 | Q3 full simulation (15 entity variants) |

### Q4 (Main Function) Difficulty Ladder

| Level | Card type |
|-------|----------|
| Beg 1 | Fill blank: `const int MAX = ___;` |
| Beg 2 | Fill blank: write the array declaration |
| Beg 3 | Fill blank: write the function call |
| Int 1 | Complete: write printf line given other lines |
| Int 2 | Complete: write print loop given main shape |
| Int 3 | Free: write main with 2-field struct printf |
| Int 4 | Free: write main with 3-field struct printf |
| Adv 1 | Q4 full simulation (15 entity variants) |

---

## Open Questions for Next Brainstorm

1. **Card-presentation order within a stage**: random shuffle, or sequenced by difficulty ladder? (Sequenced = lower cognitive load. Random = better transfer. Lean sequenced for sprint mode.)
2. **Mock exam frequency**: bunch all 5 at end, or sprinkle through stages 9, 10, 11, 12, 13?
3. **"Teach Me" content**: hand-author per atom (67 explanations), or template ("This is the {ATOM_FACT} concept, used in {Q_LIST}")?
4. **Hand-trace input UI on mobile**: variable-box history strip needs wide screen. Phone fallback?
5. **Paper-transfer practice**: T2 exam is paper-based. Should app include "print this trace, do it on paper, photo it back" mode? (Adds OCR complexity. Maybe v2.)
6. **Variant deduplication**: when generator emits 2 variants that differ only by variable name, count as duplicate or genuine variant? (User said "no duplicate exercises." Probably count as duplicate; force entity-level variation.)

---

## Summary

| Spec | Value |
|------|-------|
| Atoms | 67 |
| Cards | ~1,150 |
| Card types | 4 (memorize, MCQ, trace, write) |
| Word budget per memorize card | ≤7 |
| Stages | 13 |
| Sequence | Strict prereq order, forward-only |
| Mock exams | 5 |
| Q1-Q4 variants | 15 each (60 total) |
| Stack | Vite + React 19 + TS + Tailwind v4 |
| Storage | None (session-only) |
| Grading | Offline char-match |
| API calls runtime | Zero |
| Token cost runtime | Zero |
| Components | 5 |
| Pages | 1 |
| Build artifact | Static site |
