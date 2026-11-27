import { FC, Fragment, useMemo, useRef, useEffect } from 'react';
import * as React from 'react';
import { collectMetadataPropertyPaths, filterVisibility, calculateDefaultColumns, flattenConfiguredColumns, getDataColumnAccessor } from './utils';
import { getStyle } from '@/providers/form/utils';
import { ITableComponentProps } from './models';
import { SidebarContainer } from '@/components/sidebarContainer';
import { DataTable } from '@/components/dataTable';
import { DatatableAdvancedFilter } from '@/components/dataTable/advancedFilter';
import { DatatableColumnsSelector } from '@/components/dataTable/columnsSelector';
import {
  useDataTableStore,
  useForm,
  useFormData,
  useGlobalState,
  useSheshaApplication,
} from '@/providers';
import { GlobalTableStyles } from './styles/styles';
import { useDeepCompareEffect } from '@/hooks/useDeepCompareEffect';
import { FilterList } from '../filterList/filterList';
import { useMetadataOrUndefined } from '@/providers/metadata';
import { useFormDesignerOrUndefined } from '@/providers/formDesigner';
import { StandaloneTable } from './standaloneTable';
import { useTableAppearance } from './useTableAppearance';
import { isPropertiesArray } from '@/interfaces/metadata';
import { ColumnsItemProps } from '@/providers/datatableColumnsConfigurator/models';
import { BackendRepositoryType } from '@/providers/dataTable/repository/backendRepository';
import { isDefined } from '@/utils/nullables';
import { isNonEmptyArray } from '@/utils/array';

type TableWrapperProps = ITableComponentProps & { columnsMismatch?: boolean };

export const TableWrapper: FC<TableWrapperProps> = (props) => {
  const { id, items: configuredColumns, selectionMode, tableStyle, containerStyle, columnsMismatch } = props;

  const { formMode } = useForm();
  const { data: formData } = useFormData();
  const { globalState } = useGlobalState();
  const { anyOfPermissionsGranted } = useSheshaApplication();
  const appearance = useTableAppearance(props);
  const isDesignMode = formMode === 'designer';
  const metadataContext = useMetadataOrUndefined(); // Don't require - DataTable may not be in a DataSource
  const metadata = metadataContext?.metadata;
  const formDesigner = useFormDesignerOrUndefined();
  const hasAutoConfiguredRef = useRef(false);

  const componentIdRef = useRef(id);
  const normalizedConfiguredColumns = useMemo(
    () => flattenConfiguredColumns(
      Array.isArray(configuredColumns) ? configuredColumns as ColumnsItemProps[] : undefined,
    ),
    [configuredColumns],
  );
  const metadataProperties = useMemo(
    () => (isDefined(metadata) && isPropertiesArray(metadata.properties) ? metadata.properties : []),
    [metadata],
  );
  const metadataPropertyNameSet = useMemo(
    () => new Set(collectMetadataPropertyPaths(metadataProperties)),
    [metadataProperties],
  );
  const visibilityFilter = useMemo(
    () => filterVisibility({ data: formData, globalState }),
    [formData, globalState],
  );
  const permissibleColumns = useMemo(
    () => (isDesignMode
      ? normalizedConfiguredColumns
      : normalizedConfiguredColumns
        .filter(({ permissions }) => anyOfPermissionsGranted(permissions || []))
        .filter(visibilityFilter)),
    [normalizedConfiguredColumns, isDesignMode, anyOfPermissionsGranted, visibilityFilter],
  );
  const hasNonDataColumns = useMemo(
    () => permissibleColumns.some((col) => isDefined(col.columnType) && col.columnType !== 'data'),
    [permissibleColumns],
  );
  const qualifyingColumns = useMemo(
    () => permissibleColumns.filter((permissibleColumn) => {
      if (permissibleColumn.columnType !== 'data') return false;
      const candidate = getDataColumnAccessor(permissibleColumn);
      return candidate && metadataPropertyNameSet.has(candidate);
    }),
    [permissibleColumns, metadataPropertyNameSet],
  );

  useEffect(() => {
    if (componentIdRef.current !== id) {
      componentIdRef.current = id;
      hasAutoConfiguredRef.current = false;
    }
  }, [id]);


  const {
    isAdvancedFilterVisible,
    isColumnsSelectorVisible,
    toggleAdvancedFilter,
    toggleColumnsSelector,
    registerConfigurableColumns,
    selectedRow,
    setMultiSelectedRow,
    requireColumns,
    allowReordering,
    clearFilters,
    removeColumnFilter,
    tableFilter,
    contextValidation,
    getRepository,
    totalRows,
  } = useDataTableStore();

  const repositoryType = getRepository().repositoryType;
  const isEntitySource = repositoryType === BackendRepositoryType;

  requireColumns(); // our component requires columns loading. it's safe to call on each render

  const shouldRegisterColumns = !isEntitySource ||
    qualifyingColumns.length > 0 ||
    normalizedConfiguredColumns.length === 0 ||
    hasNonDataColumns;

  useDeepCompareEffect(() => {
    // Register columns if:
    // 1. At least one column matches metadata properties, OR
    // 2. There are no configured columns (empty state), OR
    // 3. There are non-data columns that don't need to match metadata
    if (shouldRegisterColumns)
      registerConfigurableColumns(id, permissibleColumns);
    // Note: registerConfigurableColumns is omitted from dependencies to avoid effect re-runs
    // when the actions object is recreated. The effect only needs to re-run when the actual
    // column configuration changes (qualifyingColumns, normalizedConfiguredColumns, etc.)
  }, [shouldRegisterColumns, id, permissibleColumns]);

  // Auto-configure columns when DataTable is dropped into a DataContext
  useEffect(() => {
    let cancelled = false;

    // Only attempt auto-config if we have empty configuredColumns and haven't tried yet
    if (hasAutoConfiguredRef.current || !isDesignMode || !formDesigner || !isEntitySource) {
      return () => {
        cancelled = true;
      };
    }

    if (isNonEmptyArray(configuredColumns)) {
      // Columns already exist - disarm permanently so a transient empty `items` never repopulates defaults
      hasAutoConfiguredRef.current = true;
      return () => {
        cancelled = true;
      };
    }

    if (!isDefined(metadata)) {
      return () => {
        cancelled = true;
      };
    }

    // Mark as attempted to prevent multiple triggers
    hasAutoConfiguredRef.current = true;

    const autoConfigureColumns = async (): Promise<void> => {
      try {
        const defaultColumns = await calculateDefaultColumns(metadata);
        if (!cancelled && defaultColumns.length > 0) {
          formDesigner.updateComponent({
            componentId: id,
            updater: (model) => ({
              ...model,
              items: defaultColumns,
            } as ITableComponentProps),
          });
        }
      } catch {
        // Reset flag to allow retry if it failed (only if not cancelled)
        if (!cancelled) {
          hasAutoConfiguredRef.current = false;
        }
      }
    };

    autoConfigureColumns().catch((error) => {
      console.error('Failed to auto-configure columns', error);
    });

    return () => {
      cancelled = true;
    };
  }, [isDesignMode, formDesigner, metadata, configuredColumns, id, isEntitySource]);

  const renderSidebarContent = (): React.JSX.Element => {
    if (isAdvancedFilterVisible) {
      return <DatatableAdvancedFilter />;
    }

    if (isColumnsSelectorVisible) {
      return <DatatableColumnsSelector />;
    }

    return <Fragment />;
  };

  const hasNoColumns = !isNonEmptyArray(configuredColumns);

  // Check if DataContext has configuration errors (not just info messages)
  const hasContextConfigErrorsOrWarnings = isDefined(contextValidation) &&
    contextValidation.hasErrors && (contextValidation.validationType === 'warning' || contextValidation.validationType === 'error');

  const toggleFieldPropertiesSidebar = (): void => {
    if (!isColumnsSelectorVisible && !isAdvancedFilterVisible)
      toggleAdvancedFilter(true);
    else {
      toggleAdvancedFilter(false);
      toggleColumnsSelector(false);
    }
  };

  // In designer mode, show StandaloneTable if:
  // 1. Columns were deliberately deleted (hasAutoConfiguredRef.current means auto-config was attempted)
  // 2. Parent DataContext has configuration errors
  const shouldShowStandalone = hasNoColumns && hasAutoConfiguredRef.current;

  if (isDesignMode && (shouldShowStandalone || hasContextConfigErrorsOrWarnings)) {
    return (
      <StandaloneTable {...props} />
    );
  }

  return (
    <SidebarContainer
      rightSidebarProps={{
        onOpen: toggleFieldPropertiesSidebar,
        open: isAdvancedFilterVisible || isColumnsSelectorVisible,
        onClose: toggleFieldPropertiesSidebar,
        title: 'Table Columns',
        content: renderSidebarContent,
      }}
      allowFullCollapse
      embedded
    >
      <GlobalTableStyles />
      {tableFilter.length > 0 && <FilterList filters={tableFilter} rows={totalRows ?? 0} clearFilters={clearFilters} removeColumnFilter={removeColumnFilter} />}

      <div className="sha-datatable-wrapper">
        <div className={appearance.wrapperClassName} style={appearance.wrapperStyle}>
          <DataTable
            onRowDeleteSuccessAction={props.onRowDeleteSuccessAction}
            onMultiRowSelect={setMultiSelectedRow}
            selectedRowIndex={selectedRow?.index}
            columnsMismatch={columnsMismatch}
            selectionMode={selectionMode}
            freezeHeaders={props.freezeHeaders}
            allowReordering={allowReordering}
            tableStyle={getStyle(tableStyle, formData, globalState)}
            containerStyle={getStyle(containerStyle, formData, globalState)}
            canAddInline={props.canAddInline}
            canAddInlineExpression={props.canAddInlineExpression}
            customCreateUrl={props.customCreateUrl}
            newRowCapturePosition={props.newRowCapturePosition}
            onNewRowInitialize={props.onNewRowInitialize}
            canEditInline={props.canEditInline}
            canEditInlineExpression={props.canEditInlineExpression}
            customUpdateUrl={props.customUpdateUrl}
            canDeleteInline={props.canDeleteInline}
            canDeleteInlineExpression={props.canDeleteInlineExpression}
            customDeleteUrl={props.customDeleteUrl}
            onRowSave={props.onRowSave}
            onRowSaveSuccessAction={props.onRowSaveSuccessAction}
            onDblClick={props.dblClickActionConfiguration}
            inlineSaveMode={props.inlineSaveMode}
            inlineEditMode={props.inlineEditMode}
            minHeight={props.minHeight}
            maxHeight={props.maxHeight}
            noDataText={props.noDataText}
            noDataSecondaryText={props.noDataSecondaryText}
            noDataIcon={props.noDataIcon}
            showExpandedView={props.showExpandedView}
            onRowClick={props.onRowClick}
            onRowDoubleClick={props.onRowDoubleClick}
            onRowHover={props.onRowHover}
            onRowSelect={props.onRowSelect}
            onSelectionChange={props.onSelectionChange}
            rowBackgroundColor={props.rowBackgroundColor}
            rowAlternateBackgroundColor={props.rowAlternateBackgroundColor}
            rowHoverBackgroundColor={props.rowHoverBackgroundColor}
            rowSelectedBackgroundColor={props.rowSelectedBackgroundColor}
            border={props.border}
            striped={props.striped}
            hoverHighlight={props.hoverHighlight}
            backgroundColor={appearance.backgroundColor}
            headerFont={props.headerFont}
            headerFontFamily={appearance.headerFontFamily}
            headerFontSize={appearance.headerFontSize}
            headerFontWeight={appearance.headerFontWeight}
            headerBackgroundColor={props.headerBackgroundColor}
            headerTextColor={appearance.headerTextColor}
            headerTextAlign={appearance.headerTextAlign}
            bodyTextAlign={appearance.bodyTextAlign}
            rowHeight={appearance.rowHeight}
            rowPadding={appearance.rowPadding}
            rowBorder={appearance.rowBorder}
            rowBorderStyle={props.rowBorderStyle}
            boxShadow={appearance.boxShadow}
            dimensions={props.dimensions}
            sortableIndicatorColor={props.sortableIndicatorColor}
            cellTextColor={props.cellTextColor}
            cellBackgroundColor={props.cellBackgroundColor}
            cellBorderColor={props.cellBorderColor}
            cellBorders={props.cellBorders}
            cellPadding={props.cellPadding}
            headerBorder={props.headerBorder}
            cellBorder={props.cellBorder}
            headerShadow={props.headerShadow}
            rowShadow={props.rowShadow}
            rowDividers={props.rowDividers}
            bodyFontFamily={appearance.bodyFontFamily}
            bodyFontSize={appearance.bodyFontSize}
            bodyFontWeight={appearance.bodyFontWeight}
            bodyFontColor={appearance.bodyFontColor}
            actionIconSize={props.actionIconSize}
            actionIconColor={props.actionIconColor}
          />
        </div>
      </div>
    </SidebarContainer>
  );
};
