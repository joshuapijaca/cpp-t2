# Level 10 — Arrays — Notes

## Source

PFG Part 2.5 working-with-multiples + Test 2 banks for `list[MAX]` patterns.

## L10 Atoms (G-01..G-14)

| ID | Fact | Q-tags |
|----|------|--------|
| G-01 | array = sequence of N values | Q1S, Q3C, Q4C |
| G-02 | type arr[N]; declares | Q3C, Q4C |
| G-03 | type arr[N] = {...}; init | (rare in T2) |
| G-04 | arr[0] is first element | Q1C, Q3C, Q4C |
| G-05 | arr[i] is i-th element | Q1C, Q3C, Q4C |
| G-06 | arrays index from 0 | Q1C, Q3C, Q4C |
| G-07 | last is arr[N-1] | (informational) |
| G-08 | arr[N] out of bounds (UB) | (warning) |
| G-09 | array size fixed at compile | Q4C |
| G-10 | cannot return array | Q3C |
| G-11 | for loop iterates array via i < N | Q1C, Q3C, Q4C |
| G-12 | arr[i] = value; writes element | Q1C, Q3C, Q4C |
| G-13 | array param: type arr[] | Q3C |
| G-14 | &arr[] alias caller's array | Q3C, Q4C |

## SIT102 Idioms

| Idiom | Detail |
|-------|--------|
| `Type arr[N];` | Declare with size N |
| `arr[i]` | Index access; 0-based |
| `arr[i] = v;` | Write to element |
| `&array[]` in param | Pass by reference (Q3 idiom) |

## Out-of-scope

- Pointer arithmetic
- Multi-dim arrays
- Dynamic arrays / `vector` / `new[]`
- `std::array`

## Bridges

| Atom | Forward dep | Status |
|------|-------------|--------|
| G-02 | V-04 (declare type name) | M9 backfill |
| G-04 | A-05 (= assigns) | M9 backfill |
| G-14 | R-3 (&) | locked at L9 ✓ |
