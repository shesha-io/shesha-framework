import { createContext } from 'react';
import { ColumnsItemProps } from './models';

export interface IUpdateChildItemsPayload {
  index: number[];
  childs: ColumnsItemProps[];
}

export interface IUpdateItemSettingsPayload {
  id: string;
  settings: ColumnsItemProps;
}

export interface IColumnsConfiguratorStateContext {
  items: ColumnsItemProps[];
  selectedItemId?: string;
  readOnly: boolean;
}

export interface IColumnsConfiguratorActionsContext {
  addColumn: () => void;
  deleteColumn: (uid: string) => void;

  addGroup: () => void;
  deleteGroup: (uid: string) => void;
  selectItem: (uid: string) => void;
  updateChildItems: (payload: IUpdateChildItemsPayload) => void;

  getItem: (uid: string) => ColumnsItemProps;
  updateItem: (payload: IUpdateItemSettingsPayload) => void;

  /* NEW_ACTION_ACTION_DECLARATIOS_GOES_HERE */
}

export const TOOLBAR_CONTEXT_INITIAL_STATE: IColumnsConfiguratorStateContext = {
  items: [],
  readOnly: false,
};

export const ColumnsConfiguratorStateContext = createContext<IColumnsConfiguratorStateContext>(
  TOOLBAR_CONTEXT_INITIAL_STATE
);

export const ColumnsConfiguratorActionsContext = createContext<IColumnsConfiguratorActionsContext>(undefined);
