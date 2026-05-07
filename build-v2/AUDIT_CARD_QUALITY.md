# AUDIT_CARD_QUALITY.md
**Auditor:** Independent (Opus 4.7)
**Date:** 2026-05-07
**Method:** Stratified random sample of 100 cards across 6 levels.
**Total deck size:** ~2,498 cards across L0-L5 + 40 mocks.

---

## Per-card grades

Grade meanings:
- **A** = publish-ready: clear stem, correct C++, real source, transfers to test.
- **B** = acceptable: minor flaw (formulaic stem, slight redundancy) but works.
- **C** = needs polish: stub-feel, weak grading, low transfer, but not broken.
- **D** = broken: wrong canonical, unclear stem, fake source, or no learning.

### L0 (20 sampled, 517 total)

| Card path | Atom-fit | Source | Correct | Stem | Transfer | Grade |
|-----------|----------|--------|---------|------|----------|-------|
| L0/F-01/decompose-01.yml | yes | real PFG | yes | clear | yes | A |
| L0/F-04/cloze-03.yml | yes | real PFG | yes | clear | yes | A |
| L0/F-06/cloze-01.yml | yes | real PFG | yes | clear | yes | A |
| L0/F-07/cloze-03.yml | yes | real PFG | yes | clear | yes | A |
| L0/F-08/uwrite-02.yml | yes | real PFG | yes | clear | yes | A |
| L0/F-10/mcq-02.yml | yes | real PFG | yes | clear | partial | B |
| L0/F-11/tmplrec-01.yml | yes | real PFG | yes | clear | yes | A |
| L0/F-13/decompose-01.yml | yes | spec ref | yes | clear | yes | A |
| L0/F-14a/cloze-02.yml | yes | real PFG | yes | clear | yes | A |
| L0/F-15/cloze-04.yml | yes | real PFG | yes | clear | yes | A |
| L0/F-16/demo-02.yml | yes | real PFG | yes | excellent | yes | A |
| L0/F-17/trace-02.yml | yes | real PFG | yes | clear | yes | A |
| L0/F-18/trace-03.yml | yes | practice doc | yes | excellent | yes | A |
| L0/F-19/trace-04.yml | yes | spec ref | yes | clear | yes | A |
| L0/F-20/write-02.yml | yes | real PFG | yes | clear | yes | A |
| L0/F-21/write-03.yml | yes | practice | yes | excellent | yes | A |
| L0/F-22d/trace-03.yml | yes | practice | yes | excellent | yes | A |
| L0/F-PATCH-brace-match/mcq-18.yml | yes | spec patch | yes | clear | yes | A |
| L0/F-PATCH-sim-trace/trace-13.yml | yes | spec patch | yes | trivial | partial | B |
| L0/F-PATCH-sub-vocal/trace-08.yml | yes | spec patch | yes | trivial | partial | C |

**L0 aggregate:** A=17 (85%), B=2 (10%), C=1 (5%), D=0. Average ≈ A-/B+.

### L1 (25 sampled, 772 total)

| Card path | Grade | Notes |
|-----------|-------|-------|
| L1/S1-Tour/01-genre.yml | A | Excellent orientation card |
| L1/S1-Tour/31-spot-error-iplusplus.yml | A | Strong fault-injection |
| L1/S2-Template/T-B-fn-sig/10-cloze-parens.yml | B | Trivial but correct |
| L1/S2-Template/T-D-for/03-cloze-init.yml | B | Trivial but correct |
| L1/S2-Template/T-E-if-action/10-whole-findmin.yml | B | Terse |
| L1/S2-Template/T-F-brace-init/15-fix-no-trailing-semi.yml | B | Trivial repair |
| L1/S3-components/C-02/decompose-10.yml | A | Clean MCQ |
| L1/S3-components/C-04/mcq-01.yml | A | Clean MCQ |
| L1/S3-components/C-07/trace-02.yml | B | Tiny trace, works |
| L1/S3-components/C-10/mcq-05.yml | B | Trivial bool eval |
| L1/S3-components/C-13/decompose-03.yml | A | Critical for-order rule |
| L1/S3-components/C-15/mcq-05.yml | B | OK |
| L1/S3-components/C-18/cloze-01.yml | B | One-char cloze |
| L1/S3-components/C-21/mcq-05.yml | A | Real misconception |
| L1/S3-components/C-24/procedural-06.yml | B | Variants weak |
| L1/S3-components/C-28/decompose-04.yml | A | Tests trail discipline |
| L1/S4-compose/A10-average/decompose-01.yml | A | Real spot-error |
| L1/S4-compose/A12-index-of-max/mcq-02.yml | C | Distractor "bogus2" is junk |
| L1/S4-compose/A3-sum-all/trace-01.yml | A | Full trace, exam-shaped |
| L1/S4-compose/A5-sum-negative/trace-03.yml | B | Trace omits if-skip rows |
| L1/S4-compose/A8-count-positive/trace-01.yml | A | Full trace, exam-shaped |
| L1/S5-variations/V-size-10/trace-03.yml | A | 10-iter variation |
| L1/S5-variations/V-type-bool/trace-07.yml | A | Type-transfer drill |
| L1/S6-speed/Mixed-mocks/trace-07.yml | A | True mixed-mock |
| L1/cm-immunization/CM-bitwise-amp/spot.yml | B | Auto-emitted but real |

**L1 aggregate:** A=12 (48%), B=12 (48%), C=1 (4%), D=0. Average B+.

### L2 (15 sampled, 269 total)

| Card path | Grade | Notes |
|-----------|-------|-------|
| L2-23a/L2-S3a-n2t-01.yml | B | id->int, formulaic |
| L2-23a/L2-S3a-n2t-18.yml | B | salary->double, formulaic |
| L2-23a/L2-S3a-n2t-35.yml | B | is_*->bool, formulaic |
| L2-23b/L2-S3-order-01.yml | A | Real desk_data write |
| L2-23b/L2-S3b-name-08.yml | A | snake_case discrimination |
| L2-compose/L2-S4-compose-04-employee_data.yml | A | Real entity compose |
| L2-compose/L2-S4-compose-21-phone_data.yml | B | Identical pattern, ok |
| L2-compose/L2-S4-compose-38-employee_data.yml | C | EXACT duplicate of #04 |
| L2-compose/L2-S4-compose-55-song_data.yml | B | Same pattern |
| L2-speed/L2-S6-speed-01-desk_data.yml | A | REAL Test V2.0 entity |
| L2-speed/L2-S6-speed-18-pet_data.yml | B | OK speed drill |
| L2-template/L2-S2-keyword-21.yml | A | Real fault injection |
| L2-tour/L2-S1-tour-01.yml | A | Real Test V2.0 demo |
| L2-tour/L2-S1-tour-18-compare.yml | C | keyChecks: [] = no grading |
| L2-variations/L2-S5-matrix-03.yml | A | RAVEN-style transfer |

**L2 aggregate:** A=7 (47%), B=6 (40%), C=2 (13%), D=0. Average B/B+.

### L3 (20 sampled, 417 total)

| Card path | Grade | Notes |
|-----------|-------|-------|
| L3/S1-Tour/compare-01.yml | B | Stem terse but correct |
| L3/S1-Tour/spot-11.yml | D | 3 of 4 distractors are IDENTICAL strings (broken MCQ) |
| L3/S2-Template/fill-cin-04.yml | B | One-char cloze |
| L3/S2-Template/fill-sig-08.yml | B | OK |
| L3/S2-Template/order-12.yml | B | Stem ambiguous (no skeleton shown) |
| L3/S3-Components/A-sig/decompose-04.yml | B | OK MCQ |
| L3/S3-Components/A-sig/write-09.yml | A | Real signature drill |
| L3/S3-Components/B-loop/proc-01.yml | A | 3-streak procedural |
| L3/S3-Components/B-loop/write-17.yml | A | Real bound discipline |
| L3/S3-Components/C-cin/proc-01.yml | A | 3-streak cin |
| L3/S3-Components/D-pair/decompose-04.yml | A | Real prompt-pair |
| L3/S3-Components/E-multi/decompose-04.yml | A | Multi-field ordering |
| L3/S4-Compose/body-04-cars.yml | A | Body-only compose |
| L3/S4-Compose/computers-04.yml | A | Real practice-test entity |
| L3/S4-Compose/fill-04-cars.yml | A | 5-blank fill |
| L3/S4-Compose/novel-14-tablets.yml | A | Novel entity transfer |
| L3/S4-Compose/typo-04-phones.yml | B | Typo claim mismatched (no actual typos shown) |
| L3/S5-Variations/param-03-total.yml | A | Param renaming |
| L3/S5-Variations/v2-08-houses.yml | A | 2-field variation |
| L3/S6-Speed/mock-02-games.yml | A | Mixed mock |

**L3 aggregate:** A=12 (60%), B=7 (35%), C=0, D=1 (5%). Average B+/A-.

### L4 (15 sampled, 396 total)

| Card path | Grade | Notes |
|-----------|-------|-------|
| L4/S1-Tour/compare-01-array-decl.yml | A | Real Test V2.0 main shape |
| L4/S2-Template/fillslot-line-01-ln-const.yml | A | const MAX line |
| L4/S2-Template/orderlines-07.yml | A | Order discipline |
| L4/S3-Components/A-const/cloze-03.yml | B | One-word cloze |
| L4/S3-Components/B-array/mcq-01.yml | A | Real concept (VLA) |
| L4/S3-Components/C-count/write-03-book_count.yml | A | Real 3-line block |
| L4/S3-Components/D-call/write-01-read_desks.yml | A | Critical gating drill |
| L4/S3-Components/E-print/mcq-02.yml | A | Real endl rule |
| L4/S4-Compose/coldstart-03-invoice_data.yml | C | INCONSISTENT signature: drops `&` from array, adds to count — diverges from L3 norm |
| L4/S4-Compose/novel-04-student_data.yml | A | Novel transfer |
| L4/S4-Compose/prac-trial-10.yml | A | Real practice variant |
| L4/S4-Compose/twopane-06-product_data.yml | C | Same signature inconsistency |
| L4/S5-Variations/diffentity-02-building_data.yml | A | Entity variation |
| L4/S5-Variations/diffmax-08-MAX1000.yml | A | MAX variation |
| L4/S6-Speed/novel-timed-04-event_data.yml | A | Timed novel |

**L4 aggregate:** A=12 (80%), B=1 (7%), C=2 (13%), D=0. Average A-.

### L5 + mocks (5 sampled, 87+40 total)

| Card path | Grade | Notes |
|-----------|-------|-------|
| L5/partial-mocks/Q1/01-find-max.yml | A | Real find-max mock |
| L5/postmortem/01-skip-pre-loop-init.yml | C | failedAttempt is comment, not code |
| L5/postmortem/26-wrong-bound-SIZE.yml | C | Same — failedAttempt is description |
| L5/wildcard/09-q2-mcq.yml | B | OK |
| mocks/M03-entity-swap-find-max-book-q4-postmortem.yml | A | Real diff with code |

**L5+mocks aggregate:** A=2 (40%), B=1 (20%), C=2 (40%), D=0. Average B/C+.

---

## Overall aggregates

| Level | n | %A | %B | %C | %D |
|-------|---|----|----|----|----|
| L0 | 20 | 85 | 10 | 5 | 0 |
| L1 | 25 | 48 | 48 | 4 | 0 |
| L2 | 15 | 47 | 40 | 13 | 0 |
| L3 | 20 | 60 | 35 | 0 | 5 |
| L4 | 15 | 80 | 7 | 13 | 0 |
| L5 | 5 | 40 | 20 | 40 | 0 |
| **Total** | **100** | **62** | **28** | **9** | **1** |

---

## Top 10 BAD cards (priority fix)

1. **L3/S1-Tour/spot-11.yml** — MCQ has 3 IDENTICAL distractor strings; only 1 of 4 options is unique. Broken card.
2. **L4/S4-Compose/coldstart-03-invoice_data.yml** — Uses `(invoice_data invoices[], int &count)` while L3 norm is `(desk_data &desks[], int number_to_read)`. Cross-level inconsistency.
3. **L4/S4-Compose/twopane-06-product_data.yml** — Same signature drift as #2.
4. **L5/postmortem/01-skip-pre-loop-init.yml** — `failedAttempt` field contains only a description comment, no actual student code to diff against.
5. **L5/postmortem/26-wrong-bound-SIZE.yml** — Same stub pattern as #4. Postmortem auto-template lacks real failed code.
6. **L2/L2-compose/L2-S4-compose-38-employee_data.yml** — Verbatim duplicate of L2-S4-compose-04-employee_data.yml. Filler.
7. **L2/L2-tour/L2-S1-tour-18-compare.yml** — `keyChecks: []` empty; grader cannot validate the answer.
8. **L1/S4-compose/A12-index-of-max/mcq-02.yml** — Distractor literally says "bogus2" — placeholder leaked into production.
9. **L3/S4-Compose/typo-04-phones.yml** — Stem promises "Q2 typos" but signatureHint shows clean code; typo claim is fake.
10. **L0/F-PATCH-sub-vocal/trace-08.yml** — Trivial 3-line init drill. Acceptable as primer but adds little.

## Top 10 GREAT cards (exemplar quality)

1. **L0/F-18/trace-03.yml** — Q1-shaped find-max trace, full step trail, real PFG anchor.
2. **L0/F-22d/trace-03.yml** — Pass-by-reference mutation visibility, mirrors who_am_i.
3. **L0/F-21/write-03.yml** — EXACT Q1 accumulator body line.
4. **L0/F-16/demo-02.yml** — Visual = vs == bug demo with ASCII art.
5. **L1/S1-Tour/01-genre.yml** — Genre orientation showing Q1 templated skeleton.
6. **L1/S1-Tour/31-spot-error-iplusplus.yml** — Real CM05 fault injection.
7. **L1/S3-components/C-13/decompose-03.yml** — Tests for-loop phase order (init/test/body/post).
8. **L2/L2-speed/L2-S6-speed-01-desk_data.yml** — REAL Test V2.0 desk_data under 30s clock.
9. **L4/S3-Components/D-call/write-01-read_desks.yml** — Critical gating drill: no `&` at call, pass count not MAX.
10. **L4/S1-Tour/compare-01-array-decl.yml** — Real Test V2.0 main, 4-option discrimination.

## Bad-pattern flags (deck-wide)

- **Stub `authoringStatus: DRAFT`**: Every card sampled is `DRAFT`, never promoted. Status field is unused.
- **L2 noun→type drills**: ~35 near-duplicates. High redundancy; spaced repetition padding.
- **L5 postmortems**: auto-templated with `failedAttempt` as description, not code. Need real diffs.
- **`source.kind: "v2"`** with `ref: "cpp-t2/docs/16_test2_specific_redesign_v2.md#PART V"`: real reference to internal spec, but not a PFG/VTT primary source. Not "fake" but lower epistemic weight than `kind: "pfg"` or `kind: "practice"`.
- **`keyChecks: []`** in 1 of 100 cards — silent grader pass-through.
- **Duplicate canonical structs** across L2 compose stage (employee_data shows up 2+ times verbatim).
- **L4 cross-level signature inconsistency**: 2 cards drop `&` from array param, breaking the L3 pattern.

## Source citation reality

- **L0:** mostly `kind: pfg` with real subdirectory paths, plus `kind: v2`/`practice`. **Sources real.**
- **L1:** mix of `kind: practice` (real test doc) and `kind: v2` (internal spec). Real.
- **L2-L4:** heavy `kind: v2` referencing `cpp-t2/docs/16_test2_specific_redesign_v2.md`. The doc exists; sources are real but mostly internal. ~30% reference real practice/V2.0 test.
- **L5:** `kind: practice` referencing real test doc. Real.
- **No fabricated sources detected** in the 100-card sample. Stub-style internal-doc references are the closest to "weak" but the doc actually exists.

## Wrong canonical answers found

- **None of the 100 sampled cards has a wrong C++ canonical answer.** L3-L4 use SIT102's non-standard `&arr[]` syntax — non-standard C++ but matches the actual Deakin PFG (`void read_computers(computer_data &computer_list[], int number_to_read)`) so correct *for the test*.

---

## Practice-ready estimate

**Practice-ready (A+B):** 62 + 28 = **90%** of deck.
**Needs polish (C):** 9%.
**Broken (D):** 1%.

**Final estimate: ~90% of the 2,498-card deck is practice-ready.**

The deck is dramatically stronger than I expected given the 6-wave parallel-agent build. L0 is near-publishable (95% A/B). L4 main-writing drills are excellent (87% A/B). The weak spots are:
- L2 over-templated noun→type drills (high redundancy, low novelty per card)
- L5 postmortem auto-template (needs real failed-code samples)
- A handful of cross-level signature inconsistencies (L4 coldstart vs L3 norm)
- 1 broken MCQ (L3 spot-11 with duplicate distractors)

If the student uses the deck linearly L0→L5, they will hit the test patterns (stat_double, who_am_i, sum-positive, desk_data, read_desks, MAX=700) repeatedly with high-fidelity drills. The redundancy in L2/L3 is mostly *intentional* spaced-repetition variation, not fluff.

**Recommended pre-test fixes (under 30 min):**
1. Fix L3/S1-Tour/spot-11.yml — replace 2 duplicate distractors with real distinct off-by-one variants.
2. Reconcile L4 coldstart-03 + twopane-06 to match L3 `&arr[]` convention.
3. Replace "bogus2" placeholder in L1/A12/mcq-02.
4. Patch L2/L2-tour/L2-S1-tour-18-compare to add real keyChecks.

Everything else is deferrable.
