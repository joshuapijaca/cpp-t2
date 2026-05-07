# AUDIT: Card-Type Scope Creep (cpp-t2 v2)

**Date:** 2026-05-07
**Method:** Read every component in `src-v2/components/cards/`, cross-ref with `docs/16_test2_specific_redesign_v2.md` (user vision) vs `docs/17_option4_max_quality_plan.md` (agent expansion). Counted YAML `type:` fields in `data/v2/cards/**/*.yml` (2,547 cards total).

## Sourcing of vision

- **Doc 16** (user v2.1) requested: TemplateRecallCard, StructWriteCard, FunctionWriteCard, MainWriteCard, EntityMatrixCard, AlgorithmMatrixCard, SpeedDrillCard. Plus all 10 v1 types. "Postmortem" was a *flow stage*, not a new card type.
- **Doc 17** (agent "Option 4") added 8 NEW types nowhere in user vision: AdversarialMockCard, FaultInjectionCard, PreflightCheckCard, ConfidenceCalibrationCard, DAGRetryCard, TestDaySimCard, DeltaCard, VariantGenCard. PostmortemCard also appeared as a separate type.

## Per-component verdict

| # | Component | Cards | Origin | Verdict |
|---|---|---|---|---|
| 1 | MCQCard | 517 | v1 + doc 16 | NEEDED |
| 2 | TraceCard | 337 | v1 (Q1 hand-execution) | NEEDED |
| 3 | FunctionWriteCard | 281 | doc 16 v2.1 | NEEDED |
| 4 | DecomposeCard | 229 | v1 SEE | NEEDED |
| 5 | TemplateRecallCard | 222 | doc 16 v2.1 (study/hide/type) | NEEDED |
| 6 | ClozeCard | 205 | v1 | NEEDED |
| 7 | MainWriteCard | 126 | doc 16 v2.1 | NEEDED |
| 8 | StructWriteCard | 111 | doc 16 v2.1 | NEEDED |
| 9 | SpeedDrillCard | 96 | doc 16 v2.1 (untimed mock) | NEEDED |
| 10 | DemoCard | 88 | v1 SEE | NEEDED |
| 11 | ProceduralCard | 88 | v1 | NEEDED |
| 12 | WalkthroughCard | 57 | v1 SEE | NEEDED |
| 13 | EntityMatrixCard | 10 | doc 16 v2.1 | NEEDED |
| 14 | AlgorithmMatrixCard | 0 | doc 16 v2.1 | NEEDED-but-unused (orphan) |
| 15 | **FaultInjectionCard** | **132** | doc 17 only | **OFF-SPEC** |
| 16 | **PostmortemCard** | **30** | doc 17 only (flow, not type) | **OFF-SPEC** |
| 17 | **AdversarialMockCard** | **6** | doc 17 only | **OFF-SPEC** |
| 18 | **TestDaySimCard** | **5** | doc 17 only (= SpeedDrill duplicate) | **OFF-SPEC** |
| 19 | **PreflightCheckCard** | **4** | doc 17 only (a session view) | **OFF-SPEC** |
| 20 | **DeltaCard** | **3** | doc 17 only | **OFF-SPEC** |
| 21 | **ConfidenceCalibrationCard** | **0** | doc 17 only | **OFF-SPEC orphan** |
| 22 | **DAGRetryCard** | **0** | doc 17 only (algorithm, not card) | **OFF-SPEC orphan** |
| 23 | **VariantGenCard** | **0** | doc 17 only (build-time, not runtime) | **OFF-SPEC orphan** |

**Total off-spec cards: 180 / 2,547 = 7.1%**

## File-deletion candidates (whole components)

Delete all 9 off-spec components from `src-v2/components/cards/`:

1. `AdversarialMockCard.tsx` (6 YAMLs reference it)
2. `FaultInjectionCard.tsx` (132 YAMLs)
3. `PreflightCheckCard.tsx` (4 YAMLs)
4. `ConfidenceCalibrationCard.tsx` (0 YAMLs — pure dead code)
5. `DAGRetryCard.tsx` (0 YAMLs — pure dead code)
6. `DeltaCard.tsx` (3 YAMLs)
7. `TestDaySimCard.tsx` (5 YAMLs — SpeedDrillCard already covers this)
8. `VariantGenCard.tsx` (0 YAMLs — build-time concept; no runtime UI needed)
9. `PostmortemCard.tsx` (30 YAMLs — postmortem is a *screen*, not a card)

## Migration map (180 cards to re-type)

| Off-spec | Cards | Migrate to | Why |
|---|---|---|---|
| FaultInjectionCard | 132 | TraceCard or MCQCard ("which line is wrong?") | Find-the-bug = trace + MCQ |
| PostmortemCard | 30 | DecomposeCard or WalkthroughCard | Diff-study = walkthrough |
| AdversarialMockCard | 6 | SpeedDrillCard | Hardest variant of mock = mock |
| TestDaySimCard | 5 | SpeedDrillCard | Same UX |
| PreflightCheckCard | 4 | MCQCard / SpeedDrillCard | Lightning round = mcq batch |
| DeltaCard | 3 | FunctionWriteCard / MainWriteCard | Re-write after diff = write |

## Recommendation: minimal card-type set for linear-walk app

**Keep these 14:** MCQCard, TraceCard, ClozeCard, DemoCard, DecomposeCard, WalkthroughCard, ProceduralCard, TemplateRecallCard, StructWriteCard, FunctionWriteCard, MainWriteCard, EntityMatrixCard, AlgorithmMatrixCard, SpeedDrillCard.

(That's the v1 SEE-aware set + doc-16 v2.1 additions, exactly as the user specified — nothing more.)

**Delete 9 components.** Re-type 180 cards. App stays at 2,547 cards; complexity drops ~40% in card-type surface.

Note: AlgorithmMatrixCard has 0 cards — keep the component (user requested) but author content or merge into EntityMatrixCard if matrix concept is unified.

## Why this happened

Doc 17 ("Option 4 max quality") was an agent-authored expansion plan that added 8 new card types nominally to "raise mock score variance" and "calibrate confidence." None were in the user's brief. They violate user constraint: "linear flow through cards, 4-question Q1-Q4 focus." Confidence calibration, DAG retry, and variant-gen are SRS scheduling concepts that belong in the deck engine, not as card components.

**Brutal verdict:** 9 off-spec components, 180 off-spec cards, 7% of total deck. Significant scope creep but contained — the *bulk* of the deck (2,367 cards / 92.9%) uses the 14 sanctioned types.
