// M16 — Generate demo cards from outline see_demo fields.
// Reads: outlines/L*/[A-Za-z]*.yml → render_hints.see_demo
// Writes: data/see-demo-cards.json
// Idempotent: re-run safe, overwrites output.

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { glob } from 'glob';
import { load as yamlLoad } from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '..');

interface SeeDemo {
  why_one_line: string;
  snippet: string | null;
  highlights: string[];
  used_in: string[];
}

interface Outline {
  id: string;
  q_tags?: Record<string, string>;
  render_hints?: {
    see_demo?: SeeDemo;
  };
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
  const files = await glob('outlines/L*/[A-Za-z]*.yml', { cwd: ROOT, absolute: true });
  files.sort();

  const cards: DemoCard[] = [];
  let skipped = 0;

  for (const f of files) {
    const o = yamlLoad(readFileSync(f, 'utf8')) as Outline;
    if (!o?.id) continue;

    const demo = o.render_hints?.see_demo;
    if (!demo?.snippet) {
      skipped++;
      continue;
    }

    const usedIn = demo.used_in?.length
      ? demo.used_in
      : deriveUsedIn(o.q_tags);

    cards.push({
      type: 'demo',
      atomId: o.id,
      whyOneLine: demo.why_one_line,
      demoCode: demo.snippet.trimEnd(),
      highlightTokens: demo.highlights ?? [],
      usedIn,
    });
  }

  const outPath = resolve(ROOT, 'data/see-demo-cards.json');
  writeFileSync(outPath, JSON.stringify(cards, null, 2) + '\n');
  console.log(`demo cards: ${cards.length} emitted, ${skipped} skipped (null snippet)`);
}

function deriveUsedIn(qTags?: Record<string, string>): string[] {
  if (!qTags) return [];
  return Object.entries(qTags)
    .filter(([, v]) => v === 'C')
    .map(([k]) => k);
}

main().catch((e) => { console.error(e); process.exit(1); });
