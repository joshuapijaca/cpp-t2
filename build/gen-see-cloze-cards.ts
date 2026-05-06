// Generate cloze cards from hand-authored YAML.
// Reads: data/cloze-authored.yml + outlines (for code snippets)
// Writes: data/see-cloze-cards.json
// Idempotent.

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { glob } from 'glob';
import { load as yamlLoad } from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '..');

interface AuthoredCloze {
  atomId: string;
  sentence: string;
  answer: string;
}

interface ClozeCard {
  type: 'cloze';
  atomId: string;
  code: string;
  clozeSentence: string;
  answer: string;
  explanation: string;
}

async function main() {
  // Load authored cloze content
  const srcPath = resolve(ROOT, 'data/cloze-authored.yml');
  const authored: AuthoredCloze[] = yamlLoad(readFileSync(srcPath, 'utf8')) as AuthoredCloze[];

  // Load outlines for code snippets + facts
  const files = await (await import('glob')).glob('outlines/L*/[A-Za-z]*.yml', { cwd: ROOT, absolute: true });
  const snippetMap = new Map<string, string>();
  const factMap = new Map<string, string>();
  for (const f of files) {
    const o = yamlLoad(readFileSync(f, 'utf8')) as any;
    if (!o?.id) continue;
    factMap.set(o.id, o.fact);
    const snippet =
      o.render_hints?.see_decompose?.snippet ??
      o.render_hints?.see_demo?.snippet ??
      o.canonical_example ?? '';
    if (snippet.trim()) snippetMap.set(o.id, snippet.trimEnd());
  }

  const cards: ClozeCard[] = [];
  const errors: string[] = [];

  for (const a of authored) {
    if (!a.atomId || !a.sentence || !a.answer) {
      errors.push(`${a.atomId ?? '?'}: missing field`);
      continue;
    }
    if (!a.sentence.includes('___')) {
      errors.push(`${a.atomId}: sentence missing ___ blank`);
      continue;
    }
    const code = snippetMap.get(a.atomId);
    if (!code) {
      errors.push(`${a.atomId}: no code snippet found in outlines`);
      continue;
    }

    cards.push({
      type: 'cloze',
      atomId: a.atomId,
      code,
      clozeSentence: a.sentence,
      answer: a.answer,
      explanation: `${a.atomId}: ${factMap.get(a.atomId) ?? '?'}`,
    });
  }

  if (errors.length > 0) {
    console.error(`ERRORS (${errors.length}):`);
    for (const e of errors) console.error(`  ${e}`);
    process.exit(1);
  }

  const outPath = resolve(ROOT, 'data/see-cloze-cards.json');
  writeFileSync(outPath, JSON.stringify(cards, null, 2) + '\n');
  console.log(`cloze cards: ${cards.length} emitted from hand-authored source`);
}

main().catch((e) => { console.error(e); process.exit(1); });
