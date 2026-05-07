# cpp-t2 v2 — End-to-End Functionality Audit

Date: 2026-05-07
Auditor: app-functionality auditor

## 1. Smoke Test Result

PASS. `npm run smoke:v2` reports `2458 valid / 0 invalid`. Per-level distribution L0=517 / L1=772 / L2=269 / L3=417 / L4=396 / L5=87. Top card type: `MCQCard` (497).

`npx vite preview --mode v2 --port 5176` started cleanly. `curl -o /dev/null -w "%{http_code}"` against `http://localhost:5176/index.v2.html` returned **HTTP 200**. Bundle output present at `dist-v2/assets/` (cards, engines, pages, vendor, vendor-react JS chunks + 1 CSS).

## 2. Per-Page Render Status

| Page | File | Render Status | Notes |
|---|---|---|---|
| Home | `Home.tsx` | **DEAD CODE** | Fully implemented (615 lines: TodayTile, MockTile, MasteryTile, WeaknessFileTile). NEVER mounted by router. App.tsx mounts `HomeStub` (line 161). |
| Track | `Track.tsx` | **DEAD CODE** | Fully implemented (803 lines: tabs, stage-bar, AtomDAG, DrillList, skip-dialog). NEVER mounted. App.tsx mounts `TrackStub` (line 162). |
| Mock | `Mock.tsx` | Renders | Wired in App.tsx; reads `data.mockPapers[0]`; only 1 paper exists (built from first found cards). Timer removed per spec. |
| Postmortem | `Postmortem.tsx` | Renders | Wired; receives payload from Mock. **Annotations always empty** — App.tsx line 140 hard-codes `annotations: [[], [], [], []]` with comment "Stub annotations — real grader emits these." |
| AtomTree | `AtomTree.tsx` | Renders empty | Wired but `data.atoms = []` (main.tsx line 111). DAG will display "no atoms". |
| Weakness | `Weakness.tsx` | Renders empty | Wired but `data.weakness = []` and `data.weaknessHeat = [0,0,0,0,0,0,0]` (length 7, not 90). |
| Preflight | `Preflight.tsx` | Renders | Wired; `cards.slice(0,50)` passed in. |

## 3. Per-Component Wiring Status

`CardRenderer.tsx` has 23 case branches matching the 23 card types in `components/cards/`. Exhaustive `never` switch guard present (compile-time safety). Default fallback renders red error pane on unknown type.

All 23 card components are imported and mounted. Two components have inline defaults inside the renderer:
- `TemplateRecallCard` defaults `mode` based on `card.status === 'FAMILIAR'` 
- `ConfidenceCalibrationCard` ships a stub `renderInner` that just shows "Reveal canonical answer" button.

Schema dispatch is sound. Owner pages can mount cards directly for richer wiring.

## 4. Per-Engine Integration Status

| Engine | Logic | Wired to UI? |
|---|---|---|
| `exposure-counter` | Pure-functional, well-documented invariants I1–I8. `recordCardResult` increments correctly. | **NO production caller.** `recordResultAction` defined in `session-store.tsx` but invoked only in `__stories__/Home.stories.tsx` and `__stories__/Track.stories.tsx`. No page calls it. |
| `daily-deck-composer` | Real implementation w/ phase, layered draw, audit pass. | Reachable via `useTodayDeck` — but only Home.tsx/Track.tsx (the dead pages) consume it. |
| `stage-gate` | Real (S1–S6 + escape valves). | `setStageProgressAction` never called from production. Only stories use it. |
| `dag-backward-retry` | Real `walkBackward` + `injectPrereqCards`. | Not called by any page. `data.atoms = []` would also no-op the walk even if invoked. |
| `multi-q-propagation` | Present | No production caller. |
| `failure-recovery` | Present | No production caller. |
| `adaptive-deck` | Present | No production caller. |

**Net: engines are unit-testable but disconnected from the live React tree.**

## 5. Session-Store Status

`SessionStoreProvider` IS mounted in `main.tsx` (line 173). `initialCards={cards}` correctly auto-`registerCards`. Reducer is correct. Hooks (`useSession`, `useFamiliarity`, `useTodayDeck`, `useWeaknessFile`, `useStageProgress`, `useTestCountdown`, `useAtomCount`, `useCardCount`) all present and return real data when invoked.

**Problem:** the `App.tsx` stub UI does not consume any session hooks. Mock and Preflight call card `onComplete(passed)` but route only to internal local state — neither calls `recordResultAction`. Therefore answering cards does NOT update familiarity, does NOT advance stages, does NOT populate the weakness file. State persists across navigation (it lives in context) but nothing meaningful is ever written to it.

## 6. Blocker List

### Critical (app cannot fulfill its study purpose)
1. **Home page is a stub.** Real `Home.tsx` (TODAY/MOCK/MASTERY/WEAKNESS tiles) is unmounted. Student sees a primitive 4-route picker.
2. **Track page is a stub.** Real `Track.tsx` (tabs, stage progression, atom DAG, drill list) is unmounted. The core study screen is missing.
3. **Card answers do not record.** No code path connects `CardRenderer.onComplete` → `recordResultAction`. Familiarity, stage gate, weakness file all stay at zero forever. Daily-deck composer always returns NEW-status cards.
4. **No "study session" flow.** Nothing routes a deck of cards through `CardRenderer` one-by-one. Mock works (4 fixed cards) but per-card drilling does not exist as a route.

### Major
5. **AtomTree displays empty.** `main.tsx buildAppData` returns `atoms: []`. No YAML→Atom loader runs.
6. **Weakness displays empty.** Same; `weakness: []` hard-coded.
7. **Postmortem annotations always empty.** App.tsx line 140 hard-coded; no grader feeds them.
8. **Mock has only one paper.** `buildMockPapers` picks the first card of each required type — same paper every time.
9. **`weaknessHeat` length 7, not 90.** Weakness page expects ~90-day heatmap; will render a short bar.

### Minor
10. Drill payloads (`window.history.replaceState({drillAtoms})`) set in App.tsx but TrackStub never reads them.
11. Stories show how the real wiring works; production code does not adopt it.

### Cosmetic
12. None of significance — the stub UI uses theme variables and renders cleanly.

## 7. Student Usability Estimate

A SIT102 student opening this app today will see the hand-rolled "Pick a screen" stub with `/mock /atoms /weakness /preflight` and `/track/Q1..Q4` buttons. They can:
- Run the single Mock paper and see a postmortem with empty annotations.
- Open AtomTree and see "no atoms".
- Open Weakness and see an empty file.
- Open Preflight and drill 50 cards in a lightning round (this works).

They CANNOT:
- See a daily deck on Home.
- Progress through stages on Track.
- Have any of their answers count toward familiarity / mastery / weakness.
- Run a normal study session of mixed cards.

**Will hit blockers requiring dev help: yes, immediately.** The student sees an obviously-incomplete homepage on first load.

## 8. Final Verdict

### **BROKEN — not study-ready.**

The 2,458 cards load. The 23 card components render. The engines are correct. But the wiring layer between them — App.tsx — substitutes stubs for the two pages a student needs (Home, Track) and never connects card completion back to the session store. The app builds, the bundle ships, the smoke test passes, but the actual study loop (Home → click track → answer cards → see progress) does not exist as a runnable code path.

**Required for study-ready:**
1. App.tsx: replace `HomeStub` with `<Home onNavigate={...} />` and `TrackStub` with `<Track ... onPickCard={...} />`.
2. Add a `Session` page that mounts `<CardRenderer>` over the deck and calls `recordResultAction(cardId, correct)` from `useSession()` on each completion.
3. main.tsx `buildAppData`: load atoms, derive `familiarity` and `weakness` from the session store (or remove these props and let the pages read the store directly).
4. App.tsx: feed real grader output to Postmortem `annotations`.

These are wiring fixes, not new features. The hard work (engines, schemas, components) is done.
