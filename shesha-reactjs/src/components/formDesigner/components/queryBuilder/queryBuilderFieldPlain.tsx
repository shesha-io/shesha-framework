import React, { FC } from 'react';
import { useForm, useQueryBuilder, useTableViewSelectorConfigurator } from '../../../../providers';
import { Alert, Typography } from 'antd';
import { IQueryBuilderProps } from './models';
import QueryBuilderPlain from './queryBuilderPlain';

export const QueryBuilderPlainRenderer: FC<IQueryBuilderProps> = props => {
  const { fieldsUnavailableHint } = props;
  const { selectedItemId, items } = useTableViewSelectorConfigurator(false) ?? {}; // note: it should be outside the QueryBuilder component!

  // TODO: implement combined components which support both expressions/functions and custom values like date/datetime and remove the `useExpression` property
  const useExpression = items?.find(({ id }) => id === selectedItemId)?.useExpression;

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

  const fields = queryBuilder?.fields || [];
  const fetchFields = queryBuilder?.fetchFields;

  return !fieldsAvailable && fieldsUnavailableHint ? (
    <Typography.Text type="secondary">{fieldsUnavailableHint}</Typography.Text>
  ) : (
    <QueryBuilderPlain
      fields={fields}
      fetchFields={fetchFields}
      useExpression={useExpression}
      onChange={props?.onChange}
      value={props?.value}
      readOnly={props.readOnly}
    />
  );
};
