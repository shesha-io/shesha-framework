import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { fontTypes, fontWeights, textAlign } from '../_settings/utils/font/utils';
import { getBorderInputs, getCornerInputs } from '../_settings/utils/border/utils';
import { IDropdownComponentProps } from './model';
import { backgroundTypeOptions, positionOptions, repeatOptions, sizeOptions } from '../_settings/utils/background/utils';
import { nanoid } from '@/utils/uuid';
import { presetColors } from './utils';

export const getSettings = (data: IDropdownComponentProps) => {
    const searchableTabsId = nanoid();
    const commonTabId = nanoid();
    const dataTabId = nanoid();
    const validationTabId = nanoid();
    const eventsTabId = nanoid();
    const appearanceTabId = nanoid();
    const securityTabId = nanoid();
    const styleRouterId = nanoid();
    const dataContainerId = nanoid();

    const DefaultTagStyleId = nanoid();
    const tagCustomStyleId = nanoid();
    const tagBorderStyleId = nanoid();
    const tagBackgroundStyleId = nanoid();
    const tagShadowStyleId = nanoid();

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
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: commonTabId,
                                inputs: [
                                    {
                                        id: nanoid(),
                                        type: 'editModeSelector',
                                        propertyName: 'editMode',
                                        label: 'Edit Mode',
                                        size: 'small',
                                        jsSetting: true,
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
                                parentId: commonTabId,
                                hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.displayStyle) !== "tags";', _mode: 'code', _value: false } as any,
                                inputs: [
                                    {
                                        id: nanoid(),
                                        type: 'switch',
                                        propertyName: 'showItemName',
                                        label: 'Show Item Name',
                                        jsSetting: true,
                                        tooltip: 'When checked the DisplayName/RefList Name will be shown.',
                                        layout: 'horizontal',
                                    },
                                    {
                                        id: nanoid(),
                                        type: 'switch',
                                        propertyName: 'showIcon',
                                        label: 'Show Icon',
                                        size: 'small',
                                        jsSetting: true,
                                        defaultValue: true,
                                        tooltip: 'When checked the icon will display on the left side of the DisplayName',
                                    }

                                ],
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: dataTabId,
                                inputs: [
                                    {
                                        id: nanoid(),
                                        label: "Mode",
                                        propertyName: "mode",
                                        type: "dropdown",
                                        size: "small",
                                        defaultValue: "single",
                                        jsSetting: true,
                                        dropdownOptions: [
                                            {
                                                value: "single",
                                                label: "Single"
                                            },
                                            {
                                                value: "multiple",
                                                label: "Multiple"
                                            }
                                        ]
                                    },
                                    {
                                        id: nanoid(),
                                        label: "Data Source Type",
                                        propertyName: "dataSourceType",
                                        type: "dropdown",
                                        size: "small",
                                        jsSetting: true,
                                        dropdownOptions: [
                                            {
                                                value: "values",
                                                label: "Values"
                                            },
                                            {
                                                value: "referenceList",
                                                label: "Reference list"
                                            }
                                        ],
                                    }
                                ]
                            })
                            .addContainer({
                                id: dataContainerId,
                                parentId: dataTabId,
                                propertyName: 'container1',
                                label: 'Container1',
                                labelAlign: 'right',
                                hidden: {
                                    _code: `return  getSettingValue(data.dataSourceType) !== 'referenceList';`,
                                    _mode: 'code',
                                    _value: false
                                },
                                direction: 'vertical',
                                justifyContent: 'left',
                                settingsValidationErrors: [],
                                components: [...new DesignerToolbarSettings()
                                    .addSettingsInput({
                                        id: nanoid(),
                                        parentId: dataContainerId,
                                        propertyName: 'referenceListId',
                                        label: 'Reference List',
                                        isDynamic: true,
                                        inputType: 'referenceListAutocomplete',
                                        settingsValidationErrors: [],
                                    })
                                    .addSettingsInput({
                                        id: nanoid(),
                                        inputType: 'queryBuilder',
                                        parentId: dataContainerId,
                                        propertyName: 'filter',
                                        label: 'Items Filter',
                                        isDynamic: true,
                                        validate: {},
                                        settingsValidationErrors: [],
                                        modelType: 'Shesha.Framework.ReferenceListItem'
                                    })
                                    .addSettingsInput({
                                        id: nanoid(),
                                        parentId: dataContainerId,
                                        label: "Value Format",
                                        propertyName: "valueFormat",
                                        inputType: "dropdown",
                                        size: "small",
                                        jsSetting: true,
                                        defaultValue: 'simple',
                                        dropdownOptions: [
                                            {
                                                value: "simple",
                                                label: "Simple item value"
                                            },
                                            {
                                                value: "listItem",
                                                label: "Reference list item"
                                            },
                                            {
                                                value: "custom",
                                                label: "Custom"
                                            }
                                        ],
                                    })
                                    .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: dataContainerId,
                                        inputs: [
                                            {
                                                id: nanoid(),
                                                type: 'codeEditor',
                                                propertyName: 'incomeCustomJs',
                                                label: 'Key Value',
                                                labelAlign: 'right',
                                                tooltip: 'Return key from the value',
                                                parentId: dataContainerId,
                                                hidden: {
                                                    "_code": "return  getSettingValue(data?.valueFormat) !== 'custom';",
                                                    "_mode": "code",
                                                    "_value": false
                                                } as any,
                                            },
                                            {
                                                id: nanoid(),
                                                type: 'codeEditor',
                                                propertyName: 'outcomeCustomJs',
                                                label: 'Custom Value',
                                                labelAlign: 'right',
                                                tooltip: 'Return value that will be stored as field value',
                                                parentId: dataContainerId,
                                                hidden: {
                                                    "_code": "return  getSettingValue(data?.valueFormat) !== 'custom';",
                                                    "_mode": "code",
                                                    "_value": false
                                                } as any,
                                            }
                                        ]
                                    })
                                    .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: dataContainerId,
                                        inputs: [
                                            {
                                                id: nanoid(),
                                                type: 'codeEditor',
                                                propertyName: 'labelCustomJs',
                                                label: 'Item Custom Label',
                                                labelAlign: 'right',
                                                tooltip: 'Return label value',
                                                parentId: dataContainerId,
                                            },
                                            {
                                                id: nanoid(),
                                                parentId: dataContainerId,
                                                type: 'switch',
                                                propertyName: 'disableItemValue',
                                                tooltip: 'Disable reference list from selection',
                                                label: 'Disable Item Value',
                                                jsSetting: true,
                                                layout: 'horizontal',
                                                version: 'latest'

                                            }
                                        ]
                                    })
                                    .addSettingsInputRow({
                                        id: nanoid(),
                                        parentId: dataContainerId,
                                        inputs: [
                                            {
                                                id: nanoid(),
                                                parentId: dataContainerId,
                                                type: 'textArea',
                                                propertyName: 'disabledValues',
                                                label: 'Disabled Values',
                                                allowClear: true,
                                                jsSetting: true,
                                                hidden: {
                                                    _code: "return  !getSettingValue(data.disableItemValue);",
                                                    _mode: 'code',
                                                    _value: false
                                                } as any,
                                                tooltip: 'Pass an array of positive integers to disable specific values. For example: [1, 2, 3].',
                                            }
                                        ]
                                    })
                                    .addSettingsInput({
                                        id: nanoid(),
                                        parentId: dataContainerId,
                                        inputType: 'textArea',
                                        propertyName: 'ignoredValues',
                                        label: 'Ignored Values',
                                        allowClear: true,
                                        jsSetting: true,
                                        tooltip: 'Pass an array of positive integers to ignore specific values. For example: [1, 2, 3].',
                                    })
                                    .toJson()
                                ]

                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: dataTabId,
                                inputs: [
                                    {
                                        id: nanoid(),
                                        type: 'customLabelValueEditor',
                                        propertyName: 'values',
                                        jsSetting: true,
                                        label: 'Values',
                                        labelName: 'label',
                                        labelTitle: 'Label',
                                        colorName: 'color',
                                        colorTitle: 'Color',
                                        iconName: 'icon',
                                        iconTitle: 'Icon',
                                        mode: 'inline',
                                        valueName: 'value',
                                        valueTitle: 'Value',
                                        dropdownOptions: presetColors
                                    }
                                ],
                                hidden: {
                                    _code: `return  getSettingValue(data.dataSourceType) !== 'values';`,
                                    _mode: 'code',
                                    _value: false
                                },
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                hidden: {
                                    _code: 'return  !getSettingValue(data.disableItemValue);',
                                    _mode: 'code',
                                    _value: false
                                },
                                inputType: 'textArea',
                                propertyName: 'ignoredValues',
                                label: 'Ignored Values',
                                size: 'small',
                                layout: 'horizontal',
                                jsSetting: true,
                                allowClear: true,
                                tooltip: "Pass an array of positive integers to ignore specific values. For example: [1, 2, 3].",
                                parentId: dataTabId
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: '3',
                        title: 'Validation',
                        id: validationTabId,
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
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
                        key: '4',
                        title: 'Events',
                        id: eventsTabId,
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'codeEditor',
                                propertyName: 'onChangeCustom',
                                label: 'On Change',
                                labelAlign: 'right',
                                tooltip: 'Enter custom eventhandler on changing of event.',
                                parentId: eventsTabId
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: '5',
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
                                        .addSettingsInput({
                                            id: nanoid(),
                                            parentId: styleRouterId,
                                            propertyName: 'displayStyle',
                                            label: 'Display Style',
                                            inputType: 'dropdown',
                                            dropdownOptions: [
                                                {
                                                    value: 'text',
                                                    label: 'Plain text'
                                                },
                                                {
                                                    value: 'tags',
                                                    label: 'Tags'
                                                }
                                            ]
                                        })
                                        .addCollapsiblePanel({
                                            id: nanoid(),
                                            propertyName: 'pnlFontStyle',
                                            label: 'Font',
                                            labelAlign: 'right',
                                            parentId: styleRouterId,
                                            ghost: true,
                                            collapsible: 'header',
                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.displayStyle) === "tags" && getSettingValue(data.mode) === "single";', _mode: 'code', _value: false } as any,
                                            content: {
                                                id: nanoid(),
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInputRow({
                                                        id: nanoid(),
                                                        parentId: nanoid(),
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
                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.displayStyle) === "tags" && getSettingValue(data.mode) === "single";', _mode: 'code', _value: false } as any,
                                            collapsible: 'header',
                                            content: {
                                                id: nanoid(),
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInputRow({
                                                        id: nanoid(),
                                                        parentId: nanoid(),
                                                        inline: true,
                                                        label: 'Width',
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
                                                        parentId: nanoid(),
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
                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.displayStyle) === "tags" && getSettingValue(data.mode) === "single";', _mode: 'code', _value: false } as any,
                                            parentId: styleRouterId,
                                            collapsible: 'header',
                                            content: {
                                                id: nanoid(),
                                                components: [...new DesignerToolbarSettings()
                                                    .addContainer({
                                                        id: nanoid(),
                                                        parentId: nanoid(),
                                                        components: getBorderInputs() as any
                                                    })
                                                    .addContainer({
                                                        id: nanoid(),
                                                        parentId: nanoid(),
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
                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.displayStyle) === "tags" && getSettingValue(data.mode) === "single";', _mode: 'code', _value: false } as any,
                                            parentId: styleRouterId,
                                            collapsible: 'header',
                                            content: {
                                                id: nanoid(),
                                                components: [
                                                    ...new DesignerToolbarSettings()
                                                        .addSettingsInput({
                                                            id: nanoid(),
                                                            parentId: nanoid(),
                                                            label: "Type",
                                                            jsSetting: false,
                                                            propertyName: "background.type",
                                                            inputType: "radio",
                                                            tooltip: "Select a type of background",
                                                            buttonGroupOptions: backgroundTypeOptions,
                                                        })
                                                        .addSettingsInputRow({
                                                            id: nanoid(),
                                                            parentId: nanoid(),
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
                                                            parentId: nanoid(),
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
                                                            parentId: nanoid(),
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
                                                            parentId: nanoid(),
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
                                                            parentId: nanoid(),
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
                                                            parentId: nanoid(),
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
                                                                },
                                                                {
                                                                    type: 'customDropdown',
                                                                    id: nanoid(),
                                                                    label: "Position",
                                                                    hideLabel: true,
                                                                    customTooltip: 'Position of the background image, two space separated values with units e.g "5em 100px"',
                                                                    propertyName: "background.position",
                                                                    dropdownOptions: positionOptions,
                                                                }
                                                            ]
                                                        })
                                                        .addSettingsInputRow({
                                                            id: nanoid(),
                                                            parentId: nanoid(),
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
                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.displayStyle) === "tags" && getSettingValue(data.mode) === "single";', _mode: 'code', _value: false } as any,
                                            parentId: styleRouterId,
                                            collapsible: 'header',
                                            content: {
                                                id: nanoid(),
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInputRow({
                                                        id: nanoid(),
                                                        parentId: nanoid(),
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
                                                                tooltip: 'Blur radius',
                                                                width: 80,
                                                                icon: 'blurIcon',
                                                                propertyName: 'shadow.blurRadius',
                                                            },
                                                            {
                                                                type: 'numberField',
                                                                id: nanoid(),
                                                                label: 'Spread',
                                                                hideLabel: true,
                                                                tooltip: 'Spread radius',
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
                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.displayStyle) === "tags" && getSettingValue(data.mode) === "single";', _mode: 'code', _value: false } as any,
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
                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.displayStyle) === "tags" && getSettingValue(data.mode) === "single";', _mode: 'code', _value: false } as any,
                                            parentId: styleRouterId,
                                            collapsible: 'header',
                                            content: {
                                                id: nanoid(),
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInput({
                                                        id: nanoid(),
                                                        inputType: 'codeEditor',
                                                        propertyName: 'style',
                                                        label: 'Style',
                                                        description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: nanoid(),
                                            propertyName: 'defaultTagStyle',
                                            label: 'Custom Tag Styles',
                                            labelAlign: 'right',
                                            ghost: true,
                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.displayStyle) !== "tags";', _mode: 'code', _value: false } as any,
                                            collapsible: 'header',
                                            content: {
                                                id: DefaultTagStyleId,
                                                components: [
                                                    ...new DesignerToolbarSettings()
                                                        .addCollapsiblePanel({
                                                            id: nanoid(),
                                                            propertyName: 'tagFontStyle',
                                                            label: 'Font',
                                                            labelAlign: 'right',
                                                            ghost: true,
                                                            collapsible: 'header',
                                                            parentId: DefaultTagStyleId,
                                                            content: {
                                                                id: nanoid(),
                                                                components: [...new DesignerToolbarSettings()
                                                                    .addSettingsInputRow({
                                                                        id: nanoid(),
                                                                        parentId: nanoid(),
                                                                        inline: true,
                                                                        inputs: [
                                                                            {
                                                                                type: 'dropdown',
                                                                                id: nanoid(),
                                                                                label: 'Family',
                                                                                propertyName: 'tag.font.type',
                                                                                hideLabel: true,
                                                                                dropdownOptions: fontTypes,
                                                                            },
                                                                            {
                                                                                type: 'numberField',
                                                                                id: nanoid(),
                                                                                label: 'Size',
                                                                                propertyName: 'tag.font.size',
                                                                                hideLabel: true,
                                                                                width: 50,
                                                                            },
                                                                            {
                                                                                type: 'dropdown',
                                                                                id: nanoid(),
                                                                                label: 'Weight',
                                                                                propertyName: 'tag.font.weight',
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
                                                                                propertyName: 'tag.font.color',
                                                                            },
                                                                            {
                                                                                type: 'dropdown',
                                                                                id: nanoid(),
                                                                                label: 'Align',
                                                                                propertyName: 'tag.font.align',
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
                                                            propertyName: 'tagDimensionStyle',
                                                            label: 'Dimension',
                                                            labelAlign: 'right',
                                                            ghost: true,
                                                            collapsible: 'header',
                                                            parentId: DefaultTagStyleId,
                                                            content: {
                                                                id: nanoid(),
                                                                components: [...new DesignerToolbarSettings()
                                                                    .addSettingsInputRow({
                                                                        id: nanoid(),
                                                                        parentId: nanoid(),
                                                                        inline: true,
                                                                        inputs: [
                                                                            {
                                                                                type: 'textField',
                                                                                id: nanoid(),
                                                                                label: "Width",
                                                                                width: 85,
                                                                                propertyName: "tag.dimensions.width",
                                                                                icon: "widthIcon",
                                                                                tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"

                                                                            },
                                                                            {
                                                                                type: 'textField',
                                                                                id: nanoid(),
                                                                                label: "Min Width",
                                                                                width: 85,
                                                                                hideLabel: true,
                                                                                propertyName: "tag.dimensions.minWidth",
                                                                                icon: "minWidthIcon",
                                                                            },
                                                                            {
                                                                                type: 'textField',
                                                                                id: nanoid(),
                                                                                label: "Max Width",
                                                                                width: 85,
                                                                                hideLabel: true,
                                                                                propertyName: "tag.dimensions.maxWidth",
                                                                                icon: "maxWidthIcon",
                                                                            }
                                                                        ]
                                                                    })
                                                                    .addSettingsInputRow({
                                                                        id: nanoid(),
                                                                        parentId: nanoid(),
                                                                        inline: true,
                                                                        inputs: [
                                                                            {
                                                                                type: 'textField',
                                                                                id: nanoid(),
                                                                                label: "Height",
                                                                                width: 85,
                                                                                propertyName: "tag.dimensions.height",
                                                                                icon: "heightIcon",
                                                                                tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"
                                                                            },
                                                                            {
                                                                                type: 'textField',
                                                                                id: nanoid(),
                                                                                label: "Min Height",
                                                                                width: 85,
                                                                                hideLabel: true,
                                                                                propertyName: "tag.dimensions.minHeight",
                                                                                icon: "minHeightIcon",
                                                                            },
                                                                            {
                                                                                type: 'textField',
                                                                                id: nanoid(),
                                                                                label: "Max Height",
                                                                                width: 85,
                                                                                hideLabel: true,
                                                                                propertyName: "tag.dimensions.maxHeight",
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
                                                            propertyName: 'tagBorderStyle',
                                                            label: 'Border',
                                                            labelAlign: 'right',
                                                            ghost: true,
                                                            collapsible: 'header',
                                                            parentId: DefaultTagStyleId,
                                                            content: {
                                                                id: tagBorderStyleId,
                                                                components: [...new DesignerToolbarSettings()
                                                                    .addContainer({
                                                                        id: nanoid(),
                                                                        parentId: tagBorderStyleId,
                                                                        components: getBorderInputs('tag') as any
                                                                    })
                                                                    .addContainer({
                                                                        id: nanoid(),
                                                                        parentId: tagBorderStyleId,
                                                                        components: getCornerInputs('tag') as any
                                                                    })
                                                                    .toJson()
                                                                ]
                                                            }
                                                        })
                                                        .addCollapsiblePanel({
                                                            id: nanoid(),
                                                            propertyName: 'tagBackgroundStyle',
                                                            label: 'Background',
                                                            labelAlign: 'right',
                                                            ghost: true,
                                                            parentId: DefaultTagStyleId,
                                                            collapsible: 'header',
                                                            content: {
                                                                id: tagBackgroundStyleId,
                                                                components: [
                                                                    ...new DesignerToolbarSettings()
                                                                        .addSettingsInput({
                                                                            id: nanoid(),
                                                                            inputType: 'switch',
                                                                            propertyName: 'solidColor',
                                                                            label: 'Show Solid Color',
                                                                            size: 'small',
                                                                            tooltip: 'When checked solid color fills the entire background, when unchecked creates a subtle light background with a prominent colored border.',
                                                                        })
                                                                        .addSettingsInput({
                                                                            id: nanoid(),
                                                                            parentId: tagBackgroundStyleId,
                                                                            label: "Type",
                                                                            jsSetting: false,
                                                                            propertyName: "tag.background.type",
                                                                            inputType: "radio",
                                                                            tooltip: "Select a type of background, the default background color for tags when no specific color is assigned. Acts as a fallback background style for uncolored tags.",
                                                                            buttonGroupOptions: backgroundTypeOptions,
                                                                        })
                                                                        .addSettingsInputRow({
                                                                            id: nanoid(),
                                                                            parentId: tagBackgroundStyleId,
                                                                            inputs: [{
                                                                                type: 'colorPicker',
                                                                                id: nanoid(),
                                                                                label: "Color",
                                                                                propertyName: "tag.background.color",
                                                                                hideLabel: true,
                                                                                jsSetting: false,
                                                                            }],
                                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.tag?.background?.type) !== "color";', _mode: 'code', _value: false } as any,
                                                                        })
                                                                        .addSettingsInputRow({
                                                                            id: nanoid(),
                                                                            parentId: tagBackgroundStyleId,
                                                                            inputs: [{
                                                                                type: 'multiColorPicker',
                                                                                id: nanoid(),
                                                                                propertyName: "tag.background.gradient.colors",
                                                                                label: "Colors",
                                                                                jsSetting: false,
                                                                            }
                                                                            ],
                                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.tag?.background?.type) !== "gradient";', _mode: 'code', _value: false } as any,
                                                                            hideLabel: true,
                                                                        })
                                                                        .addSettingsInputRow({
                                                                            id: nanoid(),
                                                                            parentId: tagBackgroundStyleId,
                                                                            inputs: [{
                                                                                type: 'textField',
                                                                                id: nanoid(),
                                                                                propertyName: "tag.background.url",
                                                                                jsSetting: false,
                                                                                label: "URL",
                                                                            }],
                                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.tag?.background?.type) !== "url";', _mode: 'code', _value: false } as any,
                                                                        })
                                                                        .addSettingsInputRow({
                                                                            id: nanoid(),
                                                                            parentId: tagBackgroundStyleId,
                                                                            inputs: [{
                                                                                type: 'imageUploader',
                                                                                id: nanoid(),
                                                                                propertyName: 'tag.background.uploadFile',
                                                                                label: "Image",
                                                                                jsSetting: false,
                                                                            }],
                                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.tag?.background?.type) !== "image";', _mode: 'code', _value: false } as any,
                                                                        })
                                                                        .addSettingsInputRow({
                                                                            id: nanoid(),
                                                                            parentId: tagBackgroundStyleId,
                                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.tag?.background?.type) !== "storedFile";', _mode: 'code', _value: false } as any,
                                                                            inputs: [
                                                                                {
                                                                                    type: 'textField',
                                                                                    id: nanoid(),
                                                                                    jsSetting: false,
                                                                                    propertyName: "tag.background.storedFile.id",
                                                                                    label: "File ID"
                                                                                }
                                                                            ]
                                                                        })
                                                                        .addSettingsInputRow({
                                                                            id: nanoid(),
                                                                            parentId: tagBackgroundStyleId,
                                                                            inline: true,
                                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.tag?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                                                                            inputs: [
                                                                                {
                                                                                    type: 'customDropdown',
                                                                                    id: nanoid(),
                                                                                    label: "Size",
                                                                                    hideLabel: true,
                                                                                    propertyName: "tag.background.size",
                                                                                    customTooltip: 'Size of the background image, two space separated values with units e.g "100% 100px"',
                                                                                    dropdownOptions: sizeOptions,
                                                                                },
                                                                                {
                                                                                    type: 'customDropdown',
                                                                                    id: nanoid(),
                                                                                    label: "Position",
                                                                                    hideLabel: true,
                                                                                    customTooltip: 'Position of the background image, two space separated values with units e.g "5em 100px"',
                                                                                    propertyName: "tag.background.position",
                                                                                    dropdownOptions: positionOptions,
                                                                                }
                                                                            ]
                                                                        })
                                                                        .addSettingsInputRow({
                                                                            id: nanoid(),
                                                                            parentId: tagBackgroundStyleId,
                                                                            inputs: [{
                                                                                type: 'radio',
                                                                                id: nanoid(),
                                                                                label: 'Repeat',
                                                                                hideLabel: true,
                                                                                propertyName: 'tag.background.repeat',
                                                                                inputType: 'radio',
                                                                                buttonGroupOptions: repeatOptions,
                                                                            }],
                                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.tag?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                                                                        })
                                                                        .toJson()
                                                                ],
                                                            }
                                                        })
                                                        .addCollapsiblePanel({
                                                            id: nanoid(),
                                                            propertyName: 'tagShadowStyle',
                                                            label: 'Shadow',
                                                            labelAlign: 'right',
                                                            ghost: true,
                                                            parentId: DefaultTagStyleId,
                                                            collapsible: 'header',
                                                            content: {
                                                                id: tagShadowStyleId,
                                                                components: [...new DesignerToolbarSettings()
                                                                    .addSettingsInputRow({
                                                                        id: nanoid(),
                                                                        parentId: tagShadowStyleId,
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
                                                                                propertyName: 'tag.shadow.offsetX',
                                                                            },
                                                                            {
                                                                                type: 'numberField',
                                                                                id: nanoid(),
                                                                                label: 'Offset Y',
                                                                                hideLabel: true,
                                                                                tooltip: 'Offset Y',
                                                                                width: 80,
                                                                                icon: 'offsetVerticalIcon',
                                                                                propertyName: 'tag.shadow.offsetY',
                                                                            },
                                                                            {
                                                                                type: 'numberField',
                                                                                id: nanoid(),
                                                                                label: 'Blur',
                                                                                hideLabel: true,
                                                                                tooltip: 'Blur Radius',
                                                                                width: 80,
                                                                                icon: 'blurIcon',
                                                                                propertyName: 'tag.shadow.blurRadius',
                                                                            },
                                                                            {
                                                                                type: 'numberField',
                                                                                id: nanoid(),
                                                                                label: 'Spread',
                                                                                hideLabel: true,
                                                                                tooltip: 'Spread Radius',
                                                                                width: 80,
                                                                                icon: 'spreadIcon',
                                                                                propertyName: 'tag.shadow.spreadRadius',
                                                                            },
                                                                            {
                                                                                type: 'colorPicker',
                                                                                id: nanoid(),
                                                                                label: 'Color',
                                                                                hideLabel: true,
                                                                                propertyName: 'tag.shadow.color',
                                                                            },
                                                                        ],
                                                                    })
                                                                    .toJson()
                                                                ]
                                                            }
                                                        })
                                                        .addCollapsiblePanel({
                                                            id: nanoid(),
                                                            propertyName: 'tagCustomStyle',
                                                            label: 'Custom Styles',
                                                            labelAlign: 'right',
                                                            ghost: true,
                                                            collapsible: 'header',
                                                            parentId: DefaultTagStyleId,
                                                            content: {
                                                                id: tagCustomStyleId,
                                                                components: [...new DesignerToolbarSettings()
                                                                    .addSettingsInput({
                                                                        id: nanoid(),
                                                                        inputType: 'codeEditor',
                                                                        propertyName: 'tag.style',
                                                                        label: 'Style',
                                                                        description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                                                                    })
                                                                    .toJson()
                                                                ]
                                                            }
                                                        })
                                                        .toJson()
                                                ]
                                            }
                                        })
                                        .toJson()]
                            }).toJson()]
                    },
                    {
                        key: '6',
                        title: 'Security',
                        id: securityTabId,
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
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