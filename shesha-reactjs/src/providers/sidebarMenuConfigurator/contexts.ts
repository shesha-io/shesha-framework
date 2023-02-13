import { createContext } from 'react';
import { ISidebarMenuItem } from '../../interfaces/sidebar';

export interface IUpdateChildItemsPayload {
  index: number[];
  childs: ISidebarMenuItem[];
}

export interface IUpdateItemSettingsPayload {
  id: string;
  settings: ISidebarMenuItem;
}

export interface ISidebarMenuConfiguratorStateContext {
  items: ISidebarMenuItem[];
  selectedItemId?: string;
}

export interface ISidebarMenuConfiguratorActionsContext {
  addItem: () => void;
  deleteItem: (uid: string) => void;
  selectItem: (uid: string) => void;
  updateChildItems: (payload: IUpdateChildItemsPayload) => void;
  getItem: (uid: string) => ISidebarMenuItem;
  updateItem: (payload: IUpdateItemSettingsPayload) => void;

  addGroup: () => void;
  deleteGroup: (uid: string) => void;

  /* NEW_ACTION_ACTION_DECLARATIOS_GOES_HERE */
}

export const SIDEBAR_MENU_CONTEXT_INITIAL_STATE: ISidebarMenuConfiguratorStateContext = {
  items: [],
};

export const SidebarMenuConfiguratorStateContext = createContext<ISidebarMenuConfiguratorStateContext>(
  SIDEBAR_MENU_CONTEXT_INITIAL_STATE
);

export const SidebarMenuConfiguratorActionsContext = createContext<ISidebarMenuConfiguratorActionsContext>(undefined);
