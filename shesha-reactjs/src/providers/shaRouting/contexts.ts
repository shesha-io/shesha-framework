import { Router } from 'next/router';
import { createContext } from 'react';
import { FormIdentifier } from '../..';

export interface IShaRoutingStateContext {
  router?: Router;
  nextRoute?: string;
  getFormUrlFunc?: (formId: FormIdentifier) => string;
}

export interface IShaRoutingActionsContext {
  goingToRoute: (route: string) => void;
  getFormUrl: (formId: FormIdentifier) => string;
}

export const SHA_ROUTING_CONTEXT_INITIAL_STATE: IShaRoutingStateContext = {};

export const ShaRoutingStateContext = createContext<IShaRoutingStateContext>(SHA_ROUTING_CONTEXT_INITIAL_STATE);

export const ShaRoutingActionsContext = createContext<IShaRoutingActionsContext>(undefined);
