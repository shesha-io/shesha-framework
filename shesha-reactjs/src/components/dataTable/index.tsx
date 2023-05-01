import React, { FC, useEffect, Fragment, MutableRefObject, useMemo, CSSProperties } from 'react';
import { Column, SortingRule, TableProps } from 'react-table';
import {
  LoadingOutlined,
} from '@ant-design/icons';
import { DataTableColumn, IShaDataTableProps } from './interfaces';
import { DataTableFullInstance } from 'providers/dataTable/contexts';
import { ModalProps } from 'antd/lib/modal';
import ReactTable from '../reactTable';
import { removeUndefinedProperties } from 'utils/array';
import { ValidationErrors } from '..';
import { useDataTableStore, useMetadata } from 'providers';
import { camelcaseDotNotation } from 'utils/string';
import { IReactTableProps } from '../reactTable/interfaces';
import { usePrevious } from 'react-use';
import { getCellRenderer } from './cell';

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
  ...props
}) => {
  const store = useDataTableStore();

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
    parentEntityId,
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
    parentEntityId,
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
    const result = {
      canDelete: props.canDeleteInline === 'yes',
      canEdit: props.canEditInline === 'yes',
      canAdd: props.canAddInline === 'yes',
    };
    return {
      ...result,
      enabled: result.canAdd || result.canDelete || result.canEdit,
    };
  }, [props.canDeleteInline, props.canEditInline, props.canAddInline]);

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

  const updater = (rowIndex: number, rowData: any): Promise<any> => {
    const repository = store.getRepository();
    if (!repository)
      return Promise.reject('Repository is not specified');

    return repository.performUpdate(rowIndex, rowData).then(response => {
      setRowData(rowIndex, rowData/*, response*/);
      return response;
    });
  };

  const creater = (rowData: any): Promise<any> => {
    const repository = store.getRepository();
    if (!repository)
      return Promise.reject('Repository is not specified');

    return repository.performCreate(0, rowData).then(() => {
      store.refreshTable();
    });
  };

  const deleter = (rowIndex: number, rowData: any): Promise<any> => {
    const repository = store.getRepository();
    if (!repository)
      return Promise.reject('Repository is not specified');

    return repository.performDelete(rowIndex, rowData).then(() => {
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