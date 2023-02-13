import { useCallback, useRef, useState } from 'react';

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

/**
 * Augments React's useReducer() hook so that the action
 * dispatcher supports thunks.
 *
 * @param {Function} reducer
 * @param {*} initialArg
 * @param {Function} [init]
 * @returns {[*, Dispatch]}
 */
export function useThunkReducer(reducer, initialArg, init = (a) => a) {
  const [hookState, setHookState] = useState(() => init(initialArg));

  // State management.
  const state = useRef(hookState);
  const getState = useCallback(() => state.current, [state]);
  const setState = useCallback((newState) => {
    state.current = newState;
    setHookState(newState);
  }, [state, setHookState]);

  // Reducer.
  const reduce = useCallback((action) => {
    return reducer(getState(), action);
  }, [reducer, getState]);

  // Augmented dispatcher.
  const dispatch = useCallback((action) => {
    return typeof action === 'function'
      ? action(dispatch, getState)
      : setState(reduce(action));
  }, [getState, setState, reduce]);

  return [hookState, dispatch];
}

export default useThunkReducer;