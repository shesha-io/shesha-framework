import { createContext } from 'react';
import { ToolbarItemProps } from './models';

export interface IUpdateChildItemsPayload {
  index: number[];
  id?: string;
  childs: ToolbarItemProps[];
}

export interface IUpdateItemSettingsPayload {
  id: string;
  settings: ToolbarItemProps;
}

export interface IToolbarConfiguratorStateContext {
  items: ToolbarItemProps[];
  selectedItemId?: string;
  readOnly: boolean;
}

export interface IToolbarConfiguratorActionsContext {
  addButton: () => void;
  deleteButton: (uid: string) => void;

  addGroup: () => void;
  deleteGroup: (uid: string) => void;
  selectItem: (uid: string) => void;
  updateChildItems: (payload: IUpdateChildItemsPayload) => void;

  getItem: (uid: string) => ToolbarItemProps;
  updateItem: (payload: IUpdateItemSettingsPayload) => void;

  /* NEW_ACTION_ACTION_DECLARATIOS_GOES_HERE */
}

export const TOOLBAR_CONTEXT_INITIAL_STATE: IToolbarConfiguratorStateContext = {
  items: [],
  readOnly: false,
};

export const ToolbarConfiguratorStateContext = createContext<IToolbarConfiguratorStateContext>(
  TOOLBAR_CONTEXT_INITIAL_STATE
);

export const ToolbarConfiguratorActionsContext = createContext<IToolbarConfiguratorActionsContext>(undefined);
