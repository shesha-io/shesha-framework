import { IAnyObject } from '@/interfaces';
import { IDelayedUpdateGroup } from './models';
import { createNamedContext } from '@/utils/react';

export interface IDelayedUpdateStateContext {
  groups: IDelayedUpdateGroup[];
}

type AddDelayedUpdateFunction = (groupName: string, id: string, data: IAnyObject) => void;
type RemoveDelayedUpdateFunction = (groupName: string, id: string) => void;

export interface DelayedUpdateClient {
  addItem: AddDelayedUpdateFunction;
  removeItem: RemoveDelayedUpdateFunction;
}

export interface IDelayedUpdateActionContext extends DelayedUpdateClient {
  getPayload: () => IDelayedUpdateGroup[] | undefined;
}

export const DelayedUpdateProviderActionsContext = createNamedContext<IDelayedUpdateActionContext | undefined>(undefined, "DelayedUpdateProviderActionsContext");
