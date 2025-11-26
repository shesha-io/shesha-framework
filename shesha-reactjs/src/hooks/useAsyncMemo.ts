import { DependencyList, useEffect, useRef, useState } from 'react';
import { useDeepCompareEffect } from './useDeepCompareEffect';
import { isEqual } from 'lodash';

export function useAsyncMemo<T>(factory: () => Promise<T> | undefined | null, deps: DependencyList, initial?: T) {
  const [val, setVal] = useState<T | undefined>(initial);
  const previousValueRef = useRef<T | undefined>(initial);

  useEffect(() => {
    let cancel = false;
    const promise = factory();
    if (promise === undefined || promise === null)
      return () => {
        /*nop*/
      };

    promise.then((newVal) => {
      if (!cancel && newVal !== previousValueRef.current) {
        previousValueRef.current = newVal;
        setVal(newVal);
      }
    });

    return () => {
      cancel = true;
    };
  }, deps);

  return val;
}

export function useAsyncDeepCompareMemo<T>(factory: () => Promise<T> | undefined | null, deps: DependencyList, initial?: T) {
  const [val, setVal] = useState<T | undefined>(initial);
  const previousValueRef = useRef<T | undefined>(initial);

  useDeepCompareEffect(() => {
    let cancel = false;
    const promise = factory();
    if (promise === undefined || promise === null)
      return () => {
        /*nop*/
      };

    promise.then((newVal) => {
      if (!cancel && !isEqual(newVal, previousValueRef.current)) {
        previousValueRef.current = newVal;
        setVal(newVal);
      }
    });

    return () => {
      cancel = true;
    };
  }, deps);

  return val;
}
