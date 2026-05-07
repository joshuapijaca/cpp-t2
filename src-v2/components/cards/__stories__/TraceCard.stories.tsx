/**
 * TraceCard.stories.tsx
 *
 * Five interactive stories for TraceCard, scaling from one-line easy
 * up to V2.0-style sum-positive exam-realistic. Each story is a plain
 * exported React component (cpp-t2 doesn't run Storybook).
 *
 * Source fixtures: hand-mirrored from
 *   cpp-t2/data/v2/cards/L0/F-03/trace-01.yml ... trace-04.yml
 * plus one synthesized "exam-realistic" card built around sum-positive,
 * the canonical Q1 V2.0 walk-through.
 */

import { useState } from 'react';
import { TraceCard } from '../TraceCard';
import type { TraceCard as TraceCardData } from '../../../types/card-schema';

// ─────────────────────────────────────────────────────────────────────
// Common-fields helper — every fixture uses the same authoring scaffold.
// ─────────────────────────────────────────────────────────────────────
type AnyTrace = TraceCardData;

const baseFields: Omit<
  TraceCardData,
  'id' | 'atomId' | 'stem' | 'code' | 'variables' | 'expectedTrace' | 'terminalOutput' | 'teachMe'
> = {
  schemaVersion: 'v2',
  level: 'L0',
  type: 'TraceCard',
  stage: 0,
  qTags: ['Q1', 'Q4'],
  source: { kind: 'v2', ref: 'TraceCard.stories fixture' },
  commonMistakeIds: [],
  status: 'NEW',
  createdBy: 'TRACE-CARD-COMPONENT-SPECIALIST',
  reviewedBy: [],
  inputMode: 'final-only',
  userInputs: [],
  inputLabels: [],
};

// ─────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────

const easyCard: AnyTrace = {
  ...baseFields,
  id: 'L0-F03-trace-01',
  atomId: 'F-03',
  stem:
    'Three lines, one variable. After every line runs, what does the variables panel hold? Type the value of `x`.',
  code: `int main() {
  int x = 5;
  return 0;
}`,
  variables: ['x'],
  expectedTrace: [
    { line: 2, variable: 'x', value: '5', output: null },
  ],
  terminalOutput: [],
  teachMe:
    'After `int x = 5;` runs, the variables panel has exactly one box named `x` containing 5. There is no `cout`, so the terminal stays empty.',
} as AnyTrace;

const mediumCard: AnyTrace = {
  ...baseFields,
  id: 'L0-trace-medium-for-loop',
  atomId: 'F-03',
  stem:
    'Hand-execute this for-loop. Track i and sum. What is the FINAL value of sum? What does the terminal print?',
  code: `int main() {
  int sum = 0;
  for (int i = 1; i <= 4; i++) {
    sum = sum + i;
  }
  cout << sum << endl;
  return 0;
}`,
  variables: ['sum', 'i'],
  expectedTrace: [
    { line: 2, variable: 'sum', value: '0', output: null },
    { line: 3, variable: 'i', value: '1', output: null },
    { line: 4, variable: 'sum', value: '1', output: null },
    { line: 3, variable: 'i', value: '2', output: null },
    { line: 4, variable: 'sum', value: '3', output: null },
    { line: 3, variable: 'i', value: '3', output: null },
    { line: 4, variable: 'sum', value: '6', output: null },
    { line: 3, variable: 'i', value: '4', output: null },
    { line: 4, variable: 'sum', value: '10', output: null },
    { line: 3, variable: 'i', value: '5', output: null }, // exit value
    { line: 6, variable: '', value: '', output: '10' },
  ],
  terminalOutput: ['10'],
  teachMe:
    'Loop iterates i=1,2,3,4. Each pass: sum += i. After body, i becomes 5 (failed condition), loop exits. Final sum = 1+2+3+4 = 10.',
} as AnyTrace;

const hardCard: AnyTrace = {
  ...baseFields,
  id: 'L0-trace-hard-struct-array',
  atomId: 'F-03',
  stem:
    'Struct with an array field. Trace the for-loop that accumulates into stats.total. Final value of stats.total + terminal output?',
  code: `struct Stats {
  int scores[3];
  int total;
};

int main() {
  Stats stats = { {2, 4, 6}, 0 };
  for (int i = 0; i < 3; i++) {
    stats.total = stats.total + stats.scores[i];
  }
  cout << stats.total << endl;
  return 0;
}`,
  variables: ['stats.total', 'i'],
  expectedTrace: [
    { line: 7, variable: 'stats.total', value: '0', output: null },
    { line: 8, variable: 'i', value: '0', output: null },
    { line: 9, variable: 'stats.total', value: '2', output: null },
    { line: 8, variable: 'i', value: '1', output: null },
    { line: 9, variable: 'stats.total', value: '6', output: null },
    { line: 8, variable: 'i', value: '2', output: null },
    { line: 9, variable: 'stats.total', value: '12', output: null },
    { line: 8, variable: 'i', value: '3', output: null }, // exit
    { line: 11, variable: '', value: '', output: '12' },
  ],
  terminalOutput: ['12'],
  teachMe:
    'stats.total starts at 0 (initialized in the struct literal). The loop adds scores[0]=2, scores[1]=4, scores[2]=6. Final total = 0+2+4+6 = 12. The variable name is `stats.total` (dot-access into the struct).',
} as AnyTrace;

const edgeCard: AnyTrace = {
  ...baseFields,
  id: 'L0-trace-edge-off-by-one',
  atomId: 'F-03',
  stem:
    'CAREFUL: this loop uses `i <= 3` not `i < 3`. Hand-execute. What is the FINAL value of count and what does the terminal print?',
  code: `int main() {
  int count = 0;
  for (int i = 0; i <= 3; i++) {
    count = count + 1;
  }
  cout << count << endl;
  return 0;
}`,
  variables: ['count', 'i'],
  expectedTrace: [
    { line: 2, variable: 'count', value: '0', output: null },
    { line: 3, variable: 'i', value: '0', output: null },
    { line: 4, variable: 'count', value: '1', output: null },
    { line: 3, variable: 'i', value: '1', output: null },
    { line: 4, variable: 'count', value: '2', output: null },
    { line: 3, variable: 'i', value: '2', output: null },
    { line: 4, variable: 'count', value: '3', output: null },
    { line: 3, variable: 'i', value: '3', output: null },
    { line: 4, variable: 'count', value: '4', output: null },
    { line: 3, variable: 'i', value: '4', output: null }, // exit
    { line: 6, variable: '', value: '', output: '4' },
  ],
  terminalOutput: ['4'],
  teachMe:
    'Trap: `i <= 3` runs FOUR times (i = 0, 1, 2, 3) — not three. Common error: write 3 because the loop "looks like it goes to 3". The condition is INCLUSIVE of 3, so count = 4.',
} as AnyTrace;

const examRealisticCard: AnyTrace = {
  ...baseFields,
  id: 'L0-trace-exam-sum-positive',
  atomId: 'F-03',
  stem:
    'V2.0-style exam Q1: trace this `sum_positive` function. The student calls it with array {3, -1, 5, -2, 4}. What is the final value returned and what is printed?',
  code: `int sum_positive(int arr[], int n) {
  int total = 0;
  for (int i = 0; i < n; i++) {
    if (arr[i] > 0) {
      total = total + arr[i];
    }
  }
  return total;
}

int main() {
  int data[5] = {3, -1, 5, -2, 4};
  int result = sum_positive(data, 5);
  cout << "sum: " << result << endl;
  return 0;
}`,
  variables: ['total', 'i', 'result'],
  expectedTrace: [
    // Inside sum_positive
    { line: 2, variable: 'total', value: '0', output: null },
    { line: 3, variable: 'i', value: '0', output: null },
    { line: 5, variable: 'total', value: '3', output: null }, // arr[0]=3>0
    { line: 3, variable: 'i', value: '1', output: null },
    // arr[1]=-1, branch skipped
    { line: 3, variable: 'i', value: '2', output: null },
    { line: 5, variable: 'total', value: '8', output: null }, // arr[2]=5>0
    { line: 3, variable: 'i', value: '3', output: null },
    // arr[3]=-2, branch skipped
    { line: 3, variable: 'i', value: '4', output: null },
    { line: 5, variable: 'total', value: '12', output: null }, // arr[4]=4>0
    { line: 3, variable: 'i', value: '5', output: null }, // exit
    // Return to main
    { line: 13, variable: 'result', value: '12', output: null },
    { line: 14, variable: '', value: '', output: 'sum: 12' },
  ],
  terminalOutput: ['sum: 12'],
  teachMe:
    'Walk: total starts 0. arr[0]=3 > 0 → total=3. arr[1]=-1 skipped. arr[2]=5 → total=8. arr[3]=-2 skipped. arr[4]=4 → total=12. Returns 12. main prints `sum: 12`. This is the canonical Q1 V2.0 form: function with conditional accumulation, called from main, single cout.',
} as AnyTrace;

// ─────────────────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────────────────

interface FrameProps {
  title: string;
  card: AnyTrace;
}

function StoryFrame({ title, card }: FrameProps) {
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ marginTop: 0, color: '#e6edf3' }}>{title}</h2>
      {completedAt && (
        <p style={{ color: '#7ee787', fontSize: 13 }}>
          Marked complete at {completedAt}
        </p>
      )}
      <TraceCard
        card={card}
        onComplete={(correct) => {
          if (correct) setCompletedAt(new Date().toLocaleTimeString());
        }}
      />
    </div>
  );
}

/** Story 1: Easy — 3-line trace, single int. Mirrors trace-01.yml. */
export function Easy() {
  return <StoryFrame title="1. Easy — single int" card={easyCard} />;
}

/** Story 2: Medium — for-loop accumulator. Mirrors trace-04 + Q1 prep. */
export function MediumForLoop() {
  return (
    <StoryFrame
      title="2. Medium — for-loop accumulator (sum 1..4)"
      card={mediumCard}
    />
  );
}

/** Story 3: Hard — struct + array + dot-access mutation. */
export function HardStructArray() {
  return (
    <StoryFrame title="3. Hard — struct holds array + total" card={hardCard} />
  );
}

/** Story 4: Edge — `i <= n` off-by-one trap. */
export function EdgeOffByOne() {
  return (
    <StoryFrame title="4. Edge — `i <= 3` off-by-one trap" card={edgeCard} />
  );
}

/** Story 5: Exam-realistic — V2.0 sum-positive. */
export function ExamRealisticSumPositive() {
  return (
    <StoryFrame
      title="5. Exam-realistic — V2.0 sum_positive"
      card={examRealisticCard}
    />
  );
}
