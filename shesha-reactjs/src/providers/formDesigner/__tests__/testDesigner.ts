import { makeFormBuliderFactory } from '@/form-factory/implementation';
import { getComponentDefinitions, getToolboxComponents } from '@/providers/form/defaults/toolboxComponents';
import { createConfigurationLoaderMock, createHttpClientMock } from '@/providers/form/__tests__/mocks';
import { DEFAULT_FORM_SETTINGS } from '@/providers/form/models';
import { IApplicationContext } from '@/providers/form/utils';
import { IFormPersisterContext } from '@/providers/formPersisterProvider/contexts';
import { IConfigurableTheme } from '@/providers/theme';
import { FormDesignerInstance } from '../instance';
import { buildTestMarkup, TestComponent } from './testMarkup';

/**
 * A real FormDesignerInstance over the given components.
 * Its constructor starts form validation, so test files using it must stub the validator first
 * (vi.mock('@/providers/formDesigner/formValidator', ...), see instance.structure.test.ts).
 */
export const createTestDesigner = (components: TestComponent[]): FormDesignerInstance => new FormDesignerInstance({
  httpClient: createHttpClientMock(),
  readOnly: false,
  toolboxComponentGroups: getToolboxComponents(false, { formId: '', formProps: null }),
  settingsComponents: [],
  formFlatMarkup: buildTestMarkup(components),
  formSettings: DEFAULT_FORM_SETTINGS,
  formPersister: {} as IFormPersisterContext,
  formBuilderFactory: makeFormBuliderFactory(getComponentDefinitions()),
  theme: {} as IConfigurableTheme,
  activeDevice: undefined,
  getConfigurableActionOrNull: () => null,
  appContext: {} as IApplicationContext,
  configurationLoader: createConfigurationLoaderMock(),
});
