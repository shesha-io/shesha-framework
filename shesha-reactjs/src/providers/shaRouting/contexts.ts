import { FormIdentifier, INavigateActoinArguments, IRouter } from '@/providers';
import { createNamedContext } from '@/utils/react';

export interface IShaRoutingStateContext {
  router: IRouter;
  nextRoute?: string;
}

export interface IShaRoutingActionsContext {
  goingToRoute: (route: string) => void;
  getFormUrl: (formId: FormIdentifier) => string;
  getUrlFromNavigationRequest: (request: INavigateActoinArguments) => string;
}

export type ShaRouting = IShaRoutingStateContext & IShaRoutingActionsContext;

export const ShaRoutingStateContext = createNamedContext<IShaRoutingStateContext>(undefined, "ShaRoutingStateContext");

export const ShaRoutingActionsContext = createNamedContext<IShaRoutingActionsContext>(undefined, "ShaRoutingActionsContext");
