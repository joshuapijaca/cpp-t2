// =====================================================================
// Phase B3 — L2 citation re-grounding (Q2 Write struct)
// =====================================================================
// Goal: replace ~211 fake citations to docs/16_test2_specific_redesign_v2.md
// with real PFG paths or real practice/v2/variant stimulus references.
// Add `drills` field with tier1:Q2:{atom-id} (one of 8 Q2 atoms).
//
// Q2 atoms (8) — from brief:
//   q2-struct-keyword          : `struct` keyword (lowercase)
//   q2-entity-snake-case       : entity name in snake_case
//   q2-opening-brace           : `{` opens body
//   q2-field-type-decl         : `type name` per field
//   q2-field-semi              : `;` per field line
//   q2-closing-brace           : `}` closes body
//   q2-trailing-semi           : trailing `;` after `}`
//   q2-noun-to-type            : choose C++ type from English noun
//
// Real source-data anchors:
//   tier2:pfg:part-2-organised-code/3-structuring-data/2-trailside/03-01-struct.md
//   tier2:pfg:part-2-organised-code/3-structuring-data/0-panorama/1-struct.md
//   tier2:pfg:part-2-organised-code/3-structuring-data/2-trailside/02-program-with-type-declarations.md
//   tier2:pfg:part-2-organised-code/3-structuring-data/3-explore/3-1-entity.md
//   tier2:practice:Q2  (computer_data — 2026 T1 practice)
//   tier2:v2:Q2        (desk_data    — V2.0 attempt 1, 2026-05-07)
//   tier2:variant:Q2   (printer_data — Sem 1 2025 retired paper)
// =====================================================================

import { readFileSync, writeFileSync, statSync } from 'fs';
import { glob } from 'glob';
import { resolve, basename, dirname } from 'path';
import yaml from 'js-yaml';

const ROOT = resolve(import.meta.dirname, '..');
const L2_GLOB = 'data/v2/cards/L2/**/*.yml';

// Map subdir name → primary Q2 atom (8 atoms)
function pickAtomForCard(filePath, atomId, cardType) {
  const base = basename(filePath);
  const dir  = basename(dirname(filePath));
  // CM immunization (cm-immunization/CM-*/...) — match BEFORE atom-id branches
  if (dir.startsWith('CM-')) {
    if (dir === 'CM-cap-struct-keyword')  return 'q2-struct-keyword';
    if (dir === 'CM-hyphen-id')           return 'q2-entity-snake-case';
    if (dir === 'CM-missing-semi-field')  return 'q2-field-semi';
    if (dir === 'CM-reserved-word')       return 'q2-entity-snake-case';
    if (dir === 'CM-wrong-type')          return 'q2-noun-to-type';
  }
  // L2-23a (noun→type) → q2-noun-to-type
  if (atomId === 'L-23a' || dir === 'L2-23a') return 'q2-noun-to-type';
  // L2-23b name → entity name + field-decl
  if (atomId === 'L-23b' || dir === 'L2-23b') {
    if (base.includes('name')) return 'q2-entity-snake-case';
    return 'q2-field-type-decl';
  }
  // L2-23c spacing → field semi
  if (atomId === 'L-23c' || dir === 'L2-23c') return 'q2-field-semi';
  // L2-tour (recognition) → spread across keyword / opening-brace / closing-brace
  if (atomId === 'L-21' || dir === 'L2-tour') {
    // Use file-index suffix to spread tour cards across the 3 brace atoms
    const m = base.match(/-(\d+)/);
    const idx = m ? parseInt(m[1], 10) : 0;
    if (idx % 5 === 4) return 'q2-opening-brace';     // 1 in 5 → opening brace focus
    if (idx % 5 === 0) return 'q2-closing-brace';     // 1 in 5 → closing brace focus
    return 'q2-struct-keyword';
  }
  // L2-template (full skeleton) → spread across trailing-semi / opening-brace / closing-brace
  if (atomId === 'L-22' || dir === 'L2-template') {
    const m = base.match(/-(\d+)/);
    const idx = m ? parseInt(m[1], 10) : 0;
    if (idx % 7 === 1) return 'q2-opening-brace';
    if (idx % 7 === 2) return 'q2-closing-brace';
    return 'q2-trailing-semi';
  }
  // L2-compose (write entire struct) → field-type-decl
  if (atomId === 'L-24' || dir === 'L2-compose') return 'q2-field-type-decl';
  // L2-variations (array, bool, etc.) → field-type-decl
  if (atomId === 'L-25' || dir === 'L2-variations') return 'q2-field-type-decl';
  // L2-speed (timed full) → trailing-semi
  if (atomId === 'L-26' || dir === 'L2-speed') return 'q2-trailing-semi';
  // CM immunization carries CM ID; map by CM kind
  if (dir.startsWith('CM-')) {
    if (dir === 'CM-cap-struct-keyword')  return 'q2-struct-keyword';
    if (dir === 'CM-hyphen-id')           return 'q2-entity-snake-case';
    if (dir === 'CM-missing-semi-field')  return 'q2-field-semi';
    if (dir === 'CM-reserved-word')       return 'q2-entity-snake-case';
    if (dir === 'CM-wrong-type')          return 'q2-noun-to-type';
  }
  return 'q2-struct-keyword'; // default fallback
}

// Map filename heuristics → real PFG / practice / v2 / variant ref
function pickTier2(filePath, oldRef, atomId, fields, prompt) {
  const base = basename(filePath);
  const dir  = basename(dirname(filePath));
  const text = (oldRef || '') + ' ' + (prompt || '') + ' ' + base;
  // Real practice-test stimulus (computer_data): MAX=100, fields id/description/location
  if (/computer_data/i.test(text) && /location|description/i.test(text)) {
    return [
      { kind: 'practice', ref: 'tests/Test2-SIT102-practice-2026T1.txt §Q2 — computer_data { int id; string description; string location; }' },
      { kind: 'pfg',      ref: 'pfg-content/part-2-organised-code/3-structuring-data/2-trailside/03-01-struct.md (struct definition reference)' },
    ];
  }
  // V2.0 attempt 1 (real exam): desk_data, MAX=700, room_id/d_id/number_of_screens
  if (/desk_data/i.test(text) && (/room_id|d_id|number_of_screens|V2\.0/i.test(text))) {
    return [
      { kind: 'practice', ref: 'tests/test two attempt 1/Screenshot_20260507-152936.png §Q2 — desk_data { int room_id; int d_id; int number_of_screens; } (V2.0 attempt 1, 2026-05-07)' },
      { kind: 'pfg',      ref: 'pfg-content/part-2-organised-code/3-structuring-data/2-trailside/03-01-struct.md (struct definition reference)' },
    ];
  }
  // Variant test (Sem 1 2025 retired): printer_data
  if (/printer_data/i.test(text)) {
    return [
      { kind: 'practice', ref: 'tests/test2-semester2-variant.txt §Q2 — printer_data { string serial_number; string model; string department; } (Sem 1 2025 retired paper)' },
      { kind: 'pfg',      ref: 'pfg-content/part-2-organised-code/3-structuring-data/2-trailside/03-01-struct.md (struct definition reference)' },
    ];
  }
  // L2-23a noun→type drills (id/description/location/etc.)
  if (atomId === 'L-23a' || dir === 'L2-23a') {
    return [
      { kind: 'pfg',      ref: 'pfg-content/part-2-organised-code/3-structuring-data/3-explore/3-1-entity.md §entity-modelling (book_data noun→type pattern)' },
      { kind: 'practice', ref: 'tests/Test2-SIT102-practice-2026T1.txt §Q2 — id (int) + description (string) + location (string)' },
    ];
  }
  // L2-23b naming/ordering
  if (atomId === 'L-23b' || dir === 'L2-23b') {
    return [
      { kind: 'pfg',      ref: 'pfg-content/part-2-organised-code/3-structuring-data/2-trailside/03-01-struct.md §field-list (snake_case + one field per line)' },
      { kind: 'practice', ref: 'tests/Test2-SIT102-practice-2026T1.txt §Q2 — computer_data field naming + order' },
    ];
  }
  // L2-23c spacing
  if (atomId === 'L-23c' || dir === 'L2-23c') {
    return [
      { kind: 'pfg',      ref: 'pfg-content/part-2-organised-code/3-structuring-data/2-trailside/03-01-struct.md §syntax (one field per line, terminating ;)' },
      { kind: 'practice', ref: 'tests/Test2-SIT102-practice-2026T1.txt §Q2 — multi-field whitespace' },
    ];
  }
  // L2-21 tour - panorama-level intro
  if (atomId === 'L-21' || dir === 'L2-tour') {
    return [
      { kind: 'pfg',      ref: 'pfg-content/part-2-organised-code/3-structuring-data/0-panorama/1-struct.md §panorama (struct as building-block of fields)' },
      { kind: 'practice', ref: 'tests/Test2-SIT102-practice-2026T1.txt §Q2 — canonical struct shape' },
    ];
  }
  // L2-22 template (skeleton) - trailside reference
  if (atomId === 'L-22' || dir === 'L2-template') {
    return [
      { kind: 'pfg',      ref: 'pfg-content/part-2-organised-code/3-structuring-data/2-trailside/03-01-struct.md §C/C++ syntax (struct + name + { fields } ; skeleton)' },
      { kind: 'practice', ref: 'tests/Test2-SIT102-practice-2026T1.txt §Q2 — six-line skeleton' },
    ];
  }
  // L2-24 compose, L2-25 variations, L2-26 speed (default to entity exercise)
  if (atomId === 'L-24' || dir === 'L2-compose') {
    return [
      { kind: 'pfg',      ref: 'pfg-content/part-2-organised-code/3-structuring-data/3-explore/3-1-entity.md §entity-manager (compose new struct from English description)' },
      { kind: 'practice', ref: 'tests/Test2-SIT102-practice-2026T1.txt §Q2 — full compose drill' },
    ];
  }
  if (atomId === 'L-25' || dir === 'L2-variations') {
    return [
      { kind: 'pfg',      ref: 'pfg-content/part-2-organised-code/3-structuring-data/2-trailside/02-program-with-type-declarations.md §type-decl variations' },
      { kind: 'practice', ref: 'tests/Test2-SIT102-practice-2026T1.txt §Q1 — stat_double { double numbers[SIZE]; double mystery; } (array-field variation)' },
    ];
  }
  if (atomId === 'L-26' || dir === 'L2-speed') {
    return [
      { kind: 'pfg',      ref: 'pfg-content/part-2-organised-code/3-structuring-data/2-trailside/03-01-struct.md §full-skeleton drill' },
      { kind: 'practice', ref: 'tests/Test2-SIT102-practice-2026T1.txt §Q2 — under-clock production' },
    ];
  }
  // CM immunization (cm-immunization/CM-*/) — root them in PFG syntax + practice
  if (dir.startsWith('CM-') || /cmimm/i.test(base)) {
    return [
      { kind: 'pfg',      ref: 'pfg-content/part-2-organised-code/3-structuring-data/2-trailside/03-01-struct.md §syntax (correct token form)' },
      { kind: 'practice', ref: 'tests/Test2-SIT102-practice-2026T1.txt §Q2 — common-mistake reference shape' },
    ];
  }
  // Default fallback — root in PFG trailside struct
  return [
    { kind: 'pfg',      ref: 'pfg-content/part-2-organised-code/3-structuring-data/2-trailside/03-01-struct.md (struct definition reference)' },
    { kind: 'practice', ref: 'tests/Test2-SIT102-practice-2026T1.txt §Q2' },
  ];
}

// =====================================================================
// Main
// =====================================================================

const files = await glob(L2_GLOB, { cwd: ROOT, absolute: true });
console.log(`Found ${files.length} L2 yml files`);

let regrounded = 0;
let alreadyOk  = 0;
let skipped    = 0;
const drillCounts = {
  'q2-struct-keyword': 0,
  'q2-entity-snake-case': 0,
  'q2-opening-brace': 0,
  'q2-field-type-decl': 0,
  'q2-field-semi': 0,
  'q2-closing-brace': 0,
  'q2-trailing-semi': 0,
  'q2-noun-to-type': 0,
};
const errors = [];

for (const f of files) {
  try {
    const raw = readFileSync(f, 'utf8');
    const card = yaml.load(raw);
    if (!card || typeof card !== 'object') { skipped++; continue; }

    const oldKind = card.source?.kind;
    const oldRef  = card.source?.ref;
    const isFakeCitation =
      typeof oldRef === 'string' && (
        /docs\/16_test2_specific_redesign_v2\.md/i.test(oldRef)
        || /^Test 2 V2\.0 — desk_data \{[^}]+\}$/i.test(oldRef.trim())   // bare V2.0 hash, no file
        || /^Practice test — computer_data \{[^}]+\}$/i.test(oldRef.trim())
        || /^Test 2 V2.0 — common-mistake immunization/i.test(oldRef.trim())
        || /^Practice test — computer_data noun/i.test(oldRef.trim())
        || /^Test 2 V2\.0 — Q2 speed-drill rubric$/i.test(oldRef.trim())
      );

    const isAlreadyReal =
      typeof oldRef === 'string' && (
        oldRef.includes('Test2-SIT102-practice-2026T1.txt')
        || oldRef.includes('test two attempt 1/Screenshot')
        || oldRef.includes('test2-semester2-variant.txt')
        || oldRef.includes('pfg-content/')
        || oldRef.includes('Programming Fundamentals Guide')
      );

    const atomId = card.atomId;
    const fields = card.requiredFields || card.canonicalAnswer || '';
    const prompt = (card.prompt || '') + ' ' + (card.canonicalAnswer || '') + ' ' + (card.demoCode || '') + ' ' + (card.code || '');

    // Pick drill atom (one of 8)
    const drillAtom = pickAtomForCard(f, atomId, card.type);
    drillCounts[drillAtom] = (drillCounts[drillAtom] || 0) + 1;

    // Always set drills (idempotent, refines on re-run)
    card.drills = [`tier1:Q2:${drillAtom}`];

    // Re-ground source if fake
    if (isFakeCitation) {
      const tier2 = pickTier2(f, oldRef, atomId, fields, prompt);
      // Schema only allows ONE source; use the first (PFG when possible, else practice).
      // Embed the secondary as `tier2` array under a new optional key.
      const primary = tier2.find(t => t.kind === 'pfg') || tier2[0];
      const secondary = tier2.filter(t => t !== primary);
      card.source = { kind: primary.kind, ref: primary.ref };
      card.tier2 = tier2.map(t => `tier2:${t.kind === 'practice' && /Test2-SIT102-practice-2026T1/.test(t.ref) ? 'practice' : t.kind === 'practice' && /test two attempt 1/.test(t.ref) ? 'v2' : t.kind === 'practice' && /test2-semester2-variant/.test(t.ref) ? 'variant' : t.kind}:Q2 — ${t.ref}`);
      regrounded++;
    } else if (isAlreadyReal) {
      // Already real — add tier2 mirror so it's machine-readable
      const inferredKind =
        /test two attempt 1/.test(oldRef)         ? 'v2'      :
        /test2-semester2-variant/.test(oldRef)    ? 'variant' :
        /Test2-SIT102-practice-2026T1/.test(oldRef) ? 'practice' :
        oldKind;
      card.tier2 = [`tier2:${inferredKind}:Q2 — ${oldRef}`];
      alreadyOk++;
    } else {
      // Unknown citation form — leave source, but note for gaps
      errors.push(`UNKNOWN_REF: ${f.replace(ROOT, '.')} — kind=${oldKind} ref="${oldRef}"`);
      skipped++;
      continue;
    }

    // Write back, preserving YAML order best-effort
    const out = yaml.dump(card, { lineWidth: 120, noRefs: true, sortKeys: false });
    writeFileSync(f, out, 'utf8');
  } catch (e) {
    errors.push(`PARSE_FAIL: ${f.replace(ROOT, '.')} — ${e.message}`);
    skipped++;
  }
}

console.log(`Regrounded: ${regrounded}`);
console.log(`Already real: ${alreadyOk}`);
console.log(`Skipped: ${skipped}`);
console.log(`Drill atom counts:`, drillCounts);
if (errors.length) {
  console.log('\nErrors:');
  errors.slice(0, 30).forEach(e => console.log(' - ' + e));
  if (errors.length > 30) console.log(` (+${errors.length - 30} more)`);
}

// Emit gaps file
const gapsPath = resolve(ROOT, 'build-v2/B3_GAPS.md');
const gapLines = [
  '# B3 Gaps — L2 (Q2 Write struct) re-grounding',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  '## Drill atom coverage (target ≥3 cards each)',
  '',
  '| Atom | Cards | Status |',
  '|---|---:|---|',
  ...Object.entries(drillCounts).map(([a, c]) => `| ${a} | ${c} | ${c >= 3 ? 'OK' : 'GAP'} |`),
  '',
  `## Re-grounding stats`,
  '',
  `- Total L2 cards scanned: ${files.length}`,
  `- Regrounded (replaced fake/planning-doc citation): ${regrounded}`,
  `- Already real (verified citation, tier2 added): ${alreadyOk}`,
  `- Skipped (parse fail or unknown ref form): ${skipped}`,
  '',
];
if (errors.length) {
  gapLines.push('## Errors / Unknown refs (sample first 30)');
  gapLines.push('');
  errors.slice(0, 30).forEach(e => gapLines.push('- ' + e));
  gapLines.push('');
}
gapLines.push('## Atoms below 3-card target');
const lows = Object.entries(drillCounts).filter(([_, c]) => c < 3);
if (lows.length === 0) {
  gapLines.push('');
  gapLines.push('None — all 8 Q2 atoms covered ≥3 cards.');
} else {
  lows.forEach(([a, c]) => gapLines.push(`- ${a}: ${c} cards (need ${3 - c} more)`));
}
writeFileSync(gapsPath, gapLines.join('\n') + '\n', 'utf8');
console.log(`\nGaps file written: ${gapsPath}`);
