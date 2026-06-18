import React, { Context, PropsWithChildren, useReducer, useState } from 'react';
import { ValueMutator } from './interfaces';
import { IListEditorActionsContext, IListEditorStateContext, ListItemFactory } from './models';

export interface IGenericListEditorProviderProps<TItem extends object> {
  initialState: IListEditorStateContext<TItem>;
  stateContext: Context<IListEditorStateContext<TItem> | undefined>;
  actionContext: Context<IListEditorActionsContext<TItem> | undefined>;
  value: TItem[];
  onChange: ValueMutator<TItem[]>;
  onSelectionChange?: ((value: TItem | undefined) => void) | undefined;
  initNewItem: ListItemFactory<TItem>;
  readOnly: boolean;
}

const GenericListEditorProvider = <TItem extends object>({
  children,
  initialState,
  stateContext,
  actionContext,
  value,
  onChange,
  onSelectionChange,
  initNewItem,
  readOnly,
}: PropsWithChildren<IGenericListEditorProviderProps<TItem>>): React.JSX.Element => {
  const [selectedItem, insernalSetSelectedItem] = useState<TItem>();
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const setSelectedItem = (item: TItem | undefined): void => {
    insernalSetSelectedItem(item);
    if (onSelectionChange)
      onSelectionChange(item);
  };

  const state: IListEditorStateContext<TItem> = {
    ...initialState,
    value: value,
    readOnly: readOnly,
    selectedItem: selectedItem,
  };

  const updateItem = (index: number, item: TItem): void => {
    const newValue = [...state.value];
    newValue[index] = { ...item } as TItem;
    onChange(newValue);
  };

  const addItem = (factory?: ListItemFactory<TItem>): void => {
    const factoryToUse = factory || initNewItem;
    const newItem = factoryToUse(state.value);
    const newValue = [...state.value];
    newValue.push(newItem);

    setSelectedItem(newItem);
    onChange(newValue);
  };

  const insertItem = (index: number): void => {
    const newItem = initNewItem(state.value);
    const newValue = [...state.value];
    newValue.splice(index, 0, newItem);

    setSelectedItem(newItem);
    onChange(newValue);
  };

  const deleteItem = (index: number): void => {
    const newValue = [...state.value];
    const deletedItem = newValue.splice(index, 1);

    if (selectedItem && selectedItem === deletedItem[0]) {
      setSelectedItem(undefined);
    }
    onChange(newValue);
  };

  const updateList = (newItems: TItem[]): void => {
    onChange(newItems);
  };

  const refresh = (applyValue: boolean): void => {
    if (applyValue)
      onChange([...value]);

    forceUpdate();
  };

  const listActions: IListEditorActionsContext<TItem> = {
    /* NEW_ACTION_GOES_HERE */
    deleteItem,
    addItem,
    insertItem,
    updateItem,
    updateList,
    setSelectedItem,
    refresh,
  };

  return (
    <stateContext.Provider value={state}>
      <actionContext.Provider value={listActions}>{children}</actionContext.Provider>
    </stateContext.Provider>
  );
};
export { GenericListEditorProvider };

