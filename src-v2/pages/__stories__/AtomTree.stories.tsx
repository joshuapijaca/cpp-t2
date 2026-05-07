/**
 * AtomTree.stories.tsx — visual + interaction stories for the DAG view.
 */

import { AtomTree, type AtomFamiliarity } from '../AtomTree';
import type { Atom } from '../../types/atom';

function atom(id: string, name: string, prereqs: string[], usedByQs: Atom['usedByQs']): Atom {
  return {
    id, name, level: 'L0',
    prereqs, usedByQs,
    commonMistakeIds: [],
    cardCountTarget: 8,
    exposureTarget: { short: 6, medium: 8, long: 12 },
    source: { kind: 'v2', ref: 'AtomTree.stories' },
    description: `Description for ${name}.`,
  };
}

const ATOMS: Atom[] = [
  atom('F-01', 'source = text', [],          ['Q1']),
  atom('F-02', 'compiler',     ['F-01'],     ['Q1']),
  atom('F-03', 'hand-execute', ['F-02'],     ['Q1', 'Q4']),
  atom('F-04', 'identifier',   ['F-01'],     ['Q1', 'Q2', 'Q3', 'Q4']),
  atom('F-05', 'literal',      ['F-01'],     ['Q1']),
  atom('F-07', 'semicolon',    ['F-04', 'F-05'], ['Q1', 'Q2', 'Q3', 'Q4']),
  atom('F-08', 'braces',       ['F-07'],     ['Q1', 'Q2', 'Q3', 'Q4']),
  atom('F-06', 'main()',       ['F-07', 'F-08'], ['Q1', 'Q4']),
  atom('F-09', 'pass-by-ref',  ['F-06'],     ['Q3', 'Q4']),
  atom('F-13', 'struct',       ['F-08'],     ['Q2', 'Q3', 'Q4']),
  atom('F-13a', 'struct field',['F-13'],     ['Q2']),
  atom('F-13b', 'struct decl', ['F-13'],     ['Q2', 'Q3']),
  atom('F-18', 'array-of-struct', ['F-13', 'F-09'], ['Q3', 'Q4']),
  atom('F-22', 'main read+print', ['F-18'],   ['Q4']),
];

const familiarity: Record<string, AtomFamiliarity> = {
  'F-01': { pct: 100 },
  'F-02': { pct: 92 },
  'F-03': { pct: 78 },
  'F-04': { pct: 95 },
  'F-05': { pct: 88 },
  'F-07': { pct: 60 },
  'F-08': { pct: 55 },
  'F-06': { pct: 40 },
  'F-09': { pct: 22 },
  'F-13': { pct: 70 },
  'F-13a': { pct: 50 },
  'F-13b': { pct: null },
  'F-18': { pct: 18 },
  'F-22': { pct: null },
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

export function AtomTree_Default() {
  return (
    <Frame title="1. Default — 14 atoms, mixed familiarity">
      <AtomTree atoms={ATOMS} familiarity={familiarity} onDrill={(id) => alert('drill: ' + id)} />
    </Frame>
  );
}

export function AtomTree_AllUntouched() {
  const empty: Record<string, AtomFamiliarity> = {};
  for (const a of ATOMS) empty[a.id] = { pct: null };
  return (
    <Frame title="2. All untouched — every node gray">
      <AtomTree atoms={ATOMS} familiarity={empty} onDrill={() => {}} />
    </Frame>
  );
}

export function AtomTree_AllGreen() {
  const full: Record<string, AtomFamiliarity> = {};
  for (const a of ATOMS) full[a.id] = { pct: 100 };
  return (
    <Frame title="3. All green — exam-ready state">
      <AtomTree atoms={ATOMS} familiarity={full} onDrill={() => {}} />
    </Frame>
  );
}
