/**
 * DemoCard.stories.tsx — passive read-only example scenarios.
 */

import { useState } from 'react';
import { DemoCard } from '../DemoCard';
import type { DemoCard as DemoCardData } from '../../../types/card-schema';

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
  whyOneLine: string;
  demoCode: string;
  highlightTokens: string[];
  usedIn: string[];
}): DemoCardData {
  return {
    id: input.id,
    schemaVersion: 'v2',
    atomId: 'F-15',
    qTags: ['Q1'],
    stage: 0,
    level: 'L0',
    type: 'DemoCard',
    stem: input.stem,
    source: { kind: 'practice', ref: 'demo story' },
    commonMistakeIds: [],
    status: 'NEW',
    createdBy: 'STORY-DemoCard',
    reviewedBy: [],
    whyOneLine: input.whyOneLine,
    demoCode: input.demoCode,
    highlightTokens: input.highlightTokens,
    usedIn: input.usedIn,
  };
}

export function CinPromptPair() {
  const [done, setDone] = useState(false);
  return (
    <Frame title="DemoCard · 1. cin prompt-pair idiom">
      <DemoCard
        card={makeCard({
          id: 'demo.story.cin',
          stem: 'the canonical prompt-then-read idiom',
          whyOneLine:
            'pair every cin with a cout prompt so the user knows what to type.',
          demoCode:
            'cout << "Brand: ";\ncin >> list[i].brand;\ncout << "Price: ";\ncin >> list[i].price;',
          highlightTokens: ['cout', 'cin', '<<', '>>'],
          usedIn: ['Q3', 'Q4'],
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export function StructWithFields() {
  const [done, setDone] = useState(false);
  return (
    <Frame title="DemoCard · 2. struct with mixed fields">
      <DemoCard
        card={makeCard({
          id: 'demo.story.struct',
          stem: 'struct definition with three fields',
          whyOneLine:
            'name in PascalCase, fields semi-terminated, body closes with `};`.',
          demoCode:
            'struct Computer\n{\n    string brand;\n    int ram_gb;\n    double price;\n};',
          highlightTokens: ['struct', '};', 'string', 'int', 'double'],
          usedIn: ['Q2'],
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export function ForLoopShape() {
  const [done, setDone] = useState(false);
  return (
    <Frame title="DemoCard · 3. counted for-loop">
      <DemoCard
        card={makeCard({
          id: 'demo.story.for',
          stem: 'the canonical counted for-loop',
          whyOneLine: 'use `i < n`, not `i <= n`, to iterate exactly n times.',
          demoCode:
            'for (int i = 0; i < n; i++)\n{\n    cout << numbers[i] << endl;\n}',
          highlightTokens: ['for', 'i = 0', 'i < n', 'i++'],
          usedIn: ['Q1', 'Q3', 'Q4'],
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export function PassByRefHello() {
  const [done, setDone] = useState(false);
  return (
    <Frame title="DemoCard · 4. pass-by-reference">
      <DemoCard
        card={makeCard({
          id: 'demo.story.ref',
          stem: 'mutating a caller’s int via reference',
          whyOneLine: 'the `&` makes x an alias — the caller sees changes.',
          demoCode:
            'void bump(int &x)\n{\n    x = x + 1;\n}\n\nint main()\n{\n    int n = 0;\n    bump(n);\n    cout << n; // prints 1\n}',
          highlightTokens: ['&', 'bump', 'int n = 0;'],
          usedIn: ['Q3'],
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export default CinPromptPair;
