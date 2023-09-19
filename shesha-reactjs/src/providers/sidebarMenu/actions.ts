import { createAction } from 'redux-actions';

export enum SidebarMenuActionEnums {
  ToggleSidebar = 'TOGGLE_SIDEBAR',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const toggleSidebarAction = createAction<boolean, boolean>(SidebarMenuActionEnums.ToggleSidebar, (p) => p);

/* NEW_ACTION_GOES_HERE */
