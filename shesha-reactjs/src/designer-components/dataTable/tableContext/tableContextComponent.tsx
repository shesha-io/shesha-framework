import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { DatabaseOutlined } from '@ant-design/icons';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { TableContext } from './tableContext';
import { ITableContextComponentProps } from './models';
import { migrateFormApi } from '@/designer-components/_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';

const TableContextComponent: IToolboxComponent<ITableContextComponentProps> = {
  type: 'datatableContext',
  isInput: true,
  isOutput: true,
  name: 'Data Context',
  icon: <DatabaseOutlined />,
  Factory: ({ model }) => {
    return model.hidden ? null : <TableContext {...model} />;
  },
  initModel: (model) => {
    // Only set defaults for completely new components (when dragging from toolbox)
    const isNewComponent = !model.sourceType && !model.entityType;

    if (isNewComponent) {
      return {
        ...model,
        sourceType: 'Entity',
        entityType: 'Shesha.Domain.FormConfiguration',
        dataFetchingMode: 'paging',
        defaultPageSize: 10,
      };
    }

    return model;
  },
  migrator: (m) =>
    m
      .add<ITableContextComponentProps>(0, (prev) => ({ ...prev, name: prev['uniqueStateId'] ?? prev['name'] }))
      .add<ITableContextComponentProps>(1, (prev) => ({ ...prev, sourceType: 'Entity' }))
      .add<ITableContextComponentProps>(2, (prev) => ({ ...prev, defaultPageSize: 10 }))
      .add<ITableContextComponentProps>(3, (prev) => ({ ...prev, dataFetchingMode: 'paging' }))
      .add<ITableContextComponentProps>(4, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<ITableContextComponentProps>(5, (prev) => ({ ...prev, sortMode: 'standard', strictSortOrder: 'asc', allowReordering: 'no' }))
      .add<ITableContextComponentProps>(6, (prev) => migrateVisibility(prev))
      .add<ITableContextComponentProps>(7, (prev) => ({ ...migrateFormApi.properties(prev) })),
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  getFieldsToFetch: (propertyName, rawModel) => {
    return rawModel.sourceType === 'Form' ? [propertyName] : [];
  },
  validateModel: (model, addModelError) => {
    if (!model.sourceType) addModelError('sourceType', 'Select `Source type` on the settings panel');
    if (model.sourceType === 'Entity' && !model.entityType) addModelError('entityType', 'Select `Entity Type` on the settings panel');
    if (model.sourceType === 'Url' && !model.endpoint) addModelError('endpoint', 'Select `Custom Endpoint` on the settings panel');
    if (model.sourceType === 'Form' && !model.propertyName) addModelError('propertyName', 'Select `propertyName` on the settings panel');
  },
};

export default TableContextComponent;
