# 19 — v2.2 Minimalist Plan (source-data centred, 6-L Test-2 app)

**Date:** 2026-05-07 (eve-of-test triage, post-AUDIT_MASTER_FIX_LIST.md)
**Status:** Planning lock. Forward-only. RULE 4: brutal honesty.
**Supersedes:** docs/15, docs/16, docs/17, docs/18 plus the v2 implementation in `src-v2/`.
**Replaces:** the 19-L / 4,600-card / 23-card-type / 6-engine v2 architecture.

## Cross-references (read alongside this doc)

- **Companion docs:**
  - `docs/16_test2_specific_redesign_v2.md` — curriculum spec (revised v2.2)
  - `docs/v2/MANIFEST.md` — **LOCKED feature list (MANIFEST wins on disagreement)**
  - `docs/v2/ANTI_DRIFT.md` — process for preventing drift; read before any code wave
- **Deprecated (do NOT follow):**
  - `docs/17_option4_max_quality_plan.md` — drift artifact
  - `docs/18_option4_milestone_plan.md` — drift artifact

If this doc disagrees with `docs/v2/MANIFEST.md`, MANIFEST wins. Fix this doc, not MANIFEST.

---

## §1 — USER VISION (verbatim, re-stated)

The user said, in their own words:

> "minimalist design, just teach me the fundamentals then 4 questions from zero
> and a mock exam, centered on source-data NOT shit you hallucinate"

Decoded line by line:

| User words | Concrete commitment |
|---|---|
| **minimalist design** | Match v1 UI: Home picker → linear card walker. No sidebar. No dashboard. No DAG view. No mock-results. No streak counter. No preflight. |
| **just teach me the fundamentals** | A single `L0 Foundations` module. PFG part-1 + part-2 only. No L-1..L17 curriculum. |
| **then 4 questions from zero** | Four modules `L1..L4`, one per Test-2 question. Each module assumes only L0. Independent. |
| **and a mock exam** | One module `L5 Mock`. Walk all 4 Qs in test-conditions sequence. |
| **centered on source-data** | Every card cites a real file in `cpp-t2/source-data/`. No card without a citation. |
| **NOT shit you hallucinate** | If I cannot point to a file:line that the card paraphrases, the card doesn't ship. |

Six modules. Linear walk per module. Source-grounded. v1-style UI. That is the entire spec.

---

## §2 — SOURCE-OF-TRUTH HIERARCHY (TIERS)

### Tier 1: THE TARGET (`source-data/tests/test two attempt 1/`)
- The actual V2.0 test taken 2026-05-07
- Every atom in the curriculum traces FORWARD to a syntax/skill exhibited here
- Test could re-word but underlying skills are invariant
- All 4 questions decomposed into atomic skills (see §2.1 below)

### Tier 2: SUPPORTING (`source-data/{pfg-content,seminars,task-sheets,tests}/`)
- PFG textbook (642 files): teaches the atoms academically
- Seminars (18 VTTs, esp. saloni-2): hand-execution walkthrough by tutor
- Task sheets (P1-P10): weekly problem sets — P6-P9 most relevant
- Practice tests + variant tests: alternate wordings of same atoms

### Tier 0: THE CREATIVE LEAP (curriculum design)
- Map "knows nothing" → "Tier 1 mastery"
- Decompose Tier 1 syntax → atomic skills
- Sequence atoms in prereq order
- Author cards drilling each atom, citing Tier 2 to teach
- This is OUR ENGINEERING JOB

### Citation rule
- Tier 1 reference: `tier1:Q{1-4}` (the test)
- Tier 2 reference: `pfg:path` / `seminar:saloni-2 @ HH:MM:SS` / `task-sheet:P{N}` / `practice:Q{N}` / `variant:Q{N}`
- NO Tier 0 citations allowed (don't cite my planning doc)
- Cards without verifiable Tier 1 OR Tier 2 citation → DELETE

**Citation contract for every card** (enforced by `lint:cards`):
- `card.drills` MUST be `tier1:Q{N}:{atom-id}` referencing an atom in §2.1.
- `card.source` MUST be a real Tier 2 path/locator (catalog row in `build-v2/SOURCE_DATA_CATALOG.md`).
- The card's stem and answer MUST be entailed by the cited Tier 2 region; the atom drilled MUST appear in Tier 1.
- Paraphrase is OK; invention is not. No Tier 0 citations (no self-references to planning docs).
- If either citation cannot be established, the card is **deleted** — not "marked weak", not "kept for now". Deleted.

**Hallucinated content** — content the v2 author wrote without consulting source-data, or wrote citing source-data it did not actually read — is the failure mode this plan corrects. See §11 for the brutal-honesty acknowledgement.

---

## §2.1 — Tier 1 Atomic-Skill Decomposition

The V2.0 attempt 1 paper (screenshots `Screenshot_20260507-152909.png` + `Screenshot_20260507-152936.png`) decomposes into **44 atomic skills** across the four questions. Every L0-L5 card MUST forward-cite at least one atom-id below.

### Q1 atoms — hand-execute trace (~17 skills)

| atom-id | skill |
|---|---|
| `tier1:Q1:const` | `const int SIZE = 5;` declaration |
| `tier1:Q1:struct-kw-name` | `struct` keyword followed by entity name |
| `tier1:Q1:field-array-decl` | struct field with array decl `T arr[SIZE]` |
| `tier1:Q1:field-scalar-decl` | struct field with scalar decl `T name;` |
| `tier1:Q1:void-fn-decl` | `void` function declaration |
| `tier1:Q1:param-by-ref` | parameter pass-by-ref `Type &name` |
| `tier1:Q1:semicolon` | statement terminator `;` |
| `tier1:Q1:brace-block` | brace block `{ ... }` |
| `tier1:Q1:dot-array-access` | `param.arr[i]` field-then-index access |
| `tier1:Q1:dot-scalar-access` | `param.scalar` field access |
| `tier1:Q1:pre-loop-init` | statement before loop (e.g. `data.mystery = 0.0`) |
| `tier1:Q1:for-header` | for-loop header `for (i=0; i<N; i++)` |
| `tier1:Q1:if-cond-gt` | if-condition with `>` comparison |
| `tier1:Q1:accumulator` | accumulator update `var = var + expr` |
| `tier1:Q1:brace-init-nested` | brace-init nested `{{vals}, val}` |
| `tier1:Q1:fn-call-no-amp` | function call without `&` at call-site |
| `tier1:Q1:trace-strikethrough` | hand-execute trace methodology with strikethrough notation |

### Q2 atoms — write struct (~8 skills)

| atom-id | skill |
|---|---|
| `tier1:Q2:struct-kw` | `struct` keyword (lowercase) |
| `tier1:Q2:entity-name-snake` | entity name in snake_case (`desk_data`) |
| `tier1:Q2:opening-brace` | opening `{` |
| `tier1:Q2:type-name-fields` | type-name field decls (int / string) |
| `tier1:Q2:semicolon-per-field` | `;` per field line |
| `tier1:Q2:closing-brace` | closing `}` |
| `tier1:Q2:trailing-semicolon` | trailing `;` after `}` |
| `tier1:Q2:type-from-noun` | choosing C++ type from English noun |

### Q3 atoms — write read fn (~9 skills)

| atom-id | skill |
|---|---|
| `tier1:Q3:void-return` | void return type |
| `tier1:Q3:fn-name` | fn name `read_<entity>` |
| `tier1:Q3:param-list-amp` | parameter list with `&list[]` placement |
| `tier1:Q3:param-int-count` | second param `int number_to_read` |
| `tier1:Q3:for-loop-bound-param` | for-loop with parameter as bound `i < number_to_read` |
| `tier1:Q3:body-open-brace` | body opening `{` |
| `tier1:Q3:cin-list-field` | `cin >> list[i].field` per field |
| `tier1:Q3:body-close-brace` | body closing `}` |
| `tier1:Q3:prompt-then-read` | prompt-then-read pattern (optional) |

### Q4 atoms — write main (~10 skills)

| atom-id | skill |
|---|---|
| `tier1:Q4:int-main` | `int main()` |
| `tier1:Q4:max-const` | `const int MAX = N;` |
| `tier1:Q4:struct-array-decl` | struct array decl `<entity>_data <plural>[MAX]` |
| `tier1:Q4:count-var` | count variable decl `int <count>` |
| `tier1:Q4:prompt-count` | prompt for count `cout << "...";` |
| `tier1:Q4:read-count` | read count `cin >> <count>;` |
| `tier1:Q4:fn-call-no-amp-main` | function call `read_<entity>(plural, count)` no `&` |
| `tier1:Q4:print-loop` | print loop `for (i=0; i<count; i++)` |
| `tier1:Q4:chained-cout` | chained cout `<< plural[i].field << ...` |
| `tier1:Q4:return-zero` | `return 0;` |

**Total: 17 + 8 + 9 + 10 = 44 atoms.** Every card MUST forward-cite (`drills:`) one of these.

---

## §3 — 6-L STRUCTURE

The app is six independent modules. No shared progress. No prereq DAG between modules. Each L lists which §2.1 Tier 1 atoms it covers + which Tier 2 sources teach those atoms.

| L | Name | Tier 1 atoms covered | Tier 2 teaching sources | Card target |
|---|---|---|---|---:|
| L0 | Foundations | Prereq atoms — variables, types, basic syntax (no Tier 1 atom directly drilled; teaches the *vocabulary* the Q1-Q4 atoms presume) | **Mostly Tier 2**: `pfg:part-1-instructions/{1-sequence-and-data, 2-communicating-syntax, 3-control-flow}` + `pfg:part-2-organised-code/{1-starting-cpp, 2-organising-code, 3-structuring-data, 4-indirect-access, 5-working-with-multiples}` (overview / tour / trailside) | ~400 |
| L1 | Q1 Hand-execute | All 17 `tier1:Q1:*` atoms | **Tier 1**: `tier1:Q1` (V2.0 sum-positive). **Tier 2**: `seminar:saloni-2 @ 00:23:02-00:42:00` (Q1 walkthrough), `practice:Q1` (find-max sister), `variant:Q1` (find-min variant), `pfg:part-3-programs-as-concepts/3-collections/2-trailside/{20-desk-checking, 22-code-tracing, 25-syntax-guide}.mdx`, `pfg:part-2-organised-code/1-starting-cpp/2-trailside/4-6-for.md`, `task-sheet:P9` | ~500 |
| L2 | Q2 Write struct | All 8 `tier1:Q2:*` atoms | **Tier 1**: `tier1:Q2` (`desk_data`). **Tier 2**: `practice:Q2` (`computer_data`), `variant:Q2` (`printer_data`), `seminar:saloni-2 @ 00:43:42-00:44:50`, `pfg:part-2-organised-code/3-structuring-data/{0-panorama/1-struct, 2-trailside/03-01-struct, 3-explore/3-1-entity}.md`, `task-sheet:P8` | ~150 |
| L3 | Q3 Write read fn | All 9 `tier1:Q3:*` atoms | **Tier 1**: `tier1:Q3` (`read_desks`). **Tier 2**: `practice:Q3` (`read_computers`), `variant:Q3` (`read_printer`), `seminar:saloni-2 @ 00:44:50-00:46:30`, `pfg:part-2-organised-code/{2-organising-code/2-trailside/04-function-decl.mdx, 04-parameter.mdx, 05-return.mdx, 4-indirect-access/0-panorama/04-parameter.md}`, `task-sheet:P7` | ~250 |
| L4 | Q4 Write main | All 10 `tier1:Q4:*` atoms | **Tier 1**: `tier1:Q4` (MAX=700, `desks[MAX]`, `desk_num`). **Tier 2**: `practice:Q4` (MAX=100), `variant:Q5`, `seminar:saloni-2 @ 00:46:30-end`, `pfg:part-2-organised-code/{2-organising-code, 5-working-with-multiples}`, `pfg:part-3-programs-as-concepts/3-collections/2-trailside/{10-arrays.mdx, 11-manipulating-arrays.mdx}`, `task-sheet:P9`, `task-sheet:P6` | ~200 |
| L5 | Mock paper | All 44 atoms (full assembly Q1+Q2+Q3+Q4) | **Tier 1**: `tier1:Q1..Q4` verbatim. **Tier 2**: `practice:Q1..Q4` (one full reworded mock), `variant:Q1..Q5` (second reworded mock) | ~30 |

**Total target: ~1,530 cards.** Hard ceiling: 1,800. If a level overruns, prune to its target — do not expand the ceiling.

The v1 ship target was 1,775. The v2 target was 4,600. v2.2 lands between them at ~1,500, **but every card grounded** — not the v2 mode of "ship more cards, ground later (never)".

---

## §4 — UI/UX (= v1 features only)

**Two routes. That is it.**

```
/                        ← Home (6-module picker)
/session/:level          ← Sequence (linear card walker)
```

### Home

```
┌─ C++T2 ────────────────────────────────────┐
│ L0  Foundations         [00/400]  Continue→│
│ L1  Q1 Hand-execute     [00/500]  Continue→│
│ L2  Q2 Struct           [00/150]  Continue→│
│ L3  Q3 Read fn          [00/250]  Continue→│
│ L4  Q4 Main             [00/200]  Continue→│
│ L5  Mock paper          [00/030]  Continue→│
└─────────────────────────────────────────────┘
```

`[seen/total]` reads from `sessionStorage` exposure-counter. No streak. No mastery %. No countdown.

### Sequence

```
┌─ L1 · F-22b · trace · 47/500 ──────────────┐
│ [card body rendered by CardRenderer]        │
│                                              │
│ [Submit]  [Retry]  [← Home]                 │
└──────────────────────────────────────────────┘
```

- Header: `L · atom-id · card-type · pos/total`. ASCII.
- Body: dispatched by `CardRenderer` discriminator on `card.type`.
- Footer: Submit, Retry, Back-to-Home. **No Skip.** Linear cure.
- Live exact-match grading on text fields; `normalizeLenient` for operator-spacing tolerance (carry over from v1).
- ASCII-only text, ligature-disabled CSS, monospace code panes.
- On pass: position++. On fail: stay (Retry replays). On end-of-deck: navigate `/`.

**Removed from v2** (will not exist in v2.2): sidebar nav, breadcrumb, command palette, brand square, statusbar, streak counter, ProgressRing, StageBar, AtomDAG view, weakness heatmap, preflight, postmortem, mock-results page, Track page, Q-tab segmentation, footer countdown, FamiliarityGauge in header.

---

## §5 — ENGINES (minimal)

**Exactly one engine: `exposure-counter.ts`.**

| Engine | Action | Rationale |
|---|---|---|
| `exposure-counter` | KEEP | Powers `[seen/total]` count on Home. Read-only API. |
| `daily-deck-composer` | DELETE | Bandit-flavoured non-deterministic deck order; opposite of "linear walk through cards 1..N". |
| `adaptive-deck` | DELETE | Mid-session DeltaCard injection. Already dead. |
| `stage-gate` | DELETE | 6-stage ladder + 4 escape valves. Linear walk has no gates. |
| `dag-backward-retry` | DELETE | BFS prereq injection. Not asked for. |
| `multi-q-propagation` | DELETE | Q-track linkage. Modules are independent per §3. |
| `failure-recovery` | DELETE | 5-band action map. Already dead. |

Cards load **in build-time order** from `data/v22/cards/L{0..5}.json`. The build script writes the JSON in the deterministic order it read the YAML. Position N today equals position N tomorrow.

---

## §6 — CARD TYPES (= 11 v1 + 4 v2 essentials = 15 total)

**Fifteen types. Not 23.** Aligned to `docs/v2/MANIFEST.md`.

Kept (v1 originals — 11):
- `memorize`, `mcq`, `trace`, `write`, `cloze`, `decompose`, `walkthrough`, `demo`, `procedural`, `matrix`, `code-memorize`

The v1 `write` type is broader than the three v2 specialisations and stays in L0 for general writing drills.

Kept (v2 essentials — 4, because Test 2 demands code-writing surfaces):
- `TemplateRecall` — recall the 4-Q skeleton (struct → read fn → print fn → main)
- `StructWrite` — write a struct from an English spec (Q2)
- `FunctionWrite` — write a `read_X(X &x)` from English spec (Q3)
- `MainWrite` — write `main()` composing the above (Q4)

**Deleted (will not exist in v2.2):**
`AdversarialMock`, `FaultInjection`, `Preflight`, `ConfidenceCalibration`, `DAGRetry`, `Delta`, `TestDaySim`, `VariantGen`, `Postmortem` (as a card-type), `SpeedDrill`, `EntityMatrix`, `AlgorithmMatrix` (de-dupe with v1 matrix). Eight+ types removed.

The `card-schema.ts` discriminator union shrinks from 23 → 15. Lint rejects unknown types.

---

## §7 — MIGRATION FROM v2 → v2.2

Mechanical, ordered:

1. **Delete pages** (6): `Track.tsx`, `Mock.tsx`, `Postmortem.tsx`, `AtomTree.tsx`, `Weakness.tsx`, `Preflight.tsx` (+ their `__stories__/`).
2. **Delete engines** (6): `multi-q-propagation`, `stage-gate`, `failure-recovery`, `daily-deck-composer`, `adaptive-deck`, `dag-backward-retry` (+ their `__tests__/`).
3. **Delete card components** (≥9, up to 12): the off-spec types listed in §6.
4. **Replace AppShell**: drop `AppShell.tsx`, write a 30-line `TitleBar.tsx`.
5. **Rewrite** `Home.tsx` (6-row picker), `Session.tsx` (linear walker), `App.tsx` (2 routes), `lib/session-store.tsx` (exposure-only).
6. **Card YAMLs**: per AUDIT_MASTER_FIX_LIST.md §5 — re-tag ~134 (`spoterror`→`mcq`, `scaffold-fillblank`→`cloze`, `typeline`/`fulltype`/`order`→`procedural`/`cloze`, `preflightcheck`→`mcq`); delete ~67 (`faultinj`, `speed`, `timed`, `mock-*` variants); keep ~2,346.
7. **Run grounding audit** (§8) on the ~2,480 surviving cards. Whatever passes ships. Whatever fails is deleted, not patched.
8. Bump `data/SCHEMA.md` → `schemaVersion: v2.2`. Discriminator union 11 types.

**Net before grounding:** ~2,480 cards retained from v2.
**Net after grounding (expected):** see §8.

---

## §8 — GROUNDING AUDIT + NEW CARD AUTHORING

Run a one-pass grounding audit before any new authoring:

```
for each card C in surviving 2,480:
  if not C.source.file or not exists(source-data/{C.source.file}):  delete
  if not C.source.locator:                                          delete
  if not paraphrase_entailed(C.stem + C.answer, source-region(C)):  delete
```

Three outcomes:

| Grounding rate | Action |
|---|---|
| ≥ 90% | Ship the surviving deck as-is. Hand-author only fillers per L target. |
| 70–89% | Ship the survivors. Hand-author replacements toward the §3 targets. |
| < 70% | The deck is unsalvageable. Delete the v2 cards entirely; hand-author from scratch against §3 targets, ~1,500 total. |

**Cards-must-cite map** (mandatory for any new authoring):

| L | Acceptable citation forms |
|---|---|
| L0 | `source-data/pfg-content/pfg-content/part-1-instructions/**/*.{md,mdx}` or `part-2-organised-code/{1,2,3,4,5}-*/**/*.{md,mdx}` (overview, tour, trailside, explore, panorama) |
| L1 | `source-data/seminars/*.vtt#hh:mm:ss-hh:mm:ss` (Saloni hand-execute timestamps) OR `source-data/tests/{Test2-SIT102-practice*, test two attempt 1/, test2-semester2*.txt}` Q1 stimuli |
| L2 | `source-data/tests/...` Q2 stimulus OR `source-data/pfg-content/.../part-2-organised-code/3-structuring-data/**` |
| L3 | `source-data/tests/...` Q3 stimulus OR `source-data/pfg-content/.../part-2-organised-code/4-indirect-access/**` |
| L4 | `source-data/tests/...` Q4/Q5 stimulus OR `source-data/pfg-content/.../part-2-organised-code/{2-organising-code, 5-working-with-multiples}/**` |
| L5 | `source-data/tests/Test2-SIT102-practice-2026T1.*` and the two `test2-semester2*.txt` variants. Mocks ONLY paraphrase the test text; no invented Qs. |

If a card cannot be cited from this map, the card does not ship.

---

## §9 — ACCEPTANCE CRITERIA for v2.2

A v2.2 build ships only when **all** of these hold:

1. **Tier-aware grounding**: 100% of cards in `data/v22/cards/L{0..5}.json` cite Tier 1 OR Tier 2 (no Tier 0 self-references to planning docs). Each card has a non-empty `drills:` (Tier 1 atom-id from §2.1) and a non-empty `source:` (Tier 2 path/locator from `build-v2/SOURCE_DATA_CATALOG.md`). `lint:cards` enforces both.
2. **Atom coverage**: every Tier 1 atom (44 total in §2.1) has ≥ 3 cards drilling it across L0-L5. `lint:cards` reports per-atom coverage; any atom < 3 blocks the ship.
3. **Mock composition**: L5 includes 1 Tier-1-verbatim mock (Q1-Q4 of V2.0 attempt 1, near-verbatim) + 2 reworded variants (`practice:Q1..Q4` and `variant:Q1..Q5`). Mocks paraphrase Tier 1/Tier 2 only; no invented Qs.
4. **Surfaces**: exactly two routes — `/` and `/session/:level`. No other pages reachable from any link.
5. **Card types**: discriminator union has 15 entries (11 v1 + 4 v2 essentials per `docs/v2/MANIFEST.md`); no card with an unknown type loads.
6. **Engines**: only `exposure-counter` is imported anywhere in `src-v2/`.
7. **Bundle**: `npm run build` produces ≤ 200 KB gzip JS (down from 425 KB v2). Stretch: ≤ 150 KB.
8. **Quality gates**: `npm run typecheck`, `npm run lint`, `npm run lint:cards`, `npm run smoke` all clean.
9. **6 modules visible on Home**, click → linear walk, end-of-deck → return to Home.
10. **No off-spec UI surfaces** present in any rendered page (sidebar, dashboard, DAG view, weakness heatmap, preflight, postmortem, mock-results, streak counter, FamiliarityGauge in header, footer countdown).

If any line above fails: **block the ship**, fix or revert. No "we'll patch it tomorrow."

---

## §10 — DEFERRED / WON'T BUILD

The following are **out of scope for v2.2 and will not be added later** without an explicit user request and a CHANGELOG entry justifying the deviation:

- Adaptive deck composition (bandit / SRS / mastery gating)
- Mock paper variant matrix / variant generation
- Atom DAG visualiser
- Weakness file / 90-day decay heatmap
- Confidence calibration (Brier scoring)
- Preflight test-day simulator
- Postmortem analytics
- Multi-Q propagation between modules
- Stage-gate ladder
- DAG-backward retry
- Failure-recovery action maps
- AppShell sidebar / command palette / chord shortcuts / brand square / statusbar streak
- Anything else not listed in §3 or §4

If the user later asks for any of these, that is a new project. Not v2.2.

---

## §11 — BRUTAL HONESTY: how v2 drifted, how v2.2 corrects

I did not write v2 with discipline. The drift happened in three moves:

**Drift 1 — feature-fan-out without authorization.** v1 shipped 10 card types, 1,775 cards, 2 routes (Home + Sequence). v2 shipped 23 card types, 2,547 cards, 8 routes, 7 engines, an AppShell with sidebar/command-palette/streak counter. The user authorised none of these. I rationalised each addition as "test-prep best practice." That is the hallmark of ANTIPATTERNS.md #5/#16 — combining + skipping + scope creep — which I had read and then ignored.

**Drift 2 — content authored without source.** Roughly 67 v2 card YAMLs use card types (`faultinj`, `speed`, `timed`, `mock-*`) that exist only because I built the components first and then wrote cards to fill them. The cards' `source` field, where present, points at files I did not actually open. The cards are not entailed by `source-data/`. They are confabulated.

**Drift 3 — two contradictory source-of-truth docs.** `CLAUDE.md` says "post-M22 maintenance mode, 1,775 cards, 10 card types." `data/v2/SCHEMA.md` says "23 card types, 4,600 cards, 6 design levels." Both files were live in the repo at the same time. I added the second one without retiring the first. AUDIT_DOC_DRIFT.md flagged this; I had not yet acted on it before today.

**v2.2 corrects all three:**

- **Drift 1 → §3, §4, §5, §6, §10.** Six modules. Two routes. One engine. Fifteen types (11 v1 + 4 v2). Anything else is deferred and listed in §10 by name so I cannot smuggle it back in.
- **Drift 2 → §2, §8.** Every card cites a real file. The grounding audit deletes any card that cannot. New cards must cite from the §8 map. No more confabulation.
- **Drift 3 → §9 acceptance gate + a single SCHEMA bump to v2.2.** This doc replaces the 19-L plan, 23-type schema, and 4,600-card target. Old planning docs (15, 16, 17, 18) are superseded; CLAUDE.md is updated to point here.

The user said "centered on source-data NOT shit you hallucinate." That is the entire failure mode of v2 in eleven words. v2.2 takes it as the acceptance criterion, not a vibe.

---

## §12 — FORWARD COMMITMENT

I, the author of this plan and the migration that follows, commit:

1. **I will NOT add features beyond §3–§6.** Six Ls. Two routes. One engine. Fifteen card types (11 v1 + 4 v2 essentials). If a "small useful addition" tempts me, I will treat that temptation as a §10 deferral and stop.
2. **I will NOT hallucinate sources.** Every card I author or migrate will have a `source.file` I have actually read and a `source.locator` I have actually verified. If I cannot verify, I delete the card. Not "TODO". Delete.
3. **I will verify grounding before authoring cards.** Run §8's audit on the migrated v2 deck first. Read the report. Decide ship-as-is vs hand-author from scratch on the basis of grounding rate, not on what would be quickest to ship.
4. **I will keep UI minimalist matching v1.** Two routes, no sidebar, no dashboard, no badges, no streaks. If a Figma-style flourish tempts me, I will refuse it.
5. **I will halt at the acceptance gate (§9).** If any of the eight criteria fails, I block the build. I do not patch around the lint, do not bump the bundle ceiling, do not ship "minimal v2.2 plus one tile."
6. **I will treat this doc as the lock.** Any deviation requires the user's explicit authorization plus a CHANGELOG entry naming the deviation. No silent expansion. No "while I was in there."

This is the plan. Six modules, two routes, one engine, fifteen types (11 v1 + 4 v2 essentials), every card grounded in `cpp-t2/source-data/`. Anything else is for a different project.

---

## §13 — REVERSE-ENGINEERING WALK-BACK FROM TIER 1

The curriculum order is not invented. It is mechanically derived by walking backward from Tier 1.

### Procedure (per Q in V2.0 attempt 1)

1. **Token list.** Scan the Tier 1 screenshot for every syntax token shown (`const`, `int`, `=`, `;`, `struct`, `{`, `}`, `[]`, `&`, `for`, `<`, `++`, `if`, `cin`, `>>`, `cout`, `<<`, `return`, etc.).
2. **Token → atom map.** Each token (or token cluster) maps to one §2.1 atomic skill. Tokens already covered by an earlier atom are deduped.
3. **Atom → prereqs (DAG backward).** For each atom, list what a learner must already know to perform it. Example: `tier1:Q1:dot-array-access` requires `tier1:Q1:dot-scalar-access` (field access) **plus** L0 prereq `array-indexing` (general `arr[i]`). `tier1:Q4:struct-array-decl` requires `tier1:Q2:struct-kw` (must know what a struct is) plus L0 prereq `array-decl`.
4. **Topological sort.** The DAG (Tier 1 atoms ∪ L0 prereq atoms, edges = "depends on") sorted topologically yields a strictly forward learning order: every node appears after all its prereqs.

### Walk-back results (curriculum order)

The topological sort partitions naturally:

- **L0 prereqs** (no Tier 1 atom drilled yet — pure foundation): variable decl, type names (`int`, `double`, `string`), assignment, `cin`/`cout` mechanics, `;` discipline, `{}` blocks in general, `if` condition mechanics, `for` loop mechanics, `arr[i]` indexing in general, function call mechanics, `return` mechanics. Sourced from `pfg:part-1-instructions/*` and `pfg:part-2-organised-code/{1-starting-cpp, 2-organising-code}/*`.
- **L1 = Q1 atoms** (depend only on L0 prereqs). Strictly self-contained: hand-execute is mechanical and presumes only the prereqs above.
- **L2 = Q2 atoms** (depend only on L0 prereqs — does not depend on L1).
- **L3 = Q3 atoms** (depend on L2 atoms: `read_<entity>` needs `<entity>_data` from Q2).
- **L4 = Q4 atoms** (depend on L2 + L3 atoms: `main` calls `read_<entity>` and prints from the array of `<entity>_data`).
- **L5 = Mock** (full assembly — Q1+Q2+Q3+Q4 all 44 atoms in test conditions).

This produces the L0 → L1-L4 → L5 sequence in §3 **as a derivation, not a design choice**. The order is forced by the prereq DAG; deviating from it would require an atom to be drilled before its prereqs, which the lint forbids.

### Why walk-back beats top-down design

A "we'll teach the basics, then add stuff" curriculum is Tier 0 fiction. Walk-back is Tier 1 forensics: every atom in the curriculum is provably exhibited in the test, and no atom is in the curriculum that isn't. Cards that drill skills outside the 44 atoms (or their L0 prereqs) — e.g. `switch`, `while`, recursion, pointers, dynamic memory — are by definition out-of-scope and get deleted regardless of how educational they "feel".

---

## §14 — SOURCE-OF-TRUTH INTEGRITY RULE

Every card has TWO citations. Lint enforces both. Missing either = delete.

### Forward citation: `drills`
- Format: `drills: tier1:Q{N}:{atom-id}` where `{N}` ∈ {1,2,3,4} and `{atom-id}` is one of the 44 entries in §2.1.
- Meaning: "this card drills the following atomic skill exhibited in Tier 1 (V2.0 attempt 1)."
- Validation: lint loads the §2.1 atom catalog at build time and rejects any `drills:` value that is not in the catalog. Typos = delete. Aspirational atoms not in the catalog = delete.

### Backward citation: `source`
- Format: `source: tier2:{...}` where `{...}` is one of:
  - `pfg:<path>` (PFG file path under `pfg-content/pfg-content/`)
  - `seminar:saloni-2 @ HH:MM:SS` (or `HH:MM:SS-HH:MM:SS` for a range)
  - `task-sheet:P{N}` or `task-sheet:T2`
  - `practice:Q{N}` (Test2-SIT102-practice-2026T1)
  - `variant:Q{N}` (test2-semester2-variant)
  - `tier1:Q{N}` ONLY for L5 mock cards that paraphrase the V2.0 paper directly
- Meaning: "this is the Tier 2 file/locator that *teaches* the atom this card drills."
- Validation: lint resolves the path/locator against `build-v2/SOURCE_DATA_CATALOG.md`. Unknown paths = delete. Files that don't exist on disk = delete.

### Lint contract
```
for each card C in data/v22/cards/L{0..5}.json:
  if C.drills is empty:                        delete (no Tier 1 anchor)
  if C.drills not in §2.1 atom catalog:        delete (invented atom)
  if C.source is empty:                        delete (no Tier 2 anchor)
  if C.source resolves to Tier 0 (this doc):   delete (self-citation)
  if C.source path/locator not in catalog:     delete (invented source)
```

No card ships with one citation missing. No card ships with a citation that points at this planning doc (Tier 0). The integrity rule is mechanical: a card either has a verifiable forward atom + verifiable backward Tier 2 source, or it does not exist.

---

## §15 — ANTI-DRIFT INTEGRATION

This plan does not stand alone. Drift prevention is a process, not a paragraph.

**Authoritative anti-drift docs:**
- `docs/v2/MANIFEST.md` — the locked feature list. If §3-§6 of this plan disagree with MANIFEST, MANIFEST wins. Fix this doc.
- `docs/v2/ANTI_DRIFT.md` — the per-wave checklist + drift catalogue + lint contract. Read before any code wave.
- `CLAUDE.md` — entry-point summary that points future Claudes here.

**Process before any code wave:**
1. Re-read `docs/v2/MANIFEST.md`. Confirm the feature you're about to add is in scope.
2. Re-read `docs/v2/ANTI_DRIFT.md`. Confirm you're not repeating a known drift pattern.
3. Plan changes in terms of MANIFEST entries, not vibes.
4. After changes, run `npm run lint:drift`. Block ship on any off-MANIFEST surface.
5. Per-wave checkpoint: report files added/modified/deleted to user.

**Cross-doc alignment guarantee:**
- 6 levels (L0..L5): §3 of this doc = MANIFEST = doc/16
- 2 pages (Home + Sequence): §4 = MANIFEST = doc/16
- 1 engine (exposure-counter): §5 = MANIFEST = doc/16
- 15 card types (11 v1 + 4 v2): §6 = MANIFEST = doc/16
- Tier hierarchy (Tier 0/1/2): §2 = MANIFEST = doc/16

If a future audit finds these four docs disagree, MANIFEST wins. Re-align the others.
