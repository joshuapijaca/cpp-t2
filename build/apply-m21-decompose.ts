// M21 — Apply purpose-authored decompose snippets to fallback atoms.
// Reads: data/m21-decompose-snippets.yml (named snippets + atom assignments)
// Writes: outlines/L*/[A-Za-z]*.yml (updates see_decompose.snippet)
// Idempotent: re-run safe.

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { glob } from 'glob';
import { load as yamlLoad, dump as yamlDump } from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '..');

interface SnippetData {
  snippets: Record<string, string>;
  assignments: Record<string, string>;
}

async function main() {
  const dataPath = resolve(ROOT, 'data/m21-decompose-snippets.yml');
  const data = yamlLoad(readFileSync(dataPath, 'utf8')) as SnippetData;

  const resolved = new Map<string, string>();
  for (const [atomId, snippetName] of Object.entries(data.assignments)) {
    const snippet = data.snippets[snippetName];
    if (!snippet) {
      console.error(`ERROR: snippet "${snippetName}" not found for ${atomId}`);
      process.exit(1);
    }
    resolved.set(atomId, snippet.trimEnd());
  }

  const files = await glob('outlines/L*/[A-Za-z]*.yml', { cwd: ROOT, absolute: true });
  files.sort();

  let applied = 0;
  let skipped = 0;

  for (const f of files) {
    const content = readFileSync(f, 'utf8');
    const o = yamlLoad(content) as Record<string, unknown>;
    if (!o?.id) continue;

    const id = o.id as string;
    const snippet = resolved.get(id);
    if (!snippet) { skipped++; continue; }

    const rh = (o.render_hints ?? {}) as Record<string, unknown>;
    const decomp = (rh.see_decompose ?? {}) as Record<string, unknown>;
    decomp.snippet = snippet;
    rh.see_decompose = decomp;
    o.render_hints = rh;

    writeFileSync(f, yamlDump(o, { lineWidth: 120, noRefs: true, sortKeys: false }));
    applied++;
  }

  console.log(`applied: ${applied} | skipped: ${skipped} | target: ${resolved.size}`);
  if (applied !== resolved.size) {
    console.error(`WARNING: expected ${resolved.size} but applied ${applied}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
