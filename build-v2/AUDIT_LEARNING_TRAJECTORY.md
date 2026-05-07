# AUDIT — Learning Trajectory Simulation (24h budget, zero-prior student)

**Date**: 2026-05-07
**Test date**: 2026-05-14
**Budget**: 4h × 6 days = 24h
**Resource**: cpp-t2 v2 app (2,458 cards) + practice test PDF only
**Spec ref**: docs/16 §KP track baseline = ~72h for full mastery

---

## 1. THROUGHPUT MODEL

### Card mix × per-card real time

| Card type | % | Sec/card | Weighted s |
|---|---|---|---|
| Trace | 22 | 120 | 26.4 |
| Write (μ + Struct + Func + Main, blended ~110s) | 17 | 110 | 18.7 |
| Cloze | 13 | 25 | 3.3 |
| TemplateRecall | 11 | 90 | 9.9 |
| Walk/Demo | 11 | 30 | 3.3 |
| Decompose | 7 | 45 | 3.2 |
| Procedural | 5 | 90 | 4.5 |
| Matrix | 5 | 60 | 3.0 |
| MCQ | 4 | 45 | 1.8 |
| Speed (untimed full Q) | 2 | 240 | 4.8 |
| Postmortem | 2 | 90 | 1.8 |
| **Σ** | 100 | | **~85 s/card** |

Adjusted upward to **~92 s/card** for context-switch + UI friction → **~39 first-exposure cards/hr**.

With Leitner-aggressive retire (short cards retire at 2-streak; ~30% of mix) → **~50 cards/hr effective**.

### 24h capacity

- 24h × 50 cards/hr = **~1,200 first-exposure cards** (49% of 2,458 deck)
- Re-cycles for failed cards (30% miss rate × 1.4 retries) → +360 review views
- **Effective unique cards seen: ~1,200 / 2,458 = 49%**
- **Effective card-views: ~1,560**

---

## 2. HOUR-BY-HOUR THROUGHPUT TABLE

| Hour | Phase | Cards seen | Cum cards | Notes |
|---|---|---|---|---|
| 1–4 (D1) | L0 atoms F-01..F-15 | 200 | 200 | Slowest hour: 35/hr (cold start) |
| 5–8 (D2) | L0 F-16..F-22 + Q2 S1-S2 | 200 | 400 | F-22 bottleneck (PBR cognitive load) |
| 9–12 (D3) | Q2 S3-S5 + Q3 S1-S2 | 200 | 600 | Cross-Q overlap reduces work |
| 13–16 (D4) | Q3 S3-S4 + Q1 S1-S3 | 200 | 800 | Q1 trace mechanics introduced |
| 17–20 (D5) | Q1 S4 (12 algos) + Q4 S1-S4 | 200 | 1,000 | Sum-positives drilled here |
| 21–24 (D6) | Mock M1-M4 + targeted gaps | 150 | 1,150 | Lower throughput: full Qs are slow |

**Realistic ceiling: ~1,200 unique cards (~49% of deck).**

---

## 3. DAY-BY-DAY SKILL ACQUISITION

| Day | Atoms touched | Atoms ≥80% | Q-tracks unlocked | Risk |
|---|---|---|---|---|
| D1 | F-01..F-15 (15) | 12 | none | Fatigue end of session |
| D2 | F-16..F-22 (+7) | 18 of 22 (82%) | Q2 begins | F-22 partial only |
| D3 | Q2 5/6 stages, Q3 2/6 | Q2 ~75% | Q3 components emerging | Q3 read-fn skipped at S3 |
| D4 | Q3 4/6, Q1 3/6 | Q3 ~65%, Q1 templates | Q1 trace mechanics | Q4 untouched |
| D5 | Q1 S4 (12 algos), Q4 4/6 | Q1 sum-pos drilled, Q4 ~70% | Q4 templates done | Q3 S5 variations skipped |
| D6 | Mock M1-M4 + gap-drill | All 4 Q-tracks attempted | Postmortem cycle | Time runs out before Q3 retry |

---

## 4. PER-Q FAMILIARITY AT EXAM DAY

| Q | Topic | Familiarity % | Confidence basis |
|---|---|---|---|
| **Q2** | Write struct (4-field) | **~75%** | Easiest. Touched D2-D3. Risk: V2.0 field count drift (3 vs 4). |
| **Q3** | Write read fn (PBR) | **~55%** | Hardest atom (F-22) underbaked. PBR + cin pair only partly drilled. |
| **Q4** | Write main (loop + arr + read) | **~60%** | Touched late (D5). Composition under-rehearsed. |
| **Q1** | Hand-execute trace | **~50%** | Sum-positives algo specifically drilled. But 12 algos = thin coverage per algo; trace mechanics fragile. |

---

## 5. MOCK SCORE PROJECTION

### Per-Q expected (out of 25)

| Q | Familiarity | Raw expected | × stress factor (0.85) | × misread (0.92) | **Projected /25** |
|---|---|---|---|---|---|
| Q2 | 75% | 18.75 | 15.94 | 14.66 | **15** |
| Q3 | 55% | 13.75 | 11.69 | 10.75 | **11** |
| Q4 | 60% | 15.00 | 12.75 | 11.73 | **12** |
| Q1 | 50% | 12.50 | 10.63 | 9.78 | **10** |

### Total

| Component | Score |
|---|---|
| Q1 + Q2 + Q3 + Q4 | 10 + 15 + 11 + 12 = **48** |
| **Mock total / 100** | **~48** |

### Distribution (Monte-Carlo intuition)

| Outcome band | Probability |
|---|---|
| <40 (clear fail) | 18% |
| 40–49 (borderline fail) | 32% |
| 50–64 (pass, low) | **35%** |
| 65–84 (pass, solid) | 13% |
| ≥85 (HD / clean complete) | 2% |

---

## 6. **PASS PROBABILITY** (≥50%) and **HD PROBABILITY** (≥85%)

| Metric | Probability |
|---|---|
| **PASS (≥50)** | **~50%** |
| **HD (≥85)** | **~2%** |

The expected score (48) sits just below the pass line. Variance pushes ~half the distribution above. This is a coin-flip exam outcome, not a confident pass.

---

## 7. RISKS — ITEMIZED

1. **F-22 (pass-by-reference) underbaked** — Q3 read-fn requires PBR; only 4 of 22 atoms partly mastered by D6. **Highest single risk to Q3 score.**

2. **V2.0 entity drift** — App drilled `desk_data` with 3 fields. If V2.0 ships 4 fields, recall fragility on field count costs ~2 marks.

3. **Sum-positive algorithm specificity** — App drills it heavily as known V2.0 algo. If V2.0 swaps algorithm (e.g. count-evens, average-above-X), transfer fails since S5 variations skipped.

4. **MAX=700 vs drilled MAX=N** — If real test uses MAX=700 specifically, declared-vs-used array size confusion → off-by-one in trace.

5. **Test-day stress** — 90 min for 4 Qs = 22.5 min/Q. Q1 hand-trace alone takes 8–12 min when fluent; under stress, 15+. Risk of running out of time on Q4.

6. **Misreading prompt vocabulary** — "positive" vs "non-negative", "above" vs "at or above". Single-word misreads cost 4–6 marks.

7. **Fatigue at 4h/day** — Studies show >2.5h continuous deliberate practice degrades retention. Hours 3-4 each day net ~60% the throughput modeled. Real card count likely ~1,000 not 1,200.

8. **Adaptive guidance not perfectly followed** — Student will skip walkthroughs (perceived as filler), spend extra time on cards they enjoy, fatigue-skip late cards. Cuts ~10% effective coverage.

9. **No tutor / no peers** — All errors go uncorrected during practice. Bad mental models can cement (e.g. wrong loop bound).

10. **L0 exit gate slippage** — Spec requires ≥80% L0 mastery before Q-tracks unlock. Realistic L0 mastery by D2 end = ~75%. Going forward with weak foundation degrades all 4 Q tracks.

---

## 8. FINAL VERDICT

**Pass probability (≥50%): ~50%**
**HD probability (≥85%): ~2%**

The 24h budget is **one-third of the 72h spec target**. A zero-prior student cannot reach 100% familiarity in 24h on a 2,458-card deck. Realistic ceiling = ~49% deck coverage, ~60% average familiarity, ~48 mock score. Pass is a coin flip. HD is statistically negligible.

**Single highest-leverage move**: Skip L0 patches (-90 cards, -1.1h). Reallocate to Q3 S3-S5 and Q1 S4 algorithm drill. Estimated lift: +5 marks on mock (53→pass-confident).
