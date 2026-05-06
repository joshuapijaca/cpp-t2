# Q1 — `who_am_i` Hand-Trace Variants

5 published test 2 variants (extracted from `_legacy_apps/it-elo/src/data/practice-test2-bank.ts`). Algorithm always max-finder. Struct shape always `stat_double` with array + scalar.

---

## Variant 1 — `computer_data` (or stat_double base)

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

| # | numbers[] | mystery (final) | mystery at i==3 (partial-stop) |
|---|-----------|-----------------|--------------------------------|
| 1 | {3.2, 7.1, 5.0, 9.4, 2.8} | 9.4 | 7.1 |
| 2 | {88.5, 91.0, 76.2, 65.4, 82.1} | 91.0 | 91.0 |
| 3 | {4.4, 1.2, 8.7, 6.0, 3.5} | 8.7 | 8.7 |
| 4 | {0.5, 1.8, 2.1, 0.9, 3.0} | 3.0 | 2.1 |
| 5 | {5.0, 4.2, 6.8, 3.1, 7.7} | 7.7 | 6.8 |
| 6 | {1.0, 2.0, 3.0, 4.0, 5.0} | 5.0 | 3.0 |
| 7 | {5.0, 4.0, 3.0, 2.0, 1.0} | 5.0 | 5.0 |
| 8 | {3.0, 3.0, 3.0, 3.0, 3.0} | 3.0 | 3.0 |
| 9 | {-1.0, -2.0, -3.0, -4.0, -5.0} | -1.0 | -1.0 |
| 10 | {10.0, 5.0, 15.0, 8.0, 12.0} | 15.0 | 15.0 |
| 11 | {0.1, 0.2, 0.3, 0.4, 0.5} | 0.5 | 0.3 |
| 12 | {2.5, 7.5, 6.5, 3.5, 4.5} | 7.5 | 7.5 |
| 13 | {6.0, 6.5, 6.2, 6.8, 6.1} | 6.8 | 6.5 |
| 14 | {99.9, 50.0, 75.0, 25.0, 60.0} | 99.9 | 99.9 |
| 15 | {1.5, 9.5, 3.5, 9.5, 5.5} | 9.5 | 9.5 |

(Strict `>`: ties don't update; first-largest wins. Partial-stop = mystery's value AFTER i=1 and i=2 iterations complete, BEFORE i=3 iter runs.)

---

## Concept Coverage Matrix

| Atom | Used in Q1 |
|------|-----------|
| R-01 (default copy) | C |
| R-02 (mutation doesn't change caller) | C (contrast) |
| R-03 (& = alias) | C |
| R-04 (void f(T &x) shares box) | C |
| R-05 (& mutation persists) | C |
| HE-01 (trace = simulate) | C |
| HE-02 (track each var) | C |
| HE-03 (update on assignment) | C |
| HE-04 (for-loop iter tracking) | C |
| HE-05 (conditional branch) | C |
| HE-06 (function frame entry) | C |
| HE-07 (return exits frame) | C |
| HE-08 (& param SAME box) | C |
| HE-12 (trace for-loop) | C |
| HE-13 (trace if/else) | C |
| HE-14 (trace call + return) | C |
| HE-16 (max-finder trace) | C |
| HE-17 (struct field via &) | C |
| HE-18 (data.numbers[i] > data.mystery) | C |
| T-1..T-12 (struct mechanics, Level 11) | C (M6) |
| G-1..G-14 (array mechanics, Level 10) | C (M9) |
| W-3..W-6 (for-loop, Level 7) | C (M9) |
| F-1, F-2 (if/else, Level 6) | C (M9) |

---

## Variation Hypothesis Confirmed

| Stable | Variable |
|--------|----------|
| Algorithm = MAX | Array values |
| Struct shape `stat_double` | Specific array contents |
| Loop: `for (int i = 1; i < 5; i++)` | (none — `i < 5` always) |
| Initial: `data.mystery = data.numbers[0]` | (none) |
| Comparison: `> data.mystery` | (none) |
| Mutation: `data.mystery = data.numbers[i]` | (none) |

**Implication**: Train on shape + concept. The 5 variants exercise the same trace skill. Cards generated for HE-16, HE-17, HE-18 should vary array values across instances but preserve algorithm.
