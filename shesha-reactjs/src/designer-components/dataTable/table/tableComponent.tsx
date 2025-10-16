import React, { useCallback, useEffect } from 'react';
import { getSettings } from './tableSettings';
import { IDataColumnsProps, isActionColumnProps } from '@/providers/datatableColumnsConfigurator/models';
import { ITableComponentProps } from './models';
import { IToolboxComponent, DataTypes } from '@/interfaces';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateNavigateAction } from '@/designer-components/_common-migrations/migrate-navigate-action';
import { migrateV0toV1 } from './migrations/migrate-v1';
import { migrateV1toV2 } from './migrations/migrate-v2';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { SheshaActionOwners } from '@/providers/configurableActionsDispatcher/models';
import { TableOutlined } from '@ant-design/icons';
import { TableWrapper } from './tableWrapper';
import { useDataTableStore } from '@/providers';
import { useMetadata } from '@/providers/metadata';
import { IModelMetadata, IPropertyMetadata, isPropertiesArray } from '@/interfaces/metadata';
import { migrateFormApi } from '@/designer-components/_common-migrations/migrateFormApi1';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { isPropertySettings } from '@/designer-components/_settings/utils';
import { migratePrevStyles } from '@/designer-components/_common-migrations/migrateStyles';
import { defaultStyles } from './utils';
import { StandaloneTable } from './standaloneTable';
import { toCamelCase } from '@/utils/string';

// Auditing columns to exclude from default column generation
const AUDITING_COLUMNS = [
  'id',
  'isDeleted',
  'deleterUserId',
  'deletionTime',
  'lastModificationTime',
  'lastModifierUserId',
  'creationTime',
  'creatorUserId',
  'markup',
];

// Function to register filtered properties as datatable columns
const registerFilteredPropertiesAsColumns = (metadata: IModelMetadata): IDataColumnsProps[] => {
  if (!metadata || !metadata.properties) {
    console.warn('❌ No metadata available for column registration');
    return [];
  }

  const properties = isPropertiesArray(metadata.properties)
    ? metadata.properties
    : [];

  // Filter out auditing columns and framework-related properties (same as filterAndRegisterProperties)
  const filteredProperties = properties.filter((prop: IPropertyMetadata) => {
    const columnName = prop.path || prop.columnName || '';
    const isAuditing = AUDITING_COLUMNS.includes(columnName.toLowerCase());
    const isFramework = prop.isFrameworkRelated;
    return !isAuditing && !isFramework;
  });

  // Get properties suitable for table columns
  const tableColumns = filteredProperties.filter((property: IPropertyMetadata) => {
    return property.dataType === DataTypes.string ||
      property.dataType === DataTypes.number ||
      property.dataType === DataTypes.boolean ||
      property.dataType === DataTypes.date ||
      property.dataType === DataTypes.dateTime;
  });

  // Create IDataColumnsProps from filtered properties
  const columnItems: IDataColumnsProps[] = tableColumns.map((property: IPropertyMetadata, index: number) => ({
    id: property.path || `col_${index}`,
    caption: property.path,
    description: property.description,
    columnType: 'data' as const,
    sortOrder: index,
    itemType: 'item' as const,
    isVisible: property.isVisible !== false, // Default to visible unless explicitly false
    propertyName: toCamelCase(property.path),
    allowSorting: true,
    accessor: toCamelCase(property.path),
    properyName: toCamelCase(property.path),
    dataType: property.dataType,
  }));
  return columnItems;
};

// Factory component that logs entity properties when table is placed in DataSource
const TableComponentFactory: React.FC<{ model: ITableComponentProps }> = ({ model }) => {
  const store = useDataTableStore(false);
  const metadata = useMetadata(false); // Don't require - table may not be in a DataSource

  // Handle filtered properties registration with DataSource
  const handleFilteredPropertiesRegistration = useCallback((properties: IDataColumnsProps[]) => {
    console.log('🔄 DataTable: Registering columns and triggering data update', {
      propertiesCount: properties.length,
      hasStore: !!store,
      hasRefreshTable: !!store?.refreshTable,
      modelId: model.id,
      properties: properties.map((p) => ({
        id: p.id,
        propertyName: p.propertyName,
        caption: p.caption,
      })),
    });

    if (properties.length > 0 && store?.registerConfigurableColumns) {
      // Register the filtered properties as columns with the data source
      store.registerConfigurableColumns(model.id, properties);
      console.log('✅ DataTable: Columns registered successfully');

      // Refresh the data to include the new properties
      if (store.refreshTable) {
        console.log('🔄 DataTable: Triggering data refresh with new columns...');
        store.refreshTable();
        console.log('✅ DataTable: Data refresh triggered');
      } else {
        console.warn('⚠️ DataTable: No refreshTable method available');
      }
    } else {
      console.warn('⚠️ DataTable: Cannot register columns', {
        hasProperties: properties.length > 0,
        hasStore: !!store,
        hasRegisterMethod: !!store?.registerConfigurableColumns,
      });
    }
  }, [store, model.id]);

  // Function to log entity properties for debugging
  const filterAndRegisterProperties = useCallback((metadata: IModelMetadata | null) => {
    if (!metadata || !metadata.properties) return;
    const generatedColumns = registerFilteredPropertiesAsColumns(metadata);
    if (generatedColumns.length > 0 && (!model.items || model.items.length === 0)) {
      model.items = generatedColumns;
      handleFilteredPropertiesRegistration(generatedColumns);
    }
  }, [handleFilteredPropertiesRegistration, model]);

  useEffect(() => filterAndRegisterProperties(metadata.metadata), [filterAndRegisterProperties, metadata.metadata]);

  if (model.hidden) return null;

  if (store) {
    return <TableWrapper {...model} />;
  } else {
    return <StandaloneTable {...model} />;
  }
};

const TableComponent: IToolboxComponent<ITableComponentProps> = {
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
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  migrator: (m) =>
    m
      .add<ITableComponentProps>(0, (prev) => {
        const items = prev['items'] && Array.isArray(prev['items']) ? prev['items'] : [];
        return {
          ...prev,
          items: items,
          useMultiselect: prev['useMultiselect'] ?? false,
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
