import { LoadingOutlined } from '@ant-design/icons';
import { ModalProps } from 'antd/lib/modal';
import React, { CSSProperties, FC, Fragment, MutableRefObject, ReactElement, useEffect, useMemo } from 'react';
import { Column, ColumnInstance, SortingRule, TableProps } from 'react-table';
import { usePrevious } from 'react-use';
import { ValidationErrors } from '..';
import {
  IFlatComponentsStructure,
  ROOT_COMPONENT_KEY,
  useConfigurableActionDispatcher,
  useDataTableStore,
  useHttpClient,
  useMetadata,
  useShaFormInstanceOrUndefined,
  useSheshaApplication,
} from '@/providers';
import { DataTableFullInstance, IColumnWidth } from '@/providers/dataTable/contexts';
import { removeUndefinedProperties } from '@/utils/array';
import { camelcaseDotNotation, toCamelCase } from '@/utils/string';
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
import moment from 'moment';
import { DataTableColumn, IShaDataTableProps, OnSaveHandler, OnSaveSuccessHandler, YesNoInheritJs } from './interfaces';
import { ValueRenderer } from '../valueRenderer/index';
import { IBorderValue } from '@/designer-components/_settings/utils/border/interfaces';
import { IShadowValue } from '@/designer-components/_settings/utils/shadow/interfaces';
import { isEqual } from 'lodash';
import { Collapse, Typography } from 'antd';
import { RowsReorderPayload } from '@/providers/dataTable/repository/interfaces';
import { useStyles } from './styles/styles';
import { adjustWidth } from './cell/utils';
import { getCellStyleAccessor } from './utils';
import { isPropertiesArray } from '@/interfaces/metadata';
import { IBeforeRowReorderArguments, IAfterRowReorderArguments } from '@/designer-components/dataTable/tableContext/models';

export interface IIndexTableOptions {
  omitClick?: boolean;
}

export interface IIndexTableProps extends IShaDataTableProps, TableProps {
  tableRef?: MutableRefObject<Partial<DataTableFullInstance> | null>;
  options?: IIndexTableOptions;
  containerStyle?: CSSProperties;
  tableStyle?: CSSProperties;
  minHeight?: number;
  maxHeight?: number;
  noDataText?: string;
  noDataSecondaryText?: string;
  noDataIcon?: string;
  showExpandedView?: boolean;

  rowBackgroundColor?: string;
  rowAlternateBackgroundColor?: string;
  rowHoverBackgroundColor?: string;
  rowSelectedBackgroundColor?: string;
  borderRadius?: string;
  border?: IBorderValue;
  hoverHighlight?: boolean;
  striped?: boolean;
  backgroundColor?: string;

  // Header styling
  headerFont?: {
    type?: string;
    size?: number;
    weight?: string;
    color?: string;
    align?: string;
  };
  headerBackgroundColor?: string;
  headerTextAlign?: string; // Alignment for header cells
  bodyTextAlign?: string; // Alignment for body cells

  // Deprecated - kept for backward compatibility
  /** @deprecated Use headerFont.type instead */
  headerFontFamily?: string;
  /** @deprecated Use headerFont.size instead */
  headerFontSize?: string;
  /** @deprecated Use headerFont.weight instead */
  headerFontWeight?: string;
  /** @deprecated Use headerFont.color instead */
  headerTextColor?: string;
  /** @deprecated Use headerTextAlign for headers or bodyTextAlign for body */
  textAlign?: string;

  // Table body styling
  rowHeight?: string;
  rowPadding?: string;
  rowBorder?: string;
  rowBorderStyle?: IBorderValue;

  // Cell styling
  cellTextColor?: string;
  cellBackgroundColor?: string;
  cellBorderColor?: string;
  cellBorders?: boolean;
  cellPadding?: string;
  cellBorder?: IBorderValue;

  // Border and shadow styling
  headerBorder?: IBorderValue;
  headerShadow?: IShadowValue;
  rowShadow?: IShadowValue;
  rowDividers?: boolean;

  // Overall table styling
  boxShadow?: string;
  sortableIndicatorColor?: string;
}

export interface IExtendedModalProps extends ModalProps {
  content?: string;
}

export const DataTable: FC<Partial<IIndexTableProps>> = ({
  useMultiselect: useMultiSelect,
  selectionMode,
  selectedRowIndex,
  onSelectRow,
  onDblClick,
  onMultiRowSelect,
  tableRef,
  onRowsChanged,
  onExportSuccess,
  onExportError,
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
  sortableIndicatorColor,
  ...props
}) => {
  const store = useDataTableStore();
  const mode = selectionMode ?? (useMultiSelect ? 'multiple' : 'single');
  const multiSelect = mode === 'multiple';
  const appContext = useAvailableConstantsData();

  // Compute effective header font values with backward compatibility
  const effectiveHeaderFontFamily = headerFont?.type ?? headerFontFamily;
  const effectiveHeaderFontSize = headerFont?.size ? `${headerFont.size}px` : headerFontSize;
  const effectiveHeaderFontWeight = headerFont?.weight ?? headerFontWeight;
  const effectiveHeaderTextColor = headerFont?.color ?? headerTextColor;
  const effectiveHeaderTextAlign = headerFont?.align ?? headerTextAlign ?? textAlign;
  const effectiveBodyTextAlign = bodyTextAlign ?? textAlign; // Body uses bodyTextAlign or falls back to textAlign (deprecated)

  if (tableRef) tableRef.current = store;

  const {
    tableData,
    isFetchingTableData,
    totalPages,
    columns,
    groupingColumns,
    pageSizeOptions,
    currentPage,
    selectedPageSize,
    tableFilter,
    onSelectRow: onSelectRowDeprecated,
    onDblClick: onDblClickDeprecated,
    selectedRow,
    selectedIds,
    userSorting,
    quickSearch,
    onSort,
    changeSelectedIds,
    setRowData,
    setSelectedRow,
    succeeded: { exportToExcel: exportToExcelSuccess },
    error: { exportToExcel: exportToExcelError },
    grouping,
    sortMode,
    strictSortBy,
    setColumnWidths,
    customReorderEndpoint,
    onBeforeRowReorder,
    onAfterRowReorder,
  } = store;

  const { backendUrl } = useSheshaApplication();
  const httpClient = useHttpClient();
  const { executeAction } = useConfigurableActionDispatcher();

  const handleRowSelect = useMemo(() => {
    if (!onRowSelect?.actionName) return undefined;

    return (row: any, rowIndex: number) => {
      const evaluationContext = { ...appContext, data: row, rowIndex };

      try {
        executeAction({
          actionConfiguration: onRowSelect,
          argumentsEvaluationContext: evaluationContext,
        });
      } catch (error) {
        console.error('Error executing row select action:', error);
      }
    };
  }, [onRowSelect, appContext.contexts.lastUpdate, moment, executeAction, httpClient]);

  // Clear all selections when selection mode changes
  const previousMode = usePrevious(mode);
  useEffect(() => {
    // Only clear if mode actually changed
    if (previousMode !== undefined && previousMode !== mode) {
      if (selectedRow && setSelectedRow) {
        setSelectedRow(null, null);
      }
      if (selectedIds && selectedIds.length > 0 && changeSelectedIds) {
        changeSelectedIds([]);
      }
    }
  }, [mode, previousMode, selectedRow, selectedIds, setSelectedRow, changeSelectedIds]);

  const onSelectRowLocal = (index: number, row: any): void => {
    if (onSelectRow) {
      onSelectRow(index, row);
    }

    if (setSelectedRow) {
      const rowId = row?.id;
      const currentId = store.selectedRow?.id;
      if (rowId !== currentId) {
        setSelectedRow(index, row);
        if (handleRowSelect) {
          handleRowSelect(row, index);
        }
      } else {
        setSelectedRow(null, null);
      }
    }
  };

  const previousIds = usePrevious(selectedIds);

  useEffect(() => {
    if (
      mode === 'multiple' &&
      !(previousIds?.length === 0 && selectedIds?.length === 0) &&
      typeof onSelectedIdsChanged === 'function'
    ) {
      onSelectedIdsChanged(selectedIds);
    }
  }, [selectedIds]);

  useEffect(() => {
    if (!isFetchingTableData && tableData?.length && onFetchDataSuccess) {
      onFetchDataSuccess();
    }
  }, [isFetchingTableData]);

  useEffect(() => {
    if (exportToExcelSuccess && onExportSuccess) {
      onExportSuccess();
    }
  }, [exportToExcelSuccess]);

  useEffect(() => {
    if (exportToExcelError && onExportError) {
      onExportError();
    }
  }, [exportToExcelError]);

  const handleSelectRow = onSelectRow || onSelectRowDeprecated;

  const dblClickHandler = onDblClick || onDblClickDeprecated;

  useEffect(() => {
    if (Boolean(handleSelectRow)) handleSelectRow(null, null);
  }, [
    tableData,
    isFetchingTableData,
    totalPages,
    columns,
    pageSizeOptions,
    currentPage,
    selectedPageSize,
    tableFilter,
    selectedRow,
    quickSearch,
    userSorting,
  ]);

  useEffect(() => {
    if (onRowsChanged) {
      onRowsChanged(tableData);
    }
  }, [tableData]);
  const { styles } = useStyles();

  const metadata = useMetadata(false)?.metadata;

  const handleRowDoubleClick = useMemo(() => {
    if (!onRowDoubleClick?.actionName) return undefined;

    return (row: any, rowIndex: number) => {
      const evaluationContext = { ...appContext, data: row, rowIndex };

      try {
        executeAction({
          actionConfiguration: onRowDoubleClick,
          argumentsEvaluationContext: evaluationContext,
        });
      } catch (error) {
        console.error('Error executing row double-click action:', error);
      }
    };
  }, [onRowDoubleClick, appContext.contexts.lastUpdate, moment, executeAction, httpClient]);

  const handleSelectionChange = useMemo(() => {
    if (!onSelectionChange?.actionName) return undefined;

    return (selectedIds: string[]) => {
      const evaluationContext = { ...appContext, selectedIds };

      try {
        executeAction({
          actionConfiguration: onSelectionChange,
          argumentsEvaluationContext: evaluationContext,
        });
      } catch (error) {
        console.error('Error executing selection change action:', error);
      }
    };
  }, [onSelectionChange, appContext.contexts.lastUpdate, httpClient]);

  const combinedDblClickHandler = useMemo(() => {
    return (rowData: any, rowIndex: number) => {
      if (dblClickHandler) {
        if (typeof dblClickHandler === 'function') {
          dblClickHandler(rowData, rowIndex);
        }
      }
      if (handleRowDoubleClick) {
        handleRowDoubleClick(rowData, rowIndex);
      }
    };
  }, [dblClickHandler, handleRowDoubleClick]);

  useEffect(() => {
    if (handleSelectionChange && previousIds !== undefined) {
      // Check if the selection actually changed by comparing the arrays
      const currentIds = selectedIds || [];
      const prevIds = previousIds || [];

      // Don't trigger on first selection (when moving from no selection to first selection)
      if (prevIds.length === 0 && currentIds.length > 0) {
        return; // Skip first selection - only fire when moving FROM one selection TO another
      }

      // Compare sorted arrays for efficient comparison
      const currentSorted = [...currentIds].sort();
      const prevSorted = [...prevIds].sort();

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
    const result: RowDataInitializer = props.onNewRowInitialize
      ? () => {
        // TODO: replace formData and globalState with accessors (e.g. refs) and remove hooks to prevent unneeded re-rendering
        // return onNewRowInitializeExecuter(formApi, globalState, httpClient, moment, appContextData);
        const result = executeScriptSync(props.onNewRowInitialize, appContext) as object;
        return Promise.resolve(result);
      }
      : () => {
        return Promise.resolve({});
      };

    return result;
  }, [props.onNewRowInitialize, appContext.contexts.lastUpdate]);

  const evaluateYesNoInheritJs = (
    value: YesNoInheritJs,
    jsExpression: string,
  ): boolean => {
    switch (value) {
      case 'yes':
        return true;
      case 'no':
        return false;
      case 'inherit':
        return appContext.form.formMode === 'edit';
      case 'js': {
        return (
          jsExpression &&
          executeScriptSync<boolean>(jsExpression, { ...appContext, formData: appContext.data })
        );
      }
    }
    return false;
  };

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
  }, [props.canDeleteInline, inlineEditMode, props.canEditInline, props.canAddInline, appContext.contexts.lastUpdate]);

  const preparedColumns = useMemo<Column<any>[]>(() => {
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
      .map<Column<any>>((columnItem) => {
        const strictWidth =
          columnItem.minWidth && columnItem.maxWidth && columnItem.minWidth === columnItem.maxWidth
            ? columnItem.minWidth
            : undefined;
        const width = strictWidth ?? columnItem.width;

        const cellStyleAccessor = getCellStyleAccessor(columnItem);
        const cellRenderer = getCellRenderer(columnItem, columnItem.metadata, shaForm);
        const column: DataTableColumn<any> = {
          ...columnItem,
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
        return removeUndefinedProperties(column) as DataTableColumn<any>;
      });
    return localPreparedColumns;
  }, [
    columns,
    crudOptions.enabled,
    crudOptions.canAdd,
    crudOptions.canEdit,
    crudOptions.canDelete,
    crudOptions.inlineEditMode,
    sortMode,
  ]);

  // sort
  const defaultSorting =
    sortMode === 'standard' ? userSorting?.map<SortingRule<string>>((c) => ({ id: c.id, desc: c.desc })) : undefined;

  const performOnRowSaveSuccess = useMemo<OnSaveSuccessHandler>(() => {
    if (!onRowSaveSuccess)
      return () => {
        /* nop*/
      };

    return (data) => {
      const evaluationContext = { ...appContext, data };
      // execute the action
      executeAction({
        actionConfiguration: onRowSaveSuccess,
        argumentsEvaluationContext: evaluationContext,
      });
    };
  }, [onRowSaveSuccess, appContext.contexts.lastUpdate, backendUrl, executeAction]);

  const performOnRowSave = useMemo<OnSaveHandler>(() => {
    if (!onRowSave) return (data) => Promise.resolve(data);

    return (data) => {
      return executeScript(onRowSave, { ...appContext, data });
    };
  }, [onRowSave, appContext.contexts.lastUpdate]);

  const updater = useMemo(() => (rowIndex: number, rowData: any): Promise<any> => {
    const repository = store.getRepository();
    if (!repository) return Promise.reject('Repository is not specified');

    return performOnRowSave(rowData).then((preparedData: object | undefined) => {
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
  }, [store, onRowSave, appContext.contexts.lastUpdate]);

  const creater = useMemo(() => (rowData: any): Promise<any> => {
    const repository = store.getRepository();
    if (!repository) return Promise.reject('Repository is not specified');

    return performOnRowSave(rowData).then((preparedData: object | undefined) => {
      const options =
        repository.repositoryType === BackendRepositoryType
          ? ({ customUrl: customCreateUrl } as ICreateOptions)
          : undefined;

      // use preparedData ?? rowData to handle the case when onRowSave returns undefined
      return repository.performCreate(0, preparedData ?? rowData, options).then(() => {
        store.refreshTable();
        performOnRowSaveSuccess(preparedData ?? rowData);
      });
    });
  }, [store, onRowSave, appContext.contexts.lastUpdate]);

  const performOnRowDeleteSuccessAction = useMemo<OnSaveSuccessHandler>(() => {
    if (!onRowDeleteSuccessAction)
      return () => {
        /* nop*/
      };
    return (data) => {
      const evaluationContext = { ...appContext, data };
      try {
        executeAction({
          actionConfiguration: onRowDeleteSuccessAction,
          argumentsEvaluationContext: evaluationContext,
        });
      } catch (error) {
        console.error('Error executing row delete success action:', error);
      }
    };
  }, [onRowDeleteSuccessAction, httpClient]);


  const deleter = (rowIndex: number, rowData: any): Promise<any> => {
    const repository = store.getRepository();
    if (!repository) return Promise.reject('Repository is not specified');

    const options =
      repository.repositoryType === BackendRepositoryType
        ? ({ customUrl: customDeleteUrl } as IDeleteOptions)
        : undefined;

    return repository.performDelete(rowIndex, rowData, options).then(() => {
      performOnRowDeleteSuccessAction(rowData);
      store.refreshTable();
    });
  };

  const getCrudComponents = (
    allowEdit: boolean,
    componentAccessor: (col: ITableDataColumn) => IFieldComponentProps,
  ): IFlatComponentsStructure => {
    const result: IFlatComponentsStructure = {
      allComponents: {},
      componentRelations: {},
    };
    // don't calculate components settings when it's not required
    if (!allowEdit) return result;

    const componentIds: string[] = [];
    columns?.forEach((col) => {
      if (col.columnType === 'data') {
        const dataCol = col as ITableDataColumn;
        const customComponent = componentAccessor(dataCol);
        const componentType = customComponent?.type ?? standardCellComponentTypes.notEditable;
        if (
          componentType &&
          componentType !== standardCellComponentTypes.notEditable &&
          componentType !== standardCellComponentTypes.defaultDisplay
        ) {
          // component found
          const component = toolboxComponents[customComponent.type];
          if (!component) {
            console.error(`Datatable: component '${customComponent.type}' not found - skipped`);
            return;
          }

          const propertyMeta = isPropertiesArray(metadata?.properties) ? metadata.properties.find(({ path }) => toCamelCase(path) === dataCol.id) : undefined;

          let model: IColumnEditorProps = {
            ...customComponent.settings,
            id: dataCol.columnId,
            type: customComponent.type,
            propertyName: dataCol.propertyName,
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
  };

  const inlineEditorComponents = useMemo<IFlatComponentsStructure>(() => {
    return getCrudComponents(crudOptions.canEdit, (col) => col.editComponent);
  }, [columns, metadata, crudOptions.canEdit]);

  const inlineCreatorComponents = useMemo<IFlatComponentsStructure>(() => {
    return getCrudComponents(crudOptions.canAdd, (col) => col.createComponent);
  }, [columns, metadata, crudOptions.canAdd]);

  const inlineDisplayComponents = useMemo<IFlatComponentsStructure>(() => {
    const result = getCrudComponents(true, (col) => col.displayComponent);
    return result;
  }, [columns, metadata]);

  type Row = any;
  type RowOrGroup = Row | RowsGroup;
  interface RowsGroup {
    value: any;
    index: number;
    $childs: RowOrGroup[];
  }
  interface GroupLevelInfo {
    propertyName: string;
    index: number;
    currentGroup?: RowsGroup;
    propertyPath: string[];
  }
  type GroupLevels = GroupLevelInfo[];
  const isGroup = (item: RowOrGroup): item is RowsGroup => {
    return item && Array.isArray(item.$childs);
  };
  const convertRowsToGroups = (rows: any[]): RowsGroup[] => {
    const groupLevels: GroupLevels = grouping.map<GroupLevelInfo>((g, index) => ({
      currentGroup: null,
      propertyName: g.propertyName,
      index: index,
      propertyPath: g.propertyName.split('.'),
    }));

    const getValue = (container: object, path: string[]): any => {
      return path.reduce((prev, part) => (prev ? prev[part] : undefined), container);
    };

    const result: RowsGroup[] = [];
    rows.forEach((row) => {
      let parent: RowOrGroup[] = result;
      let differenceFound = false;
      groupLevels.forEach((g, index) => {
        const groupValue = getValue(row.original, g.propertyPath);

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

  const renderGroupTitle = (value: any, propertyName: string): ReactElement => {
    if (!Boolean(value) && value !== false) return <Typography.Text type="secondary">(empty)</Typography.Text>;
    const column = groupingColumns.find((c) => isDataColumn(c) && c.propertyName === propertyName);
    const propertyMeta = isDataColumn(column) ? column.metadata : null;

    return <ValueRenderer value={value} meta={propertyMeta} />;
  };

  const renderGroup = (group: RowsGroup, key: number, rowRenderer: RowRenderer): React.ReactElement => {
    const title = renderGroupTitle(group.value, grouping[group.index].propertyName);
    return (
      <Collapse
        key={key}
        defaultActiveKey={['1']}
        expandIconPosition="start"
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

  const onRowsRenderingWithGrouping: OnRowsRendering = ({ rows, defaultRender }) => {
    const groupped = convertRowsToGroups(rows);
    return <>{groupped.map((group, index) => renderGroup(group, index, defaultRender))}</>;
  };

  const repository = store.getRepository();
  const reorderingAvailable = useMemo<boolean>(() => {
    return (
      repository && repository.supportsReordering && repository.supportsReordering({ sortMode, strictSortBy }) === true
    );
  }, [repository, sortMode, strictSortBy]);

  const groupingAvailable = useMemo<boolean>(() => {
    return repository && repository.supportsGrouping && repository?.supportsGrouping({ sortMode });
  }, [repository, sortMode]);

  const handleRowsReordered = async (payload: OnRowsReorderedArgs): Promise<void> => {
    const repository = store.getRepository();
    if (!repository)
      throw new Error('Repository is not specified');

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

        executeAction({
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
            reject(new Error(errorMessage));
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

  const onResizedChange = (columns: ColumnInstance[], _columnSizes: IColumnResizing): void => {
    const widths = columns.map<IColumnWidth>((c) => ({
      id: c.id,
      width: typeof c.width === 'number' ? c.width : undefined,
    }));

    setColumnWidths(widths);
  };

  const tableProps: IReactTableProps = {
    data: tableData,
    // Disable sorting if we're in create mode so that the new row is always the first
    defaultSorting: defaultSorting,
    useMultiSelect: multiSelect,
    selectionMode: mode,
    freezeHeaders,
    onSelectRow: onSelectRowLocal,
    onRowDoubleClick: combinedDblClickHandler,
    onSelectedIdsChanged: mode === 'multiple' ? changeSelectedIds : undefined,
    onMultiRowSelect: mode === 'multiple' ? onMultiRowSelect : undefined,
    onSort, // Update it so that you can pass it as param. Quick fix for now
    columns: preparedColumns,
    // Only use selectedRowIndex in single mode; in multiple mode, row.isSelected controls highlighting
    selectedRowIndex: mode === 'single' ? selectedRowIndex : undefined,
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
    noDataText,
    noDataSecondaryText,
    noDataIcon,
    allowReordering: allowReordering && reorderingAvailable,
    onRowsReordered: handleRowsReordered,

    onRowsRendering: grouping && grouping.length > 0 && groupingAvailable ? onRowsRenderingWithGrouping : undefined,
    onResizedChange: onResizedChange,

    showExpandedView,

    rowBackgroundColor,
    rowAlternateBackgroundColor,
    rowHoverBackgroundColor: hoverHighlight ? rowHoverBackgroundColor : undefined,
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
  };

  return (
    <Fragment>
      <div className={styles.shaChildTableErrorContainer}>
        {exportToExcelError && <ValidationErrors error="Error occurred while exporting to excel" />}
      </div>

      {tableProps.columns && tableProps.columns.length > 0 && <ReactTable {...tableProps} />}
    </Fragment>
  );
};
