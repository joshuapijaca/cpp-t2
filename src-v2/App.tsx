/**
 * App.tsx — cpp-t2 v2.2 root + minimal hand-rolled router.
 *
 * Per docs/v2/MANIFEST.md, v2.2 has exactly 2 pages:
 *   /                       → Home
 *   /sequence/:level        → Sequence (linear walker for L0..L5)
 *
 * Anything else 404s back to Home. No drill payloads, no postmortem, no
 * mock state, no preflight. Per ANTI_DRIFT.md, every page beyond Home +
 * Sequence was drift and has been removed (Phase A1, 2026-05-07).
 *
 * Why hand-roll?
 *   - Two routes don't justify react-router's ~12 KB gzip.
 *   - Listening on `popstate` + intercepting clicks on `<a data-route>` is
 *     ~30 lines.
 *
 * Phase A5 (2026-05-07 eve): wires the v1-style Home + Sequence rewrite.
 *   - Home.onPick(level, cardIndex?) → navigate to /sequence/:level + pass
 *     startIndex via query string (`?i=N`).
 *   - Sequence reads :level + ?i= from window.location and walks the
 *     filtered deck forward-only via session-store.
 *   - The card index is encoded as `?i=N` in the URL (rather than a
 *     separate route segment) so the deep-link is shareable but the
 *     route surface stays at the manifest-mandated 2 pages.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Home } from './pages/Home';
// Sequence.tsx exports as `Session` for back-compat with Phase A1's import
// alias; A6 will rename. App.tsx aliases on import so the rest of the file
// already speaks the v2.2 vocabulary.
import { Session as Sequence } from './pages/Sequence';
import type { Level } from './types/card-schema';
import type { Atom } from './types/atom';

// ─────────────────────────────────────────────────────────────────────
// Route surface — exactly 2 entries.
// ─────────────────────────────────────────────────────────────────────

const LEVEL_RE = /^L[0-5]$/;
const VALID_LEVELS: ReadonlySet<string> = new Set(['L0', 'L1', 'L2', 'L3', 'L4', 'L5']);

export type Route =
  | { name: 'home' }
  | { name: 'sequence'; level: Level; startIndex: number };

function parseStartIndex(search: string): number {
  const m = search.match(/[?&]i=(\d+)\b/);
  if (!m) return 0;
  const n = Number.parseInt(m[1]!, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function pathToRoute(path: string, search: string): Route {
  const p = path.replace(/\/+$/, '') || '/';
  if (p === '/' || p === '') return { name: 'home' };
  const m = p.match(/^\/sequence\/([^/]+)$/);
  if (m && LEVEL_RE.test(m[1]!) && VALID_LEVELS.has(m[1]!)) {
    return {
      name: 'sequence',
      level: m[1] as Level,
      startIndex: parseStartIndex(search),
    };
  }
  return { name: 'home' };
}

function routeToPath(r: Route): string {
  switch (r.name) {
    case 'home':
      return '/';
    case 'sequence':
      return r.startIndex > 0
        ? `/sequence/${r.level}?i=${r.startIndex}`
        : `/sequence/${r.level}`;
  }
}

// ─────────────────────────────────────────────────────────────────────
// AppData — kept as a thin pass-through. Phase A6 narrowed the prior
// unknown-bag shape to a concrete record so main.tsx can index into
// `familiarity` without TS18046. None of the v2.2 pages currently
// consume AppData (Home reads cards via session-store directly).
// ─────────────────────────────────────────────────────────────────────

/** Per-atom familiarity gauge — null = no exposures yet. */
export interface AtomFamiliarity {
  pct: number | null;
}

export interface AppData {
  preflightCards: unknown[];
  atoms: Atom[];
  familiarity: Record<string, AtomFamiliarity>;
  weakness: unknown[];
  weaknessHeat: number[];
}

export interface AppProps {
  data: AppData;
}

// ─────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────

export default function App(_props: AppProps) {
  const [route, setRoute] = useState<Route>(() =>
    pathToRoute(window.location.pathname, window.location.search),
  );

  useEffect(() => {
    function onPop() {
      setRoute(pathToRoute(window.location.pathname, window.location.search));
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((next: Route) => {
    const path = routeToPath(next);
    if (window.location.pathname + window.location.search !== path) {
      window.history.pushState(null, '', path);
    }
    setRoute(next);
  }, []);

  const handlePick = useCallback(
    (level: Level, cardIndex?: number) => {
      navigate({ name: 'sequence', level, startIndex: cardIndex ?? 0 });
    },
    [navigate],
  );

  const handleBackHome = useCallback(() => {
    navigate({ name: 'home' });
  }, [navigate]);

  const screen = useMemo(() => {
    switch (route.name) {
      case 'home':
        return <Home onPick={handlePick} />;
      case 'sequence':
        return (
          <Sequence
            level={route.level}
            startIndex={route.startIndex}
            onBackHome={handleBackHome}
          />
        );
    }
  }, [route, handlePick, handleBackHome]);

  return <>{screen}</>;
}
