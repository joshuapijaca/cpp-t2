# AUDIT_UI_SCOPE_CREEP.md

Brutal scope-creep audit of `cpp-t2/src-v2/`. Date: 2026-05-07 (test day).
User vision (verbatim): "minimalist setup with all the Ls modules there that I can click and go through everything linearly". "Just the old app design UI/UX but just focused on test 2 questions and fundamentals."

## A. v1 baseline (what user actually wanted)

`cpp-t2/src/App.tsx` (49 lines) and `cpp-t2/src/pages/Home.tsx` (132 lines):

- **2 routes** total: `home` and `sequence` (+ 2 dev-only preview slots).
- **Home surfaces (5 NEEDED):** title, jump-to-card-N input, 19-level grid picker, RDS badge on L9 cell, hint text.
- **Sequence surface:** linear card walker (next-on-pass, retry-on-fail), `back home` button, header `level · atom · type`.
- **No** dashboards, mocks, weakness, atoms, preflight, postmortem, mastery, streak, countdown, confidence, DAG, heatmap.

## B. v2 surface inventory + verdict

### B1. Home.tsx (UX-M03 dashboard) — 5 surfaces, 5 OFF-SPEC

| Surface | Verdict | Why |
|---|---|---|
| TODAY tile (queued count + progress + Start button) | **REMOVE** | Daily-queue/SRS framing user explicitly didn't ask for |
| MOCK tile (Q1-Q4 BlockBar familiarity %) | **REMOVE** | Per-Q gauges = mock-paper framing, not linear |
| MASTERY tile (●●●○○ stage dots, S1..S6) | **REMOVE** | Stage gating user never asked for; gamification |
| WEAKNESS FILE tile (severity, fail-count, drill button) | **REMOVE** | Weakness-tracker = surveillance feature; gamification |
| Footer countdown ("T-Nd / X days to test") | **REMOVE** | Test-day pressure, not asked |

**Missing from v2 Home:** the 19-level grid picker. The literal thing user asked for is gone.

### B2. Track.tsx (UX-M04) — 8 surfaces, 8 OFF-SPEC

QTabBar (Q1-Q4) · familiarity ProgressRing (SVG arc) · StageBar (S1..S6 lock/✓/▶) · AtomDAG left pane · DrillList right pane · "Skip stage with cost warning" button · SkipDialog (modal) · keyboard chord 1-4 to switch Q. **REMOVE entire page** — Q-track segmentation, stages, DAG, skip-with-cost are all over-engineering.

### B3. Session.tsx — 7 surfaces, 4 OFF-SPEC

| Surface | Verdict |
|---|---|
| Header `DRILL · N/total · Q · atomId · type` | **KEEP** (matches v1 header) |
| Linear progress bar | **KEEP** |
| CardRenderer (current card) | **KEEP** |
| Pause button | **KEEP** (replaces v1 "back home") |
| FamiliarityGauge in header | **REMOVE** — not in v1 |
| `seen · correct` counter footer | **REMOVE** — gamification |
| Skip card button (separate from retry) | **REMOVE** — v1 had retry-on-fail, not skip; this lets students bypass the linear cure |

### B4. Mock.tsx (UX-M16) — 7 surfaces, 7 OFF-SPEC

Full-screen exam mode · Q1-Q4 tab strip · Mock paper picker dropdown · "Submit all" button · per-Q autosave · Esc = abandon dialog · keyboard `Tab 1..4` jump. **REMOVE entire page.** User asked for fundamentals + linear walk — not full mock-paper simulator. v1 had no mock route.

### B5. Postmortem.tsx (UX-M17) — 6 surfaces, 6 OFF-SPEC

Score header (`75/100`) · Q1-Q4 result tabs · 3-column side-by-side diff (your code | canonical | annotations) · Per-line annotation column with "→ add to weakness" · "Drill failed atoms" CTA · "Done" button. **REMOVE entire page.** Postmortem only exists because Mock exists; both go.

### B6. AtomTree.tsx (UX-M20) — 6 surfaces, 6 OFF-SPEC

SVG DAG with Sugiyama layout · familiarity-color nodes · pan (Space+drag) · scroll-wheel zoom · Q-track filter chips · click-to-drill drawer. **REMOVE entire page.** User never asked to see the prereq DAG.

### B7. Weakness.tsx (UX-M19) — 5 surfaces, 5 OFF-SPEC

90-day decay heatmap (▓▓░░ blocks) · sort buttons (recent / low-famil / high-freq) · text filter · entry table (atom · stem · fails · last-fail · drill) · per-row drill arrow. **REMOVE entire page.** Weakness tracking = surveillance feature.

### B8. Preflight.tsx (UX-M19) — 4 surfaces, 4 OFF-SPEC

3-phase flow (brief → drill → done) · 50-card lightning round · per-atom red/yellow/green dots · final verdict ("you're ready" vs "drill these atoms"). **REMOVE entire page.** Today IS test day — preflight has no purpose, and was never asked for.

### B9. AppShell.tsx (chrome) — 7 surfaces, 6 OFF-SPEC

| Surface | Verdict |
|---|---|
| Sidebar 7-icon nav (Home/Track/Mock/Weakness/Atoms/Stats/Settings) | **REMOVE** all but Home |
| Breadcrumb `cpp-t2 › Section › ...` | **REMOVE** — over-chromed |
| `g h / g t / g m / g w` chord shortcuts | **REMOVE** |
| Cmd/Ctrl+K command palette | **REMOVE** (stub anyway) |
| Brand `++` square | **REMOVE** |
| Statusbar atom-count + **streak** counter | **REMOVE** — streak is gamification |
| Title bar | KEEP (replace with v1 minimal header) |

### B10. Card-component scope creep — 14 OFF-SPEC of 23

v1 = 10 card types. v2 added **13 new types**, of which **9 are gamification/over-engineering**:
ConfidenceCalibrationCard (Guess/Hunch/Likely/Confident/Certain + Brier) · AdversarialMockCard · TestDaySimCard · PreflightCheckCard · DAGRetryCard · DeltaCard · FaultInjectionCard · PostmortemCard · SpeedDrillCard · VariantGenCard. Plus **4 mock-paper specific writers** (StructWriteCard, FunctionWriteCard, MainWriteCard, TemplateRecallCard) needed only because Mock exists. **REMOVE all 14.** Keep the 9 v1 mappable types only.

## C. File-deletion candidates

`pages/Track.tsx`, `pages/Mock.tsx`, `pages/Postmortem.tsx`, `pages/AtomTree.tsx`, `pages/Weakness.tsx`, `pages/Preflight.tsx` (+ all stories). 6 whole pages.

## D. Component-deletion candidates

14 card files listed in B10 + `AppShell.tsx` (replace with minimal header).

## E. Honest count

v2 surfaces enumerated: Home 5 + Track 8 + Session 7 + Mock 7 + Postmortem 6 + AtomTree 6 + Weakness 5 + Preflight 4 + AppShell 7 + Card-types 23 = **78**.

Of these:
- KEEP: Session header / progress / card / pause + AppShell title bar + 9 v1 card types = **13**
- OFF-SPEC: 65 (5+8+3+7+6+6+5+4+6 surfaces + 14 card types + 1 missing-from-v2 level grid)

**Of the 78 UI surfaces in v2, 65 are off-spec.**
