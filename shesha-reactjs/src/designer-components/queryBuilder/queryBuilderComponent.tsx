import { FilterOutlined } from '@ant-design/icons';
import { Alert, Typography } from 'antd';
import { useForm, useQueryBuilder } from '../../providers';
import React, { FC } from 'react';
import ConfigurableFormItem from '../../components/formDesigner/components/formItem';
import { IToolboxComponent } from '../../interfaces';
import { FormMarkup } from '../../providers/form/models';
import { validateConfigurableComponentSettings } from '../../providers/form/utils';
import { IQueryBuilderComponentProps } from './interfaces';
import QueryBuilderField from './queryBuilderField';
import { QueryBuilderWithModelType } from './queryBuilderWithModelType';
import settingsFormJson from './settingsForm.json';
import { migrateCustomFunctions, migratePropertyName } from '../../designer-components/_common-migrations/migrateSettings';

const settingsForm = settingsFormJson as FormMarkup;

const QueryBuilderComponent: IToolboxComponent<IQueryBuilderComponentProps> = {
  type: 'queryBuilder',
  name: 'Query Builder',
  icon: <FilterOutlined />,
  //dataTypes: [DataTypes.string],
  Factory: ({ model }) => {
    const { formMode } = useForm();
    return <QueryBuilder {...model} readOnly={formMode === 'readonly'}></QueryBuilder>;
  },
  settingsFormMarkup: settingsForm,
  migrator: (m) => m
    .add<IQueryBuilderComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
  ,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

const QueryBuilder: FC<IQueryBuilderComponentProps> = (props) => {
  const queryBuilder = useQueryBuilder(false);

  return queryBuilder ? (
    <QueryBuilderComponentRenderer {...props}></QueryBuilderComponentRenderer>
  ) : (
    <QueryBuilderWithModelType modelType={props.modelType}>
      <QueryBuilderComponentRenderer {...props}></QueryBuilderComponentRenderer>
    </QueryBuilderWithModelType>
  );
};

export const QueryBuilderComponentRenderer: FC<IQueryBuilderComponentProps> = (props) => {
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
        return <QueryBuilderField
          value={value}
          onChange={onChange}
          jsonExpanded={props.jsonExpanded}
          readOnly={props.readOnly}
        />;
      }}
    </ConfigurableFormItem>
  );
};

export default QueryBuilderComponent;
