import { CSSProperties } from 'react';
import { IFontValue } from './interfaces';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { ensureWebFontLoaded } from './webFonts';

// Bundled and self-hosted, so the default look is identical on every OS.
/** Default font family name, as stored in a component's `font.type`. Change the default font here. */
export const DEFAULT_FONT_TYPE = 'Inter Variable';
/** CSS `font-family` stack for the default font. */
export const DEFAULT_FONT_FAMILY = `'${DEFAULT_FONT_TYPE}', sans-serif`;

/** CSS custom property holding the application font stack chosen in the theme settings (set on the root element by the ThemeProvider). */
export const THEME_FONT_VAR = '--sha-font-family';
/** CSS `font-family` value that follows the theme font, falling back to the default font when no theme font is set. */
export const THEME_FONT_FAMILY = `var(${THEME_FONT_VAR}, ${DEFAULT_FONT_FAMILY})`;

const GENERIC_FAMILY = /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-[a-z-]+|emoji|math|fangsong)$/i;

/** Inserts the bundled Inter fallback ahead of any generic family, so a font the OS lacks (e.g. Segoe UI on macOS) degrades to Inter, not the browser default. */
const withInterFallback = (family: string | null | undefined): string | undefined => {
  if (isNullOrWhiteSpace(family)) return undefined;
  const trimmed = family.trim();
  if (trimmed.includes(DEFAULT_FONT_TYPE)) return trimmed;
  const parts = trimmed.split(',').map((p) => p.trim()).filter((p) => p !== '');
  const genericIdx = parts.findIndex((p) => GENERIC_FAMILY.test(p));
  if (genericIdx < 0) return `${trimmed}, ${DEFAULT_FONT_FAMILY}`;
  // A stack that starts with a generic family (e.g. a deliberate `monospace`) is an explicit choice, not a fallback.
  if (genericIdx === 0) return trimmed;
  parts.splice(genericIdx, 0, `'${DEFAULT_FONT_TYPE}'`);
  return parts.join(', ');
};

/** Font stack for the application font chosen in the theme settings; the default font when none is chosen. */
export const getThemeFontStack = (family: string | null | undefined): string =>
  family?.trim() === DEFAULT_FONT_TYPE ? DEFAULT_FONT_FAMILY : withInterFallback(family) ?? DEFAULT_FONT_FAMILY;

/**
 * CSS `font-family` for a configured font type, with the Inter fallback (see {@link withInterFallback}).
 * The default font type is what every component starts with, so it resolves to the theme font
 * ({@link THEME_FONT_FAMILY}) - changing the application font in the theme then restyles every
 * component that was never given a font of its own. A web font (see `webFonts`) is loaded on first use.
 */
export const withFontFallback = (family: string | null | undefined): string | undefined => {
  if (isNullOrWhiteSpace(family)) return undefined;
  if (family.trim() === DEFAULT_FONT_TYPE) return THEME_FONT_FAMILY;
  // Every component font goes through here, so this is where a chosen web font gets loaded.
  ensureWebFontLoaded(family);
  return withInterFallback(family);
};

export const getFontStyle = (input?: IFontValue): CSSProperties => {
  if (!input) return {};

  const style: CSSProperties = {};

  if (isDefined(input.size)) {
    const size = input.size;
    if (size) {
      style.fontSize = size + 'px';
    }
  }

  const family = withFontFallback(input.type);
  if (isDefined(family)) {
    style.fontFamily = family;
  }

  if (isDefined(input.weight)) {
    style.fontWeight = (input.weight.split(' - ')[0] ?? '400') || 400;
  }

  if (isDefined(input.color)) {
    style.color = input.color;
  }

  if (isDefined(input.align)) {
    style.textAlign = input.align;
  }

  if (isDefined(input.transform)) {
    style.transform = input.transform;
  }

  return style;
};

export const fontTypes = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times new roman' },
  { value: 'Courier New', label: 'Courier new' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Segoe UI', label: 'Segoe UI' },
  { value: 'Palatino', label: 'Palatino' },
  { value: 'monospace', label: 'Monospace' },
  { value: 'Garamond', label: 'Garamond' },
  { value: 'Comic Sans MS', label: 'Comic sans MS' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
  { value: 'Arial Black', label: 'Arial black' },
  { value: 'Impact', label: 'Impact' },
  { value: DEFAULT_FONT_TYPE, label: 'Inter' },
  { value: '-apple-system', label: 'San francisco' },
  { value: 'BlinkMacSystemFont', label: 'Blinkmac system font' },
  { value: 'SF Mono', label: 'San francisco mono' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Ubuntu', label: 'Ubuntu' },
  { value: 'Merriweather', label: 'Merriweather' },
  { value: 'Pt Sans', label: 'PT sans' },
  { value: 'Source Sans Pro', label: 'Source sans pro' },
  { value: 'Fira Sans', label: 'Fira sans' },
  { value: 'Playfair Display', label: 'Playfair display' },
  { value: 'Noto Sans', label: 'Noto sans' },
  { value: 'Droid Sans', label: 'Droid sans' },
  { value: 'Crimson Text', label: 'Crimson text' },
  { value: 'PT Serif', label: 'PT serif' },
];

/** {@link fontTypes} with each option shown in its own font, so the choice can be judged from the list. */
export const fontTypeOptions = fontTypes.map((option) => ({ ...option, style: { fontFamily: getThemeFontStack(option.value) } }));

export const fontWeightsOptions = [
  { value: '100', label: 'Thin (100)' },
  { value: '400', label: 'Normal (400)' },
  { value: '500', label: 'Medium (500)' },
  { value: '700', label: 'Bold (700)' },
  { value: '900', label: 'Black (900)' },
];

export const textAlignOptions = [
  { value: 'left', label: 'Left', icon: 'AlignLeftOutlined' },
  { value: 'center', label: 'Center', icon: 'AlignCenterOutlined' },
  { value: 'right', label: 'Right', icon: 'AlignRightOutlined' },
];
