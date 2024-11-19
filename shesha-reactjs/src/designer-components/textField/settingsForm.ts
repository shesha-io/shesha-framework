import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { ITextFieldComponentProps } from './interfaces';
import { FormLayout } from 'antd/lib/form/Form';

export const getSettings = (data: ITextFieldComponentProps) => {

    const sideOptions = ['all', 'top', 'right', 'bottom', 'left'];
    const cornerOptions = ['all', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight'];

    const getBorderInputs = () => sideOptions.map(side => {
        // const device = '`${contexts.canvasContext?.designerDevice || "desktop"}`';
        const code = 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.inputStyles?.border?.selectedSide)' + `!== "${side}";`;
        console.log("CODE::", code);
        return {
            id: `borderStyleRow-${side}`,
            parentId: 'borderStylePnl',
            inline: true,
            readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
            hidden: { _code: code, _mode: 'code', _value: false } as any,
            inputs: [
                {
                    label: "Width",
                    hideLabel: true,
                    propertyName: `inputStyles.border.border.${side}.width`, //TODO: Change to selectedSide to be dynamic
                },
                {
                    label: "Style",
                    propertyName: `inputStyles.border.border.${side}.style`, //TODO: Change to selectedSide to be dynamic
                    inputType: "dropdown",
                    hideLabel: true,
                    width: 60,
                    readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
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
                    ],
                },
                {
                    label: `Color ${side}`,
                    propertyName: `inputStyles.border.border.${side}.color`, //TODO: Change to selectedSide to be dynamic
                    inputType: "color",
                    readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                    hideLabel: true,
                }
            ]
        }
    });

    const getCornerInputs = () => cornerOptions.map(corner => {
        const code = 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.inputStyles?.border?.selectedCorner)' + `!== "${corner}";`;

        return {
            id: `borderRadiusStyleRow-${corner}`,
            parentId: "borderStylePnl",
            label: "Corner Radius",
            hideLabel: true,
            width: 65,
            hidden: { _code: code, _mode: 'code', _value: false } as any,
            defaultValue: 0,
            propertyName: `inputStyles.border.radius.${corner}`
        }
    });

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
                            .addContextPropertyAutocomplete({
                                id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
                                propertyName: 'propertyName',
                                label: 'Property Name',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                styledLabel: true,
                                size: 'small',
                                validate: {
                                    required: true,
                                },
                                jsSetting: true,
                            })
                            .addLabelConfigurator({
                                id: '46d07439-4c18-468c-89e1-60c002ce96c5',
                                propertyName: 'hideLabel',
                                label: 'label',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                hideLabel: true,
                            })
                            .addSettingsInputRow({
                                id: 'palceholder-tooltip-s4gmBg31azZC0UjZjpfTm',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
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
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInputRow({
                                id: '12d700d6-ed4d-49d5-9cfd-fe8f0060f3b6',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                inputs: [
                                    {
                                        inputType: 'editModeSelector',
                                        propertyName: 'editMode',
                                        label: 'Edit Mode',
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
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
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
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInputRow({
                                id: 'suffix-s4gmBg31azZC0UjZjpfTm',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
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
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: '2',
                        title: 'Validation',
                        id: '6eBJvoll3xtLJxdvOAlnB',
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                id: '3be9da3f-f47e-48ae-b4c3-f5cc36e534d9',
                                inputType: 'switch',
                                propertyName: 'validate.required',
                                label: 'Required',
                                size: 'small',
                                layout: 'horizontal',
                                jsSetting: true,
                                parentId: '6eBJvoll3xtLJxdvOAlnB'
                            })
                            .addSettingsInputRow({
                                id: 'qOkkwAnHvKJ0vYXeXMLsd',
                                parentId: '6eBJvoll3xtLJxdvOAlnB',
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
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInputRow({
                                id: 'Scip2BCqWk6HniFIJTgtA',
                                parentId: '6eBJvoll3xtLJxdvOAlnB',
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
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: '3',
                        title: 'Events',
                        id: 'Cc47W08MWrKdhoGqFKMI2',
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                id: '3cef348b-6bba-4176-93f6-f3a8b21e33c9',
                                inputType: 'codeEditor',
                                propertyName: 'onChangeCustom',
                                label: 'On Change',
                                labelAlign: 'right',
                                tooltip: 'Enter custom eventhandler on changing of event. (form, event) are exposed',
                                parentId: 'Cc47W08MWrKdhoGqFKMI2'
                            })
                            .addSettingsInput({
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                id: '88c2d96c-b808-4316-8a36-701b09e5f6c7',
                                inputType: 'codeEditor',
                                propertyName: 'onFocusCustom',
                                label: 'On Focus',
                                labelAlign: 'right',
                                tooltip: 'Enter custom eventhandler on focus of event. (form, event) are exposed',
                                parentId: 'Cc47W08MWrKdhoGqFKMI2'
                            })
                            .addSettingsInput({
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                id: '4a2b7329-1a89-45d1-a5b0-f66db21744b0',
                                inputType: 'codeEditor',
                                propertyName: 'onBlurCustom',
                                label: 'On Blur',
                                labelAlign: 'right',
                                tooltip: 'Enter custom eventhandler on blur of event. (form, event) are exposed',
                                parentId: 'Cc47W08MWrKdhoGqFKMI2'
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: '4',
                        title: 'Appearance',
                        id: 'elgrlievlfwehhh848r8hsdnflsdnclurbd',
                        components: [...new DesignerToolbarSettings()
                            .addPropertyRouter({
                                id: 'styleRouter',
                                propertyName: 'propertyRouter1',
                                componentName: 'propertyRouter1',
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
                                                        readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                        inputs: [
                                                            {
                                                                label: 'Family',
                                                                propertyName: 'inputStyles.font.type',
                                                                inputType: 'dropdown',
                                                                hideLabel: true,
                                                                dropdownOptions: [
                                                                    { value: 'Arial', label: 'Arial' },
                                                                    { value: 'Helvetica', label: 'Helvetica' },
                                                                    { value: 'Times New Roman', label: 'Times New Roman' },
                                                                    { value: 'Courier New', label: 'Courier New' },
                                                                    { value: 'Verdana', label: 'Verdana' },
                                                                    { value: 'Georgia', label: 'Georgia' },
                                                                    { value: 'Palatino', label: 'Palatino' },
                                                                    { value: 'monospace', label: 'Monospace' },
                                                                    { value: 'Garamond', label: 'Garamond' },
                                                                    { value: 'Comic Sans MS', label: 'Comic Sans MS' },
                                                                    { value: 'Trebuchet MS', label: 'Trebuchet MS' },
                                                                    { value: 'Arial Black', label: 'Arial Black' },
                                                                    { value: 'impact', label: 'Impact' }
                                                                ],
                                                            },
                                                            {
                                                                label: 'Size',
                                                                propertyName: 'inputStyles.font.size',
                                                                hideLabel: true,
                                                            },
                                                            {
                                                                label: 'Weight',
                                                                propertyName: 'inputStyles.font.weight',
                                                                hideLabel: true,
                                                                inputType: 'dropdown',
                                                                tooltip: "Controls text thickness (light, normal, bold, etc.)",
                                                                dropdownOptions: [
                                                                    { value: '100', label: 'sectionSeparator' },
                                                                    { value: '400', label: 'sectionSeparator' },
                                                                    { value: '500', label: 'sectionSeparator' },
                                                                    { value: '700', label: 'sectionSeparator' },
                                                                    { value: '900', label: 'sectionSeparator' },
                                                                ],
                                                            },
                                                            {
                                                                label: 'Color',
                                                                inputType: 'color',
                                                                hideLabel: true,
                                                                propertyName: 'inputStyles.font.color',
                                                            },
                                                            {
                                                                label: 'Align',
                                                                propertyName: 'inputStyles.font.align',
                                                                inputType: 'dropdown',
                                                                hideLabel: true,
                                                                width: 60,
                                                                dropdownOptions: [
                                                                    { value: 'left', label: 'AlignLeftOutlined' },
                                                                    { value: 'center', label: 'AlignCenterOutlined' },
                                                                    { value: 'right', label: 'AlignRightOutlined' },
                                                                ],
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
                                                        readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                        inputs: [
                                                            {
                                                                label: "Width",
                                                                width: 85,
                                                                propertyName: "inputStyles.dimensions.width",
                                                                icon: "width",

                                                            },
                                                            {
                                                                label: "Min Width",
                                                                width: 85,
                                                                hideLabel: true,
                                                                propertyName: "inputStyles.dimensions.minWidth",
                                                                icon: "minWidth",
                                                            },
                                                            {
                                                                label: "Max Width",
                                                                width: 85,
                                                                hideLabel: true,
                                                                propertyName: "inputStyles.dimensions.maxWidth",
                                                                icon: "maxWidth",
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
                                                                label: "Height",
                                                                width: 85,
                                                                propertyName: "inputStyles.dimensions.height",
                                                                icon: "height",
                                                            },
                                                            {
                                                                label: "Min Height",
                                                                width: 85,
                                                                hideLabel: true,
                                                                propertyName: "inputStyles.dimensions.minHeight",
                                                                icon: "minHeight",
                                                            },
                                                            {
                                                                label: "Max Height",
                                                                width: 85,
                                                                hideLabel: true,
                                                                propertyName: "inputStyles.dimensions.maxHeight",
                                                                icon: "maxHeight",
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
                                            parentId: 'styleRouter',
                                            collapsible: 'header',
                                            content: {
                                                id: 'borderStylePnl',
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInputRow({
                                                        id: `borderStyleRow`,
                                                        parentId: 'borderStylePnl',
                                                        inline: true,
                                                        readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                        inputs: [
                                                            {
                                                                label: "Border",
                                                                hideLabel: true,
                                                                inputType: "button",
                                                                propertyName: "inputStyles.border.hideBorder",
                                                                icon: "EyeOutlined",
                                                                iconAlt: "EyeInvisibleOutlined"
                                                            },
                                                            {
                                                                label: "Select Side",
                                                                hideLabel: true,
                                                                propertyName: "inputStyles.border.selectedSide",
                                                                inputType: "radio",
                                                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
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
                                                        ]
                                                    }
                                                    )
                                                    .addSettingsInputRow(
                                                        getBorderInputs()[0] as any
                                                    )
                                                    .addSettingsInputRow(
                                                        getBorderInputs()[1] as any
                                                    )
                                                    .addSettingsInputRow(
                                                        getBorderInputs()[2] as any
                                                    )
                                                    .addSettingsInputRow(
                                                        getBorderInputs()[3] as any
                                                    )
                                                    .addSettingsInputRow(
                                                        getBorderInputs()[4] as any
                                                    )
                                                    .addSettingsInput(
                                                        {
                                                            id: "corner-selector",
                                                            label: "Corner Radius",
                                                            propertyName: "inputStyles.border.selectedCorner",
                                                            inputType: "radio",
                                                            defaultValue: "all",
                                                            buttonGroupOptions: [
                                                                {
                                                                    value: "all",
                                                                    icon: "ExpandOutlined",
                                                                    title: "All"
                                                                },
                                                                {
                                                                    value: "topLeft",
                                                                    icon: "RadiusUpleftOutlined",
                                                                    title: "Top Left"
                                                                },
                                                                {
                                                                    value: "topRight",
                                                                    icon: "RadiusUprightOutlined",
                                                                    title: "Top Right"
                                                                },
                                                                {
                                                                    value: "bottomLeft",
                                                                    icon: "RadiusBottomleftOutlined",
                                                                    title: "Bottom Left"
                                                                },
                                                                {
                                                                    value: "bottomRight",
                                                                    icon: "RadiusBottomrightOutlined",
                                                                    title: "Bottom Right"
                                                                }
                                                            ],
                                                        }
                                                    )
                                                    .addSettingsInput(
                                                        getCornerInputs()[0] as any
                                                    )
                                                    .addSettingsInput(
                                                        getCornerInputs()[1] as any
                                                    )
                                                    .addSettingsInput(
                                                        getCornerInputs()[2] as any
                                                    )
                                                    .addSettingsInput(
                                                        getCornerInputs()[3] as any
                                                    )
                                                    .addSettingsInput(
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
                                                                label: "Color",
                                                                propertyName: "inputStyles.background.color",
                                                                inputType: "color",
                                                                hideLabel: true,
                                                                jsSetting: false,
                                                            }],
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.inputStyles?.background?.type) !== "color";', _mode: 'code', _value: false } as any,
                                                            readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                        })
                                                        .addSettingsInputRow({
                                                            id: "backgroundStyle-gradientColors",
                                                            parentId: "backgroundStylePnl",
                                                            inputs: [{
                                                                inputType: "multiColorPicker",
                                                                propertyName: "inputStyles.background.gradient.colors",
                                                                label: "Colors",
                                                                jsSetting: false,
                                                            }
                                                            ],
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.inputStyles?.background?.type) !== "gradient";', _mode: 'code', _value: false } as any,
                                                            hideLabel: true,
                                                            readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                        })
                                                        .addSettingsInputRow({
                                                            id: "backgroundStyle-url",
                                                            parentId: "backgroundStylePnl",
                                                            inputs: [{
                                                                propertyName: "inputStyles.background.url",
                                                                jsSetting: false,
                                                                label: "URL",
                                                            }],
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.inputStyles?.background?.type) !== "url";', _mode: 'code', _value: false } as any,
                                                            readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                        })
                                                        .addSettingsInputRow({
                                                            id: "backgroundStyle-image",
                                                            parentId: 'backgroundStylePnl',
                                                            inputs: [{
                                                                inputType: "imageUploader",
                                                                propertyName: 'inputStyles.background.uploadFile',
                                                                label: "Image",
                                                                jsSetting: false,
                                                            }],
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.inputStyles?.background?.type) !== "image";', _mode: 'code', _value: false } as any,
                                                            readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                        })
                                                        .addSettingsInputRow({
                                                            id: "backgroundStyleRow-storedFile",
                                                            parentId: 'backgroundStylePnl',
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.inputStyles?.background?.type) !== "storedFile";', _mode: 'code', _value: false } as any,
                                                            readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                            inputs: [
                                                                {
                                                                    jsSetting: false,
                                                                    propertyName: "inputStyles.background.storedFile.id",
                                                                    label: "File ID"
                                                                }
                                                            ]
                                                        })
                                                        .addSettingsInputRow({
                                                            id: "backgroundStyleRow-controls",
                                                            parentId: 'backgroundStyleRow',
                                                            inline: true,
                                                            readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                            inputs: [
                                                                {
                                                                    inputType: "customDropdown",
                                                                    label: "Size",
                                                                    hideLabel: true,
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
                                                                    ],
                                                                },
                                                                {
                                                                    label: "Position",
                                                                    hideLabel: true,
                                                                    inputType: "customDropdown",
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
                                                                    label: "Repeat",
                                                                    hideLabel: true,
                                                                    propertyName: "inputStyles.background.repeat",
                                                                    inputType: "dropdown",
                                                                    width: 70,
                                                                    dropdownOptions: [
                                                                        {
                                                                            value: "repeat",
                                                                            label: "repeat"
                                                                        },
                                                                        {
                                                                            value: "repeat-x",
                                                                            label: "repeatX"
                                                                        },
                                                                        {
                                                                            value: "repeat-y",
                                                                            label: "repeatY"
                                                                        },
                                                                        {
                                                                            value: "no-repeat",
                                                                            label: "noRepeat"
                                                                        }
                                                                    ],
                                                                }
                                                            ]
                                                        })
                                                        .addSettingsInputRow({
                                                            id: "background-gradient-direcion-StyleRow-controls",
                                                            parentId: 'backgroundStyleRow',
                                                            inline: true,
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.inputStyles?.background?.type) !== "gradient";', _mode: 'code', _value: false } as any,
                                                            readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                            inputs: [
                                                                {
                                                                    label: "Direction",
                                                                    propertyName: "inputStyles.background.gradient.direction",
                                                                    inputType: "dropdown",
                                                                    jsSetting: false,
                                                                    hideLabel: true,
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
                                                        readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                        inputs: [
                                                            {
                                                                label: 'Offset X',
                                                                hideLabel: true,
                                                                width: 60,
                                                                icon: "offsetHorizontal",
                                                                propertyName: 'inputStyles.shadow.offsetX',
                                                            },
                                                            {
                                                                label: 'Offset Y',
                                                                hideLabel: true,
                                                                width: 60,
                                                                icon: 'offsetVertical',
                                                                propertyName: 'inputStyles.shadow.offsetY',
                                                            },
                                                            {
                                                                label: 'Blur',
                                                                hideLabel: true,
                                                                width: 60,
                                                                icon: 'blur',
                                                                propertyName: 'inputStyles.shadow.blurRadius',
                                                            },
                                                            {
                                                                label: 'Spread',
                                                                hideLabel: true,
                                                                width: 60,
                                                                icon: 'spread',
                                                                propertyName: 'inputStyles.shadow.spreadRadius',
                                                            },
                                                            {
                                                                label: 'Color',
                                                                inputType: 'color',
                                                                hideLabel: true,
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
                            }).toJson()]
                    },
                    {
                        key: '5',
                        title: 'Security',
                        id: '6Vw9iiDw9d0MD_Rh5cbIn',
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
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