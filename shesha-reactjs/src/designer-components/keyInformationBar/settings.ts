import { nanoid } from '@/utils/uuid';
import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';

export const formSettings = new DesignerToolbarSettings()
    .addCollapsiblePanel({
        id: '11164664-cbc9-4cef-babc-6fbea44cd0ca',
        propertyName: 'pnlDisplay',
        parentId: 'root',
        label: 'Display',
        labelAlign: 'left',
        expandIconPosition: 'start',
        ghost: true,
        collapsible: 'header',
        content: {
            id: 'pnl64664-cbc9-4cef-babc-6fbea44cd0ca',
            components: [
                ...new DesignerToolbarSettings()
                    .addContextPropertyAutocomplete({
                        id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
                        propertyName: 'propertyName',
                        parentId: 'root',
                        label: 'Property name',
                        validate: {
                            required: true,
                        },
                    })
                    .addTextField({
                        id: '46d07439-4c18-468c-89e1-60c002ce96c5',
                        propertyName: 'label',
                        parentId: 'root',
                        label: 'Label',
                    })
                    .addTextArea({
                        id: '2d32fe70-99a0-4825-ae6c-8b933004e119',
                        propertyName: 'description',
                        parentId: 'root',
                        label: 'Description',
                    })
                    .addCheckbox({
                        id: nanoid(),
                        propertyName: "hidden",
                        label: "Hidden",
                    })
                    .addCheckbox({
                        id: nanoid(),
                        propertyName: "hideLabel",
                        label: "Hide Label",
                    })
                    .toJson(),
            ],
        },
    })
    .addCollapsiblePanel({
        id: '11164664-cbc9-4cef-babc-6fbea55cd0ca',
        propertyName: 'separatorData',
        parentId: 'root',
        label: 'Data',
        labelAlign: 'left',
        expandIconPosition: 'start',
        ghost: true,
        collapsible: 'header',
        content: {
            id: 'pnl64664-cbc9-4cdf-babc-6fbea44cd0ca',
            components: [
                ...new DesignerToolbarSettings()
                    .addDropdown({
                        id: nanoid(),
                        propertyName: "dataSourceType",
                        parentId: "pnl64664-cbc9-4cdf-babc-6fbea44cd0ca",
                        label: "DataSource Type",
                        dataSourceType: "values",
                        values: [
                            {
                                id: "9ac725c6-9a45-43d8-ba63-6b3de64f4ef2",
                                label: "Values",
                                value: "values"
                            },
                            {
                                id: "dfe60d27-12a1-4ad6-b30b-791c9cbfe61e",
                                label: "Reference List",
                                value: "referenceList"
                            },
                            {
                                label: "API Url",
                                value: "url",
                                id: "02501feb-f369-4306-a0fd-50f8c96410f8"
                            }
                        ],
                        referenceListId: null,
                        valueFormat: "listItem"
                    })
                    .addCodeEditor({
                        id: nanoid(),
                        propertyName: "dataSourceUrl",
                        label: "Data Source Url",
                        parentId: "pnl64664-cbc9-4cdf-babc-6fbea44cd0ca",
                        validate: {},
                        settingsValidationErrors: [],
                        description: "Write a code that returns the URL to be used to fetch data for the Radio.",
                        exposedVariables: [
                            {
                                name: "data",
                                description: "Form values",
                                type: "object"
                            },
                            {
                                name: "globalState",
                                description: "The global state",
                                type: "object"
                            }
                        ],
                        hidden: {
                            _code: "return getSettingValue(data.dataSourceType) !== 'url';",
                            _mode: "code",
                            _value: false
                        },
                        version: 3,
                        wrapInTemplate: true,
                        templateSettings: {
                            functionName: "getDataSourceUrl"
                        },
                        availableConstantsExpression: `return metadataBuilder.addStandard(["shesha:formData", "shesha:globalState"]).build();`

                    })
                    .addCodeEditor({
                        id: nanoid(),
                        propertyName: "reducerFunc",
                        label: "Reducer function",
                        parentId: "pnl64664-cbc9-4cdf-babc-6fbea44cd0ca",
                        validate: {},
                        settingsValidationErrors: [],
                        description: "A reducer function for the data returned from the server. The function is responsible for value and label props. The function should return an array of object of this format: { value, label }",
                        exposedVariables: [
                            {
                                name: "data",
                                description: "An array of items returned from the server",
                                type: "array"
                            }
                        ],
                        hidden: {
                            _code: "return getSettingValue(data.dataSourceType) !== 'url';",
                            _mode: "code",
                            _value: false
                        },
                        version: 3,
                        wrapInTemplate: true,
                        templateSettings: {
                            functionName: "reducerFunction"
                        },
                        availableConstantsExpression: `return metadataBuilder.addArray("data", "An array of items returned from the server").build();`

                    })
                    .addRefListAutocomplete({
                        id: nanoid(),
                        propertyName: "referenceListId",
                        label: "Reference List",
                        labelAlign: "right",
                        parentId: "pnl64664-cbc9-4cdf-babc-6fbea44cd0ca",
                        hidden: {
                            _code: "return getSettingValue(data.dataSourceType) !== 'referenceList';",
                            _mode: "code",
                            _value: false
                        },
                        isDynamic: false,
                        version: 2,
                        description: "",
                        validate: {
                            message: ""
                        },
                        settingsValidationErrors: []
                    })
                    .addLabelValueEditor({
                        id: nanoid(),
                        propertyName: "items",
                        parentId: "pnl64664-cbc9-4cdf-babc-6fbea44cd0ca",
                        label: "Items",
                        labelTitle: "Label",
                        labelName: "label",
                        valueTitle: "Value",
                        valueName: "value",
                        hidden: {
                            _code: "return getSettingValue(data.dataSourceType) !== 'values';",
                            _mode: "code",
                            _value: false
                        },
                        version: 2,
                        mode: "dialog",
                    })
                    .addDropdown({
                        id: nanoid(),
                        propertyName: "direction",
                        parentId: "pnl64664-cbc9-4cdf-babc-6fbea44cd0ca",
                        label: "Direction",
                        dataSourceType: "values",
                        values: [
                            {
                                id: "9ac725c6-9a45-43d8-ba63-6b3de64f4ef2",
                                label: "Vertical",
                                value: "vertical"
                            },
                            {
                                id: "dfe60d27-12a1-4ad6-b30b-791c9cbfe61e",
                                label: "Horizontal",
                                value: "horizontal"
                            }
                        ],
                        version: 5,
                        referenceListId: null,
                        defaultValue: "horizontal",
                        valueFormat: "listItem"
                    })
                    .addNumberField({
                        id: nanoid(),
                        propertyName: "space",
                        parentId: "pnl64664-cbc9-4cdf-babc-6fbea44cd0ca",
                        label: "space",
                        validate: {},
                        settingsValidationErrors: [],
                        description: "The space between the items",
                        defaultValue: 5,
                    })
                    .toJson(),
            ],
        },
    })
    .addCollapsiblePanel({
        id: 'd675bfe4-ee69-431e-931b-b0e0b9ceee6f',
        propertyName: 'separatorValidation',
        parentId: 'root',
        label: 'Validation',
        labelAlign: "right",
        expandIconPosition: "start",
        ghost: true,
        collapsible: 'header',
        content: {
            id: 'pnl5bfe4-ee69-431e-931b-b0e0b9ceee6f',
            components: [...new DesignerToolbarSettings()
                .addCheckbox({
                    id: '3be9da3f-f47e-48ae-b4c3-f5cc36e534d9',
                    propertyName: "validate.required",
                    parentId: "pnl5bfe4-ee69-431e-931b-b0e0b9ceee6f",
                    label: "Required",
                    version: 2
                }).toJson()
            ]
        }
    })
    .addCollapsiblePanel({
        id: '6befdd49-41aa-41d6-a29e-76fa00590b75',
        propertyName: 'pnlStyle',
        parentId: 'root',
        label: 'Style',
        labelAlign: "left",
        expandIconPosition: "start",
        ghost: true,
        collapsible: 'header',
        content: {
            id: 'pnlfdd49-41aa-41d6-a29e-76fa00590b75',
            components: [...new DesignerToolbarSettings()
                .addCodeEditor({
                    id: nanoid(),
                    propertyName: "style",
                    label: "Style",
                    parentId: "pnlfdd49-41aa-41d6-a29e-76fa00590b75",
                    validate: {},
                    settingsValidationErrors: [],
                    description: "A script that returns the style of the element as an object. This should conform to CSSProperties",
                    exposedVariables: [
                        {
                            name: "data",
                            description: "Form values",
                            type: "object"
                        }
                    ],
                    wrapInTemplate: true,
                    templateSettings: {
                        functionName: "getStyle"
                    },
                    availableConstantsExpression: "return metadataBuilder.addStandard([\"shesha:formData\", \"shesha:globalState\"]).build();"

                }).toJson()
            ]
        }
    })
    .addCollapsiblePanel({
        id: 'eb91c2f5-592e-4f60-ba1a-f1d2011a5290',
        propertyName: 'pnlSecurity',
        parentId: 'root',
        label: 'Security',
        labelAlign: "left",
        expandIconPosition: "start",
        ghost: true,
        collapsible: 'header',
        content: {
            id: 'pnl24bf6-f76d-4139-a850-c99bf06c8b71',
            components: [...new DesignerToolbarSettings()
                .addPermissionAutocomplete({
                    id: '4d81ae9d-d222-4fc1-85b2-4dc3ee6a3721',
                    propertyName: 'permissions',
                    label: 'Permissions',
                    labelAlign: 'right',
                    parentId: 'root',
                    hidden: false,
                    validate: {},
                }).toJson()
            ]
        }
    })
    .toJson();

