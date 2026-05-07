/**
 * line-match.ts
 *
 * Per-line "matches the canonical line N?" comparator for the
 * TemplateRecallCard TYPE stage.
 *
 * The stage-3 editor shows a green tick in the gutter for every line the
 * student has committed that matches the corresponding canonical line.
 * This module holds the (pure) comparison logic.
 *
 * Tolerances mirror the rest of the project:
 *   - Trailing whitespace ignored
 *   - Leading whitespace normalized (tabs -> 4 spaces; consecutive spaces
 *     collapsed to one). This means an under-indented line still scores
 *     a tick, on the principle that we are drilling MEMORIZATION not
 *     formatting.
 *   - Operator spacing tolerated (`x=1`, `x =1`, `x = 1` all match) via
 *     normalizeLenient.
 *
 * Pure functions only — used in render hot path so cheap.
 */

const CPP_OPERATORS_LONG = ["<<=", ">>=", "==", "!=", "<=", ">=", "&&", "||", "++", "--", "+=", "-=", "*=", "/=", "%=", "<<", ">>", "->", "::"];
const CPP_OPERATORS_SHORT = ["=", "<", ">", "+", "-", "*", "/", "%", "&", "|", "!", "^", "~", "?"];

/**
 * Normalize a single line:
 *   - replace tabs with 4 spaces
 *   - collapse runs of internal whitespace to a single space
 *   - trim leading + trailing whitespace
 *   - strip whitespace AROUND C++ operators so `x=1` == `x = 1`
 *
 * NOT idempotent if you nest it inside string literals — ok for our scope.
 */
export function normalizeLenient(line: string): string {
  let s = line.replace(/\t/g, "    ");
  // Pull whitespace away from operators: longest-first so `<=` doesn't
  // get double-eaten by `<` and `=`.
  for (const op of CPP_OPERATORS_LONG) {
    const escaped = op.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    s = s.replace(new RegExp(`\\s*${escaped}\\s*`, "g"), op);
  }
  for (const op of CPP_OPERATORS_SHORT) {
    const escaped = op.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Only collapse if the operator stands alone (avoid breaking `<<` etc).
    s = s.replace(new RegExp(`\\s*${escaped}\\s*`, "g"), op);
  }
  // Collapse remaining whitespace runs and trim.
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

/**
 * True iff the student's line N exactly matches canonical line N under
 * normalizeLenient. Works on individual lines so the editor can render
 * per-line green ticks in real time without re-grading the whole block.
 */
export function lineMatches(
  studentSrc: string,
  canonicalSrc: string,
  lineIdx: number,
): boolean {
  const sLines = studentSrc.split("\n");
  const cLines = canonicalSrc.split("\n");
  const s = sLines[lineIdx];
  const c = cLines[lineIdx];
  if (s === undefined || c === undefined) return false;
  return normalizeLenient(s) === normalizeLenient(c);
}

/**
 * Returns boolean[] one-per-canonical-line, true where student's same-index
 * line matches. Cheaper than calling lineMatches in a loop because it splits
 * once.
 */
export function lineMatchVector(
  studentSrc: string,
  canonicalSrc: string,
): boolean[] {
  const sLines = studentSrc.split("\n");
  const cLines = canonicalSrc.split("\n");
  return cLines.map((c, i) => {
    const s = sLines[i];
    if (s === undefined) return false;
    return normalizeLenient(s) === normalizeLenient(c);
  });
}

/**
 * Whole-block grading: every canonical line must match (lenient).
 * Returns { ok, matched: boolean[], firstMismatch: number | -1 }.
 */
export function gradeBlock(
  studentSrc: string,
  canonicalSrc: string,
): { ok: boolean; matched: boolean[]; firstMismatch: number } {
  const matched = lineMatchVector(studentSrc, canonicalSrc);
  const firstMismatch = matched.findIndex((m) => !m);
  // Reject if student has EXTRA lines beyond canonical that aren't blank.
  const sLines = studentSrc.split("\n");
  const cLines = canonicalSrc.split("\n");
  let extraLineProblem = false;
  for (let i = cLines.length; i < sLines.length; i++) {
    if ((sLines[i] ?? "").trim().length > 0) {
      extraLineProblem = true;
      break;
    }
  }
  const ok = firstMismatch === -1 && !extraLineProblem;
  return { ok, matched, firstMismatch };
}

/**
 * Brace-balance check: returns the net depth of `{}` over the source.
 * 0 == balanced, positive == unclosed `{`, negative == extra `}`.
 * Ignores braces inside line comments and string/char literals.
 */
export function braceBalance(src: string): number {
  let depth = 0;
  let i = 0;
  let inLineComment = false;
  let inString: '"' | "'" | null = null;
  while (i < src.length) {
    const ch = src[i];
    const nx = src[i + 1];
    if (inLineComment) {
      if (ch === "\n") inLineComment = false;
      i++;
      continue;
    }
    if (inString) {
      if (ch === "\\") {
        i += 2;
        continue;
      }
      if (ch === inString) inString = null;
      i++;
      continue;
    }
    if (ch === "/" && nx === "/") {
      inLineComment = true;
      i += 2;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = ch;
      i++;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    i++;
  }
  return depth;
}
