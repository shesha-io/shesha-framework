
import { Row } from 'react-table';
import { IConfigurableColumnsProps } from '../datatableColumnsConfigurator/models';
import {
  ColumnFilter,
  IColumnSorting,
  IPublicDataTableActions,
  IStoredFilter,
  ITableFilter,
  IndexColumnFilterOption,
  DataFetchDependency,
  ISortingItem,
  ITableRowData,
} from './interfaces';
import { IRepository } from './repository/interfaces';
import { DragState, IColumnWidth } from './interfaces';

interface _PagerActions {
  setCurrentPage: (page: number) => void;
  changePageSize: (size: number) => void;
};

interface _FilterActions {
  changeFilterOption: (filterColumnId: string, filterOptionValue: IndexColumnFilterOption) => void;
  changeFilter: (filterColumnId: string, filterValue: ColumnFilter) => void;
  applyFilters: () => Promise<void>;
  clearFilters: () => void; // to be removed
  /** change quick search text without refreshing of the table data */
  changeQuickSearch: (val: string) => void;
  /** change quick search and refresh table data */
  performQuickSearch: (val: string) => void;

  setPredefinedFilters: (filters: IStoredFilter[]) => void;
  setPermanentFilter: (filter: IStoredFilter) => void;
  getCurrentFilter: () => ITableFilter[];
  toggleAdvancedFilter: (isVisible?: boolean | undefined) => void;
  toggleColumnFilter: (columnIds: string[]) => void;
  removeColumnFilter: (columnIdToRemoveFromFilter: string) => void;
  changeSelectedStoredFilterIds: (selectedStoredFilterIds: string[]) => void;
};

interface _ColumnsActions {
  toggleColumnVisibility: (val: string) => void;
  toggleColumnsSelector: (isVisible?: boolean | undefined) => void;
  /**
   * Register columns in the table context. Is used for configurable tables
   */
  registerConfigurableColumns: (ownerId: string, columns: IConfigurableColumnsProps[]) => void;
  /**
   * Call this function to indicate that your component (table/list) require columns
   */
  requireColumns: () => void;
  setColumnWidths: (widths: IColumnWidth[]) => void;
};

interface _DataActions {
  /**
   * Get current repository of the datatable
   */
  getRepository: () => IRepository;
  registerDataFetchDependency: (ownerId: string, dependency: DataFetchDependency) => void;
  unregisterDataFetchDependency: (ownerId: string) => void;
  /**
   * Set row data after inline editing
   */
  setRowData: (rowIndex: number, data: ITableRowData) => void;
};

interface _SelectionActions {
  changeSelectedIds: (selectedIds: string[]) => void;
  setSelectedRow: (index: number, row: ITableRowData) => void;
  setMultiSelectedRow: (rows: Row<ITableRowData>[] | Row<ITableRowData>) => void;
};

interface _ReorderActions {
  setDragState: (dragState: DragState) => void;
}

interface _SortingActions {
  onSort: (sorting: IColumnSorting[]) => void;
};
interface _GroupingActions {
  onGroup?: (grouping: ISortingItem[]) => void;
};

export interface IDataTableActionsContext extends IPublicDataTableActions, _PagerActions, _FilterActions, _ColumnsActions, _DataActions, _SelectionActions, _ReorderActions, _SortingActions, _GroupingActions {
  changeActionedRow: (data: ITableRowData) => void;
}
