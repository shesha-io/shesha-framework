import { createContext } from 'react';
import { IAnyObject } from './../../interfaces/anyObject';

export interface ISetStatePayload {
  data?: any;
  key?: string;
}

export interface IGlobalStateStateContext {
  globalState?: IAnyObject;
  globalStateId?: string;
}

export interface IGlobalStateActionsContext {
  setState?: (payload: ISetStatePayload) => void;
  clearState?: (stateKey: string) => void;
  getStateByKey?: (key: string) => IAnyObject;
}

export const GLOBAL_STATE_CONTEXT_INITIAL_STATE: IGlobalStateStateContext = { globalState: {} };

export const GlobalStateStateContext = createContext<IGlobalStateStateContext>(GLOBAL_STATE_CONTEXT_INITIAL_STATE);

export const GlobalStateActionsContext = createContext<IGlobalStateActionsContext>(undefined);
