/**
 * Home.stories.tsx — manual scenarios for the v2.2 minimalist Home.
 *
 * cpp-t2 does not use Storybook. Each story is a stateful React component
 * that wires fixture cards into a SessionStoreProvider, then mounts <Home>.
 * Mount any of these from a harness route to verify behaviour by hand.
 *
 * Stories:
 *   1. Empty            — no cards loaded; all level rows show [00 / 00].
 *   2. MidProgress      — fixture deck across L0..L5 with synthetic
 *                          exposures so the position counts on each row
 *                          are non-zero.
 *
 * The pre-Phase-A5 stories (Empty / MidProgress / NearTestDay) referenced
 * the dropped `onNavigate` / `targetCount` props (drift from the v2.1
 * dashboard). Phase A5 rewrites them against the new `onPick(level,
 * cardIndex?)` contract.
 */

import type { ReactNode } from 'react';
import type { Card, Level, QTag } from '../../types/card-schema';
import { SessionStoreProvider, useSession } from '../../lib/session-store';
import { Home } from '../Home';

// ─────────────────────────────────────────────────────────────────────────
// Fixture builders
// ─────────────────────────────────────────────────────────────────────────

function fakeCard(
  i: number,
  atomId: string,
  qTags: readonly QTag[],
  level: Level,
): Card {
  return {
    id: `c-${i}`,
    schemaVersion: 'v2',
    atomId: atomId as Card['atomId'],
    qTags: [...qTags] as Card['qTags'],
    stage: 1,
    level,
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

/**
 * Build a fixture deck spread across L0..L5 in roughly the same proportions
 * as the real corpus (517 / 836 / 269 / 430 / 408 / 87 → scaled down).
 */
function buildFixtureCards(): Card[] {
  const counts: Record<Level, number> = {
    L0: 12,
    L1: 20,
    L2: 8,
    L3: 10,
    L4: 10,
    L5: 4,
  };
  const cards: Card[] = [];
  let i = 0;
  for (const level of ['L0', 'L1', 'L2', 'L3', 'L4', 'L5'] as readonly Level[]) {
    const n = counts[level];
    for (let k = 0; k < n; k++) {
      const atomNum = (i % 22) + 1;
      const atomId = `F-${String(atomNum).padStart(2, '0')}`;
      cards.push(fakeCard(i, atomId, ['Q1'], level));
      i++;
    }
  }
  return cards;
}

// ─────────────────────────────────────────────────────────────────────────
// Seeded harness — fires synthetic exposures so position counts > 0
// ─────────────────────────────────────────────────────────────────────────

function SeedSession({
  cards,
  exposeFraction,
  children,
}: {
  cards: readonly Card[];
  /** 0..1 fraction of cards in each level to mark as seen. */
  exposeFraction: number;
  children: ReactNode;
}) {
  return (
    <SessionStoreProvider initialCards={cards}>
      <SeedingHook exposeFraction={exposeFraction} />
      {children}
    </SessionStoreProvider>
  );
}

function SeedingHook({ exposeFraction }: { exposeFraction: number }) {
  const { state, cards, recordResultAction } = useSession();

  if (typeof window !== 'undefined' && Object.keys(state.exposures).length === 0) {
    setTimeout(() => {
      const byLevel: Record<Level, Card[]> = {
        L0: [], L1: [], L2: [], L3: [], L4: [], L5: [],
      };
      for (const c of cards) {
        if (byLevel[c.level]) byLevel[c.level]!.push(c);
      }
      for (const level of Object.keys(byLevel) as Level[]) {
        const deck = byLevel[level];
        const take = Math.floor(deck.length * exposeFraction);
        for (let k = 0; k < take; k++) {
          recordResultAction(deck[k]!.id, true);
        }
      }
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
      note="No cards registered. All level rows show [00 / 00] and the row buttons are disabled."
    >
      <SessionStoreProvider initialCards={[]}>
        <Home onPick={(lvl, idx) => console.log('pick', lvl, idx)} />
      </SessionStoreProvider>
    </StoryFrame>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Story 2: Mid-progress
// ─────────────────────────────────────────────────────────────────────────

export function MidProgress() {
  const cards = buildFixtureCards();
  return (
    <StoryFrame
      title="Mid-progress"
      note="64-card fixture across L0..L5. About a third of each level is marked as seen."
    >
      <SeedSession cards={cards} exposeFraction={0.33}>
        <Home onPick={(lvl, idx) => console.log('pick', lvl, idx)} />
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
    </div>
  );
}
