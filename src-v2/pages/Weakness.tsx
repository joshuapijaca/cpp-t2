/**
 * Weakness.tsx — UX-M19 Weakness File screen.
 *
 * Filtered list of cards the student has failed, with a decay heatmap of
 * fails per day for the last 90 days.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │ Weakness file · 17 entries                                   │
 *   │ sort: [recent] [low famil] [high freq]                       │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │ ┌─ Decay heatmap (90 days) ────────────────────────────────┐ │
 *   │ │ ░░▓▓░░░▓░░░░░░░  ...                                     │ │
 *   │ └──────────────────────────────────────────────────────────┘ │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │ atom    | stem                  | fails | last fail | drill │
 *   │ F-13a   | for-loop bound off-1  |   3   | 2h ago    | [→]   │
 *   │ A-007   | struct member init    |   2   | 12h ago   | [→]   │
 *   └──────────────────────────────────────────────────────────────┘
 */

import { useMemo, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────

export interface WeaknessEntry {
  cardId: string;
  atomId: string;
  stem: string;
  /** How many times this card has failed in total. */
  failCount: number;
  /** Latest fail timestamp (ms epoch). */
  lastFailAt: number;
  /** Familiarity 0..100 (lower = weaker). */
  familiarityPct: number;
}

export interface WeaknessProps {
  entries: WeaknessEntry[];
  /** Per-day fail counts for last 90 days, oldest first. */
  dailyFails?: number[];
  /** Drill a single card. */
  onDrill: (cardId: string) => void;
  /** Drill all atoms for a row. */
  onDrillAtom: (atomId: string) => void;
}

type SortMode = 'recent' | 'low-famil' | 'high-freq';

// ─────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────

export function Weakness({ entries, dailyFails, onDrill, onDrillAtom }: WeaknessProps) {
  const [sort, setSort] = useState<SortMode>('recent');
  const [filter, setFilter] = useState<string>('');

  const sorted = useMemo(() => {
    const f = filter.trim().toLowerCase();
    const base = f ? entries.filter((e) =>
      e.atomId.toLowerCase().includes(f) ||
      e.stem.toLowerCase().includes(f) ||
      e.cardId.toLowerCase().includes(f)
    ) : entries;
    const arr = [...base];
    switch (sort) {
      case 'recent':    arr.sort((a, b) => b.lastFailAt - a.lastFailAt); break;
      case 'low-famil': arr.sort((a, b) => a.familiarityPct - b.familiarityPct); break;
      case 'high-freq': arr.sort((a, b) => b.failCount - a.failCount); break;
    }
    return arr;
  }, [entries, filter, sort]);

  const heat = dailyFails ?? defaultHeat();

  return (
    <div style={{ height: '100%', display: 'grid', gridTemplateRows: 'auto auto auto 1fr', background: 'var(--bg-0)' }}>
      {/* Header */}
      <header
        className="mono"
        style={{
          padding: '12px 20px',
          borderBottom: '1px solid var(--border-1)',
          background: 'var(--bg-1)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 14, color: 'var(--text-0)' }}>Weakness file</h2>
        <span style={{ color: 'var(--text-2)' }}>·</span>
        <span style={{ color: 'var(--text-1)', fontSize: 12 }}>{entries.length} entries</span>
        <span style={{ flex: 1 }} />
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="filter atom / stem / card-id"
          aria-label="Filter weakness entries"
          className="mono"
          style={{
            padding: '6px 10px',
            background: 'var(--bg-2)',
            color: 'var(--text-0)',
            border: '1px solid var(--border-1)',
            borderRadius: 4,
            fontSize: 12,
            width: 240,
          }}
        />
      </header>

      {/* Sort tabs */}
      <div
        className="mono"
        style={{
          display: 'flex',
          gap: 4,
          padding: '8px 20px',
          borderBottom: '1px solid var(--border-1)',
          background: 'var(--bg-0)',
        }}
      >
        <span style={{ color: 'var(--text-2)', fontSize: 11, alignSelf: 'center' }}>sort:</span>
        <SortChip label="most recent" active={sort === 'recent'} onClick={() => setSort('recent')} />
        <SortChip label="lowest familiarity" active={sort === 'low-famil'} onClick={() => setSort('low-famil')} />
        <SortChip label="highest fail freq" active={sort === 'high-freq'} onClick={() => setSort('high-freq')} />
      </div>

      {/* Heatmap */}
      <Heatmap dailyFails={heat} />

      {/* Table */}
      <div style={{ overflow: 'auto' }}>
        {sorted.length === 0 ? (
          <EmptyState filtered={filter.length > 0} />
        ) : (
          <table className="mono" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: 'var(--bg-1)', position: 'sticky', top: 0, zIndex: 1 }}>
                <th style={th}>atom</th>
                <th style={th}>card stem</th>
                <th style={th}>fails</th>
                <th style={th}>familiarity</th>
                <th style={th}>last fail</th>
                <th style={th} />
              </tr>
            </thead>
            <tbody>
              {sorted.map((e) => (
                <tr key={e.cardId} style={{ borderTop: '1px solid var(--border-1)' }}>
                  <td style={td}>
                    <button
                      type="button"
                      onClick={() => onDrillAtom(e.atomId)}
                      title="Drill all cards for this atom"
                      style={{
                        background: 'transparent',
                        color: 'var(--accent-cyan)',
                        border: 'none',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {e.atomId}
                    </button>
                  </td>
                  <td style={{ ...td, color: 'var(--text-0)', maxWidth: 380, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={e.stem}>
                    {e.stem}
                  </td>
                  <td style={{ ...td, color: 'var(--state-err)', fontWeight: 600 }}>
                    {e.failCount}
                  </td>
                  <td style={td}>
                    <FamilDot pct={e.familiarityPct} />
                  </td>
                  <td style={{ ...td, color: 'var(--text-1)' }}>
                    {fmtAgo(e.lastFailAt)}
                  </td>
                  <td style={td}>
                    <button
                      type="button"
                      onClick={() => onDrill(e.cardId)}
                      style={{
                        padding: '4px 10px',
                        background: 'var(--state-warn)',
                        color: 'var(--bg-0)',
                        border: 'none',
                        borderRadius: 3,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      drill →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Subcomponents
// ─────────────────────────────────────────────────────────────────────

function Heatmap({ dailyFails }: { dailyFails: number[] }) {
  const max = Math.max(1, ...dailyFails);
  const cell = 11;
  const gap = 2;

  function shade(n: number): string {
    if (n === 0) return 'var(--bg-2)';
    const t = n / max;
    if (t < 0.34) return 'rgba(248, 81, 73, 0.30)';
    if (t < 0.67) return 'rgba(248, 81, 73, 0.60)';
    return 'var(--state-err)';
  }

  // group into weeks (7 day columns), oldest left
  const weeks: number[][] = [];
  for (let i = 0; i < dailyFails.length; i += 7) {
    weeks.push(dailyFails.slice(i, i + 7));
  }

  return (
    <div
      style={{
        padding: '12px 20px',
        borderBottom: '1px solid var(--border-1)',
        background: 'var(--bg-1)',
      }}
    >
      <div className="mono" style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 6 }}>
        decay heatmap · last {dailyFails.length} days · max {max} fails/day
      </div>
      <div style={{ display: 'flex', gap, overflow: 'auto' }}>
        {weeks.map((w, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap }}>
            {w.map((n, di) => (
              <div
                key={di}
                role="img"
                aria-label={`day ${wi * 7 + di + 1}: ${n} fails`}
                title={`${n} fails`}
                style={{
                  width: cell,
                  height: cell,
                  borderRadius: 2,
                  background: shade(n),
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              />
            ))}
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div className="mono" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-2)' }}>
          <span>0</span>
          <span style={{ width: cell, height: cell, background: 'var(--bg-2)', borderRadius: 2 }} />
          <span style={{ width: cell, height: cell, background: 'rgba(248, 81, 73, 0.30)', borderRadius: 2 }} />
          <span style={{ width: cell, height: cell, background: 'rgba(248, 81, 73, 0.60)', borderRadius: 2 }} />
          <span style={{ width: cell, height: cell, background: 'var(--state-err)', borderRadius: 2 }} />
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
}

function SortChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '4px 10px',
        background: active ? 'var(--bg-3)' : 'transparent',
        color: active ? 'var(--text-0)' : 'var(--text-1)',
        border: '1px solid var(--border-1)',
        borderRadius: 12,
        cursor: 'pointer',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: active ? 600 : 400,
      }}
    >
      {label}
    </button>
  );
}

function FamilDot({ pct }: { pct: number }) {
  const c = pct >= 85 ? 'var(--state-ok)' : pct >= 50 ? 'var(--state-warn)' : 'var(--state-err)';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
      <span style={{ color: c, fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
    </span>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div
      className="mono"
      style={{
        display: 'grid', placeItems: 'center',
        padding: '60px 20px',
        color: 'var(--text-2)',
        fontSize: 13,
        textAlign: 'center',
      }}
    >
      {filtered ? 'No matches for this filter.' : 'No failed cards yet. Keep drilling.'}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

const th: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 14px',
  color: 'var(--text-1)',
  fontWeight: 600,
  fontSize: 11,
  borderBottom: '1px solid var(--border-1)',
};

const td: React.CSSProperties = {
  padding: '8px 14px',
  fontFamily: 'var(--font-mono)',
  verticalAlign: 'middle',
};

function fmtAgo(ts: number): string {
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

function defaultHeat(): number[] {
  // 90 days of zeros, used when caller hasn't supplied real data.
  return Array(90).fill(0);
}

export default Weakness;
