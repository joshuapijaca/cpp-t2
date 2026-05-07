/**
 * VariablesPanel.tsx
 *
 * Watch-table primitive used by TraceCard (Q1 hand-execute) and
 * AdversarialMockCard. Renders the student's current view of program memory
 * as an editable 4-column grid: name | type | value | scope.
 *
 * Behaviour
 * ---------
 * - Add row: click "+ row" or press Cmd/Ctrl+Enter in the last cell.
 *   New row's type cycles through int -> double -> string -> bool -> char -> struct.
 * - Edit cell: click cell -> input appears -> Enter commits, Esc cancels.
 * - Reorder: drag handle (8px grip on left) OR Alt+ArrowUp / Alt+ArrowDown
 *   while focused on a row's grip.
 * - Remove row: focus the grip and press Cmd/Ctrl+Backspace, or click the
 *   trailing x button.
 * - Stale rows (out-of-scope) get dimmed + strikethrough.
 * - History is rendered inline within the value cell: previous values
 *   strikethrough, then current value in accent colour.
 *
 * Keyboard
 * --------
 * - Tab order is: grip -> name -> type -> value -> scope -> remove -> next row.
 * - Enter inside a cell input commits, Esc cancels and reverts.
 * - Cmd/Ctrl+Enter from the last row's last cell appends a new row.
 *
 * Accessibility
 * -------------
 * - role="grid" with row/columnheader/cell roles.
 * - aria-rowcount / aria-rowindex on each row.
 * - Drag handles have aria-label="reorder row N".
 * - readOnly mode disables all edit/add/remove handlers and inputs.
 *
 * NO actual code execution; the panel is a passive watch-table the student
 * fills in by hand. Validation happens in the parent (e.g. TraceCard).
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { getAllWithStrikethrough } from '../../lib/variable-history';

export type VariableType =
  | 'int'
  | 'double'
  | 'string'
  | 'bool'
  | 'char'
  | 'struct';
export type VariableScope = 'local' | 'param' | 'global' | 'static';

export interface Variable {
  id: string;
  name: string;
  type: VariableType;
  value: string;
  scope: VariableScope;
  history: string[];
  /** Optional: when true the row is dimmed/struck (out-of-scope). */
  stale?: boolean;
}

export interface VariablesPanelProps {
  variables: Variable[];
  onAdd?: (after?: string) => void;
  onUpdate?: (id: string, patch: Partial<Variable>) => void;
  onRemove?: (id: string) => void;
  /** Reorder: move id from its current index to targetIndex. */
  onReorder?: (id: string, targetIndex: number) => void;
  readOnly?: boolean;
  /** Optional title shown above the grid. */
  title?: string;
}

const TYPE_CYCLE: VariableType[] = [
  'int',
  'double',
  'string',
  'bool',
  'char',
  'struct',
];
const SCOPE_OPTIONS: VariableScope[] = ['local', 'param', 'global', 'static'];

/* ---------------------------------------------------------------------------
 * Inline-editable cell
 * --------------------------------------------------------------------------*/

type CellKind = 'name' | 'type' | 'value' | 'scope';

interface EditableCellProps {
  kind: CellKind;
  value: string;
  type?: VariableType | undefined;
  history?: string[] | undefined;
  readOnly: boolean;
  onCommit: (newValue: string) => void;
  onAddRowFromLast?: (() => void) | undefined;
  /** Whether this is the last cell in the last row (for Cmd+Enter add). */
  isLastCell?: boolean | undefined;
  ariaLabel: string;
}

function EditableCell({
  kind,
  value,
  history,
  readOnly,
  onCommit,
  onAddRowFromLast,
  isLastCell,
  ariaLabel,
}: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onCommit(draft);
  };

  const cancel = () => {
    setEditing(false);
    setDraft(value);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if ((e.metaKey || e.ctrlKey) && isLastCell && onAddRowFromLast) {
        commit();
        onAddRowFromLast();
        return;
      }
      commit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    } else if (e.key === 'Tab') {
      // Let Tab move focus naturally; commit before the blur fires.
      commit();
    }
  };

  const onBlur = (
    _e: FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (editing) commit();
  };

  // Display mode for the value cell renders strikethrough history.
  if (!editing && kind === 'value') {
    const rendered = getAllWithStrikethrough(history ?? (value ? [value] : []));
    return (
      <button
        type="button"
        className="vp-cell vp-cell--value"
        onClick={readOnly ? undefined : () => setEditing(true)}
        onFocus={readOnly ? undefined : () => setEditing(true)}
        disabled={readOnly}
        aria-label={ariaLabel}
        tabIndex={0}
      >
        {rendered.stale.map((s, i) => (
          <span key={i} className="vp-stale">
            {s}
          </span>
        ))}
        <span className={rendered.hasHistory ? 'vp-current' : 'vp-empty'}>
          {rendered.current || (readOnly ? '' : 'click to edit')}
        </span>
      </button>
    );
  }

  if (!editing) {
    return (
      <button
        type="button"
        className={`vp-cell vp-cell--${kind}`}
        onClick={readOnly ? undefined : () => setEditing(true)}
        onFocus={readOnly ? undefined : () => setEditing(true)}
        disabled={readOnly}
        aria-label={ariaLabel}
        tabIndex={0}
      >
        {value || (readOnly ? '' : <span className="vp-empty">—</span>)}
      </button>
    );
  }

  if (kind === 'type') {
    return (
      <select
        ref={inputRef as React.RefObject<HTMLSelectElement>}
        className={`vp-cell vp-cell--${kind} vp-cell--editing`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={onBlur}
        onKeyDown={handleKey}
        aria-label={ariaLabel}
      >
        {TYPE_CYCLE.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    );
  }

  if (kind === 'scope') {
    return (
      <select
        ref={inputRef as React.RefObject<HTMLSelectElement>}
        className={`vp-cell vp-cell--${kind} vp-cell--editing`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={onBlur}
        onKeyDown={handleKey}
        aria-label={ariaLabel}
      >
        {SCOPE_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type="text"
      className={`vp-cell vp-cell--${kind} vp-cell--editing`}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={onBlur}
      onKeyDown={handleKey}
      spellCheck={false}
      autoComplete="off"
      aria-label={ariaLabel}
    />
  );
}

/* ---------------------------------------------------------------------------
 * Drag handle ("grip")
 * --------------------------------------------------------------------------*/

interface GripProps {
  rowIndex: number;
  rowCount: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  readOnly: boolean;
  draggable: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

function Grip({
  rowIndex,
  rowCount,
  onMoveUp,
  onMoveDown,
  onRemove,
  readOnly,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
}: GripProps) {
  const handleKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (readOnly) return;
    if (e.altKey && e.key === 'ArrowUp') {
      e.preventDefault();
      onMoveUp();
    } else if (e.altKey && e.key === 'ArrowDown') {
      e.preventDefault();
      onMoveDown();
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'Backspace') {
      e.preventDefault();
      onRemove();
    }
  };

  return (
    <button
      type="button"
      className="vp-grip"
      draggable={draggable && !readOnly}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onKeyDown={handleKey}
      disabled={readOnly}
      aria-label={`reorder row ${rowIndex + 1} of ${rowCount}; alt+up/down to move, ctrl+backspace to remove`}
      title="drag to reorder · alt+↑/↓"
      tabIndex={0}
    >
      <span aria-hidden="true">⋮⋮</span>
    </button>
  );
}

/* ---------------------------------------------------------------------------
 * VariablesPanel
 * --------------------------------------------------------------------------*/

export function VariablesPanel({
  variables,
  onAdd,
  onUpdate,
  onRemove,
  onReorder,
  readOnly = false,
  title,
}: VariablesPanelProps) {
  const dragId = useRef<string | null>(null);

  const handleAdd = useCallback(() => {
    if (readOnly || !onAdd) return;
    const last = variables[variables.length - 1];
    onAdd(last?.id);
  }, [readOnly, onAdd, variables]);

  const handleUpdateField = useCallback(
    (id: string, field: keyof Variable, raw: string) => {
      if (readOnly || !onUpdate) return;
      if (field === 'value') {
        // Push value onto history rather than overwriting.
        const v = variables.find((x) => x.id === id);
        if (!v) return;
        const newHistory = [...v.history, raw];
        onUpdate(id, { value: raw, history: newHistory });
        return;
      }
      // Cast: name/type/scope are restricted strings; we trust callers' onUpdate to validate.
      onUpdate(id, { [field]: raw } as Partial<Variable>);
    },
    [readOnly, onUpdate, variables]
  );

  const handleMove = useCallback(
    (id: string, delta: number) => {
      if (readOnly || !onReorder) return;
      const idx = variables.findIndex((v) => v.id === id);
      if (idx < 0) return;
      const target = Math.max(0, Math.min(variables.length - 1, idx + delta));
      if (target === idx) return;
      onReorder(id, target);
    },
    [readOnly, onReorder, variables]
  );

  const handleDragStart = (id: string) => (e: React.DragEvent) => {
    if (readOnly) return;
    dragId.current = id;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (readOnly) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (targetId: string) => (e: React.DragEvent) => {
    if (readOnly) return;
    e.preventDefault();
    const sourceId = dragId.current;
    dragId.current = null;
    if (!sourceId || sourceId === targetId || !onReorder) return;
    const targetIdx = variables.findIndex((v) => v.id === targetId);
    if (targetIdx < 0) return;
    onReorder(sourceId, targetIdx);
  };

  const isEmpty = variables.length === 0;

  const gridStyle: CSSProperties = useMemo(
    () => ({
      gridTemplateColumns: '24px 1fr 100px 1.4fr 100px 28px',
    }),
    []
  );

  return (
    <section
      className="vp"
      aria-label={title ?? 'variables watch table'}
    >
      <header className="vp-header">
        <span className="vp-title">{title ?? 'variables'}</span>
        <span className="vp-count" aria-live="polite">
          {variables.length} {variables.length === 1 ? 'row' : 'rows'}
        </span>
      </header>

      <div role="grid" aria-rowcount={variables.length + 1} className="vp-grid">
        <div role="row" className="vp-row vp-row--head" style={gridStyle}>
          <span role="columnheader" aria-label="reorder" className="vp-h" />
          <span role="columnheader" className="vp-h">name</span>
          <span role="columnheader" className="vp-h">type</span>
          <span role="columnheader" className="vp-h">value</span>
          <span role="columnheader" className="vp-h">scope</span>
          <span role="columnheader" aria-label="remove" className="vp-h" />
        </div>

        {isEmpty && (
          <div className="vp-empty-row" role="row">
            <span role="cell">
              {readOnly ? 'no variables' : 'no variables — click "+ row" to add'}
            </span>
          </div>
        )}

        {variables.map((v, i) => {
          const isLastRow = i === variables.length - 1;
          const rowClass = [
            'vp-row',
            v.stale ? 'vp-row--stale' : '',
            v.scope === 'global' ? 'vp-row--global' : '',
            v.scope === 'static' ? 'vp-row--static' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div
              key={v.id}
              role="row"
              aria-rowindex={i + 2}
              className={rowClass}
              style={gridStyle}
              data-testid={`vp-row-${i}`}
            >
              <Grip
                rowIndex={i}
                rowCount={variables.length}
                onMoveUp={() => handleMove(v.id, -1)}
                onMoveDown={() => handleMove(v.id, 1)}
                onRemove={() => !readOnly && onRemove?.(v.id)}
                readOnly={readOnly}
                draggable={true}
                onDragStart={handleDragStart(v.id)}
                onDragOver={handleDragOver}
                onDrop={handleDrop(v.id)}
              />

              <div role="cell">
                <EditableCell
                  kind="name"
                  value={v.name}
                  readOnly={readOnly}
                  onCommit={(nv) => handleUpdateField(v.id, 'name', nv)}
                  ariaLabel={`name for variable ${i + 1}`}
                />
              </div>

              <div role="cell">
                <EditableCell
                  kind="type"
                  value={v.type}
                  readOnly={readOnly}
                  onCommit={(nv) => handleUpdateField(v.id, 'type', nv)}
                  ariaLabel={`type for variable ${i + 1}`}
                />
              </div>

              <div role="cell">
                <EditableCell
                  kind="value"
                  value={v.value}
                  type={v.type}
                  history={v.history}
                  readOnly={readOnly}
                  onCommit={(nv) => handleUpdateField(v.id, 'value', nv)}
                  onAddRowFromLast={isLastRow ? handleAdd : undefined}
                  isLastCell={isLastRow}
                  ariaLabel={`value for ${v.name || `variable ${i + 1}`}`}
                />
              </div>

              <div role="cell">
                <EditableCell
                  kind="scope"
                  value={v.scope}
                  readOnly={readOnly}
                  onCommit={(nv) => handleUpdateField(v.id, 'scope', nv)}
                  ariaLabel={`scope for variable ${i + 1}`}
                />
              </div>

              <div role="cell">
                {!readOnly && (
                  <button
                    type="button"
                    className="vp-remove"
                    onClick={(_e: MouseEvent) => onRemove?.(v.id)}
                    aria-label={`remove variable ${v.name || i + 1}`}
                    tabIndex={0}
                  >
                    x
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!readOnly && (
        <div className="vp-footer">
          <button
            type="button"
            className="vp-add"
            onClick={handleAdd}
            aria-label="add new variable row"
          >
            + row
          </button>
          <span className="vp-hint">
            <span className="vp-kbd">⌘↵</span> from last cell · drag handle or{' '}
            <span className="vp-kbd">alt</span>+
            <span className="vp-kbd">↑↓</span> to reorder
          </span>
        </div>
      )}

      <style>{`
        .vp {
          display: flex;
          flex-direction: column;
          gap: 6px;
          background: var(--bg-1, var(--color-bg-card, #161b22));
          border: 1px solid var(--border-1, var(--color-border, #30363d));
          border-radius: 6px;
          padding: 10px 12px;
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          color: var(--text-0, var(--color-text, #e6edf3));
        }
        .vp-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-size: 12px;
        }
        .vp-title {
          color: var(--text-1, var(--color-text-mute, #8b949e));
          letter-spacing: 0.05em;
          text-transform: lowercase;
        }
        .vp-count {
          color: var(--text-2, var(--color-text-faint, #6e7681));
          font-size: 11px;
        }
        .vp-grid {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .vp-row {
          display: grid;
          align-items: stretch;
          gap: 4px;
          padding: 2px 0;
          border-radius: 4px;
        }
        .vp-row--head .vp-h {
          font-size: 10px;
          color: var(--text-2, var(--color-text-faint, #6e7681));
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 4px 8px;
        }
        .vp-row--stale {
          opacity: 0.4;
          text-decoration: line-through;
        }
        .vp-row--global {
          border-left: 2px solid var(--accent-pink, #ff7b72);
        }
        .vp-row--static {
          border-left: 2px solid var(--accent-cyan, #79c0ff);
        }
        .vp-empty-row {
          padding: 14px 8px;
          font-size: 12px;
          color: var(--text-2, #6e7681);
          text-align: center;
          font-style: italic;
        }
        .vp-grip {
          width: 24px;
          background: transparent;
          border: none;
          color: var(--text-2, #6e7681);
          cursor: grab;
          font-size: 10px;
          padding: 0;
          letter-spacing: -1px;
          line-height: 1;
        }
        .vp-grip:hover:not(:disabled) {
          color: var(--accent-cyan, #79c0ff);
        }
        .vp-grip:focus-visible {
          outline: 1px dashed var(--accent-cyan, #79c0ff);
          outline-offset: 1px;
        }
        .vp-grip:active:not(:disabled) {
          cursor: grabbing;
        }
        .vp-grip:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .vp-cell {
          width: 100%;
          background: var(--bg-2, var(--color-bg-elevated, #1f2937));
          border: 1px solid var(--border-1, var(--color-border, #30363d));
          color: var(--text-0, #e6edf3);
          font-family: inherit;
          font-size: 12px;
          padding: 4px 8px;
          text-align: left;
          border-radius: 3px;
          min-height: 24px;
          line-height: 1.4;
          cursor: text;
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .vp-cell:hover:not(:disabled) {
          border-color: var(--border-2, var(--color-border-emph, #484f58));
        }
        .vp-cell:focus-visible,
        .vp-cell--editing {
          outline: none;
          border-color: var(--accent-cyan, #79c0ff);
          box-shadow: 0 0 0 1px var(--accent-cyan, #79c0ff);
        }
        .vp-cell--type,
        .vp-cell--scope {
          font-size: 11px;
          color: var(--accent-cyan, #79c0ff);
        }
        .vp-cell--name {
          color: var(--text-0, #e6edf3);
          font-weight: 600;
        }
        .vp-cell--value {
          background: var(--bg-0, var(--color-bg, #0d1117));
        }
        .vp-stale {
          color: var(--text-2, #6e7681);
          text-decoration: line-through;
          opacity: 0.6;
        }
        .vp-current {
          color: var(--accent-grn, var(--color-accent, #7ee787));
          font-weight: 600;
        }
        .vp-empty {
          color: var(--text-2, #6e7681);
          font-style: italic;
        }
        .vp-remove {
          width: 22px;
          height: 22px;
          background: transparent;
          border: none;
          color: var(--text-2, #6e7681);
          cursor: pointer;
          font-family: inherit;
          font-size: 12px;
          padding: 0;
          align-self: center;
          justify-self: center;
        }
        .vp-remove:hover {
          color: var(--accent-pink, var(--color-danger, #ff7b72));
        }
        .vp-remove:focus-visible {
          outline: 1px dashed var(--accent-pink, #ff7b72);
          outline-offset: 1px;
        }
        .vp-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 4px;
          gap: 12px;
        }
        .vp-add {
          background: transparent;
          border: 1px dashed var(--accent-cyan, #79c0ff);
          color: var(--accent-cyan, #79c0ff);
          font-family: inherit;
          font-size: 11px;
          padding: 3px 10px;
          border-radius: 3px;
          cursor: pointer;
        }
        .vp-add:hover {
          background: rgba(121, 192, 255, 0.08);
        }
        .vp-add:focus-visible {
          outline: 1px solid var(--accent-cyan, #79c0ff);
          outline-offset: 1px;
        }
        .vp-hint {
          font-size: 10px;
          color: var(--text-2, #6e7681);
        }
        .vp-kbd {
          background: var(--bg-2, #1f2937);
          border: 1px solid var(--border-1, #30363d);
          border-radius: 2px;
          padding: 0 4px;
          font-size: 10px;
          color: var(--text-1, #8b949e);
          margin: 0 1px;
        }
      `}</style>
    </section>
  );
}

export default VariablesPanel;
