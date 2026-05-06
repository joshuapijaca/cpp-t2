# Three-App Audit (sprint / sprintlearn / CRAM-AI)

Black-box analysis of three prior apps. Bundles minified, evidence pulled from string literals via grep. Goal: pattern extraction, not content reuse.

---

## Identity Summary

| App | Size | Bundle | Purpose | Content thesis |
|-----|------|--------|---------|----------------|
| `sprint.apk` | 4.5 MB | 1.27 MB JS | C++ drill app (early) | Static cards, no state |
| `sprintlearn.apk` | 4.8 MB | 2.04 MB JS | C++ drill app (later, +700 KB content) | Refined card UX, more cards |
| `CRAM-AI.apk` | 169 MB | 435 KB JS + 111 MP3s | SIT102 T1 audio + hand-exec trace | Passive audio + active trace |

All three: offline, no runtime AI, no fetch to LLM endpoints. None require API after build.

---

## sprint.apk

### Card Types Present

| Type | Count | Pattern |
|------|-------|---------|
| MCQ | 300 | 4 options, `correct` index |
| Trace | 270 | Predict output |
| FlashType | 235 | Timed reveal + type recall |
| Write | 191 | Free-text + `keyChecks[]` |
| Fact / Cue | 92 + 98 | Flashcard pairs |

### Mechanism Highlights

- **`flashSeconds` field**: 2–10 second reveal window. 100 cards at 3s, 56 at 4s, 45 at 5s, 24 at 6s, 15 at 7s.
- **`keyChecks[]` grading**: substring presence check, not edit-distance. e.g., write answer must contain `#include` and `<iostream>`.
- **Code annotations**: line-level hints embedded in question.
- **No persistence**: zero `localStorage` / `firebase` / `sync` hits. Refresh = restart.
- **No AI**: zero `fetch|cerebras|anthropic|gpt|openai` hits.
- **Free-roam**: linear card array, no gating.

### Verdict

Validates: memorize-via-flash works, char-/key-match grading works offline. Drop: fact/cue pairs (low value, no spacing to justify).

---

## sprintlearn.apk

### Card Types Present

Same five as sprint, plus refinements. ~50% more content.

### Memorize-Card Mechanism (PRIZED — user explicitly likes this)

```
1. Card displays flashCode snippet
2. Timer counts down (flashSeconds: 2-5s)
3. Code auto-hides on timer expiry
4. Blank input field appears
5. User types answer from memory
6. keyChecks[] validates required tokens (binary presence)
7. Match → next; miss → show explanation + retry
```

**Critical UX details:**
- User can type while code visible (race the timer) OR after auto-hide (pure recall).
- `keyChecks` is **token presence**, not exact match → tolerates whitespace/synonyms (`std::cout` vs `cout`).
- Per-question `explanation` string for feedback.
- No partial credit — binary: all required tokens present or fail.

### Topic Coverage

Ch1 I/O, Ch5 Functions, Ch6 Structs. T2 specifics: `cin`/`cout` patterns, struct arrays, `computer_data` struct present in bundle.

### Verdict

**This is the memorize-card model to clone.** Adopt:
- `flashSeconds` reveal timer (2–5s default)
- `keyChecks[]` for binary token grading
- Race-the-timer optional mode (display + input simultaneously) vs strict-recall (hide before input)
- Per-card explanation on fail

---

## CRAM-AI.apk

### App Identity

Manifest: "CRAM AI - SIT102 Test 1." Core route: `/passive-learn`. PWA wrapped in Cordova. The "AI" is brand only — zero runtime LLM calls.

### Audio Inventory (111 MP3s, ~165 MB)

| Folder | Files | Pattern | Purpose |
|--------|-------|---------|---------|
| `course/` | 70 | `p2_001` … `p3_018+` | Detailed lessons by part/chapter |
| `speedrun/` | 42 | `sr_000` … `sr_028` | Condensed speedrun versions |

Pre-recorded narration, not TTS. **Drop entirely for new T2 app** — passive audio violates user's "no passive learning" rule from `ideas.txt`.

### Hand-Execution UX (PRIZED — user explicitly likes this)

Bundle evidence:
- 39 hits on `hand` vs 7 on `passive` → hand-trace is primary active feature
- 324 hits on `variable`, 44 on `box`/`state`, 9 on `memory`, 5 on `trace`

Inferred flow:
```
1. Select code snippet
2. Enter trace mode
3. Variable-state boxes render (one per variable)
4. Step through code line-by-line
5. User types predicted variable value at each step
6. Validate against expected state progression
```

Matches T1 app pattern (variable-box history strip). **Identical to T1 reuse plan in [02_audit_t1_app.md](02_audit_t1_app.md).** Independent confirmation.

### Persistence

`localStorage` + `sessionStorage` + IndexedDB. Lesson progress + completed drills tracked. No cloud sync.

### AI Dependencies

23 `fetch` calls — likely audio file loads + sw.js cache, **not LLM endpoints**. Zero `claude|anthropic|gpt|openai|gemini` hits.

### Verdict

Validates: hand-trace + variable-state boxes is the right active-learning pattern for code execution. Confirms T1 design wins. Drop: all audio (passive), spaced repetition backend (user rejects), audio file bulk (165 MB → app bloat).

---

## Cross-App Pattern Convergence

| Pattern | sprint | sprintlearn | CRAM-AI | Verdict |
|---------|--------|-------------|---------|---------|
| Offline operation | ✓ | ✓ | ✓ | **Mandatory** for new app |
| Runtime AI calls | ✗ | ✗ | ✗ | **Avoid** — all 3 prove unnecessary |
| Char/key-match grading | ✓ | ✓ | ✓ | **Mandatory** offline grading |
| Timed flash reveal | ✓ | ✓ | — | **Adopt** for memorize cards |
| `keyChecks[]` token grading | ✓ | ✓ | — | **Adopt** |
| Variable-state hand-trace | — | — | ✓ | **Adopt** for Q1 sims |
| Audio passive learning | — | — | ✓ | **Reject** (user's rule) |
| MCQ option-pick | ✓ | ✓ | — | Keep, cap 20% |
| Spaced repetition | — | — | ✓ | **Reject** (14-day sprint) |
| Persistence/save state | — | — | ✓ | **Reject** (user's rule) |
| Free-roam card order | ✓ | ✓ | — | **Reject** (need strict prereq) |

### Three patterns to ABSORB into new T2 app

1. **sprintlearn flashtype memorize**: `flashSeconds` timer + `keyChecks[]` binary grading + per-card explanation. Apply to all 5 memorize variants per atom (≤7 words per fact).
2. **CRAM-AI hand-trace**: variable-state boxes, step-by-step user input, validated against expected state progression. Apply to Tier 7 (Q1 composites) + Q1 simulations.
3. **All three: offline char-match grading**. No fetch, no API, no LLM dependency. Confirmed feasible across 3 production apps.

### Three patterns to REJECT

1. **CRAM-AI audio bulk** (165 MB MP3s). Passive learning. Violates user's active-recall rule.
2. **sprint/sprintlearn free-roam card order**. Violates strict prereq order required for 0→1 path.
3. **sprint/sprintlearn fact/cue flashcard pairs**. Recognition-only. Use memorize cards (production) instead.

---

## Updated Card-Format Spec (consolidated from all 5 audits)

| Type | Source pattern | Use in new app |
|------|---------------|----------------|
| **Memorize (flashtype)** | sprintlearn flashtype + IT ELO first-principles | Tier 0–6, ≤7 words, 2–4s reveal, keyChecks grading |
| **MCQ** | sprint/sprintlearn MCQ | Tier 0–2 axioms + misconception filters, cap 20% |
| **Hand-trace** | T1 + CRAM-AI variable-state boxes | Tier 7 + Q1 sims, strict per-step grading, two-pass on same code |
| **Code-write 3-level** | NEW (sprint/sprintlearn lacked levels 1-2) | Tier 8/9/10 + Q2/Q3/Q4 sims, scaffolded fill→complete→free |

---

## Implications for [04_new_app_design.md](04_new_app_design.md)

Add to memorize-card spec:

```
flashSeconds: 3  // default; range 2-5 per atom difficulty
mode: 'race' | 'recall'  // race = type while visible; recall = hide-then-type
keyChecks: ['& means', 'same memory', 'box']  // tokens that must appear
explanation: string  // shown on fail
```

Add to hand-trace card spec (CRAM-AI confirmation):

```
variables: ['i', 'sum', 'd.mystery']
expectedSteps: [
  { line: 5, varStates: { i: 0, sum: 0, mystery: 0.0 } },
  { line: 7, varStates: { i: 1, sum: 10, mystery: 10.0 } },
  // ...
]
inputMode: 'per-step' | 'final-only'  // CRAM-AI step-by-step | T1 final-state
```

Add `inputMode` toggle: per-step (CRAM-AI granular) for early Q1 atoms, final-only (T1 strict) for Q1 sims.

---

## Open Questions Added

7. **Race vs strict-recall mode**: default to race (forgiving) or strict (harder)? Per-card override?
8. **Hand-trace input granularity**: per-step (CRAM-AI) trains incrementally, final-only (T1) matches exam. Mix by stage?
9. **`keyChecks` granularity for code-write**: how many tokens required to pass? Too few = false positives; too many = brittle.
