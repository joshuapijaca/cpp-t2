# Atoms to Author — Pure Content Gap Plan

**Goal**: Fill content gaps so a blank-slate Joshua walks the existing app daily and emerges able to write all 4 Test 2 answers perfectly. **No new features. No new card types. No new pages. No new engines. JUST CARDS.**

**Source curriculum**: `cpp-t2/docs/v2/curriculum-design-blank-slate-to-hurdle.md`
**Current data root**: `cpp-t2/data/v2/cards/{L0,L1,L2,L3,L4,L5}/`
**Card types available** (14, all already implemented): MemorizeCard, MCQCard, TraceCard, WriteCard, ClozeCard, DecomposeCard, WalkthroughCard, DemoCard, ProceduralCard, MemorizeCard, CodeMemorizeCard, TemplateRecallCard, StructWriteCard, FunctionWriteCard, MainWriteCard

---

## Inventory snapshot

| Level | Atom dirs | Notable gaps |
|---|---|---|
| L0 | 32 atoms (F-01..F-22e + 3 PATCH) | Most atoms have 4-6 card types (no full 7-type ladder) |
| L1 | 6 stages (Tour/Template/Components/Compose/Variations/Speed) + 34 cm-immunization | Solid Q1 coverage |
| L2 | 8 stages | Solid Q2 coverage |
| L3 | 6 stages + cm-immunization | Solid Q3 coverage |
| L4 | 6 stages + **only 9 cm-immunization** | ⚠ thin error inoculation on the highest-cognitive-load question |
| L5 | 4 sections (warmup/partial-mocks/postmortem/wildcard) | Mocks present but no pure-confusable-drill section |

---

## Gap 1 — Confusable-pair atoms (HIGHEST PRIORITY)

A blank-slate's #1 freeze trigger: confusing tokens that look alike. The cm-immunization folders have scattered confusable cards (`CM-confuse-eq-pluseq`, `CM-bitwise-amp`) but no dedicated discrimination atom drilling each pair side-by-side.

### New atoms to author

| Atom path | Pair | Card mix per atom |
|---|---|---|
| `L0/F-CONF-eq/` | `=` (assign) vs `==` (compare) | demo-01 + decompose-01 + walkthrough-01 + 3× mcq + 2× cloze + write-01 |
| `L0/F-CONF-shift/` | `<` (compare) vs `<<` (cout) AND `>` vs `>>` (cin) | demo-01 + decompose-01 + walkthrough-01 + 4× mcq + 2× cloze |
| `L0/F-CONF-amp/` | `&` (reference) vs `&&` (logical) vs `&x` (address-of, NOT on Test 2) | demo-01 + decompose-01 + walkthrough-01 + 4× mcq + 2× cloze + write-01 |
| `L0/F-CONF-stream-direction/` | `cin >> x` vs `cout << x` (direction discrimination) | demo-01 + walkthrough-01 + 3× mcq + 2× cloze + write-01 + 2× fault-spot |
| `L0/F-CONF-int-vs-double-literal/` | `0` vs `0.0`, `5` vs `5.0` (type literal subtlety) | demo-01 + 3× mcq + 2× cloze |

**Card content style**: every card SHOWS BOTH members of the pair side-by-side in code, asks "which fits here?" — never one in isolation.

**Total new cards**: ~50 cards across 5 atoms.

---

## Gap 2 — Q1 trap atoms (Q1-specific kill-shots)

The actual Q1 V2.0 paper has 4 cognitive traps not currently covered by dedicated atoms.

### New atoms to author

| Atom path | Trap | Card mix |
|---|---|---|
| `L1/cm-immunization/CM-Q1-init-overwrite/` | `data.mystery = 0.0;` overwrites the brace-init `-0.9` (the #1 trap on Q1 V2.0 — answer is 7.4 NOT 6.5) | walkthrough-01 + 2× trace + 2× mcq + write-01 + fault-spot-01 |
| `L1/cm-immunization/CM-Q1-strict-comparison/` | `0 > 0` is FALSE; `> 0` excludes zero (subtle but exam-critical) | demo-01 + 2× mcq + 2× cloze + 2× trace |
| `L1/cm-immunization/CM-Q1-loop-exit-i/` | After `for (i=0; i<5; i++)` exits, `i == 5` not `4` (off-by-one comprehension) | demo-01 + 2× mcq + 2× trace + walkthrough-01 |
| `L1/cm-immunization/CM-Q1-data-d-alias/` | `data` inside `who_am_i` IS `d` outside (reference parameter alias) — modifications visible to caller | demo-01 + walkthrough-01 + 3× mcq + 2× trace + write-01 |

**Total new cards**: ~30 cards across 4 atoms.

---

## Gap 3 — Q4 trap atoms (the thinnest-covered question)

L4 cm-immunization has only 9 mistakes but Q4 is the highest-cognitive-load question. Each Tier-1 Q4 error needs its own atom with full drill ladder.

### New atoms to author

| Atom path | Trap | Card mix |
|---|---|---|
| `L4/cm-immunization/CM-Q4-MAX-vs-desk_num-call/` | Pass `MAX` not `desk_num` to read_X (reads 100 garbage desks) | demo-01 + walkthrough-01 + 3× mcq + 2× cloze + 2× write + fault-spot-01 |
| `L4/cm-immunization/CM-Q4-MAX-vs-desk_num-loop/` | Loop `for (i=0; i<MAX; i++)` instead of `desk_num` (prints 100 garbage rows) | demo-01 + 3× mcq + 2× cloze + 2× write + fault-spot-01 |
| `L4/cm-immunization/CM-Q4-amp-call-site/` | `read_desks(&desks, n)` vs correct `read_desks(desks, n)` — `&` lives in DEFINITION not CALL | demo-01 + walkthrough-01 + 3× mcq + 2× cloze + write-01 + fault-spot-01 |
| `L4/cm-immunization/CM-Q4-cout-direction/` | `cin << x` instead of `cin >> x` | demo-01 + 2× mcq + 2× cloze + 2× fault-spot |
| `L4/cm-immunization/CM-Q4-no-prompt/` | Missing `cout << "Enter..."` before `cin` | demo-01 + 3× mcq + cloze-01 + write-01 |
| `L4/cm-immunization/CM-Q4-field-name-drift/` | Q2 said `user_id`, Q4 wrote `userid` (must match Q2 EXACTLY) | demo-01 + 3× mcq + 2× write + fault-spot-01 |

**Total new cards**: ~50 cards across 6 atoms (brings L4 cm from 9 → 15 mistakes covered).

---

## Gap 4 — Q2 trap atoms

L2 has good template coverage but the trailing-`;` killer needs its own dedicated drill atom (currently scattered).

### New atoms to author

| Atom path | Trap | Card mix |
|---|---|---|
| `L2/cm-immunization/CM-Q2-trailing-semicolon/` | `};` after struct close brace (most-forgotten char in C++) | demo-01 + walkthrough-01 + 5× mcq + 3× cloze + 2× write + 3× fault-spot |
| `L2/cm-immunization/CM-Q2-snake-case-fields/` | snake_case (`user_id`) vs camelCase (`userId`) — SIT102 convention | 3× mcq + 2× cloze + write-01 |
| `L2/cm-immunization/CM-Q2-field-count-spec/` | Spec lists 3 fields → struct has exactly 3 fields | demo-01 + 3× mcq + 2× write |
| `L2/cm-immunization/CM-Q2-id-int-vs-string/` | "id" defaults to `int`; `string` only if spec says UUID | 3× mcq + 2× decompose |

**Total new cards**: ~30 cards across 4 atoms.

---

## Gap 5 — Q3 trap atoms

L3 cm-immunization exists but check coverage for these specific traps:

### New atoms to author

| Atom path | Trap | Card mix |
|---|---|---|
| `L3/cm-immunization/CM-Q3-no-cout-in-read-fn/` | Read functions are pure cin — NO cout prompts in body (V2.0 contract) | demo-01 + walkthrough-01 + 3× mcq + 2× cloze + 2× write |
| `L3/cm-immunization/CM-Q3-loop-bound-not-SIZE/` | Loop bound is `number_to_read` (parameter), NOT `SIZE` or `MAX` | demo-01 + 3× mcq + 2× cloze + 2× write |
| `L3/cm-immunization/CM-Q3-composite-index-dot/` | `desk_list[i].field` parses index-FIRST then dot — never `desk_list.field[i]` | demo-01 + 3× mcq + 2× cloze + 2× write |
| `L3/cm-immunization/CM-Q3-field-names-from-Q2/` | Field names in cin must match Q2 struct EXACTLY (cross-question coupling) | 3× mcq + 2× write + fault-spot-01 |

**Total new cards**: ~30 cards across 4 atoms.

---

## Gap 6 — Brace-init nested explicit drill

`L1/S2-Template/T-F-brace-init/` exists but the curriculum needs more dedicated drill on the nested `{ {array}, scalar }` pattern.

### New atoms to author

| Atom path | Concept | Card mix |
|---|---|---|
| `L0/F-BRACE-INIT-nested/` | Outer `{...}` per struct field in declaration order; inner `{...}` per array contents | demo-01 + walkthrough-01 + 3× mcq + 3× cloze + 2× trace |

Concrete card content example:
- demo: show `stat_double d = { {2.4, -3.7, -1.7, 3.0, 2.0}, -0.9 };` with arrows annotating outer-vs-inner
- trace: given the line, ask student to fill `d.numbers[0..4]` + `d.mystery` values
- mcq: "What is `d.numbers[3]`?" / "What is `d.mystery`?"
- cloze: fill in the brace-init line given partial pattern

**Total new cards**: ~10 cards.

---

## Gap 7 — Q1 substitution variants (entity drill)

Current trace cards mostly use `stat_double` and 1-2 entities. The curriculum requires **8-entity rotation** to prevent slot fusion (student memorizing `stat_double` so deeply that `stat_float` trips them).

### New trace cards to author (within existing L1 atoms — no new atom)

For `L1/S5-variations/`, add 8-entity trace variants:

| Variant entity | Field names | Algorithm | Cards |
|---|---|---|---|
| `stat_float` | `values[5]`, `result` | sum-of-positives | trace-01 + walkthrough-01 |
| `stat_int` | `numbers[5]`, `total` | sum-of-positives | trace-01 + walkthrough-01 |
| `data_box` | `entries[5]`, `agg` | find-max | trace-01 + walkthrough-01 |
| `stats_pkg` | `samples[5]`, `mean` | average | trace-01 + walkthrough-01 |
| `record_set` | `values[5]`, `count_pos` | count-positive | trace-01 + walkthrough-01 |
| `metric_bag` | `points[5]`, `max_val` | find-max | trace-01 + walkthrough-01 |
| `score_sheet` | `marks[5]`, `pass_count` | count >= 50 | trace-01 + walkthrough-01 |
| `temp_log` | `readings[5]`, `min_val` | find-min | trace-01 + walkthrough-01 |

**Total new cards**: 16 cards (2 per variant × 8 variants).

---

## Gap 8 — Q3/Q4 substitution variants (entity drill)

Same principle: 8 entity variants for read-fn + main templates.

### New cards to author (within existing L3/L4 stages — no new atoms)

For each of these 8 entities, author 1× FunctionWriteCard (Q3-shape) + 1× MainWriteCard (Q4-shape):

| Entity | Q2 fields | MAX | Count param |
|---|---|---|---|
| `desk_data` (canonical) | `user_id`, `desk_id`, `number_of_screens` | 100 | `number_to_read` |
| `printer_data` | `printer_id`, `model_id`, `paper_count` | 50 | `total` |
| `book_data` | `book_id`, `pages`, `year` | 200 | `n` |
| `computer_data` | `computer_id`, `ram_gb`, `cpu_cores` | 100 | `count` |
| `employee_data` | `employee_id`, `years_service`, `salary` | 500 | `num_employees` |
| `vehicle_data` | `vehicle_id`, `wheels`, `mileage` | 75 | `num_vehicles` |
| `recipe_data` | `recipe_id`, `prep_minutes`, `servings` | 30 | `recipe_count` |
| `student_data` | `student_id`, `grade`, `enrollment_year` | 150 | `total` |

**Total new cards**: 16 cards (8 Q3 variants in L3/S5-Variations + 8 Q4 variants in L4/S5-Variations).

---

## Gap 9 — Mock paper completeness

L5 has partial-mocks + wildcard but missing **5 fresh-content full mock papers** for Days 9-13 of the curriculum cycle.

### New mock papers to author

`L5/mock-papers/M-001` through `M-005`, each containing 4 cards (Q1 trace + Q2 struct + Q3 fn + Q4 main):

| Mock | Entity | Q1 algorithm |
|---|---|---|
| M-001 | `stat_double` | sum-of-positives (matches V2.0 attempt 1 verbatim) |
| M-002 | `stat_float` | find-max |
| M-003 | `book_data` (Q1 = simple int trace) | average |
| M-004 | `temp_log` | find-min |
| M-005 | `score_sheet` | count >= threshold |

**Total new cards**: 20 cards (4 per paper × 5 papers).

---

## Gap 10 — Procedural-card 3-streak coverage gaps

Audit of L0 reveals many atoms missing `procedural-*.yml` (the 3-streak gate card type). Without ProceduralCard, no atom can hit the curriculum's "atom retires only after 3-streak" milestone.

### Add ProceduralCard to these L0 atoms (1 card each)

`F-13` (cout chained), `F-14a`/`F-14b` (cin), `F-15` (prompt+read), `F-16` (==), `F-17` (if), `F-18` (for), `F-19` (array), `F-20` (struct), `F-21` (dot field access), `F-22a`/`F-22b`/`F-22c`/`F-22d`/`F-22e` (function + ref + decay) → ~14 atoms missing ProceduralCard.

### Add ProceduralCard to L1-L4 stage atoms (1-2 cards each)

L1 S3-components, L1 S4-compose, L2 L2-23a/b/c, L3 S3-Components, L4 S3-Components → ~10 atoms.

**Total new cards**: ~24 ProceduralCards.

---

## Gap 11 — Existing atom ladder completion

Many L0 atoms have only 4-5 of the 7 ladder card types. Per the curriculum's day-of-introduction ladder (Demo→Decompose→Walkthrough→Trace→Cloze→Write→Procedural), each atom should have all 7.

### Audit + author

Audit each L0 atom against the full ladder. Common missing types:
- F-22b (pass-by-ref): missing walkthrough, trace, write, procedural
- F-22d (mutation visibility): missing trace, write
- F-22e (array decay): missing trace, procedural
- F-19 (arrays): check trace coverage
- F-20 (structs): check trace coverage

**Estimated**: 3-5 missing card types per gap atom × ~10 gap atoms = ~40 cards.

---

## TOTAL CARD AUTHORING WORKLOAD

| Gap # | Title | New atoms | New cards |
|---|---|---|---|
| 1 | Confusable-pair atoms | 5 | ~50 |
| 2 | Q1 trap atoms | 4 | ~30 |
| 3 | Q4 trap atoms | 6 | ~50 |
| 4 | Q2 trap atoms | 4 | ~30 |
| 5 | Q3 trap atoms | 4 | ~30 |
| 6 | Brace-init nested | 1 | ~10 |
| 7 | Q1 substitution variants | 0 (within S5) | 16 |
| 8 | Q3/Q4 substitution variants | 0 (within S5) | 16 |
| 9 | Mock papers | 5 paper dirs | 20 |
| 10 | ProceduralCard coverage | 0 (within existing atoms) | ~24 |
| 11 | Existing-atom ladder completion | 0 (within existing atoms) | ~40 |
| **TOTAL** | — | **24 new atoms** | **~316 new cards** |

Current deck: 2,528 cards. After gap-fill: ~2,844 cards (+12.5%).

---

## SEQUENCING — what to author first

Order by hurdle-fatality (Tier 1 errors first):

1. **Gap 3** (Q4 traps) — highest-impact since L4 cm-immunization is thinnest and Q4 is highest-cognitive-load
2. **Gap 2** (Q1 traps) — the actual V2.0 paper traps (init overwrite, strict comparison)
3. **Gap 1** (confusable pairs) — kills #1 freeze trigger
4. **Gap 4** (Q2 traps) — the trailing `;` killer + naming
5. **Gap 5** (Q3 traps) — cross-question coupling
6. **Gap 6** (brace-init) — Q1 setup trap
7. **Gap 9** (mock papers) — needed Days 9-13 of drill cycle
8. **Gap 7-8** (substitution variants) — prevent slot fusion
9. **Gap 10-11** (ladder + procedural completion) — polish for 3-streak gating

---

## CARD CONTENT TEMPLATES

For each new atom, follow these templates (adapt content to the specific concept).

### DemoCard template

```yaml
id: "L0-CONF-eq-demo-01"
schemaVersion: "v2"
atomId: "F-CONF-eq"
qTags: ["Q1"]
stage: 0
level: "L0"
type: "DemoCard"

stem: |
  See the difference between = (assignment) and == (comparison).

whyOneLine: "= stores; == tests. Mixing them is the #1 silent bug."

demoCode: |
  int x = 5;       // = stores 5 into x
  if (x == 5) {    // == tests if x equals 5
    cout << "yes";
  }
  // BUG: if (x = 5) would assign 5 (always truthy)

highlightTokens:
  - "="
  - "=="

usedIn:
  - "Every Q1 trace condition"
  - "Every if statement"

source:
  kind: "pfg"
  ref: "Programming Fundamentals Guide § part-1/3-control-flow/2-trailside/01-0-boolean-data"

commonMistakeIds: ["CM-confuse-eq-pluseq"]
status: "NEW"
createdBy: "GAP-FILL-W1"
authoringStatus: "DRAFT"
```

### MCQCard template (confusable-pair)

```yaml
id: "L0-CONF-eq-mcq-01"
schemaVersion: "v2"
atomId: "F-CONF-eq"
qTags: ["Q1"]
stage: 0
level: "L0"
type: "MCQCard"

stem: |
  Inside an if condition you want to test if x equals 5. Which symbol?

  ```cpp
  if (x ??? 5) {
    cout << "match";
  }
  ```

correct: "== — equality comparison test, returns true/false."

distractors:
  - "= — but this would ASSIGN 5 to x and the if always runs (5 is truthy). Silent bug."
  - "=== — that's JavaScript, not C++. Not valid here."
  - "is — that's Python. C++ uses ==."

explanation: |
  In C++, = is assignment (stores right into left). == is equality test.
  Inside if/while conditions you want the test, not the store.
  Writing if (x = 5) compiles but always runs the body — classic silent bug.

source:
  kind: "pfg"
  ref: "Programming Fundamentals Guide § part-1/3-control-flow/2-trailside/01-0-boolean-data"

commonMistakeIds: ["CM-confuse-eq-pluseq"]
status: "NEW"
createdBy: "GAP-FILL-W1"
authoringStatus: "DRAFT"
```

### TraceCard template (Q1-trap-specific)

```yaml
id: "L1-Q1-init-overwrite-trace-01"
schemaVersion: "v2"
atomId: "CM-Q1-init-overwrite"
qTags: ["Q1"]
stage: 1
level: "L1"
type: "TraceCard"

stem: |
  Trace this. Pay attention to what happens to d.mystery in line 9.

code: |
  const int SIZE = 5;
  struct stat_double {
    double numbers[SIZE];
    double mystery;
  };
  void who_am_i(stat_double &data) {
    int i;
    data.mystery = 0.0;
    for (i = 0; i < SIZE; i++) {
      if (data.numbers[i] > 0) {
        data.mystery = data.mystery + data.numbers[i];
      }
    }
  }
  stat_double d = { {2.4, -3.7, -1.7, 3.0, 2.0}, -0.9 };
  who_am_i(d);

variables: ["i", "d.mystery"]

expectedTrace:
  - { line: 8, variable: "d.mystery", value: "0.0" }   # OVERWRITE -0.9
  - { line: 11, variable: "d.mystery", value: "2.4" }
  - { line: 11, variable: "d.mystery", value: "5.4" }
  - { line: 11, variable: "d.mystery", value: "7.4" }
  - { line: 9, variable: "i", value: "5" }

terminalOutput: []
inputMode: "final-only"

teachMe: |
  CRITICAL: line 8 (data.mystery = 0.0) OVERWRITES the -0.9 from
  the brace-init. The accumulation starts from 0.0, not from -0.9.
  Final answer: 0.0 + 2.4 + 3.0 + 2.0 = 7.4 (NOT 6.5).

source:
  kind: "practice"
  ref: "Test2-SIT102-V2.0 Q1 (sat 2026-05-07)"

commonMistakeIds: ["CM-Q1-init-overwrite"]
status: "NEW"
createdBy: "GAP-FILL-W2"
authoringStatus: "DRAFT"
```

---

## ANTI-DRIFT RULES (preserved verbatim)

- ✅ All new content uses the existing 14 card types
- ✅ All new atoms slot under existing L0-L5 levels
- ✅ All new content cites real source-data files (`tier1:` or `tier2:` per MANIFEST)
- ✅ NO new pages, NO new engine, NO new card types, NO new schema fields
- ✅ Lint stays clean: `npm run lint:drift` and `npm run lint:v2-cards` exit 0

---

## DEFINITION OF DONE

When all 24 new atoms + ~316 new cards are authored:

1. Joshua opens app on Day 1 → walks Layer-0 atoms (skeleton, output, variables) → ends Day 1 with 1 successful trace
2. Joshua walks Layer-by-Layer (per existing prereq order in YAML build pipeline) for 14 days
3. By Day 7 he can write the Q2 struct from spec from memory
4. By Day 10 he can write Q3 read function from spec
5. By Day 12 he can write Q4 main from skeleton
6. By Day 14 he can hand-execute Q1 trace getting d.mystery = 7.4 reliably
7. He sits May 14 / May 21 attempt and writes all 4 answers perfectly

The gap-fill is **PURELY ATOMS + CARDS**. The app runs them via the existing engine + UI. Nothing else changes.
