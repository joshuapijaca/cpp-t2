# Level 14 — Struct-Write Skill (Q2) — Notes

## Q2 Archetype

Test 2 Q2 always: **write a struct definition with 3 fields**. Entity name + field names vary; structure stable.

```cpp
struct entity_name {
    type1 field1;
    type2 field2;
    type3 field3;
};
```

## L14 Atoms

| ID | Fact | Description |
|----|------|-------------|
| SW-01 | write `struct Name { ... };` skeleton | Outer shape |
| SW-02 | write field: `type fieldName;` | Per-field syntax |
| SW-03 | terminate struct with `};` | Trailing semicolon |
| SW-04 | choose types per spec | int / double / string |
| SW-05 | field order arbitrary | Spec lists fields; order doesn't matter for correctness |

## Q2 Variants (15 for sims)

| # | Entity | Field 1 (int) | Field 2 (string) | Field 3 (string) |
|---|--------|---------------|------------------|------------------|
| 1 | computer_data | id | description | location |
| 2 | student_data | id | name | course |
| 3 | employee_data | id | name | department |
| 4 | vehicle_data | year | make | model |
| 5 | sensor_data | id | type | location |
| 6 | book_data | year | title | author |
| 7 | patient_record | id | name | ward |
| 8 | product_data | code | name | category |
| 9 | event_data | id | date | venue |
| 10 | account_data | number | holder | branch |
| 11 | movie_data | id | title | genre |
| 12 | song_data | id | title | artist |
| 13 | course_data | code | name | instructor |
| 14 | ticket_data | id | event | seat |
| 15 | order_data | id | customer | status |

## SIT102 Idioms

| Idiom | Detail |
|-------|--------|
| `struct Name { fields };` | C++ form, not `typedef struct` |
| Whitespace-tolerant | Indentation cosmetic |
| Field separator | `;` after each field |
| String type | `string`, not `std::string` (using namespace std) |

## Out-of-Scope

- Constructors
- Inheritance
- `class`
- Default field values

## Bridges

L14 atoms depend on L11 T atoms. M6 extracts both. Atom dependencies:
- SW-01 → T-02
- SW-02 → T-03
- SW-03 → T-04
- SW-04 → V-10, V-11, V-12 (types — M9 backfill, but tolerable)
- SW-05 → T-02
