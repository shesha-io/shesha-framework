import { useCacheProvider } from '@/hooks/useCache';
import { useFormDesignerComponents, useHttpClient } from '@/providers';
import React, { FC, PropsWithChildren, useContext, useState } from 'react';
import { ConfigurationLoader, IConfigurationLoader } from './configurationLoader';
import {
  ConfigurationItemsLoaderActionsContext,
} from './contexts';

export const URLS = {
  GET_MODULES: '/api/services/app/ConfigurationStudio/GetModules',
  GET_CURRENT_CONFIG: '/api/services/app/ConfigurationItem/GetCurrent',
  GET_CONFIG: '/api/services/app/ConfigurationItem/Get',
  GET_ENTITY_CONFIG_FORM: '/api/services/app/EntityConfig/GetEntityConfigForm',
};

const ConfigurationItemsLoaderProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const httpClient = useHttpClient();

  const designerComponents = useFormDesignerComponents();

  const cacheProvider = useCacheProvider();

  const [loader] = useState<IConfigurationLoader>(() =>
    new ConfigurationLoader({
      httpClient,
      cacheProvider,
      designerComponents: designerComponents,
    }),
  );

  return (
    <ConfigurationItemsLoaderActionsContext.Provider value={loader}>
      {children}
    </ConfigurationItemsLoaderActionsContext.Provider>
  );
};

const useConfigurationItemsLoader = (): IConfigurationLoader => {
  const context = useContext(ConfigurationItemsLoaderActionsContext);

  if (context === undefined)
    throw new Error('useConfigurationItemsLoader must be used within a ConfigurationItemsLoaderProvider');

  return context;
};

export {
  ConfigurationItemsLoaderProvider,
  useConfigurationItemsLoader,
};

