import { isDefined } from '@/utils/nullables';
import { useState } from 'react';

export function useWebStorage<T>(
  storage: 'localStorage' | 'sessionStorage',
  key: string,
  initialValue: T,
  ignoredKeys?: string[],
): [T, (v: T) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = typeof (window) !== 'undefined'
        ? window[storage].getItem(key)
        : undefined;
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch {
      // If error also return initialValue
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to 'localStorage' | 'sessionStorage'.
  const setValue = (value: T): void => {
    try {
      if (isDefined(ignoredKeys) && ignoredKeys.length && typeof value === 'object') {
        const intermediateValue = { ...value };

        ignoredKeys.forEach((localKey) => {
          delete intermediateValue[localKey];
        });

        setStoredValue(intermediateValue);
      } else {
        setStoredValue(value);
      }

      // Save to local storage
      if (typeof (window) != 'undefined')
        window[storage].setItem(key, JSON.stringify(value));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error(error);
    }
  };

  return [storedValue, setValue];
}
