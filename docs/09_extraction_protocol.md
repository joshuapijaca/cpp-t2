# 09 — Source Extraction Protocol

How to convert PFG (Programmer's Field Guide) + Test 2 banks → ordered raw source per level. This precedes outline writing in [08](08_outline_spec.md).

---

## Folder Structure

```
cpp-t2/extraction/
├── L-1_pre_programming/
│   ├── pfg_quotes.md         ← verbatim PFG passages, cited
│   ├── code_examples.cpp     ← canonical examples
│   └── notes.md              ← edge cases / discoveries
├── L00_source_skeleton/
├── L01_output/
├── L02_variables_types/
├── L03_input/
├── L04_operators/
├── L05_comparison_logical/
├── L06_conditionals/
├── L07_loops/
├── L08_functions_basic/
├── L09_RDS_passbyref/        ★ heaviest extraction
├── L10_arrays/
├── L11_structs/
├── L12_pass_composites/
├── L13_hand_execution/
├── L14_struct_write/
├── L15_read_function/
├── L16_main_write/
├── L17_mock_exam/
├── test2_bank/
│   ├── Q1_who_am_i_variants.md
│   ├── Q2_struct_variants.md
│   ├── Q3_read_X_variants.md
│   └── Q4_main_variants.md
└── misconceptions/
    ├── pass_by_ref_errors.md
    ├── struct_syntax_errors.md
    └── printf_format_errors.md
```

---

## PFG Source Locations

| PFG Part | Path (in archived IT-ELO codebase, audit-only reference) | Levels covered |
|----------|------|----------------|
| Part 0 — Getting Started | `_legacy_apps/it-elo/src/data/pfg-content/part-0-getting-started/` | L-1, L00 |
| Part 1 — Instructions | `_legacy_apps/it-elo/src/data/pfg-content/part-1-instructions/` | L01–L07 |
| Part 1.1 sequence-and-data | `.../1-sequence-and-data/` | L01, L02 |
| Part 1.2 communicating-syntax | `.../2-communicating-syntax/` | L02, L03 |
| Part 1.3 control-flow | `.../3-control-flow/` | L05–L07 |
| Part 2 — Organised Code | `_legacy_apps/it-elo/src/data/pfg-content/part-2-organised-code/` | L08–L12 |
| Part 2.1 starting-cpp | `.../1-starting-cpp/` | L08 |
| Part 2.2 organising-code | `.../2-organising-code/` | L08, L09 ★ |
| Part 2.3 structuring-data | `.../3-structuring-data/` | L11 |
| Part 2.4 indirect-access | `.../4-indirect-access/` | L09 ★ (deep) |
| Part 2.5 working-with-multiples | `.../5-working-with-multiples/` | L10, L12 |
| Part 2.6 deep-dive-memory | `.../6-deep-dive-memory/` | L09 ★ (mental model) |

**★ = critical for RDS (Level 9).** Triple-extract from these.

---

## Test 2 Source Locations

| File | Content | Use for |
|------|---------|---------|
| `_legacy_apps/it-elo/src/data/practice-test2-bank.ts` | Full Q1-Q4 across 5 entity variants | Confirm question shape stability |
| `_legacy_apps/it-elo/src/data/test2-drill-bank.ts` | Decomposed sub-skills per Q | Confirm atom Q-mapping |
| `_legacy_apps/it-elo/src/data/learn-topics-t2-2026.ts` | Topic structure for T2 | Confirm topic→atom mapping |
| `_legacy_apps/it-elo/src/data/test2-kc-drills/` | Knowledge-component drills | Misconception extraction |
| `223422713_PIJACA_S326-2026-CM.pdf` (Desktop) | Deakin SIT102 unit guide | Test 2 format authority |

**Audit-only.** Extract patterns + idioms; do not import content.

---

## Per-Level Extraction Files

### `pfg_quotes.md` Format

```markdown
# Level 9 — Pass-by-Reference (RDS)

PFG Part 2, Section 2.2 organising-code → 6-passing-parameters

## Q01 — Definition of Reference Parameter

**Source**: `pfg-content/part-2-organised-code/2-organising-code/06-passing-parameters/02-by-reference.mdx`
**Lines**: 12-28

> When you declare a parameter using the reference symbol `&` before its
> name, the function does not receive a copy of the argument. Instead,
> it receives an alias — another name for the same memory location.
> Any change made to the parameter is reflected in the caller's variable.

**Use for atoms**: R-01 (default copy), R-03 (& = alias), R-05 (mutation persists)

---

## Q02 — Reference Must Bind to Variable

**Source**: same file, lines 45-52

> A reference parameter must be bound to a real variable when the
> function is called. You cannot pass a literal (e.g., `f(5)` is
> illegal if the parameter is `int &x`).

**Use for atoms**: R-06 (reference must bind real variable)

---

(continue for all relevant PFG quotes covering this level)
```

### `code_examples.cpp` Format

```cpp
// Level 9 — Pass-by-Reference (RDS)
// Verbatim canonical examples from PFG; compileable

// EX-01: Basic increment by reference
// Source: pfg-content/.../06-passing-parameters/02-by-reference.mdx
void increment(int &x) {
    x = x + 1;
}
int main() {
    int n = 5;
    increment(n);
    cout << n << endl;   // 6
    return 0;
}

// EX-02: Pass-by-value contrast
// Source: same lesson
void increment_copy(int x) {
    x = x + 1;             // mutates only local copy
}
int main() {
    int n = 5;
    increment_copy(n);
    cout << n << endl;   // 5 (unchanged)
    return 0;
}

// EX-03: Struct by reference
// Source: pfg-content/.../03-structuring-data/04-passing-structs.mdx
struct Point { int x; int y; };
void shift(Point &p, int dx, int dy) {
    p.x = p.x + dx;
    p.y = p.y + dy;
}

(continue for all relevant code examples)
```

### `notes.md` Format

```markdown
# Level 9 Notes — Edge Cases & Discoveries

## SIT102-Specific Idioms

- `&array[]` for array reference — confirmed in Test 2 Q3 across all 5 variants.
  PFG Part 2.5 working-with-multiples uses this exact form. Never `*array`.
- `void` return for read functions — confirmed Q3.

## Common Student Errors (Source: T2 chunk error notes)

- "I forgot the &" → 27 instances flagged in `test2-kc-drills/`
- "I returned the array" → 8 instances
- "I used * to dereference" → 5 instances (C-thinking)

## Conflicts / Ambiguities

- PFG Part 2.6 deep-dive-memory mentions pointers in passing.
  → Decision: out of scope for T2. Do NOT extract.
  → Atom set excludes pointer syntax entirely.

## Cross-Level Bridges

- Level 9 R-04 (`&array[]`) requires Level 10 G-13 (array param syntax).
  → Order: teach G-13 stub before R-04, or fold into Level 9 with forward note.
  → Resolution: keep G-13 in Level 10; R-04 references it as forward dep.
```

---

## Extraction Rules

1. **Verbatim quotes only.** No paraphrasing.
2. **Cite line ranges.** PFG file path + line number.
3. **Code examples must compile.** Run g++ before logging.
4. **Tag every quote with target atom IDs.** Quote without an atom = unused → discard or open new atom.
5. **Note conflicts.** If PFG and Test 2 disagree on idiom, Test 2 wins (it's the grader).
6. **Mark out-of-scope.** Pointer syntax, dynamic alloc, classes — exclude with explicit note.

---

## Per-Question Test 2 Bank Files

### `test2_bank/Q1_who_am_i_variants.md`

```markdown
# Q1 — Hand-Trace `who_am_i` Variants

## Variant 1 — computer_data
**Source**: `practice-test2-bank.ts:42`
**Code**:
```cpp
struct stat_double {
    double numbers[5];
    double mystery;
};
void who_am_i(stat_double &data) {
    data.mystery = data.numbers[0];
    for (int i = 1; i < 5; i++) {
        if (data.numbers[i] > data.mystery) {
            data.mystery = data.numbers[i];
        }
    }
}
```
**Inputs**: numbers = {3.2, 7.1, 5.0, 9.4, 2.8}
**Expected output**: data.mystery = 9.4

(repeat for variants 2-5)

## Concept Coverage

| Atom | Used in Q1? |
|------|-------------|
| R-01 (default copy) | C |
| R-03 (& = alias) | C |
| R-05 (& mutation persists) | C |
| HE-16 (max-finder trace) | C |
| HE-17 (struct field via &) | C |
| ... | ... |

(repeat per question)
```

---

## Misconception Files

### `misconceptions/pass_by_ref_errors.md`

```markdown
# Pass-by-Reference Error Catalog

## Error 01 — Forgot the &

**Frequency**: 27 instances in test2-kc-drills error tags
**Student writes**:
```cpp
void read_data(computer_data list[], int n) {  // missing &
    for (int i = 0; i < n; i++) cin >> list[i].id;
}
```
**Symptom**: List appears empty in caller after function returns.
**Why wrong**: Without &, function operates on a copy of the array reference (technically pointer-copy in C++; but for SIT102 mental model: copy semantics).
**Atom this teaches**: R-03 (& = alias), R-05 (mutation persists with &)
**Becomes MCQ distractor for**: R-03, R-05 cards

## Error 02 — Used * Instead of &

**Frequency**: 5 instances
**Student writes**: `void f(int *x)` thinking C-style pointer.
**Why wrong**: Outside SIT102 idiom. Correct is `int &x`.
**Atom this teaches**: R-03 (& not *)
**Becomes MCQ distractor for**: R-03 card

(continue for all error patterns)
```

---

## Extraction Phasing

Do not extract all 18 levels in one pass. Use proof-of-concept first:

```
Sprint 1: Extract Level 9 (RDS) — most critical, validates approach
Sprint 2: Extract Levels 13–16 (Q1-Q4 skills) — proves Q-tag accuracy
Sprint 3: Extract Levels 7–8, 10–12 (foundational composites)
Sprint 4: Extract Levels -1 to 6 (axioms, lowest risk)
Sprint 5: Extract Level 17 (mock exams) — full Q1-Q4 + variations
Sprint 6: Extract test2_bank/ + misconceptions/
```

Each sprint produces locked extraction files. Outlines [08](08_outline_spec.md) follow extraction completion per level.

---

## Acceptance Criteria for Extraction

| Test | Pass condition |
|------|--------------|
| All atoms have ≥1 PFG source quote | Manual audit per level |
| All canonical examples compile | g++ check at extraction-lock time |
| Out-of-scope content explicitly excluded | `notes.md` per level lists exclusions |
| Test 2 idioms confirmed | `test2_bank/` cross-references PFG idioms |
| Misconception list ≥3 per RDS-adjacent atom | Audit `misconceptions/` against atom list |
| No content imported from IT-ELO | Read-only references; new files only |

---

## Tools

| Need | Tool |
|------|------|
| Read PFG `.mdx` files | `Read` tool |
| Compile-check C++ snippets | g++ if installed; manual otherwise |
| Cross-reference atom IDs | `Grep` for atom ID across `extraction/` |
| List PFG files per part | `Glob` |

No AI-tool runtime calls during extraction. Extraction is human-led with AI as research assistant.
