// One-shot normalizer — convert atom IDs of the form `<PREFIX>-<single-digit>` to
// `<PREFIX>-0<digit>` whenever the zero-padded form is the canonical known atom.
//
// This fixes pre-existing data quality issues in `deps:` (and the see_decompose
// `correct_atoms`/`distractors` fields derived from them) where atoms like
// `R-3` were written instead of `R-03`. Topo-sort tolerates both, but the SEE
// lint catches them as "unknown atom".
//
// Idempotent.

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { glob } from 'glob';
import { load as yamlLoad } from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '..');

async function main() {
  const files = await glob('outlines/**/*.yml', { cwd: ROOT, absolute: true });

  // Collect canonical atom IDs from the per-atom outline files only.
  const known = new Set<string>();
  for (const f of files) {
    if (f.includes('walkthroughs') || f.includes('worked_examples')) continue;
    const o = yamlLoad(readFileSync(f, 'utf8')) as { id?: string };
    if (o?.id) known.add(o.id);
  }

  let totalRewrites = 0;
  const rewrittenFiles: string[] = [];

  for (const f of files) {
    const raw = readFileSync(f, 'utf8');
    let next = raw;

    // Match `[A-Z]{1,2}-<single digit>` token-bounded.
    next = next.replace(/\b([A-Z]{1,2})-(\d)\b/g, (m, prefix, digit) => {
      const candidate = `${prefix}-0${digit}`;
      if (known.has(candidate) && !known.has(m)) {
        return candidate;
      }
      return m;
    });

    if (next !== raw) {
      const before = raw.length;
      const after = next.length;
      writeFileSync(f, next);
      rewrittenFiles.push(f.replace(ROOT, '').replace(/\\/g, '/'));
      totalRewrites += Math.max(0, after - before);
    }
  }

  console.log(`normalize-atom-ids: rewrote ${rewrittenFiles.length} file(s)`);
  for (const r of rewrittenFiles) console.log(`  ${r}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
