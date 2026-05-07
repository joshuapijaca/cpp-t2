/**
 * MemoryBoxes.tsx
 *
 * Paper-sim memory diagram primitive. Replaces VariablesPanel's
 * generic name/type/value/scope grid with the hand-drawn variable
 * model students actually use on paper for SIT102 Test 2 Q1.
 *
 * Visual model (matches source-data/tests/practice1_images/image2.jpeg):
 *
 *   Scalar:
 *     ┌────┬───────────────────────┐
 *     │ x  │ 5̶  1̶0̶  20            │     (strikethrough = old; bold = current)
 *     └────┴───────────────────────┘
 *
 *   Array:
 *              [0]   [1]   [2]   [3]   [4]
 *     ┌────┬─────┬─────┬─────┬─────┬─────┐
 *     │ ns │-20.0│ 3.2 │ 1.9 │-1.5 │ 1.3 │     (cells immutable for L1 fixtures)
 *     └────┴─────┴─────┴─────┴─────┴─────┘
 *
 *   Struct (Q1 stat_double shape):
 *     ┌─ d ──────────────────────────────────────────┐
 *     │   ┌──────────┬──────────────────────────────┐│
 *     │   │ numbers  │ [0][1][2][3][4]              ││
 *     │   ├──────────┼──────────────────────────────┤│
 *     │   │ mystery  │ 0̶.̶0̶  -̶2̶0̶.̶0̶  3.2          ││
 *     │   └──────────┴──────────────────────────────┘│
 *     └──────────────────────────────────────────────┘
 *
 *   Pass-by-ref arrow (Q1 `void f(stat_double &data)` called as f(d)):
 *     data ──→ d
 *
 * Modes
 *   - editable=true   → student types values; latest value pushes
 *                       previous to strikethrough chain.
 *   - editable=false  → walkthrough auto-reveal; values + history
 *                       supplied by parent (computed from step diffs).
 *
 * Auto-derive
 *   When `shapes` is omitted, the component infers shape from variable
 *   names: dot notation → struct field, bracket notation → array
 *   index. Useful for legacy data without explicit shape declarations.
 */

import {
  useCallback,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';

// ─────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────

export type ScalarShape = {
  kind: 'scalar';
  name: string;
  cppType?: string | undefined;
};

export type ArrayShape = {
  kind: 'array';
  name: string;
  size: number;
  cellType?: string | undefined;
};

export type StructFieldShape = {
  name: string;
  kind: 'scalar' | 'array';
  size?: number | undefined;
  cppType?: string | undefined;
};

export type StructShape = {
  kind: 'struct';
  name: string;
  structType?: string | undefined;
  fields: StructFieldShape[];
};

export type VarShape = ScalarShape | ArrayShape | StructShape;

export interface PassByRefHint {
  paramName: string;
  callerName: string;
}

/** History map — key is full var path (e.g. "x", "d.mystery").
 *  Values: chronological list of values written, oldest first.
 *  Last entry = current value. Empty = uninitialized. */
export type HistoryMap = Record<string, string[]>;

/** Array initial contents — key is array path (e.g. "numbers" or
 *  "d.numbers"). Values: cell contents [cell0, cell1, ...]. */
export type ArrayInitMap = Record<string, string[]>;

export interface MemoryBoxesProps {
  shapes: VarShape[];
  history: HistoryMap;
  arrayInits?: ArrayInitMap;
  passByRef?: PassByRefHint | undefined;
  editable?: boolean;
  /** Append a new value to a variable's history. Called when student
   *  submits a value in editable mode. */
  onAddValue?: (varPath: string, value: string) => void;
  /** Optional title above the diagram. */
  title?: string;
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

/** Split history into [strikethrough chain, current]. */
function splitHistory(values: string[] | undefined): {
  past: string[];
  current: string | null;
} {
  if (!values || values.length === 0) return { past: [], current: null };
  const past = values.slice(0, -1);
  const current = values[values.length - 1] ?? null;
  return { past, current };
}

// ─────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────

interface ScalarBoxProps {
  label: string;       // display label (var name or struct field name)
  varPath: string;     // full path used as history key
  values: string[] | undefined;
  editable: boolean;
  onAddValue?: ((varPath: string, value: string) => void) | undefined;
}

function ScalarBox({ label, varPath, values, editable, onAddValue }: ScalarBoxProps) {
  const { past, current } = splitHistory(values);
  const [draft, setDraft] = useState('');

  const submit = useCallback(() => {
    const v = draft.trim();
    if (v.length === 0) return;
    onAddValue?.(varPath, v);
    setDraft('');
  }, [draft, varPath, onAddValue]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submit();
      }
    },
    [submit]
  );

  return (
    <div className="mb-row" role="row" aria-label={`variable ${label}`}>
      <div className="mb-label" role="rowheader">
        {label}
      </div>
      <div className="mb-cells mb-cells--scalar" role="cell">
        {past.map((v, i) => (
          <span key={`p${i}`} className="mb-val mb-val--past">
            {v}
          </span>
        ))}
        {current !== null && (
          <span className="mb-val mb-val--current" aria-label="current value">
            {current}
          </span>
        )}
        {editable && (
          <input
            className="mb-input"
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={submit}
            placeholder="+ value"
            aria-label={`new value for ${label}`}
            spellCheck={false}
            autoComplete="off"
          />
        )}
      </div>
    </div>
  );
}

interface ArrayBoxProps {
  label: string;
  size: number;
  cells: string[];   // length should be size; '' for unset
}

function ArrayBox({ label, size, cells }: ArrayBoxProps) {
  const padded: string[] = Array.from({ length: size }, (_, i) => cells[i] ?? '');
  return (
    <div className="mb-row" role="row" aria-label={`array ${label}`}>
      <div className="mb-label" role="rowheader">
        {label}
      </div>
      <div className="mb-array" role="cell">
        <div className="mb-array-indices" aria-hidden="true">
          {padded.map((_, i) => (
            <span key={`idx${i}`} className="mb-array-idx">
              [{i}]
            </span>
          ))}
        </div>
        <div className="mb-array-cells">
          {padded.map((v, i) => (
            <span
              key={`cell${i}`}
              className="mb-array-cell"
              aria-label={`${label}[${i}] = ${v || 'empty'}`}
            >
              {v}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

interface StructBoxProps {
  shape: StructShape;
  history: HistoryMap;
  arrayInits: ArrayInitMap;
  editable: boolean;
  onAddValue?: ((varPath: string, value: string) => void) | undefined;
}

function StructBox({ shape, history, arrayInits, editable, onAddValue }: StructBoxProps) {
  return (
    <div
      className="mb-struct"
      role="group"
      aria-label={`struct ${shape.name}${shape.structType ? ` (${shape.structType})` : ''}`}
    >
      <div className="mb-struct-header">
        <span className="mb-struct-name">{shape.name}</span>
        {shape.structType && (
          <span className="mb-struct-type" aria-label="struct type">
            {shape.structType}
          </span>
        )}
      </div>
      <div className="mb-struct-body">
        {shape.fields.map((field) => {
          const fieldPath = `${shape.name}.${field.name}`;
          if (field.kind === 'array' && field.size) {
            return (
              <ArrayBox
                key={fieldPath}
                label={field.name}
                size={field.size}
                cells={arrayInits[fieldPath] ?? arrayInits[field.name] ?? []}
              />
            );
          }
          return (
            <ScalarBox
              key={fieldPath}
              label={field.name}
              varPath={fieldPath}
              values={history[fieldPath]}
              editable={editable}
              onAddValue={onAddValue}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// MemoryBoxes (root)
// ─────────────────────────────────────────────────────────────────────

export function MemoryBoxes({
  shapes,
  history,
  arrayInits = {},
  passByRef,
  editable = false,
  onAddValue,
  title,
}: MemoryBoxesProps) {
  const rootStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  };

  return (
    <section
      className="mb-root"
      role="region"
      aria-label={title ?? 'memory diagram'}
      style={rootStyle}
    >
      {title && <h3 className="mb-title">{title}</h3>}

      {passByRef && (
        <div className="mb-passbyref" role="note" aria-label="pass-by-reference alias">
          <code className="mb-passbyref-param">{passByRef.paramName}</code>
          <span className="mb-passbyref-arrow" aria-hidden="true">
            ──→
          </span>
          <code className="mb-passbyref-caller">{passByRef.callerName}</code>
          <span className="mb-passbyref-note">(alias — same memory)</span>
        </div>
      )}

      <div className="mb-vars">
        {shapes.map((shape) => {
          if (shape.kind === 'scalar') {
            return (
              <ScalarBox
                key={shape.name}
                label={shape.name}
                varPath={shape.name}
                values={history[shape.name]}
                editable={editable}
                onAddValue={onAddValue}
              />
            );
          }
          if (shape.kind === 'array') {
            return (
              <ArrayBox
                key={shape.name}
                label={shape.name}
                size={shape.size}
                cells={arrayInits[shape.name] ?? []}
              />
            );
          }
          // struct
          return (
            <StructBox
              key={shape.name}
              shape={shape}
              history={history}
              arrayInits={arrayInits}
              editable={editable}
              onAddValue={onAddValue}
            />
          );
        })}
      </div>

      <style>{MB_STYLES}</style>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Auto-derive helper — infers shape from variable names + code
// ─────────────────────────────────────────────────────────────────────

/**
 * Derive a VarShape[] from a flat list of variable paths (e.g. from
 * legacy `variables: ["i", "data.mystery"]` data) plus optional array
 * size hints parsed from the code.
 *
 * Rules:
 *   - "name"          → scalar
 *   - "name[i]"       → array element (groups by base name; size from
 *                       arrayInits if present, else max index + 1)
 *   - "name.field"    → struct field (groups by base name)
 *   - "name.arr[i]"   → struct field that is an array
 */
export function deriveShapes(
  variables: string[],
  arrayInits: ArrayInitMap = {}
): VarShape[] {
  const root = new Map<
    string,
    | { kind: 'scalar' }
    | { kind: 'array'; size: number }
    | {
        kind: 'struct';
        fields: Map<
          string,
          { kind: 'scalar' } | { kind: 'array'; size: number }
        >;
      }
  >();

  for (const path of variables) {
    // struct field with array index: name.field[i]
    const arrField = /^([A-Za-z_][\w]*)\.([A-Za-z_][\w]*)\[(\d+)\]$/.exec(path);
    if (arrField) {
      const [, base, field, idx] = arrField;
      if (!base || !field || !idx) continue;
      const idxN = parseInt(idx, 10);
      const existing = root.get(base);
      if (!existing || existing.kind !== 'struct') {
        root.set(base, { kind: 'struct', fields: new Map() });
      }
      const s = root.get(base);
      if (s && s.kind === 'struct') {
        const cur = s.fields.get(field);
        const size = Math.max(idxN + 1, cur?.kind === 'array' ? cur.size : 0);
        s.fields.set(field, { kind: 'array', size });
      }
      continue;
    }

    // struct field scalar: name.field
    const structField = /^([A-Za-z_][\w]*)\.([A-Za-z_][\w]*)$/.exec(path);
    if (structField) {
      const [, base, field] = structField;
      if (!base || !field) continue;
      const existing = root.get(base);
      if (!existing || existing.kind !== 'struct') {
        root.set(base, { kind: 'struct', fields: new Map() });
      }
      const s = root.get(base);
      if (s && s.kind === 'struct') {
        if (!s.fields.has(field)) {
          s.fields.set(field, { kind: 'scalar' });
        }
      }
      continue;
    }

    // bare array: name[i]
    const arrBare = /^([A-Za-z_][\w]*)\[(\d+)\]$/.exec(path);
    if (arrBare) {
      const [, base, idx] = arrBare;
      if (!base || !idx) continue;
      const idxN = parseInt(idx, 10);
      const existing = root.get(base);
      const size = Math.max(
        idxN + 1,
        existing?.kind === 'array' ? existing.size : 0
      );
      root.set(base, { kind: 'array', size });
      continue;
    }

    // bare scalar: name
    const bare = /^([A-Za-z_][\w]*)$/.exec(path);
    if (bare && !root.has(path)) {
      root.set(path, { kind: 'scalar' });
    }
  }

  // Promote array sizes from arrayInits if larger
  for (const [name, cells] of Object.entries(arrayInits)) {
    const dot = name.indexOf('.');
    if (dot >= 0) {
      const base = name.slice(0, dot);
      const field = name.slice(dot + 1);
      const s = root.get(base);
      if (s && s.kind === 'struct') {
        const cur = s.fields.get(field);
        const size = Math.max(cells.length, cur?.kind === 'array' ? cur.size : 0);
        s.fields.set(field, { kind: 'array', size });
      }
    } else {
      const cur = root.get(name);
      if (!cur || cur.kind === 'array') {
        const size = Math.max(cells.length, cur?.kind === 'array' ? cur.size : 0);
        root.set(name, { kind: 'array', size });
      }
    }
  }

  // Materialize VarShape[]
  const out: VarShape[] = [];
  for (const [name, info] of root.entries()) {
    if (info.kind === 'scalar') {
      out.push({ kind: 'scalar', name });
    } else if (info.kind === 'array') {
      out.push({ kind: 'array', name, size: info.size });
    } else {
      const fields: StructFieldShape[] = [];
      for (const [fname, finfo] of info.fields.entries()) {
        if (finfo.kind === 'array') {
          fields.push({ name: fname, kind: 'array', size: finfo.size });
        } else {
          fields.push({ name: fname, kind: 'scalar' });
        }
      }
      out.push({ kind: 'struct', name, fields });
    }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────
// Component-scoped CSS — dark IDE theme + paper-diagram bones
// ─────────────────────────────────────────────────────────────────────

const MB_STYLES = `
.mb-root {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  color: var(--text-0, #e6edf3);
  background: var(--bg-0, #0d1117);
  padding: 12px;
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
}
.mb-title {
  font-size: 11px;
  margin: 0 0 8px 0;
  color: var(--text-2, #6e7681);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
}
.mb-passbyref {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  background: var(--bg-1, #161b22);
  border: 1px dashed var(--accent-cyan, #79c0ff);
  border-radius: 3px;
  font-size: 11px;
  width: max-content;
}
.mb-passbyref-param,
.mb-passbyref-caller {
  font-weight: 600;
  color: var(--accent-cyan, #79c0ff);
  background: transparent;
  padding: 0 2px;
}
.mb-passbyref-arrow {
  color: var(--accent-cyan, #79c0ff);
  letter-spacing: 0.05em;
}
.mb-passbyref-note {
  color: var(--text-2, #6e7681);
  font-size: 10px;
  font-style: italic;
}

.mb-vars {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mb-row {
  display: flex;
  align-items: stretch;
  border: 1px solid var(--border-1, #30363d);
  border-radius: 3px;
  background: var(--bg-1, #161b22);
}
.mb-label {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 6px 10px;
  min-width: 80px;
  border-right: 1px solid var(--border-1, #30363d);
  background: var(--bg-2, #1f2937);
  color: var(--accent-cyan, #79c0ff);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.02em;
}
.mb-cells {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 6px 10px;
  flex: 1;
  min-height: 28px;
}
.mb-val {
  font-size: 12px;
  font-family: inherit;
}
.mb-val--past {
  color: var(--text-2, #6e7681);
  text-decoration: line-through;
  opacity: 0.7;
}
.mb-val--current {
  color: var(--text-0, #e6edf3);
  font-weight: 600;
  padding: 2px 6px;
  background: rgba(121,192,255,0.08);
  border-radius: 2px;
}
.mb-input {
  background: var(--bg-0, #0d1117);
  border: 1px dashed var(--border-1, #30363d);
  border-radius: 2px;
  color: var(--text-0, #e6edf3);
  font-family: inherit;
  font-size: 12px;
  padding: 2px 6px;
  width: 80px;
  outline: 0;
}
.mb-input:focus-visible {
  border-style: solid;
  border-color: var(--accent-cyan, #79c0ff);
}
.mb-input::placeholder {
  color: var(--text-2, #6e7681);
}

.mb-array {
  display: flex;
  flex-direction: column;
  padding: 4px 10px;
  flex: 1;
}
.mb-array-indices {
  display: flex;
  gap: 0;
}
.mb-array-idx {
  font-size: 9px;
  color: var(--text-2, #6e7681);
  min-width: 56px;
  text-align: center;
  padding-bottom: 2px;
  letter-spacing: 0.05em;
}
.mb-array-cells {
  display: flex;
  border: 1px solid var(--border-1, #30363d);
  background: var(--bg-0, #0d1117);
}
.mb-array-cell {
  min-width: 56px;
  padding: 6px 4px;
  text-align: center;
  font-size: 12px;
  color: var(--text-0, #e6edf3);
  border-right: 1px solid var(--border-1, #30363d);
  font-variant-numeric: tabular-nums;
}
.mb-array-cell:last-child {
  border-right: 0;
}

.mb-struct {
  display: flex;
  flex-direction: column;
  border: 2px solid var(--accent-cyan, #79c0ff);
  border-radius: 4px;
  background: var(--bg-1, #161b22);
  padding: 0;
}
.mb-struct-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--border-1, #30363d);
  background: var(--bg-2, #1f2937);
}
.mb-struct-name {
  font-weight: 700;
  color: var(--accent-cyan, #79c0ff);
  font-size: 13px;
}
.mb-struct-type {
  font-size: 10px;
  color: var(--text-2, #6e7681);
  font-style: italic;
}
.mb-struct-body {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 8px;
}
.mb-struct-body .mb-row {
  border-radius: 2px;
}
`;

export default MemoryBoxes;
