# Level 13 — Hand-Execution Skill — Notes

## Source Strategy

L13 atoms are meta-cognitive skills (mental simulation), not C++ concepts. PFG has no dedicated chapter on hand-tracing references — its `03-hand-execution.mdx` covers pointer-execution (out-of-scope per M2 notes).

Sources for L13:

| Source | Use |
|--------|-----|
| L9 R-atom mental model (from `_legacy_apps/it-elo/src/data/pfg-content/part-2-organised-code/4-indirect-access/`) | Reference semantics; "alias" framing |
| `_legacy_apps/it-elo/src/data/practice-test2-bank.ts` | Q1 `who_am_i` canonical pattern (struct + & + max-finder) |
| `cpp-t2/docs/06_audit_it_elo_t1_apk.md` | Variable-box history-strip schema |
| `cpp-t2/docs/02_audit_t1_app.md` | Two-pass trace methodology |

## L13 Atoms (per docs/07_master_plan.md Level 13)

| ID | Fact | Skill |
|----|------|-------|
| HE-01 | trace = mentally simulate | foundational meta-skill |
| HE-02 | track each var's value | per-variable state tracking |
| HE-03 | update value on each assignment | mutation tracking |
| HE-04 | for-loop: track i across iterations | loop tracking |
| HE-05 | conditional: pick branch by cond | branch selection |
| HE-06 | function call: enter new frame | stack frame discipline |
| HE-07 | return: exit frame, locals die | locals scope at return |
| HE-08 | & param = SAME box, persists | reference param trace |
| HE-09 | arr[i] write persists if & | array element mutation via & |
| HE-10 | trace x = 5; y = x; final | chained assignment trace |
| HE-11 | trace arr[i] = v; final array | array element write trace |
| HE-12 | trace for-loop iterations | full loop trace |
| HE-13 | trace if/else branches | branch taken trace |
| HE-14 | trace function call + return | call+return state |
| HE-15 | trace pass-by-value vs & | value vs reference contrast |
| HE-16 | trace max-finder algorithm | Q1 archetype |
| HE-17 | trace struct field mutation via & | struct + & combo |
| HE-18 | trace data.numbers[i] > data.mystery | Q1-specific operator combo |

## SIT102-Specific Trace Conventions

| Convention | Detail |
|------------|--------|
| Variable boxes | One box per variable; horizontal history strip |
| Reference visualization | One box, two labels (caller name + param name) |
| Strikethrough on mutation | Old value crossed; new value bold |
| Terminal panel | Separate from variable boxes |
| Inline condition viz | "i < 5 → true" rendered next to tested var |
| Two-pass trace | Same code, full + partial-stop |
| Stop conditions | "i == N" or similar — student halts at this point |

## Scope

**In-scope**: hand-tracing of C++ code involving R-atoms (Level 9), G-atoms (arrays, Level 10), T-atoms (structs, Level 11), F/W atoms (conditionals/loops). Reference semantics only.

**Out-of-scope**: pointer dereferencing, dynamic allocation, recursion, classes/methods, file I/O, multi-dimensional arrays.

## Q1 Archetype (test2_bank evidence)

Test 2 Q1 always = `who_am_i(stat_double &data)` find MAX in array. The trace must:
1. Initialize `d.mystery = d.numbers[0]`
2. Loop `for (int i = 1; i < 5; i++)`
3. Test `if (d.numbers[i] > d.mystery)` per iteration
4. On true: assign `d.mystery = d.numbers[i]`
5. After loop: `d.mystery` holds the MAX value

HE-16, HE-17, HE-18 cover this pattern composite-by-composite.

## Out-of-Scope Discoveries

| Item | Status |
|------|--------|
| Pointer hand-trace (PFG `03-hand-execution.mdx`) | OUT — pointer mechanics, not references |
| Heap allocation (PFG `6-deep-dive-memory/`) | OUT — stack-only for T2 |
| `cout` chaining inside Q1 | OUT — Q1 is `void who_am_i` (no output) |

## Bridges to Other Levels

| Atom depends on | Status |
|----------------|--------|
| HE-04 → W-3 (for-loop header, Level 7) | not yet locked; M9 backfill |
| HE-05 → F-1 (if statement, Level 6) | not yet locked; M9 backfill |
| HE-06 → H-2 (function signature, Level 8) | not yet locked; M9 backfill |
| HE-08 → R-3, R-4, R-5 (Level 9) | ✓ locked |
| HE-09 → G-12 (arr[i] write, Level 10) | not yet locked; M9 backfill |
| HE-17 → T-7 (struct write field, Level 11) | not yet locked; M6 |

**Resolution**: Forward-deps tolerated for M4 since vertical-slice strategy. Same as M2-M3 starting at L9 without L0-L8. M9 backfill closes prereq chain.
