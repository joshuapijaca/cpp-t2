import { useEffect } from 'react';
import type { DemoCard as DemoCardData } from '../types/card';
import { levelOf } from '../lib/levels';

interface DemoCardProps {
  card: DemoCardData;
  onAdvance: () => void;
}

/**
 * SEE-half card type 1 of 3 (M12).
 *
 * Read-only. Shows real C++ snippet with highlighted tokens, a one-line "why",
 * and "used in" badges. Mirror-neuron prime: student observes expert code
 * before producing it. No grading. Space → advance.
 *
 * Spec: cpp-t2/docs/14_see_cards_master_plan.md ("demo card UX").
 */
export function DemoCard({ card, onAdvance }: DemoCardProps) {
  // Space → advance. Any other key → ignored (read-only card).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        onAdvance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onAdvance]);

  const lvl = levelOf(card.atomId);
  const lines = card.demoCode.split('\n');

  return (
    <div className="card">
      <div className="atom-id">
        {lvl ? `${lvl.label} · ${lvl.title} · ` : ''}
        {card.atomId} · demo
      </div>

      <div className="demo-meta">
        <div className="demo-why">
          <span className="demo-meta__label">why</span>
          <span className="demo-meta__arrow">-&gt;</span>
          <span className="demo-meta__value">{card.whyOneLine}</span>
        </div>
        {card.usedIn.length > 0 && (
          <div className="demo-used-in">
            <span className="demo-meta__label">used in</span>
            <span className="demo-meta__arrow">-&gt;</span>
            {card.usedIn.map((q) => (
              <span key={q} className="demo-badge">
                {q}
              </span>
            ))}
          </div>
        )}
      </div>

      <pre className="demo-code">
        {lines.map((line, i) => (
          <div key={i} className="demo-code__line">
            {renderLine(line, card.highlightTokens)}
          </div>
        ))}
      </pre>

      <div className="kbd-hint">
        <span className="kbd">space</span> to continue
      </div>
    </div>
  );
}

/**
 * Render one code line, accent-coloring any substring matched by highlight tokens.
 *
 * Strategy: greedy left-to-right longest-match. Sort tokens by descending length
 * once per render so longer tokens (e.g. "increment(n)") win over shorter
 * overlapping ones (e.g. "n").
 */
function renderLine(line: string, highlights: string[]): React.ReactNode[] {
  if (highlights.length === 0) return [line];
  const sorted = [...highlights].sort((a, b) => b.length - a.length);

  const out: React.ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  while (cursor < line.length) {
    let matchAt = -1;
    let matchTok = '';
    for (const tok of sorted) {
      if (tok.length === 0) continue;
      const idx = line.indexOf(tok, cursor);
      if (idx === -1) continue;
      if (matchAt === -1 || idx < matchAt || (idx === matchAt && tok.length > matchTok.length)) {
        matchAt = idx;
        matchTok = tok;
      }
    }
    if (matchAt === -1) {
      out.push(line.slice(cursor));
      break;
    }
    if (matchAt > cursor) {
      out.push(line.slice(cursor, matchAt));
    }
    out.push(
      <span key={`h-${key++}`} className="demo-highlight">
        {matchTok}
      </span>
    );
    cursor = matchAt + matchTok.length;
  }

  return out;
}
