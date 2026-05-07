# AUDIT_MASTER_FIX_LIST.md

**Date:** 2026-05-07 (test day, eve-of-test triage)
**Auditor mode:** master synthesis, RULE 4 (brutal honesty)
**Sub-audits read:** `AUDIT_UI_SCOPE_CREEP.md`, `AUDIT_ENGINE_SCOPE_CREEP.md`.
**Sub-audits MISSING at synthesis time:** `AUDIT_CARD_SCOPE_CREEP.md`, `AUDIT_DOC_DRIFT.md`. Card-type signal is reconstructed from UI audit §B10 + on-disk card-file tally; doc drift is reconstructed from CLAUDE.md (canonical v1 = 10 types, "post-M22 maintenance mode") vs SCHEMA.md (v2 = 23 types, 4,600-card target). Confidence is one tier lower than it would be with all four.

---

## TL;DR

**Of 78 v2 UI surfaces, 65 are off-spec (83%). Of 7 engines, 6 are off-spec. Of 23 card types, 14 are off-spec. v1 (the shipped 1,775-card linear-walker) is what the user asked for.**

The fastest correct move is **roll back to v1's `src/` skeleton**, port over the 4 v2-essential card components and the exposure-counter, and delete `src-v2/` plus everything downstream of `daily-deck-composer` and `stage-gate`. Below is the surgical version.

---

## 1. DELETE — files to remove entirely

### 1a. v2 pages (6 of 8 pages, 100% of off-spec routes)
| Path | Reason |
|---|---|
| `src-v2/pages/Track.tsx` (+ `__stories__/`) | Q-tab segmentation, ProgressRing, StageBar, AtomDAG, skip-with-cost — none asked for |
| `src-v2/pages/Mock.tsx` | Mock simulator — user asked for fundamentals + linear walk |
| `src-v2/pages/Postmortem.tsx` | Only exists because Mock exists |
| `src-v2/pages/AtomTree.tsx` | SVG DAG visualizer — never asked for |
| `src-v2/pages/Weakness.tsx` | 90-day decay heatmap = surveillance/gamification |
| `src-v2/pages/Preflight.tsx` | Today **is** test day; the meta-test is dead weight |

### 1b. v2 engines (6 of 7)
| Path | Reason |
|---|---|
| `src-v2/engines/multi-q-propagation.ts` | Q-track linkage; user said modules are independent |
| `src-v2/engines/stage-gate.ts` | 6-stage ladder + 4 escape valves; linear walk needs no gate |
| `src-v2/engines/failure-recovery.ts` | 5-band action map; replaced by retry button. Already dead in production |
| `src-v2/engines/daily-deck-composer.ts` | 600 LoC SRS-flavored bandit; OPPOSITE of linear walk |
| `src-v2/engines/adaptive-deck.ts` | Mid-session DeltaCard injection; non-deterministic. Dead |
| `src-v2/engines/dag-backward-retry.ts` | BFS-walks prereq DAG to inject prereqs; not asked for. Dead |

### 1c. v2 card components (14 of 23)
| Path | Reason |
|---|---|
| `src-v2/components/cards/AdversarialMockCard.tsx` | Mock-only |
| `src-v2/components/cards/FaultInjectionCard.tsx` | Out-of-scope card type |
| `src-v2/components/cards/PreflightCheckCard.tsx` | Preflight-only |
| `src-v2/components/cards/ConfidenceCalibrationCard.tsx` | Brier-score gamification |
| `src-v2/components/cards/DAGRetryCard.tsx` | DAG retry; not asked for |
| `src-v2/components/cards/DeltaCard.tsx` | Adaptive-deck injection |
| `src-v2/components/cards/TestDaySimCard.tsx` | Mock-only |
| `src-v2/components/cards/VariantGenCard.tsx` | Variant generation; over-engineered |
| `src-v2/components/cards/PostmortemCard.tsx` | Postmortem-only |
| `src-v2/components/cards/SpeedDrillCard.tsx` | Timer-based; user said no timers |
| `src-v2/components/cards/EntityMatrixCard.tsx` | Subsumed by AlgorithmMatrixCard or v1 matrix |
| `src-v2/components/cards/AlgorithmMatrixCard.tsx`* | Keep ONE matrix card; this duplicates v1 matrix component |

(*Borderline: keep one of EntityMatrixCard / AlgorithmMatrixCard / v1 matrix — pick the v1 one.)

### 1d. AppShell + chrome
- `src-v2/components/primitives/AppShell.tsx` — sidebar nav, breadcrumb, chord shortcuts, command palette stub, brand square, statusbar with streak counter. **Replace with 30-line minimal title bar.**

### 1e. Tests / stories for deleted code
- All `__tests__/*` files under `src-v2/engines/` for the 6 deleted engines.
- All `__stories__/` under deleted pages.

**Estimated delete count: ~45 source files + ~25 test/story files = ~70 files deleted.**

---

## 2. STRIP — features to remove from kept files

| File | Strip |
|---|---|
| `src-v2/pages/Home.tsx` | Strip TODAY tile, MOCK tile, MASTERY tile, WEAKNESS FILE tile, footer countdown. **Replace whole body with a 19-level (or 6-module) grid picker like v1's Home.tsx.** |
| `src-v2/pages/Session.tsx` | Strip FamiliarityGauge in header (move to bottom small line), `seen·correct` counter footer, Skip card button. Keep Header, progress bar, CardRenderer, Pause→Home button. |
| `src-v2/lib/session-store.tsx` | Strip `useTodayDeck`, `useStageProgress`, `setStageProgressAction`, `useWeaknessFile`, `drillRequest` cardIds/atomIds plumbing. Keep `recordResultAction` → exposure-counter. |
| `src-v2/App.tsx` | Strip 6 of 8 routes (track, mock, postmortem, atoms, weakness, preflight). Keep only `/` (home) and `/session/:level`. Strip popstate handlers for deleted routes. |
| `src-v2/engines/exposure-counter.ts` | Keep counters + atom familiarity %. Strip Q-track roll-up, FAMILIAR retirement RETIRE_WINDOW=3, status state machine surfacing. (The internals can stay; just don't expose them.) |

---

## 3. REPLACE — pages to rebuild minimal

### Home (replace entirely)
Replace `src-v2/pages/Home.tsx` body with a 6-module picker:

```
┌─ cpp-t2 ──────────────────────────────────┐
│ L0  Foundation       [00/517]  [Continue→]│
│ L1  Q1 Hand-execute  [00/772]  [Continue→]│
│ L2  Q2 Struct        [00/269]  [Continue→]│
│ L3  Q3 Read fn       [00/417]  [Continue→]│
│ L4  Q4 Main          [00/396]  [Continue→]│
│ L5  Mock papers      [00/176]  [Continue→]│
└────────────────────────────────────────────┘
```

(Counts shown are placeholders — wire to deck length per level. Click → `/session/L0`.)

### Session (rebuild minimal)
Replace `src-v2/pages/Session.tsx` body with a linear walker:

```
┌─ L1 · F-22b · TraceCard · 47/772 ─────────┐
│ [card content rendered]                    │
│                                             │
│ [Submit]  [Retry]  [Skip]  [← Back]        │
│                                             │
│ Familiarity (this atom): ████░░ 67%        │
└─────────────────────────────────────────────┘
```

Logic:
- Load `cards.filter(c => c.level === levelFromUrl).sort(byBuildTimeOrder)` — no daily-deck-composer.
- `position = 0..cards.length - 1`.
- On pass: `position++`; on fail: stay (Retry replays).
- On position === cards.length: navigate back to Home.
- Familiarity gauge reads exposure-counter `getAtomFamiliarity(currentCard.atomId)`.

### (Optional) Settings page
Single field: "Reset progress." Ship only if time. Otherwise drop.

---

## 4. KEEP — what actually matches user vision

| Path | Why |
|---|---|
| `src-v2/components/primitives/CardRenderer.tsx` | Discriminator-on-`type` switch — needed |
| `src-v2/engines/exposure-counter.ts` | Powers the 0→100 atom familiarity gauge user explicitly asked for |
| `src-v2/components/cards/TraceCard.tsx` | v1 keeps this — interactive memory boxes |
| `src-v2/components/cards/MCQCard.tsx` | v1 keeps |
| `src-v2/components/cards/ClozeCard.tsx` | v1 keeps |
| `src-v2/components/cards/DemoCard.tsx` | v1 keeps |
| `src-v2/components/cards/DecomposeCard.tsx` | v1 keeps |
| `src-v2/components/cards/WalkthroughCard.tsx` | v1 keeps |
| `src-v2/components/cards/ProceduralCard.tsx` | v1 keeps |
| `src-v2/components/cards/StructWriteCard.tsx` | v2-essential (Q2 specific) |
| `src-v2/components/cards/FunctionWriteCard.tsx` | v2-essential (Q3 specific) |
| `src-v2/components/cards/MainWriteCard.tsx` | v2-essential (Q4 specific) |
| `src-v2/components/cards/TemplateRecallCard.tsx` | v2-essential (1-template Q-recall) |
| `data/v2/atoms/**` (126 files) | Atom DAG + metadata used at build time. Keep |
| `data/v2/cards/**` (selected — see §5) | Many YAMLs are kept; some need migration |

**Keep count: ~14 components + 1 engine + 1 renderer + 1 store (slimmed) = ~17 source files.**

---

## 5. MIGRATE — card YAMLs referencing deleted card types

### Card type tally (on-disk v2 YAMLs)
| Type prefix | Count | Verdict |
|---|---:|---|
| mcq | 346 | KEEP |
| trace | 337 | KEEP |
| decompose | 178 | KEEP |
| cloze | 114 | KEEP |
| write (StructWrite/FunctionWrite/MainWrite/Procedural) | ~113 + 51 proc + 24 procedural + others | KEEP |
| demo | 59 | KEEP |
| walkthrough | 35 | KEEP |
| spot/spoterror | 70 | **MIGRATE** → re-tag as `mcq` (spot-the-error MCQ is what it always was) |
| faultinj | 34 | **DELETE** (FaultInjectionCard removed; unsalvageable) |
| scaffold-fillblank | 20 | **MIGRATE** → re-tag as `cloze` |
| typeline / fulltype / orderlines / order | ~40 | **MIGRATE** → re-tag as `procedural` (typing/order drills) or `cloze` |
| speed | 8 | **DELETE** (SpeedDrillCard removed; timed) |
| mock | 6 + 5 mocks-laptops etc. | **DELETE** (mock-only) |
| timed / v20-timed / prac-timed | ~14 | **DELETE** (timed = SpeedDrillCard) |
| preflightcheck | 4 (in compose names) | **MIGRATE** → re-tag as `mcq` |
| The very long one-off `L2-S4-compose-NN-*.yml`, `novel-NN-*.yml`, `coldstart-NN-*.yml`, etc. | ~700 | KEEP if they're StructWrite/FunctionWrite/MainWrite payloads (most are); inspect on a per-file basis at migration time |

### Migration plan
1. Lint pass: `data/v2/cards/**/*.yml` → group by `type` field (not filename).
2. Re-tag `spoterror`/`scaffold-fillblank`/`preflightcheck` payloads to surviving types.
3. Delete `faultinj`/`speed`/`timed`/`mock-*` files outright.

**Estimated card YAMLs to migrate (re-tag in-place): ~134.
Estimated card YAMLs to delete: ~67.
Estimated card YAMLs to KEEP as-is: ~2,346.**

**Total cards retained ≈ 2,480 of 2,547 v2 YAMLs (97%).**
The card content is mostly fine — what's broken is the runtime layer above it.

---

## 6. Minimal v2.2 Architecture

```
src-v2/
├── App.tsx                      # 2 routes: /  /session/:level
├── main.tsx
├── pages/
│   ├── Home.tsx                 # 6-module picker (REPLACED)
│   └── Session.tsx              # linear walker (STRIPPED)
├── components/
│   ├── TitleBar.tsx             # 30-line minimal header (NEW; replaces AppShell)
│   ├── CardRenderer.tsx         # discriminator switch (KEPT)
│   └── cards/
│       ├── TraceCard.tsx
│       ├── MCQCard.tsx
│       ├── ClozeCard.tsx
│       ├── DemoCard.tsx
│       ├── DecomposeCard.tsx
│       ├── WalkthroughCard.tsx
│       ├── ProceduralCard.tsx
│       ├── StructWriteCard.tsx
│       ├── FunctionWriteCard.tsx
│       ├── MainWriteCard.tsx
│       └── TemplateRecallCard.tsx     # 11 components total
├── engines/
│   └── exposure-counter.ts      # ONLY engine; counters + familiarity
├── lib/
│   ├── session-store.tsx        # slimmed: only recordResult + getFamiliarity
│   ├── grading.ts
│   └── load-cards.ts            # build-time deck loader, sorts by prereq
└── types/
    └── card-schema.ts           # trim discriminator union from 23 → 11
```

**Routing:**
- `/` → Home (module picker)
- `/session/:level` → Session (linear walker)
- Done at end-of-deck → back to Home

**Card flow:**
- Home → click L0 → Session loads `cards[L0]` sorted by build-time order
- Walks 1..N: pass advances, fail retries, skip is gone (linear cure)
- Header: `Lx · ATOM-ID · CardType · pos/total`
- Bottom: tiny familiarity bar for current atom (exposure-counter)

---

## 7. Effort Estimate

| Action | Count |
|---|---:|
| Files to **delete** | ~70 (45 source + 25 tests/stories) |
| Files to **rewrite** | 5 (Home.tsx, Session.tsx, App.tsx, session-store.tsx, NEW TitleBar.tsx) |
| Files to **strip** | 2 (exposure-counter.ts surfaced API, card-schema.ts discriminator) |
| Card YAMLs to **migrate (re-tag)** | ~134 |
| Card YAMLs to **delete** | ~67 |
| Card YAMLs to **keep as-is** | ~2,346 |
| **Total cards retained** | **~2,480 of 2,547 (97%)** |
| **Source LOC deleted** | ~7,000–9,000 (rough: 6 engines avg 200 LOC, 6 pages avg 400 LOC, 14 cards avg 200 LOC, AppShell ~400 LOC) |
| **Source LOC added** | ~250 (5 rewritten files, mostly small) |

**Net: ~−7,500 LOC, −70 files, +5 minimal files.**

---

## 8. Risk note

- The **doc-drift** sub-audit is missing. CLAUDE.md states "post-M22 maintenance mode, 1,775 cards, 10 card types." `data/v2/SCHEMA.md` contradicts: "23 card types, 4,600 cards, 6 design levels." That contradiction means **the project has TWO live source-of-truth documents pointing at TWO incompatible apps**. The minimalist rebuild reverts to CLAUDE.md's v1 spec (which is also what the user actually described).
- The **card-quality** sub-audit is missing. The migration count above is heuristic from filename prefixes. Before mass-deleting `faultinj`/`speed`/`timed`/`mock-*` YAMLs, do a one-pass YAML-load to extract the real `type` field from each file and confirm the prefix matches.

---

## 9. Concrete migration plan

1. **Branch**: `git checkout -b v2.2-minimalist` from current main.
2. **Delete** in this order:
   1. `src-v2/pages/Track.tsx Mock.tsx Postmortem.tsx AtomTree.tsx Weakness.tsx Preflight.tsx` (+ their `__stories__/`).
   2. `src-v2/engines/multi-q-propagation.ts stage-gate.ts failure-recovery.ts daily-deck-composer.ts adaptive-deck.ts dag-backward-retry.ts` (+ their `__tests__/`).
   3. The 14 off-spec cards listed in §1c.
   4. `src-v2/components/primitives/AppShell.tsx`.
3. **Strip / rewrite**:
   1. `Home.tsx` → 6-module picker (~80 LOC).
   2. `Session.tsx` → linear walker (~120 LOC).
   3. `App.tsx` → 2 routes (~50 LOC).
   4. `lib/session-store.tsx` → exposure-only (~60 LOC).
   5. NEW `components/TitleBar.tsx` (~30 LOC).
4. **Migrate** card YAMLs: re-tag ~134, delete ~67, keep ~2,346.
5. **Update** `data/v2/SCHEMA.md` discriminator union from 23 → 11; bump `schemaVersion` from `v2` → `v2.2`.
6. **Lint + smoke**: `npm run lint:cards && npm run build && npm run smoke`.
7. **CHANGELOG entry**: "2026-05-07 — v2.2 minimalist rebuild. 78→13 surfaces (83% scope-creep removed). Engines 7→1. Card types 23→11. Cards 2,547→2,480."

**Final count: 70 files deleted · 5 files rewritten · 134 cards re-tagged · 67 cards deleted · 2,480 cards retained.**
