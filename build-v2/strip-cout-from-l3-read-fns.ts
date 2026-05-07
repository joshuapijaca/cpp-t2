/**
 * strip-cout-from-l3-read-fns.ts
 *
 * Q3 read functions on the SIT102 Test 2 exam are PURE INPUT — no cout.
 * The L3 audit (W10) flagged 138 cards whose canonicalAnswer / expectedAnswer
 * include cout-prompt lines like:
 *
 *   cout << "Enter ID: ";
 *
 * inserted to make drill-practice more interactive. These are
 * pedagogically friendly but exam-incorrect. This script strips all
 * cout statements from the answer fields of L3 cards whose function
 * is a read function (signature contains "read_").
 *
 * Affected fields: canonicalAnswer, expectedAnswer.
 * Untouched fields: stem, code, explanation (those describe context).
 *
 * Idempotent: safe to re-run.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

interface Stats {
  scanned: number;
  modified: number;
  perFileLinesRemoved: Record<string, number>;
}

/** Detect whether a code blob is a read-function answer. */
function isReadFnAnswer(code: string): boolean {
  return /\bvoid\s+read_\w+/.test(code);
}

/** Remove cout-only lines from a function body. Returns [newCode, removedCount]. */
function stripCoutLines(code: string): [string, number] {
  const lines = code.split('\n');
  let removed = 0;
  const out: string[] = [];
  for (const line of lines) {
    // Match a line that is essentially a cout statement (possibly indented).
    if (/^\s*cout\s*<<.*;\s*$/.test(line)) {
      removed++;
      continue;
    }
    out.push(line);
  }
  return [out.join('\n'), removed];
}

async function main() {
  const stats: Stats = { scanned: 0, modified: 0, perFileLinesRemoved: {} };
  const files = await glob('data/v2/cards/L3/**/*.yml', { cwd: ROOT });

  for (const f of files) {
    const abs = resolve(ROOT, f);
    let raw: string;
    try {
      raw = readFileSync(abs, 'utf8');
    } catch {
      continue;
    }
    let parsed: unknown;
    try {
      parsed = yaml.load(raw);
    } catch {
      continue;
    }
    stats.scanned++;
    if (!parsed || typeof parsed !== 'object') continue;
    const card = parsed as Record<string, unknown>;

    let totalRemoved = 0;
    let touched = false;

    for (const field of ['canonicalAnswer', 'expectedAnswer']) {
      const v = card[field];
      if (typeof v !== 'string' || !isReadFnAnswer(v)) continue;
      const [next, removed] = stripCoutLines(v);
      if (removed > 0 && next !== v) {
        card[field] = next;
        totalRemoved += removed;
        touched = true;
      }
    }

    // Also handle ProceduralCard variants[].expectedAnswer.
    if (Array.isArray(card.variants)) {
      const variants = card.variants as Array<Record<string, unknown>>;
      for (const variant of variants) {
        const v = variant.expectedAnswer;
        if (typeof v !== 'string' || !isReadFnAnswer(v)) continue;
        const [next, removed] = stripCoutLines(v);
        if (removed > 0 && next !== v) {
          variant.expectedAnswer = next;
          totalRemoved += removed;
          touched = true;
        }
      }
    }

    if (touched) {
      stats.modified++;
      stats.perFileLinesRemoved[f] = totalRemoved;
      const dumped = yaml.dump(card, { lineWidth: 120, noRefs: true });
      writeFileSync(abs, dumped, 'utf8');
    }
  }

  console.log(
    `strip-cout-from-l3-read-fns: scanned ${stats.scanned} files, modified ${stats.modified}, removed ${Object.values(
      stats.perFileLinesRemoved,
    ).reduce((a, b) => a + b, 0)} cout lines total.`,
  );
}

void main();
