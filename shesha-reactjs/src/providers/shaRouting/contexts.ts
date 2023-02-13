import { createContext } from 'react';
import { Router } from 'next/router';

export interface IShaRoutingStateContext {
  router?: Router;
  nextRoute?: string;
}

export interface IShaRoutingActionsContext {
  goingToRoute: (route: string) => void;
}

export const SHA_ROUTING_CONTEXT_INITIAL_STATE: IShaRoutingStateContext = {};

export const ShaRoutingStateContext = createContext<IShaRoutingStateContext>(SHA_ROUTING_CONTEXT_INITIAL_STATE);

export const ShaRoutingActionsContext = createContext<IShaRoutingActionsContext>(undefined);
