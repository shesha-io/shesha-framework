import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { fontTypes, fontWeights, textAlign } from '../_settings/utils/font/utils';
import { getBorderInputs } from '../_settings/utils/border/utils';
import { getCornerInputs } from '../_settings/utils/border/utils';
import { IDateFieldProps } from './interfaces';

export const getSettings = (data: IDateFieldProps) => {

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
                                label: 'Label',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                hideLabel: true,
                            })
                            .addSettingsInputRow({
                                id: 'palceholder-tooltip-w2gmBg31azZD0UjZjpfTm',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                inputs: [
                                    {
                                        id: '56b40a33-7e10-4ce4-9f08-a34d24a83338',
                                        propertyName: 'picker',
                                        label: 'Picker',
                                        type: 'dropdown',
                                        size: 'small',
                                        jsSetting: true,
                                        dropdownOptions: [
                                            {
                                                value: "date",
                                                label: "date"
                                            },
                                            {
                                                value: "week",
                                                label: "week"
                                            },
                                            {
                                                value: "month",
                                                label: "month"
                                            },
                                            {
                                                value: "quarter",
                                                label: "quarter"
                                            },
                                            {
                                                value: "year",
                                                label: "year"
                                            }

                                        ]
                                    },
                                    {
                                        id: '57a40a33-7e08-4ce4-9f08-a34d24a84438',
                                        type: 'switch',
                                        propertyName: 'range',
                                        label: 'Range?',
                                        jsSetting: true,
                                    },
                                ],
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInput({
                                id: 'e92bcf3c-a70a-4aeb-b6ac-5643eb5b4fe2',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                inputType: 'switch',
                                propertyName: 'resolveToUTC',
                                label: 'Resolve to UTC',
                                jsSetting: true,
                            })
                            .addSettingsInputRow({
                                id: 'palceholder-tooltip-s4gmBg31azZC0UjZjpfTm',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                inputs: [
                                    {
                                        id: '57a40a33-7e10-4ce4-9f08-a34d24a83338',
                                        propertyName: 'placeholder',
                                        label: 'Placeholder',
                                        type: 'textField',
                                        size: 'small',
                                        jsSetting: true,
                                    },
                                    {
                                        id: '57a40a33-7e08-4ce4-9f08-a34d24a84438',
                                        type: 'textArea',
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
                                        id: '5c813b1a-04c5-7758-ac0f-cbcbae6b3bd4',
                                        type: 'editModeSelector',
                                        propertyName: 'editMode',
                                        label: 'Edit Mode',
                                        size: 'small',
                                        jsSetting: true,
                                    },
                                    {
                                        id: '5c813b1a-04c5-4678-ac0f-cbcbae6b3bd4',
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
                        title: 'Formats',
                        id: '6eBJvoll3xtLJxdvOAlnB',
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                id: '3be9da3f-f47e-48ae-b4c3-d5cc36e534d9',
                                propertyName: 'dateFormat',
                                label: 'Date Format',
                                size: 'small',
                                jsSetting: true,
                                inputType: "textField",
                                defaultValue: "DD/MM/YYYY",
                                parentId: '6eBJvoll3xtLJxdvOAlnB'
                            })
                            .addSettingsInput({
                                id: '5be9da3f-f47e-48ae-b4c3-d5cc36e534d9',
                                propertyName: 'timeFormat',
                                label: 'Time Format',
                                size: 'small',
                                jsSetting: true,
                                inputType: "textField",
                                defaultValue: "HH:mm:ss",
                                parentId: '6eBJvoll3xtLJxdvOAlnB'
                            })
                            .addSettingsInput({
                                id: '5be9da3f-f47e-48ae-b7c3-d5cc36e534d9',
                                propertyName: 'yearFormat',
                                label: 'Year Format',
                                size: 'small',
                                jsSetting: true,
                                inputType: "textField",
                                defaultValue: "YYYY",
                                parentId: '6eBJvoll3xtLJxdvOAlnB'
                            })
                            .addSettingsInput({
                                id: '5be9da3f-f42e-48ae-b7c3-d5cc36e534d9',
                                propertyName: 'quarterFormat',
                                label: 'Quarter Format',
                                size: 'small',
                                jsSetting: true,
                                inputType: "textField",
                                defaultValue: "YYYY-\\QQ",
                                parentId: '6eBJvoll3xtLJxdvOAlnB'
                            })
                            .addSettingsInput({
                                id: '5ee9da3f-f47e-48ae-b7c3-d5cc36e534d9',
                                propertyName: 'monthFormat',
                                label: 'Month Format',
                                size: 'small',
                                jsSetting: true,
                                inputType: "textField",
                                defaultValue: "YYYY-MM",
                                parentId: '6eBJvoll3xtLJxdvOAlnB'
                            })
                            .addSettingsInput({
                                id: '5be9da3f-f57e-48ae-b7c3-d5cc36e534d9',
                                propertyName: 'weekFormat',
                                label: 'Week Format',
                                size: 'small',
                                jsSetting: true,
                                inputType: "textField",
                                defaultValue: "YYYY-wo",
                                parentId: '6eBJvoll3xtLJxdvOAlnB'
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: '3',
                        title: 'Control Visibility',
                        id: '6eBJvoll3xtHJxdvOAlnB',
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                id: '3be9da3f-f47e-48ae-b4c3-f5cc36e554d9',
                                inputType: 'switch',
                                propertyName: 'showTime',
                                label: 'Show Time',
                                size: 'small',
                                layout: 'horizontal',
                                jsSetting: true,
                                parentId: '6eBJvoll3xtHJxdvOAlnB'
                            })
                            .addSettingsInput({
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                id: '3be9da3f-f47e-48ae-c4c3-f5cc36e554d9',
                                inputType: 'switch',
                                propertyName: 'defaultToMidnight',
                                label: 'Default time to midnight',
                                size: 'small',
                                layout: 'horizontal',
                                defaultValue: true,
                                jsSetting: true,
                                parentId: '6eBJvoll3xtHJxdvOAlnB',
                                hidden: { _code: 'return  !getSettingValue(data?.showTime);', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInput({
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                id: '3be9da3f-f47e-49ae-b4c3-f5cc36e554d9',
                                inputType: 'switch',
                                propertyName: 'showNow',
                                label: 'Show Today/Now',
                                size: 'small',
                                layout: 'horizontal',
                                jsSetting: true,
                                parentId: '6eBJvoll3xtHJxdvOAlnB'
                            })
                            .addSettingsInput({
                                id: 'ac88293a-af3b-45a2-a57c-7703d882b473',
                                inputType: 'dropdown',
                                propertyName: 'disabledDateMode',
                                label: 'Disabled date mode',
                                dropdownOptions: [
                                    { value: 'none', label: 'None' },
                                    { value: 'functionTemplate', label: 'Function template' },
                                    { value: 'customFunction', label: 'Custom function' },
                                ]
                            })
                            .addSettingsInput({
                                id: 'ac88293a-af3b-45a2-a57c-8803d882b473',
                                inputType: 'dropdown',
                                propertyName: 'disabledDateTemplate',
                                label: 'Disabled date templates',
                                hidden: { _code: "return  getSettingValue(data.disabledDateMode) !== 'functionTemplate'", _mode: 'code', _value: false } as any,
                                dropdownOptions: [
                                    { value: "return current && current < moment().startOf('day');", label: 'Disable past dates' },
                                    { value: "return current && current > moment().endOf('day');", label: 'Disable future dates' }
                                ]
                            })
                            .addSettingsInput({
                                id: '41613cbd-1943-4df7-b2e3-e9842ba2c2b3',
                                inputType: 'dropdown',
                                propertyName: 'disabledTimeMode',
                                label: 'Disabled time mode',
                                defaultValue: 'none',
                                dropdownOptions: [
                                    { value: 'none', label: 'None' },
                                    { value: 'timeFunctionTemplate', label: 'Function template' },
                                    { value: 'customTimeFunction', label: 'Custom function' },
                                ],
                                hidden: {
                                    _code: 'return  !getSettingValue(data?.showTime);',
                                    _mode: 'code',
                                    _value: false
                                }
                            })
                            .addSettingsInput({
                                id: '692081a5-7e96-401e-90e0-9da5b5bfd836',
                                inputType: 'dropdown',
                                propertyName: 'disabledTimeTemplate',
                                label: 'Disabled time templates',
                                hidden: {
                                    _code: "return  getSettingValue(data.disabledTimeMode) !== 'timeFunctionTemplate';",
                                    _mode: 'code',
                                    _value: false
                                } as any,
                                dropdownOptions: [
                                    { value: "disabledPastTime", label: 'Disable past times' },
                                    { value: "disabledFutureTime", label: 'Disable future times' }
                                ]
                            })

                            .toJson()
                        ]
                    },
                    {
                        key: '4',
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
                            .toJson()
                        ]
                    },
                    {
                        key: '5',
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
                            .toJson()
                        ]
                    },
                    {
                        key: '6',
                        title: 'Appearance',
                        id: 'elgrlievlfwehhh848r8hsdnflsdnclurbd',
                        components: [...new DesignerToolbarSettings()
                            .addPropertyRouter({
                                id: 'styleRouter',
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
                                                        readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                        inputs: [
                                                            {
                                                                type: 'textField',
                                                                id: 'width-s4gmBg31azZC0UjZjpfTm',
                                                                label: "Width",
                                                                width: 85,
                                                                propertyName: "dimensions.width",
                                                                icon: "widthIcon",
                                                                tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"

                                                            },
                                                            {
                                                                type: 'textField',
                                                                id: 'minWidth-s4gmBg31azZC0UjZjpfTm',
                                                                label: "Min Width",
                                                                width: 85,
                                                                hideLabel: true,
                                                                propertyName: "dimensions.minWidth",
                                                                icon: "minWidthIcon",
                                                            },
                                                            {
                                                                type: 'textField',
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
                                                        readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                        inputs: [
                                                            {
                                                                type: 'textField',
                                                                id: 'height-s4gmBg31azZC0UjZjpfTm',
                                                                label: "Height",
                                                                width: 85,
                                                                propertyName: "dimensions.height",
                                                                icon: "heightIcon",
                                                                tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"
                                                            },
                                                            {
                                                                type: 'textField',
                                                                id: 'minHeight-s4gmBg31azZC0UjZjpfTm',
                                                                label: "Min Height",
                                                                width: 85,
                                                                hideLabel: true,
                                                                propertyName: "dimensions.minHeight",
                                                                icon: "minHeightIcon",
                                                            },
                                                            {
                                                                type: 'textField',
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
                                                        hidden: { _code: 'return  getSettingValue(data?.dimensions?.width) || getSettingValue(data?.dimensions?.height);', _mode: 'code', _value: false } as any,
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
                                                        hidden: { _code: 'return  !getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.border?.hideBorder);', _mode: 'code', _value: false } as any,
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
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "color";', _mode: 'code', _value: false } as any,
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
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "gradient";', _mode: 'code', _value: false } as any,
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
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) !== "url";', _mode: 'code', _value: false } as any,
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
                                                            hidden: { _code: 'return  getSettingValue(data[`${contexts.canvasContext?.designerDevice || "desktop"}`]?.background?.type) === "color";', _mode: 'code', _value: false } as any,
                                                            inline: true,
                                                            readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
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
                                                                type: 'numberField',
                                                                id: 'shadowStyleRow-offsetX',
                                                                label: 'Offset X',
                                                                hideLabel: true,
                                                                width: 60,
                                                                icon: "offsetHorizontalIcon",
                                                                propertyName: 'shadow.offsetX',
                                                            },
                                                            {
                                                                type: 'numberField',
                                                                id: 'shadowStyleRow-offsetY',
                                                                label: 'Offset Y',
                                                                hideLabel: true,
                                                                width: 60,
                                                                icon: 'offsetVerticalIcon',
                                                                propertyName: 'shadow.offsetY',
                                                            },
                                                            {
                                                                type: 'numberField',
                                                                id: 'shadowStyleRow-blurRadius',
                                                                label: 'Blur',
                                                                hideLabel: true,
                                                                width: 60,
                                                                icon: 'blurIcon',
                                                                propertyName: 'shadow.blurRadius',
                                                            },
                                                            {
                                                                type: 'numberField',
                                                                id: 'shadowStyleRow-spreadRadius',
                                                                label: 'Spread',
                                                                hideLabel: true,
                                                                width: 60,
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
                            }).toJson()]
                    },
                    {
                        key: '7',
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