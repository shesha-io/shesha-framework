import { useRef } from 'react';
import isEqualWith from 'lodash/isEqualWith';
import { StorageArrayProperty, StorageProperty } from '@/providers/dataContextProvider/contexts/storageProxy';
import { ObservableProxy } from '..';
import { TouchableArrayProperty, TouchableProperty } from '@/providers/form/touchableProperty';
import { ShaArrayAccessProxy, ShaObjectAccessProxy } from '@/providers/dataContextProvider/contexts/shaDataAccessProxy';

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

  const unproxiedValue = Array.isArray(value)
    ? value.map((item) => 
      item instanceof StorageProperty 
      || item instanceof StorageArrayProperty 
      || item instanceof ShaObjectAccessProxy
      || item instanceof ShaArrayAccessProxy
      || item instanceof TouchableProperty 
      || item instanceof TouchableArrayProperty
        ? {...item.getData()}
        : item instanceof ObservableProxy
          ? {...item}
          : item
      )
    : value;

  if (!isEqual(unproxiedValue, ref.current)) {
    ref.current = unproxiedValue;
  }

  return ref.current;
}
