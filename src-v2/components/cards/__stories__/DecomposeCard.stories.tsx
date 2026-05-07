/**
 * DecomposeCard.stories.tsx — A/B/C/D pick-the-explanation scenarios.
 */

import { useState } from 'react';
import { DecomposeCard } from '../DecomposeCard';
import type { DecomposeCard as DecomposeCardData } from '../../../types/card-schema';

function Frame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        padding: 24,
        background: 'var(--bg-0, #0d1117)',
        minHeight: '100vh',
        color: 'var(--text-0, #e6edf3)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1 style={{ margin: 0, fontSize: 16, color: 'var(--text-2, #6e7681)' }}>{title}</h1>
      {children}
    </section>
  );
}

function makeCard(input: {
  id: string;
  stem: string;
  code: string;
  question: string;
  options: { label: string; text: string }[];
  correctLabel: string;
  explanation: string;
}): DecomposeCardData {
  return {
    id: input.id,
    schemaVersion: 'v2',
    atomId: 'F-22b',
    qTags: ['Q3'],
    stage: 0,
    level: 'L0',
    type: 'DecomposeCard',
    stem: input.stem,
    source: { kind: 'practice', ref: 'decompose story' },
    commonMistakeIds: [],
    status: 'NEW',
    createdBy: 'STORY-DecomposeCard',
    reviewedBy: [],
    code: input.code,
    question: input.question,
    options: input.options as [
      { label: string; text: string },
      { label: string; text: string },
      { label: string; text: string },
      { label: string; text: string },
    ],
    correctLabel: input.correctLabel,
    explanation: input.explanation,
  };
}

export function PassByRefSingle() {
  const [done, setDone] = useState<boolean | null>(null);
  return (
    <Frame title="DecomposeCard · 1. pass-by-ref purpose (single)">
      <DecomposeCard
        card={makeCard({
          id: 'dec.story.ref',
          stem: 'why does `int &x` allow mutation?',
          code: 'void bump(int &x)\n{\n    x = x + 1;\n}',
          question: 'pick the BEST explanation of why `&x` makes the increment visible:',
          options: [
            { label: 'A', text: 'because `&` is an address-taking operator at the call site.' },
            { label: 'B', text: 'because `int &x` makes x an alias to the caller’s variable.' },
            { label: 'C', text: 'because C++ always passes ints by reference.' },
            { label: 'D', text: 'because `int &x` makes a pointer named x.' },
          ],
          correctLabel: 'B',
          explanation: 'int &x is a reference (alias). Without it, x is a copy.',
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export function ForLoopMechanicsSingle() {
  const [done, setDone] = useState<boolean | null>(null);
  return (
    <Frame title="DecomposeCard · 2. for-loop bound check">
      <DecomposeCard
        card={makeCard({
          id: 'dec.story.for',
          stem: 'identify the for-loop’s exit condition',
          code: 'for (int i = 0; i < n; i++)\n{\n    sum += i;\n}',
          question: 'pick the explanation that matches `i < n`:',
          options: [
            { label: 'A', text: 'the loop runs while i is strictly less than n.' },
            { label: 'B', text: 'the loop runs while i is less than or equal to n.' },
            { label: 'C', text: 'the loop runs once and then stops.' },
            { label: 'D', text: 'the loop assigns i to n.' },
          ],
          correctLabel: 'A',
          explanation: 'i < n stops at i = n, giving exactly n iterations.',
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export function StructErrorMulti() {
  const [done, setDone] = useState<boolean | null>(null);
  return (
    <Frame title="DecomposeCard · 3. multi-select: which lines are wrong?">
      <DecomposeCard
        card={makeCard({
          id: 'dec.story.struct.multi',
          stem: 'find every error in this struct',
          code: 'struct Book\n{\n    string title    // (A)\n    int pages,      // (B)\n    double price;   // (C)\n}               // (D)',
          question: 'pick EVERY line that is broken:',
          options: [
            { label: 'A', text: 'line A — missing semicolon.' },
            { label: 'B', text: 'line B — uses `,` instead of `;`.' },
            { label: 'C', text: 'line C — well-formed.' },
            { label: 'D', text: 'line D — missing `;` after the closing brace.' },
          ],
          correctLabel: 'A,B,D',
          explanation:
            'every field needs `;`, and a struct definition ends with `};`.',
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export function DotAccessSingle() {
  const [done, setDone] = useState<boolean | null>(null);
  return (
    <Frame title="DecomposeCard · 4. dot access semantics">
      <DecomposeCard
        card={makeCard({
          id: 'dec.story.dot',
          stem: 'what does `list[i].brand` mean?',
          code: 'cout << list[i].brand << endl;',
          question: 'pick the description that matches:',
          options: [
            { label: 'A', text: 'access the i-th element’s `brand` field.' },
            { label: 'B', text: 'access list, then i, then brand — three lookups.' },
            { label: 'C', text: 'declare a new field named brand on list[i].' },
            { label: 'D', text: 'concatenate list[i] and brand into a string.' },
          ],
          correctLabel: 'A',
          explanation: 'subscript first → struct → dot field is a single value.',
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export default PassByRefSingle;
