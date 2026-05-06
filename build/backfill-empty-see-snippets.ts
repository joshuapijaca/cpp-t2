// M15 — Backfill empty `see_demo.snippet` blocks from `write_L*_fill.template`
// for atoms that lack a `canonical_example`.
//
// scaffold-see-fields.ts emitted `snippet: null` for atoms with empty
// canonical_example (V-/O-/A-/F-/W- foundation atoms commonly). Many of those
// have a `write_L1_fill.template` like `"___ x;"` + `blank_value: "int"`. We
// reconstruct a usable snippet by substituting the blank value for `___`.
//
// Falls back to leaving `snippet: null` if no template found; lint downstream
// flags those for hand-authoring.

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { glob } from 'glob';
import { load as yamlLoad } from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '..');
const OUTLINES_GLOB = 'outlines/L*/[A-Za-z]*.yml';

interface Template {
  template?: string;
  blank_value?: string;
}

interface Outline {
  id: string;
  canonical_example?: string;
  render_hints?: {
    write_L1_fill?: Template;
    write_L2_complete?: Template;
    write_L3_free_spec?: string;
    [key: string]: unknown;
  };
}

function deriveSnippet(ol: Outline): string | null {
  const hints = ol.render_hints ?? {};
  const candidates: Template[] = [];
  if (hints.write_L2_complete) candidates.push(hints.write_L2_complete);
  if (hints.write_L1_fill) candidates.push(hints.write_L1_fill);

  for (const t of candidates) {
    if (!t.template) continue;
    const blank = (t.blank_value ?? '').toString();
    let snippet = t.template;
    // Replace ___ with blank_value (at most a few occurrences).
    if (snippet.includes('___') && blank) {
      snippet = snippet.split('___').join(blank);
    }
    // Strip any " // prints: ___" trailing prediction prompts that stayed unsubstituted.
    snippet = snippet.replace(/\/\/ prints: \?+/g, '').trimEnd();
    if (snippet.length === 0) continue;
    return snippet;
  }
  return null;
}

function indent(text: string, n: number): string {
  const pad = ' '.repeat(n);
  return text
    .split('\n')
    .map((l) => (l.length ? pad + l : l))
    .join('\n');
}

function injectSnippet(filePath: string, snippet: string): boolean {
  const original = readFileSync(filePath, 'utf8');
  // Match the exact pattern emitted by scaffold:
  //   see_demo:
  //     why_one_line: "..."
  //     snippet: null  # axiom atom — no code
  //
  // Replace `snippet: null...` with `snippet: |\n      <indented snippet>` (6 spaces — render_hints child of child).
  const re = /^( {4}snippet:) null(?:\s*#[^\n]*)?$/m;
  if (!re.test(original)) return false;
  const indented = indent(snippet, 6);
  const replaced = original.replace(re, `$1 |\n${indented}`);
  if (replaced === original) return false;
  writeFileSync(filePath, replaced);
  return true;
}

async function main() {
  const files = await glob(OUTLINES_GLOB, { cwd: ROOT, absolute: true });
  files.sort();

  let backfilled = 0;
  let stillNull = 0;
  let alreadyHasSnippet = 0;
  const stillNullIds: string[] = [];

  for (const f of files) {
    const raw = readFileSync(f, 'utf8');
    const ol = yamlLoad(raw) as Outline;

    // Look at the FIRST `snippet: null` after `see_demo:` line — that's the demo snippet.
    // We rely on textual position; see_decompose has its own `snippet:` we don't touch.
    const seeDemoMatch = raw.match(/^see_demo:[\s\S]*?(?=\n[a-z]|\nsee_decompose:)/m);
    const inRenderHints = raw.match(/^( {2}see_demo:[\s\S]*?)(?=\n {2}see_decompose:|\n[a-z])/m);
    const block = inRenderHints?.[0] ?? seeDemoMatch?.[0] ?? '';
    if (!/snippet: null/.test(block)) {
      alreadyHasSnippet++;
      continue;
    }

    const snippet = deriveSnippet(ol);
    if (!snippet) {
      stillNull++;
      stillNullIds.push(ol.id);
      continue;
    }
    const ok = injectSnippet(f, snippet);
    if (ok) backfilled++;
    else {
      stillNull++;
      stillNullIds.push(ol.id);
    }
  }

  console.log('SEE-snippet backfill report');
  console.log('---------------------------');
  console.log(`scanned          : ${files.length}`);
  console.log(`backfilled       : ${backfilled}`);
  console.log(`still null       : ${stillNull}`);
  console.log(`already had code : ${alreadyHasSnippet}`);
  if (stillNullIds.length > 0 && stillNullIds.length <= 30) {
    console.log(`null atom ids    : ${stillNullIds.join(', ')}`);
  } else if (stillNullIds.length > 30) {
    console.log(`null atom ids (first 30): ${stillNullIds.slice(0, 30).join(', ')} ... +${stillNullIds.length - 30} more`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
