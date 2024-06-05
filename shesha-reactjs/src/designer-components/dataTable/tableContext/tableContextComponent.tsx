import React from 'react';
import settingsFormJson from './settingsForm.json';
import { FormMarkup } from '@/providers/form/models';
import { IToolboxComponent } from '@/interfaces';
import { LayoutOutlined } from '@ant-design/icons';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { TableContext } from './tableContext';
import { ITableContextComponentProps } from './models';
import { migrateFormApi } from '@/designer-components/_common-migrations/migrateFormApi1';

const settingsForm = settingsFormJson as FormMarkup;

const TableContextComponent: IToolboxComponent<ITableContextComponentProps> = {
  type: 'datatableContext',
  name: 'DataTable Context',
  icon: <LayoutOutlined />,
  isOutput: true,
  isInput: true,
  Factory: ({ model }) => {
    return model.hidden ? null : <TableContext {...model} />;
  },
  migrator: (m) =>
    m
      .add<ITableContextComponentProps>(0, (prev) => ({...prev, name: prev['uniqueStateId'] ?? prev['name']}))
      .add<ITableContextComponentProps>(1, (prev) => ({...prev, sourceType: 'Entity'}))
      .add<ITableContextComponentProps>(2, (prev) => ({...prev, defaultPageSize: 10}))
      .add<ITableContextComponentProps>(3, (prev) => ({...prev, dataFetchingMode: 'paging'}))
      .add<ITableContextComponentProps>(4, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<ITableContextComponentProps>(5, (prev) => ({ ...prev, sortMode: 'standard', strictSortOrder: 'asc', allowReordering: 'no' }))
      .add<ITableContextComponentProps>(6, (prev) => migrateVisibility(prev))
      .add<ITableContextComponentProps>(7, (prev) => ({...migrateFormApi.properties(prev)}))
  ,
  settingsFormMarkup: settingsForm,
  validateSettings: (model) => validateConfigurableComponentSettings(settingsForm, model),
  getFieldsToFetch: (propertyName, rawModel) => {
    return rawModel.sourceType === 'Form' ? [propertyName] : [];
  },
};

export default TableContextComponent;