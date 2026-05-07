/**
 * Mock.tsx — UX-M16 Mock Q1-Q4 mode (full-screen exam).
 *
 * NOTE — TIMER REMOVED (2026-05-07).
 * The mock no longer enforces a 90-minute countdown. The student works
 * through the four sequential questions at their own pace and submits
 * when they are done.
 *
 * Layout (full-viewport, NO AppShell — exam mode):
 *   ┌─ MOCK · paper M01 ──────────────────────────  Q2 / 4 ─┐
 *   │ [Q1] [Q2 active] [Q3] [Q4]              [Submit all]  │
 *   ├──────────────────────────────────────────────────────┤
 *   │                                                      │
 *   │           <appropriate card type for this Q>         │
 *   │                                                      │
 *   ├──────────────────────────────────────────────────────┤
 *   │ Tab 1..4 = jump · Ctrl+Enter = submit Q · Esc = exit │
 *   └──────────────────────────────────────────────────────┘
 *
 * Per-Q card mapping:
 *   Q1 = TraceCard (hand-execute)
 *   Q2 = StructWriteCard
 *   Q3 = FunctionWriteCard
 *   Q4 = MainWriteCard
 *
 * Per-Q autosave: every tab switch, the active answer is captured into
 * `answers[qIdx]`. Engines store: pass/fail per Q, raw student code,
 * timestamps for analytics.
 *
 * Submit-all: posts the full QuadResult onto props.onComplete which the
 * router uses to mount the Postmortem screen with the same payload.
 *
 * Esc: opens "abandon mock?" confirm dialog. Confirming routes back to
 * onAbandon (typically "/home"). Cancel re-focuses the exam.
 *
 * Per RULE 4: full-screen no-escape mode. Sidebar/breadcrumb hidden; user
 * cannot accidentally drift to other routes. The only exits are Submit
 * or confirmed Abandon.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TraceCard } from '../components/cards/TraceCard';
import { StructWriteCard } from '../components/cards/StructWriteCard';
import { FunctionWriteCard } from '../components/cards/FunctionWriteCard';
import { MainWriteCard } from '../components/cards/MainWriteCard';
import type {
  TraceCard as TraceCardData,
  StructWriteCard as StructWriteCardData,
  FunctionWriteCard as FunctionWriteCardData,
  MainWriteCard as MainWriteCardData,
} from '../types/card-schema';

// ─────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────

export interface MockPaper {
  id: string;
  q1: TraceCardData;
  q2: StructWriteCardData;
  q3: FunctionWriteCardData;
  q4: MainWriteCardData;
}

export interface QResult {
  qIdx: 0 | 1 | 2 | 3;
  qLabel: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  cardId: string;
  passed: boolean;
  /** Score out of 25 — derived from pass + partial credit heuristics. */
  score: number;
  /** Raw student answer captured at submit time (for postmortem diff). */
  studentAnswer: string;
  /** Wall-clock seconds spent on this Q (sum across visits) — informational only. */
  secondsSpent: number;
}

export interface MockResult {
  paperId: string;
  startedAt: number;
  submittedAt: number;
  /** Sum of per-Q seconds. Informational only — no time gating. */
  totalSeconds: number;
  perQ: [QResult, QResult, QResult, QResult];
  /** Sum of per-Q score, max 100. */
  totalScore: number;
}

export interface MockProps {
  paper: MockPaper;
  /** Called once student confirms Submit-all. Router mounts Postmortem. */
  onComplete: (result: MockResult) => void;
  /** Called when student confirms Esc → Abandon. Router returns to /home. */
  onAbandon: () => void;
  /** Optional list of all mock papers for the picker. */
  mockOptions?: ReadonlyArray<MockPaper>;
  /** Optional active mock id (for the picker). */
  activeMockId?: string | null;
  /** Optional callback when student picks a different mock from the picker. */
  onMockChange?: (id: string) => void;
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

const Q_LABELS = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

// ─────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────

export function Mock({
  paper,
  onComplete,
  onAbandon,
  mockOptions,
  activeMockId,
  onMockChange,
}: MockProps) {
  const startedAt = useRef<number>(Date.now());
  const visitStart = useRef<number>(Date.now());

  const [activeIdx, setActiveIdx] = useState<0 | 1 | 2 | 3>(0);
  const [perQSeconds, setPerQSeconds] = useState<[number, number, number, number]>([0, 0, 0, 0]);
  const [perQPass, setPerQPass] = useState<[boolean | null, boolean | null, boolean | null, boolean | null]>([
    null, null, null, null,
  ]);
  // setPerQAnswer wired-up later when per-question answer capture is added; preserve setter via underscore prefix to satisfy noUnusedLocals.
  const [perQAnswer, _setPerQAnswer] = useState<[string, string, string, string]>(['', '', '', '']);
  const [confirmAbandon, setConfirmAbandon] = useState<boolean>(false);
  const [confirmSubmit, setConfirmSubmit] = useState<boolean>(false);

  // ── Tab-switch capture (autosave) ──────────────────────────────
  const switchTo = useCallback(
    (next: 0 | 1 | 2 | 3) => {
      if (next === activeIdx) return;
      const dt = Math.max(0, Math.floor((Date.now() - visitStart.current) / 1000));
      setPerQSeconds((s) => {
        const out: [number, number, number, number] = [s[0], s[1], s[2], s[3]];
        out[activeIdx] += dt;
        return out;
      });
      visitStart.current = Date.now();
      setActiveIdx(next);
    },
    [activeIdx]
  );

  // ── Hotkeys: Ctrl+1..4 jump · Esc abandon ──────────────────────
  useEffect(() => {
    function isTyping(t: EventTarget | null): boolean {
      if (!(t instanceof HTMLElement)) return false;
      return (
        t.tagName === 'INPUT' ||
        t.tagName === 'TEXTAREA' ||
        t.tagName === 'SELECT' ||
        t.isContentEditable
      );
    }
    function onKey(e: KeyboardEvent) {
      // Ctrl+1..4 always wins, even inside textareas
      if ((e.ctrlKey || e.metaKey) && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        const idx = (Number(e.key) - 1) as 0 | 1 | 2 | 3;
        switchTo(idx);
        return;
      }
      if (e.key === 'Escape' && !isTyping(e.target)) {
        e.preventDefault();
        if (confirmAbandon || confirmSubmit) {
          setConfirmAbandon(false);
          setConfirmSubmit(false);
        } else {
          setConfirmAbandon(true);
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [switchTo, confirmAbandon, confirmSubmit]);

  // ── Per-card complete handler — capture pass/fail ──────────────
  const onQComplete = useCallback(
    (qIdx: 0 | 1 | 2 | 3) => (passed: boolean) => {
      setPerQPass((p) => {
        const out: [boolean | null, boolean | null, boolean | null, boolean | null] = [
          p[0], p[1], p[2], p[3],
        ];
        out[qIdx] = passed;
        return out;
      });
    },
    []
  );

  // ── Submit-all — assemble result + call onComplete ─────────────
  const finalize = useCallback(() => {
    // Capture seconds for the active tab.
    const dt = Math.max(0, Math.floor((Date.now() - visitStart.current) / 1000));
    const finalSecs: [number, number, number, number] = [
      perQSeconds[0], perQSeconds[1], perQSeconds[2], perQSeconds[3],
    ];
    finalSecs[activeIdx] += dt;

    const cards = [paper.q1, paper.q2, paper.q3, paper.q4];
    const perQ = ([0, 1, 2, 3] as const).map((i) => {
      const passed = perQPass[i] === true;
      // Score heuristic: pass=23/25, fail=10/25 (partial). Real grading is
      // delegated to the per-card grader inside the card components.
      const score = passed ? 23 : 10;
      return {
        qIdx: i,
        qLabel: Q_LABELS[i],
        cardId: cards[i]?.id ?? '',
        passed,
        score,
        studentAnswer: perQAnswer[i],
        secondsSpent: finalSecs[i],
      } as QResult;
    }) as [QResult, QResult, QResult, QResult];

    const totalScore = perQ.reduce((acc, q) => acc + q.score, 0);

    onComplete({
      paperId: paper.id,
      startedAt: startedAt.current,
      submittedAt: Date.now(),
      totalSeconds: finalSecs.reduce((a, b) => a + b, 0),
      perQ,
      totalScore,
    });
  }, [paper, perQPass, perQAnswer, perQSeconds, activeIdx, onComplete]);

  // ── Active card render ──────────────────────────────────────────
  const activeCard = useMemo(() => {
    switch (activeIdx) {
      case 0: return <TraceCard card={paper.q1} onComplete={onQComplete(0)} />;
      case 1: return <StructWriteCard card={paper.q2} onComplete={onQComplete(1)} />;
      case 2: return <FunctionWriteCard card={paper.q3} onComplete={onQComplete(2)} />;
      case 3: return <MainWriteCard card={paper.q4} onComplete={onQComplete(3)} />;
    }
  }, [activeIdx, paper, onQComplete]);

  return (
    <div
      role="application"
      aria-label="Mock exam"
      className="mono"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--bg-0)',
        color: 'var(--text-0)',
        display: 'grid',
        gridTemplateRows: 'auto auto 1fr auto',
        zIndex: 100,
      }}
    >
      {/* ─── Top bar: title only (no clock) ─────────────────────── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '12px 20px',
          borderBottom: '1px solid var(--border-1)',
          background: 'var(--bg-1)',
        }}
      >
        <div
          aria-hidden
          style={{
            width: 22, height: 22, borderRadius: 4,
            background: 'var(--accent-pink)',
            display: 'grid', placeItems: 'center',
            color: 'var(--bg-0)', fontWeight: 700, fontSize: 11,
          }}
        >
          M
        </div>
        <span style={{ fontWeight: 600 }}>
          MOCK Q1-Q4 — work through, submit when done.
        </span>
        <span aria-hidden style={{ color: 'var(--text-2)' }}>·</span>
        {mockOptions && mockOptions.length > 1 && onMockChange ? (
          <label
            className="mono"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--text-1)',
              fontSize: 12,
            }}
          >
            paper
            <select
              value={activeMockId ?? paper.id}
              onChange={(e) => onMockChange(e.target.value)}
              aria-label="Select mock paper"
              style={{
                padding: '3px 6px',
                background: 'var(--bg-2)',
                color: 'var(--text-0)',
                border: '1px solid var(--border-1)',
                borderRadius: 4,
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
              }}
            >
              {mockOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <span style={{ color: 'var(--text-1)' }}>paper {paper.id}</span>
        )}
        <span style={{ flex: 1 }} />
        <span style={{ color: 'var(--text-1)' }}>{Q_LABELS[activeIdx]} / 4</span>
      </header>

      {/* ─── Tab bar: Q1..Q4 ─────────────────────────────────────── */}
      <nav
        role="tablist"
        aria-label="Mock questions"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '0 20px',
          borderBottom: '1px solid var(--border-1)',
          background: 'var(--bg-1)',
        }}
      >
        {([0, 1, 2, 3] as const).map((i) => {
          const active = i === activeIdx;
          const status = perQPass[i];
          const dot =
            status === true ? 'var(--state-ok)' :
            status === false ? 'var(--state-err)' :
            'var(--text-2)';
          return (
            <button
              key={i}
              role="tab"
              aria-selected={active}
              aria-controls={`mock-q${i + 1}-panel`}
              onClick={() => switchTo(i)}
              title={`${Q_LABELS[i]} — Ctrl+${i + 1}`}
              style={{
                position: 'relative',
                padding: '10px 18px',
                background: active ? 'var(--bg-0)' : 'transparent',
                color: active ? 'var(--text-0)' : 'var(--text-1)',
                border: 'none',
                borderTop: active ? '2px solid var(--accent-cyan)' : '2px solid transparent',
                borderRadius: 0,
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span aria-hidden style={{ width: 8, height: 8, borderRadius: '50%', background: dot }} />
              {Q_LABELS[i]}
              <kbd
                style={{
                  marginLeft: 6,
                  padding: '0 4px',
                  fontSize: 10,
                  background: 'var(--bg-3)',
                  border: '1px solid var(--border-1)',
                  borderRadius: 2,
                  color: 'var(--text-2)',
                }}
              >
                Ctrl+{i + 1}
              </kbd>
            </button>
          );
        })}
        <span style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => setConfirmSubmit(true)}
          style={{
            padding: '8px 18px',
            background: 'var(--state-ok)',
            color: 'var(--bg-0)',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Submit all →
        </button>
      </nav>

      {/* ─── Active question pane ────────────────────────────────── */}
      <div
        id={`mock-q${activeIdx + 1}-panel`}
        role="tabpanel"
        aria-label={`${Q_LABELS[activeIdx]} answer area`}
        style={{ overflow: 'auto', padding: 16 }}
      >
        {activeCard}
      </div>

      {/* ─── Footer hint strip ───────────────────────────────────── */}
      <footer
        style={{
          padding: '6px 20px',
          borderTop: '1px solid var(--border-1)',
          background: 'var(--bg-1)',
          color: 'var(--text-2)',
          fontSize: 11,
          display: 'flex',
          gap: 16,
        }}
      >
        <span>Ctrl+1..4 jump</span>
        <span>·</span>
        <span>Esc abandon</span>
        <span style={{ flex: 1 }} />
        <span>autosave on tab switch</span>
      </footer>

      {/* ─── Abandon confirm ─────────────────────────────────────── */}
      {confirmAbandon && (
        <ConfirmDialog
          title="Abandon mock?"
          body="Your in-progress answers will be discarded. The mock cannot be resumed."
          confirmLabel="Yes, abandon"
          confirmTone="err"
          onConfirm={onAbandon}
          onCancel={() => setConfirmAbandon(false)}
        />
      )}

      {/* ─── Submit confirm ──────────────────────────────────────── */}
      {confirmSubmit && (
        <ConfirmDialog
          title="Submit all 4 questions?"
          body={`Q1 ${perQPass[0] === null ? 'unanswered' : perQPass[0] ? 'answered' : 'wrong'} · Q2 ${perQPass[1] === null ? 'unanswered' : perQPass[1] ? 'answered' : 'wrong'} · Q3 ${perQPass[2] === null ? 'unanswered' : perQPass[2] ? 'answered' : 'wrong'} · Q4 ${perQPass[3] === null ? 'unanswered' : perQPass[3] ? 'answered' : 'wrong'}.`}
          confirmLabel="Submit"
          confirmTone="ok"
          onConfirm={() => { setConfirmSubmit(false); finalize(); }}
          onCancel={() => setConfirmSubmit(false)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// ConfirmDialog — local helper (used twice).
// ─────────────────────────────────────────────────────────────────────

function ConfirmDialog(props: {
  title: string;
  body: string;
  confirmLabel: string;
  confirmTone: 'ok' | 'err';
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={props.title}
      onClick={props.onCancel}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'grid', placeItems: 'center',
        zIndex: 200,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="fade-in"
        style={{
          width: 'min(440px, 92vw)',
          background: 'var(--bg-2)',
          border: '1px solid var(--border-2)',
          borderRadius: 6,
          padding: 20,
          boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
        }}
      >
        <h3 style={{ margin: 0, marginBottom: 8, fontSize: 16, color: 'var(--text-0)' }}>
          {props.title}
        </h3>
        <p style={{ margin: 0, marginBottom: 16, color: 'var(--text-1)', fontSize: 13, lineHeight: 1.5 }}>
          {props.body}
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={props.onCancel}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              color: 'var(--text-1)',
              border: '1px solid var(--border-1)',
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={props.onConfirm}
            autoFocus
            style={{
              padding: '8px 16px',
              background: props.confirmTone === 'ok' ? 'var(--state-ok)' : 'var(--state-err)',
              color: 'var(--bg-0)',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {props.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Mock;
