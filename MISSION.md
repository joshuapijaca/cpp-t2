# MISSION — Non-Negotiable Source of Truth

Last reaffirmed: 2026-05-03.

## North Star

**Take a student with zero C++ knowledge to acing all 4 questions of SIT102 Test 2 (Deakin, 2026 T1) in 56 hours of deliberate practice.**

No videos. No passive learning. No spaced repetition. No mastery gating. No save state. No runtime AI dependencies.

## The Invisible Chain (Inviolable)

Every advanced concept decomposes into a chain reaching back to "a computer runs programs." Skipping any link breaks 0→1.

```
Pre-programming (P)
  → Source skeleton (S)
    → Output (O)
      → Variables + types (V)
        → Input (I)
          → Operators (A)
            → Comparison + logical (C, L)
              → Conditionals (F)
                → Loops (W)
                  → Functions basic (H)
                    → ★ RDS Pass-by-Reference (R) ★
                      → Arrays (G)
                        → Structs (T)
                          → Pass composites (PC)
                            → Hand-execution skill (HE) [Q1]
                            → Struct-write (SW)         [Q2]
                            → Read-function write (RW)  [Q3]
                            → Main-write (MW)           [Q4]
                              → Mock exams (ME)
```

187 atoms across 18 levels. 1,159 DO cards (shipped) + ~892 SEE cards (planned) = ~2,051 total. Full DO enumeration: [docs/07_master_plan.md](docs/07_master_plan.md). SEE enumeration: [docs/14_see_cards_master_plan.md](docs/14_see_cards_master_plan.md).

## Non-Negotiables

| Rule | Why |
|------|-----|
| Strict axiom-first sequencing | Anti-pattern: starting at advanced topic because it "seems relevant" → calculus before algebra |
| RDS (`&`) front-loaded at Level 9 | Blocks 3 of 4 questions; must reach automaticity before composites |
| ≤7 words per memorize-card fact | Miller's law; working-memory load |
| Forward-only sequence | No skip-ahead; no back-jump UI |
| No mastery gating | Wrong → inline correction + retry once → continue |
| No save state | 14-day sprint; session-only; refresh = restart |
| No spaced repetition / SRS | Sprint not long-term retention |
| No runtime AI calls | Zero token cost at runtime; offline char-match grading |
| Char-match grading only | Whitespace-collapsed, case-insensitive, keyChecks token presence |
| Outline-anchored AI authoring (build-time only) | Per-atom YAML outline anchors AI; compile-check + audit + idiom-lint enforce quality. Zero runtime AI calls. See [docs/08_outline_spec.md](docs/08_outline_spec.md). |
| 7 card types max | DO: Memorize / MCQ / Trace / Write — SEE: Demo / Decompose / Walkthrough (per [docs/14_see_cards_master_plan.md](docs/14_see_cards_master_plan.md)) |
| MCQ capped at ≤20% | Recognition ≪ production |
| Memorize card = sprintlearn flashtype clone | flashSeconds + keyChecks + race/recall mode |
| Hand-trace card = IT-ELO T1 APK clone | Variable-box history strip + terminal panel + two-pass |
| Code-write card = 3-level scaffold | fill → complete → free; T1 single-AI-judged Q failed |
| Semantic CSS class layer | Maintainability over Tailwind utility chains |
| No content reuse from IT ELO | New templates only; old content trains recognition |
| Use PFG only as concept bridge | Not as content source |
| Variant deduplication by hash | Variable-name-only diff = duplicate, reject |
| Test 2 question shape stable | Q1 hand-trace MAX, Q2 struct, Q3 `void read_X(X &list[], int)`, Q4 main+printf |

## Q1-Q4 Question Shape (Stable Across Test Variants)

| Q | Task | Atoms required |
|---|------|---------------|
| Q1 | Hand-trace `who_am_i(stat_double &data)` → predict `d.mystery` | ~50 critical |
| Q2 | Write struct (3 fields: id, description, location) | ~14 critical |
| Q3 | Write `void read_X(X &list[], int count)` | ~35 critical |
| Q4 | Write `main()` with const MAX + array + cin count + call Q3 + printf loop | ~38 critical |

Variation hypothesis (per [docs/03_mastery_state_t2.md](docs/03_mastery_state_t2.md)):
- **Stable**: 4-question format, MAX-finder algorithm, 3-field struct, `void read_X(X &list[], int)` shape, `const MAX + main + printf` pattern
- **Variable**: entity name, field names, array values, printf format specifier mix

Train on shape + concept; not on memorizing specific entities.

## Mastery Definition

Student passes T2 cold under timer if:
1. Hand-traces a `who_am_i`-style function with struct + array + `&` correctly
2. Writes a 3-field struct definition syntactically valid
3. Writes a `void read_X(X &list[], int count)` function with for-loop + cin per field
4. Writes a `main()` with const MAX + array + cin + Q3 call + printf loop with `.c_str()` for strings + return 0

All 4 = 100%. Three of 4 with the RDS intact = pass.

## Anti-Drift Pledge

The temptation to "improve" by adding spacing, mastery gates, save state, or AI grading must be resisted. These features are **deliberate omissions**, not oversights. They were rejected for reasons documented in:

- [docs/01_audit_it_elo.md](docs/01_audit_it_elo.md) — why IT ELO failed
- [docs/05_audit_three_apps.md](docs/05_audit_three_apps.md) — what 3 prior apps proved unnecessary
- [ANTIPATTERNS.md](ANTIPATTERNS.md) — specific shortcut behaviors banned

If a future iteration *suggests* re-adding any banned feature, the proposal must:
1. Cite a measured failure of the current architecture
2. Show why the original rejection rationale no longer applies
3. Be authorized by the user via CHANGELOG entry before merge

Drift = quality decay. Defend the spec.
