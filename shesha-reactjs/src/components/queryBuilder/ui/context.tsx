import { createContext, useContext } from 'react';
import { IProperty } from '@/providers/queryBuilder/models';
import { QueryAction } from '../model/reducer';
import { QueryTree } from '../model/types';

export interface IBuilderContext {
  tree: QueryTree;
  fields: IProperty[];
  readOnly: boolean;
  dispatch: (action: QueryAction) => void;
}

const BuilderContext = createContext<IBuilderContext | undefined>(undefined);

export const BuilderContextProvider = BuilderContext.Provider;

export const useBuilder = (): IBuilderContext => {
  const context = useContext(BuilderContext);
  if (!context) throw new Error('Query builder components must be rendered inside the query builder');
  return context;
};
