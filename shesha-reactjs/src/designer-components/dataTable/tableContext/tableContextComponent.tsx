import React from 'react';
import { DatabaseOutlined } from '@ant-design/icons';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { TableContext } from './tableContext';
import { ITableContextComponentProps, TableContextComponentDefinition } from './models';
import { migrateFormApi } from '@/designer-components/_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { isEntityTypeIdEmpty } from '@/providers/metadataDispatcher/entities/utils';

/**
 * Data Context component (dataContext)
 * This is the new clean implementation of the data context component.
 * Legacy datatableContext components will be automatically migrated to this type.
 */
const TableContextComponent: TableContextComponentDefinition = {
  type: 'dataContext',
  isInput: true,
  isOutput: true,
  name: 'Data Context',
  icon: <DatabaseOutlined />,
  Factory: ({ model }) => {
    return model.hidden ? null : <TableContext {...model} />;
  },
  migrator: (m) =>
    m
      .add<ITableContextComponentProps>(0, (prev) => ({
        ...prev, name: prev['uniqueStateId'] ?? prev['name'],
        sourceType: 'Entity',
        entityType: 'Shesha.Core.DummyTable',
        dataFetchingMode: 'paging',
        defaultPageSize: 10,
        sortMode: 'standard',
        strictSortOrder: 'asc',
        allowReordering: 'no',
      }))
      .add<ITableContextComponentProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<ITableContextComponentProps>(2, (prev) => migrateVisibility(prev))
      .add<ITableContextComponentProps>(3, (prev) => ({ ...migrateFormApi.properties(prev) })),
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  getFieldsToFetch: (propertyName, rawModel) => {
    return rawModel.sourceType === 'Form' ? [propertyName] : [];
  },
  validateModel: (model, addModelError) => {
    if (!model.sourceType) addModelError('sourceType', 'Select `Source type` on the settings panel');
    if (model.sourceType === 'Entity' && isEntityTypeIdEmpty(model.entityType)) addModelError('entityType', 'Select `Entity Type` on the settings panel');
    if (model.sourceType === 'Url' && !model.endpoint) addModelError('endpoint', 'Select `Custom Endpoint` on the settings panel');
    if (model.sourceType === 'Form' && !model.propertyName) addModelError('propertyName', 'Select `propertyName` on the settings panel');
  },
};

export default TableContextComponent;