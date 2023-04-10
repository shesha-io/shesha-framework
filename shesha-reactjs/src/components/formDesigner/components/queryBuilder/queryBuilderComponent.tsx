import React, { FC } from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup } from '../../../../providers/form/models';
import { FilterOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';
import settingsFormJson from './settingsForm.json';
import QueryBuilderField from './queryBuilderField';
import { useForm, useQueryBuilder, useTableViewSelectorConfigurator } from '../../../../providers';
import { validateConfigurableComponentSettings, evaluateString } from '../../../../providers/form/utils';
import { Alert, Typography } from 'antd';
import { QueryBuilderWithModelType } from './queryBuilderWithModelType';
import { IQueryBuilderComponentProps } from './interfaces';

const settingsForm = settingsFormJson as FormMarkup;

const QueryBuilderComponent: IToolboxComponent<IQueryBuilderComponentProps> = {
  type: 'queryBuilder',
  name: 'Query Builder',
  icon: <FilterOutlined />,
  //dataTypes: [DataTypes.string],
  factory: (model: IQueryBuilderComponentProps) => {
    const { formMode } = useForm();
    return (<QueryBuilder {...model} readOnly={formMode === 'readonly'}></QueryBuilder>);
  },
  settingsFormMarkup: settingsForm,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

const QueryBuilder: FC<IQueryBuilderComponentProps> = props => {
  const queryBuilder = useQueryBuilder(false);

  return queryBuilder ? (
    <QueryBuilderComponentRenderer {...props}></QueryBuilderComponentRenderer>
  ) : (
    <QueryBuilderWithModelType modelType={props.modelType}>
      <QueryBuilderComponentRenderer {...props}></QueryBuilderComponentRenderer>
    </QueryBuilderWithModelType>
  );
};

export const QueryBuilderComponentRenderer: FC<IQueryBuilderComponentProps> = props => {
  const { formMode, formData } = useForm();
  const { fieldsUnavailableHint, useExpression: useExpressionFromProps } = props;
  const { selectedItemId, items } = useTableViewSelectorConfigurator(false) ?? {}; // note: it should be outside the QueryBuilder component!

  // TODO: implement combined components which support both expressions/functions and custom values like date/datetime and remove the `useExpression` property
  const useExpression =
    useExpressionFromProps === true ||
    (typeof useExpressionFromProps === 'string' && evaluateString(useExpressionFromProps, { data: formData }) === 'true') ||
    items?.find(({ id }) => id === selectedItemId)?.useExpression === true;

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

  const fields = queryBuilder?.fields || [];
  const fetchFields = queryBuilder?.fetchFields;

  return !fieldsAvailable && fieldsUnavailableHint ? (
    <ConfigurableFormItem model={props}>
      <Typography.Text type="secondary">{fieldsUnavailableHint}</Typography.Text>
    </ConfigurableFormItem>
  ) : (
    <ConfigurableFormItem model={props}>
      <QueryBuilderField
        fields={fields}
        fetchFields={fetchFields}
        jsonExpanded={props.jsonExpanded}
        useExpression={useExpression}
        readOnly={props.readOnly}
      />
    </ConfigurableFormItem>
  );
};

export default QueryBuilderComponent;
