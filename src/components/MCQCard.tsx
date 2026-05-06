import { useEffect, useMemo, useState } from 'react';
import type { MCQCard as MCQCardData } from '../types/card';
import { gradeMCQ } from '../lib/grading';
import { levelOf } from '../lib/levels';

type Phase = 'input' | 'graded-pass' | 'graded-fail';

interface MCQCardProps {
  card: MCQCardData;
  onAdvance: () => void;
}

// Deterministic shuffle: orders options based on atomId hash so rerenders are stable.
function shuffleOptions(card: MCQCardData): string[] {
  const all = [card.correct, ...card.distractors];
  const seed = card.atomId.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  // Simple LCG-ish mix
  const indices = all.map((_, i) => ({ i, k: (seed * 9301 + i * 49297) % 233280 }));
  indices.sort((a, b) => a.k - b.k);
  return indices.map((x) => all[x.i]!);
}

export function MCQCard({ card, onAdvance }: MCQCardProps) {
  const [phase, setPhase] = useState<Phase>('input');
  const [selected, setSelected] = useState<string | null>(null);

  const options = useMemo(() => shuffleOptions(card), [card]);

  // Reset on card change
  useEffect(() => {
    setPhase('input');
    setSelected(null);
  }, [card.atomId, card.stem]);

  const handleSubmit = () => {
    if (phase !== 'input' || !selected) return;
    const passed = gradeMCQ(selected, card.correct);
    if (passed) {
      setPhase('graded-pass');
      window.setTimeout(onAdvance, 600);
    } else {
      setPhase('graded-fail');
    }
  };

  // Global key handlers
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === 'input') {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= options.length) {
          setSelected(options[num - 1]!);
        } else if (e.key === 'Enter' && selected) {
          e.preventDefault();
          handleSubmit();
        }
      } else if (phase === 'graded-fail' && e.code === 'Space') {
        e.preventDefault();
        onAdvance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, selected, options, onAdvance]);

  const cardClass =
    phase === 'graded-pass'
      ? 'card card--graded-pass'
      : phase === 'graded-fail'
      ? 'card card--graded-fail'
      : 'card';

  return (
    <div className={`${cardClass} mcq-card`}>
      <div className="atom-id">
        {(() => { const l = levelOf(card.atomId); return l ? `${l.label} · ` : ''; })()}
        {card.atomId} · mcq
      </div>

      <div className="mcq-stem">{card.stem}</div>

      <div className="mcq-options">
        {options.map((opt, i) => {
          const isSelected = selected === opt;
          const isCorrect = opt === card.correct;
          let optClass = 'mcq-option';
          if (phase === 'input' && isSelected) optClass += ' mcq-option--selected';
          if (phase !== 'input' && isCorrect) optClass += ' mcq-option--correct';
          if (phase !== 'input' && isSelected && !isCorrect) optClass += ' mcq-option--wrong';
          return (
            <button
              key={i}
              type="button"
              className={optClass}
              disabled={phase !== 'input'}
              onClick={() => phase === 'input' && setSelected(opt)}
            >
              <span className="mcq-option__index">{i + 1}</span>
              <span className="mcq-option__text">{opt}</span>
            </button>
          );
        })}
      </div>

      {phase === 'graded-pass' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--pass">✓ correct</div>
        </div>
      )}

      {phase === 'graded-fail' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--fail">✕ incorrect</div>
          <div className="feedback__detail">
            <div>correct: <strong>{card.correct}</strong></div>
            <div className="explanation">{card.explanation}</div>
          </div>
        </div>
      )}

      <div className="kbd-hint">
        {phase === 'input' && (
          <>
            <span className="kbd">1-4</span> to select · <span className="kbd">enter</span> to submit
          </>
        )}
        {phase === 'graded-fail' && (
          <>
            <span className="kbd">space</span> to continue
          </>
        )}
      </div>
    </div>
  );
}
