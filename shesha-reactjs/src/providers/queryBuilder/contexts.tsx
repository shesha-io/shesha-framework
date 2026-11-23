import { IModelMetadata } from '@/interfaces/metadata';
import { IProperty } from './models';
import { createNamedContext } from '@/utils/react';

export interface IQueryBuilderStateContext {
  fields: IProperty[];
  id?: string | undefined;
  /** @deprecated custom widgets are not supported by the current builder; kept so callers still compile */
  customWidgets?: Record<string, unknown> | undefined;
}

export interface IQueryBuilderActionsContext {
  setFields: (fields: IProperty[]) => void;
  fetchFields: (fieldNames: string[]) => void;
  fetchContainer: (containerPath: string) => Promise<IModelMetadata | null>;
}

export const QueryBuilderStateContext = createNamedContext<IQueryBuilderStateContext | undefined>(undefined, "QueryBuilderStateContext");

export const QueryBuilderActionsContext = createNamedContext<IQueryBuilderActionsContext | undefined>(undefined, "QueryBuilderActionsContext");
