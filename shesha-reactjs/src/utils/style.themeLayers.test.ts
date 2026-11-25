import { IConfigurableFormComponent, IStyleValue, IToolboxComponent } from '@/interfaces';
import { IConfigurableTheme } from '@/providers/theme/contexts';
import { IBackgroundValue } from '@/designer-components/_settings/utils/background/interfaces';
// The style utilities load the toolbox (and with it the header helpers) first, as the app does.
import { getEffectiveStyle, getGroupStyleForComponent, getThemeBaseStyle, isEmptyBackground } from './style';
import { getHeaderGroupStyle } from '@/designer-components/_common/styles/headerStyles';

const component = (getDefaultStyles: () => IStyleValue): IToolboxComponent =>
  ({ type: 'testComponent', themeGroup: 'input', getDefaultStyles }) as unknown as IToolboxComponent;

const model = (desktop?: IStyleValue): IConfigurableFormComponent =>
  ({ id: '1', type: 'testComponent', propertyName: 'test', desktop }) as unknown as IConfigurableFormComponent;

describe('getThemeBaseStyle', () => {
  it('is undefined when the theme has no base font', () => {
    expect(getThemeBaseStyle(undefined)).toBeUndefined();
    expect(getThemeBaseStyle({})).toBeUndefined();
    expect(getThemeBaseStyle({ font: { type: '', size: undefined } })).toBeUndefined();
  });

  it('carries the parts of the base font the theme set', () => {
    expect(getThemeBaseStyle({ font: { type: 'Roboto', color: '' } })).toEqual({ font: { type: 'Roboto' } });
  });

  it('gives the base font to the nested style values that inherit the group style (e.g. headers)', () => {
    const panel = { nestedGroupStyles: { headerStyles: () => ({}) } };
    expect(getThemeBaseStyle({ font: { type: 'Roboto' } }, panel)).toEqual({ font: { type: 'Roboto' }, headerStyles: { font: { type: 'Roboto' } } });
  });
});

describe('getEffectiveStyle theme layers', () => {
  const theme: IConfigurableTheme = {
    font: { type: 'Roboto', color: '#111' },
    componentGroups: { input: { font: { size: 13 }, labelFont: { size: 20 } } },
    components: { testComponent: { font: { weight: '600' } } },
  };

  it('fills what no other layer sets from the theme base font', () => {
    const style = getEffectiveStyle(model(), 'desktop', theme, component(() => ({ font: { size: 14 } })));
    expect(style.font).toEqual({ type: 'Roboto', color: '#111', size: 13, weight: '600' });
  });

  it('lets component defaults, group, per-type and instance override the base, in that order', () => {
    const style = getEffectiveStyle(
      model({ font: { color: '#999' } }),
      'desktop',
      theme,
      component(() => ({ font: { type: 'Inter Variable', size: 14, weight: '400' } })),
    );
    // The Input Components font inherits the base font's type over the component's own default.
    expect(style.font).toEqual({ type: 'Roboto', color: '#999', size: 13, weight: '600' });
  });

  it('never applies the theme to settings forms', () => {
    const own = model({ font: { size: 11 } });
    expect(getEffectiveStyle(own, 'desktop', theme, component(() => ({})), true)).toBe(own);
  });

  it('keeps the group label font out of the component style', () => {
    const style = getEffectiveStyle(model(), 'desktop', theme, component(() => ({}))) as IStyleValue & { labelFont?: unknown };
    expect(style.labelFont).toBeUndefined();
  });
});

describe('getEffectiveStyle theme layers for headers', () => {
  const panel = {
    type: 'testComponent',
    themeGroup: 'layout',
    nestedGroupStyles: { headerStyles: getHeaderGroupStyle },
    getDefaultStyles: () => ({ headerStyles: { font: { size: 14 } } }),
  } as unknown as IToolboxComponent;

  it('lets a header inherit the base font, under the group header defaults', () => {
    const style = getEffectiveStyle(model(), 'desktop', {
      font: { type: 'Roboto', color: '#111' },
      componentGroups: { layout: { headerStyles: { font: { color: '#222' } } } },
    }, panel) as IStyleValue & { headerStyles?: IStyleValue };
    expect(style.headerStyles?.font).toEqual({ type: 'Roboto', color: '#222', size: 14 });
    expect(style).not.toHaveProperty('headerStyles.headerStyles');
  });

  // Precedence: instance > theme component > theme group, for a header as for the body.
  const red = { type: 'color', color: 'red' } as IBackgroundValue;
  const blue = { type: 'color', color: 'blue' } as IBackgroundValue;
  const green = { type: 'color', color: 'green' } as IBackgroundValue;
  const groupTheme = (components?: IConfigurableTheme['components']): IConfigurableTheme => ({
    componentGroups: { layout: { background: red, headerStyles: { font: { color: 'red' } } } },
    ...(components ? { components } : {}),
  });

  it('lets a header inherit the theme component body over the group', () => {
    const style = getEffectiveStyle(model(), 'desktop', groupTheme({ testComponent: { background: blue } }), panel) as IStyleValue & { headerStyles?: IStyleValue };
    expect(style.background).toMatchObject(blue);
    expect(style.headerStyles?.background).toMatchObject(blue);
    // Only border, background and padding pass from the body: the header font stays the group's.
    expect(style.headerStyles?.font?.color).toBe('red');
  });

  it('keeps the theme component header style over what it inherits from the component body', () => {
    const style = getEffectiveStyle(model(), 'desktop', groupTheme({ testComponent: { background: blue, headerStyles: { background: green } } }), panel) as IStyleValue & { headerStyles?: IStyleValue };
    expect(style.headerStyles?.background).toMatchObject(green);
  });

  it('keeps the instance header style over the theme component', () => {
    const style = getEffectiveStyle(model({ headerStyles: { background: green } } as IStyleValue), 'desktop', groupTheme({ testComponent: { background: blue } }), panel) as IStyleValue & { headerStyles?: IStyleValue };
    expect(style.headerStyles?.background).toMatchObject(green);
  });

  it('leaves the header to the group when the theme component sets no body style', () => {
    const style = getEffectiveStyle(model(), 'desktop', groupTheme(), panel) as IStyleValue & { headerStyles?: IStyleValue };
    expect(style.headerStyles?.background).toMatchObject(red);
  });
});

describe('getGroupStyleForComponent', () => {
  it('drops the parts of the group style that are not a component style', () => {
    expect(getGroupStyleForComponent({ font: { size: 13 }, labelFont: { size: 20 }, headerStyles: { font: { size: 18 } } }, undefined)).toEqual({ font: { size: 13 } });
  });
});

describe('empty theme backgrounds', () => {
  const gradient: IBackgroundValue = { type: 'gradient', gradient: { colors: ['#bcc41a', '#f1f5a4'] } };
  const panel = {
    type: 'testComponent',
    themeGroup: 'layout',
    nestedGroupStyles: { headerStyles: getHeaderGroupStyle },
    getDefaultStyles: () => ({ background: { type: 'color', color: '#fff' }, headerStyles: { background: { type: 'color', color: '#fff' } } }),
  } as unknown as IToolboxComponent;

  it('isEmptyBackground is true when the chosen type has no value', () => {
    expect(isEmptyBackground({ type: 'color' })).toBe(true);
    expect(isEmptyBackground({ type: 'color', gradient: { colors: ['#000'] } })).toBe(true);
    expect(isEmptyBackground({ type: 'gradient', gradient: { colors: [] } })).toBe(true);
    expect(isEmptyBackground({ type: 'color', color: '#fff' })).toBe(false);
    expect(isEmptyBackground(gradient)).toBe(false);
  });

  it('a component default holding only a background type does not replace the group background', () => {
    const theme: IConfigurableTheme = {
      componentGroups: { layout: { background: gradient } },
      components: { testComponent: { background: { type: 'color' }, headerStyles: { background: { type: 'color', gradient: { colors: ['#1a61c4', '#fff'] } } } } as IStyleValue },
    };
    const style = getEffectiveStyle(model(), 'desktop', theme, panel) as IStyleValue & { headerStyles?: IStyleValue };
    expect(style.background).toMatchObject(gradient);
    expect(style.headerStyles?.background).toMatchObject(gradient);
  });

  it('a component default with a real background still wins over the group', () => {
    const theme: IConfigurableTheme = {
      componentGroups: { layout: { background: gradient } },
      components: { testComponent: { background: { type: 'color', color: '#f00' } } },
    };
    expect(getEffectiveStyle(model(), 'desktop', theme, panel).background).toMatchObject({ type: 'color', color: '#f00' });
  });
});
