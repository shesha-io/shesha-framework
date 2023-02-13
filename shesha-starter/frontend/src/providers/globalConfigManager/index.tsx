import React, { FC, useReducer, useContext, PropsWithChildren } from 'react';
import { globalConfigManagerReducer } from './reducer';
import {
  GlobalConfigManagerActionsContext,
  GlobalConfigManagerStateContext,
  GLOBAL_CONFIG_MANAGER_CONTEXT_INITIAL_STATE,
} from './contexts';
import { getFlagSetters } from '../utils/flagsSetters';

const GlobalConfigManagerProvider: FC<PropsWithChildren<any>> = ({ children }) => {
  const [state, dispatch] = useReducer(globalConfigManagerReducer, GLOBAL_CONFIG_MANAGER_CONTEXT_INITIAL_STATE);

  //#region REMOVE THIS ACTION

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  return (
    <GlobalConfigManagerStateContext.Provider value={state}>
      <GlobalConfigManagerActionsContext.Provider value={{ ...getFlagSetters(dispatch) /* NEW_ACTION_GOES_HERE */ }}>
        {children}
      </GlobalConfigManagerActionsContext.Provider>
    </GlobalConfigManagerStateContext.Provider>
  );
};

function useGlobalConfigManagerState() {
  const context = useContext(GlobalConfigManagerStateContext);

  if (context === undefined) {
    throw new Error('useGlobalConfigManagerState must be used within a GlobalConfigManagerProvider');
  }

  return context;
}

function useGlobalConfigManagerActions() {
  const context = useContext(GlobalConfigManagerActionsContext);

  if (context === undefined) {
    throw new Error('useGlobalConfigManagerActions must be used within a GlobalConfigManagerProvider');
  }

  return context;
}

function useGlobalConfigManager() {
  return { ...useGlobalConfigManagerState(), ...useGlobalConfigManagerActions() };
}

export {
  GlobalConfigManagerProvider,
  useGlobalConfigManagerState,
  useGlobalConfigManagerActions,
  useGlobalConfigManager,
};
