import { createContext } from 'react';
import { FormIdentifier, INavigateActoinArguments } from '@/providers';
import { NextRouter } from 'next/router';

export interface IShaRoutingStateContext {
  router?: NextRouter;
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
