import { useRef } from 'react';
import isEqualWith from 'lodash/isEqualWith';
import { unproxyValue } from '@/utils/object';

const safeFunctionToString = (fn: unknown): string | null => typeof fn !== 'function'
  ? null
  : fn.toString();

/**
 * Custom version of isEqual to handle function comparison
 */
function isEqual(x: unknown, y: unknown): boolean {
  return isEqualWith(x, y, (a, b) => {
    // Deal with the function comparison case
    if (typeof a === 'function' && typeof b === 'function') {
      return safeFunctionToString(a) === safeFunctionToString(b);
    }
    // Fallback on the method
    return undefined;
  });
}

export function useDeepCompareMemoize<T = unknown>(value?: Readonly<T>): T {
  const ref = useRef<T>();

  const unproxiedValue = Array.isArray(value)
    ? value.map((item) => unproxyValue(item)) as T
    : unproxyValue(value);

  if (!isEqual(unproxiedValue, ref.current)) {
    ref.current = unproxiedValue;
  }

  return ref.current as T;
}
