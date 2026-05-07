/**
 * Session.tsx — daily-deck drill loop.
 *
 * Mounted by App.tsx at /session. Reads useTodayDeck() from session-store,
 * iterates cards one at a time using CardRenderer. On each card complete,
 * calls useSession().recordResultAction(cardId, correct) — this is the
 * single critical wire that lets familiarity actually rise during a study
 * session. Without it, every other engine (composer / weakness / mastery)
 * sees frozen state.
 *
 * Layout:
 *   ┌─ Drill — N / total · Q1 · F-04 ──────────── 38% familiar  ─┐
 *   │ ▰▰▰░░░░░░ progress                                          │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │                  <CardRenderer card=... />                   │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │ [Pause]                                          [Skip card] │
 *   └──────────────────────────────────────────────────────────────┘
 *
 * Per RULE 4: app must actually work — student answers cards, familiarity
 * rises, deck composer responds on next /session entry.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CardRenderer } from '../components/CardRenderer';
import {
  useFamiliarity,
  useSession,
  useTodayDeck,
} from '../lib/session-store';
import type { Card, QTag } from '../types/card-schema';

export interface SessionProps {
  /** Optional pinned card filter (set by Track / Weakness drill payloads). */
  readonly pinnedCardIds?: ReadonlyArray<string>;
  /** Optional pinned atom filter (set by Atoms / Postmortem drill payloads). */
  readonly pinnedAtomIds?: ReadonlyArray<string>;
  /** Optional Q-track filter (when drilled from a specific Q track). */
  readonly initialQ?: QTag;
  /** Called when student exits via Pause or finishes the deck. */
  onExit?: (summary: { seen: number; correct: number; total: number }) => void;
}

export function Session(props: SessionProps) {
  const { pinnedCardIds, pinnedAtomIds, initialQ, onExit } = props;
  const { recordResultAction } = useSession();

  const fullDeck = useTodayDeck(47);

  // If a drill payload is present, restrict deck to those cards/atoms only.
  // Otherwise use the daily deck as-is.
  const deck: ReadonlyArray<Card> = useMemo(() => {
    if (pinnedCardIds && pinnedCardIds.length > 0) {
      const set = new Set(pinnedCardIds);
      const filtered = fullDeck.filter((c) => set.has(c.id));
      return filtered.length > 0 ? filtered : fullDeck;
    }
    if (pinnedAtomIds && pinnedAtomIds.length > 0) {
      const set = new Set(pinnedAtomIds);
      const filtered = fullDeck.filter((c) => set.has(c.atomId));
      return filtered.length > 0 ? filtered : fullDeck;
    }
    if (initialQ) {
      const filtered = fullDeck.filter((c) => c.qTags.includes(initialQ));
      return filtered.length > 0 ? filtered : fullDeck;
    }
    return fullDeck;
  }, [fullDeck, pinnedCardIds, pinnedAtomIds, initialQ]);

  const [index, setIndex] = useState(0);
  const [seen, setSeen] = useState(0);
  const [correct, setCorrect] = useState(0);

  // If the deck shrinks (e.g. after a payload arrives), clamp the index.
  useEffect(() => {
    if (index >= deck.length) setIndex(0);
  }, [deck.length, index]);

  const current: Card | undefined = deck[index];

  // Familiarity gauge — pick the Q-tag of the current card; default Q1.
  const gaugeQ: QTag = current?.qTags[0] ?? initialQ ?? 'Q1';
  const fam = useFamiliarity(gaugeQ);

  const handleComplete = useCallback(
    (cardCorrect: boolean) => {
      if (!current) return;
      recordResultAction(current.id, cardCorrect);
      setSeen((s) => s + 1);
      if (cardCorrect) setCorrect((c) => c + 1);

      if (index + 1 >= deck.length) {
        // Deck exhausted — exit with summary.
        onExit?.({
          seen: seen + 1,
          correct: cardCorrect ? correct + 1 : correct,
          total: deck.length,
        });
        return;
      }
      setIndex((i) => i + 1);
    },
    [current, recordResultAction, index, deck.length, onExit, seen, correct],
  );

  const handlePause = useCallback(() => {
    onExit?.({ seen, correct, total: deck.length });
  }, [onExit, seen, correct, deck.length]);

  const handleSkip = useCallback(() => {
    if (!current) return;
    // Skip = treat as exposure-but-incorrect so we don't mistakenly mark
    // the card familiar; engines will resurface it next composition.
    recordResultAction(current.id, false);
    setSeen((s) => s + 1);
    if (index + 1 >= deck.length) {
      onExit?.({ seen: seen + 1, correct, total: deck.length });
      return;
    }
    setIndex((i) => i + 1);
  }, [current, recordResultAction, index, deck.length, onExit, seen, correct]);

  if (deck.length === 0) {
    return (
      <div
        className="mono"
        style={{
          padding: 'var(--sp-4)',
          color: 'var(--text-1)',
          fontSize: 'var(--fs-prompt, 15px)',
        }}
      >
        <h2 style={{ fontSize: 16, color: 'var(--text-0)', marginBottom: 12 }}>
          Today's deck is empty.
        </h2>
        <p>
          No cards available for this session. Try a Mock or pick a Q-track
          from the Home screen.
        </p>
        <button
          type="button"
          onClick={() => onExit?.({ seen: 0, correct: 0, total: 0 })}
          style={{
            marginTop: 12,
            padding: '8px 14px',
            background: 'var(--bg-2)',
            color: 'var(--text-1)',
            border: '1px solid var(--border-1)',
            borderRadius: 4,
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          ← Home
        </button>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="mono" style={{ padding: 'var(--sp-4)' }}>
        Loading next card …
      </div>
    );
  }

  const progressPct = deck.length === 0 ? 0 : Math.round(((index) / deck.length) * 100);

  return (
    <div
      role="region"
      aria-label="Study session"
      style={{
        padding: 'var(--sp-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-3)',
        minHeight: '100%',
      }}
    >
      {/* ─── Header: progress + familiarity ───────────────────── */}
      <header
        className="mono"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--sp-3)',
          fontSize: 'var(--fs-code, 14px)',
        }}
      >
        <span style={{ color: 'var(--text-0)', fontWeight: 600 }}>
          DRILL · {index + 1} / {deck.length}
        </span>
        <span style={{ color: 'var(--text-2)' }}>·</span>
        <span style={{ color: 'var(--accent-cyan)' }}>{gaugeQ}</span>
        <span style={{ color: 'var(--text-2)' }}>·</span>
        <span style={{ color: 'var(--accent-cyan)' }}>{current.atomId}</span>
        <span style={{ color: 'var(--text-2)' }}>·</span>
        <span style={{ color: 'var(--text-1)' }}>
          {humanType(current.type)}
        </span>
        <span style={{ flex: 1 }} />
        <FamiliarityGauge percent={fam.percent} label={`${gaugeQ} familiarity`} />
      </header>

      {/* ─── Progress bar ──────────────────────────────────────── */}
      <div
        role="progressbar"
        aria-valuenow={progressPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Session progress"
        style={{
          height: 6,
          background: 'var(--bg-3)',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progressPct}%`,
            height: '100%',
            background: 'var(--accent-cyan)',
            transition: 'width 150ms ease-out',
          }}
        />
      </div>

      {/* ─── Card ──────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          minHeight: 320,
          background: 'var(--bg-1)',
          border: '1px solid var(--border-1)',
          borderRadius: 6,
          padding: 'var(--sp-3)',
          overflow: 'auto',
        }}
      >
        <CardRenderer
          key={current.id /* force remount on index change */}
          card={current}
          onComplete={handleComplete}
        />
      </div>

      {/* ─── Footer controls ───────────────────────────────────── */}
      <footer
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--sp-2)',
        }}
      >
        <button
          type="button"
          onClick={handlePause}
          aria-label="Pause session and return to home"
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
          ← Pause
        </button>
        <span
          className="mono"
          style={{
            color: 'var(--text-2)',
            fontSize: 'var(--fs-micro, 11px)',
          }}
        >
          {seen} seen · {correct} correct
        </span>
        <span style={{ flex: 1 }} />
        <button
          type="button"
          onClick={handleSkip}
          aria-label="Skip current card (counts as a fail)"
          className="mono tr"
          style={{
            padding: '6px 14px',
            background: 'transparent',
            border: '1px dashed var(--border-2)',
            color: 'var(--accent-org)',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 'var(--fs-code, 14px)',
          }}
        >
          Skip card
        </button>
      </footer>
    </div>
  );
}

export default Session;

// ─── Helpers ─────────────────────────────────────────────────────────────

function humanType(t: string): string {
  return t.replace(/Card$/i, '').toLowerCase();
}

function FamiliarityGauge({
  percent,
  label,
}: {
  percent: number;
  label: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <span
      role="img"
      aria-label={`${label}: ${Math.round(clamped)} percent`}
      className="mono tabular"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        background: 'var(--bg-2)',
        border: '1px solid var(--border-1)',
        borderRadius: 4,
        color: 'var(--text-0)',
        fontSize: 'var(--fs-code, 14px)',
      }}
    >
      <span style={{ color: 'var(--text-2)' }}>fam</span>
      <span>{Math.round(clamped)}%</span>
    </span>
  );
}
