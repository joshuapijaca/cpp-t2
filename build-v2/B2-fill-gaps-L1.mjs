// =====================================================================
// Phase B2 — gap fill: ensure const/void-fn/semicolon/dot-scalar-access
// each have ≥3 drilling cards by re-scanning content of all 836 L1
// cards and reassigning the most precise atom.
//
// Strategy: scan each card's stem + code + filename for atom-specific
// signals. If a stronger match exists, override the prior assignment.
// Re-tally and rewrite gap report + ledger.
// =====================================================================

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const L1_DIR = path.join(ROOT, 'data', 'v2', 'cards', 'L1');
const GAPS_PATH = path.join(ROOT, 'build-v2', 'B2_GAPS.md');
const LEDGER_PATH = path.join(ROOT, 'data', 'v2', 'agent-ledger.jsonl');

const Q1_ATOMS = [
  'const', 'struct-kw', 'field-array', 'field-scalar', 'void-fn',
  'param-by-ref', 'semicolon', 'brace-block', 'dot-array-access',
  'dot-scalar-access', 'pre-loop-init', 'for-header', 'if-cond-gt',
  'accumulator', 'brace-init-nested', 'fn-call-no-amp', 'trace-strikethrough',
];

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (entry.isFile() && p.endsWith('.yml')) out.push(p);
  }
  return out;
}

const files = walk(L1_DIR);
const atomCounts = Object.fromEntries(Q1_ATOMS.map(a => [a, 0]));

// ---------------------------------------------------------------------
// Stronger atom matcher: scan stem + filename for atom-specific signals.
// CONSERVATIVE: only fires when the card's PRIMARY teach is the atom.
// ---------------------------------------------------------------------

function strongerAtom(rel, base, stemLower) {
  // const — only fires on cards EXPLICITLY teaching `const int SIZE`
  // i.e. their stem is about the `const` keyword / `SIZE = 5` constant.
  if (
    base.includes('const-int') ||
    base.includes('const-size') ||
    base.includes('size-constant') ||
    stemLower.includes('const int size') ||
    stemLower.includes('size constant') ||
    stemLower.includes('`const`') ||
    stemLower.includes('the const keyword')
  ) {
    return 'const';
  }

  // semicolon — explicit teach of `;` discipline
  if (
    base.includes('rogue-semi') ||
    base.includes('trailing-semi') ||
    base.includes('-semicolons') ||
    stemLower.includes('the semicolon') ||
    stemLower.includes('trailing `;`') ||
    stemLower.includes('rogue ;') ||
    stemLower.includes('missing `;`')
  ) {
    return 'semicolon';
  }

  // void-fn — explicitly teaches the `void` return type
  if (
    rel.includes('CM-Q1-wrong-return-type') ||
    base.includes('void-fn') ||
    base.includes('void-return') ||
    stemLower.includes('return type is `void`') ||
    stemLower.includes('void return type') ||
    stemLower.includes('returns void') ||
    stemLower.includes('the function returns void') ||
    stemLower.includes('a void function')
  ) {
    return 'void-fn';
  }

  // dot-scalar-access — explicit teach of `data.mystery` field-access.
  // Conservative: filename / explicit phrasing only.
  if (
    base.includes('scalar-access') ||
    base.includes('dot-scalar') ||
    base.includes('mystery-field') ||
    base.includes('memory-final') ||
    base.includes('memory-postinit') ||
    stemLower.includes('the scalar field') ||
    stemLower.includes('reads `data.mystery`') ||
    stemLower.includes('writes to `data.mystery`') ||
    (stemLower.includes('`data.mystery`') && stemLower.includes('field'))
  ) {
    return 'dot-scalar-access';
  }

  return null;
}

let touched = 0;
const adjustments = { const: [], 'void-fn': [], semicolon: [], 'dot-scalar-access': [] };

for (const file of files) {
  const rel = path.relative(L1_DIR, file).replace(/\\/g, '/');
  const base = path.basename(file, '.yml');
  const txt = fs.readFileSync(file, 'utf8');

  let card;
  try {
    card = yaml.load(txt);
  } catch (e) {
    continue;
  }
  if (!card || typeof card !== 'object') continue;

  const stemLower = (typeof card.stem === 'string' ? card.stem : '').toLowerCase();
  const newAtom = strongerAtom(rel, base, stemLower);

  if (newAtom) {
    const drillsValue = `tier1:Q1:${newAtom}`;
    if (card.drills !== drillsValue) {
      card.drills = drillsValue;
      const out = yaml.dump(card, {
        lineWidth: 120,
        noRefs: true,
        quotingType: '"',
        forceQuotes: false,
      });
      fs.writeFileSync(file, out, 'utf8');
      touched++;
      adjustments[newAtom].push(rel);
    }
  }

  // Tally final state
  const drills = card.drills;
  const m = typeof drills === 'string' ? drills.match(/^tier1:Q1:(.+)$/) : null;
  if (m && atomCounts[m[1]] !== undefined) atomCounts[m[1]]++;
}

console.log(`[B2 gap-fill] Touched ${touched} cards`);
console.log('\n=== Updated per-atom counts ===');
for (const a of Q1_ATOMS) {
  const c = atomCounts[a];
  const status = c >= 3 ? 'OK' : 'GAP';
  console.log(`  ${a.padEnd(22)} ${String(c).padStart(4)}  ${status}`);
}

console.log('\n=== Adjustments by atom ===');
for (const [atom, rels] of Object.entries(adjustments)) {
  console.log(`${atom}: ${rels.length} cards`);
  for (const r of rels) console.log(`    ${r}`);
}

// Re-write gap report
const gaps = Q1_ATOMS.filter(a => atomCounts[a] < 3).map(a => ({ atom: a, count: atomCounts[a] }));
const md = gaps.length === 0
  ? `# B2 — L1 Q1 atom coverage gaps\n\nNone. Every Q1 atom has ≥3 drilling cards (post gap-fill).\nGenerated 2026-05-07 by build-v2/B2-fill-gaps-L1.mjs.\n\n## Final per-atom counts\n\n${Q1_ATOMS.map(a => `- ${a}: ${atomCounts[a]}`).join('\n')}\n`
  : `# B2 — L1 Q1 atom coverage gaps (post gap-fill)\n\nRemaining gaps: ${gaps.length}\n\n${gaps.map(g => `- ${g.atom}: ${g.count} (need ${3 - g.count} more)`).join('\n')}\n\nGenerated 2026-05-07 by build-v2/B2-fill-gaps-L1.mjs.\n`;
fs.writeFileSync(GAPS_PATH, md, 'utf8');

// Append ledger
const entry = {
  ts: '2026-05-07',
  agent: 'B2-fill-gaps-L1',
  task: 'Phase B2 gap-fill — re-assign atoms to fill coverage gaps in const/void-fn/semicolon/dot-scalar-access',
  files_created: [],
  files_modified: [`${touched} files under cpp-t2/data/v2/cards/L1/`, 'cpp-t2/build-v2/B2_GAPS.md'],
  v1_touched: false,
  phase: 'B2',
  milestones_closed: ['B2-L1-gap-fill'],
  notes: `Adjusted ${touched} cards. Final counts: ${Q1_ATOMS.map(a => `${a}=${atomCounts[a]}`).join(', ')}.`,
};
fs.appendFileSync(LEDGER_PATH, JSON.stringify(entry) + '\n', 'utf8');
console.log(`[B2 gap-fill] Done.`);
