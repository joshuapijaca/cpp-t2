# SOURCE_DATA_CATALOG.md

Authoritative inventory of `cpp-t2/source-data/`. Every v2.2 card MUST cite a row in this catalog or be deleted.

Compiled: 2026-05-07. Test sat morning of 2026-05-07 at 11:00 (V2.0 paper).

Citation grammar:
- `pfg:<part>/<chapter>/<file>` (PFG Markdown sections)
- `seminar:saloni-2 @ HH:MM:SS` (Mondays 6pm new (2).vtt)
- `task-sheet:P<n>` or `task-sheet:T2`
- `practice:Q<n>` (Test2-SIT102-practice-2026T1.pdf / .txt)
- `v2:Q<n>` (Test 2 V2.0 attempt 1, real paper, 2026-05-07)
- `variant:Q<n>` (test2-semester2-variant.txt — Sem 1 2025 retired paper)

---

## 1. PFG (Programming Fundamentals Guide) → Test 2 mapping

Root: `cpp-t2/source-data/pfg-content/pfg-content/`

| Test 2 concept | PFG file (relative to root) | Used by Q |
|---|---|---|
| Variables / types / I/O | `part-2-organised-code/1-starting-cpp/2-trailside/4-1-variable-constant.md` | Q4 main |
| Variables / assignment (panorama) | `part-1-instructions/1-sequence-and-data/0-panorama/3-variables.md`, `4-assignment.md` | Q4 main |
| Variable declaration trailside | `part-1-instructions/1-sequence-and-data/2-trailside/07-variable.mdx`, `08-assignment-statement.mdx` | Q1, Q4 |
| Type concept | `part-1-instructions/1-sequence-and-data/2-trailside/06-type.mdx` | All Q |
| Function calls | `part-2-organised-code/1-starting-cpp/2-trailside/4-2-function-calls.md` | Q3, Q4 |
| If statements | `part-2-organised-code/1-starting-cpp/2-trailside/4-3-if.md` | Q1 trace |
| Compound expressions | `part-2-organised-code/1-starting-cpp/2-trailside/4-3-compound.md` | Q1 |
| Switch / case | `part-2-organised-code/1-starting-cpp/2-trailside/4-4-case.md` | (not Q-critical) |
| While loops | `part-2-organised-code/1-starting-cpp/2-trailside/4-5-while.md` | Q1 (alt) |
| For loops | `part-2-organised-code/1-starting-cpp/2-trailside/4-6-for.md` | **Q1 trace, Q3 read** |
| Function declaration | `part-2-organised-code/2-organising-code/2-trailside/04-function-decl.mdx` | Q3, Q4 |
| Parameters | `part-2-organised-code/2-organising-code/2-trailside/04-parameter.mdx` | Q3 |
| Return values | `part-2-organised-code/2-organising-code/2-trailside/05-return.mdx` | Q3 |
| Local variables / stack | `part-2-organised-code/2-organising-code/2-trailside/03-local-variable.md`, `05-the-stack.mdx` | Q1, Q4 |
| Struct (panorama) | `part-2-organised-code/3-structuring-data/0-panorama/1-struct.md` | **Q2** |
| Struct trailside | `part-2-organised-code/3-structuring-data/2-trailside/03-01-struct.md` | **Q2** |
| Custom-type vars | `part-2-organised-code/3-structuring-data/2-trailside/04-declaring-variables-with-custom-types.md` | Q4 |
| Field/element assignment | `part-2-organised-code/3-structuring-data/2-trailside/05-assignment-statement-with-fields-and-elements.md` | Q1 trace |
| Struct expressions | `part-2-organised-code/3-structuring-data/2-trailside/06-expression-with-custom-type.md` | Q1 |
| Type-decl program | `part-2-organised-code/3-structuring-data/2-trailside/02-program-with-type-declarations.md` | Q2, Q4 |
| Test-knowledge / entity exercise | `part-2-organised-code/3-structuring-data/3-explore/3-1-entity.md` | **Q2 (printer/computer/desk pattern)** |
| Arrays | `part-3-programs-as-concepts/3-collections/2-trailside/10-arrays.mdx`, `11-manipulating-arrays.mdx` | **Q1, Q3, Q4** |
| Arrays + collections (overview) | `part-3-programs-as-concepts/3-collections/2-trailside/09-arrays-and-collections.mdx` | All Q |
| Pass-by-reference (RDS) | `part-2-organised-code/2-organising-code/0-panorama/04-parameter.md` (read 'reference parameter' section) | **Q3** |
| Code tracing (PFG explicit) | `part-3-programs-as-concepts/3-collections/2-trailside/22-code-tracing.mdx` | **Q1 hand-execution** |
| Desk-checking | `part-3-programs-as-concepts/3-collections/2-trailside/20-desk-checking-software.mdx` | **Q1** |
| Analysing collections | `part-3-programs-as-concepts/3-collections/2-trailside/21-analysing-code-with-collections.mdx` | Q1 |
| Syntax guide | `part-3-programs-as-concepts/3-collections/2-trailside/25-syntax-guide.mdx` | All Q |

Note: Test 2 covers P2-P9 (per `task-sheet:T2`). PFG `part-3` chapter on collections is canonical content for Q1/Q3 array iteration.

---

## 2. Saloni VTT timestamps — `seminar:saloni-2`

File: `cpp-t2/source-data/seminars/SIT102 Seminar - Mondays 6pm new (2).vtt`

| Timestamp | Topic |
|---|---|
| 00:17:46 | Saloni opens: "discussing the test" |
| 00:17:56 | "We'll just do the test today" |
| 00:18:13 | "hand execution so that I can show you" — flags Q1 method |
| 00:20:30 | "this is test two" — locates the practice paper on OnTrack |
| 00:20:41 | Walking through where the practice test lives |
| 00:21:27 | Outline: "the functions, how do you declare a struct" |
| 00:21:30 | "how do you do the hand execution" |
| 00:23:02 | **Q1 hand-execution begins** — "we have to read a lot of it" |
| 00:24:16 | Q1 cont: explaining `SIZE` constant |
| 00:25:39 | Q1 cont: introducing `struct` |
| 00:25:44 | "when we call a struct, how do we proceed forward" |
| 00:25:50 | Drawing the struct as a box (key visual technique) |
| 00:26:07 | "this is the struct that I have. Now, inside this struct" — fields layout |
| 00:28:25 | Warning: `int i;` is **NOT** inside the struct (common mistake) |
| 00:43:42 | **Q2 begins** — "creating a system for managing computers. The following fields are needed" |
| 00:44:00 | Writing `struct computer_data { ... }` |
| 00:44:12 | Naming convention: "the computer data C" |
| 00:44:50 | **Q3 begins** — "Write a function to read in the" |
| 00:45:03 | Q3 cont: "computer list. Now, when I say list, computer list" |
| 00:45:30 | Q3 reuses Q2's struct |
| 00:46:30 | **Q4 main begins** — "I equal to 0 because that's how we'll start" |
| 00:46:40 | "we'll compare it with the max. So we'll have max computers" |
| 00:46:54 | "We are just printing out the list" |
| 00:47:17 | "they'll always have the main function...ask you to write a main function" |

Q1 teaching block: ~`00:23:02` → `00:42:00` (~19 min on hand-exec)
Q2 teaching block: `00:43:42` → `00:44:50` (~1 min — fast)
Q3 teaching block: `00:44:50` → `00:46:30` (~2 min)
Q4 teaching block: `00:46:30` → end (~the close of session)

Common-mistake warnings: `00:28:25` (declaring i inside struct), `00:21:30` (hand-exec format), `00:25:50` (struct-as-box).

---

## 3. Task sheets

Root: `cpp-t2/source-data/task-sheets/`

| File | Concepts | Test-2 relevance | Code patterns |
|---|---|---|---|
| `SIT102-P6.txt` | C++ retool: variables, if/switch/while/for, fn calls | **HIGH** — foundation for Q1/Q4 | `int main()`, `cin`, `cout`, `for (i=0; i<n; i++)` |
| `SIT102-P7.txt` | Functions, procedures, parameters, return | **HIGH** — Q3, Q4 | `void name(type param)`, `type name(...)` returns |
| `SIT102-P8.txt` | Structs + enums; custom types as locals/params/returns | **HIGHEST** — Q2, Q4 | `struct name { fields };` |
| `SIT102-P9.txt` | Arrays of primitive + arrays of structs; for loops over collections; **hand execution required** | **HIGHEST** — Q1, Q3, Q4 | `type arr[SIZE]; for(i=0;i<SIZE;i++)` |
| `SIT102-P10.txt` | (post-test, dynamic memory / pointers) | LOW — beyond Test 2 scope | — |
| `SIT102-T1.txt` | Test 1 logistics | none for T2 content | — |
| `SIT102-T2.txt` | Test 2 logistics: 90 min, P2-P9 scope, hand-exec format, closed book, hurdle | meta-rules | — |
| `SIT102-T2-2026.txt` | T2 2026 trimester variant of above | meta-rules | — |
| `SIT102-P1..P5` | C# branch (pre-C++); concept transfer only | LOW direct relevance | — |
| `Test1-SIT102-practice.docx`, `Test1-SIT102-Solution.docx` | Test 1 (control flow only) | LOW (no structs/arrays) | — |

Authoritative T2 spec: P2–P9 covered; hand-execution format mandatory; 90 min.

---

## 4. Test files (the verbatim stimuli)

Root: `cpp-t2/source-data/tests/`

### 4.1 `practice:` — `Test2-SIT102-practice-2026T1.txt`

**Q1 (hand-execute):** struct `stat_double { double numbers[SIZE]; double mystery; }`. Function `who_am_i(stat_double &data)` walks `for (i=0; i<SIZE; i++)` and assigns `data.mystery = data.numbers[i]` whenever `data.numbers[i] > data.mystery` (i.e. find-max). SIZE=5. Initial brace: `{ {-20.0, 3.2, 1.9, -1.5, 1.3}, 0.0 }`. Initial mystery is set to `data.numbers[0]` inside fn. Expected final mystery = **3.2**.

**Q2 (struct):** "managing computers in an office" — fields: identification number, description, location. Required name: `computer_data`.

**Q3 (read fn):** Signature given verbatim:
`void read_computers ( computer_data &computer_list [], int number_to_read )`
Reads `number_to_read` records into `computer_list`.

**Q4 (main):** Skeleton given:
```
const int     MAX = 100;
computer_data computers [MAX];
int           computer_num;
```
Comments: ask number, read list, print list. (No print fn pre-supplied — student composes inline or invents helper.)

### 4.2 `v2:` — V2.0 attempt 1 (real paper, screenshots)

Files: `tests/test two attempt 1/Screenshot_20260507-152909.png`, `Screenshot_20260507-152936.png`.

**v2:Q1 (hand-execute):**
- `const int SIZE = 5;`
- `struct stat_double { double numbers[SIZE]; double mystery; };`
- Fn: `void who_am_i(stat_double &data)` — sets `data.mystery = 0.0`, then `for (i=0; i<SIZE; i++) if (data.numbers[i] > 0) data.mystery = data.mystery + data.numbers[i];`
- Algorithm: **sum-positive** (different from practice's find-max).
- Brace-init: `stat_double d = { {2.4, -3.7, -1.7, 3.0, 2.0}, -0.9 };`
- Expected final `d.mystery` = `0.0 + 2.4 + 3.0 + 2.0` = **7.4**.

**v2:Q2 (struct):**
- "creating a system for managing a desk... fields needed to represent a desk: (1) an identification number; (2) a description; (3) a desk type" (transcribed from screenshot 2 header).
- Required name: `desk_data`.

**v2:Q3 (read fn):** Signature visible in screenshot 2:
`void read_desks ( desk_data &desk_list [], int number_to_read )`

**v2:Q4 (main):** Skeleton visible:
```
const int     MAX = 700;       // Maximum size of array of desks
desk_data     desks[MAX];      // Array of desks
int           desk_num;        // Actual number of desks stored
// Ask for number of desks
// Read in desk list
// Print list of desks
```
MAX = **700** (not 100 like practice). Container var = `desks`. Count var = `desk_num`.

### 4.3 `variant:` — `test2-semester2-variant.txt` (Sem 1 2025 retired paper)

Q1: `stat_float { float values[SIZE]; float result; }` + `find_min(stat_float &data)`. Brace `{ {4.5, -3.2, 6.0, 0.0, -7.1}, 99.0 }` → final `d.result` = **-7.1**.
Q2: `printer_data` struct (serial, model, department — all string).
Q3: `void read_printer(printer_data &printer)` (single, not array).
Q4 (extra): `void print_printer_list(printer_data list[], int count)` — print fn was supplied for the student.
Q5: `int main()` calls `read_printer` per printer then `print_printer_list`. `MAX_PRINTERS=50`.

This variant proves the pattern: name-of-entity changes, MAX changes, but skeleton + concepts identical.

### 4.4 Other files
- `tests/SIT102-T2.pdf`, `tests/SIT102-T2-2026.txt` — admin/logistics, mirror task-sheet.
- `tests/Test2-SIT102-practice.pdf` (older practice; superseded by `2026T1`).
- `tests/test1-*.txt` — Test 1 (control flow only). LOW relevance.
- `tests/practice1_images/*` — Test 1 image assets, LOW.

---

## 5. Top-10 most important source files for Test 2

1. **`tests/test two attempt 1/Screenshot_20260507-152909.png`** — verbatim v2:Q1 stimulus (sum-positive variant, brace `{2.4,-3.7,-1.7,3.0,2.0}`, mystery=-0.9). Q1 ground truth.
2. **`tests/test two attempt 1/Screenshot_20260507-152936.png`** — verbatim v2:Q2/Q3/Q4 (`desk_data`, MAX=700, `read_desks`). Q2/Q3/Q4 ground truth.
3. **`tests/Test2-SIT102-practice-2026T1.txt`** — practice paper exact text. The "find-max" / `computer_data` / MAX=100 sister of v2.
4. **`tests/test2-semester2-variant.txt`** — third variant proving the pattern (`stat_float`/`find_min`, `printer_data`). Confirms which fields are stable.
5. **`seminars/SIT102 Seminar - Mondays 6pm new (2).vtt`** — Saloni's full Q1-Q4 walkthrough; timestamp table in §2 above.
6. **`task-sheets/SIT102-P9.txt`** — Working-with-multiples (arrays + struct arrays + hand-exec mandate). Closest real-world Q1/Q3/Q4 source.
7. **`task-sheets/SIT102-P8.txt`** — Structuring Data (struct definition mechanics). Q2 source.
8. **`task-sheets/SIT102-P7.txt`** — Functions, parameters, return. Q3 grounding.
9. **`pfg-content/.../part-2-organised-code/3-structuring-data/2-trailside/03-01-struct.md`** — Canonical PFG struct-definition reference for Q2.
10. **`pfg-content/.../part-3-programs-as-concepts/3-collections/2-trailside/22-code-tracing.mdx`** + `20-desk-checking-software.mdx` — PFG hand-execution / desk-checking technique. Q1 method source.

Honourable mentions: `pfg-content/.../1-starting-cpp/2-trailside/4-6-for.md` (for-loops, used in every Q1 trace), and `task-sheets/SIT102-T2.txt` (rules of the test itself: 90 min, P2-P9, closed book, hand-execution format).

---

## 6. Card-authoring rule

Every v2.2 card MUST end its `source` field with at least one of:
- `pfg:<path>` from §1
- `seminar:saloni-2 @ HH:MM:SS` from §2
- `task-sheet:P<n>` or `task-sheet:T2` from §3
- `practice:Q<n>`, `v2:Q<n>`, or `variant:Q<n>` from §4

If a card cannot cite any of the above, **delete it**. The user's directive (RULE 4): "centered on source-data, NOT shit I hallucinate."
