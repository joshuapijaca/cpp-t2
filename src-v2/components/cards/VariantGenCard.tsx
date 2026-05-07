/**
 * VariantGenCard.tsx
 *
 * "Given THIS seed code, produce N working variants of the same idiom."
 *
 * The student is shown the seed and a list of constraints. They author
 * `card.variantCount` variants, each in a separate text input. Submit
 * grades each variant against `card.canonicalVariants` via lenient
 * char-match plus per-variant key-check coverage.
 *
 * Build-time vs runtime: the schema has `canonicalVariants` —
 * essentially the build-time precomputed answer set. This component
 * does NOT generate variants at runtime (RULE 4 — zero AI calls). The
 * canonicalVariants array is the authoritative answer key.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────────────────────┐
 *   │ Header: stem + atom id                                           │
 *   ├──────────────────────────────────────────────────────────────────┤
 *   │ seedCode pane (read-only)                                        │
 *   ├──────────────────────────────────────────────────────────────────┤
 *   │ constraints list (read-only)                                     │
 *   ├──────────────────────────────────────────────────────────────────┤
 *   │ N variant slots (each writable + per-variant submit indicator)   │
 *   ├──────────────────────────────────────────────────────────────────┤
 *   │ submit-all                                                       │
 *   └──────────────────────────────────────────────────────────────────┘
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';
import type { VariantGenCard as VariantGenCardData } from '../../types/card-schema';

// ─────────────────────────────────────────────────────────────────────
// Grading
// ─────────────────────────────────────────────────────────────────────

function normalizeLenient(s: string): string {
  return s
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, '').replace(/[ \t]+/g, ' '))
    .join('\n')
    .trim();
}

interface VariantGrade {
  index: number;
  /** -1 if not matched to any canonical variant. */
  matchedCanonicalIdx: number;
  pass: boolean;
  keyCheckResults: { needle: string; ok: boolean }[];
}

interface FullGrade {
  perVariant: VariantGrade[];
  pass: boolean;
  passCount: number;
}

function gradeVariants(
  variants: string[],
  card: VariantGenCardData,
): FullGrade {
  const usedCanonical = new Set<number>();
  const perVariant: VariantGrade[] = variants.map((v, i) => {
    const stuN = normalizeLenient(v);
    let matched = -1;
    if (stuN.length > 0) {
      for (let c = 0; c < card.canonicalVariants.length; c++) {
        if (usedCanonical.has(c)) continue;
        const can = card.canonicalVariants[c];
        if (!can) continue;
        if (stuN === normalizeLenient(can)) {
          matched = c;
          usedCanonical.add(c);
          break;
        }
      }
    }
    const keyCheckResults = (card.keyChecks ?? []).map((needle) => ({
      needle,
      ok: stuN.includes(normalizeLenient(needle)),
    }));
    const allKeysOk =
      keyCheckResults.length > 0
        ? keyCheckResults.every((k) => k.ok)
        : matched >= 0;
    const pass =
      stuN.length > 0 && (matched >= 0 || allKeysOk);
    return {
      index: i,
      matchedCanonicalIdx: matched,
      pass,
      keyCheckResults,
    };
  });

  const passCount = perVariant.filter((p) => p.pass).length;
  // Pass requires ALL variants to be valid AND distinct (caught by
  // usedCanonical exclusion above when canonical match is the route).
  const pass = passCount === card.variantCount && deDupe(variants);
  return { perVariant, pass, passCount };
}

function deDupe(variants: string[]): boolean {
  const seen = new Set<string>();
  for (const v of variants) {
    const n = normalizeLenient(v);
    if (n === '') continue;
    if (seen.has(n)) return false;
    seen.add(n);
  }
  return true;
}

// ─────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────

export interface VariantGenCardProps {
  card: VariantGenCardData;
  onComplete: (correct: boolean) => void;
}

// ─────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────

export function VariantGenCard({
  card,
  onComplete,
}: VariantGenCardProps) {
  const [variants, setVariants] = useState<string[]>(() =>
    Array.from({ length: card.variantCount }, () => ''),
  );
  const [grade, setGrade] = useState<FullGrade | null>(null);

  useEffect(() => {
    setVariants(Array.from({ length: card.variantCount }, () => ''));
    setGrade(null);
  }, [card.id, card.variantCount]);

  const onChange = useCallback((i: number, value: string) => {
    setVariants((prev) => prev.map((v, idx) => (idx === i ? value : v)));
  }, []);

  const onSubmit = useCallback(() => {
    const result = gradeVariants(variants, card);
    setGrade(result);
    if (result.pass) onComplete(true);
  }, [variants, card, onComplete]);

  const onTryAgain = useCallback(() => setGrade(null), []);

  // Ctrl/Cmd+Enter submit.
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onSubmit]);

  const layoutStyle: CSSProperties = useMemo(
    () => ({
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      padding: 12,
      width: '100%',
      maxWidth: 1280,
      margin: '0 auto',
    }),
    [],
  );

  const filledCount = variants.filter((v) => v.trim() !== '').length;

  return (
    <section
      className="vgc-root"
      role="application"
      aria-label={`Variant generation — atom ${card.atomId}`}
      data-testid="variant-gen-card"
      style={layoutStyle}
    >
      <header className="vgc-header">
        <div className="vgc-title-block">
          <span className="vgc-tag">variants × {card.variantCount}</span>
          <span className="vgc-stem">{card.stem}</span>
        </div>
        <div className="vgc-meta">
          <span className="vgc-atom-id">{card.atomId}</span>
          <span className="vgc-q-tags">{card.qTags.join(' · ')}</span>
        </div>
      </header>

      <section
        className="vgc-seed"
        role="region"
        aria-label="seed code"
      >
        <h3>seed</h3>
        <pre className="vgc-seed-pre">{card.seedCode}</pre>
      </section>

      {card.constraints.length > 0 && (
        <section
          className="vgc-constraints"
          role="region"
          aria-label="constraints"
        >
          <h3>constraints (every variant must satisfy)</h3>
          <ul className="vgc-constraints-list">
            {card.constraints.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="vgc-variants">
        <h3>
          your variants ({filledCount}/{card.variantCount} filled)
        </h3>
        <div className="vgc-slots">
          {variants.map((v, i) => {
            const result = grade?.perVariant[i];
            const status = result
              ? result.pass
                ? 'ok'
                : 'bad'
              : '';
            return (
              <div key={i} className={`vgc-slot ${status}`}>
                <label
                  htmlFor={`vgc-variant-${i}`}
                  className="vgc-slot-label"
                >
                  variant {i + 1}
                  {result && (
                    <span className="vgc-slot-badge" aria-live="polite">
                      {result.pass ? '✓' : '✗'}{' '}
                      {result.matchedCanonicalIdx >= 0 &&
                        `matched #${result.matchedCanonicalIdx + 1}`}
                    </span>
                  )}
                </label>
                <textarea
                  id={`vgc-variant-${i}`}
                  className="vgc-slot-input"
                  value={v}
                  onChange={(e) => onChange(i, e.target.value)}
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  rows={5}
                  placeholder={`// variant ${i + 1}`}
                  aria-label={`variant ${i + 1} input`}
                  readOnly={grade?.pass === true}
                />
              </div>
            );
          })}
        </div>
      </section>

      <footer className="vgc-footer">
        <span className="vgc-progress">
          {grade
            ? `passed ${grade.passCount}/${card.variantCount}`
            : `Ctrl/Cmd+Enter submits`}
        </span>
        <div>
          {grade && !grade.pass && (
            <button
              type="button"
              className="vgc-btn vgc-btn--ghost"
              onClick={onTryAgain}
            >
              try again
            </button>
          )}
          <button
            type="button"
            className="vgc-btn vgc-btn--primary"
            onClick={onSubmit}
            disabled={
              grade?.pass === true || filledCount < card.variantCount
            }
            aria-label="submit all variants"
          >
            {grade?.pass ? 'passed' : 'submit all'}
          </button>
        </div>
      </footer>

      {grade && (
        <div
          className={`vgc-feedback ${grade.pass ? 'vgc-feedback--ok' : 'vgc-feedback--fail'}`}
          role="status"
          aria-live="polite"
        >
          <strong>
            {grade.pass
              ? `✓ all ${card.variantCount} variants accepted`
              : `${grade.passCount}/${card.variantCount} accepted${!deDupe(variants) ? ' — duplicates detected' : ''}`}
          </strong>
          {!grade.pass && (
            <details className="vgc-canon">
              <summary>show canonical variants</summary>
              {card.canonicalVariants.map((cv, i) => (
                <div key={i} className="vgc-canon-block">
                  <h4>variant {i + 1}</h4>
                  <pre>{cv}</pre>
                </div>
              ))}
              <p>{card.explanation}</p>
            </details>
          )}
        </div>
      )}

      <style>{VGC_STYLES}</style>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────

const VGC_STYLES = `
.vgc-root {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  color: var(--text-0, #e6edf3);
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
}
.vgc-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--border-1, #30363d);
  padding-bottom: 8px;
}
.vgc-title-block { display: flex; align-items: center; gap: 8px; flex: 1 1 360px; flex-wrap: wrap; }
.vgc-tag {
  background: rgba(126,231,135,0.12);
  color: var(--accent-grn, #7ee787);
  border: 1px solid var(--accent-grn, #7ee787);
  border-radius: 3px;
  padding: 2px 8px;
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.vgc-stem { font-size: 13px; line-height: 1.45; }
.vgc-meta { display: flex; gap: 10px; align-items: center; font-size: 11px; }
.vgc-atom-id {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 3px;
  padding: 2px 6px;
  color: var(--accent-cyan, #79c0ff);
  letter-spacing: 0.05em;
}
.vgc-q-tags { color: var(--accent-org, #ffa657); }

.vgc-seed,
.vgc-constraints,
.vgc-variants {
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 10px 12px;
}
.vgc-seed h3,
.vgc-constraints h3,
.vgc-variants h3 {
  margin: 0 0 6px 0;
  font-size: 11px;
  color: var(--text-2, #6e7681);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.vgc-seed-pre {
  margin: 0;
  padding: 8px;
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  white-space: pre-wrap;
  font-size: 12px;
  color: var(--text-0, #e6edf3);
}
.vgc-constraints-list {
  margin: 0;
  padding-left: 24px;
  font-size: 12px;
  color: var(--text-0, #e6edf3);
}

.vgc-slots {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 10px;
}
.vgc-slot {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  background: var(--bg-2, #1f2937);
}
.vgc-slot.ok { border-color: var(--accent-grn, #7ee787); }
.vgc-slot.bad { border-color: var(--accent-pink, #ff7b72); }
.vgc-slot-label {
  font-size: 10px;
  color: var(--text-2, #6e7681);
  letter-spacing: 0.05em;
  text-transform: lowercase;
  display: flex;
  justify-content: space-between;
}
.vgc-slot-badge { font-size: 11px; color: var(--text-0, #e6edf3); }
.vgc-slot.ok .vgc-slot-badge { color: var(--accent-grn, #7ee787); }
.vgc-slot.bad .vgc-slot-badge { color: var(--accent-pink, #ff7b72); }
.vgc-slot-input {
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 4px;
  color: var(--accent-grn, #7ee787);
  font-family: inherit;
  font-size: 12px;
  padding: 8px 10px;
  resize: vertical;
  min-height: 80px;
  outline: 0;
  caret-color: var(--accent-grn, #7ee787);
}
.vgc-slot-input:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: -2px;
}

.vgc-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: var(--text-1, #8b949e);
}
.vgc-progress { letter-spacing: 0.04em; }
.vgc-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-1, #161b22);
  border: 1px solid var(--border-1, #30363d);
  color: var(--text-0, #e6edf3);
  font-family: inherit;
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 6px;
}
.vgc-btn:hover:not(:disabled) {
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--accent-cyan, #79c0ff);
}
.vgc-btn:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.vgc-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.vgc-btn--primary {
  background: var(--accent-cyan, #79c0ff);
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--bg-0, #0d1117);
  font-weight: 600;
}
.vgc-btn--primary:hover:not(:disabled) {
  background: var(--accent-grn, #7ee787);
  border-color: var(--accent-grn, #7ee787);
}
.vgc-btn--ghost { background: transparent; }
.vgc-feedback {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 12px;
}
.vgc-feedback--ok { border-color: var(--accent-grn, #7ee787); }
.vgc-feedback--fail { border-color: var(--accent-pink, #ff7b72); }
.vgc-canon {
  margin-top: 6px;
  font-size: 11px;
  color: var(--text-1, #8b949e);
}
.vgc-canon summary { cursor: pointer; color: var(--accent-cyan, #79c0ff); }
.vgc-canon-block { margin-top: 6px; }
.vgc-canon-block h4 {
  margin: 0 0 4px 0;
  font-size: 11px;
  color: var(--text-2, #6e7681);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.vgc-canon-block pre {
  margin: 0 0 8px 0;
  padding: 8px;
  background: var(--bg-0, #0d1117);
  border-radius: 3px;
  white-space: pre-wrap;
  color: var(--text-0, #e6edf3);
}
`;

export default VariantGenCard;
