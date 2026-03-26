import { createAction } from '@reduxjs/toolkit';
import { IConfigurableMainMenu } from './contexts';
import { ISidebarMenuItem } from '@/interfaces/sidebar';

export enum MainMenuActionEnums {
  SetLoadedMenu = 'SET_LOADED_MENU',
  SetItems = 'SET_ITEMS',
}

export const setLoadedMenuAction = createAction<IConfigurableMainMenu>(MainMenuActionEnums.SetLoadedMenu);

export type SetItemsActionPayload = {
  items: ISidebarMenuItem[];
  originalItems: ISidebarMenuItem[];
};
export const setItemsAction = createAction<SetItemsActionPayload>(MainMenuActionEnums.SetItems);
