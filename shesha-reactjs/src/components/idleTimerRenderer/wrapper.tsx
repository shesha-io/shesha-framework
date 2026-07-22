import React, { FC, PropsWithChildren } from 'react';
import { useSettingValue } from '@/providers/settings';
import { ISettingIdentifier } from '@/providers/settings/models';
import { SheshaSettingNames } from '@/providers/settings/sheshaSettingNames';
import { IdleTimerRenderer, ISecuritySettings } from './index';

const securitySettingsId: ISettingIdentifier = {
  name: SheshaSettingNames.SecuritySettings,
  module: 'Shesha',
};

/**
 * Loads security settings and renders IdleTimerRenderer.
 * IdleTimerRenderer handles token refresh on user activity regardless of auto-logoff setting,
 * and additionally handles idle logout/warning when auto-logoff is enabled.
 */
export const IdleTimerWrapper: FC<PropsWithChildren> = ({ children }) => {
  const { value: securitySettings } = useSettingValue<ISecuritySettings>(
    securitySettingsId,
  );

  // Always render IdleTimerRenderer so activity-based token refresh works even
  // while settings are loading or when auto-logoff is disabled. IdleTimerRenderer
  // treats undefined securitySettings as "auto-logoff off" and gates logout/warning
  // behaviour on the configured timeout internally.
  return <IdleTimerRenderer securitySettings={securitySettings}>{children}</IdleTimerRenderer>;
};

export default IdleTimerWrapper;
