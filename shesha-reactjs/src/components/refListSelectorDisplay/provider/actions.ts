import { createAction } from '@reduxjs/toolkit';
import { ISettingsUpdatePayload, IUpdateChildItemsPayload, IUpdateItemSettingsPayload } from './contexts';
import { IReferenceListItem } from '@/interfaces/referenceList';
import { RefListGroupItemProps } from './models';

export enum RefListItemGroupActionEnums {
  UpdateItem = 'UPDATE_ITEM',
  SelectItem = 'SELECT_ITEM',
  UpdateChildItems = 'UPDATE_CHILD_ITEMS',
  SetItems = 'SET_ITEMS',
  SyncConfiguredItems = 'SYNC_CONFIGURED_ITEMS',
  StoreSettings = 'STORE_SETTINGS',
}

export const setItems = createAction<IReferenceListItem[]>(RefListItemGroupActionEnums.SetItems);

export const syncConfiguredItemsAction = createAction<RefListGroupItemProps[]>(RefListItemGroupActionEnums.SyncConfiguredItems);

export const selectItemAction = createAction<string>(RefListItemGroupActionEnums.SelectItem);

export const updateItemAction = createAction<IUpdateItemSettingsPayload>(RefListItemGroupActionEnums.UpdateItem);

export const updateChildItemsAction = createAction<IUpdateChildItemsPayload>(RefListItemGroupActionEnums.UpdateChildItems);

export const storeSettingsAction = createAction<ISettingsUpdatePayload>(RefListItemGroupActionEnums.StoreSettings);
