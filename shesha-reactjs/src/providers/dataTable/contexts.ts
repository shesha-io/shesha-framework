import { createContext } from 'react';
import { IFlagsSetters, IFlagsState } from '../../interfaces';
import { IConfigurableColumnsBase } from '../datatableColumnsConfigurator/models';
import {
  ITableColumn,
  IStoredFilter,
  ITableFilter,
  IColumnSorting,
  IndexColumnFilterOption,
  ColumnFilter,
  IGetDataPayloadInternal,
} from './interfaces';

export type IFlagProgressFlags =
  | 'isFiltering'
  | 'isSelectingColumns'
  | 'fetchTableData'
  | 'exportToExcel' /* NEW_IN_PROGRESS_FLAG_GOES_HERE */;
export type IFlagSucceededFlags = 'exportToExcel' | 'fetchTableData' /* NEW_SUCCEEDED_FLAG_GOES_HERE */;
export type IFlagErrorFlags = 'exportToExcel' /* NEW_ERROR_FLAG_GOES_HERE */;
export type IFlagActionedFlags = '__DEFAULT__' /* NEW_ACTIONED_FLAG_GOES_HERE */;

export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 40, 50, 100];

export const MIN_COLUMN_WIDTH = 150;

export interface IDataTableUserConfig {
  pageSize: number;
  currentPage: number;
  quickSearch: string;

  columns?: ITableColumn[];
  tableSorting: IColumnSorting[];

  selectedFilterIds?: string[];
  advancedFilter?: ITableFilter[];
}

export const DEFAULT_DT_USER_CONFIG: IDataTableUserConfig = {
  pageSize: DEFAULT_PAGE_SIZE_OPTIONS[1],
  currentPage: 1,
  quickSearch: '',
  tableSorting: undefined,
};

export interface IDataTableStoredConfig extends IGetDataPayloadInternal {
  columns?: ITableColumn[];
  tableFilter?: ITableFilter[];
  // stored filters must also be restored from the local storage after page refresh or navigating away.
  // Selected filters are in IGetDataPayload so we just need to add the filters list
  storedFilters?: IStoredFilter[];
}

export interface IDataTableStateContext
  extends IFlagsState<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags> {
  title?: string;

  exportToExcelError?: string;

  exportToExcelWarning?: string;
  /**
   * Useful for entity picker as the column that has to be used to display when the entity has been selected
   */
  displayColumnName?: string;

  formData?: any;
  /** Type of entity */
  entityType?: string;
  /** Configurable columns. Is used in pair with entityType  */
  configurableColumns?: IConfigurableColumnsBase[];
  /** Pre-defined stored filters. configurable in the forms designer */
  predefinedFilters?: IStoredFilter[];

  /** table columns */
  columns?: ITableColumn[];

  /** Id of the parent entity. Is used for child tables */
  parentEntityId?: string;

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
  /** Columns sorting */
  tableSorting?: IColumnSorting[];

  /** Available page sizes */
  pageSizeOptions?: number[];

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

  /** Dblclick handler */
  onDblClick?: (...params: any[]) => void;
  /** Select row handler */
  onSelectRow?: (index: number, row: any) => void;

  //#region todo: review!
  isFetchingTableData?: boolean;
  hasFetchTableDataError?: boolean;
  tableConfigLoaded?: boolean;

  properties?: string[];

  saveFilterModalVisible?: boolean;

  persistSelectedFilters?: boolean;

  userConfigId?: string;
  //#endregion
}

export interface IPublicDataTableActions {
  refreshTable: () => void;
  exportToExcel?: () => void;
  deleteRow?: () => void;
  toggleColumnsSelector?: () => void;
  toggleAdvancedFilter?: () => void;
  setToEditMode?: () => void;
}

export interface IDataTableActionsContext
  extends IFlagsSetters<IFlagProgressFlags, IFlagSucceededFlags, IFlagErrorFlags, IFlagActionedFlags>,
    IPublicDataTableActions {
  fetchTableData?: (payload: IGetDataPayloadInternal) => void;
  fetchTableConfig?: (id: string) => void;
  toggleColumnVisibility?: (val: string) => void;
  setCurrentPage?: (page: number) => void;
  changePageSize?: (size: number) => void;
  toggleColumnFilter?: (columnIds: string[]) => void;
  removeColumnFilter?: (columnIdToRemoveFromFilter: string) => void;
  changeFilterOption?: (filterColumnId: string, filterOptionValue: IndexColumnFilterOption) => void;
  changeFilter?: (filterColumnId: string, filterValue: ColumnFilter) => void;
  applyFilters?: () => void;
  clearFilters?: () => void; // to be removed
  getDataPayload?: () => IGetDataPayloadInternal;
  /** change quick search text without refreshing of the table data */
  changeQuickSearch?: (val: string) => void;
  /** change quick search and refresh table data */
  performQuickSearch?: (val: string) => void;
  toggleSaveFilterModal?: (visible: boolean) => void;
  changeSelectedRow?: (index: any) => void;
  changeActionedRow?: (data: any) => void;
  changeSelectedStoredFilterIds?: (selectedStoredFilterIds: string[]) => void;

  setPredefinedFilters: (filters: IStoredFilter[]) => void;

  /**
   * Sets the form state in the store.
   *
   * This function is used to pass the state of the form that can be used to evaluate the filters that are using expression
   */
  setFormData?: (formData: any) => void;

  onSort?: (sorting: IColumnSorting[]) => void;

  changeSelectedIds?: (selectedIds: string[]) => void;
  getCurrentFilter: () => ITableFilter[];

  /**
   * Register columns in the table context. Is used for configurable tables
   */
  registerConfigurableColumns: (ownerId: string, columns: IConfigurableColumnsBase[]) => void;

  changeDisplayColumn: (displayColumnName: string) => void;
  changePersistedFiltersToggle: (persistSelectedFilters: boolean) => void;
  /* NEW_ACTION_ACTION_DECLARATIO_GOES_HERE */
}

export const DATA_TABLE_CONTEXT_INITIAL_STATE: IDataTableStateContext = {
  succeeded: {},
  isInProgress: {},
  error: {},
  actioned: {},
  columns: [],
  tableData: [],
  isFetchingTableData: false,
  hasFetchTableDataError: null,
  pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
  selectedPageSize: DEFAULT_PAGE_SIZE_OPTIONS[1],
  currentPage: 1,
  totalPages: -1,
  totalRows: null,
  totalRowsBeforeFilter: null,
  quickSearch: null,
  tableConfigLoaded: false,
  tableSorting: [],
  tableFilter: [],
  parentEntityId: null,
  saveFilterModalVisible: false,
  selectedIds: [],
  configurableColumns: [],
  tableFilterDirty: null,
  persistSelectedFilters: true, // Persist by default
  userConfigId: null,
};

export interface DataTableFullInstance extends IDataTableStateContext, IDataTableActionsContext {}

export const DataTableStateContext = createContext<IDataTableStateContext>(DATA_TABLE_CONTEXT_INITIAL_STATE);

export const DataTableActionsContext = createContext<IDataTableActionsContext>(undefined);
