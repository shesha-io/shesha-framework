import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { ITextFieldComponentProps } from './interfaces';
import { FormLayout } from 'antd/lib/form/Form';

export const getSettings = (data: ITextFieldComponentProps) => {

    return {
        components: new DesignerToolbarSettings(data)
            .addSearchableTabs({
                id: 'W_m7doMyCpCYwAYDfRh6I',
                propertyName: 'settingsTabs',
                parentId: 'root',
                label: 'Settings',
                labelAlign: 'right',
                size: 'small',
                tabs: [
                    {
                        key: 'Common',
                        title: 'Common',
                        id: 'commonTab',
                        components: [...new DesignerToolbarSettings()
                            .addContextPropertyAutocomplete({
                                id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
                                propertyName: 'propertyName',
                                label: 'Property Name',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                validate: {
                                    required: true,
                                },
                                jsSetting: true,
                            })
                            .addLabelConfigurator({
                                id: '46d07439-4c18-468c-89e1-60c002ce96c5',
                                propertyName: 'hideLabel',
                                label: 'Label',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                hideLabel: true,
                            })
                            .addSettingsInputRow({
                                id: 'placeholder-tooltip-s4gmBg31azZC0UjZjpfTm',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                readOnly: data.readOnly,
                                inputs: [
                                    {
                                        propertyName: 'placeholder',
                                        label: 'Placeholder',
                                        size: 'small',
                                        jsSetting: true,
                                    },
                                    {
                                        inputType: 'textArea',
                                        propertyName: 'description',
                                        label: 'Tooltip',
                                        jsSetting: true,
                                    },
                                ],
                            })
                            .addSettingsInputRow({
                                id: '12d700d6-ed4d-49d5-9cfd-fe8f0060f3b6',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                readOnly: data.readOnly,
                                inputs: [
                                    {
                                        inputType: 'editModeSelector',
                                        propertyName: 'editMode',
                                        label: 'Readonly',
                                        size: 'small',
                                        jsSetting: true,
                                    },
                                    {
                                        inputType: 'switch',
                                        propertyName: 'hidden',
                                        label: 'Hide',
                                        jsSetting: true,
                                        layout: 'horizontal',
                                    },
                                ],
                            })
                            .addSettingsInputRow({
                                id: 'type-default-value-s4gmBg31azZC0UjZjpfTm',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                readOnly: data.readOnly,
                                inputs: [
                                    {
                                        inputType: 'dropdown',
                                        propertyName: 'textType',
                                        label: 'Type',
                                        size: 'small',
                                        jsSetting: true,
                                        dropdownOptions: [
                                            {
                                                label: 'text',
                                                value: 'text',
                                            },
                                            {
                                                label: 'password',
                                                value: 'password',
                                            },
                                        ],
                                    },
                                    {
                                        propertyName: 'initialValue',
                                        label: 'Default Value',
                                        tooltip: 'Enter default value of component. (formData, formMode, globalState) are exposed',
                                        jsSetting: true,
                                    },
                                ],
                            })
                            .addSettingsInputRow({
                                id: 'prefix-s4gmBg31azZC0UjZjpfTm',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                readOnly: data.readOnly,
                                inputs: [
                                    {
                                        propertyName: 'prefix',
                                        label: 'Prefix',
                                        jsSetting: true,
                                    },
                                    {
                                        inputType: 'iconPicker',
                                        propertyName: 'prefixIcon',
                                        label: 'Prefix Icon',
                                        jsSetting: true,
                                    },
                                ],
                            })
                            .addSettingsInputRow({
                                id: 'suffix-s4gmBg31azZC0UjZjpfTm',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                readOnly: data.readOnly,
                                inputs: [
                                    {
                                        propertyName: 'Suffix',
                                        label: 'Suffix',
                                        jsSetting: true,
                                    },
                                    {
                                        inputType: 'iconPicker',
                                        propertyName: 'suffixIcon',
                                        label: 'Suffix Icon',
                                        jsSetting: true,
                                    },
                                ],
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: 'Validation',
                        title: 'Validation',
                        id: 'validationTab',
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                id: '3be9da3f-f47e-48ae-b4c3-f5cc36e534d9',
                                inputType: 'switch',
                                propertyName: 'validate.required',
                                label: 'Required',
                                size: 'small',
                                readOnly: data.readOnly,
                                layout: 'horizontal',
                                jsSetting: true,
                            })
                            .addSettingsInputRow({
                                id: 'qOkkwAnHvKJ0vYXeXMLsd',
                                parentId: '6eBJvoll3xtLJxdvOAlnB',
                                readOnly: data.readOnly,
                                inputs: [
                                    {
                                        propertyName: 'validate.minLength',
                                        label: 'Min Length',
                                        size: 'small',
                                    },
                                    {
                                        propertyName: 'validate.maxLength',
                                        label: 'Max Length',
                                        size: 'small',
                                    },
                                ],
                            })
                            .addSettingsInputRow({
                                id: 'Scip2BCqWk6HniFIJTgtA',
                                parentId: '6eBJvoll3xtLJxdvOAlnB',
                                readOnly: data.readOnly,
                                inputs: [
                                    {
                                        propertyName: 'validate.message',
                                        label: 'Message',
                                        size: 'small',
                                    },
                                    {
                                        inputType: 'codeEditor',
                                        propertyName: 'validate.validator',
                                        label: 'Validator',
                                        labelAlign: 'right',
                                        tooltip: 'Enter custom validator logic for form.item rules. Returns a Promise',
                                    }
                                ],
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: 'Events',
                        title: 'Events',
                        id: 'eventsTab',
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                id: '3cef348b-6bba-4176-93f6-f3a8b21e33c9',
                                inputType: 'codeEditor',
                                propertyName: 'onChangeCustom',
                                label: 'On Change',
                                readOnly: data.readOnly,
                                labelAlign: 'right',
                                tooltip: 'Enter custom eventhandler on changing of event. (form, event) are exposed',
                            })
                            .addSettingsInput({
                                id: '88c2d96c-b808-4316-8a36-701b09e5f6c7',
                                inputType: 'codeEditor',
                                propertyName: 'onFocusCustom',
                                label: 'On Focus',
                                readOnly: data.readOnly,
                                labelAlign: 'right',
                                tooltip: 'Enter custom eventhandler on focus of event. (form, event) are exposed',
                            })
                            .addSettingsInput({
                                id: '4a2b7329-1a89-45d1-a5b0-f66db21744b0',
                                inputType: 'codeEditor',
                                propertyName: 'onBlurCustom',
                                label: 'On Blur',
                                readOnly: data.readOnly,
                                labelAlign: 'right',
                                tooltip: 'Enter custom eventhandler on blur of event. (form, event) are exposed',
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: 'Appearance',
                        title: 'Appearance',
                        id: 'appearanceTab',
                        components: [...new DesignerToolbarSettings()
                            .addCollapsiblePanel({
                                id: 'fontStyleCollapsiblePanel',
                                propertyName: 'pnlFontStyle',
                                label: 'Font',
                                labelAlign: 'right',
                                ghost: true,
                                collapsible: 'header',
                                content: {
                                    id: 'fontStylePnl',
                                    components: [...new DesignerToolbarSettings()
                                        .addSettingsInputRow({
                                            id: 'font-size-try26voxhs-HxJ5k5ngYE',
                                            parentId: 'fontStylePnl',
                                            readOnly: data.readOnly,
                                            inline: true,
                                            inputs: [
                                                {
                                                    label: 'Size',
                                                    propertyName: 'inputStyles.font.size'
                                                },
                                                {
                                                    label: 'Weight',
                                                    propertyName: 'inputStyles.font.weight',
                                                    inputType: 'dropdown',
                                                    dropdownOptions: [
                                                        { value: '100', label: 'Thin' },
                                                        { value: '400', label: 'Normal' },
                                                        { value: '500', label: 'Medium' },
                                                        { value: '700', label: 'Bold' },
                                                        { value: '900', label: 'Extra Bold' },
                                                    ],
                                                },
                                                {
                                                    label: 'Color',
                                                    inputType: 'color',
                                                    propertyName: 'inputStyles.font.color',
                                                },
                                                {
                                                    label: 'Family',
                                                    propertyName: 'inputStyles.font.family',
                                                    inputType: 'dropdown',
                                                    dropdownOptions: [
                                                        { value: 'Arial', label: 'Arial' },
                                                        { value: 'Helvetica', label: 'Helvetica' },
                                                        { value: 'Times New Roman', label: 'Times New Roman' },
                                                    ],
                                                },
                                                {
                                                    label: 'Align',
                                                    propertyName: 'inputStyles.font.align',
                                                    inputType: 'radio',
                                                    buttonGroupOptions: [
                                                        { value: 'left', title: 'Left', icon: 'AlignLeftOutlined' },
                                                        { value: 'center', title: 'Center', icon: 'AlignCenterOutlined' },
                                                        { value: 'right', title: 'Right', icon: 'AlignRightOutlined' },
                                                    ],
                                                },
                                            ],
                                        })
                                        .toJson()
                                    ]
                                }
                            })
                            .addCollapsiblePanel({
                                id: 'dimensionsCollapsiblePanel',
                                propertyName: 'pnlDimensions',
                                label: 'Dimensions',
                                labelAlign: 'right',
                                ghost: true,
                                collapsible: 'header',
                                content: {
                                    id: 'dimensionsPnl',
                                    components: [...new DesignerToolbarSettings()
                                        .addSettingsInputRow({
                                            id: 'dimensionsRow',
                                            parentId: 'dimensionsPnl',
                                            readOnly: data.readOnly,
                                            inline: true,
                                            inputs: [
                                                {
                                                    label: 'Width',
                                                    propertyName: 'width',
                                                },
                                                {
                                                    label: 'Min Width',
                                                    propertyName: 'minWidth',
                                                },
                                                {
                                                    label: 'Max Width',
                                                    propertyName: 'maxWidth',
                                                }
                                            ]
                                        })
                                        .addSettingsInputRow({
                                            id: 'dimensionsRow',
                                            parentId: 'dimensionsPnl',
                                            readOnly: data.readOnly,
                                            inline: true,
                                            inputs: [
                                                {
                                                    label: 'Height',
                                                    propertyName: 'height',
                                                },
                                                {
                                                    label: 'Min Height',
                                                    propertyName: 'minHeight',
                                                },
                                                {
                                                    label: 'Max Height',
                                                    propertyName: 'maxHeight',
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
                                collapsible: 'header',
                                content: {
                                    id: 'borderStylePnl',
                                    components: [...new DesignerToolbarSettings()
                                        .addSettingsInputRow({
                                            id: 'borderStyleRow',
                                            parentId: 'borderStylePnl',
                                            readOnly: data.readOnly,
                                            inline: true,
                                            inputs: [
                                                {
                                                    label: "Border",
                                                    hideLabel: true,
                                                    propertyName: "inputStyles.border.hideBorder",
                                                    inputType: "button",
                                                    icon: "EyeOutlined",
                                                    "iconAlt": "EyeInvisibleOutlined"
                                                },
                                                {

                                                    label: "Select Side",
                                                    hideLabel: true,
                                                    propertyName: "inputStyles.border.selectedSide",
                                                    inputType: "radio",
                                                    buttonGroupOptions: [
                                                        {
                                                            value: "all",
                                                            icon: "BorderOutlined",
                                                            title: "All"
                                                        },
                                                        {
                                                            value: "top",
                                                            icon: "BorderTopOutlined",
                                                            title: "Top"
                                                        },
                                                        {
                                                            value: "right",
                                                            icon: "BorderRightOutlined",
                                                            title: "Right"
                                                        },
                                                        {
                                                            value: "bottom",
                                                            icon: "BorderBottomOutlined",
                                                            title: "Bottom"
                                                        },
                                                        {
                                                            value: "left",
                                                            icon: "BorderLeftOutlined",
                                                            title: "Left"
                                                        }
                                                    ]
                                                },
                                                {
                                                    label: "Width",
                                                    hideLabel: false,
                                                    propertyName: "inputStyles.border.width"
                                                },
                                                {
                                                    label: "Style",
                                                    propertyName: "inputStyles.border.style",
                                                    inputType: "dropdown",
                                                    hideLabel: false,
                                                    width: 60,
                                                    dropdownOptions: [
                                                        {
                                                            value: "solid",
                                                            label: "MinusOutlined"
                                                        },
                                                        {
                                                            value: "dashed",
                                                            label: "DashOutlined"
                                                        },
                                                        {
                                                            value: "dotted",
                                                            label: "SmallDashOutlined"
                                                        },
                                                        {
                                                            value: "none",
                                                            label: "CloseOutlined"
                                                        }
                                                    ]
                                                },
                                                {
                                                    label: "Color",
                                                    propertyName: "inputStyles.border.color",
                                                    inputType: "color",
                                                    hideLabel: false
                                                }
                                            ],
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
                                collapsible: 'header',
                                content: {
                                    id: 'backgroundStylePnl',
                                    components: [...new DesignerToolbarSettings()
                                        .addSettingsInput(
                                            {
                                                id: "backgroundStyleRow-selectType",
                                                readOnly: data.readOnly,
                                                parentId: "backgroundStyleRow",
                                                label: "Type",
                                                jsSetting: false,
                                                propertyName: "inputStyles.background.type",
                                                inputType: "radio",
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
                                                        icon: "FileImageOutlined",
                                                        title: "Stored File"
                                                    }
                                                ]
                                            })
                                        .addSettingsInput(
                                            {
                                                id: "backgroundStyleRow-color",
                                                parentId: "backgroundStyleRow",
                                                label: "Color",
                                                propertyName: "inputStyles.background.color",
                                                inputType: "color",
                                                hideLabel: true,
                                                jsSetting: false,
                                                readOnly: data.readOnly,
                                                hidden: data?.inputStyles?.background?.type !== 'color'
                                            })
                                        .addSettingsInput(
                                            {
                                                id: "backgroundStyle-gradient",
                                                readOnly: data.readOnly,
                                                parentId: "backgroundStyleRow",
                                                label: "Direction",
                                                propertyName: "inputStyles.background.gradient.direction",
                                                inputType: "dropdown",
                                                jsSetting: false,
                                                hideLabel: true,
                                                hidden: data?.inputStyles?.background?.type !== 'gradient',
                                                dropdownOptions: [
                                                    {
                                                        value: "to right",
                                                        label: "To Right"
                                                    },
                                                    {
                                                        value: "to left",
                                                        label: "To Left"
                                                    },
                                                    {
                                                        value: "to top",
                                                        label: "To Top"
                                                    },
                                                    {
                                                        value: "to bottom",
                                                        label: "To Bottom"
                                                    },
                                                    {
                                                        value: "to top right",
                                                        label: "To Top Right"
                                                    },
                                                    {
                                                        value: "to top left",
                                                        label: "To Top Left"
                                                    },
                                                    {
                                                        value: "to bottom right",
                                                        label: "To Bottom Right"
                                                    },
                                                    {
                                                        value: "to bottom left",
                                                        label: "To Bottom Left"
                                                    }
                                                ]
                                            })
                                        .addSettingsInput(
                                            {
                                                id: "backgroundStyle-url",
                                                readOnly: data.readOnly,
                                                parentId: "backgroundStyleRow",
                                                propertyName: "inputStyles.background.url",
                                                jsSetting: false,
                                                label: "URL",
                                                hidden: data?.inputStyles?.background?.type !== 'url'
                                            })
                                        .addSettingsInput(
                                            {
                                                id: "backgroundStyle-image",
                                                readOnly: data.readOnly,
                                                parentId: "backgroundStyleRow",
                                                inputType: "imageUploader",
                                                propertyName: "inputStyles.background.upload",
                                                label: "Image",
                                                jsSetting: false,
                                                hidden: data?.inputStyles?.background?.type !== 'upload'
                                            })
                                        .addSettingsInputRow(
                                            {
                                                id: "backgroundStyleRow-storedFile",
                                                parentId: "backgroundStylePnl",
                                                hidden: data?.inputStyles?.background?.type !== 'storedFile',
                                                readOnly: data.readOnly,
                                                inputs: [
                                                    {
                                                        jsSetting: false,
                                                        propertyName: "inputStyles.background.storedFile.id",
                                                        label: "File ID"
                                                    },
                                                    {
                                                        jsSetting: false,
                                                        propertyName: "inputStyles.background.storedFile.ownerId",
                                                        label: "Owner ID"
                                                    },
                                                    {
                                                        inputType: "typeAutocomplete",
                                                        jsSetting: false,
                                                        propertyName: "inputStyles.background.storedFile.ownerType",
                                                        label: "Owner Type"
                                                    },
                                                    {
                                                        jsSetting: false,
                                                        propertyName: "inputStyles.background.storedFile.catergory",
                                                        label: "File Category"
                                                    }
                                                ]
                                            })
                                        .addSettingsInputRow(
                                            {
                                                id: "backgroundStyleRow-controls",
                                                parentId: "backgroundStyleRow",
                                                inline: true,
                                                readOnly: data.readOnly,
                                                inputs: [
                                                    {
                                                        inputType: "customDropdown",
                                                        label: "Size",
                                                        propertyName: "inputStyles.background.size",
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
                                                        ]
                                                    },
                                                    {
                                                        label: "Position",
                                                        inputType: "customDropdown",
                                                        propertyName: "inputStyles.background.position",
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
                                                        ]
                                                    },
                                                    {
                                                        label: "Repeat",
                                                        propertyName: "inputStyles.background.repeat",
                                                        inputType: "radio",
                                                        "buttonGroupOptions": [
                                                            {
                                                                value: "repeat",
                                                                title: "Repeat",
                                                                icon: "TableOutlined"
                                                            },
                                                            {
                                                                value: "repeat-x",
                                                                title: "Repeat X",
                                                                icon: "InsertRowBelowOutlined"
                                                            },
                                                            {
                                                                value: "repeat-y",
                                                                title: "Repeat Y",
                                                                icon: "InsertRowLeftOutlined"
                                                            },
                                                            {
                                                                value: "no-repeat",
                                                                title: "No Repeat",
                                                                icon: "PicCenterOutlined"
                                                            }
                                                        ]
                                                    }
                                                ]
                                            })
                                        .toJson()],
                                }
                            })
                            .addCollapsiblePanel({
                                id: 'shadowStyleCollapsiblePanel',
                                propertyName: 'pnlShadowStyle',
                                label: 'Shadow',
                                labelAlign: 'right',
                                ghost: true,
                                collapsible: 'header',
                                content: {
                                    id: 'shadowStylePnl',
                                    components: [...new DesignerToolbarSettings()
                                        .addSettingsInputRow({
                                            id: 'shadowStyleRow',
                                            parentId: 'shadowStylePnl',
                                            readOnly: data.readOnly,
                                            inline: true,
                                            inputs: [
                                                {
                                                    label: 'Offset X',
                                                    propertyName: 'inputStyles.shadow.offsetX',
                                                },
                                                {
                                                    label: 'Offset Y',
                                                    propertyName: 'inputStyles.shadow.offsetY',
                                                },
                                                {
                                                    label: 'Blur',
                                                    propertyName: 'inputStyles.shadow.blur',
                                                },
                                                {
                                                    label: 'Spread',
                                                    propertyName: 'inputStyles.shadow.spread',
                                                },
                                                {
                                                    label: 'Color',
                                                    inputType: 'color',
                                                    propertyName: 'inputStyles.shadow.color',
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
                                label: 'Styles',
                                labelAlign: 'right',
                                ghost: true,
                                collapsible: 'header',
                                content: {
                                    id: 'stylePnl-M5-911',
                                    components: [...new DesignerToolbarSettings()
                                        .addSettingsInput({
                                            id: 'custom-css-412c-8461-4c8d55e5c073',
                                            propertyName: 'style',
                                            label: 'Custom CSS',
                                            readOnly: data.readOnly,
                                            description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                                        })
                                        .addStyleBox({
                                            id: 'styleBoxPnl',
                                            propertyName: 'stylingBox',
                                        })
                                        .toJson()
                                    ]
                                }
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: 'Security',
                        title: 'Security',
                        id: 'securityTab',
                        components: [...new DesignerToolbarSettings()
                            .addCollapsiblePanel({
                                id: '6Vw9iiDw9d0MD_Rh5cbIn',
                                propertyName: 'security',
                                parentId: 'root',
                                label: 'Security',
                                labelAlign: 'right',
                                expandIconPosition: 'start',
                                ghost: true,
                                collapsible: 'header',
                                content: {
                                    id: 'securityPanel',
                                    components: [...new DesignerToolbarSettings()
                                        .addPermissionAutocomplete({
                                            id: '1adea529-1f0c-4def-bd41-ee166a5dfcd7',
                                            propertyName: 'permissions',
                                            label: 'Permissions',
                                            size: 'small',
                                        })
                                        .toJson()
                                    ]
                                }
                            }).toJson()]
                    }
                ]
            }).toJson(), formSettings: {
                colon: false,
                layout: 'vertical' as FormLayout,
                labelCol: { span: 24 },
                wrapperCol: { span: 24 }
            }
    }
};
