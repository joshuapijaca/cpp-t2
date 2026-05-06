// M15 — Scaffold SEE outline fields across all 187 atom outlines.
//
// Reads every outlines/L*/<atomId>.yml, derives `see_demo` + `see_decompose`
// blocks from existing `canonical_example` + `q_tags` + `deps`, and writes them
// back inside the existing `render_hints:` block.
//
// `why_one_line` is left as `TODO_WHY` placeholder; a second pass
// (apply-why-one-liners.ts) merges hand-authored values from
// `data/why-one-liners.yml`.
//
// Textual insertion (NOT yaml roundtrip) preserves comments + key order +
// formatting. We locate `render_hints:` and inject new sub-keys right before
// the next top-level YAML key.
//
// Spec: cpp-t2/docs/14_see_cards_master_plan.md ("Outline Schema").

import { readFileSync, writeFileSync } from 'fs';
import { resolve, basename } from 'path';
import { glob } from 'glob';
import { load as yamlLoad } from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '..');
const OUTLINES_GLOB = 'outlines/L*/[A-Za-z]*.yml';

interface Outline {
  id: string;
  fact?: string;
  level?: number;
  deps?: string[];
  q_tags?: Record<string, string>;
  canonical_example?: string;
  [key: string]: unknown;
}

interface ScaffoldStats {
  total: number;
  scaffolded: number;
  skippedNoExample: number;
  skippedAlreadyHasSee: number;
  skippedNoRenderHints: number;
}

function highlightTokensFor(outline: Outline): string[] {
  const id = outline.id;
  const code = outline.canonical_example ?? '';
  const tokens: string[] = [];

  // Atom-prefix-driven heuristics. Pick exact substrings present in the snippet.
  if (id.startsWith('R-')) {
    // Pass-by-reference family: highlight `&x` / `&data` / `&list[]` patterns.
    const refMatch = code.match(/\b\w+\s*&\s*\w+(\[\])?/);
    if (refMatch) tokens.push(refMatch[0]);
    // Also flag the `int &x` / similar full param.
    const paramMatch = code.match(/(int|double|float|string|bool)\s*&\s*\w+/);
    if (paramMatch && !tokens.includes(paramMatch[0])) tokens.push(paramMatch[0]);
  } else if (id.startsWith('V-')) {
    const declMatch = code.match(/\b(int|double|float|string|bool|char)\s+\w+\s*=\s*\S+;/);
    if (declMatch) tokens.push(declMatch[0]);
  } else if (id.startsWith('O-')) {
    if (code.includes('cout')) tokens.push('cout');
    if (code.includes('<<')) tokens.push('<<');
    if (code.includes('endl')) tokens.push('endl');
    if (code.includes('printf')) tokens.push('printf');
    if (code.includes('.c_str()')) tokens.push('.c_str()');
  } else if (id.startsWith('I-')) {
    if (code.includes('cin')) tokens.push('cin');
    if (code.includes('>>')) tokens.push('>>');
  } else if (id.startsWith('A-')) {
    // Operators
    const opMatch = code.match(/\w+\s*(\+|\-|\*|\/|%|=)\s*\w+/);
    if (opMatch) tokens.push(opMatch[0]);
  } else if (id.startsWith('C-') || id.startsWith('L-')) {
    const cmpMatch = code.match(/\w+\s*(==|!=|<=|>=|<|>|&&|\|\|)\s*\w+/);
    if (cmpMatch) tokens.push(cmpMatch[0]);
  } else if (id.startsWith('F-')) {
    if (code.includes('if')) tokens.push('if');
    if (code.includes('else')) tokens.push('else');
  } else if (id.startsWith('W-')) {
    if (code.includes('for')) tokens.push('for');
    if (code.includes('while')) tokens.push('while');
  } else if (id.startsWith('H-')) {
    // Function signatures: highlight the signature line if findable.
    const sigMatch = code.match(/^[ \t]*\w+\s+\w+\([^)]*\)/m);
    if (sigMatch) tokens.push(sigMatch[0].trim());
  } else if (id.startsWith('T-')) {
    if (code.includes('struct')) tokens.push('struct');
    const dotMatch = code.match(/\w+\.\w+/);
    if (dotMatch) tokens.push(dotMatch[0]);
  } else if (id.startsWith('G-')) {
    const idxMatch = code.match(/\w+\[\w+\]/);
    if (idxMatch) tokens.push(idxMatch[0]);
    if (code.includes('[]')) tokens.push('[]');
  } else if (id.startsWith('PC-')) {
    const refArrMatch = code.match(/\b\w+\s*&\s*\w+\[\]/);
    if (refArrMatch) tokens.push(refArrMatch[0]);
  } else if (id.startsWith('S-')) {
    if (code.includes('#include')) tokens.push('#include');
    if (code.includes('using namespace std')) tokens.push('using namespace std');
    if (code.includes('int main')) tokens.push('int main()');
    if (code.includes('return 0')) tokens.push('return 0');
  } else if (id.startsWith('P-')) {
    // Pre-programming axioms — usually no code.
  }

  // Fallback: pick the atom's primary identifier if present in code.
  if (tokens.length === 0) {
    const atomNum = id.replace(/^[A-Z]+-/, '');
    if (atomNum && code.includes(atomNum)) tokens.push(atomNum);
  }

  return tokens.slice(0, 4); // cap to avoid noise
}

function usedInFor(outline: Outline): string[] {
  const tags = outline.q_tags ?? {};
  const out: string[] = [];
  for (const q of ['Q1', 'Q2', 'Q3', 'Q4']) {
    const v = tags[q];
    if (v === 'C' || v === 'P') out.push(q);
  }
  return out;
}

/** Pick first 1-3 lines of canonical_example (skipping blank / brace-only lines for the lead). */
function decomposeSnippetFor(outline: Outline): string {
  const code = (outline.canonical_example ?? '').trim();
  if (!code) return '';
  const lines = code.split('\n');
  // Find first meaningful line (skip pure `{` / blank).
  let start = 0;
  while (start < lines.length && /^\s*\{?\s*$/.test(lines[start]!)) start++;
  // Take next 1-3 non-empty lines.
  const out: string[] = [];
  for (let i = start; i < lines.length && out.length < 3; i++) {
    const ln = lines[i]!;
    if (ln.trim() === '') continue;
    if (ln.trim() === '}') continue;
    out.push(ln);
    // For declarations / single statements, often 1 line is enough.
    if (out.length >= 1 && /;\s*$/.test(ln)) break;
  }
  return out.join('\n');
}

function levelSiblingIds(level: number, atomMap: Map<string, Outline>): string[] {
  const sibs: string[] = [];
  for (const [id, ol] of atomMap) {
    if (ol.level === level) sibs.push(id);
  }
  return sibs;
}

function correctAtomsFor(outline: Outline): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  // self always counts
  out.push(outline.id);
  seen.add(outline.id);
  for (const d of outline.deps ?? []) {
    if (!seen.has(d)) {
      out.push(d);
      seen.add(d);
    }
  }
  return out.slice(0, 6);
}

function distractorsFor(outline: Outline, atomMap: Map<string, Outline>): string[] {
  const correct = new Set(correctAtomsFor(outline));
  const sibs = levelSiblingIds(outline.level ?? -99, atomMap)
    .filter((id) => !correct.has(id));
  // Deterministic pick: hash-sort by id char codes.
  sibs.sort((a, b) => {
    const sa = a.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    const sb = b.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
    return sa - sb;
  });
  const picks = sibs.slice(0, 2);
  // Plus 1 distant distractor from a different level family.
  const distantPrefixOrder = ['R-', 'T-', 'G-', 'PC-', 'F-', 'W-', 'O-', 'V-'];
  for (const pre of distantPrefixOrder) {
    if (outline.id.startsWith(pre)) continue;
    const cand = [...atomMap.keys()].find((k) => k.startsWith(pre) && !correct.has(k));
    if (cand) {
      picks.push(cand);
      break;
    }
  }
  return picks;
}

function indent(text: string, n: number): string {
  const pad = ' '.repeat(n);
  return text
    .split('\n')
    .map((l) => (l.length ? pad + l : l))
    .join('\n');
}

function renderSeeBlocks(
  outline: Outline,
  atomMap: Map<string, Outline>
): string {
  const highlights = highlightTokensFor(outline);
  const usedIn = usedInFor(outline);
  const snippet = (outline.canonical_example ?? '').trimEnd();
  const decompSnippet = decomposeSnippetFor(outline);
  const correct = correctAtomsFor(outline);
  const distractors = distractorsFor(outline, atomMap);

  const hasCode = snippet.length > 0;

  const lines: string[] = [];
  lines.push(`see_demo:`);
  lines.push(`  why_one_line: "TODO_WHY"`);
  if (hasCode) {
    lines.push(`  snippet: |`);
    lines.push(indent(snippet, 4));
  } else {
    lines.push(`  snippet: null  # axiom atom — no code`);
  }
  if (highlights.length > 0) {
    lines.push(
      `  highlights: [${highlights.map((h) => JSON.stringify(h)).join(', ')}]`
    );
  } else {
    lines.push(`  highlights: []`);
  }
  if (usedIn.length > 0) {
    lines.push(`  used_in: [${usedIn.join(', ')}]`);
  } else {
    lines.push(`  used_in: []`);
  }

  lines.push(`see_decompose:`);
  if (decompSnippet) {
    lines.push(`  snippet: |`);
    lines.push(indent(decompSnippet, 4));
  } else {
    lines.push(`  snippet: null`);
  }
  lines.push(`  correct_atoms: [${correct.join(', ')}]`);
  lines.push(`  distractors: [${distractors.join(', ')}]`);

  return lines.join('\n');
}

/** Inject the rendered SEE block into the file's `render_hints:` section. */
function injectIntoFile(filePath: string, blockText: string): boolean {
  const original = readFileSync(filePath, 'utf8');

  // Already has see_demo? Skip.
  if (/^\s*see_demo\s*:/m.test(original)) return false;

  const lines = original.split('\n');
  let renderHintsLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^render_hints\s*:/.test(lines[i]!)) {
      renderHintsLine = i;
      break;
    }
  }
  if (renderHintsLine === -1) return false;

  // Find the END of the render_hints block: the next line at indent 0
  // that is a key (matches /^[a-z_]+\s*:/) AFTER renderHintsLine.
  let endLine = lines.length;
  for (let i = renderHintsLine + 1; i < lines.length; i++) {
    const ln = lines[i]!;
    if (/^[a-zA-Z_][a-zA-Z0-9_]*\s*:/.test(ln)) {
      endLine = i;
      break;
    }
  }

  // Insert see_* block just BEFORE endLine, indented to be a child of render_hints (2 spaces).
  const indented = indent(blockText, 2);
  const insertLines = indented.split('\n');
  // Drop trailing empty lines from insert.
  while (insertLines.length && insertLines[insertLines.length - 1] === '') insertLines.pop();

  const newLines = [
    ...lines.slice(0, endLine),
    ...insertLines,
    ...lines.slice(endLine),
  ];
  writeFileSync(filePath, newLines.join('\n'));
  return true;
}

async function main() {
  const files = await glob(OUTLINES_GLOB, { cwd: ROOT, absolute: true });
  files.sort();

  // First pass: build atomMap so distractors can pull siblings.
  const atomMap = new Map<string, Outline>();
  for (const f of files) {
    const raw = readFileSync(f, 'utf8');
    const ol = yamlLoad(raw) as Outline | null;
    if (!ol || !ol.id) continue;
    atomMap.set(ol.id, ol);
  }

  const stats: ScaffoldStats = {
    total: files.length,
    scaffolded: 0,
    skippedNoExample: 0,
    skippedAlreadyHasSee: 0,
    skippedNoRenderHints: 0,
  };

  for (const f of files) {
    const ol = atomMap.get(basename(f, '.yml'));
    if (!ol) continue;

    const block = renderSeeBlocks(ol, atomMap);
    const original = readFileSync(f, 'utf8');
    if (/^\s*see_demo\s*:/m.test(original)) {
      stats.skippedAlreadyHasSee++;
      continue;
    }
    if (!/^render_hints\s*:/m.test(original)) {
      stats.skippedNoRenderHints++;
      continue;
    }

    const ok = injectIntoFile(f, block);
    if (ok) stats.scaffolded++;
    if (!ol.canonical_example) stats.skippedNoExample++;
  }

  console.log('SEE-scaffold report');
  console.log('-------------------');
  console.log(`outlines scanned : ${stats.total}`);
  console.log(`scaffolded       : ${stats.scaffolded}`);
  console.log(`already had SEE  : ${stats.skippedAlreadyHasSee}`);
  console.log(`no render_hints  : ${stats.skippedNoRenderHints}`);
  console.log(`(of scaffolded) no canonical_example: ${stats.skippedNoExample}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
