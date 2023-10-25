import React, { PropsWithChildren, useContext, useMemo } from 'react';
import { getListEditorActionsContext, getListEditorContextInitialState, getListEditorStateContext } from './contexts';
import { IGenericListEditorProps } from './interfaces';
import { ListItemType } from './models';
import { GenericListEditorProvider } from './provider';
import ListEditorRenderer from './renderer';
import './styles/index.less';

export interface IListStateProps<TItem = any> {
  value: TItem[];
}

export type ListEditorChildrenFn<TItem = any> = (
  item: TItem, 
  itemOnChange: (newValue: TItem) => void,
  index: number
) => React.ReactNode | null;

export interface IListEditorProps<TItem = any> extends IGenericListEditorProps<TItem> {
  children: ListEditorChildrenFn<TItem>;
  initNewItem: (items: TItem[]) => TItem;
}

export const ListEditor = <TItem extends ListItemType>({
  children,
  value,
  onChange,
  initNewItem,
}: IListEditorProps<TItem>) => {
  const component = useMemo(() => {
    return createListEditorComponent<TItem>();
  }, []);
  const { ListEditorProvider, useListEditorComponent } = component;

  return (
    <ListEditorProvider
      value={value}
      onChange={onChange}
      initNewItem={initNewItem}
    >
      <ListEditorRenderer
        contextAccessor={useListEditorComponent}
      >
        {children}
      </ListEditorRenderer>
    </ListEditorProvider>
  );
};

export interface IListEditorProviderProps {

}

export const createListEditorComponent = <TItem extends object>() => {
  const StateContext = getListEditorStateContext<TItem>(undefined);
  const ActionContext = getListEditorActionsContext<TItem>();

  const useListEditorComponent = () => {
    const stateContext = useContext(StateContext);
    const actionsContext = useContext(ActionContext);

    if (stateContext === undefined || actionsContext === undefined) {
      throw new Error('useListEditorComponent must be used within a ListEditorProvider');
    }

    return { ...stateContext, ...actionsContext };
  };

  const ListEditorProvider = <T extends PropsWithChildren<IGenericListEditorProps<TItem>>>(
    props: T
  ) => {
    const { value, onChange, initNewItem } = props;
    const initialState = useMemo(() => {
      return getListEditorContextInitialState<TItem>(value);
    }, []);

    return (
      <GenericListEditorProvider<TItem>
        initialState={initialState}
        stateContext={StateContext}
        actionContext={ActionContext}
        value={value}
        onChange={onChange}
        initNewItem={initNewItem}
      >
        {props.children}
      </GenericListEditorProvider>
    );
  };

  return { ListEditorProvider, useListEditorComponent };
};

