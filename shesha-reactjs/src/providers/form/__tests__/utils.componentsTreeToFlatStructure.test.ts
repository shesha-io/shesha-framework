import { getFormSettingsFormMarkup } from '@/components/formDesigner/formSettings';
import { getComponentDefinitions } from '../defaults/toolboxComponents';
import { EMPTY_FLAT_COMPONENTS_STRUCTURE, FormMarkupWithSettings } from '../models';
import { componentsTreeToFlatStructure, findComponent } from '../utils';
import * as nestedContainers from './custom-containers.json';

import { makeFormBuliderFactory } from '@/form-factory/implementation';

describe('componentsTreeToFlatStructure()', () => {
  const componentDefinitions = getComponentDefinitions();
  const components = Object.fromEntries(getComponentDefinitions());
  const markupCopmponents = (nestedContainers as FormMarkupWithSettings).components;
  const flatStructure = componentsTreeToFlatStructure(components, markupCopmponents);

  it('should not mutate EMPTY_FLAT_COMPONENTS_STRUCTURE', () => {
    expect(EMPTY_FLAT_COMPONENTS_STRUCTURE.allComponents).toEqual({});
    expect(EMPTY_FLAT_COMPONENTS_STRUCTURE.componentRelations).toEqual({});
    expect(EMPTY_FLAT_COMPONENTS_STRUCTURE.parents).toEqual({});
  });

  it('should process wizard steps', () => {
    const step1Property = flatStructure.allComponents["w_5Sr2KY_2o-ksNEk65FV9aQVrT7gS"];
    expect(step1Property).toBeDefined();
  });

  it('should process wizard step footer', () => {
    const step1FooterProperty = flatStructure.allComponents["k1TnC59iWIBpbMd37GdaR1bptdeCSf"];
    expect(step1FooterProperty).toBeDefined();
  });

  it('should process nested settings', () => {
    const formSettingsMarkup = getFormSettingsFormMarkup({ fbf: makeFormBuliderFactory(componentDefinitions), removeStyleRouter: true });
    const flatStructure = componentsTreeToFlatStructure(components, (formSettingsMarkup as FormMarkupWithSettings).components);

    const endpointAutocomplete = findComponent(flatStructure, (component) =>
      component.type === 'endpointsAutocomplete' && component.propertyName === 'dataLoadersSettings.gql.staticEndpoint.url',
    );
    expect(endpointAutocomplete).toBeDefined();
  });
});
