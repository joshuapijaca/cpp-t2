// =====================================================================
// cpp-t2 / src-v2 / types / student.ts
// LOCKED v2 student session-state schema — see data/v2/SCHEMA_LOCK.md
// =====================================================================
//
// State for a single student session. Per CLAUDE.md the v2 build is
// session-only (no localStorage, no backend). The shape below is the
// *runtime* contract that engines (selector, scheduler, weakness-tracker)
// consume; serialization to JSON is allowed for export, but no auto-save.
//
// We use plain object maps (Record<string, ...>) instead of native Map
// instances so the shape stays JSON-serializable and Zod-friendly.
// Engines may wrap these in Map at call sites if they prefer.
//
// LOCKED — see data/v2/SCHEMA_LOCK.md.
// =====================================================================

import { z } from 'zod';
import { AtomId, CardStatus, QTag } from './card-schema';

/**
 * Familiarity of an atom for this student, expressed as a percent
 * 0..100. Engines should treat >=80 as "FAMILIAR" by default; callers
 * may apply a stricter threshold. Persistence: session-only.
 */
export const FamiliarityPercent = z.number().min(0).max(100);
export type FamiliarityPercent = z.infer<typeof FamiliarityPercent>;

/**
 * Map<atomId, percent>. We use Record<string, ...> for JSON safety.
 * Keys MUST validate as AtomId at write time; engines should validate
 * inserts via AtomId.parse(key) before mutating.
 */
export const AtomFamiliarityMap = z.record(z.string(), FamiliarityPercent);
export type AtomFamiliarityMap = z.infer<typeof AtomFamiliarityMap>;

/** Map<cardId, count> — total exposures for the session. */
export const CardExposuresMap = z.record(
  z.string(),
  z.number().int().nonnegative()
);
export type CardExposuresMap = z.infer<typeof CardExposuresMap>;

/**
 * Map<cardId, lastNCorrect[]> — bounded sliding window of correctness
 * (most-recent-last). Engines decide N (typical: 5). Each entry is a
 * boolean: true = correct, false = incorrect.
 */
export const CardCorrectMap = z.record(z.string(), z.array(z.boolean()));
export type CardCorrectMap = z.infer<typeof CardCorrectMap>;

/**
 * Stage progress key format: `${Level}-S${Stage}` (e.g. "L2-S3"),
 * or `${Level}-L0` for foundation. Value: percent complete 0..100.
 */
export const StageProgressKey = z
  .string()
  .regex(/^L[0-5]-(L0|S[1-6])$/, {
    message:
      'StageProgressKey must look like `L<0-5>-L0` or `L<0-5>-S<1-6>`.',
  });
export type StageProgressKey = z.infer<typeof StageProgressKey>;

export const StageProgressMap = z.record(
  z.string(),
  z.number().min(0).max(100)
);
export type StageProgressMap = z.infer<typeof StageProgressMap>;

/**
 * A single weakness entry. Engines append on incorrect attempts and
 * decay on subsequent correct attempts on the same atom.
 */
export const WeaknessEntry = z.object({
  atomId: AtomId,
  cardId: z.string().min(1),
  qTag: QTag,
  reason: z.string().min(1),
  /** Severity 0..1 — engines decide decay curve. */
  severity: z.number().min(0).max(1).default(0.5),
  /** ISO-8601 timestamp at insertion. */
  timestamp: z.string().min(1),
});
export type WeaknessEntry = z.infer<typeof WeaknessEntry>;

export const WeaknessFile = z.array(WeaknessEntry);
export type WeaknessFile = z.infer<typeof WeaknessFile>;

/** Per-card derived status snapshot (cached for the UI). */
export const CardStatusMap = z.record(z.string(), CardStatus);
export type CardStatusMap = z.infer<typeof CardStatusMap>;

/** Top-level session state. */
export const StudentSession = z.object({
  sessionId: z.string().min(1),

  /** ISO-8601 start timestamp. */
  startedAt: z.string().min(1),

  /** Map<atomId, percent>. */
  atomFamiliarity: AtomFamiliarityMap.default({}),

  /** Map<cardId, count>. */
  cardExposures: CardExposuresMap.default({}),

  /** Map<cardId, lastNCorrect[]>. */
  cardCorrect: CardCorrectMap.default({}),

  /** Map<`${Level}-${Stage}`, percent>. */
  stageProgress: StageProgressMap.default({}),

  /** Append-only weakness log for this session. */
  weaknessFile: WeaknessFile.default([]),

  /** Optional cached card-status snapshot. */
  cardStatus: CardStatusMap.default({}),

  /** Optional ISO-8601 last-update timestamp. */
  updatedAt: z.string().optional(),
});
export type StudentSession = z.infer<typeof StudentSession>;
