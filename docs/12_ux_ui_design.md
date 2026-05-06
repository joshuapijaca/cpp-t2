# 12 — UX / UI Design (Minimalist Dark)

Anti-decoration. Anti-ornament. Single column. Single accent. Black background. Card occupies center; everything else gets out of the way.

---

## Design Principles

1. **One column, one card visible.** No grid. No sidebar. No navigation drawer.
2. **One accent color.** Action only. Never decoration.
3. **One font for prose, one for code.** No type scale beyond 4 sizes.
4. **No animations except 150 ms card-fade.** Movement = grading state change. Nothing else.
5. **Keyboard-first.** Mouse is fallback. Touch is mobile parity.
6. **Dark mode default.** No light mode toggle. (User uses dark; no need to maintain a second palette.)
7. **No hover effects.** Mobile + keyboard parity demand it.
8. **State visible, not implied.** Pass/fail rendered with color ring + icon, not just text color.
9. **Minimum chrome.** No header bar with logo. No footer with attribution.
10. **Skip everything not load-bearing.** Per ANTIPATTERNS #14.

---

## Design Tokens

```css
/* src/styles/globals.css */

:root {
  /* Colors — dark mode only */
  --bg:           #0a0a0a;   /* near-black */
  --bg-card:     #141414;   /* card background, +4% lightness */
  --bg-elevated: #1c1c1c;   /* var-box / terminal / interactive */
  --border:      #2a2a2a;   /* subtle dividers */
  --border-emph: #3a3a3a;   /* emphasis dividers */
  --text:        #e5e5e5;   /* primary text */
  --text-mute:   #888888;   /* secondary text */
  --text-faint:  #555555;   /* metadata, line numbers */

  --accent:        #39ff14;  /* electric green — primary action */
  --accent-mute:   #2cb20e;  /* hover/pressed state */
  --success:       #39ff14;  /* same as accent */
  --warning:       #ffd60a;  /* mid-state, retry */
  --danger:        #ff3b30;  /* fail */
  --info:          #0a84ff;  /* informational hint */

  /* Typography */
  --font-sans: "Inter", system-ui, -apple-system, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", "Consolas", monospace;

  --text-xs:  12px;   /* metadata only */
  --text-sm:  14px;   /* body, options */
  --text-md:  16px;   /* default */
  --text-lg:  20px;   /* card headings */
  --text-xl:  28px;   /* memorize fact display */

  /* Spacing — 4px scale */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-6:  24px;
  --space-8:  32px;
  --space-12: 48px;
  --space-16: 64px;

  /* Layout */
  --card-max-width: 720px;
  --content-max-width: 640px;
  --radius:     6px;
  --radius-lg:  10px;

  /* Animation */
  --transition: 150ms ease-out;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: var(--text-md);
  line-height: 1.5;
}

code, pre {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}
```

---

## Layout (Single Page)

```
┌─────────────────────────────────────────┐
│  ▒▒▒▒▒▒▒▒░░░░░░░░░░░░░░░░░░░░  423/1929 │  ← progress bar
│                                          │
│                                          │
│       ┌─────────────────────────┐       │
│       │                         │       │
│       │       CARD AREA         │       │
│       │   (one of 4 types)      │       │
│       │                         │       │
│       │                         │       │
│       └─────────────────────────┘       │
│                                          │
│                                          │
│           [enter to submit]              │  ← keyboard hint
└─────────────────────────────────────────┘
```

- Progress bar: 4px tall, full-width, top of viewport. Filled portion = `--accent`. Numeric: `423 / 1929` right-aligned.
- Card: `max-width: 720px`, centered, vertical centering of viewport.
- Keyboard hint: `text-xs`, `text-faint`, bottom-center. Updates per card type ("space to reveal", "enter to submit", "→ next").

---

## MemorizeCard UX

State machine:

```
DISPLAY (flashSeconds) ─┐
                        ├─→ INPUT ─→ SUBMITTED ─┬─ PASS ─→ next
HIDDEN (recall mode)  ─┘                       └─ FAIL ─→ EXPLAIN ─→ retry once → next
```

### Layout (DISPLAY phase)

```
┌─────────────────────────────────────┐
│                                     │
│          R-03                       │  ← atom ID (text-xs, text-faint)
│                                     │
│   & means alias same memory box     │  ← fact (text-xl, text accent)
│                                     │
│        ▒▒▒▒▒▒▒▒▒░░░  3.0s           │  ← countdown bar
│                                     │
└─────────────────────────────────────┘
```

### Layout (INPUT phase, recall mode — fact hidden)

```
┌─────────────────────────────────────┐
│                                     │
│         R-03                        │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ type the fact verbatim...   │   │  ← textarea, monospace
│   └─────────────────────────────┘   │
│                                     │
│         [enter to submit]           │
└─────────────────────────────────────┘
```

### Layout (FAIL → EXPLAIN)

```
┌─────────────────────────────────────┐
│  ✕  not quite                       │  ← danger ring
│                                     │
│  Correct: & means alias same box    │
│  You typed: & is alias              │
│                                     │
│  ─ explanation ─                    │
│  > In param declaration, & creates  │
│  > a reference. Caller's variable   │
│  > and parameter share the same     │
│  > memory location.                 │
│                                     │
│         [space to retry]            │
└─────────────────────────────────────┘
```

Once-retry only. Second fail → show full answer + advance.

---

## MCQCard UX

```
┌─────────────────────────────────────┐
│  R-03                               │
│                                     │
│  What does void f(int &x) mean?     │  ← stem
│                                     │
│  [1]  x is a copy of caller's var   │
│  [2]  x and caller share memory  ●  │  ← keyboard 1-4 or click
│  [3]  x is a pointer dereference    │
│  [4]  x is uninitialized            │
│                                     │
│         [enter to submit]           │
└─────────────────────────────────────┘
```

- Selected option: ring `--accent` 1px.
- Submit → reveal correct (green ring) + wrong selection (red ring) + explanation below.
- Distractor explanations: only shown for the option the user picked, not all four.

---

## TraceCard UX (variable-box history strip)

Cloned from IT-ELO T1 APK pattern (per [06](06_audit_it_elo_t1_apk.md)).

```
┌────────────────────────────────────────────────────────────┐
│  R-03 — trace                                              │
│                                                             │
│  ┌─ code ─────────────────────────┐ ┌─ inputs ──┐         │
│  │ 1│ void increment(int &x) {    │ │ Enter n: 5 │         │
│  │ 2│   x = x + 1;                │ │            │         │
│  │ 3│ }                           │ └────────────┘         │
│  │ 4│ int main() {                │                         │
│  │ 5│   int n = 5;                │                         │
│  │ 6│   increment(n);             │                         │
│  │ 7│   cout << n << endl;        │                         │
│  │ 8│ }                           │                         │
│  └─────────────────────────────────┘                       │
│                                                             │
│  ─ variables ────────────────────────                       │
│                                                             │
│  n / x  │  5̶  │  6̶  │  6  │      ← strikethrough old, bold current
│         │     │     │     │     ← "n / x" both labels (R-08 pattern)
│  ─ terminal ─────────────────────                           │
│                                                             │
│  6                                                          │
│                                                             │
│         [tab to next variable]                              │
└────────────────────────────────────────────────────────────┘
```

- Variable boxes: horizontal history strip per variable. Each cell = one mutation.
- Reference atoms (R-08): single box rendered with both names ("n / x").
- Strikethrough: `text-decoration: line-through; opacity: 0.4`.
- Current value: `color: var(--accent)`, font-weight bold.
- Terminal panel: separate, monospace, `bg-elevated`.
- Inline condition viz (when applicable): `i < 5 → true` in `text-mute` next to the variable being tested.

### Per-step input mode (Levels 13 atoms)

```
[1] At line 1: x = ?    →  user types "5"
[2] At line 6: x → n alias bound. n = ?  →  user types "5"
[3] At line 2 inside increment: x = ?  →  user types "6"
[4] After return, n = ?  →  user types "6"
```

User fills each step before next. Wrong step → Teach Me → retry.

### Final-only mode (Stage 19 mock exams)

```
After full trace, n = ?  →  user types "6"
```

Single submit. Strict grading.

---

## WriteCard UX (3-level scaffold)

### Level 1 — Fill blank

```
┌────────────────────────────────────────────────────────────┐
│  R-03 — write level 1                                      │
│                                                             │
│  void increment(int [___] x) {                              │
│    x = x + 1;                                               │
│  }                                                          │
│                                                             │
│  Fill: [_____]                                              │
│                                                             │
│         [enter to submit]                                   │
└────────────────────────────────────────────────────────────┘
```

Single input. Char-match. Wrong → Teach Me → retry once.

### Level 2 — Complete body

```
┌────────────────────────────────────────────────────────────┐
│  R-03 — write level 2                                      │
│                                                             │
│  void incr(int &x) {                                        │
│    [______________________]                                 │
│  }                                                          │
│                                                             │
│  Multi-line input. caller's n becomes 6.                    │
│                                                             │
│         [enter to submit]                                   │
└────────────────────────────────────────────────────────────┘
```

Textarea, monospace, syntax-highlight via lightweight regex (no Monaco — overkill).

### Level 3 — Free-form from spec

```
┌────────────────────────────────────────────────────────────┐
│  R-03 — write level 3                                      │
│                                                             │
│  Spec: Write a function that takes an int by reference      │
│  and increments it. Caller must see the change.             │
│                                                             │
│  ┌─────────────────────────────────────────────────┐       │
│  │ void incr(int &x) {                              │       │
│  │   x = x + 1;                                     │       │
│  │ }                                                │       │
│  └─────────────────────────────────────────────────┘       │
│                                                             │
│         [enter to submit]                                   │
└────────────────────────────────────────────────────────────┘
```

Grading: normalize whitespace + keyChecks token presence + forbidden token absence.

---

## TeachMe (Recovery Panel)

Inline expansion below failed card:

```
─ Teach Me ──────────────────────────

  In C++, parameters declared with &
  are references — aliases for the
  caller's variable. Mutations through
  the alias affect the caller directly.

  Example:
    void f(int &x) { x = 99; }
    int main() {
      int n = 5;
      f(n);          // n is now 99
    }

  [space to retry]
```

3-5 sentences max. Always includes minimal example. Pre-authored per atom (`teachMe` field in outline).

---

## ProgressBar

```html
<div class="progress" role="progressbar"
     aria-valuenow={index} aria-valuemax={total}>
  <div class="progress__fill" style={{ width: `${(index/total)*100}%` }} />
  <div class="progress__label">{index} / {total}</div>
</div>
```

```css
.progress { position: fixed; top: 0; left: 0; right: 0; height: 4px; background: var(--bg-elevated); }
.progress__fill { height: 100%; background: var(--accent); transition: width var(--transition); }
.progress__label { position: absolute; right: 16px; top: 8px; font-size: var(--text-xs); color: var(--text-faint); }
```

No mastery indicator. No streak counter. No level breakdown. Position only.

---

## Keyboard Map

| Key | Action | Card type |
|-----|--------|-----------|
| `Space` | Reveal / continue / retry | Memorize, all |
| `Enter` | Submit current input | All |
| `→` / `j` | Skip / next (after grade shown) | All |
| `←` | NOT bound — no back-navigation | (forward-only) |
| `1-4` | Select MCQ option | MCQ |
| `Tab` | Next variable / next field | Trace, Write |
| `Shift+Tab` | Previous field within card | Trace, Write |
| `Esc` | Show TeachMe (if available) | All |

No `Cmd+K` palette. No fuzzy search. No skip-to-atom. Forward-only.

---

## Touch / Mobile

| Gesture | Action |
|---------|--------|
| Tap | Reveal / continue / select |
| Swipe right | Next (after grade) |
| Swipe left | NOT bound (no back) |
| Long-press card | Show TeachMe |
| Tap input area | Focus textarea / input |

Trace card on phone: variable-box history strip becomes vertical instead of horizontal at <640px. Two-pass option remains.

---

## Color Semantics

| Element | Color | Token |
|---------|-------|-------|
| Background | near-black | `--bg` |
| Card bg | dark gray | `--bg-card` |
| Variable box / terminal | slightly lighter | `--bg-elevated` |
| Body text | light gray | `--text` |
| Metadata (atom ID, line numbers) | medium gray | `--text-mute` |
| Faint (countdown labels) | dim gray | `--text-faint` |
| **Action / pass / accent** | electric green | `--accent` |
| Retry / mid-state | yellow | `--warning` |
| Fail | red | `--danger` |
| Hint info | blue | `--info` |

Dark mode default. **No light theme.** No theme toggle.

---

## Typography Scale

| Use | Size | Weight | Family |
|-----|------|--------|--------|
| Memorize fact (display) | `text-xl` (28px) | 600 | sans |
| Card heading | `text-lg` (20px) | 600 | sans |
| Body / spec | `text-md` (16px) | 400 | sans |
| Code (inline + block) | `text-sm` (14px) | 400 | mono |
| MCQ options | `text-sm` (14px) | 400 | sans |
| Atom ID / line numbers / metadata | `text-xs` (12px) | 400 | sans/mono |

Five sizes. No more. No more weights. No italics.

---

## Animation

```css
.card { transition: opacity var(--transition); }
.card--entering { opacity: 0; }
.card--entered { opacity: 1; }
.card--exiting { opacity: 0; }

/* Grade ring pulse on submit */
.card--graded-pass { box-shadow: 0 0 0 1px var(--accent); }
.card--graded-fail { box-shadow: 0 0 0 1px var(--danger); animation: shake 200ms; }

/* No spinners. Grading is synchronous. */
@keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
```

That's the entire animation budget. Card fades. Pass = green ring. Fail = red ring + small shake. Nothing else.

---

## Accessibility

| WCAG | Status |
|------|--------|
| Color contrast (text on bg) | AA — `#e5e5e5` on `#0a0a0a` = 19.5:1 |
| Color contrast (accent on bg) | AAA — `#39ff14` on `#0a0a0a` = 14.2:1 |
| Keyboard navigation | All actions keyboardable |
| Focus indicators | Visible (1px accent ring) |
| Screen reader | Semantic HTML + aria-progressbar |
| Reduced motion | `prefers-reduced-motion` disables shake + fade |

Single user (you), known-sighted, but baseline AA met. No further audit.

---

## What's NOT in the UI

| Banned | Reason |
|--------|--------|
| Logo / branding | Distraction; user knows what app is |
| Settings page | No settings |
| Theme toggle | Dark only |
| Profile / login | No accounts |
| Save indicator | No save state |
| Mastery dashboard | Banned per ANTIPATTERNS #3 |
| Streak counter | Banned per ANTIPATTERNS #3 |
| SRS queue indicator | Banned |
| Module / topic picker | Forward-only sequence |
| Hover tooltips | Mobile parity |
| Modal dialogs | TeachMe is inline expansion only |
| Toasts / notifications | Synchronous grading shown in-place |
| Loading spinners | No async UI; everything synchronous |
| Animations beyond fade + shake | 150ms budget only |
| Light mode | Not maintained |
| Internationalization | English |
| Sounds / haptics | Defer to v2 if at all |

---

## Reference Screens

(All screens are 720×variable centered. Single-column. Responsive: shrinks to viewport width on mobile, never adds sidebars.)

```
┌──── DESKTOP (≥720px) ────┐    ┌──── MOBILE (<640px) ────┐
│        ┌──────────┐      │    │ ┌─────────────────────┐ │
│        │   CARD   │      │    │ │       CARD          │ │
│        │  720px   │      │    │ │   100vw - 24px      │ │
│        └──────────┘      │    │ │   (vertical layout) │ │
│        keyboard hint      │    │ │                     │ │
└─────────────────────────┘    │ └─────────────────────┘ │
                                │       tap to advance     │
                                └─────────────────────────┘
```

That's the whole interface. One column. One card. One accent. One job.
