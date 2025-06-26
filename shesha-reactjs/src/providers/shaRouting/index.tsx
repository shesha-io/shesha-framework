import React, {
  FC,
  PropsWithChildren,
  useContext,
} from 'react';
import { isFormFullName } from '../form/utils';
import { FormIdentifier } from '@/interfaces';
import { buildUrl } from '@/utils/url';
import { IConfigurableActionConfiguration, useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { IKeyValue } from '@/interfaces/keyValue';
import { mapKeyValueToDictionary } from '@/utils/dictionary';
import { navigateArgumentsForm } from './actions/navigate-arguments';
import { ShaRouting, ShaRoutingActionsContext, ShaRoutingStateContext } from './contexts';
import { SheshaActionOwners } from '../configurableActionsDispatcher/models';

export type NavigationType = 'url' | 'form';

const SCRIPT_ACTION_NAME = 'Execute Script';
const NAVIGATE_ACTION_NAME = 'Navigate';
const LOGGED_IN_DYNAMIC_PAGE = 'dynamic';
const ANONYMOUS_DYNAMIC_PAGE = 'no-auth';

interface IRouter {
  push(href: string): void;
  /**
   * Navigate to the previous history entry.
   */
  back(): void;
  query: NodeJS.Dict<string | string[]>;
  fullPath: string;
  queryString: string;
  path: string;
}

export interface INavigateActoinArguments {
  navigationType: NavigationType;
  url?: string;
  formId?: FormIdentifier;
  queryParameters?: IKeyValue[];
}

export interface IScriptActionArguments {
  expression: string;
}

interface ShaRoutingProviderProps {
  router: IRouter;
  getFormUrlFunc?: (formId: FormIdentifier, isLoggedIn: boolean) => string;
  getIsLoggedIn: () => boolean;
}

const ShaRoutingProvider: FC<PropsWithChildren<ShaRoutingProviderProps>> = ({ children, router, getFormUrlFunc, getIsLoggedIn }) => {
  const goingToRoute = (route: string) => {
    router?.push(route);
  };

  const getFormUrl = (formId: FormIdentifier) => {
    const isLoggedIn = getIsLoggedIn();
    if (getFormUrlFunc)
      return getFormUrlFunc(formId, isLoggedIn);

    const dynamicPage = isLoggedIn
      ? LOGGED_IN_DYNAMIC_PAGE
      : ANONYMOUS_DYNAMIC_PAGE;

    return isFormFullName(formId)
      ? `/${dynamicPage}${formId.module ? `/${formId.module}` : ''}/${formId.name}`
      : '';
  };

  const navigateToRawUrl = (url: string): Promise<boolean> => {
    if (router) {
      router.push(url);
      return Promise.resolve(true);
    }

    if (window) {
      window.location.href = url;
      return Promise.resolve(true);
    } else
      return Promise.reject("Both router and windows are not defined");
  };

  const prepareUrl = (url: string, queryParameters?: IKeyValue[]) => {
    const queryParams = mapKeyValueToDictionary(queryParameters);
    return buildUrl(url, queryParams);
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

  const actionDependencies = [router];
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
    <ShaRoutingStateContext.Provider value={{ router }}>
      <ShaRoutingActionsContext.Provider
        value={{
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

const useShaRouting = (require: boolean = true): ShaRouting => {
  const actionsContext = useShaRoutingActions(require);
  const stateContext = useShaRoutingState(require);

  // useContext() returns initial state when provider is missing
  // initial context state is useless especially when require == true
  // so we must return value only when both context are available
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
};

const isNavigationActionConfiguration = (actionConfig: IConfigurableActionConfiguration): actionConfig is IConfigurableActionConfiguration<INavigateActoinArguments> => {
  return actionConfig && actionConfig.actionOwner === SheshaActionOwners.Common && actionConfig.actionName === NAVIGATE_ACTION_NAME;
};
const isScriptActionConfiguration = (actionConfig: IConfigurableActionConfiguration): actionConfig is IConfigurableActionConfiguration<IScriptActionArguments> => {
  return actionConfig && actionConfig.actionOwner === SheshaActionOwners.Common && actionConfig.actionName === SCRIPT_ACTION_NAME;
};

export { ShaRoutingProvider, useShaRouting, useShaRoutingActions, useShaRoutingState, isNavigationActionConfiguration, isScriptActionConfiguration, type IRouter };