import { Cell, ColumnInstance } from 'react-table';
import { IAnchoredDirection, IStoredFilter } from '@/providers/dataTable/interfaces';
import { NestedPropertyMetadatAccessor } from '@/providers/metadataDispatcher/contexts';
import { IArgumentEvaluationResult, convertJsonLogicNode, convertJsonLogicNodeSync } from './jsonLogic';
import { IMatchData, executeExpression } from '@/providers/form/utils';
import { isPropertiesArray, NestedProperties } from '@/interfaces/metadata';
import { executeFunction } from '.';
import { isDefined } from './nullables';
import { extractErrorMessage } from './errors';
import { getNestedPropertyValue } from './dotnotation';
import { DataTableColumn } from '@/components/dataTable/interfaces';
import { IConfigurableColumnsProps } from '@/providers/datatableColumnsConfigurator/models';

export interface IAnchoredColumn {
  isFixed: boolean;
  direction?: IAnchoredDirection;
}

// TODO V1: review after refactoring
export const getConfigurableColumn = <D extends object = object>(column: ColumnInstance<D>): IConfigurableColumnsProps | undefined => {
  return column as unknown as IConfigurableColumnsProps;
};

export const getColumnAnchored = (anchored: string | undefined): IAnchoredColumn => {
  if (anchored === 'left') {
    return {
      isFixed: true,
      direction: 'left',
    };
  } else if (anchored === 'right') {
    return {
      isFixed: true,
      direction: 'right',
    };
  } else {
    return {
      isFixed: false,
    };
  }
};

export const calculateTotalColumnsOnFixed = <D extends object = object>(row: Cell<D>[], direction: IAnchoredDirection): number => {
  return row.filter(({ column }) => getColumnAnchored((column as DataTableColumn).anchored).direction === direction).length;
};

export const calculatePositionShift = <D extends object = object>(row: Cell<D>[], start: number, end: number): Array<number> => {
  return row.slice(start, end).map((col) => {
    // TODO: check type of `col.column.width` and remove string or handle it here
    return isDefined(col.column.minWidth) && isDefined(col.column.width) && typeof (col.column.width) === 'number' && col.column.width < col.column.minWidth
      ? col.column.minWidth
      : col.column.width;
  }) as Array<number>;
};

type EvaluationData = {
  hasDynamicExpression: boolean;
  allFieldsEvaluatedSuccessfully: boolean;
  unevaluatedExpressions: string[];
};
const EMPTY_ARRAY: IStoredFilter[] = [];

// TODO (V1) merge with evaluateDynamicFiltersSync
export const evaluateDynamicFilters = async (
  filters: IStoredFilter[] | undefined,
  mappings: IMatchData[],
  propertyMetadataAccessor: NestedPropertyMetadatAccessor | undefined,
): Promise<IStoredFilter[]> => {
  if (!isDefined(filters) || !isDefined(mappings)) return EMPTY_ARRAY;
  if (filters.length === 0 || mappings.length === 0) return EMPTY_ARRAY;

  const convertedFilters = await Promise.all(
    filters.map(async (filter) => {
      // correct way of processing JsonLogic rules
      if (typeof filter.expression === 'object') {
        const evaluator = (operator: string, args: unknown[], argIndex: number): IArgumentEvaluationResult => {
          const argValue = args[argIndex];
          // special handling for specifications
          // TODO: move `is_satisfied` operator name to constant
          if (operator === 'is_satisfied' && argIndex === 1) {
            // second argument is an expression that should be converted to boolean
            if (typeof argValue === 'string') {
              const evaluationContext = mappings.reduce((acc, item) => ({ ...acc, [item.match]: item.data }), {});
              const evaluatedValue = executeExpression<boolean>(argValue, evaluationContext, false, (err) => {
                console.error('Failed to convert value', err);
                return null;
              });

              return { handled: evaluatedValue !== null, value: Boolean(evaluatedValue) };
            }
          }

          return { handled: false };
        };

        const evaluationData: EvaluationData = {
          hasDynamicExpression: false,
          allFieldsEvaluatedSuccessfully: true,
          unevaluatedExpressions: [],
        };

        const getVariableDataType = (variable: string): Promise<string> => {
          return isDefined(propertyMetadataAccessor)
            ? propertyMetadataAccessor(variable).then((m) => m?.dataType ?? "")
            : Promise.resolve('string');
        };

        const convertedExpression = isDefined(filter.expression)
          ? await convertJsonLogicNode(filter.expression, {
            argumentEvaluator: evaluator,
            mappings,
            getVariableDataType,
            onEvaluated: (args) => {
              evaluationData.hasDynamicExpression = true;
              evaluationData.allFieldsEvaluatedSuccessfully =
                evaluationData.allFieldsEvaluatedSuccessfully && args.success;
              if (args.unevaluatedExpressions && args.unevaluatedExpressions.length)
                evaluationData.unevaluatedExpressions.push(...args.unevaluatedExpressions);
            },
          })
          : undefined;
        return {
          ...filter,
          ...evaluationData,
          expression: convertedExpression,
        } as IStoredFilter;
      }

      return Promise.resolve(filter);
    }),
  );

  return convertedFilters;
};

// TODO (V1) merge with evaluateDynamicFilters
// Synchronous version of evaluateDynamicFilters
export const evaluateDynamicFiltersSync = (
  filters: IStoredFilter[],
  mappings: IMatchData[],
  propertyMetadata: NestedProperties,
): IStoredFilter[] => {
  if (!isDefined(filters) || !isDefined(mappings)) return EMPTY_ARRAY;
  if (filters.length === 0 || mappings.length === 0) return EMPTY_ARRAY;

  const convertedFilters = filters.map((filter) => {
    // Handle string expressions by parsing them to objects
    if (typeof filter.expression === 'string') {
      try {
        const parsed = JSON.parse(filter.expression) as unknown;
        // Validate the parsed expression has expected structure
        if (typeof parsed !== 'object' || parsed === null) {
          throw new Error('Parsed expression must be an object');
        }
        filter.expression = parsed;
      } catch (error) {
        console.error(`Failed to parse filter expression for filter ${filter.id || 'unknown'}:`, error);
        // Mark filter as having an invalid expression
        return { ...filter, hasInvalidExpression: true, expressionError: extractErrorMessage(error) };
      }
    }
    // correct way of processing JsonLogic rules
    if (typeof filter.expression === 'object') {
      const evaluator = (operator: string, args: unknown[], argIndex: number): IArgumentEvaluationResult => {
        const argValue = args[argIndex];

        // Handle mustache expressions in string values
        if (typeof argValue === 'string' && argValue.includes('{{') && argValue.includes('}}')) {
          const evaluationContext = mappings.reduce((acc, item) => ({ ...acc, [item.match]: item.data }), {});
          const evaluatedValue = executeExpression<unknown>(argValue, evaluationContext, false, (err) => {
            console.error('Failed to evaluate mustache expression:', err);
            return null;
          });

          return { handled: evaluatedValue !== null, value: evaluatedValue };
        }

        // special handling for specifications
        // TODO: move `is_satisfied` operator name to constant
        if (operator === 'is_satisfied' && argIndex === 1) {
          // second argument is an expression that should be converted to boolean
          if (typeof argValue === 'string') {
            const evaluationContext = mappings.reduce((acc, item) => ({ ...acc, [item.match]: item.data }), {});
            const evaluatedValue = executeExpression<boolean>(argValue, evaluationContext, false, (err) => {
              console.error('Failed to convert value', err);
              return null;
            });

            return { handled: evaluatedValue !== null, value: Boolean(evaluatedValue) };
          }
        }

        // Handle JavaScript expressions - use stricter pattern matching
        const functionPattern = /^\s*(function\s*\(|\(.*?\)\s*=>|[a-zA-Z_$][a-zA-Z0-9_$]*\s*=>)/;
        if (typeof argValue === 'string' && functionPattern.test(argValue)) {
          const evaluationContext = mappings.reduce((acc, item) => ({ ...acc, [item.match]: item.data }), {});
          const evaluatedValue = executeFunction(argValue, evaluationContext);

          return { handled: evaluatedValue !== null, value: evaluatedValue };
        }

        // Handle simple variable references (var operator)
        if (typeof argValue === 'string' && argValue.startsWith('{{') && argValue.endsWith('}}')) {
          const variableName = argValue.slice(2, -2).trim();
          const evaluationContext = mappings.reduce((acc, item) => ({ ...acc, [item.match]: item.data }), {});

          // Try to resolve the variable from the context
          const variableValue = getNestedPropertyValue(evaluationContext, variableName);

          return { handled: variableValue !== undefined, value: variableValue };
        }

        return { handled: false };
      };

      const evaluationData: EvaluationData = {
        hasDynamicExpression: false,
        allFieldsEvaluatedSuccessfully: true,
        unevaluatedExpressions: [],
      };

      const getVariableDataType = (variable: string): string => {
        return propertyMetadata && isPropertiesArray(propertyMetadata)
          ? propertyMetadata.find((m) => m.label === variable)?.dataType ?? ''
          : 'string';
      };

      const convertedExpression = convertJsonLogicNodeSync(filter.expression, {
        argumentEvaluator: evaluator,
        mappings,
        getVariableDataType,
        onEvaluated: (args) => {
          evaluationData.hasDynamicExpression = true;
          evaluationData.allFieldsEvaluatedSuccessfully =
            evaluationData.allFieldsEvaluatedSuccessfully && args.success;
          if (args.unevaluatedExpressions && args.unevaluatedExpressions.length)
            evaluationData.unevaluatedExpressions.push(...args.unevaluatedExpressions);
        },
      });
      return {
        ...filter,
        ...evaluationData,
        expression: convertedExpression,
      } as IStoredFilter;
    }

    return filter;
  });

  return convertedFilters;
};
