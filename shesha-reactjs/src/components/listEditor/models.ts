import { ItemInterface } from "react-sortablejs";
import { IGenericListEditorProps } from "./interfaces";

export type ListMode = 'create' | 'read' | 'update';

export interface ListItem {
  id?: string;
}

export interface ListItemWithId {
  childItems?: ListItemWithId[];
  itemType?: 'item' | 'group';
  id: string;
}

export interface SortableItem<ListItemType> extends ItemInterface {
  data: ListItemType;
}

export type ListItemFactory<TItem = any> = (items: TItem[]) => TItem;

export interface IListEditorState<TItem = any> {
  value: TItem[];
}

export interface IListEditorStateContext<TItem = any> extends IListEditorState<TItem> {
  readOnly?: boolean;
  selectedItem?: TItem;
}

export interface IListEditorActions<TItem = any> {
  deleteItem: (index: number) => void;
  addItem: (factory?: ListItemFactory<TItem>) => void;
  insertItem: (index: number) => void;
  updateItem: (index: number, item: TItem) => void;
  updateList: (newItems: TItem[]) => void;
}

export interface IListEditorActionsContext<TItem = any> extends IListEditorActions<TItem> {
  setSelectedItem: (item: TItem) => void;
  refresh: (applyValue: boolean) => void;
}

export interface IListEditorContext<TItem = any> extends IListEditorStateContext<TItem>, IListEditorActionsContext<TItem> {

}

export interface ListEditorSectionRenderingArgs<TItem = any> {
  contextAccessor: () => IListEditorContext<TItem>;
  parentItem?: TItem;
  level: number;
  addItemText?: string;
}

export type ListEditorSectionRenderingFn<TItem = any> = (args: ListEditorSectionRenderingArgs<TItem>) => React.ReactNode | null;

export interface IListStateProps<TItem = any> {
  value: TItem[];
}

export interface NestedItemsRenderingArgs<TItem = any> {
  items: TItem[];
  onChange: (newValue: TItem[], changeDetails?: ItemChangeDetails) => void;
  initNewItem: (items: TItem[]) => TItem;
}

export interface ItemChangeDetails {
  isReorder: boolean;
  childsLengthDelta?: number;
}
export interface ListItemRenderingArgs<TItem = any> {
  item: TItem;
  itemOnChange: (newValue: TItem, changeDetails?: ItemChangeDetails) => void;
  index: number;
  readOnly: boolean;
  nestedRenderer?: (args: NestedItemsRenderingArgs<TItem>) => React.ReactNode | null;
}
export type ListEditorChildrenFn<TItem = any> = (args: ListItemRenderingArgs<TItem>) => React.ReactNode | null;

export interface IListEditorProps<TItem = any> extends IGenericListEditorProps<TItem> {
  children: ListEditorChildrenFn<TItem>;
  header?: ListEditorSectionRenderingFn<TItem>;
  initNewItem: (items: TItem[]) => TItem;
  maxItemsCount?: number;
}

export interface IListEditor<TItem = any> extends IListEditorState<TItem>, IListEditorActions<TItem> {

}
