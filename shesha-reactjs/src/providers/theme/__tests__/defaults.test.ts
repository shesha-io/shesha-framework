import { applyThemeDefaults, DEFAULT_INPUT_FONT, DEFAULT_LABEL_FONT } from '../defaults';

describe('applyThemeDefaults', () => {
  it('initialises the label and input fonts of a theme that set none', () => {
    const theme = applyThemeDefaults({});
    expect(theme.labelFont).toEqual({ size: 14, weight: '500', type: 'Inter Variable', color: '#000' });
    expect(theme.componentGroups?.input?.font).toEqual({ size: 14, weight: '400', type: 'Inter Variable', color: '#000' });
  });

  it('keeps the parts the theme saved and fills in only the rest', () => {
    const theme = applyThemeDefaults({
      labelFont: { size: 16, color: '' },
      componentGroups: { input: { font: { weight: '700' }, border: { hideBorder: true } }, inline: { font: { size: 12 } } },
    });
    expect(theme.labelFont).toEqual({ ...DEFAULT_LABEL_FONT, size: 16 });
    expect(theme.componentGroups?.input).toEqual({ font: { ...DEFAULT_INPUT_FONT, weight: '700' }, border: { hideBorder: true } });
    expect(theme.componentGroups?.inline).toEqual({ font: { size: 12 } });
  });
});
