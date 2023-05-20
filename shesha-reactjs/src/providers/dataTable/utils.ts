import { executeExpression } from './../form/utils';
import { ColumnSorting, DataTableColumnDto, IActionColumnProps, ITableActionColumn, IStoredFilter, ITableColumn, ITableFilter, SortDirection, ITableDataColumn } from './interfaces';
import { IMatchData } from '../form/utils';
import moment, { Moment, isMoment, isDuration, Duration } from 'moment';
import { IDataTableUserConfig, MIN_COLUMN_WIDTH } from './contexts';
import { convertJsonLogicNode, IArgumentEvaluationResult } from '../../utils/jsonLogic';
import { IConfigurableColumnsProps, IDataColumnsProps } from 'providers/datatableColumnsConfigurator/models';
import { camelcaseDotNotation } from 'utils/string';
import { ProperyDataType } from 'interfaces/metadata';
import { NestedPropertyMetadatAccessor } from 'providers/metadataDispatcher/contexts';

// Filters should read properties as camelCase ?:(
export const evaluateDynamicFilters = async (filters: IStoredFilter[], mappings: IMatchData[], propertyMetadataAccessor: NestedPropertyMetadatAccessor): Promise<IStoredFilter[]> => {
  if (filters?.length === 0 || !mappings?.length) 
    return filters;

  const convertedFilters = await Promise.all(filters.map(async (filter) => {
    // correct way of processing JsonLogic rules
    if (typeof filter.expression === 'object') {

      const evaluator = (operator: string, args: object[], argIndex: number): IArgumentEvaluationResult => {

        const argValue = args[argIndex];
        // special handling for specifications
        // todo: move `is_satisfied` operator name to constant
        if (operator === 'is_satisfied' && argIndex === 1) {
          // second argument is an expression that should be converted to boolean
          if (typeof (argValue) === 'string') {
            const evaluationContext = mappings.reduce((acc, item) => ({ ...acc, [item.match]: item.data }), {});
            const evaluatedValue = executeExpression<boolean>(argValue, evaluationContext, false, err => {
              console.error('Failed to convert value', err);
              return null;
            });

            return { handled: evaluatedValue !== null, value: Boolean(evaluatedValue) };
          }
        }

        return { handled: false };
      };

      const evaluationData = {
        hasDynamicExpression: false,
        allFieldsEvaluatedSuccessfully: true,
        unevaluatedExpressions: [],
      };

      const getVariableDataType = (variable: string): Promise<string> => {
        return propertyMetadataAccessor
          ? propertyMetadataAccessor(variable).then(m => m.dataType)
          : Promise.resolve('string');
      };

      const convertedExpression = await convertJsonLogicNode(filter.expression, {
        argumentEvaluator: evaluator,
        mappings,
        getVariableDataType,
        onEvaluated: args => {
          evaluationData.hasDynamicExpression = true;
          evaluationData.allFieldsEvaluatedSuccessfully = evaluationData.allFieldsEvaluatedSuccessfully && args.success;
          if (args.unevaluatedExpressions && args.unevaluatedExpressions.length)
            evaluationData.unevaluatedExpressions.push(...args.unevaluatedExpressions);
        }
      });
      return {
        ...filter,
        ...evaluationData,
        expression: convertedExpression,
      } as IStoredFilter;
    }

    return Promise.resolve(filter);
  }));

  return convertedFilters;
};

export const hasDynamicFilter = (filters: IStoredFilter[]) => {
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

export const ADVANCEDFILTER_DATE_FORMAT = 'DD/MM/YYYY';
export const ADVANCEDFILTER_DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';
export const ADVANCEDFILTER_TIME_FORMAT = 'HH:mm';

export const getMoment = (value: any, format: string): Moment => {
  if (value === null || value === undefined) return undefined;

  if (isMoment(value)) return value;

  return moment(value as string, format).isValid() ? moment.utc(value as string, format) : undefined;
};

export const getDuration = (value: any): Duration => {
  if (value === null || value === undefined) return undefined;

  if (isDuration(value)) return value;

  const durationValue = moment.duration(value as string);
  return durationValue.isValid() ? durationValue : undefined;
};

export const advancedFilter2JsonLogic = (advancedFilter: ITableFilter[], columns: ITableColumn[]): object[] => {
  if (!advancedFilter || advancedFilter.length === 0) return null;

  const filterItems = advancedFilter
    .map(f => {
      const property = { var: f.columnId };
      const column = columns.find(c => c.id === f.columnId && c.columnType === 'data') as ITableDataColumn;
      // skip incorrect columns
      if (!column || !column.dataType)
        return null;

      const filterValues = Array.isArray(f.filter)
        ? f.filter.map(filterValue => convertFilterValue(filterValue, column))
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
    .filter(f => Boolean(f));

  return filterItems;
};

export const getIncomingSelectedStoredFilterIds = (filters: IStoredFilter[], id: string) => {
  const fallback = filters?.length ? [filters[0]?.id] : [];

  try {
    if (id && localStorage.getItem(id)) {
      const filter = (JSON.parse(localStorage.getItem(id)) as IDataTableUserConfig)?.selectedFilterIds;

      return filter?.length ? filter : fallback;
    }

    return fallback;
  } catch (_e) {
    return fallback;
  }
};

export const prepareColumn = (column: IConfigurableColumnsProps, columns: DataTableColumnDto[], userConfig: IDataTableUserConfig): ITableColumn => {
  const baseProps: ITableColumn = {
    id: column.id,
    accessor: column.id,
    columnId: column.id,
    columnType: column.columnType,

    header: column.caption,
    caption: column.caption,
    minWidth: column.minWidth || MIN_COLUMN_WIDTH,
    maxWidth: column.maxWidth,
    isVisible: column.isVisible,
    show: column.isVisible,

    isFilterable: false,
    isSortable: false,
    allowShowHide: false,
  };

  switch (column.columnType) {
    case 'data': {
      const dataProps = column as IDataColumnsProps;

      const userColumn = userConfig?.columns?.find(c => c.id === dataProps.propertyName);
      const colVisibility = userColumn?.show === null || userColumn?.show === undefined
        ? column.isVisible
        : userColumn?.show;

      const srvColumn = dataProps.propertyName
        ? columns.find(
          c => camelcaseDotNotation(c.propertyName) === camelcaseDotNotation(dataProps.propertyName)
        )
        : {};

      const dataCol: ITableDataColumn = {
        ...baseProps,
        id: dataProps?.propertyName,
        accessor: camelcaseDotNotation(dataProps?.propertyName),
        propertyName: dataProps?.propertyName,

        createComponent: dataProps.createComponent,
        editComponent: dataProps.editComponent,
        displayComponent: dataProps.displayComponent,

        dataType: srvColumn?.dataType as ProperyDataType,
        dataFormat: srvColumn?.dataFormat,
        isSortable: srvColumn?.isSortable,
        isFilterable: srvColumn?.isFilterable,
        entityReferenceTypeShortAlias: srvColumn?.entityReferenceTypeShortAlias,
        referenceListName: srvColumn?.referenceListName,
        referenceListModule: srvColumn?.referenceListModule,
        allowInherited: srvColumn?.allowInherited,

        allowShowHide: true,
        show: colVisibility,
      };
      return dataCol;
    }
    case 'action': {
      const { icon, actionConfiguration } = column as IActionColumnProps;

      const actionColumn: ITableActionColumn = {
        ...baseProps,
        icon,
        actionConfiguration
      };

      return actionColumn;
    }
    case 'crud-operations': {
      return {
        ...baseProps,
      };
    }
  }
  return null;
};

/**
 * Get data columns from list of columns
 */
export const getTableDataColumns = (columns: ITableColumn[]): ITableDataColumn[] => {
  const result: ITableDataColumn[] = [];
  columns.forEach(col => {
    if (col.columnType === 'data')
      result.push(col as ITableDataColumn);
  });
  return result;
};

export const getTableDataColumn = (columns: ITableColumn[], id: string): ITableDataColumn => {
  const column = columns.find(c => c.id === id);
  return column?.columnType === 'data'
    ? column as ITableDataColumn
    : null;
};