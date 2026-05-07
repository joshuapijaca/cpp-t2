/**
 * Home.tsx — UX-M03 Dashboard.
 *
 * Layout (per docs/18 §UX-M03 mockup):
 *
 *   ┌─ TODAY ────────────┐ ┌─ MOCK ───────┐ ┌─ MASTERY ────────┐
 *   │ 47 cards queued    │ │ Q1 ▰▰▰▰░ 82% │ │ Q1 ●●●●○ 4/5     │
 *   │ [Start session →]  │ │ Q2 ▰▰▰░░ 61% │ │ Q2 ●●●○○ 3/5     │
 *   └────────────────────┘ │ Q3 ▰▰░░░ 44% │ │ Q3 ●●○○○ 2/5     │
 *                          │ Q4 ▰▰▰▰░ 79% │ │ Q4 ●●●●○ 4/5     │
 *                          └──────────────┘ └──────────────────┘
 *   ┌─ WEAKNESS FILE ─────────────────────────────────────────┐
 *   │ atom_037 ... ▼0.31 3 fails [drill]                      │
 *   └─────────────────────────────────────────────────────────┘
 *
 * Footer: atom count + card count + "x days to test" countdown.
 *
 * Each tile is a focusable button. Keyboard: g h re-anchors here, g t to
 * Track. Reduced-motion respected via prefers-reduced-motion in theme css.
 */

import { useCallback, useMemo, type CSSProperties } from 'react';
import type { QTag } from '../types/card-schema';
import {
  useAllFamiliarity,
  useAtomCount,
  useCardCount,
  useStageProgress,
  useTestCountdown,
  useTodayDeck,
  useWeaknessFile,
} from '../lib/session-store';

// ─── Props ───────────────────────────────────────────────────────────────

export interface HomeProps {
  /** Called when student clicks "Start session" or any tile that
   *  navigates into a study screen. */
  onNavigate?: (
    target:
      | { kind: 'session' }
      | { kind: 'mock' }
      | { kind: 'track'; q: QTag }
      | { kind: 'weakness'; atomId: string }
  ) => void;
  /** Optional override for the daily-deck target count. Default 47. */
  readonly targetCount?: number;
}

// ─── Component ───────────────────────────────────────────────────────────

const Q_TAGS: readonly QTag[] = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

export function Home(props: HomeProps) {
  const { onNavigate, targetCount = 47 } = props;

  const fam = useAllFamiliarity();
  const deck = useTodayDeck(targetCount);
  const weakness = useWeaknessFile(8);
  const atomCount = useAtomCount();
  const cardCount = useCardCount();
  const daysToTest = useTestCountdown();

  const handleStart = useCallback(
    () => onNavigate?.({ kind: 'session' }),
    [onNavigate]
  );
  const handleMock = useCallback(
    () => onNavigate?.({ kind: 'mock' }),
    [onNavigate]
  );

  return (
    <div
      style={{
        padding: 'var(--sp-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-3)',
        minHeight: '100%',
      }}
    >
      {/* Top 3-column grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 'var(--sp-3)',
        }}
      >
        <TodayTile
          queuedCount={deck.length}
          targetCount={targetCount}
          onStart={handleStart}
          daysToTest={daysToTest}
        />
        <MockTile
          familiarity={Q_TAGS.map((q) => ({ q, percent: fam[q].percent }))}
          onRunMock={handleMock}
        />
        <MasteryTile
          qTags={Q_TAGS}
          onSelect={(q) => onNavigate?.({ kind: 'track', q })}
        />
      </div>

      {/* Weakness file */}
      <WeaknessFileTile
        entries={weakness}
        onDrill={(atomId) => onNavigate?.({ kind: 'weakness', atomId })}
      />

      <span style={{ flex: 1 }} />

      {/* Footer summary */}
      <footer
        className="mono"
        aria-label="Session summary"
        style={{
          display: 'flex',
          gap: 'var(--sp-3)',
          padding: 'var(--sp-2) var(--sp-3)',
          color: 'var(--text-2)',
          fontSize: 'var(--fs-micro)',
          borderTop: '1px solid var(--border-1)',
        }}
      >
        <span>{atomCount} atoms</span>
        <span aria-hidden style={{ opacity: 0.5 }}>
          ·
        </span>
        <span>{cardCount.toLocaleString()} cards</span>
        <span aria-hidden style={{ opacity: 0.5 }}>
          ·
        </span>
        <span aria-live="polite">
          {daysToTest > 0
            ? `${daysToTest} day${daysToTest === 1 ? '' : 's'} to test`
            : daysToTest === 0
              ? 'test today'
              : `${Math.abs(daysToTest)} days past test`}
        </span>
      </footer>
    </div>
  );
}

export default Home;

// ─── TODAY tile ──────────────────────────────────────────────────────────

interface TodayTileProps {
  readonly queuedCount: number;
  readonly targetCount: number;
  readonly daysToTest: number;
  onStart(): void;
}

function TodayTile(props: TodayTileProps) {
  const { queuedCount, targetCount, daysToTest, onStart } = props;
  const pct = targetCount === 0 ? 0 : Math.round((queuedCount / targetCount) * 100);

  return (
    <Tile
      title="TODAY"
      ariaLabel={`Today's queue. ${queuedCount} of ${targetCount} cards.`}
      onClick={onStart}
      asButton
    >
      <div
        className="mono"
        style={{
          fontSize: 'var(--fs-h1, 22px)',
          color: 'var(--text-0)',
          fontWeight: 600,
          letterSpacing: '0.01em',
        }}
      >
        {queuedCount}
        <span
          style={{
            color: 'var(--text-2)',
            fontSize: 'var(--fs-prompt, 15px)',
            marginLeft: 8,
            fontWeight: 400,
          }}
        >
          cards queued
        </span>
      </div>

      <ProgressBar percent={pct} ariaLabel="queue progress" />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--sp-2)',
          marginTop: 'auto',
        }}
      >
        <span
          className="mono"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 4,
            background: 'var(--accent-cyan)',
            color: 'var(--bg-0)',
            fontWeight: 600,
            fontSize: 'var(--fs-code, 14px)',
          }}
        >
          Start session →
        </span>
        <span
          className="mono"
          style={{
            color: 'var(--text-2)',
            fontSize: 'var(--fs-micro, 11px)',
          }}
        >
          T-{Math.max(0, daysToTest)}d
        </span>
      </div>
    </Tile>
  );
}

// ─── MOCK tile ───────────────────────────────────────────────────────────

interface MockTileProps {
  readonly familiarity: ReadonlyArray<{ q: QTag; percent: number }>;
  onRunMock(): void;
}

function MockTile(props: MockTileProps) {
  const { familiarity, onRunMock } = props;
  return (
    <Tile
      title="MOCK"
      ariaLabel="Mock readiness per Q-track"
      onClick={onRunMock}
      asButton
    >
      <ul
        aria-label="Q-track familiarity"
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {familiarity.map(({ q, percent }) => (
          <li
            key={q}
            className="mono tabular"
            style={{
              display: 'grid',
              gridTemplateColumns: '32px 1fr 44px',
              alignItems: 'center',
              gap: 'var(--sp-2)',
              fontSize: 'var(--fs-code, 14px)',
              color: 'var(--text-1)',
            }}
          >
            <span style={{ color: 'var(--text-0)' }}>{q}</span>
            <BlockBar percent={percent} />
            <span
              style={{
                textAlign: 'right',
                color: 'var(--text-0)',
              }}
            >
              {Math.round(percent)}%
            </span>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 'auto', paddingTop: 'var(--sp-2)' }}>
        <span
          className="mono"
          style={{
            display: 'inline-flex',
            padding: '4px 10px',
            background: 'var(--bg-3)',
            borderRadius: 3,
            color: 'var(--text-1)',
            fontSize: 'var(--fs-micro, 11px)',
            border: '1px solid var(--border-1)',
          }}
        >
          Run 90-min mock
        </span>
      </div>
    </Tile>
  );
}

// ─── MASTERY tile ────────────────────────────────────────────────────────

interface MasteryTileProps {
  readonly qTags: readonly QTag[];
  onSelect(q: QTag): void;
}

function MasteryTile(props: MasteryTileProps) {
  const { qTags, onSelect } = props;
  return (
    <Tile
      title="MASTERY"
      ariaLabel="Stage mastery per Q-track"
    >
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {qTags.map((q) => (
          <MasteryRow key={q} qTag={q} onClick={() => onSelect(q)} />
        ))}
      </ul>
    </Tile>
  );
}

function MasteryRow({ qTag, onClick }: { qTag: QTag; onClick(): void }) {
  const sp = useStageProgress(qTag);
  const completed = sp.stages.filter((s) => s.completed).length;
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-label={`${qTag}: ${completed} of 6 stages mastered`}
        className="mono tr"
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '32px 1fr 56px',
          alignItems: 'center',
          gap: 'var(--sp-2)',
          padding: '4px 6px',
          background: 'transparent',
          color: 'var(--text-1)',
          border: '1px solid transparent',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: 'var(--fs-code, 14px)',
          textAlign: 'left',
        }}
      >
        <span style={{ color: 'var(--text-0)' }}>{qTag}</span>
        <span
          aria-hidden
          style={{
            color: 'var(--accent-cyan)',
            letterSpacing: 2,
            fontWeight: 700,
          }}
        >
          {sp.stages.map((s) => (s.completed ? '●' : '○')).join('')}
        </span>
        <span
          style={{
            textAlign: 'right',
            color: 'var(--text-0)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {completed}/6
        </span>
      </button>
    </li>
  );
}

// ─── WEAKNESS FILE tile ──────────────────────────────────────────────────

interface WeaknessFileTileProps {
  readonly entries: ReadonlyArray<{
    atomId: string;
    severity: number;
    fails: number;
    familiarity: number;
  }>;
  onDrill(atomId: string): void;
}

function WeaknessFileTile(props: WeaknessFileTileProps) {
  const { entries, onDrill } = props;
  const isEmpty = entries.length === 0;

  return (
    <Tile
      title="WEAKNESS FILE"
      ariaLabel={`Weakness file. ${entries.length} atoms below 50% familiarity.`}
    >
      {isEmpty ? (
        <p
          style={{
            margin: 0,
            color: 'var(--text-2)',
            fontSize: 'var(--fs-prompt, 15px)',
          }}
        >
          No weak atoms — keep drilling to surface gaps.
        </p>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {entries.map((e) => (
            <li
              key={e.atomId}
              className="mono tabular"
              style={{
                display: 'grid',
                gridTemplateColumns: '88px 1fr auto auto auto',
                alignItems: 'center',
                gap: 'var(--sp-3)',
                padding: '4px 6px',
                fontSize: 'var(--fs-code, 14px)',
                borderBottom: '1px dashed var(--border-1)',
              }}
            >
              <span style={{ color: 'var(--accent-cyan)' }}>{e.atomId}</span>
              <span
                style={{
                  color: 'var(--text-1)',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
              >
                familiarity {Math.round(e.familiarity)}%
              </span>
              <span style={{ color: 'var(--accent-pink)' }}>
                ▼{e.severity.toFixed(2)}
              </span>
              <span style={{ color: 'var(--text-2)' }}>
                {e.fails} fails
              </span>
              <button
                type="button"
                onClick={() => onDrill(e.atomId)}
                className="mono tr"
                aria-label={`Drill ${e.atomId} now`}
                style={{
                  padding: '2px 10px',
                  background: 'var(--bg-3)',
                  color: 'var(--text-0)',
                  border: '1px solid var(--border-2)',
                  borderRadius: 3,
                  fontSize: 'var(--fs-micro, 11px)',
                  cursor: 'pointer',
                }}
              >
                drill
              </button>
            </li>
          ))}
        </ul>
      )}
    </Tile>
  );
}

// ─── Reusable primitives ─────────────────────────────────────────────────

interface TileProps {
  readonly title: string;
  readonly ariaLabel: string;
  readonly children: React.ReactNode;
  readonly onClick?: () => void;
  /** Render as <button> for full-tile click. */
  readonly asButton?: boolean;
}

function Tile(props: TileProps) {
  const { title, ariaLabel, children, onClick, asButton } = props;

  const baseStyle: CSSProperties = {
    background: 'var(--bg-1)',
    border: '1px solid var(--border-1)',
    borderRadius: 6,
    padding: 'var(--sp-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--sp-2)',
    minHeight: 160,
    color: 'var(--text-0)',
  };

  const header = (
    <h2
      className="mono"
      style={{
        margin: 0,
        fontSize: 'var(--fs-micro, 11px)',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: 'var(--text-2)',
        fontWeight: 500,
      }}
    >
      {title}
    </h2>
  );

  if (asButton && onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className="tr"
        style={{
          ...baseStyle,
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        {header}
        {children}
      </button>
    );
  }
  return (
    <section aria-label={ariaLabel} style={baseStyle}>
      {header}
      {children}
    </section>
  );
}

function ProgressBar({
  percent,
  ariaLabel,
}: {
  percent: number;
  ariaLabel?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      style={{
        height: 6,
        background: 'var(--bg-3)',
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${clamped}%`,
          height: '100%',
          background: 'var(--accent-cyan)',
          transition: 'width 150ms ease-out',
        }}
      />
    </div>
  );
}

/** ASCII-style block bar e.g. ▰▰▰░░ that scales with the percent. */
function BlockBar({
  percent,
  cells = 5,
}: {
  percent: number;
  cells?: number;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const filled = Math.round((clamped / 100) * cells);
  const blocks = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i < cells; i++) out.push(i < filled ? '▰' : '░');
    return out.join('');
  }, [cells, filled]);
  return (
    <span
      aria-hidden
      style={{
        color: 'var(--accent-cyan)',
        letterSpacing: 1,
        fontFamily: 'var(--font-mono, monospace)',
      }}
    >
      {blocks}
    </span>
  );
}
