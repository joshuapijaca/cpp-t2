/**
 * cpp-tokenizer.ts
 *
 * Pure-function C++ tokenizer for the cpp-t2 CodeEditor primitive.
 * Scope: SIT102 Test 2 C++ subset (P6-P9). Not a full C++ parser.
 *
 * Used by:
 *   - CodeEditor (syntax highlight overlay)
 *   - BraceMatcher (locating { } / ( ) / [ ] pairs)
 *
 * Bundle target: keep this file < 4 KB gzip. No dependencies.
 */

export type TokenType =
  | "keyword"
  | "identifier"
  | "string"
  | "number"
  | "comment"
  | "operator"
  | "punctuation"
  | "whitespace";

export interface Token {
  type: TokenType;
  value: string;
  start: number;
  end: number; // exclusive
}

/**
 * C++ keywords used in SIT102 Test 2 scope.
 * Kept narrow on purpose: highlighter only colors what's in scope.
 */
export const CPP_KEYWORDS = new Set<string>([
  "int",
  "double",
  "string",
  "bool",
  "char",
  "void",
  "struct",
  "return",
  "for",
  "if",
  "else",
  "const",
  "true",
  "false",
  "cin",
  "cout",
  "endl",
  // Common helpers in SIT102 examples (not all "true" keywords but treated as such for highlighting):
  "while",
  "do",
  "break",
  "continue",
  "include",
  "using",
  "namespace",
  "std",
  "main",
]);

/**
 * Multi-char operators, longest-first so the scanner can greedy-match.
 * IMPORTANT: order matters. <= must be tried before <, etc.
 */
const MULTI_CHAR_OPERATORS: string[] = [
  "<<=",
  ">>=",
  "==",
  "!=",
  "<=",
  ">=",
  "&&",
  "||",
  "++",
  "--",
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "<<",
  ">>",
  "->",
  "::",
];

const SINGLE_CHAR_OPERATORS = new Set<string>([
  "=",
  "<",
  ">",
  "+",
  "-",
  "*",
  "/",
  "%",
  "&",
  "|",
  "!",
  "^",
  "~",
  "?",
]);

const PUNCTUATION = new Set<string>([
  ";",
  "{",
  "}",
  "(",
  ")",
  "[",
  "]",
  ".",
  ",",
  ":",
]);

function isIdentStart(ch: string | undefined): boolean {
  if (ch === undefined) return false;
  return (
    (ch >= "a" && ch <= "z") ||
    (ch >= "A" && ch <= "Z") ||
    ch === "_"
  );
}

function isIdentPart(ch: string | undefined): boolean {
  if (ch === undefined) return false;
  return isIdentStart(ch) || (ch >= "0" && ch <= "9");
}

function isDigit(ch: string | undefined): boolean {
  if (ch === undefined) return false;
  return ch >= "0" && ch <= "9";
}

/**
 * Tokenize a C++ source string.
 *
 * Whitespace is preserved as a token (type "whitespace") so that
 * sum(token.length) === code.length — the highlight overlay relies on
 * this to align with the textarea text.
 */
export function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  const len = code.length;
  let i = 0;

  while (i < len) {
    const start = i;
    // Safe non-null: i < len guaranteed by the while condition.
    const ch = code[i] as string;

    // ── whitespace ────────────────────────────────────────────────
    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
      while (
        i < len &&
        (code[i] === " " ||
          code[i] === "\t" ||
          code[i] === "\n" ||
          code[i] === "\r")
      ) {
        i++;
      }
      tokens.push({
        type: "whitespace",
        value: code.slice(start, i),
        start,
        end: i,
      });
      continue;
    }

    // ── line comment ──────────────────────────────────────────────
    if (ch === "/" && code[i + 1] === "/") {
      while (i < len && code[i] !== "\n") i++;
      tokens.push({
        type: "comment",
        value: code.slice(start, i),
        start,
        end: i,
      });
      continue;
    }

    // ── block comment ─────────────────────────────────────────────
    if (ch === "/" && code[i + 1] === "*") {
      i += 2;
      while (i < len && !(code[i] === "*" && code[i + 1] === "/")) i++;
      if (i < len) i += 2; // skip closing */
      tokens.push({
        type: "comment",
        value: code.slice(start, i),
        start,
        end: i,
      });
      continue;
    }

    // ── string literal ────────────────────────────────────────────
    if (ch === '"') {
      i++;
      while (i < len && code[i] !== '"') {
        if (code[i] === "\\" && i + 1 < len) {
          i += 2;
          continue;
        }
        if (code[i] === "\n") break; // unterminated; bail safe
        i++;
      }
      if (i < len && code[i] === '"') i++;
      tokens.push({
        type: "string",
        value: code.slice(start, i),
        start,
        end: i,
      });
      continue;
    }

    // ── char literal ──────────────────────────────────────────────
    if (ch === "'") {
      i++;
      while (i < len && code[i] !== "'") {
        if (code[i] === "\\" && i + 1 < len) {
          i += 2;
          continue;
        }
        if (code[i] === "\n") break;
        i++;
      }
      if (i < len && code[i] === "'") i++;
      tokens.push({
        type: "string",
        value: code.slice(start, i),
        start,
        end: i,
      });
      continue;
    }

    // ── preprocessor #include style ───────────────────────────────
    // Treat the leading '#' + word as keyword-ish (helpful for visual cue).
    if (ch === "#") {
      i++;
      while (i < len && isIdentPart(code[i])) i++;
      tokens.push({
        type: "keyword",
        value: code.slice(start, i),
        start,
        end: i,
      });
      continue;
    }

    // ── number literal ────────────────────────────────────────────
    if (isDigit(ch)) {
      while (i < len && (isDigit(code[i]) || code[i] === ".")) i++;
      // optional suffix (f, u, l, etc.) — keep simple
      while (
        i < len &&
        (code[i] === "f" ||
          code[i] === "F" ||
          code[i] === "u" ||
          code[i] === "U" ||
          code[i] === "l" ||
          code[i] === "L")
      ) {
        i++;
      }
      tokens.push({
        type: "number",
        value: code.slice(start, i),
        start,
        end: i,
      });
      continue;
    }

    // ── identifier / keyword ──────────────────────────────────────
    if (isIdentStart(ch)) {
      while (i < len && isIdentPart(code[i])) i++;
      const value = code.slice(start, i);
      tokens.push({
        type: CPP_KEYWORDS.has(value) ? "keyword" : "identifier",
        value,
        start,
        end: i,
      });
      continue;
    }

    // ── multi-char operator (greedy) ──────────────────────────────
    let matchedMulti: string | null = null;
    for (const op of MULTI_CHAR_OPERATORS) {
      if (code.startsWith(op, i)) {
        matchedMulti = op;
        break;
      }
    }
    if (matchedMulti) {
      tokens.push({
        type: "operator",
        value: matchedMulti,
        start,
        end: start + matchedMulti.length,
      });
      i += matchedMulti.length;
      continue;
    }

    // ── single-char operator ──────────────────────────────────────
    if (SINGLE_CHAR_OPERATORS.has(ch)) {
      tokens.push({
        type: "operator",
        value: ch,
        start,
        end: i + 1,
      });
      i++;
      continue;
    }

    // ── punctuation ───────────────────────────────────────────────
    if (PUNCTUATION.has(ch)) {
      tokens.push({
        type: "punctuation",
        value: ch,
        start,
        end: i + 1,
      });
      i++;
      continue;
    }

    // ── unknown char: emit as identifier-ish so length stays sound ─
    tokens.push({
      type: "identifier",
      value: ch,
      start,
      end: i + 1,
    });
    i++;
  }

  return tokens;
}

/**
 * Find the token whose range contains the given character index.
 * Returns null if pos is past the end. O(log n) via binary search would be
 * better; for SIT102 sized snippets (<300 chars typical), linear is fine.
 */
export function tokenAtPos(tokens: Token[], pos: number): Token | null {
  for (const t of tokens) {
    if (pos >= t.start && pos < t.end) return t;
  }
  return null;
}
