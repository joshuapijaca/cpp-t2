import { useEffect, useState } from 'react';
import type { WalkthroughCard as WalkthroughCardData } from '../types/card';
import { levelOf } from '../lib/levels';

interface WalkthroughCardProps {
  card: WalkthroughCardData;
  onAdvance: () => void;
}

/**
 * SEE-half card type 3 of 3 (M14).
 *
 * Multi-step narrative. Full code shown statically. Each space-press reveals
 * one step's annotation below; the corresponding line in the code panel gains
 * an accent border. After all steps revealed, one more space → advance.
 *
 * Read-only. No grading. Mirror-neuron walkthrough: student observes how a
 * level's atoms compose into a working program.
 *
 * Spec: cpp-t2/docs/14_see_cards_master_plan.md ("walkthrough card UX").
 */
export function WalkthroughCard({ card, onAdvance }: WalkthroughCardProps) {
  // stepIndex: -1 = nothing revealed yet (initial state)
  //             0..steps.length-1 = step i revealed (active line = steps[i].line)
  //             steps.length = all revealed; next space → advance
  const [stepIndex, setStepIndex] = useState<number>(-1);

  // Reset on card change
  useEffect(() => {
    setStepIndex(-1);
  }, [card.atomId, card.fullCode]);

  // Space / Enter → progress one step OR advance after final reveal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.key !== 'Enter') return;
      e.preventDefault();
      setStepIndex((i) => {
        if (i >= card.steps.length) {
          onAdvance();
          return i;
        }
        return i + 1;
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [card.steps.length, onAdvance]);

  const lvl = levelOf(card.atomId);
  const codeLines = card.fullCode.split('\n');
  const activeLine =
    stepIndex >= 0 && stepIndex < card.steps.length
      ? card.steps[stepIndex]!.line
      : -1;

  const visibleSteps =
    stepIndex < 0 ? [] : card.steps.slice(0, Math.min(stepIndex + 1, card.steps.length));

  const allRevealed = stepIndex >= card.steps.length - 1;
  const finalAdvanceArmed = stepIndex >= card.steps.length;

  const totalSteps = card.steps.length;
  const shownSteps = Math.max(0, Math.min(stepIndex + 1, totalSteps));

  return (
    <div className="card walkthrough-card">
      <div className="atom-id">
        {lvl ? `${lvl.label} · ${lvl.title} · ` : ''}
        {card.atomId} · walkthrough
      </div>

      <div className="walkthrough-label">{card.levelLabel}</div>

      <pre className="walkthrough-code">
        {codeLines.map((line, i) => {
          const lineNum = i + 1;
          const isActive = lineNum === activeLine;
          return (
            <div
              key={i}
              className={
                'walkthrough-code__line' +
                (isActive ? ' walkthrough-code__line--active' : '')
              }
            >
              <span className="walkthrough-code__num">{lineNum}</span>
              <span className="walkthrough-code__text">{line || ' '}</span>
            </div>
          );
        })}
      </pre>

      <div className="walkthrough-steps">
        {stepIndex < 0 ? (
          <div className="walkthrough-steps__empty">
            press space to reveal step 1 of {totalSteps}
          </div>
        ) : (
          visibleSteps.map((step, i) => {
            const isLatest = i === visibleSteps.length - 1;
            return (
              <div
                key={i}
                className={
                  'walkthrough-step' + (isLatest ? ' walkthrough-step--latest' : '')
                }
              >
                <div className="walkthrough-step__head">
                  <span className="walkthrough-step__index">
                    step {i + 1}/{totalSteps}
                  </span>
                  <span className="walkthrough-step__line">line {step.line}</span>
                  {step.atomIds.length > 0 && (
                    <span className="walkthrough-step__atoms">
                      {step.atomIds.map((id) => (
                        <span key={id} className="walkthrough-step__atom">
                          {id}
                        </span>
                      ))}
                    </span>
                  )}
                </div>
                <div className="walkthrough-step__code">{step.code}</div>
                <div className="walkthrough-step__annotation">{step.annotation}</div>
              </div>
            );
          })
        )}
      </div>

      <div className="kbd-hint">
        {!finalAdvanceArmed && !allRevealed && stepIndex >= 0 && (
          <>
            <span className="kbd">space</span> to reveal step {shownSteps + 1} of {totalSteps}
          </>
        )}
        {!finalAdvanceArmed && allRevealed && stepIndex >= 0 && (
          <>
            <span className="kbd">space</span> to continue
          </>
        )}
        {stepIndex < 0 && (
          <>
            <span className="kbd">space</span> to begin
          </>
        )}
        {finalAdvanceArmed && (
          <>
            <span className="kbd">space</span> to continue
          </>
        )}
      </div>
    </div>
  );
}
