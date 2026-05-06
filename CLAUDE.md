# cpp-t2 — Project Guide for Claude

**Project name (display): C++T2.** Folder: `cpp-t2/` (filesystem-safe; `+` breaks npm/Vite tooling).

**You are working on a from-scratch C++ learning app. The user is preparing for SIT102 Test 2 (Deakin, 2026 T1) starting from zero C++ knowledge.**

## Read-First Order (Mandatory)

1. **[MISSION.md](MISSION.md)** — non-negotiables. Do not deviate.
2. **[ANTIPATTERNS.md](ANTIPATTERNS.md)** — banned AI shortcut behaviors. Read before any planning move.
3. **[docs/13_milestones.md](docs/13_milestones.md)** — **M0–M17 ship-state plan.** M0–M15 ✅ shipped. M16 (generate + interleave SEE) and M17 (final polish) pending. Current milestone here. No off-milestone work.
4. **[docs/07_master_plan.md](docs/07_master_plan.md)** — canonical DO reference. 187 atoms, 18 levels, 1,159 DO cards, prereq DAG.
5. **★ [docs/14_see_cards_master_plan.md](docs/14_see_cards_master_plan.md) ★** — **canonical SEE reference.** Top-down + a posteriori + mirror-neuron half. 3 new card types (`demo`, `decompose`, `walkthrough`). +~892 cards. Per-atom interleave with DO.
6. **[docs/08_outline_spec.md](docs/08_outline_spec.md)** — atom YAML schema. AI-anchor.
7. **[docs/11_build_outline.md](docs/11_build_outline.md)** — tech stack + build pipeline.
8. **[docs/12_ux_ui_design.md](docs/12_ux_ui_design.md)** — minimalist dark UX.
9. **[CHANGELOG.md](CHANGELOG.md)** — decisions made + when + why. Append-only.
10. **[CONTRIBUTING.md](CONTRIBUTING.md)** — how to propose updates without drift.

## Project Identity

| Field | Value |
|-------|-------|
| Display name | **C++T2** |
| Folder | `cpp-t2/` |
| npm package name | `cpp-t2` |
| Goal | 0 prior C++ → ace 4-question SIT102 Test 2 |
| Student budget | 56 hours (2 weeks × 4 hr/day) |
| Test date | 2026-05-07 (verify before assuming) |
| Architecture | Vite 5 + React 19 + TS 5 + Tailwind v4 |
| State | Session-only (no localStorage, no backend) |
| Grading | Offline char-match (no API) |
| Runtime AI calls | **Zero** |
| Card count (shipped) | 2,047 entries — demo 682 / memorize 910 / decompose 187 / write 182 / trace 52 / walkthrough 19 / mcq 15 |
| Atoms | 187 across 18 levels (-1 to 17) |
| Authoring | Outline-anchored AI scribe (build-time only) |

## Status (2026-05-05)

| Phase | State |
|-------|-------|
| Source-of-truth | Locked (14 docs in `docs/`) |
| Extraction | All 18 levels (L-1 to L17) ✅ |
| Outlines | All 187 atoms locked ✅ |
| DO cards (M0–M11) | ✅ shipped — 1,159 cards live at `localhost:5173` |
| SEE components (M12–M14) | ✅ DemoCard / DecomposeCard / WalkthroughCard built + preview routes |
| SEE outline content (M15) | ✅ 187 see_demo + 187 see_decompose + 19 walkthroughs + 40 worked examples authored, lint clean |
| SEE generation + interleave (M16) | ✅ 470 SEE cards generated + interleaved → 1,629 total |
| Acceptance + final polish (M17) | ✅ all gates pass, dist/ clean |
| SEE gap-fill (M18–M22) | ✅ Q-context + worked-example redistribution + read-predict expansion + decompose authoring + zero-snippet elimination → 2,047 total |
| Production build | ✅ `npm run build` → 146 KB gzip JS (post-M22) |
| Home picker + retry button + 3 SEE preview buttons | ✅ |

## File Layout

```
cpp-t2/
├── CLAUDE.md            ← you are here
├── MISSION.md           ← non-negotiables
├── ANTIPATTERNS.md      ← banned AI behaviors
├── CHANGELOG.md         ← append-only decision log
├── CONTRIBUTING.md      ← update protocol
├── docs/
│   ├── 00_README.md     ← doc index
│   ├── 01_audit_it_elo.md
│   ├── 02_audit_t1_app.md
│   ├── 03_mastery_state_t2.md
│   ├── 04_new_app_design.md
│   ├── 05_audit_three_apps.md
│   ├── 06_audit_it_elo_t1_apk.md
│   ├── 07_master_plan.md          ★ canonical
│   ├── 08_outline_spec.md         (atom YAML schema)
│   ├── 09_extraction_protocol.md  (PFG → extraction folder)
│   ├── 10_prereq_ordering_algorithm.md (topo sort + priority)
│   ├── 11_build_outline.md        (tech stack + pipeline)
│   └── 12_ux_ui_design.md         (minimalist dark)
├── outlines/
│   ├── L-1/ … L17/                ← 187 atom outlines (DO + SEE fields, all locked)
│   ├── walkthroughs/L-1.yml … L17.yml  ← 19 level walkthroughs (M15)
│   └── worked_examples/Q1.yml … Q4.yml ← 48 worked examples (M15+M19, 18+10+10+10 per Q)
├── data/
│   ├── cards.json                 ← 1,159 DO cards (M16 will append SEE -> ~2,051)
│   ├── m15-why-one-liners.yml     ← 187 hand-authored whyOneLine strings
│   └── m15-foundation-snippets.yml ← 114 hand-authored snippets for empty canonical_example
├── extraction/
│   ├── L09_RDS_passbyref/         ← PFG quotes + code + notes
│   └── (other levels)
└── src/
    ├── components/                ← MemorizeCard, MCQCard, TraceCard, WriteCard,
    │                                DemoCard (M12), DecomposeCard (M13), WalkthroughCard (M14)
    ├── data/                      ← M12/M13/M14 preview decks (5/5/3 hardcoded cards)
    ├── pages/                     ← Home (with 3 SEE preview buttons), Sequence
    └── lib/                       ← levels, grading
```

## Sibling Layout

```
advanced learning theory/
├── cpp-t2/                ← active project (this folder)
├── _legacy_apps/          ← frozen reference; do not modify
│   ├── README.md
│   ├── it-elo/            ← old IT-ELO; PFG content readable here
│   │   └── LEGACY.md
│   ├── it-elo-test1-extracted/
│   └── apk_audits/
│       ├── sprint/
│       ├── sprintlearn/
│       ├── cram-ai/
│       └── it-elo-t1/
├── ideas/                  ← brainstorm + philosophy
├── documents/              ← learning algorithm blueprints
└── (user content folders)
```

## PFG Content Path (after archive)

Old: `it-elo/src/data/pfg-content/...`
**New: `_legacy_apps/it-elo/src/data/pfg-content/...`**

All extraction notes + scripts must use the new path. The `_legacy_apps/` content is read-only audit material per [`_legacy_apps/README.md`](../_legacy_apps/README.md).

## Behavior Rules for Claude

1. **Default to [docs/07_master_plan.md](docs/07_master_plan.md) as truth.** When ambiguity arises, defer to it. Only deviate with user authorization + CHANGELOG entry.
2. **One milestone at a time.** Per [docs/13_milestones.md](docs/13_milestones.md). No combining, no skipping, no off-milestone work. Per ANTIPATTERNS #16.
3. **Halt at every milestone boundary.** Wait for explicit user "go M-N" before starting next milestone.
4. **No content reuse from `_legacy_apps/it-elo/`.** Audit-only references for patterns. Per ANTIPATTERNS #6.
5. **No timeframe estimates** unless user asks. User explicitly forbids.
6. **No build until user authorizes M1.** Planning + outline artifacts only at M0.
7. **No AI runtime calls in any code emitted.** Build-time generation OK (per ANTIPATTERNS #5 narrowed); runtime API banned.
8. **No save state, no SRS, no mastery gating** in any proposal.
9. **≤7 words per memorize-card fact** (Miller's law). Lint at build time.
10. **Strict prereq order honored.** Atom dependencies must resolve to earlier-or-same level. No skipping.
11. **RDS (R-1…R-5) front-loaded at Level 9.** Do not relocate without user authorization.
12. **Outline-anchored AI authoring only.** Per ANTIPATTERNS #5 + [docs/08_outline_spec.md](docs/08_outline_spec.md).
13. **Check ANTIPATTERNS.md before any tempting "shortcut."** 16 banned patterns enumerated.

## Current Milestone

| Milestone | State |
|-----------|-------|
| M0 Spec Lock | ✅ |
| M1 Scaffold + MemorizeCard | ✅ |
| M2 AI Pipeline + L9 Cards | ✅ |
| M3 RDS Drill MVP (pipeline v1 lock) | ✅ |
| M4 TraceCard + L13 | ✅ |
| M5 Q1 sims | ✅ |
| M6 WriteCard + L14 (Q2) | ✅ |
| M7 L10/L12/L15 (Q3) | ✅ |
| M8 L00/L01/L03/L16 (Q4) | ✅ |
| M9 Foundation backfill + MCQCard | ✅ |
| M10 Mock exams (L17) | ✅ |
| M11 Polish + deploy | ✅ |
| **— DO half complete — 1,159 cards shipped —** | |
| M12 SEE schema + DemoCard | ✅ shipped 2026-05-05 |
| M13 DecomposeCard | ✅ shipped 2026-05-05 |
| M14 WalkthroughCard | ✅ shipped 2026-05-05 |
| **— SEE components complete — 7 card types live —** | |
| M15 Author SEE outline fields (187 atoms + 19 walkthroughs + 40 worked examples) | ✅ shipped 2026-05-05 |
| M16 Generate SEE cards + interleave | ✅ shipped 2026-05-05 — 470 SEE + 1,159 DO = 1,629 |
| M17 Acceptance + final polish | ✅ shipped 2026-05-05 — all gates pass, 137 KB gzip |
| **— SEE v1 complete —** | |
| M18 Q-context SEE cards | ✅ shipped 2026-05-05 — 240 Q-context demo cards |
| M19 Redistribute worked examples | ✅ shipped 2026-05-05 — 48 examples across 39 Q-skill atoms |
| M20 Expand read-predict | ✅ shipped 2026-05-05 — 187 read-predict cards (was 61) |
| M21 Purpose-author decompose snippets | ✅ shipped 2026-05-05 — 103 new snippets, 175→187 authored |
| M22 P-atom + ME-atom mini-SEE | ✅ shipped 2026-05-05 — 12 zero-snippet atoms eliminated |
| **— ALL 23 MILESTONES COMPLETE — PROJECT SHIPPED —** | |

**Post-M22 maintenance mode.** No further milestones planned. Bug-fix-only unless user authorizes new work.

**Live URL**: `localhost:5173` (run `npm run dev`).

**M12-M15 build scripts (already written, DO NOT re-run unless re-authoring)**:
- `build/scaffold-see-fields.ts` — auto-derive SEE blocks into outlines (one-shot, idempotent)
- `build/backfill-empty-see-snippets.ts` — fallback for atoms without canonical_example
- `build/apply-m15-content.ts` — merge data/m15-*.yml into outlines (idempotent)
- `build/write-walkthroughs.ts` — emit 19 walkthrough YAML files
- `build/write-worked-examples.ts` — emit 40 worked-example YAML files
- `build/lint-see-outlines.ts` — `npm run lint:see` -> 0 errors as of 2026-05-05
- `build/normalize-atom-ids.ts` — fixed 13 R-3 -> R-03 mismatches; idempotent

**SEE component preview routes** (Home.tsx buttons):
- `M12 demo preview (5 cards)` — `src/data/m12-demo-preview.ts`
- `M13 decompose preview (5 cards)` — `src/data/m13-decompose-preview.ts`
- `M14 walkthrough preview (3 cards)` — `src/data/m14-walkthrough-preview.ts`

**Latest UX additions** (post-M11, through M14):
- Home page with 19-level picker + jump-to-card-N input
- Retry button (replays current card)
- Card header shows level title (e.g. `L9 · Pass-by-reference (RDS) · R-03 · demo`)
- Memorize cards have `context` subtitle (= outline.fact) above bold variant fact
- All ASCII text + ligature-disabled CSS
- Live exact-match grading on memorize (no Enter needed)
- DemoCard: code panel + accent highlights + "why" + "used in" badges + space-to-advance
- DecomposeCard: multi-select 1-N keys + enter submit + set-equality grader + retry-once
- WalkthroughCard: full code panel + active-line accent + reveal-on-space steps + atom-ID badges

Always check [docs/13_milestones.md](docs/13_milestones.md) Quick-Reference Card for current milestone before any move.
