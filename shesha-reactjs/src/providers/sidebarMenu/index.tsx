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
import { setItemsAction, toggleSidebarAction } from './actions';
import { FormFullName, isNavigationActionConfiguration, useSheshaApplication } from '@/providers';
import {
  SIDEBAR_MENU_CONTEXT_INITIAL_STATE,
  SidebarMenuActionsContext,
  SidebarMenuDefaultsContext,
  SidebarMenuStateContext,
} from './contexts';
import { FormIdFullNameDto } from '@/apis/entityConfig';
import { FormPermissionsDto, formConfigurationCheckPermissions } from '@/apis/formConfiguration';
import { useDeepCompareEffect } from '@/hooks/useDeepCompareEffect';
import { useActualContextData } from '@/hooks';

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
  const { anyOfPermissionsGranted, backendUrl, httpHeaders } = useSheshaApplication();

  const [state, dispatch] = useReducer(SidebarMenuReducer, {
    ...SIDEBAR_MENU_CONTEXT_INITIAL_STATE,
    actions,
    accountDropdownListItems,
    items: [],
  });

  const actualItems = useActualContextData(items);

  const requestItemVisible = (item: ISidebarMenuItem, itemsToCheck: ISidebarMenuItem[]): ISidebarMenuItem => {
    if (item.hidden)
      return item;

    const availableByPermissions = item.requiredPermissions?.length > 0
      ? anyOfPermissionsGranted(item?.requiredPermissions)
      : true;

    if (isSidebarGroup(item) && item.childItems && item.childItems.length > 0)
      return { ...item, hidden: !availableByPermissions, childItems: item.childItems.map((childItem) => requestItemVisible(childItem, itemsToCheck)) } as ISidebarMenuItem;

    if (
      availableByPermissions &&
      isNavigationActionConfiguration(item.actionConfiguration)
      && item.actionConfiguration?.actionArguments?.navigationType === 'form'
      && (item.actionConfiguration?.actionArguments?.formId as FormFullName)?.name
      && (item.actionConfiguration?.actionArguments?.formId as FormFullName)?.module
    ) {
      // form navigation, check form permissions
      const newItem = { ...item, hidden: true };
      itemsToCheck.push(newItem);
      return newItem;
    }

    return { ...item, hidden: !availableByPermissions };
  };

  const updatetItemVisible = (item: ISidebarMenuItem, formsPermission: FormPermissionsDto[]) => {
    if (
      item.actionConfiguration?.actionOwner === 'shesha.common'
      && item.actionConfiguration?.actionName === 'Navigate'
      && item.actionConfiguration?.actionArguments?.navigationType === 'form'
      && item.actionConfiguration?.actionArguments?.formId?.name
      && item.actionConfiguration?.actionArguments?.formId?.module
    ) {
      // form navigation, check form permissions
      const form = formsPermission.find(x =>
        x.module === item.actionConfiguration?.actionArguments?.formId?.module
        && x.name === item.actionConfiguration?.actionArguments?.formId?.name
      );
      item.hidden = form && form.permissions && !anyOfPermissionsGranted(form.permissions);
    }
  };

  const getFormPermissions = (items: ISidebarMenuItem[], itemsToCheck: ISidebarMenuItem[]) => {
    if (itemsToCheck.length > 0) {
      formConfigurationCheckPermissions(
        itemsToCheck.map(x => x.actionConfiguration?.actionArguments?.formId as FormIdFullNameDto),
        { base: backendUrl, headers: httpHeaders }
      )
        .then((result) => {
          if (result.success) {
            itemsToCheck.forEach((item) => {
              return updatetItemVisible(item, result.result);
            });
            dispatch(setItemsAction([...items]));
          } else {
            console.error(result.error);
          }
        });
    }
  };

  useDeepCompareEffect(() => {
    const itemsToCheck = [];
    const localItems = actualItems.map((item) => requestItemVisible(item, itemsToCheck));
    
    if (itemsToCheck.length > 0) {
      getFormPermissions(localItems, itemsToCheck);
    } else
      if (localItems.length > 0) {
        // no forms to check set items as is
        dispatch(setItemsAction([...localItems]));
      }
  }, [actualItems]);

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
  const actions = useContext(SidebarMenuActionsContext);

  if ((context === undefined || actions === undefined) && require) {
    throw new Error('useSidebarMenuState must be used within a SidebarMenuProvider');
  }

  return { ...context, ...actions };
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
