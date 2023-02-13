import { isEqual } from 'lodash';
import { useRef } from 'react';

export const useDeepCompareMemoize = (value: any) => {
  const ref = useRef();
  if (!isEqual(value, ref.current)) {
    ref.current = value;
  }
  return ref.current;
};
