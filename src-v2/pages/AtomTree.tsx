/**
 * AtomTree.tsx — UX-M20 Atom DAG Visualizer.
 *
 * Renders the prereq DAG as a top-down layered graph in pure SVG.
 * No dagre / elkjs / d3 — bundle budget is tight, and a Sugiyama-style
 * layout for ~30-200 nodes fits in <300 lines without dependencies.
 *
 * Layout algorithm (deterministic, O(N log N + E)):
 *   1. Compute depth(atom) = 1 + max(depth(prereq)) via topo-sort
 *      (atoms with no prereqs are depth 0).
 *   2. Group atoms by depth → "ranks".
 *   3. Within each rank, sort by id alphabetically → x slot index.
 *   4. Position: node at (x = SLOT_W * slotIdx, y = ROW_H * depth).
 *   5. Draw bezier edges from parent.bottom → child.top.
 *
 * Node coloring (familiarity %):
 *   ≥85%  green  (state-ok)
 *   50-84 amber  (state-warn)
 *   <50   red    (state-err)
 *   untouched / null  gray (text-2)
 *
 * Interaction:
 *   - Click node → opens right-side drawer with atom detail + Drill CTA.
 *   - Pan: hold Space + drag.  Cursor switches to grab/grabbing.
 *   - Zoom: scroll wheel.  Zoom origin = cursor position.
 *   - Filter: Q-track chips (Q1..Q4) hide non-contributing atoms.
 *
 * Accessibility:
 *   - Each node is a focusable <g role="button">.
 *   - Keyboard tab cycles depth-major then slot-major.
 *   - Enter/Space opens drawer.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Atom } from '../types/atom';
import type { QTag } from '../types/card-schema';

// ─────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────

export interface AtomFamiliarity {
  /** 0..100, or null for untouched. */
  pct: number | null;
}

export interface AtomTreeProps {
  atoms: Atom[];
  /** Map atomId → familiarity. Missing atoms are treated as untouched. */
  familiarity: Record<string, AtomFamiliarity | undefined>;
  /** Open the drill deck for the chosen atom. */
  onDrill: (atomId: string) => void;
}

const SLOT_W = 140;
const ROW_H = 100;
const NODE_W = 110;
const NODE_H = 56;
const PAD = 40;

// ─────────────────────────────────────────────────────────────────────
// Layout helpers — pure, side-effect free.
// ─────────────────────────────────────────────────────────────────────

interface LaidOutNode {
  id: string;
  atom: Atom;
  depth: number;
  slot: number;
  x: number;
  y: number;
}

function layout(atoms: Atom[]): { nodes: LaidOutNode[]; width: number; height: number } {
  const byId: Record<string, Atom> = {};
  for (const a of atoms) byId[a.id] = a;

  // depth memoization with cycle defense (cycle => depth 0)
  const depthCache: Record<string, number> = {};
  const inProgress = new Set<string>();

  function depthOf(id: string): number {
    if (depthCache[id] !== undefined) return depthCache[id];
    if (inProgress.has(id)) return 0;
    const a = byId[id];
    if (!a) return 0;
    if (a.prereqs.length === 0) {
      depthCache[id] = 0;
      return 0;
    }
    inProgress.add(id);
    let max = 0;
    for (const p of a.prereqs) {
      const d = depthOf(p) + 1;
      if (d > max) max = d;
    }
    inProgress.delete(id);
    depthCache[id] = max;
    return max;
  }

  // Bucket atoms by depth, sort each bucket by id for deterministic layout.
  const buckets: Record<number, Atom[]> = {};
  for (const a of atoms) {
    const d = depthOf(a.id);
    (buckets[d] ??= []).push(a);
  }
  for (const k of Object.keys(buckets)) {
    buckets[Number(k)]!.sort((a, b) => a.id.localeCompare(b.id));
  }

  const depths = Object.keys(buckets).map(Number).sort((a, b) => a - b);
  const maxDepth = depths.length === 0 ? 0 : depths[depths.length - 1]!;
  const widestRank = Math.max(...depths.map((d) => buckets[d]!.length), 1);

  const nodes: LaidOutNode[] = [];
  for (const d of depths) {
    const bucket = buckets[d]!;
    const offsetX = (widestRank - bucket.length) * SLOT_W / 2;
    bucket.forEach((a, slot) => {
      nodes.push({
        id: a.id,
        atom: a,
        depth: d,
        slot,
        x: PAD + offsetX + slot * SLOT_W,
        y: PAD + d * ROW_H,
      });
    });
  }

  const width = PAD * 2 + widestRank * SLOT_W;
  const height = PAD * 2 + (maxDepth + 1) * ROW_H;
  return { nodes, width, height };
}

function familiarityColor(f: AtomFamiliarity | undefined): { fill: string; border: string; text: string } {
  if (!f || f.pct === null) {
    return { fill: 'var(--bg-2)', border: 'var(--border-1)', text: 'var(--text-2)' };
  }
  if (f.pct >= 85) {
    return { fill: 'rgba(63, 185, 80, 0.18)', border: 'var(--state-ok)', text: 'var(--state-ok)' };
  }
  if (f.pct >= 50) {
    return { fill: 'rgba(210, 153, 34, 0.18)', border: 'var(--state-warn)', text: 'var(--state-warn)' };
  }
  return { fill: 'rgba(248, 81, 73, 0.18)', border: 'var(--state-err)', text: 'var(--state-err)' };
}

// ─────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────

export function AtomTree({ atoms, familiarity, onDrill }: AtomTreeProps) {
  const [qFilter, setQFilter] = useState<QTag | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  // ── Pan / zoom state ────────────────────────────────────────────
  const [zoom, setZoom] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const spaceDown = useRef(false);
  const dragging = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Filter atoms by Q-track if active.
  const visibleAtoms = useMemo(() => {
    if (qFilter === null) return atoms;
    return atoms.filter((a) => a.usedByQs.includes(qFilter));
  }, [atoms, qFilter]);

  const visibleIds = useMemo(() => new Set(visibleAtoms.map((a) => a.id)), [visibleAtoms]);

  const { nodes, width, height } = useMemo(() => layout(visibleAtoms), [visibleAtoms]);
  const nodeById = useMemo(() => {
    const m: Record<string, LaidOutNode> = {};
    for (const n of nodes) m[n.id] = n;
    return m;
  }, [nodes]);

  // ── Edges (only between visible atoms) ─────────────────────────
  const edges = useMemo(() => {
    const out: Array<{ from: LaidOutNode; to: LaidOutNode }> = [];
    for (const n of nodes) {
      for (const p of n.atom.prereqs) {
        const from = nodeById[p];
        if (from && visibleIds.has(p)) out.push({ from, to: n });
      }
    }
    return out;
  }, [nodes, nodeById, visibleIds]);

  // ── Pan handlers ───────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === 'Space' && !spaceDown.current) {
        spaceDown.current = true;
        if (containerRef.current) containerRef.current.style.cursor = 'grab';
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === 'Space') {
        spaceDown.current = false;
        if (containerRef.current) containerRef.current.style.cursor = 'default';
      }
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!spaceDown.current) return;
    e.preventDefault();
    dragging.current = { x: e.clientX, y: e.clientY, tx, ty };
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
  }, [tx, ty]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    const d = dragging.current;
    setTx(d.tx + (e.clientX - d.x));
    setTy(d.ty + (e.clientY - d.y));
  }, []);

  const onMouseUp = useCallback(() => {
    dragging.current = null;
    if (containerRef.current) containerRef.current.style.cursor = spaceDown.current ? 'grab' : 'default';
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    setZoom((z) => Math.min(3, Math.max(0.3, z * factor)));
  }, []);

  const selectedAtom = useMemo(
    () => (selected ? atoms.find((a) => a.id === selected) ?? null : null),
    [selected, atoms]
  );

  return (
    <div style={{ height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr', background: 'var(--bg-0)' }}>
      {/* ─── Header ───────────────────────────────────────────── */}
      <header
        className="mono"
        style={{
          padding: '12px 20px',
          borderBottom: '1px solid var(--border-1)',
          background: 'var(--bg-1)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 14, color: 'var(--text-0)' }}>Atom Tree</h2>
        <span style={{ color: 'var(--text-2)' }}>·</span>
        <span style={{ color: 'var(--text-1)', fontSize: 12 }}>{visibleAtoms.length} atoms · {edges.length} edges</span>
        <span style={{ flex: 1 }} />
        <span style={{ color: 'var(--text-2)', fontSize: 11 }}>filter:</span>
        <FilterChip label="all" active={qFilter === null} onClick={() => setQFilter(null)} />
        {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map((q) => (
          <FilterChip key={q} label={q} active={qFilter === q} onClick={() => setQFilter(q)} />
        ))}
        <span style={{ color: 'var(--text-2)', fontSize: 11, marginLeft: 16 }}>
          space+drag pan · scroll zoom · {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => { setZoom(1); setTx(0); setTy(0); }}
          style={tinyBtn}
        >
          reset
        </button>
      </header>

      {/* ─── Canvas + drawer ─────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div
          ref={containerRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={onWheel}
          style={{ width: '100%', height: '100%', overflow: 'hidden' }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox={`${-tx / zoom} ${-ty / zoom} ${width / zoom} ${height / zoom}`}
            preserveAspectRatio="xMidYMin meet"
            style={{ display: 'block' }}
          >
            {/* edges first so they sit under nodes */}
            <g stroke="var(--border-2)" fill="none" strokeWidth={1} opacity={0.6}>
              {edges.map(({ from, to }, i) => {
                const x1 = from.x + NODE_W / 2;
                const y1 = from.y + NODE_H;
                const x2 = to.x + NODE_W / 2;
                const y2 = to.y;
                const cy = (y1 + y2) / 2;
                return (
                  <path
                    key={i}
                    d={`M ${x1} ${y1} C ${x1} ${cy}, ${x2} ${cy}, ${x2} ${y2}`}
                  />
                );
              })}
            </g>

            {/* nodes */}
            {nodes.map((n) => {
              const fam = familiarity[n.id];
              const c = familiarityColor(fam);
              const isSelected = selected === n.id;
              return (
                <g
                  key={n.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${n.atom.name} familiarity ${fam?.pct ?? 'untouched'}`}
                  onClick={() => setSelected(n.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelected(n.id);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={n.x}
                    y={n.y}
                    width={NODE_W}
                    height={NODE_H}
                    rx={6}
                    fill={c.fill}
                    stroke={isSelected ? 'var(--accent-cyan)' : c.border}
                    strokeWidth={isSelected ? 2 : 1}
                  />
                  <text
                    x={n.x + NODE_W / 2}
                    y={n.y + 22}
                    textAnchor="middle"
                    fill={c.text}
                    fontFamily="var(--font-mono)"
                    fontSize={12}
                    fontWeight={700}
                  >
                    {n.id}
                  </text>
                  <text
                    x={n.x + NODE_W / 2}
                    y={n.y + 40}
                    textAnchor="middle"
                    fill="var(--text-1)"
                    fontFamily="var(--font-mono)"
                    fontSize={10}
                  >
                    {fam && fam.pct !== null ? `${fam.pct}%` : 'untouched'}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* ─── Detail drawer ───────────────────────────────────── */}
        {selectedAtom && (
          <aside
            role="region"
            aria-label="Atom detail"
            style={{
              position: 'absolute',
              top: 12, right: 12, bottom: 12,
              width: 320,
              background: 'var(--bg-1)',
              border: '1px solid var(--border-2)',
              borderRadius: 6,
              padding: 16,
              boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              fontFamily: 'var(--font-mono)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong style={{ fontSize: 14, color: 'var(--accent-cyan)' }}>{selectedAtom.id}</strong>
              <span style={{ flex: 1 }} />
              <button type="button" onClick={() => setSelected(null)} style={tinyBtn} aria-label="Close">×</button>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-0)' }}>{selectedAtom.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-1)' }}>
              level {selectedAtom.level} · uses by {selectedAtom.usedByQs.join(', ')}
            </div>
            {selectedAtom.description && (
              <div style={{ fontSize: 11, color: 'var(--text-1)', lineHeight: 1.5 }}>
                {selectedAtom.description}
              </div>
            )}
            <div style={{ fontSize: 11, color: 'var(--text-2)' }}>
              prereqs: {selectedAtom.prereqs.length === 0 ? 'none' : selectedAtom.prereqs.join(', ')}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-2)' }}>
              card target: {selectedAtom.cardCountTarget}
            </div>
            <FamiliarityBar fam={familiarity[selectedAtom.id]} />
            <span style={{ flex: 1 }} />
            <button
              type="button"
              onClick={() => onDrill(selectedAtom.id)}
              style={{
                padding: '10px 14px',
                background: 'var(--accent-cyan)',
                color: 'var(--bg-0)',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Drill now →
            </button>
          </aside>
        )}
      </div>
    </div>
  );
}

function FilterChip(props: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      style={{
        padding: '4px 10px',
        background: props.active ? 'var(--accent-cyan)' : 'var(--bg-2)',
        color: props.active ? 'var(--bg-0)' : 'var(--text-1)',
        border: '1px solid var(--border-1)',
        borderRadius: 12,
        cursor: 'pointer',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: props.active ? 700 : 400,
      }}
    >
      {props.label}
    </button>
  );
}

function FamiliarityBar({ fam }: { fam: AtomFamiliarity | undefined }) {
  const pct = fam?.pct ?? 0;
  const c = familiarityColor(fam);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-2)', marginBottom: 4 }}>
        <span>familiarity</span>
        <span style={{ color: c.text }}>{fam?.pct === null || fam === undefined ? 'untouched' : `${pct}%`}</span>
      </div>
      <div style={{ height: 6, background: 'var(--bg-3)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: c.border, transition: 'width 200ms ease-out' }} />
      </div>
    </div>
  );
}

const tinyBtn: React.CSSProperties = {
  padding: '4px 10px',
  background: 'var(--bg-2)',
  border: '1px solid var(--border-1)',
  borderRadius: 4,
  cursor: 'pointer',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  color: 'var(--text-1)',
};

export default AtomTree;
