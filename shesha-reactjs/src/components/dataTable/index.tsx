import React, { FC, useEffect, Fragment, MutableRefObject, useMemo, CSSProperties } from 'react';
import { Column, SortingRule, TableProps } from 'react-table';
import {
  LoadingOutlined,
} from '@ant-design/icons';
import { DataTableColumn, IShaDataTableProps, OnSaveHandler } from './interfaces';
import { DataTableFullInstance } from 'providers/dataTable/contexts';
import { ModalProps } from 'antd/lib/modal';
import ReactTable from '../reactTable';
import { removeUndefinedProperties } from 'utils/array';
import { ValidationErrors } from '..';
import { useDataTableStore, useForm, useGlobalState, useMetadata } from 'providers';
import { camelcaseDotNotation } from 'utils/string';
import { IReactTableProps, RowDataInitializer } from '../reactTable/interfaces';
import { usePrevious } from 'react-use';
import { getCellRenderer } from './cell';
import { BackendRepositoryType, ICreateOptions, IDeleteOptions, IUpdateOptions } from 'providers/dataTable/repository/backendRepository';

export interface IIndexTableOptions {
  omitClick?: boolean;
}

export interface IIndexTableProps extends IShaDataTableProps, TableProps {
  tableRef?: MutableRefObject<Partial<DataTableFullInstance> | null>;
  options?: IIndexTableOptions;
  containerStyle?: CSSProperties;
  tableStyle?: CSSProperties;
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
  onRowDropped,
  allowRowDragAndDrop,
  options,
  containerStyle,
  tableStyle,
  customCreateUrl,
  customUpdateUrl,
  customDeleteUrl,
  onRowSave,
  ...props
}) => {
  const store = useDataTableStore();
  const { formMode, formData } = useForm(false) ?? { formMode: 'readonly', formData: {} };
  const { globalState } = useGlobalState();

  if (tableRef) tableRef.current = store;

  const {
    tableData,
    isFetchingTableData,
    totalPages,
    columns,
    pageSizeOptions,
    currentPage,
    selectedPageSize,
    tableFilter,
    onSelectRow: onSelectRowDeprecated,
    onDblClick: onDblClickDeprecated,
    selectedRow,
    selectedIds,
    tableSorting,
    quickSearch,
    onSort,
    changeSelectedIds,
    changeSelectedRow,
    setRowData,
    // succeeded,
    succeeded: { exportToExcel: exportToExcelSuccess },
    error: { exportToExcel: exportToExcelError },
  } = store;

  const onSelectRowLocal = (index: number, row: any) => {
    if (onSelectRow) {
      onSelectRow(index, row);
    }

    if (changeSelectedRow) {
      const rowId = row?.id;
      const currentId = store.selectedRow?.id;
      if (rowId !== currentId)
        changeSelectedRow(row);
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
    tableSorting,
  ]);

  useEffect(() => {
    if (onRowsChanged) {
      onRowsChanged(tableData);
    }
  }, [tableData]);

  const metadata = useMetadata(false)?.metadata;

  const crudOptions = useMemo(() => {

    const onNewRowInitializeExecuter = props.onNewRowInitialize
      ? new Function('data, globalState', props.onNewRowInitialize)
      : null;

    const onNewRowInitialize: RowDataInitializer = props.onNewRowInitialize
      ? () => {
        // todo: replace formData and globalState with accessors (e.g. refs) and remove hooks to prevent unneeded re-rendering
        //return onNewRowInitializeExecuter(formData, globalState);
        const result = onNewRowInitializeExecuter(formData ?? {}, globalState);
        return Promise.resolve(result);
      }
      : () => {
        return Promise.resolve({});
      };

    const result = {
      canDelete: props.canDeleteInline === 'yes' || props.canDeleteInline === 'inherit' && formMode === 'edit',
      canEdit: props.canEditInline === 'yes' || props.canEditInline === 'inherit' && formMode === 'edit',
      canAdd: props.canAddInline === 'yes' || props.canAddInline === 'inherit' && formMode === 'edit',
      onNewRowInitialize,
    };
    return {
      ...result,
      enabled: result.canAdd || result.canDelete || result.canEdit,
    };
  }, [props.canDeleteInline, props.canEditInline, props.canAddInline, formMode]);

  const preparedColumns = useMemo(() => {
    const localPreparedColumns = columns
      .filter(column => {
        return column.show && !(column.columnType === 'crud-operations' && !crudOptions.enabled);
      })
      .map<DataTableColumn>(columnItem => {
        const strictWidth = columnItem.minWidth && columnItem.maxWidth && columnItem.minWidth === columnItem.maxWidth
          ? columnItem.minWidth
          : undefined;

        const cellRenderer = getCellRenderer(columnItem, metadata);

        const column: DataTableColumn = {
          ...columnItem,
          accessor: camelcaseDotNotation(columnItem.accessor),
          Header: columnItem.header,
          minWidth: Boolean(columnItem.minWidth) ? columnItem.minWidth : undefined,
          maxWidth: Boolean(columnItem.maxWidth) ? columnItem.maxWidth : undefined,
          width: strictWidth,
          resizable: !strictWidth,
          disableSortBy: !columnItem.isSortable,
          disableResizing: Boolean(strictWidth),
          Cell: cellRenderer,
          originalConfig: columnItem,
        };
        return removeUndefinedProperties(column) as DataTableColumn;
      });

    return localPreparedColumns;
  }, [columns, crudOptions.enabled]);

  // sort
  const defaultSorting = tableSorting
    ? tableSorting.map<SortingRule<string>>(c => ({ id: c.id, desc: c.desc }))
    : columns
      .filter(c => c.defaultSorting !== null)
      .map<SortingRule<string>>(c => ({ id: c.id, desc: c.defaultSorting === 1 }));

  const performOnRowSave = useMemo<OnSaveHandler>(() => {
    if (!onRowSave)
      return data => Promise.resolve(data);

    const executer = new Function('data, formData, globalState', onRowSave);
    return (data, formData, globalState) => {
      const preparedData = executer(data, formData, globalState);
      return Promise.resolve(preparedData);
    };
  }, [onRowSave]);

  const updater = (rowIndex: number, rowData: any): Promise<any> => {
    const repository = store.getRepository();
    if (!repository)
      return Promise.reject('Repository is not specified');

    return performOnRowSave(rowData, formData ?? {}, globalState).then(preparedData => {
      const options = repository.repositoryType === BackendRepositoryType
        ? { customUrl: customUpdateUrl } as IUpdateOptions
        : undefined;

      return repository.performUpdate(rowIndex, preparedData, options).then(response => {
        setRowData(rowIndex, preparedData/*, response*/);
        return response;
      });
    });
  };

  const creater = (rowData: any): Promise<any> => {
    const repository = store.getRepository();
    if (!repository)
      return Promise.reject('Repository is not specified');

    const options = repository.repositoryType === BackendRepositoryType
      ? { customUrl: customCreateUrl } as ICreateOptions
      : undefined;

    return repository.performCreate(0, rowData, options).then(() => {
      store.refreshTable();
    });
  };

  const deleter = (rowIndex: number, rowData: any): Promise<any> => {
    const repository = store.getRepository();
    if (!repository)
      return Promise.reject('Repository is not specified');

    const options = repository.repositoryType === BackendRepositoryType
      ? { customUrl: customDeleteUrl } as IDeleteOptions
      : undefined;

    return repository.performDelete(rowIndex, rowData, options).then(() => {
      store.refreshTable();
    });
  };

  const tableProps: IReactTableProps = {
    data: tableData,
    // Disable sorting if we're in create mode so that the new row is always the first
    defaultSorting: defaultSorting,
    useMultiSelect,
    onSelectRow: onSelectRowLocal,
    onRowDoubleClick: dblClickHandler,
    onSelectedIdsChanged: changeSelectedIds,
    onMultiRowSelect,
    onSort, // Update it so that you can pass it as param. Quick fix for now
    columns: preparedColumns as Column<any>[], // todo: make ReactTable generic and remove this cast
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
    onRowDropped,
    allowRowDragAndDrop,
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
    inlineEditMode: props.inlineEditMode,
    inlineSaveMode: props.inlineSaveMode,
  };

  return (
    <Fragment>
      <div className="sha-child-table-error-container">
        {exportToExcelError && <ValidationErrors error={'Error occurred while exporting to excel'} />}
      </div>

      {tableProps.columns && tableProps.columns.length > 0 && <ReactTable {...tableProps} />}
    </Fragment>
  );
};

export default DataTable;