/**
 * grading-write.ts
 *
 * Pure offline grading for write-style cards (StructWriteCard,
 * FunctionWriteCard, MainWriteCard). Zero AI calls, zero network,
 * runs on every keystroke if the caller wants live feedback.
 *
 * Pipeline (each step contributes to score + may emit errors):
 *   1. brace-balance       — `{`, `(`, `[` counts must match closers
 *   2. semicolon-presence  — at least one `;` (struct/func bodies need it)
 *   3. forbidden-tokens    — student MUST NOT contain any of card.forbidden
 *   4. key-checks          — student MUST contain every literal key check
 *   5. char-match          — normalized canonical vs normalized student
 *
 * The score is informational; pass/fail is driven by:
 *   - zero forbiddenTokens hits AND
 *   - all keyChecks present AND
 *   - balanced braces AND
 *   - char-match >= 0.85 (lenient threshold, normalizes whitespace + tabs)
 *
 * normalizeLenient() collapses runs of whitespace, strips spaces around
 * common C++ operators (=, ==, <<, >>, +, -, *, /, ;, ,, (, ), {, }) so
 * that `int x=0;` and `int x = 0 ;` both pass.
 */

// ─────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────

export type WriteErrorKind =
  | 'brace-imbalance'
  | 'paren-imbalance'
  | 'bracket-imbalance'
  | 'missing-semicolon'
  | 'forbidden-token'
  | 'missing-keycheck'
  | 'char-mismatch'
  | 'empty';

export interface WriteError {
  kind: WriteErrorKind;
  /** 1-indexed line in the student's submission, when localizable. */
  line?: number;
  expected?: string;
  actual?: string;
  /** Human-readable explanation aimed at the student. */
  message: string;
}

export interface WriteCardData {
  canonicalAnswer: string;
  keyChecks?: string[];
  forbiddenTokens?: string[];
  /**
   * If true, require at least one `;` somewhere. Defaults to true since
   * struct + function definitions both need it.
   */
  requireSemicolon?: boolean;
}

export interface WriteGradeResult {
  pass: boolean;
  /** 0-100 informational score. */
  score: number;
  errors: WriteError[];
  /** Per-line diff: same length as max(student, canonical) line counts. */
  diff: WriteDiffLine[];
}

export interface WriteDiffLine {
  /** 1-indexed line number. */
  line: number;
  studentLine: string;
  canonicalLine: string;
  match: boolean;
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

/** Operator-spacing-tolerant normalizer. Used for char-match only. */
export function normalizeLenient(s: string): string {
  // 1. Tabs -> spaces (4)
  let n = s.replace(/\t/g, '    ');
  // 2. Collapse runs of internal whitespace (but keep newlines)
  n = n.replace(/[ \t]+/g, ' ');
  // 3. Strip leading/trailing whitespace per line
  n = n
    .split('\n')
    .map((ln) => ln.trim())
    .filter((ln) => ln.length > 0)
    .join('\n');
  // 4. Strip spaces around punctuation/operators
  //    (keeps things like `int x=0;` == `int x = 0 ;`)
  n = n.replace(/\s*([{};,()<>=+\-*/\[\]])\s*/g, '$1');
  // 5. Final trim
  return n.trim();
}

/** Cheap char-match score: 1 - levenshtein(a,b) / max(len). */
export function charMatchScore(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;
  // Bounded Levenshtein. For our use (≤ ~400 chars) this is fine.
  const m = a.length;
  const n = b.length;
  // Use two rolling rows.
  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        (prev[j] ?? 0) + 1, // deletion
        (curr[j - 1] ?? 0) + 1, // insertion
        (prev[j - 1] ?? 0) + cost, // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }
  const dist = prev[n] ?? 0;
  return Math.max(0, 1 - dist / Math.max(m, n));
}

/** Return [opens, closes] for a given pair of chars, ignoring strings/comments. */
function countBalanced(
  source: string,
  open: string,
  close: string,
): [number, number] {
  let opens = 0;
  let closes = 0;
  let inString = false;
  let inChar = false;
  let inLineComment = false;
  let inBlockComment = false;
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    const next = source[i + 1];
    if (inLineComment) {
      if (c === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (c === '*' && next === '/') {
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (inString) {
      if (c === '\\' && next !== undefined) {
        i++;
        continue;
      }
      if (c === '"') inString = false;
      continue;
    }
    if (inChar) {
      if (c === '\\' && next !== undefined) {
        i++;
        continue;
      }
      if (c === "'") inChar = false;
      continue;
    }
    if (c === '/' && next === '/') {
      inLineComment = true;
      i++;
      continue;
    }
    if (c === '/' && next === '*') {
      inBlockComment = true;
      i++;
      continue;
    }
    if (c === '"') {
      inString = true;
      continue;
    }
    if (c === "'") {
      inChar = true;
      continue;
    }
    if (c === open) opens++;
    else if (c === close) closes++;
  }
  return [opens, closes];
}

/** Find the 1-indexed line number where `needle` first appears in `source`. */
function lineOf(source: string, needle: string): number | undefined {
  const idx = source.indexOf(needle);
  if (idx === -1) return undefined;
  let line = 1;
  for (let i = 0; i < idx; i++) if (source[i] === '\n') line++;
  return line;
}

/** Build a per-line diff between student and canonical, post-normalize. */
function buildDiff(student: string, canonical: string): WriteDiffLine[] {
  const sLines = student.split('\n');
  const cLines = canonical.split('\n');
  const max = Math.max(sLines.length, cLines.length);
  const out: WriteDiffLine[] = [];
  for (let i = 0; i < max; i++) {
    const sl = sLines[i] ?? '';
    const cl = cLines[i] ?? '';
    out.push({
      line: i + 1,
      studentLine: sl,
      canonicalLine: cl,
      match: normalizeLenient(sl) === normalizeLenient(cl),
    });
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────
// Public entry point
// ─────────────────────────────────────────────────────────────────────

export function gradeWrite(
  student: string,
  card: WriteCardData,
): WriteGradeResult {
  const errors: WriteError[] = [];

  // ── Empty check ────────────────────────────────────────────────
  if (student.trim().length === 0) {
    return {
      pass: false,
      score: 0,
      errors: [
        {
          kind: 'empty',
          message: 'You haven’t written anything yet — start with `struct`.',
        },
      ],
      diff: buildDiff('', card.canonicalAnswer),
    };
  }

  // ── 1. Brace / paren / bracket balance ─────────────────────────
  const [bo, bc] = countBalanced(student, '{', '}');
  if (bo !== bc) {
    errors.push({
      kind: 'brace-imbalance',
      expected: String(bo),
      actual: String(bc),
      message:
        bo > bc
          ? `Missing ${bo - bc} closing brace${bo - bc > 1 ? 's' : ''} \`}\`.`
          : `Extra ${bc - bo} closing brace${bc - bo > 1 ? 's' : ''} \`}\`.`,
    });
  }
  const [po, pc] = countBalanced(student, '(', ')');
  if (po !== pc) {
    errors.push({
      kind: 'paren-imbalance',
      expected: String(po),
      actual: String(pc),
      message: `Unbalanced parentheses (${po} \`(\` vs ${pc} \`)\`).`,
    });
  }
  const [sqo, sqc] = countBalanced(student, '[', ']');
  if (sqo !== sqc) {
    errors.push({
      kind: 'bracket-imbalance',
      expected: String(sqo),
      actual: String(sqc),
      message: `Unbalanced square brackets (${sqo} \`[\` vs ${sqc} \`]\`).`,
    });
  }

  // ── 2. Semicolon presence ──────────────────────────────────────
  const requireSemi = card.requireSemicolon ?? true;
  if (requireSemi && !student.includes(';')) {
    errors.push({
      kind: 'missing-semicolon',
      message: 'No `;` found. Struct/function bodies need at least one.',
    });
  }
  // Specifically: struct definitions must end with `};` not just `}`.
  if (requireSemi && /struct\s+\w+/.test(student)) {
    // Check the LAST `}` is followed (after optional whitespace) by `;`.
    const lastBrace = student.lastIndexOf('}');
    if (lastBrace !== -1) {
      const tail = student.slice(lastBrace + 1).trim();
      if (!tail.startsWith(';')) {
        const lineNum = lineOf(student, '}');
        const err: WriteError = {
          kind: 'missing-semicolon',
          expected: '};',
          actual: '}',
          message: 'Missing `;` after the closing `}` — struct definitions need `};`.',
        };
        if (lineNum !== undefined) err.line = lineNum;
        errors.push(err);
      }
    }
  }

  // ── 3. Forbidden tokens ────────────────────────────────────────
  for (const tok of card.forbiddenTokens ?? []) {
    if (student.includes(tok)) {
      const lineNum = lineOf(student, tok);
      const err: WriteError = {
        kind: 'forbidden-token',
        actual: tok,
        message: `Don’t use \`${tok}\` here.`,
      };
      if (lineNum !== undefined) err.line = lineNum;
      errors.push(err);
    }
  }

  // ── 4. Key checks (must-contain) ───────────────────────────────
  const normStudent = normalizeLenient(student);
  for (const k of card.keyChecks ?? []) {
    const normK = normalizeLenient(k);
    if (!normStudent.includes(normK)) {
      errors.push({
        kind: 'missing-keycheck',
        expected: k,
        message: `Missing required token: \`${k}\`.`,
      });
    }
  }

  // ── 5. Char-match (informational + part of pass/fail) ──────────
  const normCanonical = normalizeLenient(card.canonicalAnswer);
  const charScore = charMatchScore(normStudent, normCanonical);
  if (charScore < 0.85) {
    errors.push({
      kind: 'char-mismatch',
      expected: card.canonicalAnswer,
      actual: student,
      message: `Code shape doesn’t match the canonical solution (${Math.round(charScore * 100)}% similar).`,
    });
  }

  // ── Final score + pass/fail ────────────────────────────────────
  // Score weighting: char-match * 60 + keyChecks * 25 + structural * 15
  const keyTotal = card.keyChecks?.length ?? 0;
  const keyHits =
    keyTotal -
    errors.filter((e) => e.kind === 'missing-keycheck').length;
  const keyScore = keyTotal === 0 ? 1 : keyHits / keyTotal;

  const structural =
    (errors.some((e) => e.kind === 'brace-imbalance') ? 0 : 1) *
    (errors.some((e) => e.kind === 'paren-imbalance') ? 0 : 1) *
    (errors.some((e) => e.kind === 'missing-semicolon') ? 0 : 1) *
    (errors.some((e) => e.kind === 'forbidden-token') ? 0 : 1);

  const score = Math.round(charScore * 60 + keyScore * 25 + structural * 15);

  const pass =
    !errors.some(
      (e) =>
        e.kind === 'forbidden-token' ||
        e.kind === 'missing-keycheck' ||
        e.kind === 'brace-imbalance' ||
        e.kind === 'missing-semicolon' ||
        e.kind === 'empty',
    ) && charScore >= 0.85;

  return {
    pass,
    score,
    errors,
    diff: buildDiff(student, card.canonicalAnswer),
  };
}
