/**
 * main.tsx — cpp-t2 v2 entrypoint.
 *
 * Mounts the React 19 root, wires the SessionStoreProvider, and (where
 * possible) eagerly loads cards / atoms / mock papers / preflight cards
 * so the router has data on the very first paint.
 *
 * Design notes:
 *   - Theme + spacing + focus + motion + typography CSS are imported
 *     here (and only here) so v1 and v2 stylesheets never collide.
 *   - YAML loading happens via Vite's import.meta.glob in eager+raw
 *     mode: zero network calls, zero runtime fetch, the bundler stamps
 *     every YAML file in as a string at build time.
 *   - We deliberately fail-open on bad cards: invalid YAML files are
 *     reported to the console and skipped, rather than blowing up the
 *     whole app. The smoke-test script is the gate that catches them.
 *   - Atoms YAML is structurally laxer than the strict Atom zod schema
 *     (legacy authoring shape used `commonMistakes`/`source: array`).
 *     We adapt the YAML into a strict Atom record at load time so the
 *     downstream AtomTree / familiarity tooling is fed the correct shape.
 */

import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import yaml from 'js-yaml';

import App, { type AppData } from './App';
import { SessionStoreProvider } from './lib/session-store';
import { Card, type Card as CardT } from './types/card-schema';
import type { Atom } from './types/atom';
import type { MockPaper } from './pages/Mock';
import { CardRenderer } from './components/CardRenderer';

import './theme.css';
import './lib/typography.css';
import './lib/spacing.css';
import './lib/focus.css';
import './lib/motion.css';

// ─────────────────────────────────────────────────────────────────────
// Eager YAML load — Vite resolves the glob at build time and bundles
// every YAML as a raw string.
// ─────────────────────────────────────────────────────────────────────

const cardYamlModules = import.meta.glob('../data/v2/cards/**/*.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const atomYamlModules = import.meta.glob('../data/v2/atoms/**/*.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const mockYamlModules = import.meta.glob('../data/v2/mocks/*.yml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

// ─────────────────────────────────────────────────────────────────────
// Cards
// ─────────────────────────────────────────────────────────────────────

function loadCards(): { cards: CardT[]; bad: number } {
  const cards: CardT[] = [];
  let bad = 0;
  for (const [path, raw] of Object.entries(cardYamlModules)) {
    let parsed: unknown;
    try {
      parsed = yaml.load(raw);
    } catch (e) {
      console.warn(`[main] yaml-parse failed for ${path}:`, e);
      bad++;
      continue;
    }
    const items = Array.isArray(parsed) ? parsed : [parsed];
    for (const item of items) {
      const r = Card.safeParse(item);
      if (r.success) {
        cards.push(r.data);
      } else {
        bad++;
        if (bad < 6) {
          console.warn(
            `[main] schema-fail ${path}:`,
            r.error.issues[0]?.path.join('.'),
            r.error.issues[0]?.message,
          );
        }
      }
    }
  }
  return { cards, bad };
}

// ─────────────────────────────────────────────────────────────────────
// Atoms — adapt legacy YAML shape into the strict Atom record.
// ─────────────────────────────────────────────────────────────────────

interface RawAtomYaml {
  id?: string;
  name?: string;
  level?: string;
  prereqs?: unknown;
  usedByQs?: unknown;
  commonMistakes?: unknown;
  commonMistakeIds?: unknown;
  cardCountTarget?: number;
  source?: unknown;
  description?: string;
  canonicalExample?: string;
  notes?: unknown;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === 'string');
}

function adaptAtom(path: string, raw: unknown): Atom | null {
  if (!raw || typeof raw !== 'object') {
    console.warn(`[main] atom non-object: ${path}`);
    return null;
  }
  const r = raw as RawAtomYaml;
  const id = typeof r.id === 'string' ? r.id : null;
  const name = typeof r.name === 'string' ? r.name : null;
  const level = typeof r.level === 'string' ? r.level : null;
  if (!id || !name || !level) {
    console.warn(`[main] atom missing id/name/level: ${path}`);
    return null;
  }
  // Schema requires Level enum: L0..L5. Skip atoms outside that band.
  if (!['L0', 'L1', 'L2', 'L3', 'L4', 'L5'].includes(level)) {
    return null;
  }
  const prereqs = asStringArray(r.prereqs);
  const usedByQs = asStringArray(r.usedByQs).filter((q) =>
    q === 'Q1' || q === 'Q2' || q === 'Q3' || q === 'Q4',
  ) as Atom['usedByQs'];
  if (usedByQs.length === 0) {
    return null;
  }
  // Source legacy: array of {kind, ref, quote?}; new: single object {kind, ref}.
  let source: Atom['source'] = { kind: 'v2', ref: path };
  if (Array.isArray(r.source) && r.source.length > 0 && typeof r.source[0] === 'object') {
    const first = r.source[0] as { kind?: string; ref?: string };
    if (
      first.ref &&
      first.kind &&
      ['practice', 'v2', 'pfg', 'seminar'].includes(first.kind)
    ) {
      source = { kind: first.kind as Atom['source']['kind'], ref: first.ref };
    }
  } else if (r.source && typeof r.source === 'object') {
    const s = r.source as { kind?: string; ref?: string };
    if (s.ref && s.kind && ['practice', 'v2', 'pfg', 'seminar'].includes(s.kind)) {
      source = { kind: s.kind as Atom['source']['kind'], ref: s.ref };
    }
  }
  const cmIds = asStringArray(r.commonMistakeIds ?? r.commonMistakes).filter(
    (s) => /^CM-[A-Za-z0-9_-]+$/.test(s),
  );
  const cardCountTarget =
    typeof r.cardCountTarget === 'number' && r.cardCountTarget > 0
      ? r.cardCountTarget
      : 6;
  const atom: Atom = {
    id,
    name,
    level: level as Atom['level'],
    prereqs,
    usedByQs,
    commonMistakeIds: cmIds,
    cardCountTarget,
    exposureTarget: { short: 6, medium: 8, long: 12 },
    source,
  };
  return atom;
}

function loadAtoms(): { atoms: Atom[]; bad: number } {
  const atoms: Atom[] = [];
  let bad = 0;
  for (const [path, raw] of Object.entries(atomYamlModules)) {
    let parsed: unknown;
    try {
      parsed = yaml.load(raw);
    } catch (e) {
      console.warn(`[main] yaml-parse failed for ${path}:`, e);
      bad++;
      continue;
    }
    const a = adaptAtom(path, parsed);
    if (a) atoms.push(a);
    else bad++;
  }
  // De-dupe by id, preferring the first seen (deterministic via path order).
  const seen = new Set<string>();
  const unique: Atom[] = [];
  for (const a of atoms) {
    if (seen.has(a.id)) continue;
    seen.add(a.id);
    unique.push(a);
  }
  return { atoms: unique, bad };
}

// ─────────────────────────────────────────────────────────────────────
// Mock papers — hydrate from data/v2/mocks/ + L5 cards.
// Each Mxx-* mock generates one paper. The current cards/L5 corpus
// emits SpeedDrillCards + PostmortemCards for mocks, NOT TraceCard /
// StructWriteCard / FunctionWriteCard / MainWriteCard. The Mock view
// requires the latter four, so we substitute the closest-matching
// real card from the global deck (filtered to the corresponding Q-tag)
// per Mxx mock entry. Result: 8 mock papers (one per Mxx file group).
// ─────────────────────────────────────────────────────────────────────

function pickFor(cards: CardT[], type: string, qTag: string): CardT | undefined {
  return cards.find((c) => c.type === type && c.qTags.includes(qTag as 'Q1'));
}

function buildMockPapers(cards: CardT[]): MockPaper[] {
  // Discover Mxx ids from the mocks YAML directory file names.
  const mockIds = new Set<string>();
  const labelById = new Map<string, string>();
  for (const path of Object.keys(mockYamlModules)) {
    const fname = path.split('/').pop() ?? '';
    const m = fname.match(/^(M\d{2})-([a-z0-9-]+?)(?:-q[1-4]-postmortem|-speeddrill)\.yml$/);
    if (m) {
      mockIds.add(m[1]!);
      // Pretty label: e.g. "M02 · canonical-sum-positive-desk"
      if (!labelById.has(m[1]!)) labelById.set(m[1]!, `${m[1]!}-${m[2]!}`);
    }
  }
  if (mockIds.size === 0) {
    // Fallback: fabricate one paper from the first matching cards.
    const q1 = pickFor(cards, 'TraceCard', 'Q1');
    const q2 = pickFor(cards, 'StructWriteCard', 'Q2');
    const q3 = pickFor(cards, 'FunctionWriteCard', 'Q3');
    const q4 = pickFor(cards, 'MainWriteCard', 'Q4');
    if (!q1 || !q2 || !q3 || !q4) return [];
    return [
      {
        id: 'paper-default-001',
        q1: q1 as MockPaper['q1'],
        q2: q2 as MockPaper['q2'],
        q3: q3 as MockPaper['q3'],
        q4: q4 as MockPaper['q4'],
      },
    ];
  }
  // Real mock list: one paper per Mxx, all sharing the same closest-matching
  // hand-execute / write cards from the deck. The variation is the Mxx
  // identifier + UI selector; the underlying deck cards are reused so the
  // student sees consistent question shapes across papers.
  const q1All = cards.filter((c) => c.type === 'TraceCard' && c.qTags.includes('Q1'));
  const q2All = cards.filter((c) => c.type === 'StructWriteCard' && c.qTags.includes('Q2'));
  const q3All = cards.filter((c) => c.type === 'FunctionWriteCard' && c.qTags.includes('Q3'));
  const q4All = cards.filter((c) => c.type === 'MainWriteCard' && c.qTags.includes('Q4'));
  if (q1All.length === 0 || q2All.length === 0 || q3All.length === 0 || q4All.length === 0) {
    return [];
  }
  const sortedIds = [...mockIds].sort();
  return sortedIds.map((mid, idx) => {
    const q1 = q1All[idx % q1All.length]!;
    const q2 = q2All[idx % q2All.length]!;
    const q3 = q3All[idx % q3All.length]!;
    const q4 = q4All[idx % q4All.length]!;
    return {
      id: labelById.get(mid) ?? mid,
      q1: q1 as MockPaper['q1'],
      q2: q2 as MockPaper['q2'],
      q3: q3 as MockPaper['q3'],
      q4: q4 as MockPaper['q4'],
    };
  });
}

// ─────────────────────────────────────────────────────────────────────
// AppData — feed the router real, non-empty atoms / familiarity / weakness.
// ─────────────────────────────────────────────────────────────────────

function buildAppData(cards: CardT[], atoms: Atom[]): AppData {
  // Initial familiarity = 0% per atom (untouched).
  const familiarity: AppData['familiarity'] = {};
  for (const a of atoms) {
    familiarity[a.id] = { pct: null };
  }
  // Weakness = empty initially (no fails recorded yet).
  const weakness: AppData['weakness'] = [];
  // Heat: 90 days of zero — the home tile expects a per-day count.
  // Per AUDIT_FUNCTIONALITY: length 90, not 7.
  const weaknessHeat = Array.from({ length: 90 }, () => 0);
  return {
    mockPapers: buildMockPapers(cards),
    preflightCards: cards.slice(0, 50),
    atoms,
    familiarity,
    weakness,
    weaknessHeat,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Boot wrapper — provider + first-paint state for async card loading.
// ─────────────────────────────────────────────────────────────────────

function Boot() {
  const [data, setData] = useState<AppData | null>(null);
  const [cards, setCards] = useState<CardT[]>([]);

  useEffect(() => {
    // YAML is already in the bundle; the work is parsing + zod-validating.
    // Defer to the next tick so the first paint isn't blocked by 2k cards.
    const id = setTimeout(() => {
      const { cards: loaded, bad } = loadCards();
      const { atoms, bad: badAtoms } = loadAtoms();
      console.info(
        `[main] loaded ${loaded.length} valid cards (${bad} skipped), ` +
          `${atoms.length} atoms (${badAtoms} skipped)`,
      );
      setCards(loaded);
      setData(buildAppData(loaded, atoms));
      // QA-M20 hook: when the page is loaded with `?qa=stress`, expose
      // the parsed deck so the runtime-stress spec can iterate it.
      if (typeof window !== 'undefined' && /[?&]qa=stress\b/.test(window.location.search)) {
        (window as unknown as { __qa_cards?: CardT[] }).__qa_cards = loaded;
      }
    }, 0);
    return () => clearTimeout(id);
  }, []);

  if (!data) {
    return (
      <div
        className="mono"
        style={{
          padding: 24,
          color: 'var(--text-1)',
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
        }}
      >
        Loading deck …
      </div>
    );
  }

  // QA-M20 stress mode: ?qa=stress short-circuits routing and runs the
  // CardRenderer-cycler that mounts the requested card index. The Playwright
  // spec drives `window.__qa_setIndex(i)` to walk the deck.
  if (typeof window !== 'undefined' && /[?&]qa=stress\b/.test(window.location.search)) {
    return (
      <SessionStoreProvider initialCards={cards}>
        <StressCycler cards={cards} />
      </SessionStoreProvider>
    );
  }

  return (
    <SessionStoreProvider initialCards={cards}>
      <App data={data} />
    </SessionStoreProvider>
  );
}

/**
 * QA-M20 helper. Mounts CardRenderer for cards[index]; the Playwright
 * spec walks `index` from 0..N via window.__qa_setIndex. This keeps
 * the stress test inside the real React + provider tree (no parallel
 * mock app), so any context-bound failures still surface.
 */
function StressCycler({ cards }: { cards: CardT[] }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    (window as unknown as { __qa_setIndex?: (i: number) => void }).__qa_setIndex = (i: number) => {
      setIndex(i % Math.max(1, cards.length));
    };
    (window as unknown as { __qa_count?: number }).__qa_count = cards.length;
  }, [cards.length]);
  if (cards.length === 0) {
    return <div data-qa="empty">no cards</div>;
  }
  const card = cards[index] ?? cards[0];
  if (!card) return <div data-qa="empty">no cards</div>;
  return (
    <div data-qa-stress data-qa-index={index} data-qa-card-id={card.id} style={{ padding: 16 }}>
      <CardRenderer card={card} onComplete={() => { /* noop in stress mode */ }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Mount
// ─────────────────────────────────────────────────────────────────────

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('root element missing — index-v2.html must contain <div id="root"></div>');
}

createRoot(rootEl).render(
  <StrictMode>
    <Boot />
  </StrictMode>,
);
