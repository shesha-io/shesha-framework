import React, { FC, PropsWithChildren, useContext, useEffect, useMemo, useReducer } from 'react';
import { useLocalStorage } from '@/hooks';
import { PERM_APP_CONFIGURATOR } from '@/shesha-constants';
import {
  IHasConfigurableItemId,
  downloadAsJson,
} from '@/utils/configurationFramework/actions';
import { useAuthOrUndefined } from '@/providers/auth';
import { useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { SheshaActionOwners } from '../configurableActionsDispatcher/models';
import {
  softToggleInfoBlockAction,
  switchApplicationModeAction,
  toggleCloseEditModeConfirmationAction,
  toggleEditModeConfirmationAction,
} from './actions';
import { genericItemActionArgumentsForm } from './configurable-actions/generic-item-arguments';
import { APP_CONTEXT_INITIAL_STATE, AppConfiguratorActionsContext, AppConfiguratorStateContext, IAppActionsContext, IAppStateContext } from './contexts';
import { ApplicationMode } from './models';
import appConfiguratorReducer from './reducer';
import { useStyles } from '@/components/appConfigurator/styles/styles';
import { useHttpClient } from '../sheshaApplication/publicApi';
import { isDefined } from '@/utils/nullables';


interface IAppConfiguratorModesState {
  isInformerVisible: boolean;
}

const AppConfiguratorModeDefaults: IAppConfiguratorModesState = { isInformerVisible: false };

interface IUseAppConfiguratorSettingsResponse extends IAppConfiguratorModesState {
  setIsInformerVisible: (isInformerVisible: boolean) => void;
}

const useAppConfiguratorSettings = (): IUseAppConfiguratorSettingsResponse => {
  const [isFormInfoVisible, setIsFormInfoVisible] = useLocalStorage<boolean>(
    'FORM_INFO_VISIBLE',
    AppConfiguratorModeDefaults.isInformerVisible,
  );
  const auth = useAuthOrUndefined();

  const hasRights = useMemo(() => {
    const result = auth && auth.anyOfPermissionsGranted([PERM_APP_CONFIGURATOR]);

    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, auth?.isLoggedIn, auth?.state.status]);

  const result: IUseAppConfiguratorSettingsResponse = hasRights
    ? {
      isInformerVisible: isFormInfoVisible,
      setIsInformerVisible: setIsFormInfoVisible,
    }
    : {
      ...AppConfiguratorModeDefaults,
      setIsInformerVisible: () => {
        /* nop*/
      },
    };
  return result;
};

const AppConfiguratorProvider: FC<PropsWithChildren> = ({ children }) => {
  const configuratorSettings = useAppConfiguratorSettings();
  const { styles } = useStyles();

  const [state, dispatch] = useReducer(appConfiguratorReducer, {
    ...APP_CONTEXT_INITIAL_STATE,
    formInfoBlockVisible: configuratorSettings.isInformerVisible,
  });

  const httpClient = useHttpClient();

  //#region Configuration Framework renamed to Configuration Items

  const actionsOwner = 'Configuration Items';

  const actionDependencies = [state];

  useConfigurableAction<IHasConfigurableItemId>(
    {
      name: 'Download as JSON',
      owner: actionsOwner,
      ownerUid: SheshaActionOwners.ConfigurationFramework,
      hasArguments: true,
      executer: (actionArgs) => {
        return downloadAsJson({ id: actionArgs.itemId, httpClient });
      },
      argumentsFormMarkup: genericItemActionArgumentsForm,
    },
    actionDependencies,
  );
  //#endregion

  useEffect(() => {
    if (!isDefined(document)) return;
    const classes = styles.shaAppEditMode.split(' ');
    if (state.mode === 'live') {
      document.body.classList.remove(...classes);
    }
    if (state.mode === 'edit') {
      document.body.classList.add(...classes);
    }
  }, [state.mode, styles.shaAppEditMode]);

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  const toggleShowInfoBlock = (visible: boolean): void => {
    configuratorSettings.setIsInformerVisible(visible);
  };

  const switchApplicationMode = (mode: ApplicationMode): void => {
    dispatch(switchApplicationModeAction(mode));
  };

  const toggleEditModeConfirmation = (visible: boolean): void => {
    dispatch(toggleEditModeConfirmationAction(visible));
  };

  const toggleCloseEditModeConfirmation = (visible: boolean): void => {
    dispatch(toggleCloseEditModeConfirmationAction(visible));
  };

  const softToggleInfoBlock = (softInfoBlock: boolean): void => {
    dispatch(softToggleInfoBlockAction(softInfoBlock));
  };

  return (
    <AppConfiguratorStateContext.Provider value={{
      ...state,
      formInfoBlockVisible: configuratorSettings.isInformerVisible,
    }}
    >
      <AppConfiguratorActionsContext.Provider
        value={{
          switchApplicationMode,
          toggleEditModeConfirmation,
          toggleCloseEditModeConfirmation,
          toggleShowInfoBlock,
          softToggleInfoBlock,
        }}
      >
        {children}
      </AppConfiguratorActionsContext.Provider>
    </AppConfiguratorStateContext.Provider>
  );
};

const useAppConfiguratorState = (): IAppStateContext => {
  const context = useContext(AppConfiguratorStateContext);

  if (context === undefined) {
    throw new Error('useAppConfiguratorState must be used within a AppConfiguratorProvider');
  }

  return context;
};

const useAppConfiguratorActions = (): IAppActionsContext => {
  const context = useContext(AppConfiguratorActionsContext);

  if (context === undefined) {
    throw new Error('useAppConfiguratorActions must be used within a AppConfiguratorProvider');
  }

  return context;
};

const useAppConfigurator = (): IAppStateContext & IAppActionsContext => {
  return { ...useAppConfiguratorState(), ...useAppConfiguratorActions() };
};

export {
  AppConfiguratorProvider,
  useAppConfigurator,
  useAppConfiguratorActions,
  useAppConfiguratorState,
  type ApplicationMode,
};
