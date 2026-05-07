# cpp-t2 v2 Engine Test Suite — Final Report

**Date:** 2026-05-07
**Runner:** vitest 2.1.9
**Reporter:** verbose
**Coverage tool:** @vitest/coverage-v8

## Executive summary

| Metric | Value |
|---|---|
| Test files | 6 |
| Tests total | 206 |
| Tests passed | **206** |
| Tests failed | 0 |
| Tests skipped | 0 |
| Flaky tests | 0 |
| Engine files covered | 7 / 7 |
| Lines coverage (engines aggregate) | **99.27 %** |
| Branches coverage (engines aggregate) | **91.75 %** |
| Functions coverage (engines aggregate) | **100 %** |
| Wall-clock duration | 631 ms |

All seven v2 engines pass at the ≥95 % lines target stipulated in RULE 4. Zero
suites are skipped or marked `.todo`. Zero `it.skip` / `xit` / `.only`
calls. Counter-math invariants verified across 1,000 random operations
(deterministic LCG seed `0xC0FFEE` — reproducible failures).

## Per-engine pass / fail

| Engine | Test file | Tests | Pass | Fail |
|---|---|---:|---:|---:|
| `exposure-counter.ts` | `exposure-counter.test.ts` | 65 | 65 | 0 |
| `multi-q-propagation.ts` | (covered via `exposure-counter.test.ts`) | — | — | 0 |
| `stage-gate.ts` | `stage-gate.test.ts` | 90 | 90 | 0 |
| `failure-recovery.ts` | (covered via `stage-gate.test.ts`) | — | — | 0 |
| `daily-deck-composer.ts` | `daily-deck-composer.test.ts` | 24 | 24 | 0 |
| `adaptive-deck.ts` | `adaptive-deck.test.ts` | 13 | 13 | 0 |
| `dag-backward-retry.ts` | `dag-backward-retry.test.ts` | 12 | 12 | 0 |
| `lint-cards.ts` (build-v2) | `build-v2/__tests__/lint.spec.ts` | 2 | 2 | 0 |
| **Total** | **6 files** | **206** | **206** | **0** |

`failure-recovery.ts` and `multi-q-propagation.ts` are exercised inside the
`stage-gate.test.ts` and `exposure-counter.test.ts` files respectively (their
public APIs are imported and asserted directly there), which is why they show
no dedicated test file but achieve full coverage.

## Coverage table (engines)

Source: `npx vitest run --coverage` → v8 reporter.

| File | % Stmts | % Branch | % Funcs | % Lines | Uncovered lines |
|---|---:|---:|---:|---:|---|
| `adaptive-deck.ts` | 100 | 93.18 | 100 | **100** | 101, 220, 235 |
| `dag-backward-retry.ts` | 100 | 82.35 | 100 | **100** | 86, 93–95, 105 |
| `daily-deck-composer.ts` | 97.51 | 85.23 | 100 | **97.51** | 170, 530–536 |
| `exposure-counter.ts` | 100 | 95.89 | 100 | **100** | 321, 408, 416 |
| `failure-recovery.ts` | 100 | 96.15 | 100 | **100** | 157 |
| `multi-q-propagation.ts` | 100 | 100 | 100 | **100** | — |
| `stage-gate.ts` | 100 | 97.77 | 100 | **100** | 585, 615 |
| **Aggregate** | **99.27** | **91.75** | **100** | **99.27** | — |

All seven engines clear the ≥95 % lines floor. `daily-deck-composer.ts` is
the only file under 100 % lines (97.51 %) — uncovered region is a defensive
fallback inside `composeDailyDeck` that is unreachable for any non-empty card
universe (it returns an empty deck when `targetCount=0` already short-circuits
above it). Adding a synthetic stub to "cover" that path would silence rather
than test it; per RULE 4 we leave it.

## Property-based test invariants (documented)

The exposure-counter stress test runs 1,000 random ops over 50 cards / 10
atoms / up-to-3 Q-tags each, with a deterministic LCG so failures are
reproducible. The following invariants are asserted on every iteration:

| ID | Invariant |
|---|---|
| **I1** | `exposureCount ≥ correctCount` always |
| **I1b** | counts increment by exactly 1 on every recorded result; correctCount adds (correct ? 1 : 0) |
| **I2** | `seq` counter is monotonic and equals total ops at end (1,000) |
| **I3** | `lastNResults.length ≤ RETIRE_WINDOW` always |
| **I4** | `FAMILIAR` is terminal — once entered, never demotes regardless of subsequent wrongs |
| **I5** | every atom percent ∈ [0, 100]; totalExposures ≥ correctExposures |
| **I6** | `qTrack.percent` = `round(mean(contributing atom percents))` exactly |
| **I7** | `status === 'NEW'` iff `exposureCount === 0` |

The daily-deck-composer ships its own property-based test (`all 50 random
seeds: deck has unique ids and length ≤ target`) covering uniqueness +
length-bound across 50 distinct seeds.

## Tests added during this run

None. EN-1's existing suite (206 tests across 6 files) already exceeds the
≥95 % lines target on every engine, includes 1 property-based block on the
deck composer, and includes the 1,000-iter stress test on exposure counter.
No `fast-check` add was required.

## RULE 4 conformance

* No `it.skip` / `xit` / `.only` anywhere in the suite.
* No silenced failures.
* Counter math verified by exhaustive single-step assertions PLUS 1,000-iter
  invariant stress.
* Multi-Q propagation drift detection asserted (mismatched supplied vs
  registered tags throw, order-independent passes).
* Stage-gate threshold edge cases covered at exact threshold AND just-below
  for every stage S1–S6.
* Daily-deck composer determinism verified (identical inputs → identical
  decks across 50 random seeds).

## Reproducer

```
cd cpp-t2
npx vitest run --reporter verbose
npx vitest run --coverage
```
