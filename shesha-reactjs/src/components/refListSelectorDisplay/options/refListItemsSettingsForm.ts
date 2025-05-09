import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { nanoid } from '@/utils/uuid';
import { FormLayout } from 'antd/lib/form/Form';

export const getSettings = () => {
    return {
        components: new DesignerToolbarSettings()
            .addSearchableTabs({
                id: nanoid(),
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
                        id: nanoid(),
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                id: 'cfd7d45e-c7e3-4a27-987b-dc525c412448',
                                propertyName: 'hidden',
                                label: 'Hide',
                                parentId: 'b8954bf6-f76d-4139-a850-c99bf06c8b69',
                                inputType: 'switch',
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: 'events',
                        title: 'Events',
                        id: nanoid(),
                        components: [...new DesignerToolbarSettings()
                            .addConfigurableActionConfigurator({
                                id: 'F3B46A95-703F-4465-96CA-A58496A5F78C',
                                propertyName: 'actionConfiguration',
                                label: 'Action Configuration',
                                hidden: false,
                                jsSetting: false,
                                parentId: '345c2181-fb9f-48ed-9631-864ac357807b',
                            })
                            .toJson()
                        ]
                    }
                ]
            })
            .toJson(),
        formSettings: {
            layout: 'vertical' as FormLayout,
            colon: false,
            labelCol: {
                span: 24
            },
            wrapperCol: {
                span: 24
            }
        }
    };
};