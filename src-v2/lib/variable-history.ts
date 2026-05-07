/**
 * variable-history.ts
 *
 * Pure functions for managing variable value history within a TraceCard or
 * AdversarialMockCard simulation.
 *
 * Each variable in VariablesPanel has a `history: string[]` array. The CURRENT
 * value of a variable is the last item in the history; everything before it is
 * a stale value, displayed as strikethrough text in the watch-table cell.
 *
 * These helpers keep history mutation centralized and side-effect-free, so the
 * panel's reducer / parent state can call them without leaking edge cases.
 *
 * NO React, NO DOM. Pure data only.
 */

/** Push a new value onto a variable's history. The new value becomes "current". */
export function pushHistory(history: readonly string[], value: string): string[] {
  return [...history, value];
}

/** Get the current (last) value, or empty string if no history. */
export function getCurrent(history: readonly string[]): string {
  if (history.length === 0) return '';
  return history[history.length - 1] ?? '';
}

/** Get all stale values (everything except the most recent). */
export function getStale(history: readonly string[]): string[] {
  if (history.length <= 1) return [];
  return history.slice(0, -1);
}

/**
 * Replace the current (last) value without pushing a new history entry.
 * Used while the student is mid-edit and hasn't committed yet.
 */
export function replaceCurrent(history: readonly string[], value: string): string[] {
  if (history.length === 0) return [value];
  const out = history.slice(0, -1);
  out.push(value);
  return out;
}

/** Pop the most recent value (undo). Returns the same array if empty. */
export function popHistory(history: readonly string[]): string[] {
  if (history.length === 0) return [];
  return history.slice(0, -1);
}

/** Clear all history. */
export function clearHistory(): string[] {
  return [];
}

/**
 * Build a renderable representation: { stale: [...], current: "..." }.
 * UI layer renders `stale` items with strikethrough, then `current` in
 * normal text, exactly like the Q1 trace mutation visual.
 */
export interface RenderedHistory {
  stale: string[];
  current: string;
  hasHistory: boolean;
}

export function getAllWithStrikethrough(history: readonly string[]): RenderedHistory {
  return {
    stale: getStale(history),
    current: getCurrent(history),
    hasHistory: history.length > 0,
  };
}

/**
 * Compare two histories for equality (shallow string compare).
 * Useful for memoization / change detection in React state.
 */
export function historiesEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/** Length of history (number of times the variable has been written). */
export function historyDepth(history: readonly string[]): number {
  return history.length;
}
