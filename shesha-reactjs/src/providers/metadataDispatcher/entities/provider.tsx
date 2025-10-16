import { useCacheProvider } from '@/hooks/useCache';
import { useHttpClient } from '@/providers/sheshaApplication/publicApi';
import React, { FC, PropsWithChildren, useContext, useState } from 'react';
import { EntityMetadataFetcher } from './entityMetadataFetcher';
import { IEntityMetadataFetcher } from './models';
import { createNamedContext } from '@/utils/react';

export const EntityMetadataFetcherContext = createNamedContext<IEntityMetadataFetcher | undefined>(undefined, "EntityMetadataFetcherContext");

export const EntityMetadataFetcherProvider: FC<PropsWithChildren> = ({ children }) => {
  const httpClient = useHttpClient();
  const cacheProvider = useCacheProvider();
  const [fetcher] = useState(() => new EntityMetadataFetcher(httpClient, cacheProvider));

  return (
    <EntityMetadataFetcherContext.Provider value={fetcher}>
      {children}
    </EntityMetadataFetcherContext.Provider>
  );
};

export const useEntityMetadataFetcher = (): IEntityMetadataFetcher => {
  const context = useContext(EntityMetadataFetcherContext);
  if (!context) {
    throw new Error('useEntityMetadataFetcher must be used within a EntityMetadataFetcherProvider');
  }

  return context;
};
