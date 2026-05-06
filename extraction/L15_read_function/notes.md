# Level 15 — Read-Function Write Skill (Q3) — Notes

## Q3 Archetype

```cpp
void read_X(X &list[], int count) {
    for (int i = 0; i < count; i++) {
        cin >> list[i].field1;
        cin >> list[i].field2;
        cin >> list[i].field3;
    }
}
```

## L15 Atoms (RW-01..RW-07)

| ID | Fact | Description |
|----|------|-------------|
| RW-01 | write void signature | Return type for read function |
| RW-02 | write Type &list[] parameter | Pass by reference |
| RW-03 | write int count parameter | Second param |
| RW-04 | write outer for (int i = 0; i < count; i++) | Loop |
| RW-05 | write cin >> list[i].field; | Read into element field |
| RW-06 | one cin per struct field | All fields populated |
| RW-07 | optional cout prompt before each cin | UX nicety (not graded) |

## Q3 15-Variant Sims

Match Q2 entity variants. Each produces a `read_<entity>` function.

| # | Entity | Function name | 3 fields |
|---|--------|---------------|----------|
| 1 | computer_data | read_computers | id, description, location |
| 2 | student_data | read_students | id, name, course |
| ... | (15 total, mirroring Q2) | | |

## SIT102 Idioms

| Idiom | Detail |
|-------|--------|
| `void` return | Don't return value; mutate via `&` |
| `&list[]` | Reference array idiom |
| `cin >>` per field | One read per struct member |
| `for (int i = 0; i < count; i++)` | Standard zero-based loop |
| Indent body with 4 spaces | Convention |

## Out-of-scope

- `getline` (not used in Q3 typical answers)
- Bounds checking
- Error handling
- Validation

## Bridges

| Atom | Deps | Status |
|------|------|--------|
| RW-01 | H-04 (void) | M9 backfill |
| RW-02 | PC-04 (&array[]) | this milestone |
| RW-04 | W-3 (for header) | M9 backfill |
| RW-05 | I-3 (cin >> x), T-12 (list[i].field) | I in M9; T-12 locked |
