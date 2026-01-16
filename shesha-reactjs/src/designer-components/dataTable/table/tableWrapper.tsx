import React, {
  FC,
  Fragment,
  useMemo,
  useRef,
  useEffect,
} from 'react';
import { filterVisibility, calculateDefaultColumns, convertRowDimensionsToHeight, convertRowBorderStyleToBorder, convertRowStylingBoxToPadding } from './utils';
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
import { IConfigurableColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { IPropertyMetadata, NestedProperties } from '@/interfaces/metadata';
import { toCamelCase } from '@/utils/string';

export const TableWrapper: FC<ITableComponentProps> = (props) => {
  const { id, items: configuredColumns, useMultiselect, selectionMode, tableStyle, containerStyle } = props;

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
    return converted || props?.rowHeight;
  }, [props?.rowDimensions, props?.rowHeight, isDesignMode]);

  const effectiveRowPadding = useMemo(() => {
    const converted = convertRowStylingBoxToPadding(props?.rowStylingBox);
    return converted || props?.rowPadding;
  }, [props?.rowStylingBox, props?.rowPadding, isDesignMode]);

  const effectiveRowBorder = useMemo(() => {
    const converted = convertRowBorderStyleToBorder(props?.rowBorderStyle);
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
      ? configuredColumns
      : configuredColumns
        ?.filter(({ permissions }) => anyOfPermissionsGranted(permissions || []))
        .filter(filterVisibility({ data: formData, globalState }));

    // We need to check if the columns at least one exists in the store as well... otherwise the registragtion is going to fail
    const qualifyingColumns = (metadata.metadata?.properties as NestedProperties as IPropertyMetadata[] ?? []).filter((propertyMetadata) => {
      const exists = (permissibleColumns as IConfigurableColumnsProps[])
        .map((permissibleColumn: IConfigurableColumnsProps) => toCamelCase(permissibleColumn.accessor))
        .includes(toCamelCase(propertyMetadata.path));
      return exists;
    });

    if (qualifyingColumns?.length > 0 || configuredColumns?.length === 0)
      registerConfigurableColumns(id, permissibleColumns);
  }, [configuredColumns, isDesignMode, metadata]);

  // Auto-configure columns when DataTable is dropped into a DataContext
  useEffect(() => {
    // Only attempt auto-config if we have empty configuredColumns and haven't tried yet
    if (hasAutoConfiguredRef.current || !isDesignMode || !formDesigner) {
      return;
    }

    // Check if we should auto-configure
    const hasNoColumns = !configuredColumns || configuredColumns.length === 0;
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
              configuredColumns: defaultColumns,
            } as ITableComponentProps,
          });
        }
      } catch {
        // Reset flag to allow retry if it failed
        hasAutoConfiguredRef.current = false;
      }
    };

    autoConfigureColumns();
  }, [isDesignMode, formDesigner, metadata.metadata, configuredColumns, id, props]);

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
            textAlign={props.font?.align}
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
          />
        </div>
      </div>
    </SidebarContainer>
  );
};
