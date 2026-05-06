// M15 — Merge hand-authored `whyOneLine` + foundation snippets into outline YAMLs.
//
// Reads:
//   data/m15-why-one-liners.yml   — { atomId: string }
//   data/m15-foundation-snippets.yml — { atomId: { snippet: string, highlights?: string[] } }
//
// For each outline file:
//   - Replace `why_one_line: "TODO_WHY"` with hand-authored line if present
//   - If `see_demo.snippet: null` AND key exists in foundation-snippets, inject snippet
//   - If `highlights: []` AND foundation entry has highlights, inject those
//
// Idempotent — second run is a no-op.

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { glob } from 'glob';
import { load as yamlLoad } from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '..');
const WHY_PATH = resolve(ROOT, 'data/m15-why-one-liners.yml');
const SNIPPETS_PATH = resolve(ROOT, 'data/m15-foundation-snippets.yml');

interface FoundationEntry {
  snippet: string;
  highlights?: string[];
}

function indent(text: string, n: number): string {
  const pad = ' '.repeat(n);
  return text
    .split('\n')
    .map((l) => (l.length ? pad + l : l))
    .join('\n');
}

function escapeForYamlInlineString(s: string): string {
  // Use double-quote with escapes for backslash + quote.
  return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

async function main() {
  if (!existsSync(WHY_PATH)) {
    console.error(`missing: ${WHY_PATH}`);
    process.exit(1);
  }
  const whyMap = yamlLoad(readFileSync(WHY_PATH, 'utf8')) as Record<string, string>;
  const snippetsMap = existsSync(SNIPPETS_PATH)
    ? (yamlLoad(readFileSync(SNIPPETS_PATH, 'utf8')) as Record<string, FoundationEntry>)
    : {};

  const files = await glob('outlines/L*/[A-Za-z]*.yml', { cwd: ROOT, absolute: true });
  files.sort();

  let whyApplied = 0;
  let snippetApplied = 0;
  let highlightsApplied = 0;
  const missingWhy: string[] = [];

  for (const f of files) {
    const raw = readFileSync(f, 'utf8');
    const idMatch = raw.match(/^id:\s*(\S+)/m);
    if (!idMatch) continue;
    const id = idMatch[1]!;

    let updated = raw;

    // 1. whyOneLine
    const why = whyMap[id];
    if (why) {
      const whyEsc = escapeForYamlInlineString(why);
      const newText = updated.replace(
        /^( {4}why_one_line:) "TODO_WHY"$/m,
        `$1 ${whyEsc}`
      );
      if (newText !== updated) {
        updated = newText;
        whyApplied++;
      }
    } else {
      missingWhy.push(id);
    }

    // 2. snippet backfill (only if snippet: null after see_demo header)
    const snipEntry = snippetsMap[id];
    if (snipEntry && /^ {2}see_demo:[\s\S]*?\n {4}snippet: null/m.test(updated)) {
      const indented = indent(snipEntry.snippet.trimEnd(), 6);
      const newText = updated.replace(
        /^( {2}see_demo:[\s\S]*?\n {4}snippet:) null(?:\s*#[^\n]*)?$/m,
        `$1 |\n${indented}`
      );
      if (newText !== updated) {
        updated = newText;
        snippetApplied++;

        // ALSO replace highlights if entry provides them and current is empty.
        if (snipEntry.highlights && snipEntry.highlights.length > 0) {
          const hjson = `[${snipEntry.highlights
            .map((h) => JSON.stringify(h))
            .join(', ')}]`;
          const withHL = updated.replace(
            /^( {2}see_demo:[\s\S]*?\n {4}highlights:) \[\]$/m,
            `$1 ${hjson}`
          );
          if (withHL !== updated) {
            updated = withHL;
            highlightsApplied++;
          }
        }
      }
    }

    if (updated !== raw) writeFileSync(f, updated);
  }

  console.log('M15 content merge report');
  console.log('------------------------');
  console.log(`outlines scanned   : ${files.length}`);
  console.log(`whyOneLine applied : ${whyApplied}`);
  console.log(`snippets applied   : ${snippetApplied}`);
  console.log(`highlights applied : ${highlightsApplied}`);
  console.log(`whyOneLine missing : ${missingWhy.length}`);
  if (missingWhy.length > 0 && missingWhy.length <= 50) {
    console.log(`  missing IDs: ${missingWhy.join(', ')}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
