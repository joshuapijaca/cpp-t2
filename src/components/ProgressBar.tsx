interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <>
      <div
        className="progress-bar"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemax={total}
        aria-valuemin={0}
      >
        <div className="progress-bar__fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="progress-bar__label">
        {current} / {total}
      </div>
    </>
  );
}
