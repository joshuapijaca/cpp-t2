/**
 * ProceduralCard.stories.tsx — write-from-prompt 3-streak scenarios.
 */

import { useState } from 'react';
import { ProceduralCard } from '../ProceduralCard';
import type { ProceduralCard as ProceduralCardData } from '../../../types/card-schema';

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
  section: string;
  stem: string;
  prompt: string;
  expectedAnswer: string;
  keyChecks: string[];
  variants?: { prompt: string; expectedAnswer: string }[];
}): ProceduralCardData {
  return {
    id: input.id,
    schemaVersion: 'v2',
    atomId: 'F-15',
    qTags: ['Q3'],
    stage: 0,
    level: 'L0',
    type: 'ProceduralCard',
    stem: input.stem,
    source: { kind: 'practice', ref: 'procedural story' },
    commonMistakeIds: [],
    status: 'NEW',
    createdBy: 'STORY-ProceduralCard',
    reviewedBy: [],
    section: input.section,
    prompt: input.prompt,
    expectedAnswer: input.expectedAnswer,
    keyChecks: input.keyChecks,
    variants: input.variants ?? [],
  };
}

export function ReadIntStreak() {
  const [done, setDone] = useState(false);
  return (
    <Frame title="ProceduralCard · 1. read-int 3-streak">
      <ProceduralCard
        card={makeCard({
          id: 'proc.story.readint',
          section: 'I/O — read int',
          stem: 'write the line that reads an int from cin',
          prompt: 'Write a single line that reads an int into x using cin.',
          expectedAnswer: 'cin >> x;',
          keyChecks: ['cin', '>>', 'x'],
          variants: [
            {
              prompt: 'Now write a line that reads an int into n using cin.',
              expectedAnswer: 'cin >> n;',
            },
            {
              prompt: 'Now write a line that reads an int into count using cin.',
              expectedAnswer: 'cin >> count;',
            },
          ],
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export function PromptPairStreak() {
  const [done, setDone] = useState(false);
  return (
    <Frame title="ProceduralCard · 2. prompt-pair">
      <ProceduralCard
        card={makeCard({
          id: 'proc.story.prompt',
          section: 'I/O — prompt pair',
          stem: 'cout prompt + cin read for a brand field',
          prompt: 'Write the cout prompt + cin read for `list[i].brand` (label "Brand: ").',
          expectedAnswer:
            'cout << "Brand: ";\ncin >> list[i].brand;',
          keyChecks: ['cout', '<<', 'cin', '>>', 'list[i].brand'],
          variants: [
            {
              prompt:
                'Now write the prompt+read for `list[i].price` with label "Price: ".',
              expectedAnswer:
                'cout << "Price: ";\ncin >> list[i].price;',
            },
          ],
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export function ForLoopBodyStreak() {
  const [done, setDone] = useState(false);
  return (
    <Frame title="ProceduralCard · 3. for-loop body">
      <ProceduralCard
        card={makeCard({
          id: 'proc.story.for',
          section: 'control — for loop',
          stem: 'write the for-loop that iterates n times',
          prompt: 'Write a for-loop header that iterates exactly n times (i = 0..n-1).',
          expectedAnswer: 'for (int i = 0; i < n; i++)',
          keyChecks: ['for', 'int i = 0', 'i < n', 'i++'],
          variants: [
            {
              prompt: 'Now write the for-loop header for size 5 (i = 0..4).',
              expectedAnswer: 'for (int i = 0; i < 5; i++)',
            },
          ],
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export default ReadIntStreak;
