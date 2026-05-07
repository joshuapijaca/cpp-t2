/**
 * AdversarialMockCard.stories.tsx — three stories.
 * 1. Q1Hardest — adversarial Q1 trace with negatives + zero data.
 * 2. Q2FourField — adversarial Q2 4-field struct.
 * 3. Q3MissingAmpersand — adversarial Q3 read_x with shuffled fields.
 */

import { useState } from 'react';
import { AdversarialMockCard } from '../AdversarialMockCard';
import type { AdversarialMockCard as AdversarialMockCardData } from '../../../types/card-schema';

const baseFields = {
  schemaVersion: 'v2' as const,
  level: 'L4' as const,
  type: 'AdversarialMockCard' as const,
  stage: 5 as const,
  source: { kind: 'v2' as const, ref: 'AdversarialMockCard.stories fixture' },
  commonMistakeIds: [] as string[],
  status: 'NEW' as const,
  createdBy: 'CARD-AdversarialMockCard',
  reviewedBy: [] as string[],
};

const q1Card: AdversarialMockCardData = {
  ...baseFields,
  id: 'adv-q1-sum-positive-hardest',
  atomId: 'F-13',
  qTags: ['Q1'],
  questionNumber: 'Q1',
  stem: 'ADVERSARIAL Q1 — sum_positive on a tricky data set.',
  fullPrompt: `Trace sum_positive(arr, n) with arr = {-1, 0, -2, 0, -3} and n = 5.
Track total at every iteration. What does the function return?`,
  canonicalAnswer: `total = 0
i=0 arr[0]=-1, skipped, total=0
i=1 arr[1]=0, skipped (0 is NOT > 0), total=0
i=2 arr[2]=-2, skipped, total=0
i=3 arr[3]=0, skipped, total=0
i=4 arr[4]=-3, skipped, total=0
return 0`,
  rubric: [
    'total = 0',
    '0 is NOT > 0',
    'return 0',
  ],
  explanation:
    'Trap: 0 fails the `> 0` test. All-non-positive data returns 0. Many students wrongly return -1 or sum negatives.',
} as AdversarialMockCardData;

const q2Card: AdversarialMockCardData = {
  ...baseFields,
  id: 'adv-q2-four-field-struct',
  atomId: 'F-18',
  qTags: ['Q2'],
  questionNumber: 'Q2',
  stem: 'ADVERSARIAL Q2 — 4-field struct with mixed types.',
  fullPrompt: `Define a struct Sensor with these fields IN ORDER:
- id (int)
- label (string)
- threshold (double)
- active (bool)`,
  canonicalAnswer: `struct Sensor {
  int id;
  string label;
  double threshold;
  bool active;
};`,
  rubric: [
    'struct Sensor',
    'int id',
    'string label',
    'double threshold',
    'bool active',
    '};',
  ],
  explanation:
    'Order matters under exam grading. Common slip: forget the trailing semicolon.',
} as AdversarialMockCardData;

const q3Card: AdversarialMockCardData = {
  ...baseFields,
  id: 'adv-q3-read-shuffled',
  atomId: 'F-22',
  qTags: ['Q3'],
  questionNumber: 'Q3',
  stem: 'ADVERSARIAL Q3 — read_sensors with non-alphabetic field order.',
  fullPrompt: `Given struct Sensor (fields: id int, label string, threshold double, active bool),
write the read_sensors function. Read fields in DECLARATION order.`,
  canonicalAnswer: `void read_sensors(Sensor &list[], int n) {
  for (int i = 0; i < n; i++) {
    cin >> list[i].id;
    cin >> list[i].label;
    cin >> list[i].threshold;
    cin >> list[i].active;
  }
}`,
  rubric: [
    'void read_sensors',
    '&list[]',
    'int n',
    'for (int i = 0; i < n; i++)',
    'cin >> list[i].id',
    'cin >> list[i].label',
    'cin >> list[i].threshold',
    'cin >> list[i].active',
  ],
  explanation:
    'Q3 hot tokens: void return type, & on the array, [] indicates array, int n. Missing & wipes 25%.',
} as AdversarialMockCardData;

interface FrameProps {
  title: string;
  card: AdversarialMockCardData;
}
function StoryFrame({ title, card }: FrameProps) {
  const [doneAt, setDoneAt] = useState<string | null>(null);
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ marginTop: 0, color: '#e6edf3' }}>{title}</h2>
      {doneAt && (
        <p style={{ color: '#7ee787', fontSize: 13 }}>
          Marked complete at {doneAt}
        </p>
      )}
      <AdversarialMockCard
        card={card}
        onComplete={(c) => {
          if (c) setDoneAt(new Date().toLocaleTimeString());
        }}
      />
    </div>
  );
}

export function Q1Hardest() {
  return (
    <StoryFrame
      title="1. Q1 — sum_positive on negatives + zeros"
      card={q1Card}
    />
  );
}
export function Q2FourField() {
  return (
    <StoryFrame title="2. Q2 — 4-field Sensor struct" card={q2Card} />
  );
}
export function Q3MissingAmpersand() {
  return (
    <StoryFrame
      title="3. Q3 — read_sensors (the & trap)"
      card={q3Card}
    />
  );
}
