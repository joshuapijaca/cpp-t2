# cpp-t2 v2 — Independent Coverage Audit (V2.0 attempt 1)

Auditor: Independent | Date: 2026-05-07 | Per RULE 4: brutal honesty.

Deck total: 2,458 yml card files. Q1=882, Q2=380, Q3=745, Q4=379 (qTags occurrences).

## V2.0 attempt 1 — actual exam shape

- Q1: sum-positive on `{2.4, -3.7, -1.7, 3.0, 2.0}`, mystery init **-0.9** → **7.4**
- Q2: `desk_data { int room_id; int d_id; int number_of_screens; }` (ALL INT)
- Q3: `read_desks(desk_data &desk_list[], int number_to_read)` — note `&desk_list[]` (unusual)
- Q4: `const int MAX = 700`, `desk_data desks[MAX]`, `int desk_num`

---

## Q1 SKILL INVENTORY (Hand-execute sum-positive)

| Skill | Cards | Modalities | Status |
|---|---:|---|---|
| Sum-positive algorithm body (`if numbers[i]>0`) | 137 | demo+trace+cloze+walkthrough+mock | OK |
| Pre-loop init = `0.0` (NOT `numbers[0]`) | 80+ | walkthrough/postmortem/cloze | OK |
| Brace-init `{nums..}, mystery` parsing | 81 | trace+cloze+demo | OK |
| Strikethrough on reassignment | 45 | walkthrough explicit | UNDER |
| Mystery init OVERRIDDEN by pre-loop | yes (V2.0 demo) | demo+walkthrough | OK |
| `i < SIZE` loop guard | many | embedded everywhere | OK |
| Dot-access `data.numbers[i]`, `data.mystery` | many | embedded | OK |
| **Exact V2.0 stimulus `{2.4,-3.7,-1.7,3.0,2.0}`** | 1 (M02 mock) | mock paper only | **WEAK** |
| **Init -0.9 specifically (V2.0 wrinkle)** | 4 cards | demo+walkthrough+mock | UNDER |
| **Final answer 7.4 traced step-by-step** | 1 (M02 paper) | mock only | **WEAK** |

GAP: The exact V2.0 trace `(2.4+3.0+2.0=7.4 with mystery init -0.9)` only lives in M02 mock paper text, not as a standalone interactive TraceCard. Real-exam-rep trace-01 uses different numbers `{2.4,-3.7,5.1,-1.2,4.8}` → 12.3. The student will have done sum-positive 137 times but the exact V2.0 brace-init+init combo only as part of one mock prompt.

**Q1 coverage: 80%.** Algorithm + skeleton drilled exhaustively. Exact V2.0 stimulus only in mock paper text, not as standalone trace.

---

## Q2 SKILL INVENTORY (Define `desk_data` with 3 int fields)

| Skill | Cards | Modalities | Status |
|---|---:|---|---|
| `struct` keyword + name | 380 (Q2) | many | OK |
| Field declarations (snake_case) | 55+ | mcq+cloze+write | OK |
| Closing `};` semicolon | many | spot-error+postmortem | OK |
| `int` field type | 256+ | many | OK |
| **Exact V2.0 fields room_id/d_id/number_of_screens** | 14 cards | StructWriteCard+demo | OK |
| **All-three-INT (no string/double mix)** | ~4 cards | only the V2.0-specific cards | **WEAK** |
| English-prompt → struct skill | many | StructWriteCard | OK |
| Field ordering (room_id first) | implicit in 14 V2.0 cards | OK |

GAP: All 8 full mocks (M01-M08) use mixed-type structs (string/int/double). NONE of the 8 mocks present the all-int desk_data. The 14 V2.0-specific cards are in L4/L2 component drills, NOT a mock paper. If the student practices via mocks, they NEVER see all-int desk_data under timed conditions.

**Q2 coverage: 85%.** V2.0 entity exists, but is missing from the 8 timed mock papers. Mock M02 even uses `string material; int drawers; double height` instead of the real V2.0 fields.

---

## Q3 SKILL INVENTORY (Write `read_desks` for-loop + cin per field)

| Skill | Cards | Modalities | Status |
|---|---:|---|---|
| Function signature with `&` and `[]` | many | template+cloze+spot-error | OK |
| `for (i = 0; i < count; i++)` | many | embedded everywhere | OK |
| `cin >> arr[i].field` | 87 | demo+walkthrough+write | OK |
| Prompt-pair (cout then cin) | F-15 family | drilled | OK |
| Pass-by-decay `arr[]` semantics | many | walkthroughs | OK |
| Multi-field per iteration | many | many | OK |
| **`&desk_list[]` (V2.0 unusual signature with ampersand on array)** | 1 (twopane card) | only one | **GAP** |
| **`int number_to_read` parameter name (V2.0)** | 0 | none | **GAP — UNCOVERED** |

GAP: V2.0 attempt 1 uses `&desk_list[]` in the parameter (ampersand-on-array — semantically meaningless decoration but exam-required). Only one card (twopane-01) uses `&count` style; nothing trains the unusual `desk_data &desk_list[]` form. Parameter named `number_to_read` (not the conventional `count`/`n`) appears NOWHERE.

**Q3 coverage: 75%.** Skeleton + cin patterns drilled, but the V2.0-exact ampersand placement and `number_to_read` parameter name are absent.

---

## Q4 SKILL INVENTORY (`main()` with const MAX=700, ask, read, print, return)

| Skill | Cards | Modalities | Status |
|---|---:|---|---|
| `const int MAX` declaration | 73 | template+cloze+spot+write | OK |
| Array decl `desk_data desks[MAX]` | many | many | OK |
| Reading count from cin | many | many | OK |
| Function call WITHOUT `&` | 35+ | postmortem+cm+cloze | OK |
| Print loop (after read) | 71+ | template+walkthrough+postmortem | OK |
| `return 0;` last statement | many | spoterror+orderlines | OK |
| **Exact MAX=700 V2.0 capacity** | 124 cards | timed+trial+S5-Variations+walkthrough | OK |
| **`int desk_num` (V2.0 name, not `count`)** | many V2.0 cards | OK |
| **Print loop: 3 fields chained with comma + endl** | walkthrough-v20 + ~10 trial cards | OK |

**Q4 coverage: 95%.** V2.0 main is the most thoroughly drilled question. 124 cards include MAX=700; 10 typed full-main writes (`v20-trial-01..10`); 5 timed (`v20-timed-01..05`); 1 walkthrough; 10 S5 MAX-variations. Excellent.

---

## MOCK PAPER AUDIT (8 full mocks)

Read mocks M01, M02, M07. Findings:

- **M01** (canonical find-max + computer_data + MAX=100): playable, all 4 Qs present. NOT V2.0.
- **M02** ("canonical sum-positive desk"): Q1 algorithm matches V2.0 (sum-positive, init=-0.9, final=7.4). BUT Q2 desk_data uses `string material; int drawers; double height` — **WRONG fields vs. V2.0**. Q4 uses MAX=100, **NOT 700**.
- **M07** (combined average book): bug — Q1 claims final = 6.0 with body `mystery + numbers[i]`. Sum of {3,6,9,4,8} = 30, not 6. Mock canonical answer is mathematically wrong.
- **M03-M06, M08**: same template. None use the V2.0-exact entity (room_id/d_id/number_of_screens) or MAX=700.

GAPS in mocks:
- ZERO mock paper presents the actual V2.0 attempt-1 (right algorithm + right entity + right MAX).
- M02 is the closest: right algorithm, but wrong desk_data fields and wrong MAX.
- M07 has a wrong canonical answer (off by /SIZE — was conflated with average).

---

## EXAM-REALISTIC FEATURE AUDIT

| Feature | Status |
|---|---|
| Sum-positive find-max trace for V2.0 specific algorithm | YES (137 cards on algorithm; only 1 trace card with -0.9 init) |
| desk_data with all-int fields drilled | PARTIAL (14 cards exist; none in mock papers) |
| Print loop after read_desks call drilled | YES (71+ cards) |
| Skip pre-loop init mistake on V2.0 context | YES (CM-Q1-skip-init + postmortems) |
| Missing & on signature for read_desks | YES (CM-Q3-missing-amp drilled) |
| Missing semi after `}` on struct | YES (CM-Q1-struct-no-trailing-semi + Q2 postmortems) |
| MAX=700 specifically | YES (124 cards) |
| `&desk_list[]` (V2.0 weird ampersand placement) | NO |
| `number_to_read` parameter name | NO |

---

## OVERALL COVERAGE

| Question | Coverage % | Reasoning |
|---|---:|---|
| Q1 (hand-execute sum-positive) | **80%** | Algorithm drilled 137x; exact V2.0 stimulus + 7.4 trace only in mock paper text |
| Q2 (struct desk_data 3 ints) | **85%** | 14 cards on V2.0-exact; missing from 8 timed mocks |
| Q3 (read_desks signature + loop) | **75%** | Skeleton OK; `&desk_list[]` and `number_to_read` absent |
| Q4 (main MAX=700) | **95%** | Most thoroughly drilled; 124 cards include MAX=700 |
| **Overall (weighted by marks=25 each)** | **84%** | |

---

## CRITICAL GAPS (RULE 4 brutal)

1. **No mock paper matches actual V2.0.** All 8 timed mocks miss the real entity (V2.0 has all-int desk_data, mocks have string/int/double); M02 even mislabels itself "canonical sum-positive desk" but uses non-V2.0 fields.
2. **M07 mock has a wrong canonical answer** — Q1 sum body but answer claims average. Will mislead the student.
3. **Q3 V2.0 signature `void read_desks(desk_data &desk_list[], int number_to_read)`** is not drilled with that exact ampersand placement or parameter name. Student may write `desk_data desk_list[]` (correct standard) but lose marks vs. exam template.
4. **Standalone interactive TraceCard for V2.0 stimulus `{2.4,-3.7,-1.7,3.0,2.0}` with init -0.9 → 7.4 doesn't exist** — only embedded in M02 mock prompt and the V2.0 walkthrough card. Student doesn't get repeated exposure to the EXACT trace.
5. **Strikethrough notation under-drilled** — only ~45 cards mention it; the V2.0 grading rubric requires it.

---

## RECOMMENDATIONS (if time before exam)

1. Patch M02 mock paper to use real V2.0 fields (room_id/d_id/number_of_screens) and MAX=700.
2. Fix M07 canonical answer (final value or change body to include `/SIZE`).
3. Add 5+ TraceCards using exact V2.0 stimulus for repetition.
4. Add 3 cards drilling `&desk_list[]` ampersand placement and `number_to_read` parameter name.

---

**Final assessment: ~84% effective coverage of V2.0 attempt 1.** The deck heavily over-prepares for the canonical-shape (find-max + computer_data + MAX=100) and is well-prepared for the algorithm (sum-positive). It under-prepares for the V2.0-specific entity (all-int desk_data) and the unusual Q3 signature wrinkle.
