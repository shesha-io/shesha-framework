import { createAction } from 'redux-actions';
import { IUpdateChildItemsPayload, IUpdateItemSettingsPayload } from './contexts';
//import { IToolbarConfiguratorStateContext } from './contexts';

export enum ButtonGroupActionEnums {
  AddButton = 'ADD_BUTTON',
  DeleteButton = 'DELETE_BUTTON',

  AddGroup = 'ADD_GROUP',
  DeleteGroup = 'DELETE_GROUP',

  UpdateItem = 'UPDATE_ITEM',
  SelectItem = 'SELECT_ITEM',

  UpdateChildItems = 'UPDATE_CHILD_ITEMS',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const addButtonAction = createAction(ButtonGroupActionEnums.AddButton);

export const deleteButtonAction = createAction<string, string>(ButtonGroupActionEnums.DeleteButton, p => p);

export const addGroupAction = createAction(ButtonGroupActionEnums.AddGroup);

export const deleteGroupAction = createAction<string, string>(ButtonGroupActionEnums.DeleteGroup, p => p);

export const selectItemAction = createAction<string, string>(ButtonGroupActionEnums.SelectItem, p => p);

export const updateChildItemsAction = createAction<IUpdateChildItemsPayload, IUpdateChildItemsPayload>(
  ButtonGroupActionEnums.UpdateChildItems,
  p => p
);

export const updateItemAction = createAction<IUpdateItemSettingsPayload, IUpdateItemSettingsPayload>(
  ButtonGroupActionEnums.UpdateItem,
  p => p
);

/* NEW_ACTION_GOES_HERE */
