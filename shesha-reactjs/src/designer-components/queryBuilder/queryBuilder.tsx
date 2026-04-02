import React, { FC } from 'react';
import { IQueryBuilderComponentPropsUnwrapped } from './interfaces';
import { QueryBuilderRenderer } from './queryBuilderRenderer';
import { QueryBuilderWithModelType } from './queryBuilderWithModelType';
import { useQueryBuilder } from '@/providers';
import { isEntityTypeIdEmpty } from '@/providers/metadataDispatcher/entities/utils';

export const QueryBuilder: FC<IQueryBuilderComponentPropsUnwrapped> = (props) => {
  const queryBuilder = useQueryBuilder(false);

  return isEntityTypeIdEmpty(props.modelType) && queryBuilder ? (
    <QueryBuilderRenderer {...props} />
  ) : (
    <QueryBuilderWithModelType modelType={props.modelType}>
      <QueryBuilderRenderer {...props} />
    </QueryBuilderWithModelType>
  );
};
