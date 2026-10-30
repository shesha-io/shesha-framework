import { setUndefinedForEmptyProperties } from '../parameters';

describe('setUndefinedForEmptyProperties', () => {
  it('converts empty strings and nulls to undefined, including nested ones', () => {
    const theme = {
      layoutBackground: '',
      labelAlign: null,
      componentGroups: {
        inline: {
          font: {},
          border: { borderType: 'all', border: { all: { color: null } } },
        },
      },
    };

    setUndefinedForEmptyProperties(theme);

    expect(theme.layoutBackground).toBeUndefined();
    expect(theme.labelAlign).toBeUndefined();
    expect(theme.componentGroups.inline.border.border.all.color).toBeUndefined();
    // undefined values must disappear from the persisted JSON so defaults are inherited again
    expect(JSON.stringify(theme)).not.toContain('null');
  });

  it('keeps real values intact', () => {
    const theme = {
      colon: false,
      labelSpan: 0,
      componentGroups: { inline: { border: { border: { all: { color: '#ff0000', width: '1px' } } } } },
    };

    setUndefinedForEmptyProperties(theme);

    expect(theme.colon).toBe(false);
    expect(theme.labelSpan).toBe(0);
    expect(theme.componentGroups.inline.border.border.all).toEqual({ color: '#ff0000', width: '1px' });
  });
});
