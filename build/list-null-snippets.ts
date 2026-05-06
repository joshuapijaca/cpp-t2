// One-shot debug helper — list atoms whose see_demo.snippet is still null.
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { glob } from 'glob';

const ROOT = resolve(import.meta.dirname, '..');

async function main() {
  const files = await glob('outlines/L*/[A-Za-z]*.yml', { cwd: ROOT, absolute: true });
  files.sort();
  const out: string[] = [];
  for (const f of files) {
    const raw = readFileSync(f, 'utf8');
    // First `snippet: null` after `see_demo:` (under render_hints)
    const m = raw.match(/^ {2}see_demo:[\s\S]*?\n {4}snippet: null/m);
    if (m) {
      const idMatch = raw.match(/^id:\s*(\S+)/m);
      if (idMatch) out.push(idMatch[1]!);
    }
  }
  console.log(out.length);
  console.log(out.join('\n'));
}

main();
