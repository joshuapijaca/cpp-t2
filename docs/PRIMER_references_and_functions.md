# References and Functions Primer for SIT102 Test 2

> **Audience.** Joshua, with zero programming knowledge.
> **Goal.** By the end of this document, when you see `void who_am_i(stat_double &data)` or `void read_desks(desk_data &desk_list[], int number_to_read)` you should know **exactly** what every character means and what will happen when the function runs.
> **Scope.** This is the *complete* mental model. Nothing is assumed. Read top to bottom.

---

## 0. Before we start: how to read this document

Each section follows the same shape:

1. **Plain English.** What the idea actually *is*, in human words.
2. **C++ syntax.** The exact characters you will see on Test 2.
3. **Memory diagram.** ASCII boxes showing what is stored where.
4. **Common confusion.** The trap that catches first-timers.
5. **0% mastery.** What it looks like when you don't get it (so you can recognise the failure mode in yourself).
6. **100% mastery.** What it looks like when you do get it (so you know what you're aiming at).

If you only read the **0% / 100%** lines, you'll know whether you understand or not. If you only read the **diagrams**, you'll have the visual model. If you only read the **plain English**, you'll have the concept. Use whichever doors you need.

---

## 1. What is a function? (Reframing from blank slate.)

### 1.1 Plain English

A **function** is a **named, reusable block of code**.

Three properties matter:

- It has a **name** (so you can call it).
- It takes **input** through things called **parameters**.
- It can produce **output** in two ways:
  1. By **returning a value**, OR
  2. By **modifying its parameters** (this is what `&` enables — keep reading).

A function is **defined once**, then **called many times**, possibly with different inputs each time.

### 1.2 The cookbook analogy

Think of a recipe in a cookbook:

- The recipe for **pancakes** is written down **once**.
- The recipe has blanks for ingredients: *flour*, *eggs*, *milk*. These are **parameters**.
- You can **cook pancakes** on Monday with Anchor milk, Tuesday with soy milk, Wednesday with oat milk. Each time you "call" the recipe, you supply different ingredients.
- The recipe produces pancakes — that's the **return value**.

In code:

```cpp
double square(double x)         // the recipe, written once
{
  return x * x;
}

int main()
{
  double a = square(3.0);       // cook with x=3.0  →  a = 9.0
  double b = square(7.0);       // cook with x=7.0  →  b = 49.0
  double c = square(-2.0);      // cook with x=-2.0 →  c = 4.0
}
```

`square` is **defined once** at the top. It is **called three times** in `main`. Same recipe, different ingredients, different outputs.

### 1.3 Common confusion

> "Wait, is `square` *running* before `main` runs?"

No. **Defining** a function is *not* the same as **calling** it. Defining is writing the recipe in the cookbook. Calling is actually cooking. The recipe sits there inert until something says `square(3.0)`.

### 1.4 0% mastery

You see two `square(...)` lines in `main` and you think C++ is going to "do square twice and add them somewhere magical." You don't see that *each call is independent*. You don't realise that each call gets its own copy of the parameter `x`.

### 1.5 100% mastery

You read `square(3.0)` and you mentally substitute: *"control jumps into the `square` function with x set to 3.0; the function computes `x * x` which is 9.0; control jumps back to where it was called and the value 9.0 takes the place of `square(3.0)` in the expression."*

---

## 2. Function definition syntax

### 2.1 The shape

Every C++ function definition has this shape:

```
return_type name(parameter_list)
{
  body
}
```

Four pieces. Let's name them:

| Piece            | What it is                                                                        |
| ---------------- | --------------------------------------------------------------------------------- |
| `return_type`    | The type of value the function gives back. Use `void` if it gives back nothing.   |
| `name`           | What you'll call the function.                                                    |
| `parameter_list` | A comma-separated list of inputs, each with a type. Empty parens `()` means none. |
| `body`           | The code, between `{` and `}`, that runs when the function is called.             |

### 2.2 Test 2 example, dissected

Here's the function header from Q1 of Test 2:

```cpp
void who_am_i(stat_double &data)
{
  // body goes here
}
```

Letter-by-letter:

- `void` — return type. **The function returns nothing.** You can't write `int x = who_am_i(d);` — there is nothing to assign because nothing comes back.
- `who_am_i` — the function name. (The underscores are fine; C++ allows them.)
- `(` — open parameter list.
- `stat_double` — the **type** of the parameter.
- `&` — **this parameter is a reference.** *This is the entire focus of this primer.*
- `data` — the **name** of the parameter, used inside the body.
- `)` — close parameter list.
- `{ ... }` — body.

So the header reads, in English: *"who_am_i is a function that returns nothing and takes one parameter named `data`. The parameter `data` is of type `stat_double`, and it is passed by reference."*

### 2.3 Memory diagram

Just from the *header*, here's what we know about memory once the function is called:

```
Caller side:                   Function side:

┌─────────────────────┐
│ d  (a stat_double)  │  ←── parameter `data` is an alias to this box
└─────────────────────┘
```

We will draw this in detail in section 5.

### 2.4 Common confusion

> "Where does it say what `who_am_i` does? The header just gives names and types."

Correct. The **header** declares the *interface*. The **body** (between `{` and `}`) declares the *behaviour*. This separation is intentional — it lets the caller think only about names and types, not implementation.

### 2.5 0% mastery

You see `void who_am_i(stat_double &data)` and your eyes slide off it. You can't tell which word is the return type, which is the function name, which is the parameter type, and which is the parameter name.

### 2.6 100% mastery

You scan `void who_am_i(stat_double &data)` and silently parse: **return type | name | (parameter type | & | parameter name)**. You can rewrite it using different names without changing the meaning:

```cpp
void mystery(stat_double &x)         // same shape, different names
void process(stat_double &record)    // same shape, different names
```

---

## 3. Function parameters: what they actually are

### 3.1 Plain English

When a function is **called**, each parameter behaves like a **brand new local variable** that is created at the moment the function starts and destroyed when the function ends.

Each parameter gets initialised with the corresponding **argument** the caller supplied.

### 3.2 Argument vs parameter — the difference

Two words, one for each side of the call:

- **Parameter** — the name in the **function definition**.
  `void f(int x)` — `x` is a parameter.
- **Argument** — the value/variable in the **call**.
  `f(5)` — `5` is the argument. `f(a)` — `a` is the argument.

A parameter is the *blank in the recipe*. An argument is what you *put in the blank*.

### 3.3 By value (the default)

Without `&`, parameters are **passed by value**. Plain English: *the parameter is a fresh copy.*

```cpp
void f(int x)
{
  x = 999;          // we change x inside f
}

int main()
{
  int a = 5;
  f(a);             // a's value (5) is copied into x
  // a is still 5.  The change to x had no effect on a.
}
```

### 3.4 Memory diagram (by value)

At the moment `f(a)` runs:

```
Before call:
  main:  a = 5

During call (parameter created, copy made):
  main:  a = 5
  f:     x = 5     ← independent copy

After `x = 999;` inside f:
  main:  a = 5
  f:     x = 999   ← only x changed

After f returns (x destroyed):
  main:  a = 5     ← unchanged
```

### 3.5 100% mastery

You can answer the question *"after the call, what is `a`?"* without running the code, by tracking whether each parameter is a copy or an alias.

---

## 4. The two ways to pass a parameter — by value vs by reference

This is the central distinction. Everything about `&` flows from here.

### 4.1 By value (no `&`)

```cpp
void increment(int x)        // no &
{
  x = x + 1;
}

int main()
{
  int a = 5;
  increment(a);              // a is COPIED into x
  // a is still 5.  Nothing changed.
}
```

What happened:

1. `a` exists in `main`, holding 5.
2. `increment(a)` is called. The system makes a **fresh copy** of `a`'s value and stores it in a new variable called `x` inside `increment`.
3. `x = x + 1;` changes `x` to 6.
4. The function returns. `x` is destroyed.
5. `a` was never touched. `a` is still 5.

**By value = the function works on a photocopy.**

### 4.2 By reference (with `&`)

```cpp
void increment(int &x)       // &  ←── the whole point
{
  x = x + 1;
}

int main()
{
  int a = 5;
  increment(a);              // a is ALIASED as x — no copy
  // a is now 6.  Yes, really.
}
```

What happened:

1. `a` exists in `main`, holding 5.
2. `increment(a)` is called. The system **does not copy**. Instead, it makes the name `x` inside `increment` refer to **the same storage as `a`**.
3. `x = x + 1;` modifies that storage. From `a`'s perspective, `a` was modified.
4. The function returns. `x` (the alias) is gone, but `a` (the actual storage) survives.
5. `a` is now 6.

**By reference = the function works on the original, through a different name.**

### 4.3 Side-by-side memory diagram

By value:

```
main:    a [ 5 ]       ←── separate box
increment: x [ 5 ]     ←── independent copy of a's value
                          (changes to x do nothing to a)
```

By reference:

```
main:    a [ 5 ]       ←─┐
                         ├── ONE box, TWO names
increment: x  ───────────┘
                          (changing x IS changing a)
```

### 4.4 Common confusion

> "If `x` is just an alias for `a`, why have a separate name at all?"

Because *inside* the function, the function doesn't know what the caller named the variable. The function only knows it has a parameter called `x`. The `&` is the contract: *"whatever the caller passed in, my `x` is going to be that."*

> "Does the function know it's by reference?"

Yes. `&` is part of the function definition. The function is declared `void increment(int &x)` and that header says, every single time it's called, the parameter is an alias.

> "Does the caller know it's by reference?"

Yes. The caller can read the function's header and see the `&`. The caller is therefore aware that `increment(a)` may modify `a`. This is why functions that mutate their inputs are easy to spot in well-written code.

### 4.5 0% mastery

You write `void increment(int x)` (no `&`) for Q1 of Test 2 and your `who_am_i` *cannot mutate* `data.mystery`. Your output is wrong because the changes never escape the function.

### 4.6 100% mastery

You can take any function header and decide, for each parameter, whether modifying it inside the function will modify the caller's variable.

---

## 5. Mental model — alias / nickname

If sections 1–4 didn't click, this is the section that does it. Stop here until this is absolutely concrete.

### 5.1 The alias model in one sentence

**`&` makes the parameter a *nickname* for the caller's variable. Two names, one storage. Modifying through one name modifies the other.**

### 5.2 Real-world analogy

Suppose someone is named *Margaret* on her birth certificate, but at work everyone calls her *Maggie*.

- "Margaret arrived at 9am" and "Maggie arrived at 9am" describe the same event.
- "Margaret got a raise" means Maggie got a raise too.
- There is **one person**. There are **two names** for her. Anything that happens to her under one name happens to her under both.

In code:

```cpp
void greet(string &maggie)     // inside the function, the parameter is "maggie"
{
  maggie = maggie + " (greeted)";
}

int main()
{
  string margaret = "Margaret Hill";
  greet(margaret);             // now margaret is "Margaret Hill (greeted)"
}
```

### 5.3 Memory diagram

```
                 ┌───────────────────────┐
   margaret ───→ │ "Margaret Hill"       │ ←─── maggie
                 └───────────────────────┘
                  ONE storage, TWO names
```

When the function does `maggie = maggie + " (greeted)";`, it's the same as if `main` had done `margaret = margaret + " (greeted)";`. Same box, different label.

### 5.4 The Test 2 phrasing

In Test 2 Q1, you'll see this header:

```cpp
void who_am_i(stat_double &data)
```

Translate it to alias-language: *"`data` is a nickname for whatever `stat_double` the caller passed in."* If the caller passed `d`, then inside `who_am_i`, the names `data` and `d` refer to the same storage. Anything that mutates `data.mystery` mutates `d.mystery`.

### 5.5 0% mastery

You think `data` and `d` are separate variables. You think when the function ends, the changes "vanish." You're confused why the test answer expects you to say `d.mystery` is now `7.4`.

### 5.6 100% mastery

The phrase "`data` is an alias for `d`" is enough for you to predict every observable effect of the function on `d`. You don't need to think about copying, or addresses, or memory layout. You think: *one box, two names.*

---

## 6. Why use pass-by-reference?

There are exactly two reasons.

### 6.1 Reason 1: efficiency (avoid copying)

Some types are big. A `stat_double` contains an array of five doubles plus an extra double — six doubles total, 48 bytes. A `desk_data` array might contain ten desks. Copying every byte every time you call a function is wasteful. By reference avoids the copy.

For tiny things like `int` (4 bytes), the copy is essentially free, so we usually pass them by value.

### 6.2 Reason 2: mutation (the function MUST modify the caller's variable)

This is the reason that matters for Test 2.

`who_am_i` is supposed to **change** `data.mystery`. If we passed by value, the function would change its private copy and the caller would never see the change. The whole point of the function — to update `data.mystery` in place — only works if `data` is an alias for the caller's variable.

The same logic applies to `read_desks`. The whole point is to **fill in** the desks the caller passed in. If we passed by value, the function would scribble in its private copy and the caller's array would still be empty.

### 6.3 Mnemonic

If a function exists to **change** the thing you give it → **needs `&`**.
If a function exists only to **look at** the thing and **return** something → can be by value (or by `const &` if you also want efficiency, but that's not on Test 2).

### 6.4 100% mastery

When you read a function name, you can guess whether parameters should be by reference. *"`who_am_i` — sounds like a question, but the body computes a sum and stores it in `mystery`, so it's actually mutating, so `&`."* *"`read_desks` — reads input *into* desks, so mutation, so `&`."*

---

## 7. The `&` symbol — disambiguation (CRITICAL)

This is the section that prevents the most common confusion. The single character `&` does three completely different things in C++. Two of them are not on Test 2. **Knowing which is which is the actual skill.**

### 7.1 The three meanings

| #  | Meaning              | Where it appears                               | Example                  | On Test 2? |
| -- | -------------------- | ---------------------------------------------- | ------------------------ | ---------- |
| 1  | **Reference** type   | In a parameter list, glued to a type           | `void f(int &x)`         | **YES**    |
| 2  | **Address-of**       | In an expression, before a variable, no type   | `&y` or `int *p = &y;`   | No         |
| 3  | **Bitwise AND**      | Between two values                             | `a & b`                  | No         |

### 7.2 Pattern recognition rules

You can decide which meaning `&` has by looking at *what is on either side of it*:

- **Reference (#1):** there is a **type** to the left of `&`, and a **variable name** to the right. Example: `int &x`. Reads as: *"reference to int, named x."*
- **Address-of (#2):** there is **no type** anywhere; `&` is in front of a variable name in an expression. Example: `printf("%p", &y);`. Reads as: *"address of y."*
- **Bitwise AND (#3):** `&` sits between two **values** (or expressions). Example: `result = a & b;`. Reads as: *"a bit-AND b."*

### 7.3 For Test 2 specifically

Every `&` you see on Test 2 is **meaning #1** — a reference parameter.

You will never write `&` in front of a variable in your function body. You will never put `&` between two integers. If your fingers type one of those, stop and ask yourself: *"am I confusing reference with address-of?"*

### 7.4 Common confusion (the C trap)

You may have seen, in another context, code like:

```cpp
scanf("%d", &n);    // C-style I/O — &n means "address of n"
```

That `&n` is **meaning #2 (address-of)**. It belongs in a different language style (C with pointers). It is **not** on Test 2 and will lead you astray if you mix the rules.

For Test 2 you will use `cin >> n;` (no `&` at the call site) and your function parameters will use `&` (meaning #1).

### 7.5 100% mastery

You can read mixed code and label every `&` correctly without thinking about it. When you write code, you only ever produce `&` in **parameter list type position**, never in your function body.

---

## 8. Calling a function — argument passing

### 8.1 The call site syntax

Once you have defined `who_am_i`, you call it like this:

```cpp
stat_double d = { {2.4, -3.7, -1.7, 3.0, 2.0}, -0.9 };
who_am_i(d);                  // ← the call
```

Note carefully:

- The function definition has `(stat_double &data)` — with `&`.
- The call has `(d)` — **no `&`**.

This asymmetry is the single biggest tripwire. Read the next subsection slowly.

### 8.2 Why no `&` at the call site?

Because the **function definition** already declared *how* the parameter receives its argument.

The `&` in the definition is a **promise to the caller**: *"any variable you give me, I'll alias it." *
The caller doesn't have to repeat the promise.

Compare with by-value:

```cpp
void f(int x)        // by value
{ ... }
int a = 5;
f(a);                // call site looks identical to the by-ref case
```

```cpp
void f(int &x)       // by reference
{ ... }
int a = 5;
f(a);                // call site STILL looks identical
```

**The call site looks the same either way.** The only difference is what the function does with the argument behind the scenes. C++ chose this design so that, at the call site, you don't have to know whether the function is going to alias or copy — you just hand it the variable and the function header decides.

### 8.3 Why putting `&` at the call site is wrong

If you write `who_am_i(&d);` you are using **meaning #2 (address-of)**. You're saying "give me the *address* of d." The function expects a `stat_double`, not an address. The compiler will reject it with a type-mismatch error.

```cpp
who_am_i(&d);   // ❌ compile error: cannot convert stat_double* to stat_double&
who_am_i(d);    // ✅ correct
```

### 8.4 Memory diagram for the call

Just before `who_am_i(d)` runs:

```
main:
  d.numbers = [2.4, -3.7, -1.7, 3.0, 2.0]
  d.mystery = -0.9
```

The instant `who_am_i(d)` enters its body:

```
main:                                who_am_i:
  d.numbers = [2.4, -3.7, ...]   ←──── data  (alias — same storage as d)
  d.mystery = -0.9
```

The function body now operates on `data.*`, but every change is visible to `d.*` because they're the same memory.

### 8.5 100% mastery

When you read a function call, you don't ask yourself "should I add `&` here?" — you don't, ever, in this style of C++. You just write the variable name. The decision about copy vs alias has already been made *in the function header*.

---

## 9. The `void` return type

### 9.1 What `void` means

`void` literally means "nothing." A function whose return type is `void` does **not** give you a value back.

```cpp
void who_am_i(stat_double &data)
{
  // ...
  return;            // optional: ends the function early, with no value
}
```

When the function reaches `}` (the closing brace) without hitting a `return;`, it just ends. No value is produced.

### 9.2 What you can and cannot do

**Cannot:**

```cpp
double x = who_am_i(d);    // ❌ there's nothing to assign
if (who_am_i(d) > 0) ...   // ❌ there's nothing to compare
```

**Can:**

```cpp
who_am_i(d);               // ✅ standalone statement
```

After this line, `d` has been mutated (because of `&`), but no value comes back from the call. The "output" of `who_am_i` is *the side-effect on `d`*, not a return value.

### 9.3 Why pair `void` with `&`?

It's the most common pattern for "this function exists to modify its parameter." Since the function isn't returning anything, the only way for it to communicate back to the caller is through reference parameters. `void` + `&` go together like salt and pepper.

### 9.4 100% mastery

You see `void f(T &x)` and immediately think: *"this function has no return value; its purpose is to mutate x."*

---

## 10. Tracing a call with reference parameter — full walkthrough

We're going to trace Test 2 Q1 line-by-line, exactly as you would on the exam.

### 10.1 The setup

```cpp
struct stat_double
{
  double numbers[5];
  double mystery;
};

void who_am_i(stat_double &data)
{
  int i;
  data.mystery = 0.0;
  for (i = 0; i < 5; i++)
  {
    if (data.numbers[i] > 0)
    {
      data.mystery = data.mystery + data.numbers[i];
    }
  }
}

int main()
{
  stat_double d = { {2.4, -3.7, -1.7, 3.0, 2.0}, -0.9 };
  who_am_i(d);
  // print d.mystery
}
```

### 10.2 Initial state (before the call)

```
d.numbers = [ 2.4, -3.7, -1.7, 3.0, 2.0 ]
d.mystery = -0.9
```

### 10.3 The call begins

`who_am_i(d)` enters the function. The parameter `data` becomes an **alias** for `d`. From now on, `data` and `d` are two names for the same storage.

```
data.numbers = [ 2.4, -3.7, -1.7, 3.0, 2.0 ]   ← same as d.numbers
data.mystery = -0.9                              ← same as d.mystery
```

### 10.4 Step through the body

**`int i;`** — declare a local integer `i`. Uninitialised. Lives only inside the function.

**`data.mystery = 0.0;`** — set `data.mystery` to 0.0. **Because `data` is `d`, `d.mystery` is now also 0.0.**

State:
```
data.numbers = [ 2.4, -3.7, -1.7, 3.0, 2.0 ]
data.mystery = 0.0
i            = (uninitialised, will be set by the for loop)
```

**`for (i = 0; i < 5; i++)`** — loop with `i` going 0, 1, 2, 3, 4.

**i = 0:**
- `data.numbers[0]` is `2.4`.
- `2.4 > 0`? Yes.
- `data.mystery = data.mystery + data.numbers[0] = 0.0 + 2.4 = 2.4`.
- `data.mystery` is now `2.4`.

**i = 1:**
- `data.numbers[1]` is `-3.7`.
- `-3.7 > 0`? No.
- Skip.
- `data.mystery` is still `2.4`.

**i = 2:**
- `data.numbers[2]` is `-1.7`.
- `-1.7 > 0`? No.
- Skip.
- `data.mystery` is still `2.4`.

**i = 3:**
- `data.numbers[3]` is `3.0`.
- `3.0 > 0`? Yes.
- `data.mystery = 2.4 + 3.0 = 5.4`.
- `data.mystery` is now `5.4`.

**i = 4:**
- `data.numbers[4]` is `2.0`.
- `2.0 > 0`? Yes.
- `data.mystery = 5.4 + 2.0 = 7.4`.
- `data.mystery` is now `7.4`.

**Loop ends** (i becomes 5, which is not `< 5`).

### 10.5 Function returns

`}` reached. The function exits. `i` and the alias `data` are destroyed.

But `d` (the actual storage, in `main`) lives on:

```
d.numbers = [ 2.4, -3.7, -1.7, 3.0, 2.0 ]    (unchanged)
d.mystery = 7.4                                (was -0.9, then 0.0, now 7.4)
```

### 10.6 What `who_am_i` does

It computes the **sum of the positive numbers** in `data.numbers` and stores it in `data.mystery`. That is the answer to "who am I?" — the function is a positive-sum.

### 10.7 100% mastery check

You can perform this trace silently, in under a minute, without making the by-value mistake of "but `data` is a copy so `d` doesn't change." You know they're aliases. You know `d.mystery` ends as `7.4`.

---

## 11. Array parameters with `&` — Q3 territory

### 11.1 The header

```cpp
void read_desks(desk_data &desk_list[], int number_to_read);
```

This is what you'll see on Test 2 Q3. Let's read every character.

- `void` — returns nothing.
- `read_desks` — function name.
- `(`
- `desk_data` — element type. Each thing in the array is a `desk_data` struct.
- `&` — the array is **passed by reference**. The function can modify the caller's array.
- `desk_list` — name of the parameter inside the function.
- `[]` — *this is an array.* The square brackets are empty (no size) because C++ array parameters do not carry their size.
- `,`
- `int number_to_read` — second parameter, by value, telling the function how many elements to process.
- `);`

In English: *"`read_desks` returns nothing. It takes an array of `desk_data` (by reference, so it can fill it in) plus an integer count."*

### 11.2 What "array by reference" means

Inside the function, `desk_list[i]` is the **caller's** desk, not a copy. Writing to it sticks.

```cpp
void read_desks(desk_data &desk_list[], int number_to_read)
{
  int i;
  for (i = 0; i < number_to_read; i++)
  {
    cout << "Enter name for desk " << i << ": ";
    cin >> desk_list[i].name;            // writes into caller's array
    cout << "Enter colour for desk " << i << ": ";
    cin >> desk_list[i].colour;          // writes into caller's array
    // ... etc
  }
}
```

When the function returns, the caller's array has been filled in.

### 11.3 Memory diagram

Caller side (in `main`):

```cpp
desk_data desks[3];        // an array of 3 desks, all empty/uninitialised
int n = 3;
read_desks(desks, n);
```

```
main:    desks  [ desk0  ][ desk1  ][ desk2  ]   ←─┐
                                                   ├── ONE array, TWO names
read_desks: desk_list ────────────────────────────┘

         number_to_read = 3   (independent copy of n)
```

`desk_list[0]` *is* `desks[0]`. Writing into `desk_list[0].name` writes into `desks[0].name`.

### 11.4 The call site

```cpp
read_desks(desks, n);     // ✅ correct — no & at call site
read_desks(&desks, n);    // ❌ wrong — that's address-of, type mismatch
```

Same rule as section 8: `&` lives in the function header, not the call site.

### 11.5 100% mastery

You can write Q3 from scratch and get the parameter list right on the first try, including the `&`, including the empty `[]`, including the second `int` for the count, and **without** putting `&` at the call site.

---

## 12. The `int number_to_read` parameter (no `&`)

### 12.1 Why no `&`?

Because the function only needs to **read** the count. It doesn't need to modify the caller's count. So a copy is fine — and a copy is cheap because `int` is small.

### 12.2 What if someone changed it inside the function?

Even if `read_desks` did `number_to_read--;`, that would only affect its local copy. The caller's `n` would be untouched.

```cpp
void read_desks(desk_data &desk_list[], int number_to_read)
{
  // ... loop ...
  number_to_read = 999;     // changes the local copy only
}

// in main:
int n = 3;
read_desks(desks, n);
// n is still 3.  The function modified its private copy.
```

### 12.3 The pattern for "array + count"

This is a standard C++ pattern. When you pass an array, you almost always pass a count alongside it. The array is by reference; the count is by value.

```cpp
void process(SomeType &arr[], int count)    // standard shape
```

### 12.4 100% mastery

You don't accidentally add `&` to the count parameter "just in case." You correctly mark only the array as by-reference, because that's the parameter you intend to mutate.

---

## 13. Why `desk_list[]` has no size?

### 13.1 The C++ rule

When an array is passed as a parameter, the size **does not** travel with it. The function only knows "this is an array of `desk_data`" — not how many elements it has.

This is why the empty square brackets `[]` look strange. They are there only to say "this parameter is an array," not to say how big.

### 13.2 The consequence: you need a count

Because the function can't tell how big the array is, **the caller must tell it**. That's why the second parameter `int number_to_read` exists. It is the function's only source of truth about the array's length.

```cpp
void read_desks(desk_data &desk_list[], int number_to_read)
{
  // I know desk_list is an array.
  // I don't know its size.
  // The caller told me to fill in `number_to_read` elements.
  // I will trust them.
}
```

### 13.3 Common confusion

> "Can I just do `for (i = 0; i < desk_list.size(); i++)`?"

No. C-style arrays in C++ have **no `.size()`**. (`std::vector` does, but Test 2 isn't using `std::vector` for this question.) You **must** use the count parameter.

> "What if I lie about the count?"

If the caller says `number_to_read = 99` but the array has only 3 slots, your function will write past the end of the array. This is **undefined behaviour** — your program may crash, or worse, silently corrupt other variables. On Test 2 you assume the caller passes a sensible count.

### 13.4 100% mastery

You always pair `T arr[]` with `int count`. You never assume the array can self-report its size.

---

## 14. Common Q3 errors related to `&`

### 14.1 The four configurations

There are exactly four ways to write the array parameter:

| Header                                  | Effect                                                                      | Right? |
| --------------------------------------- | --------------------------------------------------------------------------- | ------ |
| `void f(desk_data desk_list[], int n)`  | Array passed without `&`. Special C++ array rule still allows mutation in some cases, but **this is not what Test 2 expects** — Test 2 wants the explicit `&`. | ❌      |
| `void f(desk_data &desk_list[], int n)` | Array passed by reference. **This is what Test 2 expects.**                 | ✅      |
| `void f(desk_data &desk_list, int n)`   | This says `desk_list` is a single `desk_data`, not an array. Wrong shape.   | ❌      |
| `void f(desk_data desk_list, int n)`    | Single by-value desk. Wrong shape.                                          | ❌      |

For Test 2, **always** use `desk_data &desk_list[]`.

### 14.2 The four ways to call it

| Call                       | Right? | Why                                                                             |
| -------------------------- | ------ | ------------------------------------------------------------------------------- |
| `read_desks(desks, n);`    | ✅      | Pass the array name and the count. This is the standard form.                   |
| `read_desks(&desks, n);`   | ❌      | `&desks` is the address-of operator (meaning #2). Wrong type.                   |
| `read_desks(desks[], n);`  | ❌      | You don't write `[]` at the call site. Syntax error.                            |
| `read_desks(*desks, n);`   | ❌      | `*desks` is dereferencing (pointer territory). Wrong shape.                     |

For Test 2, **always** call with just the array name: `read_desks(desks, n);`.

### 14.3 The mistake matrix

Combine the two and the most common test mistakes are:

```cpp
// ❌ Mistake 1: forget & in header
void read_desks(desk_data desk_list[], int n);       // function may not mutate properly

// ❌ Mistake 2: put & at call site
read_desks(&desks, n);                                // type error

// ❌ Mistake 3: both wrong
void read_desks(desk_data desk_list[], int n);
read_desks(&desks, n);                                // double trouble
```

The correct combination:

```cpp
// ✅ Correct: & in header, no & at call site
void read_desks(desk_data &desk_list[], int n);
read_desks(desks, n);
```

### 14.4 0% mastery

You guess. Sometimes you put `&` in the header, sometimes you put it at the call site, sometimes both, sometimes neither. You are not sure why one works and another doesn't.

### 14.5 100% mastery

You apply the rule: **`&` lives in the function header, never at the call site.** You never deviate. You can predict whether any combination of header + call will compile.

---

## 15. Quick-reference cheat sheet

Print this. Glue it inside your forearm.

```
PARAMETERS

  void f(T x)      — by value:     x is a fresh COPY of the caller's value.
                                   Changes to x do nothing to the caller.

  void f(T &x)     — by reference: x is an ALIAS for the caller's variable.
                                   Changes to x ARE changes to the caller.

  void f(T &x[])   — array by ref: x is an alias for the caller's array.
                                   Plus a separate `int n` for the size.

THE & SYMBOL

  TYPE  &  NAME    →  REFERENCE PARAMETER     (ON TEST 2)
  &  NAME          →  address-of operator     (NOT on Test 2)
  VAL  &  VAL      →  bitwise AND             (NOT on Test 2)

CALL SITE

  Define:   void f(T &x)
  Call:     f(a);              ← NO & at the call site

THE TWO TEST 2 HEADERS

  void who_am_i(stat_double &data);
  void read_desks(desk_data &desk_list[], int number_to_read);

THE TWO TEST 2 CALLS

  who_am_i(d);
  read_desks(desks, n);
```

---

## 16. Self-test (don't skip this)

For each item, write the answer down before reading the next line.

### 16.1

> Given `void f(int &x) { x = x + 10; }` and `int a = 3; f(a);` — what is `a`?

Answer: **`13`**. `x` is an alias for `a`. `x = x + 10` adds 10 to the storage that `a` and `x` share.

### 16.2

> Given `void f(int x) { x = x + 10; }` and `int a = 3; f(a);` — what is `a`?

Answer: **`3`**. No `&`, so `x` is a copy. The function modified its private copy. `a` is untouched.

### 16.3

> Why is the call `who_am_i(d)` correct but `who_am_i(&d)` wrong?

Answer: **`&` at the call site is the address-of operator (meaning #2), which produces a pointer. The function expects a `stat_double`, not a pointer to one. The `&` in the header is not repeated at the call site.**

### 16.4

> Why does `read_desks` need a separate `int number_to_read` parameter?

Answer: **C++ arrays passed as parameters do not carry their size. Without a count parameter, the function would have no way to know how many elements to process.**

### 16.5

> If the test problem says "fill in the desks" and your function is `void read_desks(desk_data desk_list[], int n)` (no `&`), what's wrong?

Answer: **Without the `&` you don't have the explicit reference parameter Test 2 expects. Test 2's marking scheme is checking that you know about pass-by-reference; the missing `&` is the signal that you don't, even if some C++ array rules would otherwise let it work.**

### 16.6

> Trace through: `stat_double s = { {1.0, -2.0, 3.0, -4.0, 5.0}, 100.0 }; who_am_i(s);` — what is `s.mystery` after the call?

Answer: **`9.0`**. `0.0 + 1.0 + 3.0 + 5.0 = 9.0`. Negative numbers skipped. The original `100.0` was overwritten by `data.mystery = 0.0;` at the start.

If you got all six right, you have 100% mastery for Test 2's reference and function questions.

---

## 17. Closing summary — the four sentences

If you remember nothing else, remember these four sentences. They are the entire model.

1. **A function is a named, reusable block of code that takes parameters as input and produces output via return value or by mutating its parameters.**
2. **By value (no `&`) means the parameter is a copy; changes don't escape. By reference (`&`) means the parameter is an alias; changes do escape.**
3. **The `&` in `int &x` is a reference declaration; it is *not* the same `&` that means address-of in `&y`. On Test 2, every `&` you see is a reference declaration.**
4. **`&` belongs in the function header, never at the call site.**

Read those four sentences out loud once. Then close the document and go do Q1.
