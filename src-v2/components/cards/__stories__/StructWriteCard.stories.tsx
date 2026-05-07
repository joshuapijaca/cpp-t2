/**
 * StructWriteCard.stories.tsx
 *
 * Five required visual + interaction stories. Plain-React stories (no
 * Storybook config) — matches the in-repo convention from
 * primitives/__stories__/CodeEditor.stories.tsx.
 *
 *   1. computer_data    — practice-test entity (id, description, location)
 *   2. desk_data        — V2.0 real-test entity (room_id, d_id, n_screens)
 *   3. book_data        — common variant (title, author, pages)
 *   4. shipment_data    — edge case 4-field entity
 *   5. attendance_data  — edge case 2-field entity (with bool)
 *
 * Each story constructs a fully-typed StructWriteCard payload (no Zod
 * parse needed — `as const` plus `satisfies` keeps TypeScript honest).
 */

import { useState } from 'react';
import { StructWriteCard } from '../StructWriteCard';
import type { StructWriteCard as StructWriteCardData } from '../../../types/card-schema';

// ─────────────────────────────────────────────────────────────────────
// Shared frame (same minimal wrapper as CodeEditor.stories)
// ─────────────────────────────────────────────────────────────────────

function Frame({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 24,
        background: 'var(--bg-0, #0d1117)',
        minHeight: '100vh',
        color: 'var(--text-0, #e6edf3)',
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      }}
    >
      <h1 style={{ margin: 0, fontSize: 16, color: 'var(--text-2, #6e7681)' }}>
        {title}
      </h1>
      {children}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Card-payload helpers — common fields shared across all 5 stories
// ─────────────────────────────────────────────────────────────────────

const COMMON: Pick<
  StructWriteCardData,
  'schemaVersion' | 'qTags' | 'stage' | 'level' | 'type' | 'createdBy' | 'reviewedBy' | 'commonMistakeIds' | 'status'
> = {
  schemaVersion: 'v2',
  qTags: ['Q2'],
  stage: 1,
  level: 'L2',
  type: 'StructWriteCard',
  createdBy: 'STORIES-StructWrite',
  reviewedBy: [],
  commonMistakeIds: [],
  status: 'NEW',
};

// ─────────────────────────────────────────────────────────────────────
// Story 1: computer_data — practice test entity
// ─────────────────────────────────────────────────────────────────────

const story1Card: StructWriteCardData = {
  ...COMMON,
  id: 'story-struct-write-01-computer',
  atomId: 'F-15',
  stem: 'Define a struct to track a computer asset.',
  prompt:
    'Write a struct named computer_data that stores three fields: an integer id, a string description, and a string location. Use C++ string (not char*).',
  canonicalAnswer: `struct computer_data
{
    int id;
    string description;
    string location;
};`,
  keyChecks: [
    'struct computer_data',
    'int id;',
    'string description;',
    'string location;',
    '};',
  ],
  forbiddenTokens: ['class', 'char*', 'public:', 'private:', 'Computer_data'],
  requiredFields: ['int id', 'string description', 'string location'],
  explanation:
    'Each field gets its own line with type, name, and trailing semicolon. The closing brace of a struct definition MUST be followed by `;` — that ends the declaration statement.',
  source: { kind: 'practice', ref: 'practice/2024-Q2.pdf' },
};

export function ComputerData() {
  const [last, setLast] = useState<boolean | null>(null);
  return (
    <Frame title="1. computer_data — practice test entity">
      <p style={{ margin: 0, color: 'var(--text-2, #6e7681)' }}>
        Last result: {last === null ? '(none)' : last ? 'PASS' : 'FAIL'}
      </p>
      <StructWriteCard card={story1Card} onComplete={setLast} showSkeleton />
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Story 2: desk_data — V2.0 real-test entity
// ─────────────────────────────────────────────────────────────────────

const story2Card: StructWriteCardData = {
  ...COMMON,
  id: 'story-struct-write-02-desk',
  atomId: 'F-15',
  stem: 'Define a struct for a desk in a workspace booking app.',
  prompt:
    'Write a struct named desk_data with three fields: an integer room_id, an integer d_id, and an integer number_of_screens.',
  canonicalAnswer: `struct desk_data
{
    int room_id;
    int d_id;
    int number_of_screens;
};`,
  keyChecks: [
    'struct desk_data',
    'int room_id;',
    'int d_id;',
    'int number_of_screens;',
    '};',
  ],
  forbiddenTokens: ['class', 'string', 'double', 'Desk_data'],
  requiredFields: ['int room_id', 'int d_id', 'int number_of_screens'],
  explanation:
    'All three fields are whole numbers — use `int`, not `string` or `double`. The struct ends with `};` — the semicolon is part of the syntax for the declaration, not the body.',
  source: { kind: 'v2', ref: 'docs/16_test2_specific_redesign_v2.md#real-test-2-0' },
};

export function DeskData() {
  const [last, setLast] = useState<boolean | null>(null);
  return (
    <Frame title="2. desk_data — V2.0 real test entity (no skeleton)">
      <p style={{ margin: 0, color: 'var(--text-2, #6e7681)' }}>
        Last result: {last === null ? '(none)' : last ? 'PASS' : 'FAIL'}
      </p>
      <StructWriteCard card={story2Card} onComplete={setLast} />
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Story 3: book_data — common variant
// ─────────────────────────────────────────────────────────────────────

const story3Card: StructWriteCardData = {
  ...COMMON,
  id: 'story-struct-write-03-book',
  atomId: 'F-15',
  stem: 'Define a struct for a book in a library catalog.',
  prompt:
    'Write a struct named book_data with three fields: a string title, a string author, and an integer pages.',
  canonicalAnswer: `struct book_data
{
    string title;
    string author;
    int pages;
};`,
  keyChecks: [
    'struct book_data',
    'string title;',
    'string author;',
    'int pages;',
    '};',
  ],
  forbiddenTokens: ['class', 'char*', 'double pages', 'Book_data'],
  requiredFields: ['string title', 'string author', 'int pages'],
  explanation:
    'Mixed types: title and author are text → `string`. pages is a whole number → `int` (not `double`). Field names are lowercase + underscores per the SIT102 style.',
  source: { kind: 'pfg', ref: 'pfg-content/part-2/structs/book-example.md' },
};

export function BookData() {
  const [last, setLast] = useState<boolean | null>(null);
  return (
    <Frame title="3. book_data — common variant (mixed types)">
      <p style={{ margin: 0, color: 'var(--text-2, #6e7681)' }}>
        Last result: {last === null ? '(none)' : last ? 'PASS' : 'FAIL'}
      </p>
      <StructWriteCard card={story3Card} onComplete={setLast} />
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Story 4: shipment_data — edge case 4-field entity
// ─────────────────────────────────────────────────────────────────────

const story4Card: StructWriteCardData = {
  ...COMMON,
  id: 'story-struct-write-04-shipment',
  atomId: 'F-15',
  stem: 'Define a struct for a shipment record.',
  prompt:
    'Write a struct named shipment_data with FOUR fields: a string tracking_id, a double weight_kg, an integer item_count, and a string destination_city.',
  canonicalAnswer: `struct shipment_data
{
    string tracking_id;
    double weight_kg;
    int item_count;
    string destination_city;
};`,
  keyChecks: [
    'struct shipment_data',
    'string tracking_id;',
    'double weight_kg;',
    'int item_count;',
    'string destination_city;',
    '};',
  ],
  forbiddenTokens: ['class', 'float weight_kg', 'Shipment_data'],
  requiredFields: [
    'string tracking_id',
    'double weight_kg',
    'int item_count',
    'string destination_city',
  ],
  explanation:
    '4-field structs follow the same rules as 3-field — one declaration per line, each ending in `;`, all wrapped in `{ … };`. weight_kg uses `double` because it has a decimal component.',
  source: { kind: 'v2', ref: 'docs/16_test2_specific_redesign_v2.md#edge-cases' },
};

export function ShipmentData() {
  const [last, setLast] = useState<boolean | null>(null);
  return (
    <Frame title="4. shipment_data — edge case (4 fields)">
      <p style={{ margin: 0, color: 'var(--text-2, #6e7681)' }}>
        Last result: {last === null ? '(none)' : last ? 'PASS' : 'FAIL'}
      </p>
      <StructWriteCard card={story4Card} onComplete={setLast} />
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Story 5: attendance_data — edge case 2-field entity (with bool)
// ─────────────────────────────────────────────────────────────────────

const story5Card: StructWriteCardData = {
  ...COMMON,
  id: 'story-struct-write-05-attendance',
  atomId: 'F-15',
  stem: 'Define a struct to record a single attendance check.',
  prompt:
    'Write a struct named attendance_data with TWO fields: a string student_name and a bool is_present.',
  canonicalAnswer: `struct attendance_data
{
    string student_name;
    bool is_present;
};`,
  keyChecks: [
    'struct attendance_data',
    'string student_name;',
    'bool is_present;',
    '};',
  ],
  forbiddenTokens: ['class', 'int is_present', 'Attendance_data', 'Boolean'],
  requiredFields: ['string student_name', 'bool is_present'],
  explanation:
    'A 2-field struct is just as legal as a 3-field one — no minimum count. `bool` is the C++ keyword (lowercase, not `Boolean`). Use `bool` for true/false flags, never `int 0/1` in C++.',
  source: { kind: 'pfg', ref: 'pfg-content/part-2/structs/bool-example.md' },
};

export function AttendanceData() {
  const [last, setLast] = useState<boolean | null>(null);
  return (
    <Frame title="5. attendance_data — edge case (2 fields, bool)">
      <p style={{ margin: 0, color: 'var(--text-2, #6e7681)' }}>
        Last result: {last === null ? '(none)' : last ? 'PASS' : 'FAIL'}
      </p>
      <StructWriteCard card={story5Card} onComplete={setLast} />
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Default export — show all 5 in one scrollable page (mirrors CodeEditor)
// ─────────────────────────────────────────────────────────────────────

export default function AllStructWriteStories() {
  return (
    <>
      <ComputerData />
      <DeskData />
      <BookData />
      <ShipmentData />
      <AttendanceData />
    </>
  );
}
