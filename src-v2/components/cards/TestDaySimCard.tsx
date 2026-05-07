/**
 * TestDaySimCard.tsx
 *
 * Full Q1-Q4 simulation under test-day conditions. Renders all four
 * questions in a paginated single-card view. The student answers each Q
 * in its own pane and may navigate freely between Qs. Submit is GLOBAL —
 * one click grades all four together.
 *
 * NOTE — TIMER REMOVED (2026-05-07).
 * No global countdown clock. The student works through Q1-Q4 sequentially
 * (or by tabbing) at their own pace and submits when all four are done.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────────────────────┐
 *   │ Header: "Test 2 mock — atom id"                                  │
 *   ├──────────────────────────────────────────────────────────────────┤
 *   │ Tab strip: [Q1] [Q2] [Q3] [Q4]   per-tab status badge            │
 *   ├──────────────────────────────────────────────────────────────────┤
 *   │ Active tab body: prompt (read-only) + answer textarea            │
 *   ├──────────────────────────────────────────────────────────────────┤
 *   │ Footer: filled count + [submit all 4]                            │
 *   └──────────────────────────────────────────────────────────────────┘
 *
 * Per RULE 4: keyboard-only navigation (Ctrl/Cmd+1..4 for tabs,
 * Ctrl/Cmd+Enter to submit-all), full a11y, deterministic per-Q grade
 * via rubric coverage + char-match.
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';
import type { TestDaySimCard as TestDaySimCardData } from '../../types/card-schema';

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

interface QGrade {
  questionNumber: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  pass: boolean;
  score: number;
  rubric: { item: string; ok: boolean }[];
  charMatch: boolean;
}

interface FullGrade {
  perQ: QGrade[];
  totalScore: number;
  passCount: number;
  pass: boolean;
}

function gradeOne(
  questionNumber: 'Q1' | 'Q2' | 'Q3' | 'Q4',
  answer: string,
  canonical: string,
  rubric: string[],
): QGrade {
  const stuN = normalizeLenient(answer);
  const canN = normalizeLenient(canonical);
  const charMatch = stuN === canN;
  const rubricResults = rubric.map((item) => ({
    item,
    ok: stuN.includes(normalizeLenient(item)),
  }));
  const okCount = rubricResults.filter((r) => r.ok).length;
  const score =
    rubric.length > 0
      ? Math.round((okCount / rubric.length) * 100)
      : charMatch
        ? 100
        : 0;
  return {
    questionNumber,
    pass: charMatch || score >= 80,
    score,
    rubric: rubricResults,
    charMatch,
  };
}

function gradeAll(
  card: TestDaySimCardData,
  answers: Record<string, string>,
): FullGrade {
  const perQ: QGrade[] = card.questionSet.map((q) =>
    gradeOne(
      q.questionNumber,
      answers[q.questionNumber] ?? '',
      q.canonicalAnswer,
      q.rubric ?? [],
    ),
  );
  const totalScore =
    Math.round(perQ.reduce((acc, q) => acc + q.score, 0) / perQ.length);
  const passCount = perQ.filter((q) => q.pass).length;
  return { perQ, totalScore, passCount, pass: passCount === perQ.length };
}

// ─────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────

export interface TestDaySimCardProps {
  card: TestDaySimCardData;
  onComplete: (correct: boolean) => void;
  onResults?: (grade: FullGrade) => void;
}

export interface TestDaySimCardHandle {
  reset: () => void;
}

// ─────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────

export const TestDaySimCard = forwardRef<
  TestDaySimCardHandle,
  TestDaySimCardProps
>(function TestDaySimCard({ card, onComplete, onResults }, ref) {
  const initialAnswers: Record<string, string> = useMemo(() => {
    const out: Record<string, string> = {};
    card.questionSet.forEach((q) => {
      out[q.questionNumber] = '';
    });
    return out;
  }, [card.questionSet]);

  const [activeTab, setActiveTab] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>(
    () => (card.questionSet[0]?.questionNumber ?? 'Q1') as
      | 'Q1'
      | 'Q2'
      | 'Q3'
      | 'Q4',
  );
  const [answers, setAnswers] = useState<Record<string, string>>(
    initialAnswers,
  );
  const [grade, setGrade] = useState<FullGrade | null>(null);

  useEffect(() => {
    setActiveTab(
      (card.questionSet[0]?.questionNumber ?? 'Q1') as
        | 'Q1'
        | 'Q2'
        | 'Q3'
        | 'Q4',
    );
    setAnswers(initialAnswers);
    setGrade(null);
  }, [card.id, initialAnswers, card.questionSet]);

  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        setActiveTab(
          (card.questionSet[0]?.questionNumber ?? 'Q1') as
            | 'Q1'
            | 'Q2'
            | 'Q3'
            | 'Q4',
        );
        setAnswers(initialAnswers);
        setGrade(null);
      },
    }),
    [card.questionSet, initialAnswers],
  );

  const onSubmit = useCallback(() => {
    const result = gradeAll(card, answers);
    setGrade(result);
    onResults?.(result);
    if (result.pass) onComplete(true);
  }, [card, answers, onComplete, onResults]);

  const onTryAgain = useCallback(() => {
    setGrade(null);
  }, []);

  // Tab shortcut: Ctrl/Cmd+1..4
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && /^[1-4]$/.test(e.key)) {
        e.preventDefault();
        const idx = Number(e.key) - 1;
        const target = card.questionSet[idx];
        if (target)
          setActiveTab(
            target.questionNumber as 'Q1' | 'Q2' | 'Q3' | 'Q4',
          );
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [card.questionSet, onSubmit]);

  const onAnswerChange = useCallback(
    (q: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [q]: value }));
    },
    [],
  );

  const layoutStyle: CSSProperties = useMemo(
    () => ({
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: 12,
      width: '100%',
      maxWidth: 1280,
      margin: '0 auto',
    }),
    [],
  );

  const filled = card.questionSet.filter(
    (q) => (answers[q.questionNumber] ?? '').trim() !== '',
  ).length;

  const activeQ = card.questionSet.find(
    (q) => q.questionNumber === activeTab,
  );

  return (
    <section
      className="tds-root"
      role="application"
      aria-label={`Test-day simulation — atom ${card.atomId}`}
      data-testid="testday-sim-card"
      style={layoutStyle}
    >
      <header className="tds-header">
        <div className="tds-title-block">
          <span className="tds-tag">test-day mock</span>
          <span className="tds-stem">{card.stem}</span>
        </div>
        <div className="tds-meta">
          <span className="tds-atom-id">{card.atomId}</span>
        </div>
      </header>

      <div
        className="tds-tabs"
        role="tablist"
        aria-label="question tabs"
      >
        {card.questionSet.map((q, i) => {
          const filledQ = (answers[q.questionNumber] ?? '').trim() !== '';
          const passQ = grade
            ? grade.perQ.find((g) => g.questionNumber === q.questionNumber)
                ?.pass
            : null;
          const isActive = activeTab === q.questionNumber;
          return (
            <button
              key={q.questionNumber}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              className={`tds-tab ${isActive ? 'is-active' : ''} ${filledQ ? 'is-filled' : ''} ${passQ === true ? 'is-pass' : ''} ${passQ === false ? 'is-fail' : ''}`}
              onClick={() =>
                setActiveTab(q.questionNumber as 'Q1' | 'Q2' | 'Q3' | 'Q4')
              }
              aria-label={`go to ${q.questionNumber}${filledQ ? ' (filled)' : ' (empty)'}`}
            >
              <span className="tds-tab-shortcut" aria-hidden="true">
                {i + 1}
              </span>
              {q.questionNumber}
              {filledQ && <span aria-hidden="true">·</span>}
            </button>
          );
        })}
      </div>

      {activeQ && (
        <div
          className="tds-body"
          role="tabpanel"
          aria-label={`${activeQ.questionNumber} body`}
        >
          <pre className="tds-prompt">{activeQ.prompt}</pre>
          <label
            htmlFor={`tds-ans-${activeQ.questionNumber}`}
            className="tds-ans-label"
          >
            your answer for {activeQ.questionNumber}
          </label>
          <textarea
            id={`tds-ans-${activeQ.questionNumber}`}
            className="tds-ans"
            value={answers[activeQ.questionNumber] ?? ''}
            onChange={(e) =>
              onAnswerChange(activeQ.questionNumber, e.target.value)
            }
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            rows={14}
            placeholder={`// ${activeQ.questionNumber} answer`}
            aria-label={`answer for ${activeQ.questionNumber}`}
            readOnly={grade?.pass === true}
          />
        </div>
      )}

      <footer className="tds-footer">
        <span className="tds-progress" aria-label="filled count">
          filled {filled}/{card.questionSet.length}
          {grade ? ` · score ${grade.totalScore}%` : ''}
        </span>
        <div>
          {grade && !grade.pass && (
            <button
              type="button"
              className="tds-btn tds-btn--ghost"
              onClick={onTryAgain}
            >
              try again
            </button>
          )}
          <button
            type="button"
            className="tds-btn tds-btn--primary"
            onClick={onSubmit}
            disabled={grade?.pass === true}
            aria-label="submit all four answers"
          >
            {grade?.pass ? 'passed' : 'submit all 4'}
          </button>
        </div>
      </footer>

      {grade && (
        <div
          className={`tds-feedback ${grade.pass ? 'tds-feedback--ok' : 'tds-feedback--fail'}`}
          role="status"
          aria-live="polite"
        >
          <strong>
            {grade.pass
              ? `all 4 questions passed (${grade.totalScore}%)`
              : `${grade.passCount}/${grade.perQ.length} passed (${grade.totalScore}%)`}
          </strong>
          <ul className="tds-q-results">
            {grade.perQ.map((q) => (
              <li
                key={q.questionNumber}
                className={q.pass ? 'ok' : 'bad'}
              >
                {q.pass ? '+' : '-'} <strong>{q.questionNumber}</strong>{' '}
                — {q.score}%
                {q.rubric.length > 0 && (
                  <span className="tds-rubric-inline">
                    rubric: {q.rubric.filter((r) => r.ok).length}/
                    {q.rubric.length}
                  </span>
                )}
              </li>
            ))}
          </ul>
          {!grade.pass && (
            <details className="tds-canon">
              <summary>show worked solutions</summary>
              {card.questionSet.map((q) => (
                <div key={q.questionNumber} className="tds-canon-block">
                  <h4>{q.questionNumber}</h4>
                  <pre>{q.canonicalAnswer}</pre>
                </div>
              ))}
              <p>{card.explanation}</p>
            </details>
          )}
        </div>
      )}

      <style>{TDS_STYLES}</style>
    </section>
  );
});

// ─────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────

const TDS_STYLES = `
.tds-root {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  color: var(--text-0, #e6edf3);
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--accent-pink, #ff7b72);
  border-radius: 8px;
}
.tds-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--border-1, #30363d);
  padding-bottom: 8px;
}
.tds-title-block { display: flex; align-items: center; gap: 8px; flex: 1 1 360px; flex-wrap: wrap; }
.tds-tag {
  background: var(--accent-pink, #ff7b72);
  color: var(--bg-0, #0d1117);
  padding: 2px 8px;
  border-radius: 3px;
  font-weight: 700;
  letter-spacing: 0.04em;
  font-size: 11px;
  text-transform: uppercase;
}
.tds-stem { font-size: 13px; line-height: 1.45; }
.tds-meta { display: flex; gap: 10px; align-items: center; }
.tds-atom-id {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 3px;
  padding: 2px 6px;
  color: var(--accent-cyan, #79c0ff);
  letter-spacing: 0.05em;
  font-size: 11px;
}
.tds-tabs {
  display: flex;
  gap: 4px;
}
.tds-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  color: var(--text-1, #8b949e);
  font-family: inherit;
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  border-bottom: none;
  letter-spacing: 0.04em;
}
.tds-tab.is-filled { color: var(--text-0, #e6edf3); }
.tds-tab.is-active {
  background: var(--bg-0, #0d1117);
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--accent-cyan, #79c0ff);
}
.tds-tab.is-pass {
  border-color: var(--accent-grn, #7ee787);
  color: var(--accent-grn, #7ee787);
}
.tds-tab.is-fail {
  border-color: var(--accent-pink, #ff7b72);
  color: var(--accent-pink, #ff7b72);
}
.tds-tab:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.tds-tab-shortcut {
  display: inline-block;
  width: 14px;
  height: 14px;
  text-align: center;
  line-height: 14px;
  font-size: 9px;
  background: var(--bg-2, #1f2937);
  border-radius: 2px;
  color: var(--text-2, #6e7681);
}

.tds-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 0 6px 6px 6px;
  padding: 12px;
}
.tds-prompt {
  margin: 0;
  font-size: 12px;
  white-space: pre-wrap;
  color: var(--text-0, #e6edf3);
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--border-1, #30363d);
  padding: 8px;
  border-radius: 4px;
  max-height: 180px;
  overflow: auto;
}
.tds-ans-label {
  font-size: 10px;
  color: var(--text-2, #6e7681);
  letter-spacing: 0.05em;
  text-transform: lowercase;
}
.tds-ans {
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
.tds-ans:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: -2px;
}
.tds-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: var(--text-1, #8b949e);
}
.tds-progress { letter-spacing: 0.04em; }
.tds-btn {
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
  margin-left: 6px;
}
.tds-btn:hover:not(:disabled) {
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--accent-cyan, #79c0ff);
}
.tds-btn:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.tds-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.tds-btn--primary {
  background: var(--accent-pink, #ff7b72);
  border-color: var(--accent-pink, #ff7b72);
  color: var(--bg-0, #0d1117);
  font-weight: 600;
}
.tds-btn--primary:hover:not(:disabled) {
  background: var(--accent-grn, #7ee787);
  border-color: var(--accent-grn, #7ee787);
}
.tds-btn--ghost { background: transparent; }
.tds-feedback {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 12px;
}
.tds-feedback--ok { border-color: var(--accent-grn, #7ee787); }
.tds-feedback--fail { border-color: var(--accent-pink, #ff7b72); }
.tds-q-results {
  list-style: none;
  margin: 6px 0 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.tds-q-results .ok { color: var(--accent-grn, #7ee787); }
.tds-q-results .bad { color: var(--accent-pink, #ff7b72); }
.tds-rubric-inline {
  margin-left: 8px;
  color: var(--text-2, #6e7681);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.tds-canon {
  margin-top: 6px;
  font-size: 11px;
  color: var(--text-1, #8b949e);
}
.tds-canon summary { cursor: pointer; color: var(--accent-cyan, #79c0ff); }
.tds-canon-block { margin-top: 6px; }
.tds-canon-block h4 {
  margin: 0 0 4px 0;
  font-size: 11px;
  color: var(--text-2, #6e7681);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.tds-canon-block pre {
  margin: 0 0 8px 0;
  padding: 8px;
  background: var(--bg-0, #0d1117);
  border-radius: 3px;
  white-space: pre-wrap;
  color: var(--text-0, #e6edf3);
}
`;

export default TestDaySimCard;
