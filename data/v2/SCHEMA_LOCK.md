# cpp-t2 v2 Schema — LOCK DECLARATION

**Status: LOCKED** as of `schemaVersion = "v2"`.

This file is the formal lock declaration for the v2 build's data
contracts. The Zod source-of-truth lives in:

- [`src-v2/types/card-schema.ts`](../../src-v2/types/card-schema.ts)
- [`src-v2/types/atom.ts`](../../src-v2/types/atom.ts)
- [`src-v2/types/student.ts`](../../src-v2/types/student.ts)

The human-readable companion to this lock is
[`SCHEMA.md`](./SCHEMA.md). If the Zod files and the markdown disagree,
**the Zod files win** — but in practice both must be kept in sync via
the RFC procedure below.

---

## 1. What "LOCKED" means

> Locked = no agent may add, remove, or rename a field; change a type;
> change an enum value; or weaken a constraint without an approved RFC.

Specifically, the following are **frozen**:

1. The `schemaVersion` literal (`"v2"`).
2. The discriminator field name (`type`) and its 23 literal values
   (see §3).
3. The 4-value Q-tag enum (see §4).
4. The 4-value source-citation `kind` enum (see §5).
5. The 3-state card-status state-machine (see §6).
6. The 6-value `Level` enum (`L0..L5`).
7. The 7-value `Stage` enum (`0..6`).
8. The `AtomId` regex `^[A-Z]-\d{2}[a-z]?$|^A\d+$`.
9. The `CommonMistakeId` regex `^CM-[A-Za-z0-9_-]+$`.
10. The exposure-target defaults `{ short: 6, medium: 8, long: 12 }`.
11. The `StageProgressKey` regex `^L[0-5]-(L0|S[1-6])$`.
12. The `StudentSession` shape (top-level fields + types).

Bug-fix typos in JSDoc comments do **not** require an RFC. Anything
that changes a *value* an authoring agent or runtime engine reads
**does**.

## 2. Why we lock

- **4,600 hand-authored cards.** The cost of a schema break is
  thousands of lines of card JSON to migrate.
- **Multi-agent authoring.** Six parallel agents share this contract.
  Drift is silent and corrosive.
- **Runtime is session-only.** A schema mismatch at load time corrupts
  the entire deck — the user cannot recover by clearing local storage.

## 3. Locked card-type list (23)

```
TraceCard
TemplateRecallCard
StructWriteCard
FunctionWriteCard
MainWriteCard
EntityMatrixCard
AlgorithmMatrixCard
SpeedDrillCard
AdversarialMockCard
FaultInjectionCard
PreflightCheckCard
ConfidenceCalibrationCard
DAGRetryCard
DeltaCard
TestDaySimCard
VariantGenCard
ClozeCard
WalkthroughCard
DemoCard
DecomposeCard
MCQCard
ProceduralCard
PostmortemCard
```

This list is replicated in `src-v2/types/card-schema.ts` as
`CardTypes` (and its zod alias `CardTypeEnum`). The two MUST remain
identical and in identical order.

## 4. Locked Q-tag enum (4)

```
Q1   // Question-1 family (typically: trace + read-execute)
Q2   // Question-2 family (typically: struct definition + use)
Q3   // Question-3 family (typically: function-with-passing)
Q4   // Question-4 family (typically: full main + termination)
```

Every card MUST carry **at least one** Q-tag. Cards that legitimately
serve more than one question (e.g. a `WalkthroughCard` that introduces
an idiom used in Q2 and Q3) carry multiple tags.

## 5. Locked source-kind enum (4)

| `kind` | Meaning |
|---|---|
| `practice` | Past practice tests (the most authoritative reference for exam shape). |
| `v2` | The v2 design docs themselves (any file under `cpp-t2/docs/` authored for v2). |
| `pfg` | Programming for Geeks (the unit textbook). |
| `seminar` | Recorded seminars / official Deakin seminar slides. |

`ref` is a free-form string, but conventions:

- `practice` → file path + page/section, e.g. `practice/2024-T1.pdf#Q3`.
- `v2`       → file path + section anchor, e.g. `cpp-t2/docs/14_see_cards_master_plan.md#L3-S2`.
- `pfg`      → chapter + section, e.g. `pfg/ch07/sect-3`.
- `seminar`  → week + slide, e.g. `seminar/week-08/slide-12`.

## 6. Locked card-status state-machine (3 states)

```
       ┌────────┐  authoring agent attaches → ┌──────────────┐
   →   │  NEW   │  ─────────────────────────→ │ IN-PROGRESS  │
       └────────┘                             └──────────────┘
            ▲                                        │
            │ runtime resets                         │ engine declares mastery
            │ (rare; only via explicit RFC tool)     ▼
            │                                  ┌──────────────┐
            └──────────────────────────────────│   FAMILIAR   │
                                               └──────────────┘
```

Rules:

1. New cards are authored as `NEW`. (Default in the Zod schema.)
2. The runtime flips `NEW → IN-PROGRESS` on first surfacing.
3. The runtime flips `IN-PROGRESS → FAMILIAR` when the engine declares
   mastery (typically: 3+ correct in a row + atom familiarity ≥ 80%).
4. `FAMILIAR → IN-PROGRESS` is the only legal regression path; it
   happens automatically on a future failed attempt.
5. `FAMILIAR → NEW` is **forbidden** at runtime. It is reserved for
   tooling (a future "rebuild deck" RFC).
6. `IN-PROGRESS → NEW` is **forbidden** at runtime.

Authoring agents must NEVER write `FAMILIAR` or `IN-PROGRESS` to disk —
those states are runtime-only.

## 7. Locked stage / level grid

```
Level   Stage
L0      0          (foundation — no Q-track)
L1..L5  1..6       (S1..S6 within the Q-track)
```

`stage = 0` is reserved for `level = "L0"`. The combined enum forms
the `StageProgressKey` (`^L[0-5]-(L0|S[1-6])$`).

## 8. RFC procedure (how to change the schema)

To change anything frozen by §1–§7:

1. **Open an RFC file** at `cpp-t2/docs/rfc/RFC-NN-<slug>.md`.
2. **State the motivation** — what authoring or runtime requirement
   does the lock block?
3. **Propose the change** — exact diff against the Zod files.
4. **List affected callers** — every component, engine, generator, and
   linter that consumes the changed field.
5. **Migration plan** — how existing cards/atoms/sessions become valid
   under the new schema. Either (a) a one-shot migration script or
   (b) a `schemaVersion` bump (`v2 → v3`).
6. **Approval** — the user (project owner) signs off in the CHANGELOG.
7. **Implementation** — change Zod first; regenerate `SCHEMA.md`;
   update this lock file; bump `SchemaVersion` if (b) was chosen.

`schemaVersion` MUST be bumped any time a change would invalidate
existing on-disk data. Schemas with the same `schemaVersion` MUST be
backwards-compatible — additive changes only (optional fields, new
enum values, etc.) and only when callers don't break.

## 10. Deprecated fields — timers (2026-05-07)

Per the project's "deterministic flow, no time-based pressure" rule, all
timer fields are **deprecated** and the runtime ignores them. They remain
in the Zod schema as **optional** to allow legacy YAMLs to validate
without an immediate sweep.

| Card type | Deprecated field | Old type | New status |
|---|---|---|---|
| `SpeedDrillCard` | `flashSeconds` | `number().positive().max(60)` | optional, ignored |
| `SpeedDrillCard` | `targetSeconds` | `number().positive().max(120)` | optional, ignored |
| `AdversarialMockCard` | `timeLimitMinutes` | `number().positive().max(90)` | optional, ignored |
| `TestDaySimCard` | `totalTimeMinutes` | `number().positive().max(180).default(90)` | optional, ignored |

Other timer fields used elsewhere (`timeBudgetSeconds`, `budgetSeconds` —
e.g. on the now-removed `PreflightSequence` `budgetSeconds` prop) were
local component props, never on the card schema, and are simply removed.

**Rationale.**
1. Time-based pressure interferes with the schema-formation goal of the
   production-stage drills.
2. The student's exam is itself untimed at this point in the project's
   user-flow; aligning the app removes a distractor.
3. Mocks are now sequential Q1-Q4 pass-throughs; the postmortem reflects
   *what* was answered, not *how fast*.

**S6 stage rename.** S6 was previously named "SPEED" (timed full-Q under
exam clock). It is now "PRODUCTION" — full-Q drill with no time pressure.
The mastery gate stays at 90% accuracy; only the time anchor is removed.

**Migration plan.** No `schemaVersion` bump (additive: optional fields,
no caller breakage). Existing YAMLs may carry the deprecated fields
indefinitely; a future sweep removes them. New cards SHOULD NOT include
the fields.

## 11. Sign-off

Locked at the same time as the v2 schema files were created.

- **Locked by:** schema-specialist agent
- **Approved for use by:** authoring agents 1..6
- **Rule 4 acknowledgement:** no compromises. Anything that wants to
  change this contract goes through §8.
