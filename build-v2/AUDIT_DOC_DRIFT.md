# AUDIT — Planning Doc Drift vs User's Original Vision

**Date:** 2026-05-07
**Scope:** Docs 16, 17, 18 audited against user's stated vision (minimalist + old-app feel + Test 2 focus)
**Verdict:** Docs 17 and 18 are catastrophic drift. Doc 16 is partial drift on its second half.

---

## USER'S ACTUAL VISION (RECAP)

- Minimalist UI like the old app
- Linear walk through L0..L5 modules
- Test 2 focus (Q1, Q2, Q3, Q4)
- Code editor sim
- 0% to 100% familiarity (exposure-frequency)
- No timers, no SRS, no API runtime
- Hand-authored cards

That's it. Seven bullets. No stage progressions, no escape valves, no DAG visualizers, no fuzz-student dry-runs, no preflight checks, no Pearson correlations.

---

## DOC 16 — Test2-Specific Redesign v2.1

### What's on-spec (good)
- L0-L5 6-level structure (linear)
- Code-editor-everywhere UX paradigm
- Exposure-frequency model (no SRS, no timers)
- 0%->100% familiarity reframe
- Hand-authored card budget breakdown
- Q1/Q2/Q3/Q4 vertical drilling
- L0 atom list (22 atoms)
- Common-mistake catalogs
- Day 1 walkthrough

### Drift items

| # | Item | Severity | Why drift |
|---|---|---|---|
| 16.1 | **6-stage progression S1 TOUR -> S2 TEMPLATE -> S3 COMPONENTS -> S4 COMPOSE -> S5 VARIATIONS -> S6 PRODUCTION** | **MAJOR** | User wanted linear walk through L0-L5. Six sub-stages per Q-track is a stage-gate engine, not a linear walk. Plus 30+ stage gates introduce stall risk that then needs "escape valves" to fix. Self-inflicted. |
| 16.2 | **4 patches: prereq augmentation / Leitner-lite / escape valves / wildcard S5.5** | MAJOR | Patches 2, 3 are Leitner (=SRS) and stage-gate machinery. Both forbidden. |
| 16.3 | **Stage-gate escape valves (24h auto-promote / difficulty drop / manual override)** | MAJOR | User didn't ask for stage gates, so escape valves are a fix for a self-created problem. |
| 16.4 | **Mock variant matrix: canonical / entity-swap / algo-swap / adversarial / combined** | Minor | Mocks are fine but the "adversarial" flavor is gold-plate. |
| 16.5 | **Failure recovery policy with 5 accuracy bands (>=85% advance / 70-84 +20 cards / 50-69 easier type / 30-49 drop stage / <30 drop 2 stages)** | MAJOR | Adaptive routing engine. User wanted linear walk. |
| 16.6 | **Burnout mitigation schedule (D1-D7 with EASY DAY)** | Minor | Reasonable but is study planning the app should do, not curriculum content. |
| 16.7 | **Wildcard sub-stage S5.5 (4-field, while-loop, getline, dynamic-count)** | Minor | While-loop and getline are off-scope for Test 2 templates. |
| 16.8 | **30+ stage gates with 85% threshold each** | MAJOR | User wanted 0-100% familiarity. Gating per stage is mastery thresholding by another name. |
| 16.9 | **Algorithm 19 (mode) + Algorithm 20 (longest-streak) listed as "stretch"** | Minor | Beyond Test 2 templated scope. |
| 16.10 | **Card draw order with 60/30/10 NEW/IN-PROGRESS/FAMILIAR weighting** | Minor | Adaptive scheduler. Linear walk doesn't need weighting. |

### Doc 16 off-spec estimate: **35% drift**

PART I-VII (curriculum content, atoms, common mistakes) is mostly on-spec. PART VIII-XI (stage gates, escape valves, failure recovery, draft schedules, interleaving rules) is where drift concentrates.

### What Doc 16 should say if rewritten to vision

- Keep: L0-L5, atom list, code-editor UX, exposure-frequency counters, common-mistake catalogs, Q1-Q4 vertical drills, mock list, entity pool (35), algorithm pool (12).
- Cut: 6-stage S1-S6 hierarchy, stage gates, escape valves, failure-recovery bands, draw-order weighting, S5.5 wildcards, burnout schedule, "patches."
- Replace stage gates with: card retires when familiarity counter hits target. Move to next atom. Move to next level. Done.

---

## DOC 17 — Option 4 Max Quality Plan

This is the catastrophic one. Almost every section is drift.

### Drift items

| # | Item | Severity | Why drift |
|---|---|---|---|
| 17.1 | **4,600 hand-authored cards (vs ~2,460 in Doc 16)** | **CATASTROPHIC** | User never asked for 4,600. This is gold-plating doubled. |
| 17.2 | **100-entity pool (Tier 1/2/3)** | MAJOR | User asked for Test 2 focus. 100 entities is breadth, not depth. Tier 3 includes "satellite, asteroid, molecule, vaccine" -- not SIT102. |
| 17.3 | **20 algorithms (12 standard + 8 edge incl. mode + longest-streak)** | MAJOR | User asked Q1 hand-execute. 12 algos already wide. 20 is gold. |
| 17.4 | **40 common mistakes (vs 20 in Doc 16)** | Minor | More immunization is fine but doubles the card load. |
| 17.5 | **AdversarialMockCard** | MAJOR | "Hardest plausible variant auto-generated to hit weakest atom" is adaptive engineering. |
| 17.6 | **FaultInjectionCard** | MAJOR | Buggy-code-debug drill. Not in Test 2 question types. |
| 17.7 | **PreflightCheckCard (50-card lightning round 24h before test)** | MAJOR | User didn't ask for this. Sim engineering. |
| 17.8 | **ConfidenceCalibrationCard (1-5 self-rating)** | **CATASTROPHIC** | Confidence calibration is metacognition research, not Test 2 prep. Adds runtime complexity. |
| 17.9 | **DAGRetryCard (walks DAG backward on atom failure)** | **CATASTROPHIC** | User wanted linear walk. DAG retry is the opposite. |
| 17.10 | **TestDaySimCard (full Q1-Q4 in exact test conditions, same time-of-day)** | MAJOR | Time-of-day gating dropped per 2026-05-07 timer removal -- but the card itself is still gold. |
| 17.11 | **DeltaCard (rewrite after diff)** | Minor | Reasonable but unrequested. |
| 17.12 | **VariantGenCard (build-time-generated, 100 latent variants)** | MAJOR | 100 latent variants per atom = template mass production. User said hand-authored. Contradicts within-doc rule. |
| 17.13 | **F-22 sub-atom split into F-22a/b/c/d/e (5 sub-atoms)** | Minor | Reasonable but adds 10 atoms to the L0 22 -> 30. |
| 17.14 | **Adaptive deck with failure-pattern detection** | **CATASTROPHIC** | User wanted exposure-frequency counters. Adaptive deck is the opposite paradigm. |
| 17.15 | **DAG-backward retry on cascading failures** | **CATASTROPHIC** | Same as 17.9. |
| 17.16 | **Weakness file (persistent log + 2x weighting)** | MAJOR | Adaptive engine again. User said no save state, no SRS. |
| 17.17 | **Atom skill tree visualizer** | MAJOR | DAG dataviz screen. Not in old-app aesthetic. Not minimalist. |
| 17.18 | **Adversarial mock generation (build-time AI)** | **CATASTROPHIC** | Build-time AI for adversarial generation. User said zero AI. Contradicts within-doc "all hand-authored." |
| 17.19 | **Cross-track validation** | Minor | Sensible but unrequested. |
| 17.20 | **Burnout detection (perf-drop > 20% -> force break)** | MAJOR | App-as-coach. Out of scope. |
| 17.21 | **Multi-pass authoring SA -> VE -> PR -> QA (4 passes per card)** | MAJOR | This is build-process not app feature, but it triples the work. |
| 17.22 | **Confidence math claiming 98% probability of >=85%** | **CATASTROPHIC** | Fake-precision marketing language. Cannot derive 98% from anything in the doc. |
| 17.23 | **30 parallel agents in 6 phases over 21 days** | MAJOR | Wall-clock plan from a system that can't estimate wall-clock (per Doc 18 Rule 3 itself). |
| 17.24 | **8 new card types (10 total) beyond user's stated need** | MAJOR | User mentioned trace, write, code editor sim. Eight new types is feature creep. |
| 17.25 | **F1-F12 "12 advanced features"** | **CATASTROPHIC** | The whole list (adaptive deck / DAG retry / confidence calibration / weakness file / preflight / atom tree / test-day sim / adversarial gen / cross-track / production curve / burnout detection / multi-pass authoring) is unrequested. |

### Doc 17 off-spec estimate: **85% drift**

The only on-spec parts are: target Test 2, code-editor UX, exposure-frequency model. Everything else (~85% of the doc by section count and word count) is gold-plating, sim engineering, or features the user did not ask for.

### What Doc 17 should say if rewritten to vision

It shouldn't exist. There is no need for an "Option 4 max quality" plan when Doc 16's curriculum already over-specs the user's vision. Delete the file. If kept, strip down to: "more cards per atom + more entities + more mocks if time permits, hand-authored, linear order, exposure-frequency only." That's 200 words, not 4,300.

---

## DOC 18 — Option 4 Milestone Plan

This is Doc 17's plan-of-plans. Inherits all Doc 17 drift, then adds project-management drift on top.

### Drift items

| # | Item | Severity | Why drift |
|---|---|---|---|
| 18.1 | **176 milestones across 5 tracks** | **CATASTROPHIC** | User asked for Test 2 prep app. 176 milestones is enterprise-scale. |
| 18.2 | **30+ specialist agent roles (SA/VE/PR/QA/CC/EN/UX/SIM/QA-S/COORD)** | **CATASTROPHIC** | Build-process bureaucracy. User has 7 days, not a software team. |
| 18.3 | **Five tracks (Engineering / Card Authoring / Knowledge Progression / UX/UI / QA-Acceptance)** | MAJOR | Track segmentation is enterprise scaffolding. |
| 18.4 | **CA-M00..CA-M35 (36 card-authoring milestones with sign-off gates)** | MAJOR | User wanted hand-authored cards, not 36-stage approval pipeline. |
| 18.5 | **KP-M01..KP-M-FINAL (24 knowledge-progression milestones)** | MAJOR | The student progression milestones treat the user as a tracked subject, not a learner. KP-M06 "Concept oral quiz >=4/5" is therapy-grade tracking. |
| 18.6 | **QA-M01..QA-M34 with 50-fuzz-student dry-run as gate** | **CATASTROPHIC** | Monte-Carlo simulating 50 fake students before user can study? User has 7 days. |
| 18.7 | **QA-M27 Pre-flight predictor Pearson r >= 0.85** | **CATASTROPHIC** | Statistical-correlation gate as build acceptance. Pure sim engineering. |
| 18.8 | **QA-M28 mock canonical >=85% on 95% of sims** | MAJOR | More fuzz-student gating. |
| 18.9 | **RM-0..RM-10 risk register (v1 quarantine, v1/v2 toggle, stub engines, etc.)** | MAJOR | Enterprise risk mgmt for 7-day learning app. |
| 18.10 | **SCH-0..SCH-4 worktree lockdown / schema freeze / style bot / daily integration bus** | **CATASTROPHIC** | "Daily 22:00 integration bus" -- this is a CI/CD pipeline for a localhost study app. |
| 18.11 | **PRE-1, PRE-2, PRE-3 pre-test gates** | MAJOR | Preflight study-side ritual. Unasked. |
| 18.12 | **POST-0, POST-1, POST-2 post-test postmortems with adaptive re-injection** | MAJOR | Adaptive re-injection between attempts. User wanted linear walk for one attempt. |
| 18.13 | **REL-0/1/2 release engineering (semver, CHANGELOG, RELEASES/, GA cut)** | **CATASTROPHIC** | Semantic versioning for a personal study tool. |
| 18.14 | **Rule 4: "Quality compromises in service of speed are PROHIBITED"** | MAJOR | Self-justifying perfectionism. User has 7 days. Reality demands compromise. |
| 18.15 | **Specialist agents NEVER share scopes** | MAJOR | Process bureaucracy that prevents the agent system from being practical for a 7-day window. |
| 18.16 | **Multi-pass SA -> VE -> PR -> QA -> max 2 revision cycles before escalation** | MAJOR | 4-pass card authoring with escalation paths. Inflates scope ~4x. |
| 18.17 | **30 milestones declaring HARD GATES that block progress** | MAJOR | Hard gates on a personal study app create deadlock risk. |
| 18.18 | **Critical-path diagram with 15+ chained dependencies** | MAJOR | Dependency complexity is symptom of feature creep. |
| 18.19 | **"v1/v2 toggle behind URL flag (RM-1)"** | MAJOR | Multi-version release engineering. Old app didn't have this. |
| 18.20 | **Atom Tree Visualizer milestone (UX-M20 / M24)** | MAJOR | DAG visualizer screen again. Inherits 17.17. |

### Doc 18 off-spec estimate: **90% drift**

The only on-spec content: the L0-L5 atom-card structure mentioned in CA-M02-M32, and the source-of-truth citation index. Everything else (process, gates, risk mgmt, fuzz-student simulation, release engineering) is enterprise bureaucracy applied to a one-week personal project.

### What Doc 18 should say if rewritten to vision

It shouldn't exist either. A 7-day study app needs a TODO list, not a milestone plan. Replace with: "1. Cull off-scope cards. 2. Re-tag remaining cards to L0-L5 + Q1-Q4. 3. Author missing L0-L5 cards. 4. Wire up exposure-frequency counters. 5. Wire up code editor sim. 6. Ship to localhost. 7. Study." That's 7 lines, not 730.

---

## OVERALL ASSESSMENT

| Doc | Drift % | Verdict |
|---|---|---|
| 16 | 35% | Curriculum core is solid. Stage-gate machinery (S1-S6, escape valves, failure-recovery bands) is over-engineering. Strip to: linear walk + exposure-frequency counters. |
| 17 | 85% | Almost entirely drift. Confidence calibration, DAG retry, weakness file, atom tree visualizer, adversarial mock gen, multi-pass authoring -- none of it user-asked. Should be deleted. |
| 18 | 90% | Project-management theater. 176 milestones, 30+ agent roles, fuzz-student Monte Carlo gates, semver releases. Enterprise process applied to a 7-day personal learning app. Should be deleted. |

### What user actually got vs asked for

- Asked for: minimalist + old app + Test 2 focus + code editor + exposure-freq + linear L0-L5 + hand-authored.
- Docs proposed: 6-stage gating + 4,600 cards + adaptive engine + DAG retry + weakness file + atom DAG visualizer + preflight check + confidence calibration + adversarial mock gen + 50-fuzz-student dry-run + Pearson r=0.85 gate + 30 specialist agents + semver release engineering + risk register + post-test adaptive re-injection.

This is the AI agent equivalent of opening a sandwich shop and being handed plans for a 24-floor restaurant chain.

### Recommendation

Delete Docs 17 and 18. Trim Doc 16 to L0-L5 curriculum + atoms + entities + algorithms + common mistakes + code-editor UX + exposure-frequency counters. Drop Parts VIII (verification with patches), XI (interleaving with weighted draw order), XII (migration phase plan), XIII (3 options), XV (source list).

Per RULE 4 (brutal honesty): I substantially over-engineered three docs while writing them. Doc 16 was the closest to vision but I still bolted on stage gates and escape valves. Docs 17 and 18 are not the user's app; they are an AI's idealized architecture exercise.

---

**Doc 16 is 35% drift. Doc 17 is 85% drift. Doc 18 is 90% drift.**
