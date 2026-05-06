# Level 11 — Structs — Notes

## Source

PFG Part 2.3 structuring-data: `_legacy_apps/it-elo/src/data/pfg-content/part-2-organised-code/3-structuring-data/`.

## L11 Atoms

| ID | Fact | Description |
|----|------|-------------|
| T-01 | struct = named field group | Foundational concept |
| T-02 | `struct Name { fields };` defines type | Declaration syntax |
| T-03 | each field: `type fieldName;` | Field declaration |
| T-04 | `;` required after closing `}` | Trailing semicolon |
| T-05 | use type: `Name x;` | Instantiate |
| T-06 | `x.field` accesses field | Dot operator |
| T-07 | `x.field = v;` writes field | Field assignment |
| T-08 | `cout << x.field;` reads field | Field read |
| T-09 | struct can contain array field | Aggregate composition |
| T-10 | chained: `data.arr[i]` | Field + index |
| T-11 | array of structs: `Name list[N];` | Aggregate of aggregates |
| T-12 | `list[i].field` chained access | Index + field |

## SIT102 Idioms

| Idiom | Detail |
|-------|--------|
| `struct Name { ... };` | C++ form (not C-style typedef) |
| 3 fields per Q2 struct | Always 3 in Test 2 Q1, Q3, Q4 |
| Field types | int, double, string |
| `string` requires `#include <string>` | Often forgotten |

## Out-of-Scope

| Item | Reason |
|------|--------|
| Inheritance | Not in T2 |
| Methods (member functions) | Not in T2 |
| `class` keyword | Not in T2 |
| Constructors | Not in T2 |
| `typedef struct` (C-style) | C++ uses `struct Name { };` directly |

## Bridges

| Atom | Forward dep | Status |
|------|-------------|--------|
| T-09 | G-2 (arrays, Level 10) | Not yet locked; M9 backfill |
| T-11 | G-2 | Same |
| T-12 | G-5 (arr[i]) | Same |

Same vertical-slice approach: M6 introduces struct mechanics; full array foundation backfills at M9.
