# V1 Feature Map (cpp-t2/src/) — exhaustive

Source-of-truth for what v1 actually does. v2.2 picks a subset; nothing new.

---

## 1. App shell

`src/App.tsx` — single root with `useState<View>` 4-mode switch:
- `home` → `<Home>`
- `sequence` → `<Sequence startIndex={n}>`
- `m13-preview` → `<Sequence>` with hardcoded preview deck
- `m14-preview` → `<Sequence>` with hardcoded preview deck

`src/main.tsx` — StrictMode + globals.css + semantic.css. No router, no localStorage, no backend.

---

## 2. Home page (`pages/Home.tsx`)

Layout, top-to-bottom:
1. **`home__header`** — title `C++T2`, subtitle `SIT102 Test 2 — pick a level to begin`, totals `{N} cards · forward-only · refresh to restart`.
2. **`home__jump`** — jump-to-card-N panel:
   - Label `jump to card #`
   - `<input type=number min=0 max=N-1>` (live-validated against `parseInt`)
   - `go` button (disabled when invalid)
   - Live preview text: `{level.label} · {atomId} · {type}` if valid, hint or red error otherwise
   - Enter key = same as clicking go
3. **`home__grid`** — level picker. One `<button class=home__cell>` per level returned by `computeLevelStarts(CARDS)`. Each cell shows `label` (L9), `title` (Pass-by-reference (RDS)), `cardCount`, optional `RDS` badge (`isRDS` adds `home__cell--rds` accent). Click → `onPick(firstIndex)`.
4. **`home__m12`** (optional) — preview-deck buttons (`M13 decompose preview`, `M14 walkthrough preview`) + smoke-test hint line.
5. **`home__hint`** — long footnote: "Picking a level or card starts you at that point. Sequence is linear after — write your last card number on paper to resume next session."

No persistence; refresh = restart.

---

## 3. Sequence page (`pages/Sequence.tsx`)

The card-runner. Owns `index`, `retryNonce`, and the linear forward-only counter.

- `cards = previewCards ?? FULL_DECK` (defaults to `data/cards.json`).
- **Top bar:** `<ProgressBar current={index} total={cards.length}>` — fill bar + `N / total` label.
- **Nav buttons:** `retry` (bumps `retryNonce` → forces card remount, replays current card from start) + `home`.
- **Card key:** `${index}-${retryNonce}-${atomId}-${type}` — full remount on retry/advance, no stale state.
- **Dispatcher:** type-keyed switch. 10 components (memorize, trace, write, mcq, cloze, decompose, walkthrough, procedural, matrix, code-memorize). All receive `card` + `onAdvance` (procedural calls it `onComplete`). DemoCard exists but isn't wired into the main sequence (preview-only).
- **End state:** when `index === cards.length` → `empty-state` div + `home` button.

Forward-only: `handleAdvance = setIndex(min(length, i+1))`. There is no prev/back. No skip.

---

## 4. Card components — exact UX per type

All cards: `card` className root + `atom-id` header (level label + title + atomId + type) + `feedback` block + `kbd-hint` footer with `<span class=kbd>` shortcuts. State machine = `'input' | 'graded-pass' | 'graded-fail' | 'final-fail'`. `card--graded-pass` adds green border; `card--graded-fail` red.

### MemorizeCard (`memorize`)
- Phases: `display | input | graded-pass | graded-fail | final-fail`
- Header → optional `memorize-context` subtitle (= outline.fact) → `memorize-fact` (bold, large) → optional `memorize-code` `<pre>`
- **display** → any non-modifier key triggers transition to **input**; fact + context get `--hidden` modifier (still in DOM)
- **input** → autofocused `<textarea rows=2>`, **live-grading on every keystroke** (`useEffect` watches `studentInput`; if `normalize(studentInput) === normalize(card.fact)` → auto-pass at 500ms). Enter = manual fallback (uses `gradeMemorize` → keyChecks).
- **graded-fail** → red feedback, shows expected `keyChecks` joined by comma + explanation; space → re-show fact (re-display)
- After one retry → **final-fail**, shows fact + explanation; space → advance

### MCQCard (`mcq`)
- Single phase `input → graded-pass | graded-fail` (no retry)
- Stem + 4-button option list. **Deterministic shuffle** by `atomId` char-sum hash (LCG mix) — stable across renders.
- Selection: number key `1-4` OR click. Enter submits.
- After submit: incorrect → `graded-fail` red, correct option highlighted green, selected wrong gets `--wrong`. Space → advance.
- Auto-advance 600ms on pass.

### TraceCard (`trace`)
- Big-bang custom interactive memory-table grader. `card.code` shown as `<pre>`. `card.userInputs` rendered above as "assume input" lines.
- For each `card.variables` entry: a **row** with `[+]` add-button. Clicking `[+]` finalizes the previous box (struck-through) and inserts a new editable `<input class=trace-box>`. `[x]` removes last. Last box is always editable; older boxes get `trace-box--struck` (strikethrough). Active box has `--active` border.
- If `card.terminalOutput.length > 0` → `<textarea class=trace-terminal-input>` for terminal output (Enter without shift submits).
- Grading (Enter): `gradeTraceFinal` on each var's last non-empty value vs `expectedFinals` (last expectedSteps entry per var) + terminal char-match. All-correct → pass. **Final-fail still requires retry — must pass to advance** (`final-fail` → space → `handleRetry` → reset to input phase, no skip).
- On graded states, rows get `trace-row--pass` / `--fail`. Final-fail also reveals full per-var history (`buildHistories`) with arrows + final highlighted + `teachMe` explanation.

### WriteCard (`write`)
- Single submission, retry-once.
- Has a `card.level` field: 1, 2, or 3.
  - **L1** (fill blank) → single-line `<input type=text>`; Enter submits.
  - **L2** (complete body) → 4-row `<textarea>`; Ctrl+Enter submits (Enter inserts newline). Hint: "ctrl+enter to submit".
  - **L3** (free form) → 8-row `<textarea>`; Ctrl+Enter submits.
- Optional `card.template` rendered as `<pre class=write-template>`.
- Grading: `gradeWrite(input, expectedAnswer, keyChecks, forbidden)` — three-stage: exact normalize, lenient normalize (operator-spacing-tolerant via `normalizeLenient`), then keyChecks-all-present-AND-no-forbidden.
- Fail → red feedback shows required tokens + (optional) forbidden + explanation. Space → retry.
- Final-fail → reveals `expectedAnswer` `<pre>` + explanation. Space → advance.

### ClozeCard (`cloze`)
- Code panel `<pre>` + `cloze-sentence` with `___` replaced by inline `<input>`.
- Grading: lowercase trim equals `card.answer`. Retry-once.
- Pass → green inline answer. Final-fail → explanation + space-to-continue.

### DecomposeCard (`decompose`)
- Single-select MCQ with `A/B/C/D` letter labels (not number).
- Question + code panel + 4 labeled options.
- Keys: `A/B/C/D` to select, Enter submits, Space advances after pass / advances after final-fail / retries after graded-fail.
- Grading: exact `selected === correctLabel`. Retry-once.

### WalkthroughCard (`walkthrough`)
- Read-only step-reveal. `card.fullCode` as numbered `<pre>` lines + `card.steps[]` revealed one-at-a-time.
- `stepIndex` starts at `-1` (nothing shown). Space/Enter → reveal next step. The `step.line` line in code gets `walkthrough-code__line--active` accent border. Each step shows `step N/total · line K · atomIds[]` head + step.code + annotation.
- After all steps revealed → one more space advances.
- No grading.

### ProceduralDrill (`procedural`)
- 3-streak gating. `current = variants[variantIdx % variants.length]` (variantIdx = -1 starts on base prompt).
- `<textarea rows=8>`; Ctrl+Enter submits.
- Pass → `streak++`, advance to next variant after 600ms. **3-streak reached → onComplete (advance card)**.
- Fail → retry-once → on second fail, `streak = 0` (full reset).
- UI: 3 `streak-dot` indicators (filled/pulse), `streak {n}/{TARGET}` label.

### CodeMatrix (`matrix`)
- RAVEN-style. Shows `examples[]` (label + code each) → `↓ your turn` divider → prompt + 10-row `<textarea>`.
- Grading uses `gradeWrite`. Retry-once. Final-fail → reveal `expectedAnswer`.

### CodeMemorize (`code-memorize`)
- Phases: `study | input | pass | fail | final-fail`.
- **study** → shows code in `cmem-study__code` `<pre>` with label "memorize this code:". Space hides + reveals textarea.
- **input** → `<textarea rows=max(lineCount+2, 6)>`; Ctrl+Enter submits. Grading via `gradeWrite`.
- Fail retry-once. **Final-fail → space → re-study (back to study phase)**, not advance.

### DemoCard (`demo`) — built but only in preview routes
- Read-only. Code lines + `whyOneLine` + `usedIn` badge list. Greedy-longest-match token highlighting (`renderLine`). Space/Enter → advance.

---

## 5. Grading library (`lib/grading.ts`)

- `normalize(s)` — asciify (Unicode→ASCII map for `→ ← ≤ ≥ ≠ — – … ★ • ✓ ✗ × " "`) + trim + lowercase + collapse-whitespace.
- `normalizeLenient(s)` — normalize + strips spaces around C++ operators (`>>`, `<<`, `>=`, `<=`, `!=`, `==`, `+= -= *= /= %=`, `&& ||`, single-char `= < > + - * / % & | !`).
- Five graders: `gradeMemorize` (every keyCheck token included after lenient), `gradeMCQ` (strict equals), `gradeWrite` (exact-OR-lenient-OR-keyChecks-AND-no-forbidden), `gradeTraceFinal` (per-var strict normalize equals).
- Zero runtime AI / fetch.

---

## 6. Levels library (`lib/levels.ts`)

19 levels (L-1 through L17). Each has `level`, `label`, `title`, `prefixes[]`, optional `isRDS`. RDS = L9 (`R-` prefix) — flagged.

`levelOf(atomId)` → longest-prefix match (avoids `P-` colliding with `PC-`).
`computeLevelStarts(cards)` → for each level, first card index + count.

---

## 7. CSS / styling (`styles/globals.css`, `semantic.css`)

- **Theme:** Tailwind v4 with CSS vars under `@theme`.
- **Palette:** dark — bg `#0a0a0a`, card `#141414`, elevated `#1c1c1c`, border `#2a2a2a`. Text `#e5e5e5` / mute `#888` / faint `#555`. **Accent: neon green `#39ff14`** (= success). Warning yellow `#ffd60a`, danger red `#ff3b30`, info blue `#0a84ff`.
- **Fonts:** Inter (sans), JetBrains Mono / Fira Code (mono). 5 sizes: 12 / 14 / 16 / 20 / 28 px.
- **Radius:** 6px / 10px.
- **Critical: ligatures globally OFF** — `font-variant-ligatures: none` + `font-feature-settings: "liga" 0, "clig" 0, "calt" 0, "dlig" 0` so `->` shows as two chars, not `→` glyph. Inherited by all descendants.
- **Reduced motion** respected via `@media (prefers-reduced-motion: reduce)` (animation/transition forced to ~0).
- All UI text is ASCII-only (`OK`/`X` vs `✓`/`✗`).

---

## 8. Recommended minimal v2.2 feature set (pure subset)

**Pages (2):** `Home.tsx` + `Sequence.tsx`. Same skeletons.

**Card components to keep:** `MemorizeCard`, `MCQCard`, `TraceCard`, `WriteCard`, `ClozeCard`. The 5 that actually grade and form the core DO loop.

**Card components to keep optionally (read-only SEE, low complexity):** `DemoCard`, `WalkthroughCard`. Useful but cuttable if 6-L scope is tight.

**Engine:** `index` counter + `retryNonce` + forward-only `handleAdvance` + remount-key. ProgressBar. Retry button. Home button. That's it.

**Grading:** `normalize`, `normalizeLenient`, `gradeMemorize`, `gradeMCQ`, `gradeWrite`, `gradeTraceFinal` — keep verbatim.

**Levels:** swap `LEVELS[]` array contents to whatever 6 v2.2 levels are; keep the API unchanged (`levelOf`, `computeLevelStarts`).

**CSS:** Keep `globals.css` whole — palette, ligature kill, reduced-motion. `semantic.css` ditto.

**Home features to keep:** title/subtitle/totals header, level grid, jump-to-card-N input. Drop the M13/M14 preview-button block.

---

## 9. v1 features to ABANDON for v2.2 (specific to 19-level breadth model)

| Feature | Why drop |
|---|---|
| `DecomposeCard` | M13 SEE-half experiment; the 5 core graders cover Test 2 needs |
| `ProceduralDrill` (3-streak) | Was for L13-L17 procedural fluency over 23 drills; v2.2's 6-L Test-2 focus doesn't need streak gating |
| `CodeMatrix` (RAVEN) | Pattern-transfer puzzles for 25 cards in L13-L17; out of scope for 6-L |
| `CodeMemorize` | 30-card verbatim-typing module added post-M22; not needed for Test-2 essentials |
| `DemoCard` highlighting renderer | Read-only SEE prime; cut unless explicitly part of 6-L plan |
| `WalkthroughCard` step-reveal | 82 hand-authored walkthroughs were tied to L13-L17 trace/write pairs; v2.2 chooses to keep or cut |
| M13 / M14 preview buttons + `home__m12` block | Smoke-test routes for SEE components — pure dev affordance |
| `MockExamTimer` component | L17 mock-exam UI; v2.2 doesn't ship mocks |
| 19-level RDS badge highlight | If v2.2 has 6 levels and no RDS L9, drop `isRDS` styling |
| `previewCards` / `previewLabel` overrides in `Sequence` | Tied to M13/M14 preview decks |
| L13-L17 word-memorize rejection logic | Already done in post-M22; v2.2 starts clean anyway |

**Net v2.2 = 2 pages + 5 (or up to 7) card components + 1 forward-only counter + 4 grading fns + slim levels[]. Pure subset, zero additions.**
