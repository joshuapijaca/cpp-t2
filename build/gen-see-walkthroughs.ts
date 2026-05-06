// M16 — Generate walkthrough cards from outlines/walkthroughs/*.yml.
// Writes: data/see-walkthrough-cards.json
// Idempotent: re-run safe.

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { glob } from 'glob';
import { load as yamlLoad } from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '..');

interface WalkthroughYaml {
  id: string;
  level: number;
  level_label: string;
  anchor_atom_id: string;
  full_code: string;
  steps: Array<{
    line: number;
    code: string;
    annotation: string;
    atom_ids: string[];
  }>;
}

interface WalkthroughCard {
  type: 'walkthrough';
  atomId: string;
  levelLabel: string;
  fullCode: string;
  steps: Array<{
    line: number;
    code: string;
    annotation: string;
    atomIds: string[];
  }>;
}

async function main() {
  const files = await glob('outlines/walkthroughs/*.yml', { cwd: ROOT, absolute: true });
  files.sort();

  const cards: WalkthroughCard[] = [];

  for (const f of files) {
    const wt = yamlLoad(readFileSync(f, 'utf8')) as WalkthroughYaml;
    if (!wt?.id || !wt.full_code || !wt.steps?.length) {
      console.warn(`skip ${f}: missing id/full_code/steps`);
      continue;
    }

    cards.push({
      type: 'walkthrough',
      atomId: wt.anchor_atom_id,
      levelLabel: wt.level_label,
      fullCode: wt.full_code.trimEnd(),
      steps: wt.steps.map((s) => ({
        line: s.line,
        code: s.code,
        annotation: s.annotation,
        atomIds: s.atom_ids,
      })),
    });
  }

  const outPath = resolve(ROOT, 'data/see-walkthrough-cards.json');
  writeFileSync(outPath, JSON.stringify(cards, null, 2) + '\n');
  console.log(`walkthrough cards: ${cards.length} emitted`);
}

main().catch((e) => { console.error(e); process.exit(1); });
