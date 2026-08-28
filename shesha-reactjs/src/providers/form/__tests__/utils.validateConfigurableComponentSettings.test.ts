import { getFormSettingsFormMarkup } from '@/components/formDesigner/formSettings';
import { getComponentDefinitions } from '../defaults/toolboxComponents';
import { DEFAULT_FORM_SETTINGS, IFormSettings } from '../models';
import { validateConfigurableComponentSettings } from '../utils';
import { makeFormBuliderFactory } from '@/form-factory/implementation';
import { isDefined, isNullOrWhiteSpace } from '@/utils';
import { AsyncValidationError } from '@rc-component/async-validator/lib/util';
import { GqlLoaderSettings } from '../loaders/interfaces';
import { ValidateError } from '@rc-component/async-validator';

const isRequiredValidation = (error: ValidateError): boolean => {
  return !isNullOrWhiteSpace(error.message) && error.message.endsWith('is required');
};

describe('validateConfigurableComponentSettings()', () => {
  const componentDefinitions = getComponentDefinitions();
  const formSettingsMarkup = getFormSettingsFormMarkup({ fbf: makeFormBuliderFactory(componentDefinitions), removeStyleRouter: true });

  it('should validate default settings', () => {
    expect(() => validateConfigurableComponentSettings(formSettingsMarkup, DEFAULT_FORM_SETTINGS)).not.toThrow();
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
      await validateConfigurableComponentSettings(formSettingsMarkup, formSettingsData);
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
      await validateConfigurableComponentSettings(formSettingsMarkup, formSettingsData);
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
      await validateConfigurableComponentSettings(formSettingsMarkup, formSettingsData);
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
