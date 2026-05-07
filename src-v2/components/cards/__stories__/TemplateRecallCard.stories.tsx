/**
 * TemplateRecallCard.stories.tsx
 *
 * Five plain-React stories drilling the canonical SIT102 Test 2 skeletons:
 *   1. struct definition
 *   2. classic for-loop
 *   3. pass-by-reference function signature
 *   4. nested brace-init
 *   5. main() body
 *
 * Each story shows the 3-stage card in line-by-line mode by default; the
 * mode-toggle in <Frame> swaps to all-at-once for any story.
 *
 * Same plain-React format as CodeEditor.stories.tsx — drop a Meta export
 * here if/when @storybook/react lands.
 */

import { useState, type ReactNode } from "react";
import { TemplateRecallCard, type TemplateRecallMode } from "../TemplateRecallCard";
import type { TemplateRecallCard as TemplateRecallCardData } from "../../../types/card-schema";

// Shared dummy data factory keeps the per-story call sites short.
function makeCard(
  id: string,
  prompt: string,
  canonical: string,
  template: string,
  explanation: string,
): TemplateRecallCardData {
  return {
    id,
    schemaVersion: "v2",
    type: "TemplateRecallCard",
    atomId: "F-22",
    qTags: ["Q3"],
    stage: 1,
    level: "L0",
    stem: prompt,
    prompt,
    template,
    canonicalAnswer: canonical,
    keyChecks: [],
    forbiddenTokens: [],
    explanation,
    commonMistakeIds: [],
    status: "NEW",
    createdBy: "TRC-stories",
    reviewedBy: [],
    source: { kind: "v2", ref: "TemplateRecallCard.stories.tsx" },
  };
}

function Frame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      style={{
        margin: "16px 0",
        padding: "12px 16px",
        background: "var(--bg-1, #161b22)",
        border: "1px solid var(--border-1, #30363d)",
        borderRadius: 8,
      }}
    >
      <h3
        style={{
          margin: "0 0 12px 0",
          color: "var(--accent-cyan, #79c0ff)",
          fontFamily: "var(--font-mono, ui-monospace, monospace)",
          fontSize: 14,
        }}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

function ModeToggle({
  mode,
  setMode,
}: {
  mode: TemplateRecallMode;
  setMode: (m: TemplateRecallMode) => void;
}) {
  return (
    <div style={{ marginBottom: 8, display: "flex", gap: 8 }}>
      <label style={{ fontSize: 12, color: "var(--text-1, #8b949e)" }}>
        mode:&nbsp;
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as TemplateRecallMode)}
        >
          <option value="line-by-line">line-by-line</option>
          <option value="all-at-once">all-at-once</option>
        </select>
      </label>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Story 1: struct definition — `struct Point { double x; double y; };`
// ─────────────────────────────────────────────────────────────────────
export function StructDefinition() {
  const [mode, setMode] = useState<TemplateRecallMode>("line-by-line");
  const [last, setLast] = useState<string>("");
  const card = makeCard(
    "trc-story-struct",
    "Recall the struct definition for a 2D Point with double x and y.",
    `struct Point
{
    double x;
    double y;
};`,
    "struct ___\n{\n    ___ ___;\n    ___ ___;\n};",
    "struct keyword + type name + brace block + semicolon-terminated fields + closing `};` (do NOT forget the trailing semicolon).",
  );
  return (
    <Frame title="1. Struct definition (struct Point { double x; double y; };)">
      <ModeToggle mode={mode} setMode={setMode} />
      <TemplateRecallCard
        card={card}
        mode={mode}
        studySeconds={5}
        onComplete={(ok) => setLast(ok ? "PASS" : "FAIL")}
      />
      <p style={{ fontSize: 12, marginTop: 8 }}>
        last result: <strong>{last || "—"}</strong>
      </p>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Story 2: classic for-loop — `for (int i = 0; i < n; i++) { ... }`
// ─────────────────────────────────────────────────────────────────────
export function ForLoop() {
  const [mode, setMode] = useState<TemplateRecallMode>("line-by-line");
  const [last, setLast] = useState<string>("");
  const card = makeCard(
    "trc-story-for",
    "Recall the classic counted for-loop that prints i for i in [0, n).",
    `for (int i = 0; i < n; i++)
{
    cout << i << endl;
}`,
    "for (___ ___ = ___; ___ < ___; ___++)\n{\n    ___ << ___ << ___;\n}",
    "init / condition / step in three semicolon-separated clauses; brace-block body with cout chain.",
  );
  return (
    <Frame title="2. Classic for-loop">
      <ModeToggle mode={mode} setMode={setMode} />
      <TemplateRecallCard
        card={card}
        mode={mode}
        studySeconds={5}
        onComplete={(ok) => setLast(ok ? "PASS" : "FAIL")}
      />
      <p style={{ fontSize: 12, marginTop: 8 }}>
        last result: <strong>{last || "—"}</strong>
      </p>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Story 3: pass-by-reference signature — `void name(Type &x)`
// ─────────────────────────────────────────────────────────────────────
export function PassByRefSignature() {
  const [mode, setMode] = useState<TemplateRecallMode>("line-by-line");
  const [last, setLast] = useState<string>("");
  const card = makeCard(
    "trc-story-pbr",
    "Recall the function definition that doubles its argument in place by reference.",
    `void doubleIt(int &x)
{
    x = x * 2;
}`,
    "___ ___(___ &___)\n{\n    ___ = ___ * ___;\n}",
    "Return type + name + parens with `Type &param` (the `&` glues to the parameter to mark a reference).",
  );
  return (
    <Frame title="3. Pass-by-reference signature (void name(Type &x))">
      <ModeToggle mode={mode} setMode={setMode} />
      <TemplateRecallCard
        card={card}
        mode={mode}
        studySeconds={6}
        onComplete={(ok) => setLast(ok ? "PASS" : "FAIL")}
      />
      <p style={{ fontSize: 12, marginTop: 8 }}>
        last result: <strong>{last || "—"}</strong>
      </p>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Story 4: nested brace-init — `Type x = {{a, b, c}, init};`
// ─────────────────────────────────────────────────────────────────────
export function NestedBraceInit() {
  const [mode, setMode] = useState<TemplateRecallMode>("line-by-line");
  const [last, setLast] = useState<string>("");
  const card = makeCard(
    "trc-story-brace-init",
    "Recall the brace-initializer for a Player struct holding a Point and a name.",
    `Player p = {{0.0, 0.0}, "anon"};`,
    "___ ___ = {{___, ___}, ___};",
    "Outer braces wrap the whole struct; inner braces wrap the nested Point's two doubles; final field is a string literal.",
  );
  return (
    <Frame title="4. Nested brace-init (Type x = {{a, b, c}, init};)">
      <ModeToggle mode={mode} setMode={setMode} />
      <TemplateRecallCard
        card={card}
        mode={mode}
        studySeconds={4}
        onComplete={(ok) => setLast(ok ? "PASS" : "FAIL")}
      />
      <p style={{ fontSize: 12, marginTop: 8 }}>
        last result: <strong>{last || "—"}</strong>
      </p>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Story 5: main() body — `int main() { ... return 0; }`
// ─────────────────────────────────────────────────────────────────────
export function MainBody() {
  const [mode, setMode] = useState<TemplateRecallMode>("line-by-line");
  const [last, setLast] = useState<string>("");
  const card = makeCard(
    "trc-story-main",
    "Recall the bare-bones main() that prints Hello and returns 0.",
    `int main()
{
    cout << "Hello" << endl;
    return 0;
}`,
    "___ ___()\n{\n    ___ << ___ << ___;\n    ___ ___;\n}",
    "`int main()` (no args), brace-block, cout chain, explicit `return 0;` (good style; avoids implicit-return surprises).",
  );
  return (
    <Frame title="5. main() body (int main() { ... return 0; })">
      <ModeToggle mode={mode} setMode={setMode} />
      <TemplateRecallCard
        card={card}
        mode={mode}
        studySeconds={5}
        onComplete={(ok) => setLast(ok ? "PASS" : "FAIL")}
      />
      <p style={{ fontSize: 12, marginTop: 8 }}>
        last result: <strong>{last || "—"}</strong>
      </p>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Default export: render-all wrapper for ad-hoc previews.
// ─────────────────────────────────────────────────────────────────────
export default function TemplateRecallCardStories() {
  return (
    <div style={{ padding: 24, background: "var(--bg-0, #0d1117)" }}>
      <h2 style={{ color: "var(--text-0, #e6edf3)" }}>
        TemplateRecallCard — 5 verbatim-recall stories
      </h2>
      <StructDefinition />
      <ForLoop />
      <PassByRefSignature />
      <NestedBraceInit />
      <MainBody />
    </div>
  );
}
