import { evaluateComplexStringWithResult, executeExpression } from './../form/utils';
import { ColumnSorting, IStoredFilter, ITableColumn, ITableFilter, SortDirection } from './interfaces';
import { IMatchData } from '../form/utils';
import moment, { Moment, isMoment, isDuration, Duration } from 'moment';
import { IDataTableUserConfig } from './contexts';
import { convertJsonLogicNode, IArgumentEvaluationResult } from '../../utils/jsonLogic';

// Filters should read properties as camelCase ?:(
export const evaluateDynamicFilters = (filters: IStoredFilter[], mappings: IMatchData[]) => {
  if (filters?.length === 0 || !mappings?.length) return filters;

  return filters.map(filter => {
    const expressionString = JSON.stringify(filter?.expression);

    // todo: review. We MUST NOT process JsonLogic as string
    // this code will be replaced with the code below
    if (expressionString?.includes('{{')) {
      const { result, success, unevaluatedExpressions } = evaluateComplexStringWithResult(expressionString, mappings);

      return {
        ...filter,
        expression: JSON.parse(result),
        allFieldsEvaluatedSuccessfully: success,
        unevaluatedExpressions,
      };
    }
    
    // correct way of processing JsonLogic rules
    if (typeof filter.expression === 'object'){
      const evaluator = (operator: string, args: object[], argIndex: number): IArgumentEvaluationResult => {
        const argValue = args[argIndex];
        // special handling for specifications
        // todo: move `is_satisfied` operator name to constant
        if (operator === 'is_satisfied' && argIndex === 1){
          // second argument is an expression that should be converted to boolean
          if (typeof(argValue) === 'string'){
            const evaluationContext = mappings.reduce((acc, item) => ({...acc, [item.match]: item.data}), {});
            const evaluatedValue = executeExpression<boolean>(argValue, evaluationContext, false, err => {
              console.error('Failed to convert value', err);
              return null;
            });

            return { handled: evaluatedValue !== null, value: Boolean(evaluatedValue) };
          }          
        }

        // handle strings with mustache syntax
        if (typeof(argValue) === 'string'){
          const strArgValue = argValue as string;
          if (strArgValue?.includes('{{')){
            const { result/*, success, unevaluatedExpressions*/ } = evaluateComplexStringWithResult(argValue, mappings);
            return { handled: true, value: result };
          }
        }

        return { handled: false };
      }
      const convertedExpression = convertJsonLogicNode(filter.expression, evaluator);
      return {
        ...filter,
        expression: convertedExpression,
      };
    }

    return filter;
    /* commented out buggy code, will be removed/reviewed after refactoring of the `use expressions` functionality
    //Evaluates the straight values
    let filterHolder;
    let ruleJoin;
    let sterilizedResult = filter.expression;
    if (!!sterilizedResult) {
      ruleJoin =
        typeof filter.expression === 'string'
          ? Object.keys(JSON.parse(filter.expression))[0]
          : Object.keys(filter.expression)[0];
      if (ruleJoin) {
        filterHolder = sterilizedResult[ruleJoin]?.map(flt => {
          let operator = Object.keys(flt)[0];
          let mutated = flt[operator]?.map((vr, index) => {
            if (index) {
              if (hasBoolen(vr)) {
                return getBoolen(vr);
              }
              return isNaN(vr) ? vr.replace(/("|')/g, '') : parseInt(vr);
            } else {
              return vr;
            }
          });
          return {
            [operator]: mutated,
          };
        });
      }
    }

    filterHolder = !!filterHolder ? { [ruleJoin]: filterHolder } : filter.expression;

    return { ...filter, expression: filterHolder };
    */
  });
};

export const hasDynamicFilter = (filters: IStoredFilter[]) => {
  if (filters?.length === 0) return false;

  const found = filters?.find(({ expression }) => {
    const _expression = typeof expression === 'string' ? expression : JSON.stringify(expression);

    return _expression?.includes('{{') && _expression?.includes('}}');
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

const convertFilterValue = (value: any, column: ITableColumn): any => {
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
      const column = columns.find(c => c.id == f.columnId);
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
          if (Array.isArray(filterValues) && filterValues.length == 2) {
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
