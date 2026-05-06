import { useEffect, useRef, useState } from 'react';
import { gradeWrite } from '../lib/grading';

export interface MemorizeDrillData {
  id: string;
  section: string;
  question: string;
  code: string;
  keyChecks: string[];
}

interface CodeMemorizeProps {
  drill: MemorizeDrillData;
  onAdvance: () => void;
}

type Phase = 'study' | 'input' | 'pass' | 'fail' | 'final-fail';

export function CodeMemorize({ drill, onAdvance }: CodeMemorizeProps) {
  const [phase, setPhase] = useState<Phase>('study');
  const [input, setInput] = useState('');
  const [retried, setRetried] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Reset on drill change
  useEffect(() => {
    setPhase('study');
    setInput('');
    setRetried(false);
  }, [drill.id]);

  // Focus textarea when entering input phase
  useEffect(() => {
    if (phase === 'input') inputRef.current?.focus();
  }, [phase]);

  // Global key handler
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === 'study' && e.code === 'Space') {
        e.preventDefault();
        setPhase('input');
      } else if (phase === 'fail' && e.code === 'Space') {
        e.preventDefault();
        setInput('');
        setPhase('input');
      } else if (phase === 'final-fail' && e.code === 'Space') {
        e.preventDefault();
        // Show code again for re-study, then re-attempt
        setInput('');
        setRetried(false);
        setPhase('study');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  const handleSubmit = () => {
    if (phase !== 'input') return;
    const passed = gradeWrite(input, drill.code, drill.keyChecks, []);
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

  const cardClass =
    phase === 'pass' ? 'card card--graded-pass'
    : phase === 'fail' || phase === 'final-fail' ? 'card card--graded-fail'
    : 'card';

  const lineCount = drill.code.split('\n').length;

  return (
    <div className={`${cardClass} cmem-card`}>
      <div className="atom-id">
        Code Memorize · {drill.section} · {drill.id}
      </div>

      <div className="write-spec">{drill.question}</div>

      {phase === 'study' && (
        <div className="cmem-study">
          <div className="cmem-study__label">memorize this code:</div>
          <pre className="cmem-study__code">{drill.code}</pre>
        </div>
      )}

      {(phase === 'input' || phase === 'fail' || phase === 'pass') && (
        <div className="write-input-area">
          <textarea
            ref={inputRef}
            className="write-input write-input--multi"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={phase !== 'input'}
            placeholder="type the code from memory"
            spellCheck={false}
            rows={Math.max(lineCount + 2, 6)}
          />
        </div>
      )}

      {phase === 'pass' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--pass">pass — memorized</div>
        </div>
      )}

      {phase === 'fail' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--fail">not quite — retry</div>
          <div className="feedback__detail">
            <div>required: <code>{drill.keyChecks.join(', ')}</code></div>
          </div>
        </div>
      )}

      {phase === 'final-fail' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--fail">correct code:</div>
          <div className="feedback__detail">
            <pre className="write-expected"><code>{drill.code}</code></pre>
          </div>
        </div>
      )}

      <div className="kbd-hint">
        {phase === 'study' && (
          <><span className="kbd">space</span> to hide code and begin typing</>
        )}
        {phase === 'input' && (
          <><span className="kbd">ctrl</span>+<span className="kbd">enter</span> to submit</>
        )}
        {phase === 'fail' && (
          <><span className="kbd">space</span> to retry</>
        )}
        {phase === 'final-fail' && (
          <><span className="kbd">space</span> to re-study</>
        )}
      </div>
    </div>
  );
}
