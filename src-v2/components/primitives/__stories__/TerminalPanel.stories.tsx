/**
 * TerminalPanel.stories.tsx
 *
 * Story-style scenarios for TerminalPanel. cpp-t2 does not use Storybook;
 * each story is a stateful React component you can mount from a harness
 * route to verify behaviour by hand.
 *
 * Stories:
 *   1. Empty           — fresh terminal, no output yet, exit code = 0.
 *   2. HelloWorld      — three cout lines, exit 0.
 *   3. CinPrompt       — single cin awaiting input (cursor blink).
 *   4. CoutCinInterleave — full Q1-style interaction: cout, cin, cout, cin,
 *                        cout, exit 0. The student has already submitted both
 *                        inputs; replays the post-submission state.
 */

import { useState } from 'react';
import { TerminalPanel } from '../TerminalPanel';

/* ---------------------------------------------------------------------------
 * Story 1: Empty
 * --------------------------------------------------------------------------*/

export function Empty() {
  return (
    <StoryFrame title="Empty">
      <TerminalPanel stdoutLines={[]} stdinPrompts={[]} />
    </StoryFrame>
  );
}

/* ---------------------------------------------------------------------------
 * Story 2: Hello world
 * --------------------------------------------------------------------------*/

export function HelloWorld() {
  return (
    <StoryFrame title="Hello world (cout only)">
      <TerminalPanel
        stdoutLines={[
          'Hello, world!',
          'sum = 30',
          'avg = 6.0',
        ]}
        stdinPrompts={[]}
        exitCode={0}
      />
    </StoryFrame>
  );
}

/* ---------------------------------------------------------------------------
 * Story 3: cin prompt waiting
 * --------------------------------------------------------------------------*/

export function CinPromptWaiting() {
  const [values, setValues] = useState<string[]>([]);
  return (
    <StoryFrame title="cin prompt waiting">
      <TerminalPanel
        stdoutLines={['Welcome to the gradebook.']}
        stdinPrompts={['Enter your name: ']}
        stdinValues={values}
        onStdinSubmit={(v) => setValues((prev) => [...prev, v])}
      />
    </StoryFrame>
  );
}

/* ---------------------------------------------------------------------------
 * Story 4: cout + cin interleave (Q1-style)
 * --------------------------------------------------------------------------*/

export function CoutCinInterleave() {
  const [values, setValues] = useState<string[]>(['Alice', '85']);
  const stdoutLines = [
    'Welcome to the gradebook.',
    'Hello, Alice — score recorded: 85',
    'Final grade: HD',
  ];
  return (
    <StoryFrame title="cout + cin interleave (Q1-style)">
      <TerminalPanel
        stdoutLines={stdoutLines}
        stdinPrompts={['Enter your name: ', 'Enter your score: ']}
        stdinValues={values}
        onStdinSubmit={(v) => setValues((prev) => [...prev, v])}
        exitCode={0}
      />
    </StoryFrame>
  );
}

/* ---------------------------------------------------------------------------
 * Story frame
 * --------------------------------------------------------------------------*/

function StoryFrame({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: 'var(--bg-0, #0d1117)',
        padding: 24,
        maxWidth: 720,
        margin: '24px auto',
        fontFamily: 'system-ui, sans-serif',
        color: 'var(--text-0, #e6edf3)',
      }}
    >
      <h3
        style={{
          fontSize: 13,
          color: 'var(--text-1, #8b949e)',
          fontFamily: 'monospace',
          letterSpacing: '0.05em',
          margin: '0 0 12px 0',
          textTransform: 'lowercase',
        }}
      >
        TerminalPanel · {title}
      </h3>
      {children}
    </div>
  );
}

export default function AllTerminalPanelStories() {
  return (
    <div>
      <Empty />
      <HelloWorld />
      <CinPromptWaiting />
      <CoutCinInterleave />
    </div>
  );
}
