import { StepProps } from 'antd';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IConfigurableFormComponent, SettingsMigrationContext } from '@/interfaces/formDesigner';
import { SheshaActionOwners } from '@/providers/configurableActionsDispatcher/models';
import { getDispatchEventReplacement } from '@/components/formDesigner/components/_common-migrations/migrate-events';
import { upgradeActionConfig } from '@/components/formDesigner/components/_common-migrations/upgrade-action-owners';
import { IWizardSequence, IWizardStepProps } from '../models';

const getActionConfig = (
  action: ButtonActionTypeV0,
  actionScript: string,
  eventName: string,
  customEventName: string,
  uniqueStateId: string,
  context: SettingsMigrationContext,
): IConfigurableActionConfiguration => {
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
  wizardType?: 'default' | 'navigation';
  visibility?: 'Yes' | 'No' | 'Removed';
  uniqueStateId?: string;
  permissions?: string[];
  hidden?: boolean;
  customVisibility?: string;
  defaultActiveStep?: string;
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

  cancelButtonActionConfiguration?: IConfigurableActionConfiguration;
  nextButtonActionConfiguration?: IConfigurableActionConfiguration;
  backButtonActionConfiguration?: IConfigurableActionConfiguration;
  doneButtonActionConfiguration?: IConfigurableActionConfiguration;

  customVisibility?: string;
  customEnabled?: string;
  permissions?: string[];
  components?: IConfigurableFormComponent[];
  childItems?: IWizardStepProps[];
  status?: StepProps['status'];
}

export interface IWizardComponentPropsV1 extends Omit<IConfigurableFormComponent, 'size'>, Pick<StepProps, 'status'> {
  steps: IWizardStepPropsV1[];
  wizardType?: 'default' | 'navigation';
  visibility?: 'Yes' | 'No' | 'Removed';
  // uniqueStateId?: string;
  permissions?: string[];
  hidden?: boolean;
  customVisibility?: string;
  defaultActiveStep?: string;
  defaultActiveValue?: string;
  direction?: 'vertical' | 'horizontal';
  labelPlacement?: 'vertical' | 'horizontal';
  size?: 'default' | 'small';
  buttonsLayout?: 'left' | 'right' | 'spaceBetween';
  showStepStatus?: boolean;
  sequence?: IWizardSequence;
}

//#endregion

export const migrateV0toV1 = (
  props: IWizardComponentPropsV0,
  context: SettingsMigrationContext,
): IWizardComponentPropsV1 => {
  const { tabs, ...restProps } = props;

  const steps = tabs?.map<IWizardStepProps>((tab) => {
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

  // @ts-ignore
  return { ...restProps, steps: steps ?? [] };
};
