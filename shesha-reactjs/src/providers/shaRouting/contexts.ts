import { FormIdentifier, INavigateActoinArguments, IRouter } from '@/providers';
import { createNamedContext } from '@/utils/react';

export interface IShaRoutingStateContext {
  readonly router: IRouter;
}

export interface IShaRoutingActionsContext {
  goingToRoute: (route: string) => Promise<boolean>;
  getFormUrl: (formId: FormIdentifier) => string;
  getUrlFromNavigationRequest: (request: INavigateActoinArguments) => string;
}

export type IShaRouter = IShaRoutingStateContext & IShaRoutingActionsContext;

export const ShaRouterContext = createNamedContext<IShaRouter>(undefined, "ShaRouterContext");
