# SIT102 Test 2 — Curriculum Design: Blank Slate → 10/10 Hurdle

**Constraint**: Test 2 = HURDLE. 10/10 required. Anything less = fail.
**Student**: Joshua. Sat blank 2026-05-07. Resits May 14, May 21.
**Audience for this doc**: Curriculum designer (you, Joshua, future-Claude).
**Question this doc answers**: "How do we actually take a blank-slate that can reason but has never seen C++ to mastery of all 4 Test 2 questions in 14 days?"

---

# EXECUTIVE SUMMARY (read first)

| Layer | What | Mechanic |
|---|---|---|
| 1 | **Content mastery** — every token, concept, template | SEE-then-DO ladder per atom (Demo→Decompose→Walkthrough→Trace→Cloze→Write→Procedural) |
| 2 | **Common-error inoculation** — drill the wrong patterns | MCQ distractors mapped to top 30 hurdle-fatal mistakes |
| 3 | **Redundant verification** — 3-4 pass check per question | Per-question checklists baked into exam-day routine |
| 4 | **Time + order management** — Q2 → Q4 → Q3 → Q1 | Strict per-Q budgets, buffer for verification |
| 5 | **Stress mitigation** — scripts, breathing, anti-freeze | Pre-loaded mental scripts rehearsed during practice |

**Frame and slot model**: every Q2/Q3/Q4 answer = a memorized FRAME with substitutable SLOTS. Frame in muscle memory; slots filled from question text. Q1 = procedural memory (5-step trace routine).

**Daily cadence**: 3 sessions × 15min × 14 days = ~10 hours total drill. Distributed > massed. Active recall > re-reading. Interleaved (Q2/Q3/Q4 mixed) > blocked.

**Failure routing**: every card has 3 exits — Pass / Retry / Drop. NO Skip button. Atom never retires until 3-streak passed across sessions.

---

# PART 1 — EXHAUSTIVE BLANK-SLATE GAP INVENTORY

A blank-slate reasoner who can use logic but has never seen code looks at Test 2 and sees foreign hieroglyphics. Below is the complete inventory of what they don't know, organized by dimension. Each gap must be filled.

## 1.1 Vocabulary gaps (~76 tokens)

| Category | Tokens | Confusion |
|---|---|---|
| Keywords | `const int double string void struct for if else return using namespace std include main` | Look like English; are reserved |
| Operators (arithmetic) | `+ - * / %` | `/` truncates for ints |
| Operators (comparison) | `< > <= >= == !=` | `==` ≠ `=` |
| Operators (assignment) | `=` | NOT mathematical equality |
| Operators (special) | `++ -- & << >>` | `&` has 3 meanings; `<<` ≠ `<` |
| Punctuation | `; , . " ' // #` | `;` ends statements; `};` after struct most-forgotten |
| Brackets | `( ) { } [ ]` | Each has 3-4 different contexts |
| Numeric literals | `0 5 100 0.0 2.4 -3.7 -1.7 3.0 2.0 -0.9` | `0` (int) ≠ `0.0` (double) |
| Identifiers (programmer-chosen) | `SIZE stat_double numbers mystery who_am_i data i d desk_data desk_list number_to_read MAX desks desk_num read_desks` | Not keywords — student's choice |
| Library identifiers | `cout cin endl` | From `<iostream>` via `using namespace std` |

## 1.2 Conceptual gaps (~57 concepts)

**Pre-programming (must precede any C++)**:
- What "code" is, what "compile" does, what "run" means
- What memory is (numbered cells), what variables are (labeled boxes)
- What execution order is (top-to-bottom default, with jumps)
- What input/output is (cin/cout, keyboard/screen)
- What "hand execute" means (CPU simulation on paper)
- What types are (int/double/bool/string), why they exist
- What an algorithm is (step-by-step procedure independent of language)

**C++ semantics (must precede syntax)**:
- Variable declaration vs initialization vs assignment
- `=` is store-into-left-from-right (NOT equality)
- Scope (where a variable exists), lifetime (when it exists)
- Functions (named blocks), parameters (passed values), return
- Pass-by-value (copy) vs pass-by-reference (alias via `&`)
- Sequential execution, branching (if), looping (for)
- Operator precedence (`[]` before `>` in compound expressions)
- Arrays (sequence under one name, zero-indexed)
- Structs (compound type with named fields)
- Field access via `.`
- Brace-init populates fields in declaration order

## 1.3 Mechanical gaps (~40 procedures)

**Reading**: identify every `;`-terminated unit; identify every `{...}` block; identify declarations vs executable statements; identify entry point.

**Tracing Q1**: build trace table with columns `i | numbers[i] | condition | action | mystery`; init from brace-init; track function call (alias `data ↔ d`); walk every iteration; report final state.

**Writing Q2**: open `struct`; write name; open `{`; field lines `int name;`; close `};` (BRACE AND SEMICOLON).

**Writing Q3**: parse given signature; declare `int i;`; for-loop with `i < count_param`; cin per field with `desk_list[i].field`.

**Writing Q4**: 3 sections: prompt+cin, function call (no `&`, pass `desk_num` not MAX), print loop with `desk_num` bound; `return 0;`.

## 1.4 Memorization gaps (~80 verbatim units)

| Macro template | Lines |
|---|---|
| Q2 struct full | 5 |
| Q3 read function full | 8 |
| Q4 main full | 15 |
| Q1 trace 5-step procedure | 5 steps |

| Sub-template | Pattern |
|---|---|
| Struct header `struct NAME { ... };` | Frame |
| Function signature `void name(T &param[], int count)` | Frame |
| For-loop `for (i = 0; i < N; i++)` | Frame |
| Const declaration `const int MAX = 100;` | Verbatim |
| Prompt+read pair `cout << "..."; cin >> x;` | Frame |
| Function call `read_desks(desks, desk_num);` | Verbatim |

| Atomic pattern | Mnemonic |
|---|---|
| `int field_name;` | "type space name semicolon" |
| `cin >> arr[i].field;` | "cin streams INTO indexed dot field" |
| `cout << "label: " << value << endl;` | "cout, label-colon-space, value, endl" |
| `for (i = 0; i < N; i++)` | "for paren i zero semi i less N semi i plus plus" |
| `T &name[]` | "type ampersand name brackets" |
| `return 0;` | "always last line of main" |
| `};` | "close brace SEMICOLON — the killer" |

## 1.5 Exam-mechanics gaps

- What the paper looks like (2 pages, Q1 page 1, Q2-Q4 page 2)
- What "hand execute" means as an instruction
- What format trace tables take
- Where to write each answer
- Time budget: 90 min total, ~22 min per Q
- Mark allocation per question
- That HURDLE means every Q must be perfect

## 1.6 Numeric/logic gaps for Q1

| Comparison | Result |
|---|---|
| `2.4 > 0` | true |
| `-3.7 > 0` | **false** |
| `-1.7 > 0` | **false** |
| `3.0 > 0` | true |
| `2.0 > 0` | true |
| `0 > 0` | false (strict) |

| Accumulator step | Value |
|---|---|
| init: data.mystery = 0.0 | 0.0 |
| +2.4 | 2.4 |
| skip -3.7 | 2.4 |
| skip -1.7 | 2.4 |
| +3.0 | 5.4 |
| +2.0 | **7.4** |

**Final answer**: `d.mystery = 7.4`. NOT 6.5 (the -0.9 was overwritten). NOT 1.1 (negatives skipped).

## 1.7 Hurdle-critical gaps (one slip = fail)

**Tier 1 (catastrophic)**:
- Forget `;` after `};` of struct → Q2 fails
- Pass `MAX` not `desk_num` to read_desks → Q4 fails
- `&` at call site `read_desks(&desks, ...)` → Q4 compile error
- Forget `data.mystery = 0.0` overwrites init -0.9 → Q1 wrong (6.5 instead of 7.4)
- `cin << x` instead of `cin >> x` → Q3 silent fail
- Field name mismatch Q2↔Q3↔Q4 → cascade compile fails

**Tier 2 (substantial)**:
- Off-by-one loop bound (`i <= SIZE` vs `i < SIZE`)
- Wrong type for field
- Missing `&` on Q3 reference parameter
- Forget `return 0;` in main
- Wrong direction on streams

**Tier 3 (minor but accumulating)**:
- `Cout` instead of `cout` (case-sensitive)
- Missing `endl`
- Wrong indentation
- Stray `:` instead of `;`

---

# PART 2 — CURRICULUM ARCHITECTURE

## 2.1 The two tracks (READ + WRITE), interleaved

**Track A — READING** (passive → active comprehension):
1. Token recognition (1-3 line snippets)
2. Single-construct snippets (5-10 lines)
3. Two-construct composition
4. Three-construct composition with function bodies
5. Whole-program comprehension at Q1 difficulty
6. Defensive reading — spotting bugs
7. Reading speed — instant pattern classification

**Track B — WRITING** (recognition → cold production):
1. Single-token cloze
2. Multi-token cloze
3. Skeleton recall (TemplateRecall)
4. CodeMemorize (See→Hide→Type)
5. Spec-to-code (StructWrite — Q2)
6. Body-to-code (FunctionWrite — Q3)
7. Section-fill (MainWrite — Q4) + cold-start procedural

**Track C — INTEGRATION**: per-atom interleave (SEE then DO every session); spaced exposure (Day +1, +3, +7); failure routing (TraceCard fail → drop to Walkthrough); hurdle gates (must pass mock at 10/10 before exam).

## 2.2 The vocabulary syllabus — 11 layers (CODE-FIRST, not English-first)

| Layer | Day | New tokens | Example introduction |
|---|---|---|---|
| L0 | 1 AM | `#include <iostream>`, `using namespace std`, `int main()`, `{ }`, `return 0;`, `;` | The empty program skeleton |
| L1 | 1 PM | `cout`, `<<`, `endl`, `"..."` | `cout << "Hello" << endl;` |
| L2 | 2 AM | `=`, `int`, `double`, identifiers, numeric literals (`0`, `0.0`, `2.4`, `-3.7`) | `int i = 5; double d = 2.4;` |
| L3 | 2 PM | `cin`, `>>` | `cin >> x;` (paired with `<<` immediately) |
| L4 | 3 AM | `==`, `<`, `>`, `<=`, `>=`, `!=` | Discriminate `=` vs `==`, `<` vs `<<` |
| L5 | 3 PM | `+`, `-`, `*`, `/`, `%`, `++`, `--` | Integer division gotcha drilled |
| L6 | 4 | `if`, `for`, `&&`, `\|\|`, `,` | for-loop trace cards integrating L0-L5 |
| L7 | 5 | `void`, `const` (functions, references first appearance) | `void greet(const string &name)` |
| L8 | 6 | `[ ]`, array declaration vs access | `double numbers[5]; numbers[0] = 2.4;` |
| L9 | 7 | `struct`, `.` (dot), trailing `};` | `struct desk_data { int x; };` |
| L10 | 8 | `&` (three lives drilled side-by-side with `&&`) | `void f(T &x)` vs `if (a && b)` |
| L11 | 9 | Brace-init, nested `{ {array}, scalar }` | `stat_double d = { {2.4, ...}, -0.9 };` |

**Key principle**: confusable pairs ALWAYS drilled side-by-side from the moment the second member appears. `=`/`==`, `<`/`<<`, `>`/`>>`, `&`/`&&`, `.`/`,` — never in isolation.

## 2.3 The seven exam shapes drilled in Track A

| Shape | Description | Drilled at |
|---|---|---|
| 1 | `read_player(Player &p)` — populate struct | Day 7+ |
| 2 | `read_team(Team &t)` — struct with array field | Day 7+ |
| 3 | `print_player(Player p)` — read struct (no &) | Day 7+ |
| 4 | `sum_positives(Class c)` — Q1 shape, return value | Day 4+ |
| 5 | `read_classes(Class arr[], int count)` — fill struct array | Day 7+ |
| 6 | `print_classes(Class arr[], int count)` | Day 7+ |
| 7 | Full main: prompt + read count + call read + print loop | Day 8+ |

---

# PART 3 — CARD TYPE SPECIFICATIONS

15 card types (post-MatrixCard removal it's 14). Each enforces specific learning principle.

## 3.1 Recognition / Comprehension cards

| Card type | Mechanic | Forces | Used for |
|---|---|---|---|
| **DemoCard** | Show annotated code; space-to-advance | Passive intake (worked example) | First exposure to atom |
| **DecomposeCard** | Multi-select with set-equality grading | Recognition of parts | Validate understanding after Demo |
| **WalkthroughCard** | Reveal-on-space step-by-step + memory state per step | Predict-then-reveal (generation effect) | Active prediction of execution |
| **MCQCard** | Single pick, deterministic shuffle, instant feedback | Discrimination from confusables | Common-mistake inoculation |

## 3.2 Active execution / production cards

| Card type | Mechanic | Forces | Used for |
|---|---|---|---|
| **TraceCard** | Memory boxes + terminal text input; must-pass-to-advance | Hand-execute as exam | Q1 training |
| **ClozeCard** | Inline blanks in code; per-blank char-match | Targeted production | Bridge from recognize to write |
| **WriteCard** | Free-form code editor; layered grading | Cold production | Skill consolidation |

## 3.3 Memorization-focused cards

| Card type | Mechanic | Forces | Used for |
|---|---|---|---|
| **MemorizeCard** | Live exact-match per keystroke; auto-advance on correct | Atomic facts ≤7 tokens | Keywords, atomic patterns |
| **TemplateRecallCard** | 3-stage: Study (30s) → Hide (5s) → Type | Multi-line verbatim recall | Q2/Q3/Q4 templates |
| **CodeMemorizeCard** | See → hide → type verbatim, exact-match | Burn specific snippets into muscle memory | Canonical Q-shape templates |

## 3.4 Q-shape specific cards

| Card type | Mechanic | Used for |
|---|---|---|
| **StructWriteCard** | Sectional grading (keyword, name, fields, semicolons, braces) | Q2 |
| **FunctionWriteCard** | Signature pinned read-only; body editable; key check + forbidden tokens | Q3 |
| **MainWriteCard** | Skeleton given; 3 sections to fill; sectional grading | Q4 |
| **ProceduralCard** | 3-streak gate across 3 variants — single fail resets streak | Final mastery gate before atom retires |

## 3.5 Mechanic principles applied

| Principle | Implementation |
|---|---|
| **Retrieval > re-reading** | Reference text locked behind retrieval (only DemoCard pre-shows answer) |
| **Spacing > massing** | Atom auto-scheduled for Day +1, +3, +7, +10 |
| **Interleaving > blocking** | Mixed review block randomizes across atoms; new material interleaves at card level |
| **Desirable difficulty** | After 3-streak on TraceCard, swaps to WriteCard (harder same atom) |
| **Generation > recognition** | Final gate before "FAMILIAR" is always a generation card |
| **Concrete → abstract** | Open with worked example; abstract pattern shown only after 2-3 instances |
| **Feedback < 100ms** | Every card grades + shows diff in <100ms |
| **No-skip gating** | Only Pass / Retry / Drop. Never Skip. |
| **Sleep consolidation** | Last drill before bed; first drill on wake |
| **Distributed practice** | Engine soft-caps daily volume at 60 min |

---

# PART 4 — 14-DAY SCHEDULE

## 4.1 Day-by-day plan (May 8 → May 21)

| Day | Date | Focus | Deliverable |
|---|---|---|---|
| 1 | May 8 | Pre-programming primer + Layer 0-1 (skeleton + cout) | Empty program from memory |
| 2 | May 9 | Layers 2-3 (variables, types, cin/>>) | First trace card complete |
| 3 | May 10 | Layers 4-5 (comparison, arithmetic, integer division gotcha) | First if-statement trace |
| 4 | May 11 | Layer 6 (for-loops, if), heavy TraceCard drill | First for-loop trace from scratch |
| 5 | May 12 | Layer 7 (functions, void, const) — first Q2 attempt | First Q2 struct write |
| 6 | May 13 | Layer 8 (arrays) — first full mock fragment | Mock attempt 1 (~7/10 target) |
| 7 | May 14 | Layer 9 (structs, dot, `};`) — Q3 first attempt | First Q3 read function |
| | | **(May 14 = ATTEMPT 2 if sitting)** | |
| 8 | May 15 | Layer 10 (& references — three lives drilled) — Q4 first attempt | First Q4 main full |
| 9 | May 16 | Layer 11 (brace-init, nested) — full Q1-shape programs | Mock attempt 2 (≥8/10 target) |
| 10 | May 17 | Spaced review across all 11 layers + bug spotting | Mock attempt 3 (≥9/10 target) |
| 11 | May 18 | Failure remediation; weak-atom drill | Targeted weak-spot fix |
| 12 | May 19 | Full mock under exam conditions (90 min, paper not screen) | Mock 4 (≥9/10) |
| 13 | May 20 | Mock 5 + Mock 6 (final dress rehearsals) | **Mock 6 = 10/10 GATE** |
| 14 | May 21 | Light review only; no new content | **ATTEMPT 3 = real exam** |

## 4.2 Daily session structure

| Block | Duration | What |
|---|---|---|
| Warmup | 5 min | Yesterday's atoms only — retrieval-only (no Demo, no Walkthrough). 6-8 cards. |
| New material | 40 min | Today's 1-2 new atoms running full ladder Demo→Procedural. Interleaved at card level. |
| Mixed review | 10 min | Random sample of past atoms (weighted by spacing schedule). Retrieval-only. |
| Mock fragment | 5 min (Days 8+) | One Q-shape from mock bank. Untimed Day 8 → timed Day 12. |
| Post-session | 1 min | Stats screen: atoms passed/struggling, tomorrow preview. |

## 4.3 Per-atom card sequence (day of introduction)

| Order | Card type | Time | Cumulative |
|---|---|---|---|
| 1 | DemoCard | 1 min | 1 |
| 2 | DecomposeCard | 2 min | 3 |
| 3 | WalkthroughCard | 3 min | 6 |
| 4 | TraceCard | 4 min | 10 |
| 5 | ClozeCard | 3 min | 13 |
| 6 | WriteCard | 5 min | 18 |
| 7 | ProceduralCard (3-streak) | 9 min | 27 |

**Per-atom = ~25-30 min day-of-introduction. With 1 hour/day, ~2 new atoms/day. 14 days × 2 = 28 atoms covered.**

## 4.4 Spacing schedule per atom

| Day offset | Exposures | Card mix |
|---|---|---|
| N (intro) | 4-5 | Full ladder (Demo→Procedural) |
| N+1 | 2-3 | Trace + Cloze + Procedural |
| N+3 | 2 | Cloze + Write |
| N+6 | 1-2 | Write + Procedural |
| N+10 | 1 | Procedural |
| N+13 (test eve) | 0 | Should be automatic |

## 4.5 Failure routing protocol

```
Card X fails:
  → Retry X with hint shown (1st fail)
  → Drop to easier card type for same atom (2nd fail)
       Trace → Walkthrough → Demo
       Write → Cloze → MCQ
  → Rewind to prerequisite atom (3rd fail)
       Engine consults prereq DAG; queue prereq's full ladder
  → Park atom for tomorrow + tag "weak" (4th fail)
```

NO Skip. EVER. Only Retry, Drop, or Park.

---

# PART 5 — HURDLE STRATEGY

## 5.1 The 5-layer 10/10 stack

| Layer | Reduces failure by | What |
|---|---|---|
| 1. Content mastery | 50% | Memorize templates + concepts to muscle memory |
| 2. Common-error inoculation | 50% | Drill the wrong patterns until physically wrong to write |
| 3. Redundant verification | 50% | 3-4 pass check protocol per question |
| 4. Time + order management | 50% | Q2 → Q4 → Q3 → Q1, strict budgets |
| 5. Stress mitigation | 50% | Pre-loaded scripts, breathing protocol, anti-freeze |

Stacked: residual failure probability small enough that **even one bad layer doesn't fail the exam.**

## 5.2 Per-question hurdle strategy

### Q1 (Hand-execute) — 25 min budget

**Strategy**: pattern recognition first → trace atom-by-atom → 3 sanity checks at end.
- Recognize pattern: "sum-of-positives" / "count" / "find-max" / "average"
- Predict answer roughly: "positives = 2.4, 3.0, 2.0 → 7.4"
- Trace table format: columns `iter | i | numbers[i] | condition | action | mystery_after`
- Walk every iteration, 1 row each, never skip
- Sanity check: pattern (positive sum?) → arithmetic verify → type verify

### Q2 (Struct write) — 10 min budget

**Strategy**: memorize 5+ entity templates, drill `};` to muscle memory, triple-check protocol.
- Field count: spec count == struct count
- Field name spelling: char-for-char match
- Trailing `;`: physically tap closing brace, confirm `;`
- Struct name: matches spec exactly

### Q3 (Read function) — 25 min budget

**Strategy**: memorize 12-line skeleton, cross-reference Q2 for field names, NO cout in body.
- `int i;` first
- For-loop bound `i < number_to_read` (NOT MAX)
- Each cin: `cin >> desk_list[i].field;` — index FIRST, dot SECOND
- Field names match Q2 EXACTLY

### Q4 (Main) — 30 min budget

**Strategy**: memorize 18-line canonical, 4 sections, `desk_num` audit (3 places only).
- Section 1: `cout << "Enter number: "; cin >> desk_num;`
- Section 2: `read_desks(desks, desk_num);` (NO `&`, NOT MAX)
- Section 3: `for (int i = 0; i < desk_num; i++) { cout << ... << endl; }`
- Section 4: `return 0;`
- **`desk_num` audit**: appears in EXACTLY 3 places (cin, read_desks call, for bound)

## 5.3 Top failure modes ranked

| Rank | Failure | Where | Severity |
|---|---|---|---|
| 1 | Forget `;` after `}` of struct | Q2 | Catastrophic |
| 2 | Pass `MAX` not `desk_num` to read_desks | Q4 | Catastrophic |
| 3 | `&` at call site `&desks` | Q4 | Catastrophic (compile fail) |
| 4 | Forget `data.mystery = 0.0` overwrite | Q1 | Wrong final (6.5 vs 7.4) |
| 5 | `cin <<` instead of `cin >>` | Q3 | Silent fail |
| 6 | Field name mismatch Q2↔Q3↔Q4 | Cascade | Compile fail |
| 7 | Off-by-one loop bound | Q1, Q3, Q4 | Wrong final |
| 8 | Wrong field type | Q2 | Partial fail |
| 9 | Missing field in struct | Q2 | Fail |
| 10 | Forget `return 0;` | Q4 | Partial fail |

Each gets dedicated drill cards. Tier 1 (1-6): 60% of practice time. Tier 2 (7-10): 30%. Tier 3 (everything else): 10%.

## 5.4 Verification passes per question

**Q1 (3 passes)**: pattern recognize → trace atom-by-atom → arithmetic sanity-check.

**Q2 (4 passes)**: write struct → count fields → check trailing `;` → check field names char-for-char.

**Q3 (3 passes)**: write body → verify each cin (`>>`, `[i].field`, names match Q2) → verify loop bound.

**Q4 (4 passes)**: write 4 sections → `desk_num` audit (3 places) → no `&` at call site → output format matches spec.

Total verification time: ~10 min across all 4 questions. Built into the 90-min budget.

---

# PART 6 — EXAM-DAY ROUTINE

## 6.1 Order: Q2 → Q4 → Q3 → Q1

**Why this order**:
- Q2 first = fastest, easiest, builds momentum (10/10 anxiety crusher)
- Q4 second = high value, uses Q2's field names while fresh
- Q3 third = structurally similar to Q4's read loop
- Q1 last = most error-prone; if overrun, other 3 already in bag

## 6.2 Time budget (90 min)

| Min | Status |
|---|---|
| 0-10 | Q2 done |
| 10-35 | Q4 done |
| 35-60 | Q3 done |
| 60-85 | Q1 done |
| 85-90 | Verification pass (all 4 Qs) |

If a question is taking too long: **write something plausible and move on**. Wrong is recoverable in buffer; blank is not.

## 6.3 Pre-loaded mental scripts (rehearse during practice)

**Script 1 (opening)**: "I open the paper. I read all four questions in 60 seconds. I do not start writing yet. I am scouting. I identify Q2 first. I take a breath. I begin."

**Script 2 (after Q2)**: "Q2 done. That's 10/10 already if I checked the `;`. I have momentum. Q4 next. I have a memorized template. Section by section."

**Script 3 (stuck)**: "I'm stuck. I write what I know. I move on. Will come back. Wrong > blank. I will not freeze."

**Script 4 (time anxiety)**: "It's minute 60 and I'm on Q3. That's fine — Q1 has 25 minutes. I am not behind."

## 6.4 Breathing protocol

Between each question: **30 seconds of breathing**. 4 in, 4 hold, 6 out, 4 hold. Three cycles. Resets autonomic system. Worth the 30 seconds.

## 6.5 The "write something" rule

**No matter what, every question gets ink on it.** Stuck on Q1? Write the trace table headers, even if you can't fill them. Writing primes the brain. A blank page primes more blankness.

## 6.6 Anti-perfectionism rule

Joshua's May 7 failure mode was perfectionism — wanting to know the answer is right before writing anything. **Hurdle exam rewards "good enough first, perfect on review."** Write imperfect, improve in verification pass.

## 6.7 Hurdle-day checklist

**Night before (May 13)**:
- Sleep 8+ hours (NOT all-nighter)
- Light mock done by 6pm
- Pack: 2 pens (different colors), 1 pencil, eraser, ruler, water
- Confirm location KE1.207
- 2 alarms set

**Morning of (May 14)**:
- Wake 2 hours before exam
- Breakfast: protein + complex carbs
- Re-read sections 5.3, 6.3, 6.7 of this doc
- Light review: scan struct templates + Q4 canonical
- Arrive 15 min early

**In room before paper opens**:
- Set up pens, pencil, eraser, ruler
- 3 cycles of breathing protocol
- Mental rehearsal: "Q2 first, Q4 second, Q3 third, Q1 last"

**When paper opens**:
- Read entire paper (60 sec) before writing
- Identify Q2; glance at Q1 pattern
- Write rough time budget on margin

**Per question**: write → verify (per-Q checklist) → move on

**Verification phase (min 85-90)**:
- Q2: trailing `;` confirmed?
- Q4: `desk_num` in exactly 3 places?
- Q3: cin direction `>>`?
- Q1: final arithmetic correct?
- Submit.

---

# PART 7 — STRESS / PSYCHOLOGY FRAMING

## 7.1 The 7 reframes

| Frame | Use when |
|---|---|
| 1. "I have 2 attempts left, not 1" | Anxiety spike |
| 2. "May 14 is the goal. May 21 is insurance" | Don't slack |
| 3. "I've practiced this 50 times. This is rep 51" | Day before / morning of |
| 4. "Lower stakes mentally without lowering prep" | All week |
| 5. "The exam is a known quantity — no surprises" | Walking into room |
| 6. "Failing is not catastrophic — life impact small" | Worst-case spiral |
| 7. "I am not improvising — I retrieve and adapt" | Opening the paper |

## 7.2 Killswitches (escalation triggers)

| Day | Trigger | Action |
|---|---|---|
| 7 (May 10) | Still struggling with Q1 trace | Spend May 11 entirely on Q1 — 30+ practice problems |
| 10 (May 12) | Mock 2 < 7/10 | Identify 3 weakest atoms; spend May 13 on them; consider deferring to May 21 |
| 12 (May 13) | Mock 3 < 9/10 | High-risk for May 14; consider F&R contingency or defer to May 21 |
| 13 (May 14 morning) | Mock 4 < 10/10 | DO NOT panic. Sit May 14 to gather data, plan May 21 as real attempt |

## 7.3 Contingency plans

| Outcome | Plan |
|---|---|
| May 14 = 10/10 | Done. Rest week. |
| May 14 = 9/10 borderline | Same-day F&R if Aaron marks 12:50-14:00; else May 21 |
| May 14 < 9/10 | May 15 rest. May 16-20 targeted drill on failed atoms. May 21 attempt 3. |
| May 14 missed | Counts toward resit policy. May 21 = next attempt. |
| Both fail | Speak to unit chair re: supplementary. Outside scope. |

## 7.4 The Day 1 win

Day 1's session must end with a small, visible accomplishment. Concretely: complete a single TraceCard on `simple-for-loop` correctly — printing 1 to 5 from a hand-trace. Engine displays:

> Day 1 complete. You traced your first loop end-to-end. The same skill works for Q3 on the exam.

No exclamation marks. No emoji. Just the fact. Joshua did a thing he could not do on May 7. **That's the win.**

## 7.5 The Day 7 checkpoint

Halfway through. Engine displays inventory of accomplishment:
> Halfway. You've drilled 14 atoms. You can now: read trace tables, write structs from spec, build for-loops. Days 8-14 are about combining these under exam conditions.

Concrete inventory of what you CAN do is anti-anxiety medicine.

## 7.6 The Day 13 "I've Done This" mock

Day 13's mock paper is **not random**. Engine selects a paper Joshua has previously completed (from Days 8-12), in fresh phrasing. He's not told it's a re-paper. Completes it. Scores well. Post-mock screen reveals: **"You completed a paper in this style on Day 9. You're not approaching this fresh — you've trained for it."**

Reframing a feared first-time event as a *repetition of past success* is one of the highest-leverage anti-anxiety interventions in performance psychology.

---

# PART 8 — IMPLEMENTATION MAPPING (cpp-t2 v2.3)

This curriculum is **already implementable** in the cpp-t2 v2.3 codebase. No new card types needed (14 existing types cover everything).

| Curriculum element | Implementation |
|---|---|
| Engine | `exposure-counter` (1 engine per MANIFEST) — handles per-atom state, spacing, gating |
| Pages | Home (atom roster) + Sequence (linear walker) — exactly the 2 approved pages |
| Card types | 14 types in v2.3 (post MatrixCard removal) — all listed in §3 above |
| Spacing | Per-atom JSON record refreshed on pass/fail; Sequence queries for tomorrow's queue |
| Mock bank | 36 mocks in `data/v2/cards/L5/` — Day 8+ pulls from here |
| Failure routing | Engine consults prereq DAG; auto-drops to easier card type |
| Anti-drift | `npm run lint:drift` ensures no rogue card types added during 14-day push |

**What needs building from this design** (gaps in current v2.3 cards):
1. Per-Layer 0-11 vocabulary syllabus → group cards by layer for daily release
2. Common-mistake MCQ distractors mapped to top 30 hurdle errors
3. SubstitutionCard variant set: 8 entities × 4 templates = 32 variants
4. Mock bank progressive timing (untimed Day 8 → timed Day 12)
5. Day-1-win celebration screen
6. Day-7-checkpoint inventory display
7. Day-13 "you've done this before" reveal
8. Memory boxes auto-revealing on walkthrough cards (W5 from prior session)
9. Pre-loaded mental script reminders embedded between question segments in mocks

These are content + UI additions, not architectural changes.

---

# CLOSING

The May 7 freeze was not a content failure. It was a **process failure** — no script, no order, no checklist. This document fixes the process.

Content is half the battle. The other half is having a routine to fall back on when the brain goes dark.

**The plan**:
1. Fill 310+ blank-slate gaps via SEE-then-DO ladder (Track A + B interleaved).
2. Drill Tier 1 hurdle-fatal mistakes until physically wrong to write.
3. Memorize Q2/Q3/Q4 templates verbatim; Q1 trace procedure verbatim.
4. Run 6+ full mocks before exam day, last one at 10/10 gate.
5. Walk in with pre-loaded scripts, anti-perfectionism rule, breathing protocol.

**The frame**: May 14 is rep 51. Joshua has done this many times in mocks. The exam becomes playback, not creation.

**The bar**: 10/10. No partial credit. No "good enough." Lock it in.

The Q1 V2.0 final answer is **`d.mystery = 7.4`**.

Drill. Verify. Sleep. Show up.
