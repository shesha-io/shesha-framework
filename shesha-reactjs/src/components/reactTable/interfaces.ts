import { IConfigurableActionConfiguration } from '@/providers';
import { IAnchoredDirection, ITableRowData } from '@/providers/dataTable/interfaces';
import { IFlatComponentsStructure } from '@/providers/form/models';
import React, { ReactNode, CSSProperties } from 'react';
import { Column, ColumnInstance, Row, SortingRule, TableState } from 'react-table';
import { IBorderValue } from '@/designer-components/_settings/utils/border/interfaces';
import { TableSelectionMode } from '../dataTable/interfaces';
import { IDimensionsValue, IShadowValue } from '@/designer-components/_settings/utils/index';

export interface IColumnWidth {
  id: React.Key;
  value: number;
}

export type NewRowCapturePosition = 'top' | 'bottom';

export interface IColumnResizing {
  startX?: number;
  columnWidth: number;
  headerIdWidths: Record<string, number>;
  columnWidths: { [key: number]: number };
  isResizingColumn?: string;
}

export interface OnRowsReorderedArgs {
  getOld: () => ITableRowData[];
  getNew: () => ITableRowData[];
  applyOrder: (orderedItems: ITableRowData[]) => void;
  oldIndex?: number;
  newIndex?: number;
}

export interface ITableRowDragProps {
  allowReordering?: boolean | undefined;
}

export type RowDataInitializer<TValue extends object = object> = () => Promise<TValue>;

export type InlineEditMode = 'one-by-one' | 'all-at-once';
export type InlineSaveMode = 'auto' | 'manual';

export interface IReactTableProps<T extends ITableRowData = ITableRowData> extends ITableRowDragProps {
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
   * Selection mode for the table
   */
  selectionMode?: TableSelectionMode | undefined;

  /**
   * Whether the table's headers should be frozen and you scroll under them
   */
  freezeHeaders?: boolean | undefined;

  /**
   * Whether the table's columns should be frozen and you scroll under them on the left or right
   */
  anchored?: IAnchoredDirection;

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
  defaultSorting?: SortingRule<string | number>[] | undefined;

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
   * If manualPagination is true, then this value used to determine the amount of pages available.
   * This amount is then used to materialize the pageOptions and also compute the canNextPage values on the table instance.
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
  onSelectRow?: ((index: number, row: any) => void) | undefined;

  /**
   * A callback for double-clicking the rows
   */
  onRowDoubleClick?: IConfigurableActionConfiguration | ((rowData: ITableRowData, index?: number) => void);

  /**
   * A callback for clicking the rows
   */
  onRowClick?: (rowIndex: number, row: any) => void;

  /**
   * A callback for hovering over the rows
   */
  onRowHover?: (rowIndex: number, row: any) => void;

  /**
   * A callback for when ids are selected. Required if selectionMode = "multiple"
   */
  onSelectedIdsChanged?: ((ids: string[]) => void) | undefined;

  /**
   * A callback for when multiple rows are selected with checkbox. Applicable if selectionMode = "multiple"
   */
  onMultiRowSelect?: ((rows: Array<Row<ITableRowData>> | Row<ITableRowData>) => void) | undefined;

  /**
   * Configurable action for row click event
   */
  onRowClickAction?: IConfigurableActionConfiguration | undefined;

  /**
   * Configurable action for row hover event
   */
  onRowHoverAction?: IConfigurableActionConfiguration | undefined;

  /**
   * Configurable action for row select event (fires only when row is selected, not deselected)
   */
  onRowSelectAction?: IConfigurableActionConfiguration | undefined;

  /**
   * Configurable action for selection change event (fires on both select and deselect)
   */
  onSelectionChangeAction?: IConfigurableActionConfiguration | undefined;

  // Cell-specific styling
  /** @deprecated Use bodyFontColor instead. Cell text color duplicates body font color. */
  cellTextColor?: string | undefined;
  /** @deprecated Use rowBackgroundColor instead. Cell background color duplicates row background color. */
  cellBackgroundColor?: string | undefined;
  cellBorderColor?: string | undefined;
  /** @deprecated Use rowStylingBox instead. This property is migrated to rowStylingBox in migration v19 */
  cellPadding?: string | undefined;
  cellBorder?: IBorderValue | undefined;

  // Footer styling
  footerBackgroundColor?: string | undefined;
  footerTextColor?: string | undefined;
  footerBorder?: IBorderValue | undefined;

  // Additional borders and shadows
  headerBorder?: IBorderValue | undefined;
  headerShadow?: IShadowValue | undefined;
  rowShadow?: IShadowValue | undefined;

  // Layout features
  cellBorders?: boolean | undefined;
  rowDividers?: boolean | undefined;
  responsiveMode?: 'scroll' | 'stack' | 'collapse' | undefined;

  /**
   * Selected row index
   */
  selectedRowIndex?: number | undefined;

  /**
   * Disables sorting for every column in the entire table.
   */
  disableSortBy?: boolean | undefined;

  ref?: React.MutableRefObject<TableState<any>> | undefined;

  /** Called when an expander is clicked. Use this to manage `expanded` */
  // onExpandedChange: ExpandedChangeFunction;

  /** Called when a user clicks on a resizing component (the right edge of a column header) */
  onResizedChange?: (columns: ColumnInstance<T>[], columnSizes: IColumnResizing) => void;

  scrollBodyHorizontally?: boolean; // If true, specify the height, else it will default to 250px

  /**
   * The table height. Required if scrollBodyHorizontally is true. Default value is 250px
   */
  height?: number;

  onSort?: (sorting: SortingRule<ITableRowData>[]) => void;
  /**
   * Allows the click event to be skipped. Required if conflicting with double click event
   */
  omitClick?: boolean | undefined;

  containerStyle?: CSSProperties | undefined;
  minHeight?: number | undefined;
  maxHeight?: number | undefined;

  tableStyle?: CSSProperties | undefined;
  noDataText?: string | undefined;
  noDataSecondaryText?: string | undefined;
  noDataIcon?: string | undefined;
  showExpandedView?: boolean | undefined;

  // Header styling
  headerFont?: {
    type?: string;
    size?: number;
    weight?: string;
    color?: string;
    align?: string;
  } | undefined;
  headerBackgroundColor?: string | undefined;

  // Text alignment
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
  rowBackgroundColor?: string | undefined;
  rowAlternateBackgroundColor?: string | undefined;
  rowHoverBackgroundColor?: string | undefined;
  rowSelectedBackgroundColor?: string | undefined;
  rowHeight?: string | undefined;
  rowPadding?: string | undefined;
  rowBorder?: string | undefined; // Deprecated: use rowBorderStyle for full border control
  rowBorderStyle?: IBorderValue | undefined; // Full border configuration with per-side control

  // Body font styling
  bodyFontFamily?: string | undefined;
  bodyFontSize?: string | undefined;
  bodyFontWeight?: number & {} | string | undefined;
  bodyFontColor?: string | undefined;

  // Action column icon styling
  actionIconSize?: string | number | undefined;
  actionIconColor?: string | undefined;

  // Overall table styling
  borderRadius?: string | undefined;
  border?: IBorderValue | undefined;
  backgroundColor?: string | undefined;
  boxShadow?: string | undefined;
  dimensions?: IDimensionsValue | undefined;
  sortableIndicatorColor?: string | undefined;
  striped?: boolean | undefined;

  canDeleteInline?: boolean | undefined;
  deleteAction?: ((rowIndex: number, data: any) => Promise<any>) | undefined;

  canEditInline?: boolean | undefined;
  updateAction?: ((rowIndex: number, data: any) => Promise<any>) | undefined;

  canAddInline?: boolean | undefined;
  newRowCapturePosition?: NewRowCapturePosition | undefined;
  newRowInsertPosition?: NewRowCapturePosition | undefined;
  createAction?: ((data: any) => Promise<any>) | undefined;
  newRowInitData?: RowDataInitializer | undefined;
  inlineEditMode?: InlineEditMode | undefined;
  inlineSaveMode?: InlineSaveMode | undefined;
  inlineEditorComponents?: IFlatComponentsStructure | undefined;
  inlineCreatorComponents?: IFlatComponentsStructure | undefined;
  inlineDisplayComponents?: IFlatComponentsStructure | undefined;
  onRowsRendering?: OnRowsRendering<T> | undefined;
  onRowsReordered?: ((payload: OnRowsReorderedArgs) => Promise<void>) | undefined;
}


export type RowRenderer<T extends ITableRowData = ITableRowData> = (row: Row<T>, index: number) => React.ReactElement;
export interface OnRowRenderingArgs<T extends ITableRowData = ITableRowData> {
  rows: Row<T>[];
  defaultRender: RowRenderer<T>;
}
export type OnRowsRendering<T extends ITableRowData = ITableRowData> = (args: OnRowRenderingArgs<T>) => React.ReactElement;
