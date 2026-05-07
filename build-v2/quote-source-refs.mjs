#!/usr/bin/env node
/**
 * Phase A6 cleanup — quote unquoted source.ref values that YAML
 * misparses (the `kind: v2 / ref: v2:Q4 — ...` shape, where the second
 * colon makes YAML think there's a nested mapping).
 *
 * Strategy: read each card YAML as text; find a line of the form:
 *     `  ref: <value>` (no leading quote)
 *   …where <value> contains an unquoted colon. Wrap the value in
 *   double-quotes (escaping any inner double-quote).
 *
 * Idempotent — re-running on already-quoted refs is a no-op.
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const GLOBS = ['data/v2/cards/**/*.yml'];

let touched = 0;
let scanned = 0;

for (const g of GLOBS) {
  for (const rel of glob.sync(g, { cwd: ROOT })) {
    scanned++;
    const abs = resolve(ROOT, rel);
    const orig = readFileSync(abs, 'utf8');
    // Match a line containing `  ref: <value>` where the value isn't
    // already wrapped in single or double quotes and contains a colon.
    const fixed = orig.replace(
      /^(\s+ref:\s+)([^\s"'].*[^\s"'])(\s*)$/gm,
      (m, prefix, value, trail) => {
        // Skip if the value doesn't contain a colon at all — those YAML
        // parses fine.
        if (!value.includes(':')) return m;
        // Skip if value is a JSON-style scalar already.
        if (value.startsWith('"') || value.startsWith("'")) return m;
        // Escape inner double-quotes.
        const escaped = value.replace(/"/g, '\\"');
        return `${prefix}"${escaped}"${trail}`;
      }
    );
    if (fixed !== orig) {
      writeFileSync(abs, fixed, 'utf8');
      touched++;
    }
  }
}

process.stdout.write(JSON.stringify({
  ts: new Date().toISOString(),
  agent: 'phase-a6-quote-refs',
  scanned,
  touched,
}) + '\n');
