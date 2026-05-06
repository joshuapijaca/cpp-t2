# 11 — Build Outline (Tech Stack + Architecture)

Concrete app spec. Subsumes [04](04_new_app_design.md) §"Tech stack" and `07` §"App Architecture" with full toolchain detail.

---

## Stack (Locked)

| Layer | Choice | Version | Rationale |
|-------|--------|---------|-----------|
| Runtime | Node | 20 LTS+ | Stable, ESM-first |
| Package mgr | npm | bundled | Zero extra install; user familiar |
| Build tool | Vite | 5.x | Fastest dev HMR, zero config, ESM native |
| UI framework | React | 19 | Ergonomic, vast ecosystem, small static bundle |
| Language | TypeScript | 5.x | Type-checks 250+ atom IDs cross-referenced |
| Styling | Tailwind | v4 | Atomic CSS, dark mode trivial, JIT |
| Semantic CSS | CSS Modules | bundled | `.variable-history`, `.step-box--current` (per [06](06_audit_it_elo_t1_apk.md)) |
| State | React `useState` | bundled | Session-only; no Redux/Zustand needed |
| Storage | None | — | Session-only per MISSION.md |
| YAML parsing | `js-yaml` | 4.x | Build-time outline reader |
| AI SDK (build-time only) | `@anthropic-ai/sdk` | latest | Outline → cards expansion. Devdep only. |
| C++ verifier | g++ | system | Compile-check expected answers |
| Testing | Vitest | 1.x | Vite-native, fast |
| Lint | ESLint + Prettier | 9.x / 3.x | Standard |
| Type check | tsc --noEmit | bundled | Pre-build gate |

### Rejected Alternatives

| Stack | Why rejected |
|-------|-------------|
| SolidJS | Smaller ecosystem; user not familiar |
| Svelte | Compile-step friction; user not familiar |
| Vanilla JS | Hand-rolling component lifecycle wastes time |
| Next.js | SSR irrelevant for offline static site |
| Remix | Server-centric; we have no server |
| Redux/Zustand | Session-only state too simple |
| Backend (Express/Fastify) | No backend per MISSION.md |
| IndexedDB / localStorage | No save state per MISSION.md |
| Fetch / Cerebras / Claude API at runtime | Banned per ANTIPATTERNS #4 |

---

## File Structure

```
cpp-t2/                              ← display name: C++T2
├── CLAUDE.md                       ← project guide
├── MISSION.md                      ← non-negotiables
├── ANTIPATTERNS.md                 ← banned shortcuts
├── CHANGELOG.md                    ← decision log
├── CONTRIBUTING.md                 ← update protocol
├── package.json                    ← deps + scripts
├── vite.config.ts                  ← static-site config
├── tsconfig.json                   ← strict mode
├── tailwind.config.ts              ← dark mode default + tokens
├── eslint.config.js
├── index.html                      ← single entry
├── docs/                           ← canonical reference (08-12)
├── extraction/                     ← PFG + Test 2 raw source
├── outlines/                       ← per-atom YAML (locked)
├── build/
│   ├── generate-cards.ts           ← outline → AI → JSON
│   ├── compile-check.ts            ← g++ on expected answers
│   ├── lint-cards.ts               ← Miller's law + token check
│   └── order-atoms.ts              ← topo sort per [10]
├── data/
│   ├── cards.json                  ← build output, ~2,000 cards
│   └── ordered_ids.json            ← build output, prereq order
├── src/
│   ├── main.tsx                    ← React entry
│   ├── App.tsx                     ← mounts Sequence
│   ├── types/
│   │   └── card.ts                 ← discriminated union (4 types)
│   ├── components/
│   │   ├── MemorizeCard.tsx
│   │   ├── MCQCard.tsx
│   │   ├── TraceCard.tsx
│   │   ├── WriteCard.tsx
│   │   ├── ProgressBar.tsx
│   │   └── TeachMe.tsx
│   ├── pages/
│   │   └── Sequence.tsx            ← single linear flow
│   ├── lib/
│   │   ├── grading.ts              ← char-match logic
│   │   └── keys.ts                 ← keyboard handlers
│   └── styles/
│       ├── globals.css             ← Tailwind base + tokens
│       └── semantic.css            ← .variable-history etc.
└── dist/                           ← Vite output, deployable static
```

---

## Component Architecture

```
App.tsx
  └─ Sequence.tsx
      ├─ ProgressBar (atom N of 177)
      └─ <CardComponent>
          ├─ MemorizeCard      ← 49% of cards
          ├─ MCQCard           ← 11%
          ├─ TraceCard         ← 7%
          └─ WriteCard         ← 33%
          (one of, by card.type)
```

### Discriminated Union (Card type)

```typescript
// src/types/card.ts

export type Card =
  | MemorizeCard
  | MCQCard
  | TraceCard
  | WriteCard;

export interface MemorizeCard {
  type: 'memorize';
  atomId: string;
  fact: string;
  flashSeconds: number;
  mode: 'race' | 'recall';
  keyChecks: string[];
  explanation: string;
}

export interface MCQCard {
  type: 'mcq';
  atomId: string;
  stem: string;
  correct: string;
  distractors: [string, string, string];
  explanation: string;
}

export interface TraceCard {
  type: 'trace';
  atomId: string;
  code: string;
  variables: string[];
  expectedSteps: Step[];
  userInputs: string[];
  inputLabels: string[];
  terminalOutput: string[];
  q4StopCondition?: string;
  inputMode: 'per-step' | 'final-only';
  teachMe: string;
}

export interface Step {
  line: number;
  variable: string;
  value: string;
  output?: string | null;
  condition?: string | null;
}

export interface WriteCard {
  type: 'write';
  atomId: string;
  level: 1 | 2 | 3;
  spec: string;
  template?: string;
  expectedAnswer: string;
  keyChecks: string[];
  forbidden?: string[];
  explanation: string;
}
```

Sequence dispatches:

```typescript
function CardRenderer({ card }: { card: Card }) {
  switch (card.type) {
    case 'memorize': return <MemorizeCard card={card} />;
    case 'mcq':      return <MCQCard card={card} />;
    case 'trace':    return <TraceCard card={card} />;
    case 'write':    return <WriteCard card={card} />;
  }
}
```

---

## State Model (Session-Only)

```typescript
// Sequence.tsx
const [index, setIndex] = useState(0);                // 0 ... cards.length-1
const [retried, setRetried] = useState(false);        // retry-once tracker per card
const [graded, setGraded] = useState<null | 'pass' | 'fail'>(null);
const [showExplanation, setShowExplanation] = useState(false);

// On submit:
//   if pass → setGraded('pass'); auto-advance after 600ms
//   if fail && !retried → setRetried(true); show explanation; allow retry
//   if fail && retried → show full answer; advance after user click
```

**No localStorage. No URL persistence. No SRS.** Refresh = restart.

---

## Build Pipeline

### Scripts (`package.json`)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "npm run gen && npm run check && tsc --noEmit && vite build",
    "preview": "vite preview",
    "gen": "tsx build/generate-cards.ts",
    "order": "tsx build/order-atoms.ts",
    "check": "tsx build/compile-check.ts && tsx build/lint-cards.ts",
    "test": "vitest",
    "lint": "eslint . && prettier --check .",
    "format": "prettier --write ."
  }
}
```

### Pipeline Sequence

```
outlines/**/*.yml
   ↓ build/generate-cards.ts
   ↓ (Anthropic Opus 4.7 build-time, prompt-cached)
   ↓
data/cards.json (~2,000 entries)
   ↓ build/compile-check.ts (g++ on expected C++)
   ↓ build/lint-cards.ts (≤7 words, no pointer tokens, etc.)
   ↓ build/order-atoms.ts (topo sort + priority)
   ↓
data/ordered_ids.json
   ↓ tsc --noEmit (type-check src/)
   ↓ vite build
   ↓
dist/ (deployable static site, ZERO runtime API calls)
```

### Reproducibility

- Outlines locked → same input
- Anthropic prompt cache → same output for same input
- Variant dedup by content hash → no spurious regens
- Build artifacts checked into version control? **No** — regenerate from outlines instead. `data/cards.json` in `.gitignore`. Outlines are the truth.

---

## Card Generator (Build-Time AI)

```typescript
// build/generate-cards.ts

import Anthropic from '@anthropic-ai/sdk';
import yaml from 'js-yaml';
import fs from 'fs';
import { glob } from 'glob';

const client = new Anthropic();
const MODEL = 'claude-opus-4-7';

async function generateForAtom(outline: Outline): Promise<Card[]> {
  const cards: Card[] = [];

  // Memorize: 5 variants
  cards.push(...await aiBatch({
    system: MEMORIZE_SYSTEM_PROMPT,
    outline,
    n: 5,
    type: 'memorize',
  }));

  // MCQ: 2 variants (only Tier 0-2 + Level 9)
  if (outline.level <= 2 || outline.level === 9) {
    cards.push(...await aiBatch({ ...mcqArgs(outline), n: 2 }));
  }

  // Trace: 6 (only Level 13)
  if (outline.level === 13) {
    cards.push(...await aiBatch({ ...traceArgs(outline), n: 6 }));
  }

  // Write L1/L2/L3 (Levels 8+)
  if (outline.level >= 8) {
    cards.push(...await aiBatch({ ...writeArgs(outline, 1), n: 3 }));
    cards.push(...await aiBatch({ ...writeArgs(outline, 2), n: 3 }));
    cards.push(...await aiBatch({ ...writeArgs(outline, 3), n: 2 }));
  }

  return cards;
}

async function main() {
  const outlines = (await glob('outlines/**/*.yml'))
    .map(f => yaml.load(fs.readFileSync(f, 'utf8')) as Outline)
    .filter(o => o.status === 'locked');

  const allCards: Card[] = [];
  for (const outline of outlines) {
    const cards = await generateForAtom(outline);
    allCards.push(...cards);
  }

  fs.writeFileSync('data/cards.json', JSON.stringify(allCards, null, 2));
}
```

**Anthropic SDK with prompt cache**: each outline becomes a stable cache prefix. Re-runs are cheap unless outline changes.

---

## Lint Pipeline

```typescript
// build/lint-cards.ts

const checks = [
  millerLawCheck,        // memorize ≤7 words
  forbiddenTokenCheck,   // no nullptr, ->, *, etc. unless atom permits
  q1q4CoverageCheck,     // every atom marked C for some Q has ≥1 sim card
  cardTypeRatioCheck,    // memorize 49% / mcq 11% / trace 7% / write 33% ± 5%
  dedupHashCheck,        // no duplicate cards by content hash
  atomCoverageCheck,     // every locked outline produces cards
];
```

```typescript
// build/compile-check.ts

import { exec } from 'child_process';

async function compile(code: string): Promise<boolean> {
  // wrap snippet with #include + namespace
  const wrapped = `#include <iostream>\n#include <string>\nusing namespace std;\n${code}`;
  const tmpFile = `/tmp/check-${hash(code)}.cpp`;
  fs.writeFileSync(tmpFile, wrapped);
  try {
    await execAsync(`g++ -Wall -Wextra -fsyntax-only ${tmpFile}`);
    return true;
  } catch (err) {
    console.error(`Compile fail: ${code}\n${err}`);
    return false;
  }
}

// Run on every Card.expectedAnswer that contains C++
// Block build on any failure
```

---

## Dev Loop

```
1. Edit outline (e.g., outlines/L09/R-03.yml)
2. npm run gen          → regenerate cards for that atom (cache-aware)
3. npm run check        → compile + lint
4. npm run dev          → see new cards immediately (Vite HMR loads cards.json)
5. Verify in browser
6. Commit outline
7. (cards.json regenerable, not committed)
```

---

## Deployment

### Static hosting (zero infrastructure)

| Option | Setup |
|--------|-------|
| GitHub Pages | `npm run build` → push `dist/` to `gh-pages` branch |
| Netlify | drag-drop `dist/` |
| Cloudflare Pages | connect repo, build cmd `npm run build` |
| Local file:// | open `dist/index.html` directly (works offline) |

**Build artifact constraints**:
- Bundle size budget: <500 KB gzip
- No `fetch()` to external endpoints (audit dist/ before release)
- Service worker optional (offline-first PWA — defer to v2)
- All cards inlined in `cards.json` (eager load on app boot)

---

## Performance Budget

| Metric | Target |
|--------|--------|
| Initial load (3G) | <3s |
| First card paint | <500ms after load |
| Card transition | <150ms |
| Grade response | <50ms (synchronous, no async) |
| Bundle size (gzip) | <500 KB |
| `cards.json` size | <2 MB raw, <300 KB gzip |
| Memory footprint | <50 MB (mobile-friendly) |

---

## Acceptance Gates (Build-Time)

| Gate | Check | Failure mode |
|------|-------|--------------|
| Outlines lockable | `status: 'locked'` for all referenced atoms | Block gen |
| Card generator output | ~2,000 ± 10% cards produced | Block build |
| Compile-check 100% | All C++ snippets compile under g++ | Block build |
| Miller's law | Memorize fact ≤7 words | Block build |
| Idiom lint | `&array[]` not `*array` for &-ref atoms | Block build |
| Card type ratio | 49% / 11% / 7% / 33% ± 5% | Block build |
| Type-check | `tsc --noEmit` clean | Block build |
| Bundle audit | No `fetch(*api*)` in dist/ | Block deploy |
| No save-state | No `localStorage.setItem` in dist/ | Block deploy |
| Atom dependency closure | Every atom's deps in earlier or same level | Block build |

---

## Initial Bootstrap Commands

```bash
cd cpp-t2
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss @tailwindcss/vite js-yaml @types/js-yaml \
  @anthropic-ai/sdk tsx vitest @types/node
npm install -D eslint prettier eslint-config-prettier
npx tailwindcss init -p
mkdir -p build data src/{components,pages,lib,types,styles}
# Configure tailwind.config.ts for dark mode default + design tokens
# Configure tsconfig.json for strict mode
# Run npm run dev to verify scaffold
```

---

## What's Explicitly NOT Included

| Excluded | Why |
|----------|-----|
| Backend / API server | Static site only |
| Database (Supabase, Firebase, Postgres) | No save state |
| Authentication | Single user, single browser |
| Analytics (GA, Plausible, etc.) | Privacy + not needed |
| Service worker / PWA | Defer to v2 if at all |
| Mobile-native app (Capacitor, RN) | Web-only sufficient |
| Test runner for E2E (Playwright) | Manual QA + acceptance gates suffice |
| CI/CD pipeline | Local build → deploy static |
| Internationalization | English only |
| Accessibility audit beyond WCAG AA basics | Single user known |
| Error tracking (Sentry) | Static site, low complexity |

Only build what the spec demands. Per ANTIPATTERNS #14.
