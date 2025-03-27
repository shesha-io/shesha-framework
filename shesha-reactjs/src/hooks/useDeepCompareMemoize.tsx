import { useRef } from 'react';
import isEqualWith from 'lodash/isEqualWith';
import { isArray } from '@/utils/array';
import { StorageProxy } from '@/providers/dataContextProvider/contexts/storageProxy';

/**
 * Custom version of isEqual to handle function comparison
 */
function isEqual(x: any, y: any) {
  return isEqualWith(x, y, (a, b) => {
    // Deal with the function comparison case
    if (typeof a === 'function' && typeof b === 'function') {
      return a.toString() === b.toString();
    }
    // Fallback on the method
    return undefined;
  });
}

export function useDeepCompareMemoize(value: Readonly<any>) {
  const ref = useRef<any>();

  const unproxiedValue = isArray(value)
    ? value.map((item) => item instanceof StorageProxy ? item.getData() : item)
    : value;

  if (!isEqual(unproxiedValue, ref.current)) {
    ref.current = unproxiedValue;
  }

  return ref.current;
}
