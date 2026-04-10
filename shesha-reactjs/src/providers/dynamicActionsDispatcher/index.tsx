import React, { FC, useContext, PropsWithChildren, useRef, useCallback } from 'react';
import {
  DynamicActionsDispatcherContext,
  IDynamicActionsDispatcher,
  IRegisterProviderPayload,
} from './contexts';
import { DynamicItemsEvaluationHook, IProvidersDictionary } from './models';
import { IDynamicActionsContext } from '../dynamicActions/contexts';
import { throwError } from '@/utils/errors';

const DynamicActionsDispatcherProvider: FC<PropsWithChildren> = ({ children }) => {
  const providers = useRef<IProvidersDictionary>({});

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

  const getProvider = useCallback((providerUid: string): IDynamicActionsContext | undefined => {
    return providers.current[providerUid]?.contextValue;
  }, []);

  const dispatcherActions: IDynamicActionsDispatcher = {
    registerProvider,
    getProviders,
    getProvider,
  };

  return (
    <DynamicActionsDispatcherContext.Provider value={dispatcherActions}>
      {children}
    </DynamicActionsDispatcherContext.Provider>
  );
};

const useDynamicActionsDispatcher = (): IDynamicActionsDispatcher => useContext(DynamicActionsDispatcherContext) ?? throwError('useDynamicActionsDispatcher must be used within a DynamicActionsDispatcherProvider');

export {
  DynamicActionsDispatcherProvider,
  useDynamicActionsDispatcher,
  type DynamicItemsEvaluationHook,
};
