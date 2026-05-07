/**
 * DAGRetryCard.tsx
 *
 * "Atom X failed. Walk back to the prerequisite atoms first."
 *
 * Shown when the dag-backward-retry engine surfaces a card whose
 * `prerequisiteAtomIds` chain explains the failure of `failedCardId`.
 * The card renders:
 *   1. A breadcrumb of the failed atom and its prereqs (A -> B -> C -> X)
 *   2. The remediation prompt + canonical answer for the EARLIEST
 *      not-yet-mastered prereq
 *   3. A "ready to retry parent?" affordance once the student passes
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────────────────────┐
 *   │ Header: "remediation — walk back" + atom id + question tags     │
 *   ├──────────────────────────────────────────────────────────────────┤
 *   │ Breadcrumb: F-12 → F-13 → F-13a → [F-14 (failed)]                │
 *   ├──────────────────────────────────────────────────────────────────┤
 *   │ Prereq prompt (read-only) + answer textarea + submit             │
 *   ├──────────────────────────────────────────────────────────────────┤
 *   │ Pass banner: "ready to retry F-14?" [retry parent]               │
 *   └──────────────────────────────────────────────────────────────────┘
 *
 * Per RULE 4: deterministic, accessible, integrates with the
 * `dag-backward-retry` engine via the `onRetryParent` callback.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';
import type { DAGRetryCard as DAGRetryCardData } from '../../types/card-schema';

function normalizeLenient(s: string): string {
  return s
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, '').replace(/[ \t]+/g, ' '))
    .join('\n')
    .trim();
}

interface RetryGrade {
  pass: boolean;
  charMatch: boolean;
  keyCheckResults: { needle: string; ok: boolean }[];
}

function gradeRetry(
  studentAnswer: string,
  card: DAGRetryCardData,
): RetryGrade {
  const stuN = normalizeLenient(studentAnswer);
  const canN = normalizeLenient(card.canonicalAnswer);
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
  return { pass, charMatch, keyCheckResults };
}

// ─────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────

export interface DAGRetryCardProps {
  card: DAGRetryCardData;
  onComplete: (correct: boolean) => void;
  /**
   * Fires after the student passes AND clicks "retry parent". The host
   * should re-surface the original failed card.
   */
  onRetryParent?: (failedCardId: string) => void;
}

// ─────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────

export function DAGRetryCard({
  card,
  onComplete,
  onRetryParent,
}: DAGRetryCardProps) {
  const [answer, setAnswer] = useState<string>('');
  const [grade, setGrade] = useState<RetryGrade | null>(null);

  useEffect(() => {
    setAnswer('');
    setGrade(null);
  }, [card.id]);

  const onSubmit = useCallback(() => {
    const result = gradeRetry(answer, card);
    setGrade(result);
    if (result.pass) onComplete(true);
  }, [answer, card, onComplete]);

  const onTryAgain = useCallback(() => setGrade(null), []);

  const onRetry = useCallback(() => {
    onRetryParent?.(card.failedCardId);
  }, [card.failedCardId, onRetryParent]);

  // Ctrl/Cmd+Enter submit.
  useEffect(() => {
    function handler(e: KeyboardEvent) {
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
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      padding: 12,
      width: '100%',
      maxWidth: 1080,
      margin: '0 auto',
    }),
    [],
  );

  return (
    <section
      className="dag-root"
      role="application"
      aria-label={`DAG retry — atom ${card.atomId}`}
      data-testid="dag-retry-card"
      style={layoutStyle}
    >
      <header className="dag-header">
        <div className="dag-title-block">
          <span className="dag-tag">walk-back</span>
          <span className="dag-stem">{card.stem}</span>
        </div>
        <div className="dag-meta">
          <span className="dag-atom-id">{card.atomId}</span>
          <span className="dag-q-tags">{card.qTags.join(' · ')}</span>
        </div>
      </header>

      <Breadcrumb
        prereqs={card.prerequisiteAtomIds}
        failedCardId={card.failedCardId}
        targetAtomId={card.atomId}
      />

      <div className="dag-prompt" role="region" aria-label="prerequisite prompt">
        <h3 className="dag-prompt-title">prerequisite drill</h3>
        <p className="dag-prompt-body">{card.prompt}</p>
      </div>

      <div
        className="dag-answer-pane"
        role="region"
        aria-label="answer pane"
      >
        <label htmlFor="dag-answer" className="dag-answer-label">
          your answer (Ctrl/Cmd+Enter to submit)
        </label>
        <textarea
          id="dag-answer"
          className="dag-answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          rows={6}
          placeholder="// answer the prereq prompt"
          aria-label="prerequisite answer"
          readOnly={grade?.pass === true}
        />
        <div className="dag-footer">
          {grade && !grade.pass && (
            <button
              type="button"
              className="dag-btn dag-btn--ghost"
              onClick={onTryAgain}
              aria-label="dismiss feedback and try again"
            >
              try again
            </button>
          )}
          <button
            type="button"
            className="dag-btn dag-btn--primary"
            onClick={onSubmit}
            disabled={grade?.pass === true || answer.trim() === ''}
            aria-label="submit prerequisite answer"
          >
            {grade?.pass ? 'passed' : 'submit'}
          </button>
        </div>
      </div>

      {grade && (
        <div
          className={`dag-feedback ${grade.pass ? 'dag-feedback--ok' : 'dag-feedback--fail'}`}
          role="status"
          aria-live="polite"
        >
          <strong>
            {grade.pass
              ? `✓ prereq mastered — ready to retry ${card.failedCardId}?`
              : '✗ not yet — try the prereq again'}
          </strong>
          {grade.keyCheckResults.length > 0 && (
            <ul className="dag-keychecks">
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
          {grade.pass && (
            <button
              type="button"
              className="dag-btn dag-btn--primary"
              onClick={onRetry}
              aria-label={`retry parent card ${card.failedCardId}`}
              style={{ marginTop: 8 }}
            >
              retry parent → {card.failedCardId}
            </button>
          )}
          {!grade.pass && (
            <details className="dag-canon">
              <summary>show canonical answer</summary>
              <pre>{card.canonicalAnswer}</pre>
              <p>{card.explanation}</p>
            </details>
          )}
        </div>
      )}

      <style>{DAG_STYLES}</style>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────

interface BreadcrumbProps {
  prereqs: string[];
  failedCardId: string;
  targetAtomId: string;
}

function Breadcrumb({ prereqs, failedCardId, targetAtomId }: BreadcrumbProps) {
  return (
    <nav
      className="dag-breadcrumb"
      aria-label="prerequisite chain leading to failed atom"
    >
      <span className="dag-bc-label">chain:</span>
      {prereqs.map((id, i) => (
        <span key={`${id}-${i}`} className="dag-bc-pair">
          <span className="dag-bc-node">{id}</span>
          <span className="dag-bc-arrow" aria-hidden="true">
            →
          </span>
        </span>
      ))}
      <span className="dag-bc-node dag-bc-current">{targetAtomId}</span>
      <span className="dag-bc-arrow" aria-hidden="true">
        →
      </span>
      <span
        className="dag-bc-node dag-bc-failed"
        title={`failed card ${failedCardId}`}
      >
        {failedCardId}
      </span>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────

const DAG_STYLES = `
.dag-root {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  color: var(--text-0, #e6edf3);
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--accent-yel, #d2a8ff);
  border-radius: 8px;
}
.dag-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--border-1, #30363d);
  padding-bottom: 8px;
}
.dag-title-block { display: flex; align-items: center; gap: 8px; flex: 1 1 360px; flex-wrap: wrap; }
.dag-tag {
  background: rgba(210,168,255,0.12);
  color: var(--accent-yel, #d2a8ff);
  border: 1px solid var(--accent-yel, #d2a8ff);
  border-radius: 3px;
  padding: 2px 8px;
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.dag-stem { font-size: 13px; line-height: 1.45; }
.dag-meta { display: flex; gap: 10px; align-items: center; font-size: 11px; }
.dag-atom-id {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 3px;
  padding: 2px 6px;
  color: var(--accent-cyan, #79c0ff);
  letter-spacing: 0.05em;
}
.dag-q-tags { color: var(--accent-org, #ffa657); }

.dag-breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 11px;
}
.dag-bc-label {
  color: var(--text-2, #6e7681);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-right: 4px;
}
.dag-bc-pair {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.dag-bc-node {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 3px;
  padding: 2px 8px;
  color: var(--text-0, #e6edf3);
  letter-spacing: 0.05em;
}
.dag-bc-current {
  border-color: var(--accent-yel, #d2a8ff);
  color: var(--accent-yel, #d2a8ff);
}
.dag-bc-failed {
  border-color: var(--accent-pink, #ff7b72);
  color: var(--accent-pink, #ff7b72);
  font-weight: 600;
}
.dag-bc-arrow { color: var(--text-2, #6e7681); }

.dag-prompt {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 10px 12px;
}
.dag-prompt-title {
  margin: 0 0 4px 0;
  font-size: 11px;
  color: var(--text-2, #6e7681);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.dag-prompt-body { margin: 0; font-size: 13px; line-height: 1.45; }

.dag-answer-pane {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 10px;
}
.dag-answer-label {
  font-size: 10px;
  color: var(--text-2, #6e7681);
  letter-spacing: 0.05em;
  text-transform: lowercase;
}
.dag-answer {
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
.dag-answer:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: -2px;
}
.dag-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.dag-btn {
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
.dag-btn:hover:not(:disabled) {
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--accent-cyan, #79c0ff);
}
.dag-btn:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.dag-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.dag-btn--primary {
  background: var(--accent-yel, #d2a8ff);
  border-color: var(--accent-yel, #d2a8ff);
  color: var(--bg-0, #0d1117);
  font-weight: 600;
}
.dag-btn--primary:hover:not(:disabled) {
  background: var(--accent-grn, #7ee787);
  border-color: var(--accent-grn, #7ee787);
}
.dag-btn--ghost { background: transparent; }

.dag-feedback {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 12px;
}
.dag-feedback--ok { border-color: var(--accent-grn, #7ee787); }
.dag-feedback--fail { border-color: var(--accent-pink, #ff7b72); }
.dag-keychecks {
  list-style: none;
  margin: 6px 0 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
}
.dag-keychecks .ok { color: var(--accent-grn, #7ee787); }
.dag-keychecks .bad { color: var(--accent-pink, #ff7b72); }
.dag-keychecks code {
  background: var(--bg-0, #0d1117);
  padding: 1px 5px;
  border-radius: 2px;
  color: var(--accent-cyan, #79c0ff);
}
.dag-canon { margin-top: 6px; font-size: 11px; color: var(--text-1, #8b949e); }
.dag-canon summary { cursor: pointer; color: var(--accent-cyan, #79c0ff); }
.dag-canon pre {
  margin: 6px 0;
  padding: 8px;
  background: var(--bg-0, #0d1117);
  border-radius: 3px;
  white-space: pre-wrap;
  color: var(--text-0, #e6edf3);
}
`;

export default DAGRetryCard;
