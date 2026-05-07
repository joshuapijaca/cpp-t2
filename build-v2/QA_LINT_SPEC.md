# cpp-t2 v2 — QA Lint Spec

**Status**: shipped 2026-05-07 by `QA-1`.
**Scope**: lint pipeline for the Option-4 max-quality build (4,600 hand-authored cards across L0..L5).
**Source-of-truth schema**: [`cpp-t2/src-v2/types/card-schema.ts`](../src-v2/types/card-schema.ts) (LOCKED).

The lint pipeline is the gate that prevents bad content from reaching review. Per RULE 4 (max quality / min compromise): a buggy card means the student trains the wrong thing. Lint catches what humans miss.

The pipeline runs at every stage gate of the multi-pass authoring flow:

```
SA  →  VE  →  PR  →  QA
draft  verify  review  approve
[lint] [lint]  [lint]  [lint]
```

A card may not advance to the next stage with any lint **error**. Warnings surface but do not block.

---

## Three lint passes

| Script                     | Scope               | Reads                       | Runs at        |
|----------------------------|---------------------|-----------------------------|----------------|
| `lint-cards.ts`            | per-card            | `data/v2/cards/**/*.yml`    | every commit + every stage gate |
| `lint-atoms.ts`            | atom DAG            | `data/v2/atoms/*.yml`       | atom-gate (M12) + every commit that touches `data/v2/atoms/` |
| `lint-deck.ts`             | system invariants   | cards + atoms + CMs         | deck-gate (post-M22) + nightly CI |

The aggregate command is `npm run lint:v2`, which chains all three. CI / pre-merge MUST run `npm run lint:v2` and gate on exit code.

---

## `npm run lint:v2-cards` — per-card checks

Reads every card YAML and validates each card.

| # | Rule code             | Type   | What it catches |
|---|-----------------------|--------|-----------------|
| 1 | `zod`                 | error  | required fields, `schemaVersion === "v2"`, type-discriminator literal, every field shape locked by `card-schema.ts` |
| 2 | `atom-missing`        | error  | `atomId` references an atom file that doesn't exist at `data/v2/atoms/<id>.yml` |
| 3 | `qtags-empty`         | error  | `qTags` is missing or empty (every card lights up at least one of Q1..Q4) |
| 4 | `source-missing`      | error  | no `source` object — RULE 4 code-anchored: every card cites |
| 5 | `source-kind`         | error  | `source.kind` not in `{practice, v2, pfg, seminar}` |
| 6 | `source-ref`          | error  | `source.ref` empty or missing |
| 7 | `auth-status`         | error  | `authoringStatus` not in `{DRAFT, REVIEWED, APPROVED}` (default `DRAFT` if absent) |
| 8 | `brace-balance`       | error  | any code-bearing field (`code`, `canonicalAnswer`, etc.) has unbalanced `{`/`}` |
| 9 | `no-semicolon`        | warn   | code field contains zero `;` — verify intent (single-expression cloze is a legitimate case) |
| 10| `forbidden-token`     | error  | code field or prompt contains an off-scope token: `while`, `do`, `printf`, `scanf`, `getline`, `recursion`, `recursive` |
| 11| `word-memorize-suspect` | warn | card has no code AND `stem.length < 80` — flag for human review (post-M22 redesign forbids word-memorize) |
| 12| `keycheck-orphan`     | error  | a `keyCheck` token is missing from the card's `canonicalAnswer` (after operator-spacing normalization) |
| 13| `canon-brace`         | error  | `canonicalAnswer` braces unbalanced |
| 14| `canon-end`           | error  | `canonicalAnswer` doesn't end with `}` or `;` |
| 15| `yaml-parse`          | error  | YAML can't be parsed |

**`authoringStatus`** is a YAML-level key separate from the schema's runtime `status` (NEW/IN-PROGRESS/FAMILIAR). It governs the SA → VE → PR → QA pipeline; runtime `status` governs spaced-repetition state.

### Exit codes

| Code | Meaning |
|------|---------|
| 0    | clean — 0 errors (warnings allowed) |
| 1    | at least one error — blocks merge / stage gate |
| 2    | internal lint failure (schema not found, IO error, etc.) — investigate |

### Output formats

- Default: human-readable, grouped by file. Each finding shows `ERR`/`WRN`, rule code, card id, detail.
- `--json`: machine-readable JSON (used by CI). Shape:
  ```json
  {
    "totalCards": 42,
    "totalFiles": 6,
    "errors":   [{ "level":"error", "file":"...", "cardId":"...", "rule":"zod", "detail":"..." }],
    "warnings": [...]
  }
  ```

### Fixtures

- `build-v2/__fixtures__/bad-card.yml` — intentionally malformed; the test in `__tests__/lint.spec.ts` asserts the lint flags it.
- `build-v2/__fixtures__/good-card.yml` — a minimally valid `FunctionWriteCard`; lint must pass with 0 errors.

---

## `npm run lint:v2-atoms` — atom DAG checks

Reads `data/v2/atoms/*.yml` and validates the atom graph as a whole.

Atom YAML shape (locked):

```yaml
schemaVersion: v2
id: F-07
title: "Pass by reference"
level: L2                 # L0..L5
qTracks: [Q2, Q3]
prereqs: [F-04, F-06]
source:
  kind: pfg
  ref: "PFG ch.7 §7.3"
commonMistakeIds: [CM-missing-amp]
notes: "..."
```

| Rule code             | Type   | What it catches |
|-----------------------|--------|-----------------|
| `zod`                 | error  | atom shape (id format, level enum, source citation, qTracks ≥1, prereqs are valid AtomIds) |
| `filename-mismatch`   | error  | filename ≠ `<id>.yml` |
| `id-collision`        | error  | two atom files declare the same `id` |
| `prereq-missing`      | error  | a prereq references an atom that doesn't exist |
| `cycle`               | error  | the prereq graph has a cycle (Kahn topo sort) |
| `source-missing`      | error  | atom has no source citation |
| `qtracks-empty`       | error  | atom doesn't support any Q-track |
| `orphan-atom`         | warn   | atom is not referenced by any card and is not a prereq of another atom (expected pre-M12) |
| `atoms-empty`         | warn   | `data/v2/atoms/` is empty (expected pre-M12) |

Exit codes: same as `lint-cards.ts`.

---

## `npm run lint:v2-deck` — system invariants

Coverage gates that only exist at the deck level. These catch the failure mode where every individual card is valid but the deck has gaps that would let a student through without exposure.

| Rule code              | Type   | What it catches |
|------------------------|--------|-----------------|
| `atom-undercoverage`   | error  | atom has < 6 cards (exposure-frequency floor) |
| `atom-single-modality` | error  | atom has < 2 distinct card types |
| `atom-zero-cards`      | error  | atom declared in `data/v2/atoms/` but has 0 cards (only enforced when atoms file exists) |
| `cm-undercoverage`     | error  | common-mistake has < 3 immunization cards |
| `cm-orphan-ref`        | error  | a card references a `commonMistakeId` that has no CM file |
| `q-stage-gap`          | error  | a Q-track (Q1..Q4) doesn't have at least one card at every stage S1..S6 |
| `pattern-undercoverage`| error  | (algorithm × entity × fieldCount) tuple from the atom registry has 0 cards (only when atom carries those fields) |
| `no-cards`             | warn   | no valid cards yet — pre-authoring state, lint is a no-op |

The (algorithm × entity × field-count) check is opt-in per atom: only atoms that declare `algorithm`, `entity`, and `fieldCount` participate. This keeps it from spuriously firing on atoms that aren't algorithm/entity-driven.

Exit codes: same as `lint-cards.ts`.

---

## When each lint runs

| Trigger                              | Commands |
|--------------------------------------|----------|
| Pre-commit hook (every commit)       | `npm run lint:v2-cards` (only for staged YAML in `data/v2/cards/`) |
| Atom-gate (M12 — atom DAG closes)    | `npm run lint:v2-atoms` |
| Per-card stage gate (SA→VE→PR→QA)    | `npm run lint:v2-cards` |
| Deck-gate (post-M22 — deck closes)   | `npm run lint:v2` (full chain) |
| Nightly CI                           | `npm run lint:v2` + `npm run test:v2` |

Pre-commit can scope `lint-cards.ts` to changed files only; the script itself reads the full glob (it's fast — a few hundred ms even at 4,600 cards).

---

## Reading lint output

Human format:

```
[lint:v2-cards] 6 files, 42 cards scanned

  data/v2/cards/F-07/swap.yml
    ERR zod [bad-card-001]: schemaVersion: Invalid literal value, expected "v2"
    ERR forbidden-token [bad-card-001]: canonicalAnswer: contains off-scope token(s): while, printf
    WRN word-memorize-suspect [bad-card-001]: card has no code AND stem.length=10 (<80)

[lint:v2-cards] 2 error(s), 1 warning(s)
```

- `ERR` = error → fix before merge.
- `WRN` = warning → review, fix if real, otherwise comment in `notes`.
- File path is relative to the cpp-t2 project root.
- Card ID in brackets pinpoints the specific card inside multi-card YAML files.

---

## Adding new checks

When a new failure mode is found in the wild:

1. Add a rule to the appropriate lint file with a stable `rule` code.
2. Add (or extend) a fixture in `__fixtures__/` that triggers it.
3. Add an assertion in `__tests__/lint.spec.ts`.
4. Document the rule in this file under the right table.
5. Append an entry to `data/v2/agent-ledger.jsonl`.

Never weaken an existing check to make a card pass. If a real card needs an exception, fix the card or carve a precise carve-out at the card-type level (not a global escape hatch).
