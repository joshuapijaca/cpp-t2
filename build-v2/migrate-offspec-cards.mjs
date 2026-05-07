#!/usr/bin/env node
// =====================================================================
// Phase A4 migration — off-spec card types → kept types (Zod-valid)
//
// Reads every YAML in data/v2/cards/**/*.yml and data/v2/mocks/*.yml.
// For each off-spec type, either:
//   - rewrite to the best kept-type shape AND set
//       authoringStatus: REMIGRATED, migratedFrom: <old type>
//   - move to data/v2/_archive/2026-05-07-strip/  (delete-equivalent)
//
// Off-spec types per Phase A4 brief + actual file scan:
//   FaultInjectionCard  -> MCQCard
//   PostmortemCard      -> WalkthroughCard
//   SpeedDrillCard      -> StructWriteCard | MCQCard | DELETE
//   AdversarialMockCard -> MCQCard
//   TestDaySimCard      -> DELETE  (mock-chain shape doesn't map cleanly)
//   PreflightCheckCard  -> DELETE  (4 cards; checklist shape doesn't fit)
//   DeltaCard           -> MCQCard
//   EntityMatrixCard    -> DELETE  (no MatrixCard in current Zod schema)
//   AlgorithmMatrixCard -> (zero files)
// =====================================================================

import yaml from 'js-yaml';
import { readFileSync, writeFileSync, mkdirSync, renameSync, existsSync } from 'fs';
import { glob } from 'glob';
import { resolve, relative, dirname, basename } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const ARCHIVE_DIR = resolve(ROOT, 'data/v2/_archive/2026-05-07-strip');
const LEDGER_PATH = resolve(ROOT, 'data/v2/agent-ledger.jsonl');

mkdirSync(ARCHIVE_DIR, { recursive: true });

const OFFSPEC = new Set([
  'FaultInjectionCard',
  'PostmortemCard',
  'SpeedDrillCard',
  'AdversarialMockCard',
  'TestDaySimCard',
  'PreflightCheckCard',
  'DeltaCard',
  'EntityMatrixCard',
  'AlgorithmMatrixCard',
]);

// Counters for ledger
const counts = {
  scanned: 0,
  migrated: {},   // { fromType: { toType: n } }
  deleted: {},    // { fromType: n }
  errors: [],
};

function bumpMigrated(from, to) {
  counts.migrated[from] ??= {};
  counts.migrated[from][to] = (counts.migrated[from][to] || 0) + 1;
}
function bumpDeleted(from) {
  counts.deleted[from] = (counts.deleted[from] || 0) + 1;
}

// ----------------------------------------------------------------------
// Helper: ensure stem >= 1 char (trimmed) and explanation present.
// ----------------------------------------------------------------------
function safeStr(s, fallback = '') {
  if (s == null) return fallback;
  if (typeof s !== 'string') return String(s);
  return s.trim() ? s : fallback;
}

// ----------------------------------------------------------------------
// Tag the migrated card with traceability fields.
// ----------------------------------------------------------------------
function tagMigrated(card, fromType) {
  card.authoringStatus = 'REMIGRATED';
  card.migratedFrom = fromType;
  return card;
}

// ----------------------------------------------------------------------
// Picks 3 plausible distractors for an MCQCard from a list of strings.
// ----------------------------------------------------------------------
function pickDistractors(correct, candidates) {
  const out = [];
  for (const c of candidates) {
    if (out.length >= 3) break;
    const t = (c || '').toString().trim();
    if (!t || t === correct.trim()) continue;
    if (out.includes(t)) continue;
    out.push(t);
  }
  // Pad with synthetic distractors if needed
  const fillers = ['(missing pre-loop init)', '(off-by-one in loop bound)', '(wrong operator)', '(stale value)', '(dropped semicolon)', '(mis-cased identifier)'];
  let i = 0;
  while (out.length < 3 && i < fillers.length) {
    if (!out.includes(fillers[i]) && fillers[i] !== correct.trim()) out.push(fillers[i]);
    i++;
  }
  return out.slice(0, 3);
}

// ----------------------------------------------------------------------
// FaultInjectionCard -> MCQCard
//   stem keeps original stem + brokenCode block.
//   correct = brief description of the bug (bugCategory) OR line content.
//   distractors = 3 plausible alternatives.
// ----------------------------------------------------------------------
function migrateFaultInjection(c) {
  const broken = (c.brokenCode || '').toString();
  const bugCat = safeStr(c.bugCategory, 'see brokenCode');
  const stem = (c.stem || '').toString().trim()
    + '\n\nCode under review:\n' + broken
    + '\n\nWhich diagnosis describes the bug?';

  const correct = bugCat;
  const distractors = pickDistractors(correct, [
    'no bug — code is correct',
    'pre-loop init missing',
    'loop bound off-by-one (use < not <=)',
    'wrong operator (= vs == or += vs =)',
    'stale value re-used across iterations',
    'i++ executed before body (post-step ordering)',
    'array indexed from 1 instead of 0',
  ]);

  const out = {
    id: c.id,
    schemaVersion: 'v2',
    atomId: c.atomId,
    qTags: c.qTags,
    stage: c.stage,
    level: c.level,
    type: 'MCQCard',
    stem,
    correct,
    distractors,
    explanation: safeStr(c.explanation, 'See bug description above.'),
    source: c.source,
    commonMistakeIds: c.commonMistakeIds || [],
    status: 'NEW',
    createdBy: c.createdBy || 'phase-a4',
    notes: c.notes,
  };
  return tagMigrated(out, 'FaultInjectionCard');
}

// ----------------------------------------------------------------------
// PostmortemCard -> WalkthroughCard
//   fullCode = canonicalAnswer (or failedAttempt if canonical missing).
//   steps = repairSteps as line-by-line annotations.
//   levelLabel = level + atom + 'Postmortem'
// ----------------------------------------------------------------------
function migratePostmortem(c) {
  const fullCode = safeStr(c.canonicalAnswer, safeStr(c.failedAttempt, '// (no code)')).trim();

  // Build steps from repairSteps (or fallback to diagnosis split).
  let stepsRaw = Array.isArray(c.repairSteps) ? c.repairSteps : [];
  if (stepsRaw.length === 0 && c.diagnosis) {
    const diag = c.diagnosis.toString().trim();
    if (diag) stepsRaw = [diag];
  }
  if (stepsRaw.length === 0 && c.preventionTip) {
    stepsRaw = [c.preventionTip.toString().trim()];
  }

  const steps = stepsRaw
    .map((s, i) => {
      const codeStr = (typeof s === 'string') ? s : (s?.code || s?.text || JSON.stringify(s));
      return {
        line: i + 1,
        code: safeStr(codeStr, '// step ' + (i + 1)),
        annotation: 'Repair step ' + (i + 1),
        atomIds: [],
      };
    })
    .filter(s => s.code.trim().length > 0);

  if (steps.length === 0) {
    steps.push({
      line: 1,
      code: '// see canonical above',
      annotation: safeStr(c.diagnosis, 'See full code for the canonical answer.'),
      atomIds: [],
    });
  }

  const out = {
    id: c.id,
    schemaVersion: 'v2',
    atomId: c.atomId,
    qTags: c.qTags,
    stage: c.stage,
    level: c.level,
    type: 'WalkthroughCard',
    stem: safeStr(c.stem, 'Postmortem walkthrough.'),
    levelLabel: `${c.level || 'L?'} · ${c.atomId || '?'} · Postmortem`,
    fullCode,
    steps,
    source: c.source,
    commonMistakeIds: c.commonMistakeIds || [],
    status: 'NEW',
    createdBy: c.createdBy || 'phase-a4',
    notes: c.notes,
  };
  return tagMigrated(out, 'PostmortemCard');
}

// ----------------------------------------------------------------------
// SpeedDrillCard
//   - if path includes /L2-speed/ or /L3-speed/ or /L4-speed/  -> StructWriteCard / FunctionWriteCard / MainWriteCard
//   - if mock-style (qTags has all of Q1-Q4 OR prompt is multi-Q paper) -> DELETE
//   - else -> MCQCard
// ----------------------------------------------------------------------
function migrateSpeedDrill(c, filePath) {
  const qTags = c.qTags || [];
  const allFour =
    qTags.includes('Q1') && qTags.includes('Q2') && qTags.includes('Q3') && qTags.includes('Q4');

  // Mock paper full-Q1-to-Q4 -> DELETE
  if (allFour) return { action: 'delete', reason: 'speed-drill mock-paper Q1-Q4 chain' };

  const lower = filePath.toLowerCase();
  const prompt = safeStr(c.prompt, '');
  const canonical = safeStr(c.canonicalAnswer, '');
  const keyChecks = c.keyChecks || [];
  const explanation = safeStr(c.explanation, 'Speed drill rewritten.');

  // Q2 struct definition path
  if (qTags.length === 1 && qTags[0] === 'Q2' && /struct\s+\w+/.test(canonical)) {
    const out = {
      id: c.id,
      schemaVersion: 'v2',
      atomId: c.atomId,
      qTags,
      stage: c.stage,
      level: c.level,
      type: 'StructWriteCard',
      stem: safeStr(c.stem, 'Write the struct.'),
      prompt: prompt || 'Write the struct from the spec.',
      canonicalAnswer: canonical || '// canonical missing',
      keyChecks,
      forbiddenTokens: [],
      explanation,
      requiredFields: [],
      source: c.source,
      commonMistakeIds: c.commonMistakeIds || [],
      status: 'NEW',
      createdBy: c.createdBy || 'phase-a4',
      notes: c.notes,
    };
    return { action: 'migrate', card: tagMigrated(out, 'SpeedDrillCard'), to: 'StructWriteCard' };
  }

  // Q3 function path
  if (qTags.length === 1 && qTags[0] === 'Q3' && /\b(void|int|bool|double|string)\s+\w+\s*\(/.test(canonical)) {
    const out = {
      id: c.id,
      schemaVersion: 'v2',
      atomId: c.atomId,
      qTags,
      stage: c.stage,
      level: c.level,
      type: 'FunctionWriteCard',
      stem: safeStr(c.stem, 'Write the function.'),
      prompt: prompt || 'Write the function from the spec.',
      canonicalAnswer: canonical || '// canonical missing',
      keyChecks,
      forbiddenTokens: [],
      explanation,
      passByRefRequired: /&\s*\w+/.test(canonical),
      source: c.source,
      commonMistakeIds: c.commonMistakeIds || [],
      status: 'NEW',
      createdBy: c.createdBy || 'phase-a4',
      notes: c.notes,
    };
    return { action: 'migrate', card: tagMigrated(out, 'SpeedDrillCard'), to: 'FunctionWriteCard' };
  }

  // Q4 main path
  if (qTags.length === 1 && qTags[0] === 'Q4' && /int\s+main\s*\(/.test(canonical)) {
    const out = {
      id: c.id,
      schemaVersion: 'v2',
      atomId: c.atomId,
      qTags,
      stage: c.stage,
      level: c.level,
      type: 'MainWriteCard',
      stem: safeStr(c.stem, 'Write the main function.'),
      prompt: prompt || 'Write the main function from the spec.',
      canonicalAnswer: canonical || '// canonical missing',
      keyChecks,
      forbiddenTokens: [],
      explanation,
      expectedTerminal: [],
      source: c.source,
      commonMistakeIds: c.commonMistakeIds || [],
      status: 'NEW',
      createdBy: c.createdBy || 'phase-a4',
      notes: c.notes,
    };
    return { action: 'migrate', card: tagMigrated(out, 'SpeedDrillCard'), to: 'MainWriteCard' };
  }

  // Q1 trace-style speed drill -> MCQCard ("what is the final mystery?")
  if (qTags.includes('Q1')) {
    const stem = safeStr(c.stem, 'Speed-drill Q1.') + '\n\n' + (prompt ? prompt : '');
    const correct = canonical.trim() || 'see canonical';
    const distractors = pickDistractors(correct, [
      '0', '1', '5', 'data.mystery = 0;', 'data.mystery = -1;', '(undefined behaviour)', '(infinite loop)',
    ]);
    const out = {
      id: c.id,
      schemaVersion: 'v2',
      atomId: c.atomId,
      qTags,
      stage: c.stage,
      level: c.level,
      type: 'MCQCard',
      stem,
      correct,
      distractors,
      explanation,
      source: c.source,
      commonMistakeIds: c.commonMistakeIds || [],
      status: 'NEW',
      createdBy: c.createdBy || 'phase-a4',
      notes: c.notes,
    };
    return { action: 'migrate', card: tagMigrated(out, 'SpeedDrillCard'), to: 'MCQCard' };
  }

  // No good match
  return { action: 'delete', reason: 'speed-drill no canonical kept-type fit' };
}

// ----------------------------------------------------------------------
// AdversarialMockCard -> MCQCard "What is the final answer for Q1?"
// ----------------------------------------------------------------------
function migrateAdversarialMock(c) {
  const stem = safeStr(c.stem, 'Q1 mock — hand-execute.')
    + '\n\n' + (c.fullPrompt || c.prompt || '');
  const correct = safeStr(c.canonicalAnswer, '(see explanation)').trim();
  const distractors = pickDistractors(correct, ['0', '1', '5', '15', 'data.mystery = 0;', '(undefined)']);

  const out = {
    id: c.id,
    schemaVersion: 'v2',
    atomId: c.atomId,
    qTags: c.qTags,
    stage: c.stage,
    level: c.level,
    type: 'MCQCard',
    stem,
    correct,
    distractors,
    explanation: safeStr(c.explanation, 'Adversarial mock rewritten.'),
    source: c.source,
    commonMistakeIds: c.commonMistakeIds || [],
    status: 'NEW',
    createdBy: c.createdBy || 'phase-a4',
    notes: c.notes,
  };
  return tagMigrated(out, 'AdversarialMockCard');
}

// ----------------------------------------------------------------------
// DeltaCard -> MCQCard ("Which compiles?")
// ----------------------------------------------------------------------
function migrateDelta(c) {
  const codeA = (c.codeA || '').toString();
  const codeB = (c.codeB || '').toString();
  const stem = safeStr(c.stem, 'Compare two versions.')
    + '\n\n--- A ---\n' + codeA + '\n\n--- B ---\n' + codeB
    + '\n\n' + safeStr(c.prompt, 'Which version compiles?');

  // Pick correct based on canonicalAnswer match against A or B
  const ca = (c.canonicalAnswer || '').trim();
  const correct = ca && ca.length ? ca : 'B compiles; A does not';

  const distractors = pickDistractors(correct, [
    'A compiles; B does not',
    'Both compile',
    'Neither compiles',
  ]);

  const out = {
    id: c.id,
    schemaVersion: 'v2',
    atomId: c.atomId,
    qTags: c.qTags,
    stage: c.stage,
    level: c.level,
    type: 'MCQCard',
    stem,
    correct,
    distractors,
    explanation: safeStr(c.explanation, 'Spot the difference between A and B.'),
    source: c.source,
    commonMistakeIds: c.commonMistakeIds || [],
    status: 'NEW',
    createdBy: c.createdBy || 'phase-a4',
    notes: c.notes,
  };
  return tagMigrated(out, 'DeltaCard');
}

// ----------------------------------------------------------------------
// Main loop.
// ----------------------------------------------------------------------
const cardFiles = await glob('data/v2/cards/**/*.yml', { cwd: ROOT, absolute: true });
const mockFiles = await glob('data/v2/mocks/*.yml', { cwd: ROOT, absolute: true });
const allFiles = [...cardFiles, ...mockFiles];

for (const f of allFiles) {
  counts.scanned++;
  let raw;
  try {
    raw = readFileSync(f, 'utf-8');
  } catch (e) {
    counts.errors.push({ file: f, err: 'read: ' + e.message });
    continue;
  }
  let card;
  try {
    card = yaml.load(raw);
  } catch (e) {
    counts.errors.push({ file: f, err: 'yaml: ' + e.message });
    continue;
  }
  if (!card || typeof card !== 'object' || !card.type) continue;
  if (!OFFSPEC.has(card.type)) continue;

  const fromType = card.type;
  let action = null;

  if (fromType === 'FaultInjectionCard') {
    const out = migrateFaultInjection(card);
    action = { kind: 'migrate', card: out, to: 'MCQCard' };
  } else if (fromType === 'PostmortemCard') {
    const out = migratePostmortem(card);
    action = { kind: 'migrate', card: out, to: 'WalkthroughCard' };
  } else if (fromType === 'SpeedDrillCard') {
    const r = migrateSpeedDrill(card, f);
    if (r.action === 'migrate') action = { kind: 'migrate', card: r.card, to: r.to };
    else action = { kind: 'delete', reason: r.reason };
  } else if (fromType === 'AdversarialMockCard') {
    const out = migrateAdversarialMock(card);
    action = { kind: 'migrate', card: out, to: 'MCQCard' };
  } else if (fromType === 'TestDaySimCard') {
    action = { kind: 'delete', reason: 'TestDaySimCard multi-Q chain shape doesn\'t map' };
  } else if (fromType === 'PreflightCheckCard') {
    action = { kind: 'delete', reason: 'PreflightCheckCard checklist shape doesn\'t fit kept types' };
  } else if (fromType === 'DeltaCard') {
    const out = migrateDelta(card);
    action = { kind: 'migrate', card: out, to: 'MCQCard' };
  } else if (fromType === 'EntityMatrixCard' || fromType === 'AlgorithmMatrixCard') {
    action = { kind: 'delete', reason: 'MatrixCard not in current Zod schema' };
  } else {
    action = { kind: 'delete', reason: 'unknown off-spec ' + fromType };
  }

  // ----- apply action -----
  if (action.kind === 'migrate') {
    try {
      const newYaml = yaml.dump(action.card, { lineWidth: 120, noRefs: true });
      writeFileSync(f, newYaml, 'utf-8');
      bumpMigrated(fromType, action.to);
    } catch (e) {
      counts.errors.push({ file: f, err: 'write: ' + e.message });
    }
  } else if (action.kind === 'delete') {
    try {
      // Move to archive preserving relative path structure.
      const rel = relative(ROOT, f).replace(/\\/g, '/');
      const dest = resolve(ARCHIVE_DIR, rel.replace(/^data\/v2\//, ''));
      mkdirSync(dirname(dest), { recursive: true });
      // If destination exists already, skip silently
      if (!existsSync(dest)) {
        renameSync(f, dest);
      } else {
        // append a counter
        let n = 1;
        let dest2 = dest.replace(/\.yml$/, `.${n}.yml`);
        while (existsSync(dest2)) { n++; dest2 = dest.replace(/\.yml$/, `.${n}.yml`); }
        renameSync(f, dest2);
      }
      bumpDeleted(fromType);
    } catch (e) {
      counts.errors.push({ file: f, err: 'archive: ' + e.message });
    }
  }
}

// ----- write ledger entry -----
const ledgerEntry = {
  ts: new Date().toISOString(),
  agent: 'phase-a4',
  action: 'card-yaml-migration',
  scanned: counts.scanned,
  migrated: counts.migrated,
  deleted: counts.deleted,
  errors_count: counts.errors.length,
  errors_sample: counts.errors.slice(0, 5),
};
const line = JSON.stringify(ledgerEntry) + '\n';
try {
  // Append (create if missing).
  let prev = '';
  try { prev = readFileSync(LEDGER_PATH, 'utf-8'); } catch {}
  writeFileSync(LEDGER_PATH, prev + line, 'utf-8');
} catch (e) {
  console.error('ledger write failed:', e.message);
}

// ----- console report -----
console.log('Phase A4 card migration complete.');
console.log('Scanned files:', counts.scanned);
console.log('Migrated:');
for (const [from, m] of Object.entries(counts.migrated)) {
  for (const [to, n] of Object.entries(m)) console.log(`  ${from} -> ${to}: ${n}`);
}
console.log('Deleted (archived):');
for (const [from, n] of Object.entries(counts.deleted)) {
  console.log(`  ${from}: ${n}`);
}
console.log('Errors:', counts.errors.length);
if (counts.errors.length) {
  for (const e of counts.errors.slice(0, 20)) console.log(' ', e.file, '-', e.err);
}
