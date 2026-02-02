import React, { useMemo } from 'react';
import { getSettings } from './tableSettings';
import { ColumnsItemProps, IDataColumnsProps, isActionColumnProps } from '@/providers/datatableColumnsConfigurator/models';
import { ITableComponentProps, TableComponentDefinition } from './models';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateNavigateAction } from '@/designer-components/_common-migrations/migrate-navigate-action';
import { migrateV0toV1 } from './migrations/migrate-v1';
import { migrateV1toV2 } from './migrations/migrate-v2';
import { migrateV12toV13 } from './migrations/migrate-v13';
import { migrateV15toV16 } from './migrations/migrate-v16';
import { migrateV17toV18 } from './migrations/migrate-v18';
import { migrateV18toV19 } from './migrations/migrate-v19';
import { migrateV24toV25 } from './migrations/migrate-v25';
import { migrateV25toV26 } from './migrations/migrate-v26';
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
import { collectMetadataPropertyPaths, defaultStyles, flattenConfiguredColumns, getDataColumnAccessor, getTableDefaults, getTableSettingsDefaults } from './utils';
import { useComponentValidation } from '@/providers/validationErrors';
import { parseFetchError } from '../utils';
import { useMetadata } from '@/providers/metadata';
import { isPropertiesArray } from '@/interfaces/metadata';
import { BackendRepositoryType } from '@/providers/dataTable/repository/backendRepository';

const columnsMismatchError = 'CONFIGURATION ERROR: The DataTable columns do not match the data source. Please change the columns configured to suit your data source.';

// Factory component that conditionally renders TableWrapper or StandaloneTable based on data context
const TableComponentFactory: React.FC<{ model: ITableComponentProps }> = ({ model }) => {
  const store = useDataTableStore(false);
  const metadata = useMetadata(false);
  const repositoryType = store?.getRepository?.()?.repositoryType;
  const isEntitySource = repositoryType === BackendRepositoryType;
  const configuredColumns = useMemo(
    () => flattenConfiguredColumns(model.items as ColumnsItemProps[]),
    [model.items],
  );
  const metadataProperties = useMemo(
    () => (metadata && isPropertiesArray(metadata.metadata?.properties) ? metadata.metadata.properties : []),
    [metadata, metadata?.metadata],
  );
  const metadataPropertyNameSet = useMemo(
    () => new Set(collectMetadataPropertyPaths(metadataProperties)),
    [metadataProperties],
  );
  const dataColumns = useMemo(
    () => configuredColumns.filter((column) => column.columnType === 'data'),
    [configuredColumns],
  );
  const invalidDataColumns = useMemo(
    () => dataColumns.filter((column) => {
      const candidate = getDataColumnAccessor(column);
      if (!candidate) return true; // Empty candidates are invalid

      // Check if the full path exists
      if (metadataPropertyNameSet.has(candidate)) return false; // Valid - filter out

      // For nested properties (e.g., "module.name"), check if the root property exists
      if (candidate.includes('.')) {
        const firstSegment = candidate.split('.')[0];
        if (metadataPropertyNameSet.has(firstSegment)) return false; // Valid - filter out
      }

      return true; // Invalid - keep in the list
    }),
    [dataColumns, metadataPropertyNameSet],
  );
  const columnsMismatch = useMemo(
    () => isEntitySource &&
      dataColumns.length > 0 &&
      metadataPropertyNameSet.size > 0 &&
      invalidDataColumns.length > 0 &&
      invalidDataColumns.length === dataColumns.length, // Only error when ALL columns are invalid
    [dataColumns.length, metadataPropertyNameSet.size, invalidDataColumns.length, isEntitySource],
  );

  // CRITICAL: Register validation errors - FormComponent will display them
  // Must be called before any conditional returns (React Hooks rules)
  useComponentValidation(
    () => {
      const errors: Array<{ propertyName: string; error: string }> = [];

      // Parse fetch errors from the store
      if (store?.fetchTableDataError) {
        errors.push(...parseFetchError(store.fetchTableDataError));
      }

      const exportError = store?.exportToExcelError ?? store?.error?.exportToExcel;
      if (exportError) {
        errors.push(...parseFetchError(exportError));
      }

      // Check for missing context error
      if (!store) {
        errors.push({
          propertyName: 'Missing Required Parent Component',
          error: 'CONFIGURATION ERROR: DataTable MUST be placed inside a Data Context component.\nThis component cannot function without a data source.',
        });
      }

      if (columnsMismatch) {
        errors.push({
          propertyName: 'Column Mismatches',
          error: columnsMismatchError,
        });
      }

      // Return validation result if there are errors
      if (errors.length > 0) {
        return {
          hasErrors: true,
          validationType: 'error' as const,
          errors,
        };
      }

      return undefined;
    },
    [store, store?.fetchTableDataError, store?.exportToExcelError, store?.error?.exportToExcel, columnsMismatch],
  );

  if (model.hidden) return null;

  // Show TableWrapper when inside DataContext (even with no columns, to allow auto-configuration)
  // Show StandaloneTable only when outside DataContext
  if (store) {
    return <TableWrapper {...model} columnsMismatch={columnsMismatch} />;
  } else {
    return <StandaloneTable {...model} />;
  }
};

const TableComponent: TableComponentDefinition = {
  type: 'datatable',
  isInput: true,
  isOutput: true,
  name: 'Data Table',
  icon: <TableOutlined />,
  Factory: ({ model }) => {
    return <TableComponentFactory model={model} />;
  },
  initModel: (model: ITableComponentProps) => {
    const defaults = defaultStyles();
    const tableDefaults = getTableDefaults();
    const tableSettingsDefaults = getTableSettingsDefaults();

    const defaultRowDimensions = {
      height: 'auto',
      minHeight: 'auto',
      maxHeight: 'auto',
    };

    return {
      items: [],
      rowDimensions: defaultRowDimensions,
      ...defaults,
      ...tableDefaults,
      ...tableSettingsDefaults,
      ...model,
      // Ensure device-specific rowDimensions are also defaulted to auto
      mobile: {
        ...model.mobile,
        rowDimensions: model.mobile?.rowDimensions ?? defaultRowDimensions,
      },
      tablet: {
        ...model.tablet,
        rowDimensions: model.tablet?.rowDimensions ?? defaultRowDimensions,
      },
      desktop: {
        ...model.desktop,
        rowDimensions: model.desktop?.rowDimensions ?? defaultRowDimensions,
      },
    };
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  validateModel: (model, addModelError) => {
    // CRITICAL: Validate that table has columns configured
    const hasColumns = model.items && Array.isArray(model.items) && model.items.length > 0;
    if (!hasColumns) {
      addModelError('items', 'Configure at least one column in the settings panel');
    }

    // Note: DataContext validation is now handled via useComponentValidation hook in the Factory function
  },
  migrator: (m) =>
    m
      .add<ITableComponentProps>(0, (prev) => {
        const items = prev['items'] && Array.isArray(prev['items']) ? prev['items'] : [];
        return {
          ...prev,
          items: items,
          useMultiselect: prev['useMultiselect'] ?? false,
          selectionMode: prev['selectionMode'] ?? 'single',
          crud: prev['crud'] ?? false,
          flexibleHeight: prev['flexibleHeight'] ?? false,
          striped: prev['striped'] ?? true,
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
      .add<ITableComponentProps>(12, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) }))
      .add<ITableComponentProps>(13, migrateV12toV13)
      .add<ITableComponentProps>(14, (prev) => ({ ...prev, striped: true }))
      .add<ITableComponentProps>(15, (prev) => ({ ...prev, striped: prev.striped ?? true }))
      .add<ITableComponentProps>(16, migrateV15toV16)
      .add<ITableComponentProps>(17, (prev) => ({
        ...prev,
        rowHeight: prev.rowHeight ?? '40px',
        rowPadding: prev.rowPadding ?? '8px 12px',
        rowBorder: prev.rowBorder ?? '1px solid #f0f0f0',
        headerFontSize: prev.headerFontSize ?? '14px',
        headerFontWeight: prev.headerFontWeight ?? '600',
      }))
      .add<ITableComponentProps>(18, migrateV17toV18)
      .add<ITableComponentProps>(19, migrateV18toV19)
      .add<ITableComponentProps>(20, (prev) => ({ ...prev, hoverHighlight: prev.hoverHighlight ?? true }))
      .add<ITableComponentProps>(21, (prev) => ({
        ...prev,
        rowDimensions: prev.rowDimensions ?? { height: 'auto', minHeight: 'auto', maxHeight: 'auto' },
      }))
      .add<ITableComponentProps>(22, (prev) => ({
        ...prev,
        rowAlternateBackgroundColor: prev.rowAlternateBackgroundColor ?? '#f5f5f5',
        headerFontWeight: prev.headerFontWeight ?? '500',
        headerBackgroundColor: prev.headerBackgroundColor ?? '#fafafa',
      }))
      .add<ITableComponentProps>(23, (prev) => ({
        ...prev,
        striped: prev.striped ?? true,
        mobile: {
          ...prev.mobile,
          striped: prev.striped ?? true,
        },
        tablet: {
          ...prev.tablet,
          striped: prev.striped ?? true,
        },
        desktop: {
          ...prev.desktop,
          striped: prev.striped ?? true,
        },
      }))
      .add<ITableComponentProps>(24, (prev) => {
        // Migrate rowStylingBox to individual padding fields
        if (prev.rowStylingBox?.padding) {
          const { padding } = prev.rowStylingBox;
          return {
            ...prev,
            rowPaddingTop: padding.top,
            rowPaddingRight: padding.right,
            rowPaddingBottom: padding.bottom,
            rowPaddingLeft: padding.left,
            mobile: {
              ...prev.mobile,
              rowPaddingTop: padding.top,
              rowPaddingRight: padding.right,
              rowPaddingBottom: padding.bottom,
              rowPaddingLeft: padding.left,
            },
            tablet: {
              ...prev.tablet,
              rowPaddingTop: padding.top,
              rowPaddingRight: padding.right,
              rowPaddingBottom: padding.bottom,
              rowPaddingLeft: padding.left,
            },
            desktop: {
              ...prev.desktop,
              rowPaddingTop: padding.top,
              rowPaddingRight: padding.right,
              rowPaddingBottom: padding.bottom,
              rowPaddingLeft: padding.left,
            },
          };
        }
        return prev;
      })
      .add<ITableComponentProps>(25, migrateV24toV25)
      .add<ITableComponentProps>(26, migrateV25toV26)
      .add<ITableComponentProps>(27, (prev) => ({
        ...prev,
        hoverHighlight: true,
        mobile: {
          ...prev.mobile,
          hoverHighlight: true,
        },
        tablet: {
          ...prev.tablet,
          hoverHighlight: true,
        },
        desktop: {
          ...prev.desktop,
          hoverHighlight: true,
        },
      }))
      .add<ITableComponentProps>(28, (prev) => {
        const updateRowHeight = (dimensions?: { height?: string; minHeight?: string; maxHeight?: string }): { height?: string; minHeight?: string; maxHeight?: string } | undefined => {
          if (dimensions?.height === '40px') {
            return { ...dimensions, height: 'auto' };
          }
          return dimensions;
        };

        return {
          ...prev,
          rowHeight: prev.rowHeight === '40px' ? 'auto' : prev.rowHeight,
          rowDimensions: updateRowHeight(prev.rowDimensions),
          mobile: {
            ...prev.mobile,
            rowHeight: prev.mobile?.rowHeight === '40px' ? 'auto' : prev.mobile?.rowHeight,
            rowDimensions: updateRowHeight(prev.mobile?.rowDimensions),
          },
          tablet: {
            ...prev.tablet,
            rowHeight: prev.tablet?.rowHeight === '40px' ? 'auto' : prev.tablet?.rowHeight,
            rowDimensions: updateRowHeight(prev.tablet?.rowDimensions),
          },
          desktop: {
            ...prev.desktop,
            rowHeight: prev.desktop?.rowHeight === '40px' ? 'auto' : prev.desktop?.rowHeight,
            rowDimensions: updateRowHeight(prev.desktop?.rowDimensions),
          },
        };
      })
      .add<ITableComponentProps>(29, (prev) => ({
        ...prev,
        // Set default actionIconSize for existing tables
        actionIconSize: prev.actionIconSize ?? '14px',
      })),
  actualModelPropertyFilter: (name, value) => {
    // Allow all styling properties through to the settings form
    const allowedStyleProperties = [
      // Old properties (deprecated but kept for backward compatibility)
      'rowHeight', 'rowPadding', 'rowBorder',
      // New structured properties
      'rowDimensions', 'rowStylingBox', 'rowBorderStyle',
      'headerFontSize', 'headerFontWeight',
      'tableSettings', // For nested structure
    ];

    return (name !== 'items' || isPropertySettings(value)) || allowedStyleProperties.includes(name);
  },
};

export default TableComponent;
