import { getFormSettingsFormMarkup } from '@/components/formDesigner/formSettings';
import { getComponentDefinitions } from '../defaults/toolboxComponents';
import { DEFAULT_FORM_SETTINGS, FormMarkupWithSettings, IFormSettings } from '../models';
import { componentsTreeToFlatStructure, findComponent, isComponentHidden } from '../utils';
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
});
