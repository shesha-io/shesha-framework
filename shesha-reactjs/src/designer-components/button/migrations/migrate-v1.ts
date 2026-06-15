import { getClosestTableId } from '@/providers/form/utils';
import { getDispatchEventReplacement } from '@/components/formDesigner/components/_common-migrations/migrate-events';
import { IButtonComponentProps } from '../interfaces';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IKeyValue } from '@/interfaces/keyValue';
import { ReactNode } from 'react';
import { SettingsMigrationContext } from '@/interfaces';
import { IShowModalActionArgumentsV0 } from '@/providers/dynamicModal/migrations/ver0';
import { IHasVersion } from '@/utils/fluentMigrator/migrator';
import { getStringPropertyOrUndefined } from '@/utils/object';

const makeAction = (props: Pick<IConfigurableActionConfiguration, 'actionName' | 'actionOwner' | 'actionArguments'>): IConfigurableActionConfiguration => {
  return {
    _type: undefined,
    actionName: props.actionName,
    actionOwner: props.actionOwner,
    actionArguments: props.actionArguments,
    handleFail: false,
    handleSuccess: false,
  };
};

const getActionConfiguration = (buttonProps: IButtonGroupButtonV0, context: SettingsMigrationContext): IConfigurableActionConfiguration | undefined => {
  if ("actionConfiguration" in buttonProps && typeof buttonProps.actionConfiguration === "object")
    return buttonProps['actionConfiguration'] as IConfigurableActionConfiguration;

  switch (buttonProps.buttonAction) {
    case "cancelFormEdit": {
      return makeAction({ actionOwner: 'Form', actionName: 'Cancel Edit' });
    }
    case "reset": {
      return makeAction({ actionOwner: 'Form', actionName: 'Reset' });
    }
    case "submit": {
      return makeAction({ actionOwner: 'Form', actionName: 'Submit' });
    }
    case "startFormEdit": {
      return makeAction({ actionOwner: 'Form', actionName: 'Start Edit' });
    }
    case "navigate": {
      return makeAction({
        actionOwner: 'Common',
        actionName: 'Navigate',
        actionArguments: {
          target: buttonProps.targetUrl,
        },
      });
    }
    case "dialogue": {
      const actionConfig = makeAction({ actionOwner: 'Common', actionName: 'Show Dialog' });

      const propsWithModal = buttonProps as IToolbarButtonTableDialogPropsV0;

      const modalArguments: IShowModalActionArgumentsV0 = {
        modalTitle: buttonProps.modalTitle ?? "",
        formId: buttonProps.modalFormId,

        showModalFooter: propsWithModal.showModalFooter,
        submitHttpVerb: propsWithModal.submitHttpVerb,
        additionalProperties: propsWithModal.additionalProperties,
        modalWidth: propsWithModal.width,
      };
      actionConfig.actionArguments = modalArguments;

      if (propsWithModal.onSuccessRedirectUrl) {
        actionConfig.handleSuccess = true;
        actionConfig.onSuccess = makeAction({
          actionOwner: 'Common',
          actionName: 'Navigate',
          actionArguments: {
            target: propsWithModal.onSuccessRedirectUrl,
          },
        });
      }
      if (propsWithModal.refreshTableOnSuccess) {
        actionConfig.handleSuccess = true;
        actionConfig.onSuccess = makeAction({ actionOwner: getClosestTableId(context) ?? "", actionName: 'Refresh table' });
      }
      return actionConfig;
    }
    case "executeScript": {
      return makeAction({
        actionOwner: 'Common',
        actionName: 'Execute Script',
        actionArguments: {
          expression: buttonProps.actionScript ?? '',
        },
      });
    }
    case "executeFormAction": {
      if (buttonProps.formAction === 'exportToExcel' || buttonProps.formAction === 'EXPORT_TO_EXCEL') {
        return makeAction({ actionOwner: getClosestTableId(context) ?? "", actionName: 'Export to Excel' });
      }
      if (buttonProps.formAction === 'TOGGLE_COLUMNS_SELECTOR' || buttonProps.customAction === 'toggleColumnsSelector') {
        return makeAction({ actionOwner: getClosestTableId(context) ?? "", actionName: 'Toggle Columns Selector' });
      }
      if (buttonProps.formAction === 'TOGGLE_ADVANCED_FILTER' || buttonProps.customAction === 'toggleAdvancedFilter') {
        return makeAction({ actionOwner: getClosestTableId(context) ?? "", actionName: 'Toggle Advanced Filter' });
      }
      if (buttonProps.formAction === 'REFRESH_TABLE' || buttonProps.customAction === 'refresh') {
        return makeAction({ actionOwner: getClosestTableId(context) ?? "", actionName: 'Refresh table' });
      }
      return undefined;
    }
    case "dispatchAnEvent": {
      return getDispatchEventReplacement(buttonProps);
    }
  }
  return undefined;
};

//#region old types

type ButtonActionTypeV0 =
  | 'navigate' |
  'dialogue' |
  'executeScript' |
  'executeFormAction' | // This is the old one which is now only being used for backward compatibility. The new one is 'customAction' to be consistent with the ButtonGroup
  'customAction' | // This is the new one. Old one is 'executeFormAction'
  'submit' |
  'reset' |
  'startFormEdit' |
  'cancelFormEdit' |
  'dispatchAnEvent';
type ToolbarItemSubTypeV0 = 'button' | 'separator' | 'line';

type SizeTypeV0 = 'small' | 'middle' | 'large';

type ButtonGroupItemTypeV0 = 'item' | 'group';

type ButtonGroupTypeV0 = 'inline' | 'dropdown';

type ButtonTypeV0 = "default" | "primary" | "ghost" | "dashed" | "link" | "text";

export interface IButtonGroupItemBaseV0 extends IHasVersion {
  id: string;
  name: string;
  label?: string | ReactNode;
  tooltip?: string | undefined;
  sortOrder: number;
  danger?: boolean | undefined;
  hidden?: boolean | undefined;
  disabled?: boolean | undefined;
  isDynamic?: boolean | undefined;
  itemType: ButtonGroupItemTypeV0;
  groupType?: ButtonGroupTypeV0 | undefined;
  icon?: string | undefined;
  buttonType?: ButtonTypeV0 | undefined;
  customVisibility?: string | undefined;
  customEnabled?: string | undefined;
  permissions?: string[] | undefined;
  style?: string | undefined;
  size?: SizeTypeV0 | undefined;
}

interface IButtonGroupButtonV0 extends IButtonGroupItemBaseV0 {
  itemSubType: ToolbarItemSubTypeV0;
  buttonAction?: ButtonActionTypeV0 | undefined;
  refreshTableOnSuccess?: boolean | undefined;
  targetUrl?: string | undefined;

  /**
   * Predefined form action that gets executed via events
   */
  formAction?: string | undefined;

  /**
   * Custom form events that can be passed with parameters
   */
  customFormAction?: string | undefined;
  uniqueStateId?: string | undefined;
  customAction?: string | undefined;
  customActionParameters?: string | undefined;
  actionScript?: string | undefined;
  size?: SizeTypeV0 | undefined;
  modalFormId?: string | undefined;
  modalTitle?: string | undefined;
  modalFormMode?: 'designer' | 'edit' | 'readonly' | undefined;
  skipFetchData?: boolean | undefined;
  submitLocally?: boolean | undefined;

  // This is the event that will be triggered once the form has been submitted. The event will be passed this data
  onSubmitEvent?: string | undefined;

  /** An event name to dispatch on the click of a button */
  eventName?: string | undefined;

  /** The string representing a custom event name to dispatch when the button has been dispatched
   * in case we forgot to include it in the `eventName` dropdown
   */
  customEventNameToDispatch?: string | undefined;

  modalWidth?: number | undefined;
  modalActionOnSuccess?: 'keepOpen' | 'navigateToUrl' | 'close' | undefined | undefined;
  showConfirmDialogBeforeSubmit?: boolean | undefined;
  modalConfirmDialogMessage?: string | undefined;
  onSuccessScript?: string | undefined;
  onErrorScript?: string | undefined;
}

interface IToolbarButtonTableDialogPropsV0 extends Omit<IModalPropsV0, 'formId' | 'isVisible'>, IButtonGroupButtonV0 {
  modalProps?: IModalPropsV0 | undefined;
  additionalProperties?: IKeyValue[] | undefined;
}

interface IModalPropsV0 {
  /**
   * Id of the form to be rendered on the markup
   */
  formId: string;

  /**
   * Url to be used to fetch form data
   */
  fetchUrl?: string | undefined;

  /**
   * Whether the modal footer should be shown. The modal footer shows default buttons Submit and Cancel.
   *
   * The url to use will be found in the form settings and the correct verb to use is specified by submitHttpVerb
   */
  showModalFooter?: boolean | undefined;

  /**
   * What http verb to use when submitting the form. Used in conjunction with `showModalFooter`
   */
  submitHttpVerb?: 'POST' | 'PUT' | undefined;

  /**
   * Title to display on the modal
   */
  title?: string | undefined;
  // path | id | markup

  /**
   * Id of the modal to be shown
   */
  id: string;

  /**
   * Whether the modal is visible
   */
  isVisible: boolean;

  /**
   * A callback to execute when the form has been submitted
   */
  onSubmitted?: (values?: unknown) => void;

  /**
   * If passed, the user will be redirected to this url on success
   */
  onSuccessRedirectUrl?: string | undefined;

  /**
   * If specified, the form data will not be fetched, even if the GET Url has query parameters that can be used to fetch the data.
   * This is useful in cases whereby one form is used both for create and edit mode
   */
  skipFetchData?: boolean | undefined;

  submitLocally?: boolean | undefined;

  width?: number | undefined;

  modalConfirmDialogMessage?: string | undefined;

  onCancel?: () => void;
}
//#endregion

export const migrateV0toV1 = (props: IButtonGroupItemBaseV0, context: SettingsMigrationContext): IButtonComponentProps => {
  const actionConfiguration = getActionConfiguration(props as IButtonGroupButtonV0, context);

  const isGhost = props.buttonType === 'ghost';
  const result: IButtonComponentProps = {
    ...props,
    actionConfiguration: actionConfiguration,
    type: getStringPropertyOrUndefined(props, "type") ?? "button",
    propertyName: props['name'],
    buttonType: isGhost ? 'default' : props.buttonType,
    ghost: isGhost,
  };
  return result;
};
