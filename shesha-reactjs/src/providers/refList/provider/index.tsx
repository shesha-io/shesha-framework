import React, { FC, useReducer, useContext, PropsWithChildren, useEffect } from 'react';
import {
  IUpdateItemSettingsPayload,
  RefListItemGroupConfiguratorActionsContext,
  RefListItemGroupConfiguratorStateContext,
  REF_LIST_ITEM_GROUP_CONTEXT_INITIAL_STATE,
  IUpdateChildItemsPayload,
} from './contexts';
import {
  selectItemAction,
  setItems,
  storeSettingsAction,
  updateChildItemsAction,
  updateItemAction,
} from './actions';
import { RefListGroupItemProps } from './models';
import { useGet } from '@/hooks';
import RefListItemGroupReducer from './reducers';
import { getItemById, getRefListItems } from './utils';


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

const RefListItemGroupConfiguratorProvider: FC<PropsWithChildren<IRefListItemGroupConfiguratorProviderProps>> = (props) => {
  const { children, readOnly } = props;
  const { refetch } = useGet({ path: '', lazy: true });

  const [state, dispatch] = useReducer(RefListItemGroupReducer, {
    ...REF_LIST_ITEM_GROUP_CONTEXT_INITIAL_STATE,
    items: props.items,
    readOnly: readOnly,
  });


  useEffect(() => {
    if (props?.items?.length && props.items.some(x =>x.referenceList?.id === props?.referenceList?.id )) return;
    refetch(getRefListItems(props.referenceList?.id as string))
    .then((resp) => {
      dispatch(setItems(resp.result.items));
    })
    .catch((_e) => {
      console.error("LOG:: reference list error", _e);
    });

  }, [props?.referenceList?.id]);

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
    throw new Error('useRefListItemGroupConfiguratorActions must be used within a RefListItemGroupConfiguratorProvider');
  }

  return context;
}

function useRefListItemGroupConfigurator() {
  return { ...useRefListItemGroupConfiguratorState(), ...useRefListItemGroupConfiguratorActions() };
}

export { RefListItemGroupConfiguratorProvider, useRefListItemGroupConfigurator };
