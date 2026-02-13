import React from 'react';
import { DatabaseOutlined } from '@ant-design/icons';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { ITableContextComponentProps, TableContextComponentLegacyDefinition } from './models';
import { migrateFormApi } from '@/designer-components/_common-migrations/migrateFormApi1';

/**
 * Legacy DataTable Context component (datatableContext)
 * This component definition is kept for backward compatibility with existing forms.
 * All existing migrations are preserved here.
 * New forms should use the dataContext component instead.
 * @deprecated Use dataContext component instead. This is kept only for migration of existing forms.
 */
const TableContextComponentLegacy: TableContextComponentLegacyDefinition = {
  type: 'datatableContext',
  isInput: true,
  isOutput: true,
  isHidden: true,
  name: 'Data Context (Legacy)',
  icon: <DatabaseOutlined />,
  Factory: () => {
    return null;
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
      .add<ITableContextComponentProps>(7, (prev) => ({ ...migrateFormApi.properties(prev) }))
      .add<ITableContextComponentProps>(8, (prev) => {
        return {
          ...prev,
          type: 'dataContext',
          version: undefined,
        };
      }),
};

export default TableContextComponentLegacy;
