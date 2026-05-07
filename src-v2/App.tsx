/**
 * App.tsx — cpp-t2 v2 root + tiny URL router.
 *
 * Routes:
 *   /home              → Home dashboard (TODAY / MOCK / MASTERY / WEAKNESS)
 *   /session           → Daily-deck drill loop
 *   /track/:q          → Track for a specific Q (Q1..Q4)
 *   /mock              → Mock exam (full-screen, no AppShell)
 *   /postmortem        → Postmortem (mounted after Mock submit)
 *   /atoms             → AtomTree
 *   /weakness          → Weakness
 *   /preflight         → Preflight check (full-screen, minimal chrome)
 *
 * Why hand-roll a router?
 *   - Bundle budget is tight; react-router would add ~12 KB gzip we don't
 *     need for 8 routes.
 *   - The route surface is enumerated and stable.
 *   - Listening on `popstate` + intercepting clicks on `<a data-route>` is
 *     ~40 lines and matches AppShell.onNavigate semantics.
 *
 * Drill payloads (Track / Atoms / Weakness / Postmortem → Session) are
 * pushed through `useSession().setDrillRequestAction` so the consumer
 * actually reads them. The previous window.history.state hack was never
 * read by any page.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppShell, type ShellRoute } from './components/primitives/AppShell';
import { Home } from './pages/Home';
import { Track } from './pages/Track';
import { Session } from './pages/Session';
import { Mock, type MockPaper, type MockResult } from './pages/Mock';
import { Postmortem, type PostmortemPayload } from './pages/Postmortem';
import { AtomTree, type AtomFamiliarity } from './pages/AtomTree';
import { Weakness, type WeaknessEntry } from './pages/Weakness';
import { Preflight } from './pages/Preflight';
import { useSession } from './lib/session-store';
import type { Atom } from './types/atom';
import type { Card, QTag } from './types/card-schema';

// ─────────────────────────────────────────────────────────────────────
// Route surface
// ─────────────────────────────────────────────────────────────────────

export type Route =
  | { name: 'home' }
  | { name: 'session' }
  | { name: 'track'; q: QTag }
  | { name: 'mock' }
  | { name: 'postmortem' }
  | { name: 'atoms' }
  | { name: 'weakness' }
  | { name: 'preflight' };

function pathToRoute(path: string): Route {
  const p = path.replace(/\/+$/, '') || '/home';
  if (p === '/home' || p === '/') return { name: 'home' };
  if (p === '/session') return { name: 'session' };
  if (p === '/mock') return { name: 'mock' };
  if (p === '/postmortem') return { name: 'postmortem' };
  if (p === '/atoms') return { name: 'atoms' };
  if (p === '/weakness') return { name: 'weakness' };
  if (p === '/preflight') return { name: 'preflight' };
  const m = p.match(/^\/track\/(Q[1-4])$/);
  if (m) return { name: 'track', q: m[1] as QTag };
  return { name: 'home' };
}

function routeToPath(r: Route): string {
  switch (r.name) {
    case 'home':       return '/home';
    case 'session':    return '/session';
    case 'track':      return `/track/${r.q}`;
    case 'mock':       return '/mock';
    case 'postmortem': return '/postmortem';
    case 'atoms':      return '/atoms';
    case 'weakness':   return '/weakness';
    case 'preflight':  return '/preflight';
  }
}

function routeToShell(r: Route): ShellRoute {
  switch (r.name) {
    case 'home':       return 'home';
    case 'session':    return 'home';
    case 'track':      return 'track';
    case 'mock':       return 'mock';
    case 'postmortem': return 'mock';
    case 'atoms':      return 'atoms';
    case 'weakness':   return 'weakness';
    case 'preflight':  return 'mock';
  }
}

// ─────────────────────────────────────────────────────────────────────
// AppData — what the router needs from the deck composer.
// At runtime this is loaded by main.tsx and passed in as props.
// ─────────────────────────────────────────────────────────────────────

export interface AppData {
  mockPapers: MockPaper[];
  preflightCards: Card[];
  atoms: Atom[];
  familiarity: Record<string, AtomFamiliarity | undefined>;
  weakness: WeaknessEntry[];
  weaknessHeat: number[];
}

export interface AppProps {
  data: AppData;
}

// ─────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────

export default function App({ data }: AppProps) {
  const [route, setRoute] = useState<Route>(() => pathToRoute(window.location.pathname));
  const [postmortem, setPostmortem] = useState<PostmortemPayload | null>(null);
  const [activeMockId, setActiveMockId] = useState<string | null>(
    () => data.mockPapers.find((p) => p.id.includes('M02')) ?.id
      ?? data.mockPapers[0]?.id
      ?? null,
  );

  const { setDrillRequestAction, drillRequest } = useSession();

  // ── popstate sync ────────────────────────────────────────────────
  useEffect(() => {
    function onPop() { setRoute(pathToRoute(window.location.pathname)); }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((next: Route) => {
    const path = routeToPath(next);
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
    setRoute(next);
  }, []);

  const navShell = useCallback((s: ShellRoute) => {
    if (s === 'track') return navigate({ name: 'track', q: 'Q1' });
    if (s === 'stats' || s === 'settings') return; // not yet wired
    navigate({ name: s as Route['name'] } as Route);
  }, [navigate]);

  // ── Mock + Postmortem handoff ──────────────────────────────────
  const onMockComplete = useCallback((r: MockResult) => {
    const paper = data.mockPapers.find((p) => p.id === r.paperId);
    const canonical: [string, string, string, string] = paper
      ? [paper.q1.code, paper.q2.canonicalAnswer, paper.q3.canonicalAnswer, paper.q4.canonicalAnswer]
      : ['', '', '', ''];
    // Build per-line annotations from the per-Q diff (student vs canonical).
    // The Mock harness records pass/fail; we surface the failures as line-1
    // annotations pointing at the atom of the failing Q. This is the lowest
    // viable real annotation set — replaces hard-coded empty arrays.
    const annotations = ([0, 1, 2, 3] as const).map((i) => {
      const q = r.perQ[i];
      const cards = paper ? [paper.q1, paper.q2, paper.q3, paper.q4] : [];
      const card = cards[i];
      if (!q || q.passed) return [];
      const studentLines = (q.studentAnswer ?? '').split('\n');
      const canonLines = (canonical[i] ?? '').split('\n');
      const diffLines: number[] = [];
      const max = Math.max(studentLines.length, canonLines.length);
      for (let line = 0; line < max; line++) {
        if ((studentLines[line] ?? '') !== (canonLines[line] ?? '')) {
          diffLines.push(line + 1);
          if (diffLines.length >= 5) break;
        }
      }
      if (diffLines.length === 0) diffLines.push(1);
      return diffLines.map((line) => ({
        line,
        severity: 'err' as const,
        label: `${q.qLabel} differs from canonical`,
        detail:
          `Line ${line} of your answer does not match the canonical solution. ` +
          `Atom ${card?.atomId ?? '<unknown>'} is implicated; drill it before retrying.`,
        atomId: card?.atomId,
      }));
    }) as PostmortemPayload['annotations'];
    const failedAtomIds = r.perQ.filter((q) => !q.passed).map((q) => {
      const ix = q.qIdx;
      const cards = paper ? [paper.q1, paper.q2, paper.q3, paper.q4] : [];
      return cards[ix]?.atomId ?? '';
    }).filter(Boolean);
    setPostmortem({ result: r, canonical, annotations, failedAtomIds });
    navigate({ name: 'postmortem' });
  }, [data.mockPapers, navigate]);

  // ── Preflight wiring ───────────────────────────────────────────
  const onPreflightDrill = useCallback((atomIds: string[]) => {
    setDrillRequestAction({ atomIds });
    navigate({ name: 'session' });
  }, [setDrillRequestAction, navigate]);

  // ── Home → Session/Mock/Track wiring ───────────────────────────
  const onHomeNavigate = useCallback(
    (target:
      | { kind: 'session' }
      | { kind: 'mock' }
      | { kind: 'track'; q: QTag }
      | { kind: 'weakness'; atomId: string }
    ) => {
      switch (target.kind) {
        case 'session':
          setDrillRequestAction(null);
          navigate({ name: 'session' });
          return;
        case 'mock':
          navigate({ name: 'mock' });
          return;
        case 'track':
          navigate({ name: 'track', q: target.q });
          return;
        case 'weakness':
          setDrillRequestAction({ atomIds: [target.atomId] });
          navigate({ name: 'session' });
          return;
      }
    },
    [setDrillRequestAction, navigate],
  );

  const onTrackPickCard = useCallback((cardId: string) => {
    setDrillRequestAction({ cardIds: [cardId] });
    navigate({ name: 'session' });
  }, [setDrillRequestAction, navigate]);

  // Active paper: prefer M02 (V2.0-canonical), fallback to first.
  const activeMock = useMemo<MockPaper | undefined>(() => {
    if (!activeMockId) return data.mockPapers[0];
    return data.mockPapers.find((p) => p.id === activeMockId) ?? data.mockPapers[0];
  }, [data.mockPapers, activeMockId]);

  // ── Active screen ──────────────────────────────────────────────
  const screen = useMemo(() => {
    switch (route.name) {
      case 'home':
        return <Home onNavigate={onHomeNavigate} />;
      case 'session': {
        const req = drillRequest ?? null;
        return (
          <Session
            {...(req?.cardIds ? { pinnedCardIds: req.cardIds } : {})}
            {...(req?.atomIds ? { pinnedAtomIds: req.atomIds } : {})}
            {...(req?.qTag ? { initialQ: req.qTag } : {})}
            onExit={() => {
              setDrillRequestAction(null);
              navigate({ name: 'home' });
            }}
          />
        );
      }
      case 'track':
        return (
          <Track
            qTag={route.q}
            onTabChange={(q) => navigate({ name: 'track', q })}
            onPickCard={onTrackPickCard}
          />
        );
      case 'mock': {
        if (data.mockPapers.length === 0) {
          return <FallbackEmpty label="No mock papers loaded" />;
        }
        return (
          <Mock
            paper={activeMock ?? data.mockPapers[0]!}
            mockOptions={data.mockPapers}
            activeMockId={activeMock?.id ?? null}
            onMockChange={setActiveMockId}
            onComplete={onMockComplete}
            onAbandon={() => navigate({ name: 'home' })}
          />
        );
      }
      case 'postmortem': {
        if (!postmortem) return <FallbackEmpty label="No mock result to post-mortem" />;
        return (
          <Postmortem
            payload={postmortem}
            onDrillFailed={(ids) => {
              setDrillRequestAction({ atomIds: ids });
              navigate({ name: 'session' });
            }}
            onAddToWeakness={() => { /* deck composer hook */ }}
            onDone={() => navigate({ name: 'home' })}
          />
        );
      }
      case 'atoms':
        return (
          <AtomTree
            atoms={data.atoms}
            familiarity={data.familiarity}
            onDrill={(id) => {
              setDrillRequestAction({ atomIds: [id] });
              navigate({ name: 'session' });
            }}
          />
        );
      case 'weakness':
        return (
          <Weakness
            entries={data.weakness}
            dailyFails={data.weaknessHeat}
            onDrill={(cardId) => {
              setDrillRequestAction({ cardIds: [cardId] });
              navigate({ name: 'session' });
            }}
            onDrillAtom={(atomId) => {
              setDrillRequestAction({ atomIds: [atomId] });
              navigate({ name: 'session' });
            }}
          />
        );
      case 'preflight':
        return (
          <Preflight
            cards={data.preflightCards}
            onDrillAtoms={onPreflightDrill}
            onAbort={() => navigate({ name: 'home' })}
          />
        );
    }
  }, [
    route, data, postmortem, activeMock, drillRequest,
    navigate, onMockComplete, onPreflightDrill, onHomeNavigate,
    onTrackPickCard, setDrillRequestAction,
  ]);

  // Hooks before any early returns — keep call order stable.
  const breadcrumb = useMemo(() => {
    if (route.name === 'track') return [route.q];
    return [] as string[];
  }, [route]);

  // Mock + Preflight render full-screen — hide the AppShell chrome.
  const isFullScreen = route.name === 'mock' || route.name === 'preflight';

  if (isFullScreen) return <>{screen}</>;

  return (
    <AppShell
      route={routeToShell(route)}
      onNavigate={navShell}
      breadcrumb={breadcrumb}
      atomCount={Object.keys(data.familiarity).length}
      streak={0}
    >
      {screen}
    </AppShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Lightweight stubs — only used as a defensive fallback now.
// ─────────────────────────────────────────────────────────────────────

function FallbackEmpty({ label }: { label: string }) {
  return (
    <div className="mono" style={{ padding: 24, color: 'var(--text-2)', fontSize: 13 }}>
      {label}
    </div>
  );
}
