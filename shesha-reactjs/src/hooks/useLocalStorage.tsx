import { useWebStorage } from './useWebStorage';

export function useLocalStorage<T>(key: string, initialValue?: T, ignoredKeys?: string[]): [T, (v: T) => void] {
  return useWebStorage('localStorage', key, initialValue, ignoredKeys);
}
