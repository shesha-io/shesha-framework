export interface IGenericEditorProps<TModel = any> {
    value: TModel;
    onChange: ValueMutator<TModel>;
}

export type ValueMutator<TModel = any> = (newValue: TModel) => void;

export interface IGenericListEditorProps<TItem = any> extends IGenericEditorProps<TItem[]> {
    initNewItem: (items: TItem[]) => TItem;
    readOnly?: boolean;
}