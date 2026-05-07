/**
 * Postmortem.stories.tsx — visual stories for the Postmortem diff screen.
 */

import { Postmortem, type PostmortemPayload } from '../Postmortem';
import type { MockResult } from '../Mock';

const result: MockResult = {
  paperId: 'demo-paper',
  startedAt: Date.now() - 3600 * 1000,
  submittedAt: Date.now(),
  totalSeconds: 60 * 67,
  totalScore: 75,
  perQ: [
    { qIdx: 0, qLabel: 'Q1', cardId: 'q1', passed: true,  score: 19, studentAnswer: 'int x = 5;\ncout << x;', secondsSpent: 600 },
    { qIdx: 1, qLabel: 'Q2', cardId: 'q2', passed: true,  score: 23, studentAnswer: 'struct Computer {\n  string brand;\n  int ram;\n  double price;\n};', secondsSpent: 900 },
    { qIdx: 2, qLabel: 'Q3', cardId: 'q3', passed: false, score: 12, studentAnswer: 'void read_computers(Computer arr[], int n) {\n  for (int i = 0; i < n; i++) {\n    cin >> arr[i].brand;\n  }\n}', secondsSpent: 1200 },
    { qIdx: 3, qLabel: 'Q4', cardId: 'q4', passed: true,  score: 21, studentAnswer: 'int main() {\n  const int MAX = 10;\n  Computer arr[MAX];\n  int n;\n  cout << "How many? ";\n  cin >> n;\n  read_computers(arr, n);\n  return 0;\n}', secondsSpent: 1320 },
  ],
};

const canonical: [string, string, string, string] = [
  'int x = 5;\ncout << x;',
  'struct Computer {\n  string brand;\n  int ram;\n  double price;\n};',
  'void read_computers(Computer arr[], int n) {\n  for (int i = 0; i < n; i++) {\n    cin >> arr[i].brand;\n    cin >> arr[i].ram;\n    cin >> arr[i].price;\n  }\n}',
  'int main() {\n  const int MAX = 10;\n  Computer arr[MAX];\n  int n;\n  cout << "How many? ";\n  cin >> n;\n  read_computers(arr, n);\n  for (int i = 0; i < n; i++) {\n    cout << arr[i].brand << endl;\n  }\n  return 0;\n}',
];

const payload: PostmortemPayload = {
  result,
  canonical,
  annotations: [
    [],
    [],
    [
      { line: 4, severity: 'err',  label: 'missing field reads', detail: 'You read brand but skipped ram and price. Loop body must read every struct field.', atomId: 'F-18' },
      { line: 1, severity: 'warn', label: 'no `&` parameter check', detail: 'Verify parameter passes by reference (`Computer arr[]` is fine — array decays).', atomId: 'F-09' },
    ],
    [
      { line: 8, severity: 'warn', label: 'missing print loop', detail: 'You called read_computers but never printed the result. Q4 expects the for-loop with cout dot-access.', atomId: 'F-22' },
    ],
  ],
  failedAtomIds: ['F-18'],
};

function Frame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="mono" style={{ padding: 8, background: 'var(--bg-1)', color: 'var(--text-1)', fontSize: 11 }}>
        {title}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </div>
  );
}

export function Postmortem_75of100() {
  return (
    <Frame title="1. Postmortem — 75 / 100, Q3 failed, 2 annotations">
      <Postmortem
        payload={payload}
        onDrillFailed={(ids) => alert('drill: ' + ids.join(', '))}
        onAddToWeakness={(qIdx, a) => alert(`add Q${qIdx + 1} ${a.label}`)}
        onDone={() => alert('done')}
      />
    </Frame>
  );
}

export function Postmortem_NoErrors() {
  const clean: PostmortemPayload = {
    ...payload,
    result: { ...result, totalScore: 100, perQ: result.perQ.map((q) => ({ ...q, passed: true, score: 25 })) as MockResult['perQ'] },
    annotations: [[], [], [], []],
    failedAtomIds: [],
  };
  return (
    <Frame title="2. Postmortem — perfect score, no annotations">
      <Postmortem payload={clean} onDrillFailed={() => {}} onAddToWeakness={() => {}} onDone={() => {}} />
    </Frame>
  );
}
