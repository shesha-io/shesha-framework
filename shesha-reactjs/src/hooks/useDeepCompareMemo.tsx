import { DependencyList, useMemo } from 'react';
import { useDeepCompareMemoize } from './useDeepCompareMemoize';

export function useDeepCompareMemo<T>(callback: () => T, dependencies: DependencyList) {
  return useMemo(callback, useDeepCompareMemoize(dependencies));
}
