import React, { FC, useReducer, useContext, PropsWithChildren, useRef } from 'react';
import appConfiguratorReducer from './reducer';
import {
  DEFAULT_ACCESS_TOKEN_NAME,
  DEFAULT_SHESHA_ROUTES,
  ISheshaRutes,
  SheshaApplicationActionsContext,
  SheshaApplicationStateContext,
  SHESHA_APPLICATION_CONTEXT_INITIAL_STATE,
} from './contexts';
import IRequestHeaders from '../../interfaces/requestHeaders';
import {
  setBackendUrlAction,
  setGlobalVariablesAction,
  setHeadersAction,
  updateToolboxComponentGroupsAction,
} from './actions';
import { Router } from 'next/router';
import AuthProvider from '../auth';
import ShaRoutingProvider from '../shaRouting';
import { AppConfiguratorProvider } from '../appConfigurator';
import { DynamicModalProvider } from '../dynamicModal';
import { UiProvider } from '../ui';
import { MetadataDispatcherProvider } from '../metadataDispatcher';
import {
  FormIdentifier,
  IAuthProviderRefProps,
  IToolboxComponentGroup,
  ThemeProvider,
  ThemeProviderProps,
} from '../..';
import { ReferenceListDispatcherProvider } from '../referenceListDispatcher';
import { StackedNavigationProvider } from '../../pages/dynamic/navigation/stakedNavigation';
import ConditionalWrap from '../../components/conditionalWrapper';
import { ConfigurableActionDispatcherProvider } from '../configurableActionsDispatcher';
import { ApplicationActionsProcessor } from './configurable-actions/applicationActionsProcessor';
import { ConfigurationItemsLoaderProvider } from '../configurationItemsLoader';
import { FRONT_END_APP_HEADER_NAME } from './models';
import { SettingsProvider } from '../settings';
import { DataSourcesProvider } from '../dataSourcesProvider';
import { useDeepCompareEffect } from 'react-use';

export interface IShaApplicationProviderProps {
  backendUrl: string;
  applicationName?: string;
  accessTokenName?: string;
  router?: Router; // todo: replace with IRouter
  toolboxComponentGroups?: IToolboxComponentGroup[];
  unauthorizedRedirectUrl?: string;
  themeProps?: ThemeProviderProps;
  routes?: ISheshaRutes;
  noAuth?: boolean;
  homePageUrl?: string;
  /**
   * Unique identifier (key) of the front-end application, is used to separate some settings and application parts when use multiple front-ends
   */
  applicationKey?: string;
  getFormUrlFunc?: (formId: FormIdentifier) => string;
}

const ShaApplicationProvider: FC<PropsWithChildren<IShaApplicationProviderProps>> = (props) => {
  const {
    children,
    backendUrl,
    applicationName,
    applicationKey,
    accessTokenName,
    homePageUrl,
    router,
    toolboxComponentGroups = [],
    unauthorizedRedirectUrl,
    themeProps,
    routes,
    getFormUrlFunc,
  } = props;
  const initialHeaders = applicationKey ? { [FRONT_END_APP_HEADER_NAME]: applicationKey } : {};
  const [state, dispatch] = useReducer(appConfiguratorReducer, {
    ...SHESHA_APPLICATION_CONTEXT_INITIAL_STATE,
    routes: routes ?? DEFAULT_SHESHA_ROUTES,
    backendUrl,
    applicationName,
    toolboxComponentGroups,
    applicationKey,
    httpHeaders: initialHeaders,
  });

  const authRef = useRef<IAuthProviderRefProps>();

  useDeepCompareEffect(() => {
    if (toolboxComponentGroups?.length !== 0) {
      updateToolboxComponentGroups(toolboxComponentGroups);
    }
  }, [toolboxComponentGroups]);

  const updateToolboxComponentGroups = (payload: IToolboxComponentGroup[]) => {
    dispatch(updateToolboxComponentGroupsAction(payload));
  };

  const setRequestHeaders = (headers: IRequestHeaders) => {
    dispatch(setHeadersAction(headers));
  };

  const changeBackendUrl = (newBackendUrl: string) => {
    dispatch(setBackendUrlAction(newBackendUrl));
  };

  const anyOfPermissionsGranted = (permissions: string[]) => {
    if (permissions?.length === 0) return true;

    const authorizer = authRef?.current?.anyOfPermissionsGranted;
    return authorizer && authorizer(permissions);
  };

  const setGlobalVariables = (values: { [x: string]: any }) => {
    dispatch(setGlobalVariablesAction(values));
  };

  return (
    <SheshaApplicationStateContext.Provider value={state}>
      <SheshaApplicationActionsContext.Provider
        value={{
          changeBackendUrl,
          setRequestHeaders,
          // This will always return false if you're not authorized
          anyOfPermissionsGranted: anyOfPermissionsGranted, // NOTE: don't pass ref directly here, it leads to bugs because some of components use old reference even when authRef is updated
          setGlobalVariables,
        }}
      >
        <SettingsProvider>
          <ConfigurableActionDispatcherProvider>
            <UiProvider>
              <ShaRoutingProvider getFormUrlFunc={getFormUrlFunc} router={router}>
                <ConditionalWrap
                  condition={!props?.noAuth}
                  wrap={(authChildren) => (
                    <AuthProvider
                      tokenName={accessTokenName || DEFAULT_ACCESS_TOKEN_NAME}
                      onSetRequestHeaders={setRequestHeaders}
                      unauthorizedRedirectUrl={unauthorizedRedirectUrl}
                      authRef={authRef}
                      homePageUrl={homePageUrl}
                    >
                      {authChildren}
                    </AuthProvider>
                  )}
                >
                  <ConfigurationItemsLoaderProvider>
                    <ThemeProvider {...(themeProps || {})}>
                      <AppConfiguratorProvider>
                        <ReferenceListDispatcherProvider>
                          <MetadataDispatcherProvider>
                            <StackedNavigationProvider>
                              <DataSourcesProvider>
                                <DynamicModalProvider>
                                  <ApplicationActionsProcessor>{children}</ApplicationActionsProcessor>
                                </DynamicModalProvider>
                              </DataSourcesProvider>
                            </StackedNavigationProvider>
                          </MetadataDispatcherProvider>
                        </ReferenceListDispatcherProvider>
                      </AppConfiguratorProvider>
                    </ThemeProvider>
                  </ConfigurationItemsLoaderProvider>
                </ConditionalWrap>
              </ShaRoutingProvider>
            </UiProvider>
          </ConfigurableActionDispatcherProvider>
        </SettingsProvider>
      </SheshaApplicationActionsContext.Provider>
    </SheshaApplicationStateContext.Provider>
  );
};

function useSheshaApplication(require: boolean = true) {
  const stateContext = useContext(SheshaApplicationStateContext);
  const actionsContext = useContext(SheshaApplicationActionsContext);

  if (require && (stateContext === undefined || actionsContext === undefined)) {
    throw new Error('useSheshaApplication must be used within a SheshaApplicationStateContext');
  }

  return { ...stateContext, ...actionsContext };
}

export { ShaApplicationProvider, useSheshaApplication };
