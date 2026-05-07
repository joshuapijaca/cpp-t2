/**
 * MemoryBoxes.stories.tsx
 *
 * Standalone visual previews for the paper-sim MemoryBoxes primitive.
 * Each export is a self-contained React component that mounts the
 * primitive with a fixture matching one shape category found in the
 * trace-card data audit (W2 recon). Mount any of these from a harness
 * route to visually verify the diagram renders 1:1 with the paper
 * exam answer format.
 *
 * Stories
 *   1. ScalarOnlyL0       — L0 trace fixture: int x; int y; int sum;
 *   2. StructWithArrayL1  — L1/Q1 fixture: stat_double { numbers[5], mystery }
 *   3. PassByRefL5        — L5/Q1 final exam shape: void f(stat_double &data)
 *   4. ScalarHistory      — strikethrough chain: x = 0 → 1 → 2 → 3 → 4 → 5
 *   5. EditableTrace      — student-input mode (live add to history)
 */

import { useState } from 'react';
import {
  MemoryBoxes,
  type HistoryMap,
  type VarShape,
  type ArrayInitMap,
  type PassByRefHint,
} from '../MemoryBoxes';

// ─────────────────────────────────────────────────────────────────────
// Story 1: Scalar-only (matches L0 F-03 trace fixture)
// ─────────────────────────────────────────────────────────────────────

export function ScalarOnlyL0() {
  const shapes: VarShape[] = [
    { kind: 'scalar', name: 'x', cppType: 'int' },
    { kind: 'scalar', name: 'y', cppType: 'int' },
    { kind: 'scalar', name: 'sum', cppType: 'int' },
  ];
  const history: HistoryMap = {
    x: ['5'],
    y: ['7'],
    sum: ['12'],
  };
  return (
    <div style={{ padding: 20, maxWidth: 720 }}>
      <h2 style={{ color: '#e6edf3', fontFamily: 'monospace', fontSize: 14 }}>
        Story 1 — ScalarOnlyL0
      </h2>
      <MemoryBoxes
        shapes={shapes}
        history={history}
        title="memory (L0 trace — int x = 5; int y = 7; int sum = x + y;)"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Story 2: Struct with array (Q1 stat_double shape)
// ─────────────────────────────────────────────────────────────────────

export function StructWithArrayL1() {
  const shapes: VarShape[] = [
    {
      kind: 'struct',
      name: 'd',
      structType: 'stat_double',
      fields: [
        { name: 'numbers', kind: 'array', size: 5, cppType: 'double' },
        { name: 'mystery', kind: 'scalar', cppType: 'double' },
      ],
    },
    { kind: 'scalar', name: 'i', cppType: 'int' },
  ];
  const history: HistoryMap = {
    'd.mystery': ['0.0', '-20.0', '3.2'],
    i: ['0', '1', '2', '3', '4', '5'],
  };
  const arrayInits: ArrayInitMap = {
    'd.numbers': ['-20.0', '3.2', '1.9', '-1.5', '1.3'],
  };
  return (
    <div style={{ padding: 20, maxWidth: 820 }}>
      <h2 style={{ color: '#e6edf3', fontFamily: 'monospace', fontSize: 14 }}>
        Story 2 — StructWithArrayL1 (Q1 shape, mid-execution)
      </h2>
      <MemoryBoxes
        shapes={shapes}
        history={history}
        arrayInits={arrayInits}
        title="memory (Q1 stat_double — strikethrough = past values)"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Story 3: Pass-by-reference (L5/Q1 exam shape)
// ─────────────────────────────────────────────────────────────────────

export function PassByRefL5() {
  const shapes: VarShape[] = [
    {
      kind: 'struct',
      name: 'd',
      structType: 'stat_double',
      fields: [
        { name: 'numbers', kind: 'array', size: 5, cppType: 'double' },
        { name: 'mystery', kind: 'scalar', cppType: 'double' },
      ],
    },
    { kind: 'scalar', name: 'i', cppType: 'int' },
  ];
  const history: HistoryMap = {
    'd.mystery': ['0.0', '-20.0', '3.2'],
    i: ['0', '1', '2', '3', '4', '5'],
  };
  const arrayInits: ArrayInitMap = {
    'd.numbers': ['-20.0', '3.2', '1.9', '-1.5', '1.3'],
  };
  const passByRef: PassByRefHint = { paramName: 'data', callerName: 'd' };
  return (
    <div style={{ padding: 20, maxWidth: 820 }}>
      <h2 style={{ color: '#e6edf3', fontFamily: 'monospace', fontSize: 14 }}>
        Story 3 — PassByRefL5 (void who_am_i(stat_double &amp;data) called as
        who_am_i(d))
      </h2>
      <MemoryBoxes
        shapes={shapes}
        history={history}
        arrayInits={arrayInits}
        passByRef={passByRef}
        title="memory (Q1 exam — pass-by-ref alias visible)"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Story 4: Long history chain (strikethrough rendering stress test)
// ─────────────────────────────────────────────────────────────────────

export function ScalarHistory() {
  const shapes: VarShape[] = [
    { kind: 'scalar', name: 'x', cppType: 'int' },
  ];
  const history: HistoryMap = {
    x: ['0', '1', '2', '3', '4', '5'],
  };
  return (
    <div style={{ padding: 20, maxWidth: 720 }}>
      <h2 style={{ color: '#e6edf3', fontFamily: 'monospace', fontSize: 14 }}>
        Story 4 — ScalarHistory (long strikethrough chain)
      </h2>
      <MemoryBoxes
        shapes={shapes}
        history={history}
        title="memory (loop counter — 6-step chain)"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Story 5: Editable mode (live student input)
// ─────────────────────────────────────────────────────────────────────

export function EditableTrace() {
  const shapes: VarShape[] = [
    { kind: 'scalar', name: 'x', cppType: 'int' },
    { kind: 'scalar', name: 'y', cppType: 'int' },
  ];
  const [history, setHistory] = useState<HistoryMap>({ x: [], y: [] });
  const onAddValue = (name: string, value: string) =>
    setHistory((h) => ({ ...h, [name]: [...(h[name] ?? []), value] }));
  return (
    <div style={{ padding: 20, maxWidth: 720 }}>
      <h2 style={{ color: '#e6edf3', fontFamily: 'monospace', fontSize: 14 }}>
        Story 5 — EditableTrace (type values, press Enter)
      </h2>
      <MemoryBoxes
        shapes={shapes}
        history={history}
        editable={true}
        onAddValue={onAddValue}
        title="memory (editable — type a value and press Enter)"
      />
      <pre style={{ color: '#7ee787', fontSize: 11, marginTop: 12 }}>
        history state: {JSON.stringify(history, null, 2)}
      </pre>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// All stories — single-page view
// ─────────────────────────────────────────────────────────────────────

export default function AllMemoryBoxesStories() {
  return (
    <div
      style={{
        background: '#0d1117',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <ScalarOnlyL0 />
      <hr style={{ borderColor: '#30363d' }} />
      <StructWithArrayL1 />
      <hr style={{ borderColor: '#30363d' }} />
      <PassByRefL5 />
      <hr style={{ borderColor: '#30363d' }} />
      <ScalarHistory />
      <hr style={{ borderColor: '#30363d' }} />
      <EditableTrace />
    </div>
  );
}
