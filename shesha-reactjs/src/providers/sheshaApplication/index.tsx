import ConditionalWrap from '@/components/conditionalWrapper';
import DebugPanel from '@/components/debugPanel';
import React, { FC, PropsWithChildren, useContext, useEffect, useRef } from 'react';
import { ApplicationActionsProcessor } from './configurable-actions/applicationActionsProcessor';
import { ConfigurableActionDispatcherProvider } from '@/providers/configurableActionsDispatcher';
import { ConfigurationItemsLoaderProvider } from '@/providers/configurationItemsLoader';
import { DataContextManager } from '@/providers/dataContextManager';
import { DataSourcesProvider } from '@/providers/dataSourcesProvider';
import { ReferenceListDispatcherProvider } from '@/providers/referenceListDispatcher';
import { IRouter } from '@/providers/shaRouting';
import { SettingsProvider } from '@/providers/settings';
import {
  FormIdentifier,
  IAuthProviderRefProps,
  ThemeProvider,
  ThemeProviderProps,
  DynamicActionsDispatcherProvider,
  MetadataDispatcherProvider,
  AuthProvider,
  ShaRoutingProvider,
  AppConfiguratorProvider,
  DynamicModalProvider,
  CanvasProvider,
} from '@/providers';
import { DEFAULT_ACCESS_TOKEN_NAME, IHttpHeadersDictionary, ISheshaRoutes } from './contexts';
import { GlobalSheshaStyles } from '@/components/mainLayout/styles/indexStyles';
import { GlobalPageStyles } from '@/components/page/styles/styles';
import { ApplicationContextsProvider } from './context';
import { DataContextProvider } from '../dataContextProvider';
import { SHESHA_ROOT_DATA_CONTEXT_MANAGER, SheshaCommonContexts } from '../dataContextManager/models';
import { useApplicationPlugin, usePublicApplicationApi } from './context/applicationContext';
import { FormManager } from '../formManager';
import { ShaFormStyles } from '@/components/configurableForm/styles/styles';
import { EntityMetadataFetcherProvider } from '../metadataDispatcher/entities/provider';
import { FormDataLoadersProvider } from '../form/loaders/formDataLoadersProvider';
import { FormDataSubmittersProvider } from '../form/submitters/formDataSubmittersProvider';
import { MainMenuProvider } from '../mainMenu';
import {
  ISheshaApplicationInstance,
  SheshaApplicationInstanceContext,
  useSheshaApplicationInstance,
} from './application';
import SheshaLoader from '@/components/sheshaLoader';
import { Result } from 'antd';
import { EntityActions } from '../dynamicActions/implementations/dataSourceDynamicMenu/entityDynamicMenuItem';
import { UrlActions } from '../dynamicActions/implementations/dataSourceDynamicMenu/urlDynamicMenuItem';
import { WebStorageContextProvider } from '../dataContextProvider/contexts/webStorageContext';
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

  router?: IRouter;
  routes?: ISheshaRoutes;
  homePageUrl?: string;
  getFormUrlFunc?: (formId: FormIdentifier) => string;

  noAuth?: boolean;
  unauthorizedRedirectUrl?: string;
  buildHttpRequestHeaders?: () => IHttpHeadersDictionary;
}

const ShaApplicationProvider: FC<PropsWithChildren<IShaApplicationProviderProps>> = (props) => {
  const { children, accessTokenName, homePageUrl, router, unauthorizedRedirectUrl, themeProps, getFormUrlFunc } = props;

  const authRef = useRef<IAuthProviderRefProps>();
  const application = useSheshaApplicationInstance({ ...props, authorizer: authRef });
  useEffect(() => {
    application.init();
  }, []);

  const {
    initializationState: { status, hint, error },
  } = application;

  return (
    <SheshaApplicationInstanceContext.Provider value={application}>
      <SettingsProvider>
        <ThemeProvider {...(themeProps || {})}>
          <ConfigurableActionDispatcherProvider>
            <ShaRoutingProvider
              getFormUrlFunc={getFormUrlFunc}
              router={router}
              getIsLoggedIn={() => authRef?.current?.getIsLoggedIn()}
            >
              <DynamicActionsDispatcherProvider>
                <EntityActions>
                  <UrlActions>
                    <ConditionalWrap
                      condition={!props.noAuth}
                      wrap={(authChildren) => (
                        <AuthProvider
                          tokenName={accessTokenName || DEFAULT_ACCESS_TOKEN_NAME}
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
                                    <ApplicationContextsProvider>
                                      <WebStorageContextProvider>
                                        <DataContextProvider
                                          id={SheshaCommonContexts.AppContext}
                                          name={SheshaCommonContexts.AppContext}
                                          description={'Application data store context'}
                                          type={'app'}
                                        >
                                          <FormDataLoadersProvider>
                                            <FormDataSubmittersProvider>
                                              <CanvasProvider>
                                                <DataSourcesProvider>
                                                  <DynamicModalProvider>
                                                    {(status === 'inprogress' || status === 'waiting') && (
                                                      <SheshaLoader message={hint || 'Initializing...'} />
                                                    )}
                                                    {status === 'ready' && (
                                                      <DebugPanel>
                                                        <ApplicationActionsProcessor>
                                                          <MainMenuProvider>
                                                            <ProgressBar>{children}</ProgressBar>
                                                          </MainMenuProvider>
                                                        </ApplicationActionsProcessor>
                                                      </DebugPanel>
                                                    )}
                                                    {status === 'failed' && (
                                                      <Result
                                                        status="500"
                                                        title="500"
                                                        subTitle={error?.message || 'Sorry, something went wrong.'}
                                                        //extra={<Button type="primary">Back Home</Button>}
                                                      />
                                                    )}
                                                  </DynamicModalProvider>
                                                </DataSourcesProvider>
                                              </CanvasProvider>
                                            </FormDataSubmittersProvider>
                                          </FormDataLoadersProvider>
                                        </DataContextProvider>
                                      </WebStorageContextProvider>
                                    </ApplicationContextsProvider>
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
    </SheshaApplicationInstanceContext.Provider>
  );
};

const useSheshaApplication = (require: boolean = true): ISheshaApplicationInstance => {
  const context = useContext(SheshaApplicationInstanceContext);

  if (require && context === undefined) {
    throw new Error('useSheshaApplication must be used within a ShaApplicationProvider');
  }

  return context;
};

/**
 * @deprecated use useSheshaApplication instead
 */
const useSheshaApplicationState = useSheshaApplication;

export {
  ShaApplicationProvider,
  useSheshaApplication,
  useSheshaApplicationState,
  useApplicationPlugin,
  usePublicApplicationApi,
};
