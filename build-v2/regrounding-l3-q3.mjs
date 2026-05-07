// =====================================================================
// Phase B4 — L3 Q3 citation re-grounding
// =====================================================================
// Walks data/v2/cards/L3/**/*.yml.
// 1. Replaces fake `source: { kind: v2, ref: cpp-t2/docs/16_... }` with
//    REAL source citations (practice/v2/pfg/seminar) anchored to
//    SOURCE_DATA_CATALOG.md per-folder mapping.
// 2. Adds new top-level `drills:` field with tier1+tier2 strings.
// =====================================================================

import { readFileSync, writeFileSync, statSync } from 'fs';
import { glob } from 'glob';
import { resolve, sep, posix } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const L3_GLOB = 'data/v2/cards/L3/**/*.yml';

// ---------------------------------------------------------------------
// Folder -> atomId, tier1 atom-id, tier2 source set
// ---------------------------------------------------------------------

// Tier-1 atom-tag = the 9 Q3 atoms (per brief). We map each folder to
// the most-load-bearing tier-1 atom for its drill purpose. Cards may
// touch multiple atoms; the tier-1 entry is the PRIMARY one.

const FOLDER_PROFILE = {
  // ----- S1 Tour: orient to Q3 read function (atom = void return) -----
  'S1-Tour': {
    primaryAtom: 'R-00',
    tier1Tag: 'tier1:Q3:R-00',  // Q3 atom 1: void return type + tour
    tier2: [
      'tier2:practice:Q3',                                 // read_computers shape
      'tier2:v2:Q3',                                       // read_desks shape
      'tier2:seminar:saloni-2 @ 44:50',                    // Q3 teaching block
      'tier2:pfg:part-2-organised-code/2-organising-code/2-trailside/04-function-decl.mdx',
      'tier2:pfg:part-2-organised-code/2-organising-code/2-trailside/04-parameter.mdx',
    ],
    sourceCitation: {
      kind: 'practice',
      ref: 'Test2-SIT102-practice-2026T1.txt — Q3 read_computers signature line',
    },
  },
  // ----- S2 Template: skeleton order + read_<entity> naming -----
  'S2-Template': {
    primaryAtom: 'R-01',
    tier1Tag: 'tier1:Q3:R-01',
    tier2: [
      'tier2:practice:Q3',
      'tier2:v2:Q3',
      'tier2:variant:Q3',
      'tier2:seminar:saloni-2 @ 44:50',
      'tier2:pfg:part-2-organised-code/2-organising-code/2-trailside/04-function-decl.mdx',
    ],
    sourceCitation: {
      kind: 'v2',
      ref: 'Test 2 V2.0 attempt 1 (2026-05-07) — `void read_desks(desk_data &desk_list[], int number_to_read)` skeleton',
    },
  },
  // ----- S3 Components -----
  'S3-Components/A-sig': {
    primaryAtom: 'R-02a',
    // CRITICAL atom: &list[] placement (Deakin-unusual)
    tier1Tag: 'tier1:Q3:R-02a',
    tier2: [
      'tier2:practice:Q3',
      'tier2:v2:Q3',
      'tier2:variant:Q3',
      'tier2:seminar:saloni-2 @ 44:50',
      'tier2:pfg:part-2-organised-code/2-organising-code/2-trailside/04-parameter.mdx',
      'tier2:pfg:part-2-organised-code/5-working-with-multiples/2-trailside/00-05-array-params.mdx',
    ],
    sourceCitation: {
      kind: 'v2',
      ref: 'Test 2 V2.0 attempt 1 (2026-05-07) — Q3 signature `desk_data &desk_list[]` (& placement)',
    },
  },
  'S3-Components/B-loop': {
    primaryAtom: 'R-02b',
    tier1Tag: 'tier1:Q3:R-02b',
    tier2: [
      'tier2:practice:Q3',
      'tier2:v2:Q3',
      'tier2:seminar:saloni-2 @ 46:30',                    // Q4 covers same loop pattern
      'tier2:pfg:part-2-organised-code/1-starting-cpp/2-trailside/4-6-for.md',
    ],
    sourceCitation: {
      kind: 'pfg',
      ref: 'part-2-organised-code/1-starting-cpp/2-trailside/4-6-for.md — for(int i=0; i<n; i++) form',
    },
  },
  'S3-Components/Block-A-amp-array': {
    primaryAtom: 'R-02a',
    tier1Tag: 'tier1:Q3:R-02a',
    tier2: [
      'tier2:practice:Q3',
      'tier2:v2:Q3',
      'tier2:variant:Q3',
      'tier2:pfg:part-2-organised-code/5-working-with-multiples/2-trailside/00-05-array-params.mdx',
      'tier2:seminar:saloni-2 @ 44:50',
    ],
    sourceCitation: {
      kind: 'v2',
      ref: 'Test 2 V2.0 attempt 1 — Q3 `desk_data &desk_list[]` (Deakin-unusual & placement before list name with [])',
    },
  },
  'S3-Components/Block-B-number-to-read': {
    primaryAtom: 'R-02b',
    tier1Tag: 'tier1:Q3:R-02b',
    tier2: [
      'tier2:practice:Q3',
      'tier2:v2:Q3',
      'tier2:pfg:part-2-organised-code/2-organising-code/2-trailside/04-parameter.mdx',
    ],
    sourceCitation: {
      kind: 'practice',
      ref: 'Test2-SIT102-practice-2026T1.txt — Q3 second parameter `int number_to_read`',
    },
  },
  'S3-Components/C-cin': {
    primaryAtom: 'R-02c',
    tier1Tag: 'tier1:Q3:R-02c',
    tier2: [
      'tier2:practice:Q3',
      'tier2:v2:Q3',
      'tier2:variant:Q3',
      'tier2:seminar:saloni-2 @ 45:30',
    ],
    sourceCitation: {
      kind: 'v2',
      ref: 'Test 2 V2.0 attempt 1 — Q3 body uses `cin >> desk_list[i].<field>` per field',
    },
  },
  'S3-Components/D-pair': {
    primaryAtom: 'R-02d',
    tier1Tag: 'tier1:Q3:R-02d',
    tier2: [
      'tier2:practice:Q3',
      'tier2:v2:Q3',
      'tier2:seminar:saloni-2 @ 45:30',
    ],
    sourceCitation: {
      kind: 'v2',
      ref: 'Test 2 V2.0 attempt 1 — prompt-then-read pattern: `cout << "..."; cin >> list[i].field;`',
    },
  },
  'S3-Components/E-multi': {
    primaryAtom: 'R-02e',
    tier1Tag: 'tier1:Q3:R-02e',
    tier2: [
      'tier2:practice:Q3',
      'tier2:v2:Q3',
      'tier2:seminar:saloni-2 @ 45:30',
    ],
    sourceCitation: {
      kind: 'v2',
      ref: 'Test 2 V2.0 attempt 1 — Q3 body close `}` after 3-field prompt-read sequence',
    },
  },
  // ----- S4 Compose: full body for desks/computers/etc. -----
  'S4-Compose': {
    primaryAtom: 'R-03',
    tier1Tag: 'tier1:Q3:R-03',
    tier2: [
      'tier2:practice:Q3',
      'tier2:v2:Q3',
      'tier2:variant:Q3',
      'tier2:seminar:saloni-2 @ 44:50',
      'tier2:pfg:part-2-organised-code/2-organising-code/2-trailside/04-function-decl.mdx',
      'tier2:pfg:part-2-organised-code/5-working-with-multiples/2-trailside/00-05-array-params.mdx',
    ],
    sourceCitation: {
      kind: 'v2',
      ref: 'Test 2 V2.0 attempt 1 — Q3 full read_desks body shape (12-line skeleton)',
    },
  },
  // ----- S5 Variations: param/list/string/v2/v4/v5/mixed -----
  'S5-Variations': {
    primaryAtom: 'R-04',
    tier1Tag: 'tier1:Q3:R-04',
    tier2: [
      'tier2:practice:Q3',
      'tier2:v2:Q3',
      'tier2:variant:Q3',
    ],
    sourceCitation: {
      kind: 'practice',
      ref: 'Test2-SIT102-practice-2026T1.txt + Test 2 V2.0 attempt 1 — Q3 read function across entity variants',
    },
  },
  // ----- S6 Speed: timed full-write -----
  'S6-Speed': {
    primaryAtom: 'R-05',
    tier1Tag: 'tier1:Q3:R-05',
    tier2: [
      'tier2:practice:Q3',
      'tier2:v2:Q3',
      'tier2:variant:Q3',
      'tier2:seminar:saloni-2 @ 44:50',
    ],
    sourceCitation: {
      kind: 'v2',
      ref: 'Test 2 V2.0 attempt 1 — Q3 timed (60s) read_desks reproduction',
    },
  },
  // ----- cm-immunization: 6 specific common-mistake spots -----
  'cm-immunization/CM-missing-bracket-sig': {
    primaryAtom: 'R-00',
    tier1Tag: 'tier1:Q3:R-00',
    tier2: [
      'tier2:v2:Q3',
      'tier2:practice:Q3',
    ],
    sourceCitation: {
      kind: 'v2',
      ref: 'Test 2 V2.0 attempt 1 — Q3 signature paren omission CM-missing-bracket-sig',
    },
  },
  'cm-immunization/CM-missing-dot-field': {
    primaryAtom: 'R-02c',
    tier1Tag: 'tier1:Q3:R-02c',
    tier2: [
      'tier2:v2:Q3',
      'tier2:practice:Q3',
    ],
    sourceCitation: {
      kind: 'v2',
      ref: 'Test 2 V2.0 attempt 1 — Q3 body cin missing .field CM-missing-dot-field',
    },
  },
  'cm-immunization/CM-off-by-one-le': {
    primaryAtom: 'R-02b',
    tier1Tag: 'tier1:Q3:R-02b',
    tier2: [
      'tier2:v2:Q3',
      'tier2:practice:Q3',
      'tier2:pfg:part-2-organised-code/1-starting-cpp/2-trailside/4-6-for.md',
    ],
    sourceCitation: {
      kind: 'pfg',
      ref: 'part-2-organised-code/1-starting-cpp/2-trailside/4-6-for.md — half-open `<` not `<=` CM-off-by-one-le',
    },
  },
  'cm-immunization/CM-prompt-outside-loop': {
    primaryAtom: 'R-02d',
    tier1Tag: 'tier1:Q3:R-02d',
    tier2: [
      'tier2:v2:Q3',
      'tier2:practice:Q3',
    ],
    sourceCitation: {
      kind: 'v2',
      ref: 'Test 2 V2.0 attempt 1 — Q3 prompt belongs INSIDE for-loop CM-prompt-outside-loop',
    },
  },
  'cm-immunization/CM-wrong-bound-SIZE': {
    primaryAtom: 'R-02b',
    tier1Tag: 'tier1:Q3:R-02b',
    tier2: [
      'tier2:v2:Q3',
      'tier2:practice:Q3',
    ],
    sourceCitation: {
      kind: 'practice',
      ref: 'Test2-SIT102-practice-2026T1.txt — Q3 bound is parameter `number_to_read` not constant `SIZE` CM-wrong-bound-SIZE',
    },
  },
  'cm-immunization/CM-zero-instead-of-i': {
    primaryAtom: 'R-02c',
    tier1Tag: 'tier1:Q3:R-02c',
    tier2: [
      'tier2:v2:Q3',
      'tier2:practice:Q3',
    ],
    sourceCitation: {
      kind: 'v2',
      ref: 'Test 2 V2.0 attempt 1 — Q3 must index `[i]` not `[0]` CM-zero-instead-of-i',
    },
  },
};

// Atoms list - used for ≥3 cards-per-atom audit
const Q3_ATOMS = [
  'R-00', 'R-01', 'R-02a', 'R-02b', 'R-02c', 'R-02d', 'R-02e', 'R-03', 'R-04', 'R-05',
];

// ---------------------------------------------------------------------
// Helpers — surgical edits on YAML text (no full parse / serialize) so
// that we preserve comments + ordering + indentation + quote styles.
// ---------------------------------------------------------------------

function getFolderKey(absPath) {
  const rel = absPath.split(`${sep}data${sep}v2${sep}cards${sep}L3${sep}`)[1];
  if (!rel) return null;
  const norm = rel.split(sep).join('/');
  // Folder key = everything except the file name
  const parts = norm.split('/');
  parts.pop();
  return parts.join('/');
}

function rewriteSourceField(yamlText, citation) {
  // Replace the `source:` mapping (kind+ref). We match a multi-line mapping
  // OR a single-line shape, both of which appear in the corpus.

  // Pattern A (block): `source:\n  kind: ...\n  ref: ...`
  // Pattern B (block with quotes): `source:\n  kind: "..."\n  ref: "..."`
  const blockRe = /source:\s*\n(?:[ \t]+kind:[ \t]*("?)([^"\n]*)\1[ \t]*\n)(?:[ \t]+ref:[ \t]*("?)([^"\n]*)\3[ \t]*\n)?/m;
  const m = yamlText.match(blockRe);
  if (m) {
    const safe = citation.ref.replace(/"/g, '\\"');
    const replacement = `source:\n  kind: "${citation.kind}"\n  ref: "${safe}"\n`;
    return yamlText.replace(blockRe, replacement);
  }

  // Pattern C: flow style `source: { kind: x, ref: y }` (rare in this corpus)
  const flowRe = /source:[ \t]*\{[^}]*\}[ \t]*\n?/;
  if (flowRe.test(yamlText)) {
    const safe = citation.ref.replace(/"/g, '\\"');
    return yamlText.replace(flowRe, `source:\n  kind: "${citation.kind}"\n  ref: "${safe}"\n`);
  }

  return yamlText; // unchanged if no match
}

function injectDrills(yamlText, profile) {
  // Skip if drills: already present
  if (/^drills:/m.test(yamlText)) return yamlText;

  const lines = [
    'drills:',
    `  - "${profile.tier1Tag}"`,
    ...profile.tier2.map((s) => `  - "${s}"`),
  ];
  const drillsBlock = lines.join('\n') + '\n';

  // Insert AFTER the source: block. Find the source: block and the next line
  // not starting with whitespace (i.e. end of source mapping).
  const sourceIdx = yamlText.indexOf('\nsource:');
  if (sourceIdx === -1) {
    // No source: at all — append drills at end
    return yamlText + (yamlText.endsWith('\n') ? '' : '\n') + drillsBlock;
  }

  // Walk forward from sourceIdx to find end of mapping
  let pos = sourceIdx + 1; // skip the leading \n
  // Move past `source:` line
  const eolAfterSourceLabel = yamlText.indexOf('\n', pos);
  if (eolAfterSourceLabel === -1) {
    return yamlText + '\n' + drillsBlock;
  }
  let cursor = eolAfterSourceLabel + 1;
  while (cursor < yamlText.length) {
    // Find end of this line
    const eol = yamlText.indexOf('\n', cursor);
    const line = yamlText.slice(cursor, eol === -1 ? yamlText.length : eol);
    if (line.length === 0) {
      // empty line ends the block
      cursor = eol + 1;
      break;
    }
    if (!/^[ \t]/.test(line)) {
      // non-indented line = next top-level key, drills should go before
      break;
    }
    if (eol === -1) {
      cursor = yamlText.length;
      break;
    }
    cursor = eol + 1;
  }
  return yamlText.slice(0, cursor) + drillsBlock + yamlText.slice(cursor);
}

// ---------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------

async function main() {
  const files = await glob(L3_GLOB, { cwd: ROOT, absolute: true });
  files.sort();

  let touched = 0;
  let skipped = 0;
  const folderCounts = {};
  const atomCounts = {};
  const unrecognized = [];

  for (const file of files) {
    const fk = getFolderKey(file);
    if (!fk) { skipped++; continue; }
    const profile = FOLDER_PROFILE[fk];
    if (!profile) {
      unrecognized.push({ file, fk });
      skipped++;
      continue;
    }

    const original = readFileSync(file, 'utf8');
    let next = original;

    // 1. Replace fake source citation with real one
    next = rewriteSourceField(next, profile.sourceCitation);

    // 2. Inject drills: block (if not already present)
    next = injectDrills(next, profile);

    if (next !== original) {
      writeFileSync(file, next, 'utf8');
      touched++;
      folderCounts[fk] = (folderCounts[fk] ?? 0) + 1;
      atomCounts[profile.primaryAtom] = (atomCounts[profile.primaryAtom] ?? 0) + 1;
    } else {
      skipped++;
    }
  }

  console.log('=== Re-grounding summary ===');
  console.log(`files matched: ${files.length}`);
  console.log(`files touched: ${touched}`);
  console.log(`files skipped: ${skipped}`);
  console.log('\nPer-folder counts:');
  for (const [k, v] of Object.entries(folderCounts).sort()) {
    console.log(`  ${k.padEnd(48)} ${v}`);
  }
  console.log('\nPer-atom (tier1) counts:');
  for (const [k, v] of Object.entries(atomCounts).sort()) {
    console.log(`  ${k.padEnd(8)} ${v}`);
  }
  console.log('\nQ3 atoms with <3 cards (gap):');
  for (const a of Q3_ATOMS) {
    const c = atomCounts[a] ?? 0;
    if (c < 3) console.log(`  ${a.padEnd(8)} ${c}`);
  }
  if (unrecognized.length > 0) {
    console.log('\nUnrecognized folders (no profile):');
    for (const { file, fk } of unrecognized.slice(0, 20)) {
      console.log(`  fk=${fk}  file=${file}`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
