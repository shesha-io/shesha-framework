import React, { FC, useEffect, useState, Fragment, MutableRefObject, useMemo, CSSProperties } from 'react';
import { Column, SortingRule, TableProps } from 'react-table';
import {
  LoadingOutlined,
} from '@ant-design/icons';
import { useShaRouting } from '../../providers/shaRouting';
import { IShaDataTableProps } from './interfaces';
import { renderers } from './columnRenderers';
import { DataTableFullInstance } from '../../providers/dataTable/contexts';
import { ModalProps } from 'antd/lib/modal';
import { nanoid } from 'nanoid/non-secure';
import ReactTable from '../reactTable';
import { removeUndefinedProperties } from '../../utils/array';
import { ValidationErrors } from '..';
import { useDataTableStore } from '../../providers';
import { camelcaseDotNotation } from '../../providers/form/utils';
import { IReactTableProps } from '../reactTable/interfaces';
import { usePrevious } from 'react-use';

export interface IIndexTableOptions {
  omitClick?: boolean;
}

export interface IIndexTableProps extends IShaDataTableProps, TableProps {
  tableRef?: MutableRefObject<Partial<DataTableFullInstance> | null>;
  records?: object[];
  options?: IIndexTableOptions;
  containerStyle?: CSSProperties;
  tableStyle?: CSSProperties;
}

export interface IExtendedModalProps extends ModalProps {
  content?: string;
}

export const IndexTable: FC<Partial<IIndexTableProps>> = ({
  useMultiselect: useMultiSelect,
  actionColumns,
  selectedRowIndex,
  onSelectRow,
  onDblClick,
  onMultiRowSelect,
  customTypeRenders,
  tableRef,
  onRowsChanged,
  onExportSuccess,
  onExportError,
  onFetchDataSuccess,
  onSelectedIdsChanged,
  records,
  onRowDropped,
  allowRowDragAndDrop,
  options,
  containerStyle,
  tableStyle,
}) => {
  const store = useDataTableStore();

  if (tableRef) tableRef.current = store;

  const { router } = useShaRouting();

  const {
    tableData: recordsFromProvider,
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
    // succeeded,
    succeeded: { exportToExcel: exportToExcelSuccess },
    error: { exportToExcel: exportToExcelError },
  } = store;

  const tableData = useMemo(() => {
    return records?.length ? records : recordsFromProvider;
  }, [records, recordsFromProvider]);

  const onSelectRowLocal = (index: number, row: any) => {
    if (onSelectRow) {
      onSelectRow(index, row);
    }

    if (changeSelectedRow) {
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

  const [preparedColumns, setPreparedColumns] = useState<Column<any>[]>([]);

  const table = useDataTableStore();

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

  // We are making sure that we only update the columns
  useEffect(() => {
    const localPreparedColumns = columns
      .filter(({ show }) => show)
      .map<Column<any>>(columnItem => {
        return {
          ...columnItem,
          accessor: camelcaseDotNotation(columnItem.accessor),
          Header: columnItem.header,
          minWidth: columnItem.minWidth,
          maxWidth: columnItem.maxWidth,
          width: undefined,
          resizable: true,
          Cell: props => {
            const allRenderers = [...(customTypeRenders || []), ...renderers];

            // Allow the user to override the default render behavior of the table without having to make changes to it
            if (allRenderers) {
              for (const customRender of allRenderers) {
                const { key, render } = customRender;

                if (columnItem.dataType === key || columnItem.dataFormat === key) {
                  return render(props, router) ?? null; // note: don't use `||`, it will hide zero values
                }
              }
            }

            return props.value || null;
          },
        };
      });

    const allActionColumns = [...(actionColumns || [])];

    // Now add a list of actions
    allActionColumns
      ?.filter(d => {
        return !!(Boolean(d?.onClick));
      })
      ?.reverse()
      ?.forEach(localData => {
        // @ts-ignore
        const clickHandler = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, props: any) => {
          event.preventDefault();
          const row = props?.row?.original;
          const currentId = row?.Id || row?.id;

          if (localData?.onClick) {
            const result = localData.onClick(currentId, table, props?.row?.original);

            if (typeof result === 'string') router?.push(result);
          }
        };

        // I'm assigning a random accessor because with react-table v
        const accessor = nanoid();

        localPreparedColumns.unshift({
          accessor,
          id: accessor, // This needs to be fixed
          Header: '',
          width: 35,
          minWidth: 35,
          maxWidth: 35,
          disableSortBy: true,
          disableResizing: true,
          Cell: props => {
            return (
              <a className="sha-link" onClick={e => clickHandler(e, props)}>
                {localData.icon}
              </a>
            );
          },
        });
      });

    setPreparedColumns(localPreparedColumns);
  }, [columns]);

  // sort
  const defaultSorting = tableSorting
    ? tableSorting.map<SortingRule<string>>(c => ({ id: c.id, desc: c.desc }))
    : columns
        .filter(c => c.defaultSorting !== null)
        .map<SortingRule<string>>(c => ({ id: c.id, desc: c.defaultSorting === 1 }));

  const isLoading = isFetchingTableData;

  const data = tableData;

  const tableProps: IReactTableProps = {
    data,
    // Disable sorting if we're in create mode so that the new row is always the first
    defaultSorting: defaultSorting,
    useMultiSelect,
    onSelectRow: onSelectRowLocal,
    onRowDoubleClick: dblClickHandler,
    onSelectedIdsChanged: changeSelectedIds,
    onMultiRowSelect,
    onSort, // Update it so that you can pass it as param. Quick fix for now
    columns: preparedColumns?.map(column => {
      const cleanedColumn = removeUndefinedProperties(column);

      return cleanedColumn as Column<any>;
    }),
    selectedRowIndex,
    loading: isLoading,
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

export default IndexTable;
