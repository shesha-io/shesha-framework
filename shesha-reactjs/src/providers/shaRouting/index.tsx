import React, {
  FC,
  PropsWithChildren,
  useContext,
  useState,
} from 'react';
import { FormFullName, FormIdentifier } from '@/interfaces';
import { IConfigurableActionConfiguration, useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { IKeyValue } from '@/interfaces/keyValue';
import { getNavigateArgumentsForm } from './actions/navigate-arguments';
import { IShaRouter, ShaRouterContext } from './contexts';
import { SheshaActionOwners } from '../configurableActionsDispatcher/models';
import { ShaRouter } from './router';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { isValidFormFullName } from '../form/utils';

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
  getFormUrlFunc?: ((formId: FormIdentifier, isLoggedIn: boolean) => string) | undefined;
  urlOverrideFunc?: ((url: string) => string) | undefined;
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
      sortOrder: 2,
      hasArguments: true,
      executer: async (request) => {
        const url = shaRouter.getUrlFromNavigationRequest(request);

        if (isNullOrWhiteSpace(url))
          throw new Error('Common:Navigate: url is empty');

        await shaRouter.goingToRoute(url);
      },
      argumentsFormMarkup: getNavigateArgumentsForm,
      migrator: (m) => m.add<INavigateActoinArguments>(0, (prev) => ({ ...prev, navigationType: !isNullOrWhiteSpace(prev.navigationType) ? prev.navigationType : 'form' })),
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

const isNavigationActionConfiguration = (actionConfig: IConfigurableActionConfiguration | undefined): actionConfig is IConfigurableActionConfiguration<INavigateActoinArguments> => {
  return isDefined(actionConfig) && actionConfig.actionOwner === SheshaActionOwners.Common && actionConfig.actionName === NAVIGATE_ACTION_NAME;
};

const tryExtractNavigationValidForm = (actionConfig: IConfigurableActionConfiguration | undefined): FormFullName | undefined => {
  return isNavigationActionConfiguration(actionConfig) && actionConfig.actionArguments && actionConfig.actionArguments.navigationType === 'form' && isValidFormFullName(actionConfig.actionArguments.formId)
    ? actionConfig.actionArguments.formId
    : undefined;
};

const isScriptActionConfiguration = (actionConfig: IConfigurableActionConfiguration): actionConfig is IConfigurableActionConfiguration<IScriptActionArguments> => {
  return isDefined(actionConfig) && actionConfig.actionOwner === SheshaActionOwners.Common && actionConfig.actionName === SCRIPT_ACTION_NAME;
};

export { ShaRoutingProvider, useShaRouting, useShaRoutingOrUndefined, isNavigationActionConfiguration, isScriptActionConfiguration, tryExtractNavigationValidForm, type IRouter };
