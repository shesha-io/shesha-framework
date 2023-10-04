import { createContext } from 'react';

export interface IDynamicActionsStateContext {
  id: string;
}

export interface IDynamicActionsActionsContext {
  
}

export interface IDynamicActionsContext extends IDynamicActionsStateContext, IDynamicActionsActionsContext {
  
}

export interface ITestActionPayload {
  
}

/** initial state */
export const DYNAMIC_ACTIONS_CONTEXT_INITIAL_STATE: IDynamicActionsContext = {
  id: null,
};

export const DynamicActionsContext = createContext<IDynamicActionsContext>(undefined);