import React, { FC } from 'react';
import { useForm, useQueryBuilder } from 'providers';
import { Alert, Typography } from 'antd';
import { IQueryBuilderProps } from './models';
import QueryBuilderPlain from './queryBuilderPlain';

export const QueryBuilderPlainRenderer: FC<IQueryBuilderProps> = props => {
  const { fieldsUnavailableHint } = props;

  const queryBuilder = useQueryBuilder(false);
  const { formMode } = useForm();

  const fieldsAvailable = Boolean(queryBuilder);
  if (!fieldsAvailable && formMode === 'designer' && !fieldsUnavailableHint)
    return (
      <Alert
        className="sha-designer-warning"
        message="Fields are not available. Wrap Query Builder with a QueryBuilderProvider/MetadataProvider or specify `Entity`"
        type="warning"
      />
    );

  return !fieldsAvailable && fieldsUnavailableHint ? (
    <Typography.Text type="secondary">{fieldsUnavailableHint}</Typography.Text>
  ) : (
    <QueryBuilderPlain
      onChange={props?.onChange}
      value={props?.value}
      readOnly={props.readOnly}
    />
  );
};
