import { createAction } from 'redux-actions';
import { IAddItemPayload, IUpdateChildItemsPayload, IUpdateItemSettingsPayload } from './contexts';

export enum ModelActionEnums {
  AddItem = 'ADD_ITEM',
  DeleteItem = 'DELETE_ITEM',
  UpdateItem = 'UPDATE_ITEM',
  SelectItem = 'SELECT_ITEM',
  UpdateChildItems = 'UPDATE_CHILD_ITEMS',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const addItemAction = createAction<IAddItemPayload, IAddItemPayload>(ModelActionEnums.AddItem, (p) => p);

export const deleteItemAction = createAction<string, string>(ModelActionEnums.DeleteItem, (p) => p);

export const selectItemAction = createAction<string, string>(ModelActionEnums.SelectItem, (p) => p);

export const updateChildItemsAction = createAction<IUpdateChildItemsPayload, IUpdateChildItemsPayload>(
  ModelActionEnums.UpdateChildItems,
  (p) => p,
);

export const updateItemAction = createAction<IUpdateItemSettingsPayload, IUpdateItemSettingsPayload>(
  ModelActionEnums.UpdateItem,
  (p) => p,
);

/* NEW_ACTION_GOES_HERE */
