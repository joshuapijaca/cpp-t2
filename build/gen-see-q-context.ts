// M18 — Generate Q-context demo cards for C-tagged atoms.
// Each atom × Q combination where q_tags[Qn] === 'C' → one demo card
// with Q-framed whyOneLine ("In Q2 you'll write structs like this…").
// Writes: data/see-q-context-cards.json
// Idempotent: re-run safe.

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
  fact: string;
  canonical_example?: string;
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

const Q_SKILL: Record<string, string> = {
  Q1: 'trace through code like this by hand — predict what happens',
  Q2: 'write struct code like this from scratch',
  Q3: 'read a function like this and explain what it does',
  Q4: 'write a complete program using this pattern',
};

function qFramedWhy(qNum: string, atomId: string, fact: string): string {
  const skill = Q_SKILL[qNum] ?? `use ${atomId} in your answer`;
  return `${qNum} asks you to ${skill}. Key concept: ${fact}`;
}

async function main() {
  const files = await glob('outlines/L*/[A-Za-z]*.yml', { cwd: ROOT, absolute: true });
  files.sort();

  const cards: DemoCard[] = [];
  let skippedNoSnippet = 0;
  let skippedNoQ = 0;

  for (const f of files) {
    const o = yamlLoad(readFileSync(f, 'utf8')) as Outline;
    if (!o?.id) continue;

    const qTags = o.q_tags;
    if (!qTags) { skippedNoQ++; continue; }

    const cQs = Object.entries(qTags)
      .filter(([, v]) => v === 'C')
      .map(([k]) => k);

    if (cQs.length === 0) { skippedNoQ++; continue; }

    const snippet = o.render_hints?.see_demo?.snippet ?? o.canonical_example;
    if (!snippet?.trim()) { skippedNoSnippet++; continue; }

    const code = snippet.trimEnd();
    const highlights = o.render_hints?.see_demo?.highlights ?? [];
    const validHighlights = highlights.filter((h) => code.includes(h));

    for (const q of cQs) {
      cards.push({
        type: 'demo',
        atomId: o.id,
        whyOneLine: qFramedWhy(q, o.id, o.fact),
        demoCode: code,
        highlightTokens: validHighlights,
        usedIn: [q],
      });
    }
  }

  const outPath = resolve(ROOT, 'data/see-q-context-cards.json');
  writeFileSync(outPath, JSON.stringify(cards, null, 2) + '\n');

  const qCounts: Record<string, number> = {};
  for (const c of cards) {
    const q = c.usedIn[0];
    qCounts[q] = (qCounts[q] ?? 0) + 1;
  }

  console.log(`q-context cards: ${cards.length} emitted (${skippedNoSnippet} skipped no-snippet, ${skippedNoQ} skipped no-C-tag)`);
  for (const [q, n] of Object.entries(qCounts).sort()) {
    console.log(`  ${q}: ${n}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
