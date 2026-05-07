// =====================================================================
// cpp-t2 / src-v2 / types / atom.ts
// LOCKED v2 atom schema — see data/v2/SCHEMA_LOCK.md
// =====================================================================
//
// An "atom" is the smallest unit of knowledge tracked by the v2 build.
// 30 atoms total: F-01..F-22 plus sub-atom splits (F-XXa/b...) and
// algorithm/entity extensions (A1, A2, ...).
//
// Per atom we record:
//   - prereq atom IDs (DAG edges; topo-sort produces level ordering)
//   - which exam questions consume it (usedByQs)
//   - common-mistake catalogue references
//   - card-count target (how many cards we plan to author for this atom)
//   - exposure targets at the short/medium/long horizon
//   - source-of-truth citation (where the canonical definition lives)
//
// LOCKED — see data/v2/SCHEMA_LOCK.md.
// =====================================================================

import { z } from 'zod';
import { AtomId, CommonMistakeId, Level, QTag, SourceCitation } from './card-schema';

/**
 * Spaced-repetition exposure targets per horizon.
 *   - short:  exposures within the next ~24h window
 *   - medium: exposures within the next ~3-day window
 *   - long:   exposures by test day
 *
 * Defaults match Option-4 spec: { short: 6, medium: 8, long: 12 }.
 * These are *targets*, not minimums; engines compare against actual
 * cardExposures from the student session-state to decide what to surface.
 */
export const ExposureTarget = z.object({
  short: z.number().int().nonnegative().default(6),
  medium: z.number().int().nonnegative().default(8),
  long: z.number().int().nonnegative().default(12),
});
export type ExposureTarget = z.infer<typeof ExposureTarget>;

/** A single Atom record — corresponds to one node in the DAG. */
export const Atom = z.object({
  id: AtomId,
  name: z.string().min(1),

  /** Design level this atom belongs to (L0..L5). */
  level: Level,

  /** Atom IDs that must be FAMILIAR before this atom can be surfaced. */
  prereqs: z.array(AtomId).default([]),

  /** Which exam questions consume this atom. >=1. */
  usedByQs: z.array(QTag).min(1),

  /** Pointers to the common-mistake catalogue. */
  commonMistakeIds: z.array(CommonMistakeId).default([]),

  /** How many distinct cards target this atom (for budget tracking). */
  cardCountTarget: z.number().int().positive(),

  /** Required exposures across the three horizons. */
  exposureTarget: ExposureTarget.default({ short: 6, medium: 8, long: 12 }),

  /** Source-of-truth citation (canonical definition). */
  source: SourceCitation,

  /** Optional human-readable description / canonical definition. */
  description: z.string().optional(),

  /** Optional canonical example snippet. */
  canonicalExample: z.string().optional(),

  /** Optional notes for authors (not shown to student). */
  notes: z.string().optional(),
});
export type Atom = z.infer<typeof Atom>;

/** Array helper for JSON file loads. */
export const AtomArray = z.array(Atom);
export type AtomArray = z.infer<typeof AtomArray>;
