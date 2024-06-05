import { createContext } from "react";
import { ListItemFactory } from "./provider";

export interface IListEditorState<TItem = any> {
  value: TItem[];
}

export interface IListEditorActions<TItem = any> {
  deleteItem: (index: number) => void;
  addItem: (factory?: ListItemFactory<TItem>) => void;
  insertItem: (index: number) => void;
  updateItem: (index: number, item: TItem) => void;
  updateList: (newItems: TItem[]) => void;
}

export interface IListEditor<TItem = any> extends IListEditorState<TItem>, IListEditorActions<TItem> {
  
}

export interface IListEditorStateContext<TItem = any> extends IListEditorState<TItem> {
  readOnly?: boolean;
  selectedItem?: TItem;
}

export interface IListEditorActionsContext<TItem = any> extends IListEditorActions<TItem> {
  setSelectedItem: (item: TItem) => void;
  refresh: () => void;
}

export interface IListEditorContext<TItem = any> extends IListEditorStateContext<TItem>, IListEditorActionsContext<TItem> {

}

export const getListEditorContextInitialState = <TItem extends any>(
  value: TItem[]
): IListEditorStateContext<TItem> => {
  return {
    value: value,
  };
};

export const getListEditorStateContext = <TItem extends any>(
  initialState: IListEditorStateContext<TItem>
) => createContext<IListEditorStateContext<TItem>>(initialState);

export const getListEditorActionsContext = <TItem extends any>() =>
  createContext<IListEditorActionsContext<TItem>>(undefined);