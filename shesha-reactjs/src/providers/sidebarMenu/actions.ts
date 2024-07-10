import { createAction } from 'redux-actions';
import { ISidebarMenuItem } from '.';

export enum SidebarMenuActionEnums {
  ToggleSidebar = 'TOGGLE_SIDEBAR',
  SetItems = 'SET_ITEMS',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const toggleSidebarAction = createAction<boolean, boolean>(SidebarMenuActionEnums.ToggleSidebar, (p) => p);
export const setItemsAction = createAction<ISidebarMenuItem[], ISidebarMenuItem[]>(SidebarMenuActionEnums.SetItems, (p) => p);

/* NEW_ACTION_GOES_HERE */
