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
import { useHttpClient } from '@/providers';
import { DEFAULT_ACCESS_TOKEN_NAME } from '@/providers/sheshaApplication/contexts';
import { RefreshTokenResultModelAjaxResponse } from '@/apis/tokenAuth';

export interface IIdleTimerRendererProps { }

interface IIdleTimerState {
  readonly isWarningVisible: boolean;
  readonly remainingTime: number;
  readonly isCountingDown: boolean;
  readonly pendingLogout: boolean;
}

interface ISecuritySettings {
  autoLogoffTimeout: number;
  useAutoLogoff: boolean;
  defaultEndpointAccess: number;
  mobileLoginPinLifetime: number;
  resetPasswordEmailLinkLifetime: number;
  resetPasswordSmsOtpLifetime: number;
  resetPasswordViaSecurityQuestionsNumQuestionsAllowed: number;
  useResetPasswordViaEmailLink: boolean;
  useResetPasswordViaSecurityQuestions: boolean;
  useResetPasswordViaSmsOtp: boolean;
}

interface IWarningState {
  isVisible: boolean;
  timestamp: number;
}

interface ITokenRefreshData {
  expireOn: string;
  timestamp: number;
}

const INIT_STATE: IIdleTimerState = {
  isWarningVisible: false,
  remainingTime: WARNING_DURATION,
  isCountingDown: false,
  pendingLogout: false,
};

const STORAGE_KEYS = {
  IDLE_TIMER_LOGOUT: 'shesha:idleTimer:logout',
  IDLE_TIMER_WARNING_STATE: 'shesha:idleTimer:warningState',
  IDLE_TIMER_TOKEN_REFRESH: 'shesha:idleTimer:tokenRefresh'
};

// Type guards for storage event data
const isWarningState = (value: unknown): value is IWarningState => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'isVisible' in value &&
    typeof (value as any).isVisible === 'boolean'
  );
};

const isTokenRefreshData = (value: unknown): value is ITokenRefreshData => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'expireOn' in value &&
    typeof (value as any).expireOn === 'string'
  );
};

const autoLogoffTimeoutSettingId: ISettingIdentifier = { name: 'Shesha.Security', module: 'Shesha' };

interface IIdleHandler {
  setActivate: (activate: () => void) => void;
  setStateUpdater: (updater: (state: IIdleTimerState | ((prev: IIdleTimerState) => IIdleTimerState)) => void) => void;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  handlePrompt: () => void;
  handleActive: () => void;
  handleIdle: () => void;
  onAction: () => void;
  handleStorageChange: (e: StorageEvent) => void;
  isWarningVisible: () => boolean;
}

class IdleHandler implements IIdleHandler {
  private activateFn: (() => void) | null = null;
  private setStateFn: ((state: IIdleTimerState | ((prev: IIdleTimerState) => IIdleTimerState)) => void) | null = null;
  private warningVisible: boolean = false;

  constructor(
    private authenticator: ReturnType<typeof useAuth>,
    private httpClient: ReturnType<typeof useHttpClient>,
    private logoutUser: () => Promise<void>
  ) { }

  setActivate = (activate: () => void) => {
    this.activateFn = activate;
  };

  setStateUpdater = (updater: (state: IIdleTimerState | ((prev: IIdleTimerState) => IIdleTimerState)) => void) => {
    this.setStateFn = updater;
  };

  private broadcastLogout = () => {
    try {
      const storage = getLocalStorage();
      if (storage) {
        storage.setItem(STORAGE_KEYS.IDLE_TIMER_LOGOUT, Date.now().toString());
      }
    } catch (err) {
      console.error('Failed to broadcast logout', err);
    }
  };

  private broadcastWarningState = (isVisible: boolean) => {
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
  };

  private broadcastTokenRefresh = (expireOn: string) => {
    try {
      const storage = getLocalStorage();
      if (storage) {
        storage.setItem(
          STORAGE_KEYS.IDLE_TIMER_TOKEN_REFRESH,
          JSON.stringify({ expireOn, timestamp: Date.now() })
        );
      }
    } catch (err) {
      console.error('Failed to broadcast token refresh', err);
    }
  };

  logout = () => {
    this.broadcastLogout();
    this.logoutUser()
      .then(() => {
        this.warningVisible = false;
        this.setStateFn?.(INIT_STATE);
      })
      .catch((error) => {
        console.error('Failed to logout user:', error);
        this.warningVisible = false;
        this.setStateFn?.(INIT_STATE);
      });
  };

  refreshToken = (): Promise<boolean> => {
    return this.httpClient.post<RefreshTokenResultModelAjaxResponse>('/api/TokenAuth/RefreshToken')
      .then(({ data: response }) => {
        if (response?.result) {
          saveUserToken(
            {
              accessToken: response.result.accessToken,
              expireInSeconds: response.result.expireInSeconds,
              expireOn: response.result.expireOn
            },
            DEFAULT_ACCESS_TOKEN_NAME
          );

          if (response.result.expireOn) {
            this.authenticator.updateTokenExpiration(response.result.expireOn);
            // Refresh authorization headers so httpClient uses the new token
            this.authenticator.refreshAuthHeaders();
            this.broadcastTokenRefresh(response.result.expireOn);
          }

          this.activateFn?.();
          return true;
        }
        return false;
      })
      .catch((error) => {
        console.error('Failed to refresh token:', error);
        return false;
      });
  };

  handlePrompt = () => {
    this.warningVisible = true;
    this.setStateFn?.({
      isWarningVisible: true,
      remainingTime: WARNING_DURATION,
      isCountingDown: true,
      pendingLogout: false
    });
    this.broadcastWarningState(true);
  };

  handleActive = () => {
    if (this.warningVisible) {
      this.warningVisible = false;
      this.setStateFn?.(INIT_STATE);
      this.broadcastWarningState(false);
    }
  };

  handleIdle = () => {
    this.logout();
  };

  onAction = () => {
    if (this.warningVisible) {
      return;
    }

    if (isTokenAboutToExpire(DEFAULT_ACCESS_TOKEN_NAME)) {
      this.refreshToken();
    }
  };

  handleStorageChange = (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.IDLE_TIMER_LOGOUT) {
      this.logout();
    }

    if (e.key === STORAGE_KEYS.IDLE_TIMER_WARNING_STATE && e.newValue) {
      try {
        const parsed: unknown = JSON.parse(e.newValue);
        if (!isWarningState(parsed)) {
          console.error('Invalid warning state data', parsed);
          return;
        }

        const warningState = parsed;
        if (warningState.isVisible && !this.warningVisible) {
          this.warningVisible = true;
          this.setStateFn?.({
            isWarningVisible: true,
            remainingTime: WARNING_DURATION,
            isCountingDown: true,
            pendingLogout: false
          });
        } else if (!warningState.isVisible && this.warningVisible) {
          this.warningVisible = false;
          this.setStateFn?.(INIT_STATE);
        }
      } catch (err) {
        console.error('Failed to parse warning state', err);
      }
    }

    if (e.key === STORAGE_KEYS.IDLE_TIMER_TOKEN_REFRESH && e.newValue) {
      try {
        const parsed: unknown = JSON.parse(e.newValue);
        if (!isTokenRefreshData(parsed)) {
          console.error('Invalid token refresh data', parsed);
          return;
        }

        const refreshData = parsed;
        if (refreshData.expireOn) {
          this.authenticator.updateTokenExpiration(refreshData.expireOn);
          // Refresh authorization headers when another tab refreshes the token
          this.authenticator.refreshAuthHeaders();
          this.activateFn?.();

          if (this.warningVisible) {
            this.warningVisible = false;
            this.setStateFn?.(INIT_STATE);
          }
        }
      } catch (err) {
        console.error('Failed to parse token refresh data', err);
      }
    }
  };

  isWarningVisible = () => this.warningVisible;
}

export const IdleTimerRenderer: FC<PropsWithChildren<IIdleTimerRendererProps>> = ({ children }) => {
  const { styles } = useStyles();
  const { value: securitySettings } = useSettingValue<ISecuritySettings>(autoLogoffTimeoutSettingId);
  const autoLogoffTimeout = securitySettings?.autoLogoffTimeout;
  const httpClient = useHttpClient();
  const authenticator = useAuth();
  const { logoutUser, loginInfo } = authenticator;

  // Initialize IdleHandler once on mount
  const [idleHandler] = useState<IIdleHandler>(() => new IdleHandler(authenticator, httpClient, logoutUser));

  const [state, setState] = useState<IIdleTimerState>(INIT_STATE);
  const { isWarningVisible, remainingTime: rt, isCountingDown } = state;

  // Provide setState to the handler
  useEffect(() => {
    idleHandler.setStateUpdater(setState);
  }, [idleHandler]);

  // Fallback value (WARNING_DURATION + 300 = 330s) is only used to satisfy hook validation
  // when isTimeoutSet is false (idle timer disabled). Actual enable/disable is controlled
  // by isTimeoutSet condition. Large margin prevents validation failure since hook requires
  // timeout > promptBeforeIdle (WARNING_DURATION = 30s).
  const timeoutSeconds = (autoLogoffTimeout !== undefined && autoLogoffTimeout > WARNING_DURATION) ? autoLogoffTimeout : WARNING_DURATION + 5;

  // Idle timer is enabled only when:
  // 1. Settings are loaded (autoLogoffTimeout !== undefined)
  // 2. Auto logoff is not explicitly disabled (autoLogoffTimeout > 0)
  // 3. Timeout is greater than warning duration (> WARNING_DURATION seconds to allow 30s warning)
  // 4. User is logged in (loginInfo exists)
  // Note: useAutoLogoff check is now handled by IdleTimerWrapper
  const isTimeoutSet =
    autoLogoffTimeout !== undefined &&
    autoLogoffTimeout > WARNING_DURATION &&
    !!loginInfo;
  const timeout = getTimeFormat(timeoutSeconds);
  const visible = isWarningVisible && isTimeoutSet;

  // Configure idle timer hook
  const { activate } = useIdleTimer({
    timeout,
    promptBeforeIdle: WARNING_DURATION * ONE_SECOND,
    crossTab: true,
    onPrompt: idleHandler.handlePrompt,
    onIdle: idleHandler.handleIdle,
    onActive: idleHandler.handleActive,
    onAction: idleHandler.onAction,
    stopOnIdle: false,
    startOnMount: true,
    disabled: !isTimeoutSet
  });

  // Provide activate function to the handler
  useEffect(() => {
    idleHandler.setActivate(activate);
  }, [idleHandler, activate]);

  // Countdown logic - pure state updater without side effects
  const doCountdown = () => {
    setState(prev => {
      if (prev.remainingTime <= 1) {
        // Set pendingLogout flag instead of calling logout directly
        // The logout side effect will be handled by useEffect
        return { ...prev, remainingTime: 0, pendingLogout: true };
      }
      return { ...prev, remainingTime: prev.remainingTime - 1 };
    });
  };

  useInterval(() => {
    if (isCountingDown && isWarningVisible) {
      doCountdown();
    }
  }, ONE_SECOND);

  // Storage event listener for cross-tab sync
  useEffect(() => {
    window.addEventListener('storage', idleHandler.handleStorageChange);

    return () => {
      window.removeEventListener('storage', idleHandler.handleStorageChange);
    };
  }, [idleHandler]);

  // Effect to handle logout when pendingLogout flag is set
  // This separates the side effect from the state updater
  useEffect(() => {
    if (state.pendingLogout) {
      idleHandler.logout();
    }
  }, [state.pendingLogout, idleHandler]);

  // Modal handlers
  const onOk = useCallback(() => {
    // User chose "Log Out Now"
    idleHandler.logout();
  }, [idleHandler]);

  const onCancel = useCallback(async () => {
    // User chose "Stay Logged In"

    // Refresh token if it's about to expire
    if (isTokenAboutToExpire(DEFAULT_ACCESS_TOKEN_NAME)) {
      const refreshed = await idleHandler.refreshToken();
      if (!refreshed) {
        // Token refresh failed — force logout instead of leaving user with expired token
        idleHandler.logout();
        return;
      }
    }

    // Reset idle timer
    activate();

    // Close warning modal
    setState(INIT_STATE);
  }, [idleHandler, activate]);

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
