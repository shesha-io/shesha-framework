import { IProvidersDictionary } from './models';
import { IDynamicActionsContext } from '../dynamicActions/contexts';
import { createNamedContext } from '@/utils/react';

export interface IDynamicActionsDispatcherStateContext {
  activeProvider?: string;
}

export interface IRegisterProviderPayload {
  id: string;
  contextValue: IDynamicActionsContext;
}

export interface IDynamicActionsDispatcherActionsContext {
  registerProvider: (payload: IRegisterProviderPayload) => void;
  getProviders: () => IProvidersDictionary;
  getProvider: (providerUid: string) => IDynamicActionsContext | undefined;
}

export interface IDynamicActionsDispatcherFullInstance extends IDynamicActionsDispatcherStateContext, IDynamicActionsDispatcherActionsContext {}

export interface IDynamicActionsRegistration {
  id: string;
  contextValue: IDynamicActionsContext;
}

/** initial state */
export const DYNAMIC_ACTIONS_DISPATCHER_CONTEXT_INITIAL_STATE: IDynamicActionsDispatcherStateContext = {
};

export const DynamicActionsDispatcherStateContext = createNamedContext<IDynamicActionsDispatcherStateContext>({ ...DYNAMIC_ACTIONS_DISPATCHER_CONTEXT_INITIAL_STATE }, "DynamicActionsDispatcherStateContext");

export const DynamicActionsDispatcherActionsContext = createNamedContext<IDynamicActionsDispatcherActionsContext>(undefined, "DynamicActionsDispatcherActionsContext");
