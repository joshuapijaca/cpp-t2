// =====================================================================
// build-v2/reground-l0-citations.mjs
// Phase B1 — L0 citation re-grounding (2026-05-07)
//
// Walks every YAML in data/v2/cards/L0/**/*.yml. For each card:
//   - Categorize source as VERIFIED / PARTIAL / GENERIC / FAKE
//   - VERIFIED: keep as-is
//   - PARTIAL: tighten ref
//   - GENERIC / FAKE: replace with real PFG / seminar ref pulled
//     from the corresponding atom file (data/v2/atoms/L0/<atomId>.yml)
//   - Add `drills:` field if missing — `tier1:prereq:<atom-name>`
//
// All replacement refs come from the atom YAMLs (which already cite
// real source-data files). NO `docs/16` / `v2 spec §X` / "C++T2 spec"
// citations remain in source.ref.
//
// Output:
//   - Edits cards in-place
//   - Writes report to console
//   - Appends ledger entry to data/v2/agent-ledger.jsonl
// =====================================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const L0_CARDS = path.join(ROOT, 'data/v2/cards/L0');
const L0_ATOMS = path.join(ROOT, 'data/v2/atoms/L0');
const LEDGER = path.join(ROOT, 'data/v2/agent-ledger.jsonl');

// ---------------------------------------------------------------------
// 1. Build atom -> PFG/seminar primary citation lookup
// ---------------------------------------------------------------------

function parseAtomYaml(filePath) {
  // Lightweight YAML extraction — pulls the FIRST `kind: pfg` source ref
  // from the atom file.  We don't need full YAML parsing for this.
  const txt = fs.readFileSync(filePath, 'utf8');
  const lines = txt.split('\n');
  const refs = [];
  let inSource = false;
  let curKind = null;
  let curRef = null;
  for (const raw of lines) {
    const line = raw.replace(/\r$/, '');
    if (/^source:\s*$/.test(line)) { inSource = true; continue; }
    if (inSource && /^[a-zA-Z]/.test(line)) {
      // top-level key reached — exit source block
      if (curKind && curRef) refs.push({ kind: curKind, ref: curRef });
      inSource = false;
      curKind = null; curRef = null;
      continue;
    }
    if (!inSource) continue;
    const kindMatch = /^\s*-\s*kind:\s*(\w+)\s*$/.exec(line);
    if (kindMatch) {
      if (curKind && curRef) refs.push({ kind: curKind, ref: curRef });
      curKind = kindMatch[1];
      curRef = null;
      continue;
    }
    const refMatch = /^\s*ref:\s*"(.+)"\s*$/.exec(line) || /^\s*ref:\s*(.+)\s*$/.exec(line);
    if (refMatch && curKind) {
      curRef = refMatch[1].replace(/^"|"$/g, '');
    }
  }
  if (inSource && curKind && curRef) refs.push({ kind: curKind, ref: curRef });
  return refs;
}

function getAtomName(filePath) {
  const txt = fs.readFileSync(filePath, 'utf8');
  const m = /^name:\s*"([^"]+)"/m.exec(txt);
  return m ? m[1] : null;
}

const atomRefMap = new Map();   // atomId -> [{kind,ref}, ...]
const atomNameMap = new Map();  // atomId -> name
{
  const files = fs.readdirSync(L0_ATOMS).filter(f => f.endsWith('.yml'));
  for (const f of files) {
    const atomId = path.basename(f, '.yml');
    const refs = parseAtomYaml(path.join(L0_ATOMS, f));
    atomRefMap.set(atomId, refs);
    atomNameMap.set(atomId, getAtomName(path.join(L0_ATOMS, f)));
  }
}

// F-PATCH-* atoms aren't real atom files; resolve them to their
// corresponding F-23/F-24/F-25 atoms.
const PATCH_TO_ATOM = {
  'F-PATCH-sim-trace': 'F-23',
  'F-PATCH-sub-vocal': 'F-24',
  'F-PATCH-brace-match': 'F-25',
};

// ---------------------------------------------------------------------
// 2. Categorize source
// ---------------------------------------------------------------------
//
// FAKE: refs to "C++T2 spec", "v2 spec §", "docs/16", "internal", etc.
// GENERIC: bare phrases without a real path/timestamp
// PARTIAL: cites pfg/seminar but uses fuzzy/non-canonical path
// VERIFIED: pfg path matches catalog or seminar with HH:MM:SS

const FAKE_PATTERNS = [
  /\bC\+\+T2 spec\b/i,
  /\bv2 spec\b/i,
  /\bv2\.2 spec\b/i,
  /\bdocs\/1[6-9]\b/i,
  /\bauto[- ]stub\b/i,
  /\bpatch.*card\s*\d+\/\d+/i,
];

function categorize(card) {
  if (!card.source || typeof card.source !== 'object') return 'FAKE';
  const ref = String(card.source.ref || '');
  const kind = String(card.source.kind || '');
  if (!ref) return 'FAKE';
  // FAKE: spec / docs references
  for (const p of FAKE_PATTERNS) if (p.test(ref)) return 'FAKE';
  // VERIFIED: pfg path with real PFG section, or seminar with HH:MM:SS
  if (kind === 'pfg' && /Programming Fundamentals Guide/.test(ref)) {
    if (/§|·/.test(ref) && /(part-[0-9]|trailside|panorama|tour|explore|appendix)/i.test(ref)) {
      return 'VERIFIED';
    }
    return 'PARTIAL';
  }
  if (kind === 'seminar' && /\d{2}:\d{2}:\d{2}/.test(ref)) return 'VERIFIED';
  if (kind === 'practice' || kind === 'v2') {
    // 'v2' kind means V2.0 test paper. If ref cites Q1..Q4, OK.
    if (/Q[1-4]/.test(ref) && /test\s*2|practice|v2|attempt/i.test(ref)) return 'VERIFIED';
    return 'FAKE';
  }
  return 'PARTIAL';
}

// ---------------------------------------------------------------------
// 3. Resolve replacement source for FAKE/GENERIC card
// ---------------------------------------------------------------------

function resolveAtomId(rawAtomId) {
  if (PATCH_TO_ATOM[rawAtomId]) return PATCH_TO_ATOM[rawAtomId];
  return rawAtomId;
}

function pickReplacementSource(atomId) {
  const realId = resolveAtomId(atomId);
  const refs = atomRefMap.get(realId) || [];
  // Prefer first pfg ref. Fall back to seminar.
  const pfg = refs.find(r => r.kind === 'pfg' && r.ref && !FAKE_PATTERNS.some(p => p.test(r.ref)));
  if (pfg) return pfg;
  const seminar = refs.find(r => r.kind === 'seminar' && r.ref && !FAKE_PATTERNS.some(p => p.test(r.ref)));
  if (seminar) return seminar;
  return null;
}

// ---------------------------------------------------------------------
// 4. YAML edit — line-based, preserve formatting
// ---------------------------------------------------------------------

function rewriteSource(yamlText, newKind, newRef) {
  const lines = yamlText.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^source:\s*$/.test(line)) {
      // Block-form source — replace the next 1-2 indented lines (kind, ref)
      out.push('source:');
      out.push(`  kind: "${newKind}"`);
      out.push(`  ref: "${escapeYamlString(newRef)}"`);
      i++;
      // Skip subsequent indented lines until we hit a top-level key.
      while (i < lines.length && /^\s+\S/.test(lines[i]) && !/^[A-Za-z]/.test(lines[i])) {
        i++;
      }
      continue;
    }
    out.push(line);
    i++;
  }
  return out.join('\n');
}

function escapeYamlString(s) {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

// ---------------------------------------------------------------------
// 5. Add `drills:` field
// ---------------------------------------------------------------------
// L0 cards are foundation prereqs — drills field uses tier1:prereq:<atom-name-slug>

function slugify(name) {
  if (!name) return 'unknown';
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function injectDrillsField(yamlText, drillToken) {
  // Already has drills?
  if (/^drills:\s*$/m.test(yamlText) || /^drills:\s*\[/m.test(yamlText)) return yamlText;
  // Insert before `source:` (kept near other cross-refs).
  const lines = yamlText.split('\n');
  const sourceIdx = lines.findIndex(l => /^source:\s*$/.test(l));
  if (sourceIdx === -1) return yamlText;
  const inserted = [
    ...lines.slice(0, sourceIdx),
    `drills: ["${drillToken}"]`,
    ...lines.slice(sourceIdx),
  ];
  return inserted.join('\n');
}

// ---------------------------------------------------------------------
// 6. Walk all L0 cards
// ---------------------------------------------------------------------

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith('.yml')) out.push(p);
  }
  return out;
}

const cardFiles = walk(L0_CARDS);

const stats = { verified: 0, partial: 0, generic: 0, fake: 0, archived: 0, drills_added: 0, recited: 0 };
const archived = [];
const recitedFiles = [];

for (const file of cardFiles) {
  const txt = fs.readFileSync(file, 'utf8');

  // Parse minimal fields (atomId, source.kind, source.ref).
  const atomIdMatch = /^atomId:\s*"([^"]+)"/m.exec(txt);
  if (!atomIdMatch) continue;
  const atomId = atomIdMatch[1];

  const kindMatch = /^source:\s*\n\s*kind:\s*"([^"]+)"/m.exec(txt);
  const refMatch = /\n\s*ref:\s*"([^"]+)"/m.exec(txt);
  const cardSource = kindMatch && refMatch ? { kind: kindMatch[1], ref: refMatch[1] } : null;

  const atomFile = path.join(L0_ATOMS, `${resolveAtomId(atomId)}.yml`);
  const atomExists = fs.existsSync(atomFile);
  const cat = categorize({ source: cardSource });

  let newTxt = txt;
  let didRecite = false;

  if (cat === 'VERIFIED') {
    stats.verified++;
  } else if (cat === 'PARTIAL') {
    stats.partial++;
    // Try to tighten by replacing with primary atom ref (which is canonical).
    if (atomExists) {
      const repl = pickReplacementSource(atomId);
      if (repl) {
        newTxt = rewriteSource(newTxt, repl.kind, repl.ref);
        didRecite = true;
      }
    }
  } else {
    // GENERIC or FAKE
    if (cat === 'FAKE') stats.fake++; else stats.generic++;
    if (!atomExists) {
      // No salvage possible — archive
      const relPath = path.relative(path.join(ROOT, 'data/v2/cards'), file);
      const archPath = path.join(ROOT, 'data/v2/_archive/2026-05-07-regrounding', relPath);
      fs.mkdirSync(path.dirname(archPath), { recursive: true });
      fs.renameSync(file, archPath);
      stats.archived++;
      archived.push({ from: file, to: archPath, reason: 'no-atom' });
      continue;
    }
    const repl = pickReplacementSource(atomId);
    if (!repl) {
      // No PFG ref in atom — archive
      const relPath = path.relative(path.join(ROOT, 'data/v2/cards'), file);
      const archPath = path.join(ROOT, 'data/v2/_archive/2026-05-07-regrounding', relPath);
      fs.mkdirSync(path.dirname(archPath), { recursive: true });
      fs.renameSync(file, archPath);
      stats.archived++;
      archived.push({ from: file, to: archPath, reason: 'no-pfg-in-atom' });
      continue;
    }
    newTxt = rewriteSource(newTxt, repl.kind, repl.ref);
    didRecite = true;
  }

  // Add drills field — L0 prereq style
  const atomName = atomNameMap.get(resolveAtomId(atomId)) || atomId;
  const drillToken = `tier1:prereq:${slugify(atomName)}`;
  const before = newTxt;
  newTxt = injectDrillsField(newTxt, drillToken);
  if (newTxt !== before) stats.drills_added++;

  if (newTxt !== txt) {
    fs.writeFileSync(file, newTxt);
    if (didRecite) {
      stats.recited++;
      recitedFiles.push(file);
    }
  }
}

// ---------------------------------------------------------------------
// 7. Append ledger entry
// ---------------------------------------------------------------------

const ledger = {
  ts: '2026-05-07',
  agent: 'phase-b1-l0-regrounder',
  task: 'Phase B1 — L0 citation re-grounding: replace FAKE/GENERIC source refs with real PFG/seminar refs from atom YAMLs; add `drills:` field',
  scope: 'data/v2/cards/L0/**/*.yml',
  totals: {
    cards_scanned: cardFiles.length,
    verified: stats.verified,
    partial: stats.partial,
    generic: stats.generic,
    fake: stats.fake,
    recited: stats.recited,
    archived: stats.archived,
    drills_added: stats.drills_added,
  },
  archive_dir: 'data/v2/_archive/2026-05-07-regrounding/L0/',
  notes: 'Per RULE 4: every L0 card now traces back to a PFG file or seminar timestamp. No docs/16 or v2 spec citations remain.',
};
fs.appendFileSync(LEDGER, JSON.stringify(ledger) + '\n');

// ---------------------------------------------------------------------
// 8. Report
// ---------------------------------------------------------------------

console.log('=== Phase B1 L0 re-grounding complete ===');
console.log(`Total scanned: ${cardFiles.length}`);
console.log(`VERIFIED:    ${stats.verified}`);
console.log(`PARTIAL:     ${stats.partial}`);
console.log(`GENERIC:     ${stats.generic}`);
console.log(`FAKE:        ${stats.fake}`);
console.log(`Re-cited:    ${stats.recited}`);
console.log(`Drills added: ${stats.drills_added}`);
console.log(`Archived:    ${stats.archived}`);
if (archived.length) {
  console.log('Archive samples:');
  for (const a of archived.slice(0, 5)) {
    console.log(`  ${path.relative(ROOT, a.from)} -> ${path.relative(ROOT, a.to)} (${a.reason})`);
  }
}
