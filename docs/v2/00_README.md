# cpp-t2 v2 — Option 4 Max-Quality Build

## Project Naming

- **Project**: `cpp-t2` (root: `cpp-t2/`)
- **Build version**: `v2` (Option 4 max-quality redesign)
- **Status**: Phase 1 in progress (parallel agent build started 2026-05-07)

This v2 build is a complete max-quality redesign that replaces v1's content layer while preserving v1 as a frozen May 14 fallback. v1 (1,775 cards, shipped) lives in `cpp-t2/src/` and `cpp-t2/data/cards.json`. **v1 is frozen — do not touch.**

## Companion Documents

This README orients agents to the v2 build. Detailed design lives in:

- **[docs/16_test2_specific_redesign_v2.md](../16_test2_specific_redesign_v2.md)** — Test 2 specific scope, what's in/out, why the redesign
- **[docs/17_option4_max_quality_plan.md](../17_option4_max_quality_plan.md)** — Option 4 plan: card types, atoms, exposure-frequency engine, multi-Q tagging, adaptive deck, common-mistakes immunization, code editor primitives
- **[docs/18_option4_milestone_plan.md](../18_option4_milestone_plan.md)** — Phase 1–5 milestones (M0..M22, UX-M01.., L-1..L11), agent assignments, parallelism graph

Read 16 → 17 → 18 in order before contributing. This README is the orientation doc; the milestone plan is the build state.

## Core Rules (RULE 1–4)

1. **Time unbounded.** Quality first. v1 already ships May 14 — v2 has no fixed deadline.
2. **Max parallelism.** Independent work proceeds in parallel agents. The dependency graph in doc 18 governs ordering.
3. **v1 frozen.** Never modify `cpp-t2/src/`, `cpp-t2/data/cards.json`, `cpp-t2/index.html` (v1 paths), or any v1 build artifact. v2 lives entirely in `*-v2/` paths.
4. **Code-anchored.** Every card, atom, and mistake must trace to a real source: V2.0 spec page, PFG section, seminar VTT timestamp, or canonical C++ reference. No hallucinated content. Source IDs land in `source-data-v2/`.

## Directory Structure

```
cpp-t2/
├── src/                        # v1 React app (FROZEN, May 14 fallback)
├── data/
│   ├── cards.json              # v1 card data (FROZEN)
│   └── v2/                     # v2 card data (NEW)
│       ├── cards/              # Hand-authored card files
│       ├── atoms/              # Atom YAML, one file per atom
│       ├── mocks/              # Mock paper data
│       └── common-mistakes/    # CM data + immunization links
├── src-v2/                     # v2 React app (NEW)
│   ├── components/
│   │   └── primitives/         # code editor primitives
│   ├── engines/                # exposure-freq, multi-Q tagging, adaptive deck
│   ├── pages/                  # Home, Track, Card, Mock, Postmortem
│   ├── types/                  # Zod schemas
│   └── lib/                    # Utilities
├── build/                      # v1 build scripts (FROZEN)
├── build-v2/                   # v2 build scripts (NEW)
├── source-data/                # v1 source extracts (FROZEN)
├── source-data-v2/             # v2 source extracts: V2.0 spec, PFG maps, VTT timestamps (NEW)
├── docs/
│   ├── 00..15_*.md             # v1 design docs (REFERENCE ONLY)
│   ├── 16, 17, 18              # v2 design docs (CANONICAL for v2)
│   └── v2/                     # v2 build state (NEW)
│       ├── 00_README.md        # This file
│       └── STATE.md            # Build state tracker (live)
└── ...
```

## Current Build State

- **Phase**: 1 (foundation: directory setup, schemas, source extraction, atom graph)
- **Started**: 2026-05-07
- **Live tracker**: [STATE.md](./STATE.md) — updated by every coordinating agent

## Running v1 vs v2

The app supports both builds via a URL flag (planned):

- **v1 (default)**: `https://<host>/` — serves shipped 1,775-card build from `src/` + `data/cards.json`
- **v2 (opt-in)**: `https://<host>/?v=2` — serves new build from `src-v2/` + `data/v2/`

The flag is read at app entry. v1 entry remains untouched. v2 entry mounts a separate React tree from `src-v2/main.tsx` (planned). Until v2 is shippable, the flag silently falls back to v1.

## Contributing as an Agent

1. Read your milestone in `docs/18_option4_milestone_plan.md`.
2. Update `STATE.md` when you start, when you finish, and on any state change.
3. Append a JSONL entry to `data/v2/agent-ledger.jsonl` with your agent ID, task, and files touched.
4. Stay in your lane: only modify paths your milestone owns. v1 is frozen.
5. If your work blocks another agent, flag it in STATE.md.
