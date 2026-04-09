import { Context } from "react";
import { createNamedContext } from "@/utils/react";
import { IListEditorActionsContext, IListEditorStateContext } from "./models";

export const getListEditorContextInitialState = <TItem extends any>(
  value: TItem[],
): IListEditorStateContext<TItem> => {
  return {
    value: value,
  };
};

export const getListEditorStateContext = <TItem extends any>(
  initialState: IListEditorStateContext<TItem>,
): Context<IListEditorStateContext<TItem>> => createNamedContext<IListEditorStateContext<TItem>>(initialState, "ListEditorStateContext");

export const getListEditorActionsContext = <TItem extends any>(): Context<IListEditorActionsContext<TItem>> =>
  createNamedContext<IListEditorActionsContext<TItem>>(undefined, "ListEditorActionsContext");
