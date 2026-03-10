import { Widgets } from '@react-awesome-query-builder/antd';
import { IModelMetadata } from '@/interfaces/metadata';
import { IProperty } from './models';
import { createNamedContext } from '@/utils/react';

export interface IQueryBuilderStateContext {
  fields: IProperty[];
  id?: string;
  customWidgets?: Widgets;
}

export interface IQueryBuilderActionsContext {
  setFields: (fields: IProperty[]) => void;
  fetchFields: (fieldNames: string[]) => void;
  fetchContainer: (containerPath: string) => Promise<IModelMetadata>;
}

export const QUERY_BUILDER_CONTEXT_INITIAL_STATE: IQueryBuilderStateContext = {
  fields: [],
};

export const QueryBuilderStateContext = createNamedContext<IQueryBuilderStateContext>(QUERY_BUILDER_CONTEXT_INITIAL_STATE, "QueryBuilderStateContext");

export const QueryBuilderActionsContext = createNamedContext<IQueryBuilderActionsContext>(undefined, "QueryBuilderActionsContext");
