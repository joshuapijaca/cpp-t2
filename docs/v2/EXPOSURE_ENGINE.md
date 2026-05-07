# Exposure-Frequency Engine — Design Doc

**Owner:** EN-1 (engine engineer)
**Date:** 2026-05-07
**Status:** Implemented (M13 + M14 of v2 milestone plan)
**Files:**
- `src-v2/engines/exposure-counter.ts`
- `src-v2/engines/multi-q-propagation.ts`
- `src-v2/engines/__tests__/exposure-counter.test.ts`

---

## 1. Rationale — why not SRS?

The v1 cpp-t2 build experimented with spaced-repetition-style scheduling (SM-2 derivative). It was dropped for v2 (Option 4 max-quality redesign) for three reasons:

1. **Wrong unit of memory.** SRS optimises retention over weeks/months. The student is preparing for a single 90-minute exam in a fixed window (≤21 days). The relevant memory horizon is "until the exam", not "indefinitely".
2. **Brittle scheduling under variable session length.** Real study sessions are 45-240 minutes, irregular days. SRS interval math degrades when "due dates" are missed or compressed; the resulting deck either over-drills or starves atoms.
3. **No alignment with multi-Q tagging.** A single drill is supposed to lift multiple Q-tracks (one trace card serves Q1 + Q4). SRS scheduling is per-card; aggregating per-track familiarity from per-card intervals is awkward.

The replacement is a **counter-based familiarity model**: every card has a target exposure count tuned to its length, and a card retires only when the student has hit the target *and* answered the last few correctly. Familiarity at atom and Q-track level is derived by aggregation. No timing, no decay, no scheduling — just count of high-quality exposures.

This matches how human procedural fluency forms: a thing feels automatic once you've done it ~6-12 times correctly, regardless of the calendar between attempts.

---

## 2. Core types

```ts
type CardStatus = 'NEW' | 'IN-PROGRESS' | 'FAMILIAR';
type ExposureResult = 'correct' | 'wrong';
type CardLength = 'short' | 'medium' | 'long';

const EXPOSURE_TARGETS = { short: 6, medium: 8, long: 12 };
const RETIRE_WINDOW = 3;
```

- `CardExposureState` holds the per-card counters: `exposureCount`, `correctCount`, `lastNResults` (capped to RETIRE_WINDOW), `status`, `length`, and timestamps.
- `CardMeta` is registered up-front and immutable: `cardId`, `atomId`, `qTags`, `length`.
- `SessionState` is the top-level container: `cards`, `exposures`, `atomToCards`, `qToAtoms`, `seq`. Pure-functional API — every mutator returns a new state.

---

## 3. State machine

```
        register card
             │
             ▼
   ┌──────────────────┐
   │       NEW        │  exposureCount = 0
   └──────────────────┘
             │ first recordCardResult
             ▼
   ┌──────────────────┐
   │   IN-PROGRESS    │  0 < exposureCount < target
   │                  │  OR target met but last 3 not all correct
   └──────────────────┘
             │ exposureCount ≥ target
             │ AND lastNResults all 'correct'
             ▼
   ┌──────────────────┐
   │     FAMILIAR     │  terminal within session
   └──────────────────┘
       (no demotion)
```

**FAMILIAR is terminal within a session.** A retired card that later gets a wrong answer (e.g. the student returns to drill it) stays FAMILIAR for the session. Cross-session demotion is out of scope (no persistence in v2; session state is in-memory).

---

## 4. Familiarity math

### Per atom

```
target           = Σ EXPOSURE_TARGETS[card.length]  for card in atom.cards
correctExposures = Σ card.correctCount              for card in atom.cards
percent          = clamp_0_100(round(correctExposures / target × 100))
```

If the atom has zero registered cards or zero target, percent = 0 (defensive).

### Per Q-track

```
percent = round(mean(getAtomFamiliarity(a).percent  for a in q.atoms))
```

Unweighted mean. Atoms-at-100 and atoms-below-50 buckets are computed for UI surfacing (skill-tree colouring, weakness file).

The Q-track familiarity is **derived**, not stored. It's recomputed on every query. This is the key to multi-Q propagation: the moment a card is exposed, the *underlying* atom counters move, and the next Q-track query sees the new state — for every Q-tag the card carries.

---

## 5. Multi-Q propagation

**Insight:** a single drill can lift multiple Q-tracks simultaneously. A trace card on a struct-with-loop atom belongs to Q1 (hand-execute) *and* Q4 (compose main). Drilling that one card moves the student forward on both tracks.

**Implementation:** the per-card counter is the unit of memory. When `propagateExposure(state, cardId, qTags, correct)` runs, it:

1. Asserts the supplied qTags match the registered ones (drift detector — if the caller's view is stale, throw).
2. Calls `recordCardResult` on the single card.
3. Returns the new state.

Because `qToAtoms` was indexed at registration time, every subsequent `getQTrackFamiliarity` call automatically reflects the updated counters across all tagged Q-tracks. No explicit fan-out is needed.

**Coverage ranking** (`rankCardsByCoverage`) makes the multi-Q value concrete: given a candidate set and a list of Q-tracks the student is behind on, return cards ordered by how many of those tracks they touch. The deck composer uses this to prefer cards that lift the most red tracks per drill.

---

## 6. Invariants

These hold after every `recordCardResult` / `propagateExposure` call. They are explicitly verified by the 1000-iteration stress test in `exposure-counter.test.ts`.

| # | Invariant | Where checked |
|---|-----------|---------------|
| I1 | `exposureCount ≥ correctCount` (every correct increments both; every wrong increments only exposure) | stress test, every iter |
| I2 | `state.seq` equals total recorded exposures | stress test, after loop |
| I3 | `lastNResults.length ≤ RETIRE_WINDOW` always | stress test, every iter |
| I4 | FAMILIAR is terminal within a session (monotonic terminal state) | stress test, every iter; "retired card stays retired" edge case |
| I5 | atom percent ∈ [0, 100] | stress test, after loop |
| I6 | Q-track percent equals the unweighted mean of contributing atom percents (rounded) | stress test, after loop |
| I7 | `shouldRetire` requires *both* `exposureCount ≥ target` *and* last RETIRE_WINDOW all 'correct' | dedicated tests |
| I8 | Status transitions are forward-only: NEW < IN-PROGRESS < FAMILIAR within a session | state-machine tests |

---

## 7. Edge cases

- **Unregistered card recorded** → throws (`unknown cardId=...`). Caller bug.
- **Registration drift** (same cardId, different atom/length/tags) → throws (`drift`). Caller bug.
- **Empty atom** (`getAtomFamiliarity` for an atom with no registered cards) → percent = 0, target = 0. Defensive.
- **Zero Q-tag card** (foundation cards with no Q affiliation) → counts toward atom familiarity only, no Q-track lift.
- **Multi-card atom** → atom percent reflects aggregate progress across all cards. Drilling one card to 100% only moves the atom partially if other cards remain at 0.
- **Trailing window with mixed results** — only the last RETIRE_WINDOW results matter for retirement; earlier wrongs don't block retirement once enough corrects accumulate at the tail.
- **Familiar card subsequent wrongs** — counters keep incrementing (exposureCount goes up; correctCount unchanged), but status stays FAMILIAR. Atom percent is capped at 100, so over-drilling a retired card cannot push the atom above 100%.
- **Order-independent qTag idempotency** — re-registering a card with the same tags in different order is a no-op. Drift assertion ignores tag order.

---

## 8. Future work (out of scope for M13 + M14)

- **Cross-session persistence.** Current session state is in-memory. v2 may add localStorage or IndexedDB for "resume study session". When that lands, decide cross-session demotion policy explicitly (proposal: cap `exposureCount` regrowth at one-per-day so a returning student doesn't fast-track FAMILIAR by spamming).
- **Adaptive target tuning.** Per-card targets are length-bucketed (6/8/12). Could adapt per-student: a card the student gets right first try with high confidence might shorten its target; a card with a history of wrongs might lengthen it. Connects to the F3 confidence-calibration proposal in doc 17.
- **DAG-backward retry hook.** When an atom fails repeatedly, M18 will walk the prereq DAG. The exposure engine exposes `getAtomFamiliarity(atomId).percent` for that engine to consult; no change needed here, but we should namespace the failure-pattern hook so it doesn't grow into the counter module.
- **Mock-paper familiarity.** Mock papers are sequences of cards; their "completion %" is naturally derived from per-card status (FAMILIAR cards → 100%, others → percent). No new state needed.
