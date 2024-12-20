import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { fontTypes, fontWeights, textAlign } from '../_settings/utils/font/utils';
import { getBorderInputs } from '../_settings/utils/border/utils';
import { getCornerInputs } from '../_settings/utils/border/utils';
import { IDropdownComponentProps } from './model';

export const getSettings = (data: IDropdownComponentProps) => {

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
                                        id: '57a40a33-7e10-4ce4-9f08-a34d24a83338',
                                        propertyName: 'placeholder',
                                        label: 'Placeholder',
                                        type: 'text',
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
                        title: 'Data',
                        id: '6eBJvoll3xtLJxdvOAlnB',
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                id: '3be9da3f-f47e-48ae-b4c3-f5cc36e534d9',
                                propertyName: 'defaultValue',
                                label: 'Default Value',
                                size: 'small',
                                jsSetting: true,
                                inputType: "number",
                                parentId: '6eBJvoll3xtLJxdvOAlnB'
                            })
                            .addSettingsInput({
                                id: 'Scip2BCqWk6HniFIJTwtA',
                                parentId: '6eBJvoll3xtLJxdvOAlnB',
                                label: "Mode",
                                propertyName: "mode",
                                inputType: "dropdown",
                                size: "small",
                                defaultValue: "single",
                                jsSetting: true,
                                dropdownOptions: [
                                    {
                                        value: "single",
                                        label: "Single"
                                    },
                                    {
                                        value: "tags",
                                        label: "tags"
                                    },
                                    {
                                        value: "multiple",
                                        label: "multiple"
                                    }
                                ]
                            })
                            .addSettingsInput({
                                id: 'Scip2BCqWk6HniFIGHwtA',
                                parentId: '6eBJvoll3xtLJxdvOAlnB',
                                label: "DataSource type",
                                propertyName: "dataSourceType",
                                inputType: "dropdown",
                                size: "small",
                                jsSetting: true,
                                dropdownOptions: [
                                    {
                                        value: "values",
                                        label: "Values"
                                    },
                                    {
                                        value: "referenceList",
                                        label: "Reference List"
                                    },
                                ],
                            })
                            .addContainer({
                                id: 'ELxx5jarWvInJXJF5xHN2',
                                parentId: '6eBJvoll3xtLJxdvOAlnB',
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
                                    .addRefListAutocomplete({
                                        id: 'Scip2BCqWk6HniFIGHwtA',
                                        parentId: '6eBJvoll3xtLJxdvOAlnB',
                                        propertyName: 'referenceListId',
                                        label: 'Reference List',
                                        isDynamic: true,
                                        settingsValidationErrors: [],
                                    })
                                    .addQueryBuilder({
                                        id: 'Scip2BCqWk6HniFIGHwtA',
                                        parentId: '6eBJvoll3xtLJxdvOAlnB',
                                        propertyName: 'filter',
                                        label: 'Items Filter',
                                        isDynamic: true,
                                        validate: {},
                                        settingsValidationErrors: [],
                                        modelType: 'Shesha.Framework.ReferenceListItem',
                                        version: 2
                                    })
                                    .addSettingsInput({
                                        id: 'Scip2BCqWk6HniFIGHHqA',
                                        parentId: '6eBJvoll3xtLJxdvOAlnB',
                                        label: "Value format",
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
                                                label: "Reference List item"
                                            },
                                            {
                                                value: "custom",
                                                label: "Custom"
                                            }
                                        ],
                                    })
                                    .addSettingsInput({
                                        readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                        id: '16ab0599-914d-4d2d-875c-765a495472f8',
                                        inputType: 'codeEditor',
                                        propertyName: 'incomeCustomJs',
                                        label: 'Key value',
                                        labelAlign: 'right',
                                        tooltip: 'Return key from the value',
                                        parentId: '6eBJvoll3xtLJxdvOAlnB',
                                        hidden: {
                                            "_code": "return  getSettingValue(data?.valueFormat) !== 'custom';",
                                            "_mode": "code",
                                            "_value": false
                                        } as any,
                                    })
                                    .addSettingsInput({
                                        readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                        id: '16ab0599-914d-4d2d-875c-765a495472g9',
                                        inputType: 'codeEditor',
                                        propertyName: 'outcomeCustomJs',
                                        label: 'Custom value',
                                        labelAlign: 'right',
                                        tooltip: 'Return value that will be stored as field value',
                                        parentId: '6eBJvoll3xtLJxdvOAlnB',
                                        hidden: {
                                            "_code": "return  getSettingValue(data?.valueFormat) !== 'custom';",
                                            "_mode": "code",
                                            "_value": false
                                        } as any,
                                    })
                                    .addSettingsInput({
                                        readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                        id: '16ab0500-914d-4d2d-875c-765a495472g9',
                                        inputType: 'codeEditor',
                                        propertyName: 'labelCustomJs',
                                        label: 'Item custom label',
                                        labelAlign: 'right',
                                        tooltip: 'Return label value',
                                        parentId: '6eBJvoll3xtLJxdvOAlnB',
                                    })
                                    .addSettingsInput({
                                        id: '3be9da3f-f47e-48ae-b4c3-f5cc36e534x0',
                                        parentId: '6eBJvoll3xtLJxdvOAlnB',
                                        readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                        inputType: 'switch',
                                        propertyName: 'disableItemValue',
                                        tooltip: 'Disable reference list from selection',
                                        label: 'Disable item value',
                                        jsSetting: true,
                                        layout: 'horizontal',
                                        version: 'latest'

                                    })
                                    .addSettingsInput({
                                        id: '03959ffd-cadb-496c-bf6d-b742f7f6edc5',
                                        parentId: '6eBJvoll3xtLJxdvOAlnB',
                                        inputType: 'textArea',
                                        propertyName: 'ignoredValues',
                                        label: 'Ignored Values',
                                        allowClear: true,
                                        tooltip: 'Pass an array of positive integers to ignore specific values. For example: [1, 2, 3].',
                                    })
                                    .addSettingsInput({
                                        id: '99629618-d725-4690-b744-97a4b0ae3b19',
                                        inputType: 'text',
                                        propertyName: 'dataSourceUrl',
                                        label: 'Data Source Url',
                                        labelAlign: 'right',
                                        parentId: '6eBJvoll3xtLJxdvOAlnB',
                                        language: 'typescript',
                                        hidden: {
                                            "_code": "return  getSettingValue(data.dataSourceType) !== 'url';",
                                            "_mode": "code",
                                            "_value": false
                                        },
                                        version: 2
                                    })

                                    .toJson()
                                ]

                            })
                            .addLabelValueEditor({
                                id: 'Scip2BCqWL4GniFIGHwdQ',
                                parentId: '6eBJvoll3xtLJxdvOAlnB',
                                propertyName: 'values',
                                label: 'Values',
                                labelName: 'label',
                                labelTitle: 'Label',
                                valueName: 'value',
                                valueTitle: 'Value',
                                hidden: {
                                    _code: `return  getSettingValue(data.dataSourceType) !== 'values';`,
                                    _mode: 'code',
                                    _value: false
                                },
                                mode: 'dialog',
                            })
                            .addSettingsInput({
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                id: '03959ffd-cadb-496c-bf6d-b742f7f6edc5',
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
                                parentId: '6eBJvoll3xtLJxdvOAlnB'
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: '3',
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
                                                        readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
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
                                                        readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
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
                                                            readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
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
                                                                type: 'text',
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
                        key: '6',
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