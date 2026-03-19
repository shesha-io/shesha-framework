import React, { FC, PropsWithChildren } from 'react';
import { useSettingValue } from '@/providers/settings';
import { ISettingIdentifier } from '@/providers/settings/models';
import { IdleTimerRenderer, ISecuritySettings } from './index';

const securitySettingsId: ISettingIdentifier = {
  name: 'Shesha.Security',
  module: 'Shesha'
};

/**
 * Loads security settings and renders IdleTimerRenderer.
 * IdleTimerRenderer handles token refresh on user activity regardless of auto-logoff setting,
 * and additionally handles idle logout/warning when auto-logoff is enabled.
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

  // Always render IdleTimerRenderer so token refresh on user activity works
  // regardless of whether auto-logoff is enabled. IdleTimerRenderer gates
  // the logout/warning behavior on useAutoLogoff internally.
  return <IdleTimerRenderer securitySettings={securitySettings}>{children}</IdleTimerRenderer>;
};

export default IdleTimerWrapper;
