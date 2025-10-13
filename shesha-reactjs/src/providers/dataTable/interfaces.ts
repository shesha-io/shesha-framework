import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IDataColumnsProps, IEditableColumnProps } from '../datatableColumnsConfigurator/models';
import { IPropertyMetadata, ProperyDataType } from '@/interfaces/metadata';
import { Moment } from 'moment';
import { FormFullName, IDictionary, IPropertySetting } from '@/interfaces';
import { CSSProperties, ReactNode } from 'react';

export type ColumnFilter = string[] | number[] | Moment[] | Date[] | string | number | Moment | Date | boolean;

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

export type DatatableColumnType = 'data' | 'action' | 'calculated' | 'crud-operations' | 'form' | 'renderer';

export type SortDirection = 0 /* asc*/ | 1;
export type ColumnSorting = 'asc' | 'desc';

export type DataFetchingMode = 'paging' | 'fetchAll';

export type IAnchoredDirection = 'left' | 'right';

export interface ITableColumn {
  columnType: DatatableColumnType;

  id?: string;
  columnId?: string;
  accessor: string;
  header: string;
  caption?: string;
  description?: string;

  isVisible: boolean; // is visible in the table (including columns selector, filter etc.)
  show?: boolean; // is visible on client
  isFilterable: boolean;
  isSortable: boolean;

  minWidth?: number;
  maxWidth?: number;
  width?: number;

  filterOption?: IndexColumnFilterOption;
  filter?: any;

  name?: string;
  allowShowHide?: boolean;
  metadata?: IPropertyMetadata;
  backgroundColor?: string | IPropertySetting<string>;
  anchored?: IAnchoredDirection;
}

export interface IAnchoredColumnProps {
  shift?: number;
  shadowPosition?: number;
}
export interface CellStyleFuncArgs {
  /**
   * Row values
   */
  row: any;
  /**
   * Cell value
   */
  value: any;
}
export type CellStyleFunc = (args: CellStyleFuncArgs) => CSSProperties;
export type CellStyleAccessor = CSSProperties | CellStyleFunc | undefined;

export interface ITableDataFetchColumn extends ITableColumn {
  propertiesToFetch?: string | string[];
  isEnitty?: boolean;
}

export interface ITableDataColumn extends ITableColumn, ITableDataFetchColumn, IEditableColumnProps {
  propertyName?: string;
  dataType?: ProperyDataType;
  dataFormat?: string;

  referenceListName?: string;
  referenceListModule?: string;
  entityReferenceTypeShortAlias?: string;
  allowInherited?: boolean;
}

export interface ITableFormColumn extends ITableColumn, ITableDataFetchColumn {
  propertiesNames?: string;

  displayFormId?: FormFullName;
  createFormId?: FormFullName;
  editFormId?: FormFullName;

  minHeight?: number;
}

export const isDataColumn = (column: ITableColumn): column is ITableDataColumn => {
  return column && column.columnType === 'data';
};

export const isActionColumn = (column: ITableColumn): column is ITableActionColumn => {
  return column && column.columnType === 'action';
};

export const isCrudOperationsColumn = (column: ITableColumn): column is ITableCrudOperationsColumn => {
  return column && column.columnType === 'crud-operations';
};

export const isFormColumn = (column: ITableColumn): column is ITableFormColumn => {
  return column && column.columnType === 'form';
};

export const isRendererColumn = (column: ITableColumn): column is ITableRendererColumn => {
  return column && column.columnType === 'renderer';
};

export interface ITableActionColumn extends ITableColumn, IActionColumnProps { }

export type ITableCrudOperationsColumn = ITableColumn;

export interface ITableRendererColumn extends ITableColumn {
  renderCell: (row: object) => ReactNode | string;
}

export interface ICustomFilterOptions {
  readonly id: string;
  readonly name: string;
  readonly isApplied?: boolean;
}

export interface IFilterItem {
  readonly columnId: string;
  readonly filterOption: IndexColumnFilterOption;
  filter: ColumnFilter;
}

export interface IColumnSorting {
  readonly id: string;
  readonly desc: boolean;
}

export interface IGetDataFromUrlPayload {
  readonly maxResultCount: number;
  readonly skipCount: number;
  readonly properties: string;
  readonly sorting?: string;
  readonly filter?: string;
  readonly quickSearch?: string;
}

export interface IGetDataFromBackendPayload {
  readonly entityType: string;
  readonly maxResultCount: number;
  readonly skipCount: number;
  readonly properties: string;
  readonly sorting?: string;
  readonly filter?: string;
  readonly quickSearch?: string;
}

export interface IExcelColumn {
  readonly propertyName: string;
  readonly label: string;
}

export interface IExportExcelPayload extends IGetDataFromBackendPayload {
  columns: IExcelColumn[];
}

export interface IGetListDataPayload {
  /** Page size. Set to -1 to fetch all */
  readonly pageSize: number;
  /** Page number. Starts from 1 */
  readonly currentPage: number;
  /** Data columns to fetch  */
  readonly columns: ITableDataColumn[];
  /** Sorting */
  readonly sorting?: IColumnSorting[];
  /** Filter in JsonLogic format */
  readonly filter?: string;
  /** Quick search (simple text search by all text columns) */
  readonly quickSearch?: string;
}

export interface ITableConfigResponse {
  readonly columns?: any[];
  readonly storedFilters?: any[];
}

export interface ITableFilter {
  readonly columnId: string;
  readonly filterOption: IndexColumnFilterOption;
  readonly filter: any;
}

export interface IQuickFilter {
  readonly id: string;
  readonly name: string;
  readonly selected?: boolean;
}

export type FilterExpression = string | object;

export type FilterType = 'predefined' | 'user-defined' | 'quick';
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

export interface ITableDataResponse {
  readonly totalCount: number;
  readonly items: object[];
}

export interface ITableDataInternalResponse {
  readonly totalPages: number;
  readonly totalRows: number;
  readonly totalRowsBeforeFilter: number;
  readonly rows: object[];
}

export interface IPublicDataTableActions {
  refreshTable: () => void;
  exportToExcel?: () => void;
}

export type IDataTableInstance = IPublicDataTableActions;

export type ListSortDirection = 0 | 1;

export interface DataTableColumnDto {
  propertyName?: string | null;
  name?: string | null;
  caption?: string | null;
  description?: string | null;
  dataType?: string | null;
  dataFormat?: string | null;
  referenceListName?: string | null;
  referenceListModule?: string | null;
  entityReferenceTypeShortAlias?: string | null;
  allowInherited?: boolean;
  isFilterable?: boolean;
  isSortable?: boolean;
  metadata?: IPropertyMetadata;
}

export interface ITableColumnsBuilder {
  columns: IDataColumnsProps[];
  addProperty: (name: string, caption: string) => ITableColumnsBuilder;
}

export type TableColumnsFluentSyntax = (builder: ITableColumnsBuilder) => void;

export interface IActionColumnProps {
  /**
   * Icon, is used for action columns
   */
  icon?: string;

  /**
   * Configurable action configuration
   */
  actionConfiguration?: IConfigurableActionConfiguration;
}

export interface ISortingItem {
  propertyName: string;
  sorting: ColumnSorting;
}

export type GroupingItem = ISortingItem;

export type SortMode = 'standard' | 'strict';

export type DataFetchDependencyState = 'waiting' | 'ready';
export interface DataFetchDependency {
  state: DataFetchDependencyState;
}
/**
 * Dictionary of the data fetching dependencies
 */
export type DataFetchDependencies = IDictionary<DataFetchDependency>;

export interface DataFetchDependencyStateSwitcher {
  /** Switch the dependency to the `ready` state. Note: it doesn't trigger the data fetching */
  ready: () => void;
  /** Switch the dependency to the `waiting` state. Note: it doesn't stop current data fetching process but prevents further ones until the dependency is ready */
  waiting: () => void;
}
