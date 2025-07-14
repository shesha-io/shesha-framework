import { backgroundTypeOptions, positionOptions, repeatOptions, sizeOptions } from '@/designer-components/_settings/utils/background/utils';
import { getBorderInputs, getCornerInputs } from '@/designer-components/_settings/utils/border/utils';
import { fontTypes, fontWeights, textAlign } from '@/designer-components/_settings/utils/font/utils';
import { buttonTypes } from '@/designer-components/button/util';
import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { nanoid } from '@/utils/uuid';

export const getItemSettings = () => {
    const searchableTabsId = nanoid();
    const commonTabId = nanoid();
    const appearanceTabId = nanoid();
    const securityTabId = nanoid();
    const commonButtonSettingsContainerId = nanoid();
    const fontStylePnlId = nanoid();
    const dimensionsStylePnlId = nanoid();
    const borderStylePnlId = nanoid();
    const backgroundStylePnlId = nanoid();
    const shadowStylePnlId = nanoid();
    const stylePnlId = nanoid();
    const customStylePnlId = nanoid();

    const entityOrUrl = 'getSettingValue(data?.itemSubType) == "separator" || getSettingValue(data?.itemSubType) === "dynamic" && (getSettingValue(data?.dynamicItemsConfiguration?.providerUid) !== "Entity" && getSettingValue(data?.dynamicItemsConfiguration?.providerUid) !== "Url")';

    return {
        components: new DesignerToolbarSettings()
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
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: "dropdown",
                                propertyName: "itemSubType",
                                label: "Item Type",
                                labelAlign: "right",
                                parentId: commonTabId,
                                hidden: false,
                                jsSetting: false,
                                dropdownOptions: [
                                    {
                                        label: "Button",
                                        value: "button"
                                    },
                                    {
                                        label: "Separator",
                                        value: "separator"
                                    },
                                    {
                                        label: "Dynamic item(s)",
                                        value: "dynamic"
                                    }
                                ],
                                validate: {
                                    "required": true
                                }
                            })
                            .addContainer({
                                id: commonButtonSettingsContainerId,
                                parentId: commonTabId,
                                hidden: {
                                    _code: 'return  getSettingValue(data?.itemSubType) !== "button";',
                                    _mode: 'code',
                                    _value: false
                                },
                                components: [
                                    ...new DesignerToolbarSettings()
                                        .addSettingsInputRow({
                                            id: nanoid(),
                                            parentId: commonButtonSettingsContainerId,
                                            inputs: [{
                                                id: nanoid(),
                                                type: 'textField',
                                                propertyName: 'name',
                                                label: 'Name',
                                                jsSetting: false,
                                                validate: {
                                                    required: true
                                                }
                                            }]
                                        })
                                        .addSettingsInputRow({
                                            id: nanoid(),
                                            parentId: commonButtonSettingsContainerId,
                                            hidden: {
                                                _code: 'return  getSettingValue(data?.itemSubType) !== "button";',
                                                _mode: 'code',
                                                _value: false
                                            } as any,
                                            inputs: [
                                                {
                                                    id: nanoid(),
                                                    type: "textField",
                                                    propertyName: "label",
                                                    parentId: commonButtonSettingsContainerId,
                                                    label: "Caption",
                                                    jsSetting: true
                                                },
                                                {
                                                    id: nanoid(),
                                                    type: "textArea",
                                                    propertyName: "tooltip",
                                                    label: "Tooltip",
                                                    labelAlign: "right",
                                                    parentId: commonButtonSettingsContainerId,
                                                    hidden: false,
                                                    allowClear: false,
                                                    jsSetting: true
                                                }
                                            ]
                                        })
                                        .addSettingsInputRow({
                                            id: nanoid(),
                                            parentId: commonButtonSettingsContainerId,
                                            inputs: [
                                                {
                                                    id: nanoid(),
                                                    type: 'iconPicker',
                                                    propertyName: 'icon',
                                                    label: 'Icon',
                                                    size: 'small',
                                                    parentId: commonButtonSettingsContainerId,
                                                    jsSetting: true,
                                                },
                                                {
                                                    id: nanoid(),
                                                    propertyName: 'iconPosition',
                                                    label: 'Icon Position',
                                                    size: 'small',
                                                    jsSetting: true,
                                                    type: 'radio',
                                                    parentId: commonButtonSettingsContainerId,
                                                    buttonGroupOptions: [
                                                        { title: 'Start', value: 'start', icon: 'LeftOutlined' },
                                                        { title: 'End', value: 'end', icon: 'RightOutlined' },
                                                    ],
                                                    hidden: {
                                                        _code: 'return  !getSettingValue(data?.icon);',
                                                        _mode: 'code',
                                                        _value: false
                                                    } as any
                                                },
                                            ],
                                        })
                                        .addSettingsInputRow({
                                            id: nanoid(),
                                            parentId: commonButtonSettingsContainerId,
                                            inputs: [
                                                {
                                                    type: 'editModeSelector',
                                                    id: nanoid(),
                                                    propertyName: 'editMode',
                                                    label: 'Edit Mode',
                                                    size: 'small',
                                                    parentId: commonButtonSettingsContainerId,
                                                    jsSetting: true,
                                                },
                                                {
                                                    type: 'switch',
                                                    id: nanoid(),
                                                    propertyName: 'hidden',
                                                    label: 'Hide',
                                                    jsSetting: true,
                                                    layout: 'horizontal',
                                                },
                                            ],
                                        })
                                        .addConfigurableActionConfigurator({
                                            id: nanoid(),
                                            propertyName: 'actionConfiguration',
                                            label: 'Action Configuration',
                                            hideLabel: true,
                                            validate: {},
                                            settingsValidationErrors: [],
                                        }).toJson()
                                ]
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: commonTabId,
                                hidden: {
                                    _code: 'return  getSettingValue(data?.itemSubType) !== "dynamic";',
                                    _mode: 'code',
                                    _value: false
                                },
                                inputs: [{
                                    id: nanoid(),
                                    type: "dynamicItemsConfigurator",
                                    propertyName: "dynamicItemsConfiguration",
                                    componentName: "configurableActionConfigurator1",
                                    label: "",
                                    hideLabel: true,
                                    labelAlign: "right",
                                    hidden: false,
                                    isDynamic: false,
                                    settingsValidationErrors: [],
                                    _formFields: [
                                        "propertyName",
                                        "description",
                                        "customVisibility"
                                    ]
                                }]
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: '2',
                        title: 'Appearance',
                        id: appearanceTabId,
                        hidden: {
                            _code: 'return getSettingValue(data?.itemSubType) === "dynamic" && (getSettingValue(data?.dynamicItemsConfiguration?.providerUid) !== "Entity" && getSettingValue(data?.dynamicItemsConfiguration?.providerUid) !== "Url")',
                            _mode: 'code',
                            _value: false
                        },
                        components: [
                            ...new DesignerToolbarSettings()
                                .addSettingsInputRow({
                                    id: nanoid(),
                                    inputs: [
                                        {
                                            id: nanoid(),
                                            propertyName: 'buttonType',
                                            label: 'Type',
                                            validate: {
                                                required: true,
                                            },
                                            type: 'dropdown',
                                            dropdownOptions: buttonTypes,
                                            hidden: {
                                                _code: `return ${entityOrUrl};`,
                                                _mode: 'code',
                                                _value: false
                                            } as any,
                                        },
                                        {
                                            id: nanoid(),
                                            type: 'textField',
                                            propertyName: 'dividerWidth',
                                            label: "thickness",
                                            hidden: {
                                                _code: 'return  getSettingValue(data?.itemSubType) !== "separator";',
                                                _mode: 'code',
                                                _value: false
                                            } as any,
                                        },
                                        {
                                            id: nanoid(),
                                            type: 'colorPicker',
                                            propertyName: 'dividerColor',
                                            label: 'Color',
                                            hidden: {
                                                _code: 'return  getSettingValue(data?.itemSubType) !== "separator";',
                                                _mode: 'code',
                                                _value: false
                                            } as any,
                                        }
                                    ]
                                })
                                .addCollapsiblePanel({
                                    id: nanoid(),
                                    propertyName: 'pnlFontStyle',
                                    label: 'Font',
                                    labelAlign: 'right',
                                    parentId: appearanceTabId,
                                    ghost: true,
                                    hidden: {
                                        _code: `return  getSettingValue(data?.itemSubType) == "separator" || ${entityOrUrl};`,
                                        _mode: 'code',
                                        _value: false
                                    } as any,
                                    collapsible: 'header',
                                    content: {
                                        id: fontStylePnlId,
                                        components: [...new DesignerToolbarSettings()
                                            .addSettingsInputRow({
                                                id: nanoid(),
                                                parentId: fontStylePnlId,
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
                                                        propertyName: 'font.color',
                                                        hideLabel: true,
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
                                    parentId: appearanceTabId,
                                    labelAlign: 'right',
                                    ghost: true,
                                    hidden: {
                                        _code: `return  getSettingValue(data?.itemSubType) == "separator" || ${entityOrUrl};`,
                                        _mode: 'code',
                                        _value: false
                                    } as any,
                                    collapsible: 'header',
                                    content: {
                                        id: dimensionsStylePnlId,
                                        components: [...new DesignerToolbarSettings()
                                            .addSettingsInputRow({
                                                id: nanoid(),
                                                parentId: dimensionsStylePnlId,
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
                                                parentId: dimensionsStylePnlId,
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
                                    hidden: { _code: `return  ["dashed","text", "link", "ghost"].includes(getSettingValue(data?.buttonType)) || getSettingValue(data?.itemSubType) === "separator" || ${entityOrUrl};`, _mode: 'code', _value: false } as any,
                                    parentId: appearanceTabId,
                                    collapsible: 'header',
                                    content: {
                                        id: borderStylePnlId,
                                        components: [...new DesignerToolbarSettings()
                                            .addContainer({
                                                id: nanoid(),
                                                parentId: borderStylePnlId,
                                                components: getBorderInputs("", false) as any
                                            })
                                            .addContainer({
                                                id: nanoid(),
                                                parentId: borderStylePnlId,
                                                components: getCornerInputs("", false) as any
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
                                    parentId: appearanceTabId,
                                    collapsible: 'header',
                                    hidden: { _code: `return  ["text", "link", "ghost", "primary"].includes(getSettingValue(data?.buttonType)) || getSettingValue(data?.itemSubType) === "separator" || ${entityOrUrl};`, _mode: 'code', _value: false } as any,
                                    content: {
                                        id: backgroundStylePnlId,
                                        components: [
                                            ...new DesignerToolbarSettings()
                                                .addSettingsInput({
                                                    id: nanoid(),
                                                    parentId: backgroundStylePnlId,
                                                    label: "Type",
                                                    jsSetting: false,
                                                    propertyName: "background.type",
                                                    inputType: "radio",
                                                    defaultValue: "color",
                                                    tooltip: "Select a type of background",
                                                    buttonGroupOptions: backgroundTypeOptions,
                                                })
                                                .addSettingsInputRow({
                                                    id: nanoid(),
                                                    parentId: backgroundStylePnlId,
                                                    inputs: [{
                                                        type: 'colorPicker',
                                                        id: nanoid(),
                                                        label: "Color",
                                                        propertyName: "background.color",
                                                        hideLabel: true,
                                                        jsSetting: false,
                                                    }],
                                                    hidden: { _code: 'return  getSettingValue(data?.background?.type) !== "color";', _mode: 'code', _value: false } as any,
                                                })
                                                .addSettingsInputRow({
                                                    id: nanoid(),
                                                    parentId: backgroundStylePnlId,
                                                    inputs: [{
                                                        type: 'multiColorPicker',
                                                        id: nanoid(),
                                                        propertyName: "background.gradient.colors",
                                                        label: "Colors",
                                                        jsSetting: false,
                                                    }
                                                    ],
                                                    hidden: { _code: 'return  getSettingValue(data?.background?.type) !== "gradient";', _mode: 'code', _value: false } as any,
                                                    hideLabel: true,
                                                })
                                                .addSettingsInputRow({
                                                    id: nanoid(),
                                                    parentId: backgroundStylePnlId,
                                                    inputs: [{
                                                        type: 'textField',
                                                        id: nanoid(),
                                                        propertyName: "background.url",
                                                        jsSetting: false,
                                                        label: "URL",
                                                    }],
                                                    hidden: { _code: 'return  getSettingValue(data?.background?.type) !== "url";', _mode: 'code', _value: false } as any,
                                                })
                                                .addSettingsInputRow({
                                                    id: nanoid(),
                                                    parentId: backgroundStylePnlId,
                                                    inputs: [{
                                                        type: 'imageUploader',
                                                        id: nanoid(),
                                                        propertyName: 'background.uploadFile',
                                                        label: "Image",
                                                        jsSetting: false,
                                                    }],
                                                    hidden: { _code: 'return  getSettingValue(data?.background?.type) !== "image";', _mode: 'code', _value: false } as any,
                                                })
                                                .addSettingsInputRow({
                                                    id: nanoid(),
                                                    parentId: backgroundStylePnlId,
                                                    hidden: { _code: 'return  getSettingValue(data?.background?.type) !== "storedFile";', _mode: 'code', _value: false } as any,
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
                                                    parentId: backgroundStylePnlId,
                                                    inline: true,
                                                    hidden: { _code: 'return  getSettingValue(data?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                                                    inputs: [
                                                        {
                                                            type: 'customDropdown',
                                                            id: nanoid(),
                                                            label: "Size",
                                                            customTooltip: 'Size of the background image, two space separated values with units e.g "100% 100px"',
                                                            hideLabel: true,
                                                            propertyName: "background.size",
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
                                                        },
                                                    ]
                                                })
                                                .addSettingsInputRow({
                                                    id: nanoid(),
                                                    parentId: backgroundStylePnlId,
                                                    inputs: [{
                                                        type: 'radio',
                                                        id: nanoid(),
                                                        label: 'Repeat',
                                                        hideLabel: true,
                                                        propertyName: 'background.repeat',
                                                        inputType: 'radio',
                                                        buttonGroupOptions: repeatOptions,
                                                    }],
                                                    hidden: { _code: 'return  getSettingValue(data?.background?.type) === "color";', _mode: 'code', _value: false } as any,
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
                                    hidden: { _code: `return  ["text", "link", "ghost"].includes(getSettingValue(data?.buttonType)) || getSettingValue(data?.itemSubType) === "separator" || ${entityOrUrl};`, _mode: 'code', _value: false } as any,
                                    parentId: appearanceTabId,
                                    collapsible: 'header',
                                    content: {
                                        id: shadowStylePnlId,
                                        components: [...new DesignerToolbarSettings()
                                            .addSettingsInputRow({
                                                id: nanoid(),
                                                parentId: shadowStylePnlId,
                                                inline: true,
                                                inputs: [
                                                    {
                                                        type: 'numberField',
                                                        id: nanoid(),
                                                        label: 'Offset X',
                                                        hideLabel: true,
                                                        width: 80,
                                                        inputType: 'numberField',
                                                        icon: "offsetHorizontalIcon",
                                                        propertyName: 'shadow.offsetX',
                                                    },
                                                    {
                                                        type: 'numberField',
                                                        id: nanoid(),
                                                        label: 'Offset Y',
                                                        hideLabel: true,
                                                        width: 80,
                                                        inputType: 'numberField',
                                                        icon: 'offsetVerticalIcon',
                                                        propertyName: 'shadow.offsetY',
                                                    },
                                                    {
                                                        type: 'numberField',
                                                        id: nanoid(),
                                                        label: 'Blur',
                                                        hideLabel: true,
                                                        width: 80,
                                                        inputType: 'numberField',
                                                        icon: 'blurIcon',
                                                        propertyName: 'shadow.blurRadius',
                                                    },
                                                    {
                                                        type: 'numberField',
                                                        id: nanoid(),
                                                        label: 'Spread',
                                                        hideLabel: true,
                                                        width: 80,
                                                        inputType: 'numberField',
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
                                    parentId: appearanceTabId,
                                    hidden: { _code: `return  getSettingValue(data?.itemSubType) === "separator" || ${entityOrUrl};`, _mode: 'code', _value: false } as any,
                                    collapsible: 'header',
                                    content: {
                                        id: stylePnlId,
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
                                    hidden: {
                                        _code: `return  getSettingValue(data?.itemSubType) === "separator" || ${entityOrUrl};`,
                                        _mode: 'code',
                                        _value: false
                                    } as any,
                                    parentId: appearanceTabId,
                                    collapsible: 'header',
                                    content: {
                                        id: customStylePnlId,
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
                                .toJson()
                        ]
                    },
                    {
                        key: '3',
                        title: 'Security',
                        id: securityTabId,
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'permissions',
                                propertyName: 'permissions',
                                label: 'Permissions',
                                size: 'small',
                                jsSetting: true,
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
            wrapperCol: { span: 24 },
        },
    };
};