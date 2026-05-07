/**
 * Track.stories.tsx — manual scenarios for UX-M04.
 *
 * Stories:
 *   1. Empty            — no cards / no progress; Q-tab bar still works.
 *   2. MidProgress      — Q1 at S3 in-flight; Q2 at S2; Q3 at S1; Q4 at S4.
 *   3. NearTestDay      — Q1..Q4 at S5/S6, mock-ready, ring near 90%.
 */

import type { ReactNode } from 'react';
import type { Card, QTag } from '../../types/card-schema';
import {
  SessionStoreProvider,
  useSession,
} from '../../lib/session-store';
import { Track } from '../Track';

// ─────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────

function fakeCard(
  i: number,
  atomId: string,
  qTags: readonly QTag[],
  stage: 0 | 1 | 2 | 3 | 4 | 5 | 6
): Card {
  return {
    id: `t-${i}`,
    schemaVersion: 'v2',
    atomId: atomId as Card['atomId'],
    qTags: [...qTags] as Card['qTags'],
    stage,
    level: 'L2',
    type: 'TraceCard',
    stem: `trace fixture ${i}`,
    source: { kind: 'practice', ref: 'fixture' },
    commonMistakeIds: [],
    status: 'NEW',
    createdBy: 'fixture',
    reviewedBy: [],
    code: 'int main(){return 0;}',
    variables: [],
    expectedTrace: [{ line: 0, variable: '', value: '' }],
    userInputs: [],
    inputLabels: [],
    terminalOutput: [],
    inputMode: 'final-only',
  } as unknown as Card;
}

function buildCards(count: number): Card[] {
  const out: Card[] = [];
  const allQ: ReadonlyArray<readonly QTag[]> = [
    ['Q1'],
    ['Q2'],
    ['Q3'],
    ['Q4'],
    ['Q1', 'Q3'],
    ['Q2', 'Q4'],
  ];
  for (let i = 0; i < count; i++) {
    const aNum = (i % 24) + 1;
    const atomId = `F-${String(aNum).padStart(2, '0')}`;
    out.push(
      fakeCard(
        i,
        atomId,
        allQ[i % allQ.length]!,
        ((i % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6
      )
    );
  }
  return out;
}

interface Shape {
  readonly qFam: readonly [number, number, number, number];
  readonly stagePromoted: readonly [number, number, number, number];
}

function Seed({ shape }: { shape: Shape }) {
  const { state, recordResultAction, setStageProgressAction } = useSession();
  if (typeof window !== 'undefined' && Object.keys(state.exposures).length === 0) {
    setTimeout(() => {
      const allCards = Object.values(state.cards);
      for (const c of allCards) {
        const q = (c.qTags?.[0] ?? 'Q1') as QTag;
        const idx = (['Q1', 'Q2', 'Q3', 'Q4'] as QTag[]).indexOf(q);
        const target = shape.qFam[idx] ?? 0;
        const N = 8;
        for (let k = 0; k < N; k++) {
          const correct = (k / N) * 100 < target;
          recordResultAction(c.cardId, correct);
        }
      }
      const QS: QTag[] = ['Q1', 'Q2', 'Q3', 'Q4'];
      QS.forEach((q, i) => {
        const top = shape.stagePromoted[i] ?? 0;
        for (let s = 1; s <= top && s <= 6; s++) {
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
        Track · {title}
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
          minHeight: 720,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────────────────────

export function Empty() {
  return (
    <StoryFrame
      title="Empty"
      note="No cards. Tabs still cycle with 1-4. Skip-stage disabled at S6 only."
    >
      <SessionStoreProvider initialCards={[]}>
        <Track
          initialQ="Q1"
          onPickCard={(id) => console.log('pick', id)}
          onConfirmSkip={(q, f, t) =>
            console.log('confirmed skip', q, f, '→', t)
          }
        />
      </SessionStoreProvider>
    </StoryFrame>
  );
}

export function MidProgress() {
  const cards = buildCards(160);
  const shape: Shape = {
    qFam: [78, 55, 38, 70],
    stagePromoted: [3, 2, 1, 4],
  };
  return (
    <StoryFrame
      title="Mid-progress"
      note="Q1 climbing into S3. Q4 furthest along. Skip-stage available."
    >
      <SessionStoreProvider initialCards={cards}>
        <Seed shape={shape} />
        <Track
          initialQ="Q1"
          onPickCard={(id) => console.log('pick', id)}
          onConfirmSkip={(q, f, t) =>
            console.log('confirmed skip', q, f, '→', t)
          }
        />
      </SessionStoreProvider>
    </StoryFrame>
  );
}

export function NearTestDay() {
  const cards = buildCards(160);
  const shape: Shape = {
    qFam: [90, 92, 89, 88],
    stagePromoted: [6, 5, 6, 5],
  };
  return (
    <StoryFrame
      title="Near test day"
      note="All Q-tracks at S5+. Familiarity ring ~ 90%. Mock-ready."
    >
      <SessionStoreProvider initialCards={cards}>
        <Seed shape={shape} />
        <Track
          initialQ="Q3"
          onPickCard={(id) => console.log('pick', id)}
          onConfirmSkip={(q, f, t) =>
            console.log('confirmed skip', q, f, '→', t)
          }
        />
      </SessionStoreProvider>
    </StoryFrame>
  );
}

export default function AllTrackStories() {
  return (
    <div>
      <Empty />
      <MidProgress />
      <NearTestDay />
    </div>
  );
}
