import React, {
  FC,
  PropsWithChildren,
  useContext,
  useReducer
  } from 'react';
import SidebarMenuReducer from './reducer';
import { getFlagSetters } from '../utils/flagsSetters';
import { IHeaderAction } from './models';
import { ISidebarMenuItem, isSidebarGroup } from '@/interfaces/sidebar';
import { toggleSidebarAction } from './actions';
import { useSheshaApplication } from '@/providers';
import {
  SIDEBAR_MENU_CONTEXT_INITIAL_STATE,
  SidebarMenuActionsContext,
  SidebarMenuDefaultsContext,
  SidebarMenuStateContext,
} from './contexts';

export interface ISidebarMenuProviderProps {
  items: ISidebarMenuItem[];
  actions?: IHeaderAction[];
  accountDropdownListItems?: IHeaderAction[];
}

const SidebarMenuProvider: FC<PropsWithChildren<ISidebarMenuProviderProps>> = ({
  actions,
  accountDropdownListItems,
  items,
  children,
}) => {
  const { anyOfPermissionsGranted } = useSheshaApplication();

  const [state, dispatch] = useReducer(SidebarMenuReducer, {
    ...SIDEBAR_MENU_CONTEXT_INITIAL_STATE,
    actions,
    accountDropdownListItems,
  });

  const getItems = () => items;

  const isItemVisible = (item: ISidebarMenuItem): boolean => {
    if (item.isHidden) return false;
    if (item.requiredPermissions && !anyOfPermissionsGranted(item?.requiredPermissions)) return false;

    if (item.requiredPermissions?.length) {
      if (!anyOfPermissionsGranted(item?.requiredPermissions)) return false;
    }

    return isSidebarGroup(item) && item.childItems && item.childItems.length > 0
      ? item.childItems.some((childItem) => isItemVisible(childItem))
      : true;
  };

  const collapse = () => {
    dispatch(toggleSidebarAction(false));
  };

  const expand = () => {
    dispatch(toggleSidebarAction(true));
  };

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  return (
    <SidebarMenuStateContext.Provider value={state}>
      <SidebarMenuActionsContext.Provider
        value={{
          ...getFlagSetters(dispatch),
          collapse,
          expand,
          isItemVisible,
          getItems,
          /* NEW_ACTION_GOES_HERE */
        }}
      >
        {children}
      </SidebarMenuActionsContext.Provider>
    </SidebarMenuStateContext.Provider>
  );
};

function useSidebarMenuState(require: boolean) {
  const context = useContext(SidebarMenuStateContext);

  if (context === undefined && require) {
    throw new Error('useSidebarMenuState must be used within a SidebarMenuProvider');
  }

  return context;
}

function useSidebarMenuActions(require: boolean) {
  const context = useContext(SidebarMenuActionsContext);

  if (context === undefined && require) {
    throw new Error('useSidebarMenuActions must be used within a SidebarMenuProvider');
  }

  return context;
}

function useSidebarMenu(require: boolean = true) {
  const actionsContext = useSidebarMenuActions(require);
  const stateContext = useSidebarMenuState(require);

  // useContext() returns initial state when provider is missing
  // initial context state is useless especially when require == true
  // so we must return value only when both context are available
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
}

//#region temporary defaults provider
export interface ISidebarMenuDefaultsProviderProps {
  items: ISidebarMenuItem[];
}
const SidebarMenuDefaultsProvider: FC<PropsWithChildren<ISidebarMenuDefaultsProviderProps>> = ({ items, children }) => {
  return (
    <SidebarMenuDefaultsContext.Provider
      value={{
        items,
      }}
    >
      {children}
    </SidebarMenuDefaultsContext.Provider>
  );
};

function useSidebarMenuDefaults() {
  const context = useContext(SidebarMenuDefaultsContext);

  return context;
}

//#endregion

export {
  SidebarMenuDefaultsProvider,
  SidebarMenuProvider,
  useSidebarMenu,
  useSidebarMenuActions, // note: to be removed
  useSidebarMenuDefaults,
  useSidebarMenuState,
  type IHeaderAction,
  type ISidebarMenuItem,
};
