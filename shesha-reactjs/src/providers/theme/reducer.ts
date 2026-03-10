import { handleActions } from 'redux-actions';
import { ThemeActionEnums } from './actions';
import { IConfigurableTheme, IThemeStateContext, THEME_CONTEXT_INITIAL_STATE } from './contexts';

export const uiReducer = handleActions<IThemeStateContext, any>(
  {
    [ThemeActionEnums.SetTheme]: (
      state: IThemeStateContext,
      action: ReduxActions.Action<IConfigurableTheme>,
    ) => {
      const { payload } = action;

      return {
        ...state,
        theme: payload,
      };
    },
  },

  THEME_CONTEXT_INITIAL_STATE,
);
