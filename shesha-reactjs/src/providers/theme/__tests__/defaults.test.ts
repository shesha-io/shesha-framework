import { applyThemeDefaults, DEFAULT_INPUT_FONT, DEFAULT_LABEL_FONT, getEffectiveLabelFont, getThemeGroupStyle, upgradeLegacyThemeFonts } from '../defaults';

describe('applyThemeDefaults', () => {
  it('stores no font defaults, so the base font can always override them', () => {
    expect(applyThemeDefaults({})).toEqual({});
    const saved = { componentGroups: { input: { font: { weight: '700' } }, inline: { font: { size: 12 } } } };
    expect(applyThemeDefaults(saved)).toEqual(saved);
  });

  it('upgrades a legacy theme', () => {
    const theme = applyThemeDefaults({ fontFamily: 'Roboto', labelFont: { size: 16 } });
    expect(theme).toEqual({ font: { type: 'Roboto' }, componentGroups: { input: { labelFont: { size: 16 } } } });
    // The label font's unset type inherits the upgraded base font.
    expect(getEffectiveLabelFont(theme)).toEqual({ ...DEFAULT_LABEL_FONT, type: 'Roboto', size: 16 });
  });
});

describe('getThemeGroupStyle', () => {
  it('resolves the input font from the defaults, then the base font, then the group font', () => {
    expect(getThemeGroupStyle({}, 'input')?.font).toEqual(DEFAULT_INPUT_FONT);
    const theme = { font: { type: 'Roboto', size: 20 }, componentGroups: { input: { font: { size: 12 } } } };
    expect(getThemeGroupStyle(theme, 'input')?.font).toEqual({ ...DEFAULT_INPUT_FONT, type: 'Roboto', size: 12 });
  });

  it('lets a base weight override the default weight', () => {
    expect(getThemeGroupStyle({ font: { weight: '700' } }, 'input')?.font?.weight).toBe('700');
  });

  it('falls back to the default when a base font part is cleared', () => {
    const theme = { font: { type: 'Roboto', size: 20 } };
    expect(getThemeGroupStyle(theme, 'input')?.font?.size).toBe(20);
    const cleared = { font: { type: 'Roboto', size: undefined } };
    expect(getThemeGroupStyle(cleared, 'input')?.font?.size).toBe(DEFAULT_INPUT_FONT.size);
  });

  it('passes a base font edit made after loading on to the inherited input font parts', () => {
    const loaded = applyThemeDefaults({ font: { type: 'Roboto', size: 20 }, componentGroups: { input: { font: { size: 12 } } } });
    const edited = { ...loaded, font: { type: 'Lato', size: 22 } };
    expect(getThemeGroupStyle(edited, 'input')?.font).toMatchObject({ type: 'Lato', size: 12 });
  });

  it('leaves other groups as they are', () => {
    const theme = { font: { type: 'Roboto' }, componentGroups: { inline: { font: { size: 12 } } } };
    expect(getThemeGroupStyle(theme, 'inline')).toEqual({ font: { size: 12 } });
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
  it('is the label defaults when the theme sets neither a base nor a label font', () => {
    expect(getEffectiveLabelFont({})).toEqual(DEFAULT_LABEL_FONT);
    expect(getEffectiveLabelFont(undefined)).toEqual(DEFAULT_LABEL_FONT);
  });

  it('layers the defaults, the base font and the label font, in that order', () => {
    const font = getEffectiveLabelFont({
      font: { type: 'Roboto', color: '#111', weight: '700' },
      componentGroups: { input: { labelFont: { size: 16, color: '#222' } } },
    });
    expect(font).toEqual({ type: 'Roboto', size: 16, color: '#222', weight: '700' });
  });

  it('passes a base font edit made after loading on to the inherited label font parts', () => {
    const loaded = applyThemeDefaults({ font: { type: 'Roboto' }, componentGroups: { input: { labelFont: { size: 16 } } } });
    expect(getEffectiveLabelFont({ ...loaded, font: { type: 'Lato' } })).toMatchObject({ type: 'Lato', size: 16 });
  });
});
