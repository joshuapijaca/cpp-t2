/**
 * MCQCard.tsx — single-correct multi-choice question.
 *
 * Schema gives us:
 *   - `correct` : the canonical correct answer (string)
 *   - `distractors` : tuple of 3 wrong-option strings
 *   - `stem` : the question
 *
 * We shuffle correct + distractors deterministically (by card.id hash) so
 * the correct answer's position is stable per-card-per-session but not
 * always at the same letter — discourages position-anchored guessing.
 *
 * Keyboard:
 *   - 1-4 / a-d : pick option
 *   - Enter : submit (after pick)
 *   - Esc   : reset selection (after wrong feedback)
 *
 * Accessibility:
 *   - role="radiogroup" with labelledby pointing at the stem
 *   - each option a <button role="radio" aria-checked>
 *   - aria-live="polite" on feedback
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MCQCard as MCQCardData } from '../../types/card-schema';

export interface MCQCardProps {
  card: MCQCardData;
  onComplete: (correct: boolean) => void;
}

const LETTERS = ['A', 'B', 'C', 'D'] as const;

/** djb2-ish stable hash → 0..2^32-1 */
function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Deterministically shuffle an array of strings using a card-id seed. */
function deterministicShuffle<T>(arr: T[], seed: number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export function MCQCard({ card, onComplete }: MCQCardProps) {
  const options = useMemo(() => {
    const all = [card.correct, ...card.distractors];
    return deterministicShuffle(all, hashStr(card.id));
  }, [card.id, card.correct, card.distractors]);

  const correctIdx = options.indexOf(card.correct);

  const [picked, setPicked] = useState<number | null>(null);
  const [grade, setGrade] = useState<{ pass: boolean } | null>(null);

  useEffect(() => {
    setPicked(null);
    setGrade(null);
  }, [card.id]);

  const handlePick = useCallback(
    (idx: number) => {
      if (grade?.pass) return; // Locked after pass
      setPicked(idx);
    },
    [grade]
  );

  const handleSubmit = useCallback(() => {
    if (picked === null) return;
    const pass = picked === correctIdx;
    setGrade({ pass });
    onComplete(pass);
  }, [picked, correctIdx, onComplete]);

  const handleReset = useCallback(() => {
    setPicked(null);
    setGrade(null);
  }, []);

  // Keyboard: 1-4 / a-d / Enter / Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k >= '1' && k <= '4') {
        e.preventDefault();
        handlePick(parseInt(k, 10) - 1);
      } else if (k >= 'a' && k <= 'd') {
        e.preventDefault();
        handlePick(k.charCodeAt(0) - 'a'.charCodeAt(0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape' && grade && !grade.pass) {
        e.preventDefault();
        handleReset();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlePick, handleSubmit, handleReset, grade]);

  return (
    <section
      className="mcq-root"
      role="application"
      aria-label={`Multiple choice — atom ${card.atomId}`}
    >
      <style>{MCQ_STYLES}</style>
      <header className="mcq-header">
        <h2 id="mcq-stem" className="mcq-stem">
          {card.stem}
        </h2>
      </header>

      <ul
        role="radiogroup"
        aria-labelledby="mcq-stem"
        className="mcq-options"
      >
        {options.map((opt, i) => {
          const isPicked = picked === i;
          const showCorrect = grade && i === correctIdx;
          const showWrong = grade && isPicked && !grade.pass;
          const cls = [
            'mcq-opt',
            isPicked ? 'is-picked' : '',
            showCorrect ? 'is-correct' : '',
            showWrong ? 'is-wrong' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <li key={i}>
              <button
                type="button"
                role="radio"
                aria-checked={isPicked}
                aria-label={`option ${LETTERS[i]}: ${opt}`}
                className={cls}
                onClick={() => handlePick(i)}
                disabled={grade?.pass === true}
              >
                <span className="mcq-letter" aria-hidden="true">
                  {LETTERS[i]}
                </span>
                <span className="mcq-text">{opt}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mcq-actions">
        <button
          type="button"
          className="mcq-btn mcq-btn--primary"
          onClick={handleSubmit}
          disabled={picked === null || grade?.pass === true}
          aria-label="submit answer (Enter)"
        >
          {grade?.pass ? 'Passed' : 'Submit (Enter)'}
        </button>
        {grade && !grade.pass && (
          <button
            type="button"
            className="mcq-btn"
            onClick={handleReset}
            aria-label="clear and try again (Esc)"
          >
            Try again (Esc)
          </button>
        )}
      </div>

      {grade && (
        <div
          className={`mcq-feedback ${grade.pass ? 'is-ok' : 'is-bad'}`}
          role="status"
          aria-live="polite"
        >
          <strong>{grade.pass ? '✓ correct' : '✗ not quite'}</strong>
          {!grade.pass && (
            <span>
              {' '}
              — correct answer was{' '}
              <code>{LETTERS[correctIdx]}</code>.
            </span>
          )}
          <details className="mcq-explain">
            <summary>show explanation</summary>
            <p>{card.explanation}</p>
          </details>
        </div>
      )}
    </section>
  );
}

const MCQ_STYLES = `
.mcq-root {
  font-family: var(--font-sans, system-ui, sans-serif);
  background: var(--bg-0, #0d1117);
  color: var(--text-0, #e6edf3);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 760px;
  margin: 0 auto;
}
.mcq-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--border-1, #30363d);
  padding-bottom: 10px;
}
.mcq-stem { margin: 0; font-size: 15px; line-height: 1.5; flex: 1; }
.mcq-meta { display: flex; gap: 8px; font-size: 11px; align-items: flex-start; }
.mcq-atom {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  padding: 2px 6px;
  border-radius: 3px;
  color: var(--accent-cyan, #79c0ff);
}
.mcq-q { color: var(--accent-org, #ffa657); padding: 2px 6px; }
.mcq-options { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.mcq-opt {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  color: var(--text-0, #e6edf3);
  padding: 10px 12px;
  border-radius: 4px;
  font: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  line-height: 1.45;
}
.mcq-opt:hover:not(:disabled) {
  border-color: var(--accent-cyan, #79c0ff);
}
.mcq-opt:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.mcq-opt:disabled { cursor: not-allowed; }
.mcq-opt.is-picked {
  border-color: var(--accent-cyan, #79c0ff);
  background: rgba(121,192,255,0.08);
}
.mcq-opt.is-correct {
  border-color: var(--accent-grn, #7ee787);
  background: rgba(126,231,135,0.08);
  color: var(--accent-grn, #7ee787);
}
.mcq-opt.is-wrong {
  border-color: var(--state-err, #f85149);
  background: rgba(248,81,73,0.08);
  color: var(--state-err, #f85149);
}
.mcq-letter {
  display: inline-flex;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  background: var(--bg-2, #1f2937);
  border-radius: 3px;
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  font-weight: 700;
  color: var(--accent-cyan, #79c0ff);
  flex-shrink: 0;
  margin-top: 1px;
}
.mcq-opt.is-correct .mcq-letter { color: var(--accent-grn, #7ee787); }
.mcq-opt.is-wrong .mcq-letter { color: var(--state-err, #f85149); }
.mcq-text {
  flex: 1;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  white-space: pre-wrap;
}
.mcq-actions { display: flex; gap: 8px; justify-content: flex-end; }
.mcq-btn {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  color: var(--text-0, #e6edf3);
  padding: 6px 14px;
  border-radius: 4px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.mcq-btn:hover:not(:disabled) {
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--accent-cyan, #79c0ff);
}
.mcq-btn:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.mcq-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.mcq-btn--primary {
  background: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  border-color: var(--accent-cyan, #79c0ff);
  font-weight: 600;
}
.mcq-feedback {
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid var(--border-1, #30363d);
  background: var(--bg-1, #161b22);
}
.mcq-feedback.is-ok { border-color: var(--accent-grn, #7ee787); color: var(--accent-grn, #7ee787); }
.mcq-feedback.is-bad { border-color: var(--state-err, #f85149); color: var(--state-err, #f85149); }
.mcq-feedback code {
  background: var(--bg-2, #1f2937);
  padding: 1px 5px;
  border-radius: 2px;
  color: var(--accent-cyan, #79c0ff);
}
.mcq-explain { margin-top: 8px; color: var(--text-1, #8b949e); }
.mcq-explain summary { cursor: pointer; color: var(--accent-cyan, #79c0ff); }
.mcq-explain p { margin: 6px 0 0; line-height: 1.5; }
`;

export default MCQCard;
