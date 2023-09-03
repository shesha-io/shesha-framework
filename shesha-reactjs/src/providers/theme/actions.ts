import { createAction } from 'redux-actions';
import { IConfigurableTheme, IThemeStateContext } from './contexts';

export enum ThemeActionEnums {
  SetTheme = 'SET_THEME',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const setThemeAction = createAction<IThemeStateContext, IConfigurableTheme>(
  ThemeActionEnums.SetTheme,
  (theme) => ({
    theme,
  })
);

/* NEW_ACTION_GOES_HERE */
