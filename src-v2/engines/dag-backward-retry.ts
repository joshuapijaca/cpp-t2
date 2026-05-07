/**
 * DAG Backward Retry — cpp-t2 v2 (Option 4)
 *
 * On failure, the deck composer wants to inject prerequisite cards from
 * the atom DAG so the student fixes the upstream gap before retrying the
 * failed card. This module owns:
 *
 *   - walkBackward(failedAtomId, allAtoms): topological reverse-walk of
 *     the prereq edges, returning the prereq atoms in reverse-DAG order
 *     (the closest prereq first, then its prereq, etc.).
 *
 *   - injectPrereqCards(failedAtomId, allAtoms, allCards, n): pick `n`
 *     cards from the prereq atoms (closest atoms first, distinct atoms
 *     preferred) so the runtime can splice them in.
 *
 * PURITY: pure functions. No side effects. Determinism comes from a
 * stable sort by (atomId, cardId).
 */

import type { Card } from '../types/card-schema';
import type { Atom } from '../types/atom';

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Walk the prerequisite DAG backward from `failedAtomId`, returning the
 * prereq atoms in BFS order (immediate prereqs first, then their prereqs).
 * The result excludes the failed atom itself. Cycles in the DAG (which
 * should never occur — the lint-atoms.ts pipeline rejects them) are
 * defended against via a visited set.
 */
export function walkBackward(failedAtomId: string, allAtoms: readonly Atom[]): string[] {
  const byId: Record<string, Atom> = {};
  for (const a of allAtoms) byId[a.id] = a;

  const start = byId[failedAtomId];
  if (!start) return [];

  const visited = new Set<string>([failedAtomId]);
  const order: string[] = [];
  let frontier = [...start.prereqs];

  while (frontier.length > 0) {
    const next: string[] = [];
    for (const id of frontier) {
      if (visited.has(id)) continue;
      visited.add(id);
      order.push(id);
      const atom = byId[id];
      if (atom) for (const p of atom.prereqs) if (!visited.has(p)) next.push(p);
    }
    // Stable sort within a level so output is deterministic regardless
    // of input atom order.
    next.sort();
    frontier = next;
  }
  return order;
}

/**
 * Pick `n` cards from prereq atoms of `failedAtomId`. We walk the DAG
 * backward and, for each prereq atom in BFS order, take 1 card (lowest
 * stage, lowest id) until we have `n` or we run out.
 *
 * If we hit `n` and atoms remain, we then loop a second pass taking
 * additional cards from each atom (so deeper atoms also contribute).
 */
export function injectPrereqCards(
  failedAtomId: string,
  allAtoms: readonly Atom[],
  allCards: readonly Card[],
  n: number,
): Card[] {
  if (n <= 0) return [];
  const prereqOrder = walkBackward(failedAtomId, allAtoms);
  if (prereqOrder.length === 0) return [];

  const cardsByAtom: Record<string, Card[]> = {};
  for (const c of allCards) {
    (cardsByAtom[c.atomId] ??= []).push(c);
  }
  for (const a of Object.keys(cardsByAtom)) {
    cardsByAtom[a]!.sort((x, y) =>
      x.stage !== y.stage ? x.stage - y.stage : x.id < y.id ? -1 : x.id > y.id ? 1 : 0,
    );
  }

  const out: Card[] = [];
  // First pass: 1 card per prereq atom in BFS order.
  for (const a of prereqOrder) {
    if (out.length >= n) break;
    const pool = cardsByAtom[a];
    if (!pool || pool.length === 0) continue;
    out.push(pool[0]!);
  }

  // Subsequent passes: cycle through prereq atoms again, taking the next
  // card we haven't used yet, until full.
  let pass = 1;
  while (out.length < n) {
    let added = 0;
    for (const a of prereqOrder) {
      if (out.length >= n) break;
      const pool = cardsByAtom[a];
      if (!pool || pool.length <= pass) continue;
      out.push(pool[pass]!);
      added++;
    }
    if (added === 0) break; // exhausted
    pass++;
  }
  return out;
}
