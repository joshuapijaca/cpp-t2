/**
 * Mock.stories.tsx — interactive stories for the Mock screen.
 *
 * Each story is a plain exported React component (cpp-t2 doesn't run
 * Storybook — same pattern as cards/__stories__/*.stories.tsx).
 */

import { useState } from 'react';
import { Mock, type MockPaper, type MockResult } from '../Mock';
import type {
  TraceCard as TraceCardData,
  StructWriteCard as StructWriteCardData,
  FunctionWriteCard as FunctionWriteCardData,
  MainWriteCard as MainWriteCardData,
} from '../../types/card-schema';

// ─────────────────────────────────────────────────────────────────────
// Fixtures (minimum-viable canonical cards).
// ─────────────────────────────────────────────────────────────────────

const baseCommon = {
  schemaVersion: 'v2' as const,
  level: 'L0' as const,
  stage: 0 as const,
  qTags: ['Q1'] as const,
  source: { kind: 'v2' as const, ref: 'Mock.stories' },
  commonMistakeIds: [],
  status: 'NEW' as const,
  createdBy: 'UX-Mock-stories',
  reviewedBy: [],
};

const q1: TraceCardData = {
  ...baseCommon,
  qTags: ['Q1'],
  id: 'mock-q1',
  atomId: 'F-03',
  type: 'TraceCard',
  stem: 'Trace this program. Fill in x and the terminal output.',
  code: `int main() {\n  int x = 5;\n  cout << x;\n  return 0;\n}`,
  variables: ['x'],
  expectedTrace: [{ line: 2, variable: 'x', value: '5', output: null }],
  userInputs: [],
  inputLabels: [],
  terminalOutput: ['5'],
  inputMode: 'final-only',
} as TraceCardData;

const q2: StructWriteCardData = {
  ...baseCommon,
  qTags: ['Q2'],
  id: 'mock-q2',
  atomId: 'F-13',
  type: 'StructWriteCard',
  stem: 'Define a struct Computer with brand (string), ram (int), price (double).',
  prompt: 'Define a struct Computer with brand (string), ram (int), price (double).',
  canonicalAnswer: 'struct Computer {\n  string brand;\n  int ram;\n  double price;\n};',
  keyChecks: ['struct Computer', 'brand', 'ram', 'price'],
  forbiddenTokens: [],
  explanation: 'Struct fields use type-then-name then semicolon.',
  requiredFields: ['brand', 'ram', 'price'],
};

const q3: FunctionWriteCardData = {
  ...baseCommon,
  qTags: ['Q3'],
  id: 'mock-q3',
  atomId: 'F-18',
  type: 'FunctionWriteCard',
  stem: 'Write read_computers(arr, n) — reads n Computer entries via cin.',
  prompt: 'Write a function read_computers that reads n Computer entries from cin.',
  canonicalAnswer: `void read_computers(Computer arr[], int n) {\n  for (int i = 0; i < n; i++) {\n    cin >> arr[i].brand;\n    cin >> arr[i].ram;\n    cin >> arr[i].price;\n  }\n}`,
  keyChecks: ['void read_computers', 'for', 'cin >>', 'arr[i].'],
  forbiddenTokens: ['cout', 'return'],
  explanation: 'Pass-by-reference array + for-loop fill.',
  passByRefRequired: true,
};

const q4: MainWriteCardData = {
  ...baseCommon,
  qTags: ['Q4'],
  id: 'mock-q4',
  atomId: 'F-22',
  type: 'MainWriteCard',
  stem: 'Write main() that asks for count, calls read_computers, prints all.',
  prompt: 'Write main() that asks for count, calls read_computers, prints all.',
  canonicalAnswer: `int main() {\n  const int MAX = 10;\n  Computer arr[MAX];\n  int n;\n  cout << \"How many? \";\n  cin >> n;\n  read_computers(arr, n);\n  for (int i = 0; i < n; i++) {\n    cout << arr[i].brand << endl;\n  }\n  return 0;\n}`,
  keyChecks: ['const int MAX', 'cin >> n', 'read_computers', 'for', 'arr[i].'],
  forbiddenTokens: [],
  explanation: 'Standard Q4 array-of-structs main().',
  expectedTerminal: [],
};

const PAPER: MockPaper = { id: 'mock-stories-1', q1, q2, q3, q4 };
const SHORT_PAPER: MockPaper = { ...PAPER, id: 'short' };

// ─────────────────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────────────────

function Frame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="mono" style={{ padding: 8, background: 'var(--bg-1)', color: 'var(--text-1)', fontSize: 11 }}>
        {title}
      </div>
      <div style={{ flex: 1, position: 'relative' }}>{children}</div>
    </div>
  );
}

export function MockExam_FullPaper() {
  const [done, setDone] = useState<MockResult | null>(null);
  if (done) {
    return (
      <Frame title="1. Full paper — submitted">
        <pre style={{ padding: 16, color: 'var(--text-0)', fontSize: 12 }}>
          {JSON.stringify(done, null, 2)}
        </pre>
      </Frame>
    );
  }
  return (
    <Frame title="1. Full paper — 4 Q's, no timer (untimed)">
      <Mock paper={PAPER} onComplete={setDone} onAbandon={() => alert('abandoned')} />
    </Frame>
  );
}

export function MockExam_AltPaper() {
  return (
    <Frame title="2. Alt paper — same 4 Q's, no timer">
      <Mock paper={SHORT_PAPER} onComplete={() => alert('done')} onAbandon={() => alert('abandoned')} />
    </Frame>
  );
}

export function MockExam_AbandonFlow() {
  return (
    <Frame title="3. Abandon flow — press Esc">
      <Mock paper={PAPER} onComplete={() => {}} onAbandon={() => alert('abandoned (would route /home)')} />
    </Frame>
  );
}
