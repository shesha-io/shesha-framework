import React, { FC, PropsWithChildren } from 'react';
import { QueryBuilderProvider, useMetadata } from '@/providers';

export const QueryBuilderWrapper: FC<PropsWithChildren> = ({ children }) => {
  const { metadata } = useMetadata(true);
  return (
    <QueryBuilderProvider id="QueryBuilderWrapper" metadata={metadata}>
      {children}
    </QueryBuilderProvider>
  );
};
