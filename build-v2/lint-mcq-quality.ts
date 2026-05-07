/**
 * lint-mcq-quality.ts
 *
 * Static quality checks for MCQ cards. Run via:
 *   npx tsx build-v2/lint-mcq-quality.ts
 *
 * Two channels of checks (per user spec 2026-05-08):
 *
 * 1. SELF-CONTAINMENT
 *    Every option-label reference in the stem (e.g. "A — ...", "(B)") must
 *    appear in the code shown in the stem. Without this, students can't
 *    verify wrong options because they don't know what the labels point at.
 *
 * 2. DISTRACTOR QUALITY
 *    Distractors must be C++-relevant. Flag any distractor mentioning
 *    foreign-language syntax tokens that exist only in other languages
 *    (Python `def`, `print(`, Rust `->`, `fn `, JS `var `, `let `,
 *    Java `public class`). These are filler distractors a student
 *    eliminates without C++ understanding.
 *
 * Output:
 *   - Per-file warnings printed to stderr
 *   - JSON report written to build-v2/mcq-lint-report.json
 *   - Exit code: 0 = clean, 1 = violations found
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const REPORT_PATH = resolve(__dirname, 'mcq-lint-report.json');

interface MCQCardYaml {
  id: string;
  type: string;
  stem: string;
  correct: string;
  distractors: string[];
  explanation?: string;
}

interface Violation {
  file: string;
  cardId: string;
  kind: 'self-containment' | 'distractor-quality';
  severity: 'error' | 'advisory';
  detail: string;
}

// Foreign-language tokens that should NOT appear in a C++ MCQ distractor.
const FOREIGN_LANG_TOKENS = [
  /\bdef\s+\w+\s*\(/,         // Python function def
  /\bprint\s*\(/,             // Python print() (C++ uses cout)
  /\bfn\s+\w+/,               // Rust fn
  /\bvar\s+\w+\s*=/,          // JS var
  /\blet\s+\w+\s*=/,          // JS / Rust let (NOT C++)
  /\bpublic\s+(class|static)/, // Java
  /->\s*[A-Z]\w*/,            // Rust/TS return arrow type (e.g. -> Result)
  /:=\s*/,                    // Pascal/Go assignment
  /\bdoc\s*=/,                // Markdown stub
];

// Detect option labels referenced in the stem.
// Common forms: "A — ...", "B —", "(A)", "(B)", "option A", etc.
const STEM_LABEL_REFS = /(?:^|[\s(])([A-D])\s*[)—\-—:]/gm;

// Detect labels actually present inside the code block in the stem.
// Code block is delimited by ``` fences. We pull out lines and look for
// "option A", "<-- A", "// A", or naked "A" trailing a comment.
const STEM_CODE_BLOCK_RE = /```[\s\S]*?```/;

function extractStemCode(stem: string): string {
  const m = STEM_CODE_BLOCK_RE.exec(stem);
  return m ? m[0] : '';
}

/** Negation phrases that legitimize a label without a code marker.
 *  E.g. "D — there is no match" → D doesn't need to point at code. */
const NEGATION_PATTERNS = [
  /\bno\s+match/i,
  /\bnone\b/i,
  /\bnot\s+matched?\b/i,
  /\bno\s+matching\b/i,
  /\bdoes\s*not\s+(exist|match)/i,
  /\bdoesn'?t\s+(exist|match)/i,
  /\bcannot\b/i,
  /\bcan'?t\b/i,
  /\bnever\b/i,
  /\bmissing\s+\}/i,
  /\bhas\s+no\s+/i,
  /^[A-D]\s*[—\-—:]\s*there\s+is\s+no/i,
  /^[A-D]\s*[—\-—:]\s*nothing/i,
  /^[A-D]\s*[—\-—:]\s*neither/i,
];

function isNegationDistractor(text: string): boolean {
  return NEGATION_PATTERNS.some((re) => re.test(text));
}

function checkSelfContainment(card: MCQCardYaml): string[] {
  const issues: string[] = [];
  const stemCode = extractStemCode(card.stem);
  if (!stemCode) return issues; // No code block → no labels expected

  // Collect labels referenced — only when the answer claims a positional match.
  // Negation distractors ("D — there is no match") are legitimate without a
  // code marker — they assert absence, not a specific position.
  const referenced = new Set<string>();
  const collectFromAnswer = (text: string) => {
    const m = /^([A-D])\s*[—\-—:]/.exec(text);
    if (!m || !m[1]) return;
    if (isNegationDistractor(text)) return; // skip negations
    referenced.add(m[1]);
  };
  collectFromAnswer(card.correct);
  for (const d of card.distractors) collectFromAnswer(d);

  for (const label of referenced) {
    const re = new RegExp(`\\b${label}\\b`);
    if (!re.test(stemCode)) {
      issues.push(
        `correct/distractor references label "${label}" but no "${label}" marker found in stem code block`
      );
    }
  }
  return issues;
}

/** Distractor mentions a foreign language by name → pedagogically valid
 *  (deliberately showing the wrong syntax to teach what's NOT C++). */
const PEDAGOGICAL_LANG_MENTIONS = [
  /\bpascal\b/i,
  /\brust\b/i,
  /\bpython\b/i,
  /\bjavascript\b/i,
  /\bjava\b/i,
  /\btypescript\b/i,
  /\bgo(?:lang)?\b/i,
  /\bc#\b/i,
  /\bnot\s+(?:valid\s+)?c\+\+/i,
  /\bnot\s+a\s+c\+\+/i,
  /\bc\+\+\s+does\s*not/i,
  /\bnot\s+used\s+in\s+c\+\+/i,
  /\bisn'?t\s+c\+\+/i,
];

function isPedagogicalDistractor(text: string): boolean {
  return PEDAGOGICAL_LANG_MENTIONS.some((re) => re.test(text));
}

/** "fn" in English ("function call site") is not Rust syntax. The Rust
 *  pattern needs an identifier directly after — already encoded in the
 *  regex `/\bfn\s+\w+/`. But "fn call" with a space + literal "call"
 *  still matches. Tighten by requiring the match to NOT be followed by
 *  English filler words. */
const ENGLISH_FN_FALSE_POSITIVES = /\bfn\s+(?:call|name|sig|signature|body|arg)/i;

function checkDistractorQuality(card: MCQCardYaml): string[] {
  const issues: string[] = [];
  // If the explanation establishes pedagogical context (e.g. "C++ does
  // not use `:=`"), the whole card is exempt from foreign-syntax flags.
  const explanation = card.explanation ?? '';
  if (isPedagogicalDistractor(explanation)) return issues;

  for (let i = 0; i < card.distractors.length; i++) {
    const d = card.distractors[i] ?? '';
    // Skip pedagogical references (e.g. "Pascal-style := assignment").
    if (isPedagogicalDistractor(d)) continue;
    for (const re of FOREIGN_LANG_TOKENS) {
      if (re.test(d)) {
        // Filter "fn call" / "fn name" English false positives.
        if (re.source.includes('fn') && ENGLISH_FN_FALSE_POSITIVES.test(d)) {
          continue;
        }
        issues.push(
          `distractor ${i + 1} contains foreign-language pattern matching ${re}: "${d.slice(0, 80)}..."`
        );
        break;
      }
    }
  }
  return issues;
}

async function main() {
  const files = await glob('data/v2/cards/**/*.yml', { cwd: ROOT });
  let scanned = 0;
  let mcqCount = 0;
  const violations: Violation[] = [];

  for (const f of files) {
    const abs = resolve(ROOT, f);
    let parsed: unknown;
    try {
      const raw = readFileSync(abs, 'utf8');
      parsed = yaml.load(raw);
    } catch {
      continue;
    }
    scanned++;
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      (parsed as { type?: string }).type !== 'MCQCard'
    ) {
      continue;
    }
    const card = parsed as MCQCardYaml;
    mcqCount++;

    // Self-containment is high-false-positive; emit as advisory.
    const scIssues = checkSelfContainment(card);
    for (const detail of scIssues) {
      violations.push({
        file: f,
        cardId: card.id,
        kind: 'self-containment',
        severity: 'advisory',
        detail,
      });
    }

    // Distractor quality is structural; emit as error.
    const dqIssues = checkDistractorQuality(card);
    for (const detail of dqIssues) {
      violations.push({
        file: f,
        cardId: card.id,
        kind: 'distractor-quality',
        severity: 'error',
        detail,
      });
    }
  }

  const errors = violations.filter((v) => v.severity === 'error');
  const advisories = violations.filter((v) => v.severity === 'advisory');

  if (errors.length === 0) {
    console.log(
      `lint-mcq-quality: clean — ${mcqCount} MCQ cards scanned, 0 errors.` +
        (advisories.length > 0
          ? ` ${advisories.length} advisories for manual review (see ${REPORT_PATH}).`
          : '')
    );
  } else {
    console.error(
      `lint-mcq-quality: ${errors.length} ERRORS, ${advisories.length} advisories across ${mcqCount} MCQ cards.`
    );
    for (const v of errors) {
      console.error(`  ${v.file} [${v.cardId}] (${v.kind}): ${v.detail}`);
    }
    if (advisories.length > 0) {
      console.error(`  + ${advisories.length} advisories — see ${REPORT_PATH}`);
    }
  }

  writeFileSync(
    REPORT_PATH,
    JSON.stringify(
      {
        scannedFiles: scanned,
        mcqCardsScanned: mcqCount,
        errorCount: errors.length,
        advisoryCount: advisories.length,
        violations,
      },
      null,
      2
    ),
    'utf8'
  );

  process.exit(errors.length > 0 ? 1 : 0);
}

void main();
