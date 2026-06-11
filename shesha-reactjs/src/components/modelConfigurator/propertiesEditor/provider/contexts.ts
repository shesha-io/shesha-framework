import { RefObject } from 'react';
import { IModelItem } from '@/interfaces/modelConfigurator';
import { createNamedContext } from '@/utils/react';

export interface IUpdateChildItemsPayload {
  index: number[];
  childs: IModelItem[];
}

export interface IAddItemPayload {
  parentId?: string | undefined;
  item: IModelItem;
}

export interface IUpdateItemSettingsPayload {
  id: string;
  settings: IModelItem;
}

export interface IPropertiesEditorStateContext {
  items: IModelItem[];
  selectedItemId?: string | undefined;
  onChange?: ((items: IModelItem[]) => void) | undefined;
  selectedItemRef?: RefObject<HTMLDivElement | null>;
}

export interface IPropertiesEditorActionsContext {
  addItem: (parentId?: string) => Promise<IModelItem>;
  deleteItem: (uid: string) => void;
  selectItem: (uid: string) => void;
  updateChildItems: (payload: IUpdateChildItemsPayload) => void;
  getItem: (uid: string) => IModelItem | undefined;
  updateItem: (payload: IUpdateItemSettingsPayload) => void;

  /* NEW_ACTION_ACTION_DECLARATIOS_GOES_HERE */
}

export const PROPERTIES_EDITOR_CONTEXT_INITIAL_STATE: IPropertiesEditorStateContext = {
  items: [],
};

export const PropertiesEditorStateContext = createNamedContext<IPropertiesEditorStateContext | undefined>(
  PROPERTIES_EDITOR_CONTEXT_INITIAL_STATE,
  "PropertiesEditorStateContext",
);

export const PropertiesEditorActionsContext = createNamedContext<IPropertiesEditorActionsContext | undefined>(undefined, "PropertiesEditorActionsContext");
