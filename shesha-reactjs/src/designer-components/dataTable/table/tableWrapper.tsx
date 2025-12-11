import React, {
  FC,
  Fragment,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { filterVisibility, calculateDefaultColumns, convertRowDimensionsToHeight, convertRowStylingBoxToPadding, convertRowBorderStyleToBorder } from './utils';
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

  // Reset auto-config flag when component ID changes (new DataTable instance)
  useEffect(() => {
    if (componentIdRef.current !== id) {
      componentIdRef.current = id;
      hasAutoConfiguredRef.current = false;
    }
  }, [id]);

  // Process shadow settings using getShadowStyle utility
  const shadowStyles = useMemo(() => getShadowStyle(props?.shadow), [props?.shadow]);
  const finalBoxShadow = useMemo(() => {
    // If there's a shadow object, use the processed styles, otherwise use the boxShadow string
    return props?.shadow ? shadowStyles?.boxShadow : props?.boxShadow;
  }, [props?.shadow, shadowStyles?.boxShadow, props?.boxShadow]);

  // Convert new property structures to old format for backward compatibility
  const effectiveRowHeight = useMemo(() => {
    // Prefer new rowDimensions over old rowHeight
    const converted = convertRowDimensionsToHeight(props?.rowDimensions);
    if (isDesignMode) {
      console.warn('Row Height - rowDimensions:', props?.rowDimensions, 'converted:', converted, 'fallback:', props?.rowHeight);
    }
    return converted || props?.rowHeight;
  }, [props?.rowDimensions, props?.rowHeight, isDesignMode]);

  const effectiveRowPadding = useMemo(() => {
    // Prefer new rowStylingBox over old rowPadding
    const converted = convertRowStylingBoxToPadding(props?.rowStylingBox);
    if (isDesignMode) {
      console.warn('Row Padding - rowStylingBox:', props?.rowStylingBox, 'converted:', converted, 'fallback:', props?.rowPadding);
    }
    return converted || props?.rowPadding;
  }, [props?.rowStylingBox, props?.rowPadding, isDesignMode]);

  const effectiveRowBorder = useMemo(() => {
    // Prefer new rowBorderStyle over old rowBorder
    const converted = convertRowBorderStyleToBorder(props?.rowBorderStyle);
    if (isDesignMode) {
      console.warn('Row Border - rowBorderStyle:', props?.rowBorderStyle, 'converted:', converted, 'fallback:', props?.rowBorder);
    }
    return converted || props?.rowBorder;
  }, [props?.rowBorderStyle, props?.rowBorder, isDesignMode]);

  const { styles } = useStyles({
    fontFamily: props?.font?.type,
    fontWeight: props?.font?.weight,
    textAlign: props?.font?.align,
    color: props?.font?.color,
    fontSize: props?.font?.size,
    striped: props?.striped,
    hoverHighlight: props?.hoverHighlight,
    stickyHeader: props?.stickyHeader,
    enableStyleOnReadonly: props?.enableStyleOnReadonly,
    readOnly: props?.readOnly,
    rowBackgroundColor: props?.rowBackgroundColor,
    rowAlternateBackgroundColor: props?.rowAlternateBackgroundColor,
    rowHoverBackgroundColor: props?.rowHoverBackgroundColor,
    rowSelectedBackgroundColor: props?.rowSelectedBackgroundColor,
    border: props?.border,
    backgroundColor: props?.background?.color,
    headerFontSize: props?.headerFontSize,
    headerFontWeight: props?.headerFontWeight,
    headerBackgroundColor: props?.headerBackgroundColor,
    headerTextColor: props?.headerTextColor,
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

      // Remove border properties from the outer container when border is being passed to DataTable
      // This prevents double borders
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
    getRepository,
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

  const repository = getRepository();

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
  const hasContextConfigErrors = contextValidation?.hasErrors && contextValidation?.validationType === 'warning';

  const toggleFieldPropertiesSidebar = (): void => {
    if (!isSelectingColumns && !isFiltering) setIsInProgressFlag({ isFiltering: true });
    else setIsInProgressFlag({ isFiltering: false, isSelectingColumns: false });
  };

  // In designer mode, show StandaloneTable if:
  // 1. Columns were deliberately deleted (hasAutoConfiguredRef.current means auto-config was attempted)
  // 2. Parent DataContext has configuration errors
  const shouldShowStandalone = hasNoColumns && hasAutoConfiguredRef.current;

  if (isDesignMode && (shouldShowStandalone || hasContextConfigErrors)) {
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
            freezeHeaders={props.stickyHeader || props.freezeHeaders}
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
            headerFontSize={props.headerFontSize}
            headerFontWeight={props.headerFontWeight}
            headerBackgroundColor={props.headerBackgroundColor}
            headerTextColor={props.headerTextColor}
            rowHeight={effectiveRowHeight}
            rowPadding={effectiveRowPadding}
            rowBorder={effectiveRowBorder}
            rowBorderStyle={props.rowBorderStyle}
            boxShadow={finalBoxShadow}
            sortableIndicatorColor={props.sortableIndicatorColor}
          />
        </div>
      </div>
    </SidebarContainer>
  );
};
