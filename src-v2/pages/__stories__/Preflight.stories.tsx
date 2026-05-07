/**
 * Preflight.stories.tsx
 */

import { Preflight } from '../Preflight';
import type { Card } from '../../types/card-schema';

const baseCommon = {
  schemaVersion: 'v2' as const,
  level: 'L0' as const,
  stage: 0 as const,
  source: { kind: 'v2' as const, ref: 'Preflight.stories' },
  commonMistakeIds: [],
  status: 'NEW' as const,
  createdBy: 'UX-Preflight-stories',
  reviewedBy: [],
};

function trace(id: string, atomId: string): Card {
  return {
    ...baseCommon,
    qTags: ['Q1'],
    id, atomId,
    type: 'TraceCard',
    stem: `Trace ${id}. Fill in the variable and terminal output.`,
    code: `int main() {\n  int x = ${atomId.length};\n  cout << x;\n  return 0;\n}`,
    variables: ['x'],
    expectedTrace: [{ line: 2, variable: 'x', value: String(atomId.length), output: null }],
    userInputs: [],
    inputLabels: [],
    terminalOutput: [String(atomId.length)],
    inputMode: 'final-only',
  } as Card;
}

const ATOM_IDS = ['F-01','F-02','F-03','F-04','F-05','F-06','F-07','F-08','F-09','F-13','F-18','F-22'];
const CARDS: Card[] = ATOM_IDS.flatMap((a, i) => [
  trace(`pf-${i}-a`, a),
  trace(`pf-${i}-b`, a),
]).slice(0, 50);

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

export function Preflight_Brief() {
  return (
    <Frame title="1. Brief — T-1 day welcome screen">
      <Preflight cards={CARDS} onDrillAtoms={(a) => alert('drill: ' + a.join(', '))} onAbort={() => alert('exit')} />
    </Frame>
  );
}

export function Preflight_FewCards() {
  return (
    <Frame title="2. 4 cards — quickly hits verdict">
      <Preflight cards={CARDS.slice(0, 4)} onDrillAtoms={(a) => alert('drill: ' + a.join(', '))} onAbort={() => alert('exit')} />
    </Frame>
  );
}
