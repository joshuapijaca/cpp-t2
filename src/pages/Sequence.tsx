import { useState } from 'react';
import type { Card } from '../types/card';
import { MemorizeCard } from '../components/MemorizeCard';
import { TraceCard } from '../components/TraceCard';
import { WriteCard } from '../components/WriteCard';
import { MCQCard } from '../components/MCQCard';
import { ClozeCard } from '../components/ClozeCard';
import { DecomposeCard } from '../components/DecomposeCard';
import { WalkthroughCard } from '../components/WalkthroughCard';
import { ProceduralDrill } from '../components/ProceduralDrill';
import { CodeMatrix } from '../components/CodeMatrix';
import { CodeMemorize } from '../components/CodeMemorize';
import { ProgressBar } from '../components/ProgressBar';
import cardsData from '../../data/cards.json';

const FULL_DECK = cardsData as Card[];

interface SequenceProps {
  startIndex: number;
  onBackHome: () => void;
  /** Optional override deck (e.g. M12 hardcoded preview). Falls back to cards.json. */
  previewCards?: Card[];
  /** Optional label shown in the empty-state when previewCards is set. */
  previewLabel?: string;
}

export function Sequence({
  startIndex,
  onBackHome,
  previewCards,
  previewLabel,
}: SequenceProps) {
  const cards = previewCards ?? FULL_DECK;
  const [index, setIndex] = useState(startIndex);
  // Bump retryNonce to force-remount the current card (replay, no index change)
  const [retryNonce, setRetryNonce] = useState(0);

  const card = cards[index];

  const handleAdvance = () => {
    setIndex((i) => Math.min(cards.length, i + 1));
    setRetryNonce(0);
  };

  const handleRetry = () => {
    setRetryNonce((n) => n + 1);
  };

  // Force remount on retry / advance
  const cardKey = card ? `${index}-${retryNonce}-${card.atomId}-${card.type}` : 'end';

  if (!card) {
    return (
      <div className="layout">
        <ProgressBar current={cards.length} total={cards.length} />
        <div className="nav-btns">
          <button type="button" className="nav-btn" onClick={onBackHome}>
            home
          </button>
        </div>
        <div className="empty-state">
          end of {previewLabel ?? 'sequence'} ({cards.length} cards). back to home to pick another level.
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      <ProgressBar current={index} total={cards.length} />
      <div className="nav-btns">
        <button
          type="button"
          className="nav-btn"
          onClick={handleRetry}
          title="replay this card from the start"
        >
          retry
        </button>
        <button type="button" className="nav-btn" onClick={onBackHome}>
          home
        </button>
      </div>
      {card.type === 'memorize' && (
        <MemorizeCard key={cardKey} card={card} onAdvance={handleAdvance} />
      )}
      {card.type === 'trace' && (
        <TraceCard key={cardKey} card={card} onAdvance={handleAdvance} />
      )}
      {card.type === 'write' && (
        <WriteCard key={cardKey} card={card} onAdvance={handleAdvance} />
      )}
      {card.type === 'mcq' && (
        <MCQCard key={cardKey} card={card} onAdvance={handleAdvance} />
      )}
      {card.type === 'cloze' && (
        <ClozeCard key={cardKey} card={card} onAdvance={handleAdvance} />
      )}
      {card.type === 'decompose' && (
        <DecomposeCard key={cardKey} card={card} onAdvance={handleAdvance} />
      )}
      {card.type === 'walkthrough' && (
        <WalkthroughCard key={cardKey} card={card} onAdvance={handleAdvance} />
      )}
      {card.type === 'procedural' && (
        <ProceduralDrill key={cardKey} drill={card} onComplete={handleAdvance} />
      )}
      {card.type === 'matrix' && (
        <CodeMatrix key={cardKey} matrix={card} onAdvance={handleAdvance} />
      )}
      {card.type === 'code-memorize' && (
        <CodeMemorize key={cardKey} drill={card} onAdvance={handleAdvance} />
      )}
    </div>
  );
}
