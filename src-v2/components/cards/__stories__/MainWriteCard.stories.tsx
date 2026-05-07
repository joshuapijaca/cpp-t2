/**
 * MainWriteCard.stories.tsx
 *
 * Visual + interaction stories for MainWriteCard.
 *
 * Five required stories:
 *   1. v2.0_desk        — V2.0 desk_data main (MAX = 700)
 *   2. practice_computer — practice computer_data main (MAX = 100)
 *   3. book_print_fn    — book_data main with separate print_books fn (variant)
 *   4. inline_print     — inline-print-loop variant (no separate fn call)
 *   5. cold_start       — no scaffold, write from a blank editor
 *
 * Plain React stories (no Storybook config assumed). The file exports each
 * story as a named React component, plus a default export that mounts all
 * five in sequence — matches CodeEditor.stories.tsx convention.
 */

import { useState } from "react";
import { MainWriteCard } from "../MainWriteCard";
import type {
  MainWriteCardExtras,
  MainSectionSpec,
} from "../MainWriteCard";
import type { MainWriteCard as MainWriteCardData } from "../../../types/card-schema";

// ─────────────────────────────────────────────────────────────────────
// Reusable section specs: the 3-blank "ask / read / print" template that
// every Q4 in practice + V2.0 + seminar follows.
// ─────────────────────────────────────────────────────────────────────

function defaultSections(opts: {
  /** count variable name, e.g. "desk_num", "computer_num" */
  countVar: string;
  /** read fn name, e.g. "read_desk_list", "read_computers" */
  readFn: string;
  /** array name, e.g. "desks", "computers" */
  arrName: string;
  /** dot-access field for print loop, e.g. "id", "make", "title" */
  printField: string;
}): MainSectionSpec[] {
  return [
    {
      id: "count-prompt",
      label: "Section 1: Ask for the count",
      mustInclude: ["cout", "cin >>", opts.countVar],
    },
    {
      id: "read-call",
      label: "Section 2: Read in the list",
      mustInclude: [`${opts.readFn}(`, opts.arrName, opts.countVar],
    },
    {
      id: "print-loop",
      label: "Section 3: Print the list",
      mustInclude: ["for", "<", "endl", `.${opts.printField}`],
      mustNotInclude: ["while"],
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────
// Common stem — kept identical so stories aren't padded with prose.
// ─────────────────────────────────────────────────────────────────────

const STEM_BASE =
  "Write a complete int main() that asks the user how many items there are, " +
  "reads them with the provided read function, then prints the list using a for-loop.";

// ─────────────────────────────────────────────────────────────────────
// Story 1: V2.0 desk_data main (MAX = 700)
// ─────────────────────────────────────────────────────────────────────

const card1: MainWriteCardData = {
  id: "mwc-story-1-desk-v20",
  schemaVersion: "v2",
  atomId: "F-22a",
  qTags: ["Q4"],
  stage: 6,
  level: "L5",
  type: "MainWriteCard",
  stem: "V2.0 — write int main() for desk_data.",
  prompt: STEM_BASE.replace("items", "desks"),
  canonicalAnswer: `int main() {
    const int MAX = 700;
    desk_data desks[MAX];
    int desk_num;

    cout << "How many desks? ";
    cin >> desk_num;

    read_desk_list(desks, desk_num);

    for (int i = 0; i < desk_num; i++) {
        cout << desks[i].id << endl;
    }

    return 0;
}`,
  keyChecks: [
    "const int MAX = 700",
    "desk_data desks[MAX]",
    "int desk_num",
    "cin >> desk_num",
    "read_desk_list(desks, desk_num)",
    "for",
    "desks[i].id",
    "endl",
    "return 0",
  ],
  forbiddenTokens: ["while"],
  explanation:
    "V2.0 Q4 pattern: const int MAX, struct array, count + cin, call the read fn, " +
    "print loop with dot-access on the struct field, return 0. The MAX = 700 number " +
    "is V2.0-specific; copy it verbatim from the spec.",
  expectedTerminal: ["How many desks?"],
  source: { kind: "v2", ref: "V2.0 spec — Q4 desk_data" },
  commonMistakeIds: [],
  status: "NEW",
  createdBy: "MainWriteCard.stories",
  reviewedBy: [],
};

const extras1: MainWriteCardExtras = {
  contextStruct: `struct desk_data {
    int id;
    string occupant;
    bool is_standing;
};`,
  contextReadFn: `void read_desk_list(desk_data desks[], int count);`,
  scaffold: `int main() {
    const int MAX = 700;
    desk_data desks[MAX];
    int desk_num;

    // Ask for number of desks
    _____

    // Read in desk list
    _____

    // Print list of desks
    _____

    return 0;
}`,
  sections: defaultSections({
    countVar: "desk_num",
    readFn: "read_desk_list",
    arrName: "desks",
    printField: "id",
  }),
  structuralRequired: ["const int MAX = 700", "desk_data desks[MAX]", "return 0"],
};

export function V20DeskMain() {
  const [done, setDone] = useState<boolean | null>(null);
  return (
    <Frame title="1. V2.0 desk_data main (MAX = 700)" outcome={done}>
      <MainWriteCard card={card1} extras={extras1} onComplete={setDone} />
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Story 2: practice computer_data main (MAX = 100)
// ─────────────────────────────────────────────────────────────────────

const card2: MainWriteCardData = {
  id: "mwc-story-2-computer-practice",
  schemaVersion: "v2",
  atomId: "F-22a",
  qTags: ["Q4"],
  stage: 6,
  level: "L5",
  type: "MainWriteCard",
  stem: "Practice — write int main() for computer_data.",
  prompt: STEM_BASE.replace("items", "computers"),
  canonicalAnswer: `int main() {
    const int MAX = 100;
    computer_data computers[MAX];
    int computer_num;

    cout << "How many computers? ";
    cin >> computer_num;

    read_computers(computers, computer_num);

    for (int i = 0; i < computer_num; i++) {
        cout << computers[i].make << endl;
    }

    return 0;
}`,
  keyChecks: [
    "const int MAX = 100",
    "computer_data computers[MAX]",
    "int computer_num",
    "cin >> computer_num",
    "read_computers(computers, computer_num)",
    "for",
    "computers[i].make",
    "endl",
    "return 0",
  ],
  forbiddenTokens: ["while"],
  explanation:
    "Practice Q4 pattern: identical shape to V2.0, only the entity (computer_data) " +
    "and field (.make) change. Note MAX = 100 here; check your spec carefully.",
  expectedTerminal: ["How many computers?"],
  source: { kind: "practice", ref: "SIT102 practice Q4 computer_data" },
  commonMistakeIds: [],
  status: "NEW",
  createdBy: "MainWriteCard.stories",
  reviewedBy: [],
};

const extras2: MainWriteCardExtras = {
  contextStruct: `struct computer_data {
    string make;
    string model;
    int year;
};`,
  contextReadFn: `void read_computers(computer_data computers[], int count);`,
  scaffold: `int main() {
    const int MAX = 100;
    computer_data computers[MAX];
    int computer_num;

    // Ask for number of computers
    _____

    // Read in computer list
    _____

    // Print list of computers
    _____

    return 0;
}`,
  sections: defaultSections({
    countVar: "computer_num",
    readFn: "read_computers",
    arrName: "computers",
    printField: "make",
  }),
  structuralRequired: [
    "const int MAX = 100",
    "computer_data computers[MAX]",
    "return 0",
  ],
};

export function PracticeComputerMain() {
  const [done, setDone] = useState<boolean | null>(null);
  return (
    <Frame title="2. Practice computer_data main (MAX = 100)" outcome={done}>
      <MainWriteCard card={card2} extras={extras2} onComplete={setDone} />
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Story 3: book_data main with print fn (variant — calls print_books(...))
// ─────────────────────────────────────────────────────────────────────

const card3: MainWriteCardData = {
  id: "mwc-story-3-book-printfn",
  schemaVersion: "v2",
  atomId: "F-22b",
  qTags: ["Q4"],
  stage: 6,
  level: "L5",
  type: "MainWriteCard",
  stem: "book_data — main with separate print_books fn.",
  prompt:
    STEM_BASE.replace("items", "books").replace(
      "prints the list using a for-loop",
      "calls a separate print_books(...) function to print the list"
    ),
  canonicalAnswer: `int main() {
    const int MAX = 50;
    book_data books[MAX];
    int book_num;

    cout << "How many books? ";
    cin >> book_num;

    read_books(books, book_num);
    print_books(books, book_num);

    return 0;
}`,
  keyChecks: [
    "const int MAX = 50",
    "book_data books[MAX]",
    "int book_num",
    "cin >> book_num",
    "read_books(books, book_num)",
    "print_books(books, book_num)",
    "return 0",
  ],
  forbiddenTokens: ["while"],
  explanation:
    "Variant: instead of an inline for-loop, a separate print_books(books, count) is " +
    "provided. The print loop is encapsulated, so main() only calls it. Keep the " +
    "argument order (array first, count second) — a classic source of lost marks.",
  expectedTerminal: ["How many books?"],
  source: { kind: "seminar", ref: "Seminar Test 2 walkthrough — variant fn pattern" },
  commonMistakeIds: [],
  status: "NEW",
  createdBy: "MainWriteCard.stories",
  reviewedBy: [],
};

const sections3: MainSectionSpec[] = [
  {
    id: "count-prompt",
    label: "Section 1: Ask for the count",
    mustInclude: ["cout", "cin >>", "book_num"],
  },
  {
    id: "read-call",
    label: "Section 2: Read in the list",
    mustInclude: ["read_books(", "books", "book_num"],
  },
  {
    id: "print-fn-call",
    label: "Section 3: Call print_books(...)",
    mustInclude: ["print_books(", "books", "book_num"],
    mustNotInclude: ["for", "while"],
  },
];

const extras3: MainWriteCardExtras = {
  contextStruct: `struct book_data {
    string title;
    string author;
    int year;
};`,
  contextReadFn: `void read_books(book_data books[], int count);
void print_books(const book_data books[], int count);`,
  scaffold: `int main() {
    const int MAX = 50;
    book_data books[MAX];
    int book_num;

    // Ask for number of books
    _____

    // Read in book list
    _____

    // Call print_books to print the list
    _____

    return 0;
}`,
  sections: sections3,
  structuralRequired: ["const int MAX = 50", "book_data books[MAX]", "return 0"],
};

export function BookDataPrintFn() {
  const [done, setDone] = useState<boolean | null>(null);
  return (
    <Frame title="3. book_data main with print_books fn (variant)" outcome={done}>
      <MainWriteCard card={card3} extras={extras3} onComplete={setDone} />
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Story 4: inline-print-loop variant
//   Same as Story 1 (desk_data) but explicit that the print MUST be inline,
//   not a separate fn — common rubric trap (some Q4s forbid a print fn).
// ─────────────────────────────────────────────────────────────────────

const card4: MainWriteCardData = {
  id: "mwc-story-4-inline-print",
  schemaVersion: "v2",
  atomId: "F-22a",
  qTags: ["Q4"],
  stage: 6,
  level: "L5",
  type: "MainWriteCard",
  stem: "Inline-print-loop variant — must NOT call a print fn.",
  prompt:
    STEM_BASE.replace("items", "desks") +
    " IMPORTANT: do NOT create or call a separate print function — " +
    "the for-loop must live directly inside main().",
  canonicalAnswer: card1.canonicalAnswer, // identical body
  keyChecks: card1.keyChecks,
  forbiddenTokens: ["while", "print_desks", "print_desk_list"],
  explanation:
    "Some Q4 wordings explicitly require the print loop INSIDE main(). " +
    "Calling a print fn here costs marks. Use a for-loop, dot-access, endl.",
  expectedTerminal: ["How many desks?"],
  source: { kind: "practice", ref: "Strict-rubric Q4 variant" },
  commonMistakeIds: [],
  status: "NEW",
  createdBy: "MainWriteCard.stories",
  reviewedBy: [],
};

const sections4: MainSectionSpec[] = [
  {
    id: "count-prompt",
    label: "Section 1: Ask for the count",
    mustInclude: ["cout", "cin >>", "desk_num"],
  },
  {
    id: "read-call",
    label: "Section 2: Read in the list",
    mustInclude: ["read_desk_list(", "desks", "desk_num"],
  },
  {
    id: "inline-print",
    label: "Section 3: INLINE print loop (no print fn allowed)",
    mustInclude: ["for", "<", "endl", "desks[i]."],
    mustNotInclude: ["print_desks", "print_desk_list", "while"],
  },
];

const extras4: MainWriteCardExtras = {
  contextStruct: extras1.contextStruct ?? "",
  contextReadFn: extras1.contextReadFn ?? "",
  scaffold: extras1.scaffold ?? "",
  sections: sections4,
  structuralRequired: extras1.structuralRequired ?? [],
};

export function InlinePrintLoop() {
  const [done, setDone] = useState<boolean | null>(null);
  return (
    <Frame
      title="4. Inline-print-loop variant (no print fn allowed)"
      outcome={done}
    >
      <MainWriteCard card={card4} extras={extras4} onComplete={setDone} />
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Story 5: cold-start variant — no scaffold, blank editor
// ─────────────────────────────────────────────────────────────────────

const card5: MainWriteCardData = {
  id: "mwc-story-5-cold-start",
  schemaVersion: "v2",
  atomId: "F-22a",
  qTags: ["Q4"],
  stage: 6,
  level: "L5",
  type: "MainWriteCard",
  stem: "Cold-start — write the entire int main() from a blank editor.",
  prompt:
    "Write a complete int main() from scratch (no scaffold) for desk_data. " +
    "Declare const int MAX, the array, the count variable, prompt for count, " +
    "call read_desk_list, print every desk's id with a for-loop, return 0.",
  canonicalAnswer: card1.canonicalAnswer,
  keyChecks: card1.keyChecks,
  forbiddenTokens: ["while"],
  explanation:
    "Cold-start mirrors exam-day reality: the page is blank, and you must " +
    "produce the whole skeleton from memory. Practice this once you can pass " +
    "the scaffolded version reliably.",
  expectedTerminal: ["How many desks?"],
  source: { kind: "v2", ref: "V2.0 cold-start reproduction" },
  commonMistakeIds: [],
  status: "NEW",
  createdBy: "MainWriteCard.stories",
  reviewedBy: [],
};

const extras5: MainWriteCardExtras = {
  contextStruct: extras1.contextStruct ?? "",
  contextReadFn: extras1.contextReadFn ?? "",
  // scaffold omitted -> editor starts empty
  sections: defaultSections({
    countVar: "desk_num",
    readFn: "read_desk_list",
    arrName: "desks",
    printField: "id",
  }),
  structuralRequired: ["const int MAX", "desk_data desks", "return 0"],
};

export function ColdStart() {
  const [done, setDone] = useState<boolean | null>(null);
  return (
    <Frame title="5. Cold-start (no scaffold, blank editor)" outcome={done}>
      <MainWriteCard card={card5} extras={extras5} onComplete={setDone} />
    </Frame>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Combined demo page that mounts every story in sequence.
// ─────────────────────────────────────────────────────────────────────

export default function MainWriteCardStories() {
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
        MainWriteCard — visual stories
      </h1>
      <V20DeskMain />
      <PracticeComputerMain />
      <BookDataPrintFn />
      <InlinePrintLoop />
      <ColdStart />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Tiny shared frame wrapper. Keeps every story visually consistent.
// ─────────────────────────────────────────────────────────────────────

function Frame({
  title,
  outcome,
  children,
}: {
  title: string;
  outcome: boolean | null;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <h2
          style={{
            color: "var(--text-1, #8b949e)",
            fontFamily: "system-ui",
            fontSize: 14,
            fontWeight: 500,
            margin: 0,
          }}
        >
          {title}
        </h2>
        {outcome !== null && (
          <span
            aria-label={`Story result: ${outcome ? "all sections passed" : "some sections failed"}`}
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 12,
              color: outcome
                ? "var(--state-ok, #3fb950)"
                : "var(--state-err, #f85149)",
            }}
          >
            {outcome ? "[PASS]" : "[FAIL]"}
          </span>
        )}
      </header>
      <div
        style={{
          border: "1px solid var(--border-1, #30363d)",
          borderRadius: 6,
          background: "var(--bg-1, #161b22)",
          padding: 0,
        }}
      >
        {children}
      </div>
    </section>
  );
}
