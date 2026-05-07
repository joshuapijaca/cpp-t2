/**
 * CodeEditor.stories.tsx
 *
 * Visual + interaction stories for CodeEditor + BraceMatcher.
 *
 * Five required stories:
 *   1. Empty            — placeholder visible, gutter shows "1"
 *   2. Simple program   — hello-world, all token colors visible
 *   3. Struct definition — nested braces, depth coloring engaged
 *   4. Function with for-loop — operators, keywords, indentation
 *   5. Brace mismatch demo — unmatched closer should highlight in red
 *
 * The story format here is plain React (no Storybook config assumed yet).
 * If/when Storybook lands, swap the default-export wrapper for a Meta.
 */

import { useState } from "react";
import { CodeEditor } from "../CodeEditor";
import { BraceMatcher } from "../BraceMatcher";

// ─────────────────────────────────────────────────────────────────────
// Story 1: Empty editor
// ─────────────────────────────────────────────────────────────────────
export function EmptyEditor() {
  const [code, setCode] = useState("");
  return (
    <Frame title="1. Empty editor (placeholder)">
      <CodeEditor
        value={code}
        onChange={setCode}
        language="cpp"
        ariaLabel="Empty C++ editor"
        placeholder="// Start typing C++ here…"
      />
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Story 2: Simple program
// ─────────────────────────────────────────────────────────────────────
export function SimpleProgram() {
  const [code, setCode] = useState(
    `#include <iostream>
using namespace std;

int main()
{
    int x = 42;
    double pi = 3.14;
    string name = "Joshua";
    cout << "Hello, " << name << endl;
    return 0;
}
`,
  );
  return (
    <Frame title="2. Simple program (every token type visible)">
      <CodeEditor
        value={code}
        onChange={setCode}
        language="cpp"
        ariaLabel="Hello world C++ program"
      />
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Story 3: Struct definition
// ─────────────────────────────────────────────────────────────────────
export function StructDefinition() {
  const [code, setCode] = useState(
    `struct Address
{
    string street;
    string city;
    int postcode;
};

struct Person
{
    string name;
    int age;
    Address home;
};
`,
  );
  return (
    <Frame title="3. Struct definition (nested-brace depth color)">
      <CodeEditor
        value={code}
        onChange={setCode}
        language="cpp"
        ariaLabel="Struct definition exercise"
      />
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Story 4: Function with for-loop
// ─────────────────────────────────────────────────────────────────────
export function FunctionWithForLoop() {
  const [code, setCode] = useState(
    `int sum_first_n(int n)
{
    int total = 0;
    for (int i = 1; i <= n; i++)
    {
        total += i;
    }
    return total;
}
`,
  );
  return (
    <Frame title="4. Function with for-loop (operators + nesting)">
      <CodeEditor
        value={code}
        onChange={setCode}
        language="cpp"
        ariaLabel="Sum-of-first-n function"
      />
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Story 5: Brace mismatch demo
// ─────────────────────────────────────────────────────────────────────
export function BraceMismatchDemo() {
  // Deliberately missing the closing '}' of the inner block.
  const [code, setCode] = useState(
    `int main()
{
    if (x > 0)
    {
        cout << "positive" << endl;
    // <- missing closer below
    return 0;
}
`,
  );

  // Track caret pos via a controlled wrapper that wires to the textarea.
  // The story uses BraceMatcher's standalone view to display status text.
  const [caretPos, setCaretPos] = useState(0);
  const wrapperRef = (el: HTMLDivElement | null) => {
    if (!el) return;
    const ta = el.querySelector("textarea");
    if (!ta) return;
    ta.addEventListener("keyup", () => setCaretPos(ta.selectionStart));
    ta.addEventListener("click", () => setCaretPos(ta.selectionStart));
  };

  return (
    <Frame title="5. Brace mismatch demo">
      <div ref={wrapperRef}>
        <CodeEditor
          value={code}
          onChange={setCode}
          language="cpp"
          ariaLabel="Brace mismatch demo (deliberately broken)"
          showBraceMatch
        />
      </div>
      <div style={{ marginTop: 8 }}>
        <strong style={{ marginRight: 8 }}>BraceMatcher status:</strong>
        <BraceMatcher code={code} caretPos={caretPos} />
      </div>
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Combined demo page that mounts every story in sequence.
// Useful when there is no Storybook runner yet.
// ─────────────────────────────────────────────────────────────────────
export default function CodeEditorStories() {
  return (
    <div
      style={{
        display: "grid",
        gap: 24,
        padding: 24,
        background: "var(--bg-0, #0d1117)",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ color: "var(--text-0, #e6edf3)", fontFamily: "system-ui" }}>
        CodeEditor primitive — visual stories
      </h1>
      <EmptyEditor />
      <SimpleProgram />
      <StructDefinition />
      <FunctionWithForLoop />
      <BraceMismatchDemo />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Tiny shared frame wrapper. Keeps every story visually consistent
// without dragging in a UI lib.
// ─────────────────────────────────────────────────────────────────────
function Frame({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2
        style={{
          color: "var(--text-1, #8b949e)",
          fontFamily: "system-ui",
          fontSize: 14,
          fontWeight: 500,
          margin: "0 0 8px",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
