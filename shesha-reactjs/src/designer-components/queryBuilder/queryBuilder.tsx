import React, { FC } from 'react';
import { IQueryBuilderComponentProps } from './interfaces';
import { QueryBuilderRenderer } from './queryBuilderRenderer';
import { QueryBuilderWithModelType } from './queryBuilderWithModelType';
import { useQueryBuilder } from '@/providers';

export const QueryBuilder: FC<IQueryBuilderComponentProps> = (props) => {
  const queryBuilder = useQueryBuilder(false);

  return queryBuilder ? (
    <QueryBuilderRenderer {...props}></QueryBuilderRenderer>
  ) : (
    <QueryBuilderWithModelType modelType={props.modelType}>
      <QueryBuilderRenderer {...props}></QueryBuilderRenderer>
    </QueryBuilderWithModelType>
  );
};
