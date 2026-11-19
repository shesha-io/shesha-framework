import { getEmptyFlatMarkup, IConfigurableFormComponent } from '@/providers/form/models';
import { upgradeComponent } from '@/providers/form/utils';
import CollapsiblePanelComponent from '@/designer-components/collapsiblePanel/collapsiblePanelComponent';
import { IToolboxComponent } from '@/interfaces';
import { HEADER_LAYOUT_NAME, replaceTextHeaderTitle } from './utils';

const text = {
  id: 'title', type: 'text', componentName: 'panelLabel', propertyName: 'panelLabel', parentId: 'layout', hidden: false,
  content: 'My panel', contentType: 'default', visible: true, desktop: { font: { color: 'blue' } },
} as IConfigurableFormComponent;
const extra = { id: 'extra', type: 'container', componentName: 'extraArea', propertyName: 'extraArea', parentId: 'layout', hidden: false } as IConfigurableFormComponent;
const layout = {
  id: 'layout', type: 'container', componentName: HEADER_LAYOUT_NAME, propertyName: HEADER_LAYOUT_NAME, parentId: 'header', hidden: false,
  components: [text, extra],
} as IConfigurableFormComponent;

const flatWithHeader = (): ReturnType<typeof getEmptyFlatMarkup> => {
  const flat = getEmptyFlatMarkup();
  flat.allComponents = { layout, title: text, extra };
  flat.componentRelations = { header: ['layout'], layout: ['title', 'extra'], title: [], extra: [] };
  return flat;
};

describe('replaceTextHeaderTitle', () => {
  it('replaces the Text title with a header title, keeping content and visibility but not the Text styles', () => {
    const flat = flatWithHeader();
    const header = replaceTextHeaderTitle({ id: 'header', components: [layout] }, flat, 'panelLabel');

    const expected = { id: 'title', type: 'headerTitle', componentName: 'panelLabel', parentId: 'layout', content: 'My panel', visible: true };
    expect(flat.allComponents['title']).toMatchObject(expected);
    expect(flat.allComponents['title']).not.toHaveProperty('desktop');
    expect((header?.components?.[0] as IConfigurableFormComponent & { components: IConfigurableFormComponent[] }).components[0]).toMatchObject(expected);
    expect(flat.allComponents['extra']).toBe(extra);
  });

  it('leaves other Text components alone', () => {
    const flat = flatWithHeader();
    replaceTextHeaderTitle({ id: 'header', components: [layout] }, flat, 'cardLabel');
    expect(flat.allComponents['title']).toBe(text);
  });
});

const panelDefinition = CollapsiblePanelComponent as unknown as IToolboxComponent;

describe('panel migrator', () => {
  it('turns the title of an existing panel into a header title', () => {
    const flat = flatWithHeader();
    const panel = { id: 'panel', type: 'collapsiblePanel', componentName: 'panel', propertyName: 'panel', hidden: false, version: 11, header: { id: 'header', components: [layout] } } as IConfigurableFormComponent;
    upgradeComponent(panel, panelDefinition, undefined, flat);
    expect(flat.allComponents['title']).toMatchObject({ type: 'headerTitle', content: 'My panel' });
  });

  it('creates new panels with a header title', () => {
    const flat = getEmptyFlatMarkup();
    const panel = { id: 'panel', type: 'collapsiblePanel', componentName: 'panel', propertyName: 'panel', hidden: false, label: 'New panel' } as IConfigurableFormComponent;
    const model = upgradeComponent(panel, panelDefinition, undefined, flat, true) as IConfigurableFormComponent & { header: { components: Array<{ components: IConfigurableFormComponent[] }> } };
    expect(model.header.components[0]?.components[0]).toMatchObject({ type: 'headerTitle', content: 'New panel' });
  });
});
