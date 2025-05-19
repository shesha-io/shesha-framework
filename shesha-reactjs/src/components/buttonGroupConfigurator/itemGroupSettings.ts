import { buttonTypes } from '@/designer-components/button/util';
import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';

export const getGroupSettings = (data) => {

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
                            .addSettingsInput({
                                id: 'f061d971-8b38-4b82-b192-563259afc159',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                inputType: 'textField',
                                propertyName: 'name',
                                label: 'Group Name',
                                jsSetting: false,
                                validate: {
                                    required: true
                                },
                            })
                            .addSettingsInputRow({
                                id: 'label-tooltip-s4gmBg31azZC0UjZjpfTm',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                inputs: [
                                    {
                                        id: "A-qcRVk-qlnGDLtFvK-2X",
                                        type: "textField",
                                        propertyName: "label",
                                        parentId: "root",
                                        label: "Label"
                                    },
                                    {
                                        id: "rupsZ1fuRwqetjQ0BC5sk",
                                        type: "textArea",
                                        propertyName: "tooltip",
                                        label: "Group Tooltip",
                                        labelAlign: "right",
                                        parentId: "root",
                                        hidden: false,
                                        allowClear: false
                                    }
                                ]
                            })
                            .addSettingsInputRow({
                                id: 'icon-drop-icon-s4gmBg31azZC0UjZjpfTm',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                inputs: [
                                    {
                                        id: "XZ_7OvzMkfC3GEzzrduwu",
                                        type: "iconPicker",
                                        propertyName: "icon",
                                        label: "Icon",
                                        labelAlign: "right",
                                        parentId: "root",
                                        hidden: false,
                                        settingsValidationErrors: []
                                    },
                                    {
                                        id: "YA_9x3zMkfC3GEzzrduwu",
                                        type: "iconPicker",
                                        propertyName: "downIcon",
                                        label: "Down Icon",
                                        labelAlign: "right",
                                        parentId: "root",
                                        hidden: false,
                                        settingsValidationErrors: []
                                    }
                                ],
                            })
                            .addSettingsInput({
                                id: "LKVj_90JMwALpmLN_6iZn",
                                inputType: "dropdown",
                                propertyName: "buttonType",
                                label: "Button Type",
                                labelAlign: "right",
                                parentId: "root",
                                hidden: false,
                                validate: {},
                                dropdownOptions: buttonTypes,
                                jsSetting: false
                            })
                            .addSettingsInputRow({
                                id: '12d700d6-ed4d-49d5-9cfd-fe8f0060f3b6',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                inputs: [
                                    {
                                        type: 'editModeSelector',
                                        id: 'editMode-s4gmBg31azZC0UjZjpfTm',
                                        propertyName: 'editMode',
                                        label: 'Edit Mode',
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
                            .addSettingsInput({
                                id: 'hide-when-empty-s4gmBg31azZC0UjZjpfTm',
                                inputType: 'switch',
                                label: 'Hide When Empty',
                                propertyName: 'hideWhenEmpty',
                                jsSetting: true,
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: '2',
                        title: 'Security',
                        id: '6Vw9iiDw9d0MD_Rh5cbIn',
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
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