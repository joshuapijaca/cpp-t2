#!/usr/bin/env node
// Fix authoringStatus: REMIGRATED -> DRAFT (since lint only accepts
// DRAFT|REVIEWED|APPROVED). migratedFrom field retained for traceability.

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const files = await glob('data/v2/{cards,mocks}/**/*.yml', { cwd: ROOT, absolute: true });

let n = 0;
for (const f of files) {
  const raw = readFileSync(f, 'utf-8');
  if (!raw.includes('REMIGRATED')) continue;
  const next = raw.replace(/authoringStatus:\s*REMIGRATED/g, 'authoringStatus: DRAFT');
  if (next !== raw) {
    writeFileSync(f, next, 'utf-8');
    n++;
  }
}
console.log('Fixed authoringStatus on', n, 'files (REMIGRATED -> DRAFT; migratedFrom kept).');
