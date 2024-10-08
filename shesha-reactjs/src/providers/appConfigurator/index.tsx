import React, { FC, PropsWithChildren, useContext, useEffect, useMemo, useReducer } from 'react';
import { useLocalStorage } from '@/hooks';
import { PERM_APP_CONFIGURATOR } from '@/shesha-constants';
import {
  IConfigurationFrameworkHookArguments,
  IHasConfigurableItemId,
  createNewVersion,
  deleteItem,
  downloadAsJson,
  itemCancelVersion,
  publishItem,
  setItemReady,
} from '@/utils/configurationFramework/actions';
import { useAuth } from '@/providers/auth';
import { useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { SheshaActionOwners } from '../configurableActionsDispatcher/models';
import { useSheshaApplication } from '@/providers/sheshaApplication';
import {
  switchApplicationModeAction,
  toggleCloseEditModeConfirmationAction,
  toggleEditModeConfirmationAction,
} from './actions';
import { genericItemActionArgumentsForm } from './configurable-actions/generic-item-arguments';
import { APP_CONTEXT_INITIAL_STATE, AppConfiguratorActionsContext, AppConfiguratorStateContext } from './contexts';
import { ApplicationMode, ConfigurationItemsViewMode } from './models';
import appConfiguratorReducer from './reducer';
import { useStyles } from '@/components/appConfigurator/styles/styles';
import { SheshaHttpHeaders } from '@/shesha-constants/httpHeaders';

export interface IAppConfiguratorProviderProps { }

interface IAppConfiguratorModesState {
  mode: ConfigurationItemsViewMode;
  isInformerVisible: boolean;
}

const AppConfiguratorModeDefaults: IAppConfiguratorModesState = { mode: 'live', isInformerVisible: false };

interface IUseAppConfiguratorSettingsResponse extends IAppConfiguratorModesState {
  setMode: (mode: ConfigurationItemsViewMode) => void;
  setIsInformerVisible: (isInformerVisible: boolean) => void;
}

const useAppConfiguratorSettings = (): IUseAppConfiguratorSettingsResponse => {
  const [itemMode, setItemMode] = useLocalStorage<ConfigurationItemsViewMode>(
    'CONFIGURATION_ITEM_MODE',
    AppConfiguratorModeDefaults.mode
  );
  const [isFormInfoVisible, setIsFormInfoVisible] = useLocalStorage<boolean>(
    'FORM_INFO_VISIBLE',
    AppConfiguratorModeDefaults.isInformerVisible
  );
  const auth = useAuth(false);
  const { httpHeaders, setRequestHeaders } = useSheshaApplication();

  const setHeaderValue = (mode: ConfigurationItemsViewMode) => {
    const currentHeaderValue = httpHeaders[SheshaHttpHeaders.ConfigItemsMode];
    if (currentHeaderValue !== mode) setRequestHeaders({ [SheshaHttpHeaders.ConfigItemsMode]: mode });
  };

  const hasRights = useMemo(() => {
    const result = auth && auth.anyOfPermissionsGranted([PERM_APP_CONFIGURATOR]);

    return result;
  }, [auth, auth?.isLoggedIn, auth?.state?.status]);

  useEffect(() => {
    // sync headers
    setHeaderValue(hasRights ? itemMode : 'live');
  }, [itemMode, hasRights]);

  const result: IUseAppConfiguratorSettingsResponse = hasRights
    ? {
      mode: itemMode,
      isInformerVisible: isFormInfoVisible,
      setMode: (mode) => {
        setRequestHeaders({ [SheshaHttpHeaders.ConfigItemsMode]: mode });
        setItemMode(mode);
      },
      setIsInformerVisible: setIsFormInfoVisible,
    }
    : {
      ...AppConfiguratorModeDefaults,
      setMode: () => {
        /*nop*/
      },
      setIsInformerVisible: () => {
        /*nop*/
      },
    };
  return result;
};

const AppConfiguratorProvider: FC<PropsWithChildren<IAppConfiguratorProviderProps>> = ({ children }) => {
  const configuratorSettings = useAppConfiguratorSettings();
  const { styles } = useStyles();

  const [state, dispatch] = useReducer(appConfiguratorReducer, {
    ...APP_CONTEXT_INITIAL_STATE,
    formInfoBlockVisible: configuratorSettings.isInformerVisible,
    configurationItemMode: configuratorSettings.mode,
  });

  const { backendUrl, httpHeaders } = useSheshaApplication();

  //#region Configuration Framework renamed to Configuration Items

  const actionsOwner = 'Configuration Items';

  const cfArgs: IConfigurationFrameworkHookArguments = { backendUrl: backendUrl, httpHeaders: httpHeaders };

  const actionDependencies = [state];
  useConfigurableAction<IHasConfigurableItemId>(
    {
      name: 'Create new item version',
      owner: actionsOwner,
      ownerUid: SheshaActionOwners.ConfigurationFramework,
      hasArguments: true,
      executer: (actionArgs) => {
        return new Promise((resolve, reject) => {
          createNewVersion({ id: actionArgs.itemId, ...cfArgs })
            .then(() => {
              resolve(true);
            })
            .catch((error) => {
              reject(error);
            });
        });
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
      executer: (actionArgs) => {
        return new Promise((resolve, reject) => {
          setItemReady({ id: actionArgs.itemId, ...cfArgs })
            .then(() => {
              resolve(true);
            })
            .catch((error) => {
              reject(error);
            });
        });
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
      executer: (actionArgs) => {
        return new Promise((resolve, reject) => {
          deleteItem({ id: actionArgs.itemId, ...cfArgs })
            .then(() => {
              resolve(true);
            })
            .catch((error) => {
              reject(error);
            });
        });
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
      executer: (actionArgs) => {
        return new Promise((resolve, reject) => {
          publishItem({ id: actionArgs.itemId, ...cfArgs })
            .then(() => {
              resolve(true);
            })
            .catch((error) => {
              reject(error);
            });
        });
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
      executer: (actionArgs) => {
        return new Promise((resolve, reject) => {
          itemCancelVersion({ id: actionArgs.itemId, ...cfArgs })
            .then(() => {
              resolve(true);
            })
            .catch((error) => {
              reject(error);
            });
        });
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
      executer: (actionArgs) => {
        return new Promise((resolve, reject) => {
          downloadAsJson({ id: actionArgs.itemId, ...cfArgs })
            .then(() => {
              resolve(true);
            })
            .catch((error) => {
              reject(error);
            });
        });
      },
      argumentsFormMarkup: genericItemActionArgumentsForm,
    },
    actionDependencies
  );
  //#endregion

  useEffect(() => {
    if (!document) return;
    const classes = styles.shaAppEditMode.split(' ');
    if (state.mode === 'live') {
      document.body.classList.remove(...classes);
    }
    if (state.mode === 'edit') {
      document.body.classList.add(...classes);
    }
  }, [state.mode]);

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  const toggleShowInfoBlock = (visible: boolean) => {
    configuratorSettings.setIsInformerVisible(visible);
  };

  const switchApplicationMode = (mode: ApplicationMode) => {
    dispatch(switchApplicationModeAction(mode));
  };

  const switchConfigurationItemMode = (mode: ConfigurationItemsViewMode) => {
    configuratorSettings.setMode(mode);
  };

  const toggleEditModeConfirmation = (visible: boolean) => {
    dispatch(toggleEditModeConfirmationAction(visible));
  };

  const toggleCloseEditModeConfirmation = (visible: boolean) => {
    dispatch(toggleCloseEditModeConfirmationAction(visible));
  };

  return (
    <AppConfiguratorStateContext.Provider value={{
      ...state,
      configurationItemMode: configuratorSettings.mode,
      formInfoBlockVisible: configuratorSettings.isInformerVisible,
    }}>
      <AppConfiguratorActionsContext.Provider
        value={{
          switchApplicationMode,
          toggleEditModeConfirmation,
          toggleCloseEditModeConfirmation,
          switchConfigurationItemMode,
          toggleShowInfoBlock,
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
  useAppConfigurator,
  useAppConfiguratorActions,
  useAppConfiguratorState,
  type ApplicationMode,
};
