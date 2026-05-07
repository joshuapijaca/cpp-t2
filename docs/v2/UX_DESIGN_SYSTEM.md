# cpp-t2 v2 — UX Design System

**Status:** v2.0 (foundation lock)
**Date:** 2026-05-07
**Owner:** UX-DS agent

This is the canonical design system for the v2 build (Option 4 max-quality). It governs every primitive in `src-v2/components/primitives/` and every page in `src-v2/pages/`. v1 is frozen and does not consume these tokens.

---

## 1. Philosophy

cpp-t2 v2 is a **code editor** learning surface. The student's mental model is "the IDE I'll use forever." The chrome must therefore feel native to VSCode, not like a generic learning app. Three rules govern every choice:

1. **Theme is dark only.** No light mode. We don't build a second palette we won't ship.
2. **Density over decoration.** VSCode trades whitespace for information. We follow.
3. **Movement = state change.** Animation never decorates; it confirms grading, navigation, or focus.

This system implements the first principle of the [12_ux_ui_design.md](../12_ux_ui_design.md) v1 design language, evolved for the IDE-sim paradigm.

---

## 2. Color tokens

All colors live in `src-v2/theme.css` as CSS variables on `:root`, then re-exported into Tailwind v4 via `@theme {}` so utility classes resolve from one source.

### 2.1 Surfaces

| Token | Hex | Use |
|-------|-----|-----|
| `--bg-0` | `#0d1117` | Page background. The "editor void." |
| `--bg-1` | `#161b22` | Panel — sidebar, titlebar, gutter. |
| `--bg-2` | `#1f2937` | Elevated — card body, terminal, modal, palette. |
| `--bg-3` | `#2d333b` | Active — selected nav item, hover-pressed row. |
| `--border-1` | `#30363d` | Default 1px dividers. |
| `--border-2` | `#484f58` | Emphasis dividers, focus-rim base. |

### 2.2 Text

| Token | Hex | Use |
|-------|-----|-----|
| `--text-0` | `#e6edf3` | Primary — body, code, headings. |
| `--text-1` | `#8b949e` | Secondary — labels, hints, breadcrumb middle. |
| `--text-2` | `#6e7681` | Tertiary — metadata, line numbers, statusbar inactive. |

### 2.3 Syntax accents

These map to GitHub-Dark + Dracula token families. They are reserved for **code semantics** — never for UI ornament.

| Token | Hex | Maps to |
|-------|-----|---------|
| `--accent-cyan` | `#79c0ff` | Identifiers, function names, links. |
| `--accent-pink` | `#ff7b72` | Keywords (`int`, `if`, `return`), deletions. |
| `--accent-grn`  | `#7ee787` | Strings, success markers. |
| `--accent-yel`  | `#d2a8ff` | Highlight (purple-warm); active line, current cell. |
| `--accent-org`  | `#ffa657` | Numbers, attention. |

### 2.4 States

UI feedback only. Never overload state colors onto syntax.

| Token | Hex | Use |
|-------|-----|-----|
| `--state-ok`   | `#3fb950` | Pass, completed atom, green-light. |
| `--state-err`  | `#f85149` | Fail, validation error. |
| `--state-warn` | `#d29922` | Retry pending, mid-state. |
| `--state-info` | `#58a6ff` | Focus ring, informational toast. |

### 2.5 Brace-pair rainbow

For code editor bracket colorization in code panels (depth 0..2 cycle).

| Token | Hex |
|-------|-----|
| `--brace-d0` | `#ffd700` |
| `--brace-d1` | `#da70d6` |
| `--brace-d2` | `#87cefa` |

---

## 3. WCAG AA contrast audit

Every text-on-bg combination is computed below. **AA** = 4.5:1 (normal text). **AA-large** = 3:1 (≥18px or ≥14px bold). **AAA** = 7:1.

| fg \ bg | bg-0 #0d1117 | bg-1 #161b22 | bg-2 #1f2937 | bg-3 #2d333b |
|---------|--------------|--------------|--------------|--------------|
| **text-0** #e6edf3 | 16.02 AAA | 14.64 AAA | 12.42 AAA | 10.78 AAA |
| **text-1** #8b949e | 6.15 AA   | 5.62 AA   | 4.77 AA   | 4.14 AA-lg |
| **text-2** #6e7681 | 4.12 AA-lg| 3.77 AA-lg| 3.20 AA-lg| **2.77 FAIL** |
| **accent-cyan** #79c0ff | 9.73 AAA | 8.89 AAA | 7.55 AAA | 6.55 AA |
| **accent-pink** #ff7b72 | 7.51 AAA | 6.86 AA  | 5.82 AA  | 5.05 AA |
| **accent-grn**  #7ee787 | 12.32 AAA | 11.26 AAA | 9.55 AAA | 8.29 AAA |
| **accent-yel**  #d2a8ff | 9.72 AAA | 8.88 AAA | 7.54 AAA | 6.54 AA |
| **accent-org**  #ffa657 | 9.77 AAA | 8.93 AAA | 7.58 AAA | 6.58 AA |
| **state-ok**    #3fb950 | 7.45 AAA | 6.81 AA  | 5.78 AA  | 5.02 AA |
| **state-err**   #f85149 | 5.65 AA  | 5.16 AA  | 4.38 AA-lg | 3.80 AA-lg |
| **state-warn**  #d29922 | 7.50 AAA | 6.85 AA  | 5.82 AA  | 5.05 AA |
| **state-info**  #58a6ff | 7.49 AAA | 6.85 AA  | 5.81 AA  | 5.04 AA |
| **brace-d0**    #ffd700 | 13.49 AAA | 12.33 AAA | 10.47 AAA | 9.08 AAA |
| **brace-d1**    #da70d6 | 6.55 AA  | 5.99 AA  | 5.08 AA  | 4.41 AA-lg |
| **brace-d2**    #87cefa | 11.03 AAA | 10.08 AAA | 8.56 AAA | 7.43 AAA |

### 3.1 Special pairs

| Pair | Ratio | Verdict |
|------|-------|---------|
| Statusbar text `--bg-0` on `--accent-cyan` | 9.73 | AAA |
| `state-err` (≥18px bold heading) on `--bg-2` | 4.38 | AA-large only — use ≥18px when red text appears on bg-2 |
| `state-err` (body) on `--bg-3` | 3.80 | AA-large only — pair red body text with bg-0/bg-1 |

### 3.2 Constraints

1. **`text-2` on `bg-3` (2.77) fails AA-large.** Do not place tertiary text on the active-row surface. If a row needs tertiary metadata while active, promote to `text-1` (4.14 AA-lg) or change the row background to `bg-2` (3.20, still AA-lg).
2. **`state-err` on `bg-2` and `bg-3`.** Body-size red text drops below AA on the elevated surfaces. Either bold ≥14px / ≥18px (qualifies AA-large) or pair the red marker with an icon to convey state non-color-only (RULE: no color-only state).
3. **Borders are decorative, not contrast-critical.** `border-1` on `bg-0` (1.55) and `border-2` on `bg-0` (2.28) are below 3:1 by design — they're hairline dividers, not UI components per WCAG 1.4.11. Focus rings use `state-info` (7.49 vs bg-0) which clears AA-large for non-text components.

---

## 4. Typography

Defined in `src-v2/lib/typography.css`.

### 4.1 Stacks

```css
--font-mono: "JetBrains Mono", "Fira Code", "Cascadia Code", ui-monospace,
             "Menlo", "Consolas", monospace;
--font-ui:   ui-sans-serif, system-ui, "Segoe UI", sans-serif;
```

JetBrains Mono is the default code stack — VSCode uses Cascadia Code by default; we lead with JBM because Deakin's Windows lab fonts vary.

**Ligatures are disabled globally.** A C++ hand-execution app cannot afford `==` to render as `≡`, `->` as `→`, or `!=` as `≠`. Every operator must read literally.

### 4.2 Sizes

| Token | px | Use |
|-------|----|-----|
| `--fs-micro` | 11 | Statusbar, line numbers, metadata. |
| `--fs-code` | 14 | Code panels (default body). |
| `--fs-prompt` | 15 | Card prompt text. |
| `--fs-h3` | 16 | Small section heading. |
| `--fs-h2` | 18 | Card title. |
| `--fs-h1` | 22 | Page heading. |

### 4.3 Line height

- `--lh-code` = `1.55` (breathing room in source).
- `--lh-ui` = `1.45` (tighter prose).

---

## 5. Spacing

Defined in `src-v2/lib/spacing.css`. **4px grid only.**

| Token | px | Convention |
|-------|----|------------|
| `--sp-1` | 4  | Hairline gap (icon-to-label). |
| `--sp-2` | 8  | Compact stack. |
| `--sp-3` | 12 | Card internal gap. |
| `--sp-4` | 16 | Default block padding. |
| `--sp-6` | 24 | Section gap. |
| `--sp-8` | 32 | Page gutter. |
| `--sp-12` | 48 | Above-fold breathing. |
| `--sp-16` | 64 | Page-edge maximum. |

No values outside this scale. If a layout demands one, the layout is wrong.

---

## 6. Focus & scrollbars

Defined in `src-v2/lib/focus.css`.

- **Focus ring:** `2px solid var(--state-info)`, `outline-offset: 2px`. Applied via `:focus-visible` only — no rings on mouse click.
- **Scrollbars:** thin (10px), `--bg-2` track, `--border-2` thumb. Firefox `scrollbar-width: thin` + WebKit pseudo-elements both styled.

This app is **keyboard-first**. The ring must be visible on every interactive element including custom roles (`role="button"`, `tabindex`).

---

## 7. Motion

Defined in `src-v2/lib/motion.css`.

- **Durations:** 80ms (fast), 120ms (base), 150ms (slow). Never longer.
- **Easing:** `cubic-bezier(0.2, 0.8, 0.2, 1)` — snappier than CSS default.
- **Properties allowed in transition:** only `opacity`, `transform`, `border-color`, `background-color`. Layout-triggering properties (width, padding, margin, top/left) are **never** animated.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` collapses every transition and animation to 0.001ms. The app stays fully usable; movement just disappears.

---

## 8. App shell

`src-v2/components/primitives/AppShell.tsx` realizes the code editor chrome.

```
┌──────────────────────────────────────────────┐
│ titlebar  (auto, breadcrumb + cmd-K)         │
├──────┬───────────────────────────────────────┤
│ side │ main                                  │
│ 56px │ 1fr  (children)                       │
├──────┴───────────────────────────────────────┤
│ statusbar (24px, atom count + streak)        │
└──────────────────────────────────────────────┘
```

### 8.1 Sidebar

Icon-only, 56px wide, seven entries: **Home, Track, Mock, Weakness, Atoms, Stats, Settings**. The active item gets a 2px cyan rail on its leading edge plus a `bg-3` fill (matches the VSCode activitybar selected pattern).

### 8.2 Titlebar

Brand square (cyan) + breadcrumb (`cpp-t2› <route> › …extra…`) + Cmd-K palette button. Breadcrumb text uses `text-1` for non-leaf segments and `text-0` for the active leaf — same convention as VSCode's editor breadcrumb.

### 8.3 Statusbar

24px, accent-cyan filled, dark text on cyan (9.73 AAA). Shows `<route> · atoms <n> · streak <n>` and a right-aligned `v2 · dark` build tag — VSCode's bottom-bar pattern.

### 8.4 Keyboard shortcuts

| Chord | Action |
|-------|--------|
| `g` then `h` | Home |
| `g` then `t` | Track |
| `g` then `m` | Mock |
| `g` then `w` | Weakness |
| `Cmd/Ctrl+K` | Open command palette (stub today; real palette ships M-UX-04+) |

The chord resolves only when the next key arrives within 1.2s; otherwise it cancels. `g`-prefix chords are ignored when focus is inside `INPUT`/`TEXTAREA`/`SELECT`/`contenteditable` — typing `g` in a textarea must not navigate.

---

## 9. CSS load order

In `src-v2/main.tsx` (or whatever the entry is) the CSS imports must run in this order so cascade resolves correctly:

```ts
import "./theme.css";           // tokens + Tailwind base
import "./lib/typography.css";  // font stacks + sizes
import "./lib/spacing.css";     // 4px grid utilities
import "./lib/focus.css";       // focus ring + scrollbar
import "./lib/motion.css";      // transitions + reduced-motion
```

Every page and primitive may then `className="mono tabular tr fade-in"` etc. without further imports.

---

## 10. Open work

Tracked here so future agents don't redesign them in isolation:

- **M-UX-04** — real command palette (today is a stub).
- **M-UX-05** — TraceCard / WriteCard card-shell primitives that consume these tokens.
- **M-UX-06** — terminal pane component, syntax highlighter, minimap.
- **M-UX-07** — keymap dialog (`?` opens it) listing all hotkeys.

When new tokens are needed, append to `theme.css`, audit contrast in this doc, and link the PR. Never inline color hex in components.
