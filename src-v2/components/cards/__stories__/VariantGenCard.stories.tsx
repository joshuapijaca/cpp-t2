/**
 * VariantGenCard.stories.tsx — three stories.
 * 1. ThreeForLoop — 3 variants of an accumulator.
 * 2. FourMcq — 4 ways to express x == 0.
 * 3. CoutVariants — 3 variants of multi-line cout.
 */

import { useState } from 'react';
import { VariantGenCard } from '../VariantGenCard';
import type { VariantGenCard as VariantGenCardData } from '../../../types/card-schema';

const baseFields = {
  schemaVersion: 'v2' as const,
  level: 'L2' as const,
  type: 'VariantGenCard' as const,
  stage: 3 as const,
  qTags: ['Q1'] as ('Q1' | 'Q2' | 'Q3' | 'Q4')[],
  source: { kind: 'v2' as const, ref: 'VariantGenCard.stories fixture' },
  commonMistakeIds: [] as string[],
  status: 'NEW' as const,
  createdBy: 'CARD-VariantGenCard',
  reviewedBy: [] as string[],
};

const accCard: VariantGenCardData = {
  ...baseFields,
  id: 'vgc-acc-3',
  atomId: 'F-13',
  stem: 'Produce 3 working variants of the count-positive accumulator.',
  seedCode: `int count = 0;
for (int i = 0; i < n; i++) {
  if (arr[i] > 0) {
    count = count + 1;
  }
}
return count;`,
  variantCount: 3,
  constraints: [
    'Each variant must be a complete loop+conditional accumulator.',
    'Each variant must use a different operator/predicate or accumulator op.',
    'No two variants may be identical.',
  ],
  canonicalVariants: [
    `int count = 0;
for (int i = 0; i < n; i++) {
  if (arr[i] >= 0) {
    count = count + 1;
  }
}
return count;`,
    `int count = 0;
for (int i = 0; i < n; i++) {
  if (arr[i] != 0) {
    count = count + 1;
  }
}
return count;`,
    `int total = 0;
for (int i = 0; i < n; i++) {
  if (arr[i] > 0) {
    total = total + arr[i];
  }
}
return total;`,
  ],
  keyChecks: ['for (int i = 0; i < n; i++)', 'if (arr[i]'],
  explanation:
    'The accumulator pattern stays fixed; vary the predicate (>, >=, !=) and/or the op (count vs sum).',
} as VariantGenCardData;

const eqCard: VariantGenCardData = {
  ...baseFields,
  id: 'vgc-eq-4',
  atomId: 'F-12',
  stem: 'Produce 4 different but equivalent C++ predicates for "x is zero".',
  seedCode: `if (x == 0) { /* zero */ }`,
  variantCount: 4,
  constraints: [
    'Each variant must be a complete `if (...)` line with the same body.',
    'All 4 must be logically equivalent for integer x.',
    'No two variants may be identical.',
  ],
  canonicalVariants: [
    `if (!x) { /* zero */ }`,
    `if (x == 0) { /* zero */ }`,
    `if (0 == x) { /* zero */ }`,
    `if (x <= 0 && x >= 0) { /* zero */ }`,
  ],
  keyChecks: ['if (', '/* zero */'],
  explanation:
    'Equivalent predicates: !x (truthiness), x == 0 (canonical), 0 == x (Yoda style), x <= 0 && x >= 0 (range collapse).',
} as VariantGenCardData;

const coutCard: VariantGenCardData = {
  ...baseFields,
  id: 'vgc-cout-3',
  atomId: 'F-09',
  stem: 'Produce 3 ways to print the same two values on separate lines.',
  seedCode: `cout << "a: " << a << endl;
cout << "b: " << b << endl;`,
  variantCount: 3,
  constraints: [
    'Each variant prints the same two labelled lines.',
    'Each must use a different `cout` syntactic form.',
  ],
  canonicalVariants: [
    `cout << "a: " << a << "\\n";
cout << "b: " << b << "\\n";`,
    `cout << "a: " << a << endl << "b: " << b << endl;`,
    `cout << "a: " << a << "\\n" << "b: " << b << "\\n";`,
  ],
  keyChecks: ['cout', 'a:', 'b:'],
  explanation:
    'Forms: `endl`, `"\\n"`, chained `<<` on one line. All produce the same two lines.',
} as VariantGenCardData;

interface FrameProps {
  title: string;
  card: VariantGenCardData;
}
function StoryFrame({ title, card }: FrameProps) {
  const [doneAt, setDoneAt] = useState<string | null>(null);
  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ marginTop: 0, color: '#e6edf3' }}>{title}</h2>
      {doneAt && (
        <p style={{ color: '#7ee787', fontSize: 13 }}>
          All variants accepted at {doneAt}
        </p>
      )}
      <VariantGenCard
        card={card}
        onComplete={(c) => {
          if (c) setDoneAt(new Date().toLocaleTimeString());
        }}
      />
    </div>
  );
}

export function ThreeForLoop() {
  return (
    <StoryFrame title="1. 3 accumulator variants" card={accCard} />
  );
}
export function FourMcq() {
  return (
    <StoryFrame title="2. 4 ways to write x == 0" card={eqCard} />
  );
}
export function CoutVariants() {
  return (
    <StoryFrame title="3. 3 ways to print labelled values" card={coutCard} />
  );
}
