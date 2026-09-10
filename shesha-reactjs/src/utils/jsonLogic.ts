import { JsonLogicFilter } from '@/interfaces/jsonLogic';
import { isDefined } from './nullables';
import { isNonEmptyArray } from './array';

export type ExpressionNodeValue = string | number | boolean | object | null;

/*
 * Expression evaluation moved to `@/utils/filterEvaluation`. The names below are kept so existing
 * callers keep compiling; new code should call `resolveFilter` / `resolveFilterSync` directly.
 */
export {
  convertJsonLogicNode,
  convertJsonLogicNodeSync,
  type IArgumentEvaluationResult,
  type IJsonLogicConversionOptions,
  type IJsonLogicConversionOptionsSync,
  type OnEvaluatedArguments,
} from './filterEvaluation/adapters';
export type { ArgumentEvaluator as JsonLogicContainerProcessingCallback } from './filterEvaluation/types';

type NodeCallback = (operator: string, args: unknown) => void;
const processRecursive = (jsonLogic: object, callback: NodeCallback): void => {
  for (const operator in jsonLogic) {
    if (!jsonLogic.hasOwnProperty(operator)) continue;
    const args = (jsonLogic as Record<string, unknown>)[operator];

    callback(operator, args);

    if (Array.isArray(args)) {
      args.forEach((arg: unknown) => {
        if (typeof arg === 'object' && isDefined(arg)) processRecursive(arg, callback);
      });
    } else if (typeof args === 'object' && isDefined(args))
      // note: single arguments may be presented as objects, example: {"!!": {"var": "user.userName"}}
      processRecursive(args, callback);
  }
};

export const extractVars = (jsonLogic: object): string[] => {
  const result: string[] = [];

  processRecursive(jsonLogic, (operator, args) => {
    if (operator === 'var' && typeof args === 'string') {
      if (result.indexOf(args) === -1) result.push(args);
    }
  });

  return result;
};

export const combineExpressionsWithAnd = (filters: JsonLogicFilter[]): JsonLogicFilter | undefined => {
  return isNonEmptyArray(filters)
    ? filters.length > 1
      ? {
        and: filters,
      }
      : filters[0]
    : undefined;
};
