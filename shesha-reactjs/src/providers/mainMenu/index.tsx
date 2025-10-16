import React, { FC, PropsWithChildren, useContext, useEffect, useReducer, useRef } from 'react';
import { setItemsAction, setLoadedMenuAction } from './actions';
import { IConfigurableMainMenu, IMainMenuActionsContext, IMainMenuStateContext, MAIN_MENU_CONTEXT_INITIAL_STATE, MainMenuActionsContext, MainMenuStateContext } from './contexts';
import { uiReducer } from './reducer';
import { FormFullName, isNavigationActionConfiguration, useSettingValue, useSheshaApplication, useAuthOrUndefined } from '..';
import { IHasVersion, Migrator } from '@/utils/fluentMigrator/migrator';
import { mainMenuMigration } from './migrations/migration';
import { getActualModel, useAvailableConstantsData } from '../form/utils';
import { ISidebarMenuItem, isSidebarGroup } from '@/interfaces/sidebar';
import { FormPermissionsDto, formConfigurationCheckPermissions } from '@/apis/formConfiguration';
import { FormIdFullNameDto } from '@/apis/entityConfig';
import { settingsUpdateValue } from '@/apis/settings';
import { useDeepCompareEffect } from '@/hooks/useDeepCompareEffect';
import { isAjaxSuccessResponse } from '@/interfaces/ajaxResponse';

export interface MainMenuProviderProps {
  mainMenuConfigKey?: string;
}

const MainMenuProvider: FC<PropsWithChildren<MainMenuProviderProps>> = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, { ...MAIN_MENU_CONTEXT_INITIAL_STATE });

  const { loadingState, value: fetchedMainMenu } = useSettingValue({ module: 'Shesha', name: 'Shesha.MainMenuSettings' });
  const auth = useAuthOrUndefined();

  const { applicationKey, anyOfPermissionsGranted, backendUrl, httpHeaders } = useSheshaApplication();
  const allData = useAvailableConstantsData();

  const formPermissionedItems = useRef<ISidebarMenuItem[]>([]);

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

  const updatetFormNamigationVisible = (item: ISidebarMenuItem, formsPermission: FormPermissionsDto[]): void => {
    if (
      item.actionConfiguration?.actionOwner === 'shesha.common' &&
      item.actionConfiguration?.actionName === 'Navigate' &&
      item.actionConfiguration?.actionArguments?.navigationType === 'form' &&
      item.actionConfiguration?.actionArguments?.formId?.name &&
      item.actionConfiguration?.actionArguments?.formId?.module
    ) {
      // form navigation, check form permissions
      const form = formsPermission.find((x) =>
        x.module === item.actionConfiguration?.actionArguments?.formId?.module &&
        x.name === item.actionConfiguration?.actionArguments?.formId?.name,
      );
      item.hidden = form && form.permissions && !anyOfPermissionsGranted(form.permissions);
    }
  };

  const getItemsWithFormNavigation = (items: ISidebarMenuItem[]): ISidebarMenuItem[] => {
    const itemsToCheck: ISidebarMenuItem[] = [];
    items?.forEach((item) => {
      if (isSidebarGroup(item) && item.childItems && item.childItems.length > 0) {
        itemsToCheck.concat(getItemsWithFormNavigation(item.childItems));
        return;
      }

      if (
        isNavigationActionConfiguration(item.actionConfiguration) &&
        item.actionConfiguration?.actionArguments?.navigationType === 'form' &&
        (item.actionConfiguration?.actionArguments?.formId as FormFullName)?.name &&
        (item.actionConfiguration?.actionArguments?.formId as FormFullName)?.module
      ) {
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
          if (isAjaxSuccessResponse(result)) {
            itemsToCheck.forEach((item) => {
              return updatetFormNamigationVisible(item, result.result);
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
    updateMainMenu(value);
  };

  const saveMainMenu = (value: IConfigurableMainMenu): Promise<void> => {
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

function useMainMenuState(): IMainMenuStateContext {
  const context = useContext(MainMenuStateContext);

  if (context === undefined) {
    throw new Error('useMainMenuState must be used within a MainMenuProvider');
  }
  return context;
}

function useMainMenuActions(): IMainMenuActionsContext {
  const context = useContext(MainMenuActionsContext);

  if (context === undefined) {
    throw new Error('useMainMenuActions must be used within a MainMenuProvider');
  }

  return context;
}

function useMainMenu(): IMainMenuStateContext & IMainMenuActionsContext {
  return { ...useMainMenuState(), ...useMainMenuActions() };
}

export { MainMenuProvider, useMainMenu, useMainMenuActions, useMainMenuState, type IConfigurableMainMenu };
