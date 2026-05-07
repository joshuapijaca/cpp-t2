/**
 * WalkthroughCard.tsx — annotated reveal of a worked example.
 *
 * Static reveal — student presses Space (or Next) to surface the next
 * step's annotation. The card "completes" once every step is revealed.
 * No grading: this is the SEE half of see-then-do.
 *
 * Layout:
 *   ┌──────────────────────────┬─────────────────────────────┐
 *   │ Code panel (full code,   │ Steps panel — reveal-on-key │
 *   │  active line highlight)  │   step 1: <annotation>      │
 *   │                          │   step 2: <annotation>      │
 *   │                          │   ▌ next: press Space       │
 *   └──────────────────────────┴─────────────────────────────┘
 *
 * Keyboard:
 *   - Space / ArrowRight / Enter : reveal next step
 *   - Backspace / ArrowLeft       : un-reveal last step (review)
 *   - End / Ctrl+Enter            : reveal all (skip)
 *
 * Accessibility:
 *   - aria-live="polite" on the steps list so screen readers announce reveals.
 *   - Each step is an <li> with a labelled atom-ID badge.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { WalkthroughCard as WalkthroughCardData } from '../../types/card-schema';

export interface WalkthroughCardProps {
  card: WalkthroughCardData;
  onComplete: (correct: boolean) => void;
}

export function WalkthroughCard({ card, onComplete }: WalkthroughCardProps) {
  const totalSteps = card.steps.length;
  const [revealed, setRevealed] = useState(0);

  // Lines lookup so we can highlight the active one.
  const codeLines = useMemo(() => card.fullCode.split('\n'), [card.fullCode]);
  const activeLine = revealed > 0 ? card.steps[revealed - 1]?.line ?? null : null;

  useEffect(() => {
    setRevealed(0);
  }, [card.id]);

  const reveal = useCallback(() => {
    setRevealed((r) => {
      const next = Math.min(totalSteps, r + 1);
      if (next === totalSteps) onComplete(true);
      return next;
    });
  }, [totalSteps, onComplete]);

  const unReveal = useCallback(() => {
    setRevealed((r) => Math.max(0, r - 1));
  }, []);

  const revealAll = useCallback(() => {
    setRevealed(totalSteps);
    onComplete(true);
  }, [totalSteps, onComplete]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Skip if focus is in a text input (none here, but be polite).
      if (
        e.target instanceof HTMLElement &&
        (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')
      ) {
        return;
      }
      if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        reveal();
      } else if (e.key === 'Backspace' || e.key === 'ArrowLeft') {
        e.preventDefault();
        unReveal();
      } else if (e.key === 'End' || ((e.ctrlKey || e.metaKey) && e.key === 'Enter')) {
        e.preventDefault();
        revealAll();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reveal, unReveal, revealAll]);

  return (
    <section
      className="wt-root"
      role="application"
      aria-label={`Walkthrough — ${card.levelLabel}`}
    >
      <style>{WT_STYLES}</style>

      <header className="wt-header">
        <div>
          <span className="wt-level">{card.levelLabel}</span>
          <h2 className="wt-stem">{card.stem}</h2>
        </div>
        <div className="wt-progress" aria-label={`step ${revealed} of ${totalSteps}`}>
          {revealed} / {totalSteps}
        </div>
      </header>

      <div className="wt-grid">
        <pre
          className="wt-code"
          aria-label="walk-through code panel"
          tabIndex={0}
        >
          {codeLines.map((line, i) => {
            const lineNum = i + 1;
            const isActive = lineNum === activeLine;
            return (
              <span
                key={i}
                className={`wt-line ${isActive ? 'is-active' : ''}`}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className="wt-lineno" aria-hidden="true">
                  {String(lineNum).padStart(2, ' ')}
                </span>
                <span className="wt-linecode">{line || ' '}</span>
                {'\n'}
              </span>
            );
          })}
        </pre>

        <ol className="wt-steps" aria-live="polite">
          {card.steps.slice(0, revealed).map((step, i) => (
            <li key={i} className="wt-step">
              <div className="wt-step-head">
                <span className="wt-step-num">step {i + 1}</span>
                <span className="wt-step-line">line {step.line}</span>
                {step.atomIds.length > 0 && (
                  <span className="wt-step-atoms" aria-label="atoms touched">
                    {step.atomIds.map((a) => (
                      <code key={a} className="wt-atom-tag">
                        {a}
                      </code>
                    ))}
                  </span>
                )}
              </div>
              <pre className="wt-step-code">{step.code}</pre>
              <p className="wt-step-note">{step.annotation}</p>
            </li>
          ))}
          {revealed < totalSteps && (
            <li className="wt-step wt-step--ghost" aria-label="next step">
              <span className="wt-step-prompt">
                press <kbd>Space</kbd> to reveal the next step
              </span>
            </li>
          )}
        </ol>
      </div>

      <footer className="wt-footer">
        <button
          type="button"
          className="wt-btn"
          onClick={unReveal}
          disabled={revealed === 0}
          aria-label="step back (Backspace)"
        >
          ← back
        </button>
        <button
          type="button"
          className="wt-btn wt-btn--primary"
          onClick={reveal}
          disabled={revealed === totalSteps}
          aria-label="reveal next step (Space)"
        >
          {revealed === totalSteps ? 'done' : 'reveal next (Space)'}
        </button>
        <button
          type="button"
          className="wt-btn"
          onClick={revealAll}
          disabled={revealed === totalSteps}
          aria-label="reveal all (End)"
        >
          reveal all
        </button>
      </footer>
    </section>
  );
}

const WT_STYLES = `
.wt-root {
  font-family: var(--font-sans, system-ui, sans-serif);
  background: var(--bg-0, #0d1117);
  color: var(--text-0, #e6edf3);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 1280px;
  margin: 0 auto;
}
.wt-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  border-bottom: 1px solid var(--border-1, #30363d);
  padding-bottom: 10px;
}
.wt-level {
  display: inline-block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--accent-org, #ffa657);
  margin-bottom: 4px;
}
.wt-stem { margin: 0; font-size: 15px; line-height: 1.4; }
.wt-progress {
  font-family: var(--font-mono, monospace);
  font-size: 12px;
  color: var(--text-2, #6e7681);
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  padding: 4px 10px;
  border-radius: 3px;
  align-self: center;
}
.wt-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
  min-height: 380px;
}
.wt-code {
  margin: 0;
  padding: 10px 0;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  line-height: 1.55;
  overflow-x: auto;
  white-space: pre;
  color: var(--text-0, #e6edf3);
}
.wt-code:focus-visible { outline: 2px solid var(--accent-cyan, #79c0ff); outline-offset: -2px; }
.wt-line { display: inline; }
.wt-line.is-active { background: rgba(121,192,255,0.12); }
.wt-line.is-active .wt-linecode { color: var(--accent-cyan, #79c0ff); font-weight: 600; }
.wt-lineno {
  display: inline-block;
  width: 32px;
  padding: 0 8px;
  text-align: right;
  color: var(--text-2, #6e7681);
  user-select: none;
}
.wt-linecode { padding-right: 8px; }
.wt-steps {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  max-height: 480px;
}
.wt-step {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.wt-step--ghost {
  border-style: dashed;
  background: transparent;
  color: var(--text-2, #6e7681);
  text-align: center;
  font-size: 12px;
  align-items: center;
}
.wt-step-prompt kbd {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 3px;
  padding: 1px 6px;
  font-family: var(--font-mono, monospace);
  font-size: 10px;
  color: var(--accent-cyan, #79c0ff);
}
.wt-step-head { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: 11px; }
.wt-step-num { color: var(--accent-cyan, #79c0ff); font-weight: 600; }
.wt-step-line { color: var(--text-2, #6e7681); }
.wt-step-atoms { display: inline-flex; gap: 4px; }
.wt-atom-tag {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 2px;
  padding: 1px 5px;
  font-size: 10px;
  color: var(--accent-yel, #d2a8ff);
}
.wt-step-code {
  margin: 0;
  padding: 6px 8px;
  background: var(--bg-0, #0d1117);
  border-radius: 3px;
  font-family: var(--font-mono, monospace);
  font-size: 12px;
  color: var(--accent-grn, #7ee787);
  white-space: pre-wrap;
  overflow-x: auto;
}
.wt-step-note { margin: 0; font-size: 12px; line-height: 1.5; color: var(--text-1, #8b949e); }
.wt-footer { display: flex; justify-content: flex-end; gap: 8px; }
.wt-btn {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  color: var(--text-0, #e6edf3);
  padding: 6px 14px;
  border-radius: 4px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.wt-btn:hover:not(:disabled) { border-color: var(--accent-cyan, #79c0ff); color: var(--accent-cyan, #79c0ff); }
.wt-btn:focus-visible { outline: 2px solid var(--accent-cyan, #79c0ff); outline-offset: 2px; }
.wt-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.wt-btn--primary {
  background: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  border-color: var(--accent-cyan, #79c0ff);
  font-weight: 600;
}
@media (max-width: 768px) {
  .wt-grid { grid-template-columns: 1fr; }
}
`;

export default WalkthroughCard;
