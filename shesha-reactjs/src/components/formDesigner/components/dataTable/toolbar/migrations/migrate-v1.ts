import { SettingsMigrationContext } from "../../../../../..";
import { IConfigurableActionConfiguration } from "../../../../../../interfaces/configurableAction";
import { IKeyValue } from "../../../../../../interfaces/keyValue";
import { FormIdentifier } from "../../../../../../providers/form/models";
import { getClosestTableId } from "../../../../../../providers/form/utils";
import { ToolbarItemProps } from "../../../../../../providers/toolbarConfigurator/models";
import { IToolbarProps } from "../models";
import { IConfigurableFormComponent } from "../../../../../../interfaces";
import { ButtonType } from 'antd/lib/button';
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

export const migrateV0toV1 = (model: IToolbarPropsV0, context: SettingsMigrationContext): IToolbarProps => {

    const items = (model.items ?? []).map<ToolbarItemProps>(item => {
        if (item.itemType === "item") {
            if (item['actionConfiguration'])
                return item;
            const buttonProps = item as IToolbarButtonV0;
            if (buttonProps.itemSubType === 'button') {

                return {
                    ...item,
                    actionConfiguration: getActionConfiguration(buttonProps, context)
                }
            }
        }

        return item;
    });

    return { ...model, items: items };
}

const getActionConfiguration = (buttonProps: IToolbarButtonV0, context: SettingsMigrationContext): IConfigurableActionConfiguration => {
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
        // case "dispatchAnEvent": {
        //     return getDispatchEventReplacement(buttonProps);
        // }
    }
    return null;
}


//#region 

export interface IToolbarPropsV0 extends IConfigurableFormComponent {
    items: ToolbarItemPropsV0[];
}

type ToolbarItemTypeV0 = 'item' | 'group';

type ButtonGroupTypeV0 = 'inline' | 'dropdown';

type ToolbarItemPropsV0 = IToolbarButtonV0 | IButtonGroupV0;

type ToolbarItemSubTypeV0 = 'button' | 'separator' | 'line';
type ButtonActionTypeV0 =
    | 'navigate'
    | 'dialogue'
    | 'executeScript'
    | 'executeFormAction' // This is the old one which is now only being used for backward compatibility. The new one is 'customAction' to be consistent with the ButtonGroup
    | 'customAction' // This is the new one. Old one is 'executeFormAction'
    | 'submit'
    | 'reset'
    | 'startFormEdit'
    | 'cancelFormEdit';

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