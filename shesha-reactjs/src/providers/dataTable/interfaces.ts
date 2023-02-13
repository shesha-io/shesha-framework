import { Moment } from 'moment';
import { IDataColumnsProps } from '../datatableColumnsConfigurator/models';
import { IPublicDataTableActions } from './contexts';
export type ColumnFilter = string[] | number[] | Moment[] | Date[] | string | number | Moment | Date | boolean;

export type IndexColumnDataType =
  | 'string'
  | 'number'
  | 'date'
  | 'date-time'
  | 'time'
  | 'boolean'
  | 'reference-list-item'
  | 'multiValueRefList'
  | 'entity'
  | 'action'
  | 'other';

export type IndexColumnFilterOption =
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'equals'
  | 'lessThan'
  | 'greaterThan'
  | 'between'
  | 'before'
  | 'after';

export type SortDirection = 0 /*asc*/ | 1 /*desc*/;
export type ColumnSorting = 'asc' | 'desc';

export interface ITableColumn {
  dataFormat?: string;
  id?: string;
  accessor: string;
  header: string;
  isVisible: boolean; // is visible in the table (including columns selector, filter etc.)
  show?: boolean; // is visible on client
  dataType?: IndexColumnDataType;
  filterOption?: IndexColumnFilterOption;
  filter?: any;
  isFilterable: boolean;
  isSortable: boolean;
  isEditable?: boolean;
  defaultSorting?: SortDirection;
  columnId?: string;
  propertyName?: string;
  name?: string;
  caption?: string;
  allowShowHide?: boolean;
  //width?: string;
  referenceListName?: string;
  referenceListModule?: string;
  entityReferenceTypeShortAlias?: string;
  allowInherited?: boolean;

  minWidth?: number;
  maxWidth?: number;
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

export interface IGetDataPayload {
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

export interface IExportExcelPayload extends IGetDataPayload {
  columns: IExcelColumn[];
}

export interface IGetDataPayloadInternal {
  readonly entityType: string;
  readonly properties: string[];
  readonly pageSize: number;
  readonly currentPage: number;
  readonly sorting: IColumnSorting[];
  readonly quickSearch: string;
  readonly advancedFilter?: IFilterItem[];
  readonly parentEntityId?: string;
  selectedFilterIds?: string[];
  selectedFilters?: IStoredFilter[];

  /**
   * If this is true, the data table will be cleared
   *
   * This is useful in a case where the payload has filters which have not been fully evaluated and `onlyFetchWhenFullyEvaluated` is `true`
   * the wouldn't wat to fetch the data at this stage and they don't want any data to be displayed on the table view as that would be misleading
   */
  skipFetch?: boolean;
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

export interface ICustomFilter {
  readonly id: string;
  readonly name: string;
  readonly columns: ITableColumn[];
  readonly isPrivate: boolean;
  readonly isApplied?: boolean;
}

export type FilterExpressionType = 'jsonLogic' | 'hql';
export type FilterType = 'predefined' | 'user-defined' | 'quick';
export interface IStoredFilter {
  id: string;

  name: string;

  tooltip?: string;
  // Exclusive filters cannot be applied on top of other filters. Only one can be selected

  isExclusive?: boolean;
  // Private filters are managed within the data table control
  isPrivate?: boolean;

  expressionType?: FilterExpressionType | string;

  expression?: string | object;

  filterType?: string;

  // use
  useExpression?: boolean;

  onlyFetchWhenFullyEvaluated?: boolean;

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
  //readonly totalRowsBeforeFilter: number;
  readonly items: object[];
}

export interface ITableDataInternalResponse {
  readonly totalPages: number;
  readonly totalRows: number;
  readonly totalRowsBeforeFilter: number;
  readonly rows: object[];
}

export interface IDataTableInstance extends IPublicDataTableActions { }

export interface IFormDataPayload {
  formData?: any;
}

export interface IFormDataPayload {
  crudSettings?: any;
}

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
  autocompleteUrl?: string | null;
  allowInherited?: boolean;
  isFilterable?: boolean;
  isSortable?: boolean;
}

//#region todo: remove
export interface GetColumnsInput {
  entityType: string;
  properties?: string[] | null;
}

export interface DataTableColumnDtoListAjaxResponse {
  targetUrl?: string | null;
  success?: boolean;
  error?: ErrorInfo;
  unAuthorizedRequest?: boolean;
  __abp?: boolean;
  result?: DataTableColumnDto[] | null;
}

export interface ValidationErrorInfo {
  message?: string | null;
  members?: string[] | null;
}

export interface ErrorInfo {
  code?: number;
  message?: string | null;
  details?: string | null;
  validationErrors?: ValidationErrorInfo[] | null;
}
//#endregion

export interface ITableColumnsBuilder {
  columns: IDataColumnsProps[];
  addProperty: (name: string, caption: string) => ITableColumnsBuilder;
}

export type TableColumnsFluentSyntax = (builder: ITableColumnsBuilder) => void;