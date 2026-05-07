/**
 * static-server.cjs — minimal static server for dist-v2/.
 *
 * Used by:
 *   - QA-M19 (build-v2/lighthouse-check.cjs) — page-load perf
 *   - QA-M20 (playwright.config.ts webServer) — runtime stress
 *
 * No dependencies — only Node built-ins. SPA fallback to index.v2.html so
 * client-side routes (/track/Q1 etc.) don't 404 during testing.
 */
'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const DIST = path.resolve(__dirname, '..', 'dist-v2');
const PORT = Number(process.env.PORT || 5176);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.map':  'application/json',
};

const server = http.createServer((req, res) => {
  try {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    const rel = urlPath === '/' ? 'index.v2.html' : urlPath.replace(/^\/+/, '');
    const file = path.join(DIST, rel);
    if (!file.startsWith(DIST)) {
      res.writeHead(403); res.end('forbidden'); return;
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        fs.readFile(path.join(DIST, 'index.v2.html'), (err2, data2) => {
          if (err2) { res.writeHead(404); res.end('not found'); return; }
          res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
          res.end(data2);
        });
        return;
      }
      const ext = path.extname(file);
      res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream' });
      res.end(data);
    });
  } catch (e) {
    res.writeHead(500); res.end(String(e));
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`static-server: http://127.0.0.1:${PORT} → ${DIST}`);
});
