import React, { FC, PropsWithChildren, useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Progress, Button } from 'antd';
import { useAuth } from '../auth';
import { useSettingValue } from '../settings';
import { ISettingIdentifier } from '../settings/models';
import { AutoLogoutContext } from './contexts';
import { IAutoLogoutSettings, IAutoLogoutState, DEFAULT_AUTO_LOGOUT_SETTINGS } from './models';

export interface IAutoLogoutProviderProps {
  /** Custom settings - if not provided, will use system settings */
  customSettings?: Partial<IAutoLogoutSettings>;
  /** Custom logout handler - if not provided, will use auth provider */
  onLogout?: () => Promise<void>;
  /** Callback when warning is shown */
  onWarningShown?: () => void;
  /** Callback when timer is reset */
  onTimerReset?: () => void;
}

// Complex settings identifier for Shesha.Security
const securitySettingsId: ISettingIdentifier = { name: 'Shesha.Security', module: 'Shesha' };

const AutoLogoutProvider: FC<PropsWithChildren<IAutoLogoutProviderProps>> = ({
  children,
  customSettings,
  onLogout,
  onWarningShown,
  onTimerReset,
}) => {
  const { logoutUser, isLoggedIn } = useAuth();
  // Use complex settings structure for Shesha.Security
  const { value: securitySettings } = useSettingValue(securitySettingsId);
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const browserCloseTimeoutRef = useRef<NodeJS.Timeout>();
  
  const getEffectiveSettings = useCallback((): IAutoLogoutSettings => {
    const effectiveTimeoutMinutes = securitySettings?.autoLogoffTimeout && securitySettings.autoLogoffTimeout > 0 
      ? securitySettings.autoLogoffTimeout 
      : DEFAULT_AUTO_LOGOUT_SETTINGS.timeoutMinutes;

    const effectiveWarningSeconds = securitySettings?.logoutWarningSeconds && securitySettings.logoutWarningSeconds > 0 
      ? securitySettings.logoutWarningSeconds 
      : DEFAULT_AUTO_LOGOUT_SETTINGS.warningSeconds;

    return {
      ...DEFAULT_AUTO_LOGOUT_SETTINGS,
      timeoutMinutes: effectiveTimeoutMinutes,
      warningSeconds: effectiveWarningSeconds,
      enabled: securitySettings?.logoutWhenUserInactive || (securitySettings?.autoLogoffTimeout && securitySettings.autoLogoffTimeout > 0),
      logoutWhenBrowserClosed: securitySettings?.logoutWhenBrowserClosed ?? false,
      ...customSettings,
    };
  }, [securitySettings, customSettings]);

  const [state, setState] = useState<IAutoLogoutState>(() => ({
    isWarningVisible: false,
    remainingTime: 0,
    isIdle: false,
    settings: getEffectiveSettings(),
    lastActivity: Date.now(),
  }));

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearInterval(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    if (browserCloseTimeoutRef.current) {
      clearTimeout(browserCloseTimeoutRef.current);
      browserCloseTimeoutRef.current = undefined;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      if (onLogout) {
        await onLogout();
      } else {
        await logoutUser();
      }
    } catch (error) {
      console.error('Auto logout failed:', error);
    } finally {
      setState(prev => ({
        ...prev,
        isWarningVisible: false,
        isIdle: false,
        remainingTime: 0,
        lastActivity: Date.now(),
      }));
    }
  }, [onLogout, logoutUser]);

  const recordActivity = useCallback(() => {
    const now = Date.now();
    setState(prev => {
      // Only update if there's actually been some time passed to avoid unnecessary re-renders
      if (now - prev.lastActivity > 1000 || prev.isWarningVisible || prev.isIdle) {
        return {
          ...prev,
          lastActivity: now,
          isWarningVisible: false,
          isIdle: false,
          remainingTime: 0,
        };
      }
      return prev;
    });
    onTimerReset?.();
  }, [onTimerReset]);

  const checkInactivity = useCallback(() => {
    if (!isLoggedIn || !state.settings.enabled) {
      return;
    }

    const now = Date.now();
    const timeSinceActivity = now - state.lastActivity;
    const inactiveSeconds = Math.floor(timeSinceActivity / 1000);
    const timeoutSeconds = state.settings.timeoutMinutes * 60;
    const maxInactiveSeconds = timeoutSeconds + state.settings.warningSeconds;
    const warningThreshold = timeoutSeconds; // Show warning after timeout, not before
    
    if (inactiveSeconds >= maxInactiveSeconds) {
      // Time to logout
      handleLogout();
    } else if (inactiveSeconds >= warningThreshold && !state.isWarningVisible) {
      // Show warning
      const remainingSeconds = maxInactiveSeconds - inactiveSeconds;
      setState(prev => ({
        ...prev,
        isWarningVisible: true,
        isIdle: true,
        remainingTime: remainingSeconds,
      }));
      onWarningShown?.();
    } else if (state.isWarningVisible) {
      // Update countdown
      const remainingSeconds = maxInactiveSeconds - inactiveSeconds;
      setState(prev => ({
        ...prev,
        remainingTime: Math.max(0, remainingSeconds),
      }));
    }
  }, [isLoggedIn, state.settings, state.lastActivity, state.isWarningVisible, handleLogout, onWarningShown]);

  const startTimer = useCallback(() => {
    clearTimers();
    
    if (!isLoggedIn || !state.settings.enabled) {
      return;
    }

    // Check inactivity every second
    timeoutRef.current = setInterval(checkInactivity, 1000);
  }, [isLoggedIn, state.settings.enabled, clearTimers, checkInactivity]);

  const stopTimer = useCallback(() => {
    clearTimers();
    setState(prev => ({
      ...prev,
      isWarningVisible: false,
      isIdle: false,
      remainingTime: 0,
    }));
  }, [clearTimers]);

  const resetTimer = useCallback(() => {
    recordActivity();
  }, [recordActivity]);

  const keepLoggedIn = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    recordActivity();
  }, [recordActivity]);

  const logoutNow = useCallback(() => {
    handleLogout();
  }, [handleLogout]);

  const updateSettings = useCallback((newSettings: Partial<IAutoLogoutSettings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  }, []);

  // Update settings when system settings or custom settings change
  useEffect(() => {
    const newSettings = getEffectiveSettings();
    setState(prev => ({
      ...prev,
      settings: newSettings,
    }));
  }, [getEffectiveSettings]);

  // Start timer when component mounts or user logs in
  useEffect(() => {
    if (isLoggedIn && state.settings.enabled) {
      startTimer();
    } else {
      stopTimer();
    }
    
    return () => clearTimers();
  }, [isLoggedIn, state.settings.enabled, startTimer, stopTimer, clearTimers]);

  // Activity event listeners
  useEffect(() => {
    if (!isLoggedIn || !state.settings.enabled) {
      return undefined;
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    let lastActivityTime = 0;
    const throttleMs = 1000; // Throttle activity detection to once per second
    
    const handleActivity = () => {
      // Don't record any activity while warning modal is visible
      // This gives the user time to decide which button to click
      if (state.isWarningVisible) {
        return;
      }
      
      const now = Date.now();
      if (now - lastActivityTime > throttleMs) {
        lastActivityTime = now;
        recordActivity();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [isLoggedIn, state.settings.enabled, state.isWarningVisible, recordActivity]);

  // Browser close detection
  useEffect(() => {
    if (!isLoggedIn || !state.settings.logoutWhenBrowserClosed) {
      return undefined;
    }

    let isPageUnloading = false;

    const handleVisibilityChange = () => {
      if (document.hidden && !isPageUnloading) {
        // Tab/window became hidden, start timer using same timeout as inactive users
        const timeoutMs = (state.settings.timeoutMinutes || 5) * 60 * 1000;
        
        browserCloseTimeoutRef.current = setTimeout(() => {
          if (document.hidden) {
            handleLogout();
          }
        }, timeoutMs);
      } else if (!document.hidden) {
        // Tab/window became visible again, clear timer
        if (browserCloseTimeoutRef.current) {
          clearTimeout(browserCloseTimeoutRef.current);
          browserCloseTimeoutRef.current = undefined;
        }
      }
    };

    const handleBeforeUnload = () => {
      isPageUnloading = true;
      // Clear any existing timeout since we're navigating away
      if (browserCloseTimeoutRef.current) {
        clearTimeout(browserCloseTimeoutRef.current);
        browserCloseTimeoutRef.current = undefined;
      }
    };

    const handlePageShow = () => {
      isPageUnloading = false;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pageshow', handlePageShow);
      if (browserCloseTimeoutRef.current) {
        clearTimeout(browserCloseTimeoutRef.current);
        browserCloseTimeoutRef.current = undefined;
      }
    };
  }, [isLoggedIn, state.settings.logoutWhenBrowserClosed, state.settings.timeoutMinutes, handleLogout]);

  const getProgressPercent = () => {
    if (state.remainingTime === 0) return 0;
    return Math.round((state.remainingTime / state.settings.warningSeconds) * 100);
  };

  const getProgressStatus = () => {
    const percent = getProgressPercent();
    if (percent > 60) return 'normal';
    if (percent > 30) return 'active';
    return 'exception';
  };

  const contextValue = {
    ...state,
    startTimer,
    stopTimer,
    resetTimer,
    keepLoggedIn,
    logoutNow,
    updateSettings,
  };

  return (
    <AutoLogoutContext.Provider value={contextValue}>
      {children}
      <Modal
        title="Session Timeout Warning"
        open={state.isWarningVisible}
        closable={false}
        maskClosable={false}
        onCancel={keepLoggedIn}
        footer={[
          <Button key="logout" onClick={logoutNow}>
            Logout Now
          </Button>,
          <Button key="keep" type="primary" onClick={keepLoggedIn}>
            Keep Me Logged In
          </Button>,
        ]}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p>
            You have been inactive for some time. For security reasons, you will be automatically 
            logged out unless you choose to continue your session.
          </p>
          <div style={{ margin: '20px 0' }}>
            <Progress 
              type="circle" 
              percent={getProgressPercent()} 
              status={getProgressStatus()} 
              format={() => <span style={{ fontSize: '16px' }}>{state.remainingTime}</span>}
              size={120}
            />
          </div>
          <p>
            <strong>Automatic logout in {state.remainingTime} seconds</strong>
          </p>
        </div>
      </Modal>
    </AutoLogoutContext.Provider>
  );
};

export default AutoLogoutProvider;