import React, {
  FC,
  Fragment,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { collectMetadataPropertyPaths, filterVisibility, calculateDefaultColumns, convertRowDimensionsToHeight, convertRowBorderStyleToBorder, convertRowStylingBoxToPadding, convertRowPaddingFieldsToPadding, flattenConfiguredColumns, getDataColumnAccessor } from './utils';
import { getStyle } from '@/providers/form/utils';
import { ITableComponentProps } from './models';
import { getShadowStyle } from '@/designer-components/_settings/utils/shadow/utils';
import {
  SidebarContainer,
  DataTable,
  DatatableAdvancedFilter,
  DatatableColumnsSelector,
} from '@/components';
import {
  useDataTable,
  useDataTableStore,
  useForm,
  useFormData,
  useGlobalState,
  useSheshaApplication,
} from '@/providers';
import { GlobalTableStyles } from './styles/styles';
import { useDeepCompareEffect } from '@/hooks/useDeepCompareEffect';
import { FilterList } from '../filterList/filterList';
import { useStyles } from './styles';
import { useMetadata } from '@/providers/metadata';
import { useFormDesignerOrUndefined } from '@/providers/formDesigner';
import { StandaloneTable } from './standaloneTable';
import { isPropertiesArray } from '@/interfaces/metadata';
import { ColumnsItemProps } from '@/providers/datatableColumnsConfigurator/models';

type TableWrapperProps = ITableComponentProps & { columnsMismatch?: boolean };

export const TableWrapper: FC<TableWrapperProps> = (props) => {
  const { id, items: configuredColumns, useMultiselect, selectionMode, tableStyle, containerStyle, columnsMismatch } = props;

  const { formMode } = useForm();
  const { data: formData } = useFormData();
  const { globalState } = useGlobalState();
  const { anyOfPermissionsGranted } = useSheshaApplication();
  const isDesignMode = formMode === 'designer';
  const metadata = useMetadata(false); // Don't require - DataTable may not be in a DataSource
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
    () => (metadata && isPropertiesArray(metadata.metadata?.properties) ? metadata.metadata.properties : []),
    [metadata?.metadata],
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
    () => permissibleColumns.some((col) => col.columnType && col.columnType !== 'data'),
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

  const shadowStyles = useMemo(() => getShadowStyle(props?.shadow), [props?.shadow]);

  const finalBoxShadow = useMemo(() => {
    return props?.shadow ? shadowStyles?.boxShadow : props?.boxShadow;
  }, [props?.shadow, shadowStyles?.boxShadow, props?.boxShadow]);

  const effectiveRowHeight = useMemo(() => {
    const converted = convertRowDimensionsToHeight(props?.rowDimensions);
    return converted || props?.rowHeight;
  }, [props?.rowDimensions, props?.rowHeight]);

  const effectiveRowPadding = useMemo(() => {
    // Try new individual padding fields first
    const convertedFromFields = convertRowPaddingFieldsToPadding(
      props?.rowPaddingTop,
      props?.rowPaddingRight,
      props?.rowPaddingBottom,
      props?.rowPaddingLeft,
    );

    // Fall back to deprecated rowStylingBox for backward compatibility
    const convertedFromBox = convertRowStylingBoxToPadding(props?.rowStylingBox);

    return convertedFromFields || convertedFromBox || props?.rowPadding;
  }, [props?.rowPaddingTop, props?.rowPaddingRight, props?.rowPaddingBottom, props?.rowPaddingLeft, props?.rowStylingBox, props?.rowPadding]);

  const effectiveRowBorder = useMemo(() => {
    const converted = convertRowBorderStyleToBorder(props?.rowBorderStyle);
    return converted || props?.rowBorder;
  }, [props?.rowBorderStyle, props?.rowBorder]);

  // Compute effective header font values with backward compatibility
  const effectiveHeaderFontFamily = useMemo(() => {
    return props?.headerFont?.type ?? props?.headerFontFamily;
  }, [props?.headerFont?.type, props?.headerFontFamily]);

  const effectiveHeaderFontSize = useMemo(() => {
    return props?.headerFont?.size ? `${props.headerFont.size}px` : props?.headerFontSize;
  }, [props?.headerFont?.size, props?.headerFontSize]);

  const effectiveHeaderFontWeight = useMemo(() => {
    return props?.headerFont?.weight ?? props?.headerFontWeight;
  }, [props?.headerFont?.weight, props?.headerFontWeight]);

  const effectiveHeaderTextColor = useMemo(() => {
    return props?.headerFont?.color ?? props?.headerTextColor;
  }, [props?.headerFont?.color, props?.headerTextColor]);

  const effectiveHeaderTextAlign = useMemo(() => {
    return props?.headerFont?.align;
  }, [props?.headerFont?.align]);

  const effectiveBodyTextAlign = useMemo(() => {
    return props?.font?.align;
  }, [props?.font?.align]);

  const { styles } = useStyles({
    fontFamily: props?.font?.type,
    fontWeight: props?.font?.weight,
    textAlign: props?.font?.align,
    color: props?.font?.color,
    fontSize: props?.font?.size,
    striped: props?.striped,
    hoverHighlight: props?.hoverHighlight,
    enableStyleOnReadonly: props?.enableStyleOnReadonly,
    readOnly: props?.readOnly,
    rowBackgroundColor: props?.rowBackgroundColor,
    rowAlternateBackgroundColor: props?.rowAlternateBackgroundColor,
    rowHoverBackgroundColor: props?.rowHoverBackgroundColor,
    rowSelectedBackgroundColor: props?.rowSelectedBackgroundColor,
    border: props?.border,
    backgroundColor: props?.background?.color,
    headerFontFamily: effectiveHeaderFontFamily,
    headerFontSize: effectiveHeaderFontSize,
    headerFontWeight: effectiveHeaderFontWeight,
    headerBackgroundColor: props?.headerBackgroundColor,
    headerTextColor: effectiveHeaderTextColor,
    rowHeight: effectiveRowHeight,
    rowPadding: effectiveRowPadding,
    rowBorder: effectiveRowBorder,
    boxShadow: finalBoxShadow,
    sortableIndicatorColor: props?.sortableIndicatorColor,
  });

  const finalStyle = useMemo(() => {
    if (props.allStyles) {
      let baseStyle;
      if (!props.enableStyleOnReadonly && props.readOnly) {
        baseStyle = {
          ...props.allStyles.fontStyles,
          ...props.allStyles.dimensionsStyles,
        };
      } else {
        baseStyle = props.allStyles.fullStyle;
      }

      if (props.border && baseStyle) {
        const {
          border,
          borderTop,
          borderRight,
          borderBottom,
          borderLeft,
          borderWidth,
          borderStyle,
          borderColor,
          borderRadius,
          borderTopWidth,
          borderRightWidth,
          borderBottomWidth,
          borderLeftWidth,
          borderTopStyle,
          borderRightStyle,
          borderBottomStyle,
          borderLeftStyle,
          borderTopColor,
          borderRightColor,
          borderBottomColor,
          borderLeftColor,
          borderTopLeftRadius,
          borderTopRightRadius,
          borderBottomLeftRadius,
          borderBottomRightRadius,
          ...styleWithoutBorder
        } = baseStyle;
        return styleWithoutBorder;
      }
      return baseStyle;
    }
    return {};
  }, [props.enableStyleOnReadonly, props.readOnly, props.allStyles, props.border]);

  const {
    isInProgress: { isFiltering, isSelectingColumns },
    setIsInProgressFlag,
    registerConfigurableColumns,
    selectedRow,
    setMultiSelectedRow,
    requireColumns,
    allowReordering,
    clearFilters,
    removeColumnFilter,
    tableFilter,
    contextValidation,
  } = useDataTableStore();

  const { totalRows } = useDataTable();

  requireColumns(); // our component requires columns loading. it's safe to call on each render

  useDeepCompareEffect(() => {
    // Register columns if:
    // 1. At least one column matches metadata properties, OR
    // 2. There are no configured columns (empty state), OR
    // 3. There are non-data columns that don't need to match metadata
    if (qualifyingColumns.length > 0 || normalizedConfiguredColumns.length === 0 || hasNonDataColumns)
      registerConfigurableColumns(id, permissibleColumns);
    // Note: registerConfigurableColumns is omitted from dependencies to avoid effect re-runs
    // when the actions object is recreated. The effect only needs to re-run when the actual
    // column configuration changes (qualifyingColumns, normalizedConfiguredColumns, etc.)
  }, [qualifyingColumns.length, normalizedConfiguredColumns.length, hasNonDataColumns, id, permissibleColumns]);

  // Auto-configure columns when DataTable is dropped into a DataContext
  useEffect(() => {
    let cancelled = false;

    // Only attempt auto-config if we have empty configuredColumns and haven't tried yet
    if (hasAutoConfiguredRef.current || !isDesignMode || !formDesigner) {
      return () => {
        cancelled = true;
      };
    }

    // Check if we should auto-configure
    const hasNoColumns = !configuredColumns || configuredColumns.length === 0;
    const hasMetadata = metadata?.metadata != null;

    if (!hasNoColumns || !hasMetadata) {
      return () => {
        cancelled = true;
      };
    }

    // Mark as attempted to prevent multiple triggers
    hasAutoConfiguredRef.current = true;

    const autoConfigureColumns = async (): Promise<void> => {
      try {
        // Guard against metadata becoming undefined after initial check
        if (!metadata?.metadata) return;

        const defaultColumns = await calculateDefaultColumns(metadata.metadata);
        if (!cancelled && defaultColumns.length > 0) {
          formDesigner.updateComponent({
            componentId: id,
            settings: {
              ...props,
              items: defaultColumns,
            } as ITableComponentProps,
          });
        }
      } catch {
        // Reset flag to allow retry if it failed (only if not cancelled)
        if (!cancelled) {
          hasAutoConfiguredRef.current = false;
        }
      }
    };

    autoConfigureColumns();

    return () => {
      cancelled = true;
    };
  }, [isDesignMode, formDesigner, metadata?.metadata, configuredColumns, id]);

  const renderSidebarContent = (): JSX.Element => {
    if (isFiltering) {
      return <DatatableAdvancedFilter />;
    }

    if (isSelectingColumns) {
      return <DatatableColumnsSelector />;
    }

    return <Fragment />;
  };

  const hasNoColumns = !configuredColumns || configuredColumns.length === 0;

  // Check if DataContext has configuration errors (not just info messages)
  const hasContextConfigErrorsOrWarnings = contextValidation?.hasErrors && (contextValidation?.validationType === 'warning' || contextValidation?.validationType === 'error');

  const toggleFieldPropertiesSidebar = (): void => {
    if (!isSelectingColumns && !isFiltering) setIsInProgressFlag({ isFiltering: true });
    else setIsInProgressFlag({ isFiltering: false, isSelectingColumns: false });
  };

  // In designer mode, show StandaloneTable if:
  // 1. Columns were deliberately deleted (hasAutoConfiguredRef.current means auto-config was attempted)
  // 2. Parent DataContext has configuration errors
  const shouldShowStandalone = hasNoColumns && hasAutoConfiguredRef.current;

  if (isDesignMode && (shouldShowStandalone || hasContextConfigErrorsOrWarnings)) {
    return <StandaloneTable {...props} />;
  }

  return (
    <SidebarContainer
      rightSidebarProps={{
        onOpen: toggleFieldPropertiesSidebar,
        open: Boolean(isSelectingColumns || isFiltering),
        onClose: toggleFieldPropertiesSidebar,
        title: 'Table Columns',
        content: renderSidebarContent,
      }}
      allowFullCollapse
    >
      <GlobalTableStyles />
      {tableFilter?.length > 0 && <FilterList filters={tableFilter} rows={totalRows} clearFilters={clearFilters} removeColumnFilter={removeColumnFilter} />}

      <div className="sha-datatable-wrapper">
        <div className={styles.dataTable} style={finalStyle}>
          <DataTable
            onRowDeleteSuccessAction={props.onRowDeleteSuccessAction}
            onMultiRowSelect={setMultiSelectedRow}
            selectedRowIndex={selectedRow?.index}
            columnsMismatch={columnsMismatch}
            useMultiselect={useMultiselect}
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
            backgroundColor={props.background?.color}
            headerFont={props.headerFont}
            headerFontFamily={effectiveHeaderFontFamily}
            headerFontSize={effectiveHeaderFontSize}
            headerFontWeight={effectiveHeaderFontWeight}
            headerBackgroundColor={props.headerBackgroundColor}
            headerTextColor={effectiveHeaderTextColor}
            headerTextAlign={effectiveHeaderTextAlign}
            bodyTextAlign={effectiveBodyTextAlign}
            rowHeight={effectiveRowHeight}
            rowPadding={effectiveRowPadding}
            rowBorder={effectiveRowBorder}
            rowBorderStyle={props.rowBorderStyle}
            boxShadow={finalBoxShadow}
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
            bodyFontFamily={props?.font?.type}
            bodyFontSize={props?.font?.size ? `${props.font.size}px` : undefined}
            bodyFontWeight={props?.font?.weight}
            bodyFontColor={props?.font?.color}
          />
        </div>
      </div>
    </SidebarContainer>
  );
};
