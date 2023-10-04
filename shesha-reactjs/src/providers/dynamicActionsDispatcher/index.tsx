import React, { FC, useContext, PropsWithChildren, useRef } from 'react';
import metadataReducer from './reducer';
import {
  DynamicActionsDispatcherActionsContext,
  DynamicActionsDispatcherStateContext,
  DYNAMIC_ACTIONS_DISPATCHER_CONTEXT_INITIAL_STATE,
  IDynamicActionsDispatcherStateContext,
  IDynamicActionsDispatcherActionsContext,
  IRegisterProviderPayload,
  IDynamicActionsDispatcherFullinstance,
} from './contexts';
import useThunkReducer from '../../hooks/thunkReducer';
import { IProvidersDictionary } from './models';

export interface IDynamicActionsDispatcherProviderProps { }

const DynamicActionsDispatcherProvider: FC<PropsWithChildren<IDynamicActionsDispatcherProviderProps>> = ({ children }) => {
  const initial: IDynamicActionsDispatcherStateContext = {
    ...DYNAMIC_ACTIONS_DISPATCHER_CONTEXT_INITIAL_STATE,
  };

  const providers = useRef<IProvidersDictionary>({});

  const [state/*, dispatch*/] = useThunkReducer(metadataReducer, initial);

  const registerProvider = (payload: IRegisterProviderPayload) => {
    const existingProvider = providers.current[payload.id];
    if (!existingProvider) {
      providers.current[payload.id] = {
        id: payload.id,
        contextValue: payload.contextValue,
      };
    } else {
      existingProvider.contextValue = payload.contextValue;
    }
  };

  const metadataActions: IDynamicActionsDispatcherActionsContext = {
    registerProvider,
  };

  return (
    <DynamicActionsDispatcherStateContext.Provider value={state}>
      <DynamicActionsDispatcherActionsContext.Provider value={metadataActions}>
        {children}
      </DynamicActionsDispatcherActionsContext.Provider>
    </DynamicActionsDispatcherStateContext.Provider>
  );
};

function useDynamicActionsDispatcherState(require: boolean) {
  const context = useContext(DynamicActionsDispatcherStateContext);

  if (context === undefined && require) {
    throw new Error('useDynamicActionsDispatcherState must be used within a DynamicActionsDispatcherProvider');
  }

  return context;
}

function useDynamicActionsDispatcherActions(require: boolean) {
  const context = useContext(DynamicActionsDispatcherActionsContext);

  if (context === undefined && require) {
    throw new Error('useDynamicActionsDispatcherActions must be used within a DynamicActionsDispatcherProvider');
  }

  return context;
}

function useDynamicActionsDispatcher(require: boolean = true): IDynamicActionsDispatcherFullinstance {
  const actionsContext = useDynamicActionsDispatcherActions(require);
  const stateContext = useDynamicActionsDispatcherState(require);

  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
}

export { DynamicActionsDispatcherProvider, useDynamicActionsDispatcherState, useDynamicActionsDispatcherActions, useDynamicActionsDispatcher };
