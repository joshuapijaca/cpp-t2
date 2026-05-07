/**
 * Track.tsx — UX-M04 per-Q track view.
 *
 * Layout (per docs/18 §UX-M04):
 *
 *   ┌─ Q1 / Q2 / Q3 / Q4 tabs (top-left) ─ familiarity ring (top-right) ─┐
 *   │                                                                    │
 *   │  ┌─ ATOM DAG ──────────┐  ┌─ DRILL LIST ────────────────────────┐  │
 *   │  │ F-01 ●─────● F-04   │  │ today's deck (filtered to Q-track)  │  │
 *   │  │   │           │     │  │   trace · F-04 · for-loop sum       │  │
 *   │  │ F-02 ●     F-05 ●   │  │   write · F-05 · struct sale        │  │
 *   │  │   │       /         │  │   ...                                │  │
 *   │  │ F-03 ●---●           │  │                                     │  │
 *   │  └─────────────────────┘  └─────────────────────────────────────┘  │
 *   │                                                                    │
 *   │  Stage progression: S1 ✓  S2 ✓  S3 ▶  S4 🔒  S5 🔒  S6 🔒          │
 *   │                                                                    │
 *   │  [Skip stage with cost warning]  → opens dialog                    │
 *   └────────────────────────────────────────────────────────────────────┘
 *
 * Keyboard:
 *   1-4 → switch Q-tab (Q1..Q4)
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';
import type { QTag } from '../types/card-schema';
import {
  useFamiliarity,
  useSession,
  useStageProgress,
  useTodayDeck,
} from '../lib/session-store';
import {
  PROMOTION_THRESHOLDS,
  type Stage,
} from '../engines/stage-gate';
import { getAtomFamiliarity } from '../engines/exposure-counter';

// ─── Public API ──────────────────────────────────────────────────────────

export interface TrackProps {
  /** Initial Q-track. Default Q1. */
  readonly initialQ?: QTag;
  /** Optional controlled Q-tag. If supplied, internal state is ignored. */
  readonly qTag?: QTag;
  /** Called when a tab change happens. */
  onTabChange?: (q: QTag) => void;
  /** Called when student picks a card from the drill list. */
  onPickCard?: (cardId: string) => void;
  /** Called when student confirms a manual stage skip (after cost-warning). */
  onConfirmSkip?: (q: QTag, from: Stage, to: Stage) => void;
}

const Q_TAGS: readonly QTag[] = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

// ─── Component ───────────────────────────────────────────────────────────

export function Track(props: TrackProps) {
  const {
    initialQ = 'Q1',
    qTag,
    onTabChange,
    onPickCard,
    onConfirmSkip,
  } = props;

  const [internalQ, setInternalQ] = useState<QTag>(initialQ);
  const activeQ = qTag ?? internalQ;

  const setQ = useCallback(
    (q: QTag) => {
      if (qTag === undefined) setInternalQ(q);
      onTabChange?.(q);
    },
    [qTag, onTabChange]
  );

  // Keyboard shortcut: 1-4 selects Q-tab. Avoid hijacking input fields.
  useEffect(() => {
    function isTypingTarget(t: EventTarget | null): boolean {
      if (!(t instanceof HTMLElement)) return false;
      const tag = t.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
      if (t.isContentEditable) return true;
      return false;
    }

    function onKey(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const idx = ['1', '2', '3', '4'].indexOf(e.key);
      if (idx >= 0) {
        e.preventDefault();
        setQ(Q_TAGS[idx]!);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setQ]);

  const fam = useFamiliarity(activeQ);
  const stageProg = useStageProgress(activeQ);

  const fullDeck = useTodayDeck(120);
  const trackDeck = useMemo(
    () => fullDeck.filter((c) => c.qTags.includes(activeQ)),
    [fullDeck, activeQ]
  );

  const { state } = useSession();
  const atomNodes = useMemo(() => {
    return fam.atoms.map((atomId) => {
      const f = getAtomFamiliarity(state, atomId);
      return { atomId, percent: f.percent };
    });
  }, [fam.atoms, state]);

  // Skip-stage dialog state
  const [skipDialog, setSkipDialog] = useState<{
    from: Stage;
    to: Stage;
    warning: string;
  } | null>(null);

  const openSkip = useCallback(() => {
    const from = stageProg.currentStage;
    if (from >= 6) return;
    const to = (from + 1) as Stage;
    const result = stageProg.manualSkip(to);
    if (result.allowed) {
      setSkipDialog({ from, to, warning: result.costWarning });
    }
  }, [stageProg]);

  const confirmSkip = useCallback(() => {
    if (!skipDialog) return;
    onConfirmSkip?.(activeQ, skipDialog.from, skipDialog.to);
    setSkipDialog(null);
  }, [skipDialog, activeQ, onConfirmSkip]);

  return (
    <div
      role="region"
      aria-label={`Track ${activeQ}`}
      style={{
        padding: 'var(--sp-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-3)',
        minHeight: '100%',
      }}
    >
      {/* Tab row + ring */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--sp-3)',
        }}
      >
        <QTabBar activeQ={activeQ} onSelect={setQ} />
        <span style={{ flex: 1 }} />
        <ProgressRing
          percent={fam.percent}
          label={`${activeQ} familiarity`}
          size={72}
        />
      </header>

      {/* Stage progression */}
      <StageBar
        stages={stageProg.stages}
        currentStage={stageProg.currentStage}
      />

      {/* 2-pane: DAG + drill list */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
          gap: 'var(--sp-3)',
          flex: 1,
          minHeight: 320,
        }}
      >
        <AtomDAG nodes={atomNodes} />
        <DrillList
          cards={trackDeck.map((c) => ({
            id: c.id,
            type: c.type,
            atomId: c.atomId,
            stage: c.stage,
            stem: c.stem,
          }))}
          qTag={activeQ}
          onPick={(id) => onPickCard?.(id)}
        />
      </div>

      {/* Skip stage button */}
      <div>
        <button
          type="button"
          onClick={openSkip}
          disabled={stageProg.currentStage >= 6}
          aria-label="Skip current stage with cost warning"
          className="mono tr"
          style={{
            padding: '6px 12px',
            background: 'transparent',
            color:
              stageProg.currentStage >= 6
                ? 'var(--text-2)'
                : 'var(--accent-org)',
            border: '1px dashed var(--border-2)',
            borderRadius: 4,
            fontSize: 'var(--fs-code, 14px)',
            cursor:
              stageProg.currentStage >= 6 ? 'not-allowed' : 'pointer',
          }}
        >
          {stageProg.currentStage >= 6
            ? 'no stages left to skip'
            : `Skip S${stageProg.currentStage} → S${stageProg.currentStage + 1}`}
        </button>
      </div>

      {/* Skip-stage cost-warning dialog */}
      {skipDialog && (
        <SkipDialog
          warning={skipDialog.warning}
          onConfirm={confirmSkip}
          onCancel={() => setSkipDialog(null)}
        />
      )}
    </div>
  );
}

export default Track;

// ─── Q-tab bar ───────────────────────────────────────────────────────────

function QTabBar({
  activeQ,
  onSelect,
}: {
  activeQ: QTag;
  onSelect(q: QTag): void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Q-track"
      style={{
        display: 'inline-flex',
        gap: 4,
        padding: 4,
        background: 'var(--bg-1)',
        border: '1px solid var(--border-1)',
        borderRadius: 6,
      }}
    >
      {Q_TAGS.map((q, i) => {
        const active = q === activeQ;
        return (
          <button
            key={q}
            role="tab"
            type="button"
            aria-selected={active}
            aria-controls={`track-panel-${q}`}
            id={`track-tab-${q}`}
            onClick={() => onSelect(q)}
            title={`${q} (press ${i + 1})`}
            className="mono tr"
            style={{
              padding: '4px 14px',
              background: active ? 'var(--bg-3)' : 'transparent',
              color: active ? 'var(--text-0)' : 'var(--text-1)',
              border: '1px solid',
              borderColor: active ? 'var(--border-2)' : 'transparent',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 'var(--fs-code, 14px)',
            }}
          >
            {q}
            <span
              aria-hidden
              style={{
                marginLeft: 6,
                color: 'var(--text-2)',
                fontSize: 'var(--fs-micro, 11px)',
              }}
            >
              {i + 1}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Stage progression bar ───────────────────────────────────────────────

interface StageRow {
  stage: Stage;
  accuracy: number;
  threshold: number;
  completed: boolean;
  locked: boolean;
}

function StageBar({
  stages,
  currentStage,
}: {
  stages: ReadonlyArray<StageRow>;
  currentStage: Stage;
}) {
  return (
    <ol
      aria-label="Stage progression"
      className="mono"
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 'var(--sp-2) var(--sp-3)',
        display: 'flex',
        gap: 'var(--sp-3)',
        background: 'var(--bg-1)',
        border: '1px solid var(--border-1)',
        borderRadius: 6,
      }}
    >
      {stages.map((s) => {
        const isCurrent = s.stage === currentStage;
        const symbol = s.completed
          ? '✓'
          : s.locked
            ? '🔒'
            : isCurrent
              ? '▶'
              : '·';
        const color = s.completed
          ? 'var(--accent-grn)'
          : s.locked
            ? 'var(--text-2)'
            : isCurrent
              ? 'var(--accent-cyan)'
              : 'var(--text-1)';
        return (
          <li
            key={s.stage}
            aria-current={isCurrent ? 'step' : undefined}
            aria-label={`Stage ${s.stage}: ${s.completed ? 'complete' : s.locked ? 'locked' : isCurrent ? 'in progress' : 'pending'} (${s.accuracy}/${s.threshold}%)`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 'var(--fs-code, 14px)',
              color,
              fontWeight: isCurrent ? 600 : 400,
            }}
          >
            <span style={{ color: 'var(--text-1)' }}>S{s.stage}</span>
            <span aria-hidden>{symbol}</span>
            {isCurrent && (
              <span
                style={{ color: 'var(--text-2)', fontSize: 11 }}
                aria-hidden
              >
                {s.accuracy}/{s.threshold}%
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ─── Atom DAG (left pane) ────────────────────────────────────────────────

function AtomDAG({
  nodes,
}: {
  nodes: ReadonlyArray<{ atomId: string; percent: number }>;
}) {
  return (
    <section
      aria-label="Atom DAG"
      style={{
        background: 'var(--bg-1)',
        border: '1px solid var(--border-1)',
        borderRadius: 6,
        padding: 'var(--sp-3)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-2)',
        overflow: 'auto',
      }}
    >
      <h3
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
        Atom DAG
      </h3>

      {nodes.length === 0 ? (
        <p
          style={{
            margin: 0,
            color: 'var(--text-2)',
            fontSize: 'var(--fs-prompt, 15px)',
          }}
        >
          No atoms registered for this Q-track yet.
        </p>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 'var(--sp-2)',
          }}
        >
          {nodes.map((n) => (
            <li key={n.atomId}>
              <div
                role="button"
                tabIndex={0}
                aria-label={`${n.atomId}: ${Math.round(n.percent)}% familiar`}
                className="mono tr"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  padding: '6px 8px',
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border-1)',
                  borderLeft: `3px solid ${atomDotColor(n.percent)}`,
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 'var(--fs-code, 14px)',
                }}
              >
                <span style={{ color: 'var(--accent-cyan)' }}>{n.atomId}</span>
                <span
                  style={{
                    color: 'var(--text-2)',
                    fontSize: 11,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {Math.round(n.percent)}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function atomDotColor(percent: number): string {
  if (percent >= 80) return 'var(--accent-grn)';
  if (percent >= 50) return 'var(--accent-yel)';
  if (percent >= 20) return 'var(--accent-org)';
  return 'var(--accent-pink)';
}

// ─── Drill list (right pane) ─────────────────────────────────────────────

function DrillList({
  cards,
  qTag,
  onPick,
}: {
  cards: ReadonlyArray<{
    id: string;
    type: string;
    atomId: string;
    stage: number;
    stem: string;
  }>;
  qTag: QTag;
  onPick(id: string): void;
}) {
  return (
    <section
      id={`track-panel-${qTag}`}
      role="tabpanel"
      aria-labelledby={`track-tab-${qTag}`}
      style={{
        background: 'var(--bg-1)',
        border: '1px solid var(--border-1)',
        borderRadius: 6,
        padding: 'var(--sp-3)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-2)',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
        }}
      >
        <h3
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
          today's deck · {qTag}
        </h3>
        <span
          className="mono"
          style={{
            fontSize: 'var(--fs-micro, 11px)',
            color: 'var(--text-1)',
          }}
        >
          {cards.length} cards
        </span>
      </header>

      <ul
        aria-label={`Drill cards for ${qTag}`}
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          overflow: 'auto',
          maxHeight: 360,
        }}
      >
        {cards.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onPick(c.id)}
              aria-label={`${c.type} card on atom ${c.atomId}, stage ${c.stage}: ${c.stem}`}
              className="mono tr"
              style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '60px 80px 1fr',
                alignItems: 'center',
                gap: 'var(--sp-2)',
                padding: '6px 8px',
                background: 'transparent',
                color: 'var(--text-1)',
                border: '1px solid transparent',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 'var(--fs-code, 14px)',
                textAlign: 'left',
              }}
            >
              <span style={{ color: 'var(--accent-yel)' }}>S{c.stage}</span>
              <span style={{ color: 'var(--accent-cyan)' }}>{c.atomId}</span>
              <span
                style={{
                  color: 'var(--text-0)',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                }}
              >
                {humanType(c.type)} · {c.stem}
              </span>
            </button>
          </li>
        ))}
        {cards.length === 0 && (
          <li>
            <p
              style={{
                margin: 0,
                color: 'var(--text-2)',
                fontSize: 'var(--fs-prompt, 15px)',
              }}
            >
              No cards queued for {qTag} today.
            </p>
          </li>
        )}
      </ul>
    </section>
  );
}

function humanType(t: string): string {
  return t.replace(/Card$/i, '').toLowerCase();
}

// ─── Progress ring ───────────────────────────────────────────────────────

function ProgressRing({
  percent,
  size = 72,
  label,
}: {
  percent: number;
  size?: number;
  label?: string;
}) {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const dash = (clamped / 100) * c;

  return (
    <div
      role="img"
      aria-label={`${label ?? 'progress'}: ${Math.round(clamped)} percent`}
      style={{ position: 'relative', width: size, height: size }}
    >
      <svg width={size} height={size} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--bg-3)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--accent-cyan)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash} ${c - dash}`}
          strokeDashoffset={c / 4}
          strokeLinecap="round"
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
            transition: 'stroke-dasharray 200ms ease-out',
          }}
        />
      </svg>
      <span
        className="mono tabular"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          color: 'var(--text-0)',
          fontSize: 'var(--fs-prompt, 15px)',
          fontWeight: 600,
        }}
      >
        {Math.round(clamped)}%
      </span>
    </div>
  );
}

// ─── Skip-stage dialog ───────────────────────────────────────────────────

function SkipDialog({
  warning,
  onConfirm,
  onCancel,
}: {
  warning: string;
  onConfirm(): void;
  onCancel(): void;
}) {
  const overlay: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    display: 'grid',
    placeItems: 'center',
    zIndex: 60,
  };
  const dialog: CSSProperties = {
    width: 'min(520px, 90vw)',
    background: 'var(--bg-2)',
    border: '1px solid var(--border-2)',
    borderRadius: 6,
    padding: 'var(--sp-4)',
    boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
  };
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Skip stage cost warning"
      style={overlay}
      onClick={onCancel}
    >
      <div onClick={(e) => e.stopPropagation()} style={dialog}>
        <h2
          className="mono"
          style={{
            margin: 0,
            fontSize: 'var(--fs-h3, 16px)',
            color: 'var(--accent-org)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Skip stage — cost warning
        </h2>
        <p
          style={{
            margin: 'var(--sp-3) 0',
            color: 'var(--text-1)',
            fontSize: 'var(--fs-prompt, 15px)',
            lineHeight: 1.5,
          }}
        >
          {warning}
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--sp-2)',
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            className="mono tr"
            style={{
              padding: '6px 14px',
              background: 'transparent',
              border: '1px solid var(--border-1)',
              color: 'var(--text-1)',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 'var(--fs-code, 14px)',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="mono tr"
            style={{
              padding: '6px 14px',
              background: 'var(--accent-org)',
              border: '1px solid var(--accent-org)',
              color: 'var(--bg-0)',
              fontWeight: 600,
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 'var(--fs-code, 14px)',
            }}
          >
            Skip anyway
          </button>
        </div>
      </div>
    </div>
  );
}

/** Re-exported in case callers want raw thresholds. */
export { PROMOTION_THRESHOLDS };
