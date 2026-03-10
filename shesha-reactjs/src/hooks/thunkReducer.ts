import { Reducer, useCallback, useRef, useState } from 'react';

/**
 * @function Thunk
 * @param {Dispatch} dispatch
 * @param {Function} getState
 * @returns {void|*}
 */

/**
 * @function Dispatch
 * @param {Object|Thunk} action
 * @returns {void|*}
 */

export interface ThunkDispatch<S, A> {
  <Action extends (dispatch: ThunkDispatch<S, A>, getState: () => S) => unknown>(action: Action): ReturnType<Action>;
  (value: A): void;
}

/**
 * Augments React's useReducer() hook so that the action
 * dispatcher supports thunks.
 *
 * @param {Function} reducer
 * @param {*} initialArg
 * @param {Function} [init]
 * @returns {[*, Dispatch]}
 */
export function useThunkReducer<S, A>(
  reducer: Reducer<S, A>,
  initialArg: S,
  init?: (s: S) => S,
): [S, ThunkDispatch<S, A>] {
  const [hookState, setHookState] = useState(() => (init ? init(initialArg) : initialArg));

  // State management.
  const state = useRef(hookState);
  const getState = useCallback(() => state.current, [state]);
  const setState = useCallback(
    (newState: S) => {
      state.current = newState;
      setHookState(newState);
    },
    [state, setHookState],
  );

  // Reducer.
  const reduce = useCallback(
    (action: A) => {
      return reducer(getState(), action);
    },
    [reducer, getState],
  );

  // Augmented dispatcher.
  const dispatch = useCallback(
    <Action extends (dispatch: ThunkDispatch<S, A>, getState: () => S) => unknown>(action: Action) => {
      return typeof action === 'function' ? action(dispatch, getState) : setState(reduce(action));
    },
    [getState, setState, reduce],
  );

  return [hookState, dispatch];
}

export default useThunkReducer;
