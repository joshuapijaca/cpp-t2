/**
 * Weakness.stories.tsx
 */

import { Weakness, type WeaknessEntry } from '../Weakness';

const NOW = Date.now();
const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

const ENTRIES: WeaknessEntry[] = [
  { cardId: 'card-001', atomId: 'F-13a', stem: 'for-loop bound off-by-one (i <= n vs i < n)', failCount: 4, lastFailAt: NOW - 2 * HOUR, familiarityPct: 31 },
  { cardId: 'card-002', atomId: 'F-09',  stem: 'Missing & in pass-by-ref signature',           failCount: 3, lastFailAt: NOW - 12 * HOUR, familiarityPct: 42 },
  { cardId: 'card-003', atomId: 'F-22',  stem: 'main() forgot return 0',                        failCount: 2, lastFailAt: NOW - 1 * DAY,  familiarityPct: 55 },
  { cardId: 'card-004', atomId: 'F-18',  stem: 'array-of-struct cin >> wrong field order',     failCount: 5, lastFailAt: NOW - 3 * DAY,  familiarityPct: 18 },
  { cardId: 'card-005', atomId: 'F-13b', stem: 'struct decl missing trailing semicolon',       failCount: 1, lastFailAt: NOW - 5 * DAY,  familiarityPct: 67 },
  { cardId: 'card-006', atomId: 'F-07',  stem: 'semicolon vs colon confusion',                  failCount: 2, lastFailAt: NOW - 18 * DAY, familiarityPct: 71 },
];

function makeHeat(): number[] {
  const days = 90;
  const out: number[] = [];
  for (let i = 0; i < days; i++) {
    // Simple deterministic synthetic curve.
    const t = i / days;
    const burst = i % 7 < 3 ? Math.floor(2 + Math.sin(t * 6.28 * 4) * 2) : 0;
    out.push(Math.max(0, burst));
  }
  return out;
}

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

export function Weakness_Populated() {
  return (
    <Frame title="1. Populated — 6 entries + heatmap">
      <Weakness
        entries={ENTRIES}
        dailyFails={makeHeat()}
        onDrill={(c) => alert('drill card: ' + c)}
        onDrillAtom={(a) => alert('drill atom: ' + a)}
      />
    </Frame>
  );
}

export function Weakness_Empty() {
  return (
    <Frame title="2. Empty — no failed cards">
      <Weakness entries={[]} onDrill={() => {}} onDrillAtom={() => {}} />
    </Frame>
  );
}
