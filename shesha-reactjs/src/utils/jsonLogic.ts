import { DataTypes } from '@/interfaces/dataTypes';
import { evaluateComplexStringWithResult, IEvaluateComplexStringResult, IMatchData } from './publicUtils';

type NodeCallback = (operator: string, args: object[]) => void;
const processRecursive = (jsonLogic: object, callback: NodeCallback) => {
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

interface IJsonLogicVarNode {
  var: string;
}
const asVarNode = (node: object): IJsonLogicVarNode => {
  const typed = node as IJsonLogicVarNode;
  return typeof typed?.var === 'string' ? typed : null;
};

interface NestedNodeParsingResult {
  hasOptionalNonEvaluatedExpressions: boolean;
  value: object | string;
}

export const convertJsonLogicNode = async (
  jsonLogic: object,
  options: IJsonLogicConversionOptions
): Promise<object> => {
  if (!jsonLogic) return null;

  const { argumentEvaluator, mappings, onEvaluated: onEvaluation } = options;

  const parseNestedNode = async (
    node: object,
    allArgs: any[],
    nestedOptions: IJsonLogicConversionOptions
  ): Promise<NestedNodeParsingResult> => {
    // special handling for evaluation nodes
    const evaluationNodeParsing = tryParseAsEvaluationOperation(node);
    if (evaluationNodeParsing.isEvaluationNode) {
      const { result, success, unevaluatedExpressions } = evaluateComplexStringWithResult(
        evaluationNodeParsing.evaluationArguments.expression,
        mappings,
        evaluationNodeParsing.evaluationArguments.required
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
          }
          case DataTypes.boolean: {
            convertedResult =
              typeof convertedResult === 'string' ? convertedResult?.toLowerCase() === 'true' : convertedResult;
          }
        }
      }

      if (onEvaluation)
        onEvaluation({
          expression: evaluationNodeParsing.evaluationArguments.expression,
          result: convertedResult,
          success,
          unevaluatedExpressions,
        });

      return {
        hasOptionalNonEvaluatedExpressions: (convertedResult === '') && !evaluationNodeParsing.evaluationArguments.required,
        value: convertedResult
      };
    } else {
      const value = await convertJsonLogicNode(node, nestedOptions);
      return {
        hasOptionalNonEvaluatedExpressions: false,
        value
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
            const nestedResult = await parseNestedNode(arg, args, options);
            hasInvalidArguments = hasInvalidArguments || nestedResult.hasOptionalNonEvaluatedExpressions;
            return nestedResult.value;
          };

          const evaluationResult = argumentEvaluator(operatorName, args, argIdx);
          return evaluationResult.handled ? evaluationResult.value : arg;
        })
      );
      convertedArgs = convertedArgs.filter(a => a !== undefined);
    } else {
      // note: single arguments may be presented as objects, example: {"!!": {"var": "user.userName"}}
      if (typeof args === 'object') {
        const nestedResult = await parseNestedNode(args, [], options);
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

export const isLegacyMustacheEvaluationNode = (node: any): node is IMustacheEvaluateNode => {
  const { evaluate } = node ?? {};
  const expressionType = (evaluate as IEvaluateNodeArgs)?.type;

  return evaluate && !expressionType;
};

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

export const isEvaluationNode = (node: any): node is IEvaluateNode => {
  const { evaluate } = node ?? {};
  const expressionType = (evaluate as IEvaluateNodeArgs)?.type;
  return expressionType === 'mustache' || expressionType === 'javascript';
};

export const getEvaluationNodeFromJsonLogicNode = (node: any): IEvaluateNode => {
  const { evaluate } = node ?? {};
  const args = evaluate && Array.isArray(evaluate) && evaluate.length === 1
    ? evaluate[0]
    : undefined;

  const typedArgs = args as IEvaluateNodeArgs;
  const result: IEvaluateNode = typeof(typedArgs.expression) === 'string'
    ? {
      evaluate: {
        ...typedArgs,
        type: (args as IEvaluateNodeArgs).type ?? 'mustache' /* fallback to legacy */,
      }
    }
    : undefined;
  return result;
};

export interface IEvaluationNodeParsingResult {
  isEvaluationNode: boolean;
  evaluationArguments?: IMustacheEvaluateNodeArgs;
}
export const tryParseAsEvaluationOperation = (node: object): IEvaluationNodeParsingResult => {
  if (!node) return undefined;

  const typedNode = node as IMustacheEvaluateNode;
  const evaluationArguments =
    typedNode?.evaluate && Array.isArray(typedNode.evaluate) && typedNode.evaluate.length === 1
      ? typedNode.evaluate[0]
      : null;
  return {
    isEvaluationNode: Boolean(evaluationArguments),
    evaluationArguments,
  };
};
