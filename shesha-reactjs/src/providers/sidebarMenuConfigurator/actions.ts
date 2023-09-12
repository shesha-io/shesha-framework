import { createAction } from 'redux-actions';
import { IUpdateChildItemsPayload, IUpdateItemSettingsPayload } from './contexts';

export enum SidebarMenuActionEnums {
  AddItem = 'ADD_ITEM',
  DeleteItem = 'DELETE_ITEM',
  UpdateItem = 'UPDATE_ITEM',
  AddGroup = 'ADD_GROUP',
  DeleteGroup = 'DELETE_GROUP',
  SelectItem = 'SELECT_ITEM',
  UpdateChildItems = 'UPDATE_CHILD_ITEMS',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const addItemAction = createAction(SidebarMenuActionEnums.AddItem);

export const deleteItemAction = createAction<string, string>(SidebarMenuActionEnums.DeleteItem, (p) => p);

export const addGroupAction = createAction(SidebarMenuActionEnums.AddGroup);
export const deleteGroupAction = createAction<string, string>(SidebarMenuActionEnums.DeleteGroup, (p) => p);

export const selectItemAction = createAction<string, string>(SidebarMenuActionEnums.SelectItem, (p) => p);

export const updateChildItemsAction = createAction<IUpdateChildItemsPayload, IUpdateChildItemsPayload>(
  SidebarMenuActionEnums.UpdateChildItems,
  (p) => p
);

export const updateItemAction = createAction<IUpdateItemSettingsPayload, IUpdateItemSettingsPayload>(
  SidebarMenuActionEnums.UpdateItem,
  (p) => p
);

/* NEW_ACTION_GOES_HERE */
