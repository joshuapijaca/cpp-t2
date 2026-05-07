/**
 * PostmortemCard.stories.tsx — three stories.
 * 1. Q1Postmortem — sum_positive failed; root cause + repair + prevention.
 * 2. Q2Postmortem — struct missing semicolon.
 * 3. Q3Postmortem — read_x missing &.
 */

import { useState } from 'react';
import { PostmortemCard } from '../PostmortemCard';
import type { PostmortemCard as PostmortemCardData } from '../../../types/card-schema';

const baseFields = {
  schemaVersion: 'v2' as const,
  level: 'L4' as const,
  type: 'PostmortemCard' as const,
  stage: 6 as const,
  source: { kind: 'v2' as const, ref: 'PostmortemCard.stories fixture' },
  commonMistakeIds: [] as string[],
  status: 'NEW' as const,
  createdBy: 'CARD-PostmortemCard',
  reviewedBy: [] as string[],
};

const q1Card: PostmortemCardData = {
  ...baseFields,
  id: 'pm-q1-sum-positive',
  atomId: 'F-13',
  qTags: ['Q1'],
  stem: 'Postmortem of a failed Q1 sum_positive trace.',
  failedAttempt: `int total = 0;
for (int i = 0; i <= n; i++) {
  total = total + arr[i];
}
return total;`,
  diagnosis:
    'Two compounding errors: the loop runs out-of-bounds (i <= n), AND the conditional `if (arr[i] > 0)` was dropped entirely so negatives also accumulate.',
  repairSteps: [
    'Change `i <= n` to `i < n`.',
    'Wrap the accumulator in `if (arr[i] > 0) { ... }`.',
    'Re-trace mentally with arr = {3, -1, 5, -2, 4} to verify total = 12.',
  ],
  preventionTip:
    'When the prompt says "positive only", the conditional check is non-negotiable. Always re-state the prompt in your head before writing the loop.',
  explanation:
    'Q1 V2.0 form has THREE invariants: (1) bounds, (2) conditional, (3) accumulator op. Drop one, lose 25%.',
} as PostmortemCardData;

const q2Card: PostmortemCardData = {
  ...baseFields,
  id: 'pm-q2-struct-semicolon',
  atomId: 'F-18',
  qTags: ['Q2'],
  stem: 'Postmortem of a Q2 struct write that missed the trailing semicolon.',
  failedAttempt: `struct Sensor {
  int id;
  string label;
  double threshold;
  bool active;
}`,
  diagnosis:
    'The struct definition is missing the trailing semicolon after the closing brace. C++ requires `};` to terminate a struct declaration.',
  repairSteps: [
    'Add a semicolon after the closing `}`.',
    'Verify by reading the line aloud: "closing brace SEMICOLON".',
    'Compile-check: a compiler would error on the next line if `;` is missing.',
  ],
  preventionTip:
    'Memorize the muscle pattern: type Name OPEN-BRACE fields CLOSE-BRACE-SEMICOLON. The `};` is one indivisible unit.',
  explanation:
    'Even one missing terminator cascades into 5+ phantom errors when compiled — looks scary but the fix is a single character.',
} as PostmortemCardData;

const q3Card: PostmortemCardData = {
  ...baseFields,
  id: 'pm-q3-missing-ampersand',
  atomId: 'F-22',
  qTags: ['Q3'],
  stem:
    'Postmortem of a Q3 read_books that compiled but produced no I/O effect.',
  failedAttempt: `void read_books(Book list[], int n) {
  for (int i = 0; i < n; i++) {
    cin >> list[i].title;
    cin >> list[i].pages;
  }
}`,
  diagnosis:
    'Missing `&` on `Book list[]`. The function appears to read but the writes do not propagate back to the caller (under SIT102 spec semantics).',
  repairSteps: [
    'Add `&` between `Book` and `list[]`.',
    'Verify the four hot tokens: void, &, [], int n.',
    'Re-test mentally: caller reads `list[0].title` after the call — does it see the typed value?',
  ],
  preventionTip:
    'Print the four-token mnemonic at the top of your scratch: `void NAME(STRUCT &list[], int n)`. Treat it as a pre-flight checklist.',
  explanation:
    'Q3 carries 25%. A single missing & wipes the entire question. Never write `void read_X(` without the `&`.',
} as PostmortemCardData;

interface FrameProps {
  title: string;
  card: PostmortemCardData;
}
function StoryFrame({ title, card }: FrameProps) {
  const [drilled, setDrilled] = useState<string | null>(null);
  const [doneAt, setDoneAt] = useState<string | null>(null);
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ marginTop: 0, color: '#e6edf3' }}>{title}</h2>
      {drilled && (
        <p style={{ color: '#79c0ff', fontSize: 13 }}>
          Host enqueued drill for atom {drilled}
        </p>
      )}
      {doneAt && (
        <p style={{ color: '#7ee787', fontSize: 13 }}>
          Acknowledged at {doneAt}
        </p>
      )}
      <PostmortemCard
        card={card}
        onComplete={(c) => {
          if (c) setDoneAt(new Date().toLocaleTimeString());
        }}
        onDrillAtoms={(a) => setDrilled(a)}
      />
    </div>
  );
}

export function Q1Postmortem() {
  return <StoryFrame title="1. Q1 sum_positive" card={q1Card} />;
}
export function Q2Postmortem() {
  return (
    <StoryFrame title="2. Q2 missing trailing semicolon" card={q2Card} />
  );
}
export function Q3Postmortem() {
  return (
    <StoryFrame title="3. Q3 read_books missing &" card={q3Card} />
  );
}
