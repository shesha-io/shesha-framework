import { IConfigurableTheme } from '@/providers/theme/contexts';
import { getColorByContentType } from './genericText';

const theme = (overrides: IConfigurableTheme = {}): IConfigurableTheme => ({ text: { default: '#111111', secondary: '#777777' }, ...overrides });

describe('getColorByContentType', () => {
  it('uses the inline components font colour for default text', () => {
    expect(getColorByContentType('', undefined, theme({ componentGroups: { inline: { font: { color: '#ff0000' } } } }))).toBe('#ff0000');
  });

  it('prefers the Text component theme colour over the inline group colour', () => {
    const t = theme({ componentGroups: { inline: { font: { color: '#ff0000' } } }, components: { text: { font: { color: '#00ff00' } } } });
    expect(getColorByContentType('', undefined, t)).toBe('#00ff00');
  });

  it('falls back to the theme default text colour when no inline colour is set', () => {
    expect(getColorByContentType('', undefined, theme())).toBe('#111111');
  });

  it('ignores a leftover custom colour on default text', () => {
    expect(getColorByContentType('', '#abcdef', theme())).toBe('#111111');
  });

  it('keeps the custom and secondary colours', () => {
    expect(getColorByContentType('custom', '#abcdef', theme({ componentGroups: { inline: { font: { color: '#ff0000' } } } }))).toBe('#abcdef');
    expect(getColorByContentType('secondary', undefined, theme())).toBe('#777777');
  });
});
