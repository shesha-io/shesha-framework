import React, { FC, useReducer, useContext, PropsWithChildren, useEffect } from 'react';
import {
  IUpdateItemSettingsPayload,
  RefListItemGroupConfiguratorActionsContext,
  RefListItemGroupConfiguratorStateContext,
  REF_LIST_ITEM_GROUP_CONTEXT_INITIAL_STATE,
  IUpdateChildItemsPayload,
  IRefListItemGroupConfiguratorStateContext,
  IRefListItemGroupConfiguratorActionsContext,
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
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { isDefined } from '@/utils/nullables';
import { throwError } from '@/utils/errors';

export interface IRefListItemGroupConfiguratorProviderPropsBase {
  baseUrl?: string;
}

export interface IRefListItemGroupConfiguratorProviderProps {
  items: RefListGroupItemProps[];
  readOnly?: boolean | undefined;
  referenceList?: IReferenceListIdentifier | undefined;
}

const RefListSelectorDisplayProvider: FC<PropsWithChildren<IRefListItemGroupConfiguratorProviderProps>> = (props) => {
  const { children, readOnly } = props;
  const { getReferenceList } = useReferenceListDispatcher();

  const [state, dispatch] = useReducer(RefListItemGroupReducer, {
    ...REF_LIST_ITEM_GROUP_CONTEXT_INITIAL_STATE,
    items: props.items,
    readOnly: readOnly ?? false,
  });

  useEffect(() => {
    if (props.items.length && props.items.some((x) => x.referenceList === props.referenceList)) return;
    if (!isDefined(props.referenceList))
      return;

    getReferenceList({
      refListId: props.referenceList,
    }).promise.then((t) => {
      dispatch(setItems(t.items));
    }).catch((error) => {
      console.error('Failed to fetch reference list', error);
      throw error;
    });
  }, [getReferenceList, props.items, props.referenceList]);

  const selectItem = (uid: string): void => {
    dispatch(selectItemAction(uid));
  };

  const updateItem = (payload: IUpdateItemSettingsPayload): void => {
    if (!state.readOnly) dispatch(updateItemAction(payload));
  };

  const getItem = (uid: string): RefListGroupItemProps | undefined => {
    return getItemById(state.items, uid);
  };

  const updateChildItems = (payload: IUpdateChildItemsPayload): void => {
    if (!state.readOnly) dispatch(updateChildItemsAction(payload));
  };

  const storeSettings = (columnId: string, isCollapsed: boolean): Promise<void> => {
    dispatch(storeSettingsAction({ columnId: columnId, isCollapsed: isCollapsed }));
    return Promise.resolve();
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

const useRefListItemGroupConfiguratorState = (): IRefListItemGroupConfiguratorStateContext => useContext(RefListItemGroupConfiguratorStateContext) ?? throwError("useRefListItemGroupConfiguratorState must be used within a RefListItemGroupConfiguratorProvider");

const useRefListItemGroupConfiguratorActions = (): IRefListItemGroupConfiguratorActionsContext => useContext(RefListItemGroupConfiguratorActionsContext) ?? throwError("useRefListItemGroupConfiguratorActions must be used within a RefListItemGroupConfiguratorProvider");

const useRefListItemGroupConfigurator = (): IRefListItemGroupConfiguratorActionsContext & IRefListItemGroupConfiguratorStateContext => {
  return { ...useRefListItemGroupConfiguratorState(), ...useRefListItemGroupConfiguratorActions() };
};

export { RefListSelectorDisplayProvider as RefListItemGroupConfiguratorProvider, useRefListItemGroupConfigurator };
