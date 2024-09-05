import { IDeferredUpdateGroup } from './models';
import { createNamedContext } from '@/utils/react';

export interface IDeferredUpdateStateContext {
  groups: IDeferredUpdateGroup[];
}

export interface IDeferredUpdateActionContext {
  addItem: (groupName: string, id: any, data?: any) => void;
  removeItem: (groupName: string, id: any) => void;
  getPayload: () => IDeferredUpdateGroup[];
}

/** initial state */
export const DELAYED_UPDATE_PROVIDER_CONTEXT_INITIAL_STATE: IDeferredUpdateStateContext = {
  groups: [],
};

export const DeferredUpdateProviderStateContext = createNamedContext<IDeferredUpdateStateContext>(
  DELAYED_UPDATE_PROVIDER_CONTEXT_INITIAL_STATE,
  "DeferredUpdateProviderStateContext"
);

export const DeferredUpdateProviderActionsContext = createNamedContext<IDeferredUpdateActionContext>(undefined, "DeferredUpdateProviderActionsContext");
