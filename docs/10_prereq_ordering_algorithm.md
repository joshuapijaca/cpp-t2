# 10 — Prerequisite Ordering Algorithm

Mathematical basis for the linear card sequence. Deterministic, reproducible, provably no-prereq-violation.

---

## Problem Statement

Given:
- Set of N atoms (currently 177; may grow to ~250)
- Each atom has dependency set `deps[]` (atom IDs that must be learned first)
- Each atom has Q-tags (Q1-Q4: critical / supporting / not-used)
- Each atom has level (-1 to 17, derived from deps)

Find: linear order of atoms such that:
1. **Correctness**: every atom appears after all its `deps` (no prereq violation)
2. **Pedagogical optimality**: highest-leverage atoms taught earliest within constraints
3. **Determinism**: same input → same output (no randomness)

---

## Algorithm

### Step 1 — Build DAG

```python
G = DirectedGraph()
for atom in atoms:
  G.add_node(atom.id, data=atom)
  for dep_id in atom.deps:
    G.add_edge(dep_id, atom.id)   # dep → atom
```

### Step 2 — Validate (no cycles)

```python
assert is_dag(G), f"Cycle detected: {find_cycle(G)}"
```

If cycle found → outline error → reject build.

### Step 3 — Compute Per-Atom Metrics

```python
for atom in atoms:
  atom.out_degree = G.out_degree(atom.id)
  atom.transitive_descendants = len(descendants(G, atom.id))
  atom.critical_q_count = sum(1 for q in ['Q1','Q2','Q3','Q4'] if atom.q_tags[q] == 'C')
  atom.shortest_path_to_q = min(
    shortest_path_len(G, atom.id, target.id)
    for target in [Q1_sim_atoms, Q2_sim_atoms, Q3_sim_atoms, Q4_sim_atoms]
    if reachable(G, atom.id, target.id)
  )
```

| Metric | Meaning |
|--------|---------|
| `out_degree` | Direct dependent count |
| `transitive_descendants` | All atoms transitively reachable from this one |
| `critical_q_count` | Atom hits how many of Q1-Q4 as `C` |
| `shortest_path_to_q` | Distance from atom to nearest Q-sim atom |

### Step 4 — Topological Sort with Priority

Kahn's algorithm with priority queue:

```python
ready_set = set(atoms_with_no_deps)
result = []

while ready_set:
  # Among ready atoms, pick highest priority
  next_atom = argmax(ready_set, key=priority_fn)
  result.append(next_atom)

  for child in G.successors(next_atom.id):
    G.remove_edge(next_atom.id, child)
    if G.in_degree(child) == 0:
      ready_set.add(child)

  ready_set.remove(next_atom)

assert len(result) == len(atoms), "Cycle (impossible after step 2)"
return result
```

### Step 5 — Priority Function

```python
def priority_fn(atom):
  return (
    -atom.level,                  # lower level first (axioms first)
    -atom.critical_q_count,       # higher Q-coverage first
    -atom.transitive_descendants, # higher leverage first
    atom.id                       # deterministic tie-break (lex order)
  )
```

**Tie-break order matters.** Same-level atoms ordered by:
1. Level ascending (axioms before composites)
2. Critical-Q count descending (high-leverage first)
3. Transitive-descendants descending (atoms many others depend on first)
4. Atom ID ascending (deterministic)

### Step 6 — Validation

```python
for i, atom in enumerate(result):
  for dep_id in atom.deps:
    dep_index = result.index(dep_id)
    assert dep_index < i, f"{atom.id} depends on {dep_id} but appears earlier!"
```

If validation fails → algorithm bug → halt build.

---

## Worked Example (Subset)

Atoms (subset for illustration):

| ID | Level | Deps | Q1 Q2 Q3 Q4 | Critical-Q count | Out-degree |
|----|-------|------|---|---|---|---|---|---|
| V-01 | 2 | — | C C C C | 4 | 50 |
| V-04 | 2 | V-02, V-03 | C C C C | 4 | 30 |
| V-10 | 2 | V-03 | C C C C | 4 | 25 |
| H-01 | 8 | — | C N C C | 3 | 8 |
| H-04 | 8 | H-01, V-01 | C N C C | 3 | 6 |
| R-01 | 9 | H-04 | C N C C | 3 | 5 |
| R-03 | 9 | V-01, R-01, H-04 | C N C C | 3 | 4 |

Topo + priority result (subset):

```
1. V-01   level=2, Q-crit=4, td=50, id=V-01    ← highest leverage at L2
2. V-03   level=2, ...
3. V-10   level=2, Q-crit=4, td=25
4. V-04   level=2, Q-crit=4, td=30
...
N. H-01   level=8, Q-crit=3, td=8
N+1. H-04 level=8, Q-crit=3, td=6
...
M. R-01   level=9, Q-crit=3, td=5
M+1. R-03 level=9, Q-crit=3, td=4
```

V-01 first (level 2, max Q-crit, max descendants). H-01 before H-04 (both level 8, V-04 a dep of H-04). R-01 before R-03 (both level 9, R-01 a dep of R-03).

---

## Information Theory Justification

### Why optimize for `transitive_descendants`?

Atom with `transitive_descendants = D` provides information that propagates to D downstream learnings. Teaching such an atom first amortizes a lot.

Equivalent: minimize **expected number of "prereq missing" events** if student forgets later atoms. High-fanout atoms = high-leverage; teach early.

### Why optimize for `critical_q_count`?

Each Q1-Q4 critical atom contributes to ~25% of exam mark (one question). Atom hitting all 4 Qs as critical = full-mark contributor; teaching it first guarantees all 4 sims have foundation.

### Why level-first?

Levels encode prereq strata. Within a level, atoms are independent of each other (no intra-level deps). Across levels, deps respected. Level-first ordering = strict topological respect.

### Tie-break determinism

Without `id` tie-break, ordering would be implementation-dependent (e.g., hash-set iteration order). With it, two runs produce identical card sequence. Critical for reproducible builds.

---

## Edge Cases

### Atom in multiple levels

Disallowed. Each atom has exactly one level (per outline `level` field). If an atom belongs in two levels → split into two atoms.

### Cyclic dep

Outline error. Build fails with named cycle.

```
Cycle detected: R-03 → R-04 → R-03
Resolution: re-examine deps; remove false dep or split atom.
```

### Forward dep (atom in level N depends on atom in level N+1)

Disallowed by topo sort. Either:
- Move dep to current or earlier level (refactor outline)
- Recognize that the "dep" was actually an information-bridge, not a true prereq → drop dep

### Multiple atoms with identical priority

Tie-break by ID. Deterministic.

---

## Implementation Sketch

```typescript
// src/build/order-atoms.ts (build-time only)

import yaml from 'js-yaml';
import { topoSort } from './topo';

interface Outline {
  id: string;
  level: number;
  deps: string[];
  q_tags: { Q1: 'C'|'S'|'N'; Q2: 'C'|'S'|'N'; Q3: 'C'|'S'|'N'; Q4: 'C'|'S'|'N' };
  // ... other fields per 08_outline_spec.md
}

function loadOutlines(): Outline[] { /* read all outlines/**/*.yml */ }

function priority(atom: Outline, descendants: Map<string, number>): [number, number, number, string] {
  const criticalCount = ['Q1','Q2','Q3','Q4'].filter(q => atom.q_tags[q] === 'C').length;
  return [
    -atom.level,
    -criticalCount,
    -(descendants.get(atom.id) ?? 0),
    atom.id,
  ];
}

function order(atoms: Outline[]): Outline[] {
  validateNoCycles(atoms);
  const descendants = computeTransitiveDescendants(atoms);
  return topoSortWithPriority(atoms, a => priority(a, descendants));
}

// Output: ordered list of atom IDs → consumed by card generator
```

---

## Testing the Algorithm

```typescript
describe('order-atoms', () => {
  it('respects all dependencies', () => {
    const ordered = order(outlines);
    for (let i = 0; i < ordered.length; i++) {
      for (const depId of ordered[i].deps) {
        const depIdx = ordered.findIndex(a => a.id === depId);
        expect(depIdx).toBeLessThan(i);
      }
    }
  });

  it('places higher Q-critical atoms before lower at same level', () => {
    /* sample two atoms at same level, different criticalQ; assert ordering */
  });

  it('is deterministic across runs', () => {
    expect(order(outlines)).toEqual(order(outlines));
  });
});
```

---

## Output Format

```json
{
  "version": "1",
  "atom_count": 177,
  "ordered_ids": [
    "P-01", "P-02", "P-03", "P-04", "P-05", "P-06", "P-07",
    "S-04", "S-05", "S-06",
    "S-01", "S-02", "S-03", "S-07", "S-08", "S-09", "S-10",
    "V-01", "V-03", "V-10", ...
  ],
  "metrics": {
    "max_in_degree": 4,
    "max_out_degree": 50,
    "max_path_length": 18
  }
}
```

Consumed by card generator and runtime sequence loader.

---

## Acceptance Criteria

| Test | Pass condition |
|------|--------------|
| No cycles | DAG validation passes |
| All deps respected | Validation step 6 passes |
| Deterministic | Two runs produce identical `ordered_ids` |
| Level monotonic | `ordered[i].level >= ordered[i-1].level` |
| Critical-Q-density front-loaded | First 30% of sequence has ≥40% of all `critical_q_count` units |

If any fails → block build → fix outlines.

---

## Why Not Just Use the Level Numbers?

Level numbers in [07](07_master_plan.md) are coarse (-1 to 17 = 19 buckets). Within a level (e.g., Level 2 has 20 atoms), some are higher-leverage than others. Algorithm refines intra-level order.

Hand-ordering by intuition risks suboptimal choices: e.g., teaching `V-08` (= vs == distinction) before `V-04` (declare type+name) violates leverage principle (V-04 has 30 descendants; V-08 has 4).

Algorithm = math-derived order > intuition-derived order. Removes argument.
