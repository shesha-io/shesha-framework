import { DesignerToolbarSettings } from "@/index";
import { nanoid } from "@/utils/uuid";
import { FormLayout } from "antd/lib/form/Form";
import { ITableComponentProps } from "./models";

const NEW_ROW_EXPOSED_VARIABLES = [
    {
        id: nanoid(),
        name: 'formData',
        description: 'Form values',
        type: 'object',
    },
    {
        id: nanoid(),
        name: 'globalState',
        description: 'The global state of the application',
        type: 'object',
    },
    {
        id: nanoid(),
        name: 'http',
        description: 'axios instance used to make http requests',
        type: 'object',
    },
    {
        id: nanoid(),
        name: 'moment',
        description: 'The moment.js object',
        type: 'object',
    }
].map(item => JSON.stringify(item));

const ROW_SAVE_EXPOSED_VARIABLES = [
    {
        id: nanoid(),
        name: 'data',
        description: 'Current row data',
        type: 'object',
    },
    {
        id: nanoid(),
        name: 'formData',
        description: 'Form values',
        type: 'object',
    },
    {
        id: nanoid(),
        name: 'globalState',
        description: 'The global state of the application',
        type: 'object',
    },
    {
        id: nanoid(),
        name: 'http',
        description: 'axios instance used to make http requests',
        type: 'object',
    },
    {
        id: nanoid(),
        name: 'moment',
        description: 'The moment.js object',
        type: 'object',
    }
].map(item => JSON.stringify(item));

const ENABLE_CRUD_EXPOSED_VARIABLES = [
    {
        id: nanoid(),
        name: 'formData',
        description: 'Form values',
        type: 'object',
    },
    {
        id: nanoid(),
        name: 'globalState',
        description: 'The global state of the application',
        type: 'object',
    },
    {
        id: nanoid(),
        name: 'moment',
        description: 'The moment.js object',
        type: 'object',
    }
].map(item => JSON.stringify(item));

export const getSettings = (data: ITableComponentProps) => {
    const searchableTabsId = nanoid();
    const commonTabId = nanoid();
    const crudTabId = nanoid();
    const layoutTabId = nanoid();
    const emptyTableTabId = nanoid();
    const securityTabId = nanoid();

    return {
        components: new DesignerToolbarSettings(data)
            .addSearchableTabs({
                id: searchableTabsId,
                propertyName: 'settingsTabs',
                parentId: 'root',
                label: 'Settings',
                hideLabel: true,
                labelAlign: 'right',
                size: 'small',
                tabs: [
                    {
                        key: 'common',
                        title: 'Common',
                        id: commonTabId,
                        components: [
                            ...new DesignerToolbarSettings()
                                .addSettingsInput({
                                    id: nanoid(),
                                    propertyName: 'componentName',
                                    label: 'Component Name',
                                    inputType: 'textField',
                                    validate: { required: true },
                                    jsSetting: false,
                                })
                                .toJson()
                        ]
                    },
                    {
                        key: 'data',
                        title: 'Data',
                        id: crudTabId,
                        components: [
                            ...new DesignerToolbarSettings()
                                .addSettingsInput({
                                    id: nanoid(),
                                    propertyName: 'items',
                                    label: data.readOnly ? 'View Columns' : 'Customize Columns',
                                    inputType: 'columnsConfig',
                                    jsSetting: true,
                                    parentId: commonTabId,
                                    readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                })
                                .addSettingsInput({
                                    id: nanoid(),
                                    propertyName: 'useMultiselect',
                                    label: 'Use Multi-select',
                                    inputType: 'switch',
                                    jsSetting: true,
                                    parentId: commonTabId,
                                    readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                })
                                .addSettingsInput({
                                    id: nanoid(),
                                    propertyName: 'freezeHeaders',
                                    label: 'Freeze Headers',
                                    inputType: 'switch',
                                    jsSetting: true,
                                    parentId: commonTabId,
                                    readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                })
                                .addSettingsInput({
                                    id: nanoid(),
                                    propertyName: 'canEditInline',
                                    label: 'Can edit inline',
                                    inputType: 'dropdown',
                                    parentId: crudTabId,
                                    readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                    dropdownOptions: [
                                        { value: 'yes', label: 'Yes' },
                                        { value: 'no', label: 'No' },
                                        { value: 'inherit', label: 'Inherit' },
                                        { value: 'js', label: 'Expression' },
                                    ],
                                })
                                .addSettingsInputRow({
                                    id: nanoid(),
                                    readOnly: false,
                                    hidden: { _code: 'return getSettingValue(data?.canEditInline) !== "js";', _mode: 'code', _value: false } as any,
                                    inputs: [
                                        {
                                            id: nanoid(),
                                            propertyName: 'canEditInlineExpression',
                                            label: 'Can edit inline expression',
                                            type: 'codeEditor',
                                            parentId: crudTabId,
                                            readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                            description: 'Return true to enable inline editing and false to disable.',
                                            exposedVariables: ENABLE_CRUD_EXPOSED_VARIABLES,
                                        }
                                    ]
                                })
                                .addSettingsInputRow({
                                    id: nanoid(),
                                    readOnly: false,
                                    hidden: { _code: 'return getSettingValue(data?.canEditInline) === "no";', _mode: 'code', _value: false } as any,
                                    inputs: [
                                        {
                                            id: nanoid(),
                                            propertyName: 'inlineEditMode',
                                            label: 'Row edit mode',
                                            type: 'dropdown',
                                            parentId: crudTabId,
                                            readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                            dropdownOptions: [
                                                { value: 'one-by-one', label: 'One by one' },
                                                { value: 'all-at-once', label: 'All at once' },
                                            ],
                                        }
                                    ]
                                })
                                .addSettingsInputRow({
                                    id: nanoid(),
                                    readOnly: false,
                                    hidden: { _code: 'return getSettingValue(data?.canEditInline) === "no";', _mode: 'code', _value: false } as any,
                                    inputs: [
                                        {
                                            id: nanoid(),
                                            propertyName: 'inlineSaveMode',
                                            label: 'Save mode',
                                            type: 'dropdown',
                                            parentId: crudTabId,
                                            readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                            dropdownOptions: [
                                                { value: 'auto', label: 'Auto' },
                                                { value: 'manual', label: 'Manual' },
                                            ],
                                        }
                                    ]
                                })


                                // Custom update URL
                                .addSettingsInputRow({
                                    id: nanoid(),
                                    readOnly: false,
                                    hidden: { _code: 'return getSettingValue(data?.canEditInline) === "no";', _mode: 'code', _value: false } as any,
                                    inputs: [
                                        {
                                            id: nanoid(),
                                            propertyName: 'customUpdateUrl',
                                            label: 'Custom update url',
                                            type: 'textField',
                                            parentId: crudTabId,
                                            readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                        }
                                    ]
                                })

                                // Can add inline
                                .addSettingsInputRow({
                                    id: nanoid(),
                                    readOnly: false,
                                    hidden: false,
                                    inputs: [
                                        {
                                            id: nanoid(),
                                            propertyName: 'canAddInline',
                                            label: 'Can add inline',
                                            type: 'dropdown',
                                            parentId: crudTabId,
                                            readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                            dropdownOptions: [
                                                { value: 'yes', label: 'Yes' },
                                                { value: 'no', label: 'No' },
                                                { value: 'inherit', label: 'Inherit' },
                                                { value: 'js', label: 'Expression' },
                                            ],
                                        }
                                    ]
                                })

                                // Can add inline expression
                                .addSettingsInputRow({
                                    id: nanoid(),
                                    readOnly: false,
                                    hidden: { _code: 'return getSettingValue(data?.canAddInline) !== "js";', _mode: 'code', _value: false } as any,
                                    inputs: [
                                        {
                                            id: nanoid(),
                                            propertyName: 'canAddInlineExpression',
                                            label: 'Can add inline expression',
                                            type: 'codeEditor',
                                            parentId: crudTabId,
                                            readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                            description: 'Return true to enable inline creation of new rows and false to disable.',
                                            exposedVariables: ENABLE_CRUD_EXPOSED_VARIABLES,
                                        }
                                    ]
                                })

                                // New row capture position
                                .addSettingsInputRow({
                                    id: nanoid(),
                                    readOnly: false,
                                    hidden: { _code: 'return getSettingValue(data?.canAddInline) === "no";', _mode: 'code', _value: false } as any,
                                    inputs: [
                                        {
                                            id: nanoid(),
                                            propertyName: 'newRowCapturePosition',
                                            label: 'New row capture position',
                                            type: 'dropdown',
                                            parentId: crudTabId,
                                            readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                            dropdownOptions: [
                                                { value: 'top', label: 'Top' },
                                                { value: 'bottom', label: 'Bottom' },
                                            ],
                                        }
                                    ]
                                })

                                .addSettingsInputRow({
                                    id: nanoid(),
                                    readOnly: false,
                                    hidden: { _code: 'return true;', _mode: 'code', _value: true } as any,
                                    inputs: [
                                        {
                                            id: nanoid(),
                                            propertyName: 'newRowInsertPosition',
                                            label: 'New row insert position',
                                            type: 'dropdown',
                                            parentId: crudTabId,
                                            readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                            dropdownOptions: [
                                                { value: 'top', label: 'Top' },
                                                { value: 'bottom', label: 'Bottom' },
                                            ],
                                        }
                                    ]
                                })

                                // Custom create URL
                                .addSettingsInputRow({
                                    id: nanoid(),
                                    readOnly: false,
                                    hidden: { _code: 'return getSettingValue(data?.canAddInline) === "no";', _mode: 'code', _value: false } as any,
                                    inputs: [
                                        {
                                            id: nanoid(),
                                            propertyName: 'customCreateUrl',
                                            label: 'Custom create url',
                                            type: 'textField',
                                            parentId: crudTabId,
                                            readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                        }
                                    ]
                                })


                                .addSettingsInputRow({
                                    id: nanoid(),
                                    readOnly: false,
                                    hidden: { _code: 'return getSettingValue(data?.canAddInline) === "no";', _mode: 'code', _value: false } as any,
                                    inputs: [
                                        {
                                            id: nanoid(),
                                            propertyName: 'onNewRowInitialize',
                                            label: 'New row init',
                                            type: 'codeEditor',
                                            parentId: crudTabId,
                                            tooltip: 'Allows configurators to specify logic to initialise the object bound to a new row.',
                                            readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                            description: 'Specify logic to initialise the object bound to a new row. This handler should return an object or a Promise<object>.',
                                            exposedVariables: NEW_ROW_EXPOSED_VARIABLES,
                                        }
                                    ]
                                })


                                .addSettingsInput({
                                    id: nanoid(),
                                    propertyName: 'onRowSave',
                                    label: 'On row save',
                                    inputType: 'codeEditor',
                                    parentId: crudTabId,
                                    tooltip: 'Custom business logic to be executed on saving of new/updated row (e.g. custom validation / calculations). This handler should return an object or a Promise<object>.',
                                    hidden: { _code: 'return getSettingValue(data?.canAddInline) === "no" && getSettingValue(data?.canEditInline) === "no";', _mode: 'code', _value: false } as any,
                                    readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                    description: 'Allows custom business logic to be executed on saving of new/updated row (e.g. custom validation / calculations).',
                                    exposedVariables: ROW_SAVE_EXPOSED_VARIABLES,
                                })
                                .addConfigurableActionConfigurator({
                                    id: nanoid(),
                                    propertyName: 'onRowSaveSuccessAction',
                                    label: 'On Row Save Success',
                                    parentId: crudTabId,
                                    description: 'Custom business logic to be executed after successfull saving of new/updated row.',
                                    hideLabel: true,
                                    jsSetting: true,
                                })
                                .addSettingsInput({
                                    id: nanoid(),
                                    propertyName: 'canDeleteInline',
                                    label: 'Can delete inline',
                                    inputType: 'dropdown',
                                    parentId: crudTabId,
                                    readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                    dropdownOptions: [
                                        { value: 'yes', label: 'Yes' },
                                        { value: 'no', label: 'No' },
                                        { value: 'inherit', label: 'Inherit' },
                                        { value: 'js', label: 'Expression' },
                                    ],
                                })

                                .addSettingsInputRow({
                                    id: nanoid(),
                                    readOnly: false,
                                    hidden: { _code: 'return getSettingValue(data?.canDeleteInline) !== "js";', _mode: 'code', _value: false } as any,
                                    inputs: [
                                        {
                                            id: nanoid(),
                                            propertyName: 'canDeleteInlineExpression',
                                            label: 'Can delete inline expression',
                                            type: 'codeEditor',
                                            parentId: crudTabId,
                                            readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                            description: 'Return true to enable inline deletion and false to disable.',
                                            exposedVariables: ENABLE_CRUD_EXPOSED_VARIABLES,
                                        }
                                    ]
                                })

                                .addSettingsInputRow({
                                    id: nanoid(),
                                    readOnly: false,
                                    hidden: { _code: 'return getSettingValue(data?.canDeleteInline) === "no";', _mode: 'code', _value: false } as any,
                                    inputs: [
                                        {
                                            id: nanoid(),
                                            propertyName: 'customDeleteUrl',
                                            label: 'Custom delete url',
                                            type: 'textField',
                                            parentId: crudTabId,
                                            readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                        }
                                    ]
                                })


                                .toJson()
                        ]
                    },
                    {
                        key: 'appearance',
                        title: 'Appearance',
                        id: layoutTabId,
                        components: [...new DesignerToolbarSettings()

                            .addCollapsiblePanel({
                                id: 'tableEmptyState',
                                propertyName: 'tableEmptyState',
                                label: 'Empty State',
                                labelAlign: 'right',
                                ghost: true,
                                parentId: layoutTabId,
                                collapsible: 'header',
                                content: {
                                    id: 'tableEmptyState',
                                    components: [...new DesignerToolbarSettings()
                                        .addSettingsInput({
                                            id: nanoid(),
                                            propertyName: 'noDataIcon',
                                            label: 'Icon',
                                            inputType: 'iconPicker',
                                            parentId: emptyTableTabId,
                                            jsSetting: true,
                                            readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                        })
                                        .addSettingsInput({
                                            id: nanoid(),
                                            propertyName: 'noDataText',
                                            label: 'Primary Text',
                                            inputType: 'textField',
                                            parentId: emptyTableTabId,
                                            jsSetting: true,
                                            defaultValue: 'No Data',
                                            readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                        })
                                        .addSettingsInput({
                                            id: nanoid(),
                                            propertyName: 'noDataSecondaryText',
                                            label: 'Secondary Text',
                                            inputType: 'textField',
                                            parentId: emptyTableTabId,
                                            jsSetting: true,
                                            defaultValue: 'No data is available for this table',
                                            readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                        }).toJson()
                                    ]
                                }
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'minHeight',
                                label: 'Min Height',
                                inputType: 'numberField',
                                parentId: layoutTabId,
                                tooltip: 'The minimum height of the table (e.g. even when 0 rows). If blank then minimum height is 0.',
                                jsSetting: true,
                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'maxHeight',
                                label: 'Max Height',
                                inputType: 'numberField',
                                parentId: layoutTabId,
                                tooltip: 'The maximum height of the table. If left blank should grow to display all rows, otherwise should allow for vertical scrolling.',
                                jsSetting: true,
                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'containerStyle',
                                label: 'Table container style',
                                inputType: 'codeEditor',
                                parentId: layoutTabId,
                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                description: 'The style that will be applied to the table container/wrapper',
                                exposedVariables: [],
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                propertyName: 'tableStyle',
                                label: 'Table style',
                                inputType: 'codeEditor',
                                parentId: layoutTabId,
                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                description: 'The style that will be applied to the table',
                                exposedVariables: [],
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: 'security',
                        title: 'Security',
                        id: securityTabId,
                        components: [
                            ...new DesignerToolbarSettings()
                                .addSettingsInput({
                                    id: nanoid(),
                                    propertyName: 'permissions',
                                    label: 'Permissions',
                                    inputType: 'permissions',
                                    parentId: securityTabId,
                                    jsSetting: true,
                                    tooltip: 'Enter a list of permissions that should be associated with this component',
                                    readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                })
                                .toJson()
                        ]
                    }
                ]
            })
            .toJson(),
        formSettings: {
            colon: false,
            layout: 'vertical' as FormLayout,
            labelCol: { span: 24 },
            wrapperCol: { span: 24 }
        }
    };
};