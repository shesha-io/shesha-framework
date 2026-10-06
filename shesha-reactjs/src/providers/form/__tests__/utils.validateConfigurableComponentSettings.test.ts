import { getFormSettingsFormMarkup } from '@/components/formDesigner/formSettings';
import { getComponentDefinitions } from '../defaults/toolboxComponents';
import { ActionParametersDictionary, DEFAULT_FORM_SETTINGS, IFormSettings, IFormValidationRulesOptions } from '../models';
import { IApplicationContext, validateConfigurableComponentSettings } from '../utils';
import { makeFormBuliderFactory } from '@/form-factory/implementation';
import { isDefined, isNullOrWhiteSpace } from '@/utils';
import { AsyncValidationError } from '@rc-component/async-validator/lib/util';
import { GqlLoaderSettings } from '../loaders/interfaces';
import { ValidateError, Values } from '@rc-component/async-validator';
import { toolbarComponentsMapToComponents } from '../hooks';
import { IConfigurableActionDescriptor } from '@/interfaces/configurableAction';
import { IGetConfigurableActionPayload } from '@/providers/configurableActionsDispatcher/contexts';
import { FormValidator, NULL_DEPENDENCIES_CONTEXT } from '@/providers/formDesigner/formValidator';
import { createConfigurationLoaderMock, createHttpClientMock } from './mocks';

const getFakeActionDescriptor = <TArguments extends ActionParametersDictionary = ActionParametersDictionary>(payload: IGetConfigurableActionPayload): IConfigurableActionDescriptor<TArguments> => {
  return {
    name: payload.name,
    owner: payload.owner,
    ownerUid: payload.owner,
    hasArguments: false,
    executer: () => Promise.resolve(),
  } satisfies IConfigurableActionDescriptor;
};

const isRequiredValidation = (error: ValidateError): boolean => {
  return !isNullOrWhiteSpace(error.message) && error.message.endsWith('is required');
};


describe('validateConfigurableComponentSettings()', () => {
  const componentDefinitions = getComponentDefinitions();
  const formSettingsMarkup = getFormSettingsFormMarkup({ fbf: makeFormBuliderFactory(componentDefinitions), removeStyleRouter: true });
  const toolboxComponents = toolbarComponentsMapToComponents(componentDefinitions);

  const appContext: IApplicationContext = {} as IApplicationContext;

  const formValidator = new FormValidator({
    toolboxComponents: toolboxComponents,
    settingsComponentGetter: () => undefined,
    formBuilderFactory: makeFormBuliderFactory(componentDefinitions),
    getConfigurableActionOrNull: getFakeActionDescriptor,
    appContext: appContext,
    httpClient: createHttpClientMock(),
    configurationLoader: createConfigurationLoaderMock(),
  });
  const validationContext: IFormValidationRulesOptions<Values> = {
    validator: formValidator,
    appContext: appContext,
    componentId: '',
    contextConfigurableActionGetter: () => null,
    path: [],
    dependencies: NULL_DEPENDENCIES_CONTEXT,
  };

  it('should validate default settings', () => {
    expect(() => validateConfigurableComponentSettings(formSettingsMarkup, DEFAULT_FORM_SETTINGS, validationContext)).not.toThrow();
  });

  it('should not validate field in hidden container', async () => {
    const gqlLoaderSettings: GqlLoaderSettings = {
      endpointType: 'default',
    };
    const formSettingsData: IFormSettings = {
      ...DEFAULT_FORM_SETTINGS,
      dataLoaderType: 'gql',
      dataLoadersSettings: { gql: gqlLoaderSettings },
    };
    try {
      await validateConfigurableComponentSettings(formSettingsMarkup, formSettingsData, validationContext);
    } catch (error) {
      expect(error).toBeInstanceOf(AsyncValidationError);
      if (error instanceof AsyncValidationError) {
        const urlErrors = error.fields['dataLoadersSettings.gql.staticEndpoint.url'];
        if (isDefined(urlErrors)) {
          const isRequired = urlErrors.some((ve) => isRequiredValidation(ve));
          expect(isRequired).toBe(false);
        }
      }

      return;
    }
  });
  it('should validate field in visible container: negative', async () => {
    const gqlLoaderSettings: GqlLoaderSettings = {
      endpointType: 'static',
    };
    const formSettingsData: IFormSettings = {
      ...DEFAULT_FORM_SETTINGS,
      dataLoaderType: 'gql',
      dataLoadersSettings: { gql: gqlLoaderSettings },
    };
    try {
      await validateConfigurableComponentSettings(formSettingsMarkup, formSettingsData, validationContext);
      expect.fail('Expected validation error but none was thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(AsyncValidationError);
      if (error instanceof AsyncValidationError) {
        const staticEndpointErrors = error.fields['dataLoadersSettings.gql.staticEndpoint'];
        if (isDefined(staticEndpointErrors)) {
          const isRequired = staticEndpointErrors.some((ve) => isRequiredValidation(ve));
          expect(isRequired).toBe(true);
          return;
        } else {
          const urlErrors = error.fields['dataLoadersSettings.gql.staticEndpoint.url'];
          if (isDefined(urlErrors)) {
            const isRequired = urlErrors.some((ve) => isRequiredValidation(ve));
            expect(isRequired).toBe(true);
            return;
          }
        }
        expect.fail('Expected validation error on "dataLoadersSettings.gql.staticEndpoint.url" or parent');
      } else
        expect.fail('Expected AsyncValidationError');
    }
  });
  it('should validate field in visible container: positive', async () => {
    const gqlLoaderSettings: GqlLoaderSettings = {
      endpointType: 'static',
      staticEndpoint: { httpVerb: 'GET', url: 'https://test.com' },
    };
    const formSettingsData: IFormSettings = {
      ...DEFAULT_FORM_SETTINGS,
      dataLoaderType: 'gql',
      dataLoadersSettings: { gql: gqlLoaderSettings },
    };
    try {
      await validateConfigurableComponentSettings(formSettingsMarkup, formSettingsData, validationContext);
    } catch (error) {
      expect(error).toBeInstanceOf(AsyncValidationError);
      if (error instanceof AsyncValidationError) {
        const urlErrors = error.fields['dataLoadersSettings.gql.staticEndpoint.url'];
        if (isDefined(urlErrors)) {
          const isRequired = urlErrors.some((ve) => isRequiredValidation(ve));
          expect(isRequired).toBe(false);
        }
      }

      return;
    }
  });
});
