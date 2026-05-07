# Anti-drift policy (v2.2 onwards)

**Companion doc:** `docs/v2/MANIFEST.md` is authoritative for *what* is in scope.
This doc is authoritative for *how* we keep it that way.

## What drifted in v2 (recap)

In the v2 → v2.1 build, the previous Claude added **14 unrequested features
across 5 categories**:

| Category | Drift count | Items added |
|---|---|---|
| Pages | 6 | Track, Mock, Postmortem, AtomTree, Weakness, Preflight |
| Engines | 6 | daily-deck-composer, adaptive-deck, stage-gate, failure-recovery, dag-backward-retry, multi-q-propagation |
| Card components | 9 | AdversarialMockCard, FaultInjectionCard, PreflightCheckCard, ConfidenceCalibrationCard, DAGRetryCard, DeltaCard, TestDaySimCard, VariantGenCard, PostmortemCard |
| UI surfaces | 11+ | Dashboard tiles, DAG visualizer, confidence-rating, streak counter, test-day countdown, weakness heatmap, mock-paper picker, side-by-side diff with annotations, pause/skip buttons, stage progression bar, per-Q progress rings |
| Engine behaviors | 7 | Smart card selection, failure-pattern detection, burnout heuristic, calendar scheduling, time-based spacing, mock variant matrix, pre-flight predictor |

Audit data: 65/78 UI surfaces, 6/7 engines, 9/23 card types were OFF-SPEC.

## Why each was wrong

### Pages
- **Track (per-Q view)** — User asked for one linear walk. Per-Q view = stage-gating UX = drift.
- **Mock (separate screen)** — Mocks live in L5 as cards. A separate screen invented two flows where one was specified.
- **Postmortem (separate screen)** — Postmortem is an L5 walkthrough card, not a navigation surface.
- **AtomTree (DAG visualizer)** — User explicitly said no DAG visualizer. The atom DAG is a build-time ordering aid, not a runtime feature.
- **Weakness (file viewer)** — There is no weakness model in the approved spec. Exposure counter, period.
- **Preflight (lightning round)** — User did not ask for this; it copied a pattern from an audited app.

### Engines
- **daily-deck-composer** — User asked for "linear walk in card-id order." Composition logic = invented requirement.
- **adaptive-deck** — In-session reordering = same drift in different costume.
- **stage-gate** — S1–S6 progression assumes a curriculum model the user explicitly rejected ("just play cards in order").
- **failure-recovery** — User asked for "retry on fail." Five-state recovery state-machine ≠ retry.
- **dag-backward-retry** — Injecting prereq cards on fail assumes the DAG is an exam predictor. It is not.
- **multi-q-propagation** — Modules are independent. Cross-module mastery propagation = drift.

### Card components
- **AdversarialMockCard** — Mock cards are normal cards in L5; "adversarial" framing is invented difficulty modeling.
- **FaultInjectionCard** — Spot-the-error is an MCQ pattern. New type = unjustified taxonomy bloat.
- **PreflightCheckCard** — There is no preflight feature. Card type orphaned to a forbidden screen.
- **ConfidenceCalibrationCard** — User said no self-rating widgets.
- **DAGRetryCard** — Tied to forbidden dag-backward-retry engine.
- **DeltaCard** — Diff highlighting = renderer feature, not a card type.
- **TestDaySimCard** — Same drift as AdversarialMock — L5 mocks suffice.
- **VariantGenCard** — Build-time variant generation contradicts "no AI generation."
- **PostmortemCard** — Postmortems are L5 walkthroughs with `type: WalkthroughCard`. New card type = navigation drift codified into schema.

### UI surfaces
Every dashboard tile, heatmap, ring, and counter beyond a single familiarity
gauge is a separate UX surface the user never asked for. These accreted from
audited reference apps without explicit approval.

### Engine behaviors
Smart selection, burnout heuristics, calendar scheduling — these all assume a
"learning analytics" product the user rejected. The product is one student,
one exam, one linear walk, one familiarity counter.

## Mechanisms to prevent recurrence

1. **MANIFEST.md is authoritative.** Future Claudes read it before any work.
   If a feature is not on the manifest, it is forbidden by default — no
   need to find it on a "forbidden" list.

2. **Schema lock at 15 card types.** Anything else fails Zod parsing. Drift
   cannot reach disk silently.

3. **`lint:drift` script blocks builds with off-manifest files.**
   - `src-v2/pages/<X>.tsx` not in approved-2 → error
   - `src-v2/engines/<X>.ts` not in approved-1 → error
   - YAML cards with off-manifest `type` → error
   - Citations not matching the approved taxonomy → error

4. **Per-wave checkpoint:** every agent reports files added / modified /
   deleted in the agent-ledger. The user approves the diff before the
   next wave runs.

5. **Forward + backward citation rule.**
   - Every drill carries a forward `tier1:Q{n}:{atom-id}` citation.
   - Every drill ALSO carries a backward `tier2:{kind}:{ref}` citation.
   - Lint enforces both. Stub / generic / "internal" sources fail.

6. **CLAUDE.md updated** with explicit DO-NOT-ADD section pointing to the
   manifest. The drift list is mirrored at the top of CLAUDE.md so any
   agent loading project context sees it before the first tool call.

## Process

### Before any code wave
- Re-read `docs/v2/MANIFEST.md`.
- Re-read this doc (`docs/v2/ANTI_DRIFT.md`).
- Confirm the wave's intent maps onto an approved page / engine / card type.
- If a wave needs a new feature, file an RFC against the manifest **first**,
  get user approval, **then** code. No silent additions.

### During a wave
- Only touch files that map to the manifest.
- If a touched file references a forbidden item, the wave is over —
  surface to the user before continuing.

### After a wave
- Run `npm run lint:drift`. Must exit 0.
- Run `npm run lint:v2`. Must exit 0 on cards / atoms / deck / drift.
- Report the diff in `<added>/<modified>/<deleted>` format in the agent-
  ledger.
- Wait for the user to approve the diff before starting the next wave.

### When in doubt
The manifest is the only spec. Plans (`docs/16`, `docs/19`) and audits
inform the manifest but do not override it. If a plan and the manifest
disagree, the manifest wins; the plan is updated, not the manifest.
