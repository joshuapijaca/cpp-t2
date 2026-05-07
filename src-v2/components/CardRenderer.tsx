/**
 * CardRenderer.tsx — single dispatch component over the v2 card types.
 *
 * Owners (Home / Sequence) hand a `Card` and an `onComplete(correct)`
 * callback. The renderer narrows on `card.type` via the schema's
 * discriminated union and mounts the matching component.
 *
 * Why centralise this:
 *   - One place to wire new card types (vs re-implementing the switch
 *     in every page).
 *   - Owners do not need to import every component individually.
 *   - The exhaustive switch flags any newly-added card type at compile
 *     time via the never-default branch.
 *
 * v2.2 minimalist build: 15 card types declared in src-v2 (4 v2
 * essentials + 11 ported v1 types — see docs/v2/MANIFEST.md). Phase A6
 * completed the v1 port set: MemorizeCard / WriteCard / MatrixCard /
 * CodeMemorizeCard. Off-manifest types (AdversarialMock /
 * FaultInjection / Preflight / ConfidenceCalibration / DAGRetry /
 * Delta / TestDaySim / VariantGen / Postmortem / EntityMatrix /
 * AlgorithmMatrix / SpeedDrill) were removed in Phase A3.
 */

import { type ReactNode } from 'react';
import type { Card } from '../types/card-schema';

import { TraceCard } from './cards/TraceCard';
import { TemplateRecallCard } from './cards/TemplateRecallCard';
import { StructWriteCard } from './cards/StructWriteCard';
import { FunctionWriteCard } from './cards/FunctionWriteCard';
import { MainWriteCard } from './cards/MainWriteCard';
import { ClozeCard } from './cards/ClozeCard';
import { WalkthroughCard } from './cards/WalkthroughCard';
import { DemoCard } from './cards/DemoCard';
import { DecomposeCard } from './cards/DecomposeCard';
import { MCQCard } from './cards/MCQCard';
import { ProceduralCard } from './cards/ProceduralCard';
import { MemorizeCard } from './cards/MemorizeCard';
import { WriteCard } from './cards/WriteCard';
import { MatrixCard } from './cards/MatrixCard';
import { CodeMemorizeCard } from './cards/CodeMemorizeCard';

export interface CardRendererProps {
  card: Card;
  /** Fired once the student finishes the card (pass=true / fail=false). */
  onComplete: (correct: boolean) => void;
}

/**
 * Dispatches by `card.type`. The exhaustive switch + never-default
 * forces a compile error when a new card type is added without wiring.
 */
export function CardRenderer({ card, onComplete }: CardRendererProps): ReactNode {
  switch (card.type) {
    case 'TraceCard':
      return <TraceCard card={card} onComplete={onComplete} />;
    case 'TemplateRecallCard':
      // First-pass default: line-by-line for NEW/IN-PROGRESS encounters,
      // all-at-once once the card is FAMILIAR. Owners that track richer
      // encounter-count state can mount the wrapper directly.
      return (
        <TemplateRecallCard
          card={card}
          onComplete={onComplete}
          mode={card.status === 'FAMILIAR' ? 'all-at-once' : 'line-by-line'}
        />
      );
    case 'StructWriteCard':
      return <StructWriteCard card={card} onComplete={onComplete} />;
    case 'FunctionWriteCard':
      return <FunctionWriteCard card={card} onComplete={onComplete} />;
    case 'MainWriteCard':
      return <MainWriteCard card={card} onComplete={onComplete} />;
    case 'ClozeCard':
      return <ClozeCard card={card} onComplete={onComplete} />;
    case 'WalkthroughCard':
      return <WalkthroughCard card={card} onComplete={onComplete} />;
    case 'DemoCard':
      return <DemoCard card={card} onComplete={onComplete} />;
    case 'DecomposeCard':
      return <DecomposeCard card={card} onComplete={onComplete} />;
    case 'MCQCard':
      return <MCQCard card={card} onComplete={onComplete} />;
    case 'ProceduralCard':
      return <ProceduralCard card={card} onComplete={onComplete} />;
    case 'MemorizeCard':
      return <MemorizeCard card={card} onComplete={onComplete} />;
    case 'WriteCard':
      return <WriteCard card={card} onComplete={onComplete} />;
    case 'MatrixCard':
      return <MatrixCard card={card} onComplete={onComplete} />;
    case 'CodeMemorizeCard':
      return <CodeMemorizeCard card={card} onComplete={onComplete} />;
    default: {
      // exhaustiveness guard
      const _never: never = card;
      return (
        <div className="mono" style={{ padding: 16, color: 'var(--state-err)' }}>
          Unknown card type: {(_never as { type?: string })?.type ?? '<unknown>'}
        </div>
      );
    }
  }
}
