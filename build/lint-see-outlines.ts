// M15 — Lint SEE outline fields.
//
// Per docs/14 acceptance gates:
//   - Decompose `correct_atoms` ⊆ options
//   - Demo highlights are substrings of demo snippet
//   - Walkthrough atom_ids resolve to known atoms
//   - whyOneLine present + non-TODO
//   - correct_atoms / distractors resolve to known atoms

import { readFileSync } from 'fs';
import { resolve, basename } from 'path';
import { glob } from 'glob';
import { load as yamlLoad } from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '..');

interface SeeDemo {
  why_one_line?: string;
  snippet?: string | null;
  highlights?: string[];
  used_in?: string[];
}

interface SeeDecompose {
  snippet?: string | null;
  correct_atoms?: string[];
  distractors?: string[];
}

interface Outline {
  id: string;
  render_hints?: {
    see_demo?: SeeDemo;
    see_decompose?: SeeDecompose;
    [k: string]: unknown;
  };
}

interface Walkthrough {
  id: string;
  full_code?: string;
  steps?: Array<{ line: number; code: string; annotation: string; atom_ids: string[] }>;
}

interface WorkedExample {
  id: string;
  variant_name: string;
  code: string;
  highlights: string[];
}

interface WorkedExampleFile {
  question: string;
  examples: WorkedExample[];
}

interface LintErr {
  scope: string;
  rule: string;
  detail: string;
}

async function main() {
  const errs: LintErr[] = [];

  // ---- Load all atom outlines ----
  const outlineFiles = await glob('outlines/L*/[A-Za-z]*.yml', {
    cwd: ROOT,
    absolute: true,
  });
  outlineFiles.sort();

  const knownAtoms = new Set<string>();
  const outlines: Outline[] = [];
  for (const f of outlineFiles) {
    const o = yamlLoad(readFileSync(f, 'utf8')) as Outline;
    if (o?.id) {
      knownAtoms.add(o.id);
      outlines.push(o);
    }
  }

  // ---- Lint per-atom SEE fields ----
  let withDemo = 0;
  let nullSnippets = 0;
  for (const o of outlines) {
    const demo = o.render_hints?.see_demo;
    const decomp = o.render_hints?.see_decompose;

    if (!demo) {
      errs.push({ scope: o.id, rule: 'missing-see_demo', detail: 'no see_demo block' });
      continue;
    }

    // whyOneLine present + not placeholder
    if (!demo.why_one_line || demo.why_one_line === 'TODO_WHY') {
      errs.push({
        scope: o.id,
        rule: 'whyOneLine-missing',
        detail: 'why_one_line is empty or TODO_WHY',
      });
    }

    // snippet null OK for axiom atoms; if present, every highlight is a substring
    if (demo.snippet) {
      withDemo++;
      const snippet = demo.snippet;
      for (const h of demo.highlights ?? []) {
        if (!snippet.includes(h)) {
          errs.push({
            scope: o.id,
            rule: 'highlight-not-in-snippet',
            detail: `highlight "${h}" not a substring of snippet`,
          });
        }
      }
    } else {
      nullSnippets++;
    }

    // see_decompose: correct_atoms + distractors must resolve to known atoms
    if (decomp) {
      for (const id of decomp.correct_atoms ?? []) {
        if (!knownAtoms.has(id)) {
          errs.push({
            scope: o.id,
            rule: 'decompose-correct-unknown',
            detail: `correct_atoms includes unknown "${id}"`,
          });
        }
      }
      for (const id of decomp.distractors ?? []) {
        if (!knownAtoms.has(id)) {
          errs.push({
            scope: o.id,
            rule: 'decompose-distractor-unknown',
            detail: `distractors includes unknown "${id}"`,
          });
        }
        if ((decomp.correct_atoms ?? []).includes(id)) {
          errs.push({
            scope: o.id,
            rule: 'decompose-distractor-overlaps-correct',
            detail: `distractor "${id}" also in correct_atoms`,
          });
        }
      }
    } else {
      errs.push({
        scope: o.id,
        rule: 'missing-see_decompose',
        detail: 'no see_decompose block',
      });
    }
  }

  // ---- Lint walkthroughs ----
  const wtFiles = await glob('outlines/walkthroughs/*.yml', {
    cwd: ROOT,
    absolute: true,
  });
  wtFiles.sort();
  let walkthroughCount = 0;
  for (const f of wtFiles) {
    const wt = yamlLoad(readFileSync(f, 'utf8')) as Walkthrough;
    if (!wt?.id) {
      errs.push({ scope: basename(f), rule: 'walkthrough-missing-id', detail: '' });
      continue;
    }
    walkthroughCount++;
    for (const step of wt.steps ?? []) {
      for (const aid of step.atom_ids) {
        if (!knownAtoms.has(aid)) {
          errs.push({
            scope: wt.id,
            rule: 'walkthrough-atom-unknown',
            detail: `step line ${step.line} references unknown "${aid}"`,
          });
        }
      }
    }
  }

  // ---- Lint worked examples ----
  const weFiles = await glob('outlines/worked_examples/*.yml', {
    cwd: ROOT,
    absolute: true,
  });
  weFiles.sort();
  let workedCount = 0;
  for (const f of weFiles) {
    const wf = yamlLoad(readFileSync(f, 'utf8')) as WorkedExampleFile;
    if (!wf?.examples) {
      errs.push({ scope: basename(f), rule: 'worked-no-examples', detail: '' });
      continue;
    }
    for (const ex of wf.examples) {
      workedCount++;
      // Lint: every highlight must be a substring of the code (skip empty highlights array)
      for (const h of ex.highlights ?? []) {
        if (h.length === 0) continue;
        if (!ex.code.includes(h)) {
          errs.push({
            scope: ex.id,
            rule: 'worked-highlight-not-in-code',
            detail: `highlight "${h}" not a substring of code`,
          });
        }
      }
    }
  }

  // ---- Report ----
  console.log('SEE outline lint report');
  console.log('-----------------------');
  console.log(`atom outlines       : ${outlines.length}`);
  console.log(`atoms with demo     : ${withDemo}`);
  console.log(`atoms with null snip: ${nullSnippets}`);
  console.log(`walkthroughs        : ${walkthroughCount}`);
  console.log(`worked examples     : ${workedCount}`);
  console.log(`errors              : ${errs.length}`);

  if (errs.length === 0) {
    console.log('\nOK lint pass');
    return;
  }

  console.error('\nX lint errors:');
  // Group by rule for readability
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

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
