import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
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
 */
export default defineConfig(({ mode }) => {
  const isV1 = mode === 'v1';
  const isV2 = !isV1;

  const base = {
    plugins: [react(), tailwindcss()],
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
