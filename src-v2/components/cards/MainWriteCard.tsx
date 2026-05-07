/**
 * MainWriteCard.tsx
 *
 * Q4 main()-writing card for cpp-t2 Option 4.
 *
 * Q4 ≈ 25% of Test 2 marks. Almost always: write a complete `int main()` that
 *   - declares `const int MAX = N;`
 *   - declares an array of a previously-defined struct
 *   - reads a count via cout-prompt + `cin >>`
 *   - calls a previously-defined `read_X(arr, count)` (pass-by-ref)
 *   - prints the list using a for-loop with dot-access on the struct fields
 *   - returns 0
 *
 * Layout (paper-sim, vertical stack — matches Test 2 exam Q4):
 *   ┌────────────────────────────────────────────────────────────────┐
 *   │ Spec — what to write                                           │
 *   │ Context: struct (already defined) + read fn (already defined)  │
 *   ├────────────────────────────────────────────────────────────────┤
 *   │ CodeEditor — student writes int main() { ... }                 │
 *   ├────────────────────────────────────────────────────────────────┤
 *   │ [Submit] / [Try again]                                          │
 *   ├────────────────────────────────────────────────────────────────┤
 *   │ Sectional feedback panel                                        │
 *   └────────────────────────────────────────────────────────────────┘
 *
 * Stripped (paper-sim — not on exam):
 *   - "Q4 — Write `int main()`" eyebrow title
 *   - Two-pane horizontal split
 *
 * Submit grading: SECTIONAL.
 *   - Section 1 (ask for count):  cout, cin >>, count variable
 *   - Section 2 (read in list):   call read_X(arr, count)
 *   - Section 3 (print loop):     for, <, endl, dot-access (`.`)
 *   - Plus structure check:       `const int MAX`, struct array decl, return 0
 *
 * Each section's pass/fail is announced separately via aria-live so the
 * student knows EXACTLY which blank failed (per RULE 4 — sectional feedback
 * critical because Q4 is ~25% of test points).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CodeEditor } from "../primitives/CodeEditor";
import type { MainWriteCard as MainWriteCardData } from "../../types/card-schema";
import {
  gradeWrite,
  type WriteGradeResult,
} from "../../lib/grading-write";

// ─────────────────────────────────────────────────────────────────────
// Sectional-grading types (not yet in card-schema.ts; passed via prop)
// ─────────────────────────────────────────────────────────────────────

/**
 * A single graded section of the student's main(). Each spec corresponds to
 * one of the comment-blocks in the scaffold (or one logical block in cold-start).
 *
 * - mustInclude  : tokens that MUST appear (operator-spacing-tolerant match)
 * - mustNotInclude (optional): tokens that MUST NOT appear (e.g. `while` when
 *                              the section requires a `for` loop)
 * - extractor (optional)     : RegExp slicing the relevant range out of full
 *                              student source. When omitted, full source is searched.
 */
export interface MainSectionSpec {
  id: string;
  label: string;
  mustInclude: string[];
  mustNotInclude?: string[];
  extractor?: RegExp;
}

export interface SectionGrade {
  id: string;
  label: string;
  pass: boolean;
  missing: string[];
  forbiddenHit: string[];
}

/**
 * Optional structured wrapper around MainWriteCardData. Kept extension-only
 * so the underlying schema stays locked.
 */
export interface MainWriteCardExtras {
  /** Prior context shown in the LEFT pane (read-only). */
  contextStruct?: string;
  /** Prior context shown in the LEFT pane (read-only). */
  contextReadFn?: string;
  /** Pre-seeded scaffold for the editor. Empty/undefined = cold-start. */
  scaffold?: string;
  /** Per-blank section graders. If omitted, falls back to keyChecks-only grading. */
  sections?: MainSectionSpec[];
  /** Top-level structural tokens (e.g. ["const int MAX", "return 0"]). */
  structuralRequired?: string[];
}

export interface MainWriteCardProps {
  card: MainWriteCardData;
  extras?: MainWriteCardExtras;
  onComplete: (correct: boolean) => void;
}

// ─────────────────────────────────────────────────────────────────────
// Internal: section grader (operator-spacing-tolerant)
// ─────────────────────────────────────────────────────────────────────

/**
 * Mirror of grading-write.ts normalizeLenient (operator-spacing tolerant).
 * Inlined here because grading-write.ts's normalizeLenient is tuned for
 * char-match scoring (collapses braces around tokens) — too aggressive
 * for substring search. We use a milder version that ONLY normalizes
 * operator spacing.
 */
function normForSearch(s: string): string {
  let n = s.toLowerCase();
  // Tabs -> 4 spaces, then collapse runs of whitespace to 1 space.
  n = n.replace(/\t/g, "    ").replace(/\s+/g, " ");
  // Strip spaces around C++ operators (multi-char first).
  n = n.replace(/\s*(>>|<<|>=|<=|!=|==|\+=|-=|\*=|\/=|%=|&&|\|\|)\s*/g, "$1");
  n = n.replace(/\s*([=<>+\-*/%&|!])\s*/g, "$1");
  return n.trim();
}

function gradeSection(
  fullSource: string,
  spec: MainSectionSpec
): SectionGrade {
  const slice = spec.extractor
    ? fullSource.match(spec.extractor)?.[0] ?? ""
    : fullSource;
  const norm = normForSearch(slice);

  const missing: string[] = [];
  for (const tok of spec.mustInclude) {
    if (!norm.includes(normForSearch(tok))) missing.push(tok);
  }
  const forbiddenHit: string[] = [];
  for (const tok of spec.mustNotInclude ?? []) {
    if (norm.includes(normForSearch(tok))) forbiddenHit.push(tok);
  }
  return {
    id: spec.id,
    label: spec.label,
    pass: missing.length === 0 && forbiddenHit.length === 0,
    missing,
    forbiddenHit,
  };
}

function gradeStructural(fullSource: string, required: string[]): {
  pass: boolean;
  missing: string[];
} {
  const norm = normForSearch(fullSource);
  const missing: string[] = [];
  for (const tok of required) {
    if (!norm.includes(normForSearch(tok))) missing.push(tok);
  }
  return { pass: missing.length === 0, missing };
}

// ─────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────

export function MainWriteCard({
  card,
  extras,
  onComplete,
}: MainWriteCardProps) {
  // Initial value: scaffold (if provided) or empty for cold-start.
  const initial = extras?.scaffold ?? "";
  const [code, setCode] = useState<string>(initial);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [result, setResult] = useState<{
    overall: WriteGradeResult;
    sections: SectionGrade[];
    structural: { pass: boolean; missing: string[] };
  } | null>(null);

  // If the card itself changes (e.g. story switch), reset.
  const cardId = card.id;
  useEffect(() => {
    setCode(extras?.scaffold ?? "");
    setSubmitted(false);
    setResult(null);
  }, [cardId, extras?.scaffold]);

  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  // ── Submit handler ───────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    // 1) Run the underlying lib grader (brace balance + keyChecks + char-match)
    const overall = gradeWrite(code, {
      canonicalAnswer: card.canonicalAnswer,
      keyChecks: card.keyChecks,
      forbiddenTokens: card.forbiddenTokens,
      requireSemicolon: true,
    });

    // 2) Sectional grading (per blank/comment-block)
    const sections = (extras?.sections ?? []).map((s) =>
      gradeSection(code, s)
    );

    // 3) Structural grading (top-level "const int MAX", "return 0", …)
    const structural = gradeStructural(
      code,
      extras?.structuralRequired ?? []
    );

    setResult({ overall, sections, structural });
    setSubmitted(true);

    // Card is correct if EVERY layer passes.
    const allSectionsPass = sections.every((s) => s.pass);
    const correct = overall.pass && allSectionsPass && structural.pass;
    onComplete(correct);
  }, [
    code,
    card.canonicalAnswer,
    card.keyChecks,
    card.forbiddenTokens,
    extras?.sections,
    extras?.structuralRequired,
    onComplete,
  ]);

  // ── Reset to scaffold (post-submit retry) ────────────────────────
  const handleRetry = useCallback(() => {
    setCode(extras?.scaffold ?? "");
    setSubmitted(false);
    setResult(null);
  }, [extras?.scaffold]);

  // ── Live-region announcement string ──────────────────────────────
  const liveAnnouncement = useMemo(() => {
    if (!result) return "";
    const parts: string[] = [];
    parts.push(
      result.overall.pass &&
        result.sections.every((s) => s.pass) &&
        result.structural.pass
        ? "All sections passed."
        : `${result.sections.filter((s) => !s.pass).length + (result.structural.pass ? 0 : 1)} section${
            result.sections.filter((s) => !s.pass).length +
              (result.structural.pass ? 0 : 1) ===
            1
              ? ""
              : "s"
          } failed.`
    );
    for (const s of result.sections) {
      parts.push(`${s.label}: ${s.pass ? "pass" : "fail"}.`);
    }
    if (extras?.structuralRequired?.length) {
      parts.push(
        `Structure: ${result.structural.pass ? "pass" : "fail"}.`
      );
    }
    return parts.join(" ");
  }, [result, extras?.structuralRequired]);

  // ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="mwc-root"
      role="group"
      aria-label="Main-function writing exercise"
    >
      <style>{MWC_STYLES}</style>

      {/* ─── Spec + context (top) ─── */}
      <section
        className="mwc-spec-block"
        aria-label="Exercise specification and prior context"
      >
        <p className="mwc-prompt">{card.prompt}</p>

        {extras?.contextStruct && (
          <div
            className="mwc-context"
            aria-label="Previously-defined struct (read-only)"
          >
            <h3 className="mwc-h3">Struct (already defined)</h3>
            <pre className="mwc-context-code">
              <code>{extras.contextStruct}</code>
            </pre>
          </div>
        )}

        {extras?.contextReadFn && (
          <div
            className="mwc-context"
            aria-label="Previously-defined read function (read-only)"
          >
            <h3 className="mwc-h3">Read function (already defined)</h3>
            <pre className="mwc-context-code">
              <code>{extras.contextReadFn}</code>
            </pre>
          </div>
        )}
      </section>

      {/* ─── Editor + submit + feedback (below) ─── */}
      <main className="mwc-right" aria-label="Main-function editor">
        <div className="mwc-editor-shell">
          <CodeEditor
            value={code}
            onChange={setCode}
            language="cpp"
            ariaLabel="Write your int main() function here"
            placeholder="// Write int main() { … } below"
            lineNumbers
            showBraceMatch
          />
        </div>

        <div className="mwc-actions">
          {!submitted ? (
            <button
              type="button"
              className="mwc-btn mwc-btn-primary"
              onClick={handleSubmit}
              aria-label="Submit your main() for grading"
            >
              Submit (Ctrl+Enter)
            </button>
          ) : (
            <button
              type="button"
              className="mwc-btn mwc-btn-secondary"
              onClick={handleRetry}
              aria-label="Reset and try again"
            >
              Try again
            </button>
          )}
        </div>

        {/* aria-live announces the WHOLE feedback block whenever it changes. */}
        <div
          ref={liveRegionRef}
          className="mwc-sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          {liveAnnouncement}
        </div>

        {/* ───── Sectional feedback panel ───── */}
        {submitted && result && (
          <section
            className="mwc-feedback"
            aria-label="Sectional grading feedback"
          >
            <h3 className="mwc-h3">
              {result.overall.pass &&
              result.sections.every((s) => s.pass) &&
              result.structural.pass
                ? "All sections passed"
                : "Some sections failed"}
            </h3>

            <ul className="mwc-section-list">
              {result.sections.map((s) => (
                <li
                  key={s.id}
                  className={`mwc-section-row ${s.pass ? "pass" : "fail"}`}
                  aria-label={`${s.label}: ${s.pass ? "pass" : "fail"}`}
                >
                  <span
                    className="mwc-section-icon"
                    aria-hidden="true"
                  >
                    {s.pass ? "[OK]" : "[X]"}
                  </span>
                  <span className="mwc-section-label">{s.label}</span>
                  {!s.pass && s.missing.length > 0 && (
                    <span className="mwc-section-missing">
                      missing: {s.missing.map((m) => `\`${m}\``).join(", ")}
                    </span>
                  )}
                  {!s.pass && s.forbiddenHit.length > 0 && (
                    <span className="mwc-section-forbidden">
                      forbidden: {s.forbiddenHit.map((m) => `\`${m}\``).join(", ")}
                    </span>
                  )}
                </li>
              ))}

              {extras?.structuralRequired &&
                extras.structuralRequired.length > 0 && (
                  <li
                    className={`mwc-section-row ${
                      result.structural.pass ? "pass" : "fail"
                    }`}
                    aria-label={`Top-level structure: ${
                      result.structural.pass ? "pass" : "fail"
                    }`}
                  >
                    <span
                      className="mwc-section-icon"
                      aria-hidden="true"
                    >
                      {result.structural.pass ? "[OK]" : "[X]"}
                    </span>
                    <span className="mwc-section-label">
                      Top-level structure
                    </span>
                    {!result.structural.pass && (
                      <span className="mwc-section-missing">
                        missing:{" "}
                        {result.structural.missing
                          .map((m) => `\`${m}\``)
                          .join(", ")}
                      </span>
                    )}
                  </li>
                )}
            </ul>

            {/* Underlying-grader errors (brace mismatch, char-mismatch, etc.) */}
            {result.overall.errors.length > 0 && (
              <details className="mwc-overall-errors">
                <summary>Other findings ({result.overall.errors.length})</summary>
                <ul>
                  {result.overall.errors.map((e, i) => (
                    <li key={i}>
                      <strong>{e.kind}</strong>: {e.message}
                    </li>
                  ))}
                </ul>
              </details>
            )}

            {/* Explanation (always shown post-submit) */}
            <details className="mwc-explanation" open>
              <summary>Explanation</summary>
              <p>{card.explanation}</p>
            </details>
          </section>
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Component-scoped CSS (matches CodeEditor pattern: inline so the layout
// cannot drift). Theme tokens come from src-v2/theme.css.
// ─────────────────────────────────────────────────────────────────────

const MWC_STYLES = `
.mwc-root {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: var(--bg-0, #0d1117);
  color: var(--text-0, #e6edf3);
  font-family: var(--font-sans, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif);
  min-height: 100%;
}

.mwc-h3 {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0 0 6px;
  color: var(--text-1, #8b949e);
}

.mwc-spec-block {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.mwc-spec-block .mwc-prompt {
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: var(--text-0, #e6edf3);
  white-space: pre-wrap;
}
.mwc-context-code {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  padding: 10px 12px;
  font-family: var(--font-mono, "JetBrains Mono", "Fira Code", ui-monospace, Consolas, monospace);
  font-size: 12.5px;
  line-height: 1.5;
  white-space: pre;
  overflow: auto;
  margin: 0;
  color: var(--text-0, #e6edf3);
}

.mwc-right {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}
.mwc-editor-shell {
  flex: 1 1 auto;
  min-height: 320px;
  display: flex;
}
.mwc-editor-shell > * { flex: 1 1 auto; }

.mwc-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
.mwc-btn {
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 18px;
  border-radius: 4px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background 100ms ease-out, border-color 100ms ease-out;
}
.mwc-btn-primary {
  background: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  border-color: var(--accent-cyan, #79c0ff);
}
.mwc-btn-primary:hover { filter: brightness(1.08); }
.mwc-btn-primary:focus-visible {
  outline: 2px solid var(--state-info, #58a6ff);
  outline-offset: 2px;
}
.mwc-btn-secondary {
  background: var(--bg-2, #1f2937);
  color: var(--text-0, #e6edf3);
  border-color: var(--border-2, #484f58);
}
.mwc-btn-secondary:hover { background: var(--bg-3, #2d333b); }

.mwc-feedback {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.mwc-section-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.mwc-section-row {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: baseline;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  border-left: 3px solid transparent;
  font-size: 13.5px;
  background: var(--bg-2, #1f2937);
}
.mwc-section-row.pass {
  border-left-color: var(--state-ok, #3fb950);
}
.mwc-section-row.fail {
  border-left-color: var(--state-err, #f85149);
}
.mwc-section-icon {
  font-family: var(--font-mono, monospace);
  color: var(--text-1, #8b949e);
}
.mwc-section-row.pass .mwc-section-icon { color: var(--state-ok, #3fb950); }
.mwc-section-row.fail .mwc-section-icon { color: var(--state-err, #f85149); }
.mwc-section-label {
  font-weight: 500;
  color: var(--text-0, #e6edf3);
}
.mwc-section-missing,
.mwc-section-forbidden {
  display: block;
  grid-column: 2 / 3;
  font-family: var(--font-mono, monospace);
  font-size: 12px;
  color: var(--text-2, #6e7681);
  margin-top: 2px;
}
.mwc-section-row.fail .mwc-section-missing { color: var(--state-err, #f85149); }
.mwc-section-row.fail .mwc-section-forbidden { color: var(--state-warn, #d29922); }

.mwc-overall-errors,
.mwc-explanation {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 13px;
}
.mwc-overall-errors summary,
.mwc-explanation summary {
  cursor: pointer;
  font-weight: 500;
  color: var(--text-0, #e6edf3);
}
.mwc-overall-errors ul {
  margin: 8px 0 0;
  padding-left: 18px;
}
.mwc-explanation p {
  margin: 8px 0 0;
  line-height: 1.6;
}

/* Visually-hidden but screen-reader-available */
.mwc-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
`;
