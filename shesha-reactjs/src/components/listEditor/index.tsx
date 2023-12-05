import React, { PropsWithChildren, useContext, useMemo } from 'react';
import { getListEditorActionsContext, getListEditorContextInitialState, getListEditorStateContext, IListEditorContext } from './contexts';
import { IGenericListEditorProps } from './interfaces';
import { ListItem } from './models';
import { GenericListEditorProvider } from './provider';
import { ListEditorRenderer } from './renderer';
import './styles/index.less';

export interface IListStateProps<TItem = any> {
  value: TItem[];
}

export interface ListItemRenderingArgs<TItem = any> {
  item: TItem;
  itemOnChange: (newValue: TItem) => void;
  index: number;
  readOnly: boolean;
}
export type ListEditorChildrenFn<TItem = any> = (args: ListItemRenderingArgs<TItem>) => React.ReactNode | null;

export interface IListEditorProps<TItem = any> extends IGenericListEditorProps<TItem> {
  children: ListEditorChildrenFn<TItem>;
  initNewItem: (items: TItem[]) => TItem;
}

export const ListEditor = <TItem extends ListItem>({
  children,
  value,
  onChange,
  initNewItem,
  readOnly = false,
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
      readOnly={readOnly}
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

interface CreateListEditorComponentResult<TItem extends object> {
  ListEditorProvider: <T extends React.PropsWithChildren<IGenericListEditorProps<TItem>>>(props: T) => React.JSX.Element;
  useListEditorComponent: () => IListEditorContext<TItem>;
}
export const createListEditorComponent = <TItem extends object>(): CreateListEditorComponentResult<TItem> => {
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
    const { value, onChange, initNewItem, readOnly } = props;
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
        readOnly={readOnly}
      >
        {props.children}
      </GenericListEditorProvider>
    );
  };

  return { ListEditorProvider, useListEditorComponent };
};

