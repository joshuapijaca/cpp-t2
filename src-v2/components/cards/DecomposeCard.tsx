/**
 * DecomposeCard.tsx — A/B/C/D pick-the-correct-explanation MCQ.
 *
 * Schema:
 *   - code         : code snippet shown above the question (read-only)
 *   - question     : "what does this do?" / "why does this work?"
 *   - options      : tuple of 4 {label, text}
 *   - correctLabel : label of the right answer (e.g. "B")
 *
 * Variant: Decompose differs from MCQ in that options are AUTHORED with
 * their own labels (e.g. canonical taxonomy A/B/C/D), so we DON'T shuffle.
 * This preserves the authored labels in feedback ("the answer is B").
 *
 * The `task` mentions multi-select / set-equality grading — the schema
 * defines a single correctLabel, but we accept space- or comma-separated
 * `correctLabel` values like `"A,C"` for multi-correct decompose drills,
 * and grade as a SET-EQUALITY between picked-set and correct-set.
 *
 * Keyboard:
 *   - 1-4 / a-d : toggle option (multi-select-friendly)
 *   - Enter : submit
 *   - Esc   : reset
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DecomposeCard as DecomposeCardData } from '../../types/card-schema';

export interface DecomposeCardProps {
  card: DecomposeCardData;
  onComplete: (correct: boolean) => void;
}

/** Parse the schema's `correctLabel` ("B", "A,C", "A C") into a Set. */
function parseCorrect(raw: string): Set<string> {
  return new Set(
    raw
      .split(/[,\s]+/g)
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length > 0)
  );
}

function setsEqual<T>(a: Set<T>, b: Set<T>): boolean {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

export function DecomposeCard({ card, onComplete }: DecomposeCardProps) {
  const correctSet = useMemo(
    () => parseCorrect(card.correctLabel),
    [card.correctLabel]
  );
  const isMultiSelect = correctSet.size > 1;

  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [grade, setGrade] = useState<{ pass: boolean } | null>(null);

  useEffect(() => {
    setPicked(new Set());
    setGrade(null);
  }, [card.id]);

  const togglePick = useCallback(
    (label: string) => {
      if (grade?.pass) return;
      setPicked((prev) => {
        const next = new Set(prev);
        const upper = label.toUpperCase();
        if (next.has(upper)) {
          next.delete(upper);
        } else {
          if (!isMultiSelect) next.clear();
          next.add(upper);
        }
        return next;
      });
    },
    [grade, isMultiSelect]
  );

  const handleSubmit = useCallback(() => {
    if (picked.size === 0) return;
    const pass = setsEqual(picked, correctSet);
    setGrade({ pass });
    onComplete(pass);
  }, [picked, correctSet, onComplete]);

  const handleReset = useCallback(() => {
    setPicked(new Set());
    setGrade(null);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k >= '1' && k <= '4') {
        e.preventDefault();
        const opt = card.options[parseInt(k, 10) - 1];
        if (opt) togglePick(opt.label);
      } else if (k >= 'a' && k <= 'd') {
        e.preventDefault();
        togglePick(k.toUpperCase());
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
  }, [togglePick, handleSubmit, handleReset, card.options, grade]);

  return (
    <section
      className="dec-root"
      role="application"
      aria-label={`Decompose — atom ${card.atomId}`}
    >
      <style>{DEC_STYLES}</style>

      <header className="dec-header">
        <h2 id="dec-stem" className="dec-stem">
          {card.stem}
        </h2>
        <div className="dec-meta">
          <span className="dec-atom">{card.atomId}</span>
          <span className="dec-q">{card.qTags.join(' · ')}</span>
        </div>
      </header>

      <pre className="dec-code" aria-label="code under analysis" tabIndex={0}>
        {card.code}
      </pre>

      <p className="dec-question">{card.question}</p>

      <ul
        role={isMultiSelect ? 'group' : 'radiogroup'}
        aria-labelledby="dec-stem"
        className="dec-options"
      >
        {card.options.map((opt) => {
          const upper = opt.label.toUpperCase();
          const isPicked = picked.has(upper);
          const showCorrect = grade && correctSet.has(upper);
          const showWrong = grade && isPicked && !correctSet.has(upper);
          const cls = [
            'dec-opt',
            isPicked ? 'is-picked' : '',
            showCorrect ? 'is-correct' : '',
            showWrong ? 'is-wrong' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <li key={opt.label}>
              <button
                type="button"
                role={isMultiSelect ? 'checkbox' : 'radio'}
                aria-checked={isPicked}
                className={cls}
                onClick={() => togglePick(opt.label)}
                disabled={grade?.pass === true}
                aria-label={`option ${opt.label}: ${opt.text}`}
              >
                <span className="dec-letter" aria-hidden="true">
                  {opt.label}
                </span>
                <span className="dec-text">{opt.text}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="dec-actions">
        {isMultiSelect && (
          <span className="dec-hint" aria-live="polite">
            picked: {Array.from(picked).sort().join(', ') || '(none)'}
          </span>
        )}
        <button
          type="button"
          className="dec-btn dec-btn--primary"
          onClick={handleSubmit}
          disabled={picked.size === 0 || grade?.pass === true}
          aria-label="submit (Enter)"
        >
          {grade?.pass ? 'Passed' : 'Submit (Enter)'}
        </button>
        {grade && !grade.pass && (
          <button
            type="button"
            className="dec-btn"
            onClick={handleReset}
            aria-label="reset and try again (Esc)"
          >
            Try again (Esc)
          </button>
        )}
      </div>

      {grade && (
        <div
          className={`dec-feedback ${grade.pass ? 'is-ok' : 'is-bad'}`}
          role="status"
          aria-live="polite"
        >
          <strong>{grade.pass ? '✓ correct' : '✗ not quite'}</strong>
          {!grade.pass && (
            <span>
              {' '}
              — correct {isMultiSelect ? 'set' : 'answer'} was{' '}
              <code>{Array.from(correctSet).sort().join(', ')}</code>.
            </span>
          )}
          <details className="dec-explain">
            <summary>show explanation</summary>
            <p>{card.explanation}</p>
          </details>
        </div>
      )}
    </section>
  );
}

const DEC_STYLES = `
.dec-root {
  font-family: var(--font-sans, system-ui, sans-serif);
  background: var(--bg-0, #0d1117);
  color: var(--text-0, #e6edf3);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 860px;
  margin: 0 auto;
}
.dec-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--border-1, #30363d);
  padding-bottom: 10px;
}
.dec-stem { margin: 0; font-size: 14px; line-height: 1.5; flex: 1; }
.dec-meta { display: flex; gap: 8px; font-size: 11px; }
.dec-atom {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  padding: 2px 6px;
  border-radius: 3px;
  color: var(--accent-cyan, #79c0ff);
}
.dec-q { color: var(--accent-org, #ffa657); padding: 2px 6px; }
.dec-code {
  margin: 0;
  padding: 12px 14px;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 13px;
  line-height: 1.55;
  white-space: pre-wrap;
  overflow-x: auto;
  color: var(--text-0, #e6edf3);
}
.dec-code:focus-visible { outline: 2px solid var(--accent-cyan, #79c0ff); outline-offset: -2px; }
.dec-question {
  margin: 0;
  font-size: 13px;
  color: var(--text-1, #8b949e);
  line-height: 1.5;
}
.dec-options { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.dec-opt {
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
.dec-opt:hover:not(:disabled) { border-color: var(--accent-cyan, #79c0ff); }
.dec-opt:focus-visible { outline: 2px solid var(--accent-cyan, #79c0ff); outline-offset: 2px; }
.dec-opt:disabled { cursor: not-allowed; }
.dec-opt.is-picked {
  border-color: var(--accent-cyan, #79c0ff);
  background: rgba(121,192,255,0.08);
}
.dec-opt.is-correct {
  border-color: var(--accent-grn, #7ee787);
  background: rgba(126,231,135,0.08);
  color: var(--accent-grn, #7ee787);
}
.dec-opt.is-wrong {
  border-color: var(--state-err, #f85149);
  background: rgba(248,81,73,0.08);
  color: var(--state-err, #f85149);
}
.dec-letter {
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
.dec-opt.is-correct .dec-letter { color: var(--accent-grn, #7ee787); }
.dec-opt.is-wrong .dec-letter { color: var(--state-err, #f85149); }
.dec-text { flex: 1; }
.dec-actions { display: flex; gap: 10px; justify-content: flex-end; align-items: center; }
.dec-hint {
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  color: var(--text-2, #6e7681);
  margin-right: auto;
}
.dec-btn {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  color: var(--text-0, #e6edf3);
  padding: 6px 14px;
  border-radius: 4px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.dec-btn:hover:not(:disabled) { border-color: var(--accent-cyan, #79c0ff); color: var(--accent-cyan, #79c0ff); }
.dec-btn:focus-visible { outline: 2px solid var(--accent-cyan, #79c0ff); outline-offset: 2px; }
.dec-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.dec-btn--primary {
  background: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  border-color: var(--accent-cyan, #79c0ff);
  font-weight: 600;
}
.dec-feedback {
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid var(--border-1, #30363d);
  background: var(--bg-1, #161b22);
}
.dec-feedback.is-ok { border-color: var(--accent-grn, #7ee787); color: var(--accent-grn, #7ee787); }
.dec-feedback.is-bad { border-color: var(--state-err, #f85149); color: var(--state-err, #f85149); }
.dec-feedback code {
  background: var(--bg-2, #1f2937);
  padding: 1px 5px;
  border-radius: 2px;
  color: var(--accent-cyan, #79c0ff);
}
.dec-explain { margin-top: 8px; color: var(--text-1, #8b949e); }
.dec-explain summary { cursor: pointer; color: var(--accent-cyan, #79c0ff); }
.dec-explain p { margin: 6px 0 0; line-height: 1.5; }
`;

export default DecomposeCard;
