import { DataTypes } from '@/interfaces/dataTypes';
import { evaluateComplexStringWithResult, IEvaluateComplexStringResult, IMatchData } from '@/providers/form/utils';
import { executeFunction } from '@/utils';
import { isDefined, isNullOrWhiteSpace } from './nullables';

export type EvaluationType = 'mustache' | 'javascript';
export interface IEvaluateNodeArgs {
  expression: string;
  type: EvaluationType | undefined;
  required?: boolean | undefined;
  [key: string]: unknown;
}
export interface IEvaluateNode {
  evaluate: IEvaluateNodeArgs;
}

export interface IEvaluateJsonLogicNode {
  evaluate: [IEvaluateNodeArgs];
}

const isEvaluateJsonLogicNode = (node: object): node is IEvaluateJsonLogicNode => {
  if ('evaluate' in node && Array.isArray(node.evaluate) && node.evaluate.length === 1) {
    const evaluateNode: unknown = node.evaluate[0];
    return isDefined(evaluateNode) && typeof (evaluateNode) === 'object' && 'expression' in evaluateNode && typeof evaluateNode.expression === 'string';
  } else
    return false;
};

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

export interface IArgumentEvaluationResult {
  handled: boolean;
  value?: unknown | undefined;
}
export type JsonLogicContainerProcessingCallback = (
  operator: string,
  args: unknown[],
  argIndex: number,
) => IArgumentEvaluationResult;

export interface OnEvaluatedArguments extends IEvaluateComplexStringResult {
  expression: string;
}
export interface IJsonLogicConversionOptions {
  argumentEvaluator: JsonLogicContainerProcessingCallback;
  mappings: IMatchData[];
  onEvaluated?: (args: OnEvaluatedArguments) => void;
  getVariableDataType?: (variable: string) => Promise<string>;
}

// Synchronous version of the options interface
export interface IJsonLogicConversionOptionsSync {
  argumentEvaluator: JsonLogicContainerProcessingCallback;
  mappings: IMatchData[];
  onEvaluated?: (args: OnEvaluatedArguments) => void;
  getVariableDataType?: (variable: string) => string;
}

interface IJsonLogicVarNode {
  var: string;
}

const isVarNode = (node: unknown): node is IJsonLogicVarNode => {
  return isDefined(node) && typeof (node) === 'object' && "var" in node && typeof node.var === 'string';
};

export type ExpressionNodeValue = string | number | boolean | object | null;

interface NestedNodeParsingResult {
  hasOptionalNonEvaluatedExpressions: boolean;
  value: ExpressionNodeValue;
}

const evaluateJavaScriptAsync = async (evaluationNode: IEvaluateNode, options: IJsonLogicConversionOptions): Promise<NestedNodeParsingResult> => {
  const expressionArguments = options.mappings.reduce((acc, current) => ({ ...acc, [current.match]: current.data }), {});

  const executionResult = executeFunction(evaluationNode.evaluate.expression, expressionArguments);

  const promise = Promise.resolve(executionResult);
  const unwrappedResult = await promise;

  const parsingResult: NestedNodeParsingResult = {
    hasOptionalNonEvaluatedExpressions: false,
    value: Boolean(unwrappedResult),
  };
  return parsingResult;
};

// Synchronous version of evaluateJavaScriptAsync
const evaluateJavaScriptSync = (evaluationNode: IEvaluateNode, options: IJsonLogicConversionOptionsSync): NestedNodeParsingResult => {
  const expressionArguments = options.mappings.reduce((acc, current) => ({ ...acc, [current.match]: current.data }), {});

  const executionResult = executeFunction(evaluationNode.evaluate.expression, expressionArguments);

  const unwrappedResult = executionResult;

  const parsingResult: NestedNodeParsingResult = {
    hasOptionalNonEvaluatedExpressions: false,
    value: Boolean(unwrappedResult),
  };
  return parsingResult;
};

// TODO: merge with evaluateMustacheSync
const evaluateMustacheAsync = async (evaluationNode: IEvaluateNode, allArgs: unknown[], options: IJsonLogicConversionOptions): Promise<NestedNodeParsingResult> => {
  const { mappings, onEvaluated: onEvaluation } = options;

  const { result, success, unevaluatedExpressions } = evaluateComplexStringWithResult(
    evaluationNode.evaluate.expression,
    mappings,
    evaluationNode.evaluate.required === true,
  );

  let convertedResult: ExpressionNodeValue = result;
  if (success && options.getVariableDataType) {
    let dataType: string | null = null;
    for (const arg of allArgs) {
      if (isVarNode(arg)) {
        const varDataType = await options.getVariableDataType(arg.var);
        if (dataType && dataType !== varDataType) {
        // data types of arguments are different, we can't convert it them automatically
          dataType = null;
          break;
        } else dataType = varDataType;
      }
    }

    switch (dataType) {
      case DataTypes.number:
      case DataTypes.referenceListItem: {
        convertedResult = convertedResult
          ? typeof (convertedResult) === 'string'
            ? parseInt(convertedResult, 10)
            : typeof (convertedResult) === 'number'
              ? convertedResult
              : null
          : null;
        break;
      }
      case DataTypes.boolean: {
        convertedResult = typeof convertedResult === 'string'
          ? !isNullOrWhiteSpace(convertedResult) && convertedResult.toLowerCase() === 'true'
          : Boolean(convertedResult);
        break;
      }
    }
  }

  if (onEvaluation)
    onEvaluation({
      expression: evaluationNode.evaluate.expression,
      result: convertedResult,
      success,
      unevaluatedExpressions,
    });

  return {
    hasOptionalNonEvaluatedExpressions: (convertedResult === '' || convertedResult === null) && !evaluationNode.evaluate.required,
    value: convertedResult,
  };
};

// TODO: merge with evaluateMustacheAsync
// Synchronous version of evaluateMustacheAsync
const evaluateMustacheSync = (evaluationNode: IEvaluateNode, allArgs: unknown[], options: IJsonLogicConversionOptionsSync): NestedNodeParsingResult => {
  const { mappings, onEvaluated: onEvaluation } = options;

  const { result, success, unevaluatedExpressions } = evaluateComplexStringWithResult(
    evaluationNode.evaluate.expression,
    mappings,
    evaluationNode.evaluate.required === true,
  );

  let convertedResult: ExpressionNodeValue = result;
  if (success && options.getVariableDataType) {
    let dataType: string | null = null;
    for (const arg of allArgs) {
      if (isVarNode(arg)) {
        const varDataType = options.getVariableDataType(arg.var);
        if (dataType && dataType !== varDataType) {
        // data types of arguments are different, we can't convert it them automatically
          dataType = null;
          break;
        } else dataType = varDataType;
      }
    }

    switch (dataType) {
      case DataTypes.number:
      case DataTypes.referenceListItem: {
        convertedResult = convertedResult
          ? typeof (convertedResult) === 'string'
            ? parseInt(convertedResult, 10)
            : typeof (convertedResult) === 'number'
              ? convertedResult
              : null
          : null;
        break;
      }
      case DataTypes.boolean: {
        convertedResult = typeof convertedResult === 'string'
          ? !isNullOrWhiteSpace(convertedResult) && convertedResult.toLowerCase() === 'true'
          : Boolean(convertedResult);
        break;
      }
    }
  }

  if (onEvaluation)
    onEvaluation({
      expression: evaluationNode.evaluate.expression,
      result: convertedResult,
      success,
      unevaluatedExpressions,
    });

  return {
    hasOptionalNonEvaluatedExpressions: (convertedResult === '' || convertedResult === null) && !evaluationNode.evaluate.required,
    value: convertedResult,
  };
};

export const getEvaluationNodeFromJsonLogicNode = (node: object): IEvaluateNode | undefined => {
  if (isEvaluateJsonLogicNode(node)) {
    const { evaluate } = node;
    const args = evaluate[0];

    return isDefined(args)
      ? {
        evaluate: {
          ...args,
          type: args.type ?? 'mustache' /* fallback to legacy */,
        },
      }
      : undefined;
  } else
    return undefined;
};

export const convertJsonLogicNode = async (
  jsonLogic: object,
  options: IJsonLogicConversionOptions,
): Promise<object | null> => {
  const { argumentEvaluator } = options;

  const parseNestedNodeAsync = async (
    node: object,
    allArgs: unknown[],
    nestedOptions: IJsonLogicConversionOptions,
  ): Promise<NestedNodeParsingResult> => {
    // special handling for evaluation nodes
    const evaluationNode = getEvaluationNodeFromJsonLogicNode(node);
    if (evaluationNode) {
      if (evaluationNode.evaluate.type === 'mustache')
        return await evaluateMustacheAsync(evaluationNode, allArgs, options);

      if (evaluationNode.evaluate.type === 'javascript')
        return await evaluateJavaScriptAsync(evaluationNode, options);

      throw new Error(`Expressions of type '${evaluationNode.evaluate.type}' are not supported`);
    } else {
      const value = await convertJsonLogicNode(node, nestedOptions);
      return {
        hasOptionalNonEvaluatedExpressions: false,
        value,
      };
    }
  };

  let result: Record<string, unknown> | null = null;
  for (const operatorName in jsonLogic) {
    if (!jsonLogic.hasOwnProperty(operatorName)) continue;

    const args: unknown = (jsonLogic as Record<string, unknown>)[operatorName];

    let convertedArgs = null;

    let hasInvalidArguments = false;

    if (Array.isArray(args)) {
      convertedArgs = await Promise.all(
        args.map(async (arg, argIdx) => {
          if (typeof arg === 'object') {
            const nestedResult = await parseNestedNodeAsync(arg as Record<string, unknown>, args, options);
            hasInvalidArguments = hasInvalidArguments || nestedResult.hasOptionalNonEvaluatedExpressions;
            return nestedResult.value;
          };

          const evaluationResult = argumentEvaluator(operatorName, args, argIdx);
          return evaluationResult.handled ? evaluationResult.value : arg;
        }),
      );
      convertedArgs = convertedArgs.filter((a) => a !== undefined);
    } else {
      // note: single arguments may be presented as objects, example: {"!!": {"var": "user.userName"}}
      if (typeof args === 'object' && isDefined(args)) {
        const nestedResult = await parseNestedNodeAsync(args as Record<string, unknown>, [], options);
        hasInvalidArguments = nestedResult.hasOptionalNonEvaluatedExpressions;
        convertedArgs = nestedResult.value;
      } else {
        const evaluationResult = argumentEvaluator(operatorName, [args], 0);
        convertedArgs = evaluationResult.handled ? evaluationResult.value : args;
      }
    }

    if (!hasInvalidArguments) {
      const argumentsAreValid = ['and', 'or'].indexOf(operatorName) > -1
        ? Array.isArray(convertedArgs) && convertedArgs.length > 0
        : true;
      if (argumentsAreValid) {
        if (!result)
          result = {};
        result[operatorName] = convertedArgs;
      }
    }
  }

  return result;
};

// Synchronous version of convertJsonLogicNode
export const convertJsonLogicNodeSync = (
  jsonLogic: object,
  options: IJsonLogicConversionOptionsSync,
): object | null => {
  const { argumentEvaluator } = options;

  const parseNestedNodeSync = (
    node: object,
    allArgs: unknown[],
    nestedOptions: IJsonLogicConversionOptionsSync,
  ): NestedNodeParsingResult => {
    // special handling for evaluation nodes
    const evaluationNode = getEvaluationNodeFromJsonLogicNode(node);
    if (evaluationNode) {
      if (evaluationNode.evaluate.type === 'mustache')
        return evaluateMustacheSync(evaluationNode, allArgs, options);

      if (evaluationNode.evaluate.type === 'javascript')
        return evaluateJavaScriptSync(evaluationNode, options);

      throw new Error(`Expressions of type '${evaluationNode.evaluate.type}' are not supported`);
    } else {
      const value = convertJsonLogicNodeSync(node, nestedOptions);
      return {
        hasOptionalNonEvaluatedExpressions: false,
        value,
      };
    }
  };

  let result: Record<string, unknown> | null = null;
  for (const operatorName in jsonLogic) {
    if (!jsonLogic.hasOwnProperty(operatorName)) continue;

    const args: unknown = (jsonLogic as Record<string, unknown>)[operatorName];

    let convertedArgs = null;

    let hasInvalidArguments = false;

    if (Array.isArray(args)) {
      convertedArgs = args.map((arg, argIdx) => {
        if (typeof arg === 'object') {
          const nestedResult = parseNestedNodeSync(arg as Record<string, unknown>, args, options);
          hasInvalidArguments = hasInvalidArguments || nestedResult.hasOptionalNonEvaluatedExpressions;
          return nestedResult.value;
        };

        const evaluationResult = argumentEvaluator(operatorName, args, argIdx);
        return evaluationResult.handled ? evaluationResult.value : arg;
      });
      convertedArgs = convertedArgs.filter((a) => a !== undefined);
    } else {
      // note: single arguments may be presented as objects, example: {"!!": {"var": "user.userName"}}
      if (typeof args === 'object' && isDefined(args)) {
        const nestedResult = parseNestedNodeSync(args as Record<string, unknown>, [], options);
        hasInvalidArguments = nestedResult.hasOptionalNonEvaluatedExpressions;
        convertedArgs = nestedResult.value;
      } else {
        const evaluationResult = argumentEvaluator(operatorName, [args], 0);
        convertedArgs = evaluationResult.handled ? evaluationResult.value : args;
      }
    }

    if (!hasInvalidArguments) {
      const argumentsAreValid = ['and', 'or'].indexOf(operatorName) > -1
        ? Array.isArray(convertedArgs) && convertedArgs.length > 0
        : true;
      if (argumentsAreValid) {
        if (!result)
          result = {};
        result[operatorName] = convertedArgs;
      }
    }
  }

  return result;
};

export interface IMustacheEvaluateNodeArgs {
  expression: string;
  required: boolean;
}

export interface IMustacheEvaluateNode {
  evaluate: IMustacheEvaluateNodeArgs[];
}
