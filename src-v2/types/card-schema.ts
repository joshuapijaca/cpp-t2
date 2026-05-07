// =====================================================================
// cpp-t2 / src-v2 / types / card-schema.ts
// LOCKED v2 card schema — see data/v2/SCHEMA_LOCK.md
// =====================================================================
//
// Source-of-truth Zod schema for the v2.2 minimalist build:
//   - ~1,530 hand-authored cards across 6 levels (L0..L5)
//   - 14 card types in a discriminated union over `type`
//     (10 v1-kept + 4 v2 essentials per docs/v2/MANIFEST.md)
//     MatrixCard removed 2026-05-08 per user direction.
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
  // v1-kept (10 per MANIFEST, MatrixCard removed 2026-05-08):
  //   MemorizeCard, MCQCard, TraceCard, WriteCard, ClozeCard,
  //   DecomposeCard, WalkthroughCard, DemoCard, ProceduralCard,
  //   CodeMemorizeCard
  // v2 essentials (4): TemplateRecallCard, StructWriteCard,
  //   FunctionWriteCard, MainWriteCard
  'TraceCard',
  'TemplateRecallCard',
  'StructWriteCard',
  'FunctionWriteCard',
  'MainWriteCard',
  'ClozeCard',
  'WalkthroughCard',
  'DemoCard',
  'DecomposeCard',
  'MCQCard',
  'ProceduralCard',
  // Phase A6 ports of v1 components into src-v2/ — completes the
  // MANIFEST 14-type set. Schemas adapt the v1 shape to the v2
  // common-fields envelope (id/atomId/qTags/stage/level/source/etc.).
  'MemorizeCard',
  'WriteCard',
  'CodeMemorizeCard',
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

// ---------------------------------------------------------------------
// Paper-sim primitives — added 2026-05-08 to support the MemoryBoxes
// component (W3). Trace + Walkthrough cards render variables as
// hand-drawn memory diagrams: scalar boxes, indexed array cells,
// nested struct fields. Schema additions are OPTIONAL — existing
// data renders correctly via runtime auto-derivation from variable
// names + code parsing.
// ---------------------------------------------------------------------

/** Variable shape — overrides MemoryBoxes auto-derivation. */
const VarShape = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('scalar'),
    name: z.string().min(1),
    cppType: z.string().optional(), // e.g. "int", "double" — display hint
  }),
  z.object({
    kind: z.literal('array'),
    name: z.string().min(1),
    size: z.number().int().positive(),
    cellType: z.string().optional(),
  }),
  z.object({
    kind: z.literal('struct'),
    name: z.string().min(1),
    structType: z.string().optional(), // e.g. "stat_double"
    fields: z.array(
      z.object({
        name: z.string().min(1),
        kind: z.enum(['scalar', 'array']),
        size: z.number().int().positive().optional(),
        cppType: z.string().optional(),
      })
    ),
  }),
]);

/** Pass-by-reference aliasing — `void f(stat_double &data)` called as
 * `f(d)` produces the visual `data → d`. */
const PassByRef = z.object({
  paramName: z.string().min(1),     // "data"
  callerName: z.string().min(1),    // "d"
});

/** Initial array contents — overrides auto-parsed init from code.
 * Use when init expression is non-trivial or computed. */
const ArrayInit = z.object({
  name: z.string().min(1),          // "numbers" or "d.numbers"
  values: z.array(z.string()).min(1),
});

/** Per-step memory snapshot for WalkthroughCard. When absent on a
 * step, the walkthrough renders prose-only (fallback). When present,
 * MemoryBoxes builds up alongside the code. */
const VarSnapshot = z.object({
  name: z.string().min(1),          // e.g. "x", "data.mystery", "numbers[2]"
  value: z.string(),                // current value after this step
  history: z.array(z.string()).default([]), // strikethrough chain (oldest → newest, EXCLUDING current)
});

const KeyChecks = z.array(z.string().min(1)).default([]);
const ForbiddenTokens = z.array(z.string().min(1)).default([]);

// ---------------------------------------------------------------------
// 1. TraceCard — hand-execute code, fill memory + terminal output.
//    Paper-sim fields (varShapes / passByRef / arrayInits) are
//    optional overrides for the MemoryBoxes renderer.
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
  // ── paper-sim additions (optional, auto-derived when absent) ──
  varShapes: z.array(VarShape).optional(),
  passByRef: PassByRef.optional(),
  arrayInits: z.array(ArrayInit).optional(),
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
// 6. ClozeCard — fill-in-the-blank over a code/sentence template.
// ---------------------------------------------------------------------
export const ClozeCard = CommonCardFields.extend({
  type: z.literal('ClozeCard'),
  code: z.string().min(1),
  clozeSentence: z.string().min(1),
  answer: z.string().min(1),
  explanation: z.string().min(1),
});

// ---------------------------------------------------------------------
// 7. WalkthroughCard — annotated walk-through of a worked example.
//    Hand-execution walkthroughs may attach memory snapshots per step
//    (vars + terminal) — when present, MemoryBoxes builds up beside
//    the code. Prose-only walkthroughs (syntax explanations) leave
//    snapshots absent and render the annotation only.
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
        // ── paper-sim additions (optional) ──
        vars: z.array(VarSnapshot).optional(),
        terminal: z.array(z.string()).optional(),
      })
    )
    .min(1),
  // Optional shape declaration shared across all steps (e.g. the Q1
  // stat_double struct). When absent, MemoryBoxes auto-derives from
  // step-level var names + fullCode.
  varShapes: z.array(VarShape).optional(),
  passByRef: PassByRef.optional(),
  arrayInits: z.array(ArrayInit).optional(),
});

// ---------------------------------------------------------------------
// 8. DemoCard — "watch how" / passive-observation card.
// ---------------------------------------------------------------------
export const DemoCard = CommonCardFields.extend({
  type: z.literal('DemoCard'),
  whyOneLine: z.string().min(1),
  demoCode: z.string().min(1),
  highlightTokens: z.array(z.string()).default([]),
  usedIn: z.array(z.string()).default([]),
});

// ---------------------------------------------------------------------
// 9. DecomposeCard — A/B/C/D pick-the-correct-explanation MCQ.
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
// 10. MCQCard — single-correct multi-choice question.
// ---------------------------------------------------------------------
export const MCQCard = CommonCardFields.extend({
  type: z.literal('MCQCard'),
  correct: z.string().min(1),
  distractors: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1)]),
  explanation: z.string().min(1),
});

// ---------------------------------------------------------------------
// 11. ProceduralCard — produce code from prompt; supports variants.
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
// 12. MemorizeCard — fact-recall flashcard. <=7-word `fact` (Miller).
// ---------------------------------------------------------------------
export const MemorizeCard = CommonCardFields.extend({
  type: z.literal('MemorizeCard'),
  fact: z.string().min(1),
  context: z.string().optional(),
  codeExample: z.string().optional(),
  flashSeconds: z.number().int().nonnegative().default(3),
  mode: z.enum(['race', 'recall']).default('recall'),
  keyChecks: KeyChecks,
  explanation: z.string().min(1),
});

// ---------------------------------------------------------------------
// 13. WriteCard — generic write card (3 difficulty levels: fill /
//     complete-body / free-form). Distinct from StructWriteCard /
//     FunctionWriteCard / MainWriteCard which target Q2/Q3/Q4 shapes.
// ---------------------------------------------------------------------
export const WriteCard = CommonCardFields.extend({
  type: z.literal('WriteCard'),
  writeLevel: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  spec: z.string().min(1),
  template: z.string().optional(),
  expectedAnswer: z.string().min(1),
  keyChecks: KeyChecks,
  forbidden: ForbiddenTokens,
  explanation: z.string().min(1),
});

// ---------------------------------------------------------------------
// 14. CodeMemorizeCard — see-then-type code drill.
// ---------------------------------------------------------------------
export const CodeMemorizeCard = CommonCardFields.extend({
  type: z.literal('CodeMemorizeCard'),
  section: z.string().min(1),
  question: z.string().min(1),
  code: z.string().min(1),
  keyChecks: KeyChecks,
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
  ClozeCard,
  WalkthroughCard,
  DemoCard,
  DecomposeCard,
  MCQCard,
  ProceduralCard,
  MemorizeCard,
  WriteCard,
  CodeMemorizeCard,
]);
export type Card = z.infer<typeof Card>;

/** Per-type inferred TS aliases (handy for components / engines). */
export type TraceCard = z.infer<typeof TraceCard>;
export type TemplateRecallCard = z.infer<typeof TemplateRecallCard>;
export type StructWriteCard = z.infer<typeof StructWriteCard>;
export type FunctionWriteCard = z.infer<typeof FunctionWriteCard>;
export type MainWriteCard = z.infer<typeof MainWriteCard>;
export type ClozeCard = z.infer<typeof ClozeCard>;
export type WalkthroughCard = z.infer<typeof WalkthroughCard>;
export type DemoCard = z.infer<typeof DemoCard>;
export type DecomposeCard = z.infer<typeof DecomposeCard>;
export type MCQCard = z.infer<typeof MCQCard>;
export type ProceduralCard = z.infer<typeof ProceduralCard>;
export type MemorizeCard = z.infer<typeof MemorizeCard>;
export type WriteCard = z.infer<typeof WriteCard>;
export type CodeMemorizeCard = z.infer<typeof CodeMemorizeCard>;

/** Card-array helper for JSON file loads. */
export const CardArray = z.array(Card);
export type CardArray = z.infer<typeof CardArray>;
