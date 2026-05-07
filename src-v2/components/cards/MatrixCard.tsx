/**
 * MatrixCard.tsx — RAVEN-style pattern-transfer puzzle. Phase A6 port
 * of src/components/CodeMatrix.tsx adapted to the v2 schema.
 *
 * Student is shown N example pairs (label + code), then must produce
 * the corresponding code for the new prompt. Variants:
 *   - 'algorithm' : transfer an algorithm to a new entity
 *   - 'entity'    : swap entities while keeping the algorithm
 *   - 'progression' : raise the complexity of the prior example
 *
 * v2-shape diff from v1:
 *   - imports `MatrixCard` data type from ../../types/card-schema
 *   - reads card.matrixType / card.examples / card.expectedAnswer /
 *     card.keyChecks straight from the schema
 *   - completes via onComplete(boolean) — propagates pass/fail
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { gradeWrite } from '../../lib/grading-write';
import type { MatrixCard as MatrixCardData } from '../../types/card-schema';

type Phase = 'input' | 'pass' | 'fail' | 'final-fail';

export interface MatrixCardProps {
  card: MatrixCardData;
  onComplete: (correct: boolean) => void;
}

export function MatrixCard({ card, onComplete }: MatrixCardProps) {
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>('input');
  const [retried, setRetried] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setInput('');
    setPhase('input');
    setRetried(false);
  }, [card.id]);

  useEffect(() => {
    if (phase === 'input') inputRef.current?.focus();
  }, [phase]);

  const handleSubmit = useCallback(() => {
    if (phase !== 'input') return;
    const result = gradeWrite(input, {
      canonicalAnswer: card.expectedAnswer,
      keyChecks: card.keyChecks,
      forbiddenTokens: [],
      requireSemicolon: true,
    });
    if (result.pass) {
      setPhase('pass');
      window.setTimeout(() => onComplete(true), 700);
    } else if (!retried) {
      setPhase('fail');
      setRetried(true);
    } else {
      setPhase('final-fail');
      window.setTimeout(() => onComplete(false), 1500);
    }
  }, [phase, input, card.expectedAnswer, card.keyChecks, retried, onComplete]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === 'fail' && e.code === 'Space') {
        e.preventDefault();
        setInput('');
        setPhase('input');
      } else if (phase === 'final-fail' && e.code === 'Space') {
        e.preventDefault();
        onComplete(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, onComplete]);

  const cardClass =
    phase === 'pass'
      ? 'card card--graded-pass'
      : phase === 'fail' || phase === 'final-fail'
        ? 'card card--graded-fail'
        : 'card';

  const typeLabel =
    card.matrixType === 'algorithm'
      ? 'Algorithm Transfer'
      : card.matrixType === 'entity'
        ? 'Entity Swap'
        : 'Complexity Progression';

  return (
    <div className={`${cardClass} matrix-card`}>
      <div className="atom-id">
        {card.level} · Code Matrix · {typeLabel} · {card.atomId}
      </div>

      <div className="matrix-examples">
        {card.examples.map((ex, i) => (
          <div key={i} className="matrix-example">
            <div className="matrix-example__label">{ex.label}</div>
            <pre className="matrix-example__code">{ex.code}</pre>
          </div>
        ))}
      </div>

      <div className="matrix-divider">
        <span className="matrix-divider__arrow">your turn</span>
      </div>

      <div className="write-spec">{card.prompt}</div>

      {(phase === 'input' || phase === 'fail' || phase === 'pass') && (
        <div className="write-input-area">
          <textarea
            ref={inputRef}
            className="write-input write-input--multi"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={phase !== 'input'}
            placeholder="write your answer"
            spellCheck={false}
            rows={10}
          />
        </div>
      )}

      {phase === 'pass' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--pass">pass — pattern transferred</div>
        </div>
      )}

      {phase === 'fail' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--fail">not quite — retry</div>
          <div className="feedback__detail">
            <div>
              required: <code>{card.keyChecks.join(', ')}</code>
            </div>
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
          </div>
        </div>
      )}

      <div className="kbd-hint">
        {phase === 'input' && (
          <>
            <span className="kbd">ctrl</span>+<span className="kbd">enter</span> to submit
          </>
        )}
        {phase === 'fail' && (
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

export default MatrixCard;
