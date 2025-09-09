import { useContext } from 'react';
import { AutoLogoutContext } from './contexts';
import { IAutoLogoutContext } from './models';

/**
 * Hook to use the auto logout context
 * @param require - Whether to require the context (throw error if not found)
 */
export const useAutoLogout = (require: boolean = true): IAutoLogoutContext => {
  const context = useContext(AutoLogoutContext);
  
  if (require && !context) {
    throw new Error('useAutoLogout must be used within an AutoLogoutProvider');
  }
  
  return context;
};

/**
 * Hook to get auto logout state
 */
export const useAutoLogoutState = () => {
  const context = useAutoLogout();
  return {
    isWarningVisible: context.isWarningVisible,
    remainingTime: context.remainingTime,
    isIdle: context.isIdle,
    settings: context.settings,
  };
};

/**
 * Hook to get auto logout actions
 */
export const useAutoLogoutActions = () => {
  const context = useAutoLogout();
  return {
    startTimer: context.startTimer,
    stopTimer: context.stopTimer,
    resetTimer: context.resetTimer,
    keepLoggedIn: context.keepLoggedIn,
    logoutNow: context.logoutNow,
    updateSettings: context.updateSettings,
  };
};