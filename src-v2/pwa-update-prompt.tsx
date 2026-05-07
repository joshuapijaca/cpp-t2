/**
 * pwa-update-prompt.tsx — Service-worker update toast.
 *
 * Watches the Workbox registration produced by vite-plugin-pwa
 * (registerType: 'autoUpdate') and surfaces:
 *
 *   • "New version available — refresh to update"  toast with a button
 *   • Auto re-check every 30 minutes via setInterval against the registration.
 *   • Dismissable; the toast reappears the next time a new version lands.
 *
 * Architecture:
 *   - main.tsx imports `registerSW` from 'virtual:pwa-register' and passes
 *     us back the `updateSW` callback + the SW registration via callbacks.
 *   - We hold both in module-level refs (settable from outside) so the
 *     React component can read them without re-mounting.
 *   - The component itself is a tiny visual layer; all the SW plumbing
 *     lives in main.tsx so this file stays import-graph-light.
 */

import { useEffect, useState } from 'react';

// ─── Module-level bridge from main.tsx ────────────────────────────────────
// main.tsx calls registerSW({...}) and then sets these via the helpers
// below so we don't have to plumb refs through React props.

let _onNeedRefresh: (() => void) | null = null;
let _updateSW: ((reload?: boolean) => Promise<void>) | null = null;
let _registration: ServiceWorkerRegistration | null = null;

export function pwaSetUpdateHandler(fn: (reload?: boolean) => Promise<void>) {
  _updateSW = fn;
}

export function pwaSetRegistration(reg: ServiceWorkerRegistration | undefined) {
  _registration = reg ?? null;
}

export function pwaTriggerNeedRefresh() {
  if (_onNeedRefresh) _onNeedRefresh();
}

// ─── React UI ─────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

export function PWAUpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    _onNeedRefresh = () => {
      setDismissed(false);
      setNeedRefresh(true);
    };
    return () => {
      _onNeedRefresh = null;
    };
  }, []);

  // Poll the registration every 30 min so the SW asks the network whether
  // a newer build is available. autoUpdate handles the install/activate;
  // this just nudges the check more aggressively than the browser default.
  useEffect(() => {
    const id = window.setInterval(() => {
      const reg = _registration;
      if (reg && typeof reg.update === 'function') {
        reg.update().catch((err: unknown) => {
          console.warn('[pwa] background update check failed', err);
        });
      }
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  if (!needRefresh || dismissed) return null;

  const onUpdate = async () => {
    try {
      if (_updateSW) {
        await _updateSW(true);
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.warn('[pwa] update failed; reloading', err);
      window.location.reload();
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 9999,
        maxWidth: 360,
        background: 'var(--bg-1, #161b22)',
        color: 'var(--text-1, #e6edf3)',
        border: '1px solid var(--border, #30363d)',
        borderRadius: 8,
        padding: '12px 14px',
        fontFamily: 'var(--font-mono, ui-monospace, monospace)',
        fontSize: 13,
        lineHeight: 1.4,
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>New version available</div>
        <div style={{ color: 'var(--text-2, #9da7b3)' }}>
          Refresh to install the update.
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button
          type="button"
          onClick={onUpdate}
          style={{
            background: '#58a6ff',
            color: '#0d1117',
            border: 'none',
            borderRadius: 4,
            padding: '6px 10px',
            fontSize: 12,
            fontFamily: 'inherit',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Update now
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          style={{
            background: 'transparent',
            color: 'var(--text-2, #9da7b3)',
            border: '1px solid var(--border, #30363d)',
            borderRadius: 4,
            padding: '6px 10px',
            fontSize: 12,
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        >
          Later
        </button>
      </div>
    </div>
  );
}
