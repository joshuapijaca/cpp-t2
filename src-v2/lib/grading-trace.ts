/**
 * grading-trace.ts
 *
 * Pure, deterministic grader for TraceCard (Q1 hand-execute) submissions.
 *
 * Per RULE 4: Q1 is the backbone — pass/fail must be 100% deterministic, no
 * AI, no LLM, no randomness. Same inputs => same result, every time.
 *
 * Two channels are graded independently and combined into a single PASS/FAIL:
 *
 *   1. Variables panel — for every variable named in `expectedTrace`, the
 *      student's CURRENT value (i.e. last entry in their history array) must
 *      lenient-match the FINAL canonical value of that variable in the
 *      expected trace. Extra student variables are ignored (the student may
 *      have tracked intermediates the trace doesn't audit). Missing required
 *      variables are wrong.
 *
 *   2. Terminal output — joined-and-normalized char compare against
 *      `terminalOutput` (an array of stdout lines). The student types a free-
 *      form string into the terminal panel; we collapse that to lines and
 *      lenient-match line-by-line.
 *
 * `normalizeLenient`:
 *   - Trim leading/trailing whitespace on every line.
 *   - Collapse all internal whitespace runs to single spaces.
 *   - Strip whitespace adjacent to C++ operators (`<<`, `>>`, `=`, `==`,
 *     `!=`, `<=`, `>=`, `<`, `>`, `+`, `-`, `*`, `/`, `%`, `&&`, `||`).
 *   - Lowercase ONLY recognized C++ keywords (true/false/nullptr/cout/endl).
 *     Variable names + numeric literals are case-sensitive (per spec).
 *
 * NO React, NO DOM, NO async. Pure data only — easy to unit-test.
 */

import type { Variable } from '../components/primitives/VariablesPanel';

// ─────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────

/**
 * The student's current submission state when they hit [Submit].
 * The TraceCard component owns this state and passes it to gradeTrace.
 */
export interface TraceState {
  /** Live state of the variables watch-table. */
  variables: Variable[];
  /** Free-form text the student typed into the simulated terminal. */
  terminalText: string;
}

/**
 * The canonical "answer" extracted from the TraceCard YAML at load time.
 * Built by `buildExpectedTrace(card)` — see helper at the bottom of this file.
 */
export interface ExpectedTrace {
  /**
   * Final per-variable values. Order is the order variables first appear in
   * `expectedTrace`. Each entry's `value` is the LAST value that variable
   * is assigned in the canonical trace.
   */
  variables: Array<{ name: string; value: string }>;
  /** Cumulative stdout lines (matches TraceCard.terminalOutput in the YAML). */
  terminalLines: string[];
}

/** Per-variable grade row. */
export interface VarGradeRow {
  name: string;
  correct: boolean;
  expected: string;
  /** What the student actually had as the current value (or "" if missing). */
  actual: string;
  /** True if the student didn't track this variable at all. */
  missing: boolean;
}

/** Whole-card result. */
export interface GradeResult {
  /** True iff every required variable is correct AND terminal matches. */
  pass: boolean;
  varResults: VarGradeRow[];
  terminalCorrect: boolean;
  /**
   * Optional textual diff (unified-ish, prefixed +/-) when terminal is wrong.
   * undefined when terminalCorrect === true.
   */
  terminalDiff?: string;
  /** Expected stdout joined for display. */
  expectedTerminalText: string;
  /** Student stdout joined for display. */
  actualTerminalText: string;
}

// ─────────────────────────────────────────────────────────────────────
// Normalization
// ─────────────────────────────────────────────────────────────────────

/**
 * Two-character C++ operators are detected before single-char ones to avoid
 * `<` matching the `<` half of `<<`.
 */
const OPS_2 = ['<<', '>>', '==', '!=', '<=', '>=', '&&', '||'] as const;
const OPS_1 = ['<', '>', '=', '+', '-', '*', '/', '%'] as const;

/** Recognized keywords whose case is normalized in lenient compare. */
const KEYWORD_LOWERCASE_SET = new Set([
  'true',
  'false',
  'nullptr',
  'cout',
  'endl',
  'cin',
]);

/**
 * Normalize a single line for char-match comparison.
 *
 * Steps:
 *   1. Trim outer whitespace.
 *   2. Collapse internal whitespace runs to a single space.
 *   3. Strip whitespace adjacent to C++ operators (`<< x` -> `<<x`).
 *   4. Lowercase recognized keywords (case-insensitive `TRUE` => `true`).
 *      Variable names / numeric literals stay case-sensitive.
 */
export function normalizeLenient(s: string): string {
  if (s == null) return '';
  // 1. trim + collapse whitespace
  let t = s.trim().replace(/\s+/g, ' ');

  // 3. strip whitespace adjacent to operators (do 2-char ops FIRST)
  for (const op of OPS_2) {
    // escape any regex specials inside `op`. For safety, build pattern char-by-char.
    const escaped = escapeRegex(op);
    const pat = new RegExp(`\\s*${escaped}\\s*`, 'g');
    t = t.replace(pat, op);
  }
  for (const op of OPS_1) {
    const escaped = escapeRegex(op);
    const pat = new RegExp(`\\s*${escaped}\\s*`, 'g');
    t = t.replace(pat, op);
  }

  // 4. lowercase recognized keywords (case-insensitive match, replace with lower form)
  // Tokenize on word boundaries; skip non-words.
  t = t.replace(/[A-Za-z_][A-Za-z0-9_]*/g, (word) => {
    const lc = word.toLowerCase();
    if (KEYWORD_LOWERCASE_SET.has(lc)) return lc;
    return word; // leave variable names alone (case-sensitive)
  });

  return t;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Lenient equality for two single-line values (used inside variable grading). */
export function valuesEqualLenient(a: string, b: string): boolean {
  return normalizeLenient(a) === normalizeLenient(b);
}

/** Split a free-form terminal blob into lines, dropping a single trailing empty. */
export function splitTerminalLines(text: string): string[] {
  if (!text) return [];
  // Normalize CRLF / CR -> LF first.
  const normalized = text.replace(/\r\n?/g, '\n');
  const lines = normalized.split('\n');
  if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
  return lines;
}

// ─────────────────────────────────────────────────────────────────────
// Build ExpectedTrace from a raw TraceCard
// ─────────────────────────────────────────────────────────────────────

/**
 * Minimal subset of the TraceCard YAML shape we need for grading.
 *
 * Decoupled from `card-schema.ts` Zod types so this module can be unit-tested
 * without depending on the entire schema. The TraceCard component does the
 * adapting (Card -> ExpectedTrace) before calling `gradeTrace`.
 */
export interface TraceCardLike {
  variables: string[];
  expectedTrace: Array<{
    line: number;
    variable: string;
    value: string;
    output?: string | null | undefined;
  }>;
  terminalOutput: string[];
}

/**
 * Build ExpectedTrace from a raw TraceCard. Walks `expectedTrace` and keeps
 * the LAST value seen for each variable (final state). Variables declared in
 * `card.variables` but never assigned get `value = ""` and the grader will
 * accept any value the student writes (including blank) — that's the design
 * for variables the trace doesn't audit. We special-case this with a flag
 * downstream by emitting only variables that have an explicit final value.
 */
export function buildExpectedTrace(card: TraceCardLike): ExpectedTrace {
  const finalByName = new Map<string, string>();
  const orderSeen: string[] = [];

  for (const step of card.expectedTrace) {
    if (!step.variable || step.variable === '') continue; // output-only step
    if (!finalByName.has(step.variable)) orderSeen.push(step.variable);
    finalByName.set(step.variable, step.value);
  }

  const variables = orderSeen.map((name) => ({
    name,
    value: finalByName.get(name) ?? '',
  }));
  return {
    variables,
    terminalLines: card.terminalOutput.slice(),
  };
}

// ─────────────────────────────────────────────────────────────────────
// Main grader
// ─────────────────────────────────────────────────────────────────────

/**
 * Pure grading function.
 *
 * Comparison rules (deterministic, side-effect free):
 *   - For each `expected.variables[i]`:
 *       - find the FIRST student-row with `name === expected.name` (case-
 *         sensitive — variable names matter).
 *       - if missing => correct: false, missing: true.
 *       - else compare student's current value (last in history, falling
 *         back to .value if history empty) to expected via valuesEqualLenient.
 *   - Terminal: split student's free-form text into lines, compare line-by-
 *     line via normalizeLenient. Differing line counts => wrong.
 */
export function gradeTrace(
  student: TraceState,
  expected: ExpectedTrace
): GradeResult {
  // ── variables ──────────────────────────────────────────────────
  const varResults: VarGradeRow[] = expected.variables.map((req) => {
    const studentVar = student.variables.find((v) => v.name === req.name);
    if (!studentVar) {
      return {
        name: req.name,
        correct: false,
        expected: req.value,
        actual: '',
        missing: true,
      };
    }
    const actualCurrent =
      studentVar.history.length > 0
        ? studentVar.history[studentVar.history.length - 1] ?? ''
        : studentVar.value ?? '';
    const correct = valuesEqualLenient(actualCurrent, req.value);
    return {
      name: req.name,
      correct,
      expected: req.value,
      actual: actualCurrent,
      missing: false,
    };
  });
  const allVarsCorrect = varResults.every((r) => r.correct);

  // ── terminal ──────────────────────────────────────────────────
  const studentLines = splitTerminalLines(student.terminalText);
  const expectedLines = expected.terminalLines.slice();

  let terminalCorrect = studentLines.length === expectedLines.length;
  if (terminalCorrect) {
    for (let i = 0; i < expectedLines.length; i++) {
      const a = studentLines[i] ?? '';
      const b = expectedLines[i] ?? '';
      if (normalizeLenient(a) !== normalizeLenient(b)) {
        terminalCorrect = false;
        break;
      }
    }
  }

  const expectedTerminalText = expectedLines.join('\n');
  const actualTerminalText = studentLines.join('\n');

  const result: GradeResult = {
    pass: allVarsCorrect && terminalCorrect,
    varResults,
    terminalCorrect,
    expectedTerminalText,
    actualTerminalText,
  };
  if (!terminalCorrect) {
    result.terminalDiff = buildSimpleDiff(studentLines, expectedLines);
  }
  return result;
}

/**
 * Tiny line-based diff (no library): lines unique to expected get `-`,
 * lines unique to student get `+`, matching lines are blank. Designed for
 * student-facing "what was wrong" feedback, not for engineering diff.
 */
function buildSimpleDiff(actual: string[], expected: string[]): string {
  const max = Math.max(actual.length, expected.length);
  const lines: string[] = [];
  for (let i = 0; i < max; i++) {
    const a = actual[i];
    const b = expected[i];
    if (a === undefined && b !== undefined) {
      lines.push(`- ${b}`);
    } else if (a !== undefined && b === undefined) {
      lines.push(`+ ${a}`);
    } else if (a !== undefined && b !== undefined) {
      if (normalizeLenient(a) !== normalizeLenient(b)) {
        lines.push(`- ${b}`);
        lines.push(`+ ${a}`);
      } else {
        lines.push(`  ${a}`);
      }
    }
  }
  return lines.join('\n');
}
