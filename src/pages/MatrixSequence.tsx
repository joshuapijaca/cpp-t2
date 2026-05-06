import { useState } from 'react';
import { CodeMatrix } from '../components/CodeMatrix';
import type { MatrixData } from '../components/CodeMatrix';
import { ProgressBar } from '../components/ProgressBar';
import matricesData from '../../data/code-matrices.json';

const MATRICES = matricesData as MatrixData[];

interface MatrixSequenceProps {
  onBackHome: () => void;
}

export function MatrixSequence({ onBackHome }: MatrixSequenceProps) {
  const [index, setIndex] = useState(0);

  const matrix = MATRICES[index];

  const handleAdvance = () => {
    setIndex((i) => Math.min(MATRICES.length, i + 1));
  };

  if (!matrix) {
    return (
      <div className="layout">
        <ProgressBar current={MATRICES.length} total={MATRICES.length} />
        <div className="nav-btns">
          <button type="button" className="nav-btn" onClick={onBackHome}>
            home
          </button>
        </div>
        <div className="empty-state">
          All {MATRICES.length} code matrices complete. Back to home.
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      <ProgressBar current={index} total={MATRICES.length} />
      <div className="nav-btns">
        <button type="button" className="nav-btn" onClick={onBackHome}>
          home
        </button>
      </div>
      <CodeMatrix
        key={matrix.id}
        matrix={matrix}
        onAdvance={handleAdvance}
      />
    </div>
  );
}
