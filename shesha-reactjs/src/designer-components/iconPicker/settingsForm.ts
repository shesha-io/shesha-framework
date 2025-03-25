import { nanoid } from '@/utils/uuid';
import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';

export const getSettings = (data: any) => {
    const searchableTabsId = nanoid();
    const commonTabId = nanoid();
    const securityTabId = nanoid();
    const appearanceTabId = nanoid();
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
                        key: 'common',
                        title: 'Common',
                        id: commonTabId,
                        components: [...new DesignerToolbarSettings()
                            .addContextPropertyAutocomplete({
                                id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
                                propertyName: 'propertyName',
                                parentId: commonTabId,
                                label: 'Property Name',
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
                                parentId: commonTabId,
                                defaultValue: true,
                              })
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: commonTabId,
                                inputs: [
                                    {
                                        type: 'dropdown',
                                        id: nanoid(),
                                        propertyName: 'textAlign',
                                        label: 'Icon Align',
                                        jsSetting: true,
                                        defaultValue: 'start',
                                        dropdownOptions: [
                                            { label: 'Left', value: 'start' },
                                            { label: 'Center', value: 'center' },
                                            { label: 'Right', value: 'end' },
                                        ],
                                    },
                                ],
                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInput({
                                id: '2d32fe70-99a0-4825-ae6c-8b933004e119',
                                inputType: 'textArea',
                                propertyName: 'description',
                                parentId: commonTabId,
                                label: 'Tooltip',
                                jsSetting: true,
                            })
                            .addSettingsInputRow({
                                id: nanoid(),
                                parentId: commonTabId,
                                inputs: [
                                    {
                                        type: 'switch',
                                        id: nanoid(),
                                        propertyName: 'hidden',
                                        label: 'Hide',
                                        jsSetting: true,
                                    }
                                ],
                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInput({
                                id: '24a8be15-98eb-40f7-99ea-ebb602693e9c',
                                inputType: 'editModeSelector',
                                propertyName: 'editMode',
                                label: 'Edit Mode',
                                parentId: commonTabId,
                                jsSetting: true,
                                defaultValue: 'inherited'
                            })
                            .addSettingsInput({
                                id: nanoid(),
                                inputType: 'iconPicker',
                                propertyName: 'defaultValue',
                                label: 'Default Icon',
                                parentId: commonTabId,
                                jsSetting: true,
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: 'appearance',
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
                                    _code: "return contexts.canvasContext?.designerDevice || 'desktop';",
                                    _value: ""
                                },
                                components: [
                                    ...new DesignerToolbarSettings()
                                        .addCollapsiblePanel({
                                            id: 'eb91c2f5-592e-4f60-ba1a-f1d2011a5091',
                                            propertyName: 'pnlStyling',
                                            parentId: styleRouterId,
                                            label: 'Icon Styling',
                                            labelAlign: "right",
                                            expandIconPosition: "start",
                                            ghost: true,
                                            collapsible: 'header',
                                            content: {
                                                id: 'pnl24bf6-f76d-4139-a850-cbf06c8b71',
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInputRow({
                                                        id: nanoid(),
                                                        parentId: 'pnl24bf6-f76d-4139-a850-cbf06c8b71',
                                                        readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                        inputs: [
                                                            {
                                                                type: 'colorPicker',
                                                                id: nanoid(),
                                                                propertyName: 'color',
                                                                label: 'Color',
                                                                jsSetting: true,
                                                            },
                                                            {
                                                                type: 'numberField',
                                                                id: nanoid(),
                                                                propertyName: 'fontSize',
                                                                label: 'Size',
                                                                defaultValue: 24,
                                                                jsSetting: true,
                                                            },
                                                        ],
                                                    })
                                                    .addSettingsInputRow({
                                                        id: nanoid(),
                                                        parentId: 'pnl24bf6-f76d-4139-a850-cbf06c8b71',
                                                        readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                        inputs: [
                                                            {
                                                                type: 'colorPicker',
                                                                id: nanoid(),
                                                                propertyName: 'backgroundColor',
                                                                label: 'Background Color',
                                                                jsSetting: true,
                                                            },
                                                            {
                                                                type: 'numberField',
                                                                id: nanoid(),
                                                                propertyName: 'borderRadius',
                                                                label: 'Border Radius',
                                                                jsSetting: true,
                                                            },
                                                        ],
                                                    })
                                                    .addSettingsInputRow({
                                                        id: nanoid(),
                                                        parentId: 'pnl24bf6-f76d-4139-a850-cbf06c8b71',
                                                        readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                        inputs: [
                                                            {
                                                                type: 'numberField',
                                                                id: nanoid(),
                                                                propertyName: 'borderWidth',
                                                                label: 'Border Width',
                                                                jsSetting: true,
                                                            },
                                                            {
                                                                type: 'colorPicker',
                                                                id: nanoid(),
                                                                propertyName: 'borderColor',
                                                                label: 'Border Color',
                                                                jsSetting: true,
                                                            },
                                                        ],
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
                                                    .addStyleBox({
                                                        id: nanoid(),
                                                        propertyName: 'stylingBox',
                                                        label: 'Margin & Padding',
                                                        parentId: 'pnl24bf6-f76d-4139-a850-cbf06c8b71',
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: nanoid(),
                                            propertyName: 'customStyle',
                                            label: 'Custom Style',
                                            labelAlign: "right",
                                            expandIconPosition: "start",
                                            ghost: true,
                                            parentId: styleRouterId,
                                            collapsible: 'header',
                                            content: {
                                                id: nanoid(),
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInput({
                                                        readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                        id: nanoid(),
                                                        inputType: 'codeEditor',
                                                        propertyName: 'style',
                                                        label: 'Style',
                                                        description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                                                        jsSetting: true,
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .toJson()
                                ]
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: 'security',
                        title: 'Security',
                        id: securityTabId,
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                id: '4d81ae9d-d222-4fc1-85b2-4dc3ee6a3721',
                                inputType: 'permissions',
                                propertyName: 'permissions',
                                label: 'Permissions',
                                parentId: securityTabId,
                                jsSetting: true,
                            })
                            .toJson()
                        ]
                    }
                ]
            })
            .toJson(),
        formSettings: {
            colon: false,
            layout: 'vertical' as FormLayout,
            labelCol: { span: 24 },
            wrapperCol: { span: 24 }
        }
    };
};