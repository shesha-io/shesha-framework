import { Router } from 'next/router';
import React, { FC, PropsWithChildren, useContext, useReducer } from 'react';
import { FormIdentifier, asFormFullName } from '@/providers/..';
import { useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { SheshaActionOwners } from '../configurableActionsDispatcher/models';
import { getFlagSetters } from '../utils/flagsSetters';
import { navigateArgumentsForm } from './actions/navigate-arguments';
import { SHA_ROUTING_CONTEXT_INITIAL_STATE, ShaRoutingActionsContext, ShaRoutingStateContext } from './contexts';
import { shaRoutingReducer } from './reducer';

export interface IRoutingProviderProvider {
  router: Router;
}

interface INavigateActoinArguments {
  target: string;
}

interface ShaRoutingProviderProps {
  router: Router;
  getFormUrlFunc?: (formId: FormIdentifier) => string;
}

const ShaRoutingProvider: FC<PropsWithChildren<ShaRoutingProviderProps>> = ({ children, router, getFormUrlFunc }) => {
  const [state, dispatch] = useReducer(shaRoutingReducer, {
    ...SHA_ROUTING_CONTEXT_INITIAL_STATE,
    router,
    getFormUrlFunc,
  });

  /* NEW_ACTION_DECLARATION_GOES_HERE */
  const goingToRoute = (route: string) => {
    state?.router?.push(route);
  };

  const getFormUrl = (formId: FormIdentifier) => {
    if (state.getFormUrlFunc) return state.getFormUrlFunc(formId);

    var form = asFormFullName(formId);
    return form ? `/dynamic${form.module ? `/${form.module}` : ''}/${form.name}` : '';
  };

  const actionDependencies = [state, state?.router];
  useConfigurableAction<INavigateActoinArguments>(
    {
      name: 'Navigate',
      owner: 'Common',
      ownerUid: SheshaActionOwners.Common,
      hasArguments: true,
      executer: (request) => {
        if (state?.router) {
          return state?.router?.push(request.target);
        } else {
          window.location.href = request.target;
          return Promise.resolve();
        }
      },
      argumentsFormMarkup: navigateArgumentsForm,
    },
    actionDependencies
  );

  return (
    <ShaRoutingStateContext.Provider value={{ ...state, router }}>
      <ShaRoutingActionsContext.Provider
        value={{
          ...getFlagSetters(dispatch),
          goingToRoute,
          getFormUrl,
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

export { ShaRoutingProvider, useShaRouting, useShaRoutingActions, useShaRoutingState };
