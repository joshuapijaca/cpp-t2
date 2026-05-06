// M22 — Apply mini-SEE content to 12 zero-snippet atoms (P-01..P-07, ME-01..ME-05).
// Reads: data/m22-mini-see.yml
// Writes: outlines/L-1/P-*.yml, outlines/L17/ME-*.yml
// Idempotent: re-run safe.

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { glob } from 'glob';
import { load as yamlLoad, dump as yamlDump } from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '..');

interface AtomContent {
  canonical_example: string;
  expected_output: string;
  see_demo_snippet: string;
  see_demo_highlights: string[];
  see_decompose_snippet: string;
}

interface DataFile {
  atoms: Record<string, AtomContent>;
}

async function main() {
  const dataPath = resolve(ROOT, 'data/m22-mini-see.yml');
  const data = yamlLoad(readFileSync(dataPath, 'utf8')) as DataFile;

  const files = await glob('outlines/L*/[A-Za-z]*.yml', { cwd: ROOT, absolute: true });
  files.sort();

  let applied = 0;

  for (const f of files) {
    const o = yamlLoad(readFileSync(f, 'utf8')) as Record<string, unknown>;
    if (!o?.id) continue;

    const id = o.id as string;
    const content = data.atoms[id];
    if (!content) continue;

    o.canonical_example = content.canonical_example.trimEnd();
    o.expected_output = content.expected_output;

    const rh = (o.render_hints ?? {}) as Record<string, unknown>;

    const demo = (rh.see_demo ?? {}) as Record<string, unknown>;
    demo.snippet = content.see_demo_snippet.trimEnd();
    demo.highlights = content.see_demo_highlights;
    rh.see_demo = demo;

    const decomp = (rh.see_decompose ?? {}) as Record<string, unknown>;
    decomp.snippet = content.see_decompose_snippet.trimEnd();
    rh.see_decompose = decomp;

    o.render_hints = rh;

    writeFileSync(f, yamlDump(o, { lineWidth: 120, noRefs: true, sortKeys: false }));
    applied++;
  }

  console.log(`applied: ${applied} / ${Object.keys(data.atoms).length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
