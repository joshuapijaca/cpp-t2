import { useState } from 'react';
import { ProceduralDrill } from '../components/ProceduralDrill';
import type { DrillData } from '../components/ProceduralDrill';
import { ProgressBar } from '../components/ProgressBar';
import drillsData from '../../data/procedural-drills.json';

const DRILLS = drillsData as DrillData[];

interface ProceduralSequenceProps {
  onBackHome: () => void;
}

export function ProceduralSequence({ onBackHome }: ProceduralSequenceProps) {
  const [index, setIndex] = useState(0);

  const drill = DRILLS[index];

  const handleComplete = () => {
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
          All {DRILLS.length} procedural drills complete (3-streak each). Back to home.
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
      <ProceduralDrill
        key={drill.id}
        drill={drill}
        onComplete={handleComplete}
      />
    </div>
  );
}
