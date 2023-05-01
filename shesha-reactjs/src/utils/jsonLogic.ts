import { evaluateComplexStringWithResult, IEvaluateComplexStringResult, IMatchData } from "./publicUtils";

type NodeCallback = (operator: string, args: object[]) => void;
const processRecursive = (jsonLogic: object, callback: NodeCallback) => {
    if (!jsonLogic)
        return;
    for (const operator in jsonLogic) {
        if (!jsonLogic.hasOwnProperty(operator))
            continue;
        const args = jsonLogic[operator];

        callback(operator, args);

        if (Array.isArray(args)) {
            args.forEach(arg => {
                if (typeof (arg) === 'object')
                    processRecursive(arg, callback);
            });
        } else
            if (typeof (args) === 'object') // note: single arguments may be presented as objects, example: {"!!": {"var": "user.userName"}}
                processRecursive(args, callback);
    }
};

export const extractVars = (jsonLogic: object): string[] => {
    const result = [];

    if (jsonLogic)
        processRecursive(jsonLogic, (operator, args) => {
            if (operator === 'var') {
                if (result.indexOf(args) === -1)
                    result.push(args);
            }
        });

    return result;
};

export interface IArgumentEvaluationResult {
    handled: boolean;
    value?: any;
}
export type JsonLogicContainerProcessingCallback = (operator: string, args: object[], argIndex: number) => IArgumentEvaluationResult;


export interface OnEvaluatedArguments extends IEvaluateComplexStringResult {
    expression: string;
}
export interface IJsonLogicConversionOptions {
    argumentEvaluator: JsonLogicContainerProcessingCallback;
    mappings: IMatchData[];
    onEvaluated?: (args: OnEvaluatedArguments) => void;
}

export const convertJsonLogicNode = (jsonLogic: object, options: IJsonLogicConversionOptions): object => {
    if (!jsonLogic)
        return null;

    const { argumentEvaluator, mappings, onEvaluated: onEvaluation } = options;

    const parseNestedNode = (node: object, nestedOptions: IJsonLogicConversionOptions): object | string => {
        // special handling for evaluation nodes
        const evaluationNodeParsing = tryParseAsEvaluationOperation(node);
        if (evaluationNodeParsing.isEvaluationNode) {
            const { result, success, unevaluatedExpressions } = evaluateComplexStringWithResult(evaluationNodeParsing.evaluationArguments.expression, mappings);

            if (onEvaluation)
                onEvaluation({
                    expression: evaluationNodeParsing.evaluationArguments.expression,
                    result, 
                    success,
                    unevaluatedExpressions
                });

            return result;
        } else
            return convertJsonLogicNode(node, nestedOptions);
    };

    const result = {};
    for (const operatorName in jsonLogic) {
        if (!jsonLogic.hasOwnProperty(operatorName))
            continue;

        const args = jsonLogic[operatorName];

        let convertedArgs = null;

        if (Array.isArray(args)) {
            convertedArgs = args.map((arg, argIdx) => {
                if (typeof (arg) === 'object')
                    return parseNestedNode(arg, options);

                const evaluationResult = argumentEvaluator(operatorName, args, argIdx);
                return evaluationResult.handled
                    ? evaluationResult.value
                    : arg;
            });
        } else {
            // note: single arguments may be presented as objects, example: {"!!": {"var": "user.userName"}}
            if (typeof (args) === 'object') {
                convertedArgs = parseNestedNode(args, options);
            } else {
                const evaluationResult = argumentEvaluator(operatorName, [args], 0);
                convertedArgs = evaluationResult.handled
                    ? evaluationResult.value
                    : args;
            }
        }
        result[operatorName] = convertedArgs;
    }
    return result;
};

export interface IEvaluateNodeArgs {
    expression: string;
    type: string;
};

export interface IEvaluateNode {
    evaluate: IEvaluateNodeArgs[];
};

export interface IEvaluationNodeParsingResult {
    isEvaluationNode: boolean;
    evaluationArguments?: IEvaluateNodeArgs;
}
export const tryParseAsEvaluationOperation = (node: object): IEvaluationNodeParsingResult => {
    if (!node)
        return undefined;

    const typedNode = node as IEvaluateNode;
    const evaluationArguments = typedNode?.evaluate && Array.isArray(typedNode.evaluate) && typedNode.evaluate.length === 1
        ? typedNode.evaluate[0]
        : null;
    return {
        isEvaluationNode: Boolean(evaluationArguments),
        evaluationArguments
    };
};