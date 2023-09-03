import { createAction } from 'redux-actions';
import { IUpdateChildItemsPayload, IUpdateItemSettingsPayload } from './contexts';
//import { IToolbarConfiguratorStateContext } from './contexts';

export enum ToolbarActionEnums {
  AddButton = 'ADD_BUTTON',
  DeleteButton = 'DELETE_BUTTON',

  AddGroup = 'ADD_GROUP',
  DeleteGroup = 'DELETE_GROUP',

  UpdateItem = 'UPDATE_ITEM',
  SelectItem = 'SELECT_ITEM',

  UpdateChildItems = 'UPDATE_CHILD_ITEMS',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const addButtonAction = createAction(ToolbarActionEnums.AddButton);

export const deleteButtonAction = createAction<string, string>(ToolbarActionEnums.DeleteButton, (p) => p);

export const addGroupAction = createAction(ToolbarActionEnums.AddGroup);
export const deleteGroupAction = createAction<string, string>(ToolbarActionEnums.DeleteGroup, (p) => p);

export const selectItemAction = createAction<string, string>(ToolbarActionEnums.SelectItem, (p) => p);

export const updateChildItemsAction = createAction<IUpdateChildItemsPayload, IUpdateChildItemsPayload>(
  ToolbarActionEnums.UpdateChildItems,
  (p) => p
);

export const updateItemAction = createAction<IUpdateItemSettingsPayload, IUpdateItemSettingsPayload>(
  ToolbarActionEnums.UpdateItem,
  (p) => p
);

/* NEW_ACTION_GOES_HERE */
