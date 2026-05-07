/**
 * TraceCard.tsx
 *
 * The Q1 hand-execute card — the backbone of the C++T2 deck.
 *
 * Layout (3-pane code editor: editor + variables panel + terminal):
 * ─────────────────────────────────────────────────────────────────────
 *   ┌──── Header ──────────────────────────────────────────────────────┐
 *   │  stem ........................ atom-id  ......... confidence    │
 *   ├──────────────────────────────────────┬───────────────────────────┤
 *   │                                       │  Variables (interactive) │
 *   │                                       │  ─────────────────────── │
 *   │   CodeEditor (readOnly,               │  name  type  value scope │
 *   │   active line marked with ▶)          │  ...                     │
 *   │                                       ├───────────────────────────┤
 *   │                                       │  Terminal (typeable)     │
 *   │                                       │  $ student@cpp-t2:...    │
 *   │                                       │  > _                     │
 *   ├──────────────────────────────────────┴───────────────────────────┤
 *   │  [⏮ reset] [⏵ step] [⏩ run]                       [Submit]      │
 *   └──────────────────────────────────────────────────────────────────┘
 *
 * Step mode: Click [⏵ step] highlights the next line via `▶` marker.
 * Student must MANUALLY update the variables panel to advance the trace —
 * there is NO auto-execution. That is the entire point of the card type:
 * the student is the CPU.
 *
 * Run mode: same, but skips line highlighting (jumps to the end). Use when
 * the student wants to fill the whole panel up-front.
 *
 * On submit:
 *   - gradeTrace() compares the student's variables panel to expectedTrace
 *     (final value per variable) AND terminal lines (char-match w/ lenient
 *     normalize).
 *   - Per-variable green/red feedback + diff vs canonical terminal.
 *   - Must pass to advance — onComplete(true) only on full pass.
 *
 * Per RULE 4: TraceCard MUST be deterministic. There are no LLM calls,
 * no randomness, no side-effects.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';
import { CodeEditor } from '../primitives/CodeEditor';
import {
  VariablesPanel,
  type Variable,
  type VariableType,
} from '../primitives/VariablesPanel';
import { TerminalPanel } from '../primitives/TerminalPanel';
import {
  buildExpectedTrace,
  gradeTrace,
  type GradeResult,
} from '../../lib/grading-trace';
import type { TraceCard as TraceCardData } from '../../types/card-schema';

// ─────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────

export interface TraceCardProps {
  card: TraceCardData;
  /** Called once the student passes (must-pass-to-advance). */
  onComplete: (correct: boolean) => void;
}

const TYPE_DEFAULTS: Record<VariableType, string> = {
  int: '',
  double: '',
  string: '',
  bool: '',
  char: '',
  struct: '',
};

// ─────────────────────────────────────────────────────────────────────
// Helpers — code line manipulation for the active-line marker
// ─────────────────────────────────────────────────────────────────────

/**
 * Insert the active-line marker into the displayed code WITHOUT mutating
 * the underlying code value used by CodeEditor's tokenizer. We render the
 * marker via a separate gutter overlay (CSS) so the source stays clean.
 *
 * Right now we adopt a simpler approach: prefix the active line with `▶ `
 * inside a copy of the code that we hand to a read-only CodeEditor. The
 * underlying card.code is preserved for grading.
 */
function withActiveLineMarker(code: string, activeLine: number | null): string {
  if (activeLine === null || activeLine < 1) return code;
  const lines = code.split('\n');
  if (activeLine > lines.length) return code;
  // 1-indexed line numbers (matches the gutter)
  const idx = activeLine - 1;
  const original = lines[idx] ?? '';
  // Don't double-mark
  if (original.startsWith('▶ ')) return code;
  lines[idx] = `▶ ${original}`;
  return lines.join('\n');
}

/** Newline count + 1. */
function countLines(code: string): number {
  let n = 1;
  for (let i = 0; i < code.length; i++) if (code[i] === '\n') n++;
  return n;
}

/**
 * Generate a stable, non-cryptographic id for newly added panel rows.
 * Random is fine here — these IDs never leave session memory.
 */
function genId(): string {
  return `vp_${Math.random().toString(36).slice(2, 9)}`;
}

// ─────────────────────────────────────────────────────────────────────
// TraceCard
// ─────────────────────────────────────────────────────────────────────

export function TraceCard({ card, onComplete }: TraceCardProps) {
  // Build the canonical expected answer once per card.
  const expected = useMemo(() => buildExpectedTrace(card), [card]);
  const totalLines = useMemo(() => countLines(card.code), [card.code]);

  // ── Variables panel state ─────────────────────────────────────
  // Student starts with empty rows. They click "+ row" to add what they
  // think is in memory — the watch-table is INTERACTIVE.
  const [variables, setVariables] = useState<Variable[]>([]);

  // ── Terminal text the student is typing ───────────────────────
  const [terminalText, setTerminalText] = useState<string>('');

  // ── Step controls ─────────────────────────────────────────────
  /** activeLine===null  -> not stepping (initial / reset).
   *  activeLine===N      -> currently focused on line N.
   *  activeLine===-1     -> stepping has run past the end. */
  const [activeLine, setActiveLine] = useState<number | null>(null);

  // ── Confidence rating placeholder ─────────────────────────────
  const [confidence, setConfidence] = useState<number | null>(null);

  // ── Grade state ───────────────────────────────────────────────
  const [grade, setGrade] = useState<GradeResult | null>(null);

  // Reset state when card changes (loop into next card mid-mount).
  useEffect(() => {
    setVariables([]);
    setTerminalText('');
    setActiveLine(null);
    setConfidence(null);
    setGrade(null);
  }, [card.id]);

  // ── Variable panel handlers ───────────────────────────────────
  const onAddVar = useCallback(() => {
    setVariables((prev) => [
      ...prev,
      {
        id: genId(),
        name: '',
        type: 'int',
        value: TYPE_DEFAULTS.int,
        scope: 'local',
        history: [],
      },
    ]);
  }, []);

  const onUpdateVar = useCallback(
    (id: string, patch: Partial<Variable>) => {
      setVariables((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...patch } : v))
      );
    },
    []
  );

  const onRemoveVar = useCallback((id: string) => {
    setVariables((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const onReorderVar = useCallback((id: string, target: number) => {
    setVariables((prev) => {
      const i = prev.findIndex((v) => v.id === id);
      if (i < 0) return prev;
      const out = [...prev];
      const [moved] = out.splice(i, 1);
      if (!moved) return prev;
      out.splice(target, 0, moved);
      return out;
    });
  }, []);

  // ── Step controls ─────────────────────────────────────────────
  const onReset = useCallback(() => {
    setActiveLine(null);
    setVariables([]);
    setTerminalText('');
    setGrade(null);
  }, []);

  const onStep = useCallback(() => {
    setActiveLine((prev) => {
      if (prev === null) return 1;
      if (prev === -1) return -1;
      const next = prev + 1;
      if (next > totalLines) return -1;
      return next;
    });
  }, [totalLines]);

  const onRun = useCallback(() => {
    // "Run" = mark all lines as visited (no auto-mutation), highlight removed.
    setActiveLine(-1);
  }, []);

  // ── Submit / grade ────────────────────────────────────────────
  const onSubmit = useCallback(() => {
    const result = gradeTrace({ variables, terminalText }, expected);
    setGrade(result);
    if (result.pass) onComplete(true);
  }, [variables, terminalText, expected, onComplete]);

  // Try-again resets the grade view but keeps the student's draft.
  const onTryAgain = useCallback(() => setGrade(null), []);

  // ── Display code with active-line marker ──────────────────────
  const displayedCode = useMemo(
    () =>
      withActiveLineMarker(
        card.code,
        activeLine === -1 ? null : activeLine
      ),
    [card.code, activeLine]
  );

  // CodeEditor needs a noop onChange for read-only mode.
  const onCodeNoop = useCallback((_next: string) => {
    /* readOnly */
  }, []);

  // ── Layout style — keep the 3-pane proportions stable ─────────
  const layoutStyle: CSSProperties = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)',
      gridTemplateRows: 'auto 1fr auto',
      gridTemplateAreas: `
        "header   header"
        "code     panes"
        "footer   footer"
      `,
      gap: '12px',
      padding: '12px',
      width: '100%',
      maxWidth: '1280px',
      margin: '0 auto',
      minHeight: '560px',
    }),
    []
  );

  return (
    <section
      className="tc-root"
      role="application"
      aria-label={`Trace exercise — atom ${card.atomId}`}
      data-testid="trace-card"
      style={layoutStyle}
    >
      {/* ── Header ───────────────────────────────────────────── */}
      <header className="tc-header" style={{ gridArea: 'header' }}>
        <div className="tc-stem" aria-label="trace prompt">
          <span className="tc-stem-text">{card.stem}</span>
        </div>
        <div className="tc-meta">
          <span className="tc-atom-id" aria-label="atom id">
            {card.atomId}
          </span>
          <span className="tc-q-tags" aria-label="question tags">
            {card.qTags.join(' · ')}
          </span>
          <ConfidenceRating value={confidence} onChange={setConfidence} />
        </div>
      </header>

      {/* ── Left pane: code editor (read-only) ──────────────── */}
      <div
        className="tc-code-pane"
        style={{ gridArea: 'code', minHeight: 0, display: 'flex' }}
      >
        <CodeEditor
          value={displayedCode}
          onChange={onCodeNoop}
          language="cpp"
          readOnly={true}
          ariaLabel={
            activeLine && activeLine > 0
              ? `C++ trace, active line ${activeLine}`
              : 'C++ trace, code panel'
          }
        />
      </div>

      {/* ── Right column: variables (top) + terminal (bottom) ── */}
      <div
        className="tc-right-col"
        style={{
          gridArea: 'panes',
          display: 'grid',
          gridTemplateRows: 'minmax(0, 1.5fr) minmax(0, 1fr)',
          gap: '12px',
          minHeight: 0,
        }}
      >
        <div
          className="tc-vars-pane"
          style={{ minHeight: 0, overflow: 'auto' }}
          aria-label="variables panel"
        >
          <VariablesPanel
            variables={variables}
            onAdd={onAddVar}
            onUpdate={onUpdateVar}
            onRemove={onRemoveVar}
            onReorder={onReorderVar}
            title="memory (you fill this in)"
          />
        </div>

        <div
          className="tc-term-pane"
          style={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}
          aria-label="terminal panel"
        >
          <TraceTerminal
            value={terminalText}
            onChange={setTerminalText}
            readOnly={grade?.pass === true}
          />
        </div>
      </div>

      {/* ── Footer: step controls + Submit ────────────────────── */}
      <footer
        className="tc-footer"
        style={{
          gridArea: 'footer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          className="tc-step-controls"
          role="group"
          aria-label="step controls"
        >
          <button
            type="button"
            className="tc-btn tc-btn--ghost"
            onClick={onReset}
            aria-label="reset trace to initial state"
          >
            <span aria-hidden="true">⏮</span>
            <span className="tc-btn-label">reset</span>
          </button>
          <button
            type="button"
            className="tc-btn tc-btn--ghost"
            onClick={onStep}
            aria-label="step to next line"
            disabled={activeLine === -1}
          >
            <span aria-hidden="true">⏵</span>
            <span className="tc-btn-label">step</span>
            {activeLine !== null && activeLine > 0 && (
              <span className="tc-step-pos" aria-hidden="true">
                {activeLine}/{totalLines}
              </span>
            )}
          </button>
          <button
            type="button"
            className="tc-btn tc-btn--ghost"
            onClick={onRun}
            aria-label="run to end (skip line highlighting)"
          >
            <span aria-hidden="true">⏩</span>
            <span className="tc-btn-label">run</span>
          </button>
        </div>

        <div className="tc-submit-area">
          {grade && !grade.pass && (
            <button
              type="button"
              className="tc-btn tc-btn--ghost"
              onClick={onTryAgain}
              aria-label="dismiss feedback and try again"
            >
              try again
            </button>
          )}
          <button
            type="button"
            className="tc-btn tc-btn--primary"
            onClick={onSubmit}
            aria-label="submit trace for grading"
            disabled={grade?.pass === true}
          >
            {grade?.pass ? 'passed' : 'submit'}
          </button>
        </div>
      </footer>

      {/* ── Feedback overlay ─────────────────────────────────── */}
      {grade && (
        <FeedbackPanel
          grade={grade}
          onTryAgain={onTryAgain}
          teachMe={card.teachMe}
        />
      )}

      <style>{TC_STYLES}</style>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────

interface ConfidenceRatingProps {
  value: number | null;
  onChange: (v: number) => void;
}

/**
 * Confidence rating placeholder — 0..3 scale (none / low / med / high).
 * Real spec calls for a 4-stop predict-then-verify; this component
 * stores the value and emits it. The full ConfidenceCalibrationCard
 * pipeline lives elsewhere.
 */
function ConfidenceRating({ value, onChange }: ConfidenceRatingProps) {
  const stops = [
    { v: 0, label: '?', title: 'unsure' },
    { v: 1, label: '◔', title: 'low' },
    { v: 2, label: '◑', title: 'medium' },
    { v: 3, label: '●', title: 'high' },
  ];
  return (
    <div
      className="tc-conf"
      role="group"
      aria-label="confidence rating (placeholder)"
    >
      <span className="tc-conf-label">confidence:</span>
      {stops.map((s) => (
        <button
          key={s.v}
          type="button"
          className={`tc-conf-stop ${value === s.v ? 'is-active' : ''}`}
          onClick={() => onChange(s.v)}
          aria-label={`confidence ${s.title}`}
          aria-pressed={value === s.v}
          title={s.title}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

interface TraceTerminalProps {
  value: string;
  onChange: (next: string) => void;
  readOnly: boolean;
}

/**
 * The terminal pane is "writable" in trace mode — the student types the
 * stdout they predict the program will produce. We render the visual frame
 * via TerminalPanel and overlay an editable textarea below it for input.
 */
function TraceTerminal({ value, onChange, readOnly }: TraceTerminalProps) {
  const lines = value === '' ? [] : value.split(/\r\n?|\n/);
  // Drop a single trailing empty line so the live preview doesn't blink an empty row.
  if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();

  return (
    <div className="tc-term-wrap" aria-label="predicted terminal output">
      <TerminalPanel
        stdoutLines={lines}
        stdinPrompts={[]}
        title="predicted output"
        readOnly={true}
      />
      <label htmlFor="tc-term-input" className="tc-term-label">
        type the stdout you predict, one line per row
      </label>
      <textarea
        id="tc-term-input"
        className="tc-term-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        wrap="off"
        rows={3}
        placeholder="(no output expected — leave blank if so)"
        aria-label="terminal input — type predicted stdout"
        aria-multiline="true"
      />
    </div>
  );
}

interface FeedbackPanelProps {
  grade: GradeResult;
  onTryAgain: () => void;
  teachMe?: string | undefined;
}

function FeedbackPanel({ grade, onTryAgain, teachMe }: FeedbackPanelProps) {
  return (
    <div
      className={`tc-feedback ${grade.pass ? 'tc-feedback--ok' : 'tc-feedback--fail'}`}
      role="status"
      aria-live="polite"
    >
      <header className="tc-feedback-header">
        <strong>{grade.pass ? '✓ pass' : '✗ not yet'}</strong>
        {!grade.pass && (
          <button
            type="button"
            className="tc-btn tc-btn--ghost tc-btn--small"
            onClick={onTryAgain}
            aria-label="close feedback"
          >
            close
          </button>
        )}
      </header>

      <section className="tc-feedback-section">
        <h4>variables</h4>
        <ul className="tc-var-results">
          {grade.varResults.map((r) => (
            <li
              key={r.name}
              className={r.correct ? 'tc-var-ok' : 'tc-var-bad'}
            >
              <code>{r.name}</code>
              {r.correct ? (
                <span aria-label="correct"> ✓ {r.actual}</span>
              ) : r.missing ? (
                <span aria-label="missing">
                  {' '}
                  ✗ missing — expected <code>{r.expected}</code>
                </span>
              ) : (
                <span aria-label="incorrect">
                  {' '}
                  ✗ got <code>{r.actual || '""'}</code>, expected{' '}
                  <code>{r.expected}</code>
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="tc-feedback-section">
        <h4>terminal</h4>
        {grade.terminalCorrect ? (
          <p>
            <span aria-label="correct">✓ matches expected output</span>
          </p>
        ) : (
          <pre className="tc-term-diff" aria-label="terminal diff">
            {grade.terminalDiff || '(no diff)'}
          </pre>
        )}
      </section>

      {!grade.pass && teachMe && (
        <details className="tc-teach-me">
          <summary>teach me</summary>
          <pre className="tc-teach-me-body">{teachMe}</pre>
        </details>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Component-scoped CSS
// ─────────────────────────────────────────────────────────────────────

const TC_STYLES = `
.tc-root {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  color: var(--text-0, #e6edf3);
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
  position: relative;
}
.tc-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 4px;
  border-bottom: 1px solid var(--border-1, #30363d);
}
.tc-stem {
  flex: 1 1 320px;
  color: var(--text-0, #e6edf3);
  font-size: 13px;
  line-height: 1.45;
  white-space: pre-wrap;
}
.tc-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: var(--text-1, #8b949e);
  flex-wrap: wrap;
}
.tc-atom-id {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 3px;
  padding: 2px 6px;
  color: var(--accent-cyan, #79c0ff);
  letter-spacing: 0.05em;
}
.tc-q-tags {
  color: var(--accent-org, #ffa657);
  letter-spacing: 0.05em;
}
.tc-conf {
  display: flex;
  align-items: center;
  gap: 4px;
}
.tc-conf-label {
  font-size: 10px;
  color: var(--text-2, #6e7681);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.tc-conf-stop {
  width: 22px;
  height: 22px;
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  color: var(--text-2, #6e7681);
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  padding: 0;
  font-family: inherit;
}
.tc-conf-stop:hover { color: var(--accent-cyan, #79c0ff); }
.tc-conf-stop.is-active {
  background: rgba(121,192,255,0.12);
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--accent-cyan, #79c0ff);
}
.tc-conf-stop:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 1px;
}

.tc-step-controls,
.tc-submit-area {
  display: flex;
  align-items: center;
  gap: 8px;
}
.tc-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  color: var(--text-0, #e6edf3);
  font-family: inherit;
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  letter-spacing: 0.02em;
}
.tc-btn:hover:not(:disabled) {
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--accent-cyan, #79c0ff);
}
.tc-btn:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.tc-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.tc-btn--primary {
  background: var(--accent-cyan, #79c0ff);
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  font-weight: 600;
}
.tc-btn--primary:hover:not(:disabled) {
  background: var(--accent-grn, #7ee787);
  border-color: var(--accent-grn, #7ee787);
  color: var(--bg-0, #0d1117);
}
.tc-btn--ghost {
  background: transparent;
}
.tc-btn--small { font-size: 10px; padding: 3px 8px; }
.tc-btn-label { letter-spacing: 0.04em; }
.tc-step-pos {
  font-size: 10px;
  color: var(--text-2, #6e7681);
  margin-left: 2px;
}

.tc-term-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
  height: 100%;
}
.tc-term-label {
  font-size: 10px;
  color: var(--text-2, #6e7681);
  text-transform: lowercase;
  letter-spacing: 0.05em;
}
.tc-term-input {
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  color: var(--accent-grn, #7ee787);
  font-family: inherit;
  font-size: 12px;
  padding: 6px 10px;
  resize: vertical;
  min-height: 56px;
  outline: 0;
  caret-color: var(--accent-grn, #7ee787);
}
.tc-term-input:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: -2px;
}

.tc-feedback {
  position: absolute;
  inset: auto 12px 12px 12px;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 12px 14px;
  font-size: 12px;
  z-index: 5;
  max-height: 60vh;
  overflow: auto;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
}
.tc-feedback--ok { border-color: var(--accent-grn, #7ee787); }
.tc-feedback--fail { border-color: var(--accent-pink, #ff7b72); }
.tc-feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
}
.tc-feedback--ok .tc-feedback-header strong { color: var(--accent-grn, #7ee787); }
.tc-feedback--fail .tc-feedback-header strong { color: var(--accent-pink, #ff7b72); }
.tc-feedback-section {
  border-top: 1px dashed var(--border-1, #30363d);
  padding-top: 8px;
  margin-top: 8px;
}
.tc-feedback-section h4 {
  font-size: 10px;
  margin: 0 0 6px 0;
  color: var(--text-2, #6e7681);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}
.tc-var-results {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.tc-var-results code {
  background: var(--bg-2, #1f2937);
  padding: 1px 5px;
  border-radius: 2px;
  color: var(--accent-cyan, #79c0ff);
}
.tc-var-ok { color: var(--accent-grn, #7ee787); }
.tc-var-bad { color: var(--accent-pink, #ff7b72); }
.tc-term-diff {
  margin: 0;
  padding: 8px;
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 3px;
  font-size: 11px;
  white-space: pre-wrap;
  color: var(--text-0, #e6edf3);
}
.tc-teach-me {
  margin-top: 10px;
  font-size: 11px;
  color: var(--text-1, #8b949e);
}
.tc-teach-me summary {
  cursor: pointer;
  color: var(--accent-cyan, #79c0ff);
}
.tc-teach-me-body {
  margin: 6px 0 0 0;
  padding: 8px;
  background: var(--bg-0, #0d1117);
  border-radius: 3px;
  white-space: pre-wrap;
}
`;

export default TraceCard;
