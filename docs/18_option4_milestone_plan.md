---
# DEPRECATED — DRIFT ARTIFACT (2026-05-07)

**Status:** SUPERSEDED by `docs/19_v22_minimalist_plan.md`.

**Why deprecated:** This plan was project-management theater for a
7-day study app. 176 milestones across 5 tracks, 30+ specialist agent
roles, 4-pass authoring pipeline, semver release engineering, daily
integration bus — none of which match the user's stated minimalist
vision.

**What was correct here:**
- The 4 core RULES (time unbounded, max parallelism, no time estimates,
  max quality min compromise) — preserved as engineering principles
- The Tier hierarchy framing — preserved
- The dependency-driven order (no Gantt) — preserved

**What was drift:**
- 176 milestones (a study app for one student does not need this)
- 30 specialist agent roles (1-3 agents in parallel suffices)
- SA -> VE -> PR -> QA 4-pass pipeline (over-engineered for content)
- Acceptance gates QA-M16..QA-M34 (most are sim engineering not user-asked)
- Pre-flight Pearson r=0.85 (false-precision)
- 50-fuzz-student Monte Carlo dry-run (over-engineered QA)

**Read instead:**
- `docs/19_v22_minimalist_plan.md` — current minimalist plan
- `docs/v2/MANIFEST.md` — locked features

---

## ORIGINAL DOC PRESERVED BELOW FOR HISTORY

# cpp-t2 Option 4 — MILESTONE PLAN (consolidated)

**Status:** PROPOSED — pending user authorization
**Date:** 2026-05-07
**Scope:** Full milestone breakdown for Option 4 max-quality build (4,600 hand-authored cards, 98% confidence target)
**Synthesis:** 6 parallel agents covering engineering / authoring / knowledge progression / UX / QA / risk
**Companion docs:** `16_test2_specific_redesign_v2.md` (curriculum), `17_option4_max_quality_plan.md` (strategy)

---

## ★ CORE RULES (NON-NEGOTIABLE) ★

### RULE 1: TIME IS NOT A CONSTRAINT — ONLY QUALITY IS
- Build duration unbounded. Take as long as needed.
- No deadline pressure overrides quality decisions.
- "Faster" never a reason. "Better" only reason.
- Milestone done when RIGHT, not when clock expires.
- Pre-test gates (PRE-1, PRE-2, PRE-3) = study-side anchors only; build-side has NO deadlines.

### RULE 2: USE PARALLEL AGENTS AS MUCH AS POSSIBLE — SPECIALISTS FOR HAND-AUTHORING EVERYTHING
- Every authoring task → SPECIALIST agent (one agent = one narrow expertise).
- 100% hand-authored. ZERO build-time AI gen. ZERO templated mass-production. ZERO copy-paste-substitution.
- Each card written by specialist agent (SA / VE / PR / QA pass).
- Maximum parallelism at every phase: N independent tasks → N agents.
- Specialist roles strictly enforced:
  - **SA** Skeleton Author — drafts canonical card, cites source
  - **VE** Variation Expander — generates variants from locked skeleton, hand-authored
  - **PR** Peer Reviewer — cross-checks correctness + distractor + citation
  - **QA** QA Approver — schema lint + citation audit + final approval
  - **CC** Card Component engineer — React components per card type
  - **EN** Engine engineer — exposure-freq, multi-Q, adaptive, DAG-retry
  - **UX** UX/UI designer — screens + design system
  - **SIM** Student-sim engineer — Monte-Carlo fuzz students
  - **QA-S** System QA — lint scripts, regression, acceptance
  - **COORD** Coordinator — worktrees, schema freeze, triage
- Agents NEVER share scopes. Each owns one narrow lane.
- 30+ specialists at peak = FLOOR, not ceiling.
- Hand-authored ≠ "AI did the writing." Each card individually crafted, peer-reviewed, source-cited.

### RULE 3: NO TIME ESTIMATES — CLAUDE CODE CANNOT ESTIMATE WALL-CLOCK ACCURATELY
- ALL "agent-days" / "wall-clock days" / "hour" / "day" estimates in any prior version of this doc are INVALID.
- Claude Code does not have reliable runtime telemetry to predict completion times.
- Time estimates that previously appeared in this plan were guesses — they served only to communicate relative complexity, not actual duration.
- Adding fake estimates compromises quality by inducing false urgency.
- Reality: this entire build likely completes in a few hours of actual Claude Code runtime via parallel agents — NOT 21 days.
- Reality also: it might take longer if quality demands it. Either way, the clock is irrelevant.
- **No milestone in this plan has a time budget.** Milestones complete when their acceptance criteria are met. Period.
- If any future revision of this plan tries to add time estimates, those estimates must be marked NULL/N-A and ignored.

### RULE 4: MAX QUALITY, MIN COMPROMISE
- Every decision optimizes for QUALITY first, COMPROMISE never.
- "Good enough" is rejected. "Right" is the only acceptable state.
- If a milestone could be done at 80% quality fast or 100% quality slow → choose 100% slow.
- No shortcuts. No skip-validation. No skip-peer-review. No skip-source-citation.
- Quality compromises in service of speed are PROHIBITED by RULE 3 (since speed is not measurable anyway).
- The student's exam outcome is the only metric. Cards that fail to immunize a mistake = quality failure. Components that flake = quality failure. Atoms that don't transfer = quality failure. Each is fixed before milestone closes — no matter how many cycles.

---

## EXECUTIVE SUMMARY

5 milestone tracks running in parallel:

| Track | Prefix | Count | Owner |
|---|---|---|---|
| **Engineering** (components + engines + UX + integration + QA) | `M-NN` | 35 | 4 streams × 2 agents |
| **Card Authoring** (4,600 cards across 6 levels) | `CA-MNN` | 36 | 8 author + 3 PR + 2 QA agents |
| **Knowledge Progression** (student trajectory 0%→100%) | `KP-MNN` | 25 | 2 student-sim agents |
| **UX/UI** (screens, components, design system) | `UX-MNN` | 21 | 3 design agents |
| **QA / Acceptance** (lint, atom, system, sim) | `QA-MNN` | 34 | 6 QA + sim agents |
| **Risk + Scheduling + Release** | `RM/SCH/REL-NN` | 25 | 1 coord agent |
| **TOTAL** | | **176 milestones** | **30+ parallel specialist agents** |

**No time totals reported (per RULE 3).** Build completes when all acceptance criteria pass.

---

## PART 1 — ENGINEERING BUILD MILESTONES (M0–M34)

Time columns removed per RULE 3. Order = dependency, not duration.

| ID | Name | Phase | Parallel With |
|---|---|---|---|
| M0 | Repo + Toolchain (Vite/React/TS/Tailwind/CI/Ladle) | 1 | — |
| M1 | Ladle + Dev Routes | 1 | M2 |
| **M2** | **Card Schema v1 LOCK** | 1 | M1 |
| M3 | VSCode-Sim Primitives (CodeMirror, BraceMatcher, DebuggerPanel, TerminalOutput, DiffGutter) | 1 | M4 |
| M4 | Atom Model + Storage (Zod + Context + reselect) | 2 | M3 |
| M5 | TemplateRecallCard (3-stage) | 1 | M6, M7 |
| M6 | StructWriteCard + FunctionWriteCard + MainWriteCard | 1 | M5, M7 |
| M7 | TraceCard v2 (code editor style) | 1 | M5, M6 |
| M8 | EntityMatrixCard + AlgorithmMatrixCard | 1 | M9, M10 |
| M9 | SpeedDrillCard | 1 | M8, M10 |
| M10 | AdversarialMockCard + FaultInjectionCard | 1 | M8, M9 |
| M11 | PreflightCheckCard + ConfidenceCalibrationCard + DeltaCard + DAGRetryCard + TestDaySimCard + VariantGenCard | 1 | M12 |
| M12 | Card Registry + Renderer | 1 | M11 |
| M13 | Exposure-Frequency Counter Engine | 2 | M14, M15 |
| M14 | Multi-Q Tagging + Propagation | 2 | M13, M15 |
| M15 | Stage-Gate + 4 Escape Valves | 2 | M16 |
| M16 | Daily-Deck Composer | 2 | M17 |
| M17 | Adaptive Deck (in-session) | 2 | M18 |
| M18 | DAG-Backward Retry Engine | 2 | M19 |
| **M19** | **REGRESSION BASELINE LOCK** | 5 | M20 |
| M20 | Home Screen (4-track + L0 + L5 + atom-tree) | 3 | M21 |
| M21 | Track Screens (4 tracks) | 3 | M22 |
| M22 | Card Screen Shell + Mock Screens | 3 | M23 |
| M23 | Postmortem + Weakness File + Preflight Check | 3 | M24 |
| M24 | Atom Tree Visualizer | 3 | M25 |
| M25 | 30-Agent Authoring Pipeline (CLI + ledger + conflict-merge) | 4 | M26 |
| **M26** | **Authoring Wave 1: L0 + L1** (~1,500 cards parallel) | 4 | M27 |
| **M27** | **Authoring Wave 2: L2 + L3** (~1,800 cards parallel) | 4 | M28 |
| **M28** | **Authoring Wave 3: L4 + L5** (~1,300 cards parallel) | 4 | M29 |
| M29 | Full-Deck Performance Pass (bundle, code-split, lazy) | 5 | M30 |
| M30 | A11y + Keyboard + Reduced-Motion Pass | 5 | M31 |
| M31 | E2E Mock Exam Flow | 5 | M32 |
| M32 | Schema-Drift + Golden Audit | 5 | M33 |
| **M33** | **Release Candidate (RC) Build** | 5 | M34 |
| **M34** | **User Acceptance Run + Bugfix Triage** | 5 | — |

**Critical path:** M0 → M2 → M3 → M4 → M5 → M12 → M16 → M19 → M25 → M28 → M33 → M34.

---

## PART 2 — CARD AUTHORING MILESTONES (CA-M00 → CA-M35)

### Authoring roles per milestone
- **SA** Skeleton Author — drafts canonical card per atom
- **VE** Variation Expander — generates variants from skeleton
- **PR** Peer Reviewer — cross-checks correctness + source
- **QA** QA Approver — schema lint + citation audit

Multi-pass: SA → VE → PR → QA (4 passes per card, max 2 revision cycles before escalation)

### Source-of-truth taxonomy (every card cites)
- `practice:Q{N}_{paper-id}` (8 past papers)
- `v2:§{section}` (V2.0 spec)
- `pfg:p{page}` (Programming Fundamentals Guide)
- `seminar:wk{N}@{HH:MM:SS}` (Aaron's lecture VTT)

### Milestone Table (all 36)

Time columns removed per RULE 3.

| ID | Name | Atoms | Cards | Parallel Slots |
|---|---|---|---|---|
| CA-M00 | Schema + Lint Pipeline | — | 0 | 1 SA |
| CA-M01 | Source-of-Truth Citation Index | — | 0 | 2 SA |
| CA-M02 | L0 Lexical (atoms 1-10) | A1-A10 | 320 | 3 SA |
| CA-M03 | L0 Statements (atoms 11-20) | A11-A20 | 320 | 3 SA |
| CA-M04 | L0 Functions/IO (atoms 21-30) | A21-A30 | 360 | 3 SA |
| CA-M05 | L0 Variation Expansion | All L0 | 0 (variants) | 4 VE |
| CA-M06 | L0 Peer Review Sweep | All L0 | 0 | 3 PR |
| CA-M07 | L0 QA + Common-Mistake Immunization | All L0 | +60 | 1 QA + 1 SA |
| **CA-M08** | **L0 Sign-off Gate** (1,060 APPROVED) | All L0 | 0 | 1 QA |
| CA-M09 | L1 Hand-Execute Atoms (12 algos) | A31-A42 | 360 | 4 SA |
| CA-M10 | L1 Algorithm Matrix Expansion (12→20) | A43-A50 | 240 | 3 VE |
| CA-M11 | L1 Speed Drills | A31-A50 | 200 | 2 SA + 1 VE |
| CA-M12 | L1 Cloze + TemplateRecall | A31-A50 | 200 | 3 SA |
| CA-M13 | L1 Common-Mistake Immunization | A31-A50 | 100 | 2 SA |
| **CA-M14** | **L1 Sign-off Gate** (1,200 APPROVED) | All L1 | 0 | 3 PR + 1 QA |
| CA-M15 | L2 Struct-Authoring Atoms | A51-A60 | 200 | 3 SA |
| CA-M16 | L2 Entity Library (10 hand-authored) | A51-A60 | 60 | 5 SA |
| CA-M17 | L2 Entity Matrix Expansion (10→100) | — | 240 | 1 SA + 3 PR |
| CA-M18 | L2 Common-Mistake Immunization | A51-A60 | 60 | 2 SA |
| **CA-M19** | **L2 Sign-off Gate** (560 APPROVED) | All L2 | 0 | 3 PR + 1 QA |
| CA-M20 | L3 Read-Function Atoms (15) | A61-A75 | 320 | 4 SA |
| CA-M21 | L3 Entity Matrix Read-Fn (50 variants) | A61-A75 | 250 | 1 SA + 2 PR |
| CA-M22 | L3 Common-Mistake Immunization | A61-A75 | 100 | 2 SA |
| **CA-M23** | **L3 Sign-off Gate** (800 APPROVED) | All L3 | 0 | 3 PR + 1 QA |
| CA-M24 | L4 Main-Program Atoms (20) | A76-A95 | 320 | 4 SA |
| CA-M25 | L4 Entity Matrix Main (50 variants) | A76-A95 | 250 | 1 SA + 2 PR |
| CA-M26 | L4 Common-Mistake Immunization | A76-A95 | 80 | 2 SA |
| **CA-M27** | **L4 Sign-off Gate** (700 APPROVED) | All L4 | 0 | 3 PR + 1 QA |
| CA-M28 | L5 Adversarial Bank | Cross-atom | 150 | 3 SA |
| CA-M29 | L5 Partial Mocks | Cross-atom | 100 | 4 SA |
| CA-M30 | L5 Full Mock Papers (50 mocks × 6 cards) | Cross-atom | 250 | 6 SA + 2 PR |
| CA-M31 | L5 Preflight + Postmortem Routine | — | 100 | 2 SA |
| **CA-M32** | **L5 Sign-off Gate** (400 APPROVED) | All L5 | 0 | 3 PR + 2 QA |
| CA-M33 | Cross-Level Source-Truth Audit | All 4,600 | 0 | 3 QA |
| CA-M34 | Common-Mistake Coverage Matrix Audit | All | +50 | 2 QA + 1 SA |
| **CA-M35** | **Final Schema Lint + Build Gate** | All 4,650 | 0 | 1 QA |

**Total: 36 milestones. Quality-gated, not time-gated.**

### Critical-path atom blocks
- **A11–A20** (control flow) blocks all of L1
- **A21–A30** (functions/IO) blocks L3 + L4
- **A51–A60** (struct) blocks L3 entity expansion
- **A61–A75** (read-fn) blocks L4 main expansion
- **All mistake archives** (M07/M13/M18/M22/M26) block CA-M28 (adversarial)
- **All Q-track gates** (M14/M19/M23/M27) block CA-M29 (partial mocks)

---

## PART 3 — KNOWLEDGE PROGRESSION MILESTONES (KP-M01 → KP-M-FINAL)

### Pedagogical foundation
- **Concept-vs-syntax order:** SYNTAX-FIRST via worked-example tracing, concept extracted retroactively (KP-M06 lands "why pass-by-ref" AFTER 30+ trace exposures)
- **Trace-before-write:** Q1 (trace) at KP-M09 precedes Q2-Q4 writes — tracing seeds the mental schema retrieval draws from
- **100% familiarity feels like:** atom auto-fires without translation. Like typing your own name. No internal monologue.

### Layer model

```
LAYER 4: CONFIDENCE  [KP-M22 → KP-M-FINAL]
  Production + Variant + Self-audit + Calm
                       ↑
LAYER 3: PRODUCTION  [KP-M18 → KP-M22]
  Mock #1 → Mock #2 → Robust mock (all untimed)
                       ↑
LAYER 2: APPLICATION  [KP-M07 → KP-M18]
  Q1 trace cold → Q2 → Q3 → Q4 blank-page
                       ↑
LAYER 1: CONCEPT  [KP-M04 → KP-M06]
  Pass-by-ref WHY (compression of pattern, not prereq)
                       ↑
LAYER 0: RECOGNITION  [KP-M01 → KP-M04]
  Sight-read tokens, name every keyword
```

### Milestone Table (24 KP milestones)

Note: KP track is STUDENT progression. "Cum hours" = student study hours, NOT build time. Per RULE 3, only student-side hours retained (these are real human study sessions, separately measurable).

| ID | Name | L0/L1/L2/L3/L4/L5 % | Atoms mastered (cumul) | Student hours | Pass criteria |
|---|---|---|---|---|---|
| KP-M01 | First Contact | 5/0/0/0/0/0 | 0 | 0.5 | 1 session, no quit |
| KP-M02 | Syntax Sight-Read | 30/0/0/0/0/0 | 8 | 2 | Token recognition ≥90% |
| KP-M03 | Struct Aware | 70/0/0/0/0/0 | 18 | 4 | Identify-token quiz ≥90% |
| **KP-M04** | **L0 Complete** | 100/10/10/10/10/0 | 30 | 7 | L0 retire ≥85% |
| KP-M05 | Q1 Tour Done | 100/35/15/15/15/0 | 45 | 9 | L1 S1 ≥80% |
| **KP-M06** | **Concept: Pass-by-Reference** | 100/50/20/20/20/0 | 58 | 11 | Concept oral quiz ≥4/5 |
| KP-M07 | Q1 Trace Find-Max | 100/75/25/25/25/0 | 75 | 14 | Cold trace ≥85% |
| KP-M08 | Q1 Trace Sum/Count | 100/95/30/30/30/0 | 95 | 17 | 4/5 algo variants ≥85% |
| **KP-M09** | **Trace Fluency** | 100/100/35/35/35/0 | 105 (L1 retired) | 20 | L1 retire ≥90%, <4 min |
| KP-M10 | Q2 Recognise | 100/100/60/40/40/0 | 120 | 23 | L2 S3 ≥80% |
| KP-M11 | Q2 Compose | 100/100/85/50/50/0 | 138 | 26 | Open-book Q2 ≥90% |
| **KP-M12** | **Q2 Blank Page** | 100/100/100/60/60/0 | 152 (L2 retired) | 30 | 5 cold variants ≥95% |
| KP-M13 | Q3 Skeleton | 100/100/100/75/65/0 | 168 | 33 | Signature quiz ≥90% |
| KP-M14 | Q3 Body | 100/100/100/90/75/0 | 178 | 36 | Open-book Q3 ≥90% |
| **KP-M15** | **Q3 Blank Page** | 100/100/100/100/85/0 | 185 (L3 retired) | 40 | 4 cold variants ≥90% |
| KP-M16 | Q4 Skeleton | 100/100/100/100/92/0 | 187 | 42 | L4 S3 ≥85% |
| KP-M17 | Q4 Compose | 100/100/100/100/100/0 | 187 | 45 | Open-book Q4 ≥95% |
| **KP-M18** | **Q4 Blank Page** | 100/100/100/100/100/10 | 187 | 48 | 4 cold variants ≥95% |
| KP-M19 | All-Q Compose | 100/100/100/100/100/30 | 187 | 52 | 1 chained mock ≥85% |
| KP-M20 | Mock #1 | 100/100/100/100/100/50 | 187 | 56 | Mock ≥85% |
| KP-M21 | Mock #2 | 100/100/100/100/100/70 | 187 | 60 | Mock ≥85% |
| **KP-M22** | **Robust** | 100/100/100/100/100/85 | 187 | 64 | 2 mocks ≥85% |
| KP-M23 | Variant Robustness | 100/100/100/100/100/92 | 187 | 67 | 5 random variants ≥85% |
| KP-M24 | Error Recovery | 100/100/100/100/100/96 | 187 | 69 | 3 mocks 0 final errors |
| **KP-M-FINAL** | **Exam-Ready** | 100/100/100/100/100/100 | 187 | 72 | 3 mocks ≥90% across diff variants |

---

## PART 4 — UI/UX MILESTONES (UX-M01 → UX-M21)

### Design system

```
Color palette (VSCode Dark+ + Dracula accents):
  --bg-0:        #0d1117   (page bg deepest)
  --bg-1:        #161b22   (panel bg)
  --bg-2:        #1f2937   (elevated)
  --bg-3:        #2d333b   (active)
  --border-1:    #30363d   --border-2: #484f58
  --text-0:      #e6edf3   --text-1: #8b949e   --text-2: #6e7681
  --accent-cyan: #79c0ff   (keywords)
  --accent-pink: #ff7b72   (control flow)
  --accent-grn:  #7ee787   (strings, success)
  --accent-yel:  #d2a8ff   (function names)
  --accent-org:  #ffa657   (numbers, warnings)
  --state-ok:    #3fb950   (correct, pass)
  --state-err:   #f85149   (wrong, fail)
  --state-warn:  #d29922   (caution)
  --state-info:  #58a6ff   (info)
  --brace-d0:    #ffd700  --brace-d1: #da70d6  --brace-d2: #87cefa  (depth-colored)

Typography:
  --font-mono: "JetBrains Mono" / "Fira Code" / monospace
  Sizes: code 14px / prompt 15px / h3 16px / h2 18px / h1 22px
  Line-height: 1.55 code / 1.45 ui

Spacing: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 (4px grid)
Layout: desktop-first 1280px ideal, fluid to 1024px. Mobile = OUT OF SCOPE.
Animation: 80-150ms ease-out on opacity/transform/border. NO layout animation. Reduced-motion respected.
```

### Milestone Table

Time columns removed per RULE 3.

| ID | Name | Builds |
|---|---|---|
| UX-M01 | Design tokens + Tailwind v4 theme | theme.css, palette CSS vars, focus ring, scrollbar |
| UX-M02 | Layout primitives + AppShell | AppShell (titlebar+sidebar+main+statusbar), Panel, Splitter |
| UX-M03 | Home / Dashboard screen | 4-column grid, stat tiles, today's queue, weakness file, mock entry |
| UX-M04 | Track screen (per Q1-Q4) | 2-pane: atom DAG (left) + drill list (right), progress ring |
| UX-M05 | CodeEditor primitive | Monospace, line numbers, syntax highlight cpp, brace match, depth color |
| UX-M06 | VariablesPanel primitive | Watch-table grid, inline edit, add/remove/reorder cells |
| UX-M07 | TerminalPanel primitive | Simulated stdout (cout), stdin (cin), exit code |
| UX-M08 | TraceCard screen | 3-pane code editor: editor + variables + terminal + step controls |
| UX-M09 | TemplateRecallCard screen | 3-stage progressive reveal: outline → skeleton → full |
| UX-M10 | StructWriteCard / FunctionWriteCard / MainWriteCard | IDE-feel + canonical-validator overlay + lints |
| UX-M11 | EntityMatrixCard + AlgorithmMatrixCard | Cell-grid recall, fixed headers, fill-in + reveal modes |
| UX-M12 | SpeedDrillCard screen | Single prompt, code editor, Submit button (no timer / no urgency colors) |
| UX-M13 | AdversarialMockCard / FaultInjectionCard | Code-with-bug editor, "find fault" inline marker |
| UX-M14 | ConfidenceCalibrationCard | 5-button (Guess/Hunch/Likely/Confident/Certain), Brier feedback |
| UX-M15 | DAGRetryCard + DeltaCard + VariantGenCard | Retry flow with prereq atoms surfaced |
| UX-M16 | Mock Q1-Q4 mode | Full-screen exam, sequential Q1-Q4 (no timer), autosave on tab switch, Esc to abandon |
| UX-M17 | Postmortem screen (diff) | Side-by-side (your code | canonical), per-line annotation |
| UX-M18 | Weakness file screen | Filter/search, atom→evidence, "drill now" button, decay heatmap |
| UX-M19 | Preflight check screen | T-minus checklist, atom-mastery green/yellow/red gauge |
| UX-M20 | Atom tree visualizer | DAG layout (dagre), color by mastery, click=detail, pan/zoom |
| UX-M21 | Settings + Stats + Onboarding + a11y pass | Shortcut sheet, first-run tour, ARIA, contrast audit |

### ASCII Mockups (key views)

**Home / Dashboard:**
```
┌─ cpp-t2 ────────────────────────────────────────  T-0d  ●streak 4 ─┐
│ ┌──┐                                                                │
│ │H │  ┌─ TODAY ─────────────┐ ┌─ MOCK ──────────┐ ┌─ MASTERY ─────┐│
│ │T │  │ 47 cards queued     │ │ Q1 ▰▰▰▰░  82%   │ │ Q1 ●●●●○  4/5 ││
│ │M │  │ ▰▰▰▰▰▰▰░░░  68%     │ │ Q2 ▰▰▰░░  61%   │ │ Q2 ●●●○○  3/5 ││
│ │W │  │ [Start session →]   │ │ Q3 ▰▰░░░  44%   │ │ Q3 ●●○○○  2/5 ││
│ │A │  └─────────────────────┘ │ Q4 ▰▰▰▰░  79%   │ │ Q4 ●●●●○  4/5 ││
│ │S │                          │ [Run mock]       │ └───────────────┘│
│ │⚙ │  ┌─ WEAKNESS FILE ─────────────────────────────────────────────┤
│ └──┘  │ atom_037  for-loop bound off-by-1   ▼0.31  3 fails  [drill]│
│       │ atom_112  struct member init order  ▼0.42  2 fails  [drill]│
│       └─────────────────────────────────────────────────────────────┘
│ home > today                              187 atoms · 4,600 cards   │
└────────────────────────────────────────────────────────────────────┘
```

**TraceCard (code editor):**
```
┌─ trace · atom_054 · for-loop sum ────────────────  conf: ····●  ─┐
│ ┌─ trace.cpp ─────────────┐ ┌─ VARIABLES ──────────────────────┐ │
│ │  1│ #include <iostream> │ │ name │ type │ value │ scope      │ │
│ │  2│ int main() {        │ │ i    │ int  │  3    │ local      │ │
│ │ ▶3│   int s=0;          │ │ s    │ int  │  6    │ local   ⌫  │ │
│ │  4│   for(int i=0;      │ │ + add row                        │ │
│ │  5│     i<5; i++)       │ └──────────────────────────────────┘ │
│ │  6│     s+=i;           │ ┌─ TERMINAL ───────────────────────┐ │
│ │  7│   cout << s;        │ │ $ ./a.out                        │ │
│ │  8│ }                   │ │ _                                │ │
│ └─────────────────────────┘ │                                  │ │
│  [⏮ reset] [⏵ step] [⏩ run]│ └──────────────────────────────────┘ │
│ output expected: 10                                                │
└────────────────────────────────────────────────────────────────────┘
```

**Mock Q1-Q4 (full-screen exam):**
```
┌─ MOCK · 90:00 total ────────────  ⏱ 67:42 remaining ─  Q2 / 4 ─┐
│ ┌─ Q2: Trace this for-loop and write final values ────────────┐ │
│ │  1│ int x=2, y=3;                                            │ │
│ │  2│ for(int k=0; k<3; k++){                                  │ │
│ │  3│   x = x + y;                                             │ │
│ │  4│   y = x - y;                                             │ │
│ │  5│ }                                                         │ │
│ └──────────────────────────────────────────────────────────────┘ │
│ ┌─ Your trace ───────────────────────┐ ┌─ Final ──────────────┐ │
│ │ iter│ x │ y │                      │ │ x =                  │ │
│ │   0 │   │   │                      │ │ y =                  │ │
│ │   1 │   │   │                      │ └──────────────────────┘ │
│ │   2 │   │   │                      │                          │
│ └────────────────────────────────────┘  [← Q1] [Q3 →] [submit]   │
└────────────────────────────────────────────────────────────────────┘
```

---

## PART 5 — QA / ACCEPTANCE MILESTONES (QA-M01 → QA-M34)

### Three-tier model
- **Tier 1 (per-card):** automated lint on every commit
- **Tier 2 (per-atom/track):** structural validation at gates
- **Tier 3 (system/student):** end-stage simulation

### Milestone Table (selected key ones — full list in companion file)

Time columns removed per RULE 3.

| ID | Validates | Method | Pass Criteria |
|---|---|---|---|
| **QA-M01** | Schema lint | Automated `lint:schema` | 100% schema-clean |
| **QA-M02** | Code-snippet syntactic lint | Brace/semicolon/blacklist | 0 mismatches, 0 off-scope |
| **QA-M03** | Canonical compile gate | clang-cpp-mini sandbox | 100% compile |
| **QA-M04** | Hand-trace value oracle | Run snippet, diff vs answer | 100% match |
| QA-M05 | Off-scope content scan | Token blacklist | 0 hits |
| QA-M06 | Word-memorize detector | Heuristic flag | 0 word-memorize |
| QA-M07 | Atom-ID + q-tag audit | Cross-ref vs registry | 100% valid |
| QA-M08 | Source-of-truth citation | Required field check | 100% non-empty |
| QA-M09 | Common-mistake link | Cross-ref | 100% valid |
| QA-M10 | Atom card-count + multi-modal | Group by atom | All ≥6 cards & ≥2 types |
| QA-M11 | Atom prereq DAG | Topological sort | 0 cycles |
| QA-M12 | Q-track coverage | Reverse index | 0 orphans |
| QA-M13 | Common-mistake immunization | Group by CM-tag | All CMs ≥3 cards |
| QA-M14 | Q-track 6-stage coverage | Group by track × stage | All tracks ≥1/stage |
| QA-M15 | Variation matrix | Cross-product audit | ≥80% cells filled |
| QA-M16 | Stage-gate threshold sim | 1000 random students | ≥80% reach S6 in budget |
| QA-M17 | Speed-target sanity | Timed sample | Median ≤ target × 1.5 |
| QA-M18 | Build size budget | CI bundle check | gzip ≤ 500KB |
| QA-M19 | Page-load perf | Lighthouse | TTI ≤ 2000ms p95 |
| QA-M20 | 1000-card runtime stress | Headless Playwright fuzz | 0 errors |
| QA-M21 | Counter math invariants | Property-based test | 1000 sims pass |
| QA-M22 | Deterministic shuffle | Snapshot test | 100 runs identical |
| QA-M23 | Stage-gate escape valves | Scripted stall sim | 100% stalls escape |
| **QA-M24** | **50-fuzz-student dry-run** | Monte-Carlo sim | ≥45/50 reach test-ready |
| QA-M25 | Burnout/fatigue scenario | Degraded recall sim | No total stall |
| QA-M26 | Confidence calibration | Sim trace audit | 100% rated-5+correct retired |
| QA-M27 | Pre-flight gate accuracy | Cross-validate sim | Pearson r ≥ 0.85 |
| **QA-M28** | **Mock canonical** | Sim student | ≥85% on 95% of sims |
| QA-M29 | Mock entity-swap | Sim with perturbation | ≥75% on 90% of sims |
| QA-M30 | Mock algorithm-swap | Sim | ≥70% on 85% of sims |
| QA-M31 | Mock adversarial | Sim worst-case | ≥65% on 80% of sims |
| QA-M32 | Mock paper completion | Sim run-through | Median completed ≥85% rubric (no time gate) |
| QA-M33 | PFG mapping audit | Hand audit × 2 reviewers | ≥95% agreement |
| **QA-M34** | **FINAL ACCEPTANCE GATE** | All prior GREEN | 100% of M01-M33 pass |

**Final acceptance bar (drives 98% confidence):**
1. 100% lint clean (M01-M09)
2. 100% structural (M10-M15)
3. ≥45/50 fuzz students reach test-ready (M24)
4. Mock canonical p50 ≥85%, adversarial p50 ≥65% (M28, M31)
5. Mock-paper completion median ≥85% rubric (M32; no time gate as of 2026-05-07)
6. Pre-flight predictor r ≥0.85 (M27)

---

## PART 6 — RISK / SCHEDULING / RELEASE MILESTONES (25)

### Coordination layer
| ID | Name | Trigger | Output |
|---|---|---|---|
| SCH-0 | Worktree Lockdown | T-21d | Per-level + per-component branches, CODEOWNERS routing |
| SCH-1 | Schema Freeze | After Phase-1 scaffolding | `data/schema/v2.json` locked. Field add = explicit RFC |
| SCH-2 | Style Bot | After SCH-1 | Prettier + biome + ESLint card-shape rules. CI-blocking |
| SCH-3 | Daily Integration Bus | Daily 22:00 | Auto-rebase orchestrator. Per-level → integration → main |
| SCH-4 | Author/Reviewer Pairing | Per phase-3 batch | 2-of-3 quorum tiebreak. Triple-disagree → human escalation |

### Risk mitigation
| ID | Name | Risk | Mitigation |
|---|---|---|---|
| RM-0 | v1 Quarantine | Break v1 → no May-14 fallback | `dist/v1/` checksummed, copied to `dist/v1-frozen/`. Read-only. |
| RM-1 | v1/v2 Toggle | Student needs runtime switch | URL flag `?deck=v2`. Default v1. Session-only persistence. |
| RM-2 | Phase-2 Stub Engines | Phase-1 slip blocks authors | Stub interfaces for all 8 new card types. Authors generate against contract. |
| RM-3 | Schema-validator gate | Inconsistent atom YAML | `npm run lint:v2` ≤0 errors required to merge |
| RM-4 | Bug-in-card detector | Wrong answer marked correct | Solver harness: WriteCard keyChecks vs canonical_example; TraceCard vs C++ ref compiler |
| RM-5 | Triage Queue | Stuck/burnout/off-scope/card-bug | 4 channels in `data/triage/`. SLA per channel. |
| RM-6 | Triage Escalation | Queue ignored | Re-author agent assigned. Failed-atom-only re-author. 24h SLA card-bug, 48h off-scope |
| RM-7 | QA Failure Burst Plan | 100+ bugs single QA pass | Targeted re-author swarm. Max 92 atom re-author capacity. Above → Option-3 fallback |
| RM-8 | Author Disagreement | Reviewer-author deadlock | Pijaca-decided list, max 5. Defer non-blockers to v2.1 |
| RM-9 | Capacity Degraded | <30 agents available | Drop AdversarialMock + FaultInjection. Ship Option-3.5 (~3,400 cards) |
| RM-10 | Critical-path lock | Slip = test-date miss | Off-CP work parked when CP slips ≥1 day |

### Pre-test gates
| ID | Name | When | Threshold |
|---|---|---|---|
| PRE-0 | Partial-deck Mode | T-14d | Banner: "Beta" |
| **PRE-1** | **Pre-flight v1 (May 13)** | T-1d before May 14 | ≥90% on 50-card lightning round → green-light |
| **PRE-2** | **Pre-flight v2 (May 20)** | T-1d before May 21 | ≥90%. Fail → roll back to v1; v2 deferred |
| PRE-3 | Test-Day Sim | T-3d before each attempt | Full Q1-Q4 sequential pass-through, untimed |

### Post-test
| ID | Name | When | Output |
|---|---|---|---|
| POST-0 | May-14 Postmortem | Within 24h of May 14 | Atom-level pass/fail JSON |
| POST-1 | May-21 Postmortem | Within 24h of May 21 | v1-trained vs v2-trained retention compare |
| POST-2 | Adaptive Re-injection | After POST-0/1 | Walk DAG backward from failed atoms. Rebuild for May 28 |

### Release
| ID | Name | When | Output |
|---|---|---|---|
| REL-0 | Versioning + CHANGELOG | Per milestone | Semver tag + CHANGELOG entry |
| REL-1 | Release Notes per Phase | Per phase close | RELEASES/v2.0.0-alpha.N.md + Home banner |
| **REL-2** | **v2 GA Cut + Deploy** | After PRE-2 passes | Build-freeze 12h. Tag `v2.0.0`. v1 fallback verified |

---

## DEPENDENCY ORDER (replaces Gantt — per RULE 3, no time axis)

Per RULE 3, time-based Gantts are invalid. Build order is dependency-driven, not date-driven. Phases proceed when prereqs satisfy acceptance criteria — whenever that is.

```
ORDER (not timeline):

PHASE 1 STARTS IMMEDIATELY (parallel)
├─ M0 toolchain
├─ M1 Ladle
├─ M2 schema lock (HARD GATE — unblocks authoring)
├─ M3 code editor primitives
├─ M4 atom model
├─ M5-M11 card components (parallel)
├─ M12 card registry (HARD GATE)
└─ UX-M01..UX-M21 design system + screens (parallel)

PHASE 2 STARTS WHEN M4 ATOM MODEL LANDS
├─ M13 exposure-frequency counter
├─ M14 multi-Q tagging
├─ M15 stage-gate + escape valves
├─ M16 daily-deck composer
├─ M17 adaptive deck
└─ M18 DAG-backward retry

PHASE 3 STARTS WHEN M12 REGISTRY + ENGINES LAND
├─ M20 Home screen
├─ M21 Track screens
├─ M22 Card screen shell + Mock
├─ M23 Postmortem + Weakness + Preflight
└─ M24 Atom tree visualizer

PHASE 4 STARTS WHEN M2 SCHEMA LOCKS
└─ Authoring waves (CA-M00..CA-M35) — parallel by level
   ├─ Wave 1: L0 + L1 (CA-M02-M14)
   ├─ Wave 2: L2 + L3 (CA-M15-M23)
   └─ Wave 3: L4 + L5 (CA-M24-M32)

PHASE 5 RUNS CONTINUOUSLY THROUGHOUT
├─ QA-M01..QA-M09 lint pipeline (every commit)
├─ QA-M10..QA-M15 structural (at gates)
├─ QA-M16..QA-M27 system tier (end-stage)
├─ QA-M28..QA-M32 mock paper sim (end-stage)
├─ M19 regression baseline (after M5-M18 stable)
├─ M29 performance pass
├─ M30 a11y pass
├─ M31 E2E mock flow
├─ M32 schema-drift audit
├─ QA-M34 FINAL ACCEPTANCE GATE
├─ M33 RC build
├─ M34 UAT
└─ REL-2 GA cut

STUDENT-SIDE GATES (these have date anchors per study window, NOT build-side)
├─ PRE-1 v1 pre-flight (T-1d before May 14)
├─ May 14 attempt 2 (uses v1 deck)
├─ POST-0 within 24h
├─ PRE-2 v2 pre-flight (T-1d before May 21)
├─ May 21 attempt 3 (uses v2 if QA-M34 passed)
├─ POST-1 within 24h
└─ May 28 final attempt if needed
```

**Build-side has NO calendar deadlines. Student-side has 3 attempt dates only.**

---

## CRITICAL PATH (dependency chain, no time)

```
M0 (toolchain) → M2 (schema lock) → M3 (VSCode primitives) →
M4 (atom model) → M5 (TemplateRecallCard) → M12 (registry) →
M16 (deck composer) → M19 (regression baseline) →
M25 (authoring pipeline) → M28 (Wave 3 cards) →
QA-M34 (final acceptance) → M33 (RC) → M34 (UAT) → REL-2 (GA)
```

Sequential dependency order. Each step waits for prereq acceptance criteria. No clock attached.

---

## PHASES (dependency-ordered, no time)

| Phase | Milestones |
|---|---|
| Phase 1 — Components | M0-M12, UX-M01-M21 (subset) |
| Phase 2 — Engines | M13-M18 |
| Phase 3 — UX shell | M20-M24 |
| Phase 4 — Authoring | M25-M28, CA-M00-M35 |
| Phase 5 — QA + Release | M29-M34, QA-M01-M34, REL-0/1/2 |
| **Total** | **176 milestones** |

---

## DEPENDENCY ORDER (high-level)

```
Toolchain (M0) → Schema (M2) [HARD GATE]
           ↓
   ┌───────┼─────────┐
   ↓       ↓         ↓
 Primitives  Atom    UX shell start
 (M3)        (M4)    (UX-M01,02)
   ↓         ↓         ↓
 Card components (M5-M12)
   ↓
 Card Registry (M12) [HARD GATE]
   ↓
   ┌─────────┴─────────┐
   ↓                   ↓
 Engines (M13-M18)   UX screens (M20-M24)
   ↓                   ↓
   └─────────┬─────────┘
             ↓
   Regression Baseline (M19) [HARD GATE]
             ↓
   Authoring Pipeline (M25) [HARD GATE]
             ↓
   ┌─────────┼─────────┬─────────┐
   ↓         ↓         ↓         ↓
 Wave 1     Wave 2    Wave 3    QA (concurrent)
 L0+L1      L2+L3     L4+L5     M01-M34
 (M26)      (M27)     (M28)
   ↓         ↓         ↓         ↓
   └─────────┴─────────┴─────────┘
             ↓
   Final QA (QA-M34) [HARD GATE]
             ↓
   RC Build (M33)
             ↓
   UAT + Bugfix (M34)
             ↓
   GA Cut (REL-2) [SHIP]
```

---

## RISK REGISTER (top 10)

| Risk | Likelihood | Impact | Milestone |
|---|---|---|---|
| 30 agents conflict | High | High | SCH-0, SCH-3 |
| v1 broken before May 14 | Medium | **Catastrophic** | RM-0, RM-1 |
| Phase-1 components slip | Medium | High | RM-2 (stub-first) |
| Card with wrong-answer-marked-correct | High | High | RM-3, RM-4 |
| Style drift across agents | High | Medium | SCH-2 |
| QA finds 100+ bugs | Medium | High | RM-7 |
| <30 agents available | Medium | Medium | RM-9 (degraded mode) |
| Student studies incomplete v2 | Medium | Medium | PRE-0 |
| Test-day pattern unseen | Medium | High | RM-5 + POST-2 |
| Burnout from 21-day grind | High | Medium | RM-5 burnout |

---

## DECISION POINTS

| # | Decision | Resolution |
|---|---|---|
| 1 | Approve Option 4 build start? | **Per RULE 1: time unbounded. Build proceeds at quality pace, not clock pace.** |
| 2 | 30 agents or degraded mode? | **Per RULE 2: spawn maximum specialists at every phase. 30 = floor, not ceiling.** |
| 3 | v1 toggle or v2 only? | Both, behind URL flag (RM-1) |
| 4 | Card-count cap if overrun? | **No cap. Quality decides count.** Could exceed 5,000 if needed. |
| 5 | Mock paper grading: deterministic only? | Yes, char-match + keyChecks |
| 6 | Build-time AI generation allowed? | **NO (per RULE 2).** All cards hand-authored by specialist agents. |
| 7 | Wall-clock 21 days a target? | **NO (per RULE 1).** Estimates are planning context only. Real ship date = when QA-M34 passes. |

---

## NEXT STEP — AUTHORIZE PHASE 1 START

**On authorization, spawn maximum-parallelism specialist swarm (per RULE 2):**

### Phase 1 component specialists (10+ agents in parallel)
- CC-1: code editor primitives (CodeMirror host, BraceMatcher, DebuggerPanel, TerminalOutput, DiffGutter)
- CC-2: TemplateRecallCard (3-stage)
- CC-3: StructWriteCard
- CC-4: FunctionWriteCard
- CC-5: MainWriteCard
- CC-6: TraceCard v2 (code editor style)
- CC-7: EntityMatrixCard + AlgorithmMatrixCard
- CC-8: SpeedDrillCard
- CC-9: AdversarialMockCard + FaultInjectionCard + DeltaCard
- CC-10: PreflightCheckCard + ConfidenceCalibrationCard + DAGRetryCard + TestDaySimCard + VariantGenCard

### Coordination specialists (concurrent)
- COORD-1: Worktree lockdown + schema freeze + style bot (SCH-0/1/2)
- COORD-2: v1 quarantine + v1/v2 toggle (RM-0/1)
- COORD-3: Stub engines for Phase-2 unblock (RM-2)

### Engine specialists (start when M4 atom model lands)
- EN-1: Exposure-frequency counter
- EN-2: Multi-Q tagging propagation
- EN-3: Stage-gate + 4 escape valves
- EN-4: Daily-deck composer
- EN-5: Adaptive deck (in-session)
- EN-6: DAG-backward retry

### UX specialists (concurrent with phase 1)
- UX-1: Design tokens + AppShell
- UX-2: Home + Track screens
- UX-3: Card screens + Mock + Postmortem + Weakness + Atom tree

### Authoring specialists (start when M2 schema locks)
- SA-1..SA-8: Skeleton authors (one per atom band)
- VE-1..VE-4: Variation expanders
- PR-1..PR-3: Peer reviewers
- QA-1..QA-2: QA approvers

### QA specialists (continuous from D2)
- QA-S-1: Lint pipeline (schema, code, off-scope, word-memorize, citation)
- QA-S-2: Solver harness + compile gate
- SIM-1: Monte-Carlo fuzz student engine
- SIM-2: Mock paper grader

**Total at peak: 30+ specialists in parallel.** Spawn more if independent tasks emerge.

**Per RULE 1: no end date. Build proceeds until QA-M34 passes.** Pre-test gates (May 14, May 21, May 28) are study-side anchors, not build-side deadlines.

---

## OUTPUT ARTIFACTS WHEN COMPLETE

```
cpp-t2/
├── data/
│   ├── schema/v2.json           ← schema lock
│   ├── cards-v2.json            ← 4,600 hand-authored cards
│   ├── atoms-v2.yml             ← 187 atoms with full DAG
│   ├── variants-v2.yml          ← 100 entities + 20 algos + 4 field-counts
│   ├── common-mistakes-v2.yml   ← 40 mistakes + immunization slots
│   ├── triage/                  ← 4 channel JSONs
│   └── postmortem/              ← per-attempt analysis
├── dist/
│   ├── v1-frozen/              ← May 14 fallback (checksummed)
│   └── v2/                     ← May 21 / May 28 build
├── src/
│   ├── components/             ← 18 card components (10 new + 8 refined)
│   ├── engines/                ← exposure-freq, multi-Q, adaptive-deck, DAG-retry
│   └── pages/                  ← Home, Track, Card, Mock, Postmortem, Weakness, AtomTree, Preflight
├── build/                      ← lint, acceptance, regression test scripts
├── RELEASES/                   ← v2.0.0-alpha.N.md per phase
└── CHANGELOG.md                ← append-only
```

---

**END OF MILESTONE PLAN — Awaiting authorization.**
