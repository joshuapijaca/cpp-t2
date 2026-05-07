# cpp-t2 Test-2-Specific Redesign v2.1 — DEEP PLAN

**Status:** DRAFT v2.1 (post-code editor + exposure-freq pivot) — pending user authorization
**Date:** 2026-05-07 (post-attempt-1, pre-resit 2026-05-14)
**Author:** Synthesized from 10 parallel agents + user direction
**Supersedes:** v1, v2 of this doc + `15_l1_l12_redesign_plan.md`

---

## REVISION HISTORY

### v2.1 (2026-05-07 evening) — Pivot to code editor + exposure-frequency
1. **Continuum framing locked:** BLENDED. L0 serial → L1-L4 parallel (~70% atom overlap) → L5 serial. Card multi-tagging → progress leaks across Qs → ~30% work reduction.
2. **UX paradigm: code editor everywhere.** Trace = code-left + variables panel right + terminal bottom. Write = full editor (monospace, syntax highlight, line numbers, brace-match, auto-indent, inline diff). Production drill = code editor + Q1-Q4 tabs (no countdown). **ZERO paper, ZERO photo upload, ZERO physical world. ZERO timers (removed 2026-05-07).**
3. **L0 patch swap:** Paper-trace → code editor trace primer. Read-aloud → sub-vocal eval (predict in head before [step]). Brace-match kept.
4. **Spaced repetition DROPPED → exposure-frequency model:**
   - Short cards: 6 target exposures
   - Medium cards: 8
   - Long cards: 12
   - State: NEW → IN-PROGRESS → FAMILIAR (retired at ≥target + last 3 correct)
   - Familiarity % = (correct exposures / target) × 100
   - No SRS, no Leitner, no SM-2, no intervals. Just counters.
   - Draw order: 60% NEW from current stage / 30% IN-PROGRESS low-familiarity / 10% random FAMILIAR sanity / end-of-session 30 cards <50% catch-up.
5. **Goal reframe:** "Mastery" → **familiarity %**. 0% → 100% on May 14 readiness, not lifelong retention.

### v2 (2026-05-07 afternoon) — Deep plan synthesis
- 5 round-2 parallel agents (L0 deep, Q1 deep, Q2 deep, Q3+Q4 deep, L5 + verification)
- Card budget reallocated: 2,400 → 2,460 (+90 L0 patches, -50 L1 cushion)
- Verdict: MEDIUM-HIGH (70%) → HIGH (85%) with 4 patches

### v1 (2026-05-07 morning) — Initial test-2-specific redesign
- 5 round-1 parallel agents (curriculum, templates, card types, ultralearning, cull audit)
- 19 levels → 6 (L0-L5)
- 2,811 cards → 2,400 target

---

## EXECUTIVE SUMMARY

**Goal frame:** **0% → 100% familiarity** (NOT mastery, NOT retention). Familiarity = exposure count × correctness, capped at target.

**Design model:**
- **Continuum type:** BLENDED. L0 serial → L1-L4 parallel verticals with ~70% atom overlap → L5 serial integration.
- **UX paradigm:** code editor everywhere. Code editor + variables panel + simulated terminal. ZERO paper dependency.
- **Scheduling:** Exposure-frequency counters, NOT spaced repetition.

**Design verdict:** MEDIUM-HIGH confidence (70% probability of ≥85% on Test 2). Bumps to HIGH (~85%) with 4 patches.

**Reallocated card budget:** 2,460 total cards across 6 levels (L0-L5).

| Level | Name | Cards | Atoms | Hours |
|---|---|---|---|---|
| L0 | Foundation (shared atoms) | 690 | 22 | ~5.5h |
| L1 | Q1 Hand-execute | 650 | 22 | ~7h |
| L2 | Q2 Write struct | 240 | 10 | ~3h |
| L3 | Q3 Write read fn | 390 | 15 | ~5h |
| L4 | Q4 Write main | 380 | 20 | ~4.5h |
| L5 | Mock + verification | 110 | n/a | ~3h |
| **TOTAL** | | **2,460** | **89** | **~28h** |

---

## PART I — STRATEGIC FRAMING

### 1.1 Core Insight

Test 2 = **4 templated questions** with invariant skeleton + variable algorithm/entity slot. Confirmed across:
- Practice test (computer_data, find-max algorithm)
- Real test V2.0 attempt 1 (desk_data, sum-positives algorithm)

Skeleton is fixed. Only entity name, field count, algorithm condition, accumulator action vary.

**App must drill vertical depth on those 4 templates, not breadth across SIT102 unit content.**

### 1.2 From 19 Levels → 4 Vertical Tracks + Foundation + Mock (BLENDED CONTINUUM)

```
                    [L0 FOUNDATION — 22 atoms]
                         serial gate (5.5h)
                              │
                              ▼
        ┌────────────┬────────────┬────────────┬─────────────┐
        ▼            ▼            ▼            ▼             │
     [L1 Q1]     [L2 Q2]      [L3 Q3]      [L4 Q4]          │
   Hand-execute Write struct  Write read   Write main        │
   650 cards    240 cards     390 cards    380 cards        │
        │            │            │            │             │
        └─── ~70% atom overlap (cards multi-tagged) ──┘     │
                              │                              │
                              ▼                              │
                  Gate: 3 of 4 at S4+                        │
                              │                              │
                              ▼                              │
                       [L5 MOCK]                             │
                serial integration (110 cards)               │
```

**Continuum properties:**
| Aspect | Type |
|---|---|
| L0 → Qs | **Serial** — foundation gates verticals |
| L1 vs L2 vs L3 vs L4 | **Parallel** with ~70% atom overlap |
| Within each Q (S1→S6) | **Pure linear continuum** |
| Q-tracks → L5 mock | **Serial** — mocks gate on 3-of-4 at S4+ |

**Card multi-tagging:** Most cards serve 2+ Qs. Example: a card drilling `arr[i].field` is tagged Q1 + Q3 + Q4. Familiarity counter increments across all tagged Qs simultaneously → progress on Q2 leaks to Q3/Q4 automatically.

**Implication:** Total exposures needed < (sum of per-Q exposures). Overlap reduces work by ~30%.

### 1.3 Stage Pattern (each Q-track follows same 6-stage progression)

| Stage | Name | What student does | Familiarity gate |
|---|---|---|---|
| **S1** | TOUR | See full Q + correct answer in code editor. No input. | 100% click-through |
| **S2** | TEMPLATE | code editor retypes skeleton from memory (study → hide → type). | 95% verbatim across exposures |
| **S3** | COMPONENTS | Drill each piece in isolation in code editor. | 90% per skill |
| **S4** | COMPOSE | Write whole Q in code editor from 1-line prompt. | 90% production |
| **S5** | VARIATIONS | Apply pattern to novel entity/algorithm. | 85% transfer |
| **S6** | PRODUCTION | Full-Q in code editor at student's own pace. No timer. | 90% accuracy |

L0 Foundation is **flat** (no S1-S6 internally) — atom-level mini-arcs handle progression.

**All "mastery" thresholds = familiarity thresholds.** No retention testing. Student hits target exposure count with target accuracy → atom retires. Goal is May 14 readiness, not lifelong recall.

---

## PART II — L0 FOUNDATION DEEP PLAN (690 cards, 22 atoms)

### 2.1 Atom List (Strict Prereq Order)

22 atoms in 5 phases. IDs F-NN.

| # | ID | Name | Teaches |
|---|---|---|---|
| **Phase A — What code IS** | | | |
| 1 | F-01 | Source code is plain text | `.cpp` is editable text. Compiler reads, human writes. |
| 2 | F-02 | Compiler turns source into program | `g++ file.cpp -o prog`. Source ≠ running program. |
| 3 | F-03 | Hand-execution paradigm | Simulate program with pen + variable boxes. THIS is Test 2's Q1. |
| **Phase B — Skeleton scaffolding** | | | |
| 4 | F-04 | `#include <iostream>` | Brings cout/cin into file. Above main. |
| 5 | F-05 | `using namespace std;` | Removes std:: prefix. Idiomatic SIT102. |
| 6 | F-06 | `int main()` and `return 0;` | Entry point. Returns 0 on success. |
| 7 | F-07 | Statement terminator: semicolon | Every statement ends `;`. #1 novice error. |
| 8 | F-08 | Block delimiters: `{` and `}` | Braces group statements. |
| **Phase C — Data + I/O** | | | |
| 9 | F-09 | Identifier rules + naming | snake_case. Keywords reserved. |
| 10 | F-10 | Primitive types: `int`, `double`, `string` | Type semantics. `<string>` for string. |
| 11 | F-11 | Variable declaration + initialisation | `int x;` declares; `int x=5;` initialises. |
| 12 | F-12 | Assignment `=` | Single `=` writes. RHS first then store in LHS. |
| 13 | F-13 | `cout` chained output | `cout << a << b << endl;`. Left to right. |
| 14 | F-14 | `cin >> var` token semantics | Reads one whitespace-delimited token. Type-converts. |
| 15 | F-15 | Prompt-then-read pair | `cout << "X: "; cin >> x;`. Used in Q3, Q4. |
| **Phase D — Control flow** | | | |
| 16 | F-16 | Comparison operators | `==`, `!=`, `<`, `>`, `<=`, `>=`. = vs == confusion. |
| 17 | F-17 | `if (cond) { ... }` (no else) | Body runs iff cond true. Q1 algorithm gate. |
| 18 | F-18 | `for (int i=0; i<N; i++)` counting loop | Init/test/increment. Q1, Q3, Q4. |
| **Phase E — Compound data + functions** | | | |
| 19 | F-19 | Fixed-size array `T arr[N];` | N must be compile-time const. Indices 0..N-1. |
| 20 | F-20 | `struct` definition (multi-field) | `struct Name { type field; };`. Trailing `;`. |
| 21 | F-21 | Dot access `obj.field` | Read/write field. Combines with `arr[i].field`. |
| 22 | F-22 | Function def + params + pass-by-ref | `void name(Type &p) {}`. `&` mutates caller's var. |

### 2.2 Per-Atom Card Breakdown (419 base + 90 patch + 181 buffer = 690)

| ID | Walk | Demo | Decomp | Trace | Cloze | μ-Write | TmplRec | MCQ | Proc | **Total** | Used by |
|---|---|---|---|---|---|---|---|---|---|---|---|
| F-01 | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 3 | 0 | **6** | All Q |
| F-02 | 1 | 1 | 1 | 0 | 0 | 0 | 0 | 3 | 0 | **6** | All Q |
| F-03 | 2 | 2 | 2 | 4 | 0 | 0 | 0 | 2 | 0 | **12** | Q1 (heavy), Q4 |
| F-04 | 1 | 2 | 2 | 0 | 4 | 3 | 2 | 2 | 0 | **16** | Q3, Q4 |
| F-05 | 1 | 2 | 1 | 0 | 3 | 2 | 1 | 2 | 0 | **12** | Q3, Q4 |
| F-06 | 2 | 3 | 3 | 2 | 4 | 3 | 3 | 2 | 2 | **24** | Q4 primary |
| F-07 | 1 | 2 | 2 | 0 | 4 | 4 | 0 | 3 | 1 | **17** | All Q |
| F-08 | 1 | 2 | 2 | 0 | 3 | 3 | 0 | 2 | 1 | **14** | All Q |
| F-09 | 1 | 2 | 2 | 0 | 2 | 2 | 0 | 3 | 0 | **12** | All Q |
| F-10 | 2 | 3 | 3 | 0 | 4 | 3 | 1 | 3 | 1 | **20** | All Q |
| F-11 | 2 | 3 | 3 | 3 | 4 | 4 | 1 | 2 | 1 | **23** | Q1, Q3, Q4 |
| F-12 | 1 | 2 | 2 | 4 | 3 | 3 | 0 | 3 | 1 | **19** | Q1, Q4 |
| F-13 | 2 | 3 | 3 | 3 | 4 | 4 | 1 | 2 | 1 | **23** | Q3, Q4 |
| F-14 | 2 | 3 | 3 | 3 | 4 | 4 | 1 | 3 | 1 | **24** | Q3, Q4 |
| F-15 | 2 | 3 | 2 | 2 | 4 | 5 | 2 | 1 | 2 | **23** | Q3, Q4 |
| F-16 | 1 | 2 | 2 | 2 | 3 | 3 | 0 | 3 | 1 | **17** | Q1 |
| F-17 | 2 | 3 | 3 | 4 | 4 | 4 | 1 | 2 | 1 | **24** | Q1 primary |
| F-18 | 2 | 3 | 3 | 5 | 5 | 4 | 1 | 2 | 1 | **26** | Q1, Q3, Q4 |
| F-19 | 2 | 3 | 3 | 4 | 4 | 4 | 1 | 2 | 1 | **24** | Q1, Q3, Q4 |
| F-20 | 2 | 3 | 3 | 0 | 5 | 5 | 2 | 2 | 1 | **23** | All Q |
| F-21 | 2 | 3 | 3 | 4 | 4 | 4 | 1 | 2 | 1 | **24** | Q1, Q3, Q4 |
| F-22 | 2 | 4 | 4 | 4 | 5 | 5 | 2 | 3 | 1 | **30** | Q1 param, Q3 |
| **Σ base** | 34 | 53 | 51 | 44 | 73 | 69 | 20 | 52 | 18 | **419** | |

### 2.3 L0 Patch (+90 cards — code editor, NO paper)

| Sub-stage | Cards | Drill |
|---|---|---|
| **Sim-trace primer** | 30 | code editor-style variables panel. Student clicks [step], variables update live. NO paper, NO photo. |
| **Sub-vocal eval** | 30 | Read-aloud-OR-silent-mouth: card requires student to predict next state in head before clicking [step]. Pure mental rehearsal. |
| **Brace-match** | 30 | Visual MCQ: highlight matching `{`/`}` pairs in nested code. Color-coded depth indicator. |

### 2.4 L0 Atom DAG

```
F-01 (source=text) → F-02 (compiler) → F-03 (hand-exec) ─→ Q1 trace
                              │
                              ↓
        F-04 → F-05 → F-08 (braces) ←──┐
                       │               │
                     F-06 (main + return 0) ─→ Q4 skeleton
                       │
                     F-07 (semicolon)
                       │
                     F-09 (identifiers)
                       │
                     F-10 (int/double/string)
                       │
                  ┌────┴────┐
                  ↓         ↓
              F-11 (decl)  F-20 (struct) ─→ Q2 primary
                  │         │
                F-12 (assign)│
                  │         │
                F-13 (cout) │
                  │         │
                F-14 (cin)  │
                  │         │
                F-15 (pair)─────────────→ Q3, Q4 read loops
                  │         │
                F-16 (compare)
                  │         │
                F-17 (if)──────────────→ Q1 algorithm gate
                  │         │
                F-18 (for)─────────────→ Q1, Q3, Q4
                  │         │
                F-19 (array) ←──── (combines)
                  │         │
                  └────┬────┘
                       ↓
                F-21 (arr[i].field) ──→ Q1, Q3, Q4
                       │
                F-22 (pass-by-ref) ────→ Q1 param, Q3 read fn
                       │
                ═══ L0 EXIT GATE ═══
                  ≥80% avg accuracy
                       │
        ┌──────────┬───┴───┬──────────┐
        ↓          ↓       ↓          ↓
       Q1         Q2      Q3          Q4
```

**Critical-path observation:** Longest dependency chain = 14 atoms deep. F-22 (pass-by-ref) has 14 transitive prereqs. **Q3 is hardest Q-track to start** — sequence third in daily plan.

### 2.5 L0 Mastery Gates

- Per-atom: ≥70% on last 5 cards before next atom unlocks
- L0 exit: ≥80% average across all 22 atoms before any Q-track unlocks
- Card-type mini-arc within atom: walkthrough → demo → decompose → cloze → μ-write → trace → mcq

### 2.6 L0 Time Estimate (5.5h for 0-prior student)

| Phase | Atoms | Cards | Rate | Hours |
|---|---|---|---|---|
| A — What code IS | F-01..F-03 | 24 | 50/hr | 0.5 |
| B — Skeleton | F-04..F-08 | 83 | 80/hr | 1.0 |
| C — Data + I/O | F-09..F-15 | 144 | 85/hr | 1.7 |
| D — Control flow | F-16..F-18 | 67 | 80/hr | 0.8 |
| E — Struct/array/fn | F-19..F-22 | 101 | 75/hr | 1.4 |
| Patch (paper/read-aloud/braces) | — | 90 | 80/hr | 1.1 |
| Buffer + retries | — | ~181 | — | 1.0 |
| **Total** | | **690** | | **~5.5h** |

---

## PART III — L1 Q1 HAND-EXECUTE DEEP PLAN (650 cards, 6 stages)

### 3.1 Stage Overview

| Stage | Cards | Mastery Gate | Goal |
|---|---|---|---|
| S1 TOUR | 32 | 100% click-through | Mental model end-to-end |
| S2 TEMPLATE | 124 | 95% verbatim type-back | Muscle memory for skeletons |
| S3 COMPONENTS | 248 | 90% per skill | Atomic execution primitives |
| S4 COMPOSE | 152 | 90% full-trace | Full algorithm fluency |
| S5 VARIATIONS | 60 | 85% transfer | Generalization |
| S6 PRODUCTION | 34 | 90% accuracy | Full-Q fluency (untimed) |
| **Total** | **650** | | |

### 3.2 S1 TOUR (32 cards)

| Block | Cards | Content |
|---|---|---|
| The Q1 genre | 1 | Annotated screenshot of practice Q1 |
| Practice Q + answer | 2 | Find-max walkthrough with `{2.5, 7.1, 3.0, 4.8, 1.2}` |
| Real V2.0 Q + answer | 2 | Sum-positives walkthrough with `{1.0, -2.0, 3.5, -1.0, 2.0}` |
| Anatomy: struct, array field, scalar field, function sig, pre-loop init, for-header, if-guard, if-action, brace-init, function call | 10 | Annotated diagrams |
| Memory box format (empty, post-init, mid-trace, final) | 4 | Drawing layout |
| Strikethrough notation | 1 | History trail `~~0.0~~ 1.0 ~~1.0~~ 4.5` |
| Narrated trace step 1-6 | 6 | Pre-loop init → loop iter → exit → final read |
| Wrong answers (5 spot-error variants) | 5 | Common mistake genre |
| Stage promise | 1 | "After S2-S6, you can do this in 90s" |

### 3.3 S2 TEMPLATE (124 cards)

| Template | Lines | Cards | Drill style |
|---|---|---|---|
| T-A: struct decl `struct stat_double { double numbers[SIZE]; double mystery; };` | 4 | 18 | Whole, 1-line cloze, 2-line cloze |
| T-B: function sig `void who_am_i(stat_double &data) {` | 1 | 14 | Whole, `&` cloze, param-name cloze |
| T-C: pre-loop init `data.mystery = INIT;` | 1 | 12 | Vary INIT (0.0, numbers[0], -1.0) |
| T-D: for-header `for (int i = 0; i < SIZE; i++) {` | 1 | 22 | Whole, init/guard/post cloze |
| T-E: if-action `if (...) { data.mystery = ...; }` | 3 | 24 | Whole, condition/action cloze |
| T-F: brace-init `stat_double d = {{...}, init};` | 1 | 18 | Vary values, brace-cloze |
| T-G: function call `who_am_i(d);` | 1 | 8 | Vary variable name |
| T-COMBO: full mini-program | 18 | 8 | Type whole program from blank |

### 3.4 S3 COMPONENTS (248 cards — atomic mental ops)

| Skill ID | Cards | What it drills |
|---|---|---|
| C-01 | 12 | Parse outer brace = struct |
| C-02 | 14 | Parse inner brace = array elements |
| C-03 | 16 | Map values to indices |
| C-04 | 8 | Draw 5 array cells |
| C-05 | 4 | Draw 1 scalar cell |
| C-06 | 18 | Fill cells from brace-init |
| C-07 | 8 | Execute pre-loop init `mystery = 0.0` |
| C-08 | 10 | Execute pre-loop init `mystery = numbers[0]` |
| C-09 | 6 | Read for-loop init `int i = 0` |
| C-10 | 12 | Evaluate `i < SIZE` (true) |
| C-11 | 8 | Evaluate `i < SIZE` (false → exit) |
| C-12 | 10 | Execute `i++` |
| C-13 | 12 | Order: header → body → post |
| C-14 | 14 | Evaluate `data.numbers[i]` |
| C-15 | 6 | Evaluate `data.mystery` |
| C-16 | 14 | Evaluate `numbers[i] > mystery` |
| C-17 | 12 | Evaluate `numbers[i] > 0` |
| C-18 | 8 | Evaluate `numbers[i] < 0` |
| C-19 | 6 | Evaluate `numbers[i] % 2 == 0` (primer) |
| C-20 | 8 | Take if-branch when true |
| C-21 | 8 | Skip if-branch when false |
| C-22 | 10 | Mutation: `mystery = numbers[i]` |
| C-23 | 14 | Mutation: `mystery = mystery + numbers[i]` |
| C-24 | 8 | Mutation: `mystery = mystery * numbers[i]` |
| C-25 | 8 | Mutation: `count = count + 1` |
| C-26 | 8 | Strikethrough notation |
| C-27 | 6 | Trail-of-three on same cell |
| C-28 | 4 | End-of-loop: read final mystery |
| C-29 | 6 | Don't mutate array cells |
| C-30 | 4 | Pass-by-ref = same memory |

### 3.5 S4 COMPOSE (152 cards — 12 algorithm variants)

| Algo | Init | Condition | Action | Cards |
|---|---|---|---|---|
| A1 find-max | `numbers[0]` | `numbers[i] > mystery` | `mystery = numbers[i]` | 14 |
| A2 find-min | `numbers[0]` | `numbers[i] < mystery` | `mystery = numbers[i]` | 12 |
| A3 sum-all | `0.0` | `true` | `mystery += numbers[i]` | 12 |
| A4 sum-positive | `0.0` | `numbers[i] > 0` | `mystery += numbers[i]` | **16** (real exam) |
| A5 sum-negative | `0.0` | `numbers[i] < 0` | `mystery += numbers[i]` | 12 |
| A6 sum-even-indexed | `0.0` | `i % 2 == 0` | `mystery += numbers[i]` | 10 |
| A7 sum-odd-indexed | `0.0` | `i % 2 == 1` | `mystery += numbers[i]` | 10 |
| A8 count-positive | `0` | `numbers[i] > 0` | `mystery++` | 12 |
| A9 count-matching | `0` | `numbers[i] == target` | `mystery++` | 10 |
| A10 average | `0.0` then `/SIZE` | none | `mystery += numbers[i]` then divide | 14 |
| A11 product | `1.0` | none | `mystery *= numbers[i]` | 12 |
| A12 index-of-max | `0` | `numbers[i] > numbers[mystery]` | `mystery = i` | 18 |

**Per-algo card progression:** 2 simple all-positive → 2 mixed-sign → 2 edge case (zeros) → 2 adversarial → 2 final-only predict → 2 spot-the-error.

### 3.6 S5 VARIATIONS (60 cards)

| Family | Cards | Drill |
|---|---|---|
| V-Type: int variant `stat_int` | 18 | Same 12 algos with int values |
| V-Type: string variant `stat_string` | 8 | find-longest, count-matching-string |
| V-Type: bool array `stat_bool` | 6 | count-true, all-true, any-true |
| V-Size: 3, 7, 10 | 8+10+8 = 26 | Different SIZE |
| V-Algo-transfer | 8 | Novel conditions (sum-of-evens-greater-than-mean) |
| V-Two-mystery | 4 | Struct with both `min` and `max` |
| V-Trick: empty array, SIZE mismatch | 0 | (deferred to S5.5 wildcard) |

### 3.7 S6 PRODUCTION (34 cards)

Full-question Q1 production drills. **No time limit** — the student works
each card at their own pace and submits when ready. The mastery gate is
accuracy, not speed.

| Block | Cards | Format |
|---|---|---|
| Warmup | 8 | Practice variants |
| Real-exam reps (sum-positive) | 12 | 12 different brace-init sets |
| Mixed mocks (random algo) | 8 | A1/A2/A4/A5/A8/A11 unknown until flip |
| Full Q1 mocks | 6 | Includes reading question + drawing |

### 3.8 Q1 Common Mistakes Catalog (20 traps)

| # | Mistake | Drilled in |
|---|---|---|
| M01 | Skip pre-loop init line | T22, T27 (S1), C-07, C-08 (S3) |
| M02 | Start array at index 1 | T28 (S1), C-03, C-04 (S3) |
| M03 | Run body when guard false | T29 (S1), C-21 (S3) |
| M04 | Forget strikethrough | T30 (S1), C-26, C-27 (S3) |
| M05 | i++ before body | T31 (S1), C-13 (S3) |
| M06 | Mutate array cells | C-29 (S3), A12 (S4) |
| M07 | Off-by-one (i==SIZE runs body) | C-11 (S3), A4 boundary cards (S4) |
| M08 | Confuse `=` with `+=` | C-22, C-23 (S3), A1 vs A4 (S4) |
| M09 | Drop trail, write only final | T30 (S1), C-26 (S3) |
| M10 | Misparse outer-vs-inner brace | C-01, C-02 (S3) |
| M11 | Treat `&` as bitwise | C-30 (S3) |
| M12 | Use stale `mystery` after mutation | C-23 (S3) |
| M13 | Drop post-loop step (e.g. `/SIZE`) | A10 cards (S4) |
| M14 | Skip iter where cond false but mystery in question | C-21 (S3) |
| M15 | Forget `numbers[mystery]` indirection on A12 | A12 cards (S4) |
| M16 | Wrong init on A11 (use 0.0 not 1.0) | A11 cards (S4), T-C cloze (S2) |
| M17 | Treat double as int | C-23 (S3), V-Type contrast (S5) |
| M18 | Misorder loop semantics | C-13 (S3) |
| M19 | Forget to draw 6 cells (omit mystery) | C-04+C-05 (S3) |
| M20 | Confuse `i` with `numbers[i]` | C-14 (S3), A12 (S4) |

---

## PART IV — L2 Q2 WRITE STRUCT DEEP PLAN (240 cards)

### 4.1 Invariant Template

```cpp
struct entity_data
{
    type1 field1;
    type2 field2;
    type3 field3;
};
```

### 4.2 L0 Prereqs Gating Q2 (13 atoms)

`struct` keyword, snake_case, legal identifiers, reserved-word ban, brace open/close, semicolon, primitive types (int/double/string/bool/char), 4-space indent.

**Gate:** all 13 ≥90% on last 5 reviews.

### 4.3 Stage Breakdown

| Stage | Cards | Goal |
|---|---|---|
| S1 TOUR | 20 | Mental model |
| S2 TEMPLATE | 30 | Muscle memory of 6-line skeleton |
| S3 COMPONENTS | 80 | Noun→type mapping + naming + spacing |
| S4 COMPOSE | 70 | Full struct from English prompt |
| S5 VARIATIONS | 30 | Edge cases + transfer |
| S6 PRODUCTION | 20 | Full mock Q2 (untimed) |

### 4.4 S3 Noun→Type Map (50 cards in S3a)

| Bucket | Nouns | Type |
|---|---|---|
| **int (10)** | id, count, age, year, quantity, score, room_id, desk_id, number_of_screens, copies | `int` |
| **double (10)** | price, weight, height, distance, percentage, rate, gpa, salary, balance, temperature | `double` |
| **string (10)** | name, title, description, location, address, material, colour, full_name, brand, genre | `string` |
| **bool (5)** | is_active, has_warranty, paid, available, is_student | `bool` |
| **char (5)** | grade, initial, gender, classification, single_letter | `char` |

### 4.5 S4 Entity Pool (35 entities)

```
1. computer_data (int id, string description, string location)
2. desk_data (int room_id, int d_id, int number_of_screens) — REAL TEST V2.0
3. book_data (string title, string author, int pages)
4. employee_data (int id, string name, double salary)
5. student_data (int student_id, string full_name, double gpa)
6. vehicle_data (string rego, string make, int year)
7. order_data (int order_id, double total, bool paid)
8. product_data (string sku, string name, double price)
9. animal_data (string species, int age, double weight)
10. house_data (string address, int bedrooms, double price)
11. movie_data (string title, string director, int runtime)
12. recipe_data (string name, int servings, int prep_time)
13. restaurant_data (string name, string location, double rating)
14. game_data (string title, string genre, int year)
15. song_data (string title, string artist, double duration)
16. painting_data (string title, string artist, int year)
17. flight_data (string flight_no, string origin, string destination)
18. hotel_data (string name, int stars, double price_per_night)
19. course_data (string code, string name, int credits)
20. invoice_data (int invoice_id, double amount, bool paid)
21. bank_account_data (string account_no, string holder, double balance)
22. phone_data (string brand, string model, double price)
23. dog_data (string name, string breed, int age)
24. shoe_data (string brand, double size, string colour)
25. laptop_data (string brand, int ram_gb, double weight)
26. room_data (int room_id, int capacity, bool has_projector)
27. event_data (string name, string date, int attendees)
28. ticket_data (int ticket_id, string seat, double price)
29. club_data (string name, int members, double fee)
30. weather_data (string city, double temperature, double humidity)
31. grade_data (int student_id, string course, char mark)
32. pet_data (string name, string species, bool is_vaccinated)
33. drink_data (2-field variant: name, price)
34. bicycle_data (4-field: brand, gears, price, colour)
35. tv_show_data (4-field: title, season_count, rating, is_finished)
```

### 4.6 Q2 Common Errors

| Error | Frequency | Drilled in |
|---|---|---|
| Missing `;` after closing `}` | **HIGHEST** | S2 (6 cards), S6 (all 20 emphasise) |
| Capitalised struct name | High | S1.06, S2 snake_case |
| Wrong type | High | S1.07, S3a 40-noun |
| Missing `;` on field line | Medium | S1.08, S2 per-field |
| `Struct` capital keyword | Medium | S1.09, S2 keyword |
| Two fields on one line | Medium | S1.10, S3c spacing |
| Reserved word as field name | Low | S2 reserved-word ban |
| Hyphen/space in identifier | Low | S2 identifier rule |

---

## PART V — L3 Q3 WRITE READ FUNCTION DEEP PLAN (390 cards)

### 5.1 Invariant Template

```cpp
void read_<entity>(<entity>_data &<list_param>[], int <count_param>)
{
    for (int i = 0; i < <count_param>; i++)
    {
        cout << "Field1 prompt: ";
        cin >> <list_param>[i].field1;
        cout << "Field2 prompt: ";
        cin >> <list_param>[i].field2;
        cout << "Field3 prompt: ";
        cin >> <list_param>[i].field3;
    }
}
```

### 5.2 Stage Breakdown

| Stage | Cards | Goal |
|---|---|---|
| S1 TOUR | 30 | Recognition + tracing |
| S2 TEMPLATE | 60 | 12-line skeleton drilled |
| S3 COMPONENTS | 140 | Sig anatomy, loop, cin into struct array, prompt-pair, multi-field sequencing |
| S4 COMPOSE | 90 | Full Q3 from spec |
| S5 VARIATIONS | 50 | Field counts, names, types |
| S6 PRODUCTION | 20 | Full Q3 mocks (untimed) |

### 5.3 S3 Block Detail (140 cards in 5 blocks)

| Block | Cards | Skill |
|---|---|---|
| **A — Function signature anatomy** | 35 | `void read_X(`, type construction, `&L[]`, `int C`, `)` |
| **B — For-loop with parameter as bound** | 30 | `i < number_to_read` not SIZE; `int i` declaration; off-by-one |
| **C — cin into struct array element** | 35 | `cin >> L[i].field` composite token; index placement; operator direction |
| **D — Prompt-then-read pair** | 20 | Pair pattern; role labelling; sequencing |
| **E — Multi-field sequencing** | 20 | 2/3/4-field structs; reorder shuffled lines |

**Block C is gating** — must hit 95% before S4 unlocks.

### 5.4 S4 COMPOSE Card Distribution (90 cards)

| Block | Cards |
|---|---|
| V2.0 `read_desks` (10 trials, fresh each time) | 10 |
| Practice `read_computers` (10 trials) | 10 |
| 20 novel entities, full read function each | 20 |
| Body-only completion (signature given) | 10 |
| Fill-in-the-blank with 4-6 tokens | 10 |
| Two-pane: Q2 left, Q3 right (10 entities) | 10 |
| With Q2 typos student must work around | 10 |
| Cold start: entity name only, write Q2+Q3 | 10 |

### 5.5 Q3 Common Errors

| Error | Frequency | Coverage |
|---|---|---|
| Off-by-one (`i <= number_to_read`) | High | S1#9, S3#146-150 |
| Wrong bound (`i < SIZE`/MAX) | High | S1#10, S3#131-135 |
| Missing `[i]` (`cin >> list.field`) | High | S1#11, S3#161-165 |
| Missing `.field` (`cin >> list[i]`) | Medium | S1#12 |
| Wrong operator (`cin <<`) | Medium | S1#13, S3#166-170 |
| Missing `&` in signature | High | S1#14, S3#101-105 |
| Missing `[]` in signature | Medium | S1#15 |
| Wrong return type | Low | S1#16 |
| Prompt outside loop | Medium | S1#17 |
| Skipped field | Medium | S1#18, S3#211-215 |
| Used `[0]` instead of `[i]` | Medium | S3#171-175 |

---

## PART VI — L4 Q4 WRITE MAIN DEEP PLAN (380 cards)

### 6.1 Invariant Template

```cpp
int main()
{
    const int MAX = <N>;
    <entity>_data <plural>[MAX];
    int <count_var>;
    
    cout << "How many <entities>? ";
    cin >> <count_var>;
    
    read_<entity>(<plural>, <count_var>);
    
    for (int i = 0; i < <count_var>; i++)
    {
        cout << <plural>[i].field1 << ", ";
        cout << <plural>[i].field2 << ", ";
        cout << <plural>[i].field3 << endl;
    }
    
    return 0;
}
```

### 6.2 Stage Breakdown

| Stage | Cards | Goal |
|---|---|---|
| S1 TOUR | 25 | Recognition |
| S2 TEMPLATE | 50 | 18-line skeleton |
| S3 COMPONENTS | 130 | const, decl, prompt, call, print loop, return |
| S4 COMPOSE | 95 | Fill-in scaffold + full main from prompt |
| S5 VARIATIONS | 55 | MAX/entity/print mode |
| S6 PRODUCTION | 25 | Full Q4 (untimed) |

### 6.3 S3 Block Detail (130 cards in 6 blocks)

| Block | Cards | Skill |
|---|---|---|
| **A — `const int MAX = N;`** | 20 | Const decl, why const, vs `#define` |
| **B — Struct array decl** | 20 | `<E>_data <plural>[MAX];`; why MAX not count_var |
| **C — Count variable + prompt + cin** | 20 | Decl, prompt, read, sequence |
| **D — Function call syntax** | 30 | No `&` at call site (gating, 95%); pass count not MAX |
| **E — Print loop with chained `<<`** | 30 | Loop bound = count_var; `endl`; chained vs separate |
| **F — `return 0;`** | 10 | Position, semantics |

**Block D is gating** — 95% before S4.

### 6.4 S4 COMPOSE (95 cards)

| Type | Cards |
|---|---|
| V2.0 main full (10 trials) | 10 |
| Practice main full (10 trials) | 10 |
| Fill-in-the-blank scaffold matching test format (20 cards) | 20 |
| 20 novel entities full main | 20 |
| Two-pane: Q2+Q3 left, write Q4 right (10) | 10 |
| Cold start: entity name only, write Q2+Q3+Q4 (15) | 15 |
| End-to-end pipeline practice (10) | 10 |

### 6.5 Q4 Common Errors

| Error | Frequency | Coverage |
|---|---|---|
| Missing `const` on MAX | High | S1#8, S3#76-95 |
| Variable-sized array `arr[count]` | High | S1#9, S3#101-105 |
| Read count after calling read fn | Medium | S1#10 |
| Pass MAX to read fn instead of count | High | S1#11, S3#151-155 |
| Add `&` at call site | High | S1#12, S3#141-150 |
| Print loop uses MAX not count | Medium | S1#13, S3#181-185 |
| Missing `return 0;` | High | S1#14, S3#186-195 |
| Forgets `endl` | Medium | S1#17, S3#176-180 |

---

## PART VII — L5 MOCK + VERIFICATION (110 cards)

### 7.1 Mock Inventory

| Type | Count | Cards each | Total | Purpose |
|---|---|---|---|---|
| **Full mocks** (Q1+Q2+Q3+Q4, untimed) | 8 | 1 SpeedDrill + 4 retro review | 40 | End-to-end exam sim |
| **Partial mocks** (single Q, untimed) | 24 (6/Q) | 1 SpeedDrill | 24 | Surgical-strike weak Q |
| **Postmortem cards** (diff vs canonical) | 24 | 1 walkthrough | 24 | Failure → atom retry |
| **Test-day warmup pack** (D7) | 12 | 1 each | 12 | Confidence prime |
| **S5.5 wildcard cards** | 5/Q × 4 = 20 | 1 each | 20 | 4-field, while-loop, getline, dynamic count |
| **Total** | | | **120** | |

(Note: Reduced full mock review from 40 → 30 cards, partial from 24 → 24, postmortem 24 → 14 = 110 cards in final allocation.)

### 7.2 Full Mock Variant Mix (8 mocks)

| # | Variant | Q1 algo | Entity | Field count | Day |
|---|---|---|---|---|---|
| M1 | Canonical | find-max | computer_data | 3 | D4 |
| M2 | Canonical | sum-positive | desk_data | 3 | D4 |
| M3 | Entity-swap | find-max | book_data | 3 | D5 |
| M4 | Entity-swap | sum-positive | employee_data | 3 | D5 |
| M5 | Algo-swap | find-min | computer_data | 3 | D6 |
| M6 | Algo-swap | count-X | desk_data | 3 | D6 |
| M7 | Combined | average | book_data | **4 (wildcard)** | D6 |
| M8 | Combined | sum-negative | order_data | 3 | D7 morning |

### 7.3 SpeedDrillCard UX (untimed production drill)

```
Header:    [Q1 +] [Q2 >] [Q3 .] [Q4 .]  [Submit all]
Body:      Active Q in monospace code editor pane. Tab via Ctrl+1..4 or mouse.
Per-tab:   Auto-save on switch. Ctrl+S explicit save with toast.
Submit:    [Submit all] — no clock, no auto-submit.
```

The card name is historical; the surface is now an untimed full-Q
production drill (S6 = PRODUCTION stage).

### 7.4 Sectional Grading (25 pts each, 100 total)

| Q | Sub-rubric (25 pts) |
|---|---|
| Q1 | Final values 12 + terminal output 8 + iteration count 5 |
| Q2 | `struct` 3 + name 3 + 3 field types 12 + `;` after `}` 4 + body braces 3 |
| Q3 | Signature exact 8 + `for` 5 + `cin >>` 4 + `arr[i].field` 5 + braces 3 |
| Q4 | `int main` 3 + `const int MAX` 4 + array decl 4 + count input 3 + read+print calls 6 + `return 0;` 5 |

### 7.5 Retry Policy

| Score | Action |
|---|---|
| 90-100 | Mastered. Re-issue in 48h. |
| 70-89 | Pass. Inject postmortem cards. No re-mock 24h. |
| 50-69 | Fail-soft. Drop back S5 of 1 weakest Q. Retry 24h. |
| <50 | Fail-hard. Drop back S4 across all <70 Qs. Retry 48h. |

**Cap:** max 2 mocks/day. Mocks cost ~120 normal cards in cognitive load.

### 7.6 Mock Unlock Gate (LENIENT)

- Partial mocks: any Q at S4+
- Full mocks: 3 of 4 Qs at S4+ (NOT all 4 — risk of D7 user never seeing full mock)

---

## PART VIII — 0→1 TRAJECTORY VERIFICATION

### 8.1 Verdict: MEDIUM-HIGH (70% probability ≥85% pass)

| Bucket | Probability |
|---|---|
| ≥85% on Test 2 | 70% |
| Partial pass (70-84%) | 30% |
| Fail (<70%) | <5% |

### 8.2 Why Not HIGH (3 soft spots)

1. **Time-budget reality:** Weighted card-time = 92s/card avg, NOT 30s. → 39 cards/h, NOT 85. → 1,092 cards in 28h first-exposure capacity. Plan needs aggressive Leitner mastery to retire short cards quickly.
2. **Burnout risk:** 4hr × 7 days = grueling. No built-in fatigue management beyond Pomodoro.
3. **Stage-gate stalls:** 30+ gates × 85% threshold → stall risk at L1 S2 (TemplateRecall) is high.

### 8.3 Patches to Reach HIGH Confidence

| # | Patch | Cards | Solves |
|---|---|---|---|
| 1 | L0 prereq augmentation (paper-trace, read-aloud, brace-match) | +90 | Gap §B.2 |
| 2 | Leitner-lite tuned by card length (short cards retire after 2; long after 3) | 0 | Time fit §B.3 |
| 3 | Stage gate escape valves (24h auto-promote; difficulty drop; manual override) | 0 | Stall §B.4 |
| 4 | Wildcard sub-stage S5.5 (4-field, while-loop, getline, dynamic-count) | +20 | Robustness §B.7 |

### 8.4 Common-Mistake Immunization Audit

| # | Mistake | Drilled? |
|---|---|---|
| 1 | Missing `;` after `};` | ✓ StructWriteCard keyChecks |
| 2 | `class` instead of `struct` | ✓ Forbidden tokens |
| 3 | Capitalized struct name | ✓ Char-match + EntityMatrix |
| 4 | `cin >> string` truncates on space | ✗ **GAP** — MU-10 marked rare. Add 2 cards. |
| 5 | Off-by-one (`i < count` vs `<=`) | ✓ TraceCard last-iter |
| 6 | Forgot `&` in pass-by-ref | ✓ FunctionWriteCard sig char-match |
| 7 | `arr.field[i]` vs `arr[i].field` | ✓ MU-7 + procedural 3-streak |
| 8 | Forgot `return 0;` | ✓ MainWriteCard token-order |
| 9 | Brace mismatch | ✓ Brace counter UI |
| 10 | Trace variable confusion | ✗ **GAP** — add 5 prediction-cloze cards in L1 S3 |

### 8.5 Failure Recovery Policy (NEW)

| Last-10 accuracy | Action |
|---|---|
| ≥85% | Advance |
| 70-84% | Stay, +20 cards same stage |
| 50-69% | Stay, switch to easier card type for next 15 |
| 30-49% | Drop back 1 stage, +30 from previous failed-card cycle |
| <30% | Drop 2 stages, force 5 L0 prereq atoms, alert "concept needs paper practice" |

### 8.6 Burnout Mitigation Schedule

| Day | Pattern | Hours |
|---|---|---|
| D1 | 4 × 50-min Pomodoro, only L0 + Q2 S1-S2 (lowest load) | 4h |
| D2 | Same, L0 + Q2 S3 + Q3 S1-S2 | 4h |
| D3 | 3 × 50-min + 1 × 30-min walkthrough-only (recovery) | 3.5h |
| D4 | First mock day. 2 × 50-min + Mock M1 + 30-min retro. Hard cap. | 4h |
| **D5** | **EASY DAY.** 2hr only. Walkthrough/demo/decompose. No new templates. | 2h |
| D6 | 4 × 50-min. Mock M5/M6/M7. | 4h |
| D7 | Test morning. 30-min warmup pack. No new content. Walk to test. | 0.5h |
| **Total** | | **~22h** |

(Buffer 6h for D4 evening or D6 catch-up.)

### 8.7 Card Count Math Verification

```
Skills × exposures × variants:
  4 questions × 16 MUs × 8 exposures = 512 minimum
  6 algos × 4 entities × 2 reps = 48 variant exposures
  L0 foundation = ~600 atoms-as-cards
  ──────────────────────────────────
  Floor: 1,160 cards

Time budget × realistic rate:
  28h × 39 cards/h (weighted avg) = 1,092 first-exposure capacity
  + Leitner fail-cycle ≈ 700 re-views
  ──────────────────────────────────
  Effective card-views: ~1,800

Proposed deck: 2,460 cards
  - Leitner retires ~25% mastered short cards quickly
  - Effective seen: ~1,800-2,000 cards over 7 days
  ──────────────────────────────────
  Math fits IF Leitner aggressive on short cards.
```

### 8.8 Card Count Reallocation (final)

| Level | v1 plan | Recommended | Reason |
|---|---|---|---|
| L0 | 600 | **690** | +90 prereq gaps (paper, read-aloud, braces) |
| L1 | 700 | **650** | -50 (had 228 cushion) |
| L2 | 250 | **240** | -10 |
| L3 | 400 | **390** | -10 |
| L4 | 350 | **380** | +30 (Compose tightness) |
| L5 | 100 | **110** | +10 (S5.5 wildcard) |
| **Total** | **2,400** | **2,460** | +60 |

---

## PART IX — UI/UX

### 9.1 Home Screen Mockup

```
┌──────────────────────────────────────────────────────────────┐
│  cpp-t2 — SIT102 Test 2 Prep                    [settings]   │
├──────────────────────────────────────────────────────────────┤
│  TEST DAY: Thu 14 May 11am · 7 days left · 12h studied      │
│                                                              │
│  ┌─ L0 FOUNDATION ────────────────────────────────────────┐ │
│  │  Shared atoms                          ████████░░ 78%  │ │
│  │  478 / 690 cards · S3 components       [Continue →]    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ Q1 ─────────┐ ┌─ Q2 ─────────┐                         │
│  │ Hand-execute │ │ Write struct │                         │
│  │ ████░░░░ 45% │ │ ██████░░ 72% │                         │
│  │ S3 Components│ │ S4 Compose   │                         │
│  │  [Practice]  │ │  [Practice]  │                         │
│  └──────────────┘ └──────────────┘                         │
│  ┌─ Q3 ─────────┐ ┌─ Q4 ─────────┐                         │
│  │ Read fn      │ │ main()       │                         │
│  │ ██░░░░░░ 22% │ │ ░░░░░░░░  0% │                         │
│  │ S2 Template  │ │ S1 Tour      │                         │
│  │  [Practice]  │ │  [Practice]  │                         │
│  └──────────────┘ └──────────────┘                         │
│                                                              │
│  ┌─ L5 MOCK EXAM ─────────────────────────────────────────┐ │
│  │  🔓 Partial mocks unlocked (Q2 at S4+)                  │ │
│  │  🔒 Full mocks locked — 3 of 4 Qs at S4+ needed         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Daily plan]  [Stats]  [Sandbox]                           │
└──────────────────────────────────────────────────────────────┘
```

### 9.2 Track Screen (Q2 example)

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back · Q2 — Write struct from English prompt              │
├──────────────────────────────────────────────────────────────┤
│  Stage progress:                                             │
│  S1 Tour       ✓ 100% (20/20)                               │
│  S2 Template   ✓ 100% (30/30)                               │
│  S3 Components ✓ 100% (80/80)                               │
│  S4 Compose    ▶  60% (42/70)  ← currently here             │
│  S5 Variations 🔒 unlocks at S4 ≥ 85%                       │
│  S6 Speed      🔒                                           │
│                                                              │
│  Today's deck: 40 cards                                      │
│  ▸ 24 S4 Compose (StructWrite from prompt)                   │
│  ▸ 8 S3 review (failed yesterday)                            │
│  ▸ 8 S2 spaced repetition                                    │
│                                                              │
│  [Start session]   [Browse stages]   [Skip stage] (warning)  │
└──────────────────────────────────────────────────────────────┘
```

### 9.3 Card Type UX Decisions

| Question | Decision |
|---|---|
| **UX paradigm** | **code editor everywhere.** Editable code panel + live brace counter + variables panel + simulated terminal. ZERO paper dependency. |
| **Trace cards** | code editor style: code on left, variables panel on right (auto-updates), terminal at bottom. Student clicks [step] or types value → app validates. |
| **Write cards** | Full editor: monospace, syntax highlight, line numbers, brace-match highlight, auto-indent. Submit → diff vs canonical inline. |
| **Production cards** | Same code editor with Q1-Q4 tabs. No countdown header. |
| Real-time syntax errors | **NO** (still). LSP squiggles fool novices. Brace-balance counter only. |
| Multi-iteration trace display | One iter at a time default; compact mode L5. |
| Timed pressure | **None.** All cards work at the student's own pace (timer system removed 2026-05-07). |
| Cloze vs blank-page | D1 = 70/30 → D4+ = 30/70 |
| Algorithm variants Q1 | 12 algorithms × ~12 cards = 144 cards (S4) |
| Entity variants Q2 | 35 entities × multi-stage = 200+ exposures |
| **Spaced repetition** | **DROPPED.** Pure exposure-frequency model — see §11.2. |

### 9.4 Motivation Mechanics (learning-aligned only)

| Mechanic | Aligned? | Status |
|---|---|---|
| Per-card streak `⚡N` | Yes | Already in design |
| Track progress bar | Yes | Already |
| Mock-pass badges | Yes | Add (3hr build) |
| Mistake-of-the-day | Yes | Add |
| Confetti / sounds / cosmetics | NO | Skip |
| Public leaderboards | NO | Skip |

---

## PART X — STUDENT EXPERIENCE WALKTHROUGH

### Day 1 morning (open app first time)
1. Home shows 4 tracks at 0% + L0 at 0%.
2. Recommended: L0 Foundation tour (15 min). Sees C++ basics, what struct looks like, what for-loop is.
3. App suggests **Q2 first** (lowest cognitive load — pure recognition).
4. Q2 S1 Tour: 4 demo cards (practice Q2, V2.0 Q2, 2 wrong-answer spot-error).
5. Q2 S2 Template: TemplateRecallCard with `struct NAME { TYPE field; };`. Study 5s → hide → retype. Real-time green-ticks per line. 3 successes → all-at-once.
6. Session ends after 50 min Pomodoro. Last 10 min = fail-card review.

### Day 2 (Q3 added)
1. Q2 at 60%, others 0%.
2. Schedule: 60% Q2 S3 components, 40% Q3 S1 tour.
3. Q3 tour walks through V2.0 read_desks function.
4. Q3 S2 templates start: `void read_X(X &list[], int n) { for (...) { cin >> list[i].field; } }`.

### Day 4 (first mock)
1. All 4 Qs at S3 or S4.
2. Mock track unlocks (3 of 4 at S4+).
3. Click Mock #1 → SpeedDrillCard (untimed production drill). 4 tabs.
4. Submit → diff vs canonical per Q, scored 0-25 each.
5. Retrospective: "Q3 weakest — 12/25. Tomorrow biased toward Q3."

### Day 5 (EASY DAY — 2h only)
1. Walkthrough-only deck. No new templates.
2. Recovery + spaced rep on mastered cards.

### Day 7 (test morning)
1. All 4 Qs at S6 ≥ 90%.
2. 30-min warmup pack: 1 card per Q at canonical difficulty.
3. Close app. Walk to test at 11am.

---

## PART XI — INTERLEAVING + SCHEDULING ENGINE

### 11.1 Per-Day Deck Composition Algorithm

```
inputs:
  - currentStagePerTrack: {Q1: 'S3', Q2: 'S5', Q3: 'S2', Q4: 'S1'}
  - lastSessionAccuracy: {Q1: 0.78, Q2: 0.92, Q3: 0.51, Q4: 0.88}
  - dayNumber: 1..7

rules:
  1. Block phase (D1-D3): one Q dominates session ≥70%.
  2. Interleave phase (D4-D7): no two same-Q cards back-to-back.
  3. Lowest-accuracy Q gets 1.5× weight in next deck.
  4. Stage S1-S2 always blocked (schema formation).
  5. Stage S4-S6 prefer interleaved (transfer training).
  6. Last 30 cards each session = blank-page random across all 4 Qs.
  7. Daily audit: any Q < 10% deck → force-inject 5 cards.
```

### 11.2 Exposure-Frequency Model (NO spaced repetition)

```
Per atom: target exposure count
  - Short cards (cloze/walkthrough/demo): target = 6 exposures
  - Medium cards (decompose/cmem/μ-write): target = 8 exposures  
  - Long cards (write/trace/procedural): target = 12 exposures

Card state:
  - 0 exposures → NEW
  - 1..target-1 → IN-PROGRESS
  - ≥target with last 3 correct → FAMILIAR (retired)
  - ≥target with errors → still IN-PROGRESS, force re-expose

Per atom: "familiarity %" = (correct exposures / target) × 100
Per Q-track: average across constituent atoms
Per L5 mock: gates on Q-track familiarity ≥85%
```

**No interval scheduling. No SM-2/Anki/Leitner. Just exposure counters.**

Card draw order each session:
1. NEW cards from current stage (60%)
2. IN-PROGRESS cards with low familiarity (30%)
3. Random already-FAMILIAR cards (10%) — sanity check, not retention
4. End-of-session: 30 cards from any stage at <50% familiarity (catch-up)

**Why drop SRS:**
- 7-day window → SRS interval optimization irrelevant
- Familiarity ≠ long-term retention; user only needs it on May 14
- Counters are simpler to implement, debug, audit
- Student can see "Q3 is 67% familiar" and grok it

---

## PART XII — MIGRATION PLAN

### Phase A — Cull (1 day, ~6h)
1. Run drop-list against `cards.json` (drop 690 off-scope).
2. Verify build, deck size ≈ 2,120.
3. Commit `cull: drop off-scope cards (-690)`.

### Phase B — Restructure (2 days)
1. Build L0-L5 level config replacing L-1..L17.
2. Re-tag every kept card with new (level, stage, q_target) triple.
3. Build stage-gate engine + escape valves.
4. Build new home screen UI (4-track + L0 + L5).

### Phase C — Build new card types (3 days)
1. **TemplateRecallCard** component (3-stage UX).
2. **StructWriteCard** / **FunctionWriteCard** / **MainWriteCard** components.
3. **EntityMatrixCard** + **AlgorithmMatrixCard** (refocus Matrix).
4. **SpeedDrillCard** (untimed production mock) + tabbed Q1-Q4 UI.
5. Author 285 new cards across these types.

### Phase D — Schedule + ship (1 day)
1. Build interleaving engine (7-day plan generator).
2. Build daily-deck composer (rules in §11.1).
3. Acceptance test: full 7-day dry run.
4. Ship to localhost:5173.

**Total: 7 days build = matches student's 7-day prep window.**

---

## PART XIII — DECISION OPTIONS

### Option 1: Minimal (cull only) — 1 day build
- Drop 690 cards. Re-tag with q_target.
- Days 2-7: Study with current card types, ~2,120 cards.
- **Pros:** Fastest, lowest risk, validated card types.
- **Cons:** No template-recall, no IDE-write split.
- **Confidence:** MEDIUM (60% pass)

### Option 2: Medium (cull + restructure) — 2 days build
- L0-L5 levels + new home screen + escape valves.
- Days 3-7: Study with restructured deck, current card types.
- **Pros:** 4-vertical structure benefit.
- **Cons:** No new card types.
- **Confidence:** MEDIUM-HIGH (70% pass)

### Option 3: Full (cull + restructure + new types + patches) — 3 days build
- Phase A+B+C in 3-day sprint.
- Days 4-7: Study with full redesigned deck + 4 patches.
- **Pros:** Maximum focus. All 4 patches applied.
- **Cons:** 3 days build = 12h less study.
- **Confidence:** HIGH (85% pass)

**Recommend Option 3 if user has bandwidth. Option 2 if not.**

---

## PART XIV — OPEN QUESTIONS NEEDING USER DECISION

1. Build vs study tradeoff — 1, 2, or 3 days build?
2. Mock unlock gate — strict (all 4 at S5) or lenient (3 of 4 at S4)?
3. Entity scope — 35 entities or trim to top 10 highest-probability?
4. Algorithm slot scope — all 12 or just top 6 (max/min/sum/sum-pos/count/avg)?
5. Foundation L0 build — re-tag from existing or hand-author fresh?

---

## PART XV — SOURCE MATERIAL

Synthesized from:
- 5 parallel agents (round 1: curriculum, templates, card types, ultralearning, cull audit)
- 5 parallel agents (round 2: L0 deep, Q1 deep, Q2 deep, Q3+Q4 deep, L5 + verification)
- VTT seminar transcript (Saloni Mehta walkthrough of practice test)
- Practice test docx (Test2-SIT102-practice (1).docx)
- Real test V2.0 attempt 1 screenshots (2026-05-07)
- Current cards.json (2,811 cards) + outlines/L-1..L17 (187 atoms)

---

**END OF DEEP PLAN — Awaiting user authorization to proceed with Option 1, 2, or 3.**
