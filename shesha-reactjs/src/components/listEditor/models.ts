import { ItemInterface } from "react-sortablejs";
import { IGenericListEditorProps } from "./interfaces";
import { ReactNode } from "react";

export type ListMode = 'create' | 'read' | 'update';

export interface ListItem {
  id?: string;
}

export interface ListItemWithId {
  childItems?: ListItemWithId[] | undefined;
  id: string;
}

export interface SortableItem<ListItemType> extends ItemInterface {
  data: ListItemType;
}

export type ListItemFactory<TItem = unknown> = (items: TItem[]) => TItem;

export interface IListEditorState<TItem = unknown> {
  value: TItem[];
}

export interface IListEditorStateContext<TItem = unknown> extends IListEditorState<TItem> {
  readOnly?: boolean | undefined;
  selectedItem?: TItem | undefined;
}

export interface IListEditorActions<TItem = unknown> {
  deleteItem: (index: number) => void;
  addItem: (factory?: ListItemFactory<TItem>) => void;
  insertItem: (index: number) => void;
  updateItem: (index: number, item: TItem) => void;
  updateList: (newItems: TItem[]) => void;
}

export interface IListEditorActionsContext<TItem = unknown> extends IListEditorActions<TItem> {
  setSelectedItem: (item: TItem | undefined) => void;
  refresh: (applyValue: boolean) => void;
}

export interface IListEditorContext<TItem = unknown> extends IListEditorStateContext<TItem>, IListEditorActionsContext<TItem> {

}

export interface ListEditorSectionRenderingArgs<TItem = unknown> {
  contextAccessor: () => IListEditorContext<TItem>;
  parentItem?: TItem | undefined;
  level: number;
  addItemText?: string | undefined;
}

export type ListEditorSectionRenderingFn<TItem = unknown> = (props: ListEditorSectionRenderingArgs<TItem>) => ReactNode;

export interface IListStateProps<TItem = unknown> {
  value: TItem[];
}

export interface NestedItemsRenderingArgs<TItem = unknown> {
  items: TItem[];
  onChange: (newValue: TItem[], changeDetails?: ItemChangeDetails | undefined) => void;
  initNewItem: (items: TItem[]) => TItem;
}

export interface ItemChangeDetails {
  isReorder: boolean;
  childsLengthDelta?: number;
}
export interface ListItemRenderingArgs<TItem = unknown> {
  item: TItem;
  itemOnChange: (newValue: TItem, changeDetails?: ItemChangeDetails) => void;
  index: number;
  readOnly: boolean;
  nestedRenderer?: ((args: NestedItemsRenderingArgs<TItem>) => React.ReactNode | null) | undefined;
}
export type ListEditorChildrenFn<TItem extends ListItem> = (props: ListItemRenderingArgs<TItem>) => ReactNode;

export interface IListEditorProps<TItem extends ListItem> extends IGenericListEditorProps<TItem> {
  children: ListEditorChildrenFn<TItem>;
  header?: ListEditorSectionRenderingFn<TItem> | undefined;
  initNewItem: (items: TItem[]) => TItem;
  maxItemsCount?: number | undefined;
}

export interface IListEditor<TItem = unknown> extends IListEditorState<TItem>, IListEditorActions<TItem> {

}
