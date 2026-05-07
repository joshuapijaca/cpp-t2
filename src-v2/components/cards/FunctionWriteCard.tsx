/**
 * FunctionWriteCard.tsx — cpp-t2 Option 4 / Q3 card.
 *
 * Q3 of SIT102 Test 2 is the read-array-of-structs question. Students must
 * write a function with the shape:
 *
 *     void read_X(X &list[], int n)
 *     {
 *         for (int i = 0; i < n; i++)
 *         {
 *             cin >> list[i].field1;
 *             cin >> list[i].field2;
 *             // ...
 *         }
 *     }
 *
 * Q3 carries ~25% of the total test points — a single missing `&` here wipes
 * out the whole question. So this card has two grading channels:
 *
 *   1. Signature — must be a verbatim char-match of the canonical opener
 *      (after lenient-whitespace normalization). Surfaces the four hot
 *      tokens individually: `void`, `&`, `[]`, `int`.
 *   2. Body — keyChecks must all appear (e.g. `for`, `cin >>`, `list[i].`).
 *      Forbidden tokens (e.g. `cout`, `return`) must NOT appear.
 *
 * Layout (paper-sim, vertical stack — matches Test 2 exam paper Q3):
 *
 *   ┌────────────────────────────────────────────────────────────────┐
 *   │ Prompt — English description of what the function does         │
 *   │ Given signature: void read_X(X &list[], int n)                 │
 *   │ Given struct context (when present)                            │
 *   ├────────────────────────────────────────────────────────────────┤
 *   │ CodeEditor — signature pinned, body writable, } pinned         │
 *   ├────────────────────────────────────────────────────────────────┤
 *   │ [Submit (Ctrl+Enter)]                                           │
 *   ├────────────────────────────────────────────────────────────────┤
 *   │ Feedback — signature tokens + body keychecks + canonical        │
 *   └────────────────────────────────────────────────────────────────┘
 *
 * Stripped (paper-sim — not on exam):
 *   - "Q3 — Read array of structs" eyebrow
 *   - Live brace counter widget
 *
 * The right-hand editor presents the *whole* function (signature + open brace
 * + indent + body cursor + close brace). The signature line and the trailing
 * `}` line are visually pinned (read-only), but mechanically the student
 * types into a single CodeEditor — we glue the immutable header/footer back
 * on at submit time and grade the body characters in isolation.
 *
 * Keyboard:
 *   - Tab inserts 4 spaces (CodeEditor primitive).
 *   - Ctrl+Enter submits.
 *   - Esc blurs editor.
 *
 * Accessibility:
 *   - role="region" + aria-label on each pane.
 *   - aria-live="polite" on feedback.
 *   - Tab order: spec → signature display → editor → submit.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CodeEditor, type CodeEditorHandle } from "../primitives/CodeEditor";
import type { FunctionWriteCard as FunctionWriteCardData } from "../../types/card-schema";

// ─────────────────────────────────────────────────────────────────────
// Grading helpers (local fallback if grading-write.ts has not landed)
// ─────────────────────────────────────────────────────────────────────
//
// These mirror the contract that another agent's `lib/grading-write.ts`
// is expected to expose. When the shared module ships, this file simply
// drops the local implementation and switches to the import — the
// signatures are kept identical on purpose.

interface GradeSignatureResult {
  ok: boolean;
  /** Per-required-token presence, in declaration order. */
  tokenChecks: { token: string; ok: boolean }[];
  /** Inline char-match diff: `=` keep, `+` student-extra, `-` missing. */
  diff: string;
  /** Plain-English explanation of the first failing token. */
  explanation: string;
}

interface GradeBodyResult {
  ok: boolean;
  keyCheckResults: { needle: string; ok: boolean }[];
  forbiddenHits: string[];
  explanation: string;
}

/** Strip trailing whitespace per line + collapse runs of >1 internal space. */
function normalizeLenient(s: string): string {
  return s
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, "").replace(/[ \t]+/g, " "))
    .join("\n")
    .trim();
}

/** Tokens we always expect on a Q3 signature line. Order matters for diff. */
const Q3_REQUIRED_SIG_TOKENS = ["void", "&", "[]", "int"] as const;

function gradeSignature(
  studentSig: string,
  canonicalSig: string,
): GradeSignatureResult {
  const stuN = normalizeLenient(studentSig);
  const canN = normalizeLenient(canonicalSig);

  const tokenChecks = Q3_REQUIRED_SIG_TOKENS.map((token) => ({
    token,
    ok: stuN.includes(token),
  }));

  const charMatch = stuN === canN;
  const allTokens = tokenChecks.every((t) => t.ok);
  const ok = charMatch && allTokens;

  // Trivial line-level diff (good enough to surface "what's different").
  let diff = "";
  if (charMatch) {
    diff = `= ${stuN}`;
  } else {
    diff = `- ${canN}\n+ ${stuN}`;
  }

  const firstMiss = tokenChecks.find((t) => !t.ok);
  let explanation = "Signature matches the canonical form.";
  if (!ok) {
    if (firstMiss) {
      explanation = explainTokenMiss(firstMiss.token);
    } else {
      explanation =
        "Signature has all the required tokens but does not match the canonical form character-for-character (after whitespace normalization). Compare the diff above.";
    }
  }
  return { ok, tokenChecks, diff, explanation };
}

function explainTokenMiss(token: string): string {
  switch (token) {
    case "void":
      return "Q3's read function must return `void` — it fills the array via reference instead of returning anything.";
    case "&":
      return "The array parameter must be passed BY REFERENCE (`&`) — without it, the function writes into a copy and the caller's array stays empty.";
    case "[]":
      return "The parameter is an array — declare it with `[]` after the name (e.g. `Computer &list[]`).";
    case "int":
      return "You also need an `int n` parameter so the function knows how many records to read.";
    default:
      return `Missing required token: ${token}`;
  }
}

function gradeBody(
  studentBody: string,
  keyChecks: readonly string[],
  forbiddenTokens: readonly string[],
): GradeBodyResult {
  const stuN = normalizeLenient(studentBody);

  const keyCheckResults = keyChecks.map((needle) => ({
    needle,
    ok: stuN.includes(normalizeLenient(needle)),
  }));

  const forbiddenHits = forbiddenTokens.filter((tok) =>
    new RegExp(`\\b${escapeRegex(tok)}\\b`).test(stuN),
  );

  const allKeysPresent = keyCheckResults.every((k) => k.ok);
  const noForbidden = forbiddenHits.length === 0;
  const ok = allKeysPresent && noForbidden;

  let explanation = "Body covers every required pattern.";
  if (!ok) {
    if (!allKeysPresent) {
      const firstMiss = keyCheckResults.find((k) => !k.ok)!;
      explanation = `Body is missing the pattern \`${firstMiss.needle}\` — Q3 always reads each field with \`cin >>\` inside a counted \`for\` loop.`;
    } else if (forbiddenHits.length > 0) {
      explanation = `Body contains forbidden token(s): ${forbiddenHits
        .map((t) => "`" + t + "`")
        .join(", ")}. Q3 read functions only use cin (no cout, no return value).`;
    }
  }
  return { ok, keyCheckResults, forbiddenHits, explanation };
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ─────────────────────────────────────────────────────────────────────
// Header / footer extraction from canonicalAnswer
// ─────────────────────────────────────────────────────────────────────
//
// The card's `canonicalAnswer` always looks like:
//
//   void read_X(X &list[], int n)
//   {
//       <body>
//   }
//
// We split it into:
//   - signature : the first line (read-only)
//   - openBrace : the literal `{` on its own line (read-only)
//   - body      : the editable middle (initially empty for the student)
//   - closeBrace: the trailing `}` (read-only)

interface TemplateParts {
  signature: string;
  openBrace: string;
  body: string;
  closeBrace: string;
}

function splitCanonical(canonical: string): TemplateParts {
  const lines = canonical.replace(/\r\n/g, "\n").split("\n");
  const sig = lines[0] ?? "";
  // Find first `{` line and last `}` line.
  const openIdx = lines.findIndex((l, i) => i > 0 && l.trim() === "{");
  let closeIdx = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i]!.trim() === "}") {
      closeIdx = i;
      break;
    }
  }
  if (openIdx === -1 || closeIdx === -1 || closeIdx <= openIdx) {
    // Fallback: treat the whole thing as body.
    return {
      signature: sig,
      openBrace: "{",
      body: "",
      closeBrace: "}",
    };
  }
  const bodyLines = lines.slice(openIdx + 1, closeIdx);
  return {
    signature: sig,
    openBrace: lines[openIdx] ?? "{",
    body: bodyLines.join("\n"),
    closeBrace: lines[closeIdx] ?? "}",
  };
}

// ─────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────

export interface FunctionWriteCardProps {
  card: FunctionWriteCardData;
  onComplete: (correct: boolean) => void;
  /** Optional struct definition shown as read-only context above the spec. */
  structContext?: string;
}

export function FunctionWriteCard({
  card,
  onComplete,
  structContext,
}: FunctionWriteCardProps) {
  // Carve up canonical so we know what the student's body has to look like.
  const parts = useMemo(() => splitCanonical(card.canonicalAnswer), [card]);

  // The CodeEditor holds the WHOLE function (header + body + footer) so the
  // student sees their work inside the framing they will mark on the test.
  // We blank the body initially.
  const initial = useMemo(
    () =>
      [
        parts.signature,
        parts.openBrace,
        "    ", // single blank indented line so the caret has somewhere to land
        parts.closeBrace,
        "",
      ].join("\n"),
    [parts],
  );

  const [code, setCode] = useState(initial);
  // Reset editor whenever the card changes (e.g. story switch).
  useEffect(() => setCode(initial), [initial]);

  const [feedback, setFeedback] = useState<{
    sig: GradeSignatureResult;
    body: GradeBodyResult;
    overall: boolean;
  } | null>(null);

  const editorRef = useRef<CodeEditorHandle>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  // Pull the student's body back out of the editor by stripping the framing.
  const extractBody = useCallback(
    (full: string): string => {
      // Strategy: find the canonical signature line + opener, slice from
      // opener+1 up to the LAST `}` in the buffer. If the student deleted
      // the framing we still grade what's left.
      const lines = full.replace(/\r\n/g, "\n").split("\n");
      // Find the open brace index that follows the signature.
      let sigIdx = lines.findIndex((l) => l.trim() === parts.signature.trim());
      if (sigIdx === -1) sigIdx = 0;
      let openIdx = -1;
      for (let i = sigIdx; i < lines.length; i++) {
        if (lines[i]!.trim() === "{") {
          openIdx = i;
          break;
        }
      }
      let closeIdx = -1;
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i]!.trim() === "}") {
          closeIdx = i;
          break;
        }
      }
      if (openIdx === -1 || closeIdx === -1 || closeIdx <= openIdx) {
        return full;
      }
      return lines.slice(openIdx + 1, closeIdx).join("\n");
    },
    [parts],
  );

  const extractSignature = useCallback(
    (full: string): string => {
      const lines = full.replace(/\r\n/g, "\n").split("\n");
      // First non-empty line is the signature attempt.
      const firstReal = lines.find((l) => l.trim() !== "");
      return firstReal ?? "";
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    const studentSig = extractSignature(code);
    const studentBody = extractBody(code);

    const sig = gradeSignature(studentSig, parts.signature);
    const body = gradeBody(
      studentBody,
      card.keyChecks,
      card.forbiddenTokens,
    );
    const overall = sig.ok && body.ok;
    setFeedback({ sig, body, overall });
    onComplete(overall);
  }, [
    code,
    extractBody,
    extractSignature,
    parts.signature,
    card.keyChecks,
    card.forbiddenTokens,
    onComplete,
  ]);

  // Ctrl/Cmd+Enter from anywhere in the card submits.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSubmit]);

  return (
    <div className="fwc-root">
      <style>{FWC_STYLES}</style>

      <div className="fwc-stack">
        {/* ─── Prompt + given signature (top) ─── */}
        <section
          className="fwc-spec"
          role="region"
          aria-label="Question specification"
        >
          <p className="fwc-prompt">{card.prompt}</p>

          <h3 className="fwc-h-sub">Function signature (given)</h3>
          <pre className="fwc-readonly fwc-sig-line">{parts.signature}</pre>

          {structContext ? (
            <>
              <h3 className="fwc-h-sub">Given struct</h3>
              <pre className="fwc-readonly">{structContext}</pre>
            </>
          ) : null}
        </section>

        {/* ─── Editor (middle) ─── */}
        <section
          className="fwc-right"
          role="region"
          aria-label="Code editor — write the function body"
        >
          <div className="fwc-editor-wrap">
            <CodeEditor
              ref={editorRef}
              value={code}
              onChange={setCode}
              language="cpp"
              ariaLabel="C++ function body editor — type the for-loop and cin reads here"
              showBraceMatch
              lineNumbers
            />
          </div>

          <div className="fwc-toolbar" role="group" aria-label="Editor toolbar">
            <button
              ref={submitBtnRef}
              type="button"
              className="fwc-submit"
              onClick={handleSubmit}
              aria-label="Submit function (Ctrl+Enter)"
            >
              Submit (Ctrl+Enter)
            </button>
          </div>
        </section>
      </div>

      {/* ─────────────────────── feedback row ─────────────────────────────── */}
      {feedback ? (
        <div
          className={`fwc-feedback ${feedback.overall ? "ok" : "bad"}`}
          role="status"
          aria-live="polite"
        >
          <h3 className="fwc-h-sub">
            {feedback.overall ? "Pass" : "Needs fixing"}
          </h3>

          {/* Signature breakdown */}
          <div className="fwc-fb-section">
            <strong>Signature:</strong>{" "}
            {feedback.sig.ok ? "matches canonical." : "mismatch."}
            <ul className="fwc-token-list" aria-label="Required signature tokens">
              {feedback.sig.tokenChecks.map((t) => (
                <li key={t.token} className={t.ok ? "ok" : "bad"}>
                  <code>{t.token}</code>{" "}
                  <span className="fwc-mark">{t.ok ? "ok" : "missing"}</span>
                </li>
              ))}
            </ul>
            {!feedback.sig.ok ? (
              <pre className="fwc-diff">{feedback.sig.diff}</pre>
            ) : null}
            <p className="fwc-explain">{feedback.sig.explanation}</p>
          </div>

          {/* Body breakdown */}
          <div className="fwc-fb-section">
            <strong>Body:</strong>{" "}
            {feedback.body.ok ? "all key patterns present." : "missing patterns."}
            <ul className="fwc-token-list" aria-label="Required body patterns">
              {feedback.body.keyCheckResults.map((k) => (
                <li key={k.needle} className={k.ok ? "ok" : "bad"}>
                  <code>{k.needle}</code>{" "}
                  <span className="fwc-mark">{k.ok ? "ok" : "missing"}</span>
                </li>
              ))}
            </ul>
            {feedback.body.forbiddenHits.length > 0 ? (
              <p className="fwc-forbidden">
                Forbidden token(s) found:{" "}
                {feedback.body.forbiddenHits.map((t) => (
                  <code key={t}>{t}</code>
                ))}
              </p>
            ) : null}
            <p className="fwc-explain">{feedback.body.explanation}</p>
          </div>

          {/* Always show the canonical explanation block from the card. */}
          <details className="fwc-canon">
            <summary>Show canonical answer</summary>
            <pre className="fwc-readonly">{card.canonicalAnswer}</pre>
            <p className="fwc-explain">{card.explanation}</p>
          </details>
        </div>
      ) : null}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Component-scoped CSS
// ─────────────────────────────────────────────────────────────────────

const FWC_STYLES = `
.fwc-root {
  font-family: var(--font-sans, system-ui, -apple-system, "Segoe UI", sans-serif);
  color: var(--text-0, #e6edf3);
  background: var(--bg-0, #0d1117);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
}

.fwc-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.fwc-spec {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 12px 16px;
}
.fwc-h-sub {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-1, #8b949e);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 12px 0 6px;
}
.fwc-prompt {
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 1.55;
  color: var(--text-0, #e6edf3);
  white-space: pre-wrap;
}
.fwc-readonly {
  margin: 0;
  padding: 8px 12px;
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  color: var(--text-0, #e6edf3);
  font-family: var(--font-mono, "JetBrains Mono", ui-monospace, monospace);
  font-size: 13px;
  line-height: 1.55;
  overflow: auto;
  white-space: pre;
}
.fwc-sig-line {
  color: var(--accent-grn, #7ee787);
}
.fwc-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--text-2, #6e7681);
  line-height: 1.4;
}

/* ── Right pane ────────────────────────────────────────────────────── */
.fwc-right {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.fwc-editor-wrap {
  flex: 1;
  min-height: 22rem;
  display: flex;
}
.fwc-editor-wrap > * {
  flex: 1;
  min-height: 0;
}
.fwc-toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 4px 0;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 12px;
}
.fwc-submit {
  background: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  border: 0;
  border-radius: 4px;
  padding: 8px 14px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.fwc-submit:focus {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.fwc-submit:hover {
  filter: brightness(1.1);
}

/* ── Feedback row ──────────────────────────────────────────────────── */
.fwc-feedback {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 12px 16px;
}
.fwc-feedback.ok {
  border-color: var(--accent-grn, #7ee787);
}
.fwc-feedback.bad {
  border-color: var(--state-err, #f85149);
}
.fwc-fb-section {
  margin: 8px 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--border-1, #30363d);
}
.fwc-fb-section:last-of-type {
  border-bottom: 0;
}
.fwc-token-list {
  list-style: none;
  padding: 0;
  margin: 6px 0 6px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px 12px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 12px;
}
.fwc-token-list li.ok { color: var(--accent-grn, #7ee787); }
.fwc-token-list li.bad { color: var(--state-err, #f85149); }
.fwc-token-list .fwc-mark {
  font-style: italic;
  font-size: 11px;
  margin-left: 4px;
}
.fwc-diff {
  margin: 6px 0;
  padding: 8px 12px;
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 12px;
  white-space: pre;
  color: var(--text-0, #e6edf3);
}
.fwc-explain {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-1, #8b949e);
}
.fwc-forbidden {
  color: var(--state-err, #f85149);
  font-size: 13px;
  margin: 6px 0 0;
}
.fwc-forbidden code {
  margin: 0 4px;
  padding: 1px 4px;
  background: var(--bg-0, #0d1117);
  border-radius: 3px;
}
.fwc-canon {
  margin-top: 12px;
}
.fwc-canon summary {
  cursor: pointer;
  font-size: 12px;
  color: var(--text-1, #8b949e);
  user-select: none;
}
.fwc-canon[open] summary {
  color: var(--accent-cyan, #79c0ff);
}

`;

export default FunctionWriteCard;
