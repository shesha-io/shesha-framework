import React, {
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useReducer
  } from 'react';
import SidebarMenuReducer from './reducer';
import { getFlagSetters } from '../utils/flagsSetters';
import { IHeaderAction } from './models';
import { ISidebarMenuItem, isSidebarGroup } from '@/interfaces/sidebar';
import { setItemsAction, toggleSidebarAction } from './actions';
import { useSheshaApplication } from '@/providers';
import {
  SIDEBAR_MENU_CONTEXT_INITIAL_STATE,
  SidebarMenuActionsContext,
  SidebarMenuDefaultsContext,
  SidebarMenuStateContext,
} from './contexts';
import { FormIdFullNameDto } from '@/apis/entityConfig';
import { FormPermissionsDto, formConfigurationCheckPermissions } from '@/apis/formConfiguration';

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
    items,
  });

  const requestItemVisible = (item: ISidebarMenuItem, formsToCheck: FormIdFullNameDto[]): ISidebarMenuItem => {
    if (
      item.actionConfiguration?.actionOwner === 'shesha.common'
      && item.actionConfiguration?.actionName === 'Navigate'
      && item.actionConfiguration?.actionArguments?.navigationType === 'form'
      && item.actionConfiguration?.actionArguments?.formId?.name
      && item.actionConfiguration?.actionArguments?.formId?.module
    ) {
      // form navigation, check form permissions
      const form = formsToCheck.find(x => 
        x.module === item.actionConfiguration?.actionArguments?.formId?.module
        && x.name === item.actionConfiguration?.actionArguments?.formId?.name
      );
      if (!form)
        formsToCheck.push(item.actionConfiguration?.actionArguments?.formId);
      return {...item, isHidden: true};
    } else {
      // other actions, check menu item permissions
      if (item.requiredPermissions && !anyOfPermissionsGranted(item?.requiredPermissions))
        return {...item, isHidden: true};

      if (item.requiredPermissions?.length) {
        if (!anyOfPermissionsGranted(item?.requiredPermissions))
          return {...item, isHidden: true};
      }

      if (isSidebarGroup(item) && item.childItems && item.childItems.length > 0)
        return {...item, isHidden: false, childItems: item.childItems.map((childItem) => requestItemVisible(childItem, formsToCheck))} as ISidebarMenuItem;
      return {...item, isHidden: true};
    }
  };

  const updatetItemVisible = (item: ISidebarMenuItem, formsPermission: FormPermissionsDto[]): ISidebarMenuItem => {
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
      if (form && form.permissions) {
        return {...item, isHidden: !anyOfPermissionsGranted(form.permissions)};
      }
      return {...item, isHidden: false};
    } else {
      // other actions, check menu item permissions
      if (isSidebarGroup(item) && item.childItems && item.childItems.length > 0)
        return {...item, childItems: item.childItems.map(item => updatetItemVisible(item, formsPermission))} as ISidebarMenuItem;
      return item;
    }
  };

  const getFormPermissions = (forms: FormIdFullNameDto[]) => {
    if (forms.length > 0) {
      formConfigurationCheckPermissions(forms, { base: backendUrl, headers: httpHeaders })
        .then((result) => {
          if (result.success) {
            const localItems = items.map((item) => {
              return updatetItemVisible(item, result.result);
            });
            dispatch(setItemsAction(localItems));
          } else {
            console.error(result.error);
          }
        });
    }
  };

  useEffect(() => {
    const formsToCheck = [];
    const localItems = items.map((item) => {
      if (item.isHidden === false) return item;
      return requestItemVisible(item, formsToCheck);
    });
    dispatch(setItemsAction(localItems));
    if (formsToCheck.length > 0) {
      getFormPermissions(formsToCheck);
    }
  }, [items]);

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

  return {...context, ...actions};
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
