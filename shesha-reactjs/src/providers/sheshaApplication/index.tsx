/* eslint @typescript-eslint/strict-boolean-expressions: "error" */
import { ConditionalMonacoProvider } from '@/components/codeEditor/loaderProvider';
import { MonacoLoaderSettings } from '@/components/codeEditor/loaderProvider/models';
import ConditionalWrap from '@/components/conditionalWrapper';
import { ShaFormStyles } from '@/components/configurableForm/styles/styles';
import { GlobalSheshaStyles } from '@/components/mainLayout/styles/indexStyles';
import { GlobalPageStyles } from '@/components/page/styles/styles';
import SheshaLoader from '@/components/sheshaLoader';
import { ConfigurationStudioEnvironmentProvider } from '@/configuration-studio/cs-environment/contexts';
import {
  AppConfiguratorProvider,
  AuthProvider,
  CanvasProvider,
  DynamicActionsDispatcherProvider,
  DynamicModalProvider,
  FormIdentifier,
  IAuthProviderRefProps,
  MetadataDispatcherProvider,
  ShaRoutingProvider,
  ThemeProvider,
  ThemeProviderProps,
} from '@/providers';
import { ConfigurableActionDispatcherProvider } from '@/providers/configurableActionsDispatcher';
import { ConfigurationItemsLoaderProvider } from '@/providers/configurationItemsLoader';
import { DataContextManager } from '@/providers/dataContextManager';
import { DataSourcesProvider } from '@/providers/dataSourcesProvider';
import { ReferenceListDispatcherProvider } from '@/providers/referenceListDispatcher';
import { SettingsProvider } from '@/providers/settings';
import { IRouter } from '@/providers/shaRouting';
import { throwError } from '@/utils/errors';
import { isDefined } from '@/utils/nullables';
import { firstNonEmptyString } from '@/utils/string';
import { Result } from 'antd';
import React, { FC, PropsWithChildren, useContext, useEffect, useRef } from 'react';
import { SHESHA_ROOT_DATA_CONTEXT_MANAGER, SheshaCommonContexts } from '../dataContextManager/models';
import { DataContextProvider } from '../dataContextProvider';
import { WebStorageContextProvider } from '../dataContextProvider/contexts/webStorageContext';
import { EntityActions } from '../dynamicActions/implementations/dataSourceDynamicMenu/entityDynamicMenuItem';
import { UrlActions } from '../dynamicActions/implementations/dataSourceDynamicMenu/urlDynamicMenuItem';
import { FormDataLoadersProvider } from '../form/loaders/formDataLoadersProvider';
import { FormDataSubmittersProvider } from '../form/submitters/formDataSubmittersProvider';
import { FormManager } from '../formManager';
import { MainMenuProvider } from '../mainMenu';
import { EntityMetadataFetcherProvider } from '../metadataDispatcher/entities/provider';
import {
  ISheshaApplicationInstance,
  SheshaApplicationInstanceContext,
  useSheshaApplicationInstance,
} from './application';
import { ApplicationActionsProcessor } from './configurable-actions/applicationActionsProcessor';
import { ApplicationContextsProvider } from './context';
import { useApplicationPlugin, usePublicApplicationApi } from './context/applicationContext';
import { DEFAULT_ACCESS_TOKEN_NAME, IHttpHeadersDictionary, ISheshaRoutes } from './contexts';
import { ProgressBar } from './progressBar';

export interface IShaApplicationProviderProps {
  backendUrl: string;
  /**
   * Unique identifier (key) of the front-end application, is used to separate some settings and application parts when use multiple front-ends
   */
  applicationKey?: string;
  applicationName?: string;
  accessTokenName?: string;

  themeProps?: ThemeProviderProps;

  router: IRouter;
  routes?: ISheshaRoutes;
  homePageUrl?: string;
  getFormUrlFunc?: ((formId: FormIdentifier, isLoggedIn: boolean) => string) | undefined;
  urlOverrideFunc?: (url: string) => string;

  noAuth?: boolean;
  unauthorizedRedirectUrl?: string;
  buildHttpRequestHeaders?: () => IHttpHeadersDictionary;

  monaco?: MonacoLoaderSettings;
}

const ShaApplicationProvider: FC<PropsWithChildren<IShaApplicationProviderProps>> = (props) => {
  const {
    children,
    accessTokenName,
    homePageUrl,
    router,
    unauthorizedRedirectUrl,
    themeProps,
    getFormUrlFunc,
    noAuth = false,
    monaco,
  } = props;

  const authRef = useRef<IAuthProviderRefProps>(undefined);
  const application = useSheshaApplicationInstance({ ...props, authorizer: authRef });
  useEffect(() => {
    void application.init();
  }, [application]);

  const {
    initializationState: { status, hint, error },
  } = application;

  return (
    <SheshaApplicationInstanceContext.Provider value={application}>
      <ConditionalMonacoProvider monaco={monaco}>
        <SettingsProvider>
          <ThemeProvider {...(themeProps || {})}>
            <ConfigurableActionDispatcherProvider>
              <ShaRoutingProvider
                getFormUrlFunc={getFormUrlFunc}
                router={router}
                getIsLoggedIn={() => (isDefined(authRef.current) ? authRef.current.getIsLoggedIn() : false)}
                urlOverrideFunc={props.urlOverrideFunc}
              >
                <DynamicActionsDispatcherProvider>
                  <EntityActions>
                    <UrlActions>
                      <ConditionalWrap
                        condition={!noAuth}
                        wrap={(authChildren) => (
                          <AuthProvider
                            tokenName={firstNonEmptyString(accessTokenName, DEFAULT_ACCESS_TOKEN_NAME)}
                            unauthorizedRedirectUrl={unauthorizedRedirectUrl}
                            authRef={authRef}
                            homePageUrl={homePageUrl}
                          >
                            {authChildren}
                          </AuthProvider>
                        )}
                      >
                        <ConfigurationItemsLoaderProvider>
                          <FormManager>
                            <GlobalSheshaStyles />
                            <ShaFormStyles />
                            <GlobalPageStyles />

                            <AppConfiguratorProvider>
                              <ReferenceListDispatcherProvider>
                                <EntityMetadataFetcherProvider>
                                  <MetadataDispatcherProvider>
                                    <DataContextManager id={SHESHA_ROOT_DATA_CONTEXT_MANAGER}>
                                      <DataContextProvider id={SheshaCommonContexts.AppContext} name={SheshaCommonContexts.AppContext} description="Application data store context" type="app" webStorageType="localStorage">
                                        <WebStorageContextProvider>
                                          <CanvasProvider>
                                            <ApplicationContextsProvider>
                                              <ConfigurationStudioEnvironmentProvider>
                                                <FormDataLoadersProvider>
                                                  <FormDataSubmittersProvider>
                                                    <DataSourcesProvider>
                                                      <DynamicModalProvider>
                                                        {(status === 'inprogress' || status === 'waiting') && (
                                                          <SheshaLoader message={hint ?? 'Initializing...'} />
                                                        )}
                                                        {status === 'ready' && (
                                                          <ApplicationActionsProcessor>
                                                            <MainMenuProvider>
                                                              <ProgressBar>{children}</ProgressBar>
                                                            </MainMenuProvider>
                                                          </ApplicationActionsProcessor>
                                                        )}
                                                        {status === 'failed' && (
                                                          <Result
                                                            status="500"
                                                            title="500"
                                                            subTitle={error?.message ?? 'Sorry, something went wrong.'}
                                                          />
                                                        )}
                                                      </DynamicModalProvider>
                                                    </DataSourcesProvider>
                                                  </FormDataSubmittersProvider>
                                                </FormDataLoadersProvider>
                                              </ConfigurationStudioEnvironmentProvider>
                                            </ApplicationContextsProvider>
                                          </CanvasProvider>
                                        </WebStorageContextProvider>
                                      </DataContextProvider>
                                    </DataContextManager>
                                  </MetadataDispatcherProvider>
                                </EntityMetadataFetcherProvider>
                              </ReferenceListDispatcherProvider>
                            </AppConfiguratorProvider>
                          </FormManager>
                        </ConfigurationItemsLoaderProvider>
                      </ConditionalWrap>
                    </UrlActions>
                  </EntityActions>
                </DynamicActionsDispatcherProvider>
              </ShaRoutingProvider>
            </ConfigurableActionDispatcherProvider>
          </ThemeProvider>
        </SettingsProvider>
      </ConditionalMonacoProvider>
    </SheshaApplicationInstanceContext.Provider>
  );
};

const useSheshaApplication = (): ISheshaApplicationInstance => {
  return useContext(SheshaApplicationInstanceContext) ?? throwError('useSheshaApplication must be used within a ShaApplicationProvider');
};

/**
 * @deprecated use useSheshaApplication instead
 */
const useSheshaApplicationState = useSheshaApplication;

export {
  ShaApplicationProvider, useApplicationPlugin,
  usePublicApplicationApi, useSheshaApplication,
  useSheshaApplicationState,
};

