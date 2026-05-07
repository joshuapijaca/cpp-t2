/**
 * PreflightCheckCard.stories.tsx — three stories.
 * 1. SinglePreflight — a single preflight checklist card.
 * 2. ExamWarmup — slightly larger checklist before mock.
 * 3. SequenceRound — 6-card pass-through with dashboard (untimed).
 */

import { useState } from 'react';
import {
  PreflightCheckCard,
  PreflightSequence,
  type PreflightSequenceItem,
  type PreflightSummary,
} from '../PreflightCheckCard';
import type { PreflightCheckCard as PreflightCheckCardData } from '../../../types/card-schema';

const baseFields = {
  schemaVersion: 'v2' as const,
  level: 'L0' as const,
  type: 'PreflightCheckCard' as const,
  stage: 0 as const,
  source: { kind: 'v2' as const, ref: 'PreflightCheckCard.stories fixture' },
  commonMistakeIds: [] as string[],
  status: 'NEW' as const,
  createdBy: 'CARD-PreflightCheckCard',
  reviewedBy: [] as string[],
};

const singleCard: PreflightCheckCardData = {
  ...baseFields,
  id: 'pf-single',
  atomId: 'F-22',
  qTags: ['Q3'],
  stem: 'Before you write Q3 read_x — confirm you know each pre-req.',
  scenario:
    'About to attempt Q3 read_books. Tick every item you confidently know.',
  checklist: [
    'I know `void` is the return type of read_x.',
    'I know `&` goes between the struct type and the parameter name.',
    'I know `int n` is the second parameter.',
    'I know the loop is `for (int i = 0; i < n; i++)`.',
    'I know each field is read with `cin >> list[i].field`.',
  ],
  explanation:
    'Five pre-flight items map to the Q3 hot tokens. If any are not ticked, drill that atom before the mock.',
} as PreflightCheckCardData;

const warmupCard: PreflightCheckCardData = {
  ...baseFields,
  id: 'pf-warmup',
  atomId: 'F-13',
  qTags: ['Q1'],
  stem: 'Mock-day warmup — confirm the for-loop fundamentals.',
  scenario: 'Mock starts in 2 minutes. Tick to confirm each fundamental.',
  checklist: [
    'I know the three slots: init, condition, update.',
    'I know `i++` is the same as `i = i + 1`.',
    'I know `i < n` runs n times for arr length n.',
    'I know the body executes when condition is TRUE.',
    'I know condition is checked BEFORE each iteration.',
    'I know the loop variable persists in the surrounding scope only if declared outside.',
  ],
  explanation: 'These six items underpin every Q1 trace.',
} as PreflightCheckCardData;

interface FrameProps {
  title: string;
  card: PreflightCheckCardData;
}
function StoryFrame({ title, card }: FrameProps) {
  const [doneAt, setDoneAt] = useState<string | null>(null);
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ marginTop: 0, color: '#e6edf3' }}>{title}</h2>
      {doneAt && (
        <p style={{ color: '#7ee787', fontSize: 13 }}>
          Confirmed at {doneAt}
        </p>
      )}
      <PreflightCheckCard
        card={card}
        onComplete={(c) => {
          if (c) setDoneAt(new Date().toLocaleTimeString());
        }}
      />
    </div>
  );
}

export function SinglePreflight() {
  return (
    <StoryFrame title="1. Single — Q3 pre-write checklist" card={singleCard} />
  );
}
export function ExamWarmup() {
  return <StoryFrame title="2. Warmup — for-loop fundamentals" card={warmupCard} />;
}

// ─────────────────────────────────────────────────────────────────────
// Pass-through round story — 6 mini cards (untimed).
// ─────────────────────────────────────────────────────────────────────

interface MiniProps {
  prompt: string;
  expected: string;
  onComplete: (correct: boolean) => void;
}

function MiniCard({ prompt, expected, onComplete }: MiniProps) {
  const [val, setVal] = useState('');
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
        aria-label="lightning answer"
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
        onClick={() => {
          const ok =
            val.trim().toLowerCase() ===
            expected.trim().toLowerCase();
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
        submit
      </button>
    </div>
  );
}

export function SequenceRound() {
  const items: PreflightSequenceItem[] = [
    {
      cardId: 'lr-01',
      atomId: 'F-04',
      render: ({ onComplete }) => (
        <MiniCard
          prompt="Type the data type for whole numbers in C++."
          expected="int"
          onComplete={onComplete}
        />
      ),
    },
    {
      cardId: 'lr-02',
      atomId: 'F-04',
      render: ({ onComplete }) => (
        <MiniCard
          prompt="Type the data type for decimals in C++."
          expected="double"
          onComplete={onComplete}
        />
      ),
    },
    {
      cardId: 'lr-03',
      atomId: 'F-07',
      render: ({ onComplete }) => (
        <MiniCard
          prompt="Statement terminator in C++?"
          expected=";"
          onComplete={onComplete}
        />
      ),
    },
    {
      cardId: 'lr-04',
      atomId: 'F-13',
      render: ({ onComplete }) => (
        <MiniCard
          prompt="Increment i by 1 in a for-loop update."
          expected="i++"
          onComplete={onComplete}
        />
      ),
    },
    {
      cardId: 'lr-05',
      atomId: 'F-22',
      render: ({ onComplete }) => (
        <MiniCard
          prompt="Symbol for pass-by-reference?"
          expected="&"
          onComplete={onComplete}
        />
      ),
    },
    {
      cardId: 'lr-06',
      atomId: 'F-18',
      render: ({ onComplete }) => (
        <MiniCard
          prompt="Keyword to define a struct?"
          expected="struct"
          onComplete={onComplete}
        />
      ),
    },
  ];

  const [summary, setSummary] = useState<PreflightSummary | null>(null);

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ marginTop: 0, color: '#e6edf3' }}>
        3. Sequence — 6-card pass-through (untimed)
      </h2>
      {summary && (
        <p style={{ color: '#79c0ff', fontSize: 13 }}>
          Final dashboard rendered. Score {summary.passed}/{summary.total}.
        </p>
      )}
      <PreflightSequence
        items={items}
        onComplete={(s) => setSummary(s)}
      />
    </div>
  );
}
