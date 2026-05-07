/**
 * TestDaySimCard.stories.tsx — three stories.
 * 1. EasyMock — simple Q1-Q4 (untimed).
 * 2. AltMock — same shape, smaller content (untimed).
 * 3. FullExam — full V2.0 form mock (untimed).
 */

import { useState } from 'react';
import { TestDaySimCard } from '../TestDaySimCard';
import type { TestDaySimCard as TestDaySimCardData } from '../../../types/card-schema';

const baseFields = {
  schemaVersion: 'v2' as const,
  level: 'L5' as const,
  type: 'TestDaySimCard' as const,
  stage: 6 as const,
  qTags: ['Q1', 'Q2', 'Q3', 'Q4'] as ('Q1' | 'Q2' | 'Q3' | 'Q4')[],
  source: { kind: 'v2' as const, ref: 'TestDaySimCard.stories fixture' },
  commonMistakeIds: [] as string[],
  status: 'NEW' as const,
  createdBy: 'CARD-TestDaySimCard',
  reviewedBy: [] as string[],
};

const easyMock: TestDaySimCardData = {
  ...baseFields,
  id: 'tds-easy',
  atomId: 'F-22',
  stem: 'Mock 1 — easy SIT102 Test 2.',
  questionSet: [
    {
      questionNumber: 'Q1',
      prompt:
        'Trace sum_positive on arr = {3, -1, 5} (n=3). What is total at the end?',
      canonicalAnswer: 'total = 8',
      rubric: ['total = 8'],
    },
    {
      questionNumber: 'Q2',
      prompt: 'Define struct Point with two double fields x and y.',
      canonicalAnswer: `struct Point {
  double x;
  double y;
};`,
      rubric: ['struct Point', 'double x', 'double y', '};'],
    },
    {
      questionNumber: 'Q3',
      prompt: 'Write read_points(Point &list[], int n).',
      canonicalAnswer: `void read_points(Point &list[], int n) {
  for (int i = 0; i < n; i++) {
    cin >> list[i].x;
    cin >> list[i].y;
  }
}`,
      rubric: ['void read_points', '&list[]', 'int n', 'cin >> list[i].x', 'cin >> list[i].y'],
    },
    {
      questionNumber: 'Q4',
      prompt: 'Write a complete `int main()` that reads n, then n Point values, then prints them.',
      canonicalAnswer: `int main() {
  int n;
  cin >> n;
  Point arr[n];
  read_points(arr, n);
  for (int i = 0; i < n; i++) {
    cout << arr[i].x << " " << arr[i].y << endl;
  }
  return 0;
}`,
      rubric: ['int main()', 'cin >> n', 'read_points(arr, n)', 'cout', 'return 0;'],
    },
  ],
  explanation:
    'Standard mock — short data, single struct field, vanilla loops.',
} as TestDaySimCardData;

const altMock: TestDaySimCardData = {
  ...baseFields,
  id: 'tds-alt',
  atomId: 'F-13',
  stem: 'Mock 2 — same shape (untimed).',
  questionSet: easyMock.questionSet,
  explanation:
    'Same content as easy — second pass-through for production fluency.',
} as TestDaySimCardData;

const fullExam: TestDaySimCardData = {
  ...baseFields,
  id: 'tds-full',
  atomId: 'F-22',
  stem: 'Mock 3 — full V2.0-form exam-day simulation (untimed).',
  questionSet: [
    {
      questionNumber: 'Q1',
      prompt:
        'Trace `count_evens(arr, n)` with arr = {2, 7, 4, 9, 6, 8, 1} and n = 7. What does it return?',
      canonicalAnswer: 'count = 4',
      rubric: ['count = 4'],
    },
    {
      questionNumber: 'Q2',
      prompt:
        'Define struct Computer with fields name (string), ram (int), cpu (string), price (double).',
      canonicalAnswer: `struct Computer {
  string name;
  int ram;
  string cpu;
  double price;
};`,
      rubric: ['struct Computer', 'string name', 'int ram', 'string cpu', 'double price', '};'],
    },
    {
      questionNumber: 'Q3',
      prompt: 'Write read_computers(Computer &list[], int n).',
      canonicalAnswer: `void read_computers(Computer &list[], int n) {
  for (int i = 0; i < n; i++) {
    cin >> list[i].name;
    cin >> list[i].ram;
    cin >> list[i].cpu;
    cin >> list[i].price;
  }
}`,
      rubric: [
        'void read_computers',
        '&list[]',
        'int n',
        'cin >> list[i].name',
        'cin >> list[i].ram',
        'cin >> list[i].cpu',
        'cin >> list[i].price',
      ],
    },
    {
      questionNumber: 'Q4',
      prompt:
        'Write `int main()` that reads n, then n Computers, then prints each one as `name ram cpu price`.',
      canonicalAnswer: `int main() {
  int n;
  cin >> n;
  Computer arr[n];
  read_computers(arr, n);
  for (int i = 0; i < n; i++) {
    cout << arr[i].name << " "
         << arr[i].ram << " "
         << arr[i].cpu << " "
         << arr[i].price << endl;
  }
  return 0;
}`,
      rubric: ['int main()', 'cin >> n', 'read_computers(arr, n)', 'cout', 'return 0;'],
    },
  ],
  explanation:
    'V2.0 form: 4-field struct + standard read_x + main with print loop. ~25% per question.',
} as TestDaySimCardData;

interface FrameProps {
  title: string;
  card: TestDaySimCardData;
}
function StoryFrame({ title, card }: FrameProps) {
  const [doneAt, setDoneAt] = useState<string | null>(null);
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ marginTop: 0, color: '#e6edf3' }}>{title}</h2>
      {doneAt && (
        <p style={{ color: '#7ee787', fontSize: 13 }}>
          All 4 passed at {doneAt}
        </p>
      )}
      <TestDaySimCard
        card={card}
        onComplete={(c) => {
          if (c) setDoneAt(new Date().toLocaleTimeString());
        }}
      />
    </div>
  );
}

export function EasyMock() {
  return <StoryFrame title="1. Easy mock (untimed)" card={easyMock} />;
}
export function AltMock() {
  return (
    <StoryFrame title="2. Alt mock — second pass-through (untimed)" card={altMock} />
  );
}
export function FullExam() {
  return <StoryFrame title="3. Full exam — V2.0 form (untimed)" card={fullExam} />;
}
