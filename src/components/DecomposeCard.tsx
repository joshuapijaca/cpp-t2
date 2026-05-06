import { useEffect, useState } from 'react';
import type { DecomposeCard as DecomposeCardData } from '../types/card';
import { levelOf } from '../lib/levels';

type Phase = 'input' | 'graded-pass' | 'graded-fail' | 'final-fail';

interface DecomposeCardProps {
  card: DecomposeCardData;
  onAdvance: () => void;
}

/**
 * SEE-half card type 2 of 3 (M13, redesigned M22+).
 *
 * Single-select MCQ with a SPECIFIC question per card.
 * Shows code + targeted question; student picks A/B/C/D.
 * Distractors are FALSE answers to the specific question asked.
 *
 * Grading: exact match on correctLabel.
 * Wrong → retry once → final-fail shows correct answer.
 */
export function DecomposeCard({ card, onAdvance }: DecomposeCardProps) {
  const [phase, setPhase] = useState<Phase>('input');
  const [selected, setSelected] = useState<string | null>(null);
  const [retried, setRetried] = useState(false);

  useEffect(() => {
    setPhase('input');
    setSelected(null);
    setRetried(false);
  }, [card.atomId, card.code]);

  const handleSubmit = () => {
    if (phase !== 'input' || !selected) return;
    if (selected === card.correctLabel) {
      setPhase('graded-pass');
      window.setTimeout(onAdvance, 600);
    } else if (!retried) {
      setPhase('graded-fail');
      setRetried(true);
    } else {
      setPhase('final-fail');
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === 'input') {
        const key = e.key.toUpperCase();
        if (['A', 'B', 'C', 'D'].includes(key) && card.options.some(o => o.label === key)) {
          e.preventDefault();
          setSelected(key);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          handleSubmit();
        }
      } else if (phase === 'graded-fail' && e.code === 'Space') {
        e.preventDefault();
        setSelected(null);
        setPhase('input');
      } else if (phase === 'final-fail' && e.code === 'Space') {
        e.preventDefault();
        onAdvance();
      } else if (phase === 'graded-pass' && e.code === 'Space') {
        e.preventDefault();
        onAdvance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, selected, retried, card.options]);

  const cardClass =
    phase === 'graded-pass'
      ? 'card card--graded-pass'
      : phase === 'graded-fail' || phase === 'final-fail'
      ? 'card card--graded-fail'
      : 'card';

  const lvl = levelOf(card.atomId);

  const correctOpt = card.options.find(o => o.label === card.correctLabel);

  return (
    <div className={`${cardClass} decompose-card`}>
      <div className="atom-id">
        {lvl ? `${lvl.label} · ${lvl.title} · ` : ''}
        {card.atomId} · decompose
      </div>

      <div className="decompose-prompt">
        {card.question}
      </div>

      <pre className="decompose-code">{card.code}</pre>

      <div className="decompose-options">
        {card.options.map((opt) => {
          const isSelected = selected === opt.label;
          const isCorrect = opt.label === card.correctLabel;
          let optClass = 'decompose-option';
          if (phase === 'input' && isSelected) optClass += ' decompose-option--selected';
          if (phase !== 'input') {
            if (isCorrect) optClass += ' decompose-option--correct';
            if (isSelected && !isCorrect) optClass += ' decompose-option--wrong';
          }
          return (
            <button
              key={opt.label}
              type="button"
              className={optClass}
              disabled={phase !== 'input'}
              onClick={() => phase === 'input' && setSelected(opt.label)}
            >
              <span className="decompose-option__label">{opt.label})</span>
              <span className="decompose-option__text">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {phase === 'graded-pass' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--pass">OK correct</div>
        </div>
      )}

      {phase === 'graded-fail' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--fail">X wrong -- try again</div>
          <div className="feedback__detail">
            <div className="explanation">
              hint: re-read the code and question carefully
            </div>
          </div>
        </div>
      )}

      {phase === 'final-fail' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--fail">X correct answer</div>
          <div className="feedback__detail">
            <div>
              answer: <strong>{card.correctLabel}) {correctOpt?.text}</strong>
            </div>
            <div className="explanation">{card.explanation}</div>
          </div>
        </div>
      )}

      <div className="kbd-hint">
        {phase === 'input' && (
          <>
            <span className="kbd">A-D</span> to pick
            {' · '}
            <span className="kbd">enter</span> to submit
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
