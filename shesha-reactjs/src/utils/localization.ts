import { getLocalStorage } from './storage';

const LOCALIZATION = 'LOCALIZATION';

/**
 * Sets the localization for the project
 *
 * @param localization - localization
 */

export const setLocalization = (localization: string) => getLocalStorage()?.setItem(LOCALIZATION, localization);
export const getLocalization = () => getLocalStorage()?.getItem(LOCALIZATION);
export const getLocalizationOrDefault = (): string => {
  let localization = getLocalization();
  if (!localization && typeof navigator !== 'undefined') {
    localization = navigator.language;
    setLocalization(localization);
  }
  return localization;
};
