/**
 * DemoCard.tsx — passive read-only annotated example.
 *
 * Schema:
 *   - whyOneLine    : 1-line "why" sentence above the code
 *   - demoCode      : the example C++ snippet (read-only)
 *   - highlightTokens : tokens to color-emphasize inside the demo
 *   - usedIn        : badge list ("Q1", "Q3" or named patterns)
 *
 * No grading — onComplete fires once the student presses Space (i.e. they
 * acknowledge they've read it). This is the lightest SEE card; it's
 * always paired with a follow-up DO card per the see-then-do pipeline.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DemoCard as DemoCardData } from '../../types/card-schema';

export interface DemoCardProps {
  card: DemoCardData;
  onComplete: (correct: boolean) => void;
}

/** Wrap each highlight token in a <mark> tag inside the rendered code. */
function renderCodeWithHighlights(
  code: string,
  highlights: readonly string[]
): React.ReactNode {
  if (highlights.length === 0) return code;
  // Sort longest-first so substring tokens don't break longer matches.
  const sorted = [...highlights]
    .filter((s) => s.length > 0)
    .sort((a, b) => b.length - a.length);
  if (sorted.length === 0) return code;
  const escaped = sorted.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`(${escaped.join('|')})`, 'g');
  const parts = code.split(re);
  return parts.map((p, i) =>
    sorted.includes(p) ? (
      <mark key={i} className="dc-hl">
        {p}
      </mark>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

export function DemoCard({ card, onComplete }: DemoCardProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const codeNode = useMemo(
    () => renderCodeWithHighlights(card.demoCode, card.highlightTokens),
    [card.demoCode, card.highlightTokens]
  );

  useEffect(() => {
    setAcknowledged(false);
  }, [card.id]);

  const acknowledge = useCallback(() => {
    if (acknowledged) return;
    setAcknowledged(true);
    onComplete(true);
  }, [acknowledged, onComplete]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.tagName === 'INPUT') return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        acknowledge();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [acknowledge]);

  return (
    <section
      className="dc-root"
      role="application"
      aria-label={`Demo example — atom ${card.atomId}`}
    >
      <style>{DC_STYLES}</style>

      <header className="dc-header">
        <h2 className="dc-stem">{card.stem}</h2>
      </header>

      <p className="dc-why" aria-label="why this matters">
        <span className="dc-why-eyebrow">why</span>
        <span className="dc-why-text">{card.whyOneLine}</span>
      </p>

      <pre className="dc-code" aria-label="demo code (read-only)" tabIndex={0}>
        {codeNode}
      </pre>

      <footer className="dc-footer">
        <button
          type="button"
          className="dc-btn dc-btn--primary"
          onClick={acknowledge}
          disabled={acknowledged}
          aria-label="acknowledge and continue (Space)"
        >
          {acknowledged ? 'acknowledged' : 'got it (Space)'}
        </button>
      </footer>
    </section>
  );
}

const DC_STYLES = `
.dc-root {
  font-family: var(--font-sans, system-ui, sans-serif);
  background: var(--bg-0, #0d1117);
  color: var(--text-0, #e6edf3);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 760px;
  margin: 0 auto;
}
.dc-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--border-1, #30363d);
  padding-bottom: 10px;
}
.dc-stem { margin: 0; font-size: 14px; line-height: 1.5; flex: 1; }
.dc-meta { display: flex; gap: 8px; font-size: 11px; }
.dc-atom {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  padding: 2px 6px;
  border-radius: 3px;
  color: var(--accent-cyan, #79c0ff);
}
.dc-q { color: var(--accent-org, #ffa657); padding: 2px 6px; }
.dc-why {
  margin: 0;
  padding: 10px 12px;
  background: var(--bg-1, #161b22);
  border-left: 3px solid var(--accent-yel, #d2a8ff);
  border-radius: 3px;
  display: flex;
  gap: 8px;
  align-items: baseline;
  font-size: 13px;
  line-height: 1.5;
}
.dc-why-eyebrow {
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--accent-yel, #d2a8ff);
  font-weight: 700;
  flex-shrink: 0;
}
.dc-why-text { color: var(--text-0, #e6edf3); }
.dc-code {
  margin: 0;
  padding: 12px 14px;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 13px;
  line-height: 1.55;
  white-space: pre-wrap;
  overflow-x: auto;
  color: var(--text-0, #e6edf3);
}
.dc-code:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: -2px;
}
.dc-hl {
  background: rgba(210,168,255,0.18);
  color: var(--accent-yel, #d2a8ff);
  padding: 0 2px;
  border-radius: 2px;
}
.dc-used {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
  font-size: 11px;
}
.dc-used-eyebrow {
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--text-2, #6e7681);
}
.dc-used-tag {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 3px;
  padding: 2px 8px;
  color: var(--accent-org, #ffa657);
}
.dc-footer { display: flex; justify-content: flex-end; }
.dc-btn {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  color: var(--text-0, #e6edf3);
  padding: 6px 14px;
  border-radius: 4px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.dc-btn:hover:not(:disabled) {
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--accent-cyan, #79c0ff);
}
.dc-btn:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.dc-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.dc-btn--primary {
  background: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  border-color: var(--accent-cyan, #79c0ff);
  font-weight: 600;
}
`;

export default DemoCard;
