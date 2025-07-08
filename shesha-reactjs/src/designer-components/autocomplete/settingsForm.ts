import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { fontTypes, fontWeights, textAlign } from '../_settings/utils/font/utils';
import { getBorderInputs } from '../_settings/utils/border/utils';
import { getCornerInputs } from '../_settings/utils/border/utils';
import { IAutocompleteComponentProps } from './interfaces';
import { nanoid } from '@/utils/uuid';
import { backgroundTypeOptions, positionOptions, repeatOptions, sizeOptions } from '../_settings/utils/background/utils';

export const getSettings = (data: IAutocompleteComponentProps) => {

    const searchableTabsId = nanoid();
    const commonTabId = nanoid();
    const dataTabId = nanoid();
    const validationTabId = nanoid();
    const eventsTabId = nanoid();
    const appearanceTabId = nanoid();
    const securityTabId = nanoid();
    const styleRouterId = nanoid();

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
                        key: '1',
                        title: 'Common',
                        id: commonTabId,
                        components: [...new DesignerToolbarSettings()
                            .addContextPropertyAutocomplete({
                                id: nanoid(),
                                propertyName: 'propertyName',
                                label: 'Property Name',
                                parentId: commonTabId,
                                styledLabel: true,
                                size: 'small',
                                validate: {
                                    required: true,
                                },
                                jsSetting: true,
                            })
                            .addLabelConfigurator({
                                id: nanoid(),
                                propertyName: 'hideLabel',
                                label: 'Label',
                                parentId: commonTabId,
                                hideLabel: true,
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: commonTabId,
                                inputs: [
                                    {
                                        id: nanoid(),
                                        propertyName: 'placeholder',
                                        label: 'Placeholder',
                                        type: 'textField',
                                        size: 'small',
                                        jsSetting: true,
                                    },
                                    {
                                        id: nanoid(),
                                        type: 'textArea',
                                        propertyName: 'description',
                                        label: 'Tooltip',
                                        jsSetting: true,
                                    },
                                ],
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: commonTabId,
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                inputs: [
                                    {
                                        id: nanoid(),
                                        type: 'editModeSelector',
                                        propertyName: 'editMode',
                                        label: 'Edit Mode',
                                        size: 'small',
                                        jsSetting: true,
                                        defaultValue: 'inherited',
                                    },
                                    {
                                        id: nanoid(),
                                        type: 'switch',
                                        propertyName: 'hidden',
                                        label: 'Hide',
                                        jsSetting: true,
                                        layout: 'horizontal',
                                    },
                                ],
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: '2',
                        title: 'Data',
                        id: dataTabId,
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: dataTabId,
                                inputs: [
                                    {
                                        id: nanoid(),
                                        type: 'switch',
                                        propertyName: 'disableSearch',
                                        label: 'Disable Search',
                                        size: 'small',
                                        jsSetting: true,

                                    }
                                ],
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'dropdown',
                                propertyName: 'mode',
                                label: 'Selection Mode',
                                jsSetting: true,
                                size: 'small',
                                dropdownOptions: [
                                    { value: 'single', label: 'Single' },
                                    { value: 'multiple', label: 'Multiple' },
                                ],
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                parentId: dataTabId,
                                label: "Data Source Type",
                                propertyName: "dataSourceType",
                                inputType: "dropdown",
                                size: "small",
                                jsSetting: true,
                                dropdownOptions: [
                                    {
                                        value: "entitiesList",
                                        label: "Entities list"
                                    },
                                    {
                                        value: "url",
                                        label: "URL"
                                    },
                                ]
                            })
                            .addContainer({
                                id: nanoid(),
                                parentId: dataTabId,
                                propertyName: 'container1',
                                label: 'Container',
                                labelAlign: 'right',
                                hidden: {
                                    _code: `return  getSettingValue(data.dataSourceType) !== 'url';`,
                                    _mode: 'code',
                                    _value: false
                                },
                                direction: 'vertical',
                                justifyContent: 'left',
                                settingsValidationErrors: [],
                                components: [...new DesignerToolbarSettings()
                                    .addSettingsInput({
                                        id: nanoid(),
                                        parentId: dataTabId,
                                        label: 'Data Source URL',
                                        propertyName: "dataSourceUrl",
                                        inputType: "endpointsAutocomplete",
                                        size: "small",
                                        jsSetting: true,
                                        mode: "url",
                                        httpVerb: "get",
                                        isDynamic: false,
                                    })

                                    .addSettingsInput({
                                        id: nanoid(),
                                        parentId: dataTabId,
                                        label: "Value Prop Name",
                                        propertyName: "valuePropName",
                                        inputType: "textField",
                                        size: "small",
                                        jsSetting: true,
                                    })

                                    .addSettingsInput({
                                        id: nanoid(),
                                        inputType: 'labelValueEditor',
                                        parentId: dataTabId,
                                        propertyName: 'queryParams',
                                        label: 'Query Param',
                                        labelName: 'param',
                                        labelTitle: 'Param',
                                        valueName: 'value',
                                        valueTitle: 'Value',
                                        mode: 'dialog',
                                        version: 2
                                    })
                                    .toJson()
                                ]
                            })
                            .addContainer({
                                id: nanoid(),
                                parentId: dataTabId,
                                propertyName: 'container2',
                                label: 'Container2',
                                labelAlign: 'right',
                                direction: 'vertical',
                                justifyContent: 'left',
                                settingsValidationErrors: [],
                                components: [...new DesignerToolbarSettings()
                                    .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: dataTabId,
                                        hidden: {
                                            _code: `return  getSettingValue(data.dataSourceType) !== 'entitiesList';`,
                                            _mode: 'code',
                                            _value: false
                                        },
                                        inputs: [
                                            {
                                                id: nanoid(),
                                                type: 'autocomplete',
                                                propertyName: 'entityType',
                                                label: 'Entity Type',
                                                labelAlign: 'right',
                                                parentId: dataTabId,
                                                hidden: false,
                                                dataSourceType: 'url',
                                                validate: {},
                                                jsSetting: true,
                                                dataSourceUrl: '/api/services/app/Metadata/EntityTypeAutocomplete',
                                                useRawValues: true
                                            }
                                        ]
                                    })

                                    .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: dataTabId,
                                        hidden: {
                                            _code: 'return !getSettingValue(data.entityType);',
                                            _mode: 'code',
                                            _value: false
                                        },
                                        inputs: [
                                            {
                                                id: nanoid(),
                                                type: 'queryBuilder',
                                                parentId: dataTabId,
                                                propertyName: 'filter',
                                                label: 'Entity Filter',
                                                isDynamic: true,
                                                validate: {},
                                                hidden: false,
                                                settingsValidationErrors: [],
                                                modelType: {
                                                    _code: 'return getSettingValue(data?.entityType);',
                                                    _mode: 'code',
                                                    _value: false
                                                } as any,
                                                fieldsUnavailableHint: "Please select `Entity Type` to be able to configure this filter.",
                                            },
                                        ],
                                    })

                                    .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: dataTabId,
                                        hidden: {
                                            _code: "return getSettingValue(data?.dataSourceType) === 'url';",
                                            _mode: 'code',
                                            _value: false
                                        },
                                        inputs: [
                                            {
                                                id: nanoid(),
                                                parentId: dataTabId,
                                                label: 'Custom Source URL',
                                                propertyName: "dataSourceUrl",
                                                type: "endpointsAutocomplete",
                                                size: "small",
                                                jsSetting: true,
                                                mode: "url",
                                                httpVerb: "get",
                                                isDynamic: false,
                                            }
                                        ],
                                    })

                                    .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: dataTabId,
                                        inputs: [
                                            {
                                                id: nanoid(),
                                                type: 'dropdown',
                                                propertyName: 'valueFormat',
                                                label: 'Value Format',
                                                hidden: false,
                                                dropdownOptions: {
                                                    _code: `return getSettingValue(data?.dataSourceType) === 'entitiesList' ? [{\"label\": \"Simple ID\",\"value\":\"simple\",\"id\": \"1\"},
                                                    {\"label\": \"Entity reference\",\"value\": \"entityReference\",\"id\": \"2\"},{\"label\": \"Custom\",\"value\": \"custom\",\"id\": \"3\"}]
                                                    : [{\"label\": \"Simple ID\",\"value\": \"simple\",\"id\": \"1\"},{\"label\": \"Custom\",\"value\": \"custom\",\"id\": \"3\"}];`,
                                                    _mode: "code",
                                                    _value: false
                                                } as any,
                                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                            },

                                        ],
                                    })
                                    .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: dataTabId,
                                        hidden: { _code: "return getSettingValue(data?.valueFormat) !== 'custom';", _mode: 'code', _value: false } as any,
                                        inputs: [
                                            {
                                                id: nanoid(),
                                                type: 'codeEditor',
                                                propertyName: 'outcomeValueFunc',
                                                label: 'Value Function',
                                                labelAlign: 'right',
                                                tooltip: 'Return value for item object',
                                                mode: 'dialog',
                                                exposedVariables: [{ name: 'item', description: 'Item of list', type: 'object' }],
                                                wrapInTemplate: true,
                                                templateSettings: { functionName: 'outcomeValueFunc' },
                                                availableConstantsExpression: 'return metadataBuilder.object("constants").addObject("item", "Item of list").build();',
                                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                            },

                                        ],
                                    })
                                    .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: dataTabId,
                                        hidden: { _code: "return getSettingValue(data?.valueFormat) !== 'custom';", _mode: 'code', _value: false } as any,
                                        inputs: [
                                            {
                                                id: nanoid(),
                                                type: 'codeEditor',
                                                propertyName: 'keyValueFunc',
                                                label: 'Key Value Function',
                                                labelAlign: 'right',
                                                tooltip: 'Return key from selected value',
                                                mode: 'dialog',
                                                exposedVariables: [{ name: 'value', description: 'Value of item', type: 'object' }],
                                                wrapInTemplate: true,
                                                templateSettings: { functionName: 'keyValueFunc' },
                                                availableConstantsExpression: 'return metadataBuilder.object("constants").addObject("value", "Value of item").build();',
                                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                            }

                                        ],
                                    })
                                    .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: dataTabId,
                                        // hidden: { _code: "return getSettingValue(data?.valueFormat) === 'simple';", _mode: 'code', _value: false } as any,
                                        inputs: [
                                            {
                                                id: nanoid(),
                                                type: 'codeEditor',
                                                propertyName: 'displayValueFunc',
                                                label: 'Display Value Function',
                                                labelAlign: 'right',
                                                hidden: false,
                                                tooltip: "Return display value for item's object",
                                                mode: 'dialog',
                                                exposedVariables: [{ name: 'item', description: 'Item of list', type: 'object' }],
                                                wrapInTemplate: true,
                                                templateSettings: { functionName: 'displayValueFunc' },
                                                availableConstantsExpression: 'return metadataBuilder.object("constants").addObject("item", "Item of list").build();',
                                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                            }

                                        ],
                                    })
                                    .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: dataTabId,
                                        inputs: [
                                            {
                                                id: nanoid(),
                                                hidden: { _code: "return getSettingValue(data?.valueFormat) !== 'simple';", _mode: 'code', _value: false } as any,
                                                type: 'switch',
                                                propertyName: 'allowFreeText',
                                                label: 'Allow Free Text',
                                                labelAlign: 'right',
                                                jsSetting: true,
                                                tooltip: 'Allow to use free text that is missing on the source',
                                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                            }
                                        ],
                                    })
                                    .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: dataTabId,
                                        hidden: { _code: "return getSettingValue(data?.valueFormat) !== 'custom';", _mode: 'code', _value: false } as any,
                                        inputs: [
                                            {
                                                id: nanoid(),
                                                type: 'codeEditor',
                                                propertyName: 'filterKeysFunc',
                                                label: 'Filter Selected Function',
                                                labelAlign: 'right',
                                                tooltip: 'Return filter object (JsonLogic) for selected value(s). Use this settings to configure non-standard values format',
                                                mode: 'dialog',
                                                exposedVariables: [{ name: 'item', description: 'Item of list', type: 'object' }],
                                                wrapInTemplate: true,
                                                templateSettings: { functionName: 'filterSelectedFunc' },
                                                availableConstantsExpression: 'return metadataBuilder.object("constants").addObject("value", "Value of autocomplete").build();',
                                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                            }
                                        ],
                                    })
                                    .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: dataTabId,
                                        inputs: [
                                            {
                                                id: nanoid(),
                                                propertyName: 'displayPropName',
                                                label: 'Display Property',
                                                tooltip: 'Name of the property that should be displayed in the autocomplete. Live empty to use default display property defined on the back-end.',
                                                parentId: dataTabId,
                                                modelType: {
                                                    _code: 'return getSettingValue(data?.entityType);',
                                                    _mode: 'code',
                                                    _value: false
                                                } as any,
                                                isDynamic: false,
                                                autoFillProps: false,
                                                settingsValidationErrors: [],
                                                type: 'propertyAutocomplete',
                                                size: 'small',
                                            }
                                        ],
                                    })

                                    .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: dataTabId,
                                        hidden: { _code: "return getSettingValue(data?.valueFormat) === 'entityReference';", _mode: 'code', _value: false } as any,
                                        inputs: [
                                            {
                                                id: nanoid(),
                                                parentId: dataTabId,
                                                label: "Key Property Name",
                                                propertyName: "keyPropName",
                                                type: "textField",
                                                size: "small",
                                                jsSetting: true,
                                            }
                                        ]
                                    })

                                    .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: dataTabId,
                                        hidden: {
                                            _code: `return  getSettingValue(data.dataSourceType) === 'url';`,
                                            _mode: 'code',
                                            _value: false
                                        },
                                        inputs: [

                                            {
                                                id: nanoid(),
                                                type: 'switch',
                                                propertyName: 'quickviewEnabled',
                                                label: 'Use Quickview',
                                                parentId: dataTabId,
                                                size: 'small',
                                            }
                                        ],
                                    })

                                    .addCollapsiblePanel({
                                        id: nanoid(),
                                        propertyName: 'pnlQuickView',
                                        label: 'Quickview',
                                        labelAlign: 'right',
                                        parentId: dataTabId,
                                        ghost: true,
                                        collapsible: 'header',
                                        hidden: {
                                            _code: 'return !getSettingValue(data?.quickviewEnabled);',
                                            _mode: 'code',
                                            _value: false
                                        },
                                        content: {
                                            id: nanoid(),
                                            components: [...new DesignerToolbarSettings()
                                                .addSettingsInputRow({
                                                    id: nanoid(),
                                                    parentId: dataTabId,
                                                    inline: false,
                                                    inputs: [
                                                        {
                                                            id: nanoid(),
                                                            type: 'formAutocomplete',
                                                            propertyName: 'quickviewFormPath',
                                                            label: 'Form Path',
                                                            parentId: dataTabId,
                                                            size: 'small',
                                                            validate: {
                                                                required: false,
                                                            }
                                                        },
                                                    ],
                                                })
                                                .addSettingsInputRow({
                                                    id: nanoid(),
                                                    parentId: dataTabId,
                                                    inline: false,
                                                    inputs: [

                                                        {
                                                            id: nanoid(),
                                                            type: 'endpointsAutocomplete',
                                                            propertyName: 'quickviewGetEntityUrl',
                                                            parentId: dataTabId,
                                                            label: 'Get Entity URL',
                                                            size: 'small',
                                                            version: 5
                                                        },
                                                    ],
                                                })
                                                .addSettingsInputRow({
                                                    id: nanoid(),
                                                    parentId: dataTabId,
                                                    inline: false,
                                                    inputs: [
                                                        {
                                                            id: nanoid(),
                                                            propertyName: 'quickviewDisplayPropertyName',
                                                            label: 'Display Property',
                                                            tooltip: 'Name of the property that should be displayed in the autocomplete. Live empty to use default display property defined on the back-end.',
                                                            parentId: dataTabId,
                                                            modelType: {
                                                                _code: 'return getSettingValue(data?.entityType);',
                                                                _mode: 'code',
                                                                _value: false
                                                            } as any,
                                                            isDynamic: false,
                                                            autoFillProps: false,
                                                            settingsValidationErrors: [],
                                                            type: 'propertyAutocomplete',
                                                            size: 'small',
                                                        },
                                                    ],
                                                })
                                                .addSettingsInputRow({
                                                    id: nanoid(),
                                                    parentId: dataTabId,
                                                    inline: false,
                                                    inputs: [
                                                        {
                                                            id: nanoid(),
                                                            type: 'textField',
                                                            propertyName: 'quickviewWidth',
                                                            parentId: dataTabId,
                                                            tooltip: "You can use any unit (%, px, em, etc). px by default if without unit",
                                                            label: 'Width',
                                                            size: 'small',
                                                            icon: "widthIcon",
                                                            version: 5
                                                        }
                                                    ],
                                                })
                                                .toJson()
                                            ]
                                        }
                                    })
                                    .toJson()
                                ]
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: dataTabId,
                                hidden: {
                                    _code: `return  getSettingValue(data.dataSourceType) === 'url';`,
                                    _mode: 'code',
                                    _value: false
                                },
                                inputs: [
                                    {
                                        id: nanoid(),
                                        type: 'propertyAutocomplete',
                                        parentId: dataTabId,
                                        propertyName: 'fields',
                                        label: 'Fields to Fetch',
                                        isDynamic: true,
                                        jsSetting: true,
                                        validate: {},
                                        hidden: false,
                                        mode: 'multiple',
                                        settingsValidationErrors: [],
                                        modelType: {
                                            _code: 'return getSettingValue(data?.entityType);',
                                            _mode: 'code',
                                            _value: false
                                        } as any,
                                        fieldsUnavailableHint: "Please select `Entity Type` to be able to configure this filter.",
                                    },
                                ],
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: dataTabId,
                                hidden: {
                                    _code: `return  getSettingValue(data.dataSourceType) === 'url';`,
                                    _mode: 'code',
                                    _value: false
                                },
                                inputs: [
                                    {
                                        id: nanoid(),
                                        type: 'dataSortingEditor',
                                        parentId: dataTabId,
                                        propertyName: 'sorting',
                                        label: 'Sort By',
                                        isDynamic: true,
                                        jsSetting: true,
                                        validate: {},
                                        hidden: false,
                                        settingsValidationErrors: [],
                                        modelType: {
                                            _code: 'return getSettingValue(data?.entityType);',
                                            _mode: 'code',
                                            _value: false
                                        } as any,
                                    },

                                ],
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: dataTabId,
                                hidden: {
                                    _code: `return  getSettingValue(data.dataSourceType) === 'url';`,
                                    _mode: 'code',
                                    _value: false
                                },
                                inputs: [
                                    {
                                        id: nanoid(),
                                        type: 'dataSortingEditor',
                                        parentId: dataTabId,
                                        propertyName: 'grouping',
                                        label: 'Grouping',
                                        isDynamic: true,
                                        jsSetting: true,
                                        validate: {},
                                        hidden: false,
                                        settingsValidationErrors: [],
                                        modelType: {
                                            _code: 'return getSettingValue(data?.entityType);',
                                            _mode: 'code',
                                            _value: false
                                        } as any,
                                    },

                                ],
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: '4',
                        title: 'Validation',
                        id: validationTabId,
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                id: nanoid(),
                                inputType: 'switch',
                                propertyName: 'validate.required',
                                label: 'Required',
                                size: 'small',
                                layout: 'horizontal',
                                jsSetting: true,
                                parentId: validationTabId
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: '5',
                        title: 'Events',
                        id: eventsTabId,
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                id: nanoid(),
                                inputType: 'codeEditor',
                                propertyName: 'onChangeCustom',
                                label: 'On Change',
                                labelAlign: 'right',
                                tooltip: 'Enter custom eventhandler on changing of event. (form, event) are exposed',
                                parentId: eventsTabId,
                                availableConstantsExpression: "return metadataBuilder\n     .object(\"constants\")\n     .addAllStandard()\n      .addObject(\"value\", \"Component current value\")\n        .addObject(\"option\", \"Meta data of component current value\")        \t\n        .build();"
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: '6',
                        title: 'Appearance',
                        id: appearanceTabId,
                        components: [...new DesignerToolbarSettings()
                            .addPropertyRouter({
                                id: styleRouterId,
                                propertyName: 'propertyRouter1',
                                componentName: 'propertyRouter',
                                label: 'Property router1',
                                labelAlign: 'right',
                                parentId: appearanceTabId,
                                hidden: false,
                                propertyRouteName: {
                                    _mode: "code",
                                    _code: "    return contexts.canvasContext?.designerDevice || 'desktop';",
                                    _value: ""
                                },
                                components: [
                                    ...new DesignerToolbarSettings()
                                        .addCollapsiblePanel({
                                            id: nanoid(),
                                            propertyName: 'pnlFontStyle',
                                            label: 'Font',
                                            labelAlign: 'right',
                                            parentId: styleRouterId,
                                            ghost: true,
                                            collapsible: 'header',
                                            content: {
                                                id: nanoid(),
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInputRow({
                                                        id: nanoid(),
                                                        parentId: styleRouterId,
                                                        inline: true,
                                                        propertyName: 'font',
                                                        inputs: [
                                                            {
                                                                type: 'dropdown',
                                                                id: nanoid(),
                                                                label: 'Family',
                                                                propertyName: 'font.type',
                                                                hideLabel: true,
                                                                dropdownOptions: fontTypes,
                                                            },
                                                            {
                                                                type: 'numberField',
                                                                id: nanoid(),
                                                                label: 'Size',
                                                                propertyName: 'font.size',
                                                                hideLabel: true,
                                                                width: 50,
                                                            },
                                                            {
                                                                type: 'dropdown',
                                                                id: nanoid(),
                                                                label: 'Weight',
                                                                propertyName: 'font.weight',
                                                                hideLabel: true,
                                                                tooltip: "Controls text thickness (light, normal, bold, etc.)",
                                                                dropdownOptions: fontWeights,
                                                                width: 100,
                                                            },
                                                            {
                                                                type: 'colorPicker',
                                                                id: nanoid(),
                                                                label: 'Color',
                                                                hideLabel: true,
                                                                propertyName: 'font.color',
                                                            },
                                                            {
                                                                type: 'dropdown',
                                                                id: nanoid(),
                                                                label: 'Align',
                                                                propertyName: 'font.align',
                                                                hideLabel: true,
                                                                width: 60,
                                                                dropdownOptions: textAlign,
                                                            },
                                                        ],
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: nanoid(),
                                            propertyName: 'pnlDimensions',
                                            label: 'Dimensions',
                                            parentId: styleRouterId,
                                            labelAlign: 'right',
                                            ghost: true,
                                            collapsible: 'header',
                                            content: {
                                                id: nanoid(),
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInputRow({
                                                        id: nanoid(),
                                                        parentId: styleRouterId,
                                                        inline: true,
                                                        inputs: [
                                                            {
                                                                type: 'textField',
                                                                id: nanoid(),
                                                                label: "Width",
                                                                width: 85,
                                                                propertyName: "dimensions.width",
                                                                icon: "widthIcon",
                                                                tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"
                                                            },
                                                            {
                                                                type: 'textField',
                                                                id: nanoid(),
                                                                label: "Min Width",
                                                                width: 85,
                                                                hideLabel: true,
                                                                propertyName: "dimensions.minWidth",
                                                                icon: "minWidthIcon",
                                                            },
                                                            {
                                                                type: 'textField',
                                                                id: nanoid(),
                                                                label: "Max Width",
                                                                width: 85,
                                                                hideLabel: true,
                                                                propertyName: "dimensions.maxWidth",
                                                                icon: "maxWidthIcon",
                                                            }
                                                        ]
                                                    })
                                                    .addSettingsInputRow({
                                                        id: nanoid(),
                                                        parentId: styleRouterId,
                                                        inline: true,
                                                        inputs: [
                                                            {
                                                                type: 'textField',
                                                                id: nanoid(),
                                                                label: "Height",
                                                                width: 85,
                                                                propertyName: "dimensions.height",
                                                                icon: "heightIcon",
                                                                tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"
                                                            },
                                                            {
                                                                type: 'textField',
                                                                id: nanoid(),
                                                                label: "Min Height",
                                                                width: 85,
                                                                hideLabel: true,
                                                                propertyName: "dimensions.minHeight",
                                                                icon: "minHeightIcon",
                                                            },
                                                            {
                                                                type: 'textField',
                                                                id: nanoid(),
                                                                label: "Max Height",
                                                                width: 85,
                                                                hideLabel: true,
                                                                propertyName: "dimensions.maxHeight",
                                                                icon: "maxHeightIcon",
                                                            }
                                                        ]
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: nanoid(),
                                            propertyName: 'pnlBorderStyle',
                                            label: 'Border',
                                            labelAlign: 'right',
                                            ghost: true,
                                            parentId: styleRouterId,
                                            collapsible: 'header',
                                            content: {
                                                id: nanoid(),
                                                components: [...new DesignerToolbarSettings()

                                                    .addContainer({
                                                        id: nanoid(),
                                                        parentId: styleRouterId,
                                                        components: getBorderInputs() as any
                                                    })
                                                    .addContainer({
                                                        id: nanoid(),
                                                        parentId: styleRouterId,
                                                        components: getCornerInputs() as any
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: nanoid(),
                                            propertyName: 'pnlBackgroundStyle',
                                            label: 'Background',
                                            labelAlign: 'right',
                                            ghost: true,
                                            parentId: styleRouterId,
                                            collapsible: 'header',
                                            content: {
                                                id: nanoid(),
                                                components: [
                                                    ...new DesignerToolbarSettings()
                                                        .addSettingsInput({
                                                            id: nanoid(),
                                                            parentId: styleRouterId,
                                                            label: "Type",
                                                            jsSetting: false,
                                                            propertyName: "background.type",
                                                            inputType: "radio",
                                                            tooltip: "Select a type of background",
                                                            buttonGroupOptions: backgroundTypeOptions,
                                                        })
                                                        .addSettingsInputRow({
                                                            id: nanoid(),
                                                            parentId: styleRouterId,
                                                            inputs: [{
                                                                type: 'colorPicker',
                                                                id: nanoid(),
                                                                label: "Color",
                                                                propertyName: "background.color",
                                                                hideLabel: true,
                                                                jsSetting: false,
                                                            }],
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "color";', _mode: 'code', _value: false } as any,
                                                        })
                                                        .addSettingsInputRow({
                                                            id: nanoid(),
                                                            parentId: styleRouterId,
                                                            inputs: [{
                                                                type: 'multiColorPicker',
                                                                id: nanoid(),
                                                                propertyName: "background.gradient.colors",
                                                                label: "Colors",
                                                                jsSetting: false,
                                                            }
                                                            ],
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "gradient";', _mode: 'code', _value: false } as any,
                                                            hideLabel: true,
                                                        })
                                                        .addSettingsInputRow({
                                                            id: nanoid(),
                                                            parentId: styleRouterId,
                                                            inputs: [{
                                                                type: 'textField',
                                                                id: nanoid(),
                                                                propertyName: "background.url",
                                                                jsSetting: false,
                                                                label: "URL",
                                                            }],
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "url";', _mode: 'code', _value: false } as any,
                                                        })
                                                        .addSettingsInputRow({
                                                            id: nanoid(),
                                                            parentId: styleRouterId,
                                                            inputs: [{
                                                                type: 'imageUploader',
                                                                id: nanoid(),
                                                                propertyName: 'background.uploadFile',
                                                                label: "Image",
                                                                jsSetting: false,
                                                            }],
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "image";', _mode: 'code', _value: false } as any,
                                                        })
                                                        .addSettingsInputRow({
                                                            id: nanoid(),
                                                            parentId: styleRouterId,
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "storedFile";', _mode: 'code', _value: false } as any,
                                                            inputs: [
                                                                {
                                                                    type: 'textField',
                                                                    id: nanoid(),
                                                                    jsSetting: false,
                                                                    propertyName: "background.storedFile.id",
                                                                    label: "File ID"
                                                                }
                                                            ]
                                                        })
                                                        .addSettingsInputRow({
                                                            id: nanoid(),
                                                            parentId: styleRouterId,
                                                            inline: true,
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                                                            inputs: [
                                                                {
                                                                    type: 'customDropdown',
                                                                    id: nanoid(),
                                                                    label: "Size",
                                                                    hideLabel: true,
                                                                    propertyName: "background.size",
                                                                    customTooltip: 'Size of the background image, two space separated values with units e.g "100% 100px"',
                                                                    dropdownOptions: sizeOptions,
                                                                    hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                                                                },
                                                                {
                                                                    type: 'customDropdown',
                                                                    id: nanoid(),
                                                                    label: "Position",
                                                                    hideLabel: true,
                                                                    customTooltip: 'Position of the background image, two space separated values with units e.g "5em 100px"',
                                                                    propertyName: "background.position",
                                                                    dropdownOptions: positionOptions,
                                                                },
                                                            ]
                                                        })
                                                        .addSettingsInputRow({
                                                            id: nanoid(),
                                                            parentId: styleRouterId,
                                                            inputs: [{
                                                                type: 'radio',
                                                                id: nanoid(),
                                                                label: 'Repeat',
                                                                hideLabel: true,
                                                                propertyName: 'background.repeat',
                                                                inputType: 'radio',
                                                                buttonGroupOptions: repeatOptions,
                                                            }],
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                                                        })
                                                        .toJson()
                                                ],
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: nanoid(),
                                            propertyName: 'pnlShadowStyle',
                                            label: 'Shadow',
                                            labelAlign: 'right',
                                            ghost: true,
                                            parentId: styleRouterId,
                                            collapsible: 'header',
                                            content: {
                                                id: nanoid(),
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInputRow({
                                                        id: nanoid(),
                                                        parentId: styleRouterId,
                                                        inline: true,
                                                        inputs: [
                                                            {
                                                                type: 'numberField',
                                                                id: nanoid(),
                                                                label: 'Offset X',
                                                                hideLabel: true,
                                                                tooltip: 'Offset X',
                                                                width: 80,
                                                                icon: "offsetHorizontalIcon",
                                                                propertyName: 'shadow.offsetX',
                                                            },
                                                            {
                                                                type: 'numberField',
                                                                id: nanoid(),
                                                                label: 'Offset Y',
                                                                hideLabel: true,
                                                                tooltip: 'Offset Y',
                                                                width: 80,
                                                                icon: 'offsetVerticalIcon',
                                                                propertyName: 'shadow.offsetY',
                                                            },
                                                            {
                                                                type: 'numberField',
                                                                id: nanoid(),
                                                                label: 'Blur',
                                                                hideLabel: true,
                                                                tooltip: 'Blur Radius',
                                                                width: 80,
                                                                icon: 'blurIcon',
                                                                propertyName: 'shadow.blurRadius',
                                                            },
                                                            {
                                                                type: 'numberField',
                                                                id: nanoid(),
                                                                label: 'Spread',
                                                                hideLabel: true,
                                                                tooltip: 'Spread Radius',
                                                                width: 80,
                                                                icon: 'spreadIcon',
                                                                propertyName: 'shadow.spreadRadius',
                                                            },
                                                            {
                                                                type: 'colorPicker',
                                                                id: nanoid(),
                                                                label: 'Color',
                                                                hideLabel: true,
                                                                propertyName: 'shadow.color',
                                                            },
                                                        ],
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: nanoid(),
                                            propertyName: 'stylingBox',
                                            label: 'Margin & Padding',
                                            labelAlign: 'right',
                                            ghost: true,
                                            collapsible: 'header',
                                            content: {
                                                id: nanoid(),
                                                components: [...new DesignerToolbarSettings()
                                                    .addStyleBox({
                                                        id: nanoid(),
                                                        label: 'Margin Padding',
                                                        hideLabel: true,
                                                        propertyName: 'stylingBox',
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: nanoid(),
                                            propertyName: 'customStyle',
                                            label: 'Custom Styles',
                                            labelAlign: 'right',
                                            ghost: true,
                                            parentId: styleRouterId,
                                            collapsible: 'header',
                                            content: {
                                                id: nanoid(),
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInput({
                                                        id: nanoid(),
                                                        inputType: 'codeEditor',
                                                        propertyName: 'style',
                                                        hideLabel: false,
                                                        label: 'Style',
                                                        description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .toJson()]
                            }).toJson()]
                    },
                    {
                        key: '7',
                        title: 'Security',
                        id: securityTabId,
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                id: nanoid(),
                                inputType: 'permissions',
                                propertyName: 'permissions',
                                label: 'Permissions',
                                jsSetting: true,
                                size: 'small',
                                parentId: securityTabId
                            })
                            .toJson()
                        ]
                    }
                ]
            }).toJson(),
        formSettings: {
            colon: false,
            layout: 'vertical' as FormLayout,
            labelCol: { span: 24 },
            wrapperCol: { span: 24 }
        }
    };
};