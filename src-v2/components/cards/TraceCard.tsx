/**
 * TraceCard.tsx — paper-sim hand-execute card.
 *
 * Q1 backbone of the SIT102 Test 2 deck. Replaces the old IDE-style
 * 3-pane layout (code + name/type/value/scope grid + terminal) with
 * a paper-format memory diagram (MemoryBoxes) beside the code panel.
 *
 * Visual model (matches source-data/tests/practice1_images/image2.jpeg):
 *
 *   ┌── Header — stem only (no atom-id / q-tags / confidence widget) ─┐
 *   ├──────────────────────────────────┬─────────────────────────────┤
 *   │                                   │                              │
 *   │   CodeEditor (read-only,         │   MemoryBoxes               │
 *   │   ▶ marks active line)            │   (paper-sim diagram)       │
 *   │                                   │                              │
 *   │                                   │   ─────────────              │
 *   │                                   │   Terminal                   │
 *   │                                   │   (predicted stdout)        │
 *   ├──────────────────────────────────┴─────────────────────────────┤
 *   │  [⏮ reset] [⏵ step] [⏩ run]                       [submit]      │
 *   └────────────────────────────────────────────────────────────────┘
 *
 * Paper-sim guarantees:
 *   - Variable boxes per scalar with strikethrough history.
 *   - Arrays render as horizontal indexed cells [0][1][2]...
 *   - Structs render as outer box containing nested field rows.
 *   - Pass-by-reference shown as `paramName ──→ callerName` note.
 *
 * Digital luxuries kept:
 *   - Active-line marker (▶) advances on [step].
 *   - Auto-grading on [submit] with diff feedback.
 *   - Try-again retries (no skip).
 *   - Lenient char-match grading via existing gradeTrace.
 *
 * The shape of memory (scalar vs array vs struct) is auto-derived
 * from `card.variables[]` + `card.code` parsing. Cards may override
 * via `card.varShapes`, `card.arrayInits`, `card.passByRef`.
 *
 * Per RULE 4: TraceCard MUST be deterministic. No LLM, no random,
 * no side-effects beyond the React state machine.
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
  MemoryBoxes,
  deriveShapes,
  type HistoryMap,
  type ArrayInitMap,
  type VarShape,
  type StructFieldShape,
  type PassByRefHint,
} from '../primitives/MemoryBoxes';
import {
  buildExpectedTrace,
  gradeTrace,
  type GradeResult,
} from '../../lib/grading-trace';
import {
  parseTraceCode,
  parseArrayInit,
  resolveSize,
} from '../../lib/trace-code-parser';
import type { Variable, VariableType } from '../primitives/VariablesPanel';
import type { TraceCard as TraceCardData } from '../../types/card-schema';

// ─────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────

export interface TraceCardProps {
  card: TraceCardData;
  /** Called once the student passes (must-pass-to-advance). */
  onComplete: (correct: boolean) => void;
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function withActiveLineMarker(code: string, activeLine: number | null): string {
  if (activeLine === null || activeLine < 1) return code;
  const lines = code.split('\n');
  if (activeLine > lines.length) return code;
  const idx = activeLine - 1;
  const original = lines[idx] ?? '';
  if (original.startsWith('▶ ')) return code;
  lines[idx] = `▶ ${original}`;
  return lines.join('\n');
}

function countLines(code: string): number {
  let n = 1;
  for (let i = 0; i < code.length; i++) if (code[i] === '\n') n++;
  return n;
}

/** Map MemoryBoxes HistoryMap → legacy Variable[] for gradeTrace. */
function historyToVariables(history: HistoryMap): Variable[] {
  const out: Variable[] = [];
  for (const [name, values] of Object.entries(history)) {
    if (!values || values.length === 0) continue;
    const past = values.slice(0, -1);
    const current = values[values.length - 1] ?? '';
    out.push({
      id: `mb_${name}`,
      name,
      type: 'int' as VariableType,   // type/scope are ignored by grader
      value: current,
      scope: 'local',
      history: past,
    });
  }
  return out;
}

/**
 * Auto-derive shapes + arrayInits + passByRef from card data + code.
 *
 * Priority (highest first):
 *   1. card.varShapes / card.arrayInits / card.passByRef (explicit)
 *   2. Parsed struct + decl from code
 *   3. Heuristic from variables[] notation (deriveShapes)
 */
interface AutoDerived {
  shapes: VarShape[];
  arrayInits: ArrayInitMap;
  passByRef: PassByRefHint | undefined;
}

function autoDerive(card: TraceCardData): AutoDerived {
  // Start with parsed code.
  const parsed = parseTraceCode(card.code);

  // 1. Pass-by-ref (explicit overrides parser).
  const passByRef = card.passByRef ?? parsed.passByRef ?? undefined;

  // 2. Build a struct-type registry from struct definitions.
  //    e.g. "stat_double" → { numbers: array(SIZE), mystery: scalar }
  const structTypeMap = new Map<string, StructFieldShape[]>();
  for (const def of parsed.structDefs) {
    const fields: StructFieldShape[] = def.fields.map((f) => {
      if (f.kind === 'array') {
        const size = f.sizeRef
          ? resolveSize(f.sizeRef, parsed.sizeConsts) ?? 5
          : 5;
        return { name: f.name, kind: 'array', size, cppType: f.cppType };
      }
      return { name: f.name, kind: 'scalar', cppType: f.cppType };
    });
    structTypeMap.set(def.name, fields);
  }

  // 3. Build varShapes:
  //    - For each declared variable whose type is a known struct, emit
  //      a struct shape using the struct fields.
  //    - For each unique base in card.variables, fall back to deriveShapes.
  let shapes: VarShape[] = [];
  if (card.varShapes && card.varShapes.length > 0) {
    shapes = card.varShapes;
  } else {
    // Struct-typed declarations → struct shapes.
    const structShapes: VarShape[] = [];
    for (const decl of parsed.varDecls) {
      const fields = structTypeMap.get(decl.cppType);
      if (fields) {
        structShapes.push({
          kind: 'struct',
          name: decl.name,
          structType: decl.cppType,
          fields,
        });
      }
    }
    // Auto-derive for the rest from variables[].
    const seenStructNames = new Set(structShapes.map((s) => s.name));
    const remainingVars = card.variables.filter((v) => {
      const dot = v.indexOf('.');
      const base = dot >= 0 ? v.slice(0, dot) : v;
      return !seenStructNames.has(base);
    });
    const derived = deriveShapes(remainingVars);
    shapes = [...structShapes, ...derived];
  }

  // 4. arrayInits — explicit overrides parser; parser inits via decls.
  const arrayInits: ArrayInitMap = {};
  if (card.arrayInits) {
    for (const ai of card.arrayInits) arrayInits[ai.name] = ai.values;
  } else {
    // Parse struct-with-array initializers like:
    //   stat_double d = { {-20.0, 3.2, 1.9, -1.5, 1.3}, 0.0 };
    for (const decl of parsed.varDecls) {
      const fields = structTypeMap.get(decl.cppType);
      if (!fields || !decl.init) continue;
      const slots = parseArrayInit(decl.init);
      // Match slot order to field order.
      for (let i = 0; i < fields.length && i < slots.length; i++) {
        const f = fields[i];
        const s = slots[i];
        if (!f || s === undefined) continue;
        if (f.kind === 'array') {
          const cells = parseArrayInit(s);
          if (cells.length > 0) {
            arrayInits[`${decl.name}.${f.name}`] = cells;
          }
        }
      }
    }
  }

  return { shapes, arrayInits, passByRef };
}

// ─────────────────────────────────────────────────────────────────────
// TraceCard
// ─────────────────────────────────────────────────────────────────────

export function TraceCard({ card, onComplete }: TraceCardProps) {
  const expected = useMemo(() => buildExpectedTrace(card), [card]);
  const totalLines = useMemo(() => countLines(card.code), [card.code]);
  const derived = useMemo(() => autoDerive(card), [card]);

  // Student's memory state — keyed by variable path.
  const [history, setHistory] = useState<HistoryMap>({});

  // Terminal predicted stdout text.
  const [terminalText, setTerminalText] = useState<string>('');

  // Active line for the ▶ marker. null = not stepping yet, -1 = past end.
  const [activeLine, setActiveLine] = useState<number | null>(null);

  // Grade state.
  const [grade, setGrade] = useState<GradeResult | null>(null);

  // Reset when card changes.
  useEffect(() => {
    setHistory({});
    setTerminalText('');
    setActiveLine(null);
    setGrade(null);
  }, [card.id]);

  // ── Memory updaters ──────────────────────────────────────────────
  const onAddValue = useCallback((varPath: string, value: string) => {
    setHistory((prev) => ({
      ...prev,
      [varPath]: [...(prev[varPath] ?? []), value],
    }));
  }, []);

  // ── Step controls ────────────────────────────────────────────────
  const onReset = useCallback(() => {
    setActiveLine(null);
    setHistory({});
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
    setActiveLine(-1);
  }, []);

  // ── Submit / grade ───────────────────────────────────────────────
  const onSubmit = useCallback(() => {
    const variables = historyToVariables(history);
    const result = gradeTrace({ variables, terminalText }, expected);
    setGrade(result);
    if (result.pass) onComplete(true);
  }, [history, terminalText, expected, onComplete]);

  const onTryAgain = useCallback(() => setGrade(null), []);

  // ── Display code ────────────────────────────────────────────────
  const displayedCode = useMemo(
    () =>
      withActiveLineMarker(
        card.code,
        activeLine === -1 ? null : activeLine,
      ),
    [card.code, activeLine],
  );

  const onCodeNoop = useCallback((_next: string) => {
    /* readOnly */
  }, []);

  const layoutStyle: CSSProperties = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
      gridTemplateRows: 'auto 1fr auto',
      gridTemplateAreas: `
        "header   header"
        "code     panes"
        "footer   footer"
      `,
      gap: 12,
      padding: 12,
      width: '100%',
      maxWidth: 1280,
      margin: '0 auto',
      minHeight: 560,
    }),
    [],
  );

  return (
    <section
      className="tc-root"
      role="application"
      aria-label="trace exercise"
      data-testid="trace-card"
      style={layoutStyle}
    >
      {/* ── Header — stem only (paper-sim: no metadata clutter) ── */}
      <header className="tc-header" style={{ gridArea: 'header' }}>
        <div className="tc-stem" aria-label="trace prompt">
          {card.stem}
        </div>
      </header>

      {/* ── Left: code editor ────────────────────────────────── */}
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

      {/* ── Right: MemoryBoxes (top) + Terminal (bottom) ─────── */}
      <div
        className="tc-right-col"
        style={{
          gridArea: 'panes',
          display: 'grid',
          gridTemplateRows: 'minmax(0, 1.6fr) minmax(0, 1fr)',
          gap: 12,
          minHeight: 0,
        }}
      >
        <div
          className="tc-vars-pane"
          style={{ minHeight: 0, overflow: 'auto' }}
          aria-label="memory diagram"
        >
          <MemoryBoxes
            shapes={derived.shapes}
            history={history}
            arrayInits={derived.arrayInits}
            passByRef={derived.passByRef}
            editable={grade?.pass !== true}
            onAddValue={onAddValue}
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

      {/* ── Footer: step controls + submit ───────────────────── */}
      <footer
        className="tc-footer"
        style={{
          gridArea: 'footer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
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
// Sub-components — Terminal + Feedback
// ─────────────────────────────────────────────────────────────────────

interface TraceTerminalProps {
  value: string;
  onChange: (next: string) => void;
  readOnly: boolean;
}

function TraceTerminal({ value, onChange, readOnly }: TraceTerminalProps) {
  const lines = value === '' ? [] : value.split(/\r\n?|\n/);
  if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();

  return (
    <div className="tc-term-wrap" aria-label="predicted terminal output">
      <div className="tc-term-display" role="region" aria-label="output preview">
        <div className="tc-term-label">output</div>
        <pre className="tc-term-pre">
          {lines.length === 0 ? (
            <span className="tc-term-empty">(no output yet)</span>
          ) : (
            lines.map((line, i) => (
              <div key={i} className="tc-term-line">
                {line || ' '}
              </div>
            ))
          )}
        </pre>
      </div>
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
        placeholder="type predicted stdout here, one line per row"
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
  justify-content: flex-start;
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
.tc-btn--ghost { background: transparent; }
.tc-btn--small { font-size: 10px; padding: 3px 8px; }
.tc-btn-label { letter-spacing: 0.04em; }

.tc-term-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
  height: 100%;
}
.tc-term-display {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  padding: 8px 10px;
  flex: 1;
  min-height: 0;
}
.tc-term-label {
  font-size: 10px;
  color: var(--text-2, #6e7681);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}
.tc-term-pre {
  margin: 0;
  flex: 1;
  font-family: inherit;
  font-size: 12px;
  color: var(--accent-grn, #7ee787);
  white-space: pre-wrap;
  overflow: auto;
}
.tc-term-line {
  min-height: 16px;
}
.tc-term-empty {
  color: var(--text-2, #6e7681);
  font-style: italic;
}
.tc-term-input {
  background: var(--bg-0, #0d1117);
  border: 1px dashed var(--border-1, #30363d);
  border-radius: 3px;
  color: var(--text-0, #e6edf3);
  font-family: inherit;
  font-size: 12px;
  padding: 6px 10px;
  resize: vertical;
  min-height: 56px;
  outline: 0;
}
.tc-term-input:focus-visible {
  border-style: solid;
  border-color: var(--accent-cyan, #79c0ff);
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
