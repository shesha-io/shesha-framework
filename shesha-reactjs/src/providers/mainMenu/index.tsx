import React, { FC, PropsWithChildren, useContext, useEffect, useReducer, useRef } from 'react';
import { setItemsAction, setLoadedMenuAction } from './actions';
import { IConfigurableMainMenu, IMainMenuActionsContext, IMainMenuStateContext, MAIN_MENU_CONTEXT_INITIAL_STATE, MainMenuActionsContext, MainMenuStateContext } from './contexts';
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
import { IAjaxResponse } from '@/interfaces/ajaxResponse';

export interface MainMenuProviderProps {
  mainMenuConfigKey?: string;
}

const MainMenuProvider: FC<PropsWithChildren<MainMenuProviderProps>> = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, { ...MAIN_MENU_CONTEXT_INITIAL_STATE });

  const { loadingState, value: fetchedMainMenu } = useSettingValue({ module: 'Shesha', name: 'Shesha.MainMenuSettings' });
  const auth = useAuth(false);

  const { applicationKey, anyOfPermissionsGranted, backendUrl, httpHeaders } = useSheshaApplication();
  const allData = useAvailableConstantsData();

  const formPermissionedItems = useRef<ISidebarMenuItem[]>([]);
  const originalHiddenValues = useRef<Map<string, boolean>>(new Map());

  const storeOriginalHiddenValues = (items: ISidebarMenuItem[]): void => {
    items.forEach((item) => {
      if (!originalHiddenValues.current.has(item.id)) {
        originalHiddenValues.current.set(item.id, item.hidden || false);
      }
      if (isSidebarGroup(item) && item.childItems) {
        storeOriginalHiddenValues(item.childItems);
      }
    });
  };

  const updateOriginalHiddenValues = (items: ISidebarMenuItem[]): void => {
    items.forEach((item) => {
      originalHiddenValues.current.set(item.id, item.hidden || false);
      if (isSidebarGroup(item) && item.childItems) {
        updateOriginalHiddenValues(item.childItems);
      }
    });
  };

  const getActualItemsModel = (items: ISidebarMenuItem[]): ISidebarMenuItem[] => {
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
  };

  const findAndUpdateFormNavigationVisible = (items: ISidebarMenuItem[], targetItem: ISidebarMenuItem, formsPermission: FormPermissionsDto[]): boolean => {
    for (const item of items) {
      if (item.id === targetItem.id) {
        if (isNavigationActionConfiguration(item.actionConfiguration)) {
          // form navigation, check form permissions
          const form = formsPermission.find((x) =>
            x.module === item.actionConfiguration?.actionArguments?.formId?.module &&
            x.name === item.actionConfiguration?.actionArguments?.formId?.name,
          );
          const hiddenByFormPermissions = form && form.permissions ? !anyOfPermissionsGranted(form.permissions) : false;
          const hiddenByRequiredPermissions = item.requiredPermissions?.length > 0 ? !anyOfPermissionsGranted(item.requiredPermissions) : false;
          const originalHiddenValue = originalHiddenValues.current.get(item.id) || false;
          // For form navigation items: respect original hidden setting OR any permission failure
          item.hidden = originalHiddenValue || hiddenByFormPermissions || hiddenByRequiredPermissions;
        }
        return true;
      }
      if (isSidebarGroup(item) && item.childItems) {
        if (findAndUpdateFormNavigationVisible(item.childItems, targetItem, formsPermission)) {
          return true;
        }
      }
    }
    return false;
  };

  const getItemsWithFormNavigation = (items: ISidebarMenuItem[]): ISidebarMenuItem[] => {
    const itemsToCheck = [];
    items?.forEach((item) => {
      if (isSidebarGroup(item) && item.childItems && item.childItems.length > 0) {
        itemsToCheck.push(...getItemsWithFormNavigation(item.childItems));
        return;
      }

      if (
        isNavigationActionConfiguration(item.actionConfiguration) &&
        item.actionConfiguration?.actionArguments?.navigationType === 'form' &&
        (item.actionConfiguration?.actionArguments?.formId as FormFullName)?.name &&
        (item.actionConfiguration?.actionArguments?.formId as FormFullName)?.module
      ) {
        // Form navigation item - will be processed for permissions
        itemsToCheck.push(item);
      }
    });

    return itemsToCheck;
  };

  const getFormPermissions = (items: ISidebarMenuItem[], itemsToCheck: ISidebarMenuItem[]): void => {
    if (itemsToCheck.length > 0) {
      const request = itemsToCheck.map((x) => x.actionConfiguration?.actionArguments?.formId as FormIdFullNameDto);
      formConfigurationCheckPermissions(request, { base: backendUrl, headers: httpHeaders })
        .then((result) => {
          if (result.success) {
            itemsToCheck.forEach((item) => {
              findAndUpdateFormNavigationVisible(items, item, result.result);
            });
            formPermissionedItems.current = [...items];
            dispatch(setItemsAction(getActualItemsModel(formPermissionedItems.current)));
          } else {
            console.error(result.error);
          }
        });
    }
  };

  const updateMainMenu = (value: IConfigurableMainMenu): void => {
    const migratorInstance = new Migrator<IConfigurableMainMenu, IConfigurableMainMenu>();
    const fluent = mainMenuMigration(migratorInstance);
    const versionedValue = { ...value } as IHasVersion;
    if (versionedValue.version === undefined)
      versionedValue.version = -1;
    const model = fluent.migrator.upgrade(versionedValue, {});
    dispatch(setLoadedMenuAction(model as IConfigurableMainMenu));

    // Store original hidden values on data load
    if (model.items) {
      storeOriginalHiddenValues(Array.isArray(model.items) ? model.items : [model.items]);
    }

    const itemsToCheck = getItemsWithFormNavigation(model.items);
    if (itemsToCheck.length > 0) {
      getFormPermissions(model.items, itemsToCheck);
    } else {
      formPermissionedItems.current = Array.isArray(model.items) ? [...model.items] : [model.items];
      dispatch(setItemsAction(getActualItemsModel(formPermissionedItems.current)));
    }
  };

  useDeepCompareEffect(() => {
    dispatch(setItemsAction(getActualItemsModel(formPermissionedItems.current)));
  }, [allData]);

  useEffect(() => {
    if (loadingState === 'ready') {
      updateMainMenu(fetchedMainMenu);
    }
  }, [loadingState, auth?.isLoggedIn]);

  const changeMainMenu = (value: IConfigurableMainMenu): void => {
    // Update original hidden values when menu configuration changes
    if (value.items) {
      updateOriginalHiddenValues(Array.isArray(value.items) ? value.items : [value.items]);
    }
    updateMainMenu(value);
  };

  const saveMainMenu = (value: IConfigurableMainMenu): Promise<IAjaxResponse> => {
    return settingsUpdateValue(
      {
        name: 'Shesha.MainMenuSettings',
        module: 'Shesha',
        appKey: applicationKey,
        value: value,
      },
      { base: backendUrl, headers: httpHeaders },
    )
      .then((response) => {
        return response;
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <MainMenuStateContext.Provider value={state}>
      <MainMenuActionsContext.Provider
        value={{
          changeMainMenu,
          saveMainMenu,
        }}
      >
        {children}
      </MainMenuActionsContext.Provider>
    </MainMenuStateContext.Provider>
  );
};

function useMainMenuState(): IMainMenuStateContext | undefined {
  const context = useContext(MainMenuStateContext);

  if (context === undefined) {
    throw new Error('useMainMenuState must be used within a MainMenuProvider');
  }
  return context;
}

function useMainMenuActions(): IMainMenuActionsContext | undefined {
  const context = useContext(MainMenuActionsContext);

  if (context === undefined) {
    throw new Error('useMainMenuActions must be used within a MainMenuProvider');
  }

  return context;
}

function useMainMenu(): IMainMenuActionsContext | undefined {
  return { ...useMainMenuState(), ...useMainMenuActions() };
}

export { MainMenuProvider, useMainMenu, useMainMenuActions, useMainMenuState, type IConfigurableMainMenu };
