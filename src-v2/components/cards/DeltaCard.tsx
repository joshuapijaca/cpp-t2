/**
 * DeltaCard.tsx
 *
 * Active error correction. Shown after a wrong attempt: the student
 * sees a side-by-side diff (their attempt vs canonical), then types
 * the canonical version FROM SCRATCH in a fresh write surface.
 *
 * UX phases:
 *   STUDY-DIFF -> REWRITE -> GRADED
 *
 *   STUDY-DIFF: 2-column read-only diff annotated with line markers
 *               (=, +, -). Student presses [I see the diff] to advance.
 *   REWRITE:    blank textarea. Student types canonical answer
 *               from-scratch. submit grades.
 *   GRADED:     pass/fail with key-check breakdown.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────────────────────┐
 *   │ Header: stem + atom id                                           │
 *   ├────────────────────────┬─────────────────────────────────────────┤
 *   │ codeA  (your attempt)  │ codeB  (canonical)                      │
 *   │  read-only with -/+/=  │  read-only with =/+ markers             │
 *   ├────────────────────────┴─────────────────────────────────────────┤
 *   │ rewrite area (writable, becomes the active surface in REWRITE)   │
 *   ├──────────────────────────────────────────────────────────────────┤
 *   │ submit                                                           │
 *   └──────────────────────────────────────────────────────────────────┘
 *
 * Per RULE 4: deterministic diff (zip line-by-line, mark differing
 * lines), keyboard-only operable, full a11y on the diff and rewrite.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';
import type { DeltaCard as DeltaCardData } from '../../types/card-schema';

// ─────────────────────────────────────────────────────────────────────
// Diff helpers
// ─────────────────────────────────────────────────────────────────────

function normalizeLenient(s: string): string {
  return s
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, '').replace(/[ \t]+/g, ' '))
    .join('\n')
    .trim();
}

function normalizeLine(s: string): string {
  return s.replace(/[ \t]+$/g, '').replace(/[ \t]+/g, ' ').trim();
}

interface DiffLine {
  lineNumber: number;
  marker: '=' | '+' | '-';
  textA: string;
  textB: string;
}

function buildDiff(codeA: string, codeB: string): DiffLine[] {
  const linesA = codeA.split('\n');
  const linesB = codeB.split('\n');
  const max = Math.max(linesA.length, linesB.length);
  const out: DiffLine[] = [];
  for (let i = 0; i < max; i++) {
    const a = linesA[i] ?? '';
    const b = linesB[i] ?? '';
    const aN = normalizeLine(a);
    const bN = normalizeLine(b);
    let marker: '=' | '+' | '-' = '=';
    if (aN !== bN) {
      if (aN === '') marker = '+';
      else if (bN === '') marker = '-';
      else marker = '+'; // changed line — treat as B-side addition
    }
    out.push({
      lineNumber: i + 1,
      marker,
      textA: a,
      textB: b,
    });
  }
  return out;
}

interface DeltaGrade {
  pass: boolean;
  charMatch: boolean;
  keyCheckResults: { needle: string; ok: boolean }[];
  explanation: string;
}

function gradeDelta(rewrite: string, card: DeltaCardData): DeltaGrade {
  const stuN = normalizeLenient(rewrite);
  const canN = normalizeLenient(card.codeB);
  const charMatch = stuN === canN;
  const keyCheckResults = (card.keyChecks ?? []).map((needle) => ({
    needle,
    ok: stuN.includes(normalizeLenient(needle)),
  }));
  const allKeysOk =
    keyCheckResults.length > 0
      ? keyCheckResults.every((k) => k.ok)
      : charMatch;
  const pass = (charMatch || allKeysOk) && stuN.length > 0;
  const explanation = pass
    ? charMatch
      ? 'Char-perfect rewrite. Error pattern corrected.'
      : 'All required tokens present. Pattern absorbed.'
    : 'Rewrite still drifts from canonical — re-study the diff above.';
  return { pass, charMatch, keyCheckResults, explanation };
}

// ─────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────

export interface DeltaCardProps {
  card: DeltaCardData;
  onComplete: (correct: boolean) => void;
}

type Phase = 'STUDY-DIFF' | 'REWRITE' | 'GRADED';

// ─────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────

export function DeltaCard({ card, onComplete }: DeltaCardProps) {
  const [phase, setPhase] = useState<Phase>('STUDY-DIFF');
  const [rewrite, setRewrite] = useState<string>('');
  const [grade, setGrade] = useState<DeltaGrade | null>(null);

  const diffLines = useMemo(
    () => buildDiff(card.codeA, card.codeB),
    [card.codeA, card.codeB],
  );

  useEffect(() => {
    setPhase('STUDY-DIFF');
    setRewrite('');
    setGrade(null);
  }, [card.id]);

  const onIveSeenIt = useCallback(() => {
    setPhase('REWRITE');
  }, []);

  const onSubmit = useCallback(() => {
    const result = gradeDelta(rewrite, card);
    setGrade(result);
    setPhase('GRADED');
    if (result.pass) onComplete(true);
  }, [rewrite, card, onComplete]);

  const onRetry = useCallback(() => {
    setGrade(null);
    setPhase('REWRITE');
  }, []);

  const onBackToDiff = useCallback(() => {
    setGrade(null);
    setPhase('STUDY-DIFF');
  }, []);

  // Ctrl/Cmd+Enter advances/submits.
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (phase === 'STUDY-DIFF') onIveSeenIt();
        else if (phase === 'REWRITE') onSubmit();
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, onIveSeenIt, onSubmit]);

  const layoutStyle: CSSProperties = useMemo(
    () => ({
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      padding: 12,
      width: '100%',
      maxWidth: 1280,
      margin: '0 auto',
    }),
    [],
  );

  return (
    <section
      className="dlt-root"
      role="application"
      aria-label={`Delta rewrite — atom ${card.atomId}`}
      data-testid="delta-card"
      style={layoutStyle}
    >
      <header className="dlt-header">
        <div className="dlt-title-block">
          <span className="dlt-tag">delta</span>
          <span className="dlt-stem">{card.stem || card.prompt}</span>
        </div>
        <div className="dlt-meta">
          <span className="dlt-atom-id">{card.atomId}</span>
          <span className="dlt-q-tags">{card.qTags.join(' · ')}</span>
          <span className="dlt-phase">{phase}</span>
        </div>
      </header>

      <DiffPane diff={diffLines} />

      {phase === 'STUDY-DIFF' && (
        <div className="dlt-cta-row">
          <p className="dlt-prompt">{card.prompt}</p>
          <button
            type="button"
            className="dlt-btn dlt-btn--primary"
            onClick={onIveSeenIt}
            aria-label="acknowledge the diff and proceed to rewrite"
          >
            I see the diff — rewrite from scratch
          </button>
        </div>
      )}

      {(phase === 'REWRITE' || phase === 'GRADED') && (
        <div
          className="dlt-rewrite-pane"
          role="region"
          aria-label="rewrite from scratch"
        >
          <label htmlFor="dlt-rewrite" className="dlt-rewrite-label">
            type the canonical version from scratch (Ctrl/Cmd+Enter to submit)
          </label>
          <textarea
            id="dlt-rewrite"
            className="dlt-rewrite"
            value={rewrite}
            onChange={(e) => setRewrite(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            rows={10}
            placeholder="// rewrite the canonical answer here"
            aria-label="canonical rewrite"
            readOnly={grade?.pass === true}
          />
          <div className="dlt-footer">
            <button
              type="button"
              className="dlt-btn dlt-btn--ghost"
              onClick={onBackToDiff}
              aria-label="re-study the diff"
            >
              re-study diff
            </button>
            {grade && !grade.pass && (
              <button
                type="button"
                className="dlt-btn dlt-btn--ghost"
                onClick={onRetry}
                aria-label="dismiss feedback and try again"
              >
                try again
              </button>
            )}
            <button
              type="button"
              className="dlt-btn dlt-btn--primary"
              onClick={onSubmit}
              disabled={grade?.pass === true || rewrite.trim() === ''}
              aria-label="submit rewrite"
            >
              {grade?.pass ? 'passed' : 'submit rewrite'}
            </button>
          </div>
        </div>
      )}

      {grade && phase === 'GRADED' && (
        <div
          className={`dlt-feedback ${grade.pass ? 'dlt-feedback--ok' : 'dlt-feedback--fail'}`}
          role="status"
          aria-live="polite"
        >
          <strong>
            {grade.pass ? '✓ pass' : '✗ not yet'} — {grade.explanation}
          </strong>
          {grade.keyCheckResults.length > 0 && (
            <ul className="dlt-keychecks">
              {grade.keyCheckResults.map((k) => (
                <li
                  key={k.needle}
                  className={k.ok ? 'ok' : 'bad'}
                >
                  {k.ok ? '✓' : '✗'} <code>{k.needle}</code>
                </li>
              ))}
            </ul>
          )}
          {!grade.pass && (
            <details className="dlt-canon">
              <summary>show canonical (codeB)</summary>
              <pre>{card.codeB}</pre>
              <p>{card.explanation}</p>
            </details>
          )}
        </div>
      )}

      <style>{DLT_STYLES}</style>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────

function DiffPane({ diff }: { diff: DiffLine[] }) {
  return (
    <div
      className="dlt-diff"
      role="region"
      aria-label="side-by-side diff: your attempt vs canonical"
    >
      <div className="dlt-diff-headers">
        <span>your attempt</span>
        <span>canonical</span>
      </div>
      <div className="dlt-diff-body">
        {diff.map((d) => (
          <div
            key={d.lineNumber}
            className={`dlt-diff-row ${d.marker === '=' ? 'eq' : 'neq'}`}
          >
            <span className="dlt-diff-lineno">{d.lineNumber}</span>
            <span
              className={`dlt-diff-cell side-a ${d.marker === '=' ? '' : 'is-bad'}`}
              aria-label={`your attempt line ${d.lineNumber}`}
            >
              <span className="dlt-marker" aria-hidden="true">
                {d.marker === '=' ? '=' : '-'}
              </span>
              <code>{d.textA || ' '}</code>
            </span>
            <span
              className={`dlt-diff-cell side-b ${d.marker === '=' ? '' : 'is-good'}`}
              aria-label={`canonical line ${d.lineNumber}`}
            >
              <span className="dlt-marker" aria-hidden="true">
                {d.marker === '=' ? '=' : '+'}
              </span>
              <code>{d.textB || ' '}</code>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────

const DLT_STYLES = `
.dlt-root {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  color: var(--text-0, #e6edf3);
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
}
.dlt-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--border-1, #30363d);
  padding-bottom: 8px;
}
.dlt-title-block { display: flex; align-items: center; gap: 8px; flex: 1 1 360px; flex-wrap: wrap; }
.dlt-tag {
  background: rgba(121,192,255,0.12);
  color: var(--accent-cyan, #79c0ff);
  border: 1px solid var(--accent-cyan, #79c0ff);
  border-radius: 3px;
  padding: 2px 8px;
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.dlt-stem { font-size: 13px; line-height: 1.45; }
.dlt-meta { display: flex; gap: 10px; align-items: center; font-size: 11px; }
.dlt-atom-id {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 3px;
  padding: 2px 6px;
  color: var(--accent-cyan, #79c0ff);
  letter-spacing: 0.05em;
}
.dlt-q-tags { color: var(--accent-org, #ffa657); }
.dlt-phase {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-2, #484f58);
  border-radius: 3px;
  padding: 2px 6px;
  letter-spacing: 0.06em;
  color: var(--text-1, #8b949e);
}

.dlt-diff {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  overflow: auto;
  max-height: 360px;
}
.dlt-diff-headers {
  display: grid;
  grid-template-columns: 36px 1fr 1fr;
  gap: 0;
  background: var(--bg-2, #1f2937);
  border-bottom: 1px solid var(--border-1, #30363d);
  padding: 6px 0;
  font-size: 10px;
  color: var(--text-2, #6e7681);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.dlt-diff-headers span { padding: 0 10px; }
.dlt-diff-headers span:first-child { padding-left: 12px; }
.dlt-diff-body { display: flex; flex-direction: column; }
.dlt-diff-row {
  display: grid;
  grid-template-columns: 36px 1fr 1fr;
  font-size: 12px;
  border-top: 1px solid var(--bg-2, #1f2937);
}
.dlt-diff-row.neq { background: rgba(255,123,114,0.04); }
.dlt-diff-lineno {
  text-align: right;
  padding: 2px 8px;
  color: var(--text-2, #6e7681);
  font-size: 10px;
}
.dlt-diff-cell {
  padding: 2px 8px;
  display: flex;
  gap: 6px;
  white-space: pre;
  overflow: hidden;
}
.dlt-diff-cell.side-a { border-right: 1px dashed var(--border-1, #30363d); }
.dlt-diff-cell.is-bad { background: rgba(255,123,114,0.08); color: var(--accent-pink, #ff7b72); }
.dlt-diff-cell.is-good { background: rgba(126,231,135,0.08); color: var(--accent-grn, #7ee787); }
.dlt-marker { color: var(--text-2, #6e7681); font-size: 11px; min-width: 12px; text-align: center; }
.dlt-diff-cell code { font-family: inherit; }

.dlt-cta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 10px 12px;
  gap: 12px;
  flex-wrap: wrap;
}
.dlt-prompt { margin: 0; font-size: 12px; color: var(--text-0, #e6edf3); }

.dlt-rewrite-pane {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 10px;
}
.dlt-rewrite-label {
  font-size: 10px;
  color: var(--text-2, #6e7681);
  letter-spacing: 0.05em;
  text-transform: lowercase;
}
.dlt-rewrite {
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  color: var(--accent-grn, #7ee787);
  font-family: inherit;
  font-size: 12px;
  padding: 8px 10px;
  resize: vertical;
  min-height: 200px;
  outline: 0;
  caret-color: var(--accent-grn, #7ee787);
}
.dlt-rewrite:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: -2px;
}
.dlt-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.dlt-btn {
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
}
.dlt-btn:hover:not(:disabled) {
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--accent-cyan, #79c0ff);
}
.dlt-btn:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.dlt-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.dlt-btn--primary {
  background: var(--accent-cyan, #79c0ff);
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  font-weight: 600;
}
.dlt-btn--primary:hover:not(:disabled) {
  background: var(--accent-grn, #7ee787);
  border-color: var(--accent-grn, #7ee787);
}
.dlt-btn--ghost { background: transparent; }

.dlt-feedback {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 12px;
}
.dlt-feedback--ok { border-color: var(--accent-grn, #7ee787); }
.dlt-feedback--fail { border-color: var(--accent-pink, #ff7b72); }
.dlt-keychecks {
  list-style: none;
  margin: 6px 0 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
}
.dlt-keychecks .ok { color: var(--accent-grn, #7ee787); }
.dlt-keychecks .bad { color: var(--accent-pink, #ff7b72); }
.dlt-keychecks code {
  background: var(--bg-0, #0d1117);
  padding: 1px 5px;
  border-radius: 2px;
  color: var(--accent-cyan, #79c0ff);
}
.dlt-canon { margin-top: 6px; font-size: 11px; color: var(--text-1, #8b949e); }
.dlt-canon summary { cursor: pointer; color: var(--accent-cyan, #79c0ff); }
.dlt-canon pre {
  margin: 6px 0;
  padding: 8px;
  background: var(--bg-0, #0d1117);
  border-radius: 3px;
  white-space: pre-wrap;
  color: var(--text-0, #e6edf3);
}
`;

export default DeltaCard;
