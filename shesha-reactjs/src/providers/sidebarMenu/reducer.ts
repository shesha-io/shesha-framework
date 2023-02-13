import { ISidebarMenuStateContext, SIDEBAR_MENU_CONTEXT_INITIAL_STATE } from './contexts';
import { SidebarMenuActionEnums } from './actions';
import { handleActions } from 'redux-actions';

export default handleActions<ISidebarMenuStateContext, any>(
  {
    [SidebarMenuActionEnums.ToggleSidebar]: (state: ISidebarMenuStateContext, action: ReduxActions.Action<boolean>) => {
      const { payload } = action;

      return {
        ...state,
        isExpanded: payload,
      };
    },
  },

  SIDEBAR_MENU_CONTEXT_INITIAL_STATE
);
