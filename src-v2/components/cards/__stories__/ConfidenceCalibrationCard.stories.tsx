/**
 * ConfidenceCalibrationCard.stories.tsx — three stories.
 * 1. WrapsMcq — calibration around a tiny multi-choice question.
 * 2. WrapsTrace — wraps a hand-execute mini.
 * 3. WrapsWrite — wraps a struct-write surface.
 */

import { useState } from 'react';
import { ConfidenceCalibrationCard } from '../ConfidenceCalibrationCard';
import type { ConfidenceCalibrationCard as ConfidenceCalibrationCardData } from '../../../types/card-schema';

const baseFields = {
  schemaVersion: 'v2' as const,
  level: 'L1' as const,
  type: 'ConfidenceCalibrationCard' as const,
  stage: 1 as const,
  qTags: ['Q1'] as ('Q1' | 'Q2' | 'Q3' | 'Q4')[],
  source: {
    kind: 'v2' as const,
    ref: 'ConfidenceCalibrationCard.stories fixture',
  },
  commonMistakeIds: [] as string[],
  status: 'NEW' as const,
  createdBy: 'CARD-ConfidenceCalibrationCard',
  reviewedBy: [] as string[],
  confidenceLevels: [10, 30, 55, 80, 95] as number[],
};

const mcqCard: ConfidenceCalibrationCardData = {
  ...baseFields,
  id: 'cal-mcq-int-default',
  atomId: 'F-04',
  stem: 'Predict your confidence, then answer this MCQ about int defaults.',
  prompt: 'In `int x; cout << x;` what does C++ print?',
  canonicalAnswer: 'undefined / garbage',
  keyChecks: ['undefined'],
  explanation:
    'A local int has no default value in C++. Reading it before assigning is undefined behavior — typically it shows whatever bit pattern was already in that memory cell.',
} as ConfidenceCalibrationCardData;

const traceCard: ConfidenceCalibrationCardData = {
  ...baseFields,
  id: 'cal-trace-loop-sum',
  atomId: 'F-13',
  stem: 'Predict your confidence, then trace the loop.',
  prompt: 'After: `int s=0; for (int i=1;i<=3;i++) s+=i;` — what is s?',
  canonicalAnswer: '6',
  keyChecks: ['6'],
  explanation: 's = 1 + 2 + 3 = 6.',
} as ConfidenceCalibrationCardData;

const writeCard: ConfidenceCalibrationCardData = {
  ...baseFields,
  id: 'cal-write-struct-point',
  atomId: 'F-18',
  stem: 'Predict your confidence, then write the struct.',
  prompt: 'Write a Point struct with two double fields x and y.',
  canonicalAnswer: `struct Point {
  double x;
  double y;
};`,
  keyChecks: ['struct Point', 'double x', 'double y', '};'],
  explanation:
    'Two double fields, terminating semicolon after the closing brace.',
} as ConfidenceCalibrationCardData;

interface MiniInnerProps {
  prompt: string;
  expectedAnswer: string;
  disabled: boolean;
  onComplete: (correct: boolean) => void;
}

/**
 * Tiny inner card stub — represents whatever inner card the calibration
 * wrapper wraps. In a real deck this would be a TraceCard, MCQCard, etc.
 */
function MiniInnerCard({
  prompt,
  expectedAnswer,
  disabled,
  onComplete,
}: MiniInnerProps) {
  const [val, setVal] = useState('');
  const [graded, setGraded] = useState<boolean | null>(null);
  return (
    <div
      style={{
        padding: 12,
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: 6,
        color: '#e6edf3',
        fontFamily: 'monospace',
      }}
    >
      <p style={{ margin: '0 0 8px 0', fontSize: 13 }}>{prompt}</p>
      <input
        type="text"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        disabled={disabled}
        aria-label="answer input"
        style={{
          background: '#0d1117',
          color: '#7ee787',
          border: '1px solid #30363d',
          borderRadius: 4,
          padding: '6px 10px',
          fontFamily: 'inherit',
          width: '100%',
          marginBottom: 8,
        }}
      />
      <button
        type="button"
        disabled={disabled || graded !== null}
        onClick={() => {
          const ok =
            val.trim().replace(/\s+/g, ' ').toLowerCase() ===
            expectedAnswer.trim().replace(/\s+/g, ' ').toLowerCase();
          setGraded(ok);
          onComplete(ok);
        }}
        style={{
          background: '#79c0ff',
          color: '#0d1117',
          border: 'none',
          padding: '6px 12px',
          borderRadius: 4,
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        {graded === null ? 'submit inner' : graded ? 'inner ✓' : 'inner ✗'}
      </button>
    </div>
  );
}

interface FrameProps {
  title: string;
  card: ConfidenceCalibrationCardData;
}
function StoryFrame({ title, card }: FrameProps) {
  const [calBrier, setCalBrier] = useState<number | null>(null);
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ marginTop: 0, color: '#e6edf3' }}>{title}</h2>
      {calBrier !== null && (
        <p style={{ color: '#79c0ff', fontSize: 13 }}>
          Brier delta logged: {calBrier.toFixed(3)}
        </p>
      )}
      <ConfidenceCalibrationCard
        card={card}
        onComplete={() => {}}
        onCalibrate={(r) => setCalBrier(r.brier)}
        renderInner={({ onComplete, disabled }) => (
          <MiniInnerCard
            prompt={card.prompt}
            expectedAnswer={card.canonicalAnswer}
            disabled={disabled}
            onComplete={onComplete}
          />
        )}
      />
    </div>
  );
}

export function WrapsMcq() {
  return <StoryFrame title="1. Wraps an MCQ — int default" card={mcqCard} />;
}
export function WrapsTrace() {
  return <StoryFrame title="2. Wraps a trace — loop sum" card={traceCard} />;
}
export function WrapsWrite() {
  return (
    <StoryFrame title="3. Wraps a write — Point struct" card={writeCard} />
  );
}
