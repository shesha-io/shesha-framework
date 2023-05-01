import { Func, JsonLogicFormatFunc, JsonLogicImportFunc, JsonLogicTree, JsonLogicValue, RuleValue, TypedMap } from '@react-awesome-query-builder/antd';
import { IEvaluateNode, IEvaluateNodeArgs } from 'utils/jsonLogic';

const args2JsonLogic: JsonLogicFormatFunc = (funcArgs: TypedMap<JsonLogicValue>): JsonLogicTree => {
    const node: IEvaluateNode = {
        evaluate: [
            { expression: funcArgs.expression, type: 'string' }
        ]
    };

    return node;
};

const jsonLogic2Args: JsonLogicImportFunc = (val): RuleValue[] => {
    const typedNode = val as IEvaluateNode;
    if (!typedNode?.evaluate)
        return [];

    const args: IEvaluateNodeArgs = Array.isArray(typedNode.evaluate) && typedNode.evaluate.length === 1
        ? typedNode.evaluate[0] as IEvaluateNodeArgs
        : { expression: null, type: null };

    return [args.expression];
};

export const evaluateFunc: Func = {
    returnType: 'entityReference',
    label: 'Evaluate',
    jsonLogic: args2JsonLogic,
    jsonLogicImport: jsonLogic2Args,
    args: {
        expression: {
            label: "Expression",
            type: 'text',
            valueSources: ['value'],
        }
    }
};

export const getEvaluateFunc = (type: string): Func => {
    return {
        returnType: type,
        label: 'Evaluate',
        jsonLogic: args2JsonLogic,
        jsonLogicImport: jsonLogic2Args,
        args: {
            expression: {
                label: "Expression",
                type: 'text',
                valueSources: ['value'],
            }
        }
    };
};