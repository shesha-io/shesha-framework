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
import { camelcaseDotNotation, firstNonEmptyStringOrUndefined } from '@/utils/string';
import { IDataTableStateContext, IDataTableUserConfig, MIN_COLUMN_WIDTH } from './contexts';
import {
  ColumnSorting,
  DataTableColumnDto,
  IColumnSorting,
  IndexColumnFilterOption,
  isDataColumn,
  isFormColumn,
  ISortingItem,
  IStoredFilter,
  ITableActionColumn,
  ITableColumn,
  ITableDataColumn,
  ITableFilter,
  ITableFormColumn,
  ITableRendererColumn,
  JsonLogicFilter,
  SortDirection,
} from './interfaces';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { isNonEmptyArray } from '@/utils/array';

// Filters should read properties as camelCase ?:(
export const hasDynamicFilter = (filters: IStoredFilter[]): boolean => {
  if (filters.length === 0) return false;

  const found = filters.some(({ expression }) => {
    const stringExpression = isDefined(expression)
      ? typeof expression === 'string'
        ? expression
        : JSON.stringify(expression)
      : undefined;

    return !isNullOrWhiteSpace(stringExpression) && stringExpression.includes('{{') && stringExpression.includes('}}');
  });

  return found;
};

export const sortDirection2ColumnSorting = (value?: SortDirection): ColumnSorting | null => {
  switch (value) {
    case 0:
      return 'asc';
    case 1:
      return 'desc';
    default:
      return null;
  }
};
export const columnSorting2SortDirection = (value?: ColumnSorting): SortDirection | null => {
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

export const getMoment = (value: unknown, format: string): Moment | undefined => {
  if (value === null || value === undefined) return undefined;

  if (isMoment(value)) return value;

  return moment(value as string, format).isValid() ? moment.utc(value as string, format) : undefined;
};

export const getDuration = (value: unknown): Duration | undefined => {
  if (value === null || value === undefined) return undefined;

  if (isDuration(value)) return value;

  const durationValue = moment.duration(value as string);
  return durationValue.isValid() ? durationValue : undefined;
};

const convertFilterValue = (value: unknown, column: ITableDataColumn): unknown => {
  switch (column.dataType) {
    case 'date':
      return getMoment(value, ADVANCEDFILTER_DATE_FORMAT)?.format();
    case 'date-time':
      return getMoment(value, ADVANCEDFILTER_DATETIME_FORMAT)?.format();
    case 'time':
      return getDuration(value)?.asSeconds();
  }
  return value;
};

export const getDefaultFilterOptionForDataType = (dataType: ProperyDataType | undefined): IndexColumnFilterOption | undefined => {
  if (dataType === 'reference-list-item') return 'contains';
  if (dataType === 'array') return 'contains';
  if (dataType === 'entity') return 'equals';
  if (dataType === 'boolean') return 'equals';
  return undefined;
};

// Expand selected bitmask values to all OR-combinations so that rows with multiple stored values
// are matched by the backend's equality-based IN check.
// e.g. [1, 4] → [1, 4, 5] because 5 = 1|4 and a row with both bits set stores 5.
const isNumberArray = (value: unknown[]): value is number[] => value.every((item) => typeof item === 'number');

const expandBitmaskSubsets = (values: number[]): number[] => {
  const n = values.length;
  // Enumerating all OR-combinations is O(2ⁿ); cap to avoid freezing the UI.
  const MAX_EXPANDABLE = 12;
  if (n > MAX_EXPANDABLE) {
    console.warn(`expandBitmaskSubsets: skipping OR-combination expansion for ${n} selected values (max ${MAX_EXPANDABLE}); rows whose stored bitmask combines multiple selected values may not be matched.`);
    return Array.from(new Set(values));
  }
  const result = new Set<number>();
  const totalSubsets = Math.pow(2, n);
  for (let mask = 1; mask < totalSubsets; mask++) {
    let combined = 0;
    for (let i = 0; i < n; i++) {
      // Check bit i without bitwise operators to satisfy no-bitwise lint rule.
      // += is safe here because multivalue ref-list item values are always powers of 2 (disjoint bits).
      if (Math.floor(mask / Math.pow(2, i)) % 2 !== 0) combined += values[i] ?? 0;
    }
    result.add(combined);
  }
  return Array.from(result);
};

export const advancedFilter2JsonLogic = (advancedFilter: ITableFilter[], columns: ITableColumn[]): JsonLogicFilter[] | null => {
  if (advancedFilter.length === 0) return null;

  const filterItems = advancedFilter
    .map<JsonLogicFilter | null>((f) => {
      const property = { var: f.columnId };
      const column = columns.find((c) => c.id === f.columnId);
      // skip incorrect columns
      if (!column || !isDataColumn(column)) return null;

      const filterValues = Array.isArray(f.filter)
        ? f.filter.map((filterValue) => convertFilterValue(filterValue, column))
        : convertFilterValue(f.filter, column);

      let filterOption = f.filterOption;
      if (isNullOrWhiteSpace(filterOption)) {
        filterOption = getDefaultFilterOptionForDataType(column.dataType);
      }

      switch (filterOption) {
        case 'equals':
          return {
            '==': [property, filterValues],
          };
        case 'contains':
          if (column.dataType === 'string') return { in: [filterValues, property] /* for strings arguments are reversed */ };
          if (column.dataType === 'array' && column.dataFormat === 'multivalue-reference-list' && Array.isArray(filterValues) && isNumberArray(filterValues))
            // Bitmask storage: expand selected values to all OR-combinations so the backend equality
            // check (col == v1 OR col == v2 ...) also matches rows that store multiple selected values.
            // e.g. [1, 4] → [1, 4, 5] so stored value 5 (= 1|4) is caught.
            // Limitation: rows with a selected value plus an unselected one (e.g. stored=3 = 1|2 where 2 is not in the filter)
            // still won't match — that case requires a backend bitmask fix.
            return { in: [property, expandBitmaskSubsets(filterValues)] };
          return { in: [property, filterValues] };
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
    .filter(isDefined);

  return filterItems;
};

export const prepareColumn = (
  column: IConfigurableColumnsProps,
  columns: DataTableColumnDto[],
  userConfig: IDataTableUserConfig | undefined,
): ITableColumn | undefined => {
  const resolvedPropertyName = isDataColumnProps(column)
    ? (column.propertyName || column.accessor || column.id)
    : undefined;
  const userColumnId = isDataColumnProps(column) ? resolvedPropertyName : column.id;
  const userColumn = userConfig?.columns?.find((c) => c.id === userColumnId);

  const baseProps: ITableColumn = {
    id: column.id,
    accessor: column.id,
    columnId: column.id,
    columnType: column.columnType,
    anchored: column.anchored,
    header: column.caption,
    caption: column.caption,
    minWidth: column.minWidth ?? MIN_COLUMN_WIDTH,
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
    const colVisibility = userColumn && isDefined(userColumn.show) ? userColumn.show : column.isVisible;

    const srvColumn = resolvedPropertyName
      ? columns.find((c) => !isNullOrWhiteSpace(c.propertyName) && camelcaseDotNotation(c.propertyName) === camelcaseDotNotation(resolvedPropertyName))
      : {};

    const dataCol: ITableDataColumn = {
      ...baseProps,
      id: resolvedPropertyName || column.id,
      accessor: resolvedPropertyName ? camelcaseDotNotation(resolvedPropertyName) : column.accessor ?? "",
      propertyName: resolvedPropertyName,

      propertiesToFetch: resolvedPropertyName,
      isEntity: srvColumn?.dataType === 'entity',

      createComponent: column.createComponent,
      editComponent: column.editComponent,
      displayComponent: column.displayComponent,

      dataType: srvColumn?.dataType as ProperyDataType,
      dataFormat: srvColumn?.dataFormat ?? undefined,
      isSortable: column.allowSorting && Boolean(srvColumn?.isSortable),
      isFilterable: srvColumn?.isFilterable ?? false,
      entityTypeName: srvColumn?.entityTypeName ?? undefined,
      entityTypeModule: srvColumn?.entityTypeModule ?? undefined,
      referenceListName: srvColumn?.referenceListName ?? undefined,
      referenceListModule: srvColumn?.referenceListModule ?? undefined,
      allowInherited: srvColumn?.allowInherited ?? false,
      description: column.description,
      allowShowHide: true,
      show: colVisibility,
      metadata: srvColumn?.metadata ?? undefined,
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

  return undefined;
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

export const getTableDataColumn = (columns: ITableColumn[], id: string): ITableDataColumn | undefined => {
  const column = columns.find((c) => c.id === id);
  return isDataColumn(column) ? column : undefined;
};

export const isStandardSortingUsed = (state: IDataTableStateContext): boolean => {
  return state.sortMode === 'standard' && (!state.grouping || state.grouping.length === 0);
};

/**
 * Get effective user sorting. Note: saved user sorting may be restricted by the datasource configuration
 * @param state Data table state
 * @returns Array of sorting column or null
 */
const getEffectiveUserSorting = (state: IDataTableStateContext): IColumnSorting[] | undefined => {
  if (!isNonEmptyArray(state.userSorting)) return undefined;

  return state.userSorting.filter((s) => {
    if (isNullOrWhiteSpace(s.id))
      return false;
    const column = state.columns.find((c) => c.id === s.id);
    return isDefined(column) && column.isSortable;
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
        if (isNonEmptyArray(state.standardSorting)) {
          state.standardSorting.forEach((item) => {
            if (!groupSorting.find((c) => c.id === item.id)) groupSorting.push(item);
          });
        }
        return groupSorting;
      }

      const userSorting = getEffectiveUserSorting(state);
      return userSorting && userSorting.length > 0
        ? userSorting
        : state.standardSorting;
    }
    case 'strict': {
      return !isNullOrWhiteSpace(state.strictSortBy)
        ? [{ id: state.strictSortBy, desc: state.strictSortOrder === 'desc' }]
        : [];
    }
  }
  return [];
};

export const sortingItems2ColumnSorting = (items: ISortingItem[] | undefined): IColumnSorting[] => {
  return items
    ? items.map<IColumnSorting>((item) => ({ id: item.propertyName, desc: item.sorting === 'desc' }))
    : [];
};


export const prepareTableColumn = (column: IConfigurableColumnsProps, repoColOverrides: DataTableColumnDto[], userConfig: IDataTableUserConfig | undefined): ITableColumn | undefined => {
  const resolvedPropertyName = isDataColumnProps(column)
    ? firstNonEmptyStringOrUndefined(column.propertyName, column.accessor, column.id)
    : undefined;
  const userColumnId = isDataColumnProps(column) ? resolvedPropertyName : column.id;
  const userColumn = userConfig?.columns?.find((c) => c.id === userColumnId);

  const baseProps: ITableColumn = {
    id: column.id,
    accessor: column.id,
    columnId: column.id,
    columnType: column.columnType,
    anchored: column.anchored,
    header: column.caption,
    caption: column.caption,
    minWidth: column.minWidth ?? MIN_COLUMN_WIDTH,
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
    const colVisibility = userColumn && isDefined(userColumn.show) ? userColumn.show : column.isVisible;

    const srvColumn = !isNullOrWhiteSpace(resolvedPropertyName)
      ? repoColOverrides.find((c) => !isNullOrWhiteSpace(c.propertyName) && camelcaseDotNotation(c.propertyName) === camelcaseDotNotation(resolvedPropertyName))
      : {};

    const dataCol: ITableDataColumn = {
      ...baseProps,
      id: !isNullOrWhiteSpace(resolvedPropertyName) ? resolvedPropertyName : column.id,
      accessor: !isNullOrWhiteSpace(resolvedPropertyName) ? camelcaseDotNotation(resolvedPropertyName) : column.accessor ?? "",
      propertyName: resolvedPropertyName,

      propertiesToFetch: resolvedPropertyName,
      isEntity: srvColumn?.dataType === 'entity',

      createComponent: column.createComponent,
      editComponent: column.editComponent,
      displayComponent: column.displayComponent,

      dataType: srvColumn?.dataType as ProperyDataType,
      dataFormat: srvColumn?.dataFormat ?? undefined,
      isSortable: column.allowSorting && Boolean(srvColumn?.isSortable),
      isFilterable: srvColumn?.isFilterable ?? false,
      entityTypeName: srvColumn?.entityTypeName ?? undefined,
      entityTypeModule: srvColumn?.entityTypeModule ?? undefined,
      referenceListName: srvColumn?.referenceListName ?? undefined,
      referenceListModule: srvColumn?.referenceListModule ?? undefined,
      allowInherited: srvColumn?.allowInherited ?? false,
      description: column.description,
      allowShowHide: true,
      show: colVisibility,
      metadata: srvColumn?.metadata ?? undefined,
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
    const formColumn: ITableFormColumn = {
      ...baseProps,
      accessor: '',
      propertiesToFetch: column.propertiesNames,
      propertiesNames: column.propertiesNames,

      displayFormId: column.displayFormId,
      createFormId: column.createFormId,
      editFormId: column.editFormId,

      minHeight: column.minHeight,
    };
    return formColumn;
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

  return undefined;
};
