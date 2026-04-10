import { IAnyObject } from './../../interfaces/anyObject';
import { createNamedContext } from '@/utils/react';

export interface ISetStatePayload {
  data?: unknown | undefined;
  key: string;
}

export interface IGlobalState {
  readonly globalState: IAnyObject;
  setState: (payload: ISetStatePayload) => void;
  clearState: (stateKey: string) => void;
  getStateByKey: (key: string) => unknown;
}

export interface IGlobalStateContext {
  globalState: IGlobalState;
  state: object;
}

export const GlobalStateContext = createNamedContext<IGlobalStateContext | undefined>(undefined, "GlobalStateContext");

export type GlobalStateRerenderTrigger = () => void;
