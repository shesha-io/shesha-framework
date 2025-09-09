import { createContext } from 'react';
import { IAutoLogoutContext, DEFAULT_AUTO_LOGOUT_SETTINGS } from './models';

const DEFAULT_CONTEXT_VALUE: IAutoLogoutContext = {
  isWarningVisible: false,
  remainingTime: 0,
  isIdle: false,
  settings: DEFAULT_AUTO_LOGOUT_SETTINGS,
  lastActivity: Date.now(),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  startTimer: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  stopTimer: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  resetTimer: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  keepLoggedIn: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  logoutNow: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  updateSettings: () => {},
};

export const AutoLogoutContext = createContext<IAutoLogoutContext>(DEFAULT_CONTEXT_VALUE);