import { useEffect, useMemo, useRef, useState } from 'react';
import type { TraceCard as TraceCardData, Step } from '../types/card';
import { gradeTraceFinal } from '../lib/grading';
import { levelOf } from '../lib/levels';

type Phase = 'input' | 'graded-pass' | 'graded-fail' | 'final-fail';

interface TraceCardProps {
  card: TraceCardData;
  onAdvance: () => void;
}

interface VarHistory {
  name: string;
  values: string[];
}

/** Group expected steps into per-variable history strips. */
function buildHistories(variables: string[], steps: Step[]): VarHistory[] {
  const histories: Record<string, string[]> = {};
  for (const v of variables) histories[v] = [];

  for (const step of steps) {
    if (!step.variable) continue;
    if (!(step.variable in histories)) histories[step.variable] = [];
    const arr = histories[step.variable]!;
    arr.push(step.value);
  }

  return variables.map((name) => ({ name, values: histories[name] ?? [] }));
}

/** Final value per variable — used for final-only grading. */
function finalValuesFor(histories: VarHistory[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const h of histories) {
    out[h.name] = h.values.length > 0 ? h.values[h.values.length - 1]! : '';
  }
  return out;
}

export function TraceCard({ card, onAdvance }: TraceCardProps) {
  const [phase, setPhase] = useState<Phase>('input');
  const [studentValues, setStudentValues] = useState<Record<string, string>>({});
  const [retried, setRetried] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const histories = useMemo(
    () => buildHistories(card.variables, card.expectedSteps),
    [card.variables, card.expectedSteps]
  );

  const finalValues = useMemo(() => finalValuesFor(histories), [histories]);

  // Reset on card change
  useEffect(() => {
    setPhase('input');
    setStudentValues({});
    setRetried(false);
  }, [card.atomId, card.code]);

  // Focus first input when entering input phase
  useEffect(() => {
    if (phase === 'input') {
      firstInputRef.current?.focus();
    }
  }, [phase]);

  const handleSubmit = () => {
    if (phase !== 'input') return;
    const allCorrect = card.variables.every((v) =>
      gradeTraceFinal(studentValues[v] ?? '', finalValues[v] ?? '')
    );
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
    setStudentValues({});
    setPhase('input');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Global key handler for non-input phases
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

  const cardClass =
    phase === 'graded-pass'
      ? 'card card--graded-pass'
      : phase === 'graded-fail' || phase === 'final-fail'
      ? 'card card--graded-fail'
      : 'card';

  const setValueFor = (name: string, value: string) => {
    setStudentValues((s) => ({ ...s, [name]: value }));
  };

  return (
    <div className={`${cardClass} trace-card`}>
      <div className="atom-id">
        {(() => { const l = levelOf(card.atomId); return l ? `${l.label} · ` : ''; })()}
        {card.atomId} · trace
      </div>

      <div className="trace-prompt">predict the FINAL value of each variable</div>

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

      {(phase === 'input' || phase === 'graded-pass' || phase === 'graded-fail' || phase === 'final-fail') && (
        <div className="trace-vars">
          {histories.map((h, idx) => {
            const expected = finalValues[h.name] ?? '';
            const student = studentValues[h.name] ?? '';
            const correct = gradeTraceFinal(student, expected);
            const showStatus = phase !== 'input';
            const statusClass = !showStatus
              ? ''
              : correct
              ? 'trace-var-row--pass'
              : 'trace-var-row--fail';

            return (
              <div key={h.name} className={`trace-var-row ${statusClass}`}>
                <div className="trace-var-name">{h.name}</div>
                <div className="trace-var-history">
                  {h.values.map((v, i) => {
                    const isLast = i === h.values.length - 1;
                    return (
                      <span
                        key={i}
                        className={
                          isLast
                            ? 'trace-var-cell trace-var-cell--current'
                            : 'trace-var-cell trace-var-cell--past'
                        }
                      >
                        {v}
                      </span>
                    );
                  })}
                </div>
                <div className="trace-var-input">
                  <input
                    ref={idx === 0 ? firstInputRef : undefined}
                    type="text"
                    value={student}
                    onChange={(e) => setValueFor(h.name, e.target.value)}
                    onKeyDown={handleKey}
                    disabled={phase !== 'input'}
                    placeholder="final value"
                    spellCheck={false}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {card.terminalOutput.length > 0 && (
        <div className="trace-terminal">
          <div className="trace-terminal__label">terminal</div>
          <div className="trace-terminal__lines">
            {card.terminalOutput.map((line, i) => (
              <div key={i} className="trace-terminal__line">
                {line}
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 'graded-pass' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--pass">✓ pass — all variables correct</div>
        </div>
      )}

      {phase === 'graded-fail' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--fail">✕ not quite — retry once</div>
          <div className="feedback__detail">
            check each row: red = wrong, green = correct. fix and resubmit.
          </div>
        </div>
      )}

      {phase === 'final-fail' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--fail">✕ correct trace</div>
          <div className="feedback__detail">
            {card.variables.map((v) => (
              <div key={v}>
                <strong>{v}</strong>: final = <code>{finalValues[v] ?? ''}</code>
              </div>
            ))}
            <div className="explanation">{card.teachMe}</div>
          </div>
        </div>
      )}

      <div className="kbd-hint">
        {phase === 'input' && (
          <>
            <span className="kbd">enter</span> to submit ·{' '}
            <span className="kbd">tab</span> next field
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
