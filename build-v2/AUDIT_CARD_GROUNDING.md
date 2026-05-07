# AUDIT — Card Grounding (V2 corpus, 2,547 cards)

**Auditor**: card-grounding auditor
**Date**: 2026-05-07
**Method**: 200-card stratified sample manually graded; full 2,547-card sweep run with same grading rules. Citations resolved against on-disk source files in `cpp-t2/source-data/`.

---

## Headline numbers (FULL CORPUS, n=2,547)

| Grade        | Count | %      |
| ------------ | -----:| ------:|
| **VERIFIED** | 647   | 25.4%  |
| **PARTIAL**  | 122   | 4.8%   |
| **GENERIC**  | 937   | 36.8%  |
| **FAKE**     | 841   | 33.0%  |
| no `source:` | 0     | 0.0%   |

**Real-source-grounded** (VERIFIED + PARTIAL) = **769 cards (30.2%)**.
**Hallucinated or unverifiable** (GENERIC + FAKE) = **1,778 cards (69.8%)**.

---

## Per-level grades (FULL CORPUS)

| Level | Cards | VERIFIED | PARTIAL | GENERIC | FAKE   | Grade |
| ----- | -----:| --------:| -------:| -------:| ------:| ----- |
| L0    | 517   | 282 (55%)| 85 (16%)| 15  (3%)| 135 (26%)| C+ |
| L1    | 836   | 247 (30%)| 3   (0%)| 246 (29%)| 340 (41%)| D+ |
| L2    | 269   | 2    (1%)| 29 (11%)| 238 (88%)| 0   (0%)| F  |
| L3    | 430   | 18   (4%)| 0   (0%)| 412 (96%)| 0   (0%)| F  |
| L4    | 408   | 11   (3%)| 5   (1%)| 26  (6%)| 366 (90%)| F  |
| L5    | 87    | 87 (100%)| 0   (0%)| 0   (0%)| 0   (0%)| **A+** |

**L5 is the only level with serious grounding.** L2/L3 collapse to "GENERIC" because every card cites something other than the real practice file or PFG content. L4 collapses to "FAKE" because nearly every card cites a nonexistent "C++T2 spec §6.x".

---

## Per-kind grade breakdown (FULL CORPUS)

| kind     | Count | VERIFIED | PARTIAL | GENERIC | FAKE  | Notes |
| -------- | -----:| --------:| -------:| -------:| -----:| ----- |
| `pfg`    | 296   | 292 (99%)| 0       | 0       | 4     | Best — refs resolve to real `.md`/`.mdx` files in `source-data/pfg-content/pfg-content/`. |
| `practice` | 691 | 348 (50%)| 119(17%)| 224 (32%)| 0     | Half cite real practice-test files; rest are vague. |
| `seminar`| 10    | 7  (70%) | 3 (30%) | 0       | 0     | Tiny sample — most have valid timestamps. |
| `v2`     | 1,550 | 0   (0%) | 0       | 713 (46%)| 837 (54%) | **The poison.** 100% of `kind: v2` cards are GENERIC or FAKE. They cite a "C++T2 spec" that does not exist as a file. |

---

## Specific red-flag patterns (FULL CORPUS)

| Pattern                                                              | Count |
| -------------------------------------------------------------------- | -----:|
| Cards citing `cpp-t2/docs/16_test2_specific_redesign_v2.md`          | 942   |
| Cards citing nonexistent `C++T2 spec §X` / `V2 spec §X`              | 512   |
| Cards mentioning "V2.0" (test attempt 1 — not a real test file)      | 391   |

`docs/16_test2_specific_redesign_v2.md` is the planning document the user wrote — **it is not a real source**. Treating it as a source means **942 cards (37%) are grounded in our own design doc, not in the textbook or in seminars or in real practice tests**. That is hallucination by self-reference.

The phrase "C++T2 spec §F-03", "C++T2 spec §6.3 Block B", etc. appears 512 times. **No file named "C++T2 spec" exists** anywhere in the repo. These citations are fabricated.

---

## Top 20 worst-grounded cards (FAKE)

All cite the nonexistent "C++T2 spec":

1. `data/v2/cards/L0/F-03/decompose-01.yml` — `v2: C++T2 spec §F-03; SIT102 Test 2 Q1 format`
2. `data/v2/cards/L0/F-03/mcq-01.yml` — `v2: C++T2 spec §F-03 — RHS-first evaluation`
3. `data/v2/cards/L0/F-03/mcq-02.yml` — `v2: C++T2 spec §F-03; SIT102 Test 2 Q1 description`
4. `data/v2/cards/L0/F-03/trace-01.yml` — `v2: C++T2 spec §F-03 trace primer`
5. `data/v2/cards/L0/F-03/trace-02.yml` — `v2: C++T2 spec §F-03 trace primer; PFG Part 1 — first cout`
6. `data/v2/cards/L0/F-03/trace-03.yml` — `v2: C++T2 spec §F-03 trace primer`
7. `data/v2/cards/L0/F-03/trace-04.yml` — `v2: C++T2 spec §F-03 trace primer`
8. `data/v2/cards/L0/F-03/walkthrough-01.yml` — `v2: C++T2 spec §F-03 hand-execution paradigm`
9. `data/v2/cards/L0/F-03/walkthrough-02.yml` — `v2: C++T2 spec §F-03 hand-execution`
10. `data/v2/cards/L0/F-06/procedural-01.yml` — `v2: C++T2 spec §F-06 procedural`
11. `data/v2/cards/L0/F-06/procedural-02.yml` — `v2: C++T2 spec §F-06 procedural`
12. `data/v2/cards/L0/F-06/templ-recall-03.yml` — `v2: C++T2 spec §F-06`
13. `data/v2/cards/L0/F-06/trace-01.yml` — `v2: C++T2 spec §F-06 trace primer`
14. `data/v2/cards/L0/F-06/trace-02.yml` — `v2: C++T2 spec §F-06 trace primer`
15. `data/v2/cards/L0/F-06/uwrite-03.yml` — `v2: C++T2 spec §F-06`
16. `data/v2/cards/L0/F-07/procedural-01.yml` — `v2: C++T2 spec §F-07 procedural`
17. `data/v2/cards/L0/F-08/procedural-01.yml` — `v2: C++T2 spec §F-08 procedural`
18. `data/v2/cards/L0/F-08/uwrite-03.yml` — `v2: C++T2 spec §F-08`
19. `data/v2/cards/L0/F-11/cloze-02.yml` — `pfg: part-1/2-communicating-syntax/...05-statement` (no such file)
20. `data/v2/cards/L0/F-11/trace-01.yml` — `v2: C++T2 spec F-11 declaration trace primer`

The L4 directory has 366 such FAKE cards — the entire L4 layer is grounded in a fictional spec.

---

## Top 10 best-grounded cards (exemplars — pfg with verified file)

1. `data/v2/cards/L0/F-01/decompose-01.yml` — pfg → `part-0-getting-started/1-digital-realities/2-trailside/6-source-code.md`
2. `data/v2/cards/L0/F-01/demo-01.yml` — same source
3. `data/v2/cards/L0/F-01/mcq-01.yml` — same
4. `data/v2/cards/L0/F-01/mcq-02.yml` — same
5. `data/v2/cards/L0/F-01/mcq-03.yml` — same
6. `data/v2/cards/L0/F-01/walkthrough-01.yml` — same
7. `data/v2/cards/L0/F-02/decompose-01.yml` — same
8. `data/v2/cards/L0/F-02/demo-01.yml` — same
9. `data/v2/cards/L0/F-02/mcq-01.yml` — pfg → same file (Compilers and Interpreters section)
10. `data/v2/cards/L5/postmortem/01-skip-pre-loop-init.yml` — seminar → `SIT102 Seminar Mondays 6pm new (2) @ 21:14` (verifiable)

These cards model what good grounding looks like: file + section/timestamp specific enough that a human can open the file and find the cited content.

---

## Honest verdict

- **30%** of the 2,547 cards (≈ 769) are grounded in real source-data files we can verify on disk.
- **70%** (≈ 1,778) are NOT grounded in real source-data — they cite a fictional "C++T2 spec", or our own planning doc `docs/16`, or "V2.0 attempt 1" (not a file), or are too vague to verify.
- The L0 PFG-anchored cards and L5 practice/seminar-anchored cards are excellent. **Everything between is grounded primarily in self-references**.
- The `kind: v2` source type is a bookkeeping fiction — it pretends the redesign-plan document is a primary source. Of 1,550 v2-kind cards, **0** verify against an actual on-disk source file.
- Any claim that "100% of cards are code-anchored" (per the project README) is **false**. About a third are; another third pretend to be by citing a nonexistent spec; another third punt with vague references.

**Of 2,547 cards, 30% are grounded in real source-data. 70% are hallucinated citations.**
