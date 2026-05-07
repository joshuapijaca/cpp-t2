# cpp-t2 v2 Schema (human-readable)

> **Companion:** [`SCHEMA_LOCK.md`](./SCHEMA_LOCK.md) — declares the lock,
> lists every enum, defines the status state-machine, and contains the
> RFC procedure for changing this schema.
>
> **Source-of-truth Zod files:**
> - [`src-v2/types/card-schema.ts`](../../src-v2/types/card-schema.ts)
> - [`src-v2/types/atom.ts`](../../src-v2/types/atom.ts)
> - [`src-v2/types/student.ts`](../../src-v2/types/student.ts)

This document is the human-readable reference. The Zod files are the
machine-readable contract. **If they disagree, the Zod files win.**

---

## 1. Goal

The Option-4 max-quality build authors **4,600 cards** by hand across
6 design levels (`L0`..`L5`), spanning **23 card types**, anchored to
**30+ atoms** (`F-01..F-22` + sub-atom splits + algorithm/entity
extensions). Every card carries a **Q-tag set** (1+ of `Q1`..`Q4`) and
a **source citation** pointing to the document that justifies it.

The schema below is the contract every authoring agent, generator,
linter, and runtime engine must respect.

## 2. Top-level shapes

### 2.1 `Card` (discriminated union over 23 types)

```
Card = TraceCard
     | TemplateRecallCard
     | StructWriteCard
     | FunctionWriteCard
     | MainWriteCard
     | EntityMatrixCard
     | AlgorithmMatrixCard
     | SpeedDrillCard
     | AdversarialMockCard
     | FaultInjectionCard
     | PreflightCheckCard
     | ConfidenceCalibrationCard
     | DAGRetryCard
     | DeltaCard
     | TestDaySimCard
     | VariantGenCard
     | ClozeCard
     | WalkthroughCard
     | DemoCard
     | DecomposeCard
     | MCQCard
     | ProceduralCard
     | PostmortemCard
```

Discriminator: `type`. Every variant carries the **common fields**
listed in 2.2 below plus type-specific fields listed in §3.

### 2.2 Common fields (every card)

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | Globally unique within the deck. |
| `schemaVersion` | `"v2"` | Literal. Bump only via RFC. |
| `atomId` | `AtomId` | Matches `^[A-Z]-\d{2}[a-z]?$` or `^A\d+$`. |
| `qTags` | `QTag[]` | 1+ of `Q1` `Q2` `Q3` `Q4`. |
| `stage` | `Stage` | `0` = L0 foundation, `1..6` = `S1..S6`. |
| `level` | `Level` | `L0`..`L5`. |
| `type` | `CardType` | Discriminator literal. |
| `stem` | `string` | Short prompt label / index entry. |
| `source` | `SourceCitation` | `{ kind, ref }`. |
| `commonMistakeIds` | `CommonMistakeId[]` | Pointers to the catalogue. |
| `status` | `CardStatus` | `NEW` / `IN-PROGRESS` / `FAMILIAR`. |
| `createdBy` | `AgentId` | Authoring agent ID. |
| `reviewedBy` | `AgentId[]` | Optional review chain. |
| `approvedBy` | `AgentId?` | Set when card is final. |
| `notes` | `string?` | Author notes (not shown to student). |

### 2.3 Primitive types

```
SchemaVersion       = "v2"
AtomId              = matches /^[A-Z]-\d{2}[a-z]?$|^A\d+$/
QTag                = "Q1" | "Q2" | "Q3" | "Q4"
Stage               = 0 | 1 | 2 | 3 | 4 | 5 | 6
Level               = "L0" | "L1" | "L2" | "L3" | "L4" | "L5"
CardStatus          = "NEW" | "IN-PROGRESS" | "FAMILIAR"
CommonMistakeId     = matches /^CM-[A-Za-z0-9_-]+$/
AgentId             = string, length 1..64
SourceCitation      = { kind: "practice"|"v2"|"pfg"|"seminar", ref: string }
```

### 2.4 `Atom`

| Field | Type | Notes |
|---|---|---|
| `id` | `AtomId` | Unique. |
| `name` | `string` | Human-readable label. |
| `level` | `Level` | `L0`..`L5`. |
| `prereqs` | `AtomId[]` | DAG edges. |
| `usedByQs` | `QTag[]` | 1+. |
| `commonMistakeIds` | `CommonMistakeId[]` | Catalogue refs. |
| `cardCountTarget` | `int > 0` | Authoring budget. |
| `exposureTarget` | `{short:6, medium:8, long:12}` | Defaults shown. |
| `source` | `SourceCitation` | Canonical-definition pointer. |
| `description` | `string?` | Optional. |
| `canonicalExample` | `string?` | Optional snippet. |
| `notes` | `string?` | Author notes. |

### 2.5 `StudentSession`

| Field | Type | Notes |
|---|---|---|
| `sessionId` | `string` | Unique per session. |
| `startedAt` | `string` | ISO-8601. |
| `atomFamiliarity` | `Record<atomId, percent>` | 0..100. |
| `cardExposures` | `Record<cardId, count>` | Total times shown. |
| `cardCorrect` | `Record<cardId, boolean[]>` | Sliding window of correctness. |
| `stageProgress` | `Record<"L<n>-<S<m>|L0>", percent>` | 0..100. |
| `weaknessFile` | `WeaknessEntry[]` | Append-only this session. |
| `cardStatus` | `Record<cardId, CardStatus>` | Cached snapshot. |
| `updatedAt` | `string?` | ISO-8601. |

`WeaknessEntry`:
```
{ atomId, cardId, qTag, reason, severity (0..1), timestamp }
```

## 3. Type-specific fields (per-card-type cheat sheet)

Only the **type-specific** payload is listed below. Common fields apply
to every card.

| # | Type | Key payload |
|---|---|---|
| 1 | `TraceCard` | `code`, `variables`, `expectedTrace[]`, `userInputs`, `terminalOutput`, `inputMode`, `q4StopCondition?`, `teachMe?` |
| 2 | `TemplateRecallCard` | `prompt`, `template`, `canonicalAnswer`, `keyChecks`, `forbiddenTokens`, `explanation` |
| 3 | `StructWriteCard` | `prompt`, `canonicalAnswer`, `keyChecks`, `forbiddenTokens`, `requiredFields`, `explanation` |
| 4 | `FunctionWriteCard` | `prompt`, `signatureHint?`, `canonicalAnswer`, `keyChecks`, `forbiddenTokens`, `passByRefRequired`, `explanation` |
| 5 | `MainWriteCard` | `prompt`, `canonicalAnswer`, `keyChecks`, `forbiddenTokens`, `expectedTerminal`, `explanation` |
| 6 | `EntityMatrixCard` | `examples[]`, `prompt`, `canonicalAnswer`, `keyChecks`, `explanation` |
| 7 | `AlgorithmMatrixCard` | `examples[]`, `prompt`, `canonicalAnswer`, `keyChecks`, `explanation` |
| 8 | `SpeedDrillCard` | `prompt`, `canonicalAnswer`, `keyChecks`, `flashSeconds`, `targetSeconds`, `explanation` |
| 9 | `AdversarialMockCard` | `questionNumber`, `fullPrompt`, `canonicalAnswer`, `rubric`, `timeLimitMinutes`, `explanation` |
| 10 | `FaultInjectionCard` | `brokenCode`, `bugLocations[]`, `fixedCode`, `bugCategory`, `keyChecks`, `explanation` |
| 11 | `PreflightCheckCard` | `checklist[]`, `scenario`, `explanation` |
| 12 | `ConfidenceCalibrationCard` | `prompt`, `canonicalAnswer`, `confidenceLevels[]`, `keyChecks`, `explanation` |
| 13 | `DAGRetryCard` | `prerequisiteAtomIds[]`, `failedCardId`, `prompt`, `canonicalAnswer`, `keyChecks`, `explanation` |
| 14 | `DeltaCard` | `codeA`, `codeB`, `prompt`, `canonicalAnswer`, `keyChecks`, `explanation` |
| 15 | `TestDaySimCard` | `questionSet[4]`, `totalTimeMinutes`, `explanation` |
| 16 | `VariantGenCard` | `seedCode`, `variantCount`, `constraints[]`, `canonicalVariants[]`, `keyChecks`, `explanation` |
| 17 | `ClozeCard` | `code`, `clozeSentence`, `answer`, `explanation` |
| 18 | `WalkthroughCard` | `levelLabel`, `fullCode`, `steps[]` |
| 19 | `DemoCard` | `whyOneLine`, `demoCode`, `highlightTokens`, `usedIn` |
| 20 | `DecomposeCard` | `code`, `question`, `options[4]`, `correctLabel`, `explanation` |
| 21 | `MCQCard` | `correct`, `distractors[3]`, `explanation` |
| 22 | `ProceduralCard` | `section`, `prompt`, `expectedAnswer`, `keyChecks`, `variants[]` |
| 23 | `PostmortemCard` | `failedAttempt`, `diagnosis`, `repairSteps[]`, `preventionTip`, `explanation` |

## 4. Validation expectations

- **Build-time:** every JSON file under `data/v2/cards/` MUST validate
  against `CardArray`. The build fails if any card mismatches.
- **Runtime:** `src-v2/lib/load-cards.ts` MUST `Card.parse` each entry
  on load. Invalid entries are dropped + logged; the deck does not
  silently degrade.
- **Authoring:** every authoring agent must set `createdBy`. Reviewer
  agents append to `reviewedBy`. The approver writes `approvedBy` and
  flips `status` to `IN-PROGRESS`. `FAMILIAR` is set by the runtime
  engine — never by an authoring agent.

## 5. See also

- [`SCHEMA_LOCK.md`](./SCHEMA_LOCK.md) — lock declaration + RFC procedure
- `src-v2/types/card-schema.ts` — Zod source-of-truth (cards)
- `src-v2/types/atom.ts` — Zod source-of-truth (atoms)
- `src-v2/types/student.ts` — Zod source-of-truth (session state)
