/**
 * smoke-test.ts — cpp-t2 v2 deck smoke test.
 *
 * Loads every YAML under data/v2/cards/<L0..L5>/<atom>/*.yml, validates
 * each against the locked Zod schema, and prints:
 *   - total file count
 *   - total card count (some YAMLs are arrays)
 *   - per-level breakdown
 *   - per-card-type breakdown
 *   - schema failures grouped by atom
 *
 * This is the "did the deck make it through" gate — distinct from
 * lint-cards.ts which is the per-card authoring gate. Both share the
 * Zod schema; smoke-test is intentionally permissive (warns on every
 * failure, exits 0) so you can run it during development.
 *
 * Exit code:
 *   0 — always (informational)
 *   2 — internal failure (no cards directory, etc.)
 *
 * Usage:
 *   npm run smoke:v2          # tsx build-v2/smoke-test.ts
 *   npm run smoke:v2 -- --strict  # exit 1 if any failures
 *   npm run smoke:v2 -- --json    # machine-readable JSON report
 */

import yaml from 'js-yaml';
import { readFileSync, existsSync, statSync } from 'fs';
import { glob } from 'glob';
import { resolve, relative } from 'path';
import { Card } from '../src-v2/types/card-schema.js';

const ROOT = resolve(import.meta.dirname, '..');
const CARDS_GLOB = 'data/v2/cards/**/*.yml';

interface SchemaFailure {
  file: string;
  atomId: string | null;
  cardId: string | null;
  issues: string[];
}

interface SmokeReport {
  totalFiles: number;
  totalCards: number;
  validCards: number;
  invalidCards: number;
  perLevel: Record<string, number>;
  perType: Record<string, number>;
  perAtomFailures: Record<string, SchemaFailure[]>;
  failures: SchemaFailure[];
}

function deriveLevel(path: string): string {
  // data/v2/cards/L3/F-12/foo.yml → "L3"
  const m = path.match(/[\\/]cards[\\/](L\d+)[\\/]/);
  return m?.[1] ?? 'unknown';
}

function loadYamlEntries(file: string): unknown[] {
  const txt = readFileSync(file, 'utf8');
  const parsed = yaml.load(txt);
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === 'object') return [parsed];
  return [];
}

function buildReport(rootDir: string = ROOT): SmokeReport {
  const cardsRoot = resolve(rootDir, 'data/v2/cards');
  if (!existsSync(cardsRoot) || !statSync(cardsRoot).isDirectory()) {
    throw new Error(`cards directory not found at ${cardsRoot}`);
  }
  const files = glob.sync(CARDS_GLOB, { cwd: rootDir });

  const perLevel: Record<string, number> = {};
  const perType: Record<string, number> = {};
  const failures: SchemaFailure[] = [];
  const perAtomFailures: Record<string, SchemaFailure[]> = {};

  let totalCards = 0;
  let validCards = 0;
  let invalidCards = 0;

  for (const rel of files) {
    const abs = resolve(rootDir, rel);
    const lvl = deriveLevel(rel);

    let entries: unknown[];
    try {
      entries = loadYamlEntries(abs);
    } catch (e) {
      const fail: SchemaFailure = {
        file: rel,
        atomId: null,
        cardId: null,
        issues: [`yaml-parse: ${(e as Error).message}`],
      };
      failures.push(fail);
      continue;
    }

    for (const entry of entries) {
      totalCards++;
      const r = Card.safeParse(entry);
      if (r.success) {
        validCards++;
        perLevel[lvl] = (perLevel[lvl] ?? 0) + 1;
        const t = r.data.type;
        perType[t] = (perType[t] ?? 0) + 1;
      } else {
        invalidCards++;
        const e = entry as { id?: string; atomId?: string };
        const fail: SchemaFailure = {
          file: rel,
          atomId: typeof e.atomId === 'string' ? e.atomId : null,
          cardId: typeof e.id === 'string' ? e.id : null,
          issues: r.error.issues.map(
            (i) => `${i.path.join('.') || '<root>'}: ${i.message}`,
          ),
        };
        failures.push(fail);
        const atomKey = fail.atomId ?? '<no-atom>';
        if (!perAtomFailures[atomKey]) perAtomFailures[atomKey] = [];
        perAtomFailures[atomKey].push(fail);
      }
    }
  }

  return {
    totalFiles: files.length,
    totalCards,
    validCards,
    invalidCards,
    perLevel,
    perType,
    perAtomFailures,
    failures,
  };
}

// ────────────────────────────────────────────────────────────────────
// CLI
// ────────────────────────────────────────────────────────────────────

function printReport(rep: SmokeReport, verbose = false) {
  process.stdout.write(`\n[smoke:v2] scanned ${rep.totalFiles} files, ${rep.totalCards} card entries\n`);
  process.stdout.write(`[smoke:v2] valid: ${rep.validCards}   invalid: ${rep.invalidCards}\n`);

  process.stdout.write(`\n  per level:\n`);
  const lvls = Object.keys(rep.perLevel).sort();
  for (const l of lvls) {
    process.stdout.write(`    ${l.padEnd(6)} ${rep.perLevel[l]}\n`);
  }

  process.stdout.write(`\n  per card type (top 12):\n`);
  const typeRows = Object.entries(rep.perType).sort((a, b) => b[1] - a[1]).slice(0, 12);
  for (const [t, n] of typeRows) {
    process.stdout.write(`    ${t.padEnd(28)} ${n}\n`);
  }

  if (rep.invalidCards > 0) {
    process.stdout.write(`\n  schema failures by atom (top 10 atoms by fail count):\n`);
    const atomRows = Object.entries(rep.perAtomFailures)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 10);
    for (const [atom, fs] of atomRows) {
      process.stdout.write(`    ${atom.padEnd(12)} ${fs.length} card(s) failed\n`);
      if (verbose) {
        for (const f of fs.slice(0, 3)) {
          process.stdout.write(`      └ ${relative(ROOT, resolve(ROOT, f.file))}\n`);
          for (const iss of f.issues.slice(0, 3)) {
            process.stdout.write(`         · ${iss}\n`);
          }
        }
      }
    }
    process.stdout.write(`\n  (re-run with --verbose to see per-file issues)\n`);
  }
}

function main(): number {
  const argv = process.argv.slice(2);
  const json = argv.includes('--json');
  const strict = argv.includes('--strict');
  const verbose = argv.includes('--verbose');

  let rep: SmokeReport;
  try {
    rep = buildReport();
  } catch (e) {
    process.stderr.write(`[smoke:v2] internal failure: ${(e as Error).message}\n`);
    return 2;
  }

  if (json) {
    process.stdout.write(JSON.stringify(rep, null, 2) + '\n');
  } else {
    printReport(rep, verbose);
  }

  if (strict && rep.invalidCards > 0) return 1;
  return 0;
}

const isCli = (() => {
  if (!process.argv[1]) return false;
  return resolve(process.argv[1]).toLowerCase().includes('smoke-test');
})();

if (isCli) process.exit(main());

export { buildReport };
export type { SmokeReport, SchemaFailure };
