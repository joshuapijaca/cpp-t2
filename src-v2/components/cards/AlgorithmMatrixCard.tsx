/**
 * AlgorithmMatrixCard.tsx
 *
 * RAVEN-style transfer drill: the student studies TWO worked algorithm
 * traces (read-only) and then reproduces a THIRD novel-but-shape-matched
 * algorithm by writing its expected trace.
 *
 * Layout (3-pane vertical grid):
 *
 *   ┌─────────────────────────────────────────────────────────────────┐
 *   │ Header: "given two worked traces, complete the third" + atomId  │
 *   ├─────────────────────────────┬───────────────────────────────────┤
 *   │ Example A (worked, locked)  │ Example B (worked, locked)        │
 *   │   - read-only code panel    │   - read-only code panel          │
 *   │   - canonical final answer  │   - canonical final answer        │
 *   ├─────────────────────────────┴───────────────────────────────────┤
 *   │ Target (interactive):                                           │
 *   │   - prompt for the third algorithm                              │
 *   │   - student-input answer textarea                               │
 *   │   - [submit] runs char-match grade                              │
 *   └─────────────────────────────────────────────────────────────────┘
 *
 * Why we don't compose <TraceCard /> verbatim: the schema says examples
 * are MCQOption[] (label + text snippet, not full trace fixtures). We
 * therefore present the worked examples as labeled read-only code blocks,
 * mirroring the visual contract of a TraceCard's code pane without
 * dragging in the variables-panel and step-controls those examples don't
 * need. The TARGET pane is a write surface (textarea) whose grading uses
 * normalizeLenient char-match against `card.canonicalAnswer`.
 *
 * Per RULE 4: deterministic, offline grading, keyboard-only operable,
 * full aria coverage, and the matrix shows the EXACT pattern transfer
 * structure the student needs for Q1 RAVEN-shaped exam items.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';
import { CodeEditor } from '../primitives/CodeEditor';
import type { AlgorithmMatrixCard as AlgorithmMatrixCardData } from '../../types/card-schema';

// ─────────────────────────────────────────────────────────────────────
// Local grading: normalize-lenient char-match + per-keyCheck presence.
// ─────────────────────────────────────────────────────────────────────

function normalizeLenient(s: string): string {
  return s
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, '').replace(/[ \t]+/g, ' '))
    .join('\n')
    .trim();
}

interface MatrixGrade {
  pass: boolean;
  charMatch: boolean;
  keyCheckResults: { needle: string; ok: boolean }[];
  explanation: string;
}

function gradeMatrix(
  studentAnswer: string,
  card: AlgorithmMatrixCardData,
): MatrixGrade {
  const stuN = normalizeLenient(studentAnswer);
  const canN = normalizeLenient(card.canonicalAnswer);
  const charMatch = stuN === canN;

  const keyCheckResults = (card.keyChecks ?? []).map((needle) => ({
    needle,
    ok: stuN.includes(normalizeLenient(needle)),
  }));

  const allKeysOk = keyCheckResults.every((k) => k.ok);
  const pass = charMatch || (allKeysOk && stuN.length > 0);

  let explanation = '';
  if (pass && charMatch) {
    explanation = 'Exact match — pattern transfer locked in.';
  } else if (pass) {
    explanation =
      'All key checkpoints present. Transfer pattern recognised.';
  } else {
    const missing = keyCheckResults.filter((k) => !k.ok).map((k) => k.needle);
    if (missing.length > 0) {
      explanation = `Missing ${missing.length} key check${missing.length === 1 ? '' : 's'}: ${missing.slice(0, 3).join(', ')}.`;
    } else {
      explanation =
        'Surface match failed. Re-read the two worked examples and align the operator/loop shape.';
    }
  }
  return { pass, charMatch, keyCheckResults, explanation };
}

// ─────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────

export interface AlgorithmMatrixCardProps {
  card: AlgorithmMatrixCardData;
  onComplete: (correct: boolean) => void;
}

export function AlgorithmMatrixCard({
  card,
  onComplete,
}: AlgorithmMatrixCardProps) {
  const [studentAnswer, setStudentAnswer] = useState<string>('');
  const [grade, setGrade] = useState<MatrixGrade | null>(null);

  useEffect(() => {
    setStudentAnswer('');
    setGrade(null);
  }, [card.id]);

  const onSubmit = useCallback(() => {
    const result = gradeMatrix(studentAnswer, card);
    setGrade(result);
    if (result.pass) onComplete(true);
  }, [studentAnswer, card, onComplete]);

  const onTryAgain = useCallback(() => setGrade(null), []);

  const onCodeNoop = useCallback((_next: string) => {
    /* read-only */
  }, []);

  const onAnswerChange = useCallback((next: string) => {
    setStudentAnswer(next);
  }, []);

  // Submit on Ctrl/Cmd+Enter from anywhere inside the card.
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
    }
    window.addEventListener('keydown', handler as unknown as EventListener);
    return () =>
      window.removeEventListener(
        'keydown',
        handler as unknown as EventListener,
      );
  }, [onSubmit]);

  const layoutStyle: CSSProperties = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gridTemplateRows: 'auto auto auto',
      gridTemplateAreas: `
        "header header"
        "exa    exb"
        "target target"
      `,
      gap: 12,
      padding: 12,
      width: '100%',
      maxWidth: 1280,
      margin: '0 auto',
      minHeight: 640,
    }),
    [],
  );

  // Derive the two example cells (more allowed but we render in pairs).
  const examples = card.examples ?? [];
  const ex0 = examples[0];
  const ex1 = examples[1];

  return (
    <section
      className="amx-root"
      role="application"
      aria-label={`Algorithm matrix exercise — atom ${card.atomId}`}
      data-testid="algorithm-matrix-card"
      style={layoutStyle}
    >
      <header
        className="amx-header"
        style={{ gridArea: 'header' }}
        aria-label="prompt header"
      >
        <span className="amx-stem">{card.stem}</span>
        <span className="amx-meta">
          <span className="amx-atom-id">{card.atomId}</span>
          <span className="amx-q-tags">{card.qTags.join(' · ')}</span>
        </span>
      </header>

      <ExampleCell
        gridArea="exa"
        label={ex0?.label ?? 'A'}
        code={ex0?.text ?? '// no example A authored'}
        onCodeNoop={onCodeNoop}
      />
      <ExampleCell
        gridArea="exb"
        label={ex1?.label ?? 'B'}
        code={ex1?.text ?? '// no example B authored'}
        onCodeNoop={onCodeNoop}
      />

      <div
        className="amx-target"
        style={{ gridArea: 'target' }}
        role="region"
        aria-label="target algorithm"
      >
        <h3 className="amx-target-title">
          target — produce the third algorithm
        </h3>
        <p className="amx-target-prompt">{card.prompt}</p>
        <label htmlFor="amx-answer" className="amx-answer-label">
          your answer (Ctrl/Cmd+Enter to submit)
        </label>
        <textarea
          id="amx-answer"
          className="amx-answer"
          value={studentAnswer}
          onChange={(e) => onAnswerChange(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          rows={8}
          placeholder="// describe the algorithm, or write the code/trace"
          aria-label="target algorithm answer"
          readOnly={grade?.pass === true}
        />

        <div className="amx-footer">
          {grade && !grade.pass && (
            <button
              type="button"
              className="amx-btn amx-btn--ghost"
              onClick={onTryAgain}
              aria-label="dismiss feedback and try again"
            >
              try again
            </button>
          )}
          <button
            type="button"
            className="amx-btn amx-btn--primary"
            onClick={onSubmit}
            aria-label="submit target algorithm"
            disabled={grade?.pass === true || studentAnswer.trim() === ''}
          >
            {grade?.pass ? 'passed' : 'submit'}
          </button>
        </div>

        {grade && (
          <div
            className={`amx-feedback ${grade.pass ? 'amx-feedback--ok' : 'amx-feedback--fail'}`}
            role="status"
            aria-live="polite"
          >
            <strong>
              {grade.pass ? '✓ pass' : '✗ not yet'} —{' '}
              <span style={{ fontWeight: 400 }}>{grade.explanation}</span>
            </strong>
            {grade.keyCheckResults.length > 0 && (
              <ul className="amx-keychecks">
                {grade.keyCheckResults.map((k) => (
                  <li
                    key={k.needle}
                    className={k.ok ? 'amx-key-ok' : 'amx-key-bad'}
                  >
                    {k.ok ? '✓' : '✗'} <code>{k.needle}</code>
                  </li>
                ))}
              </ul>
            )}
            {!grade.pass && (
              <details className="amx-explanation">
                <summary>show worked answer</summary>
                <pre className="amx-canon">{card.canonicalAnswer}</pre>
                <p>{card.explanation}</p>
              </details>
            )}
          </div>
        )}
      </div>

      <style>{AMX_STYLES}</style>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────

interface ExampleCellProps {
  gridArea: string;
  label: string;
  code: string;
  onCodeNoop: (next: string) => void;
}

function ExampleCell({ gridArea, label, code, onCodeNoop }: ExampleCellProps) {
  return (
    <div
      className="amx-example"
      style={{ gridArea }}
      role="region"
      aria-label={`worked example ${label}`}
    >
      <header className="amx-example-header">
        <span className="amx-example-label">{label}</span>
        <span className="amx-example-tag">worked</span>
      </header>
      <CodeEditor
        value={code}
        onChange={onCodeNoop}
        language="cpp"
        readOnly={true}
        ariaLabel={`worked example ${label} code`}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Component-scoped CSS — uses theme tokens with fallbacks.
// ─────────────────────────────────────────────────────────────────────

const AMX_STYLES = `
.amx-root {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  color: var(--text-0, #e6edf3);
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
  position: relative;
}
.amx-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 4px;
  border-bottom: 1px solid var(--border-1, #30363d);
}
.amx-stem {
  flex: 1 1 320px;
  color: var(--text-0, #e6edf3);
  font-size: 13px;
  line-height: 1.45;
  white-space: pre-wrap;
}
.amx-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: var(--text-1, #8b949e);
}
.amx-atom-id {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 3px;
  padding: 2px 6px;
  color: var(--accent-cyan, #79c0ff);
  letter-spacing: 0.05em;
}
.amx-q-tags {
  color: var(--accent-org, #ffa657);
  letter-spacing: 0.05em;
}
.amx-example {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 8px;
  min-height: 240px;
}
.amx-example-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}
.amx-example-label {
  color: var(--accent-cyan, #79c0ff);
  font-weight: 600;
  letter-spacing: 0.06em;
}
.amx-example-tag {
  color: var(--text-2, #6e7681);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.amx-target {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--accent-cyan, #79c0ff);
  border-radius: 6px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.amx-target-title {
  margin: 0;
  font-size: 12px;
  color: var(--accent-cyan, #79c0ff);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.amx-target-prompt {
  margin: 0;
  color: var(--text-0, #e6edf3);
  font-size: 13px;
  line-height: 1.45;
}
.amx-answer-label {
  font-size: 10px;
  color: var(--text-2, #6e7681);
  text-transform: lowercase;
  letter-spacing: 0.05em;
}
.amx-answer {
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  color: var(--accent-grn, #7ee787);
  font-family: inherit;
  font-size: 12px;
  padding: 8px 10px;
  resize: vertical;
  min-height: 96px;
  outline: 0;
  caret-color: var(--accent-grn, #7ee787);
}
.amx-answer:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: -2px;
}
.amx-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.amx-btn {
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
.amx-btn:hover:not(:disabled) {
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--accent-cyan, #79c0ff);
}
.amx-btn:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.amx-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.amx-btn--primary {
  background: var(--accent-cyan, #79c0ff);
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  font-weight: 600;
}
.amx-btn--primary:hover:not(:disabled) {
  background: var(--accent-grn, #7ee787);
  border-color: var(--accent-grn, #7ee787);
}
.amx-btn--ghost { background: transparent; }

.amx-feedback {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 12px;
}
.amx-feedback--ok { border-color: var(--accent-grn, #7ee787); }
.amx-feedback--fail { border-color: var(--accent-pink, #ff7b72); }
.amx-keychecks {
  list-style: none;
  margin: 8px 0 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
}
.amx-keychecks code {
  background: var(--bg-0, #0d1117);
  padding: 1px 5px;
  border-radius: 2px;
  color: var(--accent-cyan, #79c0ff);
}
.amx-key-ok { color: var(--accent-grn, #7ee787); }
.amx-key-bad { color: var(--accent-pink, #ff7b72); }
.amx-explanation {
  margin-top: 8px;
  font-size: 11px;
  color: var(--text-1, #8b949e);
}
.amx-explanation summary {
  cursor: pointer;
  color: var(--accent-cyan, #79c0ff);
}
.amx-canon {
  margin: 6px 0;
  padding: 8px;
  background: var(--bg-0, #0d1117);
  border-radius: 3px;
  white-space: pre-wrap;
  color: var(--text-0, #e6edf3);
}
`;

export default AlgorithmMatrixCard;
