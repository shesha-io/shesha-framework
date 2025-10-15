import { createAction } from 'redux-actions';
import { IConfigurableMainMenu } from './contexts';
import { ISidebarMenuItem } from '@/interfaces/sidebar';

export enum MainMenuActionEnums {
  SetLoadedMenu = 'SET_LOADED_MENU',
  SetItems = 'SET_ITEMS',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const setLoadedMenuAction = createAction<IConfigurableMainMenu, IConfigurableMainMenu>(
  MainMenuActionEnums.SetLoadedMenu,
  (p) => p,
);

export const setItemsAction = createAction<ISidebarMenuItem[], ISidebarMenuItem[]>(
  MainMenuActionEnums.SetItems,
  (p) => p,
);

/* NEW_ACTION_GOES_HERE */
