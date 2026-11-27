import { isConfigurableFormComponent } from '@/providers/form/models';
import { buildTestMarkup, getTestDefinition, sampleForm, testComponent } from '@/providers/formDesigner/__tests__/testMarkup';
import { buildLayersIndex } from '../buildLayersIndex';
import { buildRowView, getLayerLabel, getLayerSecondaryText } from '../labels';

const markup = buildTestMarkup(sampleForm());
const index = buildLayersIndex(markup, getTestDefinition);

const nodeOf = (id: string): NonNullable<ReturnType<typeof index.nodes.get>> => {
  const node = index.nodes.get(id);
  if (node === undefined)
    throw new Error(`No node ${id}`);
  return node;
};

describe('labels', () => {
  it('labels components and panes', () => {
    expect(getLayerLabel(nodeOf('email'), markup, getTestDefinition)).toBe('Email');
    expect(getLayerLabel(nodeOf('pane-a'), markup, getTestDefinition)).toBe('Details');
  });

  it('shows the property name, else the component name, and never repeats the label', () => {
    expect(getLayerSecondaryText(testComponent({ id: 'a', type: 'textField', propertyName: 'email', componentName: 'txtEmail' }), 'Email')).toBe('email');
    expect(getLayerSecondaryText(testComponent({ id: 'a', type: 'button', componentName: 'btnSave' }), 'Save')).toBe('btnSave');
    expect(getLayerSecondaryText(testComponent({ id: 'a', type: 'button', componentName: 'btnSave' }), 'btnSave')).toBeUndefined();
  });

  it('marks empty panes and hidden components', () => {
    const owner = markup.allComponents['tabs1'];
    if (!isConfigurableFormComponent(owner))
      throw new Error('tabs1 missing');
    expect(buildRowView(nodeOf('pane-b'), owner, getTestDefinition)).toMatchObject({ label: 'Address', isEmptyPane: true });

    const hiddenMarkup = buildTestMarkup([{ id: 'h1', type: 'textField', label: 'Secret', hidden: true }]);
    const hiddenIndex = buildLayersIndex(hiddenMarkup, getTestDefinition);
    const hidden = hiddenMarkup.allComponents['h1'];
    const hiddenNode = hiddenIndex.nodes.get('h1');
    if (!isConfigurableFormComponent(hidden) || hiddenNode === undefined)
      throw new Error('h1 missing');
    expect(buildRowView(hiddenNode, hidden, getTestDefinition).indicators.showHidden).toBe(true);
  });
});
