import { MutableRefObject } from 'react';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { createNamedContext } from '@/utils/react';

export interface IUpdateChildItemsPayload {
  index: number[];
  childs: IModelItem[];
}

export interface IAddItemPayload {
  parentId?: string;
  item: IModelItem;
}

export interface IUpdateItemSettingsPayload {
  id: string;
  settings: IModelItem;
}

export interface IPropertiesEditorStateContext {
  items: IModelItem[];
  selectedItemId?: string;
  onChange?: (items: IModelItem[]) => void;
  selectedItemRef?: MutableRefObject<any>;
}

export interface IPropertiesEditorActionsContext {
  addItem: (parentId?: string) => Promise<IModelItem>;
  deleteItem: (uid: string) => void;
  selectItem: (uid: string) => void;
  updateChildItems: (payload: IUpdateChildItemsPayload) => void;
  getItem: (uid: string) => IModelItem;
  updateItem: (payload: IUpdateItemSettingsPayload) => void;

  /* NEW_ACTION_ACTION_DECLARATIOS_GOES_HERE */
}

export const PROPERTIES_EDITOR_CONTEXT_INITIAL_STATE: IPropertiesEditorStateContext = {
  items: [],
};

export const PropertiesEditorStateContext = createNamedContext<IPropertiesEditorStateContext>(
  PROPERTIES_EDITOR_CONTEXT_INITIAL_STATE,
  "PropertiesEditorStateContext",
);

export const PropertiesEditorActionsContext = createNamedContext<IPropertiesEditorActionsContext>(undefined, "PropertiesEditorActionsContext");
