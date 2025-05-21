import React, { FC, useReducer, useContext, PropsWithChildren, useEffect } from 'react';
import {
  IUpdateItemSettingsPayload,
  RefListItemGroupConfiguratorActionsContext,
  RefListItemGroupConfiguratorStateContext,
  REF_LIST_ITEM_GROUP_CONTEXT_INITIAL_STATE,
  IUpdateChildItemsPayload,
} from '@/components/refListSelectorDisplay/provider/contexts';
import {
  selectItemAction,
  setItems,
  storeSettingsAction,
  updateChildItemsAction,
  updateItemAction,
} from '@/components/refListSelectorDisplay/provider/actions';
import { RefListGroupItemProps } from '@/components/refListSelectorDisplay/provider/models';
import RefListItemGroupReducer from '@/components/refListSelectorDisplay/provider/reducers';
import { getItemById } from '@/components/refListSelectorDisplay/provider/utils';
import { useReferenceListDispatcher } from '@/providers/referenceListDispatcher';

export interface IRefListItemGroupConfiguratorProviderPropsBase {
  baseUrl?: string;
}

export interface IRefListItemGroupConfiguratorProviderProps {
  items: RefListGroupItemProps[];
  value?: any;
  onChange?: (value: any) => void;
  readOnly?: boolean;
  referenceList?: any;
}

const RefListSelectorDisplayProvider: FC<PropsWithChildren<IRefListItemGroupConfiguratorProviderProps>> = (props) => {
  const { children, readOnly } = props;
  const { getReferenceList } = useReferenceListDispatcher();

  const [state, dispatch] = useReducer(RefListItemGroupReducer, {
    ...REF_LIST_ITEM_GROUP_CONTEXT_INITIAL_STATE,
    items: props.items,
    readOnly: readOnly,
  });

  useEffect(() => {
    if (props?.items?.length && props.items.some((x) => x.referenceList === props?.referenceList)) return;
    getReferenceList({
      refListId: { module: props?.referenceList?.module, name: props?.referenceList?.name },
    }).promise.then((t) => {
      dispatch(setItems(t?.items));
    });
  }, [props?.referenceList]);

  const selectItem = (uid: string) => {
    dispatch(selectItemAction(uid));
  };

  const updateItem = (payload: IUpdateItemSettingsPayload) => {
    if (!state.readOnly) dispatch(updateItemAction(payload));
  };

  const getItem = (uid: string): RefListGroupItemProps => {
    return getItemById(state.items, uid);
  };

  const updateChildItems = (payload: IUpdateChildItemsPayload) => {
    if (!state.readOnly) dispatch(updateChildItemsAction(payload));
  };

  const storeSettings = async (columnId: string, isCollapsed: boolean) => {
    dispatch(storeSettingsAction({ columnId: columnId, isCollapsed: isCollapsed }));
  };

  return (
    <RefListItemGroupConfiguratorStateContext.Provider value={state}>
      <RefListItemGroupConfiguratorActionsContext.Provider
        value={{
          selectItem,
          updateItem,
          getItem,
          updateChildItems,
          storeSettings,
        }}
      >
        {children}
      </RefListItemGroupConfiguratorActionsContext.Provider>
    </RefListItemGroupConfiguratorStateContext.Provider>
  );
};

function useRefListItemGroupConfiguratorState() {
  const context = useContext(RefListItemGroupConfiguratorStateContext);

  if (context === undefined) {
    throw new Error('useRefListItemGroupConfiguratorState must be used within a RefListItemGroupConfiguratorProvider');
  }

  return context;
}

function useRefListItemGroupConfiguratorActions() {
  const context = useContext(RefListItemGroupConfiguratorActionsContext);

  if (context === undefined) {
    throw new Error(
      'useRefListItemGroupConfiguratorActions must be used within a RefListItemGroupConfiguratorProvider'
    );
  }

  return context;
}

function useRefListItemGroupConfigurator() {
  return { ...useRefListItemGroupConfiguratorState(), ...useRefListItemGroupConfiguratorActions() };
}

export { RefListSelectorDisplayProvider as RefListItemGroupConfiguratorProvider, useRefListItemGroupConfigurator };
