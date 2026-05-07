/**
 * WalkthroughCard.stories.tsx — annotated reveal scenarios.
 */

import { useState } from 'react';
import { WalkthroughCard } from '../WalkthroughCard';
import type { WalkthroughCard as WalkthroughCardData } from '../../../types/card-schema';

function Frame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        padding: 24,
        background: 'var(--bg-0, #0d1117)',
        minHeight: '100vh',
        color: 'var(--text-0, #e6edf3)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1 style={{ margin: 0, fontSize: 16, color: 'var(--text-2, #6e7681)' }}>{title}</h1>
      {children}
    </section>
  );
}

const Q1_CODE = `#include <iostream>
using namespace std;

int main()
{
    int n = 3;
    int sum = 0;
    for (int i = 0; i < n; i++)
    {
        sum = sum + i;
    }
    cout << sum << endl;
    return 0;
}`;

const Q3_CODE = `void read_books(Book &list[], int n)
{
    for (int i = 0; i < n; i++)
    {
        cin >> list[i].title;
        cin >> list[i].pages;
    }
}`;

const STRUCT_CODE = `struct Computer
{
    string brand;
    int ram_gb;
    double price;
};`;

function makeCard(input: {
  id: string;
  levelLabel: string;
  stem: string;
  fullCode: string;
  steps: { line: number; code: string; annotation: string; atomIds: string[] }[];
}): WalkthroughCardData {
  return {
    id: input.id,
    schemaVersion: 'v2',
    atomId: 'F-18',
    qTags: ['Q1'],
    stage: 0,
    level: 'L0',
    type: 'WalkthroughCard',
    stem: input.stem,
    source: { kind: 'practice', ref: 'walkthrough story' },
    commonMistakeIds: [],
    status: 'NEW',
    createdBy: 'STORY-WalkthroughCard',
    reviewedBy: [],
    levelLabel: input.levelLabel,
    fullCode: input.fullCode,
    steps: input.steps,
  };
}

export function Q1ForLoopSum() {
  const [done, setDone] = useState(false);
  return (
    <Frame title="WalkthroughCard · 1. Q1 for-loop sum">
      <WalkthroughCard
        card={makeCard({
          id: 'wt.story.q1',
          levelLabel: 'L0 · F-18 · for-loop counting',
          stem: 'walk-through: counted for-loop summing 0..n-1',
          fullCode: Q1_CODE,
          steps: [
            { line: 6, code: 'int n = 3;', annotation: 'declare loop bound n.', atomIds: ['F-09'] },
            { line: 7, code: 'int sum = 0;', annotation: 'accumulator init.', atomIds: ['F-09'] },
            { line: 8, code: 'for (int i = 0; i < n; i++)', annotation: 'i goes 0,1,2.', atomIds: ['F-18'] },
            { line: 10, code: 'sum = sum + i;', annotation: 'sum picks up 0+1+2 = 3.', atomIds: ['F-13'] },
            { line: 12, code: 'cout << sum << endl;', annotation: 'prints 3.', atomIds: ['F-15'] },
          ],
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export function Q3ReadBooks() {
  const [done, setDone] = useState(false);
  return (
    <Frame title="WalkthroughCard · 2. Q3 read_books">
      <WalkthroughCard
        card={makeCard({
          id: 'wt.story.q3',
          levelLabel: 'L4 · A12 · read array of structs',
          stem: 'walk-through: Q3 read function shape',
          fullCode: Q3_CODE,
          steps: [
            { line: 1, code: 'void read_books(Book &list[], int n)', annotation: 'pass list by reference + count.', atomIds: ['F-22b'] },
            { line: 3, code: 'for (int i = 0; i < n; i++)', annotation: 'iterate exactly n times.', atomIds: ['F-18'] },
            { line: 5, code: 'cin >> list[i].title;', annotation: 'fill the title field.', atomIds: ['F-21'] },
            { line: 6, code: 'cin >> list[i].pages;', annotation: 'fill the pages field.', atomIds: ['F-21'] },
          ],
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export function Q2StructDef() {
  const [done, setDone] = useState(false);
  return (
    <Frame title="WalkthroughCard · 3. Q2 struct shape">
      <WalkthroughCard
        card={makeCard({
          id: 'wt.story.q2',
          levelLabel: 'L0 · F-20 · struct definition',
          stem: 'walk-through: Q2 struct skeleton',
          fullCode: STRUCT_CODE,
          steps: [
            { line: 1, code: 'struct Computer', annotation: 'PascalCase name after `struct`.', atomIds: ['F-20'] },
            { line: 2, code: '{', annotation: 'open brace on new line.', atomIds: ['F-08'] },
            { line: 5, code: '};', annotation: 'must end with `};`, not just `}`.', atomIds: ['F-07', 'F-20'] },
          ],
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export default Q1ForLoopSum;
