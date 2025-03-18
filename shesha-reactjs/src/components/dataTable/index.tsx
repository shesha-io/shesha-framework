import { LoadingOutlined } from '@ant-design/icons';
import { ModalProps } from 'antd/lib/modal';
import React, { CSSProperties, FC, Fragment, MutableRefObject, useEffect, useMemo, useState } from 'react';
import { Column, ColumnInstance, SortingRule, TableProps } from 'react-table';
import { usePrevious } from 'react-use';
import { ValidationErrors } from '..';
import {
  FormMode,
  IFlatComponentsStructure,
  ROOT_COMPONENT_KEY,
  useConfigurableActionDispatcher,
  useDataTableStore,
  useForm,
  useGlobalState,
  useHttpClient,
  useMetadata,
  useShaFormInstance,
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
import { executeScriptSync, useApplicationContextData } from '@/providers/form/utils';
import moment from 'moment';
import { ConfigurableFormInstance, IAnyObject } from '@/interfaces';
import { DataTableColumn, IShaDataTableProps, OnSaveHandler, OnSaveSuccessHandler, YesNoInheritJs } from './interfaces';
import { ValueRenderer } from '../valueRenderer/index';
import { isEqual } from 'lodash';
import { Collapse, Typography } from 'antd';
import { RowsReorderPayload } from '@/providers/dataTable/repository/interfaces';
import { useStyles } from './styles/styles';
import { adjustWidth, getCruadActionConditions } from './cell/utils';
import { getCellStyleAccessor } from './utils';
import { isPropertiesArray } from '@/interfaces/metadata';
import { getFormApi } from '@/providers/form/formApi';

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
}

export interface IExtendedModalProps extends ModalProps {
  content?: string;
}

export const DataTable: FC<Partial<IIndexTableProps>> = ({
  useMultiselect: useMultiSelect,
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
  ...props
}) => {
  const store = useDataTableStore();
  const form = useForm(false);
  const formApi = getFormApi(form ?? { formMode: 'readonly', formData: {} } as ConfigurableFormInstance);
  const { formMode, data: formData } = formApi;
  const { globalState, setState: setGlobalState } = useGlobalState();
  const [visibleColumns, setVisibleColumns] = useState<number>(0);
  const appContextData = useApplicationContextData();

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
  } = store;

  const onSelectRowLocal = (index: number, row: any) => {
    if (onSelectRow) {
      onSelectRow(index, row);
    }

    if (setSelectedRow) {
      const rowId = row?.id;
      const currentId = store.selectedRow?.id;
      if (rowId !== currentId) setSelectedRow(index, row);
      else setSelectedRow(null, null);
    }
  };

  const previousIds = usePrevious(selectedIds);

  useEffect(() => {
    if (!(previousIds?.length === 0 && selectedIds?.length === 0) && typeof onSelectedIdsChanged === 'function') {
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

  const { backendUrl } = useSheshaApplication();
  const httpClient = useHttpClient();

  const toolboxComponents = useFormDesignerComponents();
  const shaForm = useShaFormInstance();

  const onNewRowInitializeExecuter = useMemo<Function>(() => {
    return props.onNewRowInitialize
      ? new Function('form, globalState, http, moment, application', props.onNewRowInitialize)
      : null;
  }, [props.onNewRowInitialize]);

  const onNewRowInitialize = useMemo<RowDataInitializer>(() => {
    const result: RowDataInitializer = props.onNewRowInitialize
      ? () => {
        // TODO: replace formData and globalState with accessors (e.g. refs) and remove hooks to prevent unneeded re-rendering
        //return onNewRowInitializeExecuter(formData, globalState);
        const result = onNewRowInitializeExecuter(formApi, globalState, httpClient, moment, appContextData);
        return Promise.resolve(result);
      }
      : () => {
        return Promise.resolve({});
      };

    return result;
  }, [onNewRowInitializeExecuter, formData, globalState]);

  const evaluateYesNoInheritJs = (
    value: YesNoInheritJs,
    jsExpression: string,
    formMode: FormMode,
    formData: any,
    globalState: IAnyObject
  ): boolean => {
    switch (value) {
      case 'yes':
        return true;
      case 'no':
        return false;
      case 'inherit':
        return formMode === 'edit';
      case 'js': {
        return (
          jsExpression &&
          executeScriptSync<boolean>(jsExpression, {
            formData: formData,
            globalState: globalState,
            moment: moment,
            application: appContextData,
          })
        );
      }
    }
    return false;
  };

  const prevCrudOptions = usePrevious({
    canDelete: evaluateYesNoInheritJs(
      props.canDeleteInline,
      props.canDeleteInlineExpression,
      formMode,
      formData,
      globalState
    ),
    canEdit: evaluateYesNoInheritJs(
      props.canEditInline,
      props.canEditInlineExpression,
      formMode,
      formData,
      globalState
    ),
    inlineEditMode,
    formMode,
    canAdd: evaluateYesNoInheritJs(props.canAddInline, props.canAddInlineExpression, formMode, formData, globalState),
  });

  const crudOptions = useMemo(() => {
    const result = {
      canDelete: evaluateYesNoInheritJs(
        props.canDeleteInline,
        props.canDeleteInlineExpression,
        formMode,
        formData,
        globalState
      ),
      canEdit: evaluateYesNoInheritJs(
        props.canEditInline,
        props.canEditInlineExpression,
        formMode,
        formData,
        globalState
      ),
      inlineEditMode,
      formMode,
      canAdd: evaluateYesNoInheritJs(props.canAddInline, props.canAddInlineExpression, formMode, formData, globalState),
      onNewRowInitialize
    };
    return {
      ...result,
      enabled: result.canAdd || result.canDelete || result.canEdit,
    };
  }, [props.canDeleteInline, inlineEditMode, props.canEditInline, props.canAddInline, formMode, formData, globalState]);

  const widthOptions = useMemo(() => {
    return getCruadActionConditions(crudOptions, prevCrudOptions);
  }, [crudOptions, prevCrudOptions]);

  const preparedColumns = useMemo<Column<any>[]>(() => {
    setVisibleColumns(columns?.filter((c) => c.show).length);
    const localPreparedColumns = columns
      .map((column) => {
        if (column.columnType === 'crud-operations') {
          const { maxWidth, minWidth } = adjustWidth(
            {
              maxWidth: column.maxWidth,
              minWidth: column.minWidth,
            },
            {
              canDivideWidth: widthOptions.canDivideWidth,
              canDoubleWidth: widthOptions.canDoubleWidth,
              canDivideByThreeWidth: widthOptions.canDivideByThreeWidth,
              canTripleWidth: widthOptions.canTripleWidth,
              columnsChanged: visibleColumns !== columns?.filter((c) => c.show).length && !!visibleColumns
            }
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

  // http, moment
  const performOnRowSave = useMemo<OnSaveHandler>(() => {
    if (!onRowSave) return (data) => Promise.resolve(data);

    const executer = new Function('data, form, globalState, http, moment, application', onRowSave);
    return (data, formApi, globalState) => {
      const preparedData = executer(data, formApi, globalState, httpClient, moment, appContextData);
      return Promise.resolve(preparedData);
    };
  }, [onRowSave, httpClient]);

  const { executeAction } = useConfigurableActionDispatcher();
  const performOnRowSaveSuccess = useMemo<OnSaveSuccessHandler>(() => {
    if (!onRowSaveSuccess)
      return () => {
        /*nop*/
      };

    return (data, formApi, globalState, setGlobalState) => {
      const evaluationContext = {
        data,
        formApi,
        globalState,
        setGlobalState,
        http: httpClient,
        moment,
      };
      // execute the action
      executeAction({
        actionConfiguration: onRowSaveSuccess,
        argumentsEvaluationContext: evaluationContext,
      });
    };
  }, [onRowSaveSuccess, backendUrl]);

  const updater = (rowIndex: number, rowData: any): Promise<any> => {
    const repository = store.getRepository();
    if (!repository) return Promise.reject('Repository is not specified');

    return performOnRowSave(rowData, formApi, globalState).then((preparedData) => {
      const options =
        repository.repositoryType === BackendRepositoryType
          ? ({ customUrl: customUpdateUrl } as IUpdateOptions)
          : undefined;

      return repository.performUpdate(rowIndex, preparedData, options).then((response) => {
        setRowData(rowIndex, preparedData /*, response*/);
        performOnRowSaveSuccess(preparedData, formApi, globalState, setGlobalState);
        return response;
      });
    });
  };

  const creater = (rowData: any): Promise<any> => {
    const repository = store.getRepository();
    if (!repository) return Promise.reject('Repository is not specified');

    return performOnRowSave(rowData, formApi, globalState).then((preparedData) => {
      const options =
        repository.repositoryType === BackendRepositoryType
          ? ({ customUrl: customCreateUrl } as ICreateOptions)
          : undefined;

      return repository.performCreate(0, preparedData, options).then(() => {
        store.refreshTable();
        performOnRowSaveSuccess(preparedData, formApi, globalState, setGlobalState);
      });
    });
  };

  const deleter = (rowIndex: number, rowData: any): Promise<any> => {
    const repository = store.getRepository();
    if (!repository) return Promise.reject('Repository is not specified');

    const options =
      repository.repositoryType === BackendRepositoryType
        ? ({ customUrl: customDeleteUrl } as IDeleteOptions)
        : undefined;

    return repository.performDelete(rowIndex, rowData, options).then(() => {
      store.refreshTable();
    });
  };

  const getCrudComponents = (
    allowEdit: boolean,
    componentAccessor: (col: ITableDataColumn) => IFieldComponentProps
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

    const getValue = (container: object, path: string[]) => {
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

  const renderGroupTitle = (value: any, propertyName: string) => {
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

  const handleRowsReordered = (payload: OnRowsReorderedArgs): Promise<void> => {
    const repository = store.getRepository();
    if (!repository) return Promise.reject('Repository is not specified');

    const supported = repository.supportsReordering && repository.supportsReordering({ sortMode, strictSortBy });
    if (supported === true) {
      const reorderPayload: RowsReorderPayload = {
        ...payload,
        propertyName: strictSortBy,
      };

      return repository.reorder(reorderPayload);
    } else return Promise.reject(typeof supported === 'string' ? supported : 'Reordering is not supported');
  };

  const onResizedChange = (columns: ColumnInstance[], _columnSizes: IColumnResizing) => {
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
    useMultiSelect,
    freezeHeaders,
    onSelectRow: onSelectRowLocal,
    onRowDoubleClick: dblClickHandler,
    onSelectedIdsChanged: changeSelectedIds,
    onMultiRowSelect,
    onSort, // Update it so that you can pass it as param. Quick fix for now
    columns: preparedColumns,
    selectedRowIndex,
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
  };

  return (
    <Fragment>
      <div className={styles.shaChildTableErrorContainer}>
        {exportToExcelError && <ValidationErrors error={'Error occurred while exporting to excel'} />}
      </div>

      {tableProps.columns && tableProps.columns.length > 0 && <ReactTable {...tableProps} />}
    </Fragment>
  );
};
