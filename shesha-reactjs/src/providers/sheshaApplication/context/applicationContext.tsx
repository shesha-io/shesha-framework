import React, { FC, PropsWithChildren, createContext, useCallback, useContext, useEffect, useState } from 'react';
import { SheshaCommonContexts } from '../../dataContextManager/models';
import DataContextBinder from '@/providers/dataContextProvider/dataContextBinder';
import { ApplicationApi, IApplicationApi } from '../publicApi/applicationApi';
import { useApplicationContextMetadata } from '../publicApi/metadata';
import { useHttpClient } from '../publicApi/http/hooks';
import { useAuthState } from '@/providers';
import { IUserProfileInfo } from '../publicApi/currentUser/api';
import { useCacheProvider } from '@/hooks/useCache';
import { useEntityMetadataFetcher } from '@/providers/metadataDispatcher/entities/provider';
import { MetadataBuilder } from '@/utils/metadata/metadataBuilder';

export interface IApplicationDataProviderProps {

}

export interface ApplicationPluginRegistration {
  name: string;
  buildMetadata: (builder: MetadataBuilder) => void;
  data: any;
}

export interface IApplicationActionsContext {
  registerPlugin: (plugin: ApplicationPluginRegistration) => void;
  unregisterPlugin: (pluginName: string) => void;
  getPlugin: (pluginName: string) => ApplicationPluginRegistration;
}
export const ApplicationActionsContext = createContext<IApplicationActionsContext>(undefined);

export const ApplicationDataProvider: FC<PropsWithChildren<IApplicationDataProviderProps>> = ({ children }) => {
  const [plugins, setPlugins] = useState<ApplicationPluginRegistration[]>([]);
  const httpClient = useHttpClient();
  const cacheProvider = useCacheProvider();
  const metadataFetcher = useEntityMetadataFetcher();

  // inject fields from plugins
  const [contextData] = useState<IApplicationApi>(() => new ApplicationApi(httpClient, cacheProvider, metadataFetcher));

  const { loginInfo } = useAuthState(false) ?? {};
  useEffect(() => {
    const profile: IUserProfileInfo = loginInfo
      ? {
        id: loginInfo.id?.toString(),
        userName: loginInfo.userName,
        firstName: loginInfo.firstName,
        lastName: loginInfo.lastName
      }
      : undefined;

    contextData.user.setProfileInfo(profile);
  }, [loginInfo, contextData.user]);

  const registerPlugin = useCallback((plugin: ApplicationPluginRegistration) => {
    setPlugins(p => [...p, plugin]);
    // register property
    contextData.addPlugin({ name: plugin.name, data: plugin.data });
  }, [setPlugins]);

  const unregisterPlugin = useCallback((pluginName: string) => {
    setPlugins(p => p.filter(p => p.name !== pluginName));
  }, [setPlugins]);

  const contextMetadata = useApplicationContextMetadata({ plugins }); // inject meta from plugins

  const getPlugin = (name: string) => {
    return plugins.find(p => p.name === name);
  };

  return (
    <ApplicationActionsContext.Provider value={{ registerPlugin, unregisterPlugin, getPlugin }}>
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