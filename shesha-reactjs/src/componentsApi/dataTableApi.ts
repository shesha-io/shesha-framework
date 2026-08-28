/* eslint-disable @typescript-eslint/no-explicit-any */

// ToDo: AS - import base interfaces from componentApi.ts
// ToDo: AS - remove any type and replace with specific interfaces

export type InteractionMode = 'editable' | 'readOnly' | 'disabled' | 'inherited' | boolean;

export interface BaseComponentApi {
  /** Name of the component (e.g., `"textField"`, `"numberField"`). */
  readonly componentName: string;
  /** Context to which the component is bound (e.g., formContext, pageContext, undefined for form data). */
  readonly context?: string | undefined;
  /** Name of the property this component is bound to. */
  readonly propertyName: string;
  /** Whether the component is visible in the UI. */
  visible: boolean;
  /** Current interaction mode of the component. */
  interactionMode: InteractionMode | undefined;
}

export type JsonLogicFilter = { [key: string]: unknown };
export type FilterExpression = string | JsonLogicFilter;

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
  readonly modelType: string;
}

export interface IColumnSorting {
  readonly id: string;
  readonly desc: boolean;
}

export interface ISortingItem {
  readonly propertyName: string;
  readonly sorting: ColumnSorting;
}

export type GroupingItem = ISortingItem;

export interface ITableFilter {
  readonly columnId: string;
  readonly filterOption: IndexColumnFilterOption | undefined;
  readonly filter: any | undefined;
}

export type ColumnFilter = string[] | number[] | /* Moment[] |*/ Date[] | string | number | /* Moment |*/ Date | boolean;

export interface IColumnWidth {
  readonly id: string;
  readonly width: number;
}

export interface ISelectionProps {
  index?: number;
  id?: string;
  row: ITableRowData;
}

/** Represents the shape of a table row with at minimum an id property */
export interface ITableRowData {
  id: string;
  [key: string]: any;
};

export interface RowSelection<D extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  original: D;
  isSelected: boolean;
}

export interface SortingRule {
  id: string;
  desc?: boolean | undefined;
}

interface PagerActions {
  /** Set current page */
  setCurrentPage: (page: number) => void;
  /** Change page size */
  changePageSize: (size: number) => void;
};

interface SelectionActions {
  /** Set selected row ids */
  changeSelectedIds: (selectedIds: string[]) => void;
  /** Clear selected row */
  clearSelectedRow: () => void;
};

interface SortingActions {
  /** Sort table */
  sort: (sorting: SortingRule[]) => void;
};
interface GroupingActions {
  /** Group table */
  group: (grouping: ISortingItem[]) => void;
};

interface DataActions {
  /** Set row data after inline editing */
  setRowData: (rowIndex: number, data: ITableRowData) => void;
};

interface _FilterActions {
  /** change quick search text without refreshing of the table data */
  changeQuickSearch: (val: string) => void;
  /** change quick search and refresh table data */
  performQuickSearch: (val: string) => void;
  /** Toggle advanced filter */
  toggleAdvancedFilter: (isVisible?: boolean | undefined) => void;
};


export interface DataTableApi extends BaseComponentApi, PagerActions, SelectionActions, SortingActions, GroupingActions, DataActions, _FilterActions {
  /** Refresh table */
  refreshTable: () => Promise<void>;
  /** Export table data to Excel */
  exportToExcel?: () => Promise<void>;

  /** Datatable data (fetched from the back-end) */
  readonly tableData?: object[];
  /** Selected page size */
  readonly selectedPageSize?: number;
  /** Current page number */
  readonly currentPage?: number;
  /** Total number of pages */
  readonly totalPages?: number;
  /** Total number of rows */
  readonly totalRows?: number;
  /** Total number of rows before the filtration */
  readonly totalRowsBeforeFilter?: number;

  /** Quick search string */
  readonly quickSearch?: string;
  /** User sorting */
  readonly userSorting?: SortingRule[];

  /** Rows grouping */
  readonly grouping?: GroupingItem[];

  /** Advanced filter: applied values */
  readonly tableFilter?: ITableFilter[];

  /** Selected filters (stored or predefined) */
  readonly selectedStoredFilterIds?: string[];

  /** List of Ids of selected rows */
  readonly selectedIds?: string[];

  /** Whether the table is loading data */
  readonly isFetchingTableData?: boolean;

  /** List of selected rows */
  readonly selectedRows?: ITableRowData[];

  /** index of selected row */
  readonly selectedRow?: ISelectionProps | undefined;
}

export interface IStoredFilter {
  id: string;

  name: string;

  tooltip?: string | undefined;

  expression?: FilterExpression | undefined;

  selected?: boolean | undefined;

  defaultSelected?: boolean | undefined;

  sortOrder?: number | undefined;

  permissions?: string[] | undefined;

  hasDynamicExpression?: boolean | undefined;

  allFieldsEvaluatedSuccessfully?: boolean | undefined;

  unevaluatedExpressions?: string[] | undefined;
}
