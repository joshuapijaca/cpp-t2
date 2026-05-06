import { useEffect, useRef, useState } from 'react';
import type { ClozeCard as ClozeCardData } from '../types/card';
import { levelOf } from '../lib/levels';

type Phase = 'input' | 'graded-pass' | 'graded-fail' | 'final-fail';

interface ClozeCardProps {
  card: ClozeCardData;
  onAdvance: () => void;
}

/**
 * Vocab cloze card — active fill-in-the-blank.
 * Shows code context + sentence with ___ blank.
 * Student types the missing term. Retry once on fail.
 */
export function ClozeCard({ card, onAdvance }: ClozeCardProps) {
  const [phase, setPhase] = useState<Phase>('input');
  const [input, setInput] = useState('');
  const [retried, setRetried] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPhase('input');
    setInput('');
    setRetried(false);
    inputRef.current?.focus();
  }, [card.atomId, card.clozeSentence]);

  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

  const handleSubmit = () => {
    if (phase !== 'input' || !input.trim()) return;
    if (normalize(input) === normalize(card.answer)) {
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
      if (phase === 'graded-fail' && e.code === 'Space') {
        e.preventDefault();
        setInput('');
        setPhase('input');
        setTimeout(() => inputRef.current?.focus(), 50);
      } else if ((phase === 'final-fail' || phase === 'graded-pass') && e.code === 'Space') {
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

  const lvl = levelOf(card.atomId);

  // Render sentence with ___ replaced by input box or answer
  const parts = card.clozeSentence.split('___');

  return (
    <div className={`${cardClass} cloze-card`}>
      <div className="atom-id">
        {lvl ? `${lvl.label} · ${lvl.title} · ` : ''}
        {card.atomId} · cloze
      </div>

      <pre className="cloze-code">{card.code}</pre>

      <div className="cloze-sentence">
        {parts[0]}
        {phase === 'input' ? (
          <input
            ref={inputRef}
            className="cloze-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); } }}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            placeholder="___"
          />
        ) : (
          <span className={phase === 'graded-pass' ? 'cloze-answer cloze-answer--correct' : 'cloze-answer cloze-answer--shown'}>
            {card.answer}
          </span>
        )}
        {parts[1] ?? ''}
      </div>

      {phase === 'graded-pass' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--pass">OK correct</div>
        </div>
      )}

      {phase === 'graded-fail' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--fail">X wrong -- try again</div>
        </div>
      )}

      {phase === 'final-fail' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--fail">X correct answer</div>
          <div className="feedback__detail">
            <div className="explanation">{card.explanation}</div>
          </div>
        </div>
      )}

      <div className="kbd-hint">
        {phase === 'input' && (
          <><span className="kbd">enter</span> to submit</>
        )}
        {phase === 'graded-fail' && (
          <><span className="kbd">space</span> to retry</>
        )}
        {phase === 'final-fail' && (
          <><span className="kbd">space</span> to continue</>
        )}
      </div>
    </div>
  );
}
