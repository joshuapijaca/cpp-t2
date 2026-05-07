/**
 * AlgorithmMatrixCard.stories.tsx — three stories.
 * 1. EasySumPositive — student sees count-positive + sum-array, writes sum-positive.
 * 2. MediumIndexOfMax (A12) — see find-min + average, write index-of-max.
 * 3. HardCountVowels — see is-positive + count-evens, transfer to count-vowels in C-string.
 */

import { useState } from 'react';
import { AlgorithmMatrixCard } from '../AlgorithmMatrixCard';
import type { AlgorithmMatrixCard as AlgorithmMatrixCardData } from '../../../types/card-schema';

const baseFields = {
  schemaVersion: 'v2' as const,
  level: 'L1' as const,
  type: 'AlgorithmMatrixCard' as const,
  stage: 1 as const,
  qTags: ['Q1'] as ('Q1' | 'Q2' | 'Q3' | 'Q4')[],
  source: { kind: 'v2' as const, ref: 'AlgorithmMatrixCard.stories fixture' },
  commonMistakeIds: [] as string[],
  status: 'NEW' as const,
  createdBy: 'CARD-AlgorithmMatrixCard',
  reviewedBy: [] as string[],
};

const easyCard: AlgorithmMatrixCardData = {
  ...baseFields,
  id: 'amx-easy-sum-positive',
  atomId: 'A1',
  stem:
    'Two worked traces show the loop+conditional accumulator pattern. Produce the third — sum_positive.',
  examples: [
    {
      label: 'A · count_positive',
      text: `int count_positive(int arr[], int n) {
  int count = 0;
  for (int i = 0; i < n; i++) {
    if (arr[i] > 0) {
      count = count + 1;
    }
  }
  return count;
}`,
    },
    {
      label: 'B · sum_array',
      text: `int sum_array(int arr[], int n) {
  int total = 0;
  for (int i = 0; i < n; i++) {
    total = total + arr[i];
  }
  return total;
}`,
    },
  ],
  prompt:
    'Write sum_positive(arr, n) — total of all elements that are > 0.',
  canonicalAnswer: `int sum_positive(int arr[], int n) {
  int total = 0;
  for (int i = 0; i < n; i++) {
    if (arr[i] > 0) {
      total = total + arr[i];
    }
  }
  return total;
}`,
  keyChecks: ['for (int i = 0; i < n; i++)', 'if (arr[i] > 0)', 'total = total + arr[i]', 'return total'],
  explanation:
    'Take A’s loop+if shape, swap A’s `count = count + 1` for B’s `total = total + arr[i]`. The result is the conditional accumulator, your Q1 V2.0 backbone.',
} as AlgorithmMatrixCardData;

const mediumCard: AlgorithmMatrixCardData = {
  ...baseFields,
  id: 'amx-medium-a12-index-of-max',
  atomId: 'A12',
  stem:
    'A12 transfer: from find-min and average to index-of-max.',
  examples: [
    {
      label: 'A · find_min',
      text: `int find_min(int arr[], int n) {
  int m = arr[0];
  for (int i = 1; i < n; i++) {
    if (arr[i] < m) {
      m = arr[i];
    }
  }
  return m;
}`,
    },
    {
      label: 'B · average',
      text: `double average(int arr[], int n) {
  int sum = 0;
  for (int i = 0; i < n; i++) {
    sum = sum + arr[i];
  }
  return (double)sum / n;
}`,
    },
  ],
  prompt:
    'Write index_of_max(arr, n) — return the position of the maximum element.',
  canonicalAnswer: `int index_of_max(int arr[], int n) {
  int idx = 0;
  for (int i = 1; i < n; i++) {
    if (arr[i] > arr[idx]) {
      idx = i;
    }
  }
  return idx;
}`,
  keyChecks: ['int idx = 0', 'for (int i = 1; i < n; i++)', 'if (arr[i] > arr[idx])', 'idx = i', 'return idx'],
  explanation:
    'Same loop shape as A but you track the INDEX of the running winner, not its value. Start the loop at 1 because the seed used arr[0].',
} as AlgorithmMatrixCardData;

const hardCard: AlgorithmMatrixCardData = {
  ...baseFields,
  id: 'amx-hard-count-vowels',
  atomId: 'A8',
  stem:
    'Across-domain transfer: from int-array predicates to char-array vowel test.',
  examples: [
    {
      label: 'A · count_evens',
      text: `int count_evens(int arr[], int n) {
  int count = 0;
  for (int i = 0; i < n; i++) {
    if (arr[i] % 2 == 0) {
      count = count + 1;
    }
  }
  return count;
}`,
    },
    {
      label: 'B · all_positive',
      text: `bool all_positive(int arr[], int n) {
  for (int i = 0; i < n; i++) {
    if (arr[i] <= 0) {
      return false;
    }
  }
  return true;
}`,
    },
  ],
  prompt:
    'Write count_vowels(s, n) where s is a char[] and n the length. Count a/e/i/o/u (lowercase only).',
  canonicalAnswer: `int count_vowels(char s[], int n) {
  int count = 0;
  for (int i = 0; i < n; i++) {
    if (s[i] == 'a' || s[i] == 'e' || s[i] == 'i' || s[i] == 'o' || s[i] == 'u') {
      count = count + 1;
    }
  }
  return count;
}`,
  keyChecks: ['for (int i = 0; i < n; i++)', "s[i] == 'a'", 'count = count + 1', 'return count'],
  explanation:
    'Take A’s exact accumulator shape; the only change is the predicate (modulo -> 5-way OR membership test). The data type changes from int to char but the loop+if frame is identical.',
} as AlgorithmMatrixCardData;

interface FrameProps {
  title: string;
  card: AlgorithmMatrixCardData;
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
      <AlgorithmMatrixCard
        card={card}
        onComplete={(c) => {
          if (c) setDoneAt(new Date().toLocaleTimeString());
        }}
      />
    </div>
  );
}

export function EasySumPositive() {
  return <StoryFrame title="1. Easy — sum_positive transfer" card={easyCard} />;
}
export function MediumIndexOfMax() {
  return <StoryFrame title="2. Medium — A12 index_of_max" card={mediumCard} />;
}
export function HardCountVowels() {
  return (
    <StoryFrame
      title="3. Hard — count_vowels (cross-domain transfer)"
      card={hardCard}
    />
  );
}
