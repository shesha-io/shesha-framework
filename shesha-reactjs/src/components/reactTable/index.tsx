import React, { FC, useEffect, useMemo, useState, useRef, ChangeEvent, CSSProperties, ReactElement } from 'react';
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
import { LoadingOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { App, Spin, Tooltip } from 'antd';
import _ from 'lodash';
import { IReactTableProps, OnRowsReorderedArgs } from './interfaces';
import { nanoid } from '@/utils/uuid';
import { useDeepCompareEffect, usePrevious } from 'react-use';
import { RowDragHandle, SortableRow, TableRow } from './tableRow';
import ConditionalWrap from '@/components/conditionalWrapper';
import { IndeterminateCheckbox } from './indeterminateCheckbox';
import { getPlainValue } from '@/utils';
import { getColumnAnchored } from '@/utils/datatable';
import NewTableRowEditor from './newTableRowEditor';
import { ItemInterface, ReactSortable } from 'react-sortablejs';
import { IConfigurableActionConfiguration, useConfigurableActionDispatcher, useDataTableStore, useShaFormInstanceOrUndefined } from '@/providers';
import { useAvailableConstantsData } from '@/providers/form/utils';
import { useStyles, useMainStyles } from './styles/styles';
import { IAnchoredColumnProps } from '@/providers/dataTable/interfaces';
import { DataTableColumn } from '../dataTable/interfaces';
import { EmptyState } from '..';
import { ErrorDetails } from '@/utils/configurationFramework/actions';
import axios from 'axios';
import { isAxiosResponse } from '@/interfaces/ajaxResponse';
import { getBorderStyle } from '@/designer-components/_settings/utils/index';
import { useCanvasState } from '@/providers/canvas';

interface IReactTableState {
  allRows: any[];
  allColumns: Column<any>[];
}

export const ReactTable: FC<IReactTableProps> = ({
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
  onRowClick,
  onRowHover,
  onResizedChange,
  onSelectedIdsChanged,
  onMultiRowSelect,
  onSort,
  scrollBodyHorizontally = false,
  height = 250,
  allowReordering = false,
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
  freezeHeaders,
  noDataText = "No Data",
  noDataSecondaryText = "No data is available for this table",
  noDataIcon,
  onRowsRendering,
  onRowsReordered,
  showExpandedView,

  rowBackgroundColor,
  rowAlternateBackgroundColor,
  rowHoverBackgroundColor,
  rowSelectedBackgroundColor,
  border,
}) => {
  const [componentState, setComponentState] = useState<IReactTableState>({
    allRows: data,
    allColumns: columns,
  });
  const { notification } = App.useApp();

  const [activeCell, setActiveCell] = useState();
  const [allowExpandedView, setAllowExpandedView] = useState<Boolean>(false);
  const [isCellContentOverflowing, setIsCellContentOverflowing] = useState<Boolean>(false);
  const { styles } = useStyles();
  const { styles: mainStyles } = useMainStyles({
    rowBackgroundColor,
    rowAlternateBackgroundColor,
    rowHoverBackgroundColor,
    rowSelectedBackgroundColor,
    border,
  });

  const { setDragState } = useDataTableStore();

  const shaForm = useShaFormInstanceOrUndefined();
  const canvasState = useCanvasState(false);

  const { allColumns, allRows } = componentState;

  const defaultColumn = React.useMemo(
    () => ({
      // When using the useFlexLayout:
      minWidth: 30, // minWidth is only used as a limit for resizing
      width: 150, // width is used for both the flex-basis and flex-grow
      // maxWidth: 200, // maxWidth is only used as a limit for resizing
    }),
    [],
  );

  const onChangeHeader = (callback: (...args: any) => void, rows: Row<any>[] | Row) => (e: ChangeEvent) => {
    callback(e);

    if (onMultiRowSelect) {
      const isSelected = !!(e.target as any)?.checked;
      let selectedRows: Row<any>[] | Row;

      if (Array.isArray(rows)) {
        selectedRows = getPlainValue(rows).map((i) => ({ ...i, isSelected }));
      } else {
        selectedRows = { ...getPlainValue(rows), isSelected };
      }

      onMultiRowSelect(selectedRows);
    }
  };

  const preparedColumns = useMemo(() => {
    const localColumns = [...allColumns];

    if (useMultiSelect) {
      localColumns.unshift({
        id: 'selection',
        // isVisible: true,
        disableResizing: true,
        minWidth: 37,
        width: 37,
        maxWidth: 37,
        disableSortBy: true,
        // The header can use the table's getToggleAllRowsSelectedProps method
        // to render a checkbox
        Header: ({ getToggleAllRowsSelectedProps: toggleProps, rows }) => (
          <span className={styles.shaSpanCenterVertically}>
            <IndeterminateCheckbox {...toggleProps()} onChange={onChangeHeader(toggleProps().onChange, rows)} />
          </span>
        ),
        // The cell can use the individual row's getToggleRowSelectedProps method
        // to the render a checkbox
        Cell: ({ row }) => (
          <span className={styles.shaSpanCenterVertically}>
            <IndeterminateCheckbox
              {...row.getToggleRowSelectedProps()}
              onChange={onChangeHeader(row.getToggleRowSelectedProps().onChange, row)}
            />
          </span>
        ),
      });
    }

    if (allowReordering) {
      localColumns.unshift({
        accessor: nanoid(),
        // id: accessor, // This needs to be fixed
        Header: '',
        width: 35,
        minWidth: 35,
        maxWidth: 35,
        disableSortBy: true,
        disableResizing: true,
        Cell: ({ row }) => <RowDragHandle row={row} />,
      });
    }

    return localColumns.sort((a: DataTableColumn<any>, b: DataTableColumn<any>) => {
      if (a.anchored === 'left' && b.anchored !== 'left') return -1;
      if (a.anchored === 'right' && b.anchored !== 'right') return 1;
      if (b.anchored === 'left' && a.anchored !== 'left') return 1;
      if (b.anchored === 'right' && a.anchored !== 'right') return -1;

      return 0;
    });
  }, [allColumns, allowReordering, useMultiSelect]);

  const getColumnAccessor = (cid): string => {
    const column = columns.find((c) => c.id === cid);
    return column ? column.accessor.toString() : '';
  };

  const initialSorting = useMemo(() => {
    if (!defaultSorting) return [];
    const result = defaultSorting.map((s) => ({ ...s, id: getColumnAccessor(s.id) })).filter((s) => Boolean(s.id));
    return result;
  }, [defaultSorting]);

  useDeepCompareEffect(() => {
    setComponentState((prev) => ({ ...prev, allRows: data }));
  }, [data]);

  useDeepCompareEffect(() => {
    setComponentState((prev) => ({ ...prev, allColumns: columns }));
  }, [columns]);

  const allRowsRef = useRef(allRows);

  useEffect(() => {
    allRowsRef.current = allRows;
  }, [allRows]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    state,
    rows,
    columns: tableColumns,
  } = useTable(
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
    ({ useInstanceBeforeDimensions }) => {
      if (useMultiSelect) {
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
    },
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

  const onSetList = (newState: ItemInterface[], _sortable, _store): void => {
    if (!onRowsReordered) {
      console.error('Datatable: re-ordering logic is not specified');
      return;
    }

    const chosen = newState.some((item) => item.chosen === true);
    if (chosen) return;

    if (rows.length === newState.length) {
      const changedIndex = newState.find((item, index) => {
        const typedRow = item as Row<any>;
        return typedRow.original !== rows[index].original;
      });
      if (changedIndex) {
        const oldRows = rows.map((row) => row.original);
        const newRows = newState.map((row) => row.original);

        let oldIndex = -1;
        let newIndex = -1;

        for (let i = 0; i < oldRows.length; i++) {
          if (oldRows[i] !== newRows[i]) {
            if (oldIndex === -1) {
              const movedItem = newRows[i];
              oldIndex = oldRows.findIndex((item) => item === movedItem);
              newIndex = i;
              break;
            }
          }
        }

        const payload: OnRowsReorderedArgs = {
          getOld: () => rows.map((row) => row.original),
          getNew: () => newState.map((row) => row.original),
          applyOrder: (orderedItems) => {
            setComponentState((prev) => ({ ...prev, allRows: orderedItems }));
          },
          oldIndex: oldIndex >= 0 ? oldIndex : undefined,
          newIndex: newIndex >= 0 ? newIndex : undefined,
        };

        onRowsReordered(payload).catch((error) => {
          const unwrappedError = axios.isAxiosError(error) && isAxiosResponse(error.response) && error.response.data?.error
            ? error.response.data.error
            : error;
          notification.error({
            message: 'Sorry! An error occurred.',
            icon: null,
            description: <ErrorDetails showDetails error={unwrappedError} />,
          });
        });
      }
    }
  };

  // Listen for changes in pagination and use the state to fetch our new data
  useEffect(() => {
    if (onFetchData) {
      // onFetchData();
    }
  }, [onFetchData, pageIndex, pageSize, sortBy]);

  const onResizeClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>): void => event?.stopPropagation();

  const handleSelectRow = (row: Row<object>): void => {
    if (!omitClick && !(canEditInline || canDeleteInline)) {
      onSelectRow(row?.index, row?.original);
    }
  };

  useEffect(() => {
    if (onResizedChange) {
      onResizedChange(tableColumns, state?.columnResizing);
    }
  }, [state?.columnResizing]);

  const { executeAction } = useConfigurableActionDispatcher();
  const allData = useAvailableConstantsData();
  const performOnRowDoubleClick = useMemo(() => {
    if (!onRowDoubleClick)
      return () => {
        /* nop*/
      };

    return (data) => {
      const evaluationContext = {
        ...allData,
        data,
        selectedRow: data?.original,
      };

      executeAction({
        actionConfiguration: onRowDoubleClick as IConfigurableActionConfiguration,
        argumentsEvaluationContext: evaluationContext,
      });
    };
  }, [onRowDoubleClick, allData]);

  const handleDoubleClickRow = (row, index): void => {
    if (typeof onRowDoubleClick === 'object') {
      performOnRowDoubleClick(row);
    } else if (typeof onRowDoubleClick === 'function') {
      onRowDoubleClick(row?.original, index);
    }
  };

  const Row = useMemo(() => (allowReordering ? SortableRow : TableRow), [allowReordering]);

  const renderNewRowEditor = (): JSX.Element => (
    <NewTableRowEditor
      columns={tableColumns}
      creater={createAction}
      headerGroups={headerGroups}
      onInitData={newRowInitData}
      components={inlineCreatorComponents}
      parentFormId={shaForm?.formId}
    />
  );

  const containerStyleFinal = useMemo<CSSProperties>(() => {
    const result = { ...containerStyle };
    if (minHeight) result.minHeight = `${minHeight}px`;
    if (maxHeight) result.maxHeight = `${maxHeight}px`;

    // to allow the table to overflow the container on y-axis
    if (freezeHeaders && !result.maxHeight) {
      result.maxHeight = '80vh';
    }

    return result;
  }, [containerStyle, minHeight, maxHeight]);

  const renderExpandedContentView = (cellRef): JSX.Element => {
    const cellRect = cellRef?.current?.getBoundingClientRect();

    const getSmartPosition = (): { top: number; left: number } => {
      if (!cellRect) return { top: 0, left: 0 };

      // Get the canvas zoom level (default to 100 if not available)
      const zoomLevel = canvasState?.zoom ?? 100;
      const zoomScale = Math.max(0.01, zoomLevel / 100);

      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      const popup = {
        width: Math.max(cellRect.width, 80),
        height: 60,
      };

      const offset = 20;
      const margin = 10;
      const bottomOffset = 5;

      let top = (cellRect.top / zoomScale) + offset;
      let left = (cellRect.left / zoomScale) + offset;

      const scaledPopupWidth = popup.width / zoomScale;
      const scaledPopupHeight = popup.height / zoomScale;

      if (left + scaledPopupWidth + margin > viewport.width / zoomScale) {
        left = (cellRect.right / zoomScale) - scaledPopupWidth - offset;
      }

      if (left < margin) {
        left = margin;
      }

      if (top + scaledPopupHeight + margin > viewport.height / zoomScale) {
        top = (cellRect.top / zoomScale) - scaledPopupHeight - bottomOffset;
      }

      if (top < margin) {
        top = margin;
      }

      return { top, left };
    };

    const position = getSmartPosition();

    return (
      <div
        onMouseEnter={(event) => {
          event.stopPropagation();
        }}
        onMouseLeave={(event) => {
          event.stopPropagation();
          setAllowExpandedView(false);
          setActiveCell(null);
          setIsCellContentOverflowing(false);
        }}
        style={{
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: allowExpandedView && isCellContentOverflowing ? 1 : 0,
          transform: allowExpandedView && isCellContentOverflowing ? 'scale(1)' : 'scale(0.95)',
          visibility: allowExpandedView && isCellContentOverflowing ? 'visible' : 'hidden',
          position: 'fixed',
          minWidth: 160,
          maxWidth: Math.min(cellRect?.width || 200, window.innerWidth - 40),
          width: cellRect?.width,
          borderRadius: 8,
          padding: activeCell !== null && allowExpandedView && 10,
          top: `${position.top}px`,
          left: `${position.left}px`,
          zIndex: 50,
          transformOrigin: 'center',
          pointerEvents: activeCell !== null && allowExpandedView ? 'auto' : 'none',
        }}
      >
        <div
          style={{
            maxHeight: 300,
            overflowY: "auto",
            backgroundColor: "white",
            padding: 8,
            border: "1px solid rgba(0,0,0,0.15)",
            borderRadius: 4,
            boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
            display: "inline-block",
            whiteSpace: "pre-wrap",
            maxWidth: "80vw",
            wordBreak: "break-word",
          }}
        >
          {cellRef?.current?.innerText}
        </div>
      </div>
    );
  };

  const renderRow = (row: Row<any>, rowIndex: number): JSX.Element => {
    const id = row.original?.id;
    return (
      <Row
        key={id ?? rowIndex}
        prepareRow={prepareRow}
        onClick={handleSelectRow}
        onDoubleClick={() => handleDoubleClickRow(row, rowIndex)}
        onRowClick={onRowClick ? () => onRowClick(rowIndex, row.original) : undefined}
        onRowHover={onRowHover ? () => onRowHover(rowIndex, row.original) : undefined}
        row={row}
        showExpandedView={showExpandedView}
        index={rowIndex}
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
        onMouseOver={(activeCell, isContentOverflowing) => {
          setActiveCell(activeCell);
          setIsCellContentOverflowing(isContentOverflowing && activeCell?.current?.innerText);
          if (activeCell && isContentOverflowing) {
            setAllowExpandedView(true);
          }
        }}
        onMouseLeave={() => {
          setActiveCell(null);
          setAllowExpandedView(false);
          setIsCellContentOverflowing(false);
        }}
      />
    );
  };

  const renderRows = (): ReactElement | ReactElement[] => {
    return onRowsRendering
      ? onRowsRendering({ rows: rows, defaultRender: renderRow })
      : rows.map((row, rowIndex) => renderRow(row, rowIndex));
  };

  const fixedHeadersStyle: React.CSSProperties = freezeHeaders
    ? { position: 'sticky', top: 0, zIndex: 15, background: 'white', opacity: 1 }
    : null;

  return (
    <Spin
      spinning={loading}
      indicator={(
        <span style={{ display: 'flex', alignItems: 'center' }}>
          <LoadingOutlined style={{ fontSize: 24 }} spin />
          <span style={{ marginLeft: 12, fontSize: 14, color: 'black' }}>loading...</span>
        </span>
      )}
    >
      <div className={mainStyles.shaReactTable} style={containerStyleFinal}>
        <div {...getTableProps()} className={styles.shaTable} style={tableStyle}>
          {columns?.length > 0 &&
            headerGroups.map((headerGroup) => {
              const { key, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
              return (
                <div
                  key={key}
                  {...headerGroupProps}
                  className={classNames(styles.tr, styles.trHead)}
                  style={{ ...fixedHeadersStyle, display: 'flex' }} // Make the header row sticky
                >
                  {headerGroup?.headers?.map((column, index) => {
                    const anchored = getColumnAnchored((column as any)?.anchored);
                    let leftColumn: IAnchoredColumnProps = { shift: 0, shadowPosition: 0 };
                    let rightColumn: IAnchoredColumnProps = { shift: 0, shadowPosition: 0 };

                    if (anchored?.isFixed && index > 0) {
                      // use first row cell values to calculate the left shift

                      if (anchored?.direction === 'right') {
                        const totalColumns = headerGroup?.headers?.length;
                        rightColumn.shift = (
                          rows[0]?.cells?.slice(index, totalColumns - 1)?.map((col) => {
                            const isLessThanMinWidth = (col?.column?.width as number) < col?.column?.minWidth;

                            return isLessThanMinWidth ? col?.column?.minWidth : col?.column?.width;
                          }) as Array<number>
                        )?.reduce((acc, curr) => (acc as number) + curr, 0);
                        rightColumn.shadowPosition =
                          headerGroup?.headers?.length -
                          headerGroup?.headers?.filter(
                            (col: any) => getColumnAnchored((col as any)?.anchored).direction === 'right',
                          ).length;
                      } else if (anchored?.direction === 'left') {
                        leftColumn.shift = (
                          rows[0]?.cells?.slice(0, index)?.map((col) => {
                            const isLessThanMinWidth = (col?.column?.width as number) < col?.column?.minWidth;

                            return isLessThanMinWidth ? col?.column?.minWidth : col?.column?.width;
                          }) as Array<number>
                        )?.reduce((acc, curr) => (acc as number) + curr, 0);

                        leftColumn.shadowPosition =
                          headerGroup?.headers?.filter(
                            (col: any) => getColumnAnchored((col as any)?.anchored).direction === 'left',
                          ).length - 1;
                      }
                    }

                    const direction = anchored?.direction === 'left' ? 'left' : 'right';

                    const shiftedBy = leftColumn.shift || rightColumn.shift;

                    const { key, ...headerProps } = { ...column.getHeaderProps(column.getSortByToggleProps()) };

                    delete headerProps.style.position;

                    const numOfFixed = leftColumn.shadowPosition || rightColumn.shadowPosition;

                    const hasShadow = numOfFixed === index && anchored?.isFixed;

                    return (
                      <div
                        key={key}
                        {...headerProps}
                        className={classNames(styles.th, {
                          [styles.sortedAsc]: !column.disableSortBy && column.isSorted && column.isSortedDesc,
                          [styles.sortedDesc]: !column.disableSortBy && column.isSorted && !column.isSortedDesc,
                          [anchored?.isFixed ? styles.fixedColumn : styles.relativeColumn]: true,
                          [anchored?.direction === 'right' ? styles.boxShadowRight : styles.boxShadowLeft]: hasShadow,
                        })}
                        style={{
                          ...headerProps?.style,
                          [direction]: shiftedBy,
                          backgroundColor: 'white',
                          borderBottom: '1px solid #f0f0f0',
                          fontWeight: '600',
                        }}
                      >
                        {column.render('Header')}
                        {(column as any)?.columnType === 'data' && (column as any)?.description && (
                          <Tooltip title={(column as any)?.description}>
                            <QuestionCircleOutlined className={styles.shaTooltipIcon} />
                          </Tooltip>
                        )}

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
              );
            })}
          {canAddInline && newRowCapturePosition === 'top' && renderNewRowEditor()}

          <div
            className={styles.tbody}
            style={{
              height: scrollBodyHorizontally ? height || 250 : 'unset',
              overflowY: scrollBodyHorizontally ? 'auto' : 'unset',
              overflowX: 'unset',
              ...(rows?.length <= 3 && data?.length <= 3 ? {} : getBorderStyle(border, {})),
            }}
            {...getTableBodyProps()}
          >
            {rows?.length === 0 && !loading && (
              <EmptyState noDataIcon={noDataIcon} noDataSecondaryText={noDataSecondaryText} noDataText={noDataText} />
            )}

            <ConditionalWrap
              condition={allowReordering}
              wrap={(children) => (
                <ReactSortable
                  onUnchoose={(_evt) => {
                    setDragState('finished');
                  }}
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
                  style={rows?.length <= 3 && data?.length <= 3 ? {} : getBorderStyle(border, {})}
                  className={styles.shaSortable}
                >
                  {children}
                </ReactSortable>
              )}
            >
              {renderRows()}
            </ConditionalWrap>
          </div>
          {canAddInline && newRowCapturePosition === 'bottom' && renderNewRowEditor()}
          {renderExpandedContentView(activeCell)}
        </div>
      </div>
    </Spin>
  );
};
