import { isEqual } from 'lodash';
import { DependencyList, useMemo, useRef } from 'react';
import { useDeepCompareMemoize } from './useDeepCompareMemoize';

export function useDeepCompareMemo<T>(callback: () => T, dependencies: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(callback, useDeepCompareMemoize(dependencies));
}

/**
 * Variation of the `useDeepCompareMemo` that keeps reference if the result contains the same data. It allows to avoid unneeded re-rendering
 *
 * @param callback
 * @param dependencies
 * @returns
 */
export function useDeepCompareMemoKeepReference<T>(callback: () => T, dependencies: DependencyList): T {
  const ref = useRef<T>();

  // note: we can't use existing `useDeepCompareMemoize` hook inside `useMemo` because React doesn't allow to use any hooks inside standard hooks
  return useMemo<T>(() => {
    const value = callback();
    if (!isEqual(value, ref.current)) {
      ref.current = value;
    }
    return ref.current as T;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, useDeepCompareMemoize(dependencies));
}
