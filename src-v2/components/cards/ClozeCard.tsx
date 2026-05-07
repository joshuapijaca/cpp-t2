/**
 * ClozeCard.tsx — fill-in-the-blank over a code template.
 *
 * The card.code field contains one or more `___` (3+ underscores) blanks.
 * Student types into each blank inline; the canonical `answer` is matched
 * against the joined cloze input via lenient-normalize char-match.
 *
 * Layout:
 *   ┌────────────────────────────────────────────┐
 *   │  stem ........................ atom-id    │
 *   ├────────────────────────────────────────────┤
 *   │  clozeSentence (English context)           │
 *   ├────────────────────────────────────────────┤
 *   │  code with inline <input> per ___ blank    │
 *   ├────────────────────────────────────────────┤
 *   │  [Submit (Enter)]   [Try again]            │
 *   └────────────────────────────────────────────┘
 *
 * Accessibility:
 *   - each blank is a labelled <input>.
 *   - Enter submits, Esc clears feedback.
 *   - aria-live for grade banner.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { normalizeLenient } from '../../lib/grading-write';
import type { ClozeCard as ClozeCardData } from '../../types/card-schema';

export interface ClozeCardProps {
  card: ClozeCardData;
  onComplete: (correct: boolean) => void;
}

interface Segment {
  kind: 'text' | 'blank';
  value: string;
  /** If kind === 'blank', the index in the answers array. */
  blankIdx?: number;
}

/** Split code on `___` (3+ underscores) — each gap becomes a blank. */
function splitClozeCode(code: string): Segment[] {
  const out: Segment[] = [];
  const re = /_{3,}/g;
  let lastIdx = 0;
  let blankIdx = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) {
    if (m.index > lastIdx) {
      out.push({ kind: 'text', value: code.slice(lastIdx, m.index) });
    }
    out.push({ kind: 'blank', value: '', blankIdx: blankIdx++ });
    lastIdx = m.index + m[0].length;
  }
  if (lastIdx < code.length) {
    out.push({ kind: 'text', value: code.slice(lastIdx) });
  }
  // Fallback: if there were no blanks, present the entire `answer` as a single blank
  // appended at the end so the student still has somewhere to type.
  if (blankIdx === 0) {
    out.push({ kind: 'text', value: '\n' });
    out.push({ kind: 'blank', value: '', blankIdx: 0 });
  }
  return out;
}

export function ClozeCard({ card, onComplete }: ClozeCardProps) {
  const segments = useMemo(() => splitClozeCode(card.code), [card.code]);
  const blankCount = segments.filter((s) => s.kind === 'blank').length;

  const [answers, setAnswers] = useState<string[]>(() =>
    new Array(blankCount).fill('')
  );
  const [grade, setGrade] = useState<{ pass: boolean; reason: string } | null>(
    null
  );
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  // Reset on card change.
  useEffect(() => {
    setAnswers(new Array(blankCount).fill(''));
    setGrade(null);
    requestAnimationFrame(() => firstInputRef.current?.focus());
  }, [card.id, blankCount]);

  const onChangeBlank = useCallback((idx: number, next: string) => {
    setAnswers((prev) => {
      const out = prev.slice();
      out[idx] = next;
      return out;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    // Reconstruct the full code with the student's answers spliced in.
    const filled = segments
      .map((s) =>
        s.kind === 'blank' ? (answers[s.blankIdx!] ?? '') : s.value
      )
      .join('');

    // Compare to the card-level canonical (which is the same code with the
    // canonical answer in place of `___`). We treat `card.answer` as the
    // single canonical string when there's exactly one blank, otherwise we
    // compare the entire reconstructed snippet against an answer-spliced
    // version of card.code (cheap and forgiving).
    const studentN = normalizeLenient(filled);
    const canonicalN = normalizeLenient(
      card.code.replace(/_{3,}/g, card.answer)
    );

    // Also accept exact-match on the joined answer (handles single-blank
    // cards where `card.answer` is just the missing token).
    const joinedAnswerN = normalizeLenient(answers.join(' '));
    const directAnswerN = normalizeLenient(card.answer);

    const pass =
      studentN === canonicalN ||
      joinedAnswerN === directAnswerN ||
      studentN.includes(directAnswerN);

    setGrade({
      pass,
      reason: pass
        ? 'Matches the canonical answer.'
        : `Expected: ${card.answer}`,
    });
    onComplete(pass);
  }, [segments, answers, card.code, card.answer, onComplete]);

  const handleRetry = useCallback(() => {
    setAnswers(new Array(blankCount).fill(''));
    setGrade(null);
    requestAnimationFrame(() => firstInputRef.current?.focus());
  }, [blankCount]);

  // Enter submits, Esc retries.
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape' && grade) {
        e.preventDefault();
        handleRetry();
      }
    },
    [handleSubmit, handleRetry, grade]
  );

  return (
    <section
      className="cz-root"
      role="application"
      aria-label={`Cloze exercise — atom ${card.atomId}`}
    >
      <style>{CZ_STYLES}</style>

      <header className="cz-header">
        <h2 className="cz-stem">{card.stem}</h2>
        <div className="cz-meta">
          <span className="cz-atom">{card.atomId}</span>
          <span className="cz-q">{card.qTags.join(' · ')}</span>
        </div>
      </header>

      <p className="cz-sentence" aria-label="cloze sentence">
        {card.clozeSentence}
      </p>

      <pre className="cz-code" aria-label="code with blanks">
        {segments.map((seg, i) =>
          seg.kind === 'text' ? (
            <span key={i} className="cz-text">
              {seg.value}
            </span>
          ) : (
            <input
              key={i}
              ref={seg.blankIdx === 0 ? firstInputRef : null}
              type="text"
              className={`cz-blank ${grade ? (grade.pass ? 'is-ok' : 'is-bad') : ''}`}
              aria-label={`blank ${(seg.blankIdx ?? 0) + 1} of ${blankCount}`}
              value={answers[seg.blankIdx!] ?? ''}
              onChange={(e) => onChangeBlank(seg.blankIdx!, e.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              size={Math.max(8, (answers[seg.blankIdx!] ?? '').length + 2)}
            />
          )
        )}
      </pre>

      <div className="cz-actions">
        <button
          type="button"
          className="cz-btn cz-btn--primary"
          onClick={handleSubmit}
          disabled={grade?.pass === true}
          aria-label="submit cloze (Enter)"
        >
          {grade?.pass ? 'Passed' : 'Submit (Enter)'}
        </button>
        {grade && !grade.pass && (
          <button
            type="button"
            className="cz-btn"
            onClick={handleRetry}
            aria-label="reset blanks and try again"
          >
            Try again (Esc)
          </button>
        )}
      </div>

      {grade && (
        <div
          className={`cz-feedback ${grade.pass ? 'is-ok' : 'is-bad'}`}
          role="status"
          aria-live="polite"
        >
          <strong>{grade.pass ? '✓ pass' : '✗ not yet'}</strong>{' '}
          <span>{grade.reason}</span>
          {!grade.pass && (
            <details className="cz-explain">
              <summary>show explanation</summary>
              <p>{card.explanation}</p>
            </details>
          )}
        </div>
      )}
    </section>
  );
}

const CZ_STYLES = `
.cz-root {
  font-family: var(--font-sans, system-ui, sans-serif);
  background: var(--bg-0, #0d1117);
  color: var(--text-0, #e6edf3);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 920px;
  margin: 0 auto;
}
.cz-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  border-bottom: 1px solid var(--border-1, #30363d);
  padding-bottom: 10px;
}
.cz-stem { margin: 0; font-size: 14px; line-height: 1.5; flex: 1; }
.cz-meta { display: flex; gap: 8px; font-size: 11px; }
.cz-atom {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  padding: 2px 6px;
  border-radius: 3px;
  color: var(--accent-cyan, #79c0ff);
}
.cz-q { color: var(--accent-org, #ffa657); padding: 2px 6px; }
.cz-sentence {
  margin: 0;
  padding: 8px 12px;
  background: var(--bg-1, #161b22);
  border-left: 3px solid var(--accent-cyan, #79c0ff);
  border-radius: 3px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-1, #8b949e);
}
.cz-code {
  margin: 0;
  padding: 12px 14px;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-x: auto;
}
.cz-text { white-space: pre-wrap; }
.cz-blank {
  background: var(--bg-2, #1f2937);
  border: 0;
  border-bottom: 2px solid var(--accent-cyan, #79c0ff);
  color: var(--accent-grn, #7ee787);
  font-family: inherit;
  font-size: inherit;
  padding: 1px 4px;
  margin: 0 2px;
  outline: 0;
  min-width: 64px;
}
.cz-blank:focus-visible {
  background: var(--bg-3, #2d333b);
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.cz-blank.is-ok { border-bottom-color: var(--accent-grn, #7ee787); }
.cz-blank.is-bad { border-bottom-color: var(--state-err, #f85149); }
.cz-actions { display: flex; gap: 8px; justify-content: flex-end; }
.cz-btn {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  color: var(--text-0, #e6edf3);
  padding: 6px 14px;
  border-radius: 4px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.cz-btn:hover:not(:disabled) {
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--accent-cyan, #79c0ff);
}
.cz-btn:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.cz-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.cz-btn--primary {
  background: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  font-weight: 600;
  border-color: var(--accent-cyan, #79c0ff);
}
.cz-feedback {
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid var(--border-1, #30363d);
  background: var(--bg-1, #161b22);
}
.cz-feedback.is-ok {
  border-color: var(--accent-grn, #7ee787);
  color: var(--accent-grn, #7ee787);
}
.cz-feedback.is-bad {
  border-color: var(--state-err, #f85149);
  color: var(--state-err, #f85149);
}
.cz-explain { margin-top: 8px; font-size: 12px; color: var(--text-1, #8b949e); }
.cz-explain summary { cursor: pointer; color: var(--accent-cyan, #79c0ff); }
`;

export default ClozeCard;
