/**
 * MemorizeCard.tsx — fact-recall flashcard. Phase A6 port of
 * src/components/MemorizeCard.tsx adapted to the v2 schema.
 *
 * Display → input → grade. The student types the fact verbatim from
 * memory; live exact-match auto-passes, otherwise Enter submits and
 * grades against keyChecks. One retry on fail before final-fail.
 *
 * v2-shape diff from v1:
 *   - imports `MemorizeCard` data type from ../../types/card-schema
 *   - uses card.atomId / card.fact / card.keyChecks / card.explanation /
 *     card.context — schema-locked names
 *   - completes via onComplete(boolean) — v1 had onAdvance() with no
 *     pass/fail signal; v2 propagates the result so the session-store
 *     can update exposure-counter familiarity correctly.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { normalizeLenient } from '../../lib/grading-write';
import type { MemorizeCard as MemorizeCardData } from '../../types/card-schema';

type Phase = 'display' | 'input' | 'graded-pass' | 'graded-fail' | 'final-fail';

const MODIFIER_KEYS = new Set<string>([
  'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
]);

export interface MemorizeCardProps {
  card: MemorizeCardData;
  onComplete: (correct: boolean) => void;
}

function gradeMemorize(input: string, keyChecks: string[]): boolean {
  if (keyChecks.length === 0) return input.trim().length > 0;
  const norm = normalizeLenient(input);
  return keyChecks.every((k) => norm.includes(normalizeLenient(k)));
}

export function MemorizeCard({ card, onComplete }: MemorizeCardProps) {
  const [phase, setPhase] = useState<Phase>('display');
  const [studentInput, setStudentInput] = useState('');
  const [retried, setRetried] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Reset on card change
  useEffect(() => {
    setPhase('display');
    setStudentInput('');
    setRetried(false);
  }, [card.id]);

  // Focus textarea when input phase begins
  useEffect(() => {
    if (phase === 'input') {
      inputRef.current?.focus();
    }
  }, [phase]);

  // Live exact-match auto-pass during input
  useEffect(() => {
    if (phase !== 'input') return;
    if (studentInput.length === 0) return;
    if (normalizeLenient(studentInput) === normalizeLenient(card.fact)) {
      setPhase('graded-pass');
      window.setTimeout(() => onComplete(true), 500);
    }
  }, [studentInput, phase, card.fact, onComplete]);

  const handleSubmit = useCallback(() => {
    if (phase !== 'input') return;
    const passed = gradeMemorize(studentInput, card.keyChecks);
    if (passed) {
      setPhase('graded-pass');
      window.setTimeout(() => onComplete(true), 500);
    } else if (!retried) {
      setPhase('graded-fail');
      setRetried(true);
    } else {
      setPhase('final-fail');
      window.setTimeout(() => onComplete(false), 1200);
    }
  }, [phase, studentInput, card.keyChecks, retried, onComplete]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Global key handler for non-input phases
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === 'display') {
        if (MODIFIER_KEYS.has(e.key)) return;
        e.preventDefault();
        setPhase('input');
      } else if (phase === 'graded-fail' && e.code === 'Space') {
        e.preventDefault();
        setStudentInput('');
        setPhase('display');
      } else if (phase === 'final-fail' && e.code === 'Space') {
        e.preventDefault();
        onComplete(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, onComplete]);

  const cardClass =
    phase === 'graded-pass'
      ? 'card card--graded-pass'
      : phase === 'graded-fail' || phase === 'final-fail'
        ? 'card card--graded-fail'
        : 'card';

  const factVisible = phase === 'display' || phase === 'final-fail';

  return (
    <div className={cardClass}>
      {card.context && (
        <div
          className={
            factVisible
              ? 'memorize-context'
              : 'memorize-context memorize-context--hidden'
          }
        >
          {card.context}
        </div>
      )}

      <div
        className={
          factVisible
            ? 'memorize-fact'
            : 'memorize-fact memorize-fact--hidden'
        }
      >
        {card.fact}
      </div>

      {card.codeExample && (
        <pre className="memorize-code">{card.codeExample}</pre>
      )}

      {(phase === 'input' || phase === 'graded-fail' || phase === 'graded-pass') && (
        <div className="input-area">
          <label className="input-area__label" htmlFor={`memorize-${card.id}`}>
            type the fact verbatim
          </label>
          <textarea
            id={`memorize-${card.id}`}
            ref={inputRef}
            className="input-area__textarea"
            value={studentInput}
            onChange={(e) => setStudentInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={phase !== 'input'}
            rows={2}
            spellCheck={false}
          />
        </div>
      )}

      {phase === 'graded-pass' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--pass">pass</div>
        </div>
      )}

      {phase === 'graded-fail' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--fail">not quite — see fact again</div>
          <div className="feedback__detail">
            <div>
              expected one of: <strong>{card.keyChecks.join(', ')}</strong>
            </div>
            <div className="explanation">{card.explanation}</div>
          </div>
        </div>
      )}

      {phase === 'final-fail' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--fail">correct answer</div>
          <div className="feedback__detail">
            <strong>{card.fact}</strong>
            <div className="explanation">{card.explanation}</div>
          </div>
        </div>
      )}

      <div className="kbd-hint">
        {phase === 'display' && (
          <>
            <span className="kbd">any key</span> to start typing
          </>
        )}
        {phase === 'input' && <>type from memory — auto-advance on match</>}
        {phase === 'graded-fail' && (
          <>
            <span className="kbd">space</span> to see fact again
          </>
        )}
        {phase === 'final-fail' && (
          <>
            <span className="kbd">space</span> to continue
          </>
        )}
      </div>
    </div>
  );
}

export default MemorizeCard;
