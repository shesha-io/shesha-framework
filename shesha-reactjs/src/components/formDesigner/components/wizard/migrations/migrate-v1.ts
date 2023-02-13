import { IConfigurableActionConfiguration } from '../../../../../interfaces/configurableAction';
import { IConfigurableFormComponent, SettingsMigrationContext } from '../../../../../interfaces/formDesigner';
import { SheshaActionOwners } from '../../../../../providers/configurableActionsDispatcher/models';
import { IConfigurableItemBase } from '../../../../../providers/itemListConfigurator/contexts';
import { getDispatchEventReplacement } from '../../_common-migrations/migrate-events';
import { upgradeActionConfig } from '../../_common-migrations/upgrade-action-owners';
import { IWizardComponentProps, IWizardStepProps } from '../models';

export const migrateV0toV1 = (
  props: IWizardComponentPropsV0,
  context: SettingsMigrationContext
): IWizardComponentProps => {
  const { tabs, ...restProps } = props;

  const steps = tabs?.map<IWizardStepProps>(tab => {
    const {
      cancelButtonAction,
      nextButtonAction,
      backButtonAction,
      doneButtonAction,

      cancelButtonActionScript,
      nextButtonActionScript,
      backButtonActionScript,
      doneButtonActionScript,

      cancelEventName,
      nextEventName,
      backEventName,
      doneEventName,

      cancelCustomEventNameToDispatch,
      nextCustomEventNameToDispatch,
      backCustomEventNameToDispatch,
      doneCustomEventNameToDispatch,

      cancelUniqueStateId,
      nextUniqueStateId,
      backUniqueStateId,
      doneUniqueStateId,
      ...restTabProps
    } = tab;

    const step: IWizardStepProps = {
      ...restTabProps,
      cancelButtonActionConfiguration: getActionConfig(
        cancelButtonAction,
        cancelButtonActionScript,
        cancelEventName,
        cancelCustomEventNameToDispatch,
        cancelUniqueStateId,
        context
      ),
      nextButtonActionConfiguration: getActionConfig(
        nextButtonAction,
        nextButtonActionScript,
        nextEventName,
        nextCustomEventNameToDispatch,
        nextUniqueStateId,
        context
      ),
      backButtonActionConfiguration: getActionConfig(
        backButtonAction,
        backButtonActionScript,
        backEventName,
        backCustomEventNameToDispatch,
        backUniqueStateId,
        context
      ),
      doneButtonActionConfiguration: getActionConfig(
        doneButtonAction,
        doneButtonActionScript,
        doneEventName,
        doneCustomEventNameToDispatch,
        doneUniqueStateId,
        context
      ),
    };
    return step;
  });

  // TODO: Fix tslint issue caused by incompatible size property
  // @ts-ignore
  return { ...restProps, steps: steps ?? [] };
};

const getActionConfig = (
  action: ButtonActionTypeV0,
  actionScript: string,
  eventName: string,
  customEventName: string,
  uniqueStateId: string,
  context: SettingsMigrationContext
): IConfigurableActionConfiguration => {
  if (!action) return undefined;

  switch (action) {
    case 'executeScript': {
      return {
        actionOwner: SheshaActionOwners.Common,
        actionName: 'Execute Script',
        actionArguments: {
          expression: actionScript ?? '',
        },
        handleFail: false,
        handleSuccess: false,
      };
    }
    case 'dispatchAnEvent': {
      const config = getDispatchEventReplacement({
        eventName: eventName,
        uniqueStateId: uniqueStateId,
        customEventNameToDispatch: customEventName,
      });
      return upgradeActionConfig(config, context);
    }
  }
};

//#region V0 model

export type ButtonActionTypeV0 = 'executeScript' | 'dispatchAnEvent';

export interface IWizardTabPropsV0 extends IConfigurableItemBase {
  id: string;
  icon?: string;
  key: string;
  title: string;
  subTitle: string;
  description: string;
  allowCancel?: boolean;

  cancelButtonText?: string;
  nextButtonText?: string;
  backButtonText?: string;
  doneButtonText?: string;

  cancelButtonAction?: ButtonActionTypeV0;
  nextButtonAction?: ButtonActionTypeV0;
  backButtonAction?: ButtonActionTypeV0;
  doneButtonAction?: ButtonActionTypeV0;

  cancelButtonActionScript?: string;
  backButtonActionScript?: string;
  nextButtonActionScript?: string;
  doneButtonActionScript?: string;

  nextEventName?: string;
  backEventName?: string;
  doneEventName?: string;
  cancelEventName?: string;

  cancelCustomEventNameToDispatch?: string;
  doneCustomEventNameToDispatch?: string;
  backCustomEventNameToDispatch?: string;
  nextCustomEventNameToDispatch?: string;

  nextUniqueStateId?: string;
  backUniqueStateId?: string;
  doneUniqueStateId?: string;
  cancelUniqueStateId?: string;

  customVisibility?: string;
  customEnabled?: string;
  permissions?: string[];
  components?: IConfigurableFormComponent[];
  childItems?: IWizardTabPropsV0[];
}

export interface IWizardComponentPropsV0 extends IConfigurableFormComponent {
  tabs: IWizardTabPropsV0[];
  wizardType?: 'default' | 'navigation';
  visibility?: 'Yes' | 'No' | 'Removed';
  uniqueStateId?: string;
  permissions?: string[];
  hidden?: boolean;
  customVisibility?: string;
  defaultActiveStep?: string;
}

//#endregion
