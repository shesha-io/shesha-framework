import { getFormSettingsFormMarkup } from '@/components/formDesigner/formSettings';
import { getComponentDefinitions } from '../defaults/toolboxComponents';
import { DEFAULT_FORM_SETTINGS, EMPTY_FLAT_COMPONENTS_STRUCTURE, FormMarkupWithSettings, IFormSettings } from '../models';
import { componentsTreeToFlatStructure, findComponent, isComponentHidden, validateConfigurableComponentSettings } from '../utils';
import * as nestedContainers from './custom-containers.json';

import { makeFormBuliderFactory } from '@/form-factory/implementation';
import { GqlLoaderSettings } from '../loaders/interfaces';
import { IDictionary } from '@/interfaces';
import { isDefined } from '@/utils';
import { AsyncValidationError } from '@rc-component/async-validator/lib/util';

describe('componentsTreeToFlatStructure()', () => {
  const components = Object.fromEntries(getComponentDefinitions(true));
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
    const formSettingsMarkup = getFormSettingsFormMarkup({ fbf: makeFormBuliderFactory(), removeStyleRouter: true });
    const flatStructure = componentsTreeToFlatStructure(components, (formSettingsMarkup as FormMarkupWithSettings).components);

    const endpointAutocomplete = findComponent(flatStructure, (component) =>
      component.type === 'endpointsAutocomplete' && component.propertyName === 'dataLoadersSettings.gql.staticEndpoint.url',
    );
    expect(endpointAutocomplete).toBeDefined();
  });
});

describe('validateConfigurableComponentSettings()', () => {
  const formSettingsMarkup = getFormSettingsFormMarkup({ fbf: makeFormBuliderFactory(), removeStyleRouter: true });

  it('should validate default settings', () => {
    expect(() => validateConfigurableComponentSettings(formSettingsMarkup, DEFAULT_FORM_SETTINGS)).not.toThrow();
  });

  it('should not validate hidden fields', async () => {
    const gqlLoaderSettings: GqlLoaderSettings = {
      endpointType: 'default',
    };
    const formSettingsData: IFormSettings = {
      ...DEFAULT_FORM_SETTINGS,
      dataLoaderType: 'gql',
      dataLoadersSettings: gqlLoaderSettings as unknown as IDictionary<object>,
    };
    try {
      // We should evaluate `hidden` property of full chain of containers and disable validation when one of containers is hidden
      // Steps:
      // 1. build chain of containers from top to current one
      // 2. evaluate `hidden` property of each container. Pass current context + model
      // 3. if any container is hidden - disable validation
      await validateConfigurableComponentSettings(formSettingsMarkup, formSettingsData);
    } catch (error) {
      expect(error).toBeInstanceOf(AsyncValidationError);
      if (error instanceof AsyncValidationError) {
        const urlErrors = error.fields['dataLoadersSettings.gql.staticEndpoint.url'];
        if (isDefined(urlErrors)) {
          const isRequired = urlErrors.some((ve) => ve.message === 'This field is required');
          expect(isRequired).toBe(false);
        }
      }

      return;
    }
  });
});

describe('getComponentsChain()', () => {
  const formSettingsMarkup = getFormSettingsFormMarkup({ fbf: makeFormBuliderFactory(), removeStyleRouter: true });
  const components = Object.fromEntries(getComponentDefinitions(true));
  const flatStructure = componentsTreeToFlatStructure(components, (formSettingsMarkup as FormMarkupWithSettings).components);

  const gqlLoaderSettings: GqlLoaderSettings = {
    endpointType: 'default',
  };
  const formSettingsData: IFormSettings = {
    ...DEFAULT_FORM_SETTINGS,
    dataLoaderType: 'gql',
    dataLoadersSettings: gqlLoaderSettings as unknown as IDictionary<object>,
  };

  it('should validate default settings', () => {
    const propName = "dataLoadersSettings.gql.staticEndpoint.url";
    const gqlUrlComponent = findComponent(flatStructure, (c) => c.propertyName === propName && c.type === 'endpointsAutocomplete');
    expect(gqlUrlComponent).toBeDefined();

    const step1FooterPropertyHidden = gqlUrlComponent != null && isComponentHidden(flatStructure, gqlUrlComponent.id, { data: formSettingsData });

    expect(step1FooterPropertyHidden).toBe(true);
  });
});
