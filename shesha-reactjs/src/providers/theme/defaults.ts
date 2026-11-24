import type { IFontValue } from '@/designer-components/_settings/utils/font/interfaces';
import { DEFAULT_FONT_TYPE } from '@/designer-components/_settings/utils/font/utils';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { deepMergeSkipUndefinedFunc, deepMergeValues } from '@/utils/object';
import type { IConfigurableTheme } from './contexts';

/** Label font a theme starts with; parts the theme saved win over these. */
export const DEFAULT_LABEL_FONT: IFontValue = { size: 14, weight: '500', type: DEFAULT_FONT_TYPE, color: '#000' };

/** Input Components font a theme starts with; parts the theme saved win over these. */
export const DEFAULT_INPUT_FONT: IFontValue = { size: 14, weight: '400', type: DEFAULT_FONT_TYPE, color: '#000' };

/**
 * A font with its unset parts filled in: from the theme's base font first, then from the typography
 * defaults. Parts set on the font itself win.
 */
const withFontDefaults = (defaults: IFontValue, font: IFontValue | undefined, base?: IFontValue | undefined): IFontValue => {
  const result: IFontValue = { ...defaults };
  [base, font].forEach((layer) => {
    Object.entries(layer ?? {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') (result as Record<string, unknown>)[key] = value;
    });
  });
  return result;
};

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
 * Upgrades fonts saved by earlier versions (see {@link upgradeLegacyThemeFonts}) and fills in the font
 * defaults a theme is initialised with (label font and Input Components font), so they show in the theme
 * settings and apply to forms. Only parts the saved theme left unset are filled in.
 */
export const applyThemeDefaults = (theme: IConfigurableTheme): IConfigurableTheme => {
  const upgraded = upgradeLegacyThemeFonts(theme);
  const inputGroup = upgraded.componentGroups?.input ?? {};
  return {
    ...upgraded,
    componentGroups: {
      ...upgraded.componentGroups,
      input: {
        ...inputGroup,
        // Unset parts inherit the theme's base font; the defaults only fill what neither sets.
        font: withFontDefaults(DEFAULT_INPUT_FONT, inputGroup.font, upgraded.font),
        labelFont: withFontDefaults(DEFAULT_LABEL_FONT, inputGroup.labelFont, upgraded.font),
      },
    },
  };
};

/**
 * Font of form item labels: the theme's base font, overridden by the Input Components group's label font.
 * Unset parts of the label font inherit the base font.
 */
export const getEffectiveLabelFont = (theme: IConfigurableTheme | undefined): IFontValue | undefined => {
  const base = theme?.font;
  const label = theme?.componentGroups?.input?.labelFont;
  if (base === undefined && label === undefined) return undefined;
  return deepMergeValues({ ...base }, label ?? {}, deepMergeSkipUndefinedFunc);
};
