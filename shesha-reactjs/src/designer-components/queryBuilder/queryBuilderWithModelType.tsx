import React, { FC, PropsWithChildren } from 'react';
import ConditionalWrap from '@/components/conditionalWrapper';
import { MetadataProvider, useForm } from '@/providers';
import { evaluateString } from '@/providers/form/utils';
import { QueryBuilderWrapper } from './queryBuilderWrapper';

export interface IQueryBuilderWithModelType {
  modelType?: string;
}

export const QueryBuilderWithModelType: FC<PropsWithChildren<IQueryBuilderWithModelType>> = (props) => {
  const { formData } = useForm();
  const { modelType: modelTypeExpression } = props;

  let modelType = modelTypeExpression ? evaluateString(modelTypeExpression, { data: formData }) : null;


  if (typeof formData?.entityTypeShortAlias == 'object' && formData.entityTypeShortAlias.hasOwnProperty('_code')) {

    modelType = new Function('data', formData?.entityTypeShortAlias?._code)({ data: formData });
  }

  return (
    <ConditionalWrap
      condition={Boolean(modelType)}
      wrap={(content) => <MetadataProvider modelType={modelType}>{content}</MetadataProvider>}
    >
      <QueryBuilderWrapper>{props.children}</QueryBuilderWrapper>
    </ConditionalWrap>
  );
};
