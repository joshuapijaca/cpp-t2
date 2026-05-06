import { useEffect, useState } from 'react';

interface MockExamTimerProps {
  examId: string;          // unique key per exam to reset on enter
  durationSeconds: number; // default 5400 (90 min)
}

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function MockExamTimer({ examId, durationSeconds }: MockExamTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);

  useEffect(() => {
    setSecondsLeft(durationSeconds);
  }, [examId, durationSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [secondsLeft]);

  const expired = secondsLeft <= 0;
  const lowTime = secondsLeft <= 300;

  return (
    <div
      className={
        'mock-timer' +
        (expired ? ' mock-timer--expired' : lowTime ? ' mock-timer--low' : '')
      }
      role="timer"
    >
      <span className="mock-timer__label">{examId} ·</span>{' '}
      <span className="mock-timer__time">{fmt(secondsLeft)}</span>
      {expired && <span className="mock-timer__expired"> · TIME UP</span>}
    </div>
  );
}
