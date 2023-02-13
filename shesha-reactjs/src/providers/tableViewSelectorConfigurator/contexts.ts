import { createContext } from 'react';
import { ITableViewProps } from './models';

export interface IUpdateChildItemsPayload {
  index: number[];
  childs: ITableViewProps[];
}

export interface IUpdateItemSettingsPayload {
  id: string;
  settings: ITableViewProps;
}

export interface ITableViewSelectorConfiguratorStateContext {
  items: ITableViewProps[];
  selectedItemId?: string;
  selectedItem?: ITableViewProps;
  readOnly: boolean;
}

export interface ITableViewSelectorConfiguratorActionsContext {
  addItem: () => void;
  deleteItem: (uid: string) => void;

  addGroup: () => void;
  deleteGroup: (uid: string) => void;
  selectItem: (uid: string) => void;
  updateChildItems: (payload: IUpdateChildItemsPayload) => void;

  getItem: (uid: string) => ITableViewProps;
  updateItem: (payload: IUpdateItemSettingsPayload) => void;

  /* NEW_ACTION_ACTION_DECLARATIOS_GOES_HERE */
}

export const TOOLBAR_CONTEXT_INITIAL_STATE: ITableViewSelectorConfiguratorStateContext = {
  items: [],
  readOnly: false,
};

export const TableViewSelectorConfiguratorStateContext = createContext<ITableViewSelectorConfiguratorStateContext>(
  TOOLBAR_CONTEXT_INITIAL_STATE
);

export const TableViewSelectorConfiguratorActionsContext = createContext<ITableViewSelectorConfiguratorActionsContext>(
  undefined
);
