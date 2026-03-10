import { useRef } from 'react';
import isEqualWith from 'lodash/isEqualWith';
import { StorageArrayProperty, StorageProperty } from '@/providers/dataContextProvider/contexts/storageProxy';
import { ObservableProxy } from '..';
import { TouchableArrayProperty, TouchableProperty } from '@/providers/form/touchableProperty';
import { ShaArrayAccessProxy, ShaObjectAccessProxy } from '@/providers/dataContextProvider/contexts/shaDataAccessProxy';

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
    ? value.map((item) =>
      item instanceof StorageProperty ||
      item instanceof StorageArrayProperty ||
      item instanceof ShaObjectAccessProxy ||
      item instanceof ShaArrayAccessProxy ||
      item instanceof TouchableProperty ||
      item instanceof TouchableArrayProperty
        ? { ...item.getData() }
        : item instanceof ObservableProxy
          ? { ...item }
          : item,
    ) as T
    : value;

  if (!isEqual(unproxiedValue, ref.current)) {
    ref.current = unproxiedValue;
  }

  return ref.current as T;
}
