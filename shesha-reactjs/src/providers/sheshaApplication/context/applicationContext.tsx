import React, { FC, PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';
import { SheshaCommonContexts } from '../../dataContextManager/models';
import DataContextBinder from '@/providers/dataContextProvider/dataContextBinder';
import { ApplicationApi, IApplicationApi } from '../publicApi/applicationApi';
import { useApplicationContextMetadata } from '../publicApi/metadata';
import { useHttpClient } from '../publicApi/http/hooks';
import { useAuth, useShaRouting } from '@/providers';
import { IUserProfileInfo } from '../publicApi/currentUser/api';
import { useCacheProvider } from '@/hooks/useCache';
import { useEntityMetadataFetcher } from '@/providers/metadataDispatcher/entities/provider';
import { IMetadataBuilder, IObjectMetadataBuilder } from '@/utils/metadata/metadataBuilder';
import { createNamedContext } from '@/utils/react';

export interface IApplicationDataProviderProps {}

export interface ApplicationPluginRegistration {
  name: string;
  buildMetadata: (apiBuilder: IObjectMetadataBuilder, metadataBuilder: IMetadataBuilder) => void;
  data: any;
}

export interface IApplicationActionsContext {
  registerPlugin: (plugin: ApplicationPluginRegistration) => void;
  unregisterPlugin: (pluginName: string) => void;
  getPlugin: (pluginName: string) => ApplicationPluginRegistration;
}
export const ApplicationActionsContext = createNamedContext<IApplicationActionsContext>(
  undefined,
  'ApplicationActionsContext'
);
export const ApplicationPublicApiContext = createNamedContext<IApplicationApi>(
  undefined,
  'ApplicationPublicApiContext'
);

export const ApplicationDataProvider: FC<PropsWithChildren<IApplicationDataProviderProps>> = ({ children }) => {
  const [plugins, setPlugins] = useState<ApplicationPluginRegistration[]>([]);
  const httpClient = useHttpClient();
  const cacheProvider = useCacheProvider();
  const metadataFetcher = useEntityMetadataFetcher();
  const shaRouter = useShaRouting();

  // inject fields from plugins
  const [contextData] = useState<IApplicationApi>(
    () => new ApplicationApi(httpClient, cacheProvider, metadataFetcher, shaRouter)
  );

  const { loginInfo } = useAuth(false) ?? {};
  useEffect(() => {
    const profile: IUserProfileInfo = loginInfo
      ? {
          id: loginInfo.id?.toString(),
          userName: loginInfo.userName,
          firstName: loginInfo.firstName,
          lastName: loginInfo.lastName,
          personId: loginInfo.personId,
        }
      : undefined;

    contextData.user.setProfileInfo(profile);
    contextData.user.setGrantedPermissions(loginInfo?.grantedPermissions ?? []);
  }, [loginInfo, contextData.user]);

  const registerPlugin = useCallback(
    (plugin: ApplicationPluginRegistration) => {
      setPlugins((p) => [...p, plugin]);
      // register property
      contextData.addPlugin({ name: plugin.name, data: plugin.data });
    },
    [setPlugins]
  );

  const unregisterPlugin = useCallback(
    (pluginName: string) => {
      setPlugins((p) => p.filter((p) => p.name !== pluginName));
    },
    [setPlugins]
  );

  const contextMetadata = useApplicationContextMetadata({ plugins }); // inject meta from plugins

  const getPlugin = (name: string) => {
    return plugins.find((p) => p.name === name);
  };

  return (
    <ApplicationActionsContext.Provider value={{ registerPlugin, unregisterPlugin, getPlugin }}>
      <ApplicationPublicApiContext.Provider value={contextData}>
        <DataContextBinder
          id={SheshaCommonContexts.ApplicationContext}
          name={SheshaCommonContexts.ApplicationContext}
          description={'Application context'}
          type={'root'}
          metadata={contextMetadata}
          data={contextData}
        >
          {children}
        </DataContextBinder>
      </ApplicationPublicApiContext.Provider>
    </ApplicationActionsContext.Provider>
  );
};

export const useApplicationActions = (): IApplicationActionsContext => {
  const context = useContext(ApplicationActionsContext);

  if (context === undefined) {
    throw new Error('useApplicationActions must be used within a ApplicationActionsContext');
  }

  return context;
};

export const useApplicationPlugin = (plugin: ApplicationPluginRegistration) => {
  const { registerPlugin, unregisterPlugin } = useApplicationActions();
  useEffect(() => {
    registerPlugin(plugin);

    return () => {
      unregisterPlugin(plugin.name);
    };
  }, [registerPlugin, unregisterPlugin, plugin.name]);
};

export const usePublicApplicationApi = (): IApplicationApi => {
  var context = useContext(ApplicationPublicApiContext);
  if (context === undefined) {
    throw new Error('usePublicApplicationApi must be used within a ApplicationDataProvider');
  }
  return context;
};
