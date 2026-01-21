import React, {
  FC,
  Fragment,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { filterVisibility, calculateDefaultColumns, convertRowDimensionsToHeight, convertRowBorderStyleToBorder, convertRowStylingBoxToPadding, convertRowPaddingFieldsToPadding } from './utils';
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

export const TableWrapper: FC<ITableComponentProps> = (props) => {
  const { id, items, useMultiselect, selectionMode, tableStyle, containerStyle } = props;

  const { formMode } = useForm();
  const { data: formData } = useFormData();
  const { globalState } = useGlobalState();
  const { anyOfPermissionsGranted } = useSheshaApplication();
  const isDesignMode = formMode === 'designer';
  const metadata = useMetadata(false); // Don't require - DataTable may not be in a DataSource
  const formDesigner = useFormDesignerOrUndefined();
  const hasAutoConfiguredRef = useRef(false);
  const componentIdRef = useRef(id);

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
    if (isDesignMode) {
      console.warn('Row Height - rowDimensions:', props?.rowDimensions, 'converted:', converted, 'fallback:', props?.rowHeight);
    }
    return converted || props?.rowHeight;
  }, [props?.rowDimensions, props?.rowHeight, isDesignMode]);

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

    if (isDesignMode) {
      console.warn('Row Padding - individual fields:', {
        top: props?.rowPaddingTop,
        right: props?.rowPaddingRight,
        bottom: props?.rowPaddingBottom,
        left: props?.rowPaddingLeft,
      }, 'converted:', convertedFromFields, 'fallback rowStylingBox:', props?.rowStylingBox, 'converted:', convertedFromBox, 'final fallback:', props?.rowPadding);
    }

    return convertedFromFields || convertedFromBox || props?.rowPadding;
  }, [props?.rowPaddingTop, props?.rowPaddingRight, props?.rowPaddingBottom, props?.rowPaddingLeft, props?.rowStylingBox, props?.rowPadding, isDesignMode]);

  const effectiveRowBorder = useMemo(() => {
    const converted = convertRowBorderStyleToBorder(props?.rowBorderStyle);
    if (isDesignMode) {
      console.warn('Row Border - rowBorderStyle:', props?.rowBorderStyle, 'converted:', converted, 'fallback:', props?.rowBorder);
    }
    return converted || props?.rowBorder;
  }, [props?.rowBorderStyle, props?.rowBorder, isDesignMode]);

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
    // register columns
    const permissibleColumns = isDesignMode
      ? items
      : items
        ?.filter(({ permissions }) => anyOfPermissionsGranted(permissions || []))
        .filter(filterVisibility({ data: formData, globalState }));

    registerConfigurableColumns(id, permissibleColumns);
  }, [items, isDesignMode]);

  // Auto-configure columns when DataTable is dropped into a DataContext
  useEffect(() => {
    // Only attempt auto-config if we have empty items and haven't tried yet
    if (hasAutoConfiguredRef.current || !isDesignMode || !formDesigner) {
      return;
    }

    // Check if we should auto-configure
    const hasNoColumns = !items || items.length === 0;
    const hasMetadata = metadata?.metadata != null;

    if (!hasNoColumns || !hasMetadata) {
      return;
    }

    // Mark as attempted to prevent multiple triggers
    hasAutoConfiguredRef.current = true;

    const autoConfigureColumns = async (): Promise<void> => {
      try {
        const defaultColumns = await calculateDefaultColumns(metadata.metadata);
        if (defaultColumns.length > 0) {
          formDesigner.updateComponent({
            componentId: id,
            settings: {
              ...props,
              items: defaultColumns,
            } as ITableComponentProps,
          });
        }
      } catch (error) {
        console.warn('Failed to auto-configure DataTable columns:', error);
        // Reset flag to allow retry if it failed
        hasAutoConfiguredRef.current = false;
      }
    };

    autoConfigureColumns();
  }, [isDesignMode, formDesigner, metadata?.metadata, items, id]);

  const renderSidebarContent = (): JSX.Element => {
    if (isFiltering) {
      return <DatatableAdvancedFilter />;
    }

    if (isSelectingColumns) {
      return <DatatableColumnsSelector />;
    }

    return <Fragment />;
  };

  const hasNoColumns = !items || items.length === 0;

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
