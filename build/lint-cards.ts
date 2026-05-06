// Build-time lint pipeline. Enforces Miller's law + forbidden tokens + dedup.
// Spec: ../docs/11_build_outline.md §"Lint Pipeline".
//
// Run: npm run lint:cards

import yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { glob } from 'glob';
import { createHash } from 'crypto';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const OUTLINE_GLOB = 'outlines/**/*.yml';
const CARDS_PATH = 'data/cards.json';

interface MemorizeCard {
  type: 'memorize';
  atomId: string;
  fact: string;
  flashSeconds: number;
  mode: 'race' | 'recall';
  keyChecks: string[];
  explanation: string;
}

interface Outline {
  id: string;
  level: number;
  status: string;
  lint?: { forbid_tokens?: string[]; miller_max_words?: number };
  acceptance?: { memorize?: string[] };
}

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function loadOutlinesById(): Map<string, Outline> {
  const files = glob.sync(OUTLINE_GLOB, { cwd: ROOT });
  const m = new Map<string, Outline>();
  for (const f of files) {
    const o = yaml.load(readFileSync(resolve(ROOT, f), 'utf8')) as Outline;
    if (o && o.id) m.set(o.id, o);
  }
  return m;
}

function loadCards(): MemorizeCard[] {
  return JSON.parse(readFileSync(resolve(ROOT, CARDS_PATH), 'utf8')) as MemorizeCard[];
}

interface LintError {
  cardIdx: number;
  atomId: string;
  rule: string;
  detail: string;
}

function lint(): LintError[] {
  const outlines = loadOutlinesById();
  const cards = loadCards();
  const errs: LintError[] = [];
  const hashes = new Map<string, number>();

  cards.forEach((c, i) => {
    const o = outlines.get(c.atomId);
    if (!o) {
      errs.push({ cardIdx: i, atomId: c.atomId, rule: 'unknown-atom', detail: `No outline for ${c.atomId}` });
      return;
    }

    if (c.type !== 'memorize') return;

    const millerMax = o.lint?.miller_max_words ?? 7;
    const wc = wordCount(c.fact);
    if (wc > millerMax) {
      errs.push({
        cardIdx: i,
        atomId: c.atomId,
        rule: 'miller',
        detail: `fact has ${wc} words (max ${millerMax}): "${c.fact}"`,
      });
    }

    const forbid = o.lint?.forbid_tokens ?? [];
    const lowerFact = c.fact.toLowerCase();
    for (const t of forbid) {
      if (lowerFact.includes(t.toLowerCase())) {
        errs.push({
          cardIdx: i,
          atomId: c.atomId,
          rule: 'forbidden-token',
          detail: `fact contains forbidden "${t}": "${c.fact}"`,
        });
      }
    }

    if (!Array.isArray(c.keyChecks) || c.keyChecks.length === 0) {
      errs.push({
        cardIdx: i,
        atomId: c.atomId,
        rule: 'empty-keychecks',
        detail: `keyChecks empty`,
      });
    }

    const normFact = c.fact.toLowerCase().replace(/\s+/g, ' ').trim();
    for (const k of c.keyChecks ?? []) {
      const normK = k.toLowerCase().replace(/\s+/g, ' ').trim();
      if (!normFact.includes(normK)) {
        errs.push({
          cardIdx: i,
          atomId: c.atomId,
          rule: 'keycheck-not-in-fact',
          detail: `keyCheck "${k}" not substring of fact "${c.fact}"`,
        });
      }
    }

    const key = createHash('sha256').update(`${c.atomId}|${c.fact}`).digest('hex');
    if (hashes.has(key)) {
      errs.push({
        cardIdx: i,
        atomId: c.atomId,
        rule: 'duplicate',
        detail: `duplicate of card ${hashes.get(key)}`,
      });
    } else {
      hashes.set(key, i);
    }
  });

  return errs;
}

const errs = lint();
if (errs.length === 0) {
  console.log(`✓ lint pass`);
  process.exit(0);
}
console.error(`✕ ${errs.length} lint error(s):`);
for (const e of errs) {
  console.error(`  [${e.atomId}#${e.cardIdx}] ${e.rule}: ${e.detail}`);
}
process.exit(1);
