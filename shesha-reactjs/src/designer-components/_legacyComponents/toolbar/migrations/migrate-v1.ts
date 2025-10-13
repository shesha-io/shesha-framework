import { ButtonType } from 'antd/lib/button';
import { FormIdentifier } from '@/providers/form/models';
import { getClosestTableId } from '@/providers/form/utils';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IConfigurableFormComponent, SettingsMigrationContext } from '@/interfaces';
import { IKeyValue } from '@/interfaces/keyValue';
import { IToolbarProps, ToolbarItemProps } from './models';

import { SizeType } from 'antd/lib/config-provider/SizeContext';

interface IShowModalActionArguments {
  modalTitle: string;
  formId: FormIdentifier;
  showModalFooter: boolean;
  additionalProperties?: IKeyValue[];
  modalWidth?: number;
  /**
   * What http verb to use when submitting the form
   */
  submitHttpVerb?: 'POST' | 'PUT';
}

const makeAction = (props: Pick<IConfigurableActionConfiguration, 'actionName' | 'actionOwner' | 'actionArguments' | 'onSuccess'>): IConfigurableActionConfiguration => {
  return {
    _type: undefined,
    actionName: props.actionName,
    actionOwner: props.actionOwner,
    actionArguments: props.actionArguments,
    handleFail: false,
    handleSuccess: Boolean(props.onSuccess),
    onSuccess: props.onSuccess,
  };
};

const getActionConfiguration = (buttonProps: IToolbarButtonV0, context: SettingsMigrationContext): IConfigurableActionConfiguration => {
  if (buttonProps['actionConfiguration'])
    return buttonProps['actionConfiguration'] as IConfigurableActionConfiguration;

  switch (buttonProps.buttonAction) {
    case "cancelFormEdit": {
      return makeAction({
        actionOwner: 'Form',
        actionName: 'Cancel Edit',
      });
    }
    case "reset": {
      return makeAction({
        actionOwner: 'Form',
        actionName: 'Reset',
      });
    }
    case "submit": {
      return makeAction({
        actionOwner: 'Form',
        actionName: 'Submit',
      });
    }
    case "startFormEdit": {
      return makeAction({
        actionOwner: 'Form',
        actionName: 'Start Edit',
      });
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
      const actionConfig: IConfigurableActionConfiguration = makeAction({
        actionOwner: 'Common',
        actionName: 'Show Dialog',
      });

      const propsWithModal = buttonProps as IToolbarButtonTableDialogPropsV0;

      const modalArguments: IShowModalActionArguments = {
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
        actionConfig.onSuccess = makeAction({
          actionOwner: getClosestTableId(context),
          actionName: 'Refresh table',
        });
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
        return makeAction({
          actionOwner: getClosestTableId(context),
          actionName: 'Export to Excel',
        });
      }
      if (buttonProps.formAction === 'TOGGLE_COLUMNS_SELECTOR' || buttonProps.customAction === 'toggleColumnsSelector') {
        return makeAction({
          actionOwner: getClosestTableId(context),
          actionName: 'Toggle Columns Selector',
        });
      }
      if (buttonProps.formAction === 'TOGGLE_ADVANCED_FILTER' || buttonProps.customAction === 'toggleAdvancedFilter') {
        return makeAction({
          actionOwner: getClosestTableId(context),
          actionName: 'Toggle Advanced Filter',
        });
      }
      if (buttonProps.formAction === 'REFRESH_TABLE' || buttonProps.customAction === 'refresh') {
        return makeAction({
          actionOwner: getClosestTableId(context),
          actionName: 'Refresh table',
        });
      }
    }
  }
  return null;
};


//#region

export interface IToolbarPropsV0 extends IConfigurableFormComponent {
  items: ToolbarItemPropsV0[];
}

type ToolbarItemTypeV0 = 'item' | 'group';

type ButtonGroupTypeV0 = 'inline' | 'dropdown';

type ToolbarItemPropsV0 = IToolbarButtonV0 | IButtonGroupV0;

type ToolbarItemSubTypeV0 = 'button' | 'separator' | 'line';
type ButtonActionTypeV0 =
  | 'navigate' |
  'dialogue' |
  'executeScript' |
  'executeFormAction' | // This is the old one which is now only being used for backward compatibility. The new one is 'customAction' to be consistent with the ButtonGroup
  'customAction' | // This is the new one. Old one is 'executeFormAction'
  'submit' |
  'reset' |
  'startFormEdit' |
  'cancelFormEdit';

interface IToolbarItemBaseV0 {
  id: string;
  name: string;
  label: string;
  tooltip?: string;
  sortOrder: number;
  danger?: boolean;
  itemType: ToolbarItemTypeV0;
  groupType?: ButtonGroupTypeV0;
  icon?: string;
  buttonType?: ButtonType;
  customVisibility?: string;
  customEnabled?: string;
  permissions?: string[];
}

interface IToolbarButtonV0 extends IToolbarItemBaseV0 {
  itemSubType: ToolbarItemSubTypeV0;
  buttonAction?: ButtonActionTypeV0;
  refreshTableOnSuccess?: boolean;
  targetUrl?: string;

  /**
   * @deprecated - use customAction. It is named that way to be consistent with the
   */
  formAction?: string;
  customAction?: string;
  customActionParameters?: string;
  actionScript?: string;
  size?: SizeType;
  modalFormId?: string;
  modalTitle?: string;
  modalWidth?: number;
  modalActionOnSuccess?: 'keepOpen' | 'navigateToUrl' | 'close' | undefined;
  showConfirmDialogBeforeSubmit?: boolean;
  modalConfirmDialogMessage?: string;

  onSuccessScript?: string;

  onErrorScript?: string;
}

interface IButtonGroupV0 extends IToolbarItemBaseV0 {
  childItems?: ToolbarItemPropsV0[];
}

interface IToolbarButtonTableDialogPropsV0 extends Omit<IModalPropsV0, 'formId' | 'isVisible'>, IToolbarButtonV0 {
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

export const migrateV0toV1 = (model: IToolbarPropsV0, context: SettingsMigrationContext): IToolbarProps => {
  const items = (model.items ?? []).map<ToolbarItemProps>((item) => {
    if (item.itemType === "item") {
      if (item['actionConfiguration'])
        return item;
      const buttonProps = item as IToolbarButtonV0;
      if (buttonProps.itemSubType === 'button') {
        return {
          ...item,
          actionConfiguration: getActionConfiguration(buttonProps, context),
        };
      }
    }

    return item;
  });

  return { ...model, items: items };
};
