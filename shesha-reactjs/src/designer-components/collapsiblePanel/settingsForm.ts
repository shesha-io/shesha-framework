import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { getBorderInputs, getCornerInputs } from '../_settings/utils/border/utils';
import { positionOptions, repeatOptions, sizeOptions } from '../_settings/utils/background/utils';
import { fontTypes, fontWeights, textAlign } from '../_settings/utils/font/utils';
import { nanoid } from '@/utils/uuid';
import { overflowOptions } from '../_settings/utils/dimensions/utils';

export const getSettings = () => {
    return {
        components: new DesignerToolbarSettings()
            .addSearchableTabs({
                id: 'panelpanel-W_m7doMyCpCYwAYDfRh6I',
                propertyName: 'settingsTabs',
                parentId: 'root',
                label: 'Settings',
                hideLabel: true,
                labelAlign: 'right',
                size: 'small',
                tabs: [
                    {
                        id: 'panels4gmBg31azZC0UjZjpfTm',
                        key: '1',
                        title: 'Common',
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                inputType: 'textField',
                                id: 'panel5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
                                propertyName: 'componentName',
                                parentId: 'b8954bf6-f76d-4139-a850-c99bf06c8b69',
                                label: 'Component name',
                                validate: {
                                    required: true
                                },
                                jsSetting: false
                            })
                            .addSettingsInput({
                                id: 'panel46d07439-4c18-468c-89e1-60c002ce96c5',
                                propertyName: 'label',
                                parentId: 'b8954bf6-f76d-4139-a850-c99bf06c8b69',
                                label: 'Label',
                                jsSetting: true
                            })
                            .addSettingsInput({
                                id: 'panelcfd7d45e-c7e3-4a27-987b-dc525c412558',
                                propertyName: 'hasCustomHeader',
                                parentId: 'b8954bf6-f76d-4139-a850-c99bf06c8b69',
                                label: 'Custom Header',
                                inputType: 'switch',
                                jsSetting: true
                            })
                            .addSettingsInput({
                                id: 'panel57a40a33-7e08-4ce4-9f08-a34d24a83338',
                                propertyName: 'expandIconPosition',
                                parentId: 'b8954bf6-f76d-4139-a850-c99bf06c8b69',
                                label: 'Icon position',
                                inputType: 'dropdown',
                                jsSetting: true,
                                dropdownOptions: [
                                    {
                                        label: 'Hide',
                                        value: 'hide',
                                    },
                                    {
                                        label: 'Start',
                                        value: 'start',
                                    },
                                    {
                                        label: 'End',
                                        value: 'end',
                                    }
                                ],
                                validate: {},
                            })
                            .addSettingsInput({
                                id: 'panel-wshDLo-lK468vwxVVBDMh',
                                propertyName: 'collapsible',
                                label: 'Collapsible',
                                inputType: 'dropdown',
                                jsSetting: true,
                                parentId: 'b8954bf6-f76d-4139-a850-c99bf06c8b69',
                                dropdownOptions: [
                                    {
                                        label: 'Header',
                                        value: 'header',
                                    },
                                    {
                                        label: 'Icon',
                                        value: 'icon',
                                    },
                                    {
                                        label: 'Disabled',
                                        value: 'disabled',
                                    }
                                ],
                                validate: {},
                                version: 3
                            })
                            .addSettingsInputRow({
                                id: 'collapsedByDefault-ghost-row',
                                parentId: 'b8954bf6-f76d-4139-a850-c99bf06c8b69',
                                readOnly: { _code: 'return  getSettingValue(data?.ghost);', _mode: 'code', _value: false } as any,
                                inputs: [
                                    {
                                        id: 'panel-wYzLo-lK468vwxVVBDMh',
                                        propertyName: 'collapsedByDefault',
                                        label: 'Collapsed by default',
                                        labelAlign: 'right',
                                        type: 'switch',
                                        parentId: 'b8954bf6-f76d-4139-a850-c99bf06c8b69',
                                        hidden: false,
                                        isDynamic: false,
                                        description: '',
                                        jsSetting: true,
                                        validate: {},
                                    },
                                    {
                                        id: 'panel-wYzLo-lK468vwxVVBDMh',
                                        label: 'Ghost',
                                        propertyName: 'ghost',
                                        type: 'switch',
                                        parentId: 'b8954bf6-f76d-4139-a850-c99bf06c8b69',
                                        jsSetting: true
                                    }
                                ]
                            })
                            .addSettingsInputRow({
                                id: 'isSimpleDesign-hideTopBar-row',
                                parentId: 'b8954bf6-f76d-4139-a850-c99bf06c8b69',
                                readOnly: { _code: 'return  getSettingValue(data?.hideCollapseContent);', _mode: 'code', _value: false } as any,
                                inputs: [
                                    {
                                        id: 'panelcfd7d45e-smpl-4a27-987b-dc525c412448',
                                        propertyName: 'isSimpleDesign',
                                        parentId: 'b8954bf6-f76d-4139-a850-c99bf06c8b69',
                                        label: 'Simple Design',
                                        type: 'switch',
                                        jsSetting: true
                                    },
                                    {
                                        id: 'panel7e5fc1c1-a804-4f0a-8327-1a92e963e5e1',
                                        propertyName: 'hideCollapseContent',
                                        label: 'Hide Top Bar',
                                        labelAlign: 'right',
                                        type: 'switch',
                                        parentId: 'b8954bf6-f76d-4139-a850-c99bf06c8b69',
                                        description: 'Hides the collapsible panel',
                                        jsSetting: true
                                    }

                                ]
                            })
                            .addSettingsInputRow({
                                id: 'hide-when-empty-row',
                                parentId: 'b8954bf6-f76d-4139-a850-c99bf06c8b69',
                                readOnly: { _code: 'return  getSettingValue(data?.hideWhenEmpty);', _mode: 'code', _value: false } as any,
                                inputs: [
                                    {
                                        id: 'panelBC7507ED-ADB6-4D2E-BD37-F5DD51EFF45D',
                                        propertyName: 'hideWhenEmpty',
                                        label: 'Hide when empty',
                                        labelAlign: 'right',
                                        parentId: 'bc67960e-77e3-40f2-89cc-f18f94678cce',
                                        type: 'switch',
                                        jsSetting: true,
                                        description: 'Allows to hide the panel when all components are hidden due to some conditions',

                                    },
                                    {
                                        id: 'panelcfd7d45e-c7e3-4a27-987b-dc525c412448',
                                        propertyName: 'hidden',
                                        parentId: 'b8954bf6-f76d-4139-a850-c99bf06c8b69',
                                        label: 'hide',
                                        type: 'switch',
                                        jsSetting: true
                                    }
                                ]
                            })
                            .toJson()]
                    },
                    {
                        key: '2',
                        title: 'Appearance',
                        id: 'panelelgrlievlfwehhh848r8hsdnflsdnclurbd',
                        components: [...new DesignerToolbarSettings()
                            .addPropertyRouter({
                                id: 'panelstyleRouter',
                                propertyName: 'propertyRouter1',
                                componentName: 'propertyRouter',
                                label: 'Property router1',
                                labelAlign: 'right',
                                parentId: 'elgrlievlfwehhh848r8hsdnflsdnclurbd',
                                hidden: false,
                                propertyRouteName: {
                                    _mode: "code",
                                    _code: "    return contexts.canvasContext?.designerDevice || 'desktop';",
                                    _value: ""
                                },
                                components: [
                                    ...new DesignerToolbarSettings()
                                        .addCollapsiblePanel({
                                            id: 'paneldimensionsStyleCollapsiblePanel',
                                            propertyName: 'pnlDimensions',
                                            label: 'Dimensions',
                                            parentId: 'styleRouter',
                                            labelAlign: 'right',
                                            ghost: true,
                                            collapsible: 'header',
                                            content: {
                                                id: 'paneldimensionsStylePnl',
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInputRow({
                                                        id: 'paneldimensionsStyleRowWidth',
                                                        parentId: 'dimensionsStylePnl',
                                                        inline: true,
                                                        readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                        inputs: [
                                                            {
                                                                type: 'textField',
                                                                id: 'panelwidth-s4gmBg31azZC0UjZjpfTm',
                                                                label: "Width",
                                                                width: 85,
                                                                propertyName: "dimensions.width",
                                                                icon: "widthIcon",
                                                                tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"
                                                            },
                                                            {
                                                                type: 'textField',
                                                                id: 'panelminWidth-s4gmBg31azZC0UjZjpfTm',
                                                                label: "Min Width",
                                                                width: 85,
                                                                hideLabel: true,
                                                                propertyName: "dimensions.minWidth",
                                                                icon: "minWidthIcon",
                                                            },
                                                            {
                                                                type: 'textField',
                                                                id: 'panelmaxWidth-s4gmBg31azZC0UjZjpfTm',
                                                                label: "Max Width",
                                                                width: 85,
                                                                hideLabel: true,
                                                                propertyName: "dimensions.maxWidth",
                                                                icon: "maxWidthIcon",
                                                            }
                                                        ]
                                                    })
                                                    .addSettingsInputRow({
                                                        id: 'paneldimensionsStyleRowHeight',
                                                        parentId: 'dimensionsStylePnl',
                                                        inline: true,
                                                        readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                        inputs: [
                                                            {
                                                                type: 'textField',
                                                                id: 'panelheight-s4gmBg31azZC0UjZjpfTm',
                                                                label: "Height",
                                                                width: 85,
                                                                propertyName: "dimensions.height",
                                                                icon: "heightIcon",
                                                                tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"
                                                            },
                                                            {
                                                                type: 'textField',
                                                                id: 'panelminHeight-s4gmBg31azZC0UjZjpfTm',
                                                                label: "Min Height",
                                                                width: 85,
                                                                hideLabel: true,
                                                                propertyName: "dimensions.minHeight",
                                                                icon: "minHeightIcon",
                                                            },
                                                            {
                                                                type: 'textField',
                                                                id: 'panelmaxHeight-s4gmBg31azZC0UjZjpfTm',
                                                                label: "Max Height",
                                                                width: 85,
                                                                hideLabel: true,
                                                                propertyName: "dimensions.maxHeight",
                                                                icon: "maxHeightIcon",
                                                            }
                                                        ]
                                                    })
                                                    .addSettingsInput({
                                                        id: nanoid(),
                                                        parentId: 'displayCollapsiblePanel',
                                                        inline: true,
                                                        inputType: 'dropdown',
                                                        label: 'Overflow',
                                                        defaultValue: 'auto',
                                                        propertyName: 'overflow',
                                                        dropdownOptions: overflowOptions
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: 'panelborderStyleCollapsiblePanel',
                                            propertyName: 'pnlBorderStyle',
                                            label: 'Border',
                                            labelAlign: 'right',
                                            ghost: true,
                                            parentId: 'styleRouter',
                                            collapsible: 'header',
                                            hidden: { _code: 'return  getSettingValue(data?.ghost) || getSettingValue(data?.isSimpleDesign);', _mode: 'code', _value: false } as any,
                                            content: {
                                                id: 'panelborderStylePnl',
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInputRow({
                                                        id: `borderStyleRow`,
                                                        parentId: 'borderStylePnl',
                                                        hidden: { _code: 'return  !getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.border?.hideBorder);', _mode: 'code', _value: false } as any,
                                                        readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                        inputs: [
                                                            {
                                                                type: 'button',
                                                                id: 'panelborderStyleRow-hideBorder',
                                                                label: "Border",
                                                                hideLabel: true,
                                                                propertyName: "border.hideBorder",
                                                                icon: "EyeOutlined",
                                                                iconAlt: "EyeInvisibleOutlined"
                                                            },
                                                        ]
                                                    })
                                                    .addContainer({
                                                        id: 'borderStyleRow',
                                                        parentId: 'borderStylePnl',
                                                        components: getBorderInputs() as any
                                                    })
                                                    .addContainer({
                                                        id: 'borderRadiusStyleRow',
                                                        parentId: 'borderStylePnl',
                                                        components: getCornerInputs() as any
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: 'panelbackgroundStyleCollapsiblePanel',
                                            propertyName: 'pnlBackgroundStyle',
                                            label: 'Background',
                                            labelAlign: 'right',
                                            ghost: true,
                                            parentId: 'styleRouter',
                                            collapsible: 'header',
                                            hidden: { _code: 'return  getSettingValue(data?.ghost) || getSettingValue(data?.isSimpleDesign);', _mode: 'code', _value: false } as any,
                                            content: {
                                                id: 'panelbackgroundStylePnl',
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
                                                            readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                        })
                                                        .addSettingsInputRow({
                                                            id: "backgroundStyleRow-color",
                                                            parentId: "backgroundStylePnl",
                                                            inputs: [{
                                                                type: 'colorPicker',
                                                                id: 'panelbackgroundStyleRow-color',
                                                                label: "Color",
                                                                propertyName: "background.color",
                                                                hideLabel: true,
                                                                jsSetting: false,
                                                            }],
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "color";', _mode: 'code', _value: false } as any,
                                                            readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                        })
                                                        .addSettingsInputRow({
                                                            id: "backgroundStyle-gradientColors",
                                                            parentId: "backgroundStylePnl",
                                                            inputs: [{
                                                                type: 'multiColorPicker',
                                                                id: 'panelbackgroundStyle-gradientColors',
                                                                propertyName: "background.gradient.colors",
                                                                label: "Colors",
                                                                jsSetting: false,
                                                            }
                                                            ],
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "gradient";', _mode: 'code', _value: false } as any,
                                                            hideLabel: true,
                                                            readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                        })
                                                        .addSettingsInputRow({
                                                            id: "backgroundStyle-url",
                                                            parentId: "backgroundStylePnl",
                                                            inputs: [{
                                                                type: 'textField',
                                                                id: 'panelbackgroundStyle-url',
                                                                propertyName: "background.url",
                                                                jsSetting: false,
                                                                label: "URL",
                                                            }],
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "url";', _mode: 'code', _value: false } as any,
                                                            readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                        })
                                                        .addSettingsInputRow({
                                                            id: "backgroundStyle-image",
                                                            parentId: 'backgroundStylePnl',
                                                            inputs: [{
                                                                type: 'imageUploader',
                                                                id: 'panelbackgroundStyle-image',
                                                                propertyName: 'background.uploadFile',
                                                                label: "Image",
                                                                jsSetting: false,
                                                            }],
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "image";', _mode: 'code', _value: false } as any,
                                                            readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                        })
                                                        .addSettingsInputRow({
                                                            id: "backgroundStyleRow-storedFile",
                                                            parentId: 'backgroundStylePnl',
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "storedFile";', _mode: 'code', _value: false } as any,
                                                            readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                            inputs: [
                                                                {
                                                                    type: 'textField',
                                                                    id: 'panelbackgroundStyle-storedFile',
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
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                                                            readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                            inputs: [
                                                                {
                                                                    type: 'customDropdown',
                                                                    id: 'panelbackgroundStyleRow-size',
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
                                                                    id: 'panelbackgroundStyleRow-position',
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
                                                                    type: 'radio',
                                                                    id: 'panelbackgroundStyleRow-repeat',
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
                                            id: 'panelshadowStyleCollapsiblePanel',
                                            propertyName: 'pnlShadowStyle',
                                            label: 'Shadow',
                                            labelAlign: 'right',
                                            ghost: true,
                                            hidden: { _code: 'return  getSettingValue(data?.ghost) || getSettingValue(data?.isSimpleDesign);', _mode: 'code', _value: false } as any,
                                            parentId: 'styleRouter',
                                            collapsible: 'header',
                                            content: {
                                                id: 'panelshadowStylePnl',
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInputRow({
                                                        id: 'panelshadowStyleRow',
                                                        parentId: 'shadowStylePnl',
                                                        inline: true,
                                                        readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                        inputs: [
                                                            {
                                                                type: 'numberField',
                                                                id: 'panelshadowStyleRow-offsetX',
                                                                label: 'Offset X',
                                                                hideLabel: true,
                                                                width: 60,
                                                                icon: "offsetHorizontalIcon",
                                                                propertyName: 'shadow.offsetX',
                                                            },
                                                            {
                                                                type: 'numberField',
                                                                id: 'panelshadowStyleRow-offsetY',
                                                                label: 'Offset Y',
                                                                hideLabel: true,
                                                                width: 60,
                                                                icon: 'offsetVerticalIcon',
                                                                propertyName: 'shadow.offsetY',
                                                            },
                                                            {
                                                                type: 'numberField',
                                                                id: 'panelshadowStyleRow-blurRadius',
                                                                label: 'Blur',
                                                                hideLabel: true,
                                                                width: 60,
                                                                icon: 'blurIcon',
                                                                propertyName: 'shadow.blurRadius',
                                                            },
                                                            {
                                                                type: 'numberField',
                                                                id: 'panelshadowStyleRow-spreadRadius',
                                                                label: 'Spread',
                                                                hideLabel: true,
                                                                width: 60,
                                                                icon: 'spreadIcon',
                                                                propertyName: 'shadow.spreadRadius',
                                                            },
                                                            {
                                                                type: 'colorPicker',
                                                                id: 'panelshadowStyleRow-color',
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
                                            id: 'panelstyleCollapsiblePanel',
                                            propertyName: 'stylingBox',
                                            label: 'Margin & Padding',
                                            labelAlign: 'right',
                                            ghost: true,
                                            collapsible: 'header',
                                            content: {
                                                id: 'panelstylePnl-M5-911',
                                                components: [...new DesignerToolbarSettings()
                                                    .addStyleBox({
                                                        id: 'panelstyleBoxPnl',
                                                        label: 'Margin Padding',
                                                        hideLabel: true,
                                                        propertyName: 'stylingBox',
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: 'panelcustomStyleCollapsiblePanel',
                                            propertyName: 'customStyle',
                                            label: 'Custom Styles',
                                            labelAlign: 'right',
                                            ghost: true,
                                            parentId: 'styleRouter',
                                            collapsible: 'header',
                                            content: {
                                                id: 'panelstylePnl-M500-911MFR',
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInput({
                                                        readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                        id: 'panelcustom-css-412c-8461-4c8d55e5c073',
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
                                        .addCollapsiblePanel({
                                            id: 'panel-header-collapsible',
                                            propertyName: 'header',
                                            label: 'Header Style',
                                            labelAlign: 'right',
                                            ghost: true,
                                            collapsible: 'header',
                                            collapsedByDefault: true,
                                            parentId: 'styleRouter',
                                            content: {
                                                id: 'panel-header-styles-pnl',
                                                components: [...new DesignerToolbarSettings()
                                                    .addCollapsiblePanel({
                                                        id: 'panelheaderfontStyleCollapsiblePanel',
                                                        propertyName: 'pnlFontStyle',
                                                        label: 'Font',
                                                        labelAlign: 'right',
                                                        collapsedByDefault: true,
                                                        parentId: 'panel-header-styles-pnl',
                                                        collapsible: 'header',
                                                        content: {
                                                            id: 'panelheaderfontStylePnl',
                                                            components: [...new DesignerToolbarSettings()
                                                                .addSettingsInputRow({
                                                                    id: 'try26voxhs-HxJ5k5ngYE',
                                                                    parentId: 'panel-header-s,ktyles-pnl',
                                                                    inline: true,
                                                                    propertyName: 'font',
                                                                    readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                                    inputs: [
                                                                        {
                                                                            type: 'dropdown',
                                                                            id: 'fontFamily-s4gmBg31azZC0UjZjpfTm',
                                                                            label: 'Font',
                                                                            hideLabel: true,
                                                                            propertyName: 'headerStyles.font.type',
                                                                            dropdownOptions: fontTypes,
                                                                        },
                                                                        {
                                                                            type: 'numberField',
                                                                            id: 'fontSize-s4gmBg31azZC0UjZjpfTm',
                                                                            label: 'Size',
                                                                            propertyName: 'headerStyles.font.size',
                                                                            hideLabel: true,
                                                                            width: 50,
                                                                        },
                                                                        {
                                                                            type: 'dropdown',
                                                                            id: 'fontWeight-s4gmBg31azZC0UjZjpfTm',
                                                                            label: 'Weight',
                                                                            propertyName: 'headerStyles.font.weight',
                                                                            hideLabel: true,
                                                                            tooltip: "Controls text thickness (light, normal, bold, etc.)",
                                                                            dropdownOptions: fontWeights,
                                                                            width: 100,
                                                                        },
                                                                        {
                                                                            type: 'colorPicker',
                                                                            id: 'fontColor-s4gmBg31azZC0UjZjpfTm',
                                                                            label: 'Color',
                                                                            hideLabel: true,
                                                                            propertyName: 'headerStyles.font.color',
                                                                        },
                                                                        {
                                                                            type: 'dropdown',
                                                                            id: 'fontAlign-s4gmBg31azZC0UjZjpfTm',
                                                                            label: 'Align',
                                                                            propertyName: 'headerStyles.font.align',
                                                                            hideLabel: true,
                                                                            width: 60,
                                                                            dropdownOptions: textAlign,
                                                                        },
                                                                    ],
                                                                })
                                                                .toJson()]
                                                        }
                                                    })
                                                    .addCollapsiblePanel({
                                                        id: 'panelheaderdimensionsStyleCollapsiblePanel',
                                                        propertyName: 'pnlDimensionsStyle',
                                                        label: 'Dimensions',
                                                        labelAlign: 'right',
                                                        collapsedByDefault: true,
                                                        parentId: 'panel-header-styles-pnl',
                                                        collapsible: 'header',
                                                        content: {
                                                            id: 'panelheaderdimensionsStylePnl',
                                                            components: [...new DesignerToolbarSettings()
                                                                .addSettingsInputRow({
                                                                    id: 'header-dimensionsStyleRowHeight',
                                                                    parentId: 'panel-header-styles-pnl',
                                                                    inline: true,
                                                                    readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                                    inputs: [
                                                                        {
                                                                            type: 'textField',
                                                                            id: 'header-height-s4gmBg31azZC0UjZjpfTm',
                                                                            label: "Height",
                                                                            width: 85,
                                                                            propertyName: "headerStyles.dimensions.height",
                                                                            icon: "heightIcon",
                                                                            tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"
                                                                        },
                                                                        {
                                                                            type: 'textField',
                                                                            id: 'header-minHeight-s4gmBg31azZC0UjZjpfTm',
                                                                            label: "Min Height",
                                                                            width: 85,
                                                                            hideLabel: true,
                                                                            propertyName: "headerStyles.dimensions.minHeight",
                                                                            icon: "minHeightIcon",
                                                                        },
                                                                        {
                                                                            type: 'textField',
                                                                            id: 'header-maxHeight-s4gmBg31azZC0UjZjpfTm',
                                                                            label: "Max Height",
                                                                            width: 85,
                                                                            hideLabel: true,
                                                                            propertyName: "headerStyles.dimensions.maxHeight",
                                                                            icon: "maxHeightIcon",
                                                                        }
                                                                    ]
                                                                })
                                                                .toJson()]
                                                        }
                                                    })
                                                    .addCollapsiblePanel({
                                                        id: 'panelheaderborderStyleCollapsiblePanel',
                                                        propertyName: 'pnlBorderStyle',
                                                        label: 'Border',
                                                        labelAlign: 'right',
                                                        collapsedByDefault: true,
                                                        parentId: 'panel-header-styles-pnl',
                                                        content: {
                                                            id: 'panelheaderborderStylePnl',
                                                            components: [...new DesignerToolbarSettings()
                                                                .addSettingsInputRow({
                                                                    id: nanoid(),
                                                                    parentId: 'panelheaderborderStylePnl',
                                                                    hidden: { _code: 'return  !getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.headerStyles?.border?.hideBorder);', _mode: 'code', _value: false } as any,
                                                                    readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                                    inputs: [
                                                                        {
                                                                            type: 'button',
                                                                            id: 'panel-header-borderStyleRow-hideBorder',
                                                                            label: "Border",
                                                                            hideLabel: true,
                                                                            propertyName: "headerStyles.border.hideBorder",
                                                                            icon: "EyeOutlined",
                                                                            iconAlt: "EyeInvisibleOutlined"
                                                                        },
                                                                    ]
                                                                })
                                                                .addContainer({
                                                                    id: 'borderStyleRow',
                                                                    parentId: 'borderStylePnl',
                                                                    components: getBorderInputs('headerStyles', true) as any
                                                                })
                                                                .addContainer({
                                                                    id: 'borderRadiusStyleRow',
                                                                    parentId: 'borderStylePnl',
                                                                    components: getCornerInputs('headerStyles', true) as any
                                                                })
                                                                .toJson()]
                                                        }
                                                    })
                                                    .addCollapsiblePanel({
                                                        id: 'panelheaderbackgroundStyleCollapsiblePanel',
                                                        propertyName: 'pnlBackgroundStyle',
                                                        label: 'Background',
                                                        labelAlign: 'right',
                                                        collapsedByDefault: true,
                                                        parentId: 'panel-header-styles-pnl',
                                                        collapsible: 'header',
                                                        content: {
                                                            id: 'panelheaderbackgroundStylePnl',
                                                            components: [...new DesignerToolbarSettings()
                                                                .addSettingsInput({
                                                                    id: "header-backgroundStyleRow-selectType",
                                                                    parentId: "styleRouter",
                                                                    label: "Type",
                                                                    jsSetting: false,
                                                                    propertyName: "headerStyles.background.type",
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
                                                                    readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                                })
                                                                .addSettingsInputRow({
                                                                    id: "header-backgroundStyleRow-color",
                                                                    parentId: "panel-header-styles-pnl",
                                                                    inputs: [{
                                                                        type: 'colorPicker',
                                                                        id: 'backgroundStyleRow-color',
                                                                        label: "Color",
                                                                        propertyName: "headerStyles.background.color",
                                                                        hideLabel: true,
                                                                        jsSetting: false,
                                                                    }],
                                                                    hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.headerStyles?.background?.type) !== "color";', _mode: 'code', _value: false } as any,
                                                                    readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                                })
                                                                .addSettingsInputRow({
                                                                    id: nanoid(),
                                                                    parentId: "panel-header-styles-pnl",
                                                                    inputs: [{
                                                                        type: 'multiColorPicker',
                                                                        id: 'backgroundStyle-gradientColors',
                                                                        propertyName: "headerStyles.background.gradient.colors",
                                                                        label: "Colors",
                                                                        jsSetting: false,
                                                                    }
                                                                    ],
                                                                    hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.headerStyles?.background?.type) !== "gradient";', _mode: 'code', _value: false } as any,
                                                                    hideLabel: true,
                                                                    readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                                })
                                                                .addSettingsInputRow({
                                                                    id: nanoid(),
                                                                    parentId: "panel-header-styles-pnl",
                                                                    inputs: [{
                                                                        type: 'textField',
                                                                        id: 'backgroundStyle-url',
                                                                        propertyName: "headerStyles.background.url",
                                                                        jsSetting: false,
                                                                        label: "URL",
                                                                    }],
                                                                    hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.headerStyles?.background?.type) !== "url";', _mode: 'code', _value: false } as any,
                                                                    readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                                })
                                                                .addSettingsInputRow({
                                                                    id: nanoid(),
                                                                    parentId: 'panel-header-styles-pnl',
                                                                    inputs: [{
                                                                        type: 'imageUploader',
                                                                        id: 'backgroundStyle-image',
                                                                        propertyName: 'headerStyles.background.uploadFile',
                                                                        label: "Image",
                                                                        jsSetting: false,
                                                                    }],
                                                                    hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.headerStyles?.background?.type) !== "image";', _mode: 'code', _value: false } as any,
                                                                    readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                                })
                                                                .addSettingsInputRow({
                                                                    id: nanoid(),
                                                                    parentId: 'panel-header-styles-pnl',
                                                                    hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.headerStyles?.background?.type) !== "storedFile";', _mode: 'code', _value: false } as any,
                                                                    readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                                    inputs: [
                                                                        {
                                                                            type: 'textField',
                                                                            id: 'backgroundStyle-storedFile',
                                                                            jsSetting: false,
                                                                            propertyName: "headerStyles.background.storedFile.id",
                                                                            label: "File ID"
                                                                        }
                                                                    ]
                                                                })
                                                                .addSettingsInputRow({
                                                                    id: "header-backgroundStyleRow-controls",
                                                                    parentId: 'panel-header-styles-pnl',
                                                                    inline: true,
                                                                    hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                                                                    readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                                    inputs: [
                                                                        {
                                                                            type: 'customDropdown',
                                                                            id: nanoid(),
                                                                            label: "Size",
                                                                            hideLabel: true,
                                                                            propertyName: "headerStyles.background.size",
                                                                            dropdownOptions: sizeOptions
                                                                        },
                                                                        {
                                                                            type: 'customDropdown',
                                                                            id: nanoid(),
                                                                            label: "Position",
                                                                            hideLabel: true,
                                                                            propertyName: "headerStyles.background.position",
                                                                            dropdownOptions: positionOptions,
                                                                        },
                                                                        {
                                                                            type: 'radio',
                                                                            id: nanoid(),
                                                                            label: "Repeat",
                                                                            hideLabel: true,
                                                                            propertyName: "headerStyles.background.repeat",
                                                                            buttonGroupOptions: repeatOptions,
                                                                        }
                                                                    ]
                                                                })
                                                                .toJson()
                                                            ]
                                                        }
                                                    })
                                                    .addCollapsiblePanel({
                                                        id: 'panelheader-styling-box',
                                                        propertyName: 'stylingBox',
                                                        label: 'Styling Box',
                                                        labelAlign: 'right',
                                                        parentId: 'panel-header-styles-pnl',
                                                        collapsible: 'header',
                                                        content: {
                                                            id: 'panelheader-styling-box-pnl',
                                                            components: [...new DesignerToolbarSettings()
                                                                .addStyleBox({
                                                                    id: 'header-styleBoxPnl',
                                                                    label: 'Margin Padding',
                                                                    hideLabel: true,
                                                                    propertyName: 'headerStyles.stylingBox',
                                                                })
                                                                .toJson()]
                                                        }
                                                    })
                                                    .addCollapsiblePanel({
                                                        id: 'panelheaderjsstyle',
                                                        propertyName: 'customStyle',
                                                        label: 'Custom Styles',
                                                        labelAlign: 'right',
                                                        collapsedByDefault: true,
                                                        parentId: 'panel-header-styles-pnl',
                                                        collapsible: 'header',
                                                        content: {
                                                            id: 'panelheaderjsstylePnl',
                                                            components: [...new DesignerToolbarSettings()
                                                                .addSettingsInput({
                                                                    readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                                    id: nanoid(),
                                                                    inputType: 'codeEditor',
                                                                    propertyName: 'headerStyles.style',
                                                                    hideLabel: false,
                                                                    label: 'Style',
                                                                    description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                                                                })
                                                                .addStyleBox({
                                                                    id: nanoid(),
                                                                    label: 'Margin Padding',
                                                                    hideLabel: true,
                                                                    propertyName: 'headerStyles.stylingBox',
                                                                })
                                                                .toJson()]
                                                        }
                                                    })
                                                    .toJson()]
                                            }
                                        })
                                        .toJson()]
                            }).toJson()]
                    },
                    {
                        key: '3',
                        title: 'Security',
                        id: 'panel6Vw9iiDw9d0MD_Rh5cbIn',
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                id: 'panel1adea529-1f0c-4def-bd41-ee166a5dfcd7',
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