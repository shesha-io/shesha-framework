export interface IAutoLogoutSettings {
  /** Timeout in minutes for automatic logout */
  timeoutMinutes: number;
  /** Warning time in seconds before logout */
  warningSeconds: number;
  /** Whether auto logout is enabled */
  enabled: boolean;
  /** Whether to logout when browser is closed */
  logoutWhenBrowserClosed?: boolean;
}

export interface IAutoLogoutState {
  /** Whether the warning modal is visible */
  isWarningVisible: boolean;
  /** Remaining time in seconds before logout */
  remainingTime: number;
  /** Whether user is currently idle */
  isIdle: boolean;
  /** Current settings */
  settings: IAutoLogoutSettings;
  /** Last activity timestamp */
  lastActivity: number;
}

export interface IAutoLogoutActions {
  /** Start the auto logout timer */
  startTimer: () => void;
  /** Stop the auto logout timer */
  stopTimer: () => void;
  /** Reset the timer (user activity detected) */
  resetTimer: () => void;
  /** Keep user logged in (dismiss warning) */
  keepLoggedIn: () => void;
  /** Logout immediately */
  logoutNow: () => void;
  /** Update settings */
  updateSettings: (settings: Partial<IAutoLogoutSettings>) => void;
}

export interface IAutoLogoutContext extends IAutoLogoutState, IAutoLogoutActions {}

export const DEFAULT_AUTO_LOGOUT_SETTINGS: IAutoLogoutSettings = {
  timeoutMinutes: 5,
  warningSeconds: 60,
  enabled: true,
};