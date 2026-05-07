# cpp-t2 v2 — Timer Removal (2026-05-07)

**Status:** complete. Type-check and card-lint both exit 0.

## 1. Why the timers were removed

Per project RULE 4 (no compromise) and the higher-order project rule that
**exam time is unbounded** for the student's situation, the v2 deck must
deliver a deterministic flow with no time-based pressure anywhere.

Three concrete reasons:

1. **Time-pressure interferes with schema formation.** S1-S5 already work
   without timers because the goal is to lay down the canonical pattern;
   S6 was the only stage that previously imposed a clock. Treating S6 the
   same way removes the only remaining "drill against a stopwatch" drag.
2. **Adversarial != fast.** The `AdversarialMockCard` was meant to drill
   the *hardest content* (worst-case structs, edge-case data). The
   per-card timer was orthogonal to that goal and added cognitive load
   that wasn't being measured for.
3. **The user-facing exam itself is untimed at this point.** Aligning the
   app removes a distractor and keeps the postmortem focused on
   correctness rather than seconds spent.

## 2. What was removed

### 2.1 Card components (5 files)

| File | What changed |
|---|---|
| `src-v2/components/cards/SpeedDrillCard.tsx` | Stripped flash phase + countdown + urgency colors + time-pulse animation. Replaced with a simple recall + grade flow with a Submit button. Optional canonical-answer reveal added for stuck students. |
| `src-v2/components/cards/AdversarialMockCard.tsx` | Stripped per-card countdown timer + over-time pulse + the `timerSeconds` prop. Submit-when-ready. |
| `src-v2/components/cards/TestDaySimCard.tsx` | Stripped global countdown clock + low/over-time states + `running` state machine. Q1-Q4 sequential tabs only; submit-when-ready. |
| `src-v2/components/cards/PreflightCheckCard.tsx` (`PreflightSequence`) | Stripped per-card seconds budget + auto-fail on budget=0 + `pfs-timer` UI. Per-card explicit `skip` button replaces the auto-advance behavior. |
| `src-v2/pages/Mock.tsx` | Stripped the 90-min countdown header + colour stages + auto-submit-on-zero. Replaced with a static "MOCK Q1-Q4 — work through, submit when done." header. `MockPaper.totalMinutes` removed. |

### 2.2 Card-schema fields (4 fields, optional + ignored)

In `src-v2/types/card-schema.ts`, the following Zod fields are now
`.optional()` (was: required), with a `@deprecated` JSDoc and a pointer
to `SCHEMA_LOCK.md` §10:

| Card type | Field |
|---|---|
| `SpeedDrillCard` | `flashSeconds` |
| `SpeedDrillCard` | `targetSeconds` |
| `AdversarialMockCard` | `timeLimitMinutes` |
| `TestDaySimCard` | `totalTimeMinutes` |

The runtime never reads them. They remain in the schema only so that the
115 legacy YAMLs (now stripped) and any future legacy carry-over still
validate without an emergency migration. **No `schemaVersion` bump** —
the change is purely additive (required → optional) and no caller
breaks. `SCHEMA_LOCK.md` §10 documents the deprecation in detail.

### 2.3 Card YAMLs (115 files, 219 field-lines removed)

The PowerShell sweep against `data/v2/cards/**/*.yml` and
`data/v2/mocks/*.yml` removed the following field-lines:

| Field | Removals |
|---|---|
| `flashSeconds` | 104 |
| `targetSeconds` | 104 |
| `timeLimitMinutes` | 6 |
| `totalTimeMinutes` | 5 |
| `timeBudgetSeconds` | 0 (none in deck) |
| `budgetSeconds` | 0 (component prop only, never on card) |
| **Total** | **219** |

Files touched: 115. Card structure preserved; only those keys deleted.

### 2.4 Doc sections (4 docs)

| Doc | What changed |
|---|---|
| `docs/16_test2_specific_redesign_v2.md` | §1.3 Stage Pattern: S6 row flipped from "SPEED · Timed full-Q under exam clock · 90% under-time" to "PRODUCTION · Full-Q at student's own pace · 90% accuracy". §3.7 retitled "S6 PRODUCTION", time columns dropped. §3.1, §4.3, §5.2, §5.3, §6.2, §7.1 S6 row labels flipped. §7.3 SpeedDrillCard UX block stripped of countdown header + Timer line. §9.3 UX-decision table: "Speed cards" → "Production cards" (no countdown), "Timed pressure" row reads "None — timer system removed 2026-05-07", "Test-day countdown" row removed. v2.1 changelog at top reflects the removal. |
| `docs/17_option4_max_quality_plan.md` | "SpeedDrill (timed mock)" row → "SpeedDrill (production drill, untimed)". CC-8 row "+ countdown + tabs" → "+ Q1-Q4 tabs (no timer)". UX-3 row "countdown" removed. **F7** (test-day sim time-of-day) softened to "no time-of-day gating, no clock". **F10** (Speed progression curve, S4 = 2× pace etc.) **retired** with cross-reference to the new no-timer policy. |
| `docs/18_option4_milestone_plan.md` | LAYER 3 renamed SPEED → PRODUCTION. Mock layer text "Mock untimed → Mock 90 min → Mock 72 min" → "Mock #1 → Mock #2 → Robust mock (all untimed)". KP-M21 "Mock #2 (90 min)" → "Mock #2"; KP-M22 "Speed +20% / ≤72 min" → "Robust / 2 mocks ≥85%". UX-M12 "Big timer + urgency color sweep" stripped; UX-M16 "90-min timer, no escape" → "no timer, autosave on tab switch". QA-M32 "Mock paper speed / Median ≤80 min" → "Mock paper completion / Median completed ≥85% rubric". PRE-3 "Full Q1-Q4, 90 min, 11am exact" → "sequential pass-through, untimed". |
| `docs/v2/02_FINAL_GA.md` | QA-M17 + QA-M32 lines reframed as completion gates rather than speed gates; learner-confidence and Day-7 plan rephrased to match (no "Speed median <80 min" language). |

### 2.5 VSCode-sim → "code editor" rename

Sweep across `src-v2/`, `docs/`, `data/v2/` for the 12 forms listed in
the task spec (`VSCode-sim`, `VSCode sim`, `VSCode-debugger`,
`VSCode debugger`, `VSCode-simulator`, `VSCode simulator`, `VS Code sim`,
`VS Code-sim`, plus `VS Code-...` variants). 8 files touched, 33
replacements. Comments referencing the pattern now read "syntax-highlighted
code editor with brace match + variables panel" or similar plain-English
descriptions.

The append-only `CHANGELOG.md` and `data/v2/agent-ledger.jsonl` were
left alone (historical record). The PFG textbook source under
`source-data/pfg-content/` was left alone (it teaches the actual VS Code
editor product to the student; that's not our jargon).

## 3. What remains in S6

S6 is now the **production** stage: full-question drills that exercise
the whole Q1/Q2/Q3/Q4 pipeline end-to-end **without time pressure**.

- **Same content**: warmup variants, real-exam reps, mixed mocks, full Q
  mocks. Card counts unchanged (Q1: 34, Q2: 20, Q3: 20, Q4: 25).
- **Same mastery gate** numerically: 90%. Only the *anchor* changes —
  the gate is now 90% accuracy on the deck, not 90% under-time.
- **Same card type**: `SpeedDrillCard` (the Zod literal stays — it's
  locked in `CardTypes`). The component name stays. Only the *behavior*
  changes: no flash phase, no countdown, no urgency color sweep, no
  auto-grade on budget=0.

The deck-level naming in the docs flips from "SPEED" to "PRODUCTION"
(in the S1..S6 table and the per-Q-track stage tables) so the student
reads the right mental frame, but no card-type rename is needed.

## 4. Verification

```
$ npx tsc --noEmit -p src-v2/
(exit 0)

$ npx tsx build-v2/lint-cards.ts
[lint:v2-cards] 0 error(s), 389 warning(s)
(exit 0)
```

The 389 warnings are all pre-existing (matching the GA report's count) —
mostly `word-memorize-suspect` flags on short MCQ stems and
`no-semicolon` flags on partial-line cloze cards. None of them are
timer-related.

## 5. Cross-references

- `data/v2/SCHEMA_LOCK.md` §10 — formal deprecation declaration for the
  4 timer fields, with migration plan (no `schemaVersion` bump).
- `data/v2/agent-ledger.jsonl` line 48 — `TIMER-RM` entry with the full
  modified-files list, removal counts, and verification result.
- `docs/16_test2_specific_redesign_v2.md` v2.1 changelog block at top —
  user-facing summary of the policy.
