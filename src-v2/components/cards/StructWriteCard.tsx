/**
 * StructWriteCard.tsx
 *
 * Q2 highest-frequency-correct card type.
 *
 * Layout:
 *   ┌───────────────────────────┬──────────────────────────────────────┐
 *   │ Left 40%  read-only       │ Right 60%  CodeEditor (writable)     │
 *   │   • English entity prompt │   • header: "struct" + brace counter │
 *   │   • field bullet list     │   • monospace + syntax highlight     │
 *   │   • optional skeleton     │   • aria-label on textarea           │
 *   └───────────────────────────┴──────────────────────────────────────┘
 *
 * Stage-1 hint: when `card.notes` includes "stage:1" we render the
 *   `struct ___ { ___; };` skeleton above the editor for the first
 *   1-2 cards in a session, then it disappears for blank-page recall.
 *
 * Submit pipeline (lib/grading-write.ts):
 *   char-match + keyChecks + forbiddenTokens + brace-balance +
 *   semicolon-presence
 *
 * On grade: shows inline 3-column diff (your code | canonical | match?)
 * with pass/fail banner + targeted explanation per error kind.
 *
 * Per RULE 4 (Test-day frequency): Q2 must give CLEAN pass/fail with
 * EDUCATIONAL feedback — never just "wrong, try again."
 */

import { useCallback, useId, useMemo, useRef, useState } from 'react';
import { CodeEditor, type CodeEditorHandle } from '../primitives/CodeEditor';
import {
  gradeWrite,
  type WriteGradeResult,
  type WriteError,
} from '../../lib/grading-write';
import type { StructWriteCard as StructWriteCardData } from '../../types/card-schema';

export interface StructWriteCardProps {
  card: StructWriteCardData;
  onComplete: (correct: boolean) => void;
  /**
   * Optional: when true, render the Stage-1 skeleton hint above the editor.
   * Owner code (deck composer) sets this for the first 1-2 struct-write
   * cards of a session, then unsets it for blank-page recall.
   */
  showSkeleton?: boolean;
}

export function StructWriteCard({
  card,
  onComplete,
  showSkeleton = false,
}: StructWriteCardProps) {
  const [code, setCode] = useState('');
  const [grade, setGrade] = useState<WriteGradeResult | null>(null);
  const editorRef = useRef<CodeEditorHandle | null>(null);
  const liveRegionId = useId();
  const submitId = useId();

  // ── live brace counter (cheap O(n) scan) ─────────────────────────
  const braceCount = useMemo(() => {
    let opens = 0;
    let closes = 0;
    for (let i = 0; i < code.length; i++) {
      if (code[i] === '{') opens++;
      else if (code[i] === '}') closes++;
    }
    return { opens, closes, balanced: opens === closes };
  }, [code]);

  // ── derive the field list out of the schema for the prompt panel ─
  const fields = card.requiredFields ?? [];

  const handleSubmit = useCallback(() => {
    const result = gradeWrite(code, {
      canonicalAnswer: card.canonicalAnswer,
      keyChecks: card.keyChecks,
      forbiddenTokens: card.forbiddenTokens,
      requireSemicolon: true,
    });
    setGrade(result);
    // Notify the parent (sequence engine) once the user has submitted.
    onComplete(result.pass);
  }, [code, card, onComplete]);

  const handleRetry = useCallback(() => {
    setGrade(null);
    setCode('');
    requestAnimationFrame(() => editorRef.current?.focus());
  }, []);

  // ── derived: short headline for the grade banner ─────────────────
  const headline = grade
    ? grade.pass
      ? 'Pass'
      : grade.errors[0]?.message ?? 'Not quite — review the diff below.'
    : '';

  return (
    <div className="swc-root">
      <style>{SWC_STYLES}</style>

      <div className="swc-grid">
        {/* ─────────────────────── LEFT (40%) ─────────────────────── */}
        <section className="swc-prompt" aria-labelledby={`${submitId}-title`}>
          <header>
            <span className="swc-eyebrow">Q2 · struct write</span>
            <h2 id={`${submitId}-title`}>{card.stem}</h2>
          </header>

          <div className="swc-entity">
            <p>{card.prompt}</p>
            {fields.length > 0 && (
              <>
                <h3>Required fields</h3>
                <ul>
                  {fields.map((f) => (
                    <li key={f}>
                      <code>{f}</code>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {showSkeleton && (
            <div className="swc-hint" aria-label="Skeleton hint">
              <h3>Skeleton (Stage 1 only)</h3>
              <pre>
                <code>{`struct ___ {\n    ___;\n    ___;\n    ___;\n};`}</code>
              </pre>
              <p className="swc-hint-note">
                Replace each <code>___</code> with the right type + field name.
                You can also type from a blank page.
              </p>
            </div>
          )}
        </section>

        {/* ─────────────────────── RIGHT (60%) ────────────────────── */}
        <section className="swc-editor" aria-label="Your struct definition">
          <header className="swc-editor-header">
            <span className="swc-editor-title">struct.cpp</span>
            <span
              className={`swc-brace-counter${
                braceCount.balanced ? '' : ' swc-brace-counter--bad'
              }`}
              aria-label={`Braces: ${braceCount.opens} open, ${braceCount.closes} close`}
            >
              {`{ ${braceCount.opens} / } ${braceCount.closes}`}
            </span>
          </header>

          <CodeEditor
            ref={editorRef}
            value={code}
            onChange={setCode}
            language="cpp"
            ariaLabel={`Struct write editor — ${card.stem}`}
            placeholder="// Type the struct definition here…"
            readOnly={grade !== null}
          />

          <div className="swc-actions">
            {grade === null ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={code.trim().length === 0}
                className="swc-btn swc-btn--primary"
                aria-describedby={liveRegionId}
              >
                Submit
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRetry}
                className="swc-btn swc-btn--secondary"
              >
                Retry
              </button>
            )}
          </div>
        </section>
      </div>

      {/* ───────────────── Grade panel (a11y live region) ───────────── */}
      <div
        id={liveRegionId}
        className="swc-grade"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {grade && (
          <>
            <div
              className={`swc-banner${
                grade.pass ? ' swc-banner--pass' : ' swc-banner--fail'
              }`}
            >
              <strong>{grade.pass ? 'Pass' : 'Not yet'}</strong>
              <span className="swc-score">{grade.score}/100</span>
              <span className="swc-headline">{headline}</span>
            </div>

            {grade.errors.length > 0 && (
              <ul className="swc-errors">
                {grade.errors.map((e, i) => (
                  <li key={`${e.kind}-${i}`}>
                    <ErrorRow err={e} />
                  </li>
                ))}
              </ul>
            )}

            <DiffTable diff={grade.diff} />

            <details className="swc-explain">
              <summary>Why?</summary>
              <p>{card.explanation}</p>
            </details>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Inline subcomponents
// ─────────────────────────────────────────────────────────────────────

function ErrorRow({ err }: { err: WriteError }) {
  return (
    <span className="swc-error-row">
      <span className={`swc-tag swc-tag--${err.kind}`}>{labelForKind(err.kind)}</span>
      <span className="swc-error-msg">{err.message}</span>
      {err.line !== undefined && <span className="swc-line">line {err.line}</span>}
    </span>
  );
}

function labelForKind(k: WriteError['kind']): string {
  switch (k) {
    case 'brace-imbalance':
      return 'braces';
    case 'paren-imbalance':
      return 'parens';
    case 'bracket-imbalance':
      return 'brackets';
    case 'missing-semicolon':
      return 'semicolon';
    case 'forbidden-token':
      return 'forbidden';
    case 'missing-keycheck':
      return 'missing';
    case 'char-mismatch':
      return 'shape';
    case 'empty':
      return 'empty';
  }
}

interface DiffTableProps {
  diff: { line: number; studentLine: string; canonicalLine: string; match: boolean }[];
}

function DiffTable({ diff }: DiffTableProps) {
  return (
    <table className="swc-diff" aria-label="Per-line comparison">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Your code</th>
          <th scope="col">Canonical</th>
          <th scope="col" aria-label="Match">✓</th>
        </tr>
      </thead>
      <tbody>
        {diff.map((d) => (
          <tr key={d.line} className={d.match ? 'swc-diff-row--ok' : 'swc-diff-row--bad'}>
            <td>{d.line}</td>
            <td>
              <code>{d.studentLine || ' '}</code>
            </td>
            <td>
              <code>{d.canonicalLine || ' '}</code>
            </td>
            <td aria-label={d.match ? 'match' : 'differ'}>{d.match ? '✓' : '✗'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Component-scoped styles (token-driven so themes work)
// ─────────────────────────────────────────────────────────────────────

const SWC_STYLES = `
.swc-root {
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: var(--text-0, #e6edf3);
  font-family: var(--font-sans, system-ui, sans-serif);
}
.swc-grid {
  display: grid;
  grid-template-columns: 40% 60%;
  gap: 16px;
  align-items: stretch;
}
.swc-prompt {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.swc-prompt header { display: flex; flex-direction: column; gap: 4px; }
.swc-eyebrow {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-2, #6e7681);
}
.swc-prompt h2 {
  margin: 0;
  font-size: 18px;
  line-height: 1.35;
  color: var(--text-0, #e6edf3);
}
.swc-entity p {
  margin: 0 0 12px;
  line-height: 1.55;
  color: var(--text-1, #8b949e);
}
.swc-entity h3 {
  margin: 8px 0 6px;
  font-size: 12px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-2, #6e7681);
}
.swc-entity ul {
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.swc-entity code,
.swc-hint code {
  background: var(--bg-2, #21262d);
  padding: 1px 6px;
  border-radius: 3px;
  font-family: var(--font-mono, "JetBrains Mono", ui-monospace, monospace);
  font-size: 13px;
}
.swc-hint {
  margin-top: auto;
  border: 1px dashed var(--accent-cyan, #79c0ff);
  border-radius: 6px;
  padding: 12px;
  background: rgba(121, 192, 255, 0.04);
}
.swc-hint h3 {
  margin: 0 0 6px;
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--accent-cyan, #79c0ff);
}
.swc-hint pre {
  margin: 0;
  padding: 8px;
  background: var(--bg-0, #0d1117);
  border-radius: 4px;
  font-family: var(--font-mono, "JetBrains Mono", ui-monospace, monospace);
  font-size: 13px;
  white-space: pre;
  overflow-x: auto;
}
.swc-hint-note {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--text-2, #6e7681);
}
.swc-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.swc-editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-2, #21262d);
  border: 1px solid var(--border-1, #30363d);
  border-bottom: 0;
  border-radius: 6px 6px 0 0;
  padding: 6px 12px;
  font-family: var(--font-mono, "JetBrains Mono", ui-monospace, monospace);
  font-size: 12px;
  color: var(--text-1, #8b949e);
}
.swc-editor-title { font-weight: 600; }
.swc-brace-counter {
  font-variant-numeric: tabular-nums;
  color: var(--accent-cyan, #79c0ff);
}
.swc-brace-counter--bad { color: var(--state-err, #f85149); }
.swc-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}
.swc-btn {
  font: inherit;
  padding: 8px 18px;
  border-radius: 6px;
  border: 1px solid var(--border-1, #30363d);
  background: var(--bg-2, #21262d);
  color: var(--text-0, #e6edf3);
  cursor: pointer;
  transition: background 100ms ease-out, border-color 100ms ease-out;
}
.swc-btn:hover:not(:disabled) { background: var(--bg-3, #2d333b); }
.swc-btn:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.swc-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.swc-btn--primary {
  background: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  border-color: var(--accent-cyan, #79c0ff);
}
.swc-btn--primary:hover:not(:disabled) {
  background: #9dccff;
  border-color: #9dccff;
}
.swc-btn--secondary { background: var(--bg-2, #21262d); }

.swc-grade { display: flex; flex-direction: column; gap: 12px; }
.swc-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 6px;
  border: 1px solid var(--border-1, #30363d);
  background: var(--bg-1, #161b22);
}
.swc-banner--pass {
  border-color: var(--state-ok, #56d364);
  background: rgba(86, 211, 100, 0.08);
}
.swc-banner--fail {
  border-color: var(--state-err, #f85149);
  background: rgba(248, 81, 73, 0.08);
}
.swc-banner strong { font-size: 16px; }
.swc-banner--pass strong { color: var(--state-ok, #56d364); }
.swc-banner--fail strong { color: var(--state-err, #f85149); }
.swc-score {
  font-family: var(--font-mono, "JetBrains Mono", ui-monospace, monospace);
  font-size: 13px;
  color: var(--text-2, #6e7681);
  font-variant-numeric: tabular-nums;
}
.swc-headline { color: var(--text-1, #8b949e); font-size: 14px; }

.swc-errors {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.swc-error-row { display: inline-flex; align-items: center; gap: 10px; }
.swc-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 99px;
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-weight: 600;
  background: var(--bg-2, #21262d);
  color: var(--text-1, #8b949e);
}
.swc-tag--brace-imbalance,
.swc-tag--paren-imbalance,
.swc-tag--bracket-imbalance,
.swc-tag--missing-semicolon,
.swc-tag--forbidden-token,
.swc-tag--missing-keycheck,
.swc-tag--empty {
  background: rgba(248, 81, 73, 0.15);
  color: var(--state-err, #f85149);
}
.swc-tag--char-mismatch {
  background: rgba(255, 166, 87, 0.15);
  color: var(--accent-org, #ffa657);
}
.swc-error-msg { color: var(--text-0, #e6edf3); }
.swc-line {
  font-family: var(--font-mono, "JetBrains Mono", ui-monospace, monospace);
  font-size: 11px;
  color: var(--text-2, #6e7681);
}

.swc-diff {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-mono, "JetBrains Mono", ui-monospace, monospace);
  font-size: 13px;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  overflow: hidden;
}
.swc-diff thead {
  background: var(--bg-2, #21262d);
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-2, #6e7681);
}
.swc-diff th,
.swc-diff td {
  padding: 6px 10px;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid var(--border-1, #30363d);
}
.swc-diff th:first-child,
.swc-diff td:first-child { width: 28px; text-align: right; color: var(--text-2, #6e7681); }
.swc-diff th:last-child,
.swc-diff td:last-child { width: 28px; text-align: center; }
.swc-diff td code { white-space: pre; }
.swc-diff-row--ok td:last-child { color: var(--state-ok, #56d364); }
.swc-diff-row--bad td:last-child { color: var(--state-err, #f85149); }
.swc-diff-row--bad { background: rgba(248, 81, 73, 0.04); }

.swc-explain {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 8px 12px;
}
.swc-explain summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--text-0, #e6edf3);
}
.swc-explain p {
  margin: 8px 0 0;
  color: var(--text-1, #8b949e);
  line-height: 1.55;
}
`;
