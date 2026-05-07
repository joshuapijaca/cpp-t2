/**
 * CardRenderer.tsx — single dispatch component over all 23 v2 card types.
 *
 * Owners (Home / Track / Mock / Preflight / Postmortem) hand a `Card` and
 * an `onComplete(correct)` callback. The renderer narrows on `card.type`
 * via the schema's discriminated union and mounts the matching component.
 *
 * Why centralise this:
 *   - One place to wire new card types (vs re-implementing the switch
 *     in every page).
 *   - Owners do not need to import 23 components individually.
 *   - The exhaustive switch flags any newly-added card type at compile
 *     time via the never-default branch.
 *
 * Components that need extras (FunctionWrite.structContext, MainWrite.extras,
 * Postmortem.onDrillAtoms, ConfidenceCalibration.renderInner, etc.) are
 * given safe defaults when the owner hasn't supplied them. Owners that DO
 * need richer wiring can still mount the per-card component directly.
 */

import { type ReactNode } from 'react';
import type { Card } from '../types/card-schema';

import { TraceCard } from './cards/TraceCard';
import { TemplateRecallCard } from './cards/TemplateRecallCard';
import { StructWriteCard } from './cards/StructWriteCard';
import { FunctionWriteCard } from './cards/FunctionWriteCard';
import { MainWriteCard } from './cards/MainWriteCard';
import { EntityMatrixCard } from './cards/EntityMatrixCard';
import { AlgorithmMatrixCard } from './cards/AlgorithmMatrixCard';
import { SpeedDrillCard } from './cards/SpeedDrillCard';
import { AdversarialMockCard } from './cards/AdversarialMockCard';
import { FaultInjectionCard } from './cards/FaultInjectionCard';
import { PreflightCheckCard } from './cards/PreflightCheckCard';
import { ConfidenceCalibrationCard } from './cards/ConfidenceCalibrationCard';
import { DAGRetryCard } from './cards/DAGRetryCard';
import { DeltaCard } from './cards/DeltaCard';
import { TestDaySimCard } from './cards/TestDaySimCard';
import { VariantGenCard } from './cards/VariantGenCard';
import { ClozeCard } from './cards/ClozeCard';
import { WalkthroughCard } from './cards/WalkthroughCard';
import { DemoCard } from './cards/DemoCard';
import { DecomposeCard } from './cards/DecomposeCard';
import { MCQCard } from './cards/MCQCard';
import { ProceduralCard } from './cards/ProceduralCard';
import { PostmortemCard } from './cards/PostmortemCard';

export interface CardRendererProps {
  card: Card;
  /** Fired once the student finishes the card (pass=true / fail=false). */
  onComplete: (correct: boolean) => void;
}

/**
 * Dispatches by `card.type`. The exhaustive switch + never-default
 * forces a compile error when a 24th card type is added without wiring.
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
    case 'EntityMatrixCard':
      return <EntityMatrixCard card={card} onComplete={onComplete} />;
    case 'AlgorithmMatrixCard':
      return <AlgorithmMatrixCard card={card} onComplete={onComplete} />;
    case 'SpeedDrillCard':
      return <SpeedDrillCard card={card} onComplete={onComplete} />;
    case 'AdversarialMockCard':
      return <AdversarialMockCard card={card} onComplete={onComplete} />;
    case 'FaultInjectionCard':
      return <FaultInjectionCard card={card} onComplete={onComplete} />;
    case 'PreflightCheckCard':
      return <PreflightCheckCard card={card} onComplete={onComplete} />;
    case 'ConfidenceCalibrationCard':
      // Wrapper requires a renderInner. Default = MCQ-shaped echo of the
      // canonicalAnswer; owners that care can mount the wrapper directly.
      return (
        <ConfidenceCalibrationCard
          card={card}
          renderInner={({ onComplete: inner, disabled }) => (
            <button
              type="button"
              disabled={disabled}
              onClick={() => inner(true)}
              style={{
                padding: '8px 14px',
                background: 'var(--bg-2)',
                color: 'var(--text-0)',
                border: '1px solid var(--border-1)',
                borderRadius: 4,
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.4 : 1,
              }}
            >
              Reveal canonical answer
            </button>
          )}
          onComplete={onComplete}
        />
      );
    case 'DAGRetryCard':
      return <DAGRetryCard card={card} onComplete={onComplete} />;
    case 'DeltaCard':
      return <DeltaCard card={card} onComplete={onComplete} />;
    case 'TestDaySimCard':
      return <TestDaySimCard card={card} onComplete={onComplete} />;
    case 'VariantGenCard':
      return <VariantGenCard card={card} onComplete={onComplete} />;
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
    case 'PostmortemCard':
      return <PostmortemCard card={card} onComplete={onComplete} />;
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
