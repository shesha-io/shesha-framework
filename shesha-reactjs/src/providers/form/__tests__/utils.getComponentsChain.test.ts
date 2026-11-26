import { getFormSettingsFormMarkup } from '@/components/formDesigner/formSettings';
import { getComponentDefinitions } from '../defaults/toolboxComponents';
import { DEFAULT_FORM_SETTINGS, FormMarkupWithSettings, IConfigurableFormComponent, IFormSettings } from '../models';
import { componentsTreeToFlatStructure, findComponent, getComponentsChain, isComponentHidden } from '../utils';
import { makeFormBuliderFactory } from '@/form-factory/implementation';
import { GqlLoaderSettings } from '../loaders/interfaces';

describe('getComponentsChain()', () => {
  const componentDefinitions = getComponentDefinitions();
  const formSettingsMarkup = getFormSettingsFormMarkup({ fbf: makeFormBuliderFactory(componentDefinitions), removeStyleRouter: true });
  const components = Object.fromEntries(componentDefinitions);
  const flatStructure = componentsTreeToFlatStructure(components, (formSettingsMarkup as FormMarkupWithSettings).components);

  const gqlLoaderSettings: GqlLoaderSettings = {
    endpointType: 'default',
  };
  const formSettingsData: IFormSettings = {
    ...DEFAULT_FORM_SETTINGS,
    dataLoaderType: 'gql',
    dataLoadersSettings: { gql: gqlLoaderSettings },
  };

  it('should validate default settings', () => {
    const propName = "dataLoadersSettings.gql.staticEndpoint.url";
    const gqlUrlComponent = findComponent(flatStructure, (c) => c.propertyName === propName && c.type === 'endpointsAutocomplete');
    expect(gqlUrlComponent).toBeDefined();

    const step1FooterPropertyHidden = gqlUrlComponent != null && isComponentHidden(flatStructure, gqlUrlComponent.id, { data: formSettingsData });

    expect(step1FooterPropertyHidden).toBe(true);
  });

  it('carries on past the containers of their own a component holds', () => {
    const table = (id: string): object => ({ id, type: 'datatable', propertyName: id });
    const tree = [{
      id: 'ctx', type: 'datatableContext', propertyName: 'ctx', components: [
        { id: 'tabs', type: 'tabs', propertyName: 'tabs', tabs: [{ id: 'tab1', components: [table('inTab')] }] },
        { id: 'cols', type: 'columns', propertyName: 'cols', columns: [{ id: 'col1', components: [table('inColumn')] }] },
        {
          id: 'panel', type: 'collapsiblePanel', propertyName: 'panel',
          header: { id: 'header', components: [table('inHeader')] },
          content: { id: 'content', components: [table('inContent')] },
        },
      ],
    }] as unknown as IConfigurableFormComponent[];
    const flat = componentsTreeToFlatStructure(components, tree);

    const chainOf = (id: string): string[] => getComponentsChain(flat, id).map((c) => c.id);
    expect(chainOf('inTab')).toEqual(['ctx', 'tabs', 'inTab']);
    expect(chainOf('inColumn')).toEqual(['ctx', 'cols', 'inColumn']);
    expect(chainOf('inHeader')).toEqual(['ctx', 'panel', 'inHeader']);
    expect(chainOf('inContent')).toEqual(['ctx', 'panel', 'inContent']);
  });
});
