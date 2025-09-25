import { useLocalStorage } from "./useLocalStorage";

/**
 * @returns Returns a tuple of [isDevMode, setDevMode]
 */
export const useDevMode = (): [boolean, (v: boolean) => void] => {
  return useLocalStorage('application.isDevMode', false);
};

/**
 * @returns Returns true if the application is in development mode
 */
export const useIsDevMode = (): boolean => {
  const [isDevMode] = useDevMode();
  return isDevMode;
};
