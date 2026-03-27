import { createAction } from '@reduxjs/toolkit';
import { IUpdateChildItemsPayload, IUpdateItemSettingsPayload } from './contexts';

export enum LayerGroupActionEnums {
  AddLayer = 'ADD_LAYER',
  DeleteLayer = 'DELETE_LAYER',
  UpdateItem = 'UPDATE_ITEM',
  SelectItem = 'SELECT_ITEM',
  UpdateChildItems = 'UPDATE_CHILD_ITEMS',
  SetRefreshTrigger = "SET_REFRESH_TRIGGER",
}

export const addLayerAction = createAction(LayerGroupActionEnums.AddLayer);

export const deleteLayerAction = createAction<string>(LayerGroupActionEnums.DeleteLayer);

export const selectItemAction = createAction<string>(LayerGroupActionEnums.SelectItem);

export const updateItemAction = createAction<IUpdateItemSettingsPayload>(LayerGroupActionEnums.UpdateItem);

export const updateChildItemsAction = createAction<IUpdateChildItemsPayload>(LayerGroupActionEnums.UpdateChildItems);

export const setRefreshTriggerAction = createAction<number>(LayerGroupActionEnums.SetRefreshTrigger);
