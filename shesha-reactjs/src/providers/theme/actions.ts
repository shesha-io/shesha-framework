import { createAction } from 'redux-actions';
import { IConfigurableTheme } from './contexts';

export enum ThemeActionEnums {
  SetTheme = 'SET_THEME',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const setThemeAction = createAction<IConfigurableTheme, IConfigurableTheme>(
  ThemeActionEnums.SetTheme,
  (p) => p,
);

/* NEW_ACTION_GOES_HERE */
