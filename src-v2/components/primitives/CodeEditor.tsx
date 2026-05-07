/**
 * CodeEditor.tsx
 *
 * Lightweight syntax-highlighted code editor primitive for cpp-t2 Option 4.
 * (brace match + variables-panel pattern, no IDE dependency.)
 *
 * Architecture (the "transparent textarea" trick):
 *   ┌──────────────────────── relative wrapper ─────────────────────────┐
 *   │  <pre.highlight>     ←  syntax-colored, NOT interactive            │
 *   │     <span class="kw">int</span> <span class="id">x</span> ...      │
 *   │  </pre>                                                            │
 *   │                                                                    │
 *   │  <textarea>          ←  ACTUAL input, color: transparent           │
 *   │     int x = 0;       ←  caret + selection visible because the      │
 *   │  </textarea>            CSS caret-color is set explicitly          │
 *   └────────────────────────────────────────────────────────────────────┘
 *
 * Both layers share the SAME font, padding, and line-height so each glyph
 * in the textarea sits exactly on top of the same glyph in the highlight
 * pre. This is the standard "react-simple-code-editor" / Prism approach,
 * but written from scratch here to avoid the dep (every kB counts toward
 * the 280 KB gzip target).
 *
 * Why not Monaco?
 *   Monaco is ~2 MB minified. We need < 280 KB total for cpp-t2.
 *   For a SIT102-scope C++ subset, this is ample.
 *
 * Used by:
 *   - TraceCard, StructWriteCard, FunctionWriteCard, MainWriteCard,
 *     SpeedDrillCard, AdversarialMockCard, plus any future write-type card.
 *
 * Accessibility (RULE 4: keyboard-only operation):
 *   - role="application" so screen-readers stop intercepting Tab.
 *   - aria-label is REQUIRED via prop.
 *   - Tab inserts spaces (does NOT shift focus). Esc shifts focus out
 *     so keyboard users can escape the editor without a mouse.
 *   - Ctrl+/, Ctrl+], Ctrl+[ all keyboard-driven.
 */

import {
  forwardRef,
  useCallback,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import { tokenize, type Token } from "../../lib/cpp-tokenizer";
import { useBraceMatch } from "./BraceMatcher";

const INDENT = "    "; // 4 spaces — never an actual \t

export interface CodeEditorProps {
  value: string;
  onChange: (next: string) => void;
  /**
   * Currently the only supported language. Reserved for future Python/etc.
   */
  language: "cpp";
  readOnly?: boolean;
  lineNumbers?: boolean;
  showBraceMatch?: boolean;
  className?: string;
  /**
   * REQUIRED for a11y. Describe what this editor is for, e.g.
   * "C++ trace exercise — line 4".
   */
  ariaLabel: string;
  /**
   * Optional placeholder shown when value === "".
   */
  placeholder?: string;
  /**
   * Fires when the user presses Esc inside the editor. The editor itself
   * blurs; the parent can use this to close a dialog or move focus.
   */
  onEscape?: () => void;
}

export interface CodeEditorHandle {
  focus: () => void;
  /** Returns the textarea DOM node for advanced parents (sparingly). */
  getTextarea: () => HTMLTextAreaElement | null;
}

// ─────────────────────────────────────────────────────────────────────
// Highlight rendering: tokens → React nodes
// ─────────────────────────────────────────────────────────────────────

const TOKEN_CLASS: Record<Token["type"], string> = {
  keyword: "ce-tok-keyword",
  identifier: "ce-tok-identifier",
  string: "ce-tok-string",
  number: "ce-tok-number",
  comment: "ce-tok-comment",
  operator: "ce-tok-operator",
  punctuation: "ce-tok-punctuation",
  whitespace: "ce-tok-ws",
};

interface HighlightProps {
  code: string;
  // exactOptionalPropertyTypes: include `| undefined` so the wrapper
  // can pass `undefined` directly without spreading conditional props.
  braceOpen?: number | undefined;
  braceClose?: number | undefined;
  braceDepth?: number | undefined;
  braceMatched?: boolean | undefined;
}

function HighlightLayer({
  code,
  braceOpen,
  braceClose,
  braceDepth,
  braceMatched,
}: HighlightProps) {
  const tokens = useMemo(() => tokenize(code), [code]);

  // Force a trailing newline for the highlight layer so that the box
  // height stays in sync with the textarea when the user's last char is \n.
  const display = code.endsWith("\n") ? code + " " : code;
  const tokensForRender =
    display === code ? tokens : tokenize(display);

  return (
    <pre
      aria-hidden="true"
      className="ce-highlight"
      // The pre must use the EXACT same font/size/padding as the textarea
      // (handled in the wrapping <style> block below).
    >
      {tokensForRender.map((t, idx) => {
        const isBraceOpen = braceOpen !== undefined && t.start === braceOpen;
        const isBraceClose = braceClose !== undefined && t.start === braceClose;
        const isBrace = isBraceOpen || isBraceClose;

        const cls = [TOKEN_CLASS[t.type]];
        if (isBrace) {
          cls.push(braceMatched ? "ce-brace-match" : "ce-brace-mismatch");
          if (braceDepth !== undefined && braceMatched) {
            cls.push(`ce-brace-d${braceDepth % 3}`);
          }
        }
        return (
          <span key={idx} className={cls.join(" ")}>
            {t.value}
          </span>
        );
      })}
    </pre>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Line numbers gutter
// ─────────────────────────────────────────────────────────────────────

function LineGutter({ lineCount }: { lineCount: number }) {
  // Build [1, 2, …, n] without allocating in the render path on every keystroke.
  const lines = useMemo(
    () => Array.from({ length: lineCount }, (_, i) => i + 1),
    [lineCount],
  );
  return (
    <div className="ce-gutter" aria-hidden="true">
      {lines.map((n) => (
        <div key={n} className="ce-gutter-line">
          {n}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Helpers: line / indent operations on the raw value string
// ─────────────────────────────────────────────────────────────────────

interface LineRange {
  /** Index of first char of the first selected line. */
  firstLineStart: number;
  /** Index just past the last char of the last selected line. */
  lastLineEnd: number;
  /** Char index of the first \n at-or-after lastLineEnd, or value.length. */
  trailingBoundary: number;
}

function getSelectedLineRange(
  value: string,
  selStart: number,
  selEnd: number,
): LineRange {
  // Walk back to find the start of the line containing selStart.
  let firstLineStart = selStart;
  while (firstLineStart > 0 && value[firstLineStart - 1] !== "\n") {
    firstLineStart--;
  }
  // Walk forward from selEnd to find the end of the line containing it.
  let lastLineEnd = selEnd;
  // If selection ends right at a \n, treat the previous line as the last
  // selected one (mimics VS Code behavior: triple-click line = no trailing).
  if (lastLineEnd > selStart && value[lastLineEnd - 1] === "\n") {
    lastLineEnd--;
  }
  while (lastLineEnd < value.length && value[lastLineEnd] !== "\n") {
    lastLineEnd++;
  }
  return {
    firstLineStart,
    lastLineEnd,
    trailingBoundary: lastLineEnd,
  };
}

/** Returns the leading whitespace (spaces only) of the line containing pos. */
function leadingIndent(value: string, pos: number): string {
  // Find line start
  let lineStart = pos;
  while (lineStart > 0 && value[lineStart - 1] !== "\n") lineStart--;
  let i = lineStart;
  while (i < value.length && value[i] === " ") i++;
  return value.slice(lineStart, i);
}

/**
 * Apply a per-line transform across selStart..selEnd.
 * Returns the new value plus the new selection [start, end].
 */
function transformLines(
  value: string,
  selStart: number,
  selEnd: number,
  fn: (line: string) => string,
): { value: string; selStart: number; selEnd: number } {
  const range = getSelectedLineRange(value, selStart, selEnd);
  const before = value.slice(0, range.firstLineStart);
  const slice = value.slice(range.firstLineStart, range.lastLineEnd);
  const after = value.slice(range.lastLineEnd);

  const lines = slice.split("\n");
  const transformed = lines.map(fn).join("\n");

  const delta = transformed.length - slice.length;
  const newValue = before + transformed + after;

  // Naive selection re-mapping: shift end by delta, keep start at line beginning.
  return {
    value: newValue,
    selStart: range.firstLineStart,
    selEnd: range.lastLineEnd + delta,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(
  function CodeEditor(
    {
      value,
      onChange,
      language: _language, // reserved
      readOnly = false,
      lineNumbers = true,
      showBraceMatch = true,
      className = "",
      ariaLabel,
      placeholder,
      onEscape,
    },
    ref,
  ) {
    const taRef = useRef<HTMLTextAreaElement | null>(null);
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const reactId = useId();

    // Track caret pos for the brace matcher. We don't store every keystroke
    // in React state if brace-match is off (perf).
    const [caretPos, setCaretPos] = useState(0);

    useImperativeHandle(
      ref,
      () => ({
        focus: () => taRef.current?.focus(),
        getTextarea: () => taRef.current,
      }),
      [],
    );

    // Sync the highlight layer's scroll with the textarea's scroll so
    // colored text stays aligned when the editor scrolls.
    const onScroll = useCallback(() => {
      const ta = taRef.current;
      const wrap = wrapRef.current;
      if (!ta || !wrap) return;
      const pre = wrap.querySelector<HTMLPreElement>(".ce-highlight");
      const gutter = wrap.querySelector<HTMLDivElement>(".ce-gutter");
      if (pre) {
        pre.scrollTop = ta.scrollTop;
        pre.scrollLeft = ta.scrollLeft;
      }
      if (gutter) {
        gutter.scrollTop = ta.scrollTop;
      }
    }, []);

    // Run scroll-sync once after every keystroke so layout shifts don't
    // leave the highlight stale.
    useLayoutEffect(() => {
      onScroll();
    }, [value, onScroll]);

    // ── handlers ──────────────────────────────────────────────────
    const handleChange = useCallback(
      (e: ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
        setCaretPos(e.target.selectionStart);
      },
      [onChange],
    );

    const handleSelect = useCallback(() => {
      const ta = taRef.current;
      if (ta) setCaretPos(ta.selectionStart);
    }, []);

    /**
     * Insert text at the current selection, replacing it.
     * Then update caret to after the inserted text.
     */
    const insertAtCursor = useCallback(
      (insertion: string, selOffsetFromEnd = 0) => {
        const ta = taRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const next =
          value.slice(0, start) + insertion + value.slice(end);
        onChange(next);
        const newPos = start + insertion.length - selOffsetFromEnd;
        // Defer selection set to the next tick — React re-render must commit first.
        requestAnimationFrame(() => {
          if (taRef.current) {
            taRef.current.selectionStart = newPos;
            taRef.current.selectionEnd = newPos;
            setCaretPos(newPos);
          }
        });
      },
      [value, onChange],
    );

    const replaceRange = useCallback(
      (
        nextValue: string,
        nextSelStart: number,
        nextSelEnd: number,
      ) => {
        onChange(nextValue);
        requestAnimationFrame(() => {
          if (taRef.current) {
            taRef.current.selectionStart = nextSelStart;
            taRef.current.selectionEnd = nextSelEnd;
            setCaretPos(nextSelStart);
          }
        });
      },
      [onChange],
    );

    const handleKeyDown = useCallback(
      (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (readOnly) return;
        const ta = e.currentTarget;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const hasSelection = start !== end;

        // ── Esc: shift focus out (a11y) ─────────────────────────
        if (e.key === "Escape") {
          e.preventDefault();
          ta.blur();
          onEscape?.();
          return;
        }

        // ── Ctrl+/  →  toggle line comment ──────────────────────
        if ((e.ctrlKey || e.metaKey) && e.key === "/") {
          e.preventDefault();
          const result = transformLines(value, start, end, (line) => {
            const trimmed = line.trimStart();
            const indent = line.slice(0, line.length - trimmed.length);
            if (trimmed.startsWith("// ")) return indent + trimmed.slice(3);
            if (trimmed.startsWith("//")) return indent + trimmed.slice(2);
            // Skip pure-blank lines (don't comment them — VS Code parity).
            if (trimmed.length === 0) return line;
            return indent + "// " + trimmed;
          });
          replaceRange(result.value, result.selStart, result.selEnd);
          return;
        }

        // ── Ctrl+]  →  indent line(s) ───────────────────────────
        if ((e.ctrlKey || e.metaKey) && e.key === "]") {
          e.preventDefault();
          const result = transformLines(
            value,
            start,
            end,
            (line) => INDENT + line,
          );
          replaceRange(result.value, result.selStart, result.selEnd);
          return;
        }

        // ── Ctrl+[  →  outdent line(s) ──────────────────────────
        if ((e.ctrlKey || e.metaKey) && e.key === "[") {
          e.preventDefault();
          const result = transformLines(value, start, end, (line) => {
            // remove up to 4 leading spaces
            let i = 0;
            while (i < INDENT.length && line[i] === " ") i++;
            return line.slice(i);
          });
          replaceRange(result.value, result.selStart, result.selEnd);
          return;
        }

        // ── Tab / Shift+Tab ─────────────────────────────────────
        if (e.key === "Tab") {
          e.preventDefault();
          if (e.shiftKey) {
            // outdent (single line OR selection)
            const result = transformLines(value, start, end, (line) => {
              let i = 0;
              while (i < INDENT.length && line[i] === " ") i++;
              return line.slice(i);
            });
            replaceRange(result.value, result.selStart, result.selEnd);
          } else if (hasSelection) {
            // indent selection
            const result = transformLines(
              value,
              start,
              end,
              (line) => INDENT + line,
            );
            replaceRange(result.value, result.selStart, result.selEnd);
          } else {
            // single Tab → insert 4 spaces at cursor
            insertAtCursor(INDENT);
          }
          return;
        }

        // ── Enter: auto-indent to match previous line ───────────
        if (e.key === "Enter") {
          e.preventDefault();
          const indent = leadingIndent(value, start);
          // Open-brace bonus: if char immediately before caret is '{',
          // add one more level + place cursor on the indented blank line.
          const prevChar = start > 0 ? value[start - 1] : "";
          const nextChar = start < value.length ? value[start] : "";
          if (prevChar === "{" && nextChar === "}") {
            // Smart closer: produce
            //     {
            //         |
            //     }
            const insertion = "\n" + indent + INDENT + "\n" + indent;
            // Caret should land on the middle line, after the extra indent.
            const offsetFromEnd = ("\n" + indent).length;
            insertAtCursor(insertion, offsetFromEnd);
          } else if (prevChar === "{") {
            insertAtCursor("\n" + indent + INDENT);
          } else {
            insertAtCursor("\n" + indent);
          }
          return;
        }

        // (No other special keys — let the textarea handle Backspace,
        // arrow keys, selection, etc., natively.)
      },
      [value, readOnly, insertAtCursor, replaceRange, onEscape],
    );

    // ── derived ───────────────────────────────────────────────────
    const lineCount = useMemo(() => {
      // count newlines + 1
      let n = 1;
      for (let i = 0; i < value.length; i++) if (value[i] === "\n") n++;
      return n;
    }, [value]);

    const braceMatch = useBraceMatch(value, caretPos);
    const showBrace =
      showBraceMatch && braceMatch !== null && braceMatch.openPos !== -1;

    return (
      <div
        ref={wrapRef}
        className={`ce-root ${className}`}
        data-readonly={readOnly}
        data-line-numbers={lineNumbers}
      >
        {/* Component-scoped style. Tailwind v4 + utility classes are fine
            for layout; the stuff that MUST stay byte-aligned (font, padding,
            line-height) lives here so it cannot drift. */}
        <style>{CE_STYLES}</style>

        {lineNumbers && <LineGutter lineCount={lineCount} />}

        <div className="ce-content">
          <HighlightLayer
            code={value}
            braceOpen={showBrace ? braceMatch!.openPos : undefined}
            braceClose={
              showBrace && braceMatch!.matched
                ? braceMatch!.closePos
                : undefined
            }
            braceDepth={showBrace ? braceMatch!.depth : undefined}
            braceMatched={showBrace ? braceMatch!.matched : undefined}
          />

          <textarea
            ref={taRef}
            id={`ce-${reactId}`}
            className="ce-textarea"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onSelect={handleSelect}
            onScroll={onScroll}
            readOnly={readOnly}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            wrap="off"
            placeholder={placeholder}
            // a11y
            role="application"
            aria-label={ariaLabel}
            aria-multiline="true"
            aria-readonly={readOnly}
          />
        </div>
      </div>
    );
  },
);

// ─────────────────────────────────────────────────────────────────────
// Component-scoped CSS. Co-located so the byte-alignment between the
// textarea and the highlight pre cannot accidentally drift.
//
// Theme tokens (--bg-*, --text-*, --accent-*, --brace-d*) are expected
// to be defined globally by UX-M01. Reasonable fallbacks are baked in
// so this component renders correctly even if loaded standalone (e.g.
// in stories before theme.css is imported).
// ─────────────────────────────────────────────────────────────────────

const CE_STYLES = `
.ce-root {
  display: grid;
  grid-template-columns: auto 1fr;
  background: var(--bg-1, #161b22);
  color: var(--text-0, #e6edf3);
  font-family: var(--font-mono, "JetBrains Mono", "Fira Code", ui-monospace,
               SFMono-Regular, Menlo, Consolas, monospace);
  font-size: 14px;
  line-height: 1.55;
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  overflow: hidden;
  min-height: 8rem;
}
.ce-root[data-line-numbers="false"] { grid-template-columns: 1fr; }

.ce-gutter {
  background: var(--bg-0, #0d1117);
  color: var(--text-2, #6e7681);
  padding: 12px 8px 12px 12px;
  text-align: right;
  user-select: none;
  border-right: 1px solid var(--border-1, #30363d);
  overflow: hidden;
  min-width: 2.5rem;
}
.ce-gutter-line { white-space: pre; }

.ce-content { position: relative; min-height: 6rem; }

.ce-highlight,
.ce-textarea {
  /* These properties MUST be identical in both layers. */
  margin: 0;
  padding: 12px 16px;
  font: inherit;
  line-height: inherit;
  letter-spacing: 0;
  tab-size: 4;
  white-space: pre;
  word-wrap: normal;
  overflow-wrap: normal;
  border: 0;
  outline: 0;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 6rem;
}

.ce-highlight {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: auto;
  background: transparent;
  /* Hide scrollbars; the textarea owns scrolling. */
  scrollbar-width: none;
}
.ce-highlight::-webkit-scrollbar { display: none; }

.ce-textarea {
  position: relative;
  background: transparent;
  color: transparent;            /* glyphs come from the pre underneath */
  caret-color: var(--text-0, #e6edf3);
  resize: none;
  overflow: auto;
}
.ce-textarea::selection {
  background: var(--bg-3, #2d333b);
  color: transparent;
}
.ce-textarea::placeholder {
  color: var(--text-2, #6e7681);
}
.ce-textarea:focus {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: -2px;
}

/* Token colors — matched to theme palette (VSCode Dark+ + Dracula). */
.ce-tok-keyword     { color: var(--accent-cyan, #79c0ff); }
.ce-tok-identifier  { color: var(--text-0, #e6edf3); }
.ce-tok-string      { color: var(--accent-grn,  #7ee787); }
.ce-tok-number      { color: var(--accent-org,  #ffa657); }
.ce-tok-comment     { color: var(--text-2,      #6e7681); font-style: italic; }
.ce-tok-operator    { color: var(--accent-pink, #ff7b72); }
.ce-tok-punctuation { color: var(--text-1,      #8b949e); }
.ce-tok-ws          { color: inherit; }

/* Brace-match overlays. */
.ce-brace-match {
  background: rgba(121, 192, 255, 0.18);
  border-radius: 2px;
}
.ce-brace-mismatch {
  background: rgba(248, 81, 73, 0.30);
  border-radius: 2px;
  color: var(--state-err, #f85149) !important;
}
.ce-brace-d0 { color: var(--brace-d0, #ffd700) !important; }
.ce-brace-d1 { color: var(--brace-d1, #da70d6) !important; }
.ce-brace-d2 { color: var(--brace-d2, #87cefa) !important; }
`;
