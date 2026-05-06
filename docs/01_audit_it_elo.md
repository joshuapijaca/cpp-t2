# IT ELO Audit — Every Failure Preventing 0→1

App location: `it-elo/`. Reorg PR #1 open. Skip `_legacy/`, `_archive/`.

## Verdict

**Useless for T2.** Trains recognition, not production. Trains test-taking, not C++ execution. Architecture optimizes for spaced review of memorized facts; user needs concentrated 0→1 skill install. Token budget eye-watering (~1M tokens per cohort for write-grading alone).

Keep nothing structural. Reuse only two formats: **memorize-card UX** (click→type recall) and **MCQ format**.

---

## Content Failures

### Card-type imbalance (recognition ≫ production)

| Card type | Count | % | Trains |
|-----------|-------|---|--------|
| MCQ | 1,008 | 55% | Recognition only |
| Hand-trace | 392 | 21% | Prediction |
| Code-write | 438 | 24% | Production (diluted) |

Total 1,838 cards. Ratio backwards. T2 needs production+trace, not MCQ. Swain output hypothesis violated. Krashen i+1 skipped — student can jump straight to production with no comprehensible input ramp.

### 1448 explain cards quarantined; 60 hand-authored remain

`src/data/explain-cards.ts` flagged Tier 5 (1.4 quality avg). Distractors pulled from unrelated concepts → zero pedagogical value. Re-exported as `FIRST_PRINCIPLES_CARDS` (60 cards). UI shows 60; infrastructure expects 1448. **96% of explain layer deleted.** Gap masked by re-export.

### Code-write grading allows substring matches

`LearnCodeEditor.tsx:120-123` — `gradeLocal()` uses `keyChecks` substring matching, case-insensitive. Cerebras fallback: `model: 'fast'`, `maxTokens: 80`, `temperature: 0.1` → underpowered for C++ syntax validation. Student passes with broken code if `&` keyword is present anywhere.

### Pass-by-reference (RDS) under-served despite being load-bearing

T2-chunks contain explicit `&` drills (Q1-C1 through Q1-C8, Q3-C1+) but **buried under "T2 Q1 — Hand-Trace" module gating**. Main deck (`learn-topics-part{1-5}.ts`) has generic "Functions" topic with ref-behavior drills, but sequencing assumes prerequisites mastered. Student under 14-day pressure hits `&` drill in Q1 with no "Why do we need &?" motivation.

### PFG 642 .md files present but not wired

`pfg-content/` is Tier 1 source-of-truth. Globber (`pfg-knowledge-base.ts`) moved to `_legacy/`. Content reachable only by direct import. No "what is a variable?" → "what is a pointer?" → "&-syntax" linear path from fundamentals.

### No hand-coded vs typed-coded transfer practice

T2 exam: closed-book, paper. Q1 hand-trace on paper. App trains only typed-editor input. No paper-image upload. Medium mismatch — student drills with instant feedback then must hand-write illegible code under timer.

---

## Architecture Failures

### Mastery-gating system unreachable

`KALesson.tsx`: STREAK_TARGET = 10 (KA-style mastery). `kc-progress.ts`: lesson→unit→course mastery, unit tests unlock at 50pts, challenge at 80pts. **App entry mounts `SprintApp` only — KALesson is dead code, no UI route.** Gating exists but is unreachable from main entry.

### MCQSprintMode has no enforced sequencing

Free-roam by design. User can skip topics, reorder Q1-Q4 modules. 0→1 learner skips fundamentals, fails on exam. Cognitive load theory (Sweller) violated.

### Dashboard / analytics deleted but not replaced

`src/CLAUDE.md` reorg note: "Dashboard, Learn, Tactics, Coverage, PracticeTest, ConceptMap, FreeRecall, ELO, Settings, Analysis — all referenced in old CLAUDE.md but not present in this dir. Deleted during T2-focus pivot." No "continue from where you left off." No mastery visualization. No time-to-mastery estimate. Student blind to progress.

### State persistence designed for SRS — user explicitly rejects it

- `sync.ts`: Firebase Realtime DB sync (6-char pairing code, cross-device)
- `mcq-progress.ts`: Debounced writes every 3s (`mcq:progress:v1`)
- `kc-progress.ts`: per-lesson mastery (`it-elo-kc-progress-v1`)

Architecture optimizes for spaced review. User wants 14-day sprint. Bjork storage-vs-retrieval strength tracking + consecutive-correct counters = wasted overhead.

### No checkpoint within sprint module

50+ question sprint, browser crash → restart from pos=0. localStorage tracks topic mastery but not sprint position. 0→1 learner needs micro-sessions (5-10q), not 50-question marathons.

---

## UX Failures

### Incentive structure trains procrastination

MCQ (fast, high-volume, dopamine) vs code-write (slow, demoralizing). Student gets reward from cheap recognition reps, avoids hard production drills. App trains avoidance.

### No "0→1 mode" sequencing

T2_CRYSTALLIZER_BLUEPRINT.md specifies 3 modes: Quick Drill (MCQ), Hybrid Chunk (MCQ→write), Production Drill (write only). UI does not enforce order. Student jumps to Production Drill with no scaffolding. Spec unfulfilled.

### Module picker → 50-question sprint → no mid-session save

SprintApp.tsx:58-95 — onClick → setSelectedModuleId → filters allQuestions by tags. No "save position within module." Loss of session = re-drill 30 same questions.

---

## Token-Waste Failures

### AI grading on every write submission

`LearnCodeEditor.tsx:136-140` — on submit, if local check fails, calls `sendMessage()` to Cerebras. 23 rotating keys, llama3.1-8b + qwen-3-235b backends.

| Layer | Cost |
|-------|------|
| Per Q (failed local check) | ~80 tokens |
| Avg attempts per Q | 3 |
| Write Qs | 438 |
| **Per learner** | **~105K tokens** |
| 10-cohort | **~1M+ tokens** |

User states: "most token usage I've ever seen from Claude ever." Confirmed.

### MCQ-distractor auto-gen orphaned

Files exist (`mcq-distractors-{cue,fact-a,fact-b,trace-a,trace-b,flashtype-a,flashtype-b,write-a,write-b}.ts`) with auto-generated headers. Generation script in `_legacy/`. Distractors stale if content changes. False impression of freshness.

### Per-attempt re-grading, no batching, no caching

No collection of N attempts → batch grade once. Each submit = 1 API call. Trivially cacheable (same student types same broken code 3 times → 3 identical API calls).

---

## What to Keep

| Element | Source | Why |
|---------|--------|-----|
| **Memorize-card UX** (click→type recall) | First-principles cards / vocab | Forces production. User likes format. Miller-friendly if ≤7 words. |
| **MCQ format** (4 options, 1 correct) | Fact cards | Fast first-pass. Useful for axioms only. **Cap at 20% of total cards**. |

## What to Drop

| Element | Reason |
|---------|--------|
| All 1,838 cards | Bloat, wrong ratio, recognition-heavy |
| MCQSprintMode + KALesson + VocabGame split | Confusing mental model |
| Cerebras API grading | Token cost, latency, no semantic check |
| `mcq-distractors-*.ts` auto-gen layer | Orphaned scripts |
| `sync.ts` (Firebase) | User wants offline, no backend |
| `mcq-progress.ts`, `kc-progress.ts` | SRS not needed |
| `KALesson.tsx`, mastery gates | User wants free-form drilling |
| `explain-cards.ts` (1448 quarantined) | Pedagogical value zero |
| `_legacy/`, `_archive/` | Tech debt |
| Module picker → sprint with no checkpoint | Loses session state |
| Dashboard / Analytics / Coverage / ConceptMap | All deleted in reorg, don't restore |

## Anti-Patterns to Avoid in New App

1. Don't author cards via AI — manual templates + variant generator only.
2. Don't grade via API — char-match only, normalized whitespace.
3. Don't track SRS / Bjork strength / mastery streaks.
4. Don't build mode pickers (sprint vs lesson vs vocab vs KA).
5. Don't bury RDS (`&`) — front-load it.
6. Don't import any IT ELO content. New atoms only.
