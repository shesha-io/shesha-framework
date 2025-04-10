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
                                id: nanoid(),
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
                                id: nanoid(),
                                propertyName: 'hideLabel',
                                label: 'Label',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                hideLabel: true,
                            })
                            .addSettingsInput({
                                id: nanoid(),
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
                                        id: nanoid(),
                                        type: 'iconPicker',
                                        propertyName: 'defaultValue',
                                        label: 'Default Icon',
                                        jsSetting: true,
                                        defaultValue: 'UpCircleOutlined',
                                    },
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
                                        parentId: commonTabId,
                                        jsSetting: true,
                                        defaultValue: 'inherited'
                                    },
                                    {
                                        type: 'switch',
                                        id: nanoid(),
                                        propertyName: 'hidden',
                                        label: 'Hide',
                                        jsSetting: true,
                                    }
                                ],
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
                                            id: nanoid(),
                                            propertyName: 'pnlStyling',
                                            parentId: styleRouterId,
                                            label: 'Icon Styling',
                                            labelAlign: "right",
                                            expandIconPosition: "end",
                                            ghost: true,
                                            collapsible: 'header',
                                            content: {
                                                id: 'pnl24bf6-f76d-4139-a850-cbf06c8b71',
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInputRow({
                                                        id: nanoid(),
                                                        parentId: 'pnl24bf6-f76d-4139-a850-cbf06c8b71',
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
                                                                defaultValue: 8
                                                            },
                                                        ],
                                                    })
                                                    .addSettingsInputRow({
                                                        id: nanoid(),
                                                        parentId: 'pnl24bf6-f76d-4139-a850-cbf06c8b71',
                                                                inputs: [
                                                            {
                                                                type: 'numberField',
                                                                id: nanoid(),
                                                                propertyName: 'borderWidth',
                                                                label: 'Border Width',
                                                                jsSetting: true,
                                                                defaultValue: 1,
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
                                                        id: 'dimensionsStyleCollapsiblePanel',
                                                        propertyName: 'pnlMarginPadding',
                                                        label: 'Margin & Padding',
                                                        parentId: 'styleRouter',
                                                        labelAlign: 'right',
                                                        ghost: true,
                                                        collapsible: 'header',
                                                        content: {
                                                            id: 'dimensionsStylePnl',
                                                            components: [...new DesignerToolbarSettings()
                                                                .addStyleBox({
                                                                    id: nanoid(),
                                                                    propertyName: 'stylingBox',
                                                                    parentId: 'dimensionsStyleCollapsiblePanel',
                                                                })
                                                                .toJson()
                                                            ]
                                                        }
                                                    })

                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: nanoid(),
                                            propertyName: 'customStyle',
                                            label: 'Custom Styles',
                                            labelAlign: "right",
                                            expandIconPosition: "end",
                                            ghost: true,
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