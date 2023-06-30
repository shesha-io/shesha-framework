import React, { FC, PropsWithChildren } from 'react';
import { QueryBuilderProvider } from 'providers';

export const QueryBuilderWrapper: FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <QueryBuilderProvider id="QueryBuilderWrapper">
      {children}
    </QueryBuilderProvider>
  );
};
