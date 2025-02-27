import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';

export const getColumnSettings = (data) => {
    return {
        components: new DesignerToolbarSettings(data)
            .addSearchableTabs({
                id: 'columnSettingsTabs',
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
                        id: 'commonTab',
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                id: "840aee56-42d2-40ed-a2c6-57abb255fb95",
                                inputType: "dropdown",
                                propertyName: "columnType",
                                label: "Type",
                                labelAlign: "right",
                                parentId: "root",
                                hidden: false,
                                jsSetting: false,
                                dropdownOptions: [
                                    { label: "Action", value: "action" },
                                    { label: "CRUD Operations", value: "crud-operations" },
                                    { label: "Data", value: "data" },
                                    { label: "Form", value: "form" }
                                ],
                                validate: {
                                    required: true
                                }
                            })
                            .addContainer({
                                id: 'data-container',
                                parentId: 'commonTab',
                                hidden: {
                                    _code: 'return  getSettingValue(data?.columnType) !== "data";',
                                    _mode: 'code',
                                    _value: false
                                },
                                components: [
                                    ...new DesignerToolbarSettings()
                                        .addSettingsInput({
                                            id: '52f4460d-2e64-4d79-a900-7cd28b0bebd3',
                                            propertyName: 'propertyName',
                                            label: 'Property Name',
                                            inputType: 'propertyAutocomplete',
                                        })
                                        .toJson()
                                ]
                            })
                            .addContainer({
                                id: 'form-container',
                                parentId: 'commonTab',
                                hidden: {
                                    _code: 'return  getSettingValue(data?.columnType) !== "form";',
                                    _mode: 'code',
                                    _value: false
                                },
                                components: [
                                    ...new DesignerToolbarSettings()
                                        .addSettingsInput({
                                            id: '5314460d-2e64-4d79-a900-7cd28b0bebd3',
                                            propertyName: 'propertiesNames',
                                            label: 'Properties to fetch',
                                            inputType: 'propertyAutocomplete',
                                            mode: 'multiple'
                                        })
                                        .toJson()
                                ]
                            })
                            .addSettingsInputRow({
                                id: 'caption-description-row',
                                readOnly: false,
                                inputs: [
                                    {
                                        id: '5d4d56fb-d7f8-4835-a529-c4fa93f3596d',
                                        type: 'text',
                                        propertyName: 'caption',
                                        label: 'Caption'
                                    },
                                    {
                                        id: '9e5cad3f-b9af-4b19-aebb-d630265f6619',
                                        type: 'textArea',
                                        propertyName: 'description',
                                        label: 'Tooltip Description'
                                    }
                                ]
                            })
                            .addContainer({
                                id: 'action-container',
                                parentId: 'commonTab',
                                hidden: {
                                    _code: 'return  getSettingValue(data?.columnType) !== "action";',
                                    _mode: 'code',
                                    _value: false
                                },
                                components: [
                                    ...new DesignerToolbarSettings()
                                        .addSettingsInput({
                                            id: '91b404a6-4021-4b0a-b9ef-007167a93075',
                                            propertyName: 'icon',
                                            label: 'Icon',
                                            inputType: 'iconPicker'
                                        })
                                        .addConfigurableActionConfigurator({
                                            id: 'F3B46A95-703F-4465-96CA-A58496A5F78C',
                                            propertyName: 'actionConfiguration',
                                            label: 'Action Configuration'
                                        })
                                        .toJson()
                                ]
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: '2',
                        title: 'Display',
                        id: 'displayTab',
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInputRow({
                                id: 'width-settings-row',
                                readOnly: false,
                                inputs: [
                                    {
                                        id: 'b1803af1-37fb-4f03-b2b6-727b7f17730c',
                                        type: 'number',
                                        propertyName: 'minWidth',
                                        label: 'Min Width'
                                    },
                                    {
                                        id: '65bb484c-ab85-472c-bde7-e447c481ed47',
                                        type: 'number',
                                        propertyName: 'maxWidth',
                                        label: 'Max Width'
                                    }
                                ]
                            })
                            .addSettingsInput({
                                id: 'adc03af1-37fb-4f03-b2b6-727b7f17730c',
                                propertyName: 'minHeight',
                                label: 'Min Height',
                                inputType: 'number',
                                hidden: {
                                    _code: 'return  getSettingValue(data?.columnType) !== "form";',
                                    _mode: 'code',
                                    _value: false
                                }
                            })
                            .addSettingsInputRow({
                                id: 'visibility-settings-row',
                                readOnly: false,
                                inputs: [
                                    {
                                        id: '77ceb915-f4f9-4957-b62f-7a4e4ba00846',
                                        type: 'switch',
                                        propertyName: 'isVisible',
                                        label: 'Is Visible'
                                    },
                                    {
                                        id: '57a40a33-7e08-4ce4-9f08-a34d24a82338',
                                        type: 'dropdown',
                                        propertyName: 'anchored',
                                        label: 'Anchored',
                                        dropdownOptions: [
                                            { label: 'Left', value: 'left' },
                                            { label: 'Right', value: 'right' }
                                        ],
                                        allowClear: true
                                    }
                                ]
                            })
                            .addContainer({
                                id: 'data-display-container',
                                parentId: 'displayTab',
                                hidden: {
                                    _code: 'return  getSettingValue(data?.columnType) !== "data";',
                                    _mode: 'code',
                                    _value: false
                                },
                                components: [
                                    ...new DesignerToolbarSettings()
                                        .addSettingsInput({
                                            id: 'FGIcguhDkag6a801GXSgm',
                                            propertyName: 'displayComponent',
                                            label: 'Display component',
                                            inputType: 'componentSelector',
                                            componentType: 'output',
                                            noSelectionItemText: 'Default',
                                            noSelectionItemValue: '[default]'
                                        })
                                        .addSettingsInput({
                                            id: 'rYYm0wT-TDnBfqmOMVmIX',
                                            propertyName: 'editComponent',
                                            label: 'Edit component',
                                            inputType: 'componentSelector',
                                            componentType: 'input',
                                            noSelectionItemText: 'Not editable',
                                            noSelectionItemValue: '[not-editable]'
                                        })
                                        .addSettingsInput({
                                            id: 'L2bRSuStgiAmWfd5Z09CR',
                                            propertyName: 'createComponent',
                                            label: 'Create component',
                                            inputType: 'componentSelector',
                                            componentType: 'input',
                                            noSelectionItemText: 'Not editable',
                                            noSelectionItemValue: '[not-editable]'
                                        })
                                        .toJson()
                                ]
                            })
                            .addContainer({
                                id: 'form-display-container',
                                parentId: 'displayTab',
                                hidden: {
                                    _code: 'return  getSettingValue(data?.columnType) !== "form";',
                                    _mode: 'code',
                                    _value: false
                                },
                                components: [
                                    ...new DesignerToolbarSettings()
                                        .addSettingsInput({
                                            id: '1FGIcguhDkag6a801GXSgm',
                                            propertyName: 'displayFormId',
                                            label: 'Display form',
                                            inputType: 'formAutocomplete'
                                        })
                                        .addSettingsInput({
                                            id: '1rYYm0wT-TDnBfqmOMVmIX',
                                            propertyName: 'createFormId',
                                            label: 'Create form',
                                            inputType: 'formAutocomplete'
                                        })
                                        .addSettingsInput({
                                            id: '1L2bRSuStgiAmWfd5Z09CR',
                                            propertyName: 'editFormId',
                                            label: 'Edit form',
                                            inputType: 'formAutocomplete'
                                        })
                                        .toJson()
                                ]
                            })
                            .addSettingsInput({
                                id: '33IOXJRmPdfU9KLeDUF64',
                                propertyName: 'allowSorting',
                                label: 'Allow sorting',
                                inputType: 'switch',
                                hidden: {
                                    _code: 'return  getSettingValue(data?.columnType) !== "data";',
                                    _mode: 'code',
                                    _value: false
                                }
                            })
                            .addSettingsInput({
                                id: 'WwHwuygM-SKcqDbHVbPNkoMAcsUHGJ',
                                propertyName: 'backgroundColor',
                                label: 'Background color',
                                inputType: 'color',
                                allowClear: true
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: '3',
                        title: 'Security',
                        id: 'securityTab',
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                id: 'eda790c5-3cea-4755-9c75-039eca9318f3',
                                propertyName: 'customVisibility',
                                label: 'Custom Visibility',
                                inputType: 'codeEditor',
                                description: 'Enter custom visibility code. You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key.',
                            })
                            .addSettingsInput({
                                id: '1adea529-1f0c-4def-bd41-ee166a5dfcd7',
                                propertyName: 'permissions',
                                label: 'Permissions',
                                inputType: 'permissions'
                            })
                            .toJson()
                        ]
                    }
                ]
            }).toJson(),
        formSettings: {
            colon: true,
            layout: 'horizontal' as FormLayout,
            labelCol: { span: 8 },
            wrapperCol: { span: 16 }
        }
    };
};
