import { useMemo } from 'react';
import { useSheshaApplication } from '@/providers';
import { ISettingsComponent } from '@/designer-components/settingsInput/settingsInput';

export const useSettingsComponents = (): ISettingsComponent[] => {
  const { settingsComponentGroups } = useSheshaApplication();
  
  return useMemo(() => {
    const components: ISettingsComponent[] = [];
    settingsComponentGroups?.forEach(group => {
      group.components.forEach(component => {
        components.push(component);
      });
    });
    return components;
  }, [settingsComponentGroups]);
};
