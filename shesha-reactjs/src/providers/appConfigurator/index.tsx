import React, { FC, useReducer, useContext, PropsWithChildren, useEffect } from 'react';
import appConfiguratorReducer from './reducer';
import { AppConfiguratorActionsContext, AppConfiguratorStateContext, APP_CONTEXT_INITIAL_STATE } from './contexts';
import {
  ApplicationMode,
  ConfigurationItemsViewMode,
} from './models';
import {
  switchApplicationModeAction,
  toggleShowInfoBlockAction,
  toggleEditModeConfirmationAction,
  toggleCloseEditModeConfirmationAction,
  switchConfigurationItemModeAction,
} from './actions';
import { useSheshaApplication } from '../sheshaApplication';
import { useConfigurableAction } from '../configurableActionsDispatcher';
import { SheshaActionOwners } from '../configurableActionsDispatcher/models';
import {
  createNewVersion,
  deleteItem,
  downloadAsJson,
  IConfigurationFrameworkHookArguments,
  IHasConfigurableItemId,
  itemCancelVersion,
  publishItem,
  setItemReady,
} from '../../utils/configurationFramework/actions';
import { genericItemActionArgumentsForm } from './configurable-actions/generic-item-arguments';
import { useLocalStorage } from '../../hooks';
import { PERM_APP_CONFIGURATOR } from '../../constants';

export interface IAppConfiguratorProviderProps {}

const AppConfiguratorProvider: FC<PropsWithChildren<IAppConfiguratorProviderProps>> = ({ children }) => {
  const [storageFormInfoVisible, setStorageFormInfoVisible] = useLocalStorage<boolean>('FORM_INFO_VISIBLE', false);
  const [state, dispatch] = useReducer(appConfiguratorReducer, {
    ...APP_CONTEXT_INITIAL_STATE,
    formInfoBlockVisible: storageFormInfoVisible,
  });

  const { backendUrl, httpHeaders, setRequestHeaders, anyOfPermissionsGranted } = useSheshaApplication();

  // read configurationItemsMode on start and check availability
  const [storageConfigItemMode, setStorageConfigItemMode] = useLocalStorage<ConfigurationItemsViewMode>(
    'CONFIGURATION_ITEM_MODE',
    'live'
  );
  useEffect(() => {
    const hasRights =
      typeof anyOfPermissionsGranted === 'function' ? anyOfPermissionsGranted([PERM_APP_CONFIGURATOR]) : false;

    const mode = hasRights ? storageConfigItemMode : APP_CONTEXT_INITIAL_STATE.configurationItemMode;

    if (mode !== state.configurationItemMode) switchConfigurationItemMode(mode);

    if (state.formInfoBlockVisible && !hasRights) toggleShowInfoBlock(false);
  }, []);

  //#region Configuration Framework

  const actionsOwner = 'Configuration Framework';

  const cfArgs: IConfigurationFrameworkHookArguments = { backendUrl: backendUrl, httpHeaders: httpHeaders };

  const actionDependencies = [state];
  useConfigurableAction<IHasConfigurableItemId>(
    {
      name: 'Create new item version',
      owner: actionsOwner,
      ownerUid: SheshaActionOwners.ConfigurationFramework,
      hasArguments: true,
      executer: actionArgs => {
        return createNewVersion({ id: actionArgs.itemId, ...cfArgs });
      },
      argumentsFormMarkup: genericItemActionArgumentsForm,
    },
    actionDependencies
  );

  useConfigurableAction<IHasConfigurableItemId>(
    {
      name: 'Set Item Ready',
      owner: actionsOwner,
      ownerUid: SheshaActionOwners.ConfigurationFramework,
      hasArguments: true,
      executer: actionArgs => {
        return setItemReady({ id: actionArgs.itemId, ...cfArgs });
      },
      argumentsFormMarkup: genericItemActionArgumentsForm,
    },
    actionDependencies
  );

  useConfigurableAction<IHasConfigurableItemId>(
    {
      name: 'Delete item',
      owner: actionsOwner,
      ownerUid: SheshaActionOwners.ConfigurationFramework,
      hasArguments: true,
      executer: actionArgs => {
        return deleteItem({ id: actionArgs.itemId, ...cfArgs });
      },
      argumentsFormMarkup: genericItemActionArgumentsForm,
    },
    actionDependencies
  );

  useConfigurableAction<IHasConfigurableItemId>(
    {
      name: 'Publish Item',
      owner: actionsOwner,
      ownerUid: SheshaActionOwners.ConfigurationFramework,
      hasArguments: true,
      executer: actionArgs => {
        return publishItem({ id: actionArgs.itemId, ...cfArgs });
      },
      argumentsFormMarkup: genericItemActionArgumentsForm,
    },
    actionDependencies
  );

  useConfigurableAction<IHasConfigurableItemId>(
    {
      name: 'Cancel item version',
      owner: actionsOwner,
      ownerUid: SheshaActionOwners.ConfigurationFramework,
      hasArguments: true,
      executer: actionArgs => {
        return itemCancelVersion({ id: actionArgs.itemId, ...cfArgs });
      },
      argumentsFormMarkup: genericItemActionArgumentsForm,
    },
    actionDependencies
  );

  useConfigurableAction<IHasConfigurableItemId>(
    {
      name: 'Download as JSON',
      owner: actionsOwner,
      ownerUid: SheshaActionOwners.ConfigurationFramework,
      hasArguments: true,
      executer: actionArgs => {
        return downloadAsJson({ id: actionArgs.itemId, ...cfArgs });
      },
      argumentsFormMarkup: genericItemActionArgumentsForm,
    },
    actionDependencies
  );

  //#endregion

  useEffect(() => {
    if (!document) return;

    if (state.mode === 'live') {
      document.body.classList.remove('sha-app-editmode');
    }
    if (state.mode === 'edit') {
      document.body.classList.add('sha-app-editmode');
    }
  }, [state.mode]);

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  const toggleShowInfoBlock = (visible: boolean) => {
    setStorageFormInfoVisible(visible);
    dispatch(toggleShowInfoBlockAction(visible));
  };

  const switchApplicationMode = (mode: ApplicationMode) => {
    dispatch(switchApplicationModeAction(mode));
  };

  const switchConfigurationItemMode = (mode: ConfigurationItemsViewMode) => {
    setRequestHeaders({ 'sha-config-item-mode': mode });
    setStorageConfigItemMode(mode);
    dispatch(switchConfigurationItemModeAction(mode));
  };

  const toggleEditModeConfirmation = (visible: boolean) => {
    dispatch(toggleEditModeConfirmationAction(visible));
  };

  const toggleCloseEditModeConfirmation = (visible: boolean) => {
    dispatch(toggleCloseEditModeConfirmationAction(visible));
  };

  return (
    <AppConfiguratorStateContext.Provider value={state}>
      <AppConfiguratorActionsContext.Provider
        value={{
          switchApplicationMode,
          toggleEditModeConfirmation,
          toggleCloseEditModeConfirmation,
          switchConfigurationItemMode,
          // fetchSettings,
          // getSettings,
          // invalidateSettings,
          toggleShowInfoBlock,
          /* NEW_ACTION_GOES_HERE */
        }}
      >
        {children}
      </AppConfiguratorActionsContext.Provider>
    </AppConfiguratorStateContext.Provider>
  );
};

function useAppConfiguratorState() {
  const context = useContext(AppConfiguratorStateContext);

  if (context === undefined) {
    throw new Error('useAppConfiguratorState must be used within a AppConfiguratorProvider');
  }

  return context;
}

function useAppConfiguratorActions() {
  const context = useContext(AppConfiguratorActionsContext);

  if (context === undefined) {
    throw new Error('useAppConfiguratorActions must be used within a AppConfiguratorProvider');
  }

  return context;
}

function useAppConfigurator() {
  return { ...useAppConfiguratorState(), ...useAppConfiguratorActions() };
}

export {
  AppConfiguratorProvider,
  useAppConfiguratorState,
  useAppConfiguratorActions,
  useAppConfigurator,
  ApplicationMode,
};
