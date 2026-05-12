import { IConfigurableColumnsProps } from '../datatableColumnsConfigurator/models';
import {
  DataFetchingMode,
  IColumnSorting,
  IStoredFilter,
  ITableColumn,
  ITableFilter,
  GroupingItem,
  SortMode,
  ColumnSorting,
  ITableDataColumn,
  FilterExpression,
  ITableRowData,
  ISelectionProps,
} from './interfaces';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IHasModelType } from './repository/interfaces';
import { IModelValidation } from '@/utils/errors';
import { DragState } from './interfaces';
import { SortingRule } from 'react-table';

interface _PagerState {
  /** Selected page size */
  selectedPageSize: number;
  /** Current page number */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of rows */
  totalRows?: number | undefined;
  /** Total number of rows before the filtration */
  totalRowsBeforeFilter?: number | undefined;
  /** Available page sizes */
  pageSizeOptions: number[];
};

interface _FiltersState {
  /** Pre-defined stored filters. configurable in the forms designer */
  predefinedFilters?: IStoredFilter[] | undefined;
  permanentFilter?: FilterExpression | undefined;
  /** Advanced filter: applied values */
  tableFilter: ITableFilter[];
  /** Advanced filter: current editor state */
  tableFilterDirty?: ITableFilter[] | undefined;

  /** Selected filters (stored or predefined) */
  selectedStoredFilterIds?: string[] | undefined;
  /** Quick search string */
  quickSearch: string;
  isAdvancedFilterVisible: boolean;
};

interface _ColumnsState {
  /** table columns */
  columns: ITableColumn[];
  /** Configurable columns. Is used in pair with entityType  */
  configurableColumns: IConfigurableColumnsProps[];
  isColumnsSelectorVisible: boolean;
};

interface _SortingState {
  /** Default sort by */
  defaultSortBy?: string;
  /** Default sort order */
  defaultSortOrder?: string;
  /** Sort mode (standard or strict) */
  sortMode?: SortMode | undefined;
  /** Sort sorting: order by */
  strictSortBy?: string | undefined;
  /** Sort sorting: sorting order */
  strictSortOrder?: ColumnSorting | undefined;
  /** Columns sorting */
  standardSorting: IColumnSorting[];
  userSorting?: SortingRule<ITableRowData>[];
};

interface _SelectionState {
  /** List of Ids of selected rows */
  selectedIds: string[];
  selectedRow?: ISelectionProps | undefined;
  selectedRows: ITableRowData[];
};

interface _GroupingState {
  /** Rows grouping */
  grouping?: GroupingItem[] | undefined;
  groupingColumns: ITableDataColumn[];
};

interface _ReorderState {
  allowReordering: boolean;
  dragState?: DragState;

  customReorderEndpoint?: string | undefined;
  onBeforeRowReorder?: IConfigurableActionConfiguration | undefined;
  onAfterRowReorder?: IConfigurableActionConfiguration | undefined;
};

interface _DataState {
  /** Data fetching mode (paging or fetch all) */
  dataFetchingMode: DataFetchingMode;
  /** Datatable data (fetched from the back-end) */
  tableData: object[];
  isFetchingTableData: boolean;
  hasFetchTableDataError: boolean;
  fetchTableDataError: unknown | undefined;
};

export interface IDataTableStateContext extends IHasModelType, _PagerState, _FiltersState, _ColumnsState, _SortingState, _SelectionState, _GroupingState, _ReorderState, _DataState {
  actionedRow?: unknown;

  /** Validation result from parent DataContext component */
  contextValidation?: IModelValidation | undefined;
}
