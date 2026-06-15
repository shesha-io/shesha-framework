import { ListItem } from "./models";

export type SelectionType = 'none' | 'single' | 'multiple';
export interface IGenericEditorProps<TModel extends ListItem = ListItem> {
  value: TModel[];
  onChange: ValueMutator<TModel[]>;
  selectionType?: SelectionType | undefined;
  onSelectionChange?: ((value: TModel | undefined) => void) | undefined;
}

export type ValueMutator<TModel> = (newValue: TModel) => void;

export interface IGenericListEditorProps<TItem extends ListItem = ListItem> extends IGenericEditorProps<TItem> {
  initNewItem: (items: TItem[]) => TItem;
  readOnly?: boolean | undefined;
}
