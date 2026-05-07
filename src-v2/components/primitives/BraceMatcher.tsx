/**
 * BraceMatcher.tsx
 *
 * Given source code and a caret position, find the matching brace pair
 * that brackets the caret (or sits adjacent to it). Produces a depth-aware
 * result so the editor can color rainbow-bracket style.
 *
 * Used by:
 *   - CodeEditor (showBraceMatch prop)
 *   - StructWriteCard / FunctionWriteCard (visual brace lints)
 *
 * This module exposes:
 *   - findMatchingBrace(): pure function, the core algorithm
 *   - useBraceMatch():    React hook wrapping the function
 *   - BraceMatchOverlay:  optional standalone visual component
 *
 * Bracket types tracked: { } / ( ) / [ ]
 * Strings and comments are masked out via the tokenizer so braces inside
 * "if (x)" string literals don't confuse the matcher.
 */

import { useMemo } from "react";
import { tokenize, type Token } from "../../lib/cpp-tokenizer";

type Opener = "{" | "(" | "[";
type Closer = "}" | ")" | "]";
type Bracket = Opener | Closer;

const OPENERS: ReadonlySet<string> = new Set(["{", "(", "["]);
const CLOSERS: ReadonlySet<string> = new Set(["}", ")", "]"]);

function isOpener(c: string | undefined): c is Opener {
  return c !== undefined && OPENERS.has(c);
}
function isCloser(c: string | undefined): c is Closer {
  return c !== undefined && CLOSERS.has(c);
}
function isBracket(c: string | undefined): c is Bracket {
  return isOpener(c) || isCloser(c);
}

const PAIR: Record<Bracket, Bracket> = {
  "{": "}",
  "(": ")",
  "[": "]",
  "}": "{",
  ")": "(",
  "]": "[",
};

export interface BraceMatchResult {
  /** Position of the opener char, e.g. '{'. */
  openPos: number;
  /** Position of the closer char, e.g. '}'. -1 if mismatch / unclosed. */
  closePos: number;
  /** Nesting depth (0 = outermost). Use for color-by-depth. */
  depth: number;
  /** True when both halves were found; false on mismatch. */
  matched: boolean;
}

/**
 * Build a mask of positions that are inside a string or comment token.
 * Braces inside masked regions are ignored.
 */
function buildMask(tokens: Token[], len: number): Uint8Array {
  const mask = new Uint8Array(len);
  for (const t of tokens) {
    if (t.type === "string" || t.type === "comment") {
      for (let i = t.start; i < t.end; i++) mask[i] = 1;
    }
  }
  return mask;
}

/**
 * Find the bracket pair closest to caretPos.
 *
 * Strategy:
 *   1. If the char at caretPos OR caretPos-1 is a bracket, use that as the pivot.
 *   2. Otherwise, walk left to find the nearest unclosed opener.
 *   3. From the opener, walk right to find its matching closer.
 *   4. Track depth so we can return a depth index for color cycling.
 */
export function findMatchingBrace(
  code: string,
  caretPos: number,
): BraceMatchResult | null {
  const len = code.length;
  if (len === 0) return null;
  const clamped = Math.max(0, Math.min(caretPos, len));

  const tokens = tokenize(code);
  const mask = buildMask(tokens, len);

  // ── pivot detection ─────────────────────────────────────────────
  let pivot = -1;
  // Prefer char to the LEFT of caret (typical editor convention).
  if (clamped > 0 && !mask[clamped - 1]) {
    const c = code[clamped - 1];
    if (isBracket(c)) pivot = clamped - 1;
  }
  if (pivot === -1 && clamped < len && !mask[clamped]) {
    const c = code[clamped];
    if (isBracket(c)) pivot = clamped;
  }

  if (pivot !== -1) {
    return scanFromPivot(code, mask, pivot);
  }

  // ── caret is in plain text: find enclosing pair ────────────────
  // Walk left, increment when seeing closer, decrement on opener.
  // First opener that brings counter to -1 is our enclosing bracket.
  const counters: Record<Opener, number> = { "{": 0, "(": 0, "[": 0 };
  for (let i = clamped - 1; i >= 0; i--) {
    if (mask[i]) continue;
    const c = code[i];
    if (isCloser(c)) {
      const opener = PAIR[c] as Opener;
      counters[opener]++;
    } else if (isOpener(c)) {
      if (counters[c] === 0) {
        return scanFromPivot(code, mask, i);
      }
      counters[c]--;
    }
  }

  return null;
}

/**
 * From a known bracket position, walk in the appropriate direction to find
 * the partner and compute depth.
 */
function scanFromPivot(
  code: string,
  mask: Uint8Array,
  pivot: number,
): BraceMatchResult {
  // Caller has already verified code[pivot] is a bracket.
  const ch = code[pivot] as Bracket;
  const opener: Opener = isOpener(ch) ? ch : (PAIR[ch] as Opener);
  const closer: Closer = PAIR[opener] as Closer;

  // depth = how many same-type openers wrap pivot (compute by scanning left)
  let depth = 0;
  {
    let opens = 0;
    let closes = 0;
    for (let i = 0; i < pivot; i++) {
      if (mask[i]) continue;
      const c = code[i];
      if (c === opener) opens++;
      else if (c === closer) closes++;
    }
    depth = Math.max(0, opens - closes);
  }

  // forward scan from opener position to find matching closer
  let openPos: number;
  let closePos: number;

  if (isOpener(ch)) {
    openPos = pivot;
    closePos = forwardMatch(code, mask, pivot, opener, closer);
  } else {
    closePos = pivot;
    openPos = backwardMatch(code, mask, pivot, opener, closer);
  }

  return {
    openPos,
    closePos,
    depth,
    matched: openPos !== -1 && closePos !== -1,
  };
}

function forwardMatch(
  code: string,
  mask: Uint8Array,
  start: number,
  opener: string,
  closer: string,
): number {
  let depth = 0;
  for (let i = start; i < code.length; i++) {
    if (mask[i]) continue;
    const c = code[i];
    if (c === opener) depth++;
    else if (c === closer) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function backwardMatch(
  code: string,
  mask: Uint8Array,
  start: number,
  opener: string,
  closer: string,
): number {
  let depth = 0;
  for (let i = start; i >= 0; i--) {
    if (mask[i]) continue;
    const c = code[i];
    if (c === closer) depth++;
    else if (c === opener) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

// ─────────────────────────────────────────────────────────────────────
// React hook for use inside CodeEditor
// ─────────────────────────────────────────────────────────────────────

/**
 * Hook that recomputes the brace match whenever code or caretPos changes.
 * Memoized to keep CodeEditor re-renders cheap.
 */
export function useBraceMatch(
  code: string,
  caretPos: number,
): BraceMatchResult | null {
  return useMemo(
    () => findMatchingBrace(code, caretPos),
    [code, caretPos],
  );
}

// ─────────────────────────────────────────────────────────────────────
// Standalone visual component
// (Mostly used for stories / tests; CodeEditor draws its own overlay.)
// ─────────────────────────────────────────────────────────────────────

export interface BraceMatcherProps {
  code: string;
  caretPos: number;
}

/**
 * Renders a small status pill describing the current brace pair.
 * Color is sourced from --brace-d{0|1|2} CSS vars (theme tokens).
 */
export function BraceMatcher({ code, caretPos }: BraceMatcherProps) {
  const match = useBraceMatch(code, caretPos);

  if (!match) {
    return (
      <span
        className="text-xs font-mono opacity-60"
        data-testid="brace-matcher"
        data-status="none"
      >
        no brace pair
      </span>
    );
  }

  const depthIdx = match.depth % 3;
  const colorVar = `var(--brace-d${depthIdx})`;
  const status = match.matched ? "matched" : "mismatch";

  return (
    <span
      className="text-xs font-mono"
      data-testid="brace-matcher"
      data-status={status}
      data-depth={match.depth}
      style={{ color: match.matched ? colorVar : "var(--state-err)" }}
    >
      {match.matched
        ? `[${match.openPos}…${match.closePos}] depth ${match.depth}`
        : `unmatched at ${match.openPos !== -1 ? match.openPos : match.closePos}`}
    </span>
  );
}
