# C++T2

From-zero C++ learning app for SIT102 Test 2 (Deakin, 2026 T1).

**Goal**: zero prior C++ → ace 4-question Test 2 in 56 hours of deliberate practice.

## Architecture

| Layer | Choice |
|-------|--------|
| Build | Vite 6 |
| UI | React 19 + TypeScript 5 |
| Styling | Tailwind v4 + semantic CSS layer |
| State | React `useState` only — session-scoped |
| Storage | None (no localStorage, no backend) |
| Grading | Offline char-match (zero runtime API calls) |
| Authoring | Outline-anchored AI scribe (build-time only) |

## Quick Start

```bash
npm install
npm run dev                 # http://localhost:5173
```

## Scripts

| Command | Effect |
|---------|--------|
| `npm run dev` | Dev server |
| `npm run build` | tsc + vite build → `dist/` |
| `npm run preview` | Preview built `dist/` |
| `npm run type-check` | `tsc --noEmit` |
| `npm run gen` | Regenerate cards from outlines (requires `ANTHROPIC_API_KEY`) |
| `npm run lint:cards` | Miller's law + forbidden tokens + dedup |
| `npm run check:cpp` | g++ syntax check on canonical examples (skips if no g++) |
| `npm run order` | Topological sort → `data/ordered_ids.json` |

## Layout

```
cpp-t2/
├── CLAUDE.md            project guide for AI assistants
├── MISSION.md           non-negotiables
├── ANTIPATTERNS.md      banned shortcut behaviors
├── CONTRIBUTING.md      update protocol
├── CHANGELOG.md         append-only decision log
├── docs/                14 specs (07_master_plan.md = canonical)
├── outlines/            187 atom YAML briefs (anchor for AI authoring)
├── extraction/          raw PFG + Test 2 source material
├── build/               outline + card generators, lint, compile-check, topo
├── data/                cards.json (1,159 cards) + ordered_ids.json
├── src/
│   ├── types/card.ts    discriminated union
│   ├── lib/grading.ts   offline char-match
│   ├── components/      MemorizeCard / TraceCard / WriteCard / MCQCard / ProgressBar / MockExamTimer
│   ├── pages/Sequence.tsx
│   └── styles/          globals + semantic
└── dist/                static deployable
```

## Card Types

| Type | Purpose | UX |
|------|---------|----|
| `memorize` | Fact recall ≤7 words | Race-or-recall mode, char-match grading |
| `mcq` | Axiom + misconception filter | 4 options, 1-4 keys |
| `trace` | Hand-execution Q1 | Variable-box history strip + terminal panel |
| `write` | Code-write Q2/Q3/Q4 | 3-level scaffold (fill / complete / free) |

## Deployment

Static site. Drop `dist/` on any host:

| Host | How |
|------|-----|
| GitHub Pages | Push `dist/` to `gh-pages` branch |
| Netlify | Drag-drop `dist/` |
| Cloudflare Pages | Connect repo, build cmd `npm run build` |
| Local file:// | Open `dist/index.html` directly |

Bundle size: 549 KB raw / 104 KB gzip.

## Read First (For New Sessions)

1. `CLAUDE.md` — project guide
2. `MISSION.md` — non-negotiables
3. `ANTIPATTERNS.md` — 16 banned patterns
4. `docs/07_master_plan.md` — canonical reference
5. `docs/13_milestones.md` — M0-M11 plan

## Status

| Milestone | State |
|-----------|-------|
| M0 Spec Lock | ✅ |
| M1 Scaffold + MemorizeCard | ✅ |
| M2 AI Pipeline + L9 Cards | ✅ |
| M3 Pipeline v1 Lock | ✅ |
| M4 TraceCard + L13 | ✅ |
| M5 Q1 Sims | ✅ |
| M6 WriteCard + L14 | ✅ |
| M7 L10 + L12 + L15 (Q3) | ✅ |
| M8 L00 + L01 + L03 + L16 (Q4) | ✅ |
| M9 Foundation + MCQCard | ✅ |
| M10 Mock Exams (L17) | ✅ |
| M11 Polish + Deploy | ✅ |

## Acceptance Gates (M11)

| Gate | Status |
|------|--------|
| All 187 outlines locked | ✅ |
| 1,159 cards generated | ✅ |
| Lint pass (Miller / forbidden / dedup) | ✅ |
| `tsc --noEmit` clean | ✅ |
| Vite production build | ✅ |
| No `fetch(api)` in dist/ | ✅ (only react.dev + w3.org refs) |
| No `localStorage.setItem` in dist/ | ✅ |
| Bundle <500 KB gzip | ✅ (104 KB gzip) |
| Atom dependency closure | ⚠ 15 ID-format mismatches (`R-3` vs `R-03`) — non-blocking |
| Mock exam timer | ✅ |
