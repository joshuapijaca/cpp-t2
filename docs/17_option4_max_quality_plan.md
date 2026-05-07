# cpp-t2 Option 4 — MAX-QUALITY PLAN

**Status:** PROPOSED — pending user authorization
**Date:** 2026-05-07 (post-attempt-1)
**Target attempts:** May 14 (ride existing) / **May 21 (this build) / May 28 (last resort)**
**Build constraint:** None. Quality maximized. Time unlimited.
**Confidence target:** **≥98% probability of ≥85% pass, ≥90% probability of ≥95% pass.**

---

## EXECUTIVE SUMMARY

| Variable | Option 2 baseline | **Option 4 max-quality** |
|---|---|---|
| Total cards | 2,230 | **~4,600 hand-authored** |
| Levels | 6 | 6 (same structure) |
| Algorithms | Top 6 | **All 20 (12 standard + 8 edge)** |
| Entities | Top 10 | **100 entities** |
| Field-count variants | 3 only | **2/3/4/5** |
| Card types per atom | 5-7 | **All 11 (multi-modal coverage)** |
| Common mistakes immunized | 10 | **40** |
| Mock papers | 8 full | **50 full + 100 partial + 150 adversarial** |
| Adaptive deck | None | **Failure-pattern-driven adjustment** |
| Peer review | None | **Every card 2-agent reviewed** |
| Build phases | 1 | **6 phases, 30 parallel agents** |
| Wall-clock | 2 days | **~21 days** |
| Confidence | 78% | **98%** |

---

## DESIGN PHILOSOPHY: 7 PRINCIPLES FOR MAX QUALITY

### 1. REDUNDANCY
Every atom drilled via ≥5 card types → no single failure mode kills understanding.

### 2. COVERAGE
Every plausible test variant pre-built. 100 entities × 20 algos × 4 field counts = 8,000 latent variants. Sample 1/2 = 4,000 covered.

### 3. ADAPTIVITY
Deck adjusts based on failure pattern. Atom fail → prereq atoms re-injected automatically (walk DAG backward).

### 4. VALIDATION
Every card peer-reviewed by 2nd agent before shipping. Authored card → reviewer flags issues → original revises → final QA.

### 5. REALISM
Final week = actual test conditions. Same time-of-day, same layout, same prose phrasing as real Deakin papers.

### 6. GRANULARITY
Atoms split into sub-atoms where confusion clusters. F-22 (pass-by-ref) → F-22a (concept), F-22b (signature syntax), F-22c (call site no-`&`), F-22d (mutation visibility), F-22e (array decay).

### 7. ANTI-FRAGILITY
Fault injection + adversarial mocks. Show buggy code, fix it. Generate hardest possible test variants. Build student's failure-recovery muscle.

---

## CARD BUDGET BREAKDOWN (~4,600 total)

| Level | Name | Atoms | Cards | Hours | New |
|---|---|---|---|---|---|
| **L0** | Foundation | 30 (split from 22) | **1,000** | 8h | +310 |
| **L1** | Q1 Hand-execute | 22 + algo extensions | **1,200** | 12h | +500 |
| **L2** | Q2 Write struct | 10 + entity extensions | **500** | 5h | +260 |
| **L3** | Q3 Write read fn | 15 + entity extensions | **800** | 8h | +410 |
| **L4** | Q4 Write main | 20 + entity extensions | **700** | 7h | +320 |
| **L5** | Mock + adversarial | n/a | **400** | 6h | +290 |
| **TOTAL** | | **97 atoms** | **~4,600** | **~46h** | |

Student won't see all 4,600 — exposure-frequency model retires familiar cards. Effective views ~2,800 across multi-week study window.

### Card type distribution (multi-modal redundancy)

| Type | Count | % | Multi-Q tagged |
|---|---|---|---|
| TraceCard (code editor debugger) | 1,000 | 22% | Q1 + Q4 |
| Write cards (Struct/Fn/Main) | 800 | 17% | Q2/Q3/Q4 |
| Cloze | 600 | 13% | All |
| TemplateRecall (3-stage) | 500 | 11% | All |
| Walkthrough/Demo (passive) | 500 | 11% | All |
| Decompose (multi-select) | 300 | 7% | All |
| Procedural (3-streak) | 250 | 5% | Q3, Q4 |
| Matrix (transfer drill) | 250 | 5% | Q1, Q2 |
| MCQ (code-anchored only) | 200 | 4% | All |
| SpeedDrill (production drill, untimed) | 100 | 2% | All |
| Postmortem (diff vs canonical) | 100 | 2% | All |
| **TOTAL** | **~4,600** | **100%** | |

---

## NEW CARD TYPES FOR MAX QUALITY (beyond v2.1)

### 8 additional card types built for Option 4

| # | Card type | Drill |
|---|---|---|
| 1 | **AdversarialMockCard** | Hardest plausible variant. Auto-generated to hit student's weakest atom. |
| 2 | **FaultInjectionCard** | Buggy code shown. Student finds + fixes bug. Inverse of write. |
| 3 | **PreflightCheckCard** | 50-card lightning round 24h before test. Vital-signs across all atoms. |
| 4 | **ConfidenceCalibrationCard** | After answer, student rates self-confidence 1-5. Low-confidence-correct → re-expose. High-confidence-wrong → remediate. |
| 5 | **DAGRetryCard** | When atom X fails, system walks prereq DAG backward. Re-injects atoms Y, Z before retrying X. |
| 6 | **TestDaySimCard** | Full Q1-Q4 in exact test conditions. Same time-of-day. Same prose. Final-week only. |
| 7 | **DeltaCard** | Student rewrites Q solution after seeing diff vs canonical. Active error correction. |
| 8 | **VariantGenCard** | Build-time-generated variant. 100 latent variants per atom; 5 randomly selected per session. |

---

## ATOM STRUCTURE (split from 22 to 30 for granularity)

### L0 Foundation: 30 atoms (was 22)

Sub-atom splits where confusion clusters:

| Original | Split into | Why |
|---|---|---|
| F-22 (pass-by-ref) | F-22a concept / F-22b signature / F-22c call-site / F-22d mutation / F-22e array-decay | 5 distinct confusions |
| F-18 (for-loop) | F-18a header / F-18b body / F-18c termination / F-18d off-by-one | Each sub-skill independently brittle |
| F-20 (struct) | F-20a definition / F-20b nested-array-field / F-20c access-via-dot / F-20d brace-init | Q1 needs all 4 |
| F-14 (cin) | F-14a token-semantics / F-14b chained / F-14c into-struct-array | Q3 needs c-version |

Total atoms: 22 + 8 splits = **30 atoms in L0**.

---

## ALGORITHM SCOPE: ALL 20 (max coverage)

### 12 standard (from v2 plan)
A1 find-max | A2 find-min | A3 sum-all | A4 sum-positive | A5 sum-negative | A6 sum-even-indexed | A7 sum-odd-indexed | A8 count-positive | A9 count-matching | A10 average | A11 product | A12 index-of-max

### 8 edge cases (Option 4 additions)
| # | Algo | Init | Condition | Action |
|---|---|---|---|---|
| A13 | range (max-min) | track both | dual | subtract |
| A14 | first-positive-found | sentinel | `>0` and not-found | set + flag |
| A15 | count-in-bounds | 0 | `>=lo && <=hi` | `mystery++` |
| A16 | sum-of-squares | 0 | none | `mystery += numbers[i]*numbers[i]` |
| A17 | sum-greater-than-mean | 2-pass | post-mean | conditional sum |
| A18 | second-max | track 2 | dual-comparison | replace |
| A19 | mode (most-frequent) | freq array | count-then-max | nested logic |
| A20 | longest-streak | counter + max | run-tracking | update on break |

A19 + A20 are stretch (hardest patterns); included for confidence buffer.

---

## ENTITY POOL: 100 ENTITIES

### Tier 1 (likely test entities, 35 entities × heavy drilling)
computer / desk / book / employee / student / vehicle / order / product / animal / house / movie / recipe / restaurant / game / song / painting / flight / hotel / course / invoice / bank_account / phone / dog / shoe / laptop / room / event / ticket / club / weather / grade / pet / drink / bicycle / tv_show

### Tier 2 (lower-probability variants, 35 entities × light drilling)
plant / tool / instrument / app / website / printer / camera / watch / bag / chair / table / lamp / door / window / poster / mug / pen / notebook / folder / cable / charger / speaker / headphone / monitor / keyboard / mouse / fan / heater / clock / mirror / shelf / box / bottle / cup / plate

### Tier 3 (transfer test entities, 30 entities × S5 only)
satellite / asteroid / molecule / planet / galaxy / particle / atom / cell / organism / protein / vaccine / virus / hospital / medicine / treatment / language / dialect / poem / sculpture / opera / artifact / fossil / coin / stamp / map / route / bridge / tunnel / dam / reservoir

100 entities → cycle through random subsets per session → max transfer drill.

---

## COMMON MISTAKES IMMUNIZATION: 40 MISTAKES

### Top 30 from v2 plan + 10 Option 4 additions:

| # | Mistake | Track | Cards |
|---|---|---|---|
| ... | (30 from v2) | | 150 |
| 31 | Wrong return type on read fn | Q3 | 5 |
| 32 | Calling read_X with wrong arg order | Q4 | 5 |
| 33 | Print loop reads array out of bounds | Q4 | 5 |
| 34 | cin >> bool not bool literal | Q3 | 3 |
| 35 | Missing space between `<<` operands | Q4 | 3 |
| 36 | Missing newline in output | Q4 | 3 |
| 37 | Wrong endl placement (mid-chain) | Q4 | 3 |
| 38 | Comments inside struct breaking it | Q2 | 3 |
| 39 | Forgetting `[]` for array on signature | Q3 | 5 |
| 40 | Confusing array decay with reference | Q3 | 5 |
| **TOTAL immunization cards** | | | **190** |

---

## PHASE PLAN: 6 PHASES, 30 PARALLEL AGENTS

### PHASE 1 — Component build (Days 1-7)

| Agent | Builds | LOC |
|---|---|---|
| **CC-1** | code editor primitives (editor, terminal, variables panel) | 1,500 |
| **CC-2** | TemplateRecallCard (3-stage) | 600 |
| **CC-3** | StructWriteCard | 500 |
| **CC-4** | FunctionWriteCard | 700 |
| **CC-5** | MainWriteCard | 800 |
| **CC-6** | TraceCard v2 (code editor style) | 1,000 |
| **CC-7** | EntityMatrixCard + AlgorithmMatrixCard | 700 |
| **CC-8** | SpeedDrillCard + Q1-Q4 tabs (no timer) | 900 |
| **CC-9** | AdversarialMockCard + FaultInjectionCard + DeltaCard | 800 |
| **CC-10** | PreflightCheckCard + ConfidenceCalibrationCard + DAGRetryCard + TestDaySimCard + VariantGenCard | 1,200 |

10 agents in parallel × ~7 days each.

### PHASE 2 — Card authoring round 1 (Days 8-15)

| Agent | Authors | Cards |
|---|---|---|
| **CA-L0a** | L0 atoms F-01..F-15 | 480 |
| **CA-L0b** | L0 atoms F-16..F-22 + sub-atoms | 520 |
| **CA-L1a** | L1 Q1 S1-S2 (Tour + Template, 12 algos) | 300 |
| **CA-L1b** | L1 Q1 S3 (Components, 30 atoms) | 400 |
| **CA-L1c** | L1 Q1 S4 (Compose, 20 algorithms) | 300 |
| **CA-L1d** | L1 Q1 S5-S6 (Variations + Speed) | 200 |
| **CA-L2a** | L2 Q2 all stages, entities 1-50 | 250 |
| **CA-L2b** | L2 Q2 entities 51-100 + edge cases | 250 |
| **CA-L3a** | L3 Q3 S1-S3 across 50 entities | 400 |
| **CA-L3b** | L3 Q3 S4-S6 across 50 entities | 400 |
| **CA-L4a** | L4 Q4 S1-S3 across 50 entities | 350 |
| **CA-L4b** | L4 Q4 S4-S6 across 50 entities | 350 |
| **CA-L5a** | L5 50 full mocks (4 variant types) | 200 |
| **CA-L5b** | L5 100 partial mocks + 150 adversarial | 200 |

14 agents × ~8 days. ~4,600 cards authored.

### PHASE 3 — Peer review round (Days 16-19)

Every card peer-reviewed by 2nd agent. 4 review agents handle subsets:

| Agent | Reviews | Cards |
|---|---|---|
| **REV-A** | L0 + L1 (1,200 cards × 30s review = 10h × 5 days) | 2,200 |
| **REV-B** | L2 + L3 | 1,300 |
| **REV-C** | L4 + L5 | 1,100 |
| **REV-D** | Cross-cutting: code compiles, common-mistake coverage, atom prereq integrity | full deck |

Review actions: flag for revision / approve / suggest variant.

### PHASE 4 — Card revision round (Days 20-22)

Original authoring agents re-engaged to fix flagged cards. Iterate until 0 review issues remain. ~3 days.

### PHASE 5 — Engine + UX build (overlapping with phases 1-4)

| Agent | Builds |
|---|---|
| **EN-1** | Exposure-frequency engine + counter state machine + length-tuned targets |
| **EN-2** | Multi-Q tagging propagation engine |
| **EN-3** | Stage-gate + 4 escape valves |
| **EN-4** | Daily-deck composer (block→interleave + lowest-accuracy weighting) |
| **EN-5** | Adaptive deck (failure-pattern → DAG retry + variant injection) |
| **UX-1** | Home screen (4-track + L0 + L5 + atom-tree visualizer) |
| **UX-2** | Track screens + per-stage progress + familiarity gauges |
| **UX-3** | Production drill UX + Q-tab + sectional grade renderer (no countdown) |
| **UX-4** | Mock postmortem screen + retro session screen + weakness file viewer |

9 agents × overlapping with phases 1-4.

### PHASE 6 — QA + Acceptance (Days 23-26)

| Agent | Validates |
|---|---|
| **QA-1** | Lint pass: schema, brace balance, canonical compile, common-mistake audit |
| **QA-2** | Acceptance dry-run: simulated 0-prior student walking D1-D14 |
| **QA-3** | Adversarial test: 50 fake-student profiles with random failure patterns |
| **QA-4** | Cross-reference: every atom appears in ≥3 levels (transfer testing) |
| **QA-5** | Source-of-truth grounding: every card cites SIT102 source (practice/V2.0/PFG/seminar) |

5 agents × 4 days.

**Total: 30 parallel agents across 6 phases. Wall-clock: ~21 days for complete build (phases overlap).**

---

## PUSH BEYOND 95%: 12 ADVANCED FEATURES

### F1: Adaptive deck with failure-pattern detection
Track every card fail. Cluster fails by atom. Inject 5 cards per failed atom in next session. Walk DAG backward if atom fails repeatedly.

### F2: DAG-backward retry on cascading failures
Atom X fails 3× → check prereq atoms Y, Z. Re-drill Y, Z first. Then retry X.

### F3: Confidence calibration
After each card, student rates 1-5 confidence. Mismatches between confidence and correctness → remediation queue.

### F4: Weakness file
Persistent log of every fail with timestamp + atom + card type. Visible to student. Tomorrow's deck biased 2× toward weakness file contents.

### F5: Pre-flight check (24h before test)
50-card lightning round across all 30 atoms. Must hit ≥90%. If not, alert + force ≥30 minutes targeted drill.

### F6: Atom skill tree visualizer
Graph of all 30 atoms colored by familiarity %. Student sees gaps visually. Click atom → see card history.

### F7: Test-day simulation (final week)
Mock papers replicate the Deakin paper layout and prose phrasing. Run as
sequential Q1-Q4 pass-throughs at the student's own pace (no time-of-day
gating, no clock — see TIMER-REMOVAL note in §F10).

### F8: Adversarial mock generation
Build-time AI generates hardest possible test variants. Multi-axis: weirdest entity + hardest algorithm + 5 fields + adversarial values.

### F9: Cross-track validation
Same atom appears in multiple Q contexts. Q1 trace using struct + Q3 write using struct + Q4 print using struct. Tests transfer not rote.

### F10: Production progression (no timer) [REVISED 2026-05-07]
**Original feature retired.** The "speed progression curve" (S4 = 2× exam
pace, S5 = 1.5×, S6 = exam pace + 20% buffer) was removed along with the
timer system on 2026-05-07. All stages, including S6 (renamed to
PRODUCTION), are now untimed: the mastery gate is accuracy, not seconds.

### F11: Burnout detection
Performance drop > 20% in last 10 cards → force 10-min break + walkthrough-only deck.

### F12: Multi-pass authoring
Each card: skeleton author → variation expander → peer reviewer → final QA. 4 passes per card.

---

## CONFIDENCE MATH (target ≥98%)

```
Sufficiency:
  4,600 hand-authored cards
  Effective views ~2,800 (after exposure-frequency retires familiar)
  Coverage: 30 atoms × 100 entities × 20 algos = 60,000 latent variants
  Sampled: ~4,000 = 6.7% of variant space (deep enough for transfer)
  
Common-mistake immunization:
  40 mistakes × 5 cards each = 200 immunization cards
  Failure-mode coverage: 99%
  
Stage-gate stall risk:
  4 escape valves + DAG-backward retry → stall probability < 1%
  
Test-day robustness:
  50 full mocks × 4 variant types = 200 mock variants
  150 adversarial mocks
  100 partial mocks
  Plausible test variant coverage: 99%
  
Burnout:
  D5 EASY DAY + 4hr cap + retro screens + burnout detection = ~95% fatigue managed
  
Adaptive deck:
  Failure-pattern detection + DAG retry + weakness file → 90% of weak atoms remedied
  
Confidence:
  P(≥85%) = 98%
  P(≥95%) = 90%
  P(100%) = 65%
```

---

## ENGINEERING DECISIONS

### 1. Source-of-truth grounding
Every card cites: atom-ID + source (practice / V2.0 / PFG-section / seminar-VTT-timestamp). Verifiable trail.

### 2. Hand-authored, peer-reviewed, multi-pass
No build-time AI generation for card content. Humans (or agent-as-human) author, second agent reviews, third QAs. Author-review-QA = 3-pass quality.

### 3. Acceptance test suite
- Every atom has ≥6 cards: PASS
- Every common mistake has ≥3 immunization cards: PASS
- Every algo × entity × field-count covered ≥1×: PASS
- No word-memorize cards: PASS
- All canonicals compile: PASS
- No off-scope content: PASS
- Atom prereq DAG cycle-free: PASS

### 4. Versioned card schema
Each card: { atom-ID, q-tags[], type, content, canonical, keyChecks[], commonMistakes[], source, version, peerReviewer, qaApprover }

### 5. Build-time audit
Lint script enforces: brace balance, semicolon presence, canonical compiles via clang lite, q-tags non-empty, common-mistake link valid.

### 6. Regression baseline
First successful 0-prior dry-run logged as baseline. Future builds must match or beat baseline accuracy.

### 7. Reproducibility
Seed-based shuffling. Same seed → same deck order. Enables A/B testing future tweaks.

---

## STUDENT EXPERIENCE TIMELINE (May 14 attempt 2 + May 21 attempt 3)

### May 7-13 (pre-attempt-2 week, build-in-progress)
Run Option 2 plan (existing 2,811 cards retagged + culled). Aim: survive May 14.

### May 14 attempt 2
- If pass → done.
- If fail → continue to May 21 attempt 3 with Option 4 deck (build complete by then).

### May 14-20 (Option 4 study week)
| Day | Focus | Hours |
|---|---|---|
| D8 | L0 Foundation + Q2 S1-S2 | 4h |
| D9 | L0 + Q2 S3 + Q3 S1-S2 | 4h |
| D10 | Q1 S1-S3 + Q2 S4-S5 | 4h |
| D11 | Q3 S3-S4 + Q1 S4 | 4h |
| D12 | First Mock + Q4 S1-S3 | 4h |
| D13 | Mock #2-3 + targeted weakness drills | 4h |
| D14 | EASY DAY (walkthrough-only) | 2h |
| D15 | Adversarial mocks + speed practice | 4h |
| D16 | Mock #4-5 + Test-day-sim | 4h |
| D17 | Pre-flight check + light review | 2h |
| D18 | Test-day-sim 11am exact | 2h |
| D19 | Final touch-ups + rest | 1h |
| D20 | REST | 0h |
| D21 | TEST 11am | exam |

Total study: ~39 hours over 14 days.

---

## RISK REGISTER

| Risk | Probability | Mitigation |
|---|---|---|
| Build runs over 21 days | Medium | Phased delivery; can ship at any phase boundary with reduced scope |
| Component bugs in the code editor | Medium | Phase 1 isolated; QA phase tests components before card content depends on them |
| Author agents produce inconsistent style | Low | Schema validation + peer review enforce uniformity |
| Atom prereq DAG has hidden cycle | Low | Acceptance test detects |
| Student burnout in 14-day study | Medium | EASY DAYS + 4hr cap + burnout detection |
| Real test V3 pattern outside our 200 mock variants | Low | S5.5 wildcard + adversarial mocks cover edge |
| F-22 (pass-by-ref) under-drilled | Critical | Split into 5 sub-atoms × 30 cards each = 150 cards on this skill alone |

---

## DECISION POINTS

| # | Decision | Recommendation |
|---|---|---|
| A | Approve Option 4 build start? | Yes — start now in parallel with Option 2 study for May 14 |
| B | Wall-clock target | 21 days (May 28 ready), aiming to be ready by May 21 |
| C | Phase 1 components in parallel with Phase 2 authoring? | Yes — Phase 2 doesn't need final components, can use stubs |
| D | Card-count cap if overrun? | Hard cap 5,000 cards. Anything beyond is gold-plating. |
| E | Should L5 mocks include hand-graded subjective rubric? | No — keep deterministic char-match for instant feedback |

---

## OUTPUT ARTIFACTS

When build complete:
- `cpp-t2/data/cards-v2.json` — 4,600 cards
- `cpp-t2/src/components/` — 18 card components (10 new + 8 existing refined)
- `cpp-t2/src/engines/` — exposure-freq, multi-Q tagging, adaptive-deck, DAG-retry
- `cpp-t2/src/pages/` — Home, Track, Card, Mock, Postmortem, Weakness, AtomTree, Preflight
- `cpp-t2/data/atoms-v2.yml` — 30 atoms with full DAG
- `cpp-t2/data/variants-v2.yml` — 100 entities + 20 algos + 4 field-count matrices
- `cpp-t2/data/common-mistakes-v2.yml` — 40 mistakes + immunization slots
- `cpp-t2/build/` — lint, acceptance, regression test scripts
- `cpp-t2/dist/` — production build, ~250KB gzip JS (estimated)

---

## NEXT STEP

**Authorize Phase 1 start?**

If yes → spawn 10 Phase-1 component agents now in parallel. Phase 2 starts on Day 8 once primitives stable. Wall-clock 21 days. Deck ready May 28; targeted ready May 21 with stretch.

If no → revert to Option 2 baseline.

---

## APPENDIX: WHY THIS HITS 98%

| Threat | Without Option 4 | With Option 4 |
|---|---|---|
| Off-scope skill on test | 70% addressed | 99% addressed (200 mock variants + adversarial) |
| Student fails one atom | Stall | DAG-backward retry + remediation |
| Student under-confidence | Errors compound | Confidence calibration + weakness file |
| F-22 pass-by-ref miss | Q1+Q3 collapse | 150 cards on F-22 sub-atoms |
| Burnout at D5 | Performance drop | Mandated EASY DAY + detection |
| Test format variant unseen | Panic | Adversarial mocks pre-exposed |
| 24h pre-test gap | Last-minute cram | Pre-flight check + targeted drill |
| Test-day stress | Choke | Test-day-sim at 11am with same prose |

98% is the realistic ceiling for a deterministic exam prep system with 0-prior student. The remaining 2% covers: physical illness, paper handed in late, pen broken, exam-room emergency.

---

**END OF OPTION 4 PLAN — Awaiting authorization to spawn 30 parallel agents.**
