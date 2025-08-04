import { useEffect } from 'react';
import { useSheshaApplication } from '@/providers';
import BasicComponent from '@/designer-components/test-registration-comp/Index';
import { ISettingsComponent, ISettingsComponentGroup } from '@/designer-components/settingsInput/settingsInput';

export const useRegisterSettingsComponents = () => {
    const { registerSettingsComponents } = useSheshaApplication();

    useEffect(() => {
        const settingsComponents: ISettingsComponentGroup[] = [
            {
                name: 'Enterprise Settings Components',
                components: [
                    {
                        componentType: 'basicComponent',
                        component: BasicComponent,
                        readonly: false,
                        type: 'basicComponent',
                        isInput: true,
                        name: 'Basic Component',
                        icon: 'SettingOutlined'
                    } as ISettingsComponent
                ],
            },
        ];

        registerSettingsComponents('core-settings', settingsComponents);
    }, [registerSettingsComponents]);
};
