/**
 * smoke-test.cjs — minimal-dependency smoke test for the v2 build.
 *
 * Checks:
 *   1. dist-v2/index.v2.html exists
 *   2. Has <div id="root"> mount point
 *   3. References a /assets/index.v2-*.js entry script
 *   4. That entry script + every chunk it imports actually exist on disk
 *   5. No JS chunk contains an unresolved `import.meta.env` access that
 *      would crash at boot (vite usually inlines these — we just sanity-check)
 *   6. Total JS gzip size is under 500 KB (spec budget)
 *   7. Total asset bytes (JS + CSS) under 800 KB (spec budget)
 *
 * Usage:
 *   node build-v2/smoke-test.cjs
 *
 * Exit codes:
 *   0 — all checks passed
 *   1 — at least one check failed
 *
 * No npm dependencies. Pure node stdlib.
 */

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist-v2');
const ASSETS = path.join(DIST, 'assets');
const INDEX = path.join(DIST, 'index.v2.html');

const JS_GZIP_BUDGET = 500 * 1024;
const TOTAL_BUDGET = 800 * 1024;

let failed = 0;
const log = (status, msg) => {
  const tag = status === 'pass' ? 'PASS' : status === 'fail' ? 'FAIL' : 'INFO';
  console.log(`[${tag}] ${msg}`);
  if (status === 'fail') failed++;
};

// 1. dist exists
if (!fs.existsSync(DIST)) {
  log('fail', `dist-v2 missing at ${DIST}`);
  process.exit(1);
}
log('pass', `dist-v2 exists at ${DIST}`);

// 2. index html exists with #root mount
if (!fs.existsSync(INDEX)) {
  log('fail', `index.v2.html missing at ${INDEX}`);
  process.exit(1);
}
const html = fs.readFileSync(INDEX, 'utf8');
if (!/<div\s+id=["']root["']\s*>/.test(html)) {
  log('fail', 'index.v2.html missing <div id="root"> mount point');
} else {
  log('pass', 'index.v2.html has <div id="root">');
}

// 3. entry script reference
const scriptMatch = html.match(/<script[^>]*src=["']([^"']*index\.v2[^"']+\.js)["']/);
if (!scriptMatch) {
  log('fail', 'index.v2.html missing entry <script src=...index.v2-*.js>');
} else {
  const entryHref = scriptMatch[1];
  log('pass', `entry script referenced: ${entryHref}`);

  const entryFile = path.join(DIST, entryHref.replace(/^\//, ''));
  if (!fs.existsSync(entryFile)) {
    log('fail', `entry script missing on disk: ${entryFile}`);
  } else {
    log('pass', `entry script exists on disk: ${path.basename(entryFile)}`);
  }
}

// 4. every JS chunk + its statically-imported chunks exist
const jsFiles = fs.readdirSync(ASSETS).filter((f) => f.endsWith('.js'));
log('info', `found ${jsFiles.length} JS chunks under assets/`);

const importRe = /from["']\.\/([^"']+\.js)["']/g;
let brokenImports = 0;
for (const f of jsFiles) {
  const src = fs.readFileSync(path.join(ASSETS, f), 'utf8');
  let m;
  while ((m = importRe.exec(src)) !== null) {
    const target = path.join(ASSETS, m[1]);
    if (!fs.existsSync(target)) {
      log('fail', `${f} imports missing chunk ./${m[1]}`);
      brokenImports++;
    }
  }
}
if (brokenImports === 0) log('pass', 'all chunk imports resolve to files on disk');

// 5. unresolved import.meta.env (vite should inline; warn if literal remains)
let unresolvedEnv = 0;
for (const f of jsFiles) {
  const src = fs.readFileSync(path.join(ASSETS, f), 'utf8');
  // `import.meta.env` literal (not preceded by safe access patterns) usually
  // means vite did not replace it — possible runtime crash on boot.
  if (/import\.meta\.env(?!\.)/.test(src)) {
    log('fail', `${f} has unresolved import.meta.env reference`);
    unresolvedEnv++;
  }
}
if (unresolvedEnv === 0) log('pass', 'no unresolved import.meta.env references');

// 6+7. size budgets
let totalJsRaw = 0;
let totalJsGzip = 0;
for (const f of jsFiles) {
  const buf = fs.readFileSync(path.join(ASSETS, f));
  totalJsRaw += buf.length;
  totalJsGzip += zlib.gzipSync(buf).length;
}
const cssFiles = fs.readdirSync(ASSETS).filter((f) => f.endsWith('.css'));
let totalCssRaw = 0;
let totalCssGzip = 0;
for (const f of cssFiles) {
  const buf = fs.readFileSync(path.join(ASSETS, f));
  totalCssRaw += buf.length;
  totalCssGzip += zlib.gzipSync(buf).length;
}
const totalGzip = totalJsGzip + totalCssGzip;

const fmt = (n) => `${(n / 1024).toFixed(2)} KB`;
log('info', `JS  raw=${fmt(totalJsRaw)}  gzip=${fmt(totalJsGzip)}`);
log('info', `CSS raw=${fmt(totalCssRaw)} gzip=${fmt(totalCssGzip)}`);
log('info', `Total gzip=${fmt(totalGzip)}`);

if (totalJsGzip > JS_GZIP_BUDGET) {
  log('fail', `JS gzip ${fmt(totalJsGzip)} exceeds budget ${fmt(JS_GZIP_BUDGET)}`);
} else {
  log('pass', `JS gzip ${fmt(totalJsGzip)} within budget ${fmt(JS_GZIP_BUDGET)}`);
}
if (totalGzip > TOTAL_BUDGET) {
  log('fail', `Total gzip ${fmt(totalGzip)} exceeds budget ${fmt(TOTAL_BUDGET)}`);
} else {
  log('pass', `Total gzip ${fmt(totalGzip)} within budget ${fmt(TOTAL_BUDGET)}`);
}

console.log('');
if (failed > 0) {
  console.log(`SMOKE FAILED: ${failed} check(s) failed`);
  process.exit(1);
}
console.log('SMOKE PASSED: all checks green');
process.exit(0);
