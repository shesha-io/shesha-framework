import React, { FC, PropsWithChildren } from 'react';
import ConditionalWrap from '@/components/conditionalWrapper';
import { MetadataProvider } from '@/providers';
import { QueryBuilderWrapper } from './queryBuilderWrapper';
import { IEntityTypeIndentifier } from '@/providers/sheshaApplication/publicApi/entities/models';

export interface IQueryBuilderWithModelType {
  modelType?: string | IEntityTypeIndentifier;
}

export const QueryBuilderWithModelType: FC<PropsWithChildren<IQueryBuilderWithModelType>> = (props) => {
  return (
    <ConditionalWrap
      condition={Boolean(props.modelType)}
      wrap={(content) => <MetadataProvider modelType={props.modelType}>{content}</MetadataProvider>}
    >
      <QueryBuilderWrapper>{props.children}</QueryBuilderWrapper>
    </ConditionalWrap>
  );
};
