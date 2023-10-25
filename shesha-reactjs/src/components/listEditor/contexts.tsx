import { createContext } from "react";

export interface IListEditorStateContext<TItem = any> {
  value: TItem[];
}

export interface IListEditorActionsContext<TItem = any> {
  deleteItem: (index: number) => void;
  addItem: () => void;
  updateItem: (index: number, item: TItem) => void;
  updateList: (newItems: TItem[]) => void;
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