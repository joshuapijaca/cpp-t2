/**
 * runtime-stress.spec.ts — QA-M20 1000-card runtime stress test.
 *
 * Loads the v2 production build (`dist-v2/`) in `?qa=stress` mode, which
 * triggers `StressCycler` in `src-v2/main.tsx`. The cycler mounts
 * `<CardRenderer card={cards[index]} />` for whatever index we set via
 * `window.__qa_setIndex(i)`.
 *
 * The spec walks 1000 random card indices and asserts:
 *   - 0 page errors (uncaught exceptions on the main thread)
 *   - 0 unhandled promise rejections
 *   - 0 console.error entries (React render errors trip this)
 *   - every iteration successfully mounts the card (data-qa-index and
 *     data-qa-card-id update on the cycler container)
 *
 * Why random rather than sequential? Random indexing exercises the
 * card-component switch in `CardRenderer` more aggressively — sequential
 * would walk one card type at a time per directory, masking cross-type
 * remount issues.
 *
 * Pass criteria (per QA-M20 spec):
 *   - 0 errors / 0 rejections across 1000 iterations
 *
 * The deterministic seed (42) keeps the run reproducible across CI.
 */

import { test, expect, type ConsoleMessage } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const SPEC_DIR = path.dirname(fileURLToPath(import.meta.url));

const TARGET_ITERATIONS = 1000;
const SEED = 42;

// xorshift32 — small, deterministic, no Math.random spread.
function rng(seed: number): () => number {
  let s = seed | 0;
  if (s === 0) s = 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) / 0x100000000);
  };
}

interface ErrorRecord {
  kind: 'pageerror' | 'consoleerror' | 'unhandledrejection';
  text: string;
  iter: number;
}

test('QA-M20 runtime stress — 1000 random card mounts, 0 errors / 0 rejections', async ({ page }) => {
  const errors: ErrorRecord[] = [];
  let iter = 0;

  page.on('pageerror', (e: Error) => {
    errors.push({ kind: 'pageerror', text: `${e.name}: ${e.message}`, iter });
  });
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // React DevTools messages and the deliberate `[main] schema-fail`
      // warnings emitted during deck load do not constitute runtime
      // failures. We filter them out so genuine render errors surface.
      if (text.includes('Download the React DevTools')) return;
      if (text.includes('[main] schema-fail')) return;
      errors.push({ kind: 'consoleerror', text, iter });
    }
  });

  // Unhandled rejection bridge — install BEFORE the React tree mounts so
  // any rejection from a card component lands in our listener.
  await page.addInitScript(() => {
    window.addEventListener('unhandledrejection', (ev: PromiseRejectionEvent) => {
      // Use console.error so the spec's main listener captures it.
      console.error(`[unhandledrejection] ${String(ev.reason?.message || ev.reason)}`);
    });
  });

  await page.goto('/?qa=stress', { waitUntil: 'load' });

  // Wait for the cycler to mount — confirms cards loaded + StressCycler ran.
  await page.waitForSelector('[data-qa-stress]', { timeout: 30_000 });

  // Pull total card count from the page so we can pick valid indices.
  const cardCount = await page.evaluate<number>(() => {
    const w = window as unknown as { __qa_count?: number };
    return w.__qa_count ?? 0;
  });
  expect(cardCount, 'cards loaded into stress mode').toBeGreaterThan(0);
  console.log(`QA-M20: deck loaded, ${cardCount} cards available`);

  const random = rng(SEED);
  const seenIndices = new Set<number>();
  const seenCardIds = new Set<string>();

  const t0 = Date.now();

  for (iter = 0; iter < TARGET_ITERATIONS; iter++) {
    const idx = Math.floor(random() * cardCount);

    // Drive the cycler from the page side.
    await page.evaluate((i) => {
      const w = window as unknown as { __qa_setIndex?: (n: number) => void };
      w.__qa_setIndex?.(i);
    }, idx);

    // Wait for the cycler's data-qa-index attribute to reflect the new card.
    // We do this with a short polling check rather than waitForFunction so
    // a stuck card surfaces fast rather than burning the test budget.
    const ok = await page.waitForFunction(
      (target) => {
        const el = document.querySelector('[data-qa-stress]');
        if (!el) return false;
        return Number(el.getAttribute('data-qa-index')) === target;
      },
      idx,
      { timeout: 2000 },
    ).then(() => true).catch(() => false);

    if (!ok) {
      errors.push({
        kind: 'pageerror',
        text: `iteration ${iter} (idx=${idx}): cycler did not advance to index`,
        iter,
      });
      // Don't break — keep walking so we capture every failure mode.
    }

    const cardId = await page.evaluate<string>(() => {
      const el = document.querySelector('[data-qa-stress]');
      return el?.getAttribute('data-qa-card-id') ?? '';
    });
    seenIndices.add(idx);
    if (cardId) seenCardIds.add(cardId);

    if (iter > 0 && iter % 100 === 0) {
      const elapsed = Date.now() - t0;
      console.log(
        `  ${iter}/${TARGET_ITERATIONS} mounted · ${seenCardIds.size} unique cards · ${errors.length} errs · ${elapsed}ms`,
      );
    }
  }

  const elapsed = Date.now() - t0;
  const passed = errors.length === 0;

  // Persist a JSON record for the QA report.
  const result = {
    milestone: 'QA-M20',
    name: '1000-card runtime stress',
    timestamp: new Date().toISOString(),
    iterations: TARGET_ITERATIONS,
    deckSize: cardCount,
    uniqueIndicesVisited: seenIndices.size,
    uniqueCardsRendered: seenCardIds.size,
    elapsedMs: elapsed,
    avgPerIterMs: +(elapsed / TARGET_ITERATIONS).toFixed(2),
    errors,
    pageErrors: errors.filter((e) => e.kind === 'pageerror').length,
    consoleErrors: errors.filter((e) => e.kind === 'consoleerror').length,
    unhandledRejections: errors.filter((e) => e.kind === 'unhandledrejection').length,
    pass: passed,
  };

  // The Playwright reporter writes its own QA_M20_RESULT.json — ours is a
  // distinct concise summary so the QA report can cite it without parsing
  // the full Playwright runner output.
  fs.writeFileSync(
    path.resolve(SPEC_DIR, 'QA_M20_SUMMARY.json'),
    JSON.stringify(result, null, 2),
  );

  console.log('');
  console.log(`QA-M20 result:`);
  console.log(`  iterations:        ${TARGET_ITERATIONS}`);
  console.log(`  unique cards:      ${seenCardIds.size} / ${cardCount}`);
  console.log(`  page errors:       ${result.pageErrors}`);
  console.log(`  console errors:    ${result.consoleErrors}`);
  console.log(`  rejections:        ${result.unhandledRejections}`);
  console.log(`  elapsed:           ${elapsed}ms (${result.avgPerIterMs}ms / iter)`);
  console.log(`  ${passed ? 'PASS' : 'FAIL'}`);

  if (errors.length > 0) {
    console.log('First 5 errors:');
    errors.slice(0, 5).forEach((e) => console.log(`  [${e.kind} @ iter ${e.iter}] ${e.text}`));
  }

  expect(errors, 'errors during stress run').toHaveLength(0);
});
