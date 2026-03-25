import {
  IColumnSorting,
  IStoredFilter,
  ITableColumn,
  ITableFilter,
} from './interfaces';
import { createNamedContext } from '@/utils/react';
import { IDataTableActionsContext } from './interfaces.actions';
import { IDataTableStateContext } from './interfaces.state';

/** Table Selection */

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

export const DATA_TABLE_CONTEXT_INITIAL_STATE: IDataTableStateContext = {
  columns: [],
  groupingColumns: [],
  tableData: [],
  isFetchingTableData: false,
  hasFetchTableDataError: false,
  fetchTableDataError: undefined,
  pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
  selectedPageSize: DEFAULT_PAGE_SIZE,
  currentPage: 1,
  totalPages: -1,
  totalRows: undefined,
  totalRowsBeforeFilter: undefined,
  quickSearch: "",
  standardSorting: [],
  tableFilter: [],
  selectedIds: [],
  configurableColumns: [],
  tableFilterDirty: undefined,
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
export { type IDataTableStateContext, type IDataTableActionsContext };
