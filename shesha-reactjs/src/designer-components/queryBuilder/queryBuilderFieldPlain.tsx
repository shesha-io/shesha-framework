import { Alert, Typography } from 'antd';
import { useForm, useQueryBuilderOrUndefined } from '@/providers';
import React, { FC } from 'react';
import { IQueryBuilderProps } from './models';
import QueryBuilderPlain from './queryBuilderPlain';
import { isDefined } from '@/utils/nullables';

export const QueryBuilderPlainRenderer: FC<IQueryBuilderProps> = (props) => {
  const { fieldsUnavailableHint } = props;

  const queryBuilder = useQueryBuilderOrUndefined();
  const { formMode } = useForm();

  const fieldsAvailable = isDefined(queryBuilder);
  if (!fieldsAvailable && formMode === 'designer' && !fieldsUnavailableHint)
    return (
      <Alert
        className="sha-designer-warning"
        title="Fields are not available. Wrap Query Builder with a QueryBuilderProvider/MetadataProvider or specify `Entity`"
        type="warning"
      />
    );

  return !fieldsAvailable && fieldsUnavailableHint ? (
    <Typography.Text type="secondary">{fieldsUnavailableHint}</Typography.Text>
  ) : (
    <QueryBuilderPlain
      onChange={props.onChange}
      value={props.value}
      readOnly={props.readOnly}
    />
  );
};
