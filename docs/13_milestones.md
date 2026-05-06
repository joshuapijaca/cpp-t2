# 13 — Milestones

23 ship-state milestones (M0–M22). M0–M11 = DO half (✅ shipped 2026-05-04). M12–M17 = SEE v1 (✅ shipped 2026-05-05). M18–M22 = SEE gap-fill (pending). Each milestone = useful student-facing capability OR significant infrastructure unlock. Each ends in a halt-point requiring explicit user "go" before next milestone begins.

**Not phases. Not sprints. Not deadlines.** Milestones = "the app does X end-to-end." Pacing irrelevant; integrity per milestone is what matters.

---

## Milestone Map (Critical Path)

```
M0 ✅ Spec Lock
   ↓
M1 ─ Scaffold + MemorizeCard       ← validates infrastructure
   ↓
M2 ─ AI Pipeline + L9 Cards         ← validates content gen
   ↓
M3 ─ RDS Drill MVP                  ← first usable student capability (drill `&`)
   ↓
M4 ─ TraceCard + L13                ← second component (variable-box UX)
   ↓
M5 ─ Q1 Sims                        ← Q1 trainable end-to-end
   ↓
M6 ─ WriteCard + L14 (struct)       ← third component (3-level scaffold)
   ↓
M7 ─ L15 + L10 + L12 (Q3)           ← Q3 trainable
   ↓
M8 ─ L16 (Q4)                       ← Q4 trainable
   ↓
M9 ─ Foundation Backfill + MCQCard   ← full 0→1 path open
   ↓
M10 ─ Mock Exams (L17)              ← exam-rehearsal capable
   ↓
M11 ─ Polish + Deploy                ← shippable to dist/
   ↓
   ── DO half complete (1,159 cards live) ──
   ↓
M12 ─ SEE schema + DemoCard           ← 4th SEE-half foothold (3 new types declared, demo render only)
   ↓
M13 ─ DecomposeCard                   ← multi-select recognition component
   ↓
M14 ─ WalkthroughCard                 ← per-line annotated reveal component
   ↓
M15 ─ Author SEE outline fields       ← 187 atoms + 18 walkthroughs + 40 worked examples
   ↓
M16 ─ Generate + interleave SEE       ← ~892 cards merged into cards.json with per-atom SEE-DO order
   ↓
M17 ─ Acceptance + final polish        ← all SEE acceptance gates + bundle re-budget + deploy
   ↓
   ── SEE v1 complete (1,629 cards live) ──
   ↓
M18 ─ Q-Context SEE Cards               ← exam-framed demos for 126 C-tagged atoms (~260 cards)
   ↓
M19 ─ Redistribute Worked Examples       ← spread 40→~70 worked examples across all Q-skill atoms
   ↓
M20 ─ Expand Read-Predict               ← author expected_output for 49+ atoms; 61→150+ predict cards
   ↓
M21 ─ Purpose-Author Decompose Snippets ← replace 115 fallback snippets with multi-atom blocks
   ↓
M22 ─ P-Atom + ME-Atom Mini-SEE         ← 12 zero-snippet atoms get SEE coverage
```

Forward-only milestone progression. No backward jumps unless a discovered failure forces outline revision per CONTRIBUTING.md.

---

## M0 — Spec Lock ✅ COMPLETE

**State**: Source-of-truth committed.

**Deliverables (done)**:
- Governance: CLAUDE.md, MISSION.md, ANTIPATTERNS.md, CHANGELOG.md, CONTRIBUTING.md
- Specs: 12 files in `docs/` (audits, mastery state, atom DAG, outline schema, extraction protocol, prereq algorithm, build outline, UX/UI, this milestones doc)
- Outlines: 8 R-atom drafts at `outlines/L09/R-01..R-08.yml`
- Extraction: `extraction/L09_RDS_passbyref/{pfg_quotes,code_examples,notes}.md`
- Reorg: `cpp-t2/` active, `_legacy_apps/it-elo/` archived

**Acceptance**: ✓ all governance + specs + L9 extraction in repo.

**Ship state**: planning complete; no app yet.

**Halt-point**: ✓ already passed (user authorized milestone planning move).

---

## M1 — Scaffold + MemorizeCard

**Goal**: working app skeleton renders 5 hardcoded memorize cards in browser.

**Deliverables**:
- `package.json` + lock file
- Vite 5 + React 19 + TypeScript 5 + Tailwind v4 wired
- `tsconfig.json` strict mode
- `tailwind.config.ts` dark mode default + design tokens per [docs/12_ux_ui_design.md](12_ux_ui_design.md)
- `src/types/card.ts` discriminated union
- `src/lib/grading.ts` char-match + keyChecks
- `src/components/MemorizeCard.tsx` (race + recall mode, flashSeconds, retry-once)
- `src/components/ProgressBar.tsx`
- `src/pages/Sequence.tsx` linear iterator
- `src/styles/{globals,semantic}.css`
- 5 hardcoded test cards inline (one per R-01..R-05)
- `npm run dev` opens at `localhost:5173`

**Acceptance Criteria**:
- [ ] Dev server starts without error
- [ ] Page loads under 1s on localhost
- [ ] All 5 cards advance via Enter or click
- [ ] Char-match grading triggers pass/fail visual feedback
- [ ] Wrong answer shows explanation + retry once
- [ ] Dark mode visible (`#0a0a0a` bg, `#39ff14` accent)
- [ ] No `fetch()` calls runtime
- [ ] No `localStorage` calls runtime
- [ ] Bundle dev-built <2MB (loose budget at this stage)
- [ ] `tsc --noEmit` clean

**Risks**:
- Tailwind v4 config edge cases
- Semantic CSS layer interactions with Tailwind
- React 19 + TypeScript strict mode friction

**Ship state**: developer can demo a 5-card flow. Student cannot yet learn anything new (cards are placeholders).

**Halt-point**: user reviews demo; authorizes M2 or directs UX iteration.

**Authorization required to begin**: yes ("go M1").

---

## M2 — AI Pipeline + L9 Cards

**Goal**: 8 locked R-outlines → 40 generated memorize cards rendered in app.

**Deliverables**:
- `build/generate-cards.ts` script using `@anthropic-ai/sdk` (devdep)
- Prompt template per card type (memorize-only at this milestone)
- Outline loader (yaml.load + status filter)
- Variant dedup by content hash
- `data/cards.json` build output (~40 cards from 8 atoms × 5 memorize variants)
- `build/lint-cards.ts` Miller's-law check (≤7 words) + forbidden-token check
- `npm run gen` runnable
- Sequence.tsx loads `data/cards.json` instead of hardcoded
- R-01..R-08 outlines status flipped from `draft` → `locked`
- CHANGELOG entry: outline lock confirmation

**Acceptance Criteria**:
- [ ] All 8 outlines `status: locked`
- [ ] AI gen produces ~40 cards, no duplicates
- [ ] Lint pass: every memorize card ≤7 words
- [ ] Lint pass: no forbidden tokens (nullptr, ->, etc.) per outline lint rules
- [ ] Cards render in Sequence.tsx
- [ ] User reads through 40 cards; reports content quality
- [ ] AI generation reproducible (re-run produces same hash via prompt cache)

**Risks**:
- AI hallucinations in fact paraphrases
- Content drift from outline acceptance criteria → tighten prompts
- Anthropic API failure mid-generation → retry + cache check

**Ship state**: student can drill 8 RDS atoms via 40 memorize cards. Foundational concept (`&`) drillable for first time.

**Halt-point**: user uses cards; reports qualitative findings on content + UX.

**Authorization required to begin**: yes ("go M2").

---

## M3 — RDS Drill MVP

**Goal**: usable student-facing app that teaches pass-by-reference end-to-end via memorize cards only.

**Deliverables**:
- Iteration on outline schema based on M2 findings (if needed)
- Iteration on AI prompts (if needed)
- Iteration on MemorizeCard UX (if needed)
- Lock outline + prompt + component v1
- CHANGELOG entry: pipeline v1 locked
- Updated `cpp-t2/CLAUDE.md` if any architectural decision changed

**Acceptance Criteria**:
- [ ] User completes full 40-card drill in one session
- [ ] User reports they have learned the 8 R-atoms (subjective: feel they could explain `&` to someone else)
- [ ] No critical UX blockers reported
- [ ] No critical content errors (factually wrong cards)
- [ ] Outline schema considered stable (no further structural changes anticipated)
- [ ] Pipeline locked: same outline → same cards → same render

**Risks**:
- Found UX problem requiring component refactor
- Found content gap requiring outline addition (e.g., new R-09)

**Ship state**: app teaches RDS. Useful for SIT102 students struggling with `&` specifically. Roughly 25% of Q1 + 50% of Q3 + 50% of Q4 mark in scope.

**Halt-point**: user authorizes M4 OR pauses for outline revision.

**Authorization required to begin**: yes ("go M3").

---

## M4 — TraceCard + L13 Hand-Execution

**Goal**: variable-box history strip working; L13 (HE-1..HE-18) extracted + locked + cards generated.

**Deliverables**:
- `extraction/L13_hand_execution/` with `pfg_quotes.md`, `code_examples.cpp`, `notes.md`
- `outlines/L13/HE-01.yml` … `HE-18.yml` locked
- `src/components/TraceCard.tsx` per [06](06_audit_it_elo_t1_apk.md) schema (variable-box history strip + terminal panel + two-pass + Teach Me)
- `src/styles/semantic.css` extended: `.variable-history`, `.step-box--current`, `.terminal-line`
- `build/compile-check.ts` (g++ syntax check on expected C++ snippets)
- `build/generate-cards.ts` extended for trace card type
- 6 trace cards per HE atom = 108 trace cards
- 5 memorize variants per HE atom = 90 memorize cards
- Total ~198 new cards added to `data/cards.json`

**Acceptance Criteria**:
- [ ] Compile-check 100% pass on all expected C++ snippets
- [ ] Variable-box renders with strikethrough history
- [ ] Reference atoms (R-08-style) show ONE box with TWO labels
- [ ] Terminal panel separate from variable boxes
- [ ] Two-pass mode: same code, full trace + partial-stop both gradeable
- [ ] Inline condition viz (`i < 5 → true`) renders next to tested variable
- [ ] Teach Me panel shows on fail; retry-once
- [ ] All 18 HE outlines locked
- [ ] Lint pass on all trace cards

**Risks**:
- Variable-box UX harder than expected → first non-trivial component
- C++ compile-check toolchain (g++ availability) on Windows
- Two-pass schema edge cases

**Ship state**: student can hand-trace pass-by-ref code. Q1 capability ~70% complete.

**Halt-point**: user runs hand-trace drills; reports UX + content quality.

**Authorization required to begin**: yes ("go M4").

---

## M5 — Q1 Sims (15 Variants + Two-Pass)

**Goal**: Q1 (`who_am_i` hand-trace) fully drillable across 15 entity variants.

**Deliverables**:
- `extraction/test2_bank/Q1_who_am_i_variants.md` populated (5 known + 10 generated variants)
- 15 Q1 sim cards generated (full trace + partial-stop pairs = 30 graded units)
- Sequence.tsx renders sim section after L13 atomic drilling
- Acceptance gate added: "all Q1 atoms marked C must produce ≥1 sim card"

**Acceptance Criteria**:
- [ ] 15 Q1 variants render
- [ ] Each variant has full + partial-stop pass
- [ ] Each variant compile-checked
- [ ] User completes ≥1 mock Q1 cold without prior practice on that variant
- [ ] User reports Q1 readiness subjective ≥7/10

**Risks**:
- Variant generation produces trivially similar cards → tighten dedup
- Test 2 grader expectation differs from PFG → flag in notes

**Ship state**: Q1 trainable end-to-end. ~25% of exam mark in scope.

**Halt-point**: user takes Q1 mock; reports findings.

**Authorization required to begin**: yes ("go M5").

---

## M6 — WriteCard + L14 Struct (Q2)

**Goal**: 3-level code-write scaffold working; struct-write (Q2) drillable.

**Deliverables**:
- `extraction/L14_struct_write/` populated
- `outlines/L14/SW-01.yml` … `SW-05.yml` locked
- `extraction/L11_structs/` populated (Q2 prereqs)
- `outlines/L11/T-01.yml` … `T-12.yml` locked
- `src/components/WriteCard.tsx` (3-level: fill / complete / free)
- `build/generate-cards.ts` extended for write card type
- ~5 atoms × 8 cards = 40 SW cards
- ~12 atoms × 13 cards = ~156 T cards (memorize + write L1/L2/L3)
- Q2 sims: 15 variants × 8 cards each (3 fill + 3 complete + 2 free) = 120 cards
- Total ~316 new cards

**Acceptance Criteria**:
- [ ] WriteCard L1/L2/L3 progression works (must pass each level before next)
- [ ] All struct atoms produce compileable expected answers
- [ ] User completes 5 Q2 mock variants; reports ≥80% pass rate
- [ ] keyChecks token presence + forbidden-token absence enforced
- [ ] Lint pass: SIT102 idiom enforcement (e.g., `string` not `std::string`)

**Risks**:
- Code-write grading false negatives (whitespace / syntax tolerance edge cases)
- L11 (struct) prereqs harder to extract (PFG part 2.3)

**Ship state**: Q2 trainable. ~50% of exam mark in scope (Q1 + Q2).

**Halt-point**: user takes Q2 mock; reports findings.

**Authorization required to begin**: yes ("go M6").

---

## M7 — L15 + L10 + L12 Read-Function (Q3)

**Goal**: Q3 (`void read_X(X &list[], int count)`) drillable.

**Deliverables**:
- `extraction/L10_arrays/` populated (Q3 prereq)
- `outlines/L10/G-01.yml` … `G-14.yml` locked
- `extraction/L12_pass_composites/` populated (Q3 prereq)
- `outlines/L12/PC-01.yml` … `PC-06.yml` locked
- `extraction/L15_read_function/` populated
- `outlines/L15/RW-01.yml` … `RW-07.yml` locked
- ~14 + 6 + 7 atoms × cards = ~290 new cards (memorize + write 3-level)
- Q3 sims: 15 variants × 8 cards = 120 cards
- Total ~410 new cards

**Acceptance Criteria**:
- [ ] `&array[]` SIT102 idiom enforced (no `*array`)
- [ ] All Q3 atoms produce compileable expected answers
- [ ] User completes 5 Q3 mock variants; reports ≥80% pass rate
- [ ] PC-04 (`&list[]` array param) drilled deeply

**Risks**:
- `&array[]` syntax not in PFG → relies on Test 2 evidence only
- L12 composites cover struct-by-ref + array-by-ref combinations → dependency chain edge cases

**Ship state**: Q3 trainable. ~75% of exam mark in scope.

**Halt-point**: user takes Q3 mock; reports findings.

**Authorization required to begin**: yes ("go M7").

---

## M8 — L16 Main (Q4)

**Goal**: Q4 (`main()` with const MAX + array + cin + Q3 call + printf loop) drillable.

**Deliverables**:
- `extraction/L00_source_skeleton/` populated (Q4 prereq: `int main`, `return 0`, etc.)
- `outlines/L00/S-01.yml` … `S-10.yml` locked
- `extraction/L01_output/` populated (Q4 prereq: printf format specifiers)
- `outlines/L01/O-01.yml` … `O-13.yml` locked
- `extraction/L03_input/` populated (Q4 prereq: cin)
- `outlines/L03/I-01.yml` … `I-07.yml` locked
- `extraction/L16_main_write/` populated
- `outlines/L16/MW-01.yml` … `MW-09.yml` locked
- ~10 + 13 + 7 + 9 atoms × cards = ~390 new cards
- Q4 sims: 15 variants × 8 cards = 120 cards
- Total ~510 new cards

**Acceptance Criteria**:
- [ ] `printf` (not `cout`) used per SIT102 idiom in Q4 outputs
- [ ] `.c_str()` for string→%s lint-enforced
- [ ] User completes 5 Q4 mock variants; reports ≥80% pass rate

**Risks**:
- `.c_str()` is subtle; AI may generate cards omitting it
- Q4 ties together Q3 (read function call) — caller-side correctness depends on prior milestones

**Ship state**: Q4 trainable. **All 4 questions trainable.** ~100% of exam mark in scope.

**Halt-point**: user takes full 4-question mock; reports findings.

**Authorization required to begin**: yes ("go M8").

---

## M9 — Foundation Backfill + MCQCard

**Goal**: full 0→1 path open; foundational levels (L-1 through L8) drillable; MCQ component built.

**Deliverables**:
- `extraction/L-1_pre_programming/` populated
- `outlines/L-1/P-01.yml` … `P-07.yml` locked
- `extraction/L02_variables_types/` populated
- `outlines/L02/V-01.yml` … `V-20.yml` locked
- `extraction/L04_operators/` populated
- `outlines/L04/A-01.yml` … `A-11.yml` locked
- `extraction/L05_comparison_logical/` populated
- `outlines/L05/C-01.yml` … `L-03.yml` locked
- `extraction/L06_conditionals/` populated
- `outlines/L06/F-01.yml` … `F-05.yml` locked
- `extraction/L07_loops/` populated
- `outlines/L07/W-01.yml` … `W-10.yml` locked
- `extraction/L08_functions_basic/` populated
- `outlines/L08/H-01.yml` … `H-10.yml` locked
- `src/components/MCQCard.tsx` (4 options, 1 correct, distractor explanations)
- ~7 + 20 + 11 + 10 + 5 + 10 + 10 atoms × cards = ~750 new cards
- Total ~750 new cards

**Acceptance Criteria**:
- [ ] Full Level -1 to Level 16 sequence playable from start
- [ ] Student with zero C++ knowledge can begin at Level -1 and progress to Level 16
- [ ] MCQ ratio remains ≤20% of total cards
- [ ] All atom dependency closures resolve (every dep in earlier or same level)
- [ ] Topo sort produces deterministic ordered_ids.json

**Risks**:
- Foundation atoms easy individually, voluminous in aggregate → fatigue in audit
- MCQCard simplest component but distractor-quality dependent on outline misconceptions

**Ship state**: full 0→1 path. Student can complete everything from "computer runs programs" to writing main().

**Halt-point**: user does a clean run from L-1 → L16; reports completeness gaps.

**Authorization required to begin**: yes ("go M9").

---

## M10 — Mock Exams (L17)

**Goal**: 5 full mock exams runnable with 90-min timer.

**Deliverables**:
- `extraction/L17_mock_exam/` populated with 5 full exam variants
- `outlines/L17/ME-01.yml` … `ME-05.yml` locked
- ~5 atoms × 5 cards = 25 mock-exam cards (each = full Q1+Q2+Q3+Q4)
- Mock exam timer UI in Sequence.tsx (90-min countdown)
- Per-question hand-grade summary at end
- Final score display

**Acceptance Criteria**:
- [ ] Timer counts down from 90:00 accurately
- [ ] No-hint mode (Teach Me disabled during timed exam)
- [ ] All 4 questions present per mock variant
- [ ] Final grade computed: per-Q char-match against expected answer
- [ ] User completes ≥3 of 5 mocks at ≥75% before claim "exam-ready"

**Risks**:
- Timer interferes with focus → keep minimal (small countdown corner)
- Mock answers may have multiple valid forms → keyChecks + multi-correct regex

**Ship state**: exam-rehearsal capable. App is fully usable for SIT102 Test 2 prep.

**Halt-point**: user takes ≥1 timed mock; reports timer + grading UX.

**Authorization required to begin**: yes ("go M10").

---

## M11 — Polish + Deploy

**Goal**: production-ready static site at `dist/`.

**Deliverables**:
- `build/order-atoms.ts` per [10](10_prereq_ordering_algorithm.md)
- All 10 acceptance gates per [11](11_build_outline.md) implemented and passing
- Bundle <500 KB gzip
- `dist/` audited: no `fetch()`, no `localStorage.setItem`, no `localStorage.getItem`
- README at root (deployment instructions)
- Optional: GitHub Pages / Netlify config

**Acceptance Criteria**:
- [ ] All 10 acceptance gates pass
- [ ] Bundle size <500 KB gzip
- [ ] `tsc --noEmit` clean
- [ ] Vite build produces error-free dist/
- [ ] dist/ runs offline via `file://` (no network calls)
- [ ] Open dist/index.html in fresh browser → student can complete full sequence
- [ ] No `console.error` in browser devtools during 5-card sample

**Risks**:
- Bundle size creep from cards.json (~2 MB raw)
- Late-discovered acceptance gate failure forces rework

**Ship state**: production. dist/ deployable to any static host or runs offline.

**Halt-point**: user confirms shipped state; project enters maintenance.

**Authorization required to begin**: yes ("go M11").

---

## Cross-Cutting Tracks

These run inside milestones, not separately. Listed for clarity.

### Infrastructure Track

| Milestone | Infrastructure unlocked |
|-----------|------------------------|
| M1 | Vite + React + TS + Tailwind + 1 component + grading + Sequence |
| M2 | AI gen pipeline + lint + outlines |
| M4 | Compile-check + 2nd component |
| M6 | 3rd component (Write 3-level) |
| M9 | 4th component (MCQ) |
| M11 | Topo sort + acceptance gates + deploy |
| M12 | 5th component (Demo) + SEE union extension |
| M13 | 6th component (Decompose) |
| M14 | 7th component (Walkthrough) |
| M16 | 5 SEE generators + interleave script |
| M17 | SEE acceptance gates + bundle re-budget |

### Content Track

| Milestone | Levels covered |
|-----------|----------------|
| M2-M3 | L9 (RDS) |
| M4-M5 | + L13 (hand-exec) |
| M6 | + L14 (struct write), L11 (structs) |
| M7 | + L10, L12, L15 (arrays, composites, read fn) |
| M8 | + L00, L01, L03, L16 (skeleton, output, input, main) |
| M9 | + L-1, L02, L04, L05, L06, L07, L08 (foundation) |
| M10 | + L17 (mock exam) |

By M9, all 18 levels have outlines. M10 adds mock-exam composites only.

### UX Track

| Milestone | UX learning |
|-----------|-------------|
| M1 | Memorize-card flow validated |
| M3 | Iteration on memorize UX |
| M4 | Variable-box hand-trace UX validated |
| M6 | 3-level code-write UX validated |
| M9 | MCQ UX validated |
| M10 | Timer UX validated |
| M11 | Final polish |

---

## Rollback Policy

If a milestone reveals a spec problem (e.g., M3 user reports memorize cards too short to convey concept):

1. Halt milestone progression
2. Open issue in CHANGELOG: "M-X discovered Y; proposing Z"
3. Update outline schema OR component OR atom set per [CONTRIBUTING.md](../CONTRIBUTING.md) re-litigation protocol
4. Re-run prior milestone's acceptance to confirm fix doesn't break earlier work
5. Resume milestone from where halt occurred

**Do not "fix forward"** — fix the root cause in the affected milestone scope.

---

## Anti-Drift Rules (Milestone Discipline)

| Rule | Why |
|------|-----|
| One milestone in progress at a time | Per ANTIPATTERNS #15 (no quiet re-litigation); focus discipline |
| Milestone scope frozen at start | No mid-milestone scope creep; new ideas → next milestone |
| Acceptance criteria objective + measurable | Subjective "feels good" insufficient; needs check items |
| Halt-point requires explicit user "go" | Per CONTRIBUTING.md authorization protocol |
| CHANGELOG entry per milestone completion | Append-only log of progression |
| No skipping milestones | Even "obvious" milestones (e.g., M2 if M1 went well) require explicit go |
| No combining milestones | M1+M2 in one move = scope creep; halt-point lost |

---

## M12 — SEE Schema + DemoCard

**Goal**: 3 new card types declared in TS union; `DemoCard.tsx` renders 5 hardcoded demo cards (R-01..R-05) end-to-end.

**Deliverables**:
- `src/types/card.ts` extended → `Card = … | DemoCard | DecomposeCard | WalkthroughCard`
- `src/types/card.ts` interfaces per [docs/14 §3](14_see_cards_master_plan.md): `DemoCard`, `DecomposeCard`, `WalkthroughCard`
- `src/components/DemoCard.tsx` per [docs/14 §"demo card UX"](14_see_cards_master_plan.md): code block + highlight tokens + "why" + "used in" + space-to-advance
- `src/styles/semantic.css` → `.demo-*` classes (`.demo-code`, `.demo-highlight`, `.demo-meta`, `.demo-why`, `.demo-used-in`)
- 5 hardcoded demo cards inline in `Sequence.tsx` for verification (one per R-01..R-05)
- `Sequence.tsx` switch extended for `card.type === 'demo'`
- ANTIPATTERNS.md #7 updated (4-cap → 7-cap) ✓ done 2026-05-04
- MISSION.md card-type cap updated ✓ done 2026-05-04
- CHANGELOG entry: M12 ship

**Acceptance Criteria**:
- [ ] `tsc --noEmit` clean with extended union
- [ ] Hardcoded 5 demo cards render via `Sequence.tsx`
- [ ] Highlight tokens display with accent color (`--color-accent`)
- [ ] Space key advances; no grading
- [ ] Card header shows `L9 · Pass-by-reference · R-XX · demo`
- [ ] No `fetch()` runtime calls
- [ ] `npm run build` clean

**Risks**:
- Highlight-token substring matching may collide with overlapping tokens → render order matters
- 7-type cap touches MISSION + ANTIPATTERNS — verified updated before code lands

**Ship state**: 4 SEE component types declared (1 of 3 implemented). Student sees first observation-mode card. No content beyond 5 placeholders.

**Halt-point**: user reviews 5-card demo flow; authorizes M13 OR directs UX iteration.

**Authorization required to begin**: yes ("go M12").

---

## M13 — DecomposeCard

**Goal**: multi-select recognition component working; 5 hardcoded decompose cards demoable.

**Deliverables**:
- `src/components/DecomposeCard.tsx` per [docs/14 §"decompose card UX"](14_see_cards_master_plan.md)
- Checklist UX: keyboard-toggle options (1–8 keys), enter to submit
- Grader: exact-set match `selectedAtomIds === correctAtomIds` (set equality)
- Retry-once on miss, then advance with explanation
- `src/styles/semantic.css` → `.decompose-*` classes
- 5 hardcoded decompose cards in `Sequence.tsx` for verification
- `Sequence.tsx` switch extended for `card.type === 'decompose'`

**Acceptance Criteria**:
- [ ] Multi-select toggles via 1–8 keys + click
- [ ] Enter submits; exact-set grade
- [ ] Wrong → explanation + retry once
- [ ] keyboard-only path works (no mouse required)
- [ ] `tsc --noEmit` clean

**Risks**:
- Set-equality grader edge cases (duplicate atom IDs in options)
- Distractor-quality dependent on hand-authored options (M15)

**Ship state**: 2 of 3 SEE components implemented.

**Halt-point**: user reviews; authorizes M14.

**Authorization required to begin**: yes ("go M13").

---

## M14 — WalkthroughCard

**Goal**: per-line annotated reveal component; 3 hardcoded walkthrough cards demoable (one per L0/L4/L9).

**Deliverables**:
- `src/components/WalkthroughCard.tsx` per [docs/14 §"walkthrough card UX"](14_see_cards_master_plan.md)
- Static full-code panel + sequential annotation reveal
- Space → reveal next step; up to N steps; final space → advance
- `src/styles/semantic.css` → `.walkthrough-*` classes
- Active line gets `--color-accent` outline border
- 3 hardcoded walkthroughs in `Sequence.tsx` for verification
- `Sequence.tsx` switch extended for `card.type === 'walkthrough'`

**Acceptance Criteria**:
- [ ] Code panel visible from start
- [ ] Steps reveal one at a time on space
- [ ] Active line highlights accent
- [ ] Final step → advance on space
- [ ] `tsc --noEmit` clean

**Risks**:
- Long walkthroughs (10+ steps) may fatigue → cap step count at 12
- Active-line highlight on multi-line code blocks: scroll vs. anchor decision

**Ship state**: 3 of 3 SEE components implemented. Hardcoded smoke tests only; no real content.

**Halt-point**: user reviews 3-walkthrough demo; authorizes M15.

**Authorization required to begin**: yes ("go M14").

---

## M15 — Author SEE Outline Fields (187 atoms + 18 walkthroughs + 40 worked examples)

**Goal**: every atom outline gets `see_demo` + `see_decompose` fields; 18 level walkthroughs authored; 40 Q-archetype worked examples authored.

**Deliverables**:
- All 187 outlines in `outlines/L*/` extended with `render_hints.see_demo` + `render_hints.see_decompose` per [docs/14 §"Outline Schema"](14_see_cards_master_plan.md)
- `outlines/walkthroughs/L-1.yml … L17.yml` — 18 level walkthroughs
- `outlines/worked_examples/Q1.yml … Q4.yml` — 40 Q-archetype examples (10 per Q)
- `whyOneLine` hand-authored per atom
- Auto-derive `highlights` + `correctAtoms` from existing `canonical_example` + `q_tags` where possible
- `outlines/*/*.yml` schema updated in [docs/08_outline_spec.md](08_outline_spec.md)

**Acceptance Criteria**:
- [ ] All 187 atoms have `see_demo.why_one_line`
- [ ] All 187 atoms have `see_demo.snippet` (or fallback flagged)
- [ ] All 187 atoms have `see_decompose.snippet` + `correct_atoms`
- [ ] 18 walkthroughs locked
- [ ] 40 worked examples locked
- [ ] Lint pass: every `correct_atoms` ID resolves to a known atom
- [ ] Lint pass: every `highlights` token is a substring of `snippet`

**Risks**:
- 187 × hand-authored `whyOneLine` is voluminous → batch by level, audit per level
- L-1 axiom atoms may have no code → flag as `see_demo: null` and skip generation

**Ship state**: SEE content authored end-to-end but not yet rendered as cards.

**Halt-point**: user spot-audits SEE outline quality; authorizes M16.

**Authorization required to begin**: yes ("go M15").

---

## M16 — Generate SEE Cards + Interleave with DO

**Goal**: SEE outlines → ~892 cards merged into `data/cards.json`; per-atom order is `[demo, decompose, memorize×N, write/trace×N]`.

**Deliverables**:
- `build/gen-see-demo-cards.ts` — outline → demo cards
- `build/gen-see-decompose-cards.ts` — outline → decompose cards
- `build/gen-see-walkthroughs.ts` — walkthrough YAML → walkthrough cards
- `build/gen-see-worked-examples.ts` — worked-example YAML → demo-style cards
- `build/gen-see-read-predict.ts` — strategic prediction insertion
- `build/interleave-see-do.ts` — reorder cards.json: per-atom SEE before DO
- `build/lint-cards.ts` extended:
  - `decompose`: `correctAtomIds` ⊆ `atomOptions.id`
  - `demo`: every `highlightTokens` ⊆ `demoCode` substrings
  - `walkthrough`: every step `atomIds` resolves
- `npm run gen` regenerates full deck (~2,051 cards)

**Acceptance Criteria**:
- [ ] `data/cards.json` grows to ~2,051 cards (~892 SEE added)
- [ ] Per-atom order verified: first card per atom is `demo`, second `decompose`, then DO
- [ ] All SEE lints pass
- [ ] Bundle <500 KB gzip (likely needs split or compression)
- [ ] `tsc --noEmit` clean
- [ ] User completes 1 full level (e.g., L9) end-to-end with SEE+DO interleave; reports flow quality

**Risks**:
- Bundle size breach → may need on-demand chunk loading per level
- Ordering edge cases (atoms with no canonical_example skipped)

**Ship state**: SEE+DO deck shipped; full top-down + bottom-up loop active per atom.

**Halt-point**: user runs L9 + L13 with new flow; reports findings.

**Authorization required to begin**: yes ("go M16").

---

## M17 — Acceptance + Final Polish

**Goal**: all SEE acceptance gates per [docs/14 §"Acceptance Gates"](14_see_cards_master_plan.md) pass; bundle re-budgeted; deploy.

**Deliverables**:
- All [docs/14](14_see_cards_master_plan.md) gates implemented and passing:
  - All atoms with code have demo
  - Decompose `correctAtomIds` ⊆ options
  - Demo highlights are substrings
  - Walkthrough atomIds resolve
  - Per-atom SEE-DO interleave
  - Card-type ratio target met
  - Bundle <500 KB gzip (or chunked alternative)
- `dist/` rebuilt + audited (no fetch / no localStorage)
- README updated: "DO + SEE half shipped"
- CHANGELOG: M12-M17 ship entries

**Acceptance Criteria**:
- [ ] All acceptance gates pass
- [ ] User completes 1 full timed mock with SEE+DO interleave; reports readiness ≥7/10
- [ ] Bundle size budget met (or documented alternative)
- [ ] No regressions on M11 acceptance criteria
- [ ] `tsc --noEmit` clean

**Risks**:
- Late-discovered acceptance failure forces M16 rework
- SEE volume may impair sprint pacing → user feedback gates final ratio

**Ship state**: full project shipped. ~2,051-card deck with 7 retention mechanisms active. dist/ deployable.

**Halt-point**: user confirms shipped state; project enters maintenance.

**Authorization required to begin**: yes ("go M17").

---

## M18 — Q-Context SEE Cards (~260 cards)

**Goal**: every C-tagged atom (used in exam questions) gets a Q-framed demo card showing that atom in exam context — "see this concept the way it appears on the test."

**Background**: 126 unique atoms carry at least one `q_tags: { Qn: C }` flag. Current SEE cards show atoms in isolation. Q-context cards frame the same snippet through the lens of "you'll see this in Q1/Q2/Q3/Q4" with exam-style code and exam-oriented whyOneLine. Approximately 2 cards per atom (one per distinct Q if multi-tagged).

**Deliverables**:
- `build/gen-see-q-context.ts` — reads outlines, filters atoms with `q_tags` containing `C`, emits demo-type cards with Q-framed whyOneLine (e.g., "In Q2 you'll need to write this struct — watch how fields are declared")
- Multi-Q atoms get one card per distinct Q tag (atom tagged Q1+Q3 → 2 cards)
- Output: `data/see-q-context-cards.json` (~260 cards)
- `build/interleave-see-do.ts` updated to ingest Q-context cards
- Interleave position: after standard demo, before decompose (per-atom order becomes `[demo, q-context-demo, decompose, memorize×N, write/trace×N]`)
- `package.json` script: `gen:see-q-context`
- `npm run gen:see` chain updated to include Q-context step

**Acceptance Criteria**:
- [ ] 126 C-tagged atoms each have ≥1 Q-context demo card
- [ ] Multi-Q atoms produce N cards (one per distinct Q)
- [ ] Total Q-context cards ≈ 260 (±20)
- [ ] whyOneLine references specific Q number ("In Q3…")
- [ ] highlightTokens are substrings of demoCode (lint pass)
- [ ] Per-atom interleave order preserved (demo → q-context → decompose → DO)
- [ ] `npm run lint:see-cards` passes
- [ ] Bundle remains <500 KB gzip
- [ ] `tsc --noEmit` clean

**Risks**:
- Overlap with existing demo cards for same atom — differentiate via Q-framing in whyOneLine
- Bundle growth (~260 cards × ~300 bytes = ~78 KB raw JSON) — monitor gzip delta

**Ship state**: every exam-relevant atom has Q-context priming. Student sees atoms in exam frame before drilling.

**Halt-point**: user spot-checks 5 Q-context cards from different Q numbers; authorizes M19.

**Authorization required to begin**: yes ("go M18").

---

## M19 — Redistribute Worked Examples Across Q-Skill Atoms

**Goal**: expand worked-example coverage from 4 anchor atoms (HE-01, SW-01, RW-01, MW-01) to all Q-skill atoms, redistributing the "see how a full answer comes together" perspective.

**Background**: current 40 worked examples (10 per Q) are all anchored to the first atom of each Q-level. This means HE-01 has 12 demo cards, SW-01 has 12, RW-01 has 12, MW-01 has 11 — while other atoms in those levels get zero worked-example exposure. Goal: spread worked examples so each Q-skill atom has ≥1 worked-example demo card anchored to it.

**Deliverables**:
- Audit Q-skill atom population per level:
  - L13 (Q1): HE-01..HE-05 = 5 atoms
  - L14 (Q2): SW-01..SW-07 = 7 atoms
  - L15 (Q3): RW-01..RW-05 = 5 atoms (+ read_X composites)
  - L16 (Q4): MW-01..MW-06 = 6 atoms (+ main composites)
- Author new worked examples in `outlines/worked_examples/` or extend existing Q1-Q4 files
- Each Q-skill atom gets ≥1, ≤3 worked-example demo cards anchored to it
- `build/gen-see-worked-examples.ts` updated: anchor to per-example `atom_id` field (not hardcoded Q_ANCHOR map)
- Total worked-example count grows from 40 → ~60-80

**Acceptance Criteria**:
- [ ] Every Q-skill atom (HE-*, SW-*, RW-*, MW-*) has ≥1 worked-example card anchored to it
- [ ] No single atom has >3 worked-example cards (prevent clustering)
- [ ] Worked examples still cover all 4 question types
- [ ] Generator updated to use per-example atom_id
- [ ] Lint passes on all new cards (highlights ⊆ code)
- [ ] Interleave order preserved
- [ ] `tsc --noEmit` clean

**Risks**:
- Authoring 20-40 new worked examples is substantial content work
- Quality variance across examples — each must show a complete answer arc

**Ship state**: worked-example coverage uniform across all Q-skill atoms. No orphan Q atoms.

**Halt-point**: user reviews 3 newly-anchored worked examples; authorizes M20.

**Authorization required to begin**: yes ("go M19").

---

## M20 — Expand Read-Predict Cards (Author expected_output)

**Goal**: author `expected_output` for atoms that have `canonical_example` but lack output, then re-run read-predict generator to reach ~200 prediction cards (up from 61).

**Background**: `gen-see-read-predict.ts` produces prediction-framed demo cards. Currently only 61 atoms have `canonical_example` (the generator source). Of those, only ~12 also have `expected_output`. The "predict what this outputs" framing is far more cognitively engaging than "read this code" framing. Authoring `expected_output` for 49 remaining atoms unlocks the stronger prediction frame. Additionally, backfilling `canonical_example` for more atoms (beyond the 12 with zero snippet) could push count toward ~150-200.

**Deliverables**:
- Audit: which 49 atoms have `canonical_example` but no `expected_output`
- Author `expected_output` field in those 49 atom outlines (compile-verified; `check:cpp` pass)
- Audit: which additional atoms could gain a `canonical_example` (currently ~75 atoms have no snippet in any field)
- Author `canonical_example` + `expected_output` for ≥30 high-value atoms (priority: Q-tagged atoms lacking examples)
- Re-run `npm run gen:see-predict` → target ≥150 read-predict cards
- Output verified via `npm run lint:see-cards`

**Acceptance Criteria**:
- [ ] ≥49 atoms gain `expected_output` field
- [ ] ≥30 additional atoms gain `canonical_example` + `expected_output`
- [ ] `npm run check:cpp` passes on all new examples (compilable)
- [ ] `npm run gen:see-predict` produces ≥150 cards (up from 61)
- [ ] All new read-predict cards pass lint (highlights ⊆ code when present)
- [ ] Prediction framing ("Predict: what does this output?") used for all atoms with expected_output
- [ ] Interleave order preserved
- [ ] `tsc --noEmit` clean

**Risks**:
- Some atoms are inherently non-output-producing (e.g., type declarations, struct definitions) — "no output" is valid; use alternate framing
- Compile-check must verify new canonical_examples don't have syntax errors
- Volume target (~200) may not be achievable if many atoms truly produce no observable output → accept 150 as floor

**Ship state**: read-predict deck 2.5× larger; majority of atoms have prediction-framing exposure.

**Halt-point**: user reviews 5 newly-predicted cards; authorizes M21.

**Authorization required to begin**: yes ("go M20").

---

## M21 — Purpose-Author Decompose Snippets (115 Fallback Atoms)

**Goal**: replace fallback-derived decompose snippets with purpose-authored multi-atom code blocks, improving decompose card quality for 115 atoms currently using the fallback chain.

**Background**: `gen-see-decompose-cards.ts` uses fallback: `see_decompose.snippet ?? see_demo.snippet ?? canonical_example`. 115 of 175 decompose cards use fallback (demo snippet or canonical_example). These work but aren't optimal — a decompose snippet should ideally show ≥3 atoms interacting so the "identify which atoms are present" question is non-trivial. Fallback snippets often show only 1-2 atoms.

**Deliverables**:
- Audit 115 fallback atoms: group by level, identify which have trivial 1-atom snippets
- Author `render_hints.see_decompose.snippet` for high-priority atoms (≥80 of 115):
  - Each snippet must contain ≥3 identifiable atoms (makes multi-select meaningful)
  - Snippet compiles (`check:cpp`)
  - `correct_atoms` + `distractors` updated to match new snippet
- Update `render_hints.see_decompose.highlights` to match new snippets
- Re-run `npm run gen:see-decompose` + `npm run interleave`
- Remaining ~35 atoms where single-atom snippets are genuinely correct (e.g., foundational axioms) → leave with fallback; document as intentional

**Acceptance Criteria**:
- [ ] ≥80 atoms gain purpose-authored `see_decompose.snippet`
- [ ] Each new snippet contains ≥3 identifiable atoms
- [ ] `correct_atoms` IDs all present in snippet code
- [ ] `distractors` IDs all NOT present in snippet code (genuine distractors)
- [ ] `npm run lint:see` passes (highlights ⊆ snippet)
- [ ] `npm run lint:see-cards` passes
- [ ] `npm run check:cpp` passes on new snippets
- [ ] Remaining ~35 fallback atoms documented with justification
- [ ] Interleave order preserved
- [ ] `tsc --noEmit` clean

**Risks**:
- 80+ snippets is substantial authoring work — batch by level for focus
- Multi-atom snippets must be realistic C++ (not contrived to hit atom checklist)
- Distractor quality: must be plausible-but-absent atoms from same/adjacent levels

**Ship state**: decompose cards show rich multi-atom recognition tasks. 80%+ purpose-authored.

**Halt-point**: user completes 10 decompose cards with new snippets; reports difficulty calibration; authorizes M22.

**Authorization required to begin**: yes ("go M21").

---

## M22 — P-Atom + ME-Atom Mini-SEE Cards (12 Zero-Snippet Atoms)

**Goal**: author minimal SEE content for the 12 atoms that currently have no snippet anywhere (P-01..P-07 meta-programming atoms, ME-01..ME-05 mock-exam atoms), giving them at least basic observation-mode exposure.

**Background**: 10 atoms have literally 0 SEE cards (P-02..P-07, ME-02..ME-05). P-01 and ME-01 get walkthrough coverage but still lack snippets. These are either meta-level atoms (P = "program structure" / "compilation process" / "debugging strategy") or mock-exam composite atoms. Traditional code snippets may not apply — some need conceptual demos (e.g., "watch a compile error happen" for P-03).

**Deliverables**:
- Categorize 12 atoms by amenability to code snippets:
  - **Code-amenable** (e.g., P-01 "program structure", P-02 "compilation"): author `canonical_example` + `see_demo` + `see_decompose`
  - **Conceptual** (e.g., P-05 "debugging strategy", ME-* mock composites): author conceptual demo snippets showing the meta-skill in action (e.g., a buggy program + fix for P-05)
- Author content in outline files: `outlines/L-1/P-*.yml` and `outlines/L17/ME-*.yml`
- Re-run full `npm run gen:all` pipeline
- All 12 atoms now have ≥1 SEE card

**Acceptance Criteria**:
- [ ] All 12 atoms (P-01..P-07, ME-01..ME-05) have `see_demo` content
- [ ] ≥8 of 12 also have `see_decompose` content (conceptual atoms may skip if forced)
- [ ] 0 atoms with zero SEE cards remain
- [ ] All new content passes `npm run lint:see`
- [ ] All generated cards pass `npm run lint:see-cards`
- [ ] Code-amenable snippets pass `npm run check:cpp`
- [ ] Interleave order preserved
- [ ] `tsc --noEmit` clean

**Risks**:
- ME-* atoms are exam composites — their "code" is a full 4-question exam; snippet must be partial/representative
- P-* atoms are meta-skills — snippet quality depends on finding concrete instantiations
- Some may genuinely resist the demo/decompose format → document as intentional gaps

**Ship state**: zero-SEE-card atoms eliminated. Every atom in the system has at least basic observation-mode coverage.

**Halt-point**: user reviews P-atom and ME-atom cards; confirms coverage sufficient.

**Authorization required to begin**: yes ("go M22").

---

## Post-M22 (Maintenance)

Out of scope for current planning. If exam date passes and app is still useful:
- Bug-fix-only mode
- Outline revisions for new T2 variants discovered post-exam
- Performance tuning
- Mobile-friendly hand-trace UX

Not authorized in advance. Post-M22 work requires fresh authorization.

---

## Quick-Reference Card

| Milestone | Goal | Halt → "go M-N" |
|-----------|------|-----------------|
| M0 ✅ | Spec lock | (already passed) |
| M1 | Scaffold + MemorizeCard | "go M1" |
| M2 | AI pipeline + L9 cards | "go M2" |
| M3 | RDS drill MVP | "go M3" |
| M4 | TraceCard + L13 | "go M4" |
| M5 | Q1 sims | "go M5" |
| M6 | WriteCard + L14 (struct) | "go M6" |
| M7 | L15 + L10 + L12 (Q3) | "go M7" |
| M8 | L16 (Q4) | "go M8" |
| M9 | Foundation backfill + MCQCard | "go M9" |
| M10 | Mock exams (L17) | "go M10" |
| M11 | Polish + deploy | "go M11" |
| **— DO half shipped — 1,159 cards live —** | | |
| M12 | SEE schema + DemoCard | "go M12" |
| M13 | DecomposeCard | "go M13" |
| M14 | WalkthroughCard | "go M14" |
| M15 | Author SEE outline fields | "go M15" |
| M16 | Generate SEE cards + interleave | "go M16" |
| M17 | Acceptance + final polish | "go M17" |
| **— SEE v1 shipped — 1,629 cards live —** | | |
| M18 | Q-context SEE cards (~260) | "go M18" |
| M19 | Redistribute worked examples | "go M19" |
| M20 | Expand read-predict (→150+) | "go M20" |
| M21 | Purpose-author decompose snippets | "go M21" |
| M22 | P-atom + ME-atom mini-SEE | "go M22" |

23 milestones total (M0–M22). Each = halt point. No autonomous chaining. No off-milestone work. No timeframes.
