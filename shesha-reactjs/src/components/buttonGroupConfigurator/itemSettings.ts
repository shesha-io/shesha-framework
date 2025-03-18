import { backgroundTypeOptions, positionOptions, repeatOptions, sizeOptions } from '@/designer-components/_settings/utils/background/utils';
import { getBorderInputs, getCornerInputs } from '@/designer-components/_settings/utils/border/utils';
import { fontTypes, fontWeights, textAlign } from '@/designer-components/_settings/utils/font/utils';
import { buttonTypes } from '@/designer-components/button/util';
import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import _ from 'lodash';

export const getItemSettings = (data) => {

    return {
        components: new DesignerToolbarSettings(data)
            .addSearchableTabs({
                id: 'W_m7doMyCpCYwAYDfRh6I',
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
                        id: 's4gmBg31azZC0UjZjpfTm',
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                id: "840aee56-42d2-40ed-a2c6-57abb255fb95",
                                inputType: "dropdown",
                                propertyName: "itemSubType",
                                label: "Item Type",
                                labelAlign: "right",
                                parentId: "root",
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
                                id: 'common-button-settings-container',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                hidden: {
                                    _code: 'return  getSettingValue(data?.itemSubType) !== "button";',
                                    _mode: 'code',
                                    _value: false
                                },
                                components: [
                                    ...new DesignerToolbarSettings()
                                        .addSettingsInputRow({
                                            id: 'name-8b38-4b82-b192-563259afc159',
                                            parentId: 's4gmBg31azZC0UjZjpfTm',
                                            readOnly: data?.readOnly,

                                            inputs: [{
                                                id: 'name-8b38-4b82-b192-563259afc159',
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
                                            id: 'label-tooltip-s4gmBg31azZC0UjZjpfTm',
                                            parentId: 's4gmBg31azZC0UjZjpfTm',
                                            readOnly: data?.readOnly,
                                            hidden: data?.itemSubType !== 'button',
                                            inputs: [
                                                {
                                                    id: "A-qcRVk-qlnGDLtFvK-2X",
                                                    type: "textField",
                                                    propertyName: "label",
                                                    parentId: "root",
                                                    label: "Caption"
                                                },
                                                {
                                                    id: "rupsZ1fuRwqetjQ0BC5sk",
                                                    type: "textArea",
                                                    propertyName: "tooltip",
                                                    label: "Tooltip",
                                                    labelAlign: "right",
                                                    parentId: "root",
                                                    hidden: false,
                                                    allowClear: false
                                                }
                                            ]
                                        })
                                        .addSettingsInputRow({
                                            id: 'icon-position-s4gmBg31azZC0UjZjpfTm',
                                            parentId: 's4gmBg31azZC0UjZjpfTm',
                                            inputs: [
                                                {
                                                    id: 'icon-s4gmBg31azZC0UjZjpfTm',
                                                    type: 'iconPicker',
                                                    propertyName: 'icon',
                                                    label: 'Icon',
                                                    size: 'small',
                                                    jsSetting: true,
                                                },
                                                {
                                                    id: 'iconPosition-s4gmBg31azZC0UjZjpfTm',
                                                    propertyName: 'iconPosition',
                                                    label: 'Icon Position',
                                                    size: 'small',
                                                    jsSetting: true,
                                                    type: 'radio',
                                                    buttonGroupOptions: [
                                                        { title: 'start', value: 'start', icon: 'LeftOutlined' },
                                                        { title: 'end', value: 'end', icon: 'RightOutlined' },
                                                    ],
                                                },
                                            ],
                                            readOnly: data.readOnly,
                                        })
                                        .addSettingsInputRow({
                                            id: '12d700d6-ed4d-49d5-9cfd-fe8f0060f3b6',
                                            parentId: 's4gmBg31azZC0UjZjpfTm',
                                            readOnly: data?.readOnly,
                                            inputs: [
                                                {
                                                    type: 'editModeSelector',
                                                    id: 'editMode-s4gmBg31azZC0UjZjpfTm',
                                                    propertyName: 'editMode',
                                                    label: 'Edit Mode',
                                                    size: 'small',
                                                    jsSetting: true,
                                                },
                                                {
                                                    type: 'switch',
                                                    id: 'hidden-s4gmBg31azZC0UjZjpfTm',
                                                    propertyName: 'hidden',
                                                    label: 'Hide',
                                                    jsSetting: true,
                                                    layout: 'horizontal',
                                                },
                                            ],
                                        })
                                        .addConfigurableActionConfigurator({
                                            id: 'F3B46A95-703F-4465-96CA-A58496A5F78C',
                                            propertyName: 'actionConfiguration',
                                            label: 'Action Configuration',
                                            validate: {},
                                            settingsValidationErrors: [],
                                        }).toJson()
                                ]
                            })
                            .addSettingsInputRow({
                                id: 'dynamic-items-config-8b38-4b82-b192-563259afc159',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                readOnly: false,
                                hidden: {
                                    _code: 'return  getSettingValue(data?.itemSubType) !== "dynamic";',
                                    _mode: 'code',
                                    _value: false
                                },
                                inputs: [{
                                    id: "BobKODSk3NmsjzWl2E8ED",
                                    type: "dynamicItemsConfigurator",
                                    propertyName: "dynamicItemsConfiguration",
                                    componentName: "configurableActionConfigurator1",
                                    label: "",
                                    hideLabel: true,
                                    labelAlign: "right",
                                    parentId: "P4lhbrJsly_2yCjgicaql",
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
                        id: 'elgrlievlfwehhh848r8hsdnflsdnclurbd',
                        components: [
                            ...new DesignerToolbarSettings()
                                .addSettingsInput({
                                    id: '12d700d6-ed4d-49d5-9cfd-fe8f0060f3b6',
                                    propertyName: 'buttonType',
                                    label: 'Type',
                                    validate: {
                                        required: true,
                                    },
                                    inputType: 'dropdown',
                                    dropdownOptions: buttonTypes,
                                })
                                .addCollapsiblePanel({
                                    id: 'fontStyleCollapsiblePanel',
                                    propertyName: 'pnlFontStyle',
                                    label: 'Font',
                                    labelAlign: 'right',
                                    parentId: 'root',
                                    ghost: true,
                                    collapsible: 'header',
                                    content: {
                                        id: 'fontStylePnl',
                                        components: [...new DesignerToolbarSettings()
                                            .addSettingsInputRow({
                                                id: 'try26voxhs-HxJ5k5ngYE',
                                                parentId: 'fontStylePnl',
                                                inline: true,
                                                propertyName: 'font',
                                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                inputs: [
                                                    {
                                                        type: 'dropdown',
                                                        id: 'fontFamily-s4gmBg31azZC0UjZjpfTm',
                                                        label: 'Family',
                                                        propertyName: 'font.type',
                                                        hideLabel: true,
                                                        dropdownOptions: fontTypes,
                                                    },
                                                    {
                                                        type: 'numberField',
                                                        id: 'fontSize-s4gmBg31azZC0UjZjpfTm',
                                                        label: 'Size',
                                                        propertyName: 'font.size',
                                                        hideLabel: true,
                                                        width: 50,
                                                    },
                                                    {
                                                        type: 'dropdown',
                                                        id: 'fontWeight-s4gmBg31azZC0UjZjpfTm',
                                                        label: 'Weight',
                                                        propertyName: 'font.weight',
                                                        hideLabel: true,
                                                        tooltip: "Controls text thickness (light, normal, bold, etc.)",
                                                        dropdownOptions: fontWeights,
                                                        width: 100,
                                                    },
                                                    {
                                                        type: 'colorPicker',
                                                        id: 'fontColor-s4gmBg31azZC0UjZjpfTm',
                                                        label: 'Color',
                                                        propertyName: 'font.color',
                                                        hideLabel: true,
                                                    },
                                                    {
                                                        type: 'dropdown',
                                                        id: 'fontAlign-s4gmBg31azZC0UjZjpfTm',
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
                                    id: 'dimensionsStyleCollapsiblePanel',
                                    propertyName: 'pnlDimensions',
                                    label: 'Dimensions',
                                    parentId: 'root',
                                    labelAlign: 'right',
                                    ghost: true,
                                    collapsible: 'header',
                                    content: {
                                        id: 'dimensionsStylePnl',
                                        components: [...new DesignerToolbarSettings()
                                            .addSettingsInputRow({
                                                id: 'dimensionsStyleRowWidth',
                                                parentId: 'dimensionsStylePnl',
                                                inline: true,
                                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                inputs: [
                                                    {
                                                        type: 'textField',
                                                        id: 'dimensionsStyleRowWidth',
                                                        label: "Width",
                                                        width: 85,
                                                        propertyName: "dimensions.width",
                                                        icon: "widthIcon",
                                                        tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"

                                                    },
                                                    {
                                                        type: 'textField',
                                                        id: 'dimensionsStyleRowMinWidth',
                                                        label: "Min Width",
                                                        width: 85,
                                                        hideLabel: true,
                                                        propertyName: "dimensions.minWidth",
                                                        icon: "minWidthIcon",
                                                    },
                                                    {
                                                        type: 'textField',
                                                        id: 'dimensionsStyleRowMaxWidth',
                                                        label: "Max Width",
                                                        width: 85,
                                                        hideLabel: true,
                                                        propertyName: "dimensions.maxWidth",
                                                        icon: "maxWidthIcon",
                                                    }
                                                ]
                                            })
                                            .addSettingsInputRow({
                                                id: 'dimensionsStyleRowHeight',
                                                parentId: 'dimensionsStylePnl',
                                                inline: true,
                                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                inputs: [
                                                    {
                                                        type: 'textField',
                                                        id: 'dimensionsStyleRowHeight',
                                                        label: "Height",
                                                        width: 85,
                                                        propertyName: "dimensions.height",
                                                        icon: "heightIcon",
                                                        tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"
                                                    },
                                                    {
                                                        type: 'textField',
                                                        id: 'dimensionsStyleRowMinHeight',
                                                        label: "Min Height",
                                                        width: 85,
                                                        hideLabel: true,
                                                        propertyName: "dimensions.minHeight",
                                                        icon: "minHeightIcon",
                                                    },
                                                    {
                                                        type: 'textField',
                                                        id: 'dimensionsStyleRowMaxHeight',
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
                                    id: 'borderStyleCollapsiblePanel',
                                    propertyName: 'pnlBorderStyle',
                                    label: 'Border',
                                    labelAlign: 'right',
                                    ghost: true,
                                    hidden: { _code: 'return  ["text", "link", "ghost"].includes(getSettingValue(data.buttonType));', _mode: 'code', _value: false } as any,
                                    parentId: 'root',
                                    collapsible: 'header',
                                    content: {
                                        id: 'borderStylePnl',
                                        components: [...new DesignerToolbarSettings()
                                            .addSettingsInputRow({
                                                id: `borderStyleRow`,
                                                parentId: 'borderStylePnl',
                                                hidden: { _code: 'return  !getSettingValue(data.border?.hideBorder);', _mode: 'code', _value: false } as any,
                                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                inputs: [
                                                    {
                                                        type: 'button',
                                                        id: 'borderStyleRow-hideBorder',
                                                        label: "Border",
                                                        hideLabel: true,
                                                        inputType: "button",
                                                        propertyName: "border.hideBorder",
                                                        icon: "EyeOutlined",
                                                        iconAlt: "EyeInvisibleOutlined"
                                                    },
                                                ]
                                            })
                                            .addContainer({
                                                id: 'borderStyleRow',
                                                parentId: 'borderStylePnl',
                                                components: getBorderInputs('', false) as any
                                            })
                                            .addContainer({
                                                id: 'borderRadiusStyleRow',
                                                parentId: 'borderStylePnl',
                                                components: getCornerInputs('', false) as any
                                            })
                                            .toJson()
                                        ]
                                    }
                                })
                                .addCollapsiblePanel({
                                    id: 'backgroundStyleCollapsiblePanel',
                                    propertyName: 'pnlBackgroundStyle',
                                    label: 'Background',
                                    labelAlign: 'right',
                                    ghost: true,
                                    hidden: { _code: 'return  ["text", "link", "ghost"].includes(getSettingValue(data.buttonType));', _mode: 'code', _value: false } as any,
                                    parentId: 'root',
                                    collapsible: 'header',
                                    content: {
                                        id: 'backgroundStylePnl',
                                        components: [
                                            ...new DesignerToolbarSettings()
                                                .addSettingsInput({
                                                    id: "backgroundStyleRow-selectType",
                                                    parentId: "backgroundStylePnl",
                                                    label: "Type",
                                                    jsSetting: false,
                                                    propertyName: "background.type",
                                                    inputType: "radio",
                                                    tooltip: "Select a type of background",
                                                    buttonGroupOptions: backgroundTypeOptions,
                                                    readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                })
                                                .addSettingsInputRow({
                                                    id: "backgroundStyleRow-color",
                                                    parentId: "backgroundStylePnl",
                                                    inputs: [{
                                                        type: 'colorPicker',
                                                        id: 'backgroundStyleRow-color',
                                                        label: "Color",
                                                        propertyName: "background.color",
                                                        hideLabel: true,
                                                        jsSetting: false,
                                                    }],
                                                    hidden: { _code: 'return  getSettingValue(data.background?.type) !== "color";', _mode: 'code', _value: false } as any,
                                                    readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                })
                                                .addSettingsInputRow({
                                                    id: "backgroundStyle-gradientColors",
                                                    parentId: "backgroundStylePnl",
                                                    inputs: [{
                                                        type: 'multiColorPicker',
                                                        id: 'backgroundStyle-gradientColors',
                                                        propertyName: "background.gradient.colors",
                                                        label: "Colors",
                                                        jsSetting: false,
                                                    }
                                                    ],
                                                    hidden: { _code: 'return  getSettingValue(data.background?.type) !== "gradient";', _mode: 'code', _value: false } as any,
                                                    hideLabel: true,
                                                    readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                })
                                                .addSettingsInputRow({
                                                    id: "backgroundStyle-url",
                                                    parentId: "backgroundStylePnl",
                                                    inputs: [{
                                                        type: 'textField',
                                                        id: 'backgroundStyle-url',
                                                        propertyName: "background.url",
                                                        jsSetting: false,
                                                        label: "URL",
                                                    }],
                                                    hidden: { _code: 'return  getSettingValue(data.background?.type) !== "url";', _mode: 'code', _value: false } as any,
                                                    readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                })
                                                .addSettingsInputRow({
                                                    id: "backgroundStyle-image",
                                                    parentId: 'backgroundStylePnl',
                                                    inputs: [{
                                                        type: 'imageUploader',
                                                        id: 'backgroundStyle-image',
                                                        propertyName: 'background.uploadFile',
                                                        label: "Image",
                                                        jsSetting: false,
                                                    }],
                                                    hidden: { _code: 'return  getSettingValue(data.background?.type) !== "image";', _mode: 'code', _value: false } as any,
                                                    readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                })
                                                .addSettingsInputRow({
                                                    id: "backgroundStyleRow-storedFile",
                                                    parentId: 'backgroundStylePnl',
                                                    hidden: { _code: 'return  getSettingValue(data.background?.type) !== "storedFile";', _mode: 'code', _value: false } as any,
                                                    readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                    inputs: [
                                                        {
                                                            type: 'textField',
                                                            id: 'backgroundStyleRow-storedFile',
                                                            propertyName: "background.storedFile.id",
                                                            label: "File ID"
                                                        }
                                                    ]
                                                })
                                                .addSettingsInputRow({
                                                    id: "backgroundStyleRow-controls",
                                                    parentId: 'backgroundStyleRow',
                                                    inline: true,
                                                    hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                                                    readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                    inputs: [
                                                        {
                                                            type: 'customDropdown',
                                                            id: 'backgroundStyleRow-size',
                                                            label: "Size",
                                                            hideLabel: true,
                                                            customTooltip: 'Size of the background image, two space separated values with units e.g "100% 100px"',
                                                            propertyName: "background.size",
                                                            dropdownOptions: sizeOptions,
                                                        },
                                                        {
                                                            label: "Position",
                                                            hideLabel: true,
                                                            type: 'customDropdown',
                                                            id: 'backgroundStyleRow-position',
                                                            customTooltip: 'Position of the background image, two space separated values with units e.g "5em 100px"',
                                                            propertyName: "background.position",
                                                            dropdownOptions: positionOptions,
                                                        },
                                                        {
                                                            type: 'radio',
                                                            id: 'backgroundStyleRow-repeat',
                                                            label: "Repeat",
                                                            hideLabel: true,
                                                            propertyName: "background.repeat",
                                                            buttonGroupOptions: repeatOptions,
                                                        }
                                                    ]
                                                })
                                                .toJson()
                                        ],
                                    }
                                })
                                .addCollapsiblePanel({
                                    id: 'shadowStyleCollapsiblePanel',
                                    propertyName: 'pnlShadowStyle',
                                    label: 'Shadow',
                                    labelAlign: 'right',
                                    ghost: true,
                                    hidden: { _code: 'return  ["text", "link", "ghost"].includes(getSettingValue(data.buttonType));', _mode: 'code', _value: false } as any,
                                    parentId: 'root',
                                    collapsible: 'header',
                                    content: {
                                        id: 'shadowStylePnl',
                                        components: [...new DesignerToolbarSettings()
                                            .addSettingsInputRow({
                                                id: 'shadowStyleRow',
                                                parentId: 'shadowStylePnl',
                                                inline: true,
                                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                inputs: [
                                                    {
                                                        type: 'numberField',
                                                        id: 'shadowStyleRow-offsetX',
                                                        label: 'Offset X',
                                                        hideLabel: true,
                                                        width: 60,
                                                        inputType: 'numberField',
                                                        icon: "offsetHorizontalIcon",
                                                        propertyName: 'shadow.offsetX',
                                                    },
                                                    {
                                                        type: 'numberField',
                                                        id: 'shadowStyleRow-offsetY',
                                                        label: 'Offset Y',
                                                        hideLabel: true,
                                                        width: 60,
                                                        inputType: 'numberField',
                                                        icon: 'offsetVerticalIcon',
                                                        propertyName: 'shadow.offsetY',
                                                    },
                                                    {
                                                        type: 'numberField',
                                                        id: 'shadowStyleRow-blur',
                                                        label: 'Blur',
                                                        hideLabel: true,
                                                        width: 60,
                                                        inputType: 'numberField',
                                                        icon: 'blurIcon',
                                                        propertyName: 'shadow.blurRadius',
                                                    },
                                                    {
                                                        type: 'numberField',
                                                        id: 'shadowStyleRow-spread',
                                                        label: 'Spread',
                                                        hideLabel: true,
                                                        width: 60,
                                                        inputType: 'numberField',
                                                        icon: 'spreadIcon',
                                                        propertyName: 'shadow.spreadRadius',
                                                    },
                                                    {
                                                        type: 'colorPicker',
                                                        id: 'shadowStyleRow-color',
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
                                    id: 'customStyleCollapsiblePanel',
                                    propertyName: 'customStyle',
                                    label: 'Custom Style',
                                    labelAlign: 'right',
                                    ghost: true,
                                    parentId: 'styleRouter',
                                    collapsible: 'header',
                                    content: {
                                        id: 'stylePnl-M500-911MFR',
                                        components: [...new DesignerToolbarSettings()
                                            .addSettingsInput({
                                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                id: 'custom-css-412c-8461-4c8d55e5c073',
                                                propertyName: 'style',
                                                hideLabel: true,
                                                inputType: 'codeEditor',
                                                label: 'Style',
                                                description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                                            })
                                            .toJson()
                                        ]
                                    }
                                })
                                .toJson()]
                    },
                    {
                        key: '3',
                        title: 'Security',
                        id: '6Vw9iiDw9d0MD_Rh5cbIn',
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                readOnly: data.readOnly,
                                id: '1adea529-1f0c-4def-bd41-ee166a5dfcd7',
                                inputType: 'permissions',
                                propertyName: 'permissions',
                                label: 'Permissions',
                                size: 'small',
                                parentId: '6Vw9iiDw9d0MD_Rh5cbIn'
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