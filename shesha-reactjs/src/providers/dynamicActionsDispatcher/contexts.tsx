import { createContext } from 'react';
import { IDynamicActionsContext } from '../dynamicActions/contexts';

export interface IDynamicActionsDispatcherStateContext {
  activeProvider?: string;
}

export interface IRegisterProviderPayload {
  id: string;
  contextValue: IDynamicActionsContext;
}

export interface IDynamicActionsDispatcherActionsContext {
  registerProvider: (payload: IRegisterProviderPayload) => void;
}

export interface IDynamicActionsDispatcherFullinstance extends IDynamicActionsDispatcherStateContext, IDynamicActionsDispatcherActionsContext {}

export interface IDynamicActionsRegistration {
  id: string;
  contextValue: IDynamicActionsContext;
}

/** initial state */
export const DYNAMIC_ACTIONS_DISPATCHER_CONTEXT_INITIAL_STATE: IDynamicActionsDispatcherStateContext = {
};

export const DynamicActionsDispatcherStateContext = createContext<IDynamicActionsDispatcherStateContext>({...DYNAMIC_ACTIONS_DISPATCHER_CONTEXT_INITIAL_STATE});

export const DynamicActionsDispatcherActionsContext = createContext<IDynamicActionsDispatcherActionsContext>(undefined);