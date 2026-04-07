import React, { PropsWithChildren, useContext, useMemo } from 'react';
import { GenericListEditorProvider } from './provider';
import {
  getListEditorActionsContext,
  getListEditorContextInitialState,
  getListEditorStateContext,
} from './contexts';
import { IGenericListEditorProps } from './interfaces';
import { ListEditorRenderer } from './renderer';
import {
  IListEditorContext,
  IListEditorProps,
  ListItem,
  ItemChangeDetails,
  NestedItemsRenderingArgs,
  ListEditorSectionRenderingArgs,
  ListEditorChildrenFn,
  ListEditorSectionRenderingFn,
  ListItemRenderingArgs,
} from './models';

interface CreateListEditorComponentResult<TItem extends object> {
  ListEditorProvider: <T extends React.PropsWithChildren<IGenericListEditorProps<TItem>>>(props: T) => React.JSX.Element;
  useListEditorComponent: () => IListEditorContext<TItem>;
}

export const createListEditorComponent = <TItem extends object>(): CreateListEditorComponentResult<TItem> => {
  const StateContext = getListEditorStateContext<TItem>(undefined);
  const ActionContext = getListEditorActionsContext<TItem>();

  const useListEditorComponent = (): IListEditorContext<TItem> => {
    const stateContext = useContext(StateContext);
    const actionsContext = useContext(ActionContext);

    if (stateContext === undefined || actionsContext === undefined) {
      throw new Error('useListEditorComponent must be used within a ListEditorProvider');
    }

    return { ...stateContext, ...actionsContext };
  };

  const ListEditorProvider = <T extends PropsWithChildren<IGenericListEditorProps<TItem>>>(
    props: T,
  ): JSX.Element => {
    const { value, onChange, onSelectionChange, initNewItem, readOnly } = props;
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
        onSelectionChange={onSelectionChange}
        initNewItem={initNewItem}
        readOnly={readOnly}
      >
        {props.children}
      </GenericListEditorProvider>
    );
  };

  return { ListEditorProvider, useListEditorComponent };
};

export const ListEditor = <TItem extends ListItem>({
  children,
  header,
  value,
  onChange,
  onSelectionChange,
  initNewItem,
  readOnly = false,
  maxItemsCount,
}: IListEditorProps<TItem>): JSX.Element => {
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
      onSelectionChange={onSelectionChange}
    >
      <ListEditorRenderer
        contextAccessor={useListEditorComponent}
        header={header}
        maxItemsCount={maxItemsCount}
      >
        {children}
      </ListEditorRenderer>
    </ListEditorProvider>
  );
};

export { type ItemChangeDetails, type NestedItemsRenderingArgs, type ListEditorSectionRenderingArgs, type ListEditorChildrenFn, type ListEditorSectionRenderingFn, type ListItemRenderingArgs };
