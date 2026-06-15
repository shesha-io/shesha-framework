import React, { FC, PropsWithChildren } from 'react';
import { ConditionalMetadataProvider } from '@/providers';
import { QueryBuilderWrapper } from './queryBuilderWrapper';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';

export interface IQueryBuilderWithModelType {
  modelType?: string | IEntityTypeIdentifier | undefined;
}

export const QueryBuilderWithModelType: FC<PropsWithChildren<IQueryBuilderWithModelType>> = (props) => {
  return (
    <ConditionalMetadataProvider modelType={props.modelType}>
      <QueryBuilderWrapper>{props.children}</QueryBuilderWrapper>
    </ConditionalMetadataProvider>
  );
};
