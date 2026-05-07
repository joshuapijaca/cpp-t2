/**
 * DAGRetryCard.stories.tsx — three stories.
 * 1. SemicolonPrereq — F-22 failed -> walk back to F-07.
 * 2. ForLoopPrereq — Q1 trace failed -> walk back to F-13.
 * 3. StructPrereq — Q2 write failed -> walk back to F-18.
 */

import { useState } from 'react';
import { DAGRetryCard } from '../DAGRetryCard';
import type { DAGRetryCard as DAGRetryCardData } from '../../../types/card-schema';

const baseFields = {
  schemaVersion: 'v2' as const,
  level: 'L0' as const,
  type: 'DAGRetryCard' as const,
  stage: 0 as const,
  source: { kind: 'v2' as const, ref: 'DAGRetryCard.stories fixture' },
  commonMistakeIds: [] as string[],
  status: 'NEW' as const,
  createdBy: 'CARD-DAGRetryCard',
  reviewedBy: [] as string[],
};

const semicolonCard: DAGRetryCardData = {
  ...baseFields,
  id: 'dag-semicolon-prereq',
  atomId: 'F-07',
  qTags: ['Q3'],
  stem:
    'Your Q3 read_books attempt failed. Before retrying, master the prerequisite: every C++ statement ends with `;`.',
  prerequisiteAtomIds: ['F-04', 'F-05'],
  failedCardId: 'L4-F22-write-01',
  prompt:
    'Write the line that declares an int x with value 5 (one statement).',
  canonicalAnswer: `int x = 5;`,
  keyChecks: ['int x = 5;'],
  explanation:
    'A statement is a single C++ instruction terminated by `;`. Forgetting the semicolon causes the compiler to glue lines together unexpectedly.',
} as DAGRetryCardData;

const forLoopCard: DAGRetryCardData = {
  ...baseFields,
  id: 'dag-for-loop-prereq',
  atomId: 'F-13',
  qTags: ['Q1'],
  stem:
    'Q1 trace failed at the iteration step. Walk back to the for-loop fundamentals.',
  prerequisiteAtomIds: ['F-12'],
  failedCardId: 'L4-Q1-trace-sum-positive',
  prompt:
    'Complete: `for (int i = 0; ___; ___) { /* body */ }` so the loop runs while i < n and increments by 1.',
  canonicalAnswer: `for (int i = 0; i < n; i++) { /* body */ }`,
  keyChecks: ['i < n', 'i++'],
  explanation:
    'Three slots: init, condition, update. The condition is checked BEFORE every iteration; the update runs AFTER the body.',
} as DAGRetryCardData;

const structCard: DAGRetryCardData = {
  ...baseFields,
  id: 'dag-struct-prereq',
  atomId: 'F-18',
  qTags: ['Q2'],
  stem:
    'Q2 write of a 4-field struct failed. Walk back to the basic struct skeleton.',
  prerequisiteAtomIds: ['F-04', 'F-07', 'F-08'],
  failedCardId: 'L4-Q2-write-sensor',
  prompt: 'Write a Point struct with two double fields x and y.',
  canonicalAnswer: `struct Point {
  double x;
  double y;
};`,
  keyChecks: ['struct Point', 'double x', 'double y', '};'],
  explanation:
    'Skeleton: `struct Name { type field; ... };`. The trailing semicolon after `}` is mandatory.',
} as DAGRetryCardData;

interface FrameProps {
  title: string;
  card: DAGRetryCardData;
}
function StoryFrame({ title, card }: FrameProps) {
  const [doneAt, setDoneAt] = useState<string | null>(null);
  const [retried, setRetried] = useState<string | null>(null);
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ marginTop: 0, color: '#e6edf3' }}>{title}</h2>
      {doneAt && (
        <p style={{ color: '#7ee787', fontSize: 13 }}>
          Prereq mastered at {doneAt}
        </p>
      )}
      {retried && (
        <p style={{ color: '#79c0ff', fontSize: 13 }}>
          Host re-surfaced parent: {retried}
        </p>
      )}
      <DAGRetryCard
        card={card}
        onComplete={(c) => {
          if (c) setDoneAt(new Date().toLocaleTimeString());
        }}
        onRetryParent={(parent) => setRetried(parent)}
      />
    </div>
  );
}

export function SemicolonPrereq() {
  return (
    <StoryFrame
      title="1. Walk back to F-07 semicolon"
      card={semicolonCard}
    />
  );
}
export function ForLoopPrereq() {
  return (
    <StoryFrame
      title="2. Walk back to F-13 for-loop"
      card={forLoopCard}
    />
  );
}
export function StructPrereq() {
  return (
    <StoryFrame title="3. Walk back to F-18 struct" card={structCard} />
  );
}
