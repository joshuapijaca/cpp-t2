/**
 * ClozeCard.stories.tsx — fill-in-the-blank scenarios.
 *
 * 1. SingleBlankReturn   — `return ___;` canonical micro-cloze
 * 2. MultiBlankCinFlow   — `cin >> ___; cin >> ___;` 2-blank prompt-pair
 * 3. StructFieldDot      — `cout << list[i].___ << endl;`
 * 4. ForLoopHeader       — `for (int i = 0; i < ___; i++)`
 * 5. PassByRefAmpersand  — `void f(int ___ x) { x = 5; }`
 */

import { useState } from 'react';
import { ClozeCard } from '../ClozeCard';
import type { ClozeCard as ClozeCardData } from '../../../types/card-schema';

function Frame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
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
  clozeSentence: string;
  answer: string;
  explanation: string;
}): ClozeCardData {
  return {
    id: input.id,
    schemaVersion: 'v2',
    atomId: 'F-07',
    qTags: ['Q1'],
    stage: 0,
    level: 'L0',
    type: 'ClozeCard',
    stem: input.stem,
    source: { kind: 'practice', ref: 'cloze story' },
    commonMistakeIds: [],
    status: 'NEW',
    createdBy: 'STORY-ClozeCard',
    reviewedBy: [],
    code: input.code,
    clozeSentence: input.clozeSentence,
    answer: input.answer,
    explanation: input.explanation,
  };
}

export function SingleBlankReturn() {
  const [done, setDone] = useState(false);
  return (
    <Frame title="ClozeCard · 1. single-blank return">
      <ClozeCard
        card={makeCard({
          id: 'cloze.story.return',
          stem: 'fill the missing return value',
          code: 'int main() {\n    cout << "hi" << endl;\n    return ___;\n}',
          clozeSentence: 'every C++ main() ends with `return 0;` to signal success.',
          answer: '0',
          explanation: 'main returns int; 0 means success.',
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export function MultiBlankCinFlow() {
  const [done, setDone] = useState(false);
  return (
    <Frame title="ClozeCard · 2. multi-blank cin">
      <ClozeCard
        card={makeCard({
          id: 'cloze.story.cin',
          stem: 'fill the cin variable names',
          code: 'int x, y;\ncin >> ___;\ncin >> ___;\ncout << x + y;',
          clozeSentence: 'cin reads tokens into named variables.',
          answer: 'x',
          explanation: 'first read goes into x, second into y.',
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export function StructFieldDot() {
  const [done, setDone] = useState(false);
  return (
    <Frame title="ClozeCard · 3. struct field dot access">
      <ClozeCard
        card={makeCard({
          id: 'cloze.story.dot',
          stem: 'access the price field of list[i]',
          code: 'cout << list[i].___ << endl;',
          clozeSentence: 'use a dot to access a struct field on an array element.',
          answer: 'price',
          explanation: 'list[i] is a Computer; .price reads the price field.',
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export function ForLoopHeader() {
  const [done, setDone] = useState(false);
  return (
    <Frame title="ClozeCard · 4. for-loop bound">
      <ClozeCard
        card={makeCard({
          id: 'cloze.story.for',
          stem: 'fill the loop bound',
          code: 'for (int i = 0; i < ___; i++)\n{\n    cout << i;\n}',
          clozeSentence: 'a counted for-loop runs from 0 to N-1.',
          answer: 'n',
          explanation: 'use n (or SIZE) as the upper bound.',
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export function PassByRefAmpersand() {
  const [done, setDone] = useState(false);
  return (
    <Frame title="ClozeCard · 5. pass-by-ref ampersand">
      <ClozeCard
        card={makeCard({
          id: 'cloze.story.ref',
          stem: 'declare x as pass-by-reference',
          code: 'void bump(int ___ x)\n{\n    x = x + 1;\n}',
          clozeSentence: 'pass-by-reference uses & in the parameter declaration.',
          answer: '&',
          explanation: 'without &, the function works on a copy.',
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export default SingleBlankReturn;
