# 14 — SEE Cards Master Plan

Canonical reference for the top-down / a posteriori / mirror-neuron half of the deck. Parallel to [07_master_plan.md](07_master_plan.md) which covers DO (bottom-up / a priori / production) cards.

This doc lives alongside [07](07_master_plan.md). Both are canonical; together they form the complete deck.

---

## Why SEE Cards Exist

Existing 1,159 DO cards (memorize + mcq + trace + write + mock) train **production**:
- Bottom-up: parts → whole (atom-by-atom syntax)
- A priori: definition-first (rules memorized then applied)
- Output practice: type the fact, write the code
- Verbal encoding only

Missing layer trains **observation**:
- Top-down: whole → parts (full code → recognize atoms)
- A posteriori: pattern from experience (50 real `&` uses → instinctive recognition)
- Input practice: mirror-neuron immersion (watch expert code, internalize)
- Visual encoding (dual-coding theory: visual + verbal both encoded)

Without SEE cards, student memorizes a dictionary but cannot read a paragraph. SEE cards close the loop.

---

## 3 New Card Types

### Type 1: `demo`

Read-only. Show real C++ snippet with atom highlighted in context. One-line "why" + "where used" metadata.

```typescript
interface DemoCard {
  type: 'demo';
  atomId: string;
  whyOneLine: string;          // "powers all Q4 printf lines"
  demoCode: string;            // C++ snippet, multi-line
  highlightTokens: string[];   // exact substrings to bold/accent
  usedIn: string[];            // ["Q1", "Q3", "Q4"]
}
```

UX: card displays code + highlights + 2-line metadata. Press space → advance. No grading. ~5 sec.

### Type 2: `decompose`

Multi-select recognition. Show snippet, ask "which atoms compose this?". Student picks atom IDs from a list.

```typescript
interface DecomposeCard {
  type: 'decompose';
  atomId: string;            // primary atom this card emphasizes
  code: string;              // 1-3 line snippet
  atomOptions: Array<{ id: string; fact: string }>;  // 5-8 options including distractors
  correctAtomIds: string[];  // 2-5 correct selections
  explanation: string;
}
```

UX: code shown + checklist of options + submit button. Grade: exact set match. ~10 sec.

### Type 3: `walkthrough`

Multi-step narrative. Reveals one line at a time with annotation + atom IDs that compose it.

```typescript
interface WalkthroughCard {
  type: 'walkthrough';
  levelLabel: string;        // "L0 → L1 hello-world"
  fullCode: string;          // entire snippet shown statically
  steps: Array<{
    line: number;
    code: string;
    annotation: string;        // "entry point — every program needs main()"
    atomIds: string[];         // ["S-03"]
  }>;
}
```

UX: full code shown; press space repeatedly to reveal one annotation at a time below the code. Each step highlights the relevant line. After all steps, advance. ~30–60 sec per card.

---

## Volume Plan

### Per-atom budget

| Type | Per atom | Triggers |
|------|---------:|----------|
| `demo` (1) | 1 × 187 = 187 | every atom with `canonical_example` |
| `decompose` (1) | 1 × 187 = 187 | every atom |
| `demo` (alt-angle, Q-context) | 1 × 130 = 130 | atoms tagged C in any Q |
| `decompose` (multi-atom snippet) | 1 × 130 = 130 | same Q-tagged atoms |
| **subtotal per-atom SEE** | **634** | |

### Cross-cutting

| Type | Count | Trigger |
|------|------:|---------|
| `walkthrough` | 18 | 1 per level (L-1 through L17) |
| `worked-example` (Q-archetype `demo` style) | 40 | 10 per Q × 4 Qs (Q1–Q4 deep dives) |
| `read-and-predict` (alias of `demo` w/ prediction) | 200 | strategic placements every 5–10 atoms |
| **subtotal cross-cutting** | **258** | |

### Grand total

| Layer | Count |
|-------|------:|
| Per-atom SEE | 634 |
| Cross-cutting SEE | 258 |
| **Total NEW SEE cards** | **892** |
| Existing DO cards | 1,159 |
| **Combined deck** | **2,051** |

= 77% growth on existing deck. Tunable via `read-and-predict` count.

---

## Flow Integration

### Per-atom sequence

```
[SEE demo]      ← observe code, atom highlighted (5 sec, mirror-neuron prime)
   ↓
[SEE decompose] ← identify atoms in snippet (10 sec, top-down recognition)
   ↓
[DO memorize × 5] ← type the fact verbatim (40 sec, bottom-up production)
   ↓
[DO write/trace × N] ← apply in code (30–60 sec, integration) — Q-tied atoms only
```

Cognitive load per atom oscillates LOW → MED → MED → HIGH (only Q-tied atoms hit HIGH). No fatigue spike.

### Per-level sequence

```
[atom 1]  see-demo → decompose → memorize × 5 → optional write
[atom 2]  same...
...
[atom N]  same...
[walkthrough]  ← synthesizes the level: full code uses all N atoms with annotations
[next level]
```

### Per-Q-skill sequence (HE / SW / RW / MW levels)

```
[atom drill ...]
[worked-example × 2-3]  ← Q-archetype scenarios with full code, see expert solve
[next atom]
```

---

## Outline Schema (parallel to [08](08_outline_spec.md))

SEE cards are derived from existing per-atom outlines. Add fields to existing outline YAML:

```yaml
# outlines/L09/R-03.yml (existing) + ADD:

render_hints:
  # ... existing fields ...
  see_demo:
    why_one_line: "blocks 3 of 4 Test 2 questions"
    snippet: |
      void increment(int &x) {
          x = x + 1;
      }
      int main() {
          int n = 5;
          increment(n);
          cout << n;   // 6
      }
    highlights: ["&x", "increment(n)", "// 6"]
  see_decompose:
    snippet: "void increment(int &x) { x = x + 1; }"
    correct_atoms: [H-06, R-03, V-04, V-10, A-05, S-04]
    distractors: [R-01, T-02, G-13]
  see_walkthrough_step:                # used in level walkthroughs only
    line_role: "alias binding"
```

Auto-generation: build script reads outlines → emits SEE cards alongside DO cards.

For atoms WITHOUT `see_demo` field (e.g., L-1 axioms with no code): generator skips, falling back to DO-only.

---

## Cognitive-Science Foundations

| Mechanism | Source | Activated by |
|-----------|--------|--------------|
| **Dual-coding theory** (Paivio 1986) | visual + verbal traces strengthen recall | SEE adds visual; DO has verbal — both fire per atom |
| **Mirror-neuron priming** (Rizzolatti 2004) | observation activates same circuits as production | `demo` cards = passive observation of expert code |
| **Top-down comprehension** | whole→parts decomposition | `decompose` cards force whole-to-atoms mapping |
| **Bottom-up production** | parts→whole composition | DO memorize + write builds atoms-to-whole |
| **A priori encoding** | rule-first definitional knowledge | DO memorize: "& = alias" verbatim |
| **A posteriori encoding** | pattern-extraction from many examples | Multiple SEE demos build pattern library |
| **Spaced repetition within atom** (short-interval) | SEE → wait → DO same concept reinforces | Per-atom interleave |

All 7 mechanisms now fire per atom. Existing deck activates only 4 (verbal, a priori, bottom-up, production).

---

## Build Pipeline Extensions

### New build scripts

| Script | Purpose |
|--------|---------|
| `build/gen-see-demo-cards.ts` | Emit demo cards from outline `see_demo` fields |
| `build/gen-see-decompose-cards.ts` | Emit decompose cards from `see_decompose` |
| `build/gen-see-walkthroughs.ts` | Emit walkthrough cards from level summaries |
| `build/gen-see-worked-examples.ts` | Q-archetype walkthroughs from test2_bank |
| `build/gen-see-read-predict.ts` | Strategic prediction cards from canonical_examples |

### Card-order interleave script

| Script | Purpose |
|--------|---------|
| `build/interleave-see-do.ts` | Reorders cards.json so per-atom: `[demo, decompose, memorize×5, write/trace×N]` |

### Lint extensions

- `decompose` card: assert `correctAtomIds` ⊆ `atomOptions.id`
- `demo` card: assert all `highlightTokens` are substrings of `demoCode`
- `walkthrough` card: assert each step's `atomIds` resolves to known atoms

---

## New Card UX Renders

### `demo` card

```
L9 · R-03 · demo

why → blocks 3 of 4 Test 2 questions
used in → Q1 (HE-08, HE-15) · Q3 (RW-02) · Q4 (MW-06)

  void increment(int &x) {       ← `&x` highlighted accent green
      x = x + 1;
  }
  int main() {
      int n = 5;
      increment(n);
      cout << n;       // 6     ← `// 6` highlighted accent
  }

  press space to continue →
```

### `decompose` card

```
L0 · S-04 · decompose

  int x = 5;

  which atoms compose this line?  (pick all)

  [ ] V-04  declare: type name;
  [ ] V-10  int holds whole numbers
  [ ] V-15  5 is int literal
  [ ] A-05  = stores value
  [ ] S-04  ; ends statement
  [ ] R-03  & = alias            ← distractor
  [ ] T-02  struct Name { fields };  ← distractor

  enter to submit
```

### `walkthrough` card

```
L0 → L9 walkthrough — pass-by-ref hello-world

  full code visible:
    #include <iostream>
    using namespace std;
    void increment(int &x) { x = x + 1; }
    int main() {
        int n = 5;
        increment(n);
        cout << n;
        return 0;
    }

  step 1/8 → #include <iostream>      [S-01]
              brings cin/cout into scope

  press space to reveal step 2 →
```

---

## Acceptance Gates (M12+)

| Gate | Test |
|------|------|
| All atoms with code have demo | `canonical_example` exists → `demo` card emitted |
| Decompose `correctAtomIds` ⊆ options | lint check |
| Demo highlights are substrings | lint check |
| Walkthrough atomIds resolve | lint check |
| Per-atom SEE-DO interleave | first card per atom is `demo`, second is `decompose`, then DO |
| Card-type ratio | SEE 35% / memorize 40% / mcq 1% / trace 2% / write 8% / mock 1% (~770/890/15/47/167/20 ≈ 1909) |
| Bundle <500 KB gzip | unchanged target |

---

## Decision Status

Pending user authorization for:

1. Spec change: 4 card types → 7 (`demo`, `decompose`, `walkthrough` added)
2. New milestones M12–M17 — see [13_milestones.md](13_milestones.md) extension
3. ANTIPATTERNS update: 4-type cap removed; 7-type cap installed
4. CHANGELOG entry

Without these unlocks, this plan stays on paper.
