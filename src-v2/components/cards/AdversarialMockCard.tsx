/**
 * AdversarialMockCard.tsx
 *
 * Hardest-possible single-question mock simulator. The student gets a
 * full Q1/Q2/Q3/Q4 question with the worst-case variants pre-loaded:
 *   - 4-field structs
 *   - off-by-one prone loops
 *   - A12 (index-of-max) style edge-case algorithms
 *   - shuffled struct field order
 *   - intentionally tricky data sets (negatives, duplicates, empties)
 *
 * NOTE — TIMER REMOVED (2026-05-07).
 * No per-card countdown. The student works through the worst-case variant
 * at their own pace and submits when ready. Adversarial = content
 * difficulty, not time pressure.
 *
 * UX goals:
 *   - Clearly mark the prompt as "ADVERSARIAL — hardest variant"
 *   - Render the question number badge front-and-center
 *   - Free-form answer textarea (the student writes the C++ as they
 *     would under exam conditions).
 *   - Submit triggers char-match + rubric-checklist grade. Rubric items
 *     each render as a tick/cross.
 *
 * Per RULE 4: no AI calls, fully deterministic, full a11y, escape via
 * Esc to a confirm dialog (no accidental abandonment).
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
import type { AdversarialMockCard as AdversarialMockCardData } from '../../types/card-schema';

// ─────────────────────────────────────────────────────────────────────
// Grading helpers — local copy of normalizeLenient.
// ─────────────────────────────────────────────────────────────────────

function normalizeLenient(s: string): string {
  return s
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, '').replace(/[ \t]+/g, ' '))
    .join('\n')
    .trim();
}

interface RubricResult {
  item: string;
  ok: boolean;
}
interface AdversarialGrade {
  pass: boolean;
  score: number; // 0..100, rubric coverage
  charMatch: boolean;
  rubric: RubricResult[];
  explanation: string;
}

function gradeAdversarial(
  answer: string,
  card: AdversarialMockCardData,
): AdversarialGrade {
  const stuN = normalizeLenient(answer);
  const canN = normalizeLenient(card.canonicalAnswer);
  const charMatch = stuN === canN;

  const rubric: RubricResult[] = (card.rubric ?? []).map((item) => ({
    item,
    ok: stuN.includes(normalizeLenient(item)),
  }));

  const okCount = rubric.filter((r) => r.ok).length;
  const score =
    rubric.length > 0
      ? Math.round((okCount / rubric.length) * 100)
      : charMatch
        ? 100
        : 0;

  // "Pass" gate: ≥80% rubric coverage OR exact char-match.
  const pass = charMatch || score >= 80;

  let explanation: string;
  if (pass && charMatch) {
    explanation = 'Exact match — survived the adversarial variant.';
  } else if (pass) {
    explanation = `Strong attempt — rubric coverage ${score}%. Minor gaps tolerated.`;
  } else if (rubric.length > 0) {
    const missing = rubric.filter((r) => !r.ok).map((r) => r.item);
    explanation = `Coverage ${score}%. Missing: ${missing.slice(0, 3).join(' · ')}${missing.length > 3 ? ` (+${missing.length - 3} more)` : ''}.`;
  } else {
    explanation = 'Surface match failed. See the canonical answer.';
  }
  return { pass, score, charMatch, rubric, explanation };
}

// ─────────────────────────────────────────────────────────────────────
// Props + handle
// ─────────────────────────────────────────────────────────────────────

export interface AdversarialMockCardProps {
  card: AdversarialMockCardData;
  onComplete: (correct: boolean) => void;
}

export interface AdversarialMockCardHandle {
  reset: () => void;
}

// ─────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────

export const AdversarialMockCard = forwardRef<
  AdversarialMockCardHandle,
  AdversarialMockCardProps
>(function AdversarialMockCard(
  { card, onComplete },
  ref,
) {
  const [answer, setAnswer] = useState<string>('');
  const [grade, setGrade] = useState<AdversarialGrade | null>(null);

  // Reset on card change.
  useEffect(() => {
    setAnswer('');
    setGrade(null);
  }, [card.id]);

  // Imperative reset.
  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        setAnswer('');
        setGrade(null);
      },
    }),
    [],
  );

  const onSubmit = useCallback(() => {
    const result = gradeAdversarial(answer, card);
    setGrade(result);
    if (result.pass) onComplete(true);
  }, [answer, card, onComplete]);

  const onTryAgain = useCallback(() => {
    setGrade(null);
  }, []);

  // Ctrl/Cmd+Enter submits.
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
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
      gridTemplateRows: 'auto 1fr auto',
      gridTemplateAreas: `
        "header header"
        "prompt answer"
        "footer footer"
      `,
      gap: 12,
      padding: 12,
      width: '100%',
      maxWidth: 1280,
      margin: '0 auto',
      minHeight: 600,
    }),
    [],
  );

  return (
    <section
      className="adv-root"
      role="application"
      aria-label={`Adversarial mock — ${card.questionNumber} — atom ${card.atomId}`}
      data-testid="adversarial-mock-card"
      style={layoutStyle}
    >
      <header className="adv-header" style={{ gridArea: 'header' }}>
        <div className="adv-title-block">
          <span className="adv-q-badge" aria-label="question">
            {card.questionNumber}
          </span>
          <span className="adv-tag">ADVERSARIAL — hardest variant</span>
          <span className="adv-stem">{card.stem}</span>
        </div>
        <div className="adv-meta">
          <span className="adv-atom-id">{card.atomId}</span>
        </div>
      </header>

      <div
        className="adv-prompt"
        style={{ gridArea: 'prompt' }}
        role="region"
        aria-label="question prompt"
      >
        <pre className="adv-prompt-pre">{card.fullPrompt}</pre>
      </div>

      <div
        className="adv-answer-pane"
        style={{ gridArea: 'answer' }}
        role="region"
        aria-label="answer pane"
      >
        <label htmlFor="adv-answer" className="adv-answer-label">
          your answer (Ctrl/Cmd+Enter to submit)
        </label>
        <textarea
          id="adv-answer"
          className="adv-answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          rows={20}
          placeholder="// write your answer as you would under exam conditions"
          aria-label="adversarial answer"
          readOnly={grade?.pass === true}
        />
      </div>

      <footer className="adv-footer" style={{ gridArea: 'footer' }}>
        <span className="adv-prog-note">
          {grade ? `score ${grade.score}%` : 'submit when ready'}
        </span>
        <div>
          {grade && !grade.pass && (
            <button
              type="button"
              className="adv-btn adv-btn--ghost"
              onClick={onTryAgain}
            >
              try again
            </button>
          )}
          <button
            type="button"
            className="adv-btn adv-btn--primary"
            onClick={onSubmit}
            disabled={grade?.pass === true || answer.trim() === ''}
            aria-label="submit adversarial answer"
          >
            {grade?.pass ? 'passed' : 'submit'}
          </button>
        </div>
      </footer>

      {grade && (
        <div
          className={`adv-feedback ${grade.pass ? 'adv-feedback--ok' : 'adv-feedback--fail'}`}
          role="status"
          aria-live="polite"
        >
          <strong>
            {grade.pass ? 'pass' : 'not yet'} — {grade.explanation}
          </strong>
          {grade.rubric.length > 0 && (
            <ul className="adv-rubric">
              {grade.rubric.map((r) => (
                <li key={r.item} className={r.ok ? 'ok' : 'bad'}>
                  {r.ok ? '+' : '-'} <code>{r.item}</code>
                </li>
              ))}
            </ul>
          )}
          {!grade.pass && (
            <details className="adv-canon">
              <summary>show canonical answer</summary>
              <pre>{card.canonicalAnswer}</pre>
              <p>{card.explanation}</p>
            </details>
          )}
        </div>
      )}

      <style>{ADV_STYLES}</style>
    </section>
  );
});

// ─────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────

const ADV_STYLES = `
.adv-root {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  color: var(--text-0, #e6edf3);
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--accent-pink, #ff7b72);
  border-radius: 8px;
  position: relative;
}
.adv-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 4px;
  border-bottom: 1px solid var(--border-1, #30363d);
}
.adv-title-block {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  flex: 1 1 360px;
}
.adv-q-badge {
  background: var(--accent-pink, #ff7b72);
  color: var(--bg-0, #0d1117);
  padding: 2px 8px;
  border-radius: 3px;
  font-weight: 700;
  letter-spacing: 0.04em;
  font-size: 12px;
}
.adv-tag {
  background: rgba(255,123,114,0.12);
  color: var(--accent-pink, #ff7b72);
  border: 1px solid var(--accent-pink, #ff7b72);
  border-radius: 3px;
  font-size: 10px;
  padding: 2px 6px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.adv-stem { font-size: 13px; line-height: 1.4; }
.adv-meta { display: flex; gap: 10px; align-items: center; }
.adv-atom-id {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 3px;
  padding: 2px 6px;
  color: var(--accent-cyan, #79c0ff);
  letter-spacing: 0.05em;
  font-size: 11px;
}
.adv-prompt {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 12px;
  overflow: auto;
}
.adv-prompt-pre {
  margin: 0;
  font-size: 12px;
  white-space: pre-wrap;
  color: var(--text-0, #e6edf3);
}
.adv-answer-pane {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 10px;
}
.adv-answer-label {
  font-size: 10px;
  color: var(--text-2, #6e7681);
  letter-spacing: 0.05em;
  text-transform: lowercase;
}
.adv-answer {
  flex: 1;
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  color: var(--accent-grn, #7ee787);
  font-family: inherit;
  font-size: 12px;
  padding: 8px 10px;
  resize: vertical;
  min-height: 240px;
  outline: 0;
  caret-color: var(--accent-grn, #7ee787);
}
.adv-answer:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: -2px;
}
.adv-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 4px;
  border-top: 1px solid var(--border-1, #30363d);
  font-size: 11px;
  color: var(--text-1, #8b949e);
}
.adv-btn {
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
  letter-spacing: 0.02em;
}
.adv-btn:hover:not(:disabled) {
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--accent-cyan, #79c0ff);
}
.adv-btn:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.adv-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.adv-btn--primary {
  background: var(--accent-pink, #ff7b72);
  border-color: var(--accent-pink, #ff7b72);
  color: var(--bg-0, #0d1117);
  font-weight: 600;
}
.adv-btn--primary:hover:not(:disabled) {
  background: var(--accent-grn, #7ee787);
  border-color: var(--accent-grn, #7ee787);
}
.adv-btn--ghost { background: transparent; }

.adv-feedback {
  position: absolute;
  inset: auto 12px 12px 12px;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 12px;
  z-index: 5;
  max-height: 56vh;
  overflow: auto;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
}
.adv-feedback--ok { border-color: var(--accent-grn, #7ee787); }
.adv-feedback--fail { border-color: var(--accent-pink, #ff7b72); }
.adv-rubric {
  list-style: none;
  margin: 6px 0 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.adv-rubric .ok { color: var(--accent-grn, #7ee787); }
.adv-rubric .bad { color: var(--accent-pink, #ff7b72); }
.adv-rubric code {
  background: var(--bg-2, #1f2937);
  padding: 1px 5px;
  border-radius: 2px;
  color: var(--accent-cyan, #79c0ff);
}
.adv-canon { margin-top: 6px; font-size: 11px; color: var(--text-1, #8b949e); }
.adv-canon summary { cursor: pointer; color: var(--accent-cyan, #79c0ff); }
.adv-canon pre {
  margin: 6px 0;
  padding: 8px;
  background: var(--bg-0, #0d1117);
  border-radius: 3px;
  white-space: pre-wrap;
  color: var(--text-0, #e6edf3);
}
`;

export default AdversarialMockCard;
