import React, { FC, useEffect, useMemo, useState, useRef, ChangeEvent, CSSProperties } from 'react';
import classNames from 'classnames';
import {
  useResizeColumns,
  useFlexLayout,
  useRowSelect,
  useSortBy,
  usePagination,
  Row,
  useTable,
  Column,
} from 'react-table';
import { LoadingOutlined } from '@ant-design/icons';
import { Empty, Spin } from 'antd';
import _ from 'lodash';
import { IReactTableProps, OnRowsReorderedArgs } from './interfaces';
import { nanoid } from 'nanoid/non-secure';
import { useDeepCompareEffect, usePrevious } from 'react-use';
import { RowDragHandle, SortableRow, TableRow } from './tableRow';
import ConditionalWrap from '../conditionalWrapper';
import { IndeterminateCheckbox } from './indeterminateCheckbox';
import { getPlainValue } from '../../utils';
import NewTableRowEditor from './newTableRowEditor';
import { ItemInterface, ReactSortable } from 'react-sortablejs';

interface IReactTableState {
  allRows: any[];
  allColumns: Column<any>[];
}

const ReactTable: FC<IReactTableProps> = ({
  columns = [],
  data = [],
  useMultiSelect = false,
  loading = false,
  defaultSorting = [],
  defaultCanSort = false,
  manualPagination = true,
  manualSortBy = true,
  manualFilters,
  disableSortBy = false,
  pageCount,
  onFetchData,
  onSelectRow,
  onRowDoubleClick,
  onResizedChange,
  onSelectedIdsChanged,
  onMultiRowSelect,
  onSort,
  scrollBodyHorizontally = false,
  height = 250,
  allowRowDragAndDrop = false,
  selectedRowIndex,
  containerStyle,
  minHeight,
  maxHeight,
  omitClick,
  tableStyle,

  canDeleteInline = false,
  deleteAction,

  canEditInline = false,
  updateAction,

  canAddInline = false,
  newRowCapturePosition,
  newRowInitData,
  createAction,
  inlineEditMode,
  inlineSaveMode,
  inlineEditorComponents,
  inlineCreatorComponents,
  inlineDisplayComponents,
  onRowsReordered,
}) => {
  const [componentState, setComponentState] = useState<IReactTableState>({
    allRows: data,
    allColumns: columns,
  });

  const { allColumns, allRows } = componentState;

  const defaultColumn = React.useMemo(
    () => ({
      // When using the useFlexLayout:
      minWidth: 30, // minWidth is only used as a limit for resizing
      width: 150, // width is used for both the flex-basis and flex-grow
      // maxWidth: 200, // maxWidth is only used as a limit for resizing
    }),
    []
  );

  const preparedColumns = useMemo(() => {
    const localColumns = [...allColumns];

    if (allowRowDragAndDrop) {
      localColumns.unshift({
        accessor: nanoid(),
        // id: accessor, // This needs to be fixed
        Header: '',
        width: 35,
        minWidth: 35,
        maxWidth: 35,
        disableSortBy: true,
        disableResizing: true,
        Cell: () => <RowDragHandle />,
      });
    }

    return localColumns;
  }, [allColumns, allowRowDragAndDrop]);

  const getColumnAccessor = cid => {
    const column = columns.find(c => c.id === cid);
    return column ? column.accessor.toString() : '';
  };

  const initialSorting = useMemo(() => {
    if (!defaultSorting) return [];
    return defaultSorting.map(s => {
      return { ...s, id: getColumnAccessor(s.id) };
    });
  }, [defaultSorting]);

  useDeepCompareEffect(() => {
    setComponentState(prev => ({ ...prev, allRows: data }));
  }, [data]);

  useDeepCompareEffect(() => {
    setComponentState(prev => ({ ...prev, allColumns: columns }));
  }, [columns]);

  const allRowsRef = useRef(allRows);

  useEffect(() => {
    allRowsRef.current = allRows;
  }, [allRows]);

  const onChangeHeader = (callback: (...args: any) => void, rows: Row<any>[] | Row) => (e: ChangeEvent) => {
    callback(e);

    if (onMultiRowSelect) {
      const isSelected = !!(e.target as any)?.checked;
      let selectedRows: Row<any>[] | Row;

      if (Array.isArray(rows)) {
        selectedRows = getPlainValue(rows).map(i => ({ ...i, isSelected }));
      } else {
        selectedRows = { ...getPlainValue(rows), isSelected };
      }

      onMultiRowSelect(selectedRows);
    }
  };

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, state, columns: tableColumns } = useTable(
    {
      columns: preparedColumns,
      data: allRows,
      defaultColumn,
      initialState: {
        sortBy: initialSorting,
        hiddenColumns: columns
          .map((column: any) => {
            if ([column.isVisible, column.show].includes(false)) return column.accessor || column.id;
          })
          ?.filter(Boolean),
      },
      defaultCanSort,
      manualFilters,
      manualPagination,
      manualSortBy,
      disableSortBy,
      pageCount,
    },
    useSortBy,
    useResizeColumns,
    useFlexLayout,
    usePagination,
    useRowSelect,
    // useBlockLayout,
    ({ useInstanceBeforeDimensions, allColumns }) => {
      if (useMultiSelect) {
        allColumns.push(localColumns => [
          // Let's make a column for selection
          {
            id: 'selection',
            disableResizing: true,
            minWidth: 35,
            width: 35,
            maxWidth: 35,
            disableSortBy: true,
            // The header can use the table's getToggleAllRowsSelectedProps method
            // to render a checkbox
            Header: ({ getToggleAllRowsSelectedProps: toggleProps, rows }) => (
              <span>
                <IndeterminateCheckbox {...toggleProps()} onChange={onChangeHeader(toggleProps().onChange, rows)} />
              </span>
            ),
            // The cell can use the individual row's getToggleRowSelectedProps method
            // to the render a checkbox
            Cell: ({ row }) => (
              <span>
                <IndeterminateCheckbox
                  {...row.getToggleRowSelectedProps()}
                  onChange={onChangeHeader(row.getToggleRowSelectedProps().onChange, row)}
                />
              </span>
            ),
          },
          ...localColumns,
        ]);
        useInstanceBeforeDimensions?.push(({ headerGroups: localHeaderGroups }) => {
          if (Array.isArray(localHeaderGroups)) {
            // fix the parent group of the selection button to not be resizable
            const selectionGroupHeader = localHeaderGroups[0]?.headers[0];
            if (selectionGroupHeader) {
              selectionGroupHeader.canResize = false;
            }
          }
        });
      }
    }
  );

  const { pageIndex, pageSize, selectedRowIds, sortBy } = state;

  const previousSortBy = usePrevious(sortBy);

  useEffect(() => {
    if (onSort && !_.isEqual(_.sortBy(previousSortBy), _.sortBy(sortBy))) {
      onSort(sortBy);
    }
  }, [sortBy]);

  useEffect(() => {
    if (selectedRowIds && typeof onSelectedIdsChanged === 'function') {
      const arrays: string[] = allRows
        ?.map(({ id }, index) => {
          if (selectedRowIds[index]) {
            return id;
          }

          return null;
        })
        ?.filter(Boolean);

      onSelectedIdsChanged(arrays);
    }
  }, [selectedRowIds]);

  /*
  const onSortEnd = useCallback(({ oldIndex, newIndex }) => {
    if (onRowDropped) {
      onRowDropped(camelCaseKeys(allRowsRef?.current[oldIndex], { deep: true, pascalCase: true }), oldIndex, newIndex);
    }
    setComponentState(prev => ({ ...prev, allRows: arrayMove(prev?.allRows, oldIndex, newIndex) }));
  }, []);
  */

  const onSetList = (newState: ItemInterface[], _sortable, _store) => {
    if (!onRowsReordered){
      console.error('Datatable: re-ordering logic is not specified');
      return;
    }

    const chosen = newState.some(item => item.chosen === true);
    if (chosen)
      return;

    //console.log('LOG: onSortEnd', chosen, newState, {_sortable, _store});

    if (rows.length === newState.length){
      let isModified = false;
      // detect changes using references
      const newRows = [];
      for (let i = 0; i < rows.length; i++){
        const typedRow = newState[i] as Row<any>;
        if (rows[i] !== typedRow){
          isModified = true;
          //break;
        }
        newRows.push(typedRow.original);
      }
      
      if (isModified){
        const payload: OnRowsReorderedArgs = {
          reorderedRows: newRows
        };
        onRowsReordered(payload).then(() => {
          // optimistic update
          setComponentState(prev => ({ ...prev, allRows: newRows }));
        });
      }
    } else
      console.log('LOG: length differs', { rowsLength: rows.length, newStateLength: newState.length });
  };


  // Listen for changes in pagination and use the state to fetch our new data
  useEffect(() => {
    if (onFetchData) {
      // onFetchData();
    }
  }, [onFetchData, pageIndex, pageSize, sortBy]);

  const onResizeClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => event?.stopPropagation();

  const handleSelectRow = (row: Row<object>) => {
    if (!omitClick && !(canEditInline || canDeleteInline)) {
      onSelectRow(row?.index, row?.original);
    }
  };

  useEffect(() => {
    if (onResizedChange) {
      onResizedChange(state?.columnResizing);
    }
  }, [state?.columnResizing]);

  const handleDoubleClickRow = (row: Row<object>, index: number) => {
    if (onRowDoubleClick) {
      onRowDoubleClick(row?.original, index);
    }
  };

  const Row = useMemo(() => (allowRowDragAndDrop ? SortableRow : TableRow), [allowRowDragAndDrop]);

  const renderNewRowEditor = () => (
    <NewTableRowEditor
      columns={tableColumns}
      creater={createAction}
      headerGroups={headerGroups}
      onInitData={newRowInitData}
      components={inlineCreatorComponents}
    />
  );

  const containerStyleFinal = useMemo<CSSProperties>(() => {
    const result = containerStyle ?? {};
    if (minHeight)
      result.minHeight = `${minHeight}px`;
    if (maxHeight)
      result.maxHeight = `${maxHeight}px`;

    return result;
  }, [containerStyle, minHeight, maxHeight]);

  const renderRow = (row: Row<any>, rowIndex: number) => {
    const id = row.original?.id;
    return (
      <Row
        key={id ?? rowIndex}
        prepareRow={prepareRow}
        onClick={handleSelectRow}
        onDoubleClick={handleDoubleClickRow}
        row={row}
        index={rowIndex}
        allowSort={allowRowDragAndDrop}
        selectedRowIndex={selectedRowIndex}

        allowEdit={canEditInline}
        updater={(rowData) => updateAction(rowIndex, rowData)}

        allowDelete={canDeleteInline}
        deleter={() => deleteAction(rowIndex, row.original)}

        allowChangeEditMode={inlineEditMode === 'one-by-one'}
        editMode={canEditInline && inlineEditMode === 'all-at-once' ? 'edit' : undefined}
        inlineSaveMode={inlineSaveMode}
        inlineEditorComponents={inlineEditorComponents}
        inlineDisplayComponents={inlineDisplayComponents}
      />
    );
  };

  return (
    <Spin
      spinning={loading}
      indicator={
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <LoadingOutlined style={{ fontSize: 24 }} spin />
          <span style={{ marginLeft: 12, fontSize: 14, color: 'black' }}>loading...</span>
        </span>
      }
    >
      <div className="sha-react-table" style={containerStyleFinal}>
        <div {...getTableProps()} className="sha-table" style={tableStyle}>
          {columns?.length > 0 &&
            headerGroups.map(headerGroup => (
              <div
                {...headerGroup.getHeaderGroupProps({
                  // style: { paddingRight: '15px' },
                })}
                className={classNames('tr tr-head')}
              >
                {headerGroup?.headers?.map((column, index) => {
                  return (
                    <div
                      key={index}
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      className={classNames('th', {
                        'sorted-asc': column.isSorted && column.isSortedDesc,
                        'sorted-desc': column.isSorted && !column.isSortedDesc,
                      })}
                    >
                      {column.render('Header')}

                      {/* Use column.getResizerProps to hook up the events correctly */}
                      {column.canResize && (
                        <div
                          {...column.getResizerProps()}
                          className={classNames('resizer', { isResizing: column.isResizing })}
                          onClick={onResizeClick}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          {canAddInline && newRowCapturePosition === 'top' && (renderNewRowEditor())}

          <div
            className="tbody"
            style={{
              height: scrollBodyHorizontally ? height || 250 : 'unset',
              overflowY: scrollBodyHorizontally ? 'auto' : 'unset',
            }}
            {...getTableBodyProps()}
          >
            {rows?.length === 0 && !loading && (
              <div className="sha-table-empty">
                <Empty description="There is no data for this table" />
              </div>
            )}

            <ConditionalWrap
              condition={allowRowDragAndDrop}
              wrap={children => (
                <ReactSortable
                  list={rows}
                  setList={onSetList}
                  fallbackOnBody={true}
                  swapThreshold={0.5}
                  group={{
                    name: 'rows',
                  }}
                  sort={true}
                  draggable=".tr-body"
                  animation={75}
                  ghostClass="tr-body-ghost"
                  emptyInsertThreshold={20}
                  handle=".row-handle"
                  scroll={true}
                  bubbleScroll={true}
                >
                  {children}
                </ReactSortable>
              )}
            >
              {rows.map((row, rowIndex) => renderRow(row, rowIndex))}
            </ConditionalWrap>
          </div>
          {canAddInline && newRowCapturePosition === 'bottom' && (renderNewRowEditor())}
        </div>
      </div>
    </Spin>
  );
};

export default ReactTable;