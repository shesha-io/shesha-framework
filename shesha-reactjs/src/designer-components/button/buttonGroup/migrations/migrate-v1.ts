import { IButtonGroupComponentProps } from "../models";
import { IConfigurableActionConfiguration } from "@/interfaces/configurableAction";
import { SettingsMigrationContext } from "@/interfaces";
import { IKeyValue } from "@/interfaces/keyValue";
import { IButtonItem } from "@/providers/buttonGroupConfigurator/models";
import { getClosestTableId } from "@/providers/form/utils";
import { getDispatchEventReplacement } from "@/components/formDesigner/components/_common-migrations/migrate-events";
import { IShowModalActionArgumentsV0 } from "@/providers/dynamicModal/migrations/ver0";

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

const getActionConfiguration = (buttonProps: IButtonGroupButtonV0, context: SettingsMigrationContext): IConfigurableActionConfiguration => {
  if (buttonProps['actionConfiguration'])
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
        modalTitle: buttonProps.modalTitle,
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
        actionConfig.onSuccess = makeAction({ actionOwner: getClosestTableId(context), actionName: 'Refresh table' });
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
        return makeAction({ actionOwner: getClosestTableId(context), actionName: 'Export to Excel' });
      }
      if (buttonProps.formAction === 'TOGGLE_COLUMNS_SELECTOR' || buttonProps.customAction === 'toggleColumnsSelector') {
        return makeAction({ actionOwner: getClosestTableId(context), actionName: 'Toggle Columns Selector' });
      }
      if (buttonProps.formAction === 'TOGGLE_ADVANCED_FILTER' || buttonProps.customAction === 'toggleAdvancedFilter') {
        return makeAction({ actionOwner: getClosestTableId(context), actionName: 'Toggle Advanced Filter' });
      }
      if (buttonProps.formAction === 'REFRESH_TABLE' || buttonProps.customAction === 'refresh') {
        return makeAction({ actionOwner: getClosestTableId(context), actionName: 'Refresh table' });
      }
    }
    case "dispatchAnEvent": {
      return getDispatchEventReplacement(buttonProps);
    }
  }
  return null;
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

interface IButtonGroupItemBaseV0 {
  id: string;
  name: string;
  label?: string;
  tooltip?: string;
  sortOrder: number;
  danger?: boolean;
  hidden?: boolean;
  disabled?: boolean;
  isDynamic?: boolean;
  itemType: ButtonGroupItemTypeV0;
  groupType?: ButtonGroupTypeV0;
  icon?: string;
  buttonType?: ButtonTypeV0;
  customVisibility?: string;
  customEnabled?: string;
  permissions?: string[];
  style?: string;
  size?: SizeTypeV0;
}

interface IButtonGroupButtonV0 extends IButtonGroupItemBaseV0 {
  itemSubType: ToolbarItemSubTypeV0;
  buttonAction?: ButtonActionTypeV0;
  refreshTableOnSuccess?: boolean;
  targetUrl?: string;

  /**
   * Predefined form action that gets executed via events
   */
  formAction?: string;

  /**
   * Custom form events that can be passed with parameters
   */
  customFormAction?: string;
  uniqueStateId?: string;
  customAction?: string;
  customActionParameters?: string;
  actionScript?: string;
  size?: SizeTypeV0;
  modalFormId?: string;
  modalTitle?: string;
  modalFormMode?: 'designer' | 'edit' | 'readonly';
  skipFetchData?: boolean;
  submitLocally?: boolean;

  // This is the event that will be triggered once the form has been submitted. The event will be passed this data
  onSubmitEvent?: string;

  /** An event name to dispatch on the click of a button */
  eventName?: string;

  /** The string representing a custom event name to dispatch when the button has been dispatched
   * in case we forgot to include it in the `eventName` dropdown
   */
  customEventNameToDispatch?: string;

  modalWidth?: number;
  modalActionOnSuccess?: 'keepOpen' | 'navigateToUrl' | 'close' | undefined;
  showConfirmDialogBeforeSubmit?: boolean;
  modalConfirmDialogMessage?: string;
  onSuccessScript?: string;
  onErrorScript?: string;
}

interface IToolbarButtonTableDialogPropsV0 extends Omit<IModalPropsV0, 'formId' | 'isVisible'>, IButtonGroupButtonV0 {
  modalProps?: IModalPropsV0;
  additionalProperties?: IKeyValue[];
}

interface IModalPropsV0 {
  /**
   * Id of the form to be rendered on the markup
   */
  formId: string;

  /**
   * Url to be used to fetch form data
   */
  fetchUrl?: string;

  /**
   * Whether the modal footer should be shown. The modal footer shows default buttons Submit and Cancel.
   *
   * The url to use will be found in the form settings and the correct verb to use is specified by submitHttpVerb
   */
  showModalFooter?: boolean;

  /**
   * What http verb to use when submitting the form. Used in conjunction with `showModalFooter`
   */
  submitHttpVerb?: 'POST' | 'PUT';

  /**
   * Title to display on the modal
   */
  title?: string;
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
  onSubmitted?: (values?: any) => void;

  /**
   * If passed, the user will be redirected to this url on success
   */
  onSuccessRedirectUrl?: string;

  /**
   * If specified, the form data will not be fetched, even if the GET Url has query parameters that can be used to fetch the data.
   * This is useful in cases whereby one form is used both for create and edit mode
   */
  skipFetchData?: boolean;

  submitLocally?: boolean;

  width?: number;

  modalConfirmDialogMessage?: string;

  onCancel?: () => void;
}
//#endregion

export const migrateV0toV1 = (props: IButtonGroupComponentProps, context: SettingsMigrationContext): IButtonGroupComponentProps => {
  const { items } = props;

  const newItems = items.map((item) => {
    if (item.itemType !== "item")
      return item;

    const button = item as IButtonGroupButtonV0;
    const newItem: IButtonItem = {
      ...button,
      buttonType: button.buttonType === 'ghost' ? 'default' : button.buttonType,
      ghost: button.buttonType === 'ghost',
    };
    newItem.actionConfiguration = getActionConfiguration(button, context);

    return newItem;
  });

  return { ...props, items: newItems };
};
