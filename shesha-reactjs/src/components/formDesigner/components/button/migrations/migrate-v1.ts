import { SettingsMigrationContext } from "../../../../..";
import { IConfigurableActionConfiguration } from "../../../../../interfaces/configurableAction";
import { IKeyValue } from "../../../../../interfaces/keyValue";
import { IShowModalActionArguments } from "../../../../../providers/dynamicModal/configurable-actions/show-dialog-arguments";
import { getClosestTableId } from "../../../../../providers/form/utils";
import { getDispatchEventReplacement } from "../../_common-migrations/migrate-events";
import { IButtonProps } from "../button";

export const migrateV0toV1 = (props: IButtonGroupButtonV0, context: SettingsMigrationContext): IButtonProps => {
    const actionConfiguration = getActionConfiguration(props, context);

    const result: IButtonProps = {
        ...props,
        actionConfiguration: actionConfiguration,
        type: props['type'] ?? "button"
    };
    return result;
}

const getActionConfiguration = (buttonProps: IButtonGroupButtonV0, context: SettingsMigrationContext): IConfigurableActionConfiguration => {
    if (buttonProps['actionConfiguration'])
        return buttonProps['actionConfiguration'] as IConfigurableActionConfiguration;

    switch (buttonProps.buttonAction) {
        case "cancelFormEdit": {
            return {
                actionOwner: 'Form',
                actionName: 'Cancel Edit',
                handleFail: false,
                handleSuccess: false,
            }
        }
        case "reset": {
            return {
                actionOwner: 'Form',
                actionName: 'Reset',
                handleFail: false,
                handleSuccess: false,
            }
        }
        case "submit": {
            return {
                actionOwner: 'Form',
                actionName: 'Submit',
                handleFail: false,
                handleSuccess: false,
            }
        }
        case "startFormEdit": {
            return {
                actionOwner: 'Form',
                actionName: 'Start Edit',
                handleFail: false,
                handleSuccess: false,
            }
        }
        case "navigate": {
            return {
                actionOwner: 'Common',
                actionName: 'Navigate',
                handleFail: false,
                handleSuccess: false,
                actionArguments: {
                    target: buttonProps.targetUrl
                },
            }
        }
        case "dialogue": {
            const actionConfig: IConfigurableActionConfiguration = {
                actionOwner: 'Common',
                actionName: 'Show Dialog',
                handleFail: false,
                handleSuccess: false,
            }

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
                actionConfig.onSuccess = {
                    actionOwner: 'Common',
                    actionName: 'Navigate',
                    actionArguments: {
                        target: propsWithModal.onSuccessRedirectUrl
                    },
                    handleSuccess: false,
                    handleFail: false,
                };
            }
            if (propsWithModal.refreshTableOnSuccess) {
                actionConfig.handleSuccess = true;
                actionConfig.onSuccess = {
                    actionOwner: getClosestTableId(context),
                    actionName: 'Refresh table',
                    handleSuccess: false,
                    handleFail: false,
                };
            }
            return actionConfig;
        }
        case "executeScript": {
            return {
                actionOwner: 'Common',
                actionName: 'Execute Script',
                actionArguments: {
                    expression: buttonProps.actionScript ?? ''
                },
                handleFail: false,
                handleSuccess: false,
            };
        }
        case "executeFormAction": {
            if (buttonProps.formAction === 'exportToExcel' || buttonProps.formAction === 'EXPORT_TO_EXCEL') {
                return {
                    actionOwner: getClosestTableId(context),
                    actionName: 'Export to Excel',
                    handleFail: false,
                    handleSuccess: false,
                };
            }
            if (buttonProps.formAction === 'TOGGLE_COLUMNS_SELECTOR' || buttonProps.customAction === 'toggleColumnsSelector') {
                return {
                    actionOwner: getClosestTableId(context),
                    actionName: 'Toggle Columns Selector',
                    handleFail: false,
                    handleSuccess: false,
                };
            }
            if (buttonProps.formAction === 'TOGGLE_ADVANCED_FILTER' || buttonProps.customAction === 'toggleAdvancedFilter') {
                return {
                    actionOwner: getClosestTableId(context),
                    actionName: 'Toggle Advanced Filter',
                    handleFail: false,
                    handleSuccess: false,
                };
            }
            if (buttonProps.formAction === 'REFRESH_TABLE' || buttonProps.customAction === 'refresh') {
                return {
                    actionOwner: getClosestTableId(context),
                    actionName: 'Refresh table',
                    handleFail: false,
                    handleSuccess: false,
                };
            }
        }
        case "customAction": {

        }
        case "dispatchAnEvent": {
            return getDispatchEventReplacement(buttonProps);
        }
    }
    return null;
}

//#region old types

type ButtonActionTypeV0 =
    | 'navigate'
    | 'dialogue'
    | 'executeScript'
    | 'executeFormAction' // This is the old one which is now only being used for backward compatibility. The new one is 'customAction' to be consistent with the ButtonGroup
    | 'customAction' // This is the new one. Old one is 'executeFormAction'
    | 'submit'
    | 'reset'
    | 'startFormEdit'
    | 'cancelFormEdit'
    | 'dispatchAnEvent';
type ToolbarItemSubTypeV0 = 'button' | 'separator' | 'line';

type SizeTypeV0 = 'small' | 'middle' | 'large';

type ButtonGroupItemTypeV0 = 'item' | 'group';

type ButtonGroupTypeV0 = 'inline' | 'dropdown';

type ButtonTypeV0 = "default" | "primary" | "ghost" | "dashed" | "link" | "text";

export interface IButtonGroupItemBaseV0 {
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
    refreshTableOnSuccess?: boolean; // TODO: Remove this and make this logic more generic
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

    /**
     * If passed and the form has `getUrl` defined, you can use this function to prepare `fetchedData` for as `initialValues`
     * If you want to use only `initialValues` without combining them with `fetchedData` and then ignore `fetchedData`
     *
     * If not passed, `fetchedData` will be used as `initialValues`
     *
     * Whenever the form has a getUrl and that url has queryParams, buy default, the `dynamicModal` will fetch the form and, subsequently, the data
     * for that form
     */
    prepareInitialValues?: (fetchedData: any) => any;

    onCancel?: () => void;
}
  //#endregion