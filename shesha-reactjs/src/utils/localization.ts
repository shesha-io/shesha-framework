import { getLocalStorage } from './storage';

const LOCALIZATION = 'LOCALIZATION';

/**
 * Sets the localization for the project
 *
 * @param localization - localization
 */

export const setLocalization = (localization: string): void => getLocalStorage()?.setItem(LOCALIZATION, localization);
export const getLocalization = (): string | undefined => getLocalStorage()?.getItem(LOCALIZATION);
export const getLocalizationOrDefault = (): string => {
  let localization = getLocalization();
  if (!localization && typeof navigator !== 'undefined') {
    localization = navigator.language;
    setLocalization(localization);
  }
  return localization;
};
