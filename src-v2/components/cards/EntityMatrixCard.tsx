/**
 * EntityMatrixCard.tsx — RAVEN-style entity transfer.
 *
 * Layout: 3 worked struct examples (read-only, in a 3-up grid) above a
 * single editor where the student writes the 4th struct from prompt.
 * The student is expected to extract the SHAPE (PascalCase, semicolon
 * after closing brace, field order from English description) from the
 * three worked examples and apply it to the new entity.
 *
 *   ┌─────────┬─────────┬─────────┐
 *   │ ex 1    │ ex 2    │ ex 3    │   ← three worked examples
 *   │ struct  │ struct  │ struct  │
 *   │  ...    │  ...    │  ...    │
 *   └─────────┴─────────┴─────────┘
 *   ┌─────────────────────────────┐
 *   │  Prompt: "now do BookData…" │
 *   │  ┌───────────────────────┐  │
 *   │  │  CodeEditor (writable)│  │
 *   │  └───────────────────────┘  │
 *   │  [Submit]                   │
 *   └─────────────────────────────┘
 *
 * Schema:
 *   - examples : array of {label, text} where text === the C++ snippet.
 *   - prompt   : English description of the 4th entity.
 *   - canonicalAnswer : the canonical 4th struct.
 *
 * Grading: gradeWrite() with the card.keyChecks (always includes the
 * required field names + `};`).
 *
 * Per RULE 4: must-pass keyboard-only.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { CodeEditor, type CodeEditorHandle } from '../primitives/CodeEditor';
import { gradeWrite, type WriteGradeResult } from '../../lib/grading-write';
import type { EntityMatrixCard as EntityMatrixCardData } from '../../types/card-schema';

export interface EntityMatrixCardProps {
  card: EntityMatrixCardData;
  onComplete: (correct: boolean) => void;
}

export function EntityMatrixCard({ card, onComplete }: EntityMatrixCardProps) {
  const [code, setCode] = useState('');
  const [grade, setGrade] = useState<WriteGradeResult | null>(null);
  const editorRef = useRef<CodeEditorHandle | null>(null);

  useEffect(() => {
    setCode('');
    setGrade(null);
    requestAnimationFrame(() => editorRef.current?.focus());
  }, [card.id]);

  const handleSubmit = useCallback(() => {
    const result = gradeWrite(code, {
      canonicalAnswer: card.canonicalAnswer,
      keyChecks: card.keyChecks,
      forbiddenTokens: [],
      requireSemicolon: true,
    });
    setGrade(result);
    onComplete(result.pass);
  }, [code, card.canonicalAnswer, card.keyChecks, onComplete]);

  const handleRetry = useCallback(() => {
    setCode('');
    setGrade(null);
    requestAnimationFrame(() => editorRef.current?.focus());
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape' && grade && !grade.pass) {
        e.preventDefault();
        handleRetry();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSubmit, handleRetry, grade]);

  return (
    <section
      className="em-root"
      role="application"
      aria-label={`Entity matrix — atom ${card.atomId}`}
    >
      <style>{EM_STYLES}</style>

      <header className="em-header">
        <div>
          <span className="em-eyebrow">entity matrix · transfer</span>
          <h2 className="em-stem">{card.stem}</h2>
        </div>
        <div className="em-meta">
          <span className="em-atom">{card.atomId}</span>
          <span className="em-q">{card.qTags.join(' · ')}</span>
        </div>
      </header>

      <section
        className="em-examples"
        aria-label="three worked examples — extract the shape"
      >
        {card.examples.slice(0, 3).map((ex, i) => (
          <figure key={i} className="em-example" tabIndex={0}>
            <figcaption className="em-example-cap">
              <span className="em-example-num">{i + 1}</span>
              <span className="em-example-label">{ex.label}</span>
            </figcaption>
            <pre className="em-example-code">{ex.text}</pre>
          </figure>
        ))}
      </section>

      <section className="em-target" aria-label="now you do this one">
        <p className="em-prompt">
          <span className="em-prompt-eyebrow">your turn</span>
          <span>{card.prompt}</span>
        </p>

        <div className="em-editor">
          <CodeEditor
            ref={editorRef}
            value={code}
            onChange={setCode}
            language="cpp"
            ariaLabel="C++ struct editor — write the 4th entity here"
            showBraceMatch
            lineNumbers
            placeholder="struct ___ {  };"
          />
        </div>

        <div className="em-actions">
          <button
            type="button"
            className="em-btn em-btn--primary"
            onClick={handleSubmit}
            disabled={grade?.pass === true}
            aria-label="submit (Ctrl+Enter)"
          >
            {grade?.pass ? 'Passed' : 'Submit (Ctrl+Enter)'}
          </button>
          {grade && !grade.pass && (
            <button
              type="button"
              className="em-btn"
              onClick={handleRetry}
              aria-label="reset and try again (Esc)"
            >
              Try again (Esc)
            </button>
          )}
        </div>

        {grade && (
          <div
            className={`em-feedback ${grade.pass ? 'is-ok' : 'is-bad'}`}
            role="status"
            aria-live="polite"
          >
            <strong>
              {grade.pass
                ? `✓ pass · ${grade.score}/100`
                : `✗ not yet · ${grade.score}/100`}
            </strong>
            {!grade.pass && grade.errors[0] && (
              <p className="em-err">{grade.errors[0].message}</p>
            )}
            {!grade.pass && (
              <details className="em-explain">
                <summary>show canonical + explanation</summary>
                <pre className="em-canon">{card.canonicalAnswer}</pre>
                <p>{card.explanation}</p>
              </details>
            )}
          </div>
        )}
      </section>
    </section>
  );
}

const EM_STYLES = `
.em-root {
  font-family: var(--font-sans, system-ui, sans-serif);
  background: var(--bg-0, #0d1117);
  color: var(--text-0, #e6edf3);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 1280px;
  margin: 0 auto;
}
.em-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--border-1, #30363d);
  padding-bottom: 10px;
}
.em-eyebrow {
  display: inline-block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--accent-yel, #d2a8ff);
  font-weight: 700;
  margin-bottom: 4px;
}
.em-stem { margin: 0; font-size: 14px; line-height: 1.4; }
.em-meta { display: flex; gap: 8px; font-size: 11px; align-items: flex-start; }
.em-atom {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  padding: 2px 6px;
  border-radius: 3px;
  color: var(--accent-cyan, #79c0ff);
}
.em-q { color: var(--accent-org, #ffa657); padding: 2px 6px; }
.em-examples {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.em-example {
  margin: 0;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.em-example:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: -2px;
}
.em-example-cap {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}
.em-example-num {
  display: inline-flex;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  background: var(--bg-2, #1f2937);
  border-radius: 3px;
  color: var(--accent-yel, #d2a8ff);
  font-family: var(--font-mono, monospace);
  font-weight: 700;
}
.em-example-label {
  color: var(--text-1, #8b949e);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.em-example-code {
  margin: 0;
  padding: 8px 10px;
  background: var(--bg-0, #0d1117);
  border-radius: 3px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  color: var(--text-0, #e6edf3);
  overflow-x: auto;
}
.em-target {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.em-prompt {
  margin: 0;
  padding: 10px 12px;
  background: var(--bg-1, #161b22);
  border-left: 3px solid var(--accent-cyan, #79c0ff);
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  line-height: 1.5;
}
.em-prompt-eyebrow {
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--accent-cyan, #79c0ff);
  font-weight: 700;
}
.em-editor { display: flex; min-height: 200px; }
.em-editor > * { flex: 1; min-height: 0; }
.em-actions { display: flex; justify-content: flex-end; gap: 8px; }
.em-btn {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  color: var(--text-0, #e6edf3);
  padding: 6px 14px;
  border-radius: 4px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.em-btn:hover:not(:disabled) { border-color: var(--accent-cyan, #79c0ff); color: var(--accent-cyan, #79c0ff); }
.em-btn:focus-visible { outline: 2px solid var(--accent-cyan, #79c0ff); outline-offset: 2px; }
.em-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.em-btn--primary {
  background: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  border-color: var(--accent-cyan, #79c0ff);
  font-weight: 600;
}
.em-feedback {
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid var(--border-1, #30363d);
  background: var(--bg-1, #161b22);
}
.em-feedback.is-ok { border-color: var(--accent-grn, #7ee787); color: var(--accent-grn, #7ee787); }
.em-feedback.is-bad { border-color: var(--state-err, #f85149); color: var(--state-err, #f85149); }
.em-err { margin: 6px 0 0; }
.em-explain { margin-top: 8px; color: var(--text-1, #8b949e); }
.em-explain summary { cursor: pointer; color: var(--accent-cyan, #79c0ff); }
.em-canon {
  margin: 6px 0;
  padding: 8px;
  background: var(--bg-0, #0d1117);
  border-radius: 3px;
  font-family: var(--font-mono, monospace);
  font-size: 12px;
  white-space: pre-wrap;
  color: var(--accent-grn, #7ee787);
}
@media (max-width: 768px) {
  .em-examples { grid-template-columns: 1fr; }
}
`;

export default EntityMatrixCard;
