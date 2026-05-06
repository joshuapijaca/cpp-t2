// Generate decompose cards from hand-authored YAML.
// Reads: data/decompose-authored.yml
// Writes: data/see-decompose-cards.json
// Idempotent: re-run safe.

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { load as yamlLoad } from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '..');

interface AuthoredCard {
  atomId: string;
  code: string;
  question: string;
  correct: string;
  distractors: string[];
  explanation: string;
}

interface DecomposeCard {
  type: 'decompose';
  atomId: string;
  code: string;
  question: string;
  options: Array<{ label: string; text: string }>;
  correctLabel: string;
  explanation: string;
}

function stableHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return h;
}

function main() {
  const srcPath = resolve(ROOT, 'data/decompose-authored.yml');
  const authored: AuthoredCard[] = yamlLoad(readFileSync(srcPath, 'utf8')) as AuthoredCard[];

  const cards: DecomposeCard[] = [];
  const errors: string[] = [];

  for (const a of authored) {
    if (!a.atomId || !a.code || !a.question || !a.correct) {
      errors.push(`${a.atomId ?? '?'}: missing required field`);
      continue;
    }
    if (!a.distractors || a.distractors.length < 3) {
      errors.push(`${a.atomId}: needs 3 distractors, has ${a.distractors?.length ?? 0}`);
      continue;
    }

    // Build 4 options: 1 correct + 3 distractors
    const labels = ['A', 'B', 'C', 'D'] as const;
    const rawOptions = [
      { text: a.correct, isCorrect: true },
      { text: a.distractors[0]!, isCorrect: false },
      { text: a.distractors[1]!, isCorrect: false },
      { text: a.distractors[2]!, isCorrect: false },
    ];

    // Deterministic shuffle so correct answer isn't always A
    rawOptions.sort((x, y) => stableHash(a.atomId + x.text) - stableHash(a.atomId + y.text));

    const correctIdx = rawOptions.findIndex(x => x.isCorrect);
    const correctLabel = labels[correctIdx]!;

    const options = rawOptions.map((opt, i) => ({
      label: labels[i]!,
      text: opt.text,
    }));

    cards.push({
      type: 'decompose',
      atomId: a.atomId,
      code: a.code.trimEnd(),
      question: a.question,
      options,
      correctLabel,
      explanation: a.explanation,
    });
  }

  if (errors.length > 0) {
    console.error(`ERRORS (${errors.length}):`);
    for (const e of errors) console.error(`  ${e}`);
    process.exit(1);
  }

  const outPath = resolve(ROOT, 'data/see-decompose-cards.json');
  writeFileSync(outPath, JSON.stringify(cards, null, 2) + '\n');
  console.log(`decompose cards: ${cards.length} emitted from hand-authored source`);
}

main();
