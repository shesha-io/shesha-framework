import type { IFontValue } from '@/designer-components/_settings/utils/font/interfaces';
import { DEFAULT_FONT_TYPE } from '@/designer-components/_settings/utils/font/utils';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { deepMergeSkipUndefinedFunc, deepMergeValues } from '@/utils/object';
import type { IConfigurableTheme, IThemeGroupStyle, ThemeComponentGroup } from './contexts';

/** Label font a theme starts with; parts the theme saved win over these. */
export const DEFAULT_LABEL_FONT: IFontValue = { size: 14, weight: '500', type: DEFAULT_FONT_TYPE, color: '#000' };

/** Input Components font a theme starts with; parts the theme saved win over these. */
export const DEFAULT_INPUT_FONT: IFontValue = { size: 14, weight: '400', type: DEFAULT_FONT_TYPE, color: '#000' };

const isSet = (value: unknown): boolean => value !== undefined && value !== null && value !== '';

/** The parts of `font` that are set, over the parts of `under` that are set. */
const fontOver = (under: IFontValue | undefined, font: IFontValue | undefined): IFontValue => {
  const result: Record<string, unknown> = {};
  [under, font].forEach((layer) => {
    Object.entries(layer ?? {}).forEach(([key, value]) => {
      if (isSet(value)) result[key] = value;
    });
  });
  return result as IFontValue;
};

/** A font resolved in layers: the typography defaults, then the theme's base font, then the font's own parts. */
const resolveFont = (defaults: IFontValue, base: IFontValue | undefined, font: IFontValue | undefined): IFontValue =>
  fontOver(fontOver(defaults, base), font);

/**
 * Moves fonts saved by earlier versions into their layers: the application font type (`fontFamily`)
 * into the base `font.type`, and the top-level `labelFont` into the Input Components group. A value
 * already in the new place wins. The legacy keys are dropped, so the theme is saved in the new shape.
 */
export const upgradeLegacyThemeFonts = (theme: IConfigurableTheme): IConfigurableTheme => {
  const { fontFamily, labelFont, ...rest } = theme;
  if (isNullOrWhiteSpace(fontFamily) && !isDefined(labelFont)) return rest;

  const result: IConfigurableTheme = { ...rest };
  if (!isNullOrWhiteSpace(fontFamily) && isNullOrWhiteSpace(theme.font?.type))
    result.font = { ...theme.font, type: fontFamily };

  if (isDefined(labelFont)) {
    const inputGroup = theme.componentGroups?.input ?? {};
    result.componentGroups = {
      ...theme.componentGroups,
      input: { ...inputGroup, labelFont: deepMergeValues({ ...labelFont }, inputGroup.labelFont ?? {}, deepMergeSkipUndefinedFunc) },
    };
  }
  return result;
};

/**
 * Upgrades fonts saved by earlier versions (see {@link upgradeLegacyThemeFonts}). The font defaults are not
 * stored: they are the lowest layer when the Input Components and label fonts are resolved (see
 * {@link getThemeGroupStyle}, {@link getEffectiveLabelFont}), so the base font always overrides them.
 */
export const applyThemeDefaults = (theme: IConfigurableTheme): IConfigurableTheme => upgradeLegacyThemeFonts(theme);

/**
 * A theme component group's style as its components inherit it. The Input Components font is resolved
 * from the defaults, the base font and the group's own parts, so a base font edit reaches inputs over
 * their own defaults.
 */
export const getThemeGroupStyle = (theme: IConfigurableTheme | undefined, group: ThemeComponentGroup): IThemeGroupStyle | undefined => {
  const groupStyle = theme?.componentGroups?.[group];
  if (group !== 'input') return groupStyle;
  return { ...groupStyle, font: resolveFont(DEFAULT_INPUT_FONT, theme?.font, groupStyle?.font) };
};

/** Font of form item labels: the label defaults, then the theme's base font, then the Input Components label font. */
export const getEffectiveLabelFont = (theme: IConfigurableTheme | undefined): IFontValue =>
  resolveFont(DEFAULT_LABEL_FONT, theme?.font, theme?.componentGroups?.input?.labelFont);
