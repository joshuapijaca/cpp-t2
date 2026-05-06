# Level 13 — Hand-Execution — Source Quotes

L13 atoms are meta-cognitive skills, not C++ concepts. PFG has no dedicated reference-trace chapter (only pointer-trace, out-of-scope). Sources draw from L9 mental model + Q1 test bank + variable-box methodology.

---

## Q01 — Reference is alias (anchor for HE-08, HE-15, HE-17)

**Source**: `_legacy_apps/it-elo/src/data/pfg-content/part-2-organised-code/4-indirect-access/2-trailside/01-pass-by-ref.mdx`
**Lines**: 56-59
**Verbatim**:

> This means that instead of storing a copy of the value of `val`, it stores the address of `val` in `data`. Now, any operations using `data` in `double_it()`, will be effectively referring to `val` in `main()`.

**Use for atoms**: HE-08, HE-15

---

## Q02 — Pass-by-value receives copy (anchor for HE-15)

**Source**: same chapter, lines 173-177
**Verbatim**:

> So far we have been using pass by value for all of our parameters. With pass by value, the parameter receives a copy of the value passed in the argument. In this case, any expression is evaluated first, and the value copied across.

**Use for atoms**: HE-15 (contrast)

---

## Q03 — Q1 archetype (anchor for HE-16, HE-17, HE-18)

**Source**: `_legacy_apps/it-elo/src/data/practice-test2-bank.ts` (Q1 across all 5 entity variants)
**Pattern**:

```cpp
struct stat_double {
    double numbers[N];
    double mystery;
};

void who_am_i(stat_double &data) {
    data.mystery = data.numbers[0];
    for (int i = 1; i < N; i++) {
        if (data.numbers[i] > data.mystery) {
            data.mystery = data.numbers[i];
        }
    }
}
```

This is the canonical Q1 shape across all 5 published Test 2 variants. Stable algorithm: max-finder. Stable structure: struct holding array + scalar.

**Use for atoms**: HE-16, HE-17, HE-18

---

## Q04 — Variable-box methodology (anchor for HE-01, HE-02, HE-03)

**Source**: `cpp-t2/docs/06_audit_it_elo_t1_apk.md` §"Variable-Box Schema"
**Pattern**: Each variable rendered as a horizontal history strip. Old values strikethrough, current value bold. Each line of code that mutates a variable triggers a new step in that variable's history.

```
i:       [0] [1] [2] [3]
sum:     [0] [10] [19] [27]
max:     [0] [10] [10] [10]
```

**Use for atoms**: HE-01, HE-02, HE-03 (foundational tracking skills)

---

## Q05 — Two-pass trace methodology (anchor for HE-12)

**Source**: `cpp-t2/docs/02_audit_t1_app.md` §"Two-pass loop trace"
**Pattern**: Same code traced twice — once full execution, once with `q4StopCondition` like `i == 4`. Tests both normal mental model AND mid-loop divergent state recognition.

**Use for atoms**: HE-12 (loop iteration tracking)

---

## Q06 — Function frame (anchor for HE-06, HE-07)

**Source**: `_legacy_apps/it-elo/src/data/pfg-content/part-2-organised-code/2-organising-code/` (function chapter — implicit, not directly cited)
**Concept**: When a function is called, a new stack frame is pushed. Local variables (including value parameters) live in this frame. On return, the frame is popped — locals cease to exist. Reference parameters do not "die" because they were aliases for the caller's box, not new storage.

**Use for atoms**: HE-06, HE-07

---

## Atom Coverage Summary

| Atom | Quote(s) | Coverage |
|------|---------|----------|
| HE-01 | Q04 | adequate |
| HE-02 | Q04 | adequate |
| HE-03 | Q04 | adequate |
| HE-04 | derived from W-3 (Level 7, future M9) | thin — bridge from L7 |
| HE-05 | derived from F-1 (Level 6, future M9) | thin — bridge from L6 |
| HE-06 | Q06 | adequate |
| HE-07 | Q06 | adequate |
| HE-08 | Q01 | strong |
| HE-09 | derived from G-12 (Level 10, future M9) | thin — bridge from L10 |
| HE-10..HE-14 | methodology + canonical examples | adequate |
| HE-15 | Q01 + Q02 | strong |
| HE-16 | Q03 | strong (Q1 archetype) |
| HE-17 | Q03 | strong |
| HE-18 | Q03 | strong |

**M9 backfill** will provide deeper anchors for HE-04, HE-05, HE-09 once L6, L7, L10 atoms are extracted.
