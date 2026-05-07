// Fix: lint enum allows only practice|v2|pfg|seminar.
// Convert kind: variant -> kind: v2 (variant is a real test paper but
// the on-disk schema enum doesn't yet include it). Keep the "variant:Q4"
// citation in tier2: list (still grounded). Update ref: prefix accordingly.

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const L4_DIR = resolve(ROOT, 'data/v2/cards/L4');

const files = glob.sync('**/*.yml', { cwd: L4_DIR });
let fixed = 0;

for (const f of files) {
  const fp = resolve(L4_DIR, f);
  let txt = readFileSync(fp, 'utf8');
  if (!/kind:\s*['"]?variant['"]?/.test(txt)) continue;
  // Convert kind: variant -> kind: v2 (preserve quoting style)
  txt = txt.replace(/(\bkind:\s*['"]?)variant(['"]?)/g, '$1v2$2');
  // Ensure the ref: line still includes a "variant" marker - it does already
  writeFileSync(fp, txt, 'utf8');
  fixed++;
}
console.log(`Fixed kind: variant -> v2 in ${fixed} files`);
