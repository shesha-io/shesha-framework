import React, { FC, PropsWithChildren } from 'react';
import { useSettingValue } from '@/providers/settings';
import { ISettingIdentifier } from '@/providers/settings/models';
import { IdleTimerRenderer, ISecuritySettings } from './index';

const securitySettingsId: ISettingIdentifier = {
  name: 'Shesha.Security',
  module: 'Shesha'
};

/**
 * Wrapper component that checks if auto-logoff is enabled before rendering IdleTimerRenderer.
 * Loads security settings once and passes them to IdleTimerRenderer to avoid duplicate fetches.
 * When useAutoLogoff is false, children render directly without any idle timer overhead.
 * When useAutoLogoff is true, renders IdleTimerRenderer with pre-loaded security settings.
 */
export const IdleTimerWrapper: FC<PropsWithChildren> = ({ children }) => {
  const { value: securitySettings, loadingState } = useSettingValue<ISecuritySettings>(
    securitySettingsId
  );

  // While settings are loading, render children without idle timer
  // This prevents blocking the UI while settings load
  if (loadingState !== 'ready') {
    return <>{children}</>;
  }

  // If auto-logoff is disabled, render children directly without any idle timer overhead
  const useAutoLogoff = securitySettings?.useAutoLogoff ?? false;
  if (!useAutoLogoff) {
    return <>{children}</>;
  }

  // Auto-logoff is enabled, render with idle timer monitoring
  return <IdleTimerRenderer securitySettings={securitySettings}>{children}</IdleTimerRenderer>;
};

export default IdleTimerWrapper;
