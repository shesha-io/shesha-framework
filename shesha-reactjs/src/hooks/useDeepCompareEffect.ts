import React, { DependencyList, useCallback, useEffect } from 'react';
import { useDeepCompareMemoize } from './useDeepCompareMemoize';

/**
 * Accepts a function that contains imperative, possibly effectful code.
 *
 * This is the deepCompare version of the `React.useEffect` hooks (that is shallowed compare)
 *
 * @param effect Imperative function that can return a cleanup function
 * @param deps If present, effect will only activate if the values in the list change.
 *
 * @see https://gist.github.com/kentcdodds/fb8540a05c43faf636dd68647747b074#gistcomment-2830503
 */
export function useDeepCompareEffect(effect: React.EffectCallback, deps?: DependencyList): void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, useDeepCompareMemoize(deps));
}

export function useDeepCompareCallback<T extends (...args: unknown[]) => unknown>(callback: T, deps?: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, useDeepCompareMemoize(deps));
}
