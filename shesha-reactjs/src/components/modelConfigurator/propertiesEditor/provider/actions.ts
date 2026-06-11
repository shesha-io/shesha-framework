import { createAction } from '@reduxjs/toolkit';
import { IAddItemPayload, IUpdateChildItemsPayload, IUpdateItemSettingsPayload } from './contexts';

export enum ModelActionEnums {
  AddItem = 'ADD_ITEM',
  DeleteItem = 'DELETE_ITEM',
  UpdateItem = 'UPDATE_ITEM',
  SelectItem = 'SELECT_ITEM',
  UpdateChildItems = 'UPDATE_CHILD_ITEMS',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const addItemAction = createAction<IAddItemPayload>(ModelActionEnums.AddItem);

export const deleteItemAction = createAction<string>(ModelActionEnums.DeleteItem);

export const selectItemAction = createAction<string>(ModelActionEnums.SelectItem);

export const updateChildItemsAction = createAction<IUpdateChildItemsPayload>(ModelActionEnums.UpdateChildItems);

export const updateItemAction = createAction<IUpdateItemSettingsPayload>(ModelActionEnums.UpdateItem);
