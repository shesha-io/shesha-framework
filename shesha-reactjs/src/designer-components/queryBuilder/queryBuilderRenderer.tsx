import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import QueryBuilderField from './queryBuilderField';
import React, { FC } from 'react';
import { Alert, Typography } from 'antd';
import { IQueryBuilderComponentProps } from './interfaces';
import { useForm, useQueryBuilder } from '@/providers';

export const QueryBuilderRenderer: FC<IQueryBuilderComponentProps> = (props) => {
  const { formMode } = useForm();
  const { fieldsUnavailableHint } = props;

  const queryBuilder = useQueryBuilder(false);
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
    <ConfigurableFormItem model={props}>
      <Typography.Text type="secondary">{fieldsUnavailableHint}</Typography.Text>
    </ConfigurableFormItem>
  ) : (
    <ConfigurableFormItem model={props}>
      {(value, onChange) => {
        return (
          <QueryBuilderField
            value={value}
            onChange={onChange}
            jsonExpanded={props.jsonExpanded}
            readOnly={props.readOnly}
          />
        );
      }}
    </ConfigurableFormItem>
  );
};
