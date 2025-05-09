import { createContext } from 'react';
import { RefListGroupItemProps } from './models';

export interface IUpdateChildItemsPayload {
  index: number[];
  id?: string;
  childs: RefListGroupItemProps[];
}

export interface IUpdateItemSettingsPayload {
  id: string;
  settings: RefListGroupItemProps;
}

export interface IRefListItemGroupConfiguratorStateContext {
  items: RefListGroupItemProps[];
  selectedItemId?: string;
  readOnly: boolean;
  active?: any;
  userSettings: { [key: string]: boolean };

}
export interface ISettingsUpdatePayload {
  columnId: string;
  isCollapsed: boolean;
}

export interface IRefListItemGroupConfiguratorActionsContext {
  selectItem: (uid: string) => void;
  updateItem: (payload: IUpdateItemSettingsPayload) => void;
  getItem: (uid: string) => RefListGroupItemProps;
  updateChildItems: (payload: IUpdateChildItemsPayload) => void;
  storeSettings: (columnId: string, isCollapsed: boolean) => Promise<void>;
}

export const REF_LIST_ITEM_GROUP_CONTEXT_INITIAL_STATE: IRefListItemGroupConfiguratorStateContext = {
  items: [],
  readOnly: false,
  userSettings: {},
};

export const RefListItemGroupConfiguratorStateContext = createContext<IRefListItemGroupConfiguratorStateContext>(
  REF_LIST_ITEM_GROUP_CONTEXT_INITIAL_STATE
);

export const RefListItemGroupConfiguratorActionsContext = createContext<IRefListItemGroupConfiguratorActionsContext>(undefined);
