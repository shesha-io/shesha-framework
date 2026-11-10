import { CSSProperties } from 'react';
import { isNullOrWhiteSpace } from '@/utils/nullables';

/**
 * Web fonts offered in the font pickers that no OS ships, keyed by the font type stored on a
 * component (see `fontTypes`), with the Google Fonts family spec to load for each. Only Inter is
 * bundled; these are fetched from Google Fonts the first time they are used.
 */
const GOOGLE_FONTS: Record<string, string> = {
  'Roboto': 'Roboto:wght@100;300;400;500;700;900',
  'Open Sans': 'Open+Sans:wght@300;400;500;600;700;800',
  'Lato': 'Lato:wght@100;300;400;700;900',
  'Ubuntu': 'Ubuntu:wght@300;400;500;700',
  'Merriweather': 'Merriweather:wght@300;400;700;900',
  // CSS matches family names case-insensitively, so the stored 'Pt Sans' resolves to 'PT Sans'.
  'Pt Sans': 'PT+Sans:wght@400;700',
  'PT Serif': 'PT+Serif:wght@400;700',
  'Source Sans Pro': 'Source+Sans+Pro:wght@200;300;400;600;700;900',
  'Fira Sans': 'Fira+Sans:wght@100;200;300;400;500;600;700;800;900',
  'Playfair Display': 'Playfair+Display:wght@400;500;600;700;800;900',
  'Noto Sans': 'Noto+Sans:wght@100;200;300;400;500;600;700;800;900',
  'Crimson Text': 'Crimson+Text:wght@400;600;700',
};

const GOOGLE_FONTS_BY_NAME = new Map(Object.entries(GOOGLE_FONTS).map(([name, spec]) => [name.toLowerCase(), spec]));

const requested = new Set<string>();

/** Google Fonts stylesheet URL for a font type, `undefined` when it is not a known web font. */
export const getWebFontUrl = (fontType: string): string | undefined => {
  const spec = GOOGLE_FONTS_BY_NAME.get(fontType.trim().replace(/^['"]|['"]$/g, '').toLowerCase());
  return spec === undefined ? undefined : `https://fonts.googleapis.com/css2?family=${spec}&display=swap`;
};

/**
 * Makes sure the web font a `font-family` value starts with is loaded, adding its Google Fonts
 * stylesheet to the page once. Fonts the OS provides, and Inter (bundled), need nothing. Safe to
 * call while rendering: it is idempotent and does nothing outside a browser.
 */
export const ensureWebFontLoaded = (fontFamily: string | null | undefined): void => {
  if (typeof document === 'undefined' || isNullOrWhiteSpace(fontFamily)) return;
  const first = fontFamily.split(',')[0] ?? '';
  const url = getWebFontUrl(first);
  if (url === undefined || requested.has(url)) return;
  requested.add(url);

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  link.dataset['shaWebFont'] = first.trim();
  document.head.appendChild(link);
};

/** Loads the web fonts dropdown options are shown in (see `fontTypeOptions`), e.g. when a font picker opens. */
export const ensureOptionFontsLoaded = (options: ReadonlyArray<{ style?: CSSProperties | undefined }>): void => {
  options.forEach((option) => ensureWebFontLoaded(option.style?.fontFamily));
};
