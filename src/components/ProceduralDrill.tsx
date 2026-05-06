import { useEffect, useRef, useState } from 'react';
import { gradeWrite } from '../lib/grading';

export interface DrillData {
  id: string;
  section: string;
  prompt: string;
  expectedAnswer: string;
  keyChecks: string[];
  variants: Array<{ prompt: string; expectedAnswer: string }>;
}

interface ProceduralDrillProps {
  drill: DrillData;
  onComplete: () => void; // called when 3-streak achieved
}

const STREAK_TARGET = 3;

export function ProceduralDrill({ drill, onComplete }: ProceduralDrillProps) {
  const [streak, setStreak] = useState(0);
  const [variantIdx, setVariantIdx] = useState(-1); // -1 = base prompt
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<'input' | 'pass' | 'fail' | 'final-fail'>('input');
  const [retried, setRetried] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Current variant
  const current = variantIdx === -1
    ? { prompt: drill.prompt, expectedAnswer: drill.expectedAnswer }
    : drill.variants[variantIdx % drill.variants.length]!;

  // Reset on drill change
  useEffect(() => {
    setStreak(0);
    setVariantIdx(-1);
    setInput('');
    setPhase('input');
    setRetried(false);
  }, [drill.id]);

  // Focus textarea
  useEffect(() => {
    if (phase === 'input') {
      inputRef.current?.focus();
    }
  }, [phase, variantIdx]);

  const handleSubmit = () => {
    if (phase !== 'input') return;
    const passed = gradeWrite(input, current.expectedAnswer, drill.keyChecks, []);
    if (passed) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setPhase('pass');
      if (newStreak >= STREAK_TARGET) {
        window.setTimeout(onComplete, 600);
      } else {
        window.setTimeout(() => {
          // Advance to next variant
          setVariantIdx((v) => v + 1);
          setInput('');
          setPhase('input');
          setRetried(false);
        }, 600);
      }
    } else if (!retried) {
      setPhase('fail');
      setRetried(true);
    } else {
      setPhase('final-fail');
      // Reset streak on final fail
      setStreak(0);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Global key handler for non-input phases
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase === 'fail' && e.code === 'Space') {
        e.preventDefault();
        setInput('');
        setPhase('input');
      } else if (phase === 'final-fail' && e.code === 'Space') {
        e.preventDefault();
        // Restart this drill from scratch
        setVariantIdx(-1);
        setInput('');
        setPhase('input');
        setRetried(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  const streakDots = Array.from({ length: STREAK_TARGET }, (_, i) => (
    <span
      key={i}
      className={
        'streak-dot' +
        (i < streak ? ' streak-dot--filled' : '') +
        (i === streak && phase === 'pass' ? ' streak-dot--pulse' : '')
      }
    />
  ));

  const cardClass =
    phase === 'pass'
      ? 'card card--graded-pass'
      : phase === 'fail' || phase === 'final-fail'
      ? 'card card--graded-fail'
      : 'card';

  return (
    <div className={`${cardClass} procedural-card`}>
      <div className="atom-id">
        Procedural · {drill.section} · {drill.id}
      </div>

      <div className="streak-bar">
        {streakDots}
        <span className="streak-label">{streak}/{STREAK_TARGET}</span>
      </div>

      <div className="write-spec">{current.prompt}</div>

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
            rows={8}
          />
        </div>
      )}

      {phase === 'pass' && (
        <div className="feedback">
          <div className="feedback__title feedback__title--pass">
            {streak >= STREAK_TARGET ? `streak ${STREAK_TARGET}/${STREAK_TARGET} — complete` : `streak ${streak}/${STREAK_TARGET}`}
          </div>
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
          <div className="feedback__title feedback__title--fail">streak reset — correct answer:</div>
          <div className="feedback__detail">
            <pre className="write-expected"><code>{current.expectedAnswer}</code></pre>
          </div>
        </div>
      )}

      <div className="kbd-hint">
        {phase === 'input' && (
          <>
            <span className="kbd">ctrl</span>+<span className="kbd">enter</span> to submit
          </>
        )}
        {phase === 'fail' && (
          <>
            <span className="kbd">space</span> to retry
          </>
        )}
        {phase === 'final-fail' && (
          <>
            <span className="kbd">space</span> to restart drill (streak resets)
          </>
        )}
      </div>
    </div>
  );
}
