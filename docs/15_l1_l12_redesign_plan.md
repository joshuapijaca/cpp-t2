# 15 — L-1 to L11 Code-Centric Redesign Plan

**Status**: planned, not started.
**Trigger phrase**: "let's do L1-L12 redesign" (or "L-1 to L11 redesign", same intent).
**Author intent**: same overhaul that produced L12-L17 (commit `2eb9220`), applied backward through foundations.

> Note: L12 already code-centric (covered by `2eb9220` "L12-L17 overhaul"). This plan covers L-1, L00, L01-L11 — everything pre-L12.

## Why

User strength = verbal fundamentals (drilled L13 traces fluently).
User weakness = complex tracing + writing code under time pressure.
Word-memorize cards in L-1 to L11 reinforce verbal recall, not code execution.
Same problem L13-L17 had pre-`2eb9220`. Same fix.

## Hard rule: zero word-memorize across whole deck

User constraint (2026-05-06):

> "word based non-code based cards are worthless imo — that's a level of abstraction and indirectness then I have to translate on the actual test"

→ **No word-memorize cards anywhere in L-1 to L11.** Every card must anchor to a code artifact:
- C++ source code
- Terminal / shell session
- Compiler error message
- File system listing

If concept can't be expressed as artifact, atom must be reframed. No exceptions for foundation levels.

## Reference commit

```
2eb9220 — Code-centric L12-L17 overhaul: 1,775 cards, zero word-memorize
- Delete 225 word-memorize cards
- Add 474 code-centric (225 trace + 159 cloze + 172 write)
- Add 82 variation walkthroughs before every trace/write
- Add 3 card types: procedural (3-streak), matrix (transfer), code-memorize (see/hide/type)
- Interleave 23 procedural + 25 matrix + 30 code-memorize per-atom
- Card order per atom: walkthrough → trace → cloze → write → procedural → matrix → code-memorize
```

Card type schemas already exist (`src/types/card.ts` after `2eb9220`). No new component work needed.

## Scope: 137 atoms

| Level | Prefix | Count | Theme |
|-------|--------|-------|-------|
| L-1 | P-01..P-07 | 7 | Process model (compile, run, exe) |
| L00 | S-01..S-10 | 10 | Setup (#include, namespace, main) |
| L01 | O-01..O-13 | 13 | Output (cout, endl, chaining) |
| L02 | V-01..V-20 | 20 | Variables, types, declarations |
| L03 | I-01..I-07 | 7 | Input (cin, prompt, read) |
| L04 | A-01..A-11 | 11 | Arithmetic + assignment |
| L05 | C-01..C-07, L-01..L-03 | 10 | Conditionals + logical |
| L06 | F-01..F-05 | 5 | Functions (call, return) |
| L07 | W-01..W-10 | 10 | While + for loops |
| L08 | H-01..H-10 | 10 | Hand-execution methodology |
| L09 | R-01..R-08 | 8 | RDS (pass-by-reference) ★ rate-determining |
| L10 | G-01..G-14 | 14 | Strings, types, formatting |
| L11 | T-01..T-12 | 12 | Structs |
| **Total** | | **137** | |

## Card delta (zero-memorize variant)

Current state L-1 to L11 (from `data/cards.json` audit):

| type | count | action |
|------|-------|--------|
| memorize | 685 | **DELETE ALL** |
| walkthrough | 254 | keep + reauthor as variation walkthroughs |
| trace/cloze/write/procedural/matrix/cmem | 0 | **ADD** |

Target distribution (per per-level template below):

| Card type | count target | notes |
|-----------|--------------|-------|
| Walkthrough | ~280 | tied to trace + write, Krashen i+1 variation |
| Trace | ~700 | weighted by atom-theme template |
| Cloze | ~550 | blank token in working artifact |
| Write | ~620 | type code/command/output from prompt |
| Procedural | ~90 | 3-streak across variants |
| Matrix | ~95 | pattern transfer |
| Code-memorize | ~140 | see → hide → type verbatim (replaces all word-memorize) |
| **Total new** | **~2,475** | |
| **Total deleted** | **685** (all memorize) | |
| **Net add** | **~1,790** | |

Bundle gzip: estimate ~500-550 KB total. Within budget for Test 2 timeline.

## Foundation reframe (no memorize exception)

Process model (L-1 P-*) and setup (L00 S-*) atoms must reframe to code artifacts:

| Atom theme | Old (word-memorize) | New (code artifact) |
|------------|---------------------|----------------------|
| L-1 P-01 source = text | "source code is text" | trace: show `hello.cpp` content → predict file extension |
| L-1 P-02 compile | "compiler makes exe" | cmem: type `g++ hello.cpp -o hello` verbatim |
| L-1 P-03 run | "OS executes exe" | trace: terminal session `./hello` → predict stdout |
| L-1 P-04 exe = machine code | "exe is binary" | cloze: `file hello` output → blank "ELF 64-bit" tokens |
| L-1 P-05 instructions execute | "CPU runs instructions" | trace: 3-line program, predict execution order |
| L-1 P-06 compile errors | "compiler reports errors" | trace: missing `;` → predict error line |
| L-1 P-07 runtime errors | "runtime errors abort" | trace: divide-by-zero → predict stderr |
| L00 S-01 `#include <iostream>` | (was memorize variants) | cmem: type the directive verbatim |
| L00 S-02 `using namespace std` | (was memorize variants) | cmem: type verbatim |
| L00 S-03 `int main() { return 0; }` | (was memorize variants) | write: type the full boilerplate from prompt |
| L00 S-04..S-10 | (other setup) | cmem + cloze (blank tokens in boilerplate) |

→ All atoms anchor to artifact. No "translate on test" overhead.

### Reframe rule

For every atom: ask "what artifact does this concept produce or appear in?"
- Concept produces code → trace + cloze + write
- Concept is an exact line → code-memorize
- Concept is a terminal command → code-memorize + trace (predict output)
- Concept is an error → trace (cause → effect)
- Concept is invisible (e.g., "CPU executes machine code") → reframe via observable artifact (terminal time, exe size, error trace)

If reframe impossible, **delete the atom** (review prereq DAG impact). User-confirmed: better to drop atom than keep word-memorize.

## Per-level template mapping

Card mix differs by atom theme — derived from L13-L17 audit (commit `2eb9220`).
Templates: **L13** = trace-heavy, **L14** = write-heavy + balanced, **L15** = no-trace input-heavy, **L16** = balanced, **L17** = mock-exam high-density.

| L | atoms | theme | template | walk/atom | trace/atom | cloze/atom | write/atom | proc/atom | matrix/atom | cmem/atom | est cards |
|---|-------|-------|----------|-----------|------------|------------|------------|-----------|-------------|-----------|-----------|
| L-1 | 7 | process model | reframed L13-lite | 1.5 | 2 | 1 | 0.5 | 0 | 0 | 1 | ~42 |
| L00 | 10 | setup boilerplate | cmem-heavy | 1 | 1 | 2 | 1.5 | 0 | 0 | 2 | ~75 |
| L01 | 13 | cout output | L16 balanced | 2 | 3 | 3 | 3 | 0.3 | 0.5 | 0.8 | ~165 |
| L02 | 20 | variables/types | L16 balanced | 2 | 4 | 4 | 3 | 0.5 | 1 | 1 | ~310 |
| L03 | 7 | cin input | **L15 no-trace** | 2.4 | 0 | 4 | 5 | 0.6 | 0.6 | 0.9 | ~95 |
| L04 | 11 | arithmetic | L13/L17 trace-heavy | 2 | 6 | 3 | 2 | 0.5 | 1 | 0.8 | ~170 |
| L05 | 10 | conditionals | L13 trace-heavy | 2 | 6 | 3 | 2.5 | 0.5 | 0.8 | 0.7 | ~155 |
| L06 | 5 | functions | L14 write-heavy | 3 | 3 | 4 | 5 | 0.4 | 0.6 | 1 | ~85 |
| L07 | 10 | loops | L13 trace-heavy | 2 | 7 | 3 | 3 | 0.5 | 1 | 0.8 | ~175 |
| L08 | 10 | hand-exec method | L13 mirror | 4 | 7 | 2 | 1.5 | 0.3 | 0 | 0.3 | ~150 |
| L09 ★ | 8 | RDS pass-by-ref | **L14+L13 hybrid (rate-determining)** | 3 | 5 | 4 | 5 | 0.8 | 1 | 1.2 | ~160 |
| L10 | 14 | strings/types | L16 balanced | 2 | 3 | 4 | 4 | 0.5 | 0.8 | 0.7 | ~210 |
| L11 | 12 | structs | **L14 mirror (Q2 backbone)** | 3 | 4 | 4 | 5 | 0.5 | 0.8 | 1 | ~220 |
| **Total** | **137** | | | **~280** | **~570** | **~440** | **~440** | **~70** | **~110** | **~140** | **~2,000** |

★ L09 (RDS) = rate-determining step per memory + Test 2 spec — 3 of 5 Qs depend on `&`. Higher density of every type.

### Template chosen by atom theme, not level number

For each atom within a level, override default if specific atom matches a different theme:

| atom subtype | override template |
|--------------|--------------------|
| input-side (cin, prompt patterns) | L15 (no trace) |
| boilerplate single-line | cmem-only |
| invariant patterns (loops, branches) | L13 (trace-heavy) |
| compositional builders (struct + function) | L14 (write-heavy) |
| reference semantics (R-* atoms) | L09-special (highest write density) |

## Per-level approach

For each level, in prereq order:

1. **Audit existing atoms** in `outlines/L<level>/*.yml` — list current memorize variants per atom
2. **Generate variation walkthroughs** — `build/gen-see-walkthroughs.cjs` style, per atom, 2 walkthroughs/atom average
3. **Generate trace cards** — apply Q-tag relevance (Q1=tracing weight high, Q2/Q3/Q4 weight via use-case)
4. **Generate cloze cards** — blank tokens in canonical_example variations
5. **Generate write cards** — pull from `worked_examples/Q*.yml` patterns where applicable
6. **Author 1 procedural drill per ~2 atoms** — multi-prompt, 3-streak, variants
7. **Author 1 matrix card per ~2 atoms** — pattern progression (e.g., int → float, single → array)
8. **Author 1 code-memorize per atom** — canonical_example as see/hide/type
9. **Delete word-memorize cards** for that atom (except foundation exceptions above)
10. **Interleave** in main deck per `card type ordering` — not standalone module
11. **Lint pass** — `npm run lint:see` + grading gates
12. **Manual sample check** — pull 5 random cards per level, verify they grade correctly

## Build pipeline

Reuse scripts from `2eb9220`:

| Script | Reuse for L-1..L11 |
|--------|---------------------|
| `build/gen-see-walkthroughs.cjs` | yes — extend atom range to include L-1..L11 |
| `build/inject-trace-walkthroughs.ts` | yes |
| `build/add-pc-me-cards.ts` | yes — procedural + code-memorize generation |
| `build/interleave-see-do.ts` | yes — already handles per-atom ordering |

New scripts likely needed:

- `build/gen-cloze-cards-foundation.ts` — atoms with simpler structures need cloze tailoring
- `build/gen-procedural-foundation.ts` — procedural drills for L-1..L08 (less natural than L13+)
- `build/audit-foundation-coverage.ts` — verify Q-tag distribution preserved

## Acceptance gates

Must pass before merging:

| Gate | Pass criterion |
|------|----------------|
| Atom count | 187 atoms across 18 levels (or documented removals) |
| Prereq DAG valid | topo-sort runs clean |
| **Word-memorize count** | **0 — across entire deck. Hard gate.** |
| Card count growth | +1,700 to +2,000 (sanity bounds) |
| Build size | ≤550 KB gzip |
| Card grading | 100 random cards × 3 verdicts each → no false negatives |
| Q-tag coverage | every Q1/Q2/Q3/Q4 atom has ≥1 trace + ≥1 write card |
| RDS atoms (L09) | ★ extra trace + write coverage — 5+ trace + 5+ write per R-atom |
| Foundation reframe | every P-* and S-* atom anchored to code/terminal artifact |
| Lint | `npm run lint:see` → 0 errors |

## Risks

| Risk | Mitigation |
|------|------------|
| Foundation atoms forced into code-centric awkwardly | Reframe table above; if impossible → delete atom |
| TraceCard fails on conceptual atoms (no real "trace") | Use terminal sessions / error messages as trace artifacts |
| Bundle bloat past 550 KB | Lazy-load levels (route-split) if size exceeds |
| Variant walkthroughs feel repetitive across 137 atoms | Vary code domain per atom (banking → game → IoT → sensor) |
| User over-drills typing without retention | Code-memorize uses streak-of-1, not race; mix with trace for context |
| Removing word-memorize breaks user's "first-pass familiarity" | Walkthrough card before every trace/write provides exposure equivalent |
| Atom deletions break prereq DAG | Run `build/topo-sort.ts` after each level batch; fail-fast on cycle |
| Test 2 deadline (May 7 / 14 / 21) | User authorized 2026-05-06 evening pre-May-7 (rest break, idle compute). Reconfigure based on real test data first. |

## Sequencing

Do **not** start until **after May 7 Test 2 sit + brain-dump**. Real test data should inform:

1. Which Q-types appeared (Q1 trace, Q2 struct, Q3 read, Q4 print, Q5 main)
2. Specific code patterns (types used, loop bounds, struct field names)
3. Difficulty calibration (where user got stuck → priority atoms for code-centric rewrite)

Without test data, a redesign here is guessing. With test data, it's targeted.

**Suggested order post-May-7** (priority by exam weight + user weakness):

1. **L09 (RDS) — 8 atoms** — rate-determining for Q3-Q5
2. **L11 (Structs) — 12 atoms** — Q2 + Q5 backbone
3. **L08 (Hand-exec) — 10 atoms** — Q1 weight high
4. **L07 (Loops) — 10 atoms** — Q4 print loops
5. **L10 (Strings) — 14 atoms** — Q2 struct fields
6. **L05 (Conditionals) — 10 atoms** — Q1 if-traces
7. **L04 (Arithmetic) — 11 atoms** — Q1 trace ops
8. **L02 (Variables) — 20 atoms** — foundation, biggest level
9. **L03 (Input) — 7 atoms** — Q3
10. **L06 (Functions) — 5 atoms** — Q3-Q5
11. **L01 (Output) — 13 atoms** — Q4
12. **L00 (Setup) — 10 atoms** — boilerplate, mostly memorize
13. **L-1 (Process model) — 7 atoms** — verbal, mostly memorize

Do levels in this order, not numeric order. RDS first because Q3-Q5 depend on it.

## Done criterion

L-1 to L11 cards mirror L13-L17 in:
- Card type distribution per template (theme-matched, not uniform)
- Per-atom card ordering (walkthrough → trace → cloze → write → procedural → matrix → code-memorize)
- Variation walkthrough authoring (Krashen i+1, real Q-context)
- Grading rigor (`normalizeLenient`, char-match, retry on final-fail)

Final state: total app = **100% code-centric across all 18 levels**. **Zero word-memorize** anywhere in deck. Every card anchored to a code artifact.

## Reference

- Commit: `2eb9220` "Code-centric L12-L17 overhaul"
- CLAUDE.md "Post-M22 Overhaul (2026-05-06)" section
- `src/types/card.ts` — schemas for procedural/matrix/code-memorize already exist
- `docs/14_see_cards_master_plan.md` — SEE half (already shipped, this plan extends DO half)
