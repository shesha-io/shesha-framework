import React from 'react';

interface IQueryBuilderRenderContext {
  tree: unknown;
}

export const QueryBuilderRenderContext = React.createContext<IQueryBuilderRenderContext>({ tree: null });
