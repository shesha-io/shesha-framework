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
import { getBackgroundStyle } from '@/designer-components/_settings/utils/background/utils';
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
import { BackendRepositoryType } from '@/providers/dataTable/repository/backendRepository';

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
    return props?.allStyles?.fontStyles?.textAlign ?? props?.font?.align;
  }, [props?.allStyles?.fontStyles?.textAlign, props?.font?.align]);

  // Convert background object to CSS string
  const effectiveBackground = useMemo(() => {
    const bgStyles = getBackgroundStyle(props?.background, undefined);

    // Build complete background CSS string with all properties
    const parts: string[] = [];

    // Add image or color
    if (bgStyles.backgroundImage) {
      parts.push(bgStyles.backgroundImage);
    } else if (bgStyles.backgroundColor) {
      return bgStyles.backgroundColor; // Color doesn't need size/position
    }

    // Add position if present
    if (bgStyles.backgroundPosition) {
      parts.push(String(bgStyles.backgroundPosition));
    }

    // Add size if present (must come after position with / separator)
    if (bgStyles.backgroundSize) {
      // If position exists, add size with / separator, otherwise add it separately
      if (bgStyles.backgroundPosition) {
        parts[parts.length - 1] = `${parts[parts.length - 1]} / ${String(bgStyles.backgroundSize)}`;
      } else {
        parts.push(`/ ${String(bgStyles.backgroundSize)}`);
      }
    }

    // Add repeat if present
    if (bgStyles.backgroundRepeat) {
      parts.push(String(bgStyles.backgroundRepeat));
    }

    return parts.length > 0 ? parts.join(' ') : undefined;
  }, [props?.background]);

  const { styles } = useStyles({
    // Use resolved font styles from allStyles to properly handle device-specific styling
    fontFamily: props?.allStyles?.fontStyles?.fontFamily ?? props?.font?.type,
    fontWeight: props?.allStyles?.fontStyles?.fontWeight ?? props?.font?.weight,
    textAlign: props?.allStyles?.fontStyles?.textAlign ?? props?.font?.align,
    color: props?.allStyles?.fontStyles?.color ?? props?.font?.color,
    fontSize: props?.allStyles?.fontStyles?.fontSize
      ? parseInt(props.allStyles.fontStyles.fontSize as string, 10)
      : props?.font?.size,
    striped: props?.striped,
    hoverHighlight: props?.hoverHighlight,
    enableStyleOnReadonly: props?.enableStyleOnReadonly,
    readOnly: props?.readOnly,
    rowBackgroundColor: props?.rowBackgroundColor,
    rowAlternateBackgroundColor: props?.rowAlternateBackgroundColor,
    rowHoverBackgroundColor: props?.rowHoverBackgroundColor,
    rowSelectedBackgroundColor: props?.rowSelectedBackgroundColor,
    border: props?.border,
    backgroundColor: effectiveBackground,
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

      if (baseStyle) {
        const {
          // Remove border properties if border prop is set
          border: borderProp,
          borderTop,
          borderRight,
          borderBottom,
          borderLeft,
          borderWidth,
          borderStyle: borderStyleProp,
          borderColor,
          borderRadius: borderRadiusProp,
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
          // Remove background properties to prevent duplicate application
          background,
          backgroundColor,
          backgroundImage,
          backgroundSize,
          backgroundPosition,
          backgroundRepeat,
          backgroundAttachment,
          backgroundOrigin,
          backgroundClip,
          ...styleWithoutBorderAndBackground
        } = baseStyle;

        // Only remove border properties if props.border is set
        if (props.border) {
          return styleWithoutBorderAndBackground;
        }

        // Remove background properties but keep border properties
        return {
          borderProp,
          borderTop,
          borderRight,
          borderBottom,
          borderLeft,
          borderWidth,
          borderStyle: borderStyleProp,
          borderColor,
          borderRadius: borderRadiusProp,
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
          ...styleWithoutBorderAndBackground,
        };
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
    getRepository,
  } = useDataTableStore();

  const { totalRows } = useDataTable();
  const repositoryType = getRepository?.()?.repositoryType;
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
  }, [isDesignMode, formDesigner, metadata?.metadata, configuredColumns, id, isEntitySource]);

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
            backgroundColor={effectiveBackground}
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
            bodyFontFamily={props?.allStyles?.fontStyles?.fontFamily ?? props?.font?.type}
            bodyFontSize={props?.allStyles?.fontStyles?.fontSize
              ? (props.allStyles.fontStyles.fontSize as string)
              : (props?.font?.size ? `${props.font.size}px` : undefined)}
            bodyFontWeight={props?.allStyles?.fontStyles?.fontWeight ?? props?.font?.weight}
            bodyFontColor={props?.allStyles?.fontStyles?.color ?? props?.font?.color as string}
            actionIconSize={props.actionIconSize}
            actionIconColor={props.actionIconColor}
          />
        </div>
      </div>
    </SidebarContainer>
  );
};
