// =====================================================================
// cpp-t2 / src-v2 / types / card-schema.ts
// LOCKED v2 card schema — see data/v2/SCHEMA_LOCK.md
// =====================================================================
//
// Source-of-truth Zod schema for the Option-4 max-quality build:
//   - 4,600 hand-authored cards across 6 levels (L0..L5)
//   - 23 card types in a discriminated union over `type`
//   - 30+ atom IDs (F-01..F-22 + sub-atom suffixes + algorithm/entity ext.)
//   - Multi-Q tagging: every card carries 1+ of [Q1, Q2, Q3, Q4]
//   - Source citations: practice / v2 / pfg / seminar
//
// SCHEMA VERSION: "v2".
// LOCKED. Any change to the shape of Card / Atom / Student requires an
// RFC entry per data/v2/SCHEMA_LOCK.md and a bump to SchemaVersion.
//
// IMPORTANT: install peer dep `zod` (`npm install zod`) before consuming.
// All v2 build/runtime code MUST validate against these schemas at the
// JSON-load boundary (build/lint-cards-v2.ts + src-v2/lib/load-cards.ts).
// =====================================================================

import { z } from 'zod';

// ---------------------------------------------------------------------
// Primitive shared types
// ---------------------------------------------------------------------

/** Schema version literal — bumped only via RFC. */
export const SchemaVersion = z.literal('v2');
export type SchemaVersion = z.infer<typeof SchemaVersion>;

/**
 * Atom ID format:
 *   - Foundation atoms:     F-01 .. F-22         e.g. "F-07"
 *   - Sub-atom splits:      F-XXa, F-XXb, ...    e.g. "F-07a"
 *   - Algorithm/entity ext: A1, A2, A3, ...      e.g. "A12"
 *
 * The leading-letter form (`[A-Z]-\d{2}[a-z]?`) covers the F- family
 * and any future Q-track / S-track families. The bare `A\d+` form
 * handles algorithm/entity sub-skills.
 */
export const AtomId = z
  .string()
  .regex(/^[A-Z]-\d{2}[a-z]?$|^A\d+$/, {
    message:
      'AtomId must match `^[A-Z]-\\d{2}[a-z]?$` (e.g. F-07, F-07a) or `^A\\d+$` (e.g. A12).',
  });
export type AtomId = z.infer<typeof AtomId>;

/** Q-tag enum — every card lights up 1+ exam questions. */
export const QTag = z.enum(['Q1', 'Q2', 'Q3', 'Q4']);
export type QTag = z.infer<typeof QTag>;

/**
 * Stage enum for placement within the L0..L5 + S1..S6 grid.
 *   - 0 = L0 foundation (level-wide pre-requisite work, no Q-track)
 *   - 1..6 = S1..S6 inside a Q-track (within-level progression)
 */
export const Stage = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]);
export type Stage = z.infer<typeof Stage>;

/** Level enum: L0..L5 (the 6 design levels for the Option-4 build). */
export const Level = z.enum(['L0', 'L1', 'L2', 'L3', 'L4', 'L5']);
export type Level = z.infer<typeof Level>;

/** Source-of-truth citation. `ref` is a free-form pointer (file path,
 *  page number, seminar week, etc.) but should be stable + unambiguous. */
export const SourceCitation = z.object({
  kind: z.enum(['practice', 'v2', 'pfg', 'seminar']),
  ref: z.string().min(1),
});
export type SourceCitation = z.infer<typeof SourceCitation>;

/** Card lifecycle status — see SCHEMA_LOCK.md for state-machine. */
export const CardStatus = z.enum(['NEW', 'IN-PROGRESS', 'FAMILIAR']);
export type CardStatus = z.infer<typeof CardStatus>;

/** Common-mistake catalogue ID. Free-form prefix (`CM-...`) but stable. */
export const CommonMistakeId = z.string().regex(/^CM-[A-Za-z0-9_-]+$/, {
  message: 'CommonMistakeId must look like `CM-...` (alnum/underscore/hyphen).',
});
export type CommonMistakeId = z.infer<typeof CommonMistakeId>;

/** Agent ID for createdBy / reviewedBy / approvedBy provenance. */
export const AgentId = z.string().min(1).max(64);
export type AgentId = z.infer<typeof AgentId>;

// ---------------------------------------------------------------------
// Card-type discriminator literal — single source of truth.
// ---------------------------------------------------------------------

export const CardTypes = [
  'TraceCard',
  'TemplateRecallCard',
  'StructWriteCard',
  'FunctionWriteCard',
  'MainWriteCard',
  'EntityMatrixCard',
  'AlgorithmMatrixCard',
  'SpeedDrillCard',
  'AdversarialMockCard',
  'FaultInjectionCard',
  'PreflightCheckCard',
  'ConfidenceCalibrationCard',
  'DAGRetryCard',
  'DeltaCard',
  'TestDaySimCard',
  'VariantGenCard',
  'ClozeCard',
  'WalkthroughCard',
  'DemoCard',
  'DecomposeCard',
  'MCQCard',
  'ProceduralCard',
  'PostmortemCard',
] as const;
export const CardTypeEnum = z.enum(CardTypes);
export type CardType = z.infer<typeof CardTypeEnum>;

// ---------------------------------------------------------------------
// Common-fields base — every card extends this.
// ---------------------------------------------------------------------

const CommonCardFields = z.object({
  id: z.string().min(1),
  schemaVersion: SchemaVersion,
  atomId: AtomId,
  qTags: z.array(QTag).min(1),
  stage: Stage,
  level: Level,
  type: CardTypeEnum,
  stem: z.string().min(1),
  source: SourceCitation,
  commonMistakeIds: z.array(CommonMistakeId).default([]),
  status: CardStatus.default('NEW'),
  createdBy: AgentId,
  reviewedBy: z.array(AgentId).default([]),
  approvedBy: AgentId.optional(),
  notes: z.string().optional(),
});

// ---------------------------------------------------------------------
// Re-usable nested shapes
// ---------------------------------------------------------------------

const TraceStep = z.object({
  line: z.number().int().nonnegative(),
  variable: z.string(), // "" allowed for output-only steps
  value: z.string(),
  output: z.string().nullable().optional(),
  condition: z.string().nullable().optional(),
});

const MCQOption = z.object({
  label: z.string().min(1),
  text: z.string().min(1),
});

const KeyChecks = z.array(z.string().min(1)).default([]);
const ForbiddenTokens = z.array(z.string().min(1)).default([]);

// ---------------------------------------------------------------------
// 1. TraceCard — hand-execute code, fill memory + terminal output.
// ---------------------------------------------------------------------
export const TraceCard = CommonCardFields.extend({
  type: z.literal('TraceCard'),
  code: z.string().min(1),
  variables: z.array(z.string()).default([]),
  expectedTrace: z.array(TraceStep).min(1),
  userInputs: z.array(z.string()).default([]),
  inputLabels: z.array(z.string()).default([]),
  terminalOutput: z.array(z.string()).default([]),
  inputMode: z.enum(['per-step', 'final-only']).default('final-only'),
  q4StopCondition: z.string().optional(),
  teachMe: z.string().optional(),
});

// ---------------------------------------------------------------------
// 2. TemplateRecallCard — fill the canonical skeleton from prompt.
// ---------------------------------------------------------------------
export const TemplateRecallCard = CommonCardFields.extend({
  type: z.literal('TemplateRecallCard'),
  prompt: z.string().min(1),
  template: z.string().min(1),
  canonicalAnswer: z.string().min(1),
  keyChecks: KeyChecks,
  forbiddenTokens: ForbiddenTokens,
  explanation: z.string().min(1),
});

// ---------------------------------------------------------------------
// 3. StructWriteCard — write a `struct` definition from prompt.
// ---------------------------------------------------------------------
export const StructWriteCard = CommonCardFields.extend({
  type: z.literal('StructWriteCard'),
  prompt: z.string().min(1),
  canonicalAnswer: z.string().min(1),
  keyChecks: KeyChecks,
  forbiddenTokens: ForbiddenTokens,
  explanation: z.string().min(1),
  requiredFields: z.array(z.string()).default([]),
});

// ---------------------------------------------------------------------
// 4. FunctionWriteCard — write a function (signature + body) from spec.
// ---------------------------------------------------------------------
export const FunctionWriteCard = CommonCardFields.extend({
  type: z.literal('FunctionWriteCard'),
  prompt: z.string().min(1),
  signatureHint: z.string().optional(),
  canonicalAnswer: z.string().min(1),
  keyChecks: KeyChecks,
  forbiddenTokens: ForbiddenTokens,
  explanation: z.string().min(1),
  passByRefRequired: z.boolean().default(false),
});

// ---------------------------------------------------------------------
// 5. MainWriteCard — write a complete `int main()` from spec.
// ---------------------------------------------------------------------
export const MainWriteCard = CommonCardFields.extend({
  type: z.literal('MainWriteCard'),
  prompt: z.string().min(1),
  canonicalAnswer: z.string().min(1),
  keyChecks: KeyChecks,
  forbiddenTokens: ForbiddenTokens,
  explanation: z.string().min(1),
  expectedTerminal: z.array(z.string()).default([]),
});

// ---------------------------------------------------------------------
// 6. EntityMatrixCard — RAVEN-style transfer over entity (struct) shapes.
// ---------------------------------------------------------------------
export const EntityMatrixCard = CommonCardFields.extend({
  type: z.literal('EntityMatrixCard'),
  examples: z.array(MCQOption).min(1), // {label, text} = {label, code-snippet}
  prompt: z.string().min(1),
  canonicalAnswer: z.string().min(1),
  keyChecks: KeyChecks,
  explanation: z.string().min(1),
});

// ---------------------------------------------------------------------
// 7. AlgorithmMatrixCard — RAVEN-style transfer over algorithm shapes.
// ---------------------------------------------------------------------
export const AlgorithmMatrixCard = CommonCardFields.extend({
  type: z.literal('AlgorithmMatrixCard'),
  examples: z.array(MCQOption).min(1),
  prompt: z.string().min(1),
  canonicalAnswer: z.string().min(1),
  keyChecks: KeyChecks,
  explanation: z.string().min(1),
});

// ---------------------------------------------------------------------
// 8. SpeedDrillCard — production-stage recall (full-Q drill, untimed).
//
// Timer fields (`flashSeconds`, `targetSeconds`) are deprecated and
// optional. The runtime ignores them. Existing YAMLs may still carry
// them harmlessly until they are stripped. See SCHEMA_LOCK.md §10.
// ---------------------------------------------------------------------
export const SpeedDrillCard = CommonCardFields.extend({
  type: z.literal('SpeedDrillCard'),
  prompt: z.string().min(1),
  canonicalAnswer: z.string().min(1),
  keyChecks: KeyChecks,
  /** @deprecated 2026-05-07 — timers removed; runtime ignores. */
  flashSeconds: z.number().positive().max(60).optional(),
  /** @deprecated 2026-05-07 — timers removed; runtime ignores. */
  targetSeconds: z.number().positive().max(120).optional(),
  explanation: z.string().min(1),
});

// ---------------------------------------------------------------------
// 9. AdversarialMockCard — hardest-content full-question mock (untimed).
//
// `timeLimitMinutes` is deprecated and optional. The runtime never
// applies a per-card time limit — adversarial means content difficulty,
// not time pressure. See SCHEMA_LOCK.md §10.
// ---------------------------------------------------------------------
export const AdversarialMockCard = CommonCardFields.extend({
  type: z.literal('AdversarialMockCard'),
  questionNumber: z.enum(['Q1', 'Q2', 'Q3', 'Q4']),
  fullPrompt: z.string().min(1),
  canonicalAnswer: z.string().min(1),
  rubric: z.array(z.string()).default([]),
  /** @deprecated 2026-05-07 — timers removed; runtime ignores. */
  timeLimitMinutes: z.number().positive().max(90).optional(),
  explanation: z.string().min(1),
});

// ---------------------------------------------------------------------
// 10. FaultInjectionCard — "this code is broken — find/fix the bug."
// ---------------------------------------------------------------------
export const FaultInjectionCard = CommonCardFields.extend({
  type: z.literal('FaultInjectionCard'),
  brokenCode: z.string().min(1),
  bugLocations: z.array(z.number().int().nonnegative()).min(1),
  fixedCode: z.string().min(1),
  bugCategory: z.string().min(1), // e.g. "missing &", "wrong operator", "off-by-one"
  keyChecks: KeyChecks,
  explanation: z.string().min(1),
});

// ---------------------------------------------------------------------
// 11. PreflightCheckCard — pre-attempt checklist drill (warm-up).
// ---------------------------------------------------------------------
export const PreflightCheckCard = CommonCardFields.extend({
  type: z.literal('PreflightCheckCard'),
  checklist: z.array(z.string().min(1)).min(1),
  scenario: z.string().min(1),
  explanation: z.string().min(1),
});

// ---------------------------------------------------------------------
// 12. ConfidenceCalibrationCard — predict-then-verify on accuracy.
// ---------------------------------------------------------------------
export const ConfidenceCalibrationCard = CommonCardFields.extend({
  type: z.literal('ConfidenceCalibrationCard'),
  prompt: z.string().min(1),
  canonicalAnswer: z.string().min(1),
  confidenceLevels: z
    .array(z.number().int().min(0).max(100))
    .min(2)
    .default([25, 50, 75, 95]),
  keyChecks: KeyChecks,
  explanation: z.string().min(1),
});

// ---------------------------------------------------------------------
// 13. DAGRetryCard — surfaced retry tied to a prerequisite atom edge.
// ---------------------------------------------------------------------
export const DAGRetryCard = CommonCardFields.extend({
  type: z.literal('DAGRetryCard'),
  prerequisiteAtomIds: z.array(AtomId).min(1),
  failedCardId: z.string().min(1),
  prompt: z.string().min(1),
  canonicalAnswer: z.string().min(1),
  keyChecks: KeyChecks,
  explanation: z.string().min(1),
});

// ---------------------------------------------------------------------
// 14. DeltaCard — "what's different between A and B?" comparison drill.
// ---------------------------------------------------------------------
export const DeltaCard = CommonCardFields.extend({
  type: z.literal('DeltaCard'),
  codeA: z.string().min(1),
  codeB: z.string().min(1),
  prompt: z.string().min(1), // e.g. "list every difference"
  canonicalAnswer: z.string().min(1),
  keyChecks: KeyChecks,
  explanation: z.string().min(1),
});

// ---------------------------------------------------------------------
// 15. TestDaySimCard — exam-day full simulation (chained Q1-Q4, untimed).
//
// `totalTimeMinutes` is deprecated and optional. The runtime renders Q1-Q4
// sequentially with no global countdown. See SCHEMA_LOCK.md §10.
// ---------------------------------------------------------------------
export const TestDaySimCard = CommonCardFields.extend({
  type: z.literal('TestDaySimCard'),
  questionSet: z
    .array(
      z.object({
        questionNumber: z.enum(['Q1', 'Q2', 'Q3', 'Q4']),
        prompt: z.string().min(1),
        canonicalAnswer: z.string().min(1),
        rubric: z.array(z.string()).default([]),
      })
    )
    .length(4),
  /** @deprecated 2026-05-07 — timers removed; runtime ignores. */
  totalTimeMinutes: z.number().positive().max(180).optional(),
  explanation: z.string().min(1),
});

// ---------------------------------------------------------------------
// 16. VariantGenCard — "produce N working variants of this idiom."
// ---------------------------------------------------------------------
export const VariantGenCard = CommonCardFields.extend({
  type: z.literal('VariantGenCard'),
  seedCode: z.string().min(1),
  variantCount: z.number().int().min(2).max(10),
  constraints: z.array(z.string()).default([]),
  canonicalVariants: z.array(z.string().min(1)).min(2),
  keyChecks: KeyChecks,
  explanation: z.string().min(1),
});

// ---------------------------------------------------------------------
// 17. ClozeCard — fill-in-the-blank over a code/sentence template.
// ---------------------------------------------------------------------
export const ClozeCard = CommonCardFields.extend({
  type: z.literal('ClozeCard'),
  code: z.string().min(1),
  clozeSentence: z.string().min(1),
  answer: z.string().min(1),
  explanation: z.string().min(1),
});

// ---------------------------------------------------------------------
// 18. WalkthroughCard — annotated walk-through of a worked example.
// ---------------------------------------------------------------------
export const WalkthroughCard = CommonCardFields.extend({
  type: z.literal('WalkthroughCard'),
  levelLabel: z.string().min(1),
  fullCode: z.string().min(1),
  steps: z
    .array(
      z.object({
        line: z.number().int().nonnegative(),
        code: z.string().min(1),
        annotation: z.string().min(1),
        atomIds: z.array(AtomId).default([]),
      })
    )
    .min(1),
});

// ---------------------------------------------------------------------
// 19. DemoCard — "watch how" / passive-observation card.
// ---------------------------------------------------------------------
export const DemoCard = CommonCardFields.extend({
  type: z.literal('DemoCard'),
  whyOneLine: z.string().min(1),
  demoCode: z.string().min(1),
  highlightTokens: z.array(z.string()).default([]),
  usedIn: z.array(z.string()).default([]),
});

// ---------------------------------------------------------------------
// 20. DecomposeCard — A/B/C/D pick-the-correct-explanation MCQ.
// ---------------------------------------------------------------------
export const DecomposeCard = CommonCardFields.extend({
  type: z.literal('DecomposeCard'),
  code: z.string().min(1),
  question: z.string().min(1),
  options: z.array(MCQOption).length(4),
  correctLabel: z.string().min(1),
  explanation: z.string().min(1),
});

// ---------------------------------------------------------------------
// 21. MCQCard — single-correct multi-choice question.
// ---------------------------------------------------------------------
export const MCQCard = CommonCardFields.extend({
  type: z.literal('MCQCard'),
  correct: z.string().min(1),
  distractors: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1)]),
  explanation: z.string().min(1),
});

// ---------------------------------------------------------------------
// 22. ProceduralCard — produce code from prompt; supports variants.
// ---------------------------------------------------------------------
export const ProceduralCard = CommonCardFields.extend({
  type: z.literal('ProceduralCard'),
  section: z.string().min(1),
  prompt: z.string().min(1),
  expectedAnswer: z.string().min(1),
  keyChecks: KeyChecks,
  variants: z
    .array(
      z.object({
        prompt: z.string().min(1),
        expectedAnswer: z.string().min(1),
      })
    )
    .default([]),
});

// ---------------------------------------------------------------------
// 23. PostmortemCard — "explain what went wrong + how to repair."
// ---------------------------------------------------------------------
export const PostmortemCard = CommonCardFields.extend({
  type: z.literal('PostmortemCard'),
  failedAttempt: z.string().min(1),
  diagnosis: z.string().min(1),
  repairSteps: z.array(z.string().min(1)).min(1),
  preventionTip: z.string().min(1),
  explanation: z.string().min(1),
});

// ---------------------------------------------------------------------
// Discriminated union — THE canonical Card type.
// ---------------------------------------------------------------------

export const Card = z.discriminatedUnion('type', [
  TraceCard,
  TemplateRecallCard,
  StructWriteCard,
  FunctionWriteCard,
  MainWriteCard,
  EntityMatrixCard,
  AlgorithmMatrixCard,
  SpeedDrillCard,
  AdversarialMockCard,
  FaultInjectionCard,
  PreflightCheckCard,
  ConfidenceCalibrationCard,
  DAGRetryCard,
  DeltaCard,
  TestDaySimCard,
  VariantGenCard,
  ClozeCard,
  WalkthroughCard,
  DemoCard,
  DecomposeCard,
  MCQCard,
  ProceduralCard,
  PostmortemCard,
]);
export type Card = z.infer<typeof Card>;

/** Per-type inferred TS aliases (handy for components / engines). */
export type TraceCard = z.infer<typeof TraceCard>;
export type TemplateRecallCard = z.infer<typeof TemplateRecallCard>;
export type StructWriteCard = z.infer<typeof StructWriteCard>;
export type FunctionWriteCard = z.infer<typeof FunctionWriteCard>;
export type MainWriteCard = z.infer<typeof MainWriteCard>;
export type EntityMatrixCard = z.infer<typeof EntityMatrixCard>;
export type AlgorithmMatrixCard = z.infer<typeof AlgorithmMatrixCard>;
export type SpeedDrillCard = z.infer<typeof SpeedDrillCard>;
export type AdversarialMockCard = z.infer<typeof AdversarialMockCard>;
export type FaultInjectionCard = z.infer<typeof FaultInjectionCard>;
export type PreflightCheckCard = z.infer<typeof PreflightCheckCard>;
export type ConfidenceCalibrationCard = z.infer<typeof ConfidenceCalibrationCard>;
export type DAGRetryCard = z.infer<typeof DAGRetryCard>;
export type DeltaCard = z.infer<typeof DeltaCard>;
export type TestDaySimCard = z.infer<typeof TestDaySimCard>;
export type VariantGenCard = z.infer<typeof VariantGenCard>;
export type ClozeCard = z.infer<typeof ClozeCard>;
export type WalkthroughCard = z.infer<typeof WalkthroughCard>;
export type DemoCard = z.infer<typeof DemoCard>;
export type DecomposeCard = z.infer<typeof DecomposeCard>;
export type MCQCard = z.infer<typeof MCQCard>;
export type ProceduralCard = z.infer<typeof ProceduralCard>;
export type PostmortemCard = z.infer<typeof PostmortemCard>;

/** Card-array helper for JSON file loads. */
export const CardArray = z.array(Card);
export type CardArray = z.infer<typeof CardArray>;
