import React, { FC, useReducer, useContext, PropsWithChildren } from 'react';
import { shaRoutingReducer } from './reducer';
import { ShaRoutingActionsContext, ShaRoutingStateContext, SHA_ROUTING_CONTEXT_INITIAL_STATE } from './contexts';
import { getFlagSetters } from '../utils/flagsSetters';
import { Router } from 'next/router';
import { useConfigurableAction } from '../configurableActionsDispatcher';
import { navigateArgumentsForm } from './actions/navigate-arguments';
import { SheshaActionOwners } from '../configurableActionsDispatcher/models';

export interface IRoutingProviderProvider {
  router: Router;
}

interface INavigateActoinArguments {
  target: string;
}

const ShaRoutingProvider: FC<PropsWithChildren<any>> = ({ children, router }) => {
  const [state, dispatch] = useReducer(shaRoutingReducer, { ...SHA_ROUTING_CONTEXT_INITIAL_STATE, router });
  
  /* NEW_ACTION_DECLARATION_GOES_HERE */
  const goingToRoute = (route: string) => {
    state?.router?.push(route);
  };

  const actionDependencies = [state, state?.router];
  useConfigurableAction<INavigateActoinArguments>({
    name: 'Navigate',
    owner: 'Common',
    ownerUid: SheshaActionOwners.Common,
    hasArguments: true,
    executer: (request) => {
      if (state?.router){
        return state?.router?.push(request.target)
      } else {
        window.location.href = request.target;
        return Promise.resolve();
      }        
    },
    argumentsFormMarkup: navigateArgumentsForm
  }, actionDependencies);

  return (
    <ShaRoutingStateContext.Provider value={{ ...state, router }}>
      <ShaRoutingActionsContext.Provider
        value={{
          ...getFlagSetters(dispatch),
          goingToRoute,
        }}
      >
        {children}
      </ShaRoutingActionsContext.Provider>
    </ShaRoutingStateContext.Provider>
  );
};

function useShaRoutingState(require: boolean = true) {
  const context = useContext(ShaRoutingStateContext);

  if (require && context === undefined) {
    throw new Error('useShaRoutingState must be used within a ShaRoutingProvider');
  }

  return context;
}

function useShaRoutingActions(require: boolean = true) {
  const context = useContext(ShaRoutingActionsContext);

  if (require && context === undefined) {
    throw new Error('useShaRoutingActions must be used within a ShaRoutingProvider');
  }

  return context;
}

function useShaRouting(require: boolean = true) {
  const actionsContext = useShaRoutingActions(require);
  const stateContext = useShaRoutingState(require);

  // useContext() returns initial state when provider is missing
  // initial context state is useless especially when require == true
  // so we must return value only when both context are available
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
}

export default ShaRoutingProvider;

export { ShaRoutingProvider, useShaRoutingState, useShaRoutingActions, useShaRouting };
