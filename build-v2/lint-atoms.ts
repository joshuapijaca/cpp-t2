// =====================================================================
// cpp-t2 / build-v2 / lint-atoms.ts
// QA — v2 atom lint (atom DAG validation gate)
// =====================================================================
//
// Reads every YAML in cpp-t2/data/v2/atoms/ and validates the atom
// graph as a whole.
//
// Per RULE 4 (max quality / min compromise): the atom DAG drives
// scheduling, prereq surfacing, and dashboard. A cycle / dangling
// prereq / orphan atom = silent corruption of the learning order.
//
// Atom YAML shape (locked v2 spec):
//
//   schemaVersion: v2
//   id: F-07            # AtomId regex from card-schema.ts
//   title: "Pass by reference"
//   level: L2           # L0..L5
//   qTracks: [Q2, Q3]   # which exam questions this atom supports
//   prereqs: [F-04, F-06]
//   source:
//     kind: pfg | v2 | seminar | practice
//     ref: "PFG ch.7 §7.3"
//   commonMistakeIds: [CM-missing-amp, CM-ref-vs-value]
//   notes: "..."
//
// Checks:
//   1. Zod-style schema validation (id format, level enum, source shape)
//   2. id uniqueness across all atom files
//   3. Filename matches id (data/v2/atoms/<id>.yml)
//   4. Every prereq atomId exists in the registry
//   5. No cycles — topological sort over the prereq graph
//   6. Every atom is referenced by at least one card OR by another
//      atom's prereqs (orphan-atom warning)
//   7. Every atom carries a source citation
//   8. Every atom is used by some Q-track (qTracks non-empty)
//
// Exit codes: 0 clean / 1 errors / 2 internal
// =====================================================================

import yaml from 'js-yaml';
import { readFileSync, existsSync, statSync } from 'fs';
import { glob } from 'glob';
import { resolve, relative, basename } from 'path';
import { z } from 'zod';
import { AtomId, QTag, Level, SourceCitation, CommonMistakeId } from '../src-v2/types/card-schema.js';

const ROOT = resolve(import.meta.dirname, '..');
const ATOMS_DIR = 'data/v2/atoms';
const CARDS_GLOB = 'data/v2/cards/**/*.yml';

// ---------------------------------------------------------------------
// Atom Zod schema. Aligned with the CA-M01 atom registry shape:
//
//   id: F-01
//   name: "Source code is plain text"
//   level: L0
//   phase: A | B | C | D | E
//   teaches: "<one-liner>"
//   prereqs: [F-04, F-06]
//   usedByQs: [Q1, Q2, Q3, Q4]
//   cardCountTarget: 6
//   source:
//     - kind: pfg | v2 | seminar | practice
//       ref: "..."
//       quote: "..."        # optional but encouraged
//   commonMistakes: [CM-F01a, CM-F01b]   # alias accepted: commonMistakeIds
//   notes: <string OR object>            # free-form
//
// schemaVersion is optional at the atom level (CA-M01 omitted it; the
// canonical version is implied by the directory tree under data/v2/).
// We accept both `commonMistakes` and `commonMistakeIds` as field names.
// ---------------------------------------------------------------------

const AtomSourceItem = z.object({
  kind: z.enum(['practice', 'v2', 'pfg', 'seminar']),
  ref: z.string().min(1),
  quote: z.string().optional(),
});

// Allow either a single SourceCitation OR an array (CA-M01 uses an array).
const AtomSource = z.union([AtomSourceItem, z.array(AtomSourceItem).min(1)]);

const Atom = z.object({
  schemaVersion: z.literal('v2').optional(),
  id: AtomId,
  // Title or name — accept either to interop with CA-M01's `name`.
  name: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  level: Level,
  phase: z.enum(['A', 'B', 'C', 'D', 'E', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6']).optional(),
  teaches: z.string().optional(),
  // Q-track field is `usedByQs` in CA-M01; `qTracks` in earlier draft.
  qTracks: z.array(QTag).optional(),
  usedByQs: z.array(QTag).optional(),
  cardCountTarget: z.number().int().positive().optional(),
  prereqs: z.array(AtomId).default([]),
  parentAtom: AtomId.optional(),
  splitInto: z.array(AtomId).optional(),
  source: AtomSource,
  commonMistakes: z.array(CommonMistakeId).optional(),
  commonMistakeIds: z.array(CommonMistakeId).optional(),
  // Notes can be a free-form string or a structured object (e.g. cardMix).
  notes: z.union([z.string(), z.record(z.unknown())]).optional(),
});
type Atom = z.infer<typeof Atom>;

interface LintFinding {
  level: 'error' | 'warn';
  file: string;
  rule: string;
  detail: string;
  atomId?: string;
}

const findings: LintFinding[] = [];
const err = (f: Omit<LintFinding, 'level'>) => findings.push({ ...f, level: 'error' });
const warn = (f: Omit<LintFinding, 'level'>) => findings.push({ ...f, level: 'warn' });

// ---------------------------------------------------------------------
// Topological-sort cycle detection (Kahn's algorithm). Returns the
// list of atom IDs that participate in a cycle, or [] if the graph
// is acyclic.
// ---------------------------------------------------------------------

function findCycles(graph: Map<string, string[]>): string[] {
  // Indegree counts only prereq edges that point to atoms in the graph.
  // Prereqs pointing to unknown atoms (already reported as
  // `prereq-missing`) are ignored here so they don't masquerade as
  // cycles. Forward adjacency is precomputed for O(V+E) Kahn.
  const indeg = new Map<string, number>();
  const fwd = new Map<string, string[]>(); // p -> [ids that depend on p]
  for (const id of graph.keys()) {
    indeg.set(id, 0);
    fwd.set(id, []);
  }
  for (const [id, prereqs] of graph) {
    for (const p of prereqs) {
      if (!graph.has(p)) continue; // dangling — skip
      indeg.set(id, (indeg.get(id) ?? 0) + 1);
      fwd.get(p)!.push(id);
    }
  }

  const queue: string[] = [];
  for (const [id, d] of indeg) if (d === 0) queue.push(id);

  let processed = 0;
  while (queue.length > 0) {
    const node = queue.shift()!;
    processed++;
    for (const dependent of fwd.get(node) ?? []) {
      const d = (indeg.get(dependent) ?? 0) - 1;
      indeg.set(dependent, d);
      if (d === 0) queue.push(dependent);
    }
  }
  if (processed === graph.size) return [];
  // Anything still with indeg > 0 sits in or downstream of a cycle.
  const stuck: string[] = [];
  for (const [id, d] of indeg) if (d > 0) stuck.push(id);
  return stuck;
}

// ---------------------------------------------------------------------
// Card-side reference scanner — collects every atomId referenced by
// any card YAML so we can detect orphan atoms.
// ---------------------------------------------------------------------

function collectAtomRefsFromCards(): Set<string> {
  const refs = new Set<string>();
  const files = glob.sync(CARDS_GLOB, { cwd: ROOT });
  for (const rel of files) {
    let parsed: unknown;
    try {
      parsed = yaml.load(readFileSync(resolve(ROOT, rel), 'utf8'));
    } catch {
      continue; // lint-cards will catch parse errors
    }
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    for (const c of arr) {
      if (c && typeof c === 'object') {
        const a = (c as { atomId?: string }).atomId;
        if (typeof a === 'string') refs.add(a);
        const p = (c as { prerequisiteAtomIds?: string[] }).prerequisiteAtomIds;
        if (Array.isArray(p)) for (const x of p) if (typeof x === 'string') refs.add(x);
      }
    }
  }
  return refs;
}

// ---------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------

function main(): number {
  const jsonOut = process.argv.includes('--json');
  const dir = resolve(ROOT, ATOMS_DIR);

  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    err({ file: dir, rule: 'atoms-dir-missing', detail: 'data/v2/atoms/ directory does not exist' });
    return reportAndExit(jsonOut, 0);
  }

  // Atoms may live directly in data/v2/atoms/ OR nested by level
  // (e.g. data/v2/atoms/L0/F-07.yml). Recurse.
  const files = glob.sync('**/*.yml', { cwd: dir });

  if (files.length === 0) {
    warn({
      file: dir,
      rule: 'atoms-empty',
      detail: 'no atom files found — pre-M12 state is OK; populate before card authoring closes',
    });
    return reportAndExit(jsonOut, 0);
  }

  const atomsById = new Map<string, Atom>();
  const atomFilePath = new Map<string, string>(); // id -> abs path

  // ---- Parse + per-atom schema validation --------------------------
  for (const f of files) {
    const abs = resolve(dir, f);
    let raw: unknown;
    try {
      raw = yaml.load(readFileSync(abs, 'utf8'));
    } catch (e) {
      err({ file: abs, rule: 'yaml-parse', detail: (e as Error).message });
      continue;
    }
    const parsed = Atom.safeParse(raw);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        err({
          file: abs,
          rule: 'zod',
          detail: `${issue.path.join('.') || '<root>'}: ${issue.message}`,
        });
      }
      continue;
    }
    const atom = parsed.data;
    const expected = `${atom.id}.yml`;
    if (basename(f) !== expected) {
      err({
        file: abs,
        atomId: atom.id,
        rule: 'filename-mismatch',
        detail: `filename ${basename(f)} does not match atom id ${atom.id} (expected ${expected})`,
      });
    }
    if (atomsById.has(atom.id)) {
      err({
        file: abs,
        atomId: atom.id,
        rule: 'id-collision',
        detail: `atom id ${atom.id} is duplicated (already declared in another file)`,
      });
    } else {
      atomsById.set(atom.id, atom);
      atomFilePath.set(atom.id, abs);
    }
  }

  const filePathFor = (_dir: string, id: string) => atomFilePath.get(id) ?? _dir;

  // ---- Cross-atom checks -------------------------------------------
  const graph = new Map<string, string[]>();
  for (const a of atomsById.values()) graph.set(a.id, a.prereqs);

  // Dangling prereqs
  for (const a of atomsById.values()) {
    for (const p of a.prereqs) {
      if (!atomsById.has(p)) {
        err({
          file: filePathFor(dir, a.id),
          atomId: a.id,
          rule: 'prereq-missing',
          detail: `prereq ${p} has no atom file`,
        });
      }
    }
  }

  // Cycles
  const cycleNodes = findCycles(graph);
  if (cycleNodes.length > 0) {
    err({
      file: dir,
      rule: 'cycle',
      detail: `cycle detected — atoms participating: ${cycleNodes.sort().join(', ')}`,
    });
  }

  // Source citations — second-belt. Source can be a single object or
  // a non-empty array (CA-M01 uses arrays). Either way, every entry
  // must have a non-empty `ref`.
  for (const a of atomsById.values()) {
    const items = Array.isArray(a.source) ? a.source : [a.source];
    if (items.length === 0) {
      err({
        file: filePathFor(dir, a.id),
        atomId: a.id,
        rule: 'source-missing',
        detail: 'every atom requires at least one source citation (kind + ref)',
      });
    } else {
      for (const it of items) {
        if (!it || !it.ref || it.ref.trim().length === 0) {
          err({
            file: filePathFor(dir, a.id),
            atomId: a.id,
            rule: 'source-ref-empty',
            detail: 'a source entry has an empty `ref`',
          });
        }
      }
    }
  }

  // Title/name presence — at least one must be set.
  for (const a of atomsById.values()) {
    if (!a.name && !a.title) {
      err({
        file: filePathFor(dir, a.id),
        atomId: a.id,
        rule: 'title-missing',
        detail: 'atom must declare `name` (preferred) or `title`',
      });
    }
  }

  // Q-track non-empty (accept either `qTracks` or `usedByQs`).
  for (const a of atomsById.values()) {
    const qs = a.usedByQs ?? a.qTracks ?? [];
    if (qs.length === 0) {
      err({
        file: filePathFor(dir, a.id),
        atomId: a.id,
        rule: 'qtracks-empty',
        detail: 'every atom must support at least one Q-track via `usedByQs` (or `qTracks`)',
      });
    }
  }

  // Orphan check — atom not used by any card AND not a prereq of any
  // other atom. Warning, not error: pre-M12 it's expected.
  const cardRefs = collectAtomRefsFromCards();
  const usedAsPrereq = new Set<string>();
  for (const a of atomsById.values()) for (const p of a.prereqs) usedAsPrereq.add(p);

  for (const a of atomsById.values()) {
    const usedByCard = cardRefs.has(a.id);
    const usedAsPre = usedAsPrereq.has(a.id);
    // Parent atoms (split into sub-atoms) are deliberately not used as
    // prereqs — their sub-atoms carry the edges. Don't flag them as
    // orphans on that basis.
    const isSplitParent = Array.isArray(a.splitInto) && a.splitInto.length > 0;
    if (!usedByCard && !usedAsPre && !isSplitParent) {
      warn({
        file: filePathFor(dir, a.id),
        atomId: a.id,
        rule: 'orphan-atom',
        detail: 'atom is not referenced by any card and is not a prereq of any other atom',
      });
    }
  }

  return reportAndExit(jsonOut, atomsById.size);
}

function reportAndExit(jsonOut: boolean, atomCount: number): number {
  const errors = findings.filter((f) => f.level === 'error');
  const warnings = findings.filter((f) => f.level === 'warn');

  if (jsonOut) {
    process.stdout.write(JSON.stringify({ atomCount, errors, warnings }, null, 2) + '\n');
  } else {
    process.stdout.write(`\n[lint:v2-atoms] ${atomCount} atom(s) scanned\n`);
    if (findings.length === 0) {
      process.stdout.write(`[lint:v2-atoms] OK — 0 errors, 0 warnings\n`);
    } else {
      const byFile = new Map<string, LintFinding[]>();
      for (const f of findings) {
        if (!byFile.has(f.file)) byFile.set(f.file, []);
        byFile.get(f.file)!.push(f);
      }
      for (const [file, fs] of byFile) {
        process.stdout.write(`\n  ${relative(ROOT, file)}\n`);
        for (const f of fs) {
          const sigil = f.level === 'error' ? 'ERR' : 'WRN';
          const idPart = f.atomId ? ` [${f.atomId}]` : '';
          process.stdout.write(`    ${sigil} ${f.rule}${idPart}: ${f.detail}\n`);
        }
      }
      process.stdout.write(`\n[lint:v2-atoms] ${errors.length} error(s), ${warnings.length} warning(s)\n`);
    }
  }
  return errors.length > 0 ? 1 : 0;
}

try {
  const code = main();
  process.exit(code);
} catch (e) {
  process.stderr.write(`[lint:v2-atoms] internal failure: ${(e as Error).stack || (e as Error).message}\n`);
  process.exit(2);
}
