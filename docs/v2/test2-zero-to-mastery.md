# SIT102 Test 2 — Zero-to-Mastery Reverse Engineering

**Audience**: Joshua Pijaca, sitting at zero familiarity with C++. Blank slate that can use logic.
**Source paper**: `cpp-t2/source-data/tests/test two attempt 1/` (Test 2 V2.0, sat 2026-05-07, left blank).
**Mission**: Document EVERY piece of knowledge required, then reverse-engineer the path from 0 (blank slate) → 1 (solving in sleep).
**Definition of 0**: Will leave all questions blank on test day.
**Definition of 1**: Solves every question in their sleep because it's so familiar.

---

# THE TEST PAPER (verbatim)

**Page 1 — Q1 Hand-Execute:**

```cpp
const int SIZE = 5;

struct stat_double {
   double numbers [SIZE];
   double mystery;
};

void who_am_i ( stat_double &data )
{
   int           i;

   data.mystery = 0.0;

   for (i = 0; i < SIZE; i++) {
      if ( data.numbers [i] > 0 ) {
          data.mystery = data.mystery + data.numbers [i];
      }
   }
}

1. Hand execute the code below using this procedure.
   // Initialise d.numbers with {2.4, -3.7, -1.7, 3.0, 2.0}
   // and d.mystery with -0.9.
   stat_double d = { {2.4, -3.7, -1.7, 3.0, 2.0}, -0.9};

   who_am_i ( d );
```

**Page 2 — Q2/Q3/Q4 (desk_data entity):**

```
You are creating a system for managing a desk of desks. The following fields are needed to
represent a desk: (1) id of current users; (2) a desk id; (3) number of screens.

2. Write a data structure named desk_data to capture these fields.

3. Write a function to read in the information for a number_to_read number of desks
   into desk_list.
   void read_desks ( desk_data &desk_list [], int number_to_read )

4. Write the main function which asks the user for desk_num number of desks. Then
   call your read_desks function to read in for desk_num desks. Finally, print the
   list of desks.

   int main ( )
   {
       const int    MAX = 100;       // Maximum size of array of desks
       desk_data    desks [MAX];     // Array of desks
       int          desk_num;        // Actual number of desks stored

       // Ask for number of desks
       // Read in desk list
       // Print list of desks
   }
```

**The blank-slate problem**: Joshua reads this and sees foreign hieroglyphs. To solve it, he must understand every layer below.

---

# TABLE OF CONTENTS

- [PHASE 0 — Pre-programming primer](#phase-0-pre-programming-primer) — what computers are, what code is, what memory is, what hand-execute means
- [PHASE 1 — Complete lexical inventory](#phase-1-complete-lexical-inventory) — every symbol on the test paper
- [PHASE 2 — Memory, variables, types](#phase-2-memory-variables-types) — what each variable is and isn't
- [PHASE 3 — Control flow](#phase-3-control-flow) — sequential / if / for / function call mechanics
- [PHASE 4 — Compound types](#phase-4-compound-types) — arrays, structs, struct fields, struct arrays, brace-init
- [PHASE 5 — References + functions](#phase-5-references-functions) — what `&` means, pass-by-reference, void
- [PHASE 6 — Q1 mechanics](#phase-6-q1-mechanics) — every micro-step to hand-execute Q1 → final answer 7.4
- [PHASE 7 — Q2 mechanics](#phase-7-q2-mechanics) — write desk_data struct from English spec
- [PHASE 8 — Q3+Q4 mechanics](#phase-8-q3q4-mechanics) — write read_desks and main from given skeletons
- [PHASE 9 — Exam mechanics](#phase-9-exam-mechanics) — what the paper looks like, marking, time, partial credit
- [PHASE 10 — Reverse-engineered curriculum](#phase-10-reverse-engineered-curriculum) — ordered learning path 0 → 1

---

<a name="phase-0-pre-programming-primer"></a>
# PHASE 0 — PRE-PROGRAMMING PRIMER

You cannot understand a single line of C++ without understanding what a computer DOES. This phase has zero C++ syntax. Skip it at your peril.

## P0.1 — What is a computer "running" a program?

The CPU is a tiny machine inside the computer that does one thing extremely fast: reads instructions one at a time and executes them. The CPU cannot guess. It cannot decide what you "probably meant". It can only read an instruction, do that instruction, then read the next.

Memory (RAM) is a giant grid of tiny boxes — billions of them. Each box can hold a small number. While a program runs, memory holds all working data: counters, names, scores, anything. The CPU constantly reads from memory ("what's in box 4127?") and writes back ("put 7 into box 4128").

**Analogy**: a chef who can only do exactly what's on the recipe card. Step 1: crack two eggs. Step 2: stir. The chef is the CPU. The recipe is the program. The pantry is memory.

**Why for Test 2**: every question reduces to "pretend you're the CPU, follow the instructions, report what happened."

## P0.2 — What is "code"?

Text humans write in a special language. A code file is plain text that follows strict rules so a compiler can turn it into instructions. Lines run **top to bottom by default**. Anything after `//` is a comment — ignored by the computer, written for humans.

So a 50-line file might be 30 instructions + 20 comments. The computer only reacts to the 30. The 20 are sticky-notes.

**For Test 2**: when tracing, you must SEPARATE real instructions from comments. Mistake a comment for code → invent steps that don't happen. Miss an instruction because it looks like a note → skip a step.

## P0.3 — What is a programming language?

A made-up language with very strict grammar. English forgives errors; programming languages do not. One missing semicolon, one typo, and the compiler refuses.

**C++ specifics you'll see immediately**:
- Statements end with `;`
- Code blocks wrap in `{ ... }`
- Names cannot have spaces
- Capitalization matters (`int` ≠ `Int`)

## P0.4 — What does "compile" mean?

The CPU only understands machine code (1s and 0s). The compiler is a translator that reads your `.cpp` text and produces an executable. If syntax is wrong, the compiler refuses → compile error → no executable → CPU never runs anything.

For Test 2 you don't need to compile anything — you trace given code on paper. But understanding compilation matters because: if you mentally execute code with bugs the compiler would reject, you're imagining a program that can't exist.

## P0.5 — What is memory? What is a variable?

Memory = giant row of numbered cells. Each cell holds a byte. A variable is a programmer-friendly NAME for one of those cells. The compiler maps names to cell addresses for you.

A variable has TWO parts:
1. **Name** — like `x`, `count`, `data`. The label. Never changes.
2. **Value** — what's currently stored in the cell. Can change.

**Critical model**: variable = labeled box. Reading the variable = looking inside the box. Writing the variable = throwing out the old slip and putting in a new one.

When you trace by hand, you draw a labeled box for each variable and update its contents as the program runs. **This IS what tracing is.**

## P0.6 — What is execution order?

Default: lines run top to bottom, one at a time. ONE line is "current" at any moment. Some constructs change which line comes next:

- `if`: condition true → run body, false → skip
- `for`: jump back to repeat a block
- function call: jump INTO another block, return when done
- `return`: exit the current function

You can imagine your finger pointing at the current line. The finger moves down by default. Branching/looping/calling change where the finger goes. There is always exactly ONE current line — never two simultaneously.

## P0.7 — What is "input" and "output"?

Input = data flowing INTO the program. Output = data flowing OUT.
- `cout` = console output (write to screen). Direction `<<` ("push to cout").
- `cin` = console input (read from keyboard). Direction `>>` ("pull from cin").

When `cin >> x` runs, the program PAUSES until the user types and presses Enter. Then the value is stored in `x` and execution continues.

For Q1 hand-execute, the function `who_am_i` has NO `cout` calls — so terminal output is empty. Q4's main has `cout << "Enter number..."` — so that prompt prints.

## P0.8 — What does "hand execute" mean?

PRETEND YOU ARE THE CPU.

1. Set up a memory table on paper (one row per variable).
2. Set up an output box.
3. Put your finger on line 1.
4. For each line: figure out what changes; update memory table; record any output; move finger to next line.
5. At the end: report final values + all output.

This IS Test 2 Q1. The whole question is: "Here is a C++ program. Hand-execute it. Tell me the final value of all variables and exactly what gets printed."

## P0.9 — What are "data types"?

Memory holds bits. The same bits mean different things depending on TYPE:
- `int`: whole numbers (no decimal). Examples: 5, -3, 0.
- `double`: decimal numbers. Examples: 3.14, -0.5, 0.0.
- `string`: text. Examples: "hello", "Joshua".
- `bool`: true or false only.

When you hand-execute, you must respect types. `7 / 2` between two ints = `3` (truncates). `7.0 / 2.0` = `3.5`. Type changes the answer.

## P0.10 — What is an algorithm?

A step-by-step procedure to solve a problem. Independent of language. The Q1 code implements an algorithm: "sum all positive values in the array."

If you spot the algorithm, you know the answer without tracing every step. But on the exam you MUST also write the trace because the trace is the deliverable.

**Common algorithm patterns in C++ trace questions**:
- **Sum-positive** (Q1 V2.0): `sum=0; for(i...) if(arr[i]>0) sum += arr[i]`
- Count-positive: `count=0; for(i...) if(arr[i]>0) count++`
- Find-max: `max=arr[0]; for(i...) if(arr[i]>max) max=arr[i]`
- Find-min: `min=arr[0]; for(i...) if(arr[i]<min) min=arr[i]`
- Average: `sum=0; for(i...) sum+=arr[i]; avg=sum/SIZE`

Q1 V2.0 is sum-positive. Recognize it → predicted answer = 2.4 + 3.0 + 2.0 = **7.4**.

---

<a name="phase-1-complete-lexical-inventory"></a>
# PHASE 1 — COMPLETE LEXICAL INVENTORY

Every single token on the Test 2 paper. If you cannot read every token, you cannot read the code.

## A. Keywords (reserved words)

| Token | Where in Test 2 | Meaning at blank-slate level |
|---|---|---|
| `const` | Q1 line 1, Q4 main | "this value cannot change after initialization" |
| `int` | Q1 line 1, Q1 line 9, Q3 sig, Q4 main | whole-number type |
| `double` | Q1 lines 4-5 | decimal-number type |
| `string` | implied in some Q2 variants | text type |
| `bool` | not on Test 2 attempt 1 | true/false type |
| `void` | Q1 line 7, Q3 signature | "function returns no value" |
| `struct` | Q1 line 3, Q2 answer | "I'm defining a new compound type" |
| `for` | Q1 line 11 | loop header keyword |
| `if` | Q1 line 12 | conditional keyword |
| `else` | not on Q1 | "otherwise" branch |
| `return` | Q4 main `return 0;` | exit function with value |
| `using` | top of file | bring namespace into scope |
| `namespace` | top of file | grouping of names |
| `std` | top of file | the standard library namespace |
| `include` | top of file `#include <iostream>` | "paste this header here" |
| `main` | Q4 | program entry point |

## B. Identifiers (programmer-chosen or library names)

Names you make up (or use from libraries). C++ identifier rules: starts with letter or underscore; contains letters/digits/underscores; case-sensitive; cannot be a reserved word.

| Token | Category | Where |
|---|---|---|
| `SIZE` | const int = 5 | Q1 |
| `stat_double` | struct type name | Q1 |
| `numbers` | array field | Q1 struct |
| `mystery` | scalar field | Q1 struct |
| `who_am_i` | function name | Q1 |
| `data` | function parameter | Q1 |
| `i` | loop counter | Q1 |
| `d` | struct variable | Q1 main |
| `cout`, `cin`, `endl` | library names from `std` | Q4 |
| `desk_data` | struct type name | Q2-Q4 |
| `desk_list` | function parameter | Q3 |
| `number_to_read` | function parameter | Q3 |
| `MAX` | const int = 100 | Q4 |
| `desks` | array variable | Q4 |
| `desk_num` | int variable | Q4 |
| `read_desks` | function name | Q3-Q4 |

**SIT102 naming convention**: `snake_case` for variables, `UPPER_CASE` for constants.

## C. Punctuation

| Token | Looks like | Meaning |
|---|---|---|
| `;` | semicolon | ENDS A STATEMENT. Required after every statement. Required after `};` of a struct. |
| `,` | comma | separates items in a list (parameters, init list values) |
| `.` | dot | accesses a struct field: `data.mystery` |
| `"..."` | double quotes | string literal: `"Enter number: "` |
| `'...'` | single quotes | character literal (not on Test 2) |
| `//` | slash slash | line comment — rest of line ignored |
| `#` | hash | preprocessor directive: `#include` |

## D. Brackets — three kinds, multiple meanings

**Parentheses `( )`** — appear in 4 contexts:
1. Function parameter list (definition): `void who_am_i ( stat_double &data )`
2. Function call (passing arguments): `who_am_i ( d )`
3. Conditions: `if ( data.numbers[i] > 0 )`, `for ( i = 0; ... )`
4. Grouping in expressions

**Curly braces `{ }`** — appear in 3 contexts:
1. Code block (function body, loop body, if body)
2. Struct definition body: `struct stat_double { ... };`
3. Initializer list: `{ {2.4, ...}, -0.9 }`

**Square brackets `[ ]`** — appear in 4 contexts:
1. Array size in declaration: `double numbers[SIZE]`
2. Array element access: `data.numbers[i]`
3. Array parameter type: `desk_list[]`
4. Array variable declaration: `desks[MAX]`

## E. Operators

| Token | Meaning | Example on Test 2 |
|---|---|---|
| `=` | ASSIGNMENT (store right into left) | `data.mystery = 0.0;` |
| `==` | equality comparison (NOT on Q1) | n/a |
| `+` | addition | `data.mystery + data.numbers[i]` |
| `-` | unary negation in literals | `-3.7`, `-0.9` |
| `<` | less than | `i < SIZE` |
| `>` | greater than | `data.numbers[i] > 0` |
| `++` | post-increment (add 1) | `i++` |
| `&` | reference parameter | `stat_double &data` |
| `<<` | stream insertion | `cout << "..."` |
| `>>` | stream extraction | `cin >> desk_num` |

### `&` — THE CONFUSING ONE

`&` has THREE different meanings in C++. Joshua only needs ONE for Test 2.

| Meaning | Form | Example | On Test 2? |
|---|---|---|---|
| 1. Reference parameter | next to a TYPE in param list | `stat_double &data` | **YES — only this one matters** |
| 2. Address-of operator | unary, before a variable | `&x` | NO |
| 3. Bitwise AND | between two integer values | `a & b` | NO |

**Decision rule**:
- `&` next to a type in a parameter list → reference (meaning #1)
- `&` before a single variable in an expression → address-of (meaning #2)
- `&` between two values → bitwise AND (meaning #3)

For Test 2 attempt 1, every `&` you see is meaning #1: "this parameter is an alias to the caller's variable; modifications inside the function are visible to the caller."

## F. Numeric literals

- Integer literals: `0`, `5`, `100` — type is `int`.
- Floating-point literals: `0.0`, `2.4`, `-3.7`, `-1.7`, `3.0`, `2.0`, `-0.9` — type is `double`. The `.0` is required to make a literal `double`.

`0` ≠ `0.0` for type purposes. `0` is `int`; `0.0` is `double`.

## G. Top-10 lexical priorities for Joshua

1. **`&` in parameter lists** — 10+ trace cards on alias semantics.
2. **`{}` in three contexts** — code block vs struct body vs init list.
3. **`[]` in four contexts** — declaration size vs subscript vs parameter type vs array decl.
4. **`=` vs `==`** — assignment vs equality.
5. **`<<` vs `<`**, **`>>` vs `>`** — stream operators vs comparisons.
6. **Trailing `;` after `struct {...};`** — most-forgotten character in C++.
7. **`int` vs `double`** literals (`0` vs `0.0`).
8. **`for ( ; ; )` three-part syntax** — which part runs when.
9. **`void` return type** means no `return <value>`.
10. **`.` for field access** — `data.mystery`, `data.numbers[i]`.

---

<a name="phase-2-memory-variables-types"></a>
# PHASE 2 — MEMORY, VARIABLES, TYPES

## V.1 What is a variable? (the box)

A variable is a labeled box that holds one value at a time.
- The label = name (chosen by programmer).
- The contents = value (changes during execution).

Two operations: **read** (look at contents) and **write** (replace contents).

```
After int x = 5;
+---+
| x |  <- label
+---+
| 5 |  <- value
+---+

After x = 7;
+---+
| x |
+---+
| 7 |  <- 5 was thrown out
+---+
```

## V.2 What is a type? Why does it exist?

The same bit pattern means different things depending on type. Type = "instruction to compiler on how to interpret these bits".

| Type | Holds | Example |
|---|---|---|
| `int` | whole numbers | `5`, `-3`, `0` |
| `double` | decimals | `3.14`, `-0.9`, `0.0` |
| `string` | text | `"hello"` |
| `bool` | true/false | `true`, `false` |

Type also lets the compiler catch errors (`int x = "hello";` is rejected).

## V.3 Declaration vs Initialization vs Assignment

| Form | Meaning |
|---|---|
| `int x;` | DECLARATION — opens box; value is GARBAGE |
| `int x = 5;` | INITIALIZATION — opens box AND fills with 5 atomically |
| `x = 7;` | ASSIGNMENT — replace existing box's contents |

**`int x;` followed by `cout << x;` is a BUG.** Reading garbage = undefined behavior.

## V.4 The `=` operator

`=` is NOT mathematical equality. It is ASSIGNMENT.
- Right side computed FIRST.
- Result stored into left side.
- `x = x + 1;` reads OLD x, adds 1, stores into x.

Equality test is `==` (two equals).

## V.5 `const` modifier

`const int SIZE = 5;` — locks the value. Cannot reassign. Used for array sizes (must be compile-time constant).

## V.6 Identifier rules

Allowed: letters, digits, underscores. First character: letter or underscore (not digit). Case-sensitive. Cannot be a reserved word.

SIT102 conventions: `snake_case` for variables, `UPPER_CASE` for `const`.

## V.7 Scope and lifetime

- **Global scope**: declared outside any function — visible everywhere (e.g., `const int SIZE = 5;` at file top).
- **Function scope**: declared inside a function — visible only inside that function.
- **Block scope**: declared inside `{ }` — visible only inside those braces.

Lifetime = born at declaration, dies at end of scope. Function locals: born when function starts, die when function returns.

## V.8 `int` arithmetic gotcha — INTEGER DIVISION

If both operands of `/` are int, the result is **int** (decimal truncated).
- `7 / 2 == 3` (NOT 3.5)
- `1 / 2 == 0` (NOT 0.5)
- `-7 / 2 == -3` (truncates toward 0)

To get real division: at least one operand must be `double`.
- `7 / 2.0 == 3.5`
- `7.0 / 2 == 3.5`

## V.9 The hand-execute mental model

For every variable, draw a labeled box. As statements execute:
- Declaration → draw a new box, mark contents as `?` if uninitialized.
- Initialization → draw box, write value inside.
- Assignment → cross out old value, write new value beside it.

Do NOT erase. Crossing out preserves the trace.

---

<a name="phase-3-control-flow"></a>
# PHASE 3 — CONTROL FLOW

## C.1 Sequential execution (the default)

Code runs top to bottom, one line at a time. ONE finger, ONE current line. Default: finger moves down by one.

**Three rules**:
1. Only ONE line runs at a time.
2. Each line FINISHES before the next begins.
3. Lines run TOP-TO-BOTTOM unless something jumps.

## C.2 The `if` statement

`if (cond) { body }` — body runs ONLY if cond is true. Otherwise body is skipped. Either way, execution continues at the line after the closing `}`.

`if (cond) { body1 } else { body2 }` — exactly one of body1 or body2 runs. Never both. Never neither.

**Critical for Q1**: comparison is STRICT.
- `2.4 > 0` → true
- `-3.7 > 0` → **false**
- `0 > 0` → **false** (zero is not greater than zero)
- `0 >= 0` → true (zero is equal to zero)

## C.3 `=` vs `==`

| Form | Meaning |
|---|---|
| `=` | assignment (store) |
| `==` | comparison (test equality) |

`if (x = 5)` is a famous bug — assigns 5 to x, then tests if 5 is "true" (it is, because non-zero is true).

## C.4 The `for` loop — MEMORIZE THIS EXACTLY

`for (init; test; increment) { body }`

Execution order:
1. Run `init` ONCE (before anything else)
2. Check `test`. If FALSE, exit (jump past `}`). If TRUE, continue.
3. Run `body`.
4. Run `increment`.
5. Go to step 2.

**Order**: init → test → body → increment → test → body → increment → ... → test (false) → exit.

For `for (i = 0; i < 5; i++)`:
- body runs 5 times with i = 0, 1, 2, 3, 4
- after exit, i == 5 (one past the last valid value)

## C.5 The `++` operator

`i++` adds 1 to i. Equivalent to `i = i + 1` when used as a statement.

In a for-loop's increment slot, `i++` and `++i` behave identically.

## C.6 Function calls

A function is a named, reusable block of code. Calling = "pause where I am, jump into the function, run it, jump back."

When `who_am_i(d)` is called:
1. CPU saves where it is (so it can return).
2. Parameter `data` is BOUND to argument `d` (with `&`, they're aliases).
3. CPU jumps into who_am_i body.
4. Executes function statements sequentially.
5. When `}` reached (end of function), CPU jumps back to line after the call.

## C.7 The four ways the finger moves

| Mechanism | What happens | Where finger goes next |
|---|---|---|
| (default) | Sequential | Next line down |
| `if (cond) { body }` | Branch | Into body if true; past `}` if false |
| `for (...; test; ...) { body }` | Loop | init once; then test/body/inc cycle; exit when test false |
| `f(args)` | Function call | Into f's body; back after `}` |

If you can spot every jump and predict where the finger goes next, you've mastered control flow.

---

<a name="phase-4-compound-types"></a>
# PHASE 4 — COMPOUND TYPES

## CT.1 What is an array?

A SEQUENCE of values, all the same type, all under ONE name. Like a row of labeled boxes.

`double numbers[5];` — 5 boxes, each a double, all called `numbers`.

Access: `numbers[0]`, `numbers[1]`, `numbers[2]`, `numbers[3]`, `numbers[4]`.
- ZERO-INDEXED. First element is `[0]`.
- `numbers[5]` is OUT OF BOUNDS — undefined behavior.
- Size must be a COMPILE-TIME constant (literal or `const int`).

## CT.2 What is a struct?

A user-defined type that BUNDLES multiple values (potentially different types) under one name. Each bundled value is a FIELD.

```cpp
struct stat_double {
  double numbers[SIZE];  // field 1: array
  double mystery;        // field 2: scalar
};
```

**Mandatory `;` after closing `}`** — most forgotten character in C++.

## CT.3 Field access via `.`

To read: `d.mystery` — value of mystery field of d.
To write: `d.mystery = 0.5;` — set mystery field.

## CT.4 Combining: array field of struct

`d.numbers[i]` — i-th element of the numbers array inside struct d.

Parses as: `(d.numbers)[i]` — first access the field, then index into it.

## CT.5 Brace-list initialization

`stat_double d = { {2.4, -3.7, -1.7, 3.0, 2.0}, -0.9};`

- Outer `{...}` initializes the struct.
- Slots inside outer braces fill fields IN DECLARATION ORDER.
- `numbers` is field 1 → first slot is its initializer (an inner `{...}` for the array).
- `mystery` is field 2 → second slot is its initializer (`-0.9`).

Result:
- d.numbers[0] = 2.4
- d.numbers[1] = -3.7
- d.numbers[2] = -1.7
- d.numbers[3] = 3.0
- d.numbers[4] = 2.0
- d.mystery = -0.9

## CT.6 Memory diagram for d

```
d (stat_double):
+----------------------------------------+
| numbers (array of 5 doubles):           |
|   [0]   [1]   [2]   [3]   [4]           |
|  | 2.4 | -3.7| -1.7| 3.0 | 2.0 |        |
|                                          |
| mystery: | -0.9 |                       |
+----------------------------------------+
```

## CT.7 Array of structs (Q4)

`desk_data desks[MAX];` — array of MAX desk_data structs.

`desks[0]` is the first whole struct.
`desks[0].user_id` is the user_id field of the first desk.
`desks[i].field_name` is the composite access: index FIRST, field SECOND.

---

<a name="phase-5-references-functions"></a>
# PHASE 5 — REFERENCES + FUNCTIONS

## RF.1 What is a function?

Named, reusable block of code. Defined ONCE, called MANY times. Takes input via parameters, may produce output via return value or by modifying parameters.

## RF.2 Function definition syntax

```cpp
return_type name(parameter_list) {
  body
}
```

For Test 2 Q1:
```cpp
void who_am_i(stat_double &data) {
  // body
}
```
- `void` = returns nothing
- `who_am_i` = name
- `(stat_double &data)` = one parameter named `data`, type `stat_double` passed by reference
- `{...}` = body

## RF.3 Pass by VALUE vs pass by REFERENCE

**Pass by value (default, no `&`)**:
```cpp
void increment(int x) { x = x + 1; }
int a = 5;
increment(a);
// a is STILL 5 — function modified its own copy
```

**Pass by reference (with `&`)**:
```cpp
void increment(int &x) { x = x + 1; }
int a = 5;
increment(a);
// a is now 6 — x WAS a, same memory
```

The `&` makes the parameter an ALIAS for the caller's variable. Two names, one storage.

## RF.4 Why use pass-by-reference?

1. Efficiency: no copy made (important for large structs).
2. Mutation: function MUST modify caller's variable.

For Q1's who_am_i: the WHOLE POINT is to mutate `d.mystery`. Without `&`, the function would modify a copy and `d` would be unchanged. With `&`, modifying `data.mystery` modifies `d.mystery` directly.

## RF.5 The `&` disambiguation table

| Meaning | Form | On Test 2? |
|---|---|---|
| 1. Reference parameter | `int &x` in parameter list | YES — only this one |
| 2. Address-of | unary `&x` in expression | NO |
| 3. Bitwise AND | `a & b` between values | NO |

For Test 2: every `&` is meaning #1 (reference parameter).

## RF.6 At the call site — NO `&`

When defining: `void who_am_i(stat_double &data)` — `&` in definition.

When calling: `who_am_i(d);` — NO `&` at call site.

Wrong: `who_am_i(&d);` — would be address-of (meaning #2). Type mismatch. Compile error.

## RF.7 The `void` return type

Function returns NO value. Cannot use as part of an expression (`int x = who_am_i(d);` is illegal).

`void` functions end when execution reaches `}` or hits `return;` (no value).

## RF.8 Array parameters

`desk_data &desk_list[]` — array passed by reference. The empty `[]` means "size unknown — caller must pass count separately."

That's why Q3 has TWO parameters: the array AND the count (`int number_to_read`).

At call site: `read_desks(desks, n)` — pass array name (no `&`), pass count.

---

<a name="phase-6-q1-mechanics"></a>
# PHASE 6 — Q1 MECHANICS (the blank attempt #1 question)

This is the question Joshua left blank. We will solve it micro-step by micro-step.

## Q1.1 The literal question

> "Hand execute the code below using this procedure."
>
> Code: `who_am_i` function (sum of positives), called as `who_am_i(d)` with d initialized to `{ {2.4, -3.7, -1.7, 3.0, 2.0}, -0.9 }`.

## Q1.2 What "Hand execute" means

You are pretending to be the CPU. Walk through every line. Update variable values. Predict any output. Report the FINAL state of `d` (especially `d.mystery`).

The TRACE is the deliverable. The final number is a bonus.

## Q1.3 Mark allocation (estimated, ~3 marks for Q1)

| Item | % of Q1 marks |
|---|---|
| Trace table / iteration-by-iteration working | ~70% |
| Final value of d.mystery | ~20% |
| Other state (numbers unchanged, i destroyed) | ~10% |

**Writing only "7.4" with no working = 20%.**
Writing a full trace with a small arithmetic slip = 70-80%.
Writing a clean trace + correct final = 100%.

**Get pen to paper. A messy partial trace beats a beautiful blank page.**

## Q1.4 Setup phase (5 minutes)

**Step 1**: Glance at the code. Identify variables and types:
- d (stat_double): contains numbers[5] (double array) and mystery (double).
- i (inside who_am_i): int loop counter.

**Step 2**: Draw the memory diagram.
```
d:
+-----------+--------+--------+--------+--------+--------+
| numbers   | [0]    | [1]    | [2]    | [3]    | [4]    |
|           |        |        |        |        |        |
+-----------+--------+--------+--------+--------+--------+

| mystery   |        |
+-----------+--------+

| i         |        |
+-----------+--------+
```

**Step 3**: Sketch trace table header.

| iter | i | numbers[i] | condition | action | mystery after |
|------|---|-----------|-----------|--------|---------------|

**Step 4**: Reserve a "FINAL" line at bottom.

## Q1.5 Initialize d from brace-init

`stat_double d = { {2.4, -3.7, -1.7, 3.0, 2.0}, -0.9 };`

- d.numbers[0] = 2.4
- d.numbers[1] = -3.7
- d.numbers[2] = -1.7
- d.numbers[3] = 3.0
- d.numbers[4] = 2.0
- d.mystery = -0.9

Fill the diagram:
```
d:
| numbers | [0]   | [1]   | [2]   | [3]  | [4]  |
|         | 2.4   | -3.7  | -1.7  | 3.0  | 2.0  |

| mystery | -0.9  |
```

## Q1.6 Trace `who_am_i(d)`

**Function call**: control jumps INTO who_am_i. Parameter `data` is now an alias for `d` (because of `&`). Throughout the function, `data` IS `d` — same memory.

**Line `int i;`** — declare local i, uninitialized. Box: `i = ?`

**Line `data.mystery = 0.0;`** — overwrite d.mystery. Cross out -0.9, write 0.0.
- d.mystery: ~~-0.9~~ 0.0

This is the CRITICAL step many students miss. The function OVERWRITES the initial -0.9 to 0.0 BEFORE the loop. The accumulation starts from 0.0, not from -0.9.

**For loop**: `for (i = 0; i < SIZE; i++)`. SIZE = 5.
- init: i = 0 (cross out ?, write 0)
- test: 0 < 5 → TRUE → enter body

## Q1.7 Iteration 0 (i = 0)

Condition: `data.numbers[0] > 0` → `2.4 > 0` → TRUE. Enter if-body.
Body: `data.mystery = data.mystery + data.numbers[0]` = `0.0 + 2.4` = **2.4**.
Cross out 0.0, write 2.4 in mystery box.
Increment: i = 1. Test: 1 < 5 → TRUE.

**Trace row**: | 0 | 0 | 2.4 | 2.4 > 0 = T | mystery += 2.4 | 2.4 |

## Q1.8 Iteration 1 (i = 1)

Condition: `data.numbers[1] > 0` → `-3.7 > 0` → **FALSE**. SKIP body.
mystery unchanged.
Increment: i = 2. Test: 2 < 5 → TRUE.

**Trace row**: | 1 | 1 | -3.7 | -3.7 > 0 = F | skip | 2.4 |

## Q1.9 Iteration 2 (i = 2)

Condition: `-1.7 > 0` → FALSE. SKIP.
Increment: i = 3.

**Trace row**: | 2 | 2 | -1.7 | -1.7 > 0 = F | skip | 2.4 |

## Q1.10 Iteration 3 (i = 3)

Condition: `3.0 > 0` → TRUE.
Body: `mystery = 2.4 + 3.0` = **5.4**.
Cross out 2.4, write 5.4.
Increment: i = 4.

**Trace row**: | 3 | 3 | 3.0 | 3.0 > 0 = T | mystery += 3.0 | 5.4 |

## Q1.11 Iteration 4 (i = 4)

Condition: `2.0 > 0` → TRUE.
Body: `mystery = 5.4 + 2.0` = **7.4**.
Cross out 5.4, write 7.4.
Increment: i = 5. Test: 5 < 5 → FALSE → EXIT loop.

**Trace row**: | 4 | 4 | 2.0 | 2.0 > 0 = T | mystery += 2.0 | 7.4 |
**Exit row**: | (after) | 5 | — | 5 < 5 = F | exit | 7.4 |

## Q1.12 Function returns

End of who_am_i body. Local `i` destroyed. Control returns to caller.

`d` persists (declared in caller). Final state:
- d.numbers = {2.4, -3.7, -1.7, 3.0, 2.0} (UNCHANGED)
- **d.mystery = 7.4**
- Local i: destroyed.
- Terminal output: NONE (who_am_i has no cout calls).

## Q1.13 The full trace table (what you write on the answer sheet)

| iteration | i | data.numbers[i] | condition | action | d.mystery after |
|-----------|---|-----------------|-----------|--------|-----------------|
| (before loop) | — | — | — | data.mystery = 0.0 | 0.0 |
| 0 | 0 | 2.4 | 2.4 > 0 = T | mystery += 2.4 | 2.4 |
| 1 | 1 | -3.7 | -3.7 > 0 = F | skip | 2.4 |
| 2 | 2 | -1.7 | -1.7 > 0 = F | skip | 2.4 |
| 3 | 3 | 3.0 | 3.0 > 0 = T | mystery += 3.0 | 5.4 |
| 4 | 4 | 2.0 | 2.0 > 0 = T | mystery += 2.0 | 7.4 |
| (after loop, i=5) | 5 | — | 5 < 5 = F | exit | 7.4 |

**FINAL**: `d.mystery = 7.4`. d.numbers unchanged. Terminal: none.

## Q1.14 Mistakes Joshua MUST avoid

1. **Including -0.9 in the sum**. The line `data.mystery = 0.0;` overwrites -0.9. If you forget, you compute -0.9 + 2.4 + 3.0 + 2.0 = 6.5. WRONG.
2. **Including -3.7 or -1.7**. The if-condition filters them. If you ignore the if, you get 2.4 - 3.7 - 1.7 + 3.0 + 2.0 = 2.0. WRONG.
3. **Off-by-one**. Loop runs 5 times for i = 0,1,2,3,4. Not 6 times, not 4 times.
4. **Misreading `> 0`**. Strict greater-than. `0 > 0` is FALSE, not true.
5. **Forgetting the `&`**. Without `&`, d.mystery would be unchanged (function modifies a copy). Result of cout would be -0.9. With `&`, result is 7.4.
6. **Off-by-one on i exit**. After loop, i = 5 (not 4).
7. **Inventing terminal output**. who_am_i has no cout. Terminal is NONE.

## Q1.15 Pattern recognition shortcut

Algorithm shape: `result = 0; for(i...) if (x[i] > 0) result += x[i];` = sum of positives.

Sanity check: positives in {2.4, -3.7, -1.7, 3.0, 2.0} are 2.4, 3.0, 2.0. Sum = 7.4. ✓ Matches trace.

## Q1.16 Time budget for Q1 on the actual exam

| Phase | Time |
|---|---|
| Read question carefully | 0-5 min |
| Setup memory diagram + trace table | 5-7 min |
| Walk 5 iterations | 7-15 min |
| Verify (sanity check pattern) | 15-18 min |
| Write up neatly | 18-22 min |

Total: ~22 minutes. Move to Q2 with confidence.

## Q1.17 100% mastery for Q1

You see the code. Within 30 seconds: "stat_double struct, by-ref function, sum-of-positives loop, init at -0.9. Function resets to 0.0 first. Sum of {2.4, 3.0, 2.0} = 7.4. Answer: d.mystery = 7.4."

You set up the trace in 90 seconds. You walk 5 iterations in 5 minutes. Sanity check matches prediction. You write up the trace table neatly. Total: 12 minutes. You move to Q2.

---

<a name="phase-7-q2-mechanics"></a>
# PHASE 7 — Q2 MECHANICS (struct write)

## Q2.1 The literal question

> "You are creating a system for managing a desk of desks. The following fields are needed to represent a desk: (1) id of current users; (2) a desk id; (3) number of screens. Write a data structure named `desk_data` to capture these fields."

## Q2.2 Reading the question

Three constraints:
1. **"data structure named `desk_data`"** — write `struct desk_data`. NOT `class`, NOT `typedef`. Exactly `desk_data` (lowercase, snake_case).
2. **"following fields are needed"** — exactly 3 fields. Not 2, not 4.
3. **"to represent a desk"** — singular. Each instance = one desk.

## Q2.3 Decide each field's C++ type

| English | C++ type | Field name |
|---|---|---|
| "id of current users" | `int` (numeric identifier) | `user_id` |
| "a desk id" | `int` | `desk_id` |
| "number of screens" | `int` (count) | `number_of_screens` |

All three are `int` because the spec describes integer-shaped data.

## Q2.4 The canonical answer

```cpp
struct desk_data {
  int user_id;
  int desk_id;
  int number_of_screens;
};
```

5 lines. 64 characters. ~10 marks.

## Q2.5 Step-by-step writing on paper

| Step | Action |
|---|---|
| a | Write `struct` (lowercase) |
| b | Space, then `desk_data` |
| c | Space, then `{` |
| d | New line, indent 2-4 spaces |
| e | `int user_id;` |
| f | New line, same indent |
| g | `int desk_id;` |
| h | New line, same indent |
| i | `int number_of_screens;` |
| j | New line, dedent |
| k | `};` (BRACE AND SEMICOLON) |

## Q2.6 The CRITICAL trailing semicolon

`};` not `}`. The semicolon is part of the struct definition statement. **Most-forgotten character in C++.**

If you forget, the compiler error points at the NEXT line and is confusing. On paper, the marker sees `}` and instantly deducts.

**Drill**: write 20 copies of `};` on scratch before exam. Burn it into muscle memory.

## Q2.7 SIT102 naming conventions

- `snake_case` for fields: `user_id`, `desk_id`, `number_of_screens`.
- NOT `userId` (camelCase).
- NOT `UserId` (PascalCase).
- NOT `USER_ID` (SCREAMING — only for `const`).

Match field names to English: "number of screens" → `number_of_screens` (each space → underscore).

## Q2.8 Common Q2 mistakes

1. Forget `;` after `}`.
2. camelCase fields.
3. Wrong struct name (`Desk_Data`, `desk`, etc.).
4. Missing fields (only 2 of 3).
5. Extra invented fields (4th `bool occupied`).
6. Wrong types (string for "id" when int is canonical).
7. Wrong order (rearranged fields).
8. Capitalizing keywords (`Struct`, `Int`).

## Q2.9 Time budget for Q2

| Phase | Time |
|---|---|
| Read spec | 1 min |
| Decide types | 1 min |
| Write struct | 5 min |
| Verify `;` after `}` | 1 min |
| Cross-check with Q3/Q4 | 2 min |

Total: 10 minutes for ~10 marks. Easiest question on the paper.

## Q2.10 100% mastery for Q2

Read prompt → 5 seconds later, full struct in head. Write in 60 seconds. Trailing `;` is automatic muscle memory. Move to Q3.

---

<a name="phase-8-q3q4-mechanics"></a>
# PHASE 8 — Q3+Q4 MECHANICS

## PART A — Q3 (read_desks)

### Q3.1 The literal question

> "Write a function to read in the information for a `number_to_read` number of desks into `desk_list`."
>
> Given signature: `void read_desks ( desk_data &desk_list [], int number_to_read )`

### Q3.2 Parsing the signature

| Token | Meaning |
|---|---|
| `void` | returns nothing — no return statement |
| `read_desks` | function name (given — don't change) |
| `desk_data &desk_list[]` | first parameter: array of desk_data, BY REFERENCE |
| `int number_to_read` | second parameter: count |

`&` on array parameter → modifications inside function visible to caller.
`[]` empty → size unknown; must use the count parameter.

### Q3.3 The body skeleton (memorize)

```cpp
{
    int i;
    for (i = 0; i < number_to_read; i++) {
        cin >> desk_list[i].user_id;
        cin >> desk_list[i].desk_id;
        cin >> desk_list[i].number_of_screens;
    }
}
```

### Q3.4 Step-by-step writing

| Step | Action |
|---|---|
| a | Open body `{` |
| b | `int i;` |
| c | `for (i = 0; i < number_to_read; i++) {` |
| d | `cin >> desk_list[i].user_id;` |
| e | `cin >> desk_list[i].desk_id;` |
| f | `cin >> desk_list[i].number_of_screens;` |
| g | Close for-body `}` |
| h | Close function-body `}` |

### Q3.5 CRITICAL: NO cout in read function

Q3 V2.0 contract: read functions are PURE INPUT, no print. The CALLER (Q4 main) handles prompts.

If you add `cout << "Enter user id:";` you may lose marks. Stick to pure cin.

### Q3.6 Field names MUST match Q2

If Q2 says `user_id`, write `desk_list[i].user_id`. Case-sensitive. Spelling-sensitive.

**Defensive move**: glance at Q2 before writing Q3. Don't trust memory.

### Q3.7 Common Q3 mistakes

1. Missing `[i]`: `cin >> desk_list.user_id;` (compile error).
2. Missing `.field`: `cin >> desk_list[i];` (likely fails).
3. Wrong direction: `cout` instead of `cin`.
4. Wrong loop bound: `i < SIZE` instead of `i < number_to_read`.
5. Adding `return` (function is void).
6. Adding cout prompts.

### Q3.8 Memorization template

```
void read_X(X_data &list_param[], int count_param) {
    int i;
    for (i = 0; i < count_param; i++) {
        cin >> list_param[i].field1;
        cin >> list_param[i].field2;
        cin >> list_param[i].field3;
    }
}
```

## PART B — Q4 (main)

### Q4.1 The literal question

> "Write the main function which asks the user for `desk_num` number of desks. Then call your `read_desks` function to read in for `desk_num` desks. Finally, print the list of desks."
>
> Skeleton given with `MAX = 100`, `desks[MAX]`, `desk_num`, and 3 comment markers.

### Q4.2 The 3 sections to fill

#### Section 1: Ask for number of desks

```cpp
cout << "Enter number of desks: ";
cin >> desk_num;
```

- cout prompt (no endl — user types on same line).
- cin reads count into desk_num.

#### Section 2: Read in desk list

```cpp
read_desks(desks, desk_num);
```

- Function name matches Q3.
- First arg: `desks` (array name — NO `&` at call site!).
- Second arg: `desk_num` (NOT `MAX`!).

### Q4.3 CRITICAL: `desk_num` vs `MAX`

| Variable | Meaning | Used where |
|---|---|---|
| `MAX` (= 100) | Array CAPACITY | Only in `desks[MAX]` declaration |
| `desk_num` | Actual count user entered | Pass to read_desks; loop bound |

**Wrong**: `read_desks(desks, MAX);` — reads 100 desks of garbage input.
**Wrong**: `for (i = 0; i < MAX; i++)` — prints 100 garbage rows.

ALWAYS pass `desk_num`. ALWAYS loop to `desk_num`.

Mnemonic: **"MAX is the BOX. desk_num is the STUFF."**

#### Section 3: Print list of desks

```cpp
for (int i = 0; i < desk_num; i++) {
    cout << "User ID: "    << desks[i].user_id           << endl;
    cout << "Desk ID: "    << desks[i].desk_id           << endl;
    cout << "Screens: "    << desks[i].number_of_screens << endl;
}
```

- Loop bound: `desk_num`, NOT `MAX`.
- Three cout lines per desk (one per field).
- Each ends with `endl`.

### Q4.4 Don't forget `return 0;`

After the print loop, before main's closing `}`. Indicates successful exit.

### Q4.5 Full canonical Q4

```cpp
int main()
{
    const int    MAX = 100;
    desk_data    desks[MAX];
    int          desk_num;

    cout << "Enter number of desks: ";
    cin >> desk_num;

    read_desks(desks, desk_num);

    for (int i = 0; i < desk_num; i++) {
        cout << "User ID: " << desks[i].user_id << endl;
        cout << "Desk ID: " << desks[i].desk_id << endl;
        cout << "Screens: " << desks[i].number_of_screens << endl;
    }

    return 0;
}
```

### Q4.6 Common Q4 mistakes

1. Pass `MAX` instead of `desk_num` to read_desks.
2. Loop to `MAX` instead of `desk_num` for print.
3. Forget `return 0;`.
4. `&desks` at call site (compile error).
5. Wrong field names (mismatch with Q2).
6. Forget `endl` (output runs together).

### Q4.7 Time budget

| Q | Time |
|---|---|
| Q3 | 15-25 min |
| Q4 | 20-30 min |

### Q4.8 Strategy: Q3 BEFORE Q4

Q4 calls read_desks. Doing Q3 first ensures the function name and signature are fresh in memory when you write the call site.

### Q4.9 Cross-question consistency

Field names from Q2 must appear in Q3 cin lines AND Q4 print loop. Glance back at Q2 each time you reference a field.

---

<a name="phase-9-exam-mechanics"></a>
# PHASE 9 — EXAM MECHANICS

## E.1 What the paper looks like

Two pages. Q1 on page 1 (code + "Hand execute" instruction). Q2/Q3/Q4 on page 2. You write answers in blank space below each question. Pencil/pen on paper.

## E.2 Marking estimate

| Q | Marks (~) | What earns marks |
|---|---|---|
| Q1 | ~3 | trace table (70%) + final value (20%) + other state (10%) |
| Q2 | ~2 | struct keyword + name + braces (50%) + correct fields (50%) |
| Q3 | ~2 | signature + loop + cin lines + composite indexing |
| Q4 | ~3 | prompt+read + function call + print loop + return 0 |

## E.3 Time on exam

90 minutes total.

| Q | Recommended | Aggressive |
|---|---|---|
| Q1 | 25 min | 20 min |
| Q2 | 10 min | 5 min |
| Q3 | 25 min | 20 min |
| Q4 | 30 min | 25 min |
| Buffer | 0 | 20 min |

**Don't get stuck.** Move on if blocked. Come back later if time permits.

**Recommended order**: Q2 (fastest, easy marks) → Q4 (highest value, structured) → Q3 → Q1 (most error-prone).

## E.4 What to write where

Q1: trace table + final values
Q2: full struct definition with `};`
Q3: function body filling the given signature
Q4: 3 sections filled in the skeleton

## E.5 Tidiness rules

- Pencil for Q1 (you'll cross out as you trace). Pen for Q2-Q4 (write-once).
- Box your trace table (clear column lines).
- Cross out, don't scribble (one straight line through old value, write new beside it).
- Don't erase (paper tears, original disappears).
- Indent C++ code on paper (4 spaces per level).
- Match braces: write `}` immediately when you write `{`.

## E.6 Partial credit strategy

**Always write something. Blank = 0 marks.**

- Correct struct keyword + name + braces, wrong fields = ~50%.
- Correct for-loop header, empty body = ~30%.
- Correct prompt+cin, empty rest of Q4 = ~30%.
- Trace iteration 0 only, freeze = ~15%.

If unsure: write pseudocode in English, label `// my best understanding:`, move on. Sympathy marks exist.

## E.7 Aaron + resits

| Attempt | Date | Status |
|---|---|---|
| 1 | 2026-05-07 | DONE — blank |
| 2 | 2026-05-14 | Booked — Redo path |
| 3 | 2026-05-21 | Backup |

All 11am at KE1.207.

- Same-day Fix-and-Resubmit possible if Aaron marks 12:50-14:00.
- OnTrack mid-week alternative.

**Treat May 14 as the real attempt. May 21 is insurance.**

---

<a name="phase-10-reverse-engineered-curriculum"></a>
# PHASE 10 — THE REVERSE-ENGINEERED CURRICULUM

The ordered learning path. 0% = blank slate (will leave all blank). 100% = solving in sleep.

For each step: 0% mastery look, drill needed, 100% mastery look, est. card count, atom IDs in cpp-t2 app.

## PHASE A — PRE-CODE (no C++ at all yet)

| Step | What | 0% look | Drill | 100% look | Cards | Atoms |
|---|---|---|---|---|---|---|
| A.1 | Computer/program/memory/variable | Variable looks like just a number | Memorize cards | Picture labeled box with value | 10 | F-01, F-02 |
| A.2 | Sequential execution | Reads code as if all-at-once | Walkthrough cards | Finger walks line by line | 15 | F-03 |
| A.3 | Hand-execute / trace | Writes only final answer | Demo + trace cards | Auto-draws trace table | 20 | F-03, F-23 |

## PHASE B — BASIC C++ SYNTAX

| Step | What | Cards | Atoms |
|---|---|---|---|
| B.1 | C++ file shell (`#include`, `using`, `int main`) | 15 | F-04, F-05, F-06 |
| B.2 | Statement + semicolon | 10 | F-07 |
| B.3 | Code blocks `{}` + scope | 15 | F-08 |
| B.4 | Comments `//` | 5 | F-01 |

## PHASE C — VARIABLES AND TYPES

| Step | What | Cards | Atoms |
|---|---|---|---|
| C.1 | Declaration `int x;` | 10 | F-11 |
| C.2 | Initialization `int x = 5;` | 10 | F-11 |
| C.3 | Assignment `x = 7;` | 15 | F-12 |
| C.4 | int / double / bool / string | 25 | F-10 |
| C.5 | const | 5 | F-18 |

## PHASE D — OPERATORS

| Step | What | Cards | Atoms |
|---|---|---|---|
| D.1 | Arithmetic + - * / % | 30 | F-12 |
| D.2 | Comparison > < >= <= == != | 15 | F-16 |
| D.3 | Assignment = (vs ==) | 10 | F-12, F-16 |
| D.4 | Operator precedence | 20 | F-12 |
| D.5 | Increment ++ | 10 | F-18 |

## PHASE E — CONTROL FLOW

| Step | What | Cards | Atoms |
|---|---|---|---|
| E.1 | Sequential execution | 10 | F-03 |
| E.2 | if-statements | 20 | F-17 |
| E.3 | for-loops (init/test/inc/body) | 80 | F-18, F-18a, F-18b |
| E.4 | Loop trace methodology | 100 | L1 trace cards |

## PHASE F — COMPOUND TYPES

| Step | What | Cards | Atoms |
|---|---|---|---|
| F.1 | Arrays | 25 | F-19 |
| F.2 | Structs | 80 | F-20 |
| F.3 | Field access via `.` | 15 | F-21 |
| F.4 | Struct with array field, array of structs | 30 | F-21 |
| F.5 | Brace-init | 20 | F-19, F-20 |

## PHASE G — FUNCTIONS

| Step | What | Cards | Atoms |
|---|---|---|---|
| G.1 | Function definition | 30 | F-22a |
| G.2 | Function call | 15 | F-22a |
| G.3 | Pass-by-value | 20 | F-22b |
| G.4 | Pass-by-reference (`&`) | 50 | F-22b, F-22c, F-22d (the RDS suite) |
| G.5 | void return | 5 | F-22a |
| G.6 | return statement | 15 | F-22a |

## PHASE H — I/O

| Step | What | Cards | Atoms |
|---|---|---|---|
| H.1 | cout for output | 10 | F-13, F-13a, F-13b |
| H.2 | cin for input | 10 | F-14, F-14a, F-14b |
| H.3 | endl | 5 | F-13b |
| H.4 | Chained cout | 10 | F-13b |
| H.5 | Chained cin / multi-read | 10 | F-14b |

## PHASE I — Q1 HAND-EXECUTE (L1 in cpp-t2)

| Step | What | Cards | Atoms |
|---|---|---|---|
| I.1 | Read code, identify variables | 20 | T-00 |
| I.2 | Set up trace table | 15 | T-00 |
| I.3 | Process initialization | 15 | T-03 |
| I.4 | Walk loop iteration by iteration | 80 | T-04 (the bulk) |
| I.5 | Compute conditions, branches, accumulator | 50 | T-05 |
| I.6 | Report final values | 20 | T-08 |

L1 total: ~836 cards in cpp-t2.

## PHASE J — Q2 STRUCT WRITE (L2)

| Step | What | Cards | Atoms |
|---|---|---|---|
| J.1 | Parse English spec | 20 | L-21 |
| J.2 | Map English → C++ types | 25 | L-23a |
| J.3 | snake_case names matching English | 10 | L-23b |
| J.4 | Write struct + `};` | 30 | L-21, L-22 |

L2 total: ~259 cards in cpp-t2.

## PHASE K — Q3 READ FUNCTION (L3)

| Step | What | Cards | Atoms |
|---|---|---|---|
| K.1 | Parse signature | 30 | R-00, R-02a |
| K.2 | `int i;` loop counter | 10 | R-01 |
| K.3 | for-loop with count_param | 25 | R-02b |
| K.4 | cin >> arr[i].field per field | 30 | R-02c, R-02d, R-02e |
| K.5 | NO cout (V2.0 contract) | 15 | R-00 |

L3 total: ~430 cards in cpp-t2 (162 had cout stripped 2026-05-08).

## PHASE L — Q4 MAIN (L4)

| Step | What | Cards | Atoms |
|---|---|---|---|
| L.1 | Parse skeleton | 15 | Q-00 |
| L.2 | Section 1: prompt + cin | 15 | Q-04 |
| L.3 | Section 2: call read_X (no `&`, no MAX) | 25 | Q-05 |
| L.4 | Section 3: print loop with desk_num | 30 | Q-06 |
| L.5 | return 0; | 5 | Q-07 |

L4 total: ~403 cards in cpp-t2.

## PHASE M — INTEGRATION & SPEED (L5)

| Step | What | Cards | Atoms |
|---|---|---|---|
| M.1 | Full mock under time pressure | 5 mocks | M-01 |
| M.2 | Identify weak areas, drill | varies | depends |
| M.3 | Repeat until ≥7/10 on 3 in a row | varies | M-01 to M-04 |

L5 total: ~83 cards (mocks).

## PHASE TOTAL

| Phase | Cards |
|---|---|
| A. Pre-code | 45 |
| B. Basic syntax | 45 |
| C. Variables and types | 75 |
| D. Operators | 85 |
| E. Control flow | 240 |
| F. Compound types | 180 |
| G. Functions | 135 |
| H. I/O | 50 |
| I. Q1 hand-execute | 220 |
| J. Q2 struct | 95 |
| K. Q3 read function | 130 |
| L. Q4 main | 90 |
| M. Integration | 30+ mocks |
| **Total** | **~1,420 cards + 30 mocks** |

cpp-t2 has 2,528 cards across L0-L5 — roughly 1.7x the minimum needed. Surplus capacity for repetition and weakness drilling.

## RECOMMENDED 6-DAY PATH (May 8 → May 14)

| Day | Date | Phases | Cards |
|---|---|---|---|
| 1 | May 8 | A-C: pre-code + syntax + types | ~165 |
| 2 | May 9 | D-E: operators + control flow | ~325 |
| 3 | May 10 | F-H: compound types + functions + I/O | ~365 |
| 4 | May 11 | I (Q1) | ~220 |
| 5 | May 12 | J-K (Q2-Q3) | ~225 |
| 6 | May 13 | L (Q4) + M (mocks) | ~120 + 2-3 mocks |
| Test | May 14 | Light review only | — |

~4 hours focused drill per day. Matches cpp-t2's 56-hour student budget.

## THE BAR FOR PASSING

Pass = ~5/10. NOT 10/10. You can pass with:

**Comfortable pass**: Q1 mostly right (3/3), Q2 right (2/2), Q3 half (1/2), Q4 half (1.5/3) = 7.5/10.

**Borderline pass**: Q1 partial (1.5/3), Q2 right (2/2), Q3 partial (1/2), Q4 partial (1/3) = 5.5/10.

You don't need to ace this. You need to write SOMETHING coherent on every question. The cpp-t2 app is overpowered for this — its 2,528 cards target "solving in sleep," well past pass-level.

**Lower the stakes mentally. May 7 was blank. May 14 just needs to NOT BE BLANK.**

---

# CLOSING

The four jumps in Q1's program (the entire control flow):
1. main → who_am_i (function call)
2. if-test false → skip body (twice — iterations 1 and 2)
3. for-loop tests true → repeat body (5 times)
4. for-loop test false → exit (after iteration 5)
5. who_am_i → main (function return)

Master the four jumps + the variable-box mental model + the type system + the 14 lexical token classes + the hand-execute methodology, and Q1 becomes mechanical.

The blank attempt #1 was not a failure of intelligence. It was a failure of MENTAL MODEL. The model is now installed. Practice on the cpp-t2 PWA. Sit May 14. Pass. Done.

The Q1 V2.0 final answer is **`d.mystery = 7.4`**.
