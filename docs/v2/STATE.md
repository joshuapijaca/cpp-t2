# cpp-t2 v2 Build State

**Last updated**: 2026-05-07 (initial setup by COORD-1)
**Phase**: 1 (foundation)

This file is the live build state tracker. Every coordinating agent updates it on start, on milestone completion, and on any state change. Append your agent ID and timestamp to the changelog at the bottom.

---

## Phase 1 — Foundation

Phase 1 lays the directory structure, schemas, source extracts, and atom graph that all later content authoring depends on. Reference: [docs/18_option4_milestone_plan.md](../18_option4_milestone_plan.md).

### Setup

- [x] **M0** — v2 directory structure created (`src-v2/`, `data/v2/`, `build-v2/`, `docs/v2/`, `source-data-v2/`) — COORD-1, 2026-05-07
- [x] **M0.1** — `docs/v2/00_README.md` orientation doc — COORD-1, 2026-05-07
- [x] **M0.2** — `docs/v2/STATE.md` build state tracker — COORD-1, 2026-05-07
- [x] **M0.3** — `data/v2/agent-ledger.jsonl` initialized — COORD-1, 2026-05-07

### Schemas & Types

- [ ] **M2** — Zod schemas for card types (Concept, Recall, MCQ, Predict, Trace, Mistake, Diagnose) — `src-v2/types/`
- [ ] **M3** — Atom YAML schema + validator — `src-v2/types/`, `build-v2/`
- [ ] **M4** — Common-mistake schema + immunization link schema — `src-v2/types/`

### Source Extraction (parallel cluster)

- [ ] **M5** — V2.0 spec page extraction → `source-data-v2/v20-spec/`
- [ ] **M6** — PFG section map → `source-data-v2/pfg/`
- [ ] **M7** — Seminar VTT timestamp index → `source-data-v2/seminars/`
- [ ] **M8** — Canonical C++ reference snippets → `source-data-v2/cpp-ref/`
- [ ] **M9** — Test 2 past-paper / mock extracts → `source-data-v2/mocks/`
- [ ] **M10** — Common-mistakes corpus (Aaron's notes, OnTrack feedback) → `source-data-v2/cm/`
- [ ] **M11** — Existing v1 audit (which cards survive the cut) → `source-data-v2/v1-audit/`

### Atom Graph

- [ ] **M12** — Atom dependency graph (~187 atoms) seeded in `data/v2/atoms/` — depends on M5–M11

### UX Foundation

- [ ] **UX-M01** — code editor primitive specs (editor, terminal, diff view, output panel) → `docs/v2/ux/` and `src-v2/components/primitives/`

---

## Phase 2 — Engines

- [x] **M13** — Exposure-frequency counter engine — `src-v2/engines/exposure-counter.ts` — EN-1, 2026-05-07
- [x] **M14** — Multi-Q tagging + propagation — `src-v2/engines/multi-q-propagation.ts` — EN-1, 2026-05-07
- [ ] M15 — Stage-gate + 4 escape valves
- [ ] M16 — Daily-deck composer
- [ ] M17 — Adaptive deck (in-session)
- [ ] M18 — DAG-backward retry engine

## Phase 3 — Card Authoring (placeholder)

- [ ] M17 — Concept cards (per atom)
- [ ] M18 — Recall / MCQ / Predict / Trace cards
- [ ] M19 — Mistake / Diagnose cards
- [ ] M20 — Mock paper assembly

## Phase 4 — UI Build (placeholder)

- [ ] L-1..L11 — Page-level components (Home, Track, Card, Mock, Postmortem)
- [ ] UX-M02..M0n — Primitive implementations

## Phase 5 — Integration & Cutover (placeholder)

- [ ] M21 — URL flag `?v=2` wiring
- [ ] M22 — End-to-end smoke + parity audit vs v1
- [ ] Post-M22 — Public switch (v2 default)

---

## Currently Spawned Agents

| Agent ID | Task | Status | Started |
|---|---|---|---|
| COORD-1 | Phase 1 directory + state setup (M0, M0.1–M0.3) | Done | 2026-05-07 |

When you spawn a child agent or take a milestone, append a row above and remove it (or mark Done) on completion.

---

## Blockers

None.

---

## Changelog

- **2026-05-07** — COORD-1: created v2 directory tree, README, STATE tracker, agent ledger. Phase 1 setup milestones M0–M0.3 closed. Ready for parallel kickoff of M2/M3/M4 (schemas) and M5–M11 (source extraction).
- **2026-05-07** — EN-1: M13 + M14 closed. Pure-functional exposure-frequency engine + multi-Q propagation shipped. 65 vitest cases / 100% line coverage / 1000-iter stress test verifies 8 invariants. See `docs/v2/EXPOSURE_ENGINE.md` for design + invariants.
