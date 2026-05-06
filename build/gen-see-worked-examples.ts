// M16+M19 — Generate demo-style cards from outlines/worked_examples/Q*.yml.
// Per docs/14: "Q-archetype demo-style cards".
// M19: uses per-example atom_id instead of hardcoded Q_ANCHOR.
// Writes: data/see-worked-example-cards.json
// Idempotent: re-run safe.

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { glob } from 'glob';
import { load as yamlLoad } from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '..');

// Fallback anchors if atom_id missing (legacy compat)
const Q_ANCHOR: Record<string, string> = {
  Q1: 'HE-01',
  Q2: 'SW-01',
  Q3: 'RW-01',
  Q4: 'MW-01',
};

interface WorkedExample {
  id: string;
  atom_id?: string;
  variant_name: string;
  explanation: string;
  expected_output?: string;
  highlights: string[];
  code: string;
}

interface WorkedExampleFile {
  question: string;
  examples: WorkedExample[];
}

interface DemoCard {
  type: 'demo';
  atomId: string;
  whyOneLine: string;
  demoCode: string;
  highlightTokens: string[];
  usedIn: string[];
}

async function main() {
  const files = await glob('outlines/worked_examples/Q*.yml', { cwd: ROOT, absolute: true });
  files.sort();

  const cards: DemoCard[] = [];
  const atomCoverage = new Map<string, number>();

  for (const f of files) {
    const wf = yamlLoad(readFileSync(f, 'utf8')) as WorkedExampleFile;
    if (!wf?.question || !wf.examples?.length) {
      console.warn(`skip ${f}: missing question/examples`);
      continue;
    }

    const q = wf.question;

    for (const ex of wf.examples) {
      const atomId = ex.atom_id ?? Q_ANCHOR[q] ?? q;
      const code = ex.code.trimEnd();
      const validHighlights = (ex.highlights ?? []).filter((h) => code.includes(h));

      cards.push({
        type: 'demo',
        atomId,
        whyOneLine: ex.explanation,
        demoCode: code,
        highlightTokens: validHighlights,
        usedIn: [q],
      });

      atomCoverage.set(atomId, (atomCoverage.get(atomId) ?? 0) + 1);
    }
  }

  const outPath = resolve(ROOT, 'data/see-worked-example-cards.json');
  writeFileSync(outPath, JSON.stringify(cards, null, 2) + '\n');
  console.log(`worked-example demo cards: ${cards.length} emitted across ${atomCoverage.size} atoms`);

  for (const [atom, count] of [...atomCoverage.entries()].sort()) {
    console.log(`  ${atom}: ${count}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
