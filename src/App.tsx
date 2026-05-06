import { useState } from 'react';
import { Home } from './pages/Home';
import { Sequence } from './pages/Sequence';
import { M13_DECOMPOSE_PREVIEW } from './data/m13-decompose-preview';
import { M14_WALKTHROUGH_PREVIEW } from './data/m14-walkthrough-preview';

type View =
  | { mode: 'home' }
  | { mode: 'sequence'; startIndex: number }
  | { mode: 'm13-preview' }
  | { mode: 'm14-preview' };

export default function App() {
  const [view, setView] = useState<View>({ mode: 'home' });

  if (view.mode === 'home') {
    return (
      <Home
        onPick={(startIndex) => setView({ mode: 'sequence', startIndex })}
        onPickM13Preview={() => setView({ mode: 'm13-preview' })}
        onPickM14Preview={() => setView({ mode: 'm14-preview' })}
      />
    );
  }

  if (view.mode === 'm13-preview') {
    return (
      <Sequence
        startIndex={0}
        onBackHome={() => setView({ mode: 'home' })}
        previewCards={M13_DECOMPOSE_PREVIEW}
        previewLabel="M13 decompose preview"
      />
    );
  }

  if (view.mode === 'm14-preview') {
    return (
      <Sequence
        startIndex={0}
        onBackHome={() => setView({ mode: 'home' })}
        previewCards={M14_WALKTHROUGH_PREVIEW}
        previewLabel="M14 walkthrough preview"
      />
    );
  }

  return (
    <Sequence
      startIndex={view.startIndex}
      onBackHome={() => setView({ mode: 'home' })}
    />
  );
}
