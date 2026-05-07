# v2.2 LOCKED FEATURE MANIFEST

**Status:** AUTHORITATIVE. Anything not on this list = drift = forbidden.

This manifest is the single source-of-truth for v2.2 scope. All other v2 design
docs (`docs/16`, `docs/17`, `docs/18`, `docs/19`) are planning artifacts and
must NOT be cited as authority. If they disagree with this manifest, the
manifest wins.

## Approved pages (2)
- **Home** — list of 6 modules + jump-to-card-N input
- **Sequence** — linear card walker (was called "Session" briefly in v2.1; revert to v1's "Sequence")

## Approved engines (1)
- **exposure-counter** — atom familiarity 0→100% gauge

## Approved card components (15)

### v1 types (11)
- MemorizeCard
- MCQCard
- TraceCard
- WriteCard
- ClozeCard
- DecomposeCard
- WalkthroughCard
- DemoCard
- ProceduralCard *(was ProceduralDrill in v1)*
- MatrixCard *(was CodeMatrix in v1)*
- CodeMemorizeCard

### v2 essentials (4) — user-approved in v2.1 plan
- TemplateRecallCard
- StructWriteCard
- FunctionWriteCard
- MainWriteCard

## Approved 6 levels
- **L0** Foundations (~400 cards) — PFG part-1 prereqs
- **L1** Q1 Hand-execute (~500 cards) — Tier 1 Q1 + saloni-2 VTT + practice/V2.0/variant Q1
- **L2** Q2 Write struct (~150 cards) — Tier 1 Q2 + practice/V2.0 Q2 + PFG struct
- **L3** Q3 Write read fn (~250 cards) — Tier 1 Q3 + practice/V2.0 Q3 + PFG fn-passing
- **L4** Q4 Write main (~200 cards) — Tier 1 Q4 + practice/V2.0 Q4 + PFG main
- **L5** Mock paper (~30 cards) — 1 Tier 1 verbatim + 2 reworded variants

**Total target: ~1,530 cards**

---

## Forbidden — DO NOT add (the 14 things v2 drifted into)

### Forbidden pages (6)
- Track (per-Q view)
- Mock (separate mock screen — mocks live as cards in L5)
- Postmortem (as separate screen — postmortem is an L5 walkthrough card)
- AtomTree (DAG visualizer)
- Weakness (file viewer)
- Preflight (lightning round screen)

### Forbidden engines (6)
- daily-deck-composer (linear walk handles this)
- adaptive-deck (no in-session reordering)
- stage-gate (no S1–S6 progression)
- failure-recovery (just retry)
- dag-backward-retry (no prereq injection on fail)
- multi-q-propagation (modules are independent)

### Forbidden card components (9)
- AdversarialMockCard
- FaultInjectionCard
- PreflightCheckCard
- ConfidenceCalibrationCard
- DAGRetryCard
- DeltaCard
- TestDaySimCard
- VariantGenCard
- PostmortemCard *(postmortem is an L5 walkthrough, not a card type)*

### Forbidden UI surfaces
- Dashboard tiles (TODAY / MOCK / MASTERY / WEAKNESS)
- Atom DAG visualizer
- Confidence-rating buttons
- Streak counter
- Test-day countdown
- Weakness heatmap
- Mock paper picker dropdown
- Side-by-side diff with annotations
- Pause/Skip buttons in Sequence
- Stage progression bar
- Per-Q progress rings

### Forbidden engine behaviors
- Smart card selection (60% NEW + 30% IN-PROGRESS + 10% FAMILIAR)
- Failure-pattern detection
- Burnout heuristic
- Calendar / day-based scheduling
- Time-based card spacing
- Mock variant matrix generation
- Pre-flight predictor

### Forbidden meta
- Live API calls at runtime
- Build-time AI card generation
- Spaced repetition (use exposure counter only)
- Timers on cards (per timer-strip already done)
- Confidence calibration
- Self-rating widgets

---

## Approved citation taxonomy

The `source` field on every card carries `kind` + `ref`. Approved forms:

- `tier1:Q{1-4}:{atom-id}` — drills (forward citation to V2.0 attempt 1 atom)
- `tier2:pfg:{path}` — backward (PFG file)
- `tier2:seminar:saloni-2 @ HH:MM:SS`
- `tier2:practice:Q{N}` — practice test reference
- `tier2:v2:Q{N}` — V2.0 test reference (the actual exam shown in screenshots)
- `tier2:variant:Q{N}` — variant test
- `tier2:task-sheet:P{N}` — weekly task

**Lint regex:** `^(tier1:Q[1-4]:[A-Z]-\d{2}[a-z]?|tier2:(pfg|seminar|practice|v2|variant|task-sheet):.+)$`

### Citation forms — NEVER USE
- `docs/16` / `docs/17` / `docs/18` (planning docs, not source-of-truth)
- "v2 spec §X" without a real file path
- Generic `"internal"` or `"auto-stub"` sources
- Bare paths without a `tier1:` / `tier2:` prefix

---

## Schema lock
Card schema enum reduces: **23 types → 15 types**. The 8 forbidden card types
throw Zod errors at validation time. The 11 v1-approved + 4 v2-essentials list
above is the authoritative discriminated-union enum.

The 8 types removed from the enum:
1. AdversarialMockCard
2. FaultInjectionCard
3. PreflightCheckCard
4. ConfidenceCalibrationCard
5. DAGRetryCard
6. DeltaCard
7. TestDaySimCard
8. VariantGenCard
9. PostmortemCard

(That is technically 9 — `SpeedDrillCard` and `EntityMatrixCard` /
`AlgorithmMatrixCard` are also off-manifest; they are subsumed by
`MatrixCard` and treated as forbidden in lint.)

---

## Drift detection
`npm run lint:drift` scans for:
- Files in `src-v2/pages/` not matching the 2 approved
- Files in `src-v2/engines/` not matching `exposure-counter`
- Card types in YAMLs not matching the 15 approved
- Citations not matching the approved taxonomy

**Exit 0 = clean. Exit 1 = drift found.** Fails the build chain via
`npm run lint:v2`.
