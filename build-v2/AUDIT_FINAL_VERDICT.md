# cpp-t2 v2 — FINAL VERDICT (comparative pass-probability audit)

**Date:** 2026-05-07 (synthesis pass)
**Auditor role:** Comparative auditor + final synthesizer (RULE 4 binding)
**Sub-audit inputs available at synthesis time:** QA-M34 acceptance gate (GREEN, 32/33), TESTS_FINAL.md (206/206 engine tests, 99.27% lines), BUNDLE_REPORT.md (449 KB gzip / 500 KB budget, smoke 8/8). The four expected sub-audit reports (`AUDIT_CARD_QUALITY.md`, `AUDIT_COVERAGE.md`, `AUDIT_LEARNING_TRAJECTORY.md`, `AUDIT_FUNCTIONALITY.md`) were **not produced** by the parallel agents at the time of this synthesis. This verdict therefore synthesizes from the QA artifacts + spec docs that *do* exist on disk; uncertainty ranges are widened accordingly.

---

## TL;DR

> **Probability of passing Test 2 ≥50% given 24h study with cpp-t2 v2 app + practice test only = ~70%** (60–80% CI).

---

## 1. Synthesis of available audit signal

### 1a. Card-quality (proxy: QA-M01/M06/M08/M13)
- 0 schema errors; 389 word-memorize warnings (non-blocking).
- 100% (2,458/2,458) cards carry a non-empty source citation. RULE 4 holds.
- **18 stub-CMs** with <3 immunization cards (mostly Q1/Q4 minor-variant mistakes). The QA gate classifies these as non-blocking; in practice they reduce the marginal protection against ~6 specific common mistakes. Expected score impact: **−1 to −3 percentage points** if any of those mistakes appear on the real test.
- Quality = **B+**. Real, code-anchored cards. Some stub-CM debt.

### 1b. Coverage (proxy: QA-M10, QA-M12/14, QA-M33)
- Atom undercoverage: **0** (was 6 before Wave-5 fix).
- Single-modality atoms: **0** (was 33).
- 24 (Q × stage) cells filled; 6-stage Q-track coverage complete.
- Card distribution by Q-target: L1=772 (Q1), L2=269 (Q2), L3=417 (Q3), L4=396 (Q4) + L0=517 foundation + L5=87 mocks. **Q2 is the thinnest** (269 cards across struct authoring) — this is the visible coverage risk.
- 40 mock papers (canonical / entity-swap / algo-swap / adversarial). All four mock tiers cleared their thresholds in QA-M28..M31.
- Coverage = **A−**. Q2 thinness is the only material gap.

### 1c. Learning trajectory (proxy: QA-M16/M24/M25/M27)
- Stage-gate sim: **50/50 (100%) reached final**.
- 50-fuzz-student dry run: **50/50 reached test-ready** state.
- Burnout/fatigue scenario: **70%** of burnt-out students still made progress (this is the realistic-student floor).
- Pre-flight gate accuracy vs sim outcome: **Pearson r = 0.967** (target ≥0.85). Strong predictive validity.
- Median sim wall-clock to test-ready: ~45.5 min/session — **24h budget covers ~30 sessions**, well above the 12-session test-ready threshold the simulator uses.
- Trajectory = **A**. The strongest signal in the audit.

### 1d. Functionality (proxy: QA-M18/M19/M20, TESTS_FINAL, BUNDLE)
- 206/206 engine tests pass; **99.27% lines / 91.75% branches / 100% functions** coverage.
- Build clean: 449 KB JS gzip vs 500 KB budget (10% headroom).
- Smoke 8/8 green; live HTTP at preview port 200 on every chunk.
- Page-load TTI p95 = 13.3 ms; mount p95 = 1053 ms; 1000-card stress = 5.07 ms/iter, 0 errors.
- Functionality = **A**. App is study-ready today.

### Synthesis weight
- Trajectory + functionality together carry the verdict. Card-quality and coverage are gating but not failing. The **single yellow gate** (QA-M13, 18 stub-CMs) caps confidence below "very high" but does not justify a sub-50% pass probability.

---

## 2. Per-resource pass probability

### Resource A — cpp-t2 v2 app + practice PDF, 24h study
- The simulator says ≥85% on canonical mocks for ~100% of sims **when the student behaves like the simulated student**. Real Joshua diverges from sim-Joshua: motivation, fatigue, app abandonment, transfer-loss from screen drilling to paper hand-execution.
- Fatigue scenario floor (QA-M25): 70% of burnt-out sims still made progress. Treat as the **realistic lower bound**.
- Stub-CM cost: −1 to −3 pp expected.
- Q2 thinness cost: −2 to −5 pp on Q2 specifically.
- **24h (4h × 6 days)** = 24–32 sessions of ~45 min — comfortably above the simulator's 12-session test-ready threshold, but slightly below the burnout-buffered threshold (~36 sessions for a non-prior-knowledge cold start).
- Hand-execution drilling (the app's distinctive advantage) is exactly what the test grades. Multi-modal exposure (each atom in 2–5 modes) and multi-Q tagging (progress on Q2 leaks to Q3) compound.

| Threshold | Estimate | CI |
|---|---:|---|
| **P(pass ≥50%)** | **70%** | 60–80% |
| **P(pass ≥75%)** | **35%** | 25–50% |
| **P(pass ≥85%)** | **15%** | 8–25% |

### Resource B — practice PDF only (no app), 24h study
- Student can drill the practice paper to verbatim recall. But the real Test 2 V2.0 uses sum-positive algorithm (different from practice), `desk_data` entity (different), `MAX = 700` (different). Verbatim memorisation transfers only to the *structure* of Q1–Q4, not the answers.
- Without immunization against common mistakes, without progressive difficulty, without per-Q variant exposure, generalisation is shallow. Student can probably write a recognisable struct (Q2, partial credit), recognise a trace pattern (Q1, partial credit), and stub a main (Q4, partial credit). Q3 (read function) is the hardest to acquire from a single past paper.
- Realistic ceiling without active drilling: ~40–55%.

| Threshold | Estimate | CI |
|---|---:|---|
| **P(pass ≥50%)** | **35%** | 25–50% |
| **P(pass ≥75%)** | **8%** | 3–15% |

### Resource C — cold (no study, no app, 0h)
- 0-prior baseline scoring on a hand-execution C++ test.
- Q1 trace: ~5–10% (could guess final variable values from literal-string echoes).
- Q2 struct: ~15–25% (might write something struct-shaped from the prompt — "struct" is recognisable English).
- Q3 read function: ~5–10% (requires file-IO + loop knowledge; near-zero from cold).
- Q4 main: ~5–15% (might write `int main() { return 0; }` and a stubbed call).
- **Total: ~10–18%.**

| Threshold | Estimate | CI |
|---|---:|---|
| **P(pass ≥50%)** | **<2%** | 0–5% |

---

## 3. Net advantage of app

| Comparison | Δ P(pass ≥50%) |
|---|---:|
| App vs practice-only | **+35 pp** (70% − 35%) |
| App vs cold | **+68 pp** (70% − 2%) |
| Practice-only vs cold | **+33 pp** |

The app roughly **doubles** the probability of passing relative to drilling the practice PDF alone, and is the difference between near-certain failure (cold) and likely pass (app).

---

## 4. Risks weighted in

- **18 stub-CMs (QA-M13 yellow):** −1 to −3 pp. Real but bounded.
- **Q2 thin coverage (269 cards):** −2 to −5 pp on Q2.
- **Screen-to-paper transfer:** the app drills typing; the test is handwritten. Speed-drill cards (96 of them) and TraceCard's interactive memory boxes mitigate but don't eliminate this gap. −3 to −7 pp.
- **Student fatigue / app abandonment:** non-trivial. The fatigue sim only got 70% of burnt-out students through. Day-of-test focus is uncontrolled.
- **24h budget is tight:** sim used 12-session threshold; 24h gives 24–32 sessions. Comfortable but not slack.

## 5. Advantages weighted in

- **Multi-modal exposure** (each atom 2–5 ways): generalisation > rote.
- **Adaptive deck** (focuses on weaknesses): test-time prep prioritises gaps.
- **Multi-Q tagging:** Q2 progress leaks to Q3.
- **Common-mistake immunization:** 268 CMs in registry, 40+ explicitly drilled — dwarfs any other resource.
- **Hand-execution drilling:** TraceCard's value-history clicker is the closest thing to handwritten exam practice that exists.
- **Pre-flight gate r=0.967:** the app can *tell* the student before the test whether they're ready.

---

## 6. Confidence intervals & caveats

- The four sub-audit reports were not produced. This verdict is built from QA-M34's GREEN gate + 206/206 engine tests + simulation outputs. **Confidence is reduced one tier** vs what it would be with the four independent audit perspectives.
- The simulator at the heart of the trajectory estimate is itself code from this repo; it has not been validated against historical Test 2 outcomes (no prior cohort data exists for V2.0).
- All probabilities assume the student actually uses the app for the full 24h. If usage drops below ~16h, P(pass ≥50%) collapses toward the practice-only number.

---

## 7. Final answer

**Probability of passing Test 2 ≥50% given 24h study with cpp-t2 v2 app + practice test only = ~70% (60–80% CI), versus ~35% with practice PDF only and <2% cold — a net advantage of approximately 35 percentage points from the app.**
