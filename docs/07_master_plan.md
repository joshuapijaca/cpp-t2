# T2 App — Master Plan (Absolute 0 → 1)

Canonical reference. Subsumes [01](01_audit_it_elo.md)–[06](06_audit_it_elo_t1_apk.md). The "1" = pass all 4 T2 2026 questions cold. The "0" = never coded in C++.

PFG used as bridge for early concepts; content not copied. T1 hand-trace UX cloned (schema in [06](06_audit_it_elo_t1_apk.md)). Memorize-card UX cloned from sprintlearn (schema in [05](05_audit_three_apps.md)).

---

## Operating Principle

**The Invisible Chain.** Every advanced atom (e.g. `&list[]` syntax in Q3) decomposes into ~30 prerequisite atoms reaching back to "a computer runs programs." Skipping any link → student memorizes calculus before algebra → fails under question variation.

**Anti-pattern (banned)**: starting at Level 9 ("pass-by-reference") because it's the RDS. RDS only matters once Levels -1 through 8 are automatic. RDS without prereqs = ritual.

**Pacing rule**: forward-only, micro-steps, ultra-high volume per atom. Wrong → inline correction + retry once → continue. No mastery gates. No save state. 56-hour budget.

---

## Stratification (18 Levels)

```
LEVEL  TIER                                ATOMS  Q-TARGET
-1     Pre-programming mental model           7   foundation
 0     Source file skeleton                  10   foundation
 1     Output (cout, printf)                 13   foundation
 2     Variables + types                     20   foundation
 3     Input (cin)                            7   foundation
 4     Operators (arithmetic, increment)     11   foundation
 5     Comparison + logical                  10   foundation
 6     Conditionals (if/else)                 5   foundation
 7     Loops (while, for)                    10   foundation
 8     Functions (basic)                     10   foundation
 9     Pass-by-value vs & ★ RDS ★             8   Q1, Q3, Q4
10     Arrays                                14   Q1, Q3, Q4
11     Structs                               12   Q1, Q2, Q3, Q4
12     Pass-composites (struct&, &array[])    6   Q3, Q4
13     Hand-execution skill                  18   Q1
14     Struct-write skill                     5   Q2
15     Read-function write skill              7   Q3
16     Main-write skill                       9   Q4
17     Mock exam (full Q1-Q4, timed)          5   integration
TOTAL                                       177   atoms
```

Each level only opens (informally) once previous level's memorize-cards green-pass once. No formal gate. Forward sequence by content order.

---

## Full Atom Graph (177 atoms, prereq DAG)

Format: `ID | atom (≤7 words) | depends-on | Q1 Q2 Q3 Q4`. Tags: **C** = critical, **S** = supporting, **N** = not used.

### Level −1 — Pre-Programming Mental Model

| ID | Atom | Deps | Q1 Q2 Q3 Q4 |
|----|------|------|---|---|---|---|
| P-1 | computer runs programs | — | S S S S |
| P-2 | program = text instructions | P-1 | S S S S |
| P-3 | source code = .cpp file | P-2 | S S S S |
| P-4 | compiler converts source to exe | P-3 | S S S S |
| P-5 | running exe executes instructions | P-4 | S S S S |
| P-6 | output appears in terminal | P-5 | S S S S |
| P-7 | input typed in terminal | P-5 | S S S S |

### Level 0 — Source File Skeleton

| ID | Atom | Deps | Q1 Q2 Q3 Q4 |
|----|------|------|---|---|---|---|
| S-1 | `#include <iostream>` adds I/O | P-3 | S N S C |
| S-2 | `using namespace std;` saves typing | S-1 | S N S C |
| S-3 | `int main() { }` is entry | S-1 | N N N C |
| S-4 | statement ends with `;` | — | C C C C |
| S-5 | `{` opens code block | — | C C C C |
| S-6 | `}` closes code block | S-5 | C C C C |
| S-7 | `return 0;` ends main | S-3 | N N N C |
| S-8 | `// comment` ignored | — | N N N N |
| S-9 | whitespace doesn't matter | — | N N N N |
| S-10 | indentation is style only | — | N N N N |

### Level 1 — Output

| ID | Atom | Deps | Q1 Q2 Q3 Q4 |
|----|------|------|---|---|---|---|
| O-1 | `cout` prints to terminal | S-1, S-2 | N N S S |
| O-2 | `<<` sends value to cout | O-1 | N N S S |
| O-3 | `cout << "text";` prints text | O-2 | N N S S |
| O-4 | `cout << 5;` prints number | O-2 | N N S S |
| O-5 | `endl` prints newline | O-1 | N N S S |
| O-6 | `\n` prints newline | O-3 | N N S C |
| O-7 | chain `cout << a << b;` | O-2 | N N S S |
| O-8 | `printf(format, args)` outputs text | S-1 | C N N C |
| O-9 | `%d` formats int | O-8 | N N N C |
| O-10 | `%s` formats C-string | O-8 | N N N C |
| O-11 | `\n` works in printf | O-8 | N N N C |
| O-12 | `printf` first arg = format string | O-8 | N N N C |
| O-13 | `printf` extra args = values | O-8 | N N N C |

### Level 2 — Variables + Types

| ID | Atom | Deps | Q1 Q2 Q3 Q4 |
|----|------|------|---|---|---|---|
| V-1 | variable = named memory box | — | C C C C |
| V-2 | variable has a name | V-1 | C C C C |
| V-3 | variable has a type | V-1 | C C C C |
| V-4 | declare: `type name;` | V-2, V-3 | C C C C |
| V-5 | initialize: `type name = value;` | V-4 | C N C C |
| V-6 | read: `cout << name;` shows value | V-4, O-1 | N N S S |
| V-7 | write: `name = newValue;` | V-4 | C N C C |
| V-8 | `=` is assignment, not equality | V-7 | C N C C |
| V-9 | declaration before use | V-4 | C C C C |
| V-10 | `int` holds whole number | V-3 | C C C C |
| V-11 | `double` holds decimal | V-3 | C N N N |
| V-12 | `string` holds text | V-3 | N C C C |
| V-13 | `bool` holds true/false | V-3 | S N S S |
| V-14 | `char` holds one letter | V-3 | N N N N |
| V-15 | `5` is int literal | V-10 | C N C C |
| V-16 | `3.14` is double literal | V-11 | C N N N |
| V-17 | `"hi"` is string literal | V-12 | N C C C |
| V-18 | `'a'` is char literal | V-14 | N N N N |
| V-19 | `true` / `false` are bool literals | V-13 | S N N N |
| V-20 | `string` needs `<string>` include | V-12, S-1 | N C C C |

### Level 3 — Input

| ID | Atom | Deps | Q1 Q2 Q3 Q4 |
|----|------|------|---|---|---|---|
| I-1 | `cin` reads from terminal | O-1 | N N C C |
| I-2 | `>>` reads value into variable | I-1, V-7 | N N C C |
| I-3 | `cin >> x;` waits for input | I-2 | N N C C |
| I-4 | whitespace delimits inputs | I-3 | N N S S |
| I-5 | type-aware reading | I-3, V-3 | N N C C |
| I-6 | chain `cin >> a >> b;` | I-2 | N N S S |
| I-7 | `getline(cin, s)` reads full line | I-1, V-12 | N N N N |

### Level 4 — Operators

| ID | Atom | Deps | Q1 Q2 Q3 Q4 |
|----|------|------|---|---|---|---|
| A-1 | `+` adds | V-10 | C N N N |
| A-2 | `-` subtracts | V-10 | S N N N |
| A-3 | `*` multiplies | V-10 | S N N N |
| A-4 | `/` divides | V-10 | S N N N |
| A-5 | `%` modulo (remainder) | V-10 | N N N N |
| A-6 | `int / int` truncates | A-4 | S N N N |
| A-7 | order: `* / %` before `+ -` | A-1…A-5 | S N N N |
| A-8 | `()` overrides order | A-7 | S N N N |
| A-9 | `+=` `-=` `*=` `/=` shortcuts | A-1, V-7 | S N N N |
| A-10 | `++` adds 1 | A-1, V-7 | C N C C |
| A-11 | `--` subtracts 1 | A-2, V-7 | S N N N |

### Level 5 — Comparison + Logical

| ID | Atom | Deps | Q1 Q2 Q3 Q4 |
|----|------|------|---|---|---|---|
| C-1 | `==` tests equality | V-13 | S N N N |
| C-2 | `!=` tests not equal | V-13 | S N N N |
| C-3 | `<` less than | V-13 | C N C C |
| C-4 | `>` greater than | V-13 | C N N N |
| C-5 | `<=` less or equal | V-13 | S N S S |
| C-6 | `>=` greater or equal | V-13 | S N N N |
| C-7 | comparison returns bool | V-13 | C N C C |
| L-1 | `&&` AND | V-13 | S N N N |
| L-2 | `\|\|` OR | V-13 | S N N N |
| L-3 | `!` NOT | V-13 | S N N N |

### Level 6 — Conditionals

| ID | Atom | Deps | Q1 Q2 Q3 Q4 |
|----|------|------|---|---|---|---|
| F-1 | `if (cond) { body }` runs if true | C-7, S-5 | C N N N |
| F-2 | `else { body }` runs otherwise | F-1 | S N N N |
| F-3 | `else if (cond) { body }` chained | F-1 | S N N N |
| F-4 | condition must be bool | F-1 | C N N N |
| F-5 | use `{}` even for one line | F-1 | S N N N |

### Level 7 — Loops

| ID | Atom | Deps | Q1 Q2 Q3 Q4 |
|----|------|------|---|---|---|---|
| W-1 | `while (cond) { body }` repeats | F-4, S-5 | S N N N |
| W-2 | `do { body } while (c);` runs once first | W-1 | N N N N |
| W-3 | `for (init; cond; step) { body }` | W-1, V-5, A-10 | C N C C |
| W-4 | for-init runs once | W-3 | C N C C |
| W-5 | for-cond checked before each iter | W-3 | C N C C |
| W-6 | for-step runs after each iter | W-3 | C N C C |
| W-7 | `break;` exits loop | W-1 | N N N N |
| W-8 | `continue;` skips to next iter | W-1 | N N N N |
| W-9 | nested loops allowed | W-3 | S N N N |
| W-10 | infinite loop if cond never false | W-1, F-4 | N N N N |

### Level 8 — Functions (basic)

| ID | Atom | Deps | Q1 Q2 Q3 Q4 |
|----|------|------|---|---|---|---|
| H-1 | function = named code block | — | C N C C |
| H-2 | `returnType name(params) { body }` | H-1, V-4 | C N C C |
| H-3 | call: `name(args);` | H-2 | C N S C |
| H-4 | parameters become local boxes | H-2, V-1 | C N C C |
| H-5 | `return value;` sends back | H-2 | S N N C |
| H-6 | `void` = no return value | H-2 | C N C N |
| H-7 | declare before use (or prototype) | H-2 | S N S S |
| H-8 | prototype: `returnType name(types);` | H-7 | N N N N |
| H-9 | locals die at return | H-4 | C N S S |
| H-10 | caller cannot see locals | H-4 | C N S S |

### Level 9 — Pass-by-Value vs Reference ★ RDS ★

| ID | Atom | Deps | Q1 Q2 Q3 Q4 |
|----|------|------|---|---|---|---|
| **R-1** | **parameter receives copy by default** | H-4 | **C** N **C** **C** |
| **R-2** | **mutating param doesn't change caller** | R-1 | **C** N **C** **C** |
| **R-3** | **`&` means alias / same box** | V-1, R-1 | **C** N **C** **C** |
| **R-4** | **`void f(int &x)` shares box with caller** | R-3, H-2 | **C** N **C** **C** |
| **R-5** | **mutating `&param` changes caller** | R-4, R-2 | **C** N **C** **C** |
| R-6 | reference must bind real variable | R-3 | S N S S |
| R-7 | `const &` = read-only alias | R-3 | S N S S |
| R-8 | reference = same memory, two names | R-3 | C N C C |

### Level 10 — Arrays

| ID | Atom | Deps | Q1 Q2 Q3 Q4 |
|----|------|------|---|---|---|---|
| G-1 | array = sequence of N values | — | C N C C |
| G-2 | `type arr[N];` declares | V-3, V-4, G-1 | C N C C |
| G-3 | `type arr[N] = {…};` initialized | G-2, V-5 | S N N N |
| G-4 | `arr[0]` is first element | G-1 | C N C C |
| G-5 | `arr[i]` is i-th element | G-4 | C N C C |
| G-6 | arrays index from 0 | G-4 | C N C C |
| G-7 | last element is `arr[N-1]` | G-4 | C N C C |
| G-8 | `arr[N]` is out of bounds (UB) | G-4 | S N S S |
| G-9 | array size fixed at compile | G-2 | S N N C |
| G-10 | cannot return array from function | H-5, G-1 | S N C C |
| G-11 | for loop iterates array via `i < N` | W-3, G-5 | C N C C |
| G-12 | `arr[i] = value;` writes element | G-5, V-7 | C N C C |
| G-13 | array param: `type arr[]` | G-1, H-2 | N N C C |
| G-14 | `&arr[]` alias caller's array | G-13, R-3 | N N C C |

### Level 11 — Structs

| ID | Atom | Deps | Q1 Q2 Q3 Q4 |
|----|------|------|---|---|---|---|
| T-1 | struct = named field group | — | S C C C |
| T-2 | `struct Name { fields };` defines type | T-1, S-4 | S C C C |
| T-3 | each field: `type fieldName;` | T-2, V-4 | S C C C |
| T-4 | `;` required after closing `}` | T-2, S-4 | S C C C |
| T-5 | use type: `Name x;` declares | T-2, V-4 | S N C C |
| T-6 | `x.field` accesses field | T-5 | C C C C |
| T-7 | `x.field = v;` writes field | T-6, V-7 | C N C C |
| T-8 | `cout << x.field;` reads field | T-6, O-1 | N N S S |
| T-9 | struct can contain array field | T-2, G-2 | C N N N |
| T-10 | chained: `data.arr[i]` | T-6, G-5 | C N C C |
| T-11 | array of structs: `Name list[N];` | T-5, G-2 | N N C C |
| T-12 | `list[i].field` chained access | T-6, G-5 | N N C C |

### Level 12 — Pass Composites

| ID | Atom | Deps | Q1 Q2 Q3 Q4 |
|----|------|------|---|---|---|---|
| PC-1 | pass struct by value copies whole | H-4, T-5 | S N S S |
| PC-2 | pass struct by ref: `void f(Name &x)` | R-4, T-5 | C N C C |
| PC-3 | `&` lets struct mutation persist | R-5, T-7 | C N C C |
| PC-4 | pass array by ref: `void f(T &arr[], int n)` | R-4, G-13 | N N C C |
| PC-5 | mutations to `list[i].field` persist | PC-4, T-12 | N N C C |
| PC-6 | `const Name &x` read-only struct | R-7, T-5 | S N S S |

### Level 13 — Hand-Execution Skill (Q1 atoms)

| ID | Atom | Deps | Q1 Q2 Q3 Q4 |
|----|------|------|---|---|---|---|
| HE-1 | trace = mentally simulate | P-5 | C N N N |
| HE-2 | track each var's value | V-1, HE-1 | C N N N |
| HE-3 | update value on each assignment | V-7, HE-2 | C N N N |
| HE-4 | for-loop: track i across iterations | W-3, HE-2 | C N N N |
| HE-5 | conditional: pick branch by cond | F-1, HE-2 | C N N N |
| HE-6 | function call: enter new frame | H-3, HE-2 | C N N N |
| HE-7 | return: exit frame, locals die | H-9, HE-6 | C N N N |
| HE-8 | `&` param = SAME box, persists | R-5, HE-3 | C N N N |
| HE-9 | `arr[i]` write persists if `&` | PC-5, HE-3 | C N N N |
| HE-10 | trace `x = 5; y = x;` final | V-7, HE-3 | C N N N |
| HE-11 | trace `arr[i] = v;` final array | G-12, HE-3 | C N N N |
| HE-12 | trace for-loop iterations | W-3, HE-4 | C N N N |
| HE-13 | trace if/else branches | F-1, F-2, HE-5 | C N N N |
| HE-14 | trace function call + return | H-3, HE-6, HE-7 | C N N N |
| HE-15 | trace pass-by-value vs `&` | R-2, R-5, HE-8 | C N N N |
| HE-16 | trace max-finder algorithm | HE-12, C-4, V-7 | C N N N |
| HE-17 | trace struct field mutation via `&` | PC-3, T-7, HE-8 | C N N N |
| HE-18 | trace `data.numbers[i] > data.mystery` | T-10, C-4 | C N N N |

### Level 14 — Struct-Write Skill (Q2)

| ID | Atom | Deps | Q1 Q2 Q3 Q4 |
|----|------|------|---|---|---|---|
| SW-1 | write `struct Name { ... };` skeleton | T-2 | N C N N |
| SW-2 | write field: `type fieldName;` | T-3, V-4 | N C N N |
| SW-3 | terminate struct with `};` | T-4 | N C N N |
| SW-4 | choose types per spec | V-10, V-11, V-12 | N C N N |
| SW-5 | field order arbitrary | T-2 | N C N N |

### Level 15 — Read-Function Write Skill (Q3)

| ID | Atom | Deps | Q1 Q2 Q3 Q4 |
|----|------|------|---|---|---|---|
| RW-1 | write `void` signature | H-6 | N N C N |
| RW-2 | write `Type &list[]` parameter | PC-4, G-14 | N N C N |
| RW-3 | write `int count` parameter | V-4, V-10 | N N C C |
| RW-4 | write outer `for (int i = 0; i < count; i++)` | W-3, G-11 | N N C C |
| RW-5 | write `cin >> list[i].field;` | I-3, T-12 | N N C N |
| RW-6 | one cin per struct field | I-3, T-3 | N N C N |
| RW-7 | optional `cout` prompt before each cin | O-3 | N N S N |

### Level 16 — Main-Write Skill (Q4)

| ID | Atom | Deps | Q1 Q2 Q3 Q4 |
|----|------|------|---|---|---|---|
| MW-1 | write `int main() { ... return 0; }` | H-2, S-7 | N N N C |
| MW-2 | write `const int MAX = 100;` | V-5, V-10 | N N N C |
| MW-3 | declare `Type list[MAX];` | G-2, T-11 | N N N C |
| MW-4 | declare `int count;` | V-4 | N N N C |
| MW-5 | write `cin >> count;` | I-3 | N N N C |
| MW-6 | call `read_X(list, count);` | H-3 | N N N C |
| MW-7 | write print loop: `for (int i = 0; i < count; i++)` | W-3 | N N N C |
| MW-8 | write `printf("%d %s\n", list[i].id, list[i].desc.c_str());` | O-8…O-11 | N N N C |
| MW-9 | `string.c_str()` for `printf %s` | V-12, O-10 | N N N C |

### Level 17 — Mock Exam (integration)

| ID | Atom | Deps | Q1 Q2 Q3 Q4 |
|----|------|------|---|---|---|---|
| ME-1 | full Q1 hand-trace (15 variants) | HE-1…HE-18 | C N N N |
| ME-2 | full Q2 struct-write (15 variants) | SW-1…SW-5 | N C N N |
| ME-3 | full Q3 read-function (15 variants) | RW-1…RW-7 | N N C N |
| ME-4 | full Q4 main (15 variants) | MW-1…MW-9 | N N N C |
| ME-5 | timed 90-min full exam (5 variants) | ME-1…ME-4 | C C C C |

---

## Critical-Atom Heatmap (per question)

Every atom marked **C** for that question must reach automaticity before sim drilling.

| Q | Critical atoms (count) | Top-load atoms |
|---|----------------------|----------------|
| Q1 | 50 | R-1…R-5 (RDS), HE-1…HE-18, T-6, T-10, G-5, F-1, W-3 |
| Q2 | 14 | T-1…T-4, SW-1…SW-5, V-10, V-12, S-4 |
| Q3 | 35 | RW-1…RW-7, PC-4, PC-5, R-3…R-5, G-14, T-11, T-12, W-3, I-3 |
| Q4 | 38 | MW-1…MW-9, M-prereqs, T-11, T-12, G-2, W-3, I-3, O-8…O-11 |

### Cross-Q multi-critical (highest training ROI)

| Atom | Q1 Q2 Q3 Q4 | Comment |
|------|---|---|---|---|---------|
| V-1 (variable=box) | C C C C | Foundation of everything |
| V-4 (declare) | C C C C | Used in every line |
| S-4 (`;`) | C C C C | Every statement |
| S-5 (`{`) | C C C C | Every block |
| S-6 (`}`) | C C C C | Every block close |
| R-3 (`&`=alias) | C N C C | RDS |
| R-5 (`&` mutates caller) | C N C C | RDS |
| W-3 (for header) | C N C C | Used in 3 of 4 |
| W-4 (for-init) | C N C C | Used in 3 of 4 |
| W-5 (for-cond) | C N C C | Used in 3 of 4 |
| G-5 (`arr[i]`) | C N C C | Used in 3 of 4 |
| T-6 (`.field`) | C C C C | Used in all 4 |
| T-10 (`data.arr[i]`) | C N C C | Q1 + Q3 + Q4 chained |

**Train these to automaticity early.** Repeat across multiple levels (no spacing — just repetition in context).

---

## RDS Re-confirmed: R-1 through R-5

Pass-by-value vs `&`. Single concept blocks 3 of 4 questions. Failure cascade: lose `&` in Q1 → wrong `d.mystery` → lose Q1; lose `&` in Q3 → array reads vanish → lose Q3 → Q4 prints empty rows → lose Q4. Only Q2 (struct write) survives.

**Front-loaded at Level 9, immediately after functions.** 2× standard volume per atom in Level 9. Hammer until automatic before any composite drilling.

**RDS misconception filter** (train as MCQ distractors):
1. Confuse `&` (alias) with `*` (pointer dereference)
2. Think `&array[]` invalid syntax
3. Try to `return` modified array/struct
4. Use `typedef struct` (C-style) — C++ allows `struct Name`
5. Think `const &` always required — only `&` needed for mutation
6. Off-by-one: `i < count` vs `i <= count`
7. `cout` instead of `printf` in Q4 (PFG/SIT102 uses printf)
8. Forget `.c_str()` for `printf %s`
9. `;` after function `}` (only struct definitions take `};`)
10. Index from 1 instead of 0

---

## Card Schemas (Final, Consolidated)

Four card types. All offline-graded (char-match, no API).

### 1. Memorize Card (cloned from sprintlearn flashtype, [05](05_audit_three_apps.md))

```typescript
interface MemorizeCard {
  type: 'memorize';
  atomId: string;
  fact: string;            // ≤7 words (Miller's law)
  flashSeconds: 3;         // 2–5 range; harder atoms = longer
  mode: 'race' | 'recall'; // race=type while visible; recall=hide first
  keyChecks: string[];     // tokens that must appear
  explanation: string;     // shown on fail
}
```

UX flow:
1. Card displays fact for `flashSeconds` seconds
2. Fact hides (recall) or stays visible (race)
3. Click anywhere → input field appears
4. User types fact verbatim
5. Grade: `keyChecks[]` all present? → pass; else fail
6. Wrong → show full fact + explanation → retry once → continue

### 2. MCQ Card (cap 20%; axioms + misconception filters only)

```typescript
interface MCQCard {
  type: 'mcq';
  atomId: string;
  stem: string;            // question text
  correct: string;         // correct option
  distractors: [string, string, string];  // 3 plausible misconceptions
  explanation: string;
}
```

Distractors drawn from the 10-item misconception list above. Use sparingly — only Tier 0–2 axioms + Level 9 RDS contrast cards.

### 3. Hand-Trace Card (cloned from IT-ELO T1 APK, [06](06_audit_it_elo_t1_apk.md))

```typescript
interface HandTraceCard {
  type: 'trace';
  atomId: string;
  code: string;
  variables: string[];
  expectedSteps: Step[];
  userInputs: string[];
  inputLabels: string[];   // "Enter age:" — explicit
  terminalOutput: string[];
  q4StopCondition?: string;  // partial-trace stop
  inputMode: 'per-step' | 'final-only';
  teachMe: string;         // 3–5 sentence recovery
}

interface Step {
  line: number;
  variable: string;        // "" for output-only
  value: string;
  output?: string | null;
  condition?: string | null;  // "i < 5 → true" inline
}
```

UX: history-strip variable boxes, separate terminal panel, current-line highlight, two-pass support. Wrong → "Teach Me" → 3-5 sentence explanation → retry.

### 4. Code-Write Card (3-level scaffold; T1 lacked levels 1-2)

```typescript
interface CodeWriteCard {
  type: 'write';
  atomId: string;
  level: 1 | 2 | 3;        // 1=fill, 2=complete, 3=free
  spec: string;
  template?: string;       // L1/L2: code with ___ blanks
  expectedAnswer: string;
  keyChecks: string[];     // tokens that must appear (whitespace-collapsed)
  forbidden?: string[];    // tokens that must NOT appear (e.g., '*' for non-pointer Qs)
  explanation: string;
}
```

UX: Level 1 fill-blank → Level 2 complete-body → Level 3 free-form. Each level must pass before advancing within atom. Grading: normalize whitespace → char-match against `expectedAnswer` OR `keyChecks` all present + no `forbidden`.

---

## Card Volume per Atom

| Card type | Per atom | Notes |
|-----------|---------|-------|
| Memorize | 5 | Different phrasings of same ≤7-word fact |
| MCQ | 2 | Only Tier 0–2 axioms + Level 9 RDS contrast |
| Hand-trace | 6 | Level 13 atoms only — others skip |
| Code-write L1 (fill) | 3 | Levels 8–16 only |
| Code-write L2 (complete) | 3 | Levels 8–16 only |
| Code-write L3 (free) | 2 | Levels 8–16 only |

### Total Volume Calculation

| Tier | Atoms | Memorize | MCQ | Trace | Write | Subtotal |
|------|-------|---------|-----|-------|-------|---------|
| -1 | 7 | 35 | 0 | 0 | 0 | 35 |
| 0 | 10 | 50 | 20 | 0 | 0 | 70 |
| 1 | 13 | 65 | 26 | 0 | 0 | 91 |
| 2 | 20 | 100 | 40 | 0 | 0 | 140 |
| 3 | 7 | 35 | 14 | 0 | 0 | 49 |
| 4 | 11 | 55 | 22 | 0 | 0 | 77 |
| 5 | 10 | 50 | 20 | 0 | 0 | 70 |
| 6 | 5 | 25 | 10 | 0 | 0 | 35 |
| 7 | 10 | 50 | 20 | 0 | 0 | 70 |
| 8 | 10 | 50 | 0 | 0 | 80 | 130 |
| 9 ★RDS★ | 8 | 80 | 32 | 12 | 64 | 188 |
| 10 | 14 | 70 | 0 | 0 | 112 | 182 |
| 11 | 12 | 60 | 0 | 0 | 96 | 156 |
| 12 | 6 | 30 | 12 | 0 | 48 | 90 |
| 13 (HE) | 18 | 90 | 0 | 108 | 0 | 198 |
| 14 (SW) | 5 | 25 | 0 | 0 | 40 | 65 |
| 15 (RW) | 7 | 35 | 0 | 0 | 56 | 91 |
| 16 (MW) | 9 | 45 | 0 | 0 | 72 | 117 |
| 17 (sims) | 5 | 0 | 0 | 15 | 60 | 75 |
| **TOTAL** | **177** | **950** | **216** | **135** | **628** | **1,929** |

| Card type | Total | % | Notes |
|-----------|-------|---|-------|
| Memorize | 950 | 49% | Production drill, ≤7 words |
| MCQ | 216 | 11% | Capped <20% ✓ |
| Trace | 135 | 7% | Hand-execution only |
| Write | 628 | 33% | Scaffolded 3-level |

Total: **1,929 cards**. At avg 90 sec/card → **48 hours**. Under 56-hour budget. Buffer for retries + 5 timed mock exams.

---

## Linear Sequence (Forward-Only, 19 Stages)

```
[Stage 1]  Pre-programming mental model       (P-1…P-7)        7 atoms, 35 cards
[Stage 2]  Source skeleton                     (S-1…S-10)      10 atoms, 70 cards
[Stage 3]  Output                              (O-1…O-13)      13 atoms, 91 cards
[Stage 4]  Variables + types                   (V-1…V-20)      20 atoms, 140 cards
[Stage 5]  Input                               (I-1…I-7)        7 atoms, 49 cards
[Stage 6]  Operators                           (A-1…A-11)      11 atoms, 77 cards
[Stage 7]  Comparison + logical                (C-1…L-3)       10 atoms, 70 cards
[Stage 8]  Conditionals                        (F-1…F-5)        5 atoms, 35 cards
[Stage 9]  Loops                               (W-1…W-10)      10 atoms, 70 cards
[Stage 10] Functions basic                     (H-1…H-10)      10 atoms, 130 cards
[Stage 11] ★ RDS — Pass-by-Reference ★         (R-1…R-8)        8 atoms, 188 cards (2× volume)
[Stage 12] Arrays                              (G-1…G-14)      14 atoms, 182 cards
[Stage 13] Structs                             (T-1…T-12)      12 atoms, 156 cards
[Stage 14] Pass composites                     (PC-1…PC-6)      6 atoms, 90 cards
[Stage 15] Hand-execution skill (Q1 atoms)     (HE-1…HE-18)    18 atoms, 198 cards
[Stage 16] Struct-write skill (Q2)             (SW-1…SW-5)      5 atoms, 65 cards
[Stage 17] Read-function write skill (Q3)      (RW-1…RW-7)      7 atoms, 91 cards
[Stage 18] Main-write skill (Q4)               (MW-1…MW-9)      9 atoms, 117 cards
[Stage 19] Mock exams                          (ME-1…ME-5)      5 atoms, 75 cards
```

Forward-only. No back-jump. No mastery gating. Wrong → inline correction + retry once → continue. No save state. Session-only.

Critical sequence rules:
1. **Level 9 (RDS) before Level 10 (arrays).** Pass-by-ref must be automatic before `&array[]` introduced.
2. **Level 11 (structs) before Level 12 (composites).** Struct-by-value vs struct-by-ref needs both grounded.
3. **Level 13 (hand-execution) before Q1 sims.** Composite trace skills built from atomic trace skills.
4. **Levels 14-16 (per-question write) before Q2/Q3/Q4 sims.** Skill mastery before integration.
5. **Stage 19 (mock exams) last.** Timed full-exam practice ONLY after all skills built.

---

## App Architecture (Consolidated, Final)

### Tech stack

| Layer | Choice |
|-------|--------|
| Build | Vite 5 |
| UI | React 19 + TypeScript |
| Styling | Tailwind v4 + semantic class layer |
| State | React `useState` only — session-scoped |
| Storage | None — no localStorage, no backend |
| Grading | Pure JS char-match |
| Build artifact | Static site (`dist/`) |
| Runtime AI calls | **Zero** |

### File structure

```
src/
├─ data/
│  ├─ atoms.ts             # 177 atom records
│  ├─ templates.ts         # parametric templates per atom
│  └─ generated.ts         # build-time output (~1,929 cards)
├─ build/
│  └─ generate-cards.ts    # variant generator (build-time only)
├─ types/
│  └─ card.ts              # Memorize | MCQ | Trace | Write
├─ components/
│  ├─ MemorizeCard.tsx     # flashSeconds + keyChecks + explanation
│  ├─ MCQCard.tsx          # 4 options, 1 correct, distractor explanations
│  ├─ TraceCard.tsx        # variable-box history strip + terminal panel
│  └─ WriteCard.tsx        # 3-level scaffold (fill → complete → free)
├─ pages/
│  └─ Sequence.tsx         # single linear flow page
├─ lib/
│  └─ grading.ts           # char-match logic
├─ styles/
│  └─ semantic.css         # .variable-history, .step-box--current, etc.
└─ App.tsx
```

**4 components. 1 page. 1 lib file.** Minimum surface area.

### Authoring strategy

Per atom, hand-author **1 template** with substitution slots. Build-time generator expands cartesian product → emits flat `cards.json`. Variant deduplication by content hash (variable-name-only diff = same card; reject).

```
Atoms: 177 templates → ~1,929 cards (10–20 variants per template)
Build time: <1 second
Runtime AI cost: 0
Author cost: ~177 templates manually written (no Claude API spam)
```

---

## What's IN

| Feature | Source pattern | Why |
|---------|---------------|-----|
| Memorize card (≤7 words, click→type) | sprintlearn flashtype | User likes; Miller's law; offline grading |
| MCQ card (≤20% of cards) | sprint/sprintlearn | Useful for axioms + misconception filters |
| Hand-trace card (variable-box history strip) | IT-ELO T1 APK + CRAM-AI | Mirrors paper exam; canonical UX |
| Code-write 3-level scaffold | NEW (T1 missed levels 1-2) | Avoid AI-graded single Q failure |
| Inline condition viz (`age > 5 → true`) | IT-ELO T1 | Cond ≠ stmt clarity |
| Two-pass trace (full + partial-stop) | IT-ELO T1 | Tests loop understanding |
| Strict per-value char-match grading | IT-ELO T1 | Matches exam strictness |
| `userInputs` + `inputLabels` | IT-ELO T1 | Explicit assumptions removed |
| `keyChecks[]` token grading | sprintlearn | Tolerates whitespace/synonyms |
| "Teach Me" recovery on wrong | IT-ELO T1 + new requirement | 3-5 sentence explanation; retry once |
| Forward-only sequence (no skip) | NEW | Strict prereq order |
| Inline correction + retry once | NEW | No mastery gating; keeps learner moving |
| Semantic CSS classes | T1 audit critique | Maintainability over Tailwind chains |
| Build-time variant generator | NEW | Token cost = 0 at runtime |

## What's OUT

| Feature | Reason |
|---------|--------|
| All IT ELO content | Trains recognition not production; new templates only |
| All audio (CRAM-AI 165MB) | Passive learning; user's no-passive rule |
| Save state / localStorage | User explicitly rejects |
| Spaced repetition / SRS / Bjork tracking | 14-day sprint, not long-term |
| Mastery gating / streak counters | Wastes time when stuck |
| Runtime AI grading (Cerebras / Claude / OpenAI) | Token cost; no offline use |
| Cross-device sync (Firebase) | Offline app |
| Mode pickers (sprint/lesson/vocab/KA) | One linear path only |
| Free-roam card order | Violates strict prereq |
| Fact/cue flashcard pairs | Recognition-only; replace with memorize (production) |
| Module-picker → 50-Q sprint | No mid-sprint checkpoint = lost session |
| Single AI-judged code-write Q (T1 Q6) | 40% false pos/neg; replace with 3-level scaffold |
| Vague bug-ID drill (T1 Q5) | Too imprecise; drop or narrow to keyword-graded |
| `*` pointer syntax | Not in T2; out-of-scope |
| Dynamic allocation (`new`/`delete`) | Not in T2 |
| Classes / methods / inheritance | Not in T2 |
| File I/O (`ifstream`/`ofstream`) | Not in T2 |
| STL containers (`vector`/`map`) | Not in T2 |
| Templates / lambdas / exceptions | Not in T2 |
| Recursion / multi-dim arrays / `switch` | Not in T2 |

---

## Q1-Q4 Difficulty Ladders

Each ladder embedded inside its question's stage. Beginner → advanced within stage.

### Q1 (Hand-Trace) — 18 atoms + 15 sim variants

| Level | Card focus |
|-------|-----------|
| Beg 1 | Trace `int x = 5;` (single assignment) |
| Beg 2 | Trace `int x = 5; int y = x;` (chained) |
| Beg 3 | Trace `arr[0] = 5;` (single index write) |
| Beg 4 | Trace 3-iteration for-loop with counter only |
| Int 1 | Trace for-loop modifying array |
| Int 2 | Trace if/else inside for-loop |
| Int 3 | Trace function call with pass-by-value |
| Int 4 | Trace function call with `&` (single int) |
| Int 5 | Trace function call with struct + `&` |
| Int 6 | Trace max-finder loop (no `&`) |
| Adv 1 | Trace `who_am_i`-style: struct + `&` + max + array field |
| Adv 2 | Q1 sim with two-pass (full + partial-stop at `i == 3`) |
| Adv 3 | Q1 sim across 15 entity variants (sensor / patient / book / etc.) |

### Q2 (Struct Write) — 5 atoms + 15 sim variants

| Level | Card focus |
|-------|-----------|
| Beg 1 | Fill: `struct X { int ___; };` |
| Beg 2 | Complete: write 1 field given type+name |
| Beg 3 | Complete: write 3 fields given types+names |
| Int 1 | Free: write struct from "3 fields: id int, name string, age int" |
| Int 2 | Free: write struct with 4 fields |
| Adv 1 | Q2 sim across 15 entity variants |

### Q3 (Read Function) — 7 atoms + 15 sim variants

| Level | Card focus |
|-------|-----------|
| Beg 1 | Fill: `void read_X(X &list[], int ___)` |
| Beg 2 | Fill: write the for-loop bound |
| Beg 3 | Fill: write the cin line |
| Int 1 | Complete: write loop body given signature |
| Int 2 | Complete: write signature given body |
| Int 3 | Free: write `read_X` for 2-field struct |
| Int 4 | Free: write `read_X` for 3-field struct |
| Adv 1 | Q3 sim across 15 entity variants |

### Q4 (Main Function) — 9 atoms + 15 sim variants

| Level | Card focus |
|-------|-----------|
| Beg 1 | Fill: `const int MAX = ___;` |
| Beg 2 | Fill: write the array declaration |
| Beg 3 | Fill: write the function call |
| Int 1 | Complete: write printf line given other lines |
| Int 2 | Complete: write print loop given main shape |
| Int 3 | Free: write main with 2-field struct printf |
| Int 4 | Free: write main with 3-field struct printf |
| Adv 1 | Q4 sim across 15 entity variants |

---

## Mock Exams (Stage 19)

5 full-exam variants. Each = 4 questions, 90-min countdown timer, no hints, hand-graded char-match.

| Exam | Entity | Q1 array | Q2 fields | Q3 entity | Q4 printf |
|------|--------|----------|-----------|-----------|-----------|
| 1 | computer_data | [3.2, 7.1, 5.0, 9.4, 2.8] | id, description, location | same | %d %s %s |
| 2 | student_data | [88.5, 91.0, 76.2, 65.4, 82.1] | id, name, course | same | %d %s %s |
| 3 | vehicle_data | [4.4, 1.2, 8.7, 6.0, 3.5] | plate, make, model | same | %s %s %s |
| 4 | sensor_data | [0.5, 1.8, 2.1, 0.9, 3.0] | id, type, location | same | %d %s %s |
| 5 | patient_record | [5.0, 4.2, 6.8, 3.1, 7.7] | id, name, ward | same | %d %s %s |

Q1 algorithm always max-finder (per [03 mastery state](03_mastery_state_t2.md) variation hypothesis).

---

## Build Manifest (No Timeframes)

### Phase A — Scaffold

- Vite 5 + React 19 + TS + Tailwind v4 init
- Semantic CSS layer skeleton
- Type system: `src/types/card.ts`
- Empty `Sequence.tsx` page

### Phase B — Atoms + Templates

- `src/data/atoms.ts`: 177 atom records (id, fact, deps, Q-tags, level)
- `src/data/templates.ts`: 177 parametric templates (1 per atom)
- `src/build/generate-cards.ts`: variant generator + dedup-by-hash

### Phase C — Components

- `MemorizeCard.tsx`: flashSeconds + race/recall + keyChecks + explanation + retry-once
- `MCQCard.tsx`: 4 options + distractor explanations
- `TraceCard.tsx`: variable-box history strip + terminal panel + two-pass + Teach Me
- `WriteCard.tsx`: 3-level scaffold + keyChecks + forbidden + explanation

### Phase D — Sequence

- `Sequence.tsx`: linear iterator over `generated.ts`, forward-only, retry-once, no save
- Inline correction display
- Per-stage transition (label only, no gating)

### Phase E — Grading lib

- `lib/grading.ts`: normalize whitespace + case → char-match; keyChecks token presence; expected-vs-actual list compare for trace; multi-correct regex pattern support

### Phase F — Mock Exams

- 5 mock exam JSON variants
- 90-min countdown UI
- Hand-grade char-match against expected answers

### Phase G — Author Templates

- 177 templates × ~5–15 variants each = ~1,929 cards on `npm run build`
- Manual authoring per atom; no Claude API spam
- QA: spot-check 10% — automated syntax check on expected code answers

---

## Acceptance Criteria

| Criterion | Test |
|-----------|------|
| Strict prereq order | Each atom's `deps` resolve to atoms in earlier or same level |
| Forward-only flow | No back-button, no skip-ahead UI |
| ≤7 words per memorize card | Lint check on `fact` field length |
| Offline grading only | No `fetch()` calls in built artifact (audit dist/) |
| No save state | No `localStorage.setItem` in built artifact |
| Card ratio sane | Memorize 49%, MCQ 11%, Trace 7%, Write 33% |
| RDS front-loaded | Level 9 atoms (R-1…R-5) appear at 11/19 of total sequence |
| Mock exam matches T2 format | 4 questions, 90-min timer, char-match grading |
| Pure session state | Refresh = restart sequence |
| 1,929 ± 5% cards built | `generated.ts` length within target |

---

## Open Questions (Carry From Earlier Brainstorms)

1. Card-presentation order within stage: random vs difficulty-sequenced? **Tentative: difficulty-sequenced.** Lower cog load for sprint mode.
2. "Teach Me" content authoring: hand-write per atom (177) vs templated? **Tentative: hand-write Levels 9-16, templated Levels -1 to 8** (axioms have less to explain).
3. Mobile fallback for variable-box UI: phone-portrait variable-box becomes vertical history strip? **Defer to v2 — desktop-first build.**
4. Race vs strict-recall default for memorize: **race for Levels -1 to 8 (forgiving while learning), strict-recall for Levels 9-16 (force production).**
5. `keyChecks` token threshold for code-write: **all required tokens must appear (presence-binary, not threshold).** Use `forbidden[]` for negative checks.
6. Per-step vs final-only hand-trace granularity: **per-step at Level 13 atoms (HE-1…HE-18), final-only at Stage 19 mock exams.** Mirrors how exam strictness ramps.
7. Variant deduplication: variable-name-only diff = duplicate. Force entity-level variation (different struct, different array values) for genuine variants.

---

## Quick-Reference Card

| Q | Top-3 atoms | Card type emphasis |
|---|------------|---------------------|
| Q1 | R-3, HE-16, T-10 | Hand-trace |
| Q2 | SW-1, T-3, V-12 | Code-write 3-level |
| Q3 | RW-2, PC-4, R-3 | Code-write 3-level |
| Q4 | MW-1, MW-8, T-12 | Code-write 3-level |

| Stage | Tier | Atoms | Cards | Cum cards |
|-------|------|-------|-------|----------|
| 1 | -1 | 7 | 35 | 35 |
| 2 | 0 | 10 | 70 | 105 |
| 3 | 1 | 13 | 91 | 196 |
| 4 | 2 | 20 | 140 | 336 |
| 5 | 3 | 7 | 49 | 385 |
| 6 | 4 | 11 | 77 | 462 |
| 7 | 5 | 10 | 70 | 532 |
| 8 | 6 | 5 | 35 | 567 |
| 9 | 7 | 10 | 70 | 637 |
| 10 | 8 | 10 | 130 | 767 |
| 11 ★ | 9 | 8 | 188 | 955 |
| 12 | 10 | 14 | 182 | 1,137 |
| 13 | 11 | 12 | 156 | 1,293 |
| 14 | 12 | 6 | 90 | 1,383 |
| 15 | 13 | 18 | 198 | 1,581 |
| 16 | 14 | 5 | 65 | 1,646 |
| 17 | 15 | 7 | 91 | 1,737 |
| 18 | 16 | 9 | 117 | 1,854 |
| 19 | 17 | 5 | 75 | 1,929 |

End of canonical reference. Cross-refs: [01](01_audit_it_elo.md), [02](02_audit_t1_app.md), [03](03_mastery_state_t2.md), [04](04_new_app_design.md), [05](05_audit_three_apps.md), [06](06_audit_it_elo_t1_apk.md).
