/**
 * ProceduralCard.tsx — write-from-prompt with 3-streak gate.
 *
 * "Procedural" in this codebase means: the student writes code from a
 * short prompt, and must succeed on a streak of three different prompts
 * (the canonical + variants) to count the card as mastered. Every streak
 * miss resets the counter.
 *
 * Schema:
 *   - section         : human-readable section label (eg "I/O — read int")
 *   - prompt          : the canonical prompt
 *   - expectedAnswer  : canonical written code
 *   - keyChecks       : must-contain tokens
 *   - variants        : array of {prompt, expectedAnswer} alternates
 *
 * Streak logic:
 *   - target streak = 3 (or fewer if total prompts < 3 — clamped).
 *   - On each Submit: gradeWrite() returns pass/fail.
 *     pass  → streak++; advance to a fresh prompt (round-robin).
 *             when streak >= target, onComplete(true).
 *     fail  → streak = 0; same prompt stays so the student can fix.
 *
 * Keyboard: Ctrl+Enter submits, Esc clears.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CodeEditor, type CodeEditorHandle } from '../primitives/CodeEditor';
import { gradeWrite, type WriteGradeResult } from '../../lib/grading-write';
import type { ProceduralCard as ProceduralCardData } from '../../types/card-schema';

export interface ProceduralCardProps {
  card: ProceduralCardData;
  onComplete: (correct: boolean) => void;
  /** How many consecutive passes count as mastery (defaults to 3). */
  targetStreak?: number;
}

interface PromptVariant {
  prompt: string;
  expectedAnswer: string;
}

export function ProceduralCard({
  card,
  onComplete,
  targetStreak = 3,
}: ProceduralCardProps) {
  // Canonical first; then schema variants. Round-robin when we run out.
  const variants = useMemo<PromptVariant[]>(
    () => [
      { prompt: card.prompt, expectedAnswer: card.expectedAnswer },
      ...card.variants,
    ],
    [card.prompt, card.expectedAnswer, card.variants]
  );

  // Effective target = min(targetStreak, len(variants)) — never more than the
  // number of distinct prompts we have, otherwise we'd repeat.
  const effectiveTarget = Math.min(targetStreak, variants.length);

  const [variantIdx, setVariantIdx] = useState(0);
  const [code, setCode] = useState('');
  const [streak, setStreak] = useState(0);
  const [grade, setGrade] = useState<WriteGradeResult | null>(null);
  const editorRef = useRef<CodeEditorHandle | null>(null);

  const current = variants[variantIdx]!;

  // Fresh card → fresh state.
  useEffect(() => {
    setVariantIdx(0);
    setCode('');
    setStreak(0);
    setGrade(null);
    requestAnimationFrame(() => editorRef.current?.focus());
  }, [card.id]);

  const handleSubmit = useCallback(() => {
    const result = gradeWrite(code, {
      canonicalAnswer: current.expectedAnswer,
      keyChecks: card.keyChecks,
      forbiddenTokens: [],
      requireSemicolon: false,
    });
    setGrade(result);

    if (result.pass) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak >= effectiveTarget) {
        onComplete(true);
      } else {
        // Advance to next variant (wrap), reset editor.
        setTimeout(() => {
          setVariantIdx((i) => (i + 1) % variants.length);
          setCode('');
          setGrade(null);
          editorRef.current?.focus();
        }, 800);
      }
    } else {
      setStreak(0);
    }
  }, [
    code,
    current.expectedAnswer,
    card.keyChecks,
    streak,
    effectiveTarget,
    onComplete,
    variants.length,
  ]);

  const handleReset = useCallback(() => {
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
        handleReset();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleSubmit, handleReset, grade]);

  return (
    <section
      className="pc-root"
      role="application"
      aria-label={`Procedural — ${card.section}`}
    >
      <style>{PC_STYLES}</style>

      <header className="pc-header">
        <h2 className="pc-stem">{card.stem}</h2>
        <div className="pc-meta">
          <StreakIndicator streak={streak} target={effectiveTarget} />
        </div>
      </header>

      <p className="pc-prompt" aria-live="polite">
        <span>{current.prompt}</span>
      </p>

      <div className="pc-editor">
        <CodeEditor
          ref={editorRef}
          value={code}
          onChange={setCode}
          language="cpp"
          ariaLabel="C++ code editor — write your answer here"
          showBraceMatch
          lineNumbers
        />
      </div>

      <div className="pc-actions">
        <button
          type="button"
          className="pc-btn pc-btn--primary"
          onClick={handleSubmit}
          aria-label="submit (Ctrl+Enter)"
        >
          Submit (Ctrl+Enter)
        </button>
        <button
          type="button"
          className="pc-btn"
          onClick={handleReset}
          aria-label="clear editor (Esc)"
          disabled={code.length === 0}
        >
          Clear (Esc)
        </button>
      </div>

      {grade && (
        <div
          className={`pc-feedback ${grade.pass ? 'is-ok' : 'is-bad'}`}
          role="status"
          aria-live="polite"
        >
          <strong>
            {grade.pass
              ? `✓ pass · streak ${streak}/${effectiveTarget}`
              : '✗ not yet'}
          </strong>
          {!grade.pass && grade.errors[0] && (
            <p className="pc-err">{grade.errors[0].message}</p>
          )}
        </div>
      )}
    </section>
  );
}

interface StreakIndicatorProps {
  streak: number;
  target: number;
}
function StreakIndicator({ streak, target }: StreakIndicatorProps) {
  const dots: React.ReactNode[] = [];
  for (let i = 0; i < target; i++) {
    dots.push(
      <span
        key={i}
        className={`pc-dot ${i < streak ? 'is-on' : ''}`}
        aria-hidden="true"
      />
    );
  }
  return (
    <div
      className="pc-streak"
      role="status"
      aria-label={`streak ${streak} of ${target}`}
    >
      <span className="pc-streak-label">streak</span>
      <span className="pc-streak-dots">{dots}</span>
    </div>
  );
}

const PC_STYLES = `
.pc-root {
  font-family: var(--font-sans, system-ui, sans-serif);
  background: var(--bg-0, #0d1117);
  color: var(--text-0, #e6edf3);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 1080px;
  margin: 0 auto;
}
.pc-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--border-1, #30363d);
  padding-bottom: 10px;
}
.pc-section {
  display: inline-block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--accent-org, #ffa657);
  margin-bottom: 4px;
}
.pc-stem { margin: 0; font-size: 14px; line-height: 1.4; }
.pc-meta { display: flex; gap: 10px; align-items: center; font-size: 11px; flex-wrap: wrap; justify-content: flex-end; }
.pc-atom {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  padding: 2px 6px;
  border-radius: 3px;
  color: var(--accent-cyan, #79c0ff);
}
.pc-q { color: var(--accent-org, #ffa657); padding: 2px 6px; }
.pc-streak {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  padding: 3px 8px;
  border-radius: 3px;
}
.pc-streak-label {
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--text-2, #6e7681);
}
.pc-streak-dots { display: inline-flex; gap: 4px; }
.pc-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--bg-3, #2d333b);
  border: 1px solid var(--border-1, #30363d);
}
.pc-dot.is-on {
  background: var(--accent-grn, #7ee787);
  border-color: var(--accent-grn, #7ee787);
  box-shadow: 0 0 4px rgba(126,231,135,0.6);
}
.pc-prompt {
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
.pc-prompt-eyebrow {
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--accent-cyan, #79c0ff);
  font-weight: 700;
}
.pc-editor { display: flex; min-height: 220px; }
.pc-editor > * { flex: 1; min-height: 0; }
.pc-actions { display: flex; justify-content: flex-end; gap: 8px; }
.pc-btn {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  color: var(--text-0, #e6edf3);
  padding: 6px 14px;
  border-radius: 4px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.pc-btn:hover:not(:disabled) {
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--accent-cyan, #79c0ff);
}
.pc-btn:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.pc-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pc-btn--primary {
  background: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  border-color: var(--accent-cyan, #79c0ff);
  font-weight: 600;
}
.pc-feedback {
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid var(--border-1, #30363d);
  background: var(--bg-1, #161b22);
}
.pc-feedback.is-ok { border-color: var(--accent-grn, #7ee787); color: var(--accent-grn, #7ee787); }
.pc-feedback.is-bad { border-color: var(--state-err, #f85149); color: var(--state-err, #f85149); }
.pc-err { margin: 6px 0 0; font-size: 12px; line-height: 1.5; }
`;

export default ProceduralCard;
