# 08 — Atom Outline Specification

Per-atom YAML schema. **Immutable once locked.** AI authors cards FROM these outlines; cannot author outlines themselves.

---

## File Layout

```
t2-from-zero/
├── outlines/
│   ├── L-1/
│   │   ├── P-01.yml
│   │   ├── P-02.yml
│   │   ...
│   ├── L00/
│   ├── L01/
│   ...
│   └── L17/
└── extraction/    ← raw source material from PFG + Test 2
```

One outline per atom. Filename = atom ID. Folder = level.

---

## Schema

```yaml
# outlines/L09/R-03.yml

# === IDENTITY (human-locked, AI cannot edit) ===
id: R-03
fact: "& in param affects caller"   # ≤7 words; auto-linted
words: 7
level: 9
deps:
  - V-01    # variable = memory box
  - R-01    # parameter receives copy by default
  - R-02    # mutating param doesn't change caller
  - H-04    # parameters become local boxes

# === Q-MAPPING (human-locked) ===
q_tags:
  Q1: C     # critical
  Q2: N     # not used
  Q3: C
  Q4: C

# === SOURCE EVIDENCE (human-extracted from PFG/Test 2) ===
pfg_source:
  - lesson: "11-passing-parameters-by-reference"
    file_path: "extraction/L09_RDS_passbyref/pfg_quotes.md"
    quote_id: "Q42"
    verbatim: |
      When a parameter is declared with &, the function receives an
      alias to the caller's variable. Mutations through this alias
      affect the caller's variable directly.

test2_evidence:
  - question: "Q1"
    instance: "who_am_i(stat_double &data) — d.mystery only updates because of &"
    file_path: "extraction/test2_bank/Q1_who_am_i_variants.md"
  - question: "Q3"
    instance: "read_X(X &list[], int n) — list mutations persist"
    file_path: "extraction/test2_bank/Q3_read_X_variants.md"

# === CANONICAL EXAMPLE (verified compileable) ===
canonical_example: |
  void increment(int &x) {
    x = x + 1;
  }
  int main() {
    int n = 5;
    increment(n);
    cout << n << endl;  // prints 6
    return 0;
  }
expected_output: "6"

# === SIT102 IDIOMS (lock against AI "improvement") ===
sit102_quirks:
  - "Use & not * for aliasing"
  - "Array param uses &arr[] not *arr"
  - "No const & required for mutation"
  - "Reference must initialize at param binding"

# === MISCONCEPTIONS (drives MCQ distractors) ===
misconceptions:
  - id: M01
    description: "Confuses & with * pointer dereference"
    student_says: "&x means address of x like in C"
    correct_says: "&x in param declaration means alias / reference"
  - id: M02
    description: "Thinks &array[] is invalid syntax"
    student_says: "You can't pass array by reference in C++"
    correct_says: "&array[] is the SIT102 idiom for pass-by-ref array"
  - id: M03
    description: "Returns value instead of mutating via &"
    student_says: "I'll return the modified struct"
    correct_says: "void + & is the idiom; mutation persists in caller"

# === CARD GENERATION HINTS ===
render_hints:
  memorize_seed_phrases:
    - "same memory box"
    - "alias / aliasing"
    - "caller sees changes"
    - "no copy made"
    - "two names one box"
  trace:
    description: "Show one memory box rendered with two labels (caller `n`, param `x`)"
    minimum_steps: 4
    must_show: ["pre-call state", "alias binding", "mutation through alias", "post-return state"]
  write_L1_fill:
    template: "void increment(int ___ x) { x = x + 1; }"
    blank_value: "&"
  write_L2_complete:
    template: "void incr(int &x) { ___ }"
    blank_value: "x = x + 1;"
  write_L3_free_spec: "Write a function that increments its int parameter so the caller sees the change. Use pass-by-reference."

  # === SEE-half hints (M15+; per docs/14_see_cards_master_plan.md) ===
  see_demo:
    why_one_line: "& binds parameter to caller's box - same memory, two names."   # 1 sentence, Hemingway prose, T2-anchored
    snippet: |                                                                    # canonical C++ for the demo card; null if axiom
      void increment(int &x) {
        x = x + 1;
      }
      int main() {
        int n = 5;
        increment(n);
        cout << n << endl;
        return 0;
      }
    highlights: ["int &x", "increment(n)"]                                        # exact substrings to accent in the snippet
    used_in: [Q1, Q3, Q4]                                                         # Q-tags that the renderer surfaces as badges
  see_decompose:
    snippet: |                                                                    # 1-3 lines for the multi-select recognition card
      void increment(int &x) {
        x = x + 1;
      }
    correct_atoms: [R-03, V-01, R-01, R-02]                                       # = self + deps; auto-derived
    distractors: [R-04, T-01]                                                     # siblings + 1 distant family; lint-checked

# === ACCEPTANCE CRITERIA (AI must satisfy these per card) ===
acceptance:
  memorize:
    - "All 5 variants must include one of: 'same box', 'alias', 'caller sees', 'no copy', 'shared memory'"
    - "Each variant ≤7 words"
    - "No variant uses pointer terminology (`*`, `address of`, `dereference`)"
  mcq:
    - "Correct option mentions: same memory / aliasing / caller mutation"
    - "All 3 distractors drawn from `misconceptions` list above"
    - "No distractor is gibberish or trivially wrong"
  trace:
    - "Variable boxes show one box with two labels"
    - "expectedSteps[] has ≥4 steps matching `render_hints.trace.must_show`"
    - "expected_output matches canonical_example exactly"
  write:
    - "L1 expected answer = `&` exactly"
    - "L2 expected answer compiles and produces `expected_output`"
    - "L3 keyChecks must include `&` token"
    - "L3 forbidden must include `*` and `return ` (with space, not `return;`)"
  cross_card:
    - "All code snippets compile under g++ with -Wall"
    - "No card teaches pointer syntax (out-of-scope per [03_mastery_state_t2.md](03_mastery_state_t2.md))"
    - "All cards reference SIT102 idiom, not generic C++ idiom"

# === LINT RULES (build-time enforcement) ===
lint:
  forbid_tokens: ["nullptr", "->", "new ", "delete ", "*x", "* x"]
  require_at_least_one_of: ["&x", "&n", "&data", "&list", "&arr"]
  miller_max_words: 7    # per memorize fact

# === STATUS ===
status: "draft"   # draft | locked | revision-pending
locked_at: null
locked_by: null
revision_history: []
```

---

## Field Reference

| Field | Source | AI may edit? |
|-------|--------|--------------|
| `id` | Human (atom enumeration in [07](07_master_plan.md)) | No |
| `fact` | Human | No |
| `words` | Auto-linted | No |
| `level` | Human ([07](07_master_plan.md) Level table) | No |
| `deps` | Human (DAG) | No |
| `q_tags` | Human ([07](07_master_plan.md) Q-mapping) | No |
| `pfg_source` | Extracted from `extraction/` | No |
| `test2_evidence` | Extracted from test banks | No |
| `canonical_example` | Verified compileable | No |
| `expected_output` | Verified by g++ run | No |
| `sit102_quirks` | Human + extraction | No |
| `misconceptions` | Human + extraction | No |
| `render_hints.*` | Human or AI-suggested + human-locked | No (once locked) |
| `acceptance.*` | Human + per-atom domain knowledge | No |
| `lint.*` | Human | No |
| `status` | Workflow | Yes |

**Outlines = human-anchored.** AI consumes them; never edits.

---

## Card Generation Algorithm

```python
for outline in load_all_outlines():
  if outline.status != 'locked':
    continue   # skip drafts

  cards = []

  # Memorize: 5 variants
  cards += ai_generate(
    prompt = memorize_prompt(outline),
    n = 5,
    constraints = outline.acceptance.memorize + outline.lint
  )

  # MCQ: 2 variants
  cards += ai_generate(
    prompt = mcq_prompt(outline),
    n = 2,
    constraints = outline.acceptance.mcq
  )

  # Trace: 6 (only if level == 13)
  if outline.level == 13:
    cards += ai_generate(
      prompt = trace_prompt(outline),
      n = 6,
      constraints = outline.acceptance.trace
    )

  # Write L1/L2/L3: 3+3+2
  if outline.level >= 8:
    cards += ai_generate_write(outline, level=1, n=3)
    cards += ai_generate_write(outline, level=2, n=3)
    cards += ai_generate_write(outline, level=3, n=2)

  # Validation
  for card in cards:
    assert lint_pass(card, outline.lint)
    if has_cpp(card):
      assert compile_pass(card.code)
    assert dedup_check(card)

  emit(cards)
```

Build is reproducible if Opus prompt cache hit (same outline + same prompt → same response).

---

## Lock Workflow

```
draft → human review → user approves → status: locked
locked → if revision needed → status: revision-pending → re-review → locked
```

Locked outlines hash-stamped. Card generation only runs on locked outlines. Revisions require CHANGELOG entry per CONTRIBUTING.md.

---

## Outline Volume Estimate

177 atoms × ~200 words per outline (compressed YAML) = ~35,000 words of source-of-truth.

Equivalent to a small book. But every word load-bearing. No prose decoration.

If extraction reveals atom fragmentation (e.g., R-03 splits into R-03a, R-03b, R-03c), atom count grows to ~250. Outline count tracks 1:1.

---

## File Naming Convention

```
outlines/L<level>/<id>.yml

Examples:
  outlines/L-1/P-01.yml
  outlines/L00/S-04.yml
  outlines/L09/R-03.yml
  outlines/L13/HE-16.yml
  outlines/L17/ME-01.yml
```

Sortable by filename → matches sequence order within level. Cross-level order determined by [10_prereq_ordering_algorithm.md](10_prereq_ordering_algorithm.md).
