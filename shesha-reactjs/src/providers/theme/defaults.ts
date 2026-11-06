import type { IFontValue } from '@/designer-components/_settings/utils/font/interfaces';
import { DEFAULT_FONT_TYPE } from '@/designer-components/_settings/utils/font/utils';
import type { IConfigurableTheme } from './contexts';

/** Label font a theme starts with; parts the theme saved win over these. */
export const DEFAULT_LABEL_FONT: IFontValue = { size: 14, weight: '500', type: DEFAULT_FONT_TYPE, color: '#000' };

/** Input Components font a theme starts with; parts the theme saved win over these. */
export const DEFAULT_INPUT_FONT: IFontValue = { size: 14, weight: '400', type: DEFAULT_FONT_TYPE, color: '#000' };

const withFontDefaults = (defaults: IFontValue, font: IFontValue | undefined): IFontValue => {
  const result: IFontValue = { ...defaults };
  Object.entries(font ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') (result as Record<string, unknown>)[key] = value;
  });
  return result;
};

/**
 * Fills in the font defaults a theme is initialised with (label font and Input Components font), so they
 * show in the theme settings and apply to forms. Only parts the saved theme left unset are filled in.
 */
export const applyThemeDefaults = (theme: IConfigurableTheme): IConfigurableTheme => {
  const inputGroup = theme.componentGroups?.input ?? {};
  return {
    ...theme,
    labelFont: withFontDefaults(DEFAULT_LABEL_FONT, theme.labelFont),
    componentGroups: {
      ...theme.componentGroups,
      input: { ...inputGroup, font: withFontDefaults(DEFAULT_INPUT_FONT, inputGroup.font) },
    },
  };
};
