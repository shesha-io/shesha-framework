export type IndexColumnFilterOption =
  | 'contains' |
  'startsWith' |
  'endsWith' |
  'equals' |
  'lessThan' |
  'greaterThan' |
  'between' |
  'before' |
  'after';

export type ColumnSorting = 'asc' | 'desc';

export interface IHasModelType {
  modelType: string;
}

export interface IColumnSorting {
  readonly id: string;
  readonly desc: boolean;
}

export interface ISortingItem {
  propertyName: string;
  sorting: ColumnSorting;
}

export type GroupingItem = ISortingItem;

export interface ITableFilter {
  readonly columnId: string;
  readonly filterOption: IndexColumnFilterOption;
  readonly filter: any;
}

export type ColumnFilter = string[] | number[] | /* Moment[] |*/ Date[] | string | number | /* Moment |*/ Date | boolean;

export interface IPublicDataTableActions {
  refreshTable: () => void;
  exportToExcel?: () => void;
}

export interface IColumnWidth {
  id: string;
  width: number;
}

export interface IDataTableActionsContext extends IPublicDataTableActions {
  toggleColumnVisibility?: (val: string) => void;
  setCurrentPage?: (page: number) => void;
  changePageSize?: (size: number) => void;
  toggleColumnFilter?: (columnIds: string[]) => void;
  removeColumnFilter?: (columnIdToRemoveFromFilter: string) => void;
  changeFilterOption?: (filterColumnId: string, filterOptionValue: IndexColumnFilterOption) => void;
  changeFilter?: (filterColumnId: string, filterValue: ColumnFilter) => void;
  applyFilters?: () => void;
  clearFilters?: () => void; // to be removed
  /** change quick search text without refreshing of the table data */
  changeQuickSearch?: (val: string) => void;
  /** change quick search and refresh table data */
  performQuickSearch?: (val: string) => void;
  toggleSaveFilterModal?: (visible: boolean) => void;
  changeActionedRow?: (data: any) => void;
  changeSelectedStoredFilterIds?: (selectedStoredFilterIds: string[]) => void;

  setPredefinedFilters: (filters: IStoredFilter[]) => void;
  setPermanentFilter: (filter: IStoredFilter) => void;

  onSort?: (sorting: IColumnSorting[]) => void;
  onGroup?: (grouping: ISortingItem[]) => void;

  changeSelectedIds?: (selectedIds: string[]) => void;
  getCurrentFilter: () => ITableFilter[];

  changeDisplayColumn: (displayColumnName: string) => void;
  changePersistedFiltersToggle: (persistSelectedFilters: boolean) => void;

  /**
   * Get current repository of the datatable
   */
  // getRepository: () => IRepository;
  /**
   * Set row data after inline editing
   */
  setRowData: (rowIndex: number, data: any) => void;

  setSelectedRow: (index: number, row: any) => void;
  setColumnWidths: (widths: IColumnWidth[]) => void;
}

export interface IDataTableContexApi extends IHasModelType {

  api: IDataTableActionsContext;

  /** Datatable data (fetched from the back-end) */
  tableData?: object[];
  /** Selected page size */
  selectedPageSize?: number;
  /** Current page number */
  currentPage?: number;
  /** Total number of pages */
  totalPages?: number;
  /** Total number of rows */
  totalRows?: number;
  /** Total number of rows before the filtration */
  totalRowsBeforeFilter?: number;

  /** Quick search string */
  quickSearch?: string;
  userSorting?: IColumnSorting[];

  /** Rows grouping */
  grouping?: GroupingItem[];

  /** Advanced filter: applied values */
  tableFilter?: ITableFilter[];
  /** Advanced filter: current editor state */
  tableFilterDirty?: ITableFilter[];

  /** Selected filters (stored or predefined) */
  selectedStoredFilterIds?: string[];

  /** index of selected row */
  selectedRow?: any;

  actionedRow?: any;

  /** List of Ids of selected rows */
  selectedIds?: string[];

  isFetchingTableData?: boolean;
  hasFetchTableDataError?: boolean;

  properties?: string[];

  selectedRows?: { [key in string]: string }[];
}

export type FilterExpression = string | object;

export interface IStoredFilter {
  id: string;

  name: string;

  tooltip?: string;
  // Exclusive filters cannot be applied on top of other filters. Only one can be selected

  expression?: FilterExpression;

  selected?: boolean;

  defaultSelected?: boolean;

  //#region dynamic expressions
  hasDynamicExpression?: boolean;

  allFieldsEvaluatedSuccessfully?: boolean;

  unevaluatedExpressions?: string[];
  //#endregion
}
