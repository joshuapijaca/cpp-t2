/**
 * WalkthroughCard.devpreview.tsx
 *
 * Two fixtures cover both render modes added in W5:
 *   1. WithMemorySnapshots — F-03-style hand-execute walkthrough; each
 *      step carries a `vars[]` snapshot so MemoryBoxes builds up.
 *   2. ProseOnly — F-20-style syntax walkthrough; no `vars`, just
 *      annotation prose. The MemoryBoxes pane is hidden in this mode.
 *
 * Mount via main.tsx ?dev=walkthrough gate.
 */

import { useState } from 'react';
import { WalkthroughCard } from '../WalkthroughCard';
import type { WalkthroughCard as WalkthroughCardData } from '../../../types/card-schema';

const WITH_MEMORY: WalkthroughCardData = {
  id: 'devpreview-walkthrough-memory',
  schemaVersion: 'v2',
  atomId: 'F-03',
  qTags: ['Q1'],
  stage: 0,
  level: 'L0',
  type: 'WalkthroughCard',
  stem:
    'Hand-execute step by step. Watch the memory diagram build as each line ' +
    'runs. Reveal the next step with Space.',
  source: { kind: 'pfg', ref: 'PFG/part-1/3-control-flow/0-panorama/07-hand-execution' },
  commonMistakeIds: [],
  status: 'NEW',
  createdBy: 'devpreview',
  reviewedBy: [],
  levelLabel: 'L0 Foundation · F-03 hand-execution',
  fullCode: [
    '#include <iostream>',
    'using namespace std;',
    'int main() {',
    '  int x = 5;',
    '  int y = 7;',
    '  int sum = x + y;',
    '  cout << sum << endl;',
    '  return 0;',
    '}',
  ].join('\n'),
  steps: [
    {
      line: 4,
      code: 'int x = 5;',
      annotation: 'Open a memory box for x. Write 5 inside it.',
      atomIds: [],
      vars: [{ name: 'x', value: '5', history: [] }],
    },
    {
      line: 5,
      code: 'int y = 7;',
      annotation: 'Open a memory box for y. Write 7 inside it.',
      atomIds: [],
      vars: [
        { name: 'x', value: '5', history: [] },
        { name: 'y', value: '7', history: [] },
      ],
    },
    {
      line: 6,
      code: 'int sum = x + y;',
      annotation:
        'Read x (5), read y (7), add → 12. Open box for sum, write 12 inside.',
      atomIds: [],
      vars: [
        { name: 'x', value: '5', history: [] },
        { name: 'y', value: '7', history: [] },
        { name: 'sum', value: '12', history: [] },
      ],
    },
    {
      line: 7,
      code: 'cout << sum << endl;',
      annotation: 'Print the value of sum (12) to the terminal, then newline.',
      atomIds: [],
      vars: [
        { name: 'x', value: '5', history: [] },
        { name: 'y', value: '7', history: [] },
        { name: 'sum', value: '12', history: [] },
      ],
      terminal: ['12'],
    },
    {
      line: 8,
      code: 'return 0;',
      annotation: 'Program exits cleanly with status 0.',
      atomIds: [],
      vars: [
        { name: 'x', value: '5', history: [] },
        { name: 'y', value: '7', history: [] },
        { name: 'sum', value: '12', history: [] },
      ],
      terminal: ['12'],
    },
  ],
};

const PROSE_ONLY: WalkthroughCardData = {
  id: 'devpreview-walkthrough-prose',
  schemaVersion: 'v2',
  atomId: 'F-20',
  qTags: ['Q2'],
  stage: 0,
  level: 'L0',
  type: 'WalkthroughCard',
  stem:
    'Read this struct definition left-to-right. Each step explains what one ' +
    'line of syntax does. No memory yet — this is a declaration, not execution.',
  source: { kind: 'pfg', ref: 'PFG/part-2/3-structuring-data' },
  commonMistakeIds: [],
  status: 'NEW',
  createdBy: 'devpreview',
  reviewedBy: [],
  levelLabel: 'L0 Foundation · F-20 struct syntax',
  fullCode: [
    'const int SIZE = 5;',
    '',
    'struct stat_double {',
    '  double numbers[SIZE];',
    '  double mystery;',
    '};',
  ].join('\n'),
  steps: [
    {
      line: 1,
      code: 'const int SIZE = 5;',
      annotation:
        'A compile-time constant SIZE = 5. Used as the array dimension below. const means we cannot reassign it.',
      atomIds: [],
    },
    {
      line: 3,
      code: 'struct stat_double {',
      annotation:
        'Open a struct definition. The keyword struct introduces a new compound type. The name stat_double is the type identifier we will declare variables of below. The opening brace begins the field list.',
      atomIds: [],
    },
    {
      line: 4,
      code: '  double numbers[SIZE];',
      annotation:
        'A field named numbers that holds an array of 5 doubles (SIZE = 5 from line 1). Each element will be a 64-bit floating-point value. Indices are 0..4.',
      atomIds: [],
    },
    {
      line: 5,
      code: '  double mystery;',
      annotation: 'A second field — a single double named mystery.',
      atomIds: [],
    },
    {
      line: 6,
      code: '};',
      annotation:
        'CRITICAL line. Closing brace }, then a semicolon ;. The semicolon is required after a struct definition — forgetting it is the #1 syntax error students make on Q2.',
      atomIds: [],
    },
  ],
};

export default function WalkthroughDevPreview() {
  const [tab, setTab] = useState<'memory' | 'prose'>('memory');
  const [done, setDone] = useState(false);
  const card = tab === 'memory' ? WITH_MEMORY : PROSE_ONLY;
  return (
    <div
      style={{
        background: '#0d1117',
        minHeight: '100vh',
        padding: 16,
        color: '#e6edf3',
        fontFamily: 'monospace',
      }}
    >
      <div style={{ marginBottom: 12, fontSize: 12, color: '#7ee787' }}>
        DEV PREVIEW · WalkthroughCard · status: {done ? 'COMPLETED' : 'in-progress'}
      </div>
      <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <button
          onClick={() => {
            setTab('memory');
            setDone(false);
          }}
          style={{
            background: tab === 'memory' ? '#79c0ff' : '#161b22',
            color: tab === 'memory' ? '#0d1117' : '#e6edf3',
            border: '1px solid #30363d',
            padding: '6px 12px',
            borderRadius: 4,
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          With memory snapshots
        </button>
        <button
          onClick={() => {
            setTab('prose');
            setDone(false);
          }}
          style={{
            background: tab === 'prose' ? '#79c0ff' : '#161b22',
            color: tab === 'prose' ? '#0d1117' : '#e6edf3',
            border: '1px solid #30363d',
            padding: '6px 12px',
            borderRadius: 4,
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          Prose-only (legacy)
        </button>
      </div>
      <WalkthroughCard
        key={card.id}
        card={card}
        onComplete={() => setDone(true)}
      />
    </div>
  );
}
