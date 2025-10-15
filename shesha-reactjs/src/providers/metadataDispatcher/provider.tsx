import React, { FC, PropsWithChildren, useContext, useState } from 'react';
import { IMetadataDispatcher } from './contexts';
import { MetadataDispatcher } from './dispatcher';
import { useHttpClient } from '../sheshaApplication/publicApi';
import { useEntityMetadataFetcher } from './entities/provider';
import { createNamedContext } from '@/utils/react';

export const MetadataDispatcherContext = createNamedContext<IMetadataDispatcher | undefined>(undefined, "MetadataDispatcherContext");

export const MetadataDispatcherProvider: FC<PropsWithChildren> = ({ children }) => {
  const entityMetaFetcher = useEntityMetadataFetcher();
  const httpClient = useHttpClient();
  const [dispatcher] = useState(() => new MetadataDispatcher(entityMetaFetcher, httpClient));

  return (
    <MetadataDispatcherContext.Provider value={dispatcher}>
      {children}
    </MetadataDispatcherContext.Provider>
  );
};

export const useMetadataDispatcher = (): IMetadataDispatcher => {
  const context = useContext(MetadataDispatcherContext);
  if (!context) {
    throw new Error('useMetadataDispatcher must be used within a MetadataDispatcherProvider');
  }

  return context;
};
