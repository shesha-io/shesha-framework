import React, {
  FC,
  PropsWithChildren,
  useContext,
  useState,
} from 'react';
import { FormIdentifier } from '@/interfaces';
import { IConfigurableActionConfiguration, useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { IKeyValue } from '@/interfaces/keyValue';
import { getNavigateArgumentsForm } from './actions/navigate-arguments';
import { IShaRouter, ShaRouterContext } from './contexts';
import { SheshaActionOwners } from '../configurableActionsDispatcher/models';
import { ShaRouter } from './router';

export type NavigationType = 'url' | 'form';

const SCRIPT_ACTION_NAME = 'Execute Script';
const NAVIGATE_ACTION_NAME = 'Navigate';

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
  urlOverrideFunc?: (url: string) => string;
  getIsLoggedIn: () => boolean;
}

const ShaRoutingProvider: FC<PropsWithChildren<ShaRoutingProviderProps>> = ({ children, router, getFormUrlFunc, getIsLoggedIn, urlOverrideFunc }) => {
  const [shaRouter] = useState<ShaRouter>(() => {
    return new ShaRouter({ router, getFormUrlFunc, getIsLoggedIn, urlOverrideFunc });
  });
  shaRouter.updateRouter({ router, getFormUrlFunc, getIsLoggedIn, urlOverrideFunc });

  useConfigurableAction<INavigateActoinArguments>(
    {
      name: NAVIGATE_ACTION_NAME,
      owner: 'Common',
      ownerUid: SheshaActionOwners.Common,
      hasArguments: true,
      executer: (request) => {
        if (request.navigationType !== 'form' && request.navigationType !== 'url')
          return Promise.reject(`Common:Navigate: 'navigationType' is not configured properly, current value is '${request.navigationType}'`);

        const url = shaRouter.getUrlFromNavigationRequest(request);
        return Boolean(url)
          ? shaRouter.goingToRoute(url)
          : Promise.reject('Common:Navigate: url is empty');
      },
      argumentsFormMarkup: getNavigateArgumentsForm,
    },
  );

  return (
    <ShaRouterContext.Provider value={shaRouter}>
      {children}
    </ShaRouterContext.Provider>
  );
};

const useShaRoutingOrUndefined = (): IShaRouter | undefined => {
  return useContext(ShaRouterContext);
};

const useShaRouting = (): IShaRouter => {
  const context = useShaRoutingOrUndefined();
  if (context === undefined) {
    throw new Error('useShaRouting must be used within a ShaRoutingProvider');
  }
  return context;
};

const isNavigationActionConfiguration = (actionConfig: IConfigurableActionConfiguration): actionConfig is IConfigurableActionConfiguration<INavigateActoinArguments> => {
  return actionConfig && actionConfig.actionOwner === SheshaActionOwners.Common && actionConfig.actionName === NAVIGATE_ACTION_NAME;
};
const isScriptActionConfiguration = (actionConfig: IConfigurableActionConfiguration): actionConfig is IConfigurableActionConfiguration<IScriptActionArguments> => {
  return actionConfig && actionConfig.actionOwner === SheshaActionOwners.Common && actionConfig.actionName === SCRIPT_ACTION_NAME;
};

export { ShaRoutingProvider, useShaRouting, useShaRoutingOrUndefined, isNavigationActionConfiguration, isScriptActionConfiguration, type IRouter };
