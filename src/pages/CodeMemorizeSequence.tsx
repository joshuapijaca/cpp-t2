import { useState } from 'react';
import { CodeMemorize } from '../components/CodeMemorize';
import type { MemorizeDrillData } from '../components/CodeMemorize';
import { ProgressBar } from '../components/ProgressBar';
import memData from '../../data/code-memorize.json';

const DRILLS = memData as MemorizeDrillData[];

interface CodeMemorizeSequenceProps {
  onBackHome: () => void;
}

export function CodeMemorizeSequence({ onBackHome }: CodeMemorizeSequenceProps) {
  const [index, setIndex] = useState(0);

  const drill = DRILLS[index];

  const handleAdvance = () => {
    setIndex((i) => Math.min(DRILLS.length, i + 1));
  };

  if (!drill) {
    return (
      <div className="layout">
        <ProgressBar current={DRILLS.length} total={DRILLS.length} />
        <div className="nav-btns">
          <button type="button" className="nav-btn" onClick={onBackHome}>
            home
          </button>
        </div>
        <div className="empty-state">
          All {DRILLS.length} code memorization drills complete. Back to home.
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      <ProgressBar current={index} total={DRILLS.length} />
      <div className="nav-btns">
        <button type="button" className="nav-btn" onClick={onBackHome}>
          home
        </button>
      </div>
      <CodeMemorize
        key={drill.id}
        drill={drill}
        onAdvance={handleAdvance}
      />
    </div>
  );
}
