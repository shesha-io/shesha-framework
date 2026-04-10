import React, { FC, PropsWithChildren, useCallback, useContext, useEffect, useReducer } from 'react';
import { setItemsAction, setLoadedMenuAction } from './actions';
import { IConfigurableMainMenu, IMainMenuActionsContext, IMainMenuStateContext, MAIN_MENU_CONTEXT_INITIAL_STATE, MainMenuActionsContext, MainMenuStateContext } from './contexts';
import { reducer } from './reducer';
import { useSettingValue, useSheshaApplication, useAuthOrUndefined, tryExtractNavigationValidForm, FormFullName, useHttpClient, useSettings } from '..';
import { IHasVersion, Migrator } from '@/utils/fluentMigrator/migrator';
import { mainMenuMigration } from './migrations/migration';
import { getActualModel, useAvailableConstantsData } from '../form/utils';
import { ISidebarMenuItem, isSidebarGroup } from '@/interfaces/sidebar';
import { FormPermissionsDto } from '@/apis/formConfiguration';
import { useDeepCompareEffect } from '@/hooks/useDeepCompareEffect';
import { extractAjaxResponse, IAjaxResponse } from '@/interfaces/ajaxResponse';
import { isDefined } from '@/utils/nullables';
import { throwError } from '@/utils/errors';
import cloneDeep from 'lodash/cloneDeep';

export interface MainMenuProviderProps {
  mainMenuConfigKey?: string;
}

const getFormsFromMenuItems = (items: ISidebarMenuItem[]): FormFullName[] => {
  const forms: FormFullName[] = [];
  items.forEach((x) => {
    const formId = tryExtractNavigationValidForm(x.actionConfiguration);
    if (formId)
      forms.push(formId);
  });

  return forms;
};

const getItemsWithFormNavigation = (items: ISidebarMenuItem[]): ISidebarMenuItem[] => {
  const itemsToCheck: ISidebarMenuItem[] = [];
  items.forEach((item) => {
    if (isSidebarGroup(item) && item.childItems && item.childItems.length > 0) {
      itemsToCheck.concat(getItemsWithFormNavigation(item.childItems));
      return;
    }

    const formId = tryExtractNavigationValidForm(item.actionConfiguration);
    if (formId)
      itemsToCheck.push(item);
  });

  return itemsToCheck;
};

const EMPTY_ITEMS: ISidebarMenuItem[] = [];

const getItemsMap = (items: ISidebarMenuItem[]): Map<string, ISidebarMenuItem> => {
  const result = new Map<string, ISidebarMenuItem>();
  items.forEach((item) => result.set(item.id, item));
  return result;
};

const MainMenuProvider: FC<PropsWithChildren<MainMenuProviderProps>> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, { ...MAIN_MENU_CONTEXT_INITIAL_STATE });

  const { loadingState, value: fetchedMainMenu } = useSettingValue<IConfigurableMainMenu>({ module: 'Shesha', name: 'Shesha.MainMenuSettings' });
  const auth = useAuthOrUndefined();
  const settings = useSettings();

  const { applicationKey, anyOfPermissionsGranted } = useSheshaApplication();
  const httpClient = useHttpClient();
  const allData = useAvailableConstantsData();

  const getActualItemsModel = useCallback((items: ISidebarMenuItem[]): ISidebarMenuItem[] => {
    const actualItems = items.map((item) => {
      var actualItem = getActualModel(item, allData);
      if (isSidebarGroup(actualItem) && actualItem.childItems && actualItem.childItems.length > 0) {
        actualItem.childItems = getActualItemsModel(actualItem.childItems);
      }
      if (actualItem.requiredPermissions && actualItem.requiredPermissions.length > 0)
        if (anyOfPermissionsGranted(actualItem.requiredPermissions))
          return actualItem;
        else
          return { ...actualItem, hidden: true };
      return actualItem;
    });

    return actualItems;
  }, [allData, anyOfPermissionsGranted]);

  const getNewHiddenOrUndefined = useCallback((item: ISidebarMenuItem, formsPermission: FormPermissionsDto[]): boolean | undefined => {
    const formId = tryExtractNavigationValidForm(item.actionConfiguration);
    if (formId) {
      // form navigation, check form permissions
      const form = formsPermission.find((x) =>
        x.module === formId.module &&
        x.name === formId.name,
      );
      const newHidden = isDefined(form) && isDefined(form.permissions) && !anyOfPermissionsGranted(form.permissions);
      return newHidden !== item.hidden ? newHidden : undefined;
    }
    return undefined;
  }, [anyOfPermissionsGranted]);

  const setItemsWithPermissions = useCallback((items: ISidebarMenuItem[], itemsToCheck: ISidebarMenuItem[]): void => {
    if (itemsToCheck.length > 0) {
      const forms = getFormsFromMenuItems(itemsToCheck);
      httpClient.post<IAjaxResponse<FormPermissionsDto[]>>("/api/services/Shesha/FormConfiguration/CheckPermissions", forms)
        .then((response) => {
          const data = extractAjaxResponse(response.data);
          const itemsMap = getItemsMap(items);
          itemsToCheck.forEach((item) => {
            const newHidden = getNewHiddenOrUndefined(item, data);
            if (newHidden !== undefined) {
              const originalItem = itemsMap.get(item.id);
              if (originalItem)
                originalItem.hidden = newHidden;
            }
          });

          dispatch(setItemsAction({ items: getActualItemsModel(items), originalItems: items }));
        });
    }
  }, [httpClient, getActualItemsModel, getNewHiddenOrUndefined]);

  const updateMainMenu = useCallback((value: IConfigurableMainMenu): void => {
    const migratorInstance = new Migrator<IConfigurableMainMenu, IConfigurableMainMenu>();
    const fluent = mainMenuMigration(migratorInstance);
    const versionedValue = { ...value } as IHasVersion;
    if (versionedValue.version === undefined)
      versionedValue.version = -1;
    const model = fluent.migrator.upgrade(versionedValue, {});
    dispatch(setLoadedMenuAction(model as IConfigurableMainMenu));

    const itemsToCheck = getItemsWithFormNavigation(model.items);
    if (itemsToCheck.length > 0) {
      setItemsWithPermissions(cloneDeep(model.items), itemsToCheck);
    } else {
      const newItems = Array.isArray(model.items) ? [...model.items] : [model.items];
      dispatch(setItemsAction({ items: getActualItemsModel(newItems), originalItems: newItems }));
    }
  }, [getActualItemsModel, setItemsWithPermissions]);

  useDeepCompareEffect(() => {
    dispatch(setItemsAction({ items: getActualItemsModel(state.items ?? EMPTY_ITEMS), originalItems: state.items ?? EMPTY_ITEMS }));
  }, [allData]);

  useEffect(() => {
    if (loadingState === 'ready') {
      updateMainMenu(fetchedMainMenu ?? { items: [] });
    }
  }, [loadingState, auth?.isLoggedIn, updateMainMenu, fetchedMainMenu]);

  const changeMainMenu = (value: IConfigurableMainMenu): void => {
    updateMainMenu(value);
  };

  const saveMainMenu = async (value: IConfigurableMainMenu): Promise<void> => {
    await settings.setSetting({ name: 'Shesha.MainMenuSettings', module: 'Shesha' }, value, applicationKey);
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

const useMainMenuState = (): IMainMenuStateContext => useContext(MainMenuStateContext) ?? throwError("useMainMenuState must be used within a MainMenuProvider");

const useMainMenuActions = (): IMainMenuActionsContext => useContext(MainMenuActionsContext) ?? throwError("useMainMenuActions must be used within a MainMenuProvider");

const useMainMenu = (): IMainMenuStateContext & IMainMenuActionsContext => {
  return { ...useMainMenuState(), ...useMainMenuActions() };
};

export { MainMenuProvider, useMainMenu, useMainMenuActions, useMainMenuState, type IConfigurableMainMenu };
