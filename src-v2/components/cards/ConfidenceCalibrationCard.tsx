/**
 * ConfidenceCalibrationCard.tsx
 *
 * Wrapper that bolts a 5-button confidence rating around an arbitrary
 * inner card. Two confidence prompts: BEFORE the answer (predicted) and
 * AFTER the answer is graded (post-hoc actual confidence). The component
 * computes a per-card Brier score and exposes it through `onCalibrate`,
 * which the adaptive-deck engine consumes for over/under-confidence
 * weighting.
 *
 * The component itself is a controlled-only wrapper: it does NOT load
 * the inner card. The host passes a `renderInner` render-prop with the
 * inner card already wired up; the wrapper simply manages the
 * before/after rating UX and the disabled-overlay during the predict
 * phase.
 *
 * Phases:
 *   PREDICT -> ANSWER -> POST-RATE -> CALIBRATED
 *
 *   PREDICT:    student picks 1 of [Guess|Hunch|Likely|Confident|Certain]
 *               BEFORE seeing the answer surface. Answer surface is
 *               aria-disabled until a stop is picked.
 *   ANSWER:     inner card runs normally; wrapper passes a guarded
 *               `onComplete` to capture pass/fail.
 *   POST-RATE:  after grade lands, student picks an after rating.
 *   CALIBRATED: Brier delta computed; onCalibrate called once.
 *
 * Brier score (per-card):
 *   - Map confidence stop -> probability:
 *       Guess=0.10, Hunch=0.30, Likely=0.55, Confident=0.80, Certain=0.95
 *   - actual = 1 if pass else 0
 *   - brier = (predicted - actual)^2  (lower = better calibration)
 *
 * Per RULE 4: keyboard-only operable (1..5 number keys + Enter/Esc),
 * full aria; the predicted vs actual comparison is announced via
 * aria-live on the calibration banner.
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { ConfidenceCalibrationCard as ConfidenceCalibrationCardData } from '../../types/card-schema';

// ─────────────────────────────────────────────────────────────────────
// Confidence stops — 5 fixed buttons.
// ─────────────────────────────────────────────────────────────────────

export type ConfidenceStopKey =
  | 'GUESS'
  | 'HUNCH'
  | 'LIKELY'
  | 'CONFIDENT'
  | 'CERTAIN';

interface Stop {
  key: ConfidenceStopKey;
  label: string;
  prob: number;
  hint: string;
}

const STOPS: Stop[] = [
  { key: 'GUESS', label: 'Guess', prob: 0.1, hint: 'no idea' },
  { key: 'HUNCH', label: 'Hunch', prob: 0.3, hint: 'leaning a way' },
  { key: 'LIKELY', label: 'Likely', prob: 0.55, hint: 'probably right' },
  { key: 'CONFIDENT', label: 'Confident', prob: 0.8, hint: 'very sure' },
  { key: 'CERTAIN', label: 'Certain', prob: 0.95, hint: 'I know this' },
];

function stopByKey(k: ConfidenceStopKey): Stop {
  // STOPS contains every key by construction; the find can never miss,
  // but we coerce defensively to avoid an undefined leak.
  const found = STOPS.find((s) => s.key === k);
  return found ?? (STOPS[0] as Stop);
}

// ─────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────

export interface CalibrationResult {
  predicted: ConfidenceStopKey;
  postHoc: ConfidenceStopKey;
  pass: boolean;
  /** Lower is better calibrated. 0..1 range. */
  brier: number;
  /** + means over-confident, - means under-confident. */
  delta: number;
}

export interface ConfidenceCalibrationCardProps {
  card: ConfidenceCalibrationCardData;
  /**
   * Render-prop for the inner card. The wrapper hands the inner an
   * `onComplete(correct)` and an `disabled` flag (to lock the surface
   * during the PREDICT phase).
   */
  renderInner: (args: {
    onComplete: (correct: boolean) => void;
    disabled: boolean;
  }) => ReactNode;
  onCalibrate?: (r: CalibrationResult) => void;
  onComplete: (correct: boolean) => void;
}

export interface ConfidenceCalibrationCardHandle {
  /** Reset to PREDICT phase (e.g. when host moves to a new card). */
  reset: () => void;
}

// ─────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────

type Phase = 'PREDICT' | 'ANSWER' | 'POST-RATE' | 'CALIBRATED';

export const ConfidenceCalibrationCard = forwardRef<
  ConfidenceCalibrationCardHandle,
  ConfidenceCalibrationCardProps
>(function ConfidenceCalibrationCard(
  { card, renderInner, onCalibrate, onComplete },
  ref,
) {
  const [phase, setPhase] = useState<Phase>('PREDICT');
  const [predicted, setPredicted] = useState<ConfidenceStopKey | null>(null);
  const [postHoc, setPostHoc] = useState<ConfidenceStopKey | null>(null);
  const [pass, setPass] = useState<boolean | null>(null);
  const calibratedFiredRef = useRef<boolean>(false);

  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        setPhase('PREDICT');
        setPredicted(null);
        setPostHoc(null);
        setPass(null);
        calibratedFiredRef.current = false;
      },
    }),
    [],
  );

  // Reset whenever the card id changes.
  useEffect(() => {
    setPhase('PREDICT');
    setPredicted(null);
    setPostHoc(null);
    setPass(null);
    calibratedFiredRef.current = false;
  }, [card.id]);

  // Number-key shortcut 1..5 selects a stop in the active rating phase.
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const key = e.key;
      if (!/^[1-5]$/.test(key)) return;
      const stop = STOPS[Number(key) - 1];
      if (!stop) return;
      if (phase === 'PREDICT') {
        e.preventDefault();
        onPredict(stop.key);
      } else if (phase === 'POST-RATE') {
        e.preventDefault();
        onPostRate(stop.key);
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const onPredict = useCallback((k: ConfidenceStopKey) => {
    setPredicted(k);
    setPhase('ANSWER');
  }, []);

  const onInnerComplete = useCallback(
    (correct: boolean) => {
      setPass(correct);
      setPhase('POST-RATE');
    },
    [],
  );

  const onPostRate = useCallback(
    (k: ConfidenceStopKey) => {
      setPostHoc(k);
      setPhase('CALIBRATED');
    },
    [],
  );

  // Fire onCalibrate + onComplete exactly once on entry to CALIBRATED.
  useEffect(() => {
    if (phase !== 'CALIBRATED') return;
    if (calibratedFiredRef.current) return;
    if (predicted == null || postHoc == null || pass == null) return;
    const pred = stopByKey(predicted);
    const actual = pass ? 1 : 0;
    const brier = Math.pow(pred.prob - actual, 2);
    const delta = pred.prob - actual;
    onCalibrate?.({
      predicted,
      postHoc,
      pass,
      brier,
      delta,
    });
    onComplete(pass);
    calibratedFiredRef.current = true;
  }, [phase, predicted, postHoc, pass, onCalibrate, onComplete]);

  const innerDisabled = phase === 'PREDICT';

  const calibrationBanner = useMemo(() => {
    if (phase !== 'CALIBRATED' || predicted == null || pass == null)
      return null;
    const pred = stopByKey(predicted);
    const actual = pass ? 1 : 0;
    const brier = Math.pow(pred.prob - actual, 2);
    const delta = pred.prob - actual;
    let verdict: string;
    if (Math.abs(delta) < 0.15) verdict = 'well-calibrated';
    else if (delta > 0)
      verdict = pass
        ? 'slightly over-confident — but you got it'
        : 'over-confident — review the atom';
    else
      verdict = pass
        ? 'under-confident — trust the work'
        : 'under-confident, and missed — drill more';
    return { brier, delta, verdict, predicted: pred };
  }, [phase, predicted, pass]);

  return (
    <section
      className="cal-root"
      role="application"
      aria-label={`Confidence calibration — atom ${card.atomId}`}
      data-testid="confidence-calibration-card"
    >
      <header className="cal-header">
        <span className="cal-stem">{card.stem}</span>
        <span className="cal-meta">
          <span className="cal-atom-id">{card.atomId}</span>
          <span className="cal-q-tags">{card.qTags.join(' · ')}</span>
          <span className="cal-phase" aria-label="phase">
            {phase}
          </span>
        </span>
      </header>

      {(phase === 'PREDICT' || phase === 'ANSWER') && (
        <RatingRow
          title="before answering — how confident are you?"
          selected={predicted}
          locked={phase !== 'PREDICT'}
          onSelect={onPredict}
        />
      )}

      <div
        className={`cal-inner ${innerDisabled ? 'cal-inner--disabled' : ''}`}
        aria-disabled={innerDisabled}
      >
        {innerDisabled && (
          <div
            className="cal-inner-overlay"
            role="status"
            aria-live="polite"
          >
            pick a confidence rating to unlock the question
          </div>
        )}
        {renderInner({
          onComplete: onInnerComplete,
          disabled: innerDisabled,
        })}
      </div>

      {(phase === 'POST-RATE' || phase === 'CALIBRATED') && (
        <RatingRow
          title="after answering — how confident are you NOW?"
          selected={postHoc}
          locked={phase === 'CALIBRATED'}
          onSelect={onPostRate}
        />
      )}

      {calibrationBanner && (
        <div
          className="cal-banner"
          role="status"
          aria-live="polite"
        >
          <strong>{calibrationBanner.verdict}</strong>
          <ul className="cal-stats">
            <li>
              predicted:{' '}
              <code>
                {calibrationBanner.predicted.label} (
                {(calibrationBanner.predicted.prob * 100).toFixed(0)}%)
              </code>
            </li>
            <li>
              outcome: <code>{pass ? 'correct' : 'incorrect'}</code>
            </li>
            <li>
              Brier: <code>{calibrationBanner.brier.toFixed(3)}</code>{' '}
              <span className="cal-stats-hint">
                (lower is better — 0 = perfect)
              </span>
            </li>
            <li>
              delta:{' '}
              <code>
                {calibrationBanner.delta > 0 ? '+' : ''}
                {calibrationBanner.delta.toFixed(2)}
              </code>{' '}
              <span className="cal-stats-hint">
                (+ = over, − = under)
              </span>
            </li>
          </ul>
        </div>
      )}

      <style>{CAL_STYLES}</style>
    </section>
  );
});

// ─────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────

interface RatingRowProps {
  title: string;
  selected: ConfidenceStopKey | null;
  locked: boolean;
  onSelect: (k: ConfidenceStopKey) => void;
}

function RatingRow({ title, selected, locked, onSelect }: RatingRowProps) {
  return (
    <div className="cal-rating" role="group" aria-label={title}>
      <span className="cal-rating-title">{title}</span>
      <div className="cal-rating-stops">
        {STOPS.map((s, i) => (
          <button
            key={s.key}
            type="button"
            className={`cal-stop ${selected === s.key ? 'is-active' : ''}`}
            onClick={() => onSelect(s.key)}
            aria-pressed={selected === s.key}
            aria-label={`${s.label} — ${s.hint} (press ${i + 1})`}
            disabled={locked}
            title={`${s.hint} — press ${i + 1}`}
          >
            <span className="cal-stop-key" aria-hidden="true">
              {i + 1}
            </span>
            <span className="cal-stop-label">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────────────────────────────

const CAL_STYLES = `
.cal-root {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  color: var(--text-0, #e6edf3);
  background: var(--bg-0, #0d1117);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
}
.cal-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--border-1, #30363d);
  padding-bottom: 6px;
}
.cal-stem { font-size: 13px; line-height: 1.45; }
.cal-meta { display: flex; gap: 10px; align-items: center; font-size: 11px; color: var(--text-1, #8b949e); }
.cal-atom-id {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-1, #30363d);
  border-radius: 3px;
  padding: 2px 6px;
  color: var(--accent-cyan, #79c0ff);
  letter-spacing: 0.05em;
}
.cal-q-tags { color: var(--accent-org, #ffa657); letter-spacing: 0.05em; }
.cal-phase {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--border-2, #484f58);
  border-radius: 3px;
  padding: 2px 6px;
  letter-spacing: 0.06em;
  color: var(--text-1, #8b949e);
}

.cal-rating {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.cal-rating-title {
  font-size: 11px;
  color: var(--text-1, #8b949e);
  letter-spacing: 0.04em;
}
.cal-rating-stops {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.cal-stop {
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
}
.cal-stop:hover:not(:disabled) {
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--accent-cyan, #79c0ff);
}
.cal-stop.is-active {
  background: rgba(121,192,255,0.12);
  border-color: var(--accent-cyan, #79c0ff);
  color: var(--accent-cyan, #79c0ff);
}
.cal-stop:focus-visible {
  outline: 2px solid var(--accent-cyan, #79c0ff);
  outline-offset: 2px;
}
.cal-stop:disabled { opacity: 0.5; cursor: not-allowed; }
.cal-stop-key {
  display: inline-block;
  width: 16px;
  height: 16px;
  text-align: center;
  line-height: 16px;
  font-size: 10px;
  background: var(--bg-2, #1f2937);
  border-radius: 2px;
  color: var(--text-2, #6e7681);
}

.cal-inner {
  position: relative;
  border: 1px dashed var(--border-1, #30363d);
  border-radius: 6px;
  padding: 4px;
}
.cal-inner--disabled { opacity: 0.4; pointer-events: none; }
.cal-inner-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--bg-2, #1f2937);
  color: var(--accent-yel, #d2a8ff);
  font-size: 10px;
  padding: 4px 8px;
  border: 1px solid var(--accent-yel, #d2a8ff);
  border-radius: 3px;
  letter-spacing: 0.04em;
  pointer-events: auto;
  opacity: 1;
}

.cal-banner {
  background: var(--bg-2, #1f2937);
  border: 1px solid var(--accent-grn, #7ee787);
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 12px;
}
.cal-banner strong { color: var(--accent-grn, #7ee787); }
.cal-stats {
  list-style: none;
  margin: 6px 0 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  color: var(--text-1, #8b949e);
}
.cal-stats code {
  background: var(--bg-0, #0d1117);
  padding: 1px 5px;
  border-radius: 2px;
  color: var(--accent-cyan, #79c0ff);
}
.cal-stats-hint { color: var(--text-2, #6e7681); font-size: 10px; }
`;

export default ConfidenceCalibrationCard;
