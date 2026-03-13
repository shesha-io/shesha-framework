import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IDataColumnsProps, IEditableColumnProps } from '../datatableColumnsConfigurator/models';
import { IPropertyMetadata, ProperyDataType } from '@/interfaces/metadata';
import { Moment } from 'moment';
import { FormFullName, IDictionary, IPropertySetting } from '@/interfaces';
import { CSSProperties, ReactNode } from 'react';
import { IGenericGetAllPayload, IHasEntityTypeIdPayload } from '@/interfaces/gql';
import { isDefined } from '@/utils/nullables';

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

  id?: string | undefined;
  columnId?: string | undefined;
  accessor: string;
  header: string;
  caption?: string | undefined;
  description?: string | undefined;

  isVisible: boolean; // is visible in the table (including columns selector, filter etc.)
  show?: boolean | undefined; // is visible on client
  isFilterable: boolean;
  isSortable: boolean;

  minWidth?: number | undefined;
  maxWidth?: number | undefined;
  width?: number | undefined;

  filterOption?: IndexColumnFilterOption | undefined;
  // filter?: unknown | undefined; // TODO V1: review and remove if unused

  name?: string | undefined;
  allowShowHide?: boolean | undefined;
  metadata?: IPropertyMetadata | undefined;
  backgroundColor?: string | IPropertySetting<string> | undefined;
  anchored?: IAnchoredDirection | undefined;
}

export interface IAnchoredColumnProps {
  shift?: number;
  shadowPosition?: number;
}
export interface CellStyleFuncArgs {
  /**
   * Row values
   */
  row: unknown;
  /**
   * Cell value
   */
  value: unknown;
}
export type CellStyleFunc = (args: CellStyleFuncArgs) => CSSProperties;
export type CellStyleAccessor = CSSProperties | CellStyleFunc | undefined;

export interface ITableDataFetchColumn extends ITableColumn {
  propertiesToFetch?: string | string[] | undefined;
  isEnitty?: boolean;
}

export interface ITableDataColumn extends ITableColumn, ITableDataFetchColumn, IEditableColumnProps {
  propertyName?: string | undefined;
  dataType?: ProperyDataType | undefined;
  dataFormat?: string | undefined;

  referenceListName?: string | undefined;
  referenceListModule?: string | undefined;
  entityTypeName?: string | undefined;
  entityTypeModule?: string | undefined;
  allowInherited?: boolean | undefined;
}

export interface ITableFormColumn extends ITableColumn, ITableDataFetchColumn {
  propertiesNames?: string;

  displayFormId?: FormFullName;
  createFormId?: FormFullName;
  editFormId?: FormFullName;

  minHeight?: number;
}

export const isDataColumn = (column: ITableColumn | undefined): column is ITableDataColumn => {
  return isDefined(column) && column.columnType === 'data';
};

export const isActionColumn = (column: ITableColumn | undefined): column is ITableActionColumn => {
  return isDefined(column) && column.columnType === 'action';
};

export const isCrudOperationsColumn = (column: ITableColumn | undefined): column is ITableCrudOperationsColumn => {
  return isDefined(column) && column.columnType === 'crud-operations';
};

export const isFormColumn = (column: ITableColumn | undefined): column is ITableFormColumn => {
  return isDefined(column) && column.columnType === 'form';
};

export const isRendererColumn = (column: ITableColumn | undefined): column is ITableRendererColumn => {
  return isDefined(column) && column.columnType === 'renderer';
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
  readonly properties: string | undefined;
  readonly sorting?: string | undefined;
  readonly filter?: string | undefined;
  readonly quickSearch?: string | undefined;
}

export interface IExcelColumn {
  readonly propertyName: string;
  readonly label: string;
}

export interface IExportExcelPayload extends Omit<IGenericGetAllPayload, 'entityType' | 'fullClassName' | 'module' | 'name'> {
  entityTypeId: IHasEntityTypeIdPayload;
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
  readonly sorting: IColumnSorting[];
  /** Filter in JsonLogic format */
  readonly filter?: string | undefined;
  /** Quick search (simple text search by all text columns) */
  readonly quickSearch?: string | undefined;
}

export interface ITableFilter {
  readonly columnId: string;
  readonly filterOption: IndexColumnFilterOption | undefined;
  readonly filter: ColumnFilter | undefined;
}

export interface IQuickFilter {
  readonly id: string;
  readonly name: string;
  readonly selected?: boolean;
}

export type FilterExpression = string | object;

export interface IStoredFilter {
  id: string;

  name: string;

  tooltip?: string;

  expression?: FilterExpression | undefined;

  selected?: boolean;

  defaultSelected?: boolean;

  sortOrder?: number; // TODO V1: review and remove

  permissions?: string[];

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
  entityTypeName?: string | null;
  entityTypeModule?: string | null;
  allowInherited?: boolean | null;
  isFilterable?: boolean | null;
  isSortable?: boolean | null;
  metadata?: IPropertyMetadata | null;
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
  icon?: string | undefined;

  /**
   * Configurable action configuration
   */
  actionConfiguration?: IConfigurableActionConfiguration | undefined;
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

/** Represents the shape of a table row with at minimum an id property */
export interface ITableRowData {
  id: string;
  [key: string]: unknown;
}
