# Level 12 — Pass Composites — Notes

## Source

L9 R atoms + L10 G atoms combined. Q3 archetype evidence.

## L12 Atoms (PC-01..PC-06)

| ID | Fact | Q-tags |
|----|------|--------|
| PC-01 | pass struct by value copies whole | Q1S, Q3S |
| PC-02 | pass struct by ref: void f(Name &x) | Q1C, Q3C, Q4C |
| PC-03 | & lets struct mutation persist | Q1C, Q3C, Q4C |
| PC-04 | pass array by ref: void f(T &arr[], int n) | Q3C, Q4C |
| PC-05 | mutations to list[i].field persist | Q3C, Q4C |
| PC-06 | const Name &x read-only struct | Q1S, Q3S |

## SIT102 Idioms

- `void f(Name &x)` for mutating structs
- `void f(T &arr[], int n)` for mutating arrays of structs
- Mutations to `list[i].field` persist when array passed by ref

## Q3 Archetype

```cpp
void read_X(X &list[], int count) {
    for (int i = 0; i < count; i++) {
        cin >> list[i].field;
    }
}
```

PC-04 is the load-bearing atom.

## Bridges

| Atom | Deps | Status |
|------|------|--------|
| PC-02 | R-4, T-5 | both locked ✓ |
| PC-04 | R-3, R-4, G-13 | R locked, G this milestone |
| PC-05 | PC-04, T-12 | T locked ✓ |
