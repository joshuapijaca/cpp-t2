/**
 * session-store.tsx — Minimal in-memory React Context for v2.2 linear walker.
 *
 * Per CLAUDE.md RULE 4 (session-only state) and the v2.2 manifest:
 *   - 1 engine (exposure-counter only)
 *   - 2 pages (Home + Sequence linear walker)
 *   - No daily-deck-composer / stage-gate / weakness file / drill request
 *   - No persistence (no localStorage, no backend)
 *
 * Hooks exposed:
 *   useSession()                 — full state + dispatchers
 *   useFamiliarity(qTag)         — Q-track percent + atom buckets
 *   useAtomFamiliarity(atomId)
 *   useCardStatus(cardId)
 *   useAtomCount() / useCardCount()
 *   useModulePosition(level)     — current card index for module L0..L5
 *
 * Actions exposed:
 *   recordResultAction(cardId, correct)
 *   advancePositionAction(level) — bumps that module's position by 1
 *   registerCardsAction / loadCardsAction — register cards into the engine
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';

import type { Card, Level, QTag } from '../types/card-schema';
import {
  createInitialState,
  getAtomFamiliarity,
  getCardStatus,
  getQTrackFamiliarity,
  recordCardResult,
  registerCards,
  type CardMeta,
  type QTrackFamiliarity,
  type SessionState,
} from '../engines/exposure-counter';

// ─────────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────────

/** Test date (ISO YYYY-MM-DD) — Deakin SIT102 Test 2 first attempt. */
export const TEST_DATE_ISO = '2026-05-07';

/** Per-module current-card position (0-indexed). One entry per L0..L5. */
export type ModulePositions = Readonly<Record<Level, number>>;

/** Session-store value handed out by the context. */
export interface SessionStoreValue {
  readonly state: SessionState;
  readonly cards: readonly Card[];
  readonly positions: ModulePositions;

  // Mutators -- replace state immutably
  registerCardsAction: (metas: readonly CardMeta[]) => void;
  loadCardsAction: (cards: readonly Card[]) => void;
  recordResultAction: (cardId: string, correct: boolean) => void;
  advancePositionAction: (level: Level) => void;
}

// ─────────────────────────────────────────────────────────────────────────
// Reducer
// ─────────────────────────────────────────────────────────────────────────

interface InternalState {
  state: SessionState;
  cards: readonly Card[];
  positions: ModulePositions;
}

type Action =
  | { type: 'REGISTER_CARDS'; metas: readonly CardMeta[] }
  | { type: 'LOAD_CARDS'; cards: readonly Card[] }
  | { type: 'RECORD_RESULT'; cardId: string; correct: boolean }
  | { type: 'ADVANCE_POSITION'; level: Level };

const ZERO_POSITIONS: ModulePositions = Object.freeze({
  L0: 0,
  L1: 0,
  L2: 0,
  L3: 0,
  L4: 0,
  L5: 0,
});

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
    case 'ADVANCE_POSITION':
      return {
        ...s,
        positions: { ...s.positions, [a.level]: s.positions[a.level] + 1 },
      };
    default:
      return s;
  }
}

function freshInternal(): InternalState {
  return {
    state: createInitialState(),
    cards: [],
    positions: { ...ZERO_POSITIONS },
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
  const advancePositionAction = useCallback(
    (level: Level) => dispatch({ type: 'ADVANCE_POSITION', level }),
    []
  );

  const value: SessionStoreValue = useMemo(
    () => ({
      state: internal.state,
      cards: internal.cards,
      positions: internal.positions,
      registerCardsAction,
      loadCardsAction,
      recordResultAction,
      advancePositionAction,
    }),
    [
      internal,
      registerCardsAction,
      loadCardsAction,
      recordResultAction,
      advancePositionAction,
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

/** Current card index (0-indexed) for the given module L0..L5. */
export function useModulePosition(level: Level): number {
  const { positions } = useSession();
  return positions[level];
}
