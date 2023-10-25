import React, { Context, PropsWithChildren } from 'react';
import { IListEditorStateContext, IListEditorActionsContext } from './contexts';
import { ValueMutator } from './interfaces';

export interface IGenericListEditorProviderProps<TItem extends object> {
    initialState: IListEditorStateContext<TItem>;
    stateContext: Context<IListEditorStateContext<TItem>>;
    actionContext: Context<IListEditorActionsContext<TItem>>;
    value: TItem[];
    onChange: ValueMutator<TItem[]>;
    initNewItem: (items: TItem[]) => TItem;
    readOnly: boolean;
}

const GenericListEditorProvider = <TItem extends object>({
    children,
    initialState,
    stateContext,
    actionContext,
    value,
    onChange,
    initNewItem,
    readOnly,
}: PropsWithChildren<IGenericListEditorProviderProps<TItem>>) => {
   const state: IListEditorStateContext<TItem> = { ...initialState, value: value, readOnly: readOnly };

   const updateItem = (index: number, item: TItem) => {
        const newValue = [...state.value];
        newValue[index] = {...item} as TItem;
        onChange(newValue);
   };

    const addItem = () => {
        const newItem = initNewItem(state.value);
        const newValue = state.value ? [...state.value] : [];
        newValue.push(newItem);

        onChange(newValue);
    };

    const deleteItem = (index: number) => {
        if (!state.value)
            return;
        const newValue = [...state.value];
        newValue.splice(index, 1);

        onChange(newValue);
    };

    const updateList = (newItems: TItem[]) => {
        onChange(newItems);
    };

    const listActions: IListEditorActionsContext<TItem> = {
        /* NEW_ACTION_GOES_HERE */
        deleteItem,
        addItem,
        updateItem,
        updateList,
    };

    return (
        <stateContext.Provider value={state}>
            <actionContext.Provider value={listActions}>{children}</actionContext.Provider>
        </stateContext.Provider>
    );
};
export { GenericListEditorProvider };