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

export const GlobalStateContext = createNamedContext<IGlobalState>(undefined, "GlobalStateContext");

export type GlobalStateRerenderTrigger = () => void;