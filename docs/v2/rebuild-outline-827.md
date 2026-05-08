# Terminal Epistemology Rebuild — 827-Card Outline

**Status**: AWAITING APPROVAL — do not author until user approves.

**What this is**: Complete card-by-card outline for a full rebuild from the 82 bedrock knowledge units identified in `terminal-epistemology-0-to-1.md`. Every card is a terminal WHY/HOW unit. Prerequisite order is strict — no card references knowledge not yet installed.

**Target**: Blank slate (left all 4 answers blank) → mastery (writes all 4 answers perfectly).

**Relationship to existing 2,528 cards**: This is a REPLACEMENT deck, not a patch. The 827 cards below form a self-contained linear walk from zero to mastery. Existing cards may be reused where they match, but the sequence and coverage are rebuilt from scratch.

---

## Summary

| Layer | Scope | Bedrocks | Cards |
|-------|-------|----------|-------|
| 0 | Pre-programming concepts | 6 | 36 |
| 1 | Types + Variables | 8 | 50 |
| 2 | I/O + Comparison operators | 8 | 60 |
| 3 | Control flow (if/for) | 11 | 102 |
| 4 | Compound types (structs + arrays) | 10 | 80 |
| 5 | Functions + References | 10 | 88 |
| 6 | Q1 Hand-Execute Mastery | 12 | 200 |
| 7 | Q2 Struct Write Mastery | 6 | 42 |
| 8 | Q3 Read Function Mastery | 7 | 47 |
| 9 | Q4 Main Function Mastery | 7 | 49 |
| 10 | Integration + Mock Exams | 5 | 73 |
| **TOTAL** | | **~82** | **827** |

**~4,000 encounters**: 827 unique cards × ~5 average exposures via the app's exposure-counter engine = ~4,000 total card encounters, matching the terminal epistemology target.

---

## Per-Layer Outline

### LAYER 0 — Pre-Programming (36 cards)

Bedrocks: program=instructions, computer=dumb-fast, variable=named-storage, value=what's-stored, type=constraint, syntax=grammar-rules.

| Section | Bedrock | Install | Verify | Automate | Total |
|---------|---------|---------|--------|----------|-------|
| 0A | Program = sequence of instructions | 1 Demo | 2 MCQ, 1 Cloze | 1 Procedural | 5 |
| 0B | Computer = dumb but fast executor | 1 Demo | 2 MCQ, 1 Cloze | 1 Procedural | 5 |
| 0C | Variable = named storage box | 1 Demo | 2 MCQ, 2 Cloze | 1 Write | 6 |
| 0D | Value = what's in the box | 1 Demo | 2 MCQ, 1 Cloze | 1 Decompose | 5 |
| 0E | Type = constraint on the box | 1 Demo | 2 MCQ, 2 Cloze | 2 Procedural | 7 |
| 0F | Syntax = grammar rules for code | 1 Demo | 3 MCQ, 1 Cloze | 3 Procedural | 8 |

**Layer 0 pedagogy**: Pure conceptual install. No C++ syntax yet. Analogies (box = variable, recipe = program). Every bedrock gets Demo → MCQ → Cloze → Write/Procedural.

---

### LAYER 1 — Types + Variables (50 cards)

Bedrocks: int, double, string, const, declaration syntax, initialization, assignment, type mismatch.

| Section | Bedrock | Cards | Key content |
|---------|---------|-------|-------------|
| 1A | int = whole numbers | 6 | Demo + MCQ + Cloze + Write |
| 1B | double = decimals | 6 | Demo + MCQ contrast with int |
| 1C | string = text | 6 | Demo + quotes requirement |
| 1D | const = unchangeable | 6 | Demo + MCQ (why SIZE is const) |
| 1E | Declaration = type name; | 7 | Demo + Decompose + Write |
| 1F | Initialization = first value | 6 | Demo + brace-init syntax |
| 1G | Assignment = overwrite | 7 | Demo + Trace (value trail) |
| 1H | Type mismatch = error | 6 | Demo + MCQ (int vs double) |

**Layer 1 pedagogy**: First real C++ syntax. Each type shown with declaration, initialization, assignment. Brace-init `{}` introduced because Q1 uses it for struct init.

---

### LAYER 2 — I/O + Comparison (60 cards)

Bedrocks: cout, cin, <<, >>, endl, >, <, >=, <=, ==, !=, bool result.

| Section | Bedrock | Cards | Key content |
|---------|---------|-------|-------------|
| 2A | cout << = output to screen | 8 | Demo + trace terminal output |
| 2B | cin >> = input from user | 7 | Demo + MCQ (>> vs <<) |
| 2C | << and >> direction | 7 | Demo + Decompose + discrimination |
| 2D | endl = newline | 5 | Demo + trace with/without |
| 2E | > and < strict comparison | 8 | Demo + truth table + Q1 condition |
| 2F | >= and <= inclusive comparison | 7 | Demo + contrast > vs >= |
| 2G | == and != equality/inequality | 7 | Demo + MCQ (= vs ==) |
| 2H | bool result of comparison | 6 | Demo + trace true/false |
| 2I | Comparison in if condition (bridge) | 5 | Demo + preview of Layer 3 |

**Layer 2 pedagogy**: Heavy emphasis on `>` vs `>=` because Q1 trap depends on `> 0` excluding zero. The `= vs ==` discrimination installed early.

---

### LAYER 3 — Control Flow (102 cards)

Bedrocks: if/else, for-loop anatomy (init/test/increment/body), loop counter, i++ semantics, nested if-in-for, accumulator pattern, loop exit value.

| Section | Bedrock | Cards | Key content |
|---------|---------|-------|-------------|
| 3A | if = conditional execution | 8 | Demo + trace both paths |
| 3B | else = alternative path | 6 | Demo + MCQ |
| 3C | for-loop = counted repetition | 10 | Demo + anatomy decompose |
| 3D | init; test; increment order | 10 | Demo + walkthrough + trace |
| 3E | Loop counter (i) | 8 | Demo + trace i through iterations |
| 3F | i++ = post-increment | 6 | Demo + MCQ (when increment happens) |
| 3G | Body executes between test and increment | 8 | Walkthrough + trace |
| 3H | Loop exit: i reaches bound | 8 | Demo + trace (i=5 after i<5 loop) |
| 3I | Nested if inside for | 10 | Demo + trace (filter pattern) |
| 3J | Accumulator pattern | 12 | Demo + trace (sum, count) |
| 3K | Loop trace procedure | 16 | Walkthrough + 8 trace cards |

**Layer 3 pedagogy**: LARGEST foundation layer. 16 trace cards in section 3K alone — the student traces loops with different data before seeing structs or functions. Accumulator pattern (3J) is the direct prerequisite for Q1's sum-of-positives.

---

### LAYER 4 — Compound Types: Structs + Arrays (80 cards)

Bedrocks: array = indexed collection, index starts at 0, [] access, struct = grouped fields, dot access, brace-init for struct, array-in-struct, const SIZE.

| Section | Bedrock | Cards | Key content |
|---------|---------|-------|-------------|
| 4A | Array = indexed collection | 8 | Demo + MCQ + trace |
| 4B | Index starts at 0 | 8 | Demo + MCQ (off-by-one) |
| 4C | [] bracket access | 8 | Demo + Decompose + Write |
| 4D | struct = grouped fields | 8 | Demo + MCQ + Decompose |
| 4E | dot access (d.field) | 8 | Demo + Write |
| 4F | Brace-init for structs | 10 | Demo + Q1 init walkthrough |
| 4G | Array inside struct | 10 | Demo + d.numbers[i] trace |
| 4H | const SIZE pattern | 6 | Demo + MCQ (why const) |
| 4I | struct typedef pattern | 6 | Demo + Write stat_double |
| 4J | Putting it together | 8 | Decompose Q1 struct + init |

**Layer 4 pedagogy**: The student builds up to `stat_double` incrementally. Section 4F (brace-init) and 4G (array-in-struct) directly mirror Q1's initialization. Section 4J decomposes the full Q1 struct declaration + init.

---

### LAYER 5 — Functions + References (88 cards)

Bedrocks: void, function definition, calling (pause-jump-run-back), parameter, & = alias (two names one storage), without & = copy, & in definition only, name(args) syntax, argument fills parameter, trace procedure for calls.

| Section | Bedrock | Cards | Key content |
|---------|---------|-------|-------------|
| 5A | void = returns nothing | 6 | Demo + MCQ + Cloze + Decompose |
| 5B | function = named reusable block | 8 | Demo + MCQ + Walkthrough + Trace |
| 5C | calling = pause, jump, run, back | 8 | Demo + Walkthrough + Trace |
| 5D | parameter = named input slot | 8 | Demo + MCQ + Decompose + Write |
| 5E | & = alias (two names, one storage) | 14 | Demo×2 + MCQ×3 + Cloze×2 + Walk + Trace×3 + Write + CodeMem + Proc |
| 5F | WITHOUT & = copy, changes die | 12 | Demo + MCQ×2 + Trace×3 + Walk + Write + Proc |
| 5G | & in DEFINITION only, no & at call | 10 | Demo + MCQ×3 + Cloze×2 + Walk + Write + Proc |
| 5H | name(args); = function call | 6 | Demo + MCQ + Cloze×2 + Write |
| 5I | argument fills parameter, with & = same | 8 | Demo + MCQ×2 + Trace×2 + Cloze + Walk + Proc |
| 5J | trace procedure for function calls | 8 | Demo + MCQ×2 + Cloze + Walk + Trace×2 + Proc |

**Layer 5 pedagogy**: Section 5E (& = alias) is the deepest concept — 14 cards with Margaret/Maggie analogy, side-by-side memory diagrams, 3 trace variants. Section 5F (no & = copy) provides the COUNTER-concept with explicit same-body-different-outcome traces.

---

### LAYER 6 — Q1 Hand-Execute Mastery (200 cards)

**THE LARGEST LAYER. The student traces the Q1 algorithm ~40 times with varied data.**

| Section | Topic | Cards |
|---------|-------|-------|
| 6A | Assignment destroys old value | 8 |
| 6B | Functions can overwrite init values | 8 |
| 6C | 5-step trace algorithm | 12 |
| 6D | Table = external brain (working memory) | 6 |
| 6E | **TRAP: -0.9 overwritten to 0.0** | 12 |
| 6F | **TRAP: > 0 excludes zero** | 8 |
| 6G | **TRAP: loop exits at i=5, not i=4** | 8 |
| 6H | Sum-of-positives pattern recognition | 16 |
| 6I | Full V2.0 walkthrough (12 step-by-step) | 12 |
| 6J-6Q | **8 entity-variant trace sets** | 56 |
| 6R | Pattern recognition: which algorithm? | 10 |
| 6S | Anti-perfectionism-freeze | 6 |
| 6T | False proximity (code looks like English) | 6 |
| 6U | 12 additional full traces + 12 review | 24 |
| 6V | Timed procedural gates (3-streak) | 8 |

Entity variants in 6J-6Q (prevents slot fusion — student can't just memorize "mystery = 7.4"):
- stat_float (sum-positive, different field names)
- stat_int (sum-positive, integer arithmetic)
- data_box (find-max pattern)
- stats_pkg (average pattern)
- record_set (count-positive pattern)
- metric_bag (find-max variant)
- score_sheet (count >= threshold)
- temp_log (find-min pattern)

**Layer 6 pedagogy**: After this layer the student can trace ANY Q1-shaped program cold. The 3 trap sections (6E/6F/6G) each have 8-12 cards drilling the exact mistake path. 5 algorithm patterns (sum-positive, find-max, count-positive, average, find-min) generalize beyond the specific Q1 question.

---

### LAYER 7 — Q2 Struct Write Mastery (42 cards)

Q2 asks: "Write the struct definition for desk_data."

| Section | Topic | Cards |
|---------|-------|-------|
| 7A | struct keyword + name + braces + semicolon | 8 |
| 7B | Field declarations inside struct | 8 |
| 7C | Array field inside struct | 6 |
| 7D | Complete struct from spec | 8 |
| 7E | Entity variants (printer, book, vehicle, employee) | 8 |
| 7F | Cold-write gate: struct from English spec | 4 |

**Layer 7 pedagogy**: Build up from keyword → fields → array field → complete struct. 4 entity variants prevent desk_data memorization. Gate: write a struct cold from an English description.

---

### LAYER 8 — Q3 Read Function Mastery (47 cards)

Q3 asks: "Write read_desks — a void function that reads desk_data from user input."

| Section | Topic | Cards |
|---------|-------|-------|
| 8A | Function header: void + name + params | 6 |
| 8B | for-loop over array with cin >> | 8 |
| 8C | Reading struct fields in correct order | 8 |
| 8D | Complete read function from spec | 8 |
| 8E | Entity variants (printer, book, vehicle, employee) | 9 |
| 8F | Cold-write gate: read function from English spec | 4 |
| 8G | Common mistakes (wrong loop bound, missing &) | 4 |

**Layer 8 pedagogy**: Builds on Layer 5 (functions) + Layer 4 (structs/arrays). The read pattern is: loop → prompt → cin >> field. Entity variants rotate field names/types.

---

### LAYER 9 — Q4 Main Function Mastery (49 cards)

Q4 asks: "Write main — declare array, call read_desks, call who_am_i for each, print results."

| Section | Topic | Cards |
|---------|-------|-------|
| 9A | main() structure: int main() { ... return 0; } | 6 |
| 9B | Declare array of structs | 6 |
| 9C | Call read function with array | 6 |
| 9D | for-loop calling process function per element | 8 |
| 9E | Print results with cout | 6 |
| 9F | Complete main from spec | 8 |
| 9G | Entity variants (printer, book, vehicle, employee) | 5 |
| 9H | Cold-write gate: main from English spec | 4 |

**Layer 9 pedagogy**: The most compositional layer — main orchestrates everything from Layers 4-8. Section 9D (loop calling function per element) is the key pattern. Entity variants ensure generalization.

---

### LAYER 10 — Integration + Mock Exams (73 cards)

| Section | Topic | Cards |
|---------|-------|-------|
| 10A | Cross-question: struct flows through Q2→Q3→Q4 | 8 |
| 10B | Full mock exam #1 (all 4 Qs, desk entity) | 16 |
| 10C | Full mock exam #2 (all 4 Qs, printer entity) | 16 |
| 10D | Full mock exam #3 (all 4 Qs, book entity) | 16 |
| 10E | Exam strategy: time allocation + order | 6 |
| 10F | Anti-freeze reinforcement | 5 |
| 10G | Final confidence calibration | 6 |

**Layer 10 pedagogy**: 3 full mock exams with different entities. Each mock = 4 cards (one per question) × 4 phases (attempt → check → fix → retry). Section 10E teaches the 90-minute time budget (Q1: 20min, Q2: 15min, Q3: 25min, Q4: 25min, review: 5min).

---

## Card Type Distribution

| Type | Count | % |
|------|-------|---|
| DemoCard | ~90 | 11% |
| MCQCard | ~180 | 22% |
| ClozeCard | ~120 | 15% |
| DecomposeCard | ~30 | 4% |
| WalkthroughCard | ~60 | 7% |
| TraceCard | ~160 | 19% |
| WriteCard | ~50 | 6% |
| ProceduralCard | ~70 | 8% |
| CodeMemorizeCard | ~20 | 2% |
| TemplateRecallCard | ~15 | 2% |
| StructWriteCard | ~12 | 1% |
| FunctionWriteCard | ~10 | 1% |
| MainWriteCard | ~10 | 1% |
| **Total** | **~827** | **100%** |

**Install (Demo) = 11%** vs old deck's ~3%. The terminal epistemology analysis identified "install-starved" as the #1 structural problem — this rebuild fixes it.

**Verify (MCQ+Cloze+Decompose) = 41%**. Verification is the bridge between seeing and producing.

**Automate (Trace+Write+Procedural+CodeMem+Template+StructWrite+FuncWrite+MainWrite) = 48%**. Production is the goal.

---

## Key Design Decisions

1. **No card references knowledge not yet installed.** Strict dependency graph. A Layer 3 card never mentions structs (Layer 4) or functions (Layer 5).

2. **Every bedrock gets the full ladder**: Demo (install) → MCQ/Cloze (verify) → Trace/Write/Procedural (automate). No bedrock is verify-only or automate-only.

3. **8 entity variants** across Q2-Q4 prevent slot fusion. The student learns to write structs/functions for ANY entity, not just desk_data.

4. **Layer 6 is intentionally huge** (200 cards, 24% of total). Q1 hand-execution is the most demanding skill and the most likely to fail under exam pressure. The 40+ trace repetitions with varied data build the automaticity needed to trace under time pressure.

5. **3 explicit trap sections** (6E/6F/6G) inoculate against the exact mistakes that cause wrong answers: starting from -0.9 instead of 0.0, including zero in > 0 filter, thinking the loop exits at i=4.

6. **Anti-freeze and false-proximity cards** (6S/6T) are metacognitive — they address the blank-page behavior directly ("wrong > blank", "don't read C++ like English").

7. **3 full mock exams** in Layer 10 with different entities. Each mock practices all 4 questions in exam conditions.

---

## What This Replaces

- Current 2,528 YAML cards in `data/v2/cards/` → replaced by 827 cards in strict prerequisite order
- Current L0-L5 level structure → replaced by L0-L10 (10 layers matching the dependency graph)
- `atoms-to-author.md` gap-fill plan (316 cards) → superseded
- `implementation-plan-terminal-epistemology.md` (368 cards) → superseded
- `test2-zero-to-mastery.md` (~1,420 estimate) → this is the concrete realization (827 unique cards × ~5 exposures ≈ 4,000 encounters)

---

## Next Steps (after approval)

1. Author YAML cards layer by layer (L0 → L10)
2. Each layer: write cards → lint → test in app → checkpoint with user
3. Existing cards reused where content matches (saves authoring time)
4. New entity-variant cards hand-authored (no AI generation)
5. Final mock exams authored last (require all other layers complete)
