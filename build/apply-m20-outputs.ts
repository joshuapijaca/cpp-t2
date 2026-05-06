// M20 — Apply expected_output to atom outlines.
// Reads: data/m20-expected-outputs.yml (atomId → expected_output string)
// Writes: outlines/L*/[A-Za-z]*.yml (adds expected_output field)
// Idempotent: re-run safe, overwrites existing expected_output if present.

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { glob } from 'glob';
import { load as yamlLoad, dump as yamlDump } from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '..');

async function main() {
  const outputsPath = resolve(ROOT, 'data/m20-expected-outputs.yml');
  const outputs = yamlLoad(readFileSync(outputsPath, 'utf8')) as Record<string, string>;

  const files = await glob('outlines/L*/[A-Za-z]*.yml', { cwd: ROOT, absolute: true });
  files.sort();

  let applied = 0;
  let skipped = 0;
  let alreadyHad = 0;

  for (const f of files) {
    const content = readFileSync(f, 'utf8');
    const o = yamlLoad(content) as Record<string, unknown>;
    if (!o?.id) continue;

    const id = o.id as string;
    const output = outputs[id];
    if (!output) { skipped++; continue; }

    if (o.expected_output) { alreadyHad++; }

    o.expected_output = output;
    writeFileSync(f, yamlDump(o, { lineWidth: 120, noRefs: true, sortKeys: false }));
    applied++;
  }

  console.log(`applied: ${applied} | already had: ${alreadyHad} | skipped: ${skipped}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
