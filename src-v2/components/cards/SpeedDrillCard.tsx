/**
 * SpeedDrillCard.tsx — full-screen production drill + Q1-Q4 tabs.
 *
 * NOTE — TIMER REMOVED (2026-05-07).
 * The card no longer has a flash phase nor any countdown / per-card budget.
 * The student types the answer at their own pace and submits when ready.
 * S6 ("production" stage) is now the no-pressure full-question drill.
 *
 * Used for production-stage Q-bank drills:
 *   - qTags : every Q this card belongs to — surfaced as tabs so the
 *             student can quickly switch between question contexts during
 *             a single production-drill session.
 *
 * Phases:
 *   1. RECALL : prompt + (optional) canonical reveal toggle; student types
 *               answer; submits when ready.
 *   2. GRADE  : compare student vs canonical (lenient char-match);
 *               show pass/fail + diff.
 *
 * Keyboard:
 *   - Ctrl+Enter : submit during recall
 *   - Tab/Arrow keys : navigate Q tabs
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CodeEditor, type CodeEditorHandle } from '../primitives/CodeEditor';
import { gradeWrite, type WriteGradeResult } from '../../lib/grading-write';
import type { SpeedDrillCard as SpeedDrillCardData } from '../../types/card-schema';

export interface SpeedDrillCardProps {
  card: SpeedDrillCardData;
  onComplete: (correct: boolean) => void;
}

type Phase = 'recall' | 'grade';

const ALL_TABS = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

export function SpeedDrillCard({ card, onComplete }: SpeedDrillCardProps) {
  const tabs = useMemo(() => {
    // Show only Q-tags this card touches; default to first.
    return ALL_TABS.filter((q) => (card.qTags as readonly string[]).includes(q));
  }, [card.qTags]);

  const [activeTab, setActiveTab] = useState<string>(tabs[0] ?? 'Q1');
  const [phase, setPhase] = useState<Phase>('recall');
  const [code, setCode] = useState('');
  const [grade, setGrade] = useState<WriteGradeResult | null>(null);
  const [showCanonical, setShowCanonical] = useState(false);
  const editorRef = useRef<CodeEditorHandle | null>(null);

  // Reset on card change.
  useEffect(() => {
    setActiveTab(tabs[0] ?? 'Q1');
    setPhase('recall');
    setCode('');
    setGrade(null);
    setShowCanonical(false);
    requestAnimationFrame(() => editorRef.current?.focus());
  }, [card.id, tabs]);

  const handleSubmit = useCallback(() => {
    const result = gradeWrite(code, {
      canonicalAnswer: card.canonicalAnswer,
      keyChecks: card.keyChecks,
      forbiddenTokens: [],
      requireSemicolon: false,
    });
    setGrade(result);
    setPhase('grade');
    onComplete(result.pass);
  }, [code, card.canonicalAnswer, card.keyChecks, onComplete]);

  const handleRetry = useCallback(() => {
    setPhase('recall');
    setCode('');
    setGrade(null);
    setShowCanonical(false);
    requestAnimationFrame(() => editorRef.current?.focus());
  }, []);

  // Keyboard.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === 'Enter' &&
        phase === 'recall'
      ) {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, handleSubmit]);

  // Tabs keyboard navigation.
  const onTabKey = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        const nextIdx = (idx + dir + tabs.length) % tabs.length;
        const nextTab = tabs[nextIdx];
        if (nextTab) setActiveTab(nextTab);
      }
    },
    [tabs]
  );

  return (
    <section
      className="sd-root"
      role="application"
      aria-label={`Production drill — ${card.atomId}`}
    >
      <style>{SD_STYLES}</style>

      <header className="sd-header">
        <div>
          <span className="sd-eyebrow">production drill</span>
          <h2 className="sd-stem">{card.stem}</h2>
        </div>
      </header>

      <div role="tablist" aria-label="Q-bank tabs" className="sd-tabs">
        {tabs.map((q, i) => (
          <button
            key={q}
            role="tab"
            id={`sd-tab-${q}`}
            aria-selected={activeTab === q}
            aria-controls={`sd-panel-${q}`}
            tabIndex={activeTab === q ? 0 : -1}
            className={`sd-tab ${activeTab === q ? 'is-active' : ''}`}
            onClick={() => setActiveTab(q)}
            onKeyDown={(e) => onTabKey(e, i)}
          >
            {q}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`sd-panel-${activeTab}`}
        aria-labelledby={`sd-tab-${activeTab}`}
        className="sd-panel"
      >
        <p className="sd-prompt">{card.prompt}</p>

        {phase === 'recall' && (
          <>
            <div className="sd-editor">
              <CodeEditor
                ref={editorRef}
                value={code}
                onChange={setCode}
                language="cpp"
                ariaLabel="production drill code editor"
                showBraceMatch
                lineNumbers
              />
            </div>
            {showCanonical ? (
              <details className="sd-peek" open>
                <summary>hide canonical answer</summary>
                <pre className="sd-canon" aria-label="canonical answer">
                  {card.canonicalAnswer}
                </pre>
              </details>
            ) : (
              <button
                type="button"
                className="sd-btn sd-btn--ghost"
                onClick={() => setShowCanonical(true)}
                aria-label="reveal canonical answer (only if stuck)"
              >
                Show canonical answer (only if stuck)
              </button>
            )}
          </>
        )}

        {phase === 'grade' && grade && (
          <div
            className={`sd-feedback ${grade.pass ? 'is-ok' : 'is-bad'}`}
            role="status"
            aria-live="polite"
          >
            <strong>
              {grade.pass
                ? `pass · ${grade.score}/100`
                : `not yet · ${grade.score}/100`}
            </strong>
            {!grade.pass && grade.errors[0] && (
              <p className="sd-err">{grade.errors[0].message}</p>
            )}
            <details>
              <summary>show canonical answer</summary>
              <pre className="sd-canon">{card.canonicalAnswer}</pre>
              <p className="sd-explain">{card.explanation}</p>
            </details>
          </div>
        )}
      </div>

      <footer className="sd-footer">
        {phase === 'recall' && (
          <button
            type="button"
            className="sd-btn sd-btn--primary"
            onClick={handleSubmit}
            aria-label="submit (Ctrl+Enter)"
          >
            Submit (Ctrl+Enter)
          </button>
        )}
        {phase === 'grade' && (
          <button
            type="button"
            className="sd-btn"
            onClick={handleRetry}
            aria-label="retry the drill"
          >
            Retry
          </button>
        )}
      </footer>
    </section>
  );
}

const SD_STYLES = `
.sd-root {
  font-family: var(--font-sans, system-ui, sans-serif);
  background: var(--bg-0, #0d1117);
  color: var(--text-0, #e6edf3);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 1100px;
  margin: 0 auto;
  min-height: 90vh;
}
.sd-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  border-bottom: 1px solid var(--border-1, #30363d);
  padding-bottom: 10px;
}
.sd-eyebrow {
  display: inline-block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent-cyan, #79c0ff);
  font-weight: 700;
  margin-bottom: 4px;
}
.sd-stem { margin: 0; font-size: 15px; line-height: 1.4; }
.sd-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--border-1, #30363d); }
.sd-tab {
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  color: var(--text-1, #8b949e);
  padding: 6px 14px;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  letter-spacing: 0.04em;
}
.sd-tab:hover { color: var(--accent-cyan, #79c0ff); }
.sd-tab:focus-visible { outline: 2px solid var(--accent-cyan, #79c0ff); outline-offset: 2px; }
.sd-tab.is-active { color: var(--accent-cyan, #79c0ff); border-bottom-color: var(--accent-cyan, #79c0ff); }
.sd-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}
.sd-prompt {
  margin: 0;
  padding: 10px 12px;
  background: var(--bg-1, #161b22);
  border-left: 3px solid var(--accent-cyan, #79c0ff);
  border-radius: 3px;
  font-size: 13px;
  line-height: 1.5;
}
.sd-canon {
  margin: 0;
  padding: 10px 12px;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--accent-pink, #ff7b72);
  border-radius: 3px;
  font-family: var(--font-mono, monospace);
  font-size: 13px;
  line-height: 1.55;
  white-space: pre-wrap;
  color: var(--accent-grn, #7ee787);
}
.sd-peek summary {
  cursor: pointer;
  font-size: 12px;
  color: var(--accent-cyan, #79c0ff);
  margin-bottom: 6px;
}
.sd-editor { display: flex; flex: 1; min-height: 220px; }
.sd-editor > * { flex: 1; min-height: 0; }
.sd-feedback {
  padding: 10px 12px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid var(--border-1, #30363d);
  background: var(--bg-1, #161b22);
}
.sd-feedback.is-ok { border-color: var(--accent-grn, #7ee787); color: var(--accent-grn, #7ee787); }
.sd-feedback.is-bad { border-color: var(--state-err, #f85149); color: var(--state-err, #f85149); }
.sd-err { margin: 6px 0 0; }
.sd-explain { margin: 8px 0 0; color: var(--text-1, #8b949e); }
.sd-footer { display: flex; justify-content: flex-end; gap: 8px; }
.sd-btn {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  color: var(--text-0, #e6edf3);
  padding: 8px 16px;
  border-radius: 4px;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.sd-btn:hover:not(:disabled) {
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--accent-cyan, #79c0ff);
}
.sd-btn:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.sd-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.sd-btn--primary {
  background: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  border-color: var(--accent-cyan, #79c0ff);
}
.sd-btn--ghost { background: transparent; }
`;

export default SpeedDrillCard;
