export const getLocalStorage = (): Storage => {
  return typeof window === 'undefined' ? undefined : localStorage;
};

export const getSessionStorage = (): Storage => {
  return typeof window === 'undefined' ? undefined : sessionStorage;
};
