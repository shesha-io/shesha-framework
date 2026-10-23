export const getLocalStorage = (): Storage | undefined => {
  return typeof window === 'undefined' ? undefined : localStorage;
};
