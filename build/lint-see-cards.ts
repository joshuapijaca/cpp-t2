// M16 — Lint SEE cards in data/cards.json.
// Per docs/14 acceptance gates:
//   - decompose: correctAtomIds ⊆ atomOptions.id
//   - demo: every highlightTokens is substring of demoCode
//   - walkthrough: every step atomIds resolves to known atom
//   - per-atom order: first SEE then DO
//
// Run: npm run lint:see-cards

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { glob } from 'glob';
import { load as yamlLoad } from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '..');

interface LintErr {
  scope: string;
  rule: string;
  detail: string;
}

async function main() {
  const errs: LintErr[] = [];

  // Load known atom IDs
  const outlineFiles = await glob('outlines/L*/[A-Za-z]*.yml', { cwd: ROOT, absolute: true });
  const knownAtoms = new Set<string>();
  for (const f of outlineFiles) {
    const o: any = yamlLoad(readFileSync(f, 'utf8'));
    if (o?.id) knownAtoms.add(o.id);
  }

  // Load cards.json
  const cardsPath = resolve(ROOT, 'data/cards.json');
  const cards: any[] = JSON.parse(readFileSync(cardsPath, 'utf8'));

  let demoCount = 0;
  let decompCount = 0;
  let wtCount = 0;

  for (let i = 0; i < cards.length; i++) {
    const c = cards[i]!;
    const scope = `card[${i}] ${c.atomId} ${c.type}`;

    if (c.type === 'demo') {
      demoCount++;
      // highlightTokens must be substrings of demoCode
      for (const h of c.highlightTokens ?? []) {
        if (h && !c.demoCode.includes(h)) {
          errs.push({ scope, rule: 'demo-highlight-mismatch', detail: `"${h}" not in demoCode` });
        }
      }
    }

    if (c.type === 'decompose') {
      decompCount++;
      // correctLabel ∈ options[].label
      const optionLabels = new Set((c.options ?? []).map((o: any) => o.label));
      const correctLabel = c.correctLabel;
      if (correctLabel && !optionLabels.has(correctLabel)) {
        errs.push({ scope, rule: 'decompose-correct-not-in-options', detail: `"${correctLabel}" not in options` });
      }
      // question must exist and be non-empty
      if (!c.question?.trim()) {
        errs.push({ scope, rule: 'decompose-missing-question', detail: 'no question field' });
      }
      // must have exactly 4 options
      if ((c.options ?? []).length !== 4) {
        errs.push({ scope, rule: 'decompose-option-count', detail: `${(c.options ?? []).length} options (need 4)` });
      }
    }

    if (c.type === 'walkthrough') {
      wtCount++;
      // step atomIds resolve to known atoms
      for (const step of c.steps ?? []) {
        for (const aid of step.atomIds ?? []) {
          if (!knownAtoms.has(aid)) {
            errs.push({ scope, rule: 'walkthrough-unknown-atom', detail: `step line ${step.line}: "${aid}" unknown` });
          }
        }
      }
    }
  }

  // Per-atom order: SEE before DO
  const byAtom = new Map<string, string[]>();
  for (const c of cards) {
    const arr = byAtom.get(c.atomId) ?? [];
    arr.push(c.type);
    byAtom.set(c.atomId, arr);
  }

  for (const [atomId, types] of byAtom) {
    const firstSee = types.findIndex((t: string) => t === 'demo' || t === 'decompose');
    const firstDo = types.findIndex((t: string) => ['memorize', 'mcq', 'trace', 'write'].includes(t));
    if (firstSee >= 0 && firstDo >= 0 && firstDo < firstSee) {
      errs.push({ scope: atomId, rule: 'order-do-before-see', detail: `DO at position ${firstDo}, SEE at ${firstSee}` });
    }
  }

  // Report
  console.log('SEE cards lint report');
  console.log('---------------------');
  console.log(`total cards    : ${cards.length}`);
  console.log(`demo           : ${demoCount}`);
  console.log(`decompose      : ${decompCount}`);
  console.log(`walkthrough    : ${wtCount}`);
  console.log(`errors         : ${errs.length}`);

  if (errs.length === 0) {
    console.log('\nOK lint pass');
    return;
  }

  console.error('\nX lint errors:');
  const byRule = new Map<string, LintErr[]>();
  for (const e of errs) {
    const arr = byRule.get(e.rule) ?? [];
    arr.push(e);
    byRule.set(e.rule, arr);
  }
  for (const [rule, list] of byRule) {
    console.error(`\n  ${rule} (${list.length}):`);
    for (const e of list.slice(0, 10)) {
      console.error(`    [${e.scope}] ${e.detail}`);
    }
    if (list.length > 10) console.error(`    ... +${list.length - 10} more`);
  }
  process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
