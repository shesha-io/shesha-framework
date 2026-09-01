import {
  FC,
  useReducer,
  useContext,
  PropsWithChildren,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
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
import { isDefined, isNotNullOrWhiteSpace } from '@/utils/nullables';
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

  // The hosting settings input rebuilds the identifier object on every render, so it is narrowed
  // to its parts here. Keeping the object itself in the dependencies re-read the reference list on
  // every re-render, and each read replaced the items - racing the per-item configuration the user
  // was editing (#5125).
  const referenceListName = props.referenceList?.name;
  const referenceListModule = props.referenceList?.module;
  const referenceList = useMemo<IReferenceListIdentifier | undefined>(
    () => isNotNullOrWhiteSpace(referenceListName)
      ? { name: referenceListName, module: referenceListModule ?? null }
      : undefined,
    [referenceListName, referenceListModule],
  );

  useEffect(() => {
    if (!isDefined(referenceList))
      return;
    // The items are read once per reference list, and freshly on every mount, so a reference list
    // edited elsewhere is still picked up without discarding local configuration.
    getReferenceList({
      refListId: referenceList,
    }).promise.then((t) => {
      dispatch(setItems(t.items));
    }).catch((error) => {
      console.error('Failed to fetch reference list', error);
    });
  }, [getReferenceList, referenceList]);

  const selectItem = useCallback((uid: string): void => {
    dispatch(selectItemAction(uid));
  }, []);

  const updateItem = useCallback((payload: IUpdateItemSettingsPayload): void => {
    if (!state.readOnly) dispatch(updateItemAction(payload));
  }, [state.readOnly]);

  // note: the items are read through a ref so that getItem keeps a stable identity - consumers
  // memoize on it and must not recompute every time an item is updated (#5125)
  const itemsRef = useRef(state.items);
  useEffect(() => {
    itemsRef.current = state.items;
  }, [state.items]);

  const getItem = useCallback((uid: string): RefListGroupItemProps | undefined => {
    return getItemById(itemsRef.current, uid);
  }, []);

  const updateChildItems = useCallback((payload: IUpdateChildItemsPayload): void => {
    if (!state.readOnly) dispatch(updateChildItemsAction(payload));
  }, [state.readOnly]);

  const storeSettings = useCallback((columnId: string, isCollapsed: boolean): Promise<void> => {
    dispatch(storeSettingsAction({ columnId: columnId, isCollapsed: isCollapsed }));
    return Promise.resolve();
  }, []);

  const actions = useMemo<IRefListItemGroupConfiguratorActionsContext>(() => ({
    selectItem,
    updateItem,
    getItem,
    updateChildItems,
    storeSettings,
  }), [selectItem, updateItem, getItem, updateChildItems, storeSettings]);

  return (
    <RefListItemGroupConfiguratorStateContext.Provider value={state}>
      <RefListItemGroupConfiguratorActionsContext.Provider value={actions}>
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
