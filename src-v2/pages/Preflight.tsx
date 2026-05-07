/**
 * Preflight.tsx — UX-M19 Preflight Check screen.
 *
 * 50-card lightning round across all atoms. Shown T-1 day before test.
 *
 * Flow (3 phases):
 *   1. Briefing  — "T-1 day before test. Run pre-flight check."
 *   2. Drill     — single card full-screen, advance on submit/skip,
 *                  progress bar shows N/50.
 *   3. Result    — per-atom red/yellow/green dots + final gauge:
 *                  ≥90% → "you're ready" (green)
 *                  <90% → "drill these atoms today" (amber/red)
 *
 * The card view defers to the per-card components passed in as
 * `cards` (rendered via the existing card registry pattern).
 *
 * Per RULE 4: this is the LAST screen the student sees before the test.
 * No filler. No spinners. No flake. The verdict is the verdict.
 */

import { useCallback, useMemo, useState } from 'react';
import type { Card } from '../types/card-schema';
import { TraceCard } from '../components/cards/TraceCard';
import { StructWriteCard } from '../components/cards/StructWriteCard';
import { FunctionWriteCard } from '../components/cards/FunctionWriteCard';
import { MainWriteCard } from '../components/cards/MainWriteCard';
import { TemplateRecallCard } from '../components/cards/TemplateRecallCard';

// ─────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────

export interface PreflightProps {
  /** 50 cards — the lightning round deck. */
  cards: Card[];
  /** Drill specific atom ids — used when verdict says "fix these today". */
  onDrillAtoms: (atomIds: string[]) => void;
  /** Bail to home. */
  onAbort: () => void;
}

interface PerAtomResult {
  atomId: string;
  total: number;
  correct: number;
  pct: number;
  band: 'green' | 'amber' | 'red';
}

type Phase = 'brief' | 'drill' | 'done';

// ─────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────

export function Preflight({ cards, onDrillAtoms, onAbort }: PreflightProps) {
  const [phase, setPhase] = useState<Phase>('brief');
  const [idx, setIdx] = useState(0);
  // result tracking: cardIdx -> pass/fail (null = skipped)
  const [results, setResults] = useState<Array<boolean | null>>(() => cards.map(() => null));

  const onCardComplete = useCallback(
    (i: number) => (passed: boolean) => {
      setResults((r) => {
        const out = [...r];
        out[i] = passed;
        return out;
      });
    },
    []
  );

  const advance = useCallback(() => {
    if (idx + 1 < cards.length) {
      setIdx(idx + 1);
    } else {
      setPhase('done');
    }
  }, [idx, cards.length]);

  const skip = useCallback(() => {
    setResults((r) => {
      const out = [...r];
      out[idx] = false;
      return out;
    });
    advance();
  }, [idx, advance]);

  // Aggregate per-atom for the verdict screen.
  const perAtom = useMemo<PerAtomResult[]>(() => {
    const buckets: Record<string, { total: number; correct: number }> = {};
    cards.forEach((c, i) => {
      const r = results[i];
      const b = (buckets[c.atomId] ??= { total: 0, correct: 0 });
      b.total += 1;
      if (r === true) b.correct += 1;
    });
    return Object.entries(buckets)
      .map(([atomId, { total, correct }]) => {
        const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
        const band: 'green' | 'amber' | 'red' =
          pct >= 85 ? 'green' : pct >= 50 ? 'amber' : 'red';
        return { atomId, total, correct, pct, band };
      })
      .sort((a, b) => a.pct - b.pct);
  }, [cards, results]);

  const totalCorrect = useMemo(() => results.filter((r) => r === true).length, [results]);
  const totalAnswered = useMemo(() => results.filter((r) => r !== null).length, [results]);
  const overallPct = cards.length === 0 ? 0 : Math.round((totalCorrect / cards.length) * 100);
  const passed = overallPct >= 90;

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div style={{ height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr', background: 'var(--bg-0)', color: 'var(--text-0)' }}>
      <Header phase={phase} idx={idx} total={cards.length} onAbort={onAbort} />
      <div style={{ overflow: 'auto' }}>
        {phase === 'brief' && (
          <Brief cardCount={cards.length} onStart={() => setPhase('drill')} />
        )}
        {phase === 'drill' && cards[idx] && (
          <DrillView
            card={cards[idx]!}
            cardIdx={idx}
            total={cards.length}
            onComplete={(p) => { onCardComplete(idx)(p); }}
            onAdvance={advance}
            onSkip={skip}
          />
        )}
        {phase === 'done' && (
          <Verdict
            overallPct={overallPct}
            totalCorrect={totalCorrect}
            totalAnswered={totalAnswered}
            cardCount={cards.length}
            passed={passed}
            perAtom={perAtom}
            onDrillRed={() => onDrillAtoms(perAtom.filter((p) => p.band !== 'green').map((p) => p.atomId))}
            onAbort={onAbort}
          />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────────

function Header({ phase, idx, total, onAbort }: { phase: Phase; idx: number; total: number; onAbort: () => void }) {
  const progress = phase === 'drill' ? Math.round(((idx) / total) * 100) : phase === 'done' ? 100 : 0;
  return (
    <header
      className="mono"
      style={{
        padding: '12px 20px',
        borderBottom: '1px solid var(--border-1)',
        background: 'var(--bg-1)',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 16,
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          aria-hidden
          style={{
            width: 22, height: 22, borderRadius: 4,
            background: 'var(--accent-yel)',
            display: 'grid', placeItems: 'center',
            color: 'var(--bg-0)', fontWeight: 700, fontSize: 11,
          }}
        >
          P
        </div>
        <h2 style={{ margin: 0, fontSize: 14, color: 'var(--text-0)' }}>Preflight</h2>
        <span style={{ color: 'var(--text-2)' }}>·</span>
        <span style={{ color: 'var(--text-1)', fontSize: 12 }}>
          {phase === 'brief' && 'briefing'}
          {phase === 'drill' && `${idx + 1} / ${total}`}
          {phase === 'done' && 'verdict'}
        </span>
      </div>
      {/* Progress bar */}
      <div style={{ height: 4, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden', maxWidth: 480 }}>
        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-cyan)', transition: 'width 200ms ease-out' }} />
      </div>
      <button
        type="button"
        onClick={onAbort}
        style={{
          padding: '6px 12px',
          background: 'transparent',
          color: 'var(--text-1)',
          border: '1px solid var(--border-1)',
          borderRadius: 4,
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
        }}
      >
        Exit
      </button>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Brief
// ─────────────────────────────────────────────────────────────────────

function Brief({ cardCount, onStart }: { cardCount: number; onStart: () => void }) {
  return (
    <div
      className="mono"
      style={{
        display: 'grid',
        placeItems: 'center',
        padding: '60px 20px',
        height: '100%',
      }}
    >
      <div style={{ maxWidth: 540, textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 8, color: 'var(--accent-yel)' }}>T-1</div>
        <h2 style={{ margin: 0, fontSize: 22, color: 'var(--text-0)' }}>One day before test.</h2>
        <p style={{ marginTop: 16, color: 'var(--text-1)', fontSize: 14, lineHeight: 1.6 }}>
          Run the pre-flight check: {cardCount} cards across all atoms.
          One pass each. Skip if you're stuck — the verdict tells you what
          to drill today.
        </p>
        <p style={{ marginTop: 8, color: 'var(--text-2)', fontSize: 12, lineHeight: 1.6 }}>
          Pass: ≥90% green → you're ready.
          Fail: drill the red/amber atoms today.
        </p>
        <button
          type="button"
          onClick={onStart}
          autoFocus
          style={{
            marginTop: 28,
            padding: '12px 24px',
            background: 'var(--accent-cyan)',
            color: 'var(--bg-0)',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          Start preflight →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// DrillView — single full-screen card, advance/skip controls.
// ─────────────────────────────────────────────────────────────────────

function DrillView(props: {
  card: Card;
  cardIdx: number;
  total: number;
  onComplete: (passed: boolean) => void;
  onAdvance: () => void;
  onSkip: () => void;
}) {
  const { card } = props;

  const renderedCard = useMemo(() => {
    switch (card.type) {
      case 'TraceCard':         return <TraceCard card={card} onComplete={props.onComplete} />;
      case 'StructWriteCard':   return <StructWriteCard card={card} onComplete={props.onComplete} />;
      case 'FunctionWriteCard': return <FunctionWriteCard card={card} onComplete={props.onComplete} />;
      case 'MainWriteCard':     return <MainWriteCard card={card} onComplete={props.onComplete} />;
      case 'TemplateRecallCard':return <TemplateRecallCard card={card} onComplete={props.onComplete} mode="all-at-once" />;
      default:
        return (
          <FallbackCard card={card} onPass={() => props.onComplete(true)} onFail={() => props.onComplete(false)} />
        );
    }
  }, [card, props.onComplete]);

  return (
    <div style={{ padding: 16, display: 'grid', gridTemplateRows: '1fr auto', gap: 12, height: '100%' }}>
      <div style={{ overflow: 'auto' }}>{renderedCard}</div>
      <div
        className="mono"
        style={{
          display: 'flex',
          gap: 8,
          justifyContent: 'flex-end',
          padding: 12,
          background: 'var(--bg-1)',
          border: '1px solid var(--border-1)',
          borderRadius: 6,
        }}
      >
        <span style={{ color: 'var(--text-2)', fontSize: 11, alignSelf: 'center', flex: 1 }}>
          card {card.id} · {card.atomId}
        </span>
        <button type="button" onClick={props.onSkip} style={skipBtn}>Skip</button>
        <button type="button" onClick={props.onAdvance} style={nextBtn}>Next →</button>
      </div>
    </div>
  );
}

function FallbackCard({ card, onPass, onFail }: { card: Card; onPass: () => void; onFail: () => void }) {
  return (
    <div
      className="mono"
      style={{
        padding: 24,
        background: 'var(--bg-1)',
        border: '1px solid var(--border-1)',
        borderRadius: 6,
      }}
    >
      <div style={{ color: 'var(--text-2)', fontSize: 11, marginBottom: 8 }}>
        {card.type} (no full renderer in preflight) · {card.id}
      </div>
      <p style={{ color: 'var(--text-0)', fontSize: 13, lineHeight: 1.6 }}>{card.stem}</p>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button type="button" onClick={onFail} style={skipBtn}>Mark fail</button>
        <button type="button" onClick={onPass} style={nextBtn}>Mark pass</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Verdict
// ─────────────────────────────────────────────────────────────────────

function Verdict(props: {
  overallPct: number;
  totalCorrect: number;
  totalAnswered: number;
  cardCount: number;
  passed: boolean;
  perAtom: PerAtomResult[];
  onDrillRed: () => void;
  onAbort: () => void;
}) {
  const { overallPct, totalCorrect, cardCount, passed, perAtom, onDrillRed, onAbort } = props;
  const verdictColor = passed ? 'var(--state-ok)' : overallPct >= 70 ? 'var(--state-warn)' : 'var(--state-err)';
  const verdictText = passed ? "You're ready." : 'Drill these atoms today.';
  const subtext = passed
    ? 'All systems green. Get sleep tonight, not more cards.'
    : 'The red and amber atoms below are exam-day liabilities. Hit them now.';

  const reds = perAtom.filter((p) => p.band !== 'green');

  return (
    <div className="mono" style={{ padding: '32px 28px', maxWidth: 920, margin: '0 auto' }}>
      {/* Gauge */}
      <div
        style={{
          padding: 20,
          background: 'var(--bg-1)',
          border: `2px solid ${verdictColor}`,
          borderRadius: 8,
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          gap: 24,
          alignItems: 'center',
        }}
      >
        <Gauge pct={overallPct} color={verdictColor} />
        <div>
          <div style={{ fontSize: 22, color: verdictColor, fontWeight: 700 }}>{verdictText}</div>
          <div style={{ marginTop: 6, color: 'var(--text-1)', fontSize: 13, lineHeight: 1.5 }}>{subtext}</div>
          <div style={{ marginTop: 6, color: 'var(--text-2)', fontSize: 11 }}>
            {totalCorrect} / {cardCount} correct · {perAtom.length} atoms covered
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {reds.length > 0 && (
            <button
              type="button"
              onClick={onDrillRed}
              style={{
                padding: '10px 16px',
                background: 'var(--state-warn)',
                color: 'var(--bg-0)',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Drill {reds.length} atoms →
            </button>
          )}
          <button
            type="button"
            onClick={onAbort}
            style={{
              padding: '10px 16px',
              background: 'transparent',
              color: 'var(--text-1)',
              border: '1px solid var(--border-1)',
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
            }}
          >
            Done
          </button>
        </div>
      </div>

      {/* Per-atom band grid */}
      <h3 style={{ marginTop: 24, marginBottom: 8, fontSize: 13, color: 'var(--text-1)' }}>per-atom verdict</h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: 8,
        }}
      >
        {perAtom.map((p) => {
          const c = p.band === 'green' ? 'var(--state-ok)' : p.band === 'amber' ? 'var(--state-warn)' : 'var(--state-err)';
          return (
            <div
              key={p.atomId}
              title={`${p.atomId} — ${p.correct}/${p.total} correct`}
              style={{
                padding: 10,
                background: 'var(--bg-1)',
                border: `1px solid ${c}`,
                borderRadius: 4,
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
              <span style={{ flex: 1, fontSize: 12, color: 'var(--text-0)' }}>{p.atomId}</span>
              <span style={{ fontSize: 11, color: c, fontVariantNumeric: 'tabular-nums' }}>{p.pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Gauge({ pct, color }: { pct: number; color: string }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <svg width={120} height={120} viewBox="0 0 120 120" aria-label={`Score ${pct} percent`}>
      <circle cx={60} cy={60} r={r} stroke="var(--bg-3)" strokeWidth={10} fill="none" />
      <circle
        cx={60} cy={60} r={r}
        stroke={color}
        strokeWidth={10}
        fill="none"
        strokeDasharray={`${dash} ${c}`}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
        style={{ transition: 'stroke-dasharray 400ms ease-out' }}
      />
      <text x={60} y={66} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={24} fontWeight={700} fill={color}>
        {pct}%
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Local button styles
// ─────────────────────────────────────────────────────────────────────

const nextBtn: React.CSSProperties = {
  padding: '8px 16px',
  background: 'var(--accent-cyan)',
  color: 'var(--bg-0)',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  fontWeight: 600,
};

const skipBtn: React.CSSProperties = {
  padding: '8px 16px',
  background: 'transparent',
  color: 'var(--text-1)',
  border: '1px solid var(--border-1)',
  borderRadius: 4,
  cursor: 'pointer',
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
};

export default Preflight;
