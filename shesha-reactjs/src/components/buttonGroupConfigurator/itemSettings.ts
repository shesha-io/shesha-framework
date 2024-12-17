import { repeatOptions } from '@/designer-components/_settings/utils/background/utils';
import { getBorderInputs, getCornerInputs } from '@/designer-components/_settings/utils/border/utils';
import { fontTypes, fontWeights, textAlign } from '@/designer-components/_settings/utils/font/utils';
import { buttonTypes } from '@/designer-components/button/util';
import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';

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
                            .addSettingsInput({
                                id: 'name-8b38-4b82-b192-563259afc159',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                inputType: 'text',
                                propertyName: 'name',
                                label: 'Name',
                                jsSetting: false,
                                hidden: data?.itemSubType !== 'button',
                                validate: {
                                    required: true
                                },
                            })
                            .addSettingsInputRow({
                                id: 'label-tooltip-s4gmBg31azZC0UjZjpfTm',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                readOnly: data?.readOnly,
                                hidden: data?.itemSubType !== 'button',
                                inputs: [
                                    {
                                        id: "A-qcRVk-qlnGDLtFvK-2X",
                                        type: "text",
                                        propertyName: "label",
                                        parentId: "root",
                                        label: "Label"
                                    },
                                    {
                                        id: "rupsZ1fuRwqetjQ0BC5sk",
                                        type: "textArea",
                                        propertyName: "tooltip",
                                        label: "Group Tooltip",
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
                                hidden: data?.itemSubType !== 'button',
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
                            .addSettingsInput({
                                id: "LKVj_90JMwALpmLN_6iZn",
                                inputType: "dropdown",
                                propertyName: "buttonType",
                                label: "Button Type",
                                labelAlign: "right",
                                parentId: "root",
                                hidden: data?.itemSubType !== 'button',
                                validate: {},
                                dropdownOptions: buttonTypes,
                                jsSetting: false
                            })
                            .addSettingsInputRow({
                                id: '12d700d6-ed4d-49d5-9cfd-fe8f0060f3b6',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                readOnly: data?.readOnly,
                                hidden: data?.itemSubType !== 'button',
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
                                label: 'Action configuration',
                                hidden: data?.itemSubType !== 'button',
                                validate: {},
                                settingsValidationErrors: [],
                            })
                            .addSettingsInput({
                                id: 'dynamic-items-config-8b38-4b82-b192-563259afc159',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                inputType: 'dynamicItemsConfigurator',
                                propertyName: 'nadynamicItemsConfigurationme',
                                label: 'Name',
                                jsSetting: false,
                                hidden: data?.itemSubType !== 'dynamic',
                                validate: {
                                    required: true
                                },
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
                                .addCollapsiblePanel({
                                    id: 'fontStyleCollapsiblePanel',
                                    propertyName: 'pnlFontStyle',
                                    label: 'Font',
                                    labelAlign: 'right',
                                    parentId: 'styleRouter',
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
                                                readOnly: data?.readOnly,
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
                                                        type: 'number',
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
                                                        type: 'color',
                                                        id: 'fontColor-s4gmBg31azZC0UjZjpfTm',
                                                        label: 'Color',
                                                        hideLabel: true,
                                                        propertyName: 'font.color',
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
                                    parentId: 'styleRouter',
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
                                                readOnly: data?.readOnly,
                                                inputs: [
                                                    {
                                                        type: 'text',
                                                        id: 'width-s4gmBg31azZC0UjZjpfTm',
                                                        label: "Width",
                                                        width: 85,
                                                        propertyName: "dimensions.width",
                                                        icon: "widthIcon",
                                                        tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"

                                                    },
                                                    {
                                                        type: 'text',
                                                        id: 'minWidth-s4gmBg31azZC0UjZjpfTm',
                                                        label: "Min Width",
                                                        width: 85,
                                                        hideLabel: true,
                                                        propertyName: "dimensions.minWidth",
                                                        icon: "minWidthIcon",
                                                    },
                                                    {
                                                        type: 'text',
                                                        id: 'maxWidth-s4gmBg31azZC0UjZjpfTm',
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
                                                readOnly: data?.readOnly,
                                                inputs: [
                                                    {
                                                        type: 'text',
                                                        id: 'height-s4gmBg31azZC0UjZjpfTm',
                                                        label: "Height",
                                                        width: 85,
                                                        propertyName: "dimensions.height",
                                                        icon: "heightIcon",
                                                        tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"
                                                    },
                                                    {
                                                        type: 'text',
                                                        id: 'minHeight-s4gmBg31azZC0UjZjpfTm',
                                                        label: "Min Height",
                                                        width: 85,
                                                        hideLabel: true,
                                                        propertyName: "dimensions.minHeight",
                                                        icon: "minHeightIcon",
                                                    },
                                                    {
                                                        type: 'text',
                                                        id: 'maxHeight-s4gmBg31azZC0UjZjpfTm',
                                                        label: "Max Height",
                                                        width: 85,
                                                        hideLabel: true,
                                                        propertyName: "dimensions.maxHeight",
                                                        icon: "maxHeightIcon",
                                                    }
                                                ]
                                            })
                                            .addSettingsInput({
                                                id: 'predefinedSizes',
                                                inputType: 'dropdown',
                                                propertyName: 'size',
                                                label: 'Size',
                                                width: '150px',
                                                hidden: data?.dimensions?.width || data?.dimensions?.height,
                                                dropdownOptions: [
                                                    { value: 'small', label: 'Small' },
                                                    { value: 'medium', label: 'Medium' },
                                                    { value: 'large', label: 'Large' },
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
                                    parentId: 'styleRouter',
                                    collapsible: 'header',
                                    content: {
                                        id: 'borderStylePnl',
                                        components: [...new DesignerToolbarSettings()
                                            .addSettingsInputRow({
                                                id: `borderStyleRow`,
                                                parentId: 'borderStylePnl',
                                                hidden: { _code: 'return  !getSettingValue(data?.border?.hideBorder);', _mode: 'code', _value: false } as any,
                                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                inputs: [
                                                    {
                                                        type: 'button',
                                                        id: 'borderStyleRow-hideBorder',
                                                        label: "Border",
                                                        hideLabel: true,
                                                        propertyName: "border.hideBorder",
                                                        icon: "EyeOutlined",
                                                        iconAlt: "EyeInvisibleOutlined"
                                                    },
                                                ]
                                            })
                                            .addSettingsInputRow(
                                                getBorderInputs(false)[0] as any
                                            )
                                            .addSettingsInputRow(
                                                getBorderInputs(false)[1] as any
                                            )
                                            .addSettingsInputRow(
                                                getBorderInputs(false)[2] as any
                                            )
                                            .addSettingsInputRow(
                                                getBorderInputs(false)[3] as any
                                            )
                                            .addSettingsInputRow(
                                                getBorderInputs(false)[4] as any
                                            )
                                            .addSettingsInputRow(
                                                getCornerInputs()[0] as any
                                            )
                                            .addSettingsInputRow(
                                                getCornerInputs()[1] as any
                                            )
                                            .addSettingsInputRow(
                                                getCornerInputs()[2] as any
                                            )
                                            .addSettingsInputRow(
                                                getCornerInputs()[3] as any
                                            )
                                            .addSettingsInputRow(
                                                getCornerInputs()[4] as any
                                            )
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
                                    parentId: 'styleRouter',
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
                                                    buttonGroupOptions: [
                                                        {
                                                            value: "color",
                                                            icon: "FormatPainterOutlined",
                                                            title: "Color"
                                                        },
                                                        {
                                                            value: "gradient",
                                                            icon: "BgColorsOutlined",
                                                            title: "Gradient"
                                                        },
                                                        {
                                                            value: "image",
                                                            icon: "PictureOutlined",
                                                            title: "Image"
                                                        },
                                                        {
                                                            value: "url",
                                                            icon: "LinkOutlined",
                                                            title: "URL"
                                                        },
                                                        {
                                                            value: "storedFile",
                                                            icon: "DatabaseOutlined",
                                                            title: "Stored File"
                                                        }
                                                    ],
                                                    readOnly: data.readOnly,
                                                })
                                                .addSettingsInputRow({
                                                    id: "backgroundStyleRow-color",
                                                    parentId: "backgroundStylePnl",
                                                    inputs: [{
                                                        type: 'color',
                                                        id: 'backgroundStyleRow-color',
                                                        label: "Color",
                                                        propertyName: "background.color",
                                                        hideLabel: true,
                                                        jsSetting: false,
                                                    }],
                                                    hidden: {
                                                        _value: false,
                                                        _code: "return getSettingValue(data?.background.type) !== 'color';",
                                                        _mode: "code"
                                                    },
                                                    readOnly: data.readOnly,
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
                                                    hidden: {
                                                        _value: false,
                                                        _code: "return getSettingValue(data?.background.type) !== 'gradient';",
                                                        _mode: "code"
                                                    },
                                                    hideLabel: true,
                                                    readOnly: data.readOnly,
                                                })
                                                .addSettingsInputRow({
                                                    id: "backgroundStyle-url",
                                                    parentId: "backgroundStylePnl",
                                                    inputs: [{
                                                        type: 'text',
                                                        id: 'backgroundStyle-url',
                                                        propertyName: "background.url",
                                                        jsSetting: false,
                                                        label: "URL",
                                                    }],
                                                    hidden: {
                                                        _value: false,
                                                        _code: "return getSettingValue(data?.background.type) !== 'url';",
                                                        _mode: "code"
                                                    },
                                                    readOnly: data.readOnly,
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
                                                    hidden: {
                                                        _value: false,
                                                        _code: "return getSettingValue(data?.background.type) !== 'image';",
                                                        _mode: "code"
                                                    },
                                                    readOnly: data.readOnly,
                                                })
                                                .addSettingsInputRow({
                                                    id: "backgroundStyleRow-storedFile",
                                                    parentId: 'backgroundStylePnl',
                                                    hidden: {
                                                        _value: false,
                                                        _code: "return getSettingValue(data?.background.type) !== 'storedFile';",
                                                        _mode: "code"
                                                    },
                                                    readOnly: data.readOnly,
                                                    inputs: [
                                                        {
                                                            type: 'text',
                                                            id: 'backgroundStyle-storedFile',
                                                            jsSetting: false,
                                                            propertyName: "background.storedFile.id",
                                                            label: "File ID"
                                                        }
                                                    ]
                                                })
                                                .addSettingsInputRow({
                                                    id: "backgroundStyleRow-controls",
                                                    parentId: 'backgroundStyleRow',
                                                    inline: true,
                                                    readOnly: data.readOnly,
                                                    inputs: [
                                                        {
                                                            type: 'customDropdown',
                                                            id: 'backgroundStyleRow-size',
                                                            label: "Size",
                                                            hideLabel: true,
                                                            propertyName: "background.size",
                                                            dropdownOptions: [
                                                                {
                                                                    value: "cover",
                                                                    label: "Cover"
                                                                },
                                                                {
                                                                    value: "contain",
                                                                    label: "Contain"
                                                                },
                                                                {
                                                                    value: "auto",
                                                                    label: "Auto"
                                                                }
                                                            ],
                                                        },
                                                        {
                                                            type: 'customDropdown',
                                                            id: 'backgroundStyleRow-position',
                                                            label: "Position",
                                                            hideLabel: true,
                                                            propertyName: "background.position",
                                                            dropdownOptions: [
                                                                {
                                                                    value: "center",
                                                                    label: "Center"
                                                                },
                                                                {
                                                                    value: "top",
                                                                    label: "Top"
                                                                },
                                                                {
                                                                    value: "left",
                                                                    label: "Left"
                                                                },
                                                                {
                                                                    value: "right",
                                                                    label: "Right"
                                                                },
                                                                {
                                                                    value: "bottom",
                                                                    label: "Bottom"
                                                                },
                                                                {
                                                                    value: "top left",
                                                                    label: "Top Left"
                                                                },
                                                                {
                                                                    value: "top right",
                                                                    label: "Top Right"
                                                                },
                                                                {
                                                                    value: "bottom left",
                                                                    label: "Bottom Left"
                                                                },
                                                                {
                                                                    value: "bottom right",
                                                                    label: "Bottom Right"
                                                                }
                                                            ],
                                                        },
                                                        {
                                                            type: 'dropdown',
                                                            id: 'backgroundStyleRow-repeat',
                                                            label: "Repeat",
                                                            hideLabel: true,
                                                            propertyName: "background.repeat",
                                                            dropdownOptions: repeatOptions,
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
                                    parentId: 'styleRouter',
                                    collapsible: 'header',
                                    content: {
                                        id: 'shadowStylePnl',
                                        components: [...new DesignerToolbarSettings()
                                            .addSettingsInputRow({
                                                id: 'shadowStyleRow',
                                                parentId: 'shadowStylePnl',
                                                inline: true,
                                                readOnly: data.readOnly,
                                                inputs: [
                                                    {
                                                        type: 'number',
                                                        id: 'shadowStyleRow-offsetX',
                                                        label: 'Offset X',
                                                        hideLabel: true,
                                                        width: 60,
                                                        icon: "offsetHorizontalIcon",
                                                        propertyName: 'shadow.offsetX',
                                                    },
                                                    {
                                                        type: 'number',
                                                        id: 'shadowStyleRow-offsetY',
                                                        label: 'Offset Y',
                                                        hideLabel: true,
                                                        width: 60,
                                                        icon: 'offsetVerticalIcon',
                                                        propertyName: 'shadow.offsetY',
                                                    },
                                                    {
                                                        type: 'number',
                                                        id: 'shadowStyleRow-blurRadius',
                                                        label: 'Blur',
                                                        hideLabel: true,
                                                        width: 60,
                                                        icon: 'blurIcon',
                                                        propertyName: 'shadow.blurRadius',
                                                    },
                                                    {
                                                        type: 'number',
                                                        id: 'shadowStyleRow-spreadRadius',
                                                        label: 'Spread',
                                                        hideLabel: true,
                                                        width: 60,
                                                        icon: 'spreadIcon',
                                                        propertyName: 'shadow.spreadRadius',
                                                    },
                                                    {
                                                        type: 'color',
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
                                    id: 'styleCollapsiblePanel',
                                    propertyName: 'stylingBox',
                                    label: 'Margin & Padding',
                                    labelAlign: 'right',
                                    ghost: true,
                                    collapsible: 'header',
                                    content: {
                                        id: 'stylePnl-M5-911',
                                        components: [...new DesignerToolbarSettings()
                                            .addStyleBox({
                                                id: 'styleBoxPnl',
                                                label: 'Margin Padding',
                                                hideLabel: true,
                                                propertyName: 'stylingBox',
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
                                                readOnly: data.readOnly,
                                                id: 'custom-css-412c-8461-4c8d55e5c073',
                                                inputType: 'codeEditor',
                                                propertyName: 'style',
                                                hideLabel: true,
                                                label: 'Style',
                                                description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                                            })
                                            .toJson()
                                        ]
                                    }
                                })
                                .toJson()]
                    }, ,
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
            wrapperCol: { span: 24 }
        }
    };
};