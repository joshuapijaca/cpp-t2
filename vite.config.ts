import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'node:path';

/**
 * Build modes:
 *   default      → src-v2/main.tsx + index.html (v2 — current default)
 *   --mode v1    → src/main.tsx + index.v1.html (v1 — archived)
 *
 * For v2 we split:
 *   - vendor (react/react-dom)
 *   - cards (heavy card components — lazy-friendly)
 *   - engines (deck composer + recovery)
 *   - main (app shell + routing)
 *
 * PWA (v2 only):
 *   - vite-plugin-pwa registers a Workbox service worker.
 *   - registerType 'autoUpdate' + skipWaiting + clientsClaim → new builds
 *     activate immediately on next page load (no manual user action).
 *   - globPatterns precaches everything emitted to dist-v2/, so the app
 *     works offline after the first load.
 *   - The pwa-update-prompt component (src-v2/pwa-update-prompt.tsx)
 *     handles the in-app "new version available" toast and 30-min poll.
 */
export default defineConfig(({ mode, command }) => {
  const isV1 = mode === 'v1';
  const isV2 = !isV1;
  // For GitHub Pages: served at /cpp-t2/. Locally: /. dev always /.
  // Build defaults to /cpp-t2/ (repo name); override via DEPLOY_BASE env var.
  const baseUrl = command === 'build'
    ? (process.env.DEPLOY_BASE || '/cpp-t2/')
    : '/';

  const v2Plugins = [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // we register manually in src-v2/main.tsx
      includeAssets: [
        'favicon.ico',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'pwa-maskable-512.png',
      ],
      manifest: {
        name: 'cpp-t2 — SIT102 Test 2 Prep',
        short_name: 'cpp-t2',
        description: 'Test 2 prep with 2,547 hand-authored cards',
        theme_color: '#0d1117',
        background_color: '#0d1117',
        display: 'standalone',
        orientation: 'portrait',
        start_url: baseUrl,
        scope: baseUrl,
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Bundle ~430 KB total; relax 2 MB default ceiling so large JS chunks
        // (cards corpus inlined as YAML) precache without complaint.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'cpp-t2-pages' },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 365,
                maxEntries: 30,
              },
            },
          },
        ],
      },
      devOptions: {
        // PWA artifacts are emitted in dev too so the registration code
        // path is exercised; safe to leave enabled.
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      },
    }),
  ];

  const base = {
    base: baseUrl,
    plugins: isV1 ? [react(), tailwindcss()] : v2Plugins,
    server: {
      port: isV2 ? 5174 : 5173,
      strictPort: true,
      open: '/',
    },
    // Accept YAML as a static asset so card data doesn't get tree-shaken
    // when imported via import.meta.glob('?raw').
    assetsInclude: ['**/*.yml', '**/*.yaml'],
  };

  if (isV1) return base;

  return {
    ...base,
    build: {
      outDir: 'dist-v2',
      emptyOutDir: true,
      rollupOptions: {
        input: resolve(__dirname, 'index.html'),
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('scheduler')) return 'vendor-react';
              return 'vendor';
            }
            if (id.includes('src-v2/components/cards/')) return 'cards';
            if (id.includes('src-v2/engines/')) return 'engines';
            if (id.includes('src-v2/pages/')) return 'pages';
          },
        },
      },
      target: 'es2022',
      minify: 'esbuild' as const,
      cssMinify: true,
      reportCompressedSize: true,
      chunkSizeWarningLimit: 600,
    },
  };
});
