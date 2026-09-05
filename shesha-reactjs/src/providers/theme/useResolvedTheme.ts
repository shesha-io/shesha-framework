import { useEffect, useState } from 'react';
import { ColorScheme, ResolvedTheme } from './contexts';

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

/** Reads the OS colour scheme. Returns 'light' during SSR, where matchMedia is unavailable. */
const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'light';
  return window.matchMedia(DARK_SCHEME_QUERY).matches ? 'dark' : 'light';
};

/**
 * Resolves a configured {@link ColorScheme} to the scheme that should actually be applied.
 *
 * When the scheme is 'system' (or unset) the OS preference is used and the result updates
 * automatically if the user flips their OS between light and dark while the app is open.
 */
export const useResolvedTheme = (scheme: ColorScheme | undefined): ResolvedTheme => {
  const followSystem = scheme === 'system' || scheme === undefined;

  // Always 'light' on the first client render so it matches the server-rendered markup;
  // the effect below corrects it before paint when the OS is actually in dark mode.
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('light');

  useEffect(() => {
    if (!followSystem) return undefined;

    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;

    const mediaQuery = window.matchMedia(DARK_SCHEME_QUERY);
    const sync = (): void => setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    // Sync immediately in case the OS preference differs from the SSR-safe default.
    sync();

    mediaQuery.addEventListener('change', sync);
    return () => mediaQuery.removeEventListener('change', sync);
  }, [followSystem]);

  return followSystem ? systemTheme : scheme;
};

export { getSystemTheme };
