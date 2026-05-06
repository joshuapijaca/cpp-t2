import { useEffect, useRef, useState } from 'react';
import { gradeWrite } from '../lib/grading';

export interface MatrixData {
  id: string;
  section: string;
  matrixType: string;
  examples: Array<{ label: string; code: string }>;
  prompt: string;
  expectedAnswer: string;
  keyChecks: string[];
}

interface CodeMatrixProps {
  matrix: MatrixData;
  onAdvance: () => void;
}

type Phase = 'input' | 'pass' | 'fail' | 'final-fail';

export function CodeMatrix({ matrix, onAdvance }: CodeMatrixProps) {
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>('input');
  const [retried, setRetried] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setInput('');
    setPhase('input');
    setRetried(false);
  }, [matrix.id]);

  useEffect(() => {
    if (phase === 'input') inputRef.current?.focus();
  }, [phase]);

  const handleSubmit = () => {
    if (phase !== 'input') return;
    const passed = gradeWrite(input, matrix.expectedAnswer, matrix.keyChecks, []);
    if (passed) {
      setPhase('pass');
      window.setTimeout(onAdvance, 700);
    } else if (!retried) {
      setPhase('fail');
      setRetried(true);
    } else {
      setPhase('final-fail');
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === 'fail' && e.code === 'Space') {
        e.preventDefault();
        setInput('');
        setPhase('input');
      } else if (phase === 'final-fail' && e.code === 'Space') {
        e.preventDefault();
        onAdvance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, onAdvance]);

  const cardClass =
    phase === 'pass' ? 'card card--graded-pass'
    : phase === 'fail' || phase === 'final-fail' ? 'card card--graded-fail'
    : 'card';

  const typeLabel =
    matrix.matrixType === 'algorithm' ? 'Algorithm Transfer'
    : matrix.matrixType === 'entity' ? 'Entity Swap'
    : 'Complexity Progression';

  return (
    <div className={`${cardClass} matrix-card`}>
      <div className="atom-id">
        Code Matrix · {typeLabel} · {matrix.id}
      </div>

      <div className="matrix-examples">
        {matrix.examples.map((ex, i) => (
          <div key={i} className="matrix-example">
            <div className="matrix-example__label">{ex.label}</div>
            <pre className="matrix-example__code">{ex.code}</pre>
          </div>
        ))}
      </div>

      <div className="matrix-divider">
        <span className="matrix-divider__arrow">↓ your turn</span>
      </div>

      <div className="write-spec">{matrix.prompt}</div>

      {(phase === 'input' || phase === 'fail' || phase === 'pass') && (
        <div className="write-input-area">
          <textarea
            ref={inputRef}
            className="write-input write-input--multi"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={phase !== 'input'}
            placeholder="write your answer"
            spellCheck={false}
            rows={10}
          />
        </div>
      )}

      {phase === 'pass' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--pass">pass — pattern transferred</div>
        </div>
      )}

      {phase === 'fail' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--fail">not quite — retry</div>
          <div className="feedback__detail">
            <div>required: <code>{matrix.keyChecks.join(', ')}</code></div>
          </div>
        </div>
      )}

      {phase === 'final-fail' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--fail">correct answer:</div>
          <div className="feedback__detail">
            <pre className="write-expected"><code>{matrix.expectedAnswer}</code></pre>
          </div>
        </div>
      )}

      <div className="kbd-hint">
        {phase === 'input' && (
          <><span className="kbd">ctrl</span>+<span className="kbd">enter</span> to submit</>
        )}
        {phase === 'fail' && (
          <><span className="kbd">space</span> to retry</>
        )}
        {phase === 'final-fail' && (
          <><span className="kbd">space</span> to continue</>
        )}
      </div>
    </div>
  );
}
