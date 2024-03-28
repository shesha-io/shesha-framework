import { createContext } from 'react';
import { IDelayedUpdateGroup } from './models';

export interface IDelayedUpdateStateContext {
  groups: IDelayedUpdateGroup[];
}

export interface IDelayedUpdateActionContext {
  addItem: (groupName: string, id: any, data?: any) => void;
  removeItem: (groupName: string, id: any) => void;
  getPayload: () => IDelayedUpdateGroup[];
}

/** initial state */
export const DELAYED_UPDATE_PROVIDER_CONTEXT_INITIAL_STATE: IDelayedUpdateStateContext = {
  groups: [],
};

export const DelayedUpdateProviderStateContext = createContext<IDelayedUpdateStateContext>(
  DELAYED_UPDATE_PROVIDER_CONTEXT_INITIAL_STATE
);

export const DelayedUpdateProviderActionsContext = createContext<IDelayedUpdateActionContext>(undefined);
