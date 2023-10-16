import { DynamicItemsEvaluationHook } from 'providers/dynamicActionsDispatcher/models';
import { createContext } from 'react';

export interface IDynamicActionsStateContext {
  id: string;
  name: string;
  useEvaluator: DynamicItemsEvaluationHook;
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
  name: 'unknown',
  useEvaluator: null,
};

export const DynamicActionsContext = createContext<IDynamicActionsContext>(undefined);