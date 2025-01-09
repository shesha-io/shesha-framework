import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { IButtonGroupComponentProps } from './models';

export const getSettings = (data: IButtonGroupComponentProps) => {
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
                                id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
                                propertyName: 'propertyName',
                                label: 'Component Name',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
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
                                        id: 'size-s4gmBg31azZC0UjZjpfTm',
                                        propertyName: 'size',
                                        description: "This will set the size for all buttons",
                                        label: 'Size',
                                        size: 'small',
                                        jsSetting: true,
                                        dropdownOptions: [
                                            {
                                                label: 'Small',
                                                value: 'small',
                                            },
                                            {
                                                label: 'Middle',
                                                value: 'middle',
                                            },
                                            {
                                                label: 'Large',
                                                value: 'large',
                                            }
                                        ],
                                    },
                                    {
                                        type: 'dropdown',
                                        id: 'space-size-s4gmBg31azZC0UjZjpfTm',
                                        propertyName: 'spaceSize',
                                        label: 'Space Size',
                                        tooltip: 'Enter default value of component. (formData, formMode, globalState) are exposed',
                                        jsSetting: true,
                                        dropdownOptions: [
                                            {
                                                label: 'Small',
                                                value: 'small',
                                            },
                                            {
                                                label: 'Middle',
                                                value: 'middle',
                                            },
                                            {
                                                label: 'Large',
                                                value: 'large',
                                            }
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
                            .addSettingsInputRow({
                                id: '1adea529-1f0c-4def-bd41-ee166a5dfcd7',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                inputs: [
                                    {
                                        id: 'items-s4gmBg31azZC0UjZjpfTm',
                                        parentId: 's4gmBg31azZC0UjZjpfTm',
                                        type: 'buttonGroupConfigurator',
                                        propertyName: 'items',
                                        label: 'Configure Buttons'
                                    },
                                    {
                                        id: 'is-inline-s4gmBg31azZC0UjZjpfTm',
                                        parentId: 's4gmBg31azZC0UjZjpfTm',
                                        type: 'switch',
                                        propertyName: 'isInline',
                                        label: 'Is Button Inline',
                                        jsSetting: true
                                    }
                                ],
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