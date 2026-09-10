import { useEffect, useLayoutEffect, useState } from 'react';
import { ColorScheme, ResolvedTheme } from './contexts';

const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

/** Reads the OS colour scheme on demand. Returns 'light' where matchMedia is unavailable (SSR). */
const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'light';
  return window.matchMedia(DARK_SCHEME_QUERY).matches ? 'dark' : 'light';
};

// useLayoutEffect runs before paint, which is what keeps a dark-mode user from seeing a light
// flash. It warns when run on the server, so fall back to useEffect where there is no DOM.
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Resolves a configured {@link ColorScheme} to the scheme that should actually be applied.
 *
 * When the scheme is 'system' (or unset) the OS preference is used and the result updates
 * automatically if the user flips their OS between light and dark while the app is open.
 */
export const useResolvedTheme = (scheme: ColorScheme | undefined): ResolvedTheme => {
  const followSystem = scheme === 'system' || scheme === undefined;

  // Always 'light' on the first render so server and client hydration produce identical output.
  // The pre-paint effect below corrects it before the browser paints, so a dark-mode user still
  // does not see a light flash.
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>('light');

  useIsomorphicLayoutEffect(() => {
    if (!followSystem) return undefined;

    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;

    const mediaQuery = window.matchMedia(DARK_SCHEME_QUERY);
    const sync = (): void => setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    // Sync immediately in case the OS preference changed between hydration and this effect.
    sync();

    mediaQuery.addEventListener('change', sync);
    return () => mediaQuery.removeEventListener('change', sync);
  }, [followSystem]);

  return followSystem ? systemTheme : scheme;
};

export { getSystemTheme };
