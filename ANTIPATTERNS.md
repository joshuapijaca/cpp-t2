# ANTIPATTERNS — AI Shortcut Behaviors Banned

Read before every planning or build move. These are the patterns AI assistants (Claude included) drift toward. Each has cost the user previously. Each is forbidden.

---

## 1. Starting at Advanced Topics Because They "Seem Relevant"

**Symptom**: AI sees Q3 needs `&array[]`, jumps straight to teaching pass-by-reference. Skips: what is a variable, what is a function, what is a parameter.

**Why banned**: Calculus before algebra. Student memorizes ritual without understanding. Fails on variation.

**Correct behavior**: Start at Level -1 (Pre-programming mental model). Build forward atom-by-atom. RDS at Level 9 only after Level 8 (functions) is automatic.

---

## 2. Skipping Prereq Atoms

**Symptom**: "We can skip Level 4 operators because Q1 only needs `>` and `=`. Just teach those."

**Why banned**: `>` returns bool. Bool is in Level 5. Bool requires `true`/`false` literals (V-19) which require V-13 (`bool` type) which requires V-3 (variable has a type) which requires V-1 (variable = box). Skipping any link → student can't read the conditional.

**Correct behavior**: Every atom's `deps` must resolve to atoms in earlier or same level. Audit before merging any atom.

---

## 3. Adding Save State / SRS / Mastery Gating "Because They're Standard"

**Symptom**: AI proposes localStorage progress + spaced-review queue + 10-streak gate to "improve retention."

**Why banned**: User has 14-day sprint, not 6-month retention goal. SRS spaces practice across days; gating blocks forward motion when stuck. Both wasted in this context.

**Correct behavior**: Session-only state. Forward-only sequence. Wrong → retry once → continue.

---

## 4. Re-Introducing Runtime AI Grading

**Symptom**: AI proposes "let Claude grade the code-write" or "use a small model for partial credit" or "fall back to Cerebras when char-match fails."

**Why banned**:
- ~$1M tokens for 10-cohort cost (measured in IT ELO grading)
- Latency hurts flow
- AI judgment is non-deterministic; same code grades differently
- T1 Q6 had ~40% false pos/neg rate
- User explicitly: "no API after build"

**Correct behavior**: Char-match offline. `keyChecks[]` for token presence. `forbidden[]` for negative checks. Multi-correct via regex pattern. Fixed at build time.

---

## 5. Unanchored AI Card Authoring

**Symptom**: AI proposes "I'll generate 1,929 cards from a one-line prompt" or "let me write the variants free-form" without an outline as anchor.

**Why banned**: Quality drift across calls. Hallucinated C++ output. AI "corrects" SIT102 idioms (e.g., `&array[]` → `*array`). No reproducibility.

**Correct behavior** (per [CHANGELOG.md](CHANGELOG.md) 2026-05-03 update):
- AI authoring is **allowed at build-time** under strict anchor:
  1. Per-atom outline YAML in `extraction/` — locks fact, prereqs, canonical example, misconceptions, SIT102 quirks, acceptance criteria
  2. AI prompt = outline → AI outputs cards
  3. Compile-check 100% of generated C++ snippets
  4. Lint memorize cards ≤7 words
  5. SIT102-idiom enforcement (e.g., `&array[]` not `*array`)
  6. 10% random human audit before lock
  7. Reproducible: same outline + same Opus version → same cards (cache)
- AI **never** authors atom IDs, dependency graph, level assignments, or Q-tags. Those are human-locked.
- Build script iterates outline list only — AI cannot add atoms not in outline.
- See [docs/08_outline_spec.md](docs/08_outline_spec.md) for outline schema.

---

## 6. Reusing IT ELO Content

**Symptom**: AI proposes "we can adapt the existing 948 IT ELO cards" or "let's port the T2 chunks."

**Why banned**: IT ELO trains recognition (MCQ-heavy). T2 is production. The 1,448 explain cards were quarantined for low pedagogical value. Importing this content imports its failure mode.

**Correct behavior**: Audit IT ELO for *patterns* (sprintlearn flashtype, T1 hand-trace UX). Never import content. New atoms, new templates only.

---

## 7. Adding Card Types Beyond the Seven Allowed

**Symptom**: AI proposes "video card" or "interactive playground" or "drag-and-drop card" or "code-explanation card beyond the 7 named."

**Why banned**: User explicitly: no videos, no passive learning. Each new card type doubles UX surface, doubles authoring cost. Cap was 4 (DO half) → expanded to 7 (DO + SEE) on 2026-05-04 per `docs/14_see_cards_master_plan.md`. No further expansion without re-litigate authorization (per #15).

**Correct behavior**: 7 types max. **DO**: Memorize / MCQ / Trace / Write. **SEE**: Demo / Decompose / Walkthrough. No others.

---

## 8. Inserting Time-Frame Estimates

**Symptom**: "Week 1: scaffold. Week 2: components. Week 3: ..."

**Why banned**: User explicitly forbids in current brainstorming phase. Estimates create false commitments and block iteration.

**Correct behavior**: Phased plans (Phase A, B, C…) with no calendar. Mark dependencies, not durations.

---

## 9. Polite Hedging / Verbose Prose / Filler

**Symptom**: "It might be worth considering..." / "One option could be..." / "I think perhaps..."

**Why banned**: User runs caveman-ultra mode. Wastes tokens. Hides the actual recommendation.

**Correct behavior**: Direct claim. Tables over paragraphs. Arrow → for causality.

---

## 10. Treating Q-Specific Skills as Standalone

**Symptom**: AI proposes drilling Q1 hand-trace before teaching what a `for` loop is.

**Why banned**: Q1-Q4 skills (Levels 13–16) are composites of foundational atoms (Levels -1 to 12). Without the base, the skill is ritual.

**Correct behavior**: All Levels -1 to 12 done before Level 13 begins. Sequence enforced by `docs/07_master_plan.md`.

---

## 11. Skipping the Two-Pass Hand-Trace Pattern

**Symptom**: AI proposes one-pass-only trace drill ("just have the student trace once, that's enough").

**Why banned**: Two-pass (full + partial-stop at `i == N`) tests loop understanding without rewriting code. Single pass = student memorizes one execution path.

**Correct behavior**: Same code, two stop conditions. Both graded. Both must pass.

---

## 12. Not Front-Loading the RDS

**Symptom**: AI proposes "introduce `&` later, when arrays are taught." Or "treat `&` as a footnote on functions."

**Why banned**: Without `&` automaticity, Q1 fails (wrong `d.mystery`), Q3 fails (reads vanish), Q4 fails (prints empty). 3 of 4 questions cascade.

**Correct behavior**: Level 9 immediately after Level 8 (functions), before Level 10 (arrays). 2× standard volume per atom. Hammered until automatic.

---

## 13. Using Tailwind Utility Chains for Hand-Trace UI

**Symptom**: AI writes `class="bg-gray-100 border border-gray-300 rounded-md p-2 flex flex-col gap-1"` for variable boxes.

**Why banned**: Hand-trace UI iterates over many boxes. Utility chains hide structure. Future style changes require touching every box.

**Correct behavior**: Semantic class layer (`.variable-history`, `.step-box--current`, `.terminal-line`). Tailwind only at outer container.

---

## 14. Adding Backwards-Compat Shims, Feature Flags, Migration Paths

**Symptom**: "Let's add a feature flag in case we want to enable SRS later." / "Keep the localStorage code in case we want save state later."

**Why banned**: User explicitly drops these features. Speculative-future code = bloat. If a future need arises, add then.

**Correct behavior**: Build only what's specified. Delete unused code. Don't anticipate.

---

## 15. Quietly Re-Litigating Already-Decided Calls

**Symptom**: AI keeps suggesting "but maybe just a little spacing?" or "what if we added one MCQ for each composite?"

**Why banned**: Decisions were made for documented reasons. Re-asking wastes user time.

**Correct behavior**: If a decision *might* need revisiting, propose explicitly: "I think X should be reconsidered because [new evidence]. Authorize re-litigate?" Otherwise treat decisions as settled.

---

## 16. Working Off-Milestone

**Symptom**: AI is mid-M2 (AI pipeline + L9 cards) and starts authoring L13 outlines because "we'll need them soon." Or builds TraceCard component during M2 because "it's almost ready." Or skips M3 (RDS drill MVP) because "M2 went well."

**Why banned**: Milestones exist to prevent wandering. Each is a halt-point requiring explicit user "go." Working ahead = no halt = no review = drift undetected. User has no chance to catch a bad direction before it's compounded by 5 milestones of additional work.

**Correct behavior** (per [docs/13_milestones.md](docs/13_milestones.md)):
- One milestone in progress at a time. Strictly.
- No combining milestones (M1+M2 together = scope creep; halt-point lost).
- No skipping milestones (even when prior milestone went perfectly).
- New ideas mid-milestone → log as future-milestone candidate; don't act on them.
- "Almost ready" is not done; finish current milestone, halt, await go.
- Off-milestone work that "feels obvious" is the most dangerous kind — it bypasses the discipline that catches subtle errors.

If tempted to start the next milestone before current is approved: STOP. Ask the user "go M-N+1?" instead.

---

## Self-Check Before Any Move

Before proposing or implementing anything, ask:

1. Does this skip a prereq atom? → STOP.
2. Does this add save state, SRS, gating, or runtime API? → STOP.
3. Does this create an 8th card type beyond Memorize/MCQ/Trace/Write/Demo/Decompose/Walkthrough? → STOP.
4. Does this re-use IT ELO content? → STOP.
5. Does this insert a calendar / week-based estimate? → STOP.
6. Does this re-litigate a settled decision without new evidence? → STOP.
7. Does this require >7 words on a memorize card? → STOP.
8. Does this move the RDS away from Level 9? → STOP.
9. Does this work span multiple milestones in one move? → STOP.
10. Does this skip the current milestone's halt-point? → STOP.

If any answer is yes, halt and re-read MISSION.md + [docs/13_milestones.md](docs/13_milestones.md) before continuing.
