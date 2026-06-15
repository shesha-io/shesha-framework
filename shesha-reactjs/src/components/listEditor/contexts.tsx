import { Context } from "react";
import { createNamedContext } from "@/utils/react";
import { IListEditorActionsContext, IListEditorStateContext, ListItem } from "./models";

export const getListEditorContextInitialState = <TItem extends ListItem>(
  value: TItem[],
): IListEditorStateContext<TItem> => {
  return {
    value: value,
  };
};

export const getListEditorStateContext = <TItem extends ListItem>(
  initialState: IListEditorStateContext<TItem> | undefined,
): Context<IListEditorStateContext<TItem> | undefined> => createNamedContext<IListEditorStateContext<TItem> | undefined>(initialState, "ListEditorStateContext");

export const getListEditorActionsContext = <TItem extends ListItem>(): Context<IListEditorActionsContext<TItem> | undefined> =>
  createNamedContext<IListEditorActionsContext<TItem> | undefined>(undefined, "ListEditorActionsContext");
