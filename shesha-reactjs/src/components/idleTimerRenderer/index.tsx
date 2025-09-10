import React, { FC, PropsWithChildren, useState } from 'react';
import {
  MIN_TIME,
  ONE_SECOND,
  SIXTY
  } from './util';
import { ISettingIdentifier } from '@/providers/settings/models';
import { useAuth } from '@/providers/auth';
import { useInterval } from 'react-use';
import { useSettingValue } from '@/providers/settings';
import { useStyles } from './styles/styles';

export interface IIdleTimerRendererProps { }

interface IIdleTimerState {
  readonly isIdle: boolean;
  readonly remainingTime: number;
}

const INIT_STATE: IIdleTimerState = {
  isIdle: false,
  remainingTime: SIXTY,
};

const autoLogoffTimeoutId: ISettingIdentifier = { name: 'Shesha.Security', module: 'Shesha' };

export const IdleTimerRenderer: FC<PropsWithChildren<IIdleTimerRendererProps>> = ({ children }) => {
  const { styles } = useStyles();
  const { value: securitySettings } = useSettingValue(autoLogoffTimeoutId);
  const timeoutValue = (securitySettings?.autoLogoffTimeout ?? 0) * 60; // Convert minutes to seconds
  const warningSeconds = securitySettings?.logoutWarningSeconds ?? SIXTY;

  const { logoutUser, loginInfo } = useAuth();

  const [state, setState] = useState<IIdleTimerState>(() => ({
    isIdle: false,
    remainingTime: warningSeconds,
  }));
  const { isIdle, remainingTime: rt } = state;

  const logout = () => logoutUser().then(() => setState(INIT_STATE));

  const doCountdown = () => {
    if (!rt) {
      logout();
    } else {
      setState(({ remainingTime: r, ...s }) => ({ ...s, remainingTime: r - 1 }));
    }
  };

  useInterval(() => {
    if (isIdle) {
      doCountdown();
    }
  }, ONE_SECOND);



  // Temporarily disabled - using AutoLogoutProvider instead
  return <>{children}</>;
};

export default IdleTimerRenderer;
