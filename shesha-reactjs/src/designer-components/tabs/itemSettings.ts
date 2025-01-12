import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';

export const getItemSettings = () => {
    return {
        components: new DesignerToolbarSettings()
            .addSearchableTabs({
                id: 'W_m7doMyCpCYwAYDfRh6I',
                propertyName: 'settingsTabs',
                parentId: 'root',
                label: 'Settings',
                hideLabel: true,
                labelAlign: 'right',
                ghost: true,
                size: 'small',
                tabs: [
                    {
                        key: '1',
                        title: 'Common',
                        id: 's4gmBg31azZC0UjZjpfTm',
                        type: '',
                        components: [
                            ...new DesignerToolbarSettings()
                                .addCollapsiblePanel({
                                    id: 'customStyleCollapsiblePanel',
                                    propertyName: 'style',
                                    label: 'Custom Styles',
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
                                                hideLabel: false,
                                                label: 'Style',
                                                description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                                            })
                                            .toJson()
                                        ]
                                    }
                                })
                                .addSettingsInput({
                                    id: '14817287-cfa6-4f8f-a998-4eb6cc7cb818',
                                    inputType: 'text',
                                    propertyName: 'name',
                                    label: 'Name',
                                    labelAlign: 'right',
                                    jsSetting: false,
                                    parentId: 'root'
                                })
                                .addSettingsInput({
                                    id: '02deeaa2-1dc7-439f-8f1a-1f8bec6e8425',
                                    inputType: 'text',
                                    propertyName: 'title',
                                    label: 'Title',
                                    labelAlign: 'right',
                                    parentId: 'root'
                                })
                                .addSettingsInput({
                                    id: '4bb6cdc7-0657-4e41-8c50-effe14d0dc96',
                                    inputType: 'text',
                                    propertyName: 'key',
                                    label: 'Key',
                                    jsSetting: false,
                                    labelAlign: 'right',
                                    parentId: 'root'
                                })
                                .addSettingsInput({
                                    id: '29be3a6a-129a-4004-a627-2b257ecb78b4',
                                    inputType: 'text',
                                    propertyName: 'className',
                                    label: 'Class Name',
                                    labelAlign: 'right',
                                    parentId: 'root'
                                })
                                .addSettingsInput({
                                    id: 'caed91a6-3e9e-4f04-9800-7d9c7a3ffb80',
                                    inputType: 'switch',
                                    propertyName: 'animated',
                                    label: 'Animated',
                                    labelAlign: 'right',
                                    parentId: 'root',
                                    hidden: false,
                                    validate: {}
                                })
                                .addSettingsInput({
                                    id: '4595a895-5078-4986-934b-c5013bf315ad',
                                    inputType: 'iconPicker',
                                    propertyName: 'icon',
                                    label: 'Icon',
                                    labelAlign: 'right',
                                    parentId: 'root',
                                    hidden: false
                                })
                                .addSettingsInput({
                                    id: '81da0da4-00db-4d6b-9f16-b364a6f9d9e1',
                                    inputType: 'switch',
                                    propertyName: 'forceRender',
                                    label: 'Force Render',
                                    labelAlign: 'right',
                                    parentId: 'root',
                                    hidden: false,
                                    validate: {}
                                })
                                .addSettingsInput({
                                    id: 'd1e06550-826c-4db9-9b9f-ce05e565f64f',
                                    inputType: 'switch',
                                    propertyName: 'hidden',
                                    label: 'Hidden',
                                    labelAlign: 'right',
                                    parentId: 'root',
                                    hidden: false,
                                    validate: {}
                                })
                                .addSettingsInput({
                                    id: '24a8be15-98eb-40f7-99ea-ebb602693e9c',
                                    inputType: 'editModeSelector',
                                    propertyName: 'editMode',
                                    parentId: 'root',
                                    label: 'Edit mode'
                                })
                                .toJson()
                        ]
                    },
                    {
                        key: '4',
                        title: 'Security',
                        id: '6Vw9iiDw9d0MD_Rh5cbIn',
                        type: '',
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