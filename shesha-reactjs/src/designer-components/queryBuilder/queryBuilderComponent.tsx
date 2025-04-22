import React from 'react';
import settingsFormJson from './settingsForm.json';
import { FilterOutlined } from '@ant-design/icons';
import { FormMarkup } from '@/providers/form/models';
import { IQueryBuilderComponentProps } from './interfaces';
import { IToolboxComponent } from '@/interfaces';
import { migrateCustomFunctions, migratePropertyName, migrateReadOnly } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { evaluateString, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { QueryBuilder } from './queryBuilder';

const settingsForm = settingsFormJson as FormMarkup;

const QueryBuilderComponent: IToolboxComponent<IQueryBuilderComponentProps> = {
  type: 'queryBuilder',
  name: 'Query Builder',
  icon: <FilterOutlined />,
  isInput: true,
  isOutput: true,
  canBeJsSetting: true,
  //dataTypes: [DataTypes.string],
  calculateModel: (model, allData) => ({
    modelType: model.modelType ? evaluateString(model.modelType, { data: allData.data }) : null,
  }),
  Factory: ({ model, calculatedModel }) => {
    return <QueryBuilder {...model} modelType={calculatedModel.modelType} readOnly={model.readOnly}></QueryBuilder>;
  },
  settingsFormMarkup: settingsForm,
  migrator: (m) => m
    .add<IQueryBuilderComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IQueryBuilderComponentProps>(1, (prev) => migrateVisibility(prev))
    .add<IQueryBuilderComponentProps>(2, (prev) => migrateReadOnly(prev))
  ,
  validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
};

export default QueryBuilderComponent;
