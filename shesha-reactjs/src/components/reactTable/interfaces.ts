import { ReactNode, CSSProperties } from 'react';
import { Column, Row, SortingRule, TableState } from 'react-table';

export interface IColumnWidth {
  id: React.Key;
  value: number;
}

export interface IColumnResizing {
  startX?: number;
  columnWidth: number;
  headerIdWidths: Record<string, number>;
  columnWidths: { [key: number]: number };
  isResizingColumn?: string;
}

export interface ITableRowDragProps {
  allowRowDragAndDrop?: boolean;

  onRowDropped?: (row: any, oldIndex: number, newIndex: number) => void;
}

export interface IReactTableProps extends ITableRowDragProps {
  /**
   * @deprecated - use scrollBodyHorizontally
   * Whether the table should be scrollable or not
   */
  scroll?: boolean;

  /**
   * The core columns configuration object for the entire table. Must be memoized
   */
  columns?: Array<Column<any>>;

  /**
   * The data array that you want to display on the table.
   */
  data?: any[];

  /**
   *
   */
  reactTableRef?: React.MutableRefObject<any>;

  /**
   * Class name for the table container
   */
  className?: string;

  /**
   * Whether the data is being fetched or not
   */
  loading?: boolean;

  /**
   * Loading data message
   */
  loadingText?: ReactNode | (() => ReactNode);

  /**
   * Whether the table should allow multi-select
   */
  useMultiSelect?: boolean;

  /**
   * The default column object for every column passed to React Table.
   *
   * Column-specific properties will override the properties in this object, eg. `{ ...defaultColumn, ...userColumn }`
   */
  defaultColumn?: Partial<Column<any>>;

  /**
   * Whether columns should be resized or not
   */
  resizableColumns?: boolean;

  /**
   * An array of sorting objects. If there is more than one object in the array, multi-sorting will be enabled.
   * Each sorting object should contain an id key with the corresponding column ID to sort by. An optional desc
   * key (which defaults to false) may be set to true to indicate a descending sorting directionfor that column,
   * otherwise, it will be assumed to be ascending. This information is stored in state since the table is allowed
   * to manipulate the filter through user interaction.
   */
  defaultSorting?: SortingRule<string | number>[];

  /**
   * If set to true, all columns will be sortable, regardless if they have a valid accessor
   */
  defaultCanSort?: boolean;

  /**
   * A callback to refetch data
   */
  onFetchData?: () => void;
  /**
   * Required if manualPagination is set to true
   * If manualPagination is true, then this value used to determine the amount of pages available. This amount is then used to materialize the pageOptions and also compute the canNextPage values on the table instance.
   * Set to -1 if you don't know or don't want to present the number of pages available. canNextPage will return false if page data length is less than pageSize, otherwise true.
   */
  pageCount?: number;

  /**
   *
   */
  manualFilters?: boolean;
  /**
   * Enables pagination functionality, but does not automatically perform row pagination.
   * Turn this on if you wish to implement your own pagination outside of the table (eg. server-side pagination or any other manual pagination technique)
   */
  manualPagination?: boolean;

  /**
   * Enables sorting detection functionality, but does not automatically perform row sorting.
   * Turn this on if you wish to implement your own sorting outside of the table (eg. server-side or manual row grouping/nesting)
   */
  manualSortBy?: boolean;

  /**
   * Enables filter detection functionality, but does not automatically perform row filtering.
   * Turn this on if you wish to implement your own row filter outside of the table (e.g. server-side or manual row grouping/nesting)
   */
  selectedRowIds?: string[];

  /**
   * A callback for selecting the row
   */
  onSelectRow?: (index: number, row: any) => void;

  /**
   * A callback for double-clicking the rows
   */
  onRowDoubleClick?: (rowData: any, index?: number) => void;

  /**
   * A callback for when ids are selected. Required if useMultiSelect is true
   */
  onSelectedIdsChanged?: (ids: string[]) => void;

  /**
   * A callback for when multiple rows are selected with checkbox. Applicable if useMultiSelect is true
   */
  onMultiRowSelect?: (rows: Array<Row> | Row) => void;

  /**
   * Selected row index
   */
  selectedRowIndex?: number;

  /**
   * Disables sorting for every column in the entire table.
   */
  disableSortBy?: boolean;

  ref?: React.MutableRefObject<TableState<any>>;

  /** Called when an expander is clicked. Use this to manage `expanded` */
  // onExpandedChange: ExpandedChangeFunction;

  /** Called when a user clicks on a resizing component (the right edge of a column header) */
  onResizedChange?: (columnSizes: IColumnResizing) => void;

  /**
   * column debounce delay in milliseconds
   */
  // resizeDebounceDelay?: number;

  // rememberColumnWidths?: boolean;

  tableId?: string;

  scrollBodyHorizontally?: boolean; // If true, specify the height, else it will default to 250px

  /**
   * The table height. Required if scrollBodyHorizontally is true. Default value is 250px
   */
  height?: number;

  onSort?: (sorting: SortingRule<any>[]) => void;
  /**
   * Allows the click event to be skipped. Required if conflicting with double click event
   */
  omitClick?: boolean;

  containerStyle?: CSSProperties;

  tableStyle?: CSSProperties;
}
