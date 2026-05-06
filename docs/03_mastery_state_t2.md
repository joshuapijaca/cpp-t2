# Mastery State (the "1") — T2 Defined

What a student must know to ace SIT102 Test 2. Extracted from PFG, Test 2 banks (5 published variants), and Deakin SIT102 unit guide. Atomic items only. Each ≤7 words.

---

## Test 2 Question Format (Confirmed)

| Q | Task | Time | Marks |
|---|------|------|-------|
| Q1 | Hand-trace `who_am_i(stat_double &data)` → predict `d.mystery` | ~20 min | 25% |
| Q2 | Write struct definition (3 fields: `id`, `description`, `location`) | ~15 min | 25% |
| Q3 | Write `void read_X(X &list[], int count)` | ~25 min | 25% |
| Q4 | Write `main()` with const MAX, array, cin count, call Q3, printf loop | ~30 min | 25% |

Total: 90 min, 4 questions, hand-execution + code-writing on paper.

### Variation Hypothesis (Test-to-Test)

| Stable | Variable |
|--------|----------|
| 4-question format | Entity name (computer → student → vehicle → patient) |
| Q1 algorithm = MAX-finder | Q1 array values (different MAX outcome) |
| Q1 struct = `stat_double` shape | Q1 `numbers[]` size and contents |
| Q2 = struct with 3 fields | Q2 field names (description, name, label, title) |
| Q3 = `void read_X(X &list[], int)` shape | Q3 entity, field count |
| Q4 = const MAX, array, loop, printf | Q4 printf format specifiers (%d vs %s + .c_str()) |
| Pass-by-reference required | Specific variable names |

**Implication**: Train on shape + concept, not on memorizing specific entities.

---

## Concept Atom Graph (Strict Prerequisite Order)

67 atoms. Axioms first. Each entry: `id | atom (≤7 words) | depends-on | Q1 Q2 Q3 Q4`.

Rank: **C** = critical (used directly), **S** = supporting (prereq), **N** = not used.

### Tier 0 — Axioms (zero prerequisite)

| ID | Atom | Deps | Q1 | Q2 | Q3 | Q4 |
|----|------|------|----|----|----|-----|
| A01 | int holds whole number | — | C | C | C | C |
| A02 | double holds decimal | — | C | N | N | N |
| A03 | string holds text | — | N | C | C | C |
| A04 | variable name = memory box | — | C | C | C | C |
| A05 | `=` stores value in box | — | C | N | C | C |
| A06 | `;` ends statement | — | C | C | C | C |
| A07 | `{}` groups statements | — | S | C | C | C |
| A08 | `//` marks comment | — | N | N | N | N |

### Tier 1 — Basic Syntax

| ID | Atom | Deps | Q1 | Q2 | Q3 | Q4 |
|----|------|------|----|----|----|-----|
| B01 | `cin >>` reads to box | A04,A05 | N | N | C | C |
| B02 | `cout <<` prints box | A04 | N | N | N | S |
| B03 | `printf(format, args)` outputs text | A04 | C | N | N | C |
| B04 | declare type before name | A01,A04 | C | C | C | C |
| B05 | initialize: `type x = value;` | B04,A05 | C | N | C | C |

### Tier 2 — Operators

| ID | Atom | Deps | Q1 | Q2 | Q3 | Q4 |
|----|------|------|----|----|----|-----|
| O01 | `<` less-than test | A01 | C | N | C | C |
| O02 | `>` greater-than test | A01 | C | N | N | N |
| O03 | `==` equality test | A01 | S | N | N | N |
| O04 | `++` increments by 1 | A01,A05 | C | N | C | C |
| O05 | `+`,`-`,`*`,`/` arithmetic | A01 | C | N | N | N |

### Tier 3 — Control Flow

| ID | Atom | Deps | Q1 | Q2 | Q3 | Q4 |
|----|------|------|----|----|----|-----|
| F01 | `if (cond) {body}` runs body if true | O01,A07 | C | N | N | N |
| F02 | `else {body}` runs otherwise | F01 | S | N | N | N |
| F03 | `for(init; cond; step)` loop header | A05,O01,O04 | C | N | C | C |
| F04 | for-loop body runs N times | F03 | C | N | C | C |
| F05 | loop index typically `int i` | F03,A01 | C | N | C | C |
| F06 | `i < n` bounds loop count | F03,O01 | C | N | C | C |

### Tier 4 — Aggregates

| ID | Atom | Deps | Q1 | Q2 | Q3 | Q4 |
|----|------|------|----|----|----|-----|
| G01 | `type arr[N]` declares array | B04,A01 | C | N | C | C |
| G02 | `arr[i]` accesses i-th element | G01 | C | N | C | C |
| G03 | arrays index from 0 | G01 | C | N | C | C |
| G04 | `arr[i] = v` assigns element | G02,A05 | C | N | C | C |
| G05 | `struct Name { fields };` defines type | A07,A06,B04 | S | C | C | C |
| G06 | `.field` accesses struct member | G05 | C | C | C | C |
| G07 | use struct: `Name x;` | G05 | S | N | C | C |
| G08 | array field inside struct | G01,G05 | C | N | N | N |

### Tier 5 — Functions

| ID | Atom | Deps | Q1 | Q2 | Q3 | Q4 |
|----|------|------|----|----|----|-----|
| H01 | `returnType name(params){body}` | B04,A07 | C | N | C | C |
| H02 | parameters become local boxes | H01,A04 | C | N | C | C |
| H03 | `return value;` sends value back | H01 | S | N | N | C |
| H04 | `void` = no return value | H01 | C | N | C | C |
| H05 | call `name(args)` runs body | H01 | C | N | S | C |

### Tier 6 — RDS (Pass-by-Reference) ★ FRONT-LOAD ★

| ID | Atom | Deps | Q1 | Q2 | Q3 | Q4 |
|----|------|------|----|----|----|-----|
| **R01** | **`&` means same memory box** | A04 | **C** | N | **C** | **C** |
| **R02** | **without `&` = copy** | H02 | **C** | N | **C** | **C** |
| **R03** | **`&` in param affects caller** | H02,R01 | **C** | N | **C** | **C** |
| R04 | `&array[]` = caller's array | G01,R03 | N | N | **C** | **C** |
| R05 | `const &` = read-only alias | R01 | S | N | S | S |
| R06 | local copy dies at return | H02,R02 | C | N | S | S |

### Tier 7 — Composite (Q1 Hand-Trace)

| ID | Atom | Deps | Q1 | Q2 | Q3 | Q4 |
|----|------|------|----|----|----|-----|
| T01 | trace `x = 5; y = x;` final values | A05 | C | N | N | N |
| T02 | trace `arr[i] = v` final array | G04 | C | N | N | N |
| T03 | trace for-loop iterations | F04,O04 | C | N | N | N |
| T04 | trace if/else branches | F01,F02 | C | N | N | N |
| T05 | trace function call + return | H05,H02 | C | N | N | N |
| T06 | trace pass-by-value vs `&` | R02,R03 | C | N | N | N |
| T07 | trace max-finder algorithm | F04,O02,A05 | C | N | N | N |
| T08 | trace struct field mutation via `&` | G06,R03 | C | N | N | N |
| T09 | trace `d.numbers[i] > d.mystery` | G06,G02,O02 | C | N | N | N |

### Tier 8 — Composite (Q2 Struct Write)

| ID | Atom | Deps | Q1 | Q2 | Q3 | Q4 |
|----|------|------|----|----|----|-----|
| W01 | write `struct Name { ... };` skeleton | G05 | N | C | N | N |
| W02 | write field: `type fieldName;` | B04,A06 | N | C | N | N |
| W03 | terminate struct with `};` | G05,A06 | N | C | N | N |
| W04 | choose types: int / double / string | A01,A02,A03 | N | C | N | N |
| W05 | field order doesn't change shape | G05 | N | C | N | N |

### Tier 9 — Composite (Q3 Read Function)

| ID | Atom | Deps | Q1 | Q2 | Q3 | Q4 |
|----|------|------|----|----|----|-----|
| K01 | write `void read_X(...)` signature | H04,H01 | N | N | C | N |
| K02 | write `X &list[]` parameter | R04,G07 | N | N | C | N |
| K03 | write `int count` parameter | A01,B04 | N | N | C | C |
| K04 | write `for (int i = 0; i < count; i++)` | F03,F05,F06 | N | N | C | C |
| K05 | write `cin >> list[i].field;` | B01,G02,G06 | N | N | C | N |
| K06 | one cin per struct field | B01,G06 | N | N | C | N |
| K07 | use `cout` to prompt before each cin | B02 | N | N | S | N |

### Tier 10 — Composite (Q4 Main Function)

| ID | Atom | Deps | Q1 | Q2 | Q3 | Q4 |
|----|------|------|----|----|----|-----|
| M01 | `const int MAX = 100;` | A01,B05 | N | N | N | C |
| M02 | declare `X list[MAX];` | G01 | N | N | N | C |
| M03 | declare `int count;` | A01,B04 | N | N | N | C |
| M04 | `cin >> count;` | B01 | N | N | N | C |
| M05 | call `read_X(list, count);` | H05 | N | N | N | C |
| M06 | print loop: `for(int i...) printf(...)` | F03,B03 | N | N | N | C |
| M07 | printf format `%d` for int | B03,A01 | N | N | N | C |
| M08 | printf format `%s` for C-string | B03 | N | N | N | C |
| M09 | `string.c_str()` for `%s` printf | A03,M08 | N | N | N | C |
| M10 | printf `\n` for newline | B03 | N | N | N | C |
| M11 | `int main() { ... return 0; }` | H01,H03 | N | N | N | C |

---

## Critical Concept Count by Question

| Q | Critical atoms | Top 3 most-used |
|---|---------------|-----------------|
| Q1 | 32 | T07 (max-finder), T06 (& vs copy), R03 (& affects caller) |
| Q2 | 12 | W01 (struct skel), W02 (field decl), W03 (terminator) |
| Q3 | 21 | K02 (`X &list[]`), K05 (cin into element), K04 (for-loop) |
| Q4 | 22 | M05 (call read_X), M06 (printf loop), M11 (main shape) |

**Multi-Q critical** (training payoff highest): R01, R02, R03, F03, F04, G02, G06, B04.

---

## RDS Confirmed: R01-R03 (Pass-by-Reference)

Single concept blocking 3 of 4 questions. Failure cascade:
- Lose `&` in Q1 → wrong `d.mystery`, fail Q1.
- Lose `&` in Q3 signature → reads vanish, caller's array empty, fail Q3.
- Q3 broken → Q4 prints empty rows, fail Q4.

Most common bug archetype across all 5 test variants: "forgot-ampersand."

**Front-load aggressively.** Tier 6 trained immediately after Tier 5 (functions). Hammer until automatic.

---

## Common Misconceptions (Train as Distractors)

1. Confuse `&` (alias) with `*` (pointer dereference). Reality: references use dot syntax; pointers use `->` or `*`.
2. Think `&array[]` is invalid syntax. Reality: it's the SIT102 idiom, valid C++.
3. Try to `return` modified array/struct from Q3. Reality: void + & is the idiom.
4. Use `typedef struct` (C-style). Reality: C++ allows `struct Name { ... };` alone.
5. Think const + & is required. Reality: only `&` needed for mutation; const blocks it.
6. Off-by-one on `i < count` vs `i <= count`. Reality: `<` is correct for 0-indexed.
7. Use `cout` instead of `printf` in Q4. Reality: PFG/SIT102 uses `printf` for formatted output.
8. Forget `.c_str()` when printf'ing strings. Reality: `%s` requires `const char*`, not C++ `string`.
9. Put `;` after `}` of function body. Reality: only struct definitions take `};`.
10. Index from 1 instead of 0. Reality: arrays start at 0.

---

## Out-of-Scope (Do NOT Train)

PFG covers these; T2 does NOT test:
- Pointer syntax (`*`, `->`, `nullptr`)
- Dynamic allocation (`new`, `delete`, smart pointers)
- Classes, methods, inheritance
- File I/O (`ifstream`, `ofstream`)
- STL containers (`vector`, `map`)
- Templates
- Exception handling
- Recursion
- Multi-dim arrays
- `switch` statements
- `do-while` (T1 territory; T2 uses for-loop)
- Function overloading
- Lambda expressions

Cutting these saves ~70% of PFG content. Ultra-direct.
