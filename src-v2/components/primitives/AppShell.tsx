/**
 * AppShell — code editor chrome for cpp-t2 v2.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────┐
 *   │ titlebar  (auto, breadcrumb + cmd-K)         │
 *   ├──────┬───────────────────────────────────────┤
 *   │ side │ main                                  │
 *   │ 56px │ 1fr  (children)                       │
 *   ├──────┴───────────────────────────────────────┤
 *   │ statusbar (24px, atom count + streak)        │
 *   └──────────────────────────────────────────────┘
 *
 * Keyboard:
 *   g h         -> Home
 *   g t         -> Track
 *   g m         -> Mock
 *   g w         -> Weakness
 *   Cmd/Ctrl+K  -> command palette (stub)
 *
 * No external state library — uses a tiny internal route prop + onNavigate
 * callback so this primitive stays decoupled from the router we'll wire in
 * later milestones.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

// ---------- Route surface ----------
export type ShellRoute =
  | "home"
  | "track"
  | "mock"
  | "weakness"
  | "atoms"
  | "stats"
  | "settings";

const NAV: Array<{
  route: ShellRoute;
  label: string;
  icon: string; // single-glyph; we'll swap for icon font later
  hotkey?: string; // for `g <key>` chord
  hotkeyHint?: string;
}> = [
  { route: "home",     label: "Home",     icon: "H", hotkey: "h", hotkeyHint: "g h" },
  { route: "track",    label: "Track",    icon: "T", hotkey: "t", hotkeyHint: "g t" },
  { route: "mock",     label: "Mock",     icon: "M", hotkey: "m", hotkeyHint: "g m" },
  { route: "weakness", label: "Weakness", icon: "W", hotkey: "w", hotkeyHint: "g w" },
  { route: "atoms",    label: "Atoms",    icon: "A" },
  { route: "stats",    label: "Stats",    icon: "S" },
  { route: "settings", label: "Settings", icon: "·" },
];

// ---------- Props ----------
export interface AppShellProps {
  /** Active route — drives sidebar highlight + breadcrumb tail. */
  route: ShellRoute;
  /** Called when user clicks a sidebar icon or fires a `g <key>` chord. */
  onNavigate: (route: ShellRoute) => void;

  /** Free-form breadcrumb segments to the right of the route. e.g. ["L9", "R-03", "trace"]. */
  breadcrumb?: string[];

  /** Statusbar — number of atoms mastered (or in active stream). */
  atomCount?: number;
  /** Statusbar — current streak counter (consecutive days or correct cards). */
  streak?: number;

  /** Optional command palette stub. Defaults to a simple alert. */
  onOpenPalette?: () => void;

  children: ReactNode;
}

// ---------- Component ----------
export function AppShell(props: AppShellProps) {
  const {
    route,
    onNavigate,
    breadcrumb = [],
    atomCount,
    streak,
    onOpenPalette,
    children,
  } = props;

  const [paletteOpen, setPaletteOpen] = useState(false);
  const openPalette = useCallback(() => {
    if (onOpenPalette) onOpenPalette();
    else setPaletteOpen(true);
  }, [onOpenPalette]);

  // ---------- Keyboard: cmd-K + `g <key>` chord ----------
  // gPending tracks whether the user just hit `g`; the next key resolves the chord.
  const gPending = useRef<{ at: number } | null>(null);

  useEffect(() => {
    function isTypingTarget(t: EventTarget | null): boolean {
      if (!(t instanceof HTMLElement)) return false;
      const tag = t.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if (t.isContentEditable) return true;
      return false;
    }

    function onKey(e: KeyboardEvent) {
      // Cmd/Ctrl+K — palette (always wins, even in inputs)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openPalette();
        return;
      }

      // Don't hijack chords while user types
      if (isTypingTarget(e.target)) return;

      // Resolve chord: `g` then a route key within 1.2s
      const now = performance.now();
      if (gPending.current && now - gPending.current.at < 1200) {
        const k = e.key.toLowerCase();
        const hit = NAV.find((n) => n.hotkey === k);
        if (hit) {
          e.preventDefault();
          onNavigate(hit.route);
        }
        gPending.current = null;
        return;
      }

      if (e.key.toLowerCase() === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        gPending.current = { at: now };
        return;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNavigate, openPalette]);

  // ---------- Breadcrumb derived ----------
  // NAV is a static, non-empty const list, so NAV[0] is always defined.
  // Use a non-null assertion to satisfy noUncheckedIndexedAccess.
  const activeNav = useMemo(
    () => NAV.find((n) => n.route === route) ?? NAV[0]!,
    [route]
  );

  return (
    <div
      className="appshell"
      style={{
        display: "grid",
        gridTemplateColumns: "56px 1fr",
        gridTemplateRows: "auto 1fr 24px",
        gridTemplateAreas: `
          "title   title"
          "side    main"
          "status  status"
        `,
        height: "100vh",
        width: "100vw",
        background: "var(--bg-0)",
        color: "var(--text-0)",
        overflow: "hidden",
      }}
    >
      {/* ---------- Titlebar ---------- */}
      <header
        role="banner"
        style={{
          gridArea: "title",
          display: "flex",
          alignItems: "center",
          gap: "var(--sp-3)",
          padding: "var(--sp-2) var(--sp-4)",
          borderBottom: "1px solid var(--border-1)",
          background: "var(--bg-1)",
          minHeight: 36,
        }}
      >
        {/* Brand square */}
        <div
          aria-hidden
          style={{
            width: 18,
            height: 18,
            borderRadius: 3,
            background: "var(--accent-cyan)",
            display: "grid",
            placeItems: "center",
            color: "var(--bg-0)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          ++
        </div>

        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mono"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "var(--text-1)",
            fontSize: "var(--fs-code)",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          <span style={{ color: "var(--text-2)" }}>cpp-t2</span>
          <span style={{ color: "var(--text-2)" }}>›</span>
          <span style={{ color: "var(--text-0)" }}>{activeNav.label}</span>
          {breadcrumb.map((seg, i) => (
            <span key={i} style={{ display: "inline-flex", gap: 6 }}>
              <span style={{ color: "var(--text-2)" }}>›</span>
              <span style={{ color: "var(--text-1)" }}>{seg}</span>
            </span>
          ))}
        </nav>

        {/* Cmd-K palette stub */}
        <button
          type="button"
          onClick={openPalette}
          aria-label="Open command palette (Ctrl+K)"
          className="mono tr"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 10px",
            background: "var(--bg-2)",
            border: "1px solid var(--border-1)",
            borderRadius: 4,
            color: "var(--text-1)",
            fontSize: "var(--fs-micro)",
            cursor: "pointer",
          }}
        >
          <span>Search</span>
          <kbd
            style={{
              padding: "1px 6px",
              background: "var(--bg-3)",
              border: "1px solid var(--border-1)",
              borderRadius: 3,
              color: "var(--text-1)",
              fontSize: 10,
              fontFamily: "var(--font-mono)",
            }}
          >
            Ctrl+K
          </kbd>
        </button>
      </header>

      {/* ---------- Sidebar ---------- */}
      <aside
        role="navigation"
        aria-label="Primary"
        style={{
          gridArea: "side",
          width: 56,
          background: "var(--bg-1)",
          borderRight: "1px solid var(--border-1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "var(--sp-2) 0",
          gap: 2,
        }}
      >
        {NAV.map((n) => {
          const active = n.route === route;
          return (
            <button
              key={n.route}
              type="button"
              onClick={() => onNavigate(n.route)}
              title={n.hotkeyHint ? `${n.label} (${n.hotkeyHint})` : n.label}
              aria-label={n.label}
              aria-current={active ? "page" : undefined}
              className="tr"
              style={{
                position: "relative",
                width: 40,
                height: 40,
                display: "grid",
                placeItems: "center",
                background: active ? "var(--bg-3)" : "transparent",
                color: active ? "var(--text-0)" : "var(--text-1)",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {/* Active accent rail */}
              {active && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: -8,
                    top: 8,
                    bottom: 8,
                    width: 2,
                    background: "var(--accent-cyan)",
                    borderRadius: 1,
                  }}
                />
              )}
              {n.icon}
            </button>
          );
        })}
      </aside>

      {/* ---------- Main ---------- */}
      <main
        role="main"
        style={{
          gridArea: "main",
          overflow: "auto",
          background: "var(--bg-0)",
        }}
      >
        {children}
      </main>

      {/* ---------- Statusbar ---------- */}
      <footer
        role="contentinfo"
        className="mono tabular"
        style={{
          gridArea: "status",
          height: 24,
          display: "flex",
          alignItems: "center",
          gap: "var(--sp-3)",
          padding: "0 var(--sp-3)",
          borderTop: "1px solid var(--border-1)",
          background: "var(--accent-cyan)",
          color: "var(--bg-0)",
          fontSize: "var(--fs-micro)",
          fontWeight: 500,
        }}
      >
        <span>{activeNav.label}</span>
        <span aria-hidden style={{ opacity: 0.6 }}>·</span>
        <span>
          atoms&nbsp;<strong>{atomCount ?? 0}</strong>
        </span>
        <span aria-hidden style={{ opacity: 0.6 }}>·</span>
        <span>
          streak&nbsp;<strong>{streak ?? 0}</strong>
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ opacity: 0.8 }}>v2 · dark</span>
      </footer>

      {/* ---------- Default palette stub overlay ---------- */}
      {paletteOpen && !onOpenPalette && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          onClick={() => setPaletteOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "grid",
            placeItems: "start center",
            paddingTop: "12vh",
            zIndex: 50,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="fade-in"
            style={{
              width: "min(560px, 90vw)",
              background: "var(--bg-2)",
              border: "1px solid var(--border-2)",
              borderRadius: 6,
              padding: "var(--sp-3)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.6)",
            }}
          >
            <input
              autoFocus
              placeholder="Type a command (stub — real palette ships later)"
              className="mono"
              style={{
                width: "100%",
                background: "var(--bg-1)",
                color: "var(--text-0)",
                border: "1px solid var(--border-1)",
                borderRadius: 4,
                padding: "8px 10px",
                fontSize: "var(--fs-prompt)",
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setPaletteOpen(false);
              }}
            />
            <p
              style={{
                margin: "var(--sp-3) 0 0",
                color: "var(--text-1)",
                fontSize: "var(--fs-micro)",
              }}
            >
              Esc to close. Pass <code>onOpenPalette</code> to AppShell to
              replace this stub.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppShell;
