/**
 * PostmortemCard.tsx
 *
 * Static reveal of mock results: per-Q score, per-line diff, repair
 * steps, and "drill failed atoms" CTA. Used at the END of a mock to
 * teach the student WHY they got it wrong + WHAT to do next.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────────────────────┐
 *   │ Header: stem + atom id                                           │
 *   ├──────────────────────────────────────────────────────────────────┤
 *   │ Diagnosis panel (read-only, root cause one-paragraph)            │
 *   ├──────────────────────────────────────────────────────────────────┤
 *   │ Failed-attempt vs canonical diff (per-line)                      │
 *   ├──────────────────────────────────────────────────────────────────┤
 *   │ Repair steps (numbered checklist)                                │
 *   ├──────────────────────────────────────────────────────────────────┤
 *   │ Prevention tip                                                   │
 *   ├──────────────────────────────────────────────────────────────────┤
 *   │ [drill failed atoms] CTA + [I understand]                        │
 *   └──────────────────────────────────────────────────────────────────┘
 *
 * Per RULE 4: deterministic, fully a11y, no AI calls. The diff is
 * computed offline; the host wires `onDrillAtoms` to the failure-recovery
 * engine to enqueue prereq drills.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';
import type { PostmortemCard as PostmortemCardData } from '../../types/card-schema';

// ─────────────────────────────────────────────────────────────────────
// Diff (line-by-line)
// ─────────────────────────────────────────────────────────────────────

function normalizeLine(s: string): string {
  return s.replace(/[ \t]+$/g, '').replace(/[ \t]+/g, ' ').trim();
}

interface PMDiffLine {
  lineNumber: number;
  marker: '=' | '+' | '-';
  textA: string;
  textB: string;
}

function buildPMDiff(failedAttempt: string, canonical: string): PMDiffLine[] {
  const linesA = failedAttempt.split('\n');
  const linesB = canonical.split('\n');
  const max = Math.max(linesA.length, linesB.length);
  const out: PMDiffLine[] = [];
  for (let i = 0; i < max; i++) {
    const a = linesA[i] ?? '';
    const b = linesB[i] ?? '';
    const aN = normalizeLine(a);
    const bN = normalizeLine(b);
    const eq = aN === bN;
    out.push({
      lineNumber: i + 1,
      marker: eq ? '=' : aN === '' ? '+' : bN === '' ? '-' : '+',
      textA: a,
      textB: b,
    });
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────

export interface PostmortemCardProps {
  card: PostmortemCardData;
  onComplete: (correct: boolean) => void;
  /** Fires when the student presses "drill failed atoms" CTA. */
  onDrillAtoms?: (atomId: string) => void;
}

// ─────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────

export function PostmortemCard({
  card,
  onComplete,
  onDrillAtoms,
}: PostmortemCardProps) {
  const [stepsAcked, setStepsAcked] = useState<Set<number>>(
    () => new Set(),
  );
  const [acknowledged, setAcknowledged] = useState<boolean>(false);

  const canonical = useMemo(() => {
    // Postmortem doesn't carry codeB explicitly; it carries `repairSteps`
    // and `diagnosis`. The "canonical" we display in the diff is the
    // joined repair steps (the prescribed end-state). We treat the
    // failedAttempt as A and the synthesised target as B for clarity.
    return card.repairSteps.join('\n');
  }, [card.repairSteps]);

  const diff = useMemo(
    () => buildPMDiff(card.failedAttempt, canonical),
    [card.failedAttempt, canonical],
  );

  const allStepsAcked = stepsAcked.size === card.repairSteps.length;

  useEffect(() => {
    setStepsAcked(new Set());
    setAcknowledged(false);
  }, [card.id]);

  const onAckStep = useCallback((idx: number) => {
    setStepsAcked((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const onUnderstand = useCallback(() => {
    setAcknowledged(true);
    onComplete(true);
  }, [onComplete]);

  const onDrill = useCallback(() => {
    onDrillAtoms?.(card.atomId);
  }, [card.atomId, onDrillAtoms]);

  const layoutStyle: CSSProperties = useMemo(
    () => ({
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      padding: 12,
      width: '100%',
      maxWidth: 1280,
      margin: '0 auto',
    }),
    [],
  );

  return (
    <section
      className="pm-root"
      role="application"
      aria-label={`Postmortem — atom ${card.atomId}`}
      data-testid="postmortem-card"
      style={layoutStyle}
    >
      <header className="pm-header">
        <div className="pm-title-block">
          <span className="pm-tag">postmortem</span>
          <span className="pm-stem">{card.stem}</span>
        </div>
        <div className="pm-meta">
          <span className="pm-atom-id">{card.atomId}</span>
          <span className="pm-q-tags">{card.qTags.join(' · ')}</span>
        </div>
      </header>

      <section
        className="pm-diagnosis"
        role="region"
        aria-label="diagnosis (root cause)"
      >
        <h3>diagnosis</h3>
        <p>{card.diagnosis}</p>
      </section>

      <section
        className="pm-diff"
        role="region"
        aria-label="failed attempt vs target diff"
      >
        <h3>diff: failed attempt vs target</h3>
        <div className="pm-diff-headers">
          <span>your attempt</span>
          <span>repair target</span>
        </div>
        <div className="pm-diff-body">
          {diff.map((d) => (
            <div
              key={d.lineNumber}
              className={`pm-diff-row ${d.marker === '=' ? 'eq' : 'neq'}`}
            >
              <span className="pm-diff-lineno">{d.lineNumber}</span>
              <span
                className={`pm-diff-cell side-a ${d.marker === '=' ? '' : 'is-bad'}`}
                aria-label={`failed attempt line ${d.lineNumber}`}
              >
                <span className="pm-marker" aria-hidden="true">
                  {d.marker === '=' ? '=' : '-'}
                </span>
                <code>{d.textA || ' '}</code>
              </span>
              <span
                className={`pm-diff-cell side-b ${d.marker === '=' ? '' : 'is-good'}`}
                aria-label={`repair line ${d.lineNumber}`}
              >
                <span className="pm-marker" aria-hidden="true">
                  {d.marker === '=' ? '=' : '+'}
                </span>
                <code>{d.textB || ' '}</code>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section
        className="pm-steps"
        role="region"
        aria-label="repair steps"
      >
        <h3>repair steps ({stepsAcked.size}/{card.repairSteps.length} acknowledged)</h3>
        <ol className="pm-steps-list">
          {card.repairSteps.map((step, i) => (
            <li key={i}>
              <label className="pm-step-row">
                <input
                  type="checkbox"
                  checked={stepsAcked.has(i)}
                  onChange={() => onAckStep(i)}
                  aria-label={`acknowledge repair step ${i + 1}`}
                />
                <span>{step}</span>
              </label>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="pm-prevention"
        role="region"
        aria-label="prevention tip"
      >
        <h3>next time, prevent this by</h3>
        <p>{card.preventionTip}</p>
      </section>

      <footer className="pm-footer">
        <button
          type="button"
          className="pm-btn pm-btn--ghost"
          onClick={onDrill}
          aria-label={`drill the failed atom ${card.atomId}`}
          disabled={!onDrillAtoms}
        >
          drill failed atoms
        </button>
        <button
          type="button"
          className="pm-btn pm-btn--primary"
          onClick={onUnderstand}
          disabled={!allStepsAcked || acknowledged}
          aria-label="acknowledge all repair steps and continue"
        >
          {acknowledged ? 'acknowledged' : 'I understand'}
        </button>
      </footer>

      {acknowledged && (
        <p
          className="pm-ack-line"
          role="status"
          aria-live="polite"
        >
          Postmortem closed. {card.explanation}
        </p>
      )}

      <style>{PM_STYLES}</style>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────

const PM_STYLES = `
.pm-root {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  color: var(--text-0, #e6edf3);
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
}
.pm-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--border-1, #30363d);
  padding-bottom: 8px;
}
.pm-title-block { display: flex; align-items: center; gap: 8px; flex: 1 1 360px; flex-wrap: wrap; }
.pm-tag {
  background: rgba(255,166,87,0.12);
  color: var(--accent-org, #ffa657);
  border: 1px solid var(--accent-org, #ffa657);
  border-radius: 3px;
  padding: 2px 8px;
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.pm-stem { font-size: 13px; line-height: 1.45; }
.pm-meta { display: flex; gap: 10px; align-items: center; font-size: 11px; }
.pm-atom-id {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 3px;
  padding: 2px 6px;
  color: var(--accent-cyan, #79c0ff);
  letter-spacing: 0.05em;
}
.pm-q-tags { color: var(--accent-org, #ffa657); }

.pm-diagnosis,
.pm-steps,
.pm-prevention {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 10px 12px;
}
.pm-diagnosis h3,
.pm-diff h3,
.pm-steps h3,
.pm-prevention h3 {
  margin: 0 0 6px 0;
  font-size: 11px;
  color: var(--text-2, #6e7681);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.pm-diagnosis p,
.pm-prevention p { margin: 0; font-size: 13px; line-height: 1.45; }

.pm-diff {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 10px 0 0 0;
  overflow: hidden;
}
.pm-diff h3 { padding: 0 12px; }
.pm-diff-headers {
  display: grid;
  grid-template-columns: 36px 1fr 1fr;
  background: var(--bg-2, #1f2937);
  border-top: 1px solid var(--border-1, #30363d);
  border-bottom: 1px solid var(--border-1, #30363d);
  padding: 6px 0;
  font-size: 10px;
  color: var(--text-2, #6e7681);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.pm-diff-headers span { padding: 0 10px; }
.pm-diff-headers span:first-child { padding-left: 12px; }
.pm-diff-body {
  display: flex;
  flex-direction: column;
  max-height: 360px;
  overflow: auto;
}
.pm-diff-row {
  display: grid;
  grid-template-columns: 36px 1fr 1fr;
  font-size: 12px;
  border-top: 1px solid var(--bg-2, #1f2937);
}
.pm-diff-row.neq { background: rgba(255,123,114,0.04); }
.pm-diff-lineno { text-align: right; padding: 2px 8px; color: var(--text-2, #6e7681); font-size: 10px; }
.pm-diff-cell {
  padding: 2px 8px;
  display: flex;
  gap: 6px;
  white-space: pre;
  overflow: hidden;
}
.pm-diff-cell.side-a { border-right: 1px dashed var(--border-1, #30363d); }
.pm-diff-cell.is-bad { background: rgba(255,123,114,0.08); color: var(--accent-pink, #ff7b72); }
.pm-diff-cell.is-good { background: rgba(126,231,135,0.08); color: var(--accent-grn, #7ee787); }
.pm-marker { color: var(--text-2, #6e7681); font-size: 11px; min-width: 12px; text-align: center; }

.pm-steps-list {
  margin: 0;
  padding-left: 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
}
.pm-step-row { display: flex; gap: 8px; align-items: flex-start; cursor: pointer; }
.pm-step-row input { margin-top: 3px; accent-color: var(--accent-cyan, #79c0ff); }

.pm-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.pm-btn {
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
.pm-btn:hover:not(:disabled) {
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--accent-cyan, #79c0ff);
}
.pm-btn:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.pm-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.pm-btn--primary {
  background: var(--accent-cyan, #79c0ff);
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  font-weight: 600;
}
.pm-btn--primary:hover:not(:disabled) {
  background: var(--accent-grn, #7ee787);
  border-color: var(--accent-grn, #7ee787);
}
.pm-btn--ghost { background: transparent; }

.pm-ack-line {
  margin: 0;
  font-size: 11px;
  color: var(--accent-grn, #7ee787);
  font-style: italic;
}
`;

export default PostmortemCard;
