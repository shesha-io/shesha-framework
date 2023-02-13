import { createAction } from 'redux-actions';
import {
  IConfigurableItemBase,
  IConfigurableItemGroup,
  IUpdateChildItemsPayload,
  IUpdateItemSettingsPayload,
} from './contexts';

export enum ItemListConfiguratorActionEnums {
  AddItem = 'ADD_ITEM',
  DeleteItem = 'DELETE_ITEM',

  UpdateItem = 'UPDATE_ITEM',
  AddGroup = 'ADD_GROUP',

  DeleteGroup = 'DELETE_GROUP',
  SelectItem = 'SELECT_ITEM',

  UpdateChildItems = 'UPDATE_CHILD_ITEMS',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const addItemAction = createAction<IConfigurableItemBase, IConfigurableItemBase>(
  ItemListConfiguratorActionEnums.AddItem,
  p => p
);

export const deleteItemAction = createAction<string, string>(ItemListConfiguratorActionEnums.DeleteItem, p => p);

export const addGroupAction = createAction<IConfigurableItemGroup, IConfigurableItemGroup>(
  ItemListConfiguratorActionEnums.AddGroup,
  p => p
);

export const deleteGroupAction = createAction<string, string>(ItemListConfiguratorActionEnums.DeleteGroup, p => p);

export const selectItemAction = createAction<string, string>(ItemListConfiguratorActionEnums.SelectItem, p => p);

export const updateChildItemsAction = createAction<IUpdateChildItemsPayload, IUpdateChildItemsPayload>(
  ItemListConfiguratorActionEnums.UpdateChildItems,
  p => p
);

export const updateItemAction = createAction<IUpdateItemSettingsPayload, IUpdateItemSettingsPayload>(
  ItemListConfiguratorActionEnums.UpdateItem,
  p => p
);

/* NEW_ACTION_GOES_HERE */
