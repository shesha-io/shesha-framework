import { createContext } from 'react';
import { IPubSubPayload } from '../../interfaces/pubsub';
import { IAnyObject } from './../../interfaces/anyObject';

export type PubSubType = PubSubJS.Base<IPubSubPayload, PubSubJS.Message>;

export interface ISetStatePayload {
  data?: any;
  key?: string;
  spread?: boolean;
}

export interface ISetPubSubPayload {
  pubSub?: PubSubType;
  globalStateId?: string;
}

export interface IGlobalStateStateContext {
  globalState?: IAnyObject;
  pubSub?: PubSubType;
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
