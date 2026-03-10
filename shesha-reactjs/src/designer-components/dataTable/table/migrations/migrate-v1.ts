import { getClosestTableId } from '@/providers/form/utils';
import { IConfigurableActionColumnsProps, IConfigurableColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IModalProps } from '@/providers/dynamicModal/models';
import { ITableComponentProps } from '../models';
import { SettingsMigrationContext } from '@/interfaces';
import { IShowModalActionArgumentsV0 } from '@/providers/dynamicModal/migrations/ver0';

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

const getNavigateActionConfig = (oldColumn: IConfigurableActionColumnsPropsV0): IConfigurableActionConfiguration => {
  return makeAction({
    actionOwner: 'Common',
    actionName: 'Navigate',
    actionArguments: {
      target: oldColumn.targetUrl,
    },
  });
};

const wrapInConfirmationIfRequired = (actionConfig: IConfigurableActionConfiguration, oldColumn: IConfigurableActionColumnsPropsV0): IConfigurableActionConfiguration => {
  if (oldColumn.showConfirmDialogBeforeSubmit) {
    return makeAction({
      actionOwner: 'Common',
      actionName: 'Show Confirmation Dialog',
      actionArguments: {
        title: 'Confirmation',
        content: oldColumn.modalConfirmDialogMessage,
        okText: '',
        cancelText: '',
        danger: false,
      },
      onSuccess: actionConfig,
    });
  } else
    return actionConfig;
};

const getExecuteScriptActionConfig = (oldColumn: IConfigurableActionColumnsPropsV0): IConfigurableActionConfiguration => {
  return wrapInConfirmationIfRequired(makeAction({
    actionOwner: 'Common',
    actionName: 'Execute Script',
    actionArguments: {
      expression: oldColumn.actionScript ?? '',
    },
  }), oldColumn);
};

const getDeleteRowActionConfig = (oldColumn: IConfigurableActionColumnsPropsV0, context: SettingsMigrationContext): IConfigurableActionConfiguration => {
  const actionConfiguration: IConfigurableActionConfiguration = makeAction({
    actionOwner: 'Common',
    actionName: 'Show Confirmation Dialog',
    actionArguments: {
      title: 'Delete item?',
      content: oldColumn.modalConfirmDialogMessage ?? 'Are you sure you want to delete this item?',
      okText: 'Yes',
      cancelText: 'No',
      danger: true,
    },
    onSuccess: makeAction({
      actionOwner: 'table',
      actionName: 'Delete row',
      onSuccess: makeAction({
        actionOwner: getClosestTableId(context),
        actionName: 'Refresh table',
      }),
    }),
  });
  return actionConfiguration;
};

const getShowDialogActionConfig = (oldColumn: IConfigurableActionColumnsPropsV0): IConfigurableActionConfiguration => {
  const actionConfiguration: IConfigurableActionConfiguration = makeAction({
    actionOwner: 'Common',
    actionName: 'Show Dialog',
  });
  const convertedProps = oldColumn as Omit<IModalProps, 'formId'> & {
    submitHttpVerb?: 'POST' | 'PUT';
    onSuccessRedirectUrl?: string;
  }; // very strange code, took it from column renderer

  const modalArguments: IShowModalActionArgumentsV0 = {
    modalTitle: oldColumn.modalTitle,
    formId: oldColumn.modalFormId,
    additionalProperties: oldColumn.additionalProperties,
    modalWidth: oldColumn.modalWidth,

    showModalFooter: convertedProps?.showModalFooter ?? false,
    submitHttpVerb: convertedProps?.submitHttpVerb,
  };
  actionConfiguration.actionArguments = modalArguments;

  if (convertedProps?.onSuccessRedirectUrl) {
    actionConfiguration.handleSuccess = true;
    actionConfiguration.onSuccess = makeAction({
      actionOwner: 'Common',
      actionName: 'Navigate',
      actionArguments: {
        target: convertedProps?.onSuccessRedirectUrl,
      },
    });
  };

  return actionConfiguration;
};


type FormMode = 'designer' | 'edit' | 'readonly';
type ButtonActionType = 'navigate' | 'dialogue' | 'executeScript' | 'executeFormAction' | 'deleteRow' | 'editRow';
interface IConfigurableActionColumnsPropsV0 {
  icon?: string;
  /**
   * type of action
   */
  action?: ButtonActionType;

  //#region Action = 'navigate'

  /**
   * target Url, applicable when action = 'navigate'
   */
  targetUrl?: string;

  //#endregion

  //#region Action = 'dialogue'

  /**
   * Title of the modal
   */
  modalTitle?: string;

  /**
   * Id of the modal form
   */
  modalFormId?: string;

  //#endregion

  //#region Action = 'executeFormAction'

  /** Form action */
  formAction?: string;

  /** Form action */
  actionScript?: string;

  /**
   * The warning message to display before deleting an item
   */
  deleteWarningMessage?: string;

  additionalProperties?: any;

  uniqueStateId?: string;

  modalFormMode?: FormMode;

  modalWidth?: any;
  //#endregion

  showConfirmDialogBeforeSubmit?: boolean;
  modalConfirmDialogMessage?: string;
}

export const migrateV0toV1 = (props: ITableComponentProps, context: SettingsMigrationContext): ITableComponentProps => {
  const { items } = props;
  const newItems = items.map((item) => {
    if (item.itemType === "item") {
      const col = item as IConfigurableColumnsProps;
      if (col.columnType === "action") {
        const actonColumn = col as IConfigurableActionColumnsProps;
        if (!actonColumn.actionConfiguration) {
          const oldColumn = actonColumn as IConfigurableActionColumnsPropsV0;
          switch (oldColumn.action) {
            case "navigate": {
              actonColumn.actionConfiguration = getNavigateActionConfig(oldColumn);
              break;
            }
            case "dialogue": {
              actonColumn.actionConfiguration = getShowDialogActionConfig(oldColumn);
              break;
            }
            case "deleteRow": {
              actonColumn.actionConfiguration = getDeleteRowActionConfig(oldColumn, context);
              break;
            }
            case "executeScript": {
              actonColumn.actionConfiguration = getExecuteScriptActionConfig(oldColumn);
              break;
            }
          }
        }
      }
    }
    return item;
  });
  return { ...props, items: newItems };
};
