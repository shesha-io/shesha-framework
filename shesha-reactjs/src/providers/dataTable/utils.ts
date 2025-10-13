import moment, { Duration, Moment, isDuration, isMoment } from 'moment';
import { ProperyDataType } from '@/interfaces/metadata';
import {
  IConfigurableColumnsProps,
  isActionColumnProps,
  isCrudOperationsColumnProps,
  isDataColumnProps,
  isFormColumnProps,
  isRendererColumnProps,
} from '@/providers/datatableColumnsConfigurator/models';
import { camelcaseDotNotation } from '@/utils/string';
import { IDataTableStateContext, IDataTableUserConfig, MIN_COLUMN_WIDTH } from './contexts';
import {
  ColumnSorting,
  DataTableColumnDto,
  IColumnSorting,
  isDataColumn,
  isFormColumn,
  IStoredFilter,
  ITableActionColumn,
  ITableColumn,
  ITableDataColumn,
  ITableFilter,
  ITableFormColumn,
  ITableRendererColumn,
  SortDirection,
} from './interfaces';

// Filters should read properties as camelCase ?:(
export const hasDynamicFilter = (filters: IStoredFilter[]): boolean => {
  if (filters?.length === 0) return false;

  const found = filters?.find(({ expression }) => {
    const stringExpression = typeof expression === 'string' ? expression : JSON.stringify(expression);

    return stringExpression?.includes('{{') && stringExpression?.includes('}}');
  });

  return Boolean(found);
};

export const sortDirection2ColumnSorting = (value?: SortDirection): ColumnSorting => {
  switch (value) {
    case 0:
      return 'asc';
    case 1:
      return 'desc';
    default:
      return null;
  }
};
export const columnSorting2SortDirection = (value?: ColumnSorting): SortDirection => {
  switch (value) {
    case 'asc':
      return 0;
    case 'desc':
      return 1;
    default:
      return null;
  }
};

export const ADVANCEDFILTER_DATE_FORMAT = 'DD/MM/YYYY';
export const ADVANCEDFILTER_DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';
export const ADVANCEDFILTER_TIME_FORMAT = 'HH:mm';

export const getMoment = (value: unknown, format: string): Moment => {
  if (value === null || value === undefined) return undefined;

  if (isMoment(value)) return value;

  return moment(value as string, format).isValid() ? moment.utc(value as string, format) : undefined;
};

export const getDuration = (value: unknown): Duration => {
  if (value === null || value === undefined) return undefined;

  if (isDuration(value)) return value;

  const durationValue = moment.duration(value as string);
  return durationValue.isValid() ? durationValue : undefined;
};

const convertFilterValue = (value: any, column: ITableDataColumn): any => {
  switch (column?.dataType) {
    case 'date':
      return getMoment(value, ADVANCEDFILTER_DATE_FORMAT)?.format();
    case 'date-time':
      return getMoment(value, ADVANCEDFILTER_DATETIME_FORMAT)?.format();
    case 'time':
      return getDuration(value)?.asSeconds();
  }
  return value;
};

export const advancedFilter2JsonLogic = (advancedFilter: ITableFilter[], columns: ITableColumn[]): object[] => {
  if (!advancedFilter || advancedFilter.length === 0) return null;

  const filterItems = advancedFilter
    .map((f) => {
      const property = { var: f.columnId };
      const column = columns.find((c) => c.id === f.columnId && c.columnType === 'data') as ITableDataColumn;
      // skip incorrect columns
      if (!column || !column.dataType) return null;

      const filterValues = Array.isArray(f.filter)
        ? f.filter.map((filterValue) => convertFilterValue(filterValue, column))
        : convertFilterValue(f.filter, column);

      let filterOption = f.filterOption;
      if (!filterOption) {
        if (column.dataType === 'reference-list-item') filterOption = 'contains';
        if (column.dataType === 'entity') filterOption = 'equals';
        if (column.dataType === 'boolean') filterOption = 'equals';
      }

      switch (filterOption) {
        case 'equals':
          return {
            '==': [property, filterValues],
          };
        case 'contains':
          return column.dataType === 'string'
            ? { in: [filterValues, property] /* for strings arguments are reversed */ }
            : { in: [property, filterValues] };
        case 'greaterThan':
          return {
            '>': [property, filterValues],
          };
        case 'after':
          return {
            '>': [property, filterValues],
          };
        case 'lessThan':
          return {
            '<': [property, filterValues],
          };
        case 'before':
          return {
            '<': [property, filterValues],
          };
        case 'startsWith':
          return {
            startsWith: [property, filterValues],
          };
        case 'endsWith':
          return {
            endsWith: [property, filterValues],
          };
        case 'between':
          if (Array.isArray(filterValues) && filterValues.length === 2) {
            return {
              '<=': [filterValues[0], property, filterValues[1]],
            };
          } else console.error(`argument of the '${f.filterOption}' filter option must be an array with two values`);
      }

      console.error('operator is not supported: ' + f.filterOption);

      return null;
    })
    .filter((f) => Boolean(f));

  return filterItems;
};

export const prepareColumn = (
  column: IConfigurableColumnsProps,
  columns: DataTableColumnDto[],
  userConfig: IDataTableUserConfig,
): ITableColumn => {
  const userColumnId = isDataColumnProps(column) ? column.propertyName : column.id;
  const userColumn = userConfig?.columns?.find((c) => c.id === userColumnId);

  const baseProps: ITableColumn = {
    id: column.id,
    accessor: column.id,
    columnId: column.id,
    columnType: column.columnType,
    anchored: column.anchored,
    header: column.caption,
    caption: column.caption,
    minWidth: column.minWidth || MIN_COLUMN_WIDTH,
    maxWidth: column.maxWidth,
    width: userColumn?.width,
    isVisible: column.isVisible,
    show: column.isVisible,
    isFilterable: false,
    isSortable: false,
    allowShowHide: false,
    backgroundColor: column.backgroundColor,
    description: column.description,
  };

  if (isDataColumnProps(column)) {
    const colVisibility =
      userColumn?.show === null || userColumn?.show === undefined ? column.isVisible : userColumn?.show;

    const srvColumn = column.propertyName
      ? columns.find((c) => camelcaseDotNotation(c.propertyName) === camelcaseDotNotation(column.propertyName))
      : {};

    const dataCol: ITableDataColumn = {
      ...baseProps,
      id: column.propertyName,
      accessor: camelcaseDotNotation(column?.propertyName),
      propertyName: column.propertyName,

      propertiesToFetch: column.propertyName,
      isEnitty: srvColumn?.dataType === 'entity',

      createComponent: column.createComponent,
      editComponent: column.editComponent,
      displayComponent: column.displayComponent,

      dataType: srvColumn?.dataType as ProperyDataType,
      dataFormat: srvColumn?.dataFormat,
      isSortable: column.allowSorting && Boolean(srvColumn?.isSortable),
      isFilterable: srvColumn?.isFilterable,
      entityReferenceTypeShortAlias: srvColumn?.entityReferenceTypeShortAlias,
      referenceListName: srvColumn?.referenceListName,
      referenceListModule: srvColumn?.referenceListModule,
      allowInherited: srvColumn?.allowInherited,
      description: column?.description,
      allowShowHide: true,
      show: colVisibility,
      metadata: srvColumn?.metadata,
    };
    return dataCol;
  }

  if (isActionColumnProps(column)) {
    const { icon, actionConfiguration } = column;

    const actionColumn: ITableActionColumn = {
      ...baseProps,
      icon,
      actionConfiguration,
    };

    return actionColumn;
  }

  if (isFormColumnProps(column)) {
    return {
      ...baseProps,
      accessor: '',
      propertiesToFetch: column.propertiesNames,
      propertiesNames: column.propertiesNames,

      displayFormId: column.displayFormId,
      createFormId: column.createFormId,
      editFormId: column.editFormId,

      minHeight: column.minHeight,
    } as ITableFormColumn;
  }

  if (isRendererColumnProps(column)) {
    const rendererColumn: ITableRendererColumn = {
      ...baseProps,
      renderCell: column.renderCell,
    };
    return rendererColumn;
  }

  if (isCrudOperationsColumnProps(column)) {
    return {
      ...baseProps,
    };
  }

  return null;
};

/**
 * Get data columns from list of columns
 */
export const getTableDataColumns = (columns: ITableColumn[]): ITableDataColumn[] => {
  const result: ITableDataColumn[] = [];
  columns.forEach((col) => {
    if (isDataColumn(col)) result.push(col);
  });
  return result;
};

export const getTableFormColumns = (columns: ITableColumn[]): ITableDataColumn[] => {
  const result: ITableDataColumn[] = [];
  columns.forEach((col) => {
    if (isFormColumn(col))
      result.push(col);
  });
  return result;
};

export const getTableDataColumn = (columns: ITableColumn[], id: string): ITableDataColumn => {
  const column = columns.find((c) => c.id === id);
  return isDataColumn(column) ? column : null;
};

export const isStandardSortingUsed = (state: IDataTableStateContext): boolean => {
  return state.sortMode === 'standard' && (!state.grouping || state.grouping.length === 0);
};

/**
 * Get effective user sorting. Note: saved user sorting may be restricted by the datasource configuration
 * @param state Data table state
 * @returns Array of sorting column or null
 */
const getEffectiveUserSorting = (state: IDataTableStateContext): IColumnSorting[] => {
  if (!state.userSorting) return null;

  return state.userSorting.filter((s) => {
    if (!s.id) return false;
    const column = state.columns.find((c) => c.id === s.id);
    return column && column.isSortable;
  });
};

export const getCurrentSorting = (state: IDataTableStateContext, groupingSupported: boolean): IColumnSorting[] => {
  switch (state.sortMode) {
    case 'standard': {
      if (groupingSupported && state.grouping && state.grouping.length > 0) {
        const groupSorting = state.grouping.map<IColumnSorting>((item) => ({
          id: item.propertyName,
          desc: item.sorting === 'desc',
        }));
        if (state.sortMode === 'standard' && state.standardSorting.length > 0) {
          state.standardSorting.forEach((item) => {
            if (!groupSorting.find((c) => c.id === item.id)) groupSorting.push(item);
          });
        }
        return groupSorting;
      }

      const userSorting = getEffectiveUserSorting(state);
      return userSorting && userSorting.length > 0 ? userSorting : state.standardSorting;
    }
    case 'strict': {
      return [{ id: state.strictSortBy, desc: state.strictSortOrder === 'desc' }];
    }
  }
  return [];
};
