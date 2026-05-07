/**
 * FaultInjectionCard.stories.tsx — three stories.
 * 1. MissingAmpersand — Q3 read_x missing &.
 * 2. OffByOneLoop — for-loop runs n+1 times.
 * 3. WrongOperator — assignment in conditional.
 */

import { useState } from 'react';
import { FaultInjectionCard } from '../FaultInjectionCard';
import type { FaultInjectionCard as FaultInjectionCardData } from '../../../types/card-schema';

const baseFields = {
  schemaVersion: 'v2' as const,
  level: 'L3' as const,
  type: 'FaultInjectionCard' as const,
  stage: 4 as const,
  source: { kind: 'v2' as const, ref: 'FaultInjectionCard.stories fixture' },
  commonMistakeIds: [] as string[],
  status: 'NEW' as const,
  createdBy: 'CARD-FaultInjectionCard',
  reviewedBy: [] as string[],
};

const ampCard: FaultInjectionCardData = {
  ...baseFields,
  id: 'flt-missing-ampersand',
  atomId: 'F-22',
  qTags: ['Q3'],
  stem: 'This Q3 read function compiles but does not write back. Find the bug.',
  brokenCode: `void read_books(Book list[], int n)
{
    for (int i = 0; i < n; i++)
    {
        cin >> list[i].title;
        cin >> list[i].author;
        cin >> list[i].pages;
    }
}`,
  bugLocations: [1],
  fixedCode: `void read_books(Book &list[], int n)`,
  bugCategory: 'missing &',
  keyChecks: ['void read_books', '&list[]', 'int n'],
  explanation:
    'Pass-by-reference is required so mutations to list[i] persist. Without &, the array parameter copies and the caller sees no changes (technically arrays decay to pointers in C++; the SIT102 spec is strict about the & form).',
} as FaultInjectionCardData;

const loopCard: FaultInjectionCardData = {
  ...baseFields,
  id: 'flt-off-by-one',
  atomId: 'F-13',
  qTags: ['Q1'],
  stem: 'This loop runs one too many times. Find the bug + write the fix.',
  brokenCode: `int sum = 0;
for (int i = 0; i <= n; i++)
{
    sum = sum + arr[i];
}
return sum;`,
  bugLocations: [2],
  fixedCode: `for (int i = 0; i < n; i++)`,
  bugCategory: 'off-by-one',
  keyChecks: ['for (int i = 0; i < n; i++)'],
  explanation:
    '`i <= n` reads arr[n], which is out of bounds for a length-n array. The canonical pattern is `i < n`.',
} as FaultInjectionCardData;

const opCard: FaultInjectionCardData = {
  ...baseFields,
  id: 'flt-wrong-operator',
  atomId: 'F-12',
  qTags: ['Q1'],
  stem: 'This conditional always passes. Find the bug + write the fix.',
  brokenCode: `int x = 5;
if (x = 10)
{
    cout << "ten" << endl;
}
else
{
    cout << "other" << endl;
}`,
  bugLocations: [2],
  fixedCode: `if (x == 10)`,
  bugCategory: 'wrong operator',
  keyChecks: ['if (x == 10)'],
  explanation:
    'Single-= is assignment; it returns the assigned value (10), which is truthy, so the branch always runs and x is silently mutated. Use == for equality.',
} as FaultInjectionCardData;

interface FrameProps {
  title: string;
  card: FaultInjectionCardData;
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
      <FaultInjectionCard
        card={card}
        onComplete={(c) => {
          if (c) setDoneAt(new Date().toLocaleTimeString());
        }}
      />
    </div>
  );
}

export function MissingAmpersand() {
  return <StoryFrame title="1. Missing &" card={ampCard} />;
}
export function OffByOneLoop() {
  return <StoryFrame title="2. Off-by-one loop" card={loopCard} />;
}
export function WrongOperator() {
  return <StoryFrame title="3. = vs == in conditional" card={opCard} />;
}
