import { LoadingOutlined } from '@ant-design/icons';
import { ModalProps } from 'antd/lib/modal';
import React, { CSSProperties, FC, ReactElement, useCallback, useEffect, useMemo } from 'react';
import { Column, ColumnInstance, Row, SortingRule, TableProps } from 'react-table';
import { usePrevious } from 'react-use';
import {
  IFlatComponentsStructure,
  ROOT_COMPONENT_KEY,
  useConfigurableActionDispatcher,
  useDataTableStore,
  useMetadata,
  useShaFormInstanceOrUndefined,
} from '@/providers';
import { IColumnWidth, ITableRowData } from '@/providers/dataTable/interfaces';
import { camelcaseDotNotation, toCamelCase } from '@/utils/string';
import { RowReorderValidationError } from '@/utils/errors';
import { ReactTable } from '@/components/reactTable';
import {
  IColumnResizing,
  IReactTableProps,
  OnRowsRendering,
  OnRowsReorderedArgs,
  RowDataInitializer,
  RowRenderer,
} from '../reactTable/interfaces';
import { getCellRenderer } from './cell';
import {
  BackendRepositoryType,
  ICreateOptions,
  IDeleteOptions,
  IUpdateOptions,
} from '@/providers/dataTable/repository/backendRepository';
import { isDataColumn, ITableDataColumn } from '@/providers/dataTable/interfaces';
import {
  IColumnEditorProps,
  IFieldComponentProps,
  standardCellComponentTypes,
} from '@/providers/datatableColumnsConfigurator/models';
import { useFormDesignerComponents } from '@/providers/form/hooks';
import { executeScript, executeScriptSync, useAvailableConstantsData } from '@/providers/form/utils';
import { DataTableColumn, IShaDataTableProps, OnSaveHandler, OnSaveSuccessHandler, YesNoInheritJs } from './interfaces';
import { ValueRenderer } from '../valueRenderer/index';
import { IBorderValue } from '@/designer-components/_settings/utils/border/interfaces';
import { IShadowValue } from '@/designer-components/_settings/utils/shadow/interfaces';
import { isEqual } from 'lodash';
import { Collapse, Typography } from 'antd';
import { RowsReorderPayload } from '@/providers/dataTable/repository/interfaces';
import { adjustWidth } from './cell/utils';
import { getCellStyleAccessor } from './utils';
import { isPropertiesArray } from '@/interfaces/metadata';
import { IBeforeRowReorderArguments, IAfterRowReorderArguments } from '@/designer-components/dataTable/tableContext/models';
import { isNonEmptyArray, removeUndefinedProperties } from '@/utils/array';
import { IDimensionsValue } from '@/designer-components/_settings/utils/index';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { getNestedPropertyValue } from '@/utils/dotnotation';

export interface IIndexTableOptions {
  omitClick?: boolean;
}

export interface IIndexTableProps extends IShaDataTableProps, TableProps {
  options?: IIndexTableOptions | undefined;
  containerStyle?: CSSProperties | undefined;
  tableStyle?: CSSProperties | undefined;
  minHeight?: number | undefined;
  maxHeight?: number | undefined;
  noDataText?: string | undefined;
  noDataSecondaryText?: string | undefined;
  noDataIcon?: string | undefined;
  showExpandedView?: boolean | undefined;

  rowBackgroundColor?: string | undefined;
  rowAlternateBackgroundColor?: string | undefined;
  rowHoverBackgroundColor?: string | undefined;
  rowSelectedBackgroundColor?: string | undefined;
  borderRadius?: string | undefined;
  border?: IBorderValue | undefined;
  hoverHighlight?: boolean | undefined;
  striped?: boolean | undefined;
  backgroundColor?: string | undefined;

  // Header styling
  headerFont?: {
    type?: string | undefined;
    size?: number | undefined;
    weight?: string | undefined;
    color?: string | undefined;
    align?: string | undefined;
  } | undefined;
  headerBackgroundColor?: string | undefined;
  headerTextAlign?: string | undefined; // Alignment for header cells
  bodyTextAlign?: string | undefined; // Alignment for body cells

  // Deprecated - kept for backward compatibility
  /** @deprecated Use headerFont.type instead */
  headerFontFamily?: string | undefined;
  /** @deprecated Use headerFont.size instead */
  headerFontSize?: string | undefined;
  /** @deprecated Use headerFont.weight instead */
  headerFontWeight?: string | undefined;
  /** @deprecated Use headerFont.color instead */
  headerTextColor?: string | undefined;
  /** @deprecated Use headerTextAlign for headers or bodyTextAlign for body */
  textAlign?: string | undefined;

  // Table body styling
  rowHeight?: string | undefined;
  rowPadding?: string | undefined;
  rowBorder?: string | undefined;
  rowBorderStyle?: IBorderValue | undefined;

  // Body font styling
  bodyFontFamily?: string | undefined;
  bodyFontSize?: string | undefined;
  bodyFontWeight?: number & {} | string | undefined;
  bodyFontColor?: string | undefined;

  // Action column icon styling
  actionIconSize?: string | number | undefined;
  actionIconColor?: string | undefined;

  // Cell styling
  cellTextColor?: string | undefined | undefined;
  cellBackgroundColor?: string | undefined;
  cellBorderColor?: string | undefined;
  cellBorders?: boolean | undefined;
  cellPadding?: string | undefined;
  cellBorder?: IBorderValue | undefined;

  // Border and shadow styling
  headerBorder?: IBorderValue | undefined;
  headerShadow?: IShadowValue | undefined;
  rowShadow?: IShadowValue | undefined;
  rowDividers?: boolean | undefined;

  // Overall table styling
  boxShadow?: string | undefined;
  dimensions?: IDimensionsValue | undefined;
  sortableIndicatorColor?: string | undefined;
}

export interface IExtendedModalProps extends ModalProps {
  content?: string;
}

export const DataTable: FC<Partial<IIndexTableProps>> = ({
  selectionMode = 'none',
  selectedRowIndex,
  onSelectRow,
  onDblClick,
  onMultiRowSelect,
  onFetchDataSuccess,
  onSelectedIdsChanged,
  allowReordering,
  options,
  containerStyle,
  tableStyle,
  customCreateUrl,
  customUpdateUrl,
  customDeleteUrl,
  onRowSave,
  inlineEditMode,
  freezeHeaders,
  noDataText,
  noDataSecondaryText,
  noDataIcon,
  onRowSaveSuccessAction: onRowSaveSuccess,
  showExpandedView,
  onRowDeleteSuccessAction,
  rowBackgroundColor,
  rowAlternateBackgroundColor,
  rowHoverBackgroundColor,
  rowSelectedBackgroundColor,
  border,
  hoverHighlight,
  striped,
  onRowClick,
  onRowDoubleClick,
  onRowHover,
  onRowSelect,
  onSelectionChange,
  backgroundColor,
  headerFont,
  headerFontFamily,
  headerFontSize,
  headerFontWeight,
  headerBackgroundColor,
  headerTextColor,
  headerTextAlign,
  bodyTextAlign,
  textAlign,
  rowHeight,
  rowPadding,
  rowBorder,
  rowBorderStyle,
  boxShadow,
  dimensions,
  sortableIndicatorColor,
  bodyFontFamily,
  bodyFontSize,
  bodyFontWeight,
  bodyFontColor,
  actionIconSize,
  actionIconColor,
  columnsMismatch,
  ...props
}) => {
  const store = useDataTableStore();
  const mode = selectionMode;
  const appContext = useAvailableConstantsData();

  // Compute effective header font values with backward compatibility
  const effectiveHeaderFontFamily = headerFont?.type ?? headerFontFamily;
  const effectiveHeaderFontSize = headerFont?.size ? `${headerFont.size}px` : headerFontSize;
  const effectiveHeaderFontWeight = headerFont?.weight ?? headerFontWeight;
  const effectiveHeaderTextColor = headerFont?.color ?? headerTextColor;
  const effectiveHeaderTextAlign = headerFont?.align ?? headerTextAlign ?? textAlign;
  const effectiveBodyTextAlign = bodyTextAlign ?? textAlign; // Body uses bodyTextAlign or falls back to textAlign (deprecated)

  const {
    tableData,
    isFetchingTableData,
    totalPages,
    columns,
    groupingColumns,
    selectedRow,
    selectedIds,
    userSorting,
    onSort,
    changeSelectedIds,
    setRowData,
    setSelectedRow,
    clearSelectedRow,
    grouping,
    sortMode,
    strictSortBy,
    setColumnWidths,
    customReorderEndpoint,
    onBeforeRowReorder,
    onAfterRowReorder,
  } = store;

  const { executeAction } = useConfigurableActionDispatcher();

  const handleRowSelect = useMemo(() => {
    if (!onRowSelect?.actionName) return undefined;

    return (row: ITableRowData, rowIndex: number) => {
      const currentSelectedRow = { index: rowIndex, row: row, id: row.id };
      const evaluationContext = { ...appContext, data: row, rowIndex, selectedRow: currentSelectedRow };

      try {
        void executeAction({
          actionConfiguration: onRowSelect,
          argumentsEvaluationContext: evaluationContext,
        });
      } catch (error) {
        console.error('Error executing row select action:', error);
      }
    };
  }, [onRowSelect, appContext, executeAction]);

  // Clear all selections when selection mode changes
  const previousMode = usePrevious(mode);
  useEffect(() => {
    // Only clear if mode actually changed
    if (previousMode !== undefined && previousMode !== mode) {
      if (selectedRow && isDefined(clearSelectedRow)) {
        clearSelectedRow();
      }
      if (isNonEmptyArray(selectedIds) && isDefined(changeSelectedIds)) {
        changeSelectedIds([]);
      }
    }
  }, [mode, previousMode, selectedRow, selectedIds, setSelectedRow, changeSelectedIds, clearSelectedRow]);

  const onSelectRowLocal = (index: number, row: ITableRowData): void => {
    if (onSelectRow) {
      onSelectRow(index, row);
    }

    const rowId = row.id;
    const currentId = store.selectedRow?.id;
    if (rowId !== currentId) {
      setSelectedRow(index, row);
      if (handleRowSelect) {
        handleRowSelect(row, index);
      }
    } else {
      clearSelectedRow();
    }
  };

  const previousIds = usePrevious(selectedIds);

  useEffect(() => {
    if (
      mode === 'multiple' &&
      !(previousIds?.length === 0 && selectedIds.length === 0) &&
      typeof onSelectedIdsChanged === 'function'
    ) {
      onSelectedIdsChanged(selectedIds);
    }
  }, [mode, onSelectedIdsChanged, previousIds?.length, selectedIds]);

  useEffect(() => {
    if (!isFetchingTableData && tableData.length && onFetchDataSuccess) {
      onFetchDataSuccess();
    }
  }, [isFetchingTableData, onFetchDataSuccess, tableData.length]);

  const dblClickHandler = onDblClick;

  const entityMetadata = useMetadata(false);
  const metadata = entityMetadata?.metadata;

  const handleRowDoubleClick = useMemo(() => {
    if (!onRowDoubleClick?.actionName) return undefined;

    return (row: ITableRowData, rowIndex?: number) => {
      const currentSelectedRow = { index: rowIndex, row: row, id: row.id };
      const evaluationContext = { ...appContext, data: row, rowIndex, selectedRow: currentSelectedRow };

      try {
        void executeAction({
          actionConfiguration: onRowDoubleClick,
          argumentsEvaluationContext: evaluationContext,
        });
      } catch (error) {
        console.error('Error executing row double-click action:', error);
      }
    };
  }, [onRowDoubleClick, appContext, executeAction]);

  const handleSelectionChange = useMemo(() => {
    if (!onSelectionChange?.actionName) return undefined;

    return (selectedIds: string[]) => {
      const evaluationContext = { ...appContext, selectedIds };

      try {
        void executeAction({
          actionConfiguration: onSelectionChange,
          argumentsEvaluationContext: evaluationContext,
        });
      } catch (error) {
        console.error('Error executing selection change action:', error);
      }
    };
  }, [onSelectionChange, appContext, executeAction]);

  const combinedDblClickHandler = useCallback((rowData: ITableRowData, rowIndex?: number) => {
    if (dblClickHandler) {
      if (typeof dblClickHandler === 'function') {
        dblClickHandler(rowData, rowIndex);
      }
    }
    if (handleRowDoubleClick) {
      handleRowDoubleClick(rowData, rowIndex);
    }
  }, [dblClickHandler, handleRowDoubleClick]);

  useEffect(() => {
    if (handleSelectionChange && previousIds !== undefined) {
      // Check if the selection actually changed by comparing the arrays
      const currentIds = selectedIds;

      // Don't trigger on first selection (when moving from no selection to first selection)
      if (previousIds.length === 0 && currentIds.length > 0) {
        return; // Skip first selection - only fire when moving FROM one selection TO another
      }

      // Compare sorted arrays for efficient comparison
      const currentSorted = [...currentIds].sort();
      const prevSorted = [...previousIds].sort();

      const hasChanged = currentSorted.length !== prevSorted.length ||
        currentSorted.some((id, index) => id !== prevSorted[index]);

      if (hasChanged) {
        handleSelectionChange(currentIds);
      }
    }
  }, [selectedIds, handleSelectionChange, previousIds]);

  const toolboxComponents = useFormDesignerComponents();
  const shaForm = useShaFormInstanceOrUndefined();

  const onNewRowInitialize = useMemo<RowDataInitializer>(() => {
    const funcBody = props.onNewRowInitialize;
    const result: RowDataInitializer = !isNullOrWhiteSpace(funcBody)
      ? () => {
        // TODO: replace formData and globalState with accessors (e.g. refs) and remove hooks to prevent unneeded re-rendering
        // return onNewRowInitializeExecuter(formApi, globalState, httpClient, moment, appContextData);
        const result = executeScriptSync(funcBody, appContext) as object;
        return Promise.resolve(result);
      }
      : () => {
        return Promise.resolve({});
      };

    return result;
  }, [props.onNewRowInitialize, appContext]);

  const evaluateYesNoInheritJs = useCallback((
    value: YesNoInheritJs | undefined,
    jsExpression: string | undefined,
  ): boolean => {
    switch (value) {
      case 'yes':
        return true;
      case 'no':
        return false;
      case 'inherit':
        return appContext.form?.formMode === 'edit';
      case 'js': {
        return !isNullOrWhiteSpace(jsExpression) &&
          executeScriptSync<boolean>(jsExpression, { ...appContext, formData: appContext.data }) === true;
      }
      default:
        return false;
    }
  }, [appContext]);

  const crudOptions = useMemo(() => {
    const result = {
      canDelete: evaluateYesNoInheritJs(
        props.canDeleteInline,
        props.canDeleteInlineExpression,
      ),
      canEdit: evaluateYesNoInheritJs(
        props.canEditInline,
        props.canEditInlineExpression,
      ),
      inlineEditMode,
      formMode: appContext.form?.formMode,
      canAdd: evaluateYesNoInheritJs(props.canAddInline, props.canAddInlineExpression),
      onNewRowInitialize,
    };
    return {
      ...result,
      enabled: result.canAdd || result.canDelete || result.canEdit,
    };
  }, [evaluateYesNoInheritJs, props.canDeleteInline, props.canDeleteInlineExpression, props.canEditInline, props.canEditInlineExpression, props.canAddInline, props.canAddInlineExpression, inlineEditMode, appContext.form?.formMode, onNewRowInitialize]);

  // Check if there's a crud operations column - if so, disable row selection
  const hasCrudOperationsColumn = useMemo(() => {
    return columns.filter((c) => !!c.show).some((c) => c.columnType === 'crud-operations');
  }, [columns]);

  const preparedColumns = useMemo<Column<ITableRowData>[]>(() => {
    const localPreparedColumns = columns
      .map((column) => {
        if (column.columnType === 'crud-operations') {
          const { maxWidth, minWidth } = adjustWidth(
            {
              canDelete: props.canDeleteInline,
              canEdit: props.canEditInline,
              canAdd: props.canAddInline,
              inlineEditMode,
            },
          );
          column.minWidth = minWidth;
          column.maxWidth = maxWidth;
        }
        return column;
      })
      .filter((column) => {
        return column.show && !(column.columnType === 'crud-operations' && !crudOptions.enabled);
      })
      .map<Column<ITableRowData>>((columnItem) => {
        const strictWidth =
          columnItem.minWidth && columnItem.maxWidth && columnItem.minWidth === columnItem.maxWidth
            ? columnItem.minWidth
            : undefined;
        const width = strictWidth ?? columnItem.width;

        const cellStyleAccessor = getCellStyleAccessor(columnItem);
        const cellRenderer = getCellRenderer<ITableRowData>(columnItem, columnItem.metadata, shaForm);

        const column: DataTableColumn<ITableRowData> = {
          ...columnItem,
          // filter: columnItem.filter, // TODO V1: review and remove if unused
          accessor: camelcaseDotNotation(columnItem.accessor),
          Header: columnItem.header,
          minWidth: Boolean(columnItem.minWidth) ? columnItem.minWidth : undefined,
          maxWidth: Boolean(columnItem.maxWidth) ? columnItem.maxWidth : undefined,
          width: width,
          disableSortBy: Boolean(!columnItem.isSortable || sortMode === 'strict'),
          disableResizing: Boolean(strictWidth),
          Cell: cellRenderer,
          // custom props
          resizable: !strictWidth,
          originalConfig: columnItem,
          cellStyleAccessor: cellStyleAccessor,
        };

        return removeUndefinedProperties(column);
      });
    return localPreparedColumns;
  }, [columns, props.canDeleteInline, props.canEditInline, props.canAddInline, inlineEditMode, crudOptions.enabled, shaForm, sortMode]);

  // sort
  const defaultSorting =
    sortMode === 'standard' ? userSorting?.map<SortingRule<string>>((c) => ({ id: c.id, desc: c.desc })) : undefined;

  const performOnRowSaveSuccess = useCallback<OnSaveSuccessHandler>((data) => {
    if (!onRowSaveSuccess)
      return;

    const evaluationContext = { ...appContext, data };
    // execute the action
    void executeAction({
      actionConfiguration: onRowSaveSuccess,
      argumentsEvaluationContext: evaluationContext,
    });
  }, [onRowSaveSuccess, appContext, executeAction]);

  const performOnRowSave = useCallback<OnSaveHandler>((data) => {
    if (!isDefined(onRowSave))
      return Promise.resolve(data);

    return executeScript(onRowSave, { ...appContext, data });
  }, [onRowSave, appContext]);

  const updater = useMemo(() => (rowIndex: number, rowData: ITableRowData): Promise<ITableRowData> => {
    const repository = store.getRepository();

    return performOnRowSave(rowData).then((preparedData) => {
      const options =
        repository.repositoryType === BackendRepositoryType
          ? ({ customUrl: customUpdateUrl } as IUpdateOptions)
          : undefined;

      // use preparedData ?? rowData to handle the case when onRowSave returns undefined
      return repository.performUpdate(rowIndex, preparedData ?? rowData, options).then((response) => {
        setRowData(rowIndex, preparedData ?? rowData);
        performOnRowSaveSuccess(preparedData ?? rowData);
        return response;
      });
    });
  }, [store, performOnRowSave, customUpdateUrl, setRowData, performOnRowSaveSuccess]);

  const creater = useMemo(() => (rowData: ITableRowData): Promise<void> => {
    const repository = store.getRepository();

    return performOnRowSave(rowData).then((preparedData) => {
      const options =
        repository.repositoryType === BackendRepositoryType
          ? ({ customUrl: customCreateUrl } as ICreateOptions)
          : undefined;

      // use preparedData ?? rowData to handle the case when onRowSave returns undefined
      return repository.performCreate(0, preparedData ?? rowData, options).then(() => {
        void store.refreshTable();
        performOnRowSaveSuccess(preparedData ?? rowData);
      });
    });
  }, [store, performOnRowSave, customCreateUrl, performOnRowSaveSuccess]);

  const performOnRowDeleteSuccessAction = useCallback<OnSaveSuccessHandler>((data) => {
    if (!onRowDeleteSuccessAction)
      return;
    const evaluationContext = { ...appContext, data };
    try {
      void executeAction({
        actionConfiguration: onRowDeleteSuccessAction,
        argumentsEvaluationContext: evaluationContext,
      });
    } catch (error) {
      console.error('Error executing row delete success action:', error);
    }
  }, [onRowDeleteSuccessAction, appContext, executeAction]);


  const deleter = (rowIndex: number, rowData: ITableRowData): Promise<void> => {
    const repository = store.getRepository();

    const options =
      repository.repositoryType === BackendRepositoryType
        ? ({ customUrl: customDeleteUrl } as IDeleteOptions)
        : undefined;

    return repository.performDelete(rowIndex, rowData, options).then(() => {
      performOnRowDeleteSuccessAction(rowData);
      return store.refreshTable();
    });
  };

  const metadataProperties = metadata?.properties;
  const getCrudComponents = useCallback((
    allowEdit: boolean,
    componentAccessor: (col: ITableDataColumn) => IFieldComponentProps | undefined,
  ): IFlatComponentsStructure => {
    const result: IFlatComponentsStructure = {
      allComponents: {},
      componentRelations: {},
    };
    // don't calculate components settings when it's not required
    if (!allowEdit) return result;

    const componentIds: string[] = [];
    columns.forEach((col) => {
      if (isDataColumn(col) && !isNullOrWhiteSpace(col.columnId)) {
        const customComponent = componentAccessor(col);
        if (
          customComponent &&
          customComponent.type !== standardCellComponentTypes.notEditable &&
          customComponent.type !== standardCellComponentTypes.defaultDisplay
        ) {
          // component found
          const component = toolboxComponents[customComponent.type];
          if (!component) {
            console.error(`Datatable: component '${customComponent.type}' not found - skipped`);
            return;
          }

          const propertyMeta = isPropertiesArray(metadataProperties) ? metadataProperties.find(({ path }) => toCamelCase(path) === col.id) : undefined;

          let model: IColumnEditorProps = {
            ...customComponent.settings,
            id: col.columnId,
            type: customComponent.type,
            propertyName: col.propertyName,
            label: null,
            hideLabel: true,
          };

          if (component.linkToModelMetadata && propertyMeta) {
            model = component.linkToModelMetadata(model, propertyMeta);
          }

          result.allComponents[model.id] = model;
          componentIds.push(model.id);
        }
      }
    });
    result.componentRelations[ROOT_COMPONENT_KEY] = componentIds;

    return result;
  }, [columns, metadataProperties, toolboxComponents]);

  const inlineEditorComponents = useMemo<IFlatComponentsStructure>(() => {
    return getCrudComponents(crudOptions.canEdit, (col) => col.editComponent);
  }, [getCrudComponents, crudOptions.canEdit]);

  const inlineCreatorComponents = useMemo<IFlatComponentsStructure>(() => {
    return getCrudComponents(crudOptions.canAdd, (col) => col.createComponent);
  }, [getCrudComponents, crudOptions.canAdd]);

  const inlineDisplayComponents = useMemo<IFlatComponentsStructure>(() => {
    const result = getCrudComponents(true, (col) => col.displayComponent);
    return result;
  }, [getCrudComponents]);

  type GrouppedRow = Row<ITableRowData>;
  type RowOrGroup = GrouppedRow | RowsGroup;
  interface RowsGroup {
    value: unknown;
    index: number;
    $childs: RowOrGroup[];
  }
  interface GroupLevelInfo {
    propertyName: string;
    index: number;
    currentGroup?: RowsGroup | undefined;
  }
  type GroupLevels = GroupLevelInfo[];
  const isGroup = (item: RowOrGroup | undefined): item is RowsGroup => {
    return isDefined(item) && "$childs" in item && Array.isArray(item.$childs);
  };
  const convertRowsToGroups = (rows: GrouppedRow[]): RowsGroup[] => {
    const groupLevels: GroupLevels = (grouping ?? []).map<GroupLevelInfo>((g, index) => ({
      currentGroup: undefined,
      propertyName: g.propertyName,
      index: index,
    }));

    const result: RowsGroup[] = [];
    rows.forEach((row) => {
      let parent: RowOrGroup[] = result;
      let differenceFound = false;
      groupLevels.forEach((g, index) => {
        const groupValue = getNestedPropertyValue(row["original"], g.propertyName);

        if (!g.currentGroup || !isEqual(g.currentGroup.value, groupValue) || differenceFound) {
          g.currentGroup = {
            index: index,
            value: groupValue,
            $childs: [],
          };
          parent.push(g.currentGroup);
          differenceFound = true;
        }
        parent = g.currentGroup.$childs;
      });
      parent.push(row);
    });
    return result;
  };

  const renderGroupTitle = (value: unknown, propertyName: string): ReactElement => {
    if (!Boolean(value) && value !== false) return <Typography.Text type="secondary">(empty)</Typography.Text>;
    const column = groupingColumns.find((c) => isDataColumn(c) && c.propertyName === propertyName);
    const propertyMeta = isDataColumn(column) ? column.metadata : undefined;

    return <ValueRenderer value={value} meta={propertyMeta} />;
  };

  const renderGroup = (group: RowsGroup, key: number, rowRenderer: RowRenderer<ITableRowData>): React.ReactElement => {
    if (!isDefined(grouping))
      throw new Error('Grouping is not defined. Please check if grouping is configured correctly.');
    const groupingItem = grouping[group.index];
    if (!isDefined(groupingItem))
      throw new Error('Grouping item is not defined. Please check if grouping is configured correctly.');

    const title = renderGroupTitle(group.value, groupingItem.propertyName);
    return (
      <Collapse
        key={key}
        defaultActiveKey={['1']}
        expandIconPlacement="start"
        className={`sha-group-level-${group.index}`}
      >
        <Collapse.Panel header={<>{title}</>} key="1">
          {group.$childs.map((child, index) => {
            return isGroup(child) ? renderGroup(child, index, rowRenderer) : rowRenderer(child, index);
          })}
        </Collapse.Panel>
      </Collapse>
    );
  };

  const onRowsRenderingWithGrouping: OnRowsRendering<ITableRowData> = ({ rows, defaultRender }) => {
    const groupped = convertRowsToGroups(rows);
    return <>{groupped.map((group, index) => renderGroup(group, index, defaultRender))}</>;
  };

  const repository = store.getRepository();
  const reorderingAvailable = useMemo<boolean>(() => {
    return isDefined(repository.supportsReordering) && repository.supportsReordering({ sortMode, strictSortBy }) === true;
  }, [repository, sortMode, strictSortBy]);

  const groupingAvailable = useMemo<boolean>(() => {
    return isDefined(repository) && isDefined(repository.supportsGrouping) && repository.supportsGrouping({ sortMode });
  }, [repository, sortMode]);

  const handleRowsReordered = async (payload: OnRowsReorderedArgs): Promise<void> => {
    const repository = store.getRepository();

    if (isNullOrWhiteSpace(strictSortBy))
      throw new Error('Strict sort by is not defined. Please check if strict sorting is configured correctly.');
    const supported = repository.supportsReordering && repository.supportsReordering({ sortMode, strictSortBy });
    if (supported !== true)
      throw new Error(typeof supported === 'string' ? supported : 'Reordering is not supported');

    // Get current data state
    const oldData = payload.getOld();
    const newData = payload.getNew();
    const oldIdx = payload.oldIndex ?? -1;
    const newIdx = payload.newIndex ?? -1;

    // Validate indices
    if (oldIdx < 0 || oldIdx >= oldData.length || newIdx < 0 || newIdx >= oldData.length) {
      console.warn(
        `Invalid reorder indices: oldIndex=${oldIdx}, newIndex=${newIdx}, data length=${oldData.length}. Resetting to original order.`,
      );
      payload.applyOrder(oldData);
      throw new Error(
        `Reordering cancelled: indices out of bounds (oldIndex=${oldIdx}, newIndex=${newIdx}, valid range=0-${oldData.length - 1})`,
      );
    }

    const movedRow = oldData[oldIdx];

    // Execute onBeforeRowReorder event (if configured)
    if (onBeforeRowReorder) {
      await new Promise<void>((resolve, reject) => {
        const beforeArgs: IBeforeRowReorderArguments = {
          oldIndex: oldIdx,
          newIndex: newIdx,
          rowData: movedRow,
          allData: oldData,
        };

        const evaluationContext = { ...appContext, data: beforeArgs };

        void executeAction({
          actionConfiguration: {
            ...onBeforeRowReorder,
          },
          argumentsEvaluationContext: evaluationContext,
          success: () => {
            resolve();
          },
          fail: (error) => {
            console.error('OnBeforeRowReorder event error:', error);
            payload.applyOrder(oldData);
            const errorMessage = error instanceof Error ? error.message : String(error);
            reject(new RowReorderValidationError(errorMessage));
          },
        });
      });
    }

    // Prepare reorder payload
    const reorderPayload: RowsReorderPayload = {
      ...payload,
      propertyName: strictSortBy,
      customReorderEndpoint: customReorderEndpoint,
    };

    try {
      // Execute the actual reorder operation
      const apiResponse = await repository.reorder(reorderPayload);

      // Execute onAfterRowReorder event (if configured)
      if (onAfterRowReorder) {
        try {
          const afterArgs: IAfterRowReorderArguments = {
            oldIndex: oldIdx,
            newIndex: newIdx,
            rowData: movedRow,
            allData: newData,
            response: apiResponse,
          };

          const evaluationContext = { ...appContext, data: afterArgs };

          // Execute the after event action
          await executeAction({
            actionConfiguration: onAfterRowReorder,
            argumentsEvaluationContext: evaluationContext,
          });
        } catch (error) {
          console.error('OnAfterRowReorder event error:', error);
          // Note: We don't throw here as the reorder has already completed successfully
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const onResizedChange = (columns: ColumnInstance<ITableRowData>[], _columnSizes: IColumnResizing): void => {
    const newWidths: IColumnWidth[] = [];
    columns.forEach((c) => {
      if (typeof c.width === 'number')
        newWidths.push({ id: c.id, width: c.width });
    });

    setColumnWidths(newWidths);
  };

  const tableProps: IReactTableProps<ITableRowData> = {
    data: tableData,
    // Disable sorting if we're in create mode so that the new row is always the first
    defaultSorting: defaultSorting,
    selectionMode: mode,
    freezeHeaders: freezeHeaders,
    // Disable row selection when there's a crud operations column
    onSelectRow: hasCrudOperationsColumn ? undefined : onSelectRowLocal,
    onRowDoubleClick: combinedDblClickHandler,
    onSelectedIdsChanged: mode === 'multiple' ? changeSelectedIds : undefined,
    onMultiRowSelect: mode === 'multiple' ? onMultiRowSelect : undefined,
    onSort, // Update it so that you can pass it as param. Quick fix for now
    columns: preparedColumns,
    // Only use selectedRowIndex in single mode; in multiple mode, row.isSelected controls highlighting
    // Disable row selection highlighting when there's a crud operations column
    selectedRowIndex: mode === 'single' && !hasCrudOperationsColumn ? selectedRowIndex : undefined,
    loading: isFetchingTableData,
    pageCount: totalPages,
    manualFilters: true, // informs React Table that you'll be handling sorting and pagination server-side
    manualPagination: true, // informs React Table that you'll be handling sorting and pagination server-side
    loadingText: (
      <span>
        <LoadingOutlined /> loading...
      </span>
    ),
    containerStyle,
    tableStyle,
    omitClick: options?.omitClick,

    canDeleteInline: crudOptions.canDelete,
    deleteAction: deleter,

    canEditInline: crudOptions.canEdit,
    updateAction: updater,

    canAddInline: crudOptions.canAdd,
    newRowCapturePosition: props.newRowCapturePosition,
    createAction: creater,
    newRowInitData: crudOptions.onNewRowInitialize,
    inlineEditMode,
    inlineSaveMode: props.inlineSaveMode,
    inlineEditorComponents,
    inlineCreatorComponents,
    inlineDisplayComponents,
    minHeight: props.minHeight,
    maxHeight: props.maxHeight,
    noDataText: noDataText,
    noDataSecondaryText: noDataSecondaryText,
    noDataIcon,
    allowReordering: allowReordering && reorderingAvailable,
    onRowsReordered: handleRowsReordered,

    onRowsRendering: grouping && grouping.length > 0 && groupingAvailable ? onRowsRenderingWithGrouping : undefined,
    onResizedChange: onResizedChange,

    showExpandedView,

    rowBackgroundColor,
    rowAlternateBackgroundColor,
    rowHoverBackgroundColor: hoverHighlight ? (rowHoverBackgroundColor || '') : undefined,
    rowSelectedBackgroundColor,
    border,
    striped,
    backgroundColor,
    headerFontFamily: effectiveHeaderFontFamily,
    headerFontSize: effectiveHeaderFontSize,
    headerFontWeight: effectiveHeaderFontWeight,
    headerBackgroundColor,
    headerTextColor: effectiveHeaderTextColor,
    headerTextAlign: effectiveHeaderTextAlign,
    bodyTextAlign: effectiveBodyTextAlign,
    rowHeight,
    rowPadding,
    rowBorder,
    rowBorderStyle,
    boxShadow,
    dimensions,
    sortableIndicatorColor,

    onRowClickAction: onRowClick,
    onRowHoverAction: onRowHover,
    onRowSelectAction: onRowSelect,
    onSelectionChangeAction: onSelectionChange,

    cellTextColor: props.cellTextColor,
    cellBackgroundColor: props.cellBackgroundColor,
    cellBorderColor: props.cellBorderColor,
    cellBorders: props.cellBorders,
    cellPadding: props.cellPadding,
    headerBorder: props.headerBorder,
    cellBorder: props.cellBorder,
    headerShadow: props.headerShadow,
    rowShadow: props.rowShadow,
    rowDividers: props.rowDividers,
    bodyFontFamily,
    bodyFontSize,
    bodyFontWeight,
    bodyFontColor,
    actionIconSize,
    actionIconColor,
  };

  return (
    <ReactTable {...tableProps} />
  );
};
