# TYPECHECK_FINAL — src-v2 type-check sweep (2026-05-07)

Owner: TS-TYPECHECK-SPECIALIST
Tooling: TypeScript ~5.6, strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes + noUnusedLocals + noUnusedParameters

## Result

| Pass | Errors | Status |
|------|-------:|--------|
| Initial (pre-fix) | 11 | FAIL |
| Pass 2 (after first 6 fixes) | 1 | FAIL — surfaced CardRenderer wiring gap |
| Pass 3 (after CardRenderer wiring) | 1 | FAIL — surfaced missing vite/client types |
| Pass 4 (after vite-env.d.ts) | **0** | **PASS** |

`npm run type-check:v2` exits 0 with no diagnostics.

## Configuration changes

- Created `cpp-t2/src-v2/tsconfig.json` extending root `cpp-t2/tsconfig.json`
  (rootDir + outDir override, glob include).
- Created `cpp-t2/src-v2/vite-env.d.ts` with the `vite/client` triple-slash
  reference (mirrors `cpp-t2/src/vite-env.d.ts`). Required for
  `import.meta.glob` typing in `src-v2/main.tsx`.
- Added `type-check:v2` script to `cpp-t2/package.json`
  (alongside the existing `type-check`).

## Errors fixed (categorised)

### exactOptionalPropertyTypes violations (2)
- `src-v2/lib/grading-write.ts:294` — `missing-semicolon` error literal had
  `line: number | undefined` but `WriteError.line` is `line?: number`.
  Fixed by constructing the object without `line` and assigning conditionally
  when `lineOf(...)` returns a defined number.
- `src-v2/lib/grading-write.ts:308` — same pattern for `forbidden-token`.

### noUncheckedIndexedAccess violations (2)
- `src-v2/components/primitives/AppShell.tsx:147` — `NAV[0]` is `NavItem | undefined`
  under noUncheckedIndexedAccess; downstream `activeNav.label` reads at lines
  222 and 361 became "possibly undefined". Fixed with a non-null assertion
  (`NAV[0]!`) since NAV is a static, non-empty const array — comment added.

### Type-mismatch / readonly-tuple (5)
- `src-v2/components/cards/__stories__/TraceCard.stories.tsx` (5 occurrences) —
  `as const` on the `baseFields` literal made `qTags` a `readonly ['Q1', 'Q4']`
  tuple, incompatible with the schema's mutable `('Q1'|'Q2'|'Q3'|'Q4')[]`.
  Fixed by removing `as const` and explicitly typing the helper as
  `Omit<TraceCardData, ...per-card-fields>`.

### Missing component prop wiring (1)
- `src-v2/components/CardRenderer.tsx:63` — `TemplateRecallCardProps.mode`
  is required but the dispatcher omitted it. Fixed by passing
  `mode={card.status === 'FAMILIAR' ? 'all-at-once' : 'line-by-line'}`,
  matching the comment-documented intent (line-by-line for first encounters,
  all-at-once once familiar).

### Unused locals/imports (4 — the "pre-existing" set)
- `src-v2/engines/daily-deck-composer.ts:398` — unused `minDom` (audit step
  rebalances this fraction; declaration was dead). Removed; comment expanded.
- `src-v2/components/cards/DecomposeCard.tsx:145` — unused `i` in
  `card.options.map((opt, i) => ...)`. Dropped the index parameter (key uses
  `opt.label`).
- `src-v2/pages/Mock.tsx:133` — `setPerQAnswer` setter unused (per-question
  answer capture not yet wired). Renamed to `_setPerQAnswer` to preserve
  the contract while satisfying `noUnusedLocals`.
- `src-v2/pages/Postmortem.tsx:25` — `QResult` imported but unused. Dropped
  from the import list.

### Missing ambient types (1 — surfaced after the above were fixed)
- `src-v2/main.tsx:39` — `import.meta.glob` not typed because the v2 tree
  had no `vite/client` reference. Fixed by creating
  `src-v2/vite-env.d.ts`.

## Significant fixes summary

1. New `src-v2/tsconfig.json` (extends root, scopes the v2 tree).
2. New `src-v2/vite-env.d.ts` (Vite ambient types).
3. `package.json` — added `type-check:v2` script.
4. `grading-write.ts` — exactOptional-safe construction of `WriteError`.
5. `AppShell.tsx` — non-null assertion on the static `NAV[0]` fallback.
6. `TraceCard.stories.tsx` — explicit `Omit<TraceCardData, ...>` typing on
   the shared base fields, removing the `readonly` tuple regression.
7. `CardRenderer.tsx` — wired `mode` prop on `TemplateRecallCard` dispatch.
8. `daily-deck-composer.ts`, `DecomposeCard.tsx`, `Mock.tsx`,
   `Postmortem.tsx` — dead-name elimination per `noUnusedLocals`.

## Deferred items

None. All errors fixed; the v2 tree is type-clean under
strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes +
noUnusedLocals + noUnusedParameters.

The `_setPerQAnswer` rename in `Mock.tsx` is a "preserve contract until
wired" fix, not a deferred error — it's already type-clean. Whoever wires
per-question answer capture should rename it back when the call sites land.

## Reproduce

```
cd cpp-t2
npm run type-check:v2
```

Expected: exit 0, no output.
