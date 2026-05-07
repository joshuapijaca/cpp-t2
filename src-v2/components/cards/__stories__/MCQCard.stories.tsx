/**
 * MCQCard.stories.tsx — single-correct multi-choice scenarios.
 */

import { useState } from 'react';
import { MCQCard } from '../MCQCard';
import type { MCQCard as MCQCardData } from '../../../types/card-schema';

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
  correct: string;
  distractors: [string, string, string];
  explanation: string;
}): MCQCardData {
  return {
    id: input.id,
    schemaVersion: 'v2',
    atomId: 'F-17',
    qTags: ['Q1'],
    stage: 0,
    level: 'L0',
    type: 'MCQCard',
    stem: input.stem,
    source: { kind: 'practice', ref: 'mcq story' },
    commonMistakeIds: [],
    status: 'NEW',
    createdBy: 'STORY-MCQCard',
    reviewedBy: [],
    correct: input.correct,
    distractors: input.distractors,
    explanation: input.explanation,
  };
}

export function SemicolonRule() {
  const [done, setDone] = useState<boolean | null>(null);
  return (
    <Frame title="MCQCard · 1. statement terminator">
      <MCQCard
        card={makeCard({
          id: 'mcq.story.semi',
          stem: 'Which character ends a C++ statement?',
          correct: ';',
          distractors: [':', ',', '.'],
          explanation: 'every C++ statement must end with a semicolon.',
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export function CinDirection() {
  const [done, setDone] = useState<boolean | null>(null);
  return (
    <Frame title="MCQCard · 2. cin operator direction">
      <MCQCard
        card={makeCard({
          id: 'mcq.story.cin',
          stem: 'Which line reads an int from the user into x?',
          correct: 'cin >> x;',
          distractors: ['cin << x;', 'cout >> x;', 'cin > x;'],
          explanation: 'cin uses >> (extraction) toward the variable.',
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export function ForLoopBound() {
  const [done, setDone] = useState<boolean | null>(null);
  return (
    <Frame title="MCQCard · 3. for-loop terminator">
      <MCQCard
        card={makeCard({
          id: 'mcq.story.for',
          stem: 'Which for-loop header iterates 5 times (i = 0..4)?',
          correct: 'for (int i = 0; i < 5; i++)',
          distractors: [
            'for (int i = 0; i <= 5; i++)',
            'for (int i = 1; i < 5; i++)',
            'for (int i = 0; i < 5; i--)',
          ],
          explanation: 'i<5 stops after i=4, giving exactly 5 iterations.',
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export function PassByRef() {
  const [done, setDone] = useState<boolean | null>(null);
  return (
    <Frame title="MCQCard · 4. pass-by-ref signature">
      <MCQCard
        card={makeCard({
          id: 'mcq.story.ref',
          stem: 'Which signature lets the callee mutate the caller’s int?',
          correct: 'void bump(int &x)',
          distractors: [
            'void bump(int x)',
            'void bump(int *x)',
            'int bump(int x)',
          ],
          explanation: 'int &x is C++ pass-by-reference.',
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export function StructFieldOrder() {
  const [done, setDone] = useState<boolean | null>(null);
  return (
    <Frame title="MCQCard · 5. struct skeleton">
      <MCQCard
        card={makeCard({
          id: 'mcq.story.struct',
          stem: 'Which is a valid C++ struct definition?',
          correct: 'struct Book { string title; int pages; };',
          distractors: [
            'struct Book ( string title; int pages; );',
            'struct Book { string title, int pages };',
            'Struct Book { string title; int pages; }',
          ],
          explanation: 'curly braces, semicolons after fields, `};` at the end.',
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export default SemicolonRule;
