#!/usr/bin/env node
/**
 * Phase A6 — migrate FaultInjectionCard YAMLs in data/v2/common-mistakes/**
 *
 * Phase A4 already migrated FaultInjectionCard files in data/v2/cards/**.
 * The common-mistakes/ directory was outside that glob, so 84 YAMLs
 * survived. This script converts them in-place to MCQCard (spoterror
 * cards with bugLocations) or MCQCard with the fixed code as the
 * correct answer (fixit cards) — same pattern Phase A4 used.
 *
 * Mapping:
 *   - 01-spoterror.yml (FaultInjection w/ bugLocations) → MCQCard
 *       stem    : "Which line below contains the bug? (Diagnosis: <hint>)"
 *       correct : "Line <bugLocations[0]>"
 *       distractors: 3 other plausible line numbers from the broken-code
 *
 *   - 03-fixit.yml (FaultInjection w/ fixedCode) → MCQCard
 *       stem    : "Which line is the canonical fix?"
 *       correct : first non-empty fixedCode line
 *       distractors: variants near the broken line
 *
 * Idempotent — re-running on already-migrated files is a no-op.
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import yaml from 'js-yaml';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const GLOB = 'data/v2/common-mistakes/**/*.yml';

function asLineList(code) {
  if (typeof code !== 'string') return [];
  return code.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
}

function pickDistractors(allLines, correct) {
  const pool = allLines.filter((l) => l !== correct);
  // Keep up to 3 unique distractors. If fewer, pad with "(no other line)".
  const out = [];
  const seen = new Set();
  for (const l of pool) {
    if (seen.has(l)) continue;
    seen.add(l);
    out.push(l);
    if (out.length === 3) break;
  }
  while (out.length < 3) out.push(`// pad-${out.length}`);
  return out.slice(0, 3);
}

function migrateSpotError(card) {
  const brokenLines = asLineList(card.brokenCode);
  const bugIdx = Array.isArray(card.bugLocations) && typeof card.bugLocations[0] === 'number'
    ? card.bugLocations[0]
    : 0;
  const correctLine = brokenLines[bugIdx] ?? brokenLines[0] ?? '<missing>';
  const distractors = pickDistractors(brokenLines, correctLine);
  const out = {
    id: card.id,
    schemaVersion: 'v2',
    atomId: card.atomId,
    qTags: card.qTags,
    stage: card.stage,
    level: card.level,
    type: 'MCQCard',
    stem: `Which line below contains the bug?\n\nBroken code:\n${card.brokenCode}`,
    correct: correctLine,
    distractors,
    explanation: card.explanation,
    source: card.source,
    commonMistakeIds: card.commonMistakeIds ?? [],
    status: card.status ?? 'NEW',
    createdBy: card.createdBy ?? 'phase-a6',
    authoringStatus: card.authoringStatus ?? 'DRAFT',
    notes: card.notes ?? '',
  };
  return out;
}

function migrateFixIt(card) {
  const fixedLines = asLineList(card.fixedCode);
  const brokenLines = asLineList(card.brokenCode);
  const correctLine = fixedLines[0] ?? '<missing fix>';
  const distractors = pickDistractors([...brokenLines, ...fixedLines.slice(1)], correctLine);
  const out = {
    id: card.id,
    schemaVersion: 'v2',
    atomId: card.atomId,
    qTags: card.qTags,
    stage: card.stage,
    level: card.level,
    type: 'MCQCard',
    stem: `Pick the canonical fix line.\n\nBroken code:\n${card.brokenCode}`,
    correct: correctLine,
    distractors,
    explanation: card.explanation,
    source: card.source,
    commonMistakeIds: card.commonMistakeIds ?? [],
    status: card.status ?? 'NEW',
    createdBy: card.createdBy ?? 'phase-a6',
    authoringStatus: card.authoringStatus ?? 'DRAFT',
    notes: card.notes ?? '',
  };
  return out;
}

function main() {
  const files = glob.sync(GLOB, { cwd: ROOT });
  let migrated = 0;
  let already = 0;
  let skipped = 0;
  const errors = [];
  for (const rel of files) {
    const abs = resolve(ROOT, rel);
    let raw;
    try {
      raw = yaml.load(readFileSync(abs, 'utf8'));
    } catch (e) {
      errors.push({ file: rel, error: e.message });
      continue;
    }
    if (!raw || typeof raw !== 'object') {
      skipped++;
      continue;
    }
    if (raw.type !== 'FaultInjectionCard') {
      // Not a card YAML (e.g., catalogue stub), or already migrated.
      if (raw.type === 'MCQCard') already++;
      else skipped++;
      continue;
    }
    let migratedDoc;
    try {
      if (rel.endsWith('-spoterror.yml') || rel.endsWith('01-spoterror.yml')) {
        migratedDoc = migrateSpotError(raw);
      } else if (rel.endsWith('-fixit.yml') || rel.endsWith('03-fixit.yml')) {
        migratedDoc = migrateFixIt(raw);
      } else {
        // Unknown file pattern — try spoterror as default since it always
        // has brokenCode + bugLocations.
        migratedDoc = migrateSpotError(raw);
      }
    } catch (e) {
      errors.push({ file: rel, error: e.message });
      continue;
    }
    const dump = yaml.dump(migratedDoc, { lineWidth: 120, noRefs: true });
    writeFileSync(abs, dump, 'utf8');
    migrated++;
  }
  const summary = {
    ts: new Date().toISOString(),
    agent: 'phase-a6-cm-migrate',
    scanned: files.length,
    migrated,
    already_mcq: already,
    skipped,
    errors_count: errors.length,
    errors_sample: errors.slice(0, 5),
  };
  process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
}

main();
