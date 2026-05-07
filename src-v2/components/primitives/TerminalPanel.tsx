/**
 * TerminalPanel.tsx
 *
 * Simulated terminal primitive for cpp-t2 Option 4. Used by TraceCard and
 * AdversarialMockCard to render the visual output of a hand-traced program
 * WITHOUT actually executing any code.
 *
 * What is rendered (top to bottom)
 * --------------------------------
 *   $ <prompt>            <- top-of-shell line
 *   <stdoutLines[0]>      <- cout output line
 *   <stdoutLines[1]>
 *   ...
 *   <stdinPrompts[0]>     <- "label: " injected by app, e.g. "Enter age: "
 *     [_]                  <- blinking cursor showing student is mid-input
 *   ...
 *   <exit code badge>     <- green "exit 0" or red "exit N"
 *
 * Stdout and stdin lines are interleaved in DOM order: the parent gives us
 * `stdoutLines` (cumulative cout history) and `stdinPrompts` (cumulative cin
 * prompts). Each new prompt is followed by an editable input until the
 * student presses Enter, which calls `onStdinSubmit(value)`.
 *
 * Accessibility
 * -------------
 * - aria-live="polite" so newly appended cout lines are announced.
 * - aria-label on the input identifies which prompt it answers.
 * - Tab navigates: stdin input -> exit code (if focusable).
 *
 * Visual
 * ------
 * - Monospace font, --bg-0 background, --text-0 default text.
 * - cout output: --text-0 (default).
 * - cin prompt label: --text-1.
 * - student typed text: --accent-grn.
 * - exit 0: green; exit !=0: --accent-pink.
 */

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';

export interface TerminalPanelProps {
  /** Lines printed by `cout` so far. */
  stdoutLines: string[];
  /** Prompts shown before each `cin` (in order). */
  stdinPrompts: string[];
  /**
   * History of stdin values the student has already submitted, parallel to
   * stdinPrompts. Length === stdinPrompts.length means all prompts answered;
   * length === stdinPrompts.length - 1 means the last prompt is awaiting input.
   */
  stdinValues?: string[];
  onStdinSubmit?: (value: string) => void;
  /** undefined => program still running, otherwise show exit code badge. */
  exitCode?: number;
  /** Shell prompt label. Default `student@cpp-t2:~/q1$`. */
  prompt?: string;
  /** Optional title above the terminal frame. */
  title?: string;
  /** Read-only mode disables stdin input. */
  readOnly?: boolean;
}

export function TerminalPanel({
  stdoutLines,
  stdinPrompts,
  stdinValues = [],
  onStdinSubmit,
  exitCode,
  prompt = 'student@cpp-t2:~/q1$',
  title,
  readOnly = false,
}: TerminalPanelProps) {
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // The pending prompt is the first prompt without a corresponding value.
  const pendingPromptIndex =
    stdinValues.length < stdinPrompts.length ? stdinValues.length : -1;
  const pendingPrompt =
    pendingPromptIndex >= 0 ? stdinPrompts[pendingPromptIndex] : null;

  // Focus the input when a new pending prompt appears.
  useEffect(() => {
    if (pendingPrompt !== null && !readOnly) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [pendingPrompt, readOnly]);

  // Auto-scroll to the bottom on any update.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [stdoutLines, stdinPrompts, stdinValues, exitCode]);

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!onStdinSubmit) return;
      onStdinSubmit(draft);
      setDraft('');
    }
  };

  const exitBadgeClass =
    exitCode === undefined
      ? 'tp-badge tp-badge--running'
      : exitCode === 0
      ? 'tp-badge tp-badge--ok'
      : 'tp-badge tp-badge--err';

  const exitLabel =
    exitCode === undefined ? 'running…' : `exit ${exitCode}`;

  return (
    <section className="tp" aria-label={title ?? 'simulated terminal'}>
      <header className="tp-header">
        <span className="tp-dots" aria-hidden="true">
          <span className="tp-dot tp-dot--r" />
          <span className="tp-dot tp-dot--y" />
          <span className="tp-dot tp-dot--g" />
        </span>
        <span className="tp-title">{title ?? 'terminal'}</span>
        <span className={exitBadgeClass} aria-live="polite">
          {exitLabel}
        </span>
      </header>

      <div
        className="tp-body"
        ref={scrollRef}
        aria-live="polite"
        aria-label="terminal output"
      >
        <div className="tp-line tp-line--prompt">
          <span className="tp-shell">$</span>
          <span className="tp-prompt">{prompt}</span>
        </div>

        {stdoutLines.map((line, i) => (
          <div key={`out-${i}`} className="tp-line tp-line--out">
            {line === '' ? ' ' : line}
          </div>
        ))}

        {stdinPrompts.map((p, i) => {
          const value = stdinValues[i];
          if (value !== undefined) {
            // Already-answered prompt: render `prompt + typed value`.
            return (
              <div key={`in-${i}`} className="tp-line tp-line--in">
                <span className="tp-cin-prompt">{p}</span>
                <span className="tp-cin-value">{value}</span>
              </div>
            );
          }
          if (i === pendingPromptIndex) {
            // Pending prompt: render input with blinking cursor placeholder.
            return (
              <div key={`in-${i}`} className="tp-line tp-line--in tp-line--active">
                <label className="tp-cin-prompt" htmlFor={`tp-stdin-${i}`}>
                  {p}
                </label>
                <input
                  id={`tp-stdin-${i}`}
                  ref={inputRef}
                  type="text"
                  className="tp-cin-input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKey}
                  disabled={readOnly}
                  spellCheck={false}
                  autoComplete="off"
                  aria-label={`stdin for: ${p.trim() || 'cin prompt'}`}
                  placeholder=""
                />
                <span
                  className={readOnly ? 'tp-cursor tp-cursor--off' : 'tp-cursor'}
                  aria-hidden="true"
                >
                  ▍
                </span>
              </div>
            );
          }
          return null;
        })}
      </div>

      <style>{`
        .tp {
          display: flex;
          flex-direction: column;
          background: var(--bg-0, var(--color-bg, #0d1117));
          border: 1px solid var(--border-1, var(--color-border, #30363d));
          border-radius: 6px;
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          color: var(--text-0, var(--color-text, #e6edf3));
          overflow: hidden;
          font-size: 12px;
        }
        .tp-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 5px 10px;
          background: var(--bg-1, var(--color-bg-card, #161b22));
          border-bottom: 1px solid var(--border-1, #30363d);
          font-size: 11px;
        }
        .tp-dots { display: flex; gap: 4px; }
        .tp-dot {
          width: 9px; height: 9px; border-radius: 50%;
          opacity: 0.7;
        }
        .tp-dot--r { background: #ff7b72; }
        .tp-dot--y { background: #ffd60a; }
        .tp-dot--g { background: #7ee787; }
        .tp-title {
          color: var(--text-1, var(--color-text-mute, #8b949e));
          letter-spacing: 0.05em;
          flex: 1;
        }
        .tp-badge {
          font-size: 10px;
          padding: 1px 6px;
          border-radius: 3px;
          font-family: inherit;
          letter-spacing: 0.04em;
        }
        .tp-badge--running {
          background: rgba(255, 214, 10, 0.1);
          color: var(--color-warning, #ffd60a);
          border: 1px solid var(--color-warning, #ffd60a);
        }
        .tp-badge--ok {
          background: rgba(126, 231, 135, 0.1);
          color: var(--accent-grn, var(--color-accent, #7ee787));
          border: 1px solid var(--accent-grn, #7ee787);
        }
        .tp-badge--err {
          background: rgba(255, 123, 114, 0.1);
          color: var(--accent-pink, var(--color-danger, #ff7b72));
          border: 1px solid var(--accent-pink, #ff7b72);
        }
        .tp-body {
          padding: 8px 10px;
          min-height: 80px;
          max-height: 320px;
          overflow-y: auto;
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .tp-line {
          display: flex;
          align-items: baseline;
          gap: 6px;
          min-height: 1.5em;
        }
        .tp-line--prompt {
          color: var(--text-1, #8b949e);
          margin-bottom: 2px;
        }
        .tp-shell {
          color: var(--accent-cyan, #79c0ff);
          font-weight: 600;
        }
        .tp-prompt {
          color: var(--text-1, #8b949e);
        }
        .tp-line--out {
          color: var(--text-0, #e6edf3);
          display: block;
        }
        .tp-cin-prompt {
          color: var(--text-1, #8b949e);
          flex-shrink: 0;
        }
        .tp-cin-value {
          color: var(--accent-grn, #7ee787);
          font-weight: 600;
        }
        .tp-cin-input {
          background: transparent;
          border: none;
          color: var(--accent-grn, #7ee787);
          font-family: inherit;
          font-size: inherit;
          padding: 0;
          outline: none;
          flex: 1;
          min-width: 60px;
          font-weight: 600;
        }
        .tp-cin-input:focus-visible {
          outline: none;
        }
        .tp-cin-input:disabled {
          opacity: 0.5;
        }
        .tp-cursor {
          color: var(--accent-grn, #7ee787);
          animation: tp-blink 1s steps(2, start) infinite;
        }
        .tp-cursor--off {
          animation: none;
          opacity: 0.3;
        }
        @keyframes tp-blink {
          to { visibility: hidden; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tp-cursor { animation: none; opacity: 0.7; }
        }
      `}</style>
    </section>
  );
}

export default TerminalPanel;
