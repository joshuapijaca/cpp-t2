/**
 * skeleton-mask.ts
 *
 * Stage-2 skeleton generator for TemplateRecallCard.
 *
 * Given a canonical C++ snippet, returns a "structure-preserving" version
 * with the variable parts replaced by `___`. The student sees the shape
 * (struct ... { ___ ___; };) but not the names — so they have to commit
 * to verbatim recall before stage 3 (TYPE).
 *
 * Pure: no DOM, no React, no I/O. Re-uses the cpp-tokenizer so the mask
 * is character-accurate (same tokens the editor's highlight layer sees).
 *
 * Used by:
 *   - TemplateRecallCard stage 2 (HIDE)
 *
 * Design rules:
 *   1. Whitespace + newlines are PRESERVED verbatim (alignment matters).
 *   2. Punctuation (`;{}(),[].::`), keywords (int, void, struct, …), and
 *      operators are preserved by default — they are the *structure*.
 *   3. Identifiers, numbers, and strings are masked to `___` UNLESS the
 *      caller pins them in `keepTokens` (e.g. always keep `main`, `cout`).
 *   4. Adjacent identical-class tokens collapse to a single `___` so the
 *      shape `struct Point { double x; }` becomes `struct ___ { ___ ___; }`
 *      not `struct ___ { ___  ___; }` (one ___ per logical "slot").
 *   5. Caller picks WHICH token classes to mask via `hideTypes`. Default
 *      is `["identifier", "number", "string"]`.
 */

import { tokenize, type TokenType, CPP_KEYWORDS } from "./cpp-tokenizer";

const DEFAULT_HIDE: TokenType[] = ["identifier", "number", "string"];

/** Identifiers we always KEEP visible — they're structural cues. */
const ALWAYS_KEEP_IDENTS = new Set<string>([
  // (CPP_KEYWORDS already covers int/void/struct/return/etc — listed here
  //  for identifiers the tokenizer happens to NOT classify as keywords.)
  "main",
  "cout",
  "cin",
  "endl",
  "std",
]);

export interface GenerateSkeletonOptions {
  /**
   * Token types to replace with `___`. Defaults to identifier/number/string.
   * Pass `[]` to mask nothing (useful for debugging).
   */
  hideTypes?: TokenType[];
  /**
   * Specific token *values* to keep visible even if their type is in
   * `hideTypes`. Adds to ALWAYS_KEEP_IDENTS.
   */
  keepTokens?: string[];
  /** Custom placeholder. Defaults to `___`. */
  placeholder?: string;
}

/**
 * Replace the variable parts of `canonical` with `___` while keeping the
 * surrounding structure (whitespace, punctuation, keywords) intact.
 */
export function generateSkeleton(
  canonical: string,
  hideTypesArg?: string[] | GenerateSkeletonOptions,
  optsArg?: GenerateSkeletonOptions,
): string {
  // Allow the simple call signature `generateSkeleton(code, ["identifier"])`
  // documented in the parent task spec, AND the richer object form.
  let hideTypes: TokenType[] = DEFAULT_HIDE;
  let opts: GenerateSkeletonOptions = {};
  if (Array.isArray(hideTypesArg)) {
    hideTypes = hideTypesArg.filter((t): t is TokenType =>
      ["keyword", "identifier", "string", "number", "comment", "operator", "punctuation", "whitespace"].includes(t),
    );
    opts = optsArg ?? {};
  } else if (hideTypesArg && typeof hideTypesArg === "object") {
    opts = hideTypesArg;
    if (opts.hideTypes) hideTypes = opts.hideTypes;
  }

  const placeholder = opts.placeholder ?? "___";
  const keep = new Set<string>([...ALWAYS_KEEP_IDENTS, ...(opts.keepTokens ?? [])]);
  const hideSet = new Set<TokenType>(hideTypes);

  const tokens = tokenize(canonical);

  // Pass 1: decide per-token whether to mask.
  const masked = tokens.map((t) => {
    if (!hideSet.has(t.type)) return t.value;
    // Identifier exemptions.
    if (t.type === "identifier") {
      if (keep.has(t.value)) return t.value;
      // Defensive: tokenizer also tags some keywords as "identifier" if they
      // fall outside its CPP_KEYWORDS set. Don't mask known keywords.
      if (CPP_KEYWORDS.has(t.value)) return t.value;
    }
    return placeholder;
  });

  // Pass 2: collapse runs of `placeholder` separated only by whitespace
  // (so `int x` -> `___ ___` not `___  ___` — one slot per concept).
  // We treat `<placeholder><ws-only><placeholder>` as ONE slot iff the
  // gap contains no newline (preserve line shape).
  const out: string[] = [];
  let i = 0;
  while (i < masked.length) {
    const cur = masked[i] ?? "";
    out.push(cur);
    if (cur === placeholder) {
      // Look ahead: skip any whitespace tokens with no newline; if we hit
      // another placeholder, drop it (collapse).
      let j = i + 1;
      let gap = "";
      while (
        j < masked.length &&
        masked[j] !== placeholder &&
        tokens[j]?.type === "whitespace" &&
        !masked[j]?.includes("\n")
      ) {
        gap += masked[j] ?? "";
        j++;
      }
      if (j < masked.length && masked[j] === placeholder && gap.length > 0) {
        // Replace gap with a single space and skip the second placeholder.
        // We DON'T collapse; we KEEP one space between slots so the visual
        // output is `___ ___` not `______`. Only collapse when there is
        // literally no gap (which can't happen given tokenizer rules).
        out.push(gap);
        out.push(placeholder);
        i = j + 1;
        continue;
      }
    }
    i++;
  }

  return out.join("");
}

/**
 * Convenience: mask only identifiers (keep keywords, punctuation, numbers).
 * Useful for "pure-shape" hints where literal values are part of the lesson.
 */
export function generateIdentifierSkeleton(canonical: string): string {
  return generateSkeleton(canonical, ["identifier"]);
}
