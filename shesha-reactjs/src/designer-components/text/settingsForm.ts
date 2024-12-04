import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { DEFAULT_CONTENT_TYPE } from './utils';
import { FONT_SIZES, PADDING_SIZES } from './models';

export const getSettings = (data: any) => {

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
                            .addSettingsInputRow({
                                id: 'type-default-value-s4gmBg31azZC0UjZjpfTm',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                inputs: [
                                    {
                                        type: 'dropdown',
                                        id: 'type-s4gmBg31azZC0UjZjpfTm',
                                        propertyName: 'textType',
                                        label: 'Type',
                                        size: 'small',
                                        jsSetting: true,
                                        allowClear: false,
                                        dropdownOptions: [
                                            {
                                                label: 'Span',
                                                value: 'span',
                                              },
                                              {
                                                label: 'Paragraph',
                                                value: 'paragraph',
                                              },
                                              {
                                                label: 'Title',
                                                value: 'title',
                                              },
                                        ],
                                    },
                                ],
                            })
                            .addSettingsInputRow({
                                id: 'type-default-value-s4gmBg31azZC0UjZjpfTm',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                inputs: [
                                    {
                                        type: 'dropdown',
                                        id: 'type-s4gmBg3QaaZC0UjZjpfTm',
                                        propertyName: 'contentDisplay',
                                        label: 'Content Display',
                                        size: 'small',
                                        jsSetting: true,
                                        allowClear: false,
                                        dropdownOptions: [
                                            {
                                                label: 'Content',
                                                value: 'content',
                                            },
                                            {
                                            label: 'Property name',
                                            value: 'name',
                                            },
                                        ],
                                    },
                                ],
                            })
                            .addSettingsInputRow({
                                id: 'type-default-value-s4gmBg31azZC0UjZjpfTm',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                inputs: [
                                    {
                                        type: 'dropdown',
                                        id: 'type-s2gmBg3QaaZC0UjZjpfTm',
                                        propertyName: 'textAlign',
                                        label: 'Text Align',
                                        size: 'small',
                                        jsSetting: true,
                                        allowClear: false,
                                        dropdownOptions: [
                                            {
                                                label: 'Left',
                                                value: 'start',
                                            },
                                            {
                                            label: 'Center',
                                            value: 'center',
                                            },
                                            {
                                            label: 'Right',
                                            value: 'end',
                                            },
                                        ],
                                    },
                                ],
                            })
                            .addSettingsInputRow({
                                id: 'type-default-value-s4gmBg31azZC0Uj0jpfTm',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                inputs: [
                                    {
                                        type: 'dropdown',
                                        id: 'type-s2gmBg3QaaZC0UjZjpfTm',
                                        propertyName: 'dataType',
                                        label: 'Data type',
                                        size: 'small',
                                        jsSetting: true,
                                        allowClear: false,
                                        dropdownOptions: [
                                            {
                                                label: 'string',
                                                value: 'string',
                                              },
                                              {
                                                label: 'date time',
                                                value: 'date-time',
                                              },
                                              {
                                                label: 'number',
                                                value: 'number',
                                              },
                                              {
                                                label: 'boolean',
                                                value: 'boolean',
                                              },
                                        ],
                                    },
                                ],
                            })
                            .addSettingsInputRow({
                                id: '12d700d6-ed4d-49d5-9cfd-fe8f0060f3b6',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                inputs: [
                                    {
                                        type: 'textArea',
                                        id: 'editMode-s4g2Bg31azZC0UjZjpfTm',
                                        propertyName: 'content',
                                        label: 'Content',
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
                                            id: 'colorStyleCollapsiblePanel',
                                            propertyName: 'pnlColorStyle',
                                            label: 'Color',
                                            labelAlign: 'right',
                                            parentId: 'styleRouter',
                                            ghost: true,
                                            collapsible: 'header',
                                            content: {
                                                id: 'borderStylePnl',
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInputRow({
                                                        id: 'color-s4gmBg31azZC0UjZjpfTm',
                                                        parentId: 'styleRouter',
                                                        readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                        inputs: [
                                                            {
                                                                type: 'dropdown',
                                                                id: 'color-s4gmBg31azZC0UjZjpfTm',
                                                                propertyName: 'color',
                                                                label: 'Type',
                                                                hideLabel: false,
                                                                width: 50,
                                                                defaultValue: DEFAULT_CONTENT_TYPE,
                                                                dropdownOptions: [
                                                                    {
                                                                        label: 'Default',
                                                                        value: '',
                                                                      },
                                                                      {
                                                                        label: 'Primary',
                                                                        value: 'primary',
                                                                      },
                                                                      {
                                                                        label: 'Secondary',
                                                                        value: 'secondary',
                                                                      },
                                                                      {
                                                                        label: 'Success',
                                                                        value: 'success',
                                                                      },
                                                                      {
                                                                        label: 'Warning',
                                                                        value: 'warning',
                                                                      },
                                                                      {
                                                                        label: 'Info',
                                                                        value: 'info',
                                                                      },
                                                                      {
                                                                        label: 'Error',
                                                                        value: 'danger',
                                                                      },
                                                                      {
                                                                        label: '(Custom Color)',
                                                                        value: 'custom',
                                                                      },
                                                                ],
                                                            },
                                                            {
                                                                type: 'color',
                                                                id: 'background-s4gmBg31azZC0UjZjpfTm',
                                                                propertyName: 'backgroundColor',
                                                                label: 'Background Color',
                                                                hideLabel: false,
                                                            },
                                                        ],
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
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
                                                                id: 'fontSize-s4gmBg31azZC0UjZjpfTm',
                                                                label: 'Size',
                                                                propertyName: 'fontSize',
                                                                hideLabel: false,
                                                                dropdownOptions: Object.keys(FONT_SIZES).map(key => ({ value: key, label: key })),    
                                                            },
                                                        ],
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: 'paddingStyleCollapsiblePanel',
                                            propertyName: 'pnlPaddingStyle',
                                            label: 'Margin & Padding',
                                            labelAlign: 'right',
                                            parentId: 'styleRouter',
                                            ghost: true,
                                            collapsible: 'header',
                                            content: {
                                                id: 'borderStylePnl',
                                                components: [...new DesignerToolbarSettings()
                                                    .addSettingsInput( {
                                                        inputType: 'dropdown',
                                                        id: 'padding-s4gmBg31azZC0UjZjpfTm',
                                                        label: 'Padding',
                                                        propertyName: 'padding',
                                                        hideLabel: false,
                                                        defaultValue: PADDING_SIZES.none,
                                                        dropdownOptions: Object.keys(PADDING_SIZES).map(key => ({ value: key, label: key })),
                                                    })
                                                    .toJson()
                                                ]
                                            }
                                        })
                                        .addCollapsiblePanel({
                                            id: 'customStyleCollapsiblePanel',
                                            propertyName: 'style',
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