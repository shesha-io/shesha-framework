import { useMemo } from 'react';
import { useSheshaApplication } from '@/providers';
import { ISettingsComponent } from '@/designer-components/settingsInput/settingsInput';

export const useSettingsComponents = (): ISettingsComponent[] => {
  const { settingsComponentGroups } = useSheshaApplication();

  return useMemo(() => {
    return settingsComponentGroups?.flatMap((group) => group.components || []) || [];
  }, [settingsComponentGroups]);
};
