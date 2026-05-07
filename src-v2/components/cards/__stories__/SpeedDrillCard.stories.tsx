/**
 * SpeedDrillCard.stories.tsx — flash + recall + Q-tab scenarios.
 */

import { useState } from 'react';
import { SpeedDrillCard } from '../SpeedDrillCard';
import type { SpeedDrillCard as SpeedDrillCardData } from '../../../types/card-schema';

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
  prompt: string;
  canonicalAnswer: string;
  keyChecks: string[];
  qTags: ('Q1' | 'Q2' | 'Q3' | 'Q4')[];
  explanation: string;
}): SpeedDrillCardData {
  return {
    id: input.id,
    schemaVersion: 'v2',
    atomId: 'F-15',
    qTags: input.qTags,
    stage: 0,
    level: 'L0',
    type: 'SpeedDrillCard',
    stem: input.stem,
    source: { kind: 'practice', ref: 'production drill story' },
    commonMistakeIds: [],
    status: 'NEW',
    createdBy: 'STORY-SpeedDrillCard',
    reviewedBy: [],
    prompt: input.prompt,
    canonicalAnswer: input.canonicalAnswer,
    keyChecks: input.keyChecks,
    explanation: input.explanation,
  };
}

export function ReadIntSpeed() {
  const [done, setDone] = useState<boolean | null>(null);
  return (
    <Frame title="SpeedDrillCard · 1. read-int (untimed)">
      <SpeedDrillCard
        card={makeCard({
          id: 'sd.story.readint',
          stem: 'production drill — read int',
          prompt: 'write the line that reads an int into x using cin',
          canonicalAnswer: 'cin >> x;',
          keyChecks: ['cin', '>>', 'x'],
          qTags: ['Q1', 'Q3'],
          explanation: 'cin extraction operator >>; statement ends in `;`.',
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export function PromptPairSpeed() {
  const [done, setDone] = useState<boolean | null>(null);
  return (
    <Frame title="SpeedDrillCard · 2. prompt+read pair (untimed)">
      <SpeedDrillCard
        card={makeCard({
          id: 'sd.story.prompt',
          stem: 'production drill — prompt-pair',
          prompt: 'write a cout label + cin read for list[i].brand',
          canonicalAnswer: 'cout << "Brand: ";\ncin >> list[i].brand;',
          keyChecks: ['cout', 'cin', 'list[i].brand'],
          qTags: ['Q3'],
          explanation: 'always cout the label before the cin read.',
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export function ForLoopSpeed() {
  const [done, setDone] = useState<boolean | null>(null);
  return (
    <Frame title="SpeedDrillCard · 3. for-loop header (untimed, all Qs)">
      <SpeedDrillCard
        card={makeCard({
          id: 'sd.story.for',
          stem: 'production drill — for-loop header',
          prompt: 'write the canonical counted for-loop header for size n',
          canonicalAnswer: 'for (int i = 0; i < n; i++)',
          keyChecks: ['for', 'int i = 0', 'i < n', 'i++'],
          qTags: ['Q1', 'Q2', 'Q3', 'Q4'],
          explanation: 'i<n (strict) iterates exactly n times.',
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export function StructDefSpeed() {
  const [done, setDone] = useState<boolean | null>(null);
  return (
    <Frame title="SpeedDrillCard · 4. struct skeleton (untimed)">
      <SpeedDrillCard
        card={makeCard({
          id: 'sd.story.struct',
          stem: 'production drill — struct definition',
          prompt: 'write a struct Book with fields title (string) and pages (int)',
          canonicalAnswer:
            'struct Book\n{\n    string title;\n    int pages;\n};',
          keyChecks: ['struct Book', 'string title;', 'int pages;', '};'],
          qTags: ['Q2'],
          explanation: 'PascalCase name + `;` after each field + `};` at end.',
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export default ReadIntSpeed;
