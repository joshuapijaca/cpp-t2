# cpp-t2 Test-2-Specific Redesign — DEEP PLAN

**Status:** v2.2 (drift-stripped, locked to v1 minimalism + Tier 1 grounding)
**Date:** 2026-05-07 (late evening, eve-of-resit triage)
**Supersedes:** v1, v2, v2.1 of this doc + `15_l1_l12_redesign_plan.md`
**Aligned with:** `19_v22_minimalist_plan.md` (canonical companion)

---

## REVISION HISTORY

### v2.2 (2026-05-07 late evening) — Strip drift, lock to minimalism
1. **Stage gates removed.** Replace S1-S6 per Q-track with linear walk through L's cards 1..N.
2. **Engines reduced to one.** Exposure-counter only. No daily-deck-composer, no adaptive engine, no stage-gate machinery, no failure-recovery 5-band, no DAG-backward retry, no multi-Q tagging propagation.
3. **UI reduced to two pages.** Home (6 module list) + Sequence (linear walker). No Track / Mock / Postmortem / AtomTree / Weakness / Preflight pages.
4. **Card types capped at 15.** 11 v1 types + 4 v2 essentials. Mock-variant matrix removed. Test-day-sim card removed. Adversarial mock card removed.
5. **QA gates removed.** No 50-fuzz dry-run, no Pearson r=0.85 simulation, no preflight predictor, no burnout detection, no confidence calibration.
6. **Tier 1/2/0 hierarchy locked.** §2 + §2.1 (44 atoms) imported from `19_v22_minimalist_plan.md` as the source-of-truth contract.
7. **§13 walk-back + §14 integrity rule added.** Curriculum is reverse-engineered from Tier 1, not invented.

### v2.1 (2026-05-07 evening) — Pivot to code editor + exposure-frequency
- code editor everywhere (zero paper, zero photo, zero timers).
- Exposure-frequency model (NEW → IN-PROGRESS → FAMILIAR; counters only, no SRS).
- Goal reframe: "mastery" → familiarity %.

### v2 (2026-05-07 afternoon) — Deep plan synthesis
### v1 (2026-05-07 morning) — Initial test-2-specific redesign (19 levels → 6 L0-L5)

---

## EXECUTIVE SUMMARY

**Goal:** 0% → 100% familiarity on the 44 Tier 1 atoms by 2026-05-14 11am.

**Six modules, linear walk per module, source-grounded:**

| Module | Name | Atoms covered | Card target |
|---|---|---|---|
| L0 | Foundations | Prereq vocabulary | ~400 |
| L1 | Q1 Hand-execute | 17 `tier1:Q1:*` | ~500 |
| L2 | Q2 Write struct | 8 `tier1:Q2:*` | ~150 |
| L3 | Q3 Write read fn | 9 `tier1:Q3:*` | ~250 |
| L4 | Q4 Write main | 10 `tier1:Q4:*` | ~200 |
| L5 | Mock paper | All 44 (full assembly) | ~30 |
| **Total** | | **44** | **~1,530** |

**UI:** Home (6 module list) + Sequence (linear walker). Nothing else.
**Engine:** Exposure-counter only. NEW → IN-PROGRESS → FAMILIAR.
**Card types:** 15 max (see §6).

---

## §1 — STRATEGIC FRAMING

### 1.1 Core insight

Test 2 = **4 templated questions** with invariant skeleton + variable algorithm/entity slot. Confirmed across:
- Practice test (`computer_data`, find-max algorithm)
- Real test V2.0 attempt 1 (`desk_data`, sum-positives algorithm)

The skeleton is fixed. Only the entity name, field count, algorithm condition, and accumulator action vary. The app drills vertical depth on those 4 templates — not breadth across SIT102 unit content.

### 1.2 Blended continuum

```
                    [L0 FOUNDATIONS]
                              │
                              ▼
        ┌────────────┬────────────┬────────────┐
        ▼            ▼            ▼            ▼
     [L1 Q1]     [L2 Q2]      [L3 Q3]      [L4 Q4]
        │            │            │            │
        └─────────── │ ───────────┘            │
                     ▼                         │
                  [L5 MOCK] ◄─────────────────-┘
```

| Boundary | Continuum |
|---|---|
| L0 → Q-modules | Serial (foundations gate the questions) |
| L1 / L2 / L3 / L4 | Parallel (independent, user picks order) |
| Q-modules → L5 | Serial (mock assumes all 4 walked) |

No shared progress between modules. No DAG dependency between Q-modules. Pick any Q first; complete it linearly; move on.

### 1.3 Linear flow per Q-track

Cards are loaded in prereq order (built once at compile time by walking the Tier 1 atom DAG). The student walks them one-by-one in a Sequence page. On fail, the card retries until pass; then advance. **No stages. No gates. No skip.**

The order is fixed at build time; in-session reordering is forbidden (RULE 4: don't surprise the student).

---

## §2 — SOURCE-OF-TRUTH HIERARCHY (TIERS) — LOCKED

### Tier 1: THE TARGET (`source-data/tests/test two attempt 1/`)
- The actual V2.0 test taken 2026-05-07.
- Every atom in the curriculum traces FORWARD to a syntax/skill exhibited here.
- All 4 questions decomposed into atomic skills (see §2.1 below).

### Tier 2: SUPPORTING (`source-data/{pfg-content,seminars,task-sheets,tests}/`)
- PFG textbook (642 files): teaches atoms academically.
- Seminars (saloni-2 esp.): hand-execution walkthrough.
- Task sheets P6-P9: weekly problem sets covering Test-2 content.
- Practice + variant tests: alternate wordings of same atoms.

### Tier 0: THE CREATIVE LEAP (curriculum design)
- Map "knows nothing" → Tier 1 mastery.
- Decompose Tier 1 syntax → atomic skills → prereq order → cards citing Tier 2.
- This is OUR ENGINEERING JOB, not a citable source.

### Citation rule
- Tier 1: `tier1:Q{1-4}:{atom-id}` from §2.1.
- Tier 2: `pfg:path` / `seminar:saloni-2 @ HH:MM:SS` / `task-sheet:P{N}` / `practice:Q{N}` / `variant:Q{N}`.
- **No Tier 0 citations.** Don't cite this planning doc.
- Cards without verifiable Tier 1 OR Tier 2 citation → DELETE.

---

## §2.1 — TIER 1 ATOMIC-SKILL DECOMPOSITION (44 atoms) — LOCKED

The V2.0 attempt 1 paper decomposes into 44 atomic skills. Every card MUST forward-cite at least one atom-id below in its `drills:` field.

### Q1 atoms — hand-execute trace (17)

`tier1:Q1:const`, `tier1:Q1:struct-kw-name`, `tier1:Q1:field-array-decl`, `tier1:Q1:field-scalar-decl`, `tier1:Q1:void-fn-decl`, `tier1:Q1:param-by-ref`, `tier1:Q1:semicolon`, `tier1:Q1:brace-block`, `tier1:Q1:dot-array-access`, `tier1:Q1:dot-scalar-access`, `tier1:Q1:pre-loop-init`, `tier1:Q1:for-header`, `tier1:Q1:if-cond-gt`, `tier1:Q1:accumulator`, `tier1:Q1:brace-init-nested`, `tier1:Q1:fn-call-no-amp`, `tier1:Q1:trace-strikethrough`.

### Q2 atoms — write struct (8)

`tier1:Q2:struct-kw`, `tier1:Q2:entity-name-snake`, `tier1:Q2:opening-brace`, `tier1:Q2:type-name-fields`, `tier1:Q2:semicolon-per-field`, `tier1:Q2:closing-brace`, `tier1:Q2:trailing-semicolon`, `tier1:Q2:type-from-noun`.

### Q3 atoms — write read fn (9)

`tier1:Q3:void-return`, `tier1:Q3:fn-name`, `tier1:Q3:param-list-amp`, `tier1:Q3:param-int-count`, `tier1:Q3:for-loop-bound-param`, `tier1:Q3:body-open-brace`, `tier1:Q3:cin-list-field`, `tier1:Q3:body-close-brace`, `tier1:Q3:prompt-then-read`.

### Q4 atoms — write main (10)

`tier1:Q4:int-main`, `tier1:Q4:max-const`, `tier1:Q4:struct-array-decl`, `tier1:Q4:count-var`, `tier1:Q4:prompt-count`, `tier1:Q4:read-count`, `tier1:Q4:fn-call-no-amp-main`, `tier1:Q4:print-loop`, `tier1:Q4:chained-cout`, `tier1:Q4:return-zero`.

**Total: 17 + 8 + 9 + 10 = 44 atoms.** Full skill→description table is canonical in `19_v22_minimalist_plan.md §2.1`.

---

## §3 — 6-L STRUCTURE

| L | Name | Atoms | Tier 2 sources | Cards |
|---|---|---|---|---:|
| L0 | Foundations | Prereq vocabulary (no Tier 1 atom directly drilled) | `pfg:part-1-*`, `pfg:part-2-{1,2,3,4,5}-*` | ~400 |
| L1 | Q1 Hand-execute | All 17 `tier1:Q1:*` | `seminar:saloni-2 @ 00:23-00:42`, `practice:Q1`, `variant:Q1`, PFG part-3 collections trailside, `task-sheet:P9` | ~500 |
| L2 | Q2 Write struct | All 8 `tier1:Q2:*` | `practice:Q2`, `variant:Q2`, `seminar:saloni-2 @ 00:43-00:44`, PFG 3-structuring-data, `task-sheet:P8` | ~150 |
| L3 | Q3 Write read fn | All 9 `tier1:Q3:*` | `practice:Q3`, `variant:Q3`, `seminar:saloni-2 @ 00:44-00:46`, PFG 2-organising-code function trailside, `task-sheet:P7` | ~250 |
| L4 | Q4 Write main | All 10 `tier1:Q4:*` | `practice:Q4`, `variant:Q5`, `seminar:saloni-2 @ 00:46-end`, PFG 2-organising-code + 5-working-with-multiples, `task-sheet:P{6,9}` | ~200 |
| L5 | Mock paper | All 44 (full assembly) | `tier1:Q1..Q4` verbatim + `practice:Q1..Q4` reworded + `variant:Q1..Q5` reworded | ~30 |

Each L is independent. No prereq edges between Qs. The student picks Q-order on the Home page.

---

## §4 — UI

Two pages. That is the whole UI.

### 4.1 Home (`/`)

A flat list of six modules with progress bars. No sidebar. No dashboard. No DAG view. No mock-results panel. No streak counter. No preflight.

```
cpp-t2 — SIT102 Test 2 Prep

 L0  Foundations          ████████░░  80%   400 cards
 L1  Q1 Hand-execute      ███░░░░░░░  30%   500 cards
 L2  Q2 Write struct      ░░░░░░░░░░   0%   150 cards
 L3  Q3 Write read fn     ░░░░░░░░░░   0%   250 cards
 L4  Q4 Write main        ░░░░░░░░░░   0%   200 cards
 L5  Mock paper           🔒 (locked until L1-L4 ≥ 80%)
```

Click any unlocked module → Sequence.

### 4.2 Sequence (`/sequence/L{N}`)

Linear card walker. Card N of M. Front, body, submit, feedback, advance. Retry on fail. No skip. No reorder.

Header: module name + `card N / M` + back arrow. Footer: nothing.

That is the whole Sequence page.

---

## §5 — ENGINE

**One engine: exposure-counter.**

```
Per card: target exposure count
  - Short cards (cloze / walkthrough / demo): target = 6
  - Medium cards (decompose / cmem / μ-write): target = 8
  - Long cards (write / trace / procedural): target = 12

Card state:
  - 0 exposures → NEW
  - 1..target-1 → IN-PROGRESS
  - ≥target with last 3 correct → FAMILIAR (retired from rotation)
  - ≥target with errors → still IN-PROGRESS

Familiarity % = (correct exposures / target) × 100, capped at 100.
Module % = mean across the module's cards.
```

Draw order in a session: walk forward through the module's prereq-sorted card list; loop back to retired-then-failed cards at the end. No daily-deck-composer. No adaptive in-session reordering. No stage-gate machinery. No failure-recovery 5-band. No DAG-backward retry. No multi-Q tagging propagation.

**Why one engine:** the 7-day window doesn't justify SRS interval optimization. The student needs familiarity by 14 May, not lifelong retention.

---

## §6 — CARD TYPES (15 max)

### v1 inventory (11 — keep all)

1. `memorize` — see fact, type fact verbatim.
2. `mcq` — pick one of N.
3. `trace` — interactive memory boxes; click [+] to add value, [×] strikethrough; terminal text panel; submit.
4. `write` — full editor (mono, line numbers, brace-match); submit → diff vs canonical.
5. `cloze` — code with one or more blanks; type the missing tokens.
6. `decompose` — multi-select 1-N keys identifying parts of a snippet; set-equality grader.
7. `walkthrough` — full code panel + active-line accent + reveal-on-space steps.
8. `procedural` — write code from English prompt; 3-streak retire.
9. `matrix` — RAVEN-style pattern transfer (entity-swap or algo-swap).
10. `code-memorize` — see code → hide → type verbatim.
11. `demo` — see code + accent highlights + "why" + "used in" badges; space to advance.

### v2 essentials (4 — add)

12. `template-recall` — study skeleton 5s → hide → retype from memory.
13. `struct-write` — narrow editor that grades struct fields token-by-token.
14. `function-write` — narrow editor that grades function signatures + body shape.
15. `main-write` — narrow editor for `int main` skeleton.

### Removed (8 — do not author)

`adversarial-mock`, `mock-variant-matrix`, `test-day-sim`, `weakness-card`, `confidence-calibration`, `atom-dag-card`, `preflight-predictor`, `wildcard-S5.5` — all dropped. Anything Test 2 needs is in the 15 above.

---

## §7-§12 — RESERVED

Reserved for per-module card-count breakdown if/when authoring needs the detail. Authoring is currently driven by `19_v22_minimalist_plan.md` + the per-atom Tier 2 catalog; this section stays light intentionally.

---

## §13 — REVERSE-ENGINEERING WALK-BACK FROM TIER 1

The curriculum order is not invented. It is mechanically derived by walking backward from Tier 1.

**Procedure:**
1. **Token list.** Scan the Tier 1 screenshot for every syntax token shown (`const`, `int`, `=`, `;`, `struct`, `{`, `}`, `[]`, `&`, `for`, `<`, `++`, `if`, `cin`, `>>`, `cout`, `<<`, `return`, etc.).
2. **Atom map.** Map each token-cluster to a §2.1 atom (e.g. `const int SIZE = 5;` → `tier1:Q1:const`).
3. **Prereq edges.** For each atom, list the atoms it depends on (e.g. `dot-array-access` depends on `field-array-decl` + `for-header`).
4. **Topological sort.** The DAG (44 Tier 1 atoms ∪ L0 prereq atoms, edges = "depends on") sorted topologically yields a strictly forward learning order: every node appears after all its prereqs.
5. **L assignment.** L0 = atoms with no Tier 1 forward-cite (pure prereqs). L1-L4 = atoms by Q. L5 = full assembly.

A "we'll teach the basics, then add stuff" curriculum is Tier 0 fiction. Walk-back is Tier 1 forensics: every atom in the curriculum is provably exhibited in the test, and no atom is in the curriculum that isn't. Cards drilling skills outside the 44 atoms (or their L0 prereqs) — `switch`, `while`, recursion, pointers, dynamic memory — are out-of-scope by definition and get deleted regardless of how educational they "feel".

---

## §14 — SOURCE-OF-TRUTH INTEGRITY RULE

Every card in `data/v22/cards/L{0..5}.json` MUST satisfy:

```
card.drills  ∈  §2.1 atom-ids                (forward-cites Tier 1)
card.source  ∈  catalog row in build-v2/SOURCE_DATA_CATALOG.md  (cites Tier 2)
card.stem + card.answer  ⊆  paraphrase of cited Tier 2 region
```

`lint:cards` enforces all three. Failure modes:

| Symptom | Action |
|---|---|
| Empty `drills` | Delete card (no Tier 1 anchor). |
| Empty `source` | Delete card (hallucinated content). |
| `source` cites a planning doc (Tier 0) | Delete card (self-reference forbidden). |
| Cited Tier 2 region doesn't entail stem+answer | Delete card. |
| Drilled atom not present in Tier 1 | Delete card. |

Paraphrase is OK. Invention is not. No Tier 0 citations. No "marked weak, kept for now" — deletion is the only failure path.

This rule is the one non-negotiable contract of this design. Every other rule in this doc can be relaxed under user authorization; this one cannot.

---

## §15 — DRIFT HISTORY (kept for memory)

The v2.1 plan was correct in skeleton. The build drifted in waves 3-7 by accreting features the user never asked for. v2.2 (this revision) corrects.

**Dropped features (do not reintroduce without explicit user authorization):**

- 6-stage progression S1-S6 per Q-track (and the 30+ stage gates it implied).
- Stage-gate escape valves (24h auto-promote, difficulty drop, manual override).
- Failure-recovery 5-band drop-back policy.
- Weighted card-draw order (lowest-accuracy 1.5×, etc.).
- S5.5 wildcard sub-stage (4-field, while-loop, getline, dynamic-count).
- Weakness file as a feature.
- Atom DAG visualizer as a feature.
- Preflight check 24h before test.
- Confidence calibration.
- Adversarial mocks as a card type.
- Mock variant matrix (canonical / entity-swap / algo-swap / adversarial).
- Test-day-sim card.
- Pre-flight Pearson r=0.85 simulation.
- 50-fuzz-student dry-run as QA gate.
- DAG-backward retry.
- Adaptive deck (in-session reordering).
- Multi-Q tagging propagation as a feature.
- Per-card timers (already stripped 2026-05-07; any residuals removed).
- Daily-deck-composer engine.
- Stage-gate engine.

The rule going forward: anything the user did not ask for, by name, in the chat, is out of scope. RULE 4 brutal cuts apply.

---

**END — v2.2 lock. Authoring resumes from `19_v22_minimalist_plan.md` per-atom catalog.**
