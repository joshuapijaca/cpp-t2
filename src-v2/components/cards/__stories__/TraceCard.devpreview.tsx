/**
 * TraceCard.devpreview.tsx
 *
 * Hand-crafted Q1-shape TraceCard fixture for dev verification of the
 * paper-sim redesign (W4). Mount via main.tsx ?dev=tracecard gate.
 *
 * Source: matches Test2-SIT102-practice-2026T1.txt Q1 ("who_am_i").
 */

import { useState } from 'react';
import { TraceCard } from '../TraceCard';
import type { TraceCard as TraceCardData } from '../../../types/card-schema';

const Q1_FIXTURE: TraceCardData = {
  id: 'devpreview-Q1-who-am-i',
  schemaVersion: 'v2',
  atomId: 'F-22a',
  qTags: ['Q1'],
  stage: 1,
  level: 'L1',
  type: 'TraceCard',
  stem:
    'Hand-execute who_am_i(d) where d is initialized as shown. Track i and ' +
    'd.mystery in the memory diagram. Predict any terminal output.',
  source: { kind: 'practice', ref: 'Q1' },
  commonMistakeIds: [],
  status: 'NEW',
  createdBy: 'devpreview',
  reviewedBy: [],
  code: [
    'const int SIZE = 5;',
    '',
    'struct stat_double {',
    '  double numbers[SIZE];',
    '  double mystery;',
    '};',
    '',
    'void who_am_i(stat_double &data) {',
    '  int i;',
    '  data.mystery = data.numbers[0];',
    '  for (i = 0; i < SIZE; i++) {',
    '    if (data.numbers[i] > data.mystery) {',
    '      data.mystery = data.numbers[i];',
    '    }',
    '  }',
    '  return;',
    '}',
    '',
    'int main() {',
    '  stat_double d = { {-20.0, 3.2, 1.9, -1.5, 1.3}, 0.0 };',
    '  who_am_i(d);',
    '  return 0;',
    '}',
  ].join('\n'),
  variables: ['i', 'd.mystery'],
  expectedTrace: [
    { line: 10, variable: 'd.mystery', value: '-20.0' },
    { line: 11, variable: 'i', value: '0' },
    { line: 12, variable: 'd.mystery', value: '3.2' },
    { line: 11, variable: 'i', value: '5' },
  ],
  userInputs: [],
  inputLabels: [],
  terminalOutput: [],
  inputMode: 'final-only',
};

export default function TraceCardDevPreview() {
  const [done, setDone] = useState(false);
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
        DEV PREVIEW · TraceCard · Q1 who_am_i fixture · status:{' '}
        {done ? 'COMPLETED' : 'in-progress'}
      </div>
      <TraceCard card={Q1_FIXTURE} onComplete={() => setDone(true)} />
    </div>
  );
}
