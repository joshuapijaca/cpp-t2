/**
 * CodeMemorizeCard.tsx — see code → hide → type verbatim. Phase A6 port
 * of src/components/CodeMemorize.tsx adapted to the v2 schema.
 *
 * Three phases:
 *   study : full code visible, "space to begin" hint
 *   input : code hidden, student types from memory
 *   pass / fail / final-fail : standard retry-once flow; final-fail
 *     re-shows the canonical code so the student can re-study.
 *
 * v2-shape diff from v1:
 *   - imports `CodeMemorizeCard` data type from ../../types/card-schema
 *   - reads card.section / card.question / card.code / card.keyChecks
 *   - completes via onComplete(boolean) — propagates pass/fail
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { gradeWrite } from '../../lib/grading-write';
import type { CodeMemorizeCard as CodeMemorizeCardData } from '../../types/card-schema';

type Phase = 'study' | 'input' | 'pass' | 'fail' | 'final-fail';

export interface CodeMemorizeCardProps {
  card: CodeMemorizeCardData;
  onComplete: (correct: boolean) => void;
}

export function CodeMemorizeCard({ card, onComplete }: CodeMemorizeCardProps) {
  const [phase, setPhase] = useState<Phase>('study');
  const [input, setInput] = useState('');
  const [retried, setRetried] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Reset on card change
  useEffect(() => {
    setPhase('study');
    setInput('');
    setRetried(false);
  }, [card.id]);

  // Focus textarea when entering input phase
  useEffect(() => {
    if (phase === 'input') inputRef.current?.focus();
  }, [phase]);

  const handleSubmit = useCallback(() => {
    if (phase !== 'input') return;
    const result = gradeWrite(input, {
      canonicalAnswer: card.code,
      keyChecks: card.keyChecks,
      forbiddenTokens: [],
      requireSemicolon: false,
    });
    if (result.pass) {
      setPhase('pass');
      window.setTimeout(() => onComplete(true), 700);
    } else if (!retried) {
      setPhase('fail');
      setRetried(true);
    } else {
      setPhase('final-fail');
    }
  }, [phase, input, card.code, card.keyChecks, retried]);

  // Global key handler — drives study → input → fail-retry-or-restudy.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === 'study' && e.code === 'Space') {
        e.preventDefault();
        setPhase('input');
      } else if (phase === 'fail' && e.code === 'Space') {
        e.preventDefault();
        setInput('');
        setPhase('input');
      } else if (phase === 'final-fail' && e.code === 'Space') {
        e.preventDefault();
        // Show code again for re-study, then re-attempt; signal pass=false.
        setInput('');
        setRetried(false);
        setPhase('study');
        onComplete(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, onComplete]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const cardClass =
    phase === 'pass'
      ? 'card card--graded-pass'
      : phase === 'fail' || phase === 'final-fail'
        ? 'card card--graded-fail'
        : 'card';

  const lineCount = card.code.split('\n').length;

  return (
    <div className={`${cardClass} cmem-card`}>
      <div className="write-spec">{card.question}</div>

      {phase === 'study' && (
        <div className="cmem-study">
          <div className="cmem-study__label">memorize this code:</div>
          <pre className="cmem-study__code">{card.code}</pre>
        </div>
      )}

      {(phase === 'input' || phase === 'fail' || phase === 'pass') && (
        <div className="write-input-area">
          <textarea
            ref={inputRef}
            className="write-input write-input--multi"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={phase !== 'input'}
            placeholder="type the code from memory"
            spellCheck={false}
            rows={Math.max(lineCount + 2, 6)}
          />
        </div>
      )}

      {phase === 'pass' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--pass">pass — memorized</div>
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
          <div className="feedback__title feedback__title--fail">correct code</div>
          <div className="feedback__detail">
            <pre className="write-expected">
              <code>{card.code}</code>
            </pre>
          </div>
        </div>
      )}

      <div className="kbd-hint">
        {phase === 'study' && (
          <>
            <span className="kbd">space</span> to hide code and begin typing
          </>
        )}
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
            <span className="kbd">space</span> to re-study
          </>
        )}
      </div>
    </div>
  );
}

export default CodeMemorizeCard;
