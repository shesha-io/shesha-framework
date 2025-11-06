import React, { FC, PropsWithChildren } from 'react';
import { QueryBuilderProvider, useMetadata } from '@/providers';

export const QueryBuilderWrapper: FC<PropsWithChildren<{}>> = ({ children }) => {
  const metadataContext = useMetadata(false);
  const metadata = metadataContext?.metadata;
  return (
    <QueryBuilderProvider id="QueryBuilderWrapper" metadata={metadata}>
      {children}
    </QueryBuilderProvider>
  );
};
