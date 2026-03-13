import { Row } from 'react-table';
import { IConfigurableColumnsProps } from '../datatableColumnsConfigurator/models';
import {
  ColumnFilter,
  DataFetchingMode,
  IColumnSorting,
  IPublicDataTableActions,
  IStoredFilter,
  ITableColumn,
  ITableFilter,
  IndexColumnFilterOption,
  GroupingItem,
  SortMode,
  ColumnSorting,
  ITableDataColumn,
  DataFetchDependency,
  ISortingItem,
  FilterExpression,
  ITableRowData,
} from './interfaces';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IHasModelType, IRepository } from './repository/interfaces';
import { createNamedContext } from '@/utils/react';
import { IModelValidation } from '@/utils/errors';

/** Table Selection */

export interface ISelectionProps {
  index?: number;
  id?: string;
  row: ITableRowData;
}

/** Table context */

export type IFlagProgressFlags =
  'isFiltering' |
  'isSelectingColumns' |
  'fetchTableData' |
  'exportToExcel';
export type IFlagSucceededFlags = 'exportToExcel' | 'fetchTableData';
export type IFlagErrorFlags = 'exportToExcel';
export type IFlagActionedFlags = '__DEFAULT__';

export const DEFAULT_PAGE_SIZE: number = 10;
export const DEFAULT_PAGE_SIZE_OPTIONS = [5, DEFAULT_PAGE_SIZE, 20, 30, 40, 50, 100];

export const MIN_COLUMN_WIDTH = 150;

export interface ITableColumnUserSettings {
  id: string;
  show?: boolean | undefined;
  width?: number | undefined;
}
export interface IDataTableUserConfig {
  pageSize?: number | undefined;
  currentPage?: number | undefined;
  quickSearch: string;

  columns?: ITableColumnUserSettings[] | undefined;
  tableSorting: IColumnSorting[];

  selectedFilterIds?: string[] | undefined;
  advancedFilter?: ITableFilter[] | undefined;
}

export const DEFAULT_DT_USER_CONFIG: IDataTableUserConfig = {
  pageSize: DEFAULT_PAGE_SIZE_OPTIONS[1],
  currentPage: 1,
  quickSearch: '',
  tableSorting: [],
};

export interface IDataTableStoredConfig {
  columns?: ITableColumn[];
  tableFilter?: ITableFilter[];
  // stored filters must also be restored from the local storage after page refresh or navigating away.
  // Selected filters are in IGetDataPayload so we just need to add the filters list
  storedFilters?: IStoredFilter[];
}

export interface IDataTableStateContext extends IHasModelType {
  /** Configurable columns. Is used in pair with entityType  */
  configurableColumns?: IConfigurableColumnsProps[] | undefined;
  /** Pre-defined stored filters. configurable in the forms designer */
  predefinedFilters?: IStoredFilter[] | undefined;
  permanentFilter?: FilterExpression | undefined;

  /** table columns */
  columns?: ITableColumn[] | undefined;
  groupingColumns: ITableDataColumn[];

  /** Datatable data (fetched from the back-end) */
  tableData: object[];
  /** Default sort by */
  defaultSortBy?: string;
  /** Default sort order */
  defaultSortOrder?: string;
  /** Selected page size */
  selectedPageSize?: number | undefined;
  /** Data fetching mode (paging or fetch all) */
  dataFetchingMode: DataFetchingMode;
  /** Current page number */
  currentPage?: number;
  /** Total number of pages */
  totalPages?: number;
  /** Total number of rows */
  totalRows?: number | undefined;
  /** Total number of rows before the filtration */
  totalRowsBeforeFilter?: number | undefined;

  /** Quick search string */
  quickSearch?: string | undefined;
  /** Columns sorting */
  standardSorting?: IColumnSorting[] | undefined;
  userSorting?: IColumnSorting[];

  /** Rows grouping */
  grouping?: GroupingItem[] | undefined;

  /** Sort mode (standard or strict) */
  sortMode?: SortMode | undefined;
  /** Sort sorting: order by */
  strictSortBy?: string | undefined;
  /** Sort sorting: sorting order */
  strictSortOrder?: ColumnSorting | undefined;

  /** Available page sizes */
  pageSizeOptions?: number[];

  /** Advanced filter: applied values */
  tableFilter?: ITableFilter[] | undefined;
  /** Advanced filter: current editor state */
  tableFilterDirty?: ITableFilter[] | undefined;

  /** Selected filters (stored or predefined) */
  selectedStoredFilterIds?: string[] | undefined;

  actionedRow?: unknown;

  /** List of Ids of selected rows */
  selectedIds?: string[] | undefined;

  /** Dblclick handler */
  onDblClick?: (...params: unknown[]) => void;
  /** Select row handler */
  onSelectRow?: (index: number, row: unknown) => void;

  isAdvancedFilterVisible: boolean;
  isColumnsSelectorVisible: boolean;
  isFetchingTableData: boolean;
  hasFetchTableDataError: boolean;
  fetchTableDataError?: unknown | undefined;

  properties?: string[];

  saveFilterModalVisible?: boolean;

  persistSelectedFilters?: boolean;

  //#endregion

  selectedRow?: ISelectionProps | undefined;
  selectedRows?: ITableRowData[] | undefined;

  allowReordering: boolean;
  dragState?: DragState;

  customReorderEndpoint?: string | undefined;
  onBeforeRowReorder?: IConfigurableActionConfiguration | undefined;
  onAfterRowReorder?: IConfigurableActionConfiguration | undefined;

  /** Validation result from parent DataContext component */
  contextValidation?: IModelValidation | undefined;
}

export type DragState = 'started' | 'finished' | null;

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
  changeActionedRow?: (data: ITableRowData) => void;
  changeSelectedStoredFilterIds?: (selectedStoredFilterIds: string[]) => void;

  setPredefinedFilters: (filters: IStoredFilter[]) => void;
  setPermanentFilter: (filter: IStoredFilter) => void;

  onSort?: (sorting: IColumnSorting[]) => void;
  onGroup?: (grouping: ISortingItem[]) => void;

  changeSelectedIds?: (selectedIds: string[]) => void;
  getCurrentFilter: () => ITableFilter[];

  toggleAdvancedFilter: (isVisible: boolean) => void;
  toggleColumnsSelector: (isVisible: boolean) => void;
  /**
   * Register columns in the table context. Is used for configurable tables
   */
  registerConfigurableColumns: (ownerId: string, columns: IConfigurableColumnsProps[]) => void;
  /**
   * Call this function to indicate that your component (table/list) require columns
   */
  requireColumns: () => void;
  registerDataFetchDependency: (ownerId: string, dependency: DataFetchDependency) => void;
  unregisterDataFetchDependency: (ownerId: string) => void;

  changeDisplayColumn: (displayColumnName: string) => void;
  changePersistedFiltersToggle: (persistSelectedFilters: boolean) => void;

  /**
   * Get current repository of the datatable
   */
  getRepository: () => IRepository;
  /**
   * Set row data after inline editing
   */
  setRowData: (rowIndex: number, data: ITableRowData) => void;

  setSelectedRow: (index: number, row: ITableRowData) => void;
  setDragState: (dragState: DragState) => void;
  setMultiSelectedRow: (rows: Row<ITableRowData>[] | Row<ITableRowData>) => void;
  setColumnWidths: (widths: IColumnWidth[]) => void;
}

export interface IColumnWidth {
  id: string;
  width: number;
}

export const DATA_TABLE_CONTEXT_INITIAL_STATE: IDataTableStateContext = {
  columns: [],
  groupingColumns: [],
  tableData: [],
  isFetchingTableData: false,
  hasFetchTableDataError: false,
  fetchTableDataError: undefined,
  pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
  selectedPageSize: DEFAULT_PAGE_SIZE_OPTIONS[1],
  currentPage: 1,
  totalPages: -1,
  totalRows: undefined,
  totalRowsBeforeFilter: undefined,
  quickSearch: undefined,
  standardSorting: [],
  tableFilter: [],
  saveFilterModalVisible: false,
  selectedIds: [],
  configurableColumns: [],
  tableFilterDirty: undefined,
  persistSelectedFilters: true, // Persist by default
  modelType: "",
  dataFetchingMode: 'paging',
  selectedRow: undefined,
  selectedRows: [],
  permanentFilter: undefined,
  allowReordering: false,
  onBeforeRowReorder: undefined,
  onAfterRowReorder: undefined,
  customReorderEndpoint: undefined,
  contextValidation: undefined,
  isAdvancedFilterVisible: false,
  isColumnsSelectorVisible: false,
};

export interface DataTableFullInstance extends IDataTableStateContext, IDataTableActionsContext { }

export const DataTableStateContext = createNamedContext<IDataTableStateContext | undefined>(undefined, "DataTableStateContext");

export const DataTableActionsContext = createNamedContext<IDataTableActionsContext | undefined>(undefined, "DataTableActionsContext");
