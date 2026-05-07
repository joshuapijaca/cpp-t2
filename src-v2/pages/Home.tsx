/**
 * Home.tsx — v2.2 minimalist, v1-style.
 *
 * Per docs/v2/MANIFEST.md: Home is one of exactly 2 pages.
 *
 * Layout (ASCII):
 *   ┌─ cpp-t2 ───────────────────────────────────────────────┐
 *   │ L0  Foundations          [00 / 517]  [Continue →]      │
 *   │ L1  Q1 Hand-execute      [00 / 772]  [Continue →]      │
 *   │ L2  Q2 Write struct      [00 / 269]  [Continue →]      │
 *   │ L3  Q3 Read fn           [00 / 417]  [Continue →]      │
 *   │ L4  Q4 Write main        [00 / 396]  [Continue →]      │
 *   │ L5  Mock paper           [00 / 176]  [Continue →]      │
 *   │ ─────────────────────────────────────────────────────── │
 *   │ Jump to card: [____]  [Go]                              │
 *   └─────────────────────────────────────────────────────────┘
 *
 * Click row OR Continue → /sequence/L#. The level row is keyboard-focusable
 * (asButton). Jump-to-card accepts `L#-N` (e.g. L1-42) or absolute `N`
 * across the level deck. Position is read live from session-store via
 * useSession() (no separate useModulePosition hook in v2.2 — manifest
 * forbids smart engines, so position = cards-seen counted off the
 * exposure-counter state).
 *
 * No weakness file, no mock tile, no mastery rings, no countdown, no
 * sidebar. Per ANTI_DRIFT.md: those were drift in v2.1 and are removed.
 */

import { useCallback, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { Card, Level } from '../types/card-schema';
import { useSession } from '../lib/session-store';

// ─── Level catalogue ─────────────────────────────────────────────────────
// Title is hand-authored (matches docs/16 + MANIFEST). Order is L0..L5.

interface LevelInfo {
  readonly id: Level;
  readonly title: string;
}

const LEVELS: readonly LevelInfo[] = [
  { id: 'L0', title: 'Foundations' },
  { id: 'L1', title: 'Q1 Hand-execute' },
  { id: 'L2', title: 'Q2 Write struct' },
  { id: 'L3', title: 'Q3 Read fn' },
  { id: 'L4', title: 'Q4 Write main' },
  { id: 'L5', title: 'Mock paper' },
] as const;

// ─── Props ───────────────────────────────────────────────────────────────

export interface HomeProps {
  /** Called when student clicks a level row, the Continue button, or Go on
   *  the jump-to-card box. App.tsx wires this to navigate('/sequence/:lvl').
   *  `cardIndex` (when present) is the 0-based offset within that level's
   *  filtered + sorted deck. */
  onPick?: (level: Level, cardIndex?: number) => void;
}

// ─── Component ───────────────────────────────────────────────────────────

export function Home(props: HomeProps) {
  const { onPick } = props;
  const { cards, state } = useSession();

  // Group cards by level once. cards.json is already in atom-prereq order
  // (Phase A4 build pipeline guarantees this), so simple filter preserves
  // the build-time order needed by Sequence's forward-only walker.
  const cardsByLevel = useMemo(() => {
    const out: Record<Level, Card[]> = {
      L0: [], L1: [], L2: [], L3: [], L4: [], L5: [],
    };
    for (const c of cards) {
      if (out[c.level]) out[c.level].push(c);
    }
    return out;
  }, [cards]);

  // Position = how many cards in this level have been seen
  // (exposureCount > 0). Equivalent to v1's "next unseen card" heuristic
  // but read straight off the exposure-counter state.
  const position = useCallback(
    (level: Level): number => {
      const deck = cardsByLevel[level];
      let seen = 0;
      for (const c of deck) {
        const e = state.exposures[c.id];
        if (e && e.exposureCount > 0) seen++;
      }
      return seen;
    },
    [cardsByLevel, state.exposures],
  );

  // ─── Jump-to-card ──────────────────────────────────────────────────────
  const [jumpInput, setJumpInput] = useState('');

  // Accepts `L#-N` (level-relative) or absolute `N` (across full deck).
  const parsedJump = useMemo(() => {
    const trimmed = jumpInput.trim();
    if (trimmed === '') return null;
    const rel = trimmed.match(/^(L[0-5])-(\d+)$/i);
    if (rel) {
      const lvl = rel[1]!.toUpperCase() as Level;
      const n = Number.parseInt(rel[2]!, 10);
      if (Number.isNaN(n) || n < 0 || n >= cardsByLevel[lvl].length) return null;
      return { level: lvl, cardIndex: n };
    }
    const n = Number.parseInt(trimmed, 10);
    if (Number.isNaN(n) || n < 0 || n >= cards.length) return null;
    // Map absolute index → (level, level-relative index).
    const card = cards[n]!;
    let idxInLevel = 0;
    for (const c of cardsByLevel[card.level]) {
      if (c.id === card.id) break;
      idxInLevel++;
    }
    return { level: card.level, cardIndex: idxInLevel };
  }, [jumpInput, cards, cardsByLevel]);

  const handleJump = useCallback(() => {
    if (!parsedJump) return;
    onPick?.(parsedJump.level, parsedJump.cardIndex);
  }, [parsedJump, onPick]);

  const handleJumpKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleJump();
      }
    },
    [handleJump],
  );

  return (
    <div
      style={{
        padding: 'var(--sp-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-3)',
        minHeight: '100%',
        maxWidth: 720,
        margin: '0 auto',
      }}
    >
      <header
        className="mono"
        style={{
          fontSize: 'var(--fs-h1, 22px)',
          color: 'var(--text-0)',
          fontWeight: 600,
          letterSpacing: '0.02em',
        }}
      >
        cpp-t2
        <span
          style={{
            marginLeft: 12,
            color: 'var(--text-2)',
            fontSize: 'var(--fs-prompt, 15px)',
            fontWeight: 400,
          }}
        >
          SIT102 Test 2 — pick a level to begin
        </span>
      </header>

      <ul
        aria-label="Levels"
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {LEVELS.map((info) => {
          const total = cardsByLevel[info.id].length;
          const pos = position(info.id);
          return (
            <LevelRow
              key={info.id}
              info={info}
              position={pos}
              total={total}
              onPick={() => onPick?.(info.id)}
            />
          );
        })}
      </ul>

      <hr
        aria-hidden
        style={{
          border: 0,
          borderTop: '1px dashed var(--border-1)',
          margin: 'var(--sp-2) 0',
        }}
      />

      <div
        className="mono"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--sp-2)',
          fontSize: 'var(--fs-code, 14px)',
        }}
      >
        <label
          htmlFor="home-jump-input"
          style={{ color: 'var(--text-1)' }}
        >
          Jump to card:
        </label>
        <input
          id="home-jump-input"
          type="text"
          value={jumpInput}
          onChange={(e) => setJumpInput(e.target.value)}
          onKeyDown={handleJumpKey}
          placeholder="L1-42 or 358"
          aria-label="Jump to card. Enter L#-N or absolute index."
          spellCheck={false}
          style={{
            width: 140,
            padding: '4px 8px',
            background: 'var(--bg-2)',
            border: '1px solid var(--border-1)',
            borderRadius: 4,
            color: 'var(--text-0)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-code, 14px)',
          }}
        />
        <button
          type="button"
          onClick={handleJump}
          disabled={!parsedJump}
          aria-label="Jump to entered card"
          className="mono tr"
          style={{
            padding: '4px 14px',
            background: parsedJump ? 'var(--accent-cyan)' : 'var(--bg-3)',
            color: parsedJump ? 'var(--bg-0)' : 'var(--text-2)',
            border: '1px solid var(--border-1)',
            borderRadius: 4,
            cursor: parsedJump ? 'pointer' : 'not-allowed',
            fontWeight: 600,
            fontSize: 'var(--fs-code, 14px)',
          }}
        >
          Go
        </button>
        <span
          style={{
            color: 'var(--text-2)',
            fontSize: 'var(--fs-micro, 11px)',
            marginLeft: 'var(--sp-2)',
          }}
        >
          {jumpInput.trim() === ''
            ? `0 - ${Math.max(0, cards.length - 1)} or L#-N`
            : parsedJump
              ? `→ ${parsedJump.level} card ${parsedJump.cardIndex}`
              : 'invalid'}
        </span>
      </div>

      <span style={{ flex: 1 }} />

      <footer
        className="mono"
        style={{
          color: 'var(--text-2)',
          fontSize: 'var(--fs-micro, 11px)',
          borderTop: '1px solid var(--border-1)',
          paddingTop: 'var(--sp-2)',
        }}
      >
        {cards.length.toLocaleString()} cards · forward-only · refresh to restart
      </footer>
    </div>
  );
}

export default Home;

// ─── LevelRow ────────────────────────────────────────────────────────────

interface LevelRowProps {
  readonly info: LevelInfo;
  readonly position: number;
  readonly total: number;
  onPick(): void;
}

function LevelRow(props: LevelRowProps) {
  const { info, position, total, onPick } = props;
  const baseStyle: CSSProperties = {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '40px 1fr 100px 120px',
    alignItems: 'center',
    gap: 'var(--sp-3)',
    padding: '8px 12px',
    background: 'var(--bg-1)',
    border: '1px solid var(--border-1)',
    borderRadius: 4,
    color: 'var(--text-0)',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--fs-code, 14px)',
    cursor: total > 0 ? 'pointer' : 'not-allowed',
    textAlign: 'left',
    opacity: total > 0 ? 1 : 0.5,
  };
  const padPos = String(position).padStart(2, '0');
  const padTot = String(total).padStart(total >= 100 ? 3 : 2, '0');
  return (
    <li>
      <button
        type="button"
        onClick={onPick}
        disabled={total === 0}
        aria-label={`${info.id} ${info.title}, ${position} of ${total} cards seen`}
        className="tr"
        style={baseStyle}
      >
        <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
          {info.id}
        </span>
        <span style={{ color: 'var(--text-0)' }}>{info.title}</span>
        <span
          className="tabular"
          style={{
            color: 'var(--text-1)',
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          [{padPos} / {padTot}]
        </span>
        <span
          aria-hidden
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px 10px',
            background: 'var(--bg-3)',
            border: '1px solid var(--border-2)',
            borderRadius: 3,
            color: 'var(--text-0)',
            fontSize: 'var(--fs-micro, 11px)',
            fontWeight: 600,
          }}
        >
          Continue →
        </span>
      </button>
    </li>
  );
}
