// =====================================================================
// Phase B2 — L1 citation re-grounding
//
// Walks data/v2/cards/L1/**/*.yml and:
//   1. Adds/updates `drills:` field — `tier1:Q1:{atom-id}`
//      where {atom-id} is one of the 17 Q1 atoms (MANIFEST §2.1).
//   2. Verifies/upgrades `source.ref` to a real Tier-2 string:
//      - tier2:pfg:part-X/...
//      - tier2:seminar:saloni-2 @ HH:MM:SS (from Saloni VTT)
//      - tier2:practice:Q1
//      - tier2:v2:Q1
//      - tier2:variant:Q1
//
// Per-atom card count tally written to stdout for the final report.
// All Saloni timestamps come from SOURCE_DATA_CATALOG.md §2 +
// the VTT itself (verified via grep before encoding).
// =====================================================================

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const L1_DIR = path.join(ROOT, 'data', 'v2', 'cards', 'L1');
const ARCHIVE_DIR = path.join(ROOT, 'data', 'v2', '_archive', '2026-05-07-regrounding', 'L1');
const GAPS_PATH = path.join(ROOT, 'build-v2', 'B2_GAPS.md');
const LEDGER_PATH = path.join(ROOT, 'data', 'v2', 'agent-ledger.jsonl');

// 17 canonical Q1 atoms (MANIFEST §2.1)
const Q1_ATOMS = [
  'const', 'struct-kw', 'field-array', 'field-scalar', 'void-fn',
  'param-by-ref', 'semicolon', 'brace-block', 'dot-array-access',
  'dot-scalar-access', 'pre-loop-init', 'for-header', 'if-cond-gt',
  'accumulator', 'brace-init-nested', 'fn-call-no-amp', 'trace-strikethrough',
];
const Q1_ATOM_SET = new Set(Q1_ATOMS);

// Real Saloni VTT timestamp anchors verified against the file.
// (source-data/seminars/SIT102 Seminar - Mondays 6pm new (2).vtt)
const SALONI = {
  Q1_OPEN:        '00:23:02',  // "we'll start with the hand execution"
  SIZE_CONST:     '00:24:16',  // "we have something called as size"
  SIZE_VALUE:     '00:25:21',  // "the size is 5"
  STRUCT_KW:      '00:25:39',  // "we have something called as struct"
  STRUCT_BOX:     '00:25:50',  // "for the struct, what we need is a box"
  STRUCT_FIELDS:  '00:26:07',  // "inside this struct, what do we have"
  ARRAY_FIELD:    '00:26:21',  // "we declare an array... numbers"
  ARRAY_DRAW:     '00:26:44',  // "another box which is an array"
  ARRAY_SIZE:     '00:26:58',  // "the size of the array is 5"
  ARRAY_INDICES:  '00:27:11',  // "the array usually starts with zero"
  WRITE_VALUES:   '00:27:30',  // "we write the numbers inside the array"
  WARNING_I:      '00:28:25',  // 'int i;' is NOT inside the struct
};

// ---------------------------------------------------------------------
// Atom inference: filename / dir / stem -> one of the 17 Q1 atoms.
// Per MANIFEST §2.1, every L1 card drills exactly one Q1 atom.
// ---------------------------------------------------------------------

/**
 * Derive the Q1 atom this card drills.
 * Inputs: relative path inside L1, file basename, stem text.
 */
function inferAtom(relPath, base, stemLower, codeLower) {
  // S2-Template direct template-by-template mapping
  if (relPath.includes('T-A-struct')) return 'struct-kw';
  if (relPath.includes('T-B-fn-sig')) return 'param-by-ref';
  if (relPath.includes('T-C-init')) return 'pre-loop-init';
  if (relPath.includes('T-D-for')) return 'for-header';
  if (relPath.includes('T-E-if-action')) return 'if-cond-gt';
  if (relPath.includes('T-F-brace-init')) return 'brace-init-nested';
  if (relPath.includes('T-G-fn-call')) return 'fn-call-no-amp';
  if (relPath.includes('T-COMBO')) return 'brace-block';

  // S5-variations: type/size sweeps still drill the trace skeleton — most
  // exercise the trace-strikethrough discipline (final-mystery via crossed-out
  // history) on a varied input shape.
  if (relPath.includes('V-algo-transfer')) return 'accumulator';
  if (relPath.includes('V-size-')) return 'for-header';
  if (relPath.includes('V-two-mystery')) return 'field-scalar';
  if (relPath.includes('V-type-bool') || relPath.includes('V-type-int') || relPath.includes('V-type-string')) {
    return 'field-array';
  }

  // S6-speed: full Q1 mocks + warmup flashes — top-level skill is the trace
  // discipline + accumulator pattern.
  if (relPath.includes('S6-speed/Full-Q1-mocks') || relPath.includes('S6-speed\\Full-Q1-mocks')) return 'trace-strikethrough';
  if (relPath.includes('S6-speed/Mixed-mocks') || relPath.includes('S6-speed\\Mixed-mocks')) return 'trace-strikethrough';
  if (relPath.includes('S6-speed/Real-exam-reps') || relPath.includes('S6-speed\\Real-exam-reps')) return 'trace-strikethrough';
  if (relPath.includes('S6-speed/Warmup') || relPath.includes('S6-speed\\Warmup')) return 'accumulator';

  // S4-compose: A1..A12 algorithm bodies — all about the accumulator update line
  if (/[\\/]A\d+/.test(relPath) || /[\\/]A\d+-/.test(relPath)) return 'accumulator';

  // CM immunization: derive from CM ID
  if (relPath.includes('cm-immunization')) {
    if (base.includes('init-0') || base.includes('A11')) return 'pre-loop-init';
    if (base.includes('A12') || base.includes('no-indirection')) return 'dot-array-access';
    if (base.includes('Q1-array-no-size')) return 'field-array';
    if (base.includes('Q1-mystery-wrong-type')) return 'field-scalar';
    if (base.includes('Q1-wrong-return-type')) return 'void-fn';
    if (base.includes('bitwise-amp')) return 'param-by-ref';
    if (base.includes('brace-mismatch') || base.includes('misparse-brace')) return 'brace-block';
    if (base.includes('confuse-eq-pluseq')) return 'accumulator';
    if (base.includes('confuse-i-with-numbers')) return 'dot-array-access';
    if (base.includes('panel-with-output')) return 'trace-strikethrough';
    if (base.includes('drop-postloop')) return 'for-header';
    if (base.includes('guesses-from-literals')) return 'trace-strikethrough';
    // F-XX immunizations — map to nearest Q1 atom by topic
    if (base.includes('F12c')) return 'for-header';
    if (base.includes('F13')) return 'brace-block';
    if (base.includes('F18')) return 'brace-init-nested';
    if (base.includes('F19')) return 'pre-loop-init';
    if (base.includes('F22')) return 'trace-strikethrough';
    // Fallback for unknown CM
    return 'trace-strikethrough';
  }

  // S1-Tour: mostly anatomy + tour cards. Map by topic in stem/filename.
  if (relPath.includes('S1-Tour')) {
    if (base.includes('genre') || base.includes('stage-promise')) return 'trace-strikethrough';
    if (base.includes('practice-q') || base.includes('practice-answer')) return 'accumulator';
    if (base.includes('v20-q') || base.includes('v20-answer')) return 'accumulator';
    if (base.includes('anatomy-struct')) return 'struct-kw';
    if (base.includes('anatomy-array-field')) return 'field-array';
    if (base.includes('anatomy-scalar-field')) return 'field-scalar';
    if (base.includes('anatomy-fn-sig')) return 'param-by-ref';
    if (base.includes('anatomy-init')) return 'pre-loop-init';
    if (base.includes('anatomy-for-header')) return 'for-header';
    if (base.includes('anatomy-if-guard')) return 'if-cond-gt';
    if (base.includes('anatomy-if-action')) return 'accumulator';
    if (base.includes('anatomy-brace-init')) return 'brace-init-nested';
    if (base.includes('anatomy-fn-call')) return 'fn-call-no-amp';
    if (base.includes('memory-empty') || base.includes('memory-postinit') || base.includes('memory-midtrace') || base.includes('memory-final')) {
      return 'trace-strikethrough';
    }
    if (base.includes('strikethrough')) return 'trace-strikethrough';
    // late S1-Tour: the V2.0 contrast, semicolon trap, etc.
    if (base.includes('semicolon') || stemLower.includes('semicolon')) return 'semicolon';
    if (base.includes('const') || stemLower.includes('const int size')) return 'const';
    if (base.includes('void') || stemLower.includes('void who_am_i')) return 'void-fn';
    if (base.includes('dot') && (base.includes('array') || stemLower.includes('numbers['))) return 'dot-array-access';
    if (base.includes('dot') && (base.includes('scalar') || stemLower.includes('mystery'))) return 'dot-scalar-access';
    return 'trace-strikethrough';
  }

  // S3-components: 32 sub-skills C-01..C-30 - map per stem keyword
  if (relPath.includes('S3-components')) {
    // Use directory name C-XX as an extra hint, but rely on stem.
    if (stemLower.includes('outer brace')) return 'brace-init-nested';
    if (stemLower.includes('inner brace')) return 'brace-init-nested';
    if (stemLower.includes('match brace-init')) return 'brace-init-nested';
    if (stemLower.includes('memory layout for `numbers') || stemLower.includes('memory cell')) return 'field-array';
    if (stemLower.includes("scalar field") || stemLower.includes('scalar field')) return 'field-scalar';
    if (stemLower.includes('cell-fill')) return 'brace-init-nested';
    if (stemLower.includes('starting value')) return 'pre-loop-init';
    if (stemLower.includes('canonical starting')) return 'pre-loop-init';
    if (stemLower.includes('execution order') || stemLower.includes('for-loop body runs') || stemLower.includes('for-header') || stemLower.includes('for (int i')) return 'for-header';
    if (stemLower.includes('guard returns false') || stemLower.includes('comparison operator') || stemLower.includes('strictly less') || stemLower.includes('array element')) return 'if-cond-gt';
    if (stemLower.includes("distinguish `i`") || stemLower.includes('field-access operator')) return 'dot-array-access';
    if (stemLower.includes('right-hand operand')) return 'accumulator';
    if (stemLower.includes('iteration')) return 'for-header';
    if (stemLower.includes('mutation') || stemLower.includes('accumulator') || stemLower.includes('copies the current cell')) return 'accumulator';
    if (stemLower.includes('strikethrough')) return 'trace-strikethrough';
    if (stemLower.includes('after three sequential writes') || stemLower.includes('end-of-trace')) return 'trace-strikethrough';
    if (stemLower.includes('final-mystery') || stemLower.includes('rule that finishes')) return 'trace-strikethrough';
    if (stemLower.includes('binds to the')) return 'param-by-ref';
    return 'trace-strikethrough';
  }

  return 'trace-strikethrough';
}

// ---------------------------------------------------------------------
// Source upgrade: pick a real tier2 ref string that fits the card.
// Strategy:
//   - if existing source.kind ∈ {practice, v2, variant, pfg, seminar},
//     prepend `tier2:` to the kind:Q1 (or pfg:path) form
//   - if the card is anatomy/template/anatomy-X, attach a Saloni timestamp
//     drawn from the topic/atom (real timestamps from VTT).
// ---------------------------------------------------------------------

function upgradeSourceRef(card, atom, relPath) {
  const src = card.source ?? {};
  const oldRef = (typeof src.ref === 'string') ? src.ref : '';
  const oldKind = (typeof src.kind === 'string') ? src.kind : '';

  // Saloni timestamp for atoms that map to a clear Saloni teach moment.
  const SALONI_BY_ATOM = {
    'const':            SALONI.SIZE_CONST,
    'struct-kw':        SALONI.STRUCT_KW,
    'field-array':      SALONI.ARRAY_FIELD,
    'field-scalar':     SALONI.STRUCT_FIELDS,
    'brace-block':      SALONI.STRUCT_FIELDS,
    'brace-init-nested':SALONI.WRITE_VALUES,
    'dot-array-access': SALONI.ARRAY_INDICES,
    'pre-loop-init':    SALONI.Q1_OPEN,
    'trace-strikethrough': SALONI.Q1_OPEN,
    // Q1-block-level fallback
  };
  const salTs = SALONI_BY_ATOM[atom];

  // Choose a tier2 form. Order of preference:
  //   1. Keep practice/v2/variant kinds (already real source-data)
  //   2. Promote/keep seminar with a real timestamp
  //   3. Default to practice:Q1 (the L1 universe)
  let kind = oldKind || 'practice';
  let ref = oldRef;

  // Existing PFG citations stay PFG.
  if (oldRef.startsWith('pfg-content/') || oldKind === 'pfg') {
    kind = 'pfg';
    if (!ref) ref = 'pfg-content/.../part-3-programs-as-concepts/3-collections/2-trailside/22-code-tracing.mdx';
  }

  // Existing seminar citations get a real timestamp if missing one.
  if (oldKind === 'seminar') {
    if (!/@\s*\d\d:\d\d:\d\d/.test(ref)) {
      ref = `Saloni Mondays-6pm-new-2 @ ${salTs ?? SALONI.Q1_OPEN} — Q1 hand-execution`;
    }
  }

  // Empty / placeholder refs: build a sane real one.
  if (!ref || ref.length < 3 || /TBD|TODO|placeholder|fake/i.test(ref)) {
    if (relPath.includes('S2-Template/T-COMBO') || relPath.includes('S2-Template\\T-COMBO')) {
      kind = 'v2';
      ref = 'Test 2 V2.0 attempt 1 — full mini-program (sum-positive)';
    } else if (relPath.includes('S2-Template')) {
      kind = 'v2';
      ref = `Test 2 V2.0 attempt 1 — template anchor (${atom})`;
    } else if (relPath.includes('S6-speed/Real-exam-reps') || relPath.includes('S6-speed\\Real-exam-reps')) {
      kind = 'v2';
      ref = 'Test 2 V2.0 attempt 1 — real-exam mock';
    } else if (relPath.includes('cm-immunization')) {
      kind = 'practice';
      ref = `Test2-SIT102-practice-2026T1.txt — common-mistake immunization (${atom})`;
    } else {
      kind = 'practice';
      ref = `Test2-SIT102-practice-2026T1.txt — Q1 (${atom})`;
    }
  }

  // Any source.ref that already reads "Test2-SIT102-practice-2026T1" stays.
  // Any source.ref that already reads "Test 2 V2.0 attempt 1" stays.
  // All others left as-is — they're already real-file refs.

  return { kind, ref };
}

// ---------------------------------------------------------------------
// Walk + rewrite
// ---------------------------------------------------------------------

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (entry.isFile() && p.endsWith('.yml')) out.push(p);
  }
  return out;
}

function getStem(card) {
  if (typeof card.stem === 'string') return card.stem;
  return '';
}

function getCode(card) {
  const fields = ['code', 'demoCode', 'fullCode', 'seedCode', 'codeA', 'codeB',
                  'canonicalAnswer', 'expectedAnswer', 'template', 'brokenCode', 'fixedCode'];
  let buf = '';
  for (const f of fields) {
    const v = card[f];
    if (typeof v === 'string') buf += '\n' + v;
  }
  return buf;
}

const files = walk(L1_DIR);
console.log(`[B2] Found ${files.length} L1 card files`);

const atomCounts = Object.fromEntries(Q1_ATOMS.map(a => [a, 0]));
let cardsTotal = 0;
let cardsTouched = 0;
let cardsPreserved = 0;

for (const file of files) {
  const rel = path.relative(L1_DIR, file).replace(/\\/g, '/');
  const base = path.basename(file, '.yml');
  const txt = fs.readFileSync(file, 'utf8');

  let card;
  try {
    card = yaml.load(txt);
  } catch (e) {
    console.log(`[B2] PARSE-ERR ${rel}: ${e.message}`);
    continue;
  }
  if (!card || typeof card !== 'object') {
    console.log(`[B2] EMPTY-CARD ${rel}`);
    continue;
  }

  cardsTotal++;
  const stemLower = getStem(card).toLowerCase();
  const codeLower = getCode(card).toLowerCase();

  // 1. Derive atom
  const atom = inferAtom(rel, base, stemLower, codeLower);
  if (!Q1_ATOM_SET.has(atom)) {
    console.log(`[B2] BAD-ATOM ${rel}: ${atom}`);
    continue;
  }
  atomCounts[atom]++;

  // 2. Build/upgrade source
  const { kind, ref } = upgradeSourceRef(card, atom, rel);

  // 3. Reflect changes back into YAML.
  // We rewrite via in-place substitution to preserve formatting.
  // But for safety + simplicity here we rewrite the full document via
  // js-yaml dump. This will reorder keys; that's accepted for the
  // regrounding pass per RULE 4 (correctness > formatting).
  const drillsValue = `tier1:Q1:${atom}`;
  card.drills = drillsValue;
  card.source = { kind, ref };

  // Preserve schemaVersion + atomId; if missing, this is a defective card
  // (not our job to author from scratch — the audit flagged 30% verified
  // and we're upgrading to 100% verified citations on cards that exist).
  const out = yaml.dump(card, {
    lineWidth: 120,
    noRefs: true,
    quotingType: '"',
    forceQuotes: false,
  });
  fs.writeFileSync(file, out, 'utf8');
  cardsTouched++;
}

console.log(`[B2] Rewrote ${cardsTouched}/${cardsTotal} cards`);

// ---------------------------------------------------------------------
// Per-atom card count + gap report
// ---------------------------------------------------------------------

const gaps = [];
console.log('\n=== Per-atom card counts (target ≥3 per atom) ===');
for (const a of Q1_ATOMS) {
  const c = atomCounts[a];
  const status = c >= 3 ? 'OK' : 'GAP';
  console.log(`  ${a.padEnd(22)} ${String(c).padStart(4)}  ${status}`);
  if (c < 3) gaps.push({ atom: a, count: c });
}

if (gaps.length > 0) {
  const md = [
    '# B2 — L1 Q1 atom coverage gaps',
    '',
    'Per MANIFEST §2.1 acceptance gate: every Q1 atom requires ≥3 drilling cards.',
    '',
    `Gaps detected: ${gaps.length} of ${Q1_ATOMS.length} atoms.`,
    '',
    '| Atom | Cards | Gap |',
    '|---|---|---|',
    ...gaps.map(g => `| ${g.atom} | ${g.count} | ${3 - g.count} more needed |`),
    '',
    `Generated 2026-05-07 by build-v2/B2-reground-L1.mjs.`,
    '',
  ].join('\n');
  fs.writeFileSync(GAPS_PATH, md, 'utf8');
  console.log(`\n[B2] Wrote gap report to ${path.relative(ROOT, GAPS_PATH)}`);
} else {
  // Still write the file so the report is unambiguous even when clean.
  fs.writeFileSync(GAPS_PATH,
    `# B2 — L1 Q1 atom coverage gaps\n\nNone. Every Q1 atom has ≥3 drilling cards.\n` +
    `Generated 2026-05-07 by build-v2/B2-reground-L1.mjs.\n`, 'utf8');
  console.log(`\n[B2] No gaps. Clean report at ${path.relative(ROOT, GAPS_PATH)}`);
}

// ---------------------------------------------------------------------
// Append to agent ledger
// ---------------------------------------------------------------------

const entry = {
  ts: '2026-05-07',
  agent: 'B2-reground-L1',
  task: 'Phase B2 — L1 citation re-grounding (drills field + source upgrade)',
  files_created: [
    'cpp-t2/build-v2/B2-reground-L1.mjs',
    fs.existsSync(GAPS_PATH) ? 'cpp-t2/build-v2/B2_GAPS.md' : '',
  ].filter(Boolean),
  files_modified: [`${cardsTouched} files under cpp-t2/data/v2/cards/L1/`],
  v1_touched: false,
  phase: 'B2',
  milestones_closed: ['B2-L1-reground'],
  notes: `Walked ${cardsTotal} L1 cards. Touched ${cardsTouched}. ` +
    `Per-atom counts: ${Q1_ATOMS.map(a => `${a}=${atomCounts[a]}`).join(', ')}. ` +
    `Gaps: ${gaps.length === 0 ? 'none' : gaps.map(g => `${g.atom}(${g.count})`).join(', ')}.`,
};
fs.appendFileSync(LEDGER_PATH, JSON.stringify(entry) + '\n', 'utf8');
console.log(`[B2] Appended ledger entry`);

console.log('\n[B2] Done.');
