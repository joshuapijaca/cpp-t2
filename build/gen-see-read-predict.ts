// M16+M20 — Generate read-and-predict cards (demo subtype with prediction framing).
// Per docs/14: "strategic prediction cards" (~200, tunable).
// M20: fallback chain canonical_example → see_demo.snippet for broader coverage.
// Uses DemoCard type — prediction is cognitive framing via whyOneLine, not a new component.
// Writes: data/see-read-predict-cards.json
// Idempotent: re-run safe.

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { glob } from 'glob';
import { load as yamlLoad } from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '..');

interface Outline {
  id: string;
  fact: string;
  level: number;
  canonical_example?: string;
  expected_output?: string;
  q_tags?: Record<string, string>;
  render_hints?: {
    see_demo?: {
      snippet?: string | null;
      highlights?: string[];
    };
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

  const outlines: Outline[] = [];
  for (const f of files) {
    const o = yamlLoad(readFileSync(f, 'utf8')) as Outline;
    if (o?.id) outlines.push(o);
  }

  const cards: DemoCard[] = [];
  let fromCanonical = 0;
  let fromDemo = 0;
  let skipped = 0;

  for (const o of outlines) {
    const snippet = o.canonical_example?.trim() || o.render_hints?.see_demo?.snippet?.trim();
    if (!snippet) { skipped++; continue; }

    const code = snippet.trimEnd();
    const output = o.expected_output?.trim();

    const usedIn = Object.entries(o.q_tags ?? {})
      .filter(([, v]) => v === 'C')
      .map(([k]) => k);

    const whyOneLine = output
      ? `Predict: what does this produce? (answer: ${output})`
      : `Read this code. What does ${o.id} (${o.fact}) do here?`;

    const highlights = o.render_hints?.see_demo?.highlights ?? [];
    const validHighlights = highlights.filter((h) => code.includes(h));

    cards.push({
      type: 'demo',
      atomId: o.id,
      whyOneLine,
      demoCode: code,
      highlightTokens: validHighlights,
      usedIn,
    });

    if (o.canonical_example?.trim()) fromCanonical++;
    else fromDemo++;
  }

  const outPath = resolve(ROOT, 'data/see-read-predict-cards.json');
  writeFileSync(outPath, JSON.stringify(cards, null, 2) + '\n');

  const withPrediction = cards.filter((c) => c.whyOneLine.startsWith('Predict:')).length;
  console.log(`read-predict cards: ${cards.length} emitted (${fromCanonical} from canonical, ${fromDemo} from demo snippet)`);
  console.log(`  prediction-framed: ${withPrediction} | generic-framed: ${cards.length - withPrediction}`);
  console.log(`  skipped (no snippet): ${skipped}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
