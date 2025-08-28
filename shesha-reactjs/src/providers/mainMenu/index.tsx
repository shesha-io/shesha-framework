import React, { FC, PropsWithChildren, useContext, useEffect, useReducer, useRef, useCallback } from 'react';
import { setItemsAction, setLoadedMenuAction } from './actions';
import { IConfigurableMainMenu, MAIN_MENU_CONTEXT_INITIAL_STATE, MainMenuActionsContext, MainMenuStateContext } from './contexts';
import { uiReducer } from './reducer';
import { FormFullName, isNavigationActionConfiguration, useSettingValue, useSheshaApplication, useAuth } from '..';
import { IHasVersion, Migrator } from '@/utils/fluentMigrator/migrator';
import { mainMenuMigration } from './migrations/migration';
import { getActualModel, useAvailableConstantsData } from '../form/utils';
import { ISidebarMenuItem, isSidebarGroup } from '@/interfaces/sidebar';
import { FormPermissionsDto, formConfigurationCheckPermissions } from '@/apis/formConfiguration';
import { FormIdFullNameDto } from '@/apis/entityConfig';
import { settingsUpdateValue } from '@/apis/settings';
import { useDeepCompareEffect } from '@/hooks/useDeepCompareEffect';

export interface MainMenuProviderProps {
  mainMenuConfigKey?: string;
}

// Deep clone items to prevent mutations
const deepCloneItems = (items: ISidebarMenuItem[]): ISidebarMenuItem[] => {
  return items.map(item => {
    const clonedItem = { ...item };
    if (isSidebarGroup(clonedItem) && clonedItem.childItems) {
      clonedItem.childItems = deepCloneItems(clonedItem.childItems);
    }
    return clonedItem;
  });
};

const getItemsWithFormNavigation = (items: ISidebarMenuItem[]): ISidebarMenuItem[] => {
  const itemsToCheck: ISidebarMenuItem[] = [];

  const collectItems = (itemList: ISidebarMenuItem[]) => {
    itemList?.forEach((item) => {
      if (isSidebarGroup(item) && item.childItems && item.childItems.length > 0) {
        collectItems(item.childItems);
        return;
      }

      if (
        isNavigationActionConfiguration(item.actionConfiguration)
        && item.actionConfiguration?.actionArguments?.navigationType === 'form'
        && (item.actionConfiguration?.actionArguments?.formId as FormFullName)?.name
        && (item.actionConfiguration?.actionArguments?.formId as FormFullName)?.module
      ) {
        itemsToCheck.push(item);
      }
    });
  };

  collectItems(items);
  return itemsToCheck;
};

const MainMenuProvider: FC<PropsWithChildren<MainMenuProviderProps>> = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, { ...MAIN_MENU_CONTEXT_INITIAL_STATE });

  const { loadingState, value: fetchedMainMenu } = useSettingValue({ module: 'Shesha', name: 'Shesha.MainMenuSettings' });
  const auth = useAuth(false);

  const { applicationKey, anyOfPermissionsGranted, backendUrl, httpHeaders } = useSheshaApplication();
  const allData = useAvailableConstantsData();

  // Use ref to track the current operation to prevent race conditions
  const currentOperationId = useRef<number>(0);
  const formPermissionedItems = useRef<ISidebarMenuItem[]>([]);

  const getActualItemsModel = useCallback((items: ISidebarMenuItem[]) => {
    const actualItems = items.map((item) => {
      var actualItem = getActualModel(item, allData);
      if (isSidebarGroup(actualItem) && actualItem.childItems && actualItem.childItems.length > 0) {
        actualItem.childItems = getActualItemsModel(actualItem.childItems);
      }
      if (actualItem.requiredPermissions?.length > 0)
        if (anyOfPermissionsGranted(actualItem?.requiredPermissions))
          return actualItem;
        else
          return { ...actualItem, hidden: true };
      return actualItem;
    });

    return actualItems;
  }, [allData, anyOfPermissionsGranted]);

  const updateFormNavigationVisible = useCallback((items: ISidebarMenuItem[], formsPermission: FormPermissionsDto[]) => {
    const updateItem = (item: ISidebarMenuItem): ISidebarMenuItem => {
      const updatedItem = { ...item };

      if (isSidebarGroup(updatedItem) && updatedItem.childItems) {
        updatedItem.childItems = updatedItem.childItems.map(updateItem);
        return updatedItem;
      }

      if (
        updatedItem.actionConfiguration?.actionOwner === 'shesha.common'
        && updatedItem.actionConfiguration?.actionName === 'Navigate'
        && updatedItem.actionConfiguration?.actionArguments?.navigationType === 'form'
        && updatedItem.actionConfiguration?.actionArguments?.formId?.name
        && updatedItem.actionConfiguration?.actionArguments?.formId?.module
      ) {
        // form navigation, check form permissions
        const form = formsPermission.find(x =>
          x.module === updatedItem.actionConfiguration?.actionArguments?.formId?.module
          && x.name === updatedItem.actionConfiguration?.actionArguments?.formId?.name
        );

        // Preserve original hidden state OR apply form permission logic
        // If already hidden, keep it hidden. If not hidden, check form permissions.
        const shouldHideBasedOnFormPermissions = form && form.permissions && !anyOfPermissionsGranted(form.permissions);
        updatedItem.hidden = updatedItem.hidden || shouldHideBasedOnFormPermissions;
      }

      return updatedItem;
    };

    return items.map(updateItem);
  }, [anyOfPermissionsGranted]);

  const processMenuItems = useCallback(async (items: ISidebarMenuItem[], operationId: number) => {
    // Create a deep clone to prevent mutations during async operations
    const clonedItems = deepCloneItems(items);
    const itemsToCheck = getItemsWithFormNavigation(clonedItems);

    if (itemsToCheck.length > 0) {
      try {
        const request = itemsToCheck.map(x => x.actionConfiguration?.actionArguments?.formId as FormIdFullNameDto);
        const result = await formConfigurationCheckPermissions(request, { base: backendUrl, headers: httpHeaders });

        // Check if this operation is still current
        if (currentOperationId.current !== operationId) {
          return; // This operation was superseded
        }

        if (result.success) {
          const updatedItems = updateFormNavigationVisible(clonedItems, result.result);
          formPermissionedItems.current = updatedItems;
          dispatch(setItemsAction(getActualItemsModel(updatedItems)));
        } else {
          console.error('Form permission check failed:', result.error);
          // Fallback: use items without form permission checks
          formPermissionedItems.current = clonedItems;
          dispatch(setItemsAction(getActualItemsModel(clonedItems)));
        }
      } catch (error) {
        // Check if this operation is still current
        if (currentOperationId.current !== operationId) {
          return; // This operation was superseded
        }

        console.error('Error checking form permissions:', error);
        // Fallback: use items without form permission checks
        formPermissionedItems.current = clonedItems;
        dispatch(setItemsAction(getActualItemsModel(clonedItems)));
      }
    } else {
      // Check if this operation is still current
      if (currentOperationId.current !== operationId) {
        return; // This operation was superseded
      }

      formPermissionedItems.current = clonedItems;
      dispatch(setItemsAction(getActualItemsModel(clonedItems)));
    }
  }, [backendUrl, httpHeaders, deepCloneItems, getItemsWithFormNavigation, updateFormNavigationVisible, getActualItemsModel]);

  const updateMainMenu = useCallback((value: IConfigurableMainMenu) => {
    // Increment operation ID to cancel any previous operations
    const operationId = ++currentOperationId.current;

    const migratorInstance = new Migrator<IConfigurableMainMenu, IConfigurableMainMenu>();
    const fluent = mainMenuMigration(migratorInstance);
    const versionedValue = { ...value } as IHasVersion;
    if (versionedValue.version === undefined)
      versionedValue.version = -1;

    const model = fluent.migrator.upgrade(versionedValue, {});
    dispatch(setLoadedMenuAction(model as IConfigurableMainMenu));

    // Process menu items asynchronously
    if (Array.isArray(model.items)) {
      processMenuItems(model.items, operationId);
    } else if (model.items) {
      processMenuItems([model.items], operationId);
    }
  }, [processMenuItems]);

  // Handle allData changes with race condition protection
  useDeepCompareEffect(() => {
    const operationId = ++currentOperationId.current;

    // Use a small delay to debounce rapid allData changes
    const timeoutId = setTimeout(() => {
      if (currentOperationId.current === operationId && formPermissionedItems.current.length > 0) {
        dispatch(setItemsAction(getActualItemsModel(formPermissionedItems.current)));
      }
    }, 10);

    return () => clearTimeout(timeoutId);
  }, [allData, getActualItemsModel]);

  useEffect(() => {
    if (loadingState === 'ready' && fetchedMainMenu) {
      updateMainMenu(fetchedMainMenu);
    }
  }, [loadingState, auth?.isLoggedIn, fetchedMainMenu, updateMainMenu]);

  const changeMainMenu = useCallback((value: IConfigurableMainMenu) => {
    updateMainMenu(value);
  }, [updateMainMenu]);

  const saveMainMenu = useCallback((value: IConfigurableMainMenu) => {
    return settingsUpdateValue(
      {
        name: 'Shesha.MainMenuSettings',
        module: 'Shesha',
        appKey: applicationKey,
        value: value,
      },
      { base: backendUrl, headers: httpHeaders }
    )
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.error('Error saving main menu:', error);
        throw error;
      });
  }, [applicationKey, backendUrl, httpHeaders]);

  return (
    <MainMenuStateContext.Provider value={state}>
      <MainMenuActionsContext.Provider
        value={{
          changeMainMenu,
          saveMainMenu
        }}
      >
        {children}
      </MainMenuActionsContext.Provider>
    </MainMenuStateContext.Provider>
  );
};

function useMainMenuState() {
  const context = useContext(MainMenuStateContext);

  if (context === undefined) {
    throw new Error('useMainMenuState must be used within a MainMenuProvider');
  }
  return context;
}

function useMainMenuActions() {
  const context = useContext(MainMenuActionsContext);

  if (context === undefined) {
    throw new Error('useMainMenuActions must be used within a MainMenuProvider');
  }

  return context;
}

function useMainMenu() {
  return { ...useMainMenuState(), ...useMainMenuActions() };
}

export { MainMenuProvider, useMainMenu, useMainMenuActions, useMainMenuState, type IConfigurableMainMenu };