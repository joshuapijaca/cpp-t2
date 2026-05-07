# AUDIT — Engine Scope Creep (cpp-t2 v2)

Date: 2026-05-07
Auditor mode: brutal honesty (RULE 4)

User vision (verbatim): "Minimalist setup … go through everything linearly. Pure deterministic flow. Old app: linear card sequence per level, retry button, exact-match grading. Exposure-frequency counters yes; SRS no; timers no."

What linear flow ACTUALLY needs:
1. Position counter per module (which card index am I on).
2. Retry button per card (already exists in v1 / Sequence.tsx).
3. Optional: exposure counter per atom for the 0→100 gauge the user asked for.
4. Card list ordered by prereq-level (already determined at build time in cards.json).

That's it. No scoring, no weighting, no DAG injection, no fatigue, no escape valves.

---

## Per-engine verdict

### 1. exposure-counter.ts — **NEEDED** (asked for)
- Records exposureCount/correctCount per card. Pure functions, immutable state.
- Powers the 0→100 atom familiarity gauge the user explicitly requested.
- The state machine (NEW → IN-PROGRESS → FAMILIAR with RETIRE_WINDOW=3) is more than asked for, but the core counter is on-spec.
- **Keep**, but the FAMILIAR retirement logic + Q-track roll-up can be ignored if not exposed in UI.

### 2. multi-q-propagation.ts — **OFF-SPEC**
- "Cards with multiple Q-tags lift several Q-tracks at once."
- User said modules are independent. He never asked progress on Q2 to leak into Q3/Q4.
- `propagateExposure()` is a thin wrapper around `recordCardResult` with a tag-drift assertion — pointless if Q-track linkage is removed.
- `rankCardsByCoverage()` exists only to feed the deck composer that the user didn't ask for.
- **Delete.** If Q-tagging stays at all, it's a build-time index for filtering, not a runtime engine.

### 3. stage-gate.ts — **OFF-SPEC**
- 6-stage ladder (S1 Tour → S6 Speed) with promotion thresholds 100/95/90/90/85/90 % and **four escape valves**: 24h timeout auto-promote, 3-fail difficulty drop, cross-track stalemate mock-unlock, manual override with cost-warning.
- User asked for *linear walk*. None of this is linear: cards are gated, then ungated by timer/stalemate heuristics.
- Escape valves are pure scope-creep — they exist to fix problems created by the gating itself. Remove the gate, the valves vanish.
- **Delete.** Linear flow needs no gates: the prereq DAG already orders cards at build time.

### 4. failure-recovery.ts — **OFF-SPEC**
- 5-band action map: <30 % drops 2 stages + injects prereqs + alerts "concept needs paper practice"; 30–49 % drops 1 stage; etc.
- User wanted retry button on miss. He did NOT ask for stage drop-back, prereq injection, or alert messaging.
- `failureAction()` is dead: nothing imports it outside its own test file.
- **Delete.** Replace with the existing retry button.

### 5. daily-deck-composer.ts — **OFF-SPEC** (most egregious)
- 600 LoC. Phases (BLOCK D1-3, INTERLEAVE D4+), dominant-Q rotation, layered draw 60/30/10 (NEW/IN-PROGRESS/FAMILIAR), score = qWeight × stageWeight × statusWeight × stagePolicyMul × dominantBonus × ageBonus, low-acc 1.5× boost, catch-up tail (last-30 atoms below 50 %), force-injection audit.
- This is the OPPOSITE of "go through everything linearly." It's an SRS-flavored bandit that decides for the student.
- The 60/30/10 mix actively reorders cards based on familiarity status — directly contradicts linear walk.
- **Wired to UI** via `useTodayDeck()` in session-store.tsx, called by Track.tsx / Session.tsx — so this one is currently live.
- **Delete the engine. Replace `useTodayDeck` with `cards.filter(c => c.moduleId === currentModule).sort(byBuildTimeOrder)` paged by position.**

### 6. adaptive-deck.ts — **OFF-SPEC**
- On miss: inject DeltaCard for failed atom (or sibling-by-Q-tag).
- Fatigue heuristic: if last-10 accuracy drops > 20 % vs the prior 10, swap heavy card types (TraceCard, MainWriteCard, etc.) for lighter (MCQCard, ClozeCard, DemoCard).
- User asked for linear deterministic flow. Mid-session reorder/inject is the definition of non-deterministic.
- **Dead code in production**: `adaptiveAdjust` is not imported anywhere outside its own test file.
- **Delete.**

### 7. dag-backward-retry.ts — **OFF-SPEC**
- BFS-walks prereq DAG backward from failed atom; injects N prereq cards into the deck.
- User did NOT ask for prereq injection. He asked for retry.
- **Dead code in production**: only its own test file imports it.
- **Delete.**

---

## How session-store.tsx ties engines to UI

| Hook | Engine called | Status |
|---|---|---|
| `useFamiliarity` / `useAllFamiliarity` | exposure-counter `getQTrackFamiliarity` | Asked for (Q-track gauges) |
| `useTodayDeck` | **daily-deck-composer `composeDailyDeck`** | **OFF-SPEC, but currently live** |
| `useWeaknessFile` | exposure-counter `getAllAtomFamiliarities` | Borderline — user asked for familiarity gauge, not "weakness file" surfacing |
| `useStageProgress` | stage-gate `highestPromotedStage`, `manualOverride` | OFF-SPEC |
| `recordResultAction` → `recordCardResult` | exposure-counter | Asked for |
| `setStageProgressAction` | stage-gate `setProgress` | OFF-SPEC |

**Live engines (touch the UI):** exposure-counter, stage-gate (via session-store + Track.tsx), daily-deck-composer (via useTodayDeck).
**Dead in production paths:** multi-q-propagation, failure-recovery, adaptive-deck, dag-backward-retry. They exist + are tested, but nothing imports them outside `__tests__/`.

---

## Recommendation

Keep:
1. **exposure-counter.ts** — core counters + atom familiarity. Ignore the Q-track/FAMILIAR retirement features unless surfaced.
2. A new ~20-line **position-tracker** (per-module index + retry).

Demote / delete:
3. **multi-q-propagation.ts** — delete (build-time index suffices).
4. **stage-gate.ts** — delete (linear flow needs no gate).
5. **failure-recovery.ts** — delete (already dead).
6. **daily-deck-composer.ts** — **delete**; replace `useTodayDeck` with linear filter+sort by build-time order.
7. **adaptive-deck.ts** — delete (already dead).
8. **dag-backward-retry.ts** — delete (already dead).

Of 7 engines, 1 is needed for linear flow. 6 are off-spec.

**Delete list:** multi-q-propagation.ts, stage-gate.ts, failure-recovery.ts, daily-deck-composer.ts, adaptive-deck.ts, dag-backward-retry.ts. Plus the wiring in session-store.tsx (`useTodayDeck`, `useStageProgress`, `setStageProgressAction`, `useWeaknessFile`) and the Track.tsx stage-gate import.
