import React from 'react';
import { getSettings } from './tableSettings';
import { IDataColumnsProps, isActionColumnProps } from '@/providers/datatableColumnsConfigurator/models';
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
import { defaultStyles, getTableDefaults, getTableSettingsDefaults } from './utils';
import { useComponentValidation } from '@/providers/validationErrors';
import { useForm } from '@/providers/form';
import { useIsInsideDataContext } from '@/utils/form/useComponentHierarchyCheck';

// Factory component that conditionally renders TableWrapper or StandaloneTable based on data context
const TableComponentFactory: React.FC<{ model: ITableComponentProps }> = ({ model }) => {
  const store = useDataTableStore(false);
  const { formMode } = useForm();

  // Use stable hook that only recomputes when actual hierarchy changes
  const isInsideDataContextInMarkup = useIsInsideDataContext(model.id);

  // Only show validation error in designer mode when component is not inside DataContext
  const shouldShowMissingContextError = formMode === 'designer' && !isInsideDataContextInMarkup;

  // Parse fetch errors from the store
  const parseFetchError = React.useCallback((error: any): Array<{ propertyName: string; error: string }> | null => {
    if (!error) return null;

    // Handle Axios error format (error.response.data contains ABP response)
    const abpResponse = error?.response?.data || error;

    // Handle ABP error format
    if (abpResponse?.error) {
      const { error: abpError } = abpResponse;
      const errors = [];

      // Add validation errors (these are the field-specific messages we want)
      if (abpError.validationErrors && Array.isArray(abpError.validationErrors)) {
        abpError.validationErrors.forEach((ve: any) => {
          errors.push({
            propertyName: ve.members?.[0] || 'Field Error',
            error: ve.message, // This is "Cannot query field 'description' on type 'Area'."
          });
        });
      }

      // Only add main message if we don't have validation errors
      if (errors.length === 0 && abpError.message) {
        errors.push({
          propertyName: 'Data Fetch Error',
          error: abpError.message,
        });
      }

      // Add details if present and helpful
      if (errors.length === 1 && abpError.details && abpError.details !== abpError.message) {
        errors.push({
          propertyName: 'Details',
          error: abpError.details,
        });
      }

      return errors.length > 0 ? errors : null;
    }

    // Fallback to generic error message
    if (error?.message) {
      return [{
        propertyName: 'Data Fetch Error',
        error: error.message,
      }];
    }

    if (typeof error === 'string') {
      return [{
        propertyName: 'Data Fetch Error',
        error,
      }];
    }

    return [{
      propertyName: 'Data Fetch Error',
      error: 'An unknown error occurred while fetching data',
    }];
  }, []);

  // Memoize validation errors
  const missingContextError = React.useMemo(() => ({
    hasErrors: true,
    validationType: 'error' as const,
    errors: [{
      propertyName: 'Missing Required Parent Component',
      error: 'CONFIGURATION ERROR: Data Table MUST be placed inside a Data Context component. This component cannot function without a data source.',
    }],
  }), []);

  const fetchError = React.useMemo(() => {
    if (!store?.fetchTableDataError) return undefined;

    const parsedErrors = parseFetchError(store.fetchTableDataError);
    if (!parsedErrors) return undefined;

    return {
      hasErrors: true,
      validationType: 'error' as const,
      errors: parsedErrors,
    };
  }, [store?.fetchTableDataError, parseFetchError]);

  // CRITICAL: Register validation errors - FormComponent will display them
  // Must be called before any conditional returns (React Hooks rules)
  // Priority: Fetch errors > Missing context error
  useComponentValidation(
    () => {
      if (formMode !== 'designer') return undefined;
      if (fetchError) return fetchError;
      if (shouldShowMissingContextError) return missingContextError;
      return undefined;
    },
    [formMode, fetchError, shouldShowMissingContextError, missingContextError],
  );

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

    return {
      items: [],
      rowDimensions: {
        height: '40px',
        minHeight: 'auto',
        maxHeight: 'auto',
      },
      ...defaults,
      ...tableDefaults,
      ...tableSettingsDefaults,
      ...model,
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
        rowDimensions: prev.rowDimensions ?? { height: '40px' },
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
      .add<ITableComponentProps>(25, migrateV24toV25),
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
