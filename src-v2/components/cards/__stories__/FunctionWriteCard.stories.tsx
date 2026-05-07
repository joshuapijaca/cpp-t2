/**
 * FunctionWriteCard.stories.tsx — Q3 read-array-of-structs scenarios.
 *
 * Five stories covering the full Q3 entity matrix:
 *   1. ReadComputers   — practice question entity (3 fields).
 *   2. ReadDesks       — V2.0 spec entity (3 fields, mixed types).
 *   3. ReadBooks       — variant entity (3 fields, all strings + int).
 *   4. ReadColors      — 2-field variant (smaller surface area).
 *   5. ReadStudents    — 4-field variant (largest surface area).
 *
 * Stories are stateful React components. Mount any of them in a harness
 * route to drill the card by hand. The default export mounts all five in
 * sequence so a single page can preview the entire entity matrix.
 */

import { useState } from "react";
import { FunctionWriteCard } from "../FunctionWriteCard";
import type { FunctionWriteCard as FunctionWriteCardData } from "../../../types/card-schema";

// ─────────────────────────────────────────────────────────────────────
// Card factory — keeps the story bodies short.
// ─────────────────────────────────────────────────────────────────────

function makeCard(input: {
  id: string;
  entity: string;
  prompt: string;
  signature: string;
  body: string;
  keyChecks: string[];
  forbiddenTokens: string[];
  explanation: string;
}): FunctionWriteCardData {
  const canonicalAnswer = `${input.signature}\n{\n${input.body}\n}`;
  return {
    id: input.id,
    schemaVersion: "v2",
    atomId: "A12",
    qTags: ["Q3"],
    stage: 4,
    level: "L4",
    type: "FunctionWriteCard",
    stem: input.prompt.split(".")[0] ?? input.prompt,
    source: { kind: "practice", ref: "Q3 entity matrix" },
    commonMistakeIds: [
      "CM-missing-ref-on-array",
      "CM-cout-instead-of-cin",
      "CM-loop-bound-mismatch",
    ],
    status: "NEW",
    createdBy: "STORY-FunctionWriteCard",
    reviewedBy: [],
    prompt: input.prompt,
    signatureHint: input.signature,
    canonicalAnswer,
    keyChecks: input.keyChecks,
    forbiddenTokens: input.forbiddenTokens,
    explanation: input.explanation,
    passByRefRequired: true,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Story 1: read_computers (practice entity)
// ─────────────────────────────────────────────────────────────────────

const COMPUTERS_STRUCT = `struct Computer
{
    string brand;
    int ram_gb;
    double price;
};`;

const COMPUTERS_BODY = `    for (int i = 0; i < n; i++)
    {
        cout << "Brand: ";
        cin >> list[i].brand;
        cout << "RAM (GB): ";
        cin >> list[i].ram_gb;
        cout << "Price: ";
        cin >> list[i].price;
    }`;

export function ReadComputers() {
  const card = makeCard({
    id: "STORY-fwc-read-computers",
    entity: "Computer",
    prompt:
      "Write the body of read_computers. The function reads n Computer records from cin, prompting the user for brand, RAM in GB, and price for each one, and stores them into list.",
    signature: "void read_computers(Computer &list[], int n)",
    body: COMPUTERS_BODY,
    keyChecks: [
      "for (int i = 0; i < n; i++)",
      "cin >> list[i].brand",
      "cin >> list[i].ram_gb",
      "cin >> list[i].price",
    ],
    forbiddenTokens: ["return", "while", "do"],
    explanation:
      "Q3's standard shape: a counted for-loop indexed by i from 0 to n, reading each field of list[i] with cin >>. Prompts via cout are allowed; reading via cin is mandatory.",
  });
  const [, setPassed] = useState<boolean | null>(null);
  return (
    <Frame title="1. read_computers (practice question)">
      <FunctionWriteCard
        card={card}
        onComplete={setPassed}
        structContext={COMPUTERS_STRUCT}
      />
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Story 2: read_desks (V2.0 entity)
// ─────────────────────────────────────────────────────────────────────

const DESKS_STRUCT = `struct Desk
{
    string material;
    double width;
    int drawers;
};`;

const DESKS_BODY = `    for (int i = 0; i < n; i++)
    {
        cout << "Material: ";
        cin >> list[i].material;
        cout << "Width: ";
        cin >> list[i].width;
        cout << "Drawers: ";
        cin >> list[i].drawers;
    }`;

export function ReadDesks() {
  const card = makeCard({
    id: "STORY-fwc-read-desks",
    entity: "Desk",
    prompt:
      "Write the body of read_desks. The function reads n Desk records from cin and stores them in list. Each Desk has a material (string), width (double), and number of drawers (int).",
    signature: "void read_desks(Desk &list[], int n)",
    body: DESKS_BODY,
    keyChecks: [
      "for (int i = 0; i < n; i++)",
      "cin >> list[i].material",
      "cin >> list[i].width",
      "cin >> list[i].drawers",
    ],
    forbiddenTokens: ["return", "while", "do"],
    explanation:
      "Same shape as read_computers — only the entity and field names change. That sameness is the whole point: Q3 lets you drill one template against any 3-field struct.",
  });
  const [, setPassed] = useState<boolean | null>(null);
  return (
    <Frame title="2. read_desks (V2.0 entity)">
      <FunctionWriteCard
        card={card}
        onComplete={setPassed}
        structContext={DESKS_STRUCT}
      />
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Story 3: read_books (variant)
// ─────────────────────────────────────────────────────────────────────

const BOOKS_STRUCT = `struct Book
{
    string title;
    string author;
    int year;
};`;

const BOOKS_BODY = `    for (int i = 0; i < n; i++)
    {
        cout << "Title: ";
        cin >> list[i].title;
        cout << "Author: ";
        cin >> list[i].author;
        cout << "Year: ";
        cin >> list[i].year;
    }`;

export function ReadBooks() {
  const card = makeCard({
    id: "STORY-fwc-read-books",
    entity: "Book",
    prompt:
      "Write the body of read_books. The function reads n Book records from cin (title, author, year) and stores them in list.",
    signature: "void read_books(Book &list[], int n)",
    body: BOOKS_BODY,
    keyChecks: [
      "for (int i = 0; i < n; i++)",
      "cin >> list[i].title",
      "cin >> list[i].author",
      "cin >> list[i].year",
    ],
    forbiddenTokens: ["return", "while", "do"],
    explanation:
      "Two strings followed by an int. Same template — practise the muscle memory of typing the for-loop bound and the cin-read pattern without thinking about it.",
  });
  const [, setPassed] = useState<boolean | null>(null);
  return (
    <Frame title="3. read_books (variant entity)">
      <FunctionWriteCard
        card={card}
        onComplete={setPassed}
        structContext={BOOKS_STRUCT}
      />
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Story 4: read_colors (2-field variant)
// ─────────────────────────────────────────────────────────────────────

const COLORS_STRUCT = `struct Color
{
    string name;
    int hex_code;
};`;

const COLORS_BODY = `    for (int i = 0; i < n; i++)
    {
        cout << "Name: ";
        cin >> list[i].name;
        cout << "Hex: ";
        cin >> list[i].hex_code;
    }`;

export function ReadColors() {
  const card = makeCard({
    id: "STORY-fwc-read-colors",
    entity: "Color",
    prompt:
      "Write the body of read_colors. The function reads n Color records from cin (name, hex_code) and stores them in list. This is a 2-field variant — fewer cin reads than the standard Q3 form.",
    signature: "void read_colors(Color &list[], int n)",
    body: COLORS_BODY,
    keyChecks: [
      "for (int i = 0; i < n; i++)",
      "cin >> list[i].name",
      "cin >> list[i].hex_code",
    ],
    forbiddenTokens: ["return", "while", "do"],
    explanation:
      "Two-field variant. The for-loop and the cin-read pattern do not change with field count — drop or add cin lines to match the struct.",
  });
  const [, setPassed] = useState<boolean | null>(null);
  return (
    <Frame title="4. read_colors (2-field variant)">
      <FunctionWriteCard
        card={card}
        onComplete={setPassed}
        structContext={COLORS_STRUCT}
      />
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Story 5: read_students (4-field variant)
// ─────────────────────────────────────────────────────────────────────

const STUDENTS_STRUCT = `struct Student
{
    string name;
    int student_id;
    double gpa;
    string major;
};`;

const STUDENTS_BODY = `    for (int i = 0; i < n; i++)
    {
        cout << "Name: ";
        cin >> list[i].name;
        cout << "ID: ";
        cin >> list[i].student_id;
        cout << "GPA: ";
        cin >> list[i].gpa;
        cout << "Major: ";
        cin >> list[i].major;
    }`;

export function ReadStudents() {
  const card = makeCard({
    id: "STORY-fwc-read-students",
    entity: "Student",
    prompt:
      "Write the body of read_students. The function reads n Student records from cin (name, student_id, gpa, major) and stores them in list. This is a 4-field variant — one extra cin compared to the standard 3-field form.",
    signature: "void read_students(Student &list[], int n)",
    body: STUDENTS_BODY,
    keyChecks: [
      "for (int i = 0; i < n; i++)",
      "cin >> list[i].name",
      "cin >> list[i].student_id",
      "cin >> list[i].gpa",
      "cin >> list[i].major",
    ],
    forbiddenTokens: ["return", "while", "do"],
    explanation:
      "Four-field variant. Same shape, one more cin line. If the test surprises you with 4 or 5 fields, the only thing that changes is the count of cin reads — the for-loop bound stays i < n.",
  });
  const [, setPassed] = useState<boolean | null>(null);
  return (
    <Frame title="5. read_students (4-field variant)">
      <FunctionWriteCard
        card={card}
        onComplete={setPassed}
        structContext={STUDENTS_STRUCT}
      />
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Combined story page
// ─────────────────────────────────────────────────────────────────────

export default function FunctionWriteCardStories() {
  return (
    <div
      style={{
        display: "grid",
        gap: 32,
        padding: 24,
        background: "var(--bg-0, #0d1117)",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          color: "var(--text-0, #e6edf3)",
          fontFamily: "system-ui",
          margin: 0,
        }}
      >
        FunctionWriteCard — Q3 entity matrix
      </h1>
      <ReadComputers />
      <ReadDesks />
      <ReadBooks />
      <ReadColors />
      <ReadStudents />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Frame wrapper
// ─────────────────────────────────────────────────────────────────────

function Frame({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2
        style={{
          color: "var(--text-1, #8b949e)",
          fontFamily: "system-ui",
          fontSize: 14,
          fontWeight: 500,
          margin: "0 0 8px",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
