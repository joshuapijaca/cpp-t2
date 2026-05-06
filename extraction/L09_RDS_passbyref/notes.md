# Level 9 — Edge Cases & Discoveries

## SIT102-Specific Idioms vs Generic C++

**SIT102 idiom (PFG-confirmed)**:
```cpp
void update_user(user_data &user)        // mutable
void print_user(const user_data &user)   // read-only
```

**Generic C++ variants NOT in SIT102 / NOT tested**:
- Returning references: `int& get_ref()` — beyond scope
- Reference-to-reference / reference-to-array C++11+ syntax

**Exam grader expectation**: Mutating `&` parameter works as PFG examples show. No pointer syntax (`*`, `->`, `nullptr`) used or tested in T2.

---

## Conflicts: PFG ↔ Exam Grader

**PFG mentions pointers** (`02-02-pointers-ref.md`) but **T2 syntax is reference-only**:
- PFG line 13: "Pointers and references both store the address..."
- T2 reality: Uses `&` exclusively; `*ptr` dereferencing not tested

**Resolution**: Out-of-scope. Atoms R-01..R-08 cover references only. Pointer atoms not added.

**PFG hand-execution** (`03-hand-execution.mdx`) is **pointer hand-execution** (drawing arrows for pointer state). Out-of-scope. T2 hand-execution is reference-based (compiler auto-dereferences) — atoms HE-08, HE-15 in Level 13 cover this.

---

## Bridges to Other Levels

### R-04 → Level 10 (arrays)

PFG **does NOT** show array-reference parameter syntax. PFG examples use struct-by-ref, not array-by-ref.

| Atom | Status | Note |
|------|--------|------|
| R-04 (`void f(T &x)`) | PFG-grounded | struct/scalar |
| R-04-arr (`void f(T &arr[], int n)`) | **NOT in PFG** | Test 2 idiom only |

**Implication**: Add Test 2 evidence file for `&array[]` idiom in `extraction/test2_bank/Q3_read_X_variants.md`. PFG alone insufficient for R-04 array case. Atom G-14 in Level 10 (`&arr[]` alias caller's array) needs Test-2 source not PFG source.

### R-07 → underrepresented

PFG mentions `const` once (Q04 quote, line 211). Single example uses `const player_data &player` (EX-01) and `const user_data &user` (EX-04).

**Strengthen R-07 outline** by including both examples in `pfg_source` field plus the explicit prose quote. R-07 acceptance criteria should require either: "read-only" or "cannot modify" as part of correct answer.

---

## Out-of-Scope Content Found in PFG Files

### Pointer mechanics (exclude entirely)

1. **`02-02-pointers-ref.md` lines 7-17**:
   > "Pointers require the developer to work with the address directly... With a reference, the compiler takes care of this for you..."

   Status: OUT-OF-SCOPE. Compares pointer vs reference at implementation level. Not in T2 vocabulary.

2. **`03-hand-execution.mdx` lines 10-16**:
   > "Hand execution can be a great tool... Notice that the pointer variable exists... You can cross out the arrow when the value in the pointer changes..."

   Status: OUT-OF-SCOPE. Pointer hand-execution pedagogy. References auto-dereference; no manual arrows.

### Memory management (exclude entirely)

3. **`6-deep-dive-memory/0-overview.md` lines 1-28**:
   > "So far data has been limited by the constraints of the stack... This chapter introduces the tools needed to dynamically allocate additional memory..."

   Status: OUT-OF-SCOPE. Heap/dynamic allocation. R-01..R-08 are all stack-local.

---

## Proposed New Atom (Provisional)

### R-09 — const reference accepts non-const lvalue

Discovered in: PFG line 211 (panorama/1-reference-params.md) mentions `const` parameter but does NOT explicitly state "non-const variable can bind to const & param."

**Status**: Not yet required; T2 question banks don't appear to test this. Hold as provisional. If T2 variant introduces e.g., "explain why `print_user(myUser)` works when `myUser` is mutable but param is `const`," promote R-09 to Level 9.

**Rule**: Add to outline only if Test-2 evidence found.

---

## Card Generation Hints (consumed by 08_outline_spec.md)

### Misconception priorities for MCQ distractors

Highest-frequency wrong answers (rank by likely test impact):

1. "& means address-of (C-style)" → conflate with C pointer syntax
2. "& only works with primitive types" → student tries struct without &
3. "Need to dereference inside function" → student tries `*data` inside function body
4. "& makes parameter constant" → conflates & with const (Q04 mentions both)
5. "Reference can be reassigned" → C++ references bind once

### Memorize seed phrases (5 variants per atom rule)

For R-03 (`&` = alias / same box):
- "& makes alias to caller variable"
- "Reference is another name for box"
- "& parameter is same memory cell"
- "No copy made when & is used"
- "Caller and param share the box"

For R-05 (mutating &param changes caller):
- "Mutate &param, caller sees change"
- "Reference assignment writes to caller"
- "Updates flow back through reference"
- "& parameter mutation persists"
- "Caller variable changes via &param"

### Trace card hints (Level 13 atoms HE-08, HE-15, HE-17)

Variable-box rendering for R-04/R-05:
- ONE box drawn (not two)
- Two labels on the box (caller's name + param's name)
- Mutation through either label updates the single box
- Strikethrough old value when mutated

---

## Quality Audit Notes

- All quotes verbatim, line-cited
- All code examples compileable (assume `<iostream>` + `using namespace std;`)
- Atom coverage: R-01..R-08 strong except R-07 (single mention) — note above for compensation
- Out-of-scope content explicitly flagged and excluded
- Bridges to Levels 10, 13 noted with resolution path
- Provisional atom R-09 held; not added to outline list
