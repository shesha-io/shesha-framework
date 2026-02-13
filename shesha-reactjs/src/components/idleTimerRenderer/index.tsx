import React, { FC, PropsWithChildren, useState, useEffect, useCallback } from 'react';
import {
  getPercentage,
  getStatus,
  getTimeFormat,
  ONE_SECOND,
  WARNING_DURATION
} from './util';
import { useIdleTimer } from 'react-idle-timer';
import { ISettingIdentifier } from '@/providers/settings/models';
import { Modal, Progress } from 'antd';
import { useAuth } from '@/providers/auth';
import { useInterval } from 'react-use';
import { useSettingValue } from '@/providers/settings';
import { useStyles } from './styles/styles';
import { getLocalStorage } from '@/utils/storage';
import { isTokenAboutToExpire, saveUserToken } from '@/utils/auth';
import { useMutate } from '@/hooks';
import { DEFAULT_ACCESS_TOKEN_NAME } from '@/providers/sheshaApplication/contexts';
import { AuthenticateResultModelAjaxResponse } from '@/apis/tokenAuth';

export interface IIdleTimerRendererProps { }

interface IIdleTimerState {
  readonly isWarningVisible: boolean;
  readonly remainingTime: number;
  readonly isCountingDown: boolean;
}

interface ISecuritySettings {
  autoLogoffTimeout: number;
  defaultEndpointAccess: number;
  mobileLoginPinLifetime: number;
  resetPasswordEmailLinkLifetime: number;
  resetPasswordSmsOtpLifetime: number;
  resetPasswordViaSecurityQuestionsNumQuestionsAllowed: number;
  useResetPasswordViaEmailLink: boolean;
  useResetPasswordViaSecurityQuestions: boolean;
  useResetPasswordViaSmsOtp: boolean;
}

const INIT_STATE: IIdleTimerState = {
  isWarningVisible: false,
  remainingTime: WARNING_DURATION,
  isCountingDown: false,
};

const STORAGE_KEYS = {
  IDLE_TIMER_LOGOUT: 'shesha:idleTimer:logout',
  IDLE_TIMER_WARNING_STATE: 'shesha:idleTimer:warningState'
};

const autoLogoffTimeoutSettingId: ISettingIdentifier = { name: 'Shesha.Security', module: 'Shesha' };

export const IdleTimerRenderer: FC<PropsWithChildren<IIdleTimerRendererProps>> = ({ children }) => {
  const { styles } = useStyles();
  const { value: securitySettings } = useSettingValue<ISecuritySettings>(autoLogoffTimeoutSettingId);
  const autoLogoffTimeout = securitySettings?.autoLogoffTimeout;
  const { mutate: refreshTokenHttp } = useMutate<any, AuthenticateResultModelAjaxResponse>();
  // Use 40 as safe default for hook validation when timer would be disabled
  // Timer requires timeout > WARNING_DURATION (30s) to show warning before logout
  // Actual enable/disable is controlled by isTimeoutSet condition
  const timeoutSeconds = (autoLogoffTimeout !== undefined && autoLogoffTimeout > WARNING_DURATION) ? autoLogoffTimeout : 40;

  const { logoutUser, loginInfo } = useAuth();

  const [state, setState] = useState<IIdleTimerState>(INIT_STATE);
  const { isWarningVisible, remainingTime: rt, isCountingDown } = state;

  // Idle timer is enabled only when:
  // 1. Settings are loaded (autoLogoffTimeout !== undefined)
  // 2. Auto logoff is not explicitly disabled (autoLogoffTimeout > 0)
  // 3. Timeout is greater than warning duration (> WARNING_DURATION seconds to allow 30s warning)
  // 4. User is logged in (loginInfo exists)
  const isTimeoutSet = autoLogoffTimeout !== undefined && autoLogoffTimeout > WARNING_DURATION && !!loginInfo;
  const timeout = getTimeFormat(timeoutSeconds);
  const visible = isWarningVisible && isTimeoutSet;

  // Broadcast functions for multi-tab sync
  const broadcastLogout = useCallback(() => {
    try {
      const storage = getLocalStorage();
      if (storage) {
        storage.setItem(STORAGE_KEYS.IDLE_TIMER_LOGOUT, Date.now().toString());
      }
    } catch (err) {
      console.error('Failed to broadcast logout', err);
    }
  }, []);

  const broadcastWarningState = useCallback((isVisible: boolean) => {
    try {
      const storage = getLocalStorage();
      if (storage) {
        storage.setItem(
          STORAGE_KEYS.IDLE_TIMER_WARNING_STATE,
          JSON.stringify({ isVisible, timestamp: Date.now() })
        );
      }
    } catch (err) {
      console.error('Failed to broadcast warning state', err);
    }
  }, []);

  const logout = useCallback(() => {
    broadcastLogout();
    logoutUser().then(() => setState(INIT_STATE));
  }, [broadcastLogout, logoutUser]);

  // Event handlers for react-idle-timer
  const handlePrompt = useCallback(() => {
    // Called 30 seconds before timeout
    setState({
      isWarningVisible: true,
      remainingTime: WARNING_DURATION,
      isCountingDown: true
    });
    broadcastWarningState(true);
  }, [broadcastWarningState]);

  const handleActive = useCallback(() => {
    // User became active - close modal if open
    if (state.isWarningVisible) {
      setState(INIT_STATE);
      broadcastWarningState(false);
    }
  }, [state.isWarningVisible, broadcastWarningState]);

  const handleIdle = useCallback(() => {
    // Timeout reached - auto logout
    logout();
  }, [logout]);

  const onAction = useCallback(() => {
    if (isTokenAboutToExpire(DEFAULT_ACCESS_TOKEN_NAME)) {
      refreshTokenHttp({ url: '/api/TokenAuth/RefreshToken', httpVerb: 'post' })
        .then((response) => {
          if (response?.result) {
            saveUserToken(
              {
                accessToken: response.result.accessToken,
                expireInSeconds: response.result.expireInSeconds,
                expireOn: response.result.expireOn
              },
              DEFAULT_ACCESS_TOKEN_NAME
            );
          }
        })
        .catch((error) => {
          console.error('Failed to refresh token:', error);
        });
    }
  }, [refreshTokenHttp]);

  // Configure idle timer hook
  const { activate } = useIdleTimer({
    timeout,
    promptBeforeIdle: WARNING_DURATION * ONE_SECOND,
    crossTab: true,
    onPrompt: handlePrompt,
    onIdle: handleIdle,
    onActive: handleActive,
    onAction: onAction,
    stopOnIdle: false,
    startOnMount: true,
    disabled: !isTimeoutSet
  });

  // Countdown logic
  const doCountdown = () => {
    if (rt <= 1) {
      logout();
    } else {
      setState(s => ({ ...s, remainingTime: s.remainingTime - 1 }));
    }
  };

  useInterval(() => {
    if (isCountingDown && isWarningVisible) {
      doCountdown();
    }
  }, ONE_SECOND);

  // Storage event listener for cross-tab sync
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Handle logout broadcast
      if (e.key === STORAGE_KEYS.IDLE_TIMER_LOGOUT) {
        logout();
      }

      // Handle warning state sync
      if (e.key === STORAGE_KEYS.IDLE_TIMER_WARNING_STATE && e.newValue) {
        try {
          const warningState = JSON.parse(e.newValue);
          if (warningState.isVisible && !state.isWarningVisible) {
            setState({
              isWarningVisible: true,
              remainingTime: WARNING_DURATION,
              isCountingDown: true
            });
          } else if (!warningState.isVisible && state.isWarningVisible) {
            setState(INIT_STATE);
          }
        } catch (err) {
          console.error('Failed to parse warning state', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [state.isWarningVisible, logout]);

  // Modal handlers
  const onOk = useCallback(() => {
    // User chose "Log Out Now"
    logout();
  }, [logout]);

  const onCancel = useCallback(() => {
    // User chose "Stay Logged In"
    activate(); // Reset timer
    setState(INIT_STATE);
    broadcastWarningState(false);
  }, [activate, broadcastWarningState]);

  if (!isTimeoutSet) {
    return <>{children}</>;
  }

  return (
    <div className={styles.shaIdleTimerRenderer}>
      {children}
      <Modal
        title="Session Expiring"
        open={visible}
        okText="Log Out Now"
        cancelText="Stay Logged In"
        onOk={onOk}
        onCancel={onCancel}
        closable={false}
        maskClosable={false}
      >
        <div className={styles.idleTimerContent}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <Progress type="circle" percent={getPercentage(rt)} status={getStatus(rt)} format={() => <>{rt}</>} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p>You will be logged out in <strong>{rt} seconds</strong> due to inactivity.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default IdleTimerRenderer;
