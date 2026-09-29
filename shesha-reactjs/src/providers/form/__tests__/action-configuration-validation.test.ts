import { getComponentDefinitions } from '../defaults/toolboxComponents';
import { ActionParametersDictionary } from '../models';
import { IApplicationContext } from '../utils';
import { makeFormBuliderFactory } from '@/form-factory/implementation';
import { isDefined } from '@/utils';
import { toolbarComponentsMapToComponents } from '../hooks';
import { IActionDescriptorBase, IConfigurableActionConfiguration, IConfigurableActionDescriptor } from '@/interfaces/configurableAction';
import { IGetConfigurableActionPayload } from '@/providers/configurableActionsDispatcher/contexts';
import { FormValidator } from '@/providers/formDesigner/formValidator';
import { validateActionConfiguration } from '@/providers/configurableActionsDispatcher/utils';
import { NavigateAction } from '@/providers/shaRouting/actions/navigate';
import { ConfigurableActionGetter, SheshaActionOwners } from '@/providers/configurableActionsDispatcher/models';
import { ExecuteScript } from '@/providers/sheshaApplication/configurable-actions/execute-script';
import { ShowDialog } from '@/providers/dynamicModal/configurable-actions/show-dialog';
import { ShowConfirmationDialog } from '@/providers/dynamicModal/configurable-actions/show-confirmation-dialog';
import { CloseDialog } from '@/providers/dynamicModal/configurable-actions/close-dialog';

const standardActions: Record<string, IActionDescriptorBase[]> = {
  [SheshaActionOwners.Common]: [NavigateAction, ExecuteScript, ShowDialog, CloseDialog, ShowConfirmationDialog],
};
const getStandardActions: ConfigurableActionGetter = <TArguments extends ActionParametersDictionary = ActionParametersDictionary>(payload: IGetConfigurableActionPayload): IConfigurableActionDescriptor<TArguments> | null => {
  const actions = standardActions[payload.owner];
  const result = isDefined(actions)
    ? actions.find((a) => a.name === payload.name)
    : null;
  return result as IConfigurableActionDescriptor<TArguments> | null;
};

describe('validateActionConfiguration()', () => {
  const componentDefinitions = getComponentDefinitions();
  const toolboxComponents = toolbarComponentsMapToComponents(componentDefinitions);

  const appContext: IApplicationContext = {} as IApplicationContext;

  const formValidator = new FormValidator({
    toolboxComponents: toolboxComponents,
    settingsComponentGetter: () => undefined,
    formBuilderFactory: makeFormBuliderFactory(componentDefinitions),
    getConfigurableActionOrNull: getStandardActions,
    appContext: appContext,
  });

  it('should validate nested actions', async () => {
    const actionConfig: IConfigurableActionConfiguration = {
      actionName: "Navigate",
      actionOwner: "shesha.common",
      _type: "action-config",
      handleSuccess: true,
      onSuccess: {
        actionName: "Navigate",
        actionOwner: "shesha.common",
        actionArguments: {
          version: 0,
          navigationType: "url",
        },
        _type: "action-config",
        handleSuccess: false,
        handleFail: false,
      },
      handleFail: false,
    };
    try {
      await validateActionConfiguration(actionConfig, true, {
        validator: formValidator,
        appContext: appContext,
        componentId: '',
        path: [],
        contextConfigurableActionGetter: () => null,
      });
      expect.fail('Expected validation error but none was thrown');
    } catch (error) {
      expect(Array.isArray(error)).toBe(true);

      // note: response share will be changed to indicate nesting
      // expectation will require update
      expect.arrayContaining([
        {
          errors: [
            {
              message: "This field is required",
              field: "formId",
              fieldLabel: "Form",
            },
          ],
        },
        {
          errors: [
            {
              message: "This field is required",
              field: "url",
              fieldLabel: "Target URL",
            },
          ],
        },
      ]);

      return;
    }
  });
});
