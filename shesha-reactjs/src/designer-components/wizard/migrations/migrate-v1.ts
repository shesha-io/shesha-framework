import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IConfigurableFormComponent, SettingsMigrationContext } from '@/interfaces/formDesigner';
import { SheshaActionOwners } from '@/providers/configurableActionsDispatcher/models';
import { getDispatchEventReplacement } from '@/components/formDesigner/components/_common-migrations/migrate-events';
import { upgradeActionConfig } from '@/components/formDesigner/components/_common-migrations/upgrade-action-owners';
import { IWizardSequence, IWizardStepProps } from '../models';
import { isDefined } from '@/utils/nullables';

type StepStatus = 'wait' | 'process' | 'finish' | 'error';

const getActionConfig = (
  action: ButtonActionTypeV0 | undefined,
  actionScript: string | undefined,
  eventName: string | undefined,
  customEventName: string | undefined,
  uniqueStateId: string | undefined,
  context: SettingsMigrationContext,
): IConfigurableActionConfiguration | undefined => {
  if (!action) return undefined;

  switch (action) {
    case 'executeScript': {
      return {
        _type: undefined,
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

export interface IWizardTabPropsV0 {
  id: string;
  label?: string | undefined;
  name?: string | undefined;
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
  name: string;
  tabs: IWizardTabPropsV0[];
  wizardType?: 'default' | 'navigation' | undefined;
  visibility?: 'Yes' | 'No' | 'Removed' | undefined;
  uniqueStateId?: string | undefined;
  permissions?: string[] | undefined;
  hidden?: boolean | undefined;
  customVisibility?: string | undefined;
  defaultActiveStep?: string | undefined;
}

export interface IWizardStepPropsV1 {
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

  cancelButtonCustomEnabled?: string;
  nextButtonCustomEnabled?: string;
  backButtonCustomEnabled?: string;
  doneButtonCustomEnabled?: string;

  cancelButtonActionConfiguration?: IConfigurableActionConfiguration | undefined;
  nextButtonActionConfiguration?: IConfigurableActionConfiguration | undefined;
  backButtonActionConfiguration?: IConfigurableActionConfiguration | undefined;
  doneButtonActionConfiguration?: IConfigurableActionConfiguration | undefined;

  customVisibility?: string;
  customEnabled?: string;
  permissions?: string[];
  components?: IConfigurableFormComponent[];
  childItems?: IWizardStepProps[];
  status?: StepStatus;
}

export interface IWizardComponentPropsV1 extends Omit<IConfigurableFormComponent, 'size'> {
  status?: StepStatus | undefined;
  steps: IWizardStepPropsV1[];
  wizardType?: 'default' | 'navigation' | undefined;
  visibility?: 'Yes' | 'No' | 'Removed' | undefined;
  // uniqueStateId?: string;
  permissions?: string[] | undefined;
  hidden?: boolean | undefined;
  customVisibility?: string | undefined;
  defaultActiveStep?: string | undefined;
  defaultActiveValue?: string | undefined;
  direction?: 'vertical' | 'horizontal' | undefined;
  labelPlacement?: 'vertical' | 'horizontal' | undefined;
  size?: 'default' | 'small' | undefined;
  buttonsLayout?: 'left' | 'right' | 'spaceBetween' | undefined;
  showStepStatus?: boolean | undefined;
  sequence?: IWizardSequence | undefined;
}

//#endregion

export const migrateV0toV1 = (
  props: IWizardComponentPropsV0,
  context: SettingsMigrationContext,
): IWizardComponentPropsV1 => {
  const { tabs, ...restProps } = props;

  const steps = (isDefined(tabs) ? tabs : []).map<IWizardStepPropsV1>((tab) => {
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

    const step: IWizardStepPropsV1 = {
      ...restTabProps,
      cancelButtonActionConfiguration: getActionConfig(
        cancelButtonAction,
        cancelButtonActionScript,
        cancelEventName,
        cancelCustomEventNameToDispatch,
        cancelUniqueStateId,
        context,
      ),
      nextButtonActionConfiguration: getActionConfig(
        nextButtonAction,
        nextButtonActionScript,
        nextEventName,
        nextCustomEventNameToDispatch,
        nextUniqueStateId,
        context,
      ),
      backButtonActionConfiguration: getActionConfig(
        backButtonAction,
        backButtonActionScript,
        backEventName,
        backCustomEventNameToDispatch,
        backUniqueStateId,
        context,
      ),
      doneButtonActionConfiguration: getActionConfig(
        doneButtonAction,
        doneButtonActionScript,
        doneEventName,
        doneCustomEventNameToDispatch,
        doneUniqueStateId,
        context,
      ),
    };
    return step;
  });

  return {
    ...restProps,
    steps: steps,
    size: restProps.size === "small" ? restProps.size : undefined,
  };
};
