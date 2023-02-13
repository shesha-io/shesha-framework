import React, { FC } from 'react';
import {
  MetadataProvider,
  useForm,
} from '../../../../providers';
import { evaluateString } from '../../../../providers/form/utils';
import ConditionalWrap from '../../../conditionalWrapper';
import { QueryBuilderWrapper } from './queryBuilderWrapper';

export interface IQueryBuilderWithModelType {
  modelType?: string;
}

export const QueryBuilderWithModelType: FC<IQueryBuilderWithModelType> = props => {
  const { formData } = useForm();
  const { modelType: modelTypeExpression } = props;
  const modelType = evaluateString(modelTypeExpression, { data: formData });

  return (
    <ConditionalWrap
      condition={Boolean(modelType)}
      wrap={content => <MetadataProvider modelType={modelType}>{content}</MetadataProvider>}
    >
      <QueryBuilderWrapper>
        {props.children}
      </QueryBuilderWrapper>
    </ConditionalWrap>
  );
};