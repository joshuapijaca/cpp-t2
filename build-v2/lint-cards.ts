// =====================================================================
// cpp-t2 / build-v2 / lint-cards.ts
// QA — v2 card lint (per-card validation gate)
// =====================================================================
//
// Reads every YAML in cpp-t2/data/v2/cards/**/*.yml and validates each
// card against the locked Zod schema in src-v2/types/card-schema.ts.
//
// Per RULE 4 (max quality / min compromise): a buggy card means the
// student trains the wrong thing. Lint MUST be the gate that prevents
// any malformed, off-scope, or hallucinated card from reaching review.
//
// Checks (per card):
//   1.  Zod schema validation (required fields, schemaVersion === "v2",
//       discriminated-union type literal, etc.)
//   2.  atomId references a real atom (./data/v2/atoms/<atomId>.yml)
//   3.  qTags non-empty + valid Q1..Q4 enum
//   4.  source field present + well-formed (kind + ref)
//   5.  status ∈ {DRAFT, REVIEWED, APPROVED}  (legacy-mapped from
//       schema's NEW/IN-PROGRESS/FAMILIAR if encountered — see notes)
//   6.  Code-bearing fields: brace balance + semicolon presence
//   7.  Forbidden tokens scan: while | do | printf | scanf | getline
//       | recursion (off-scope per L-1..L11 redesign)
//   8.  Word-memorize guard: cards with no code AND stem.length < 80
//       are flagged for human review
//   9.  Write cards: every keyCheck token must appear in canonicalAnswer
//   10. canonical-answer mini-compile: brace balance + ends in valid
//       C++ terminating syntax (`}` or `;` or `}\n`)
//
// Exit codes:
//   0 — clean
//   1 — at least one ERROR (blocks merge / stage gate)
//   2 — internal lint failure (schema not found, etc.)
//
// Output: human-readable report grouped by file + machine-readable
// `--json` flag for CI consumption.
// =====================================================================

import yaml from 'js-yaml';
import { readFileSync, existsSync, statSync } from 'fs';
import { glob } from 'glob';
import { resolve, relative, basename } from 'path';
import { Card } from '../src-v2/types/card-schema.js';

// ---------------------------------------------------------------------
// Roots & globs
// ---------------------------------------------------------------------

const ROOT = resolve(import.meta.dirname, '..');
const CARDS_GLOB = 'data/v2/cards/**/*.yml';
const ATOMS_DIR = 'data/v2/atoms';

// ---------------------------------------------------------------------
// Authoring-status enum (separate from runtime CardStatus on schema)
//
// The schema's CardStatus is the *runtime* mastery state
// (NEW/IN-PROGRESS/FAMILIAR). The lint-side authoring status
// (DRAFT/REVIEWED/APPROVED) is a separate optional YAML key that
// gates per-stage merges (SA -> VE -> PR -> QA). It travels alongside
// the card object in YAML under `authoringStatus`. If absent, treat
// as DRAFT.
// ---------------------------------------------------------------------

const AUTHORING_STATUSES = new Set(['DRAFT', 'REVIEWED', 'APPROVED']);

// ---------------------------------------------------------------------
// Forbidden tokens — off-scope per L-1..L11 redesign.
// We match whole-word (\b) so identifiers like `whilelist` or
// `printf_lite` won't false-positive.
//
// Special-case: `do` is a English word AND a C++ keyword. The bare
// `\bdo\b` regex false-positives on English prose like "what does
// the compiler do?" or "single job to do". We therefore key `do`
// off a C++-context match only: it must be followed by `\s*\{` (the
// `do { ... } while (...);` form). All other tokens are unambiguous
// as identifiers and use the simple whole-word check.
// ---------------------------------------------------------------------

interface ForbiddenRule {
  token: string;
  pattern: RegExp;
}

const FORBIDDEN_RULES: ForbiddenRule[] = [
  { token: 'while', pattern: /\bwhile\b/ },
  // `do` only as the C++ do-while keyword: `do {` form.
  { token: 'do', pattern: /\bdo\s*\{/ },
  { token: 'printf', pattern: /\bprintf\b/ },
  { token: 'scanf', pattern: /\bscanf\b/ },
  { token: 'getline', pattern: /\bgetline\b/ },
  { token: 'recursion', pattern: /\brecursion\b/ },
  { token: 'recursive', pattern: /\brecursive\b/ },
];

// ---------------------------------------------------------------------
// Code-bearing field names per card type. We scan these for braces,
// semicolons, and forbidden tokens. Keep in sync with card-schema.ts.
// ---------------------------------------------------------------------

const CODE_FIELDS = [
  'code',
  'brokenCode',
  'fixedCode',
  'demoCode',
  'fullCode',
  'seedCode',
  'codeA',
  'codeB',
  'canonicalAnswer',
  'expectedAnswer',
  'template',
];

// ---------------------------------------------------------------------
// Error model
// ---------------------------------------------------------------------

export interface LintFinding {
  level: 'error' | 'warn';
  file: string;          // absolute path
  line?: number;         // best-effort YAML line
  cardId?: string;
  rule: string;          // short rule code (zod/atom-missing/etc.)
  detail: string;
}

// Mutable accumulator threaded into lintCard. Kept module-scoped for the
// CLI entrypoint; the in-process API (`runCardLint`) builds its own
// fresh accumulator each call so spec runs don't cross-contaminate.
let findings: LintFinding[] = [];

function err(f: Omit<LintFinding, 'level'>) {
  findings.push({ ...f, level: 'error' });
}
function warn(f: Omit<LintFinding, 'level'>) {
  findings.push({ ...f, level: 'warn' });
}

// ---------------------------------------------------------------------
// Atom registry — every card must reference an atom that exists.
// Atom files live at data/v2/atoms/<id>.yml (one file per atom).
// ---------------------------------------------------------------------

function loadAtomIds(): Set<string> {
  const dir = resolve(ROOT, ATOMS_DIR);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    return new Set();
  }
  // Atoms may be nested under a level directory (data/v2/atoms/L0/F-07.yml).
  const files = glob.sync('**/*.yml', { cwd: dir });
  return new Set(files.map((f) => basename(f, '.yml')));
}

// ---------------------------------------------------------------------
// YAML helpers
// ---------------------------------------------------------------------

interface RawCard {
  id?: string;
  type?: string;
  authoringStatus?: string;
  [k: string]: unknown;
}

function loadYamlCards(file: string): RawCard[] {
  const txt = readFileSync(file, 'utf8');
  const parsed = yaml.load(txt) as unknown;
  if (Array.isArray(parsed)) return parsed as RawCard[];
  if (parsed && typeof parsed === 'object') return [parsed as RawCard];
  return [];
}

// ---------------------------------------------------------------------
// Code-shape checks
// ---------------------------------------------------------------------

function balancedBraces(code: string): boolean {
  let depth = 0;
  let inStr: '"' | "'" | null = null;
  let i = 0;
  while (i < code.length) {
    const ch = code[i];
    const prev = i > 0 ? code[i - 1] : '';
    if (inStr) {
      if (ch === inStr && prev !== '\\') inStr = null;
    } else {
      if (ch === '"' || ch === "'") inStr = ch as '"' | "'";
      else if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth < 0) return false;
      }
    }
    i++;
  }
  return depth === 0;
}

function hasSemicolon(code: string): boolean {
  // ignore semicolons in string/char literals — quick approximation
  return /;[^"']*$/m.test(code) || /;/.test(code.replace(/"[^"]*"|'[^']*'/g, ''));
}

function endsLikeCpp(code: string): boolean {
  const trimmed = code.replace(/\s+$/g, '');
  if (trimmed.length === 0) return false;
  const last = trimmed[trimmed.length - 1];
  return last === '}' || last === ';';
}

function findForbidden(code: string): string[] {
  const hits: string[] = [];
  for (const rule of FORBIDDEN_RULES) {
    if (rule.pattern.test(code)) hits.push(rule.token);
  }
  return hits;
}

// ---------------------------------------------------------------------
// Per-card lint
// ---------------------------------------------------------------------

function lintCard(file: string, raw: RawCard, atomIds: Set<string>) {
  const cardId = raw.id ?? '<unknown-id>';

  // -- 1. Zod schema validation (the spine) -----------------------------
  const parsed = Card.safeParse(raw);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      err({
        file,
        cardId,
        rule: 'zod',
        detail: `${issue.path.join('.') || '<root>'}: ${issue.message}`,
      });
    }
    // Continue with the other checks where we can — we don't bail early
    // because authors often want to see all issues per card in one pass.
  }

  // -- 2. atomId references a real atom ---------------------------------
  const atomId = (raw as { atomId?: string }).atomId;
  if (atomId && atomIds.size > 0 && !atomIds.has(atomId)) {
    err({
      file,
      cardId,
      rule: 'atom-missing',
      detail: `atomId "${atomId}" has no matching file at data/v2/atoms/${atomId}.yml`,
    });
  }

  // -- 3. qTags non-empty (zod also enforces; second-belt) --------------
  const qTags = (raw as { qTags?: unknown }).qTags;
  if (!Array.isArray(qTags) || qTags.length === 0) {
    err({ file, cardId, rule: 'qtags-empty', detail: 'qTags must be a non-empty array of Q1..Q4' });
  }

  // -- 4. source field present + well-formed ----------------------------
  const source = (raw as { source?: { kind?: string; ref?: string } }).source;
  if (!source || typeof source !== 'object') {
    err({ file, cardId, rule: 'source-missing', detail: 'source field is required' });
  } else {
    if (!source.kind || !['practice', 'v2', 'pfg', 'seminar'].includes(source.kind)) {
      err({ file, cardId, rule: 'source-kind', detail: `source.kind must be one of practice|v2|pfg|seminar (got "${source.kind}")` });
    }
    if (!source.ref || typeof source.ref !== 'string' || source.ref.trim().length === 0) {
      err({ file, cardId, rule: 'source-ref', detail: 'source.ref must be a non-empty stable pointer (file path, page, seminar wk)' });
    }
  }

  // -- 5. authoringStatus ∈ {DRAFT, REVIEWED, APPROVED} -----------------
  const authStatus = raw.authoringStatus ?? 'DRAFT';
  if (!AUTHORING_STATUSES.has(authStatus)) {
    err({ file, cardId, rule: 'auth-status', detail: `authoringStatus "${authStatus}" must be one of DRAFT|REVIEWED|APPROVED` });
  }

  // -- 6/7. Code fields: braces, semicolons, forbidden tokens -----------
  let hasAnyCode = false;
  for (const field of CODE_FIELDS) {
    const v = (raw as Record<string, unknown>)[field];
    if (typeof v !== 'string' || v.length === 0) continue;
    hasAnyCode = true;
    if (!balancedBraces(v)) {
      err({ file, cardId, rule: 'brace-balance', detail: `${field}: braces are unbalanced` });
    }
    if (!hasSemicolon(v)) {
      // Some short code blocks (a single expression cloze) won't have one.
      // Warn rather than error.
      warn({ file, cardId, rule: 'no-semicolon', detail: `${field}: contains no \`;\` — verify intent` });
    }
    const banned = findForbidden(v);
    if (banned.length > 0) {
      err({ file, cardId, rule: 'forbidden-token', detail: `${field}: contains off-scope token(s): ${banned.join(', ')}` });
    }
  }

  // Forbidden-token scan also runs on stem + prompt (authors sometimes
  // describe forbidden constructs in the natural-language prompt by mistake).
  for (const field of ['stem', 'prompt', 'fullPrompt']) {
    const v = (raw as Record<string, unknown>)[field];
    if (typeof v !== 'string') continue;
    const banned = findForbidden(v);
    if (banned.length > 0) {
      err({ file, cardId, rule: 'forbidden-token', detail: `${field}: prompt mentions off-scope construct(s): ${banned.join(', ')}` });
    }
  }

  // -- 8. Word-memorize guard ------------------------------------------
  const stem = (raw as { stem?: unknown }).stem;
  if (typeof stem === 'string' && !hasAnyCode && stem.length < 80) {
    warn({
      file,
      cardId,
      rule: 'word-memorize-suspect',
      detail: `card has no code AND stem.length=${stem.length} (<80) — flag for human review (post-M22 redesign forbids word-memorize)`,
    });
  }

  // -- 9. keyChecks tokens must appear in canonicalAnswer ---------------
  const keyChecks = (raw as { keyChecks?: unknown }).keyChecks;
  const canon =
    (raw as { canonicalAnswer?: string }).canonicalAnswer ??
    (raw as { expectedAnswer?: string }).expectedAnswer ??
    '';
  if (Array.isArray(keyChecks) && typeof canon === 'string' && canon.length > 0) {
    // Normalize like the runtime grader does (lenient on operator spacing).
    const canonNorm = canon.replace(/\s+/g, ' ').replace(/\s*([<>=!+\-*/%&|^,;:(){}[\]])\s*/g, '$1');
    for (const k of keyChecks) {
      if (typeof k !== 'string') continue;
      const kNorm = k.replace(/\s+/g, ' ').replace(/\s*([<>=!+\-*/%&|^,;:(){}[\]])\s*/g, '$1');
      if (kNorm.length > 0 && !canonNorm.includes(kNorm)) {
        err({
          file,
          cardId,
          rule: 'keycheck-orphan',
          detail: `keyCheck "${k}" not present in canonicalAnswer/expectedAnswer (after operator-spacing normalize)`,
        });
      }
    }
  }

  // -- 10. canonical-answer mini-compile --------------------------------
  if (typeof canon === 'string' && canon.length > 0) {
    if (!balancedBraces(canon)) {
      err({ file, cardId, rule: 'canon-brace', detail: 'canonical answer has unbalanced braces' });
    }
    if (!endsLikeCpp(canon)) {
      err({
        file,
        cardId,
        rule: 'canon-end',
        detail: `canonical answer should end with \`}\` or \`;\` (got "${canon.slice(-3)}")`,
      });
    }
  }
}

// ---------------------------------------------------------------------
// Public API — callable from spec / CI without subprocess.
//
// runCardLint({ rootDir }) loads cards from `<rootDir>/data/v2/cards/`,
// validates against atoms in `<rootDir>/data/v2/atoms/`, and returns
// the full finding list plus an exit code. Resets the module's
// accumulator on every call so it is safe to invoke repeatedly.
// ---------------------------------------------------------------------

export interface CardLintResult {
  totalFiles: number;
  totalCards: number;
  errors: LintFinding[];
  warnings: LintFinding[];
  exitCode: number; // 0 clean, 1 errors, 2 internal failure
}

export function runCardLint(opts: { rootDir?: string } = {}): CardLintResult {
  // Reset the module-scoped accumulator (CLI calls this exactly once
  // per process; spec calls may run back-to-back).
  findings = [];

  const rootDir = opts.rootDir ?? ROOT;
  const cardFiles = glob.sync(CARDS_GLOB, { cwd: rootDir });
  const atomIds = (() => {
    const dir = resolve(rootDir, ATOMS_DIR);
    if (!existsSync(dir) || !statSync(dir).isDirectory()) return new Set<string>();
    // Recurse — atoms may live under data/v2/atoms/L0/ etc.
    const files = glob.sync('**/*.yml', { cwd: dir });
    return new Set(files.map((f) => basename(f, '.yml')));
  })();

  if (atomIds.size === 0) {
    warn({
      file: resolve(rootDir, ATOMS_DIR),
      rule: 'atoms-empty',
      detail: 'no atom files found — atomId cross-check disabled (expected during pre-M12 phase)',
    });
  }

  let totalCards = 0;
  for (const rel of cardFiles) {
    const abs = resolve(rootDir, rel);
    let cards: RawCard[];
    try {
      cards = loadYamlCards(abs);
    } catch (e) {
      err({ file: abs, rule: 'yaml-parse', detail: (e as Error).message });
      continue;
    }
    for (const card of cards) {
      totalCards++;
      lintCard(abs, card, atomIds);
    }
  }

  const errors = findings.filter((f) => f.level === 'error');
  const warnings = findings.filter((f) => f.level === 'warn');
  return {
    totalFiles: cardFiles.length,
    totalCards,
    errors,
    warnings,
    exitCode: errors.length > 0 ? 1 : 0,
  };
}

// ---------------------------------------------------------------------
// CLI entrypoint
// ---------------------------------------------------------------------

function main(): number {
  const jsonOut = process.argv.includes('--json');
  const result = runCardLint();

  // Re-derive bucket-by-file view from result.errors + result.warnings.
  const all: LintFinding[] = [...result.errors, ...result.warnings];

  if (jsonOut) {
    process.stdout.write(JSON.stringify({
      totalCards: result.totalCards,
      totalFiles: result.totalFiles,
      errors: result.errors,
      warnings: result.warnings,
    }, null, 2) + '\n');
    return result.exitCode;
  }

  process.stdout.write(`\n[lint:v2-cards] ${result.totalFiles} files, ${result.totalCards} cards scanned\n`);
  if (all.length === 0) {
    process.stdout.write(`[lint:v2-cards] OK — 0 errors, 0 warnings\n`);
  } else {
    const byFile = new Map<string, LintFinding[]>();
    for (const f of all) {
      if (!byFile.has(f.file)) byFile.set(f.file, []);
      byFile.get(f.file)!.push(f);
    }
    for (const [file, fs] of byFile) {
      process.stdout.write(`\n  ${relative(ROOT, file)}\n`);
      for (const f of fs) {
        const sigil = f.level === 'error' ? 'ERR' : 'WRN';
        const idPart = f.cardId ? ` [${f.cardId}]` : '';
        process.stdout.write(`    ${sigil} ${f.rule}${idPart}: ${f.detail}\n`);
      }
    }
    process.stdout.write(`\n[lint:v2-cards] ${result.errors.length} error(s), ${result.warnings.length} warning(s)\n`);
  }
  return result.exitCode;
}

// ---------------------------------------------------------------------
// CLI launch — only when invoked as a script, not when imported.
// `loadAtomIds` is intentionally retained as a no-arg helper for any
// future callers that want the on-disk atom set without running lint.
// ---------------------------------------------------------------------

const isCliEntrypoint = (() => {
  // tsx sets process.argv[1] to the script path; compare against this file.
  if (!process.argv[1]) return false;
  const argv1 = resolve(process.argv[1]);
  // import.meta.url isn't trivially available cross-Windows-path. Use the
  // fact that the imported caller (vitest spec) sets argv[1] to vitest.
  return argv1.toLowerCase().includes('lint-cards');
})();

if (isCliEntrypoint) {
  try {
    const code = main();
    process.exit(code);
  } catch (e) {
    process.stderr.write(`[lint:v2-cards] internal failure: ${(e as Error).stack || (e as Error).message}\n`);
    process.exit(2);
  }
}

// Touch loadAtomIds so unused-export elision doesn't drop it for future callers.
export { loadAtomIds };
