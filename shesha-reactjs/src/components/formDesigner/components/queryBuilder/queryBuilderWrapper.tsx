import React, { FC } from 'react';
import { QueryBuilderProvider } from '../../../../providers';

export const QueryBuilderWrapper: FC = ({ children }) => {
  return (
    <QueryBuilderProvider id="QueryBuilderWrapper">
      {children}
    </QueryBuilderProvider>
  );
};
