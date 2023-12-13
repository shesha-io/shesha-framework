import { Router } from 'next/router';
import React, { FC, PropsWithChildren, useContext, useReducer } from 'react';
import { FormIdentifier, asFormFullName, getQueryParams } from '@/providers/..';
import { useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { SheshaActionOwners } from '../configurableActionsDispatcher/models';
import { getFlagSetters } from '../utils/flagsSetters';
import { navigateArgumentsForm } from './actions/navigate-arguments';
import { SHA_ROUTING_CONTEXT_INITIAL_STATE, ShaRoutingActionsContext, ShaRoutingStateContext } from './contexts';
import { shaRoutingReducer } from './reducer';
import { IKeyValue } from '@/interfaces/keyValue';
import { mapKeyValueToDictionary } from '@/utils/dictionary';
import qs from 'qs';
import { getUrlWithoutQueryParams } from '@/utils/url';

export interface IRoutingProviderProvider {
  router: Router;
}

export type NavigationType = 'url' | 'form';

export interface INavigateActoinArguments {
  navigationType: NavigationType;
  url?: string;
  formId?: FormIdentifier;
  queryParameters?: IKeyValue[];
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

  const navigateToRawUrl = (url: string): Promise<boolean> => {
    if (state?.router) {
      return state?.router?.push(url);
    }

    if (window) {
      window.location.href = url;
      return Promise.resolve(true);
    } else
      return Promise.reject("Both router and windows are not defined");
  };

  const navigateToUrl = (url: string, queryParameters?: IKeyValue[]): Promise<boolean> => {
    const urlWithoutQuery = getUrlWithoutQueryParams(url);
    const urlQueryPatams = getQueryParams(url);

    const queryParams = mapKeyValueToDictionary(queryParameters);
    const queryStringData = { ...urlQueryPatams, ...queryParams };

    const queryString = qs.stringify(queryStringData);
    const preparedUrl = queryString
      ? `${urlWithoutQuery}?${queryString}`
      : urlWithoutQuery;
    
    return navigateToRawUrl(preparedUrl);
  };

  const navigateToForm = (formId: FormIdentifier, queryParameters?: IKeyValue[]): Promise<boolean> => {
    const url = getFormUrl(formId);

    return navigateToUrl(url, queryParameters);
  };

  const actionDependencies = [state, state?.router];
  useConfigurableAction<INavigateActoinArguments>(
    {
      name: 'Navigate',
      owner: 'Common',
      ownerUid: SheshaActionOwners.Common,
      hasArguments: true,
      executer: (request) => {
        switch(request.navigationType){
          case 'url': return navigateToUrl(request.url, request.queryParameters);
          case 'form': return navigateToForm(request.formId, request.queryParameters);
          default: return Promise.reject(`Common:Navigate: 'navigationType' is not configured properly, current value is '${request.navigationType}'`);
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
