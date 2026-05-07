/**
 * WriteCard.tsx — generic write card. Phase A6 port of
 * src/components/WriteCard.tsx adapted to the v2 schema.
 *
 * Three difficulty levels keyed off card.writeLevel:
 *   1 = single-line fill-in (input field, Enter submits)
 *   2 = multi-line complete-body (textarea, Ctrl+Enter submits)
 *   3 = multi-line free-form (taller textarea, Ctrl+Enter submits)
 *
 * Generic write — distinct from StructWriteCard / FunctionWriteCard /
 * MainWriteCard which target the Q2/Q3/Q4 exam shapes.
 *
 * v2-shape diff from v1:
 *   - imports `WriteCard` data type from ../../types/card-schema
 *   - reads card.writeLevel (renamed from v1 `level` to avoid collision
 *     with the L0..L5 deck-level field on every v2 card)
 *   - completes via onComplete(boolean) — propagates pass/fail to caller
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { gradeWrite } from '../../lib/grading-write';
import type { WriteCard as WriteCardData } from '../../types/card-schema';

type Phase = 'input' | 'graded-pass' | 'graded-fail' | 'final-fail';

export interface WriteCardProps {
  card: WriteCardData;
  onComplete: (correct: boolean) => void;
}

export function WriteCard({ card, onComplete }: WriteCardProps) {
  const [phase, setPhase] = useState<Phase>('input');
  const [studentInput, setStudentInput] = useState('');
  const [retried, setRetried] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);

  // Reset on card change
  useEffect(() => {
    setPhase('input');
    setStudentInput('');
    setRetried(false);
  }, [card.id]);

  // Focus input when entering input phase
  useEffect(() => {
    if (phase === 'input') {
      inputRef.current?.focus();
    }
  }, [phase]);

  const handleSubmit = useCallback(() => {
    if (phase !== 'input') return;
    const result = gradeWrite(studentInput, {
      canonicalAnswer: card.expectedAnswer,
      keyChecks: card.keyChecks,
      forbiddenTokens: card.forbidden,
      requireSemicolon: card.writeLevel !== 1,
    });
    if (result.pass) {
      setPhase('graded-pass');
      window.setTimeout(() => onComplete(true), 700);
    } else if (!retried) {
      setPhase('graded-fail');
      setRetried(true);
    } else {
      setPhase('final-fail');
      window.setTimeout(() => onComplete(false), 1500);
    }
  }, [
    phase,
    studentInput,
    card.expectedAnswer,
    card.keyChecks,
    card.forbidden,
    card.writeLevel,
    retried,
    onComplete,
  ]);

  const handleRetry = useCallback(() => {
    setStudentInput('');
    setPhase('input');
  }, []);

  const handleKeyMulti = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleKeySingle = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Global key handler for non-input phases
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === 'graded-fail' && e.code === 'Space') {
        e.preventDefault();
        handleRetry();
      } else if (phase === 'final-fail' && e.code === 'Space') {
        e.preventDefault();
        onComplete(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, onComplete, handleRetry]);

  const cardClass =
    phase === 'graded-pass'
      ? 'card card--graded-pass'
      : phase === 'graded-fail' || phase === 'final-fail'
        ? 'card card--graded-fail'
        : 'card';

  const levelLabel =
    card.writeLevel === 1
      ? 'fill blank'
      : card.writeLevel === 2
        ? 'complete body'
        : 'free form';

  return (
    <div className={`${cardClass} write-card`}>
      <div className="atom-id">
        {card.level} · {card.atomId} · write · {levelLabel}
      </div>

      <div className="write-spec">{card.spec}</div>

      {card.template && (
        <pre className="write-template">
          <code>{card.template}</code>
        </pre>
      )}

      {(phase === 'input' || phase === 'graded-fail' || phase === 'graded-pass') && (
        <div className="write-input-area">
          {card.writeLevel === 1 ? (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              className="write-input write-input--single"
              value={studentInput}
              onChange={(e) => setStudentInput(e.target.value)}
              onKeyDown={handleKeySingle}
              disabled={phase !== 'input'}
              placeholder="answer"
              spellCheck={false}
            />
          ) : (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              className="write-input write-input--multi"
              value={studentInput}
              onChange={(e) => setStudentInput(e.target.value)}
              onKeyDown={handleKeyMulti}
              disabled={phase !== 'input'}
              placeholder={card.writeLevel === 2 ? 'fill the blank' : 'write your answer'}
              spellCheck={false}
              rows={card.writeLevel === 3 ? 8 : 4}
            />
          )}
        </div>
      )}

      {phase === 'graded-pass' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--pass">pass</div>
        </div>
      )}

      {phase === 'graded-fail' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--fail">not quite — retry once</div>
          <div className="feedback__detail">
            <div>
              required tokens: <code>{card.keyChecks.join(', ')}</code>
            </div>
            {card.forbidden && card.forbidden.length > 0 && (
              <div>
                must NOT contain: <code>{card.forbidden.join(', ')}</code>
              </div>
            )}
            <div className="explanation">{card.explanation}</div>
          </div>
        </div>
      )}

      {phase === 'final-fail' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--fail">correct answer</div>
          <div className="feedback__detail">
            <pre className="write-expected">
              <code>{card.expectedAnswer}</code>
            </pre>
            <div className="explanation">{card.explanation}</div>
          </div>
        </div>
      )}

      <div className="kbd-hint">
        {phase === 'input' && card.writeLevel === 1 && (
          <>
            <span className="kbd">enter</span> to submit
          </>
        )}
        {phase === 'input' && card.writeLevel !== 1 && (
          <>
            <span className="kbd">ctrl</span>+<span className="kbd">enter</span> to submit
          </>
        )}
        {phase === 'graded-fail' && (
          <>
            <span className="kbd">space</span> to retry
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

export default WriteCard;
