/**
 * DeltaCard.stories.tsx — three stories.
 * 1. AmpersandDelta — student forgot &; rewrite the corrected signature.
 * 2. OffByOneDelta — i<=n vs i<n; rewrite the loop.
 * 3. ConditionDelta — assignment vs equality; rewrite.
 */

import { useState } from 'react';
import { DeltaCard } from '../DeltaCard';
import type { DeltaCard as DeltaCardData } from '../../../types/card-schema';

const baseFields = {
  schemaVersion: 'v2' as const,
  level: 'L3' as const,
  type: 'DeltaCard' as const,
  stage: 4 as const,
  source: { kind: 'v2' as const, ref: 'DeltaCard.stories fixture' },
  commonMistakeIds: [] as string[],
  status: 'NEW' as const,
  createdBy: 'CARD-DeltaCard',
  reviewedBy: [] as string[],
};

const ampDelta: DeltaCardData = {
  ...baseFields,
  id: 'delta-ampersand-q3',
  atomId: 'F-22',
  qTags: ['Q3'],
  stem: 'Your Q3 attempt missed the &. Study the diff, then rewrite the canonical version from scratch.',
  codeA: `void read_books(Book list[], int n)
{
    for (int i = 0; i < n; i++)
    {
        cin >> list[i].title;
        cin >> list[i].pages;
    }
}`,
  codeB: `void read_books(Book &list[], int n)
{
    for (int i = 0; i < n; i++)
    {
        cin >> list[i].title;
        cin >> list[i].pages;
    }
}`,
  prompt:
    'Difference: `Book list[]` vs `Book &list[]`. Rewrite the canonical version from scratch.',
  canonicalAnswer: `void read_books(Book &list[], int n)
{
    for (int i = 0; i < n; i++)
    {
        cin >> list[i].title;
        cin >> list[i].pages;
    }
}`,
  keyChecks: ['void read_books', '&list[]', 'int n', 'cin >> list[i].title', 'cin >> list[i].pages'],
  explanation:
    'The & makes mutations to list[i] propagate back to the caller. Without it, your reads write into a temporary copy that disappears at function return.',
} as DeltaCardData;

const offByOneDelta: DeltaCardData = {
  ...baseFields,
  id: 'delta-off-by-one',
  atomId: 'F-13',
  qTags: ['Q1'],
  stem: 'Your loop ran one too many times. Study the diff, then rewrite.',
  codeA: `int sum = 0;
for (int i = 0; i <= n; i++)
{
    sum = sum + arr[i];
}
return sum;`,
  codeB: `int sum = 0;
for (int i = 0; i < n; i++)
{
    sum = sum + arr[i];
}
return sum;`,
  prompt: '`i <= n` vs `i < n`. Rewrite the canonical version.',
  canonicalAnswer: `int sum = 0;
for (int i = 0; i < n; i++)
{
    sum = sum + arr[i];
}
return sum;`,
  keyChecks: ['int sum = 0', 'for (int i = 0; i < n; i++)', 'sum = sum + arr[i]', 'return sum'],
  explanation:
    'For an array of length n, valid indices are 0..n-1. `i < n` runs exactly n times; `i <= n` overshoots and reads arr[n].',
} as DeltaCardData;

const condDelta: DeltaCardData = {
  ...baseFields,
  id: 'delta-condition',
  atomId: 'F-12',
  qTags: ['Q1'],
  stem:
    'Your conditional used assignment. Study the diff, then rewrite.',
  codeA: `if (x = 10)
{
    cout << "ten" << endl;
}`,
  codeB: `if (x == 10)
{
    cout << "ten" << endl;
}`,
  prompt: '= vs ==. Rewrite the canonical conditional.',
  canonicalAnswer: `if (x == 10)
{
    cout << "ten" << endl;
}`,
  keyChecks: ['if (x == 10)', 'cout << "ten" << endl'],
  explanation:
    '`=` assigns; `==` compares. The buggy form mutated x and always took the branch.',
} as DeltaCardData;

interface FrameProps {
  title: string;
  card: DeltaCardData;
}
function StoryFrame({ title, card }: FrameProps) {
  const [doneAt, setDoneAt] = useState<string | null>(null);
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ marginTop: 0, color: '#e6edf3' }}>{title}</h2>
      {doneAt && (
        <p style={{ color: '#7ee787', fontSize: 13 }}>
          Rewrote canonically at {doneAt}
        </p>
      )}
      <DeltaCard
        card={card}
        onComplete={(c) => {
          if (c) setDoneAt(new Date().toLocaleTimeString());
        }}
      />
    </div>
  );
}

export function AmpersandDelta() {
  return <StoryFrame title="1. & delta" card={ampDelta} />;
}
export function OffByOneDelta() {
  return <StoryFrame title="2. <= vs < delta" card={offByOneDelta} />;
}
export function ConditionDelta() {
  return <StoryFrame title="3. = vs == delta" card={condDelta} />;
}
