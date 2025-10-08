import React, { FC, useContext, PropsWithChildren, useRef, useCallback } from 'react';
import metadataReducer from './reducer';
import {
  DynamicActionsDispatcherActionsContext,
  DynamicActionsDispatcherStateContext,
  DYNAMIC_ACTIONS_DISPATCHER_CONTEXT_INITIAL_STATE,
  IDynamicActionsDispatcherStateContext,
  IDynamicActionsDispatcherActionsContext,
  IRegisterProviderPayload,
  IDynamicActionsDispatcherFullInstance,
} from './contexts';
import useThunkReducer from '@/hooks/thunkReducer';
import { DynamicItemsEvaluationHook, IProvidersDictionary } from './models';
import { IDynamicActionsContext } from '../dynamicActions/contexts';

const DynamicActionsDispatcherProvider: FC<PropsWithChildren> = ({ children }) => {
  const initial: IDynamicActionsDispatcherStateContext = {
    ...DYNAMIC_ACTIONS_DISPATCHER_CONTEXT_INITIAL_STATE,
  };

  const providers = useRef<IProvidersDictionary>({});

  const [state/* , dispatch*/] = useThunkReducer(metadataReducer, initial);

  const registerProvider = (payload: IRegisterProviderPayload): void => {
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

  const getProviders = useCallback(() => {
    return providers.current;
  }, []);

  const getProvider = useCallback((providerUid: string): IDynamicActionsContext => {
    return providers.current[providerUid]?.contextValue;
  }, []);

  const dispatcherActions: IDynamicActionsDispatcherActionsContext = {
    registerProvider,
    getProviders,
    getProvider,
  };

  return (
    <DynamicActionsDispatcherStateContext.Provider value={state}>
      <DynamicActionsDispatcherActionsContext.Provider value={dispatcherActions}>
        {children}
      </DynamicActionsDispatcherActionsContext.Provider>
    </DynamicActionsDispatcherStateContext.Provider>
  );
};

function useDynamicActionsDispatcherState(require: boolean): IDynamicActionsDispatcherStateContext | undefined {
  const context = useContext(DynamicActionsDispatcherStateContext);

  if (context === undefined && require) {
    throw new Error('useDynamicActionsDispatcherState must be used within a DynamicActionsDispatcherProvider');
  }

  return context;
}

function useDynamicActionsDispatcherActions(require: boolean): IDynamicActionsDispatcherActionsContext | undefined {
  const context = useContext(DynamicActionsDispatcherActionsContext);

  if (context === undefined && require) {
    throw new Error('useDynamicActionsDispatcherActions must be used within a DynamicActionsDispatcherProvider');
  }

  return context;
}

function useDynamicActionsDispatcher(require: boolean = true): IDynamicActionsDispatcherFullInstance | undefined {
  const actionsContext = useDynamicActionsDispatcherActions(require);
  const stateContext = useDynamicActionsDispatcherState(require);

  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
}

export {
  DynamicActionsDispatcherProvider,
  useDynamicActionsDispatcherState,
  useDynamicActionsDispatcherActions,
  useDynamicActionsDispatcher,
  type DynamicItemsEvaluationHook,
};
