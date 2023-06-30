import { FieldSettings, Func, JsonLogicFormatFunc, JsonLogicImportFunc, JsonLogicTree, JsonLogicValue, RuleValue, TypedMap } from '@react-awesome-query-builder/antd';
import { IEvaluateNode, IEvaluateNodeArgs } from 'utils/jsonLogic';

const args2JsonLogic: JsonLogicFormatFunc = (funcArgs: TypedMap<JsonLogicValue>): JsonLogicTree => {
    const node: IEvaluateNode = {
        evaluate: [
            { expression: funcArgs.expression, required: funcArgs.required }
        ]
    };

    return node;
};

const jsonLogic2Args: JsonLogicImportFunc = (val): RuleValue[] => {
    const typedNode = val as IEvaluateNode;
    if (!typedNode?.evaluate)
        throw `Can't parse 'evaluate' function`; // throw exception to skip current function and try to parse others

    const args: IEvaluateNodeArgs = Array.isArray(typedNode.evaluate) && typedNode.evaluate.length === 1
        ? typedNode.evaluate[0] as IEvaluateNodeArgs
        : { expression: null, required: true };

    return [args.expression, args.required ?? true];
};

type CustomFieldSettings = FieldSettings & {
    customProps: {
        checkedChildren?: string;
        unCheckedChildren?: string;
        title?: string;
    };
};

const requiredFieldSettings: CustomFieldSettings = {
    customProps: {
        checkedChildren: "Required",
        unCheckedChildren: "Optional",
        title: 'Whole filter will be marked as `unevaluated` if the expression is marked as `required` and the evaluation result is empty'
    }             
};

export const getEvaluateFunc = (type: string): Func => {
    return {
        returnType: type,
        label: 'Evaluate (mustache)',
        jsonLogic: args2JsonLogic,
        jsonLogicImport: jsonLogic2Args,
        args: {
            expression: {
                label: "Expression",
                type: 'text',
                valueSources: ['value'],
            },
            required: {
                label: 'Allow empty',
                type: 'boolean',
                valueSources: ['value'],
                fieldSettings: requiredFieldSettings
            }            
        }
    };
};