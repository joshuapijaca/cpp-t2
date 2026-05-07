# Compound Types Primer (SIT102 Test 2)

> Zero programming knowledge assumed. By the end of this primer, you will fluently read and write arrays, structs, struct fields, struct arrays, brace-list initialization, and combined access patterns like `desks[i].user_id` and `d.numbers[k]`. These are the four building blocks Test 2 is made of.

---

## 0. Why this matters

Open the Test 2 question paper. Look at Q1 and Q4. Almost every line uses one of:

- `d.numbers[i]` — read element `i` of an array `numbers` that lives inside a struct `d`
- `desks[i].user_id` — read field `user_id` of struct `i` inside an array of structs
- `stat_double d = { {2.4, -3.7, ...}, -0.9 };` — initialize a struct that contains an array

If those three lines look like alphabet soup, you can't pass Test 2. By the end of this primer, they should look like ordinary English sentences. That's the goal.

We're going to build up from "what is a value" → "what is an array" → "what is a struct" → "what is a struct that contains an array" → "what is an array of structs". Each step adds exactly one new idea. No shortcuts.

---

## 1. What is an array?

### 1.1 Plain English definition

An **array** is a sequence of values, all the same type, all stored under one name.

Think of a row of identical labeled boxes lined up next to each other:

```
[ box 0 ][ box 1 ][ box 2 ][ box 3 ][ box 4 ]
```

- The whole row has ONE name (e.g. `numbers`).
- Each box holds ONE value of the SAME type (e.g. all `double`).
- The number of boxes is fixed when you create the array.
- Each box has a position number called the **index**.

That's it. An array is a named row of same-typed boxes. Nothing more.

### 1.2 Why have arrays?

Without arrays, if you wanted to store five test scores you'd write:

```cpp
double score_a;
double score_b;
double score_c;
double score_d;
double score_e;
```

Five different names, none of them connected. You can't loop over them. You can't pass them around as a group. You can't say "give me the third one" without writing five `if` statements.

With an array:

```cpp
double scores[5];
```

One name. Five values. You can ask for `scores[2]` and the computer hands you the third one. You can run a loop from 0 to 4 and visit each one.

### 1.3 The rule: same type

Every box in the array MUST hold the same type of value. You can't have an array where box 0 is a `double` and box 1 is a `string`. If you say `double numbers[5];`, all five boxes are doubles. Forever. No exceptions.

### 1.4 What blank-slate misses (0% mastery)

If you've never seen an array before, you might think:
- "It's a list" — close, but a C++ array has a FIXED size you can't grow.
- "It's a variable" — yes and no. The whole array is one named thing, but each box also has an address you access with `[index]`.
- "I just write `numbers` and that's the value" — no. `numbers` alone is the array as a whole. To get a single value you must say `numbers[0]` or `numbers[1]` etc.

### 1.5 What 100% mastery looks like

When someone says "array" you immediately think: **fixed-size row of identical-type boxes, accessed by integer index, zero-indexed, written with square brackets**.

---

## 2. Array declaration in C++

### 2.1 The syntax

```cpp
double numbers[5];
```

Read this from left to right:
- `double` — the TYPE of each element (every box holds a double)
- `numbers` — the NAME of the array (you choose this)
- `[5]` — the SIZE (this array has exactly 5 boxes)
- `;` — end of statement

That single line creates 5 boxes named `numbers[0]`, `numbers[1]`, `numbers[2]`, `numbers[3]`, `numbers[4]`, each ready to hold a double.

### 2.2 Using a constant for size

In Test 2 you'll often see:

```cpp
const int SIZE = 5;
double numbers[SIZE];
```

This is the same as `double numbers[5];`. The line `const int SIZE = 5;` says "SIZE is a constant integer with value 5". When the compiler reads `numbers[SIZE]` it substitutes the 5. The array still has 5 boxes.

Why use `SIZE` instead of just `5`? So if you later decide you need 10 elements, you change one line (`const int SIZE = 10;`) instead of hunting through the whole program.

### 2.3 The rule: size must be a compile-time constant

The number inside the brackets at declaration time has to be known when the program is compiled, not when it runs. So:

```cpp
double a[5];          // ok — 5 is a literal
const int N = 5;
double b[N];          // ok — N is a const int

int n = 5;
double c[n];          // NOT standard C++ — n is a regular int variable
```

Some compilers (gcc) accept the third one as an extension, but for Test 2 you should treat **`int n = 5; double c[n];` as wrong**. Always use a literal or a `const int`.

### 2.4 Memory diagram after declaration

After `double numbers[5];`, you have:

```
numbers (array of 5 doubles, uninitialized):
┌────────┬────────┬────────┬────────┬────────┐
│   ?    │   ?    │   ?    │   ?    │   ?    │
└────────┴────────┴────────┴────────┴────────┘
   [0]      [1]      [2]      [3]      [4]
```

The `?` symbols mean **garbage** — whatever bits happened to be in that memory before. C++ does NOT zero arrays for you. If you read `numbers[0]` before assigning to it, you get whatever junk was there. This is one of the nastiest bugs in the language. Always initialize before reading.

### 2.5 Common confusion

- "Why doesn't it just start at index 1?" Because computers count from zero. (See section 4.)
- "I declared `numbers[5]` so `numbers[5]` should be valid." NO. `numbers[5]` is the SIXTH element, which doesn't exist. Off-by-one bug.
- "The size has to be 5, right?" The size can be any positive integer constant. 5 is just an example.

### 2.6 0% / 100% mastery checkpoint

- 0%: you read `double numbers[5];` and don't know whether 5 is the size or an index.
- 100%: you read it and instantly see "5 boxes of double, indices 0 through 4".

---

## 3. Array indexing

### 3.1 The syntax: `array[index]`

To read or write a specific element you write the array name followed by the index in square brackets.

```cpp
double numbers[5];

numbers[0] = 1.0;     // write to box 0
numbers[1] = 2.5;     // write to box 1
numbers[4] = 9.9;     // write to box 4 (the last box of a 5-element array)

double x = numbers[0];   // read box 0 into x
```

### 3.2 Indices start at zero

This is the rule that trips up every beginner. Read it slowly:

- The FIRST element is at index **0**, not 1.
- The SECOND element is at index **1**.
- The THIRD element is at index **2**.
- ...
- The N-th element is at index **N-1**.
- The LAST element of an N-element array is at index **N-1**.

For a 5-element array `numbers[5]`:

```
numbers[0]  ← FIRST
numbers[1]  ← second
numbers[2]  ← third (the middle one)
numbers[3]  ← fourth
numbers[4]  ← LAST
```

`numbers[5]` does NOT exist. There are only 5 boxes (numbered 0 to 4). Asking for box 5 is asking for a box that's not there.

### 3.3 Out of bounds = undefined behavior

When you ask for `numbers[5]` (or any index outside the valid range), C++ does NOT crash, throw an exception, or warn you. It just reads whatever is sitting in memory after the array. The program might:
- give you a garbage number,
- print zero by coincidence,
- crash several lines later,
- corrupt some other variable,
- run perfectly today and crash tomorrow.

This is called **undefined behavior** and it's the #1 source of mysterious bugs in C and C++. The compiler trusts you to stay in bounds.

### 3.4 ASCII diagram of indexing

```
double numbers[5] = { 2.4, -3.7, -1.7, 3.0, 2.0 };

  numbers[0]   numbers[1]   numbers[2]   numbers[3]   numbers[4]
     ↓            ↓            ↓            ↓            ↓
  ┌──────┐   ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐
  │ 2.4  │   │-3.7  │    │-1.7  │    │ 3.0  │    │ 2.0  │
  └──────┘   └──────┘    └──────┘    └──────┘    └──────┘
   index 0    index 1     index 2     index 3     index 4
                                                        ↑
                                                        last
                                                  (numbers[5] is OUT OF BOUNDS)
```

### 3.5 Indexing with a variable

You don't have to write a literal index. You can use any int expression:

```cpp
int i = 2;
double x = numbers[i];        // numbers[2], which is -1.7

for (int i = 0; i < 5; i++) {
    cout << numbers[i] << endl;   // prints all 5 values in order
}
```

This is the WHOLE POINT of arrays. The for-loop visits every element by counting `i` up from 0 to 4. If you didn't have arrays, you couldn't write a single loop to handle all five values.

### 3.6 The condition `i < 5` (not `i <= 5`)

In `for (int i = 0; i < 5; i++)` the condition is `i < 5`, NOT `i <= 5`. Because `i = 5` would access `numbers[5]` which is out of bounds.

The general pattern: for an array of size N, loop `for (int i = 0; i < N; i++)`. Strictly less than. Never less-or-equal.

### 3.7 0% / 100% mastery checkpoint

- 0%: you see `numbers[2]` and aren't sure if it's the second or third element.
- 100%: you see `numbers[2]` and instantly think "third element, the one in the middle of a 5-element array".

---

## 4. Why zero-indexed?

This isn't really tested, but understanding WHY makes it stick.

The number in brackets is not "the position of the box counting from 1". It's the **offset** from the start of the array.

Imagine the array sitting in memory at address 1000:

```
address:  1000   1008   1016   1024   1032
content:  [2.4][-3.7][-1.7][ 3.0][ 2.0]
index:      0     1     2     3     4
```

- `numbers` is shorthand for "the address 1000".
- `numbers[0]` means "go 0 doubles forward from 1000" → address 1000 → value 2.4.
- `numbers[1]` means "go 1 double forward from 1000" → address 1008 → value -3.7.
- `numbers[i]` means "go i doubles forward from 1000".

The first element is at offset 0 from the start because it's already at the start. Counting starts at 0 because that's how addresses work.

You don't need to memorize this — but if zero-indexing ever feels arbitrary, remember: it's just "how many steps from the start". Zero steps means you're standing on the first element.

This is a **strict rule**. Even when it feels weird, even when English says "the first one", in C++ that's `[0]`. Always.

---

## 5. What is a struct?

### 5.1 Plain English definition

A **struct** is a composite type that groups several variables under one name.

Think of an array as "many boxes of the SAME type under one name". A struct is "several boxes of POSSIBLY DIFFERENT types under one name". Each box in a struct is called a **field** (or **member**).

### 5.2 Why have structs?

Suppose you want to track a desk: who's using it, its ID, how many monitors. Without structs:

```cpp
int user_id;
int desk_id;
int number_of_screens;
```

Three separate variables that happen to relate to one desk. Now imagine you want to track 100 desks. You'd need 300 variables and you'd have to manually keep track of which user_id goes with which desk_id. Disaster.

With a struct:

```cpp
struct desk_data {
    int user_id;
    int desk_id;
    int number_of_screens;
};

desk_data my_desk;
my_desk.user_id = 42;
my_desk.desk_id = 7;
my_desk.number_of_screens = 2;
```

Now `my_desk` is one thing that contains all three values together. You can pass `my_desk` to a function as a single argument, copy it, put it in an array, etc.

### 5.3 The rule: fields can be different types

Unlike arrays, the fields of a struct don't have to be the same type:

```cpp
struct stat_double {
    double numbers[5];   // an array of 5 doubles
    double mystery;      // a single double
};
```

Field 1 is an array; field 2 is a single double. That's fine. A struct just groups things.

### 5.4 What blank-slate misses (0% mastery)

- "Is `desk_data` a variable?" No. It's a TYPE — like `int` or `double`. You then make variables OF that type: `desk_data my_desk;`.
- "Is the struct one big variable?" The variable IS one thing, but it has named pieces inside (the fields).
- "Can I just write `my_desk` to get the user_id?" No. `my_desk` is the whole struct. To get a field you must say `my_desk.user_id`.

### 5.5 What 100% mastery looks like

When someone says "struct" you immediately think: **a named bundle of named fields, each field has its own type, accessed with the dot operator, the struct itself is a TYPE you can declare variables of**.

---

## 6. Struct definition syntax

### 6.1 The full syntax, piece by piece

```cpp
struct stat_double {
    double numbers[SIZE];
    double mystery;
};
```

Read it from top to bottom:

1. **`struct`** — keyword that says "I'm about to define a new struct type".
2. **`stat_double`** — the NAME of the new type. You choose this. Once defined, you can use `stat_double` anywhere you'd use a type name.
3. **`{`** — opening brace, starts the body of the struct.
4. **Field declarations** — each one is `type name;`:
   - `double numbers[SIZE];` — field 1: an array of `SIZE` doubles, named `numbers`.
   - `double mystery;` — field 2: a single double named `mystery`.
   Each field MUST end with a semicolon.
5. **`}`** — closing brace, ends the body.
6. **`;`** — semicolon, ends the declaration STATEMENT.

### 6.2 The dreaded `};`

The closing `};` is two characters that look like one. Both are required:

- `}` ends the struct body.
- `;` ends the declaration statement.

If you forget the `;`, the compiler reads the line below as if it were still part of the struct declaration, and you get an error message that points to the WRONG line. You'll spend 20 minutes wondering why the next function won't compile, when the real bug is the missing semicolon two lines up.

This is the #1 most common bug for Q2 of Test 2. **Burn it in: every struct definition ends with `};`, both characters, no exceptions.**

### 6.3 Why `;` at the end of a struct?

In C and C++ history, struct declarations are technically declarations of a type (and possibly variables of that type). All declarations end with a semicolon, the same way `int x = 5;` ends with one. The closing brace `}` doesn't end the statement — only the semicolon does. So you always need both:

- `}` closes the brace that opened with `{`.
- `;` ends the declaration statement.

Even if the language could in principle infer the semicolon, it doesn't. You have to write it.

### 6.4 ASCII diagram of a struct definition

```
struct stat_double {              ← line 1: keyword + type name + open brace
    double numbers[SIZE];         ← line 2: field 1 (array) + ;
    double mystery;               ← line 3: field 2 (single double) + ;
};                                ← line 4: close brace + ;  ← BOTH required
```

### 6.5 Common confusion / bug

- Forgetting the final `;` → compiler error on the line BELOW.
- Putting fields without semicolons → compiler error.
- Capitalizing the type name (`Stat_double`) when the rest of the code uses lowercase → undefined identifier error.
- Defining a struct inside a function and then trying to use it elsewhere → scope error.

### 6.6 0% / 100% mastery checkpoint

- 0%: you write `struct stat_double { double numbers[5]; double mystery; }` and it doesn't compile.
- 100%: you write the struct, automatically end it with `};`, and the compiler is happy.

---

## 7. Declaring a variable of struct type

### 7.1 After defining, the type name is yours to use

Once you've written:

```cpp
struct stat_double {
    double numbers[5];
    double mystery;
};
```

You can now use `stat_double` exactly like you'd use `int` or `double` to declare variables:

```cpp
stat_double d;            // d is a variable of type stat_double
stat_double another;      // another is also a stat_double
```

`d` now has both fields baked in:
- `d.numbers` — an array of 5 doubles
- `d.mystery` — a single double

The fields are NOT initialized (they contain garbage) until you assign to them or use brace initialization.

### 7.2 Memory diagram

After `stat_double d;`:

```
d (stat_double, uninitialized):
┌──────────────────────────────────────────────┐
│ numbers (array of 5 doubles):                │
│   ┌──────┬──────┬──────┬──────┬──────┐       │
│   │  ?   │  ?   │  ?   │  ?   │  ?   │       │
│   └──────┴──────┴──────┴──────┴──────┘       │
│    [0]    [1]    [2]    [3]    [4]           │
│                                              │
│ mystery: ?                                   │
└──────────────────────────────────────────────┘
```

All six values (5 in the array + 1 mystery) are garbage. You must initialize them before reading.

### 7.3 Common confusion

- "Is `stat_double` a variable?" No, it's a TYPE. `d` is the variable.
- "Can I have multiple variables of the same struct type?" Yes — `stat_double d1, d2, d3;` makes three independent stat_doubles.
- "If I copy `d2 = d1;`, does it copy the array too?" Yes. Whole-struct assignment copies every field, including arrays inside structs. (This is one of the rare places C++ copies an array for you.)

---

## 8. Field access: the dot operator `.`

### 8.1 The syntax: `variable.field`

To get to a field of a struct variable, write the variable name, a dot, and the field name:

```cpp
stat_double d;
d.mystery = 0.5;          // write to the mystery field
double m = d.mystery;     // read the mystery field
```

The dot operator means "the field named X of this struct". `d.mystery` is shorthand for "go to the mystery field inside d".

### 8.2 Reading vs writing

- `d.mystery = 0.5;` — assignment, the field is on the LEFT.
- `cout << d.mystery;` — read, the field is on the RIGHT (or used as a value).
- `if (d.mystery > 0)` — read.

The dot syntax doesn't change. The same expression `d.mystery` is used for both reading and writing — context decides which.

### 8.3 Field access is for one struct at a time

`d.mystery` only makes sense if `d` is a struct that has a field called `mystery`. If you write `d.banana`, the compiler complains that `stat_double` has no field called `banana`. Field names are checked at compile time.

### 8.4 0% / 100% mastery checkpoint

- 0%: you see `d.mystery` and aren't sure if it's a function call or a field.
- 100%: you see `d.mystery` and instantly think "the mystery field of struct variable d".

---

## 9. Array field of a struct

### 9.1 Combining `.` and `[]`

When a struct has an array field, you read the field with `.` and then index it with `[]`:

```cpp
stat_double d;
d.numbers[0] = 2.4;         // write to the FIRST element of the numbers field
double x = d.numbers[2];    // read the THIRD element of the numbers field
```

Reading left to right:
- `d` — the struct variable
- `.numbers` — the numbers field of d (the whole array)
- `[0]` — the element at index 0 of that array

So `d.numbers[0]` means "the first element of the array field `numbers` of struct variable `d`".

### 9.2 Order matters

The order is **always**: dot first, brackets second. `d.numbers[0]`, never `d[0].numbers` (which would mean something completely different — index into d, then ask for its numbers field).

### 9.3 Indexing with a variable inside the struct field

This is what Test 2 Q1 looks like:

```cpp
for (int i = 0; i < 5; i++) {
    if (d.numbers[i] > 0) {
        d.mystery = d.mystery + d.numbers[i];
    }
}
```

Read it slowly:
- `d.numbers[i]` — element at index `i` of the array field `numbers` of struct `d`.
- `if (d.numbers[i] > 0)` — "if that element is positive".
- `d.mystery = d.mystery + d.numbers[i];` — "add that positive element to the mystery field".

So this loop sums the positive numbers from the array into `d.mystery`.

### 9.4 ASCII diagram of d.numbers[i] for i = 2

```
d (stat_double):
┌──────────────────────────────────────────────┐
│ numbers (array of 5 doubles):                │
│   ┌──────┬──────┬──────┬──────┬──────┐       │
│   │ 2.4  │-3.7  │-1.7  │ 3.0  │ 2.0  │       │
│   └──────┴──────┴──────┴──────┴──────┘       │
│    [0]    [1]    [2]    [3]    [4]           │
│                   ↑                          │
│                   d.numbers[2] = -1.7        │
│                                              │
│ mystery: -0.9                                │
└──────────────────────────────────────────────┘
```

### 9.5 Common confusion

- "Is `d.numbers` the same as `d`?" No. `d` is the whole struct (5 doubles + 1 double). `d.numbers` is just the array field (5 doubles). `d.numbers[0]` is just the first element (1 double).
- "Why do I need both the dot and the brackets?" Because there are two layers — the field of the struct, and the position inside the array.

---

## 10. Initialization with brace lists

### 10.1 The simple case (whole struct, all fields)

You can give all fields initial values when you declare the struct variable:

```cpp
stat_double d = { {2.4, -3.7, -1.7, 3.0, 2.0}, -0.9 };
```

Read this from outside in:
- The OUTER `{ ... , ... }` initializes the struct.
- Inside the outer braces, fields are listed in DECLARATION ORDER (the order you wrote them in the struct definition).
- For our `stat_double`, field 1 is `numbers` (an array) and field 2 is `mystery` (a double).
- So `{ ..., -0.9 }` says: first part (the inner braces) goes into `numbers`, then `-0.9` goes into `mystery`.
- The INNER `{2.4, -3.7, -1.7, 3.0, 2.0}` initializes the array `numbers`. Elements in order: index 0 gets 2.4, index 1 gets -3.7, etc.

### 10.2 What the brace list does, step by step

After `stat_double d = { {2.4, -3.7, -1.7, 3.0, 2.0}, -0.9 };` you have:

```
d.numbers[0] = 2.4
d.numbers[1] = -3.7
d.numbers[2] = -1.7
d.numbers[3] = 3.0
d.numbers[4] = 2.0
d.mystery   = -0.9
```

That's all six values set in one statement.

### 10.3 The order is the struct definition order

The fields in the brace list match the order you wrote them in the struct. You CANNOT reorder. So with:

```cpp
struct stat_double {
    double numbers[5];   // field 1
    double mystery;      // field 2
};
```

The first thing inside `{ ... }` initializes `numbers`, the second initializes `mystery`. If you swap:

```cpp
stat_double d = { -0.9, {2.4, -3.7, -1.7, 3.0, 2.0} };  // WRONG ORDER
```

The compiler will complain because it tries to put `-0.9` into the array field and the brace-list `{2.4,...}` into the single-double field.

### 10.4 Memory diagram after brace init

```
d (stat_double):
┌──────────────────────────────────────────────┐
│ numbers (array of 5 doubles):                │
│   ┌──────┬──────┬──────┬──────┬──────┐       │
│   │ 2.4  │-3.7  │-1.7  │ 3.0  │ 2.0  │       │
│   └──────┴──────┴──────┴──────┴──────┘       │
│    [0]    [1]    [2]    [3]    [4]           │
│                                              │
│ mystery: -0.9                                │
└──────────────────────────────────────────────┘
```

This is the diagram to memorize. It is exactly what you get from the Test 2 Q1 init line.

### 10.5 Brace-init for arrays alone

The same syntax works for plain arrays:

```cpp
double numbers[5] = { 2.4, -3.7, -1.7, 3.0, 2.0 };
```

This is just the inner part of the struct init. Same rule: elements in order, one per index.

### 10.6 Common confusion / bug

- Mixing up inner vs outer braces: `{2.4, -3.7, -1.7, 3.0, 2.0, -0.9}` (one set of braces, all six values) — the compiler usually accepts this for simple struct/array combos as **brace elision**, but it's confusing. Stick with the nested form `{ {array values}, scalar }`.
- Wrong number of array elements: `{2.4, -3.7, -1.7, 3.0}` (only 4 in a 5-element array) — the missing element gets value 0. Often a bug, sometimes intentional.
- Wrong order: putting `-0.9` first — type mismatch, won't compile.

### 10.7 0% / 100% mastery checkpoint

- 0%: you see `{ {...}, -0.9 }` and don't know which brace pairs with which field.
- 100%: you see it and instantly say "first field is the array — five values inside the inner braces; second field is mystery — gets -0.9".

---

## 11. Memory diagrams (the big picture)

Now let's tie it all together with the diagram you should be able to draw from memory in 30 seconds.

### 11.1 After `stat_double d = { {2.4, -3.7, -1.7, 3.0, 2.0}, -0.9 };`

```
d (stat_double):
┌──────────────────────────────────────────────┐
│ numbers (array of 5 doubles):                │
│   ┌──────┬──────┬──────┬──────┬──────┐       │
│   │ 2.4  │-3.7  │-1.7  │ 3.0  │ 2.0  │       │
│   └──────┴──────┴──────┴──────┴──────┘       │
│   index:  0      1      2      3      4      │
│                                              │
│ mystery: -0.9                                │
└──────────────────────────────────────────────┘
```

### 11.2 Names you can read off the diagram

From this single diagram you can answer:
- `d.numbers` → the whole array `{2.4, -3.7, -1.7, 3.0, 2.0}`.
- `d.numbers[0]` → 2.4 (first element).
- `d.numbers[1]` → -3.7.
- `d.numbers[2]` → -1.7.
- `d.numbers[3]` → 3.0.
- `d.numbers[4]` → 2.0 (last element).
- `d.mystery` → -0.9.
- `d.numbers[5]` → OUT OF BOUNDS (don't go there).

### 11.3 Drill: cover the diagram, recite from the init

If someone tells you `stat_double d = { {2.4, -3.7, -1.7, 3.0, 2.0}, -0.9 };`, you should be able to immediately answer:

- What's `d.numbers[3]`? → 3.0
- What's `d.mystery`? → -0.9
- Is `d.numbers[5]` valid? → No, out of bounds.
- How big is the array? → 5 elements, indices 0 to 4.

If you can do that without thinking, you've got struct + array initialization fluent.

---

## 12. The Test 2 Q1 walk: what happens during the loop

The Q1 problem gives you a struct with the array+scalar layout above and a function `who_am_i(stat_double &d)` that does roughly:

```cpp
void who_am_i(stat_double &d) {
    d.mystery = 0.0;                              // RESET
    for (int i = 0; i < 5; i++) {
        if (d.numbers[i] > 0) {
            d.mystery = d.mystery + d.numbers[i]; // ACCUMULATE positives
        }
    }
}
```

### 12.1 Start state

After the brace init:

```
d.numbers = {2.4, -3.7, -1.7, 3.0, 2.0}
d.mystery = -0.9
```

### 12.2 Step 1: reset

`d.mystery = 0.0;` overwrites the -0.9. After this line:

```
d.mystery = 0.0
```

The init value of -0.9 is GONE. It was only used once at declaration; the function didn't care about it.

### 12.3 Step 2: the loop

Trace each iteration:

| i | `d.numbers[i]` | `> 0`? | `d.mystery` after |
|---|---|---|---|
| 0 | 2.4  | yes | 0.0 + 2.4 = 2.4 |
| 1 | -3.7 | no  | 2.4 (unchanged) |
| 2 | -1.7 | no  | 2.4 (unchanged) |
| 3 | 3.0  | yes | 2.4 + 3.0 = 5.4 |
| 4 | 2.0  | yes | 5.4 + 2.0 = 7.4 |

Final answer: `d.mystery = 7.4`.

### 12.4 The conceptual headline

**`who_am_i` sums the positive elements of `d.numbers` into `d.mystery`. The array itself never changes — only `d.mystery` accumulates.**

This is the kind of one-line sentence Test 2 will reward in the box: "It sums the positive values in the array into mystery."

### 12.5 Common confusion

- "Why is `d.mystery` -0.9 in the diagram if it gets reset?" Because the diagram shows the state BEFORE the function runs. The function's first line `d.mystery = 0.0;` discards that init value. The init is for the declaration; the function's work starts fresh.
- "Does `d.numbers` change?" No. The function only writes to `d.mystery`. The array is read but never modified.
- "Why `i < 5`?" Because the array has 5 elements at indices 0..4. `i = 5` would access `d.numbers[5]` which is out of bounds.

---

## 13. The desk_data struct (Q2)

Test 2 V2.0 asks you to translate a plain-English spec into a struct. The spec says something like:

> Define a struct `desk_data` that stores: the user_id of who's currently using the desk, the desk_id (unique identifier), and the number_of_screens on the desk.

The translation is mechanical. Three int fields, one struct definition:

```cpp
struct desk_data {
    int user_id;            // who's currently using the desk
    int desk_id;            // unique desk identifier
    int number_of_screens;  // how many monitors
};
```

### 13.1 Field-by-field justification

- `int user_id;` — the spec says "user_id of who's currently using the desk". An ID is an integer. Field name matches the spec word-for-word.
- `int desk_id;` — "the desk_id (unique identifier)". Integer. Name matches.
- `int number_of_screens;` — "the number_of_screens". A count is an integer. Name matches.

### 13.2 The closing `};`

This is where you lose marks if you forget. The struct ends with:

```cpp
};
```

Both characters. Never just `}` alone. If you only write `}` the compiler reports an error on the next line that says something cryptic like `expected ';' before 'int'` (or worse, an error in a totally unrelated location).

### 13.3 Common Q2 errors

- Wrong types: `string user_id` instead of `int user_id`. The spec says ID, so int.
- Field names that don't match the spec: `userId` instead of `user_id` (camelCase vs snake_case). Match the spec exactly — Test 2 marks names.
- Missing `;` after a field: each field declaration is its own statement and needs a semicolon.
- Missing `};` at the end: the worst one because the error message points to the wrong line.
- Adding fields the spec didn't ask for. Don't add `string desk_name` if the spec doesn't mention it.

### 13.4 100% mastery test

Hand someone a plain-English spec like "the struct should hold a name, an age, and an array of 3 grades". You should write, without looking anything up:

```cpp
struct student {
    string name;
    int age;
    double grades[3];
};
```

If that takes more than 30 seconds, drill more.

---

## 14. Array of structs (Q4 territory)

This is the hardest pattern but it's just the previous patterns combined.

### 14.1 The declaration

```cpp
const int MAX = 100;
desk_data desks[MAX];
```

`desks` is an array of `MAX` (100) `desk_data` structs. Each box of the array now holds an entire struct (with three int fields), not a single value.

### 14.2 The diagram

```
desks (array of MAX desk_data structs):
┌────────────────────┬────────────────────┬────────────────────┬─────┬────────────────────┐
│  desks[0]          │  desks[1]          │  desks[2]          │ ... │  desks[MAX-1]      │
│  ┌──────────────┐  │  ┌──────────────┐  │  ┌──────────────┐  │     │  ┌──────────────┐  │
│  │ user_id      │  │  │ user_id      │  │  │ user_id      │  │     │  │ user_id      │  │
│  │ desk_id      │  │  │ desk_id      │  │  │ desk_id      │  │     │  │ desk_id      │  │
│  │ number_of_   │  │  │ number_of_   │  │  │ number_of_   │  │     │  │ number_of_   │  │
│  │   screens    │  │  │   screens    │  │  │   screens    │  │     │  │   screens    │  │
│  └──────────────┘  │  └──────────────┘  │  └──────────────┘  │     │  └──────────────┘  │
└────────────────────┴────────────────────┴────────────────────┴─────┴────────────────────┘
```

Each cell is itself a struct with three fields. That's the only new idea: the cells of the array are no longer single values, they're full structs.

### 14.3 The combined access pattern: `desks[i].field_name`

To read a specific field of a specific struct in the array:

```cpp
desks[0].user_id           // user_id of the FIRST desk
desks[0].desk_id           // desk_id of the FIRST desk
desks[0].number_of_screens // screens of the FIRST desk

desks[5].user_id           // user_id of the 6th desk
desks[i].user_id           // user_id of the i-th desk
```

Reading left to right:
- `desks` — the whole array
- `[i]` — pick the struct at index `i`
- `.user_id` — pick the user_id field of that struct

### 14.4 The order: index FIRST, dot SECOND

`desks[i].user_id` parses as `(desks[i]).user_id`. You first index into the array to get one struct, then dot-access that struct's field. The order is fixed:

```
desks [ i ] . user_id
  ↑     ↑      ↑
 array index  field
```

NEVER `desks.user_id[i]` — that means "the user_id field of the array desks, indexed at i", which doesn't even make sense (the array doesn't have a user_id field; only the structs inside it do).

### 14.5 Writing fields

```cpp
desks[0].user_id = 42;
desks[0].desk_id = 7;
desks[0].number_of_screens = 2;

// or in a loop:
for (int i = 0; i < MAX; i++) {
    desks[i].user_id = -1;          // mark all as unused
    desks[i].desk_id = i;           // assign sequential IDs
    desks[i].number_of_screens = 1; // default to 1 monitor
}
```

### 14.6 Brace-init of an array of structs

Yes, you can brace-init an array of structs too:

```cpp
desk_data desks[3] = {
    {42, 1, 2},
    {17, 2, 3},
    {99, 3, 1}
};
```

- The outer braces are for the array (3 structs).
- Each inner brace is one struct: three ints in declaration order.
- So `desks[0].user_id = 42, desks[0].desk_id = 1, desks[0].number_of_screens = 2`, etc.

### 14.7 Common confusion

- Writing `desks.user_id[i]` instead of `desks[i].user_id`. Wrong order — won't compile.
- Forgetting that each cell of the array is itself a struct with multiple fields. You can't write `desks[0] = 42` — that doesn't say which field; you have to write `desks[0].user_id = 42`.
- Mixing up "the array index" with "the desk_id field". `desks[5].desk_id` could be 7 (or anything) — the array index is the position in the array, the desk_id is whatever value you stored.

### 14.8 100% mastery test

Given:

```cpp
desk_data desks[3] = {
    {42, 1, 2},
    {17, 2, 3},
    {99, 3, 1}
};
```

Answer instantly:

- `desks[1].user_id` → 17
- `desks[2].number_of_screens` → 1
- `desks[0].desk_id` → 1
- `desks[3].user_id` → OUT OF BOUNDS (only 3 structs, indices 0..2).

If those answers come without effort, you've got array-of-structs fluent.

---

## 15. The full mental model (everything combined)

By the time you finish this primer you should be able to read this code in one pass:

```cpp
const int SIZE = 5;
const int MAX  = 3;

struct stat_double {
    double numbers[SIZE];
    double mystery;
};

struct desk_data {
    int user_id;
    int desk_id;
    int number_of_screens;
};

int main() {
    stat_double d = { {2.4, -3.7, -1.7, 3.0, 2.0}, -0.9 };

    desk_data desks[MAX] = {
        {42, 1, 2},
        {17, 2, 3},
        {99, 3, 1}
    };

    cout << d.numbers[0]            << endl;  // 2.4
    cout << d.mystery               << endl;  // -0.9
    cout << desks[1].user_id        << endl;  // 17
    cout << desks[2].number_of_screens << endl;  // 1

    for (int i = 0; i < SIZE; i++) {
        if (d.numbers[i] > 0) {
            d.mystery += d.numbers[i];
        }
    }

    cout << d.mystery << endl;                // 0.0 was never reset, so:
                                              // -0.9 + 2.4 + 3.0 + 2.0 = 6.5
                                              // (different from the Q1 version
                                              //  where mystery was reset to 0)

    return 0;
}
```

If you can read every line of that without stopping, you have all the compound-type machinery you need for Test 2.

---

## 16. Cheat sheet (last-minute reference)

```
ARRAY:           type name[SIZE];
                 numbers[0]    ← first element
                 numbers[N-1]  ← last element of N-element array
                 numbers[N]    ← OUT OF BOUNDS (don't!)

ARRAY INIT:      double numbers[5] = {2.4, -3.7, -1.7, 3.0, 2.0};

STRUCT:          struct TypeName {
                     type1 field1;
                     type2 field2;
                 };                    ← ;  REQUIRED

STRUCT VAR:      TypeName v;
                 v.field1 = ...;       ← dot to access field

STRUCT INIT:     TypeName v = { val_for_field1, val_for_field2 };

STRUCT WITH ARRAY FIELD:
                 struct S { double arr[5]; double m; };
                 S s = { {1,2,3,4,5}, 9 };
                 s.arr[2]    ← third element of the array field
                 s.m         ← the scalar field

ARRAY OF STRUCTS:
                 TypeName items[N];
                 items[i].field    ← field of the i-th struct
                                     index FIRST, dot SECOND

ARRAY-OF-STRUCT INIT:
                 TypeName items[3] = { {a,b,c}, {d,e,f}, {g,h,i} };
```

If you can hold this card in your head, you can write Q1, Q2, and Q4 of Test 2 without consulting anything.

---

## 17. Final drill

Cover the answers, write them out, then check. Do this at least three times before Test 2.

1. Declare an array of 7 ints called `scores`.
2. Write the index of the LAST element of a 10-element array.
3. Define a struct `point` with two double fields `x` and `y`. Don't forget the closing.
4. Declare a variable `p` of type `point` and set its x to 3.0 and y to 4.0.
5. Initialize `p` with brace syntax to (5.0, 12.0) in one line.
6. Define a struct `student` with a string `name`, an int `age`, and an array of 3 doubles called `grades`.
7. Declare an array of 50 students called `class_list`.
8. Write the expression for the age of the 7th student in `class_list`.
9. Write the expression for the 2nd grade of the 7th student in `class_list`.
10. Write a for-loop that sums the grades of student `i` into a double `total`.

Answers (no peeking):

```cpp
// 1
int scores[7];

// 2
9   // (size 10 → indices 0..9)

// 3
struct point {
    double x;
    double y;
};   // ;  REQUIRED

// 4
point p;
p.x = 3.0;
p.y = 4.0;

// 5
point p = { 5.0, 12.0 };

// 6
struct student {
    string name;
    int age;
    double grades[3];
};

// 7
student class_list[50];

// 8
class_list[6].age      // 7th student is index 6

// 9
class_list[6].grades[1]   // 2nd grade is index 1

// 10
double total = 0.0;
for (int j = 0; j < 3; j++) {
    total += class_list[i].grades[j];
}
```

If you got them all without hesitation, you're done with this primer. If not, re-read the section that maps to the question you missed and try again.

---

## 18. One-paragraph summary you can say out loud

> An **array** is a fixed-size sequence of same-typed boxes accessed by integer index starting at zero, with the last index being size minus one. A **struct** is a named bundle of named fields of possibly different types, defined with `struct Name { type field; ... };` (closing brace AND semicolon required), and accessed with the dot operator: `var.field`. You can put an array inside a struct (`s.arr[i]`) and you can put structs inside an array (`items[i].field`). Brace-list initialization fills fields in declaration order, with nested braces for nested aggregates. That's the entire compound-type system you need for Test 2.

If you can recite that paragraph from memory, you have the model. The rest is just practice.
