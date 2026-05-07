/**
 * FaultInjectionCard.tsx
 *
 * "This code is broken — find the line(s) and write the fix."
 *
 * UX (3-zone vertical layout):
 *   ┌──────────────────────────────────────────────────────────────────┐
 *   │ Header: stem + bug-category badge + atom id                      │
 *   ├──────────────────────────────────────────────────────────────────┤
 *   │ BROKEN CODE pane (read-only, line-numbered, click-to-toggle):    │
 *   │   1   #include <iostream>                                        │
 *   │   2   using namespace std;                                       │
 *   │   3 ▶ void read_X(X list[], int n)  ← student clicks to toggle    │
 *   │   ...                                                            │
 *   ├──────────────────────────────────────────────────────────────────┤
 *   │ FIX pane (writable):                                             │
 *   │   selected lines render in a banner; student types canonical fix │
 *   │ [submit]                                                         │
 *   └──────────────────────────────────────────────────────────────────┘
 *
 * Grading (two channels):
 *   1. Line selection — student's selected lines must equal
 *      card.bugLocations as a set.
 *   2. Fix — normalizeLenient(student.fix) compared against
 *      normalizeLenient(card.fixedCode) OR all keyChecks present.
 *
 * Per RULE 4: deterministic, accessible, keyboard-only operable. Lines
 * are toggled via Space/Enter on the focused row OR by clicking. Arrow
 * keys move focus through the gutter.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import type { FaultInjectionCard as FaultInjectionCardData } from '../../types/card-schema';

// ─────────────────────────────────────────────────────────────────────
// Grading
// ─────────────────────────────────────────────────────────────────────

function normalizeLenient(s: string): string {
  return s
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, '').replace(/[ \t]+/g, ' '))
    .join('\n')
    .trim();
}

interface FaultGrade {
  pass: boolean;
  linesCorrect: boolean;
  fixCorrect: boolean;
  missingLines: number[];
  extraLines: number[];
  keyCheckResults: { needle: string; ok: boolean }[];
  explanation: string;
}

function gradeFault(
  selectedLines: number[],
  studentFix: string,
  card: FaultInjectionCardData,
): FaultGrade {
  const expectedSet = new Set(card.bugLocations);
  const studentSet = new Set(selectedLines);
  const missing = [...expectedSet].filter((l) => !studentSet.has(l));
  const extra = [...studentSet].filter((l) => !expectedSet.has(l));
  const linesCorrect = missing.length === 0 && extra.length === 0;

  const stuN = normalizeLenient(studentFix);
  const canN = normalizeLenient(card.fixedCode);
  const charMatch = stuN === canN;

  const keyCheckResults = (card.keyChecks ?? []).map((needle) => ({
    needle,
    ok: stuN.includes(normalizeLenient(needle)),
  }));
  const allKeysOk =
    keyCheckResults.length > 0
      ? keyCheckResults.every((k) => k.ok)
      : charMatch;
  const fixCorrect =
    charMatch || (allKeysOk && stuN.length > 0);

  const pass = linesCorrect && fixCorrect;

  let explanation: string;
  if (pass) {
    explanation = `Located the ${card.bugLocations.length === 1 ? 'bug' : 'bugs'} and applied the right fix. Bug class: ${card.bugCategory}.`;
  } else if (!linesCorrect && !fixCorrect) {
    explanation =
      'Wrong line(s) AND fix needs work. Re-read the canonical pattern.';
  } else if (!linesCorrect) {
    explanation = `Selected lines are off — missing ${missing.length}, extra ${extra.length}.`;
  } else {
    explanation = 'Right line(s), but the fix did not match.';
  }
  return {
    pass,
    linesCorrect,
    fixCorrect,
    missingLines: missing,
    extraLines: extra,
    keyCheckResults,
    explanation,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────

export interface FaultInjectionCardProps {
  card: FaultInjectionCardData;
  onComplete: (correct: boolean) => void;
}

// ─────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────

export function FaultInjectionCard({
  card,
  onComplete,
}: FaultInjectionCardProps) {
  const lines = useMemo(() => card.brokenCode.split('\n'), [card.brokenCode]);
  const [selectedLines, setSelectedLines] = useState<Set<number>>(
    () => new Set(),
  );
  const [studentFix, setStudentFix] = useState<string>('');
  const [grade, setGrade] = useState<FaultGrade | null>(null);
  const [focusLine, setFocusLine] = useState<number>(1);

  const lineRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    setSelectedLines(new Set());
    setStudentFix('');
    setGrade(null);
    setFocusLine(1);
  }, [card.id]);

  const toggleLine = useCallback((lineNumber: number) => {
    setSelectedLines((prev) => {
      const next = new Set(prev);
      if (next.has(lineNumber)) next.delete(lineNumber);
      else next.add(lineNumber);
      return next;
    });
  }, []);

  const onLineKey = useCallback(
    (e: KeyboardEvent<HTMLDivElement>, lineNumber: number) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggleLine(lineNumber);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = Math.min(lines.length, lineNumber + 1);
        setFocusLine(next);
        lineRefs.current[next]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = Math.max(1, lineNumber - 1);
        setFocusLine(prev);
        lineRefs.current[prev]?.focus();
      }
    },
    [lines.length, toggleLine],
  );

  const onSubmit = useCallback(() => {
    const sortedLines = [...selectedLines].sort((a, b) => a - b);
    const result = gradeFault(sortedLines, studentFix, card);
    setGrade(result);
    if (result.pass) onComplete(true);
  }, [selectedLines, studentFix, card, onComplete]);

  const onTryAgain = useCallback(() => setGrade(null), []);

  // Ctrl/Cmd+Enter submit.
  useEffect(() => {
    function handler(e: globalThis.KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onSubmit]);

  const layoutStyle: CSSProperties = useMemo(
    () => ({
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',
      gap: 12,
      padding: 12,
      width: '100%',
      maxWidth: 1280,
      margin: '0 auto',
    }),
    [],
  );

  const sortedSel = [...selectedLines].sort((a, b) => a - b);

  return (
    <section
      className="flt-root"
      role="application"
      aria-label={`Fault injection — atom ${card.atomId}`}
      data-testid="fault-injection-card"
      style={layoutStyle}
    >
      <header className="flt-header">
        <div className="flt-title-block">
          <span className="flt-stem">{card.stem}</span>
          <span className="flt-cat" aria-label="bug category">
            {card.bugCategory}
          </span>
        </div>
        <div className="flt-meta">
          <span className="flt-atom-id">{card.atomId}</span>
          <span className="flt-q-tags">{card.qTags.join(' · ')}</span>
        </div>
      </header>

      <div
        className="flt-code-pane"
        role="region"
        aria-label="broken code — toggle lines you think are buggy"
      >
        <div className="flt-code-pane-title">
          broken code — toggle the buggy line(s) (Space / Enter)
        </div>
        <div className="flt-code-list" role="listbox" aria-multiselectable="true">
          {lines.map((line, i) => {
            const lineNum = i + 1;
            const isSelected = selectedLines.has(lineNum);
            const isFocus = focusLine === lineNum;
            return (
              <div
                key={lineNum}
                ref={(el) => {
                  lineRefs.current[lineNum] = el;
                }}
                role="option"
                aria-selected={isSelected}
                tabIndex={isFocus ? 0 : -1}
                className={`flt-line ${isSelected ? 'is-selected' : ''} ${isFocus ? 'is-focus' : ''}`}
                onClick={() => {
                  setFocusLine(lineNum);
                  toggleLine(lineNum);
                }}
                onKeyDown={(e) => onLineKey(e, lineNum)}
                onFocus={() => setFocusLine(lineNum)}
                aria-label={`line ${lineNum}${isSelected ? ' (marked buggy)' : ''}`}
              >
                <span className="flt-gutter" aria-hidden="true">
                  {isSelected ? '●' : ' '}
                </span>
                <span className="flt-lineno" aria-hidden="true">
                  {lineNum}
                </span>
                <code className="flt-source">{line || ' '}</code>
              </div>
            );
          })}
        </div>
        <div className="flt-selected-summary" aria-live="polite">
          {sortedSel.length === 0
            ? 'no lines marked yet'
            : `marked: ${sortedSel.join(', ')}`}
        </div>
      </div>

      <div className="flt-fix-pane" role="region" aria-label="fix pane">
        <label htmlFor="flt-fix" className="flt-fix-label">
          type the fixed line(s) — exactly what they should be
        </label>
        <textarea
          id="flt-fix"
          className="flt-fix"
          value={studentFix}
          onChange={(e) => setStudentFix(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          rows={6}
          placeholder="// canonical fix"
          aria-label="fix textarea"
          readOnly={grade?.pass === true}
        />
        <div className="flt-footer">
          {grade && !grade.pass && (
            <button
              type="button"
              className="flt-btn flt-btn--ghost"
              onClick={onTryAgain}
              aria-label="dismiss feedback and try again"
            >
              try again
            </button>
          )}
          <button
            type="button"
            className="flt-btn flt-btn--primary"
            onClick={onSubmit}
            disabled={
              grade?.pass === true ||
              sortedSel.length === 0 ||
              studentFix.trim() === ''
            }
            aria-label="submit fault location and fix"
          >
            {grade?.pass ? 'passed' : 'submit'}
          </button>
        </div>
      </div>

      {grade && (
        <div
          className={`flt-feedback ${grade.pass ? 'flt-feedback--ok' : 'flt-feedback--fail'}`}
          role="status"
          aria-live="polite"
        >
          <strong>
            {grade.pass ? '✓ pass' : '✗ not yet'} — {grade.explanation}
          </strong>
          <ul className="flt-feedback-list">
            <li className={grade.linesCorrect ? 'ok' : 'bad'}>
              {grade.linesCorrect ? '✓' : '✗'} line selection
              {!grade.linesCorrect && grade.missingLines.length > 0 && (
                <> — missing: {grade.missingLines.join(', ')}</>
              )}
              {!grade.linesCorrect && grade.extraLines.length > 0 && (
                <> · extra: {grade.extraLines.join(', ')}</>
              )}
            </li>
            <li className={grade.fixCorrect ? 'ok' : 'bad'}>
              {grade.fixCorrect ? '✓' : '✗'} fix matches canonical
            </li>
            {grade.keyCheckResults.length > 0 && (
              <li>
                key checks:{' '}
                {grade.keyCheckResults.map((k) => (
                  <code
                    key={k.needle}
                    className={k.ok ? 'ok' : 'bad'}
                    style={{ marginRight: 6 }}
                  >
                    {k.ok ? '✓' : '✗'} {k.needle}
                  </code>
                ))}
              </li>
            )}
          </ul>
          {!grade.pass && (
            <details className="flt-canon">
              <summary>show canonical fix</summary>
              <pre>{card.fixedCode}</pre>
              <p>{card.explanation}</p>
            </details>
          )}
        </div>
      )}

      <style>{FLT_STYLES}</style>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────

const FLT_STYLES = `
.flt-root {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  color: var(--text-0, #e6edf3);
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
}
.flt-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--border-1, #30363d);
  padding: 8px 4px;
}
.flt-title-block { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; flex: 1 1 360px; }
.flt-stem { font-size: 13px; line-height: 1.45; }
.flt-cat {
  background: rgba(255,123,114,0.12);
  color: var(--accent-pink, #ff7b72);
  border: 1px solid var(--accent-pink, #ff7b72);
  border-radius: 3px;
  padding: 2px 6px;
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.flt-meta { display: flex; gap: 10px; align-items: center; font-size: 11px; }
.flt-atom-id {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 3px;
  padding: 2px 6px;
  color: var(--accent-cyan, #79c0ff);
  letter-spacing: 0.05em;
}
.flt-q-tags { color: var(--accent-org, #ffa657); }
.flt-code-pane {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.flt-code-pane-title {
  font-size: 10px;
  color: var(--text-2, #6e7681);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.flt-code-list {
  display: flex;
  flex-direction: column;
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  overflow: auto;
  max-height: 360px;
}
.flt-line {
  display: grid;
  grid-template-columns: 24px 36px 1fr;
  align-items: baseline;
  font-size: 12px;
  cursor: pointer;
  outline: 0;
  border-left: 2px solid transparent;
}
.flt-line:hover { background: var(--bg-2, #1f2937); }
.flt-line.is-selected {
  background: rgba(255,123,114,0.10);
  border-left-color: var(--accent-pink, #ff7b72);
}
.flt-line.is-focus {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: -2px;
}
.flt-gutter {
  text-align: center;
  color: var(--accent-pink, #ff7b72);
  font-size: 12px;
}
.flt-lineno {
  text-align: right;
  padding-right: 8px;
  color: var(--text-2, #6e7681);
  font-size: 10px;
}
.flt-source {
  white-space: pre;
  color: var(--text-0, #e6edf3);
  font-family: inherit;
}
.flt-selected-summary {
  font-size: 11px;
  color: var(--text-1, #8b949e);
  letter-spacing: 0.04em;
}
.flt-fix-pane {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 10px;
}
.flt-fix-label {
  font-size: 10px;
  color: var(--text-2, #6e7681);
  letter-spacing: 0.05em;
  text-transform: lowercase;
}
.flt-fix {
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
.flt-fix:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: -2px;
}
.flt-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.flt-btn {
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
.flt-btn:hover:not(:disabled) {
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--accent-cyan, #79c0ff);
}
.flt-btn:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.flt-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.flt-btn--primary {
  background: var(--accent-cyan, #79c0ff);
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  font-weight: 600;
}
.flt-btn--primary:hover:not(:disabled) {
  background: var(--accent-grn, #7ee787);
  border-color: var(--accent-grn, #7ee787);
}
.flt-btn--ghost { background: transparent; }
.flt-feedback {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 12px;
}
.flt-feedback--ok { border-color: var(--accent-grn, #7ee787); }
.flt-feedback--fail { border-color: var(--accent-pink, #ff7b72); }
.flt-feedback-list {
  list-style: none;
  margin: 6px 0 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.flt-feedback-list .ok { color: var(--accent-grn, #7ee787); }
.flt-feedback-list .bad { color: var(--accent-pink, #ff7b72); }
.flt-canon { margin-top: 6px; font-size: 11px; color: var(--text-1, #8b949e); }
.flt-canon summary { cursor: pointer; color: var(--accent-cyan, #79c0ff); }
.flt-canon pre {
  margin: 6px 0;
  padding: 8px;
  background: var(--bg-0, #0d1117);
  border-radius: 3px;
  white-space: pre-wrap;
  color: var(--text-0, #e6edf3);
}
`;

export default FaultInjectionCard;
