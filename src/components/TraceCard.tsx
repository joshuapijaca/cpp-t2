import { useEffect, useMemo, useRef, useState } from 'react';
import type { TraceCard as TraceCardData, Step } from '../types/card';
import { gradeTraceFinal, normalize } from '../lib/grading';
import { levelOf } from '../lib/levels';

type Phase = 'input' | 'graded-pass' | 'graded-fail' | 'final-fail';

interface TraceCardProps {
  card: TraceCardData;
  onAdvance: () => void;
}

interface BoxEntry {
  value: string;
  finalized: boolean;
}

/** Final expected value per variable = last expectedSteps entry for that variable. */
function expectedFinals(
  variables: string[],
  steps: Step[]
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const v of variables) out[v] = '';
  for (const s of steps) {
    if (s.variable && s.variable in out) out[s.variable] = s.value;
  }
  return out;
}

/** Build the full correct history per variable (for final-fail reveal). */
function buildHistories(
  variables: string[],
  steps: Step[]
): Record<string, string[]> {
  const h: Record<string, string[]> = {};
  for (const v of variables) h[v] = [];
  for (const s of steps) {
    if (s.variable && s.variable in h) h[s.variable]!.push(s.value);
  }
  return h;
}

export function TraceCard({ card, onAdvance }: TraceCardProps) {
  const [phase, setPhase] = useState<Phase>('input');
  const [boxes, setBoxes] = useState<Record<string, BoxEntry[]>>({});
  const [terminal, setTerminal] = useState('');
  const [retried, setRetried] = useState(false);
  const [varResults, setVarResults] = useState<Record<string, boolean>>({});
  const [terminalResult, setTerminalResult] = useState<boolean | null>(null);

  const activeInputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLTextAreaElement>(null);

  const finals = useMemo(
    () => expectedFinals(card.variables, card.expectedSteps),
    [card.variables, card.expectedSteps]
  );

  const hasTerminal = card.terminalOutput.length > 0;

  // Reset on card change
  useEffect(() => {
    setPhase('input');
    setBoxes({});
    setTerminal('');
    setRetried(false);
    setVarResults({});
    setTerminalResult(null);
  }, [card.atomId, card.code]);

  // Auto-focus first add-button on mount / card change / retry
  useEffect(() => {
    if (phase === 'input') {
      // Small delay so DOM settles after reset
      const t = window.setTimeout(() => {
        const firstBtn = document.querySelector<HTMLButtonElement>(
          '.trace-add-btn'
        );
        firstBtn?.focus();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [phase, card.atomId]);

  // ---- Box manipulation ----

  const addBox = (varName: string) => {
    if (phase !== 'input') return;
    setBoxes((prev) => {
      const arr = [...(prev[varName] ?? [])];
      // Finalize the current last box if it exists and has a value
      if (arr.length > 0) {
        const last = arr[arr.length - 1]!;
        arr[arr.length - 1] = { ...last, finalized: true };
      }
      arr.push({ value: '', finalized: false });
      return { ...prev, [varName]: arr };
    });
    // Focus the new input after React renders
    requestAnimationFrame(() => activeInputRef.current?.focus());
  };

  const removeLastBox = (varName: string) => {
    if (phase !== 'input') return;
    setBoxes((prev) => {
      const arr = [...(prev[varName] ?? [])];
      if (arr.length === 0) return prev;
      arr.pop();
      // Un-finalize the new last box
      if (arr.length > 0) {
        const last = arr[arr.length - 1]!;
        arr[arr.length - 1] = { ...last, finalized: false };
      }
      return { ...prev, [varName]: arr };
    });
  };

  const updateLastBox = (varName: string, value: string) => {
    setBoxes((prev) => {
      const arr = [...(prev[varName] ?? [])];
      if (arr.length === 0) return prev;
      const idx = arr.length - 1;
      arr[idx] = { ...arr[idx]!, value };
      return { ...prev, [varName]: arr };
    });
  };

  // ---- Grading ----

  const handleSubmit = () => {
    if (phase !== 'input') return;

    // Grade each variable: last non-empty value vs expected final
    const vResults: Record<string, boolean> = {};
    for (const v of card.variables) {
      const arr = boxes[v] ?? [];
      // Find last non-empty value
      let studentVal = '';
      for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i]!.value.trim() !== '') {
          studentVal = arr[i]!.value;
          break;
        }
      }
      vResults[v] = gradeTraceFinal(studentVal, finals[v] ?? '');
    }

    // Grade terminal
    let tResult = true;
    if (hasTerminal) {
      const expectedTerminal = card.terminalOutput.join('\n');
      tResult = normalize(terminal) === normalize(expectedTerminal);
    }

    setVarResults(vResults);
    setTerminalResult(hasTerminal ? tResult : null);

    const allVarsCorrect = card.variables.every((v) => vResults[v]);
    const allCorrect = allVarsCorrect && tResult;

    if (allCorrect) {
      setPhase('graded-pass');
      window.setTimeout(onAdvance, 700);
    } else if (!retried) {
      setPhase('graded-fail');
      setRetried(true);
    } else {
      setPhase('final-fail');
    }
  };

  const handleRetry = () => {
    setBoxes({});
    setTerminal('');
    setVarResults({});
    setTerminalResult(null);
    setPhase('input');
  };

  // ---- Key handlers ----

  const handleInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === 'graded-fail' && e.code === 'Space') {
        e.preventDefault();
        handleRetry();
      } else if (phase === 'final-fail' && e.code === 'Space') {
        e.preventDefault();
        onAdvance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, onAdvance]);

  // ---- Rendering helpers ----

  const cardClass =
    phase === 'graded-pass'
      ? 'card card--graded-pass'
      : phase === 'graded-fail' || phase === 'final-fail'
      ? 'card card--graded-fail'
      : 'card';

  const histories = useMemo(
    () => buildHistories(card.variables, card.expectedSteps),
    [card.variables, card.expectedSteps]
  );

  const renderBoxes = (varName: string) => {
    const arr = boxes[varName] ?? [];
    const isGraded = phase !== 'input';
    const varCorrect = varResults[varName];

    return arr.map((box, i) => {
      const isLast = i === arr.length - 1;
      let cls = 'trace-box';
      if (box.finalized) {
        cls += ' trace-box--struck';
      } else if (isLast && !isGraded) {
        cls += ' trace-box--active';
      }
      if (isGraded && isLast) {
        cls += varCorrect ? ' trace-box--pass' : ' trace-box--fail';
      }

      if (box.finalized || isGraded) {
        return (
          <span key={i} className={cls}>
            {box.value || ' '}
          </span>
        );
      }

      // Active editable box (always the last, non-finalized, during input)
      return (
        <input
          key={i}
          ref={activeInputRef}
          className={cls}
          type="text"
          value={box.value}
          onChange={(e) => updateLastBox(varName, e.target.value)}
          onKeyDown={handleInputKey}
          spellCheck={false}
          autoComplete="off"
          placeholder="value"
        />
      );
    });
  };

  return (
    <div className={`${cardClass} trace-card`}>
      <div className="atom-id">
        {(() => {
          const l = levelOf(card.atomId);
          return l ? `${l.label} · ` : '';
        })()}
        {card.atomId} · trace
      </div>

      <div className="trace-prompt">
        trace each variable through the code, then type what the terminal prints
      </div>

      <pre className="trace-code">
        <code>{card.code}</code>
      </pre>

      {card.userInputs.length > 0 && (
        <div className="trace-inputs">
          <div className="trace-inputs__label">assume input:</div>
          {card.userInputs.map((val, i) => (
            <div key={i} className="trace-input-line">
              <span className="trace-input-line__label">
                {card.inputLabels[i] ?? `input ${i + 1}:`}
              </span>{' '}
              <span className="trace-input-line__value">{val}</span>
            </div>
          ))}
        </div>
      )}

      {/* Memory table */}
      <div className="trace-vars">
        {card.variables.map((varName) => {
          const isGraded = phase !== 'input';
          const varCorrect = varResults[varName];
          const rowStatusClass = !isGraded
            ? ''
            : varCorrect
            ? 'trace-row--pass'
            : 'trace-row--fail';
          const arr = boxes[varName] ?? [];

          return (
            <div key={varName} className={`trace-row ${rowStatusClass}`}>
              <div className="trace-row__name">{varName}</div>
              <div className="trace-row__boxes">
                {renderBoxes(varName)}

                {phase === 'input' && (
                  <>
                    {arr.length > 0 && (
                      <button
                        type="button"
                        className="trace-remove-btn"
                        onClick={() => removeLastBox(varName)}
                        tabIndex={-1}
                        aria-label={`remove last ${varName} entry`}
                      >
                        x
                      </button>
                    )}
                    <button
                      type="button"
                      className="trace-add-btn"
                      onClick={() => addBox(varName)}
                      aria-label={`add ${varName} entry`}
                    >
                      +
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Terminal input */}
      {hasTerminal && (
        <div className="trace-terminal">
          <div className="trace-terminal__label">terminal output</div>
          {phase === 'input' ? (
            <textarea
              ref={terminalRef}
              className="trace-terminal-input"
              value={terminal}
              onChange={(e) => setTerminal(e.target.value)}
              onKeyDown={(e) => {
                // Enter without shift submits (shift+enter for newline)
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              rows={Math.max(2, card.terminalOutput.length)}
              spellCheck={false}
              placeholder="type what cout prints..."
            />
          ) : (
            <div
              className={
                'trace-terminal-input trace-terminal-input--readonly' +
                (terminalResult === true
                  ? ' trace-terminal-input--pass'
                  : terminalResult === false
                  ? ' trace-terminal-input--fail'
                  : '')
              }
            >
              {terminal || ' '}
            </div>
          )}
        </div>
      )}

      {/* Feedback */}
      {phase === 'graded-pass' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--pass">
            pass -- all correct
          </div>
        </div>
      )}

      {phase === 'graded-fail' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--fail">
            not quite -- check red rows and retry
          </div>
        </div>
      )}

      {phase === 'final-fail' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--fail">
            correct trace
          </div>
          <div className="feedback__detail">
            {card.variables.map((v) => {
              const hist = histories[v] ?? [];
              return (
                <div key={v} className="trace-reveal-row">
                  <strong>{v}</strong>:{' '}
                  {hist.map((val, i) => (
                    <span key={i}>
                      {i > 0 && ' -> '}
                      <code
                        className={
                          i === hist.length - 1
                            ? 'trace-reveal--final'
                            : 'trace-reveal--step'
                        }
                      >
                        {val}
                      </code>
                    </span>
                  ))}
                </div>
              );
            })}
            {hasTerminal && (
              <div className="trace-reveal-row">
                <strong>terminal</strong>:{' '}
                <code className="trace-reveal--final">
                  {card.terminalOutput.join('\n')}
                </code>
              </div>
            )}
            <div className="explanation">{card.teachMe}</div>
          </div>
        </div>
      )}

      <div className="kbd-hint">
        {phase === 'input' && (
          <>
            <span className="kbd">enter</span> to submit ·{' '}
            <span className="kbd">tab</span> next variable
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
