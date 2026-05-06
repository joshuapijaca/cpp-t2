import { useEffect, useRef, useState } from 'react';
import type { WriteCard as WriteCardData } from '../types/card';
import { gradeWrite } from '../lib/grading';
import { levelOf } from '../lib/levels';

type Phase = 'input' | 'graded-pass' | 'graded-fail' | 'final-fail';

interface WriteCardProps {
  card: WriteCardData;
  onAdvance: () => void;
}

export function WriteCard({ card, onAdvance }: WriteCardProps) {
  const [phase, setPhase] = useState<Phase>('input');
  const [studentInput, setStudentInput] = useState('');
  const [retried, setRetried] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  // Reset on card change
  useEffect(() => {
    setPhase('input');
    setStudentInput('');
    setRetried(false);
  }, [card.atomId, card.spec, card.level]);

  // Focus input when entering input phase
  useEffect(() => {
    if (phase === 'input') {
      inputRef.current?.focus();
    }
  }, [phase]);

  const handleSubmit = () => {
    if (phase !== 'input') return;
    const passed = gradeWrite(
      studentInput,
      card.expectedAnswer,
      card.keyChecks,
      card.forbidden ?? []
    );
    if (passed) {
      setPhase('graded-pass');
      window.setTimeout(onAdvance, 700);
    } else if (!retried) {
      setPhase('graded-fail');
      setRetried(true);
    } else {
      setPhase('final-fail');
    }
  };

  const handleRetry = () => {
    setStudentInput('');
    setPhase('input');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.shiftKey === false && card.level === 1)) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Enter' && !e.shiftKey && card.level === 1) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleKeySingle = (e: React.KeyboardEvent) => {
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
        onAdvance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, onAdvance]);

  const cardClass =
    phase === 'graded-pass'
      ? 'card card--graded-pass'
      : phase === 'graded-fail' || phase === 'final-fail'
      ? 'card card--graded-fail'
      : 'card';

  const levelLabel = `L${card.level} · ${card.level === 1 ? 'fill blank' : card.level === 2 ? 'complete body' : 'free form'}`;

  return (
    <div className={`${cardClass} write-card`}>
      <div className="atom-id">
        {(() => { const l = levelOf(card.atomId); return l ? `${l.label} · ` : ''; })()}
        {card.atomId} · write · {levelLabel}
      </div>

      <div className="write-spec">{card.spec}</div>

      {card.template && (
        <pre className="write-template">
          <code>{card.template}</code>
        </pre>
      )}

      {(phase === 'input' || phase === 'graded-fail' || phase === 'graded-pass') && (
        <div className="write-input-area">
          {card.level === 1 ? (
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
              onKeyDown={handleKey}
              disabled={phase !== 'input'}
              placeholder={card.level === 2 ? 'fill the blank' : 'write your answer'}
              spellCheck={false}
              rows={card.level === 3 ? 8 : 4}
            />
          )}
        </div>
      )}

      {phase === 'graded-pass' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--pass">✓ pass</div>
        </div>
      )}

      {phase === 'graded-fail' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--fail">✕ not quite — retry once</div>
          <div className="feedback__detail">
            <div>required tokens: <code>{card.keyChecks.join(', ')}</code></div>
            {card.forbidden && card.forbidden.length > 0 && (
              <div>must NOT contain: <code>{card.forbidden.join(', ')}</code></div>
            )}
            <div className="explanation">{card.explanation}</div>
          </div>
        </div>
      )}

      {phase === 'final-fail' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--fail">✕ correct answer</div>
          <div className="feedback__detail">
            <pre className="write-expected"><code>{card.expectedAnswer}</code></pre>
            <div className="explanation">{card.explanation}</div>
          </div>
        </div>
      )}

      <div className="kbd-hint">
        {/* no study phase — input is immediate */}
        {phase === 'input' && card.level === 1 && (
          <>
            <span className="kbd">enter</span> to submit
          </>
        )}
        {phase === 'input' && card.level !== 1 && (
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
