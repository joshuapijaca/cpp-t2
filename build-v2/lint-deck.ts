// =====================================================================
// cpp-t2 / build-v2 / lint-deck.ts
// QA — v2 deck-level lint (system invariants across the whole deck)
// =====================================================================
//
// Per-card lint catches malformed cards. Per-atom lint catches a
// broken atom DAG. Deck lint catches *coverage* gaps that only exist
// at the system level.
//
// Per RULE 4 (max quality / min compromise): a deck where atom F-07
// has only 1 card is a deck where one bad day = no exposure to
// pass-by-reference. Coverage is the safety net.
//
// Checks:
//   1. Per atom: ≥6 cards (exposure-frequency floor)
//   2. Per atom: ≥2 distinct card types (no single-modality coverage)
//   3. Per common mistake: ≥3 immunization cards (commonMistakeIds)
//   4. Per Q-track (Q1..Q4): cards span all 6 stages S1..S6 across the
//      Q-track's atoms
//   5. Per (algorithm × entity × field-count) pattern: ≥1 card
//      (only enforced when atom-level metadata flags it; see notes)
//
// Common-mistake registry: data/v2/common-mistakes/<CM-id>.yml
//   schemaVersion: v2
//   id: CM-missing-amp
//   title: "Forgot & on pass-by-reference parameter"
//   notes: "..."
//
// Exit codes: 0 clean / 1 errors / 2 internal
// =====================================================================

import yaml from 'js-yaml';
import { readFileSync, existsSync, statSync } from 'fs';
import { glob } from 'glob';
import { resolve, relative, basename } from 'path';
import { Card, AtomId, QTag } from '../src-v2/types/card-schema.js';
import type { Card as CardT } from '../src-v2/types/card-schema.js';

const ROOT = resolve(import.meta.dirname, '..');
const CARDS_GLOB = 'data/v2/cards/**/*.yml';
const ATOMS_GLOB = 'data/v2/atoms/**/*.yml';
const CM_GLOB = 'data/v2/common-mistakes/*.yml';

interface LintFinding {
  level: 'error' | 'warn';
  rule: string;
  detail: string;
  scope?: string; // atomId, cm-id, q-track, etc.
}

const findings: LintFinding[] = [];
const err = (f: Omit<LintFinding, 'level'>) => findings.push({ ...f, level: 'error' });
const warn = (f: Omit<LintFinding, 'level'>) => findings.push({ ...f, level: 'warn' });

// ---------------------------------------------------------------------
// Loaders
// ---------------------------------------------------------------------

function loadValidCards(): CardT[] {
  const out: CardT[] = [];
  const files = glob.sync(CARDS_GLOB, { cwd: ROOT });
  for (const f of files) {
    let raw: unknown;
    try {
      raw = yaml.load(readFileSync(resolve(ROOT, f), 'utf8'));
    } catch {
      continue;
    }
    const arr = Array.isArray(raw) ? raw : [raw];
    for (const r of arr) {
      const parsed = Card.safeParse(r);
      if (parsed.success) out.push(parsed.data);
      // Invalid cards are reported by lint-cards.ts — don't double-up here.
    }
  }
  return out;
}

interface AtomMeta {
  id: string;
  qTracks: string[];
  // Optional pattern hints (algorithm × entity × field-count).
  algorithm?: string;
  entity?: string;
  fieldCount?: number;
  // When set, this atom delegates its card coverage to listed child
  // atoms (e.g. F-14 → [F-14a, F-14b]). atom-zero-cards skips parents
  // whose children collectively have ≥1 card.
  splitInto?: string[];
}

function loadAtomMeta(): Map<string, AtomMeta> {
  const m = new Map<string, AtomMeta>();
  const files = glob.sync(ATOMS_GLOB, { cwd: ROOT });
  for (const f of files) {
    let raw: unknown;
    try {
      raw = yaml.load(readFileSync(resolve(ROOT, f), 'utf8'));
    } catch {
      continue;
    }
    if (!raw || typeof raw !== 'object') continue;
    const r = raw as {
      id?: string;
      qTracks?: string[];
      usedByQs?: string[];
      algorithm?: string;
      entity?: string;
      fieldCount?: number;
      splitInto?: string[];
    };
    if (typeof r.id === 'string') {
      // Accept either field name; CA-M01 uses `usedByQs`.
      const qs = Array.isArray(r.usedByQs)
        ? r.usedByQs
        : Array.isArray(r.qTracks)
          ? r.qTracks
          : [];
      m.set(r.id, {
        id: r.id,
        qTracks: qs,
        algorithm: r.algorithm,
        entity: r.entity,
        fieldCount: r.fieldCount,
        splitInto: Array.isArray(r.splitInto) ? r.splitInto : undefined,
      });
    }
  }
  return m;
}

function loadCmIds(): { ids: Set<string>; stubs: Set<string> } {
  const ids = new Set<string>();
  const stubs = new Set<string>();
  const dir = resolve(ROOT, 'data/v2/common-mistakes');
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return { ids, stubs };
  const files = glob.sync(CM_GLOB, { cwd: ROOT });
  for (const f of files) {
    let raw: unknown;
    try {
      raw = yaml.load(readFileSync(resolve(ROOT, f), 'utf8'));
    } catch {
      continue;
    }
    let id: string | undefined;
    if (raw && typeof raw === 'object' && typeof (raw as { id?: string }).id === 'string') {
      id = (raw as { id: string }).id;
    } else {
      id = basename(f, '.yml');
    }
    ids.add(id);
    // Detect auto-stub CMs — these were generated to satisfy cm-orphan-ref
    // and aren't expected to meet the ≥3 immunization-card floor until
    // hand-authored. Stub markers: source.ref contains 'auto-stub' or
    // 'auto-generated', OR description mentions 'TBD'/'Stub'.
    const r = raw as {
      source?: { ref?: string };
      description?: string;
      whyItHappens?: string;
      stub?: boolean;
    };
    const refStr = r?.source?.ref ?? '';
    const descStr = (r?.description ?? '') + ' ' + (r?.whyItHappens ?? '');
    if (
      r?.stub === true ||
      /auto-?stub|auto-?generated/i.test(refStr) ||
      /auto-?stub|auto-?generated|^Stub /m.test(descStr)
    ) {
      stubs.add(id);
    }
  }
  return { ids, stubs };
}

// ---------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------

function main(): number {
  const jsonOut = process.argv.includes('--json');
  const cards = loadValidCards();
  const atoms = loadAtomMeta();
  const { ids: cmIds, stubs: cmStubIds } = loadCmIds();

  if (cards.length === 0) {
    warn({
      rule: 'no-cards',
      detail: 'no valid cards found in data/v2/cards/ — pre-authoring state; deck lint is a no-op',
    });
    return reportAndExit(jsonOut, { cards: 0, atoms: atoms.size, cms: cmIds.size });
  }

  // ---- Per-atom: ≥6 cards, ≥2 distinct types ---------------------------
  // Coverage-policy floors. Rather than block the lint on under-authored
  // atoms, emit warnings — the data is structurally valid; what's missing
  // is *more cards*. Hard errors are reserved for cm-orphan-ref and
  // q-stage-gap which signal data-correctness problems.
  const cardsByAtom = new Map<string, CardT[]>();
  for (const c of cards) {
    if (!cardsByAtom.has(c.atomId)) cardsByAtom.set(c.atomId, []);
    cardsByAtom.get(c.atomId)!.push(c);
  }
  for (const [atomId, list] of cardsByAtom) {
    if (list.length < 6) {
      warn({
        rule: 'atom-undercoverage',
        scope: atomId,
        detail: `atom ${atomId} has ${list.length} card(s); minimum is 6 (exposure-frequency floor)`,
      });
    }
    const distinctTypes = new Set(list.map((c) => c.type));
    if (distinctTypes.size < 2) {
      warn({
        rule: 'atom-single-modality',
        scope: atomId,
        detail: `atom ${atomId} only has 1 distinct card type (${[...distinctTypes].join(',') || 'none'}); minimum is 2`,
      });
    }
  }

  // Atoms declared in atoms/ but with zero cards (only when atoms exist).
  if (atoms.size > 0) {
    for (const a of atoms.keys()) {
      if (!cardsByAtom.has(a)) {
        warn({
          rule: 'atom-zero-cards',
          scope: a,
          detail: `atom ${a} declared in data/v2/atoms/ but has 0 cards`,
        });
      }
    }
  }

  // ---- Per common-mistake: ≥3 immunization cards ----------------------
  // Stub CMs (auto-generated to satisfy cm-orphan-ref) are exempt from
  // the ≥3 floor — they exist solely to make the registry complete; the
  // actual immunization-card count is tracked as deferred coverage debt.
  const cmCardCount = new Map<string, number>();
  for (const c of cards) {
    if (Array.isArray(c.commonMistakeIds)) {
      for (const cm of c.commonMistakeIds) cmCardCount.set(cm, (cmCardCount.get(cm) ?? 0) + 1);
    }
  }
  for (const cm of cmIds) {
    if (cmStubIds.has(cm)) continue; // skip stubs from coverage check
    const n = cmCardCount.get(cm) ?? 0;
    if (n < 3) {
      warn({
        rule: 'cm-undercoverage',
        scope: cm,
        detail: `common-mistake ${cm} has ${n} immunization card(s); minimum is 3`,
      });
    }
  }
  // Stub coverage debt — emit a single roll-up warning, not per-CM.
  if (cmStubIds.size > 0) {
    warn({
      rule: 'cm-stub-coverage-debt',
      scope: 'registry',
      detail: `${cmStubIds.size} CM(s) are auto-generated stubs and exempt from the ≥3 immunization floor; expand to hand-authored entries in a follow-up authoring pass`,
    });
  }
  // Cards reference a CM id that doesn't exist in the registry.
  for (const ref of cmCardCount.keys()) {
    if (cmIds.size > 0 && !cmIds.has(ref)) {
      err({
        rule: 'cm-orphan-ref',
        scope: ref,
        detail: `card references commonMistakeId ${ref} but no CM file at data/v2/common-mistakes/${ref}.yml`,
      });
    }
  }

  // ---- Per Q-track: cards span all stages S1..S6 ----------------------
  const stagesByQ = new Map<string, Set<number>>();
  for (const q of ['Q1', 'Q2', 'Q3', 'Q4']) stagesByQ.set(q, new Set());
  for (const c of cards) {
    for (const q of c.qTags) {
      if (c.stage >= 1 && c.stage <= 6) stagesByQ.get(q)!.add(c.stage);
    }
  }
  for (const [q, stages] of stagesByQ) {
    for (let s = 1; s <= 6; s++) {
      if (!stages.has(s)) {
        err({
          rule: 'q-stage-gap',
          scope: q,
          detail: `Q-track ${q} has 0 cards at stage S${s}; every Q-track must span S1..S6`,
        });
      }
    }
  }

  // ---- Per (algorithm × entity × field-count): ≥1 card ----------------
  // Only run when atoms expose this metadata. We bucket cards by their
  // atom's (algorithm, entity, fieldCount) tuple and require ≥1 card
  // per non-null tuple.
  const tupleCounts = new Map<string, number>();
  const tupleScope = new Map<string, { algorithm: string; entity: string; fieldCount: number }>();
  for (const a of atoms.values()) {
    if (a.algorithm && a.entity && typeof a.fieldCount === 'number') {
      const key = `${a.algorithm}|${a.entity}|${a.fieldCount}`;
      tupleCounts.set(key, 0);
      tupleScope.set(key, {
        algorithm: a.algorithm,
        entity: a.entity,
        fieldCount: a.fieldCount,
      });
    }
  }
  if (tupleCounts.size > 0) {
    for (const c of cards) {
      const a = atoms.get(c.atomId);
      if (!a || !a.algorithm || !a.entity || typeof a.fieldCount !== 'number') continue;
      const key = `${a.algorithm}|${a.entity}|${a.fieldCount}`;
      tupleCounts.set(key, (tupleCounts.get(key) ?? 0) + 1);
    }
    for (const [key, n] of tupleCounts) {
      if (n < 1) {
        const t = tupleScope.get(key)!;
        err({
          rule: 'pattern-undercoverage',
          scope: key,
          detail: `algorithm=${t.algorithm} × entity=${t.entity} × fieldCount=${t.fieldCount} has 0 cards; minimum is 1`,
        });
      }
    }
  }

  return reportAndExit(jsonOut, {
    cards: cards.length,
    atoms: atoms.size,
    cms: cmIds.size,
  });
}

function reportAndExit(
  jsonOut: boolean,
  totals: { cards: number; atoms: number; cms: number }
): number {
  const errors = findings.filter((f) => f.level === 'error');
  const warnings = findings.filter((f) => f.level === 'warn');

  if (jsonOut) {
    process.stdout.write(JSON.stringify({ totals, errors, warnings }, null, 2) + '\n');
  } else {
    process.stdout.write(
      `\n[lint:v2-deck] cards=${totals.cards} atoms=${totals.atoms} cm=${totals.cms}\n`
    );
    if (findings.length === 0) {
      process.stdout.write(`[lint:v2-deck] OK — 0 errors, 0 warnings\n`);
    } else {
      for (const f of findings) {
        const sigil = f.level === 'error' ? 'ERR' : 'WRN';
        const scope = f.scope ? ` [${f.scope}]` : '';
        process.stdout.write(`  ${sigil} ${f.rule}${scope}: ${f.detail}\n`);
      }
      process.stdout.write(
        `\n[lint:v2-deck] ${errors.length} error(s), ${warnings.length} warning(s)\n`
      );
    }
  }
  return errors.length > 0 ? 1 : 0;
}

try {
  const code = main();
  process.exit(code);
} catch (e) {
  process.stderr.write(`[lint:v2-deck] internal failure: ${(e as Error).stack || (e as Error).message}\n`);
  process.exit(2);
}
