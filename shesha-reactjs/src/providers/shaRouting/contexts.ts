import { FormIdentifier, INavigateActoinArguments, IRouter } from '@/providers';
import { createNamedContext } from '@/utils/react';

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

export const ShaRoutingStateContext = createNamedContext<IShaRoutingStateContext>(SHA_ROUTING_CONTEXT_INITIAL_STATE, "ShaRoutingStateContext");

export const ShaRoutingActionsContext = createNamedContext<IShaRoutingActionsContext>(undefined, "ShaRoutingActionsContext");