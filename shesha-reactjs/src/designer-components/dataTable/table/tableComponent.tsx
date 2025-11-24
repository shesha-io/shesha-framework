import React from 'react';
import { getSettings } from './tableSettings';
import { IDataColumnsProps, isActionColumnProps } from '@/providers/datatableColumnsConfigurator/models';
import { ITableComponentProps, TableComponentDefinition } from './models';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateNavigateAction } from '@/designer-components/_common-migrations/migrate-navigate-action';
import { migrateV0toV1 } from './migrations/migrate-v1';
import { migrateV1toV2 } from './migrations/migrate-v2';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { SheshaActionOwners } from '@/providers/configurableActionsDispatcher/models';
import { TableOutlined } from '@ant-design/icons';
import { TableWrapper } from './tableWrapper';
import { migrateFormApi } from '@/designer-components/_common-migrations/migrateFormApi1';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { isPropertySettings } from '@/designer-components/_settings/utils';
import { migratePrevStyles } from '@/designer-components/_common-migrations/migrateStyles';
import { StandaloneTable } from './standaloneTable';
import { useDataTableStore } from '@/providers/dataTable';
import { defaultStyles } from './utils';


// Factory component that conditionally renders TableWrapper or StandaloneTable based on data context
const TableComponentFactory: React.FC<{ model: ITableComponentProps }> = ({ model }) => {
  const store = useDataTableStore(false);

  if (model.hidden) return null;

  // Show TableWrapper when inside DataContext (even with no columns, to allow auto-configuration)
  // Show StandaloneTable only when outside DataContext
  if (store) {
    return <TableWrapper {...model} />;
  } else {
    return <StandaloneTable {...model} />;
  }
};

const TableComponent: TableComponentDefinition = {
  type: 'datatable',
  isInput: true,
  name: 'Data Table',
  icon: <TableOutlined />,
  Factory: ({ model }) => {
    return <TableComponentFactory model={model} />;
  },
  initModel: (model: ITableComponentProps) => {
    return {
      ...model,
      items: [],
    };
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  migrator: (m) =>
    m
      .add<ITableComponentProps>(0, (prev) => {
        const items = prev['items'] && Array.isArray(prev['items']) ? prev['items'] : [];
        return {
          ...prev,
          items: items,
          useMultiselect: prev['useMultiselect'] ?? false,
          selectionMode: prev['selectionMode'] ?? 'none',
          crud: prev['crud'] ?? false,
          flexibleHeight: prev['flexibleHeight'] ?? false,
        };
      })
      .add<ITableComponentProps>(1, migrateV0toV1)
      .add<ITableComponentProps>(2, migrateV1toV2)
      .add<ITableComponentProps>(3, (prev) => ({
        ...prev,
        canEditInline: 'no',
        inlineEditMode: 'one-by-one',
        inlineSaveMode: 'manual',
        canAddInline: 'no',
        newRowCapturePosition: 'top',
        newRowInsertPosition: 'top',
        canDeleteInline: 'no',
      }))
      .add<ITableComponentProps>(4, (prev) => ({
        ...prev,
        onRowSaveSuccessAction: prev['onRowSaveSuccess'] && typeof (prev['onRowSaveSuccess']) === 'string'
          ? {
            _type: undefined,
            actionOwner: SheshaActionOwners.Common,
            actionName: 'Execute Script',
            actionArguments: {
              expression: prev['onRowSaveSuccess'],
            },
            handleFail: false,
            handleSuccess: false,
          }
          : null,
      }))
      .add<ITableComponentProps>(5, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<ITableComponentProps>(6, (prev) => {
        const columns = (prev.items ?? []).map((c) => (c.columnType === 'data' ? { ...c, allowSorting: true } as IDataColumnsProps : c));
        return { ...prev, items: columns };
      })
      .add<ITableComponentProps>(7, (prev) => migrateVisibility(prev))
      .add<ITableComponentProps>(8, (prev) => ({ ...prev, onRowSaveSuccessAction: migrateNavigateAction(prev.onRowSaveSuccessAction) }))
      .add<ITableComponentProps>(9, (prev) => ({
        ...prev, items: (prev.items ?? []).map((item) => {
          return isActionColumnProps(item)
            ? { ...item, actionConfiguration: migrateNavigateAction(item.actionConfiguration) }
            : item;
        }),
      }))
      .add<ITableComponentProps>(10, (prev) => ({
        ...migrateFormApi.properties(prev),
        onNewRowInitialize: migrateFormApi.full(prev.onNewRowInitialize),
        onRowSave: migrateFormApi.full(prev.onRowSave),
      }))
      .add<ITableComponentProps>(11, (prev) => ({
        ...prev,
        noDataText: prev.noDataText ?? 'No Data',
        noDataSecondaryText: prev.noDataSecondaryText ?? 'No data is available for this table',
      }))
      .add<ITableComponentProps>(12, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),
  actualModelPropertyFilter: (name, value) => name !== 'items' || isPropertySettings(value),
};

export default TableComponent;
