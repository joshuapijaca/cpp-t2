/**
 * Sequence.tsx — v2.2 minimalist linear card walker (renamed from Session).
 *
 * Per docs/v2/MANIFEST.md: Sequence is one of exactly 2 pages. Mounted by
 * App.tsx at /sequence/:level. Reads cards filtered by `level` from
 * session-store, walks them forward-only via CardRenderer, calls
 * recordResultAction on each completion.
 *
 * Behaviour matches v1 src/pages/Sequence.tsx:
 *   - One card at a time (no batching, no SRS, no smart selection).
 *   - On submit/correct → record + advance.
 *   - On submit/wrong → stay on card; CardRenderer's own retry-once flow
 *     (per card-component contract) handles the in-card retry. Sequence
 *     itself adds an outer Retry button that force-remounts the card so
 *     the student can replay it from scratch.
 *   - Forward-only: no Prev button.
 *   - Auto-advance at end of module → empty-state with [home] button.
 *   - Header: `L · atom-id · type · {position}/{total}`.
 *
 * Per ANTI_DRIFT.md: no Pause-with-summary, no Skip-card, no familiarity
 * gauge, no drill payloads. Those were drift in v2.1 and have been
 * removed. Outer name `Session` is kept as the export so App.tsx's
 * `import { Session as Sequence }` alias keeps working until A6 renames
 * the import.
 */

import { useCallback, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { CardRenderer } from '../components/CardRenderer';
import { useSession } from '../lib/session-store';
import type { Card, Level } from '../types/card-schema';

// ─── Props ───────────────────────────────────────────────────────────────

export interface SequenceProps {
  /** Level to walk. Read from URL :level by App.tsx. Defaults to L0 if
   *  unset (e.g. when the placeholder mount happens during early phases). */
  readonly level?: Level;
  /** 0-based starting offset within the level's filtered deck (used by
   *  the Home jump-to-card feature). Defaults to 0. */
  readonly startIndex?: number;
  /** Called when student wants to leave (back-home button or end-of-deck). */
  onBackHome?: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────

export function Session(props: SequenceProps) {
  const { level = 'L0', startIndex = 0, onBackHome } = props;
  const { cards, recordResultAction } = useSession();

  // cards.json is build-time sorted by atom prereq order; filtering by
  // `level` preserves that order, which is what Sequence needs for a
  // strictly-forward linear walk.
  const deck: ReadonlyArray<Card> = useMemo(
    () => cards.filter((c) => c.level === level),
    [cards, level],
  );

  // Clamp startIndex to a valid range (or 0 if deck is empty).
  const clampedStart = Math.max(0, Math.min(startIndex, Math.max(0, deck.length - 1)));

  const [index, setIndex] = useState(clampedStart);
  // Bumping retryNonce force-remounts CardRenderer (replay, no index change).
  const [retryNonce, setRetryNonce] = useState(0);

  const card = deck[index];

  const handleComplete = useCallback(
    (correct: boolean) => {
      if (!card) return;
      recordResultAction(card.id, correct);
      // Forward-only: advance regardless of correct/wrong. Card components
      // handle their own retry-once internally (per the v1 contract). The
      // outer Retry button below is the manual replay path for when the
      // student wants to redo a card they already cleared.
      setIndex((i) => Math.min(deck.length, i + 1));
      setRetryNonce(0);
    },
    [card, deck.length, recordResultAction],
  );

  const handleRetry = useCallback(() => {
    setRetryNonce((n) => n + 1);
  }, []);

  const handleBack = useCallback(() => {
    onBackHome?.();
  }, [onBackHome]);

  // Force remount of CardRenderer on (a) index change (b) retry click.
  const cardKey = card ? `${index}-${retryNonce}-${card.id}` : 'end';

  // ─── Empty / end-of-deck states ──────────────────────────────────────
  if (deck.length === 0) {
    return (
      <Frame>
        <Header level={level} card={null} index={0} total={0} />
        <NavBar onRetry={null} onBack={handleBack} />
        <EmptyState text={`no cards for ${level}`} />
      </Frame>
    );
  }

  if (!card) {
    // Walked off the end of the deck — auto-end.
    return (
      <Frame>
        <Header level={level} card={null} index={deck.length} total={deck.length} />
        <NavBar onRetry={null} onBack={handleBack} />
        <EmptyState
          text={`end of ${level} (${deck.length} cards). back to home to pick another level.`}
        />
      </Frame>
    );
  }

  // ─── Card phase ──────────────────────────────────────────────────────
  return (
    <Frame>
      <Header
        level={level}
        card={card}
        index={index + 1}
        total={deck.length}
      />
      <NavBar onRetry={handleRetry} onBack={handleBack} />
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
        <CardRenderer key={cardKey} card={card} onComplete={handleComplete} />
      </div>
    </Frame>
  );
}

export default Session;

// ─── Helpers ─────────────────────────────────────────────────────────────

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="region"
      aria-label="Sequence walker"
      style={{
        padding: 'var(--sp-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-3)',
        minHeight: '100%',
        maxWidth: 960,
        margin: '0 auto',
      }}
    >
      {children}
    </div>
  );
}

interface HeaderProps {
  readonly level: Level;
  readonly card: Card | null;
  readonly index: number;
  readonly total: number;
}

function Header({ level, card, index, total }: HeaderProps) {
  return (
    <header
      className="mono"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--sp-2)',
        fontSize: 'var(--fs-code, 14px)',
        flexWrap: 'wrap',
      }}
    >
      <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{level}</span>
      <Sep />
      <span style={{ color: 'var(--accent-cyan)' }}>
        {card ? card.atomId : '—'}
      </span>
      <Sep />
      <span style={{ color: 'var(--text-1)' }}>
        {card ? humanType(card.type) : 'end'}
      </span>
      <span style={{ flex: 1 }} />
      <span
        className="tabular"
        style={{
          color: 'var(--text-0)',
          fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {index} / {total}
      </span>
    </header>
  );
}

function Sep() {
  return (
    <span aria-hidden style={{ color: 'var(--text-2)', opacity: 0.6 }}>
      ·
    </span>
  );
}

interface NavBarProps {
  /** null = retry hidden (e.g. on empty/end states). */
  onRetry: (() => void) | null;
  onBack(): void;
}

function NavBar({ onRetry, onBack }: NavBarProps) {
  const btn: CSSProperties = {
    padding: '6px 14px',
    background: 'transparent',
    border: '1px solid var(--border-1)',
    color: 'var(--text-1)',
    borderRadius: 4,
    cursor: 'pointer',
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--fs-code, 14px)',
  };
  return (
    <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          aria-label="Replay this card from the start"
          className="tr"
          style={btn}
        >
          retry
        </button>
      )}
      <button
        type="button"
        onClick={onBack}
        aria-label="Back to home"
        className="tr"
        style={btn}
      >
        home
      </button>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div
      className="mono"
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-1)',
        fontSize: 'var(--fs-prompt, 15px)',
        padding: 'var(--sp-4)',
        textAlign: 'center',
      }}
    >
      {text}
    </div>
  );
}

function humanType(t: string): string {
  return t.replace(/Card$/i, '').toLowerCase();
}
