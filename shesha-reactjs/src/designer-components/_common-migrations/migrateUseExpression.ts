
import { JsonLogicFilter } from '@/interfaces/jsonLogic';
import { FilterExpression, IStoredFilter } from '@/providers/dataTable/interfaces';
import { getBooleanPropertyOrUndefined } from '@/utils/object';

interface IArgumentEvaluationResult {
  handled: boolean;
  value?: JsonLogicFilter | undefined;
}
type JsonLogicContainerProcessingCallback = (
  operator: string,
  args: JsonLogicFilter[],
  argIndex: number,
) => IArgumentEvaluationResult;

const convertJsonLogicNode = (jsonLogic: JsonLogicFilter | undefined, argumentEvaluator: JsonLogicContainerProcessingCallback): JsonLogicFilter | undefined => {
  if (!jsonLogic) return undefined;

  const result: JsonLogicFilter = {};
  for (const operator in jsonLogic) {
    if (!jsonLogic.hasOwnProperty(operator)) continue;

    const args = jsonLogic[operator];

    let convertedArgs = null;

    if (Array.isArray(args)) {
      convertedArgs = args.map((arg: JsonLogicFilter, argIdx) => {
        if (typeof arg === 'object') return convertJsonLogicNode(arg, argumentEvaluator);

        const evaluationResult = argumentEvaluator(operator, args as JsonLogicFilter[], argIdx);
        return evaluationResult.handled ? evaluationResult.value : arg;
      });
    } else {
      // note: single arguments may be presented as objects, example: {"!!": {"var": "user.userName"}}
      if (typeof args === 'object') {
        convertedArgs = convertJsonLogicNode(args as JsonLogicFilter, argumentEvaluator);
      } else {
        const evaluationResult = argumentEvaluator(operator, [args as JsonLogicFilter], 0);
        convertedArgs = evaluationResult.handled ? evaluationResult.value : args;
      }
    }
    result[operator] = convertedArgs;
  }
  return result;
};

export const migrateDynamicExpression = (expression: FilterExpression | undefined): FilterExpression | undefined => {
  try {
    const parsedExpression = typeof expression === 'string' ? JSON.parse(expression) as JsonLogicFilter : expression;

    const convertedExpression = convertJsonLogicNode(
      parsedExpression,
      (_operator: string, args: object[], argIndex: number) => {
        const argValue = args[argIndex];
        if (argValue && typeof argValue === 'string' && (argValue as string).includes('{{')) {
          return {
            handled: true,
            value: { evaluate: [{ expression: argValue }] },
          };
        }
        return {
          handled: false,
        };
      },
    );
    return convertedExpression;
  } catch (error) {
    console.error('Failed to parse expression', error);
    return {};
  }
};

export const migrateFilterMustacheExpressions = (filter: IStoredFilter): IStoredFilter => {
  const useExpression = getBooleanPropertyOrUndefined(filter, 'useExpression') ?? false;
  if (!useExpression) return filter;

  if ("useExpression" in filter)
    delete filter['useExpression'];
  const { expression } = filter;

  const convertedExpression = migrateDynamicExpression(expression);
  return { ...filter, expression: convertedExpression ?? undefined };
};
