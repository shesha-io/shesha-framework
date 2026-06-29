import React, { FC, PropsWithChildren } from 'react';
import { QueryBuilderProvider, useMetadataOrUndefined } from '@/providers';

export const QueryBuilderWrapper: FC<PropsWithChildren> = ({ children }) => {
  const metadata = useMetadataOrUndefined()?.metadata;
  return metadata
    ? (
      <QueryBuilderProvider id="QueryBuilderWrapper" metadata={metadata}>
        {children}
      </QueryBuilderProvider>
    )
    : undefined;
};
