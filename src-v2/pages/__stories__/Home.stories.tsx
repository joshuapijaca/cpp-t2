/**
 * Home.stories.tsx — manual scenarios for UX-M03.
 *
 * cpp-t2 does not use Storybook. Each story is a stateful React component
 * that wires fixture cards into a SessionStoreProvider, then mounts <Home>.
 * Mount any of these from a harness route to verify behaviour by hand.
 *
 * Stories:
 *   1. Empty            — no cards loaded; queue empty; weakness file empty.
 *   2. MidProgress      — 47-card deck composed; mixed Q-track familiarity;
 *                          some weak atoms; multiple stages in progress.
 *   3. NearTestDay      — T-1d to test; high familiarity; mock-ready.
 */

import type { ReactNode } from 'react';
import type { Card, QTag } from '../../types/card-schema';
import {
  SessionStoreProvider,
  useSession,
  TEST_DATE_ISO,
} from '../../lib/session-store';
import { Home } from '../Home';

// ─────────────────────────────────────────────────────────────────────────
// Fixture builders
// ─────────────────────────────────────────────────────────────────────────

function fakeCard(
  i: number,
  atomId: string,
  qTags: readonly QTag[],
  stage: 0 | 1 | 2 | 3 | 4 | 5 | 6
): Card {
  return {
    id: `c-${i}`,
    schemaVersion: 'v2',
    atomId: atomId as Card['atomId'],
    qTags: [...qTags] as Card['qTags'],
    stage,
    level: 'L1',
    type: 'MCQCard',
    stem: `fixture stem ${i}`,
    source: { kind: 'practice', ref: 'fixture' },
    commonMistakeIds: [],
    status: 'NEW',
    createdBy: 'fixture',
    reviewedBy: [],
    correct: 'A',
    distractors: ['B', 'C', 'D'],
    explanation: 'fixture',
  } as Card;
}

function buildFixtureCards(count: number): Card[] {
  const cards: Card[] = [];
  const qSets: ReadonlyArray<readonly QTag[]> = [
    ['Q1'],
    ['Q2'],
    ['Q3'],
    ['Q4'],
    ['Q1', 'Q2'],
    ['Q3', 'Q4'],
  ];
  for (let i = 0; i < count; i++) {
    const atomNum = (i % 30) + 1;
    const atomId = `F-${String(atomNum).padStart(2, '0')}`;
    const qSet = qSets[i % qSets.length]!;
    const stage = ((i % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6;
    cards.push(fakeCard(i, atomId, qSet, stage));
  }
  return cards;
}

// ─────────────────────────────────────────────────────────────────────────
// Seeded harness — applies a "shape" of session progress on first mount
// ─────────────────────────────────────────────────────────────────────────

interface Shape {
  /** [percent_correct_for_q1, q2, q3, q4] for synthetic exposure. */
  readonly qFamiliarity: readonly [number, number, number, number];
  /** Highest stage promoted per Q. */
  readonly stagePromoted: readonly [number, number, number, number];
}

function SeedSession({
  cards,
  shape,
  children,
}: {
  cards: readonly Card[];
  shape: Shape;
  children: ReactNode;
}) {
  return (
    <SessionStoreProvider initialCards={cards}>
      <SeedingHook shape={shape} />
      {children}
    </SessionStoreProvider>
  );
}

/** Fires a useEffect on mount that pushes synthetic exposures + stages. */
function SeedingHook({ shape }: { shape: Shape }) {
  const { state, recordResultAction, setStageProgressAction } = useSession();

  // Apply once: count exposures already recorded; if zero, seed.
  // Uses a one-shot effect via setTimeout(0) -- fine for stories.
  // We simulate progress by directly calling the actions in a setTimeout
  // so the reducer runs after first render.
  if (typeof window !== 'undefined' && Object.keys(state.exposures).length === 0) {
    setTimeout(() => {
      const allCards = Object.values(state.cards);
      // Synthesize correctness per Q-track to match target percent.
      for (const c of allCards) {
        const q = (c.qTags?.[0] ?? 'Q1') as QTag;
        const qIdx = (['Q1', 'Q2', 'Q3', 'Q4'] as QTag[]).indexOf(q);
        const target = shape.qFamiliarity[qIdx] ?? 0;
        const N = 8;
        for (let k = 0; k < N; k++) {
          const correct = (k / N) * 100 < target;
          recordResultAction(c.cardId, correct);
        }
      }
      const QS: QTag[] = ['Q1', 'Q2', 'Q3', 'Q4'];
      QS.forEach((q, i) => {
        const top = shape.stagePromoted[i] ?? 0;
        for (let s = 1; s <= 6; s++) {
          if (s > top) break;
          setStageProgressAction({
            qTag: q,
            stage: s as 1 | 2 | 3 | 4 | 5 | 6,
            accuracy: 100,
            lastN: [true, true, true, true, true],
            stalledAtMs: Date.now() - 60_000,
            completedAt: Date.now(),
          });
        }
      });
    }, 0);
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────
// Story frame
// ─────────────────────────────────────────────────────────────────────────

function StoryFrame({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        background: 'var(--bg-0, #0d1117)',
        padding: 16,
        margin: '24px auto',
        maxWidth: 1200,
        color: 'var(--text-0, #e6edf3)',
      }}
    >
      <h3
        className="mono"
        style={{
          fontSize: 12,
          color: 'var(--text-2, #6e7681)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          margin: '0 0 4px',
        }}
      >
        Home · {title}
      </h3>
      {note && (
        <p
          style={{
            margin: '0 0 12px',
            color: 'var(--text-1, #8b949e)',
            fontSize: 12,
          }}
        >
          {note}
        </p>
      )}
      <div
        style={{
          background: 'var(--bg-0, #0d1117)',
          border: '1px solid var(--border-1, #30363d)',
          borderRadius: 6,
          minHeight: 600,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Story 1: Empty
// ─────────────────────────────────────────────────────────────────────────

export function Empty() {
  return (
    <StoryFrame
      title="Empty"
      note="No cards registered. Today queue + weakness file are empty."
    >
      <SessionStoreProvider initialCards={[]}>
        <Home onNavigate={(t) => console.log('navigate', t)} />
      </SessionStoreProvider>
    </StoryFrame>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Story 2: Mid-progress
// ─────────────────────────────────────────────────────────────────────────

export function MidProgress() {
  const cards = buildFixtureCards(180);
  const shape: Shape = {
    qFamiliarity: [82, 61, 44, 79],
    stagePromoted: [4, 3, 2, 4],
  };
  return (
    <StoryFrame
      title="Mid-progress"
      note="180-card fixture. Q3 lagging, Q1+Q4 ahead. Several weak atoms surfaced."
    >
      <SeedSession cards={cards} shape={shape}>
        <Home onNavigate={(t) => console.log('navigate', t)} />
      </SeedSession>
    </StoryFrame>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Story 3: Near test day
// ─────────────────────────────────────────────────────────────────────────

export function NearTestDay() {
  const cards = buildFixtureCards(180);
  const shape: Shape = {
    qFamiliarity: [92, 88, 90, 86],
    stagePromoted: [6, 5, 6, 5],
  };
  return (
    <StoryFrame
      title="Near test day"
      note={`Test ${TEST_DATE_ISO}. Mock-ready: all Q-tracks ≥ S5, familiarity ≥ 85%.`}
    >
      <SeedSession cards={cards} shape={shape}>
        <Home onNavigate={(t) => console.log('navigate', t)} targetCount={47} />
      </SeedSession>
    </StoryFrame>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Default — render all stories.
// ─────────────────────────────────────────────────────────────────────────

export default function AllHomeStories() {
  return (
    <div>
      <Empty />
      <MidProgress />
      <NearTestDay />
    </div>
  );
}

