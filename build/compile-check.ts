// Build-time C++ syntax check on canonical examples + trace card code.
// Spec: ../docs/11_build_outline.md §"Lint Pipeline".
//
// Run: npm run check:cpp
// Requires g++ on PATH.

import { execSync, spawnSync } from 'child_process';
import { writeFileSync, mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve } from 'path';
import yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { glob } from 'glob';

const ROOT = resolve(import.meta.dirname, '..');
const OUTLINE_GLOB = 'outlines/**/*.yml';
const CARDS_PATH = 'data/cards.json';

interface Outline {
  id: string;
  status: string;
  canonical_example?: string;
}

interface TraceCard {
  type: 'trace';
  atomId: string;
  code: string;
}

interface AnyCard {
  type: string;
  atomId?: string;
  code?: string;
}

const STD_PRELUDE = `#include <iostream>
#include <string>
using namespace std;
`;

function gxxAvailable(): boolean {
  try {
    execSync('g++ --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function syntaxCheck(code: string): { ok: boolean; err?: string } {
  const dir = mkdtempSync(join(tmpdir(), 'cpp-t2-'));
  const file = join(dir, 'snippet.cpp');
  try {
    writeFileSync(file, STD_PRELUDE + code);
    const r = spawnSync('g++', ['-Wall', '-fsyntax-only', file], {
      encoding: 'utf8',
    });
    if (r.status === 0) return { ok: true };
    return { ok: false, err: (r.stderr || r.stdout || '').slice(0, 800) };
  } finally {
    try { rmSync(dir, { recursive: true, force: true }); } catch { /* noop */ }
  }
}

interface Failure {
  source: string;
  err: string;
}

function checkOutlines(): Failure[] {
  const files = glob.sync(OUTLINE_GLOB, { cwd: ROOT });
  const fails: Failure[] = [];
  for (const f of files) {
    const o = yaml.load(readFileSync(resolve(ROOT, f), 'utf8')) as Outline;
    if (!o || o.status !== 'locked') continue;
    if (!o.canonical_example || !o.canonical_example.trim()) continue;
    if (o.canonical_example.startsWith('// No code')) continue;
    const r = syntaxCheck(o.canonical_example);
    if (!r.ok) fails.push({ source: `outline ${o.id}`, err: r.err ?? '' });
  }
  return fails;
}

function checkCards(): Failure[] {
  const cards = JSON.parse(readFileSync(resolve(ROOT, CARDS_PATH), 'utf8')) as AnyCard[];
  const fails: Failure[] = [];
  for (const c of cards) {
    if (c.type !== 'trace') continue;
    if (!c.code) continue;
    const r = syntaxCheck(c.code);
    if (!r.ok) fails.push({ source: `card ${c.atomId} (trace)`, err: r.err ?? '' });
  }
  return fails;
}

function main() {
  if (!gxxAvailable()) {
    console.error('g++ not on PATH; skipping compile-check (treat as soft fail).');
    process.exit(0);
  }

  const outlineFails = checkOutlines();
  const cardFails = checkCards();
  const all = [...outlineFails, ...cardFails];

  if (all.length === 0) {
    console.log(`✓ compile-check pass`);
    process.exit(0);
  }

  console.error(`✕ ${all.length} compile error(s):`);
  for (const f of all) {
    console.error(`  [${f.source}]`);
    console.error(f.err);
    console.error('---');
  }
  process.exit(1);
}

main();
