import { getEmptyFlatMarkup, IConfigurableFormComponent } from '@/providers/form/models';
import { upgradeComponent } from '@/providers/form/utils';
import CardComponent from '../index';
import { ICardComponentProps } from '../interfaces';
import { CARD_HEADER_LAYOUT_NAME, migrateCardHeaderLayout } from './migrateHeaderLayout';
import { legacyHeaderStyles } from '../utils';

const button = { id: 'btn', type: 'button', propertyName: 'btn', componentName: 'btn', parentId: 'header', hidden: false } as IConfigurableFormComponent;

const oldCard = (label: ICardComponentProps['label'] = 'My card'): ICardComponentProps => ({
  id: 'card', type: 'card', propertyName: 'card', componentName: 'card', label, hidden: false,
  header: { id: 'header', components: [button] },
  content: { id: 'content', components: [] },
});

describe('migrateCardHeaderLayout', () => {
  it('wraps the heading and the existing header components in a header layout', () => {
    const flat = getEmptyFlatMarkup();
    flat.allComponents['btn'] = button;
    flat.componentRelations['header'] = ['btn'];

    const result = migrateCardHeaderLayout(oldCard(), { flatStructure: flat, componentId: 'card' });

    const layoutId = flat.componentRelations['header'][0] ?? '';
    const layout = flat.allComponents[layoutId];
    expect((layout as IConfigurableFormComponent | undefined)?.componentName).toBe(CARD_HEADER_LAYOUT_NAME);
    expect(result.header?.components?.[0]?.id).toBe(layoutId);

    const [textId, extraId] = flat.componentRelations[layoutId] ?? [];
    expect(flat.allComponents[textId ?? '']).toMatchObject({ type: 'headerTitle', content: 'My card', parentId: layoutId });
    expect(flat.allComponents[extraId ?? '']).toMatchObject({ type: 'container', componentName: 'extraArea' });
    expect(flat.componentRelations[extraId ?? '']).toEqual(['btn']);
    expect(flat.allComponents['btn'].parentId).toBe(extraId);
    expect(flat.parents[layoutId]).toBe('header');
    expect(flat.parents['btn']).toBe(extraId);
  });

  it('keeps a JS heading as the text content', () => {
    const flat = getEmptyFlatMarkup();
    const jsLabel = { _mode: 'code', _code: 'return "x";', _value: '' } as unknown as string;
    migrateCardHeaderLayout(oldCard(jsLabel), { flatStructure: flat, componentId: 'card' });
    const layoutId = flat.componentRelations['header']?.[0] ?? '';
    const textId = flat.componentRelations[layoutId]?.[0] ?? '';
    expect((flat.allComponents[textId] as unknown as { content: unknown }).content).toBe(jsLabel);
  });

  it('runs only once', () => {
    const flat = getEmptyFlatMarkup();
    const once = migrateCardHeaderLayout(oldCard(), { flatStructure: flat, componentId: 'card' });
    const relations = { ...flat.componentRelations };
    const twice = migrateCardHeaderLayout(once, { flatStructure: flat, componentId: 'card' });
    expect(twice).toBe(once);
    expect(flat.componentRelations).toEqual(relations);
  });
});

describe('card migrator', () => {
  it('pins the legacy header look on existing cards', () => {
    const model = upgradeComponent({ ...oldCard(), version: 5 } as IConfigurableFormComponent, CardComponent, undefined, getEmptyFlatMarkup()) as ICardComponentProps;
    expect(model.desktop?.headerStyles).toEqual(legacyHeaderStyles());
    expect(model.mobile?.headerStyles).toEqual(legacyHeaderStyles());
  });

  it('leaves new cards to the theme and the component defaults', () => {
    const model = upgradeComponent(oldCard() as IConfigurableFormComponent, CardComponent, undefined, getEmptyFlatMarkup(), true) as ICardComponentProps;
    expect(model.desktop?.headerStyles).toBeUndefined();
    expect(model.header?.components?.[0]?.componentName).toBe(CARD_HEADER_LAYOUT_NAME);
  });
});
