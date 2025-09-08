import { IAnyObject } from './../../interfaces/anyObject';
import { createNamedContext } from '@/utils/react';

export interface ISetStatePayload {
  data?: any;
  key?: string;
}

export interface IGlobalState {
  readonly globalState?: IAnyObject;
  setState: (payload: ISetStatePayload) => void;
  clearState: (stateKey: string) => void;
  getStateByKey?: (key: string) => IAnyObject;
}

export interface IGlobalStateContext {
  globalState: IGlobalState;
  state: any;
}

export const GlobalStateContext = createNamedContext<IGlobalStateContext>(undefined, "GlobalStateContext");

export type GlobalStateRerenderTrigger = () => void;
