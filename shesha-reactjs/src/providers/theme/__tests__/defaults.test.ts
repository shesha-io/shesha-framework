import { applyThemeDefaults, DEFAULT_INPUT_FONT, DEFAULT_LABEL_FONT, getEffectiveLabelFont, upgradeLegacyThemeFonts } from '../defaults';

describe('applyThemeDefaults', () => {
  it('initialises the label and input fonts of a theme that set none', () => {
    const theme = applyThemeDefaults({});
    expect(theme.componentGroups?.input?.labelFont).toEqual({ size: 14, weight: '500', type: 'Inter Variable', color: '#000' });
    expect(theme.componentGroups?.input?.font).toEqual({ size: 14, weight: '400', type: 'Inter Variable', color: '#000' });
    expect(theme.labelFont).toBeUndefined();
  });

  it('keeps the parts the theme saved and fills in only the rest', () => {
    const theme = applyThemeDefaults({
      componentGroups: { input: { font: { weight: '700' }, labelFont: { size: 16, color: '' }, border: { hideBorder: true } }, inline: { font: { size: 12 } } },
    });
    expect(theme.componentGroups?.input).toEqual({
      font: { ...DEFAULT_INPUT_FONT, weight: '700' },
      labelFont: { ...DEFAULT_LABEL_FONT, size: 16 },
      border: { hideBorder: true },
    });
    expect(theme.componentGroups?.inline).toEqual({ font: { size: 12 } });
  });

  it('lets unset input and label font parts inherit the base font', () => {
    const theme = applyThemeDefaults({ font: { type: 'Roboto', size: 20 } });
    expect(theme.componentGroups?.input?.font).toEqual({ ...DEFAULT_INPUT_FONT, type: 'Roboto', size: 20 });
    expect(theme.componentGroups?.input?.labelFont).toEqual({ ...DEFAULT_LABEL_FONT, type: 'Roboto', size: 20 });
  });

  it('keeps group font parts over the base font', () => {
    const theme = applyThemeDefaults({ font: { type: 'Roboto', size: 20 }, componentGroups: { input: { font: { size: 12 } } } });
    expect(theme.componentGroups?.input?.font).toEqual({ ...DEFAULT_INPUT_FONT, type: 'Roboto', size: 12 });
  });

  it('upgrades a legacy theme before filling in defaults', () => {
    const theme = applyThemeDefaults({ fontFamily: 'Roboto', labelFont: { size: 16 } });
    expect(theme.font).toEqual({ type: 'Roboto' });
    // The label font's unset type inherits the upgraded base font.
    expect(theme.componentGroups?.input?.labelFont).toEqual({ ...DEFAULT_LABEL_FONT, type: 'Roboto', size: 16 });
    expect(theme.fontFamily).toBeUndefined();
    expect(theme.labelFont).toBeUndefined();
  });
});

describe('upgradeLegacyThemeFonts', () => {
  it('moves the legacy application font into the base font', () => {
    expect(upgradeLegacyThemeFonts({ fontFamily: 'Roboto' })).toEqual({ font: { type: 'Roboto' } });
  });

  it('keeps a base font type already set over the legacy one', () => {
    expect(upgradeLegacyThemeFonts({ fontFamily: 'Roboto', font: { type: 'Lato', size: 13 } })).toEqual({ font: { type: 'Lato', size: 13 } });
  });

  it('moves the legacy label font into the Input Components group, keeping parts already set there', () => {
    const theme = upgradeLegacyThemeFonts({
      labelFont: { size: 16, weight: '600' },
      componentGroups: { input: { labelFont: { weight: '700' }, font: { size: 12 } } },
    });
    expect(theme.componentGroups?.input).toEqual({ labelFont: { size: 16, weight: '700' }, font: { size: 12 } });
    expect(theme.labelFont).toBeUndefined();
  });

  it('leaves a theme without legacy fonts as it is', () => {
    const current = { font: { type: 'Lato' }, layoutBackground: '#fff' };
    expect(upgradeLegacyThemeFonts(current)).toEqual(current);
  });
});

describe('getEffectiveLabelFont', () => {
  it('is undefined when the theme sets neither a base nor a label font', () => {
    expect(getEffectiveLabelFont({})).toBeUndefined();
    expect(getEffectiveLabelFont(undefined)).toBeUndefined();
  });

  it('inherits the parts the label font does not set from the base font', () => {
    const font = getEffectiveLabelFont({
      font: { type: 'Roboto', color: '#111' },
      componentGroups: { input: { labelFont: { size: 16, color: '#222' } } },
    });
    expect(font).toEqual({ type: 'Roboto', size: 16, color: '#222' });
  });
});
