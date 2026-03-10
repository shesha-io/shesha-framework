import { FieldSettings, Func, JsonLogicFormatFunc, JsonLogicImportFunc, JsonLogicTree, JsonLogicValue, RuleValue } from '@react-awesome-query-builder/antd';
import { getEvaluationNodeFromJsonLogicNode, IEvaluateJsonLogicNode } from '@/utils/jsonLogic';
import { IHasHideForSelect } from '../interfaces';

const args2JsonLogic: JsonLogicFormatFunc = (funcArgs: Record<string, JsonLogicValue>): JsonLogicTree => {
  const node: IEvaluateJsonLogicNode = {
    evaluate: [
      {
        expression: funcArgs.expression,
        required: funcArgs.required,
        type: 'mustache',
      },
    ],
  };

  return node;
};

const jsonLogic2Args: JsonLogicImportFunc = (val): RuleValue[] => {
  const node = getEvaluationNodeFromJsonLogicNode(val);
  if (!node || node.evaluate?.type !== 'mustache')
    throw `Can't parse 'evaluate' function`; // throw exception to skip current function and try to parse others

  return [node.evaluate.expression, node.evaluate.required];
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
    title: 'Whole filter will be marked as `unevaluated` if the expression is marked as `required` and the evaluation result is empty',
  },
};

export const getEvaluateFunc = (type: string): Func & IHasHideForSelect => {
  return {
    returnType: type,
    hideForSelect: true,
    label: 'Evaluate (mustache)',
    jsonLogic: args2JsonLogic,
    jsonLogicImport: jsonLogic2Args,
    args: {
      expression: {
        label: "Expression",
        type: 'text',
        defaultValue: '',
        valueSources: ['value'],
      },
      required: {
        label: 'Allow empty',
        type: 'boolean',
        valueSources: ['value'],
        defaultValue: false,
        fieldSettings: requiredFieldSettings,
      },
    },
  };
};
