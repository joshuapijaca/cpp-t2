// Debug helper — dump (id, fact, q_tags, deps) for every outline.
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { glob } from 'glob';
import { load } from 'js-yaml';

interface Outline {
  id: string;
  fact?: string;
  level?: number;
  deps?: string[];
  q_tags?: Record<string, string>;
}

const ROOT = resolve(import.meta.dirname, '..');

async function main() {
  const files = await glob('outlines/L*/[A-Za-z]*.yml', { cwd: ROOT, absolute: true });
  files.sort();
  const out: Outline[] = [];
  for (const f of files) {
    const o = load(readFileSync(f, 'utf8')) as Outline;
    if (o?.id) out.push(o);
  }
  out.sort((a, b) => (a.level ?? -99) - (b.level ?? -99) || a.id.localeCompare(b.id));
  let lastLevel = -999;
  for (const o of out) {
    if (o.level !== lastLevel) {
      console.log(`\n# === Level ${o.level} (${o.id.split('-')[0]}-) ===`);
      lastLevel = o.level ?? -999;
    }
    const tags = o.q_tags ?? {};
    const tagStr = ['Q1', 'Q2', 'Q3', 'Q4'].map((q) => `${q}:${tags[q] ?? '?'}`).join(' ');
    console.log(`${o.id.padEnd(7)} ${(o.fact ?? '').padEnd(48)} [${tagStr}]`);
  }
}

main();
