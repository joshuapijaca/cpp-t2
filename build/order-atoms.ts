// Topological sort with priority weights. Per docs/10_prereq_ordering_algorithm.md.
// Reads outlines/**/*.yml → emits data/ordered_ids.json.
//
// Run: npx tsx build/order-atoms.ts

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import yaml from 'js-yaml';
import { glob } from 'glob';
import { resolve, dirname } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const OUTLINE_GLOB = 'outlines/**/*.yml';
const OUT_PATH = 'data/ordered_ids.json';

interface Outline {
  id: string;
  fact: string;
  level: number;
  status: string;
  deps?: string[];
  q_tags?: { Q1: string; Q2: string; Q3: string; Q4: string };
}

function loadOutlines(): Outline[] {
  const files = glob.sync(OUTLINE_GLOB, { cwd: ROOT });
  return files
    .map((f) => yaml.load(readFileSync(resolve(ROOT, f), 'utf8')) as Outline)
    .filter((o) => o && o.status === 'locked');
}

interface Node {
  id: string;
  outline: Outline;
  outEdges: Set<string>;
  inDegree: number;
}

function buildGraph(outlines: Outline[]): { nodes: Map<string, Node>; missing: string[] } {
  const nodes = new Map<string, Node>();
  for (const o of outlines) {
    nodes.set(o.id, { id: o.id, outline: o, outEdges: new Set(), inDegree: 0 });
  }

  const missing: string[] = [];
  for (const o of outlines) {
    for (const dep of o.deps ?? []) {
      const depNode = nodes.get(dep);
      if (!depNode) {
        missing.push(`${o.id} depends on missing ${dep}`);
        continue;
      }
      // dep → o (dep must come before o)
      if (!depNode.outEdges.has(o.id)) {
        depNode.outEdges.add(o.id);
        nodes.get(o.id)!.inDegree++;
      }
    }
  }

  return { nodes, missing };
}

function transitiveDescendants(nodes: Map<string, Node>): Map<string, number> {
  const desc = new Map<string, number>();
  const memo = new Map<string, Set<string>>();

  function compute(id: string, visiting: Set<string>): Set<string> {
    if (memo.has(id)) return memo.get(id)!;
    if (visiting.has(id)) return new Set(); // cycle (handled separately)
    visiting.add(id);
    const out = new Set<string>();
    const node = nodes.get(id)!;
    for (const c of node.outEdges) {
      out.add(c);
      const sub = compute(c, visiting);
      for (const s of sub) out.add(s);
    }
    visiting.delete(id);
    memo.set(id, out);
    return out;
  }

  for (const id of nodes.keys()) {
    desc.set(id, compute(id, new Set()).size);
  }
  return desc;
}

function priority(node: Node, descendants: Map<string, number>): [number, number, number, string] {
  const qt = node.outline.q_tags;
  const criticalCount = qt
    ? (['Q1', 'Q2', 'Q3', 'Q4'] as const).filter((q) => qt[q] === 'C').length
    : 0;
  // Lower level first (axioms first per docs/10); within level, higher Q-criticality + descendants first.
  return [
    node.outline.level,
    -criticalCount,
    -(descendants.get(node.id) ?? 0),
    node.id,
  ];
}

function compareTuple(a: [number, number, number, string], b: [number, number, number, string]): number {
  for (let i = 0; i < 3; i++) {
    if (a[i]! < b[i]!) return -1;
    if (a[i]! > b[i]!) return 1;
  }
  if (a[3] < b[3]) return -1;
  if (a[3] > b[3]) return 1;
  return 0;
}

function topoSortWithPriority(nodes: Map<string, Node>, descendants: Map<string, number>): string[] {
  const inDeg = new Map<string, number>();
  for (const [id, n] of nodes) inDeg.set(id, n.inDegree);

  const ready: Node[] = [];
  for (const [id, deg] of inDeg) {
    if (deg === 0) ready.push(nodes.get(id)!);
  }

  const result: string[] = [];

  while (ready.length > 0) {
    ready.sort((a, b) => compareTuple(priority(a, descendants), priority(b, descendants)));
    const next = ready.shift()!;
    result.push(next.id);
    for (const childId of next.outEdges) {
      const newDeg = (inDeg.get(childId) ?? 0) - 1;
      inDeg.set(childId, newDeg);
      if (newDeg === 0) ready.push(nodes.get(childId)!);
    }
  }

  return result;
}

function validate(ordered: string[], nodes: Map<string, Node>): string[] {
  const errors: string[] = [];
  if (ordered.length !== nodes.size) {
    errors.push(`Expected ${nodes.size} atoms, got ${ordered.length} — likely cycle`);
  }
  const indexOf = new Map<string, number>();
  ordered.forEach((id, i) => indexOf.set(id, i));
  for (const [id, n] of nodes) {
    for (const dep of n.outline.deps ?? []) {
      const depIdx = indexOf.get(dep);
      const myIdx = indexOf.get(id);
      if (depIdx === undefined || myIdx === undefined) continue;
      if (depIdx >= myIdx) {
        errors.push(`${id} (idx ${myIdx}) appears before its dep ${dep} (idx ${depIdx})`);
      }
    }
  }
  return errors;
}

function main() {
  const outlines = loadOutlines();
  console.log(`Loaded ${outlines.length} locked outlines.`);

  const { nodes, missing } = buildGraph(outlines);
  if (missing.length > 0) {
    console.warn(`⚠ ${missing.length} missing-dep warning(s):`);
    for (const m of missing.slice(0, 5)) console.warn(`  ${m}`);
    if (missing.length > 5) console.warn(`  ... and ${missing.length - 5} more`);
  }

  const descendants = transitiveDescendants(nodes);
  const ordered = topoSortWithPriority(nodes, descendants);

  const errs = validate(ordered, nodes);
  if (errs.length > 0) {
    console.error(`✕ ${errs.length} validation error(s):`);
    for (const e of errs) console.error(`  ${e}`);
    process.exit(1);
  }

  let maxOut = 0;
  let maxDesc = 0;
  for (const n of nodes.values()) {
    if (n.outEdges.size > maxOut) maxOut = n.outEdges.size;
  }
  for (const v of descendants.values()) {
    if (v > maxDesc) maxDesc = v;
  }

  const out = {
    version: '1',
    atom_count: ordered.length,
    ordered_ids: ordered,
    metrics: {
      max_in_degree: Math.max(...Array.from(nodes.values()).map((n) => n.inDegree)),
      max_out_degree: maxOut,
      max_descendants: maxDesc,
      missing_deps: missing.length,
    },
  };

  const outAbs = resolve(ROOT, OUT_PATH);
  mkdirSync(dirname(outAbs), { recursive: true });
  writeFileSync(outAbs, JSON.stringify(out, null, 2));
  console.log(`✓ wrote ${ordered.length} ordered atoms to ${OUT_PATH}`);
  console.log(`  max in-degree: ${out.metrics.max_in_degree}`);
  console.log(`  max out-degree: ${out.metrics.max_out_degree}`);
  console.log(`  max descendants: ${out.metrics.max_descendants}`);
}

main();
