import { SettingsMigrationContext } from "../../../../../..";
import { IConfigurableActionConfiguration } from "../../../../../../interfaces/configurableAction";
import { IConfigurableActionColumnsProps, IConfigurableColumnsProps } from "../../../../../../providers/datatableColumnsConfigurator/models";
import { IShowModalActionArguments } from "../../../../../../providers/dynamicModal/configurable-actions/show-dialog-arguments";
import { IModalProps } from "../../../../../../providers/dynamicModal/models";
import { getClosestTableId } from "../../../../../../providers/form/utils";
import { ITableComponentProps } from "../models";

export const migrateV0toV1 = (props: ITableComponentProps, context: SettingsMigrationContext): ITableComponentProps => {
    const { items } = props;
    const newItems = items.map(item => {
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
                        case "editRow": {

                        }
                        case "deleteRow": {
                            actonColumn.actionConfiguration = getDeleteRowActionConfig(oldColumn, context);
                            break;
                        }
                        case "executeFormAction": {
                            
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
}

const getNavigateActionConfig = (oldColumn: IConfigurableActionColumnsPropsV0): IConfigurableActionConfiguration => {
    return {
        actionOwner: 'Common',
        actionName: 'Navigate',
        handleFail: false,
        handleSuccess: false,
        actionArguments: {
            target: oldColumn.targetUrl
        },
    };
}

const wrapInConfirmationIfRequired = (actionConfig: IConfigurableActionConfiguration, oldColumn: IConfigurableActionColumnsPropsV0): IConfigurableActionConfiguration => {
    if (oldColumn.showConfirmDialogBeforeSubmit){
        return {
            actionOwner: 'Common',
            actionName: 'Show Confirmation Dialog',
            actionArguments: {
                title: 'Confirmation',
                content: oldColumn.modalConfirmDialogMessage,
                okText: '',
                cancelText: '',
                danger: false,
            },
            handleFail: false,
            handleSuccess: true,
            onSuccess: actionConfig
        };
    } else
        return actionConfig;
}

const getExecuteScriptActionConfig = (oldColumn: IConfigurableActionColumnsPropsV0): IConfigurableActionConfiguration => {
    return wrapInConfirmationIfRequired({
        actionOwner: 'Common',
        actionName: 'Execute Script',
        actionArguments: {
            expression: oldColumn.actionScript ?? ''
        },
        handleFail: false,
        handleSuccess: false,
    }, oldColumn);
}

const getDeleteRowActionConfig = (oldColumn: IConfigurableActionColumnsPropsV0, context: SettingsMigrationContext): IConfigurableActionConfiguration => {
    const actionConfiguration: IConfigurableActionConfiguration = {
        actionOwner: 'Common',
        actionName: 'Show Confirmation Dialog',
        actionArguments: {
            title: 'Delete item?',
            content: oldColumn.modalConfirmDialogMessage ?? 'Are you sure you want to delete this item?',
            okText: 'Yes',
            cancelText: 'No',
            danger: true,
        },
        handleFail: false,
        handleSuccess: true,
        onSuccess: {
            actionOwner: 'table',
            actionName: 'Delete row',
            handleFail: false,
            handleSuccess: true,
            onSuccess: {
                actionOwner: getClosestTableId(context),
                actionName: 'Refresh table',
                handleFail: false,
                handleSuccess: false,
            }
        }
    };
    return actionConfiguration;
}

const getShowDialogActionConfig = (oldColumn: IConfigurableActionColumnsPropsV0): IConfigurableActionConfiguration => {
    const actionConfiguration: IConfigurableActionConfiguration = {
        actionOwner: 'Common',
        actionName: 'Show Dialog',
        handleFail: false,
        handleSuccess: false,
    };
    const convertedProps = oldColumn as Omit<IModalProps, 'formId'>; // very strange code, took it from column renderer

    const modalArguments: IShowModalActionArguments = {
        modalTitle: oldColumn.modalTitle,
        formId: oldColumn.modalFormId,
        additionalProperties: oldColumn.additionalProperties,
        modalWidth: oldColumn.modalWidth,

        showModalFooter: convertedProps?.showModalFooter ?? false,
        skipFetchData: convertedProps?.skipFetchData,
        submitHttpVerb: convertedProps?.submitHttpVerb,
    };
    actionConfiguration.actionArguments = modalArguments;

    if (convertedProps?.onSuccessRedirectUrl){
        actionConfiguration.handleSuccess = true;
        actionConfiguration.onSuccess = {
            actionOwner: 'Common',
            actionName: 'Navigate',
            actionArguments: {
                target: convertedProps?.onSuccessRedirectUrl
            },
            handleSuccess: false,
            handleFail: false,
        };

    };
    
    return actionConfiguration;
}


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

    showConfirmDialogBeforeSubmit?: boolean,
    modalConfirmDialogMessage?: string,
} 