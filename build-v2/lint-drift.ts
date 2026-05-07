// =====================================================================
// cpp-t2 / build-v2 / lint-drift.ts
// QA — v2.2 anti-drift lint
// =====================================================================
//
// Reads docs/v2/MANIFEST.md, parses the LOCKED feature lists out of it,
// then walks the v2 source/data tree and flags any file or YAML record
// that references something not on the manifest.
//
// Per RULE 4 (max quality / min compromise): the v2 → v2.1 build drifted
// into 14 unrequested features (6 pages, 6 engines, 9 card types, +
// dozens of UI surfaces). This linter is the enforcement layer.
//
// Checks:
//   1. src-v2/pages/*.tsx — every page must match MANIFEST::approved-pages
//   2. src-v2/engines/*.ts — every engine must match MANIFEST::approved-engines
//   3. data/v2/cards/**/*.yml — every card.type must match MANIFEST::approved-card-components
//   4. data/v2/cards/**/*.yml — every card.source.{kind,ref} must match
//      the approved citation taxonomy
//
// Exit codes:
//   0 — clean
//   1 — drift found (one or more checks failed)
//   2 — internal error (manifest unreadable, etc.)
// =====================================================================

import { readFileSync, existsSync } from 'fs';
import { glob } from 'glob';
import { resolve, basename, relative } from 'path';
import yaml from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '..');
const MANIFEST_PATH = 'docs/v2/MANIFEST.md';
const PAGES_GLOB = 'src-v2/pages/*.tsx';
const ENGINES_GLOB = 'src-v2/engines/*.ts';
const CARDS_GLOB = 'data/v2/cards/**/*.yml';

// ---------------------------------------------------------------------
// Approved citation taxonomy (mirrors MANIFEST.md "Approved citation
// taxonomy" section).
//
// Forms approved:
//   tier1:Q{1-4}:{atom-id}
//   tier2:pfg:{path}
//   tier2:seminar:{anything}
//   tier2:practice:Q{N}      (also tier2:practice:{anything})
//   tier2:v2:Q{N}            (also tier2:v2:{anything})
//   tier2:variant:Q{N}
//   tier2:task-sheet:P{N}
//
// Forms forbidden (matched separately and reported):
//   docs/16, docs/17, docs/18 in ref
//   "v2 spec §" without a real file path
//   bare "internal", "auto-stub", "stub"
// ---------------------------------------------------------------------

const APPROVED_CITATION = new RegExp(
  '^(' +
    'tier1:Q[1-4]:[A-Z]-\\d{2}[a-z]?' +
    '|' +
    'tier2:(pfg|seminar|practice|v2|variant|task-sheet):.+' +
  ')$'
);

const FORBIDDEN_REF_PATTERNS: { pattern: RegExp; reason: string }[] = [
  { pattern: /\bdocs\/1[678]\b/, reason: 'cites planning doc docs/16-18 (forbidden)' },
  { pattern: /^v2 spec §/i, reason: 'cites "v2 spec §X" without a real file path' },
  { pattern: /^internal\b/i, reason: 'generic "internal" source' },
  { pattern: /^auto-stub\b/i, reason: 'generic "auto-stub" source' },
  { pattern: /^stub\b/i, reason: 'generic "stub" source' },
];

// ---------------------------------------------------------------------
// Manifest parser
// ---------------------------------------------------------------------

interface Manifest {
  approvedPages: Set<string>;
  approvedEngines: Set<string>;
  approvedCardTypes: Set<string>;
}

/**
 * Pull a list of fenced names from a section of MANIFEST.md.
 *
 * The manifest uses bullet lines like:
 *   - **Home** — list of 6 modules + jump-to-card-N input
 *   - DemoCard
 *   - ProceduralCard *(was ProceduralDrill in v1)*
 *
 * We strip the leading bullet, optional bold markers, optional
 * em-dash description, optional italic parenthetical aside, and
 * keep the leading identifier token.
 */
function parseManifest(text: string): Manifest {
  const sections = splitSections(text);

  const approvedPages = parseBulletList(
    sections['Approved pages (2)'] ?? ''
  );
  const approvedEngines = parseBulletList(
    sections['Approved engines (1)'] ?? ''
  );

  // Card types come from THREE sub-sections:
  //   "v1 types (11)"
  //   "v2 essentials (4) — user-approved in v2.1 plan"
  // both nested under "Approved card components (15)".
  const cardSection = sections['Approved card components (15)'] ?? '';
  const approvedCardTypes = parseBulletList(cardSection);

  return {
    approvedPages,
    approvedEngines,
    approvedCardTypes,
  };
}

/**
 * Split the manifest into top-level (`##`) sections. Nested `###`
 * subsections are *included verbatim* in their parent `##` body — we
 * want the bullet lists under "Approved card components (15)" even
 * though they live under `### v1 types (11)` and `### v2 essentials
 * (4)` headings.
 */
function splitSections(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  const lines = text.split(/\r?\n/);
  let currentHeading: string | null = null;
  let buf: string[] = [];
  for (const line of lines) {
    // Only `## ` (level 2) starts a new section. `### ` and deeper
    // stays inside the current section's buffer.
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (m) {
      if (currentHeading !== null) {
        out[currentHeading] = buf.join('\n');
      }
      currentHeading = m[1].trim();
      buf = [];
    } else {
      buf.push(line);
    }
  }
  if (currentHeading !== null) {
    out[currentHeading] = buf.join('\n');
  }
  return out;
}

function parseBulletList(section: string): Set<string> {
  const out = new Set<string>();
  const lines = section.split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line.startsWith('- ')) continue;
    let content = line.slice(2).trim();
    // Strip leading bold **X** wrapper if present.
    content = content.replace(/^\*\*(.+?)\*\*/, '$1');
    // Take the first token before space / em-dash / italic.
    const first = content.split(/\s|—|\*/, 1)[0]?.trim();
    if (!first) continue;
    out.add(first);
  }
  return out;
}

// ---------------------------------------------------------------------
// Findings
// ---------------------------------------------------------------------

interface Finding {
  rule: string;
  file: string;
  detail: string;
  cardId?: string;
}

const findings: Finding[] = [];

function flag(f: Finding) {
  findings.push(f);
}

// ---------------------------------------------------------------------
// Check 1: pages
// ---------------------------------------------------------------------

function checkPages(manifest: Manifest) {
  const files = glob.sync(PAGES_GLOB, { cwd: ROOT });
  for (const f of files) {
    const name = basename(f, '.tsx');
    if (!manifest.approvedPages.has(name)) {
      flag({
        rule: 'drift-page',
        file: f,
        detail: `page "${name}" not in MANIFEST::approved-pages (${[...manifest.approvedPages].join(', ')})`,
      });
    }
  }
}

// ---------------------------------------------------------------------
// Check 2: engines
// ---------------------------------------------------------------------

function checkEngines(manifest: Manifest) {
  const files = glob.sync(ENGINES_GLOB, { cwd: ROOT });
  for (const f of files) {
    const name = basename(f, '.ts');
    if (!manifest.approvedEngines.has(name)) {
      flag({
        rule: 'drift-engine',
        file: f,
        detail: `engine "${name}" not in MANIFEST::approved-engines (${[...manifest.approvedEngines].join(', ')})`,
      });
    }
  }
}

// ---------------------------------------------------------------------
// Check 3 + 4: cards (type + citation)
// ---------------------------------------------------------------------

interface RawCard {
  id?: string;
  type?: string;
  source?: { kind?: string; ref?: string };
  [k: string]: unknown;
}

function checkCards(manifest: Manifest) {
  const files = glob.sync(CARDS_GLOB, { cwd: ROOT });
  for (const f of files) {
    const abs = resolve(ROOT, f);
    let docs: unknown;
    try {
      docs = yaml.load(readFileSync(abs, 'utf8'));
    } catch (e) {
      flag({
        rule: 'yaml-parse',
        file: f,
        detail: `yaml load failed: ${(e as Error).message}`,
      });
      continue;
    }
    const cards: RawCard[] = Array.isArray(docs)
      ? (docs as RawCard[])
      : docs && typeof docs === 'object'
        ? [docs as RawCard]
        : [];
    for (const c of cards) {
      checkCardType(manifest, f, c);
      checkCardCitation(f, c);
    }
  }
}

function checkCardType(manifest: Manifest, file: string, c: RawCard) {
  if (!c.type) return; // lint-cards.ts handles missing-type
  if (!manifest.approvedCardTypes.has(c.type)) {
    flag({
      rule: 'drift-card-type',
      file,
      cardId: c.id,
      detail: `card type "${c.type}" not in MANIFEST::approved-card-components (15 approved)`,
    });
  }
}

function checkCardCitation(file: string, c: RawCard) {
  const src = c.source;
  if (!src) return; // lint-cards.ts handles missing source
  const kind = src.kind ?? '';
  const ref = src.ref ?? '';
  const composite = `${kind}:${ref}`;

  // Forbidden patterns first — they're the loudest red flag.
  for (const fr of FORBIDDEN_REF_PATTERNS) {
    if (fr.pattern.test(composite) || fr.pattern.test(ref)) {
      flag({
        rule: 'drift-citation-forbidden',
        file,
        cardId: c.id,
        detail: `${fr.reason}: source.kind="${kind}", source.ref="${ref}"`,
      });
      return;
    }
  }

  // Approved-form check.
  // The MANIFEST taxonomy is `tier1:...` / `tier2:...:...`. The on-disk
  // YAML also accepts the legacy 4-value kind enum (`practice` / `v2` /
  // `pfg` / `seminar`) by mapping it to `tier2:<kind>:<ref>`. So we
  // check both shapes.
  if (
    APPROVED_CITATION.test(composite) ||
    APPROVED_CITATION.test(`tier2:${composite}`) ||
    APPROVED_CITATION.test(`tier2:${kind}:${ref}`)
  ) {
    return;
  }

  flag({
    rule: 'drift-citation-shape',
    file,
    cardId: c.id,
    detail:
      `source ("${kind}" / "${ref}") does not match approved taxonomy ` +
      `(tier1:Q{n}:{atom-id} or tier2:{pfg|seminar|practice|v2|variant|task-sheet}:{ref})`,
  });
}

// ---------------------------------------------------------------------
// Reporter
// ---------------------------------------------------------------------

function report() {
  if (findings.length === 0) {
    console.log('lint-drift: clean — no off-manifest files or citations found.');
    return 0;
  }

  // Group by rule.
  const byRule: Record<string, Finding[]> = {};
  for (const f of findings) {
    (byRule[f.rule] ??= []).push(f);
  }

  console.error(`lint-drift: ${findings.length} drift finding(s) across ${Object.keys(byRule).length} rule(s).`);
  for (const [rule, items] of Object.entries(byRule)) {
    console.error(`\n[${rule}] (${items.length})`);
    for (const it of items.slice(0, 25)) {
      const id = it.cardId ? ` card=${it.cardId}` : '';
      console.error(`  ${relative(ROOT, resolve(ROOT, it.file))}${id}: ${it.detail}`);
    }
    if (items.length > 25) {
      console.error(`  ... and ${items.length - 25} more`);
    }
  }
  console.error('\nlint-drift: FAIL — see docs/v2/MANIFEST.md for the locked feature list.');
  return 1;
}

// ---------------------------------------------------------------------
// Entrypoint
// ---------------------------------------------------------------------

function main(): number {
  const manifestAbs = resolve(ROOT, MANIFEST_PATH);
  if (!existsSync(manifestAbs)) {
    console.error(`lint-drift: cannot find manifest at ${MANIFEST_PATH}`);
    return 2;
  }
  const manifestText = readFileSync(manifestAbs, 'utf8');
  const manifest = parseManifest(manifestText);

  // Sanity check — the manifest must yield non-empty approved sets,
  // otherwise EVERYTHING flags and the lint becomes useless noise.
  if (manifest.approvedPages.size === 0) {
    console.error('lint-drift: parsed 0 approved pages from MANIFEST.md — aborting.');
    return 2;
  }
  if (manifest.approvedEngines.size === 0) {
    console.error('lint-drift: parsed 0 approved engines from MANIFEST.md — aborting.');
    return 2;
  }
  if (manifest.approvedCardTypes.size === 0) {
    console.error('lint-drift: parsed 0 approved card types from MANIFEST.md — aborting.');
    return 2;
  }

  checkPages(manifest);
  checkEngines(manifest);
  checkCards(manifest);

  return report();
}

const code = main();
process.exit(code);
