/**
 * TemplateRecallCard.tsx
 *
 * Stage-driven verbatim-recall drill for cpp-t2 Option 4.
 *
 * UX (3 stages -> graded):
 *
 *   STUDY (3-8s flash)   -> HIDE (skeleton)   -> TYPE (textarea + ticks)   -> GRADED
 *   ┌────────────────┐    ┌────────────────┐   ┌─────────────────────────┐  ┌──────────┐
 *   │ struct Point { │    │ struct ___ {   │   │ ✓ struct Point {        │  │  PASS  ✅│
 *   │   double x;    │    │   ___ ___;     │   │ ✓   double x;           │  │  or       │
 *   │ };             │ -> │ };             │ -> │ ✗   doublex;            │ -> │  FAIL  ❌│
 *   └────────────────┘    └────────────────┘   └─────────────────────────┘  └──────────┘
 *      readonly view        skeleton hint        live per-line ticks
 *
 * Modes:
 *   - "line-by-line"  : default for first encounters. Tick gates progress.
 *   - "all-at-once"   : after 3 successes — the student types and grades.
 *
 * Accessibility:
 *   - <h2> announces stage. role="status" aria-live="polite" pings the
 *     transition.
 *   - Esc on stage 1/2 prompts skip-confirm; Esc inside the editor blurs
 *     (handled by CodeEditor itself).
 *   - All controls Tab-reachable. Enter on the [I'm ready] / [Recall]
 *     buttons advances.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { TemplateRecallCard as TemplateRecallCardData } from "../../types/card-schema";
import { CodeEditor, type CodeEditorHandle } from "../primitives/CodeEditor";
import { generateSkeleton } from "../../lib/skeleton-mask";
import {
  braceBalance,
  gradeBlock,
  lineMatchVector,
} from "../../lib/line-match";

export type TemplateRecallMode = "line-by-line" | "all-at-once";

export interface TemplateRecallCardProps {
  card: TemplateRecallCardData;
  onComplete: (correct: boolean) => void;
  /** "line-by-line" for first 3 encounters, "all-at-once" once familiar. */
  mode: TemplateRecallMode;
  /**
   * Stage-1 flash window in seconds. Defaults to 5s (mid-band of 3-8s).
   * Pass `0` to disable auto-advance and require a button press.
   */
  studySeconds?: number;
  /**
   * Optional override for the skeleton string. If omitted, generated from
   * canonicalAnswer via skeleton-mask.
   */
  skeletonOverride?: string;
}

type Stage = "STUDY" | "HIDE" | "TYPE" | "GRADED";

const TICK_OK = "✓";
const TICK_BAD = "✗";

export function TemplateRecallCard({
  card,
  onComplete,
  mode,
  studySeconds = 5,
  skeletonOverride,
}: TemplateRecallCardProps) {
  const [stage, setStage] = useState<Stage>("STUDY");
  const [studentSrc, setStudentSrc] = useState<string>("");
  const [secondsLeft, setSecondsLeft] = useState<number>(studySeconds);
  const [skipConfirm, setSkipConfirm] = useState<boolean>(false);
  const [graded, setGraded] = useState<{
    ok: boolean;
    firstMismatch: number;
  } | null>(null);

  const editorRef = useRef<CodeEditorHandle | null>(null);

  // ── derived ────────────────────────────────────────────────────────
  const canonical = card.canonicalAnswer;
  const skeleton = useMemo(
    () =>
      skeletonOverride !== undefined
        ? skeletonOverride
        : generateSkeleton(card.template ?? canonical),
    [skeletonOverride, card.template, canonical],
  );

  const matchVec = useMemo(
    () => lineMatchVector(studentSrc, canonical),
    [studentSrc, canonical],
  );

  const totalLines = canonical.split("\n").length;
  const matchedLines = matchVec.filter(Boolean).length;
  const balance = useMemo(() => braceBalance(studentSrc), [studentSrc]);

  // In line-by-line mode the first un-matched line is the "active" one and
  // the student can't usefully type past it (still allowed; just unhinted).
  const activeLineIdx = useMemo(() => {
    if (mode !== "line-by-line") return -1;
    const idx = matchVec.findIndex((m) => !m);
    return idx === -1 ? totalLines : idx;
  }, [mode, matchVec, totalLines]);

  // ── stage 1 timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (stage !== "STUDY" || studySeconds <= 0) return;
    setSecondsLeft(studySeconds);
    const start = Date.now();
    const tick = window.setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const remain = Math.max(0, studySeconds - elapsed);
      setSecondsLeft(remain);
      if (remain <= 0) {
        window.clearInterval(tick);
        setStage("HIDE");
      }
    }, 100);
    return () => window.clearInterval(tick);
  }, [stage, studySeconds]);

  // Auto-focus the editor on TYPE entry so keyboard users go straight in.
  useEffect(() => {
    if (stage === "TYPE") {
      // Defer to the frame after mount so the textarea exists.
      requestAnimationFrame(() => editorRef.current?.focus());
    }
  }, [stage]);

  // ── handlers ───────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    const result = gradeBlock(studentSrc, canonical);
    setGraded({ ok: result.ok, firstMismatch: result.firstMismatch });
    setStage("GRADED");
    onComplete(result.ok);
  }, [studentSrc, canonical, onComplete]);

  const handleSkipRequest = useCallback(() => {
    setSkipConfirm(true);
  }, []);

  const handleSkipConfirm = useCallback(() => {
    setSkipConfirm(false);
    if (stage === "STUDY") setStage("HIDE");
    else if (stage === "HIDE") setStage("TYPE");
    else if (stage === "TYPE") handleSubmit();
  }, [stage, handleSubmit]);

  const handleSkipCancel = useCallback(() => setSkipConfirm(false), []);

  const handleStageKey = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (stage === "GRADED") return;
        handleSkipRequest();
      }
    },
    [stage, handleSkipRequest],
  );

  // ── stage rendering ────────────────────────────────────────────────
  const stageHeader = (text: string, sub?: string) => (
    <header className="trc-header">
      <h2 className="trc-stage">{text}</h2>
      {sub ? <p className="trc-sub">{sub}</p> : null}
    </header>
  );

  const liveAnnounce = (
    <div role="status" aria-live="polite" className="trc-sr-only">
      Stage: {stage}. {stage === "TYPE" ? `${matchedLines} of ${totalLines} lines matched.` : ""}
    </div>
  );

  // ── render ─────────────────────────────────────────────────────────
  return (
    <div
      className="trc-root"
      data-stage={stage}
      onKeyDown={handleStageKey}
      tabIndex={-1}
      aria-label={`Template recall card: ${card.stem}`}
    >
      <style>{TRC_STYLES}</style>

      <div className="trc-prompt">
        <span className="trc-prompt-label">PROMPT</span>
        <p>{card.prompt}</p>
      </div>

      {liveAnnounce}

      {stage === "STUDY" && (
        <section aria-labelledby="trc-h-study">
          {stageHeader(
            "Stage 1 — STUDY",
            studySeconds > 0
              ? `Read the canonical code. Auto-advance in ${secondsLeft.toFixed(1)}s.`
              : "Read the canonical code. Press [I'm ready] when memorized.",
          )}
          <div className="trc-editor-wrap">
            <CodeEditor
              value={canonical}
              onChange={() => {/* readonly */}}
              language="cpp"
              readOnly
              ariaLabel="Canonical code (study)"
            />
          </div>
          <div className="trc-actions">
            <button
              type="button"
              className="trc-btn trc-btn-primary"
              onClick={() => setStage("HIDE")}
            >
              I&apos;m ready
            </button>
            <button
              type="button"
              className="trc-btn trc-btn-ghost"
              onClick={handleSkipRequest}
            >
              Skip (Esc)
            </button>
          </div>
        </section>
      )}

      {stage === "HIDE" && (
        <section aria-labelledby="trc-h-hide">
          {stageHeader(
            "Stage 2 — HIDE",
            "Commit the shape. Names hidden. Press [Recall] to type.",
          )}
          <div className="trc-editor-wrap trc-skeleton">
            <CodeEditor
              value={skeleton}
              onChange={() => {/* readonly */}}
              language="cpp"
              readOnly
              ariaLabel="Skeleton hint (structure preserved, names hidden)"
            />
          </div>
          <div className="trc-actions">
            <button
              type="button"
              className="trc-btn trc-btn-primary"
              onClick={() => setStage("TYPE")}
            >
              Recall
            </button>
            <button
              type="button"
              className="trc-btn trc-btn-ghost"
              onClick={handleSkipRequest}
            >
              Skip (Esc)
            </button>
          </div>
        </section>
      )}

      {stage === "TYPE" && (
        <section aria-labelledby="trc-h-type">
          {stageHeader(
            mode === "line-by-line" ? "Stage 3 — TYPE (line by line)" : "Stage 3 — TYPE (all at once)",
            "Reproduce the canonical code. Ticks appear as each line matches.",
          )}

          <div className="trc-type-grid">
            <ul className="trc-tick-col" aria-hidden="true">
              {Array.from({ length: Math.max(totalLines, 1) }).map((_, i) => {
                const ok = matchVec[i] === true;
                const isActive = mode === "line-by-line" && i === activeLineIdx;
                return (
                  <li
                    key={i}
                    className={`trc-tick ${ok ? "trc-tick-ok" : isActive ? "trc-tick-active" : "trc-tick-pending"}`}
                  >
                    {ok ? TICK_OK : isActive ? "▸" : ""}
                  </li>
                );
              })}
            </ul>
            <div className="trc-editor-wrap">
              <CodeEditor
                ref={editorRef}
                value={studentSrc}
                onChange={setStudentSrc}
                language="cpp"
                ariaLabel={`Type your answer. ${matchedLines} of ${totalLines} lines match.`}
                placeholder="Type the canonical code here…"
              />
            </div>
          </div>

          <div className="trc-meta">
            <span className={`trc-counter ${balance === 0 ? "trc-counter-ok" : "trc-counter-bad"}`}>
              braces: {balance >= 0 ? "+" : ""}
              {balance}
            </span>
            <span className="trc-counter">
              lines: {matchedLines}/{totalLines}
            </span>
          </div>

          <div className="trc-actions">
            <button
              type="button"
              className="trc-btn trc-btn-primary"
              onClick={handleSubmit}
            >
              Submit
            </button>
            <button
              type="button"
              className="trc-btn trc-btn-ghost"
              onClick={handleSkipRequest}
            >
              Give up (Esc)
            </button>
          </div>
        </section>
      )}

      {stage === "GRADED" && graded && (
        <section aria-labelledby="trc-h-graded">
          {stageHeader(
            graded.ok ? "PASS ✓" : "FAIL ✗",
            graded.ok
              ? "Verbatim match. Move on."
              : `First mismatch at line ${graded.firstMismatch + 1}. See diff below.`,
          )}

          {!graded.ok && (
            <div className="trc-diff" aria-label="Diff: your answer vs canonical">
              <div className="trc-diff-col">
                <h3>Your answer</h3>
                <pre className="trc-diff-pre">
                  {studentSrc.split("\n").map((line, i) => (
                    <div
                      key={i}
                      className={
                        matchVec[i] ? "trc-diff-ok" : "trc-diff-bad"
                      }
                    >
                      <span className="trc-diff-mark">
                        {matchVec[i] ? TICK_OK : TICK_BAD}
                      </span>{" "}
                      {line || " "}
                    </div>
                  ))}
                </pre>
              </div>
              <div className="trc-diff-col">
                <h3>Canonical</h3>
                <pre className="trc-diff-pre">
                  {canonical.split("\n").map((line, i) => (
                    <div key={i}>{line || " "}</div>
                  ))}
                </pre>
              </div>
            </div>
          )}

          {card.explanation && (
            <details className="trc-explanation">
              <summary>Why this shape?</summary>
              <p>{card.explanation}</p>
            </details>
          )}
        </section>
      )}

      {skipConfirm && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="trc-skip-h"
          className="trc-modal"
        >
          <div className="trc-modal-card">
            <h3 id="trc-skip-h">Skip this stage?</h3>
            <p>
              {stage === "STUDY"
                ? "You won't see the canonical again until you've graded."
                : stage === "HIDE"
                  ? "You'll go straight to typing without the structure hint."
                  : "Submitting now will grade your current answer."}
            </p>
            <div className="trc-actions">
              <button
                type="button"
                className="trc-btn trc-btn-primary"
                onClick={handleSkipConfirm}
                autoFocus
              >
                Skip
              </button>
              <button
                type="button"
                className="trc-btn trc-btn-ghost"
                onClick={handleSkipCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Component-scoped styles. Reuses the cpp-t2 theme tokens (--bg-*,
// --text-*, --accent-*, --state-*) with safe fallbacks so the card
// still renders sanely in the storybook before theme.css loads.
// ──────────────────────────────────────────────────────────────────────

const TRC_STYLES = `
.trc-root {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: var(--bg-0, #0d1117);
  color: var(--text-0, #e6edf3);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
  font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif);
}

.trc-prompt {
  border-left: 3px solid var(--accent-cyan, #79c0ff);
  padding: 8px 12px;
  background: var(--bg-1, #161b22);
  border-radius: 0 4px 4px 0;
}
.trc-prompt-label {
  display: block;
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--text-2, #6e7681);
  margin-bottom: 4px;
}
.trc-prompt p { margin: 0; font-size: 14px; }

.trc-header { margin: 0; }
.trc-stage {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-cyan, #79c0ff);
}
.trc-sub {
  margin: 0;
  color: var(--text-1, #8b949e);
  font-size: 13px;
}

.trc-editor-wrap { min-height: 8rem; }
.trc-skeleton .ce-tok-identifier { color: var(--text-2, #6e7681); }

.trc-type-grid {
  display: grid;
  grid-template-columns: 2.25rem 1fr;
  gap: 0;
  align-items: stretch;
}
.trc-tick-col {
  list-style: none;
  margin: 0;
  padding: 12px 0;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-right: none;
  border-radius: 6px 0 0 6px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 14px;
  line-height: 1.55;
}
.trc-tick {
  padding: 0 8px;
  text-align: center;
}
.trc-tick-ok { color: var(--accent-grn, #7ee787); }
.trc-tick-active { color: var(--accent-org, #ffa657); }
.trc-tick-pending { color: var(--text-2, #6e7681); }
.trc-type-grid .ce-root { border-radius: 0 6px 6px 0; }

.trc-meta {
  display: flex;
  gap: 16px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 12px;
  color: var(--text-1, #8b949e);
}
.trc-counter-ok { color: var(--accent-grn, #7ee787); }
.trc-counter-bad { color: var(--state-err, #f85149); }

.trc-actions { display: flex; gap: 8px; }
.trc-btn {
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid var(--border-1, #30363d);
  background: var(--bg-2, #21262d);
  color: var(--text-0, #e6edf3);
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
}
.trc-btn:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.trc-btn-primary {
  background: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  border-color: var(--accent-cyan, #79c0ff);
  font-weight: 600;
}
.trc-btn-ghost { background: transparent; }

.trc-diff {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.trc-diff-col { min-width: 0; }
.trc-diff-col h3 {
  margin: 0 0 4px 0;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-2, #6e7681);
}
.trc-diff-pre {
  margin: 0;
  padding: 8px;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 13px;
  line-height: 1.55;
  white-space: pre;
  overflow-x: auto;
}
.trc-diff-ok { color: var(--accent-grn, #7ee787); }
.trc-diff-bad { color: var(--state-err, #f85149); }
.trc-diff-mark { display: inline-block; width: 1ch; }

.trc-explanation {
  margin-top: 8px;
  font-size: 13px;
  color: var(--text-1, #8b949e);
}
.trc-explanation summary { cursor: pointer; color: var(--accent-cyan, #79c0ff); }

.trc-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: grid;
  place-items: center;
  z-index: 1000;
}
.trc-modal-card {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
  padding: 20px;
  max-width: 28rem;
}

.trc-sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}
`;
