import { IAnyObject } from '@/interfaces';
import { IDelayedUpdateGroup } from './models';
import { createNamedContext } from '@/utils/react';

export interface IDelayedUpdateStateContext {
  groups: IDelayedUpdateGroup[];
}

export type AddDelayedUpdateFunction = (groupName: string, id: string, data: IAnyObject) => void;
export type RemoveDelayedUpdateFunction = (groupName: string, id: string) => void;

export interface DelayedUpdateClient {
  addItem: AddDelayedUpdateFunction;
  removeItem: RemoveDelayedUpdateFunction;
}

export interface IDelayedUpdateActionContext extends DelayedUpdateClient {
  getPayload: () => IDelayedUpdateGroup[] | undefined;
}

/** initial state */
export const DELAYED_UPDATE_PROVIDER_CONTEXT_INITIAL_STATE: IDelayedUpdateStateContext = {
  groups: [],
};

export const DelayedUpdateProviderActionsContext = createNamedContext<IDelayedUpdateActionContext | undefined>(undefined, "DelayedUpdateProviderActionsContext");
