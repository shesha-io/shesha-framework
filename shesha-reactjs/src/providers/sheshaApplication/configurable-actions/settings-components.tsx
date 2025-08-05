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
                        component: BasicComponent,
                        type: 'basicComponent',
                    } as ISettingsComponent
                ],
            },
        ];

        registerSettingsComponents('core-settings', settingsComponents);
    }, [registerSettingsComponents]);
};
