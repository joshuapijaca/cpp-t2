// =====================================================================
// build-v2/__tests__/lint.spec.ts
// Spec proving lint-cards.ts catches malformed cards.
//
// We invoke `runCardLint` in-process, pointing it at a temp directory
// that contains exactly one fixture YAML. This avoids subprocess-launch
// fragility on Windows when the project path contains spaces.
// =====================================================================

import { describe, it, expect } from 'vitest';
import { mkdtempSync, copyFileSync, mkdirSync, rmSync } from 'fs';
import { resolve, join } from 'path';
import { tmpdir } from 'os';
import { runCardLint } from '../lint-cards.js';

const FIXTURE_DIR = resolve(__dirname, '..', '__fixtures__');

function lintFixture(fixtureName: string) {
  const tmp = mkdtempSync(join(tmpdir(), 'cpp-t2-lint-'));
  try {
    mkdirSync(join(tmp, 'data', 'v2', 'cards'), { recursive: true });
    mkdirSync(join(tmp, 'data', 'v2', 'atoms'), { recursive: true });
    copyFileSync(
      join(FIXTURE_DIR, fixtureName),
      join(tmp, 'data', 'v2', 'cards', fixtureName),
    );
    return runCardLint({ rootDir: tmp });
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

describe('lint-cards.ts — fixture coverage', () => {
  it('flags multiple errors on the bad-card fixture', () => {
    const result = lintFixture('bad-card.yml');
    const rules = new Set(result.errors.map((e) => e.rule));

    expect(result.exitCode, `errors: ${JSON.stringify(result.errors, null, 2)}`).toBe(1);

    // Every rule we expect this fixture to trip.
    expect(rules).toContain('zod');
    expect(rules).toContain('source-missing');
    expect(rules).toContain('auth-status');
    expect(rules).toContain('forbidden-token');
    expect(rules).toContain('keycheck-orphan');
    expect(rules).toContain('qtags-empty');
  });

  it('reports zero errors on the good-card fixture', () => {
    const result = lintFixture('good-card.yml');
    expect(
      result.exitCode,
      `should pass; errors: ${JSON.stringify(result.errors, null, 2)}`,
    ).toBe(0);
    expect(result.errors).toEqual([]);
  });
});
