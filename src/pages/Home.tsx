import { useMemo, useState } from 'react';
import type { Card } from '../types/card';
import { computeLevelStarts, levelOf } from '../lib/levels';
import cardsData from '../../data/cards.json';

const CARDS = cardsData as Card[];

interface HomeProps {
  onPick: (startIndex: number) => void;
  onPickM13Preview?: () => void;
  onPickM14Preview?: () => void;
}

export function Home({
  onPick,
  onPickM13Preview,
  onPickM14Preview,
}: HomeProps) {
  const starts = useMemo(() => computeLevelStarts(CARDS), []);
  const [jumpInput, setJumpInput] = useState('');

  const parsed = parseInt(jumpInput.trim(), 10);
  const valid =
    !Number.isNaN(parsed) && parsed >= 0 && parsed < CARDS.length;
  const previewCard = valid ? CARDS[parsed] : null;
  const previewLevel = previewCard ? levelOf(previewCard.atomId) : undefined;

  const handleJump = () => {
    if (valid) onPick(parsed);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleJump();
    }
  };

  return (
    <div className="home">
      <div className="home__header">
        <div className="home__title">C++T2</div>
        <div className="home__subtitle">SIT102 Test 2 — pick a level to begin</div>
        <div className="home__total">{CARDS.length} cards · forward-only · refresh to restart</div>
      </div>

      <div className="home__jump">
        <label className="home__jump-label" htmlFor="home-jump-input">
          jump to card #
        </label>
        <input
          id="home-jump-input"
          className="home__jump-input"
          type="number"
          min={0}
          max={CARDS.length - 1}
          value={jumpInput}
          onChange={(e) => setJumpInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={`0 - ${CARDS.length - 1}`}
        />
        <button
          type="button"
          className="home__jump-btn"
          onClick={handleJump}
          disabled={!valid}
        >
          go
        </button>
        <div className="home__jump-preview">
          {valid && previewCard ? (
            <>
              {previewLevel?.label ?? '?'} · {previewCard.atomId} · {previewCard.type}
            </>
          ) : jumpInput.trim() === '' ? (
            <span className="home__jump-hint">enter a card number 0 - {CARDS.length - 1}</span>
          ) : (
            <span className="home__jump-error">invalid — must be 0 to {CARDS.length - 1}</span>
          )}
        </div>
      </div>

      <div className="home__grid">
        {starts.map((s) => (
          <button
            key={s.info.label}
            type="button"
            className={'home__cell' + (s.info.isRDS ? ' home__cell--rds' : '')}
            onClick={() => onPick(s.firstIndex)}
          >
            <span className="home__cell-label">{s.info.label}</span>
            <span className="home__cell-title">{s.info.title}</span>
            <span className="home__cell-count">{s.cardCount} cards</span>
            {s.info.isRDS && <span className="home__cell-badge">RDS</span>}
          </button>
        ))}
      </div>

      {(onPickM13Preview || onPickM14Preview) && (
        <div className="home__m12">
          <div className="home__m12-row">
            {onPickM13Preview && (
              <button
                type="button"
                className="home__m12-btn"
                onClick={onPickM13Preview}
              >
                M13 decompose preview (5 cards)
              </button>
            )}
            {onPickM14Preview && (
              <button
                type="button"
                className="home__m12-btn"
                onClick={onPickM14Preview}
              >
                M14 walkthrough preview (3 cards)
              </button>
            )}
          </div>
          <span className="home__m12-hint">
            SEE-half smoke tests. M12 read-only, M13 set-equality grading, M14 reveal-on-space.
          </span>
        </div>
      )}

      <div className="home__hint">
        Picking a level or card starts you at that point. Sequence is linear after - you can complete the whole deck from any starting point. Write your last card number on paper to resume next session.
      </div>
    </div>
  );
}
