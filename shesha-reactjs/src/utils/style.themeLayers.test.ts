import { IConfigurableFormComponent, IStyleValue, IToolboxComponent } from '@/interfaces';
import { IConfigurableTheme } from '@/providers/theme/contexts';
// The style utilities load the toolbox (and with it the header helpers) first, as the app does.
import { getEffectiveStyle, getGroupStyleForComponent, getThemeBaseStyle } from './style';
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
    expect(style.font).toEqual({ type: 'Inter Variable', color: '#999', size: 13, weight: '600' });
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
});

describe('getGroupStyleForComponent', () => {
  it('drops the parts of the group style that are not a component style', () => {
    expect(getGroupStyleForComponent({ font: { size: 13 }, labelFont: { size: 20 }, headerStyles: { font: { size: 18 } } }, undefined)).toEqual({ font: { size: 13 } });
  });
});
