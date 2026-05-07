# 04 — PWA Setup

cpp-t2 v2 is a **Progressive Web App**. After your first visit it works fully offline, lives behind a desktop icon, and silently picks up new builds the next time you launch it.

This doc covers:

1. [How to install on Chrome / Edge / mobile](#1-installing-the-pwa)
2. [How auto-update works](#2-auto-update-flow)
3. [How to deploy a new build](#3-deploying-updates)
4. [How to host on GitHub Pages](#4-hosting-on-github-pages)
5. [Offline behaviour](#5-offline-behaviour)
6. [Files / config touched](#6-files-touched)

---

## 1. Installing the PWA

### Desktop (Chrome, Edge, Brave)

1. Open the deployed URL (or `http://localhost:5175` after `npm run preview`).
2. Wait for the page to finish loading (so the service worker installs).
3. In the address bar look for an **install icon** on the right — a small monitor / down-arrow glyph.
   - Chrome: clickable icon near the bookmark star.
   - Edge: also surfaces under the `…` menu → **Apps → Install this site as an app**.
4. Click **Install**. A standalone window opens and a desktop / Start-menu shortcut named **cpp-t2** is created.

### Mobile

- **Android (Chrome)**: tap `⋮` menu → **Install app** / **Add to Home screen**.
- **iOS (Safari)**: tap the **Share** icon → **Add to Home Screen**.

### Removing

- Right-click the desktop icon → **Uninstall**, or in the running app window: `…` menu → **Uninstall cpp-t2**.

---

## 2. Auto-update flow

The service worker is configured with `registerType: 'autoUpdate'` plus `skipWaiting: true` and `clientsClaim: true` (`vite.config.ts`). When a new build is deployed:

1. **On launch / refresh**, the browser requests the registered service worker. The cached SW notices a new bundle hash and downloads it in the background.
2. **Within ~30 minutes** while the app is open, a periodic `registration.update()` poll (driven by `src-v2/pwa-update-prompt.tsx`) re-checks the server. If a newer version is found, the SW installs it.
3. **When the new SW is ready**, the app shows a small toast in the bottom-right:

   > **New version available**
   > Refresh to install the update.
   > [Update now] [Later]

4. **Update now** calls `updateSW(true)` → activates the new SW and reloads the page. **Later** dismisses the toast for the current session; it returns next time a newer build lands.
5. If the user never sees the toast (e.g. they closed the app), the next launch fetches the SW from cache, but the SW immediately re-checks the network and activates the newest build before the React tree mounts.

**Worst case latency**: a freshly-pushed build reaches a user who keeps the tab open within **30 minutes**. A user who closes and reopens the tab gets the new build on the very next launch.

---

## 3. Deploying updates

```bash
# 1. Make changes
# 2. Build
cd cpp-t2
npm run build          # outputs dist-v2/

# 3. Smoke check locally
npx vite preview --outDir dist-v2 --port 5175
curl -I http://127.0.0.1:5175/manifest.webmanifest   # expect 200, application/manifest+json
curl -I http://127.0.0.1:5175/sw.js                  # expect 200, text/javascript

# 4. Push dist-v2/ contents to your host (see hosting section)
```

That's it. No version bump, no manual cache busting. Vite-plugin-pwa rewrites `sw.js` with new bundle hashes every build, so the SW automatically detects the change.

### Re-generating icons

If you want to tweak the app icon, edit `build-v2/generate-pwa-icons.cjs` (the bitmap renderer) or replace the PNGs in `public/` directly, then:

```bash
npm run generate-pwa-icons
npm run build
```

---

## 4. Hosting on GitHub Pages

GitHub Pages serves static files from a branch — perfect for a PWA.

### One-time setup

1. Push the project to a GitHub repo.
2. **Settings → Pages → Source**: choose **GitHub Actions** (preferred) or a branch like `gh-pages`.
3. If you choose **Actions**, drop this workflow at `.github/workflows/deploy.yml`:

   ```yaml
   name: Deploy PWA
   on:
     push:
       branches: [main]
     workflow_dispatch: {}
   permissions:
     contents: read
     pages: write
     id-token: write
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
             cache: npm
             cache-dependency-path: cpp-t2/package-lock.json
         - run: npm ci
           working-directory: cpp-t2
         - run: npm run build
           working-directory: cpp-t2
         - uses: actions/upload-pages-artifact@v3
           with:
             path: cpp-t2/dist-v2
     deploy:
       needs: build
       runs-on: ubuntu-latest
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       steps:
         - id: deployment
           uses: actions/deploy-pages@v4
   ```

4. **Custom domain**: leave the URL as `https://<user>.github.io/<repo>/` for the simplest case. If you do, change `start_url` and `scope` in `vite.config.ts` from `/` to `/<repo>/` and add `base: '/<repo>/'` to the Vite config — otherwise the SW scope won't match the served URL.

### After setup

Every push to `main` rebuilds and redeploys. Open users get the new build on their next launch (or within 30 min while open).

---

## 5. Offline behaviour

After the **first successful load** the service worker pre-caches every emitted asset that matches `**/*.{js,css,html,svg,png,ico,woff2}`:

- HTML shell + manifest + all icons
- `index-*.js`, `vendor-*.js`, `cards-*.js`, `engines-*.js`, `pages-*.js`, `vendor-react-*.js`
- `index-*.css`
- The 2,547-card YAML corpus is **inlined into the JS bundle**, so it lands in cache for free.

Runtime caches:

- **Navigation requests** → `StaleWhileRevalidate` (instant offline; refreshes in background).
- **Google Fonts CSS** → `StaleWhileRevalidate`.
- **Google Fonts WOFF2 files** → `CacheFirst` with 1-year max-age.

What this means in practice:

| Scenario | Behaviour |
|---|---|
| First load online | Normal load + SW installs in background. |
| Reload offline | Full app. All 2,547 cards available. Fonts use cached WOFF2 files. |
| Cold launch offline (laptop just opened, no network) | Full app. SW serves the precache. |
| Online with new build pushed | App boots from cache (instant), then toast appears prompting refresh. |
| Cleared site data | Behaves like first visit; needs network to re-prime cache. |

Session state (familiarity, weakness, deck progress) is in-memory only — that part of the spec hasn't changed.

---

## 6. Files touched

**Added**
- `public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/pwa-maskable-512.png`, `public/favicon.ico`, `public/pwa-icon-source.svg`
- `src-v2/pwa-update-prompt.tsx` — toast + 30-min poll
- `build-v2/generate-pwa-icons.cjs` — pure-Node icon generator (no `sharp` dep)
- `docs/v2/04_PWA_SETUP.md` — this file

**Modified**
- `vite.config.ts` — adds `VitePWA(...)` to the v2 plugin set
- `index.html` — manifest, theme-color, apple-touch-icon, favicon links
- `src-v2/main.tsx` — calls `registerSW(...)` and mounts `<PWAUpdatePrompt />`
- `src-v2/vite-env.d.ts` — adds `vite-plugin-pwa/client` triple-slash reference
- `package.json` — `build:pwa`, `generate-pwa-icons` scripts; `vite-plugin-pwa` devDep
- `.gitignore` — ignores `dev-dist/`, root-level `sw.js`, root-level `workbox-*.js`

**Build output (in `dist-v2/`)**
- `manifest.webmanifest`
- `sw.js`
- `workbox-<hash>.js`
- All `pwa-*.png` + `favicon.ico` (copied from `public/`)
- Existing `index.html` + `assets/*` (unchanged structure)

---

## Troubleshooting

- **No install button?** Chrome only shows the install icon if (a) the manifest validates, (b) the SW is registered, and (c) the page is served over HTTPS or `localhost`. `file://` will not work.
- **Update toast never appears?** Open DevTools → Application → Service Workers and confirm the SW is "activated and is running". If "redundant", run a hard reload (`Ctrl+Shift+R`) once.
- **Want to nuke the cache during dev?** DevTools → Application → Storage → Clear site data. Then reload.
