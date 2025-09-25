export const getLocalStorage = (): Storage | undefined => {
  return typeof window === 'undefined' ? undefined : localStorage;
};

export const getSessionStorage = (): Storage | undefined => {
  return typeof window === 'undefined' ? undefined : sessionStorage;
};
