import React, { FC, PropsWithChildren, useContext, useMemo, useReducer } from 'react';
import { usePrevious } from 'react-use';
import { ISidebarMenuItem } from '@/providers/sidebarMenu';
import {
  addGroupAction,
  addItemAction,
  deleteGroupAction,
  deleteItemAction,
  selectItemAction,
  updateChildItemsAction,
  updateItemAction,
} from './actions';
import {
  IUpdateChildItemsPayload,
  IUpdateItemSettingsPayload,
  SIDEBAR_MENU_CONTEXT_INITIAL_STATE,
  SidebarMenuConfiguratorActionsContext,
  SidebarMenuConfiguratorStateContext,
} from './contexts';
import sidebarMenuReducer from './reducer';
import { getItemById } from './utils';

export interface ISidebarMenuConfiguratorProviderPropsBase {
  baseUrl?: string;
}

export interface ISidebarMenuConfiguratorProviderProps {
  items: ISidebarMenuItem[];
}

const SidebarMenuConfiguratorProvider: FC<PropsWithChildren<ISidebarMenuConfiguratorProviderProps>> = (props) => {
  const { children } = props;

  const [state, dispatch] = useReducer(sidebarMenuReducer, {
    ...SIDEBAR_MENU_CONTEXT_INITIAL_STATE,
    items: props.items || [],
  });

  // We don't wanna rerender if selectItem is called with the same selected value
  const previousSelectedItem = usePrevious(state?.selectedItemId);

  const addItem = () => {
    dispatch(addItemAction());
  };

  const deleteItem = (uid: string) => {
    dispatch(deleteItemAction(uid));
  };

  const selectItem = (uid: string) => {
    if (previousSelectedItem !== uid) {
      dispatch(selectItemAction(uid));
    }
  };

  const updateChildItems = (payload: IUpdateChildItemsPayload) => {
    dispatch(updateChildItemsAction(payload));
  };

  const addGroup = () => {
    // console.log('addGroup.... called');

    dispatch(addGroupAction());
  };

  const deleteGroup = (uid: string) => {
    dispatch(deleteGroupAction(uid));
  };

  const getItem = (uid: string): ISidebarMenuItem => {
    return getItemById(state.items, uid);
  };

  const updateItem = (payload: IUpdateItemSettingsPayload) => {
    dispatch(updateItemAction(payload));
  };

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  const memoizedSelectedItemId = useMemo(() => state?.selectedItemId, [state.selectedItemId]);

  return (
    <SidebarMenuConfiguratorStateContext.Provider value={{ ...state, selectedItemId: memoizedSelectedItemId }}>
      <SidebarMenuConfiguratorActionsContext.Provider
        value={{
          addItem,
          deleteItem,
          selectItem,
          updateChildItems,
          getItem,
          updateItem,
          addGroup,
          deleteGroup,
          /* NEW_ACTION_GOES_HERE */
        }}
      >
        {children}
      </SidebarMenuConfiguratorActionsContext.Provider>
    </SidebarMenuConfiguratorStateContext.Provider>
  );
};

function useSidebarMenuConfiguratorState() {
  const context = useContext(SidebarMenuConfiguratorStateContext);

  if (context === undefined) {
    throw new Error('useSidebarMenuConfiguratorState must be used within a SidebarMenuConfiguratorProvider');
  }

  return context;
}

function useSidebarMenuConfiguratorActions() {
  const context = useContext(SidebarMenuConfiguratorActionsContext);

  if (context === undefined) {
    throw new Error('useSidebarMenuConfiguratorActions must be used within a SidebarMenuConfiguratorProvider');
  }

  return context;
}

function useSidebarMenuConfigurator() {
  return { ...useSidebarMenuConfiguratorState(), ...useSidebarMenuConfiguratorActions() };
}

export { SidebarMenuConfiguratorProvider, useSidebarMenuConfigurator };
