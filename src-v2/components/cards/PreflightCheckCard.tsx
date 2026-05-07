/**
 * PreflightCheckCard.tsx
 *
 * Pre-attempt warm-up: rapid-fire checklist of "do you remember..." items
 * the student must self-attest BEFORE the heavy mock starts. The card
 * also serves as the wrapper for a 50-card lightning round when bound to
 * a sequence (see PreflightSequence below).
 *
 * Two modes:
 *   1. Single-card (default): renders the checklist + scenario + advance
 *      button. Each checklist item must be ticked.
 *   2. Sequence (PreflightSequence): wraps an array of inner card-render
 *      callbacks for the 50-card pass-through. Each card advances on
 *      submit (no per-card budget — work at your own pace).
 *
 * NOTE — TIMER REMOVED (2026-05-07).
 * The PreflightSequence no longer enforces a per-card seconds budget and
 * cards never auto-fail from a timer. The student passes through all
 * cards sequentially and a final per-atom dashboard is computed offline.
 *
 * Per RULE 4: keyboard-only operable, full a11y, no AI calls. The
 * sequence dashboard is computed offline from session results.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import type { PreflightCheckCard as PreflightCheckCardData } from '../../types/card-schema';

// ─────────────────────────────────────────────────────────────────────
// Single-card props
// ─────────────────────────────────────────────────────────────────────

export interface PreflightCheckCardProps {
  card: PreflightCheckCardData;
  onComplete: (correct: boolean) => void;
}

export function PreflightCheckCard({
  card,
  onComplete,
}: PreflightCheckCardProps) {
  const [checked, setChecked] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    setChecked(new Set());
  }, [card.id]);

  const allChecked = checked.size === card.checklist.length;

  const onToggle = useCallback((i: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }, []);

  const onTickAll = useCallback(() => {
    setChecked(new Set(card.checklist.map((_, i) => i)));
  }, [card.checklist]);

  const onAdvance = useCallback(() => {
    if (!allChecked) return;
    onComplete(true);
  }, [allChecked, onComplete]);

  // Number-keys 1..9 toggle the matching checklist row.
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (!/^[1-9]$/.test(e.key)) return;
      const idx = Number(e.key) - 1;
      if (idx >= card.checklist.length) return;
      e.preventDefault();
      onToggle(idx);
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [card.checklist.length, onToggle]);

  const layoutStyle: CSSProperties = useMemo(
    () => ({
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      padding: 12,
      width: '100%',
      maxWidth: 980,
      margin: '0 auto',
    }),
    [],
  );

  return (
    <section
      className="pf-root"
      role="application"
      aria-label={`Preflight check — atom ${card.atomId}`}
      data-testid="preflight-check-card"
      style={layoutStyle}
    >
      <header className="pf-header">
        <div className="pf-title-block">
          <span className="pf-tag">preflight</span>
          <span className="pf-stem">{card.stem}</span>
        </div>
        <div className="pf-meta">
          <span className="pf-atom-id">{card.atomId}</span>
          <span className="pf-q-tags">{card.qTags.join(' · ')}</span>
        </div>
      </header>

      <section
        className="pf-scenario"
        role="region"
        aria-label="scenario"
      >
        <h3>scenario</h3>
        <p>{card.scenario}</p>
      </section>

      <section
        className="pf-checklist"
        role="region"
        aria-label="preflight checklist"
      >
        <h3>checklist ({checked.size}/{card.checklist.length})</h3>
        <ol className="pf-list">
          {card.checklist.map((item, i) => (
            <li key={i}>
              <label className="pf-row">
                <input
                  type="checkbox"
                  checked={checked.has(i)}
                  onChange={() => onToggle(i)}
                  aria-label={`checklist item ${i + 1}: ${item}`}
                />
                <span className="pf-key" aria-hidden="true">
                  {i < 9 ? i + 1 : ''}
                </span>
                <span>{item}</span>
              </label>
            </li>
          ))}
        </ol>
      </section>

      <footer className="pf-footer">
        <button
          type="button"
          className="pf-btn pf-btn--ghost"
          onClick={onTickAll}
          aria-label="tick all checklist items"
        >
          tick all
        </button>
        <button
          type="button"
          className="pf-btn pf-btn--primary"
          onClick={onAdvance}
          disabled={!allChecked}
          aria-label="all items confirmed — advance"
        >
          {allChecked ? 'go' : `tick all to advance (${checked.size}/${card.checklist.length})`}
        </button>
      </footer>

      {card.explanation && (
        <p className="pf-explanation" role="note">
          {card.explanation}
        </p>
      )}

      <style>{PF_STYLES}</style>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Sequence wrapper — pass-through round (e.g. 50 cards)
// ─────────────────────────────────────────────────────────────────────

export interface PreflightSequenceItem {
  cardId: string;
  atomId: string;
  /** Render the inner card with the given onComplete callback. */
  render: (args: {
    onComplete: (correct: boolean) => void;
  }) => ReactNode;
}

export interface PreflightSequenceProps {
  items: PreflightSequenceItem[];
  /** Called once the dashboard is shown. */
  onComplete: (summary: PreflightSummary) => void;
}

export interface PreflightAtomResult {
  atomId: string;
  passed: number;
  total: number;
  status: 'green' | 'yellow' | 'red';
}

export interface PreflightSummary {
  total: number;
  passed: number;
  perAtom: PreflightAtomResult[];
}

/**
 * Pass-through wrapper for a sequence of cards (typical: 50). Tracks
 * per-card pass/fail and aggregates a per-atom red/yellow/green dashboard
 * at the end.
 *
 *   green: ≥80% pass per atom
 *   yellow: 50..79%
 *   red: <50%
 */
export function PreflightSequence({
  items,
  onComplete,
}: PreflightSequenceProps) {
  const [idx, setIdx] = useState<number>(0);
  const [results, setResults] = useState<{ cardId: string; atomId: string; pass: boolean }[]>(
    [],
  );

  const finished = idx >= items.length;
  const current = !finished ? items[idx] : null;

  const onCardComplete = useCallback(
    (pass: boolean) => {
      const it = items[idx];
      if (!it) return;
      setResults((prev) => [
        ...prev,
        { cardId: it.cardId, atomId: it.atomId, pass },
      ]);
      setIdx((i) => i + 1);
    },
    [idx, items],
  );

  const onSkip = useCallback(() => {
    onCardComplete(false);
  }, [onCardComplete]);

  const summary = useMemo<PreflightSummary | null>(() => {
    if (!finished) return null;
    const byAtom = new Map<string, { pass: number; total: number }>();
    for (const r of results) {
      const cur = byAtom.get(r.atomId) ?? { pass: 0, total: 0 };
      cur.total += 1;
      if (r.pass) cur.pass += 1;
      byAtom.set(r.atomId, cur);
    }
    const perAtom: PreflightAtomResult[] = [...byAtom.entries()].map(
      ([atomId, v]) => {
        const ratio = v.total === 0 ? 0 : v.pass / v.total;
        const status: PreflightAtomResult['status'] =
          ratio >= 0.8 ? 'green' : ratio >= 0.5 ? 'yellow' : 'red';
        return { atomId, passed: v.pass, total: v.total, status };
      },
    );
    perAtom.sort((a, b) => a.atomId.localeCompare(b.atomId));
    return {
      total: results.length,
      passed: results.filter((r) => r.pass).length,
      perAtom,
    };
  }, [finished, results]);

  // Fire onComplete once when summary is finalised.
  useEffect(() => {
    if (summary) onComplete(summary);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary !== null]);

  if (finished && summary) {
    return <Dashboard summary={summary} />;
  }

  if (!current) return null;

  return (
    <section
      className="pfs-root"
      role="application"
      aria-label={`Preflight ${idx + 1}/${items.length}`}
      data-testid="preflight-sequence"
    >
      <header className="pfs-header">
        <span className="pfs-progress" aria-label="progress">
          {idx + 1} / {items.length} · atom {current.atomId}
        </span>
        <button
          type="button"
          className="pfs-skip"
          onClick={onSkip}
          aria-label="skip this card and mark as fail"
        >
          skip
        </button>
      </header>
      <div className="pfs-stage">
        {current.render({ onComplete: onCardComplete })}
      </div>
      <style>{PF_STYLES}</style>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────

function Dashboard({ summary }: { summary: PreflightSummary }) {
  return (
    <section
      className="pfs-dash"
      role="status"
      aria-live="polite"
      aria-label="preflight summary"
    >
      <h3>preflight summary</h3>
      <p className="pfs-dash-line">
        passed <strong>{summary.passed}</strong> / {summary.total} cards (
        {Math.round((summary.passed / Math.max(1, summary.total)) * 100)}%)
      </p>
      <ul className="pfs-dash-list">
        {summary.perAtom.map((a) => (
          <li key={a.atomId} className={`pfs-dash-row ${a.status}`}>
            <span className={`pfs-dot ${a.status}`} aria-hidden="true" />
            <code>{a.atomId}</code>{' '}
            <span className="pfs-dash-frac">
              {a.passed}/{a.total}
            </span>
            <span className="pfs-dash-status">{a.status}</span>
          </li>
        ))}
      </ul>
      <style>{PF_STYLES}</style>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────

const PF_STYLES = `
.pf-root,
.pfs-root,
.pfs-dash {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  color: var(--text-0, #e6edf3);
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--accent-cyan, #79c0ff);
  border-radius: 8px;
  padding: 12px;
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
}
.pf-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--border-1, #30363d);
  padding-bottom: 8px;
}
.pf-title-block { display: flex; align-items: center; gap: 8px; flex: 1 1 360px; flex-wrap: wrap; }
.pf-tag {
  background: rgba(121,192,255,0.12);
  color: var(--accent-cyan, #79c0ff);
  border: 1px solid var(--accent-cyan, #79c0ff);
  border-radius: 3px;
  padding: 2px 8px;
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.pf-stem { font-size: 13px; line-height: 1.45; }
.pf-meta { display: flex; gap: 10px; align-items: center; font-size: 11px; }
.pf-atom-id {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 3px;
  padding: 2px 6px;
  color: var(--accent-cyan, #79c0ff);
  letter-spacing: 0.05em;
}
.pf-q-tags { color: var(--accent-org, #ffa657); }

.pf-scenario,
.pf-checklist {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 10px 12px;
  margin-top: 8px;
}
.pf-scenario h3,
.pf-checklist h3 {
  margin: 0 0 6px 0;
  font-size: 11px;
  color: var(--text-2, #6e7681);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.pf-scenario p { margin: 0; font-size: 13px; line-height: 1.45; }
.pf-list {
  margin: 0;
  padding-left: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}
.pf-row { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 4px 6px; border-radius: 3px; }
.pf-row:hover { background: var(--bg-2, #1f2937); }
.pf-row input { accent-color: var(--accent-cyan, #79c0ff); }
.pf-key {
  display: inline-block;
  width: 16px;
  height: 16px;
  text-align: center;
  line-height: 16px;
  font-size: 10px;
  background: var(--bg-2, #1f2937);
  border-radius: 2px;
  color: var(--text-2, #6e7681);
}
.pf-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
.pf-btn,
.pfs-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  color: var(--text-0, #e6edf3);
  font-family: inherit;
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}
.pf-btn:hover:not(:disabled) {
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--accent-cyan, #79c0ff);
}
.pf-btn:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.pf-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.pf-btn--primary {
  background: var(--accent-cyan, #79c0ff);
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  font-weight: 600;
}
.pf-btn--primary:hover:not(:disabled) {
  background: var(--accent-grn, #7ee787);
  border-color: var(--accent-grn, #7ee787);
}
.pf-btn--ghost { background: transparent; }
.pf-explanation {
  margin: 0;
  font-size: 11px;
  color: var(--text-2, #6e7681);
}

.pfs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-1, #30363d);
  padding-bottom: 6px;
  margin-bottom: 8px;
}
.pfs-progress { color: var(--text-1, #8b949e); font-size: 11px; }
.pfs-skip {
  background: transparent;
  color: var(--text-1, #8b949e);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 3px;
  padding: 4px 10px;
  font-family: inherit;
  font-size: 11px;
  cursor: pointer;
  letter-spacing: 0.06em;
}
.pfs-skip:hover { color: var(--accent-cyan, #79c0ff); border-color: var(--accent-cyan, #79c0ff); }
.pfs-stage { display: flex; flex-direction: column; }

.pfs-dash h3 {
  margin: 0 0 6px 0;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.pfs-dash-line { margin: 0 0 8px 0; font-size: 13px; }
.pfs-dash-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}
.pfs-dash-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  border-radius: 3px;
  background: var(--bg-1, #161b22);
}
.pfs-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
.pfs-dot.green { background: var(--state-ok, #3fb950); }
.pfs-dot.yellow { background: var(--state-warn, #d29922); }
.pfs-dot.red { background: var(--state-err, #f85149); }
.pfs-dash-frac { color: var(--text-1, #8b949e); }
.pfs-dash-status {
  margin-left: auto;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 10px;
  color: var(--text-2, #6e7681);
}
.pfs-dash-row.green .pfs-dash-status { color: var(--state-ok, #3fb950); }
.pfs-dash-row.yellow .pfs-dash-status { color: var(--state-warn, #d29922); }
.pfs-dash-row.red .pfs-dash-status { color: var(--state-err, #f85149); }
`;

export default PreflightCheckCard;
