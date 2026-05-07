/**
 * Postmortem.tsx — UX-M17 Postmortem screen.
 *
 * Mounted by the router after Mock.onComplete with the full MockResult.
 *
 * Layout (full-page within AppShell):
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │  Postmortem · paper {id} · 75 / 100                          │
 *   │  Q1 19/25  ✓     Q2 23/25  ✓     Q3 12/25  ✗   Q4 21/25  ✓   │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  [Q1] [Q2] [Q3 active] [Q4]   [Drill failed atoms] [Done]    │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │  ┌─ your code ─────┬─ canonical ─────┬─ annotations ──────┐  │
 *   │  │ 1│ void f(...)  │ 1│ void f(...)  │                    │  │
 *   │  │ 2│   for(int i  │ 2│   for(int i  │ ✗ missing &        │  │
 *   │  │ 3│   list[i].x  │ 3│   list[i].x  │ → add to weakness  │  │
 *   │  └─────────────────┴─────────────────┴────────────────────┘  │
 *   └──────────────────────────────────────────────────────────────┘
 *
 * Per RULE 4: every error annotated, every annotation has a "drill →"
 * shortcut wired to the engines/dag-backward-retry payload.
 */

import { useMemo, useState } from 'react';
import type { MockResult } from './Mock';

// ─────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────

export interface PostmortemAnnotation {
  /** 1-based line number in the student's code (or canonical if unique to canonical). */
  line: number;
  /** Severity tag — drives color. */
  severity: 'err' | 'warn' | 'info';
  /** Short label (e.g. "missing &"). */
  label: string;
  /** Long-form explanation shown beside the diff. */
  detail: string;
  /** Atom this annotation traces back to (used by Drill button). */
  atomId?: string;
}

export interface PostmortemPayload {
  result: MockResult;
  /** Canonical answer per Q (lifted from the original card data). */
  canonical: [string, string, string, string];
  /** Per-Q annotations produced by the grader. */
  annotations: [
    PostmortemAnnotation[],
    PostmortemAnnotation[],
    PostmortemAnnotation[],
    PostmortemAnnotation[],
  ];
  /** Atoms whose familiarity dropped due to this mock — feed Drill button. */
  failedAtomIds: string[];
}

export interface PostmortemProps {
  payload: PostmortemPayload;
  /** Trigger the DAG-backward retry deck. Router routes to /track. */
  onDrillFailed: (atomIds: string[]) => void;
  /** Add specific annotation to weakness file. */
  onAddToWeakness: (qIdx: 0 | 1 | 2 | 3, annotation: PostmortemAnnotation) => void;
  /** Done button — back to /home. */
  onDone: () => void;
}

const Q_LABELS = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

// ─────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────

export function Postmortem({ payload, onDrillFailed, onAddToWeakness, onDone }: PostmortemProps) {
  const { result, canonical, annotations, failedAtomIds } = payload;
  const [activeIdx, setActiveIdx] = useState<0 | 1 | 2 | 3>(0);

  const activeStudent = result.perQ[activeIdx].studentAnswer;
  const activeCanonical = canonical[activeIdx];
  const activeAnnotations = annotations[activeIdx];

  const studentLines = useMemo(() => activeStudent.split('\n'), [activeStudent]);
  const canonicalLines = useMemo(() => activeCanonical.split('\n'), [activeCanonical]);
  const maxLines = Math.max(studentLines.length, canonicalLines.length);

  // Annotation lookup by line for fast diff-row coloring.
  const annoByLine = useMemo(() => {
    const m: Record<number, PostmortemAnnotation[]> = {};
    for (const a of activeAnnotations) {
      (m[a.line] ??= []).push(a);
    }
    return m;
  }, [activeAnnotations]);

  return (
    <div
      style={{
        height: '100%',
        display: 'grid',
        gridTemplateRows: 'auto auto 1fr',
        background: 'var(--bg-0)',
        color: 'var(--text-0)',
      }}
    >
      {/* ─── Header: total + per-Q breakdown ──────────────────── */}
      <Header result={result} />

      {/* ─── Tab bar + actions ────────────────────────────────── */}
      <nav
        role="tablist"
        aria-label="Postmortem questions"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 20px',
          borderBottom: '1px solid var(--border-1)',
          background: 'var(--bg-1)',
        }}
      >
        {([0, 1, 2, 3] as const).map((i) => {
          const q = result.perQ[i];
          const active = i === activeIdx;
          return (
            <button
              key={i}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveIdx(i)}
              className="mono"
              style={{
                padding: '8px 14px',
                background: active ? 'var(--bg-0)' : 'transparent',
                color: active ? 'var(--text-0)' : 'var(--text-1)',
                border: 'none',
                borderTop: active ? `2px solid ${q.passed ? 'var(--state-ok)' : 'var(--state-err)'}` : '2px solid transparent',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: active ? 600 : 400,
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}
            >
              <span aria-hidden style={{
                width: 8, height: 8, borderRadius: '50%',
                background: q.passed ? 'var(--state-ok)' : 'var(--state-err)',
              }} />
              {Q_LABELS[i]}
              <span style={{ color: 'var(--text-2)' }}>{q.score}/25</span>
            </button>
          );
        })}
        <span style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => onDrillFailed(failedAtomIds)}
          disabled={failedAtomIds.length === 0}
          style={{
            padding: '8px 14px',
            background: failedAtomIds.length === 0 ? 'var(--bg-3)' : 'var(--state-warn)',
            color: failedAtomIds.length === 0 ? 'var(--text-2)' : 'var(--bg-0)',
            border: 'none',
            borderRadius: 4,
            cursor: failedAtomIds.length === 0 ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Drill failed atoms ({failedAtomIds.length}) →
        </button>
        <button
          type="button"
          onClick={onDone}
          style={{
            padding: '8px 14px',
            background: 'var(--accent-cyan)',
            color: 'var(--bg-0)',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Done
        </button>
      </nav>

      {/* ─── Diff body ────────────────────────────────────────── */}
      <div style={{ overflow: 'auto', padding: '12px 20px' }}>
        <DiffTable
          studentLines={studentLines}
          canonicalLines={canonicalLines}
          maxLines={maxLines}
          annoByLine={annoByLine}
          onAddToWeakness={(a) => onAddToWeakness(activeIdx, a)}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────────────

function Header({ result }: { result: MockResult }) {
  const totalSecs = result.totalSeconds;
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs - m * 60;
  return (
    <header
      style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--border-1)',
        background: 'var(--bg-1)',
        display: 'flex',
        alignItems: 'center',
        gap: 18,
      }}
      className="mono"
    >
      <h2 style={{ margin: 0, fontSize: 15, color: 'var(--text-0)' }}>Postmortem</h2>
      <span style={{ color: 'var(--text-2)' }}>·</span>
      <span style={{ color: 'var(--text-1)', fontSize: 12 }}>paper {result.paperId}</span>
      <span style={{ color: 'var(--text-2)' }}>·</span>
      <span style={{ color: 'var(--text-1)', fontSize: 12 }}>elapsed {m}:{String(s).padStart(2, '0')}</span>
      <span style={{ flex: 1 }} />
      <span
        className="tabular"
        style={{
          padding: '6px 14px',
          background: 'var(--bg-2)',
          border: `1px solid ${result.totalScore >= 75 ? 'var(--state-ok)' : 'var(--state-warn)'}`,
          borderRadius: 4,
          fontSize: 18,
          fontWeight: 700,
          color: result.totalScore >= 75 ? 'var(--state-ok)' : 'var(--state-warn)',
        }}
      >
        {result.totalScore} / 100
      </span>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────
// DiffTable — 3-column: your | canonical | annotations
// ─────────────────────────────────────────────────────────────────────

function DiffTable(props: {
  studentLines: string[];
  canonicalLines: string[];
  maxLines: number;
  annoByLine: Record<number, PostmortemAnnotation[]>;
  onAddToWeakness: (a: PostmortemAnnotation) => void;
}) {
  const { studentLines, canonicalLines, maxLines, annoByLine, onAddToWeakness } = props;

  return (
    <table
      className="mono"
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 12,
        tableLayout: 'fixed',
      }}
    >
      <colgroup>
        <col style={{ width: 32 }} />
        <col style={{ width: 'calc((100% - 32px) * 0.40)' }} />
        <col style={{ width: 'calc((100% - 32px) * 0.30)' }} />
        <col style={{ width: 'calc((100% - 32px) * 0.30)' }} />
      </colgroup>
      <thead>
        <tr style={{ background: 'var(--bg-2)' }}>
          <th aria-label="line" />
          <th style={hCell}>your code</th>
          <th style={hCell}>canonical</th>
          <th style={hCell}>annotations</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: maxLines }).map((_, i) => {
          const ln = i + 1;
          const studentLn = studentLines[i] ?? '';
          const canonicalLn = canonicalLines[i] ?? '';
          const annos = annoByLine[ln] ?? [];
          const hasErr = annos.some((a) => a.severity === 'err');
          const isMatch = studentLn === canonicalLn;
          const studentBg = hasErr ? 'rgba(248, 81, 73, 0.10)' : isMatch ? 'transparent' : 'rgba(210, 153, 34, 0.06)';
          return (
            <tr key={i} style={{ borderTop: '1px solid var(--border-1)' }}>
              <td style={{ ...lnCell, color: hasErr ? 'var(--state-err)' : 'var(--text-2)' }}>{ln}</td>
              <td style={{ ...codeCell, background: studentBg, color: studentLn === '' ? 'var(--text-2)' : 'var(--text-0)' }}>
                {studentLn || ' '}
              </td>
              <td style={{ ...codeCell, color: 'var(--text-1)' }}>
                {canonicalLn || ' '}
              </td>
              <td style={{ ...codeCell, padding: '4px 8px' }}>
                {annos.map((a, k) => (
                  <div key={k} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
                    <SeverityBadge sev={a.severity} />
                    <div style={{ flex: 1, color: 'var(--text-1)' }}>
                      <strong style={{ color: 'var(--text-0)' }}>{a.label}</strong>
                      <span> — {a.detail}</span>
                      {a.atomId && (
                        <span style={{ color: 'var(--text-2)', marginLeft: 6 }}>[{a.atomId}]</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onAddToWeakness(a)}
                      title="Add this error to weakness file"
                      style={{
                        padding: '2px 6px',
                        background: 'transparent',
                        border: '1px solid var(--border-1)',
                        borderRadius: 3,
                        color: 'var(--accent-cyan)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        cursor: 'pointer',
                      }}
                    >
                      + weakness
                    </button>
                  </div>
                ))}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

const hCell: React.CSSProperties = {
  textAlign: 'left',
  padding: '6px 10px',
  color: 'var(--text-1)',
  fontWeight: 600,
  fontSize: 11,
  borderBottom: '1px solid var(--border-1)',
};

const lnCell: React.CSSProperties = {
  textAlign: 'right',
  padding: '4px 6px',
  fontSize: 11,
  verticalAlign: 'top',
  background: 'var(--bg-2)',
  borderRight: '1px solid var(--border-1)',
};

const codeCell: React.CSSProperties = {
  padding: '4px 10px',
  whiteSpace: 'pre',
  verticalAlign: 'top',
  fontFamily: 'var(--font-mono)',
};

function SeverityBadge({ sev }: { sev: 'err' | 'warn' | 'info' }) {
  const color =
    sev === 'err' ? 'var(--state-err)' :
    sev === 'warn' ? 'var(--state-warn)' :
    'var(--state-info)';
  const glyph = sev === 'err' ? '✗' : sev === 'warn' ? '!' : 'i';
  return (
    <span
      aria-label={sev}
      style={{
        display: 'inline-grid',
        placeItems: 'center',
        width: 14, height: 14,
        borderRadius: 3,
        background: color,
        color: 'var(--bg-0)',
        fontSize: 10,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {glyph}
    </span>
  );
}

export default Postmortem;
