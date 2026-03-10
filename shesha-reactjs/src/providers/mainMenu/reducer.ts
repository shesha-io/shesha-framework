import { handleActions } from 'redux-actions';
import { MainMenuActionEnums } from './actions';
import { IConfigurableMainMenu, IMainMenuStateContext, MAIN_MENU_CONTEXT_INITIAL_STATE } from './contexts';
import { ISidebarMenuItem } from '@/interfaces/sidebar';

export const uiReducer = handleActions<IMainMenuStateContext, any>(
  {
    [MainMenuActionEnums.SetLoadedMenu]: (
      state: IMainMenuStateContext,
      action: ReduxActions.Action<IConfigurableMainMenu>,
    ) => {
      const { payload } = action;

      return {
        ...state,
        loadedMenu: payload,
      };
    },

    [MainMenuActionEnums.SetItems]: (
      state: IMainMenuStateContext,
      action: ReduxActions.Action<ISidebarMenuItem[]>,
    ) => {
      const { payload } = action;

      return {
        ...state,
        items: payload,
      };
    },
  },

  MAIN_MENU_CONTEXT_INITIAL_STATE,
);
