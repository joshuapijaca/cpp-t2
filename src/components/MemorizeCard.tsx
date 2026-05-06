import { useEffect, useRef, useState } from 'react';
import type { MemorizeCard as MemorizeCardData } from '../types/card';
import { gradeMemorize, normalize } from '../lib/grading';
import { levelOf } from '../lib/levels';

type Phase = 'display' | 'input' | 'graded-pass' | 'graded-fail' | 'final-fail';

const MODIFIER_KEYS = new Set([
  'Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
]);

interface MemorizeCardProps {
  card: MemorizeCardData;
  onAdvance: () => void;
}

export function MemorizeCard({ card, onAdvance }: MemorizeCardProps) {
  const [phase, setPhase] = useState<Phase>('display');
  const [studentInput, setStudentInput] = useState('');
  const [retried, setRetried] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Reset on card change
  useEffect(() => {
    setPhase('display');
    setStudentInput('');
    setRetried(false);
  }, [card.atomId, card.fact]);

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
    if (normalize(studentInput) === normalize(card.fact)) {
      setPhase('graded-pass');
      window.setTimeout(onAdvance, 500);
    }
  }, [studentInput, phase, card.fact, onAdvance]);

  // Manual fallback submit (Enter)
  const handleSubmit = () => {
    if (phase !== 'input') return;
    const passed = gradeMemorize(studentInput, card.keyChecks);
    if (passed) {
      setPhase('graded-pass');
      window.setTimeout(onAdvance, 500);
    } else if (!retried) {
      setPhase('graded-fail');
      setRetried(true);
    } else {
      setPhase('final-fail');
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Global key handler:
  // display → any non-modifier key → input (fact hides)
  // graded-fail → space → display (re-study fact)
  // final-fail → space → next card
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

  // Fact + context shown ONLY during display phase + final-fail.
  // During input/graded states → hidden so student types from memory.
  const factVisible = phase === 'display' || phase === 'final-fail';

  const lvl = levelOf(card.atomId);
  return (
    <div className={cardClass}>
      <div className="atom-id">
        {lvl ? `${lvl.label} · ${lvl.title} · ` : ''}
        {card.atomId}
      </div>

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

      {(phase === 'input' || phase === 'graded-fail' || phase === 'graded-pass') && (
        <div className="input-area">
          <label className="input-area__label" htmlFor={`memorize-${card.atomId}`}>
            type the fact verbatim
          </label>
          <textarea
            id={`memorize-${card.atomId}`}
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
          <div className="feedback__title feedback__title--pass">OK pass</div>
        </div>
      )}

      {phase === 'graded-fail' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--fail">X not quite — see fact again</div>
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
          <div className="feedback__title feedback__title--fail">X correct answer</div>
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
