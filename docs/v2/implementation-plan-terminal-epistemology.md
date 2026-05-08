# Implementation Plan: Terminal Epistemology Card Deck

**Current state**: 2,528 v2 YAML cards across L0-L5, loaded by Vite glob.
**Target state**: ~3,500 cards covering all 82 bedrocks, WHY→HOW structured, linear walk.
**Delta**: ~970 new cards + revisions to existing cards.

---

## CURRENT COVERAGE AUDIT

### DemoCards (Phase 1: Install) — 73 total

| Level | DemoCards | Atoms covered | Gap |
|---|---|---|---|
| L0 | 56 | 23 atoms (F-01 to F-22e) | 4 bedrocks partially covered |
| L1 | 7 | 3 atoms (T-00, C-05, C-28, C-30) | Q1 trace procedure needs more install cards |
| L2 | 4 | 1 atom (L-21) | Thin — only struct tour |
| L3 | **0** | **0 atoms** | **ZERO install cards for Q3** |
| L4 | 2 | 1 atom (Q-00) | Thin — only Q4 tour |
| L5 | 4 | 1 atom (M-04) | Warmup demos only |

**Critical gap**: L3 (Q3 read function) has zero DemoCards. Student hits Q3 content with no installation phase.

### Bedrocks with FULL coverage (all 3 phases)

| Bedrock | Install | Verify | Automate |
|---|---|---|---|
| Q1-B06 (= is assignment) | F-12 demo ✓ | MCQs ✓ | ClozeCards ✓ |
| Q1-B08 (; terminator) | F-07 demo ✓ | MCQs ✓ | ClozeCards ✓ |
| Q1-B21 (& = reference) | F-22b demo ✓ | MCQs ✓ | TraceCards ✓ |
| Q1-B28 (for-loop syntax) | F-18 demo ✓ | MCQs ✓ | TraceCards ✓ |
| Q1-B33 (if statement) | F-17 demo ✓ | MCQs ✓ | TraceCards ✓ |
| Q2-B05 (}; after struct) | F-07/F-20 demo ✓ | MCQs ✓ | StructWriteCards ✓ |
| ~20 more L0 bedrocks... | ✓ | ✓ | ✓ |

### Bedrocks with PARTIAL coverage (missing 1+ phase)

| Bedrock | Missing phase | What's needed |
|---|---|---|
| Q1-B10 (struct creates TYPE) | Install (explicit) | DemoCard: "struct = create a new type" |
| Q1-B14 ({} 3 meanings) | Install | DemoCard: side-by-side 3 contexts |
| Q1-B42 (unary minus) | Install + Verify | DemoCard + 2 MCQs |
| Q1-B46 (working memory offload) | All | DemoCard: "trace table = external brain" |
| Q1-B52 (algorithm patterns) | Install | DemoCard: "5 patterns you'll see" |
| Q1-B53 (wrong > blank) | All | DemoCard + MCQ at exam strategy level |
| Q3-B01 to B13 (entire Q3) | Install (0 DemoCards) | 6+ DemoCards for Q3 |
| Q4-B05 (MAX vs desk_num) | Install (explicit) | DemoCard: "MAX = box, desk_num = stuff" |
| Q2-B09 / Q3-B13 / Q4-B13 (cross-Q) | All | Linked multi-step cards |
| X-B01 to X-B06 (exam strategy) | All | 6 DemoCards + practice |

### Bedrocks with ZERO coverage

| Bedrock | Type | Cards needed |
|---|---|---|
| Q1-B02 (C++ is not English) | META | 1 Demo + 1 MCQ |
| Q1-B46 (working memory offload) | META | 1 Demo |
| Q1-B54 (false proximity trap) | META | 1 Demo |
| X-B01 (wrong > blank) | META | 1 Demo |
| X-B02 (exam order Q2→Q4→Q3→Q1) | PROC | 1 Demo + 1 MCQ |
| X-B03 (time budget) | PROC | 1 Demo |
| X-B04 (one Q fail ≠ all fail) | META | 1 Demo |
| X-B05 (partial answer strategy) | PROC | 1 Demo + 1 MCQ |
| X-B06 (5-min switch rule) | META | 1 Demo |
| Q2-B09 (cross-Q field coupling) | REL | 2 linked cards |
| Q3-B02 (WHY empty brackets) | SEM | 1 Demo |
| Q3-B03 (WHY & on array param) | SEM | 1 Demo |

---

## IMPLEMENTATION WAVES

### Wave 1: L3 DemoCard gap (CRITICAL — 0 install cards)

L3 has 430 cards but ZERO DemoCards. Student encounters FunctionWriteCards and MCQs
with no prior installation of concepts. This is the single biggest structural gap.

**New cards to author:**

| Card | Bedrock | Content |
|---|---|---|
| L3/S1-Tour/demo-01.yml | Q3-B01 | "Q3 signature anatomy: void + name + (TYPE &arr[], int count)" |
| L3/S1-Tour/demo-02.yml | Q3-B02 | "WHY empty []? Size unknown → need count parameter" |
| L3/S1-Tour/demo-03.yml | Q3-B03 | "WHY &? Function must modify caller's array. Without &: changes die." |
| L3/S1-Tour/demo-04.yml | Q3-B05 | "Q3 body template: int i; for(i<count){cin>>arr[i].field;}" |
| L3/S1-Tour/demo-05.yml | Q3-B11 | "RULE: no cout in read function. Pure cin. Prompts in main." |
| L3/S1-Tour/demo-06.yml | Q3-B09 | "cin >> arr[i].field = 3 operations: index, dot, read" |
| L3/S1-Tour/demo-07.yml | Q3-B12 | "Loop bound = count param. NOT MAX, NOT SIZE, NOT hardcoded." |
| L3/S1-Tour/demo-08.yml | Q3-B13 | "Field names MUST match Q2 exactly. Look back before writing." |

**Count: 8 new DemoCards for L3.**

### Wave 2: Metacognitive + exam strategy cards (ZERO coverage)

These bedrocks exist only in documentation, never as interactive cards.

**New cards to author (new atom: L5/exam-strategy/):**

| Card | Bedrock | Content |
|---|---|---|
| demo-01-wrong-gt-blank.yml | X-B01 | "Wrong > blank. Partial credit exists. Write SOMETHING." |
| demo-02-exam-order.yml | X-B02 | "Q2 first (5min easy). Q4 second. Q3 third. Q1 last." |
| demo-03-time-budget.yml | X-B03 | "Q2=10min, Q4=30min, Q3=25min, Q1=25min. Write on margin." |
| demo-04-independence.yml | X-B04 | "Can't do Q1? Doesn't matter. Q2 is independent. Do Q2." |
| demo-05-partial-answer.yml | X-B05 | "Stuck on Q3? Write int i; and the for-header. That's marks." |
| demo-06-switch-rule.yml | X-B06 | "5 minutes, no writing? Switch questions. Don't stare." |
| mcq-01-order.yml | X-B02 | "Which Q should you start with?" → Q2 |
| mcq-02-stuck.yml | X-B05 | "You're stuck on Q4. What do you do?" → write partial, move on |
| mcq-03-blank.yml | X-B01 | "What gets more marks: wrong struct or blank?" → wrong struct |

**Count: 9 new cards (6 Demo + 3 MCQ).**

### Wave 3: Partially-covered L0 bedrocks

Fix 4 bedrocks with partial DemoCard coverage.

| Card | Bedrock | Content |
|---|---|---|
| L0/F-20/demo-04.yml | Q1-B10 | "struct creates a NEW TYPE. After defining stat_double, use it like int or double." |
| L0/F-08/demo-03.yml | Q1-B14 | "{} 3 meanings: code block (function), struct body (definition), init list (values). Same symbol, context decides." |
| L0/F-10/demo-04.yml | 0 vs 0.0 | "0 is int. 0.0 is double. Same math value, different TYPE. Type changes operator behavior." |
| L0/F-09/demo-03.yml | keyword vs id | "int, void, struct, for, if, return = KEYWORDS (reserved). stat_double, mystery, desk_num = IDENTIFIERS (your names)." |

**Plus MCQ verification cards:**

| Card | Bedrock | Content |
|---|---|---|
| L0/F-20/mcq-type-01.yml | Q1-B10 | "After struct desk_data {...};, what can you write?" → desk_data d; |
| L0/F-08/mcq-brace-01.yml | Q1-B14 | "{ {2.4, 3.0}, -0.9 } — which meaning of {}?" → init list |
| L0/F-10/mcq-literal-01.yml | 0 vs 0.0 | "What TYPE is the literal 0?" → int |
| L0/F-10/mcq-literal-02.yml | 0 vs 0.0 | "What TYPE is the literal 0.0?" → double |
| L0/F-09/mcq-keyword-01.yml | keyword vs id | "Which is a C++ keyword?" → struct (not stat_double) |
| L0/F-09/mcq-keyword-02.yml | keyword vs id | "Which is programmer-chosen?" → mystery (not void) |

**Count: 10 new cards (4 Demo + 6 MCQ).**

### Wave 4: Missing terminal-epistemology cards

Cards for bedrocks identified in terminal epistemology audit but not in atoms-to-author.md.

| Card | Bedrock | Level | Content |
|---|---|---|---|
| demo-meta-not-english.yml | Q1-B02 | L0/F-01 | "C++ is NOT English. Looks similar = trap. Must learn each token." |
| demo-meta-memory-offload.yml | Q1-B46 | L1/S1-Tour | "Your brain holds ~7 items. Trace has 9+. Table = external brain." |
| demo-meta-false-proximity.yml | Q1-B54 | L0/F-01 | "If 5 minutes pass and you can't decode: you DON'T understand. Move on." |
| demo-pattern-five.yml | Q1-B52 | L1/S1-Tour | "5 algorithm shapes: sum-positive, count-positive, find-max, find-min, average." |
| demo-counter-no-ref.yml | Q1-B22 | L0/F-22b | "WITHOUT &: function gets COPY. Changes die at return. d unchanged." |
| demo-unary-minus.yml | Q1-B42 | L0/F-10 | "-0.9 = negative literal. NOT subtraction. One value, not an operation." |
| demo-q4-max-vs-num.yml | Q4-B05 | L4/S1-Tour | "MAX = box capacity. desk_num = stuff. ALWAYS pass stuff, not box." |
| demo-right-first.yml | Q1-B38 | L0/F-12 | "x = x + 1 : read right side FIRST (old x + 1). Store result left SECOND." |
| demo-accumulator.yml | Q1-B37 | L0/F-12 | "result = result + value = ACCUMULATOR. Running total. The core of Q1." |
| demo-cross-q.yml | Q2-B09 | L5/exam-strategy | "Q2 fields → Q3 cin → Q4 cout. One typo cascades. Cross-check." |
| mcq-counter-01.yml | Q1-B22 | L0/F-22b | "void f(int x){x=10;} int a=5; f(a); What is a?" → 5 |
| mcq-counter-02.yml | Q1-B22 | L0/F-22b | "void f(int &x){x=10;} int a=5; f(a); What is a?" → 10 |
| mcq-unary-01.yml | Q1-B42 | L0/F-10 | "In stat_double d = {..., -0.9}; what is -0.9?" → negative literal |
| mcq-accumulator-01.yml | Q1-B37 | L0/F-12 | "x=0; x=x+3; x=x+2; What is x?" → 5 |
| mcq-right-first-01.yml | Q1-B38 | L0/F-12 | "x=3; x=x*2; Which side runs first?" → right side (x*2) |

**Count: 15 new cards (10 Demo + 5 MCQ).**

### Wave 5: Cross-question coupling cards (NEW concept)

No existing cards test Q2→Q3→Q4 field name consistency as a unified skill.

**New atom: L5/cross-question/ (or within existing L5 structure)**

| Card | Type | Content |
|---|---|---|
| cross-q-demo-01.yml | DemoCard | "Q2 fields propagate: user_id in struct → cin >> list[i].user_id → cout << desks[i].user_id" |
| cross-q-linked-01.yml | StructWriteCard | "Write struct for printer_data: printer_id, model_id, paper_count" |
| cross-q-linked-02.yml | FunctionWriteCard | "Now write read_printers body. Use YOUR field names from previous card." |
| cross-q-linked-03.yml | MainWriteCard | "Now write main. Call your read function. Print using YOUR field names." |
| cross-q-linked-04.yml | StructWriteCard | "Write struct for vehicle_data: vehicle_id, wheels, mileage" |
| cross-q-linked-05.yml | FunctionWriteCard | "Now write read_vehicles. Use YOUR field names." |
| cross-q-linked-06.yml | MainWriteCard | "Now write main for vehicles." |
| cross-q-linked-07.yml | StructWriteCard | Entity: book_data |
| cross-q-linked-08.yml | FunctionWriteCard | read_books using book_data fields |
| cross-q-linked-09.yml | MainWriteCard | main for books |

**Count: 10 new cards (1 Demo + 9 production).**

### Wave 6: Additional content from atoms-to-author.md

The existing atoms-to-author.md plan identifies 316 new cards across 11 gaps.
This remains valid and complementary to the terminal epistemology cards.

**Reprioritized by bedrock coverage:**

| Gap | Cards | Priority | Rationale |
|---|---|---|---|
| Gap 1: Confusable pairs | ~50 | HIGH | Covers Q1-B05, B16, B42 (DISC bedrocks) |
| Gap 2: Q1 traps | ~30 | HIGH | Covers Q1-B49, B50, B51 (TRAP bedrocks) |
| Gap 3: Q4 traps | ~50 | HIGH | Covers Q4-B04, B05 (TRAP bedrocks) |
| Gap 4: Q2 traps | ~30 | MED | Covers Q2-B05, B06 (already partially covered) |
| Gap 5: Q3 traps | ~30 | MED | Covers Q3-B08, B11, B12 |
| Gap 6: Brace-init nested | ~10 | MED | Covers Q1-B39, B40 |
| Gap 7: Q1 entity variants | 16 | MED | Prevents slot fusion |
| Gap 8: Q3/Q4 entity variants | 16 | MED | Prevents slot fusion |
| Gap 9: Mock papers | 20 | HIGH | Integration testing |
| Gap 10: ProceduralCard gaps | ~24 | LOW | Phase 3 automation |
| Gap 11: Ladder completion | ~40 | LOW | Polish |

**Count: ~316 cards (from existing plan).**

---

## TOTAL NEW CARD COUNT

| Wave | Cards | What |
|---|---|---|
| Wave 1: L3 DemoCards | 8 | Install phase for Q3 |
| Wave 2: Exam strategy | 9 | Metacognitive bedrocks |
| Wave 3: L0 partial fixes | 10 | Explicit teaching for 4 bedrocks |
| Wave 4: Terminal epistemology gaps | 15 | Bedrocks missed by prior analysis |
| Wave 5: Cross-Q coupling | 10 | Relational bedrocks |
| Wave 6: atoms-to-author.md | 316 | Confusables, traps, variants, mocks |
| **TOTAL NEW** | **~368** | — |

**New total: 2,528 + 368 = ~2,896 unique cards**

With spaced repetition encounters (each card seen ~1.3× on average across the linear walk): **~3,500-3,800 card encounters**.

---

## REVISIONS TO EXISTING CARDS

### Revision 1: Add `whyOneLine` to cards missing it

Many v2 cards (especially MCQ, Cloze, Trace, Write types) lack `whyOneLine`.
Terminal epistemology says every card needs WHY this matters visible.

**Scope**: audit all 2,528 cards. Cards without `whyOneLine` get one added.
**Effort**: batch-scriptable. One sentence per card referencing its bedrock.
**Priority**: MEDIUM (doesn't block new content, but improves existing).

### Revision 2: Ensure every atom has at least 1 DemoCard

Current: 28 atoms have DemoCards out of 66 total atoms.
After Wave 1-4: ~36 atoms will have DemoCards.
Remaining ~30 atoms are cm-immunization and stage-specific atoms that drill
WITHIN a concept — their parent atom has the DemoCard.

**Action**: verify each cm-immunization atom links to a parent DemoCard.
No new DemoCards needed for cm-immunization if parent covers the bedrock.

### Revision 3: L3 cout removal verification

Per memory: 162 cards had cout stripped from L3 on 2026-05-08.
Verify all L3 FunctionWriteCards use cin only, no cout in expected answers.

**Status**: already done per project memory. Verify with lint.

---

## NEW LINEAR FLOW

### Current flow

Home page → pick level L0-L5 → Sequence walks cards within that level.
Student must manually select each level. No enforced order across levels.

### Proposed flow

**Option A (minimal change)**: Keep current structure. Add guidance card at L0 start
and between levels. Student still picks levels but knows the order.

**Option B (true linear walk)**: Single "Start" button. Sequence walks ALL cards
L0→L1→L2→L3→L4→L5 in one continuous stream. No level picker needed.

**Recommendation: Option A** for now. Reason: Option B requires Sequence.tsx changes
(remove level filter, load all levels). Option A requires only new content cards.
Ship content first, sequence change later if needed.

### Card order WITHIN each level

Current: cards ordered by filesystem glob (alphabetical by path).
This is ALREADY correct because atoms are named F-01, F-02, ... and cards within
atoms are demo-01, decompose-01, mcq-01, etc. — the alphabetical order matches
the pedagogical ladder: Demo → Decompose → MCQ → Cloze → Trace → Write → Procedural.

**Verification needed**: confirm glob order matches intended pedagogy. If not,
add explicit `order` field to cards or rename files to enforce sort.

### New level structure after all waves

| Level | Purpose | Cards (current + new) | Phases covered |
|---|---|---|---|
| L0 | Pre-programming + C++ foundations | 517 + 25 = ~542 | Install + Verify + Automate for 26 bedrocks |
| L1 | Q1 hand-execute mastery | 836 + 3 = ~839 | All phases for Q1 bedrocks |
| L2 | Q2 struct writing | 259 + ~35 = ~294 | All phases for Q2 bedrocks |
| L3 | Q3 read function | 430 + ~48 = ~478 | All phases for Q3 bedrocks (DemoCards added!) |
| L4 | Q4 main function | 403 + ~58 = ~461 | All phases for Q4 bedrocks |
| L5 | Integration + mocks + exam strategy | 83 + ~39 = ~122 | Cross-Q coupling + mocks + meta |
| **TOTAL** | — | **~2,736** + padding = **~2,900** | All 82 bedrocks |

---

## AUTHORING PRIORITY ORDER

Ship order based on exam date (May 14 = 6 days away):

### Day 1 (May 8): Waves 1 + 2 — structural gaps [17 cards]

- [ ] 8 L3 DemoCards (Q3 has ZERO install cards — most critical)
- [ ] 9 exam strategy cards (metacognitive bedrocks)
- [ ] Run `npm run dev` and verify all new cards load

### Day 2 (May 9): Wave 3 + 4 — bedrock gaps [25 cards]

- [ ] 10 L0 partial-coverage fixes
- [ ] 15 terminal epistemology gap cards
- [ ] Verify card order in Sequence matches pedagogy

### Day 3 (May 10): Wave 5 + Wave 6 priority items [~90 cards]

- [ ] 10 cross-Q coupling cards
- [ ] Gap 2: Q1 trap atoms (~30 cards)
- [ ] Gap 3: Q4 trap atoms (~50 cards)

### Days 4-5 (May 11-12): Wave 6 remaining [~226 cards]

- [ ] Gap 1: Confusable pairs (~50)
- [ ] Gap 4-5: Q2/Q3 traps (~60)
- [ ] Gap 6-8: Brace-init + entity variants (~42)
- [ ] Gap 9: Mock papers (~20)
- [ ] Gap 10-11: ProceduralCard + ladder completion (~64)

### Day 6 (May 13): Verification + revision pass

- [ ] Lint all new cards: `npm run lint:v2-cards`
- [ ] Verify no drift: `npm run lint:drift`
- [ ] Manual walkthrough: student path L0→L5
- [ ] Add `whyOneLine` to existing cards missing it (batch script)

---

## FILE NAMING CONVENTION

New cards follow existing pattern:

```
data/v2/cards/L{level}/{atom-id}/{type}-{number}.yml

Examples:
  L3/S1-Tour/demo-01.yml
  L3/S1-Tour/demo-02.yml
  L5/exam-strategy/demo-01-wrong-gt-blank.yml
  L5/cross-question/cross-q-demo-01.yml
  L0/F-20/demo-04.yml
  L0/F-08/demo-03.yml
```

### New atom directories to create

```
L3/S1-Tour/           (may already exist — needs DemoCards added)
L5/exam-strategy/     (new)
L5/cross-question/    (new)
```

---

## CARD SCHEMA FOR NEW CARDS

All new cards use existing v2 schema. No new fields. No new card types.

Every new DemoCard includes:

```yaml
id: "L{n}-{atom}-demo-{nn}"
schemaVersion: "v2"
atomId: "{atom}"
qTags: ["{Qn}"]
stage: {n}
level: "L{n}"
type: "DemoCard"

stem: |
  {What the student sees — the question or scenario}

whyOneLine: "{WHY this matters for Test 2 — 1 sentence, always visible}"

demoCode: |
  {Code example with annotations}

highlightTokens:
  - {key tokens}

usedIn:
  - {Where this appears on the exam}

source:
  kind: "v2"
  ref: "{source reference}"

commonMistakeIds: [{relevant CMs}]
status: "NEW"
createdBy: "TERMINAL-EPISTEMOLOGY"
authoringStatus: "DRAFT"
```

---

## VERIFICATION CHECKLIST

After all waves complete:

- [ ] Every bedrock in terminal-epistemology-0-to-1.md §Appendix has ≥1 DemoCard
- [ ] Every level L0-L5 has ≥1 DemoCard
- [ ] Every Q-shape (Q1-Q4) has dedicated Demo→MCQ→Write ladder
- [ ] Cross-Q coupling tested by linked cards in L5
- [ ] Exam strategy cards exist and are walkable
- [ ] `npm run dev` loads all cards without errors
- [ ] `npm run build` produces clean dist/
- [ ] Card count ≥ 2,800 (28+ bedrocks × ~34 cards per bedrock average)
- [ ] Linear walk L0→L5 covers all 82 bedrocks in dependency order
