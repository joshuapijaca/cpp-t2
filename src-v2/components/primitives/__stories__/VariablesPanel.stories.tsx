/**
 * VariablesPanel.stories.tsx
 *
 * Lightweight stateful "stories" for VariablesPanel. cpp-t2 does not use
 * Storybook; instead each story is an exported React component that wires up
 * realistic state and can be mounted from a story-harness route or simply
 * imported in tests.
 *
 * Stories:
 *   1. Empty           — no variables, the empty-state hint appears.
 *   2. SingleInt       — one local int the student has updated once.
 *   3. StructWithArr   — Q1 trace setup: a struct holding an int[] field
 *                        plus loop iterators (i, sum).
 *   4. MidIteration    — trace mid-loop: i has been pushed 3 times so the
 *                        value cell shows strikethrough history then current.
 *   5. FullStructMut   — late-stage Q1: the struct field has been mutated,
 *                        plus a stale row (out-of-scope) is present.
 *
 * Each story manages its own state with the same Variable[] type the real
 * TraceCard will use, so any wiring discovered here transfers 1:1.
 */

import { useState } from 'react';
import {
  VariablesPanel,
  type Variable,
  type VariableType,
} from '../VariablesPanel';

/* ---------------------------------------------------------------------------
 * Shared state hook (matches the parent contract used by TraceCard)
 * --------------------------------------------------------------------------*/

const TYPE_DEFAULTS: Record<VariableType, string> = {
  int: '0',
  double: '0.0',
  string: '""',
  bool: 'false',
  char: "'?'",
  struct: '{ }',
};

const TYPE_CYCLE: VariableType[] = [
  'int',
  'double',
  'string',
  'bool',
  'char',
  'struct',
];

function nextType(prev: VariableType | undefined): VariableType {
  if (!prev) return 'int';
  const i = TYPE_CYCLE.indexOf(prev);
  return TYPE_CYCLE[(i + 1) % TYPE_CYCLE.length] ?? 'int';
}

function useVariablesState(initial: Variable[]) {
  const [vars, setVars] = useState<Variable[]>(initial);

  const onAdd = (afterId?: string) => {
    setVars((prev) => {
      const lastType =
        afterId && prev.find((v) => v.id === afterId)?.type
          ? nextType(prev.find((v) => v.id === afterId)?.type)
          : prev.length > 0
          ? nextType(prev[prev.length - 1]!.type)
          : 'int';
      const id = `v_${Math.random().toString(36).slice(2, 8)}`;
      return [
        ...prev,
        {
          id,
          name: '',
          type: lastType,
          value: TYPE_DEFAULTS[lastType] ?? '',
          scope: 'local',
          history: [],
        },
      ];
    });
  };

  const onUpdate = (id: string, patch: Partial<Variable>) => {
    setVars((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...patch } : v))
    );
  };

  const onRemove = (id: string) => {
    setVars((prev) => prev.filter((v) => v.id !== id));
  };

  const onReorder = (id: string, target: number) => {
    setVars((prev) => {
      const i = prev.findIndex((v) => v.id === id);
      if (i < 0) return prev;
      const out = [...prev];
      const [moved] = out.splice(i, 1);
      if (!moved) return prev;
      out.splice(target, 0, moved);
      return out;
    });
  };

  return { vars, onAdd, onUpdate, onRemove, onReorder };
}

/* ---------------------------------------------------------------------------
 * Story 1: Empty
 * --------------------------------------------------------------------------*/

export function Empty() {
  const s = useVariablesState([]);
  return (
    <StoryFrame title="Empty">
      <VariablesPanel
        variables={s.vars}
        onAdd={s.onAdd}
        onUpdate={s.onUpdate}
        onRemove={s.onRemove}
        onReorder={s.onReorder}
      />
    </StoryFrame>
  );
}

/* ---------------------------------------------------------------------------
 * Story 2: Single int
 * --------------------------------------------------------------------------*/

export function SingleInt() {
  const s = useVariablesState([
    {
      id: 'v_count',
      name: 'count',
      type: 'int',
      value: '5',
      scope: 'local',
      history: ['5'],
    },
  ]);
  return (
    <StoryFrame title="Single int">
      <VariablesPanel
        variables={s.vars}
        onAdd={s.onAdd}
        onUpdate={s.onUpdate}
        onRemove={s.onRemove}
        onReorder={s.onReorder}
      />
    </StoryFrame>
  );
}

/* ---------------------------------------------------------------------------
 * Story 3: Struct with array field — Q1 trace setup
 *
 *   struct StatBlock {
 *     int scores[5];
 *     int total;
 *   };
 *   StatBlock s = { {2,4,6,8,10}, 0 };
 *   for (int i = 0; i < 5; i++) s.total += s.scores[i];
 *
 * Initial state of the watch table BEFORE the loop runs: i and total are
 * both fresh local ints with their starting values.
 * --------------------------------------------------------------------------*/

export function StructWithArr() {
  const s = useVariablesState([
    {
      id: 'v_s',
      name: 's',
      type: 'struct',
      value: '{ {2,4,6,8,10}, 0 }',
      scope: 'local',
      history: ['{ {2,4,6,8,10}, 0 }'],
    },
    {
      id: 'v_i',
      name: 'i',
      type: 'int',
      value: '0',
      scope: 'local',
      history: ['0'],
    },
  ]);
  return (
    <StoryFrame title="Struct with array field (Q1 setup)">
      <VariablesPanel
        variables={s.vars}
        onAdd={s.onAdd}
        onUpdate={s.onUpdate}
        onRemove={s.onRemove}
        onReorder={s.onReorder}
      />
    </StoryFrame>
  );
}

/* ---------------------------------------------------------------------------
 * Story 4: Mid-iteration — values pushed 3 times, history visible
 * --------------------------------------------------------------------------*/

export function MidIteration() {
  const s = useVariablesState([
    {
      id: 'v_s',
      name: 's',
      type: 'struct',
      value: '{ {2,4,6,8,10}, 12 }',
      scope: 'local',
      history: [
        '{ {2,4,6,8,10}, 0 }',
        '{ {2,4,6,8,10}, 2 }',
        '{ {2,4,6,8,10}, 6 }',
        '{ {2,4,6,8,10}, 12 }',
      ],
    },
    {
      id: 'v_i',
      name: 'i',
      type: 'int',
      value: '3',
      scope: 'local',
      history: ['0', '1', '2', '3'],
    },
  ]);
  return (
    <StoryFrame title="Mid-iteration: history strikethrough">
      <VariablesPanel
        variables={s.vars}
        onAdd={s.onAdd}
        onUpdate={s.onUpdate}
        onRemove={s.onRemove}
        onReorder={s.onReorder}
      />
    </StoryFrame>
  );
}

/* ---------------------------------------------------------------------------
 * Story 5: Full struct mutation visible + stale row
 * --------------------------------------------------------------------------*/

export function FullStructMut() {
  const s = useVariablesState([
    {
      id: 'v_s',
      name: 's',
      type: 'struct',
      value: '{ {2,4,6,8,10}, 30 }',
      scope: 'local',
      history: [
        '{ {2,4,6,8,10}, 0 }',
        '{ {2,4,6,8,10}, 2 }',
        '{ {2,4,6,8,10}, 6 }',
        '{ {2,4,6,8,10}, 12 }',
        '{ {2,4,6,8,10}, 20 }',
        '{ {2,4,6,8,10}, 30 }',
      ],
    },
    {
      id: 'v_i',
      name: 'i',
      type: 'int',
      value: '5',
      scope: 'local',
      history: ['0', '1', '2', '3', '4', '5'],
      stale: true, // loop has exited; i is out-of-scope visually
    },
    {
      id: 'v_avg',
      name: 'avg',
      type: 'double',
      value: '6.0',
      scope: 'local',
      history: ['6.0'],
    },
    {
      id: 'v_FACTOR',
      name: 'FACTOR',
      type: 'int',
      value: '2',
      scope: 'global',
      history: ['2'],
    },
  ]);
  return (
    <StoryFrame title="Full struct mutation + stale row + global">
      <VariablesPanel
        variables={s.vars}
        onAdd={s.onAdd}
        onUpdate={s.onUpdate}
        onRemove={s.onRemove}
        onReorder={s.onReorder}
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
        VariablesPanel · {title}
      </h3>
      {children}
    </div>
  );
}

/* All-in-one harness */
export default function AllVariablesPanelStories() {
  return (
    <div>
      <Empty />
      <SingleInt />
      <StructWithArr />
      <MidIteration />
      <FullStructMut />
    </div>
  );
}
