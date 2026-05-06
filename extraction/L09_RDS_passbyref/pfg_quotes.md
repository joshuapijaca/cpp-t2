# Level 9 — Pass-by-Reference (RDS) — PFG Verbatim Quotes

Source: PFG Part 2, Chapter 4 (indirect-access). Read-only audit of `_legacy_apps/it-elo/src/data/pfg-content/`.

---

## Q01 — Default is copy by value

**Source**: `part-2-organised-code/4-indirect-access/0-panorama/1-reference-params.md`
**Lines**: 5-13
**Verbatim**:

> On the first pass through this chapter, the main thing to start to explore using are reference parameters. These allow you to create parameters which are used to update the passed in values.
> - This is called pass-by-reference
> - Use it to allow changes to the parameter to affect the variable argument

**Use for atoms**: R-01, R-02

---

## Q02 — Copy vs alias semantics

**Source**: `part-2-organised-code/4-indirect-access/1-tour/00-explore-references.mdx`
**Lines**: 5-10
**Verbatim**:

> References provide a means to indirectly access a variable - creating a variable that is an alias that can be used to refer to another variable or value in memory.

**Use for atoms**: R-03, R-08

---

## Q03 — Pass by value is default

**Source**: `part-2-organised-code/4-indirect-access/2-trailside/01-pass-by-ref.mdx`
**Lines**: 173-177
**Verbatim**:

> So far we have been using pass by value for all of our parameters. With pass by value, the parameter receives a copy of the **value** passed in the argument. In this case, any expression is evaluated first, and the value copied across.

**Use for atoms**: R-01, R-02

---

## Q04 — Reference definition via &

**Source**: `part-2-organised-code/4-indirect-access/2-trailside/01-pass-by-ref.mdx`
**Lines**: 205-211
**Verbatim**:

> Pass by reference is achieved by adding an ampersand `&` before the parameter name. This indicates that the parameter is to be passed the **address of** a variable. This syntax mimics the syntax used to get the address of a variable in C.
>
> You can also add a `const` before the type name to indicate that you do not want to allow this parameter to be able to change the value passed to it.

**Use for atoms**: R-03, R-04, R-07

---

## Q05 — Mutation via reference changes caller

**Source**: `part-2-organised-code/4-indirect-access/1-tour/00-explore-references.mdx`
**Lines**: 180-189
**Verbatim**:

> Now that we have the main building blocks in place, we can add an `update_user` procedure. Update user can be passed a user **by reference**, allowing it to update the user data by accessing it via a reference. This reference is an alias of the argument passed to it. When you read or write to this variable, you are indirectly accessing the data in the variable that was passed to this as the argument.

**Use for atoms**: R-04, R-05, R-08

---

## Q06 — Reference requires lvalue

**Source**: `part-2-organised-code/4-indirect-access/0-panorama/1-reference-params.md`
**Lines**: 9-14
**Verbatim**:

> You must pass a variable to a reference - it cannot be a calculated value as the parameter needs to be able to write the result back to somewhere in memory.

**Use for atoms**: R-06

---

## Q07 — Automatic dereferencing (compiler-hidden)

**Source**: `part-2-organised-code/4-indirect-access/2-trailside/01-pass-by-ref.mdx`
**Lines**: 256-262
**Verbatim**:

> Pass by reference and pass by value are **terms** that explain how data is passed to a parameter. [...] You can think of pass by reference as passing the variable itself to the parameter. [...] It is called pass by reference due to the way it is implemented, with the parameter receiving a *reference* to the variable.

**Use for atoms**: R-04, R-08

---

## Q08 — No expression syntax allowed

**Source**: `part-2-organised-code/4-indirect-access/2-trailside/01-pass-by-ref.mdx`
**Lines**: 241-242
**Verbatim**:

> Also notice that there is no special syntax needed in the function call, though you have to pass it a variable. Trying to pass this an expression like `other + 1` would fail with a compiler error, as a parameter passed by reference requires a variable not just a value passed to it.

**Use for atoms**: R-06

---

## Q09 — Alias semantics (same memory box)

**Source**: `part-2-organised-code/4-indirect-access/2-trailside/01-pass-by-ref.mdx`
**Lines**: 56-59
**Verbatim**:

> This means that instead of storing a *copy of the value* of `val`, it stores the *address* of `val` in `data`. Now, any operations using `data` in `double_it()`, will be effectively referring to `val` in `main()`.

**Use for atoms**: R-03, R-04, R-08

---

## Atom Coverage Summary

| Atom | Quote IDs | PFG Coverage |
|------|-----------|--------------|
| R-01 (parameter receives copy by default) | Q01, Q03 | Strong |
| R-02 (mutating param doesn't change caller) | Q01, Q03 | Strong |
| R-03 (`&` = alias / same box) | Q02, Q04, Q09 | Strong |
| R-04 (`void f(int &x)` shares box) | Q04, Q05, Q07, Q09 | Strong |
| R-05 (mutating &param changes caller) | Q05 | Adequate |
| R-06 (reference must bind real variable) | Q06, Q08 | Strong |
| R-07 (`const &` = read-only alias) | Q04 | Weak — single mention |
| R-08 (reference = same memory, two names) | Q02, Q05, Q07, Q09 | Strong |

**R-07 weak coverage**: Add additional const-ref material from the `draw_player` example (panorama/1-reference-params.md line 33) — `void draw_player(const player_data &player)`. Outline `acceptance.const_ref_evidence` field should reference both Q04 quote + this code citation.
