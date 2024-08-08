import React, { FC, PropsWithChildren, useContext, useEffect, useReducer } from 'react';
import { setItemsAction, setLoadedMenuAction } from './actions';
import { IConfigurableMainMenu, MAIN_MENU_CONTEXT_INITIAL_STATE, MainMenuActionsContext, MainMenuStateContext } from './contexts';
import { uiReducer } from './reducer';
import { FormFullName, ISidebarMenuItem, isNavigationActionConfiguration, useSettingValue, useSheshaApplication } from '..';
import { IHasVersion, Migrator } from '@/utils/fluentMigrator/migrator';
import { mainMenuMigration } from './migrations/migration';
import { getActualModel, useAvailableConstantsData } from '../form/utils';
import { isSidebarGroup } from '@/interfaces/sidebar';
import { FormPermissionsDto, formConfigurationCheckPermissions } from '@/apis/formConfiguration';
import { FormIdFullNameDto } from '@/apis/entityConfig';
import { settingsUpdateValue } from '@/apis/settings';

export interface MainMenuProviderProps {
  mainMenuConfigKey?: string;
}

const MainMenuProvider: FC<PropsWithChildren<MainMenuProviderProps>> = ({children}) => {
  const [state, dispatch] = useReducer(uiReducer, {...MAIN_MENU_CONTEXT_INITIAL_STATE});

  const { loadingState, value: fetchedMainMenu } = useSettingValue({module: 'Shesha', name: 'Shesha.MainMenuSettings'});

  const { applicationKey, anyOfPermissionsGranted, backendUrl, httpHeaders } = useSheshaApplication();
  const allData = useAvailableConstantsData();

  const requestItemVisible = (item: ISidebarMenuItem, itemsToCheck: ISidebarMenuItem[]): ISidebarMenuItem => {
    if (item.hidden)
      return item;

    if (item.requiredPermissions?.length > 0)
      if (anyOfPermissionsGranted(item?.requiredPermissions))
        return item;
      else
        return {...item, hidden: true};

    if (isSidebarGroup(item) && item.childItems && item.childItems.length > 0)
      return {...item, hidden: false, childItems: item.childItems.map((childItem) => requestItemVisible(childItem, itemsToCheck))} as ISidebarMenuItem;

    if (
      isNavigationActionConfiguration(item.actionConfiguration)
      && item.actionConfiguration?.actionArguments?.navigationType === 'form'
      && (item.actionConfiguration?.actionArguments?.formId as FormFullName)?.name
      && (item.actionConfiguration?.actionArguments?.formId as FormFullName)?.module
    ) {
      // form navigation, check form permissions
      const newItem = {...item, hidden: true};
      itemsToCheck.push(newItem);
      return newItem;
    } 
    
    return item;
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
      const request = itemsToCheck.map(x => x.actionConfiguration?.actionArguments?.formId as FormIdFullNameDto);
      formConfigurationCheckPermissions(request, { base: backendUrl, headers: httpHeaders })
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

  const updateMainMenu = (value: IConfigurableMainMenu) => {
    const migratorInstance = new Migrator<IConfigurableMainMenu, IConfigurableMainMenu>();
    const fluent = mainMenuMigration(migratorInstance);
    const versionedValue = {...value} as IHasVersion;
    if (versionedValue.version === undefined) 
      versionedValue.version = -1;
    const model = fluent.migrator.upgrade(versionedValue, {});
    dispatch(setLoadedMenuAction(model as IConfigurableMainMenu));

    const itemsToCheck = [];
    const localItems = model.items.map((item) => requestItemVisible(getActualModel(item, allData), itemsToCheck));
    if (itemsToCheck.length > 0) {
      getFormPermissions(localItems, itemsToCheck);
    }

    console.log('main menu items refresh');
  };

  useEffect(() => {
    if (loadingState === 'ready') {
      updateMainMenu(fetchedMainMenu);
    }
  }, [loadingState]);

  useEffect(() => {
    console.log('main menu items refresh visible');
  }, [allData?.contexts?.lastUpdate]);

  const changeMainMenu = (value: IConfigurableMainMenu) => {
    updateMainMenu(value);
  };

  const saveMainMenu = (value: IConfigurableMainMenu) => {
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
        console.error(error);
      });
  };

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
