/**
 * WalkthroughCard.tsx — paper-sim worked-example reveal.
 *
 * Drops the old `<ol>` step list with metadata headers (`step 1 · line 3
 * · atoms [F-03,O-01]`) — those don't exist on paper. Replaces with a
 * MemoryBoxes diagram that builds up beside the code as steps reveal,
 * matching the way a tutor would draw the trace on a whiteboard.
 *
 * Two render modes (decided per step):
 *   - step.vars present → memory snapshot fed to MemoryBoxes; the
 *                          annotation prose is the "what just happened".
 *   - step.vars absent  → no memory diagram for this step; annotation
 *                          renders as plain prose (syntax-only walkthrough).
 *
 * Layout:
 *   ┌── Header: stem only ───────────────────────────────────────────┐
 *   ├──────────────────────────────────┬─────────────────────────────┤
 *   │   CodeEditor (active line ▶)     │   MemoryBoxes (accumulating) │
 *   │                                   │   ─────────────              │
 *   │                                   │   Step prose (annotation)    │
 *   │                                   │   Terminal (if step has it) │
 *   ├──────────────────────────────────┴─────────────────────────────┤
 *   │ [← back] [reveal next (Space)] [reveal all]                     │
 *   └────────────────────────────────────────────────────────────────┘
 *
 * Stripped (paper-sim — not on exam):
 *   - levelLabel pill in header
 *   - step number / line N badges per step
 *   - atom-ID tags per step
 *   - progress "n / total" counter
 *
 * Kept (digital learning luxury):
 *   - Reveal-on-Space (with ArrowRight / Enter aliases)
 *   - Back step (Backspace / ArrowLeft)
 *   - Reveal-all skip
 *   - Active-line marker that follows the current step
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';
import { CodeEditor } from '../primitives/CodeEditor';
import {
  MemoryBoxes,
  type HistoryMap,
  type ArrayInitMap,
  type VarShape,
  type StructFieldShape,
  type PassByRefHint,
} from '../primitives/MemoryBoxes';
import {
  parseTraceCode,
  parseArrayInit,
  resolveSize,
} from '../../lib/trace-code-parser';
import { deriveShapes } from '../primitives/MemoryBoxes';
import type { WalkthroughCard as WalkthroughCardData } from '../../types/card-schema';

export interface WalkthroughCardProps {
  card: WalkthroughCardData;
  onComplete: (correct: boolean) => void;
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function withActiveLineMarker(code: string, activeLine: number | null): string {
  if (activeLine === null || activeLine < 1) return code;
  const lines = code.split('\n');
  if (activeLine > lines.length) return code;
  const idx = activeLine - 1;
  const original = lines[idx] ?? '';
  if (original.startsWith('▶ ')) return code;
  lines[idx] = `▶ ${original}`;
  return lines.join('\n');
}

/**
 * Build a HistoryMap by walking through the revealed steps. For each
 * step's `vars[]`, append the value to that variable's history when
 * it differs from the current value. Returns a snapshot suitable for
 * MemoryBoxes display.
 */
function buildHistoryFromSteps(
  steps: WalkthroughCardData['steps'],
  upTo: number,
): HistoryMap {
  const out: HistoryMap = {};
  for (let i = 0; i < upTo && i < steps.length; i++) {
    const step = steps[i];
    if (!step?.vars) continue;
    for (const v of step.vars) {
      const cur = out[v.name];
      if (!cur || cur.length === 0) {
        out[v.name] = [v.value];
      } else if (cur[cur.length - 1] !== v.value) {
        out[v.name] = [...cur, v.value];
      }
    }
  }
  return out;
}

/**
 * Latest terminal[] from the most-recent revealed step that has one.
 * Falls back to [] if no step set terminal yet.
 */
function latestTerminal(
  steps: WalkthroughCardData['steps'],
  upTo: number,
): string[] {
  for (let i = upTo - 1; i >= 0; i--) {
    const t = steps[i]?.terminal;
    if (t) return t;
  }
  return [];
}

interface AutoDerived {
  shapes: VarShape[];
  arrayInits: ArrayInitMap;
  passByRef: PassByRefHint | undefined;
}

function autoDerive(card: WalkthroughCardData): AutoDerived {
  const parsed = parseTraceCode(card.fullCode);
  const passByRef = card.passByRef ?? parsed.passByRef ?? undefined;

  const structTypeMap = new Map<string, StructFieldShape[]>();
  for (const def of parsed.structDefs) {
    const fields: StructFieldShape[] = def.fields.map((f) => {
      if (f.kind === 'array') {
        const size = f.sizeRef
          ? resolveSize(f.sizeRef, parsed.sizeConsts) ?? 5
          : 5;
        return { name: f.name, kind: 'array', size, cppType: f.cppType };
      }
      return { name: f.name, kind: 'scalar', cppType: f.cppType };
    });
    structTypeMap.set(def.name, fields);
  }

  let shapes: VarShape[] = [];
  if (card.varShapes && card.varShapes.length > 0) {
    shapes = card.varShapes;
  } else {
    const structShapes: VarShape[] = [];
    for (const decl of parsed.varDecls) {
      const fields = structTypeMap.get(decl.cppType);
      if (fields) {
        structShapes.push({
          kind: 'struct',
          name: decl.name,
          structType: decl.cppType,
          fields,
        });
      }
    }
    // For walkthrough, gather all vars-mentioned-in-steps as the
    // "tracked variables" pool — that's what we want to draw boxes for.
    const seenStructNames = new Set(structShapes.map((s) => s.name));
    const stepVarSet = new Set<string>();
    for (const step of card.steps) {
      if (step.vars) for (const v of step.vars) stepVarSet.add(v.name);
    }
    const remaining = [...stepVarSet].filter((name) => {
      const dot = name.indexOf('.');
      const base = dot >= 0 ? name.slice(0, dot) : name;
      return !seenStructNames.has(base);
    });
    const derived = deriveShapes(remaining);
    shapes = [...structShapes, ...derived];
  }

  const arrayInits: ArrayInitMap = {};
  if (card.arrayInits) {
    for (const ai of card.arrayInits) arrayInits[ai.name] = ai.values;
  } else {
    for (const decl of parsed.varDecls) {
      const fields = structTypeMap.get(decl.cppType);
      if (!fields || !decl.init) continue;
      const slots = parseArrayInit(decl.init);
      for (let i = 0; i < fields.length && i < slots.length; i++) {
        const f = fields[i];
        const s = slots[i];
        if (!f || s === undefined) continue;
        if (f.kind === 'array') {
          const cells = parseArrayInit(s);
          if (cells.length > 0) {
            arrayInits[`${decl.name}.${f.name}`] = cells;
          }
        }
      }
    }
  }

  return { shapes, arrayInits, passByRef };
}

// ─────────────────────────────────────────────────────────────────────
// WalkthroughCard
// ─────────────────────────────────────────────────────────────────────

export function WalkthroughCard({ card, onComplete }: WalkthroughCardProps) {
  const totalSteps = card.steps.length;
  const [revealed, setRevealed] = useState(0);

  const derived = useMemo(() => autoDerive(card), [card]);

  // Latest revealed step's line drives the active marker.
  const activeLine =
    revealed > 0 ? card.steps[revealed - 1]?.line ?? null : null;

  // Memory state derived from revealed steps.
  const history = useMemo(
    () => buildHistoryFromSteps(card.steps, revealed),
    [card.steps, revealed],
  );

  // Terminal snapshot (falls back to last step that set it).
  const terminal = useMemo(
    () => latestTerminal(card.steps, revealed),
    [card.steps, revealed],
  );

  // Whether ANY step in this card has memory snapshots.
  const hasMemory = useMemo(
    () => card.steps.some((s) => Boolean(s.vars)),
    [card.steps],
  );

  // Latest annotation (the prose for the just-revealed step).
  const latestAnnotation =
    revealed > 0 ? card.steps[revealed - 1]?.annotation ?? '' : '';

  // Reset on card change.
  useEffect(() => {
    setRevealed(0);
  }, [card.id]);

  const reveal = useCallback(() => {
    setRevealed((r) => {
      const next = Math.min(totalSteps, r + 1);
      if (next === totalSteps) onComplete(true);
      return next;
    });
  }, [totalSteps, onComplete]);

  const unReveal = useCallback(() => {
    setRevealed((r) => Math.max(0, r - 1));
  }, []);

  const revealAll = useCallback(() => {
    setRevealed(totalSteps);
    onComplete(true);
  }, [totalSteps, onComplete]);

  // Keyboard shortcuts (with text-input guard).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLElement &&
        (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')
      ) {
        return;
      }
      if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        reveal();
      } else if (e.key === 'Backspace' || e.key === 'ArrowLeft') {
        e.preventDefault();
        unReveal();
      } else if (
        e.key === 'End' ||
        ((e.ctrlKey || e.metaKey) && e.key === 'Enter')
      ) {
        e.preventDefault();
        revealAll();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reveal, unReveal, revealAll]);

  const displayedCode = useMemo(
    () => withActiveLineMarker(card.fullCode, activeLine),
    [card.fullCode, activeLine],
  );

  const onCodeNoop = useCallback((_next: string) => {
    /* readOnly */
  }, []);

  const layoutStyle: CSSProperties = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
      gridTemplateRows: 'auto 1fr auto',
      gridTemplateAreas: `
        "header   header"
        "code     panes"
        "footer   footer"
      `,
      gap: 12,
      padding: 12,
      width: '100%',
      maxWidth: 1280,
      margin: '0 auto',
      minHeight: 560,
    }),
    [],
  );

  return (
    <section
      className="wt-root"
      role="application"
      aria-label="walkthrough"
      style={layoutStyle}
    >
      <header className="wt-header" style={{ gridArea: 'header' }}>
        <h2 className="wt-stem">{card.stem}</h2>
      </header>

      {/* Code panel ─ left */}
      <div
        className="wt-code-pane"
        style={{ gridArea: 'code', minHeight: 0, display: 'flex' }}
      >
        <CodeEditor
          value={displayedCode}
          onChange={onCodeNoop}
          language="cpp"
          readOnly={true}
          ariaLabel={
            activeLine && activeLine > 0
              ? `walkthrough code, active line ${activeLine}`
              : 'walkthrough code'
          }
        />
      </div>

      {/* Right column ─ MemoryBoxes (top) + annotation/terminal (bottom) */}
      <div
        className="wt-right-col"
        style={{
          gridArea: 'panes',
          display: 'grid',
          gridTemplateRows: hasMemory ? 'minmax(0, 1.4fr) minmax(0, 1fr)' : '1fr',
          gap: 12,
          minHeight: 0,
        }}
      >
        {hasMemory && (
          <div
            className="wt-vars-pane"
            style={{ minHeight: 0, overflow: 'auto' }}
            aria-label="memory diagram"
          >
            <MemoryBoxes
              shapes={derived.shapes}
              history={history}
              arrayInits={derived.arrayInits}
              passByRef={derived.passByRef}
              editable={false}
              title="memory (auto-revealing)"
            />
          </div>
        )}

        <div
          className="wt-prose-pane"
          aria-live="polite"
          aria-label="walkthrough notes"
        >
          {revealed === 0 ? (
            <p className="wt-prose-empty">
              press <kbd>Space</kbd> to begin the walkthrough.
            </p>
          ) : (
            <>
              <p className="wt-prose-body">{latestAnnotation}</p>
              {terminal.length > 0 && (
                <div className="wt-terminal" aria-label="terminal so far">
                  <div className="wt-terminal-label">terminal</div>
                  <pre className="wt-terminal-pre">
                    {terminal.map((line, i) => (
                      <div key={i}>{line || ' '}</div>
                    ))}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <footer
        className="wt-footer"
        style={{
          gridArea: 'footer',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <button
          type="button"
          className="wt-btn"
          onClick={unReveal}
          disabled={revealed === 0}
          aria-label="step back (Backspace)"
        >
          ← back
        </button>
        <button
          type="button"
          className="wt-btn wt-btn--primary"
          onClick={reveal}
          disabled={revealed === totalSteps}
          aria-label="reveal next step (Space)"
        >
          {revealed === totalSteps ? 'done' : 'reveal next'}
        </button>
        <button
          type="button"
          className="wt-btn"
          onClick={revealAll}
          disabled={revealed === totalSteps}
          aria-label="reveal all (End)"
        >
          reveal all
        </button>
      </footer>

      <style>{WT_STYLES}</style>
    </section>
  );
}

const WT_STYLES = `
.wt-root {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  background: var(--bg-0, #0d1117);
  color: var(--text-0, #e6edf3);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
}
.wt-header {
  padding: 8px 4px;
  border-bottom: 1px solid var(--border-1, #30363d);
}
.wt-stem {
  margin: 0;
  font-size: 14px;
  line-height: 1.45;
  color: var(--text-0, #e6edf3);
  font-weight: 500;
  white-space: pre-wrap;
}

.wt-prose-pane {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  padding: 10px 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.wt-prose-empty {
  margin: 0;
  font-size: 12px;
  color: var(--text-2, #6e7681);
  font-style: italic;
}
.wt-prose-empty kbd {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 3px;
  padding: 1px 6px;
  color: var(--accent-cyan, #79c0ff);
  font-family: inherit;
  font-size: 11px;
}
.wt-prose-body {
  margin: 0;
  font-family: var(--font-sans, system-ui, sans-serif);
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-0, #e6edf3);
  white-space: pre-wrap;
}

.wt-terminal {
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 3px;
  padding: 6px 10px;
}
.wt-terminal-label {
  font-size: 10px;
  color: var(--text-2, #6e7681);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  margin-bottom: 4px;
}
.wt-terminal-pre {
  margin: 0;
  font-size: 12px;
  color: var(--accent-grn, #7ee787);
  white-space: pre-wrap;
}

.wt-btn {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  color: var(--text-0, #e6edf3);
  padding: 6px 14px;
  border-radius: 4px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.wt-btn:hover:not(:disabled) {
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--accent-cyan, #79c0ff);
}
.wt-btn:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.wt-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.wt-btn--primary {
  background: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  border-color: var(--accent-cyan, #79c0ff);
  font-weight: 600;
}
@media (max-width: 768px) {
  .wt-right-col { grid-template-rows: auto auto !important; }
}
`;

export default WalkthroughCard;
