import { handleActions } from 'redux-actions';
import { SidebarMenuActionEnums } from './actions';
import { ISidebarMenuStateContext, SIDEBAR_MENU_CONTEXT_INITIAL_STATE } from './contexts';
import { ISidebarMenuItem } from '@/interfaces/sidebar';

export default handleActions<ISidebarMenuStateContext, any>(
  {
    [SidebarMenuActionEnums.ToggleSidebar]: (state: ISidebarMenuStateContext, action: ReduxActions.Action<boolean>) => {
      const { payload } = action;

      return {
        ...state,
        isExpanded: payload,
      };
    },
    [SidebarMenuActionEnums.SetItems]: (state: ISidebarMenuStateContext, action: ReduxActions.Action<ISidebarMenuItem[]>) => {
      const { payload } = action;

      return {
        ...state,
        items: payload,
      };
    },
  },

  SIDEBAR_MENU_CONTEXT_INITIAL_STATE,
);
