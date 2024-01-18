import qs from 'qs';
import React, {
  FC,
  PropsWithChildren,
  useContext,
  useReducer
} from 'react';
import { asFormFullName } from '../form/utils';
import { FormIdentifier } from '@/interfaces';
import { getFlagSetters } from '../utils/flagsSetters';
import { getQueryParams, getUrlWithoutQueryParams } from '@/utils/url';
import { IConfigurableActionConfiguration, useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { IKeyValue } from '@/interfaces/keyValue';
import { mapKeyValueToDictionary } from '@/utils/dictionary';
import { navigateArgumentsForm } from './actions/navigate-arguments';
import { SHA_ROUTING_CONTEXT_INITIAL_STATE, ShaRoutingActionsContext, ShaRoutingStateContext } from './contexts';
import { shaRoutingReducer } from './reducer';
import { SheshaActionOwners } from '../configurableActionsDispatcher/models';

export type NavigationType = 'url' | 'form';

const NAVIGATE_ACTION_NAME = 'Navigate';

interface IRouter {
  push(href: string): void;
  /**
   * Navigate to the previous history entry.
   */
  back(): void;
  query: NodeJS.Dict<string | string[]>;
  asPath: string;
}

export interface INavigateActoinArguments {
  navigationType: NavigationType;
  url?: string;
  formId?: FormIdentifier;
  queryParameters?: IKeyValue[];
}

interface ShaRoutingProviderProps {
  router: IRouter;
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
      state.router.push(url);
      return Promise.resolve(true);
    }

    if (window) {
      window.location.href = url;
      return Promise.resolve(true);
    } else
      return Promise.reject("Both router and windows are not defined");
  };

  const prepareUrl = (url: string, queryParameters?: IKeyValue[]) => {
    const urlWithoutQuery = getUrlWithoutQueryParams(url);
    const urlQueryPatams = getQueryParams(url);

    const queryParams = mapKeyValueToDictionary(queryParameters);
    const queryStringData = { ...urlQueryPatams, ...queryParams };

    const queryString = qs.stringify(queryStringData);
    const preparedUrl = queryString
      ? `${urlWithoutQuery}?${queryString}`
      : urlWithoutQuery;
    return preparedUrl;
  };

  const getUrlFromNavigationRequest = (request: INavigateActoinArguments): string => {
    switch (request?.navigationType) {
      case 'url': return prepareUrl(request.url, request.queryParameters);
      case 'form': {
        const formUrl = getFormUrl(request.formId);
        return prepareUrl(formUrl, request.queryParameters);
      };
      default: return undefined;
    }
  };

  const actionDependencies = [state, state?.router];
  useConfigurableAction<INavigateActoinArguments>(
    {
      name: NAVIGATE_ACTION_NAME,
      owner: 'Common',
      ownerUid: SheshaActionOwners.Common,
      hasArguments: true,
      executer: (request) => {
        if (request.navigationType !== 'form' && request.navigationType !== 'url')
          return Promise.reject(`Common:Navigate: 'navigationType' is not configured properly, current value is '${request.navigationType}'`);

        const url = getUrlFromNavigationRequest(request);
        return Boolean(url)
          ? navigateToRawUrl(url)
          : Promise.reject('Common:Navigate: url is empty');
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
          getUrlFromNavigationRequest,
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

const isNavigationActionConfiguration = (actionConfig: IConfigurableActionConfiguration): actionConfig is IConfigurableActionConfiguration<INavigateActoinArguments> => {
  return actionConfig && actionConfig.actionOwner === SheshaActionOwners.Common && actionConfig.actionName === NAVIGATE_ACTION_NAME;
};

export { ShaRoutingProvider, useShaRouting, useShaRoutingActions, useShaRoutingState, isNavigationActionConfiguration, type IRouter };