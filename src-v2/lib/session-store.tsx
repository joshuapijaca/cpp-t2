/**
 * session-store.ts — In-memory React Context for student session state.
 *
 * Wraps the engine SessionState (exposure-counter) plus a
 * StageGateState (stage-gate) and a derived weakness file. The store is
 * deliberately minimal and session-only: no localStorage, no backend, no
 * persistence between page reloads. This matches CLAUDE.md RULE 4
 * (session-only state) and the v2 spec.
 *
 * Hooks exposed:
 *   useSession()              — full state + dispatchers
 *   useFamiliarity(qTag)      — Q-track percent + atom buckets
 *   useTodayDeck()            — composed daily deck for today's day-number
 *   useWeaknessFile()         — derived weakness entries (worst-first)
 *   useStageProgress(qTag)    — current stage, unlocked stages, can-skip flag
 *   useTestCountdown()        — days remaining to test date
 *   useAtomCount() / useCardCount() — registry counts for footer
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';

import type { Card, QTag } from '../types/card-schema';
import {
  createInitialState,
  getAllAtomFamiliarities,
  getAtomFamiliarity,
  getCardStatus,
  getQTrackFamiliarity,
  recordCardResult,
  registerCards,
  type CardMeta,
  type QTrackFamiliarity,
  type SessionState,
} from '../engines/exposure-counter';
import {
  createInitialStageGateState,
  getProgress,
  highestPromotedStage,
  manualOverride,
  PROMOTION_THRESHOLDS,
  setProgress,
  type ManualOverrideResult,
  type Stage,
  type StageGateState,
  type StageProgress,
} from '../engines/stage-gate';
import {
  composeDailyDeck,
  resolveStageGate,
  type ComposeOptions,
} from '../engines/daily-deck-composer';

// ─────────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────────

/** Test date (ISO YYYY-MM-DD) — Deakin SIT102 Test 2 first attempt. */
export const TEST_DATE_ISO = '2026-05-07';

/** A weakness-file entry surfaced to the UI. */
export interface WeaknessEntry {
  readonly atomId: string;
  /** 0..1 severity. Higher = worse. */
  readonly severity: number;
  readonly fails: number;
  readonly familiarity: number;
}

/**
 * A "drill request" — set by Track / Atoms / Weakness / Postmortem when
 * the student picks a target, read by Session on mount. Replaces the old
 * window.history.state hack which the consumer never read.
 */
export interface DrillRequest {
  readonly cardIds?: readonly string[];
  readonly atomIds?: readonly string[];
  readonly qTag?: QTag;
}

/** Session-store value handed out by the context. */
export interface SessionStoreValue {
  readonly state: SessionState;
  readonly stageGate: StageGateState;
  readonly cards: readonly Card[];
  readonly dayNumber: number;
  readonly drillRequest: DrillRequest | null;

  // Mutators -- replace state immutably
  registerCardsAction: (metas: readonly CardMeta[]) => void;
  loadCardsAction: (cards: readonly Card[]) => void;
  recordResultAction: (cardId: string, correct: boolean) => void;
  setStageProgressAction: (progress: StageProgress) => void;
  advanceDayAction: () => void;
  setDrillRequestAction: (req: DrillRequest | null) => void;
}

// ─────────────────────────────────────────────────────────────────────────
// Reducer
// ─────────────────────────────────────────────────────────────────────────

interface InternalState {
  state: SessionState;
  stageGate: StageGateState;
  cards: readonly Card[];
  dayNumber: number;
  drillRequest: DrillRequest | null;
}

type Action =
  | { type: 'REGISTER_CARDS'; metas: readonly CardMeta[] }
  | { type: 'LOAD_CARDS'; cards: readonly Card[] }
  | { type: 'RECORD_RESULT'; cardId: string; correct: boolean }
  | { type: 'SET_STAGE_PROGRESS'; progress: StageProgress }
  | { type: 'ADVANCE_DAY' }
  | { type: 'SET_DRILL_REQUEST'; req: DrillRequest | null };

function reducer(s: InternalState, a: Action): InternalState {
  switch (a.type) {
    case 'REGISTER_CARDS':
      return { ...s, state: registerCards(s.state, a.metas) };
    case 'LOAD_CARDS': {
      const metas: CardMeta[] = a.cards.map((c) => ({
        cardId: c.id,
        atomId: c.atomId,
        qTags: c.qTags,
        length: 'medium',
      }));
      return {
        ...s,
        cards: a.cards,
        state: registerCards(s.state, metas),
      };
    }
    case 'RECORD_RESULT':
      return { ...s, state: recordCardResult(s.state, a.cardId, a.correct) };
    case 'SET_STAGE_PROGRESS':
      return { ...s, stageGate: setProgress(s.stageGate, a.progress) };
    case 'ADVANCE_DAY':
      return { ...s, dayNumber: s.dayNumber + 1 };
    case 'SET_DRILL_REQUEST':
      return { ...s, drillRequest: a.req };
    default:
      return s;
  }
}

function freshInternal(): InternalState {
  return {
    state: createInitialState(),
    stageGate: createInitialStageGateState(),
    cards: [],
    dayNumber: 1,
    drillRequest: null,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────

const SessionStoreCtx = createContext<SessionStoreValue | null>(null);

export interface SessionStoreProviderProps {
  /** Optional pre-seeded cards. */
  readonly initialCards?: readonly Card[];
  /** Optional pre-seeded session state (overrides freshInternal). */
  readonly initialState?: Partial<InternalState>;
  readonly children: ReactNode;
}

export function SessionStoreProvider(props: SessionStoreProviderProps) {
  const { initialCards, initialState, children } = props;

  const [internal, dispatch] = useReducer(reducer, undefined, () => {
    const base = freshInternal();
    if (initialState) {
      return { ...base, ...initialState };
    }
    if (initialCards && initialCards.length > 0) {
      const metas: CardMeta[] = initialCards.map((c) => ({
        cardId: c.id,
        atomId: c.atomId,
        qTags: c.qTags,
        length: 'medium',
      }));
      return {
        ...base,
        cards: initialCards,
        state: registerCards(base.state, metas),
      };
    }
    return base;
  });

  const registerCardsAction = useCallback(
    (metas: readonly CardMeta[]) => dispatch({ type: 'REGISTER_CARDS', metas }),
    []
  );
  const loadCardsAction = useCallback(
    (cards: readonly Card[]) => dispatch({ type: 'LOAD_CARDS', cards }),
    []
  );
  const recordResultAction = useCallback(
    (cardId: string, correct: boolean) =>
      dispatch({ type: 'RECORD_RESULT', cardId, correct }),
    []
  );
  const setStageProgressAction = useCallback(
    (progress: StageProgress) =>
      dispatch({ type: 'SET_STAGE_PROGRESS', progress }),
    []
  );
  const advanceDayAction = useCallback(
    () => dispatch({ type: 'ADVANCE_DAY' }),
    []
  );
  const setDrillRequestAction = useCallback(
    (req: DrillRequest | null) =>
      dispatch({ type: 'SET_DRILL_REQUEST', req }),
    []
  );

  const value: SessionStoreValue = useMemo(
    () => ({
      state: internal.state,
      stageGate: internal.stageGate,
      cards: internal.cards,
      dayNumber: internal.dayNumber,
      drillRequest: internal.drillRequest,
      registerCardsAction,
      loadCardsAction,
      recordResultAction,
      setStageProgressAction,
      advanceDayAction,
      setDrillRequestAction,
    }),
    [
      internal,
      registerCardsAction,
      loadCardsAction,
      recordResultAction,
      setStageProgressAction,
      advanceDayAction,
      setDrillRequestAction,
    ]
  );

  return (
    <SessionStoreCtx.Provider value={value}>
      {children}
    </SessionStoreCtx.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────

/** Access the raw session-store. Throws if used outside Provider. */
export function useSession(): SessionStoreValue {
  const v = useContext(SessionStoreCtx);
  if (!v) {
    throw new Error('useSession must be used inside <SessionStoreProvider>');
  }
  return v;
}

/** Familiarity for one Q-track (Q1..Q4). */
export function useFamiliarity(qTag: QTag): QTrackFamiliarity {
  const { state } = useSession();
  return useMemo(() => getQTrackFamiliarity(state, qTag), [state, qTag]);
}

/** Familiarity for all Q-tracks. */
export function useAllFamiliarity(): Record<QTag, QTrackFamiliarity> {
  const { state } = useSession();
  return useMemo(() => {
    const out: Record<QTag, QTrackFamiliarity> = {
      Q1: getQTrackFamiliarity(state, 'Q1'),
      Q2: getQTrackFamiliarity(state, 'Q2'),
      Q3: getQTrackFamiliarity(state, 'Q3'),
      Q4: getQTrackFamiliarity(state, 'Q4'),
    };
    return out;
  }, [state]);
}

/** Today's deck — composed via the daily-deck-composer engine. */
export function useTodayDeck(targetCount = 47, opts?: ComposeOptions): Card[] {
  const { state, cards, dayNumber } = useSession();
  return useMemo(
    () => composeDailyDeck(cards, state, dayNumber, targetCount, opts),
    [cards, state, dayNumber, targetCount, opts]
  );
}

/**
 * Derived weakness file: atoms below 50% familiarity, with a fail count
 * and severity score. Sorted worst-first by severity desc.
 */
export function useWeaknessFile(limit = 10): readonly WeaknessEntry[] {
  const { state } = useSession();
  return useMemo(() => {
    const all = getAllAtomFamiliarities(state);
    const entries: WeaknessEntry[] = [];
    for (const a of all) {
      if (a.percent >= 50) continue;
      // fails = exposureCount - correctCount, summed for the atom.
      const cardIds = state.atomToCards[a.atomId] ?? [];
      let fails = 0;
      for (const cid of cardIds) {
        const e = state.exposures[cid];
        if (!e) continue;
        fails += e.exposureCount - e.correctCount;
      }
      // severity normalised to 0..1 — closer to 0 = worse.
      const severity = 1 - a.percent / 100;
      entries.push({
        atomId: a.atomId,
        severity,
        fails,
        familiarity: a.percent,
      });
    }
    entries.sort((x, y) => y.severity - x.severity);
    return entries.slice(0, limit);
  }, [state, limit]);
}

/** Stage progress for a Q-track. */
export interface StageProgressView {
  readonly currentStage: Stage;
  readonly highestPromoted: Stage | null;
  readonly stages: ReadonlyArray<{
    stage: Stage;
    accuracy: number;
    threshold: number;
    completed: boolean;
    locked: boolean;
  }>;
  /** Whether the student can skip past `currentStage` with a cost warning. */
  manualSkip(toStage: Stage): ManualOverrideResult;
}

export function useStageProgress(qTag: QTag): StageProgressView {
  const { stageGate, state, cards } = useSession();
  return useMemo(() => {
    const top = highestPromotedStage(stageGate, qTag);
    const resolved = resolveStageGate(state, cards);
    // Current stage = max(top+1 if any, resolved.currentStage, 1)
    const cs: Stage = (
      top !== null && top < 6
        ? Math.min(6, top + 1)
        : top === 6
          ? 6
          : Math.max(1, Math.min(6, resolved.currentStage as number))
    ) as Stage;

    const stages: StageProgressView['stages'] = ([1, 2, 3, 4, 5, 6] as Stage[]).map(
      (s) => {
        const p = getProgress(stageGate, qTag, s);
        const accuracy = p?.accuracy ?? 0;
        const threshold = PROMOTION_THRESHOLDS[s];
        const completed =
          (top !== null && s <= top) || (p?.completedAt !== undefined);
        const locked = top === null ? s > 1 : s > Math.min(6, (top as number) + 1);
        return { stage: s, accuracy, threshold, completed, locked };
      }
    );

    return {
      currentStage: cs,
      highestPromoted: top,
      stages,
      manualSkip: (toStage: Stage) =>
        manualOverride(stageGate, qTag, cs, toStage),
    };
  }, [stageGate, state, cards, qTag]);
}

/** Days remaining to test date (TEST_DATE_ISO). 0 if today is the test, negative after. */
export function useTestCountdown(now: Date = new Date()): number {
  return useMemo(() => {
    const target = new Date(TEST_DATE_ISO + 'T00:00:00');
    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const ms = target.getTime() - today.getTime();
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
  }, [now]);
}

/** Total atoms registered in the session (footer count). */
export function useAtomCount(): number {
  const { state } = useSession();
  return useMemo(() => Object.keys(state.atomToCards).length, [state]);
}

/** Total cards loaded into the store. */
export function useCardCount(): number {
  const { cards } = useSession();
  return cards.length;
}

/** Convenience: card status (NEW / IN-PROGRESS / FAMILIAR). */
export function useCardStatus(cardId: string) {
  const { state } = useSession();
  return useMemo(() => getCardStatus(state, cardId), [state, cardId]);
}

/** Convenience: atom familiarity. */
export function useAtomFamiliarity(atomId: string) {
  const { state } = useSession();
  return useMemo(() => getAtomFamiliarity(state, atomId), [state, atomId]);
}
