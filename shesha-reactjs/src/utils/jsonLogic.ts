import { DataTypes } from '@/interfaces/dataTypes';
import { evaluateComplexStringWithResult, IEvaluateComplexStringResult, IMatchData } from '@/providers/form/utils';
import { executeFunction } from '@/utils';
import { isDefined } from './nullables';

export type EvaluationType = 'mustache' | 'javascript';
export interface IEvaluateNodeArgs {
  expression: string;
  type: EvaluationType;
  [key: string]: any;
}
export interface IEvaluateNode {
  evaluate: IEvaluateNodeArgs;
}

export interface IEvaluateJsonLogicNode {
  evaluate: IEvaluateNodeArgs[];
}

type NodeCallback = (operator: string, args: object[]) => void;
const processRecursive = (jsonLogic: object, callback: NodeCallback): void => {
  if (!jsonLogic) return;
  for (const operator in jsonLogic) {
    if (!jsonLogic.hasOwnProperty(operator)) continue;
    const args = jsonLogic[operator];

    callback(operator, args);

    if (Array.isArray(args)) {
      args.forEach((arg) => {
        if (typeof arg === 'object') processRecursive(arg, callback);
      });
    } else if (typeof args === 'object')
      // note: single arguments may be presented as objects, example: {"!!": {"var": "user.userName"}}
      processRecursive(args, callback);
  }
};

export const extractVars = (jsonLogic: object): string[] => {
  const result = [];

  if (jsonLogic)
    processRecursive(jsonLogic, (operator, args) => {
      if (operator === 'var') {
        if (result.indexOf(args) === -1) result.push(args);
      }
    });

  return result;
};

export interface IArgumentEvaluationResult {
  handled: boolean;
  value?: any;
}
export type JsonLogicContainerProcessingCallback = (
  operator: string,
  args: object[],
  argIndex: number
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
const asVarNode = (node: object): IJsonLogicVarNode => {
  const typed = node as IJsonLogicVarNode;
  return typeof typed?.var === 'string' ? typed : null;
};

interface NestedNodeParsingResult {
  hasOptionalNonEvaluatedExpressions: boolean;
  value: object | string | boolean;
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

const evaluateMustacheAsync = async (evaluationNode: IEvaluateNode, allArgs: any[], options: IJsonLogicConversionOptions): Promise<NestedNodeParsingResult> => {
  const { mappings, onEvaluated: onEvaluation } = options;

  const { result, success, unevaluatedExpressions } = evaluateComplexStringWithResult(
    evaluationNode.evaluate.expression,
    mappings,
    evaluationNode.evaluate.required,
  );

  let convertedResult: any = result;
  if (success && options.getVariableDataType) {
    let dataType: string = null;
    for (const arg of allArgs) {
      const varNode = asVarNode(arg);
      if (!varNode) continue;

      const varDataType = await options.getVariableDataType(varNode.var);
      if (dataType && dataType !== varDataType) {
        // data types of arguments are different, we can't convert it them automatically
        dataType = null;
        break;
      } else dataType = varDataType;
    }

    switch (dataType) {
      case DataTypes.number:
      case DataTypes.referenceListItem: {
        convertedResult = convertedResult ? parseInt(convertedResult, 10) : null;
        break;
      }
      case DataTypes.boolean: {
        convertedResult = typeof convertedResult === 'string' ? convertedResult?.toLowerCase() === 'true' : Boolean(convertedResult);
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

// Synchronous version of evaluateMustacheAsync
const evaluateMustacheSync = (evaluationNode: IEvaluateNode, allArgs: any[], options: IJsonLogicConversionOptionsSync): NestedNodeParsingResult => {
  const { mappings, onEvaluated: onEvaluation } = options;

  const { result, success, unevaluatedExpressions } = evaluateComplexStringWithResult(
    evaluationNode.evaluate.expression,
    mappings,
    evaluationNode.evaluate.required,
  );

  let convertedResult: any = result;
  if (success && options.getVariableDataType) {
    let dataType: string = null;
    for (const arg of allArgs) {
      const varNode = asVarNode(arg);
      if (!varNode) continue;

      const varDataType = options.getVariableDataType(varNode.var);
      if (dataType && dataType !== varDataType) {
        // data types of arguments are different, we can't convert it them automatically
        dataType = null;
        break;
      } else dataType = varDataType;
    }

    switch (dataType) {
      case DataTypes.number:
      case DataTypes.referenceListItem: {
        convertedResult = convertedResult ? parseInt(convertedResult, 10) : null;
        break;
      }
      case DataTypes.boolean: {
        convertedResult = typeof convertedResult === 'string' ? convertedResult?.toLowerCase() === 'true' : Boolean(convertedResult);
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
  if (isDefined(node) && "evaluate" in node) {
    const { evaluate } = node;
    const args = evaluate && Array.isArray(evaluate) && evaluate.length === 1
      ? evaluate[0]
      : undefined;

    const typedArgs = args as IEvaluateNodeArgs;
    const result: IEvaluateNode = typeof (typedArgs?.expression) === 'string'
      ? {
        evaluate: {
          ...typedArgs,
          type: (args as IEvaluateNodeArgs).type ?? 'mustache' /* fallback to legacy */,
        },
      }
      : undefined;
    return result;
  } else
    return undefined;
};

export const convertJsonLogicNode = async (
  jsonLogic: object,
  options: IJsonLogicConversionOptions,
): Promise<object> => {
  if (!jsonLogic) return null;

  const { argumentEvaluator } = options;

  const parseNestedNodeAsync = async (
    node: object,
    allArgs: any[],
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

  let result = undefined;
  for (const operatorName in jsonLogic) {
    if (!jsonLogic.hasOwnProperty(operatorName)) continue;

    const args = jsonLogic[operatorName];

    let convertedArgs = null;

    let hasInvalidArguments = false;

    if (Array.isArray(args)) {
      convertedArgs = await Promise.all(
        args.map(async (arg, argIdx) => {
          if (typeof arg === 'object') {
            const nestedResult = await parseNestedNodeAsync(arg, args, options);
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
      if (typeof args === 'object') {
        const nestedResult = await parseNestedNodeAsync(args, [], options);
        hasInvalidArguments = hasInvalidArguments || nestedResult.hasOptionalNonEvaluatedExpressions;
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
): object => {
  if (!jsonLogic) return null;

  const { argumentEvaluator } = options;

  const parseNestedNodeSync = (
    node: object,
    allArgs: any[],
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

  let result = undefined;
  for (const operatorName in jsonLogic) {
    if (!jsonLogic.hasOwnProperty(operatorName)) continue;

    const args = jsonLogic[operatorName];

    let convertedArgs = null;

    let hasInvalidArguments = false;

    if (Array.isArray(args)) {
      convertedArgs = args.map((arg, argIdx) => {
        if (typeof arg === 'object') {
          const nestedResult = parseNestedNodeSync(arg, args, options);
          hasInvalidArguments = hasInvalidArguments || nestedResult.hasOptionalNonEvaluatedExpressions;
          return nestedResult.value;
        };

        const evaluationResult = argumentEvaluator(operatorName, args, argIdx);
        return evaluationResult.handled ? evaluationResult.value : arg;
      });
      convertedArgs = convertedArgs.filter((a) => a !== undefined);
    } else {
      // note: single arguments may be presented as objects, example: {"!!": {"var": "user.userName"}}
      if (typeof args === 'object') {
        const nestedResult = parseNestedNodeSync(args, [], options);
        hasInvalidArguments = hasInvalidArguments || nestedResult.hasOptionalNonEvaluatedExpressions;
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

export const isLegacyMustacheEvaluationNode = (node: object): node is IMustacheEvaluateNode => {
  if ("evaluate" in node) {
    const { evaluate } = node ?? {};
    const expressionType = (evaluate as IEvaluateNodeArgs)?.type;

    return evaluate && !expressionType;
  } else
    return false;
};
