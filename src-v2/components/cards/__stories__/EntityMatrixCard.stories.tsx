/**
 * EntityMatrixCard.stories.tsx — RAVEN entity transfer scenarios.
 */

import { useState } from 'react';
import { EntityMatrixCard } from '../EntityMatrixCard';
import type { EntityMatrixCard as EntityMatrixCardData } from '../../../types/card-schema';

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

function makeCard(input: {
  id: string;
  stem: string;
  examples: { label: string; text: string }[];
  prompt: string;
  canonicalAnswer: string;
  keyChecks: string[];
  explanation: string;
}): EntityMatrixCardData {
  return {
    id: input.id,
    schemaVersion: 'v2',
    atomId: 'A12',
    qTags: ['Q2'],
    stage: 0,
    level: 'L0',
    type: 'EntityMatrixCard',
    stem: input.stem,
    source: { kind: 'practice', ref: 'entity matrix story' },
    commonMistakeIds: [],
    status: 'NEW',
    createdBy: 'STORY-EntityMatrixCard',
    reviewedBy: [],
    examples: input.examples,
    prompt: input.prompt,
    canonicalAnswer: input.canonicalAnswer,
    keyChecks: input.keyChecks,
    explanation: input.explanation,
  };
}

const COMPUTER = `struct Computer
{
    string brand;
    int ram_gb;
    double price;
};`;

const DESK = `struct Desk
{
    int room_id;
    int d_id;
    int n_screens;
};`;

const CAR = `struct Car
{
    string make;
    int year;
    double odometer;
};`;

const PERSON = `struct Person
{
    string name;
    int age;
    double height_m;
};`;

const BOOK = `struct Book
{
    string title;
    string author;
    int pages;
};`;

export function CarToBook() {
  const [done, setDone] = useState(false);
  return (
    <Frame title="EntityMatrixCard · 1. transfer Computer/Desk/Car -> Book">
      <EntityMatrixCard
        card={makeCard({
          id: 'em.story.book',
          stem: 'extract the struct shape, write the 4th',
          examples: [
            { label: 'Computer', text: COMPUTER },
            { label: 'Desk', text: DESK },
            { label: 'Car', text: CAR },
          ],
          prompt:
            'Write a struct Book with these fields: title (string), author (string), pages (int).',
          canonicalAnswer: BOOK,
          keyChecks: ['struct Book', 'string title;', 'string author;', 'int pages;', '};'],
          explanation:
            'follow the same shape: PascalCase name + `;` after each field + `};` at end.',
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export function ComputerCarPersonToBook() {
  const [done, setDone] = useState(false);
  return (
    <Frame title="EntityMatrixCard · 2. mixed-type examples">
      <EntityMatrixCard
        card={makeCard({
          id: 'em.story.mixed',
          stem: 'three mixed-type examples → write the 4th',
          examples: [
            { label: 'Computer', text: COMPUTER },
            { label: 'Car', text: CAR },
            { label: 'Person', text: PERSON },
          ],
          prompt:
            'Write a struct Book with title (string), author (string), pages (int).',
          canonicalAnswer: BOOK,
          keyChecks: ['struct Book', 'string title;', 'int pages;', '};'],
          explanation:
            'shape stays the same; only the field names + types change.',
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export function AllIntDesks() {
  const [done, setDone] = useState(false);
  return (
    <Frame title="EntityMatrixCard · 3. integer-heavy variant">
      <EntityMatrixCard
        card={makeCard({
          id: 'em.story.desks',
          stem: 'three int-only examples → write the 4th',
          examples: [
            { label: 'Desk', text: DESK },
            { label: 'Room', text: `struct Room\n{\n    int id;\n    int capacity;\n    int floor;\n};` },
            { label: 'Locker', text: `struct Locker\n{\n    int locker_id;\n    int row;\n    int column;\n};` },
          ],
          prompt:
            'Write a struct Shelf with shelf_id (int), aisle (int), height (int).',
          canonicalAnswer:
            'struct Shelf\n{\n    int shelf_id;\n    int aisle;\n    int height;\n};',
          keyChecks: ['struct Shelf', 'int shelf_id;', 'int aisle;', 'int height;', '};'],
          explanation: 'pure-int struct — same skeleton, different field names.',
        })}
        onComplete={setDone}
      />
      <p>complete: {String(done)}</p>
    </Frame>
  );
}

export default CarToBook;
