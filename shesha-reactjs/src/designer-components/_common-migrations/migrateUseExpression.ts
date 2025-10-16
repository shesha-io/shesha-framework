import { ITableViewProps } from '@/providers/dataTable/filters/models';

interface IArgumentEvaluationResult {
  handled: boolean;
  value?: any;
}
type JsonLogicContainerProcessingCallback = (
  operator: string,
  args: object[],
  argIndex: number
) => IArgumentEvaluationResult;

const convertJsonLogicNode = (jsonLogic: object, argumentEvaluator: JsonLogicContainerProcessingCallback): object => {
  if (!jsonLogic) return null;

  const result = {};
  for (const operator in jsonLogic) {
    if (!jsonLogic.hasOwnProperty(operator)) continue;

    const args = jsonLogic[operator];

    let convertedArgs = null;

    if (Array.isArray(args)) {
      convertedArgs = args.map((arg, argIdx) => {
        if (typeof arg === 'object') return convertJsonLogicNode(arg, argumentEvaluator);

        const evaluationResult = argumentEvaluator(operator, args, argIdx);
        return evaluationResult.handled ? evaluationResult.value : arg;
      });
    } else {
      // note: single arguments may be presented as objects, example: {"!!": {"var": "user.userName"}}
      if (typeof args === 'object') {
        convertedArgs = convertJsonLogicNode(args, argumentEvaluator);
      } else {
        const evaluationResult = argumentEvaluator(operator, [args], 0);
        convertedArgs = evaluationResult.handled ? evaluationResult.value : args;
      }
    }
    result[operator] = convertedArgs;
  }
  return result;
};

export const migrateDynamicExpression = (expression: string | object): object => {
  try {
    const parsedExpression = typeof expression === 'string' ? JSON.parse(expression) : expression;

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

export const migrateFilterMustacheExpressions = (filter: ITableViewProps): ITableViewProps => {
  const useExpression = Boolean(filter['useExpression']);
  if (!useExpression) return filter;

  delete filter['useExpression'];
  const { expression } = filter;

  const convertedExpression = migrateDynamicExpression(expression);
  return { ...filter, expression: convertedExpression };
};
