/* eslint-disable @typescript-eslint/no-explicit-any */

// ToDo: AS - import base interfaces from componentApi.ts
// ToDo: AS - remove any type and replace with specific interfaces

export type InteractionMode = 'edilist' | 'readOnly' | 'disabled' | 'inherited' | boolean;

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

export interface IListFilter {
  readonly columnId: string;
  readonly filterOption: IndexColumnFilterOption | undefined;
  readonly filter: any | undefined;
}

export type ColumnFilter = string[] | number[] | /* Moment[] |*/ Date[] | string | number | /* Moment |*/ Date | boolean;

export interface ISelectionProps {
  index?: number | undefined;
  id?: string | undefined;
  item: IListItemData;
}

/** Represents the shape of a list item with at minimum an id property */
export interface IListItemData {
  id: string;
  [key: string]: any;
};

export interface ItemSelection<D extends Record<string, unknown> = Record<string, unknown>> {
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
  /** Set selected item ids */
  changeSelectedIds: (selectedIds: string[]) => void;
  /** Clear selected item */
  clearSelectedItem: () => void;
};

interface SortingActions {
  /** Sort list */
  sort: (sorting: SortingRule[]) => void;
};
interface GroupingActions {
  /** Group list */
  group: (grouping: ISortingItem[]) => void;
};

interface DataActions {
  /** Set item data after inline editing */
  setItemData: (itemIndex: number, data: IListItemData) => void;
};

interface _FilterActions {
  /** change quick search text without refreshing of the list data */
  changeQuickSearch: (val: string) => void;
  /** change quick search and refresh list data */
  performQuickSearch: (val: string) => void;
  /** Toggle advanced filter */
  toggleAdvancedFilter: (isVisible?: boolean | undefined) => void;
};


export interface DataListApi extends BaseComponentApi, PagerActions, SelectionActions, SortingActions, GroupingActions, DataActions, _FilterActions {
  /** Refresh list */
  refreshList: () => Promise<void>;
  /** Export list data to Excel */
  exportToExcel?: () => Promise<void>;

  /** Datalist data (fetched from the back-end) */
  readonly listData?: object[];
  /** Selected page size */
  readonly selectedPageSize?: number;
  /** Current page number */
  readonly currentPage?: number;
  /** Total number of pages */
  readonly totalPages?: number;
  /** Total number of items */
  readonly totalItems?: number;
  /** Total number of items before the filtration */
  readonly totalItemsBeforeFilter?: number;

  /** Quick search string */
  readonly quickSearch?: string;
  /** User sorting */
  readonly userSorting?: SortingRule[];

  /** Items grouping */
  readonly grouping?: GroupingItem[];

  /** Advanced filter: applied values */
  readonly listFilter?: IListFilter[];

  /** Selected filters (stored or predefined) */
  readonly selectedStoredFilterIds?: string[];

  /** List of Ids of selected items */
  readonly selectedIds?: string[];

  /** Whether the list is loading data */
  readonly isFetchingListData?: boolean;

  /** List of selected items */
  readonly selectedItems?: IListItemData[];

  /** index of selected item */
  readonly selectedItem?: ISelectionProps | undefined;
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
