/**
 * playwright.config.ts — minimal config for QA-M20 runtime-stress.
 *
 * The stress spec lives at `build-v2/runtime-stress.spec.ts`. We point
 * the testDir there directly so we never accidentally pick up any of
 * the vitest unit tests under `src-v2/__tests__` or `build-v2/__tests__`.
 *
 * The webServer block boots a static server (the same one used by
 * lighthouse-check.cjs) over `dist-v2/` on :5176. The spec navigates
 * to `?qa=stress` to engage the StressCycler in main.tsx.
 */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './build-v2',
  testMatch: /runtime-stress\.spec\.ts$/,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 5 * 60 * 1000, // 5 minutes (1000 card iterations)
  reporter: [['list'], ['json', { outputFile: 'build-v2/QA_M20_RESULT.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:5176',
    headless: true,
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
  webServer: {
    command: 'node build-v2/static-server.cjs',
    url: 'http://127.0.0.1:5176/index.v2.html',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
