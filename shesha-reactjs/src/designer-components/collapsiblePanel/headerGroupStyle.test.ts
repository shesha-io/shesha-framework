import { getComponentDefinitions } from '@/providers/form/defaults/toolboxComponents';
import { IConfigurableFormComponent, IStyleValue } from '@/providers/form/models';
import { getEffectiveStyle } from '@/utils/style';
import { headerGroupStyle } from './utils';

type PanelStyle = IStyleValue & { headerStyles?: IStyleValue };

const layoutGroup: IStyleValue = {
  background: { type: 'color', color: '#123456' },
  border: { borderType: 'all', border: { all: { width: '2px', color: '#ff0000', style: 'dashed' } } },
  shadow: { blurRadius: 4, color: '#000', offsetX: 0, offsetY: 2, spreadRadius: 0 },
  stylingBoxJson: { _type: 'styleBox', marginTop: '20', paddingLeft: '12' },
};

describe('headerGroupStyle', () => {
  it('takes border, background and padding, not margin or shadow', () => {
    const header = headerGroupStyle(layoutGroup);
    expect(header.background).toEqual(layoutGroup.background);
    expect(header.border).toEqual(layoutGroup.border);
    expect(header.shadow).toBeUndefined();
    expect(header.stylingBoxJson?.paddingLeft).toBe('12');
    expect(header.stylingBoxJson?.marginTop).toBeUndefined();
  });
});

describe('panel header theme inheritance', () => {
  const panel = getComponentDefinitions().get('collapsiblePanel');
  if (!panel) throw new Error('collapsiblePanel is not registered');
  const model = { id: 'p', type: 'collapsiblePanel', propertyName: 'p' } as IConfigurableFormComponent;

  it('applies the Layout Components theme to the header as well as the body', () => {
    const style = getEffectiveStyle(model, 'desktop', { componentGroups: { layout: layoutGroup } }, panel) as PanelStyle;
    expect(style.background).toEqual(layoutGroup.background);
    expect(style.headerStyles?.background).toMatchObject({ type: 'color', color: '#123456' });
    expect(style.headerStyles?.border?.border).toEqual(layoutGroup.border?.border);
    // Header keeps its own defaults where the group says nothing.
    expect(style.headerStyles?.font?.size).toBe(14);
  });

  it('lets the panel\'s own header style win over the group', () => {
    const own = { ...model, desktop: { headerStyles: { background: { type: 'color', color: '#00ff00' } } } } as IConfigurableFormComponent;
    const style = getEffectiveStyle(own, 'desktop', { componentGroups: { layout: layoutGroup } }, panel) as PanelStyle;
    expect(style.headerStyles?.background?.color).toBe('#00ff00');
  });
});
