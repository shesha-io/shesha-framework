import { createContext } from 'react';
import { FormIdentifier, INavigateActoinArguments, IRouter } from '@/providers';

export interface IShaRoutingStateContext {
  router?: IRouter;
  nextRoute?: string;
  getFormUrlFunc?: (formId: FormIdentifier) => string;
}

export interface IShaRoutingActionsContext {
  goingToRoute: (route: string) => void;
  getFormUrl: (formId: FormIdentifier) => string;
  getUrlFromNavigationRequest: (request: INavigateActoinArguments) => string;
}

export const SHA_ROUTING_CONTEXT_INITIAL_STATE: IShaRoutingStateContext = {};

export const ShaRoutingStateContext = createContext<IShaRoutingStateContext>(SHA_ROUTING_CONTEXT_INITIAL_STATE);

export const ShaRoutingActionsContext = createContext<IShaRoutingActionsContext>(undefined);
