import { InsertMode } from './../../interfaces/insertMode';
import { createContext } from 'react';
import { FormMarkup } from '../form/models';

export interface IConfigurableItemBase {
  id: string;
  selected?: boolean;
  sortOrder?: number;
  title?: string;
  itemType?: 'group' | 'item';
  icon?: string;
  label?: string;
  name?: string;
  tooltip?: string;
}

export interface IConfigurableItemGroup extends IConfigurableItemBase {
  childItems?: IConfigurableItemBase[];
}

export interface IItemsOptions {
  /**
   * A function that get called whenever a new item gets created. You can use it to pass
   */
  onAddNewItem?: (items: IConfigurableItemBase[], itemTypeLength: number) => IConfigurableItemBase;

  /**
   * A function that get called whenever a new item gets created. You can use it to pass
   */
  onAddNewGroup?: (items: IConfigurableItemBase[], groupTypeLength: number) => IConfigurableItemBase;
}

export interface IUpdateChildItemsPayload {
  /**
   * Id of the item being updated
   */
  id?: string;

  /**
   * Index of the item being updated
   */
  index: number[];

  /**
   * Children to update the item with
   */
  children: IConfigurableItemBase[];
}

export interface IUpdateItemSettingsPayload {
  /**
   * Unique Id of an item whose settings will be updated
   */
  id: string;

  /**
   * The settings
   */
  settings: IConfigurableItemBase;
}

export interface IItemListConfiguratorStateContext {
  items: IConfigurableItemBase[];
  selectedItemId?: string;
  childrenKey?: string;
  itemTypeMarkup?: FormMarkup;
  groupTypeMarkup?: FormMarkup;
  insertMode?: InsertMode;
}

export interface IItemListConfiguratorActionsContext {
  addItem: () => void;
  deleteItem: (uid: string) => void;
  selectItem: (uid: string) => void;
  updateChildItems: (payload: IUpdateChildItemsPayload) => void;
  getItem: (uid: string) => IConfigurableItemBase;
  updateItem: (payload: IUpdateItemSettingsPayload) => void;
  addGroup: () => void;
  deleteGroup: (uid: string) => void;
}

export const ITEM_LIST_CONFIGURATOR_CONTEXT_INITIAL_STATE: IItemListConfiguratorStateContext = {
  items: [],
  insertMode: 'before',
};

export const ItemListConfiguratorStateContext = createContext<IItemListConfiguratorStateContext>(
  ITEM_LIST_CONFIGURATOR_CONTEXT_INITIAL_STATE
);

export const ItemListConfiguratorProviderActionsContext = createContext<IItemListConfiguratorActionsContext>(undefined);
