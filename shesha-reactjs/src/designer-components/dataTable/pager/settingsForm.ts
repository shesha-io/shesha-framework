import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
;

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
                            .addSettingsInputRow({
                                id: 'palceholder-tooltip-s4gmBg31azZC0UjZjpfTm',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                inputs: [
                                    {
                                        id: 'palceholder-tooltip-s4gmBg31azZC0UjZjpfTm',
                                        type: 'text',
                                        propertyName: 'componentName',
                                        label: 'Component Name',
                                        size: 'large',
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
                                        id: '12d700d6-ed4d-49d5-9cfd-fe8f0060f3b6',
                                        inputType: 'switch',
                                        type: 'switch',
                                        propertyName: 'showSizeChanger',
                                        label: 'Show Size Changer',
                                        size: 'small',
                                        jsSetting: true,
                                        defaultValue: true,
                                    },
                                    {
                                        id: '12d700d6-ed4d-49d5-9cfd-fe8f0060f3b6',
                                        type: 'switch',
                                        inputType: 'switch',
                                        propertyName: 'showTotalItems',
                                        label: 'Show Total Items',
                                        size: 'small',
                                        jsSetting: true,
                                        defaultValue: true,
                                    },
                                    {
                                        id: '12d700d6-ed4d-49d5-9cfd-fe8f0060f3b6',
                                        type: 'switch',
                                        inputType: 'switch',
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
                        key: '5',
                        title: 'Security',
                        id: '6Vw9iiDw9d0MD_Rh5cbIn',
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                id: '1adea529-1f0c-4def-bd41-ee166a5dfcd7',
                                inputType: 'permissions',
                                propertyName: 'pnlSecurity',
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